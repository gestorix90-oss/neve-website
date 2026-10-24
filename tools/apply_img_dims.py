#!/usr/bin/env python3
"""Dimensioni intrinseche + lazy-loading sulle immagini — SoldiChiari.

Perche' esiste: <img> senza width/height fa "saltare" il layout mentre carica (CLS), e
Google misura il CLS in Search Console (Esperienza > Core Web Vitals). Sulla home 10
immagini su 12 non avevano dimensioni; su altre 7 pagine del sitemap ne restavano 31.
Mettere le dimensioni a mano su 60+ tag e' il modo sicuro per sbagliarne la meta': qui
le dimensioni si leggono dal file (header WebP/JPEG/PNG) e si scrivono da script.

Regola sul lazy: la PRIMA immagine raster della pagina resta eager (e' il candidato LCP:
renderla lazy peggiora il punteggio). Dalla seconda in poi: loading="lazy" decoding="async".

Uso:
    python tools/apply_img_dims.py            # applica (idempotente)
    python tools/apply_img_dims.py --check    # non scrive, esce 1 se c'e' qualcosa da fare

Perimetro: pagine elencate in sitemap.xml (+ index.html).
"""
import io
import os
import re
import struct
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'.git', '_patch-storici', 'node_modules', '.github'}
RASTER = re.compile(r'\.(webp|jpe?g|png)$', re.I)


def dims(path):
    """Dimensioni (w, h) leggendo l'header del file. None se non riconosciuto."""
    try:
        b = open(path, 'rb').read(64)
    except OSError:
        return None
    if b[:4] == b'RIFF' and b[8:12] == b'WEBP':
        fmt = b[12:16]
        if fmt == b'VP8 ':
            return (struct.unpack('<H', b[26:28])[0] & 0x3FFF,
                    struct.unpack('<H', b[28:30])[0] & 0x3FFF)
        if fmt == b'VP8L':
            x = struct.unpack('<I', b[21:25])[0]
            return (x & 0x3FFF) + 1, ((x >> 14) & 0x3FFF) + 1
        if fmt == b'VP8X':
            return int.from_bytes(b[24:27], 'little') + 1, int.from_bytes(b[27:30], 'little') + 1
    if b[:8] == b'\x89PNG\r\n\x1a\n':
        return struct.unpack('>I', b[16:20])[0], struct.unpack('>I', b[20:24])[0]
    if b[:2] == b'\xff\xd8':
        d = open(path, 'rb').read()
        i = 2
        while i < len(d) - 9:
            if d[i] != 0xFF:
                i += 1
                continue
            m = d[i + 1]
            if m in (0xC0, 0xC1, 0xC2, 0xC3):
                return struct.unpack('>H', d[i + 7:i + 9])[0], struct.unpack('>H', d[i + 5:i + 7])[0]
            if m in (0xD8, 0xD9) or 0xD0 <= m <= 0xD7:
                i += 2
                continue
            i += 2 + struct.unpack('>H', d[i + 2:i + 4])[0]
    return None


def resolve_rel(page_rel, src):
    """Risolve il src rispetto alla pagina CLAMPANDO i '..' alla radice del sito.

    Le pagine hub/tag usano per esempio '../../../assets/img/x.webp' da una pagina a
    profondita' 2: il browser normalizza e carica (verificato live: 200), ma un
    os.path.normpath esce dalla radice e non trova il file — cosi' le dimensioni non
    venivano aggiunte. Qui si replica il comportamento del browser (RFC 3986).
    """
    parts = [p for p in page_rel.split('/') if p not in ('', '.')][:-1]
    for seg in src.split('/'):
        if seg == '..':
            if parts:
                parts.pop()
        elif seg in ('', '.'):
            continue
        else:
            parts.append(seg)
    return '/'.join(parts)


def sitemap_paths():
    sm = os.path.join(REPO, 'sitemap.xml')
    if not os.path.exists(sm):
        return None
    xml = io.open(sm, encoding='utf-8', errors='ignore').read()
    out = set()
    for u in re.findall(r'<loc>\s*([^<\s]+)\s*</loc>', xml):
        p = re.sub(r'^https?://[^/]+/', '', u).strip('/')
        if p == '':
            p = 'index.html'
        elif p.endswith('/'):
            p = p + 'index.html'
        elif not p.endswith('.html'):
            p = p.rstrip('/') + '/index.html'
        out.add(p)
    out.add('index.html')
    return out


def fix_page(html, page_path):
    """Aggiunge width/height e gestisce lazy. Ritorna (html, n_dims, n_lazy)."""
    n_dims = 0
    n_lazy = 0
    seen_raster = 0
    base = os.path.dirname(page_path)

    def repl(m):
        nonlocal n_dims, n_lazy, seen_raster
        tag = m.group(0)
        src_m = re.search(r'src="([^"]+)"', tag)
        if not src_m:
            return tag
        src = src_m.group(1)
        if src.startswith(('http', 'data:')) or '.svg' in src.lower():
            return tag
        if not RASTER.search(src):
            return tag
        seen_raster += 1
        new = tag
        if 'width=' not in new or 'height=' not in new:
            local = os.path.join(REPO, resolve_rel(page_path, src))
            d = dims(local)
            if d:
                if 'width=' not in new:
                    new = new[:-1] + ' width="%d"' % d[0] + '>'
                if 'height=' not in new:
                    new = new[:-1] + ' height="%d"' % d[1] + '>'
                n_dims += 1
        if 'loading=' not in new and 'fetchpriority' not in new and seen_raster > 1:
            new = new[:-1] + ' loading="lazy" decoding="async">'
            n_lazy += 1
        return new

    out = re.sub(r'<img\s[^>]*>', repl, html)
    return out, n_dims, n_lazy


def main():
    check = '--check' in sys.argv
    allow = sitemap_paths()
    touched = []
    for root, dirs, files in os.walk(REPO):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in sorted(files):
            if not f.endswith('.html'):
                continue
            p = os.path.join(root, f)
            rel = os.path.relpath(p, REPO).replace(os.sep, '/')
            if allow is not None and rel not in allow:
                continue
            raw = io.open(p, encoding='utf-8', newline='').read()
            new, nd, nl = fix_page(raw, rel)
            if new == raw:
                continue
            touched.append((rel, nd, nl))
            if not check:
                io.open(p, 'w', encoding='utf-8', newline='').write(new)
    print('pagine da modificare: %d | dimensioni aggiunte: %d | lazy aggiunti: %d'
          % (len(touched), sum(t[1] for t in touched), sum(t[2] for t in touched)))
    for rel, nd, nl in touched:
        print('   %-64s dims=%d lazy=%d' % (rel, nd, nl))
    if check and touched:
        sys.exit(1)


if __name__ == '__main__':
    main()
