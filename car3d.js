/*!
 * Redliners Performance — "Signal Path" scroll-driven 3D scene
 * X-ray car with wiring harness and control modules. As the page scrolls,
 * a signal travels OBD → Gateway → ECU → TCU → DCU while the camera glides
 * from module to module. Requires THREE (r128+) loaded globally.
 */
(function () {
  'use strict';

  const section = document.getElementById('anatomy');
  if (!section) return;

  const canvas  = document.getElementById('carCanvas');
  const panels  = [...section.querySelectorAll('[data-chapter]')];
  const ticks   = [...section.querySelectorAll('[data-tick]')];
  const fillBar = section.querySelector('#signalFill');
  const pctEl   = section.querySelector('#signalPct');
  const labels  = Object.fromEntries([...section.querySelectorAll('[data-mod]')].map(el => [el.dataset.mod, el]));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const N = panels.length; // chapters: intro, obd, ecu, tcu, dcu, outro
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = t => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- Scroll → chapter progress (shared by WebGL and fallback) ---------- */
  function rawProgress() {
    const r = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    return clamp(-r.top / Math.max(1, total), 0, 1) * (N - 1);
  }
  // Each chapter "dwells" for the first 30% of its scroll span, then transitions.
  function dwell(raw) {
    const i = Math.min(Math.floor(raw), N - 1);
    if (i >= N - 1) return N - 1;
    const f = clamp((raw - i - 0.3) / 0.7, 0, 1);
    return i + smooth(f);
  }
  let activeChapter = -1;
  function setChapter(p) {
    const c = clamp(Math.round(p), 0, N - 1);
    if (c === activeChapter) return;
    activeChapter = c;
    panels.forEach((el, i) => el.classList.toggle('is-active', i === c));
    ticks.forEach((el, i) => { el.classList.toggle('is-active', i === c); el.classList.toggle('is-done', i < c); });
  }

  /* ---------- WebGL availability ---------- */
  let renderer;
  try {
    if (!window.THREE) throw new Error('three missing');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    section.classList.add('no-webgl');
    const fallbackLoop = () => { setChapter(dwell(rawProgress())); };
    window.addEventListener('scroll', fallbackLoop, { passive: true });
    fallbackLoop();
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x07080a, 7, 16);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 60);

  /* ---------- Palette & shared materials ---------- */
  const RED = new THREE.Color('#ff1e3c');
  const CYAN = new THREE.Color('#22d3ee');
  const WHITE = new THREE.Color('#ffffff');

  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.18, 'rgba(255,255,255,.75)');
    grd.addColorStop(0.45, 'rgba(255,255,255,.18)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  })();
  const makeGlow = (color, size, opacity = 1) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    s.scale.setScalar(size); return s;
  };
  const lineMat = (color, opacity) => new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
  const edgesOf = (geo, color, opacity, angle = 30) => new THREE.LineSegments(new THREE.EdgesGeometry(geo, angle), lineMat(color, opacity));

  /* ---------- Lights ---------- */
  scene.add(new THREE.HemisphereLight(0x8fb4ff, 0x120406, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.6); key.position.set(4, 6, 5); scene.add(key);
  const rimRed = new THREE.DirectionalLight(0xff1e3c, 1.1); rimRed.position.set(-6, 2, -4); scene.add(rimRed);
  const rimCyan = new THREE.DirectionalLight(0x22d3ee, 0.6); rimCyan.position.set(6, 1.5, -6); scene.add(rimCyan);

  const car = new THREE.Group(); scene.add(car);

  /* ---------- Floor: grid + under-glow ---------- */
  const grid = new THREE.GridHelper(24, 48, 0x3a0a12, 0x15181e);
  grid.material.transparent = true; grid.material.opacity = 0.55; grid.material.depthWrite = false;
  scene.add(grid);
  const under = new THREE.Mesh(new THREE.PlaneGeometry(7, 3.6), new THREE.MeshBasicMaterial({
    map: glowTex, color: RED, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  under.rotation.x = -Math.PI / 2; under.position.y = 0.005; scene.add(under);

  /* ---------- Body: extruded side profile, rendered as an X-ray shell ---------- */
  const W = 1.62; // body width (z)
  const shape = new THREE.Shape();
  shape.moveTo(-2.3, 0.42);
  shape.bezierCurveTo(-2.4, 0.6, -2.38, 0.86, -2.24, 0.96);   // rear bumper → trunk lip
  shape.lineTo(-1.72, 1.03);                                     // trunk deck
  shape.bezierCurveTo(-1.45, 1.22, -1.25, 1.36, -0.95, 1.40);    // rear window
  shape.bezierCurveTo(-0.4, 1.47, 0.05, 1.47, 0.32, 1.42);       // roof
  shape.bezierCurveTo(0.6, 1.3, 0.85, 1.12, 1.0, 1.04);          // windshield
  shape.bezierCurveTo(1.5, 0.98, 1.95, 0.93, 2.2, 0.86);         // hood
  shape.bezierCurveTo(2.36, 0.8, 2.4, 0.6, 2.34, 0.42);          // nose
  shape.lineTo(1.95, 0.3);
  shape.lineTo(1.93, 0.38);
  shape.absarc(1.45, 0.38, 0.48, 0, Math.PI, false);             // front arch
  shape.lineTo(0.97, 0.3);
  shape.lineTo(-0.97, 0.3);
  shape.lineTo(-0.97, 0.38);
  shape.absarc(-1.45, 0.38, 0.48, 0, Math.PI, false);            // rear arch
  shape.lineTo(-1.95, 0.3);
  shape.lineTo(-2.3, 0.42);

  const bodyGeo = new THREE.ExtrudeGeometry(shape, {
    depth: W, curveSegments: 28, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.1, bevelSegments: 5
  });
  bodyGeo.translate(0, 0, -W / 2);
  const body = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({
    color: 0x0c0f15, metalness: 0.7, roughness: 0.28, transparent: true, opacity: 0.16,
    side: THREE.DoubleSide, depthWrite: false
  }));
  car.add(body);
  const bodyEdges = edgesOf(bodyGeo, RED, 0.28, 38); car.add(bodyEdges);

  // Contour ribs: the profile repeated across the width — blueprint look.
  const profilePts = shape.getPoints(40).map(p => new THREE.Vector3(p.x, p.y, 0));
  const ribGeo = new THREE.BufferGeometry().setFromPoints(profilePts);
  const ribs = [];
  [-0.86, -0.43, 0, 0.43, 0.86].forEach((z, i) => {
    const rib = new THREE.LineLoop(ribGeo, lineMat(i === 2 ? WHITE : CYAN, i === 2 ? 0.08 : 0.16));
    rib.position.z = z; rib.scale.set(1, 1, 1); car.add(rib); ribs.push(rib);
  });

  // Glasshouse outline (side windows) on both sides
  const glass = new THREE.Shape();
  glass.moveTo(-1.6, 1.06);
  glass.bezierCurveTo(-1.3, 1.25, -1.1, 1.33, -0.9, 1.35);
  glass.bezierCurveTo(-0.4, 1.4, 0.05, 1.4, 0.28, 1.36);
  glass.bezierCurveTo(0.5, 1.26, 0.7, 1.14, 0.86, 1.06);
  glass.lineTo(-1.6, 1.06);
  const glassPts = glass.getPoints(30).map(p => new THREE.Vector3(p.x, p.y, 0));
  [-W / 2 - 0.135, W / 2 + 0.135].forEach(z => {
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(glassPts), lineMat(CYAN, 0.45));
    l.position.z = z; car.add(l);
  });

  // Light signatures
  const lightBar = (x, y, z, w, color, op) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.035, w), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op }));
    m.position.set(x, y, z); car.add(m);
    const g = makeGlow(color, 0.5, 0.55); g.position.set(x + Math.sign(x) * 0.05, y, z); car.add(g);
    return m;
  };
  [-0.62, 0.62].forEach(z => { lightBar(2.36, 0.74, z, 0.32, CYAN, 0.9); lightBar(-2.36, 0.88, z, 0.36, RED, 0.95); });

  /* ---------- Wheels ---------- */
  const wheels = [];
  const tireGeo = new THREE.TorusGeometry(0.34, 0.11, 14, 48);
  const rimGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.12, 28, 1, true);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x0a0b0e, roughness: 0.9, metalness: 0.1 });
  [[1.45, 0.86], [1.45, -0.86], [-1.45, 0.86], [-1.45, -0.86]].forEach(([x, z]) => {
    const w = new THREE.Group(); w.position.set(x, 0.45, z);
    const spin = new THREE.Group(); w.add(spin);
    spin.add(new THREE.Mesh(tireGeo, tireMat));
    const rim = new THREE.Mesh(rimGeo, new THREE.MeshStandardMaterial({ color: 0x1a1f28, metalness: 0.9, roughness: 0.3, side: THREE.DoubleSide }));
    rim.rotation.x = Math.PI / 2; spin.add(rim);
    spin.add(edgesOf(tireGeo, CYAN, 0.12, 50));
    // spokes
    const sp = [];
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      sp.push(new THREE.Vector3(Math.cos(a) * 0.05, Math.sin(a) * 0.05, 0), new THREE.Vector3(Math.cos(a + 0.12) * 0.24, Math.sin(a + 0.12) * 0.24, 0));
    }
    const spokes = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(sp), lineMat(WHITE, 0.45));
    spokes.position.z = Math.sign(z) * 0.06; spin.add(spokes);
    // brake disc + caliper
    const disc = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.2, 32), new THREE.MeshBasicMaterial({ color: 0x2a2f38, side: THREE.DoubleSide }));
    disc.position.z = -Math.sign(z) * 0.01; w.add(disc);
    const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.14, 0.06), new THREE.MeshBasicMaterial({ color: RED }));
    caliper.position.set(-0.13, 0.12, Math.sign(z) * 0.0); w.add(caliper);
    car.add(w); wheels.push(spin);
  });

  /* ---------- Mechanical "ghost" parts ---------- */
  const ghost = (geo, pos, rot) => {
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x141821, transparent: true, opacity: 0.45, metalness: 0.6, roughness: 0.5, depthWrite: false }));
    m.position.set(...pos); if (rot) m.rotation.set(...rot);
    const e = edgesOf(geo, WHITE, 0.14, 20); e.position.copy(m.position); e.rotation.copy(m.rotation);
    car.add(m, e); return m;
  };
  ghost(new THREE.BoxGeometry(0.62, 0.42, 0.72), [1.58, 0.66, 0.02]);                      // engine block
  ghost(new THREE.BoxGeometry(0.5, 0.06, 0.62), [1.58, 0.9, 0.02]);                        // cam cover
  ghost(new THREE.CylinderGeometry(0.15, 0.2, 0.95, 16), [0.85, 0.44, 0], [0, 0, Math.PI / 2]); // gearbox
  ghost(new THREE.CylinderGeometry(0.035, 0.035, 2.1, 10), [-0.35, 0.36, 0], [0, 0, Math.PI / 2]); // driveshaft
  ghost(new THREE.CylinderGeometry(0.13, 0.13, 0.32, 20), [-1.72, 0.56, 0.5]);              // AdBlue tank
  // exhaust line
  const exhaustCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.32, 0.48, -0.32), new THREE.Vector3(1.0, 0.3, -0.36), new THREE.Vector3(0.1, 0.27, -0.38),
    new THREE.Vector3(-1.1, 0.28, -0.4), new THREE.Vector3(-2.0, 0.3, -0.42), new THREE.Vector3(-2.42, 0.33, -0.45)
  ]);
  car.add(new THREE.Mesh(new THREE.TubeGeometry(exhaustCurve, 80, 0.04, 10), new THREE.MeshStandardMaterial({ color: 0x2b303a, metalness: 0.9, roughness: 0.35 })));
  ghost(new THREE.CylinderGeometry(0.11, 0.11, 0.5, 18), [-0.55, 0.28, -0.38], [0, 0, Math.PI / 2]); // DPF/SCR can

  /* ---------- Control modules ---------- */
  const MODULES = {
    obd: { pos: [0.55, 0.62, 0.45], size: [0.16, 0.06, 0.2] },
    gw:  { pos: [0.22, 0.74, 0.0],  size: [0.2, 0.06, 0.16] },
    ecu: { pos: [1.62, 0.98, -0.48], size: [0.4, 0.07, 0.3] },
    tcu: { pos: [0.76, 0.62, 0.0],  size: [0.3, 0.06, 0.24] },
    dcu: { pos: [-1.22, 0.42, 0.46], size: [0.32, 0.07, 0.24] }
  };
  Object.entries(MODULES).forEach(([k, m]) => {
    const geo = new THREE.BoxGeometry(...m.size);
    const mat = new THREE.MeshStandardMaterial({ color: 0x12161d, metalness: 0.5, roughness: 0.4, emissive: RED.clone(), emissiveIntensity: 0 });
    const mesh = new THREE.Mesh(geo, mat); mesh.position.set(...m.pos);
    const edges = edgesOf(geo, WHITE, 0.5, 10); edges.position.copy(mesh.position);
    // little PCB "chip" detail on top
    const chip = new THREE.Mesh(new THREE.BoxGeometry(m.size[0] * 0.35, 0.012, m.size[2] * 0.35), new THREE.MeshBasicMaterial({ color: 0x0a0a0a }));
    chip.position.set(m.pos[0], m.pos[1] + m.size[1] / 2 + 0.006, m.pos[2]);
    const halo = makeGlow(RED, 0.9, 0); halo.position.copy(mesh.position);
    car.add(mesh, edges, chip, halo);
    Object.assign(m, { mesh, edges, halo, level: 0, vec: new THREE.Vector3(...m.pos) });
  });

  /* ---------- Main harness (signal path) ---------- */
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const mainPts = [
    V(...MODULES.obd.pos), V(0.42, 0.7, 0.22), V(...MODULES.gw.pos), V(0.55, 0.88, -0.28),
    V(1.08, 1.02, -0.42), V(...MODULES.ecu.pos), V(1.36, 0.78, -0.46), V(1.08, 0.66, -0.22),
    V(...MODULES.tcu.pos), V(0.3, 0.5, 0.12), V(-0.45, 0.4, 0.3), V(...MODULES.dcu.pos)
  ];
  const mainCurve = new THREE.CatmullRomCurve3(mainPts, false, 'centripetal', 0.5);
  const TUB = 600, RAD = 10;
  const baseTube = new THREE.Mesh(new THREE.TubeGeometry(mainCurve, TUB, 0.014, RAD), new THREE.MeshStandardMaterial({ color: 0x2a3140, metalness: 0.3, roughness: 0.6 }));
  car.add(baseTube);
  const litCore = new THREE.Mesh(new THREE.TubeGeometry(mainCurve, TUB, 0.018, RAD), new THREE.MeshBasicMaterial({ color: RED }));
  const litHalo = new THREE.Mesh(new THREE.TubeGeometry(mainCurve, TUB, 0.032, RAD), new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending }));
  car.add(litCore, litHalo);
  const setLit = f => {
    const n = Math.floor(clamp(f, 0, 1) * TUB) * RAD * 6;
    litCore.geometry.setDrawRange(0, n); litHalo.geometry.setDrawRange(0, n);
  };

  // where each module sits along the main curve (0..1)
  const tOf = (() => {
    const samples = mainCurve.getSpacedPoints(1000);
    return v => { let best = 0, bd = Infinity; samples.forEach((p, i) => { const d = p.distanceToSquared(v); if (d < bd) { bd = d; best = i; } }); return best / 1000; };
  })();
  Object.values(MODULES).forEach(m => { m.t = tOf(m.vec); });

  // signal head
  const head = makeGlow(RED, 0.55, 1); car.add(head);
  const headCore = makeGlow(WHITE, 0.16, 1); car.add(headCore);
  const headLight = new THREE.PointLight(0xff1e3c, 1.3, 1.2, 2); car.add(headLight);
  // trailing sparks
  const trail = Array.from({ length: 6 }, (_, i) => { const s = makeGlow(RED, 0.3 - i * 0.035, 0.7 - i * 0.1); car.add(s); return s; });

  /* ---------- Secondary harness (ambient data pulses) ---------- */
  const SEC = [
    [MODULES.ecu.pos, [1.82, 1.0, -0.12], [1.98, 0.96, 0.3]],                         // ECU → MAF
    [MODULES.ecu.pos, [1.5, 1.02, -0.2], [1.52, 1.0, 0.15], [1.5, 0.98, 0.36]],        // ECU → injectors
    [MODULES.gw.pos, [0.45, 0.92, 0.35], [0.66, 1.02, 0.48]],                          // GW → cluster
    [MODULES.gw.pos, [-0.6, 0.98, -0.66], [-1.8, 0.92, -0.7], [-2.28, 0.88, -0.62]],   // GW → rear lights
    [MODULES.gw.pos, [1.1, 0.8, 0.66], [2.24, 0.74, 0.62]],                            // GW → front lights
    [MODULES.dcu.pos, [-1.5, 0.48, 0.56], [-1.68, 0.56, 0.52]],                         // DCU → AdBlue tank
    [MODULES.dcu.pos, [-1.6, 0.33, 0.05], [-2.05, 0.34, -0.38]],                        // DCU → NOx sensor
    [MODULES.tcu.pos, [-0.4, 0.42, -0.6], [-1.45, 0.45, -0.72]]                         // TCU → wheel speed
  ].map(pts => {
    const c = new THREE.CatmullRomCurve3(pts.map(p => V(...p)), false, 'centripetal');
    const tube = new THREE.Mesh(new THREE.TubeGeometry(c, 120, 0.009, 6), new THREE.MeshStandardMaterial({ color: 0x232a36, emissive: CYAN.clone(), emissiveIntensity: 0 }));
    car.add(tube);
    const pulses = [0, 0.5].map(o => { const s = makeGlow(CYAN, 0.18, 0); car.add(s); return { s, o }; });
    // endpoint sensor
    const end = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.6 }));
    end.position.copy(c.getPoint(1)); car.add(end);
    return { c, tube, pulses, end, speed: 0.25 + Math.random() * 0.25 };
  });

  /* ---------- Camera choreography (one keyframe per chapter) ---------- */
  const SHOTS = [
    { pos: V(5.4, 2.5, 5.6),    look: V(0, 0.62, 0) },                    // 0 intro — 3/4 front
    { pos: V(-1.35, 2.7, 3.1),  look: V(0.45, 0.66, 0.3) },               // 1 OBD — over the driver's shoulder
    { pos: V(3.6, 2.45, -2.35), look: V(1.4, 0.82, -0.28) },              // 2 ECU — engine bay, front-left
    { pos: V(0.0, 0.62, 3.05),  look: V(0.55, 0.5, 0) },                 // 3 TCU — low, between the wheels
    { pos: V(-3.6, 1.9, 0.9),  look: V(-1.3, 0.45, 0.36) },             // 4 DCU — from behind, low
    { pos: V(-5.2, 3.3, -4.6),  look: V(0, 0.6, 0) }                      // 5 outro — 3/4 rear
  ];
  const camPosCurve = new THREE.CatmullRomCurve3(SHOTS.map(s => s.pos), false, 'centripetal');
  const camLookCurve = new THREE.CatmullRomCurve3(SHOTS.map(s => s.look), false, 'centripetal');
  // signal position per chapter (fraction along the main harness)
  const SIGNAL = [0, MODULES.obd.t + 0.001, MODULES.ecu.t, MODULES.tcu.t, 1, 1];

  /* ---------- Resize ---------- */
  let vw = 0, vh = 0;
  function resize() {
    const r = canvas.getBoundingClientRect();
    vw = Math.max(1, r.width); vh = Math.max(1, r.height);
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    const portrait = vw / vh < 0.9;
    camera.fov = portrait ? 52 : 36;
    // Shift the framing so the car sits beside (desktop) or above (mobile) the text panel
    if (portrait) camera.setViewOffset(vw, vh, 0, vh * 0.14, vw, vh);
    else if (vw >= 1024) camera.setViewOffset(vw, vh, -vw * 0.16, 0, vw, vh);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  /* ---------- Pointer parallax ---------- */
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  if (!reduceMotion) window.addEventListener('pointermove', e => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  /* ---------- Render loop (only while the section is on screen) ---------- */
  let visible = false, rafId = 0, last = performance.now(), time = 0;
  let p = dwell(rawProgress());   // smoothed chapter progress
  const tmpV = new THREE.Vector3(), camPos = new THREE.Vector3(), camLook = new THREE.Vector3();

  function signalAt(pp) {
    const i = Math.min(Math.floor(pp), N - 2), f = pp - i;
    return lerp(SIGNAL[i], SIGNAL[i + 1], f);
  }

  function frame(now) {
    const dt = clamp((now - last) / 1000, 0, 0.05); last = Math.max(last, now); time += dt;

    // Smoothly chase the scroll target → fluid motion even with notchy mouse wheels
    const target = dwell(rawProgress());
    p += (target - p) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 5));
    if (Math.abs(target - p) < 1e-4) p = target;
    p = clamp(p, 0, N - 1);
    setChapter(p);

    const u = p / (N - 1);
    camPosCurve.getPoint(clamp(u, 0, 1), camPos);
    camLookCurve.getPoint(clamp(u, 0, 1), camLook);
    pointer.sx += (pointer.x - pointer.sx) * 0.05; pointer.sy += (pointer.y - pointer.sy) * 0.05;
    const breathe = reduceMotion ? 0 : Math.sin(time * 0.6) * 0.04;
    camera.position.set(camPos.x + pointer.sx * 0.25, camPos.y - pointer.sy * 0.15 + breathe, camPos.z + pointer.sx * 0.12);
    camera.lookAt(camLook);

    // Signal along the main harness
    const sig = signalAt(p);
    setLit(sig);
    mainCurve.getPointAt(clamp(sig, 0, 1), tmpV);
    head.position.copy(tmpV); headCore.position.copy(tmpV); headLight.position.copy(tmpV);
    const flicker = reduceMotion ? 1 : 0.85 + Math.sin(time * 18) * 0.15;
    head.material.opacity = sig > 0.002 && sig < 0.998 ? flicker : (sig >= 0.998 ? 0.5 : 0.0);
    headCore.material.opacity = head.material.opacity;
    headLight.intensity = 1.3 * head.material.opacity;
    trail.forEach((s, i) => {
      mainCurve.getPointAt(clamp(sig - (i + 1) * 0.008, 0, 1), s.position);
      s.material.opacity = head.material.opacity * (0.6 - i * 0.09);
    });

    // Modules light up as the signal reaches them; the current chapter's module glows hardest
    const outro = clamp(p - (N - 2), 0, 1);
    const focus = { 1: 'obd', 2: 'ecu', 3: 'tcu', 4: 'dcu' }[Math.round(p)];
    Object.entries(MODULES).forEach(([k, m]) => {
      const reached = sig >= m.t - 0.004 ? 1 : 0;
      const goal = Math.max(reached * (k === focus ? 1 : 0.35), outro * 0.8);
      m.level += (goal - m.level) * Math.min(1, dt * 6);
      const pulse = k === focus && !reduceMotion ? 0.75 + Math.sin(time * 4) * 0.25 : 1;
      m.mesh.material.emissiveIntensity = m.level * 0.9 * pulse;
      m.edges.material.color.copy(WHITE).lerp(RED, m.level);
      m.edges.material.opacity = 0.35 + m.level * 0.65;
      m.halo.material.opacity = m.level * 0.75 * pulse;
      m.halo.scale.setScalar(0.45 + m.level * 0.4);
    });

    // Secondary harness wakes up in the outro; pulses always flow lightly
    SEC.forEach((s, i) => {
      const wake = Math.max(outro, 0.15);
      s.tube.material.emissiveIntensity = wake * 0.9;
      s.end.material.opacity = 0.25 + wake * 0.6;
      s.pulses.forEach(pl => {
        const t = reduceMotion ? pl.o : (time * s.speed + pl.o + i * 0.13) % 1;
        s.c.getPointAt(t, pl.s.position);
        pl.s.material.opacity = (0.25 + outro * 0.75) * Math.sin(t * Math.PI);
      });
    });

    // Body edges and ribs brighten in the finale; wheels roll with scroll
    bodyEdges.material.opacity = 0.22 + outro * 0.35;
    ribs.forEach((r, i) => { r.material.opacity = (i === 2 ? 0.08 : 0.14) + outro * 0.12; });
    wheels.forEach(w => { w.rotation.z = -p * 2.2; });
    under.material.opacity = 0.22 + outro * 0.25 + (reduceMotion ? 0 : Math.sin(time * 1.4) * 0.03);

    // Project HTML labels onto their modules
    Object.entries(labels).forEach(([k, el]) => {
      const m = MODULES[k]; if (!m) return;
      tmpV.copy(m.vec); car.localToWorld(tmpV); tmpV.project(camera);
      const onScreen = tmpV.z < 1 && Math.abs(tmpV.x) < 1.05 && Math.abs(tmpV.y) < 1.05;
      const x = (tmpV.x * 0.5 + 0.5) * vw, y = (-tmpV.y * 0.5 + 0.5) * vh;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      el.style.opacity = onScreen ? (0.25 + m.level * 0.75).toFixed(2) : 0;
      el.classList.toggle('is-focus', k === focus);
    });

    // HUD
    const pct = Math.round(sig * 100);
    if (fillBar) fillBar.style.transform = `scaleY(${(p / (N - 1)).toFixed(4)})`;
    if (pctEl) pctEl.textContent = String(pct).padStart(3, '0');

    renderer.render(scene, camera);
  }

  function loop(now) {
    frame(now);
    rafId = visible ? requestAnimationFrame(loop) : 0;
  }

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !rafId) { last = performance.now(); resize(); rafId = requestAnimationFrame(loop); }
  }, { rootMargin: '200px 0px' });
  io.observe(section);

  // first paint even before it enters view (avoids an empty canvas flash)
  frame(performance.now());
})();
