
function preparePayment(service, price) {
  const trackingId = 'VR-' + Date.now().toString(36);
  localStorage.setItem('service', service);
  localStorage.setItem('price', price);
  localStorage.setItem('trackingId', trackingId);
}
