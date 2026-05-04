// ============================================
// VIBRANTREVOLVE — UNIFIED SERVICE PRICING JS
// Live exchange rates + theme sync + payment prep
// ============================================

const currencyRates = {
  usd: 1,
  ngn: null,
  eur: null,
  gbp: null
};

// Sync with main site theme
window.currentCurrency = localStorage.getItem('vr_currency') || 'usd';

// ===== FETCH LIVE RATES =====
async function fetchRates() {
  const loader = document.getElementById('currencyLoader');
  if (loader) loader.style.display = 'block';
  
  const endpoints = [
    'https://api.exchangerate.host/latest?base=USD&symbols=NGN,EUR,GBP',
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
      
      // Handle different API response formats
      const rates = data.rates || data.conversion_rates || {};
      currencyRates.ngn = rates.NGN || 1560;
      currencyRates.eur = rates.EUR || 0.92;
      currencyRates.gbp = rates.GBP || 0.79;
      
      console.log('✓ Rates loaded:', currencyRates);
      break;
      
    } catch (err) {
      console.warn('✗ Failed:', url);
      continue;
    }
  }
  
  // Fallback if all APIs fail
  if (!currencyRates.ngn) {
    currencyRates.ngn = 1560;
    currencyRates.eur = 0.92;
    currencyRates.gbp = 0.79;
    console.log('Using fallback rates');
  }
  
  if (loader) loader.style.display = 'none';
  
  // Apply current currency after rates load
  setCurrency(window.currentCurrency, false);
}

// ===== SET CURRENCY =====
function setCurrency(currency, animate = true) {
  window.currentCurrency = currency;
  localStorage.setItem('vr_currency', currency);
  
  // Update toggle buttons
  document.querySelectorAll('.currency-toggle button').forEach(btn => {
    const btnCurrency = btn.getAttribute('onclick')?.match(/'(\w+)'/)?.[1];
    btn.classList.toggle('active', btnCurrency === currency);
  });
  
  // Update all prices
  document.querySelectorAll('.price').forEach((el, index) => {
    const usdPrice = parseFloat(el.dataset.usd);
    let displayPrice;
    let symbol;
    
    switch(currency) {
      case 'ngn':
        displayPrice = Math.round(usdPrice * currencyRates.ngn);
        symbol = '₦';
        break;
      case 'eur':
        displayPrice = (usdPrice * currencyRates.eur).toFixed(2);
        symbol = '€';
        break;
      case 'gbp':
        displayPrice = (usdPrice * currencyRates.gbp).toFixed(2);
        symbol = '£';
        break;
      default:
        displayPrice = usdPrice;
        symbol = '$';
    }
    
    if (animate) {
      setTimeout(() => {
        el.style.transition = 'all 0.3s ease';
        el.style.opacity = '0';
        el.style.transform = 'translateY(-5px)';
        
        setTimeout(() => {
          el.textContent = currency === 'ngn' 
            ? `${symbol}${displayPrice.toLocaleString()}` 
            : `${symbol}${displayPrice}`;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 150);
      }, index * 80);
    } else {
      el.textContent = currency === 'ngn' 
        ? `${symbol}${displayPrice.toLocaleString()}` 
        : `${symbol}${displayPrice}`;
    }
  });
}

// ===== PREPARE PAYMENT =====
function preparePayment(service, price, event) {
  if (event) event.preventDefault();
  
  try {
    const rate = currencyRates.ngn || 1560;
    const current = window.currentCurrency;
    
    const paymentData = {
      service: service,
      priceUSD: current === 'usd' ? price : Math.round(price / rate),
      priceNGN: current === 'ngn' ? price : Math.round(price * rate),
      priceEUR: current === 'eur' ? price : (price * currencyRates.eur).toFixed(2),
      priceGBP: current === 'gbp' ? price : (price * currencyRates.gbp).toFixed(2),
      currency: current,
      rateUsed: rate,
      trackingId: 'VR-' + Date.now().toString(36).toUpperCase(),
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('vr_payment', JSON.stringify(paymentData));
    
    // Navigate to payment page
    const href = event?.target?.href || '/page/payment.html';
    window.location.href = href;
    return false;
    
  } catch (err) {
    console.error('Payment prep failed:', err);
    return true;
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Fetch rates first, then apply currency
  fetchRates();
});
