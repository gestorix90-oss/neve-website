#!/usr/bin/env python3
"""Conformità AdSense — rimuove gli annunci dalle schermate senza contenuto editoriale.

Violazione contestata da Google: "Annunci pubblicati da Google su schermate senza
contenuti del publisher" + "contenuti di scarso valore". Politica applicata:

  * Gli annunci restano SOLO sulle pagine editoriali con contenuto sostanziale
    (articoli lunghi + home + hub con commento redazionale).
  * Niente annunci su: strumenti/calcolatori, pagine legali (privacy, termini),
    contatti, pagine di navigazione/elenchi, pagine sottili (<800 parole).

Uso:  python _scripts/adsense_compliance.py [--check]
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Pagine che POSSONO mostrare annunci: contenuto editoriale sostanziale (>=800 parole).
ADSENSE_ALLOWED = {
    "index.html",
    "bandi.html",
    "blog/perche-perdi-soldi.html",
    "blog/24-milioni-italiani-non-pagano-irpef-2026-09.html",
    "blog/inflazione-definitiva-agosto-2026-2026-09.html",
    "blog/investire-senza-paura.html",
}

LOADER_RE = re.compile(
    r"<script\b[^>]*>(?:(?!</script>).)*?googlesyndication(?:(?!</script>).)*?</script>\s*",
    re.DOTALL | re.IGNORECASE,
)
INS_RE = re.compile(r"<ins\b[^>]*adsbygoogle[^>]*>\s*</ins>\s*", re.DOTALL | re.IGNORECASE)
# La chiamata push può essere uno <script> a sé oppure una riga dentro uno script più grande.
PUSH_RE = re.compile(
    r"(?:<script\b[^>]*>\s*\(adsbygoogle[^)]*\)\.push\(\{\}\);\s*</script>\s*)"
    r"|(?:\(adsbygoogle\s*=\s*window\.adsbygoogle\s*\|\|\s*\[\]\)\.push\(\{\}\);\s*)",
    re.DOTALL | re.IGNORECASE,
)


def strip_adsense(html: str) -> tuple[str, dict[str, int]]:
    counts = {"loader": 0, "ins": 0, "push": 0}
    for key, rx in (("loader", LOADER_RE), ("ins", INS_RE), ("push", PUSH_RE)):
        html, n = rx.subn("", html)
        counts[key] = n
    # residui: nessun riferimento alla rete pubblicitaria deve restare
    counts["residui"] = len(re.findall(r"googlesyndication|adsbygoogle", html, re.IGNORECASE))
    return html, counts


def main() -> int:
    check_only = "--check" in sys.argv
    changed = kept = 0
    problems: list[str] = []
    for path in sorted(ROOT.rglob("*.html")):
        if ".git" in path.parts:
            continue
        rel = path.relative_to(ROOT).as_posix()
        html = path.read_text(encoding="utf-8", errors="replace")
        if rel in ADSENSE_ALLOWED:
            if "googlesyndication" not in html:
                problems.append(f"{rel}: in allowlist ma SENZA snippet AdSense")
            kept += 1
            continue
        new, counts = strip_adsense(html)
        if counts["residui"]:
            problems.append(f"{rel}: residui dopo la pulizia ({counts['residui']})")
            continue
        if new != html:
            changed += 1
            print(f"  pulito {rel:55s} loader={counts['loader']} banner={counts['ins']} push={counts['push']}")
            if not check_only:
                path.write_text(new, encoding="utf-8")
    print(f"\n{changed} pagine ripulite | {kept} pagine con annunci (editoriali)")
    if problems:
        print("\nPROBLEMI:")
        for p in problems:
            print("  -", p)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
