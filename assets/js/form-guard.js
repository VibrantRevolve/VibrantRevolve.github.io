/* Light bot protection for the contact forms: hidden honeypot field plus a minimum fill time.
   Real visitors never see it. Replaces nothing: add Cloudflare Turnstile later for stronger protection. */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var t0 = Date.now();
    var trap = document.createElement('input');
    trap.type = 'text'; trap.name = 'company_website'; trap.tabIndex = -1; trap.autocomplete = 'off';
    trap.setAttribute('aria-hidden', 'true');
    trap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
    form.appendChild(trap);
    form.addEventListener('submit', function (e) {
      if (trap.value) { e.preventDefault(); e.stopImmediatePropagation(); return; } // bot: drop silently
      if (Date.now() - t0 < 3000) {
        e.preventDefault(); e.stopImmediatePropagation();
        var st = document.getElementById('formStatus');
        if (st) { st.textContent = 'One moment please, then press Send again.'; st.style.display = 'block'; }
      }
    }, true);
  });
})();
