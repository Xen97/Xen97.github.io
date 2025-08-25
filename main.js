// main.js
import { els } from "./ui.js";
import {
  LS_KEYS,
  start, pause, skip, finishNow,
  applyModeButtons, applyLengthButtons, applySoundButton,
  setMode, setLength, toggleSound, MODE, LENGTH
} from "./engine.js";
import { setupEasterEgg } from "./easteregg.js";

// ---- events wiring ----
function wireControls() {
  // Mode
  els.domBtn.addEventListener("click", () => { setMode("DOM"); applyModeButtons(); });
  els.princessBtn.addEventListener("click", () => { setMode("PRINCESS"); applyModeButtons(); });
  els.soloBtn.addEventListener("click", () => {
    const next = (MODE === "PRINCESS_SOLO") ? "PRINCESS" : "PRINCESS_SOLO";
    setMode(next);
    applyModeButtons();
  });

  // Length / sound
  els.shortBtn.addEventListener("click", ()=> setLength("SHORT"));
  els.longBtn.addEventListener("click",  ()=> setLength("LONG"));
  els.soundBtn.addEventListener("click", toggleSound);

  // Transport
  els.startBtn.addEventListener("click", start);
  els.pauseBtn.addEventListener("click", pause);
  els.skipBtn.addEventListener("click",  skip);
  els.finishBtn.addEventListener("click", finishNow);

  // Summary
  els.closeSummaryBtn.addEventListener("click", ()=> els.overlay.classList.remove("show"));
  els.restartBtn.addEventListener("click", ()=>{ els.overlay.classList.remove("show"); start(); });
  els.saveLogBtn.addEventListener("click", ()=> import("./engine.js").then(m => m.saveLog && m.saveLog()));

  // Keyboard
  window.addEventListener("keydown", (e)=>{
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    if (e.code === "Space") { e.preventDefault(); pause(); }
    else if (e.key.toLowerCase() === "s") start();
    else if (e.key.toLowerCase() === "k") skip();
    else if (e.key.toLowerCase() === "f") finishNow();
    else if (e.key.toLowerCase() === "m") setMode(MODE === "DOM" ? "PRINCESS" : "DOM");
    else if (e.key.toLowerCase() === "l") setLength(LENGTH === "LONG" ? "SHORT" : "LONG");
  });
}

// ---- boot ----
function boot() {
  // Restore MODE from storage (normalize)
  const stored = localStorage.getItem(LS_KEYS.MODE);
  const normalized = (stored === "DOM" || stored === "PRINCESS" || stored === "PRINCESS_SOLO") ? stored : "PRINCESS";
  setMode(normalized);

  // Initial UI sync
  applyModeButtons();
  applyLengthButtons();
  applySoundButton();

  // Initial text
  els.phase.textContent = "—";
  els.task.textContent  = "Ready when you are.";
  els.clock.textContent = "00:00";
  els.eta.textContent   = "~— left";

  // Wire events and extras
  wireControls();
  setupEasterEgg(els.princessBtn);
}

// Only call boot once, when DOM is ready
document.addEventListener("DOMContentLoaded", boot);
