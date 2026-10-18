/*!
 * Redliners Performance — scroll-scrubbed hero video
 *
 * Scroll drives video.currentTime; the video never plays on its own.
 *   • The hero is pinned for 3 × viewport height of scroll — one viewport per phase.
 *   • Phase boundaries come from data-phases on the section, in seconds of video
 *     (e.g. "0,3,5.5,10"). Each phase gets an equal share of scroll even though the
 *     clips have different lengths, so every "scroll" feels the same.
 *   • ScrollTrigger snaps to the four resting points (start + end of each phase),
 *     so a flick of the wheel or a swipe carries the user to the next checkpoint.
 *   • A requestAnimationFrame loop eases the video toward the scroll target and only
 *     issues a new seek once the previous one has finished — no seek backlog, no stutter.
 *
 * Requires gsap 3.12+ and ScrollTrigger loaded before this file.
 */
(function () {
  'use strict';

  const hero = document.querySelector('[data-scrub-hero]');
  if (!hero) return;

  const video   = hero.querySelector('video');
  const caps    = [...hero.querySelectorAll('[data-cap]')];
  const rail    = [...hero.querySelectorAll('[data-rail]')];
  const loadBar = hero.querySelector('[data-load]');

  const PHASES  = (hero.dataset.phases || '0,3,5.5,10').split(',').map(Number); // 4 numbers → 3 phases
  const N       = PHASES.length - 1;                                             // 3
  const FPS     = +(hero.dataset.fps || 24);
  const FRAME   = 1 / FPS;
  const reduce  = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow  = matchMedia('(max-width: 767px)');
  const clamp   = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ------------------------------------------------------------------
     1. Pick a source and load the whole file into memory.
        A blob: URL means every seek is served from RAM instead of a
        network range request — the single biggest win for smooth scrubbing.
     ------------------------------------------------------------------ */
  const saveData = navigator.connection && navigator.connection.saveData;
  const src = (narrow.matches || saveData) ? hero.dataset.srcMobile : hero.dataset.srcDesktop;

  video.muted = true;            // required for iOS to decode without a user gesture
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.preload = 'auto';
  video.pause();

  let ready = false;
  const setLoad = f => { if (loadBar) loadBar.style.transform = `scaleX(${clamp(f, 0, 1).toFixed(3)})`; };

  async function loadVideo() {
    try {
      const res = await fetch(src);
      if (!res.ok || !res.body) throw new Error('HTTP ' + res.status);
      const total = +res.headers.get('content-length') || 0;
      const reader = res.body.getReader();
      const chunks = []; let got = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value); got += value.length;
        if (total) setLoad(got / total);
      }
      video.src = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
    } catch (e) {
      video.src = src;           // fallback: let the browser stream it
    }
    setLoad(1);
  }

  video.addEventListener('loadeddata', () => {
    ready = true;
    hero.classList.add('is-ready');
    // iOS Safari only paints seeks after the element has "played" once.
    const p = video.play();
    if (p && p.then) p.then(() => { video.pause(); seekTo(target, true); }).catch(() => {});
    seekTo(target, true);
  }, { once: true });

  // Second chance for iOS: unlock on the first touch if the muted play above was refused
  const unlock = () => {
    const p = video.play();
    if (p && p.then) p.then(() => video.pause()).catch(() => {});
    removeEventListener('touchstart', unlock);
  };
  addEventListener('touchstart', unlock, { passive: true, once: true });

  /* ------------------------------------------------------------------
     2. Map scroll progress (0..1) → video time, phase by phase.
     ------------------------------------------------------------------ */
  function timeAt(p) {
    const x = clamp(p, 0, 1) * N;
    const i = Math.min(Math.floor(x), N - 1);
    const f = x - i;
    return PHASES[i] + (PHASES[i + 1] - PHASES[i]) * f;
  }

  /* ------------------------------------------------------------------
     3. Smooth seek loop
     ------------------------------------------------------------------ */
  let target = 0;        // where the scroll says we should be (seconds)
  let shown  = 0;        // eased time we are heading through (seconds)
  let lastFrame = -1;    // last frame index actually requested
  let raf = 0, last = performance.now();

  function seekTo(t, force) {
    if (!ready) return;
    const end = (video.duration || PHASES[N]) - FRAME * 0.5;   // never seek to the exact end (black frame on some browsers)
    const frame = Math.round(clamp(t, 0, end) * FPS);
    if (!force && (frame === lastFrame || video.seeking)) return;
    lastFrame = frame;
    video.currentTime = Math.min(frame * FRAME + FRAME * 0.25, end);  // land inside the frame, not on its edge
  }

  function tick(now) {
    const dt = clamp((now - last) / 1000, 0, 0.05); last = now;
    // ease toward the target; ~120 ms time-constant feels tied to the finger but not jittery
    shown += (target - shown) * (1 - Math.exp(-dt * 9));
    if (Math.abs(target - shown) < FRAME * 0.25) shown = target;
    seekTo(shown);
    raf = (shown !== target || video.seeking) ? requestAnimationFrame(tick) : 0;
  }
  const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
  // when a seek finishes while we're idle, make sure the final frame is the right one
  video.addEventListener('seeked', () => { if (Math.round(shown * FPS) !== lastFrame) kick(); });

  /* ------------------------------------------------------------------
     4. Captions + phase rail
     ------------------------------------------------------------------ */
  let lastCap = -1;
  function paintUI(p) {
    const x = clamp(p, 0, 1) * N;          // 0..3
    const stop = Math.round(x);            // nearest resting point 0,1,2,3
    const dist = Math.abs(x - stop);       // 0 at rest, 0.5 halfway between
    caps.forEach((c, i) => {
      const on = i === stop;
      const o = on ? clamp(1 - dist * 3, 0, 1) : 0;
      c.style.opacity = o.toFixed(3);
      c.style.transform = `translateY(${on ? (dist * 40).toFixed(1) : 24}px)`;
      c.classList.toggle('is-on', on && o > 0);
      if (on) c.removeAttribute('aria-hidden'); else c.setAttribute('aria-hidden', 'true');
    });
    if (stop !== lastCap) { lastCap = stop; hero.dataset.stop = stop; }
    const axis = narrow.matches ? 'scaleX' : 'scaleY';
    rail.forEach((li, i) => {
      const f = clamp(x - i, 0, 1);
      li.querySelector('.scrub-rail__fill').style.transform = `${axis}(${f.toFixed(3)})`;
      li.classList.toggle('is-done', f >= 1);
      li.classList.toggle('is-active', f > 0 && f < 1 || (i === Math.min(stop, N - 1) && f < 1));
    });
    hero.classList.toggle('is-scrolled', p > 0.01);
  }

  /* ------------------------------------------------------------------
     5. Reduced motion → a still hero, no pin
     ------------------------------------------------------------------ */
  if (reduce || !window.gsap || !window.ScrollTrigger) {
    hero.classList.add('is-static');
    loadVideo();
    paintUI(0);
    return;
  }

  /* ------------------------------------------------------------------
     6. Pin + scrub + snap
     ------------------------------------------------------------------ */
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });   // the URL bar collapsing must not re-pin

  const stops = Array.from({ length: N + 1 }, (_, i) => i / N);   // [0, 1/3, 2/3, 1]

  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: () => '+=' + Math.round(window.innerHeight * N),  // one viewport of scroll per phase
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    snap: {
      snapTo: stops,
      directional: true,                 // a small nudge down goes to the NEXT stop, not back
      duration: { min: 0.35, max: 1.1 },
      delay: 0.06,
      ease: 'power2.inOut',
      inertia: false
    },
    onUpdate(self) {
      target = timeAt(self.progress);
      paintUI(self.progress);
      kick();
    }
  });

  narrow.addEventListener && narrow.addEventListener('change', () => ScrollTrigger.refresh());

  loadVideo();
  paintUI(0);

  // Optional API for the rest of the page, e.g. a "Skip intro" link
  window.RL_SCRUB = {
    goTo(stop) {
      const st = ScrollTrigger.getAll().find(s => s.trigger === hero);
      if (!st) return;
      const y = st.start + (st.end - st.start) * clamp(stop / N, 0, 1);
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
})();
