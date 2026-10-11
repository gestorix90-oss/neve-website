#!/usr/bin/env python3
"""Blocca articoli-duplicata: due post del blog con >50% di shingle (8 parole)
condivisi nel corpo sono ritenuti duplicati e falliscono il controllo.
Uso: python _scripts/dedup_check.py [soglia%]"""
from __future__ import annotations
import itertools, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "blog"

def body_words(p: Path) -> list[str]:
    h = p.read_text(encoding="utf-8", errors="replace")
    m = re.search(r"<article[\s\S]*?</article>|<main[\s\S]*?</main>", h)
    seg = m.group(0) if m else h
    seg = re.sub(r"<script[\s\S]*?</script>|<style[\s\S]*?</style>|<nav[\s\S]*?</nav>", "", seg)
    return re.sub(r"<[^>]+>", " ", seg).split()

def shingles(w, k=8):
    return set(tuple(w[i:i+k]) for i in range(0, max(len(w)-k+1, 0)))

def main() -> int:
    thr = float(sys.argv[1]) if len(sys.argv) > 1 else 50.0
    files = []
    for f in sorted(ROOT.glob("*.html")):
        if f.name in ("index.html", "blog.html"):
            continue
        head = f.read_text(encoding="utf-8", errors="replace")[:4000]
        if 'content="noindex' in head:      # stub di redirect: simile per design, non contenuto
            continue
        if len(body_words(f)) < 300:          # pagina troppo corta: sottile, non duplicata
            continue
        files.append(f)
    S = {f.name: shingles(body_words(f)) for f in files}
    dups = []
    for a, b in itertools.combinations(files, 2):
        u = len(S[a.name] | S[b.name]) or 1
        j = 100 * len(S[a.name] & S[b.name]) / u
        if j > thr:
            dups.append((j, a.name, b.name))
    for j, a, b in dups:
        print(f"DUPLICATO {j:.0f}%: {a} == {b}")
    if dups:
        print("Unifica i testi (o rendili davvero distinti) prima del push.")
        return 1
    print(f"dedup OK: {len(files)} articoli, nessun accoppiamento > {thr:.0f}%")
    return 0

if __name__ == "__main__":
    sys.exit(main())
