// Horizontal H&S Roadmap — Animated 10x10 clusters per stage (shadcn-like UI)
// Edit stagesData to change titles, descriptions, percentages, or colors.

const stagesData = [
  {
    id: 1,
    title: "Stage 01 — Simplification & Standardisation",
    percent: 75,
    desc:
      "Simplification and standardisation of tools to improve risk management controls for planning, management and monitoring of Health and Safety.",
    color: ["#2563eb", "#7c3aed"]
  },
  {
    id: 2,
    title: "Stage 02 — Health & Safety Performance",
    percent: 70,
    desc:
      "Defining the systems to collect, analyse and report Health and Safety performance within the business and projects for effective management reviews.",
    color: ["#06b6d4", "#0ea5a4"]
  },
  {
    id: 3,
    title: "Stage 03 — Operational Ownership",
    percent: 60,
    desc:
      "Developing clear organisational roles and responsibilities for Health and Safety along with the development of operational ownership.",
    color: ["#06b6d4", "#10b981"]
  },
  {
    id: 4,
    title: "Stage 04 — 4C's: Coordination, Cooperation, Competence & Contractors",
    percent: 60,
    desc:
      "Focusing on the 4C's of Health and Safety — coordination, cooperation, competence and contractors — to provide foundations for ongoing improvement.",
    color: ["#f59e0b", "#ef4444"]
  },
  {
    id: 5,
    title: "Stage 05 — Independent / Interdependent Organisation",
    percent: 60,
    desc:
      "Leadership and continual improvement based on a mature interdependent organisation. Using the combined stages to define future strategy.",
    color: ["#16a34a", "#86efac"]
  }
];

const roadmap = document.getElementById("roadmap");
const replayBtn = document.getElementById("replayBtn");

// create DOM card and return refs needed for animation
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
  sub.className = "subtitle-small";
  sub.textContent = `${stage.percent}% — 100 clusters`;

  titleWrap.appendChild(title);
  titleWrap.appendChild(sub);

  head.appendChild(num);
  head.appendChild(titleWrap);

  // grid 10x10
  const grid = document.createElement("div");
  grid.className = "grid";
  grid.setAttribute("aria-hidden", "true");

  const cols = 10, rows = 10;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      grid.appendChild(cell);
    }
  }

  // progress area (num + mini bar)
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

  // description
  const desc = document.createElement("div");
  desc.className = "desc";
  desc.textContent = stage.desc;

  // assemble card
  card.appendChild(head);
  card.appendChild(grid);
  card.appendChild(progress);
  card.appendChild(desc);

  return { card, grid, percNum, fill };
}

// fill order: left-to-right, bottom-to-top within each column
function leftToRightBottomUp(cols = 10, rows = 10) {
  const order = [];
  for (let c = 0; c < cols; c++) {
    for (let r = rows - 1; r >= 0; r--) {
      order.push({ row: r, col: c });
    }
  }
  return order;
}

// animate a single stage
function animateStage(refs, stageData, stageStartDelay = 0) {
  const { grid, percNum, fill } = refs;
  const cells = Array.from(grid.children);
  const cols = 10, rows = 10;
  const order = leftToRightBottomUp(cols, rows);

  // make map row-col -> cell
  const cellMap = {};
  cells.forEach(cell => {
    cellMap[`${cell.dataset.row}-${cell.dataset.col}`] = cell;
  });

  const total = cols * rows;
  const fillCount = Math.round((stageData.percent / 100) * total);

  // gradient color for this stage's fill
  const gradient = `linear-gradient(135deg, ${stageData.color[0]}, ${stageData.color[1]})`;
  fill.style.background = gradient;

  const baseDelay = 20; // ms per cell
  order.forEach((pos, idx) => {
    const key = `${pos.row}-${pos.col}`;
    const cell = cellMap[key];
    if (!cell) return;
    const delay = stageStartDelay + idx * baseDelay + Math.random() * 40;
    if (idx < fillCount) {
      setTimeout(() => {
        cell.style.background = gradient;
        cell.classList.add("filled");
      }, delay);
    } else {
      setTimeout(() => {
        cell.style.opacity = "0.12";
      }, delay + 30);
    }
  });

  // animate small progress bar width
  requestAnimationFrame(() => {
    setTimeout(() => {
      fill.style.width = `${stageData.percent}%`;
    }, stageStartDelay);
  });

  // animate numeric counter (ease-out)
  const start = 0;
  const end = stageData.percent;
  const duration = 900;
  const startTime = performance.now() + stageStartDelay;
  function tick(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = Math.round(start + (end - start) * eased);
    percNum.textContent = `${value}%`;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

let stageElements = [];

// build the roadmap DOM left-to-right
function buildRoadmap() {
  roadmap.innerHTML = "";
  stageElements = stagesData.map(stage => {
    const refs = createStageCard(stage);
    roadmap.appendChild(refs.card);
    return { refs, data: stage };
  });
}

// run animations with stage stagger
function runAnimations() {
  // reset
  stageElements.forEach(({ refs }) => {
    refs.grid.querySelectorAll(".cell").forEach(cell => {
      cell.classList.remove("filled");
      cell.style.background = "";
      cell.style.opacity = "";
    });
    refs.fill.style.width = "0%";
    refs.percNum.textContent = "0%";
  });

  // animate each stage sequentially left-to-right
  let accDelay = 0;
  stageElements.forEach(({ refs, data }, idx) => {
    // Use accDelay as stageStartDelay so each stage's cluster animation begins after previous
    setTimeout(() => animateStage(refs, data, 0), accDelay);
    accDelay += 700; // stagger start of each stage
  });
}

// init
function init() {
  buildRoadmap();
  // allow layout/paint
  setTimeout(() => runAnimations(), 200);
}

replayBtn.addEventListener("click", () => runAnimations());

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
