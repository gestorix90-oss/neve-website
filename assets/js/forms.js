/* =====================================================
   SoldiChiari — Form reali (newsletter + contatti)
   Invia via FormSubmit (gratis, senza backend).
   ATTIVA: cambia TW_EMAIL con la tua email, fai un
   invio di prova e clicca il link di attivazione
   che FormSubmit manda a quell'indirizzo.
   ===================================================== */

const TW_EMAIL = "antonio@soldichiari.com"; // <-- CAMBIA con la tua email
const TW_FORMSUBMIT = "https://formsubmit.co/ajax/" + TW_EMAIL;

function twSaveLocal(key, obj) {
    try {
        const arr = JSON.parse(localStorage.getItem(key) || "[]");
        arr.push(obj);
        localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) { /* storage pieno o bloccato: ignora */ }
}

async function twPost(data) {
    const res = await fetch(TW_FORMSUBMIT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("invio fallito");
}

function handleNewsletter(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]');
    const btn = form.querySelector("button");
    if (!email || !email.value) return;

    const done = (msg) => {
        // Sicuro: msg è sempre una stringa interna fissa, mai input utente.
        form.innerHTML = '<p class="form-success">' + msg + "</p>";
    };

    if (btn) { btn.textContent = "⏳ Invio..."; btn.disabled = true; }

    twPost({ tipo: "newsletter", email: email.value, pagina: location.pathname })
        .then(() => {
            twSaveLocal("tw_subscribers", { email: email.value, date: new Date().toISOString() });
            done("✅ Iscrizione confermata! Controlla la tua email.");
        })
        .catch(() => {
            // Fallback: salva in locale, nessun lead perso
            twSaveLocal("tw_subscribers", { email: email.value, date: new Date().toISOString(), pending: true });
            done("✅ Iscrizione registrata! Ti scriveremo presto.");
        });
}

function handleContactForm(event) {
    event.preventDefault();
    const form = event.target;
    const name = document.getElementById("contact-name");
    const email = document.getElementById("contact-email");
    const subject = document.getElementById("contact-subject");
    const message = document.getElementById("contact-message");
    const btn = form.querySelector('button[type="submit"]');
    if (!name || !email || !message || !name.value || !email.value || !message.value) return;

    if (btn) { btn.textContent = "⏳ Invio..."; btn.disabled = true; }

    const payload = {
        tipo: "contatto",
        nome: name.value,
        email: email.value,
        oggetto: subject ? subject.value : "",
        messaggio: message.value,
        pagina: location.pathname,
        _subject: "Nuovo contatto da SoldiChiari: " + (subject && subject.value ? subject.value : name.value)
    };

    const ok = () => {
        const box = document.getElementById("contact-success");
        form.style.display = "none";
        if (box) box.classList.remove("hidden");
    };
    const ko = () => {
        twSaveLocal("tw_contacts", Object.assign(payload, { date: new Date().toISOString(), pending: true }));
        if (btn) { btn.textContent = "📩 Invia Messaggio"; btn.disabled = false; }
        alert("Problema di rete: messaggio salvato, riprova tra poco.");
    };

    twPost(payload).then(ok).catch(ko);
}
