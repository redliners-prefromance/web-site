/*!
 * Redliners Performance — Stage boost map (3D)
 * Stock boost-target map vs Stage 1 / 2 / 3. Clicking a stage morphs the surface;
 * the stock map stays visible as a cyan ghost wireframe. Drag (or swipe) to rotate.
 * API: window.RL_STAGEMAP.set(stageIndex 0..2)   — called by the stage tabs
 *      the "Stock" button in the card morphs the surface back to stock for comparison.
 */
(function () {
  'use strict';
  const canvas = document.getElementById('stageMap');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const card = document.getElementById('stageMapCard');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const $ = id => document.getElementById(id);

  /* ---------- Map model: boost target [bar] over rpm (x) × load (y) ---------- */
  const NX = 18, NY = 14, ZMAX = 2.3;                    // bar — vertical scale of the plot
  const RPM = [1000, 5000];
  const stock = (x, y) => {
    const spool = 1 / (1 + Math.exp(-(x - 0.22) * 13));
    const taper = 1 - Math.max(0, x - 0.68) * 0.75;
    return 0.15 + 1.12 * spool * taper * (0.2 + 0.8 * y);           // ≈ 1.3 bar peak
  };
  // Each stage: how much boost is added where (rpm centre/width), and how spool changes
  const STAGES = [
    { name: 'Stage 1', add: 0.32, c: 0.42, w: 0.10, shift: 0,     hold: 0.15 },  // more mid-range boost, stock turbo
    { name: 'Stage 2', add: 0.52, c: 0.50, w: 0.14, shift: 0.02,  hold: 0.35 },  // breathes better → holds boost higher
    { name: 'Stage 3', add: 0.95, c: 0.60, w: 0.20, shift: 0.07,  hold: 0.75 }   // bigger turbo: later spool, much more top end
  ];
  const tuned = (x, y, s) => {
    const xs = clamp(x - s.shift, 0, 1);
    const spool = 1 / (1 + Math.exp(-(xs - 0.22) * 13));
    const taper = 1 - Math.max(0, x - 0.68) * 0.75 * (1 - s.hold);
    const base = 0.15 + 1.12 * spool * taper * (0.2 + 0.8 * y);
    const bump = s.add * Math.exp(-((x - s.c) ** 2) / s.w) * (0.15 + 0.85 * y) * spool;
    return base + bump;
  };
  // precompute grids
  const grid = f => { const g = []; for (let j = 0; j < NY; j++) { g[j] = []; for (let i = 0; i < NX; i++) g[j][i] = f(i / (NX - 1), j / (NY - 1)); } return g; };
  const G_STOCK = grid(stock);
  const G_STAGE = STAGES.map(s => grid((x, y) => tuned(x, y, s)));
  const peak = g => Math.max(...g.flat());
  const PEAK_STOCK = peak(G_STOCK), PEAKS = G_STAGE.map(peak);

  /* ---------- State ---------- */
  let from = G_STOCK, to = G_STOCK, t = 1, target = 0, showStock = false;
  let yaw = -0.72, pitch = 0.52, autoSpin = !reduce, visible = false, raf = 0, drag = null, lastNow = performance.now();
  let cur = G_STOCK.map(r => r.slice());

  function set(i) {
    target = i; showStock = false;
    from = cur.map(r => r.slice()); to = G_STAGE[i]; t = reduce ? 1 : 0;
    updateReadout();
    card && card.classList.remove('is-stock');
    const sb = $('smStockBtn'); sb && sb.setAttribute('aria-pressed', 'false');
    kick();
  }
  function toggleStock() {
    showStock = !showStock;
    from = cur.map(r => r.slice()); to = showStock ? G_STOCK : G_STAGE[target]; t = reduce ? 1 : 0;
    card && card.classList.toggle('is-stock', showStock);
    $('smStockBtn').setAttribute('aria-pressed', showStock ? 'true' : 'false');
    kick();
  }
  function updateReadout() {
    const ps = PEAK_STOCK, pt = PEAKS[target];
    $('smStage').textContent = STAGES[target].name;
    tweenNum($('smPeakStock'), ps); tweenNum($('smPeakTuned'), pt);
    $('smDelta').textContent = '+' + (pt - ps).toFixed(2) + ' bar';
    $('smBar').style.width = (pt / ZMAX * 100).toFixed(1) + '%';
    $('smBarStock').style.width = (ps / ZMAX * 100).toFixed(1) + '%';
  }
  function tweenNum(el, v) {
    if (!el) return;
    const a = parseFloat(el.textContent) || 0, t0 = performance.now(), d = reduce ? 1 : 700;
    (function f(n) { const k = clamp((n - t0) / d, 0, 1), e = 1 - Math.pow(1 - k, 3); el.textContent = (a + (v - a) * e).toFixed(2); if (k < 1) requestAnimationFrame(f); })(t0);
  }

  /* ---------- Colours ---------- */
  const STOPS = [[34, 211, 238], [250, 204, 21], [255, 77, 100], [255, 30, 60]];
  const col = z => { const u = clamp(z / ZMAX, 0, 1) * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(u)), f = u - i;
    return STOPS[i].map((c, k) => Math.round(c + (STOPS[i + 1][k] - c) * f)); };

  /* ---------- Render ---------- */
  function draw() {
    const dpr = Math.min(devicePixelRatio || 1, 2), w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const narrow = w < 560;
    const S = Math.min(w * (narrow ? 0.7 : 0.62), h * 1.0), zS = h * (narrow ? 0.34 : 0.4) / ZMAX;
    const baseY = h * (narrow ? 0.7 : 0.66);
    const P = (x, y, z) => {                     // x,y in -0.5..0.5 ; z in bar
      const rx = x * cy - y * sy, ry = x * sy + y * cy;
      return [w / 2 + rx * S, baseY + ry * S * sp - z * zS * cp];
    };
    const depth = (x, y) => x * sy + y * cy;
    // floor + walls grid
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.07)';
    for (let k = 0; k <= 8; k++) { const u = k / 8 - 0.5; line(P(u, -0.5, 0), P(u, 0.5, 0)); line(P(-0.5, u, 0), P(0.5, u, 0)); }
    // z ticks on back-left edge
    ctx.fillStyle = 'rgba(255,255,255,.38)'; ctx.font = '600 10px "JetBrains Mono", monospace';
    const bx = depth(-0.5, -0.5) < depth(0.5, -0.5) ? -0.5 : 0.5;
    for (let z = 0.5; z <= 2; z += 0.5) { const a = P(bx, -0.5, z), b = P(bx, 0.5, z); ctx.strokeStyle = 'rgba(255,255,255,.05)'; line(a, b); if (a[1] > 54) ctx.fillText(z.toFixed(1), clamp(a[0] - 26, 4, w - 24), a[1] + 3); }
    // tuned/current surface: quads back-to-front
    const quads = [];
    for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++) {
      const xs = [i, i + 1, i + 1, i].map(v => v / (NX - 1) - 0.5), ys = [j, j, j + 1, j + 1].map(v => v / (NY - 1) - 0.5);
      const zs = [cur[j][i], cur[j][i + 1], cur[j + 1][i + 1], cur[j + 1][i]];
      const zst = [G_STOCK[j][i], G_STOCK[j][i + 1], G_STOCK[j + 1][i + 1], G_STOCK[j + 1][i]];
      quads.push({ pts: xs.map((x, k) => P(x, ys[k], zs[k])), d: depth((xs[0] + xs[1]) / 2, (ys[0] + ys[2]) / 2), z: zs.reduce((a, b) => a + b) / 4,
        gain: zs.reduce((a, b) => a + b) / 4 - zst.reduce((a, b) => a + b) / 4 });
    }
    quads.sort((a, b) => a.d - b.d);
    quads.forEach(q => {
      const [r, g, b] = col(q.z), lift = clamp(q.gain / 0.6, 0, 1);
      ctx.beginPath(); ctx.moveTo(...q.pts[0]); for (let k = 1; k < 4; k++) ctx.lineTo(...q.pts[k]); ctx.closePath();
      ctx.fillStyle = `rgba(${r},${g},${b},${0.13 + 0.22 * (q.z / ZMAX) + lift * 0.18})`; ctx.fill();
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.5 + 0.4 * (q.z / ZMAX)})`; ctx.lineWidth = 0.8; ctx.stroke();
    });
    // stock ghost wireframe on top (only when showing a stage)
    if (!showStock || t < 1) {
      const a = showStock ? (1 - t) : 1;
      ctx.strokeStyle = `rgba(34,211,238,${0.55 * a})`; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      for (let j = 0; j < NY; j += 2) { ctx.beginPath(); for (let i = 0; i < NX; i++) { const p = P(i / (NX - 1) - 0.5, j / (NY - 1) - 0.5, G_STOCK[j][i]); i ? ctx.lineTo(...p) : ctx.moveTo(...p); } ctx.stroke(); }
      for (let i = 0; i < NX; i += 3) { ctx.beginPath(); for (let j = 0; j < NY; j++) { const p = P(i / (NX - 1) - 0.5, j / (NY - 1) - 0.5, G_STOCK[j][i]); j ? ctx.lineTo(...p) : ctx.moveTo(...p); } ctx.stroke(); }
      ctx.setLineDash([]);
    }
    // peak marker
    let pk = { z: -1 }; cur.forEach((r, j) => r.forEach((z, i) => { if (z > pk.z) pk = { z, i, j }; }));
    const pp = P(pk.i / (NX - 1) - 0.5, pk.j / (NY - 1) - 0.5, pk.z);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(pp[0], pp[1], 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,30,60,.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(pp[0], pp[1], 8, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = '600 11px "JetBrains Mono", monospace'; ctx.fillText(pk.z.toFixed(2) + ' bar', pp[0] + 12, pp[1] - 8);
    // axis labels
    ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.font = '600 10px "JetBrains Mono", monospace';
    const ar = P(0.62, 0.5, 0), al = P(-0.5, 0.62, 0);
    ctx.fillText('RPM →', clamp(ar[0] - 20, 8, w - 60), clamp(ar[1] + 16, 12, h - 30));
    ctx.fillText(LOAD_LABEL() + ' →', clamp(al[0] - 30, 8, w - 110), clamp(al[1] + 16, 12, h - 30));
  }
  const LOAD_LABEL = () => (window.RL_I18N && window.RL_I18N.t('sm.load')) || 'LOAD';
  function line(a, b) { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }

  function frame(now) {
    const dt = clamp((now - lastNow) / 1000, 0, 0.05); lastNow = now;
    if (t < 1) {
      t = Math.min(1, t + dt / 1.1);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;     // easeInOutCubic
      const over = Math.sin(t * Math.PI) * 0.06 * (to === G_STOCK ? 0 : 1);      // slight overshoot "rev"
      for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) cur[j][i] = from[j][i] + (to[j][i] - from[j][i]) * e + over * (to[j][i] - G_STOCK[j][i]);
    }
    if (autoSpin && !drag) yaw += dt * 0.12;
    draw();
    raf = (visible && (t < 1 || autoSpin || drag)) ? requestAnimationFrame(frame) : 0;
  }
  function kick() { if (!raf && visible) { lastNow = performance.now(); raf = requestAnimationFrame(frame); } else if (!visible) draw(); }

  /* ---------- Drag to rotate ---------- */
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; canvas.setPointerCapture(e.pointerId); autoSpin = false; canvas.classList.add('dragging'); kick(); });
  canvas.addEventListener('pointermove', e => { if (!drag) return; yaw = drag.yaw + (e.clientX - drag.x) * 0.008; pitch = clamp(drag.pitch - (e.clientY - drag.y) * 0.004, 0.22, 0.9); kick(); });
  const end = () => { drag = null; canvas.classList.remove('dragging'); };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

  const sb = $('smStockBtn'); sb && sb.addEventListener('click', toggleStock);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { rootMargin: '80px' }).observe(canvas);
  addEventListener('resize', () => { if (!raf) draw(); });
  if (window.RL_I18N) window.RL_I18N.onChange(() => { if (!raf) draw(); });

  window.RL_STAGEMAP = { set };
  updateReadout(); draw();
})();
