/* =====================================================
   TreasuryWorks — Cookie Consent
   ===================================================== */

(function() {
    const COOKIE_NAME = 'treasuryworks_cookies';
    const BANNER = document.getElementById('cookieConsent');

    if (!BANNER) return;

    // Check if user already made a choice
    if (getCookie(COOKIE_NAME)) {
        BANNER.classList.remove('show');
        return;
    }

    // Show banner after 1 second
    setTimeout(() => {
        BANNER.classList.add('show');
    }, 1000);

    window.acceptCookies = function() {
        setCookie(COOKIE_NAME, 'accepted', 365);
        BANNER.classList.remove('show');
        console.log('[TreasuryWorks] Cookie accettati');
    };

    window.declineCookies = function() {
        setCookie(COOKIE_NAME, 'declined', 365);
        BANNER.classList.remove('show');
        console.log('[TreasuryWorks] Cookie rifiutati');
    };

    function setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
    }

    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }
})();