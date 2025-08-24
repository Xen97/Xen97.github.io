// tasks.js  — pools + timing + chooser helpers

/* ========= DOM MODE (Princess acts on you) ========= */
export const D_WARM_PALM = [
  "Flat palming over the head — slow circles",
  "Ridge orbit — fingertip circles under the ridge"
];
export const D_WARM_STROKE = [
  "Shallow strokes below the ridge — slow",
  "Twist strokes"
];
export const D_MID_PALM = [
  "Thumb rub on head",
  "Palm cups the head, light rubbing",
  "Normal Palming — steady rubbing of the head",
];
export const D_MID_STROKE = [
  "Stroke the head with two fingers either side",
  "Slow full strokes",
  "Grip shift — 3 loose, 3 tight",
  "Twist strokes",
  "Tight shallow strokes — firm squeeze below ridge"
];
export const D_OVER_PALM = [
  "Normal Palming — steady rubbing of the head",
  "Slit Press — grind tight circles over the slit",
];
export const D_OVER_STROKE = [
  "Shallow strokes under the ridge + palming",
  "Shallow, rapid head strokes",
  "Progressively tighter downstrokes",
  "Trap the ridge and use tiny strokes"
];
export const D_FINISH = [
  "Clamp the head tight and twist through the climax",
  "Put thumb over the slit and rub tight circles, with small strokes to finish",
  "Hold just below the ridge, very fast tip strokes through the release",
  "Palm the head; other hand pounds short strokes"
];

/* ========= PRINCESS MODE (you act on her) ========= */
export const P_WARM = [
  "Two-fingers stroke outer lips",
  "Sucky on clit at level 4",
  "Vibrator on clit at level 1",
  "One finger gently rubbing her clit",
  "Tongue slowly circling over the clit",
  "Two fingers pressing just inside",
];
export const P_BUILD = [
  "Run the vibrator up/down her pussy",
  "Sucky level 5 locked on clit while fingering slowly",
  "Sucky level 6 pulsing on and off rhythmically",
  "Vibrator level 2 pressed on clit while your fingers spread her open",
  "Lick and suck her clit",
  "Vibrator level 2 on clit while fingering",
  "Sucky from level 3 → 4 → 5, holding her just below release",
  "Two fingers inside",
];
export const P_OVER = [
  "Thrash Assault — sucky level 8 tapping clit",
  "Relentless Suck-Lock — sucky level 7 sealed on her clit",
  "Vibrator level 3 on clit while fingering",
  "Suck on clit while fingering",
  "Sucky level 8, drop to 5 then back to 8",
  "Sucky level 7 on clit while fingering",
  "Vibrator level 3 pressed to clit"
];
export const P_FINISH = [
  "Your Favourite — sucky level 8 pinned to clit",
  "Double Pressure — sucky level 8 on clit while fingering",
  "Grinding Lock — Vibrator level 3 on clit while fingering",
  "Forced Lick Finish — lick and suck clit + hard fingering"
];

/* ========= SOLO PRINCESS (no internal fingering) ========= */
/* Toy-specific pools; short, direct, fluid. */
export const SOLO_SUCKY_WARM = [
  { text: "Put sucky on clit at level 4", dur: [120, 180] },
  { text: "Pulse: seal briefly, lift briefly at Level 5", dur: [80, 150] },
];
export const SOLO_SUCKY_BUILD = [
  { text: "Put sucky on clit at level 5", dur: [100, 160] },
  { text: "Put sucky on clit at level 6", dur: [80, 140] },
];
export const SOLO_SUCKY_OVER = [
  { text: "Put sucky on clit at level 7", dur: [50, 80] },
  { text: "Put sucky on clit at level 8", dur: [50, 70] },
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
  { text: "Trace tiny circles around the clit hood only", dur: [60, 120] },
  { text: "Drag toy from below clit up and over", dur: [60, 100] },
  { text: "Skim the edge of the hood — barely touching", dur: [60, 120] },
];
export const SOLO_ZUMIO_BUILD = [
  { text: "Pinpoint on one side of clit", dur: [60, 120] },
  { text: "Tiny fast circles on the clit", dur: [60, 100] },
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
  "Breathe out and count your breaths softly."
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
      warmRounds:[3,4], buildCycles:6, overRounds:9,
      warmSpan:[50,65], buildSpan:[55,70], overPalm:[60,85], overStroke:[12,20],
      restWB:[10,18], restOver:[10,15], finalReset:90, restProb:0.15
    };
  } else { // PRINCESS/ SOLO
    if(length === "SHORT"){
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

/* ========= chooser + tiny utils ========= */
export function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
export function choice(arr){ return arr[randInt(0, arr.length-1)]; }
export function maybeRest(range, prob){ return Math.random() < prob ? randInt(range[0], range[1]) : 0; }

let usageCounts = {}, lastPick = {};
export function resetChooser(){ usageCounts = {}; lastPick = {}; }
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

