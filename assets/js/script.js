/* =====================================================
   TreasuryWorks — JavaScript Principale v2.1
   Funzionalità: Navbar, Cookie, FAQ, Scroll, Particles
   ===================================================== */

// ===== COOKIE CONSENT =====
document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('cookie-banner');
    if (localStorage.getItem('treasuryworks_cookies') === 'accepted') {
        if (banner) banner.classList.add('hidden');
    } else {
        if (banner) banner.classList.remove('hidden');
    }
});

function acceptCookies() {
    localStorage.setItem('treasuryworks_cookies', 'accepted');
    const banner = document.getElementById('cookie-banner');
    if (banner) {
        banner.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        banner.style.transform = 'translateY(100%)';
        banner.style.opacity = '0';
        setTimeout(() => banner.classList.add('hidden'), 400);
    }
}

function closeCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
        banner.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        banner.style.transform = 'translateY(100%)';
        banner.style.opacity = '0';
        setTimeout(() => banner.classList.add('hidden'), 400);
    }
}

// ===== NAVBAR =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        if (navMenu) navMenu.classList.toggle('active');
    });
}

// Close mobile menu on link click
if (navMenu) {
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Navbar scroll effect
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ===== SCROLL PROGRESS BAR =====
const scrollProgress = document.getElementById('scrollProgress');
if (scrollProgress) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = progress + '%';
    });
}

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-header').forEach(header => {
    header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const icon = header.querySelector('.collapse-icon');

        // Close all other FAQs
        document.querySelectorAll('.faq-content.open').forEach(openContent => {
            if (openContent !== content) {
                openContent.classList.remove('open');
                openContent.style.maxHeight = '0';
                const prevHeader = openContent.previousElementSibling;
                if (prevHeader) {
                    prevHeader.classList.remove('active');
                    const prevIcon = prevHeader.querySelector('.collapse-icon');
                    if (prevIcon) prevIcon.textContent = '▼';
                }
            }
        });

        // Toggle current
        const isOpen = content.classList.contains('open');

        if (isOpen) {
            content.classList.remove('open');
            content.style.maxHeight = '0';
            header.classList.remove('active');
            if (icon) icon.textContent = '▼';
        } else {
            content.classList.add('open');
            content.style.maxHeight = content.scrollHeight + 'px';
            header.classList.add('active');
            if (icon) icon.textContent = '▲';
        }
    });
});

// ===== HERO PARTICLES (Canvas-based) =====
function initParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const existingCanvas = hero.querySelector('.particles-canvas');
    if (existingCanvas) existingCanvas.remove();

    const canvas = document.createElement('canvas');
    canvas.className = 'particles-canvas';
    canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;';
    hero.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 100;
            this.size = Math.random() * 3 + 1;
            this.speedY = -(Math.random() * 0.5 + 0.2);
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.3 + 0.1;
            this.color = ['249,115,22', '59,130,246', '16,185,129'][Math.floor(Math.random() * 3)];
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            if (this.y < -20) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 30; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
}
initParticles();

// ===== SCROLL REVEAL ANIMATION =====
function revealOnScroll() {
    const elements = document.querySelectorAll('.fade-up, .fade-left, .fade-right');
    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    });
}

// Apply fade class styles
const style = document.createElement('style');
style.textContent = `
    .fade-up, .fade-left, .fade-right {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .fade-left { transform: translateX(-30px); }
    .fade-right { transform: translateX(30px); }
    .hero-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 1; }
`;
document.head.appendChild(style);

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ===== TOOL CALCULATORS =====

// Budget 50/30/20
function calcBudget() {
    const income = parseFloat(document.getElementById('budget-income').value) || 0;
    const needs = (income * 0.5).toFixed(0);
    const wants = (income * 0.3).toFixed(0);
    const savings = (income * 0.2).toFixed(0);

    document.getElementById('needs-amount').textContent = needs + '€';
    document.getElementById('wants-amount').textContent = wants + '€';
    document.getElementById('savings-amount').textContent = savings + '€';

    document.getElementById('needs-bar').style.width = Math.min(100, needs / income * 100) + '%';
    document.getElementById('wants-bar').style.width = Math.min(100, wants / income * 100) + '%';
    document.getElementById('savings-bar').style.width = Math.min(100, savings / income * 100) + '%';

    if (income > 0) {
        const tip = document.getElementById('budget-tip');
        if (tip) {
            const extra = income * 0.2;
            tip.textContent = '💡 Con ' + extra.toFixed(0) + '€/mese di risparmio, in 10 anni avresti ' + (extra * 120).toLocaleString() + '€ — e con investimenti al 7%, arriveresti a circa ' + Math.round(extra * 120 * 1.96).toLocaleString() + '€!';
        }
    }
}

// Debt Snowball
function calcDebt() {
    const total = parseFloat(document.getElementById('debt-total').value) || 0;
    const rate = parseFloat(document.getElementById('debt-rate').value) || 0;
    const monthly = parseFloat(document.getElementById('debt-monthly').value) || 0;

    if (total > 0 && monthly > 0) {
        const months = Math.ceil(total / monthly);
        const totalInterest = (total * rate / 100 / 12 * months).toFixed(0);
        const totalPaid = (total + parseFloat(totalInterest)).toFixed(0);

        document.getElementById('debt-months').textContent = months;
        document.getElementById('debt-interest').textContent = parseFloat(totalInterest).toLocaleString() + '€';
        document.getElementById('debt-total-paid').textContent = parseFloat(totalPaid).toLocaleString() + '€';
    }
}

// Compound Interest
function calcCompound() {
    const principal = parseFloat(document.getElementById('compound-principal').value) || 0;
    const rate = parseFloat(document.getElementById('compound-rate').value) || 0;
    const years = parseFloat(document.getElementById('compound-years').value) || 0;
    const monthly = parseFloat(document.getElementById('compound-monthly').value) || 0;

    if (principal > 0 || monthly > 0) {
        const r = rate / 100 / 12;
        const n = years * 12;
        // FV = P(1+r)^n + PMT * [((1+r)^n - 1) / r]
        const fvPrincipal = principal * Math.pow(1 + r, n);
        const fvMonthly = monthly > 0 ? monthly * ((Math.pow(1 + r, n) - 1) / r) : 0;
        const total = fvPrincipal + fvMonthly;
        const interest = total - principal - (monthly * n);

        document.getElementById('compound-total').textContent = Math.round(total).toLocaleString() + '€';
        document.getElementById('compound-interest').textContent = Math.round(interest).toLocaleString() + '€';
        document.getElementById('compound-gain').textContent = ((total / (principal + monthly * n) - 1) * 100).toFixed(1) + '%';

        // Chart
        const ctx = document.getElementById('compound-chart');
        if (ctx) {
            ctx.innerHTML = '';
            const w = ctx.offsetWidth || 500;
            const h = 200;
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', h);
            svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

            const points = [];
            let current = principal;
            const monthlyR = rate / 100 / 12;
            let maxVal = 0;

            for (let m = 0; m <= n; m += Math.max(1, Math.floor(n / 60))) {
                const val = principal * Math.pow(1 + monthlyR, m) + (monthly > 0 ? monthly * ((Math.pow(1 + monthlyR, m) - 1) / monthlyR) : 0);
                if (val > maxVal) maxVal = val;
                points.push({ x: m / n, y: val });
            }
            if (total > maxVal) maxVal = total;

            let path = '';
            points.forEach((p, i) => {
                const x = 40 + p.x * (w - 80);
                const y = h - 30 - (p.y / maxVal) * (h - 60);
                path += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
            });

            svg.innerHTML = `
                <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#f97316" stop-opacity="0.3"/>
                        <stop offset="100%" stop-color="#f97316" stop-opacity="0.02"/>
                    </linearGradient>
                </defs>
                <polygon points="40,${h - 30} ${path.trim().replace(/M[^M]+$/, '').replace(/L/g, 'L')} ${w - 40},${h - 30}" fill="url(#cg)"/>
                <path d="${path}" fill="none" stroke="#f97316" stroke-width="2.5"/>
                <line x1="40" y1="${h - 30}" x2="${w - 40}" y2="${h - 30}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                <line x1="40" y1="30" x2="40" y2="${h - 30}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                <text x="40" y="${h - 10}" fill="#64748b" font-size="10" font-family="Inter">0</text>
                <text x="${w - 40}" y="${h - 10}" fill="#64748b" font-size="10" font-family="Inter">${years}y</text>
                <text x="30" y="25" fill="#64748b" font-size="10" font-family="Inter" text-anchor="end">${(maxVal / 1000).toFixed(0)}k€</text>
                <text x="${w - 45}" y="25" fill="#f97316" font-size="11" font-family="Inter" font-weight="700" text-anchor="end">${Math.round(total).toLocaleString()}€</text>
            `;
            ctx.appendChild(svg);
        }
    }
}

// Emergency Fund
function calcEmergency() {
    const expense = parseFloat(document.getElementById('emergency-expense').value) || 0;
    const months = parseInt(document.getElementById('emergency-months').value) || 3;
    const total = expense * months;
    const monthlySave = expense * 0.2;
    const weeks = Math.ceil(monthlySave / 50);

    document.getElementById('emergency-total').textContent = total.toLocaleString() + '€';
    document.getElementById('emergency-monthly-text').textContent = monthlySave.toFixed(0) + '€/mese';
    document.getElementById('emergency-timeline').textContent = months + ' mesi';

    const breakdown = document.getElementById('emergency-breakdown');
    if (breakdown) {
        breakdown.innerHTML = `
            <div class="emergency-breakdown-item">🍽️ ${(monthlySave * 0.4).toFixed(0)}€ cibo</div>
            <div class="emergency-breakdown-item">🏠 ${(monthlySave * 0.25).toFixed(0)}€ casa</div>
            <div class="emergency-breakdown-item">🚗 ${(monthlySave * 0.2).toFixed(0)}€ trasporti</div>
            <div class="emergency-breakdown-item">📱 ${(monthlySave * 0.15).toFixed(0)}€ altro</div>
        `;
    }
}

// Savings Goal
function calcSavings() {
    const goal = parseFloat(document.getElementById('savings-goal').value) || 0;
    const monthly = parseFloat(document.getElementById('savings-monthly').value) || 0;

    if (goal > 0 && monthly > 0) {
        const months = Math.ceil(goal / monthly);
        const years = Math.floor(months / 12);
        const remMonths = months % 12;

        document.getElementById('savings-timeline-text').textContent = years + ' anni e ' + remMonths + ' mesi';
        document.getElementById('savings-pace').textContent = monthly.toFixed(0) + '€/mese';
        document.getElementById('savings-total-pct').textContent = ((monthly * months / goal) * 100).toFixed(0) + '%';

        // Timeline visualization
        const timelineCont = document.getElementById('savings-timeline');
        if (timelineCont) {
            timelineCont.innerHTML = '';
            const milestones = [0.25, 0.5, 0.75, 1];
            milestones.forEach((milestone, i) => {
                const pct = milestone * 100;
                const monthMark = Math.ceil(months * milestone);
                timelineCont.innerHTML += `
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                        <div style="width:12px;height:12px;border-radius:50%;background:${milestone === 1 ? 'var(--green)' : 'var(--orange)'};flex-shrink:0;"></div>
                        <div style="flex:1;height:8px;background:var(--bg-primary);border-radius:4px;overflow:hidden;">
                            <div style="width:${pct}%;height:100%;background:${milestone === 1 ? 'var(--green)' : 'var(--orange)'};border-radius:4px;transition:width 0.8s ease;"></div>
                        </div>
                        <span style="font-size:0.85rem;color:var(--text-muted);min-width:80px;text-align:right;">Mese ${monthMark}</span>
                        <span style="font-size:0.85rem;font-weight:600;color:var(--text-primary);">€${Math.round(goal * milestone).toLocaleString()}</span>
                    </div>
                `;
            });
        }
    }
}

// Interest Calculator
function calcInterest() {
    const principal = parseFloat(document.getElementById('interest-principal').value) || 0;
    const rate = parseFloat(document.getElementById('interest-rate').value) || 0;
    const years = parseFloat(document.getElementById('interest-years').value) || 0;

    if (principal > 0 && rate > 0 && years > 0) {
        const finalVal = principal * Math.pow(1 + rate / 100, years);
        const earned = finalVal - principal;
        const effRate = ((Math.pow(1 + rate / 100, years) - 1) * 100).toFixed(1);

        document.getElementById('interest-final').textContent = Math.round(finalVal).toLocaleString() + '€';
        document.getElementById('interest-earned').textContent = Math.round(earned).toLocaleString() + '€';
        document.getElementById('interest-eff').textContent = effRate + '%';
        document.getElementById('interest-multiplier').textContent = (finalVal / principal).toFixed(2) + 'x';
    }
}

// ===== NEWS FILTER =====
function filterNews(category, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.news-card').forEach(card => {
        if (category === 'tutte' || card.dataset.category === category) {
            card.style.display = 'block';
            setTimeout(() => card.style.opacity = '1', 50);
        } else {
            card.style.opacity = '0';
            setTimeout(() => card.style.display = 'none', 300);
        }
    });
}

// ===== NEWSLETTER =====
function handleNewsletter(e) {
    e.preventDefault();
    const email = e.target.querySelector('input').value;
    if (email) {
        alert('Grazie per l\'iscrizione! 🎉 Ti terremo aggiornato sulle novità di TreasuryWorks.');
        e.target.reset();
    }
}

// ===== SMOOTH SCROLL for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== ANIMATED COUNTERS =====
function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(el => {
        const target = parseInt(el.textContent);
        if (isNaN(target)) return;
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current);
        }, 30);
    });
}

// Trigger counters when in view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.stat-number').forEach(el => observer.observe(el));
});

console.log('TreasuryWorks v2.1 — Sistema attivo ✅');