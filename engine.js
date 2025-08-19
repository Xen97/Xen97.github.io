// engine.js
import { els, log, addDivider, setPrimary, setModeTag, mmss } from "./ui.js";
import {
  D_WARM_PALM, D_WARM_STROKE, D_MID_PALM, D_MID_STROKE, D_OVER_PALM, D_OVER_STROKE, D_FINISH,
  P_WARM, P_BUILD, P_OVER, P_FINISH,
  timesFor, randInt, choice, maybeRest, resetChooser, choiceLimitedFrom
} from "./tasks.js";

export const LS_KEYS = { MODE:'sc_mode', LENGTH:'sc_length', SOUND:'sc_sound' };
export let MODE   = localStorage.getItem(LS_KEYS.MODE)   || "PRINCESS";
export let LENGTH = localStorage.getItem(LS_KEYS.LENGTH) || "LONG";
export let SOUND  = localStorage.getItem(LS_KEYS.SOUND)  === "1";

let plan=[], finisherPool=[], current=0, remain=0, totalRemain=0;
let ticking=false, lastTs=0, intervalId=null;
let sessionStart=null, sessionEnd=null, completedSteps=0, restCount=0, skipCount=0, finisherUsed="—";
let prevPhase="";

// SOUND (simple chime)
let audioCtx=null;
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

function computeTotalRemain(fromIndex=0){ return plan.slice(fromIndex).reduce((a,b)=>a+b.dur,0); }

export function start(){
  resetChooser();
  current=0; completedSteps=0; restCount=0; skipCount=0; finisherUsed="—"; prevPhase="";
  const r = (MODE==="DOM") ? buildDomPlan() : buildPrincessPlan();
  plan=r.plan; finisherPool=r.finisherPool;
  remain = plan[0]?.dur || 0;
  totalRemain = computeTotalRemain(0);
  sessionStart = new Date(); sessionEnd = null;
  render(true);
  log(`Session started (${MODE}, ${LENGTH})`,"info");
  startTicking();
}

function startTicking(){ stopTicking(); ticking = true; lastTs = performance.now(); intervalId = setInterval(onTickFrame, 200); }
function stopTicking(){ ticking=false; if(intervalId){ clearInterval(intervalId); intervalId=null; } }
function onTickFrame(){
  const now = performance.now();
  const elapsed = (now - lastTs)/1000;
  lastTs = now;
  step(elapsed);
  updateMeterAndTimes();
}

function flashPhase(){
  els.phaseCard.classList.remove("phase-flash");
  void els.phaseCard.offsetWidth;
  els.phaseCard.classList.add("phase-flash");
}

function step(elapsedSec){
  remain -= elapsedSec;
  if(remain <= 0){
    completedSteps++;
    current++;
    if(current >= plan.length){
      const f = choice(finisherPool);
      finisherUsed = f;
      els.phase.textContent = "Finisher";
      els.task.textContent = f;
      log("Finisher: "+f,"finisher");
      stopTicking();
      els.meterFill.style.width = "0%";
      els.clock.textContent = "00:00";
      els.eta.textContent = "~00:00 left";
      sessionEnd = new Date();
      openSummary();
      return;
    }
    remain = plan[current].dur + Math.max(0, -remain);
    render(); // announces new step + flashes
  }
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
  els.task.textContent = (step.kind?step.kind+": ":"") + step.text;

  if(step.kind === "Rest") restCount++;

  if(initial) log(`${step.phase} → ${step.text} (${step.dur}s)`,"task");
  else log(`${step.kind?step.kind+": ":""}${step.text} (${step.dur}s)`,"task");

  flashPhase();
  updateMeterAndTimes();
}

function updateMeterAndTimes(){
  const step = plan[current]; if(!step) return;
  const pct = Math.max(0, Math.min(1, remain / step.dur)) * 100;
  els.meterFill.style.width = pct.toFixed(2) + "%";
  els.clock.textContent = mmss(Math.ceil(remain));
  totalRemain = remain + plan.slice(current+1).reduce((a,b)=>a+b.dur,0);
  els.eta.textContent = "~"+mmss(Math.ceil(totalRemain))+" left";
}

export function pause(){ if(ticking){ stopTicking(); log("Paused","pause"); } else { startTicking(); log("Resumed","resume"); } }
export function skip(){ if(!plan[current]) return; log(`Skipped: ${(plan[current].kind?plan[current].kind+": ":"")}${plan[current].text}`,"skip"); skipCount++; remain = 0.0001; }
export function finishNow(){
  stopTicking();
  const f = choice(finisherPool);
  finisherUsed = f;
  els.phase.textContent = "Finisher";
  els.task.textContent = f;
  log("Finisher (manual): "+f,"finisher");
  els.meterFill.style.width = "0%";
  els.clock.textContent = "00:00";
  els.eta.textContent = "~00:00 left";
  sessionEnd = new Date();
  openSummary();
}

export function applyModeButtons(){
  setPrimary(els.domBtn, MODE==="DOM");
  setPrimary(els.princessBtn, MODE==="PRINCESS");
  setModeTag(MODE);

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

export function setMode(m){ MODE=m; applyModeButtons(); log(`${MODE==="DOM"?"Dom":"Princess"} Mode selected`); }
export function setLength(l){ LENGTH=l; applyLengthButtons(); log(`${LENGTH==="LONG"?"Long":"Short"} session selected`); }
export function toggleSound(){ SOUND=!SOUND; applySoundButton(); log("Sound " + (SOUND ? "enabled" : "disabled")); }

function buildDomPlan(){
  const t = timesFor("DOM", LENGTH);
  const plan=[];
  const warmRounds = choice(t.warmRounds);
  for(let i=0;i<warmRounds;i++){
    const d = randInt(...t.warmSpan);
    plan.push({phase:"Warm-up", kind:"Palming", text:choiceLimitedFrom("D_WARM_PALM", D_WARM_PALM), dur:d});
    const r1=maybeRest(t.restWB,t.restProb); if(r1) plan.push({phase:"Warm-up", kind:"Rest", text:"Hands off. Breathe.", dur:r1});
    plan.push({phase:"Warm-up", kind:"Stroking", text:choiceLimitedFrom("D_WARM_STROKE", D_WARM_STROKE), dur:d});
    const r2=maybeRest(t.restWB,t.restProb); if(r2) plan.push({phase:"Warm-up", kind:"Rest", text:"Hands off. Breathe.", dur:r2});
  }
  for(let i=0;i<t.buildCycles;i++){
    const d = randInt(...t.buildSpan);
    plan.push({phase:"Mid Build-up", kind:`Palming ${i+1}`, text:choiceLimitedFrom("D_MID_PALM", D_MID_PALM), dur:d});
    const r1=maybeRest(t.restWB,t.restProb); if(r1) plan.push({phase:"Mid Build-up", kind:"Rest", text:"Hands off. Breathe.", dur:r1});
    plan.push({phase:"Mid Build-up", kind:`Stroking ${i+1}`, text:choiceLimitedFrom("D_MID_STROKE", D_MID_STROKE), dur:d});
    const r2=maybeRest(t.restWB,t.restProb); if(r2) plan.push({phase:"Mid Build-up", kind:"Rest", text:"Hands off. Breathe.", dur:r2});
  }
  for(let i=0;i<t.overRounds;i++){
    const pd=randInt(...t.overPalm);
    const palmingPool = D_OVER_PALM.concat(D_OVER_PALM);
    plan.push({phase:"Cruel Overload", kind:`Overload Palming ${i+1}`, text:choiceLimitedFrom("D_OVER_PALM", palmingPool), dur:pd});
    const r1=maybeRest(t.restOver,t.restProb); if(r1) plan.push({phase:"Cruel Overload", kind:"Rest", text:"Hands off. Breathe.", dur:r1});
    const sd=randInt(...t.overStroke);
    plan.push({phase:"Cruel Overload", kind:`Overload Stroking ${i+1}`, text:choiceLimitedFrom("D_OVER_STROKE", D_OVER_STROKE), dur:sd});
    const r2=maybeRest(t.restOver,t.restProb); if(r2) plan.push({phase:"Cruel Overload", kind:"Rest", text:"Hands off. Breathe.", dur:r2});
  }
  plan.push({phase:"Final Reset", kind:"Final reset", text:"Hands off. Breathe.", dur:t.finalReset});
  return {plan, finisherPool:D_FINISH};
}
function buildPrincessPlan(){
  const t = timesFor("PRINCESS", LENGTH);
  const plan=[];
  const warmRounds = choice(t.warmRounds);
  for(let i=0;i<warmRounds;i++){
    const d = randInt(...t.warmSpan);
    plan.push({phase:"Warm-up", kind:`Warm ${i+1}`, text:choiceLimitedFrom("P_WARM", P_WARM), dur:d});
    const r=maybeRest(t.restWB,t.restProb); if(r) plan.push({phase:"Warm-up", kind:"Rest", text:"No touch. Hold position.", dur:r});
  }
  for(let i=0;i<t.buildCycles;i++){
    const d = randInt(...t.buildSpan);
    plan.push({phase:"Build-up", kind:`Build ${i+1}`, text:choiceLimitedFrom("P_BUILD", P_BUILD), dur:d});
    const r=maybeRest(t.restWB,t.restProb); if(r) plan.push({phase:"Build-up", kind:"Rest", text:"No touch. Hold position.", dur:r});
  }
  for(let i=0;i<t.overRounds;i++){
    const d = randInt(...t.overSpan);
    plan.push({phase:"Cruel Overload", kind:`Overload ${i+1}`, text:choiceLimitedFrom("P_OVER", P_OVER), dur:d});
    const r=maybeRest(t.restOver,t.restProb); if(r) plan.push({phase:"Cruel Overload", kind:"Rest", text:"No touch. Hold position.", dur:r});
  }
  plan.push({phase:"Final Reset", kind:"Final Reset", text:"No touch. Breathe.", dur:t.finalReset});
  return {plan, finisherPool:P_FINISH};
}

// Replace your openSummary() with this:
function openSummary(){
  try{
    // totalSecs: if plan is empty, fall back to 0
    const totalSecs = Array.isArray(plan) && plan.length
      ? plan.reduce((a,b)=> a + (b?.dur||0), 0)
      : 0;

    // Safe time strings
    const startStr = sessionStart instanceof Date ? sessionStart.toLocaleTimeString() : "—";
    const endStr   = sessionEnd   instanceof Date ? sessionEnd.toLocaleTimeString()   : "—";

    // Mode tag
    if(els.summaryMode) els.summaryMode.textContent = (MODE === "DOM" ? "Dom Mode" : "Princess Mode");

    // Stats
    if(els.sumDuration) els.sumDuration.textContent = mmss(Math.max(0, Math.round(totalSecs)));
    if(els.sumSteps)    els.sumSteps.textContent    = String(completedSteps || 0);
    if(els.sumRests)    els.sumRests.textContent    = String(restCount || 0);
    if(els.sumSkips)    els.sumSkips.textContent    = String(skipCount || 0);
    if(els.sumFinisher) els.sumFinisher.textContent = finisherUsed || "—";
    if(els.sumTimes)    els.sumTimes.textContent    = `${startStr} → ${endStr}`;

    // Show overlay
    els.overlay?.classList.add("show");
  }catch(err){
    console.error("openSummary error:", err);
    // Fail gracefully so the app keeps working
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
