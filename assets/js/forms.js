/* =====================================================
   SoldiChiari — Form (newsletter + contatti)
   Web3Forms via fetch + fallback mailto. Storage-safe.
   ===================================================== */

const WEB3FORMS_KEY = "4bb94a3f-065b-45dc-b7bb-21606113ce02";
const CONTACT_EMAIL = "gestorino90@gmail.com";

function twSaveLocal(key, obj) {
    try {
        const arr = JSON.parse(localStorage.getItem(key) || "[]");
        arr.push(obj);
        localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) { /* storage bloccato: ignora */ }
}

function showSuccess(msg) {
    const form = document.querySelector("form.contact-form");
    const box = document.getElementById("contact-success");
    if (form) form.style.display = "none";
    if (box) box.classList.remove("hidden");
    if (msg) alert(msg);
}

async function submitWeb3Forms(payload) {
    const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.assign({ access_key: WEB3FORMS_KEY }, payload))
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "web3forms error");
    return data;
}

function mailtoFallback(subject, body) {
    window.location.href = "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    twSaveLocal("tw_contacts", { tipo: "fallback_mailto", subject: subject, date: new Date().toISOString(), pending: true });
}

/* ----- Contatto ----- */

async function handleContactForm(event) {
    event.preventDefault();
    const form = event.target;
    const name = document.getElementById("contact-name");
    const email = document.getElementById("contact-email");
    const subjectSel = document.getElementById("contact-subject");
    const message = document.getElementById("contact-message");
    const btn = form.querySelector('button[type="submit"]');
    if (!name || !email || !message || !name.value || !email.value || !message.value) {
        alert("Compila tutti i campi obbligatori.");
        return;
    }
    if (btn) { btn.textContent = "⏳ Invio..."; btn.disabled = true; }

    const payload = {
        nome: name.value,
        email: email.value,
        oggetto: subjectSel ? subjectSel.value : "Contatto",
        messaggio: message.value,
        pagina: location.pathname
    };

    try {
        await submitWeb3Forms(payload);
        twSaveLocal("tw_contacts", Object.assign({ tipo: "contatto", date: new Date().toISOString() }, payload));
        showSuccess("Messaggio inviato! Riceverai risposta entro 48 ore lavorative.");
    } catch (e) {
        const subj = "Contatto da " + name.value + ": " + (subjectSel ? subjectSel.value : "");
        const body = "Nome: " + name.value + "\nEmail: " + email.value +
            "\nOggetto: " + (subjectSel ? subjectSel.value : "") + "\n\n" + message.value;
        mailtoFallback(subj, body);
        alert("Invio online non riuscito (rete). Si apre la tua email per completare l'invio.");
    } finally {
        if (btn) { btn.textContent = "📩 Invia messaggio"; btn.disabled = false; }
    }
}

/* ----- Newsletter ----- */

async function handleNewsletter(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]') || form.querySelector('input');
    const btn = form.querySelector("button");
    if (!email || !email.value) { alert("Inserisci la tua email."); return; }
    if (btn) { btn.textContent = "⏳ ..."; btn.disabled = true; }

    try {
        await submitWeb3Forms({
            subject: "Iscrizione newsletter SoldiChiari",
            email: email.value,
            tipo: "newsletter",
            pagina: location.pathname
        });
        twSaveLocal("tw_subscribers", { email: email.value, date: new Date().toISOString() });
        alert("✅ Iscrizione confermata!");
        form.reset();
    } catch (e) {
        alert("Iscrizione non riuscita ora. Riprova più tardi.");
    } finally {
        if (btn) { btn.textContent = "Iscriviti"; btn.disabled = false; }
    }
}
