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

    // Send via EmailJS (to the address set in your EmailJS template), otherwise the mail app
    sendContact(form)
      .then(() => {
        if (modal) modal.style.display = 'flex';
        form.reset();
      })
      .catch((error) => {
        console.error('Contact error:', error);
        alert('Oops! That did not send' + (error && error.text ? ' (' + String(error.text).slice(0, 90) + ')' : '') + '. Please try again or email me directly at vr@vibrantrevolve.com');
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
  }
};

const EMAILJS_SERVICE = (window.VR_CONFIG || {}).emailjsServiceId || '', EMAILJS_TEMPLATE = (window.VR_CONFIG || {}).emailjsTemplateId || '';
async function sendContact(form) {
  const params = {};
  new FormData(form).forEach((v, k) => { if (k !== 'company_website' && k !== 'website' && k !== 'cf-turnstile-response') params[k] = String(v); });
  return window.vrMail.send(params).catch((err) => { console.error('Contact form: EmailJS send failed', err); throw err; });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  ContactManager.init();
});
