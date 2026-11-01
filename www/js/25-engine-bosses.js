window.__engine.files.push(function* bosses() {
const $bosses = window.__engine.bosses;
const $enemies = window.__engine.enemies;
const $buildings = window.__engine.buildings;
const $core = window.__engine.core;
const $legendary = window.__engine.legendary;
const $mutators = window.__engine.mutators;
const $profiler = window.__engine.profiler;
const $props = window.__engine.props;
const $psycho1 = window.__engine.psycho1;
const $psycho2 = window.__engine.psycho2;
const $replay = window.__engine.replay;
const { _markEnemiesDirty, _spawnMuzzleEffect, doorPos, el } = $buildings;
const { _graceTaper } = $mutators;
const { onBuilding } = $psycho1;
Object.assign($bosses, { _acquireParticle, _decayAllEnemyRecoil, _drainParticleQueue, _drawEnemyMuzzleFlashes, _hitScreenDesaturate, _ptclQPush, _registerNewEnemyBullets, _updateEnemyMuzzleFlashes, announce, canSpawnBoss, fire, ptcl, ptclBurst, ptclQ, radioChatter, shake, showBossCutscene, showCampaignEndingCutscene, showHarmTugRevealCutscene, showVrethRevealCutscene, spawnBoss, spawnFromBuilding, startReload, switchWep });
yield;

const BOSS_CUTSCENE_META = {
commander:  { title:'COMMANDER VOSS',        sub:'THE BETRAYER',        color:'#ff4400', effect:'scan'   },
cars:       { title:'NEXUS RAPID RESPONSE',  sub:'ARMORED INTERCEPT',   color:'#ff8800', effect:'scan'   },
helicopter: { title:'IRON VULTURE',          sub:'NEXUS GUNSHIP',       color:'#ff6600', effect:'scan'   },
jet:        { title:'GHOST PROTOCOL',        sub:'NEXUS FIGHTER JET',   color:'#00aaff', effect:'scan'   },
tank:       { title:'THE IRON PACT',         sub:'VRETH TANK',          color:'#ff6600', effect:'glitch' },
alien:      { title:'THE ARCHITECT&#39;S EYE', sub:'ALIEN SCOUT',        color:'#aa00ff', effect:'glitch' },
spider:     { title:'WIDOW MAKER',           sub:'SPIDER TANK',         color:'#00ff88', effect:'glitch' },
harmtug:    { title:'H.A.R.M. &amp; T.U.G.', sub:'ROGUE PROTOCOL',      color:'#ff0066', effect:'pulse'  },
};
let _bossCsStyleInjected = false;
function _ensureBossCutsceneStyle(){
if(_bossCsStyleInjected) return;
_bossCsStyleInjected = true;
const s = document.createElement('style');
s.textContent = `
.boss-cs{position:fixed;inset:0;z-index:150;display:flex;align-items:center;justify-content:center;
background:#000;opacity:0;transition:opacity 0.35s ease;pointer-events:auto;overflow:hidden;touch-action:manipulation;}
.boss-cs.show{opacity:1;}
.boss-cs-bg{position:absolute;inset:0;opacity:0.55;}
.boss-cs-inner{position:relative;z-index:2;text-align:center;padding:0 24px;max-width:520px;}
.boss-cs-eyebrow{font-family:'Share Tech Mono',monospace;font-size:clamp(9px,2.2vw,12px);letter-spacing:5px;color:#888;margin-bottom:10px;}
.boss-cs-title{font-family:'Black Ops One',sans-serif;font-size:clamp(20px,7vw,38px);letter-spacing:2px;line-height:1.25;margin-bottom:6px;}
.boss-cs-sub{font-family:'Share Tech Mono',monospace;font-size:clamp(10px,2.4vw,13px);letter-spacing:3px;opacity:0.85;margin-bottom:22px;}
.boss-cs-div{width:70px;height:2px;margin:0 auto 22px;}
.boss-cs-line{font-family:'Share Tech Mono',monospace;font-size:clamp(11px,2.8vw,15px);color:#ddd;letter-spacing:1px;line-height:1.8;white-space:pre-line;font-style:italic;}
.boss-cs-skip{position:absolute;bottom:22px;left:0;right:0;text-align:center;font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:2px;color:#555;}
.boss-cs-bg.fx-scan{background:repeating-linear-gradient(115deg,transparent 0 40px,var(--csc,#ff4400) 40px 41px,transparent 41px 90px);background-size:600px 600px;animation:bcsScan 2.6s linear infinite;filter:blur(0.5px);}
@keyframes bcsScan{from{background-position:0 0;}to{background-position:-600px 0;}}
.boss-cs-bg.fx-glitch{background:linear-gradient(180deg,var(--csc,#aa00ff) 0%,transparent 60%);mix-blend-mode:screen;animation:bcsGlitchFade 2.6s ease-in-out infinite;}
@keyframes bcsGlitchFade{0%,100%{opacity:0.15;}45%{opacity:0.5;}50%{opacity:0.1;transform:translateX(4px);}55%{opacity:0.45;transform:translateX(-3px);}60%{opacity:0.2;transform:translateX(0);}}
.boss-cs.fx-glitch-active .boss-cs-title{animation:bcsTitleGlitch 2.6s steps(1) infinite;}
@keyframes bcsTitleGlitch{0%,93%,100%{text-shadow:0 0 20px var(--csc,#aa00ff);}94%{text-shadow:2px 0 0 #0ff,-2px 0 0 #f0f;}96%{text-shadow:-2px 0 0 #0ff,2px 0 0 #f0f;}}
.boss-cs-bg.fx-pulse{background:radial-gradient(circle,var(--csc,#ff0066) 0%,transparent 2%);animation:bcsPulseRing 1.4s ease-out infinite;}
@keyframes bcsPulseRing{0%{background-size:0% 0%;opacity:0.9;}100%{background-size:220% 220%;opacity:0;}}
.boss-cs-bg.fx-signal{background:conic-gradient(from 0deg,var(--csc,#aaff00) 0deg 8deg,transparent 8deg 360deg);opacity:0.3;animation:bcsSignalSpin 4s linear infinite;}
@keyframes bcsSignalSpin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
`;
document.head.appendChild(s);
}
function _bcsRenderBeat(div, beat){
div.style.setProperty('--csc', beat.color || '#aaff00');
div.classList.toggle('fx-glitch-active', beat.effect === 'glitch');
div.innerHTML = `
<div class="boss-cs-bg fx-${beat.effect||'signal'}"></div>
<div class="boss-cs-inner">
${beat.eyebrow?`<div class="boss-cs-eyebrow" style="color:${beat.color}">${beat.eyebrow}</div>`:''}
${beat.title?`<div class="boss-cs-title" style="color:${beat.color};text-shadow:0 0 20px ${beat.color}">${beat.title}</div>`:''}
${beat.sub?`<div class="boss-cs-sub" style="color:${beat.color}">${beat.sub}</div>`:''}
<div class="boss-cs-div" style="background:linear-gradient(90deg,transparent,${beat.color||'#aaff00'},transparent)"></div>
${beat.line?`<div class="boss-cs-line">${beat.line}</div>`:''}
</div>
<div class="boss-cs-skip">TAP TO CONTINUE</div>
`;
}
function showNarrativeCutscene(beats, onDone){
_ensureBossCutsceneStyle();
if(!beats || !beats.length){ if(onDone) onDone(); return; }
const div = document.createElement('div');
div.className = 'boss-cs';
document.body.appendChild(div);
let idx = 0, advTimer = null, lastTs = 0;
function renderCurrent(){
_bcsRenderBeat(div, beats[idx]);
div.classList.remove('show');
requestAnimationFrame(()=> div.classList.add('show'));
clearTimeout(advTimer);
advTimer = setTimeout(guardedAdvance, beats[idx].duration || 3200);
}
function advance(){
clearTimeout(advTimer);
idx++;
if(idx >= beats.length){ finish(); return; }
renderCurrent();
}
function guardedAdvance(){
const now = Date.now();
if(now - lastTs < 400) return;
lastTs = now;
advance();
}
function finish(){
div.classList.remove('show');
setTimeout(()=> div.remove(), 350);
if(onDone) onDone();
}
div.addEventListener('click', guardedAdvance);
div.addEventListener('touchstart', (e)=>{ e.preventDefault(); guardedAdvance(); }, {passive:false});
renderCurrent();
}
function showVrethRevealCutscene(onDone){
showNarrativeCutscene([
{ eyebrow:'INTERCEPTED TRANSMISSION', title:'VRETH FORWARD BASE', sub:'NEXUS territory. Vreth chain of command.', color:'#aa00ff', effect:'glitch', duration:2600 },
{ color:"#ddffcc", line:"Ghost: &quot;NEXUS isn't running this war. I thought they were.&quot;", duration:3600 },
{ title:'THEY NEVER WERE', color:'#aa00ff', effect:'glitch', line:"Ghost: &quot;Voss doesn't take orders from a spreadsheet. He takes them from the Vreth. Always has.&quot;", duration:4200 },
], onDone);
}
function showHarmTugRevealCutscene(onDone){
showNarrativeCutscene([
{ eyebrow:'CLASSIFIED — NEXUS R&amp;D', title:'PROJECT: H.A.R.M. &amp; T.U.G.', sub:'AUTONOMOUS WAR AI', color:'#ff0066', effect:'pulse', duration:2600 },
{ color:"#ddffcc", line:"Ghost: &quot;Built to end the war fast. Nobody asked whose war it would end.&quot;", duration:3600 },
{ title:'ROGUE PROTOCOL', color:'#ff0066', effect:'pulse', line:"Ghost: &quot;It stopped taking orders a long time ago. Today it stops, period.&quot;", duration:4200 },
], onDone);
}
function showCampaignEndingCutscene(onDone){
showNarrativeCutscene([
{ eyebrow:'MISSION COMPLETE', title:'NOVA CITY IS LIBERATED', sub:'Boloshie Land stands.', color:'#aaff00', effect:'signal', duration:2800 },
{ color:"#ddffcc", line:"Ghost: &quot;Torres. Kwan. Okafor. Alpha-7 didn't make it home. I did. That's not the same as winning.&quot;", duration:4200 },
{ color:"#cccccc", line:"Ghost: &quot;My daughter still thinks I was on a training exercise. Let's keep it that way — for now.&quot;", duration:4200 },
{ eyebrow:'BUT', title:'THE ALLIANCE IS BROKEN', sub:"The Vreth aren't.", color:'#aa00ff', effect:'glitch', duration:3400 },
], onDone);
}
function showBossCutscene(bossType, phase, line){
_ensureBossCutsceneStyle();
const meta = BOSS_CUTSCENE_META[bossType];
if(!meta) return;
const div = document.createElement('div');
div.className = 'boss-cs' + (meta.effect==='glitch' ? ' fx-glitch-active' : '');
div.style.setProperty('--csc', meta.color);
const eyebrow = phase==='defeat' ? '&#9650; TARGET ELIMINATED' : '&#9650; BOSS ENCOUNTER';
div.innerHTML = `
<div class="boss-cs-bg fx-${meta.effect}"></div>
<div class="boss-cs-inner">
<div class="boss-cs-eyebrow" style="color:${meta.color}">${eyebrow}</div>
<div class="boss-cs-title" style="color:${meta.color};text-shadow:0 0 20px ${meta.color}">${meta.title}</div>
<div class="boss-cs-sub" style="color:${meta.color}">${meta.sub}</div>
<div class="boss-cs-div" style="background:linear-gradient(90deg,transparent,${meta.color},transparent)"></div>
<div class="boss-cs-line">${line || ''}</div>
</div>
<div class="boss-cs-skip">TAP TO SKIP</div>
`;
document.body.appendChild(div);
requestAnimationFrame(()=> div.classList.add('show'));
let _bcsDone = false;
function _bcsDismiss(){
if(_bcsDone) return;
_bcsDone = true;
div.classList.remove('show');
setTimeout(()=> div.remove(), 350);
}
div.addEventListener('click', _bcsDismiss, {once:true});
div.addEventListener('touchstart', _bcsDismiss, {once:true, passive:true});
setTimeout(_bcsDismiss, phase==='defeat' ? 2200 : 2500);
}
const BOSS_TAUNTS = {
commander: ["Voss: \"You think you can take my city?\"", "Voss: \"Boloshie Land belongs to NEXUS now.\"", "Voss: \"You\'d have signed too, Reyes. Everyone has a price. Mine just got paid.\""],
helicopter: ["Iron Vulture: \"You can\'t run. I own the sky.\"", "Pilot: \"Gunship inbound. No extraction for you.\""],
cars: ["NEXUS Dispatch: \"Rapid Response deployed. Intercept and eliminate.\""],
tank: ["Iron Pact: \"The tank has never lost a city. It won\'t start today.\"", "Tank Crew: \"Sergeant Bakari didn\'t want this fight either. Orders are orders.\""],
alien: ["Echo-Prime: \"Your species is inefficient. Step aside.\"", "Echo-Prime: \"The Vreth do not negotiate.\"", "Echo-Prime: \"NEXUS offered cities for technology. A fair trade. You are the rounding error.\""],
jet: ["Ghost Protocol: \"Weapons hot. Target acquired.\""],
spider: ["Widow Maker: \"Eight legs. One purpose. You.\""],
harmtug: ["H.A.R.M: \"I remember who I was. That\'s why I have to do this.\""],
}; ;$bosses.BOSS_TAUNTS = BOSS_TAUNTS;
function announce(html,col,shadow){
$replay.waveAnn.innerHTML=html;$replay.waveAnn.style.color=col;$replay.waveAnn.style.textShadow=shadow;
$replay.waveAnn.style.opacity='1';setTimeout(()=>$replay.waveAnn.style.opacity='0',2400);
}
function radioChatter(text, col='#88cc44', duration=4200){
const feed = el('kill-feed');
if(!feed) return;
const div = document.createElement('div');
div.className = 'kf-entry';
div.style.borderColor = col;
div.style.color = col;
div.style.background = `linear-gradient(90deg,rgba(0,0,0,0.95),${col}18,rgba(0,0,0,0.85))`;
div.style.fontSize = 'clamp(10px,2.6vw,13px)';
div.style.letterSpacing = '1px';
div.style.maxWidth = '200px';
div.style.whiteSpace = 'normal';
div.style.lineHeight = '1.4';
div.innerHTML = '' + text;
feed.appendChild(div);
requestAnimationFrame(()=>div.classList.add('show'));
setTimeout(()=>{
div.classList.remove('show');
setTimeout(()=>div.remove(), 320);
}, duration);
}
const BOSS_INTROS = {
commander: ["Voss: \'Boloshie Land belongs to NEXUS now. Surrender.\'", "Voss: \'You should have died with Alpha-7.\'", "Voss: \'I didn\'t sell soldiers, Reyes. I sold a spreadsheet. You\'re the only one who still thinks it was personal.\'"],
helicopter: ["Iron Vulture: \'Ground target acquired. Weapons hot.\'", "Vulture Pilot: \'No place to run, Ghost.\'"],
cars: ["NEXUS Dispatch: \'Rapid Response converging on your position.\'"],
tank: ["Iron Pact: \'The city will fall. So will you.\'", "Tank Crew: \'Armour rolling. Ghost is contained.\'", "Tank Crew: \'Bakari says end it quick. Says you don\'t deserve a slow one.\'"],
alien: ["Echo-Prime: \'...your species is... irrelevant.\'", "Echo-Prime: \'The Architect watches. You are data.\'"],
jet: ["Ghost Protocol AI: \'We were built the same. I\'m better.\'"],
spider: ["Widow Maker: \'Fourteen legs. One target.\'"],
harmtug: ["HARM: \'I remember who I was.\'", "TUG: \'We were soldiers. Now we choose.\'"],
}; ;$bosses.BOSS_INTROS = BOSS_INTROS;
/* spawn-table rows now live in js/engine/enemies/<type>.js (stats:{...}) and are collected by the registry */
const ENEMY_TYPES = $enemies.statsTable();
let _stressIdx=0;
function _stressNextType(){ const k=Object.keys(ENEMY_TYPES); return k[(_stressIdx++)%k.length]; }
function spawnFromBuilding(forceType){
let dp, b=null;
if($psycho1.buildings.length>0){
b=$psycho1.buildings[Math.floor(Math.random()*$psycho1.buildings.length)];
dp=doorPos(b);
b.spawnFlash=1.0;
} else {
const _edge=Math.floor(Math.random()*4);
dp = _edge===0?{x:Math.random()*$replay.W,y:-22}
: _edge===1?{x:Math.random()*$replay.W,y:$replay.H+22}
: _edge===2?{x:-22,y:Math.random()*$replay.H}
: {x:$replay.W+22,y:Math.random()*$replay.H};
}
const _spawnPtclCount = $core.isUltraLow ? 0 : $core.isMobile ? 2 : 6;
for(let i=0;i<_spawnPtclCount;i++) ptcl(dp.x,dp.y,'#ff3300',1,2);
const r=Math.random();
const isBoot = $replay.currentLevel && $replay.currentLevel.isTutorialLevel;
const _queuedType = (!isBoot && !forceType && $mutators._waveTypeQueue.length > 0) ? $mutators._waveTypeQueue.shift() : null;
const _heavyThreshDesktop = $buildings.wave>1 ? Math.min(0.52, 0.16 + ($buildings.wave-2)*0.12) : 0;
const _heavyThreshMobile = $buildings.wave>1 ? Math.min(0.38, 0.12 + ($buildings.wave-2)*0.09) : 0;
const _allTypesLow = !!window.__DIY_LOWEND_ALL_TYPES && ($core.isUltraLow || $core.isVeryLow || $core.isLowEndDesktop);
const _rolledType = forceType ? forceType : _queuedType ? _queuedType
: (window.__DIY_STRESS && !isBoot) ? _stressNextType()
: isBoot ? 'soldier'
: ($core.isMobile && !_allTypesLow)
? ((r<0.04&&$buildings.wave>41)?'phantom':(r<0.07&&$buildings.wave>31)?'juggernaut':(r<0.10&&$buildings.wave>20)?'ghost':(r<0.16&&$buildings.wave>7)?'elite':(r<_heavyThreshMobile)?'heavy':'soldier')
: (r<0.03&&$buildings.wave>41)?'phantom':(r<0.06&&$buildings.wave>31)?'juggernaut':(r<0.10&&$buildings.wave>20)?'ghost':(r<0.14&&$buildings.wave>7)?'elite':(r<0.17&&$buildings.wave>5)?'bomber':(r<0.22&&$buildings.wave>4)?'berserker':(r<0.27&&$buildings.wave>5)?'shield':(r<0.36&&$buildings.wave>2)?'sniper':(r<_heavyThreshDesktop)?'heavy':'soldier';
const _LOW_TIER_ENEMY_REMAP = { ghost:'berserker', phantom:'berserker', juggernaut:'heavy', elite:'heavy', shield:'heavy' };
const _isLowTierDevice = !window.__DIY_STRESS && !_allTypesLow && ($core.isUltraLow || $core.isVeryLow || $core.isLowEndDesktop);
const _snipersDisabledHere = !window.__DIY_STRESS && !_allTypesLow && ($core.isUltraLow || $core.isLowEndDesktop);
const _preRemapType = (_isLowTierDevice && _LOW_TIER_ENEMY_REMAP[_rolledType]) ? _LOW_TIER_ENEMY_REMAP[_rolledType] : _rolledType;
const _type0 = (_snipersDisabledHere && _preRemapType === 'sniper') ? 'heavy' : _preRemapType;
const type = ($enemies.vrethRoll && $enemies.vrethRoll(_type0, forceType, isBoot)) || _type0;   /* Vreth aliens (js/engine/enemies/vreth.js) */
const _et = ENEMY_TYPES[type] || ENEMY_TYPES.soldier;
/* effective wave for stat scaling: Vreth aliens never scale below wave 27 */
const _sw = _et.scaleWaveMin ? Math.max($buildings.wave, _et.scaleWaveMin) : $buildings.wave;
const spd2 = isBoot ? 0.9 : _et.spd2;
const _diffBase=($replay.currentLevel?$replay.currentLevel.difficulty*0.6:1.0);
const diffMult=$buildings.settingDifficulty==='easy'?0.55:$buildings.settingDifficulty==='hard'?1.4:$buildings.settingDifficulty==='custom'?_diffBase*$buildings.customDiff.speed:_diffBase;
const scaling=$replay.currentLevel?$replay.currentLevel.enemyScaling:1.0;
const baseHp=_et.baseHp;
const _diffHpMod = ($buildings.settingDifficulty==='easy' ? 0.65 : $buildings.settingDifficulty==='hard' ? 1.3 : $buildings.settingDifficulty==='custom' ? $buildings.customDiff.hp : 1.0) * $buildings._hardTune().hp;
/* BALANCE v106: super-linear, uncapped HP curve (was wave^0.68 with HP_CAPS). Master dial = the 1.55 exponent. */
const _waveHpScale = (1 + Math.pow(_sw, 1.55) * 0.22) * _diffHpMod;
const _hpCapWave = Math.min(_sw, 40);
const HP_CAPS = Object.fromEntries(Object.entries(ENEMY_TYPES).map(([t,c])=>[t, c.hpCapFixed!==undefined ? c.hpCapFixed : Math.round((c.hpCapBase + _hpCapWave*c.hpCapMult) * 1.25)]));
const SPD_CAPS = Object.fromEntries(Object.entries(ENEMY_TYPES).map(([t,c])=>[t, c.spdCap]));
const _mc = $buildings._mutCfg ?? {hpMult:1, spdMult:1, enemyFireMult:1};
const _psLevel = (typeof $profiler.getPrestigeState === 'function') ? ($profiler.getPrestigeState().level || 0) : 0;
const _prestigeHpMult = Math.min(1.6, 1 + _psLevel * 0.08);
const rawHp=Math.ceil(baseHp*scaling*_waveHpScale*(_mc.hpMult||1)*_prestigeHpMult);
/* only types with a fixed cap (bomber) stay capped */
const _finalHp = (_et.hpCapFixed!==undefined) ? Math.min(rawHp,_et.hpCapFixed) : rawHp;
const rawSpd=(spd2+_sw*0.09)*Math.max(1,diffMult)*Math.max(1,scaling*0.5+0.5)*(_mc.spdMult||1)*(1 + Math.min(_sw, 40) * 0.006) * $buildings._hardTune().spd;
const baseSI = typeof _et.si==='function' ? _et.si(_sw) : (_et.si ?? Math.max(20,110-_sw*4));
const mutSI = Math.max(6, Math.floor(baseSI / ((_mc.enemyFireMult||1) * $buildings._hardTune().fire * (1 + Math.min(_sw, 40) * 0.035))));
const spawnPad = _et.spawnPad;
const spawnX = Math.max(spawnPad, Math.min($replay.W-spawnPad, dp.x));
const spawnY = Math.max(spawnPad, Math.min($replay.H-spawnPad, dp.y));
const _skin = ($replay.currentEnv==='mars' && (type==='soldier'||type==='heavy'||type==='sniper')) ? 'alien'
: ($replay.currentEnv==='arctic' && (type==='soldier'||type==='heavy') && Math.random()<0.45) ? 'arctic'
: null;
const _skinCol = _skin==='alien' ? (type==='heavy'?'#5a1a8c':type==='sniper'?'#0a6650':'#4a9c1a')
: _skin==='arctic' ? (type==='heavy'?'#2a6a80':'#8fd8e8')
: null;
$buildings.enemies.push({
x:spawnX,y:spawnY,type,skin:_skin,
w:_et.w,
h:_et.h,
hp:_finalHp,maxHp:_finalHp,
spd:Math.min(rawSpd,(SPD_CAPS[type]||4.5)*$buildings._hardTune().spd),
st:Math.floor(Math.random()*60),si:mutSI,
alive:true,boss:false,walkT:Math.random()*100,
col:_skinCol || _et.col,
bomber:type==='bomber',
vreth:!!_et.vreth,
_ghostCloak: type==='ghost' ? 1.0 : undefined,
_phantomTeleT: type==='phantom' ? 0 : undefined,
stuckTimer:0,stuckX:spawnX,stuckY:spawnY,
_laserCharge: type==='sniper' ? 0 : undefined
});
const e = $buildings.enemies[$buildings.enemies.length - 1];
if (_graceWaves > 0) {
const _gt = _graceTaper($buildings.wave);
if(!(window._ow && window._ow.active)) e.spd *= (1 - 0.4 * _gt);
e.si = Math.floor(e.si * (1 + 0.6 * _gt));
}
if(window._ow && window._ow.active && $buildings.wave===1){
e._rush=true;
e.spd = Math.min(e.spd*1.15, (SPD_CAPS[type]||4.5));
}
_markEnemiesDirty();
}
function canSpawnBoss(){
return !$buildings.bossAlive &&
!$buildings.enemies.some(e=>e.boss&&e.alive) &&
!($psycho2.helicopter&&$psycho2.helicopter.alive) &&
!($psycho2.alienShip&&$psycho2.alienShip.alive) &&
!($psycho2.fighterJet&&$psycho2.fighterJet.alive) &&
!($psycho2.spiderTank&&$psycho2.spiderTank.alive) &&
!($psycho2.harmTug&&$psycho2.harmTug.alive) &&
$psycho2.armoredCars.filter(c=>c.alive).length===0;
}
function spawnBoss(forceTank=false){
if($buildings.state!=='playing'||$buildings.isPaused||!canSpawnBoss())return;
const isTankBoss = forceTank;
const _bw=$buildings.wave;
const hp=isTankBoss ? Math.round((80+_bw*22+Math.pow(_bw,1.6)*4)*1.3) : Math.round(60+_bw*18+Math.pow(_bw,1.6)*3);
const bossW=isTankBoss?90:56;
const bossH=isTankBoss?50:64;
const bPad=bossW/2+8;
const _spawnPortrait = $replay.H > $replay.W;
let sx,sy,attempts=0;
do {
const edge = _spawnPortrait ? 0 : Math.floor(Math.random()*3);
sx=edge===1?-80:edge===2?$replay.W+80:$replay.W/2+(Math.random()-0.5)*$replay.W*0.4;
sy=edge===0?-80:$replay.H*0.1+Math.random()*$replay.H*0.8;
attempts++;
} while(onBuilding(sx,sy,bPad) && attempts<20);
if(onBuilding(sx,sy,bPad)){sx=$replay.W/2;sy=-80;}
$buildings.enemies.push({
x:sx,y:sy,type:isTankBoss?'tank':'boss',
w:bossW,h:bossH,
hp,maxHp:hp,spd:isTankBoss?0.8:1.3+$buildings.wave*0.05,st:0,si:isTankBoss?60:22,
alive:true,boss:true,col:isTankBoss?'#5a3a1a':'#4a0000',walkT:0,
turretAngle:0,isTank:isTankBoss,
stuckTimer:0,stuckX:sx,stuckY:sy
});
_markEnemiesDirty();
$buildings.bossAlive=true;$buildings._airstrikeGraceUntil=$buildings.tick+1200;$replay.bBarW.style.opacity='1';
if($buildings._firstBossSpawnTick===null) $buildings._firstBossSpawnTick=$buildings.tick;
el('boss-bar-label').textContent=isTankBoss?'WAVE '+$buildings.wave+' — THE IRON PACT':'WAVE '+$buildings.wave+' — VOSS: THE BETRAYER';
}
const WEP_VIBRATION = {
rifle: [12],
shotgun: [35],
smg: [6],
knife: [18, 10, 18],
minigun: [8],
rpg: [80, 20, 40],
flamethrower:[10],
};
function fireVibrate(wep){
if(!$core.isMobile || !$buildings.settingVibration) return;
const pat = WEP_VIBRATION[wep];
if(pat) $psycho2.vibrate(pat);
}
function fire(){
const w=$buildings.WEAPONS[$buildings.curWep];
const u=$buildings.wepUpgrades[$buildings.curWep];
if($buildings._mutCfg&&$buildings._mutCfg.knifeOnly && $buildings.curWep!='knife') return;
const _preFire_len = $buildings.bullets.length;
const reloadMult=Math.max(0.4,1-u.reload*0.2);
const _ocCdMult = $profiler._shopOverclock ? 0.70 : 1.0;
const _isGodFiring = $buildings.player.godModeTimer>0;
const _cdDiv = ($buildings.player.rapidTimer>0?2:1) * (_isGodFiring?1.6:1);
const cd=Math.max(2,Math.floor(w.cd*reloadMult*_ocCdMult/_cdDiv));
if($buildings.wepAmmo[$buildings.curWep]<=0&&!_isGodFiring||$buildings.player.sc>0||$buildings.reloading||$buildings.isPaused)return;
const base=Math.atan2($buildings.mouse.y-$buildings.player.y,$buildings.mouse.x-$buildings.player.x);
/* BALANCE v106: every damage multiplier is ADDED into one pool and the pool is capped at 3.0x; per-weapon upgrade damage is capped at +6. */
const _ud = Math.min(u.dmg, 6);
const _pool = function(){
  const B=$buildings, god=B.player.godModeTimer>0; let m=1;
  if(B.player.rapidTimer>0) m+=0.5;
  if(god) m+=0.6;
  if($replay.selectedChar==='sniper' && B.curWep==='rifle') m+=1.0;
  m += ((B._mutCfg&&B._mutCfg.dmgMult)||1)-1;
  if($profiler._shopOverclock) m-=0.2;
  if($profiler._shopGlassCannon) m+=0.4;
  if(B.settingDifficulty==='custom') m+=B.customDiff.dmg-1;
  return Math.max(0.25, Math.min(3.0, m));
};
const dmgMult = _pool();
const dmg=($buildings.curWep==='rifle'?2+_ud:1+_ud)*dmgMult;
if(w.wt==='knife'){
$buildings.bullets.push({x:$buildings.player.x,y:$buildings.player.y,vx:Math.cos(base)*w.spd,vy:Math.sin(base)*w.spd,own:'player',life:80,wt:'knife',ang:base,spin:0,stuck:false,sl:0,dmg:3+_ud*2,sz:0});
ptcl($buildings.player.x,$buildings.player.y,'#c8d8ff',3,2);
_spawnMuzzleEffect($buildings.player.x+Math.cos(base)*18,$buildings.player.y+Math.sin(base)*18,base,'knife','#c8d8ff');
shake(1);
$buildings.player.recoilOffset=Math.min(10,($buildings.player.recoilOffset||0)+2.5);
audioManager.fire('knife'); fireVibrate('knife');
} else if(w.wt==='flame'){
const _phHeavenFlame = $buildings._mutCfg && $buildings._mutCfg.playerBulletHeaven;
const base2=Math.atan2($buildings.mouse.y-$buildings.player.y,$buildings.mouse.x-$buildings.player.x);
const _flameCount = _phHeavenFlame ? 18 : 3;
const _flameSpread = w.spread * (_phHeavenFlame ? 3.2 : 1);
for(let p=0;p<_flameCount;p++){
const a=base2+(Math.random()-0.5)*_flameSpread;
const spd=w.spd*(0.6+Math.random()*0.7);
const life=Math.floor(w.range/w.spd*(0.7+Math.random()*0.5));
const _flameDmg=(1.4+_ud*0.3)*($buildings.player.rapidTimer>0?1.5:1)*(_phHeavenFlame?0.4:1);
$buildings.bullets.push({x:$buildings.player.x+Math.cos(base2)*14,y:$buildings.player.y+Math.sin(base2)*14,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,own:'player',life,wt:'flame',col:Math.random()<0.5?'#ff6600':'#ff3300',dmg:_flameDmg,sz:3+Math.random()*3,fade:life});
}
ptcl($buildings.player.x+Math.cos(Math.atan2($buildings.mouse.y-$buildings.player.y,$buildings.mouse.x-$buildings.player.x))*20,$buildings.player.y+Math.sin(Math.atan2($buildings.mouse.y-$buildings.player.y,$buildings.mouse.x-$buildings.player.x))*20,'#ffaa00',2,1);
_spawnMuzzleEffect($buildings.player.x+Math.cos(base)*22,$buildings.player.y+Math.sin(base)*22,base,'flamethrower','#ffaa00');
shake(0.6);
if(!$core.isVeryLow){if($buildings.settingPerfMode){$buildings._cvFlashColor='rgba(255,170,80,0.10)';$buildings._cvFlash=3;}else{$replay.mFlash.style.opacity='0.4';setTimeout(()=>$replay.mFlash.style.opacity='0',50);}}
audioManager.fire('flamethrower'); if($buildings.tick%3===0) fireVibrate('flamethrower');
} else if(w.wt==='rocket'){
const _phHeavenRkt = $buildings._mutCfg && $buildings._mutCfg.playerBulletHeaven;
const _rktCount = _phHeavenRkt ? 3 : 1;
const _rktSpread = _phHeavenRkt ? 0.28 : 0;
const _rktDmg = (8+_ud*4) * (_phHeavenRkt ? 0.4 : 1);
for(let r=0;r<_rktCount;r++){
const _ra = base + (_rktCount>1 ? (r-(_rktCount-1)/2)*_rktSpread : 0);
$buildings.bullets.push({x:$buildings.player.x,y:$buildings.player.y,vx:Math.cos(_ra)*w.spd,vy:Math.sin(_ra)*w.spd,own:'player',life:180,wt:'rocket',col:'#ff4400',dmg:_rktDmg,sz:6,ang:_ra});
}
for(let i=0;i<8;i++) ptcl($buildings.player.x-Math.cos(base)*18,$buildings.player.y-Math.sin(base)*18,'#ff6600',1,4);
_spawnMuzzleEffect($buildings.player.x+Math.cos(base)*28,$buildings.player.y+Math.sin(base)*28,base,'rpg','#ff4400');
shake(5);
$buildings.player.recoilOffset=Math.min(14,($buildings.player.recoilOffset||0)+9);
if(!$core.isVeryLow){if($buildings.settingPerfMode){$buildings._cvFlashColor='rgba(255,100,0,0.14)';$buildings._cvFlash=5;}else{$replay.mFlash.style.opacity='1';setTimeout(()=>$replay.mFlash.style.opacity='0',120);}}
audioManager.fire('rpg'); fireVibrate('rpg');
} else if(w.wt==='plasma'){
const _phHeavenPlasma = $buildings._mutCfg && $buildings._mutCfg.playerBulletHeaven;
const _plasmaCount = _phHeavenPlasma ? 6 : 1;
const _plasmaSpread = _phHeavenPlasma ? 0.5 : 0;
const _plasmaDmg = ((w.dmg||12)+_ud) * (_phHeavenPlasma ? 0.4 : 1);
for(let pl=0;pl<_plasmaCount;pl++){
const _pa = base + (_plasmaCount>1 ? (Math.random()-0.5)*_plasmaSpread : 0);
const bObj={x:$buildings.player.x,y:$buildings.player.y,vx:Math.cos(_pa)*w.spd,vy:Math.sin(_pa)*w.spd,
own:'player',life:150,wt:'plasma',col:'#00eeff',dmg:_plasmaDmg,sz:5,pierce:true};
$buildings.bullets.push(bObj);
}
ptcl($buildings.player.x+Math.cos(base)*20,$buildings.player.y+Math.sin(base)*20,'#00eeff',4,3);
_spawnMuzzleEffect($buildings.player.x+Math.cos(base)*22,$buildings.player.y+Math.sin(base)*22,base,'plasma','#00eeff');
shake(1.2);
$buildings.player.recoilOffset=Math.min(7,($buildings.player.recoilOffset||0)+2);
if(!$core.isVeryLow){if($buildings.settingPerfMode){$buildings._cvFlashColor='rgba(0,220,255,0.12)';$buildings._cvFlash=4;}else{$replay.mFlash.style.background='rgba(0,220,255,0.15)';$replay.mFlash.style.opacity='0.7';setTimeout(()=>$replay.mFlash.style.opacity='0',90);}}else{$replay.mFlash.style.background='rgba(0,220,255,0.15)';}
audioManager.fire('laser');
} else {
const _phHeaven = $buildings._mutCfg && $buildings._mutCfg.playerBulletHeaven;
const _pelCount = (w.pels||1) * (_phHeaven?6:1);
const _spreadMult = _phHeaven?3.2:1;
for(let p=0;p<_pelCount;p++){
const _spread = ($profiler._shopLaserSight ? w.spread*0.6 : w.spread) * _spreadMult;
const a=base+(Math.random()-0.5)*_spread;
const _masteryCol = $psycho2.wepEvolution[$buildings.curWep]===2 ? {
rifle:'#e8f4ff', shotgun:'#ff6600', smg:'#00ffee',
knife:'#ffffff', minigun:'#ff1100', rpg:'#cc0033',
flamethrower:'#ffcc00'
}[$buildings.curWep] || w.col : w.col;
const bObj={x:$buildings.player.x,y:$buildings.player.y,vx:Math.cos(a)*w.spd,vy:Math.sin(a)*w.spd,own:'player',life:120,wt:'bullet',col:_masteryCol,dmg:_phHeaven?Math.max(1,dmg*0.4):dmg,sz:w.sz};
if($psycho2.playerUpgrades.mutations.has('mut_pierce')) bObj.pierce=true;
if($psycho2.playerUpgrades.mutations.has('mut_ricochet')){ bObj.bounces=1; }
if($psycho2.playerUpgrades.mutations.has('mut_magnet')) bObj.homing=true;
if($psycho2.playerUpgrades.mutations.has('mut_multishot')){ bObj._shotIdx=($buildings.player._shotCount=($buildings.player._shotCount||0)+1); }
if($profiler._shopNapalm && !$profiler._shopNapalmClipUsed) bObj.napalm=true;
if(window._legendaryWeps){
if(window._legendaryWeps.has('smg') && $buildings.curWep==='smg') bObj._t3slow=true;
if(window._legendaryWeps.has('minigun') && $buildings.curWep==='minigun'){ bObj.homing=true; bObj._t3explode=true; }
}
$buildings.bullets.push(bObj);
}
const _muzzleCol = $psycho2.wepEvolution[$buildings.curWep]===2 ? ({
rifle:'#e8f4ff',shotgun:'#ff6600',smg:'#00ffee',
knife:'#ffffff',minigun:'#ff1100',rpg:'#cc0033',flamethrower:'#ffcc00'
}[$buildings.curWep]||w.col) : w.col;
ptcl($buildings.player.x+Math.cos(base)*24,$buildings.player.y+Math.sin(base)*24,_muzzleCol,3,2);
_spawnMuzzleEffect($buildings.player.x+Math.cos(base)*24,$buildings.player.y+Math.sin(base)*24,base,$buildings.curWep,_muzzleCol);
const _fireKick = {rifle:1.6,shotgun:3.3,smg:0.7,minigun:0.55,sniper:2.2}[$buildings.curWep] || 1.2;
shake(_fireKick);
const _recoilKick = {rifle:3.2,shotgun:8,smg:1.6,minigun:1.2,sniper:6}[$buildings.curWep] || 2.5;
const _recoilCap = {rifle:9,shotgun:12,smg:6,minigun:5,sniper:11}[$buildings.curWep] || 8;
$buildings.player.recoilOffset=Math.min(_recoilCap,($buildings.player.recoilOffset||0)+_recoilKick);
const _muzzleFlashCol = $buildings.curWep==='minigun'?'rgba(255,100,0,0.12)':$buildings.curWep==='shotgun'?'rgba(255,170,0,0.14)':'rgba(200,255,100,0.1)';
if(!$core.isVeryLow){if($buildings.settingPerfMode){$buildings._cvFlashColor=_muzzleFlashCol;$buildings._cvFlash=3;}else{$replay.mFlash.style.background=_muzzleFlashCol;$replay.mFlash.style.opacity=String(({shotgun:1.0,rifle:0.7,minigun:0.5,smg:0.35})[$buildings.curWep]??0.8);setTimeout(()=>$replay.mFlash.style.opacity='0',70);}}
audioManager.fire($buildings.curWep); fireVibrate($buildings.curWep);
}
if(!_isGodFiring) $buildings.wepAmmo[$buildings.curWep]--;
if(!$core.isUltraLow && !_isGodFiring){
const _cw=$buildings.curWep;
if(_cw==='rifle'||_cw==='smg'||_cw==='shotgun'||(_cw==='minigun'&&($buildings.tick&1)===0)){
const _pa=base+Math.PI/2*(Math.random()<0.85?1:-1)+(Math.random()-0.5)*0.6;
const _cp=$bosses._acquireParticle();
_cp.x=$buildings.player.x+Math.cos(base)*8;_cp.y=$buildings.player.y+Math.sin(base)*8;
const _cs=2+Math.random()*1.8;_cp.vx=Math.cos(_pa)*_cs;_cp.vy=Math.sin(_pa)*_cs;
_cp.life=16+Math.random()*8;_cp.col=_cw==='shotgun'?'#c0392b':'#d9b04a';_cp.sz=_cw==='shotgun'?2.8:2;_cp._alive=true;
$buildings.particles.push(_cp);
}
const _la=$buildings.wepAmmo[_cw];
if(_la>0&&_la<=Math.min(3,Math.ceil((w.ammo+(u.ammo||0))*0.2))&&_cw!=='minigun') audioManager.lowAmmo();
}
if($profiler._shopNapalm && !$profiler._shopNapalmClipUsed && $buildings.wepAmmo[$buildings.curWep]<=0) $profiler._shopNapalmClipUsed=true;
$buildings.player.sc=cd;
if ($psycho1._psychoActive) {
  for (let _pi = _preFire_len; _pi < $buildings.bullets.length; _pi++) {
    const _pb = $buildings.bullets[_pi];
    if (_pb && _pb.own === 'player') {
      _pb._pvx = _pb.vx; _pb._pvy = _pb.vy;
      _pb.vx = 0; _pb.vy = 0;
      _pb._psycho = true;
    }
  }
}
if($props._guidedWave) $props.onGuidedShot();
$legendary.updateHUD();
if($buildings.wepAmmo[$buildings.curWep]===0)startReload();
}
function startReload(){
if($props._guidedWave && typeof $props.onGuidedReload === 'function') $props.onGuidedReload();
const maxAmmo = $buildings.WEAPONS[$buildings.curWep].ammo + ($buildings.wepUpgrades[$buildings.curWep]?.ammo||0);
if($buildings.reloading||$buildings.wepAmmo[$buildings.curWep]>=maxAmmo)return;
$buildings.reloading=true;$buildings.reloadTimer=0;
audioManager.reloadStart($buildings.curWep);
}
function switchWep(i){
if(!$buildings.WK[i])return;
if($buildings._mutCfg && $buildings._mutCfg.knifeOnly && $buildings.WK[i] !== 'knife') return;
if($buildings.reloading){
$buildings.wepAmmo[$buildings.curWep]=$buildings.WEAPONS[$buildings.curWep].ammo+($buildings.wepUpgrades[$buildings.curWep]?.ammo||0);
}
$buildings.curWep=$buildings.WK[i];$buildings.reloading=false;$buildings.reloadTimer=0;
if($buildings.curWep==='laser'){
try{localStorage.removeItem('diy_laser_badge_pending');}catch(_e){}
document.querySelectorAll('.laser-new-badge').forEach(b=>b.remove());
}
const _wn=el('wep-name');
_wn.textContent=$buildings.WEAPONS[$buildings.curWep].name;
_wn.classList.remove('wep-switch-pulse');
void _wn.offsetWidth;
_wn.classList.add('wep-switch-pulse');
try{ audioManager._tone(220,0.035,'square',0.05,140); }catch(_e){}
$legendary.updateHUD();$legendary.updateWepUpgradeHUD();
if($core.isMobile && typeof $profiler.updateCycleBtn === 'function') $profiler.updateCycleBtn();
if(typeof $props.onGuidedWeaponSwitch === 'function') $props.onGuidedWeaponSwitch();
}
const MAX_PARTICLES = $core.isUltraLow ? 10 : $core.isLowEndDesktop ? 18 : $core.isMobile ? 45 : 350; ;$bosses.MAX_PARTICLES = MAX_PARTICLES;
const DEBRIS_CAP = ($core.isUltraLow || $core.isLowEndDesktop) ? 40 : $core.isMobile ? 80 : 200; ;$bosses.DEBRIS_CAP = DEBRIS_CAP;

const enemyMuzzleFlashes = [];
const ENEMY_FLASH_CAP = $core.isUltraLow?6:$core.isMobile?12:30;
function _spawnEnemyMuzzleFlash(x,y,col){
  if(enemyMuzzleFlashes.length>=ENEMY_FLASH_CAP) enemyMuzzleFlashes.shift();
  enemyMuzzleFlashes.push({x,y,life:8,maxLife:8,col:col||'#ff8844'});
}
function _updateEnemyMuzzleFlashes(){
  for(let i=enemyMuzzleFlashes.length-1;i>=0;i--){ if(--enemyMuzzleFlashes[i].life<=0) enemyMuzzleFlashes.splice(i,1); }
}
function _drawEnemyMuzzleFlashes(){
  for(let i=0;i<enemyMuzzleFlashes.length;i++){
    const f=enemyMuzzleFlashes[i];
    const t=f.life/f.maxLife;
    $core.ctx.save();
    $core.ctx.globalAlpha=t*0.85;
    $core.ctx.fillStyle=f.col;
    if($core.SHADOW){$core.ctx.shadowColor=f.col;$core.ctx.shadowBlur=10*t;}
    $core.ctx.beginPath();$core.ctx.arc(f.x,f.y,2+t*4,0,Math.PI*2);$core.ctx.fill();
    $core.ctx.restore();
  }
}
const ENEMY_RECOIL_KICK = 3.5, ENEMY_RECOIL_CAP = 9;
function _registerNewEnemyBullets(fromIdx){
  for(let i=fromIdx;i<$buildings.bullets.length;i++){
    const b=$buildings.bullets[i];
    if(!b||b.own!=='enemy')continue;
    _spawnEnemyMuzzleFlash(b.x,b.y,b.col);
  }
}
function _decayRecoil(o){
  if(o._recoilOffX){o._recoilOffX*=0.8;if(Math.abs(o._recoilOffX)<0.05)o._recoilOffX=0;}
  if(o._recoilOffY){o._recoilOffY*=0.8;if(Math.abs(o._recoilOffY)<0.05)o._recoilOffY=0;}
}
function _decayAllEnemyRecoil(){
  for(let i=0;i<$buildings.enemies.length;i++) _decayRecoil($buildings.enemies[i]);
  for(let i=0;i<$psycho2.armoredCars.length;i++) _decayRecoil($psycho2.armoredCars[i]);
  if(typeof $psycho2.spiderTank!=='undefined'&&$psycho2.spiderTank) _decayRecoil($psycho2.spiderTank);
  if(typeof $psycho2.helicopter!=='undefined'&&$psycho2.helicopter) _decayRecoil($psycho2.helicopter);
  if(typeof $psycho2.fighterJet!=='undefined'&&$psycho2.fighterJet) _decayRecoil($psycho2.fighterJet);
}
const _particlePool = [];
for(let i=0;i<MAX_PARTICLES;i++) _particlePool.push({x:0,y:0,vx:0,vy:0,life:0,col:'#ff8800',sz:2,_alive:false});
let _poolHead = 0;
const _PTCL_QUEUE_SIZE = 2048;
const _ptclQueue = new Array(_PTCL_QUEUE_SIZE);
$bosses._ptclQHead = 0; $bosses._ptclQTail = 0;
const _PTCL_DRAIN = ($core.isUltraLow || $core.isLowEndDesktop) ? 2 : $core.isMobile ? 5 : 40;
function _ptclQLen(){ return ($bosses._ptclQTail - $bosses._ptclQHead + _PTCL_QUEUE_SIZE) & (_PTCL_QUEUE_SIZE - 1); }
function _ptclQPush(obj){
_ptclQueue[$bosses._ptclQTail] = obj;
$bosses._ptclQTail = ($bosses._ptclQTail + 1) & (_PTCL_QUEUE_SIZE - 1);
if($bosses._ptclQTail === $bosses._ptclQHead) $bosses._ptclQHead = ($bosses._ptclQHead + 1) & (_PTCL_QUEUE_SIZE - 1);
}
function _drainParticleQueue(){
const n = Math.min(_ptclQLen(), _PTCL_DRAIN);
for(let i=0;i<n;i++){
const e=_ptclQueue[$bosses._ptclQHead];
$bosses._ptclQHead = ($bosses._ptclQHead + 1) & (_PTCL_QUEUE_SIZE - 1);
_emitOne(e.x,e.y,e.col,e.spd,e.life,e.sz);
}
}
function _emitOne(x,y,col,spd,life,sz){
const p=_acquireParticle();
const a=Math.random()*Math.PI*2, s=Math.random()*spd+1;
p.x=x; p.y=y; p.vx=Math.cos(a)*s; p.vy=Math.sin(a)*s;
p.life=life||(16+Math.random()*18);
p.col=col||'#ff8800';
p.sz=sz||(Math.random()*3+1);
p._alive=true;
$buildings.particles.push(p);
}
function _acquireParticle(){
for(let i=0;i<MAX_PARTICLES;i++){
const idx=(_poolHead+i)%MAX_PARTICLES;
if(!_particlePool[idx]._alive){ _poolHead=(idx+1)%MAX_PARTICLES; return _particlePool[idx]; }
}
const p=_particlePool[_poolHead]; _poolHead=(_poolHead+1)%MAX_PARTICLES; return p;
}
function ptcl(x,y,col,n,spd=3){
const count=Math.min(n, 8);
for(let i=0;i<count;i++) _emitOne(x,y,col,spd);
}
function ptclQ(x,y,col,n,spd=3){
const scaled = Math.max(1, Math.ceil(n * $buildings._dqsQuality));
if($core.isMobile && scaled > 8){
for(let i=0;i<scaled;i++){
_ptclQPush({x,y,col,spd,life:16+Math.random()*18,sz:Math.random()*3+1});
}
} else {
for(let i=0;i<scaled;i++) _emitOne(x,y,col,spd);
}
}
function ptclBurst(x,y,col,n,spd=3,life=null,sz=null){
if($core.isMobile && n > 30) n = Math.min(n, 24);
const cap = Math.max(1, Math.floor(n*$buildings._dqsQuality));
for(let i=0;i<cap;i++){
_ptclQPush({x,y,col,spd,
life: life ? life+Math.random()*8 : 16+Math.random()*18,
sz: sz ? sz+Math.random()*2 : Math.random()*3+1});
}
}
function shake(mag, dx, dy){ if(!$buildings.settingShakeEnabled) return; mag *= $buildings.settingShakeIntensity; if(mag<=0) return; if(dx!==undefined) $buildings._shakeAng=Math.atan2(dy,dx); else if(mag>=$buildings.shakeMag) $buildings._shakeAng=undefined; $buildings.shakeMag=Math.max($buildings.shakeMag, mag); if(mag>=12) $buildings.shakeHeavyUntil=$buildings.tick+8; }

let _hitFlashTO=null, _hitDesatEl=null, _hitDesatAnim=null;
function _hitScreenDesaturate(ms=100){
if($core.isVeryLow || $core.isMobile) return;
if(!_hitDesatEl){
const host=(document.getElementById('hitfx-flash')||{}).parentNode||$core.canvas.parentNode;
if(!host) return;
_hitDesatEl=document.createElement('div');
_hitDesatEl.style.cssText='position:absolute;inset:0;background:rgba(0,0,0,0.4);pointer-events:none;opacity:0;z-index:5;will-change:opacity;';
host.appendChild(_hitDesatEl);
}
if(_hitDesatAnim) _hitDesatAnim.cancel();
if(_hitDesatEl.animate){
_hitDesatAnim=_hitDesatEl.animate([{opacity:1},{opacity:0}],{duration:ms,easing:'ease-out'});
_hitDesatAnim.onfinish=_hitDesatAnim.oncancel=()=>{ _hitDesatAnim=null; };
}
}
});