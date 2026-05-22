/* =====================================================
   TreasuryWorks — Cookie Consent Script
   ===================================================== */

// Cookie consent is handled in script.js via initCookieBanner()
// This file is loaded as a fallback / modular separation

(function() {
    'use strict';

    // Ensure the CSS for cookie banner is injected if not already in the HTML
    function injectCookieStyles() {
        if (document.getElementById('cookie-consent-styles')) return;
        const style = document.createElement('style');
        style.id = 'cookie-consent-styles';
        style.textContent = `
            .cookie-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: var(--bg-card);
                border-top: 1px solid var(--border);
                padding: 16px 24px;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 16px;
                flex-wrap: wrap;
                box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.4s ease;
            }
            .cookie-banner.hidden { display: none; }
            .cookie-content {
                display: flex;
                align-items: center;
                gap: 16px;
                flex-wrap: wrap;
                max-width: 900px;
                margin: 0 auto;
            }
            .cookie-content p {
                font-size: 0.85rem;
                color: var(--text-secondary);
                max-width: 600px;
                line-height: 1.5;
                margin: 0;
            }
            .cookie-content a { color: var(--orange); }
            .cookie-buttons {
                display: flex;
                gap: 8px;
                flex-shrink: 0;
            }
            .cookie-banner .btn-sm {
                padding: 8px 18px;
                font-size: 0.85rem;
            }
        `;
        document.head.appendChild(style);
    }

    function slideUpCookie() {
        const banner = document.getElementById('cookieBanner');
        if (!banner) return;
        banner.style.transform = 'translateY(100%)';
        setTimeout(() => {
            banner.classList.add('hidden');
            banner.style.transform = '';
        }, 400);
    }

    // Auto-init if functions are not already defined globally
    window.acceptCookies = window.acceptCookies || function() {
        localStorage.setItem('cookie-consent', 'accepted');
        slideUpCookie();
        console.log('[Cookie] Consent accepted ✅');
    };

    window.declineCookies = window.declineCookies || function() {
        localStorage.setItem('cookie-consent', 'declined');
        slideUpCookie();
        console.log('[Cookie] Consent declined ❌');
    };

    function init() {
        injectCookieStyles();
        const consent = localStorage.getItem('cookie-consent');
        const banner = document.getElementById('cookieBanner');
        if (!banner) return;
        if (consent === 'accepted' || consent === 'declined') {
            banner.classList.add('hidden');
        } else {
            banner.classList.remove('hidden');
            // Auto-show after 1 second if not dismissed
            setTimeout(() => {
                banner.classList.remove('hidden');
            }, 1000);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();