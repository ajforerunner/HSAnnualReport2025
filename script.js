// H&S Roadmap — animated grid of 100 clusters per stage
// Edit the `stagesData` array to change labels, percents and colors.
// Percent should be 0..100 (integers allowed)

const stagesData = [
  { label: "Stage 1 — Simplification & Standardisation", percent: 75, color: ["#7c3aed", "#06b6d4"] },
  { label: "Stage 2 — Health & Safety Performance", percent: 70, color: ["#0ea5a4", "#38bdf8"] },
  { label: "Stage 3 — Operation Ownership", percent: 60, color: ["#f59e0b", "#ef4444"] },
  { label: "Stage 4 — 4C's Coordination, Cooperation, Competence & Contractors", percent: 60, color: ["#ef4444", "#8b5cf6"] },
  { label: "Stage 5 — Independent Organisation", percent: 60, color: ["#06b6d4", "#7c3aed"] }
];

const stagesContainer = document.getElementById("stages");
const overallEl = document.getElementById("overallPercent");

// utility to create a stage
function createStageEl(stage, idx){
  const wrapper = document.createElement("div");
  wrapper.className = "stage";
  wrapper.setAttribute("role", "group");
  wrapper.setAttribute("aria-label", `${stage.label}: ${stage.percent}%`);

  // left meta
  const meta = document.createElement("div");
  meta.className = "meta";

  const title = document.createElement("h3");
  title.className = "title";
  title.textContent = stage.label;

  const sub = document.createElement("p");
  sub.className = "sub";
  sub.textContent = "100 clusters — animated fill";

  const percentWrap = document.createElement("div");
  percentWrap.className = "percent";

  const num = document.createElement("div");
  num.className = "num";
  num.textContent = "0%"; // animated

  const bar = document.createElement("div");
  bar.className = "bar";
  const fill = document.createElement("div");
  fill.className = "fill";
  bar.appendChild(fill);

  percentWrap.appendChild(num);
  percentWrap.appendChild(bar);

  meta.appendChild(title);
  meta.appendChild(sub);
  meta.appendChild(percentWrap);

  // right: grid
  const grid = document.createElement("div");
  grid.className = "grid";
  grid.setAttribute("aria-hidden", "true");

  // We'll generate cells but will control order so that fills start bottom->top, left->right
  const cols = 10, rows = 10;
  // create 100 cells but attach dataset for ordering
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const cell = document.createElement("div");
      cell.className = "cell";
      // store logical row/col for ordering
      cell.dataset.row = r;
      cell.dataset.col = c;
      grid.appendChild(cell);
    }
  }

  wrapper.appendChild(meta);
  wrapper.appendChild(grid);

  return { wrapper, grid, num, fill };
}

// order array so that fill occurs bottom-to-top, left-to-right per row
function bottomUpOrder(cols, rows){
  const order = [];
  for(let r = rows - 1; r >= 0; r--){
    for(let c = 0; c < cols; c++){
      order.push({row: r, col: c});
    }
  }
  return order;
}

// animate stage fill
function animateStage(stageEl, stageData){
  const { grid, num, fill } = stageEl;
  const cells = Array.from(grid.children);
  const cols = 10, rows = 10;
  const order = bottomUpOrder(cols, rows);

  // create mapping from row/col to cell index in DOM
  const cellMap = {};
  cells.forEach((cell, idx) => {
    cellMap[`${cell.dataset.row}-${cell.dataset.col}`] = cell;
  });

  // number of cells to fill
  const total = rows * cols;
  const fillCount = Math.round((stageData.percent / 100) * total);

  // set bar fill color
  const gradient = `linear-gradient(135deg, ${stageData.color[0]}, ${stageData.color[1]})`;
  fill.style.background = gradient;

  // animate fill: stagger each cell with slight delay
  const baseDelay = 25; // ms between each cell fill
  order.forEach((pos, idx) => {
    const key = `${pos.row}-${pos.col}`;
    const cell = cellMap[key];
    if(!cell) return;
    // compute delay
    const delay = idx * baseDelay + (Math.random() * 80); // add tiny randomness
    if(idx < fillCount){
      // schedule fill
      setTimeout(() => {
        // set background gradient per cell
        cell.style.background = gradient;
        cell.classList.add("filled");
      }, delay);
    } else {
      // optional subtle fade for unfilled items (keep as-is)
      setTimeout(() => {
        cell.style.opacity = "0.14";
      }, delay + 50);
    }
  });

  // animate the tiny progress bar to percent
  requestAnimationFrame(() => {
    fill.style.width = `${stageData.percent}%`;
  });

  // animate numeric counter for this stage
  const start = 0;
  const end = stageData.percent;
  const duration = 900; // ms
  const startTime = performance.now();
  function tick(now){
    const t = Math.min(1, (now - startTime) / duration);
    const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
    const value = Math.round(start + (end - start) * ease);
    num.textContent = value + "%";
    if(t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// compute overall percent (simple average) and animate
function animateOverall(data){
  const sum = data.reduce((s,d)=> s + d.percent, 0);
  const avg = Math.round(sum / data.length);
  const duration = 1200;
  const start = 0;
  const end = avg;
  const startTime = performance.now();
  function tick(now){
    const t = Math.min(1, (now - startTime) / duration);
    const ease = 1 - Math.pow(1 - t, 3);
    const value = Math.round(start + (end - start) * ease);
    overallEl.textContent = value + "%";
    if(t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// build DOM and schedule animations with a stagger between stages
function init(){
  stagesData.forEach((stage, i) => {
    const el = createStageEl(stage, i);
    stagesContainer.appendChild(el.wrapper);
  });

  // After adding, animate each stage with stagger so user can watch growth upward
  const children = Array.from(stagesContainer.children);
  // children are appended in same order as stagesData. Because CSS .stages uses column-reverse,
  // visually Stage 1 will be bottom. We keep animation order from bottom to top to show progress building.
  const visualOrder = children.slice().reverse(); // bottom->top order

  visualOrder.forEach((child, idx) => {
    const grid = child.querySelector(".grid");
    const num = child.querySelector(".num");
    const fill = child.querySelector(".fill");
    const stageInfo = stagesData[idx]; // match bottom->top: same index used in stagesData earlier
    // Wait a bit between stage animations
    setTimeout(() => {
      animateStage({ grid, num, fill }, stageInfo);
    }, idx * 700); // 700ms between stage animations
  });

  // animate overall percent after all stages done
  setTimeout(() => {
    animateOverall(stagesData);
  }, visualOrder.length * 700 + 200);
}

// Kick it off when DOM ready
if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
