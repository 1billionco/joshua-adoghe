/* Joshua Adoghe — portfolio motion layer.
   Plain JavaScript, no libraries, no tracking. Everything here is decoration:
   the site reads and works the same if this file never loads. */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- header: scrolled state + reading progress ---------- */
  var head = document.querySelector('.site-head');
  if (head) {
    var bar = document.createElement('div');
    bar.className = 'progress';
    bar.setAttribute('aria-hidden', 'true');
    head.appendChild(bar);
    var onScroll = function () {
      var max = doc.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
      head.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (reduce) return;

  /* ---------- hero eyebrow: decode effect ---------- */
  document.querySelectorAll('.hero .eyebrow').forEach(function (el) {
    var text = el.textContent;
    var glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#+%';
    el.textContent = '';
    var sr = document.createElement('span');
    sr.className = 'sr';
    sr.textContent = text;
    var vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true');
    el.append(sr, vis);
    var start = null;
    var dur = 900;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var settled = Math.floor(p * text.length);
      var out = '';
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        out += i < settled || ch === ' ' || ch === '·' ? ch : glyphs[(Math.random() * glyphs.length) | 0];
      }
      vis.textContent = out;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });

  /* ---------- scroll reveals (only for things below the fold) ---------- */
  var revealSel = [
    'main .section .eyebrow', 'main .section h2', 'main .section .lede',
    '.row', '.step', '.metric', '.pill', '.tl-item', '.deflist > div',
    '.three > div', '.portrait', '.contact-links > *', '.form', '.project'
  ].join(',');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  document.querySelectorAll(revealSel).forEach(function (el) {
    if (el.closest('.hero')) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.setProperty('--d', Math.min(idx * 0.06, 0.36) + 's');
    el.classList.add('rv');
    io.observe(el);
  });

  /* ---------- count-up numbers ---------- */
  var countIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      var el = e.target;
      var m = el.textContent.match(/^([^\d]*)([\d.,]+)(.*)$/);
      if (!m || parseFloat(m[2]) < 10) return;
      var target = parseFloat(m[2].replace(/,/g, ''));
      var decimals = (m[2].split('.')[1] || '').length;
      var t0 = null;
      var dur = 1600;
      function tick(t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(2, -10 * p);
        el.textContent = m[1] + (target * (p === 1 ? 1 : eased)).toFixed(decimals) + m[3];
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.metric .n, .result .rn').forEach(function (el) { countIO.observe(el); });

  /* ---------- scroll-scrubbed statement text ---------- */
  var scrubs = [];
  document.querySelectorAll('[data-scrub]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = 'sw';
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.classList.add('scrub');
    scrubs.push(el);
  });
  if (scrubs.length) {
    var scrubTick = function () {
      scrubs.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var vh = window.innerHeight;
        var p = (vh * 0.85 - r.top) / (vh * 0.5 + r.height);
        p = Math.max(0, Math.min(1, p));
        var spans = el.children;
        var lit = p * spans.length;
        for (var i = 0; i < spans.length; i++) {
          spans[i].style.opacity = (0.22 + 0.78 * Math.max(0, Math.min(1, lit - i))).toFixed(3);
        }
      });
    };
    window.addEventListener('scroll', scrubTick, { passive: true });
    window.addEventListener('resize', scrubTick);
    scrubTick();
  }

  if (!finePointer) {
    document.querySelectorAll('.hero').forEach(initNetwork);
    return;
  }

  /* ---------- pointer spotlight on cards ---------- */
  document.querySelectorAll('.row, .metric, .step, .project').forEach(function (el) {
    el.addEventListener('pointermove', function (ev) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
      el.style.setProperty('--my', (ev.clientY - r.top) + 'px');
    });
  });

  /* ---------- magnetic buttons ---------- */
  document.querySelectorAll('.btn').forEach(function (b) {
    b.addEventListener('pointermove', function (ev) {
      var r = b.getBoundingClientRect();
      b.style.setProperty('--bx', ((ev.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px');
      b.style.setProperty('--by', ((ev.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px');
    });
    b.addEventListener('pointerleave', function () {
      b.style.removeProperty('--bx');
      b.style.removeProperty('--by');
    });
  });

  /* ---------- funnel tilt ---------- */
  var visual = document.querySelector('.hero-visual');
  if (visual) {
    var heroEl = visual.closest('.hero');
    heroEl.addEventListener('pointermove', function (ev) {
      var r = heroEl.getBoundingClientRect();
      var x = (ev.clientX - r.left) / r.width - 0.5;
      var y = (ev.clientY - r.top) / r.height - 0.5;
      visual.style.setProperty('--tx', (x * 10).toFixed(2) + 'deg');
      visual.style.setProperty('--ty', (-y * 8).toFixed(2) + 'deg');
    });
    heroEl.addEventListener('pointerleave', function () {
      visual.style.removeProperty('--tx');
      visual.style.removeProperty('--ty');
    });
  }

  document.querySelectorAll('.hero').forEach(initNetwork);

  /* ---------- hero constellation: nodes linking up like a customer journey ---------- */
  function initNetwork(hero) {
    var c = document.createElement('canvas');
    c.className = 'hero-net';
    c.setAttribute('aria-hidden', 'true');
    hero.insertBefore(c, hero.querySelector('.wrap'));
    var ctx = c.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, nodes = [], mouse = null, running = false, visible = true;
    var LINK = 130;

    function resize() {
      w = hero.clientWidth;
      h = hero.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(22, Math.min(70, Math.round((w * h) / 15000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        var a = Math.random() * Math.PI * 2;
        var sp = 0.12 + Math.random() * 0.25;
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          r: 1 + Math.random() * 1.4,
          hot: Math.random() < 0.12
        });
      }
    }

    function step() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (mouse) {
          var mdx = mouse.x - n.x, mdy = mouse.y - n.y;
          var md = Math.sqrt(mdx * mdx + mdy * mdy);
          if (md < 180 && md > 1) { n.vx += (mdx / md) * 0.012; n.vy += (mdy / md) * 0.012; }
        }
        var sp = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (sp > 0.6) { n.vx *= 0.6 / sp; n.vy *= 0.6 / sp; }
        n.x += n.vx; n.y += n.vy;
        if (n.x < -10) n.x = w + 10; else if (n.x > w + 10) n.x = -10;
        if (n.y < -10) n.y = h + 10; else if (n.y > h + 10) n.y = -10;
      }
      ctx.lineWidth = 1;
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
          var d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            var al = (1 - Math.sqrt(d2) / LINK) * 0.32;
            ctx.strokeStyle = 'rgba(142,155,255,' + al.toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(nodes[b].x, nodes[b].y);
            ctx.stroke();
          }
        }
        if (mouse) {
          var ex = nodes[a].x - mouse.x, ey = nodes[a].y - mouse.y;
          var ed = Math.sqrt(ex * ex + ey * ey);
          if (ed < 170) {
            ctx.strokeStyle = 'rgba(255,210,63,' + ((1 - ed / 170) * 0.5).toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
      for (var k = 0; k < nodes.length; k++) {
        var q = nodes[k];
        ctx.fillStyle = q.hot ? 'rgba(255,210,63,.9)' : 'rgba(185,191,214,.65)';
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.hot ? q.r + 0.6 : q.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(step);
    }

    function sync() {
      var should = visible && !document.hidden;
      if (should && !running) { running = true; requestAnimationFrame(step); }
      else if (!should) running = false;
    }

    resize();
    new ResizeObserver(resize).observe(hero);
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; sync(); }).observe(hero);
    document.addEventListener('visibilitychange', sync);
    if (finePointer) {
      hero.addEventListener('pointermove', function (ev) {
        var r = hero.getBoundingClientRect();
        mouse = { x: ev.clientX - r.left, y: ev.clientY - r.top };
      });
      hero.addEventListener('pointerleave', function () { mouse = null; });
    }
    c.classList.add('on');
  }
})();
