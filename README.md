# Coco Craft Exports — International B2B Substrate Portal & CMS

> **Enterprise Grade Coconut Coir & Horticultural Substrates Export Platform**  
> Operational Origin: Pollachi, Tamil Nadu, India · Port of Loading: Tuticorin (V.O.C.) & Chennai

---

## 🌴 Project Overview

**Coco Craft Exports** is a high-performance, international B2B digital export portal and Headless CMS tailored for commercial greenhouse complexes, soil blenders, hydroponic growers, and industrial upholstery buyers worldwide.

The platform combines an Awwwards-inspired, kinetic frontend with a secure, real-time administrative CMS powered by **Firebase Firestore**, **Firebase Cloud Storage**, and **Cloudinary**.

---

## 📋 Table of Contents

1. [Contact Form & Container Requisition System](#-contact-form--container-requisition-system)
2. [Admin Panel & Full CRUD CMS Architecture](#-admin-panel--full-crud-cms-architecture)
3. [Products Page Features](#-products-page-features)
4. [AI Chatbot Assistant (Coco)](#-ai-chatbot-assistant-coco)
5. [Storage & Media Management](#-storage--media-management)
6. [Local Development & Production Build](#-local-development--production-build)
7. [Deployment & Security Rules](#-deployment--security-rules)

---

## 📨 Contact Form & Container Requisition System

### Problem Resolved
In earlier builds, testing the contact form appeared non-functional because a legacy dummy event handler intercepted submissions with an unlinked `setTimeout()` simulation rather than transmitting records to the database.

### Comprehensive Solution Implemented
1. **Direct Firestore Integration**:
   - Form submissions on both the Contact page (`src/contact/contact.html`) and Homepage (`src/index.html`) are now orchestrated by `src/scripts/cms-bridge.js`.
   - Submissions validate all required fields (`name`, `email`, `destinationPort`, `substrate`, `volume`, `incoterm`) and invoke `submitPublicEnquiry()` from `src/scripts/firebase-service.js`.
   - Creates a new document in the Firestore `enquiries` collection tagged with status `'New'` and timestamped via `serverTimestamp()`.

2. **Interactive Submission Confirmation Modal (`#rfq-confirmation-modal`)**:
   - Displays immediately upon submission with a smooth backdrop blur and scale transition.
   - **Unique Reference ID**: Automatically generated (e.g. `CCE-REQ-2026-4819`) with a 1-click **Copy to Clipboard** button.
   - **Requisition Summary**: Details requester name, company/greenhouse, selected substrate and container volume, destination port, and Incoterm.
   - **One-Tap WhatsApp Fast-Track**: Direct link to the Tamil Nadu Export Desk WhatsApp (`+91 94880 12345`) with a pre-formatted message including the Reference ID for priority quotation processing.
   - **Offline Resilience Queue**: If network connectivity drops or Firebase is temporarily unreachable, the inquiry is safely cached to `localStorage` (`cce_offline_enquiries`), generates a valid reference code, and displays the confirmation modal without interruption.

3. **Admin CRM Inquiries Desk**:
   - Access via `/admin/index.html` → **Inquiries** tab.
   - Operators can review incoming RFQs, filter by status (`New`, `Contacted`, `In Progress`, `Completed`, `Archived`), record internal notes, and track communication timelines.

---

## 🛠 Admin Panel & Full CRUD CMS Architecture

All core frontend data displayed across the public website is fully synchronized with Firestore and editable via the Administrative CMS Terminal (`/admin/index.html`):

### 1. Products CRUD
- **Path**: Admin Sidebar → **Products**
- **Capabilities**:
  - Add new export products or modify existing substrates.
  - Update product titles, marketing copy, and detailed horticultural descriptions.
  - Adjust technical specifications: EC rating, pH spectrum, volumetric expansion yield, moisture levels, chip sizes, and packaging details.
  - Set product status (`Active` / `Draft`), featured flags, and drag-and-drop sort order.
  - Changes are dynamically applied in real-time to `/products/products.html` via `src/scripts/cms-bridge.js`.

### 2. Website Content & Copywriting CRUD
- **Path**: Admin Sidebar → **Website Content**
- **Capabilities**:
  - Update Homepage Hero H1 headlines, cinematic promo video URLs, and narrative taglines.
  - Adjust export highlights, production statistics, and factory capacity figures.

### 3. Company Profile & Export Desk Settings
- **Path**: Admin Sidebar → **Settings** → **Company Profile**
- **Capabilities**:
  - Update corporate phone numbers, global procurement emails, direct WhatsApp numbers, and factory addresses.
  - Changes instantly cascade across the global header, contact info cards, and footer sections across all pages.

### 4. Categories, Applications & Sustainability CRUD
- Manage crop categories, commercial growing applications (Tomatoes, Berries, Cannabis/Hemp, Cucumbers), 6-stage manufacturing workflows, ESG sustainability pillars, and international quality certifications.

---

## 📦 Products Page Features

### 1. Top Packaging Formats Infinite Marquee
- **Location**: Prominently repositioned right beneath the Hero banner (`#packing-formats` at the top of `/products/products.html`).
- **Smooth Infinite Motion**: Continuous, seamless horizontal scrolling moving from right to left across all standardized packaging formats:
  1. `BULK`
  2. `LAY-FLAT BAGS`
  3. `NAKED SLABS`
  4. `OPEN TOP`
  5. `CUBES`
- **Generous Spacing**: Configured with `gap: 3.5rem` (56px) for an airy, premium look.
- **Micro-Interactions**: Automatically pauses marquee scroll when the user hovers over any card; cards feature subtle elevation and green border hover accents.

### 2. Search & Category Filter Bar
- **Location**: Sticky navigation bar pinned during scroll on `/products/products.html`.
- **Search Field**:
  - Placeholder: `"Search products by title or specs..."`
  - Real-time client-side search indexing product titles, technical specs (EC, pH, expansion, moisture), and descriptions.
  - Includes a 1-click clear search button (`close` icon).
- **Category Filter Pills**:
  - `All Products`
  - `Cocopeat Blocks`
  - `Coir Grow Bags`
  - `Husk Chips`
  - `Briquettes`
  - `Coir Fiber`
- **Live Counter**: Dynamically displays result count (e.g. `Showing 6 Products`).
- **Empty State**: Displays an intuitive empty search message with a **"Reset All Filters"** button when no matching products are found.

### 3. Interactive Substrate Yield Calculator
- Calculate container capacity, total expansion liters, cubic meters, metric tons, and freshwater soak requirements based on pallet quantities.

---

## 🤖 AI Chatbot Assistant (Coco)

### Live Server Fix
- **Issue**: On the live deployment, a `ReferenceError: initSmoothAnchorScrolling is not defined` occurred inside `src/scripts/app-experience.js`. Because Vite bundled shared dependencies together, this runtime exception prevented subsequent initialization steps—including `initCocoChat()`—from executing.
- **Fix Applied**:
  1. Implemented `initSmoothAnchorScrolling()` for anchor link smooth scrolling.
  2. Wrapped every initialization module inside a `safeInit()` boundary, ensuring any non-critical script failure can never break the AI Chatbot or core page functions.
  3. Added element deduplication guards and isolated scroll event handlers (`data-lenis-prevent="true"`) to `src/scripts/coco-chat.js`.

---

## ☁ Storage & Media Management

The platform supports a dual-provider cloud media pipeline:
1. **Firebase Cloud Storage**: Direct modular integration (`uploadBytesResumable`, `getDownloadURL`, `deleteObject`) saving files directly to Google Cloud infrastructure (`Coco/Images/` and `Coco/Videos/`).
2. **Cloudinary**: Alternative fast CDN image and video pipeline.
- Admins can select their preferred storage target directly from the Media Library upload modal in `/admin/index.html`.

---

## 🚀 Local Development & Production Build

### Prerequisites
- Node.js 20+ (LTS)
- npm 10+

### Setup Commands

```bash
# 1. Install dependencies
npm install

# 2. Start local development server (http://localhost:3000)
npm run dev

# 3. Compile optimized production distribution
npm run build

# 4. Preview compiled production build locally
npm run preview
```

---

## 🔒 Deployment & Security Rules

- **Firestore Rules (`firestore.rules`)**:
  - Public visitors have `create` permissions on `/enquiries/{enquiryId}` with strict field-length validations and status forced to `'New'`.
  - Public visitors have `read` permissions on published catalogue collections (`products`, `categories`, `gallery`, `videos`, `applications`, `manufacturing`, `sustainability`).
  - All write and update operations on products, media, and settings require administrator authentication (`isAdmin()`).
- **Cloudflare / GitHub Pages**:
  - Automatic production builds deploy via GitHub Actions on push to `main`.
