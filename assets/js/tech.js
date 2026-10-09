/* VibrantRevolve tech layer: adds decorative extras only. Nothing here is needed for the site to work. */
(function () {
  'use strict'; const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function eyebrows() {
    $$('.section-header').forEach((h, i) => {
      if ($('.tx-eyebrow', h)) return; const sec = h.closest('section'); const id = (sec && (sec.id || '')) || ''; const small = $('.section-tag, .section-label, .eyebrow', h);
      const label = (small ? small.textContent : id.replace(/-/g, ' ')).trim().toUpperCase().slice(0, 22); if (!label && !id) return;
      const e = document.createElement('span'); e.className = 'tx-eyebrow'; e.innerHTML = '<b>//</b> ' + String(i + 1).padStart(2, '0') + ' <b>/</b> ' + (label || 'SECTION').replace(/[<>&]/g, ''); if (small) small.style.display = 'none'; h.insertBefore(e, h.firstChild);
    });
  }
  function hero() {
    const h = $('.hero'); if (!h) return;
    if (!$('.tx-aurora', h)) { const a = document.createElement('div'); a.className = 'tx-aurora'; a.setAttribute('aria-hidden', 'true'); a.innerHTML = '<i></i><i></i><i></i>'; h.insertBefore(a, h.firstChild); }
    const w = $('.code-window', h); if (w && !$('.tx-bar', w)) {
      const b = document.createElement('div'); b.className = 'tx-bar'; b.innerHTML = '<i></i><i></i><i></i><span>build.ts — vibrantrevolve</span>'; w.insertBefore(b, w.firstChild);
      const o = document.createElement('div'); o.className = 'tx-out'; o.innerHTML = '$ npm run launch → <em>✓ live in 24h</em>'; w.appendChild(o);
    }
    if (!$('.tx-marquee')) {
      const items = ['React', 'Node.js', 'TypeScript', 'Python', 'Flutter', 'PostgreSQL', 'Cloudflare', 'Paystack', 'Flutterwave', 'Tailwind', 'Docker', 'Figma'], row = items.map((t) => '<span>' + t + '</span>').join('');
      const m = document.createElement('div'); m.className = 'tx-marquee'; m.setAttribute('aria-hidden', 'true'); m.innerHTML = '<div class="tx-track">' + row + row + '</div>'; h.parentNode.insertBefore(m, h.nextSibling);
    }
  }
  function glow() {
    if (reduce || !matchMedia('(hover:hover) and (pointer:fine)').matches || $('.tx-glow')) return; const g = document.createElement('div'); g.className = 'tx-glow'; g.setAttribute('aria-hidden', 'true'); document.body.appendChild(g);
    let x = 0, y = 0, raf = 0; addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; g.classList.add('on'); if (!raf) raf = requestAnimationFrame(() => { g.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)'; raf = 0; }); }, { passive: true });
    document.addEventListener('mouseleave', () => g.classList.remove('on'));
  }
  function status() {
    const ft = $('.site-footer, footer.footer'); if (!ft || $('.tx-status')) return false; const f = $('.footer-brand', ft) || $('.footer-bottom', ft) || ft; const s = document.createElement('div'); s.className = 'tx-status';
    const tick = () => { let t = ''; try { t = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' }); } catch (e) {} s.textContent = 'All systems operational · Lagos ' + t + ' WAT'; }; tick(); setInterval(tick, 30000); f.appendChild(s); return true;
  }
  function init() { eyebrows(); hero(); glow(); let n = 0; const iv = setInterval(() => { if (status() || ++n > 40) clearInterval(iv); }, 250); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
