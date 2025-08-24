// ui.js
export const $ = (s) => document.querySelector(s);

export const els = {
  overlay: $("#overlay"),
  summaryMode: $("#summaryMode"),
  sumDuration: $("#sumDuration"),
  sumSteps: $("#sumSteps"),
  sumRests: $("#sumRests"),
  sumSkips: $("#sumSkips"),
  sumFinisher: $("#sumFinisher"),
  sumTimes: $("#sumTimes"),
  saveLogBtn: $("#saveLogBtn"),
  restartBtn: $("#restartBtn"),
  closeSummaryBtn: $("#closeSummaryBtn"),
  soloBtn: document.getElementById("soloBtn"),


  modeTag: $("#modeTag"),
  domBtn: $("#domBtn"),
  princessBtn: $("#princessBtn"),
  shortBtn: $("#shortBtn"),
  longBtn: $("#longBtn"),

  startBtn: $("#startBtn"),
  pauseBtn: $("#pauseBtn"),
  skipBtn: $("#skipBtn"),
  finishBtn: $("#finishBtn"),
  soundBtn: $("#soundBtn"),

  phaseCard: $("#phaseCard"),
  phase: $("#phase"),
  task: $("#task"),
  meterFill: $("#meterFill"),
  clock: $("#clock"),
  eta: $("#eta"),
  log: $("#log"),

  // Easter egg
  ribbonEl: document.getElementById("secretRibbon"),
  confettiCanvas: document.getElementById("confetti"),
};

const ICONS = {
  info: "📝", phase: "🧭", task: "🎯", rest:"🌙", skip:"⏭️", pause:"⏸️", resume:"▶️", finisher:"🏁"
};
function ts() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
}
export function log(msg, kind="info"){
  const line = document.createElement('div');
  const icon = ICONS[kind] || ICONS.info;
  line.textContent = `${icon} [${ts()}] ${msg}`;
  els.log.appendChild(line);
  els.log.scrollTop = els.log.scrollHeight;
}
export function addDivider(label){
  const div = document.createElement('div');
  div.className = 'divider';
  div.innerHTML = `<span>🧭 ${label}</span>`;
  els.log.appendChild(div);
  els.log.scrollTop = els.log.scrollHeight;
}

export function setPrimary(btn, on){
  btn.classList.toggle("primary", !!on);
  btn.setAttribute("aria-pressed", on ? "true" : "false");
}
export function setModeTag(mode){
  els.modeTag.textContent = mode === "DOM" ? "Dom Mode" : "Princess Mode";
}

export function mmss(s){
  const m=Math.floor(s/60), sec=Math.max(0, Math.floor(s%60));
  return String(m).padStart(2,'0')+":"+String(sec).padStart(2,'0');
}

