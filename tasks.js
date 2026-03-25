// tasks.js  — pools + timing + chooser helpers

/* ========= DOM MODE (Princess acts on you) ========= */
export const D_WARM_PALM = [
  { text: "Flat palming over the head — slow circles", dur: [40, 65] },
  { text: "Thumb rubs underside of head", dur: [40, 65] },
];
export const D_WARM_STROKE = [
  { text: "Small strokes below head", dur: [40, 65] },
  { text: "Twist strokes", dur: [40, 65] },
];
export const D_MID_PALM = [
  { text: "Thumb rub on head", dur: [55, 80] },
  { text: "Normal Palming", dur: [60, 130] },
];
export const D_MID_STROKE = [
  { text: "Slow long strokes", dur: [40, 70] },
  { text: "Grip under the head and stroke the tip", dur: [40, 70] },
  { text: "Twist strokes", dur: [30, 70] },
];
export const D_OVER_PALM = [
  { text: "Normal Palming", dur: [90, 240] },
];
export const D_OVER_STROKE = [
  { text: "Small head strokes + thumb over slit", dur: [20, 40] },
  { text: "Small, rapid head strokes", dur: [20, 50] },
  { text: "Long tight slow strokes", dur: [40, 90] },
];
export const D_FINISH = [
  "Clamp the head tight and twist strokes",
  "Thumb over slit and stroke fast",
  "Palming and strokes",
];

/* ========= PRINCESS MODE (you act on her) ========= */
export const P_WARM = [
  "Two-fingers stroke outer lips",
  "Sucky level 3",
  "Vibrator level 1",
  "One finger gently rubbing her clit",
  "Tongue slowly circling over the clit",
  "Two fingers inside",
];
export const P_BUILD = [
  "Run the vibrator up/down her pussy",
  "Sucky level 4 while fingering slowly",
  "Sucky level 5 pulsing on and off",
  "Vibrator level 1 while your fingers spread her open",
  "Lick and suck her clit",
  "Vibrator level 2 while fingering",
  "Sucky from level 3 → 4 → 5",
  "Two fingers inside",
];
export const P_OVER = [
  "Sucky level 7 tapping clit",
  "Sucky level 6",
  "Vibrator level 3 while fingering",
  "Suck on clit while fingering",
  "Sucky level 7, drop to 5 then back to 7",
  "Sucky level 6 on clit while fingering",
  "Vibrator level 2 while your fingers spread her open",
];
export const P_FINISH = [
  "sucky level 8",
  "sucky level 8 while fingering",
  "Vibrator level 3 while fingering",
  "lick and suck clit while fingering"
];

function pickToyForPhase(phase) {
  const weights = getSoloWeights(phase);
  const entries = Object.keys(weights).map(k => ({ item: k, w: weights[k] }));
  return pickWeighted(entries) || "SUCKY";
}
/* ========= SOLO PRINCESS (no internal fingering) ========= */
/* Toy-specific pools; short, direct, fluid. */
export const SOLO_SUCKY_WARM = [
  { text: "Put sucky on clit at level 3", dur: [120, 180] },
  { text: "Pulse: seal briefly, lift briefly at Level 4", dur: [80, 150] },
];
export const SOLO_SUCKY_BUILD = [
  { text: "Put sucky on clit at level 4", dur: [100, 160] },
  { text: "Put sucky on clit at level 5", dur: [80, 140] },
];
export const SOLO_SUCKY_OVER = [
  { text: "Put sucky on clit at level 6", dur: [50, 80] },
  { text: "Put sucky on clit at level 7", dur: [50, 70] },
  { text: "Put sucky on clit at level 7 hold in place squeezing thighs together", dur: [60, 90] },
];

export const SOLO_WAND_WARM = [
  { text: "Rest the wand just above clit, level 1", dur: [90, 180] },
  { text: "Use the side of the wand head level 1", dur: [90, 180] },
];
export const SOLO_WAND_BUILD = [
  { text: "Hold wand between thighs level 2", dur: [60, 120] },
  { text: "Grind on wand level 2", dur: [60, 120] },
  { text: "Hold on clit level 2", dur: [60, 110] },
];
export const SOLO_WAND_OVER = [
  { text: "Grind on wand level 3", dur: [70, 180] },
  { text: "Wand on clit, firm level 3", dur: [50, 80] },
  { text: "Hold wand between thighs level 3", dur: [50, 100] },
];

export const SOLO_ZUMIO_WARM = [
  { text: "Trace tiny circles around the clit", dur: [60, 120] },
  { text: "Drag toy from below clit up and over", dur: [60, 100] },
  { text: "Skim the edge of the clit — barely touching", dur: [60, 120] },
];
export const SOLO_ZUMIO_BUILD = [
  { text: "Pinpoint on one side of clit", dur: [60, 120] },
  { text: "Tiny circles on the clit", dur: [60, 100] },
];
export const SOLO_ZUMIO_OVER = [
  { text: "Spread pussy and hold toy on clit", dur: [50, 120] },
  { text: "Hold the tip firm — micro-circles only", dur: [60, 80] },
];

/* Optional “say out loud” modifiers */
export const SOLO_MODIFIERS = [
  "Say out loud: “I belong to Sir.”",
  "Whisper: “Thank you, Sir.”",
  "Say: “I wish Sir was here watching me.”",
];

/* Convenience map so engine can grab by toy+phase */
export const SOLO_POOLS = {
  SUCKY: { WARM: SOLO_SUCKY_WARM, BUILD: SOLO_SUCKY_BUILD, OVER: SOLO_SUCKY_OVER },
  WAND:  { WARM: SOLO_WAND_WARM,  BUILD: SOLO_WAND_BUILD,  OVER: SOLO_WAND_OVER  },
  ZUMIO: { WARM: SOLO_ZUMIO_WARM, BUILD: SOLO_ZUMIO_BUILD, OVER: SOLO_ZUMIO_OVER }
};

/* ========= Timing presets (moved here so engine can import) ========= */
export function timesFor(mode, length){
  if(mode === "DOM"){
    return (length === "SHORT") ? {
      warmRounds:[2,3], buildCycles:3, overRounds:5,
      warmSpan:[50,65], buildSpan:[55,70], overPalm:[60,85], overStroke:[12,20],
      restWB:[10,18], restOver:[10,15], finalReset:60, restProb:0.15
    } : {
      warmRounds:[2,3], buildCycles:6, overRounds:9,
      warmSpan:[50,65], buildSpan:[55,70], overPalm:[60,85], overStroke:[12,20],
      restWB:[10,18], restOver:[10,15], finalReset:90, restProb:0.15
    };
} else { // PRINCESS / SOLO
  if (length === "SHORT") {
    return {
      warmRounds: [3,4], buildCycles: 4, overRounds: 6,
      warmSpan: [90,150], buildSpan: [90,150], overSpan: [120,210],
      restWB: [10,20], restOver: [10,15], finalReset: 120, restProb: 0.10
    };
  } else {
    return {
      warmRounds: [4,6], buildCycles: 6, overRounds: 10,
      warmSpan: [90,150], buildSpan: [90,150], overSpan: [150,240],
      // Longer rests in LONG sessions:
      restWB: [18,30],     // was [15,25]
      restOver: [15,22],   // was [12,18]
      finalReset: 150,
      restProb: 0.08
    };
  }
}


/* ========= chooser + tiny utils ========= */

export function randInt(min,max){ 
  return Math.floor(Math.random()*(max-min+1))+min; 
}

export function choice(arr){ 
  return arr[randInt(0, arr.length-1)]; 
}

export function maybeRest(range, prob){ 
  return Math.random() < prob ? randInt(range[0], range[1]) : 0; 
}

let usageCounts = {}, lastPick = {};
export function resetChooser(){ 
  usageCounts = {}; 
  lastPick = {}; 
}

export function choiceLimitedFrom(poolKey, arr){
  if(!usageCounts[poolKey]) usageCounts[poolKey] = {};
  if(!lastPick[poolKey]) lastPick[poolKey] = null;

  let tries = 0;
  while(tries < 50){
    const candidate = arr[randInt(0, arr.length-1)];
    const label = (typeof candidate === "string") ? candidate : candidate.text;
    const used = usageCounts[poolKey][label] || 0;
    if(used < 2 && label !== lastPick[poolKey]){
      usageCounts[poolKey][label] = used + 1;
      lastPick[poolKey] = label;
      return candidate;
    }
    tries++;
  }
  const available = arr.filter(t => (usageCounts[poolKey][typeof t === "string" ? t : t.text] || 0) < 2);
  const fallback = available.length ? choice(available) : choice(arr);
  const label = (typeof fallback === "string") ? fallback : fallback.text;
  usageCounts[poolKey][label] = (usageCounts[poolKey][label] || 0) + 1;
  lastPick[poolKey] = label;
  return fallback;
}
  
  /* ========= SOLO PRINCESS – Toy Bias ========= */
  export let SOLO_TOY_BIAS = localStorage.getItem("sc_soloBias") || "SUCKY_HEAVY";

  export function setToyBias(bias) {
    SOLO_TOY_BIAS = bias;
    localStorage.setItem("sc_soloBias", bias);
  }

  export function getSoloWeights(phase) {
    if (SOLO_TOY_BIAS === "BALANCED") {
      return { SUCKY: 3, WAND: 3, ZUMIO: 2 };
    }
    if (SOLO_TOY_BIAS === "WAND_HEAVY") {
      return { SUCKY: 2, WAND: 5, ZUMIO: 3 };
    }
    // SUCKY_HEAVY (default)
    return { SUCKY: 5, WAND: 2, ZUMIO: 2 };
  }
}
