// achievements.js
import { profile, saveProfile, todayStr, levelFromXp, updateLevelTag } from "./profile.js";
import { els } from "./ui.js";

export const ACHIEVEMENTS = [
  { id:"first_blood", icon:"✨", title:"First Run",
    desc:"Complete your first session.", test:(s,p)=> p.sessions >= 1 },
  { id:"no_skips", icon:"🎯", title:"Perfect Focus",
    desc:"Finish a session with 0 skips.", test:(s)=> s.skipCount === 0 },
  { id:"iron_will", icon:"🧊", title:"Iron Will",
    desc:"Finish a session with 0 rests.", test:(s)=> s.restCount === 0 },
  { id:"edge_marathon", icon:"⏱️", title:"Marathon",
    desc:"Total active time ≥ 45 minutes.", test:(s)=> s.totalSecs >= 45*60 },
  { id:"overlord", icon:"💜", title:"Cruel Overlord",
    desc:"Complete ≥ 8 Overload rounds (DOM mode).", test:(s)=> s.mode==="DOM" && s.overRounds >= 8 },
  { id:"princess_power", icon:"💗", title:"Princess Power",
    desc:"Complete ≥ 6 Build rounds (PRINCESS mode).", test:(s)=> s.mode==="PRINCESS" && s.buildCycles >= 6 },
  { id:"finisher_variety", icon:"🔀", title:"Variety Pack",
    desc:"Use 3 different finishers across runs.", test:(s,p)=> Object.keys(p.unlockedFinishers||{}).length >= 3 },
  { id:"streak3", icon:"🔥", title:"On a Roll",
    desc:"3-day session streak.", test:(s,p)=> p.streak >= 3 },
  { id:"streak7", icon:"⚡", title:"Unstoppable",
    desc:"7-day session streak.", test:(s,p)=> p.streak >= 7 },
];

export function openAchievements(){
  const grid = els.achievementsGrid; if(!grid) return;
  grid.innerHTML = "";
  let unlockedCount = 0;
  ACHIEVEMENTS.forEach(a=>{
    const unlocked = !!profile.unlocked[a.id];
    if(unlocked) unlockedCount++;
    const card = document.createElement("div");
    card.className = "badge" + (unlocked ? "" : " locked");
    card.innerHTML = `
      <div class="icon">${a.icon}</div>
      <div>
        <div class="title">${a.title}</div>
        <div class="meta">${a.desc}</div>
      </div>`;
    grid.appendChild(card);
  });
  if(els.achievementsCount) els.achievementsCount.textContent = `${unlockedCount}/${ACHIEVEMENTS.length}`;
  els.achievementsOverlay.classList.add("show");
}
export function closeAchievements(){ els.achievementsOverlay.classList.remove("show"); }

export function finalizeSessionAndProgress(sessionStats, log){
  // XP rules
  let gained = 0;
  gained += 5 * sessionStats.steps;
  gained += Math.round(sessionStats.totalSecs / 60);
  if(sessionStats.skipCount === 0) gained += 10;
  if(sessionStats.restCount === 0) gained += 10;
  if(sessionStats.length === "LONG") gained += 5;

  profile.xp += gained;
  profile.level = levelFromXp(profile.xp);
  profile.sessions += 1;

  // bests
  profile.best.duration = Math.max(profile.best.duration, sessionStats.totalSecs);
  profile.best.steps = Math.max(profile.best.steps, sessionStats.steps);

  // finisher variety tracking
  profile.unlockedFinishers = profile.unlockedFinishers || {};
  if(sessionStats.finisher) profile.unlockedFinishers[sessionStats.finisher] = true;

  // streak
  const today = todayStr();
  if(profile.lastDay !== today){
    if(profile.lastDay){
      const last = new Date(profile.lastDay);
      const now = new Date(today);
      const diff = (now - last)/(1000*60*60*24);
      profile.streak = (diff === 1) ? (profile.streak + 1) : 1;
    } else profile.streak = 1;
    profile.lastDay = today;
  }

  // achievements
  const newly = [];
  ACHIEVEMENTS.forEach(a=>{
    if(!profile.unlocked[a.id] && a.test(sessionStats, profile)){
      profile.unlocked[a.id] = true;
      newly.push(a);
    }
  });

  saveProfile();
  updateLevelTag();
  if(newly.length){ newly.forEach(a=> log(`🏆 Achievement unlocked: ${a.title}`)); }
  log(`+${gained} XP (Lvl ${profile.level})`);
}
