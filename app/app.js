const STORAGE_KEY = "leonida-field-guide-progress-v1";
const SPOILER_KEY = "leonida-field-guide-spoilers-v1";
const dataResponse = await fetch("data/trophies.json");
if (!dataResponse.ok) throw new Error("Trophy data could not be loaded.");
const catalog = await dataResponse.json();
const trophies = catalog.trophies;
const byName = new Map(trophies.map((t) => [t.name, t.id]));
const earned = new Set();
let selectedId = trophies[0]?.id ?? null;
let activeView = "tracker";
const $ = (selector) => document.querySelector(selector);
const list = $("#trophy-list");
const detail = $("#detail-panel");
const filters = { search: $("#search"), kind: $("#kind"), grade: $("#grade"), status: $("#status") };
const spoilerBox = $("#spoilers");
const spoilerMissable = $("#spoilers-missable");

function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const names = Array.isArray(saved) ? saved : saved.earned;
    if (Array.isArray(names)) for (const item of names) {
      const id = typeof item === "number" ? item : byName.get(item);
      if (trophies.some((t) => t.id === id)) earned.add(id);
    }
    spoilerBox.checked = localStorage.getItem(SPOILER_KEY) !== "off";
  } catch {
    spoilerBox.checked = true;
  }
  spoilerMissable.checked = spoilerBox.checked;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trophies.filter((t) => earned.has(t.id)).map((t) => t.name)));
  } catch {
    announce("Browser storage is unavailable here.");
  }
}

function announce(message) {
  const note = $("#notice");
  note.textContent = message;
  window.clearTimeout(announce.timer);
  announce.timer = window.setTimeout(() => { note.textContent = ""; }, 3000);
}

function isMasked(t) {
  return t.kind === "story" && spoilerBox.checked && !earned.has(t.id);
}

function titleFor(t) {
  return isMasked(t) ? "Story trophy hidden" : t.name;
}

function descriptionFor(t) {
  return isMasked(t) ? "Mark this trophy earned to reveal its title and description." : t.description;
}

function updateProgress() {
  const count = earned.size;
  const percentage = Math.round((count / trophies.length) * 100);
  $("#earned-count").textContent = count + " / " + trophies.length;
  $("#percent").textContent = percentage + "%";
  $("#progress-fill").style.width = percentage + "%";
  $("#platinum-state").textContent = earned.has(1) ? "EARNED" : "WAITING";
  $("#platinum-state").style.color = earned.has(1) ? "var(--acid)" : "var(--orange)";
}

function badge(t) {
  const grades = { platinum: "P", gold: "G", silver: "S", bronze: "B" };
  const node = document.createElement("span");
  node.className = "grade " + t.grade;
  node.textContent = grades[t.grade] || t.grade.slice(0, 1).toUpperCase();
  node.title = t.grade + " trophy";
  return node;
}

function makeRow(t) {
  const row = document.createElement("button");
  row.type = "button";
  row.className = "trophy-row" + (selectedId === t.id ? " selected" : "");
  row.setAttribute("aria-pressed", String(selectedId === t.id));
  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = earned.has(t.id);
  check.setAttribute("aria-label", "Mark " + t.name + " earned");
  check.addEventListener("click", (event) => event.stopPropagation());
  check.addEventListener("change", () => {
    if (check.checked) earned.add(t.id); else earned.delete(t.id);
    persist(); updateProgress(); renderList(); renderDetail(); renderRoadmap(); renderMissables();
  });
  const copy = document.createElement("span"); copy.className = "row-copy";
  const name = document.createElement("span"); name.className = "row-name"; name.textContent = titleFor(t);
  const description = document.createElement("span"); description.className = "row-description"; description.textContent = descriptionFor(t);
  copy.append(name, description);
  const tags = document.createElement("span"); tags.className = "row-tags";
  if (t.missable) {
    const flag = document.createElement("span"); flag.className = "missable-dot"; flag.textContent = "MISSABLE"; tags.append(flag);
  }
  tags.append(badge(t)); row.append(check, copy, tags);
  row.addEventListener("click", () => { selectedId = t.id; renderList(); renderDetail(); });
  return row;
}

function matches(t) {
  const query = filters.search.value.trim().toLocaleLowerCase();
  const text = (t.name + " " + t.description + " " + t.guide).toLocaleLowerCase();
  if (query && !text.includes(query)) return false;
  if (filters.grade.value !== "all" && t.grade !== filters.grade.value) return false;
  if (filters.status.value === "earned" && !earned.has(t.id)) return false;
  if (filters.status.value === "unearned" && earned.has(t.id)) return false;
  if (filters.kind.value === "missable" && !t.missable) return false;
  if (filters.kind.value !== "all" && filters.kind.value !== "missable" && t.kind !== filters.kind.value) return false;
  return true;
}

function renderList() {
  const visible = trophies.filter(matches);
  list.replaceChildren(...visible.map(makeRow));
  $("#result-count").textContent = visible.length + " shown";
  $("#empty-state").hidden = visible.length > 0;
}

function renderDetail() {
  const t = trophies.find((item) => item.id === selectedId) || trophies[0];
  if (!t) return;
  detail.replaceChildren();
  const top = document.createElement("div"); top.className = "detail-top";
  const kicker = document.createElement("span"); kicker.className = "detail-kicker";
  kicker.textContent = String(t.id).padStart(2, "0") + " / 55  ·  " + t.kind.toUpperCase();
  top.append(kicker, badge(t));
  const title = document.createElement("h2"); title.textContent = titleFor(t);
  const description = document.createElement("p"); description.className = "detail-description"; description.textContent = descriptionFor(t);
  const rule = document.createElement("div"); rule.className = "detail-rule";
  const label = document.createElement("div"); label.className = "guide-label"; label.textContent = "FIELD NOTE / HOW TO EARN IT";
  const guide = document.createElement("p"); guide.className = "guide-copy";
  guide.textContent = isMasked(t) ? "Story guidance is hidden with its trophy. Mark it earned to reveal the note." : t.guide;
  const sourcesHeading = document.createElement("div"); sourcesHeading.className = "guide-label"; sourcesHeading.textContent = "SOURCES / TROPHY LISTS";
  const sources = document.createElement("div"); sources.className = "source-list";
  for (const source of t.sources || []) {
    const anchor = document.createElement("a"); anchor.className = "source-link"; anchor.textContent = source.name;
    anchor.href = source.url; anchor.target = "_blank"; anchor.rel = "noopener noreferrer"; sources.append(anchor);
  }
  const checkboxLabel = document.createElement("label"); checkboxLabel.className = "detail-check";
  const checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.checked = earned.has(t.id);
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) earned.add(t.id); else earned.delete(t.id);
    persist(); updateProgress(); renderList(); renderDetail(); renderRoadmap(); renderMissables();
  });
  checkboxLabel.append(checkbox, document.createTextNode(earned.has(t.id) ? "Earned — saved on this device" : "Mark earned — saves on this device"));
  const missable = document.createElement("div"); missable.className = "missable-note";
  missable.textContent = t.missable ? "Missable flag · the listed condition may be time limited" : "No missable cutoff stated in the published description";
  detail.append(top, title, description, rule, label, guide, sourcesHeading, sources, checkboxLabel, missable);
}

const stageNotes = {
  Story: "Clear the named chapters and missions. The list does not establish their unlock order.",
  Collectibles: "Sweep map and set based objectives after story access opens; totals follow the published wording.",
  Activities: "Work through races, challenges, side strands and other repeatable objectives.",
  Cleanup: "Use the in-game completion breakdown, then earn the remaining platinum requirement."
};
const stageOrder = ["Story", "Collectibles", "Activities", "Cleanup"];
function renderRoadmap() {
  const root = $("#roadmap"); root.replaceChildren();
  stageOrder.forEach((stage, index) => {
    const items = trophies.filter((t) => t.roadmap_stage === stage);
    const section = document.createElement("section"); section.className = "stage";
    const head = document.createElement("header"); head.className = "stage-head";
    const number = document.createElement("span"); number.className = "stage-number";
    number.textContent = "PHASE 0" + (index + 1) + " / " + items.length + " TROPHIES";
    const title = document.createElement("h3"); title.textContent = stage;
    const note = document.createElement("p"); note.textContent = stageNotes[stage]; head.append(number, title, note);
    const body = document.createElement("div"); body.className = "stage-items";
    for (const t of items) {
      const item = document.createElement("div"); item.className = "stage-item";
      const id = document.createElement("span"); id.className = "stage-id"; id.textContent = String(t.id).padStart(2, "0");
      const copy = document.createElement("div");
      const name = document.createElement("strong"); name.textContent = titleFor(t);
      const desc = document.createElement("small"); desc.textContent = descriptionFor(t);
      copy.append(name, desc); item.append(id, copy); body.append(item);
    }
    const foot = document.createElement("div"); foot.className = "stage-foot";
    foot.textContent = items.filter((t) => earned.has(t.id)).length + " / " + items.length + " COMPLETE";
    section.append(head, body, foot); root.append(section);
  });
}

function renderMissables() {
  const root = $("#missable-list"); root.replaceChildren();
  for (const t of trophies) {
    const item = document.createElement("article"); item.className = "missable-item";
    const top = document.createElement("div"); top.className = "missable-item-top";
    const title = document.createElement("strong"); title.textContent = titleFor(t);
    const flag = document.createElement("span"); flag.className = "status-pill neutral";
    flag.textContent = t.missable ? "MISSABLE" : "NO CUTOFF STATED"; top.append(title, flag);
    const note = document.createElement("p");
    note.textContent = isMasked(t) ? "Story description hidden until earned." : t.missable ? "Review timing before starting this objective." : "The public description gives no irreversible failure window.";
    item.append(top, note); root.append(item);
  }
}

function showView(view) {
  activeView = ["tracker", "roadmap", "missables"].includes(view) ? view : "tracker";
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === activeView));
  document.querySelectorAll(".view").forEach((panel) => {
    const active = panel.id === activeView + "-view"; panel.hidden = !active; panel.classList.toggle("active", active);
  });
}

function importProgress(value) {
  const items = Array.isArray(value) ? value : value?.earned;
  if (!Array.isArray(items)) throw new Error("Expected an earned array.");
  earned.clear();
  for (const item of items) {
    const id = typeof item === "number" ? item : byName.get(item);
    if (trophies.some((t) => t.id === id)) earned.add(id);
  }
  persist(); updateProgress(); renderList(); renderDetail(); renderRoadmap(); renderMissables();
}

for (const control of Object.values(filters)) control.addEventListener("input", renderList);
for (const control of Object.values(filters)) control.addEventListener("change", renderList);
spoilerBox.addEventListener("change", () => {
  localStorage.setItem(SPOILER_KEY, spoilerBox.checked ? "on" : "off");
  spoilerMissable.checked = spoilerBox.checked; renderList(); renderDetail(); renderRoadmap(); renderMissables();
});
spoilerMissable.addEventListener("change", () => { spoilerBox.checked = spoilerMissable.checked; spoilerBox.dispatchEvent(new Event("change")); });
document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => showView(tab.dataset.view)));
$("#export").addEventListener("click", () => {
  const payload = { format: "leonida-field-guide-progress-v1", game: catalog.game, earned: trophies.filter((t) => earned.has(t.id)).map((t) => t.name) };
  const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a"); anchor.href = objectUrl; anchor.download = "leonida-trophy-progress.json"; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000); announce("Progress exported as JSON.");
});
$("#import").addEventListener("change", async (event) => {
  const file = event.target.files?.[0]; if (!file) return;
  try { importProgress(JSON.parse(await file.text())); announce("Progress imported."); }
  catch { announce("Could not read that progress file."); }
  event.target.value = "";
});

loadSaved();
renderList(); renderDetail(); renderRoadmap(); renderMissables(); updateProgress();
const requestedView = new URLSearchParams(window.location.search).get("view");
showView(requestedView || activeView);
