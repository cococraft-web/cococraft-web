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
    { country: 'The Netherlands', port: 'Port of Rotterdam', desc: 'Direct supply to European glasshouse horticulture distributors.' },
    { country: 'United States', port: 'Port of Long Beach / New York', desc: 'Hydroponic substrate distribution across commercial berry and cannabis growers.' },
    { country: 'United Kingdom', port: 'Port of Felixstowe', desc: 'Commercial growing media and retail potting coir briquettes.' },
    { country: 'Japan & South Korea', port: 'Tokyo / Busan Port', desc: 'Triple-washed low EC cocopeat blocks for precision strawberry horticulture.' }
  ];

  grid.innerHTML = destinations.map(d => `
    <div class="admin-card p-5 flex flex-col justify-between gap-3">
      <div>
        <span class="font-mono text-[10px] text-secondary font-bold uppercase">${escapeHtml(d.port)}</span>
        <h4 class="font-bold text-base text-primary font-headings mt-0.5">${escapeHtml(d.country)}</h4>
        <p class="text-xs text-on-surface-variant mt-1">${escapeHtml(d.desc)}</p>
      </div>
      <span class="badge-status badge-active w-fit">ACTIVE TRADE ROUTE</span>
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

// 15. SEO MANAGEMENT CONTROLLER
function initSeoController() {
  const pageSelector = document.getElementById('seo-page-selector');
  const saveBtn = document.getElementById('save-seo-btn');

  const loadSeoForPage = async (pageName) => {
    const meta = await getSeoMetadata(pageName);
    if (meta) {
      document.getElementById('seo-title').value = meta.title || '';
      document.getElementById('seo-description').value = meta.description || '';
      document.getElementById('seo-canonical').value = meta.canonical || '';
      document.getElementById('seo-robots').value = meta.robots || 'index, follow';
      document.getElementById('seo-og-image').value = meta.ogImage || '';
    } else {
      document.getElementById('seo-title').value = `Coco Craft Exports | Sustainable Coir & Coconut Substrates (${pageName.toUpperCase()})`;
      document.getElementById('seo-description').value = 'Leading Indian manufacturer and exporter of premium coconut coir substrates, 5kg blocks, grow bags, and natural fibre based in Pollachi, Tamil Nadu.';
      document.getElementById('seo-canonical').value = `https://cococraftexports.com/${pageName === 'home' ? '' : pageName}`;
      document.getElementById('seo-robots').value = 'index, follow';
      document.getElementById('seo-og-image').value = '/assets/products/5kg-block.jpg';
    }
  };

  if (pageSelector) {
    pageSelector.addEventListener('change', (e) => loadSeoForPage(e.target.value));
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const page = pageSelector.value;
      const payload = {
        title: document.getElementById('seo-title').value.trim(),
        description: document.getElementById('seo-description').value.trim(),
        canonical: document.getElementById('seo-canonical').value.trim(),
        robots: document.getElementById('seo-robots').value,
        ogImage: document.getElementById('seo-og-image').value.trim()
      };

      const res = await saveSeoMetadata(page, payload);
      if (res.success) {
        showToast(`SEO settings for ${page} updated successfully.`, 'success');
      } else {
        showToast('Failed to save SEO: ' + res.error, 'error');
      }
    });
  }
}

export async function loadSeoData() {
  if (!state.currentUser) return;
  const pageSelector = document.getElementById('seo-page-selector');
  const page = pageSelector ? pageSelector.value : 'home';
  const meta = await getSeoMetadata(page);
  if (meta) {
    if (document.getElementById('seo-title')) document.getElementById('seo-title').value = meta.title || '';
    if (document.getElementById('seo-description')) document.getElementById('seo-description').value = meta.description || '';
    if (document.getElementById('seo-canonical')) document.getElementById('seo-canonical').value = meta.canonical || '';
    if (document.getElementById('seo-robots')) document.getElementById('seo-robots').value = meta.robots || 'index, follow';
    if (document.getElementById('seo-og-image')) document.getElementById('seo-og-image').value = meta.ogImage || '';
  }
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
