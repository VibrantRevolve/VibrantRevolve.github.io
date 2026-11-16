/* "Want this done for you?" prompt on tool pages. Appears once per session, after the visitor has actually used the tool.
   Sends the lead through EmailJS (same keys as the contact form), or opens WhatsApp when EmailJS is not configured. */
(function () {
  var KEY = 'vr_lead_seen';
  function seen() { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } }
  function mark() { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} }
  if (seen()) return;

  var tool = (document.title || 'Free tool').split('|')[0].trim();
  var actions = 0, shown = false, t0 = Date.now();

  function css() {
    var st = document.createElement('style');
    st.textContent =
      '#vrLead{position:fixed;left:1rem;bottom:1rem;z-index:900;width:min(360px,calc(100vw - 2rem));background:var(--bg-card,#16130f);color:var(--text-primary,#f5f1e8);border:1px solid var(--gold,#c9a45c);border-radius:14px;padding:1.1rem 1.1rem 1rem;box-shadow:0 14px 40px rgba(0,0,0,.45);font-size:.92rem;line-height:1.45}' +
      '#vrLead h3{margin:0 2rem .35rem 0;font-size:1.05rem}#vrLead p{margin:0 0 .75rem;color:var(--text-muted,#9a9486)}' +
      '#vrLead input[type=text]{width:100%;box-sizing:border-box;padding:.65rem .75rem;margin-bottom:.6rem;border-radius:8px;border:1px solid var(--border-color,#3a352c);background:var(--bg-secondary,#0f0d0a);color:inherit;font:inherit}' +
      '#vrLead label.c{display:flex;gap:.5rem;align-items:flex-start;font-size:.78rem;color:var(--text-muted,#9a9486);margin-bottom:.7rem}' +
      '#vrLead .row{display:flex;gap:.5rem;flex-wrap:wrap}#vrLead button.go,#vrLead a.wa{flex:1;text-align:center;padding:.65rem .8rem;border-radius:8px;font:inherit;font-weight:600;cursor:pointer;text-decoration:none;border:1px solid var(--gold,#c9a45c)}' +
      '#vrLead button.go{background:var(--gold,#c9a45c);color:#0a0a0a}#vrLead a.wa{background:transparent;color:var(--gold,#c9a45c)}' +
      '#vrLead .x{position:absolute;top:.4rem;right:.5rem;background:none;border:0;color:var(--text-muted,#9a9486);font-size:1.4rem;cursor:pointer;line-height:1}' +
      '#vrLead .msg{margin-top:.6rem;font-size:.85rem}' +
      '@media(max-width:520px){#vrLead{left:.5rem;right:.5rem;bottom:.5rem;width:auto}}';
    document.head.appendChild(st);
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function show() {
    if (shown || seen()) return; shown = true; css();
    var cfg = window.VR_CONFIG || {};
    var wa = String(cfg.whatsapp || '2349012739299').replace(/\D/g, '');
    var box = document.createElement('div');
    box.id = 'vrLead'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-labelledby', 'vrLeadTitle');
    box.innerHTML =
      '<button class="x" type="button" aria-label="Close">&times;</button>' +
      '<h3 id="vrLeadTitle">Want this done for you?</h3>' +
      '<p>Get a free 10-minute review of your business setup. Leave your email or WhatsApp number and we will reply within 24 hours.</p>' +
      '<form novalidate><input type="text" name="contact" placeholder="Email or WhatsApp number" autocomplete="email" aria-label="Email or WhatsApp number" required>' +
      '<input type="text" name="company_website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">' +
      '<label class="c"><input type="checkbox" name="ok"> <span>I agree VibrantRevolve may contact me about this request. <a href="/privacy.html" target="_blank" rel="noopener">Privacy</a></span></label>' +
      '<div class="row"><button class="go" type="submit">Send</button><a class="wa" target="_blank" rel="noopener" href="https://wa.me/' + wa + '?text=' + encodeURIComponent('Hi VibrantRevolve, I just used your ' + tool + ' tool and would like help.') + '">WhatsApp</a></div>' +
      '<div class="msg" role="status" aria-live="polite"></div></form>';
    document.body.appendChild(box);
    var form = box.querySelector('form'), msg = box.querySelector('.msg');
    function close() { mark(); box.remove(); }
    box.querySelector('.x').addEventListener('click', close);
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var contact = form.contact.value.trim();
      if (form.company_website.value || Date.now() - t0 < 4000) return;
      if (contact.length < 5) { msg.textContent = 'Please enter an email or WhatsApp number.'; return; }
      if (!form.ok.checked) { msg.textContent = 'Please tick the box so we may contact you.'; return; }
      var isMail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact);
      var params = { from_name: 'Tool lead (' + tool + ')', from_email: isMail ? contact : 'noreply@vibrantrevolve.com', project_type: 'Tool lead: ' + tool, message: 'Contact: ' + contact + '\nCame from the ' + tool + ' tool: ' + location.href, to_email: cfg.supportEmail || 'vr@vibrantrevolve.com', user_email: cfg.supportEmail || 'vr@vibrantrevolve.com' };
      var btn = form.querySelector('.go'); btn.disabled = true; btn.textContent = 'Sending...';
      function done() { mark(); msg.textContent = 'Thanks. We will be in touch within 24 hours.'; setTimeout(function () { box.remove(); }, 3500); }
      function fail() { btn.disabled = false; btn.textContent = 'Send'; msg.innerHTML = 'Could not send. Please use <a href="https://wa.me/' + wa + '" target="_blank" rel="noopener">WhatsApp</a> instead.'; }
      if (!window.vrMail) return fail();
      window.vrMail.send(params).then(done, function (err) { console.error('Lead form: EmailJS send failed', err); fail(); });
    });
  }

  function count() { actions++; if (actions >= 3 && Date.now() - t0 > 20000) show(); }
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('main button, main [role=button], main .btn')) count(); }, true);
  document.addEventListener('change', count, true);
  setTimeout(function () { if (actions >= 1) show(); }, 60000);
})();
