/**
 * COCO CRAFT EXPORTS — CMS FRONTEND BRIDGE
 * Dynamically binds Firestore CMS updates (Products, Copywriting, Company Profile) to the public website,
 * and orchestrates real-time RFQ inquiry transmission with interactive confirmation modal and WhatsApp routing.
 */

import {
  getCollectionItems,
  getWebsiteSection,
  getCompanySettings,
  submitPublicEnquiry
} from './firebase-service.js';

document.addEventListener('DOMContentLoaded', () => {
  initPublicCmsSync();
  initPublicRfqSync();
  initConfirmationModalHandlers();
});

/**
 * 1. Synchronize dynamic CMS content from Firestore into public pages
 */
async function initPublicCmsSync() {
  try {
    // A. Sync Company Profile (Contact info, WhatsApp, Address, Email)
    const companyProfile = await getCompanySettings();
    if (companyProfile) {
      applyCompanyProfile(companyProfile);
    }

    // B. Sync Homepage Content if on Homepage
    const isHomepage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
    if (isHomepage) {
      const homeContent = await getWebsiteSection('homepage');
      if (homeContent) {
        if (homeContent.heroHeading) {
          const heroH1 = document.querySelector('section h1');
          if (heroH1) heroH1.textContent = homeContent.heroHeading;
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

    // C. Sync Dynamic Products if modified or added in Admin Panel
    const isProductsPage = window.location.pathname.includes('/products/');
    if (isProductsPage) {
      const dynamicProducts = await getCollectionItems('products', 'sortOrder', 'asc');
      if (dynamicProducts && dynamicProducts.length > 0) {
        applyDynamicProducts(dynamicProducts);
      }
    }
  } catch (err) {
    // Graceful baseline fallback — site remains 100% operational
    console.debug('CMS Bridge running in fallback baseline mode:', err.message);
  }
}

/**
 * Apply Company Profile overrides across public pages
 */
function applyCompanyProfile(profile) {
  if (!profile) return;

  // Update phone numbers
  if (profile.phone) {
    document.querySelectorAll('[data-company-phone]').forEach(el => {
      el.textContent = profile.phone;
    });
  }

  // Update email
  if (profile.email) {
    document.querySelectorAll('[data-company-email]').forEach(el => {
      el.textContent = profile.email;
      if (el.tagName === 'A') el.href = `mailto:${profile.email}`;
    });
  }

  // Update WhatsApp links
  if (profile.whatsapp) {
    const cleanNumber = profile.whatsapp.replace(/[^0-9]/g, '');
    document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
      el.href = `https://wa.me/${cleanNumber}`;
    });
  }

  // Update address
  if (profile.address) {
    document.querySelectorAll('[data-company-address]').forEach(el => {
      el.textContent = `${profile.address}, ${profile.city || ''} ${profile.pincode || ''}`;
    });
  }
}

/**
 * Apply dynamic product edits or additions from CMS onto products.html
 */
function applyDynamicProducts(products) {
  // Map standard slugs to section IDs
  const slugToIdMap = {
    '5kg-cocopeat-blocks': 'blocks',
    'cocopeat-5kg-blocks': 'blocks',
    'hydroponic-grow-bags': 'grow-bags',
    'grow-bags': 'grow-bags',
    'coconut-husk-chips': 'chips',
    'husk-chips': 'chips',
    '650g-coir-briquettes': 'briquettes',
    'coir-briquettes-650g': 'briquettes',
    'briquettes': 'briquettes',
    'natural-brown-coir-fibre': 'fibre',
    'raw-coir-fibre-bales': 'fibre',
    'coir-fibre': 'fibre',
    'coir-geotextile-netting': 'geotextiles',
    'erosion-control': 'geotextiles'
  };

  const matchedIds = new Set();

  products.forEach(product => {
    const targetId = slugToIdMap[product.slug] || slugToIdMap[product.id] || product.id;
    const section = document.getElementById(targetId);

    if (section) {
      matchedIds.add(targetId);
      // Update Title
      if (product.title) {
        const h2 = section.querySelector('h2');
        if (h2) h2.textContent = product.title;
        section.setAttribute('data-title', product.title);
      }

      // Update Description
      if (product.fullDescription || product.shortDescription) {
        const p = section.querySelector('p.font-body-md');
        if (p) p.textContent = product.fullDescription || product.shortDescription;
      }

      // Update Main Image
      if (product.mainImage) {
        const img = section.querySelector('img');
        if (img && !img.src.includes(product.mainImage)) {
          img.src = product.mainImage;
        }
      }

      // Update specs attribute for search
      if (product.specifications && typeof product.specifications === 'object') {
        const specsText = Object.values(product.specifications).join(' ');
        section.setAttribute('data-specs', specsText);
      }
    }
  });
}

/**
 * 2. Transmit public RFQ inquiries directly to Firestore & present Confirmation Modal
 */
function initPublicRfqSync() {
  const forms = [
    {
      form: document.getElementById('rfq-quote-form'),
      type: 'Homepage Bulk RFQ',
      successBanner: document.getElementById('quote-success-banner'),
      refIdElem: document.getElementById('quote-ref-id')
    },
    {
      form: document.getElementById('contact-rfq-form'),
      type: 'Pro-Forma Container Requisition',
      successBanner: document.getElementById('form-success-banner'),
      refIdElem: document.getElementById('contact-ref-id')
    }
  ];

  forms.forEach(({ form, type, successBanner, refIdElem }) => {
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // HTML5 Validation
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          TRANSMITTING REQUISITION TO EXPORT DESK...
        `;
      }

      const payload = {
        type,
        name: form.querySelector('[name="name"], #quote-name, #contact-name')?.value.trim() || '',
        email: form.querySelector('[name="email"], #quote-email, #contact-email')?.value.trim() || '',
        company: form.querySelector('[name="company"], #contact-company')?.value.trim() || '',
        destinationPort: form.querySelector('[name="destination_port"], [name="port"], #quote-port, #contact-port')?.value.trim() || '',
        substrate: form.querySelector('[name="substrate"], [name="product"], #contact-substrate')?.value || '',
        volume: form.querySelector('[name="volume"], #contact-volume')?.value || '1 x 40HC Container',
        incoterm: form.querySelector('[name="incoterm"]:checked')?.value || 'FOB',
        message: form.querySelector('[name="message"], [name="notes"], #contact-notes')?.value.trim() || ''
      };

      let referenceId = `CCE-REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      try {
        const res = await submitPublicEnquiry(payload);
        if (res && res.success && res.referenceId) {
          referenceId = res.referenceId;
        } else {
          // Backup offline storage queue
          saveOfflineEnquiry(payload, referenceId);
        }
      } catch (err) {
        console.warn('Network sync fallback, queued locally:', err.message);
        saveOfflineEnquiry(payload, referenceId);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }

      // Populate & open the Submission Confirmation Modal
      showConfirmationModal(payload, referenceId);

      // Also reveal inline success banner if modal is dismissed or on smaller screens
      if (refIdElem) {
        refIdElem.textContent = referenceId;
      }
      if (successBanner) {
        form.style.display = 'none';
        successBanner.classList.remove('hidden');
        successBanner.classList.add('flex');
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Reset form fields
      form.reset();
    });
  });
}

/**
 * Save offline inquiry to localStorage queue
 */
function saveOfflineEnquiry(payload, referenceId) {
  try {
    const queue = JSON.parse(localStorage.getItem('cce_offline_enquiries') || '[]');
    queue.push({ ...payload, referenceId, queuedAt: new Date().toISOString() });
    localStorage.setItem('cce_offline_enquiries', JSON.stringify(queue));
  } catch (e) {
    console.debug('LocalStorage offline save skipped');
  }
}

/**
 * Display the Requisition Confirmation Modal Popup
 */
function showConfirmationModal(payload, referenceId) {
  const modal = document.getElementById('rfq-confirmation-modal');
  if (!modal) return;

  const refElem = document.getElementById('modal-ref-id');
  const nameElem = document.getElementById('modal-summary-name');
  const compElem = document.getElementById('modal-summary-company');
  const substrateElem = document.getElementById('modal-summary-substrate');
  const portElem = document.getElementById('modal-summary-port');
  const waLink = document.getElementById('modal-whatsapp-link');

  if (refElem) refElem.textContent = referenceId;
  if (nameElem) nameElem.textContent = payload.name || 'Commercial Client';
  if (compElem) compElem.textContent = payload.company || 'Direct Commercial Buyer';
  if (substrateElem) substrateElem.textContent = `${payload.substrate || '5KG Blocks'} · ${payload.volume || '1x40HC'}`;
  if (portElem) portElem.textContent = `${payload.destinationPort || 'Global Port'} (${payload.incoterm || 'FOB India'})`;

  if (waLink) {
    const textMsg = `Hello Coco Craft Exports, I have submitted an export requisition [Ref: ${referenceId}] for ${payload.substrate || 'Cocopeat Substrates'} (${payload.volume || '1x40HC'}) to ${payload.destinationPort || 'our seaport'}. Please confirm receipt.`;
    waLink.href = `https://wa.me/919488012345?text=${encodeURIComponent(textMsg)}`;
  }

  // Open modal
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

/**
 * Setup modal close, backdrop click, and copy reference ID listeners
 */
function initConfirmationModalHandlers() {
  const modal = document.getElementById('rfq-confirmation-modal');
  if (!modal) return;

  const closeBtn = document.getElementById('close-confirmation-modal-btn');
  const doneBtn = document.getElementById('modal-done-btn');
  const copyBtn = document.getElementById('copy-ref-btn');

  const closeModal = () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  };

  if (closeBtn) closeBtn.onclick = closeModal;
  if (doneBtn) doneBtn.onclick = closeModal;

  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Copy reference code to clipboard
  if (copyBtn) {
    copyBtn.onclick = () => {
      const refElem = document.getElementById('modal-ref-id');
      if (!refElem) return;
      const text = refElem.textContent.trim();
      navigator.clipboard.writeText(text).then(() => {
        const icon = copyBtn.querySelector('.material-symbols-outlined');
        if (icon) {
          icon.textContent = 'check';
          setTimeout(() => {
            icon.textContent = 'content_copy';
          }, 2000);
        }
      }).catch(() => {
        console.warn('Clipboard write permission denied');
      });
    };
  }
}
