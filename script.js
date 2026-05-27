/* ─────────── price helper ─────────── */
function formatPrice(price) {
  return "Rp" + price.toLocaleString("id-ID");
}

/* ─────────── protocols data ─────────── */
const protocols = {
  strength: {
    type: "Strength protocol",
    title: "Lift Heavier.",
    description:
      "Targets strength, muscle density, and recovery so you can train harder, recover stronger, and keep progressing.",
    duration: "12-16 Weeks",
    goal: "Strength & Muscle Performance",
    price: 5200000,
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
      "Supports clean morning output, attention, and resilient energy without turning the protocol into stimulation theater.",
    duration: "12-16 Weeks",
    goal: "Cognitive Output & Energy",
    price: 4800000,
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
      "Built around tissue repair, inflammatory load, and readiness so hard training does not become a long recovery debt.",
    duration: "12 Weeks",
    goal: "Repair & Tissue Resilience",
    price: 3700000,
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
      "Focuses on body composition, metabolic health, cellular repair, and the visible side of biological consistency.",
    duration: "12-16 Weeks",
    goal: "Body Composition & Longevity",
    price: 7600000,
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
    updateButtonState(protocolAddBtn, key);
  }

  const priceEl = document.querySelector("#protocolPrice");
  if (priceEl) priceEl.textContent = formatPrice(protocol.price) + " / protocol";

  tabs.forEach((tab) => {
    const isActive = tab.dataset.protocol === key;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setProtocol(tab.dataset.protocol));
});

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
function updateButtonState(btn, key) {
  const qty = getCartQty(key);
  const parent = btn.parentElement;
  let removeBtn = parent.querySelector(".remove-btn");

  if (qty === 0) {
    btn.innerHTML = btn.classList.contains("button-red") ? `Add <span>+</span>` : `Add Protocol <span>+</span>`;
    if (removeBtn) removeBtn.style.display = "none";
  } else {
    btn.innerHTML = `In Cart <span style="color:var(--green)">(${qty})</span>`;
    if (!removeBtn) {
      removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.textContent = "−";
      removeBtn.setAttribute("aria-label", "Remove one");
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeOneFromCart(key);
        updateButtonState(btn, key);
      });
      parent.appendChild(removeBtn);
    }
    removeBtn.style.display = "inline-flex";
  }
}

function syncAllButtonStates() {
  document.querySelectorAll(".add-protocol-btn").forEach((btn) => {
    const key = btn.dataset.key;
    if (key) updateButtonState(btn, key);
  });
}

document.querySelectorAll(".add-protocol-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.key;
    if (!key) return;
    const title = btn.dataset.title || (protocols[key] ? protocols[key].title.replace(".", "") : key);
    const type = btn.dataset.type || (protocols[key] ? protocols[key].type : "Peptide");
    const goal = btn.dataset.goal || (protocols[key] ? protocols[key].goal : "");
    const price = parseFloat(btn.dataset.price) || PROTOCOL_PRICE;
    addToCart({ key, title, type, goal, price });
    updateButtonState(btn, key);
  });
});

syncAllButtonStates();

/* ─────────── peptide science models ─────────── */
const peptideModels = {
  ghk: {
    title: "Chronic Inflammation",
    body: "Anti-inflammatory protocol for tissue repair, collagen density, and recovery speed after 30.",
    metrics: ["Tissue repair", "Collagen signaling", "Recovery quality", "Skin resilience"],
    chartTitle: "GHK-CU Anti-Inflammatory Model",
    chartSubtitle: "Tissue repair score vs. age",
    callout: "Anti-inflammatory window",
    window: [30, 48],
    decline: 0.82,
    lateDrop: 0.32,
    spread: 18,
    color: "#138f2d",
    dose: "1–2 mg / day",
    primaryPeptide: { name: "GHK-CU", color: "#138f2d", lift: 22, offset: 0 },
    peptides: [
      { name: "GHK-CU", color: "#138f2d", lift: 22, offset: 0 },
      { name: "BPC157+TB500", color: "#1158d8", lift: 17, offset: -5 },
      { name: "MOTS-C", color: "#7a7f88", lift: 14, offset: -9 },
    ],
  },
  recovery: {
    title: "Stalled Recovery",
    body: "Tissue-remodeling protocol for when training load exceeds recovery capacity and performance flatlines.",
    metrics: ["Strength output", "Training readiness", "Tissue remodeling", "Recovery velocity"],
    chartTitle: "BPC157+TB500 Remodeling Model",
    chartSubtitle: "Output score vs. age",
    callout: "Remodeling window",
    window: [32, 52],
    decline: 0.96,
    lateDrop: 0.26,
    spread: 21,
    color: "#1158d8",
    dose: "5–10 mg / week",
    primaryPeptide: { name: "BPC157+TB500", color: "#1158d8", lift: 20, offset: 1 },
    peptides: [
      { name: "BPC157+TB500", color: "#1158d8", lift: 20, offset: 1 },
      { name: "CJC1295/Ipamorelin", color: "#ffd21a", lift: 17, offset: -5 },
      { name: "GHK-CU", color: "#ff4a12", lift: 13, offset: -10 },
      { name: "MOTS-C", color: "#138f2d", lift: 11, offset: -14 },
    ],
  },
  growth: {
    title: "Low Growth Signal",
    body: "Growth-signaling protocol for sleep depth, lean-mass maintenance, and training output as GH declines with age.",
    metrics: ["GH signaling", "Sleep quality", "Lean mass", "Training output"],
    chartTitle: "CJC1295/Ipamorelin Signal Model",
    chartSubtitle: "Recovery signal vs. age",
    callout: "Signal window",
    window: [35, 55],
    decline: 1.08,
    lateDrop: 0.2,
    spread: 19,
    color: "#ffd21a",
    dose: "1–2 mg / week",
    primaryPeptide: { name: "CJC1295/Ipamorelin", color: "#ffd21a", lift: 19, offset: 2 },
    peptides: [
      { name: "CJC1295/Ipamorelin", color: "#ffd21a", lift: 19, offset: 2 },
      { name: "GHK-CU", color: "#ff4a12", lift: 15, offset: -5 },
      { name: "MOTS-C", color: "#138f2d", lift: 10, offset: -12 },
    ],
  },
  metabolic: {
    title: "Metabolic Drain",
    body: "Readiness protocol for metabolic rhythm, morning energy, and recovery depth when baseline is never reached.",
    metrics: ["Recovery depth", "Metabolic rhythm", "Morning energy", "Readiness"],
    chartTitle: "MOTS-C Readiness Model",
    chartSubtitle: "Readiness score vs. age",
    callout: "Readiness window",
    window: [30, 46],
    decline: 0.74,
    lateDrop: 0.38,
    spread: 17,
    color: "#ff4a12",
    dose: "200–300 mcg / day",
    primaryPeptide: { name: "MOTS-C", color: "#ff4a12", lift: 18, offset: 0 },
    peptides: [
      { name: "MOTS-C", color: "#ff4a12", lift: 18, offset: 0 },
      { name: "Retatrutide", color: "#ffd21a", lift: 15, offset: -5 },
      { name: "CJC1295/Ipamorelin", color: "#1158d8", lift: 12, offset: -11 },
    ],
  },
  bodycomp: {
    title: "Body Composition",
    body: "Metabolic protocol for body recomposition, fat metabolism, and visible changes in physique when diet and training are locked in.",
    metrics: ["Fat metabolism", "Insulin sensitivity", "Appetite regulation", "Body composition"],
    chartTitle: "Retatrutide Metabolic Model",
    chartSubtitle: "Metabolic score vs. age",
    callout: "Metabolic window",
    window: [28, 50],
    decline: 0.88,
    lateDrop: 0.28,
    spread: 20,
    color: "#ff4a12",
    dose: "1–2 mg / week",
    primaryPeptide: { name: "Retatrutide", color: "#ff4a12", lift: 20, offset: 1 },
    peptides: [
      { name: "Retatrutide", color: "#ff4a12", lift: 20, offset: 1 },
      { name: "MOTS-C", color: "#ffd21a", lift: 16, offset: -4 },
      { name: "GHK-CU", color: "#138f2d", lift: 12, offset: -10 },
    ],
  },
};

/* ─────────── science section DOM refs ─────────── */
const peptideButtons = document.querySelectorAll(".peptide-list button");
const scienceTitle = document.querySelector("#science-title");
const scienceBody = document.querySelector("#scienceBody");
const scienceClaim = document.querySelector("#scienceClaim");
const scienceMetrics = document.querySelector("#scienceMetrics");
const vizTitle = document.querySelector("#vizTitle");
const vizSubtitle = document.querySelector("#vizSubtitle");
const vizCallout = document.querySelector("#vizCallout");
const lineLegend = document.querySelector("#lineLegend");
const canvas = document.querySelector("#performanceChart");
const ctx = canvas ? canvas.getContext("2d") : null;
let activePeptide = peptideModels.ghk;
let activeKey = "ghk";
let chartStart;

/* ─────────── chart helpers ─────────── */
function mapX(age) {
  return 104 + ((age - 18) / 54) * 930;
}
function mapY(score) {
  return 612 - (score / 110) * 474;
}
function seededNoise(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
function supportFactor(age, window) {
  const center = (window[0] + window[1]) / 2;
  const halfRange = (window[1] - window[0]) / 2;
  const distance = Math.abs(age - center);
  const normalized = Math.max(0, 1 - distance / (halfRange + 10));
  return 0.24 + normalized * 0.76;
}
function rgba(hex, alpha) {
  const value = hex.replace("#", "");
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

/* ─────────── chart drawing ─────────── */
function drawChart(time = 0) {
  const model = activePeptide;
  const width = canvas.width;
  const height = canvas.height;
  const driftTime = time * 0.00008;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  /* axes */
  ctx.strokeStyle = "#d7d7d7";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(86, 612);
  ctx.lineTo(1082, 612);
  ctx.moveTo(1082, 112);
  ctx.lineTo(1082, 612);
  ctx.stroke();

  /* age labels + grid */
  ctx.fillStyle = "#666";
  ctx.font = "18px Helvetica, Arial, sans-serif";
  [20, 30, 40, 50, 60, 70].forEach((age) => {
    const x = mapX(age);
    ctx.fillText(age === 70 ? "70+" : age, x - 10, 662);
    ctx.strokeStyle = "#ececec";
    ctx.beginPath();
    ctx.moveTo(x, 612);
    ctx.lineTo(x, 118);
    ctx.stroke();
  });

  /* score labels */
  [0, 20, 40, 60, 80, 100].forEach((score) => {
    const y = mapY(score);
    ctx.fillText(score, 1104, y + 5);
    ctx.strokeStyle = "#e7e7e7";
    ctx.beginPath();
    ctx.moveTo(1088, y);
    ctx.lineTo(1126, y);
    ctx.stroke();
  });

  /* particles — more on the unsupported side */
  const points = 7200;
  for (let i = 0; i < points; i += 1) {
    const age = 20 + seededNoise(i + 4) * 50;
    const decline = 88 - (age - 20) * model.decline - Math.max(age - 35, 0) * model.lateDrop;
    const spread = 8 + seededNoise(i + 19) * model.spread;
    const base = decline + (seededNoise(i + 7) - 0.5) * spread;
    const supported = i % 3 === 0; /* 1/3 supported, 2/3 unsupported */
    const support = supportFactor(age, model.window);
    const peptide = model.primaryPeptide;
    const wave = Math.sin(driftTime + i * 0.017) * 1.6 + Math.cos(driftTime * 0.8 + i * 0.011) * 1.1;
    const score = supported
      ? base + peptide.lift * support + peptide.offset + seededNoise(i + 30) * 6 * support
      : base;
    const x = mapX(age + (seededNoise(i + 41) - 0.5) * 2 + Math.sin(driftTime + i) * 0.18);
    const y = mapY(Math.max(8, Math.min(106, score + wave)));
    const isActive = supported && support > 0.35;
    ctx.fillStyle = isActive ? rgba(peptide.color, 0.48) : "rgba(140, 150, 168, 0.22)";
    ctx.beginPath();
    ctx.arc(x, y, isActive ? 2.6 : 1.7, 0, Math.PI * 2);
    ctx.fill();
  }

  /* baseline curve (without support) */
  drawBaselineCurve(time);

  /* single protocol curve with pulse */
  drawProtocolCurve(model.primaryPeptide, time);

  /* window box */
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = "#777";
  ctx.strokeRect(mapX(model.window[0]), 146, mapX(model.window[1]) - mapX(model.window[0]), 398);
  ctx.setLineDash([]);

  /* window dot */
  ctx.fillStyle = "#090909";
  ctx.beginPath();
  ctx.arc(mapX(model.window[0]), 612, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#666";
  ctx.fillText("AGE", 86, 662);
}

function drawProtocolCurve(peptide, time) {
  const model = activePeptide;
  const pulse = 0.5 + Math.sin(time * 0.0017) * 0.5;
  ctx.strokeStyle = rgba(peptide.color, 0.55 + pulse * 0.36);
  ctx.lineWidth = 2.2 + pulse * 1.6;
  ctx.shadowColor = rgba(peptide.color, 0.16 + pulse * 0.24);
  ctx.shadowBlur = 4 + pulse * 14;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let step = 0; step <= 340; step += 1) {
    const age = 20 + (step / 340) * 50;
    const support = peptide.lift * supportFactor(age, model.window);
    const baseline =
      88 - (age - 20) * model.decline - Math.max(age - 35, 0) * model.lateDrop + support + peptide.offset;
    const staticShape = Math.sin(step * 0.037 + 0.9) * 1.2 + Math.cos(step * 0.015) * 0.6;
    const score = baseline + staticShape;
    const x = mapX(age);
    const y = mapY(Math.max(8, Math.min(106, score)));
    if (step === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawBaselineCurve(time) {
  const model = activePeptide;
  const pulse = 0.5 + Math.sin(time * 0.0013 + 1.7) * 0.5;
  ctx.strokeStyle = `rgba(112, 124, 142, ${0.38 + pulse * 0.22})`;
  ctx.lineWidth = 1.8 + pulse * 0.6;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let step = 0; step <= 340; step += 1) {
    const age = 20 + (step / 340) * 50;
    const baseline = 82 - (age - 20) * model.decline - Math.max(age - 35, 0) * model.lateDrop - 8;
    const staticShape = Math.sin(step * 0.035) * 0.7;
    const x = mapX(age);
    const y = mapY(Math.max(8, Math.min(106, baseline + staticShape)));
    if (step === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function animateChart(timestamp) {
  chartStart ||= timestamp;
  const progress = Math.min(1, (timestamp - chartStart) / 900);
  drawChart(timestamp);
  requestAnimationFrame(animateChart);
}

/* ─────────── peptide switcher ─────────── */
function setPeptide(key) {
  activeKey = key;
  activePeptide = peptideModels[key];
  document.documentElement.style.setProperty("--active-signal", activePeptide.color);
  scienceTitle.innerHTML = `${activePeptide.title}<span>+</span>`;
  scienceBody.textContent = activePeptide.body;
  scienceMetrics.innerHTML = activePeptide.peptides
    .map((p) => `<li><span style="color:${p.color}">+</span> ${p.name}</li>`)
    .join("");
  if (vizTitle) vizTitle.textContent = activePeptide.chartTitle;
  if (vizSubtitle) vizSubtitle.textContent = activePeptide.chartSubtitle;
  if (vizCallout)
    vizCallout.innerHTML = `+ ${activePeptide.callout}<br /><small>${activePeptide.window[0]}-${activePeptide.window[1]} years</small>`;
  if (lineLegend)
    lineLegend.innerHTML = `<i class="dot red"></i> ${activePeptide.primaryPeptide.name}`;
  peptideButtons.forEach((button) => {
    const isActive = button.dataset.peptide === key;
    button.classList.toggle("active", isActive);
    button.style.borderColor = isActive ? activePeptide.color : "transparent";
  });
  chartStart = undefined;
}

peptideButtons.forEach((button) => {
  button.addEventListener("click", () => setPeptide(button.dataset.peptide));
});

if (scienceTitle && canvas) {
  setPeptide("ghk");
  requestAnimationFrame(animateChart);
}


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
