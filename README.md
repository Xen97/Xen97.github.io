<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no" />
<title>Session Controller (Dom / Princess)</title>
<style>
  /* ——— your entire existing CSS exactly as you have it now ——— */
  :root{ --bg:#0f1115; --fg:#e6e6e6; --muted:#aab;
    --accentPrincess:#e66; --accentDom:#9b59b6; --accent:var(--accentPrincess);
    --accentGlow:rgba(230,102,102,.18); --card:#171a21; --border:#232738; --btn:#1b1f2e; --btn-border:#2a2f44;
  }
  *{box-sizing:border-box;}
  body{ margin:0; color:var(--fg); background:var(--bg); font:15px/1.45 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;}
  .mb-6{margin-bottom:6px;} .mt-8{margin-top:8px;} .hide{display:none!important;}
  .container{position:relative;max-width:900px;margin:14px auto 36px;padding:0 12px;}
  header{padding:0 0 8px;} h1{font-size:18px;margin:0 0 4px;} .subtitle{color:var(--muted);font-size:12px;margin:0 0 8px;}
  .wrap{position:relative;z-index:1;display:flex;flex-direction:column;gap:10px;}
  .card{background:var(--card);border-radius:12px;padding:12px;border:1px solid var(--border);}
  .card.glow{position:relative;overflow:hidden;background:var(--card);}
  .card.glow::before{content:"";position:absolute;inset:0;background:radial-gradient(900px 420px at 60% -15%,color-mix(in srgb, var(--accent) 25%, transparent),transparent 70%);pointer-events:none;z-index:0;}
  .card.glow>*{position:relative;z-index:1;}
  .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .btn{
    appearance:none;border:1px solid var(--btn-border);background:var(--btn);color:#fff;
    padding:8px 10px;border-radius:10px;font-weight:600;font-size:14px;cursor:pointer;
    transition:transform .04s ease, filter .15s ease;
    -webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;
    touch-action:manipulation;
  }
  .btn:active{transform:translateY(1px);}
  .btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px;}
  .btn.primary{background:var(--accent);border-color:transparent;}
  .btn.danger{background:#a22;border-color:transparent;}
  .btn.ghost{background:transparent;}
  .btn.toggled{background:var(--accent);border-color:transparent;}
  .pill{display:inline-block;padding:2px 8px;border-radius:999px;background:#223;color:#cde;font-size:12px;margin-left:6px;}
  .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;}
  .label{color:var(--muted);font-size:12px;margin-bottom:4px;}
  .taskline{font-weight:700;margin-bottom:6px;overflow-wrap:anywhere;word-break:break-word;}
  .grid{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;}
  .tiny{font-size:12px;color:var(--muted);}
  .log{max-height:34vh;overflow:auto;padding-right:6px;}
  .log div{overflow-wrap:anywhere;word-break:break-word;font-size:13px;}
  .divider{display:flex;align-items:center;gap:8px;color:#cde;margin:8px 0;font-weight:700;}
  .divider::before,.divider::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--accent),transparent);opacity:.45;}
  .meter{width:100%;height:12px;background:#2a2f44;border-radius:8px;overflow:hidden;}
  .meter .fill{height:100%;width:0%;background:var(--accent);transition:width .35s linear;}
  @keyframes phaseFlash{0%{box-shadow:0 0 0 0 rgba(255,255,255,0),0 0 0 0 var(--accentGlow);transform:scale(1);}
    22%{box-shadow:0 0 0 4px var(--accentGlow),0 0 26px 8px var(--accentGlow);transform:scale(1.01);}
    100%{box-shadow:0 0 0 0 rgba(255,255,255,0),0 0 0 0 var(--accentGlow);transform:scale(1);}
  }
  .phase-flash{animation:phaseFlash .9s ease;}
  .sticky{position:sticky;top:0;z-index:5;box-shadow:0 6px 16px rgba(0,0,0,.25);}
  .overlay{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.55);z-index:20;}
  .overlay.show{display:flex;}
  .summary{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;width:min(680px,calc(100% - 32px));box-shadow:0 14px 40px rgba(0,0,0,.4);}
  .summary h2{margin:0 0 8px;font-size:18px;}
  .summary .grid{grid-template-columns:1fr 1fr;gap:10px;}
  .summary .stat{background:#151925;border:1px solid #222a3a;border-radius:10px;padding:10px;}
  .summary .actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px;}
  @media (max-width:520px){.summary .grid{grid-template-columns:1fr;}}
  .ribbon{position:fixed;top:14px;left:50%;transform:translateX(-50%) translateY(-20px);
    background:linear-gradient(135deg,color-mix(in srgb, var(--accent) 35%, #000),var(--accent));color:#fff;
    padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.12);box-shadow:0 8px 24px rgba(0,0,0,.35),0 0 24px color-mix(in srgb, var(--accent) 25%, transparent);
    font-weight:700;letter-spacing:.2px;z-index:50;opacity:0;transition:transform .35s ease,opacity .35s ease;pointer-events:none;}
  .ribbon.show{opacity:1;transform:translateX(-50%) translateY(0);}
  .ribbon span{font-size:13px;}
  .confetti{position:fixed;inset:0;z-index:40;pointer-events:none;}
  /* Achievements */
  #achievementsGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
</style>
</head>
<body>
  <div class="container" id="container">
    <div id="secretRibbon" class="ribbon hide" aria-hidden="true"><span>Made for Princess</span></div>
    <canvas id="confetti" class="confetti hide" aria-hidden="true"></canvas>

    <header>
      <h1>Session Controller
        <span id="modeTag" class="pill">Princess Mode</span>
</div>

      </h1>
      <p class="subtitle">Warm-up → Build-up → Cruel Overload → Final Reset → Finish</p>
    </header>

    <div class="wrap">
      <div class="card sticky" aria-label="Controls">
        <div class="row mb-6">
          <button id="domBtn" class="btn" aria-pressed="false">Dom Mode</button>
          <button id="princessBtn" class="btn primary" aria-pressed="true">Princess Mode</button>
          <button id="shortBtn" class="btn" aria-pressed="false">Short</button>
          <button id="longBtn" class="btn primary" aria-pressed="true">Long</button>
        </div>
        <div class="row">
          <button id="startBtn" class="btn ghost" title="S">Start</button>
          <button id="pauseBtn" class="btn" title="Space">Pause</button>
          <button id="skipBtn" class="btn ghost" title="K">Skip</button>
          <button id="finishBtn" class="btn danger" title="F">Finish Now</button>
          <button id="soundBtn" class="btn ghost" aria-pressed="false" title="Toggle sound">🔇 Sound Off</button>
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

  <!-- Summary -->
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

  <!-- Load modules -->
  <script type="module" src="./main.js"></script>
</body>
</html>
