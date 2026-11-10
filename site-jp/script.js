/*
 * RunSun Japanese site (runsuncloud.jp). This site is Japanese-only; the
 * English site lives on runsuncloud.com and is linked from the header and
 * footer. This file handles the mobile menu, the hero banner carousel,
 * and the decorative motion layer (scroll reveal, number counters,
 * header shadow). Motion is disabled entirely for visitors who prefer
 * reduced motion: content then shows its final state immediately.
 */
(function () {
  'use strict';

  var REDUCED = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) {
      return;
    }

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setOpen(false);
      }
    });
  }

  function initCarousel(id) {
    var root = document.getElementById(id);
    if (!root) {
      return;
    }
    var stage = root.querySelector('.stage');
    var slides = root.querySelectorAll('.slide');
    var dotsBox = root.querySelector('.dots');
    var cur = 0;
    var timer = null;

    /* The stage is sized to the tallest slide: every banner's badge,
       headline, copy, cards and CTA must be fully visible, never
       clipped (slides are absolutely positioned, so without this the
       fixed aspect-ratio box can cut off taller slides — slide 3's
       CTA was being cut at the bottom edge). Heights are re-measured
       on resize and once webfonts have settled. */
    function fit() {
      if (!stage) {
        return;
      }
      var w = stage.clientWidth;
      if (!w) {
        return;
      }
      var max = 0;
      slides.forEach(function (s) {
        s.style.position = 'absolute';
        s.style.top = '0';
        s.style.left = '0';
        s.style.bottom = 'auto';
        s.style.height = 'auto';
        s.style.width = w + 'px';
        s.style.visibility = 'hidden';
        var h = s.offsetHeight;
        s.style.cssText = '';
        if (h > max) {
          max = h;
        }
      });
      if (max) {
        stage.style.height = max + 'px';
      }
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fit, 150);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fit);
    }
    fit();

    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Banner ' + (i + 1));
      if (i === 0) {
        b.classList.add('active');
      }
      b.addEventListener('click', function () {
        show(i);
        restart();
      });
      dotsBox.appendChild(b);
    });
    var dots = dotsBox.querySelectorAll('button');

    /* Keep inactive slides out of the accessibility tree and the tab
       order: only the visible banner's links can be focused or read. */
    function markSlides() {
      slides.forEach(function (s, i) {
        if (i === cur) {
          s.removeAttribute('aria-hidden');
          s.removeAttribute('inert');
        } else {
          s.setAttribute('aria-hidden', 'true');
          s.setAttribute('inert', '');
        }
      });
    }
    markSlides();

    function show(i) {
      slides[cur].classList.remove('active');
      dots[cur].classList.remove('active');
      cur = i;
      slides[cur].classList.add('active');
      dots[cur].classList.add('active');
      markSlides();
    }

    function next() {
      show((cur + 1) % slides.length);
    }

    function restart() {
      clearInterval(timer);
      if (REDUCED) {
        return; /* no autoplay for reduced-motion visitors; dots still work */
      }
      timer = setInterval(next, 4500);
    }

    root.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });
    root.addEventListener('mouseleave', restart);
    restart();
  }

  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) {
      return;
    }
    function onScroll() {
      header.classList.toggle('scrolled', window.scrollY > 8);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Scroll-triggered reveal: blocks fade up once when they enter the
     viewport, with a small stagger between siblings. The pre-hidden
     state only exists under html.motion-ok (set by the inline head
     script when motion is allowed), so nothing can get stuck hidden. */
  function initReveal() {
    if (REDUCED || !document.documentElement.classList.contains('motion-ok')) {
      return;
    }
    var selector = [
      '.section h2',
      '.section-intro',
      '.card',
      '.about-row',
      '.sovereign',
      '.stat',
      '.layer',
      '.rubin-panel',
      '.table-scroll',
      '.partner-panel',
      '.company-block',
      '.contact-panel',
      '.token-grid',
      '.vr-hero',
      '.vr .part',
      '.vr-block',
      '.marquee',
      '.footer-grid'
    ].join(', ');
    var els = Array.prototype.slice.call(document.querySelectorAll(selector));
    var set = new Set(els);
    /* Do not double-animate an element nested inside another reveal block */
    els = els.filter(function (el) {
      var p = el.parentElement;
      while (p) {
        if (set.has(p)) {
          return false;
        }
        p = p.parentElement;
      }
      return true;
    });
    /* Stagger siblings: delay grows per index within the same parent */
    var counts = new Map();
    els.forEach(function (el) {
      var n = counts.get(el.parentElement) || 0;
      counts.set(el.parentElement, n + 1);
      el.style.setProperty('--d', Math.min(n * 0.08, 0.4).toFixed(2) + 's');
      el.classList.add('reveal');
    });
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) {
        el.classList.add('in');
      });
      return;
    }
    /* Threshold 0 on purpose: a fractional threshold can never be
       reached by a reveal target taller than the viewport, which
       would leave it invisible — a full screen of blank space. Any
       visible pixel now reveals the block. */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  /* Number counters for the hero stats (and the Vera Rubin tour stats
     on the English site). Every numeric group in the text counts up
     from 0 in its original format (thousands separators and decimals
     preserved); the animation always ends by restoring the exact
     original string, so the displayed figures never change. */
  function formatLike(value, template) {
    var decimals = template.indexOf('.') === -1
      ? 0
      : template.split('.')[1].length;
    var out = value.toFixed(decimals);
    if (template.indexOf(',') !== -1) {
      var parts = out.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      out = parts.join('.');
    }
    return out;
  }

  function animateCount(el) {
    var original = el.textContent;
    var re = /\d[\d,]*(?:\.\d+)?/g;
    var groups = [];
    var m;
    while ((m = re.exec(original)) !== null) {
      groups.push({
        text: m[0],
        index: m.index,
        value: parseFloat(m[0].replace(/,/g, ''))
      });
    }
    if (!groups.length || el.dataset.counted) {
      return;
    }
    el.dataset.counted = '1';
    el.classList.add('counting');
    var duration = 1500;
    var start = null;
    function frame(ts) {
      if (!start) {
        start = ts;
      }
      var t = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var out = '';
      var last = 0;
      groups.forEach(function (g) {
        out += original.slice(last, g.index);
        out += formatLike(g.value * eased, g.text);
        last = g.index + g.text.length;
      });
      out += original.slice(last);
      el.textContent = out;
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = original;
        el.classList.remove('counting');
      }
    }
    requestAnimationFrame(frame);
  }

  function initCounters() {
    if (REDUCED) {
      return; /* final values are already in the HTML */
    }
    var targets = document.querySelectorAll('.hero .stat strong, .vr .stat .num');
    if (!targets.length) {
      return;
    }
    if (!('IntersectionObserver' in window)) {
      return; /* leave the printed values untouched */
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    targets.forEach(function (el) {
      io.observe(el);
    });
  }

  /* Enquiry form: every reserve / quote CTA on the page anchors here,
     and a CTA carrying data-product pre-selects that product in the
     form. Submission composes a pre-filled email to the site's contact
     address and opens it in the visitor's mail app (a static-site
     mechanism; the form's native mailto action is the no-JS fallback). */
  function fieldLabel(control) {
    var lab = control.closest ? control.closest('label') : null;
    if (!lab) {
      return control.name;
    }
    var t = '';
    Array.prototype.forEach.call(lab.childNodes, function (n) {
      if (n.nodeType === 3) {
        t += n.textContent;
      }
    });
    return t.replace(/\*/g, '').trim() || control.name;
  }

  function initEnquiryForm() {
    var form = document.getElementById('enquiry-form');
    var select = document.getElementById('enquiry-product');
    document.querySelectorAll('[data-product]').forEach(function (link) {
      link.addEventListener('click', function () {
        if (!select) {
          return;
        }
        var want = link.getAttribute('data-product');
        for (var i = 0; i < select.options.length; i++) {
          if (select.options[i].value === want) {
            select.selectedIndex = i;
            break;
          }
        }
      });
    });
    if (!form) {
      return;
    }
    var to = form.getAttribute('data-to');
    if (!to) {
      return;
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var lines = [];
      var product = '';
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.type === 'submit') {
          return;
        }
        var v = (el.value || '').trim();
        if (el.name === 'product') {
          product = v;
        }
        if (v) {
          lines.push(fieldLabel(el) + ': ' + v);
        }
      });
      var subject = (form.getAttribute('data-subject') || 'Website enquiry') +
        (product ? ' — ' + product : '');
      window.location.href = 'mailto:' + to +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    });
  }

  /* If a remote product image fails to load, swap in a labelled
     placeholder box instead of leaving a collapsed figure (and a
     stretch of unexplained blank space). */
  function initImageFallback() {
    document.querySelectorAll('figure img, .partner-logo img').forEach(function (img) {
      function swap() {
        if (img.dataset.fbk) {
          return;
        }
        img.dataset.fbk = '1';
        var ph = document.createElement('div');
        ph.className = 'img-fallback';
        ph.textContent = img.getAttribute('alt') || '';
        img.replaceWith(ph);
      }
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
        swap();
      } else {
        img.addEventListener('error', swap);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initCarousel('hero-carousel');
    initHeaderScroll();
    initReveal();
    initCounters();
    initEnquiryForm();
    initImageFallback();
  });
})();

/* Light flow FX: independent lifecycle, no changes to existing site behavior. */
(function () {
  'use strict';
  function initLightFlow() {
    var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var mobile = window.matchMedia('(max-width: 700px)');
    var hero = document.querySelector('.hero');
    var surfaces = Array.from(document.querySelectorAll('.flow-diagram, figure.stack-figure, #industries .media-card'));
    var visible = new Set();
    var canvas, ctx, width = 0, height = 0, paths = [], particles = [];
    var raf = 0, last = 0, clock = 0, dirty = true;
    surfaces.forEach(function (el) {
      el.classList.add('fx-surface');
      el.querySelectorAll('.flow-step').forEach(function (step, i) {
        step.style.setProperty('--fx-delay', (i * 2) + 's');
      });
      el.querySelectorAll('.flow-arrow').forEach(function (arrow, i) {
        arrow.style.setProperty('--fx-delay', (i * 2) + 's');
      });
    });
    // Without visibility observation the complete static presentation is retained.
    if (!('IntersectionObserver' in window)) { return; }
    if (hero) {
      canvas = document.createElement('canvas');
      canvas.className = 'fx-hero-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      hero.prepend(canvas);
      ctx = canvas.getContext('2d');
    }
    function point(lane, t) {
      return { x: width * (t * 1.3 - .15),
        y: height * (.16 + lane * .115 + .16 * Math.sin(t * Math.PI * 2 + lane * .4)) };
    }
    function resize() {
      dirty = false;
      if (!ctx) { return; }
      width = hero.clientWidth; height = hero.clientHeight;
      // Bound backing-store memory even on large / high-density displays.
      var dpr = Math.min(window.devicePixelRatio || 1, mobile.matches ? 1 : 1.5, 2400 / Math.max(width, height, 1));
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paths = [];
      for (var lane = 0; lane < 6; lane++) {
        var path = new Path2D();
        for (var j = 0; j <= 100; j++) {
          var p = point(lane, j / 100);
          if (j === 0) { path.moveTo(p.x, p.y); } else { path.lineTo(p.x, p.y); }
        }
        paths.push(path);
      }
      // Hard cap: 30 desktop particles, 12 mobile particles.
      particles = Array.from({ length: mobile.matches ? 12 : 30 }, function (_, i) {
        return { lane: i % 6, offset: i / (mobile.matches ? 12 : 30), speed: .025 + (i % 3) * .006 };
      });
    }
    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,96,0,.11)';
      paths.forEach(function (path) { ctx.stroke(path); });
      particles.forEach(function (particle) {
        var t = (particle.offset + clock * particle.speed) % 1;
        var tail = point(particle.lane, Math.max(0, t - .045));
        var head = point(particle.lane, t);
        var gradient = ctx.createLinearGradient(tail.x, tail.y, head.x + .01, head.y);
        gradient.addColorStop(0, 'rgba(255,96,0,0)');
        gradient.addColorStop(1, 'rgba(255,140,65,.85)');
        ctx.strokeStyle = gradient; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(tail.x, tail.y);
        for (var k = 1; k <= 8; k++) {
          var p = point(particle.lane, Math.max(0, t - .045) + (t - Math.max(0, t - .045)) * k / 8);
          ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        ctx.fillStyle = '#ffc28f'; ctx.beginPath(); ctx.arc(head.x, head.y, 1.5, 0, Math.PI * 2); ctx.fill();
      });
    }
    function frame(now) {
      var interval = 1000 / (mobile.matches ? 24 : 30);
      if (!last || now - last >= interval) {
        clock += last ? Math.min((now - last) / 1000, .1) : 0;
        last = now;
        if (dirty) { resize(); }
        draw();
      }
      raf = window.requestAnimationFrame(frame);
    }
    function sync() {
      var allowed = !motion.matches && !document.hidden;
      surfaces.forEach(function (el) { el.classList.toggle('fx-running', allowed && visible.has(el)); });
      var run = allowed && ctx && visible.has(hero);
      if (run && !raf) { last = 0; raf = window.requestAnimationFrame(frame); }
      if (!run && raf) { window.cancelAnimationFrame(raf); raf = 0; last = 0; }
      if (motion.matches && ctx) { ctx.clearRect(0, 0, width, height); }
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { visible.add(entry.target); } else { visible.delete(entry.target); }
      });
      sync();
    }, { threshold: 0 });
    surfaces.forEach(function (el) { observer.observe(el); });
    if (hero && ctx) { observer.observe(hero); }
    if (hero && 'ResizeObserver' in window) {
      new ResizeObserver(function () { dirty = true; }).observe(hero);
    }
    window.addEventListener('resize', function () { dirty = true; }, { passive: true });
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    mobile.addEventListener('change', function () { dirty = true; });
    sync();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightFlow);
  } else { initLightFlow(); }
})();
