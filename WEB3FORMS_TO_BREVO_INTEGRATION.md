# Integrazione Web3Forms → Brevo per SoldiChiari

Questa guida spiega come collegare il form di cattura lead del calcolatore stipendio (attualmente collegato a Web3Forms) a Brevo (ex Sendinblue) senza modificare il sito soldichiari.com.

## Perché questa integrazione?
- Il form su `tools/calcolo-stipendio-netto.html` invia già i dati a Web3Forms
- Vogliamo che questi lead vengano automaticamente aggiunti a una lista in Brevo
- Così facendo, possiamo utilizzare le automazioni di Brevo (email di benvenuto, sequenze educative, ecc.)
- **Nessuna modifica al sito richiesta** - l'integrazione avviene a livello di servizio

## Strumenti necessari
1. Account Web3Forms (già configurato nel form)
2. Account Brevo (da configurare seguendo BREVO_SETUP_GUIDE.md)
3. Account Zapier gratuito (https://zapier.com) OPPure Make (https://make.com)

## Opzione 1: Integrazione con Zapier (consigliata per semplicità)

### Passo 1: Creare lo Zap in Zapier
1. Accedi a Zapier.com e crea un nuovo Zap
2. **Trigger App**: Cerca e seleziona "Webhooks by Zapier"
3. **Trigger Event**: Scegli "Catch Hook"
4. Copia l'URL del webhook che Zapier ti fornisce (lo servirà al passo 3)

### Passo 2: Configurare Web3Forms per inviare al webhook di Zapier
Web3Forms permette di reindirizzare le submissions a URL personalizzati tramite il parametro `_next`.

**Modifica necessaria nel form** (solo questa volta, poi mai più):
```html
<!-- AGGIUNGI questo campo nascosto al form esistente -->
<input type="hidden" name="_next" value="[URL_WEBHOOK_ZAPIER]">
```

> **Importante**: Questa modifica richiede un singolo edit al file `tools/calcolo-stipendio-netto.html`. Dopo aver fatto questo, non dovrai più toccare il sito.

### Passo 3: Testare il trigger
1. In Zapier, prova a prendere un dato di test facendo una submission reale al form
2. Zapier dovrebbe ricevere i dati (email, ecc.)

### Passo 4: Configurare l'azione Brevo
1. **Action App**: Cerca e seleziona "Brevo" (o "Sendinblue")
2. **Action Event**: Scegli "Create/Update Contact"
3. Connetti il tuo account Brevo usando la API Key (la trovi in Brevo → Impostazioni → SMTP & API)
4. Mappa i campi:
   - Email: `{{email}}` (dal Webhook di Zapier)
   - Attributi opzionali: puoi aggiungere nomi liste, tag, ecc.
5. Specifica a quale lista Brevo aggiungere il contatto (es. "Lead Calcolatore Stipendio")

### Passo 5: Attivare lo Zap
- Attiva lo Zap
- Fai un test finale facendo una submission reale al form
- Verifica che il contatto appaia nella lista Brevo correttamente

## Opzione 2: Integrazione con Make (ex Integromat) - alternativa potente
Se preferisci Make, il processo è simile:
1. Crea uno scenario in Make
2. Modulo 1: Webhook personalizzato (copia l'URL)
3. Modulo 2: Brevo - Crea/Aggiorna contatto
4. Mappa i campi dallo webhook a Brevo
5. Aggiorna il form Web3Forms aggiungendo `<input type="hidden" name="_next" value="[URL_WEBHOOK_MAKE]">`
6. Attiva lo scenario

## Verifica senza modificare il sito (metodo sicuro)
Se vuoi evitare anche la singola modifica al `_next` field, puoi usare questo approccio:

### Usare la funzionalità di redirect di Web3Forms
Web3Forms permette di impostare un URL di redirect di default nelle impostazioni del tuo account:
1. Accedi a https://web3forms.com/
2. Vai sulle impostazioni del tuo form (quello collegato a soldichiari.com)
3. Cerca "Redirect URL" o "Thank You URL"
4. Impostalo su un URL di Zapier/Make webhook
5. **Questo non richiede modifiche al codice!**

Tuttavia, questo metodo reindirizza l'utente dopo la submission, il quale potrebbe vedere una pagina bianca o un errore se l'URL non restituisce contenuto. Per evitarlo:

### Soluzione consigliata: Usare entrambi i metodi
1. Mantieni il form così com'è (invia a Web3Forms normalmente)
2. In Web3Forms, attiva l'inoltro via email a te stesso (per backup)
3. Usa Zapier/Make con il metodo del webhook di risposta (più avanzato, ma senza reindirizzamento)

In alternativa, la maggior parte degli utenti trova accettabile il reindirizzamento a una pagina di ringraziamento semplice che poi redirecta indietro dopo pochi secondi.

## Passi successivi dopo l'integrazione
1. In Brevo, crea una lista specifica per i lead del calcolatore stipendio
2. Configura un'email di benvenuto automatica (double opt-in consigliato)
3. Prepara la guida "Busta paga senza misteri" da inviare automaticamente dopo l'iscrizione
4. Monitora il flusso: Web3Forms → Zapier/Make → Brevo → Sequenza email

## Risoluzione problemi comuni
- **I lead non arrivano in Brevo**: Controlla la cronologia di Zapier/Make per vedere se il trigger viene attivato
- **Campi mancanti**: Verifica che i nomi dei campi nel form corrispondano a quelli mappati in Zapier/Make
- **Email duplicate**: In Brevo, attiva la deduplicazione per indirizzo email
- **Spam**: Il campo honeypot già aggiunto dovrebbe ridurre significativamente lo spam

## Note importanti
- Non modificare gli attributi `name` o `id` degli elementi esistenti nel form senza testare accuratamente
- L'attuale configurazione del form è:
  - Input nascosto: `name="email" value="info@soldichiari.com"` (destinatario Web3Forms)
  - Input visibile: `name="user-email" placeholder="tua@email.com"` (email dell'utente)
  - Honeypot: `name="honeypot"` (hidden, antispam)
  - Form: `name="lead-calcolatore"`
- Questa struttura è ottimale per evitare conflitti e funziona bene con gli strumenti di automazione
