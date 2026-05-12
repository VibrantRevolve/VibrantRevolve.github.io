// ============================================
// VIBRANTREVOLVE — PRICING DATA (Single Source of Truth)
// Edit prices here. All pages auto-update.
// ============================================

const PRICING_DATA = {
  "web-development": {
    title: "Web Development",
    icon: "🌐",
    description: "Custom websites built for performance and conversion",
    tiers: [
      {
        name: "Starter",
        description: "1-page site, mobile responsive, basic SEO",
        usd: 50,
        features: ["Single landing page", "Mobile responsive", "Basic SEO setup", "1 revision round"]
      },
      {
        name: "Pro",
        description: "5-page site, animations, full SEO optimization",
        usd: 150,
        popular: true,
        features: ["Up to 5 pages", "Custom animations", "Full SEO package", "Contact form integration", "3 revision rounds"]
      },
      {
        name: "Business",
        description: "10 pages, blog, ecommerce-ready foundation",
        usd: 300,
        features: ["Up to 10 pages", "Blog setup", "E-commerce ready", "Analytics dashboard", "5 revision rounds", "30-day support"]
      }
    ]
  },

  "software-development": {
    title: "Software Development",
    icon: "💻",
    description: "Custom tools, scripts, and applications",
    tiers: [
      {
        name: "Utility Script",
        description: "Python, JavaScript, automation tools",
        usd: 250,
        features: ["Custom script/tool", "Documentation", "Source code delivery", "1 revision round"]
      },
      {
        name: "Desktop App",
        description: "Standalone, multi-platform application",
        usd: 450,
        popular: true,
        features: ["Cross-platform app", "Installer package", "User documentation", "3 revision rounds", "14-day support"]
      },
      {
        name: "Full SaaS Tool",
        description: "Scalable cloud-powered platform",
        usd: 700,
        features: ["Cloud deployment", "User authentication", "Database integration", "Admin dashboard", "API endpoints", "30-day support"]
      }
    ]
  },

  "graphic-design": {
    title: "Graphic Design",
    icon: "🎨",
    description: "Visual identity and marketing materials",
    tiers: [
      {
        name: "Logo Design",
        description: "Modern, unique branding",
        usd: 40,
        features: ["3 initial concepts", "Vector files (SVG, AI)", "PNG & JPG exports", "2 revision rounds"]
      },
      {
        name: "Social Media Kit",
        description: "Graphics for Instagram, Facebook, etc.",
        usd: 70,
        popular: true,
        features: ["10 custom graphics", "Brand templates", "Multiple sizes", "Source files included"]
      },
      {
        name: "Brand Identity",
        description: "Full brand design & assets",
        usd: 150,
        features: ["Logo + variations", "Color palette", "Typography guide", "Business card design", "Social media kit", "Brand guidelines PDF"]
      }
    ]
  },

  "content-writing": {
    title: "Content Writing",
    icon: "✍️",
    description: "SEO-optimized content that converts",
    tiers: [
      {
        name: "Blog Article",
        description: "SEO optimized 1000 words",
        usd: 30,
        features: ["1000 words", "Keyword research", "SEO optimization", "1 revision round"]
      },
      {
        name: "Website Content",
        description: "Landing pages, About Us, etc.",
        usd: 60,
        features: ["Up to 5 pages", "SEO meta descriptions", "Call-to-action copy", "2 revision rounds"]
      },
      {
        name: "Full Copywriting",
        description: "Sales pages, email sequences",
        usd: 120,
        popular: true,
        features: ["Sales page copy", "Email sequence (5 emails)", "A/B test variants", "3 revision rounds"]
      }
    ]
  },

  "digital-marketing": {
    title: "Digital Marketing",
    icon: "📈",
    description: "Data-driven marketing campaigns",
    tiers: [
      {
        name: "Social Media Ads",
        description: "Facebook, IG, TikTok campaign setup",
        usd: 100,
        features: ["Campaign strategy", "Ad creative design", "Audience targeting", "Pixel setup", "7-day monitoring"]
      },
      {
        name: "SEO Setup",
        description: "Keyword research & on-page SEO",
        usd: 150,
        popular: true,
        features: ["Keyword research", "On-page optimization", "Technical SEO audit", "XML sitemap", "Google Search Console setup"]
      },
      {
        name: "Email Marketing",
        description: "Campaign automation setup",
        usd: 300,
        features: ["Automation workflow", "Segmentation setup", "Template design", "A/B testing", "Monthly analytics report"]
      }
    ]
  },

  "cv-creation": {
    title: "Custom CV Creation",
    icon: "📄",
    description: "Professional CVs that get interviews",
    tiers: [
      {
        name: "Entry-Level",
        description: "Professional CV for fresh graduates",
        usd: 30,
        features: ["ATS-friendly format", "Skills section", "Clean modern design", "PDF + Word files", "1 revision round"]
      },
      {
        name: "Mid-Level",
        description: "Tailored CV for 3–7 years experience",
        usd: 60,
        popular: true,
        features: ["Achievement-focused format", "Keyword optimization", "LinkedIn profile tips", "Cover letter included", "2 revision rounds"]
      },
      {
        name: "Executive",
        description: "High-impact CV for senior roles",
        usd: 80,
        features: ["Executive summary", "Leadership highlights", "Industry-specific tailoring", "LinkedIn optimization", "Cover letter", "3 revision rounds"]
      }
    ]
  },

  "proofreading": {
    title: "Proofreading",
    icon: "📝",
    description: "Error-free, polished content",
    tiers: [
      {
        name: "Basic",
        description: "Up to 1,000 words",
        usd: 20,
        features: ["Grammar & spelling check", "Punctuation correction", "24-hour turnaround", "Tracked changes"]
      },
      {
        name: "Standard",
        description: "Up to 5,000 words",
        usd: 60,
        features: ["Grammar & punctuation", "Clarity improvements", "Style consistency", "48-hour turnaround", "2 revision rounds"]
      },
      {
        name: "Premium",
        description: "Up to 10,000 words, full editing",
        usd: 120,
        popular: true,
        features: ["Full copy editing", "Structural suggestions", "Formatting consistency", "72-hour turnaround", "Unlimited revisions"]
      }
    ]
  },

  "summarizing": {
    title: "Article & Video Summaries",
    icon: "🧠",
    description: "Concise, actionable summaries",
    tiers: [
      {
        name: "Short Summary",
        description: "Videos up to 5 minutes",
        usd: 10,
        features: ["Concise bullet points", "Key takeaways", "24-hour delivery", "PDF format"]
      },
      {
        name: "Standard Summary",
        description: "Videos up to 15 minutes",
        usd: 25,
        features: ["Key takeaways & insights", "Timestamp references", "Action items list", "48-hour delivery"]
      },
      {
        name: "In-Depth Summary",
        description: "Videos up to 30 minutes",
        usd: 45,
        popular: true,
        features: ["Detailed breakdown", "Context & insights", "Comparative analysis", "72-hour delivery", "Q&A included"]
      }
    ]
  },

  "business-card": {
    title: "Business Card Design",
    icon: "🎴",
    description: "Professional cards that make an impression",
    tiers: [
      {
        name: "Basic",
        description: "Single-sided design",
        usd: 15,
        features: ["Single-sided design", "Your logo & contact details", "Print-ready files", "1 revision round"]
      },
      {
        name: "Standard",
        description: "Double-sided with custom layout",
        usd: 30,
        features: ["Double-sided design", "Custom layout", "Color scheme matching", "Print-ready files", "2 revision rounds"]
      },
      {
        name: "Premium",
        description: "Double-sided with logo enhancement",
        usd: 50,
        popular: true,
        features: ["Double-sided design", "Logo enhancement", "Premium typography", "Multiple format exports", "3 revision rounds"]
      }
    ]
  }
};

// Exchange rate (USD to NGN) — fetched live, fallback here
const EXCHANGE_RATE = {
  ngn: 1560,  // Fallback rate
  eur: 0.92,
  gbp: 0.79
};

// Export for module systems (if used)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PRICING_DATA, EXCHANGE_RATE };
}
