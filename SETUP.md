# What changed and how to finish setup

## 1. Store (assets/data/products.json)
Products now live in one JSON file. Edit it directly, or use /admin (see 5).
For each product paste your **checkoutUrl** (Selar / Paystack / Flutterwave payment link).
Empty checkoutUrl = that button is simply hidden. WhatsApp ordering always works.
Add **previewUrl** (a live demo link) to show a "Live Preview" button.

## 2. PayPal (assets/js/site-config.js)
- Best: create a PayPal app at developer.paypal.com, paste the **Live client ID** into `paypalClientId`. Buyers get PayPal card buttons in the modal.
- Simple: set `paypalMeUser` for a plain PayPal.Me link.
- After a PayPal payment the buyer gets an order ID and a WhatsApp/email prompt. **Delivery is manual**: open your PayPal dashboard, confirm the amount and product match, then send the files.
- PayPal availability differs by country: confirm your account can *receive* payments before relying on it.

## 3. Banner (assets/data/banners.json)
Edit text/links. `until` (e.g. 2026-12-31) auto-hides an expired promo.

## 4. Auto blog (scripts/ + .github/workflows/news.yml)
Runs daily, adds up to 3 relevant items to blog/posts.json and opens a **pull request**. Merge = publish.
One-time: repo Settings > Actions > General > enable "Allow GitHub Actions to create and approve pull requests".
Check the feed URLs in scripts/feeds.json work for you. Add a `"take"` line to posts you merge.

## 5. Admin (/admin) - optional
Needs a GitHub OAuth proxy (free on Cloudflare Workers). Set `repo` and `base_url` in admin/config.yml.

## Still on your to-do list
Real testimonials, product screenshots, a refund policy page, and updating Privacy/Terms. If you move to Vercel later, delete CNAME.

## 6. Chat assistant ("Ask VR", bottom-left)
Works immediately with answers from `assets/data/assistant.json` (generated from your real services, prices and store).
Edit that file when prices or services change. For real AI replies, follow `workers/assistant/README.md`
(costs per use, so set a spend limit) and put the Worker URL in `assets/js/site-config.js` as `assistantUrl`.

## 7. Studio Tools (/tools/) and Brand Studio (/brand-studio/)
No setup. Twenty tools run fully in the visitor's browser: Brand Studio, Logo Maker, Name Generator, Copy Writer, Palette Extractor, Invoice Maker, QR Code Maker, Image Compressor, PDF Tools, WhatsApp Link Maker, Flyer & Post Maker, CV Builder, Voice Studio, Video Studio, Business Calculators, Receipt Maker, Business Card Maker, Price List Maker, Cover Letter Writer, Link-in-Bio Maker.
- The **Tools** button in the header opens the zip-style tray. The list lives in `assets/js/tools.js` (add or rename tools there, and in `tools/index.html`).
- Brand Studio exports a 2-page A4 **PDF brief** (brand board + project request with contact details, services, budget, notes and a WhatsApp QR). The visitor sends it to you from the page (phone share sheet, or download then WhatsApp / email).
- Shared code: `assets/js/tools-kit.js` (PDF/PNG export, colour maths), `assets/js/brand-engine.js` (palette, fonts, logos, brief layout), `assets/css/tools.css`.
- The QR library in `assets/js/vendor/qrcode.js` is Kazuhiko Arase's MIT-licensed QRCode.
- Fonts for the exported PDFs load from Google Fonts. If a visitor is offline, the PDF falls back to Georgia / system sans.
- Favicons: `favicon.ico`, `site.webmanifest` and `assets/images/favicon/` are generated from the gold VR logo (`logo-mark.png` is the transparent mark used in the header and footer).

The animated hero (`assets/js/aurora.js`) pauses off-screen and shows a still frame for visitors who prefer reduced motion.


## 8. Optional: "Write with AI" in Studio Tools (Cloudflare Workers AI)
The Copy Writer, Name Generator and Brand Studio taglines can use real AI. It runs on Cloudflare Workers AI, so there is no API key.
Follow `workers/studio-ai/README.md`, then paste the Worker URL into `assets/js/site-config.js` as `studioAiUrl`. Until you do, the AI buttons stay hidden and the built-in generators are used.

## Trending topics (Flyer & Post Maker)
`scripts/build-trends.mjs` reads the headlines in `blog/posts.json` and writes `assets/data/trends.json`. It runs inside both GitHub workflows right after the news build, so the topic chips in the Flyer & Post Maker refresh with every news run. It does not scrape Google, X or Instagram. Topics improve as more headlines accumulate.

## Cloudflare Worker extras (optional)

Once `studioAiUrl` in `assets/js/site-config.js` points at your deployed Worker, these switch on by themselves: the smarter VR assistant, CV and post writing help, AI pictures and voice-over in Video Studio, file transcription and MP3 download in Voice Studio.

Optional extras in `assets/js/site-config.js`:
- `turnstileSiteKey`: your Cloudflare Turnstile **site** key. Adds an invisible bot check to the contact form (put the secret key in the Worker as `TURNSTILE_SECRET`).
- `cfAnalyticsToken`: your Cloudflare Web Analytics token (dash.cloudflare.com, Analytics and Logs, Web Analytics). Cookie-free visitor stats.

In the Worker (see `workers/studio-ai/README.md`): `RESEND_API_KEY` emails you contact messages and confirmed payments, a free KV namespace `LEADS` keeps a copy, `PAYSTACK_SECRET` / `FLW_SECRET` let the Worker confirm payments with the provider before the customer sees the success page.
