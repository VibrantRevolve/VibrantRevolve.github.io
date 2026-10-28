// Store settings. Edit this file, then commit. Nothing here is secret:
// a PayPal *client ID* and a PayPal.Me name are public by design.
// NEVER put a PayPal/Paystack SECRET key in this repo.
window.VR_CONFIG = {
  // From developer.paypal.com > Apps & Credentials (use the Live client ID).
  // Leave "" to hide the PayPal card buttons.
  paypalClientId: "",
  // Fallback if you have no client ID: your PayPal.Me name, e.g. "vibrantrevolve".
  // Leave "" to hide the fallback link.
  paypalMeUser: "",
  // Optional: URL of your Cloudflare Worker for real AI chat replies (see workers/assistant/README.md). "" = built-in answers only.
  assistantUrl: "https://vr-studio-ai.vr-studio.workers.dev/",
  // Optional: URL of your Cloudflare Worker for the "Write with AI" buttons in Studio Tools (see workers/studio-ai/README.md). "" = buttons hidden.
  studioAiUrl: "https://vr-studio-ai.vr-studio.workers.dev/",
  // Optional: Cloudflare Turnstile SITE key (public) to protect the contact form from bots. "" = no check. Secret key goes in the Worker.
  turnstileSiteKey: "",
  // Optional: Cloudflare Web Analytics token (dash.cloudflare.com > Analytics & Logs > Web Analytics). "" = no analytics.
  cfAnalyticsToken: "",
  // Optional: EmailJS (emailjs.com) so the contact form and payment confirmations send email. All three are public IDs. "" = falls back to opening the visitor's mail app.
  emailjsPublicKey: "CnB0xCvycunmgJ5OH",
  emailjsServiceId: "service_4vc302d",
  emailjsTemplateId: "template_51idxwf",
  // Public checkout keys (never the secret ones). "" = that method is hidden and checkout falls back to WhatsApp.
  paystackPublicKey: "",
  flutterwavePublicKey: "",
  // Optional: Google Appointment Schedule / Calendly link for /book/. "" = the page shows a "request a time" form that sends to WhatsApp.
  bookingUrl: "",
  currency: "USD",
  whatsapp: "2349012739299",
  supportEmail: "vr@vibrantrevolve.com"
};
