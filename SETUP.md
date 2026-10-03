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

## 7. Brand Studio (/brand-studio/) and the animated hero
No setup. Brand Studio runs fully in the visitor's browser. The hero animation (`assets/js/aurora.js`) pauses off-screen
and shows a still frame for visitors who prefer reduced motion.
