/*!
 * Redliners Performance — interaction & motion layer
 *  1. Intro: tach needle sweeps to the redline, then the page opens (once per session)
 *  2. Scroll "tach bar" under the header
 *  3. Hero: interactive rev counter (hold the button → needle climbs, limiter bounces)
 *  4. Hero: light that follows the pointer
 *  5. Cursor ring that reacts to links and buttons (mouse only)
 *  6. Magnetic call-to-action buttons (mouse only)
 *  7. 3D tilt + glare on service cards and gallery photos (mouse only)
 *  8. Decoding text effect on section tags
 *  9. Marquee follows scroll speed and direction
 * 10. Gallery photos wipe in as they enter the screen
 * Everything respects prefers-reduced-motion; touch devices skip pointer-only effects.
 */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ================= 1. Language screen + intro ================= */
  const loader = $('#loader');
  let introMs = 0;
  const launchFns = [];
  const onLaunch = fn => { if (window.RL_WAIT_LAUNCH) launchFns.push(fn); else fn(introMs); };
  const markSeen = () => { try { sessionStorage.setItem('rl-intro', '1'); } catch (e) { /* storage unavailable */ } };
  const playIntro = () => {
    introMs = reduce ? 0 : 1500;
    if (!introMs) { loader.classList.add('done'); setTimeout(() => loader.remove(), 450); return; }
    requestAnimationFrame(() => loader.classList.add('run'));
    setTimeout(() => { loader.classList.add('done'); root.classList.remove('intro-on'); }, introMs);
    setTimeout(() => loader.remove(), introMs + 700);
  };

  if (loader && root.classList.contains('gate-on')) {
    // First view of the visit: pick a language, then launch
    window.RL_WAIT_LAUNCH = true;
    const cards = $$('[data-gate-lang]', loader);
    const suggested = (window.RL_I18N && window.RL_I18N.lang) || 'en';
    cards.forEach(c => c.classList.toggle('suggested', c.dataset.gateLang === suggested));
    const first = cards.find(c => c.dataset.gateLang === suggested) || cards[0];
    setTimeout(() => first && first.focus({ preventScroll: true }), 400);
    let chosen = false;
    const choose = (lang, card) => {
      if (chosen) return; chosen = true;
      if (window.RL_I18N) window.RL_I18N.set(lang);
      markSeen();
      card.classList.add('picked');
      setTimeout(() => {
        root.classList.remove('gate-on');
        loader.classList.add('launching');
        playIntro();
        window.RL_WAIT_LAUNCH = false;
        const detail = { ms: introMs, lang };
        launchFns.splice(0).forEach(fn => fn(introMs));
        document.dispatchEvent(new CustomEvent('rl:launch', { detail }));
      }, reduce ? 0 : 260);
    };
    cards.forEach((c, i) => {
      c.addEventListener('click', e => { e.preventDefault(); choose(c.dataset.gateLang, c); });
      c.addEventListener('keydown', e => {
        const k = e.key, n = cards.length;
        if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); cards[(i + 1) % n].focus(); }
        if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); cards[(i - 1 + n) % n].focus(); }
      });
    });
    // keep keyboard focus inside the screen
    loader.addEventListener('keydown', e => {
      if (e.key !== 'Tab' || chosen) return;
      const a = cards[0], z = cards[cards.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });
  } else if (loader && root.classList.contains('intro-on') && !reduce) {
    markSeen();
    playIntro();
  } else if (loader) {
    loader.remove(); root.classList.remove('intro-on');
  }
  window.RL_INTRO_MS = introMs; // the page script delays the hero entrance by this much

  /* ================= 2. Scroll tach bar ================= */
  const bar = $('#scrollTach');
  if (bar) {
    let ticking = false;
    const upd = () => {
      const max = root.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? (scrollY / max).toFixed(4) : 0})`;
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* ================= 3. Hero rev counter ================= */
  const gauge = $('#revGauge');
  if (gauge) {
    const svg = $('svg', gauge), needle = $('#revNeedle', gauge), digits = $('#revDigits', gauge);
    const leds = $$('.rev-led', gauge), btn = $('#revBtn', gauge), hero = $('#hero');
    const CX = 120, CY = 120, R = 98, MAX = 8000, LIM = 7600;
    const ang = rpm => 135 + (clamp(rpm, 0, MAX) / MAX) * 270;            // degrees, SVG clockwise
    const pt = (deg, r) => { const a = deg * Math.PI / 180; return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; };
    const NS = 'http://www.w3.org/2000/svg';
    const ticks = $('#revTicks', gauge);
    for (let r = 0; r <= MAX; r += 250) {
      const major = r % 1000 === 0, red = r >= 6500;
      const [x1, y1] = pt(ang(r), major ? R - 14 : R - 7), [x2, y2] = pt(ang(r), R);
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2);
      l.setAttribute('stroke', red ? '#ff1e3c' : 'rgba(255,255,255,' + (major ? '.8' : '.3') + ')');
      l.setAttribute('stroke-width', major ? 2.4 : 1.2); ticks.appendChild(l);
      if (major) {
        const [tx, ty] = pt(ang(r), R - 27);
        const t = document.createElementNS(NS, 'text');
        t.setAttribute('x', tx); t.setAttribute('y', ty + 4); t.setAttribute('text-anchor', 'middle');
        t.setAttribute('class', 'rev-num' + (red ? ' red' : '')); t.textContent = r / 1000; ticks.appendChild(t);
      }
    }
    // red zone arc
    const [ax, ay] = pt(ang(6500), R + 6), [bx, by] = pt(ang(MAX), R + 6);
    $('#revRed', gauge).setAttribute('d', `M${ax} ${ay} A${R + 6} ${R + 6} 0 0 1 ${bx} ${by}`);
    // live arc that fills with rpm
    const fill = $('#revFill', gauge);
    const fillLen = 2 * Math.PI * (R + 6) * 0.75;
    fill.setAttribute('d', (() => { const [sx, sy] = pt(135, R + 6), [ex, ey] = pt(45, R + 6); return `M${sx} ${sy} A${R + 6} ${R + 6} 0 1 1 ${ex} ${ey}`; })());
    fill.style.strokeDasharray = `${fillLen} ${fillLen}`;

    let rpm = 850, holding = false, last = performance.now(), limTimer = 0, visible = true, raf = 0;
    const IDLE = 850;
    const render = () => {
      needle.setAttribute('transform', `rotate(${ang(rpm).toFixed(2)} ${CX} ${CY})`);
      fill.style.strokeDashoffset = (fillLen * (1 - rpm / MAX)).toFixed(1);
      digits.textContent = String(Math.round(rpm / 10) * 10).padStart(4, '0');
      const k = clamp((rpm - IDLE) / (LIM - IDLE), 0, 1);
      leds.forEach((l, i) => l.classList.toggle('on', rpm > 4200 + i * 700));
      gauge.style.setProperty('--rev', k.toFixed(3));
      if (hero) hero.style.setProperty('--rev', k.toFixed(3));
    };
    const step = now => {
      const dt = clamp((now - last) / 1000, 0, 0.05); last = now;
      if (holding) {
        rpm += (5200 - rpm * 0.35) * dt * 1.6;                          // falls off as revs rise
        if (rpm >= LIM) { rpm = LIM - 380; limTimer = 0.18; }           // limiter bounce
      } else {
        rpm += (IDLE - rpm) * dt * 2.4;                                  // throttle closed
        if (!reduce && Math.abs(rpm - IDLE) < 40) rpm = IDLE + Math.sin(now / 90) * 12; // idle wobble
      }
      limTimer = Math.max(0, limTimer - dt);
      gauge.classList.toggle('limiter', limTimer > 0 || (holding && rpm > LIM - 450));
      if (hero) hero.classList.toggle('rev-shake', !reduce && holding && rpm > LIM - 450);
      render();
      raf = (visible || holding || rpm > IDLE + 50) ? requestAnimationFrame(step) : 0;
    };
    const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } };
    const press = e => { if (e) e.preventDefault(); holding = true; btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true'); start(); };
    const release = () => { holding = false; btn.classList.remove('active'); btn.setAttribute('aria-pressed', 'false'); start(); };
    btn.addEventListener('pointerdown', e => { btn.setPointerCapture && btn.setPointerCapture(e.pointerId); press(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => btn.addEventListener(ev, release));
    btn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) press(e); });
    btn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') release(); });
    btn.addEventListener('contextmenu', e => e.preventDefault());
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); }).observe(gauge);
    // greeting blip after the intro
    if (!reduce) onLaunch(ms => setTimeout(() => { rpm = 3600; start(); }, ms + 900));
    render();
  }

  /* ================= 4. Hero pointer light ================= */
  const heroEl = $('#hero');
  if (heroEl && finePointer && !reduce) {
    heroEl.addEventListener('pointermove', e => {
      const r = heroEl.getBoundingClientRect();
      heroEl.style.setProperty('--hx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      heroEl.style.setProperty('--hy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  }

  /* ================= 5. Cursor ring ================= */
  if (finePointer && !reduce) {
    const ring = document.createElement('div'); ring.className = 'cursor-ring'; ring.setAttribute('aria-hidden', 'true');
    const dot = document.createElement('div'); dot.className = 'cursor-dot'; dot.setAttribute('aria-hidden', 'true');
    document.body.append(ring, dot);
    let mx = -100, my = -100, rx = -100, ry = -100, shown = false;
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!shown) { shown = true; rx = mx; ry = my; root.classList.add('has-cursor'); }
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      const t = e.target.closest && e.target.closest('a, button, [role="tab"], input, select, textarea, label, .gal');
      ring.classList.toggle('hover', !!t);
    }, { passive: true });
    document.addEventListener('pointerleave', () => { root.classList.remove('has-cursor'); shown = false; });
    addEventListener('pointerdown', () => ring.classList.add('down'));
    addEventListener('pointerup', () => ring.classList.remove('down'));
    (function loop() {
      rx = lerp(rx, mx, 0.2); ry = lerp(ry, my, 0.2);
      ring.style.transform = `translate(${rx.toFixed(1)}px, ${ry.toFixed(1)}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ================= 6. Magnetic buttons ================= */
  if (finePointer && !reduce) {
    $$('[data-magnetic]').forEach(el => {
      const strength = 0.28;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * strength, y = (e.clientY - (r.top + r.height / 2)) * strength;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ================= 7. Tilt + glare ================= */
  if (finePointer && !reduce) {
    $$('[data-tilt]').forEach(el => {
      const max = +(el.dataset.tilt || 7);
      const glare = document.createElement('span'); glare.className = 'tilt-glare'; glare.setAttribute('aria-hidden', 'true');
      el.appendChild(glare);
      let raf = 0, tx = 0, ty = 0;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        tx = (0.5 - py) * max; ty = (px - 0.5) * max;
        el.style.setProperty('--gx', (px * 100).toFixed(1) + '%'); el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
        if (!raf) raf = requestAnimationFrame(() => {
          raf = 0; el.style.transform = `perspective(900px) rotateX(${tx.toFixed(2)}deg) rotateY(${ty.toFixed(2)}deg) translateY(-4px)`;
        });
      });
      el.addEventListener('pointerenter', () => el.classList.add('tilting'));
      el.addEventListener('pointerleave', () => { el.classList.remove('tilting'); el.style.transform = ''; });
    });
  }

  /* ================= 8. Decoding section tags ================= */
  const GLYPHS = '01<>/\\|#$%&*+=?ABCDEF';
  function scramble(el) {
    if (reduce) return;
    const final = el.textContent, len = final.length;
    const token = (el.__scr = (el.__scr || 0) + 1);
    const t0 = performance.now(), dur = 900;
    (function tick(now) {
      if (el.__scr !== token) return;
      const p = clamp((now - t0) / dur, 0, 1);
      const shown = Math.floor(p * len);
      let out = '';
      for (let i = 0; i < len; i++) {
        const ch = final[i];
        out += (i < shown || ch === ' ') ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(tick); else el.textContent = final;
    })(t0);
  }
  const scrIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { scramble(e.target); scrIO.unobserve(e.target); } }), { threshold: 0.6 });
  $$('[data-scramble]').forEach(el => scrIO.observe(el));
  // a language switch replaces the text — stop any running scramble so it can't overwrite it
  if (window.RL_I18N) window.RL_I18N.onChange(() => { $$('[data-scramble]').forEach(el => { el.__scr = (el.__scr || 0) + 1; }); });

  /* ================= 9. Marquee reacts to scroll ================= */
  const mq = $('.marquee');
  if (mq && !reduce && mq.getAnimations) {
    let lastY = scrollY, vel = 0, anim;
    (function loop() {
      anim = anim || mq.getAnimations()[0];
      const y = scrollY, dy = y - lastY; lastY = y;
      vel = lerp(vel, dy, 0.12);
      if (anim) anim.playbackRate = clamp(1 + Math.abs(vel) * 0.35, 1, 8) * (vel < -0.5 ? -1 : 1);
      requestAnimationFrame(loop);
    })();
  }

  /* ================= 10. Gallery wipe-in ================= */
  if (!reduce && 'IntersectionObserver' in window) {
    const gals = $$('.gal');
    gals.forEach(g => {
      const c = document.createElement('span'); c.className = 'gal-cover'; c.setAttribute('aria-hidden', 'true');
      g.appendChild(c); g.classList.add('wipe');
    });
    const gio = new IntersectionObserver(es => {
      let i = 0;
      es.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target; gio.unobserve(el);
        setTimeout(() => el.classList.add('wiped'), (i++) * 90);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    gals.forEach(g => gio.observe(g));
  }
  /* ================= 11. Thank-you sparks ================= */
  (function () {
    const cv = document.getElementById('thSparks');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let parts = [], raf = 0;
    function burst() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cx = innerWidth / 2, cy = Math.min(innerHeight * 0.32, 260);
      parts = Array.from({ length: 140 }, () => {
        const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 9;
        return { x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3, life: 1, decay: 0.008 + Math.random() * 0.014,
          len: 6 + Math.random() * 14, col: Math.random() < 0.7 ? '255,30,60' : (Math.random() < 0.5 ? '255,255,255' : '34,211,238') };
      });
      cancelAnimationFrame(raf);
      setTimeout(() => { raf = requestAnimationFrame(step); }, 700);   // after the check mark draws
    }
    function step() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach(p => {
        p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.12; p.x += p.vx; p.y += p.vy; p.life -= p.decay;
        if (p.life <= 0) return;
        const sp = Math.hypot(p.vx, p.vy) || 1;
        ctx.strokeStyle = `rgba(${p.col},${p.life.toFixed(3)})`; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx / sp * p.len, p.y - p.vy / sp * p.len); ctx.stroke();
      });
      parts = parts.filter(p => p.life > 0);
      raf = parts.length ? requestAnimationFrame(step) : 0;
    }
    window.RL_SPARKS = { burst, stop() { cancelAnimationFrame(raf); raf = 0; parts = []; ctx.clearRect(0, 0, cv.width, cv.height); } };
  })();
})();
