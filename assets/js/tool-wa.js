/* WhatsApp Link & Button Maker. Runs in the browser. */
(function () {
  const K = window.VRKit, $ = K.$;
  if (!$('#wa-form')) return;
  const CC = [['234', 'Nigeria +234'], ['233', 'Ghana +233'], ['254', 'Kenya +254'], ['27', 'South Africa +27'], ['256', 'Uganda +256'], ['255', 'Tanzania +255'], ['250', 'Rwanda +250'], ['221', 'Senegal +221'], ['225', 'Côte d’Ivoire +225'], ['237', 'Cameroon +237'], ['20', 'Egypt +20'], ['212', 'Morocco +212'], ['44', 'United Kingdom +44'], ['1', 'USA / Canada +1'], ['971', 'UAE +971'], ['91', 'India +91'], ['49', 'Germany +49'], ['33', 'France +33'], ['55', 'Brazil +55'], ['other', 'Other (type full number)']];
  $('#wa-cc').innerHTML = CC.map((c) => `<option value="${c[0]}">${c[1]}</option>`).join('');
  try { const saved = JSON.parse(localStorage.getItem('vr-wa') || '{}'); if (saved.cc) $('#wa-cc').value = saved.cc; if (saved.num) $('#wa-num').value = saved.num; if (saved.msg != null) $('#wa-msg').value = saved.msg; if (saved.label) $('#wa-label').value = saved.label; } catch (e) {}
  const V = { color: '#25D366' };
  const phone = () => {
    let n = $('#wa-num').value.replace(/[^\d]/g, ''), cc = $('#wa-cc').value;
    if (!n) return '';
    if (cc === 'other') return n.replace(/^0+/, '');
    n = n.replace(/^0+/, ''); if (n.startsWith(cc) && n.length > cc.length + 6) n = n.slice(cc.length);
    return cc + n;
  };
  const link = () => { const p = phone(), m = $('#wa-msg').value.trim(); return p.length >= 8 ? 'https://wa.me/' + p + (m ? '?text=' + encodeURIComponent(m) : '') : ''; };
  const esc = K.esc, bg = () => $('#wa-color').value;
  const ICON = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 3.2 17.3L2 22l4.8-1.2A11 11 0 1 0 20.5 3.5zM12 20a9 9 0 0 1-4.6-1.3l-.3-.2-2.8.7.8-2.7-.2-.3A9 9 0 1 1 12 20zm5-6.7c-.3-.1-1.6-.8-1.9-.9s-.5-.1-.7.1-.8.9-.9 1.1-.3.2-.6.1a7.3 7.3 0 0 1-3.6-3.1c-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.4-.5-.6-.5h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.800c.1.200 1.900 3 4.700 4.200 1.700.7 2.400.8 3.200.7.500-.1 1.600-.7 1.800-1.300s.2-1.200.2-1.300-.3-.2-.6-.4z"/></svg>';
  function snippets(url) {
    const l = ($('#wa-label').value || 'Chat on WhatsApp').trim(), c = bg();
    const btn = `<a href="${url}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:10px;padding:12px 20px;background:${c};color:#fff;border-radius:999px;font:600 16px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.18)">${ICON.replace(/"/g, '\'')} ${esc(l)}</a>`;
    const float = `<a href="${url}" target="_blank" rel="noopener" aria-label="${esc(l)}" style="position:fixed;right:18px;bottom:18px;z-index:9999;width:58px;height:58px;display:flex;align-items:center;justify-content:center;background:${c};color:#fff;border-radius:50%;box-shadow:0 6px 20px rgba(0,0,0,.28)">${ICON.replace(/width='22' height='22'|width="22" height="22"/, 'width="30" height="30"').replace(/"/g, '\'')}</a>`;
    return { btn, float };
  }
  function qrMatrix(text) { try { const q = window.qrcode(0, 'M'); q.addData(text); q.make(); const n = q.getModuleCount(), m = []; for (let r = 0; r < n; r++) { m[r] = []; for (let c = 0; c < n; c++) m[r][c] = q.isDark(r, c); } return m; } catch (e) { return null; } }
  function drawQR(canvas, url, size) {
    const m = qrMatrix(url); if (!m) return false; const n = m.length, quiet = 3, cell = size / (n + quiet * 2); canvas.width = canvas.height = size;
    const x = canvas.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, size, size); x.fillStyle = '#0b3d1e';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (m[r][c]) x.fillRect(Math.floor((c + quiet) * cell), Math.floor((r + quiet) * cell), Math.ceil(cell), Math.ceil(cell));
    return true;
  }
  let url = '';
  function update() {
    url = link(); const ok = !!url;
    $('#wa-empty').hidden = ok; $('#wa-out').hidden = !ok;
    try { localStorage.setItem('vr-wa', JSON.stringify({ cc: $('#wa-cc').value, num: $('#wa-num').value, msg: $('#wa-msg').value, label: $('#wa-label').value })); } catch (e) {}
    $('#wa-count').textContent = $('#wa-msg').value.length + ' / 500';
    if (!ok) return;
    $('#wa-url').value = url; $('#wa-bubble').textContent = $('#wa-msg').value.trim() || 'Hello 👋';
    const s = snippets(url); $('#wa-code-btn').value = s.btn; $('#wa-code-float').value = s.float;
    const pv = $('#wa-btn-prev'); pv.innerHTML = s.btn; pv.querySelector('a').addEventListener('click', (e) => e.preventDefault());
    drawQR($('#wa-qr'), url, 360);
    $('#wa-test').href = url;
  }
  ['wa-cc', 'wa-num', 'wa-msg', 'wa-label', 'wa-color'].forEach((id) => $('#' + id).addEventListener('input', update));
  $('#wa-cc').addEventListener('change', update);
  const copy = async (text, ok) => { try { await navigator.clipboard.writeText(text); K.toast(ok); } catch (e) { K.toast('Select the text and copy it manually.', 'err'); } };
  $('#wa-copy').onclick = () => url && copy(url, 'Link copied');
  $('#wa-copy-btn').onclick = () => url && copy($('#wa-code-btn').value, 'Button code copied');
  $('#wa-copy-float').onclick = () => url && copy($('#wa-code-float').value, 'Chat widget code copied');
  $('#wa-qr-png').onclick = (e) => K.busy(e.currentTarget, async () => { const c = K.canvas(1024, 1024); drawQR(c, url, 1024); K.download(await K.canvasBlob(c, 'image/png'), 'whatsapp-qr.png'); });
  $('#wa-poster').onclick = (e) => K.busy(e.currentTarget, async () => {
    const W = 1240, H = 1754, c = K.canvas(W, H), x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    x.fillStyle = bg(); x.fillRect(0, 0, W, 330); x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = '700 78px Inter, system-ui, sans-serif'; x.fillText('Chat with us on WhatsApp', W / 2, 190);
    const q = K.canvas(820, 820); drawQR(q, url, 820); x.drawImage(q, (W - 820) / 2, 430);
    x.fillStyle = '#14110d'; x.font = '600 52px Inter, system-ui, sans-serif'; x.fillText('Scan with your phone camera', W / 2, 1360);
    x.fillStyle = '#555'; x.font = '500 40px Inter, system-ui, sans-serif'; x.fillText('+' + phone(), W / 2, 1440);
    const blob = await K.pdfPages([{ canvas: c, w: 595.28, h: 841.89 }], { quality: 0.92, title: 'WhatsApp QR poster' }); K.download(blob, 'whatsapp-poster.pdf');
  });
  $('#wa-form').addEventListener('submit', (e) => e.preventDefault());
  update();
})();
