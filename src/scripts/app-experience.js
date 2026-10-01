/**
 * COCO CRAFT EXPORTS — Master Experience Engine
 * Awwwards-inspired Smooth Scrolling, Viewport Reveals, Magnetic Interactions,
 * Ambient Cursor Glow, and Kinetic Metrics.
 */

import Lenis from 'lenis';

document.addEventListener('DOMContentLoaded', () => {
  initLenisSmoothScroll();
  initScrollProgressBar();
  initAmbientCursorGlow();
  initViewportReveals();
  initMetricCounters();
  init3DTiltCards();
  initMagneticButtons();
  initGlobalHeaderScroll();
  initMobileNavDrawer();
  initSmoothAnchorScrolling();
});

/* ==========================================================================
   1. LENIS MOMENTUM SMOOTH SCROLLING
   ========================================================================== */
let lenisInstance = null;

function initLenisSmoothScroll() {
  // Check if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.scrollBehavior = 'smooth';
    return;
  }

  try {
    lenisInstance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth exponential ease-out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      infinite: false,
    });

    window.lenis = lenisInstance;

    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync with native scroll events for progress bar
    lenisInstance.on('scroll', (e) => {
      updateProgressBar(e.progress);
    });
  } catch (err) {
    console.warn('Lenis smooth scroll fallback to native smooth:', err);
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
        entry.target.classList.add('is-revealed');
        // If it's a stagger container, stagger children
        if (entry.target.classList.contains('reveal-stagger')) {
          const children = entry.target.querySelectorAll('.stagger-item');
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('is-revealed');
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
   9. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileNavDrawer() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = menu.classList.contains('hidden');
    if (isHidden) {
      menu.classList.remove('hidden');
      menu.classList.add('flex', 'animate-fade-in-down');
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = 'close';
    } else {
      menu.classList.add('hidden');
      menu.classList.remove('flex', 'animate-fade-in-down');
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = 'menu';
    }
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target) && !menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
      menu.classList.remove('flex');
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = 'menu';
    }
  });
}

/* ==========================================================================
   10. SMOOTH ANCHOR SCROLLING (Lenis Compatible)
   ========================================================================== */
function initSmoothAnchorScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        if (lenisInstance) {
          lenisInstance.scrollTo(targetEl, { offset: -90 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

export { lenisInstance };
