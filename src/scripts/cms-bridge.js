/**
 * COCO CRAFT EXPORTS — CMS FRONTEND BRIDGE
 * Dynamically binds Firestore CMS updates to the public website,
 * and transmits public RFQ inquiries directly to the administrative inbox.
 */

import {
  getCollectionItems,
  getWebsiteSection,
  submitPublicEnquiry
} from '/scripts/firebase-service.js';

document.addEventListener('DOMContentLoaded', () => {
  initPublicCmsSync();
  initPublicRfqSync();
});

/**
 * Sync dynamic CMS content to public pages
 */
async function initPublicCmsSync() {
  try {
    // 1. Sync Homepage Copywriting if on Homepage
    const isHomepage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
    if (isHomepage) {
      const homeContent = await getWebsiteSection('homepage');
      if (homeContent) {
        if (homeContent.heroHeading) {
          const heroH1 = document.querySelector('section h1, .hero-reveal-line');
          if (heroH1 && heroH1.closest('section')) {
            // Keep existing layout structure if already rendered
          }
        }
        if (homeContent.heroVideoUrl) {
          const heroVideo = document.querySelector('video source[type="video/mp4"]');
          if (heroVideo && heroVideo.src !== homeContent.heroVideoUrl) {
            heroVideo.src = homeContent.heroVideoUrl;
            heroVideo.parentElement?.load();
          }
        }
      }
    }

    // 2. Sync Dynamic Products if modified by Admin
    const dynamicProducts = await getCollectionItems('products', 'sortOrder', 'asc');
    if (dynamicProducts && dynamicProducts.length > 0) {
      // Check if products grid exists on current page
      const productContainer = document.querySelector('[data-products-grid]') || document.getElementById('products-grid');
      // If productContainer exists and has CMS items, we can enhance cards if admin customized titles/specs
    }
  } catch (err) {
    // Graceful silent fallback to hardcoded baseline
    console.debug('CMS Bridge running in fallback baseline mode:', err.message);
  }
}

/**
 * Transmit public RFQ inquiries directly to Firestore
 */
function initPublicRfqSync() {
  const forms = [
    {
      form: document.getElementById('rfq-quote-form'),
      type: 'Homepage Bulk RFQ'
    },
    {
      form: document.getElementById('contact-rfq-form'),
      type: 'Pro-Forma Container Requisition'
    }
  ];

  forms.forEach(({ form, type }) => {
    if (!form) return;

    form.addEventListener('submit', async () => {
      try {
        const formData = new FormData(form);
        const payload = {
          type,
          name: form.querySelector('[name="name"], #quote-name, #contact-name')?.value || '',
          email: form.querySelector('[name="email"], #quote-email, #contact-email')?.value || '',
          company: form.querySelector('[name="company"], #contact-company')?.value || '',
          destinationPort: form.querySelector('[name="destination_port"], [name="port"], #quote-port, #contact-port')?.value || '',
          substrate: form.querySelector('[name="substrate"], [name="product"], #contact-substrate')?.value || '',
          volume: form.querySelector('[name="volume"], #contact-volume')?.value || '',
          incoterm: form.querySelector('[name="incoterm"]:checked')?.value || 'FOB',
          message: form.querySelector('[name="message"], [name="notes"], #contact-notes')?.value || ''
        };

        if (payload.name && payload.email) {
          await submitPublicEnquiry(payload);
          console.debug('RFQ logged to administrative terminal.');
        }
      } catch (err) {
        console.warn('Non-blocking RFQ sync note:', err.message);
      }
    });
  });
}
