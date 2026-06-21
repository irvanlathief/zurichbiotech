/* ─────────── price helper ─────────── */
function formatPrice(price) {
  return "Rp" + price.toLocaleString("id-ID");
}

/* ─────────── compound prices (single-vial) ─────────── */
const COMPOUND_PRICES = {
  "GHK-CU": 1800000,
  "Semax": 1000000,
  "BPC157 + TB500": 1900000,
  "MOTS-C": 2000000,
  "Retatrutide": 3800000,
  "CJC1295 / Ipamorelin": 1500000,
};

function calculateProtocolPrice(stack) {
  return stack.reduce((total, [name]) => total + (COMPOUND_PRICES[name] || 0), 0);
}

/* ─────────── protocols data ─────────── */
const protocols = {
  strength: {
    type: "Strength protocol",
    title: "Lift Heavier.",
    description:
      "Strength and muscle density. Train harder, recover faster.",
    duration: "12-16 Weeks",
    goal: "Strength & Muscle Performance",
    get price() { return calculateProtocolPrice(this.stack); },
    stack: [
      ["GHK-CU", "10mg"],
      ["BPC157 + TB500", "5mg + 5mg"],
      ["CJC1295 / Ipamorelin", "10mg Blend"],
    ],
    color: "#1158d8",
  },
  energy: {
    type: "Cognitive protocol",
    title: "Wake Up Sharp.",
    description:
      "Clean morning output and sustained energy. No stimulation theater.",
    duration: "12-16 Weeks",
    goal: "Cognitive Output & Energy",
    get price() { return calculateProtocolPrice(this.stack); },
    stack: [
      ["Semax", "5mg"],
      ["MOTS-C", "10mg"],
      ["GHK-CU", "10mg"],
    ],
    color: "#e5bd00",
  },
  recovery: {
    type: "Recovery protocol",
    title: "Recover Faster.",
    description:
      "Tissue repair and inflammatory control. Hard training should not mean long recovery.",
    duration: "12 Weeks",
    goal: "Repair & Tissue Resilience",
    get price() { return calculateProtocolPrice(this.stack); },
    stack: [
      ["BPC157 + TB500", "5mg + 5mg"],
      ["GHK-CU", "10mg"],
    ],
    color: "#138f2d",
  },
  metabolic: {
    type: "Metabolic protocol",
    title: "Look Better.",
    description:
      "Body composition and metabolic health. The visible side of biological consistency.",
    duration: "12-16 Weeks",
    goal: "Body Composition & Longevity",
    get price() { return calculateProtocolPrice(this.stack); },
    stack: [
      ["Retatrutide", "10mg"],
      ["MOTS-C", "10mg"],
      ["GHK-CU", "10mg"],
    ],
    color: "#ff4a12",
  },
};

/* ─────────── outcomes tabs ─────────── */
const tabs = document.querySelectorAll(".outcome-tab");
const typeEl = document.querySelector("#protocolType");
const titleEl = document.querySelector("#protocolTitle");
const descriptionEl = document.querySelector("#protocolDescription");
const durationEl = document.querySelector("#protocolDuration");
const goalEl = document.querySelector("#protocolGoal");
const stackEl = document.querySelector("#protocolStack");
const protocolAddBtn = document.querySelector("#protocolAddBtn");
const protocolImagesEl = document.querySelector("#protocolImages");

const COMPOUND_IMAGES = {
  "ghkcu": "assets/ghk-cu.png",
  "bpc157tb500": "assets/bpc157-tb500.png",
  "cjc1295ipamorelin": "assets/cjc1295-ipamorelin.png",
  "semax": "assets/semax.png",
  "motsc": "assets/mots-c.png",
  "retatrutide": "assets/retatrutide.png",
};

function getCompoundImage(name) {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return COMPOUND_IMAGES[key] || "";
}

function setProtocol(key) {
  const protocol = protocols[key];
  typeEl.textContent = protocol.type;
  typeEl.style.color = protocol.color;
  titleEl.textContent = protocol.title;
  descriptionEl.textContent = protocol.description;
  durationEl.textContent = protocol.duration;
  goalEl.textContent = protocol.goal;
  stackEl.innerHTML = protocol.stack
    .map(([name, dose]) => `<li><b style="color:${protocol.color}">+</b> ${name} <strong>${dose}</strong></li>`)
    .join("");

  if (protocolAddBtn) {
    protocolAddBtn.dataset.key = key;
    protocolAddBtn.dataset.title = protocol.title.replace(".", "");
    protocolAddBtn.dataset.type = protocol.type;
    protocolAddBtn.dataset.goal = protocol.goal;
    protocolAddBtn.dataset.price = protocol.price;
    ensureQtyStepper(protocolAddBtn);
  }

  if (protocolImagesEl) {
    protocolImagesEl.innerHTML = protocol.stack
      .map(([name]) => {
        const src = getCompoundImage(name);
        return src ? `<img src="${src}" alt="${name}" loading="lazy" />` : "";
      })
      .join("");
  }

  const priceEl = document.querySelector("#protocolPrice");
  if (priceEl) priceEl.textContent = formatPrice(protocol.price);

  tabs.forEach((tab) => {
    const isActive = tab.dataset.protocol === key;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setProtocol(tab.dataset.protocol));
});

// Initialize protocol section with default tab
if (tabs.length) setProtocol("strength");

/* ─────────── cart with quantities ─────────── */
function getCart() {
  const raw = localStorage.getItem("zbCart");
  return raw ? JSON.parse(raw) : {};
}
function saveCart(cart) {
  localStorage.setItem("zbCart", JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount() {
  const cart = getCart();
  const total = Object.values(cart).reduce((sum, item) => sum + (item.qty || 0), 0);
  const el = document.getElementById("cartCount");
  if (el) el.textContent = total;
}
function getCartQty(key) {
  const cart = getCart();
  return cart[key] ? cart[key].qty : 0;
}
function addToCart(item) {
  const cart = getCart();
  if (cart[item.key]) {
    cart[item.key].qty += 1;
  } else {
    cart[item.key] = { ...item, qty: 1 };
  }
  saveCart(cart);
}
function removeOneFromCart(key) {
  const cart = getCart();
  if (cart[key]) {
    cart[key].qty -= 1;
    if (cart[key].qty <= 0) delete cart[key];
    saveCart(cart);
  }
}
function removeFromCart(key) {
  const cart = getCart();
  delete cart[key];
  saveCart(cart);
}
updateCartCount();

/* ─────────── button state rendering ─────────── */
function buildQtyStepper() {
  const stepper = document.createElement("div");
  stepper.className = "qty-stepper";
  stepper.innerHTML = `
    <span class="qty-label">Quantity</span>
    <div class="qty-row">
      <button class="qty-btn qty-minus" type="button" aria-label="Decrease quantity">−</button>
      <span class="qty-value">1</span>
      <button class="qty-btn qty-plus" type="button" aria-label="Increase quantity">+</button>
    </div>
  `;
  const minusBtn = stepper.querySelector(".qty-minus");
  const plusBtn = stepper.querySelector(".qty-plus");
  const valueEl = stepper.querySelector(".qty-value");
  minusBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    let val = parseInt(valueEl.textContent) || 1;
    if (val > 1) valueEl.textContent = val - 1;
  });
  plusBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    let val = parseInt(valueEl.textContent) || 1;
    valueEl.textContent = val + 1;
  });
  return stepper;
}

function ensureQtyStepper(btn) {
  const heroCard = btn.closest(".hero-product-card");
  if (heroCard) {
    const body = heroCard.querySelector(".product-card-body");
    if (body && !body.querySelector(".qty-stepper")) {
      body.appendChild(buildQtyStepper());
    }
    return;
  }
  if (btn.closest(".add-cart-wrapper")) return;
  const parent = btn.parentElement;
  const wrapper = document.createElement("div");
  wrapper.className = "add-cart-wrapper";
  wrapper.appendChild(buildQtyStepper());
  parent.insertBefore(wrapper, btn);
  wrapper.appendChild(btn);
}

function getQtyFromStepper(btn) {
  const heroCard = btn.closest(".hero-product-card");
  const container = heroCard || btn.closest(".add-cart-wrapper");
  const valueEl = container ? container.querySelector(".qty-value") : null;
  return valueEl ? Math.max(1, parseInt(valueEl.textContent) || 1) : 1;
}

function resetQtyStepper(btn) {
  const heroCard = btn.closest(".hero-product-card");
  const container = heroCard || btn.closest(".add-cart-wrapper");
  const valueEl = container ? container.querySelector(".qty-value") : null;
  if (valueEl) valueEl.textContent = "1";
}

function syncAllButtonStates() {
  document.querySelectorAll(".add-protocol-btn").forEach((btn) => {
    ensureQtyStepper(btn);
  });
}

document.querySelectorAll(".add-protocol-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.key;
    if (!key) return;
    const title = btn.dataset.title || (protocols[key] ? protocols[key].title.replace(".", "") : key);
    const type = btn.dataset.type || (protocols[key] ? protocols[key].type : "Peptide");
    const goal = btn.dataset.goal || (protocols[key] ? protocols[key].goal : "");
    const price = parseFloat(btn.dataset.price) || (protocols[key] ? protocols[key].price : 0);
    const stack = protocols[key] ? protocols[key].stack : null;
    const qty = getQtyFromStepper(btn);

    for (let i = 0; i < qty; i++) {
      addToCart({ key, title, type, goal, price, stack });
    }
    updateCartCount();
    resetQtyStepper(btn);
  });
});

syncAllButtonStates();

/* ─────────── peptide science models ─────────── */
const peptideModels = {
  ghk: {
    title: "Chronic Inflammation",
    body: "GHK-CU binds damaged tissue sites and activates the TGF-beta pathway. Fibroblasts produce Type I and III collagen. Systemic IL-6 and TNF-alpha drop within days. DNA repair genes upregulate. Wound closure speeds up. Connective tissue gets denser. Skin barrier function and recovery speed both improve.",
    color: "#138f2d",
    peptides: [
      { name: "GHK-CU", color: "#138f2d" },
      { name: "BPC157+TB500", color: "#1158d8" },
      { name: "MOTS-C", color: "#7a7f88" },
    ],
  },
  recovery: {
    title: "Stalled Recovery",
    body: "BPC-157 and TB-500 use different repair pathways. BPC-157 upregulates VEGF and nitric oxide synthase. New blood vessels form in damaged tendon and ligament tissue. TB-500 binds actin and speeds up cell migration to injury sites. Together they shorten inflammation, increase tensile strength of remodeled tissue, and cut recovery time between hard sessions.",
    color: "#1158d8",
    peptides: [
      { name: "BPC157+TB500", color: "#1158d8" },
      { name: "CJC1295/Ipamorelin", color: "#ffd21a" },
      { name: "GHK-CU", color: "#ff4a12" },
      { name: "MOTS-C", color: "#138f2d" },
    ],
  },
  growth: {
    title: "Low Growth Signal",
    body: "CJC-1295 extends GHRH pulse half-life. Ipamorelin triggers GH release without raising cortisol or prolactin. IGF-1 stays elevated. Nitrogen retention improves. Lipolysis increases. Slow-wave sleep deepens. Lean mass holds even in caloric deficit. Training recovery gets better as GH signaling returns to younger levels.",
    color: "#ffd21a",
    peptides: [
      { name: "CJC1295/Ipamorelin", color: "#ffd21a" },
      { name: "GHK-CU", color: "#ff4a12" },
      { name: "MOTS-C", color: "#138f2d" },
    ],
  },
  metabolic: {
    title: "Metabolic Drain",
    body: "MOTS-C is a mitochondrial peptide that moves to the nucleus and regulates metabolic genes. Glucose uptake in skeletal muscle improves. Fatty acid oxidation increases. Insulin sensitivity returns. Morning energy gets better. Metabolic recovery between training blocks shortens. Basal metabolic rate shifts measurably. No stimulant side effects.",
    color: "#ff4a12",
    peptides: [
      { name: "MOTS-C", color: "#ff4a12" },
      { name: "Retatrutide", color: "#ffd21a" },
      { name: "CJC1295/Ipamorelin", color: "#1158d8" },
    ],
  },
  bodycomp: {
    title: "Body Composition",
    body: "Retatrutide is a triple GIP, GLP-1, and glucagon receptor agonist. It suppresses appetite at the hypothalamic level. Gastric emptying slows. Energy expenditure rises through brown adipose tissue activation. The glucagon component preserves lean mass. GLP-1/GIP activity drives fat oxidation. Body fat drops. Training capacity and metabolic health markers both improve.",
    color: "#ff4a12",
    peptides: [
      { name: "Retatrutide", color: "#ff4a12" },
      { name: "MOTS-C", color: "#ffd21a" },
      { name: "GHK-CU", color: "#138f2d" },
    ],
  },
};

const peptideBiomarkers = {
  ghk: {
    title: "GHK-CU",
    color: "#138f2d",
    primary: { name: "CRP", unit: "mg/L", min: 0, max: 16 },
    markers: [
      { name: "CRP", unit: "mg/L", values: [12.0, 9.5, 7.2, 5.1, 3.8, 2.8] },
      { name: "IL-6", unit: "pg/mL", values: [8.4, 6.8, 5.2, 3.8, 2.8, 2.0] },
      { name: "Collagen density", unit: "index", values: [100, 108, 118, 130, 140, 145] },
      { name: "Skin hydration", unit: "AU", values: [32, 34, 38, 42, 46, 48] },
    ],
    narrative: [
      { week: 2, label: "Initiation", text: "CRP and IL-6 start to drop. Skin texture shows subtle improvement." },
      { week: 4, label: "Activation", text: "Collagen synthesis starts. Repair signaling is now measurable." },
      { week: 8, label: "Response", text: "Recovery speeds up. Skin elasticity gets better." },
      { week: 12, label: "Optimization", text: "Tissue remodeling peaks. DNA repair mechanisms are active." },
      { week: 16, label: "Stabilization", text: "Anti-inflammatory state holds. Tissue architecture stabilizes." },
    ],
  },
  recovery: {
    title: "BPC157 + TB500",
    color: "#1158d8",
    primary: { name: "Tendon strength", unit: "index", min: 80, max: 180 },
    markers: [
      { name: "Tendon strength", unit: "index", values: [100, 112, 128, 148, 160, 168] },
      { name: "Recovery time", unit: "hrs", values: [72, 62, 52, 42, 36, 32] },
      { name: "VEGF", unit: "pg/mL", values: [45, 52, 62, 75, 82, 86] },
      { name: "Tissue inflammation", unit: "mm", values: [15, 12, 9, 6, 4, 3] },
    ],
    narrative: [
      { week: 2, label: "Initiation", text: "Inflammation drops at injury sites. Tissue responds." },
      { week: 4, label: "Activation", text: "New capillaries form in damaged tissue." },
      { week: 8, label: "Response", text: "Structural repair speeds up. Training recovery gets shorter." },
      { week: 12, label: "Optimization", text: "Scar remodeling is active. Tensile strength improves." },
      { week: 16, label: "Stabilization", text: "Tissue resilience peaks. Repair signaling stabilizes." },
    ],
  },
  growth: {
    title: "CJC1295 / Ipamorelin",
    color: "#ffd21a",
    primary: { name: "IGF-1", unit: "ng/mL", min: 100, max: 200 },
    markers: [
      { name: "IGF-1", unit: "ng/mL", values: [120, 132, 148, 165, 178, 185] },
      { name: "Deep sleep", unit: "%", values: [12, 14, 16, 19, 21, 22] },
      { name: "Lean mass", unit: "kg", values: [0, 0.4, 1.2, 2.1, 2.8, 3.2] },
      { name: "GH pulse", unit: "mIU/L", values: [8, 10, 12, 14, 16, 18] },
    ],
    narrative: [
      { week: 2, label: "Initiation", text: "Sleep gets deeper. Morning alertness improves." },
      { week: 4, label: "Activation", text: "GH pulse amplitude goes up. IGF-1 rises." },
      { week: 8, label: "Response", text: "Lean mass holds better. Body composition shifts." },
      { week: 12, label: "Optimization", text: "Recovery windows get shorter. Sleep quality peaks." },
      { week: 16, label: "Stabilization", text: "Anabolic signaling holds. Metabolic benefits stick." },
    ],
  },
  metabolic: {
    title: "MOTS-C",
    color: "#ff4a12",
    primary: { name: "VO2 max", unit: "ml/kg/min", min: 30, max: 50 },
    markers: [
      { name: "VO2 max", unit: "ml/kg/min", values: [38, 39.5, 41.5, 43.5, 45, 46] },
      { name: "Fasting glucose", unit: "mg/dL", values: [102, 98, 94, 90, 88, 87] },
      { name: "Mitochondrial eff.", unit: "index", values: [100, 108, 118, 128, 134, 138] },
      { name: "hsCRP", unit: "mg/L", values: [3.2, 2.8, 2.2, 1.6, 1.3, 1.1] },
    ],
    narrative: [
      { week: 2, label: "Initiation", text: "Mitochondrial efficiency goes up. Baseline energy improves." },
      { week: 4, label: "Activation", text: "Metabolic flexibility improves. Glucose handling gets better." },
      { week: 8, label: "Response", text: "Endurance improves measurably. Metabolic stress recovery shortens." },
      { week: 12, label: "Optimization", text: "Metabolic inflammation drops. Repair pathways peak." },
      { week: 16, label: "Stabilization", text: "Longevity set points lock in. Energy stays up." },
    ],
  },
  bodycomp: {
    title: "Retatrutide",
    color: "#ff4a12",
    primary: { name: "HbA1c", unit: "%", min: 4.8, max: 6.0 },
    markers: [
      { name: "HbA1c", unit: "%", values: [5.8, 5.6, 5.4, 5.3, 5.2, 5.15] },
      { name: "Body fat", unit: "%", values: [28, 27, 25.5, 24, 22.5, 21.5] },
      { name: "HOMA-IR", unit: "index", values: [3.2, 2.8, 2.4, 2.1, 1.9, 1.75] },
      { name: "GLP-1 activity", unit: "index", values: [45, 55, 65, 74, 80, 83] },
    ],
    narrative: [
      { week: 2, label: "Initiation", text: "Receptors activate. Appetite regulation shifts." },
      { week: 4, label: "Activation", text: "Glucose stabilizes. Insulin sensitivity improves." },
      { week: 8, label: "Response", text: "Body composition changes are visible. Fat oxidation goes up." },
      { week: 12, label: "Optimization", text: "Metabolic set point shifts. Weight management pathways are active." },
      { week: 16, label: "Stabilization", text: "Body composition optimizes. Metabolic markers peak." },
    ],
  },
};

const WEEKS = [0, 2, 4, 8, 12, 16];
const CHART_PADDING = { top: 40, right: 30, bottom: 60, left: 70 };
let CHART_WIDTH = 820;
let CHART_HEIGHT = 420;

/* ─────────── science section DOM refs ─────────── */
const peptideButtons = document.querySelectorAll(".peptide-list button");
const scienceTitle = document.querySelector("#science-title");
const scienceBody = document.querySelector("#scienceBody");

const timelineTitle = document.querySelector("#timelineTitle");
const bioCanvas = document.querySelector("#biomarkerChart");
const bioCtx = bioCanvas ? bioCanvas.getContext("2d") : null;
const bioTooltip = document.querySelector("#chartTooltip");
const bioLegend = document.querySelector("#biomarkerLegend");
const bioMobile = document.querySelector("#biomarkerMobile");
let activePeptide = peptideModels.ghk;
let activeKey = "ghk";
let chartAnimProgress = 0;
let chartAnimStart = null;

/* ─────────── responsive canvas sizing ─────────── */
function resizeCanvas() {
  if (!bioCanvas) return;
  const wrap = bioCanvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = wrap.clientWidth;
  const cssHeight = cssWidth * (420 / 820);
  CHART_WIDTH = cssWidth;
  CHART_HEIGHT = cssHeight;
  bioCanvas.style.width = cssWidth + "px";
  bioCanvas.style.height = cssHeight + "px";
  bioCanvas.width = Math.round(cssWidth * dpr);
  bioCanvas.height = Math.round(cssHeight * dpr);
  if (bioCtx) bioCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

if (bioCanvas) {
  resizeCanvas();
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
      drawChart(1);
    }, 150);
  });
}

/* ─────────── chart helpers ─────────── */
function norm(val, min, max) { return (val - min) / (max - min); }
function chartX(i) { return CHART_PADDING.left + (i / (WEEKS.length - 1)) * (CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right); }
function chartY(val, min, max) { return CHART_PADDING.top + (1 - norm(val, min, max)) * (CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom); }

/* ─────────── chart rendering ─────────── */
function drawChart(progress = 1) {
  if (!bioCtx) return;
  const data = peptideBiomarkers[activeKey];
  if (!data) return;

  bioCtx.clearRect(0, 0, CHART_WIDTH, CHART_HEIGHT);

  // Grid
  bioCtx.strokeStyle = "#ececec";
  bioCtx.lineWidth = 1;
  for (let i = 0; i < WEEKS.length; i++) {
    const x = chartX(i);
    bioCtx.beginPath();
    bioCtx.moveTo(x, CHART_PADDING.top);
    bioCtx.lineTo(x, CHART_HEIGHT - CHART_PADDING.bottom);
    bioCtx.stroke();
  }

  // X labels
  bioCtx.fillStyle = "#666";
  bioCtx.font = "13px var(--tech), ui-monospace, monospace";
  bioCtx.textAlign = "center";
  WEEKS.forEach((w, i) => {
    bioCtx.fillText(w === 0 ? "Baseline" : `Week ${w}`, chartX(i), CHART_HEIGHT - CHART_PADDING.bottom + 24);
  });

  // Y labels (primary marker)
  const primary = data.primary;
  bioCtx.textAlign = "right";
  const ySteps = 5;
  for (let s = 0; s <= ySteps; s++) {
    const val = primary.min + (primary.max - primary.min) * (s / ySteps);
    const y = chartY(val, primary.min, primary.max);
    bioCtx.fillText(val.toFixed(1), CHART_PADDING.left - 12, y + 4);
    bioCtx.beginPath();
    bioCtx.moveTo(CHART_PADDING.left, y);
    bioCtx.lineTo(CHART_WIDTH - CHART_PADDING.right, y);
    bioCtx.strokeStyle = s === 0 ? "#d7d7d7" : "#ececec";
    bioCtx.stroke();
  }

  // Primary line + fill
  const pIdx = 0;
  const pMarker = data.markers[pIdx];
  const pts = WEEKS.map((_, i) => ({ x: chartX(i), y: chartY(pMarker.values[i], primary.min, primary.max) }));

  // Fill area
  bioCtx.fillStyle = hexToRgba(data.color, 0.08);
  bioCtx.beginPath();
  bioCtx.moveTo(pts[0].x, CHART_HEIGHT - CHART_PADDING.bottom);
  const maxI = Math.floor((pts.length - 1) * progress);
  for (let i = 0; i <= maxI; i++) bioCtx.lineTo(pts[i].x, pts[i].y);
  if (progress < 1 && maxI < pts.length - 1) {
    const frac = (progress * (pts.length - 1)) - maxI;
    const nextY = pts[maxI].y + (pts[maxI + 1].y - pts[maxI].y) * frac;
    bioCtx.lineTo(pts[maxI].x + (pts[maxI + 1].x - pts[maxI].x) * frac, nextY);
  }
  bioCtx.lineTo(pts[Math.min(maxI + (progress < 1 ? 0 : 0), pts.length - 1)].x, CHART_HEIGHT - CHART_PADDING.bottom);
  bioCtx.closePath();
  bioCtx.fill();

  // Primary line (straight segments)
  bioCtx.strokeStyle = data.color;
  bioCtx.lineWidth = 2.5;
  bioCtx.lineJoin = "miter";
  bioCtx.lineCap = "butt";
  bioCtx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const targetX = pts[i].x;
    const targetY = pts[i].y;
    if (i === 0) { bioCtx.moveTo(targetX, targetY); continue; }
    const segProgress = Math.min(1, Math.max(0, (progress * (pts.length - 1) - (i - 1))));
    if (segProgress <= 0) break;
    const prevX = pts[i - 1].x;
    const prevY = pts[i - 1].y;
    bioCtx.lineTo(prevX + (targetX - prevX) * segProgress, prevY + (targetY - prevY) * segProgress);
  }
  bioCtx.stroke();

  // Secondary lines
  data.markers.slice(1).forEach((marker, mi) => {
    const secColor = ["#8d97a8", "#b8b8b8", "#d6d6d6"][mi] || "#d6d6d6";
    const secMin = Math.min(...marker.values) * 0.9;
    const secMax = Math.max(...marker.values) * 1.1;
    const secPts = WEEKS.map((_, i) => ({ x: chartX(i), y: chartY(marker.values[i], secMin, secMax) }));
    bioCtx.strokeStyle = secColor;
    bioCtx.lineWidth = 1.2;
    bioCtx.beginPath();
    for (let i = 0; i < secPts.length; i++) {
      if (i === 0) { bioCtx.moveTo(secPts[i].x, secPts[i].y); continue; }
      const segProgress = Math.min(1, Math.max(0, (progress * (secPts.length - 1) - (i - 1))));
      if (segProgress <= 0) break;
      bioCtx.lineTo(secPts[i - 1].x + (secPts[i].x - secPts[i - 1].x) * segProgress, secPts[i - 1].y + (secPts[i].y - secPts[i - 1].y) * segProgress);
    }
    bioCtx.stroke();
  });

  // Data points (dots)
  const dotMaxI = Math.floor((pts.length - 1) * progress);
  for (let i = 0; i <= dotMaxI; i++) {
    bioCtx.fillStyle = data.color;
    bioCtx.beginPath();
    bioCtx.arc(pts[i].x, pts[i].y, 5, 0, Math.PI * 2);
    bioCtx.fill();
    bioCtx.strokeStyle = "#fff";
    bioCtx.lineWidth = 2;
    bioCtx.stroke();
  }
}

function hexToRgba(hex, alpha) {
  const v = hex.replace("#", "");
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function animateChart(timestamp) {
  chartAnimStart ||= timestamp;
  chartAnimProgress = Math.min(1, (timestamp - chartAnimStart) / 1400);
  const eased = 1 - Math.pow(1 - chartAnimProgress, 3);
  drawChart(eased);
  if (chartAnimProgress < 1) requestAnimationFrame(animateChart);
}

function renderLegend() {
  if (!bioLegend) return;
  const data = peptideBiomarkers[activeKey];
  bioLegend.innerHTML = data.markers.map((m, i) => `
    <span class="legend-item" style="color:${i === 0 ? data.color : "#8d97a8"}">
      <i class="legend-dot" style="background:${i === 0 ? data.color : "#8d97a8"}"></i>
      ${m.name}
    </span>
  `).join("");
}

function renderMobileCards() {
  if (!bioMobile) return;
  const data = peptideBiomarkers[activeKey];
  bioMobile.innerHTML = data.narrative.map((n) => `
    <div class="bio-card">
      <div class="bio-card-header">
        <span class="bio-card-week">Week ${n.week}</span>
        <span class="bio-card-label">${n.label}</span>
      </div>
      <p class="bio-card-text">${n.text}</p>
      <div class="bio-card-values">
        ${data.markers.map((m) => {
          const weekIdx = WEEKS.indexOf(n.week);
          return `<span><strong>${m.name}:</strong> ${m.values[weekIdx]} ${m.unit}</span>`;
        }).join("")}
      </div>
    </div>
  `).join("");
}

function showTooltip(weekIndex, x, y, rect) {
  if (!bioTooltip) return;
  const data = peptideBiomarkers[activeKey];
  const week = WEEKS[weekIndex];
  const narrative = data.narrative.find((n) => n.week === week);
  const label = narrative ? narrative.label : "";
  const text = narrative ? narrative.text : "";
  bioTooltip.innerHTML = `<strong>Week ${week}${label ? ": " + label : ""}</strong><p>${text}</p>`;
  bioTooltip.classList.add("visible");
  const canvasRect = rect || bioCanvas.getBoundingClientRect();
  let left = canvasRect.left + x + 16;
  let top = canvasRect.top + y - 20;
  if (left + 260 > window.innerWidth) left = canvasRect.left + x - 276;
  if (top + 160 > window.innerHeight) top = canvasRect.top + y - 160;
  bioTooltip.style.left = `${left}px`;
  bioTooltip.style.top = `${top}px`;
}

function hideTooltip() {
  if (bioTooltip) bioTooltip.classList.remove("visible");
}

if (bioCanvas) {
  function getChartColumn(e) {
    const rect = bioCanvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
    const mx = clientX - rect.left;
    const plotWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
    const relX = mx - CHART_PADDING.left;
    // Only check horizontal position; show tooltip for nearest column anywhere on canvas
    if (relX < -30 || relX > plotWidth + 30) return null;
    let idx = Math.round((relX / plotWidth) * (WEEKS.length - 1));
    idx = Math.max(0, Math.min(WEEKS.length - 1, idx));
    return { idx, rect };
  }

  let lastTooltipIdx = -1;

  bioCanvas.addEventListener("mousemove", (e) => {
    const col = getChartColumn(e);
    if (!col) { hideTooltip(); lastTooltipIdx = -1; return; }
    const { idx, rect } = col;
    const data = peptideBiomarkers[activeKey];
    if (!data) return;
    const cx = chartX(idx);
    const cy = chartY(data.markers[0].values[idx], data.primary.min, data.primary.max);
    if (idx !== lastTooltipIdx) {
      showTooltip(idx, cx, cy, rect);
      lastTooltipIdx = idx;
    }
  });

  bioCanvas.addEventListener("mouseleave", () => { hideTooltip(); lastTooltipIdx = -1; });

  bioCanvas.addEventListener("touchstart", (e) => {
    const col = getChartColumn(e);
    if (!col) return;
    const { idx, rect } = col;
    const data = peptideBiomarkers[activeKey];
    if (!data) return;
    const cx = chartX(idx);
    const cy = chartY(data.markers[0].values[idx], data.primary.min, data.primary.max);
    showTooltip(idx, cx, cy, rect);
    lastTooltipIdx = idx;
  }, { passive: true });

  bioCanvas.addEventListener("touchend", () => {
    setTimeout(() => { hideTooltip(); lastTooltipIdx = -1; }, 2500);
  });
}

/* ─────────── peptide switcher ─────────── */
function setPeptide(key) {
  activeKey = key;
  activePeptide = peptideModels[key];
  document.documentElement.style.setProperty("--active-signal", activePeptide.color);
  scienceTitle.innerHTML = `${activePeptide.title}<span>+</span>`;
  scienceBody.textContent = activePeptide.body;


  if (timelineTitle) timelineTitle.textContent = `${peptideBiomarkers[activeKey].title} Biomarkers`;
  chartAnimStart = null;
  chartAnimProgress = 0;
  renderLegend();
  renderMobileCards();
  if (bioCanvas) requestAnimationFrame(animateChart);

  peptideButtons.forEach((button) => {
    const isActive = button.dataset.peptide === key;
    button.classList.toggle("active", isActive);
    button.style.borderColor = isActive ? activePeptide.color : "transparent";
  });
}

peptideButtons.forEach((button) => {
  button.addEventListener("click", () => setPeptide(button.dataset.peptide));
});

if (scienceTitle && bioCanvas) {
  setPeptide("ghk");
}

/* ─────────── dosing calculator ─────────── */
function initCalculator() {
  const compoundSelect = document.getElementById("calcCompound");
  const doseInput = document.getElementById("calcDose");
  const syringeSelect = document.getElementById("calcSyringe");
  const bacInput = document.getElementById("calcBac");
  const doseRangeHint = document.getElementById("doseRangeHint");
  const resultsEl = document.getElementById("calculatorResults");

  if (!compoundSelect || !resultsEl) return;

  const COMPOUND_NAMES = {
    "ghk-cu": "GHK-CU",
    "semax": "Semax",
    "bpc157-tb500": "BPC157+TB500",
    "mots-c": "MOTS-C",
    "retatrutide": "Retatrutide",
    "cjc1295-ipamorelin": "CJC1295/Ipamorelin",
  };

  const COMPOUND_COLORS = {
    "ghk-cu": "#138f2d",
    "semax": "#ffd21a",
    "bpc157-tb500": "#138f2d",
    "mots-c": "#ffd21a",
    "retatrutide": "#ff4a12",
    "cjc1295-ipamorelin": "#1158d8",
  };

  // Draws a U-100 insulin syringe filled to `units` of a `maxUnits` barrel.
  // The fill animates in via CSS (scaleX), the plunger sits at the draw mark,
  // graduations are scaled to the chosen syringe, and a tag calls out the draw.
  function buildSyringe(units, maxUnits, color, unitsLabel) {
    const bx0 = 80, bx1 = 392, by0 = 52, by1 = 102;   // barrel interior box
    const span = bx1 - bx0, h = by1 - by0, cy = (by0 + by1) / 2;
    const over = units > maxUnits;
    const frac = Math.max(0.012, Math.min(1, units / maxUnits));
    const fillW = span * frac;
    const fillX = bx0 + fillW;
    const fillColor = over ? "var(--red)" : color;

    const step = maxUnits <= 50 ? 5 : 10;
    let ticks = "";
    for (let u = 0; u <= maxUnits; u += step) {
      const x = (bx0 + span * (u / maxUnits)).toFixed(1);
      const major = u % (step * 2) === 0 || u === maxUnits;
      ticks += `<line x1="${x}" y1="${by0}" x2="${x}" y2="${by0 + (major ? 13 : 7)}" class="syr-grad"/>`;
      if (major) ticks += `<text x="${x}" y="${by0 - 8}" class="syr-num">${u}</text>`;
    }

    // keep the callout tag inside the viewBox at the extremes
    const tagX = Math.max(bx0 + 4, Math.min(bx1 - 4, fillX));

    return `
    <svg class="syringe" viewBox="0 0 472 150" role="img" aria-label="U-100 syringe filled to ${unitsLabel} of ${maxUnits} units">
      <defs><clipPath id="syrClip"><rect x="${bx0}" y="${by0}" width="${span}" height="${h}" rx="4"/></clipPath></defs>
      <line x1="10" y1="${cy}" x2="50" y2="${cy}" class="syr-needle"/>
      <rect x="50" y="${cy - 6}" width="14" height="12" class="syr-hub"/>
      <path d="M64 ${cy - 6} L${bx0} ${by0} L${bx0} ${by1} L64 ${cy + 6} Z" class="syr-tip"/>
      <rect x="${bx0}" y="${by0}" width="${span}" height="${h}" rx="4" class="syr-barrel"/>
      <g clip-path="url(#syrClip)">
        <rect x="${bx0}" y="${by0}" width="${fillW.toFixed(1)}" height="${h}" class="syr-fill" style="fill:${fillColor}"/>
      </g>
      ${ticks}
      <rect x="${(fillX - 3).toFixed(1)}" y="${by0 - 2}" width="6" height="${h + 4}" class="syr-stopper"/>
      <line x1="${fillX.toFixed(1)}" y1="${cy}" x2="448" y2="${cy}" class="syr-rod"/>
      <rect x="448" y="${cy - 17}" width="10" height="34" class="syr-flange"/>
      <line x1="${tagX.toFixed(1)}" y1="${by0}" x2="${tagX.toFixed(1)}" y2="30" class="syr-call"/>
      <g transform="translate(${tagX.toFixed(1)},18)">
        <rect x="-37" y="-13" width="74" height="24" rx="3" style="fill:${fillColor}"/>
        <text x="0" y="4" class="syr-tag">${over ? "OVER MAX" : "DRAW " + unitsLabel}</text>
      </g>
    </svg>`;
  }

  let doseMode = "mg"; // "mg" or "units"

  function updateDoseHint() {
    if (doseMode === "units") {
      doseRangeHint.textContent = "(units to draw on the syringe)";
      if (doseInput) { doseInput.placeholder = "e.g. 30"; doseInput.step = "1"; }
    } else {
      const opt = compoundSelect.options[compoundSelect.selectedIndex];
      const range = opt ? opt.dataset.range || "" : "";
      doseRangeHint.textContent = range ? `(typical ${range} mg / day)` : "(mg / day)";
      if (doseInput) { doseInput.placeholder = "e.g. 1.5"; doseInput.step = "0.01"; }
    }
  }

  compoundSelect.addEventListener("change", () => { updateDoseHint(); calculate(); });

  document.querySelectorAll(".unit-toggle .unit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      doseMode = btn.dataset.mode;
      document.querySelectorAll(".unit-toggle .unit-btn").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      updateDoseHint();
      calculate();
    });
  });

  [doseInput, syringeSelect, bacInput].forEach((el) => {
    if (el) el.addEventListener("input", calculate);
  });

  function calculate() {
    const opt = compoundSelect.options[compoundSelect.selectedIndex];
    const vialMg = parseFloat(opt.dataset.conc) || 0;
    const unit = opt.dataset.unit || "";
    const key = compoundSelect.value;
    const rawDose = parseFloat(doseInput?.value) || 0;
    const syringeMl = parseFloat(syringeSelect?.value) || 0.5;
    const bacMl = parseFloat(bacInput?.value) || 2;

    if (!key || !vialMg || rawDose <= 0 || bacMl <= 0) {
      resultsEl.innerHTML = `
        <article class="calc-result-card">
          <span class="resource-line" style="background:var(--gray-400)"></span>
          <div class="resource-body">
            <p class="resource-category">Research Dosing</p>
            <h3>Enter values to calculate</h3>
            <p class="resource-desc">Select a compound and enter your desired dose to see exact syringe measurements.</p>
          </div>
        </article>
      `;
      return;
    }

    const name = COMPOUND_NAMES[key] || key;
    const color = COMPOUND_COLORS[key] || "#1158d8";
    const concMgPerMl = vialMg / bacMl;
    const unitsPerMl = 100; // U-100 standard: 100 units = 1 ml, independent of barrel size
    const maxUnits = Math.round(syringeMl * 100); // barrel capacity: 0.5ml = 50u, 1.0ml = 100u

    // dose can be entered in mg or directly in syringe units
    let doseMg, mlPerDose, unitsPerDose;
    if (doseMode === "units") {
      unitsPerDose = rawDose;
      mlPerDose = unitsPerDose / unitsPerMl;
      doseMg = mlPerDose * concMgPerMl;
    } else {
      doseMg = rawDose;
      mlPerDose = doseMg / concMgPerMl;
      unitsPerDose = mlPerDose * unitsPerMl;
    }
    const mcgPerUnit = (concMgPerMl * 1000) / unitsPerMl;
    const daysPerVial = Math.floor(vialMg / doseMg);
    const over = unitsPerDose > maxUnits;
    const unitsLabel = (unitsPerDose < 1 ? unitsPerDose.toFixed(2) : Math.round(unitsPerDose)) + " u";
    const doseMcg = Math.round(doseMg * 1000);
    const doseMgDisp = parseFloat(doseMg.toFixed(3)).toString();

    resultsEl.innerHTML = `
      <article class="calc-result-card">
        <span class="resource-line" style="background:${over ? "var(--red)" : color}"></span>
        <div class="resource-badge">
          <span class="resource-format">CALC</span>
          <span class="resource-pages">${over ? "OVER MAX" : unitsLabel}</span>
        </div>
        <div class="resource-body">
          <p class="resource-category">${name}: ${vialMg}${unit}</p>
          <h3>Dosing protocol</h3>
          <div class="syringe-viz">
            <p class="syr-title">${syringeMl}ml U-100 syringe · draw to the mark</p>
            ${buildSyringe(unitsPerDose, maxUnits, color, unitsLabel)}
          </div>
          <dl class="resource-specs">
            <div><dt>Concentration</dt><dd>${concMgPerMl.toFixed(2)} mg/ml</dd></div>
            <div><dt>Dose per injection</dt><dd>${doseMgDisp} mg (${doseMcg} mcg)</dd></div>
            <div><dt>Syringe draw</dt><dd>${unitsLabel} (${mlPerDose.toFixed(3)} ml)</dd></div>
            <div><dt>Syringe capacity</dt><dd>${maxUnits} u (${syringeMl}ml U-100)</dd></div>
            <div><dt>mcg per unit</dt><dd>${Math.round(mcgPerUnit)} mcg</dd></div>
            <div><dt>Vial duration</dt><dd>${daysPerVial} day${daysPerVial !== 1 ? "s" : ""}</dd></div>
          </dl>
          ${over
            ? `<p class="resource-desc syr-warn">This dose needs <strong>${unitsLabel}</strong>, beyond the <strong>${maxUnits}-unit</strong> capacity of a ${syringeMl}ml syringe. Use a larger syringe, split the dose across injections, or add more BAC water to lower the concentration.</p>`
            : `<p class="resource-desc">Reconstitute <strong>${vialMg}mg</strong> with <strong>${bacMl}ml</strong> bacteriostatic water. Draw <strong>${unitsLabel}</strong> on a <strong>${syringeMl}ml U-100</strong> syringe for a <strong>${doseMgDisp}mg</strong> dose.</p>`}
        </div>
      </article>
    `;
  }
}

initCalculator();


/* ─────────── final-cta plus grid ─────────── */
function initPlusGrid() {
  const grid = document.getElementById("plusGrid");
  if (!grid) return;

  const cols = 8;
  const rows = 4;
  const total = cols * rows;
  const TRAIL_LENGTH = 5;

  for (let i = 0; i < total; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    grid.appendChild(cell);
  }

  // Create a trail of plus signs
  const trail = [];
  for (let i = 0; i < TRAIL_LENGTH; i++) {
    const plus = document.createElement("span");
    plus.className = "pulse-plus";
    plus.textContent = "+";
    plus.style.opacity = i === 0 ? "1" : String(1 - i * 0.18);
    grid.appendChild(plus);
    trail.push(plus);
  }

  let currentIndex = -1;
  let moveCount = 0;

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pickDelay() {
    const phase = moveCount % 8;
    moveCount++;
    if (phase === 0 || phase === 1 || phase === 2) {
      return randomBetween(150, 400);
    } else if (phase === 3 || phase === 4) {
      return randomBetween(600, 1200);
    } else if (phase === 5) {
      return randomBetween(1400, 2200);
    } else {
      return randomBetween(300, 700);
    }
  }

  // Track recent positions for the trail
  const recentPositions = new Array(TRAIL_LENGTH).fill(-1);

  function movePlus() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * total);
    } while (newIndex === recentPositions[0] && total > 1);

    // Shift positions back: newest at [0], oldest drops off
    recentPositions.pop();
    recentPositions.unshift(newIndex);

    // Place each trail element at its position
    trail.forEach((plus, i) => {
      const pos = recentPositions[i];
      if (pos >= 0) {
        const cell = grid.children[pos];
        if (cell) cell.appendChild(plus);
      }
      // Head pulses, trail fades statically
      if (i === 0) {
        const dur = randomBetween(0.5, 1.2);
        plus.style.animation = `none`;
        plus.offsetHeight;
        plus.style.animation = `plusPulse ${dur}s ease-in-out`;
      } else {
        plus.style.animation = "none";
      }
    });

    const nextDelay = pickDelay();
    setTimeout(movePlus, nextDelay);
  }

  movePlus();
}

initPlusGrid();


/* ─────────── recovery intelligence assessment ─────────── */
function initAnalysis() {
  const tool = document.getElementById("analysis-tool");
  if (!tool) return;

  const WA_NUMBER = "61408703955";
  const LEAD_WEBHOOK = ""; // optional: POST endpoint to also push leads to a CRM

  // Signal tags accumulated from answers; drive routing.
  // SLEEP, STRESS -> Sleep & Stress | TISSUE -> Tissue | HORMONAL -> Hormonal
  // METABOLIC -> Metabolic | SYSTEMIC -> Systemic

  // Question flow. Each option: { label, points?, tags?, subFocus?, bias? }.
  // showIf(answers) gates branching questions (Q3a, Q4a).
  // Options are keyed by stable `v` (value), so copy can change without
  // breaking scoring/routing. `label` is display only.
  const QUESTIONS = [
    {
      id: "age",
      title: "First, how old are you?",
      help: "Recovery and hormones shift with every decade.",
      options: [
        { v: "u35", label: "25-34", points: 0 },
        { v: "35", label: "35-44", points: 1, tags: ["HORMONAL"] },
        { v: "45", label: "45-54", points: 2, tags: ["HORMONAL"] },
        { v: "55", label: "55+", points: 3, tags: ["HORMONAL"] },
      ],
    },
    {
      id: "goal",
      title: "What are you actually trying to fix?",
      help: "Pick the one that bugs you most.",
      options: [
        { v: "fat", label: "Lose the stubborn belly fat", bias: "METABOLIC" },
        { v: "muscle", label: "Build real muscle and strength", bias: "TISSUE" },
        { v: "recover", label: "Recover faster, train more often", bias: "TISSUE" },
        { v: "energy", label: "Kill the afternoon energy crash", bias: "STRESS" },
        { v: "sleep", label: "Finally sleep through the night", bias: "SLEEP" },
      ],
    },
    {
      id: "rundown",
      title: "Do you hit a wall during the day, foggy and running on caffeine?",
      options: [
        { v: "yes", label: "Yes, most days", points: 2, tags: ["STRESS"] },
        { v: "no", label: "No, my energy holds up", points: 0 },
      ],
    },
    {
      id: "worst",
      title: "When does it hit hardest?",
      showIf: (a) => a.rundown === "yes",
      options: [
        { v: "morning", label: "Mornings, I'm useless until coffee", tags: ["HORMONAL"] },
        { v: "arvo", label: "The 2-4pm crash", tags: ["STRESS", "METABOLIC"] },
        { v: "allday", label: "All day, I never feel switched on", points: 1, tags: ["SYSTEMIC"] },
      ],
    },
    {
      id: "post48",
      title: "Two days after a hard session, how do you feel?",
      options: [
        { v: "wrecked", label: "Still wrecked, like I got hit by a truck", points: 3, tags: ["TISSUE", "SYSTEMIC"] },
        { v: "beat", label: "Beat up and stiff", points: 2, tags: ["TISSUE"] },
        { v: "sore", label: "A little sore but mostly fine", points: 1 },
        { v: "fresh", label: "Fully recovered, ready to go again", points: 0 },
      ],
    },
    {
      id: "where",
      title: "Where do you feel it most?",
      showIf: (a) => a.post48 === "wrecked" || a.post48 === "beat",
      options: [
        { v: "musc", label: "Deep muscle soreness that lingers for days", tags: ["TISSUE"], subFocus: "muscle" },
        { v: "joint", label: "Joints and tendons, that nagging ache, and I'm not even old", tags: ["TISSUE"], subFocus: "joints" },
        { v: "whole", label: "Whole-body heaviness, like a dead battery", tags: ["SYSTEMIC"] },
      ],
    },
    {
      id: "sleepq",
      title: "How's your sleep, honestly?",
      options: [
        { v: "restless", label: "Restless, I wake up tired no matter what", points: 3, tags: ["SLEEP"] },
        { v: "miss", label: "Hit or miss", points: 2, tags: ["SLEEP"] },
        { v: "decent", label: "Mostly decent", points: 1 },
        { v: "solid", label: "Solid, I wake up sharp", points: 0 },
      ],
    },
    {
      id: "duration",
      title: "How long has this been your normal?",
      options: [
        { v: "year", label: "Over a year, I barely remember feeling good", points: 3 },
        { v: "months", label: "A few months", points: 2 },
        { v: "recent", label: "Just started recently", points: 1 },
        { v: "unsure", label: "Honestly not sure", points: 1 },
      ],
    },
    {
      id: "improve",
      title: "If one thing snapped back tomorrow, what would it be?",
      help: "Last one, used only to break a tie.",
      options: [
        { v: "i_energy", label: "Energy that lasts the whole day", bias: "STRESS" },
        { v: "i_recover", label: "Bouncing back fast between sessions", bias: "TISSUE" },
        { v: "i_lean", label: "A leaner, harder body", bias: "METABOLIC" },
        { v: "i_focus", label: "Sharp focus and a steady mood", bias: "STRESS" },
        { v: "i_all", label: "Honestly, all of it" },
      ],
    },
  ];

  const MAX_SCORE = 15; // 3 + 2 + 1 + 3 + 3 + 3 across scoring questions
  const SIGNAL_TO_TRACK = { SLEEP: "sleep", STRESS: "sleep", TISSUE: "tissue", HORMONAL: "hormonal", METABOLIC: "metabolic", SYSTEMIC: "systemic" };

  // Recovery tracks. protocolKey maps to the existing product `protocols`.
  const TRACKS = {
    sleep: {
      name: "Sleep & Stress Recovery",
      color: "#1158d8",
      protocolKey: "energy",
      focus: ["Circadian rhythm", "Stress load", "Sleep quality"],
      priorities: ["Anchor a consistent sleep and wake time", "Lower evening stimulation and stress load", "Protect deep sleep for hormone and tissue repair"],
      chart: { label: "Sleep quality index", color: "#1158d8", values: [52, 58, 66, 74, 80, 84] },
      articles: [
        { name: "Lyophilized peptide storage", href: "/resources/lyophilized-peptide-storage/" },
        { name: "Semax research overview", href: "/resources/semax-research-overview/" },
      ],
    },
    tissue: {
      name: "Training & Tissue Recovery",
      color: "#138f2d",
      protocolKey: "recovery",
      focus: ["Recovery between sessions", "Load management", "Connective tissue resilience"],
      priorities: ["Reduce accumulated recovery debt", "Support connective tissue between sessions", "Match training load to recovery capacity"],
      chart: { label: "Tissue recovery index", color: "#138f2d", values: [48, 55, 64, 74, 82, 88] },
      articles: [
        { name: "BPC-157 research overview", href: "/resources/bpc-157-research-overview/" },
        { name: "BPC-157 vs TB-500 for recovery", href: "/resources/bpc-157-vs-tb-500-recovery/" },
      ],
    },
    hormonal: {
      name: "Energy & Hormonal Optimization",
      color: "#e5bd00",
      protocolKey: "strength",
      focus: ["Daytime energy", "Drive and resilience", "Healthy aging"],
      priorities: ["Rebuild morning energy and drive", "Support the GH/IGF-1 axis through sleep and training", "Track the trend over a full training block"],
      chart: { label: "Daytime energy index", color: "#e5bd00", values: [50, 55, 62, 71, 78, 82] },
      articles: [
        { name: "CJC-1295 / Ipamorelin overview", href: "/resources/cjc1295-ipamorelin-research-overview/" },
        { name: "CJC-1295 with vs without DAC", href: "/resources/cjc-1295-with-vs-without-dac/" },
      ],
    },
    metabolic: {
      name: "Metabolic Optimization",
      color: "#ff4a12",
      protocolKey: "metabolic",
      focus: ["Body composition", "Nutrition", "Metabolic health"],
      priorities: ["Build meals around protein and fiber", "Keep resistance training to protect lean mass", "Raise daily movement (steps / NEAT)"],
      chart: { label: "Metabolic health index", color: "#ff4a12", values: [47, 52, 60, 69, 77, 82] },
      articles: [
        { name: "Retatrutide research overview", href: "/resources/retatrutide-research-overview/" },
        { name: "Retatrutide vs tirzepatide", href: "/resources/retatrutide-vs-tirzepatide/" },
      ],
    },
    systemic: {
      name: "Systemic Recovery",
      color: "#7a7f88",
      protocolKey: "recovery",
      focus: ["Whole-body recovery", "Recovery debt", "Resilience"],
      priorities: ["Address whole-body recovery debt first", "Reduce total training and life stress load", "Rebuild a consistent sleep and nutrition base"],
      chart: { label: "Recovery capacity index", color: "#7a7f88", values: [45, 51, 60, 70, 78, 83] },
      articles: [
        { name: "Common peptide research mistakes", href: "/resources/common-peptide-research-mistakes/" },
        { name: "MOTS-c research overview", href: "/resources/mots-c-research-overview/" },
      ],
    },
    foundations: {
      name: "Recovery Foundations",
      color: "#138f2d",
      protocolKey: null,
      focus: ["Sleep", "Nutrition", "Training consistency"],
      priorities: ["Lock in 7-9 hours of consistent sleep", "Hit a protein and whole-food target daily", "Build a repeatable 2-4x / week training rhythm"],
      chart: { label: "Recovery capacity index", color: "#138f2d", values: [55, 62, 70, 78, 84, 88] },
      articles: [
        { name: "Common peptide research mistakes", href: "/resources/common-peptide-research-mistakes/" },
        { name: "Peptide reconstitution guide", href: "/resources/peptide-reconstitution-bac-water-guide/" },
      ],
    },
  };

  const TIERS = [
    { key: "FOUNDATIONS", min: 0, max: 4, label: "Foundations", note: "Your responses suggest the fundamentals are the highest-leverage place to focus right now." },
    { key: "MILD", min: 5, max: 8, label: "Mild", note: "A few signals stand out. Small, consistent changes should move the needle." },
    { key: "MODERATE", min: 9, max: 12, label: "Moderate", note: "Several signals are stacking up and may be limiting your performance." },
    { key: "HIGH", min: 13, max: 99, label: "High", note: "Multiple strong signals. Worth a structured plan and a conversation with a professional." },
  ];

  const WEEKS = [0, 2, 4, 8, 12, 16];

  // ----- state -----
  const answers = {};
  let currentId = QUESTIONS[0].id;

  const progressBar = document.getElementById("anProgressBar");
  const stepCount = document.getElementById("anStepCount");
  const qTitle = document.getElementById("anQTitle");
  const qHelp = document.getElementById("anQHelp");
  const optionsEl = document.getElementById("anOptions");
  const backBtn = document.getElementById("anBack");
  const qScreen = document.getElementById("anQuestionScreen");
  const gateScreen = document.getElementById("anGateScreen");
  const resultScreen = document.getElementById("anResultScreen");

  function visibleQuestions() {
    return QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
  }
  function optionFor(qid) {
    const q = QUESTIONS.find((x) => x.id === qid);
    return q ? q.options.find((o) => o.v === answers[qid]) : null;
  }

  function showScreen(which) {
    qScreen.hidden = which !== "q";
    gateScreen.hidden = which !== "gate";
    resultScreen.hidden = which !== "result";
    tool.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderQuestion(qid) {
    const q = QUESTIONS.find((x) => x.id === qid);
    if (!q) return;
    currentId = qid;
    const vis = visibleQuestions();
    const idx = vis.findIndex((x) => x.id === qid);
    progressBar.style.width = `${Math.round(((idx + 1) / (vis.length + 1)) * 100)}%`;
    stepCount.textContent = `Question ${idx + 1} of ${vis.length}`;
    qTitle.textContent = q.title;
    qHelp.textContent = q.help || "";
    qHelp.style.display = q.help ? "block" : "none";
    optionsEl.innerHTML = q.options
      .map((o) => `<button type="button" class="an-opt${answers[qid] === o.v ? " selected" : ""}" data-val="${o.v}">${o.label}<span class="an-opt-tick">+</span></button>`)
      .join("");
    optionsEl.querySelectorAll(".an-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        answers[qid] = btn.dataset.val;
        optionsEl.querySelectorAll(".an-opt").forEach((b) => b.classList.toggle("selected", b === btn));
        setTimeout(advance, 220);
      });
    });
    backBtn.style.visibility = idx === 0 ? "hidden" : "visible";
    showScreen("q");
  }

  function advance() {
    const order = QUESTIONS.map((q) => q.id);
    const from = order.indexOf(currentId);
    for (let i = from + 1; i < QUESTIONS.length; i++) {
      const q = QUESTIONS[i];
      if (!q.showIf || q.showIf(answers)) { renderQuestion(q.id); return; }
    }
    // no more questions -> gate (or straight to result if already unlocked)
    if (localStorage.getItem("zbAnalysisUnlocked") === "true") {
      renderResult();
      showScreen("result");
    } else {
      document.getElementById("anTeaser").innerHTML = teaserText();
      progressBar.style.width = "100%";
      showScreen("gate");
    }
  }

  function goBack() {
    const order = QUESTIONS.map((q) => q.id);
    const from = order.indexOf(currentId);
    for (let i = from - 1; i >= 0; i--) {
      const q = QUESTIONS[i];
      if (!q.showIf || q.showIf(answers)) { renderQuestion(q.id); return; }
    }
  }
  backBtn.addEventListener("click", goBack);

  // ----- scoring + routing -----
  function score() {
    let total = 0;
    for (const q of visibleQuestions()) {
      const o = optionFor(q.id);
      if (o && o.points) total += o.points;
    }
    return total;
  }
  function tierFor(s) {
    return TIERS.find((t) => s >= t.min && s <= t.max) || TIERS[TIERS.length - 1];
  }
  function trackTallies() {
    const t = { sleep: 0, tissue: 0, hormonal: 0, metabolic: 0, systemic: 0 };
    for (const q of visibleQuestions()) {
      const o = optionFor(q.id);
      if (o && o.tags) for (const tag of o.tags) t[SIGNAL_TO_TRACK[tag]] += 1;
    }
    return t;
  }
  function subFocus() {
    const o = optionFor("where");
    return o && o.subFocus ? o.subFocus : null;
  }
  function routeTrack(s) {
    if (s <= 4) return "foundations";
    const t = trackTallies();
    let best = null, bestN = -1, tie = false;
    for (const k of Object.keys(t)) {
      if (t[k] > bestN) { best = k; bestN = t[k]; tie = false; }
      else if (t[k] === bestN) tie = true;
    }
    if (bestN === 0) best = null;
    if (tie || !best) {
      const goalBias = optionFor("goal");
      const improveBias = optionFor("improve");
      const biasTrack = (o) => (o && o.bias ? SIGNAL_TO_TRACK[o.bias] : null);
      best = biasTrack(goalBias) || biasTrack(improveBias) || best || "systemic";
    }
    return best;
  }

  function computeResult() {
    const s = score();
    const tier = tierFor(s);
    const trackKey = routeTrack(s);
    const track = TRACKS[trackKey];
    // Always resolve a protocol (lead-with-protocol). Foundations has none of
    // its own, so derive one from the user's stated goal.
    let protocolKey = track.protocolKey;
    if (!protocolKey) {
      const g = optionFor("goal");
      const gt = g && g.bias ? SIGNAL_TO_TRACK[g.bias] : null;
      protocolKey = (gt && TRACKS[gt] && TRACKS[gt].protocolKey) || "recovery";
    }
    const protocol = protocols[protocolKey];
    return { score: s, max: MAX_SCORE, tier, trackKey, track, protocol, protocolKey, subFocus: subFocus() };
  }

  function profileSummary(r) {
    const bits = [];
    if (answers.post48 === "wrecked" || answers.post48 === "beat") bits.push("days-long soreness after hard sessions");
    if (answers.sleepq === "restless" || answers.sleepq === "miss") bits.push("broken sleep");
    if (answers.rundown === "yes") bits.push("the daytime energy crash");
    if (r.subFocus === "joints") bits.push("nagging joints and connective tissue");
    if (r.subFocus === "muscle") bits.push("muscle soreness that lingers");
    if (answers.duration === "year" || answers.duration === "months") bits.push("a pattern that's been building for a while");
    const lead = r.trackKey === "foundations"
      ? "Your answers are actually in decent shape. The fundamentals (sleep, nutrition, training consistency) are still the highest-leverage place to push before anything else."
      : `Your answers point to recovery capacity holding you back more than training effort. The strongest signal is ${r.track.name.toLowerCase()}.`;
    const detail = bits.length ? ` What stood out: ${bits.slice(0, 3).join(", ")}.` : "";
    // age-aware agitation, tied to the actual answers (not a diagnosis)
    let edge = "";
    if ((answers.age === "35" || answers.age === "45") && r.subFocus === "joints") {
      edge = " Nagging joints and back in your 30s or 40s usually isn't just 'getting older', it's a recovery and connective-tissue signal worth taking seriously now.";
    } else if (answers.goal === "fat" && r.trackKey === "metabolic") {
      edge = " Stubborn fat that won't move on the same training and diet is often a metabolic and recovery problem, not a willpower one.";
    }
    return lead + detail + edge;
  }

  function teaserText() {
    const r = computeResult();
    return `Your recovery assessment is ready. Primary limiter: <strong>${r.track.name}</strong> at the <strong>${r.tier.label}</strong> tier. Add your details and we'll send the full breakdown and your starter guide.`;
  }

  // ----- recovery chart (self-contained, canvas) -----
  function createRecoveryChart(canvas, ds) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const PAD = { t: 24, r: 18, b: 34, l: 40 };
    let W = 640, H = 280, start = null;
    const vmin = Math.min(...ds.values) * 0.9;
    const vmax = Math.max(...ds.values) * 1.05;
    function size() {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.parentElement.clientWidth;
      H = Math.max(220, Math.round(W * 0.42));
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const x = (i) => PAD.l + (i / (WEEKS.length - 1)) * (W - PAD.l - PAD.r);
    const y = (v) => PAD.t + (1 - (v - vmin) / (vmax - vmin)) * (H - PAD.t - PAD.b);
    function draw(p) {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "#ececec"; ctx.lineWidth = 1;
      ctx.fillStyle = "#888"; ctx.font = "11px ui-monospace, monospace"; ctx.textAlign = "center";
      WEEKS.forEach((w, i) => {
        ctx.beginPath(); ctx.moveTo(x(i), PAD.t); ctx.lineTo(x(i), H - PAD.b); ctx.stroke();
        ctx.fillText(w === 0 ? "Now" : "W" + w, x(i), H - PAD.b + 18);
      });
      const pts = ds.values.map((v, i) => ({ x: x(i), y: y(v) }));
      const n = Math.max(1, Math.floor((pts.length - 1) * p));
      // area
      ctx.beginPath(); ctx.moveTo(pts[0].x, H - PAD.b);
      for (let i = 0; i <= n; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[n].x, H - PAD.b); ctx.closePath();
      ctx.fillStyle = hexA(ds.color, 0.1); ctx.fill();
      // line
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i <= n; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.strokeStyle = ds.color; ctx.lineWidth = 2.5; ctx.stroke();
      for (let i = 0; i <= n; i++) {
        ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, 4, 0, Math.PI * 2);
        ctx.fillStyle = ds.color; ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
      }
    }
    function anim(ts) {
      start ||= ts;
      const p = Math.min(1, (ts - start) / 1100);
      draw(1 - Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(anim);
    }
    // The result screen starts hidden (width 0), so size/draw only once the
    // canvas actually has width. ResizeObserver handles the hidden->visible
    // transition and keeps it responsive.
    let animated = false;
    function render() {
      if (!canvas.parentElement || canvas.parentElement.clientWidth <= 0) return;
      size();
      if (!animated) { animated = true; start = null; requestAnimationFrame(anim); }
      else draw(1);
    }
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(() => render()).observe(canvas.parentElement);
    } else {
      render();
      let rt;
      window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(render, 150); });
    }
  }
  function hexA(hex, a) {
    const v = hex.replace("#", "");
    return `rgba(${parseInt(v.slice(0, 2), 16)},${parseInt(v.slice(2, 4), 16)},${parseInt(v.slice(4, 6), 16)},${a})`;
  }

  // ----- result render -----
  function buildWaUrl(name, email, phone) {
    const r = computeResult();
    const lines = [
      "Hi Zurich Biotech, I just completed the Recovery Intelligence assessment.",
      "",
      name ? `Name: ${name}` : "",
      email ? `Email: ${email}` : "",
      phone ? `WhatsApp: ${phone}` : "",
      `Recovery score: ${r.score} / ${r.max} (${r.tier.label} tier)`,
      `Primary limiter: ${r.track.name}`,
    ];
    if (r.protocol && r.trackKey !== "foundations") {
      lines.push(`I'd like to order the "${r.protocol.title.replace(".", "")}" research protocol (${r.protocol.stack.map(([n, d]) => `${n} ${d}`).join(", ")}).`);
    } else {
      lines.push("I'd like the lifestyle starter guide for the Foundations track.");
    }
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.filter(Boolean).join("\n"))}`;
  }

  function renderResult(opts = {}) {
    const r = computeResult();
    const t = r.track;
    const pct = Math.round((r.score / r.max) * 100);

    const priorities = t.priorities.map((p) => `<li>${p}</li>`).join("");
    const articles = t.articles.map((a) => `<li><a href="${a.href}">${a.name} &rarr;</a></li>`).join("");
    const stack = r.protocol.stack.map(([n, d]) => `<li><span><b>+</b>${n}</span> <span>${d}</span></li>`).join("");

    // Protocol shows on every result. Lifestyle-first note stays above it; the
    // compound stack is framed as research-use, to discuss with a professional.
    const protocolBlock = `<div class="an-section an-why">
           <h3>The protocol we'd point you to</h3>
           <p class="an-note">Matched to your primary limiter. Research-grade compounds, sold for laboratory research only and best explored with a qualified healthcare professional. Research protocols in this area typically run ${r.protocol.duration.toLowerCase()}.</p>
           <p class="an-protocol-name"><strong>${r.protocol.title.replace(".", "")}</strong> &middot; ${r.protocol.duration}</p>
           <ul class="an-stack">${stack}</ul>
           <p class="an-price"><strong>${formatPrice(r.protocol.price)}</strong> / protocol</p>
           ${r.tier.key === "HIGH" ? `<p class="an-note">At your tier, baseline bloodwork and a conversation with a professional are worth doing before you start anything.</p>` : ""}
           ${r.tier.key === "FOUNDATIONS" ? `<p class="an-note">Honest take: at your score the basics above will do more than any compound. This is here for when you've locked those in and want to go further.</p>` : ""}
           <a class="an-wa" href="${buildWaUrl(gv("anName"), gv("anEmail"), gv("anPhone"))}" target="_blank" rel="noopener">Order on WhatsApp +</a>
         </div>`;

    document.getElementById("anResult").innerHTML = `
      <div class="an-focus">
        <span class="an-focus-line" style="background:${t.color}"></span>
        <p class="an-kicker">Recovery assessment</p>
        <h2>${t.name}</h2>
        <div class="an-scorecard">
          <div class="an-score"><span class="an-score-num" style="color:${t.color}">${r.score}</span><span class="an-score-den">/ ${r.max}</span><span class="an-score-lbl">Recovery score</span></div>
          <div class="an-meta"><p><span>Tier</span><strong>${r.tier.label}</strong></p><p><span>Primary limiter</span><strong>${t.name}</strong></p></div>
        </div>
        <div class="an-scorebar"><div class="an-scorebar-fill" style="width:${pct}%;background:${t.color}"></div></div>
      </div>

      <div class="an-section">
        <h3>Your recovery profile</h3>
        <p>${profileSummary(r)}</p>
        <p class="an-note">${r.tier.note}</p>
      </div>

      <div class="an-section">
        <h3>The reality: where this goes</h3>
        <p class="an-note">Illustrative ${t.chart.label.toLowerCase()} over a typical 16-week timeline. This is a research-protocol pattern, not a prediction or guarantee; individual responses vary.</p>
        <div class="an-chart-wrap"><canvas id="anRecoveryChart" aria-label="${t.chart.label} projection"></canvas></div>
      </div>

      <div class="an-section">
        <h3>Your priorities</h3>
        <ol class="an-priorities">${priorities}</ol>
        <div class="an-tailored"><strong>Lifestyle comes first</strong>Nothing beats 7-9 hours of quality sleep, solid nutrition, and consistent training. Peptides won't fix a shaky foundation, and you'll see most of your change from the basics before anything else.</div>
      </div>

      ${protocolBlock}

      <div class="an-section">
        <h3>Research further</h3>
        <p class="an-note">If you want to understand the science, start here. Everything is for research use only.</p>
        <ul class="an-research">${articles}</ul>
      </div>

      ${opts.email ? `<div class="an-tailored" style="border-left-color:${opts.emailSent ? "#138f2d" : "#e10600"};margin-top:8px"><strong>${opts.emailSent ? "Full breakdown emailed" : "Email could not be sent"}</strong>${opts.emailSent ? `We sent your full breakdown to <strong>${opts.email}</strong>. Check your inbox (and spam) in the next minute.` : `We couldn't email <strong>${opts.email}</strong> just now, but you can continue on WhatsApp above.`}</div>` : ""}

      <p class="an-disclaimer">This assessment is educational and is not a medical diagnosis, treatment, or prescription. Zurich Biotech supplies research-grade materials for laboratory research only; nothing here is medical advice and the compounds discussed are not for human consumption. Consult a qualified healthcare professional before changing your health routine. See our <a href="/terms.html">terms</a>.</p>
    `;
    const c = document.getElementById("anRecoveryChart");
    createRecoveryChart(c, t.chart);
  }

  function gv(id) { const el = document.getElementById(id); return el ? el.value.trim() : ""; }

  // ----- gate submit -----
  document.getElementById("anGate").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = gv("anName"), email = gv("anEmail"), phone = gv("anPhone");
    const consent = document.getElementById("anConsent").checked;
    const phoneDigits = phone.replace(/\D/g, "");
    if (!name || !/.+@.+\..+/.test(email) || phoneDigits.length < 8 || !consent) return;

    const r = computeResult();
    const payload = {
      name, email, phone, consent: true,
      result: {
        trackKey: r.trackKey, track: r.track.name, score: r.score, max: r.max,
        tier: r.tier.key, tierLabel: r.tier.label, protocolKey: r.protocolKey,
        priorities: r.track.priorities, profile: profileSummary(r),
      },
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const orig = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending your breakdown..."; }

    let emailSent = false;
    try { const res = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); emailSent = res.ok; } catch (_) {}
    try {
      const arr = JSON.parse(localStorage.getItem("zbLeads") || "[]");
      arr.push({ ...payload, emailSent, ts: new Date().toISOString() });
      localStorage.setItem("zbLeads", JSON.stringify(arr));
      localStorage.setItem("zbAnalysisUnlocked", "true");
    } catch (_) {}
    if (LEAD_WEBHOOK) { fetch(LEAD_WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => {}); }
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = orig; }

    renderResult({ email, emailSent });
    showScreen("result");
  });

  tool.querySelectorAll(".an-gate-back").forEach((b) => b.addEventListener("click", () => renderQuestion(visibleQuestions().slice(-1)[0].id)));

  // start
  renderQuestion(QUESTIONS[0].id);
}

initAnalysis();
