// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize EmailJS if available
  if (window.emailjs) {
    emailjs.init("CnB0xCvycunmgJ5OH");
  }

  // Mobile nav toggle
  const hamburger = document.getElementById('hamburger');
  const navbar = document.getElementById('navbar');
  if (hamburger && navbar) {
    hamburger.addEventListener('click', () => {
      navbar.classList.toggle('open');
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !expanded);
    });
  }

  // Back to Top Button
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (backToTop) {
      backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
    }

    // Scroll Progress Bar
    const scrollProgress = document.querySelector('.scroll-progress');
    if (scrollProgress) {
      const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      scrollProgress.style.width = `${scrolled}%`;
    }
  });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // EmailJS Form Submission
  const contactForm = document.getElementById('contactForm');
  const modal = document.getElementById('confirmationModal');
  const closeModal = document.getElementById('closeModal');

  if (contactForm && modal && closeModal) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      emailjs.sendForm('service_4vc302d', 'template_51idxwf', this)
        .then(() => {
          modal.style.display = 'flex';
          contactForm.reset();
        })
        .catch((error) => {
          alert('Oops! Something went wrong: ' + error.text);
        });
    });

    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        modal.style.display = 'none';
      }
    });
  }
});

// Hiding loading screen after full page (including images) is loaded
window.addEventListener("load", () => {
  const loadingScreen = document.getElementById("loadingScreen");
  if (loadingScreen) {
    loadingScreen.style.display = "none";
  }
});

// portfolio filtering
document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    document.querySelectorAll('.portfolio-item').forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  });
});
