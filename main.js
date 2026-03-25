// main.js
import { els, setPrimary } from "./ui.js";
import {
  LS_KEYS,
  start, pause, skip, finishNow,
  applyModeButtons, applyLengthButtons, applySoundButton,
  applyToyBiasButtons, toggleToyBiasVisibility,
  setMode, setLength, toggleSound, MODE, LENGTH
} from "./engine.js";
import { setToyBias, SOLO_TOY_BIAS } from "./tasks.js";
import { setupEasterEgg } from "./easteregg.js";

// ---- events wiring ----
function wireControls() {
  // Mode buttons
  els.domBtn.addEventListener("click", () => { setMode("DOM"); applyModeButtons(); });
  els.princessBtn.addEventListener("click", () => { setMode("PRINCESS"); applyModeButtons(); });
  els.soloBtn.addEventListener("click", () => {
    const next = (MODE === "PRINCESS_SOLO") ? "PRINCESS" : "PRINCESS_SOLO";
    setMode(next);
    applyModeButtons();
  });

  // Toy bias buttons (moved here – outside the soloBtn listener)
  els.biasSuckyBtn.addEventListener("click", () => {
    setToyBias("SUCKY_HEAVY");
    applyToyBiasButtons();
  });
  els.biasBalancedBtn.addEventListener("click", () => {
    setToyBias("BALANCED");
    applyToyBiasButtons();
  });
  els.biasWandBtn.addEventListener("click", () => {
    setToyBias("WAND_HEAVY");
    applyToyBiasButtons();
  });

  // Length / sound
  els.shortBtn.addEventListener("click", () => setLength("SHORT"));
  els.longBtn.addEventListener("click",  () => setLength("LONG"));
  els.soundBtn.addEventListener("click", toggleSound);

  // Transport
  els.startBtn.addEventListener("click", start);
  els.pauseBtn.addEventListener("click", pause);
  els.skipBtn.addEventListener("click",  skip);
  els.finishBtn.addEventListener("click", finishNow);

  // Summary
  els.closeSummaryBtn.addEventListener("click", () => els.overlay.classList.remove("show"));
  els.restartBtn.addEventListener("click", () => { els.overlay.classList.remove("show"); start(); });
  els.saveLogBtn.addEventListener("click", () => import("./engine.js").then(m => m.saveLog && m.saveLog()));

  // Keyboard
  window.addEventListener("keydown", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    if (e.code === "Space") { e.preventDefault(); pause(); }
    else if (e.key.toLowerCase() === "s") start();
    else if (e.key.toLowerCase() === "k") skip();
    else if (e.key.toLowerCase() === "f") finishNow();
    else if (e.key.toLowerCase() === "m") setMode(MODE === "DOM" ? "PRINCESS" : "DOM");
    else if (e.key.toLowerCase() === "l") setLength(LENGTH === "LONG" ? "SHORT" : "LONG");
  });
}

// Add these two functions (you can put them right before boot())
export function applyToyBiasButtons() {
  const b = SOLO_TOY_BIAS;
  setPrimary(els.biasSuckyBtn,    b === "SUCKY_HEAVY");
  setPrimary(els.biasBalancedBtn, b === "BALANCED");
  setPrimary(els.biasWandBtn,     b === "WAND_HEAVY");
}

export function toggleToyBiasVisibility() {
  const show = MODE === "PRINCESS" || MODE === "PRINCESS_SOLO";
  if (els.toyBiasGroup) els.toyBiasGroup.style.display = show ? "flex" : "none";
}

// ---- boot ----
function boot() {
  const stored = localStorage.getItem(LS_KEYS.MODE);
  const normalized = (stored === "DOM" || stored === "PRINCESS" || stored === "PRINCESS_SOLO")
    ? stored
    : "PRINCESS";
  setMode(normalized);

  const savedBias = localStorage.getItem("sc_soloBias");
  if (savedBias) setToyBias(savedBias);

  applyModeButtons();
  applyLengthButtons();
  applySoundButton();
  applyToyBiasButtons();

  els.phase.textContent = "—";
  els.task.textContent  = "Ready when you are.";
  els.clock.textContent = "00:00";
  els.eta.textContent   = "~— left";

  wireControls();
  setupEasterEgg(els.princessBtn);
}

document.addEventListener("DOMContentLoaded", boot);
