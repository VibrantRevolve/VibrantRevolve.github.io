const currencyRates = {
  usd: 1,
  ngn: null,
  eur: null,
  gbp: null
};

let currentCurrency = 'usd';

async function fetchRates() {
  try {
    const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=NGN,EUR,GBP');
    const data = await response.json();
    currencyRates.ngn = data.rates.NGN;
    currencyRates.eur = data.rates.EUR;
    currencyRates.gbp = data.rates.GBP;
    console.log('Rates fetched:', currencyRates);
  } catch (error) {
    console.error('Currency fetch error:', error);
  }
}

function setCurrency(currency) {
  if (currency === currentCurrency) return;
  currentCurrency = currency;
  updatePrices();
}

function updatePrices() {
  const priceElements = document.querySelectorAll('.price');
  priceElements.forEach(el => {
    const usd = parseFloat(el.dataset.usd);
    if (!usd || isNaN(usd)) return;

    let convertedValue = usd;
    let symbol = '$';

    switch (currentCurrency) {
      case 'ngn':
        convertedValue = usd * currencyRates.ngn;
        symbol = '₦';
        break;
      case 'eur':
        convertedValue = usd * currencyRates.eur;
        symbol = '€';
        break;
      case 'gbp':
        convertedValue = usd * currencyRates.gbp;
        symbol = '£';
        break;
    }

    el.textContent = symbol + Math.round(convertedValue).toLocaleString();
  });
}

// Run on load
document.addEventListener('DOMContentLoaded', async () => {
  const loader = document.getElementById('currencyLoader');
  if (loader) loader.style.display = 'block';
  await fetchRates();
  updatePrices();
  if (loader) loader.style.display = 'none';
});
