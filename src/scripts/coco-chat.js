/**
 * COCO CRAFT EXPORTS — Conversational AI Assistant
 * Badge: COCO-CX-001 | Version: 2.0.0
 * Zero-dependency Vanilla JS chatbot widget
 */

import '../styles/coco-chat.css';

/* ── KNOWLEDGE BASE ────────────────────────────────────── */
const KB = {
  products: {
    blocks: {
      name: '5kg Coir Blocks (Buffered)', sku: 'CCE-BLK-5K-BUF',
      ec: '0.3–0.5 mS/cm (1:1.5 extraction, 25°C)', ph: '5.8–6.5',
      moisture: '18% pre-compression', compression: '5:1–12:1 expansion ratio',
      dimensions: '30×30×15 cm (compressed)', expanded: '70–75 L / block',
      container: '504 blocks / 40\'HC container', weight: '5.0 kg ± 0.2 kg',
      certifications: 'OMRI Listed, RHP, ISO 9001:2015', leadtime: '3–4 weeks ex-works Pollachi',
    },
    growbags: {
      name: 'Premium Coir Grow Bags', sku: 'CCE-GRB-SERIES',
      sizes: '10L | 20L | 35L | 50L | 75L | 100L | 150L | 200L',
      ec: '0.4–0.6 mS/cm (crop-dependent)', ph: '6.0–6.5 (buffered)',
      uv: 'UV-stabilized LLDPE, 200 micron',
      perforations: 'Pre-drilled drain holes + side slits (crop-specific)',
      crops: 'Tomato, Pepper, Cucumber, Strawberry, Blueberry, Cannabis/Hemp, Rose, Herbs',
      container: '400 units / 40\'HC (bulk fill)', moq: '10 containers minimum for private label',
      leadtime: '4–6 weeks (standard) | 6–8 weeks (custom label)',
    },
    chips: {
      name: 'Coir Husk Chips', sku: 'CCE-CHI-SERIES',
      sizes: 'Small (6–12mm) | Medium (12–25mm) | Large (25–50mm)',
      ec: 'Less than 0.5 mS/cm washed', ph: '5.5–6.8', fiber: 'Less than 5% fiber content',
      wash: 'Triple-wash demineralized', container: '22 MT / 40\'HC (loose fill)',
      certifications: 'OMRI, RHP substrate standard', leadtime: '2–3 weeks ex-works',
    },
    fiber: {
      name: 'Coir Fibre Bales', sku: 'CCE-FBR-SERIES',
      grades: 'Mattress | Brush | Bristle | Erosion Control',
      moisture: '12–18%', impurity: 'Less than 3% woody matter',
      baleWeights: '125 kg | 250 kg | 500 kg', strapping: 'PP polypropylene, 4-strapped per bale',
      container: '18–22 MT / 40\'HC', leadtime: '2–3 weeks',
    },
    geotextiles: {
      name: 'Coir Geotextile Rolls', sku: 'CCE-GEO-SERIES',
      gsm: '400 | 700 | 900 GSM', tensile: '5.0–12.0 kN/m (warp)',
      degradation: '2–5 years (soil-contact, climate-dependent)', width: '1.0m | 2.0m rolls',
      applications: 'Slope stabilization, riverbank erosion, road sub-base, land reclamation',
      certifications: 'ISO 9001, CE mark (select grades)', leadtime: '3–4 weeks',
    },
  },
  compliance: {
    EU: {
      status: 'YES',
      certs: ['Phytosanitary Certificate (NPPO India)', 'ISPM-15 Wood Packaging', 'REACH compliance declaration', 'Certificate of Origin (CoO)', 'EUR.1 Movement Certificate'],
      transit: 'Tuticorin → Rotterdam: 22–26 days (MSC/Maersk)',
      notes: 'EORI number required for EU importer. RHP certification preferred for substrate trade.',
      hs_code: '5305.00 (coir) | 1404.90 (coconut products)',
    },
    US: {
      status: 'YES',
      certs: ['USDA-APHIS PPQ 587 (import permit)', 'Phytosanitary Certificate', 'ISPM-15', 'Lacey Act declaration', 'Certificate of Origin'],
      transit: 'Tuticorin → Long Beach: 24–28 days | Newark: 26–30 days',
      notes: 'State-level NoC may be needed (CA, FL, TX vary). OMRI listing speeds organic market clearance.',
      hs_code: '1404.90 (coir products) | 5305.00 (raw fibre)',
    },
    Australia: {
      status: 'YES (Conditional)',
      certs: ['Phytosanitary Certificate — nil weed seed declaration', 'DAFF BICON entry condition check', 'ISPM-15', 'Heat treatment / methyl bromide cert', 'Certificate of Origin'],
      transit: 'Chennai → Melbourne: 18–22 days (ONE/CMA CGM)',
      notes: 'AU DAFF requires nil viable weed seeds. Our 6mm sieve + triple-wash meets this. Batch COA includes seed count assay.',
      hs_code: '1404.90',
    },
    Canada: {
      status: 'YES',
      certs: ['CFIA import permit (plant product)', 'Phytosanitary Certificate', 'ISPM-15', 'Certificate of Origin'],
      transit: 'Tuticorin → Vancouver: 26–30 days',
      notes: 'CFIA requires advance import permit before shipment. Lead time: 2–3 weeks for permit.',
      hs_code: '1404.90',
    },
    MiddleEast: {
      status: 'YES',
      certs: ['Phytosanitary Certificate', 'Certificate of Origin (CoO)', 'SASO registration (KSA)', 'Halal cert (optional, GCC markets)'],
      transit: 'Tuticorin → Jebel Ali: 10–14 days (MSC/COSCO)',
      notes: 'GCC SFDA registration may be required for retail growing media. B2B direct import generally straightforward.',
      hs_code: '1404.90 | 5305.00',
    },
    Japan: {
      status: 'YES',
      certs: ['Phytosanitary Certificate', 'Japanese Plant Quarantine Law declaration', 'Certificate of Origin', 'ISPM-15'],
      transit: 'Chennai → Yokohama: 20–25 days (K-Line/ONE)',
      notes: 'Japan MOA requires phytosanitary inspection at port. Typically cleared in 3–5 days.',
      hs_code: '1404.90',
    },
  },
  incoterms: {
    FOB: 'FOB Tuticorin/Chennai — Risk transfers at ship rail. Buyer arranges freight + insurance. Most common for experienced importers.',
    CFR: 'CFR [Destination Port] — We cover sea freight. Buyer covers insurance + import duties.',
    CIF: 'CIF [Destination Port] — We cover freight + minimum insurance. Buyer covers import duties.',
    DDP: 'DDP [Destination] — We cover all costs to delivery. Available select EU/GCC destinations. Premium pricing applies.',
    EXW: 'EXW Pollachi — Ex-works. Buyer collects from factory. Rare for international orders.',
  },
  payment: {
    TT: 'T/T: 30% advance on PI | 70% against BL copy (most common for established buyers)',
    LC: 'LC: Sight/Usance (30/60/90 days). We accept SWIFT MT700 from any top-50 bank.',
    CAD: 'Documents against Payment (DP/DA) — available for repeat buyers with trade credit.',
    credit: 'Trade credit insurance: Euler Hermes / Atradius accepted for credit-backed buyers.',
  },
  troubleshooting: {
    expansion: {
      title: 'Block Expansion Issues',
      causes: [
        'Water temperature below 20°C — use warm water (25–30°C) for optimal cell expansion',
        'Insufficient soaking time — minimum 20 minutes continuous hydration',
        'Aged stock (over 18 months from manufacture) — check batch date on label',
        'Incorrect water volume — use 4–5 L water per 1 kg compressed block',
        'Hard/saline water — RO or softened water recommended for best results',
      ],
      steps: ['Check water temperature (ideal 25–30°C)', 'Soak min 20 minutes, gently break apart at 10 min mark', 'Verify batch date (printed on block wrap)', 'Share batch number and we trace to production lot'],
      escalation: 'If manufacturing variance confirmed, QC Manager issues replacement protocol within 48h',
    },
    ec: {
      title: 'High EC / Salinity Issues',
      causes: ['Unbuffered grade shipped instead of buffered', 'Insufficient pre-planting flush', 'Natural regional variation (monsoon season batches)'],
      steps: ['Test with calibrated EC meter (1:1.5 slurry, 25°C)', 'Flush with 3x water volume until EC drops below 0.5 mS/cm', 'Share COA batch number for verification'],
      escalation: 'COA mismatch confirmed — full replacement + corrective action report issued',
    },
    ph: {
      title: 'pH Out of Range',
      causes: ['Natural buffering variation', 'Mixing with alkaline water source', 'Post-sterilisation pH shift'],
      steps: ['Test with calibrated pH meter (slurry method)', 'Adjust with pH-down (phosphoric acid) or pH-up (KOH)', 'Target 5.8–6.5 for most crops'],
      escalation: 'Systematic pH deviation — QC team trace + revised buffer protocol issued',
    },
  },
  qc: {
    tests: [
      { param: 'EC', method: '1:1.5 slurry extraction', target: 'Less than 0.5 mS/cm (buffered)', tolerance: '±0.05 mS/cm' },
      { param: 'pH', method: 'Slurry method (1:1)', target: '5.8–6.5', tolerance: '±0.1 pH' },
      { param: 'Moisture', method: 'Oven-dry gravimetric', target: 'Less than or equal to 18%', tolerance: '±0.5%' },
      { param: 'Expansion Ratio', method: 'Measured volume after 25 min hydration', target: 'Greater than or equal to 12x (standard grade)', tolerance: '±5%' },
      { param: 'Sieve Analysis', method: 'Wet sieve, 6mm mesh', target: 'Less than 2% particles over 6mm', tolerance: 'Less than 2% oversize' },
      { param: 'Fiber Content', method: 'Manual separation + gravimetric', target: 'Less than 5% fiber', tolerance: '±1%' },
    ],
  },
  company: {
    name: 'Coco Craft Exports (Sai Group)', founded: '2008',
    location: 'Pollachi, Tamil Nadu — Coconut Belt Epicentre',
    capacity: '12,000 MT/year processing capacity', exports: '40+ countries across EU, US, ME, APAC, LATAM',
    certifications: ['ISO 9001:2015', 'OMRI Listed', 'RHP Substrate Standard', 'SEDEX/SMETA Ethical Audit', 'Phytosanitary certified'],
  },
};

/* ── INTENT PATTERNS ───────────────────────────────────── */
const INTENTS = [
  { id: 'spec_blocks', patterns: [/\b(5kg|block|blocks|pith|coir block|compressed)\b/i], handler: handleSpecBlocks },
  { id: 'spec_growbags', patterns: [/\b(grow bag|growbag|bag|bags|cranberry|strawberry|blueberry|raspberry|blackberry|tomato|cucumber|pepper|cannabis|hemp)\b/i], handler: handleSpecGrowBags },
  { id: 'spec_chips', patterns: [/\b(chips|husk chip|chunk|chunks|orchid)\b/i], handler: handleSpecChips },
  { id: 'spec_fiber', patterns: [/\b(fibre|fiber|bale|bales|mattress|bristle|brush)\b/i], handler: handleSpecFiber },
  { id: 'spec_geo', patterns: [/\b(geo|geotextile|erosion|slope|gsm)\b/i], handler: handleSpecGeo },
  { id: 'compliance_eu', patterns: [/\b(eu|europe|european|netherlands|germany|spain|france|holland|belgium|italy|uk|england)\b/i], handler: () => handleCompliance('EU') },
  { id: 'compliance_us', patterns: [/\b(usa|us|united states|america|usda|california|florida|texas|aphis)\b/i], handler: () => handleCompliance('US') },
  { id: 'compliance_au', patterns: [/\b(australia|au|daff|bicon|melbourne|sydney)\b/i], handler: () => handleCompliance('Australia') },
  { id: 'compliance_ca', patterns: [/\b(canada|cfia|vancouver|toronto)\b/i], handler: () => handleCompliance('Canada') },
  { id: 'compliance_me', patterns: [/\b(uae|dubai|jebel ali|saudi|ksa|middle east|gcc|qatar|oman)\b/i], handler: () => handleCompliance('MiddleEast') },
  { id: 'compliance_jp', patterns: [/\b(japan|japanese|yokohama|tokyo)\b/i], handler: () => handleCompliance('Japan') },
  { id: 'incoterms', patterns: [/\b(incoterm|fob|cfr|cif|ddp|exw|freight term|shipping term)\b/i], handler: handleIncoterms },
  { id: 'payment', patterns: [/\b(payment|pay|lc|letter of credit|tt|wire transfer|advance|bank)\b/i], handler: handlePayment },
  { id: 'container', patterns: [/\b(container|40hc|20gp|load|stuffing|pallet|cbm|payload)\b/i], handler: handleContainerLoad },
  { id: 'ts_expansion', patterns: [/\b(not expand|expansion problem|won't expand|low expansion|only \d+x)\b/i, /\b(expand|expansion)\b.*\b(issue|problem|less|low|wrong)\b/i], handler: () => handleTroubleshoot('expansion') },
  { id: 'ts_ec', patterns: [/\b(high ec|ec problem|too salty|salinity|salt issue)\b/i], handler: () => handleTroubleshoot('ec') },
  { id: 'ts_ph', patterns: [/\b(ph problem|ph issue|wrong ph|too acid|too alkaline)\b/i], handler: () => handleTroubleshoot('ph') },
  { id: 'quote', patterns: [/\b(quote|price|cost|pi|proforma|order|rfq|buy|purchase)\b/i], handler: handleQuote },
  { id: 'qc', patterns: [/\b(coa|certificate of analysis|test|lab|qc|quality|batch|sgs|eurofins)\b/i], handler: handleQCLab },
  { id: 'sustain', patterns: [/\b(sustain|organic|omri|carbon|eco|green|certif|audit|sedex|iso)\b/i], handler: handleSustainability },
  { id: 'company', patterns: [/\b(about|company|who are|sai group|founded|capacity|experience|history)\b/i], handler: handleCompany },
  { id: 'contact', patterns: [/\b(contact|email|whatsapp|phone|reach|talk|speak|human|agent|person|manager)\b/i], handler: handleContact },
  { id: 'greeting', patterns: [/^(hi|hello|hey|good|namaste|howdy|greetings|start|help)\b/i], handler: handleGreeting },
  { id: 'thanks', patterns: [/\b(thank|thanks|perfect|great|excellent|ok|understood|clear)\b/i], handler: handleThanks },
];

/* ── CARD BUILDERS ─────────────────────────────────────── */
function specCard(title, sku, rows, actions = []) {
  return { type: 'spec', content: `<div class="cc-card">
    <div class="cc-card-hd"><span class="cc-badge">SPEC</span><h4>${title}</h4><code class="cc-sku">${sku}</code></div>
    <table class="cc-table">${rows.map(([k,v]) => `<tr><td>${k}</td><td><strong>${v}</strong></td></tr>`).join('')}</table>
    ${actions.length ? `<div class="cc-card-ft">${actions.map(a => `<button class="cc-btn" data-action="${a.action}">${a.label}</button>`).join('')}</div>` : ''}
  </div>` };
}

function complianceCard(market, data) {
  const sc = data.status.includes('Conditional') ? 'amber' : data.status === 'YES' ? 'green' : 'red';
  return { type: 'compliance', content: `<div class="cc-card">
    <div class="cc-card-hd"><span class="cc-badge cc-badge--blue">COMPLIANCE</span><h4>${market}</h4><span class="cc-status cc-status--${sc}">${data.status}</span></div>
    <div class="cc-card-body">
      <p class="cc-lbl">Required Documentation</p>
      <ul class="cc-checklist">${data.certs.map(c => `<li><span class="cc-chk">✓</span>${c}</li>`).join('')}</ul>
      <div class="cc-metarow">
        <div><span class="cc-lbl">Transit</span><span>${data.transit}</span></div>
        <div><span class="cc-lbl">HS Code</span><code>${data.hs_code}</code></div>
      </div>
      ${data.notes ? `<div class="cc-note"><span>⚑</span> ${data.notes}</div>` : ''}
    </div>
    <div class="cc-card-ft">
      <button class="cc-btn" data-action="compliance_pack">Download Compliance Pack</button>
      <button class="cc-btn cc-btn--ghost" data-action="contact">Talk to Export Desk</button>
    </div>
  </div>` };
}

function troubleshootCard(data) {
  return { type: 'troubleshoot', content: `<div class="cc-card">
    <div class="cc-card-hd"><span class="cc-badge cc-badge--warn">DIAGNOSE</span><h4>${data.title}</h4></div>
    <div class="cc-card-body">
      <p class="cc-lbl" style="margin-top:10px">Likely Causes</p>
      <ul class="cc-list">${data.causes.map(c => `<li>${c}</li>`).join('')}</ul>
      <p class="cc-lbl" style="margin-top:12px">Verification Steps</p>
      <ol class="cc-steps">${data.steps.map((s,i) => `<li><span>${i+1}</span>${s}</li>`).join('')}</ol>
      <div class="cc-note cc-note--red"><span>⚑</span> ${data.escalation}</div>
    </div>
    <div class="cc-card-ft"><button class="cc-btn cc-btn--warn" data-action="contact">Request QC Support</button></div>
  </div>` };
}

function infoCard(title, badge, body, actions = []) {
  return { type: 'info', content: `<div class="cc-card">
    <div class="cc-card-hd"><span class="cc-badge">${badge}</span><h4>${title}</h4></div>
    <div class="cc-card-body">${body}</div>
    ${actions.length ? `<div class="cc-card-ft">${actions.map(a => `<button class="cc-btn ${a.ghost?'cc-btn--ghost':''}" data-action="${a.action}">${a.label}</button>`).join('')}</div>` : ''}
  </div>` };
}

function textMsg(text) { return { type:'text', content:`<p class="cc-text">${text}</p>` }; }

/* ── INTENT HANDLERS ───────────────────────────────────── */
function handleGreeting() {
  return [{ type: 'greeting', content: `<div class="cc-welcome">
    <div class="cc-av-wrap"><div class="cc-avatar"><span>C</span></div>
      <div class="cc-av-info"><strong>Coco</strong><span>Export Operations · <code>COCO-CX-001</code></span></div></div>
    <p>Good day. I'm Coco — your senior export operations concierge at Coco Craft Exports.</p>
    <p>I can assist with <strong>product specifications</strong>, <strong>compliance requirements</strong>, <strong>container loading</strong>, and <strong>commercial terms</strong>.</p>
    <p class="cc-lbl" style="margin-top:14px">What can I help you with today?</p>
    <div class="cc-quickbtns">
      <button class="cc-quick" data-msg="5kg coir block specifications">📋 Block Specs</button>
      <button class="cc-quick" data-msg="Grow bag specifications">🌱 Grow Bags</button>
      <button class="cc-quick" data-msg="EU export compliance requirements">🌍 EU Compliance</button>
      <button class="cc-quick" data-msg="Container loading payload">📦 Container Load</button>
      <button class="cc-quick" data-msg="Request a quote">💬 Get Quote</button>
      <button class="cc-quick" data-msg="Troubleshoot coir block expansion issue">🔧 Troubleshoot</button>
    </div>
  </div>` }];
}

function handleSpecBlocks() {
  const p = KB.products.blocks;
  return [
    textMsg('Retrieving 5kg Block specifications from product master database…'),
    specCard(p.name, p.sku, [
      ['EC (buffered)', p.ec], ['pH Range', p.ph], ['Moisture', p.moisture],
      ['Expansion Ratio', p.compression], ['Expanded Volume', p.expanded],
      ['Unit Weight', p.weight], ['Container Load', p.container],
      ['Lead Time', p.leadtime], ['Certifications', p.certifications],
    ], [
      { label: 'Download Full PDS', action: 'download_pds' },
      { label: 'Request COA', action: 'request_coa' },
      { label: 'Container Load Calc', action: 'container' },
    ]),
    textMsg('Available in <strong>Buffered</strong> and <strong>Unbuffered</strong> grades. EC-washed to below 0.5 mS/cm. Shall I configure a container quote?'),
  ];
}

function handleSpecGrowBags() {
  const p = KB.products.growbags;
  return [
    textMsg('Retrieving Grow Bag series specifications…'),
    specCard(p.name, p.sku, [
      ['Sizes Available', p.sizes], ['EC (buffered)', p.ec], ['pH Range', p.ph],
      ['UV Film', p.uv], ['Perforations', p.perforations], ['Crop Applications', p.crops],
      ['Container Load', p.container], ['Private Label MOQ', p.moq], ['Lead Time', p.leadtime],
    ], [
      { label: 'Crop-Specific Config', action: 'crop_config' },
      { label: 'Private Label Query', action: 'contact' },
      { label: 'Request Quote', action: 'quote' },
    ]),
    textMsg('Grow bag formulations are <strong>crop-optimised</strong>. Perforation patterns vary for tomato/berry/cannabis. Tell me your target crop for a tailored spec.'),
  ];
}

function handleSpecChips() {
  const p = KB.products.chips;
  return [
    textMsg('Retrieving Coir Husk Chips specifications…'),
    specCard(p.name, p.sku, [
      ['Size Fractions', p.sizes], ['EC (washed)', p.ec], ['pH', p.ph],
      ['Fibre Content', p.fiber], ['Wash Cycles', p.wash],
      ['Container Load', p.container], ['Lead Time', p.leadtime],
    ], [{ label: 'Download PDS', action: 'download_pds' }, { label: 'Request Quote', action: 'quote' }]),
    textMsg('Triple-wash demineralized — ready for direct use as <strong>orchid media</strong>, drain layers, and hydroponic substrates. Which size fraction?'),
  ];
}

function handleSpecFiber() {
  const p = KB.products.fiber;
  return [
    textMsg('Retrieving Coir Fibre Bale specifications…'),
    specCard(p.name, p.sku, [
      ['Grades', p.grades], ['Moisture', p.moisture], ['Impurity Level', p.impurity],
      ['Bale Weights', p.baleWeights], ['Strapping', p.strapping],
      ['Container Load', p.container], ['Lead Time', p.leadtime],
    ], [{ label: 'Request Quote', action: 'quote' }, { label: 'Talk to Sales', action: 'contact' }]),
  ];
}

function handleSpecGeo() {
  const p = KB.products.geotextiles;
  return [
    textMsg('Retrieving Coir Geotextile specifications…'),
    specCard(p.name, p.sku, [
      ['GSM Options', p.gsm], ['Tensile Strength', p.tensile],
      ['Degradation Timeline', p.degradation], ['Roll Widths', p.width],
      ['Applications', p.applications], ['Certifications', p.certifications], ['Lead Time', p.leadtime],
    ], [{ label: 'Engineering Datasheet', action: 'download_pds' }, { label: 'Project Consultation', action: 'contact' }]),
  ];
}

function handleCompliance(market) {
  const data = KB.compliance[market];
  if (!data) return [textMsg('Compliance data for this market is being verified. Please <button class="cc-inline" data-action="contact">contact our export desk</button> for the latest requirements.')];
  return [textMsg(`Retrieving compliance requirements for <strong>${market}</strong>…`), complianceCard(market, data)];
}

function handleIncoterms() {
  const rows = Object.entries(KB.incoterms).map(([k,v]) => `<div class="cc-inco-row"><code>${k}</code><p>${v}</p></div>`).join('');
  return [infoCard('INCOTERMS 2020 — Available Terms', 'COMMERCIAL',
    `<div class="cc-inco-grid">${rows}</div><div class="cc-note" style="margin-top:12px"><span>⚑</span> FOB Tuticorin is our standard default. DDP available for select EU/GCC buyers.</div>`,
    [{ label: 'Request Proforma Invoice', action: 'quote' }]
  )];
}

function handlePayment() {
  const rows = Object.entries(KB.payment).map(([k,v]) => `<div class="cc-pay-row"><code>${k}</code><p>${v}</p></div>`).join('');
  return [infoCard('Payment Terms', 'COMMERCIAL',
    `<div class="cc-pay-grid">${rows}</div><div class="cc-note" style="margin-top:10px"><span>⚑</span> For volumes over 50 containers/year, extended credit terms available.</div>`,
    [{ label: 'Connect to Commercial Director', action: 'contact' }]
  )];
}

function handleContainerLoad() {
  return [infoCard("40' High-Cube — Payload Matrix", 'LOGISTICS',
    `<table class="cc-table" style="margin-top:8px">
      <thead><tr><th>Product</th><th>Units</th><th>Gross Wt</th><th>CBM</th></tr></thead>
      <tbody>
        <tr><td>5kg Blocks</td><td><strong>504 blocks</strong></td><td>~2,520 kg</td><td>~38 CBM</td></tr>
        <tr><td>Grow Bags 100L</td><td><strong>400 units</strong></td><td>~24,000 kg fill</td><td>~65 CBM</td></tr>
        <tr><td>Coir Chips (loose)</td><td><strong>22 MT</strong></td><td>22,000 kg</td><td>~65 CBM</td></tr>
        <tr><td>Fibre Bales 500kg</td><td><strong>44 bales</strong></td><td>22,000 kg</td><td>~64 CBM</td></tr>
        <tr><td>Geotextile Rolls</td><td><strong>~200 rolls</strong></td><td>~18,000 kg</td><td>~60 CBM</td></tr>
      </tbody>
    </table>
    <div class="cc-metarow" style="margin-top:12px">
      <div><span class="cc-lbl">Max Gross Weight</span><span>28,000 kg</span></div>
      <div><span class="cc-lbl">Pallet Config</span><span>24 x EUR pallets</span></div>
    </div>`,
    [{ label: 'Request Stuffing Plan', action: 'quote' }, { label: 'Logistics Desk', action: 'contact', ghost: true }]
  )];
}

function handleTroubleshoot(type) {
  const data = KB.troubleshooting[type];
  if (!data) return [textMsg("Please describe your issue in more detail and I'll diagnose it.")];
  return [textMsg(`Analysing your issue — <strong>${data.title}</strong>…`), troubleshootCard(data)];
}

function handleQuote() {
  return [infoCard('Container RFQ — Configuration Guide', 'QUOTE',
    `<p class="cc-text" style="margin-bottom:12px">To generate a Proforma Invoice, please provide:</p>
    <div class="cc-rfq-grid">
      <div class="cc-rfq-item"><span class="cc-lbl">1. Product</span><p>Block / Grow Bag / Chips / Fibre / Geotextile</p></div>
      <div class="cc-rfq-item"><span class="cc-lbl">2. Volume</span><p>No. of containers (20'GP / 40'HC)</p></div>
      <div class="cc-rfq-item"><span class="cc-lbl">3. Destination</span><p>Port of discharge + country</p></div>
      <div class="cc-rfq-item"><span class="cc-lbl">4. INCOTERM</span><p>FOB / CFR / CIF / DDP</p></div>
      <div class="cc-rfq-item"><span class="cc-lbl">5. Special Req.</span><p>Private label, buffered grade, crop spec</p></div>
      <div class="cc-rfq-item"><span class="cc-lbl">6. Target Delivery</span><p>Required delivery window</p></div>
    </div>
    <div class="cc-note" style="margin-top:12px"><span>⚑</span> Export desk confirms pricing within <strong>4 business hours</strong>.</div>`,
    [{ label: 'Email Export Desk', action: 'email_export' }, { label: 'WhatsApp Desk', action: 'whatsapp', ghost: true }]
  )];
}

function handleQCLab() {
  const rows = KB.qc.tests.map(t => `<tr><td><strong>${t.param}</strong></td><td>${t.method}</td><td><code>${t.target}</code></td><td>${t.tolerance}</td></tr>`).join('');
  return [infoCard('QC Laboratory — Test Methods', 'QC LAB',
    `<table class="cc-table" style="margin-top:6px">
      <thead><tr><th>Parameter</th><th>Method</th><th>Target</th><th>Tolerance</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="cc-note" style="margin-top:12px"><span>⚑</span> COA issued per batch. External verification via SGS / Eurofins on request.</div>`,
    [{ label: 'Request Batch COA', action: 'request_coa' }, { label: 'External Lab', action: 'contact', ghost: true }]
  )];
}

function handleSustainability() {
  return [infoCard('Sustainability & Certifications', 'CERTIFIED',
    `<div class="cc-cert-grid">
      <div class="cc-cert-item"><code>ISO 9001:2015</code><p>Quality Management System — annual audit cycle</p></div>
      <div class="cc-cert-item"><code>OMRI Listed</code><p>USDA NOP + EU Organic 2018/848 compliant input</p></div>
      <div class="cc-cert-item"><code>RHP Standard</code><p>European horticultural substrate certification</p></div>
      <div class="cc-cert-item"><code>SEDEX/SMETA</code><p>4-pillar ethical audit: Labour, H&S, Environment, Ethics</p></div>
      <div class="cc-cert-item"><code>Carbon LCA</code><p>Solar sun-curing, zero fossil fuel drying baseline</p></div>
      <div class="cc-cert-item"><code>Water Stewardship</code><p>Triple-wash recirculation, over 70% water recycled</p></div>
    </div>
    <div class="cc-note" style="margin-top:12px"><span>⚑</span> Full sustainability data pack + LCA report available under NDA.</div>`,
    [{ label: 'Download Certificate Pack', action: 'compliance_pack' }, { label: 'Sustainability Audit', action: 'contact', ghost: true }]
  )];
}

function handleCompany() {
  const c = KB.company;
  return [infoCard('Coco Craft Exports (Sai Group)', 'ABOUT',
    `<div class="cc-about-grid">
      <div><span class="cc-lbl">Founded</span><p>${c.founded}</p></div>
      <div><span class="cc-lbl">Location</span><p>${c.location}</p></div>
      <div><span class="cc-lbl">Capacity</span><p>${c.capacity}</p></div>
      <div><span class="cc-lbl">Global Reach</span><p>${c.exports}</p></div>
    </div>
    <div class="cc-cert-grid" style="margin-top:12px">
      ${c.certifications.map(cert => `<div class="cc-cert-item"><code>${cert}</code></div>`).join('')}
    </div>`,
    [{ label: 'View Manufacturing', action: 'nav_mfg' }, { label: 'Contact Us', action: 'contact', ghost: true }]
  )];
}

function handleContact() {
  return [infoCard('Connect with the Export Desk', 'HANDOFF',
    `<div class="cc-contact-grid">
      <div class="cc-contact-item"><span class="cc-ci">✉</span><div>
        <span class="cc-lbl">Export Enquiries</span>
        <a href="mailto:exports@cococraftexports.com">exports@cococraftexports.com</a>
        <small>Response within 4 business hours</small></div></div>
      <div class="cc-contact-item"><span class="cc-ci">💬</span><div>
        <span class="cc-lbl">WhatsApp Trade Desk</span>
        <a href="https://wa.me/919488012345" target="_blank" rel="noopener noreferrer">+91 94880 12345</a>
        <small>Mon–Sat, 09:00–18:00 IST</small></div></div>
      <div class="cc-contact-item"><span class="cc-ci">🔬</span><div>
        <span class="cc-lbl">Technical Support</span>
        <a href="mailto:technical@cococraftexports.com">technical@cococraftexports.com</a>
        <small>Substrate formulation & QC queries</small></div></div>
      <div class="cc-contact-item"><span class="cc-ci">📞</span><div>
        <span class="cc-lbl">Schedule a Call</span>
        <a href="/contact/contact.html">Request Call-Back via Contact Form</a>
        <small>Zoom / Teams / Phone — your preference</small></div></div>
    </div>`,
    []
  )];
}

function handleThanks() {
  const r = ["You're welcome. Is there anything else I can assist with?", "Glad to help. Our export desk is available for formal documentation.", "Understood. Feel free to return anytime for technical or commercial guidance."];
  return [textMsg(r[Math.floor(Math.random() * r.length)])];
}

function handleFallback() {
  return [infoCard('Need a bit more context', 'CLARIFY',
    `<p class="cc-text">Here are the areas I specialise in:</p>
    <div class="cc-quickbtns" style="margin-top:10px">
      <button class="cc-quick" data-msg="5kg coir block specifications">📋 Block Specs</button>
      <button class="cc-quick" data-msg="Grow bag specifications">🌱 Grow Bags</button>
      <button class="cc-quick" data-msg="EU export compliance">🇪🇺 EU Compliance</button>
      <button class="cc-quick" data-msg="Australia compliance requirements">🇦🇺 AU Compliance</button>
      <button class="cc-quick" data-msg="Container load and payload">📦 Container Load</button>
      <button class="cc-quick" data-msg="Request a quote">💬 Get Quote</button>
      <button class="cc-quick" data-msg="Troubleshoot block expansion">🔧 Troubleshoot</button>
      <button class="cc-quick" data-msg="Contact the export team">📞 Contact Team</button>
    </div>`,
    []
  )];
}

/* ── CLASSIFIER ─────────────────────────────────────────── */
function classify(text) {
  const t = text.toLowerCase().trim();
  for (const intent of INTENTS) {
    for (const p of intent.patterns) {
      if (p.test(t)) return intent.handler();
    }
  }
  return handleFallback();
}

/* ── ACTION HANDLER ─────────────────────────────────────── */
function handleAction(action) {
  const map = {
    download_pds: () => addBotMessages([infoCard('Product Data Sheet', 'DOWNLOAD', '<p class="cc-text">Full PDS available on request. Provide your company email and SKU reference — our export desk sends the PDF within <strong>2 hours</strong>.</p>', [{ label: 'Email Request', action: 'email_export' }])]),
    request_coa: () => addBotMessages([infoCard('Certificate of Analysis Request', 'QC DOC', '<p class="cc-text">COA is issued per batch. Provide your <strong>batch number</strong> (on block wrap or pallet tag) and destination country. We email COA within 24 hours.</p>', [{ label: 'Send Batch # to QC', action: 'contact' }])]),
    compliance_pack: () => addBotMessages([infoCard('Compliance Documentation Pack', 'DOWNLOAD', '<p class="cc-text">Market-specific compliance packs include: Phytosanitary Certificate template, ISPM-15 declaration, Certificate of Origin, and MSDS/SDS. Indicate your <strong>destination market</strong>.</p>', [{ label: 'Request Compliance Pack', action: 'contact' }])]),
    email_export: () => addBotMessages([textMsg('Opening email to our export desk — <a href="mailto:exports@cococraftexports.com">exports@cococraftexports.com</a>. Response within <strong>4 business hours</strong> IST (Mon–Sat).')]),
    whatsapp: () => { window.open('https://wa.me/919488012345', '_blank', 'noopener,noreferrer'); addBotMessages([textMsg('WhatsApp trade desk opened. Typical response: <strong>under 2 hours</strong> during business hours.')]); },
    quote: () => addBotMessages(handleQuote()),
    contact: () => addBotMessages(handleContact()),
    container: () => addBotMessages(handleContainerLoad()),
    crop_config: () => addBotMessages([infoCard('Crop-Specific Grow Bag Config', 'AGRONOMIC',
      `<p class="cc-text">Our grow bags are formulated by crop type. Select your target:</p>
      <div class="cc-quickbtns">
        <button class="cc-quick" data-msg="tomato grow bag specification">🍅 Tomato</button>
        <button class="cc-quick" data-msg="strawberry grow bag specification">🍓 Strawberry</button>
        <button class="cc-quick" data-msg="blueberry grow bag specification">🫐 Blueberry</button>
        <button class="cc-quick" data-msg="cranberry grow bag specification">🍒 Cranberry</button>
        <button class="cc-quick" data-msg="cannabis hemp grow bag specification">🌿 Cannabis/Hemp</button>
        <button class="cc-quick" data-msg="pepper grow bag specification">🌶 Pepper</button>
        <button class="cc-quick" data-msg="cucumber grow bag specification">🥒 Cucumber</button>
      </div>`, []
    )]),
    nav_mfg: () => { window.location.href = '/company/manufacturing'; },
  };
  if (map[action]) map[action]();
}

/* ── RENDERER ───────────────────────────────────────────── */
let messagesEl = null, isTyping = false;

function addBotMessages(messages) {
  let delay = 0;
  messages.forEach((msg, i) => {
    delay += i === 0 ? 0 : 500;
    setTimeout(() => {
      if (i === 0) showTyping();
      setTimeout(() => {
        hideTyping();
        renderMsg('bot', msg);
        if (i < messages.length - 1) showTyping();
      }, i === 0 ? 600 : 200);
    }, delay);
  });
}

function showTyping() {
  if (isTyping) return; isTyping = true;
  const el = document.createElement('div');
  el.className = 'cc-msg cc-msg--bot cc-typing'; el.id = 'cc-typing';
  el.innerHTML = '<div class="cc-bubble"><span></span><span></span><span></span></div>';
  messagesEl.appendChild(el); scrollBottom();
}

function hideTyping() {
  isTyping = false;
  const el = document.getElementById('cc-typing');
  if (el) el.remove();
}

function renderMsg(role, msg) {
  const el = document.createElement('div');
  el.className = `cc-msg cc-msg--${role}`;
  el.innerHTML = msg.content;
  el.style.cssText = 'opacity:0;transform:' + (role === 'user' ? 'translateX(20px)' : 'translateX(-20px)');
  messagesEl.appendChild(el);
  requestAnimationFrame(() => {
    el.style.cssText = 'opacity:1;transform:translateX(0);transition:opacity 0.35s ease,transform 0.35s ease';
  });
  el.querySelectorAll('[data-action]').forEach(b => b.addEventListener('click', () => handleAction(b.dataset.action)));
  el.querySelectorAll('[data-msg]').forEach(b => b.addEventListener('click', () => handleUserInput(b.dataset.msg)));
  el.querySelectorAll('.cc-inline').forEach(b => b.addEventListener('click', () => handleAction(b.dataset.action)));
  scrollBottom();
}

function scrollBottom() { requestAnimationFrame(() => { if(messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight; }); }

function handleUserInput(text) {
  if (!text.trim()) return;
  renderMsg('user', { content: `<div class="cc-bubble cc-bubble--user">${text}</div>` });
  addBotMessages(classify(text));
}

/* ── DOM BUILDER ────────────────────────────────────────── */
function buildWidget() {
  const host = document.createElement('div');
  host.id = 'cc-host';
  host.setAttribute('data-lenis-prevent', 'true');
  host.innerHTML = `
  <button id="cc-launcher" aria-label="Chat with Coco">
    <div class="cc-li cc-li--open"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
    <div class="cc-li cc-li--close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
    <span class="cc-dot"></span>
  </button>
  <div id="cc-win" aria-hidden="true" role="dialog" aria-labelledby="cc-dialog-title" data-lenis-prevent="true">
    <div class="cc-hdr">
      <div class="cc-hdr-l">
        <div class="cc-avatar"><span>C</span></div>
        <div class="cc-hdr-info"><strong id="cc-dialog-title">Coco</strong><span class="cc-online">●</span><span>Export Operations</span></div>
      </div>
      <div class="cc-hdr-r"><code class="cc-bid">COCO-CX-001</code>
        <button id="cc-close" class="cc-x-btn" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
    </div>
    <div class="cc-msgs" id="cc-msgs" role="log" aria-live="polite" data-lenis-prevent="true"></div>
    <div class="cc-inp-area">
      <input type="text" id="cc-inp" class="cc-inp" placeholder="Ask about specs, compliance, pricing…" autocomplete="off" maxlength="300"/>
      <button id="cc-send" class="cc-send" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="17" height="17"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
    </div>
    <div class="cc-ftr">Powered by Coco Craft Exports · Specs verified from product master</div>
  </div>`;
  document.body.appendChild(host);
}

/* ── CONTROLLER ─────────────────────────────────────────── */
function initCocoChat() {
  buildWidget();
  const launcher = document.getElementById('cc-launcher');
  const win = document.getElementById('cc-win');
  const closeBtn = document.getElementById('cc-close');
  const inp = document.getElementById('cc-inp');
  const sendBtn = document.getElementById('cc-send');
  messagesEl = document.getElementById('cc-msgs');
  let isOpen = false;

  function openChat() {
    isOpen = true;
    win.classList.add('cc-win--open'); launcher.classList.add('cc-launch--open');
    win.setAttribute('aria-hidden', 'false'); inp.focus();
    if (!win._greeted) { win._greeted = true; setTimeout(() => addBotMessages(handleGreeting()), 300); }
    document.querySelector('.cc-dot')?.classList.remove('cc-dot--on');
  }
  function closeChat() {
    isOpen = false;
    win.classList.remove('cc-win--open'); launcher.classList.remove('cc-launch--open');
    win.setAttribute('aria-hidden', 'true');
  }
  launcher.addEventListener('click', () => isOpen ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closeChat(); });

  // Isolate chat scrolling from background smooth scrolling (Lenis/native)
  win.addEventListener('wheel', (e) => {
    e.stopPropagation();
  }, { passive: true });
  win.addEventListener('touchmove', (e) => {
    e.stopPropagation();
  }, { passive: true });

  const send = () => { const v = inp.value.trim(); if (!v) return; inp.value = ''; handleUserInput(v); };
  sendBtn.addEventListener('click', send);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  setTimeout(() => { if (!isOpen) { const d = document.querySelector('.cc-dot'); if(d) d.classList.add('cc-dot--on'); } }, 4000);
}

/* ── INIT ───────────────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCocoChat);
} else {
  initCocoChat();
}
