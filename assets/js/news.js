/* =====================================================
   TreasuryWorks — News JavaScript
   ===================================================== */

// --- Newsletter Modal ---
function openNewsletter() {
    document.getElementById('newsletterModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeNewsletter() {
    document.getElementById('newsletterModal').classList.remove('show');
    document.body.style.overflow = '';
}

// Close modal on outside click
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('newsletterModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeNewsletter();
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeNewsletter();
        });
    }

    // Show newsletter modal after 15 seconds
    setTimeout(() => {
        if (modal && !localStorage.getItem('newsletter_dismissed')) {
            openNewsletter();
        }
    }, 15000);

    // Donut chart animation for featured card
    const donutCharts = document.querySelectorAll('.donut-chart');
    donutCharts.forEach(chart => {
        const percent = chart.getAttribute('data-percent');
        const circle = chart.querySelector('.donut-circle');
        if (circle && percent) {
            const circumference = 2 * Math.PI * 54;
            const offset = circumference - (percent / 100) * circumference;
            circle.style.strokeDasharray = circumference;
            circle.style.strokeDashoffset = circumference;
            setTimeout(() => {
                circle.style.strokeDashoffset = offset;
            }, 500);
        }
    });

    // Intersection Observer for fade-in animations on news cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.news-card, .analysis-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });

    // Add visible class immediately for elements in viewport on load
    setTimeout(() => {
        document.querySelectorAll('.news-card, .analysis-card').forEach(card => {
            const rect = card.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                card.classList.add('visible');
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
    }, 100);
});

// --- Newsletter Subscription ---
function subscribeNewsletter(e) {
    e.preventDefault();

    const email = document.getElementById('newsEmail').value;
    const name = document.getElementById('newsName').value;
    const checkbox = document.querySelector('.checkbox-label input');

    if (!checkbox.checked) {
        alert('Devi accettare la Privacy Policy per iscriverti.');
        return;
    }

    // Simulate subscription (in production, send to backend/API)
    const btn = document.querySelector('#newsletterForm button');
    btn.textContent = '⏳ Invio in corso...';
    btn.disabled = true;

    setTimeout(() => {
        // Store in localStorage
        const subscribers = JSON.parse(localStorage.getItem('treasuryworks_subscribers') || '[]');
        subscribers.push({ email, name, date: new Date().toISOString() });
        localStorage.setItem('treasuryworks_subscribers', JSON.stringify(subscribers));

        // Show success
        const form = document.getElementById('newsletterForm');
        form.innerHTML = `
            <div style="text-align: center; padding: 20px 0;">
                <div style="font-size: 4rem; margin-bottom: 15px;">🎉</div>
                <h4 style="color: var(--orange); margin-bottom: 10px;">Iscritto con successo!</h4>
                <p style="color: var(--text-secondary);">Riceverai presto la prima newsletter. Controlla la tua casella!</p>
            </div>
        `;

        // Dismiss modal after 3 seconds
        setTimeout(() => {
            closeNewsletter();
            localStorage.setItem('newsletter_dismissed', 'true');
        }, 3000);
    }, 1500);
}

// --- Track reading progress for analysis articles ---
function initReadingProgress() {
    const article = document.querySelector('.analysis-card');
    if (!article) return;

    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed; top: 0; left: 0; height: 3px;
        background: linear-gradient(90deg, var(--orange), var(--blue));
        z-index: 9999; transition: width 0.1s ease; width: 0%;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = percent + '%';
    });
}

document.addEventListener('DOMContentLoaded', initReadingProgress);