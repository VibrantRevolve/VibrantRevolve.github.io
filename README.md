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