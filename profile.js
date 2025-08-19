// profile.js
export const PROFILE_KEY = "sc_profile_v1";
export const defaultProfile = () => ({
  xp: 0,
  level: 1,
  sessions: 0,
  best: { duration: 0, steps: 0 },
  lastDay: null,
  streak: 0,
  unlocked: {},
  unlockedFinishers: {}
});

export let profile = loadProfile();

export function loadProfile(){
  try {
    return {...defaultProfile(), ...JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}")};
  } catch {
    return defaultProfile();
  }
}
export function saveProfile(){
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function todayStr(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
export function xpForLevel(level){ return Math.floor(100 * level * (level - 1) * 0.9); }
export function levelFromXp(xp){
  let lvl = 1;
  while(xp >= xpForLevel(lvl+1)) lvl++;
  return Math.max(1, lvl);
}

export function updateLevelTag(){
  const tag = document.getElementById("levelTag");
  if(tag) tag.textContent = `Lv.${profile.level}`;
}
export function xpForLevel(level){ return Math.floor(100 * level * (level - 1) * 0.9); }
export function levelFromXp(xp){ let lvl=1; while(xp >= xpForLevel(lvl+1)) lvl++; return Math.max(1,lvl); }

// NEW:
export function progressToNext(xp){
  const curr = levelFromXp(xp);
  const start = xpForLevel(curr);
  const next  = xpForLevel(curr+1);
  const gained = xp - start;
  const need = Math.max(1, next - start);
  return { curr, gained, need, pct: Math.min(100, Math.round(gained/need*100)) };
}

