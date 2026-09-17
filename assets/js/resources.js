/* =====================================================
   SoldiChiari — Resources JavaScript
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Animated counter for ratings
    document.querySelectorAll('.resource-rating').forEach(el => {
        const text = el.textContent;
        const stars = text.match(/⭐/g);
        if (stars) {
            el.innerHTML = text.replace(/⭐/g, '<span class="star">⭐</span>');
        }
    });

    // Newsletter inline handlers
    document.querySelectorAll('.newsletter-inline form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            const btn = form.querySelector('button');

            if (!emailInput || !emailInput.value) return;

            btn.textContent = '⏳ Invio...';
            btn.disabled = true;

            setTimeout(() => {
                const subs = JSON.parse(localStorage.getItem('tw_subs') || '[]');
                if (!subs.find(s => s.email === emailInput.value)) {
                    subs.push({ email: emailInput.value, date: new Date().toISOString() });
                    localStorage.setItem('tw_subs', JSON.stringify(subs));
                }

                form.innerHTML = `
                    <div style="text-align:center; padding:15px; width:100%;">
                        <div style="font-size:2.5rem;">✅</div>
                        <p style="color:var(--orange); font-weight:600; margin-top:8px;">
                            Iscritto! Controlla la tua email.
                        </p>
                    </div>
                `;
            }, 1200);
        });
    });

    // Intersection Observer for fade-in
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.resource-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });

    // Floating newsletter button
    const floatBtn = document.getElementById('newsletterFloat');
    if (floatBtn) {
        let shown = false;
        window.addEventListener('scroll', () => {
            if (!shown && window.scrollY > 800) {
                floatBtn.classList.add('show');
                shown = true;
            }
        });

        floatBtn.addEventListener('click', () => {
            openNewsletter();
        });
    }
});

// Open newsletter modal (shared function)
function openNewsletterRisorse() {
    if (typeof openNewsletter === 'function') {
        openNewsletter();
    } else {
        const modal = document.getElementById('newsletterModal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }
}