// tasks.js  — pools + timing + chooser helpers

/* ========= DOM MODE (Princess acts on you) ========= */
export const D_WARM_PALM = [
  "Flat palming over the head — slow circles",
  "Ridge orbit — fingertip circles under the ridge"
];
export const D_WARM_STROKE = [
  "Shallow strokes below the ridge — slow",
  "Twist strokes — light twisting"
];
export const D_MID_PALM = [
  "Thumb rub on head — tight circles",
  "Cup and trap — palm cups the head, light rubbing",
  "Normal Palming — steady rubbing of the head",
];
export const D_MID_STROKE = [
  "Two-finger straddle — stroke the head with two fingers either side",
  "Base-to-tip drag — slow full strokes",
  "Grip shift — 3 loose, 3 tight (repeat)",
  "Twist strokes — slow twisting",
  "Tight shallow strokes — firm squeeze below ridge"
];
export const D_OVER_PALM = [
  "Normal Palming — steady rubbing of the head",
  "Slit Press — grind tight circles over the slit",
];
export const D_OVER_STROKE = [
  "Double Assault — shallow strokes under the ridge + palming",
  "Tip Whip — shallow, rapid head strokes",
  "Squeeze Stroke — progressively tighter downstrokes",
  "Head Clamp Roll — trap the ridge and use tiny strokes"
];
export const D_FINISH = [
  "Vise-Grip Twist — clamp the head tight and twist through the climax",
  "Hellgrind Lock — put thumb over the slit and rub tight circles, with small strokes to finish",
  "Tip-Whip Burst — hold just below the ridge, very fast tip strokes through the release",
  "Seal & Stroke — palm the head; other hand pounds short strokes"
];

/* ========= PRINCESS MODE (you act on her) ========= */
export const P_WARM = [
  "Outer lips only — two-fingers stroke outer lips",
  "Sucky on clit at level 2 — steady, teasing pressure",
  "Vibrator on clit at level 2–3 — slow circular motion",
  "One finger gently rubbing her clit hood — don’t expose fully",
  "Tongue slowly circling over the clit hood — very light contact",
  "Two fingers pressing just inside the entrance — shallow and slow",
];
export const P_BUILD = [
  "Toy glide — run the vibrator up/down her slit",
  "Sucky level 4 locked on clit while fingering slowly",
  "Sucky level 5 pulsing on and off rhythmically",
  "Vibrator level 4 pressed on clit while your fingers spread her open",
  "Mouth sealed on clit — steady suction with occasional tongue flicks",
  "Double assault — vibrator level 5 on clit while fingering",
  "Edge climb — sucky from level 3 → 4 → 5, holding her just below release",
  "Deep hooking — two fingers inside",
];
export const P_OVER = [
  "Thrash Assault — sucky level 8 tapping clit",
  "Relentless Suck-Lock — sucky level 7 sealed on her clit",
  "Pinned Spread — two fingers fast, while vibrator level 6 grinds on clit",
  "Tongue Torture — mouth suction on clit, fast tongue flicks, while fingering",
  "Rolling Edge — sucky level 8, drop to 5 then back to 8, repeating",
  "Edge Trap — rub her G-spot with 2 fingers while sucky level 7 stays on clit",
  "Breaking Point — vibrator level 8 pressed to clit + full hand squeezing her lips"
];
export const P_FINISH = [
  "Clit Clamp — sucky level 8 pinned to clit",
  "Double Pressure — two fingers curl hard on G-spot + sucky level 8 on clit",
  "Grinding Lock — vibrator laid flat and ground firmly into clit",
  "Pulse & Trap — sucky level 8 in bursts while fingering",
  "Forced Lick Finish — pin her thighs; rapid tongue on clit + hard fingering"
];

/* ========= SOLO PRINCESS (no internal fingering) ========= */
/* Toy-specific pools; short, direct, fluid. */
export const SOLO_SUCKY_WARM = [
  { text: "Put sucky on clit at level 4", dur: [120, 180] },
  { text: "Pulse: seal briefly, lift briefly at Level 5", dur: [40, 60] },
];
export const SOLO_SUCKY_BUILD = [
  { text: "Put sucky on clit at level 5", dur: [100, 160] },
  { text: "Put sucky on clit at level 6", dur: [80, 140] },
];
export const SOLO_SUCKY_OVER = [
  { text: "Put sucky on clit at level 7", dur: [30, 70] },
  { text: "Put sucky on clit at level 8", dur: [20, 50] },
];

export const SOLO_WAND_WARM = [
  { text: "Rest the wand just above clit, level 1", dur: [60, 180] },
  { text: "Use the side of the wand head level 1", dur: [60, 180] },
];
export const SOLO_WAND_BUILD = [
  { text: "Hold wand between thighs level 2", dur: [30, 120] },
  { text: "Grind on wand level 2", dur: [50, 120] },
  { text: "Hold on clit level 2", dur: [40, 110] },
];
export const SOLO_WAND_OVER = [
  { text: "Wand on clit, firm level 3", dur: [20, 70] },
  { text: "Hold wand between thighs level 3", dur: [20, 90] },
  { text: "Push wand hard against clit level 3", dur: [20, 60] },
];

export const SOLO_ZUMIO_WARM = [
  { text: "Trace tiny circles around the clit hood only", dur: [20, 60] },
  { text: "Drag toy from below clit up and over", dur: [20, 40] },
  { text: "Skim the edge of the hood — barely touching", dur: [20, 60] },
];
export const SOLO_ZUMIO_BUILD = [
  { text: "Pinpoint on one side of clit", dur: [20, 60] },
  { text: "Tiny fast circles on the clit", dur: [20, 40] },
];
export const SOLO_ZUMIO_OVER = [
  { text: "Spread pussy and hold toy on clit", dur: [15, 45] },
  { text: "Hold the tip firm — micro-circles only", dur: [20, 40] },
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

