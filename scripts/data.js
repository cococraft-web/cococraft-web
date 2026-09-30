/**
 * COCO CRAFT EXPORTS — Master Structured Data Store
 * CMS-Ready Architecture: Decoupled from HTML/CSS
 * Governed by Zero-Assumption B2B Fact Validation Standard
 */

export const siteConfig = {
  name: "COCO CRAFT EXPORTS",
  origin: "Tamil Nadu, India",
  tagline: "FROM COCONUT TO GLOBAL GROWTH.",
  description: "Coconut-based manufacturing and export solutions crafted with precision for global markets.",
  seoTitle: "COCO CRAFT EXPORTS | Coconut-Based Manufacturing & Export",
  seoDescription: "COCO CRAFT EXPORTS is a coconut-based manufacturing and export company from Tamil Nadu, India. Explore our products, manufacturing capabilities and global business enquiries.",
  contactPlaceholder: {
    location: "Tamil Nadu, India",
    email: "enquiry@cococraftexports.com",
    phone: "+91 [CONTACT NUMBER]",
    whatsapp: "+91 [WHATSAPP NUMBER]",
    exportDesk: "International Trade Desk — Tamil Nadu, India"
  }
};

// Generic CMS-Ready Product Structure
export const products = [
  {
    id: "prod-01",
    slug: "product-category-01",
    category: "PRODUCT CATEGORY 01",
    name: "[CLIENT PRODUCT NAME 01]",
    shortDesc: "Engineered coconut-based substrate manufactured for commercial agriculture and export markets.",
    fullDesc: "[CLIENT PRODUCT DESCRIPTION: Detailed description to be populated once official product sheets are confirmed.]",
    image: "https://images.unsplash.com/photo-1592417817098-8f3d69102a49?auto=format&fit=crop&w=1200&q=80",
    specs: [
      { label: "Material Composition", value: "[CLIENT DATA REQUIRED]" },
      { label: "Grade / Size", value: "[CLIENT DATA REQUIRED]" },
      { label: "Moisture Content", value: "[CLIENT DATA REQUIRED]" },
      { label: "Compression Ratio", value: "[CLIENT DATA REQUIRED]" },
      { label: "Standard Format", value: "[CLIENT DATA REQUIRED]" }
    ],
    packaging: [
      { type: "Standard Export Packaging", details: "[CLIENT PACKAGING OPTION TO BE CONFIRMED]" },
      { type: "Container Loading", details: "[CONTAINER CAPACITY TO BE CONFIRMED]" }
    ],
    applications: ["Commercial Agriculture", "Growing Media", "Substrate Blend"],
    featured: true
  },
  {
    id: "prod-02",
    slug: "product-category-02",
    category: "PRODUCT CATEGORY 02",
    name: "[CLIENT PRODUCT NAME 02]",
    shortDesc: "High-grade natural coconut fibre processed for industrial, erosion control, and commercial uses.",
    fullDesc: "[CLIENT PRODUCT DESCRIPTION: Detailed specifications to be provided by client.]",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
    specs: [
      { label: "Fibre Grade", value: "[CLIENT DATA REQUIRED]" },
      { label: "Impurity Ratio", value: "[CLIENT DATA REQUIRED]" },
      { label: "Bale Weight", value: "[CLIENT DATA REQUIRED]" },
      { label: "Moisture Level", value: "[CLIENT DATA REQUIRED]" }
    ],
    packaging: [
      { type: "Hydraulic Compressed Bales", details: "[CLIENT PACKAGING OPTION TO BE CONFIRMED]" },
      { type: "Export Palletization", details: "[CONTAINER CAPACITY TO BE CONFIRMED]" }
    ],
    applications: ["Industrial Application", "Soil Conditioning", "Erosion Control"],
    featured: true
  },
  {
    id: "prod-03",
    slug: "product-category-03",
    category: "PRODUCT CATEGORY 03",
    name: "[CLIENT PRODUCT NAME 03]",
    shortDesc: "Precision processed coconut husk material prepared for specialized horticultural substrates.",
    fullDesc: "[CLIENT PRODUCT DESCRIPTION: Awaiting client data.]",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=1200&q=80",
    specs: [
      { label: "Chip / Particle Size", value: "[CLIENT DATA REQUIRED]" },
      { label: "Sieve Mesh Range", value: "[CLIENT DATA REQUIRED]" },
      { label: "Packing Specification", value: "[CLIENT DATA REQUIRED]" }
    ],
    packaging: [
      { type: "Bulk Bales / Custom Bags", details: "[CLIENT PACKAGING OPTION TO BE CONFIRMED]" }
    ],
    applications: ["Orchids & Floriculture", "Hydroponic Mixes", "Mulch & Bedding"],
    featured: false
  }
];

// Structural Placeholder Applications
export const applications = [
  {
    id: "app-01",
    title: "Vegetables & Hydroponics",
    subtitle: "Commercial Greenhouse Cultivation",
    desc: "Engineered root media providing balanced aeration and moisture retention for precision crops.",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
    status: "[STRUCTURAL PLACEHOLDER]"
  },
  {
    id: "app-02",
    title: "Commercial Nurseries",
    subtitle: "Seedling Propagation & Potting",
    desc: "Consistent substrate blends tailored to support early root propagation and healthy seedling vigor.",
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80",
    status: "[STRUCTURAL PLACEHOLDER]"
  },
  {
    id: "app-03",
    title: "Soft Fruits & Berries",
    subtitle: "High-Yield Precision Media",
    desc: "Uniform drainage dynamics adapted for intensive soft fruit irrigation cycles.",
    image: "https://images.unsplash.com/photo-1518635017498-87f514b751ba?auto=format&fit=crop&w=800&q=80",
    status: "[STRUCTURAL PLACEHOLDER]"
  },
  {
    id: "app-04",
    title: "Landscaping & Erosion Control",
    subtitle: "Environmental Civil Works",
    desc: "Durable natural fibre mats and blankets engineered for soil stabilization and slope revegetation.",
    image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80",
    status: "[STRUCTURAL PLACEHOLDER]"
  },
  {
    id: "app-05",
    title: "Soil Conditioning",
    subtitle: "Soil Regeneration & Turf Management",
    desc: "Natural organic amendment improving structure, microbial porosity, and water efficiency in native soils.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    status: "[STRUCTURAL PLACEHOLDER]"
  },
  {
    id: "app-06",
    title: "Custom Substrate Blends",
    subtitle: "OEM Tailored Specifications",
    desc: "Custom formulation capabilities matching unique distributor and agricultural importer requirements.",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80",
    status: "[STRUCTURAL PLACEHOLDER]"
  }
];

// Neutral 6-Stage Manufacturing Process
export const manufacturingSteps = [
  {
    step: "01",
    title: "RAW MATERIAL",
    subtitle: "Sourcing & Sorting",
    desc: "[CLIENT PROCESS INFORMATION: Natural coconut husks received from verified regional suppliers across Tamil Nadu.]",
    tag: "ORIGIN"
  },
  {
    step: "02",
    title: "PROCESSING",
    subtitle: "Separation & Fibre Extraction",
    desc: "[CLIENT PROCESS INFORMATION: Mechanized separation of long fibres and pith material under controlled factory standards.]",
    tag: "EXTRACTION"
  },
  {
    step: "03",
    title: "PROCESS STAGE",
    subtitle: "Screening & Preparation",
    desc: "[CLIENT PROCESS INFORMATION: Sifting and drying protocols carried out according to target specifications.]",
    tag: "PREPARATION"
  },
  {
    step: "04",
    title: "QUALITY CONTROL",
    subtitle: "Multi-Point Inspection",
    desc: "[CLIENT PROCESS INFORMATION: Routine batch evaluation ensuring compliance with target moisture, particle size, and consistency.]",
    tag: "INSPECTION"
  },
  {
    step: "05",
    title: "PACKAGING",
    subtitle: "Compression & Baling",
    desc: "[CLIENT PROCESS INFORMATION: High-pressure hydraulic baling, shrink-wrap protection, and container palletization.]",
    tag: "EXPORT PACKING"
  },
  {
    step: "06",
    title: "DISPATCH",
    subtitle: "Global Container Loading",
    desc: "[CLIENT PROCESS INFORMATION: Careful container stuffing and documentation dispatch for international freight.]",
    tag: "EXPORT READY"
  }
];

// Neutral Sustainability Pillars (Zero Unverified Claims)
export const sustainabilityPillars = [
  {
    num: "01",
    title: "RESPONSIBLE RESOURCE USE",
    desc: "[CLIENT INFORMATION REQUIRED: Utilizing 100% natural coconut byproducts to produce commercial value without depleting non-renewable materials.]"
  },
  {
    num: "02",
    title: "RESOURCE MANAGEMENT",
    desc: "[CLIENT INFORMATION REQUIRED: Conscious operational stewardship focused on water, power, and land resource efficiency.]"
  },
  {
    num: "03",
    title: "PROCESS EFFICIENCY",
    desc: "[CLIENT INFORMATION REQUIRED: Modern production workflows designed to minimize mechanical energy loss and optimize throughput.]"
  },
  {
    num: "04",
    title: "SUSTAINABILITY PRACTICES",
    desc: "[CLIENT INFORMATION REQUIRED: Commitment to continuous environmental responsibility throughout manufacturing and distribution.]"
  }
];

// Curated Gallery with Filter Categories
export const galleryItems = [
  {
    id: "gal-01",
    category: "factory",
    title: "Production Facility Overview",
    desc: "Clean, mechanized industrial floor in Tamil Nadu.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "gal-02",
    category: "products",
    title: "Export-Grade Substrate Block",
    desc: "Compressed coconut pith block prepared for international dispatch.",
    image: "https://images.unsplash.com/photo-1592417817098-8f3d69102a49?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "gal-03",
    category: "process",
    title: "Natural Husk Raw Material Sorting",
    desc: "Rigorous quality inspection at intake.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "gal-04",
    category: "packaging",
    title: "Palletized Container Load",
    desc: "Moisture-resistant wrapping and export palletization.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "gal-05",
    category: "export",
    title: "Container Freight Preparation",
    desc: "Logistics handling for global sea transit.",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "gal-06",
    category: "factory",
    title: "High-Capacity Processing Line",
    desc: "Continuous machinery for uniform screening and separation.",
    image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "gal-07",
    category: "products",
    title: "Coir Fibre Bales",
    desc: "Clean, consistent natural coconut fibre ready for shipment.",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "gal-08",
    category: "process",
    title: "Quality Inspection Desk",
    desc: "Physical sampling for consistency across production batches.",
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80"
  }
];
