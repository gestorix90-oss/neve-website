/* =====================================================
   SoldiChiari — Form reali (newsletter + contatti)
   Invia via Web3Forms (gratis, senza backend, chiave nell'HTML).
   ===================================================== */

const WEB3FORMS_ACCESS_KEY = "4bb94a3f-065b-45dc-b7bb-21606113ce02";
const TW_EMAIL = "gestorino90@gmail.com"; // <-- LA TUA EMAIL VERA QUI (Gmail funziona meglio)

// L'access key è già nel form HTML come campo nascosto:
// <input type="hidden" name="access_key" value="4bb94a3f-065b-45dc-b7bb-21606113ce02">

/* ----- Newsletter ----- */

function twSaveLocal(key, obj) {
    try {
        const arr = JSON.parse(localStorage.getItem(key) || "[]");
        arr.push(obj);
        localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) { /* storage pieno o bloccato: ignora */ }
}

async function twPost(data, options = {}) {
    // Di default usa Web3Forms; passa useFormsSubmit:true per FormSubmit
    const endpoint = options.useFormsSubmit ? "https://formsubmit.co/ajax/" + TW_EMAIL : "https://api.web3forms.com/submit";
    const body = { access_key: options.access_key || WEB3FORMS_ACCESS_KEY, ...data };
    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("invio fallito");
    return await res.json();
}

function done(msg) {
    const form = document.querySelector('form');
    const box = document.getElementById("contact-success");
    if (form) form.style.display = "none";
    if (box) box.classList.remove("hidden");
    alert(msg);
}

function ko(error) {
    twSaveLocal("tw_contacts", Object.assign({ tipo: "contatto", date: new Date().toISOString(), pending: true }, arguments.length > 1 ? arguments[1] : {}));
    alert("Problema di rete: messaggio salvato, riprova tra poco. " + error);
}

/* ----- Newsletter ----- */

function handleNewsletter(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]');
    const btn = form.querySelector("button");
    if (!email || !email.value) return;
    if (btn) { btn.textContent = "⏳ Invio..."; btn.disabled = true; }
    twPost({ tipo: "newsletter", email: email.value, pagina: location.pathname, access_key: WEB3FORMS_ACCESS_KEY })
        .then(() => {
            twSaveLocal("tw_subscribers", { email: email.value, date: new Date().toISOString() });
            done("✅ Iscrizione confermata! Controlla la tua email.");
        })
        .catch(() => {
            twSaveLocal("tw_subscribers", { email: email.value, date: new Date().toISOString(), pending: true });
            done("✅ Iscrizione registrata! Ti scriveremo presto.");
        });
}

/* ----- Contatto ----- */

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

    // Il form HTML già ha <input type="hidden" name="access_key" ...>
    // Inviamo solo i campi visibili; Web3Forms leggerà l'access key dal form.
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
    const koLocal = () => {
        twSaveLocal("tw_contacts", Object.assign(payload, { date: new Date().toISOString(), pending: true }));
        if (btn) { btn.textContent = "📩 Invia Messaggio"; btn.disabled = false; }
        alert("Problema di rete: messaggio salvato, riprova tra poco.");
    };
    twPost(payload, { useFormsSubmit: false }).then(ok).catch(koLocal);
}