/**
 * COCO CRAFT EXPORTS — Master Experience Engine
 * Awwwards-inspired Smooth Scrolling, Viewport Reveals, Magnetic Interactions,
 * Ambient Cursor Glow, and Kinetic Metrics.
 */

import Lenis from 'lenis';

let lenisInstance = null;

function safeInit(fnName, fn) {
  try {
    if (typeof fn === 'function') fn();
  } catch (err) {
    console.warn(`[AppExperience] ${fnName} non-fatal warning:`, err);
  }
}

function bootMasterExperience() {
  safeInit('LenisSmoothScroll', initLenisSmoothScroll);
  safeInit('ScrollProgressBar', initScrollProgressBar);
  safeInit('AmbientCursorGlow', initAmbientCursorGlow);
  safeInit('ViewportReveals', initViewportReveals);
  safeInit('MetricCounters', initMetricCounters);
  safeInit('3DTiltCards', init3DTiltCards);
  safeInit('MagneticButtons', initMagneticButtons);
  safeInit('GlobalHeaderScroll', initGlobalHeaderScroll);
  safeInit('MobileNavDrawer', initMobileNavDrawer);
  safeInit('SmoothAnchorScrolling', initSmoothAnchorScrolling);
  safeInit('ProductFilterAndSearch', initProductFilterAndSearch);
  safeInit('RFQForms', initRFQForms);
  safeInit('WalkthroughVideoModal', initWalkthroughVideoModal);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootMasterExperience);
} else {
  bootMasterExperience();
}

function initSmoothAnchorScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      try {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          if (window.lenis && typeof window.lenis.scrollTo === 'function') {
            window.lenis.scrollTo(target, { offset: -80 });
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      } catch (err) {
        // Ignore invalid CSS selector
      }
    });
  });
}

/* ==========================================================================
   1. LENIS MOMENTUM SMOOTH SCROLLING
   ========================================================================== */
function initLenisSmoothScroll() {
  // Check if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.scrollBehavior = 'smooth';
    return;
  }

  try {
    const instance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth exponential ease-out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisInstance = instance;
    window.lenis = instance;

    function raf(time) {
      if (lenisInstance) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
    }
    requestAnimationFrame(raf);

    // Sync with native scroll events for progress bar
    lenisInstance.on('scroll', (e) => {
      updateProgressBar(e.progress);
    });
  } catch (err) {
    console.warn('Lenis smooth scroll fallback to native smooth:', err);
    if (lenisInstance && typeof lenisInstance.destroy === 'function') {
      lenisInstance.destroy();
    }
    lenisInstance = null;
    window.lenis = null;
    document.documentElement.style.scrollBehavior = 'smooth';
    window.addEventListener('scroll', () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalScroll > 0 ? window.scrollY / totalScroll : 0;
      updateProgressBar(progress);
    }, { passive: true });
  }
}

/* ==========================================================================
   2. KINETIC SCROLL PROGRESS BAR
   ========================================================================== */
function initScrollProgressBar() {
  if (document.getElementById('scroll-progress-bar')) return;
  const bar = document.createElement('div');
  bar.id = 'scroll-progress-bar';
  bar.setAttribute('aria-hidden', 'true');
  document.body.prepend(bar);
}

function updateProgressBar(progress) {
  const bar = document.getElementById('scroll-progress-bar');
  if (bar) {
    bar.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
  }
}

/* ==========================================================================
   3. AWWWARDS AMBIENT CURSOR GLOW (Desktop Fine Pointers)
   ========================================================================== */
function initAmbientCursorGlow() {
  // Only enable on desktop pointer devices
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (document.querySelector('.ambient-cursor-glow')) return;

  const glow = document.createElement('div');
  glow.className = 'ambient-cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.appendChild(glow);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  let isVisible = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      glow.style.opacity = '1';
      isVisible = true;
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
    isVisible = false;
  });

  function renderGlow() {
    // Smooth lerp follow
    currentX += (mouseX - currentX) * 0.14;
    currentY += (mouseY - currentY) * 0.14;
    glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    requestAnimationFrame(renderGlow);
  }
  requestAnimationFrame(renderGlow);

  // Scale glow over interactive elements
  const interactives = 'a, button, input, select, textarea, .tilt-card, .gallery-card, .crop-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactives)) {
      glow.classList.add('cursor-expanded');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactives)) {
      glow.classList.remove('cursor-expanded');
    }
  });
}

/* ==========================================================================
   4. STAGGERED VIEWPORT REVEALS (IntersectionObserver)
   ========================================================================== */
function initViewportReveals() {
  const revealElements = document.querySelectorAll(
    '.reveal-on-scroll, .reveal-fade, .reveal-scale, .reveal-left, .reveal-right, .reveal-stagger'
  );

  if (!revealElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.1,
  };

  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed', 'is-visible');
        // If it's a stagger container, stagger children
        if (entry.target.classList.contains('reveal-stagger')) {
          const children = entry.target.querySelectorAll('.stagger-item');
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('is-revealed', 'is-visible');
            }, index * 90);
          });
        }
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => {
    revealObserver.observe(el);
  });
}

/* ==========================================================================
   5. METRIC COUNTERS ANIMATION
   ========================================================================== */
function initMetricCounters() {
  const counters = document.querySelectorAll('[data-counter-target]');
  if (!counters.length) return;

  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  counters.forEach((c) => counterObserver.observe(c));
}

function animateCounter(el) {
  const targetStr = el.getAttribute('data-counter-target');
  const target = parseFloat(targetStr.replace(/[^0-9.]/g, ''));
  const prefix = el.getAttribute('data-counter-prefix') || '';
  const suffix = el.getAttribute('data-counter-suffix') || '';
  const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
  const duration = parseInt(el.getAttribute('data-counter-duration') || '1800', 10);

  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    // Ease-out cubic
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentVal = easeOut * target;

    const formatted = decimals > 0 
      ? currentVal.toFixed(decimals) 
      : Math.floor(currentVal).toLocaleString();

    el.textContent = `${prefix}${formatted}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      const finalFormatted = decimals > 0 ? target.toFixed(decimals) : target.toLocaleString();
      el.textContent = `${prefix}${finalFormatted}${suffix}`;
    }
  }

  requestAnimationFrame(step);
}

/* ==========================================================================
   6. 3D TILT CARDS & SPECULAR HIGHLIGHT
   ========================================================================== */
function init3DTiltCards() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5.5; // Max 5.5deg
      const rotateY = ((x - centerX) / centerX) * 5.5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;
      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease-out';
    });
  });
}

/* ==========================================================================
   7. MAGNETIC BUTTONS
   ========================================================================== */
function initMagneticButtons() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const magneticBtns = document.querySelectorAll('.magnetic-btn');
  magneticBtns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      btn.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
      btn.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.1s ease-out';
    });
  });
}

/* ==========================================================================
   8. GLOBAL HEADER SCROLL & ACTIVE PAGE HIGHLIGHT
   ========================================================================== */
function initGlobalHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active page indicator highlight
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('header nav a');
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (
      (currentPath === '/' && (href === '/' || href === '/index.html')) ||
      (currentPath !== '/' && href !== '/' && currentPath.includes(href.replace('.html', '')))
    ) {
      link.classList.add('nav-active');
    }
  });
}

/* ==========================================================================
   9. MOBILE & TABLET NAVIGATION DRAWER
   ========================================================================== */
function initMobileNavDrawer() {
  const btn = document.getElementById('mobile-menu-btn') || document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu') || document.getElementById('mobile-menu-drawer');
  if (!btn || !menu) return;

  btn.setAttribute('type', 'button');
  btn.setAttribute('aria-expanded', 'false');

  let isOpen = false;

  const openDrawer = () => {
    isOpen = true;
    menu.classList.add('is-open');
    menu.classList.remove('hidden');
    document.body.classList.add('mobile-drawer-open');
    btn.setAttribute('aria-expanded', 'true');
    if (window.lenis && typeof window.lenis.stop === 'function') {
      window.lenis.stop();
    }
    const icon = btn.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = 'close';
  };

  const closeDrawer = () => {
    isOpen = false;
    menu.classList.remove('is-open');
    menu.classList.add('hidden');
    document.body.classList.remove('mobile-drawer-open');
    btn.setAttribute('aria-expanded', 'false');
    if (window.lenis && typeof window.lenis.start === 'function') {
      window.lenis.start();
    }
    const icon = btn.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = 'menu';
  };

  const toggleDrawer = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  // Direct onclick handler prevents duplicate event listener conflicts
  btn.onclick = toggleDrawer;

  // Close when tapping any link inside the mobile drawer
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Close when tapping outside the menu
  document.addEventListener('click', (e) => {
    if (isOpen && !menu.contains(e.target) && !btn.contains(e.target)) {
      closeDrawer();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeDrawer();
    }
  });
}

/* ==========================================================================
   11. CLIENT-SIDE PRODUCT FILTERS & REAL-TIME SEARCH
   ========================================================================== */
function initProductFilterAndSearch() {
  const filterBtns = document.querySelectorAll('.product-filter-btn');
  const searchInput = document.getElementById('product-search-input');
  const clearBtn = document.getElementById('product-search-clear');
  const cards = document.querySelectorAll('.product-card-item');
  const emptyState = document.getElementById('product-empty-state');
  const resetBtn = document.getElementById('product-reset-filter-btn');
  const resultsCount = document.getElementById('product-results-count');

  if (!filterBtns.length && !cards.length) return;

  let activeCategory = 'all';
  let searchQuery = '';

  function applyFilters() {
    let visibleCount = 0;

    cards.forEach((card) => {
      const cardCategory = card.getAttribute('data-category') || '';
      const cardTitle = (card.getAttribute('data-title') || '').toLowerCase();
      const cardSpecs = (card.getAttribute('data-specs') || '').toLowerCase();
      const cardText = card.textContent.toLowerCase();

      const categoryMatch = activeCategory === 'all' || cardCategory.toLowerCase().includes(activeCategory.toLowerCase());
      const searchMatch = !searchQuery || cardTitle.includes(searchQuery) || cardSpecs.includes(searchQuery) || cardText.includes(searchQuery);

      if (categoryMatch && searchMatch) {
        card.classList.remove('is-hidden');
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        visibleCount++;
      } else {
        card.classList.add('is-hidden');
        card.style.opacity = '0';
        card.style.transform = 'translateY(6px)';
      }
    });

    if (resultsCount) {
      resultsCount.textContent = `Showing ${visibleCount} Product${visibleCount === 1 ? '' : 's'}`;
    }

    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
      } else {
        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
      }
    }
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.remove('active', 'bg-primary', 'text-on-primary', 'font-bold');
        b.classList.add('bg-surface', 'text-on-surface-variant', 'font-medium');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active', 'bg-primary', 'text-on-primary', 'font-bold');
      btn.classList.remove('bg-surface', 'text-on-surface-variant', 'font-medium');
      btn.setAttribute('aria-selected', 'true');
      activeCategory = btn.getAttribute('data-category') || 'all';
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (clearBtn) {
        if (searchQuery.length > 0) {
          clearBtn.classList.remove('hidden');
        } else {
          clearBtn.classList.add('hidden');
        }
      }
      applyFilters();
    });
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearBtn.classList.add('hidden');
      applyFilters();
      searchInput.focus();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeCategory = 'all';
      searchQuery = '';
      if (searchInput) {
        searchInput.value = '';
      }
      if (clearBtn) {
        clearBtn.classList.add('hidden');
      }
      filterBtns.forEach((b) => {
        const cat = b.getAttribute('data-category');
        if (cat === 'all') {
          b.classList.add('active', 'bg-primary', 'text-on-primary', 'font-bold');
          b.classList.remove('bg-surface', 'text-on-surface-variant', 'font-medium');
          b.setAttribute('aria-selected', 'true');
        } else {
          b.classList.remove('active', 'bg-primary', 'text-on-primary', 'font-bold');
          b.classList.add('bg-surface', 'text-on-surface-variant', 'font-medium');
          b.setAttribute('aria-selected', 'false');
        }
      });
      applyFilters();
    });
  }
}

/* ==========================================================================
   12. RFQ / B2B QUOTE FORM ORCHESTRATION & VALIDATION
   (Actual submission lifecycle, Firestore syncing, and Confirmation Modal 
   are handled reliably by /scripts/cms-bridge.js)
   ========================================================================== */
function initRFQForms() {
  const forms = [
    {
      form: document.getElementById('rfq-quote-form'),
      successBanner: document.getElementById('quote-success-banner'),
      resetBtn: document.getElementById('quote-reset-btn')
    },
    {
      form: document.getElementById('contact-rfq-form'),
      successBanner: document.getElementById('form-success-banner'),
      resetBtn: document.getElementById('contact-reset-btn')
    }
  ];

  forms.forEach(({ form, successBanner, resetBtn }) => {
    if (!form) return;

    if (resetBtn && successBanner) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        form.style.display = '';
        successBanner.classList.add('hidden');
        successBanner.classList.remove('flex');
      });
    }
  });
}

/* ==========================================================================
   13. CINEMATIC WALKTHROUGH VIDEO MODAL
   ========================================================================== */
function initWalkthroughVideoModal() {
  const playBtn = document.getElementById('play-walkthrough-btn');
  if (!playBtn) return;

  // Create modal container if not exists
  let modal = document.getElementById('walkthrough-video-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'walkthrough-video-modal';
    modal.className = 'fixed inset-0 z-50 hidden items-center justify-center media-modal-backdrop p-4 sm:p-6';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Facility Walkthrough Video');
    modal.innerHTML = `
      <div class="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20">
        <button id="close-video-modal-btn" class="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-secondary" aria-label="Close video player">
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
        <div class="relative w-full aspect-video bg-neutral-900 flex items-center justify-center">
          <video 
            id="modal-walkthrough-video" 
            class="w-full h-full object-cover" 
            controls 
            autoplay 
            playsinline 
            poster="/assets/gallery/pallet-shipping.jpg"
            preload="metadata">
            <source src="https://res.cloudinary.com/demo/video/upload/q_auto,f_auto,vc_h264/cococraft_manufacturing_cinematic.mp4" type="video/mp4" />
            <p class="text-white text-xs p-4">Your browser does not support HTML5 video.</p>
          </video>
        </div>
        <div class="p-4 bg-primary text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-technical-code text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-secondary-fixed"></span>
            <span class="font-bold">POLLACHI PROCESSING FACILITY · TAMIL NADU</span>
          </div>
          <span class="text-surface-variant">40ft High Cube Container Preparation</span>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const closeBtn = document.getElementById('close-video-modal-btn');
  const videoEl = document.getElementById('modal-walkthrough-video');

  const openModal = () => {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('mobile-drawer-open');
    if (window.lenis && typeof window.lenis.stop === 'function') {
      window.lenis.stop();
    }
    if (videoEl) {
      videoEl.play().catch(() => {});
    }
    if (closeBtn) closeBtn.focus();
  };

  const closeModal = () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.classList.remove('mobile-drawer-open');
    if (window.lenis && typeof window.lenis.start === 'function') {
      window.lenis.start();
    }
    if (videoEl) {
      videoEl.pause();
    }
    playBtn.focus();
  };

  playBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

export { lenisInstance };
