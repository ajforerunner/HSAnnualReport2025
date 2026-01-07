// Horizontal H&S Roadmap — 5 stages, 100 clusters each
// Edit stagesData to change titles, descriptions, percentages and colors.

const stagesData = [
  {
    id: 1,
    title: "Stage 01 — Simplification & Standardisation",
    percent: 75,
    // subtitle / description copied from the image content (used in roadmap PNG)
    desc: "Simplification and standardisation of tools to improve risk management controls for planning, management and monitoring of Health and Safety.",
    color: ["#2b6cb0", "#4f46e5"]
  },
  {
    id: 2,
    title: "Stage 02 — Health & Safety Performance",
    percent: 70,
    desc: "Defining the systems to collect, analyse and report Health and Safety performance within the business and projects for effective management reviews.",
    color: ["#0ea5a4", "#06b6d4"]
  },
  {
    id: 3,
    title: "Stage 03 — Operational Ownership",
    percent: 60,
    desc: "Developing clear organisational roles and responsibilities for Health and Safety along with the development of Operational ownership.",
    color: ["#06b6d4", "#10b981"]
  },
  {
    id: 4,
    title: "Stage 04 — 4C's: Coordination, Cooperation, Competence & Contractors",
    percent: 60,
    desc: "Focusing on the 4C's of Health and Safety — coordination, cooperation, competence and contractors — to provide foundations for ongoing improvement.",
    color: ["#f59e0b", "#ef4444"]
  },
  {
    id: 5,
    title: "Stage 05 — Independent / Interdependent Organisation",
    percent: 60,
    desc: "Leadership & continual improvement based on a mature interdependent organisation. Using the combined stages to define future strategy.",
    color: ["#16a34a", "#86efac"]
  }
];

const roadmap = document.getElementById("roadmap");
const replayBtn = document.getElementById("replayBtn");
const exportBtn = document.getElementById("exportBtn");

function createStageCard(stage) {
  const card = document.createElement("section");
  card.className = "stage";
  card.setAttribute("role", "group");
  card.setAttribute("aria-label", `${stage.title}: ${stage.percent}%`);

  // header
  const head = document.createElement("div");
  head.className = "head";

  const num = document.createElement("div");
  num.className = "stage-number";
  num.textContent = `STAGE ${String(stage.id).padStart(2, "0")}`;

  const titleWrap = document.createElement("div");
  const title = document.createElement("div");
  title.className = "title";
  title.textContent = stage.title;

  const sub = document.createElement("div");
  sub.className = "subtitle";
  sub.textContent = `${stage.percent}% complete — 100 clusters`;

  titleWrap.appendChild(title);
  titleWrap.appendChild(sub);

  head.appendChild(num);
  head.appendChild(titleWrap);

  // grid + progress
  const gridWrap = document.createElement("div");
  gridWrap.className = "grid-wrap";

  const grid = document.createElement("div");
  grid.className = "grid";
  grid.setAttribute("aria-hidden", "true");

  // create 100 cells (10x10)
  const cols = 10, rows = 10;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      // store row/col for ordering
      cell.dataset.row = r;
      cell.dataset.col = c;
      grid.appendChild(cell);
    }
  }

  // percentage display and mini progress bar
  const progress = document.createElement("div");
  progress.className = "progress";
  const percNum = document.createElement("div");
  percNum.className = "num";
  percNum.textContent = "0%";
  const bar = document.createElement("div");
  bar.className = "bar";
  const fill = document.createElement("div");
  fill.className = "fill";
  bar.appendChild(fill);
  progress.appendChild(percNum);
  progress.appendChild(bar);

  gridWrap.appendChild(grid);
  gridWrap.appendChild(progress);

  // description area (subtitle for PNG and clarity)
  const desc = document.createElement("div");
  desc.className = "desc";
  desc.textContent = stage.desc;

  card.appendChild(head);
  card.appendChild(gridWrap);
  card.appendChild(desc);

  return { card, grid, percNum, fill };
}

// order for filling: left-to-right, bottom-to-top per column (so it fills visually from bottom-left upward)
function leftToRightBottomUp(cols = 10, rows = 10) {
  const order = [];
  for (let c = 0; c < cols; c++) {
    for (let r = rows - 1; r >= 0; r--) {
      order.push({ row: r, col: c });
    }
  }
  return order;
}

function animateStage({ grid, percNum, fill }, stageData, idxDelay = 0) {
  const cells = Array.from(grid.children);
  const cols = 10, rows = 10;
  const order = leftToRightBottomUp(cols, rows);

  // map cells by row-col
  const cellMap = {};
  cells.forEach(cell => {
    cellMap[`${cell.dataset.row}-${cell.dataset.col}`] = cell;
  });

  const total = cols * rows;
  const fillCount = Math.round((stageData.percent / 100) * total);

  // gradient color per stage
  const grad = `linear-gradient(135deg, ${stageData.color[0]}, ${stageData.color[1]})`;
  fill.style.background = grad;

  const baseDelay = 18; // ms per cell
  order.forEach((pos, idx) => {
    const key = `${pos.row}-${pos.col}`;
    const cell = cellMap[key];
    if (!cell) return;
    const delay = idx * baseDelay + Math.random() * 60 + idxDelay;
    if (idx < fillCount) {
      setTimeout(() => {
        cell.style.background = grad;
        cell.classList.add("filled");
      }, delay);
    } else {
      // subtle dim for unfilled ones
      setTimeout(() => {
        cell.style.opacity = "0.12";
      }, delay + 40);
    }
  });

  // animate mini-bar
  requestAnimationFrame(() => {
    fill.style.width = `${stageData.percent}%`;
  });

  // numeric counter
  const start = 0, end = stageData.percent, duration = 900;
  const startTime = performance.now() + idxDelay;
  function tick(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const ease = t < 0 ? 0 : 1 - Math.pow(1 - t, 3);
    const value = Math.round(start + (end - start) * ease);
    percNum.textContent = `${value}%`;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

let stageElements = [];

// build roadmap cards and insert left-to-right
function buildRoadmap() {
  roadmap.innerHTML = "";
  stageElements = stagesData.map((stage) => {
    const el = createStageCard(stage);
    // append in order (left to right)
    roadmap.appendChild(el.card);
    return { el, data: stage };
  });
}

// run animations left-to-right with stagger
function runAnimations() {
  // clear any previous fill states
  stageElements.forEach(({ el }) => {
    el.grid.querySelectorAll(".cell").forEach(cell => {
      cell.classList.remove("filled");
      cell.style.background = "";
      cell.style.opacity = "";
    });
    el.fill.style.width = "0%";
    el.percNum.textContent = "0%";
  });

  // animate with staggered delays per stage
  let accumulatedDelay = 0;
  stageElements.forEach(({ el, data }, idx) => {
    // each stage animation will be slightly delayed so user watches progression
    const idxDelay = accumulatedDelay;
    setTimeout(() => {
      animateStage(el, data, 0);
    }, idxDelay);
    accumulatedDelay += 700; // ms between stages
  });
}

// Replay button
replayBtn.addEventListener("click", () => {
  runAnimations();
});

// Export PNG using html2canvas
exportBtn.addEventListener("click", async () => {
  exportBtn.disabled = true;
  exportBtn.textContent = "Rendering...";
  try {
    // clone the roadmap element into a canvas-friendly wrapper to remove scrollbars
    const node = roadmap;
    // increase scale for higher-res export
    const scale = 2;
    const canvas = await html2canvas(node, {
      backgroundColor: null,
      scale,
      useCORS: true,
      logging: false,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight
    });
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "hs-roadmap.png";
    a.click();
  } catch (err) {
    console.error("Export failed", err);
    alert("Export failed — see console for details.");
  } finally {
    exportBtn.disabled = false;
    exportBtn.textContent = "Export PNG";
  }
});

// init
function init() {
  buildRoadmap();
  // small delay to ensure DOM laid out
  setTimeout(() => runAnimations(), 200);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
