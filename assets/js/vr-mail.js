/* Sends form mail through EmailJS' REST API directly (same call their library makes), so it works even when the
   EmailJS CDN script is blocked or slow. Mail goes to the address set in your EmailJS template. No mail-app popups. */
window.vrMail = {
  send: function (params) {
    var c = window.VR_CONFIG || {};
    var fail = function (text) { var e = new Error(text); e.text = text; return e; };
    if (!c.emailjsServiceId || !c.emailjsTemplateId || !c.emailjsPublicKey) return Promise.reject(fail('Email is not configured'));
    params = params || {};
    params.to_email = params.to_email || c.supportEmail || 'vr@vibrantrevolve.com';
    params.user_email = params.user_email || params.to_email; // some templates address the mail with {{user_email}}
    return fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: c.emailjsServiceId, template_id: c.emailjsTemplateId, user_id: c.emailjsPublicKey, template_params: params })
    }).then(function (r) {
      return r.text().then(function (t) {
        if (r.ok) return t;
        var e = fail(t || ('HTTP ' + r.status)); e.status = r.status; throw e;
      });
    }, function () { throw fail('Could not reach EmailJS (ad blocker or connection)'); });
  }
};
