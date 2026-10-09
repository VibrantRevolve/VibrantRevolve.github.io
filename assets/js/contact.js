// ============================================
// VIBRANTREVOLVE — CONTACT FORM
// Secure form handling with validation
// ============================================

const ContactManager = {
  init() {
    const form = document.getElementById('contactForm');
    const modal = document.getElementById('confirmationModal');

    if (!form) return;

    // EmailJS init (key should come from env, this is placeholder)
    if (window.emailjs) {
      // In production, load from secure endpoint or env
      emailjs.init("YOUR_EMAILJS_PUBLIC_KEY"); 
    }

    this.guard(form);
    form.addEventListener('submit', (e) => this.handleSubmit(e, form, modal));

    // Modal close handlers
    document.getElementById('closeModal')?.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal?.style.display === 'flex') {
        modal.style.display = 'none';
      }
    });
  },

  // Bot protection: a hidden honeypot field, plus Cloudflare Turnstile when a site key is set.
  guard(form) {
    const hp = document.createElement('input'); hp.type = 'text'; hp.name = 'website'; hp.tabIndex = -1; hp.autocomplete = 'off'; hp.setAttribute('aria-hidden', 'true');
    hp.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0'; form.appendChild(hp);
    const key = (window.VR_CONFIG || {}).turnstileSiteKey;
    if (key && (window.VR_CONFIG || {}).studioAiUrl) {
      const box = document.createElement('div'); box.className = 'cf-turnstile'; box.setAttribute('data-sitekey', key); box.style.margin = '0 0 1rem';
      const btn = form.querySelector('button[type="submit"]'); form.insertBefore(box, btn);
      const s = document.createElement('script'); s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'; s.async = true; s.defer = true; document.head.appendChild(s);
    }
  },

  handleSubmit(e, form, modal) {
    e.preventDefault();

    const name = form.from_name?.value.trim();
    const email = form.from_email?.value.trim();
    const message = form.message?.value.trim();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent || 'Send Message';

    // Validation
    if (name.length < 2) {
      alert('Please enter your full name (at least 2 characters).');
      form.from_name.focus();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      form.from_email.focus();
      return;
    }

    if (message.length < 10) {
      alert('Please tell me more about your project (at least 10 characters).');
      form.message.focus();
      return;
    }

    // Loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    // Send via the Cloudflare Worker when connected, otherwise EmailJS or the mail app
    sendContact(form)
      .then(() => {
        if (modal) modal.style.display = 'flex';
        form.reset();
      })
      .catch((error) => {
        console.error('Contact error:', error);
        alert((error && error.message && /human|check your details/.test(error.message)) ? error.message : 'Oops! Something went wrong. Please try again or email me directly at vr@vibrantrevolve.com');
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
  }
};

const EMAILJS_SERVICE = 'YOUR_SERVICE_ID', EMAILJS_TEMPLATE = 'YOUR_TEMPLATE_ID';
async function sendContact(form) {
  const url = (window.VR_CONFIG || {}).studioAiUrl;
  if (url) {
    try {
      const f = new FormData(form);
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(20000),
        body: JSON.stringify({ task: 'contact', name: f.get('from_name'), email: f.get('from_email'), message: f.get('message'), website: f.get('website'), token: f.get('cf-turnstile-response') || '' }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { try { window.turnstile && window.turnstile.reset(); } catch (e) {} return; }
      if (j.error === 'captcha') throw new Error('Please tick the "I am human" box and send again.');
      if (j.error !== 'unconfigured' && r.status < 500 && r.status !== 0) throw new Error('Please check your details and try again.');
    } catch (err) { if (err && /human|check your details/.test(err.message)) throw err; }
    // Worker not ready or unreachable: fall through to the older routes below
  }
  if (EMAILJS_SERVICE.includes('YOUR_') || !window.emailjs) {
    const body = [...new FormData(form).entries()].filter(([k]) => k !== 'website' && k !== 'cf-turnstile-response').map(([k, v]) => k + ': ' + v).join('\n');
    window.location.href = 'mailto:vr@vibrantrevolve.com?subject=' + encodeURIComponent('Website enquiry') + '&body=' + encodeURIComponent(body);
    return;
  }
  return emailjs.sendForm(EMAILJS_SERVICE, EMAILJS_TEMPLATE, form);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  ContactManager.init();
});
