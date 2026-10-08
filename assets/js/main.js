// ============================================
// VIBRANTREVOLVE — MAIN JAVASCRIPT
// Component loader, theme, navigation, utilities
// ============================================

// ===== LOADING SCREEN MANAGER =====
const LoadingManager = {
  screen: null,
  componentsToLoad: 0,
  componentsLoaded: 0,

  init() {
    this.screen = document.getElementById('loadingScreen');
  },

  registerComponent() {
    this.componentsToLoad++;
  },

  componentLoaded() {
    this.componentsLoaded++;
    if (this.componentsLoaded >= this.componentsToLoad) {
      this.hide();
    }
  },

  hide() {
    if (!this.screen) return;
    this.screen.style.opacity = '0';
    this.screen.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      this.screen.style.display = 'none';
    }, 500);
  },

  // Fallback: hide after max 3 seconds regardless
  forceHide() {
    setTimeout(() => this.hide(), 3000);
  }
};

// ===== COMPONENT LOADER =====
async function loadComponent(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;

  LoadingManager.registerComponent();

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    el.innerHTML = html;

    // Re-initialize nav after header loads
    if (selector === '#site-header') initNavigation();

    // Mark theme toggle in loaded header
    if (selector === '#site-header') {
      document.documentElement.setAttribute('data-theme', ThemeManager.saved() || ThemeManager.system());
    }

  } catch (error) {
    console.error(`Failed to load ${url}:`, error);
    el.innerHTML = `<p class="error">Failed to load component. <a href="/">Go home</a></p>`;
  } finally {
    LoadingManager.componentLoaded();
  }
}

// ===== THEME TOGGLE =====
const ThemeManager = {
  saved() { try { const v = localStorage.getItem('vr_theme') || localStorage.getItem('vibrantrevolve-theme'); return v === 'light' || v === 'dark' ? v : null; } catch (e) { return null; } },
  system() { return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; },
  init() {
    // Follow the visitor's phone/computer setting until they pick a theme themselves
    this.apply(this.saved() || this.system(), false);
    if (window.matchMedia) window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => { if (!this.saved()) this.apply(e.matches ? 'light' : 'dark', false); });
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('#theme-toggle');
      if (toggle) {
        e.preventDefault();
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        this.apply(next, true);
      }
    });
  },
  apply(theme, remember) {
    document.documentElement.setAttribute('data-theme', theme);
    if (remember) { try { localStorage.setItem('vr_theme', theme); } catch (e) {} }
  }
};

// ===== NAVIGATION =====
function initNavigation() {
  const hamburger = document.getElementById('hamburger');
  const navbar = document.getElementById('navbar');

  if (!hamburger || !navbar) return;

  // Remove old listeners by cloning (prevents duplicates on re-init)
  const newHamburger = hamburger.cloneNode(true);
  hamburger.parentNode.replaceChild(newHamburger, hamburger);

  newHamburger.addEventListener('click', () => {
    const isOpen = navbar.classList.toggle('open');
    newHamburger.classList.toggle('open', isOpen);
    newHamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close on link click + smooth scroll
  navbar.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (navbar.classList.contains('open')) {
        navbar.classList.remove('open');
        newHamburger.classList.remove('open');
        newHamburger.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// ===== SCROLL PROGRESS =====
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${scrolled}%`;
    bar.setAttribute('aria-valuenow', Math.round(scrolled));
  });
}

// ===== BACK TO TOP =====
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== STICKY CTA =====
function initStickyCTA() {
  const cta = document.querySelector('.sticky-cta');
  const hero = document.querySelector('.home-section, .hero-section');
  if (!cta || !hero) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      cta.classList.toggle('visible', !entry.isIntersecting);
    });
  }, { threshold: 0 });

  observer.observe(hero);
}

// ===== INTERSECTION OBSERVER ANIMATIONS =====
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in-element').forEach(el => observer.observe(el));
}

// ===== DEBOUNCE UTILITY =====
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// ===== INIT ALL =====
document.addEventListener('DOMContentLoaded', () => {
  LoadingManager.init();
  ThemeManager.init();
  initScrollProgress();
  initBackToTop();
  initStickyCTA();
  initScrollAnimations();

  // Load components
  loadComponent('#site-header', '/components/header.html');
  loadComponent('#site-footer', '/components/footer.html');

  // Force hide loader after 3s max (fallback)
  LoadingManager.forceHide();
});

// Also hide on window.load as extra safety
window.addEventListener('load', () => {
  LoadingManager.hide();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ThemeManager, loadComponent, debounce, LoadingManager };
}
