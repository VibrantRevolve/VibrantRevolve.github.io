/* Website Audit: the VibrantRevolve Worker fetches a public page and checks search, mobile, speed, safety and customer basics. */
(function () {
  const K = window.VRKit, $ = K.$, root = $('#au-root'); if (!root) return;
  const form = $('#au-form'), out = $('#au-out'), go = $('#au-go');
  const ICON = { ok: '✓', warn: '!', bad: '✕' };
  const wa = () => String((window.VR_CONFIG || {}).whatsapp || '2349012739299');
  const tone = (n) => (n >= 80 ? 'good' : n >= 55 ? 'mid' : 'low');
  const MSG = { url: 'That does not look like a public website address. Try something like yourbusiness.com', unreachable: 'We could not open that site. Check the address, and that the site is online.', notpage: 'That address is not a web page. Try your home page.', 'slow down': 'A lot of audits just ran. Please wait a few minutes and try again.' };

  function fail(msg) { out.innerHTML = '<div class="au-msg" role="alert">' + K.esc(msg) + '</div>'; }
  function show(d) {
    const issues = d.checks.filter((c) => c.level !== 'ok'), bad = d.checks.filter((c) => c.level === 'bad');
    const cats = Object.keys(d.scores);
    const bars = cats.map((c) => '<div class="au-cat" data-tone="' + tone(d.scores[c]) + '"><span>' + c + '</span><div class="au-bar"><i style="width:' + d.scores[c] + '%"></i></div><b>' + d.scores[c] + '</b></div>').join('');
    const lists = cats.map((c) => '<div class="au-group"><h3>' + c + '</h3><ul>' + d.checks.filter((x) => x.cat === c).map((x) =>
      '<li class="au-' + x.level + '"><span class="au-ic" aria-hidden="true">' + ICON[x.level] + '</span><div><b>' + K.esc(x.label) + '</b>' + (x.tip ? '<p>' + K.esc(x.tip) + '</p>' : '') + '</div></li>').join('') + '</ul></div>').join('');
    const top = (bad.length ? bad : issues).slice(0, 4).map((i) => '- ' + i.label).join('\n');
    const msg = 'Hi VibrantRevolve, I ran the website audit on ' + d.url + '.\nScore: ' + d.score + '/100 with ' + issues.length + ' things to fix:\n' + top + '\n\nCan you help me fix them?';
    out.innerHTML = '<div class="au-top"><div class="au-ring" data-tone="' + tone(d.score) + '" style="--p:' + d.score + '"><b>' + d.score + '</b><small>/100</small></div>' +
      '<div class="au-sum"><h2>' + (d.score >= 80 ? 'Solid foundations' : d.score >= 55 ? 'Good start, room to grow' : 'Needs attention') + '</h2><p class="au-url">' + K.esc(d.url) + '</p>' +
      '<p>' + (issues.length ? issues.length + ' things can be improved' + (bad.length ? ', ' + bad.length + ' are important.' : '.') : 'Nothing to fix. Nice work.') + ' Server answered in ' + d.ms + ' ms.</p></div></div>' +
      '<div class="au-cats">' + bars + '</div>' + lists +
      '<div class="tp-actions"><a class="tb tb--wa" target="_blank" rel="noopener" href="https://wa.me/' + wa() + '?text=' + encodeURIComponent(msg) + '">Fix these for me on WhatsApp</a><button type="button" class="tb" id="au-copy">Copy the report</button></div>' +
      '<p class="tp-note">This checks the public page only, in a few seconds. It is a quick health check, not a full speed test. For deeper results try Google PageSpeed Insights.</p>';
    const rep = 'Website audit for ' + d.url + '\nScore ' + d.score + '/100\n' + d.checks.map((c) => (c.level === 'ok' ? '[ok] ' : c.level === 'warn' ? '[improve] ' : '[fix] ') + c.label + (c.tip ? ' - ' + c.tip : '')).join('\n');
    $('#au-copy').addEventListener('click', () => K.copy(rep));
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = $('#au-url').value.trim(); if (!url) { fail('Type your website address first.'); return; }
    const base = (window.VR_CONFIG || {}).studioAiUrl;
    if (!base) { fail('The audit runs on the VibrantRevolve studio server, which is not connected on this copy of the site yet.'); return; }
    go.disabled = true; go.textContent = 'Checking your site…'; out.innerHTML = '<div class="au-load"><i></i><i></i><i></i></div>';
    try {
      const r = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: 'audit', url }), signal: AbortSignal.timeout(30000) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 429) fail(MSG['slow down']);
      else if (j.ok && j.data) show(j.data);
      else fail(MSG[j.error] || 'Something went wrong. Please try again in a moment.');
    } catch (err) { fail('The audit took too long or could not connect. Please try again.'); }
    finally { go.disabled = false; go.textContent = 'Run the audit'; }
  });
})();
