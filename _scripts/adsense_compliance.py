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

# Pagine che POSSONO mostrare annunci: contenuto editoriale sostanziale (>=900 parole).
ADSENSE_ALLOWED = {
    "bandi.html",
    "blog/14-mensilita-conviene.html",
    "blog/24-milioni-italiani-non-pagano-irpef-2026-09.html",
    "blog/accise-gasolio-aumento-6-ottobre-2026-ansa-6-ottobre-2026.html",
    "blog/accise-gasolio-sconto-scadenza-5-ottobre-2026-ansa-5-ottobre-2026.html",
    "blog/aumento-stipendio-quanto-netto.html",
    "blog/come-leggere-busta-paga.html",
    "blog/cuneo-fiscale-2026.html",
    "blog/ecofin-lussemburgo-via-libera-clausola-salvaguardia-energia-difesa-9-ottobre-2026.html",
    "blog/economia-invisibile-197-miliardi-2026-09.html",
    "blog/eni-tetto-prezzo-carburanti-2026-09.html",
    "blog/fondo-emergenze-quanto.html",
    "blog/inflazione-definitiva-agosto-2026-2026-09.html",
    "blog/investire-senza-paura.html",
    "blog/irpef-inflazione-fiscal-drag-2026-09-29.html",
    "blog/istat-inflazione-acquisita-2026-sale-al-3-1-percento-2026-09-30.html",
    "blog/istat-pil-ii-trimestre-2026-crescita-pressione-fiscale-9-ottobre-2026.html",
    "blog/istat-stime-2026-2027-pil-inflazione-occupazione-10-ottobre-2026.html",
    "blog/manovra-zero-deficit-irpef-bollo-maggioranza-divisa-5-ottobre-2026.html",
    "blog/metodo-50-30-20.html",
    "blog/perche-perdi-soldi.html",
    "blog/psicologia-denaro-pensiero-diverso.html",
    "blog/ral-25000-netto-mese.html",
    "blog/ral-30000-netto-mese.html",
    "blog/ral-40000-netto-mese.html",
    "blog/scadenze-fiscali-30-settembre-2026-2026-09.html",
    "blog/stipendi-2026-riforma-irpef.html",
    "blog/tfr-meglio-azienda-fondo.html",
    "blog/uscire-dal-debito.html",
    "guida-bandi.html",
    "index.html",
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
    # residui: solo ELEMENTI DI SERVEZZAMENTO annunci (non CSP / meta / commenti)
    counts["residui"] = len(re.findall(
        r"pagead/js/adsbygoogle|<ins\b[^>]*adsbygoogle|\(adsbygoogle\s*=\s*window",
        html, re.IGNORECASE))
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
