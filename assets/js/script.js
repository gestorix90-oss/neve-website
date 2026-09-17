/* =====================================================
   SoldiChiari — JavaScript v3.1 (Polish Pass)
   Navbar, Cookie, FAQ, Scroll Reveal, Counters
   ===================================================== */

(function () {
  'use strict';

  // ===== COOKIE CONSENT =====
  function initCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    if (!banner) return;
    const consent = localStorage.getItem('soldichiari_cookies');
    if (consent === 'accepted') {
      banner.classList.add('hidden');
    } else {
      // Delay appearance slightly for less intrusion
      setTimeout(() => banner.classList.remove('hidden'), 800);
    }
  }

  window.acceptCookies = function () {
    localStorage.setItem('soldichiari_cookies', 'accepted');
    const banner = document.getElementById('cookieBanner');
    if (banner) {
      banner.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
      banner.style.transform = 'translateY(100%)';
      banner.style.opacity = '0';
      setTimeout(() => banner.classList.add('hidden'), 400);
    }
  };

  window.declineCookies = function () {
    localStorage.setItem('soldichiari_cookies', 'declined');
    const banner = document.getElementById('cookieBanner');
    if (banner) {
      banner.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
      banner.style.transform = 'translateY(100%)';
      banner.style.opacity = '0';
      setTimeout(() => banner.classList.add('hidden'), 400);
    }
  };

  // ===== NAVBAR =====
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      if (navMenu) navMenu.classList.toggle('active');
    });
  }

  if (navMenu) {
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  if (navbar) {
    let lastScroll = 0;
    window.addEventListener('scroll', function () {
      var st = window.scrollY || document.documentElement.scrollTop;
      if (st > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      lastScroll = st;
    });
  }

  // ===== SCROLL PROGRESS BAR =====
  var scrollProgress = document.getElementById('scrollProgress');
  if (scrollProgress) {
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight > 0) {
        var progress = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = progress + '%';
      }
    });
  }

  // ===== FAQ ACCORDION =====
  document.querySelectorAll('.faq-header').forEach(function (header) {
    header.addEventListener('click', function () {
      var content = header.nextElementSibling;
      var icon = header.querySelector('.collapse-icon');

      // Close all other FAQs
      document.querySelectorAll('.faq-content.open').forEach(function (openContent) {
        if (openContent !== content) {
          openContent.classList.remove('open');
          openContent.style.maxHeight = '0';
          var prevHeader = openContent.previousElementSibling;
          if (prevHeader) {
            prevHeader.classList.remove('active');
            var prevIcon = prevHeader.querySelector('.collapse-icon');
            if (prevIcon) prevIcon.textContent = '▼';
          }
        }
      });

      // Toggle current
      var isOpen = content.classList.contains('open');

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

  // ===== SCROLL REVEAL (IntersectionObserver) =====
  var scrollAnimated = false;

  function initScrollReveal() {
    var elements = document.querySelectorAll('.fade-up, .fade-left, .fade-right');

    // Set initial states
    elements.forEach(function (el) {
      el.style.opacity = '0';
      if (el.classList.contains('fade-left')) {
        el.style.transform = 'translateX(-30px)';
      } else if (el.classList.contains('fade-right')) {
        el.style.transform = 'translateX(30px)';
      } else {
        el.style.transform = 'translateY(30px)';
      }
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) translateX(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ===== ANIMATED COUNTERS =====
  var countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    document.querySelectorAll('.stat-number, .counter').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      if (isNaN(target)) return;

      var current = 0;
      var increment = Math.max(1, Math.floor(target / 60));
      var timer = setInterval(function () {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = current.toLocaleString();
      }, 30);
    });
  }

  var counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounters();
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  // ===== SMOOTH SCROLL for anchor links =====
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      var targetId = this.getAttribute('href');
      var target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== TOOL CALCULATORS =====

  // Budget 50/30/20
  function calcBudget() {
    var income = parseFloat(document.getElementById('budget-income').value) || 0;
    var needs = (income * 0.5).toFixed(0);
    var wants = (income * 0.3).toFixed(0);
    var savings = (income * 0.2).toFixed(0);

    var el = function (id) { return document.getElementById(id); };
    if (el('needs-amount')) el('needs-amount').textContent = needs + '€';
    if (el('wants-amount')) el('wants-amount').textContent = wants + '€';
    if (el('savings-amount')) el('savings-amount').textContent = savings + '€';

    if (el('needs-bar')) el('needs-bar').style.width = Math.min(100, needs / income * 100) + '%';
    if (el('wants-bar')) el('wants-bar').style.width = Math.min(100, wants / income * 100) + '%';
    if (el('savings-bar')) el('savings-bar').style.width = Math.min(100, savings / income * 100) + '%';

    if (income > 0 && el('budget-tip')) {
      var extra = income * 0.2;
      el('budget-tip').textContent =
        '💡 Con ' + extra.toFixed(0) + '€/mese di risparmio, in 10 anni avresti ' +
        (extra * 120).toLocaleString() + '€ — e con investimenti al 7%, arriveresti a circa ' +
        Math.round(extra * 120 * 1.96).toLocaleString() + '€!';
    }
  }

  // Debt Snowball
  function calcDebt() {
    var total = parseFloat(document.getElementById('debt-total').value) || 0;
    var rate = parseFloat(document.getElementById('debt-rate').value) || 0;
    var monthly = parseFloat(document.getElementById('debt-monthly').value) || 0;

    if (total > 0 && monthly > 0) {
      var months = Math.ceil(total / monthly);
      var totalInterest = (total * rate / 100 / 12 * months).toFixed(0);
      var totalPaid = (total + parseFloat(totalInterest)).toFixed(0);

      var el = function (id) { return document.getElementById(id); };
      if (el('debt-months')) el('debt-months').textContent = months;
      if (el('debt-interest')) el('debt-interest').textContent = parseFloat(totalInterest).toLocaleString() + '€';
      if (el('debt-total-paid')) el('debt-total-paid').textContent = parseFloat(totalPaid).toLocaleString() + '€';
    }
  }

  // Compound Interest
  function calcCompound() {
    var principal = parseFloat(document.getElementById('compound-principal').value) || 0;
    var rate = parseFloat(document.getElementById('compound-rate').value) || 0;
    var years = parseFloat(document.getElementById('compound-years').value) || 0;
    var monthly = parseFloat(document.getElementById('compound-monthly').value) || 0;

    if (principal > 0 || monthly > 0) {
      var r = rate / 100 / 12;
      var n = years * 12;
      var fvPrincipal = principal * Math.pow(1 + r, n);
      var fvMonthly = monthly > 0 ? monthly * ((Math.pow(1 + r, n) - 1) / r) : 0;
      var total = fvPrincipal + fvMonthly;
      var interest = total - principal - monthly * n;

      var el = function (id) { return document.getElementById(id); };
      if (el('compound-total')) el('compound-total').textContent = Math.round(total).toLocaleString() + '€';
      if (el('compound-interest')) el('compound-interest').textContent = Math.round(interest).toLocaleString() + '€';
      if (el('compound-gain')) el('compound-gain').textContent = ((total / (principal + monthly * n) - 1) * 100).toFixed(1) + '%';

      // Build chart
      var ctx = document.getElementById('compound-chart');
      if (ctx) {
        ctx.innerHTML = '';
        var w = ctx.offsetWidth || 500;
        var h = 200;
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', h);
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);

        var points = [];
        var current = principal;
        var monthlyR = rate / 100 / 12;
        var maxVal = 0;

        for (var m = 0; m <= n; m += Math.max(1, Math.floor(n / 60))) {
          var val = principal * Math.pow(1 + monthlyR, m) + (monthly > 0 ? monthly * ((Math.pow(1 + monthlyR, m) - 1) / monthlyR) : 0);
          if (val > maxVal) maxVal = val;
          points.push({ x: m / n, y: val });
        }
        if (total > maxVal) maxVal = total;

        var path = '';
        points.forEach(function (p, i) {
          var x = 40 + p.x * (w - 80);
          var y = h - 30 - (p.y / maxVal) * (h - 60);
          path += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
        });

        svg.innerHTML =
          '<defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#f97316" stop-opacity="0.3"/>' +
          '<stop offset="100%" stop-color="#f97316" stop-opacity="0.02"/>' +
          '</linearGradient></defs>' +
          '<polygon points="40,' + (h - 30) + ' ' + path.trim().replace(/M[^M]+$/, '').replace(/L/g, 'L') + ' ' + (w - 40) + ',' + (h - 30) + '" fill="url(#cg)"/>' +
          '<path d="' + path + '" fill="none" stroke="#f97316" stroke-width="2.5"/>' +
          '<line x1="40" y1="' + (h - 30) + '" x2="' + (w - 40) + '" y2="' + (h - 30) + '" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>' +
          '<line x1="40" y1="30" x2="40" y2="' + (h - 30) + '" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>' +
          '<text x="40" y="' + (h - 10) + '" fill="#64748b" font-size="10" font-family="Inter">0</text>' +
          '<text x="' + (w - 40) + '" y="' + (h - 10) + '" fill="#64748b" font-size="10" font-family="Inter">' + years + 'y</text>' +
          '<text x="30" y="25" fill="#64748b" font-size="10" font-family="Inter" text-anchor="end">' + (maxVal / 1000).toFixed(0) + 'k€</text>' +
          '<text x="' + (w - 45) + '" y="25" fill="#f97316" font-size="11" font-family="Inter" font-weight="700" text-anchor="end">' + Math.round(total).toLocaleString() + '€</text>';

        ctx.appendChild(svg);
      }
    }
  }

  // Emergency Fund
  function calcEmergency() {
    var expense = parseFloat(document.getElementById('emergency-expense').value) || 0;
    var months = parseInt(document.getElementById('emergency-months').value) || 3;
    var total = expense * months;
    var monthlySave = expense * 0.2;

    var el = function (id) { return document.getElementById(id); };
    if (el('emergency-total')) el('emergency-total').textContent = total.toLocaleString() + '€';
    if (el('emergency-monthly-text')) el('emergency-monthly-text').textContent = monthlySave.toFixed(0) + '€/mese';
    if (el('emergency-timeline')) el('emergency-timeline').textContent = months + ' mesi';

    var breakdown = document.getElementById('emergency-breakdown');
    if (breakdown) {
      breakdown.innerHTML =
        '<div class="emergency-breakdown-item">🍽️ ' + (monthlySave * 0.4).toFixed(0) + '€ cibo</div>' +
        '<div class="emergency-breakdown-item">🏠 ' + (monthlySave * 0.25).toFixed(0) + '€ casa</div>' +
        '<div class="emergency-breakdown-item">🚗 ' + (monthlySave * 0.2).toFixed(0) + '€ trasporti</div>' +
        '<div class="emergency-breakdown-item">📱 ' + (monthlySave * 0.15).toFixed(0) + '€ altro</div>';
    }
  }

  // Savings Goal
  function calcSavings() {
    var goal = parseFloat(document.getElementById('savings-goal').value) || 0;
    var monthly = parseFloat(document.getElementById('savings-monthly').value) || 0;

    if (goal > 0 && monthly > 0) {
      var months = Math.ceil(goal / monthly);
      var years = Math.floor(months / 12);
      var remMonths = months % 12;

      var el = function (id) { return document.getElementById(id); };
      if (el('savings-timeline-text')) el('savings-timeline-text').textContent = years + ' anni e ' + remMonths + ' mesi';
      if (el('savings-pace')) el('savings-pace').textContent = monthly.toFixed(0) + '€/mese';
      if (el('savings-total-pct')) el('savings-total-pct').textContent = ((monthly * months / goal) * 100).toFixed(0) + '%';

      var timelineCont = document.getElementById('savings-timeline');
      if (timelineCont) {
        timelineCont.innerHTML = '';
        var milestones = [0.25, 0.5, 0.75, 1];
        milestones.forEach(function (milestone) {
          var pct = milestone * 100;
          var monthMark = Math.ceil(months * milestone);
          timelineCont.innerHTML +=
            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">' +
            '<div style="width:12px;height:12px;border-radius:50%;background:' + (milestone === 1 ? 'var(--green)' : 'var(--orange)') + ';flex-shrink:0;"></div>' +
            '<div style="flex:1;height:8px;background:var(--bg-primary);border-radius:4px;overflow:hidden;">' +
            '<div style="width:' + pct + '%;height:100%;background:' + (milestone === 1 ? 'var(--green)' : 'var(--orange)') + ';border-radius:4px;transition:width 0.8s ease;"></div>' +
            '</div>' +
            '<span style="font-size:0.85rem;color:var(--text-muted);min-width:80px;text-align:right;">Mese ' + monthMark + '</span>' +
            '<span style="font-size:0.85rem;font-weight:600;color:var(--text-primary);">€' + Math.round(goal * milestone).toLocaleString() + '</span>' +
            '</div>';
        });
      }
    }
  }

  // Interest Calculator
  function calcInterest() {
    var principal = parseFloat(document.getElementById('interest-principal').value) || 0;
    var rate = parseFloat(document.getElementById('interest-rate').value) || 0;
    var years = parseFloat(document.getElementById('interest-years').value) || 0;

    if (principal > 0 && rate > 0 && years > 0) {
      var finalVal = principal * Math.pow(1 + rate / 100, years);
      var earned = finalVal - principal;
      var effRate = ((Math.pow(1 + rate / 100, years) - 1) * 100).toFixed(1);

      var el = function (id) { return document.getElementById(id); };
      if (el('interest-final')) el('interest-final').textContent = Math.round(finalVal).toLocaleString() + '€';
      if (el('interest-earned')) el('interest-earned').textContent = Math.round(earned).toLocaleString() + '€';
      if (el('interest-eff')) el('interest-eff').textContent = effRate + '%';
      if (el('interest-multiplier')) el('interest-multiplier').textContent = (finalVal / principal).toFixed(2) + 'x';
    }
  }

  // ===== NEWS FILTER =====
  function filterNews(category, btn) {
    var btns = document.querySelectorAll('.filter-btn');
    btns.forEach(function (b) { return b.classList.remove('active'); });
    if (btn) btn.classList.add('active');

    var cards = document.querySelectorAll('.news-card');
    cards.forEach(function (card) {
      if (category === 'tutte' || card.dataset.category === category) {
        card.style.display = 'block';
        setTimeout(function () { card.style.opacity = '1'; }, 50);
      } else {
        card.style.opacity = '0';
        setTimeout(function () { card.style.display = 'none'; }, 300);
      }
    });
  }

  // ===== NEWSLETTER =====
  var newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = newsletterForm.querySelector('input').value;
      if (email) {
        alert('Grazie per l\'iscrizione! 🎉 Ti terremo aggiornato sulle novità di SoldiChiari.');
        newsletterForm.reset();
      }
    });
  }

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', function () {
    initCookieBanner();
    initScrollReveal();

    // Counter observer
    document.querySelectorAll('.stat-number, .counter').forEach(function (el) {
      counterObserver.observe(el);
    });
  });

  // Expose for global use
  window.calcBudget = calcBudget;
  window.calcDebt = calcDebt;
  window.calcCompound = calcCompound;
  window.calcEmergency = calcEmergency;
  window.calcSavings = calcSavings;
  window.calcInterest = calcInterest;
  window.filterNews = filterNews;
})();

console.log('SoldiChiari v3.1 — Sistema attivo ✅');