// main.js
import { els } from "./ui.js";
import {
  start, pause, skip, finishNow,
  applyModeButtons, applyLengthButtons, applySoundButton,
  setMode, setLength, toggleSound, MODE, LENGTH, setSolo
} from "./engine.js";
import { setupEasterEgg } from "./easteregg.js";

// optional: guard if you hide the button in some modes
els.soloBtn?.addEventListener("click", ()=>{
  const on = (MODE !== "PRINCESS_SOLO");
  setSolo(on);
  els.soloBtn.classList.toggle("toggled", on);
  els.soloBtn.setAttribute("aria-pressed", on ? "true" : "false");
});

function wireControls(){
  // Mode/length/sound
  els.domBtn.addEventListener("click", ()=> setMode("DOM"));
  els.princessBtn.addEventListener("click", ()=> setMode("PRINCESS"));
  els.shortBtn.addEventListener("click", ()=> setLength("SHORT"));
  els.longBtn.addEventListener("click", ()=> setLength("LONG"));
  els.soundBtn.addEventListener("click", toggleSound);

  // Transport
  els.startBtn.addEventListener("click", start);
  els.pauseBtn.addEventListener("click", pause);
  els.skipBtn.addEventListener("click", skip);
  els.finishBtn.addEventListener("click", finishNow);

  // Summary
  els.closeSummaryBtn.addEventListener("click", ()=> els.overlay.classList.remove("show"));
  els.restartBtn.addEventListener("click", ()=>{ els.overlay.classList.remove("show"); start(); });
  els.saveLogBtn.addEventListener("click", ()=> import("./engine.js").then(m=> m.saveLog && m.saveLog()));

  // Keyboard
  window.addEventListener("keydown", (e)=>{
    if(e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    if(e.code === "Space"){ e.preventDefault(); pause(); }
    else if(e.key.toLowerCase() === "s"){ start(); }
    else if(e.key.toLowerCase() === "k"){ skip(); }
    else if(e.key.toLowerCase() === "f"){ finishNow(); }
    else if(e.key.toLowerCase() === "m"){ setMode(MODE==="DOM"?"PRINCESS":"DOM"); }
    else if(e.key.toLowerCase() === "l"){ setLength(LENGTH==="LONG"?"SHORT":"LONG"); }
  });

  setupEasterEgg(els.princessBtn);
}

function boot(){
  applyModeButtons();
  applyLengthButtons();
  applySoundButton();

  els.phase.textContent = "—";
  els.task.textContent = "Ready when you are.";
  els.clock.textContent = "00:00";
  els.eta.textContent = "~— left";

  wireControls();
}
boot();
