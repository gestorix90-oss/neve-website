/* =====================================================
   TreasuryWorks — JavaScript Principale
   ===================================================== */

// --- Navbar scroll effect ---
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// --- Mobile menu toggle ---
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Chiudi menu cliccando un link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// --- Hero particles ---
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 10 + 8) + 's';
        particle.style.animationDelay = (Math.random() * 10) + 's';
        particle.style.opacity = Math.random() * 0.3 + 0.1;

        // Colori: arancio o blu
        particle.style.background = Math.random() > 0.5 ? '#f97316' : '#3b82f6';

        container.appendChild(particle);
    }
}

// --- Hero gear animation (SVG inline) ---
function createHeroGear() {
    const visual = document.getElementById('heroVisual');
    if (!visual) return;

    visual.innerHTML = `
        <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" class="hero-gear-svg">
            <style>
                .gear { animation: rotate 20s linear infinite; transform-origin: center; }
                .gear-inner { animation: rotate 10s linear infinite reverse; transform-origin: center; }
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            </style>
            <!-- Outer gear -->
            <g class="gear" opacity="0.15">
                <path d="M200,50 L215,85 L250,95 L285,85 L300,50 L335,60 L350,95 L380,85 L395,120 L410,155 L395,190 L410,225 L395,260 L380,295 L350,285 L335,320 L300,310 L285,285 L250,295 L215,285 L200,320 L185,285 L150,295 L115,285 L100,320 L65,310 L50,285 L20,295 L35,260 L20,225 L35,190 L20,155 L35,120 L50,95 L80,85 L65,60 L100,50 L115,85 L150,95 L185,85 Z" 
                      fill="none" stroke="#f97316" stroke-width="2"/>
            </g>
            <!-- Inner gear -->
            <g class="gear-inner" opacity="0.25">
                <path d="M200,120 L210,145 L235,152 L260,145 L270,120 L285,125 L295,145 L315,148 L325,130 L340,130 L340,150 L360,145 L365,165 L380,165 L375,185 L395,190 L390,210 L400,220 L400,245 L390,250 L395,270 L375,275 L380,295 L365,295 L360,310 L340,305 L340,325 L325,320 L315,302 L295,305 L285,290 L270,280 L260,300 L235,293 L210,300 L200,275 L190,300 L165,293 L140,300 L130,280 L115,290 L105,305 L85,320 L85,305 L65,305 L60,295 L45,295 L50,275 L30,270 L35,250 L25,245 L25,220 L50,210 L45,190 L65,185 L60,165 L45,165 L50,145 L70,148 L80,130 L95,130 L95,150 L115,145 L120,120 L135,125 L145,145 L165,152 L190,145 Z"
                      fill="none" stroke="#3b82f6" stroke-width="2"/>
            </g>
            <!-- Center circle -->
            <circle cx="200" cy="200" r="60" fill="none" stroke="rgba(249,115,22,0.3)" stroke-width="2"/>
            <circle cx="200" cy="200" r="30" fill="rgba(249,115,22,0.05)" stroke="rgba(249,115,22,0.2)" stroke-width="1"/>
        </svg>
    `;
}

// --- Counter animation for stats ---
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const start = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            counter.textContent = current.toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    });
}

// --- Intersection Observer for scroll animations ---
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.problem-card, .service-card, .blog-card, .process-step').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// --- Newsletter handler ---
function handleNewsletter(e) {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    if (email) {
        // Simulazione — sostituisci con il tuo endpoint reale
        alert('Grazie per l\'iscrizione alla newsletter di TreasuryWorks! 🎉\n\nTi terremo aggiornato sulla psicologia del denaro e le novità dell\'officina.');
        document.getElementById('newsletter-email').value = '';
    }
}

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    createHeroGear();
    setupScrollAnimations();

    // Animate counters only if stats section is in viewport
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statsObserver.observe(statsSection);
    }
});