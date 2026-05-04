function preparePayment(service, price, event) {
  // Prevent default if event exists (for onclick handlers)
  if (event) event.preventDefault();
  
  try {
    // Get current currency from toggle or default to USD
    const currentCurrency = window.currentCurrency || 'usd';
    
    // Calculate NGN equivalent if needed
    const ngnPrice = currentCurrency === 'ngn' ? price : Math.round(price * 1500); // Adjust rate as needed
    const usdPrice = currentCurrency === 'usd' ? price : Math.round(price / 1500);
    
    const trackingId = 'VR-' + Date.now().toString(36).toUpperCase();
    
    const paymentData = {
      service: service,
      priceUSD: usdPrice,
      priceNGN: ngnPrice,
      currency: currentCurrency,
      trackingId: trackingId,
      timestamp: new Date().toISOString()
    };
    
    // Store as single object for cleaner retrieval
    localStorage.setItem('vr_payment', JSON.stringify(paymentData));
    
    // Optional: append tracking to URL for server-side logging
    const payBtn = event?.target;
    if (payBtn) {
      const separator = payBtn.href.includes('?') ? '&' : '?';
      payBtn.href = `${payBtn.href}${separator}ref=${trackingId}`;
    }
    
    return true; // Allow navigation to proceed
    
  } catch (err) {
    console.error('Payment prep failed:', err);
    // Fallback: navigate anyway, let payment page handle defaults
    return true;
  }
}
