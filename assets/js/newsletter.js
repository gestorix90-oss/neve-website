/* =====================================================
   SoldiChiari — Newsletter JavaScript
   ===================================================== */

// --- Inline newsletter handler (used on any page with .newsletter-inline) ---
document.addEventListener('DOMContentLoaded', () => {

    // Handle inline newsletter forms
    document.querySelectorAll('.newsletter-inline form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]');
            const btn = form.querySelector('button');

            if (!email || !email.value) return;

            btn.textContent = '⏳ Invio...';
            btn.disabled = true;

            setTimeout(() => {
                // Store subscriber
                const subscribers = JSON.parse(localStorage.getItem('tw_subscribers') || '[]');
                if (!subscribers.find(s => s.email === email.value)) {
                    subscribers.push({
                        email: email.value,
                        date: new Date().toISOString()
                    });
                    localStorage.setItem('tw_subscribers', JSON.stringify(subscribers));
                }

                // Show success message
                form.innerHTML = `
                    <div style="text-align:center; padding:15px;">
                        <div style="font-size:2.5rem;">✅</div>
                        <p style="color:var(--orange); font-weight:600; margin-top:8px;">
                            Iscritto! Controlla la tua email.
                        </p>
                    </div>
                `;
            }, 1200);
        });
    });

    // Floating newsletter trigger (appears after scroll)
    const floatBtn = document.getElementById('newsletterFloat');
    if (floatBtn) {
        let shown = false;
        window.addEventListener('scroll', () => {
            if (!shown && window.scrollY > 600) {
                floatBtn.classList.add('show');
                shown = true;
            }
        });
    }

    // Page-specific newsletter banner (appears at bottom of blog/news pages)
    const banner = document.getElementById('newsletterBanner');
    if (banner) {
        const dismissed = localStorage.getItem('tw_newsletter_banner_dismissed');
        if (!dismissed) {
            banner.style.display = 'block';
        }

        const dismissBtn = banner.querySelector('.dismiss-btn');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                banner.style.display = 'none';
                localStorage.setItem('tw_newsletter_banner_dismissed', 'true');
            });
        }
    }
});