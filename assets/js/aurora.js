// Living hero: gold constellation that drifts and bends toward the cursor / touch.
(function () {
  const hero = document.querySelector('.hero-section, section.hero');
  if (!hero || location.pathname.indexOf('/payment') === 0) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const st = document.createElement('style');
  st.textContent = '.vr-aurora{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0}.hero-section,section.hero{position:relative;overflow:hidden}.hero-section>.hero-content,section.hero>.hero-grid{position:relative;z-index:1}';
  document.head.appendChild(st);
  const cv = document.createElement('canvas'); cv.className = 'vr-aurora'; cv.setAttribute('aria-hidden', 'true');
  hero.insertBefore(cv, hero.firstChild);
  const ctx = cv.getContext('2d');
  let w = 0, h = 0, pts = [], raf = 0, visible = true;
  const mouse = { x: -9999, y: -9999 };
  const light = () => document.documentElement.getAttribute('data-theme') === 'light';

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let n = Math.min(90, Math.round((w * h) / 14000));
    if ((navigator.hardwareConcurrency || 4) <= 2) n = Math.round(n / 2);
    pts = Array.from({ length: n }, (_, i) => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: 1 + Math.random() * 1.6, c: i % 6 === 0 ? '163,35,74' : (light() ? '143,111,12' : '201,162,39') }));
    draw();
  }
  function step() {
    for (const p of pts) {
      const dx = mouse.x - p.x, dy = mouse.y - p.y, d2 = dx * dx + dy * dy;
      if (d2 < 22500 && d2 > 1) { const d = Math.sqrt(d2), f = (150 - d) / 150 * 0.04; p.vx += dx / d * f; p.vy += dy / d * f; }
      p.vx *= 0.985; p.vy *= 0.985;
      const sp = Math.hypot(p.vx, p.vy); if (sp < 0.12) { p.vx += (Math.random() - 0.5) * 0.03; p.vy += (Math.random() - 0.5) * 0.03; } if (sp > 1.6) { p.vx *= 0.9; p.vy *= 0.9; }
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
    }
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    const base = light() ? 0.5 : 1;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < 14400) { ctx.strokeStyle = `rgba(${a.c},${(1 - d2 / 14400) * 0.22 * base})`; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      const mx = mouse.x - a.x, my = mouse.y - a.y, md = mx * mx + my * my;
      if (md < 28900) { ctx.strokeStyle = `rgba(232,205,122,${(1 - md / 28900) * 0.55 * base})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
      ctx.fillStyle = `rgba(${a.c},${0.75 * base})`; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832); ctx.fill();
    }
  }
  function loop() { if (visible && !document.hidden) { step(); draw(); } raf = requestAnimationFrame(loop); }

  size();
  if ('ResizeObserver' in window) new ResizeObserver(size).observe(hero); else addEventListener('resize', size);
  if (reduce) return; // one calm static frame only
  const move = (e) => { const r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
  hero.addEventListener('pointermove', move, { passive: true });
  hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  if ('IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(hero);
  raf = requestAnimationFrame(loop);
})();
