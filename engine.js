// engine.js

// UI helpers
import { els, log, addDivider, setPrimary, setModeTag, mmss } from "./ui.js";

// Task pools & utilities
import {
  // DOM + Princess pools
  D_WARM_PALM, D_WARM_STROKE, D_MID_PALM, D_MID_STROKE, D_OVER_PALM, D_OVER_STROKE, D_FINISH,
  P_WARM, P_BUILD, P_OVER, P_FINISH,

  // Timing + chooser utils
  timesFor, randInt, choice, maybeRest, resetChooser, choiceLimitedFrom,

  // Solo Princess
  SOLO_POOLS, SOLO_MODIFIERS,
  SOLO_SUCKY_WARM, SOLO_SUCKY_BUILD, SOLO_SUCKY_OVER,
  SOLO_WAND_WARM,  SOLO_WAND_BUILD,  SOLO_WAND_OVER,
  SOLO_ZUMIO_WARM, SOLO_ZUMIO_BUILD, SOLO_ZUMIO_OVER
} from "./tasks.js";

/* ---------------- Preferences ---------------- */
export const LS_KEYS = { MODE:'sc_mode', LENGTH:'sc_length', SOUND:'sc_sound' };
export let MODE   = localStorage.getItem(LS_KEYS.MODE)   || "PRINCESS"; // "DOM" | "PRINCESS" | "PRINCESS_SOLO"
export let LENGTH = localStorage.getItem(LS_KEYS.LENGTH) || "LONG";     // "SHORT" | "LONG"
export let SOUND  = localStorage.getItem(LS_KEYS.SOUND)  === "1";       // boolean

/* ---------------- Runtime session state ---------------- */
let plan = [];              // [{phase, kind, text, dur, toy?}]
let finisherPool = [];      // array of strings, empty in Solo
let current = 0;            // index into plan
let remain = 0;             // seconds remaining in current step
let totalRemain = 0;        // seconds remaining in whole plan
let ticking = false;
let lastTs = 0;
let intervalId = null;

let sessionStart = null;
let sessionEnd   = null;

let completedSteps = 0;
let restCount = 0;
let skipCount = 0;
let finisherUsed = "—";
let prevPhase = "";

/* ---------------- Audio (tiny chime) ---------------- */
let audioCtx = null;
function playChime(){
  if(!SOUND) return;
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sine"; o.frequency.value = 880; g.gain.value = 0.0001;
    o.connect(g); g.connect(audioCtx.destination); o.start();
    const now = audioCtx.currentTime;
    g.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    o.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.20);
    o.stop(now + 0.22);
  }catch(e){}
}

/* ---------------- Helpers ---------------- */
function computeTotalRemain(fromIndex=0){
  return plan.slice(fromIndex).reduce((a,b)=> a + (b?.dur || 0), 0);
}
function startTicking(){ stopTicking(); ticking = true; lastTs = performance.now(); intervalId = setInterval(onTickFrame, 200); }
function stopTicking(){ ticking = false; if(intervalId){ clearInterval(intervalId); intervalId = null; } }
function onTickFrame(){
  const now = performance.now();
  const elapsed = (now - lastTs)/1000;
  lastTs = now;
  step(elapsed);
  updateMeterAndTimes();
}
function flashPhase(){
  els.phaseCard.classList.remove("phase-flash");
  void els.phaseCard.offsetWidth;            // reflow
  els.phaseCard.classList.add("phase-flash");
}
function pickWeighted(entries){
  // entries: [{item:'SUCKY', w:10}, ...]
  const total = entries.reduce((a,b)=>a+b.w,0);
  let r = Math.random()*total;
  for(const e of entries){ r -= e.w; if(r <= 0) return e.item; }
  return entries[0]?.item;
}

/* ---------------- Public controls ---------------- */
export function start(){
  resetChooser();
  current = 0; completedSteps = 0; restCount = 0; skipCount = 0; finisherUsed = "—"; prevPhase = "";

  const r = buildPlanForMode();
  plan = r.plan;
  finisherPool = r.finisherPool;

  remain = plan[0]?.dur || 0;
  totalRemain = computeTotalRemain(0);
  sessionStart = new Date(); sessionEnd = null;

  render(true);
  log(`Session started (${MODE}, ${LENGTH})`, "info");
  startTicking();
}

export function pause(){
  if(ticking){ stopTicking(); log("Paused","pause"); }
  else { startTicking(); log("Resumed","resume"); }
}

export function skip(){
  if(!plan[current]) return;
  log(`Skipped: ${(plan[current].kind?plan[current].kind+": ":"")}${plan[current].text}`, "skip");
  skipCount++;
  remain = 0.0001; // let step() advance on next tick
}

export function finishNow(){
  stopTicking();
  const f = choice(finisherPool);
  finisherUsed = f || "Denied (Solo)";
  els.phase.textContent = "Finisher";
  els.task.textContent  = finisherUsed;
  log("Finisher (manual): " + finisherUsed, "finisher");
  els.meterFill.style.width = "0%";
  els.clock.textContent = "00:00";
  els.eta.textContent   = "~00:00 left";
  sessionEnd = new Date();
  openSummary();
}

/* ---------------- Mode & prefs ---------------- */
export function setMode(m){
  MODE = m;
  applyModeButtons();
  log(`${MODE==="DOM"?"Dom":"Princess"} Mode selected`);
}
export function setSolo(on){
  MODE = on ? "PRINCESS_SOLO" : "PRINCESS";
  applyModeButtons();
  log(`Mode → ${MODE}`);
}
export function setLength(l){
  LENGTH = l;
  applyLengthButtons();
  log(`${LENGTH==="LONG"?"Long":"Short"} session selected`);
}
export function toggleSound(){
  SOUND = !SOUND;
  applySoundButton();
  log("Sound " + (SOUND ? "enabled" : "disabled"));
}

/* ---------------- UI sync ---------------- */
export function applyModeButtons(){
  setPrimary(els.domBtn, MODE==="DOM");
  setPrimary(els.princessBtn, MODE==="PRINCESS" || MODE==="PRINCESS_SOLO");
  setModeTag(MODE==="DOM" ? "DOM" : "PRINCESS");

  if(MODE==="DOM"){
    document.documentElement.style.setProperty("--accent","var(--accentDom)");
    document.documentElement.style.setProperty("--accentGlow","rgba(155,89,182,.18)");
  } else {
    document.documentElement.style.setProperty("--accent","var(--accentPrincess)");
    document.documentElement.style.setProperty("--accentGlow","rgba(230,102,102,.18)");
  }
  localStorage.setItem(LS_KEYS.MODE, MODE);
}
export function applyLengthButtons(){
  setPrimary(els.shortBtn, LENGTH==="SHORT");
  setPrimary(els.longBtn,  LENGTH==="LONG");
  localStorage.setItem(LS_KEYS.LENGTH, LENGTH);
}
export function applySoundButton(){
  els.soundBtn.classList.toggle("toggled", SOUND);
  els.soundBtn.setAttribute("aria-pressed", SOUND ? "true" : "false");
  els.soundBtn.textContent = SOUND ? "🔊 Sound On" : "🔇 Sound Off";
  localStorage.setItem(LS_KEYS.SOUND, SOUND ? "1" : "0");
}

/* ---------------- Rendering & timing ---------------- */
function step(elapsedSec){
  remain -= elapsedSec;
  if(remain > 0) return;

  completedSteps++;
  current++;

  if(current >= plan.length){
    // session complete
    const f = choice(finisherPool);
    finisherUsed = f || "Denied (Solo)";
    els.phase.textContent = "Finisher";
    els.task.textContent  = finisherUsed;
    log("Finisher: " + finisherUsed, "finisher");
    stopTicking();
    els.meterFill.style.width = "0%";
    els.clock.textContent = "00:00";
    els.eta.textContent   = "~00:00 left";
    sessionEnd = new Date();
    openSummary();
    return;
  }

  // move to next step
  remain = plan[current].dur + Math.max(0, -remain);
  render();
}

function render(initial=false){
  const step = plan[current];
  if(!step) return;

  if(step.phase !== prevPhase){
    addDivider(step.phase);
    playChime();
    prevPhase = step.phase;
  } else {
    playChime();
  }

  els.phase.textContent = step.phase;
  els.task.textContent =
    (step.kind ? step.kind + ": " : "") +
    (step.toy ? `[${step.toy}] ` : "") +
    step.text;

  if(step.kind === "Rest") restCount++;

  const line = `${step.kind?step.kind+": ":""}${step.text} (${step.dur}s)`;
  if(initial) log(`${step.phase} → ${step.text} (${step.dur}s)`,"task");
  else log(line,"task");

  flashPhase();
  updateMeterAndTimes();
}

function updateMeterAndTimes(){
  const step = plan[current]; if(!step) return;
  const pct = Math.max(0, Math.min(1, remain / step.dur)) * 100;
  els.meterFill.style.width = pct.toFixed(2) + "%";
  els.clock.textContent = mmss(Math.ceil(remain));
  totalRemain = remain + plan.slice(current+1).reduce((a,b)=>a + (b?.dur || 0), 0);
  els.eta.textContent = "~" + mmss(Math.ceil(totalRemain)) + " left";
}

/* ---------------- Summary & Log ---------------- */
function openSummary(){
  try{
    const totalSecs = Array.isArray(plan) && plan.length
      ? plan.reduce((a,b)=> a + (b?.dur || 0), 0)
      : 0;

    const startStr = sessionStart instanceof Date ? sessionStart.toLocaleTimeString() : "—";
    const endStr   = sessionEnd   instanceof Date ? sessionEnd.toLocaleTimeString()   : "—";

    if(els.summaryMode) els.summaryMode.textContent =
      (MODE === "DOM" ? "Dom Mode" : (MODE === "PRINCESS_SOLO" ? "Princess Solo" : "Princess Mode"));

    if(els.sumDuration) els.sumDuration.textContent = mmss(Math.max(0, Math.round(totalSecs)));
    if(els.sumSteps)    els.sumSteps.textContent    = String(completedSteps || 0);
    if(els.sumRests)    els.sumRests.textContent    = String(restCount || 0);
    if(els.sumSkips)    els.sumSkips.textContent    = String(skipCount || 0);
    if(els.sumFinisher) els.sumFinisher.textContent = (MODE==="PRINCESS_SOLO" ? "Denied (Solo)" : (finisherUsed || "—"));
    if(els.sumTimes)    els.sumTimes.textContent    = `${startStr} → ${endStr}`;

    els.overlay?.classList.add("show");
  }catch(err){
    console.error("openSummary error:", err);
    els.overlay?.classList.add("show");
  }
}

export function closeSummary(){ els.overlay.classList.remove("show"); }

export function saveLog(){
  const lines = Array.from(els.log.children).map(n => n.textContent);
  const text = lines.join("\n");
  const blob = new Blob([text], {type:"text/plain"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const day = new Date();
  const filename = `Session_Log_${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}.txt`;
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

/* ---------------- Plan builders ---------------- */
function buildPlanForMode(){
  if (MODE === "DOM") return buildDomPlan();
  if (MODE === "PRINCESS_SOLO") return buildSoloPrincessPlan();
  return buildPrincessPlan();
}

function buildDomPlan(){
  const t = timesFor("DOM", LENGTH);
  const planOut = [];
  const warmRounds = Math.max(1, Math.round(choice(t.warmRounds)));

  for(let i=0;i<warmRounds;i++){
    const d = randInt(...t.warmSpan);
    planOut.push({phase:"Warm-up", kind:"Palming",  text:choiceLimitedFrom("D_WARM_PALM",   D_WARM_PALM),   dur:d});
    const r1=maybeRest(t.restWB,t.restProb); if(r1) planOut.push({phase:"Warm-up", kind:"Rest", text:"Hands off. Breathe.", dur:r1});
    planOut.push({phase:"Warm-up", kind:"Stroking", text:choiceLimitedFrom("D_WARM_STROKE", D_WARM_STROKE), dur:d});
    const r2=maybeRest(t.restWB,t.restProb); if(r2) planOut.push({phase:"Warm-up", kind:"Rest", text:"Hands off. Breathe.", dur:r2});
  }

  for(let i=0;i<t.buildCycles;i++){
    const d = randInt(...t.buildSpan);
    planOut.push({phase:"Mid Build-up", kind:`Palming ${i+1}`,  text:choiceLimitedFrom("D_MID_PALM",  D_MID_PALM),  dur:d});
    const r1=maybeRest(t.restWB,t.restProb); if(r1) planOut.push({phase:"Mid Build-up", kind:"Rest", text:"Hands off. Breathe.", dur:r1});
    planOut.push({phase:"Mid Build-up", kind:`Stroking ${i+1}`, text:choiceLimitedFrom("D_MID_STROKE",D_MID_STROKE),dur:d});
    const r2=maybeRest(t.restWB,t.restProb); if(r2) planOut.push({phase:"Mid Build-up", kind:"Rest", text:"Hands off. Breathe.", dur:r2});
  }

  for(let i=0;i<t.overRounds;i++){
    const pd=randInt(...t.overPalm);
    const palmingPool = D_OVER_PALM.concat(D_OVER_PALM);
    planOut.push({phase:"Cruel Overload", kind:`Overload Palming ${i+1}`, text:choiceLimitedFrom("D_OVER_PALM", palmingPool), dur:pd});
    const r1=maybeRest(t.restOver,t.restProb); if(r1) planOut.push({phase:"Cruel Overload", kind:"Rest", text:"Hands off. Breathe.", dur:r1});

    const sd=randInt(...t.overStroke);
    planOut.push({phase:"Cruel Overload", kind:`Overload Stroking ${i+1}`, text:choiceLimitedFrom("D_OVER_STROKE", D_OVER_STROKE), dur:sd});
    const r2=maybeRest(t.restOver,t.restProb); if(r2) planOut.push({phase:"Cruel Overload", kind:"Rest", text:"Hands off. Breathe.", dur:r2});
  }

  planOut.push({phase:"Final Reset", kind:"Final reset", text:"Hands off. Breathe.", dur:t.finalReset});
  return { plan: planOut, finisherPool: D_FINISH };
}

function buildPrincessPlan(){
  const t = timesFor("PRINCESS", LENGTH);
  const planOut = [];
  const warmRounds = Math.max(1, Math.round(choice(t.warmRounds)));

  for(let i=0;i<warmRounds;i++){
    const d = randInt(...t.warmSpan);
    planOut.push({phase:"Warm-up",  kind:`Warm ${i+1}`,  text:choiceLimitedFrom("P_WARM",  P_WARM),  dur:d});
    const r=maybeRest(t.restWB,t.restProb); if(r) planOut.push({phase:"Warm-up",  kind:"Rest", text:"No touch. Hold position.", dur:r});
  }
  for(let i=0;i<t.buildCycles;i++){
    const d = randInt(...t.buildSpan);
    planOut.push({phase:"Build-up", kind:`Build ${i+1}`, text:choiceLimitedFrom("P_BUILD", P_BUILD), dur:d});
    const r=maybeRest(t.restWB,t.restProb); if(r) planOut.push({phase:"Build-up", kind:"Rest", text:"No touch. Hold position.", dur:r});
  }
  for(let i=0;i<t.overRounds;i++){
    const d = randInt(...t.overSpan);
    planOut.push({phase:"Cruel Overload", kind:`Overload ${i+1}`, text:choiceLimitedFrom("P_OVER",  P_OVER),  dur:d});
    const r=maybeRest(t.restOver,t.restProb); if(r) planOut.push({phase:"Cruel Overload", kind:"Rest", text:"No touch. Hold position.", dur:r});
  }

  planOut.push({phase:"Final Reset", kind:"Final Reset", text:"No touch. Breathe.", dur:t.finalReset});
  return { plan: planOut, finisherPool: P_FINISH };
}

export function buildSoloPrincessPlan(){
  const t = timesFor("PRINCESS", LENGTH);
  const out = [];

  // Strong bias to Sucky (Princess’ favorite)
  const warmWts  = [{item:"SUCKY", w:8},  {item:"WAND", w:2}, {item:"ZUMIO", w:2}];
  const buildWts = [{item:"SUCKY", w:9},  {item:"WAND", w:2}, {item:"ZUMIO", w:2}];
  const overWts  = [{item:"SUCKY", w:12}, {item:"WAND", w:2}, {item:"ZUMIO", w:2}];

  const addStep = (phase, toy, text, dur) => {
    if(Math.random() < 0.20) text += " — " + choice(SOLO_MODIFIERS);
    out.push({
      phase,
      kind: `${toy} ${phase.includes("Overload")?"Lock": phase.includes("Build")?"Build":"Warm"}`,
      toy, text, dur
    });
  };

  // Warm-up
  const warmRounds = Math.max(1, Math.round(choice(t.warmRounds)));
  for(let i=0;i<warmRounds;i++){
    const d = randInt(...t.warmSpan);
    const toy = pickWeighted(warmWts);
    const pool = (toy==="SUCKY") ? SOLO_SUCKY_WARM
               : (toy==="WAND")  ? SOLO_WAND_WARM
               :                   SOLO_ZUMIO_WARM;
    addStep("Warm-up", toy, choiceLimitedFrom("SOLO_WARM_"+toy, pool), d);
    const r = maybeRest(t.restWB, t.restProb); if(r) out.push({phase:"Warm-up", kind:"Rest", text:"No touch. Hold position.", dur:r});
  }

  // Build-up
  for(let i=0;i<t.buildCycles;i++){
    const d = randInt(...t.buildSpan);
    const toy = pickWeighted(buildWts);
    const pool = (toy==="SUCKY") ? SOLO_SUCKY_BUILD
               : (toy==="WAND")  ? SOLO_WAND_BUILD
               :                   SOLO_ZUMIO_BUILD;
    addStep("Build-up", toy, choiceLimitedFrom("SOLO_BUILD_"+toy, pool), d);
    const r = maybeRest(t.restWB, t.restProb); if(r) out.push({phase:"Build-up", kind:"Rest", text:"No touch. Hold position.", dur:r});
  }

  // Overload
  for(let i=0;i<t.overRounds;i++){
    const d = randInt(...t.overSpan);
    const toy = pickWeighted(overWts);
    const pool = (toy==="SUCKY") ? SOLO_SUCKY_OVER
               : (toy==="WAND")  ? SOLO_WAND_OVER
               :                   SOLO_ZUMIO_OVER;
    addStep("Cruel Overload", toy, choiceLimitedFrom("SOLO_OVER_"+toy, pool), d);
    const r = maybeRest(t.restOver, t.restProb); if(r) out.push({phase:"Cruel Overload", kind:"Rest", text:"No touch. Hold position.", dur:r});
  }

  // Final reset — denial
  out.push({phase:"Final Reset", kind:"Final Reset", text:"No touch. Breathe. You’re denied until Sir permits.", dur:t.finalReset});
  return { plan: out, finisherPool: [] };
}
