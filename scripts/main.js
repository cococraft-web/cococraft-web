/**
 * COCO CRAFT EXPORTS — Master Client-Side Controller
 * Pure Vanilla JavaScript — High Performance, Zero Framework Overhead
 */

import { siteConfig, products, applications, manufacturingSteps, sustainabilityPillars, galleryItems } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  renderProducts();
  renderApplications();
  renderProcessTimeline();
  renderSustainability();
  renderGallery();
  initGalleryFilterAndLightbox();
  initVideoPlayer();
  initQuoteForm();
  initScrollAnimations();
});

/* ==========================================================================
   1. STICKY HEADER & SCROLL BEHAVIOR
   ========================================================================== */
function initHeader() {
  const header = document.getElementById('main-header');
  const headerLogoImg = document.getElementById('header-logo-img');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
      // Logo stays ultra-crisp
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   2. MOBILE NAVIGATION
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu-drawer');
  const closeBtn = document.getElementById('mobile-menu-close');
  const menuLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !mobileMenu) return;

  const openMenu = () => {
    mobileMenu.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    mobileMenu.classList.add('hidden');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* ==========================================================================
   3. PRODUCT CAPABILITIES RENDERER (Asymmetric 2-Column + Wide Feature)
   ========================================================================== */
function renderProducts() {
  const container = document.getElementById('products-grid-container');
  if (!container) return;

  let html = '';

  // Render first two in 2-column grid
  html += '<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">';
  products.slice(0, 2).forEach((prod, index) => {
    html += `
      <article class="bg-white rounded-xl border border-soft overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group">
        <div class="h-64 sm:h-72 overflow-hidden relative bg-neutral-100">
          <img 
            src="${prod.image}" 
            alt="${prod.name}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            loading="lazy"
          />
          <span class="absolute top-4 left-4 bg-coco-brown text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
            ${prod.category}
          </span>
        </div>
        <div class="p-6 sm:p-8 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-xl sm:text-2xl font-bold text-text-primary mb-2 group-hover:text-natural-green transition-colors">
              ${prod.name}
            </h3>
            <p class="text-text-muted text-sm sm:text-base leading-relaxed mb-6">
              ${prod.shortDesc}
            </p>
            <div class="bg-warm-canvas rounded-lg p-4 mb-6 border border-soft">
              <h4 class="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Technical Specifications</h4>
              <ul class="space-y-1.5 text-xs text-text-primary">
                ${prod.specs.map(spec => `
                  <li class="flex justify-between border-b border-soft pb-1">
                    <span class="text-text-muted">${spec.label}:</span>
                    <span class="font-semibold text-right">${spec.value}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
          <div class="flex items-center justify-between pt-4 border-t border-soft">
            <span class="text-xs text-text-muted">Standard Export Packaging</span>
            <a href="#contact" class="inline-flex items-center gap-1.5 text-sm font-bold text-natural-green hover:text-coco-brown transition-colors">
              REQUEST SPEC SHEET →
            </a>
          </div>
        </div>
      </article>
    `;
  });
  html += '</div>';

  // Render 3rd product as a Wide Format Banner Card
  if (products[2]) {
    const prod = products[2];
    html += `
      <article class="bg-white rounded-xl border border-soft overflow-hidden hover:shadow-lg transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group">
        <div class="lg:col-span-5 h-64 lg:h-auto overflow-hidden relative bg-neutral-100">
          <img 
            src="${prod.image}" 
            alt="${prod.name}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            loading="lazy"
          />
          <span class="absolute top-4 left-4 bg-coco-brown text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
            ${prod.category}
          </span>
        </div>
        <div class="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h3 class="text-xl sm:text-2xl font-bold text-text-primary mb-2 group-hover:text-natural-green transition-colors">
              ${prod.name}
            </h3>
            <p class="text-text-muted text-sm sm:text-base leading-relaxed mb-6">
              ${prod.shortDesc}
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-warm-canvas rounded-lg p-4 mb-6 border border-soft">
              ${prod.specs.map(spec => `
                <div class="border-b sm:border-b-0 sm:border-r border-soft pb-2 sm:pb-0 sm:pr-2 last:border-none">
                  <span class="block text-xs text-text-muted mb-0.5">${spec.label}</span>
                  <span class="text-xs font-semibold text-text-primary">${spec.value}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-soft">
            <span class="text-xs text-text-muted">Applications: ${prod.applications.join(', ')}</span>
            <a href="#contact" class="btn-primary text-xs py-2.5 px-5">
              REQUEST TECHNICAL QUOTE →
            </a>
          </div>
        </div>
      </article>
    `;
  }

  container.innerHTML = html;
}

/* ==========================================================================
   4. APPLICATIONS GRID RENDERER
   ========================================================================== */
function renderApplications() {
  const container = document.getElementById('applications-grid-container');
  if (!container) return;

  container.innerHTML = applications.map(app => `
    <div class="bg-white rounded-xl border border-soft overflow-hidden hover:shadow-md transition-all duration-300 group flex flex-col">
      <div class="h-48 overflow-hidden relative">
        <img 
          src="${app.image}" 
          alt="${app.title}" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          loading="lazy"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <span class="absolute bottom-3 left-3 text-white text-xs font-medium tracking-wide">
          ${app.subtitle}
        </span>
      </div>
      <div class="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 class="text-lg font-bold text-text-primary mb-2 group-hover:text-natural-green transition-colors">
            ${app.title}
          </h3>
          <p class="text-text-muted text-xs sm:text-sm leading-relaxed mb-4">
            ${app.desc}
          </p>
        </div>
        <div class="pt-3 border-t border-soft flex items-center justify-between">
          <span class="text-[11px] font-mono text-fibre-beige uppercase tracking-wider font-semibold">
            ${app.status}
          </span>
          <span class="text-xs font-bold text-natural-green group-hover:translate-x-1 transition-transform">
            Inquire →
          </span>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   5. NEUTRAL PROCESS TIMELINE RENDERER
   ========================================================================== */
function renderProcessTimeline() {
  const container = document.getElementById('process-timeline-container');
  if (!container) return;

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative">
      ${manufacturingSteps.map((step, idx) => `
        <div class="bg-white rounded-xl border border-soft p-6 flex flex-col justify-between relative hover:border-natural-green transition-colors group">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-3xl font-extrabold text-coco-brown/40 group-hover:text-natural-green transition-colors font-mono">
                ${step.step}
              </span>
              <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-warm-canvas text-text-muted">
                ${step.tag}
              </span>
            </div>
            <h3 class="text-base font-bold text-text-primary mb-1">
              ${step.title}
            </h3>
            <p class="text-xs font-semibold text-natural-green mb-3">
              ${step.subtitle}
            </p>
            <p class="text-xs text-text-muted leading-relaxed">
              ${step.desc}
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-soft flex items-center text-[11px] text-text-subtle font-mono">
            <span>Stage ${idx + 1} of 6</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ==========================================================================
   6. SUSTAINABILITY PILLARS RENDERER (Deep Green #075B2A)
   ========================================================================== */
function renderSustainability() {
  const container = document.getElementById('sustainability-pillars-container');
  if (!container) return;

  container.innerHTML = sustainabilityPillars.map(pillar => `
    <div class="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-colors duration-300">
      <span class="text-3xl font-extrabold text-fibre-beige font-mono mb-4 block">
        ${pillar.num}
      </span>
      <h3 class="text-lg font-bold text-white mb-3 tracking-wide">
        ${pillar.title}
      </h3>
      <p class="text-sm text-neutral-300 leading-relaxed">
        ${pillar.desc}
      </p>
    </div>
  `).join('');
}

/* ==========================================================================
   7. GALLERY RENDERER & FILTERING
   ========================================================================== */
function renderGallery(filter = 'all') {
  const container = document.getElementById('gallery-grid-container');
  if (!container) return;

  const items = filter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === filter);

  container.innerHTML = items.map(item => `
    <div 
      class="gallery-item cursor-pointer group relative rounded-xl overflow-hidden border border-soft h-64 sm:h-72 bg-neutral-100" 
      data-category="${item.category}" 
      data-img="${item.image}"
      data-title="${item.title}"
      data-desc="${item.desc}"
    >
      <img 
        src="${item.image}" 
        alt="${item.title}" 
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
        <span class="text-[11px] font-bold uppercase tracking-widest text-fibre-beige mb-1 font-mono">
          ${item.category}
        </span>
        <h4 class="text-base font-bold text-white mb-1">
          ${item.title}
        </h4>
        <p class="text-xs text-neutral-300 line-clamp-2">
          ${item.desc}
        </p>
      </div>
    </div>
  `).join('');

  attachLightboxEvents();
}

function initGalleryFilterAndLightbox() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-natural-green', 'text-white');
        b.classList.add('bg-white', 'text-text-primary');
      });
      btn.classList.remove('bg-white', 'text-text-primary');
      btn.classList.add('bg-natural-green', 'text-white');

      const filter = btn.getAttribute('data-filter') || 'all';
      renderGallery(filter);
    });
  });

  // Lightbox Modal Setup
  const modal = document.getElementById('lightbox-modal');
  const closeBtn = document.getElementById('lightbox-close');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        modal.classList.remove('active');
      }
    });
  }
}

function attachLightboxEvents() {
  const items = document.querySelectorAll('.gallery-item');
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const modalTitle = document.getElementById('lightbox-title');
  const modalDesc = document.getElementById('lightbox-desc');

  if (!modal || !modalImg) return;

  items.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-img');
      const title = item.getAttribute('data-title');
      const desc = item.getAttribute('data-desc');

      modalImg.src = src;
      if (modalTitle) modalTitle.textContent = title;
      if (modalDesc) modalDesc.textContent = desc;

      modal.classList.add('active');
    });
  });
}

/* ==========================================================================
   8. VIDEO PLAYER CONTROLS
   ========================================================================== */
function initVideoPlayer() {
  const video = document.getElementById('production-video');
  const playBtn = document.getElementById('video-play-btn');
  const muteBtn = document.getElementById('video-mute-btn');
  const playIcon = document.getElementById('video-play-icon');

  if (!video || !playBtn) return;

  playBtn.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      if (playIcon) playIcon.innerHTML = '❚❚';
    } else {
      video.pause();
      if (playIcon) playIcon.innerHTML = '▶';
    }
  });

  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
    });
  }
}

/* ==========================================================================
   9. REQUEST A QUOTE (RFQ) FORM CONTROLLER
   ========================================================================== */
function initQuoteForm() {
  const form = document.getElementById('rfq-form');
  const statusMsg = document.getElementById('rfq-status-message');
  const whatsappLink = document.getElementById('whatsapp-direct-link');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Loading State
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      PROCESSING ENQUIRY...
    `;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      if (statusMsg) {
        statusMsg.classList.remove('hidden');
        statusMsg.innerHTML = `
          <div class="bg-natural-green/20 border border-natural-green text-white p-4 rounded-lg text-sm flex items-start gap-3">
            <span class="text-xl">✓</span>
            <div>
              <p class="font-bold">Enquiry Registered Successfully</p>
              <p class="text-xs text-neutral-200 mt-0.5">Thank you for your inquiry with COCO CRAFT EXPORTS. Our international trade team will review your specifications and respond promptly.</p>
            </div>
          </div>
        `;
      }

      form.reset();
    }, 1200);
  });

  // Optional: Build dynamic WhatsApp inquiry link
  if (whatsappLink) {
    whatsappLink.addEventListener('click', (e) => {
      const phoneInput = form.querySelector('input[name="phone"]')?.value || '';
      const productSelect = form.querySelector('select[name="product"]')?.value || 'General Inquiry';
      const msg = encodeURIComponent(`Hello COCO CRAFT EXPORTS Team, I would like to enquire about export pricing for: ${productSelect}.`);
      whatsappLink.href = `https://wa.me/910000000000?text=${msg}`;
    });
  }
}

/* ==========================================================================
   10. SCROLL REVEAL OBSERVER
   ========================================================================== */
function initScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0');
        entry.target.classList.remove('opacity-0', 'translate-y-6');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-6');
    observer.observe(el);
  });
}
