# STATO-FUNNEL — soldichiari.com

Aggiornato: 2026-10-06, ore 01:00 — verifica live (@sito), non a memoria.
Fonte canonica per **funnel/canali lead** (questo file). Per **cron/flotta/prompt**: `C:\Users\ONDA\SOLDI_CHIARI\05_DOCUMENTAZIONE\STATO-FUNNEL.md` — un solo capitolo per file, niente accorpamenti.

## Canali lead attivi (tutti → Web3Forms → gestorix90@gmail.com)
| Canale | Pagina | Stato |
|---|---|---|
| Form `lead-soldi` (download guida) | `risorse.html` | ✅ attiva (ex Netlify → 405, sostituita con handler Web3Forms, commit `ba388d3`) |
| CTA calcolatore | `tools/calcolo-stipendio-netto.html` | ✅ punta a `risorse.html` (ancora esistente) |
| Form contatti | `contatti.html` | ✅ Web3Forms |
| Newsletter | footer/home | ✅ Web3Forms |
| Lead magnet | `guida-busta-paga-2026.html` | ✅ live, HTTP 200 |

Chiave unica: `assets/js/forms.js` → `access_key 4bb94a3f-…`. FormSubmit e form Netlify: nessun residuo.

## Verifiche live del 2026-10-06
- `/lead-magnet/` → **404** (cleanup `ab2235c`, 19 file di test rimossi) ✅
- Nessun `netlify.com/api/v1/forms` nelle pagine pubblicate ✅
- Nessun URL `github.io` in homepage e sitemap ✅
- Sitemap popolata, ultimo articolo indicizzato con lastmod corrente ✅
- File di lavoro (`*.md`, `_scripts/`, `.github/`) → 404 via `_redirects` ✅
- Calcolatore raggiungibile solo su `/tools/…` (mai esistito a root: nessun link interno rotto) ✅

## Aperti — azione richiesta
1. **Enforce HTTPS**: `http://soldichiari.com` risponde **200 senza redirect** → contenuto duplicato http/https. Solo ONDA: GitHub → Settings → Pages → *Enforce HTTPS* (l'API rifiuta il PAT su quell'opzione).
2. **Sequenza email Brevo**: servono le chiavi in `.env` (mai in chat) per attivarla.
