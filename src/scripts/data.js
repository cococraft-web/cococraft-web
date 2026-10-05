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

// Structured CMS-Ready Product Data conforming to specification
export const products = [
  {
    id: "prod-cocopeat-5kg",
    slug: "5kg-cocopeat-blocks",
    title: "5KG Cocopeat Compressed Blocks",
    category: "Cocopeat Blocks",
    description: "Premium washed and unwashed coco peat pith compressed at a 5:1 ratio. Engineered for uniform water-holding capacity, optimal porosity, and minimal sodium/potassium displacement.",
    image: "/assets/products/5kg-block.jpg",
    specifications: [
      { label: "EC Rating", value: "Low EC (< 0.5 mS/cm)" },
      { label: "Volume Yield", value: "~75 Litres Expanded" },
      { label: "pH Level", value: "5.5 – 6.8" },
      { label: "Packaging", value: "Palletized / 24-26 MT" }
    ],
    detailUrl: "/products/products.html#blocks",
    documentUrl: null
  },
  {
    id: "prod-grow-bags",
    slug: "coir-grow-bags",
    title: "Hydroponic Coir Grow Bags / Slabs",
    category: "Coir Grow Bags",
    description: "Pre-cut plant holes & drainage slots. 100% natural organic medium customized with tailored coir-to-chip ratios for commercial greenhouse vine crops and berries.",
    image: "/assets/products/growbag-slab.jpg",
    specifications: [
      { label: "Standard Dimensions", value: "100 x 15 x 12 cm" },
      { label: "Substrate Blend", value: "70/30 Pith/Chips" },
      { label: "UV Resistance", value: "3+ Years Guaranteed" },
      { label: "Drainage", value: "Pre-Drilled Custom Slits" }
    ],
    detailUrl: "/products/products.html#grow-bags",
    documentUrl: null
  },
  {
    id: "prod-husk-chips",
    slug: "husk-chips",
    title: "Washed Coir Husk Chips",
    category: "Husk Chips",
    description: "Uniformly cut and screened cubes of natural coconut husk. High aeration ratio (30-40%), ideal porosity for orchid, anthurium, and potted plant cultivation.",
    image: "/assets/products/husk-chips.jpg",
    specifications: [
      { label: "Chip Grading", value: "Small (6-12mm), Med (10-18mm)" },
      { label: "EC Level", value: "< 0.5 mS/cm Washed" },
      { label: "Air Porosity", value: "35% – 45%" },
      { label: "Packaging", value: "5kg Block / 25kg Bale" }
    ],
    detailUrl: "/products/products.html#chips",
    documentUrl: null
  },
  {
    id: "prod-briquettes-650g",
    slug: "briquettes",
    title: "650g Compressed Coir Briquettes",
    category: "Briquettes",
    description: "Compact, highly portable 650g compressed coco pith bricks designed for retail distribution, home gardening, and seedling propagation. Rehydrates quickly to 9–10 liters.",
    image: "/assets/products/650g-briquette.jpg",
    specifications: [
      { label: "Unit Weight", value: "650g (± 50g)" },
      { label: "Yield Per Brick", value: "9 – 10 Liters" },
      { label: "EC Level", value: "< 0.5 mS/cm Washed" },
      { label: "Packaging", value: "Individually Wrapped" }
    ],
    detailUrl: "/products/products.html#briquettes",
    documentUrl: null
  },
  {
    id: "prod-coir-fibre",
    slug: "coir-fiber",
    title: "Raw Mattress & Bristle Coir Fibre",
    category: "Coir Fiber",
    description: "Long, resilient golden brown coconut fibers extracted through clean mechanical decortication. Hydraulically baled under 120-ton pressure for mattress cores, auto seating, and twine.",
    image: "/assets/products/coir-fibre.jpg",
    specifications: [
      { label: "Fibre Length", value: "10cm – 25cm Bristle" },
      { label: "Moisture Content", value: "< 15% Max" },
      { label: "Dust / Impurity", value: "< 3% Screened" },
      { label: "Bale Packaging", value: "120kg – 150kg Strapped" }
    ],
    detailUrl: "/products/products.html#fibre",
    documentUrl: null
  },
  {
    id: "prod-coir-geotextiles",
    slug: "coir-geotextiles",
    title: "Coir Geotextile Netting & Erosion Blankets",
    category: "Coir Fiber",
    description: "100% natural, biodegradable woven coir mesh matting engineered for steep slope stabilization, highway embankments, and riverbank restoration with 3–5 years lifespan.",
    image: "/assets/products/coir-geotextiles.jpg",
    specifications: [
      { label: "Mesh Weight", value: "400g / 700g / 900g/m²" },
      { label: "Roll Dimensions", value: "2m Width x 50m Roll" },
      { label: "Degradation Period", value: "3 – 5 Years Lifespan" },
      { label: "Tensile Strength", value: "High Wet & Dry" }
    ],
    detailUrl: "/products/products.html#geotextiles",
    documentUrl: null
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
