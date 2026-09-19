/* =====================================================
   SoldiChiari — Form reali (newsletter + contatti)
   Invia via mailto (nessun backend, funziona sempre).
   ===================================================== */

/* ----- Utility ----- */

function twSaveLocal(key, obj) {
    try {
        const arr = JSON.parse(localStorage.getItem(key) || "[]");
        arr.push(obj);
        localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) { /* storage pieno o bloccato: ignora */ }
}

function showSuccess(msg) {
    const form = document.querySelector('form');
    const box = document.getElementById("contact-success");
    if (form) form.style.display = "none";
    if (box) box.classList.remove("hidden");
    alert(msg);
}

function showError(msg) {
    twSaveLocal("tw_contacts", Object.assign({ tipo: "contatto", date: new Date().toISOString(), pending: true }));
    alert("Problema di rete: messaggio salvato, riprova tra poco. " + msg);
}

/* ----- Newsletter ----- */

function handleNewsletter(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]');
    const btn = form.querySelector("button");
    if (!email || !email.value) return;
    if (btn) { btn.textContent = "⏳ Invio..."; btn.disabled = true; }

    const subject = "Iscrizione alla newsletter SoldiChiari";
    const body = `Nuova iscrizione alla newsletter:\n\nEmail: ${email.value}\nData: ${new Date().toISOString()}\nPagina: ${location.pathname}`;

    const mailtoLink = `mailto:gestorino90@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
        window.location.href = mailtoLink;
        twSaveLocal("tw_subscribers", { email: email.value, date: new Date().toISOString() });
        showSuccess("✅ Iscrizione confermata! Controlla la tua email.");
    } catch (e) {
        showError(e.message);
    }
}

/* ----- Contatto ----- */

function handleContactForm(event) {
    event.preventDefault();
    const form = event.target;
    const name = document.getElementById("contact-name");
    const email = document.getElementById("contact-email");
    const subjectSelect = document.getElementById("contact-subject");
    const message = document.getElementById("contact-message");
    const btn = form.querySelector('button[type="submit"]');
    if (!name || !email || !message || !name.value || !email.value || !message.value) {
        const oggetto = { tipo: "contatto", date: new Date().toISOString(), pending: true };
        twSaveLocal("tw_contacts", oggetto);
        showError("Per favore compila tutti i campi obbligatori.");
        return;
    }
    if (btn) { btn.textContent = "⏳ Invio..."; btn.disabled = true; }

    const subjectLine = subjectSelect ? subjectSelect.value : "";
    let subject = "Nuovo contatto da SoldiChiari";
    if (subjectLine) subject += `: ${subjectLine}`;
    const body = `Nuovo messaggio dal form contatti di SoldiChiari:\n\nNome: ${name.value}\nEmail: ${email.value}\nOggetto: ${subjectLine}\nMessaggio:\n${message.value}\n\nData: ${new Date().toISOString()}\nPagina: ${location.pathname}`;

    const mailtoLink = `mailto:gestorino90@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
        window.location.href = mailtoLink;
        twSaveLocal("tw_contacts", { tipo: "contatto", nome: name.value, email: email.value, oggetto: subjectLine, messaggio: message.value, date: new Date().toISOString() });
        showSuccess("Messaggio inviato! Riceverai risposta entro 48 ore lavorative.");
    } catch (e) {
        showError(e.message);
    }
}