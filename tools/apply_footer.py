#!/usr/bin/env python3
"""Partial unico del footer — SoldiChiari.

Perche' esiste: il footer era stato copiato a mano in tre varianti diverse (con
footer-social a 4 icone, con colonna "Social" a testo, con solo 2 icone, o assente).
Su un sito in revisione AdSense la coerenza fra pagine e' il segnale di "manutenzione
strutturale costante": qui il footer nasce da UNA sola sorgente.

Uso:
    python tools/apply_footer.py            # applica (idempotente)
    python tools/apply_footer.py --check    # non scrive, esce 1 se qualcosa e' fuori standard

Cosa fa, per ogni *.html del repo (esclusi .git e _patch-storici):
  - se la pagina ha gia' TUTTI e 4 i link social nell'ordine canonico -> non tocca nulla;
  - se la pagina ha un <footer> ma senza i 4 link -> inserisce la riga social canonica
    subito prima di </footer>;
  - se la pagina non ha footer -> inietta il footer canonico prima di </body>.

I link sono ASSOLUTI (https://soldichiari.com/...) cosi' il footer e' identico a
qualsiasi profondita' di cartella e due file diversi restano confrontabili byte per byte.
"""
import io
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'.git', '_patch-storici', 'node_modules', '.github'}

ICONS = [
    ('https://x.com/nevenoir', 'X', '\U0001F426', '@nevenoir'),
    ('https://youtube.com/@neve_noir', 'YouTube', '\U0001F4FA', '@neve.noir'),
    ('https://www.tiktok.com/@neve.noir', 'TikTok', '\U0001F3B5', '@neve.noir'),
    ('https://www.instagram.com/soldichiari.official', 'Instagram', '\U0001F4F8', '@soldichiari.official'),
]
URLS = [u for u, _, _, _ in ICONS]


def sitemap_paths():
    """Percorsi locali delle URL in sitemap.xml (+ index.html). None se la sitemap manca."""
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


def social_row(nl, indent):
    out = [indent + '<div class="footer-social" style="margin-top: var(--space-md);">']
    for url, title, emoji, _ in ICONS:
        out.append(
            '%s    <a href="%s" target="_blank" class="social-icon" title="%s" '
            'rel="noopener noreferrer">%s</a>' % (indent, url, title, emoji)
        )
    out.append(indent + '</div>')
    return nl.join(out)


def social_row_inline():
    """Riga social senza classi del sito: per le pagine con foglio di stile proprio."""
    a = ' · '.join('<a href="%s" target="_blank" rel="noopener noreferrer">%s %s — %s</a>'
                   % (url, emoji, title, handle) for url, title, emoji, handle in ICONS)
    return '<p style="text-align:center;margin:10px 0;">Seguici: ' + a + '</p>'


def canonical_footer(nl):
    li = lambda href, label: '                        <li><a href="%s">%s</a></li>' % (href, label)
    rows = nl.join([
        li('https://soldichiari.com/index.html', '\U0001F3E0 Home'),
        li('https://soldichiari.com/chi-sono.html', '\U0001F464 Chi Sono'),
        li('https://soldichiari.com/blog.html', '\U0001F4DD Blog'),
        li('https://soldichiari.com/strumenti.html', '\U0001F6E0\ufe0f Strumenti'),
        li('https://soldichiari.com/faq.html', '\u2753 FAQ'),
    ])
    art = nl.join([
        li('https://soldichiari.com/blog/cuneo-fiscale-2026.html', 'Cuneo fiscale 2026'),
        li('https://soldichiari.com/blog/come-leggere-busta-paga.html', 'Come leggere la busta paga'),
        li('https://soldichiari.com/blog/ral-30000-netto-mese.html', 'RAL 30.000 \u20ac netto'),
        li('https://soldichiari.com/blog/fondo-pensione-2026.html', 'Fondo pensione'),
        li('https://soldichiari.com/blog/metodo-50-30-20.html', 'Metodo 50/30/20'),
    ])
    leg = nl.join([
        li('https://soldichiari.com/privacy.html', '\U0001F512 Privacy'),
        li('https://soldichiari.com/privacy.html#cookies', '\U0001F36A Cookie'),
        li('https://soldichiari.com/termini.html', '\U0001F4C4 Termini'),
        li('https://soldichiari.com/contatti.html', '\U0001F4E9 Contatti'),
    ])
    return nl.join([
        '<footer class="footer">',
        '    <div class="container">',
        '        <div class="footer-grid">',
        '            <div class="footer-col">',
        '                <div class="footer-logo">',
        '                    <img src="https://soldichiari.com/assets/img/ai/logo-soldichiari.svg" '
        'alt="SoldiChiari" class="footer-logo-img">',
        '                    <span class="logo-text">Soldi<span class="logo-accent">Chiari</span></span>',
        '                </div>',
        '                <p>L\u2019officina dove ripari la tua relazione con il denaro.<br>'
        'Meccanica + Psicologia = Ricchezza.</p>',
        social_row(nl, '                '),
        '            </div>',
        '            <div class="footer-col">',
        '                <h4>Navigazione</h4>',
        '                <ul>',
        rows,
        '                </ul>',
        '            </div>',
        '            <div class="footer-col">',
        '                <h4>Articoli</h4>',
        '                <ul>',
        art,
        '                </ul>',
        '            </div>',
        '            <div class="footer-col">',
        '                <h4>Legale</h4>',
        '                <ul>',
        leg,
        '                </ul>',
        '            </div>',
        '        </div>',
        '        <div class="footer-bottom">',
        '            <p>\u00a9 2026 SoldiChiari \u2014 Tutti i diritti riservati.</p>',
        '        </div>',
        '    </div>',
        '</footer>',
    ])


def social_region(html):
    """Dove cercare i social: il footer, oppure il div.footer delle pagine con stili propri."""
    start = html.rfind('<footer')
    end = html.rfind('</footer>')
    if start != -1 and end > start:
        return html[start:end]
    i = html.rfind('<div class="footer">')
    return html[i:] if i != -1 else ''


def has_canonical_row(sec):
    """Vero se dentro la regione esiste una catena X -> YouTube -> TikTok -> Instagram."""
    i = -1
    for u in URLS:
        j = sec.find(u, i + 1)
        if j < 0:
            return False
        i = j
    return True


def has_all_social(html):
    """Vero se nella REGIONE DEL FOOTER esiste la catena canonica dei 4 link.

    Non si guarda il resto della pagina: gli stessi URL compaiono anche nel JSON-LD
    `sameAs` (in <head>, quindi prima) e un test globale darebbe un falso negativo su
    pagine che sono gia' a posto. Si cerca una catena in ordine, non la prima occorrenza
    assoluta: un vecchio elenco "Seguici" con YouTube+TikTok prima della riga canonica
    non deve far credere che l'ordine sia sbagliato (era il difetto che rendeva lo
    script non idempotente e aggiungeva una riga a ogni esecuzione).
    """
    sec = social_region(html)
    return bool(sec) and has_canonical_row(sec)


LIST_RE = re.compile(r'(<h4>\s*(?:Seguici|Social)\s*</h4>\s*)(<ul[^>]*>)(.*?)(</ul>)', re.S)


def normalize_social_lists(html, nl):
    """Riscrive gli elenchi <h4>Seguici|Social</h4><ul> con i 4 link canonici."""
    fixed = [0]

    def sub(m):
        head, ulopen, body, ulclose = m.groups()
        pos = [body.find(u) for u in URLS]
        if all(p >= 0 for p in pos) and pos == sorted(pos):
            return m.group(0)
        indent = re.match(r'[ \t]*', head).group(0)
        items = nl + nl.join(
            indent + '    <li><a href="%s" target="_blank" rel="noopener noreferrer">%s %s — %s</a></li>'
            % (u, e, t, h) for u, t, e, h in ICONS) + nl + indent
        fixed[0] += 1
        return head + ulopen + items + ulclose

    out = LIST_RE.sub(sub, html)
    return out, fixed[0]


def normalize_social_blocks(html, nl):
    """Riscrive con la riga canonica i <div class="footer-social"> fuori standard."""
    fixed = [0]

    def sub(m):
        block = m.group(0)
        pos = [block.find(u) for u in URLS]
        if all(p >= 0 for p in pos) and pos == sorted(pos):
            return block
        indent = re.match(r'[ \t]*', block).group(0)
        fixed[0] += 1
        return social_row(nl, indent)

    out = re.sub(r'<div class="footer-social"[^>]*>.*?</div>', sub, html, flags=re.S)
    return out, fixed[0]


def drop_stale_social_lines(html):
    """Toglie le righe con piu' link social FUORI dagli <script>.

    Le righe dentro <script> non si toccano MAI: il JSON-LD `sameAs` elenca gli stessi URL
    e cancellarlo significherebbe distruggere structured data validi (autore, organizzazione).
    Attenzione al caso che aveva rotto la prima versione: i blocchi JSON-LD stanno su UNA
    riga sola, quindi '<script' e '</script>' compaiono insieme — la riga va comunque tenuta.
    """
    keep, removed, in_script = [], 0, False
    for l in html.split('\n'):
        low = l.lower()
        opens, closes = low.count('<script'), low.count('</script>')
        if in_script:
            if closes:
                in_script = False
            keep.append(l)
            continue
        if opens:
            if opens > closes:
                in_script = True
            keep.append(l)
            continue
        if sum(1 for u in URLS if u in l) >= 2:
            removed += 1
            continue
        keep.append(l)
    return '\n'.join(keep), removed


def patch(html, nl):
    if has_all_social(html):
        return html, 'ok'
    notes = []
    html, n1 = normalize_social_blocks(html, nl)
    if n1:
        notes.append('blocchi social rifatti: %d' % n1)
    html, n3 = normalize_social_lists(html, nl)
    if n3:
        notes.append('elenchi Seguici/Social rifatti: %d' % n3)
    html, n2 = drop_stale_social_lines(html)
    if n2:
        notes.append('righe vecchie rimosse: %d' % n2)
    if has_all_social(html):
        return html, 'normalizzato (' + ', '.join(notes) + ')'
    note = (' (' + ', '.join(notes) + ')') if notes else ''
    css = 'assets/css/styles.css' in html
    if css:
        end = html.rfind('</footer>')
        if end != -1 and '<footer' in html:
            block = ('        <div class="container">' + nl
                     + social_row(nl, '            ') + nl
                     + '        </div>')
            return html[:end] + block + nl + html[end:], 'riga social inserita' + note
        m = re.search(r'</body>', html)
        if not m:
            return html, 'SENZA </body: NON TOCCATO'
        return html[:m.start()] + canonical_footer(nl) + nl + html[m.start():], 'footer canonico iniettato' + note
    row = social_row_inline()
    end = html.rfind('</footer>')
    if end != -1 and '<footer' in html:
        return html[:end] + '    ' + row + nl + html[end:], 'riga social inline (footer proprio)' + note
    m = re.search(r'<div class="footer">[ \t]*\r?\n', html)
    if m:
        return html[:m.end()] + '            ' + row + nl + html[m.end():], 'riga social inline (div.footer)' + note
    m = re.search(r'</body>', html)
    if not m:
        return html, 'SENZA </body: NON TOCCATO'
    return html[:m.start()] + row + nl + html[m.start():], 'riga social inline (fine pagina)' + note


def main():
    check = '--check' in sys.argv
    allow = sitemap_paths()
    touched, skipped = [], []
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
            nl = '\r\n' if '\r\n' in raw else '\n'
            new, what = patch(raw, nl)
            if new == raw:
                if what != 'ok':
                    skipped.append((rel, what))
                continue
            touched.append((rel, what))
            if not check:
                io.open(p, 'w', encoding='utf-8', newline='').write(new)
    print('perimetro sitemap: %d pagine | da modificare: %d' % (len(allow or []), len(touched)))
    for rel, what in touched:
        print('   %-62s %s' % (rel, what))
    if skipped:
        print('NON modificabili automaticamente: %d' % len(skipped))
        for rel, what in skipped:
            print('   %-62s %s' % (rel, what))
    if check and touched:
        sys.exit(1)


if __name__ == '__main__':
    main()
