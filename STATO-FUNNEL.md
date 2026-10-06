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

## Prodotto a pagamento (funnel di vendita)
| Nodo | URL | Stato (verificato live 06/10) |
|---|---|---|
| Landing workbook | `/busta-paga-senza-misteri.html` (+ `/busta-paga-senza-misteri` → 200) | ✅ 200, commit `07bfb8a`. Copertina reale estratta dal PDF v1, JSON-LD `Product` €9, FAQ, disclaimer "non è consulenza" |
| Ingressi funnel | `tools/calcolo-stipendio-netto.html`, `risorse.html` | ✅ CTA/link verso la landing presenti su entrambe (verificato sul live) |
| Sitemap | `sitemap.xml` | ✅ URL canonico `.html` aggiunto, XML validato |
| **Checkout** | `soldichiari.gumroad.com/l/busta-paga-senza-misteri` | ❌ **404** — account Gumroad inesistente. La landing raccoglie **interesse via Web3Forms** (pulsante "Richiedi il link d'acquisto"), non incassa: nessun finto pagamento. |

Da fare quando la listing esiste: sostituire l'`href` del pulsante `#btn-buy` nella landing con l'URL Gumroad (punto di modifica commentato nel file) e passare la bio TikTok al link di vendita.

## Aperti — azione richiesta
1. **Enforce HTTPS**: `http://soldichiari.com` risponde **200 senza redirect** → contenuto duplicato http/https. Solo ONDA: GitHub → Settings → Pages → *Enforce HTTPS* (l'API rifiuta il PAT su quell'opzione).
2. **Sequenza email Brevo**: servono le chiavi in `.env` (mai in chat) per attivarla.
