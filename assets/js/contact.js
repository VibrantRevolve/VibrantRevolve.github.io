// ============================================
// VIBRANTREVOLVE — CONTACT FORM & CALENDLY
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

    // Send via EmailJS
    emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', form)
      .then(() => {
        if (modal) modal.style.display = 'flex';
        form.reset();
      })
      .catch((error) => {
        console.error('EmailJS Error:', error);
        alert('Oops! Something went wrong. Please try again or email me directly at contact@vibrantrevolve.com');
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
  }
};

// ===== CALENDLY =====
function initCalendly() {
  const btn = document.getElementById('calendly-button');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (window.Calendly?.initPopupWidget) {
      Calendly.initPopupWidget({
        url: 'https://calendly.com/vibrantrevolve/discovery-call'
      });
    } else {
      window.open('https://calendly.com/vibrantrevolve/discovery-call', '_blank');
    }
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  ContactManager.init();
  initCalendly();
});
