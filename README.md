# SoldiChiari

**L'officina dove ripari la tua relazione con il denaro.**

SoldiChiari è un progetto di educazione finanziaria basato sulla psicologia comportamentale. Usando metafore meccaniche e la scienza dei bias cognitivi, aiutiamo le persone a prendere decisioni finanziarie migliori.

🌐 **Live:** [https://soldichiari.com](https://soldichiari.com)

---

## 📁 Struttura del Progetto

```
treasuryworks/
├── index.html              # Homepage
├── chi-sono.html           # Pagina "Chi Sono"
├── blog.html               # Blog con articoli
├── contatti.html           # Pagina contatti
├── privacy.html            # Privacy Policy (GDPR)
├── assets/
│   ├── css/
│   │   └── styles.css      # Stili principali (dark theme)
│   ├── js/
│   │   └── script.js       # JavaScript interattivo
│   └── img/                # Immagini e asset visivi
├── docs/                   # Documentazione aggiuntiva
├── robots.txt              # Istruzioni per i motori di ricerca
├── sitemap.xml             # Mappa del sito per SEO
├── package.json            # Configurazione deploy
├── README.md               # Questo file
└── LICENSE                 # Licenza MIT
```

---

## 🚀 Deploy

### Opzione 1: Cloudflare Pages (CONSIGLIATO ⭐)

1. Pusha questo repo su GitHub
2. Vai su [dash.cloudflare.com](https://dash.cloudflare.com)
3. **Workers & Pages** → **Create** → **Pages**
4. Collega il repo GitHub
5. Imposta le Build Settings:
   - **Framework preset:** `None`
   - **Build command:** (vuoto)
   - **Build output directory:** `/` (root)
6. Click **Save and Deploy**
7. Collega il tuo dominio personalizzato in **Settings → Custom domains**

### Opzione 2: GitHub Pages

1. Pusha il repo su GitHub
2. Vai su **Settings → Pages**
3. **Source:** Deploy from a branch → `main` → `/ (root)`
4. Il sito sarà disponibile su `https://{username}.github.io/treasuryworks/`

### Opzione 3: Netlify (alternativa facile)

1. Pusha su GitHub
2. Su [netlify.com](https://netlify.com) clicca **Add new site → Import an existing project**
3. Collega il repo GitHub
4. Nessuna configurazione necessaria — deploy automatico

### Deploy locale (per testare)

```bash
# Con Python
python3 -m http.server 8080

# Con Node.js (se installato)
npx serve .

# Poi apri: http://localhost:8080
```

---

## 🎨 Design System

| Elemento | Valore |
|----------|--------|
| **Tema** | Dark |
| **Colore primario** | Arancio `#f97316` |
| **Colore secondario** | Blu notte `#3b82f6` |
| **Sfondo** | Nero `#0a0e17` |
| **Font principale** | Inter |
| **Font monospace** | JetBrains Mono |
| **Raggio bordi** | 12-20px |
| **Animazioni** | CSS transitions + Intersection Observer |

---

## 📝 Blog - Articoli Pianificati

- [x] Perché perdi soldi (e non è colpa tua) — *Bias cognitivi*
- [x] Investire senza paura — *Guida pratica*
- [x] Psicologia del denaro: perché i ricchi pensano diversamente
- [x] Il metodo 50/30/20: budget che funziona
- [x] Come uscire dal debito — Il metodo dell'officina
- [ ] L'effetto Dunning-Kruger nei mercati finanziari
- [ ] Automazione finanziaria: come mettere i soldi on autopilot
- [ ] Crypto e bias: le trappole psicologiche del trading
- [ ] L'economia della ristorazione: perché spendi di più al ristorante
- [ ] Come leggere un bilancio (senza essere un commercialista)

---

## 🛠️ Tecnologie Utilizzate

- **HTML5** — Struttura semantica
- **CSS3** — Flexbox, Grid, variabili CSS, animazioni
- **JavaScript (Vanilla)** — Nessun framework, zero dipendenze
- **Google Fonts** — Inter + JetBrains Mono
- **Responsive Design** — Mobile-first
- **SEO** — Meta tags, Open Graph, structured data ready

---

## 🤝 Contributi

I contributi sono benvenuti! Se vuoi:
- Scrivere un articolo per il blog
- Tradurre il sito in inglese
- Migliorare il design
- Aggiungere nuove sezioni

Apri una issue o una pull request.

---

## 📄 Licenza

MIT License — vedi il file `LICENSE`

---

**© 2026 SoldiChiari** — L'officina della tua ricchezza. ⚙️💰