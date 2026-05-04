// ============================================
// SERVICE PAGE — BUSINESS CARD PRICING
// ============================================

// Currency state
window.currentCurrency = localStorage.getItem('vr_currency') || 'usd';

function setCurrency(currency) {
  window.currentCurrency = currency;
  localStorage.setItem('vr_currency', currency);
  
  document.querySelectorAll('.price').forEach(el => {
    const usd = el.dataset.usd;
    const ngn = el.dataset.ngn;
    el.textContent = currency === 'usd' ? `$${usd}` : `₦${parseInt(ngn).toLocaleString()}`;
  });
  
  document.querySelectorAll('.currency-toggle button').forEach(btn => {
    const isActive = btn.getAttribute('onclick').includes(currency);
    btn.classList.toggle('active', isActive);
  });
}

function preparePayment(service, price, event) {
  if (event) event.preventDefault();
  
  try {
    const currentCurrency = window.currentCurrency;
    const rate = 1500; // USD to NGN rate — update as needed
    
    const paymentData = {
      service: service,
      priceUSD: currentCurrency === 'usd' ? price : Math.round(price / rate),
      priceNGN: currentCurrency === 'ngn' ? price : Math.round(price * rate),
      currency: currentCurrency,
      trackingId: 'VR-' + Date.now().toString(36).toUpperCase(),
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('vr_payment', JSON.stringify(paymentData));
    
    // Navigate to payment page
    window.location.href = event?.target?.href || '/page/payment.html';
    return false;
    
  } catch (err) {
    console.error('Payment prep failed:', err);
    return true; // Let default navigation work
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setCurrency(window.currentCurrency);
});
