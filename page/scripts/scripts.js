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

    currencyRates.ngn = data.rates.NGN || 1500;
    currencyRates.eur = data.rates.EUR || 0.9;
    currencyRates.gbp = data.rates.GBP || 0.8;

    console.log('Rates fetched:', currencyRates);
  } catch (error) {
    console.error('Currency fetch error:', error);
    currencyRates.ngn = 1560;
    currencyRates.eur = 0.9;
    currencyRates.gbp = 0.8;
  }
}

function setCurrency(currency) {
  currentCurrency = currency;
  updatePrices();
}

function updatePrices() {
  const priceElements = document.querySelectorAll('.price');
  priceElements.forEach(el => {
    const usd = parseFloat(el.dataset.usd);
    if (isNaN(usd)) return;

    let rate = currencyRates[currentCurrency] ?? 1;
    let symbol = '$';

    switch (currentCurrency) {
      case 'ngn': symbol = '₦'; break;
      case 'eur': symbol = '€'; break;
      case 'gbp': symbol = '£'; break;
    }

    const converted = usd * rate;
    el.textContent = symbol + Math.round(converted).toLocaleString();
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const loader = document.getElementById('currencyLoader');
  if (loader) loader.style.display = 'block';

  await fetchRates();
  updatePrices();

  if (loader) loader.style.display = 'none';
});
