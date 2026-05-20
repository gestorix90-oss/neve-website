/* =====================================================
   TreasuryWorks — Strumenti Interattivi JS
   ===================================================== */

// --- Budget Calculator ---
function calcBudget() {
    const income = parseFloat(document.getElementById('income').value) || 0;
    const debt = parseFloat(document.getElementById('debt').value) || 0;
    const netIncome = income - debt;

    if (income <= 0) {
        document.getElementById('resultNeeds').textContent = '—';
        document.getElementById('resultWants').textContent = '—';
        document.getElementById('resultSavings').textContent = '—';
        document.getElementById('resultFree').textContent = '—';
        return;
    }

    const needs = Math.round(netIncome * 0.5);
    const wants = Math.round(netIncome * 0.3);
    const savings = Math.round(netIncome * 0.2);
    const freePercent = Math.round((savings / income) * 100);

    document.getElementById('resultNeeds').textContent = '€' + needs.toLocaleString();
    document.getElementById('resultWants').textContent = '€' + wants.toLocaleString();
    document.getElementById('resultSavings').textContent = '€' + savings.toLocaleString();

    const freeEl = document.getElementById('resultFree');
    freeEl.textContent = freePercent + '%';

    // Color based on savings rate
    if (freePercent >= 20) {
        freeEl.className = 'result-value highlight-green';
    } else if (freePercent >= 10) {
        freeEl.className = 'result-value highlight-blue';
    } else {
        freeEl.className = 'result-value highlight-orange';
    }

    // Animate bars
    const svg = document.querySelector('.growth-chart');
    if (svg) {
        const maxSavings = income * 0.2 * 12;
        const ratio = Math.min(savings / maxSavings, 1);
        const points = generateCurve(ratio);
        svg.querySelector('.growth-line').setAttribute('points', points);
    }
}

function generateCurve(ratio) {
    const points = [];
    for (let i = 0; i <= 10; i++) {
        const x = i * 20;
        const y = 80 - (i * 8 * ratio) - (Math.sin(i * 0.5) * 5 * ratio);
        points.push(`${x},${Math.max(y, 2)}`);
    }
    return points.join(' ');
}

// --- Debt Snowball Calculator ---
function calcDebt() {
    const debt1 = parseFloat(document.getElementById('debt1').value) || 0;
    const rate1 = parseFloat(document.getElementById('rate1').value) || 0;
    const payment1 = parseFloat(document.getElementById('pay1').value) || 0;

    if (debt1 <= 0 || payment1 <= 0) return;

    const monthlyRate = rate1 / 100 / 12;
    let balance = debt1;
    let months = 0;
    let totalPaid = 0;

    while (balance > 0 && months < 360) {
        const interest = balance * monthlyRate;
        balance = balance + interest - payment1;
        totalPaid += payment1;
        months++;
        if (balance < 0) balance = 0;
    }

    document.getElementById('debtResult').innerHTML = `
        <p><strong>⏱️ Mesi necessari:</strong> ${months}</p>
        <p><strong>💶 Totale pagato:</strong> €${totalPaid.toLocaleString()}</p>
        <p><strong>💰 Interessi pagati:</strong> €${(totalPaid - debt1).toLocaleString()}</p>
    `;
}

// --- Compound Interest Calculator ---
function calcCompound() {
    const principal = parseFloat(document.getElementById('principal').value) || 0;
    const rate = parseFloat(document.getElementById('cRate').value) || 0;
    const years = parseFloat(document.getElementById('years').value) || 0;
    const monthlyAdd = parseFloat(document.getElementById('monthlyAdd').value) || 0;

    if (principal <= 0 && monthlyAdd <= 0) return;

    const r = rate / 100 / 12;
    const n = years * 12;
    let total = principal;

    for (let i = 0; i < n; i++) {
        total = total * (1 + r) + monthlyAdd;
    }

    const gain = total - principal - (monthlyAdd * n);
    document.getElementById('compResult').innerHTML = `
        <p><strong>📈 Totale finale:</strong> €${Math.round(total).toLocaleString()}</p>
        <p><strong>💹 Guadagno da interessi:</strong> €${Math.round(gain).toLocaleString()}</p>
        <p><strong>📊 Moltiplicatore:</strong> ${(total / (principal || 1)).toFixed(1)}x</p>
    `;
}

// --- Emergency Fund Calculator ---
function calcEmergency() {
    const expenses = parseFloat(document.getElementById('expenses').value) || 0;

    if (expenses <= 0) return;

    const threeMonths = expenses * 3;
    const sixMonths = expenses * 6;
    const twelveMonths = expenses * 12;

    document.getElementById('emergencyResult').innerHTML = `
        <p><strong>🟡 Sicurezza base (3 mesi):</strong> €${threeMonths.toLocaleString()}</p>
        <p><strong>🟢 Comfort (6 mesi):</strong> €${sixMonths.toLocaleString()}</p>
        <p><strong>🟢🟢 Massima tranquillità (12 mesi):</strong> €${twelveMonths.toLocaleString()}</p>
    `;
}

// --- Tool Open/Close ---
function openTool(toolName) {
    // Close all tool panels
    document.querySelectorAll('.tool-panel').forEach(p => {
        p.style.display = 'none';
    });

    // Show selected tool panel
    const panel = document.getElementById(toolName + '-panel');
    if (panel) {
        panel.style.display = 'block';
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Trigger animations
        setTimeout(() => {
            panel.querySelectorAll('.anim-trigger').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }, 100);
    }
}

// --- Animate numbers on load ---
function animateValue(element, start, end, duration) {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * eased);
        element.textContent = current.toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    // Animate stat numbers
    document.querySelectorAll('.stat-number').forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        animateValue(counter, 0, target, 2000);
    });

    // Set current year in footer
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});