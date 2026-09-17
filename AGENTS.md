# AGENTS.md - Workflow SoldiChiari v3.2 CALIBRATO

## Checklist Pre-Push (OBBLIGATORIA)

### 1. Scansione Merge Conflict - BLOCKING
```bash
# Esegui SEMPRE prima del push
# Regex PRECISA per rilevare solo VERI Git conflict markers
# Non include pattern generici che potrebbero essere legittimi
CONFLICT_FILES=$(find . -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.md" -o -name "*.svg" \) -exec grep -lE '^<<<<<<< |^>>>>>>> |^=======$' {} \; 2>/dev/null)
if [ -n "$CONFLICT_FILES" ]; then
    echo "❌ CONFLICT MARKERS TROVATI - RISOLVERE PRIMA DI COMMIT"
    echo "File interessati:"
    echo "$CONFLICT_FILES"
    exit 1
else
    echo "✅ Nessun merge conflict rilevato"
fi
```

**Spiegazione regex**: `'^<<<<<<< |^>>>>>>> |^=======$'`
- `^<<<<<<< ` - rileva start marker Git (con spazio dopo per evitare falsi positivi)
- `^>>>>>>> ` - rileva end marker Git (con spazio dopo per evitare falsi positivi)  
- `^=======$` - rileva separator Git (alla fine della riga)
- **Esclude** `^=$` che era troppo generico e poteva creare falsi positivi

### 2. Validazione HTML Critiche - BLOCKING + WARNING
```bash
# Controlla sempre queste pagine per integrità
files_to_check=("index.html" "faq.html" "strumenti.html" "blog.html" "risorse.html" "privacy.html")

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        # Controlla struttura HTML base MINIMA (BLOCKING - tag semantici con attributi)
        if ! grep -q '<nav[> ]' "$file" || ! grep -q '</footer>' "$file"; then
            echo "❌ Struttura HTML incompleta in: $file (nav/footer mancanti)"
            exit 1
        fi
        
        # Controlla meta tags essenziali (WARNING)
        if ! grep -q "meta.*description" "$file"; then
            echo "⚠️  Meta description mancante in: $file (consigliato per SEO)"
        fi
        
        # Controlla charset UTF-8 (BLOCKING - fondamentale per il sito)
        if ! grep -q "charset=UTF-8\|charset=utf-8" "$file"; then
            echo "❌ Charset UTF-8 non trovato in: $file"
            exit 1
        fi
        
        # Testo duplicato (WARNING - solo pattern evidenti di duplicazione consecutiva)
        # Cerca righe duplicate consecutive (non vuote)
        if grep -v '^\s*$' "$file" | uniq -d | grep -q .; then
            echo "⚠️  Possibili righe duplicate consecutive in: $file"
        fi
        
    else
        echo "⚠️  File critico mancante: $file"
    fi
done
echo "✅ Validazione HTML superata"
```

### 3. Controllo Placeholder Link - BLOCKING
```bash
# Regole per href="#" - solo casi problematici sono bloccanti
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        # Cerca righe che contengono href="#"
        while IFS= read -r line; do
            # Se la linea contiene href="#"
            if [[ "$line" == *'href="#"'* ]]; then
                # Controlla se nello stesso line c'è un onclick
                if [[ "$line" != *'onclick='* ]]; then
                    # BLOCKING: href="#" senza onclick nello stesso line (mai permesso)
                    echo "❌ href='#' senza onclick nello stesso line in: $file"
                    echo "   Linea problema: $line"
                    exit 1
                fi
                # Se c'è onclick, controlla se contiene navigazione (window.location, etc.)
                if [[ "$line" == *'onclick='* ]] && ([[ "$line" == *'window.location'* ]] || [[ "$line" == *'location.href'* ]] || [[ "$line" == *'location.assign'* ]] || [[ "$line" == *'location.replace'* ]]); then
                    # WARNING: href="#" con onclick che naviga (sconsigliato)
                    echo "⚠️  href='#' con onclick che naviga in: $file"
                    echo "   Linea problema: $line"
                    echo "   Considerare rimuovere href='#' e usare direttamente onclick"
                fi
            fi
        done < "$file"
    fi
done
echo "✅ Controllo placeholder link superato"
```

### 4. Controllo Navigation/Footer Semantico - WARNING
```bash
# Controlla presenza di navigation e footer con approccio semantico
# NON usa classi hardcoded ma struttura HTML reale
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        # WARNING: Controllo semantico navigation
        if ! grep -q '<nav[> ]' "$file"; then
            echo "⚠️  Tag <nav> non trovato in: $file (usare tag semantico)"
        fi
        
        # WARNING: Controllo semantico footer
        if ! grep -q '<footer[> ]' "$file"; then
            echo "⚠️  Tag <footer> non trovato in: $file (usare tag semantico)"
        fi
        
        # WARNING: Presenza link utili in footer
        if ! grep -q 'href="[^"]*"' "$file" | grep -q "footer\|contatti\|privacy\|info"; then
            echo "⚠️  Footer potrebbe mancare di link navigazionali in: $file"
        fi
    fi
done
echo "✅ Controlli semantici superati"
```

### 5. Git Status + Commit Policy - BLOCKING + WARNING
```bash
echo "=== GIT STATUS ==="
git status
if [ $? -ne 0 ]; then
    echo "❌ Problema con git status"
    exit 1
fi

# Mostra file modificati
MODIFIED_FILES=$(git status --porcelain | grep "^ M" | awk '{print $2}')
if [ -n "$MODIFIED_FILES" ]; then
    echo "📝 File modificati:"
    echo "$MODIFIED_FILES"
    echo ""
    
    # WARNING: Troppi file modificati in un unico commit
    MODIFIED_COUNT=$(echo "$MODIFIED_FILES" | wc -l)
    if [ $MODIFIED_COUNT -gt 5 ]; then
        echo "⚠️  Troppi file modificati in un unico commit: $MODIFIED_COUNT"
        echo "   Considerare dividere in commit più piccoli per migliore tracciabilità"
    fi
    
    # WARNING: File non critici modificati
    MODIFIED_CRITICAL=0
    for file in $MODIFIED_FILES; do
        if [[ " ${files_to_check[*]} " =~ " $file " ]]; then
            echo "✅ File critico modificato: $file"
        else
            echo "⚠️  File modificato non critico: $file"
            MODIFIED_CRITICAL=$((MODIFIED_CRITICAL + 1))
        fi
    done
    
    if [ $MODIFIED_CRITICAL -gt 3 ]; then
        echo "⚠️  Molti file non critici modificati: $MODIFIED_CRITICAL"
    fi
else
    echo "ℹ️  Nessun file modificato"
fi
```

### 6. Commit Message - BLOCKING
```bash
echo "=== COMMIT MESSAGE CHECK ==="
if [ "$1" = "--check-message" ]; then
    if ! echo "$2" | grep -E '^(fix|feat|refactor|chore):'; then
        echo "❌ Commit message non conforme conventional commits"
        echo "Formato richiesto: tipo: descrizione breve"
        echo "Esempi: fix: risolto errore navbar, feat: nuova pagina strumenti"
        exit 1
    fi
    if [ ${#2} -gt 72 ]; then
        echo "❌ Commit troppo lungo (max 72 caratteri): ${#2}"
        exit 1
    fi
    echo "✅ Commit message valido"
fi
```

## Workflow Standard SoldiChiari

### Fase 1: Edit (Modifica)
```bash
# 1. Modifica solo i file necessari
# 2. Mantieni piccole modifiche focalizzate
# 3. Nessuna regola rigida sul numero di file
```

### Fase 2: Scan (Scansione)
```bash
# 1. Esegui checklist merge conflict (OBBLIGATORIO)
# 2. Verifica HTML base (OBBLIGATORIO)
# 3. Controlla placeholder link problematici (OBBLIGATORIO)
```

### Fase 3: Validate (Validazione)
```bash
# 1. Esegui pre-push checklist
# 2. Apri le pagine in browser per verifica visiva
# 3. Controlla che funzioni JavaScript funzionino
```

### Fase 4: Git Status
```bash
git status
# Verifica file modificati e considera warnings
```

### Fase 5: Commit
```bash
git add .
git commit -m "tipo: descrizione breve"
```

### Fase 6: Push
```bash
git push
```

## Regole Permanenti per Agenti/Coding

### Regola 1: Zero Merge Conflict nel Codice Finale - BLOCKING
- Mai lasciare `<<<<<<< `, `======= `, `>>>>>>> ` nei file pubblici
- Se si verifica un merge, risolvere immediatamente prima del commit
- Usare sempre scansione con regex PRECISA per rilevare solo veri conflict markers

### Regola 2: Scansione Obbligatoria Prima di Completamento - BLOCKING
- Eseguire sempre scansione con regex corretta: `'^<<<<<<< |^>>>>>>> |^=======$'`
- Bloccare il workflow se trovati conflict markers
- Documentare la scansione nei commenti del commit

### Regola 3: No Placeholder Link Pubblici - BLOCKING
- ❌ **BLOCKING**: `href="#"` senza onclick nello stesso line (usa button o aggiungi onclick funzionale)
- ⚠️ **WARNING**: `href="#"` con onclick che naviga (window.location, etc.) - considerare rimuovere href="#" e usare direttamente onclick
- ✅ **ACCETTABILE**: `href="#"` con onclick funzionale per modali, toggle, etc. (senza navigazione)

### Regola 4: Validazione Finale su Pagine Critiche - BLOCKING
- Sempre verificare: index.html, faq.html, strumenti.html, blog.html, risorse.html, privacy.html
- ✅ **BLOCKING**: Presenza di `<nav>` e `</footer>`
- ✅ **BLOCKING**: Charset UTF-8
- ⚠️ **WARNING**: Meta description (consigliato per SEO)
- ⚠️ **WARNING**: Struttura semantica (tag HTML corretti)

### Regola 5: Commit Focalizzati - BLOCKING + WARNING
- ✅ **BLOCKING**: Max 72 caratteri nel commit message
- ✅ **BLOCKING**: Conventional commits: `fix:`, `feat:`, `refactor:`, `chore:`
- ⚠️ **WARNING**: Commit con pochi file (idealmente < 5, ma non bloccante)
- ⚠️ **WARNING**: Un commit per modifica logica (non obbligatorio ma consigliato)

## Errori Comuni da Evitare

### ❌ Da NON Fare (BLOCKING)
- Commit di merge conflict non risolti
- `href="#"` senza onclick nello stesso line
- Modifiche senza charset UTF-8
- Commit con messaggio non conforme conventional commits

### ⚠️ Da EVITARE (WARNING)
- Modifiche massive non testate
- Uso indiscriminato di `href="#"` con navigazione
- Commit generici tipo "update"
- Mancanza di meta description

### ✅ Da SEMPRE Fare
- Scansione post-merge con regex corretta
- Validazione HTML base manuale
- Test in browser delle pagine modificate
- Commit message descrittivo e breve

## Strumenti Utili

### Script di Validazione Calibrato
```bash
#!/bin/bash
echo "=== TREASURY WORKS PRE-PUSH VALIDATION CALIBRATO ==="
echo "1. Merge Conflict Scan... (BLOCKING)"
find . -name "*.html" -o -name "*.css" -o -name "*.js" | xargs grep -lE '^<<<<<<< |^>>>>>>> |^=======$' && exit 1
echo "✅ Merge conflict OK"

echo "2. HTML Structure Check... (BLOCKING)"
files=("index.html" "faq.html" "strumenti.html" "blog.html" "risorse.html" "privacy.html")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        if ! grep -q "<nav[> ]" "$file" || ! grep -q "</footer>" "$file"; then
            echo "❌ Struttura HTML incompleta in $file"
            exit 1
        fi
        if ! grep -q "charset=UTF-8\|charset=utf-8" "$file"; then
            echo "❌ Charset mancante in $file"
            exit 1
        fi
    fi
done
echo "✅ HTML structure OK"

echo "3. Placeholder Link Check... (BLOCKING)"
for file in "${files[@]}"; do
    if [ -f "$file"]; then
        # Cerca righe che contengono href="#"
        while IFS= read -r line; do
            # Se la linea contiene href="#"
            if [[ "$line" == *'href="#"'* ]]; then
                # Controlla se nello stesso line c'è un onclick
                if [[ "$line" != *'onclick='* ]]; then
                    # BLOCKING: href="#" senza onclick nello stesso line (mai permesso)
                    echo "❌ href='#' senza onclick nello stesso line in $file"
                    echo "   Linea problema: $line"
                    exit 1
                fi
            fi
        done < "$file"
    fi
done
echo "✅ Placeholder link OK"

echo "=== VALIDAZIONE COMPLETA ==="
git add .
git commit -m "$1"
git push
```

### Integrazione con Hermes/OpenCode

#### Per Agenti Hermes
1. Caricare sempre questo AGENTS.md prima di modificare il repository
2. Eseguire la checklist pre-push come primo passo dopo le modifiche
3. Usare il comando `/compact` se il contesto diventa troppo grande
4. Attenzione a distinguere tra regole BLOCKING e WARNING

#### Per OpenCode
1. Configurare gli agenti con queste workflow come regole obbligatorie
2. Includere solo le regole BLOCKING nei pre-commit hooks
3. Usare il sistema di validation come gate prima del push
4. Considerare i warnings come punti di attenzione, non blocchi

### Comandi Hermes Consigliati
```bash
# Prima di iniziare le modifiche
/hermes config set project treasuryworks
/hermes tools load-agents

# Durante lo sviluppo
/n # Mostra AGENTS.md corrente
/compact # Se contesto troppo grande

# Prima del push
git status
# Esegui manualmente la checklist pre-push (attenzione a BLOCKING vs WARNING)
git commit -m "feat: add new tool page"
git push
```

---

**Versione:** SoldiChiari v3.2 Hardening CALIBRATO  
**Ultimo aggiornamento:** 2026-05-24  
**Prossima revisione:** Dopo ogni incidente significativo