/**
 * COCO CRAFT EXPORTS — MASTER ADMIN CMS CONTROLLER
 * Full administrative lifecycle for Authentication, Real-time Catalogue CRUD, Media, RFQ Inbox, Content, SEO, and Audit Trail.
 */

import {
  adminLogin,
  adminLogout,
  watchAuthState,
  getCollectionItems,
  getDocumentById,
  saveDocument,
  deleteDocument,
  updateEnquiryStatus,
  getWebsiteSection,
  saveWebsiteSection,
  getSeoMetadata,
  saveSeoMetadata,
  getCompanySettings,
  saveCompanySettings,
  getCloudinarySettings,
  saveCloudinarySettings,
  getAuditLogs,
  seedBaselineCatalogueIfEmpty,
  uploadToFirebaseStorage,
  deleteFromFirebaseStorage
} from '/scripts/firebase-service.js';

import { uploadToCloudinary } from '/scripts/cloudinary-service.js';

/* ==========================================================================
   GLOBAL ADMIN STATE
   ========================================================================== */
const state = {
  currentUser: null,
  activeSection: 'dashboard',
  products: [],
  categories: [],
  media: [],
  videos: [],
  gallery: [],
  manufacturing: [],
  applications: [],
  sustainability: [],
  globalReach: [],
  quality: [],
  certifications: [],
  enquiries: [],
  activeEnquiryFilter: 'all',
  activeMediaTab: 'all',
  searchQuery: ''
};

/* ==========================================================================
   TOAST & MODAL HELPERS
   ========================================================================== */
export function showToast(message, type = 'success') {
  const container = document.getElementById('admin-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-[#00742F] text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-primary text-white';
  const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';

  toast.className = `admin-toast px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-mono font-bold ${bgClass}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-base">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

export function showConfirmModal(title, description, onConfirm) {
  const modal = document.getElementById('confirm-modal');
  const titleEl = document.getElementById('confirm-modal-title');
  const descEl = document.getElementById('confirm-modal-desc');
  const acceptBtn = document.getElementById('confirm-accept-btn');
  const cancelBtn = document.getElementById('confirm-cancel-btn');

  titleEl.textContent = title;
  descEl.textContent = description;

  modal.classList.remove('hidden');

  const cleanup = () => {
    modal.classList.add('hidden');
    acceptBtn.onclick = null;
    cancelBtn.onclick = null;
  };

  cancelBtn.onclick = cleanup;
  acceptBtn.onclick = async () => {
    cleanup();
    await onConfirm();
  };
}

/* ==========================================================================
   INITIALIZATION & AUTHENTICATION LIFECYCLE
   ========================================================================== */
function bootstrapAdmin() {
  initAuth();
  initNavigation();
  initSidebarDrawer();
  initProductController();
  initMediaController();
  initWebsiteContentController();
  initEnquiriesController();
  initSeoController();
  initSettingsController();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapAdmin);
} else {
  bootstrapAdmin();
}

function initAuth() {
  const authView = document.getElementById('auth-view');
  const appView = document.getElementById('app-view');
  const loginForm = document.getElementById('admin-login-form');
  const errorBanner = document.getElementById('auth-error-banner');
  const errorText = document.getElementById('auth-error-text');
  const submitBtn = document.getElementById('login-submit-btn');
  const btnText = document.getElementById('login-btn-text');
  const userDisplay = document.getElementById('admin-user-display');
  const logoutBtn = document.getElementById('admin-logout-btn');

  // Watch Auth State
  watchAuthState((user) => {
    state.currentUser = user;
    if (user) {
      authView.classList.add('hidden');
      appView.classList.remove('hidden');
      if (userDisplay) {
        userDisplay.textContent = user.email || 'Admin User';
      }
      loadAllCMSData();
    } else {
      authView.classList.remove('hidden');
      appView.classList.add('hidden');
    }
  });

  // Handle Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBanner.classList.add('hidden');

      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const remember = document.getElementById('login-remember').checked;

      submitBtn.disabled = true;
      btnText.textContent = 'AUTHENTICATING...';

      const res = await adminLogin(email, password, remember);

      submitBtn.disabled = false;
      btnText.textContent = 'ACCESS DASHBOARD';

      if (!res.success) {
        errorBanner.classList.remove('hidden');
        errorText.textContent = res.error || 'Authentication failed.';
      } else {
        showToast('Administrative session established.', 'success');
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await adminLogout();
      showToast('Signed out of administrative terminal.', 'info');
    });
  }
}

/* ==========================================================================
   NAVIGATION & MOBILE DRAWER
   ========================================================================== */
function initNavigation() {
  const navButtons = document.querySelectorAll('.sidebar-item');
  const breadcrumb = document.getElementById('header-breadcrumb');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-section');
      if (!section) return;

      switchSection(section);
      closeMobileSidebar();
    });
  });

  // Handle section switch triggers inside dashboard cards
  document.querySelectorAll('[data-switch-to]').forEach(el => {
    el.addEventListener('click', () => {
      const target = el.getAttribute('data-switch-to');
      if (target) switchSection(target);
    });
  });
}

function switchSection(sectionId) {
  state.activeSection = sectionId;

  // Update sidebar active classes
  document.querySelectorAll('.sidebar-item').forEach(btn => {
    if (btn.getAttribute('data-section') === sectionId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Hide all sections, show target section
  document.querySelectorAll('.cms-section').forEach(sec => {
    sec.classList.add('hidden');
  });

  const targetSec = document.getElementById(`section-${sectionId}`);
  if (targetSec) {
    targetSec.classList.remove('hidden');
  }

  // Update Breadcrumb
  const breadcrumb = document.getElementById('header-breadcrumb');
  if (breadcrumb) {
    breadcrumb.textContent = sectionId.replace('-', ' ').toUpperCase();
  }

  // Refresh relevant section data if needed
  if (sectionId === 'audit') {
    renderAuditLogs();
  }
}

function initSidebarDrawer() {
  const sidebar = document.getElementById('admin-sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const closeBtn = document.getElementById('sidebar-close-btn');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.remove('-translate-x-full');
      backdrop.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  }

  const close = () => {
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar && backdrop && window.innerWidth < 1280) {
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   DATA LOADER (ALL CMS DATA)
   ========================================================================== */
async function loadAllCMSData() {
  try {
    // 1. Products & Categories
    state.products = await getCollectionItems('products', 'sortOrder', 'asc');
    state.categories = await getCollectionItems('categories', 'sortOrder', 'asc');

    // 2. Media & Videos & Gallery
    state.media = await getCollectionItems('media', 'createdAtIso', 'desc');
    state.videos = await getCollectionItems('videos', 'sortOrder', 'asc');
    state.gallery = await getCollectionItems('gallery', 'sortOrder', 'asc');

    // 3. Manufacturing & Applications & ESG
    state.manufacturing = await getCollectionItems('manufacturing', 'sortOrder', 'asc');
    state.applications = await getCollectionItems('applications', 'sortOrder', 'asc');
    state.sustainability = await getCollectionItems('sustainability', 'sortOrder', 'asc');
    state.globalReach = await getCollectionItems('global_reach', 'sortOrder', 'asc');
    state.quality = await getCollectionItems('quality', 'sortOrder', 'asc');
    state.certifications = await getCollectionItems('certifications', 'sortOrder', 'asc');

    // 4. Enquiries
    state.enquiries = await getCollectionItems('enquiries', 'submittedAtIso', 'desc');

    // Render Views
    renderDashboardStats();
    renderProductsTable();
    renderCategoriesGrid();
    renderMediaGrid();
    renderVideosGrid();
    renderGalleryGrid();
    renderManufacturingList();
    renderApplicationsGrid();
    renderSustainabilityGrid();
    renderGlobalReachGrid();
    renderQualityGrid();
    renderCertificationsGrid();
    renderEnquiriesTable();

    // 5. Page Content, SEO & Settings
    await loadWebsiteContentData();
    await loadSeoData();
    await loadSettingsData();
  } catch (err) {
    console.error('Failed to load CMS data:', err);
    showToast('Failed to load some data. Running with cached values.', 'error');
  }
}

/* ==========================================================================
   SECTION CONTROLLERS
   ========================================================================== */

// 1. DASHBOARD
function renderDashboardStats() {
  const totalProds = document.getElementById('stat-total-products');
  const activeProds = document.getElementById('stat-active-products');
  const galleryImgs = document.getElementById('stat-gallery-images');
  const videosCount = document.getElementById('stat-videos');
  const pendingEnquiries = document.getElementById('stat-pending-enquiries');
  const totalEnquiries = document.getElementById('stat-total-enquiries');
  const sidebarBadge = document.getElementById('sidebar-enquiry-badge');

  const activeCount = state.products.filter(p => p.status === 'Active').length;
  const pendingCount = state.enquiries.filter(e => e.status === 'New').length;

  if (totalProds) totalProds.textContent = state.products.length;
  if (activeProds) activeProds.textContent = activeCount;
  if (galleryImgs) galleryImgs.textContent = state.gallery.length || 12;
  if (videosCount) videosCount.textContent = state.videos.length || 2;
  if (pendingEnquiries) pendingEnquiries.textContent = pendingCount;
  if (totalEnquiries) totalEnquiries.textContent = state.enquiries.length;

  if (sidebarBadge) {
    if (pendingCount > 0) {
      sidebarBadge.textContent = pendingCount;
      sidebarBadge.classList.remove('hidden');
    } else {
      sidebarBadge.classList.add('hidden');
    }
  }

  // Dashboard Recent Enquiries Table
  const recentEnquiriesEl = document.getElementById('dashboard-recent-enquiries');
  if (recentEnquiriesEl) {
    if (state.enquiries.length === 0) {
      recentEnquiriesEl.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-on-surface-variant font-mono">No procurement enquiries received yet.</td></tr>`;
    } else {
      recentEnquiriesEl.innerHTML = state.enquiries.slice(0, 5).map(e => `
        <tr class="hover:bg-surface-container-low transition-colors">
          <td class="py-2.5 px-3 font-mono text-[11px] text-on-surface-variant">${e.submittedAtIso ? e.submittedAtIso.substring(0, 10) : 'Recent'}</td>
          <td class="py-2.5 px-3 font-bold text-primary">${escapeHtml(e.name)} <span class="text-on-surface-variant font-normal">(${escapeHtml(e.company || 'Direct')})</span></td>
          <td class="py-2.5 px-3">${escapeHtml(e.substrate || 'Standard')}</td>
          <td class="py-2.5 px-3 font-mono">${escapeHtml(e.destinationPort || 'Not specified')}</td>
          <td class="py-2.5 px-3"><span class="badge-status badge-${(e.status || 'new').toLowerCase().replace(' ', '-')}">${escapeHtml(e.status || 'New')}</span></td>
        </tr>
      `).join('');
    }
  }

  // Dashboard Featured Products
  const featuredEl = document.getElementById('dashboard-featured-products');
  if (featuredEl) {
    const featured = state.products.filter(p => p.featured || p.status === 'Active').slice(0, 4);
    if (featured.length === 0) {
      featuredEl.innerHTML = `<p class="text-xs text-on-surface-variant font-mono">No featured products.</p>`;
    } else {
      featuredEl.innerHTML = featured.map(p => `
        <div class="p-3 rounded-xl bg-surface-container-low border border-surface-variant flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img src="${p.mainImage || '/assets/products/5kg-block.jpg'}" alt="${p.title}" class="w-10 h-10 rounded-lg object-cover bg-white" />
            <div class="flex flex-col">
              <span class="font-bold text-xs text-primary truncate max-w-[150px]">${escapeHtml(p.title)}</span>
              <span class="text-[10px] text-on-surface-variant font-mono">${escapeHtml(p.category)}</span>
            </div>
          </div>
          <span class="badge-status badge-active">ACTIVE</span>
        </div>
      `).join('');
    }
  }
}

// 2. PRODUCTS CONTROLLER
function initProductController() {
  const addBtn = document.getElementById('add-product-btn');
  const modal = document.getElementById('product-modal');
  const closeBtn = document.getElementById('close-product-modal');
  const cancelBtn = document.getElementById('cancel-product-btn');
  const form = document.getElementById('product-form');
  const searchInput = document.getElementById('products-search-input');
  const categoryFilter = document.getElementById('products-category-filter');

  if (addBtn) {
    addBtn.addEventListener('click', () => openProductModal(null));
  }

  const closeModal = () => modal.classList.add('hidden');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleSaveProduct();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase();
      renderProductsTable();
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      renderProductsTable(e.target.value);
    });
  }
}

function openProductModal(product = null) {
  const modal = document.getElementById('product-modal');
  const titleEl = document.getElementById('product-modal-title');
  const categorySelect = document.getElementById('prod-category');

  // Populate Categories Dropdown
  const categories = state.categories.length > 0 ? state.categories : [
    { name: 'Cocopeat Blocks' },
    { name: 'Coir Grow Bags' },
    { name: 'Husk Chips' },
    { name: 'Coir Briquettes' },
    { name: 'Coir Fiber' }
  ];

  categorySelect.innerHTML = categories.map(c => `
    <option value="${c.name}">${c.name}</option>
  `).join('');

  if (product) {
    titleEl.textContent = 'Edit Product: ' + product.title;
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('prod-name').value = product.title || '';
    document.getElementById('prod-slug').value = product.slug || '';
    document.getElementById('prod-category').value = product.category || categories[0]?.name;
    document.getElementById('prod-status').value = product.status || 'Active';
    document.getElementById('prod-short-desc').value = product.shortDescription || '';
    document.getElementById('prod-full-desc').value = product.fullDescription || '';
    document.getElementById('prod-main-image').value = product.mainImage || '';
    document.getElementById('prod-sort').value = product.sortOrder || 1;
    document.getElementById('prod-featured').checked = !!product.featured;

    // Specs
    const specs = product.specifications || {};
    document.getElementById('spec-weight').value = specs.blockWeight || specs.weight || '';
    document.getElementById('spec-expansion').value = specs.expansionVolume || '';
    document.getElementById('spec-ec').value = specs.electricalConductivity || specs.ec || '';
    document.getElementById('spec-ph').value = specs.phRange || specs.ph || '';
    document.getElementById('spec-moisture').value = specs.moistureLevel || specs.moisture || '';
    document.getElementById('spec-packaging').value = specs.packaging || '';
  } else {
    titleEl.textContent = 'Add New Export Product';
    document.getElementById('product-form').reset();
    document.getElementById('edit-product-id').value = '';
    document.getElementById('prod-sort').value = state.products.length + 1;
  }

  modal.classList.remove('hidden');
}

async function handleSaveProduct() {
  const id = document.getElementById('edit-product-id').value;
  const isNew = !id;

  const productData = {
    title: document.getElementById('prod-name').value.trim(),
    slug: document.getElementById('prod-slug').value.trim(),
    category: document.getElementById('prod-category').value,
    status: document.getElementById('prod-status').value,
    shortDescription: document.getElementById('prod-short-desc').value.trim(),
    fullDescription: document.getElementById('prod-full-desc').value.trim(),
    mainImage: document.getElementById('prod-main-image').value.trim(),
    sortOrder: parseInt(document.getElementById('prod-sort').value, 10) || 1,
    featured: document.getElementById('prod-featured').checked,
    specifications: {}
  };

  // Optional Specs — Zero default assumption
  const weight = document.getElementById('spec-weight').value.trim();
  const expansion = document.getElementById('spec-expansion').value.trim();
  const ec = document.getElementById('spec-ec').value.trim();
  const ph = document.getElementById('spec-ph').value.trim();
  const moisture = document.getElementById('spec-moisture').value.trim();
  const packaging = document.getElementById('spec-packaging').value.trim();

  if (weight) productData.specifications.blockWeight = weight;
  if (expansion) productData.specifications.expansionVolume = expansion;
  if (ec) productData.specifications.electricalConductivity = ec;
  if (ph) productData.specifications.phRange = ph;
  if (moisture) productData.specifications.moistureLevel = moisture;
  if (packaging) productData.specifications.packaging = packaging;

  const res = await saveDocument('products', id || null, productData, isNew);
  if (res.success) {
    showToast(`Product ${isNew ? 'created' : 'updated'} successfully.`, 'success');
    document.getElementById('product-modal').classList.add('hidden');
    state.products = await getCollectionItems('products', 'sortOrder', 'asc');
    renderProductsTable();
    renderDashboardStats();
  } else {
    showToast('Failed to save product: ' + res.error, 'error');
  }
}

function renderProductsTable(categoryFilter = 'all') {
  const tbody = document.getElementById('products-table-body');
  const catFilterSelect = document.getElementById('products-category-filter');
  if (!tbody) return;

  // Update Category Filter options
  if (catFilterSelect && catFilterSelect.options.length <= 1) {
    const categories = Array.from(new Set(state.products.map(p => p.category).filter(Boolean)));
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      catFilterSelect.appendChild(opt);
    });
  }

  let filtered = state.products;

  if (categoryFilter !== 'all') {
    filtered = filtered.filter(p => p.category === categoryFilter);
  }

  if (state.searchQuery) {
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(state.searchQuery) ||
      (p.category && p.category.toLowerCase().includes(state.searchQuery)) ||
      (p.shortDescription && p.shortDescription.toLowerCase().includes(state.searchQuery))
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-on-surface-variant font-mono">No products found matching criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(p => `
    <tr class="hover:bg-surface-container-low transition-colors">
      <td class="py-3 px-4">
        <img src="${p.mainImage || '/assets/products/5kg-block.jpg'}" alt="${p.title}" class="w-12 h-12 rounded-lg object-cover bg-white border border-[#E2E6E0]" />
      </td>
      <td class="py-3 px-4">
        <div class="flex flex-col">
          <span class="font-bold text-sm text-primary">${escapeHtml(p.title)}</span>
          <span class="text-[11px] font-mono text-on-surface-variant">/${escapeHtml(p.slug || '')}</span>
        </div>
      </td>
      <td class="py-3 px-4 font-medium">${escapeHtml(p.category || 'General')}</td>
      <td class="py-3 px-4 font-mono">${p.sortOrder || 1}</td>
      <td class="py-3 px-4">
        <span class="badge-status badge-${(p.status || 'Active').toLowerCase()}">${escapeHtml(p.status || 'Active')}</span>
      </td>
      <td class="py-3 px-4 text-right">
        <div class="flex items-center justify-end gap-2">
          <button data-edit-prod="${p.id}" class="p-1.5 rounded-lg border border-surface-variant hover:bg-surface-container text-primary" title="Edit Product">
            <span class="material-symbols-outlined text-base">edit</span>
          </button>
          <button data-delete-prod="${p.id}" class="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50" title="Delete Product">
            <span class="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  // Attach Edit & Delete Listeners
  tbody.querySelectorAll('[data-edit-prod]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-edit-prod');
      const prod = state.products.find(p => p.id === id);
      if (prod) openProductModal(prod);
    });
  });

  tbody.querySelectorAll('[data-delete-prod]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-delete-prod');
      const prod = state.products.find(p => p.id === id);
      if (!prod) return;

      showConfirmModal(
        `Delete Product: ${prod.title}?`,
        'This will permanently remove the product from your catalogue and the public website.',
        async () => {
          const res = await deleteDocument('products', id);
          if (res.success) {
            showToast('Product removed.', 'info');
            state.products = state.products.filter(p => p.id !== id);
            renderProductsTable();
            renderDashboardStats();
          } else {
            showToast('Failed to delete: ' + res.error, 'error');
          }
        }
      );
    });
  });
}

// 3. CATEGORIES CONTROLLER
function renderCategoriesGrid() {
  const grid = document.getElementById('categories-grid');
  if (!grid) return;

  const categories = state.categories.length > 0 ? state.categories : [
    { name: 'Cocopeat Blocks', slug: 'cocopeat-blocks', description: '5kg compressed high expansion substrate blocks', status: 'Active' },
    { name: 'Coir Grow Bags', slug: 'coir-grow-bags', description: 'Commercial greenhouse slab sleeves', status: 'Active' },
    { name: 'Husk Chips', slug: 'husk-chips', description: 'Cubed aeration medium and orchid substrate', status: 'Active' },
    { name: 'Coir Briquettes', slug: 'coir-briquettes', description: '650g consumer retail briquettes', status: 'Active' },
    { name: 'Coir Fiber', slug: 'coir-fiber', description: 'Industrial grade baled mattress and bristle coir fibre', status: 'Active' }
  ];

  grid.innerHTML = categories.map(c => `
    <div class="admin-card p-5 flex flex-col justify-between gap-4">
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <span class="badge-status badge-active">${escapeHtml(c.status || 'Active')}</span>
          <span class="font-mono text-[11px] text-on-surface-variant">/${escapeHtml(c.slug || '')}</span>
        </div>
        <h3 class="font-bold text-base text-primary font-headings mt-1">${escapeHtml(c.name)}</h3>
        <p class="text-xs text-on-surface-variant">${escapeHtml(c.description || 'Standard category description')}</p>
      </div>
      <div class="pt-3 border-t border-[#E2E6E0] flex items-center justify-between text-xs font-mono">
        <span class="text-secondary font-bold">${state.products.filter(p => p.category === c.name).length} Products</span>
      </div>
    </div>
  `).join('');
}

// 4. MEDIA & CLOUDINARY CONTROLLER
function initMediaController() {
  const fileInput = document.getElementById('cloudinary-file-input');
  const dropzone = document.getElementById('media-dropzone');
  const progressBar = document.getElementById('media-progress-bar');
  const progressText = document.getElementById('media-progress-text');
  const progressContainer = document.getElementById('media-upload-progress');

  const handleUpload = async (file) => {
    if (!file) return;

    progressContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    progressText.textContent = 'Uploading 0%...';

    const providerSelect = document.getElementById('media-storage-provider');
    const provider = providerSelect ? providerSelect.value : 'cloudinary';

    try {
      let asset;
      if (provider === 'firebase') {
        asset = await uploadToFirebaseStorage(file, 'Coco/Images', (percent) => {
          progressBar.style.width = percent + '%';
          progressText.textContent = `Uploading to Firebase Storage ${percent}%...`;
        });
        showToast(`Asset "${file.name}" uploaded to Firebase Storage successfully.`, 'success');
      } else {
        asset = await uploadToCloudinary(file, (percent) => {
          progressBar.style.width = percent + '%';
          progressText.textContent = `Uploading to Cloudinary ${percent}%...`;
        });
        showToast(`Asset "${file.name}" uploaded to Cloudinary successfully.`, 'success');
      }

      state.media.unshift(asset);
      renderMediaGrid();
    } catch (err) {
      console.error('Upload Error:', err);
      showToast(err.message, 'error');
    } finally {
      setTimeout(() => {
        progressContainer.classList.add('hidden');
      }, 1000);
    }
  };

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleUpload(file);
      fileInput.value = '';
    });
  }

  if (dropzone) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('border-secondary', 'bg-secondary/5');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('border-secondary', 'bg-secondary/5');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-secondary', 'bg-secondary/5');
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    });

    dropzone.addEventListener('click', (e) => {
      if (e.target !== fileInput) {
        fileInput.click();
      }
    });
  }

  // Filter tabs
  document.querySelectorAll('.media-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.media-tab-btn').forEach(b => {
        b.classList.remove('active', 'bg-primary', 'text-white');
        b.classList.add('text-on-surface-variant');
      });
      btn.classList.add('active', 'bg-primary', 'text-white');
      btn.classList.remove('text-on-surface-variant');

      state.activeMediaTab = btn.getAttribute('data-media-tab');
      renderMediaGrid();
    });
  });
}

function renderMediaGrid() {
  const grid = document.getElementById('media-assets-grid');
  if (!grid) return;

  // Use state.media or fallback local assets
  let items = state.media;
  if (items.length === 0) {
    items = [
      { id: '1', secureUrl: '/assets/products/5kg-block.jpg', resourceType: 'image', originalFilename: '5kg-block.jpg' },
      { id: '2', secureUrl: '/assets/products/grow-bag.jpg', resourceType: 'image', originalFilename: 'grow-bag.jpg' },
      { id: '3', secureUrl: '/assets/gallery/hydraulic-press.jpg', resourceType: 'image', originalFilename: 'hydraulic-press.jpg' },
      { id: '4', secureUrl: '/assets/gallery/drying-yards.jpg', resourceType: 'image', originalFilename: 'drying-yards.jpg' },
      { id: '5', secureUrl: '/assets/gallery/trommel-screen.jpg', resourceType: 'image', originalFilename: 'trommel-screen.jpg' },
      { id: '6', secureUrl: '/assets/gallery/container-loading.jpg', resourceType: 'image', originalFilename: 'container-loading.jpg' }
    ];
  }

  if (state.activeMediaTab !== 'all') {
    items = items.filter(m => m.resourceType === state.activeMediaTab);
  }

  grid.innerHTML = items.map(m => `
    <div class="admin-card overflow-hidden group flex flex-col">
      <div class="relative h-32 bg-surface-dim overflow-hidden flex items-center justify-center">
        ${m.resourceType === 'video' ? `
          <video src="${m.secureUrl}" class="w-full h-full object-cover" muted></video>
          <span class="absolute top-2 right-2 p-1 rounded bg-black/60 text-white font-mono text-[9px] uppercase">VIDEO</span>
        ` : `
          <img src="${m.secureUrl}" alt="${m.originalFilename || 'Media asset'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        `}
      </div>
      <div class="p-2.5 flex items-center justify-between text-xs">
        <span class="truncate font-mono text-[10px] text-primary" title="${m.secureUrl}">${escapeHtml(m.originalFilename || 'Asset')}</span>
        <button data-copy-url="${m.secureUrl}" class="p-1 rounded text-on-surface-variant hover:text-secondary hover:bg-surface-container" title="Copy Secure URL">
          <span class="material-symbols-outlined text-sm">content_copy</span>
        </button>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('[data-copy-url]').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-copy-url');
      navigator.clipboard.writeText(url);
      showToast('Asset URL copied to clipboard.', 'success');
    });
  });
}

// 5. VIDEOS CONTROLLER
function renderVideosGrid() {
  const grid = document.getElementById('videos-grid');
  if (!grid) return;

  const videos = state.videos.length > 0 ? state.videos : [
    {
      id: 'v1',
      title: 'Facility & Compaction Hero Video',
      type: 'Hero Video',
      secureUrl: 'https://res.cloudinary.com/ddu0x7j5c/video/upload/v1738743900/cococraft/hero-compaction-720p.mp4',
      posterUrl: '/assets/gallery/hydraulic-press.jpg',
      isActive: true
    },
    {
      id: 'v2',
      title: 'Pollachi Factory Walkthrough',
      type: 'Manufacturing Video',
      secureUrl: 'https://res.cloudinary.com/ddu0x7j5c/video/upload/v1738743900/cococraft/walkthrough-factory.mp4',
      posterUrl: '/assets/gallery/drying-yards.jpg',
      isActive: true
    }
  ];

  grid.innerHTML = videos.map(v => `
    <div class="admin-card p-5 flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <span class="badge-status badge-active">${escapeHtml(v.type || 'Video')}</span>
        <span class="text-xs font-mono text-secondary font-bold">STREAM READY</span>
      </div>
      <h3 class="font-bold text-sm text-primary font-headings">${escapeHtml(v.title)}</h3>
      <div class="relative h-40 rounded-xl overflow-hidden bg-black flex items-center justify-center">
        <video src="${v.secureUrl}" poster="${v.posterUrl || ''}" controls class="w-full h-full object-cover"></video>
      </div>
      <div class="pt-2 border-t border-[#E2E6E0] flex items-center justify-between text-xs font-mono">
        <button data-copy-url="${v.secureUrl}" class="text-secondary hover:underline flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">link</span> Copy URL
        </button>
      </div>
    </div>
  `).join('');
}

// 6. GALLERY CONTROLLER
function renderGalleryGrid() {
  const grid = document.getElementById('gallery-items-grid');
  if (!grid) return;

  const items = state.gallery.length > 0 ? state.gallery : [
    { title: '150,000 Sq.Ft Concrete Drying Aprons', category: 'Plant & Yards', image: '/assets/gallery/drying-yards.jpg', status: 'Published' },
    { title: '120-Ton Hydraulic Compaction Lines', category: 'Processing & Machinery', image: '/assets/gallery/hydraulic-press.jpg', status: 'Published' },
    { title: '5KG Block Palletization & Shrink Wrap', category: 'Products & Substrates', image: '/assets/gallery/pallet-shipping.jpg', status: 'Published' },
    { title: 'Commercial Hydroponic Grow Bag Slabs', category: 'Products & Substrates', image: '/assets/gallery/growbag-slabs.jpg', status: 'Published' },
    { title: 'Automated Trommel Separation Screen', category: 'Processing & Machinery', image: '/assets/gallery/trommel-screen.jpg', status: 'Published' },
    { title: '40\' High Cube Ocean Container Stuffing', category: 'Packing & Shipping', image: '/assets/gallery/container-loading.jpg', status: 'Published' }
  ];

  grid.innerHTML = items.map(g => `
    <div class="admin-card overflow-hidden flex flex-col">
      <div class="relative h-48 bg-surface-dim overflow-hidden">
        <img src="${g.image}" alt="${g.title}" class="w-full h-full object-cover" />
        <span class="absolute top-3 left-3 px-2 py-0.5 rounded bg-primary text-white font-mono text-[10px] uppercase font-bold">${escapeHtml(g.category)}</span>
      </div>
      <div class="p-4 flex flex-col gap-1.5">
        <h4 class="font-bold text-sm text-primary font-headings">${escapeHtml(g.title)}</h4>
        <span class="badge-status badge-active w-fit">PUBLISHED</span>
      </div>
    </div>
  `).join('');
}

// 7. WEBSITE CONTENT CONTROLLER
function initWebsiteContentController() {
  const saveBtn = document.getElementById('save-website-content-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const payload = {
        heroEyebrow: document.getElementById('content-hero-eyebrow')?.value || '',
        heroHeading: document.getElementById('content-hero-heading')?.value || '',
        heroDescription: document.getElementById('content-hero-description')?.value || '',
        heroCtaPrimary: document.getElementById('content-hero-cta1')?.value || '',
        heroCtaSecondary: document.getElementById('content-hero-cta2')?.value || '',
        heroVideoUrl: document.getElementById('content-hero-video')?.value || '',
        heroPosterUrl: document.getElementById('content-hero-poster')?.value || ''
      };

      const res = await saveWebsiteSection('homepage', payload);
      if (res.success) {
        showToast('Homepage content saved and live on public site.', 'success');
      } else {
        showToast('Failed to save website content: ' + res.error, 'error');
      }
    });
  }
}

export async function loadWebsiteContentData() {
  if (!state.currentUser) return;
  const content = await getWebsiteSection('homepage');
  if (content) {
    if (document.getElementById('content-hero-eyebrow')) document.getElementById('content-hero-eyebrow').value = content.heroEyebrow || 'TAMIL NADU EXPORT FACILITY';
    if (document.getElementById('content-hero-heading')) document.getElementById('content-hero-heading').value = content.heroHeading || 'ENGINEERED COCONUT SUBSTRATES FOR COMMERCIAL GROWERS';
    if (document.getElementById('content-hero-description')) document.getElementById('content-hero-description').value = content.heroDescription || 'Direct producer of washed, buffered, and standard coir pith blocks, grow bags, and husk chips exported globally from Tuticorin Port.';
    if (document.getElementById('content-hero-cta1')) document.getElementById('content-hero-cta1').value = content.heroCtaPrimary || 'EXPLORE CATALOGUE';
    if (document.getElementById('content-hero-cta2')) document.getElementById('content-hero-cta2').value = content.heroCtaSecondary || 'REQUEST BULK QUOTE';
    if (document.getElementById('content-hero-video')) document.getElementById('content-hero-video').value = content.heroVideoUrl || 'https://res.cloudinary.com/ddu0x7j5c/video/upload/v1738743900/cococraft/hero-compaction-720p.mp4';
    if (document.getElementById('content-hero-poster')) document.getElementById('content-hero-poster').value = content.heroPosterUrl || '/assets/gallery/hydraulic-press.jpg';
  }
}

// 8. MANUFACTURING PROCESS CONTROLLER
function renderManufacturingList() {
  const list = document.getElementById('manufacturing-stages-list');
  if (!list) return;

  const stages = state.manufacturing.length > 0 ? state.manufacturing : [
    { stage: 1, title: 'Raw Husk Sourcing & Decortication', description: 'Fresh coconut husks aged 30–45 days and separated into long bristle fibre and raw coir pith.', image: '/assets/gallery/drying-yards.jpg' },
    { stage: 2, title: 'Washing & Desalting (EC Reduction)', description: 'Multiple freshwater washes with continuous testing to lower Electrical Conductivity below 0.5 mS/cm.', image: '/assets/gallery/drying-yards.jpg' },
    { stage: 3, title: 'Concrete Solar Drying Aprons', description: 'Spreading coir evenly on certified concrete drying yards to reach target moisture without soil contamination.', image: '/assets/gallery/drying-yards.jpg' },
    { stage: 4, title: 'Rotary Trommel Sieving & De-Dusting', description: 'Dual cylindrical screens removing fine coir dust (< 1mm) and unwanted debris.', image: '/assets/gallery/trommel-screen.jpg' },
    { stage: 5, title: '120-Ton Hydraulic Compaction', description: 'Automated 5:1 volume reduction into standardized 5kg blocks, briquettes, and growbag slabs.', image: '/assets/gallery/hydraulic-press.jpg' },
    { stage: 6, title: 'Palletization & Container Stuffing', description: 'ISPM-15 heat-treated pallets wrapped in high-tension stretch film and direct gated into Tuticorin port.', image: '/assets/gallery/container-loading.jpg' }
  ];

  list.innerHTML = stages.map(s => `
    <div class="admin-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <span class="w-10 h-10 rounded-xl bg-primary text-secondary-fixed flex items-center justify-center font-mono font-bold text-sm shrink-0">
          0${s.stage}
        </span>
        <div class="flex flex-col">
          <h4 class="font-bold text-sm text-primary font-headings">${escapeHtml(s.title)}</h4>
          <p class="text-xs text-on-surface-variant max-w-xl">${escapeHtml(s.description)}</p>
        </div>
      </div>
      <span class="badge-status badge-active shrink-0">ACTIVE STAGE</span>
    </div>
  `).join('');
}

// 9. APPLICATIONS CONTROLLER
function renderApplicationsGrid() {
  const grid = document.getElementById('applications-grid');
  if (!grid) return;

  const apps = [
    { title: 'Commercial Greenhouses', desc: 'Slab grow bags for tomatoes, cucumbers, peppers, and soft fruit growers.' },
    { title: 'Berry Cultivation', desc: 'High-drainage coir blends for blueberries, strawberries, and raspberries.' },
    { title: 'Commercial Potting Soils', desc: 'Peat moss alternative substrate for European and US nursery distributors.' },
    { title: 'Orchid & Anthurium Nurseries', desc: 'Chunky husk chips delivering exceptional aeration and air-filled porosity.' }
  ];

  grid.innerHTML = apps.map(a => `
    <div class="admin-card p-5 flex flex-col justify-between gap-3">
      <div>
        <h4 class="font-bold text-sm text-primary font-headings">${escapeHtml(a.title)}</h4>
        <p class="text-xs text-on-surface-variant mt-1">${escapeHtml(a.desc)}</p>
      </div>
      <span class="badge-status badge-active w-fit">ACTIVE APPLICATION</span>
    </div>
  `).join('');
}

// 10. SUSTAINABILITY CONTROLLER
function renderSustainabilityGrid() {
  const grid = document.getElementById('sustainability-pillars-grid');
  if (!grid) return;

  const pillars = [
    { title: '100% Organic Agricultural Byproduct', desc: 'Repurposing coir pith from coconut husks, preventing agrarian field burning.' },
    { title: 'Peat Moss Bog Conservation', desc: 'Sustainable, renewable alternative protecting fragile ancient peatland ecosystems.' },
    { title: 'Clean Solar Drying Yards', desc: 'Harnessing Tamil Nadu solar radiation to naturally dry substrates without fossil fuel dryers.' },
    { title: 'Circular Wastewater Treatment', desc: 'Settling ponds and recycled river water used throughout the desalting wash sequence.' }
  ];

  grid.innerHTML = pillars.map(p => `
    <div class="admin-card p-5 flex flex-col justify-between gap-3">
      <div>
        <h4 class="font-bold text-sm text-primary font-headings">${escapeHtml(p.title)}</h4>
        <p class="text-xs text-on-surface-variant mt-1">${escapeHtml(p.desc)}</p>
      </div>
      <span class="badge-status badge-active w-fit">VERIFIED PILLAR</span>
    </div>
  `).join('');
}

// 11. GLOBAL REACH CONTROLLER
function renderGlobalReachGrid() {
  const grid = document.getElementById('global-destinations-grid');
  if (!grid) return;

  const destinations = [
    { country: 'Germany 🇩🇪', port: 'Port of Hamburg / Port of Bremerhaven', desc: 'Confirmed European export market. Direct containerized supply of low EC cocopeat blocks, grow bags, and husk chips.', badge: 'CONFIRMED MARKET', badgeClass: 'bg-[#00742F] text-white' },
    { country: 'Worldwide B2B Trade', port: 'Tuticorin & Chennai Ports (Global)', desc: 'Direct ocean freight connectivity to verified commercial growers, importers, and agricultural distributors worldwide.', badge: 'GLOBAL EXPORT', badgeClass: 'badge-active' }
  ];

  grid.innerHTML = destinations.map(d => `
    <div class="admin-card p-5 flex flex-col justify-between gap-3">
      <div>
        <span class="font-mono text-[10px] text-secondary font-bold uppercase">${escapeHtml(d.port)}</span>
        <h4 class="font-bold text-base text-primary font-headings mt-0.5">${escapeHtml(d.country)}</h4>
        <p class="text-xs text-on-surface-variant mt-1">${escapeHtml(d.desc)}</p>
      </div>
      <span class="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold w-fit ${d.badgeClass}">${d.badge}</span>
    </div>
  `).join('');
}

// 12. QUALITY ASSURANCE CONTROLLER
function renderQualityGrid() {
  const grid = document.getElementById('quality-stages-grid');
  if (!grid) return;

  const checks = [
    { title: 'EC & Salinity Laboratory Titration', param: '< 0.5 mS/cm', desc: 'Daily batch conductivity measurements using 1:1.5 volume extraction.' },
    { title: 'pH Balance Verification', param: '5.8 to 6.8', desc: 'Calibrated laboratory glass-electrode probes testing each drying lot.' },
    { title: 'Moisture Curing Control', param: '< 18%', desc: 'Halogen moisture analyzers ensuring optimal weight-to-volume ratio.' },
    { title: 'Sieve & Particle Mesh Fractionation', param: '6mm Trommel', desc: 'Air Filled Porosity (AFP) testing and fine dust separation check.' }
  ];

  grid.innerHTML = checks.map(c => `
    <div class="admin-card p-5 flex flex-col justify-between gap-3">
      <div>
        <div class="flex items-center justify-between">
          <span class="font-mono text-xs text-secondary font-bold">${escapeHtml(c.param)}</span>
          <span class="badge-status badge-active">PASS</span>
        </div>
        <h4 class="font-bold text-sm text-primary font-headings mt-1">${escapeHtml(c.title)}</h4>
        <p class="text-xs text-on-surface-variant mt-1">${escapeHtml(c.desc)}</p>
      </div>
    </div>
  `).join('');
}

// 13. CERTIFICATIONS CONTROLLER
function renderCertificationsGrid() {
  const grid = document.getElementById('certifications-grid');
  if (!grid) return;

  const certs = [
    { name: 'Phytosanitary Certification', issuer: 'Ministry of Agriculture, India (Plant Quarantine Directorate)', num: 'PQ-IND-2026-CC', status: 'Compliant' },
    { name: 'ISPM-15 Heat Treated Palletization', issuer: 'Certified Fumigation & Heat Treatment Facility', num: 'HT-ISPM15-VOC', status: 'Active' },
    { name: 'Certificate of Origin', issuer: 'Coir Board & Chamber of Commerce, Tamil Nadu', num: 'COO-TN-COIR-2026', status: 'Active' }
  ];

  grid.innerHTML = certs.map(c => `
    <div class="admin-card p-5 flex flex-col justify-between gap-3">
      <div>
        <span class="font-mono text-[10px] text-on-surface-variant uppercase">${escapeHtml(c.issuer)}</span>
        <h4 class="font-bold text-sm text-primary font-headings mt-0.5">${escapeHtml(c.name)}</h4>
        <span class="font-mono text-[11px] text-secondary font-bold mt-1 block">REG: ${escapeHtml(c.num)}</span>
      </div>
      <span class="badge-status badge-active w-fit">${escapeHtml(c.status)}</span>
    </div>
  `).join('');
}

// 14. ENQUIRIES / RFQ CONTROLLER
function initEnquiriesController() {
  const filterSelect = document.getElementById('enquiry-filter-status');
  const modal = document.getElementById('enquiry-modal');
  const closeBtn = document.getElementById('close-enquiry-modal');
  const saveStatusBtn = document.getElementById('save-enquiry-status-btn');

  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      state.activeEnquiryFilter = e.target.value;
      renderEnquiriesTable();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  }

  if (saveStatusBtn) {
    saveStatusBtn.addEventListener('click', async () => {
      const id = document.getElementById('modal-enquiry-id').value;
      const status = document.getElementById('modal-enquiry-status').value;
      const note = document.getElementById('modal-enquiry-notes').value.trim();

      const res = await updateEnquiryStatus(id, status, note);
      if (res.success) {
        showToast('Enquiry status updated.', 'success');
        modal.classList.add('hidden');
        // Refresh local state
        const item = state.enquiries.find(e => e.id === id);
        if (item) {
          item.status = status;
          item.internalNotes = note;
        }
        renderEnquiriesTable();
        renderDashboardStats();
      } else {
        showToast('Failed to update enquiry: ' + res.error, 'error');
      }
    });
  }
}

function renderEnquiriesTable() {
  const tbody = document.getElementById('enquiries-table-body');
  if (!tbody) return;

  let filtered = state.enquiries;
  if (state.activeEnquiryFilter !== 'all') {
    filtered = filtered.filter(e => e.status === state.activeEnquiryFilter);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-on-surface-variant font-mono">No procurement enquiries found for selected filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(e => `
    <tr class="hover:bg-surface-container-low transition-colors">
      <td class="py-3 px-4 font-mono font-bold text-secondary">${escapeHtml(e.referenceId || 'CCE-REQ')}</td>
      <td class="py-3 px-4 font-bold text-primary">${escapeHtml(e.name)}</td>
      <td class="py-3 px-4 text-on-surface-variant">${escapeHtml(e.email)}</td>
      <td class="py-3 px-4">${escapeHtml(e.substrate || 'Standard')}</td>
      <td class="py-3 px-4 font-mono">${escapeHtml(e.destinationPort || 'Direct')}</td>
      <td class="py-3 px-4">
        <span class="badge-status badge-${(e.status || 'new').toLowerCase().replace(' ', '-')}">${escapeHtml(e.status || 'New')}</span>
      </td>
      <td class="py-3 px-4 text-right">
        <button data-review-enquiry="${e.id}" class="px-3 py-1.5 rounded-lg border border-surface-variant hover:bg-surface-container text-xs font-mono font-bold text-primary">
          Process RFQ →
        </button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-review-enquiry]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-review-enquiry');
      const item = state.enquiries.find(e => e.id === id);
      if (item) openEnquiryModal(item);
    });
  });
}

function openEnquiryModal(enquiry) {
  const modal = document.getElementById('enquiry-modal');
  document.getElementById('modal-enquiry-id').value = enquiry.id;
  document.getElementById('enquiry-modal-ref').textContent = enquiry.referenceId || 'CCE-REQ-2026';
  document.getElementById('modal-enquiry-name').textContent = enquiry.name || 'Direct Buyer';
  document.getElementById('modal-enquiry-email').textContent = enquiry.email || '';
  document.getElementById('modal-enquiry-email').href = `mailto:${enquiry.email}`;
  document.getElementById('modal-enquiry-company').textContent = enquiry.company || 'Not specified';
  document.getElementById('modal-enquiry-port').textContent = enquiry.destinationPort || 'Not specified';
  document.getElementById('modal-enquiry-substrate').textContent = enquiry.substrate || 'Not specified';
  document.getElementById('modal-enquiry-volume').textContent = enquiry.volume || '1 x 40 HC Container';
  document.getElementById('modal-enquiry-message').textContent = enquiry.message || 'No additional notes provided by buyer.';
  document.getElementById('modal-enquiry-status').value = enquiry.status || 'New';
  document.getElementById('modal-enquiry-notes').value = enquiry.internalNotes || '';

  modal.classList.remove('hidden');
}

// ==============================================================================
// 15. GLOBAL B2B SEO MANAGEMENT SYSTEM CONTROLLER
// ==============================================================================

const SEO_PAGE_BASELINES = {
  home: {
    name: 'Homepage',
    path: '/',
    title: 'Coconut Coir Manufacturer & Exporter | COCO CRAFT EXPORTS',
    description: 'Leading international coconut coir manufacturer and cocopeat exporter. Bulk 5kg blocks, hydroponic grow bags, husk chips, and growing media substrates for commercial horticulture worldwide.',
    focusKeyword: 'coconut coir manufacturer',
    secondaryKeywords: 'cocopeat exporter, coir substrate supplier, bulk coir supplier, coir products wholesale, coconut growing media',
    canonical: 'https://cococraftexports.com/',
    robots: 'index, follow',
    ogImage: '/assets/products/5kg-block.jpg',
    priority: '1.0',
    changefreq: 'weekly'
  },
  about: {
    name: 'About Us',
    path: '/about/about.html',
    title: 'About COCO CRAFT EXPORTS | Global Coconut Substrates Manufacturer',
    description: 'Discover COCO CRAFT EXPORTS, a dedicated international B2B manufacturer and exporter of sustainable coconut coir growing media, 5kg blocks, and horticultural substrates.',
    focusKeyword: 'coconut coir manufacturer',
    secondaryKeywords: 'coir products manufacturer, coconut coir exporter, commercial growing substrate, bulk coir supplier',
    canonical: 'https://cococraftexports.com/about/about.html',
    robots: 'index, follow',
    ogImage: '/assets/products/5kg-block.jpg',
    priority: '0.7',
    changefreq: 'monthly'
  },
  products: {
    name: 'Products Catalogue',
    path: '/products/products.html',
    title: 'Coconut Coir Products & Growing Media Catalogue | COCO CRAFT EXPORTS',
    description: 'Explore commercial coconut coir products: 5kg cocopeat blocks, hydroponic grow bags, washed husk chips, briquettes, and coir fiber for international B2B supply.',
    focusKeyword: 'coconut coir products',
    secondaryKeywords: 'cocopeat, coco peat, cocopeat blocks, coir grow bags, coconut husk chips, coir briquettes, coir fiber',
    canonical: 'https://cococraftexports.com/products/products.html',
    robots: 'index, follow',
    ogImage: '/assets/products/5kg-block.jpg',
    priority: '0.9',
    changefreq: 'weekly'
  },
  applications: {
    name: 'Applications',
    path: '/applications/applications.html',
    title: 'Commercial Horticultural Applications & Substrates | COCO CRAFT EXPORTS',
    description: 'Engineered coconut coir substrate solutions for commercial greenhouses, hydroponic berry and vine crops, floriculture, potting soil blending, and industrial applications.',
    focusKeyword: 'commercial growing substrate',
    secondaryKeywords: 'coir substrate supplier, horticultural growing media supplier, coconut growing media, coir growing medium, coir grow bags',
    canonical: 'https://cococraftexports.com/applications/applications.html',
    robots: 'index, follow',
    ogImage: '/assets/products/5kg-block.jpg',
    priority: '0.8',
    changefreq: 'monthly'
  },
  manufacturing: {
    name: 'Manufacturing',
    path: '/company/manufacturing.html',
    title: 'Precision Coconut Coir Manufacturing & Processing | COCO CRAFT EXPORTS',
    description: 'Explore our end-to-end coconut coir manufacturing infrastructure: freshwater triple-washing, sun-curing, mechanical screening, and hydraulic compression for global export.',
    focusKeyword: 'coconut coir manufacturer',
    secondaryKeywords: 'coir products manufacturer, coconut substrate manufacturer, coir substrate supplier, bulk coir supplier',
    canonical: 'https://cococraftexports.com/company/manufacturing.html',
    robots: 'index, follow',
    ogImage: '/assets/products/5kg-block.jpg',
    priority: '0.8',
    changefreq: 'monthly'
  },
  sustainability: {
    name: 'Sustainability',
    path: '/company/sustainability.html',
    title: 'Sustainable Coir & Eco-Friendly Substrates | COCO CRAFT EXPORTS',
    description: '100% organic, renewable, peat-free coconut growing media. Discover our zero-chemical manufacturing, closed-loop water stewardship, and circular agriculture commitments.',
    focusKeyword: 'coconut growing media',
    secondaryKeywords: 'horticultural growing media supplier, coir substrate supplier, commercial growing substrate, cocopeat',
    canonical: 'https://cococraftexports.com/company/sustainability.html',
    robots: 'index, follow',
    ogImage: '/assets/products/5kg-block.jpg',
    priority: '0.8',
    changefreq: 'monthly'
  },
  'global-reach': {
    name: 'Global Reach & Export',
    path: '/company/global-reach.html',
    title: 'Coconut Coir Exporter & Global B2B Substrate Supply | COCO CRAFT EXPORTS',
    description: 'Worldwide B2B coconut coir manufacturer and cocopeat exporter. Containerized shipping from Tuticorin and Chennai ports, international phytosanitary compliance, and dedicated export logistics.',
    focusKeyword: 'coconut coir exporter',
    secondaryKeywords: 'cocopeat exporter, coir substrate supplier, bulk coir supplier, coir products wholesale, coconut coir exporter to Germany, cocopeat supplier Germany',
    canonical: 'https://cococraftexports.com/company/global-reach.html',
    robots: 'index, follow',
    ogImage: '/assets/products/5kg-block.jpg',
    priority: '0.8',
    changefreq: 'monthly'
  },
  gallery: {
    name: 'Facility Gallery',
    path: '/company/gallery.html',
    title: 'Facility & Substrate Production Gallery | COCO CRAFT EXPORTS',
    description: 'Visual tour of our coconut coir processing facility: concrete drying aprons, hydraulic baling presses, automated screening trommels, and container export dispatch.',
    focusKeyword: 'coir products manufacturer',
    secondaryKeywords: 'coconut coir manufacturer, cocopeat exporter, bulk coir supplier, coir substrate supplier',
    canonical: 'https://cococraftexports.com/company/gallery.html',
    robots: 'index, follow',
    ogImage: '/assets/products/5kg-block.jpg',
    priority: '0.7',
    changefreq: 'monthly'
  },
  resources: {
    name: 'Technical Resources',
    path: '/resources/index.html',
    title: 'Technical Resources & Growing Media Specifications | COCO CRAFT EXPORTS',
    description: 'Technical guide for commercial growers: Electrical Conductivity (EC) testing, substrate expansion calculations, container freight specifications, and FAQ on coconut coir substrates.',
    focusKeyword: 'horticultural growing media supplier',
    secondaryKeywords: 'coconut growing media, coir substrate supplier, commercial growing substrate, coir growing medium, cocopeat blocks',
    canonical: 'https://cococraftexports.com/resources/index.html',
    robots: 'index, follow',
    ogImage: '/assets/products/5kg-block.jpg',
    priority: '0.8',
    changefreq: 'weekly'
  },
  contact: {
    name: 'Contact & Quote',
    path: '/contact/contact.html',
    title: 'Request Quote & International Trade Desk | COCO CRAFT EXPORTS',
    description: 'Connect with our international B2B trade desk for containerized coconut coir orders, custom EC/pH specifications, proforma quotations, and global shipping logistics.',
    focusKeyword: 'coconut coir exporter',
    secondaryKeywords: 'cocopeat exporter, coir substrate supplier, bulk coir supplier, coir products wholesale, commercial growing substrate',
    canonical: 'https://cococraftexports.com/contact/contact.html',
    robots: 'index, follow',
    ogImage: '/assets/products/5kg-block.jpg',
    priority: '0.9',
    changefreq: 'weekly'
  }
};

const SEO_PRODUCT_BASELINES = {
  '5kg-cocopeat-blocks': {
    name: '5KG Cocopeat Compressed Blocks',
    title: 'Cocopeat Blocks Manufacturer & Exporter | COCO CRAFT EXPORTS',
    description: 'Premium washed and unwashed 5kg compressed coco peat pith blocks for commercial horticulture and soil blending. 5:1 expansion ratio yielding ~75 liters.',
    keyword: 'cocopeat blocks',
    canonical: 'https://cococraftexports.com/products/products.html#blocks',
    image: '/assets/products/5kg-block.jpg'
  },
  'coir-grow-bags': {
    name: 'Hydroponic Coir Grow Bags / Slabs',
    title: 'Hydroponic Coir Grow Bags Manufacturer & Exporter | COCO CRAFT EXPORTS',
    description: 'Commercial greenhouse coir grow slabs with pre-cut plant holes & customized pith-to-chip ratios for vine crops and soft fruit cultivation.',
    keyword: 'coir grow bags',
    canonical: 'https://cococraftexports.com/products/products.html#grow-bags',
    image: '/assets/products/growbag-slab.jpg'
  },
  'husk-chips': {
    name: 'Washed Coir Husk Chips',
    title: 'Washed Coconut Husk Chips Supplier & Exporter | COCO CRAFT EXPORTS',
    description: 'High-aeration washed coconut husk cubes for orchid cultivation, anthuriums, and professional potting soil mixes with 35-45% air porosity.',
    keyword: 'coconut husk chips',
    canonical: 'https://cococraftexports.com/products/products.html#chips',
    image: '/assets/products/husk-chips.jpg'
  },
  'briquettes': {
    name: '650g Compressed Coir Briquettes',
    title: '650g Coir Briquettes Manufacturer & Exporter | COCO CRAFT EXPORTS',
    description: 'Compact compressed 650g coco peat briquettes yielding 9–10 liters of high-retention potting substrate for commercial and retail distribution.',
    keyword: 'coir briquettes',
    canonical: 'https://cococraftexports.com/products/products.html#briquettes',
    image: '/assets/products/650g-briquette.jpg'
  },
  'coir-fiber': {
    name: 'Raw Mattress & Bristle Coir Fibre',
    title: 'Industrial Coir Fiber Manufacturer & Exporter | COCO CRAFT EXPORTS',
    description: 'Hydraulically baled golden brown coconut fiber for mattress cores, erosion control geotextiles, and industrial upholstery.',
    keyword: 'coir fiber',
    canonical: 'https://cococraftexports.com/products/products.html#coir-fiber',
    image: '/assets/products/coir-fibre.jpg'
  },
  'open-top-grow-bags': {
    name: 'Coco Coir Open Top Grow Bags',
    title: 'Coco Coir Open Top Grow Bags Manufacturer | COCO CRAFT EXPORTS',
    description: 'Self-standing open-top coir grow bags designed for intensive greenhouse berry crops, peppers, and standalone pot culture.',
    keyword: 'open top grow bags',
    canonical: 'https://cococraftexports.com/products/products.html#open-top',
    image: '/assets/products/growbag-slab.jpg'
  },
  'coir-pots-discs': {
    name: 'Biodegradable Coir Seedling Pots & Pellets',
    title: 'Biodegradable Coir Seedling Pots & Pellets | COCO CRAFT EXPORTS',
    description: '100% natural, root-permeable biodegradable coir nursery pots and expandable seed discs for commercial plant propagation.',
    keyword: 'coir pots and discs',
    canonical: 'https://cococraftexports.com/products/products.html#pots-discs',
    image: '/assets/products/650g-briquette.jpg'
  }
};

let activeSeoCache = {
  pages: {},
  products: {},
  redirects: [
    { from: '/about', to: '/about/about.html', status: '301' },
    { from: '/products', to: '/products/products.html', status: '301' },
    { from: '/applications', to: '/applications/applications.html', status: '301' },
    { from: '/manufacturing', to: '/company/manufacturing.html', status: '301' },
    { from: '/sustainability', to: '/company/sustainability.html', status: '301' },
    { from: '/global-reach', to: '/company/global-reach.html', status: '301' },
    { from: '/gallery', to: '/company/gallery.html', status: '301' },
    { from: '/resources', to: '/resources/index.html', status: '301' },
    { from: '/contact', to: '/contact/contact.html', status: '301' },
    { from: '/quote', to: '/contact/contact.html', status: '301' },
    { from: '/rfq', to: '/contact/contact.html', status: '301' },
    { from: '/cocopeat-blocks', to: '/products/products.html#blocks', status: '301' },
    { from: '/grow-bags', to: '/products/products.html#grow-bags', status: '301' }
  ],
  global: {
    brand: 'COCO CRAFT EXPORTS',
    suffix: '| COCO CRAFT EXPORTS',
    baseUrl: 'https://cococraftexports.com',
    defaultDesc: 'Worldwide B2B coconut coir manufacturer and exporter. Supplying premium 5kg cocopeat blocks, hydroponic grow bags, and growing media to commercial growers and distributors globally.',
    defaultImage: '/assets/products/5kg-block.jpg',
    defaultRobots: 'index, follow',
    googleVerification: '',
    bingVerification: ''
  },
  local: {
    businessName: 'COCO CRAFT EXPORTS',
    businessCategory: 'Coconut Coir Manufacturer & Exporter',
    address: 'Pollachi Agro-Industrial Corridor, Coimbatore District',
    city: 'Pollachi',
    district: 'Coimbatore District',
    state: 'Tamil Nadu',
    country: 'India',
    countryCode: 'IN',
    postalCode: '642001',
    phone: '+91 94883 55299',
    email: 'enquiry@cococraftexports.com',
    businessHours: 'Mo-Sa 09:00-18:00 (IST)',
    gbpUrl: '',
    mapsUrl: '',
    serviceAreas: 'Worldwide B2B Export · Confirmed European Market: Germany 🇩🇪 · Manufacturing Hub: Tamil Nadu, India',
    isAddressVerified: true,
    schemaEnabled: true
  },
  markets: {
    germany: {
      confirmed: true,
      title: 'Coconut Coir & Cocopeat Exporter to Germany | COCO CRAFT EXPORTS',
      description: 'Leading coconut coir manufacturer exporting premium 5kg cocopeat blocks, hydroponic grow bags and husk chips to Germany. Low EC, certified phytosanitary standards.',
      focusKeyword: 'coconut coir exporter to Germany',
      secondaryKeywords: 'cocopeat exporter Germany, cocopeat supplier Germany, coir products supplier Germany, coconut coir manufacturer India Germany, coir growing media Germany, cocopeat blocks Germany, coconut husk chips Germany, coir grow bags Germany',
      ports: 'Port of Hamburg (DEHAM), Port of Bremerhaven (DEBRV)'
    }
  }
};

function initSeoController() {
  // A. Inner Tab Navigation
  const tabBtns = document.querySelectorAll('.seo-tab-btn');
  const tabContents = document.querySelectorAll('.seo-tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.seoTab;
      tabBtns.forEach(b => {
        b.classList.remove('active', 'bg-[#00742F]', 'text-white');
        b.classList.add('bg-white', 'text-on-surface-variant');
      });
      btn.classList.add('active', 'bg-[#00742F]', 'text-white');
      btn.classList.remove('bg-white', 'text-on-surface-variant');

      tabContents.forEach(tc => tc.classList.add('hidden'));
      const activeContent = document.getElementById(`seo-tab-content-${target}`);
      if (activeContent) activeContent.classList.remove('hidden');

      if (target === 'local') renderLocalSeoTab();
      if (target === 'markets') renderGermanySeoTab();
      if (target === 'sitemap') renderSitemapTab();
      if (target === 'robots') renderRobotsTab();
      if (target === 'redirects') renderRedirectsTab();
      if (target === 'schema') renderSchemaTab();
    });
  });

  // B. Page Selector & Live Inputs
  const pageSelector = document.getElementById('seo-page-selector');
  const titleInput = document.getElementById('seo-title');
  const descInput = document.getElementById('seo-description');
  const canonicalInput = document.getElementById('seo-canonical');
  const focusKeyInput = document.getElementById('seo-focus-keyword');
  const secKeysInput = document.getElementById('seo-secondary-keywords');
  const robotsSelect = document.getElementById('seo-robots');

  if (pageSelector) {
    pageSelector.addEventListener('change', () => loadPageSeoIntoForm(pageSelector.value));
  }

  // Live Character Counters & SERP Updates
  const updateTitleCounter = () => {
    if (!titleInput) return;
    const len = titleInput.value.length;
    const countEl = document.getElementById('seo-title-count');
    if (countEl) {
      countEl.textContent = `${len} / 60 Chars (Optimal: 50–60)`;
      countEl.className = (len >= 45 && len <= 65) 
        ? 'font-mono text-[11px] text-[#00742F] font-bold' 
        : 'font-mono text-[11px] text-[#B39158] font-bold';
    }
    const serpTitle = document.getElementById('serp-preview-title');
    if (serpTitle) serpTitle.textContent = titleInput.value || 'COCO CRAFT EXPORTS';
  };

  const updateDescCounter = () => {
    if (!descInput) return;
    const len = descInput.value.length;
    const countEl = document.getElementById('seo-desc-count');
    if (countEl) {
      countEl.textContent = `${len} / 160 Chars (Optimal: 150–160)`;
      countEl.className = (len >= 130 && len <= 165) 
        ? 'font-mono text-[11px] text-[#00742F] font-bold' 
        : 'font-mono text-[11px] text-[#B39158] font-bold';
    }
    const serpDesc = document.getElementById('serp-preview-desc');
    if (serpDesc) serpDesc.textContent = descInput.value || 'Leading international coconut coir manufacturer...';
  };

  if (titleInput) titleInput.addEventListener('input', updateTitleCounter);
  if (descInput) descInput.addEventListener('input', updateDescCounter);

  if (canonicalInput) {
    canonicalInput.addEventListener('input', () => {
      const serpUrl = document.getElementById('serp-preview-url');
      if (serpUrl) serpUrl.textContent = canonicalInput.value || 'https://cococraftexports.com';
    });
  }

  // Auto-Fill Canonical
  const autofillCanonicalBtn = document.getElementById('seo-autofill-canonical-btn');
  if (autofillCanonicalBtn) {
    autofillCanonicalBtn.addEventListener('click', () => {
      const pageKey = pageSelector ? pageSelector.value : 'home';
      const base = SEO_PAGE_BASELINES[pageKey];
      if (base && canonicalInput) {
        canonicalInput.value = base.canonical;
        const serpUrl = document.getElementById('serp-preview-url');
        if (serpUrl) serpUrl.textContent = base.canonical;
        showToast(`Canonical URL set to ${base.canonical}`, 'info');
      }
    });
  }

  // SERP Device Toggle
  const desktopBtn = document.getElementById('serp-preview-desktop');
  const mobileBtn = document.getElementById('serp-preview-mobile');
  const serpBox = document.getElementById('serp-preview-box');

  if (desktopBtn && mobileBtn && serpBox) {
    desktopBtn.addEventListener('click', () => {
      desktopBtn.className = 'px-2.5 py-1 rounded-md bg-[#00742F] text-white';
      mobileBtn.className = 'px-2.5 py-1 rounded-md bg-white border border-[#E2E6E0] text-on-surface-variant';
      serpBox.className = 'p-5 rounded-2xl bg-[#F8FAF6] border border-[#E2E6E0] max-w-2xl flex flex-col gap-1.5 shadow-2xs font-sans';
    });
    mobileBtn.addEventListener('click', () => {
      mobileBtn.className = 'px-2.5 py-1 rounded-md bg-[#00742F] text-white';
      desktopBtn.className = 'px-2.5 py-1 rounded-md bg-white border border-[#E2E6E0] text-on-surface-variant';
      serpBox.className = 'p-5 rounded-2xl bg-[#F8FAF6] border border-[#E2E6E0] max-w-sm flex flex-col gap-1.5 shadow-2xs font-sans';
    });
  }

  // C. Product SEO Selector
  const prodSelector = document.getElementById('seo-product-selector');
  if (prodSelector) {
    prodSelector.addEventListener('change', () => loadProductSeoIntoForm(prodSelector.value));
  }

  // D. OpenGraph & Social Cards
  const ogImageInput = document.getElementById('seo-og-image');
  if (ogImageInput) {
    ogImageInput.addEventListener('input', () => {
      const previewImg = document.getElementById('og-preview-img');
      if (previewImg && ogImageInput.value) previewImg.src = ogImageInput.value;
    });
  }
  const pickOgImageBtn = document.getElementById('pick-seo-og-image-btn');
  if (pickOgImageBtn) {
    pickOgImageBtn.addEventListener('click', () => {
      const mediaSectionBtn = document.querySelector('[data-section="media"]');
      if (mediaSectionBtn) {
        showToast('Switching to Media Library. Copy an asset URL and paste it here.', 'info');
        mediaSectionBtn.click();
      }
    });
  }

  // E. Master Save Button
  const saveAllBtn = document.getElementById('save-seo-btn');
  if (saveAllBtn) {
    saveAllBtn.addEventListener('click', async () => {
      await saveCurrentSeoData();
    });
  }

  // F. Run Audit Button
  const auditBtn = document.getElementById('run-seo-audit-btn');
  if (auditBtn) {
    auditBtn.addEventListener('click', () => {
      runSeoAudit(true);
    });
  }

  // G. Redirects Add Form
  const saveRedirectBtn = document.getElementById('save-new-redirect-btn');
  if (saveRedirectBtn) {
    saveRedirectBtn.addEventListener('click', () => {
      const from = document.getElementById('redirect-source').value.trim();
      const to = document.getElementById('redirect-target').value.trim();
      const status = document.getElementById('redirect-status').value;

      if (!from || !to) {
        showToast('Please provide both Source and Destination paths.', 'error');
        return;
      }
      if (from === to) {
        showToast('Safety Alert: Cannot redirect path to itself (circular redirect loop).', 'error');
        return;
      }

      activeSeoCache.redirects.push({ from, to, status });
      document.getElementById('redirect-source').value = '';
      document.getElementById('redirect-target').value = '';
      renderRedirectsTab();
      showToast(`Redirect ${from} → ${to} added.`, 'success');
      runSeoAudit(false);
    });
  }

  // H. Copy buttons
  const copySitemapBtn = document.getElementById('copy-sitemap-xml-btn');
  if (copySitemapBtn) {
    copySitemapBtn.addEventListener('click', () => {
      const xml = document.getElementById('sitemap-xml-viewer').value;
      navigator.clipboard.writeText(xml).then(() => showToast('Sitemap XML copied to clipboard.', 'success'));
    });
  }

  const copyRobotsBtn = document.getElementById('copy-robots-txt-btn');
  if (copyRobotsBtn) {
    copyRobotsBtn.addEventListener('click', () => {
      const txt = document.getElementById('seo-robots-editor').value;
      navigator.clipboard.writeText(txt).then(() => showToast('robots.txt copied to clipboard.', 'success'));
    });
  }

  const copySchemaBtn = document.getElementById('copy-schema-json-btn');
  if (copySchemaBtn) {
    copySchemaBtn.addEventListener('click', () => {
      const json = document.getElementById('schema-json-preview').textContent;
      navigator.clipboard.writeText(json).then(() => showToast('Schema.org JSON-LD copied.', 'success'));
    });
  }

  // I. Local SEO Event Listeners
  const localInputs = [
    'seo-local-name', 'seo-local-category', 'seo-local-address', 
    'seo-local-city', 'seo-local-district', 'seo-local-state', 
    'seo-local-country', 'seo-local-postal', 'seo-local-phone', 
    'seo-local-email', 'seo-local-hours', 'seo-local-service-areas', 
    'seo-local-gbp-url', 'seo-local-maps-url'
  ];
  localInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        updateLocalSchemaPreview();
        updateNapDisplays();
      });
    }
  });

  const localToggle = document.getElementById('seo-local-schema-toggle');
  if (localToggle) {
    localToggle.addEventListener('change', () => {
      updateLocalSchemaPreview();
    });
  }

  const saveLocalBtn = document.getElementById('save-local-seo-btn');
  if (saveLocalBtn) {
    saveLocalBtn.addEventListener('click', async () => {
      await saveLocalSeo();
    });
  }

  const copyLocalSchemaBtn = document.getElementById('copy-local-schema-btn');
  if (copyLocalSchemaBtn) {
    copyLocalSchemaBtn.addEventListener('click', () => {
      const code = document.getElementById('seo-local-schema-preview')?.textContent || '';
      if (code && !code.startsWith('//')) {
        navigator.clipboard.writeText(code).then(() => showToast('LocalBusiness Schema JSON-LD copied.', 'success'));
      } else {
        showToast('LocalBusiness Schema is not active or verified.', 'warning');
      }
    });
  }

  // J. Germany Confirmed Market Event Listeners
  const germanyTitleInput = document.getElementById('seo-germany-title');
  const germanyDescInput = document.getElementById('seo-germany-desc');

  if (germanyTitleInput) {
    germanyTitleInput.addEventListener('input', () => {
      const len = germanyTitleInput.value.length;
      const countEl = document.getElementById('seo-germany-title-count');
      if (countEl) countEl.textContent = `${len} / 60 Chars`;
      const serpTitle = document.getElementById('germany-serp-title');
      if (serpTitle) serpTitle.textContent = germanyTitleInput.value || 'Coconut Coir & Cocopeat Exporter to Germany';
    });
  }

  if (germanyDescInput) {
    germanyDescInput.addEventListener('input', () => {
      const len = germanyDescInput.value.length;
      const countEl = document.getElementById('seo-germany-desc-count');
      if (countEl) countEl.textContent = `${len} / 160 Chars`;
      const serpDesc = document.getElementById('germany-serp-desc');
      if (serpDesc) serpDesc.textContent = germanyDescInput.value || '';
    });
  }

  const saveGermanyBtn = document.getElementById('save-germany-seo-btn');
  if (saveGermanyBtn) {
    saveGermanyBtn.addEventListener('click', async () => {
      await saveGermanySeo();
    });
  }

  // Initial load
  loadPageSeoIntoForm('home');
  loadProductSeoIntoForm('5kg-cocopeat-blocks');
  renderLocalSeoTab();
  renderGermanySeoTab();
  renderRobotsTab();
  renderSchemaTab();
  runSeoAudit(false);
}

function loadPageSeoIntoForm(pageKey) {
  const base = SEO_PAGE_BASELINES[pageKey] || SEO_PAGE_BASELINES.home;
  const saved = activeSeoCache.pages[pageKey] || {};

  const titleVal = saved.title || base.title;
  const descVal = saved.description || base.description;
  const canonicalVal = saved.canonical || base.canonical;
  const focusVal = saved.focusKeyword || base.focusKeyword;
  const secVal = saved.secondaryKeywords || base.secondaryKeywords;
  const robotsVal = saved.robots || base.robots;
  const ogImgVal = saved.ogImage || base.ogImage;

  if (document.getElementById('seo-title')) document.getElementById('seo-title').value = titleVal;
  if (document.getElementById('seo-description')) document.getElementById('seo-description').value = descVal;
  if (document.getElementById('seo-canonical')) document.getElementById('seo-canonical').value = canonicalVal;
  if (document.getElementById('seo-focus-keyword')) document.getElementById('seo-focus-keyword').value = focusVal;
  if (document.getElementById('seo-secondary-keywords')) document.getElementById('seo-secondary-keywords').value = secVal;
  if (document.getElementById('seo-robots')) document.getElementById('seo-robots').value = robotsVal;
  if (document.getElementById('seo-og-image')) document.getElementById('seo-og-image').value = ogImgVal;
  if (document.getElementById('seo-og-title')) document.getElementById('seo-og-title').value = saved.ogTitle || titleVal;
  if (document.getElementById('seo-og-description')) document.getElementById('seo-og-description').value = saved.ogDescription || descVal;

  // Trigger counters and previews
  const titleCount = document.getElementById('seo-title-count');
  if (titleCount) titleCount.textContent = `${titleVal.length} / 60 Chars (Optimal: 50–60)`;
  const descCount = document.getElementById('seo-desc-count');
  if (descCount) descCount.textContent = `${descVal.length} / 160 Chars (Optimal: 150–160)`;

  const serpTitle = document.getElementById('serp-preview-title');
  if (serpTitle) serpTitle.textContent = titleVal;
  const serpDesc = document.getElementById('serp-preview-desc');
  if (serpDesc) serpDesc.textContent = descVal;
  const serpUrl = document.getElementById('serp-preview-url');
  if (serpUrl) serpUrl.textContent = canonicalVal;

  const ogImg = document.getElementById('og-preview-img');
  if (ogImg) ogImg.src = ogImgVal;
  const ogTitle = document.getElementById('og-preview-title');
  if (ogTitle) ogTitle.textContent = titleVal;
  const ogDesc = document.getElementById('og-preview-desc');
  if (ogDesc) ogDesc.textContent = descVal;
}

function loadProductSeoIntoForm(prodKey) {
  const base = SEO_PRODUCT_BASELINES[prodKey] || SEO_PRODUCT_BASELINES['5kg-cocopeat-blocks'];
  const saved = activeSeoCache.products[prodKey] || {};

  const titleVal = saved.title || base.title;
  const descVal = saved.description || base.description;
  const keywordVal = saved.keyword || base.keyword;
  const canonicalVal = saved.canonical || base.canonical;

  if (document.getElementById('seo-prod-title')) document.getElementById('seo-prod-title').value = titleVal;
  if (document.getElementById('seo-prod-description')) document.getElementById('seo-prod-description').value = descVal;
  if (document.getElementById('seo-prod-keyword')) document.getElementById('seo-prod-keyword').value = keywordVal;
  if (document.getElementById('seo-prod-canonical')) document.getElementById('seo-prod-canonical').value = canonicalVal;

  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: base.name,
    description: descVal,
    image: `https://cococraftexports.com${base.image}`,
    brand: {
      '@type': 'Brand',
      name: 'COCO CRAFT EXPORTS'
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      offerCount: '1'
    }
  };

  const schemaPreview = document.getElementById('seo-prod-schema-preview');
  if (schemaPreview) {
    schemaPreview.textContent = JSON.stringify(schemaJson, null, 2);
  }
}

function renderSitemapTab() {
  const tbody = document.getElementById('sitemap-urls-tbody');
  if (!tbody) return;

  const today = new Date().toISOString().split('T')[0];
  let rowsHtml = '';
  let xmlEntries = '';

  Object.entries(SEO_PAGE_BASELINES).forEach(([key, p]) => {
    const saved = activeSeoCache.pages[key] || {};
    const canonical = saved.canonical || p.canonical;
    const robots = saved.robots || p.robots;
    const isIndexed = !robots.includes('noindex');

    rowsHtml += `
      <tr class="hover:bg-surface-container transition-colors">
        <td class="p-3.5 font-bold text-primary">${canonical}</td>
        <td class="p-3.5 font-mono text-[#00742F]">${p.priority}</td>
        <td class="p-3.5 text-on-surface-variant">${p.changefreq}</td>
        <td class="p-3.5 text-on-surface-variant">${today}</td>
        <td class="p-3.5">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${isIndexed ? 'bg-[#00742F]/10 text-[#00742F]' : 'bg-red-50 text-red-700'} font-mono text-[10px] font-bold">
            ${isIndexed ? '✓ INDEX' : '✕ NOINDEX'}
          </span>
        </td>
      </tr>
    `;

    if (isIndexed) {
      xmlEntries += `  <url>\n    <loc>${canonical}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
    }
  });

  tbody.innerHTML = rowsHtml;

  const fullXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlEntries}</urlset>`;
  const viewer = document.getElementById('sitemap-xml-viewer');
  if (viewer) viewer.value = fullXml;
}

function renderRobotsTab() {
  const editor = document.getElementById('seo-robots-editor');
  if (!editor) return;
  if (!editor.value) {
    editor.value = `# ==============================================================================
# COCO CRAFT EXPORTS — INTERNATIONAL ROBOTS DIRECTIVE
# High-Performance B2B Search Crawler Guidance
# ==============================================================================

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin
Disallow: /*?*fbclid=
Disallow: /*?*utm_

# Crawl delay optimization
Crawl-delay: 1

# Host Declaration & Canonical XML Sitemap
Host: https://cococraftexports.com
Sitemap: https://cococraftexports.com/sitemap.xml`;
  }
}

function renderRedirectsTab() {
  const tbody = document.getElementById('redirects-tbody');
  if (!tbody) return;

  tbody.innerHTML = activeSeoCache.redirects.map((r, i) => `
    <tr class="hover:bg-surface-container transition-colors">
      <td class="p-3.5 font-bold text-primary">${r.from}</td>
      <td class="p-3.5 text-[#00742F]">${r.to}</td>
      <td class="p-3.5 font-mono"><span class="px-2 py-0.5 rounded bg-surface border border-surface-variant font-bold">${r.status}</span></td>
      <td class="p-3.5 text-right">
        <button type="button" onclick="window.removeSeoRedirect(${i})" class="p-1 rounded text-red-600 hover:bg-red-50 transition-colors" title="Delete Redirect">
          <span class="material-symbols-outlined text-base">delete</span>
        </button>
      </td>
    </tr>
  `).join('');
}

window.removeSeoRedirect = (index) => {
  activeSeoCache.redirects.splice(index, 1);
  renderRedirectsTab();
  showToast('Redirect removed.', 'info');
  runSeoAudit(false);
};

function renderSchemaTab() {
  const schemaObj = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://cococraftexports.com/#organization',
    name: 'COCO CRAFT EXPORTS',
    url: 'https://cococraftexports.com/',
    logo: 'https://cococraftexports.com/assets/logo/coco-craft-logo.svg',
    description: 'International B2B coconut coir manufacturer and growing media substrate exporter.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'enquiry@cococraftexports.com',
      availableLanguage: ['English']
    }
  };

  const preview = document.getElementById('schema-json-preview');
  if (preview) {
    preview.textContent = JSON.stringify(schemaObj, null, 2);
  }
}

/**
 * Local SEO Controller: Renders verified NAP, GBP checklist, and LocalBusiness schema guard
 */
function renderLocalSeoTab() {
  const loc = activeSeoCache.local || {};

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };

  setVal('seo-local-name', loc.businessName || 'COCO CRAFT EXPORTS');
  setVal('seo-local-category', loc.businessCategory || 'Coconut Coir Manufacturer & Exporter');
  setVal('seo-local-address', loc.address || 'Pollachi Agro-Industrial Corridor, Coimbatore District');
  setVal('seo-local-city', loc.city || 'Pollachi');
  setVal('seo-local-district', loc.district || 'Coimbatore District');
  setVal('seo-local-state', loc.state || 'Tamil Nadu');
  setVal('seo-local-country', loc.country || 'India');
  setVal('seo-local-postal', loc.postalCode || '642001');
  setVal('seo-local-phone', loc.phone || '+91 94883 55299');
  setVal('seo-local-email', loc.email || 'enquiry@cococraftexports.com');
  setVal('seo-local-hours', loc.businessHours || 'Mo-Sa 09:00-18:00 (IST)');
  setVal('seo-local-service-areas', loc.serviceAreas || 'Worldwide B2B Export · Confirmed European Market: Germany 🇩🇪 · Manufacturing Hub: Tamil Nadu, India');
  setVal('seo-local-gbp-url', loc.gbpUrl || '');
  setVal('seo-local-maps-url', loc.mapsUrl || '');

  const toggle = document.getElementById('seo-local-schema-toggle');
  if (toggle) toggle.checked = loc.schemaEnabled !== false;

  updateLocalSchemaPreview();
  updateNapDisplays();
}

function updateLocalSchemaPreview() {
  const loc = activeSeoCache.local || {};
  const toggle = document.getElementById('seo-local-schema-toggle');
  const isEnabled = toggle ? toggle.checked : (loc.schemaEnabled !== false);

  const name = document.getElementById('seo-local-name')?.value.trim() || loc.businessName || 'COCO CRAFT EXPORTS';
  const address = document.getElementById('seo-local-address')?.value.trim() || loc.address || '';
  const city = document.getElementById('seo-local-city')?.value.trim() || loc.city || '';
  const state = document.getElementById('seo-local-state')?.value.trim() || loc.state || 'Tamil Nadu';
  const postal = document.getElementById('seo-local-postal')?.value.trim() || loc.postalCode || '';
  const country = document.getElementById('seo-local-country')?.value.trim() || loc.country || 'India';
  const phone = document.getElementById('seo-local-phone')?.value.trim() || loc.phone || '';
  const email = document.getElementById('seo-local-email')?.value.trim() || loc.email || '';

  // Strict Address Verification Check: Must have legitimate street address, city, and postal code
  const isAddressVerified = Boolean(
    address && 
    city && 
    postal && 
    !address.toUpperCase().includes('VERIFIED_') && 
    !city.toUpperCase().includes('VERIFIED_') &&
    !postal.toUpperCase().includes('VERIFIED_')
  );

  activeSeoCache.local.isAddressVerified = isAddressVerified;
  activeSeoCache.local.schemaEnabled = isEnabled && isAddressVerified;

  const alertBox = document.getElementById('seo-local-schema-alert');
  const badgeEl = document.getElementById('seo-local-schema-badge');
  const previewEl = document.getElementById('seo-local-schema-preview');

  if (!isAddressVerified) {
    if (alertBox) {
      alertBox.className = 'p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5';
      alertBox.innerHTML = `
        <span class="material-symbols-outlined text-base shrink-0 mt-0.5 text-amber-700">warning</span>
        <div>
          <span class="font-bold">Verified Address Required:</span>
          <span class="text-xs">Physical address is incomplete or contains unverified placeholders. LocalBusiness Schema is safely disabled to protect search ranking from invented location penalties.</span>
        </div>
      `;
    }
    if (badgeEl) {
      badgeEl.className = 'px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-mono text-[10px] font-bold';
      badgeEl.textContent = 'UNVERIFIED — SCHEMA DISABLED';
    }
    if (previewEl) {
      previewEl.textContent = '// LocalBusiness Schema is paused.\n// Enter a verified physical address, city, and pincode to enable Schema.org structured data.';
    }
    return;
  }

  if (!isEnabled) {
    if (alertBox) {
      alertBox.className = 'p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 flex items-start gap-2.5';
      alertBox.innerHTML = `
        <span class="material-symbols-outlined text-base shrink-0 mt-0.5 text-gray-500">do_not_disturb_on</span>
        <div>
          <span class="font-bold">LocalBusiness Schema Manually Paused:</span>
          <span class="text-xs">The schema toggle is disabled. Toggle on to emit Schema.org LocalBusiness JSON-LD on public pages.</span>
        </div>
      `;
    }
    if (badgeEl) {
      badgeEl.className = 'px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-300 font-mono text-[10px] font-bold';
      badgeEl.textContent = 'PAUSED BY ADMIN';
    }
    if (previewEl) {
      previewEl.textContent = '// LocalBusiness Schema manually disabled by admin toggle.';
    }
    return;
  }

  // Address is verified and enabled: construct valid Schema.org LocalBusiness
  const schemaObj = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://cococraftexports.com/#localbusiness',
    'name': name,
    'url': 'https://cococraftexports.com',
    'telephone': phone,
    'email': email,
    'priceRange': '$$$$',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': address,
      'addressLocality': city,
      'addressRegion': state,
      'postalCode': postal,
      'addressCountry': country === 'India' ? 'IN' : country
    }
  };

  if (loc.mapsUrl) schemaObj.hasMap = loc.mapsUrl;

  if (alertBox) {
    alertBox.className = 'p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2.5';
    alertBox.innerHTML = `
      <span class="material-symbols-outlined text-base shrink-0 mt-0.5 text-[#00742F]">verified</span>
      <div>
        <span class="font-bold">Verified Address Confirmed:</span>
        <span class="text-xs">LocalBusiness Schema is active and compliant with Google Structured Data guidelines. It links ${name} directly to ${city}, ${state}, ${postal}.</span>
      </div>
    `;
  }
  if (badgeEl) {
    badgeEl.className = 'px-2 py-0.5 rounded-full bg-[#00742F]/10 text-[#00742F] border border-[#00742F]/20 font-mono text-[10px] font-bold';
    badgeEl.textContent = 'VERIFIED & ACTIVE';
  }
  if (previewEl) {
    previewEl.textContent = JSON.stringify(schemaObj, null, 2);
  }
}

function updateNapDisplays() {
  const name = document.getElementById('seo-local-name')?.value.trim() || activeSeoCache.local?.businessName || 'COCO CRAFT EXPORTS';
  const address = document.getElementById('seo-local-address')?.value.trim() || activeSeoCache.local?.address || '';
  const city = document.getElementById('seo-local-city')?.value.trim() || activeSeoCache.local?.city || '';
  const state = document.getElementById('seo-local-state')?.value.trim() || activeSeoCache.local?.state || '';
  const postal = document.getElementById('seo-local-postal')?.value.trim() || activeSeoCache.local?.postalCode || '';
  const country = document.getElementById('seo-local-country')?.value.trim() || activeSeoCache.local?.country || '';
  const phone = document.getElementById('seo-local-phone')?.value.trim() || activeSeoCache.local?.phone || '';

  const fullAddr = [address, city, state, postal ? `${postal} ${country}` : country].filter(Boolean).join(', ');

  const nameDisp = document.getElementById('nap-name-display');
  const addrDisp = document.getElementById('nap-address-display');
  const phoneDisp = document.getElementById('nap-phone-display');

  if (nameDisp) nameDisp.textContent = name;
  if (addrDisp) addrDisp.textContent = fullAddr || 'No address set';
  if (phoneDisp) phoneDisp.textContent = phone || 'No phone set';
}

async function saveLocalSeo() {
  const loc = {
    businessName: document.getElementById('seo-local-name')?.value.trim() || 'COCO CRAFT EXPORTS',
    businessCategory: document.getElementById('seo-local-category')?.value.trim() || 'Coconut Coir Manufacturer & Exporter',
    address: document.getElementById('seo-local-address')?.value.trim() || '',
    city: document.getElementById('seo-local-city')?.value.trim() || 'Pollachi',
    district: document.getElementById('seo-local-district')?.value.trim() || 'Coimbatore District',
    state: document.getElementById('seo-local-state')?.value.trim() || 'Tamil Nadu',
    country: document.getElementById('seo-local-country')?.value.trim() || 'India',
    countryCode: 'IN',
    postalCode: document.getElementById('seo-local-postal')?.value.trim() || '642001',
    phone: document.getElementById('seo-local-phone')?.value.trim() || '+91 94883 55299',
    email: document.getElementById('seo-local-email')?.value.trim() || 'enquiry@cococraftexports.com',
    businessHours: document.getElementById('seo-local-hours')?.value.trim() || 'Mo-Sa 09:00-18:00 (IST)',
    gbpUrl: document.getElementById('seo-local-gbp-url')?.value.trim() || '',
    mapsUrl: document.getElementById('seo-local-maps-url')?.value.trim() || '',
    serviceAreas: document.getElementById('seo-local-service-areas')?.value.trim() || '',
    schemaEnabled: document.getElementById('seo-local-schema-toggle')?.checked !== false
  };

  const isVerified = Boolean(
    loc.address &&
    loc.city &&
    loc.postalCode &&
    !loc.address.toUpperCase().includes('VERIFIED_') &&
    !loc.city.toUpperCase().includes('VERIFIED_') &&
    !loc.postalCode.toUpperCase().includes('VERIFIED_')
  );

  loc.isAddressVerified = isVerified;
  loc.schemaEnabled = loc.schemaEnabled && isVerified;

  activeSeoCache.local = loc;

  // Persist to Firestore
  const res = await saveSeoMetadata('local', loc);

  // Cache to localStorage
  try {
    localStorage.setItem('cococraft_seo_cache', JSON.stringify(activeSeoCache));
  } catch (e) {}

  updateLocalSchemaPreview();
  updateNapDisplays();
  runSeoAudit(false);

  if (res.success) {
    showToast('Local SEO & verified manufacturing signals saved successfully.', 'success');
  } else {
    showToast('Saved to local session (Firestore: offline fallback active)', 'info');
  }
}

/**
 * Germany Confirmed Export Market SEO Controller
 */
function renderGermanySeoTab() {
  const ger = (activeSeoCache.markets && activeSeoCache.markets.germany) || {};

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };

  const title = ger.title || 'Coconut Coir & Cocopeat Exporter to Germany | COCO CRAFT EXPORTS';
  const desc = ger.description || 'Leading coconut coir manufacturer exporting premium 5kg cocopeat blocks, hydroponic grow bags and husk chips to Germany. Low EC, certified phytosanitary standards.';
  const focus = ger.focusKeyword || 'coconut coir exporter to Germany';
  const ports = ger.ports || 'Port of Hamburg (DEHAM), Port of Bremerhaven (DEBRV)';
  const sec = ger.secondaryKeywords || 'cocopeat exporter Germany, cocopeat supplier Germany, coir products supplier Germany, coconut coir manufacturer India Germany, coir growing media Germany, cocopeat blocks Germany, coconut husk chips Germany, coir grow bags Germany';

  setVal('seo-germany-title', title);
  setVal('seo-germany-desc', desc);
  setVal('seo-germany-focus-keyword', focus);
  setVal('seo-germany-ports', ports);
  setVal('seo-germany-secondary-keywords', sec);

  const titleCount = document.getElementById('seo-germany-title-count');
  if (titleCount) titleCount.textContent = `${title.length} / 60 Chars`;
  const descCount = document.getElementById('seo-germany-desc-count');
  if (descCount) descCount.textContent = `${desc.length} / 160 Chars`;

  const serpTitle = document.getElementById('germany-serp-title');
  if (serpTitle) serpTitle.textContent = title;
  const serpDesc = document.getElementById('germany-serp-desc');
  if (serpDesc) serpDesc.textContent = desc;
}

async function saveGermanySeo() {
  const ger = {
    confirmed: true,
    title: document.getElementById('seo-germany-title')?.value.trim() || 'Coconut Coir & Cocopeat Exporter to Germany | COCO CRAFT EXPORTS',
    description: document.getElementById('seo-germany-desc')?.value.trim() || '',
    focusKeyword: document.getElementById('seo-germany-focus-keyword')?.value.trim() || 'coconut coir exporter to Germany',
    ports: document.getElementById('seo-germany-ports')?.value.trim() || 'Port of Hamburg (DEHAM), Port of Bremerhaven (DEBRV)',
    secondaryKeywords: document.getElementById('seo-germany-secondary-keywords')?.value.trim() || ''
  };

  if (!activeSeoCache.markets) activeSeoCache.markets = {};
  activeSeoCache.markets.germany = ger;

  const res = await saveSeoMetadata('markets_germany', ger);

  try {
    localStorage.setItem('cococraft_seo_cache', JSON.stringify(activeSeoCache));
  } catch (e) {}

  runSeoAudit(false);

  if (res.success) {
    showToast('Germany Confirmed Export Market SEO saved successfully.', 'success');
  } else {
    showToast('Saved to local session (Firestore: offline fallback active)', 'info');
  }
}

/**
 * Live SEO Audit Engine: Validates lengths, duplicates, canonicals, and indexing
 */
function runSeoAudit(interactive = false) {
  let completeCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  const titlesSeen = new Map();
  const descriptionsSeen = new Map();
  const pageResults = [];

  // Check all public pages
  Object.entries(SEO_PAGE_BASELINES).forEach(([key, base]) => {
    const saved = activeSeoCache.pages[key] || {};
    const title = (saved.title || base.title).trim();
    const desc = (saved.description || base.description).trim();
    const canonical = (saved.canonical || base.canonical).trim();
    const focusKey = (saved.focusKeyword || base.focusKeyword).trim();
    const robots = saved.robots || base.robots;

    let status = 'complete';
    let issues = [];

    // Duplicate detection
    if (titlesSeen.has(title)) {
      status = 'error';
      issues.push(`Duplicate title shared with ${titlesSeen.get(title)}`);
    } else {
      titlesSeen.set(title, base.name);
    }

    if (descriptionsSeen.has(desc)) {
      status = 'error';
      issues.push(`Duplicate description shared with ${descriptionsSeen.get(desc)}`);
    } else {
      descriptionsSeen.set(desc, base.name);
    }

    // Accidental noindex on important pages
    if (robots.includes('noindex')) {
      status = 'error';
      issues.push('Accidental noindex on public page');
    }

    // Canonical check
    if (!canonical.startsWith('https://')) {
      status = 'error';
      issues.push('Canonical must be absolute https:// URL');
    }

    // Warnings on missing/suboptimal length
    if (title.length < 35 || title.length > 70) {
      if (status !== 'error') status = 'warning';
      issues.push(`Title length (${title.length}) outside optimal range (50-60)`);
    }
    if (desc.length < 100 || desc.length > 170) {
      if (status !== 'error') status = 'warning';
      issues.push(`Description length (${desc.length}) outside optimal range (150-160)`);
    }
    if (!focusKey) {
      if (status !== 'error') status = 'warning';
      issues.push('Missing focus keyword');
    }

    if (status === 'complete') completeCount++;
    else if (status === 'warning') warningCount++;
    else errorCount++;

    pageResults.push({ key, name: base.name, status, issues });
  });

  // Check Local SEO NAP and address verification
  const loc = activeSeoCache.local || {};
  let locStatus = 'complete';
  const locIssues = [];

  if (!loc.address || !loc.city || !loc.postalCode) {
    locStatus = 'warning';
    locIssues.push('Physical address details incomplete');
  } else if (!loc.isAddressVerified) {
    locStatus = 'warning';
    locIssues.push('Address verification required for Schema');
  }

  if (!loc.phone) {
    locStatus = 'warning';
    locIssues.push('Missing NAP direct phone');
  }

  if (locStatus === 'complete') completeCount++;
  else if (locStatus === 'warning') warningCount++;
  else errorCount++;

  pageResults.push({ key: 'local-seo', name: 'Local SEO (Tamil Nadu)', status: locStatus, issues: locIssues });

  // Check Germany Confirmed International Market
  const ger = activeSeoCache.markets?.germany || {};
  let gerStatus = 'complete';
  const gerIssues = [];

  if (!ger.title || ger.title.length < 25) {
    gerStatus = 'warning';
    gerIssues.push('Germany SEO Title is too short');
  }
  if (!ger.description || ger.description.length < 50) {
    gerStatus = 'warning';
    gerIssues.push('Germany Meta Description is too short');
  }
  if (!ger.focusKeyword) {
    gerStatus = 'warning';
    gerIssues.push('Missing primary focus keyword');
  }

  if (gerStatus === 'complete') completeCount++;
  else if (gerStatus === 'warning') warningCount++;
  else errorCount++;

  pageResults.push({ key: 'market-germany', name: 'Germany 🇩🇪 (Confirmed Market)', status: gerStatus, issues: gerIssues });

  // Update counters
  const compEl = document.getElementById('audit-complete-count');
  const warnEl = document.getElementById('audit-warning-count');
  const errEl = document.getElementById('audit-error-count');
  const badgeEl = document.getElementById('seo-health-badge');

  if (compEl) compEl.textContent = completeCount;
  if (warnEl) warnEl.textContent = warningCount;
  if (errEl) errEl.textContent = errorCount;

  if (badgeEl) {
    if (errorCount > 0) {
      badgeEl.className = 'px-2 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold';
      badgeEl.textContent = `${errorCount} CRITICAL ERRORS`;
    } else if (warningCount > 0) {
      badgeEl.className = 'px-2 py-0.5 rounded-full bg-[#B39158] text-white font-mono text-[10px] font-bold';
      badgeEl.textContent = `${warningCount} WARNINGS`;
    } else {
      badgeEl.className = 'px-2 py-0.5 rounded-full bg-[#00742F] text-white font-mono text-[10px] font-bold';
      badgeEl.textContent = '100% HEALTHY';
    }
  }

  // Render Status Checklist Grid
  const checklistGrid = document.getElementById('seo-status-checklist');
  if (checklistGrid) {
    checklistGrid.innerHTML = pageResults.map(r => {
      let icon = 'check_circle';
      let badgeClass = 'bg-[#00742F]/10 text-[#00742F] border-[#00742F]/20';
      let label = '✓ Complete';

      if (r.status === 'warning') {
        icon = 'warning';
        badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
        label = '⚠ Missing';
      } else if (r.status === 'error') {
        icon = 'error';
        badgeClass = 'bg-red-50 text-red-700 border-red-200';
        label = '✕ Error';
      }

      return `
        <div class="p-3 rounded-xl border ${badgeClass} flex flex-col justify-between gap-1 shadow-2xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-xs text-primary truncate">${r.name}</span>
            <span class="material-symbols-outlined text-sm">${icon}</span>
          </div>
          <span class="font-mono text-[10px] font-bold uppercase">${label}</span>
          ${r.issues.length ? `<span class="text-[9px] text-on-surface-variant truncate" title="${r.issues.join('; ')}">${r.issues[0]}</span>` : '<span class="text-[9px] text-[#00742F]">All signals optimized</span>'}
        </div>
      `;
    }).join('');
  }

  if (interactive) {
    if (errorCount === 0) {
      showToast('SEO Audit Complete: Zero critical safety violations found!', 'success');
    } else {
      showToast(`SEO Audit Alert: ${errorCount} errors detected. Please check duplicate tags or canonicals.`, 'error');
    }
  }
}

async function saveCurrentSeoData() {
  const pageSelector = document.getElementById('seo-page-selector');
  const pageKey = pageSelector ? pageSelector.value : 'home';

  const pagePayload = {
    title: document.getElementById('seo-title')?.value.trim() || '',
    description: document.getElementById('seo-description')?.value.trim() || '',
    canonical: document.getElementById('seo-canonical')?.value.trim() || '',
    focusKeyword: document.getElementById('seo-focus-keyword')?.value.trim() || '',
    secondaryKeywords: document.getElementById('seo-secondary-keywords')?.value.trim() || '',
    robots: document.getElementById('seo-robots')?.value || 'index, follow',
    ogTitle: document.getElementById('seo-og-title')?.value.trim() || '',
    ogDescription: document.getElementById('seo-og-description')?.value.trim() || '',
    ogImage: document.getElementById('seo-og-image')?.value.trim() || ''
  };

  // Update in memory cache
  activeSeoCache.pages[pageKey] = pagePayload;

  // Also save current product if active
  const prodSelector = document.getElementById('seo-product-selector');
  if (prodSelector) {
    const prodKey = prodSelector.value;
    activeSeoCache.products[prodKey] = {
      title: document.getElementById('seo-prod-title')?.value.trim() || '',
      description: document.getElementById('seo-prod-description')?.value.trim() || '',
      keyword: document.getElementById('seo-prod-keyword')?.value.trim() || '',
      canonical: document.getElementById('seo-prod-canonical')?.value.trim() || ''
    };
  }

  // Save to Firestore via saveSeoMetadata
  const res = await saveSeoMetadata(pageKey, pagePayload);

  // Also save local SEO if populated
  if (activeSeoCache.local) {
    try {
      await saveSeoMetadata('local', activeSeoCache.local);
    } catch (e) {}
  }

  // Also save Germany confirmed market if populated
  if (activeSeoCache.markets?.germany) {
    try {
      await saveSeoMetadata('markets_germany', activeSeoCache.markets.germany);
    } catch (e) {}
  }

  // Also cache to localStorage for offline fallback
  try {
    localStorage.setItem('cococraft_seo_cache', JSON.stringify(activeSeoCache));
  } catch (e) {
    // Ignore storage quota
  }

  runSeoAudit(false);

  if (res.success) {
    showToast(`Global B2B, Local SEO & Germany Market configuration saved successfully.`, 'success');
  } else {
    showToast(`Saved to local session (Firestore: ${res.error || 'Offline baseline active'})`, 'info');
  }
}

export async function loadSeoData() {
  if (!state.currentUser) return;
  try {
    const cached = localStorage.getItem('cococraft_seo_cache');
    if (cached) {
      activeSeoCache = { ...activeSeoCache, ...JSON.parse(cached) };
    }
  } catch (e) {}

  // Fetch Firestore overrides for pages
  for (const pageKey of Object.keys(SEO_PAGE_BASELINES)) {
    try {
      const meta = await getSeoMetadata(pageKey);
      if (meta && meta.title) {
        activeSeoCache.pages[pageKey] = meta;
      }
    } catch (e) {}
  }

  // Fetch Local SEO override
  try {
    const localMeta = await getSeoMetadata('local');
    if (localMeta && localMeta.businessName) {
      activeSeoCache.local = { ...activeSeoCache.local, ...localMeta };
    }
  } catch (e) {}

  // Fetch Germany Confirmed Market override
  try {
    const gerMeta = await getSeoMetadata('markets_germany');
    if (gerMeta && gerMeta.title) {
      if (!activeSeoCache.markets) activeSeoCache.markets = {};
      activeSeoCache.markets.germany = { ...activeSeoCache.markets.germany, ...gerMeta };
    }
  } catch (e) {}

  loadPageSeoIntoForm('home');
  loadProductSeoIntoForm('5kg-cocopeat-blocks');
  renderLocalSeoTab();
  renderGermanySeoTab();
  runSeoAudit(false);
}

// 16. SETTINGS & BASELINE SYNC CONTROLLER
function initSettingsController() {
  const saveBtn = document.getElementById('save-settings-btn');
  const seedBtn = document.getElementById('seed-baseline-btn');

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const companyPayload = {
        companyName: document.getElementById('setting-company-name').value.trim(),
        plantAddress: document.getElementById('setting-plant-address').value.trim(),
        exportEmail: document.getElementById('setting-export-email').value.trim(),
        whatsappDesk: document.getElementById('setting-whatsapp').value.trim()
      };

      const cloudPayload = {
        cloudName: document.getElementById('setting-cloud-name')?.value.trim() || 'xbs3vpz1',
        uploadPreset: document.getElementById('setting-upload-preset')?.value.trim() || 'Cococrafts',
        folder: document.getElementById('setting-cloud-folder')?.value.trim() || 'Coco/Images'
      };

      await saveCompanySettings(companyPayload);
      await saveCloudinarySettings(cloudPayload);
      showToast('Settings saved successfully.', 'success');
    });
  }

  if (seedBtn) {
    seedBtn.addEventListener('click', async () => {
      showConfirmModal(
        'Synchronize Baseline Catalogue?',
        'This will populate your Firestore database with the 6 verified export products, initial categories, and company data from the public site.',
        async () => {
          seedBtn.disabled = true;
          const res = await seedBaselineCatalogueIfEmpty();
          seedBtn.disabled = false;
          if (res.seeded) {
            showToast(res.message, 'success');
            await loadAllCMSData();
          } else {
            showToast(res.message || res.error, 'info');
          }
        }
      );
    });
  }
}

export async function loadSettingsData() {
  if (!state.currentUser) return;
  const s = await getCompanySettings();
  if (s) {
    if (document.getElementById('setting-company-name')) document.getElementById('setting-company-name').value = s.companyName || 'Coco Craft Exports Pvt Ltd';
    if (document.getElementById('setting-plant-address')) document.getElementById('setting-plant-address').value = s.plantAddress || 'Pollachi, Coimbatore District, Tamil Nadu, 642001 India';
    if (document.getElementById('setting-export-email')) document.getElementById('setting-export-email').value = s.exportEmail || 'export@cococraftexports.com';
    if (document.getElementById('setting-whatsapp')) document.getElementById('setting-whatsapp').value = s.whatsappDesk || '+91 94880 12345';
  }

  const c = await getCloudinarySettings();
  if (document.getElementById('setting-cloud-name')) {
    document.getElementById('setting-cloud-name').value = (c && c.cloudName) ? c.cloudName : 'xbs3vpz1';
  }
  if (document.getElementById('setting-upload-preset')) {
    document.getElementById('setting-upload-preset').value = (c && c.uploadPreset) ? c.uploadPreset : 'Cococrafts';
  }
  if (document.getElementById('setting-cloud-folder')) {
    document.getElementById('setting-cloud-folder').value = (c && c.folder) ? c.folder : 'Coco/Images';
  }
}

// 17. AUDIT LOG CONTROLLER
async function renderAuditLogs() {
  const tbody = document.getElementById('audit-log-table-body');
  if (!tbody) return;

  const logs = await getAuditLogs(50);
  if (logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-on-surface-variant font-mono">No recent audit log entries.</td></tr>`;
    return;
  }

  tbody.innerHTML = logs.map(l => `
    <tr class="hover:bg-surface-container-low transition-colors">
      <td class="py-3 px-4 text-on-surface-variant">${l.createdAtIso ? l.createdAtIso.replace('T', ' ').substring(0, 19) : 'Recent'}</td>
      <td class="py-3 px-4 font-bold text-primary">${escapeHtml(l.adminEmail || 'admin')}</td>
      <td class="py-3 px-4"><span class="badge-status badge-active">${escapeHtml(l.action)}</span></td>
      <td class="py-3 px-4 text-secondary font-bold">${escapeHtml(l.entity)}</td>
      <td class="py-3 px-4 text-on-surface">${escapeHtml(l.details || '')}</td>
    </tr>
  `).join('');
}

/* ==========================================================================
   UTILITY HELPERS
   ========================================================================== */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
