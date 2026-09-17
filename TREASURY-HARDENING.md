# SoldiChiari Hardening - Configurazione OpenCode v3.2 CALIBRATO

## Agent Configuration for SoldiChiari Repository

### Custom Agent Rules - VERSIONE CALIBRATA
Aggiungere queste regole obbligatorie a tutti gli agenti che lavorano sul repository SoldiChiari:

```yaml
rules:
  # BLOCKING - Ferma il commit se non superato
  - "MAI lasciare merge conflict veri nei file pubblici (regex PRECISA)"
  - "SEMPRE eseguire scansione conflict prima di completare (file: html,css,js,md,svg)"
  - "VIETATO href='# senza onclick nello stesso line (usa button o aggiungi onclick funzionale)"
  - "OBBLIGATORIO charset UTF-8 in tutte le pagine"
  - "OBBLIGATORIO conventional commits format (max 72 caratteri)"
  
  # WARNING - Non blocca ma segna problemi
  - "CONSIGLIATO meta description per SEO (non bloccante)"
  - "CONSIGLIATO struttura semantica HTML (nav, footer tag)"
  - "CONSIGLIATO commit focalizzati (idealmente < 5 file, non bloccante)"
  - "CONSIGLIATO footer con link navigazionali"
  - "CONSIGLIATO evitare href='# con onclick che naviga (sconsigliato)"

validation_steps:
  # BLOCKING checks
  - "Scansione merge conflict con regex PRECISA: '^<<<<<<< |^>>>>>>> |^=======$'"
  - "Struttura HTML MINIMA (nav, footer, charset UTF-8)"
  - "Placeholder link check (href='# senza onclick nello stesso line) -> BLOCKING"
  - "Commit message validation (conventional commits, 72 char max)"
  
  # WARNING checks  
  - "Meta description check (SEO, non bloccante)"
  - "Semantic HTML structure (tag semantici, non bloccante)"
  - "File count per commit (sconsigliato > 5, non bloccante)"
  - "Navigation/footer link completeness (non bloccante)"
  - "Placeholder link con onclick che naviga (sconsigliato, non bloccante)"

placeholder_rules:
  # BLOCKING
  - "href='# senza onclick nello stesso line → ❌ usa button o aggiungi onclick funzionale"
  
  # WARNING  
  - "href='# con onclick che naviga → ⚠️ sconsigliato (rimuovere href='#' e usare direttamente onclick)"
  - "javascript:void(0) → ⚠️ verificare necessità"
```

### OpenCode Commands - VERSIONE CALIBRATA
Configurare questi comandi nel file `.opencode/.opencode/commands/`:

#### `/treasury-validate` - Validation Script v3.2 CALIBRATO
```bash
#!/bin/bash
echo "=== SoldiChiari Validation v3.2 CALIBRATO ==="
/home/gestorix/workspace/projects/treasuryworks/scripts/pre-push-validation.sh
if [ $? -ne 0 ]; then
    echo "❌ Validation BLOCKING failed - non committare"
    exit 1
fi
echo "✅ Validation BLOCKING superata - ready for commit"
echo "⚠️  Controlla i warning (non bloccanti)"
```

#### `/treasury-commit` - Smart Commit con Regole CALIBRATE
```bash
#!/bin/bash
echo "=== SoldiChiari Commit ==="
git add .

# Leggi commit message
read -p "Commit message (max 72 chars, tipo: descrizione): " message

# Validazione commit message (BLOCKING)
if [ ${#message} -gt 72 ]; then
    echo "❌ Commit troppo lungo (max 72 caratteri)"
    exit 1
fi

if ! echo "$message" | grep -E '^(fix|feat|refactor|chore):'; then
    echo "❌ Usa conventional commits: fix:, feat:, refactor:, chore:"
    exit 1
fi

# Verifica file modificati (WARNING, non bloccante)
MODIFIED_COUNT=$(git diff --cached --name-only | wc -l)
if [ $MODIFIED_COUNT -gt 5 ]; then
    echo "⚠️  Troppi file modificati in un unico commit ($MODIFIED_COUNT)"
    echo "   Considerare dividere in commit più piccoli"
    # Non esce, solo warning
fi

echo "✅ Commit message valido: $message"
git commit -m "$message"
echo "✅ Committed con successo"
```

#### `/treasury-quick-check` - Controllo Rapido BLOCKING
```bash
#!/bin/bash
echo "=== Quick SoldiChiari Check (BLOCKING ONLY) ==="
# Solo i controlli BLOCKING più critici
find . -name "*.html" -o -name "*.css" -o -name "*.js" | xargs grep -lE '^<<<<<<< |^>>>>>>> |^=======$' && exit 1
echo "✅ No merge conflict"

grep -r 'href="#"' . --include="*.html" | while IFS= read -r line; do
    if [[ "$line" == *'href="#"'* ]] && [[ "$line" != *'onclick='* ]]; then
        exit 1
    fi
done
echo "✅ No placeholder link problematici"

echo "✅ Quick check BLOCKING superato"
```

### Hermes Integration Commands - VERSIONE CALIBRATA
Aggiungere a `~/.hermes/skills/treasuryworks-hardening-v3/SKILL.md`:

```markdown
description: SoldiChiari repository hardening v3.2 - calibrated validation workflow
mode: subagent
model: anthropic/claude-opus-4-6
temperature: 0.05
permission:
  edit: allow
  bash: allow
  webfetch: deny

calibrated_validation_workflow:
  # BLOCKING checks - must pass
  1. "Esegui merge conflict scan con regex PRECISA"
  2. "Verifica HTML structure MINIMA (nav, footer, charset UTF-8)"
  3. "Controlla placeholder link BLOCKING rules (href='# senza onclick nello stesso line)"
  4. "Valida commit message (conventional commits, 72 char)"
  
  # WARNING checks - attention points
  5. "Controlla meta description (SEO, non bloccante)"
  6. "Verifica struttura semantica (non bloccante)"
  7. "Monitora file count per commit (non bloccante)"
  8. "Controlla href='# con onclick che naviga (sconsigliato, non bloccante)"
  
  behavior: "Proceed if all BLOCKING checks pass, report warnings"

error_prevention:
  # BLOCKING - absolute blocks
  - "Block commit with real merge conflict markers"
  - "Block href='# senza onclick nello stesso line"
  - "Block missing charset UTF-8"
  - "Block non-conventional commit messages"
  
  # WARNING - attention points
  - "Warn about missing meta descriptions"
  - "Warn about non-semantic HTML structure"
  - "Warn about large commits"
  - "Warn about placeholder link con onclick che naviga"
```

## Workflow con Hermes/OpenCode v3.2 CALIBRATO

### 1. Prima di Iniziare
```bash
# Carica l'hardening skill v3
/skill treasuryworks-hardening-v3

# Verifica stato attuale (solo BLOCKING)
/treasury-quick-check

# Se vuoi validazione completa (BLOCKING + WARNING)
/treasury-validate
```

### 2. Durante lo Sviluppo
```bash
# Usa agenti con regole hardening v3 calibrate
/agent content-editor --rules treasuryworks-calibrated-validation
/agent html-validator --merge-conflict-scan --strict-placeholder-check
```

### 3. Prima del Push (Workflow Standard)
```bash
# 1. Controllo rapido (solo BLOCKING)
/treasury-quick-check

# 2. Validazione completa (BLOCKING + WARNING)
/treasury-validate

# 3. Se OK, esegui commit focalizzato
/treasury-commit
```

### 4. Post-Push Verifica
```bash
# Verifica deploy
/open-browser https://soldichiari.com

# Monitora errori
/agent quality-monitor --check-live-site
```

## Git Hooks Automatici v3.2 CALIBRATO
Configurare `~/.git/hooks/pre-commit`:

```bash
#!/bin/bash
echo "=== SoldiChiari Pre-Commit v3.2 CALIBRATO ==="

# Esegui validazione (solo BLOCKING checks)
/home/gestorix/workspace/projects/treasuryworks/scripts/pre-push-validation.sh --check-message "$1"
if [ $? -ne 0 ]; then
    echo "❌ Validation BLOCKING failed - aborting commit"
    exit 1
fi

# Verifica commit message (BLOCKING)
COMMIT_MSG_FILE="$1"
if [ -f "$COMMIT_MSG_FILE" ]; then
    MESSAGE=$(head -1 "$COMMIT_MSG_FILE")
    if [ ${#MESSAGE} -gt 72 ]; then
        echo "❌ Commit message troppo lungo: ${#MESSAGE} caratteri"
        exit 1
    fi
    if ! echo "$MESSAGE" | grep -E '^(fix|feat|refactor|chore):'; then
        echo "❌ Commit message non conforme: $MESSAGE"
        echo "   Usa: fix:, feat:, refactor:, chore:"
        exit 1
    fi
fi

echo "✅ Pre-commit validation BLOCKING passed"
echo "⚠️  Controlla i warning (non bloccanti)"
```

## Error Prevention Rules v3.2 CALIBRATE

### Agent Constraints - Separated by Severity
```yaml
# BLOCKING constraints - absolute blocks
constraints_blocking:
  merge_conflict:
    pattern: '^<<<<<<< |^>>>>>>> |^=======$'
    files: ["*.html", "*.css", "*.js", "*.md", "*.svg"]
    action: "block_commit"
  
  placeholder_links:
    forbidden_patterns:
      - 'href="#"[^>]*$'  # href senza onclick nello stesso line (rilevato linea per linea)
    action: "block_commit"
  
  html_structure:
    required_elements:
      - "<nav[> ]"
      - "</footer>"
      - "charset=UTF-8"
    action: "block_commit"
  
  commit_format:
    required_format: '^(fix|feat|refactor|chore):'
    max_length: 72
    action: "block_commit"

# WARNING constraints - attention points
constraints_warning:
  seo_optimization:
    recommended_elements:
      - "meta.*description"
    action: "warn_only"
  
  semantic_html:
    recommended_tags:
      - "<nav>"
      - "<footer>"
    action: "warn_only"
  
  commit_size:
    max_files: 5
    action: "warn_only"
  
  navigation_completeness:
    required_links: ["footer", "contatti", "privacy", "info"]
    action: "warn_only"
  
  placeholder_nav:
    forbidden_patterns:
      - 'href="#"[^>]*onclick=[^>]*[^"]*window\.location[^"]*[^>]*'
      - 'href="#"[^>]*onclick=[^>]*[^"]*location\.href[^"]*[^>]*'
      - 'href="#"[^>]*onclick=[^>]*[^"]*location\.assign[^"]*[^>]*'
      - 'href="#"[^>]*onclick=[^>]*[^"]*location\.replace[^"]*[^>]*'
    action: "warn_only"
```

### Quality Gates v3.2 CALIBRATE
- **BLOCKING**: Merge Conflict Detection - Regex PRECISA per veri conflict markers
- **BLOCKING**: HTML Structure - Presenza di nav, footer, charset UTF-8
- **BLOCKING**: Placeholder Safety - Regole severe per href="#" senza onclick nello stesso line
- **BLOCKING**: Commit Quality - Message format e dimensione
- **WARNING**: SEO Optimization - Meta description (non bloccante)
- **WARNING**: Semantic Structure - Tag HTML corretti (non bloccante)
- **WARNING**: Commit Size - Numero file per commit (non bloccante)
- **WARNING**: Navigation Completeness - Footer link (non bloccante)
- **WARNING**: Placeholder link con onclick che naviga (sconsigliato, non bloccante)

## Incident Response v3.2 CALIBRATE

### Incident Report Template - Separated by Severity
```markdown
## Incident Report - SoldiChiari Hardening v3.2 CALIBRATO
**Data:** [data]
**Tipo:** [blocking_error / warning_issue]
**Severità:** [BLOCKING / WARNING]
**File:** [file interessato]
**Regola:** [regola calibrata violata]
**Root Cause:** [analisi tecnica]
**Impatto:** [blocca commit / solo attenzione]
**Soluzione:** [come risolto]
**Prevenzione:** [aggiornamento regole]
**Aggiornamento:** [script/AGENTS.md/HARDENING.md]
```

### Success Metrics v3.2 CALIBRATE
- **100% merge conflict detection rate** (regex PRECISA)
- **Zero problematic placeholder links published** (BLOCKING rules)
- **100% validation script BLOCKING pass rate**
- **100% conventional commits compliance**
- **< 72 caratteri per commit message**
- **Meta description coverage > 80%** (target, non bloccante)
- **Semantic HTML usage > 90%** (target, non bloccante)

## Maintenance v3.2 CALIBRATE

### Aggiornamento Regole
1. Monitorare incidenti con template separato per BLOCKING/WARNING
2. Aggiornare script di validation v3.2 calibrato
3. Aggiornare AGENTS.md e TREASURY-HARDENING.md
4. Comunicare cambiamenti team con changlog dettagliato

### Versionamento
- **v3.1**: Hardening iniziale
- **v3.2**: Aggiunta nuove pagine critiche
- **v3.3**: Miglioramento validation script
- **v3.1-v2.0**: ROBUSTIZZAZIONE contro fragilità tecniche
- **v3.1-v3.0**: CALIBRAZIONE (BLOCKING vs WARNING)

### Changelog Tecnico v3.2 CALIBRATO
- **Merge Conflict**: Regex PRECISA `'^<<<<<<< |^>>>>>>> |^=======$'` (esclude pattern generici)
- **Duplicate Text**: RIMOZIONE regex fragile `(.)\\1{10,}`; sostituito con controllo di duplicazione consecutive linee non vuote (`grep -v '^\s*$' | uniq -d`)
- **Quality Gates**: Da hardcoded pattern a semantico resilient (usa tag `<nav[> ]` e `</footer>` senza dipendere da classi)
- **Placeholder Rules**: Separato BLOCKING (href="#" senza onclick nello stesso line) da WARNING (href="#" con onclick che naviga)
- **Commit Policy**: Max 5 file trasformato in WARNING non bloccante
- **Navigation Footer**: Da classi hardcoded a tag semantici HTML
- **Script**: Funzioni separate per BLOCKING/WARNING, migliore error handling, parsing linea per linea per placeholder

---

**Versione:** v3.2 - CALIBRATO (BLOCKING vs WARNING)  
**Ultimo aggiornamento:** 2026-05-24  
**Responsabile:** SoldiChiari Team  
**Prossima revisione:** Dopo ogni incidente significativo