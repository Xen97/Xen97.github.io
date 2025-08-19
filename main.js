// main.js
import { els } from "./ui.js";
import { profile, updateLevelTag } from "./profile.js";
import {
  start, pause, skip, finishNow,
  applyModeButtons, applyLengthButtons, applySoundButton,
  setMode, setLength, toggleSound, MODE, LENGTH
} from "./engine.js";
import { openAchievements, closeAchievements } from "./achievements.js";
import { setupEasterEgg } from "./easteregg.js";

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
  els.saveLogBtn.addEventListener("click", ()=>{
    import("./engine.js").then(m=> m.saveLog && m.saveLog());
  });

  // Achievements modal
  els.achievementsBtn?.addEventListener("click", openAchievements);
  els.closeAchievementsBtn?.addEventListener("click", closeAchievements);

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

  // Easter egg long press on Princess button
  setupEasterEgg(els.princessBtn);
}

function boot(){
  // initial UI sync
  updateLevelTag();
  applyModeButtons();
  applyLengthButtons();
  applySoundButton();
  import { profile, updateLevelTag, progressToNext } from "./profile.js";
import { updateLevelProgress } from "./ui.js";

// boot()
updateLevelTag();
updateLevelProgress(profile.xp, progressToNext(profile.xp));


  // idle UI text
  els.phase.textContent = "—";
  els.task.textContent = "Ready when you are.";
  els.clock.textContent = "00:00";
  els.eta.textContent = "~— left";

  wireControls();
}

boot();
