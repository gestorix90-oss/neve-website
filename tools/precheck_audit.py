#!/usr/bin/env python3
# Copia del gate usato dal profilo `sito` (skill prepublish-site-audit) per la revisione
# pre-AdSense di soldichiari.com. Solo stdlib: si esegue con
#   python tools/precheck_audit.py <repo_dir> <https://dominio> [--offline] [--links]
# Esce con codice = numero di blocchi falliti.
"""Pre-publish / pre-ad-review audit of a static site (stdlib only).

Usage: python precheck_audit.py <repo_dir> <https://domain> [--offline] [--links]

Blocks (each prints PASS or the FAIL list):
  repo   : dead UI elements, tag balance, truncated tags, ads loader sanity
  online : sitemap hygiene (status/noindex/stub), title+desc dupes/missing,
           ad units vs visible word count, mixed content, ads.txt, robots.txt,
           http->https enforcement. --links adds the external-link sweep.
Exit code = number of failed blocks. --offline runs only repo blocks.
"""
import sys, os, re, gzip, struct, concurrent.futures as cf
from html.parser import HTMLParser
import urllib.request, urllib.parse

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36"}
WORD_FLOOR = 700          # ad units never below this (visible words)
ARTICLE_FLOOR = 400       # a genuine article under this is the 'low value' rejection cause

def get(url, timeout=25, method=None):
    req = urllib.request.Request(url, headers=UA, method=method)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        data = r.read()
        if (data[:2] == b"\x1f\x8b"):
            try: data = gzip.decompress(data)
            except Exception: pass
        return r.status, dict(r.headers), data.decode("utf-8", "replace")


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    """urllib segue i redirect da solo: per misurare un 301 serve un opener che NON li segua.

    Senza questo, il probe di Enforce HTTPS legge il 200 della pagina finale e segnala un
    FAIL falso su un sito che redirige correttamente (bug riscontrato il 24/10/2026 su
    soldichiari.com: curl diceva 301, lo script diceva 'http risponde 200 senza redirect').
    """
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


_OPENER = urllib.request.build_opener(_NoRedirect)


def probe_redirect(url, timeout=25, method="HEAD"):
    """Status e header grezzi SENZA seguire i redirect (per il check Enforce HTTPS)."""
    req = urllib.request.Request(url, headers=UA, method=method)
    try:
        with _OPENER.open(req, timeout=timeout) as r:
            return r.status, dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers or {})

class Balance(HTMLParser):
    VOID = {"meta","link","br","img","input","hr","source","area","col","wbr","track"}
    def __init__(self):
        super().__init__(); self.stack = []; self.bad = []
    def handle_starttag(self, t, a):
        if t not in self.VOID: self.stack.append(t)
    def handle_endtag(self, t):
        if t in self.VOID: return
        if self.stack and self.stack[-1] == t: self.stack.pop()
        elif t in self.stack:
            while self.stack and self.stack[-1] != t: self.bad.append(self.stack.pop())
            self.stack.pop()
        else: self.bad.append("/" + t + " senza apertura")

def visible_words(html):
    h = re.sub(r"<(script|style|head|nav|footer|form|select|table)\b.*?</\1>", " ", html, flags=re.S | re.I)
    h = re.sub(r"<!--.*?-->", " ", h, flags=re.S)
    return len(re.sub(r"<[^>]+>", " ", h).split())

TAG_FRAGMENT_RE = re.compile(r'^[A-Za-z][A-Za-z0-9]{0,12}\s+[a-zA-Z-]+="')

def truncated_tags(html):
    """Righe che aprono un tag senza chiuderlo (es. '</nav' senza '>', 'tion class="x">'
    con il '<sec' iniziale perso). Invisibili al controllo di bilanciamento — un tag
    troncato non sbilancia nessuna coppia — e sulla pagina live si vedono come testo.
    """
    out = []
    lines = html.split("\n")
    in_script = False
    for i, l in enumerate(lines):
        low = l.lower()
        opens, closes = low.count("<script"), low.count("</script>")
        if in_script:
            if closes: in_script = False
            continue
        if opens:
            if opens > closes: in_script = True
            continue
        s = l.strip()
        if not s or "<style" in low:
            continue
        nxt = ""
        for j in range(i + 1, min(i + 4, len(lines))):
            if lines[j].strip():
                nxt = lines[j].strip(); break
        if s.startswith("<") and ">" not in s and not s.startswith("<!"):
            if re.match(r"^[a-zA-Z-]+\s*=", nxt) or nxt.startswith(">"):
                continue  # tag legittimamente multi-riga: la continuazione e' un attributo
            out.append(f"riga {i+1}: apertura non chiusa {s[:60]!r}")
        elif TAG_FRAGMENT_RE.match(s):
            out.append(f"riga {i+1}: tag troncato {s[:60]!r}")
        elif s in (">", "<"):
            out.append(f"riga {i+1}: resto di tag orfano {s!r}")
    return out

def _img_dims(path):
    """Dimensioni reali (w, h) lette dall'header del file. None se non riconosciuto."""
    try:
        b = open(path, "rb").read(64)
    except OSError:
        return None
    if b[:8] == b"\x89PNG\r\n\x1a\n":
        return struct.unpack(">I", b[16:20])[0], struct.unpack(">I", b[20:24])[0]
    if b[:4] == b"RIFF" and b[8:12] == b"WEBP":
        f = b[12:16]
        if f == b"VP8 ":
            return struct.unpack("<H", b[26:28])[0] & 0x3FFF, struct.unpack("<H", b[28:30])[0] & 0x3FFF
        if f == b"VP8L":
            x = struct.unpack("<I", b[21:25])[0]
            return (x & 0x3FFF) + 1, ((x >> 14) & 0x3FFF) + 1
        if f == b"VP8X":
            return int.from_bytes(b[24:27], "little") + 1, int.from_bytes(b[27:30], "little") + 1
    if b[:2] == b"\xff\xd8":
        d = open(path, "rb").read()
        i = 2
        while i < len(d) - 9:
            if d[i] != 0xFF:
                i += 1
                continue
            m = d[i + 1]
            if m in (0xC0, 0xC1, 0xC2, 0xC3):
                return struct.unpack(">H", d[i + 7:i + 9])[0], struct.unpack(">H", d[i + 5:i + 7])[0]
            if m in (0xD8, 0xD9) or 0xD0 <= m <= 0xD7:
                i += 2
                continue
            i += 2 + struct.unpack(">H", d[i + 2:i + 4])[0]
    return None


def img_dim_issues(htmls, repo):
    """width/height dichiarati su <img> devono combaciare con il file.

    Un rapporto sbagliato riserva una scatola della forma sbagliata: l'immagine carica e
    il contenuto salta (CLS, che Google misura in Search Console). Trovato il 24/10/2026 su
    soldichiari.com: 1200x630 dichiarati per un file 1024x460 su due pagine, piu' una cover
    1489x2105 dichiarata 340x481.
    """
    out = []
    for p, t in htmls:
        rel = os.path.relpath(p, repo).replace(os.sep, "/")
        for m in re.finditer(r"<img\s[^>]*>", t):
            tag = m.group(0)
            sm = re.search(r'src="([^"]+)"', tag)
            if not sm:
                continue
            src = sm.group(1)
            if src.startswith(("http", "data:")) or ".svg" in src.lower():
                continue
            parts = [x for x in rel.split("/") if x not in ("", ".")][:-1]
            for seg in src.split("/"):
                if seg == "..":
                    if parts:
                        parts.pop()
                elif seg not in ("", "."):
                    parts.append(seg)
            d = _img_dims(os.path.join(repo, *parts))
            if not d:
                continue
            wm = re.search(r'width="(\d+)"', tag)
            hm = re.search(r'height="(\d+)"', tag)
            if not wm or not hm:
                out.append(f"{rel}: {src} senza width/height")
            elif (int(wm.group(1)), int(hm.group(1))) != d:
                out.append(f"{rel}: {src} dichiarate {wm.group(1)}x{hm.group(1)} vs reali {d[0]}x{d[1]}")
    return out


def _norm_text(t):
    """Testo confrontabile: entita' sciolte, virgolette tipografiche normalizzate, minuscole."""
    import html as _h
    t = _h.unescape(t)
    for a, b in (("\u2019", "'"), ("\u2018", "'"), ("\u201c", '"'), ("\u201d", '"'),
                 ("\u2013", "-"), ("\u2014", "-"), ("\u00a0", " ")):
        t = t.replace(a, b)
    t = re.sub(r"<[^>]+>", " ", t)
    t = re.sub(r"[^\w\s'?-]", " ", t)
    return re.sub(r"\s+", " ", t).strip().lower()


def faq_visibility_issues(htmls, repo):
    """Ogni domanda dichiarata in FAQPage deve esistere nel testo VISIBILE della pagina.

    Policy Google sui dati strutturati: non si marca contenuto che il lettore non vede
    ("Don't mark up content that is not visible to readers of the page"). Trovato il 24/10/2026
    su soldichiari.com: 7 pagine con FAQPage ma domande non presenti a schermo, di cui una con
    JSON corrotto (struttura con escape doppi) -> errore nei risultati avanzati di Search Console.
    """
    import json as _json
    out = []
    for p, t in htmls:
        rel = os.path.relpath(p, repo).replace(os.sep, "/")
        body = t[t.find("<body"):]
        vis = _norm_text(body)
        for i, blk in enumerate(re.findall(r'<script type="application/ld\+json">(.*?)</script>', t, re.S), 1):
            if '"FAQPage"' not in blk:
                continue
            try:
                d = _json.loads(blk)
            except Exception as e:
                out.append(f"{rel}: blocco {i} FAQPage JSON NON VALIDO ({str(e)[:40]})")
                continue
            ents = d.get("mainEntity", [])
            if isinstance(ents, dict):
                ents = [ents]
            miss = [q.get("name", "")[:60] for q in ents
                    if _norm_text(q.get("name", ""))[:30] and _norm_text(q.get("name", ""))[:30] not in vis]
            if miss:
                out.append(f"{rel}: {len(miss)}/{len(ents)} domande FAQPage non visibili (es. {miss[0]!r})")
    return out


def walk_html(repo):
    out = []
    for root, dirs, files in os.walk(repo):
        dirs[:] = [d for d in dirs if d not in ("node_modules", ".git", "vendor", ".astro")]
        for f in files:
            if f.endswith(".html"):
                p = os.path.join(root, f)
                out.append((p, open(p, encoding="utf-8", errors="replace").read()))
    return out

def main():
    repo, site = sys.argv[1], sys.argv[2].rstrip("/")
    offline = "--offline" in sys.argv
    sweep_links = "--links" in sys.argv
    failed = 0
    def block(name, problems):
        nonlocal failed
        if problems:
            failed += 1; print(f"FAIL {name}:")
            for p in problems: print("   ", p)
        else: print(f"PASS {name}")

    htmls = walk_html(repo)

    # 1. dead UI: alert-only buttons are placeholder UI a reviewer reads as 'site unfinished'.
    #    href="#" hits are reported with context, not auto-flagged (disabled badges are legit).
    dead = [os.path.relpath(p, repo) for p, t in htmls if re.search(r'onclick="alert\(', t)]
    anchors = []
    for p, t in htmls:
        for m in re.finditer(r'href="#"', t):
            seg = re.sub(r"\s+", " ", t[max(0, m.start()-80):m.end()+120])
            if "pointer-events:none" not in seg:  # intentional disabled badge
                anchors.append(os.path.relpath(p, repo) + " :: " + seg[:140])
    block("dead UI (onclick=alert / href=#)", dead + ["INFO " + a for a in anchors if dead is not None and False] )
    if anchors: print("   INFO href=# senza disabilitazione esplicita:", *anchors, sep="\n    ")

    # 2. tag balance on every repo file
    badtag = []
    for p, t in htmls:
        b = Balance(); b.feed(t)
        leftovers = b.stack + b.bad
        if leftovers: badtag.append(os.path.relpath(p, repo) + ": " + ",".join(leftovers[:6]))
    block("tag balance", badtag)

    # 2b. truncated tags: a broken opening tag renders as VISIBLE TEXT on the live page
    #     and passes the pair-balance check untouched, so it needs its own block.
    truncs = []
    for p, t in htmls:
        for prob in truncated_tags(t):
            truncs.append(os.path.relpath(p, repo) + ": " + prob)
    block("tag troncati (aperture non chiuse/resti di tag)", truncs)

    # 2c. dimensioni immagini dichiarate vs reali (CLS: la scatola deve avere la forma giusta)
    block("immagini: dimensioni dichiarate == reali", img_dim_issues(htmls, repo))

    # 2d. dati strutturati: le FAQ dichiarate devono esistere nel testo visibile
    block("FAQPage: domande marcate == testo visibile", faq_visibility_issues(htmls, repo))

    if offline:
        sys.exit(1 if failed else 0)

    # 3. sitemap
    try:
        st, _, smap = get(site + "/sitemap.xml")
        urls = re.findall(r"<loc>(.*?)</loc>", smap)
    except Exception as e:
        block("sitemap", [f"no sitemap: {e}"]); sys.exit(1)
    if not urls: block("sitemap", ["vuota"]); sys.exit(1)
    print(f"sitemap: {len(urls)} URL")

    def fetch(u):
        try:
            s, h, b = get(u); return u, s, h, b, ""
        except Exception as e:
            return u, 0, {}, "", str(e)[:60]
    pages = {}
    with cf.ThreadPoolExecutor(10) as ex:
        for u, s, h, b, err in ex.map(fetch, urls):
            pages[u] = (s, h, b, err)

    block("all sitemap URLs 200", [f"{u} -> {s} {e}" for u, (s, h, b, e) in pages.items() if s != 200])

    stubs, noindex, titles, descs, missing = [], [], {}, {}, []
    thin_ads, sdk_pages, mixed = [], [], []
    for u, (s, h, b, e) in pages.items():
        if not b: continue
        low = b.lower()
        if "http-equiv=\"refresh\"" in low or "http-equiv='refresh'" in low: stubs.append(u)
        rb = re.search(r'<meta\s+name="robots"\s+content="([^"]*)"', b, re.I)
        if rb and "noindex" in rb.group(1): noindex.append(u)
        t = re.search(r"<title[^>]*>(.*?)</title>", b, re.S | re.I)
        d = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', b, re.I)
        titles[u] = t.group(1).strip() if t else None
        descs[u] = d.group(1) if d else None
        h1 = re.search(r"<h1[^>]*>", b, re.I)
        lang = re.search(r"<html[^>]*\slang=", b, re.I)
        canon = 'rel="canonical"' in low
        if not (t and d and h1 and lang and canon):
            missing.append(f"{u} title={bool(t)} desc={bool(d)} h1={bool(h1)} lang={bool(lang)} canonical={canon}")
        ins = len(re.findall(r'<ins[^>]*adsbygoogle', b, re.I))
        wc = visible_words(b)
        if ins and wc < WORD_FLOOR: thin_ads.append(f"{u}: {ins} unita su {wc} parole")
        if "pagead/js/adsbygoogle.js" in b: sdk_pages.append(u)
        for m in re.finditer(r'(?:src|href)="(http://[^"]+)"', b):
            if "schemas" not in m.group(1): mixed.append(f"{u} -> {m.group(1)[:70]}")
    block("redirect stubs in sitemap", stubs)
    block("noindex pages in sitemap", noindex)
    dupT = [v for v in set(titles.values()) if v and list(titles.values()).count(v) > 1]
    dupD = [v[:60] for v in set(descs.values()) if v and list(descs.values()).count(v) > 1]
    block("titoli/desc duplicati", [f"title: {x}" for x in dupT] + [f"desc: {x}" for x in dupD])
    block("title/desc/H1/lang/canonical su ogni URL", missing)
    block(f"unita ads solo su pagine >= {WORD_FLOOR} parole", thin_ads)
    block("mixed content http://", mixed)
    pages_no_sdk = [u for u in pages if re.search(r'<ins[^>]*adsbygoogle', pages[u][2] or "", re.I) and u not in sdk_pages]
    block("ogni <ins> ha il loader SDK (via consenso o diretta)", pages_no_sdk)

    # 4. ads.txt / robots.txt
    try:
        _, _, ads = get(site + "/ads.txt")
        pub = next((m.group(1) for u, (s, h, b, e) in pages.items() for m in [re.search(r"client=ca-(pub-\d+)", b or "")] if m), None)
        probs = [] if re.search(r"^\s*google\.com\s*,", ads, re.M) else ["riga google.com mancante"]
        # ads.txt contiene l'ID publisher SENZA il prefisso 'ca-' (pub-…), mentre la pagina usa client=ca-pub-…:
        # confrontare 'ca-pub-…' con ads.txt produce un FAIL falso su un ads.txt corretto.
        if pub and pub not in ads: probs.append(f"ca-{pub} non presente in ads.txt")
        block("ads.txt", probs)
    except Exception as e: block("ads.txt", [str(e)[:60]])
    try:
        _, _, robots = get(site + "/robots.txt")
        probs = [x for x in ("Mediapartners-Google", "AdsBot-Google") if x not in robots]
        if "sitemap" not in robots.lower(): probs.append("riga Sitemap mancante")
        block("robots.txt (ad crawler allow + sitemap)", probs)
    except Exception as e: block("robots.txt", [str(e)[:60]])

    # 5. http->https enforcement (GitHub Pages: user click, Settings -> Pages -> Enforce HTTPS).
    #    NB: `get()` segue i redirect, quindi restituisce il 200 finale e non vede mai il 301.
    #    Qui si usa probe_redirect(), che non segue: e' l'unico modo di misurare la cosa vera.
    try:
        hst, hh = probe_redirect(site.replace("https://", "http://"))
        loc = hh.get("Location", "") or hh.get("location", "")
        ok = hst in (301, 302, 307, 308) and "https" in loc.lower()
        block("http -> redirect a https (Enforce HTTPS)",
              [] if ok else [f"http risponde {hst} senza redirect a https (Location={loc!r}): e' un click in repo Settings -> Pages -> Enforce HTTPS"])
    except Exception as e: block("http probe", [str(e)[:60]])

    # 6. optional external-source sweep: browser UA; 403/405/429/503 = bot-wall, not a dead link
    #    (amazon.it risponde 405 a un client datacenter e serve la pagina a un browser vero)
    if sweep_links:
        ext = set()
        for u, (s, h, b, e) in pages.items():
            ext.update(re.findall(r'href="(https?://[^"/]+/[^"]*)"', b or ""))
        ext = {x for x in ext if not x.startswith(site)}
        deadl, walled = [], []
        def probe(x):
            try:
                st, _, _ = get(x, timeout=20, method="HEAD")
            except urllib.error.HTTPError as er: return x, er.code
            except Exception as er: return x, getattr(er, "code", 0) or -1
            return x, st
        with cf.ThreadPoolExecutor(8) as ex:
            for x, code in ex.map(probe, list(ext)[:80]):
                (walled if code in (403, 405, 429, 503) else deadl if code >= 400 else []).append(f"{code} {x[:80]}")
        print(f"link esterni: {min(len(ext),80)} provati | bot-wall da riverificare in browser reale: {walled}")
        block("link esterni morti", deadl)

    print("\nBLOCCHI FALLITI:", failed)
    sys.exit(1 if failed else 0)

import urllib.error
if __name__ == "__main__":
    main()
