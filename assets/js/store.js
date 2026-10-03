// VibrantRevolve store: renders products.json, filters, and the checkout modal
// (hosted checkout link, PayPal, WhatsApp). Delivery of files is handled by your
// checkout platform or manually after you confirm payment.
(function () {
  const CFG = window.VR_CONFIG || {};
  const CUR = CFG.currency || 'USD';
  const grid = document.getElementById('products-grid');
  const modal = document.getElementById('paymentModal');
  if (!grid || !modal) return;

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : '');
  let products = [];
  let current = null;
  let paypalLoaded = null;

  function card(p) {
    const orig = p.originalPrice > p.price ? `<span class="original">$${esc(p.originalPrice)}</span>` : '';
    const tag = p.tag ? `<span class="product-tag ${esc(p.tagStyle)}">${esc(p.tag)}</span>` : '';
    const feats = (p.features || []).map((f) => `<li><i class="fas fa-check" style="color:var(--accent);margin-right:.3rem" aria-hidden="true"></i> ${esc(f)}</li>`).join('');
    const preview = safeUrl(p.previewUrl)
      ? `<a class="btn btn-secondary btn-sm" href="${esc(safeUrl(p.previewUrl))}" target="_blank" rel="noopener"><i class="fas fa-eye" aria-hidden="true"></i> Live Preview</a>` : '';
    return `<article class="card product-card" data-category="${esc(p.category)}">
      <div class="product-image" style="color:var(--accent-light,#e8cd7a)">${window.VRIcons ? VRIcons.svg(p.icon || 'globe', '3.4rem') : ''}</div>
      <div class="product-body">
        ${tag}<h3>${esc(p.name)}</h3><p>${esc(p.description)}</p>
        <div class="product-price">$${esc(p.price)} ${orig}</div>
        <ul style="list-style:none;font-size:.85rem;color:var(--text-muted);margin-bottom:1rem">${feats}</ul>
        <div class="product-actions">
          <button class="btn btn-primary buy-now-btn" data-id="${esc(p.id)}"><i class="fas fa-shopping-cart" aria-hidden="true"></i> Buy Now — $${esc(p.price)}</button>
          ${preview}
        </div>
      </div></article>`;
  }

  function applyFilter(filter) {
    grid.querySelectorAll('.product-card').forEach((c) => {
      c.style.display = filter === 'all' || c.dataset.category === filter ? 'flex' : 'none';
    });
  }

  function loadPayPal() {
    if (!CFG.paypalClientId) return Promise.reject(new Error('no client id'));
    if (window.paypal) return Promise.resolve();
    if (!paypalLoaded) {
      paypalLoaded = new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(CFG.paypalClientId)}&currency=${encodeURIComponent(CUR)}&intent=capture`;
        s.onload = res;
        s.onerror = () => { paypalLoaded = null; rej(new Error('PayPal failed to load')); };
        document.head.appendChild(s);
      });
    }
    return paypalLoaded;
  }

  function waLink(text) {
    return `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(text)}`;
  }

  function openModal(p) {
    current = p;
    document.getElementById('payment-product').textContent = p.name;
    document.getElementById('payment-price').textContent = `$${p.price}`;
    const status = document.getElementById('pay-status');
    status.innerHTML = '';
    const opts = document.getElementById('pay-options');
    opts.innerHTML = '';
    const pp = document.getElementById('paypal-buttons');
    pp.innerHTML = '';

    const checkout = safeUrl(p.checkoutUrl);
    if (checkout) {
      opts.insertAdjacentHTML('beforeend', `<a class="btn btn-primary" href="${esc(checkout)}" target="_blank" rel="noopener"><i class="fas fa-credit-card" aria-hidden="true"></i> Pay with Card / Bank Transfer</a>`);
    }

    // PayPal: Smart Buttons if a client ID is set; otherwise a PayPal link.
    const ppLink = safeUrl(p.paypalUrl) || (CFG.paypalMeUser ? `https://www.paypal.me/${encodeURIComponent(CFG.paypalMeUser)}/${p.price}${CUR}` : '');
    if (CFG.paypalClientId) {
      pp.textContent = 'Loading PayPal…';
      loadPayPal().then(() => {
        if (current !== p) return;
        pp.textContent = '';
        window.paypal.Buttons({
          style: { layout: 'vertical', shape: 'rect', label: 'pay' },
          createOrder: (d, actions) => actions.order.create({
            purchase_units: [{ description: p.name.slice(0, 120), custom_id: p.id, amount: { currency_code: CUR, value: Number(p.price).toFixed(2) } }]
          }),
          onApprove: (d, actions) => actions.order.capture().then((det) => {
            pp.textContent = '';
            status.innerHTML = `<strong>Payment received. Thank you!</strong><br>Order ID: <code>${esc(det.id)}</code><br>
              <a class="btn btn-primary btn-sm" style="margin-top:.75rem" target="_blank" rel="noopener" href="${esc(waLink(`Hi, I paid for "${p.name}" via PayPal. Order ID: ${det.id}. Please send my files.`))}">Send order ID on WhatsApp to get your files</a><br>
              <small>Or email it to ${esc(CFG.supportEmail)}.</small>`;
          }),
          onError: () => { status.textContent = 'PayPal payment failed. Please try again or use another option.'; }
        }).render(pp);
      }).catch(() => {
        pp.textContent = '';
        if (ppLink) pp.innerHTML = `<a class="btn btn-secondary" href="${esc(ppLink)}" target="_blank" rel="noopener"><i class="fab fa-paypal" aria-hidden="true"></i> Pay with PayPal</a>`;
      });
    } else if (ppLink) {
      pp.innerHTML = `<a class="btn btn-secondary" href="${esc(ppLink)}" target="_blank" rel="noopener"><i class="fab fa-paypal" aria-hidden="true"></i> Pay with PayPal</a>`;
    }

    opts.insertAdjacentHTML('beforeend', `<a class="btn btn-secondary" style="background:#25d366;color:#fff;border-color:#25d366" target="_blank" rel="noopener" href="${esc(waLink(`Hi, I want to buy "${p.name}" ($${p.price}). Please send payment details.`))}"><i class="fab fa-whatsapp" aria-hidden="true"></i> Pay via WhatsApp</a>`);
    modal.classList.add('active');
  }

  const close = () => { modal.classList.remove('active'); current = null; };
  document.getElementById('pay-cancel').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  document.querySelectorAll('.store-filters button').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.store-filters button').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    applyFilter(b.dataset.filter);
  }));
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.buy-now-btn');
    if (!btn) return;
    const p = products.find((x) => x.id === btn.dataset.id);
    if (p) openModal(p);
  });

  fetch('/assets/data/products.json')
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((d) => { products = d.products || []; grid.innerHTML = products.map(card).join(''); })
    .catch(() => { grid.innerHTML = '<p>Products could not be loaded right now. Please refresh, or message us on WhatsApp.</p>'; });
})();
