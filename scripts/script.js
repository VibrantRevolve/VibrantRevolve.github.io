// ============================================
// VIBRANTREVOLVE — PRODUCTION JAVASCRIPT
// Complete with theme toggle, testimonials, 
// portfolio filtering, form handling & more
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  
  // === EMAILJS INIT ===
  if (window.emailjs) {
    emailjs.init("CnB0xCvycunmgJ5OH");
  }

  // === LOADING SCREEN WITH TIMEOUT FALLBACK ===
  const loadingScreen = document.getElementById("loadingScreen");
  const hideLoader = () => {
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      loadingScreen.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        loadingScreen.style.display = "none";
      }, 500);
    }
  };
  
  window.addEventListener("load", hideLoader);
  setTimeout(hideLoader, 5000); // Force hide after 5 seconds

  // === THEME TOGGLE ===
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  
  const getPreferredTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };
  
  const applyTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };
  
  // Init theme
  applyTheme(getPreferredTheme());
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }
  
  // Listen for system changes
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'light' : 'dark');
    }
  });

  // === MOBILE NAVIGATION ===
  const hamburger = document.getElementById('hamburger');
  const navbar = document.getElementById('navbar');

  if (hamburger && navbar) {
    hamburger.addEventListener('click', () => {
      navbar.classList.toggle('open');
      hamburger.classList.toggle('open');
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !expanded);
    });
  }

  // === SMOOTH SCROLL + CLOSE MOBILE MENU ===
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Close mobile menu if open
      if (navbar?.classList.contains('open')) {
        navbar.classList.remove('open');
        hamburger?.classList.remove('open');
        hamburger?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // === SCROLL PROGRESS BAR ===
  const scrollProgress = document.querySelector('.scroll-progress');
  
  window.addEventListener('scroll', () => {
    if (scrollProgress) {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgress.style.width = `${scrolled}%`;
    }

    // === BACK TO TOP BUTTON ===
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
      backToTop.style.display = window.scrollY > 300 ? 'flex' : 'none';
    }
  });

  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // === PORTFOLIO FILTERING ===
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      
      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filter items with animation
      portfolioItems.forEach(item => {
        const category = item.dataset.category;
        const shouldShow = filter === 'all' || category === filter;
        
        if (shouldShow) {
          item.style.display = 'block';
          item.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          item.style.display = 'none';
          item.style.animation = 'none';
        }
      });
    });
  });

  // === TESTIMONIALS CAROUSEL (Auto-rotate optional) ===
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  let currentTestimonial = 0;

  // Add intersection observer for testimonial animations
  const testimonialObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
        testimonialObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  testimonialCards.forEach(card => {
    card.style.opacity = '0';
    testimonialObserver.observe(card);
  });

  // === CONTACT FORM WITH VALIDATION ===
  const contactForm = document.getElementById('contactForm');
  const modal = document.getElementById('confirmationModal');
  const closeModalBtn = document.getElementById('closeModal');

  if (contactForm && modal) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : 'Send Message';

    const isValidEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = contactForm.from_name.value.trim();
      const email = contactForm.from_email.value.trim();
      const message = contactForm.message.value.trim();

      if (name.length < 2) {
        alert('Please enter your full name (at least 2 characters).');
        contactForm.from_name.focus();
        return;
      }

      if (!isValidEmail(email)) {
        alert('Please enter a valid email address.');
        contactForm.from_email.focus();
        return;
      }

      if (message.length < 10) {
        alert('Please tell me more about your project (at least 10 characters).');
        contactForm.message.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      emailjs.sendForm('service_4vc302d', 'template_51idxwf', contactForm)
        .then(() => {
          modal.style.display = 'flex';
          contactForm.reset();
          console.log('Form submitted successfully');
        })
        .catch((error) => {
          console.error('EmailJS Error:', error);
          alert('Oops! Something went wrong. Please try again or email me directly.');
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        });
    });

    // === MODAL HANDLERS ===
    closeModalBtn?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        modal.style.display = 'none';
      }
    });
  }

  // === CALENDLY BOOKING ===
  const calendlyBtn = document.getElementById('calendly-button');
  
  if (calendlyBtn) {
    calendlyBtn.addEventListener('click', () => {
      if (window.Calendly?.initPopupWidget) {
        Calendly.initPopupWidget({
          url: 'https://calendly.com/vibrantrevolve/discovery-call'
        });
        console.log('Calendly opened');
      } else {
        alert('Booking system is loading... Please try again in a moment.');
        window.open('https://calendly.com/vibrantrevolve/discovery-call', '_blank');
      }
    });
  }

  // === CTA TRACKING ===
  document.querySelectorAll('.hire-button, .book-call-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      console.log('CTA clicked:', btn.textContent.trim());
    });
  });

  // === INTERSECTION OBSERVER FOR SECTION ANIMATIONS ===
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('section').forEach(section => {
    section.classList.add('fade-in-element');
    sectionObserver.observe(section);
  });

  // === STICKY CTA VISIBILITY ===
  const stickyCta = document.querySelector('.sticky-cta');
  if (stickyCta) {
    window.addEventListener('scroll', () => {
      const heroSection = document.querySelector('.home-section');
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        stickyCta.style.transform = heroBottom < 0 ? 'translateY(0)' : 'translateY(100%)';
      }
    });
  }

});

// ============================================
// UTILITY FUNCTIONS
// ============================================

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const throttledScroll = debounce(() => {
  // Additional scroll-based logic can go here
}, 16);

window.addEventListener('scroll', throttledScroll);
