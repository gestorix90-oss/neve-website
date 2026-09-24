#!/bin/bash
# TreasuryWorks Pre-Push Validation Script v3.2 CALIBRATO
# Eseguire SEMPRE prima di ogni commit/push

echo "=== TREASURY WORKS v3.2 PRE-PUSH VALIDATION CALIBRATO ==="
echo "Data: $(date)"
echo ""

# Funzioni per gestione errori e warnings
exit_with_error() {
    echo "❌ $1"
    echo "VALIDAZIONE FALLITA - Risolvere prima del commit"
    exit 1
}

warn_if_needed() {
    echo "⚠️  $1"
}

info_if_needed() {
    echo "ℹ️  $1"
}

# 1. Scansione Merge Conflict - BLOCKING
echo "1. Scansione Merge Conflict... (BLOCKING)"
# Regex PRECISA per rilevare solo VERI Git conflict markers
# Esclude pattern troppo generici che potrebbero creare falsi positivi
CONFLICT_FILES=$(find . -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.md" -o -name "*.svg" \) -exec grep -lE '^<<<<<<< |^>>>>>>> |^=======$' {} \; 2>/dev/null)
if [ -n "$CONFLICT_FILES" ]; then
    echo "❌ CONFLICT MARKERS TROVATI:"
    echo "$CONFLICT_FILES"
    exit_with_error "Trovati merge conflict non risolti"
else
    echo "✅ Nessun merge conflict rilevato"
fi
echo ""

# 2. Validazione Struttura HTML - BLOCKING + WARNING
echo "2. Validazione Struttura HTML... (BLOCKING + WARNING)"
CRITICAL_FILES=("index.html" "faq.html" "strumenti.html" "blog.html" "risorse.html" "privacy.html" "contatti.html" "info.html")

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        # BLOCKING: Struttura base HTML MINIMA
        if ! grep -q "<nav[> ]" "$file" || ! grep -q "</footer>" "$file"; then
            exit_with_error "Struttura HTML incompleta in: $file (nav/footer mancanti)"
        fi
        
        # BLOCKING: Charset UTF-8 (fondamentale per il sito)
        if ! grep -q "charset=\"UTF-8\"\|charset=\"utf-8\"\|charset=UTF-8" "$file"; then
            exit_with_error "Charset UTF-8 non trovato in: $file"
        fi
        
        # WARNING: Meta description (consigliato per SEO)
        if ! grep -q "meta.*description" "$file"; then
            warn_if_needed "Meta description mancante in: $file (consigliato per SEO)"
        fi
        
        # Testo duplicato (WARNING - solo pattern evidenti di duplicazione consecutiva)
        # Cerca righe duplicate consecutive (non vuote)
        if grep -v '^\s*$' "$file" | uniq -d | grep -q .; then
            warn_if_needed "Possibili righe duplicate consecutive in: $file"
        fi
        
    else
        warn_if_needed "File critico mancante: $file"
    fi
done
echo "✅ Struttura HTML valida"
echo ""

# 3. Controllo Placeholder Link - BLOCKING
echo "3. Controllo Placeholder Link... (BLOCKING)"
PLACEHOLDER_ISSUES=0
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Cerca righe che contengono href="#"
        while IFS= read -r line; do
            # Se la linea contiene href="#"
            if [[ "$line" == *'href="#"'* ]]; then
                # Controlla se nello stesso line c'è un onclick
                if [[ "$line" != *'onclick='* ]]; then
                    # BLOCKING: href="#" senza onclick nello stesso line (mai permesso)
                    exit_with_error "href='#' senza onclick nello stesso line in: $file"
                fi
                # Se c'è onclick, controlla se contiene navigazione (window.location, etc.)
                if [[ "$line" == *'onclick='* ]] && ([[ "$line" == *'window.location'* ]] || [[ "$line" == *'location.href'* ]] || [[ "$line" == *'location.assign'* ]] || [[ "$line" == *'location.replace'* ]]); then
                    # WARNING: href="#" con onclick che naviga (sconsigliato)
                    warn_if_needed "href='#' con onclick che naviga in: $file"
                    warn_if_needed "Considerare rimuovere href='#' e usare direttamente onclick"
                fi
            fi
        done < "$file"
        
        echo "✅ Placeholder link con JavaScript appropriato"
        PLACEHOLDER_ISSUES=$((PLACEHOLDER_ISSUES + 1))
    fi
done

if [ $PLACEHOLDER_ISSUES -eq 0 ]; then
    echo "✅ Nessun placeholder link problematico"
else
    info_if_needed "$PLACEHOLDER_ISSUES placeholder link con JavaScript appropriati"
fi
echo ""

# 4. Controllo Navigation/Footer Semantico - WARNING
echo "4. Verifica Coerenza Navigation/Footer... (WARNING)"
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        # WARNING: Controllo semantico navigation
        if ! grep -q '<nav[> ]' "$file"; then
            warn_if_needed "Tag <nav> non trovato in: $file (usare tag semantico)"
        fi
        
        # WARNING: Controllo semantico footer
        if ! grep -q '<footer[> ]' "$file"; then
            warn_if_needed "Tag <footer> non trovato in: $file (usare tag semantico)"
        fi
        
        # WARNING: Presenza link utili in footer
        if ! grep -q 'href="[^"]*"' "$file" | grep -q "footer\|contatti\|privacy\|info"; then
            warn_if_needed "Footer potrebbe mancare di link navigazionali in: $file"
        fi
    fi
done
echo "✅ Controlli semantici completati"
echo ""

# 5. Git Status Check - BLOCKING + WARNING
echo "5. Git Status... (BLOCKING + WARNING)"
if ! git status >/dev/null 2>&1; then
    exit_with_error "Problema con repository Git"
fi

MODIFIED_FILES=$(git status --porcelain | grep "^ M" | awk '{print $2}')
if [ -n "$MODIFIED_FILES" ]; then
    echo "📝 File modificati:"
    echo "$MODIFIED_FILES"
    echo ""
    
    # WARNING: Troppi file modificati in un unico commit
    MODIFIED_COUNT=$(echo "$MODIFIED_FILES" | wc -l)
    if [ $MODIFIED_COUNT -gt 5 ]; then
        warn_if_needed "Troppi file modificati in un unico commit: $MODIFIED_COUNT"
        warn_if_needed "Considerare dividere in commit più piccoli per migliore tracciabilità"
    fi
    
    # WARNING: File non critici modificati
    MODIFIED_CRITICAL=0
    for file in $MODIFIED_FILES; do
        if [[ " ${CRITICAL_FILES[*]} " =~ " $file " ]]; then
            echo "✅ File critico modificato: $file"
        else
            echo "⚠️  File modificato non critico: $file"
            MODIFIED_CRITICAL=$((MODIFIED_CRITICAL + 1))
        fi
    done
    
    if [ $MODIFIED_CRITICAL -gt 3 ]; then
        warn_if_needed "Molti file non critici modificati: $MODIFIED_CRITICAL"
    fi
else
    info_if_needed "Nessun file modificato da validare"
fi
echo ""

# 6. Verifica File Non Gestiti - INFORMATIONAL
echo "6. Check File Non Gestiti... (INFORMATIONAL)"
UNTRACKED=$(git status --porcelain | grep "^??" | awk '{print $2}')
if [ -n "$UNTRACKED" ]; then
    info_if_needed "File non tracciati:"
    echo "$UNTRACKED"
    info_if_needed "Verifica se devono essere aggiunti con git add"
fi
echo ""

# 7. Controllo File Sospetti - WARNING
echo "7. Verifica File Sospetti... (WARNING)"
# Cerca file con potenziali problemi (non bloccanti)
if grep -r "javascript:void(0)" . --include="*.html" | grep -v "node_modules" >/dev/null; then
    warn_if_needed "Trovati javascript:void(0) - verificare se sono necessari"
fi

# Controlla per href="#" con problemi (ma già fatto nel punto 3)
if grep -r 'href="#"' . --include="*.html" | grep -v 'onclick=' | head -3 >/dev/null; then
    warn_if_needed "Trovati href='#' senza onclick - VERIFICARE"
fi
echo ""

# 8. Verifica Commit Message (se fornito)
if [ "$1" = "--check-message" ] && [ -n "$2" ]; then
    echo "8. Verifica Commit Message... (BLOCKING)"
    if ! echo "$2" | grep -E '^(fix|feat|refactor|chore):'; then
        exit_with_error "Commit message non conforme conventional commits"
    fi
    if [ ${#2} -gt 72 ]; then
        exit_with_error "Commit troppo lungo (max 72 caratteri): ${#2}"
    fi
    echo "✅ Commit message valido"
    echo ""
fi

echo "=== VALIDAZIONE COMPLETA ==="
echo "✅ Tutti i check BLOCKING superati"
echo "⚠️  Controlla i warning sopra (non bloccanti)"
echo "✅ Repository pronto per commit/push"
echo ""
echo "Prossimi passi:"
echo "1. git commit -m \"tipo: descrizione breve\""
echo "2. git push"
echo ""
echo "Ricorda:"
echo "- Usa conventional commits (fix:, feat:, refactor:, chore:)"
echo "- Mantieni commit brevi (max 72 caratteri)"
echo "- I warning non bloccano il commit ma sono punti di attenzione"
echo ""
echo "Script versione: v3.2 - CALIBRATO (BLOCKING vs WARNING)"

# Return 0 se tutti i check blocking sono superati
exit 0