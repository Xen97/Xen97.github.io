<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no" />
<title>Session Controller (Dom / Princess)</title>
<style>
  :root{
    --bg:#0f1115; --fg:#e6e6e6; --muted:#aab;
    --accentPrincess:#e66;            /* pink */
    --accentDom:#9b59b6;              /* purple */
    --accent:var(--accentPrincess);   /* default = Princess */
    --accentGlow:rgba(230,102,102,.18);
    --card:#171a21; --border:#232738; --btn:#1b1f2e; --btn-border:#2a2f44;
  }

  *{box-sizing:border-box;}
  body{
    margin:0; color:var(--fg);
    background: var(--bg); /* solid background */
    font:15px/1.45 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
  }

  /* Utilities */
  .mb-6{ margin-bottom:6px; }
  .mt-8{ margin-top:8px; }
  .hide{ display:none !important; }

  /* Centered, compact container */
  .container{ position:relative; max-width:900px; margin:14px auto 36px; padding:0 12px; }
  header{padding:0 0 8px;}
  h1{font-size:18px; margin:0 0 4px;}
  .subtitle{color:var(--muted); font-size:12px; margin:0 0 8px;}

  .wrap{ position:relative; z-index:1; display:flex; flex-direction:column; gap:10px; }

  .card{
    background:var(--card);
    border-radius:12px;
    padding:12px;
    border:1px solid var(--border);
  }

  /* Optional in-card glow (kept on log) */
  .card.glow{ position:relative; overflow:hidden; background:var(--card); }
  .card.glow::before{
    content:"";
    position:absolute; inset:0;
    background: radial-gradient(900px 420px at 60% -15%,
      color-mix(in srgb, var(--accent) 25%, transparent), transparent 70%);
    pointer-events:none; z-index:0;
  }
  .card.glow > *{ position:relative; z-index:1; }

  .row{display:flex; gap:8px; align-items:center; flex-wrap:wrap}

  .btn{
    appearance:none; border:1px solid var(--btn-border); background:var(--btn); color:#fff;
    padding:8px 10px; border-radius:10px; font-weight:600; font-size:14px; cursor:pointer;
    transition:transform .04s ease, filter .15s ease;
  }
  .btn:active{ transform:translateY(1px); }
  .btn:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }
  .btn.primary{background:var(--accent); border-color:transparent;}
  .btn.danger{background:#a22; border-color:transparent;}
  .btn.ghost{background:transparent;}
  .btn.toggled{ background: var(--accent); border-color: transparent; }

  .pill{display:inline-block; padding:2px 8px; border-radius:999px; background:#223; color:#cde; font-size:12px; margin-left:6px;}
  .mono{font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;}
  .label{color:var(--muted); font-size:12px; margin-bottom:4px;}
  .taskline{font-weight:700; margin-bottom:6px; overflow-wrap:anywhere; word-break:break-word;}
  .grid{display:grid; grid-template-columns:1fr auto; gap:8px; align-items:center;}
  .tiny{font-size:12px; color:var(--muted);}
  .log{max-height:34vh; overflow:auto; padding-right:6px;}
  .log div{overflow-wrap:anywhere; word-break:break-word; font-size:13px;}

  /* Divider in log */
  .divider{
    display:flex; align-items:center; gap:8px; color:#cde; margin:8px 0; font-weight:700;
  }
  .divider::before, .divider::after{
    content:""; flex:1; height:1px; background: linear-gradient(90deg, transparent, var(--accent), transparent);
    opacity:.45;
  }

  /* Animated progress bar */
  .meter{width:100%; height:12px; background:#2a2f44; border-radius:8px; overflow:hidden;}
  .meter .fill{height:100%; width:0%; background:var(--accent); transition:width .35s linear;}

  /* Phase flash */
  @keyframes phaseFlash {
    0%   { box-shadow:0 0 0 0 rgba(255,255,255,0), 0 0 0 0 var(--accentGlow); transform:scale(1); }
    22%  { box-shadow:0 0 0 4px var(--accentGlow), 0 0 26px 8px var(--accentGlow); transform:scale(1.01); }
    100% { box-shadow:0 0 0 0 rgba(255,255,255,0), 0 0 0 0 var(--accentGlow); transform:scale(1); }
  }
  .phase-flash{ animation:phaseFlash .9s ease; }

  /* Sticky top controls */
  .sticky{ position:sticky; top:0; z-index:5; box-shadow:0 6px 16px rgba(0,0,0,.25); }

  /* End summary modal */
  .overlay{
    position:fixed; inset:0; display:none; align-items:center; justify-content:center;
    background: rgba(0,0,0,.55); z-index:20;
  }
  .overlay.show{ display:flex; }
  .summary{
    background:var(--card); border:1px solid var(--border); border-radius:14px; padding:16px; width:min(680px, calc(100% - 32px));
    box-shadow:0 14px 40px rgba(0,0,0,.4);
  }
  .summary h2{ margin:0 0 8px; font-size:18px; }
  .summary .grid{ grid-template-columns:1fr 1fr; gap:10px; }
  .summary .stat{ background:#151925; border:1px solid #222a3a; border-radius:10px; padding:10px; }
  .summary .actions{ display:flex; gap:8px; justify-content:flex-end; margin-top:12px; }

  @media (max-width:520px){
    .summary .grid{ grid-template-columns:1fr; }
  }

  /* ——— Easter Egg visuals ——— */
  .ribbon{
    position: fixed;
    top: 14px;
    left: 50%;
    transform: translateX(-50%) translateY(-20px);
    background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 35%, #000), var(--accent));
    color: #fff;
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.12);
    box-shadow: 0 8px 24px rgba(0,0,0,.35), 0 0 24px color-mix(in srgb, var(--accent) 25%, transparent);
    font-weight: 700;
    letter-spacing: .2px;
    z-index: 50;
    opacity: 0;
    transition: transform .35s ease, opacity .35s ease;
    pointer-events: none;
  }
  .ribbon.show{
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  .ribbon span{ font-size: 13px; }

  .confetti{
    position: fixed;
    inset: 0;
    z-index: 40;
    pointer-events: none;
  }
</style>
</head>
<body>
  <div class="container" id="container">

    <!-- Easter egg UI (hidden until triggered) -->
    <div id="secretRibbon" class="ribbon hide" aria-hidden="true">
      <span>Made for Princess</span>
    </div>
    <canvas id="confetti" class="confetti hide" aria-hidden="true"></canvas>

    <header>
      <h1>Session Controller <span id="modeTag" class="pill">Princess Mode</span></h1>
      <p class="subtitle">Warm-up → Build-up → Cruel Overload → Final Reset → Finish</p>
    </header>

    <div class="wrap">
      <div class="card sticky" aria-label="Controls">
        <!-- Row 1: mode & length -->
        <div class="row mb-6">
          <button id="domBtn" class="btn" aria-pressed="false">Dom Mode</button>
          <button id="princessBtn" class="btn primary" aria-pressed="true">Princess Mode</button>
          <button id="shortBtn" class="btn" aria-pressed="false">Short</button>
          <button id="longBtn" class="btn primary" aria-pressed="true">Long</button>
        </div>

        <!-- Row 2: transport controls + Sound toggle -->
        <div class="row">
          <button id="startBtn" class="btn ghost" title="S">Start</button>
          <button id="pauseBtn" class="btn" title="Space">Pause</button>
          <button id="skipBtn" class="btn ghost" title="K">Skip</button>
          <button id="finishBtn" class="btn danger" title="F">Finish Now</button>

          <button id="soundBtn" class="btn ghost" aria-pressed="false" title="Toggle sound">
            🔇 Sound Off
          </button>
        </div>
      </div>

      <div id="phaseCard" class="card">
        <div class="label">Current Phase</div>
        <div id="phase" class="pill" aria-live="polite">–</div>

        <div class="label mt-8">Current Task</div>
        <div id="task" class="taskline" aria-live="polite">—</div>

        <div class="grid mono" aria-label="Timer">
          <div class="meter" aria-label="Step Progress"><div class="fill" id="meterFill"></div></div>
          <div>
            <div id="clock" class="mono">00:00</div>
            <div id="eta" class="tiny">~— left</div>
          </div>
        </div>
      </div>

      <div class="card glow">
        <div class="label">Session Log</div>
        <div id="log" class="log mono" aria-live="polite" aria-relevant="additions"></div>
      </div>
    </div>
  </div>

  <!-- End Summary -->
  <div class="overlay" id="overlay">
    <div class="summary">
      <h2>Session Summary <span class="pill" id="summaryMode">—</span></h2>
      <div class="grid">
        <div class="stat"><div class="label">Total Duration</div><div id="sumDuration" class="taskline">—</div></div>
        <div class="stat"><div class="label">Steps Completed</div><div id="sumSteps" class="taskline">—</div></div>
        <div class="stat"><div class="label">Rests</div><div id="sumRests" class="taskline">—</div></div>
        <div class="stat"><div class="label">Skips</div><div id="sumSkips" class="taskline">—</div></div>
        <div class="stat"><div class="label">Finisher</div><div id="sumFinisher" class="taskline">—</div></div>
        <div class="stat"><div class="label">Start → End</div><div id="sumTimes" class="taskline">—</div></div>
      </div>
      <div class="actions">
        <button id="saveLogBtn" class="btn ghost">Save Log (.txt)</button>
        <button id="restartBtn" class="btn">Restart Session</button>
        <button id="closeSummaryBtn" class="btn primary">Close</button>
      </div>
    </div>
  </div>

<script>
/* ================== STATE ================== */
const LS_KEYS = { MODE:'sc_mode', LENGTH:'sc_length', SOUND:'sc_sound' };
let MODE   = localStorage.getItem(LS_KEYS.MODE)   || "PRINCESS";
let LENGTH = localStorage.getItem(LS_KEYS.LENGTH) || "LONG";
let SOUND  = localStorage.getItem(LS_KEYS.SOUND)  === "1";

/* ================== DOM SHORTCUTS ================== */
const $ = s => document.querySelector(s);
const els = {
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
};

/* ================== LOGGING WITH ICONS ================== */
const ICONS = {
  info: "📝", phase: "🧭", task: "🎯", rest:"🌙", skip:"⏭️", pause:"⏸️", resume:"▶️", finisher:"🏁"
};
function ts(){
  const d=new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
}
function log(msg, kind="info"){
  const line = document.createElement('div');
  const icon = ICONS[kind] || ICONS.info;
  line.textContent = `${icon} [${ts()}] ${msg}`;
  els.log.appendChild(line);
  els.log.scrollTop = els.log.scrollHeight;
}
function addDivider(label){
  const div = document.createElement('div');
  div.className = 'divider';
  div.innerHTML = `<span>🧭 ${label}</span>`;
  els.log.appendChild(div);
  els.log.scrollTop = els.log.scrollHeight;
}

/* ================== TASK POOLS ================== */
/* DOM MODE (Princess acts on you) */
const D_WARM_PALM = [
  "Flat palming over the head — slow circles",
  "Ridge orbit — fingertip circles under the ridge"
];
const D_WARM_STROKE = [
  "Shallow strokes below the ridge — slow",
  "Twist strokes — light twisting"
];
const D_MID_PALM = [
  "Thumb rub on head — tight circles",
  "Cup and trap — palm cups the head, light rubbing",
  "Normal Palming — steady rubbing of the head",
];
const D_MID_STROKE = [
  "Two-finger straddle — stroke the head with two fingers either side",
  "Base-to-tip drag — slow full strokes",
  "Grip shift — 3 loose, 3 tight (repeat)",
  "Twist strokes — slow twisting",
  "Tight shallow strokes — firm squeeze below ridge"
];
const D_OVER_PALM = [
  "Normal Palming — steady rubbing of the head",
  "Slit Press — grind tight circles over the slit",
];
const D_OVER_STROKE = [
  "Double Assault — shallow strokes under the ridge + palming",
  "Tip Whip — shallow, rapid head strokes",
  "Squeeze Stroke — progressively tighter downstrokes",
  "Head Clamp Roll — trap the ridge and use tiny strokes"
];
const D_FINISH = [
  "Vise-Grip Twist — clamp the head tight and twist through the climax",
  "Hellgrind Lock — put thumb over the slit and rub tight circles, with small strokes to finish",
  "Tip-Whip Burst — hold just below the ridge, very fast tip strokes through the release",
  "Seal & Stroke — palm the head; other hand pounds short strokes"
];

/* PRINCESS MODE (you act on her) */
const P_WARM = [
  "Outer lips only — two-fingers stroke outer lips",
  "Sucky on clit at level 2 — steady, teasing pressure",
  "Vibrator on clit at level 2–3 — slow circular motion",
  "One finger gently rubbing her clit hood — don’t expose fully",
  "Tongue slowly circling over the clit hood — very light contact",
  "Two fingers pressing just inside the entrance — shallow and slow",
];
const P_BUILD = [
  "Toy glide — run the vibrator up/down her slit",
  "Sucky level 4 locked on clit while fingering slowly",
  "Sucky level 5 pulsing on and off rhythmically",
  "Vibrator level 4 pressed on clit while your fingers spread her open",
  "Mouth sealed on clit — steady suction with occasional tongue flicks",
  "Double assault — vibrator level 5 on clit while fingering",
  "Edge climb — sucky from level 3 → 4 → 5, holding her just below release",
  "Deep hooking — two fingers inside",
];
const P_OVER = [
  "Thrash Assault — sucky level 8 tapping clit",
  "Relentless Suck-Lock — sucky level 7 sealed on her clit",
  "Pinned Spread — two fingers fast, while vibrator level 6 grinds on clit",
  "Tongue Torture — mouth suction on clit, fast tongue flicks, while fingering",
  "Rolling Edge — sucky level 8, drop to 5 then back to 8, repeating",
  "Edge Trap — rub her G-spot with 2 fingers while sucky level 7 stays on clit",
  "Breaking Point — vibrator level 8 pressed to clit + full hand squeezing her lips"
];
const P_FINISH = [
  "Clit Clamp — sucky level 8 pinned to clit",
  "Double Pressure — two fingers curl hard on G-spot + sucky level 8 on clit",
  "Grinding Lock — vibrator laid flat and ground firmly into clit",
  "Pulse & Trap — sucky level 8 in bursts while fingering",
  "Forced Lick Finish — pin her thighs; rapid tongue on clit + hard fingering"
];

/* ================== TIMING PRESETS ================== */
function timesFor(mode, length){
  if(mode==="DOM"){
    return (length==="SHORT") ? {
      warmRounds:[2,3], buildCycles:3, overRounds:5,
      warmSpan:[50,65], buildSpan:[55,70], overPalm:[60,85], overStroke:[12,20],
      restWB:[10,18], restOver:[10,15], finalReset:60, restProb:0.15
    } : {
      warmRounds:[3,4], buildCycles:6, overRounds:9,
      warmSpan:[50,65], buildSpan:[55,70], overPalm:[60,85], overStroke:[12,20],
      restWB:[10,18], restOver:[10,15], finalReset:90, restProb:0.15
    };
  } else {
    if (length==="SHORT"){
      return {
        warmRounds:[3,4], buildCycles:4, overRounds:6,
        warmSpan:[90,150], buildSpan:[90,150], overSpan:[120,210],
        restWB:[10,20], restOver:[10,15], finalReset:120, restProb:0.10
      };
    } else {
      return {
        warmRounds:[4,6], buildCycles:6, overRounds:10,
        warmSpan:[90,150], buildSpan:[90,150], overSpan:[150,240],
        restWB:[15,25], restOver:[12,18], finalReset:150, restProb:0.08
      };
    }
  }
}

/* ================== HELPERS ================== */
function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function choice(arr){ return arr[randInt(0, arr.length-1)]; }
function mmss(s){ const m=Math.floor(s/60), sec=Math.max(0, Math.floor(s%60)); return String(m).padStart(2,'0')+":"+String(sec).padStart(2,'0'); }
function maybeRest(range, prob){ return Math.random() < prob ? randInt(range[0], range[1]) : 0; }

/* Non-repeating chooser */
let usageCounts={}, lastPick={};
function resetChooser(){ usageCounts={}; lastPick={}; }
function choiceLimitedFrom(poolKey, arr){
  if(!usageCounts[poolKey]) usageCounts[poolKey]={};
  if(!lastPick[poolKey]) lastPick[poolKey]=null;

  let tries=0;
  while(tries<50){
    const candidate = arr[randInt(0, arr.length-1)];
    const used = usageCounts[poolKey][candidate]||0;
    if(used<2 && candidate!==lastPick[poolKey]){
      usageCounts[poolKey][candidate]=used+1;
      lastPick[poolKey]=candidate;
      return candidate;
    }
    tries++;
  }
  const candidates = arr.filter(t => (usageCounts[poolKey][t]||0) < 2);
  const fallback = (candidates.length ? choice(candidates) : choice(arr));
  usageCounts[poolKey][fallback]=(usageCounts[poolKey][fallback]||0)+1;
  lastPick[poolKey]=fallback;
  return fallback;
}

/* ================== PLAN BUILDERS ================== */
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

/* ================== PLAYER ================== */
let plan=[], finisherPool=[], current=0, remain=0, totalRemain=0;
let ticking=false, lastTs=0, intervalId=null;
let sessionStart=null, sessionEnd=null, completedSteps=0, restCount=0, skipCount=0, finisherUsed="—";
let prevPhase="";

/* SOUND via WebAudio (no external files) */
let audioCtx=null;
function playChime(){
  if(!SOUND) return;
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.value = 880;   // A5
    g.gain.value = 0.0001;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    const now = audioCtx.currentTime;
    g.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    o.frequency.exponentialRampToValueAtTime(1320, now + 0.12); // upward ping
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.20);
    o.stop(now + 0.22);
  }catch(e){}
}

function computeTotalRemain(fromIndex=0){
  return plan.slice(fromIndex).reduce((a,b)=>a+b.dur,0);
}

function start(){
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

function startTicking(){
  stopTicking();
  ticking = true;
  lastTs = performance.now();
  intervalId = setInterval(onTickFrame, 200);
}
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

  // Phase divider + sound on phase change (and each new step)
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

function pause(){ if(ticking){ stopTicking(); log("Paused","pause"); } else { startTicking(); log("Resumed","resume"); } }
function skip(){ if(!plan[current]) return; log(`Skipped: ${(plan[current].kind?plan[current].kind+": ":"")}${plan[current].text}`,"skip"); skipCount++; remain = 0.0001; }
function finishNow(){
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

/* ================== CONTROLS, PREFS, MODE TINT ================== */
function setPrimary(btn, on){ btn.classList.toggle("primary", !!on); btn.setAttribute("aria-pressed", on ? "true" : "false"); }
function setModeTag(){ els.modeTag.textContent = MODE === "DOM" ? "Dom Mode" : "Princess Mode"; }

function applyModeButtons(){
  setPrimary(els.domBtn, MODE==="DOM");
  setPrimary(els.princessBtn, MODE==="PRINCESS");
  setModeTag();

  // swap accent + glow color
  if(MODE==="DOM"){
    document.documentElement.style.setProperty("--accent","var(--accentDom)");
    document.documentElement.style.setProperty("--accentGlow","rgba(155,89,182,.18)");
  } else {
    document.documentElement.style.setProperty("--accent","var(--accentPrincess)");
    document.documentElement.style.setProperty("--accentGlow","rgba(230,102,102,.18)");
  }
  localStorage.setItem(LS_KEYS.MODE, MODE);
}
function applyLengthButtons(){
  setPrimary(els.shortBtn, LENGTH==="SHORT");
  setPrimary(els.longBtn, LENGTH==="LONG");
  localStorage.setItem(LS_KEYS.LENGTH, LENGTH);
}
function applySoundButton(){
  els.soundBtn.classList.toggle("toggled", SOUND);
  els.soundBtn.setAttribute("aria-pressed", SOUND ? "true" : "false");
  els.soundBtn.textContent = SOUND ? "🔊 Sound On" : "🔇 Sound Off";
  localStorage.setItem(LS_KEYS.SOUND, SOUND ? "1" : "0");
}

/* Sound toggle button */
els.soundBtn.addEventListener("click", ()=>{
  SOUND = !SOUND;
  applySoundButton();
  log("Sound " + (SOUND ? "enabled" : "disabled"));
});

els.domBtn.addEventListener("click", ()=>{ MODE="DOM"; applyModeButtons(); log("Dom Mode selected"); });
els.princessBtn.addEventListener("click", ()=>{ MODE="PRINCESS"; applyModeButtons(); log("Princess Mode selected"); });
els.shortBtn.addEventListener("click", ()=>{ LENGTH="SHORT"; applyLengthButtons(); log("Short session selected"); });
els.longBtn.addEventListener("click", ()=>{ LENGTH="LONG"; applyLengthButtons(); log("Long session selected"); });

els.startBtn.addEventListener("click", start);
els.pauseBtn.addEventListener("click", pause);
els.skipBtn.addEventListener("click", skip);
els.finishBtn.addEventListener("click", finishNow);

/* Keyboard shortcuts */
window.addEventListener("keydown", (e)=>{
  if(e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
  if(e.code === "Space"){ e.preventDefault(); pause(); }
  else if(e.key.toLowerCase() === "s"){ start(); }
  else if(e.key.toLowerCase() === "k"){ skip(); }
  else if(e.key.toLowerCase() === "f"){ finishNow(); }
  else if(e.key.toLowerCase() === "m"){ MODE = (MODE==="DOM"?"PRINCESS":"DOM"); applyModeButtons(); log(`Mode → ${MODE}`); }
  else if(e.key.toLowerCase() === "l"){ LENGTH = (LENGTH==="LONG"?"SHORT":"LONG"); applyLengthButtons(); log(`Length → ${LENGTH}`); }
});

/* ================== SUMMARY & SAVE LOG ================== */
function openSummary(){
  const totalSecs = plan.reduce((a,b)=>a+b.dur,0);
  const startStr = sessionStart ? sessionStart.toLocaleTimeString() : "—";
  const endStr   = sessionEnd ? sessionEnd.toLocaleTimeString() : "—";
  els.summaryMode.textContent = MODE === "DOM" ? "Dom Mode" : "Princess Mode";
  els.sumDuration.textContent = mmss(Math.round(totalSecs));
  els.sumSteps.textContent = String(completedSteps);
  els.sumRests.textContent = String(restCount);
  els.sumSkips.textContent = String(skipCount);
  els.sumFinisher.textContent = finisherUsed || "—";
  els.sumTimes.textContent = `${startStr} → ${endStr}`;

  els.overlay.classList.add("show");
}
function closeSummary(){ els.overlay.classList.remove("show"); }
function saveLog(){
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
els.saveLogBtn.addEventListener("click", saveLog);
els.restartBtn.addEventListener("click", ()=>{ closeSummary(); start(); });
els.closeSummaryBtn.addEventListener("click", closeSummary);

/* ================== EASTER EGG (Princess button LONG-PRESS) ================== */
const LONG_PRESS_MS = 1600; // hold duration (1.6s) – tweak if you like
let lpTimer = null;

// visuals refs
const ribbonEl = document.getElementById("secretRibbon");
const confettiCanvas = document.getElementById("confetti");
const ctxConf = confettiCanvas.getContext("2d");

function resizeConfetti(){
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfetti);
resizeConfetti();

function showRibbon(ms=2400){
  ribbonEl.classList.remove("hide");
  void ribbonEl.offsetWidth;                // reflow
  ribbonEl.classList.add("show");
  setTimeout(()=>{
    ribbonEl.classList.remove("show");
    setTimeout(()=> ribbonEl.classList.add("hide"), 300);
  }, ms);
}

function heartConfettiBurst(durationMs = 1600, count = 54){
  confettiCanvas.classList.remove("hide");
  const W = confettiCanvas.width, H = confettiCanvas.height;
  const hearts = Array.from({length:count}).map(()=>({
    x: Math.random()*W,
    y: -20 - Math.random()*H*0.2,
    s: 8 + Math.random()*10,
    vx: (Math.random()-0.5)*0.6,
    vy: 1.2 + Math.random()*1.8,
    rot: Math.random()*Math.PI*2,
    vr: (Math.random()-0.5)*0.1,
    a: 0.8 + Math.random()*0.2
  }));

  let start = null, raf;

  function drawHeart(x, y, s, rot, color){
    ctxConf.save();
    ctxConf.translate(x,y);
    ctxConf.rotate(rot);
    ctxConf.scale(s/16, s/16);
    ctxConf.beginPath();
    for(let t=0; t<Math.PI*2; t+=0.1){
      const px = 16 * Math.pow(Math.sin(t),3);
      const py = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
      if(t===0) ctxConf.moveTo(px, -py); else ctxConf.lineTo(px, -py);
    }
    ctxConf.closePath();
    ctxConf.fillStyle = color;
    ctxConf.fill();
    ctxConf.restore();
  }

  function frame(ts){
    if(!start) start = ts;
    const elapsed = ts - start;
    ctxConf.clearRect(0,0,W,H);
    const c = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e66';
    hearts.forEach(h=>{
      h.x += h.vx; h.y += h.vy; h.rot += h.vr;
      ctxConf.globalAlpha = Math.max(0, h.a * (1 - elapsed/durationMs));
      drawHeart(h.x, h.y, h.s, h.rot, c);
    });
    ctxConf.globalAlpha = 1;
    if(elapsed < durationMs) raf = requestAnimationFrame(frame);
    else {
      ctxConf.clearRect(0,0,W,H);
      confettiCanvas.classList.add("hide");
      cancelAnimationFrame(raf);
    }
  }
  requestAnimationFrame(frame);
}

function triggerEasterEgg(){
  playChime?.();        // use your chime if sound is on
  showRibbon();         // ribbon drop
  heartConfettiBurst(); // hearts
}

// Long-press detection using Pointer Events (covers touch & mouse)
els.princessBtn.addEventListener("pointerdown", ()=>{
  clearTimeout(lpTimer);
  lpTimer = setTimeout(()=>{ triggerEasterEgg(); }, LONG_PRESS_MS);
});
["pointerup","pointercancel","pointerleave"].forEach(ev=>{
  els.princessBtn.addEventListener(ev, ()=> clearTimeout(lpTimer));
});
// prevent iOS touch-callout on long-press
els.princessBtn.addEventListener("contextmenu", e=> e.preventDefault());

/* ================== INIT ================== */
applyModeButtons();
applyLengthButtons();
applySoundButton();
els.phase.textContent = "—";
els.task.textContent = "Ready when you are.";
els.clock.textContent = "00:00";
els.eta.textContent = "~— left";
</script>
</body>
</html>
