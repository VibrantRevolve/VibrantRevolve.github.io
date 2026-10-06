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
  assistantUrl: "",
  // Optional: URL of your Cloudflare Worker for the "Write with AI" buttons in Studio Tools (see workers/studio-ai/README.md). "" = buttons hidden.
  studioAiUrl: "",
  currency: "USD",
  whatsapp: "2349012739299",
  supportEmail: "vr@vibrantrevolve.com"
};
