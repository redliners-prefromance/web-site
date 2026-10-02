/*!
 * Redliners Performance — "Process" section
 * As each step reaches the middle of the screen:
 *   • the progress rail fills and the step lights up
 *   • the console types that step's log
 *   • the 3D boost map morphs from stock to tuned from the "Calibration" step on
 */
(function () {
  'use strict';
  const section = document.getElementById('process');
  if (!section) return;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const steps = $$('[data-step]', section);
  const rail = $('#procFill', section);
  const list = $('#procList', section);
  const term = $('#procTerm', section);
  const stepLabel = $('#procStepNo', section);
  const canvas = $('#procMap', section);
  const tagEl = $('#procMapTag', section);

  const LOGS = [
    ['> diag.scan --all', '  14 modules · 0 active faults', '  boost dev 0.02 bar · fuel trims +1.8%', '  STATUS: HEALTHY ✓'],
    ['> read --mode bench --full', '  INT FLASH  ██████████ 100%', '  EEPROM     ██████████ 100%', '  backup saved: ORI_7F3A.bin ✓'],
    ['> winols.find_maps', '  boost_target   16×16 @0x1C4A0', '  inj_quantity   16×12 @0x1D210', '  torque_limit    8×16 @0x1E980'],
    ['> calibrate --stage 1', '  boost  +0.35 bar @ 2000–3500 rpm', '  torque limit  340 → 410 Nm', '  checksum corrected ✓'],
    ['> write --verify', '  WRITE   ██████████ 100%', '  VERIFY OK · adaptations reset', '  ECU READY ✓'],
    ['> dyno.run x3', '  190 PS · 410 Nm  (+40 PS / +70 Nm)', '  EGT 742 °C · λ 1.18 · knock 0', '  WITHIN LIMITS ✓'],
    ['> handover', '  dyno sheet exported', '  ORI file archived', '  DONE — enjoy the drive ✓']
  ];

  /* ---------- Console typing ---------- */
  let typeToken = 0;
  function typeLog(i) {
    const token = ++typeToken;
    const lines = LOGS[i] || [];
    if (stepLabel) stepLabel.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(steps.length).padStart(2, '0');
    term.innerHTML = '';
    if (reduce) { term.innerHTML = lines.map(l => `<div class="${lineClass(l)}">${esc(l)}</div>`).join(''); return; }
    let li = 0, ci = 0, row = null;
    (function tick() {
      if (token !== typeToken) return;
      if (li >= lines.length) { const c = document.createElement('span'); c.className = 'proc-caret'; term.appendChild(c); return; }
      if (!row) { row = document.createElement('div'); row.className = lineClass(lines[li]); term.appendChild(row); }
      ci += lines[li].startsWith('>') ? 1 : 3;
      row.textContent = lines[li].slice(0, ci);
      if (ci >= lines[li].length) { li++; ci = 0; row = null; setTimeout(tick, 120); } else setTimeout(tick, 14);
    })();
  }
  const esc = t => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const lineClass = l => l.startsWith('>') ? 'cmd' : (/✓/.test(l) ? 'ok' : 'out');

  /* ---------- Active step ---------- */
  let active = -1;
  function setActive(i) {
    if (i === active) return;
    active = i;
    steps.forEach((s, k) => { s.classList.toggle('is-active', k === i); s.classList.toggle('is-done', k < i); });
    typeLog(i);
    morphTarget = i >= 3 ? 1 : 0;
    if (tagEl) tagEl.classList.toggle('tuned', i >= 3);
  }
  function onScroll() {
    const mid = innerHeight * 0.5;
    let best = 0, bestD = Infinity;
    steps.forEach((s, k) => { const r = s.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - mid); if (d < bestD) { bestD = d; best = k; } });
    setActive(best);
    const lr = list.getBoundingClientRect();
    rail.style.transform = `scaleY(${clamp((mid - lr.top) / lr.height, 0, 1).toFixed(4)})`;
  }
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } }, { passive: true });
  addEventListener('resize', onScroll);

  /* ---------- 3D boost map (canvas, isometric wireframe surface) ---------- */
  const ctx = canvas && canvas.getContext('2d');
  const NX = 16, NY = 16;
  let morph = 0, morphTarget = 0, visible = false, raf = 0, t0 = performance.now();
  const stock = (x, y) => { // x = rpm 0..1, y = load 0..1
    const spool = 1 / (1 + Math.exp(-(x - 0.22) * 14));
    const taper = 1 - Math.max(0, x - 0.7) * 0.9;
    return 0.12 + 0.62 * spool * taper * (0.25 + 0.75 * y);
  };
  const gain = (x, y) => Math.exp(-((x - 0.45) ** 2) / 0.07) * y * 0.32;
  const height = (x, y, m) => stock(x, y) + gain(x, y) * m;
  const colorAt = h => { // cyan → amber → red by height
    const t = clamp((h - 0.1) / 0.85, 0, 1);
    const stops = [[34, 211, 238], [250, 204, 21], [255, 30, 60]];
    const seg = t < 0.5 ? 0 : 1, f = seg ? (t - 0.5) * 2 : t * 2;
    const a = stops[seg], b = stops[seg + 1];
    return [0, 1, 2].map(k => Math.round(a[k] + (b[k] - a[k]) * f));
  };
  function draw(now) {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const sway = reduce ? 0 : Math.sin((now - t0) / 2600) * 0.18;
    const ang = -0.78 + sway, ca = Math.cos(ang), sa = Math.sin(ang);
    const S = Math.min(w, h * 1.5) * 0.5, H = h * 0.62;
    const proj = (x, y, z) => { // x,y in -0.5..0.5, z 0..1
      const rx = x * ca - y * sa, ry = x * sa + y * ca;
      return [w / 2 + rx * S * 1.25, h * 0.66 + ry * S * 0.55 - z * H];
    };
    const P = [];
    for (let j = 0; j < NY; j++) { P[j] = []; for (let i = 0; i < NX; i++) { const x = i / (NX - 1), y = j / (NY - 1), z = height(x, y, morph); P[j][i] = { p: proj(x - 0.5, y - 0.5, z), z }; } }
    // floor grid
    ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1;
    for (let k = 0; k < NX; k += 3) { const a = proj(k / (NX - 1) - .5, -.5, 0), b = proj(k / (NX - 1) - .5, .5, 0); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
    for (let k = 0; k < NY; k += 3) { const a = proj(-.5, k / (NY - 1) - .5, 0), b = proj(.5, k / (NY - 1) - .5, 0); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
    // quads back-to-front
    const quads = [];
    for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++) {
      const q = [P[j][i], P[j][i + 1], P[j + 1][i + 1], P[j + 1][i]];
      quads.push({ q, depth: q.reduce((s, v) => s + v.p[1], 0), z: q.reduce((s, v) => s + v.z, 0) / 4 });
    }
    quads.sort((a, b) => a.depth - b.depth);
    quads.forEach(({ q, z }) => {
      const [r, g, b] = colorAt(z);
      ctx.beginPath(); ctx.moveTo(...q[0].p); for (let k = 1; k < 4; k++) ctx.lineTo(...q[k].p); ctx.closePath();
      ctx.fillStyle = `rgba(${r},${g},${b},${0.16 + z * 0.3})`; ctx.fill();
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.55 + z * 0.35})`; ctx.lineWidth = 0.8; ctx.stroke();
    });
    // axis labels
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.font = '600 10px "JetBrains Mono", monospace';
    const ar = proj(.5, .62, 0), al = proj(-.62, .5, 0);
    ctx.fillText('RPM →', ar[0] - 18, ar[1] + 14); ctx.fillText('LOAD →', al[0] - 40, al[1] + 4);
  }
  function loop(now) {
    morph += (morphTarget - morph) * (reduce ? 1 : 0.045);
    draw(now);
    raf = visible ? requestAnimationFrame(loop) : 0;
  }
  if (ctx) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }, { rootMargin: '100px' }).observe(canvas);
  }

  onScroll();
})();
