// ============================================
// VIBRANTREVOLVE — SECURE PAYMENT HANDLER
// NO sensitive data in localStorage
// All keys loaded from server-side proxy (recommended)
// ============================================

const PaymentManager = {
  data: null,
  config: {
    // These should come from environment variables or secure backend
    // Placeholders below - replace with real keys before going live
    paystackKey: 'YOUR_PAYSTACK_PUBLIC_KEY',
    flutterwaveKey: 'YOUR_FLUTTERWAVE_PUBLIC_KEY',
    emailjsServiceId: 'YOUR_SERVICE_ID',
    emailjsTemplateId: 'YOUR_TEMPLATE_ID'
  },

  init() {
    // Parse URL parameters (secure, non-sensitive)
    const params = new URLSearchParams(window.location.search);
    this.data = {
      service: decodeURIComponent(params.get('service') || 'Unknown Service'),
      amount: parseFloat(params.get('amount')) || 0,
      currency: params.get('currency') || 'usd',
      rate: params.get('rate') || '1560',
      tracking: params.get('tracking') || 'VR-' + Date.now().toString(36).toUpperCase()
    };

    this.renderSummary();
    this.initPayPal();
    this.initPaystack();
    this.initFlutterwave();
    this.checkPlaceholderKeys();
  },

  // Warn developer if keys are still placeholders
  checkPlaceholderKeys() {
    const placeholders = [];
    if (this.config.paystackKey.includes('YOUR_')) placeholders.push('Paystack');
    if (this.config.flutterwaveKey.includes('YOUR_')) placeholders.push('Flutterwave');
    if (this.config.emailjsServiceId.includes('YOUR_')) placeholders.push('EmailJS');

    if (placeholders.length > 0) {
      console.warn('⚠️ PAYMENT KEYS NOT CONFIGURED:', placeholders.join(', '));
      console.warn('   Replace placeholders in assets/js/payment.js before going live.');

      // Show warning banner on page for developer
      const banner = document.createElement('div');
      banner.style.cssText = 'background: #dc3545; color: white; padding: 1rem; text-align: center; font-weight: 600; position: sticky; top: 0; z-index: 10002;';
      banner.innerHTML = `⚠️ Payment not configured: ${placeholders.join(', ')} keys are still placeholders. <a href="#" onclick="this.parentElement.remove(); return false;" style="color: white; text-decoration: underline;">Dismiss</a>`;
      document.body.insertBefore(banner, document.body.firstChild);
    }
  },

  renderSummary() {
    const els = {
      service: document.getElementById('summary-service'),
      amount: document.getElementById('summary-amount'),
      tracking: document.getElementById('summary-tracking')
    };

    if (els.service) els.service.textContent = this.data.service;
    if (els.amount) els.amount.textContent = '$' + this.data.amount.toFixed(2);
    if (els.tracking) els.tracking.textContent = this.data.tracking;
  },

  getEmail() {
    return document.getElementById('user-email')?.value.trim();
  },

  validateEmail() {
    const email = this.getEmail();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      this.showError('Please enter your email address');
      return false;
    }
    if (!emailRegex.test(email)) {
      this.showError('Please enter a valid email address');
      return false;
    }
    return email;
  },

  showError(msg) {
    alert(msg); // Simple alert - can be replaced with toast notification
  },

  // ===== PAYPAL =====
  initPayPal() {
    const container = document.getElementById('paypal-button-container');
    if (!container) return;

    // Check if PayPal SDK loaded
    if (!window.paypal?.Buttons) {
      container.innerHTML = `
        <div style="text-align: center; padding: 1rem; color: var(--text-muted);">
          <i class="fab fa-paypal" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
          <p>PayPal loading...</p>
          <p style="font-size: 0.8rem;">If this persists, please use Paystack or Flutterwave below.</p>
        </div>
      `;

      // Retry after 3 seconds
      setTimeout(() => this.initPayPal(), 3000);
      return;
    }

    // Check if client ID is placeholder
    const script = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (script && script.src.includes('YOUR_PAYPAL_CLIENT_ID')) {
      container.innerHTML = `
        <div style="text-align: center; padding: 1rem; background: rgba(220,53,69,0.1); border: 1px solid #dc3545; border-radius: var(--radius-sm);">
          <i class="fas fa-exclamation-triangle" style="color: #dc3545; font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
          <p style="color: #dc3545; font-weight: 600;">PayPal not configured</p>
          <p style="font-size: 0.85rem;">Please use Paystack or Flutterwave, or contact us to pay manually.</p>
        </div>
      `;
      return;
    }

    try {
      paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: { 
                value: this.data.amount.toFixed(2),
                currency_code: 'USD'
              },
              description: this.data.service,
              custom_id: this.data.tracking
            }]
          });
        },
        onApprove: (data, actions) => {
          const email = this.validateEmail();
          if (!email) return;

          return actions.order.capture().then((details) => {
            this.sendConfirmation(email, 'PayPal', details.id);
            this.redirectSuccess();
          });
        },
        onError: (err) => {
          console.error('PayPal Error:', err);
          this.showError('PayPal payment failed. Please try again or use another method.');
        },
        onCancel: () => {
          console.log('PayPal payment cancelled by user');
        }
      }).render('#paypal-button-container');
    } catch (err) {
      console.error('PayPal init error:', err);
      container.innerHTML = '<p style="color: var(--error);">PayPal unavailable. Please try another method.</p>';
    }
  },

  // ===== PAYSTACK =====
  initPaystack() {
    const btn = document.getElementById('paystack-button');
    if (!btn) return;

    // Check if Paystack loaded
    if (!window.PaystackPop) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
      setTimeout(() => this.initPaystack(), 2000);
      return;
    }

    // Check if key is placeholder
    if (this.config.paystackKey.includes('YOUR_')) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Not Configured';
      btn.title = 'Paystack key needs to be configured by the developer';
      return;
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-lock" aria-hidden="true"></i> Pay Now';

    btn.addEventListener('click', () => {
      const email = this.validateEmail();
      if (!email) return;

      const amountKobo = Math.round(this.data.amount * 100);

      try {
        const handler = PaystackPop.setup({
          key: this.config.paystackKey,
          email: email,
          amount: amountKobo,
          currency: 'NGN',
          ref: this.data.tracking,
          metadata: {
            custom_fields: [
              { display_name: 'Service', variable_name: 'service', value: this.data.service },
              { display_name: 'Tracking ID', variable_name: 'tracking', value: this.data.tracking }
            ]
          },
          callback: (response) => {
            this.sendConfirmation(email, 'Paystack', response.reference);
            this.redirectSuccess();
          },
          onClose: () => {
            console.log('Paystack payment window closed');
          }
        });
        handler.openIframe();
      } catch (err) {
        console.error('Paystack error:', err);
        this.showError('Paystack payment failed. Please try again.');
      }
    });
  },

  // ===== FLUTTERWAVE =====
  initFlutterwave() {
    const btn = document.getElementById('flutterwave-button');
    if (!btn) return;

    // Check if Flutterwave loaded
    if (!window.FlutterwaveCheckout) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
      setTimeout(() => this.initFlutterwave(), 2000);
      return;
    }

    // Check if key is placeholder
    if (this.config.flutterwaveKey.includes('YOUR_')) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Not Configured';
      btn.title = 'Flutterwave key needs to be configured by the developer';
      return;
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-lock" aria-hidden="true"></i> Pay Now';

    btn.addEventListener('click', () => {
      const email = this.validateEmail();
      if (!email) return;

      try {
        FlutterwaveCheckout({
          public_key: this.config.flutterwaveKey,
          tx_ref: this.data.tracking,
          amount: this.data.amount,
          currency: 'NGN',
          customer: { 
            email: email,
            name: 'VibrantRevolve Client'
          },
          customizations: {
            title: 'VibrantRevolve',
            description: this.data.service,
            logo: '/assets/images/favicon/favicon-32x32.png'
          },
          callback: (response) => {
            if (response.status === 'successful') {
              this.sendConfirmation(email, 'Flutterwave', response.transaction_id);
              this.redirectSuccess();
            } else {
              this.showError('Payment was not successful. Please try again.');
            }
          },
          onclose: () => {
            console.log('Flutterwave payment closed');
          }
        });
      } catch (err) {
        console.error('Flutterwave error:', err);
        this.showError('Flutterwave payment failed. Please try again.');
      }
    });
  },

  // ===== CONFIRMATION EMAIL =====
  sendConfirmation(email, method, transactionId) {
    if (!window.emailjs) {
      console.warn('EmailJS not loaded - skipping confirmation email');
      return;
    }

    // Skip if EmailJS not configured
    if (this.config.emailjsServiceId.includes('YOUR_')) {
      console.warn('EmailJS not configured - skipping confirmation email');
      return;
    }

    emailjs.send(this.config.emailjsServiceId, this.config.emailjsTemplateId, {
      user_email: email,
      service_name: this.data.service,
      amount: this.data.amount,
      payment_method: method,
      tracking_id: this.data.tracking,
      transaction_id: transactionId || 'N/A'
    }).then(() => {
      console.log('Confirmation email sent');
    }).catch(err => {
      console.error('Email failed:', err);
    });
  },

  // ===== REDIRECT =====
  redirectSuccess() {
    window.location.href = '/payment/success.html';
  }
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.payment-section')) {
    PaymentManager.init();
  }
});
