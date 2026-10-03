// VibrantRevolve assistant. Works instantly from /assets/data/assistant.json.
// If VR_CONFIG.assistantUrl points to your Cloudflare Worker, real AI answers are used,
// and the built-in answers remain as the fallback.
(function () {
  if (location.pathname.indexOf('/payment') === 0) return;
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '/assets/css/assistant.css'; document.head.appendChild(css);
  const cfg = () => window.VR_CONFIG || {};
  const wa = () => 'https://wa.me/' + (cfg().whatsapp || '2349012739299');
  let data = null, panel, log, input, opened = false, busy = false;
  const history = [];
  const el = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; };

  const launch = el('button', 'vra-launch');
  launch.type = 'button'; launch.setAttribute('aria-label', 'Open chat assistant'); launch.setAttribute('aria-expanded', 'false');
  launch.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></svg><span>Ask VR</span>';
  document.body.appendChild(launch);

  function build() {
    panel = el('div', 'vra-panel'); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'VibrantRevolve assistant');
    const head = el('div', 'vra-head'); const t = el('div'); t.append(el('strong', '', 'VibrantRevolve'), el('small', '', 'Assistant · replies instantly'));
    const x = el('button', 'vra-x', '✕'); x.type = 'button'; x.setAttribute('aria-label', 'Close chat'); x.onclick = close; head.append(t, x);
    log = el('div', 'vra-log'); log.setAttribute('aria-live', 'polite');
    const chips = el('div', 'vra-chips');
    (data.chips || []).forEach((c) => { const b = el('button', 'vra-chip', c); b.type = 'button'; b.onclick = () => ask(c); chips.appendChild(b); });
    const form = el('form', 'vra-form'); input = el('input'); input.type = 'text'; input.maxLength = 300; input.placeholder = 'Type your question…'; input.setAttribute('aria-label', 'Your question');
    const send = el('button', '', 'Send'); send.type = 'submit'; form.append(input, send);
    form.onsubmit = (e) => { e.preventDefault(); const v = input.value.trim(); if (v) { input.value = ''; ask(v); } };
    const note = el('div', 'vra-note', 'Automated assistant. For quotes or anything important, message us directly.');
    panel.append(head, log, chips, form, note); document.body.appendChild(panel);
    panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    say(data.greeting, []);
  }

  function say(text, links, me) {
    const m = el('div', 'vra-m ' + (me ? 'me' : 'bot')); m.appendChild(document.createTextNode(text));
    if (links && links.length) {
      const l = el('div', 'vra-links');
      links.forEach((k) => { const a = el('a', '', k.t); a.href = k.h === 'WHATSAPP' ? wa() : k.h; if (/^https?:/.test(a.href) && a.host !== location.host) { a.target = '_blank'; a.rel = 'noopener'; } l.appendChild(a); });
      m.appendChild(l);
    }
    log.appendChild(m); log.scrollTop = log.scrollHeight; return m;
  }

  function local(q) {
    const words = (q.toLowerCase().match(/[a-z]+/g) || []);
    if (/person|human|agent|someone/.test(q.toLowerCase())) return data.entries.find((e) => e.id === 'contact');
    let best = null, score = 0;
    data.entries.forEach((e) => { let s = 0; e.k.forEach((k) => { if (words.indexOf(k) > -1) s += (e.id === 'hello' ? 0.5 : 1); }); if (s > score) { score = s; best = e; } });
    return score >= 1 || (best && best.id === 'hello' && score) ? best : null;
  }

  async function ask(q) {
    if (busy) return; busy = true;
    say(q, [], true); history.push({ role: 'user', content: q });
    const typing = el('div', 'vra-m bot vra-dots'); typing.innerHTML = '<span></span><span></span><span></span>'; log.appendChild(typing); log.scrollTop = log.scrollHeight;
    let reply = null;
    if (cfg().assistantUrl) {
      try {
        const r = await fetch(cfg().assistantUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-8) }), signal: AbortSignal.timeout(20000) });
        if (r.ok) { const j = await r.json(); if (j && typeof j.reply === 'string' && j.reply.trim()) reply = { a: j.reply.trim(), links: [{ t: 'Talk to a person', h: 'WHATSAPP' }] }; }
      } catch (e) { /* fall back below */ }
    }
    if (!reply) { const e = local(q); reply = e ? { a: e.a, links: e.links } : { a: data.fallback, links: [{ t: 'WhatsApp', h: 'WHATSAPP' }, { t: 'Contact page', h: '/contact/' }] }; }
    typing.remove(); say(reply.a, reply.links); history.push({ role: 'assistant', content: reply.a }); busy = false;
  }

  function open() {
    const go = () => { panel.classList.add('open'); launch.setAttribute('aria-expanded', 'true'); opened = true; setTimeout(() => input.focus(), 50); };
    if (panel) return go();
    fetch('/assets/data/assistant.json').then((r) => r.json()).then((d) => { data = d; build(); go(); }).catch(() => { window.open(wa(), '_blank', 'noopener'); });
  }
  function close() { if (panel) panel.classList.remove('open'); launch.setAttribute('aria-expanded', 'false'); opened = false; launch.focus(); }
  launch.onclick = () => (opened ? close() : open());
})();
