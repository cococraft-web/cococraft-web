/**
 * COCO CRAFT EXPORTS — FIREBASE SERVICES MODULE
 * Direct modular integration for Authentication, Firestore CMS database, Analytics, and Cloudinary Media
 */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// Official Production Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCa4GbZR2J2iHLfjN_Hwyi1kVc23YurCf0",
  authDomain: "coco-craft-exports.firebaseapp.com",
  projectId: "coco-craft-exports",
  storageBucket: "coco-craft-exports.firebasestorage.app",
  messagingSenderId: "728707884391",
  appId: "1:728707884391:web:e14fe05f6473002f6abbc2",
  measurementId: "G-GW0HML83XS"
};

// Singleton App & Services
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

// Optional Analytics (Gracefully handled if blocked by browser privacy)
try {
  import("https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js")
    .then(({ getAnalytics }) => getAnalytics(app))
    .catch(() => {});
} catch (_) {}

/* ==========================================================================
   AUTHENTICATION API
   ========================================================================== */

/**
 * Sign in admin user with email and password
 */
export async function adminLogin(email, password, remember = true) {
  try {
    const persistenceMode = remember ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistenceMode);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await logAuditEvent({
      action: 'LOGIN',
      entity: 'AUTH',
      entityId: userCredential.user.uid,
      details: `Admin ${email} signed in successfully`
    });
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Authentication Error:', error);
    let message = 'Invalid email or password. Please verify your credentials.';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      message = 'Invalid email or password.';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Too many failed login attempts. Please wait a few moments.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Please provide a valid administrative email.';
    }
    return { success: false, error: message, code: error.code };
  }
}

/**
 * Sign out current admin user
 */
export async function adminLogout() {
  try {
    const user = auth.currentUser;
    if (user) {
      await logAuditEvent({
        action: 'LOGOUT',
        entity: 'AUTH',
        entityId: user.uid,
        details: `Admin ${user.email} signed out`
      });
    }
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Subscribe to authentication state changes
 */
export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

/* ==========================================================================
   AUDIT LOGGING API
   ========================================================================== */

export async function logAuditEvent({ action, entity, entityId = '', details = '' }) {
  try {
    const user = auth.currentUser;
    const logRef = collection(db, 'audit_logs');
    await addDoc(logRef, {
      adminEmail: user ? user.email : 'System/Anonymous',
      adminUid: user ? user.uid : 'anon',
      action,
      entity,
      entityId,
      details,
      timestamp: serverTimestamp(),
      createdAtIso: new Date().toISOString()
    });
  } catch (err) {
    // Non-blocking log failure
    console.warn('Audit logging skipped or offline:', err.message);
  }
}

export async function getAuditLogs(max = 50) {
  try {
    const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(max));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Failed to load audit logs:', err);
    return [];
  }
}

/* ==========================================================================
   GENERIC FIRESTORE CRUD HELPERS
   ========================================================================== */

export async function getCollectionItems(collectionName, orderField = 'sortOrder', direction = 'asc') {
  try {
    const colRef = collection(db, collectionName);
    let q;
    try {
      q = query(colRef, orderBy(orderField, direction));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (_) {
      // Fallback if index on orderField doesn't exist yet
      const snap = await getDocs(colRef);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn(`Firestore getCollectionItems(${collectionName}) warning:`, err.message);
    return [];
  }
}

export async function getDocumentById(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (err) {
    console.error(`Error getting document ${collectionName}/${docId}:`, err);
    return null;
  }
}

export async function saveDocument(collectionName, docId, data, isNew = false) {
  try {
    const payload = {
      ...data,
      updatedAt: serverTimestamp(),
      updatedAtIso: new Date().toISOString()
    };

    if (isNew) {
      payload.createdAt = serverTimestamp();
      payload.createdAtIso = new Date().toISOString();
    }

    if (docId) {
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, payload, { merge: true });
      await logAuditEvent({
        action: isNew ? 'CREATE' : 'UPDATE',
        entity: collectionName.toUpperCase(),
        entityId: docId,
        details: `${isNew ? 'Created' : 'Updated'} item in ${collectionName}`
      });
      return { success: true, id: docId };
    } else {
      const colRef = collection(db, collectionName);
      const res = await addDoc(colRef, payload);
      await logAuditEvent({
        action: 'CREATE',
        entity: collectionName.toUpperCase(),
        entityId: res.id,
        details: `Created new item in ${collectionName}`
      });
      return { success: true, id: res.id };
    }
  } catch (err) {
    console.error(`Error saving document in ${collectionName}:`, err);
    return { success: false, error: err.message };
  }
}

export async function deleteDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    await logAuditEvent({
      action: 'DELETE',
      entity: collectionName.toUpperCase(),
      entityId: docId,
      details: `Deleted item ${docId} from ${collectionName}`
    });
    return { success: true };
  } catch (err) {
    console.error(`Error deleting document ${collectionName}/${docId}:`, err);
    return { success: false, error: err.message };
  }
}

/* ==========================================================================
   PUBLIC RFQ & ENQUIRIES API
   ========================================================================== */

/**
 * Public website inquiry submission
 */
export async function submitPublicEnquiry(enquiryData) {
  try {
    const colRef = collection(db, 'enquiries');
    const referenceId = `CCE-REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const payload = {
      referenceId,
      type: enquiryData.type || 'Quote Request',
      name: enquiryData.name || '',
      email: enquiryData.email || '',
      company: enquiryData.company || '',
      phone: enquiryData.phone || '',
      country: enquiryData.country || '',
      destinationPort: enquiryData.destinationPort || '',
      substrate: enquiryData.substrate || '',
      volume: enquiryData.volume || '',
      incoterm: enquiryData.incoterm || 'FOB',
      message: enquiryData.message || enquiryData.notes || '',
      status: 'New', // New, Contacted, In Progress, Completed, Archived
      internalNotes: '',
      submittedAt: serverTimestamp(),
      submittedAtIso: new Date().toISOString()
    };

    const res = await addDoc(colRef, payload);
    return { success: true, id: res.id, referenceId };
  } catch (err) {
    console.error('Error submitting public enquiry:', err);
    return { success: false, error: err.message };
  }
}

export async function updateEnquiryStatus(enquiryId, status, internalNote = null) {
  try {
    const docRef = doc(db, 'enquiries', enquiryId);
    const updateData = {
      status,
      updatedAt: serverTimestamp()
    };
    if (internalNote !== null) {
      updateData.internalNotes = internalNote;
    }
    await updateDoc(docRef, updateData);
    await logAuditEvent({
      action: 'UPDATE_STATUS',
      entity: 'ENQUIRIES',
      entityId: enquiryId,
      details: `Enquiry status changed to ${status}`
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/* ==========================================================================
   WEBSITE CONTENT & SETTINGS GETTERS / SETTERS
   ========================================================================== */

export async function getWebsiteSection(sectionName) {
  return await getDocumentById('website_content', sectionName);
}

export async function saveWebsiteSection(sectionName, content) {
  return await saveDocument('website_content', sectionName, content);
}

export async function getSeoMetadata(pageName) {
  return await getDocumentById('seo', pageName);
}

export async function saveSeoMetadata(pageName, data) {
  return await saveDocument('seo', pageName, data);
}

export async function getCompanySettings() {
  return await getDocumentById('settings', 'company_profile');
}

export async function saveCompanySettings(data) {
  return await saveDocument('settings', 'company_profile', data);
}

export async function getCloudinarySettings() {
  return await getDocumentById('settings', 'cloudinary_config');
}

export async function saveCloudinarySettings(data) {
  return await saveDocument('settings', 'cloudinary_config', data);
}

/* ==========================================================================
   BASELINE DATA SYNC / SEEDER (Zero-Assumption, from existing catalogue)
   ========================================================================== */

export async function seedBaselineCatalogueIfEmpty() {
  try {
    const existing = await getCollectionItems('products');
    if (existing && existing.length > 0) {
      return { seeded: false, message: 'Catalogue already populated in Firestore.' };
    }

    // Baseline 6 export products
    const initialProducts = [
      {
        id: 'cocopeat-5kg-blocks',
        title: '5kg Cocopeat Blocks (Low EC / Washed)',
        slug: '5kg-cocopeat-blocks',
        category: 'Cocopeat Blocks',
        shortDescription: 'Uniformly compressed, high-expansion coco peat blocks for global commercial horticulture.',
        fullDescription: 'Manufactured from aged coconut husks in Pollachi, Tamil Nadu. Thoroughly desalted with fresh river water, triple-sieved through 6mm rotary trommels, and compressed at 5:1 volume ratio. Certified phytosanitary compliance.',
        mainImage: '/assets/products/5kg-block.jpg',
        galleryImages: ['/assets/gallery/drying-yards.jpg', '/assets/gallery/hydraulic-press.jpg'],
        status: 'Active',
        sortOrder: 1,
        featured: true,
        specifications: {
          blockWeight: '5.0 kg (+/- 200g)',
          compressionRatio: '5 : 1',
          expansionVolume: '70 to 75 Liters',
          electricalConductivity: '< 0.5 mS/cm (1:1.5 extraction)',
          phRange: '5.8 to 6.8',
          moistureLevel: '< 18% Natural Cure',
          packaging: 'Palletized (240 blocks/pallet) or Bare Loaded'
        }
      },
      {
        id: 'coir-grow-bags',
        title: 'Commercial Coir Grow Bags (Slabs)',
        slug: 'coir-grow-bags',
        category: 'Coir Grow Bags',
        shortDescription: 'Ready-to-use hydroponic substrate slabs in UV-treated dual-layer polyethylene sleeves.',
        fullDescription: 'Engineered specifically for greenhouse cultivation of tomatoes, cucumbers, peppers, strawberries, and medicinal crops. Features pre-cut plant and dripper holes with optional pre-drilled bottom drainage slits.',
        mainImage: '/assets/products/grow-bag.jpg',
        galleryImages: ['/assets/gallery/growbag-slabs.jpg'],
        status: 'Active',
        sortOrder: 2,
        featured: true,
        specifications: {
          slabDimensions: '100 x 15 x 12 cm (Custom available)',
          blendRatio: '70% Pith / 30% Husk Chips',
          uvSleeve: 'Co-extruded White/Black Polyethylene (3 Years UV)',
          electricalConductivity: '< 0.8 mS/cm',
          airFilledPorosity: '20% to 25%',
          waterRetention: '8.5 to 9.5 times dry weight',
          packaging: 'Stacked on heat-treated pallets'
        }
      },
      {
        id: 'coconut-husk-chips',
        title: 'Premium Coconut Husk Chips (5kg / Slabs)',
        slug: 'coconut-husk-chips',
        category: 'Husk Chips',
        shortDescription: 'Uniformly sliced coconut husk cubes ensuring maximum aeration and root oxygenation.',
        fullDescription: 'High-aeration organic substrate for orchid nurseries, anthurium cultivation, and heavy root-density soil amendment. Free from foreign matter and fungal pathogens.',
        mainImage: '/assets/products/husk-chips.jpg',
        galleryImages: ['/assets/gallery/trommel-screen.jpg'],
        status: 'Active',
        sortOrder: 3,
        featured: false,
        specifications: {
          chipSizes: '8mm - 12mm / 12mm - 18mm',
          blockWeight: '5.0 kg Compressed Block',
          airPorosity: '40% - 45%',
          electricalConductivity: '< 0.7 mS/cm',
          packaging: 'Palletized with Corner Edge Protectors'
        }
      },
      {
        id: 'coir-briquettes-650g',
        title: '650g Compact Coir Briquettes',
        slug: '650g-coir-briquettes',
        category: 'Coir Briquettes',
        shortDescription: 'Consumer-retail ready 650g bricks expanding to 9 liters of fluffy growing medium.',
        fullDescription: 'Ideal for home gardening, retail nursery distribution, indoor potting soil base, and small-batch seed propagation.',
        mainImage: '/assets/products/briquette.jpg',
        galleryImages: [],
        status: 'Active',
        sortOrder: 4,
        featured: false,
        specifications: {
          weight: '650 grams (+/- 30g)',
          expansionVolume: '8.5 to 9.0 Liters',
          dimensions: '20 x 10 x 5 cm',
          ec: '< 0.5 mS/cm',
          packaging: 'Individual Shrink Wrap with Custom Color Label'
        }
      },
      {
        id: 'raw-coir-fiber-bales',
        title: 'Raw Coir Fibre Bales (Mattress & Bristle)',
        slug: 'raw-coir-fiber-bales',
        category: 'Coir Fiber',
        shortDescription: 'High-tensile industrial golden coconut fibre mechanically extracted and baled.',
        fullDescription: 'Industrial grade natural coconut fiber used in mattress cores, erosion control geotextiles, insulation padding, and automotive seat cushioning.',
        mainImage: '/assets/products/coir-fiber.jpg',
        galleryImages: ['/assets/gallery/pallet-shipping.jpg'],
        status: 'Active',
        sortOrder: 5,
        featured: false,
        specifications: {
          baleWeight: '120 kg to 140 kg Hydraulic Compressed',
          fibreLength: '5cm to 25cm Long Staple',
          moisture: '< 15%',
          impurities: '< 3% Dust/Short fibres',
          strapping: 'Rust-proof High-Tension Plastic/Steel Strapping'
        }
      },
      {
        id: 'coir-geotextiles-erosion',
        title: 'Woven Coir Geotextile Mesh (Erosion Blankets)',
        slug: 'coir-geotextiles-erosion',
        category: 'Coir Fiber',
        shortDescription: '100% biodegradable woven open-mesh blankets for soil slope stabilization and civil projects.',
        fullDescription: 'Heavy-duty coir twine woven geotextile rolls designed for riverbank reinforcement, mine reclamation, and hillside soil erosion prevention.',
        mainImage: '/assets/gallery/drying-yards.jpg',
        galleryImages: [],
        status: 'Active',
        sortOrder: 6,
        featured: false,
        specifications: {
          meshDensity: '400 GSM / 700 GSM / 900 GSM',
          rollWidth: '1 Meter, 2 Meters, 4 Meters',
          rollLength: '50 Meters Standard',
          fieldLife: '3 to 5 Years Natural Biodegradation'
        }
      }
    ];

    for (const p of initialProducts) {
      await saveDocument('products', p.id, p, true);
    }

    // Baseline Categories
    const initialCategories = [
      { id: 'cat-blocks', name: 'Cocopeat Blocks', slug: 'cocopeat-blocks', description: '5kg compressed high expansion substrate blocks', status: 'Active', sortOrder: 1 },
      { id: 'cat-growbags', name: 'Coir Grow Bags', slug: 'coir-grow-bags', description: 'Commercial greenhouse slab sleeves', status: 'Active', sortOrder: 2 },
      { id: 'cat-chips', name: 'Husk Chips', slug: 'husk-chips', description: 'Cubed aeration medium and orchid substrate', status: 'Active', sortOrder: 3 },
      { id: 'cat-briquettes', name: 'Coir Briquettes', slug: 'coir-briquettes', description: '650g consumer retail briquettes', status: 'Active', sortOrder: 4 },
      { id: 'cat-fiber', name: 'Coir Fiber', slug: 'coir-fiber', description: 'Industrial grade baled mattress and bristle coir fibre', status: 'Active', sortOrder: 5 }
    ];

    for (const c of initialCategories) {
      await saveDocument('categories', c.id, c, true);
    }

    // Baseline Company Profile
    await saveCompanySettings({
      companyName: 'Coco Craft Exports Pvt Ltd',
      legalEntity: 'Private Limited Company (CIN: Certified)',
      plantAddress: 'Pollachi, Coimbatore District, Tamil Nadu, 642001 India',
      exportEmail: 'export@cococraftexports.com',
      procurementEmail: 'procurement@cococraftexports.com',
      plantPhone: '+91 (4259) 298-410',
      whatsappDesk: '+91 94880 12345',
      exportPort: 'V.O.C. Port, Tuticorin (180 km / 4 hours from plant)',
      socialLinks: {
        linkedin: 'https://linkedin.com/company/cococraftexports',
        whatsapp: 'https://wa.me/919488012345',
        youtube: 'https://youtube.com/@cococraftexports',
        facebook: 'https://facebook.com/cococraftexports'
      }
    });

    return { seeded: true, message: 'Successfully seeded baseline catalogue into Firestore.' };
  } catch (err) {
    console.error('Error seeding baseline catalogue:', err);
    return { seeded: false, error: err.message };
  }
}
