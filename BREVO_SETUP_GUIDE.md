# Guida alla Configurazione di Brevo per SoldiChiari

## 1. Creazione Account Brevo
- Vai su [brevo.com](https://www.brevo.com/)
- Crea un account gratuito (fino a 300 email/giorno)
- Durante la registrazione, usa l'email info@soldichiari.com

## 2. Verifica Dominio in Brevo
Dopo aver creato l'account, vai su:
**Impostazioni → Posta → Domini**

Aggiungi il dominio: `soldichiari.com`

Brevo ti fornirà i record DNS da aggiungere. Ecco quelli standard:

### Record SPF (TXT record)
- **Tipo**: TXT
- **Host**: @ (o lasciato vuoto a seconda dell'interfaccia di Porkbun)
- **Valore**: `v=spf1 include:_spf.porkbun.com include:sendinblue.com ~all`
- **TTL**: 3600 (o default)

> Nota: Se hai già un record SPF, modificalo aggiungendo `include:sendinblue.com` prima del `~all`
> Esempio attuale: `v=spf1 include:_spf.porkbun.com ~all`
> Nuovo valore: `v=spf1 include:_spf.porkbun.com include:sendinblue.com ~all`

### Record DKIM (CNAME records)
Brevo richiede solitamente due record CNAME:

**Record 1:**
- **Tipo**: CNAME
- **Host**: `brevo1._domainkey`
- **Valore**: `dkim.sendinblue.com`
- **TTL**: 3600

**Record 2:**
- **Tipo**: CNAME
- **Host**: `brevo2._domainkey`
- **Valore**: `dkim2.sendinblue.com`
- **TTL**: 3600

> Alcune versioni di Brevo usano un singolo selector. Se non sei sicuro, inizia con questi due.

### Record DMARC (TXT record)
Hai già un record DMARC configurato:
- **Host**: `_dmarc`
- **Valore**: `v=DMARC1; p=quarantine; rua=mailto:25f8c5e6@mxtoolbox.dmarc-report.com; ruf=mailto:25f8c5e6@forensics.dmarc-report.com; fo=1`
- Puoi lasciarlo così com'è, oppure modificare gli indirizzi di raporto se preferisci ricevere i rapporti direttamente.

## 3. Verifica in Brevo
Dopo aver aggiunto i record DNS:
1. Attendi 5-30 minuti per la propagazione (a volte fino a 2 ore)
2. In Brevo, clicca su "Verifica" accanto al dominio
3. Brevo controllerà SPF, DKIM e DMARC
4. Una volta verificato, puoi iniziare a inviare email

## 4. Connessione con i Form Esistenti
Hai due forme attive per la cattura lead:
1. **tools/calcolo-stipendio-netto.html** - già configurato per Web3Forms (email fixato)
2. **risorse.html** - attualmente configurato per Netlify Forms (non funzionante)

### Opzione A: Continua con Web3Forms + Zapier/Make
- Mantieni entrambi i form collegati a Web3Forms
- Usa Zapier o Make (ex Integromat) per:
  - Trigger: Nuova submission in Web3Forms
  - Action: Aggiungi contatto a Brevo lista specifica
- Vantaggio: Non devi modificare i form, funziona immediatamente

### Opzione B: Passa direttamente a Brevo Forms
- Sostituisci gli attributi Netlify/Web3Forms con quelli di Brevo
- Brevo fornisce snippet di codice per forme embeddable
- Vantaggio: Integrazione più diretta, meno punti di fallimento

### Opzione C: Web3Forms → Brevo API (avanzato)
- Configura Web3Forms per inviare i dati a un webhook personalizzato
- Il webhook chiama l'API di Brevo per aggiungere il contatto
- Richiede un piccolo server o funzione (es. Vercel, Netlify Functions)

## 5. Prossimi Passi Dopo la Verifica
1. Crea una lista in Brevo chiamata "Lead Calcolatore Stipendio" o simile
2. Configura un'email di benvenuto automatica (double opt-in consigliato)
3. Prepara la guida "Busta paga senza misteri" da inviare automaticamente
4. Monitora le consegne e le aperture

## Note Importanti
- **Non modificare i record MX**: quelli puntano a `fwd1.porkbun.com` e `fwd2.porkbun.com` e sono responsabili del forwarding di info@soldichiari.com → gestorno90@gmail.com
- La propagazione DNS può richiedere fino a 2 ore; pianifica di conseguenza
- Dopo la verifica, invia un'email di test da Brevo a un indirizzo esterno per controllare che SPF/DKIM passino
- Puoi usare strumenti come [Mail-Tester.com](https://www.mail-tester.com/) o [MXToolbox](https://mxtoolbox.com/) per verificare
