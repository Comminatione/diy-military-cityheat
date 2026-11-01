window.__engine.files.push(function* mutators() {
const $bosses = window.__engine.bosses;
const $enemies = window.__engine.enemies;
const $buildings = window.__engine.buildings;
const $core = window.__engine.core;
const $crawl = window.__engine.crawl;
const $legendary = window.__engine.legendary;
const $mutators = window.__engine.mutators;
const $profiler = window.__engine.profiler;
const $props = window.__engine.props;
const $psycho1 = window.__engine.psycho1;
const $psycho2 = window.__engine.psycho2;
const $replay = window.__engine.replay;
const $waves = window.__engine.waves;
const { _clearGameTimers, _gcsi, _getAliveEnemies, _getGodModeBadge, _gsi, _gst, _resetMilestones, buildMutatorConfig, el, showPickupMsg, unstuckBoss } = $buildings;
const { buildEnv, buildNavField, onBuilding } = $psycho1;
Object.assign($mutators, { _dcPeekToday, _graceTaper, _tickGodMode, activateGodMode, checkKillWhispers, clearBosses, dcOnBossKill, dcOnDamageTaken, dcOnGrenadeKill, dcOnHealthPickup, dcOnKill, dcOnRapidState, dcOnStreak, dcOnWaveOrScore, evaluateDailyChallenges, getDailyState, initDailyChallenges, initGame, nextWave, onBossDefeated, recordRunStats, renderDailyChallenges, startLevel, updateRunStreak });
yield;
/* ── v101: campaign carry-over, continuous wave numbering, longer waves ── */
const WAVE_ENEMY_MULT = 2.4;   // Extended wave length for tactical engagement
const WAVE_ENEMY_FLAT = 8;     // Substantial enemy waves from wave 2+

function _deserializeUpgradesLocal(raw){
  const copy = Object.assign({}, raw || {});
  copy.perk = Object.assign({}, (raw && raw.perk) || {});
  ['mutations','taken'].forEach(k=>{ copy[k] = new Set(Array.isArray(raw && raw[k]) ? raw[k] : []); });
  return copy;
}
function _captureUpgradeState(){
  try{
    return {
      wave: $buildings.wave || 0,
      wepUpgrades: JSON.parse(JSON.stringify($buildings.wepUpgrades || {})),
      wepEvolution: JSON.parse(JSON.stringify($psycho2.wepEvolution || {})),
      wepUpgradeCount: Object.assign({}, $psycho2.wepUpgradeCount || {}),
      legendaryWeps: [...(window._legendaryWeps || [])],
      armorTier: $psycho2.armorTier || 0,
      playerUpgrades: $legendary._serializeUpgrades($psycho2.playerUpgrades || {}),
      grenadeCount: $buildings.grenadeCount || 3,
      WK: [...($buildings.WK || [])],
      curWep: $buildings.curWep || 'rifle',
      wepStats: Object.fromEntries(Object.keys($buildings.WEAPONS||{}).map(w => [w, {
        cd: $buildings.WEAPONS[w].cd, spd: $buildings.WEAPONS[w].spd, range: $buildings.WEAPONS[w].range
      }])),
      maxHpBonus: Math.max(0, ($buildings.player ? $buildings.player.maxHp : 0) - (window._diyBaseMaxHp || 0)),
      playerLevel: $buildings.playerLevel || 1,
      playerXP: $buildings.playerXP || 0,
      xpToNext: $buildings.xpToNext || 100,
      upgradeRerollsUsed: $buildings._upgradeRerollsUsed || 0,
    };
  }catch(e){ console.warn('[carry] capture failed', e); return null; }
}
function _applyCarryState(s){
  if(!s) return;
  try{
    if(s.wepUpgrades){ $buildings.wepUpgrades = JSON.parse(JSON.stringify(s.wepUpgrades)); window.wepUpgrades = $buildings.wepUpgrades; }
    if(s.wepEvolution) $psycho2.wepEvolution = JSON.parse(JSON.stringify(s.wepEvolution));
    if(s.wepUpgradeCount){ $psycho2.wepUpgradeCount = Object.assign({}, s.wepUpgradeCount); window.wepUpgradeCount = $psycho2.wepUpgradeCount; }
    if(Array.isArray(s.legendaryWeps)) window._legendaryWeps = new Set(s.legendaryWeps);
    if(typeof s.armorTier === 'number') $psycho2.armorTier = s.armorTier;
    if(s.playerUpgrades){ $psycho2.playerUpgrades = _deserializeUpgradesLocal(s.playerUpgrades); window.playerUpgrades = $psycho2.playerUpgrades; }
    if(s.wepStats){
      Object.entries(s.wepStats).forEach(([w,st])=>{
        const W = $buildings.WEAPONS[w]; if(!W||!st) return;
        if(typeof st.cd === 'number') W.cd = st.cd;
        if(typeof st.spd === 'number') W.spd = st.spd;
        if(typeof st.range === 'number') W.range = st.range;
      });
    }
    if(Array.isArray(s.WK) && s.WK.length){
      $buildings.WK.length = 0;
      s.WK.forEach(w=>{ if($buildings.WEAPONS[w] && !$buildings.WK.includes(w)) $buildings.WK.push(w); });
    }
    if(typeof s.grenadeCount === 'number') $buildings.grenadeCount = Math.max(3, s.grenadeCount);
    Object.keys($buildings.WEAPONS).forEach(w=>{
      const u = $buildings.wepUpgrades[w] || { ammo: 0 };
      $buildings.wepAmmo[w] = $buildings.WEAPONS[w].ammo + (u.ammo || 0);
    });
    if(s.curWep && $buildings.WK.includes(s.curWep)) $buildings.curWep = s.curWep;
    if(typeof s.maxHpBonus === 'number' && s.maxHpBonus > 0){
      $buildings.player.maxHp += s.maxHpBonus;
      $buildings.player.hp = $buildings.player.maxHp;
    }
    if(typeof s.playerLevel === 'number') $buildings.playerLevel = s.playerLevel;
    if(typeof s.playerXP === 'number') $buildings.playerXP = s.playerXP;
    if(typeof s.xpToNext === 'number') $buildings.xpToNext = s.xpToNext;
    if(typeof s.upgradeRerollsUsed === 'number') $buildings._upgradeRerollsUsed = s.upgradeRerollsUsed;
  }catch(e){ console.warn('[carry] apply failed', e); }
}
function _localDayKey(d = new Date()){
return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
function _localDayDiff(keyA, keyB){
const toDate = k => new Date(Math.floor(k/10000), Math.floor(k/100)%100 - 1, k%100);
return Math.round((toDate(keyA) - toDate(keyB)) / 86400000);
}
function getDailyRouletteMutators(){
const _dailyKey = String(_localDayKey());
let _dailyRoulette = [];
try {
const _stored = JSON.parse(localStorage.getItem('diy_daily_roulette') || '{}');
if(_stored.date === _dailyKey){
_dailyRoulette = _stored.ids || [];
} else {
const _seed = parseInt(_dailyKey) % 999983;
const _eligible = $buildings.MUTATOR_DEFS.filter(m => !['mut_chaos','mut_turbo'].includes(m.id));
const _shuffled = [..._eligible];
for(let _si = _shuffled.length-1; _si > 0; _si--){
const _sj = Math.floor(Math.abs((_seed * (_si + 7) * 1103515245 + 12345) % (_si + 1)));
[_shuffled[_si], _shuffled[_sj]] = [_shuffled[_sj], _shuffled[_si]];
}
_dailyRoulette = _shuffled.slice(0,2).map(m=>m.id);
localStorage.setItem('diy_daily_roulette', JSON.stringify({date:_dailyKey, ids:_dailyRoulette}));
}
} catch(_e){ _dailyRoulette = []; }
return _dailyRoulette;
}
window.getDailyRouletteMutators = getDailyRouletteMutators;
function activateGodMode(durationTicks){
  durationTicks = durationTicks || 480;
  const wasActive = ($buildings.player.godModeTimer||0) > 0;
  if(wasActive){
    $buildings.player.godModeTimer = ($buildings.player.godModeTimer||0) + Math.min($buildings.GOD_MODE_RETRIGGER_CAP_TICKS, durationTicks);
  } else {
    $buildings.player.godModeTimer = durationTicks;
  }
  $buildings.player.shield = Math.max($buildings.player.shield||0, 99999);
  const badge = _getGodModeBadge();
  badge.style.opacity='1';
  const gv = document.getElementById('god-vignette');
  if(gv) gv.style.opacity='1';
  if(!wasActive){
    showPickupMsg('▸ GOD MODE — UNSTOPPABLE','#ffd700');
    try{ $buildings._zoom=Math.max($buildings._zoom||0,0.07); $buildings._zoomFx=$buildings.player.x; $buildings._zoomFy=$buildings.player.y; }catch(e){}
    try{ $psycho2.killFlash('rgba(255,215,0,0.55)', 320); }catch(e){}
    try{ $bosses.shake(22); }catch(e){}
    try{ $psycho2.vibrate([40,30,40,30,40,30,120]); }catch(e){}
    try{ audioManager.playKillChord && audioManager.playKillChord(); }catch(e){}
    try{ $bosses.ptclBurst($buildings.player.x,$buildings.player.y,'#ffd700',$core.isMobile?20:46,8,30,4); }catch(e){}
  } else {
    showPickupMsg('▸ GOD MODE EXTENDED','#ffd700');
  }
}
const _GOD_SMITE_CD_TICKS = 90, _GOD_SMITE_RANGE = 180;
let _godLightningCD=0;
function _tickGodMode(){
  if(!($buildings.player.godModeTimer>0)){
    if(_godLightningCD>0) _godLightningCD--;
    return;
  }
  $buildings.player.godModeTimer--;
  $buildings.player.shield = 99999;
  const t = document.getElementById('god-mode-timer');
  if(t) t.textContent = Math.ceil($buildings.player.godModeTimer/60);
  const gv = document.getElementById('god-vignette');
  if(gv && !$buildings.settingPerfMode && $buildings.tick%2===0){
  const _gPulse = 0.28+Math.sin($buildings.tick*0.12)*0.07;
  gv.style.opacity=String(_gPulse);
  }
  if(!$core.isUltraLow && $buildings.tick%3===0){ try{ $bosses.ptcl($buildings.player.x,$buildings.player.y,Math.random()<0.4?'#ffffee':'#ffd700',2,2.2); }catch(e){} }
  if(_godLightningCD>0) _godLightningCD--;
  else { _godLightningCD=_GOD_SMITE_CD_TICKS; _godSmite(); }
  if($buildings.player.godModeTimer===0){
    $buildings.player.shield = 0;
    const badge = document.getElementById('god-mode-badge');
    if(badge) badge.style.opacity='0';
    if(gv) gv.style.opacity='0';
    showPickupMsg('GOD MODE FADED','#ffaa00');
    try{ $psycho2.vibrate(60); }catch(e){}
  }
}
function _godSmite(){
  const targets=_getAliveEnemies().filter(e=>!e.boss && Math.hypot(e.x-$buildings.player.x,e.y-$buildings.player.y)<_GOD_SMITE_RANGE);
  if(!targets.length) return;
  targets.sort((a,b)=>Math.hypot(a.x-$buildings.player.x,a.y-$buildings.player.y)-Math.hypot(b.x-$buildings.player.x,b.y-$buildings.player.y));
  const target=targets[0];
  $core.ctx._godBolt={x1:$buildings.player.x,y1:$buildings.player.y,x2:target.x,y2:target.y,life:6};
  target.hp-=9999;
  $psycho2.floatText(target.x,target.y-16,'▸SMITE','#ffff00',11);
  $bosses.ptcl(target.x,target.y,'#ffff00',6,2);
  if(target.hp<=0) $psycho2.killEnemy(target);
}
const WEATHERS={
clear:{name:'CLEAR SKIES',intensity:0,color:null,wind:0},
rain:{name:'HEAVY RAIN',intensity:0.6,color:'rgba(100,150,255,0.3)',wind:2},
sand:{name:'SANDSTORM',intensity:0.8,color:'rgba(200,180,100,0.5)',wind:4},
fog:{name:'DENSE FOG',intensity:0.7,color:'rgba(150,150,180,0.4)',wind:1}
}; ;$mutators.WEATHERS = WEATHERS;
const DC_TEMPLATES = [
{ id:'kill20', diff:'easy', icon:'X', label:()=>'Kill 20 enemies in one run', goal:()=>({type:'kills', target:20 }), reward:{xp:80, tokens:2, label:'+80 XP · ¤×2'}},
{ id:'wave3', diff:'easy', icon:'▸', label:()=>'Reach wave 3', goal:()=>({type:'wave', target:3 }), reward:{xp:60, tokens:2, label:'+60 XP · ¤×2'}},
{ id:'score2k', diff:'easy', icon:'◎', label:()=>'Score 2,000 points', goal:()=>({type:'score', target:2000 }), reward:{xp:70, tokens:2, label:'+70 XP · ¤×2'}},
{ id:'grenade3', diff:'easy', icon:'▪', label:()=>'Kill 3 enemies with grenades', goal:()=>({type:'grenadeKills', target:3 }), reward:{xp:80, tokens:2, label:'+80 XP · ¤×2'}},
{ id:'nodmgw1', diff:'easy', icon:'▣', label:()=>'Complete wave 1 without taking damage', goal:()=>({type:'nodmgWave', target:1 }), reward:{xp:90, tokens:2, label:'+90 XP · ¤×2'}},
{ id:'smg15', diff:'easy', icon:'<svg class="ico"><use href="#ico-play"/></svg>', label:()=>'Get 15 kills with the SMG', goal:()=>({type:'weaponKills', target:15, weapon:'smg'}), reward:{xp:75, tokens:2, label:'+75 XP · ¤×2'}},
{ id:'pickup5', diff:'easy', icon:'+', label:()=>'Pick up 5 health packs', goal:()=>({type:'healthPickups', target:5 }), reward:{xp:65, tokens:2, label:'+65 XP · ¤×2'}},
{ id:'streak5', diff:'easy', icon:'', label:()=>'Achieve a 5-kill streak', goal:()=>({type:'streak', target:5 }), reward:{xp:70, tokens:2, label:'+70 XP · ¤×2'}},
{ id:'elite3', diff:'easy', icon:'◉', label:()=>'Kill 3 elite enemies', goal:()=>({type:'eliteKills', target:3 }), reward:{xp:85, tokens:2, label:'+85 XP · ¤×2'}},
{ id:'rapidkill8', diff:'easy', icon:'▸', label:()=>'Kill 8 enemies while rapid fire is active', goal:()=>({type:'rapidKills', target:8 }), reward:{xp:80, tokens:2, label:'+80 XP · ¤×2'}},
{ id:'multikill2', diff:'easy', icon:'*', label:()=>'Get a double kill (2 kills within 1.5 seconds)', goal:()=>({type:'multiKill', target:1, size:2}), reward:{xp:90, tokens:2, label:'+90 XP · ¤×2'}},
{ id:'survive3min', diff:'easy', icon:'<svg class="ico"><use href="#ico-timer"/></svg>', label:()=>'Survive for 3 minutes', goal:()=>({type:'surviveSeconds', target:180 }), reward:{xp:70, tokens:2, label:'+70 XP · ¤×2'}},
{ id:'kill60', diff:'medium', icon:'X', label:()=>'Kill 60 enemies in one run', goal:()=>({type:'kills', target:60 }), reward:{xp:180, tokens:4, label:'+180 XP · ¤×4'}},
{ id:'wave6', diff:'medium', icon:'▸', label:()=>'Reach wave 6', goal:()=>({type:'wave', target:6 }), reward:{xp:160, tokens:4, label:'+160 XP · ¤×4'}},
{ id:'score8k', diff:'medium', icon:'◎', label:()=>'Score 8,000 points', goal:()=>({type:'score', target:8000 }), reward:{xp:180, tokens:4, label:'+180 XP · ¤×4'}},
{ id:'rifle30', diff:'medium', icon:'<svg class="ico"><use href="#ico-play"/></svg>', label:()=>'Get 30 kills with the rifle', goal:()=>({type:'weaponKills', target:30, weapon:'rifle'}), reward:{xp:170, tokens:4, label:'+170 XP · ¤×4'}},
{ id:'knife10', diff:'medium', icon:'<svg class="ico"><use href="#ico-play"/></svg>', label:()=>'Get 10 kills with the knife', goal:()=>({type:'weaponKills', target:10, weapon:'knife'}), reward:{xp:200, tokens:4, label:'+200 XP · ¤×4'}},
{ id:'grenade10', diff:'medium', icon:'▪', label:()=>'Kill 10 enemies with grenades', goal:()=>({type:'grenadeKills', target:10 }), reward:{xp:180, tokens:4, label:'+180 XP · ¤×4'}},
{ id:'killboss', diff:'medium', icon:'*', label:()=>'Defeat a boss', goal:()=>({type:'bossKills', target:1 }), reward:{xp:200, tokens:4, label:'+200 XP · ¤×4'}},
{ id:'streak8', diff:'medium', icon:'', label:()=>'Achieve an 8-kill streak', goal:()=>({type:'streak', target:8 }), reward:{xp:160, tokens:4, label:'+160 XP · ¤×4'}},
{ id:'smg40', diff:'medium', icon:'<svg class="ico"><use href="#ico-play"/></svg>', label:()=>'Get 40 kills with the SMG', goal:()=>({type:'weaponKills', target:40, weapon:'smg'}), reward:{xp:175, tokens:4, label:'+175 XP · ¤×4'}},
{ id:'shotgun20', diff:'medium', icon:'*', label:()=>'Get 20 kills with the shotgun', goal:()=>({type:'weaponKills', target:20, weapon:'shotgun'}), reward:{xp:175, tokens:4, label:'+175 XP · ¤×4'}},
{ id:'elite10', diff:'medium', icon:'◉', label:()=>'Kill 10 elite enemies', goal:()=>({type:'eliteKills', target:10 }), reward:{xp:190, tokens:4, label:'+190 XP · ¤×4'}},
{ id:'berserker5', diff:'medium', icon:'▸', label:()=>'Kill 5 berserkers', goal:()=>({type:'typeKills', target:5, etype:'berserker'}), reward:{xp:185, tokens:4, label:'+185 XP · ¤×4'}},
{ id:'multikill3', diff:'medium', icon:'*', label:()=>'Get a triple kill (3 kills within 1.5 seconds)', goal:()=>({type:'multiKill', target:1, size:3}), reward:{xp:200, tokens:4, label:'+200 XP · ¤×4'}},
{ id:'nodmgw3', diff:'medium', icon:'▣', label:()=>'Survive 3 waves without taking damage', goal:()=>({type:'nodmgWaveStreak', target:3 }), reward:{xp:210, tokens:4, label:'+210 XP · ¤×4'}},
{ id:'survive8min', diff:'medium', icon:'<svg class="ico"><use href="#ico-timer"/></svg>', label:()=>'Survive for 8 minutes', goal:()=>({type:'surviveSeconds', target:480 }), reward:{xp:170, tokens:4, label:'+170 XP · ¤×4'}},
{ id:'rapidkill20', diff:'medium', icon:'▸', label:()=>'Kill 20 enemies while rapid fire is active', goal:()=>({type:'rapidKills', target:20 }), reward:{xp:180, tokens:4, label:'+180 XP · ¤×4'}},
{ id:'minigun20', diff:'medium', icon:'', label:()=>'Get 20 kills with the minigun', goal:()=>({type:'weaponKills', target:20, weapon:'minigun'}), reward:{xp:185, tokens:4, label:'+185 XP · ¤×4'}},
{ id:'wave10', diff:'hard', icon:'▸', label:()=>'Reach wave 10', goal:()=>({type:'wave', target:10 }), reward:{xp:400, tokens:6, label:'+400 XP · ¤×6'}},
{ id:'score20k', diff:'hard', icon:'◎', label:()=>'Score 20,000 points', goal:()=>({type:'score', target:20000}), reward:{xp:350, tokens:6, label:'+350 XP · ¤×6'}},
{ id:'kill150', diff:'hard', icon:'X', label:()=>'Kill 150 enemies in one run', goal:()=>({type:'kills', target:150 }), reward:{xp:350, tokens:6, label:'+350 XP · ¤×6'}},
{ id:'shotgun40', diff:'hard', icon:'*', label:()=>'Get 40 kills with the shotgun', goal:()=>({type:'weaponKills', target:40, weapon:'shotgun'}), reward:{xp:380, tokens:6, label:'+380 XP · ¤×6'}},
{ id:'2boss', diff:'hard', icon:'', label:()=>'Defeat 2 bosses in one run', goal:()=>({type:'bossKills', target:2 }), reward:{xp:450, tokens:6, label:'+450 XP · ¤×6'}},
{ id:'nodmgboss', diff:'hard', icon:'▣', label:()=>'Defeat a boss without taking damage', goal:()=>({type:'nodmgBoss', target:1 }), reward:{xp:500, tokens:6, label:'+500 XP · ¤×6'}},
{ id:'streak15', diff:'hard', icon:'', label:()=>'Achieve a 15-kill streak', goal:()=>({type:'streak', target:15 }), reward:{xp:420, tokens:6, label:'+420 XP · ¤×6'}},
{ id:'knife30', diff:'hard', icon:'<svg class="ico"><use href="#ico-play"/></svg>', label:()=>'Get 30 kills with the knife', goal:()=>({type:'weaponKills', target:30, weapon:'knife'}), reward:{xp:460, tokens:6, label:'+460 XP · ¤×6'}},
{ id:'rpg15', diff:'hard', icon:'▲', label:()=>'Get 15 kills with the RPG', goal:()=>({type:'weaponKills', target:15, weapon:'rpg'}), reward:{xp:400, tokens:6, label:'+400 XP · ¤×6'}},
{ id:'flamer25', diff:'hard', icon:'', label:()=>'Get 25 kills with the flamethrower', goal:()=>({type:'weaponKills', target:25, weapon:'flamethrower'}), reward:{xp:420, tokens:6, label:'+420 XP · ¤×6'}},
{ id:'elite20', diff:'hard', icon:'◉', label:()=>'Kill 20 elite enemies', goal:()=>({type:'eliteKills', target:20 }), reward:{xp:430, tokens:6, label:'+430 XP · ¤×6'}},
{ id:'multikill4', diff:'hard', icon:'*', label:()=>'Get a quad kill (4 kills within 2 seconds)', goal:()=>({type:'multiKill', target:1, size:4}), reward:{xp:480, tokens:6, label:'+480 XP · ¤×6'}},
{ id:'multikillx5', diff:'hard', icon:'*', label:()=>'Get 5 multi-kills in one run', goal:()=>({type:'multiKillCount', target:5 }), reward:{xp:450, tokens:6, label:'+450 XP · ¤×6'}},
{ id:'nodmgw5', diff:'hard', icon:'▣', label:()=>'Survive 5 waves without taking damage', goal:()=>({type:'nodmgWaveStreak', target:5 }), reward:{xp:500, tokens:6, label:'+500 XP · ¤×6'}},
{ id:'survive15min',diff:'hard', icon:'<svg class="ico"><use href="#ico-timer"/></svg>', label:()=>'Survive for 15 minutes', goal:()=>({type:'surviveSeconds', target:900 }), reward:{xp:400, tokens:6, label:'+400 XP · ¤×6'}},
{ id:'grenade20', diff:'hard', icon:'▪', label:()=>'Kill 20 enemies with grenades', goal:()=>({type:'grenadeKills', target:20 }), reward:{xp:410, tokens:6, label:'+410 XP · ¤×6'}},
{ id:'streak25', diff:'hard', icon:'', label:()=>'Achieve a 25-kill streak', goal:()=>({type:'streak', target:25 }), reward:{xp:500, tokens:6, label:'+500 XP · ¤×6'}},
{ id:'laser20', diff:'hard', icon:'<svg class="ico"><use href="#ico-play"/></svg>', label:()=>'Get 20 kills with the laser rifle', goal:()=>({type:'weaponKills', target:20, weapon:'laser'}), reward:{xp:430, tokens:6, label:'+430 XP · ¤×6'}},
{ id:'3boss', diff:'hard', icon:'X', label:()=>'Defeat 3 bosses in one run', goal:()=>({type:'bossKills', target:3 }), reward:{xp:550, tokens:6, label:'+550 XP · ¤×6'}},
{ id:'score50k', diff:'hard', icon:'¤', label:()=>'Score 50,000 points', goal:()=>({type:'score', target:50000}), reward:{xp:500, tokens:6, label:'+500 XP · ¤×6'}},
];
function _seededRand(seed){
let s = seed;
return function(){
s = (s * 1664525 + 1013904223) & 0xffffffff;
return (s >>> 0) / 0xffffffff;
};
}
function getStreakState(){
try{
const s = JSON.parse(localStorage.getItem('diy_streak')||'{}');
return { lastDay: s.lastDay || null, current: s.current || 0, best: s.best || 0 };
}catch(e){ return { lastDay: null, current: 0, best: 0 }; }
}
window.getStreakState = getStreakState;
function saveStreakState(s){
try{ localStorage.setItem('diy_streak', JSON.stringify(s)); }catch(e){}
}
function updateRunStreak(){
const todayKey = _localDayKey();
const st = getStreakState();
if(st.lastDay === todayKey){
return { current: st.current, best: st.best, isNewDay: false, justIncreased: false };
}
const isConsecutive = st.lastDay !== null && (_localDayDiff(todayKey, st.lastDay) === 1);
const newCurrent = isConsecutive ? st.current + 1 : 1;
const newBest = Math.max(st.best, newCurrent);
saveStreakState({ lastDay: todayKey, current: newCurrent, best: newBest });
return { current: newCurrent, best: newBest, isNewDay: true, justIncreased: true };
}
function getTodayChallenges(){
const dayKey = _localDayKey();
const rand = _seededRand((dayKey * 999983) >>> 0);
const easy = DC_TEMPLATES.filter(t=>t.diff==='easy');
const medium = DC_TEMPLATES.filter(t=>t.diff==='medium');
const hard = DC_TEMPLATES.filter(t=>t.diff==='hard');
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
return [pick(easy), pick(medium), pick(hard)];
}
function getDailyState(){
try{
const s = JSON.parse(localStorage.getItem('diy_daily')||'{}');
const todayKey = String(_localDayKey());
if(s.date !== todayKey) return { date:todayKey, completed:[], progress:{} };
return s;
}catch(e){ return { date:String(_localDayKey()), completed:[], progress:{} }; }
}
function saveDailyState(s){
try{ localStorage.setItem('diy_daily', JSON.stringify(s)); }catch(e){}
}
$mutators._dcProgress = {};
let _dcNodmgWaveActive = true;
$mutators._dcNodmgWaveTaken = false;
let _dcNodmgBossActive = false;
let _dcNodmgBossTaken = false;
let _dcBossKillsThisRun = 0;
let _dcGrenadeKills = 0;
let _dcPeakStreak = 0;
$mutators._dcTodayChallenges = null;
$mutators._dcLastKillWasGrenade = false;
let _dcEliteKills = 0;
let _dcTypeKills = {};
let _dcHealthPickups = 0;
let _dcRapidKills = 0;
let _dcRapidActive = false;
let _dcRunStartTick = 0;
let _dcRunStartTime = 0;
let _dcSurviveSeconds = 0;
let _dcRecentKillTimes = [];
let _dcMultiKillCount = 0;
let _dcPeakMultiKill = 0;
let _dcNodmgWaveStreakCur = 0;
let _dcNodmgWaveStreakPeak = 0;
function _dcPeekToday(){ return $mutators._dcTodayChallenges || getTodayChallenges(); }
function initDailyChallenges(){
if ($mutators._dcTodayChallenges && Object.keys($mutators._dcProgress).length) {
try {
const _flush = getDailyState();
if (!_flush.progress) _flush.progress = {};
$mutators._dcTodayChallenges.forEach(c => {
_flush.progress[c.id] = Math.max(_flush.progress[c.id] || 0, $mutators._dcProgress[c.id] || 0);
});
saveDailyState(_flush);
} catch(_e) {}
}
$mutators._dcTodayChallenges = getTodayChallenges();
_runStatsToken++;
_runStatsRecorded = null;
_dcNodmgWaveActive = true;
$mutators._dcNodmgWaveTaken = false;
_dcNodmgBossActive = false;
_dcNodmgBossTaken = false;
_dcBossKillsThisRun = 0;
_dcGrenadeKills = 0;
_dcPeakStreak = 0;
_dcEliteKills = 0;
_dcTypeKills = {};
_dcHealthPickups = 0;
_dcRapidKills = 0;
_dcRapidActive = false;
_dcRunStartTick = (typeof $buildings.tick !== 'undefined') ? $buildings.tick : 0;
_dcRunStartTime = Date.now();
_dcSurviveSeconds = 0;
_dcRecentKillTimes = [];
_dcMultiKillCount = 0;
_dcMidGameNotified = new Set();
_dcPeakMultiKill = 0;
_dcNodmgWaveStreakCur = 0;
_dcNodmgWaveStreakPeak = 0;
const savedState = getDailyState();
$mutators._dcProgress = {};
$mutators._dcTodayChallenges.forEach(c=>{
$mutators._dcProgress[c.id] = savedState.progress[c.id] || 0;
});
if(typeof renderDailyChallenges === 'function') try{ renderDailyChallenges(); }catch(_e){}
}
function dcOnKill(weapon, enemyType){
if(!$mutators._dcTodayChallenges) return;
const now = Date.now();
_dcRecentKillTimes.push(now);
_dcRecentKillTimes = _dcRecentKillTimes.filter(t => now - t <= 2000);
const clusterSize = _dcRecentKillTimes.length;
if(clusterSize >= 2){
_dcMultiKillCount++;
_dcPeakMultiKill = Math.max(_dcPeakMultiKill, clusterSize);
}
const eliteTypes = ['heavy','elite','sniper','berserker','shield'];
if(enemyType && eliteTypes.includes(enemyType)) _dcEliteKills++;
if(enemyType) _dcTypeKills[enemyType] = (_dcTypeKills[enemyType]||0) + 1;
if(_dcRapidActive) _dcRapidKills++;
$mutators._dcTodayChallenges.forEach(c=>{
const g = c.goal();
if(g.type==='kills') $mutators._dcProgress[c.id] = Math.min(g.target, ($mutators._dcProgress[c.id]||0)+1);
if(g.type==='weaponKills' && g.weapon===weapon && !$mutators._dcLastKillWasGrenade)
$mutators._dcProgress[c.id] = Math.min(g.target, ($mutators._dcProgress[c.id]||0)+1);
if(g.type==='eliteKills') $mutators._dcProgress[c.id] = Math.min(g.target, _dcEliteKills);
if(g.type==='typeKills' && g.etype===enemyType)
$mutators._dcProgress[c.id] = Math.min(g.target, _dcTypeKills[enemyType]||0);
if(g.type==='rapidKills') $mutators._dcProgress[c.id] = Math.min(g.target, _dcRapidKills);
if(g.type==='multiKill') $mutators._dcProgress[c.id] = (_dcPeakMultiKill >= g.size) ? g.target : ($mutators._dcProgress[c.id]||0);
if(g.type==='multiKillCount')$mutators._dcProgress[c.id] = Math.min(g.target, _dcMultiKillCount);
});
dcCheckMidGame();
}
function dcOnGrenadeKill(){
_dcGrenadeKills++;
if(!$mutators._dcTodayChallenges) return;
$mutators._dcTodayChallenges.forEach(c=>{
if(c.goal().type==='grenadeKills') $mutators._dcProgress[c.id] = Math.min(c.goal().target, _dcGrenadeKills);
});
dcCheckMidGame();
}
let _runStatsToken = 0;
let _runStatsRecorded = null;
function recordRunStats(){
if(_runStatsRecorded && _runStatsRecorded.token === _runStatsToken) return _runStatsRecorded.result;
let bestCombo = 0, totalBossKills = 0;
try{ bestCombo = parseInt(localStorage.getItem('diy_best_combo')||'0'); }catch(e){}
try{ totalBossKills = parseInt(localStorage.getItem('diy_boss_kills_total')||'0'); }catch(e){}
const runCombo = _dcPeakStreak||0;
const runBossKills = _dcBossKillsThisRun||0;
const isNewComboRecord = runCombo > bestCombo;
if(isNewComboRecord) bestCombo = runCombo;
totalBossKills += runBossKills;
try{ localStorage.setItem('diy_best_combo', String(bestCombo)); }catch(e){}
try{ localStorage.setItem('diy_boss_kills_total', String(totalBossKills)); }catch(e){}
const result = { bestCombo, isNewComboRecord, totalBossKills, runCombo, runBossKills };
_runStatsRecorded = { token: _runStatsToken, result };
return result;
}
window.recordRunStats = recordRunStats;
function dcOnBossKill(){
_dcBossKillsThisRun++;
if(!$mutators._dcTodayChallenges) return;
$mutators._dcTodayChallenges.forEach(c=>{
const g = c.goal();
if(g.type==='bossKills') $mutators._dcProgress[c.id] = Math.min(g.target, _dcBossKillsThisRun);
if(g.type==='nodmgBoss' && !_dcNodmgBossTaken)
$mutators._dcProgress[c.id] = Math.min(g.target, ($mutators._dcProgress[c.id]||0)+1);
});
_dcNodmgBossActive = true;
_dcNodmgBossTaken = false;
dcCheckMidGame();
}
function dcOnStreak(n){
_dcPeakStreak = Math.max(_dcPeakStreak, n);
if(!$mutators._dcTodayChallenges) return;
$mutators._dcTodayChallenges.forEach(c=>{
if(c.goal().type==='streak') $mutators._dcProgress[c.id] = Math.min(c.goal().target, _dcPeakStreak);
});
dcCheckMidGame();
}
function dcOnDamageTaken(){
$mutators._dcNodmgWaveTaken = true;
_dcNodmgBossTaken = true;
}
function dcOnWaveStart(){
if(!$mutators._dcNodmgWaveTaken && $buildings.wave >= 1 && $mutators._dcTodayChallenges){
$mutators._dcTodayChallenges.forEach(c=>{
const g = c.goal();
if(g.type==='nodmgWave' && g.target===1) $mutators._dcProgress[c.id] = 1;
});
_dcNodmgWaveStreakCur++;
_dcNodmgWaveStreakPeak = Math.max(_dcNodmgWaveStreakPeak, _dcNodmgWaveStreakCur);
} else if($mutators._dcNodmgWaveTaken && $buildings.wave >= 1){
_dcNodmgWaveStreakCur = 0;
}
_dcNodmgWaveActive = true;
$mutators._dcNodmgWaveTaken = false;
if($buildings.wave > 0 && $buildings.wave % 5 === 0){
_dcNodmgBossActive = true;
_dcNodmgBossTaken = false;
}
dcCheckMidGame();
}
function dcOnWaveOrScore(){
if(!$mutators._dcTodayChallenges) return;
_dcSurviveSeconds = Math.floor((Date.now() - _dcRunStartTime) / 1000);
$mutators._dcTodayChallenges.forEach(c=>{
const g = c.goal();
if(g.type==='wave') $mutators._dcProgress[c.id] = Math.min(g.target, $buildings.wave);
if(g.type==='score') $mutators._dcProgress[c.id] = Math.min(g.target, $buildings.score);
if(g.type==='surviveSeconds') $mutators._dcProgress[c.id] = Math.min(g.target, _dcSurviveSeconds);
if(g.type==='nodmgWaveStreak') $mutators._dcProgress[c.id] = Math.min(g.target, _dcNodmgWaveStreakPeak);
});
dcCheckMidGame();
}
function dcOnHealthPickup(){
_dcHealthPickups++;
if(!$mutators._dcTodayChallenges) return;
$mutators._dcTodayChallenges.forEach(c=>{
if(c.goal().type==='healthPickups')
$mutators._dcProgress[c.id] = Math.min(c.goal().target, _dcHealthPickups);
});
dcCheckMidGame();
}
function dcOnRapidState(active){ _dcRapidActive = active; }
let _dcMidGameNotified = new Set();
let _dcMidGameDebounce = null;
function dcCheckMidGame(){
if(!$mutators._dcTodayChallenges || $buildings.state !== 'playing') return;
if(_dcMidGameDebounce) return;
_dcMidGameDebounce = setTimeout(()=>{
_dcMidGameDebounce = null;
const dailyState = getDailyState();
$mutators._dcTodayChallenges.forEach(c=>{
if(_dcMidGameNotified.has(c.id)) return;
if(dailyState.completed.includes(c.id)) return;
const g = c.goal();
const prog = $mutators._dcProgress[c.id] || 0;
if(prog >= g.target){
_dcMidGameNotified.add(c.id);
_showDailyChallengeComplete(c);
}
});
}, 120);
}
function _showDailyChallengeComplete(challenge){
try{
const _ctx = audioManager._ensureCtx();
if(_ctx){
const now = _ctx.currentTime;
const freqs = [660, 880, 1100];
freqs.forEach((f,i)=>{
const o = _ctx.createOscillator(), g = _ctx.createGain();
o.type = 'sine';
o.frequency.value = f;
g.gain.setValueAtTime(0, now + i*0.09);
g.gain.linearRampToValueAtTime(0.11, now + i*0.09 + 0.04);
g.gain.exponentialRampToValueAtTime(0.001, now + i*0.09 + 0.38);
o.connect(g); g.connect(_ctx.destination);
o.start(now + i*0.09); o.stop(now + i*0.09 + 0.4);
});
const shimmer = _ctx.createOscillator(), sg = _ctx.createGain();
shimmer.type = 'triangle'; shimmer.frequency.value = 1320;
sg.gain.setValueAtTime(0, now + 0.28);
sg.gain.linearRampToValueAtTime(0.07, now + 0.32);
sg.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
shimmer.connect(sg); sg.connect(_ctx.destination);
shimmer.start(now + 0.28); shimmer.stop(now + 0.8);
}
}catch(_e){}
const label = typeof challenge.label === 'function' ? challenge.label() : challenge.label;
showPickupMsg(`${challenge.icon} DAILY COMPLETE — ${label} · ${challenge.reward.label}`, '#ffd700', 4200);
if(typeof $profiler.showIngameHint === 'function'){
$profiler.showIngameHint(`◈ DAILY CHALLENGE DONE: ${label}`, 4000, 2);
}
}
function evaluateDailyChallenges(){
if(!$mutators._dcTodayChallenges) return { newlyCompleted:[], totalRewardXP:0, totalRewardTokens:0 };
dcOnWaveOrScore();
if(!$mutators._dcNodmgWaveTaken && $buildings.wave >= 1 && $mutators._dcTodayChallenges){
$mutators._dcTodayChallenges.forEach(c=>{
const g = c.goal();
if(g.type==='nodmgWave' && g.target===1) $mutators._dcProgress[c.id] = 1;
if(g.type==='nodmgWaveStreak') $mutators._dcProgress[c.id] = Math.min(g.target, _dcNodmgWaveStreakPeak);
});
}
const state = getDailyState();
let newlyCompleted = [];
let totalRewardXP = 0;
let totalRewardTokens = 0;
$mutators._dcTodayChallenges.forEach(c=>{
if(state.completed.includes(c.id)) return;
const g = c.goal();
const prog = $mutators._dcProgress[c.id] || 0;
if(prog >= g.target){
state.completed.push(c.id);
newlyCompleted.push(c);
totalRewardXP += c.reward.xp;
totalRewardTokens += c.reward.tokens;
}
});
if(!state.progress) state.progress = {};
$mutators._dcTodayChallenges.forEach(c=>{
state.progress[c.id] = Math.max(state.progress[c.id]||0, $mutators._dcProgress[c.id]||0);
});
saveDailyState(state);
if(totalRewardXP > 0){
const ps = $profiler.getPrestigeState();
ps.xp += totalRewardXP;
while(true){
const entry = $profiler.PRESTIGE_LEVELS[Math.min(ps.level, $profiler.PRESTIGE_LEVELS.length-1)];
if(ps.xp >= entry.xp){ ps.xp -= entry.xp; ps.level++; $profiler._applyPrestigeReward(entry.reward); }
else break;
}
$profiler.savePrestigeState(ps);
}
if(totalRewardTokens > 0){
$buildings.lifeTokens += totalRewardTokens;
try{ localStorage.setItem('diy_tokens', String($buildings.lifeTokens)); }catch(e){}
}
renderDailyChallenges();
return { newlyCompleted, totalRewardXP, totalRewardTokens };
}
function renderDailyChallenges(){
const challenges = _dcPeekToday();
const dailyState = getDailyState();
const body = document.getElementById('dc-body');
if(!body) return;
const diffLabel = { easy:'EASY', medium:'MED', hard:'HARD' };
const CHALLENGE_HINTS = {
killboss: 'Reach wave 5+',
'2boss': 'Reach wave 10+',
nodmgboss: 'Reach wave 5+ without taking damage during the boss',
wave6: 'Survive 6 waves',
wave10: 'Survive 10 waves',
wave3: 'Survive 3 waves',
};
body.innerHTML = challenges.map((c,i)=>{
const g = c.goal();
const completed = dailyState.completed.includes(c.id);
const savedProg = dailyState.progress[c.id] || 0;
const liveProg = ($mutators._dcProgress && $mutators._dcProgress[c.id] != null) ? ($mutators._dcProgress[c.id]||0) : 0;
const prog = Math.min(g.target, Math.max(savedProg, liveProg));
const pct = Math.min(100, Math.round(prog / g.target * 100));
const done = completed || prog >= g.target;
const hint = CHALLENGE_HINTS[c.id] ? `<div style="font-family:'Share Tech Mono',monospace;font-size:7px;color:#2a4a00;letter-spacing:1px;margin-top:1px;">${CHALLENGE_HINTS[c.id]}</div>` : '';
return `<div class="dc-row">
<span class="dc-icon">${c.icon}</span>
<div class="dc-info">
<div class="dc-label ${done?'done':''}">${c.label()}</div>
${hint}
<div class="dc-reward ${done?'done':''}">${c.reward.label}</div>
<div class="dc-bar-track"><div class="dc-bar-fill ${done?'done':''}" style="width:${pct}%"></div></div>
${done?`<div style="font-size:8px;color:#aaff00;letter-spacing:2px;margin-top:3px;">OK COMPLETED</div>`:''}
</div>
<span class="dc-diff ${c.diff}">${diffLabel[c.diff]}</span>
<button class="dc-play-btn${done?' done':''}" data-dc-idx="${i}" ${done?'disabled':''} type="button">${done?'OK DONE':'<svg class="ico"><use href="#ico-play"/></svg> PLAY'}</button>
</div>`;
}).join('');
body.querySelectorAll('.dc-play-btn:not(.done)').forEach(btn => {
btn.addEventListener('pointerdown', e => {
e.stopPropagation();
if(!gameReady){ return; }
audioManager.uiClick();
const dcBody = document.getElementById('dc-body');
const dcTitle = document.getElementById('dc-title');
if(dcBody) dcBody.style.display = 'none';
if(dcTitle) dcTitle.textContent = 'DAILY CHALLENGES ▼';
startLevel({ level: null });
});
});
const allDone = challenges.every(c=>dailyState.completed.includes(c.id));
document.getElementById('daily-challenges').classList.toggle('has-active', !allDone);
$profiler.updateDcTimer();
if(typeof syncDailyChallenges === 'function') try{ syncDailyChallenges(); }catch(_e){}
}
function startLevel(opts = {}) {
if (!gameReady) return;
window._diyRunGen = (window._diyRunGen || 0) + 1;
/* v101: capture this run's upgrades BEFORE initGame wipes them */
const _carry = !!opts.carryOver ? _captureUpgradeState() : null;
window._diyCarry = _carry;
if (opts.bossRush) {
window._bossRushMode = true;
opts.level = {
id: 'bossrush',
name: '▸ BOSS RUSH',
environment: 'urban',
difficulty: 9,
minWaves: 7,
maxWaves: 7,
enemyScaling: 2.0,
bossSequence: ['commander','cars','helicopter','tank','alien','jet','harmtug'],
isBossRush: true,
unlocked: true,
completed: false,
bestScore: 0,
timesPlayed: 0,
rewards: { xp: 3000, currency: 1500 },
};
} else {
window._bossRushMode = false;
}
const { level = null, skipFirstWave = false, mutators = false, checkpoint = false, skipIntro = false } = opts;
window._diySkipIntro = !!skipIntro;
let _resolvedLevel = level;
if (!_resolvedLevel && !opts.bossRush) {
_resolvedLevel = (typeof gameDB !== 'undefined')
? gameDB.getAllLevels().find(l => l.id === 1) || null
: null;
}
{
let _firstRunElite = false;
try { _firstRunElite = !localStorage.getItem('diy_run_count'); } catch(_e) {}
window._diyFirstRunElite = _firstRunElite && !opts.bossRush && !checkpoint && !(_resolvedLevel && _resolvedLevel.isTutorialLevel);
}
/* v101: continuous wave numbering — carry-over shifts this level's wave window */
let _off = 0;
if (opts.keepOffset) _off = Number($replay.waveOffset) || 0;
else if (_carry) _off = Number(_carry.wave) || 0;
else if (Number(opts.waveOffset)) _off = Number(opts.waveOffset) || 0;
else if (_resolvedLevel && typeof _resolvedLevel._waveOffset === 'number') _off = _resolvedLevel._waveOffset;

if (_resolvedLevel && !_resolvedLevel.isEndless && !_resolvedLevel.isBossRush && _off > 0) {
  const _src = _resolvedLevel._carryBase || _resolvedLevel;
  _resolvedLevel = Object.assign({}, _src, {
    minWaves: (Number(_src.minWaves) || 0) + _off,
    maxWaves: (Number(_src.maxWaves) || 0) + _off,
    _waveOffset: _off,
    _carryBase: _src,
  });
}
$replay.waveOffset = (_resolvedLevel && !_resolvedLevel.isEndless) ? _off : 0;
$replay.currentLevel = _resolvedLevel;
$replay.levelExplicitlyChosen = !!_resolvedLevel;
$replay.currentEnv = _resolvedLevel ? _resolvedLevel.environment : ($replay.currentEnv || 'jungle');
if (_resolvedLevel && _resolvedLevel.isEndless) {
try {
const _daily = getDailyRouletteMutators();
window._dailyRouletteMutators = _daily;
if (!mutators) { $buildings.activeMutators.clear(); }
_daily.forEach(id => $buildings.activeMutators.add(id));
// Always re-derive the config from the active set so a cleared set can't leave the previous run's modifiers live.
$buildings._mutCfg = $buildings.activeMutators.size ? buildMutatorConfig() : null;
} catch(_e) {}
}
if (!mutators) {
if (!_resolvedLevel || !_resolvedLevel.isEndless) { $buildings.activeMutators.clear(); $buildings._mutCfg = null; }
}
$buildings.state = window.state = 'playing';
$replay.ReplayRecorder.init();
if (!checkpoint) $legendary.clearCheckpoint();
initGame(skipFirstWave);
if (checkpoint) {
const _envBeforeLoad = $replay.currentEnv;
if ($legendary.loadCheckpoint()) {
$buildings.waveInProgress = false; $buildings.wavePending = false;
if($replay.currentEnv !== _envBeforeLoad){ buildEnv(); try{ $buildings.prewarmGroundCache(); }catch(e){} }
if(onBuilding($buildings.player.x, $buildings.player.y, 16)){
const _safe = unstuckBoss($buildings.player.x, $buildings.player.y, 16);
$buildings.player.x = _safe.x; $buildings.player.y = _safe.y;
}
$buildings.wave = Math.max(0, $buildings.wave - 1);
_gst(nextWave, 600);
} else {
_gst(nextWave, 600);
}
}
$profiler.showTouchControls($core.isMobile);
{
const mp = el('mobile-pause');
if (mp) {
mp.style.display = 'flex';
mp.innerHTML = '<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="2" width="4" height="14" rx="1" style="fill:#aaff00;filter:drop-shadow(0 0 4px rgba(170,255,0,0.8));"/><rect x="11" y="2" width="4" height="14" rx="1" style="fill:#aaff00;filter:drop-shadow(0 0 4px rgba(170,255,0,0.8));"/></svg>';
mp.classList.remove('paused-state');
if (!$core.isMobile) {
mp.title = 'Pause (P)';
const hint = el('pause-key-hint');
if (hint) hint.style.display = 'block';
}
}
if ($core.isMobile && typeof $profiler.addWepStripHint === 'function') $profiler.addWepStripHint();
}
if (typeof $profiler.buildWepStrip === 'function') $profiler.buildWepStrip();
const _appPP = window.applyPersistentPerks || $profiler.applyPersistentPerks;
if (typeof _appPP === 'function') _appPP();
let _isVeryFirstEverPlay = false;
try { _isVeryFirstEverPlay = !localStorage.getItem('diy_played'); } catch(_e) {}
if (typeof $profiler.checkFirstPlay === 'function') $profiler.checkFirstPlay();
if (_isVeryFirstEverPlay && $replay.currentLevel && $replay.currentLevel.isTutorialLevel && typeof $profiler.showBootBriefing === 'function') {
$profiler.showBootBriefing();
}
if (!level || (level && level.isEndless)) {
try {
if (!localStorage.getItem('diy_endless_attempted')) {
localStorage.setItem('diy_endless_attempted', '1');
const _mc = document.querySelector('#acard-mutators');
if (_mc) { _mc.style.opacity = ''; _mc.style.pointerEvents = ''; _mc.title = ''; }
}
} catch(_e) {}
}
if (window._diyRafId) cancelAnimationFrame(window._diyRafId);
window._diyRafId = requestAnimationFrame($profiler.gameLoop);
}
window.startLevel = startLevel;
function initGame(skipFirstWave){
_clearGameTimers();
buildEnv(); try{ $buildings.prewarmGroundCache(); }catch(e){}
try{
const _crawl = document.getElementById('story-crawl');
if (_crawl && _crawl.classList.contains('active')) {
_crawl.classList.remove('active');
_crawl.style.opacity = '';
$buildings.crawlActive = false;
}
}catch(_e){}
try{
if (typeof $props._guidedWave !== 'undefined' && $props._guidedWave) {
$props._guidedWave = false;
$props._guidedCooldown = 0;
$props._guidedCurrentStep = 0;
$props._guidedFreeze = false;
$props._guidedDone = {};
const _mc = document.getElementById('mission-card');
if (_mc) _mc.classList.remove('show');
const _wm = document.getElementById('training-watermark');
if (_wm) _wm.style.display = 'none';
}
}catch(_e){}
(function(){
const mhud=document.getElementById('mutator-hud');
if(!mhud) return;
if($buildings._mutCfg && $buildings.activeMutators.size>0){
mhud.style.display='block';
mhud.innerHTML='▸ '+[...$buildings.activeMutators].map(id=>{const d=$buildings.MUTATOR_DEFS.find(x=>x.id===id);return d?`<span style="color:${d.col}">${d.icon}${d.name}</span>`:id;}).join(' · ');
} else {
mhud.style.display='none';
mhud.innerHTML='';
}
$psycho2._armageddonCDUntil=0;
const _armPcBtn=document.getElementById('armageddon-btn-pc');
if(_armPcBtn) _armPcBtn.style.display=($buildings._mutCfg&&$buildings._mutCfg.armageddon&&!$core.isMobile)?'flex':'none';
const _armMobBtn=document.getElementById('btn-armageddon');
if(_armMobBtn) _armMobBtn.style.display=($buildings._mutCfg&&$buildings._mutCfg.armageddon&&$core.isMobile)?'flex':'none';
const _avArmBtn=document.getElementById('av-armageddon');
if(_avArmBtn) _avArmBtn.style.display=($buildings._mutCfg&&$buildings._mutCfg.armageddon&&$core.isMobile)?'flex':'none';
})();
let maxHp=$replay.selectedChar==='elite'?150:$replay.selectedChar==='commando'?120:$replay.selectedChar==='heavy'?160:$replay.selectedChar==='medic'?110:$replay.selectedChar==='sniper'?90:$replay.selectedChar==='alien'?95:100;
if($buildings._mutCfg&&$buildings._mutCfg.ironMan){ maxHp=Math.min(maxHp,40); }
if($buildings._mutCfg&&$buildings._mutCfg.hpStartMult){ maxHp=Math.max(20,Math.round(maxHp*$buildings._mutCfg.hpStartMult)); }
if($buildings._mutCfg&&$buildings._mutCfg.fogOfWar){ $replay.currentEnv='night'; }
$buildings.player={
x:$replay.W/2,y:$replay.H*0.72,hp:maxHp,maxHp,
angle:0,sc:0,shield:0,rapidTimer:0,speedTimer:0,godModeTimer:0,walkT:0,gp:0,char:$replay.selectedChar,
vx:0,vy:0,movingSpeed:0,kbx:0,kby:0,recoilOffset:0
};
try{
const _godBadge=document.getElementById('god-mode-badge');
if(_godBadge) _godBadge.style.opacity='0';
const _godVig=document.getElementById('god-vignette');
if(_godVig) _godVig.style.opacity='0';
}catch(_e){}
_godLightningCD=0;
window._diyBaseMaxHp = maxHp;
$legendary._prevPlayerHp = maxHp;
$replay.p2Down=false; $replay.p1Down=false; $replay.p2ReviveTimer=0; $replay.p1ReviveTimer=0;
if($replay.coopEnabled){
const p2MaxHp=$replay.selectedChar2==='elite'?150:$replay.selectedChar2==='commando'?120:$replay.selectedChar2==='heavy'?160:$replay.selectedChar2==='medic'?110:$replay.selectedChar2==='sniper'?90:$replay.selectedChar2==='alien'?95:100;
$replay.player2={x:$replay.W/2+40,y:$replay.H*0.72,hp:p2MaxHp,maxHp:p2MaxHp,angle:0,sc:0,shield:0,rapidTimer:0,speedTimer:0,walkT:0,gp:0,char:$replay.selectedChar2,vx:0,vy:0};
$replay.p2CurWep='rifle'; $replay.p2Reloading=false; $replay.p2ReloadTimer=0;
$replay.p2Ammo={rifle:$buildings.WEAPONS.rifle.ammo,shotgun:$buildings.WEAPONS.shotgun.ammo,smg:$buildings.WEAPONS.smg.ammo,knife:$buildings.WEAPONS.knife.ammo,minigun:$buildings.WEAPONS.minigun.ammo,rpg:$buildings.WEAPONS.rpg.ammo,flamethrower:$buildings.WEAPONS.flamethrower.ammo,laser:$buildings.WEAPONS.laser.ammo};
if($replay.selectedChar2==='heavy') $replay.p2Ammo.minigun=$buildings.WEAPONS.minigun.ammo*2;
if($replay.selectedChar2==='alien'){ $replay.p2Ammo.laser=$buildings.WEAPONS.laser.ammo*2; }
} else {
$replay.player2=null;
}
$buildings.bullets=$legendary._attachBulletPool([]);$buildings.enemies=[];$buildings.particles=[];$buildings.powerups=[];$buildings.allies=[];$buildings.grenades=[];$buildings.debrisArr=[];$buildings.floatingTexts=[];
$buildings.craters=[];$buildings.rubblePieces=[];
$bosses._ptclQHead=$bosses._ptclQTail=0;
$psycho2._shopDroneObj=null; $profiler._medicUsed=false;
clearBosses();
$psycho2.helicopter=null;$psycho2.alienShip=null;$psycho2.fighterJet=null;$psycho2.armoredCars=[];$psycho2._carsEncounterActive=false;
$buildings.score=window.score=0;$buildings.wave=window.wave=0;$buildings.totalKills=window.totalKills=0;$buildings.bossAlive=false;_whisperedKills.clear();
$buildings.wepKills={};$buildings.continueUsedThisRun=false;
$legendary._prevPlayerHp = maxHp; $legendary._hudLastAmmo = -1; $legendary._hudLastMaxAmmo = -1; $legendary._hudLastWep = ''; $legendary._hudLastReloading = false; $legendary._hudLastHpPct = -1; $legendary._inCloseCall = false;
initDailyChallenges();
$buildings.waveKills=0;$buildings.waveTotal=0;$buildings.waveInProgress=false;$buildings.wavePending=false;$buildings.playerDead=false;
$mutators._waveTypeQueue=[];
$buildings.reloading=false;$buildings.reloadTimer=0;$buildings.curWep='rifle';$buildings.tick=0;
$profiler._lastFrame = performance.now();
$profiler._updateFrameBudget();
$buildings.weather=WEATHERS.clear;$buildings.weatherTimer=0;
$buildings._aliveEnemies.length=0; $buildings._aliveEnemiesDirty=true;
$profiler._dqsBufHead=0; $profiler._dqsBufCount=0; $profiler._dqsBuf=new Float64Array($profiler._DQS_BUF_SIZE);
$replay._runtimeRenderScale=$replay._RES_SCALE_VALUES[$replay._userResPref] ?? null; $profiler._dqsBadStreak=0;
$buildings.WK.length=0;['rifle','shotgun','smg','knife','minigun','rpg','flamethrower'].forEach(w=>$buildings.WK.push(w));
if($buildings.unlockedLaser && !$buildings.WK.includes('laser')) $buildings.WK.push('laser');
if($psycho2._htPlasmaCutterUnlocked && !$buildings.WK.includes('plasmacutter')) $buildings.WK.push('plasmacutter');
$buildings.wepAmmo={rifle:$buildings.WEAPONS.rifle.ammo,shotgun:$buildings.WEAPONS.shotgun.ammo,smg:$buildings.WEAPONS.smg.ammo,knife:$buildings.WEAPONS.knife.ammo,minigun:$buildings.WEAPONS.minigun.ammo,rpg:$buildings.WEAPONS.rpg.ammo,flamethrower:$buildings.WEAPONS.flamethrower.ammo,laser:$buildings.WEAPONS.laser.ammo,plasmacutter:$buildings.WEAPONS.plasmacutter.ammo};
if($replay.selectedChar==='heavy') $buildings.wepAmmo.minigun=$buildings.WEAPONS.minigun.ammo*2;
if($replay.selectedChar==='alien'){ $buildings.wepAmmo.laser=$buildings.WEAPONS.laser.ammo*2; if(!$buildings.WK.includes('laser'))$buildings.WK.push('laser'); }
_graceWaves = ($replay.currentLevel && $replay.currentLevel.isTutorialLevel) ? 0 : 2;
$profiler._dailyBannerShownSession = false;
$buildings.playerXP=0;$buildings.playerLevel=1;$buildings.xpToNext=100;
$buildings.killStreak=0;$buildings.streakTimer=0;$buildings._streakFired.clear();_resetMilestones();
window._ow={active:false,stinger:false};
$buildings._bossTypesThisRun=[];
$buildings._firstBossSpawnTick=null;
$buildings.shakeX=0;$buildings.shakeY=0;$buildings.shakeMag=0;$buildings._zoom=0;$buildings._dmgInd=[];$buildings._hitAngTick=null;window._simAcc=0;
$buildings.wepUpgrades=Object.fromEntries(Object.keys($buildings.WEAPONS).map(w=>[w,{dmg:0,ammo:0,reload:0}]));
window.wepUpgrades = $buildings.wepUpgrades;
$buildings.grenadeCount=3;
const _asBtn=document.getElementById('btn-airstrike'); if(_asBtn) _asBtn.style.display='none';
$psycho2.playerUpgrades={speed:1,shieldOnWave:false,hpRegen:false,bigBoom:false,mutations:new Set(),taken:new Set()};
window.playerUpgrades = $psycho2.playerUpgrades;
if(typeof $psycho2._mutPillClear === 'function') $psycho2._mutPillClear();
if(typeof $psycho2.deactivatePsychoMode === 'function' && typeof $psycho1._psychoActive !== 'undefined' && $psycho1._psychoActive) $psycho2.deactivatePsychoMode();
$buildings._upgradeRerollsUsed = 0;
$psycho2.wepEvolution=Object.fromEntries(Object.keys($buildings.WEAPONS).map(w=>[w,0]));
$psycho2.armorTier=0;
window._legendaryWeps = new Set();
$psycho2.wepUpgradeCount=Object.fromEntries(Object.keys($buildings.WEAPONS).map(w=>[w,0]));
window.wepUpgradeCount = $psycho2.wepUpgradeCount;
$buildings.WEAPONS.rifle.cd=9; $buildings.WEAPONS.shotgun.cd=26; $buildings.WEAPONS.smg.cd=4;
$buildings.WEAPONS.knife.cd=14; $buildings.WEAPONS.minigun.cd=2; $buildings.WEAPONS.rpg.cd=60;
$buildings.WEAPONS.flamethrower.cd=2;
$buildings.WEAPONS.rifle.spd=15; $buildings.WEAPONS.shotgun.spd=14;$buildings.WEAPONS.smg.spd=16;
$buildings.WEAPONS.knife.spd=15; $buildings.WEAPONS.minigun.spd=17;$buildings.WEAPONS.rpg.spd=10;
el('score-num').textContent='0';el('kills-num').textContent='0';el('wave-num').textContent='1';
el('xp-fill').style.width='0%';el('player-level').textContent='1';
/* v101: restore upgrades carried from the previous level (they stay permanent) */
if(window._diyCarry){
  _applyCarryState(window._diyCarry);
  if((window._diyCarry.wave||0) > 0) $buildings.wave = window._diyCarry.wave;
  _graceWaves = 0;
  if(typeof $psycho2._mutPillRebuild === 'function') $psycho2._mutPillRebuild();
  try{ if(typeof $profiler.buildWepStrip === 'function') $profiler.buildWepStrip(); }catch(_e){}
  try{
    el('wave-num').textContent = String(($buildings.wave||0) + 1);
    const _wc = document.getElementById('wave-chip');
    if(_wc) _wc.textContent = String(($buildings.wave||0) + 1);
    el('player-level').textContent = $buildings.playerLevel || 1;
    el('xp-fill').style.width = Math.min(100, (($buildings.playerXP||0)/Math.max(1,$buildings.xpToNext||100))*100) + '%';
  }catch(_e){}
  window._diyCarry = null;
}
el('ally-hud').style.display='none';
el('upgrade-panel').style.display='none';
el('streak-hud').style.opacity='0';
$replay.envInd.textContent=$psycho1.ENVS[$replay.currentEnv].name;
$replay.envInd.classList.remove('faded');
clearTimeout($replay.envInd._fadeTO);
$replay.envInd._fadeTO = setTimeout(()=>$replay.envInd.classList.add('faded'), 3500);
for(let b of $psycho1.buildings)b.spawnFlash=0;
$legendary.updateHUD();$legendary.updateHP();$psycho2.updateGrenadeHUD();$legendary.updateWepUpgradeHUD();
$legendary.updateCoopHUD();
$replay.pauseBtn.style.display='block';
$replay.audioToggle.style.display='block';
$replay.CaptureTools.showButtons(true);
$buildings.isPaused=false;
if($profiler._mm) $profiler._mm.style.display='block';
audioManager.playLevelMusic($replay.currentEnv);
const _skipIntro = !!window._diySkipIntro; window._diySkipIntro = false;
if(($buildings.wave - ($replay.waveOffset||0)) === 0 && $replay.currentLevel && $replay.currentLevel.id >= 1 && $replay.currentLevel.id <= 11 && !_skipIntro){
if(!skipFirstWave){
const startAfterIntro = ()=>{
if($replay.currentLevel.id === 1){
$crawl.showOpeningCrawl(function(){ _gst(nextWave,400); });
} else if($replay.currentLevel.id === 2){
$crawl.showDesertCrawl(function(){ _gst(nextWave,400); });
} else {
_gst(nextWave, 400);
}
};
if($replay.currentLevel.id === 6){
showLevelIntroCard($replay.currentLevel.id, ()=> $crawl.showSpaceCrawl(()=> $bosses.showVrethRevealCutscene(startAfterIntro)));
} else if($replay.currentLevel.id === 3){
showLevelIntroCard($replay.currentLevel.id, ()=> $crawl.showUrbanCrawl(startAfterIntro));
} else if($replay.currentLevel.id === 4){
showLevelIntroCard($replay.currentLevel.id, ()=> $crawl.showArcticCrawl(startAfterIntro));
} else if($replay.currentLevel.id === 8){
showLevelIntroCard($replay.currentLevel.id, ()=> $crawl.showMarsCrawl(startAfterIntro));
} else if($replay.currentLevel.id === 7){
showLevelIntroCard($replay.currentLevel.id, ()=> $crawl.showOrbitalCrawl(startAfterIntro));
} else if($replay.currentLevel.id === 5){
showLevelIntroCard($replay.currentLevel.id, ()=> $crawl.showNightCrawl(startAfterIntro));
} else if($replay.currentLevel.id === 11){
showLevelIntroCard($replay.currentLevel.id, ()=> $bosses.showHarmTugRevealCutscene(startAfterIntro));
} else {
showLevelIntroCard($replay.currentLevel.id, startAfterIntro);
}
}
} else {
if(!skipFirstWave) _gst(nextWave,600);
}
if($replay.currentLevel && $replay.currentLevel.isTutorialLevel && !skipFirstWave){
_gst($props.startGuidedWave, 2000);
}
if (!$replay.currentLevel || !$replay.currentLevel.isTutorialLevel) {
const _hasSeenMutatorTip = localStorage.getItem('diy_mutator_tip_seen');
if (!_hasSeenMutatorTip && ($replay.currentLevel?.isEndless || $buildings.activeMutators?.size > 0)) {
_gst(()=>{
$profiler.showIngameHint(
'◇ MUTATORS change the rules — tap the card above to toggle them. ' +
'Try combining two for a SYNERGY bonus!',
7000
);
localStorage.setItem('diy_mutator_tip_seen', '1');
}, 3000);
}
}
}
function clearBosses(){
if($psycho2.helicopter){$psycho2.helicopter.alive=false;$psycho2.helicopter=null;}
if($psycho2.alienShip){$psycho2.alienShip.alive=false;$psycho2.alienShip=null;}
if($psycho2.fighterJet){$psycho2.fighterJet.alive=false;$psycho2.fighterJet=null;}
if($psycho2.spiderTank){$psycho2.spiderTank.alive=false;$psycho2.spiderTank=null;}
if($psycho2.harmTug){$psycho2.harmTug.alive=false;$psycho2.harmTug=null;}
$psycho2.armoredCars.forEach(c=>c.alive=false);$psycho2.armoredCars=[];$psycho2._carsEncounterActive=false;
$buildings.enemies.forEach(e=>{if(e.boss)e.alive=false;});
$psycho2.bossRegistry.clearAll();
$buildings.bossAlive=false;$replay.bBarW.style.opacity='0';
audioManager.stopBossMusic();
}

const WAVE_TEMPLATES = {
6: { types:['shield','soldier','soldier'], fill:'soldier' },
7: { types:['sniper','heavy','heavy'], fill:'soldier' },
8: { types:['berserker','berserker','berserker'], fill:'berserker' },
9: { types:['shield','sniper','soldier'], fill:'soldier' },
12: { types:['shield','shield','soldier','soldier'], fill:'heavy' },
13: { types:['bomber','berserker','berserker'], fill:'soldier' },
14: { types:['sniper','sniper','heavy','heavy'], fill:'soldier' },
16: { types:['shield','sniper','heavy','berserker'], fill:'soldier' },
17: { types:['shield','berserker','berserker'], fill:'heavy' },
19: { types:['shield','sniper','heavy','berserker','bomber'], fill:'heavy' },
};
const WAVE_ARCHETYPES = [
{ name:'swarm', minWave:1, types:['soldier','soldier','soldier','heavy'], fill:'soldier' },
{ name:'sniperNest', minWave:3, types:['sniper','sniper','soldier'], fill:'sniper' },
{ name:'eliteEscort', minWave:8, types:['elite','soldier','soldier','heavy'], fill:'soldier' },
{ name:'heavyAssault', minWave:6, types:['heavy','heavy','shield','berserker'], fill:'heavy' },
{ name:'fastChaos', minWave:5, types:['berserker','berserker','bomber','sniper'], fill:'berserker' },
{ name:'ghostHunt', minWave:21, types:['ghost','ghost','elite','soldier'], fill:'ghost' },
{ name:'juggernautLine', minWave:32, types:['juggernaut','heavy','heavy','shield'], fill:'heavy' },
{ name:'phantomAmbush', minWave:42, types:['phantom','phantom','ghost','elite'], fill:'phantom' },
];
function _archetypeAllowedHere(a){
if (a.name === 'sniperNest' && !window.__DIY_LOWEND_ALL_TYPES && ($core.isUltraLow || $core.isLowEndDesktop)) return false;
return true;
}
function _pickWaveArchetype(waveNum){
const eligible = WAVE_ARCHETYPES.filter(a=>waveNum>=a.minWave && _archetypeAllowedHere(a));
if(!eligible.length) return null;
return eligible[waveNum % eligible.length];
}
$mutators._waveTypeQueue = [];
const _TYPE_UNLOCK_WAVE = $enemies.unlockTable();   /* per-type unlockWave lives in js/engine/enemies/<type>.js */
function _gateType(t, waveNum){
return (waveNum > (_TYPE_UNLOCK_WAVE[t] ?? 0)) ? t : 'soldier';
}
function buildWaveQueue(waveNum, count){
const isBoot = $replay.currentLevel && $replay.currentLevel.isTutorialLevel;
if(isBoot) return;
const tpl = WAVE_TEMPLATES[waveNum] || _pickWaveArchetype(waveNum);
if(!tpl){ $mutators._waveTypeQueue=[]; return; }
const gatedFill = _gateType(tpl.fill, waveNum);
const q = tpl.types.map(t=>_gateType(t, waveNum));
while(q.length < count) q.push(gatedFill);
for(let i=q.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[q[i],q[j]]=[q[j],q[i]];
}
$mutators._waveTypeQueue = q;
}
function scheduleWaveSpawns(count, baseInterval){
let _spawnedSoFar = 0;
let _elapsedDelay = 0;
const _WAVE15_INTERVAL = 225;
const _maxBurst = count <= 3 ? 1 : ($buildings.wave > 15 ? Math.max(2, 4 - Math.floor(($buildings.wave-15)/8)) : 4);
const _minBurst = Math.min(2, _maxBurst);
const _breatherFloorMs = $buildings.wave > 15 ? _WAVE15_INTERVAL * 1.15 : 0;
while(_spawnedSoFar < count){
const _remaining = count - _spawnedSoFar;
const _burstSize = Math.min(_remaining, _minBurst + Math.floor(Math.random()*(_maxBurst-_minBurst+1)));
for(let _bi=0; _bi<_burstSize; _bi++){
scheduleSpawn(_elapsedDelay + _bi * Math.max(70, baseInterval*0.55));
}
_spawnedSoFar += _burstSize;
const _burstSpan = (_burstSize-1) * Math.max(70, baseInterval*0.55);
const _breather = Math.max(_breatherFloorMs, baseInterval * (1.15 + Math.random()*0.3));
_elapsedDelay += _burstSpan + _breather;
}
}
function scheduleSpawn(delay, forceType){
_gst(()=>{
if($buildings.state!=='playing') return;
if(!$buildings.isPaused){ $bosses.spawnFromBuilding(forceType); return; }
let retries=0;
const poll=_gsi(()=>{
if($buildings.state!=='playing'){ _gcsi(poll); return; }
if(!$buildings.isPaused){ _gcsi(poll); $bosses.spawnFromBuilding(forceType); return; }
if(++retries>120) _gcsi(poll);
},500);
}, delay);
}
function _graceTaper(w){
if (!$core.isMobile){
if (w <= 2) return 1.0;
if (w === 3) return 0.7;
if (w === 4) return 0.5;
if (w === 5) return 0.35;
if (w === 6) return 0.22;
if (w === 7) return 0.12;
if (w === 8) return 0.05;
return 0;
}
if (w <= 2) return 1.0;
if (w === 3) return 0.6;
if (w === 4) return 0.4;
if (w === 5) return 0.25;
if (w === 6) return 0.12;
if (w === 7) return 0.05;
return 0;
}
function nextWave(){
if($buildings.waveInProgress||$buildings.wavePending) return;
if(typeof buildNavField === 'function') { $psycho1._navLastPx=-9999; buildNavField(); }
if($buildings.isPaused){
const poll=_gsi(()=>{
if($buildings.state!=='playing'){ _gcsi(poll); return; }
if(!$buildings.isPaused){ _gcsi(poll); nextWave(); }
},300);
return;
}
const maxW = $replay.currentLevel ? $replay.currentLevel.maxWaves : 999;
if($replay.currentLevel && !$replay.currentLevel.isEndless && $buildings.wave >= maxW){
window.currentLevel=$replay.currentLevel;window.score=$buildings.score;window.wave=$buildings.wave;window.totalKills=$buildings.totalKills;
_gst(()=>{ if($buildings.state==='playing') window.showLevelComplete(); }, 400);
return;
}
clearBosses();
$buildings.wave++;$buildings.waveKills=0;$buildings.waveInProgress=true;$buildings.wavePending=false;
$buildings.wavePending=false;
const _lvlWave = Math.max(1, ($buildings.wave||0) - ($replay.waveOffset||0));
if($props._guidedWave && typeof $props.onGuidedWaveStart === 'function') $props.onGuidedWaveStart();
if($buildings.wave!==1 && window._ow) window._ow.active=false;
if($buildings.wave >= 9) _graceWaves = 0;
el('wave-num').textContent=$buildings.wave;
const _wc8 = document.getElementById('wave-chip');
if(_wc8) _wc8.textContent = $buildings.wave;
dcOnWaveStart();
if (typeof $profiler._markMinimapDirty === 'function') $profiler._markMinimapDirty();
dcOnWaveOrScore();
if($psycho2.playerUpgrades.shieldOnWave) $buildings.player.shield=300;
if(window.__perkOnWave) window.__perkOnWave();
const difficulty=$replay.currentLevel?$replay.currentLevel.difficulty:1;
const maxWaves=$replay.currentLevel?$replay.currentLevel.maxWaves:15;
if($buildings.wave%5===0&&$buildings.wave>0){
if($replay.currentLevel && $replay.currentLevel.isEndless){
const _envRotation=['jungle','desert','urban','night','arctic','spaceship','mars','warzone'];
const _envIdx=(Math.floor($buildings.wave/5)-1)%_envRotation.length;
const _nextEnv=_envRotation[((_envIdx%_envRotation.length)+_envRotation.length)%_envRotation.length];
if(_nextEnv!==$replay.currentEnv){
$replay.currentEnv=_nextEnv;
buildEnv(); try{ $buildings.prewarmGroundCache(); }catch(e){}
}
}
const envWeatherMap={
jungle:['rain','fog'],
desert:['sand','fog'],
urban:['rain','fog'],
arctic:['fog','rain'],
night:['fog','rain'],
spaceship:['fog','fog'],
mars:['sand','sand'],
warzone:['fog','rain']
};
const validWeathers=envWeatherMap[$replay.currentEnv]||['rain','fog'];
const weatherType=validWeathers[Math.floor(Math.random()*validWeathers.length)];
$buildings.weather=WEATHERS[weatherType];
$buildings.weatherTimer=30;
$replay.weatherInd.style.display='block';
$replay.weatherInd.textContent=$buildings.weather.name;
$replay.weatherInd.classList.remove('faded');
clearTimeout($replay.weatherInd._fadeTO);
$replay.weatherInd._fadeTO = setTimeout(()=>$replay.weatherInd.classList.add('faded'), 3500);
} else {
$buildings.weather=WEATHERS.clear;
$replay.weatherInd.style.display='none';
}
const isBoot = $replay.currentLevel && $replay.currentLevel.isTutorialLevel;
const _isForcedBossWave = !isBoot && $replay.currentLevel && $replay.currentLevel.bossSequence &&
$replay.currentLevel.maxWaves && $buildings.wave >= $replay.currentLevel.maxWaves && ($replay.currentLevel.maxWaves - ($replay.waveOffset||0)) < 5;
let _sigDef = null;
const _isBossRushWave = !isBoot && $replay.currentLevel && $replay.currentLevel.isBossRush;
const boss = isBoot ? false : (_isBossRushWave || _isForcedBossWave || (_lvlWave%5===0&&_lvlWave>0));
const _swarmMult = ($buildings._mutCfg&&$buildings._mutCfg.waveCountMult)||1;
const _classicEarlyGrace = (!$replay.currentLevel && $buildings.wave <= 3) ? Math.max(0.4, 1 - (3-$buildings.wave)*0.15) : 1;
const _graceMul = (_graceWaves > 0) ? (1 - 0.7 * _graceTaper($buildings.wave)) : 1.0;
const _midRangeCap = ($buildings.wave >= 7) ? 14 : 18;
const _isLowHw = $core.isUltraLow || (typeof $core.isLowEndDesktop !== 'undefined' && $core.isLowEndDesktop);
const _deviceSpawnCap = _isLowHw ? 12 : ($core.isMobile && (navigator.deviceMemory||4) <= 4) ? _midRangeCap : 50;
const _diffSwarmMul = ($buildings.settingDifficulty==='easy' ? 0.7 : $buildings.settingDifficulty==='hard' ? 1.15 : $buildings.settingDifficulty==='custom' ? $buildings.customDiff.spawn : 1.0) * $buildings._hardTune().spawn;
const _baseEnemies = Math.ceil((3+Math.pow($buildings.wave,1.3))*difficulty*_swarmMult*_classicEarlyGrace*_graceMul*_diffSwarmMul);
const enemyCount = isBoot ? ($buildings.wave===1?2:$buildings.wave===2?3:4)
  : Math.min(Math.ceil(_deviceSpawnCap * WAVE_ENEMY_MULT), Math.max(1, Math.ceil(_baseEnemies * WAVE_ENEMY_MULT) + WAVE_ENEMY_FLAT));
$buildings.waveTotal=boss?1:enemyCount;
if(boss){
audioManager.bossWarning();
$bosses.shake(4);
const isFinalWave = ($replay.currentLevel && $buildings.wave >= maxWaves);
const bossEncounter = _isBossRushWave ? ($buildings.wave - 1) : _isForcedBossWave ? 0 : Math.floor(_lvlWave / 5) - 1;
const defaultSequence = ['commander','cars','helicopter','tank','alien','jet'];
const sequence = ($replay.currentLevel && $replay.currentLevel.bossSequence) ? $replay.currentLevel.bossSequence : defaultSequence;
const seqIndex = ($replay.currentLevel && $replay.currentLevel.isEndless)
? bossEncounter % sequence.length
: Math.min(bossEncounter, sequence.length - 1);
const bossType = sequence[Math.max(0, seqIndex)] || 'commander';
_gst(()=>audioManager.playBossMusic(bossType), 800);
const isCommanderWave = bossType === 'commander';
const isCarWave = bossType === 'cars';
const isHeliWave = bossType === 'helicopter';
const isTankWave = bossType === 'tank';
const isAlienWave = bossType === 'alien';
const isJetWave = bossType === 'jet';
const isSpiderWave = bossType === 'spider';
const isHarmTugWave = bossType === 'harmtug';
const finalTag=isFinalWave?'<span class=\"wv-tag\">> FINAL BOSS — DEFEAT IT TO COMPLETE THE LEVEL</span>':'';
let bossText=isHarmTugWave?'<span style=\"color:#ff0066\">▸ HARM &amp; TUG — ROGUE PROTOCOL</span>':isJetWave?'<span style=\"color:#00aaff\">GHOST PROTOCOL &mdash; NEXUS FIGHTER JET</span>':isAlienWave?'<span style=\"color:#aa00ff\">THE ARCHITECT&#39;S EYE &mdash; ALIEN SCOUT</span>':isTankWave?'<span style=\"color:#ff6600\">THE IRON PACT &mdash; VRETH TANK</span>':isHeliWave?'<span style=\"color:#ff6600\">IRON VULTURE &mdash; NEXUS GUNSHIP</span>':isCarWave?'<span style=\"color:#ff8800\">NEXUS RAPID RESPONSE</span>':isSpiderWave?'<span style=\"color:#00ff88\">WIDOW MAKER &mdash; SPIDER TANK</span>':'<span style=\"color:#ff4400\">COMMANDER VOSS &mdash; THE BETRAYER</span>';
$bosses.announce('BOSS WAVE '+$buildings.wave+'<span class=\"wv-boss\">'+bossText+'</span>'+finalTag,'#ff4400','0 0 20px #ff2200');
const bossIntroLines = $bosses.BOSS_INTROS[bossType];
if(bossIntroLines){
const line = bossIntroLines[Math.floor(Math.random()*bossIntroLines.length)];
$bosses.showBossCutscene(bossType, 'intro', line);
_gst(()=>$bosses.radioChatter(line, '#ff6644', 5000), 500);
}
_gst($psycho2.spawnAlly, 1200);
_gst(()=>{
$bosses.shake(8);
$psycho2.killFlash('rgba(255,40,0,0.16)', 160);
$psycho2.vibrate([25,20,25]);
if(typeof $profiler.showIngameHint==='function') $profiler.showIngameHint('[ INCOMING ]', 1300, 2);
}, 2000);
const taunts = $bosses.BOSS_TAUNTS[bossType];
if(taunts){
const taunt = taunts[Math.floor(Math.random()*taunts.length)];
_gst(()=> addRadioChatter('' + taunt, '#ff6644', 5500), 2600);
}
function _bossArrivalPunch(){
$bosses.shake(18);
$psycho2.killFlash('rgba(255,50,0,0.24)', 180);
$psycho2.vibrate([30,25,45]);
$buildings._bossFightStartTick = $buildings.tick;
$buildings._bossFightMinHpPct = Math.max(0, $buildings.player.hp/$buildings.player.maxHp);
}
function scheduleBossSpawn(spawnFn, delay){
_gst(()=>{
let retries = 0;
function trySpawn(){
if($buildings.state!=='playing') return;
if($buildings.isPaused || $buildings.bossAlive || !$bosses.canSpawnBoss()){
retries++;
if(retries > 50){ clearBosses(); spawnFn(); _bossArrivalPunch(); }
else { _gst(trySpawn, 300); }
} else { spawnFn(); _bossArrivalPunch(); }
}
trySpawn();
}, delay);
}
if(isHarmTugWave){
scheduleBossSpawn($psycho2.spawnHarmTug, 3800);
} else if(isSpiderWave){
scheduleBossSpawn($psycho2.spawnSpiderTank, 3400);
} else if(isJetWave){
scheduleBossSpawn($legendary.spawnFighterJet, 3400);
} else if(isAlienWave){
scheduleBossSpawn($legendary.spawnAlienShip, 3400);
} else if(isTankWave){
scheduleBossSpawn(()=>$bosses.spawnBoss(true), 3400);
} else if(isHeliWave){
scheduleBossSpawn($psycho2.spawnHelicopter, 3400);
} else if(isCarWave){
scheduleBossSpawn(()=>{$legendary.spawnArmoredCar(-1);$legendary.spawnArmoredCar(1);}, 3400);
} else {
scheduleBossSpawn($bosses.spawnBoss, 3400);
}
} else {
audioManager.waveStart();
if(isBoot){
const bootBriefings = ['TRAINING EXERCISE — Move, aim, and fire.','GOOD WORK — Keep eliminating threats.','FINAL TEST — Show what you\'ve learned.'];
$bosses.announce('TRAINING WAVE '+$buildings.wave+'<span class=\"wv-sub\" style=\"color:#88cc44\">'+bootBriefings[$buildings.wave-1]+'</span>','#aaff00','0 0 20px #6bff00');
const bootStory = [
['Ghost: \"Nova City went dark three weeks ago. Alpha-7 was destroyed in the first hour.\"', '#88cc44', 5000],
['Ghost: \"NEXUS. Traitors. They sold Boloshie Land to an alien force called the Vreth.\"', '#ff8844', 5000],
['Ghost: \"I\'m the only one who made it out. No extraction. No backup. Radio jammed.\"', '#aaff00', 6000],
];
if($buildings.wave <= bootStory.length){
const [text, col, dur] = bootStory[$buildings.wave - 1];
_gst(()=> $bosses.radioChatter(text, col, dur), 1800);
}
if($buildings.wave===2 && typeof $profiler.showIngameHint==='function'){
_gst(()=>$profiler.showIngameHint($core.isMobile?'▪ TIP: Tap the grenade button to clear groups of enemies':'▪ TIP: Press G to throw a grenade and clear groups of enemies',5500,1), 3500);
}
for(let i=0;i<$buildings.waveTotal;i++) scheduleSpawn(i*1800);
} else if(!(_sigDef = $waves.pick($replay.currentLevel && $replay.currentLevel.id, _lvlWave, $replay.currentEnv, !!($replay.currentLevel && $replay.currentLevel.isEndless)))) {
const briefing = getWaveBriefing(_lvlWave);
$bosses.announce('WAVE '+$buildings.wave+'<span class=\"wv-sub\" style=\"color:#88cc44\">'+briefing+'</span>','#aaff00','0 0 20px #6bff00');
const briefLines = briefing.split('\n');
_gst(()=>$bosses.radioChatter(briefLines[0], '#88cc44', 4000), 400);
if(briefLines[1]) _gst(()=>$bosses.radioChatter(briefLines[1], '#5a9000', 4000), 1800);
if($buildings.wave===1){ _openingWaveStart(); } else {
buildWaveQueue(_lvlWave, $buildings.waveTotal);
const _isLowHwSpawn = $core.isUltraLow || (typeof $core.isLowEndDesktop !== 'undefined' && $core.isLowEndDesktop);
const _baseInterval = _isLowHwSpawn
? Math.max(350, 1200 - $buildings.wave * 25)
: ($core.isMobile && $buildings.wave >= 6)
? Math.max(160, 950 - $buildings.wave * 25)
: Math.max(130, 880 - $buildings.wave * 25);
scheduleWaveSpawns($buildings.waveTotal, _baseInterval);
}
} else {
$waves.start(_sigDef, _lvlWave, enemyCount);
}
}
}
function _openingWaveStart(){
window._ow={active:true,stinger:false};
const _addElite = !!window._diyFirstRunElite;
window._diyFirstRunElite = false;
$buildings.waveTotal = _addElite ? 4 : 3;
$mutators._waveTypeQueue=[];
scheduleSpawn(250); scheduleSpawn(480); scheduleSpawn(700);
if(_addElite) scheduleSpawn(1500, 'elite');
_gst(()=>{
if($buildings.state!=='playing') return;
$bosses.shake(4); $psycho2.killFlash('rgba(255,40,0,0.14)',140); $psycho2.vibrate([25,20,35]);
},250);
}
const LEVEL_INTROS = {
1: { title:'NOVA CITY — SECTOR 1', sub:'First contact. NEXUS patrols are light.\nThey think Boloshie Land is already theirs.' },
2: { title:'THE SALT FLATS', sub:'Open desert, blazing heat, no cover for a hundred yards.\nNEXUS armor is inbound — Rapid Response, they call it.' },
3: { title:'THE INDUSTRIAL QUARTER', sub:'Vreth drones active overhead.\nThe alien alliance is watching.' },
4: { title:'THE FROZEN LINE', sub:'Arctic wind, dug-in NEXUS armor.\nCold doesn\'t care who wins. Neither do you.' },
5: { title:'BLACKOUT RAID', sub:'No moon, no backup, first confirmed Vreth ground presence.\nGhost up. Let the dark do some of the work.' },
6: { title:'SPACE INFILTRATION', sub:'One unscheduled ship. No manifest, no escort.\nBoard it before it leaves orbit.' },
7: { title:'ORBITAL DEFENSE GRID', sub:'They\'ve taken the comms relay.\nCut it off and the alliance goes dark.' },
8: { title:'MARS FRONTLINE', sub:'NEXUS retreated off-world.\nThey still think distance means safety.' },
9: { title:'THE BURNING DISTRICT', sub:'Shelled towers, burning wrecks, nowhere safe to stand.\nNEXUS levelled it. Now they want what is left.' },
11: { title:'▸ ROGUE PROTOCOL', sub:'HARM & TUG — the AI they built to win the war.\nIt decided to win a different war instead.' },
};
const LEVEL_BRIEFINGS = {
9: {
1: "Artillery flattened this district. Fires still burning.\nWatch the rubble — they're using it as cover.",
5: "Smoke is thick. NEXUS can see the fires, you can't see them.\nStay out of the light.",
9: "Collapsed towers everywhere. Rooftop snipers likely.\nKeep moving.",
13: "Almost through the burning quarter.\nHold on a little longer."
},
1: {
1: "NEXUS patrol on Boloshie Street. First contact.\nThey don\'t know you\'re alive yet. Use that.",
2: "More of them. Someone reported contact.\nThey know someone\'s in the district.",
3: "Vreth drones active over the central grid.\nThe alliance is watching. Keep moving.",
4: "NEXUS reinforcements from the southern barracks.\nFormer Boloshie soldiers. Traitors.",
},
2: {
1: "Open desert, no cover for a hundred yards.\nNEXUS dug in early. They knew you were coming this way.",
2: "Heat\'s brutal out here. So is the patrol density.\nCommand says push east before dark.",
3: "Rapid Response convoy inbound — armored cars.\nDust trail gives them away long before they arrive.",
4: "Sand\'s soaked with fuel and worse.\nOne column down. This corridor\'s yours.",
6: "NEXUS Dispatch: \"Command, respond. Command, respond.\"\nStatic. Then nothing. Voss isn\'t picking up because Voss can\'t.",
7: "Convoy Lead: \"We\'re rolling regardless. Command or no command.\"\nBrave. Not smart, but brave.",
8: "Convoy Lead: \"Dust\'s giving us away for miles. Can\'t help that out here.\"\nNo, you really can\'t.",
9: "Convoy Lead: \"Contact in three hundred meters. Weapons hot.\"\nSame plan. Let\'s go.",
},
3: {
1: "Drone grid is live. Every movement logged.\nThe Vreth don\'t miss. Don\'t give them a clear shot.",
2: "NEXUS engineers setting up jamming arrays.\nTake them down before they cut your last frequency.",
3: "The factory complex is fortified. NEXUS dug in deep.\nSmoke them out.",
4: "Armored column moving through the outer gate.\nThis is their supply line. Break it.",
6: "Voss is gone. NEXUS is running blind through their own city.\nThat won\'t last — someone always steps up.",
7: "Rapid Response spotted rolling in from the docks.\nThey didn\'t wait long to send a replacement problem.",
8: "Street barricades favor them, not you.\nDoesn\'t matter. You\'ve been outnumbered all week.",
9: "Convoy\'s four blocks out and closing.\nLast chance to pick the street you fight them on.",
11: "Cars are scrap. NEXUS logistics just got a lot slower.\nSomeone upstairs is finally worried.",
12: "Vulture Pilot: \"Command wants eyes on the target. Command\'s not the one flying this.\"\nFair point. Still not helping you.",
13: "Vulture Pilot: \"If Voss is really gone, why am I still doing this?\"\nGreat question. Ask it faster next time.",
14: "Co-Pilot: \"Because it\'s the job. Focus.\"\nCo-pilot\'s got more discipline than the boss did.",
},
4: {
1: "Frozen tundra. Visibility\'s bad, footing\'s worse.\nNEXUS built a line here they didn\'t expect anyone to reach.",
2: "Wind\'s picking up. So is their armor count.\nIron Vulture gunship confirmed on approach.",
3: "Ice fractures under the tank treads.\nThey\'re dug in deep. Dig them out.",
4: "This line was supposed to hold all winter.\nIt\'s not going to hold another hour.",
6: "Voss down. Cold doesn\'t care, and neither does what\'s coming next.\nNEXUS convoy already inbound from the supply depot.",
7: "Rapid Response cars fishtailing on the ice roads.\nWorse drivers, same guns. Still dangerous.",
8: "Convoy\'s slowing for the pass. That\'s your window.\nTake it before the road opens back up.",
9: "One ridge between you and the convoy now.\nWhatever\'s left of it isn\'t getting through.",
11: "Cars are wrecks in the snow. NEXUS supply line, cut.\nIron Vulture just got the order to compensate.",
12: "Gunship running low over the ridge line, hunting heat signatures.\nYours is the only one that shoots back.",
13: "Rotor wash kicking up a whiteout.\nUse it. The pilot can\'t see through it either.",
14: "Vulture\'s circling tighter. It knows you\'re close.\nSo do you.",
16: "Vulture down.\nTank inbound. Count on it.",
17: "Treads on ice. Getting louder.\nNo turning back from here.",
18: "Turret\'s live. Full traverse.\nStay off the open ground.",
19: "One ridge.\nThen it\'s just you and thirty tonnes of steel.",
},
5: {
1: "No moon tonight. Good — they can\'t see you either.\nFirst confirmed Vreth ground presence in this sector.",
2: "NEXUS running blackout protocols of their own.\nSomeone taught them that. Wonder who.",
3: "Echo-Prime signal spiking nearby.\nThe alien commander doesn\'t like losing sensors.",
4: "Sun\'s coming up in an hour.\nFinish this before the dark stops covering for you.",
6: "Voss down in the dark. NEXUS won\'t confirm it till sunrise.\nBy then it won\'t matter.",
7: "Rapid Response running without headlights. Smart of them.\nDoesn\'t help. You don\'t need to see them to hear them.",
8: "Convoy noise bouncing off the warehouse row.\nCloser than they think they are.",
9: "Last stretch before the convoy road goes dark for good.\nLet it.",
11: "Cars are burning. Light\'s not doing them any favors now.\nIron Vulture\'s coming to cover the retreat that isn\'t happening.",
12: "Gunship running blackout too. Doesn\'t matter — engine noise gives it away.\nFollow the sound.",
13: "Searchlight sweeping the rooftops. It hasn\'t found you.\nKeep it that way for one more minute.",
14: "Vulture\'s low on fuel, low on patience.\nBoth of those work in your favor.",
16: "Vulture\'s wreckage lighting up the block better than the moon does.\nIron Pact\'s rolling in to answer for it.",
17: "Tank running dark, engine idling in an alley somewhere close.\nThirty tonnes of steel is hard to hide, even at night.",
18: "Treads on gravel. It\'s close. Closer than the noise suggests.\nDon\'t wait for headlights to confirm it.",
19: "One more block before the tank\'s dug in for good.\nMake it there first.",
21: "Tank\'s a smoking ruin. Even NEXUS can\'t spin that as a win.\nEcho-Prime\'s signal just got a lot louder.",
22: "Vreth ground presence confirmed, moving under cover of dark.\nThey don\'t need light. They were built for this.",
23: "Sensor drones sweeping in patterns too even to be human.\nBreak the pattern before it finds you.",
24: "The Architect\'s Eye is close now. It doesn\'t blink.\nMake it.",
},
6: {
1: "Off the map. NEXUS supply records show this base doesn\'t exist.\nThe Vreth aren\'t subtle. They just don\'t care.",
2: "Echo-Prime is coordinating from somewhere in this sector.\nThe alien commander. Take its toys away first.",
3: "Vreth shock troops. Faster than NEXUS. Smarter.\nAim for the red sensor eyes.",
4: "They\'re not defending. They\'re buying time for extraction.\nDon\'t let them leave.",
6: "Voss\'s people didn\'t know their commander was already dead.\nThey\'re about to find out the hard way.",
7: "NEXUS deployed ground vehicles into the cargo bay. On a spaceship.\nSomeone\'s improvising badly.",
8: "Rapid Response cars boxed in on the hangar deck, no room to maneuver.\nThat\'s their problem now, not yours.",
9: "One bulkhead between you and the vehicle bay.\nOpen it.",
11: "Cars are wreckage bolted to a hangar floor that wasn\'t built for this.\nIron Vulture\'s launching from the flight deck to compensate.",
12: "Gunship running interior corridors it was never designed for.\nClumsy. Loud. Still dangerous.",
13: "Rotor wash in a pressurized corridor is doing structural damage neither of you wanted.\nFinish it before the hull does.",
14: "One hatch from the flight deck.\nThe Vulture doesn\'t know it\'s already grounded.",
16: "Vulture\'s a wreck jammed in the launch bay.\nIron Pact\'s rolling something heavier down from the lower decks.",
17: "Tank treads on a metal deck built for foot traffic, not thirty tonnes.\nThe ship\'s groaning. So will they.",
18: "Turret\'s locked onto the corridor junction ahead.\nFind another way in, or don\'t.",
19: "One deck between you and the tank\'s chokepoint.\nMake it count.",
21: "SHIP AI: \"Structural breach detected, deck twelve.\"\nThat\'s the tank. Was the tank.",
22: "SHIP AI: \"Unidentified signal, deck nine. Signature: non-terrestrial.\"\nThat one\'s not going to introduce itself nicely.",
23: "SHIP AI: \"Multiple contacts converging on your position.\"\nThanks for the update. Little late.",
24: "SHIP AI: \"Warning: hostile command signature approaching.\"\nThat\'s the Eye. Get ready.",
26: "Echo-Prime\'s dark. That\'s their command gone.\nGhost Protocol just came online to replace it.",
27: "NEXUS fighter jet powering up in a bay that shouldn\'t fit one.\nThey built it for exactly this ship.",
28: "Engine whine building somewhere aft. Getting louder.\nIt knows you\'re aboard.",
29: "One corridor from the launch bay.\nThat jet was built to be your replacement. It\'s not getting the job.",
},
7: {
1: "The comms relay is hardwired into the orbital grid.\nDestroy the uplinks and the alliance loses coordination globally.",
2: "Vreth automated defences online.\nNo soldiers — the station is fighting you by itself.",
3: "Security protocol escalating.\nThe AI running this place has locked every door. Find another way.",
4: "Final uplink tower. One charge. Make it count.",
6: "Relay\'s down. NEXUS still thinks command\'s listening.\nIt isn\'t, not anymore.",
7: "Rapid Response deployed to the station\'s lower ring, out of options.\nThey\'re defending a relay that\'s already dead.",
8: "Vehicle bay two decks down, sealed but not secured.\nFind the seam.",
9: "One airlock from the vehicle bay.\nThey\'ve got nowhere left to retreat to.",
11: "Cars are wreckage in a bay with no air to burn in.\nIron Vulture\'s launching from the station\'s outer ring.",
12: "Gunship running station-side patrols, orbit-trained pilot.\nStill just a pilot.",
13: "Docking clamp release in sixty seconds whether you\'re ready or not.\nBe ready.",
14: "One ring section before the flight deck.\nThe Vulture\'s out of station to retreat to.",
16: "Vulture\'s a debris field now, tracked by station sensors that don\'t care.\nIron Pact\'s rolling something heavier through the cargo ring.",
17: "Tank treads on a deck plated for zero-g cargo, not this.\nThe station\'s not built for a tank fight. Neither are you, technically.",
18: "Structural alarms are the tank\'s fault, not yours.\nKeep it that way.",
19: "One bulkhead from the tank\'s chokepoint.\nDon\'t let the station take the blame for what happens next.",
21: "Tank\'s scrap in a corridor that\'s venting atmosphere it shouldn\'t be.\nEcho-Prime\'s own sensors just went active station-wide.",
22: "The Architect\'s Eye is watching through every camera on this ring.\nThere\'s nowhere on this station it can\'t see.",
23: "Drone swarm moving in the pattern the Eye prefers.\nBreak formation before it adjusts.",
24: "One junction from the Eye itself.\nIt\'s been counting kills. So have you.",
26: "Echo-Prime\'s offline. Station security just lost its brain.\nGhost Protocol\'s spinning up to fill the gap.",
27: "Fighter jet running impossible maneuvers in a hull built for cargo, not dogfights.\nIt\'s still going to try.",
28: "Engine noise building in the flight ring.\nWhoever\'s flying that thing trained for exactly this.",
29: "One deck from the launch bay.\nGhost Protocol. They named it that before they\'d met the real one.",
31: "Station log, unlisted user: \"They\'re calling it Widow Maker. I helped build the legs.\"\nWish you\'d mentioned that before I boarded.",
32: "Same log: \"It\'s not supposed to be loose. If you\'re reading this, it\'s loose.\"\nNoted. Too late, but noted.",
33: "Same log: \"Aim for the sensor cluster under the second joint.\"\nFinally, something useful.",
34: "Log ends there. Whoever wrote it isn\'t around to ask more.\nGuess I\'m improvising the rest.",
},
8: {
1: "Mars. They thought the distance would save them.\nThey were wrong. So was the Vreth survey team that found this place.",
2: "Dust storm rolling in. Visibility near zero.\nNEXUS thinks that helps them.",
3: "NEXUS command bunker three clicks east.\nMars has been their backup plan all along. Not anymore.",
4: "Vreth war machines stationed on the surface.\nDesigned for a different world. Still lethal.",
6: "Tank\'s a crater now. Even Mars can\'t hide that.\nEcho-Prime\'s survey team is finally taking this seriously.",
7: "The Architect\'s Eye active over the ridge line, watching the wreckage.\nIt doesn\'t like losing hardware this far from home.",
8: "Dust storm\'s covering your approach. Won\'t cover it for long.\nMove before the wind changes its mind.",
9: "One dune between you and the Eye\'s position.\nCross it before visibility clears.",
11: "Eye\'s dark. Whatever the Vreth were watching from Mars, they\'re not anymore.\nNEXUS scrambled a jet off the last working runway.",
12: "Ghost Protocol running low over the red rock, hunting a signal that\'s you.\nThey built it here specifically. Should\'ve built it better.",
13: "Engine whine cutting through the storm static.\nIt\'s close. Closer than the dust lets you see.",
14: "One ridge before the runway.\nThat jet\'s the last thing standing between NEXUS and total silence on this planet.",
16: "Jet\'s wreckage cooling in the dust already.\nVoss himself just landed to handle this personally.",
17: "Commander\'s convoy crossing the flats, dust trail visible for miles.\nHe came all this way to lose in person.",
18: "Bunker door\'s open. He\'s inside, still giving orders nobody\'s receiving.\nGo end the meeting.",
19: "One corridor from the command bunker.\nVoss came to Mars thinking distance was still worth something.",
21: "Voss is done. For real this time, no backup planet left to run to.\nIron Vulture\'s launching from the last working hangar anyway.",
22: "Gunship running patrols over a base with no commander left to report to.\nStill armed. Still a problem.",
23: "Storm\'s clearing enough to see the hangar ridge.\nTake the shot while you can see it.",
24: "One dune from the hangar.\nThis is the last aircraft NEXUS has on this rock.",
26: "Vulture\'s grounded for good. NEXUS air power on Mars is finished.\nEcho-Prime\'s sending a second Eye — they always have another.",
27: "New Architect\'s Eye active near the survey site.\nSame Vreth arrogance. Same blind spot.",
28: "Dust storm rolling back in, thicker this time.\nGood. Let it hide you instead of them for once.",
29: "One ridge from the survey site.\nSecond Eye, same ending as the first.",
31: "Eye\'s dark again. Vreth command out here is running out of options.\nGhost Protocol\'s spinning up a second jet from spare parts.",
32: "Second jet running the same patrol pattern as the first.\nWhoever\'s flying it should\'ve studied harder.",
33: "Engine noise closing over the last dune line.\nSame sound as before. Same result, most likely.",
34: "One ridge from the airstrip.\nLast aircraft NEXUS has left anywhere.",
36: "Second jet down. That\'s two air wings gone in one afternoon.\nHonestly didn\'t think I had that in me either.",
37: "One tank left in the whole NEXUS arsenal. Funny where this ended up.\nStarted with one soldier. Might end the same way.",
38: "Storm\'s clearing. No more hiding for either of us.\nDidn\'t expect to still be standing here, if I\'m being honest.",
39: "Last tank NEXUS has anywhere on this rock.\nAfter Alpha-7, I stopped expecting to make it this far.",
},
11: {
1: "HARM & TUG. Built from Boloshie defence contracts.\nSix legs. Human soul. It remembers who it was.",
},
};
const BOSS_REACTIONS = {
commander: [
"Voss is down. That\'s the head. The body hasn\'t figured it out yet.",
"One less traitor. Boloshie Land will remember his name. I won\'t.",
"He had the city. He had the soldiers. Still wasn\'t enough. Never is.",
"Command structure\'s broken. NEXUS doesn\'t know who to call.",
"Voss. You sold us out for a title. Hope it was worth it.",
"Alpha-7 didn\'t get a trial. You don\'t get one either.",
],
helicopter: [
"Iron Vulture down. They owned the sky for about six minutes.",
"Gunship wreckage. That\'s their air cover gone. Now they fight my fight.",
"Pilot\'s crew trained hard. So did I. One of us had more reasons.",
"The rotor\'s still spinning. Force of habit.",
],
cars: [
"Rapid Response. They named it that. I timed it — not that rapid.",
"Two cars down. NEXUS logistics is going to have a bad morning.",
"They sent vehicles. I had a gun and a reason. Came out even.",
"The radio chatter just stopped. They don\'t like reporting losses.",
],
tank: [
"Their armour\'s burning. Good. Let NEXUS watch it from wherever they\'re hiding.",
"The Iron Pact\'s broken. Just like everything they promised Boloshie Land.",
"Thirty tonnes of steel. Stopped by one soldier. Don\'t tell me odds matter.",
"Tank crew fought hard. Wrong side of history, but they fought hard.",
"Bakari didn\'t want this fight. Doesn\'t change what I had to do about it.",
],
alien: [
"Echo-Prime called us inefficient. The wreckage disagrees.",
"The Architect\'s Eye is dark. Whatever they were watching — they\'re not watching now.",
"Vreth don\'t negotiate. Neither do I. Turns out we had that in common.",
"An alien warship. Six months ago I was filing reports. Things change.",
"You didn\'t invade. Voss let you in the front door. Ask him how that worked out.",
],
jet: [
"Ghost Protocol offline. They named it Ghost. That was my name first.",
"Their jet is scrap. Whatever it cost to build, it wasn\'t enough.",
"We were built the same, it said. Then it missed. I didn\'t.",
"NEXUS loses its last air asset. From here it\'s a ground fight. My ground.",
],
spider: [
"Widow Maker is dead. They\'re running out of machines. Good.",
"Eight legs. One purpose. Still not enough purpose.",
"The spider\'s legs don\'t twitch anymore. Boloshie Land gets quieter every fight.",
"They built that thing to hunt. I was built for this. We were never going to agree.",
],
harmtug: [
"HARM & TUG. You were a weapon they aimed wrong. I\'m sorry for what they made you.",
"I don\'t know if you felt anything at the end. I hope you didn\'t. I hope you did.",
"They built you to win the war. You decided to fight a different one. I understand that.",
],
};
const BOSS_REACTIONS_2 = {
commander: [
"NEXUS will promote someone. There\'s always someone.",
"City\'s still standing. That\'s what matters.",
],
alien: [
"The Vreth will send another. I\'ll be ready.",
"Whatever comes next — not today.",
],
harmtug: [
"Someone programmed that thing to feel something. That person should think about what they did.",
],
tank: [
"Wonder if Bakari had a family. Everyone does. That\'s the whole problem with this war.",
],
jet: [
"Ghost Protocol. Whoever named it that — I\'m taking it back.",
],
};
const BOSS_REACTIONS_STRUGGLE = {
commander: ["That one nearly had me. Voss almost got the win he wanted."],
cars: ["Closer than it should\'ve been. Rapid Response earned that name today."],
helicopter: ["Ears still ringing. That gunship almost finished the job."],
tank: ["Thirty tonnes and it nearly worked. Next time I don\'t let it get that close."],
alien: ["The Architect\'s Eye nearly closed the file on me. Nearly."],
jet: ["It clipped me twice. I\'m still standing. Barely counts, but it counts."],
spider: ["Eight legs, one very close call. Widow Maker earned its name."],
harmtug: ["That one almost took me with it. I don\'t think it would\'ve minded."],
};
const BOSS_REACTIONS_DOMINANT = {
commander: ["Voss barely got a shot off. Some threats are mostly reputation."],
cars: ["Didn\'t even need to reload. Rapid Response wasn\'t, really."],
helicopter: ["Iron Vulture never got a clean angle on me. Amateur hour."],
tank: ["Thirty tonnes of steel and it never touched me. Big and slow loses every time."],
alien: ["The Architect\'s Eye never adjusted fast enough. Efficient, they said. Sure."],
jet: ["Ghost Protocol. Built to match me. Didn\'t come close."],
spider: ["Eight legs and it still couldn\'t land a hit. Widow Maker\'s overrated."],
harmtug: ["Didn\'t need to get hurt for that one. Small mercy, I guess."],
};
const KILL_WHISPERS_POOL = {
10: ["Ten down. They still think this is containable.",
"Ten. Each one was a choice. So was mine.",
"Ten kills. NEXUS dispatch is probably calling this \'a disturbance\'."],
25: ["Twenty-five. Voss is going to hear about this.",
"Twenty-five down. Whatever they told themselves about invading — I\'m the correction.",
"Still counting. They should stop sending people."],
50: ["Fifty. Boloshie Land remembers every name.",
"Fifty. I remember Alpha-7. I remember all of them.",
"Fifty down. NEXUS isn\'t winning this. They just don\'t know it yet."],
75: ["Seventy-five. There\'s no version of this where they win.",
"Seventy-five. I\'m not tired. That should worry them.",
"They keep coming. I keep being here. Math\'s not on their side.",
"My daughter thinks I\'m on a training exercise. Seventy-five. Let\'s keep it that way."],
100: ["One hundred. Ghost Reyes. Still standing.",
"A hundred kills in a city I was supposed to have died in. Interesting day.",
"One hundred. The city is watching. I\'m not going to let it down.",
"One hundred. Torres, Kwan, Okafor — Alpha-7 didn\'t get this far. I\'m carrying it for them."],
};
const KILL_WHISPERS = Object.fromEntries(
Object.entries(KILL_WHISPERS_POOL).map(([k,v])=>[k, v[Math.floor(Math.random()*v.length)]])
);
const _whisperedKills = new Set();
function showLevelIntroCard(levelId, onDone){
const intro = LEVEL_INTROS[levelId];
if(!intro){ onDone(); return; }
const card = document.createElement('div');
card.style.cssText = [
'position:fixed;inset:0;z-index:90;display:flex;flex-direction:column',
'align-items:center;justify-content:center;background:rgba(0,0,0,0.88)',
'pointer-events:none;opacity:0;transition:opacity 0.5s;'
].join(';');
card.innerHTML = `
<div style="font-family:'Black Ops One',sans-serif;font-size:clamp(13px,3.5vw,22px);color:#aaff00;letter-spacing:4px;text-shadow:0 0 20px #aaff00;text-align:center;margin-bottom:12px;">${intro.title}</div>
<div style="width:60px;height:1px;background:linear-gradient(90deg,transparent,#aaff00,transparent);margin:0 auto 14px;"></div>
<div style="font-family:'Share Tech Mono',monospace;font-size:clamp(9px,2vw,12px);color:#4a7000;letter-spacing:2px;text-align:center;line-height:1.9;white-space:pre-line;max-width:420px;padding:0 20px;">${intro.sub}</div>
`;
document.body.appendChild(card);
requestAnimationFrame(()=>{ card.style.opacity='1'; });
setTimeout(()=>{
card.style.opacity='0';
setTimeout(()=>{ card.remove(); onDone(); }, 520);
}, 3200);
}
function getLevelBriefing(levelId, waveNum){
const levelSet = LEVEL_BRIEFINGS[levelId];
if(levelSet){
const keys = Object.keys(levelSet).map(Number).filter(k=>k<=waveNum).sort((a,b)=>b-a);
if(keys.length) return levelSet[keys[0]];
}
const GENERIC = [
"NEXUS forces advancing through the district. Hold the line.",
"Multiple contacts. They know the terrain — so do you.",
"Vreth drones coordinating NEXUS ground units. Watch the rooftops.",
"Resistance fighters still holding the east quarter. Don\'t let them down.",
"NEXUS reinforcements inbound. They\'re not retreating yet.",
"The city is watching. Every block you hold matters.",
];
return GENERIC[(waveNum-1)%GENERIC.length];
}
function getWaveBriefing(waveNum){
if(!$replay.currentLevel) return getLevelBriefing(null, waveNum);
return getLevelBriefing($replay.currentLevel.id, waveNum);
}
function onBossDefeated(bossType){
$replay._freezeFrames = Math.max($replay._freezeFrames, 18);
$buildings._zoom = Math.max($buildings._zoom||0, 0.12); $buildings._zoomFx = null; $buildings._zoomFy = null;
$bosses._hitScreenDesaturate(220);
if($buildings._bossTypesThisRun.length===1 && $buildings._firstBossSpawnTick!==null && ($buildings.tick-$buildings._firstBossSpawnTick) < 1800){
_gst(()=>{ $bosses.radioChatter('Ghost: \"The Vreth are pulling back — push them!\"', '#88cc44', 4500); }, 300);
}
const _struggled = $buildings._bossFightMinHpPct <= 0.25;
const _dominant = $buildings._bossFightMinHpPct >= 0.9;
const _perfPool = _struggled ? BOSS_REACTIONS_STRUGGLE[bossType] : _dominant ? BOSS_REACTIONS_DOMINANT[bossType] : null;
const lines = (_perfPool && _perfPool.length) ? _perfPool : BOSS_REACTIONS[bossType];
if(!lines) return;
const line = lines[Math.floor(Math.random()*lines.length)];
$bosses.showBossCutscene(bossType, 'defeat', 'Ghost: \"' + line + '\"');
_gst(()=>{
$bosses.radioChatter('Ghost: \"' + line + '\"', '#aaff00', 5500);
}, 800);
const lines2 = BOSS_REACTIONS_2[bossType];
if(lines2){
const line2 = lines2[Math.floor(Math.random()*lines2.length)];
_gst(()=>{
$bosses.radioChatter('Ghost: \"' + line2 + '\"', '#7aaa00', 5000);
}, 4800);
}
}
function checkKillWhispers(){
for(const [threshold, line] of Object.entries(KILL_WHISPERS)){
const t = Number(threshold);
if($buildings.totalKills >= t && !_whisperedKills.has(t)){
_whisperedKills.add(t);
$profiler.showIngameHint('[ GHOST ] ' + line, 5500, 1);
break;
}
}
}
const WAVE_BRIEFINGS = {};
function addRadioChatter(text, col='#88cc44', duration=4500){
const feed = el('kill-feed');
if(!feed) return;
const div = document.createElement('div');
div.className = 'kf-entry';
div.style.cssText = `border-left-color:${col};color:${col};font-size:clamp(7px,1.8vw,9px);letter-spacing:1px;background:linear-gradient(90deg,rgba(0,0,0,0.97),${col}18,rgba(0,0,0,0.85));border-left-width:3px;white-space:normal;max-width:100%;`;
div.textContent = text;
feed.appendChild(div);
const entries = feed.querySelectorAll('.kf-entry');
if(entries.length > 6) entries[0].remove();
requestAnimationFrame(()=> div.classList.add('show'));
setTimeout(()=>{
div.classList.remove('show');
setTimeout(()=> div.remove(), 320);
}, duration);
}
});