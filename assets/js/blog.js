(function () {
  const list = document.getElementById('blog-list');
  if (!list) return;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const okUrl = (u) => (/^(https?:\/\/|\/)/.test(u || '') ? u : '#');
  const KEY = 'vr_saved';
  const getSaved = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const setSaved = (a) => { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} };
  fetch('/blog/posts.json')
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((posts) => {
      posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
      const filters = document.getElementById('blog-filters');
      if (filters && posts.length) {
        const tags = ['All', 'Saved', ...new Set(posts.map((p) => p.tag || 'Tech'))];
        filters.innerHTML = tags.map((t, i) => `<button type="button" class="filter-btn${i ? '' : ' active'}" data-tag="${esc(t)}">${esc(t)}</button>`).join('');
        filters.addEventListener('click', (e) => {
          const b = e.target.closest('button'); if (!b) return;
          filters.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
          applyFilter(b.dataset.tag);
        });
      }
      const applyFilter = (tag) => { const s = getSaved(); list.querySelectorAll('article').forEach((a) => { a.style.display = tag === 'All' || (tag === 'Saved' ? s.indexOf(a.dataset.id) > -1 : a.dataset.tag === tag) ? '' : 'none'; }); };
      if (!posts.length) { list.innerHTML = '<p>The first Tech Radar posts will appear here soon.</p>'; return; }
      list.innerHTML = posts.map((p) => `
        <article class="card" data-id="${esc(p.id)}" data-tag="${esc(p.tag || 'Tech')}" style="padding:0;overflow:hidden">
          <a href="/blog/p/${esc(p.id)}.html" tabindex="-1" aria-hidden="true" style="display:block"><img src="${esc(p.image && /^(https:\/\/|\/)/.test(p.image) ? p.image : '/blog/cover/' + p.id + '.svg')}" alt="" width="1200" height="630" loading="lazy" decoding="async" style="width:100%;height:auto;display:block;aspect-ratio:1200/630;object-fit:cover"></a>
          <div style="padding:1.5rem;position:relative"><button type="button" class="save-star" aria-label="Save for later" aria-pressed="false" data-save="${esc(p.id)}" style="position:absolute;top:1rem;right:1rem;background:none;border:1px solid rgba(201,162,39,.4);border-radius:999px;width:36px;height:36px;color:var(--accent);cursor:pointer;font-size:1.05rem">&#9734;</button>
          <span class="product-tag">${esc(p.tag || 'Tech')}</span>
          <h3 style="margin:.5rem 0"><a href="/blog/p/${esc(p.id)}.html">${esc(p.title)}</a></h3>
          <p style="font-size:.8rem;color:var(--text-muted)">${esc(p.source)} · ${esc(String(p.date || '').slice(0, 10))}</p>
          <p>${esc(p.excerpt)}</p>
          ${p.tag === 'Grants & Funding' ? '<p style="font-size:.85rem;color:var(--text-muted)">Always confirm deadlines and eligibility on the official page before applying.</p>' : p.tag === 'Jobs' ? '<p style="font-size:.85rem;color:var(--text-muted)">Check details with the employer. Never pay to get a job.</p>' : ''}
          ${p.take ? `<p><strong>Our take${p.takeAI ? " (AI-assisted)" : ""}:</strong> ${esc(p.take)}</p>` : ''}
          <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.5rem">
            <a class="btn btn-primary btn-sm" href="/blog/p/${esc(p.id)}.html">${p.tag === 'Grants & Funding' || p.tag === 'Jobs' ? 'Read the details' : 'Read more'}</a>
            ${p.cta && p.cta.href ? `<a class="btn btn-secondary btn-sm" href="${esc(okUrl(p.cta.href))}">${esc(p.tag === 'Grants & Funding' ? 'Need a website for your application?' : (p.cta.label || 'Learn more'))}</a>` : ''}
          </div></div>
        </article>`).join('');
      const paintStars = () => { const s = getSaved(); list.querySelectorAll('.save-star').forEach((b) => { const on = s.indexOf(b.dataset.save) > -1; b.setAttribute('aria-pressed', String(on)); b.innerHTML = on ? '&#9733;' : '&#9734;'; }); const sb = document.querySelector('#blog-filters [data-tag="Saved"]'); if (sb) sb.textContent = s.length ? 'Saved (' + s.length + ')' : 'Saved'; };
      list.addEventListener('click', (e) => { const b = e.target.closest('.save-star'); if (!b) return; const s = getSaved(), i = s.indexOf(b.dataset.save); if (i > -1) s.splice(i, 1); else s.push(b.dataset.save); setSaved(s); paintStars(); const act = document.querySelector('#blog-filters .active'); if (act && act.dataset.tag === 'Saved') applyFilter('Saved'); });
      paintStars();
    })
    .catch(() => { list.innerHTML = '<p>Posts could not be loaded right now.</p>'; });
})();
