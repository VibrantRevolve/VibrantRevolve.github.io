// ============================================
// VIBRANTREVOLVE — UNIFIED PRICING & CURRENCY
// Live rates + theme sync +s payment prep
// ============================================

const CurrencyManager = {
  rates: { usd: 1, ngn: null, eur: null, gbp: null },
  current: localStorage.getItem('vr_currency') || 'usd',

  async fetchRates() {
    const loader = document.getElementById('currencyLoader');
    if (loader) loader.style.display = 'block';

    const endpoints = [
      'https://api.exchangerate-api.com/v4/latest/USD',
      'https://open.er-api.com/v6/latest/USD'
    ];

    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) continue;
        const data = await response.json();
        const rates = data.rates || data.conversion_rates || {};

        this.rates.ngn = rates.NGN || 1560;
        this.rates.eur = rates.EUR || 0.92;
        this.rates.gbp = rates.GBP || 0.79;
        console.log('✓ Exchange rates loaded:', this.rates);
        break;
      } catch (err) {
        console.warn('✗ API failed:', url);
      }
    }

    // Fallback
    if (!this.rates.ngn) {
      this.rates.ngn = 1560;
      this.rates.eur = 0.92;
      this.rates.gbp = 0.79;
      console.log('Using fallback rates');
    }

    if (loader) loader.style.display = 'none';
    this.set(this.current, false);
  },

  set(currency, animate = true) {
    this.current = currency;
    localStorage.setItem('vr_currency', currency);

    // Update toggle buttons
    document.querySelectorAll('.currency-toggle button').forEach(btn => {
      const match = btn.getAttribute('onclick')?.match(/'(\w+)'/);
      btn.classList.toggle('active', match && match[1] === currency);
    });

    // Update all prices
    document.querySelectorAll('.price').forEach((el, index) => {
      const usdPrice = parseFloat(el.dataset.usd);
      if (isNaN(usdPrice)) return;

      let displayPrice, symbol;
      switch(currency) {
        case 'ngn':
          displayPrice = Math.round(usdPrice * this.rates.ngn);
          symbol = '₦';
          break;
        case 'eur':
          displayPrice = (usdPrice * this.rates.eur).toFixed(2);
          symbol = '€';
          break;
        case 'gbp':
          displayPrice = (usdPrice * this.rates.gbp).toFixed(2);
          symbol = '£';
          break;
        default:
          displayPrice = usdPrice;
          symbol = '$';
      }

      const formatted = currency === 'ngn' 
        ? `${symbol}${displayPrice.toLocaleString()}` 
        : `${symbol}${displayPrice}`;

      if (animate) {
        setTimeout(() => {
          el.style.transition = 'all 0.3s ease';
          el.style.opacity = '0';
          el.style.transform = 'translateY(-5px)';
          setTimeout(() => {
            el.textContent = formatted;
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, 150);
        }, index * 80);
      } else {
        el.textContent = formatted;
      }
    });
  }
};

// ===== PAYMENT PREPARATION =====
// Uses URL params instead of localStorage for security
function preparePayment(service, price, event) {
  if (event) event.preventDefault();

  try {
    const rate = CurrencyManager.rates.ngn || 1560;
    const trackingId = 'VR-' + Date.now().toString(36).toUpperCase();

    const params = new URLSearchParams({
      service: encodeURIComponent(service),
      amount: price,
      currency: CurrencyManager.current,
      rate: rate,
      tracking: trackingId
    });

    window.location.href = `/payment/?${params.toString()}`;
    return false;
  } catch (err) {
    console.error('Payment prep failed:', err);
    return true;
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.price')) {
    CurrencyManager.fetchRates();
  }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CurrencyManager, preparePayment };
}
