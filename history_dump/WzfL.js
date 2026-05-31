/* ============================================
   PORTFOLIO SCRIPT
   ============================================ */

// Portfolio filtering
class PortfolioFilter {
  constructor() {
    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.workItems = document.querySelectorAll('.work-item');
    this.init();
  }

  init() {
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => this.handleFilter(btn));
    });
  }

  handleFilter(btn) {
    const filter = btn.getAttribute('data-filter');

    // Update active button
    this.filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Filter items
    this.workItems.forEach(item => {
      const category = item.getAttribute('data-category');
      
      if (filter === 'all' || category === filter) {
        item.classList.remove('hidden');
        item.style.animation = 'none';
        setTimeout(() => {
          item.style.animation = '';
        }, 10);
      } else {
        item.classList.add('hidden');
      }
    });
  }
}

// Smooth scroll and active nav link
class Navigation {
  constructor() {
    this.navLinks = document.querySelectorAll('.nav-links a');
    this.init();
  }

  init() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
          this.updateActiveLink(link);
        }
      });
    });

    // Update active link on scroll
    window.addEventListener('scroll', () => this.updateActiveOnScroll());
  }

  updateActiveLink(link) {
    this.navLinks.forEach(l => l.style.color = 'var(--text-secondary)');
    link.style.color = 'var(--accent-primary)';
  }

  updateActiveOnScroll() {
    const scrollPosition = window.scrollY + 100;

    document.querySelectorAll('section[id]').forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        const activeLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
        if (activeLink) {
          this.updateActiveLink(activeLink);
        }
      }
    });
  }
}

// Contact form handling
class ContactForm {
  constructor() {
    this.form = document.getElementById('contactForm');
    if (this.form) {
      this.init();
    }
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  handleSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Basic validation
    if (!name || !email || !message) {
      alert('Please fill out all fields');
      return;
    }

    if (!this.isValidEmail(email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Show success message
    const btn = this.form.querySelector('.contact-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Message sent!';
    btn.style.backgroundColor = '#4caf50';

    // Reset form
    this.form.reset();

    // Restore button
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.backgroundColor = '';
    }, 3000);

    // Here you would normally send the data to a server
    console.log('Form submitted:', { name, email, message });
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Intersection Observer for animation on scroll
class ScrollAnimations {
  constructor() {
    this.init();
  }

  init() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe work items and service cards
    document.querySelectorAll('.work-item, .service-card').forEach(el => {
      observer.observe(el);
    });
  }
}

// Initialize all on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioFilter();
  new Navigation();
  new ContactForm();
  new ScrollAnimations();
});

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause animations
    document.body.style.animationPlayState = 'paused';
  } else {
    // Resume animations
    document.body.style.animationPlayState = 'running';
  }
});

// 360 VIEWER MODAL
let viewer360CarouselIndex = 0;

// 360 Viewer Configuration
const viewer360Config = [
  {
    id: 'viewer360Preview1',
    title: 'Swimming Pool',
    image: 'webpimages/floorplans%20and%20model.webp'
  },
  {
    id: 'viewer360Preview2',
    title: 'Hot Room',
    image: '360photoconverterhoteroom.webp'
  },
  {
    id: 'viewer360Preview3',
    title: 'Living Room',
    image: '360photoconverterlivingroom.webp'
  }
];

function open360Modal() {
  const modal = document.getElementById('viewer360Modal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  initViewer360Carousel();
}

function close360Modal() {
  const modal = document.getElementById('viewer360Modal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
  viewer360CarouselIndex = 0;
}

function initViewer360Carousel() {
  viewer360Config.forEach((config) => {
    const element = document.getElementById(config.id);
    if (element) {
      element.style.backgroundImage = `url('${config.image}')`;
      element.style.backgroundSize = 'cover';
      element.style.backgroundPosition = 'center';
    }
  });
  updateViewer360Carousel();
}

function moveViewer360Carousel(direction) {
  const totalSlides = viewer360Config.length;
  viewer360CarouselIndex += direction;
  
  if (viewer360CarouselIndex >= totalSlides) {
    viewer360CarouselIndex = 0;
  } else if (viewer360CarouselIndex < 0) {
    viewer360CarouselIndex = totalSlides - 1;
  }
  
  updateViewer360Carousel();
}

function setViewer360Carousel(index) {
  viewer360CarouselIndex = index;
  updateViewer360Carousel();
}

function updateViewer360Carousel() {
  const track = document.getElementById('viewer360CarouselTrack');
  const dots = document.querySelectorAll('.viewer-360-carousel-dot');
  
  const offset = -(viewer360CarouselIndex * 100);
  track.style.transform = `translateX(${offset}%)`;
  
  dots.forEach((dot, index) => {
    if (index === viewer360CarouselIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

// Close modal on background click
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('viewer360Modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        close360Modal();
      }
    });
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    close360Modal();
  }
});
