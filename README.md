# 🚀 VibrantRevolve — Freelance Developer Portfolio

> **Production-ready portfolio website for a freelance web & software developer.**  
> Built with vanilla HTML, CSS, and JavaScript. No frameworks required.

---

## 📁 Project Structure

```
vibrantrevolve/
├── index.html                 # Landing page (hero, services, testimonials, contact)
├── about.html                 # About me + tech stack + resume download
├── services/
│   ├── index.html             # Services overview (all 9 services)
│   ├── web-development.html   # Individual service page
│   ├── software-development.html
│   ├── graphic-design.html
│   ├── content-writing.html
│   ├── digital-marketing.html
│   ├── cv-creation.html
│   ├── proofreading.html
│   ├── summarizing.html
│   └── business-card.html
├── portfolio/
│   └── index.html             # Project showcase with case studies
├── pricing/
│   └── index.html             # Unified pricing (single source of truth)
├── contact/
│   └── index.html             # Contact form + Calendly booking
├── payment/
│   ├── index.html             # Secure payment page
│   └── success.html           # Payment success confirmation
├── assets/
│   ├── css/
│   │   └── main.css             # Consolidated stylesheet (~24KB)
│   ├── js/
│   │   ├── main.js              # Core: theme, nav, scroll, components
│   │   ├── pricing-data.js      # SINGLE SOURCE OF TRUTH for all prices
│   │   ├── pricing.js           # Currency conversion + payment prep
│   │   ├── contact.js           # Form validation + EmailJS
│   │   └── payment.js           # Secure payment handling
│   └── images/
│       ├── portfolio/           # Project screenshots
│       ├── clients/             # Client photos (with permission)
│       └── favicon/             # Favicon files
├── components/
│   ├── header.html              # Reusable site header
│   └── footer.html              # Reusable site footer
├── .env.example                 # Environment variable template
├── .gitignore                   # Excludes API keys & node_modules
├── robots.txt                   # Search engine directives
├── sitemap.xml                  # SEO sitemap
└── README.md                    # This file
```

---

## ✨ Key Features

| Feature | Status | Notes |
|---------|--------|-------|
| **Dark/Light Theme** | ✅ | Auto-detects system preference, persists in localStorage |
| **Mobile Responsive** | ✅ | Hamburger menu, adaptive grids, touch-friendly |
| **Component System** | ✅ | Header/footer loaded dynamically via `fetch()` |
| **Single Source of Truth** | ✅ | All prices in `pricing-data.js` — change once, update everywhere |
| **Live Currency Conversion** | ✅ | USD/NGN/EUR/GBP with live exchange rates + fallback |
| **Secure Payments** | ✅ | PayPal, Paystack, Flutterwave. No sensitive data in localStorage |
| **SEO Optimized** | ✅ | Structured data, OG tags, sitemap, semantic HTML |
| **Accessibility** | ✅ | ARIA labels, skip links, focus management, reduced motion |
| **Form Validation** | ✅ | Client-side + visual feedback + EmailJS integration |
| **Scroll Animations** | ✅ | Intersection Observer fade-in effects |
| **Print Styles** | ✅ | Optimized for printing resumes/proposals |

---

## 🛠️ Setup & Deployment

### 1. Clone & Configure

```bash
git clone https://github.com/YOUR_HANDLE/vibrantrevolve.git
cd vibrantrevolve
cp .env.example .env
# Edit .env with your real API keys
```

### 2. Add Your Content

**Critical replacements needed:**

| Placeholder | File | What to Replace With |
|-------------|------|---------------------|
| `YOUR_REAL_GITHUB_HANDLE` | `index.html`, `components/footer.html` | Your actual GitHub username |
| `YOUR_REAL_LINKEDIN_HANDLE` | `index.html`, `components/footer.html` | Your LinkedIn URL |
| `YOUR_EMAILJS_PUBLIC_KEY` | `assets/js/contact.js` | From EmailJS dashboard |
| `YOUR_SERVICE_ID` | `assets/js/contact.js` | EmailJS service ID |
| `YOUR_TEMPLATE_ID` | `assets/js/contact.js` | EmailJS template ID |
| `YOUR_PAYSTACK_PUBLIC_KEY` | `assets/js/payment.js` | Paystack test/live key |
| `YOUR_FLUTTERWAVE_PUBLIC_KEY` | `assets/js/payment.js` | Flutterwave public key |
| `YOUR_PAYPAL_CLIENT_ID` | `payment/index.html` | PayPal client ID |
| `assets/images/portfolio/*.jpg` | Multiple | Your real project screenshots |
| `assets/images/clients/*.jpg` | `index.html` | Real client photos (with permission) |
| `assets/resume.pdf` | `about.html`, `index.html` | Your actual resume PDF |

### 3. Deploy

**Option A: Static Hosting (Free)**
```bash
# Vercel
npm i -g vercel
vercel --prod

# Netlify
npm i -g netlify-cli
netlify deploy --prod --dir=.

# GitHub Pages
# Push to gh-pages branch or use GitHub Actions
```

**Option B: Traditional Hosting**
Upload all files via FTP/cPanel to your web host.

---

## 🔒 Security Checklist

- [ ] `.env` is in `.gitignore` and NEVER committed
- [ ] API keys are loaded from environment variables
- [ ] Payment data uses URL params, NOT localStorage
- [ ] `robots.txt` blocks sensitive directories
- [ ] `noindex` meta on payment/success pages
- [ ] HTTPS enforced on hosting platform
- [ ] Content Security Policy headers set (via hosting)

---

## 📝 Content Strategy

### Portfolio Projects (Replace Placeholders)
For each project, you need:
1. **Screenshot** (16:10 ratio, 1200x750px minimum)
2. **Live demo link** (deployed on Vercel/Netlify)
3. **GitHub repo** with good README
4. **Case study page** (optional but powerful)

### Case Study Template
Each case study should cover:
- **Problem** — What needed solving?
- **Approach** — Technologies chosen and why
- **Challenges** — What went wrong and how fixed
- **Results** — Numbers (users, performance, revenue)
- **What you'd do differently** — Shows growth mindset

---

## 🎨 Customization

### Colors
Edit CSS variables in `assets/css/main.css`:
```css
:root {
  --accent: #ffd700;        /* Your brand color */
  --bg-primary: #0a0a0a;    /* Dark mode bg */
  --bg-secondary: #111111;  /* Card bg */
}
```

### Pricing
Edit `assets/js/pricing-data.js`:
```javascript
const PRICING_DATA = {
  "web-development": {
    tiers: [
      { name: "Starter", usd: 50, ... },
      // Change prices here — updates everywhere
    ]
  }
};
```

### Services
Add new services to `pricing-data.js` + create `services/new-service.html` from template.

---

## 📊 Analytics (Privacy-Friendly)

Recommended: [Plausible Analytics](https://plausible.io) or [Umami](https://umami.is)

Add to `assets/js/analytics.js`:
```javascript
// Plausible
<script defer data-domain="vibrantrevolve.com" src="https://plausible.io/js/plausible.js"></script>

// Or Umami self-hosted
<script async defer data-website-id="YOUR_ID" src="https://analytics.yourdomain.com/umami.js"></script>
```

---

## 🧪 Testing Checklist

Before going live:
- [ ] Lighthouse score 90+ (Performance, Accessibility, SEO, Best Practices)
- [ ] Test on iOS Safari, Android Chrome, Desktop Chrome/Firefox/Safari
- [ ] Test contact form submission
- [ ] Test payment flow (use test keys)
- [ ] Test theme toggle persists across pages
- [ ] Test mobile hamburger menu
- [ ] Verify all internal links work
- [ ] Check for broken images
- [ ] Validate HTML (validator.w3.org)
- [ ] Validate CSS (jigsaw.w3.org/css-validator)

---

## 📄 License

MIT License — feel free to use as a template for your own portfolio.

**Attribution appreciated but not required.**

---

## 🤝 Support

Questions? Issues?
- WhatsApp: [+234 901 273 9299](https://wa.me/2349012739299)
- Email: hello@vibrantrevolve.com

---

**Built with ❤️ by VibrantRevolve**  
*Last updated: May 2026*
