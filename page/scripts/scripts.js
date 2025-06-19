
    function setCurrency(currency) {
      document.querySelectorAll('.price').forEach(price => {
        price.textContent =
          currency === 'usd'
            ? `$${price.dataset.usd}`
            : `₦${Number(price.dataset.ngn).toLocaleString()}`;
      });
    }
    setCurrency('usd'); // Default
