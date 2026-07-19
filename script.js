/* ============================================================
   MUGDHA CATERERS — script.js
   Global site behaviour: nav, reveal, gallery, FAQ, counters.
   ============================================================ */
(function () {
  'use strict';

  /* ── Mobile nav toggle ── */
  var toggle = document.getElementById('navToggle');
  var mobile = document.getElementById('navMobile');
  var nav = document.getElementById('siteNav');

  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      var open = mobile.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobile.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Nav background on scroll ── */
  function updateNavState() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }
  if (nav) {
    updateNavState();
    window.addEventListener('scroll', updateNavState, { passive: true });
  }

  /* ── Active link highlight ── */
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ── Scroll reveal ── */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(function (el) { obs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ── Counter animation (trust bar numbers) ── */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals'), 10) : 0;
    var done = false;
    if (!('IntersectionObserver' in window)) { el.textContent = target + suffix; return; }
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !done) {
          done = true;
          var start = 0;
          var duration = 1400;
          var startTime = null;
          function step(ts) {
            if (!startTime) startTime = ts;
            var progress = Math.min((ts - startTime) / duration, 1);
            var val = start + (target - start) * progress;
            el.textContent = val.toFixed(decimals) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          cObs.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    cObs.observe(el);
  });

  /* ── Gallery slider ── */
  var track = document.getElementById('galleryTrack');
  var prev = document.getElementById('galleryPrev');
  var next = document.getElementById('galleryNext');
  var dotsWrap = document.getElementById('galleryDots');

  if (track) {
    var slides = track.querySelectorAll('.gallery-slide');
    var cur = 0;
    var total = slides.length;

    function perView() {
      return window.innerWidth >= 980 ? 3 : window.innerWidth >= 640 ? 2 : 1;
    }
    function maxIdx() { return Math.max(0, total - perView()); }

    if (dotsWrap) {
      for (var i = 0; i <= maxIdx(); i++) {
        (function (idx) {
          var dot = document.createElement('button');
          dot.className = 'gallery-dot' + (idx === 0 ? ' active' : '');
          dot.setAttribute('aria-label', 'Show slide ' + (idx + 1));
          dot.addEventListener('click', function () { goTo(idx); });
          dotsWrap.appendChild(dot);
        })(i);
      }
    }

    function slideW() {
      if (!slides[0]) return 0;
      return slides[0].getBoundingClientRect().width + 17.6;
    }

    function updateDots() {
      if (!dotsWrap) return;
      dotsWrap.querySelectorAll('.gallery-dot').forEach(function (d, idx) {
        d.classList.toggle('active', idx === cur);
      });
    }

    function goTo(idx) {
      cur = Math.max(0, Math.min(idx, maxIdx()));
      track.style.transform = 'translateX(-' + (cur * slideW()) + 'px)';
      updateDots();
    }

    if (prev) prev.addEventListener('click', function () { goTo(cur - 1); });
    if (next) next.addEventListener('click', function () { goTo(cur + 1); });

    var timer = setInterval(function () { goTo(cur >= maxIdx() ? 0 : cur + 1); }, 4400);
    track.addEventListener('mouseenter', function () { clearInterval(timer); });

    var tx = 0;
    track.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var dx = tx - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 40) goTo(dx > 0 ? cur + 1 : cur - 1);
    }, { passive: true });

    window.addEventListener('resize', function () { goTo(Math.min(cur, maxIdx())); }, { passive: true });
  }

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = this.closest('.faq-item');
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (el) {
        el.classList.remove('open');
        el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── Menu page: expandable category cards ── */
  document.querySelectorAll('.menu-cat-head').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = this.closest('.menu-cat-card');
      card.classList.toggle('open');
      this.setAttribute('aria-expanded', card.classList.contains('open') ? 'true' : 'false');
    });
  });

  /* ── Simple contact form (no backend — opens WhatsApp) ── */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (document.getElementById('cName') || {}).value || '';
      var phone = (document.getElementById('cPhone') || {}).value || '';
      var msg = (document.getElementById('cMessage') || {}).value || '';
      var lines = [
        '*New Enquiry — Mugdha Caterers*',
        '*Name:* ' + name,
        '*Phone:* ' + phone,
        '*Message:* ' + msg
      ];
      window.open('https://wa.me/919607055656?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener,noreferrer');
      var successMsg = document.getElementById('contactSuccess');
      if (successMsg) successMsg.classList.add('visible');
      contactForm.reset();
    });
  }

})();
