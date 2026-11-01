window.__engine.files.push(function* profiler() {
const $bosses = window.__engine.bosses;
const $buildings = window.__engine.buildings;
const $core = window.__engine.core;
const $legendary = window.__engine.legendary;
const $mutators = window.__engine.mutators;
const $profiler = window.__engine.profiler;
const $props = window.__engine.props;
const $psycho1 = window.__engine.psycho1;
const $psycho2 = window.__engine.psycho2;
const $replay = window.__engine.replay;
const { _drainParticleQueue, fire, startReload, switchWep } = $bosses;
const { _getAliveEnemies, _gst, _isExclusiveUnlocked, buildMutatorConfig, el, showPickupMsg } = $buildings;
const { _attachBulletPool, draw, updateGame, updateHP, updateHUD } = $legendary;
const { _dcPeekToday, getDailyState, initDailyChallenges, initGame, renderDailyChallenges, startLevel } = $mutators;
const { _tickFPS, goToMenu, pollGamepad, showTutorial, togglePause } = $props;
const { _spawnShopDrone, _updateArmageddonBtnUI, activatePsychoMode, armageddon, callAirstrike, deactivatePsychoMode, spawnAlly, throwGrenade, updateGrenadeHUD, vibrate } = $psycho2;
const { _getRenderScale, isMenuSurfaceOpen, resize } = $replay;
Object.assign($profiler, { _applyHordeThrottle, _applyPrestigeReward, _getArmoryLoadout, _markMinimapDirty, _saveArmoryLoadout, _syncMiniHud, _syncPauseSoundBtn, _updateFrameBudget, _updateStressMixer, addWepStripHint, awardPrestigeXP, buildWepStrip, checkFirstPlay, checkWaveUnlocks, clearMovementKeys, gameLoop, getPrestigeState, renderDailyChallengeEndCard, renderMinimalHud, renderPrestigePanel, savePrestigeState, setHudCollapsed, showBootBriefing, showDailyChallengeCompleteBanner, showIngameHint, showTouchControls, showUnlockBanner, stopAutoFire, updateCycleBtn, updateDcTimer, updateWepStrip });
$profiler.applyPersistentPerks = applyPersistentPerks;
yield;

const _frameProfiler = (() => {
let on = false;
const STAGE_ORDER = ['input','update','draw','dqs','other'];
const STAGE_LABEL = {input:'INPUT/QUEUE', update:'GAME LOGIC', draw:'RENDER', dqs:'PARTICLE CAP', other:'OTHER'};
const SUB_LABEL = {'sub:movement':'movement/status', 'sub:projectiles':'projectiles', 'sub:enemyAI':'enemy AI'};
const SUB_ORDER = ['sub:movement','sub:projectiles','sub:enemyAI'];
const WINDOW = 30;
const _acc = {};
const _open = {};
let _frameStart = 0, _frameAcc = 0, _frameCount = 0;
let _frameClosed = true;
function _ensure(stage){ if(!_acc[stage]) _acc[stage] = {sum:0, count:0}; return _acc[stage]; }
STAGE_ORDER.forEach(_ensure); SUB_ORDER.forEach(_ensure);
function reset(){
Object.keys(_acc).forEach(s => { _acc[s].sum = 0; _acc[s].count = 0; });
_frameAcc = 0; _frameCount = 0;
}
return {
get enabled(){ return on; },
setEnabled(v){ on = !!v; if(on) reset(); },
frameStart(){ if(!on) return; _frameStart = performance.now(); _frameClosed = false; },
frameEnd(){
if(!on || _frameClosed) return;
_frameClosed = true;
const dur = performance.now() - _frameStart;
_frameAcc += dur; _frameCount++;
if(_frameCount >= WINDOW) _render();
},
mark(stage){ if(!on) return; _open[stage] = performance.now(); },
end(stage){
if(!on) return;
const start = _open[stage];
if(start === undefined) return;
const dur = performance.now() - start;
const a = _ensure(stage);
a.sum += dur; a.count++;
},
_render
};
function _render(){
const panel = document.getElementById('prof-rows');
const frameMsEl = document.getElementById('prof-frame-ms');
if(!panel || !frameMsEl) { _frameAcc = 0; _frameCount = 0; return; }
const frameAvg = _frameAcc / Math.max(1, _frameCount);
frameMsEl.textContent = frameAvg.toFixed(1) + 'ms';
let rows = '';
let namedSum = 0;
STAGE_ORDER.forEach(s => {
if(s === 'other') return;
const a = _acc[s];
const avg = a.count ? a.sum / a.count : 0;
namedSum += avg;
const pct = frameAvg > 0 ? Math.min(100, (avg / frameAvg) * 100) : 0;
rows += _row(STAGE_LABEL[s], avg, pct);
if(s === 'update'){
SUB_ORDER.forEach(sub => {
const sa = _acc[sub];
if(!sa || !sa.count) return;
const subAvg = sa.sum / sa.count;
const subPct = frameAvg > 0 ? Math.min(100, (subAvg / frameAvg) * 100) : 0;
rows += _row(SUB_LABEL[sub], subAvg, subPct, true);
});
}
});
const otherAvg = Math.max(0, frameAvg - namedSum);
const otherPct = frameAvg > 0 ? Math.min(100, (otherAvg / frameAvg) * 100) : 0;
rows += _row(STAGE_LABEL.other, otherAvg, otherPct);
panel.innerHTML = rows;
Object.keys(_acc).forEach(s => { _acc[s].sum = 0; _acc[s].count = 0; });
_frameAcc = 0; _frameCount = 0;
}
function _row(label, ms, pct, indent){
const barColor = pct > 50 ? '#ff3300' : pct > 25 ? '#ffaa00' : '#7fae2a';
const pad = indent ? 'padding-left:8px;font-size:7px;opacity:0.8;' : '';
return '<div style="margin-top:3px;'+pad+'">'
+ '<div style="display:flex;justify-content:space-between;color:#c8ffb0;">'
+ '<span>'+(indent?'– ':'')+label+'</span><span>'+ms.toFixed(1)+'ms</span></div>'
+ '<div style="height:'+(indent?'2px':'3px')+';background:rgba(0,20,0,0.6);margin-top:1px;">'
+ '<div style="height:100%;width:'+pct.toFixed(0)+'%;background:'+barColor+';"></div></div>'
+ '</div>';
}
})(); ;$profiler._frameProfiler = _frameProfiler;
window._frameProfiler = _frameProfiler;
document.querySelectorAll('.diff-btn').forEach(btn=>{
if(!btn.dataset.diff) return;
btn.addEventListener('click',()=>{
document.querySelectorAll('.diff-btn').forEach(b=>{ if(b.dataset.diff) b.classList.remove('active'); });
btn.classList.add('active');
$buildings.settingDifficulty = btn.dataset.diff;
try{ localStorage.setItem('diy_set_diff', $buildings.settingDifficulty); }catch(e){}
const cdPanel = el('custom-diff-panel');
if(cdPanel) cdPanel.style.display = $buildings.settingDifficulty==='custom' ? 'flex' : 'none';
});
});
(function _wireCustomDifficulty(){
const sliderMap = [
['cd-hp-slider','cd-hp-label','hp'],
['cd-speed-slider','cd-speed-label','speed'],
['cd-spawn-slider','cd-spawn-label','spawn'],
['cd-dmg-slider','cd-dmg-label','dmg'],
['cd-pspeed-slider','cd-pspeed-label','pspeed'],
];
sliderMap.forEach(([sliderId, labelId, key])=>{
const slider = el(sliderId), label = el(labelId);
if(!slider || !label) return;
slider.addEventListener('input', e=>{
const val = parseInt(e.target.value);
$buildings.customDiff[key] = val/100;
label.textContent = val+'%';
try{ localStorage.setItem('diy_set_cd_'+key, String(val)); }catch(err){}
});
});
const resetBtn = el('cd-reset-btn');
if(resetBtn) resetBtn.addEventListener('click', ()=>{
sliderMap.forEach(([sliderId, labelId, key])=>{
const slider = el(sliderId), label = el(labelId);
$buildings.customDiff[key] = 1.0;
if(slider) slider.value = 100;
if(label) label.textContent = '100%';
try{ localStorage.setItem('diy_set_cd_'+key, '100'); }catch(err){}
});
});
})();
document.querySelectorAll('.res-btn').forEach(btn=>{
btn.addEventListener('click',()=>{
document.querySelectorAll('.res-btn').forEach(b=>b.classList.remove('active'));
btn.classList.add('active');
const resKey = btn.dataset.res;
$replay._userResPref = resKey;
$replay._runtimeRenderScale = $replay._RES_SCALE_VALUES[resKey];
try{ localStorage.setItem('diy_set_res', resKey); }catch(e){}
resize();
if($buildings.state==='playing') showPickupMsg('▸ RESOLUTION: '+resKey.toUpperCase(),'#7fff00');
});
});
let menuTheme = 'night';
try { menuTheme = localStorage.getItem('ampsa_theme') || 'night'; } catch(e){}
function applyTheme(t){
menuTheme = t;
document.body.classList.toggle('light-mode', t === 'light');
try { localStorage.setItem('ampsa_theme', t); } catch(e){}
}
applyTheme(menuTheme);
$replay.audioToggle.addEventListener('click',()=>{
const enabled=audioManager.toggle();
$replay.audioToggle.textContent=enabled?'[ SOUND ON ]':'[ SOUND OFF ]';
const tog=el('snd-toggle');
tog.dataset.on=String(enabled);
tog.querySelector('.toggle-val').textContent=enabled?'ON':'OFF';
el('vol-row').style.opacity=enabled?'1':'0.4';
el('vol-row').style.pointerEvents=enabled?'auto':'none';
try{ localStorage.setItem('diy_set_snd', enabled?'1':'0'); }catch(e){}
_syncPauseSoundBtn();
});
function _syncPauseSoundBtn(){
const btn = el('pause-sound-btn');
if(!btn) return;
btn.textContent = audioManager.enabled ? 'SOUND ON' : 'SOUND OFF';
btn.style.color = audioManager.enabled ? '#5a9000' : '#553300';
btn.style.borderColor = audioManager.enabled ? '#2a5000' : '#3a1400';
}
function _handlePauseSoundClick(){
const enabled=audioManager.toggle();
$replay.audioToggle.textContent=enabled?'[ SOUND ON ]':'[ SOUND OFF ]';
const tog=el('snd-toggle');
tog.dataset.on=String(enabled);
tog.querySelector('.toggle-val').textContent=enabled?'ON':'OFF';
el('vol-row').style.opacity=enabled?'1':'0.4';
el('vol-row').style.pointerEvents=enabled?'auto':'none';
try{ localStorage.setItem('diy_set_snd', enabled?'1':'0'); }catch(e){}
_syncPauseSoundBtn();
}
el('pause-sound-btn').addEventListener('click', _handlePauseSoundClick);
el('pause-sound-btn').addEventListener('touchstart', e=>{ e.preventDefault(); _handlePauseSoundClick(); },{passive:false});
window.startTurbo = function startTurbo(){
if(!gameReady) return;
audioManager.uiClick();
$buildings.activeMutators.clear();
$buildings.activeMutators.add('mut_turbo');
$buildings._mutCfg = buildMutatorConfig();
startLevel({ level: null, mutators: true });
};
$profiler.lastInputScheme = 'keyboard';
function clearMovementKeys(){
['KeyW','KeyS','KeyA','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].forEach(k=>$buildings.keys[k]=false);
}
document.addEventListener('keydown', e => {
if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight'].includes(e.code)){
$profiler.lastInputScheme = 'keyboard';
$buildings.keys[e.code] = true;
$buildings.keys[e.code+'_kb'] = true;
}
});
document.addEventListener('keyup', e => {
if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight'].includes(e.code)){
$buildings.keys[e.code] = false;
$buildings.keys[e.code+'_kb'] = false;
}
});
function injectJoyInput(){
if(typeof $core.isMobile === 'undefined' || !$core.isMobile) return;
if($profiler.lastInputScheme === 'keyboard' && !$profiler.joyActive) return;
const DEAD = 0.18;
if($profiler.joyActive && $buildings.state==='playing' && !$buildings.isPaused){
$profiler.lastInputScheme = 'touch';
const _pX = !!($buildings.keys['KeyA']||$buildings.keys['KeyD']), _pY = !!($buildings.keys['KeyW']||$buildings.keys['KeyS']);
['KeyW','KeyA','KeyS','KeyD'].forEach(k => {
if(!$buildings.keys[k+'_kb']) $buildings.keys[k] = false;
});
const _jm = Math.hypot($profiler.joyDX, $profiler.joyDY);
if(_jm >= DEAD){
const _ax = Math.abs($profiler.joyDX)/_jm, _ay = Math.abs($profiler.joyDY)/_jm;
const _onX = _ax >= _ay || _ax > (_pX ? 0.32 : 0.44);
const _onY = _ay >= _ax || _ay > (_pY ? 0.32 : 0.44);
$buildings.keys['KeyA'] = _onX && $profiler.joyDX < 0;
$buildings.keys['KeyD'] = _onX && $profiler.joyDX > 0;
$buildings.keys['KeyW'] = _onY && $profiler.joyDY < 0;
$buildings.keys['KeyS'] = _onY && $profiler.joyDY > 0;
}
} else {
if($profiler.lastInputScheme === 'touch'){
$buildings.keys['KeyW'] = false;
$buildings.keys['KeyS'] = false;
$buildings.keys['KeyA'] = false;
$buildings.keys['KeyD'] = false;
}
}
}
const FRAME_BUDGET_MOBILE = 33;
$profiler._lastFrame = 0;
let _dqsLastCheck = 0;
const DQS_CHECK_INTERVAL = 1200;
const DQS_R_HIGH = 0.70, DQS_R_MID = 0.55, DQS_R_LOW = 0.40, DQS_R_ULTRA = 0.30;
let _dqsGoodStreak = 0;
function _dqsGetEffectiveParticleCap(){
if($buildings.settingPerfMode) return Math.floor($bosses.MAX_PARTICLES * ($props._perfParticlePct / 100));
return Math.floor($bosses.MAX_PARTICLES * $buildings._dqsQuality);
}
const _DQS_BUF_SIZE = 45; ;$profiler._DQS_BUF_SIZE = _DQS_BUF_SIZE;
$profiler._dqsBuf = new Float64Array(_DQS_BUF_SIZE);
$profiler._dqsBufHead = 0; $profiler._dqsBufCount = 0;
$profiler._dqsBadStreak = 0;
function _dqsUpdate(ts){
if($profiler._dqsBufCount > 0){
const _prev = $profiler._dqsBuf[($profiler._dqsBufHead + _DQS_BUF_SIZE - 1) % _DQS_BUF_SIZE];
if(ts - _prev > 1000){ $profiler._dqsBufCount = 0; $profiler._dqsBufHead = 0; $profiler._dqsBadStreak = 0; _dqsGoodStreak = 0; }
}
$profiler._dqsBuf[$profiler._dqsBufHead] = ts;
$profiler._dqsBufHead = ($profiler._dqsBufHead + 1) % _DQS_BUF_SIZE;
if($profiler._dqsBufCount < _DQS_BUF_SIZE) $profiler._dqsBufCount++;
if(ts - _dqsLastCheck < DQS_CHECK_INTERVAL) return;
_dqsLastCheck = ts;
if($profiler._dqsBufCount < 10) return;
const oldest = $profiler._dqsBuf[($profiler._dqsBufHead - $profiler._dqsBufCount + _DQS_BUF_SIZE) % _DQS_BUF_SIZE];
const newest = $profiler._dqsBuf[($profiler._dqsBufHead - 1 + _DQS_BUF_SIZE) % _DQS_BUF_SIZE];
const avg = (newest - oldest) / ($profiler._dqsBufCount - 1);
const fps = avg > 0 ? Math.round(1000 / avg) : 999;
const _effTarget = 1000 / (_frameBudget || 16);
const _baseTarget = 1000 / (_frameBudgetBase || 16);
const DQS_FPS_HIGH = _effTarget * DQS_R_HIGH;
const DQS_FPS_MID = _effTarget * DQS_R_MID;
const DQS_FPS_LOW = _effTarget * DQS_R_LOW;
const DQS_FPS_ULTRA = _effTarget * DQS_R_ULTRA;
const _failFps = _baseTarget * DQS_R_ULTRA;
if(fps >= DQS_FPS_HIGH) $buildings._dqsQuality = Math.min(1.0, $buildings._dqsQuality + 0.03);
else if(fps < DQS_FPS_ULTRA) $buildings._dqsQuality = Math.max(0.04, $buildings._dqsQuality - 0.25);
else if(fps < DQS_FPS_LOW) $buildings._dqsQuality = Math.max(0.12, $buildings._dqsQuality - 0.15);
else if(fps < DQS_FPS_MID) $buildings._dqsQuality = Math.max(0.25, $buildings._dqsQuality - 0.1);
if(fps < _failFps){
_frameBudget = Math.min(66, _frameBudget + 6);
_dqsGoodStreak = 0;
} else if(_frameBudget > _frameBudgetBase && fps >= DQS_FPS_HIGH){
if(++_dqsGoodStreak >= 5){ _frameBudget = Math.max(_frameBudgetBase, _frameBudget - 6); _dqsGoodStreak = 0; }
} else {
_dqsGoodStreak = 0;
}
if(fps < _failFps && $replay._userResPref === 'auto'){
$profiler._dqsBadStreak++;
if($profiler._dqsBadStreak >= 2){
if(!$core.isLowEndDesktop && !$core.isUltraLow && !$core.isMobile){ try{ localStorage.setItem('diy_slowdev', String(Date.now())); }catch(e){} }
const _cur = _getRenderScale();
const _next = _cur > 0.85 ? 0.85 : _cur > 0.75 ? 0.75 : _cur > 0.65 ? 0.65 : _cur > 0.55 ? 0.55 : _cur > 0.5 ? 0.5 : _cur;
if(_next < _cur){
$replay._runtimeRenderScale = _next;
if(typeof resize === 'function') resize();
}
$profiler._dqsBadStreak = 0;
}
} else if($replay._userResPref === 'auto') {
$profiler._dqsBadStreak = 0;
}
}
function _dqsEnforceParticleCap(){
const cap = _dqsGetEffectiveParticleCap();
while($buildings.particles.length > cap){
const victim = $buildings.particles[0];
victim._alive = false;
$buildings.particles[0] = $buildings.particles[$buildings.particles.length-1];
$buildings.particles.pop();
}
}
$profiler._skipTrailParticles = false;
function _applyHordeThrottle(){
const _isDesktopTier = !$core.isMobile && !$core.isLowEndDesktop && !$core.isUltraLow;
const aliveEnemies = $buildings.enemies.filter(e=>e.alive&&!e.boss).length;
const bulletCount = $buildings.bullets.length;
const hi = _isDesktopTier ? 60 : 25;
const mid = _isDesktopTier ? 40 : 15;
const bulletHi = _isDesktopTier ? 350 : 180;
const bulletMid = _isDesktopTier ? 260 : 120;
const bulletTrim = _isDesktopTier ? 450 : 220;
if(aliveEnemies > hi || bulletCount > bulletHi){
$buildings._dqsQuality = Math.min($buildings._dqsQuality, _isDesktopTier ? 0.55 : 0.25);
$profiler._skipTrailParticles = true;
if(bulletCount > bulletTrim){
$buildings.bullets = _attachBulletPool($buildings.bullets.filter(b => b.own !== 'enemy' || Math.random() > 0.10));
}
} else if(aliveEnemies > mid || bulletCount > bulletMid){
$buildings._dqsQuality = Math.min($buildings._dqsQuality, _isDesktopTier ? 0.7 : 0.45);
$profiler._skipTrailParticles = false;
} else {
$profiler._skipTrailParticles = false;
}
}
if ($core.isMobile) { const _mmEl = document.getElementById('minimap'); if (_mmEl) _mmEl.remove(); }
const _mm = document.getElementById('minimap'); ;$profiler._mm = _mm;
const _mmCtx = _mm ? _mm.getContext('2d') : null;
let _mmLastPx = -1, _mmLastPy = -1, _mmLastEnemyCount = -1, _mmLastBossAlive = false;
let _mmDirty = true;
function _markMinimapDirty() { _mmDirty = true; }
function drawMinimap(){
if(!_mmCtx||!$buildings.player) return;
const mw = _mm.width, mh = _mm.height;
const sx = mw / $replay.W, sy = mh / $replay.H;
const _curECount = $buildings.enemies.filter(e=>e&&e.alive).length;
const _curBoss = !!($buildings.bossAlive);
const _pxSnap = Math.round($buildings.player.x / 4);
const _pySnap = Math.round($buildings.player.y / 4);
if (!_mmDirty && _pxSnap === _mmLastPx && _pySnap === _mmLastPy && _curECount === _mmLastEnemyCount && _curBoss === _mmLastBossAlive) return;
_mmDirty = false;
_mmLastPx = _pxSnap; _mmLastPy = _pySnap;
_mmLastEnemyCount = _curECount; _mmLastBossAlive = _curBoss;
_mmCtx.clearRect(0,0,mw,mh);
_mmCtx.fillStyle = 'rgba(0,12,0,0.92)';
_mmCtx.fillRect(0,0,mw,mh);
_mmCtx.fillStyle = '#1a2e0a';
for(const b of $psycho1.buildings){
_mmCtx.fillRect(b.x*sx, b.y*sy, Math.max(3,b.w*sx), Math.max(3,b.h*sy));
}
_mmCtx.fillStyle = '#00ffcc';
for(const a of ($buildings.allies||[])){
if(!a.alive) continue;
_mmCtx.beginPath();
_mmCtx.arc(a.x*sx, a.y*sy, 3, 0, Math.PI*2);
_mmCtx.fill();
}
const _mmEnemies=_getAliveEnemies();
for(const e of _mmEnemies){
if(e.boss){
_mmCtx.fillStyle = '#ff2200';
_mmCtx.beginPath();
_mmCtx.arc(e.x*sx, e.y*sy, 4.5, 0, Math.PI*2);
_mmCtx.fill();
} else {
_mmCtx.fillStyle = '#dd2200';
_mmCtx.fillRect(e.x*sx-2, e.y*sy-2, 4, 4);
}
}
const specials = [];
if($psycho2.spiderTank&&$psycho2.spiderTank.alive) specials.push($psycho2.spiderTank);
if($psycho2.harmTug&&$psycho2.harmTug.alive) specials.push($psycho2.harmTug);
if($psycho2.helicopter&&$psycho2.helicopter.alive) specials.push($psycho2.helicopter);
if($psycho2.alienShip&&$psycho2.alienShip.alive) specials.push($psycho2.alienShip);
if($psycho2.fighterJet&&$psycho2.fighterJet.alive) specials.push($psycho2.fighterJet);
if($psycho2.armoredCars) for(const c of $psycho2.armoredCars){ if(c.alive) specials.push(c); }
_mmCtx.fillStyle = '#ff8800';
for(const s of specials){
const mx=s.x*sx, my=s.y*sy;
_mmCtx.beginPath();
_mmCtx.moveTo(mx,my-5); _mmCtx.lineTo(mx+5,my); _mmCtx.lineTo(mx,my+5); _mmCtx.lineTo(mx-5,my);
_mmCtx.closePath(); _mmCtx.fill();
}
const px = $buildings.player.x*sx, py = $buildings.player.y*sy;
_mmCtx.fillStyle = '#aaff00';
_mmCtx.beginPath(); _mmCtx.arc(px, py, 4, 0, Math.PI*2); _mmCtx.fill();
_mmCtx.fillStyle = '#ffffff';
_mmCtx.beginPath(); _mmCtx.arc(px, py, 1.5, 0, Math.PI*2); _mmCtx.fill();
_mmCtx.strokeStyle = '#3a6000';
_mmCtx.lineWidth = 1;
_mmCtx.strokeRect(0.5,0.5,mw-1,mh-1);
}
document.addEventListener('visibilitychange', () => {
if(document.hidden && $buildings.state === 'playing' && !$buildings.isPaused) togglePause();
});
const _LOWEND_BUDGET = (navigator.hardwareConcurrency || 4) >= 4 ? 33 : 50;
let _frameBudget = $core.isUltraLow ? 33 : $core.isLowEndDesktop ? _LOWEND_BUDGET : $core.isMobile ? 33 : 16;
let _frameBudgetBase = _frameBudget;
function _updateFrameBudget(){ _frameBudget = _frameBudgetBase = $buildings.setting30fps ? 33 : ($core.isUltraLow ? 33 : $core.isLowEndDesktop ? _LOWEND_BUDGET : $core.isMobile ? 33 : 16); }
function gameLoop(ts){
if(!$replay.W||!$replay.H){resize();}
window._diyRafId = requestAnimationFrame(gameLoop);
if($buildings.state!=='playing'){ $profiler._lastFrame = ts; window._simAcc = 0; return; }
const elapsed = ts - $profiler._lastFrame;
if(_frameBudget > 0 && elapsed < _frameBudget - 2.5) return;
const _dtClampMult = ($core.isUltraLow || $core.isLowEndDesktop) ? 4 : 2;
const dt = Math.min(elapsed, _frameBudget * _dtClampMult || 32) / (_frameBudget || 16);
$profiler._lastFrame = ts;
if(!$buildings.isPaused){
_frameProfiler.frameStart();
try {
if(window._slowMoUntil && ts < window._slowMoUntil){
if(!window._slowMoSkip) { window._slowMoSkip = true; draw(); _frameProfiler.frameEnd(); return; }
window._slowMoSkip = false;
} else {
window._slowMoSkip = false;
}
_frameProfiler.mark('input');
_dqsUpdate(ts);
_drainParticleQueue();
pollGamepad();
injectJoyInput();
if($core.isMobile && $buildings.settingAimAssist && aimActive) applyAimAssist();
if($buildings.settingAutoAim) applyAutoAim();
_frameProfiler.end('input');
if($replay._freezeFrames > 0){ $replay._freezeFrames = Math.max(0, $replay._freezeFrames - Math.max(1, Math.round(elapsed/(1000/60)))); draw(); _frameProfiler.frameEnd(); return; }
_frameProfiler.mark('update');
let _simSteps = 1;
if(window.__legacyTick){ updateGame(dt); }
else {
const _SIM_STEP = 1000/60;
window._simAcc = Math.min((window._simAcc||0) + elapsed, _SIM_STEP*3.5);
_simSteps = 0;
const _simPlanned = window._simAcc >= _SIM_STEP - 2 ? Math.min(3, Math.floor((window._simAcc + 2) / _SIM_STEP)) : 0;
while(window._simAcc >= _SIM_STEP - 2 && _simSteps < 3){
window._simSkipHud = _simSteps < _simPlanned - 1;
updateGame(1); window._simAcc -= _SIM_STEP; _simSteps++;
if($buildings.isPaused || $buildings.state!=='playing' || $replay._freezeFrames>0) break;
}
window._simSkipHud = false;
if(_simSteps>=3) window._simAcc = 0;
}
_frameProfiler.end('update');
if($buildings._mutCfg&&$buildings._mutCfg.armageddon&&$buildings.tick%6===0) _updateArmageddonBtnUI();
_frameProfiler.mark('dqs');
_dqsEnforceParticleCap();
_frameProfiler.end('dqs');
if(_simSteps > 0 || $buildings.isPaused){
_frameProfiler.mark('draw');
draw();
_frameProfiler.end('draw');
}
_frameProfiler.frameEnd();
if($props.fpsVisible) _tickFPS(ts);
if(!$core.isUltraLow && !$core.isLowEndDesktop && !$core.isMobile && $buildings.tick % 15 === 0) { drawMinimap(); }
if(window._appleShellSyncPill) window._appleShellSyncPill();
} catch(e) {
if (!window._glLastErrorAt || ts - window._glLastErrorAt > 4000) {
window._glLastErrorAt = ts;
console.warn('[gameLoop] frame error (continuing, run not ended):', e);
}
window._simSkipHud = false;
_frameProfiler.frameEnd();
}
}
}
window.addEventListener('error', ev => {
const errScreen = el('error-screen');
el('error-msg').textContent = ev.message || 'An unexpected error occurred.';
const detail = el('error-detail');
if(ev.filename || ev.lineno){
detail.textContent = `${ev.filename ? ev.filename.split('/').pop() : ''}${ev.lineno ? ' line '+ev.lineno : ''}`;
detail.style.display = 'block';
}
errScreen.classList.add('active');
const msg = (ev.message || '').toLowerCase();
if(msg.includes('audiocontext') || msg.includes('localstorage') || msg.includes('quota')){
errScreen.classList.remove('active');
if(msg.includes('quota')){
if(typeof showPickupMsg === 'function'){
showPickupMsg('! STORAGE FULL — EXPORT DATA IN MORE', '#ff8800');
} else {
const _qt = document.createElement('div');
_qt.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:99999;background:rgba(20,8,0,0.96);border:1px solid #ff8800;color:#ff8800;font-family:Share Tech Mono,monospace;font-size:11px;letter-spacing:2px;padding:10px 20px;pointer-events:none;white-space:nowrap;';
_qt.textContent = '! STORAGE FULL — EXPORT SAVES IN MORE BEFORE DATA IS LOST';
document.body.appendChild(_qt);
setTimeout(()=>{ if(_qt.parentNode) _qt.remove(); }, 6000);
}
}
}
});
window.addEventListener('unhandledrejection', ev => {
const msg = (ev.reason?.message || String(ev.reason) || '').toLowerCase();
if(msg.includes('audiocontext') || msg.includes('audio') || msg.includes('localstorage')) return;
el('error-msg').textContent = 'Promise error: ' + (ev.reason?.message || ev.reason || 'Unknown');
el('error-screen').classList.add('active');
});
el('error-reload').addEventListener('click', () => location.reload());
const LOAD_TIPS = [
'TIP: 5 kills in a row triggers RAMPAGE BONUS',
'TIP: Snipers keep their distance — rush them',
'TIP: Grenades drop from boss kills — save them',
'TIP: Shield powerup blocks full bullet damage',
'TIP: Upgrade between waves to stay competitive',
'TIP: Allies spawn on boss waves — use them',
'TIP: RPG is explosive. Watch your feet.',
'TIP: One armored car will charge you — watch for the ! and dodge',
'TIP: Night mode — enemies glow in the dark',
'TIP: Grenades and RPGs can level buildings',
];
const ARMORY_ITEMS = [
{ id:'hp25', icon:'+', name:'TRAUMA KIT', desc:'+25 Starting HP', cost:1, max:3, tier:1, apply:(p)=>{ p.maxHp+=25; p.hp=Math.min(p.hp+25,p.maxHp); updateHP(); } },
{ id:'grenade2', icon:'▪', name:'FRAG PACK', desc:'+2 Starting Grenades', cost:2, max:2, tier:1, apply:()=>{ $buildings.grenadeCount=Math.min($buildings.grenadeCount+2,9); updateGrenadeHUD(); } },
{ id:'ammo2', icon:'', name:'AMMO RESUPPLY', desc:'+2 Clips to Starting Weapon', cost:2, max:2, tier:1, apply:()=>{ $buildings.wepAmmo[$buildings.curWep]=($buildings.wepAmmo[$buildings.curWep]||0)+$buildings.WEAPONS[$buildings.curWep].ammo*2; updateHUD(); } },
{ id:'scavenger', icon:'¤', name:'SCAVENGER', desc:'+1 Token bonus per 10 kills', cost:2, max:1, tier:1, apply:()=>{ $profiler._shopScavenger=true; } },
{ id:'shield', icon:'▣', name:'NANO-SHIELD', desc:'Absorb first hit for free', cost:3, max:1, tier:2, apply:(p)=>{ p.shield=Math.max(p.shield||0,180); } },
{ id:'regen', icon:'+', name:'STIM PACK', desc:'Regen HP over time this run', cost:3, max:1, tier:2, apply:()=>{ $profiler._shopHpRegen=true; } },
{ id:'lasersight',icon:'●', name:'LASER SIGHT', desc:'+40% bullet accuracy this run', cost:3, max:1, tier:2, apply:()=>{ $profiler._shopLaserSight=true; } },
{ id:'napalm', icon:'', name:'NAPALM ROUNDS', desc:'First clip sets enemies on fire',cost:4, max:1, tier:2, apply:()=>{ $profiler._shopNapalm=true; } },
{ id:'blastarmor',icon:'', name:'BLAST ARMOR', desc:'60% explosive damage reduction', cost:4, max:1, tier:2, apply:()=>{ $profiler._shopBlastArmor=true; } },
{ id:'speed', icon:'', name:'SPRINT IMPLANT', desc:'+20% Move Speed (this run)', cost:4, max:1, tier:2, apply:(p)=>{ $psycho2.playerUpgrades.speed=($psycho2.playerUpgrades.speed||1)*1.20; } },
{ id:'xpboost', icon:'^', name:'INTEL PACKAGE', desc:'+75% XP this run', cost:4, max:1, tier:2, apply:()=>{ $profiler._shopXpMult=1.75; } },
{ id:'medic', icon:'+', name:'COMBAT MEDIC', desc:'Auto-revive once at 5 HP', cost:5, max:1, tier:3, apply:()=>{ $profiler._shopMedic=true; } },
{ id:'drone', icon:'', name:'DRONE BUDDY', desc:'Attack drone orbits and fires', cost:6, max:1, tier:3, apply:()=>{ _shopDrone=true; } },
{ id:'airstrike', icon:'▲', name:'AIR SUPPORT', desc:'One airstrike call-in (Q key)', cost:6, max:1, tier:3, apply:()=>{ $profiler._shopAirstrike=true; } },
{ id:'overclock', icon:'▸', name:'OVERCLOCK', desc:'+30% fire rate, -20% damage', cost:8, max:1, tier:3, apply:()=>{ $profiler._shopOverclock=true; } },
{ id:'glasscannon', icon:'◆', name:'GLASS CANNON', desc:'+40% damage, -25% max HP', cost:6, max:1, tier:3, apply:(p)=>{ $profiler._shopGlassCannon=true; p.maxHp=Math.round(p.maxHp*0.75); p.hp=Math.min(p.hp,p.maxHp); updateHP(); } },
{ id:'ironwill', icon:'■', name:'IRON WILL', desc:'+50 max HP, -15% Move Speed', cost:5, max:1, tier:2, apply:(p)=>{ p.maxHp+=50; p.hp=Math.min(p.hp+50,p.maxHp); $psycho2.playerUpgrades.speed=($psycho2.playerUpgrades.speed||1)*0.85; updateHP(); } },
{ id:'deathwish', icon:'X', name:'DEATH WISH', desc:'Start at 1 HP — 3× score mult', cost:0, max:1, tier:3, apply:(p)=>{ $profiler._shopDeathWish=true; p.hp=1; p.maxHp=1; updateHP(); } },
];

const ARMORY_ICONS = {
hp25:'<rect x="3" y="7" width="18" height="13" rx="1.5"/><path d="M9 7V5h6v2"/><path d="M12 10.5v6M9 13.5h6"/>',
grenade2:'<circle cx="12" cy="14.5" r="6.5"/><path d="M9.5 8.2V5.5h5v2.7"/><path d="M14.5 6.2l4.5-1.7M18.3 3.2l1.3 2.6"/><path d="M8.2 12.5h7.6M7.6 16.5h8.8"/>',
ammo2:'<path d="M4.5 21v-9c0-2.2.9-4.2 2.2-5.6 1.3 1.4 2.2 3.4 2.2 5.6v9z"/><path d="M4.5 17h4.4"/><path d="M10.9 21v-9c0-2.2.9-4.2 2.2-5.6 1.3 1.4 2.2 3.4 2.2 5.6v9z"/><path d="M10.9 17h4.4"/><path d="M17.3 21v-9c0-2.2.9-4.2 2.2-5.6 1.3 1.4 2.2 3.4 2.2 5.6v9z"/><path d="M17.3 17h4.4"/>',
scavenger:'<circle cx="10.5" cy="12.5" r="7"/><circle cx="10.5" cy="12.5" r="3.2"/><path d="M19 3.5v5M16.5 6h5"/>',
shield:'<path d="M12 3l8 3v6c0 4.6-3.2 7.9-8 9.5C7.2 19.9 4 16.6 4 12V6z"/><path d="M12 8l3.2 1.9v3.7L12 15.5l-3.2-1.9V9.9z"/>',
regen:'<path d="M15.5 3.5l5 5M13.5 5.5l5 5M6 18l-2.5 2.5"/><path d="M14 6.5L6.5 14l3.5 3.5L17.5 10"/><path d="M8.2 15.8L6 18M10.5 12.5l2 2"/>',
lasersight:'<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><path d="M12 2.5v5M12 16.5v5M2.5 12h5M16.5 12h5"/>',
napalm:'<path d="M12 21c-4 0-6.5-2.8-6.5-6.2 0-3 2-4.8 3.2-7 .4 1.8 1.4 2.8 2.4 3.3C11 8.5 12.2 5.5 14 3c.4 3.4 4.5 6 4.5 11.8 0 3.4-2.5 6.2-6.5 6.2z"/><path d="M12 20c-1.8 0-3-1.3-3-3 0-1.6 1.4-2.4 2-3.7.7.9 1.2 1.5 1.6 2 .6-.3.9-.8 1-1.6.9 1 1.4 2 1.4 3.3 0 1.7-1.2 3-3 3z"/>',
blastarmor:'<path d="M7.5 3H10l2 2 2-2h2.5L19 6v14.5H5V6z"/><rect x="8.5" y="9" width="7" height="7" rx="1"/><path d="M5 12.5h3.5M15.5 12.5H19M12 9v7"/>',
speed:'<path d="M13.5 2.5L5 13.5h6l-1.5 8 9-11.5h-6z"/>',
xpboost:'<path d="M3 7.5V19h18V9.5h-9L10 6.5H4.2A1.2 1.2 0 0 0 3 7.5z"/><path d="M12 11.5l1.3 2.6 2.9.4-2.1 2 .5 2.9-2.6-1.4-2.6 1.4.5-2.9-2.1-2 2.9-.4z"/>',
medic:'<path d="M12 20.5S3.5 15.6 3.5 9.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.5 2.4c0 6.2-8.5 11.1-8.5 11.1z"/><path d="M12 10v5M9.5 12.5h5"/>',
drone:'<rect x="9" y="10" width="6" height="4" rx="1"/><path d="M9.5 10.5L5.5 6.5M14.5 10.5l4-4M9.5 13.5l-4 4M14.5 13.5l4 4"/><circle cx="4.5" cy="5.5" r="2.2"/><circle cx="19.5" cy="5.5" r="2.2"/><circle cx="4.5" cy="18.5" r="2.2"/><circle cx="19.5" cy="18.5" r="2.2"/>',
airstrike:'<path d="M12 21l-2.6-5V8.5L12 3l2.6 5.5V16z"/><path d="M9.4 15.5L6.5 19M14.6 15.5l2.9 3.5"/><path d="M12 8.5v4"/><path d="M2.5 22h4M9.5 22h5M17.5 22h4" stroke-dasharray="1 0"/>',
overclock:'<path d="M3.5 17a8.5 8.5 0 1 1 17 0"/><path d="M12 17l4.2-6"/><circle cx="12" cy="17" r="1.4" fill="currentColor"/><path d="M5.5 11.2l1.4 1M12 7.5v1.6M18.5 11.2l-1.4 1"/><path d="M3.5 20.5h17"/>',
glasscannon:'<path d="M12 2.5l8 6.5-8 12.5L4 9z"/><path d="M4 9h16M9 9l3 12.5M15 9l-3 12.5"/><path d="M12 2.5L9 9M12 2.5L15 9" />',
ironwill:'<path d="M4 15a8 8 0 0 1 16 0v4H4z"/><path d="M4 15h16"/><path d="M8.5 15v4M15.5 15v4"/><path d="M12 7.2V15"/>',
deathwish:'<path d="M12 3C7.4 3 4.5 6 4.5 10c0 2.6 1.3 4.2 3 5.2V19h9v-3.8c1.7-1 3-2.6 3-5.2C19.5 6 16.6 3 12 3z"/><circle cx="9" cy="10.5" r="1.9"/><circle cx="15" cy="10.5" r="1.9"/><path d="M12 13.2l-1 2h2zM10 19v-2.3M12 19v-2.3M14 19v-2.3"/>'
};
function _armIcon(id, size){
const body = ARMORY_ICONS[id];
if(!body) return '';
return `<svg class="arm-svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}
$profiler._shopHpRegen = false;
$profiler._shopXpMult = 1.0;
$profiler._shopAirstrike = false;
$profiler._shopOverclock = false;
$profiler._shopGlassCannon = false;
$profiler._shopScavenger = false;
$profiler._shopLaserSight = false;
$profiler._shopNapalm = false;
$profiler._shopBlastArmor = false;
$profiler._shopMedic = false;
let _shopDrone = false;
$profiler._shopDeathWish = false;
$profiler._shopNapalmClipUsed = false;
$profiler._medicUsed = false;
function _getArmoryLoadout(){
try{ return JSON.parse(localStorage.getItem('diy_armory')||'{}'); }catch(e){ return {}; }
}
function _saveArmoryLoadout(obj){
try{ localStorage.setItem('diy_armory', JSON.stringify(obj)); }catch(e){}
}
function applyShopLoadout(){
$profiler._shopHpRegen=false; $profiler._shopXpMult=1.0; $profiler._shopAirstrike=false; $profiler._shopOverclock=false; $profiler._shopGlassCannon=false;
$profiler._shopScavenger=false; $profiler._shopLaserSight=false; $profiler._shopNapalm=false; $profiler._shopBlastArmor=false;
$profiler._shopMedic=false; _shopDrone=false; $profiler._shopDeathWish=false;
$profiler._shopNapalmClipUsed=false; $profiler._medicUsed=false;
const loadout = _getArmoryLoadout();
const totalSpend = ARMORY_ITEMS.reduce((s,item)=>s+(loadout[item.id]||0)*item.cost, 0);
const totalItems = ARMORY_ITEMS.reduce((s,item)=>s+(loadout[item.id]||0), 0);
if(!totalItems) return;
_saveArmoryLoadout({});
ARMORY_ITEMS.forEach(item=>{
const qty = loadout[item.id]||0;
for(let i=0;i<qty;i++) item.apply($buildings.player);
});
if($profiler._shopAirstrike){
const pcBtn = document.getElementById('airstrike-btn-pc');
if(pcBtn) pcBtn.style.display = 'flex';
if($core.isMobile){
const btn = document.getElementById('btn-airstrike');
if(btn) btn.style.display = 'flex';
}
if(!$core.isMobile){
setTimeout(() => {
showIngameHint('▲ Airstrike ready — click the button or press Q', 5000, 1);
}, 800);
}
}
if(_shopDrone) _spawnShopDrone();
if($profiler._shopNapalm) $profiler._shopNapalmClipUsed = false;
renderArmory();
}
function renderArmory(){
const tokenEl = document.getElementById('armory-token-count');
const grid = document.getElementById('armory-grid');
const summary = document.getElementById('armory-loadout-summary');
const resetBtn = document.getElementById('armory-reset-btn');
if(!tokenEl||!grid) return;
tokenEl.textContent = $buildings.lifeTokens;
const loadout = _getArmoryLoadout();
const totalQueued = Object.values(loadout).reduce((s,q)=>s+q,0);
const totalCost = ARMORY_ITEMS.reduce((s,item)=>s+(loadout[item.id]||0)*item.cost,0);
grid.innerHTML = '';
let lastTier = 0;
const tierMeta = {1:['TIER I','CONSUMABLES'], 2:['TIER II','POWER-UPS'], 3:['TIER III','ASPIRATIONAL']};
const _tierCount = {1:0,2:0,3:0};
ARMORY_ITEMS.forEach(item=>{
if(item.tier !== lastTier){
lastTier = item.tier;
const sep = document.createElement('div');
sep.className = 'arm-tier';
sep.dataset.t = item.tier;
sep.innerHTML = `<span class="arm-tier-tag">${tierMeta[item.tier][0]}</span><span>${tierMeta[item.tier][1]}</span>`;
grid.appendChild(sep);
}
_tierCount[item.tier]++;
const qty = loadout[item.id]||0;
const canAfford = $buildings.lifeTokens - totalCost >= item.cost;
const atMax = qty >= item.max;
const active = qty > 0;
const buyable = canAfford && !atMax;
const sku = 'T'+item.tier+'-'+String(_tierCount[item.tier]).padStart(2,'0');
let pips = '';
if(item.max > 1){ for(let i=0;i<item.max;i++) pips += `<i class="${i<qty?'on':''}"></i>`; }
else { pips = `<i class="${active?'on':''}"></i>`; }
const status = active ? (item.max===1 ? 'ARMED' : (atMax ? 'MAXED' : '+ ADD')) : (buyable ? 'ACQUIRE' : 'LOCKED');
const card = document.createElement('div');
card.dataset.shopId = item.id;
card.dataset.t = item.tier;
card.tabIndex = 0;
card.setAttribute('role','button');
card.className = 'arm-card' + (active?' is-active':'') + ((!buyable && !active)?' is-locked':'') + (item.id==='deathwish'?' is-danger':'');
card.innerHTML = `
<span class="arm-bar"></span><span class="arm-shine"></span>${(!buyable&&!active)?'<span class="arm-body-hatch"></span>':''}
<div class="arm-top"><span class="arm-sku">${sku}</span><span class="arm-pips">${pips}</span></div>
<div class="arm-main">
<div class="arm-ico">${_armIcon(item.id,30)}</div>
<div class="arm-txt"><div class="arm-name">${item.name}</div>
<div class="arm-desc">${item.desc}</div></div>
</div>
<div class="arm-foot">
<div class="arm-cost">¤${item.cost}<small>${item.cost===1?'TOKEN':'TOKENS'}</small></div>
<div class="arm-status">${status}</div>
</div>`;
grid.appendChild(card);
});
if(totalQueued===0){
summary.textContent='— NO BONUSES SELECTED —';
resetBtn.style.display='none';
} else {
summary.innerHTML = ARMORY_ITEMS
.filter(item=>(loadout[item.id]||0)>0)
.map(item=>`<span style="display:inline-flex;align-items:center;gap:6px;">${_armIcon(item.id,13)}${item.name}${item.max>1&&loadout[item.id]>1?' ×'+loadout[item.id]:''}</span>`)
.join('<br>');
summary.innerHTML += `<br><span style="color:#ffcc00;margin-top:4px;display:block;">¤ COST: ${totalCost} TOKEN${totalCost!==1?'S':''} &nbsp;·&nbsp; YOU HAVE ${$buildings.lifeTokens}</span>`;
resetBtn.style.display='inline-block';
}
grid.querySelectorAll('[data-shop-id]').forEach(card=>{
let _touchMoved = false;
card.addEventListener('touchstart', e=>{ _touchMoved=false; e.stopPropagation(); }, {passive:true});
card.addEventListener('touchmove', ()=>{ _touchMoved=true; }, {passive:true});
card.addEventListener('touchend', e=>{
if(_touchMoved) return;
e.preventDefault();
handleArmoryCardTap(card);
}, {passive:false});
card.addEventListener('click', ()=>{ handleArmoryCardTap(card); });
card.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); handleArmoryCardTap(card); } });
});
const _aimModal = document.getElementById('armory-item-modal');
const _aimIcon = document.getElementById('aim-icon');
const _aimTitle = document.getElementById('aim-title');
const _aimDesc = document.getElementById('aim-desc');
const _aimCost = document.getElementById('aim-cost');
const _aimBalance = document.getElementById('aim-balance');
const _aimAfter = document.getElementById('aim-after');
const _aimAccept = document.getElementById('aim-accept');
const _aimReject = document.getElementById('aim-reject');
let _aimPendingId = null;
function _openArmoryModal(item){
if(!_aimModal) return;
_aimPendingId = item.id;
const lo = _getArmoryLoadout();
const qty = lo[item.id]||0;
const spent = ARMORY_ITEMS.reduce((s,i)=>s+(lo[i.id]||0)*i.cost,0);
const canAfford = $buildings.lifeTokens - spent >= item.cost;
const isMaxed = qty >= item.max;
const isQueued = qty > 0;
_aimIcon.innerHTML = _armIcon(item.id,56);
_aimTitle.textContent = item.name;
_aimDesc.textContent = item.desc;
if(isMaxed && isQueued){
_aimCost.textContent = 'ALREADY SELECTED';
_aimCost.style.color = '#aaff00';
_aimBalance.textContent = '';
_aimAfter.textContent = '';
_aimAfter.closest('#aim-after-row').style.display = 'none';
_aimAccept.textContent = 'X REMOVE';
_aimAccept.style.background = 'linear-gradient(135deg,#3a0000,#660000)';
_aimAccept.style.borderColor = '#ff4400';
_aimAccept.style.color = '#ff4400';
_aimAccept.disabled = false;
} else {
const afterBalance = $buildings.lifeTokens - spent - item.cost;
_aimCost.textContent = `¤ ${item.cost} TOKEN${item.cost!==1?'S':''}`;
_aimCost.style.color = '#ffcc00';
_aimBalance.textContent = `You have: ${$buildings.lifeTokens - spent}`;
_aimAfter.textContent = `${afterBalance} token${afterBalance!==1?'s':''}`;
_aimAfter.closest('#aim-after-row').style.display = '';
_aimAccept.textContent = 'OK ACCEPT';
_aimAccept.style.background = 'linear-gradient(135deg,#1a4000,#2a6800)';
_aimAccept.style.borderColor = '#aaff00';
_aimAccept.style.color = '#aaff00';
_aimAccept.disabled = !canAfford;
}
_aimModal.classList.add('open');
}
function _closeArmoryModal(){ _aimModal && _aimModal.classList.remove('open'); _aimPendingId=null; }
if(_aimAccept){
_aimAccept.addEventListener('click', ()=>{
audioManager.uiClick();
if(!_aimPendingId) return;
const item = ARMORY_ITEMS.find(i=>i.id===_aimPendingId);
if(!item){ _closeArmoryModal(); return; }
const lo = _getArmoryLoadout();
const qty = lo[item.id]||0;
if(qty >= item.max){
lo[item.id] = 0;
$buildings.lifeTokens += item.cost * qty;
try{ localStorage.setItem('diy_tokens', String($buildings.lifeTokens)); }catch(e){}
} else {
if($buildings.lifeTokens < item.cost){
showPickupMsg('! NOT ENOUGH TOKENS','#ff4400');
_closeArmoryModal();
return;
}
lo[item.id] = qty + 1;
$buildings.lifeTokens = Math.max(0, $buildings.lifeTokens - item.cost);
try{ localStorage.setItem('diy_tokens', String($buildings.lifeTokens)); }catch(e){}
showPickupMsg(`¤ -${item.cost} TOKEN${item.cost!==1?'S':''} — ${$buildings.lifeTokens} REMAINING`, '#ffcc00');
}
_saveArmoryLoadout(lo);
_closeArmoryModal();
renderArmory();
});
}
if(_aimReject){
_aimReject.addEventListener('click', ()=>{
audioManager.uiClick();
_closeArmoryModal();
});
}
if(_aimModal){
_aimModal.addEventListener('click', e=>{ if(e.target===_aimModal){ audioManager.uiClick(); _closeArmoryModal(); } });
}
function handleArmoryCardTap(card){
audioManager.uiClick();
const id = card.dataset.shopId;
const item = ARMORY_ITEMS.find(i=>i.id===id);
if(!item) return;
_openArmoryModal(item);
return;
}
resetBtn.onclick=()=>{
audioManager.uiClick();
_saveArmoryLoadout({});
renderArmory();
};
}
document.getElementById('armory-tab')?.addEventListener('click',()=>{
renderArmory();
});
const _origApplyPerks = $profiler.applyPersistentPerks;
$profiler.applyPersistentPerks = function(){
_origApplyPerks();
applyShopLoadout();
};
window.applyPersistentPerks = $profiler.applyPersistentPerks;
window.initGame = initGame;
window.playerUpgrades = $psycho2.playerUpgrades;
window.wepUpgrades = $buildings.wepUpgrades;
window.wepUpgradeCount = $psycho2.wepUpgradeCount;
window.gameReady = false;
function bootGame(){
const bar = el('loader-bar');
const status= el('loader-status');
const tip = el('loader-tip');
const loader= el('loader');
tip.textContent = LOAD_TIPS[Math.floor(Math.random()*LOAD_TIPS.length)];
const steps = [
[5, '[ GHOST REYES ] Nova City is dark. Moving to contact.'],
[20, '[ INTEL ] NEXUS patrols heavier than expected.'],
[40, '[ GHOST REYES ] Weapons check. All systems nominal.'],
[58, '[ COMMAND ] Enemy forces confirmed in sector. Stay sharp.'],
[72, '[ GHOST REYES ] They sold Boloshie Land. We\'re taking it back.'],
[85, '[ INTEL ] Vreth alliance holding the eastern grid. Watch the skies.'],
[95, '[ COMMAND ] All units — this is not a drill. Deploy on my mark.'],
[100,'[ GHOST REYES ] Moving in. Let\'s end this.'],
];
let i = 0;
function nextStep(){
if(i >= steps.length){
try {
resize();
if(typeof renderLB==='function') try{ renderLB(); }catch(_e){}
try{
const _hasPlayed = !!localStorage.getItem('diy_played');
const _hasTier = localStorage.getItem('diy_unlock_tier') !== null;
if(_hasPlayed && !_hasTier) localStorage.setItem('diy_unlock_tier', '3');
}catch(e){}
applyMenuOnboarding();
if(!$core.isMobile){
['kills','score'].forEach(key=>{
const box = key==='kills'
? document.querySelector('#hud .hud-box:nth-child(3)')
: document.querySelector('#hud .hud-box:nth-child(4)');
if(!box) return;
box.classList.add('collapsible');
box.title = 'Click to collapse';
try{ if(localStorage.getItem('diy_hud_collapsed_'+key)==='true') box.classList.add('collapsed'); }catch(e){}
box.addEventListener('click', ()=>{
box.classList.toggle('collapsed');
try{ localStorage.setItem('diy_hud_collapsed_'+key, box.classList.contains('collapsed')); }catch(e){}
});
});
}
} catch(e) {
console.error('Init error:', e);
}
window.gameReady = true;
setTimeout(()=>{
loader.classList.add('fade-out');
const loaderLogo = document.getElementById('loader-logo');
if(loaderLogo){
loaderLogo.style.animation = 'none';
loaderLogo.style.textShadow = 'none';
}
setTimeout(()=>{
loader.style.display='none';
if(loaderLogo) loaderLogo.style.cssText = '';
}, 650);
}, 320);
return;
}
const [pct, label] = steps[i++];
bar.style.width = pct + '%';
status.textContent = label;
setTimeout(nextStep, 80 + Math.random()*180);
}
setTimeout(nextStep, 300);
}
(function(){
const splash = document.getElementById('audio-unlock-splash');
const enableBtn = document.getElementById('aus-enable-btn');
const skipBtn = document.getElementById('aus-skip-btn');
if(!splash) return;
const _isMobileDevice = /Android|iPhone|iPad|iPod|Touch/i.test(navigator.userAgent) || ('ontouchstart' in window);
const _alreadyUnlocked = (() => { try{ return localStorage.getItem('diy_audio_unlocked')==='1'; }catch(e){return false;} })();
if(!_isMobileDevice || _alreadyUnlocked) return;
const _aubCheckReady = setInterval(() => {
if(window.gameReady) {
clearInterval(_aubCheckReady);
if(!audioManager._aubDismissed) splash.classList.add('active');
}
}, 100);
function _doUnlock(withSound){
splash.classList.remove('active');
if(withSound){
try{
if(!audioManager.audioContext){
audioManager.audioContext = new (window.AudioContext||window.webkitAudioContext)();
}
const ctx = audioManager.audioContext;
const applyEnabled = () => {
audioManager._aubDismissed = true;
audioManager.enabled = true;
const tog = document.getElementById('snd-toggle');
if(tog){ tog.dataset.on='true'; const tv=tog.querySelector('.toggle-val'); if(tv) tv.textContent='ON'; }
try{ localStorage.setItem('diy_set_snd','1'); }catch(ex){}
};
if(ctx.state === 'suspended'){
ctx.resume().then(() => {
try {
const buf = ctx.createBuffer(1, 1, 22050);
const src = ctx.createBufferSource();
src.buffer = buf;
src.connect(ctx.destination);
src.start();
} catch(ex) {}
applyEnabled();
}).catch(err => {
audioManager._aubDismissed = true;
console.warn('AudioContext.resume() blocked:', err);
});
} else {
applyEnabled();
}
}catch(e){}
} else {
audioManager.enabled = false;
audioManager._aubDismissed = true;
}
try{ localStorage.setItem('diy_audio_unlocked','1'); }catch(e){}
}
splash.addEventListener('touchstart', e => {
if (e.target === skipBtn) return;
e.preventDefault();
_doUnlock(true);
}, { passive: false, once: true });
enableBtn.addEventListener('click', ()=> _doUnlock(true), {once:true});
enableBtn.addEventListener('touchstart', e=>{ e.preventDefault(); _doUnlock(true); }, {passive:false, once:true});
skipBtn.addEventListener('click', ()=> _doUnlock(false), {once:true});
skipBtn.addEventListener('touchstart', e=>{ e.preventDefault(); _doUnlock(false); }, {passive:false, once:true});
const _ausProgress = document.getElementById('aus-progress');
const _ausIcon = document.getElementById('aus-icon');
const _origDoUnlock = _doUnlock;
function _doUnlockWithFeedback(withSound) {
if (withSound && _ausProgress) {
_ausProgress.style.display = 'block';
requestAnimationFrame(() => { _ausProgress.style.width = '100%'; });
if (_ausIcon) _ausIcon.textContent = '';
}
setTimeout(() => _origDoUnlock(withSound), withSound ? 420 : 0);
}
enableBtn.addEventListener('click', ()=> _doUnlockWithFeedback(true), {once:true});
enableBtn.addEventListener('touchstart', e=>{ e.preventDefault(); _doUnlockWithFeedback(true); }, {passive:false, once:true});
})();
bootGame();
(function(){
try {
const hasData = localStorage.getItem('diy_leaderboard') ||
localStorage.getItem('diy_tokens') ||
localStorage.getItem('diy_daily') ||
localStorage.getItem('diy_xp');
if(hasData) return;
setTimeout(()=>{
const banner = document.createElement('div');
banner.id = 'no-save-banner';
banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:linear-gradient(135deg,rgba(60,30,0,0.97),rgba(30,10,0,0.99));border-top:2px solid #ffaa00;padding:14px 18px;font-family:\'Share Tech Mono\',monospace;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;box-shadow:0 -4px 20px rgba(255,140,0,0.3);';
banner.innerHTML = `
<div style="flex:1;min-width:200px;">
<div style="color:#ffcc00;font-size:11px;letter-spacing:2px;margin-bottom:4px;">! NO SAVE DATA FOUND ON THIS PC</div>
<div style="color:#888;font-size:9px;letter-spacing:1px;line-height:1.8;">Progress (scores, tokens, challenges) is stored per browser/PC.<br>If you played on another PC, go to <span style="color:#aaff00;">MORE -> SAVE DATA</span> and import your file.</div>
</div>
<div style="display:flex;gap:8px;flex-shrink:0;">
<button onclick="document.querySelector('.more-tab')&&document.querySelector('[data-pane=settings]')&&document.querySelector('[data-pane=settings]').click();document.getElementById('no-save-banner').remove();" style="background:linear-gradient(135deg,#1a4000,#2a6600);border:2px solid #aaff00;color:#aaff00;font-family:\'Share Tech Mono\',monospace;font-size:10px;letter-spacing:2px;padding:10px 16px;cursor:pointer;">GO TO SAVE DATA</button>
<button onclick="document.getElementById('no-save-banner').remove();try{localStorage.setItem('diy_no_save_dismissed','1');}catch(e){}" style="background:transparent;border:1px solid #444;color:#555;font-family:\'Share Tech Mono\',monospace;font-size:9px;padding:10px 14px;cursor:pointer;">DISMISS</button>
</div>`;
document.body.appendChild(banner);
}, 1800);
} catch(e){}
})();
const touchControls = el('touch-controls');
const joyZone = el('joy-zone');
const joyBase = el('joy-base');
const joyKnob = el('joy-knob');
const aimZone = el('aim-zone');
const aimJoyBase = el('aim-joy-base');
const aimJoyKnob = el('aim-joy-knob');
const portraitWarn = el('portrait-warn');
$profiler.joyActive = false; let joyId = null;
let joyOriginX = 0, joyOriginY = 0;
$profiler.joyDX = 0; $profiler.joyDY = 0;
const JOY_RADIUS = 52;
let aimActive = false, aimId = null;
$profiler.autoFireInterval = null;
function stopAutoFire(){
if($profiler.autoFireInterval){clearInterval($profiler.autoFireInterval);$profiler.autoFireInterval=null;}
}
function showTouchControls(show) {
const uiOpen = isMenuSurfaceOpen() ||
$replay.pauseOverlay.classList.contains('active') ||
el('upgrade-panel').style.display!=='none';
const actualShow = show && !uiOpen;
touchControls.style.display = actualShow ? 'block' : 'none';
if(actualShow) setTimeout(resetKnob, 0);
if(actualShow) setTimeout(resetAimKnob, 0);
if(!document.body.classList.contains('mobile-minimal-hud')){
el('weapon-hud').style.display = actualShow ? 'none' : 'block';
el('xp-hud').style.display = actualShow ? 'none' : 'block';
el('grenade-hud').style.display = actualShow ? 'none' : 'block';
}
el('pause-btn').style.display = 'none';
if(actualShow) updateCycleBtn();
if(actualShow && !_aimHintShown) _showAimHint();
showHudToggle(actualShow);
if(actualShow && window.innerWidth < 420 && window.innerHeight > window.innerWidth){
setHudCollapsed(true);
}
}
window.showTouchControls = showTouchControls;
function checkOrientation() {
if (!$core.isMobile) return;
const isPortrait = window.innerHeight > window.innerWidth;
const tooNarrow = isPortrait && window.innerWidth < 360;
portraitWarn.style.display = tooNarrow ? 'flex' : 'none';
}
function updateAimZoneSize() {
const aimZone = document.getElementById('aim-zone');
if(!aimZone) return;
const isNarrow = window.innerHeight / window.innerWidth > 1.8;
aimZone.style.width = isNarrow ? '65%' : '58%';
}
if ($core.isMobile) {
showTouchControls(true);
checkOrientation();
updateAimZoneSize();
window.addEventListener('resize', checkOrientation);
window.addEventListener('resize', updateAimZoneSize);
window.addEventListener('orientationchange', () => setTimeout(() => { checkOrientation(); updateAimZoneSize(); }, 200));
document.body.style.touchAction = 'none';
}
function getJoyCenter() {
const r = joyBase.getBoundingClientRect();
return { x: r.left + r.width/2, y: r.top + r.height/2 };
}
function setKnobPos(cx, cy, dx, dy) {
const tc = touchControls.getBoundingClientRect();
joyKnob.style.left = (cx - tc.left + dx) + 'px';
joyKnob.style.top = (cy - tc.top + dy) + 'px';
}
function resetKnob() {
const jc = getJoyCenter();
setKnobPos(jc.x, jc.y, 0, 0);
$profiler.joyDX = 0; $profiler.joyDY = 0;
}
function getAimJoyCenter() {
const r = aimJoyBase.getBoundingClientRect();
return { x: r.left + r.width/2, y: r.top + r.height/2 };
}
function setAimKnobPos(cx, cy, dx, dy) {
const tc = touchControls.getBoundingClientRect();
aimJoyKnob.style.left = (cx - tc.left + dx) + 'px';
aimJoyKnob.style.top = (cy - tc.top + dy) + 'px';
}
function resetAimKnob() {
const ac = getAimJoyCenter();
setAimKnobPos(ac.x, ac.y, 0, 0);
}
joyBase.addEventListener('touchstart', e => {
e.preventDefault();
try{ if(typeof vibrate==='function') vibrate(6); }catch(_e){}
joyBase.classList.add('joy-active');
const t = e.changedTouches[0];
if(t.identifier === aimId){ aimActive=false; aimId=null; stopAutoFire(); if(aimJoyBase) aimJoyBase.classList.remove('joy-active'); resetAimKnob(); }
// Dynamic Floating Joystick repositioning
if(joyBase && t.clientX < window.innerWidth * 0.48) {
  const tc = touchControls.getBoundingClientRect();
  joyBase.style.left = (t.clientX - tc.left - JOY_RADIUS) + 'px';
  joyBase.style.top = (t.clientY - tc.top - JOY_RADIUS) + 'px';
  joyBase.style.bottom = 'auto';
}
$profiler.joyActive = true;
joyId = t.identifier;
$profiler.joyDX = 0; $profiler.joyDY = 0;
$profiler.lastInputScheme = 'touch';
const jc = getJoyCenter();
let dx = t.clientX - jc.x;
let dy = t.clientY - jc.y;
const dist = Math.hypot(dx, dy);
if(dist > JOY_RADIUS){ dx = dx/dist*JOY_RADIUS; dy = dy/dist*JOY_RADIUS; }
$profiler.joyDX = dx/JOY_RADIUS; $profiler.joyDY = dy/JOY_RADIUS;
setKnobPos(jc.x, jc.y, dx, dy);
}, {passive: false});
joyBase.addEventListener('touchmove', e => {
e.preventDefault();
for(let t of e.changedTouches){
if(t.identifier !== joyId) continue;
const jc = getJoyCenter();
let dx = t.clientX - jc.x;
let dy = t.clientY - jc.y;
const dist = Math.hypot(dx, dy);
const INNER_DEADZONE = 6;
if(dist < INNER_DEADZONE) {
$profiler.joyDX = 0; $profiler.joyDY = 0;
setKnobPos(jc.x, jc.y, 0, 0);
return;
}
const clampedDist = Math.min(dist, JOY_RADIUS);
dx = dx / dist * clampedDist;
dy = dy / dist * clampedDist;
const rawMag = clampedDist / JOY_RADIUS;
const curvedMag = rawMag * rawMag;
$profiler.joyDX = (dx / clampedDist) * curvedMag;
$profiler.joyDY = (dy / clampedDist) * curvedMag;
setKnobPos(jc.x, jc.y, dx, dy);
}
}, {passive: false});
function joyEnd(e) {
for(let t of e.changedTouches){
if(t.identifier === joyId){
$profiler.joyActive=false; joyId=null; $profiler.joyDX=0; $profiler.joyDY=0;
resetKnob();
$buildings.keys['KeyW']=false;$buildings.keys['KeyS']=false;$buildings.keys['KeyA']=false;$buildings.keys['KeyD']=false;
}
}
if(e.touches.length===0){
$profiler.joyActive=false; joyId=null; $profiler.joyDX=0; $profiler.joyDY=0;
resetKnob();
$buildings.keys['KeyW']=false;$buildings.keys['KeyS']=false;$buildings.keys['KeyA']=false;$buildings.keys['KeyD']=false;
}
}
joyBase.addEventListener('touchend', joyEnd, {passive:false});
joyBase.addEventListener('touchcancel', joyEnd, {passive:false});
document.addEventListener('touchend', () => { if(!$profiler.joyActive) joyBase.classList.remove('joy-active'); }, {passive:true});
document.addEventListener('touchcancel', () => { joyBase.classList.remove('joy-active'); }, {passive:true});
document.addEventListener('touchmove', e => {
if(!$profiler.joyActive || joyId===null) return;
for(let t of e.touches){
if(t.identifier===joyId){
const jc = getJoyCenter();
let dx = t.clientX - jc.x;
let dy = t.clientY - jc.y;
const dist = Math.hypot(dx,dy);
if(dist>JOY_RADIUS){dx=dx/dist*JOY_RADIUS;dy=dy/dist*JOY_RADIUS;}
$profiler.joyDX=dx/JOY_RADIUS; $profiler.joyDY=dy/JOY_RADIUS;
setKnobPos(jc.x, jc.y, dx, dy);
}
}
},{passive:true});
document.addEventListener('touchend', e=>{
if(!$profiler.joyActive||joyId===null) return;
for(let t of e.changedTouches){
if(t.identifier===joyId){
$profiler.joyActive=false;joyId=null;$profiler.joyDX=0;$profiler.joyDY=0;
resetKnob();
$buildings.keys['KeyW']=false;$buildings.keys['KeyS']=false;$buildings.keys['KeyA']=false;$buildings.keys['KeyD']=false;
}
}
},{passive:true});
document.addEventListener('touchcancel',e=>{
if(e.touches.length===0){
$profiler.joyActive=false;joyId=null;$profiler.joyDX=0;$profiler.joyDY=0;
resetKnob();
$buildings.keys['KeyW']=false;$buildings.keys['KeyS']=false;$buildings.keys['KeyA']=false;$buildings.keys['KeyD']=false;
aimActive=false;aimId=null;stopAutoFire();
if(aimJoyBase) aimJoyBase.classList.remove('joy-active');
resetAimKnob();
}
},{passive:true});
const _aimReticle = el('aim-reticle');
const _aimHintLabel = el('aim-hint-label');
let _aimHintShown = false;
let _aimHintTO = null;
function _showAimHint(){
if(_aimHintShown || !_aimHintLabel) return;
_aimHintLabel.style.display='flex';
_aimHintTO = setTimeout(()=>{
_aimHintLabel.style.opacity='1';
setTimeout(()=>{ _aimHintLabel.style.opacity='0'; setTimeout(()=>{ _aimHintLabel.style.display='none'; },500); },2500);
},400);
_aimHintShown=true;
}
const AIM_JOY_RADIUS = 52;
aimJoyBase.addEventListener('touchstart', e => {
e.preventDefault();
try{ if(typeof vibrate==='function') vibrate(6); }catch(_e){}
for(let t of e.changedTouches){
if(t.identifier === joyId) continue;
if(aimActive) continue;
aimActive = true;
aimId = t.identifier;
aimJoyBase.classList.add('joy-active');
const ac = getAimJoyCenter();
let dx = t.clientX - ac.x, dy = t.clientY - ac.y;
const dist = Math.hypot(dx, dy);
if(dist > AIM_JOY_RADIUS){ dx = dx/dist*AIM_JOY_RADIUS; dy = dy/dist*AIM_JOY_RADIUS; }
setAimKnobPos(ac.x, ac.y, dx, dy);
updateAim(dx, dy, dist);
if(_aimHintLabel){ _aimHintLabel.style.opacity='0'; clearTimeout(_aimHintTO); setTimeout(()=>{ _aimHintLabel.style.display='none'; },500); }
if($buildings.settingFireOnAim && $buildings.state==='playing' && !$buildings.isPaused){
stopAutoFire();
if($buildings.curWep!=='rpg') fire();
$profiler.autoFireInterval = setInterval(()=>{
if($buildings.state==='playing' && !$buildings.isPaused && aimActive){
if($buildings.curWep!=='rpg') fire();
} else { stopAutoFire(); }
}, 70);
}
}
}, {passive: false});
aimJoyBase.addEventListener('touchmove', e => {
e.preventDefault();
for(let t of e.changedTouches){
if(t.identifier !== aimId) continue;
const ac = getAimJoyCenter();
let dx = t.clientX - ac.x, dy = t.clientY - ac.y;
const dist = Math.hypot(dx, dy);
const clampedDist = Math.min(dist, AIM_JOY_RADIUS);
if(dist > 0){ dx = dx/dist*clampedDist; dy = dy/dist*clampedDist; }
setAimKnobPos(ac.x, ac.y, dx, dy);
updateAim(dx, dy, clampedDist);
}
}, {passive: false});
const _fireBtn = el('btn-fire');
function _fireBtnDown(e){
e.preventDefault();
if($buildings.settingFireOnAim) return;
if($buildings.state!=='playing'||$buildings.isPaused) return;
_fireBtn.style.background='rgba(255,60,0,0.32)';
_fireBtn.style.borderColor='rgba(255,100,0,1)';
stopAutoFire();
fire();
$profiler.autoFireInterval = setInterval(()=>{
if($buildings.state==='playing'&&!$buildings.isPaused){
if($buildings.curWep!=='rpg') fire();
}
}, 80);
}
function _fireBtnUp(e){
_fireBtn.style.background='rgba(255,60,0,0.13)';
_fireBtn.style.borderColor='rgba(255,80,0,0.7)';
stopAutoFire();
}
if(_fireBtn){
_fireBtn.addEventListener('touchstart', _fireBtnDown, {passive:false});
_fireBtn.addEventListener('touchend', _fireBtnUp, {passive:true});
_fireBtn.addEventListener('touchcancel',_fireBtnUp, {passive:true});
_fireBtn.addEventListener('mousedown', _fireBtnDown);
_fireBtn.addEventListener('mouseup', _fireBtnUp);
}
(function(){
try{
if(!touchControls||!joyBase||!aimJoyBase) return;
const PAD=22;
const mk=id=>{const d=document.createElement('div');d.id=id;d.style.cssText='position:absolute;z-index:2;pointer-events:auto;touch-action:none;background:transparent;-webkit-tap-highlight-color:transparent;display:none;';touchControls.insertBefore(d,touchControls.firstChild);return d;};
const jh=mk('joy-hit'), ah=mk('aim-hit');
const sync=()=>{
const tc=touchControls.getBoundingClientRect();
[[jh,joyBase],[ah,aimJoyBase]].forEach(([h,b])=>{
const r=b.getBoundingClientRect();
if(!r.width){h.style.display='none';return;}
h.style.display='block';
h.style.left=(r.left-tc.left-PAD)+'px';h.style.top=(r.top-tc.top-PAD)+'px';
h.style.width=(r.width+PAD*2)+'px';h.style.height=(r.height+PAD*2)+'px';
});
};
const fwd=(h,b)=>['touchstart','touchmove','touchend','touchcancel'].forEach(type=>h.addEventListener(type,e=>{
e.preventDefault();
try{ b.dispatchEvent(new TouchEvent(type,{touches:Array.from(e.touches),targetTouches:Array.from(e.targetTouches),changedTouches:Array.from(e.changedTouches),cancelable:true,bubbles:false})); }catch(_e){}
},{passive:false}));
fwd(jh,joyBase); fwd(ah,aimJoyBase);
sync();
window.addEventListener('resize',sync);
window.addEventListener('orientationchange',()=>setTimeout(sync,250));
if(window.ResizeObserver){const ro=new ResizeObserver(sync);ro.observe(joyBase);ro.observe(aimJoyBase);}
setTimeout(sync,600);
}catch(_e){}
})();
(function(){
  const _psychoBtn = document.getElementById('btn-psycho');
  if (!_psychoBtn) return;
  function _syncPsychoBtn() {
    if (typeof $psycho1._psychoCooldown === 'undefined') return;
    const ready = $psycho1._psychoCooldown <= 0 && !$psycho1._psychoActive;
    const active = typeof $psycho1._psychoActive !== 'undefined' && $psycho1._psychoActive;
    _psychoBtn.style.display = (typeof $buildings.state !== 'undefined' && $buildings.state === 'playing') ? 'flex' : 'none';
    const _actionBtnsCol = document.getElementById('action-btns');
    if (_actionBtnsCol) _actionBtnsCol.classList.toggle('has-psycho', _psychoBtn.style.display === 'flex');
    _psychoBtn.style.borderColor = active ? 'rgba(255,0,255,0.9)' : ready ? 'rgba(255,0,255,0.5)' : 'rgba(80,0,80,0.3)';
    _psychoBtn.style.color = active ? '#ff00ff' : ready ? '#ff00ff' : '#440044';
    _psychoBtn.classList.toggle('psycho-ready', ready && !active);
  }
  _psychoBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (typeof $psycho1._psychoActive === 'undefined') return;
    if ($psycho1._psychoActive) deactivatePsychoMode(); else activatePsychoMode();
  }, {passive: false});
  _psychoBtn.addEventListener('click', () => {
    if (typeof $psycho1._psychoActive === 'undefined') return;
    if ($psycho1._psychoActive) deactivatePsychoMode(); else activatePsychoMode();
  });
  setInterval(function(){ if (document.hidden) return; if ($buildings.state !== 'playing' && _psychoBtn.style.display === 'none') return; _syncPsychoBtn(); }, 200);
})();
(function(){
const isMobile = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
if(!isMobile) return;
document.body.classList.add('mobile-minimal-hud');
['hud','hud-mini','hud-toggle','weapon-hud','xp-hud','grenade-hud','stat-chip','mut-pill-strip','wep-grenade-hud','wep-active-pill','wep-switcher'].forEach(id=>{
const elToHide = document.getElementById(id);
if(elToHide) elToHide.style.display = 'none';
});
const _mhudPsycho = document.getElementById('btn-psycho');
const _mhudLeftStack = document.getElementById('left-action-stack');
const _mhudAvReload = document.getElementById('av-reload');
if(_mhudPsycho && _mhudLeftStack && _mhudAvReload){
_mhudLeftStack.insertBefore(_mhudPsycho, _mhudAvReload);
}
const _mhudTab = document.getElementById('mhud-drawer-tab');
const _mhudClose = document.getElementById('mhud-drawer-close');
if(_mhudTab) _mhudTab.addEventListener('touchstart', e => { e.preventDefault(); openMinimalHudDrawer(); }, {passive:false});
if(_mhudTab) _mhudTab.addEventListener('click', openMinimalHudDrawer);
if(_mhudClose) _mhudClose.addEventListener('touchstart', e => { e.preventDefault(); closeMinimalHudDrawer(); }, {passive:false});
if(_mhudClose) _mhudClose.addEventListener('click', closeMinimalHudDrawer);
const eid = id => document.getElementById(id);
function updateFirePulse(){
const fb = eid('btn-fire');
if(!fb) return;
const ammo = (typeof $buildings.wepAmmo !== 'undefined' && typeof $buildings.curWep !== 'undefined') ? ($buildings.wepAmmo[$buildings.curWep]||0) : 1;
fb.classList.toggle('has-ammo', ammo > 0);
}
function updateWaveChip(){
const chip = eid('wave-chip');
if(chip) chip.textContent = (typeof $buildings.wave !== 'undefined') ? $buildings.wave : 1;
}
const _pill = eid('wep-active-pill');
const _picker = eid('wep-picker-float');
const _pillIcon = eid('wep-pill-icon');
const _pillAmmo = eid('wep-pill-ammo-val');
let _pillLastIcon = null, _pillLastAmmo = null, _pillLastBlink = null;
let _pickerTimeout = null;
function showPill(){
if(_pill) _pill.style.display = 'flex';
const ws = eid('wep-switcher');
if(ws) ws.style.display = 'none';
}
function _applyPortraitWeaponMode(){
if(document.body.classList.contains('mobile-minimal-hud')) return;
const isPortrait = window.innerHeight > window.innerWidth;
if(isPortrait){
showPill();
}
}
_applyPortraitWeaponMode();
window.addEventListener('resize', _applyPortraitWeaponMode, {passive:true});
window.addEventListener('orientationchange', _applyPortraitWeaponMode, {passive:true});
function syncPill(){
if(!_pill) return;
const icon = (typeof WEP_ICONS_MAP !== 'undefined' && typeof $buildings.curWep !== 'undefined') ? (WEP_ICONS_MAP[$buildings.curWep]||'<svg class="ico"><use href="#ico-play"/></svg>') : '<svg class="ico"><use href="#ico-play"/></svg>';
const ammo = (typeof $buildings.wepAmmo !== 'undefined' && typeof $buildings.curWep !== 'undefined') ? ($buildings.wepAmmo[$buildings.curWep]||0) : '--';
if(icon !== _pillLastIcon){ if(_pillIcon) _pillIcon.innerHTML = icon; _pillLastIcon = icon; }
if(ammo !== _pillLastAmmo){ if(_pillAmmo) _pillAmmo.textContent = ammo; _pillLastAmmo = ammo; }
const shouldBlink = typeof ammo === 'number' && ammo <= 3 && ammo > 0 && (typeof $buildings.reloading !== 'undefined' ? !$buildings.reloading : false);
if(shouldBlink !== _pillLastBlink){
_pill.style.animation = shouldBlink ? 'lowAmmoBlink 0.4s ease-in-out 3' : '';
_pillLastBlink = shouldBlink;
}
}
function expandPicker(){
if(!_picker) return;
clearTimeout(_pickerTimeout);
_picker.innerHTML = '';
const owned = (typeof $buildings.WK !== 'undefined') ? $buildings.WK : [];
owned.forEach(wk => {
const icon = (typeof WEP_ICONS_MAP !== 'undefined') ? (WEP_ICONS_MAP[wk]||'<svg class="ico"><use href="#ico-play"/></svg>') : '<svg class="ico"><use href="#ico-play"/></svg>';
const ammo = (typeof $buildings.wepAmmo !== 'undefined') ? ($buildings.wepAmmo[wk]||0) : 0;
const isActive = (typeof $buildings.curWep !== 'undefined') && $buildings.curWep === wk;
const slot = document.createElement('div');
slot.className = 'wep-slot' + (isActive ? ' active' : '');
slot.innerHTML = `<span class="wep-slot-icon">${icon}</span><span class="wep-slot-ammo">${ammo}</span>`;
slot.setAttribute('data-wk', wk);
slot.addEventListener('touchstart', e => {
e.preventDefault();
const wkIdx = owned.indexOf(wk);
if(typeof switchWep === 'function' && wkIdx !== -1) switchWep(wkIdx);
else if(typeof $buildings.curWep !== 'undefined') { $buildings.curWep = wk; }
collapsePicker();
syncPill();
}, {passive:false});
_picker.appendChild(slot);
});
_picker.classList.add('open');
_pickerTimeout = setTimeout(collapsePicker, 3500);
}
function collapsePicker(){
if(_picker) _picker.classList.remove('open');
clearTimeout(_pickerTimeout);
}
if(_pill){
let _pillSwipeX = 0, _pillSwipeY = 0, _pillSwipeActive = false;
_pill.addEventListener('touchstart', e => {
_pillSwipeX = e.touches[0].clientX;
_pillSwipeY = e.touches[0].clientY;
_pillSwipeActive = true;
}, {passive:true});
_pill.addEventListener('touchmove', e => {
if(!_pillSwipeActive) return;
const dx = e.touches[0].clientX - _pillSwipeX;
const dy = e.touches[0].clientY - _pillSwipeY;
if(Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy) * 1.5){
_pillSwipeActive = false;
const owned = (typeof $buildings.WK !== 'undefined') ? $buildings.WK : [];
if(owned.length < 2) return;
const idx = owned.indexOf(typeof $buildings.curWep !== 'undefined' ? $buildings.curWep : owned[0]);
const nextIdx = dx < 0
? (idx + 1) % owned.length
: (idx - 1 + owned.length) % owned.length;
const next = owned[nextIdx];
if(typeof switchWep === 'function') switchWep(nextIdx);
else if(typeof $buildings.curWep !== 'undefined'){ $buildings.curWep = next; }
syncPill();
if(_pill){ _pill.style.borderColor='rgba(170,255,0,0.9)'; setTimeout(()=>{ _pill.style.borderColor=''; },300); }
} else if(Math.abs(dy) > 24 && Math.abs(dy) > Math.abs(dx) * 1.5){
_pillSwipeActive = false;
}
}, {passive:true});
_pill.addEventListener('touchend', e => {
const dx = Math.abs(e.changedTouches[0].clientX - _pillSwipeX);
if(_pillSwipeActive && dx < 12) {
expandPicker();
}
_pillSwipeActive = false;
}, {passive:true});
}
const _actionBarV = eid('action-bar-v');
if(_actionBarV){
_actionBarV.style.display = 'flex';
const oldBtns = eid('action-btns');
const oldReload = eid('btn-reload');
if(oldReload) oldReload.style.display = 'none';
const oldGrenade = eid('btn-grenade-left');
if(oldGrenade) oldGrenade.style.display = 'none';
}
let _barPeekTO = null;
function peekActionBar(){
if(!_actionBarV) return;
_actionBarV.classList.add('peek');
}
document.addEventListener('touchstart', e => {
if(!_actionBarV) return;
const vw = window.innerWidth;
for(let t of e.touches){
if(t.clientX > vw * 0.72) { peekActionBar(); break; }
}
}, {passive:true});
const _avNade = eid('av-nade');
if(_avNade){
_avNade.addEventListener('touchstart', e => {
e.preventDefault();
peekActionBar();
if(!aimActive && typeof $buildings.player !== 'undefined'){
const throwDist = 180;
$buildings.mouse.x = $buildings.player.x + Math.cos($buildings.player.angle) * throwDist;
$buildings.mouse.y = $buildings.player.y + Math.sin($buildings.player.angle) * throwDist;
}
if(typeof throwGrenade === 'function') throwGrenade();
}, {passive:false});
}
const _avReload = eid('av-reload');
if(_avReload){
_avReload.addEventListener('touchstart', e => {
e.preventDefault();
peekActionBar();
if(typeof startReload === 'function' && (typeof $buildings.reloading === 'undefined' || !$buildings.reloading)) startReload();
}, {passive:false});
}
const _avArmageddon = eid('av-armageddon');
if(_avArmageddon){
_avArmageddon.addEventListener('touchstart', e => {
e.preventDefault();
peekActionBar();
if(typeof armageddon === 'function') armageddon();
}, {passive:false});
}
const _btnArmageddonLegacy = eid('btn-armageddon');
if(_btnArmageddonLegacy){
_btnArmageddonLegacy.addEventListener('touchstart', e => {
e.preventDefault();
if(typeof armageddon === 'function') armageddon();
}, {passive:false});
}
const _avCycle = eid('av-cycle');
if(_avCycle){
_avCycle.addEventListener('touchstart', e => {
e.preventDefault();
peekActionBar();
if(typeof switchWep === 'function' && typeof $buildings.WK !== 'undefined' && typeof $buildings.curWep !== 'undefined'){
const next = ($buildings.WK.indexOf($buildings.curWep) + 1) % $buildings.WK.length;
switchWep(next);
if(typeof updateWepStrip === 'function') updateWepStrip();
if(typeof audioManager !== 'undefined') audioManager.uiClick();
}
}, {passive:false});
}
function updateNadeBadge(){
const badge = eid('av-nade-count');
if(badge && typeof $buildings.grenadeCount !== 'undefined') badge.textContent = $buildings.grenadeCount;
}
const _statChip = eid('stat-chip');
const _statLabel = eid('stat-chip-label');
const _statVal = eid('stat-chip-val');
const STAT_MODES = ['WAVE','KILLS','SCORE'];
let _statMode = 0;
if(_statChip && !document.body.classList.contains('mobile-minimal-hud')){
_statChip.style.display = 'flex';
setInterval(()=>{
if(typeof $buildings.state === 'undefined' || $buildings.state !== 'playing') return;
_statMode = (_statMode + 1) % STAT_MODES.length;
updateStatChip();
}, 6000);
}
function updateStatChip(){
if(!_statChip || !_statLabel || !_statVal) return;
const mode = STAT_MODES[_statMode];
_statLabel.textContent = mode;
if(mode === 'WAVE') _statVal.textContent = (typeof $buildings.wave !== 'undefined') ? $buildings.wave : 1;
if(mode === 'KILLS') _statVal.textContent = (typeof $buildings.totalKills !== 'undefined') ? $buildings.totalKills : 0;
if(mode === 'SCORE') _statVal.textContent = (typeof $buildings.score !== 'undefined') ? $buildings.score : 0;
}
function showStatChip(show){
if(!_statChip) return;
_statChip.classList.toggle('visible', show);
}
const _joyBase = eid('joy-base');
const JOY_SIZES = ['joy-sm','joy-md','joy-lg'];
const JOY_LABELS = ['SMALL','NORMAL','LARGE'];
let _joySizeIdx = 1;
const _joyToast = eid('joy-size-toast');
let _joyDoubleTapT = 0;
function setJoySize(idx){
if(!_joyBase) return;
_joyBase.classList.remove(...JOY_SIZES);
_joyBase.classList.add(JOY_SIZES[idx]);
try{ localStorage.setItem('diy_joy_size', String(idx)); }catch(e){}
if(_joyToast){
_joyToast.textContent = 'JOYSTICK: ' + JOY_LABELS[idx];
_joyToast.classList.add('show');
setTimeout(()=>{ _joyToast.classList.remove('show'); }, 1400);
}
}
try{ const s = localStorage.getItem('diy_joy_size'); if(s!==null){ _joySizeIdx = Math.min(2,Math.max(0,parseInt(s,10)||0)); } }catch(e){}
setJoySize(_joySizeIdx);
if(_joyBase){
_joyBase.addEventListener('touchend', e => {
const now = Date.now();
if(now - _joyDoubleTapT < 380){
_joySizeIdx = (_joySizeIdx + 1) % JOY_SIZES.length;
setJoySize(_joySizeIdx);
e.preventDefault();
}
_joyDoubleTapT = now;
}, {passive:false});
}
const _mmDrawer = eid('mm-drawer');
const _mmTab = eid('mm-tab');
const _mmCanvas = eid('mm-drawer-canvas');
const _mmCtx = _mmCanvas ? _mmCanvas.getContext('2d') : null;
const _origMM = eid('minimap');
let _mmOpen = false;
let _mmAutoCloseTO = null;
function openMMDrawer(){
if(!_mmDrawer) return;
_mmOpen = true;
_mmDrawer.classList.add('open');
if(_mmTab) _mmTab.classList.add('active');
clearTimeout(_mmAutoCloseTO);
_mmAutoCloseTO = setTimeout(closeMMDrawer, 5000);
renderMMDrawer();
}
function closeMMDrawer(){
if(!_mmDrawer) return;
_mmOpen = false;
_mmDrawer.classList.remove('open');
if(_mmTab) _mmTab.classList.remove('active');
}
function renderMMDrawer(){
if(!_mmOpen || !_mmCtx || !_origMM) return;
if(_origMM.style.display === 'none'){ closeMMDrawer(); return; }
_mmCtx.clearRect(0,0,96,96);
_mmCtx.drawImage(_origMM,0,0,96,96);
}
if(_mmTab){
_mmTab.addEventListener('touchstart', e => {
e.preventDefault();
if(_mmOpen) closeMMDrawer(); else openMMDrawer();
}, {passive:false});
_mmTab.addEventListener('click', e => {
if(_mmOpen) closeMMDrawer(); else openMMDrawer();
});
}
setInterval(()=>{
if(typeof $buildings.state === 'undefined' || $buildings.state !== 'playing') return;
updateFirePulse();
updateWaveChip();
syncPill();
updateNadeBadge();
updateStatChip();
showStatChip(true);
}, 250);
const _origGoToMenu = (typeof goToMenu === 'function') ? goToMenu : null;
if(typeof window !== 'undefined'){
const _hideChipOnMenu = ()=>{ showStatChip(false); };
document.addEventListener('visibilitychange', ()=>{ if(document.hidden) _hideChipOnMenu(); });
}
})();
document.addEventListener('touchmove', e => {
if(!aimActive || aimId===null) return;
for(let t of e.changedTouches){
if(t.identifier === aimId){
const ac = getAimJoyCenter();
let dx = t.clientX - ac.x, dy = t.clientY - ac.y;
const dist = Math.hypot(dx, dy);
const clampedDist = Math.min(dist, AIM_JOY_RADIUS);
if(dist > 0){ dx = dx/dist*clampedDist; dy = dy/dist*clampedDist; }
setAimKnobPos(ac.x, ac.y, dx, dy);
updateAim(dx, dy, clampedDist);
}
}
}, {passive: true});
function aimEnd(e) {
if(!aimActive || aimId===null) return;
for(let t of e.changedTouches){
if(t.identifier === aimId){
aimActive = false;
aimId = null;
aimJoyBase.classList.remove('joy-active');
resetAimKnob();
if($buildings.settingFireOnAim) stopAutoFire();
}
}
}
document.addEventListener('touchend', aimEnd, {passive: true});
document.addEventListener('touchcancel', aimEnd, {passive: true});
function updateAim(dx, dy, dist) {
const AIM_RAY_LENGTH = 600;
if(dist < 4){
return;
}
const nx = dx / AIM_JOY_RADIUS, ny = dy / AIM_JOY_RADIUS;
$buildings.mouse.x = $buildings.player.x + nx * AIM_RAY_LENGTH;
$buildings.mouse.y = $buildings.player.y + ny * AIM_RAY_LENGTH;
}
const AIM_ASSIST_RADIUS = 180;
const AIM_ASSIST_CONE = 0.6;
const AIM_ASSIST_STRENGTH = 0.06;
const AIM_DEADZONE = 50;
function applyAimAssist(){
if($buildings.state !== 'playing' || !aimActive) return;
const rawAngle = Math.atan2($buildings.mouse.y - $buildings.player.y, $buildings.mouse.x - $buildings.player.x);
let bestEnemy = null, bestScore = Infinity;
const targets = [...$buildings.enemies];
if($psycho2.helicopter && $psycho2.helicopter.alive) targets.push($psycho2.helicopter);
if($psycho2.alienShip && $psycho2.alienShip.alive) targets.push($psycho2.alienShip);
if($psycho2.fighterJet && $psycho2.fighterJet.alive) targets.push($psycho2.fighterJet);
$psycho2.armoredCars.forEach(c=>{ if(c.alive) targets.push(c); });
if($psycho2.spiderTank && $psycho2.spiderTank.alive) targets.push($psycho2.spiderTank);
if($psycho2.harmTug && $psycho2.harmTug.alive) targets.push($psycho2.harmTug);
for(const e of targets){
if(!e.alive) continue;
const dx = e.x - $buildings.player.x, dy = e.y - $buildings.player.y;
const dist = Math.hypot(dx, dy);
if(dist > AIM_ASSIST_RADIUS || dist < AIM_DEADZONE) continue;
const angleToEnemy = Math.atan2(dy, dx);
let diff = angleToEnemy - rawAngle;
while(diff > Math.PI) diff -= Math.PI*2;
while(diff < -Math.PI) diff += Math.PI*2;
if(Math.abs(diff) > AIM_ASSIST_CONE) continue;
const score = Math.abs(diff) * 120 + dist * 0.3;
if(score < bestScore){ bestScore = score; bestEnemy = e; }
}
if(!bestEnemy) return;
$buildings.mouse.x = $buildings.mouse.x + (bestEnemy.x - $buildings.mouse.x) * AIM_ASSIST_STRENGTH;
$buildings.mouse.y = $buildings.mouse.y + (bestEnemy.y - $buildings.mouse.y) * AIM_ASSIST_STRENGTH;
}
function _gatherTargets(){
const targets = [...$buildings.enemies];
if($psycho2.helicopter && $psycho2.helicopter.alive) targets.push($psycho2.helicopter);
if($psycho2.alienShip && $psycho2.alienShip.alive) targets.push($psycho2.alienShip);
if($psycho2.fighterJet && $psycho2.fighterJet.alive) targets.push($psycho2.fighterJet);
$psycho2.armoredCars.forEach(c=>{ if(c.alive) targets.push(c); });
if($psycho2.spiderTank && $psycho2.spiderTank.alive) targets.push($psycho2.spiderTank);
if($psycho2.harmTug && $psycho2.harmTug.alive) targets.push($psycho2.harmTug);
return targets;
}
function applyAutoAim(){
if($buildings.state !== 'playing' || !$buildings.settingAutoAim) return;
const targets = _gatherTargets();
let best = null, bestDist = Infinity;
for(const e of targets){
if(!e.alive) continue;
const dist = Math.hypot(e.x - $buildings.player.x, e.y - $buildings.player.y);
if(dist < bestDist){ bestDist = dist; best = e; }
}
if(!best){
if($profiler.autoFireInterval){ clearInterval($profiler.autoFireInterval); $profiler.autoFireInterval=null; }
aimActive = false;
return;
}
const _aaLerp = 0.22;
$buildings.mouse.x = $buildings.mouse.x + (best.x - $buildings.mouse.x) * _aaLerp;
$buildings.mouse.y = $buildings.mouse.y + (best.y - $buildings.mouse.y) * _aaLerp;
aimActive = true;
if(!$profiler.autoFireInterval){
$profiler.autoFireInterval = setInterval(()=>{
if($buildings.state !== 'playing' || $buildings.isPaused || !$buildings.settingAutoAim){ clearInterval($profiler.autoFireInterval); $profiler.autoFireInterval=null; return; }
const t = _gatherTargets();
let hasTarget = false;
for(const e of t){ if(e.alive){ hasTarget = true; break; } }
if(!hasTarget){ clearInterval($profiler.autoFireInterval); $profiler.autoFireInterval=null; return; }
if(typeof fire === 'function') fire();
}, 150);
}
}
$profiler._hudCollapsed = false;
function _hudEl(){ return el('hud'); }
function _hudMini(){ return el('hud-mini'); }
function _hudToggleEl(){ return el('hud-toggle'); }
function _syncMiniHud(){
if(!$buildings.player) return;
const hpPct = Math.max(0, $buildings.player.hp / $buildings.player.maxHp * 100);
const hpFill = el('hud-mini-hp');
if(hpFill){
hpFill.style.width = hpPct+'%';
hpFill.style.background = hpPct>50?'#7fff00':hpPct>25?'#ffaa00':'#ff3300';
}
const waveEl = el('hud-mini-wave');
if(waveEl) waveEl.textContent = $buildings.wave||1;
const wepEl = el('hud-mini-wep');
if(wepEl) wepEl.innerHTML = (WEP_ICONS_MAP[$buildings.curWep]||'');
const ammoEl = el('hud-mini-ammo');
if(ammoEl) ammoEl.textContent = $buildings.wepAmmo[$buildings.curWep]||0;
}
let _mhudLastMutIds = '';
function renderMinimalHud(){
if(!$buildings.player || !document.body.classList.contains('mobile-minimal-hud')) return;
const hpPct = Math.max(0, $buildings.player.hp / $buildings.player.maxHp * 100);
const hpFill = el('mhud-hp-fill');
if(hpFill){
hpFill.style.width = hpPct + '%';
hpFill.classList.toggle('caution', hpPct <= 50 && hpPct > 25);
hpFill.classList.toggle('danger', hpPct <= 25);
}
const hpNum = el('mhud-hp-num');
if(hpNum) hpNum.textContent = Math.max(0,Math.round($buildings.player.hp)) + ' / ' + Math.round($buildings.player.maxHp);
const waveNum = el('mhud-wave-num');
if(waveNum) waveNum.textContent = $buildings.wave || 1;
const ammoTag = el('mhud-ammo-tag');
const ammoNum = el('mhud-ammo-num');
if(ammoNum && typeof $buildings.curWep !== 'undefined' && $buildings.WEAPONS[$buildings.curWep]){
const _upgAmmo = ($buildings.wepUpgrades&&$buildings.wepUpgrades[$buildings.curWep]&&$buildings.wepUpgrades[$buildings.curWep].ammo)||0;
const maxAmmo = $buildings.WEAPONS[$buildings.curWep].ammo + _upgAmmo;
ammoNum.textContent = ($buildings.wepAmmo[$buildings.curWep]||0) + ' / ' + maxAmmo;
}
if(ammoTag) ammoTag.classList.toggle('reloading', !!$buildings.reloading);
const kills = el('mhud-kills'); if(kills) kills.textContent = $buildings.totalKills||0;
const scoreEl = el('mhud-score'); if(scoreEl) scoreEl.textContent = ($buildings.score||0).toLocaleString();
const lvl = el('mhud-level'); if(lvl) lvl.textContent = (typeof $buildings.playerLevel !== 'undefined') ? $buildings.playerLevel : 1;
const streak = el('mhud-streak'); if(streak) streak.textContent = 'x' + ((typeof $buildings.killStreak !== 'undefined') ? $buildings.killStreak : 0);
const mutSection = el('mhud-mut-section');
const mutList = el('mhud-mut-list');
const mutDot = el('mhud-dot');
if(mutSection && mutList && $psycho2.playerUpgrades && $psycho2.playerUpgrades.mutations){
const muts = [...$psycho2.playerUpgrades.mutations];
const ids = muts.slice().sort().join(',');
if(ids !== _mhudLastMutIds){
_mhudLastMutIds = ids;
const hasMuts = muts.length > 0;
mutSection.style.display = hasMuts ? 'block' : 'none';
mutList.innerHTML = '';
muts.forEach(mid=>{
const def = (typeof $psycho2.MUT_PILL_DEF !== 'undefined' && $psycho2.MUT_PILL_DEF[mid]) ? $psycho2.MUT_PILL_DEF[mid] : null;
const label = def ? def[1] : mid.replace('mut_','').toUpperCase();
const color = def ? def[2] : '#ffaa00';
const chip = document.createElement('div');
chip.className = 'mhud-mini-mutator';
chip.style.color = color;
chip.style.borderColor = color + '40';
chip.textContent = (def ? def[0] + ' ' : '') + label;
mutList.appendChild(chip);
});
if(mutDot && hasMuts && !el('mhud-drawer').classList.contains('open')){
mutDot.classList.add('show');
}
}
}
}
function openMinimalHudDrawer(){
const d = el('mhud-drawer'); if(d) d.classList.add('open');
const dot = el('mhud-dot'); if(dot) dot.classList.remove('show');
}
function closeMinimalHudDrawer(){
const d = el('mhud-drawer'); if(d) d.classList.remove('open');
}
function setHudCollapsed(collapsed){
if(document.body.classList.contains('mobile-minimal-hud')) return;
$profiler._hudCollapsed = collapsed;
const hud = _hudEl(), mini = _hudMini(), tog = _hudToggleEl();
if(!hud||!mini||!tog) return;
if(collapsed){
hud.style.display = 'none';
mini.classList.add('active');
tog.innerHTML = '<div id=\"hud-toggle-icon\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" width=\"14\" height=\"14\"><path d=\"M9.88 9.88a3 3 0 1 0 4.24 4.24\"/><path d=\"M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68\"/><path d=\"M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61\"/><line x1=\"2\" y1=\"2\" x2=\"22\" y2=\"22\"/></svg></div><div id=\"hud-toggle-label\">HUD</div>';
_syncMiniHud();
} else {
hud.style.display = '';
mini.classList.remove('active');
tog.innerHTML = '<div id=\"hud-toggle-icon\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" width=\"14\" height=\"14\"><path d=\"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg></div><div id=\"hud-toggle-label\">HUD</div>';
}
}
function showHudToggle(show){
if(document.body.classList.contains('mobile-minimal-hud')) return;
const tog = _hudToggleEl();
if(!tog) return;
tog.style.display = show ? 'flex' : 'none';
}
(function(){
const tog = el('hud-toggle');
if(!tog) return;
function doToggle(e){ e.preventDefault(); e.stopPropagation(); setHudCollapsed(!$profiler._hudCollapsed); audioManager.uiClick(); }
tog.addEventListener('touchstart', doToggle, {passive:false});
tog.addEventListener('click', doToggle);
})();
el('btn-reload').addEventListener('touchstart', e => {
e.preventDefault();
if($buildings.state==='playing'&&!$buildings.reloading) startReload();
}, {passive: false});
el('btn-grenade-left').addEventListener('touchstart', e => {
e.preventDefault();
if(!aimActive){
const throwDist = 180;
$buildings.mouse.x = $buildings.player.x + Math.cos($buildings.player.angle) * throwDist;
$buildings.mouse.y = $buildings.player.y + Math.sin($buildings.player.angle) * throwDist;
}
throwGrenade();
}, {passive: false});
el('btn-airstrike').addEventListener('touchstart', e => {
e.preventDefault();
callAirstrike();
}, {passive: false});
const _wepIconSvg = (paths, size) => `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="${size}" height="${size}" style="display:block;">${paths}</svg>`;
const WEP_ICONS_MAP={
rifle: _wepIconSvg('<rect x="1" y="10" width="14" height="2"/><rect x="2" y="8" width="1.5" height="2"/><rect x="13" y="7" width="7" height="6"/><polygon points="20,9 24,11 24,13 20,13"/><polygon points="15,13 18,13 17,20 14,20"/>', 20),
shotgun: _wepIconSvg('<rect x="1" y="10" width="11" height="3"/><rect x="6" y="14" width="6" height="2.5"/><rect x="12" y="8" width="6" height="6"/><polygon points="18,10 23,12 23,14.5 18,14.5"/>', 20),
smg: _wepIconSvg('<rect x="4" y="8" width="12" height="6"/><rect x="16" y="10" width="6" height="2"/><polygon points="8,14 12,14 11,21 7,20"/><rect x="1" y="9.5" width="3" height="3"/>', 20),
knife: _wepIconSvg('<g transform="rotate(45 12 12)"><polygon points="12,1.5 14.2,5 14.2,11 9.8,11 9.8,5"/><rect x="6.5" y="11" width="11" height="1.8" rx="0.4"/><rect x="10" y="12.8" width="4" height="6.5" rx="1"/><circle cx="12" cy="19.8" r="1.6"/></g>', 20),
minigun: _wepIconSvg('<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="5" r="1.6"/><circle cx="18" cy="8.5" r="1.6"/><circle cx="18" cy="15.5" r="1.6"/><circle cx="12" cy="19" r="1.6"/><circle cx="6" cy="15.5" r="1.6"/><circle cx="6" cy="8.5" r="1.6"/>', 20),
rpg: _wepIconSvg('<rect x="2" y="10" width="14" height="4" rx="1"/><polygon points="16,9 22,12 16,15"/><rect x="5" y="14" width="2" height="5"/><rect x="10" y="14" width="2" height="3"/>', 20),
flamethrower: _wepIconSvg('<rect x="2" y="12" width="6" height="8" rx="1"/><rect x="8" y="14" width="4" height="2.5"/><path d="M15 5c1 2.5 4 4 4 7.5a5 5 0 01-10 0c0-1.6.7-2.8 1.5-3.8-.4 1.8.4 3 1.6 2.8-1-1.5-.6-3 .2-4.3.3 1.6 1.3 2 1.7 1-.6-1.3 0-2.3 1-3.2z"/>', 20),
laser: _wepIconSvg('<rect x="2" y="10" width="8" height="4" rx="1"/><circle cx="12" cy="12" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="15" y="11" width="8" height="2"/>', 20),
plasmacutter: _wepIconSvg('<rect x="2" y="15" width="6" height="4" rx="1"/><polygon points="8,15 14,15 14,17 8,19"/><polygon points="14,12 22,4 20,10 24,8 16,18 18,12"/>', 20)
};
function buildWepStrip(){
const strip=el('wep-strip');
if(!strip)return;
strip.innerHTML='';
$buildings.WK.forEach((wk,i)=>{
const slot=document.createElement('div');
slot.className='wep-slot'+(wk===$buildings.curWep?' active':'');
slot.dataset.wk=wk;
const evoTier = $psycho2.wepEvolution[wk]||0;
const upgCount = $psycho2.wepUpgradeCount[wk]||0;
const maxTier = 3;
let evoHtml = '';
if(evoTier >= 3){
evoHtml = `<span class="wep-slot-evo" style="font-size:6px;color:#ffffff;letter-spacing:0px;text-shadow:0 0 6px #ffff00;">*LEGENDARY</span>`;
} else if(evoTier >= maxTier-1){
evoHtml = `<span class="wep-slot-evo" style="font-size:6px;color:#ffff44;letter-spacing:0px;">${evoTier===2?'▸ASCENDED':'EVOLVED'}</span>`;
} else {
const neededForNext = (evoTier+1)*2;
const progress = Math.min(upgCount - evoTier*2, 2);
const remaining = neededForNext - upgCount;
if(remaining<=2 && remaining>0){
const pips = window.innerWidth < 380 ? ('+'+upgCount) : ('▪'.repeat(progress)+'▫'.repeat(2-progress));
evoHtml = `<span class="wep-slot-evo" style="font-size:6px;color:#5a8800;letter-spacing:0px;">${pips}</span>`;
}
}
slot.innerHTML=`<span class="wep-slot-icon">${WEP_ICONS_MAP[wk]||'?'}</span><span class="wep-slot-name">${$buildings.WEAPONS[wk].name}</span>${evoHtml}<span class="wep-slot-ammo">${$buildings.wepAmmo[wk]||0}</span>`;
if(!$core.isMobile){
const keyHint=document.createElement('span');
keyHint.className='wep-slot-key';
keyHint.textContent=String(i+1);
slot.appendChild(keyHint);
}
if(wk==='laser' && (() => { try { return localStorage.getItem('diy_laser_badge_pending')==='1'; } catch(e) { return false; } })()){
const badge=document.createElement('span');
badge.className='laser-new-badge';
badge.textContent='NEW';
slot.appendChild(badge);
}
slot.addEventListener('touchstart',e=>{
e.preventDefault();e.stopPropagation();
if(wk!==$buildings.curWep){switchWep(i);updateWepStrip();audioManager.uiClick();}
},{passive:false});
slot.addEventListener('click',()=>{
if(wk!==$buildings.curWep){switchWep(i);updateWepStrip();audioManager.uiClick();}
});
strip.appendChild(slot);
});
scrollWepStripToActive();
if($psycho2.playerUpgrades && $psycho2.playerUpgrades.knifeDash){
const kSlot = strip.querySelector('.wep-slot[data-wk=\"knife\"]');
if(kSlot) kSlot.classList.add('dash-unlocked');
}
}
function addWepStripHint() {
const strip = document.getElementById('wep-strip-wrap');
if(!strip) return;
const hint = document.createElement('div');
hint.innerHTML = '<svg class="ico"><use href="#ico-back"/></svg> SWIPE <svg class="ico"><use href="#ico-play"/></svg>';
hint.style.cssText = 'position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);font-size:7px;color:#3a6000;letter-spacing:2px;white-space:nowrap;pointer-events:none;opacity:0.6;transition:opacity 1s;';
strip.parentElement.style.marginBottom = '16px';
strip.parentElement.appendChild(hint);
setTimeout(() => hint.style.opacity = '0', 4000);
}
function updateWepStrip(){
const strip=el('wep-strip');
if(!strip)return;
strip.querySelectorAll('.wep-slot').forEach(slot=>{
const wk=slot.dataset.wk;
slot.classList.toggle('active',wk===$buildings.curWep);
const ammoEl=slot.querySelector('.wep-slot-ammo');
if(ammoEl) ammoEl.textContent=$buildings.wepAmmo[wk]||0;
let evoEl=slot.querySelector('.wep-slot-evo');
const evoTier=$psycho2.wepEvolution[wk]||0;
const upgCount=$psycho2.wepUpgradeCount[wk]||0;
let evoHtml='';
if(evoTier>=3){
evoHtml='<svg class="ico"><use href="#ico-star"/></svg>LEGENDARY';
if(!evoEl){evoEl=document.createElement('span');evoEl.className='wep-slot-evo';evoEl.style.cssText='font-size:6px;color:#ffffff;text-shadow:0 0 6px #ffff00;letter-spacing:0px;';slot.insertBefore(evoEl,ammoEl);}
evoEl.innerHTML=evoHtml;evoEl.style.color='#ffffff';
} else if(evoTier>=2){
evoHtml='<svg class="ico"><use href="#ico-bolt"/></svg>ASCENDED';
if(!evoEl){evoEl=document.createElement('span');evoEl.className='wep-slot-evo';evoEl.style.cssText='font-size:6px;color:#ffff44;letter-spacing:0px;';slot.insertBefore(evoEl,ammoEl);}
evoEl.innerHTML=evoHtml;evoEl.style.color='#ffff44';
} else if(evoTier>=1){
evoHtml='<svg class="ico"><use href="#ico-flame"/></svg>EVOLVED';
if(!evoEl){evoEl=document.createElement('span');evoEl.className='wep-slot-evo';evoEl.style.cssText='font-size:6px;color:#ff6600;letter-spacing:0px;';slot.insertBefore(evoEl,ammoEl);}
evoEl.innerHTML=evoHtml;evoEl.style.color='#ff6600';
} else {
const remaining=(evoTier+1)*2-upgCount;
if(remaining<=2&&remaining>0){
const prog=Math.min(upgCount-evoTier*2,2);
evoHtml=window.innerWidth < 380 ? ('+'+upgCount) : ('\u25aa'.repeat(prog)+'\u25ab'.repeat(2-prog));
if(!evoEl){evoEl=document.createElement('span');evoEl.className='wep-slot-evo';evoEl.style.cssText='font-size:6px;color:#5a8800;letter-spacing:0px;';slot.insertBefore(evoEl,ammoEl);}
evoEl.textContent=evoHtml;evoEl.style.color='#5a8800';
} else if(evoEl){evoEl.textContent='';}
}
});
scrollWepStripToActive();
}
function updateCycleBtn(){ updateWepStrip(); }
function scrollWepStripToActive(){
const strip=el('wep-strip');const wrap=el('wep-strip-wrap');
if(!strip||!wrap)return;
const activeSlot=strip.querySelector('.wep-slot.active');
if(!activeSlot)return;
const wrapW=wrap.offsetWidth;
const slotLeft=activeSlot.offsetLeft;
const slotW=activeSlot.offsetWidth;
const stripStyle=getComputedStyle(strip);
const padL=parseFloat(stripStyle.paddingLeft)||0;
const padR=parseFloat(stripStyle.paddingRight)||0;
const contentW=strip.scrollWidth-padL-padR;
const target=(slotLeft-padL)-(wrapW/2)+(slotW/2);
strip.style.transform=`translateX(${-Math.max(0,Math.min(target,Math.max(0,contentW-wrapW+padL+padR)))}px)`;
}
let _wepSwipeX=null, _wepSwipeY=null, _wepSwipeMaxV=0, _wepSwipeT=0;
const _RETURNING_HINTS_MOBILE = [
'SWIPE LEFT/RIGHT ON THE AIM ZONE TO SWITCH WEAPONS FAST',
'TAP THE ▪ BUTTON NEAR ENEMIES — GRENADES CLEAR GROUPS INSTANTLY',
'RELOAD BETWEEN WAVES, NOT DURING — CAUGHT RELOADING = DEAD',
'HOLD POSITION NEAR WALLS — ENEMIES FUNNEL INTO CHOKEPOINTS',
'KNIFE AT CLOSE RANGE HITS FOR MASSIVE DAMAGE + STUN',
'UPGRADES STACK — PIERCE + EXPLOSIVE = ENEMIES EXPLODE THROUGH COVER',
'BOSS INCOMING EVERY 5 WAVES — SAVE YOUR GRENADES',
];
const _RETURNING_HINTS_DESKTOP = [
'PRESS 1–7 TO SWITCH WEAPONS INSTANTLY',
'G = GRENADE · R = RELOAD · MOUSE AIM IS ALWAYS ACTIVE',
'KNIFE (KEY 7) HITS HARD AT CLOSE RANGE — USE IT ON GROUPED ENEMIES',
'UPGRADES STACK — PIERCE + EXPLOSIVE CLEARS ENTIRE ROWS',
'BOSS EVERY 5 WAVES — SAVE GRENADES FOR THE BOSS WAVE',
'MEDIC CHARACTER AUTO-HEALS — GREAT FOR LONG SURVIVAL RUNS',
];
function _updateStressMixer(){
if($buildings.state !== 'playing' || !audioManager.musicEnabled) return;
if($buildings.bossAlive) return;
const _enemyI = Math.min(0.5, ($buildings.enemies.filter(e=>e.alive&&!e.boss).length) / 20);
const _lowHpI = $buildings.player.hp / $buildings.player.maxHp < 0.3 ? 0.4 : 0;
const _streakI = Math.min(1, $buildings.killStreak / 12);
const level = Math.min(1, _streakI + _enemyI * 0.4 + _lowHpI);
audioManager.setMusicIntensity(level);
}
function _gv(...rows){ return rows; }
const BOOT_SYSTEMS_OVERVIEW = [
['^','Upgrades','After each wave, pick one — some combos unlock bonus synergy effects.'],
['#1','Prestige XP','Every run earns XP toward permanent unlocks, even if you die early.'],
['◆','Mutators','Optional run modifiers that change the fight — unlock after your first Endless run.'],
['$','Armory & Daily Challenges','Unlock once you reach Wave 3 — check the main menu.'],
];
function showBootBriefing(onDismiss){
const overlay = document.getElementById('boot-brief-overlay');
const list = document.getElementById('boot-brief-controls');
const systemsList = document.getElementById('boot-brief-systems');
const heading = document.getElementById('boot-brief-heading');
const subheading = document.getElementById('boot-brief-subheading');
const btn = document.getElementById('boot-brief-dismiss');
if(!overlay || !list || !btn) { if(onDismiss) onDismiss(); return; }
const rows = $core.isMobile ? _gv(
['LEFT JOYSTICK','Move your soldier'],
['TAP RIGHT SIDE','Aim & fire at enemies'],
['⟳ BUTTON','Reload when out of ammo'],
['▪ BUTTON','Throw a grenade'],
['WEAPON STRIP','Tap a weapon icon to switch'],
[__pauseSvg(12,'#aaff00')+' BUTTON','Pause the game']
) : _gv(
['WASD','Move your soldier'],
['MOUSE','Aim in any direction'],
['LEFT CLICK','Fire your weapon'],
['R','Reload when out of ammo'],
['G','Throw a grenade'],
['1 - 7','Switch weapons'],
['P','Pause the game']
);
list.innerHTML = rows.map(([key,desc])=>`
<div style="display:flex;align-items:center;gap:12px;background:rgba(0,30,0,0.4);border:1px solid rgba(80,150,0,0.25);border-radius:8px;padding:9px 12px;">
<div style="font-family:'Share Tech Mono',monospace;font-size:11px;font-weight:700;color:#aaff00;letter-spacing:0.5px;min-width:92px;flex-shrink:0;">${key}</div>
<div style="font-family:var(--sf,'Share Tech Mono',monospace);font-size:12px;color:rgba(200,255,160,0.85);">${desc}</div>
</div>`).join('');
if(systemsList) systemsList.innerHTML = BOOT_SYSTEMS_OVERVIEW.map(([icon,title,desc])=>`
<div style="display:flex;align-items:flex-start;gap:12px;background:rgba(0,30,0,0.4);border:1px solid rgba(80,150,0,0.25);border-radius:8px;padding:9px 12px;">
<div style="font-family:'Share Tech Mono',monospace;font-size:13px;font-weight:700;color:#aaff00;min-width:20px;flex-shrink:0;">${icon}</div>
<div>
<div style="font-family:var(--sf,'Share Tech Mono',monospace);font-size:11px;font-weight:700;color:#aaff00;letter-spacing:0.5px;margin-bottom:2px;">${title}</div>
<div style="font-family:var(--sf,'Share Tech Mono',monospace);font-size:11px;color:rgba(200,255,160,0.8);line-height:1.4;">${desc}</div>
</div>
</div>`).join('');
overlay.style.display='flex';
$buildings.isPaused=true;
let onSecondScreen = false;
const showScreenTwo = () => {
onSecondScreen = true;
list.style.display = 'none';
if(systemsList) systemsList.style.display = 'flex';
if(heading) heading.textContent = 'BEFORE YOU DEPLOY';
if(subheading) subheading.textContent = 'A FEW MORE THINGS TO KNOW';
btn.innerHTML = '<svg class="ico"><use href="#ico-play"/></svg> DEPLOY';
};
const dismiss = () => {
overlay.style.display='none';
list.style.display = 'flex';
if(systemsList) systemsList.style.display = 'none';
if(heading) heading.textContent = 'BOOT CAMP BRIEFING';
if(subheading) subheading.textContent = 'YOUR CONTROLS, SOLDIER';
$buildings.isPaused=false;
btn.removeEventListener('click', onBtnClick);
if(onDismiss) onDismiss();
};
const onBtnClick = () => {
if(systemsList && !onSecondScreen) showScreenTwo();
else dismiss();
};
btn.addEventListener('click', onBtnClick);
}
function checkFirstPlay(){
if($replay.currentLevel && $replay.currentLevel.isTutorialLevel){
try{
if(!localStorage.getItem('diy_played')){
localStorage.setItem('diy_played','1');
localStorage.setItem('diy_run_count','1');
}
}catch(e){}
return;
}
try{
if(!localStorage.getItem('diy_played')){
$buildings.firstPlay=true;
localStorage.setItem('diy_played','1');
localStorage.setItem('diy_run_count','1');
showIngameHint($core.isMobile?'SWIPE THE WEAPON BAR OR TAP A SLOT TO SWITCH WEAPONS':'PRESS 1-7 TO SWITCH WEAPONS · WASD TO MOVE · MOUSE TO AIM',5000);
setTimeout(()=>showIngameHint('SURVIVE WAVE AFTER WAVE — BOSS EVERY 5 WAVES',4000),7000);
setTimeout(()=>showIngameHint('REACH CLOSE RANGE WITH THE KNIFE FOR MASSIVE DAMAGE',4000),14000);
} else {
let runCount = 1;
try { runCount = parseInt(localStorage.getItem('diy_run_count')||'1',10) || 1; } catch(e){}
runCount++;
try { localStorage.setItem('diy_run_count', String(runCount)); } catch(e){}
if(runCount % 3 === 0){
const pool = $core.isMobile ? _RETURNING_HINTS_MOBILE : _RETURNING_HINTS_DESKTOP;
let lastIdx = -1;
try { lastIdx = parseInt(localStorage.getItem('diy_last_hint')||'-1',10); } catch(e){}
let nextIdx = (lastIdx + 1 + Math.floor(Math.random()*(pool.length-1))) % pool.length;
if(nextIdx === lastIdx) nextIdx = (nextIdx + 1) % pool.length;
try { localStorage.setItem('diy_last_hint', String(nextIdx)); } catch(e){}
setTimeout(()=>showIngameHint('TIP: ' + pool[nextIdx], 5000), 3500);
}
}
}catch(e){}
}
let _hintTimer = null;
let _hintPriority = 0;
function showIngameHint(msg, duration=3500, priority=0){
const hint=el('ingame-hint');if(!hint)return;
if(_hintTimer && priority < _hintPriority) return;
if(_hintTimer){ clearTimeout(_hintTimer); _hintTimer=null; }
_hintPriority = priority;
hint.textContent=msg;
hint.classList.remove('visible');
void hint.offsetWidth;
hint.classList.add('visible');
_hintTimer = setTimeout(()=>{
hint.classList.remove('visible');
_hintTimer=null;
_hintPriority=0;
}, duration);
}
window.showIngameHint = showIngameHint;
let _unlockBannerTimer=null;
let _unlockBannerQueue=[];
function showUnlockBanner(text, sub='', variant=null, duration=4500){
const banner=el('unlock-banner');
const textEl=el('unlock-banner-text');
if(!banner||!textEl)return;
_unlockBannerQueue.push({text,sub,variant,duration});
if(_unlockBannerQueue.length===1) _showNextUnlockBanner();
}
function _showNextUnlockBanner(){
if(!_unlockBannerQueue.length)return;
const {text,sub,variant,duration=4500}=_unlockBannerQueue[0];
const banner=el('unlock-banner');
const textEl=el('unlock-banner-text');
const subEl=el('unlock-banner-sub');
if(!banner||!textEl){_unlockBannerQueue.shift();return;}
if(_unlockBannerTimer){clearTimeout(_unlockBannerTimer);_unlockBannerTimer=null;}
banner.classList.remove('show');
banner.classList.toggle('char-unlock', variant==='char');
textEl.textContent=text;
if(subEl) subEl.textContent=sub||'CHECK YOUR WEAPON SLOT';
setTimeout(()=>{
banner.classList.add('show');
_unlockBannerTimer=setTimeout(()=>{
banner.classList.remove('show');
_unlockBannerQueue.shift();
if(_unlockBannerQueue.length) setTimeout(_showNextUnlockBanner, 400);
},duration);
},30);
}
$profiler._dailyBannerShownSession = false;
function showDailyChallengeCompleteBanner(challengesCompleted) {
if ($profiler._dailyBannerShownSession || !challengesCompleted || challengesCompleted.length === 0) return;
$profiler._dailyBannerShownSession = true;
const banner = document.getElementById('daily-complete-banner');
const textEl = document.getElementById('daily-complete-text');
if (!banner || !textEl) return;
const names = challengesCompleted.map(c => c.label()).join(' · ');
textEl.textContent = names || 'Challenge Complete!';
audioManager.dailyChallengeComplete();
banner.classList.add('show');
setTimeout(() => {
banner.classList.remove('show');
}, 4500);
}
function checkWaveUnlocks(waveNum){
const _curTier = (()=>{ try{ return parseInt(localStorage.getItem('diy_unlock_tier')||'0'); }catch(e){ return 0; } })();
const _setTier = (t) => { try{ localStorage.setItem('diy_unlock_tier', String(t)); }catch(e){} };
if(_curTier < 1 && waveNum >= 3){
_setTier(1);
try{ localStorage.setItem('diy_played','1'); }catch(e){}
if(typeof applyMenuOnboarding === 'function') applyMenuOnboarding();
if(typeof window._syncApplePrestigeUI === 'function') window._syncApplePrestigeUI();
if(typeof _unlockArmoryUI === 'function') _unlockArmoryUI();
try{
const _dc = document.getElementById('acard-daily');
if(_dc){ _dc.style.opacity=''; _dc.style.pointerEvents=''; _dc.title=''; }
}catch(_e){}
setTimeout(()=>{
showPickupMsg('ARMORY & DAILY CHALLENGES UNLOCKED — check the menu', '#ffcc00');
}, 1200);
}
if(_curTier < 2 && waveNum >= 5){
_setTier(2);
setTimeout(()=>{
showPickupMsg('CO-OP & CUSTOMISE UNLOCKED — check the menu', '#00ccff');
}, 1800);
if(!localStorage.getItem('diy_adv_tips_seen')){
setTimeout(()=>{ if(typeof showAdvancedTips==='function') showAdvancedTips(); }, 5000);
}
}
if(waveNum >= 8 && !localStorage.getItem('diy_synergy_tip_seen')){
try{ localStorage.setItem('diy_synergy_tip_seen','1'); }catch(e){}
setTimeout(()=>{
showUnlockBanner('▸ MUTATION SYNERGIES','STACKING TWO MUTATIONS CAN COMBO — CHECK THE UPGRADE SCREEN', null, 5500);
}, 2000);
}
if(_curTier < 3 && waveNum >= 10){
_setTier(3);
if(typeof window._syncApplePrestigeUI === 'function') window._syncApplePrestigeUI();
setTimeout(()=>{
showPickupMsg('* PRESTIGE & MUTATORS FULLY UNLOCKED', '#cc88ff');
}, 2400);
}
if(waveNum===5 && !$buildings.unlockedLaser){
$buildings.unlockedLaser=true;
if(!$buildings.WK.includes('laser')) $buildings.WK.push('laser');
$buildings.wepAmmo.laser=$buildings.WEAPONS.laser.ammo;
if(!$buildings.wepUpgrades.laser) $buildings.wepUpgrades.laser={dmg:0,ammo:0,reload:0};
updateWepStrip();
try{localStorage.setItem('diy_unlocked_laser','1');}catch(e){}
try{localStorage.setItem('diy_laser_badge_pending','1');}catch(e){}
setTimeout(()=>{
showUnlockBanner('NEW WEAPON: LASER RIFLE','PRESS 8 OR TAP THE WEAPON BAR','weapon',6500);
audioManager.levelUp();
}, 600);
}
if(waveNum===10 && !$buildings.unlockedAlien){
$buildings.unlockedAlien=true;
try{localStorage.setItem('diy_unlocked_alien','1');}catch(e){}
try{localStorage.setItem('diy_alien_badge_pending','1');}catch(e){}
setTimeout(()=>{
showUnlockBanner('NEW CHARACTER: ALIEN','AVAILABLE IN CHARACTER SELECT NEXT RUN','char',6500);
audioManager.levelUp();
}, 600);
if (typeof window._appleUnlockAlienCard === 'function') window._appleUnlockAlienCard();
const rogueProtocol = gameDB.getAllLevels().find(l => l.id === 11);
if(rogueProtocol && !rogueProtocol.unlocked){
gameDB.updateLevel(11, { unlocked: true });
setTimeout(()=>{
showUnlockBanner('▸ ROGUE PROTOCOL UNLOCKED — HARM & TUG AWAITS','SELECT FROM LEVELS MENU');
audioManager.levelUp();
}, 2200);
}
}
$buildings.EXCLUSIVE_SKINS.forEach(ex=>{
if(waveNum===ex.wave && !_isExclusiveUnlocked(ex.id)){
try{localStorage.setItem('diy_exclusive_'+ex.id,'1');}catch(e){}
try{localStorage.setItem('diy_exclusive_'+ex.id+'_badge','1');}catch(e){}
setTimeout(()=>{
showUnlockBanner('EXCLUSIVE SKIN UNLOCKED','"'+ex.label.toUpperCase()+'" — CUSTOMIZE IN THE MENU','skin',6500);
audioManager.levelUp();
}, 600);
if (typeof window._refreshExclusiveSwatches === 'function') window._refreshExclusiveSwatches();
}
});
}
const PRESTIGE_LEVELS = [
{ xp:150, label:'FIELD OPERATIVE', reward:{type:'hp', val:10, perk:'bonusHp', desc:'+10 STARTING HP' }},
{ xp:250, label:'COMBAT SPECIALIST', reward:{type:'grenade', val:1, perk:'bonusGrenade', desc:'+1 STARTING GRENADE' }},
{ xp:400, label:'VETERAN SOLDIER', reward:{type:'skin', val:'#ff6600', perk:'skinOrange', desc:'EMBER SKIN UNLOCKED' }},
{ xp:550, label:'STRIKE COMMANDER', reward:{type:'ammo', val:1, perk:'bonusAmmo', desc:'+1 STARTING AMMO CLIP' }},
{ xp:750, label:'GHOST OPERATIVE', reward:{type:'token', val:1, perk:null, desc:'+1 LIFE TOKEN' }},
{ xp:1000, label:'SHADOW UNIT', reward:{type:'hp', val:15, perk:'bonusHp', desc:'+15 STARTING HP' }},
{ xp:1400, label:'ELITE GHOST', reward:{type:'grenade', val:1, perk:'bonusGrenade', desc:'+1 STARTING GRENADE' }},
{ xp:1800, label:'BLACK OPS AGENT', reward:{type:'skin', val:'#00ccff', perk:'skinCyan', desc:'ARCTIC SKIN UNLOCKED' }},
{ xp:2400, label:'SPECIAL FORCES', reward:{type:'ammo', val:1, perk:'bonusAmmo', desc:'+1 STARTING AMMO CLIP' }},
{ xp:3000, label:'LEGEND OF NOVA CITY',reward:{type:'token', val:2, perk:null, desc:'+2 LIFE TOKENS' }},
{ xp:3800, label:'PHANTOM RANK I', reward:{type:'hp', val:20, perk:'bonusHp', desc:'+20 STARTING HP' }},
{ xp:4600, label:'PHANTOM RANK II', reward:{type:'grenade', val:2, perk:'bonusGrenade', desc:'+2 STARTING GRENADES' }},
{ xp:5500, label:'PHANTOM RANK III', reward:{type:'ammo', val:2, perk:'bonusAmmo', desc:'+2 STARTING AMMO CLIPS' }},
{ xp:6500, label:'PHANTOM RANK IV', reward:{type:'token', val:2, perk:null, desc:'+2 LIFE TOKENS' }},
{ xp:7500, label:'PHANTOM RANK V', reward:{type:'hp', val:25, perk:'bonusHp', desc:'+25 STARTING HP' }},
]; ;$profiler.PRESTIGE_LEVELS = PRESTIGE_LEVELS;
function getPrestigeState(){
try{
return JSON.parse(localStorage.getItem('diy_prestige')||'{\"level\":0,\"xp\":0}');
}catch(e){ return {level:0,xp:0}; }
}
function savePrestigeState(s){
try{ localStorage.setItem('diy_prestige',JSON.stringify(s)); }catch(e){}
}
function awardPrestigeXP(kills, wavesReached, runScore, isFirstEverRun){
const raw = Math.floor(kills*4 + wavesReached*25 + runScore/30);
const FIRST_RUN_GUARANTEED_XP = 160;
const earned = isFirstEverRun
? Math.max(FIRST_RUN_GUARANTEED_XP, Math.min(2500, raw))
: Math.max(50, Math.min(2500, raw));
const state = getPrestigeState();
const prevLevel = state.level;
const prevXP = state.xp;
state.xp += earned;
let leveled = false;
let rewardLabel = '';
while(true){
const entry = PRESTIGE_LEVELS[Math.min(state.level, PRESTIGE_LEVELS.length-1)];
if(state.xp >= entry.xp){
state.xp -= entry.xp;
state.level++;
leveled = true;
rewardLabel = entry.reward.desc;
_applyPrestigeReward(entry.reward);
} else { break; }
}
savePrestigeState(state);
if (typeof syncPrestigeBadge === 'function') try { syncPrestigeBadge(); } catch(_e) {}
if (typeof syncStreakBadge === 'function') try { syncStreakBadge(); } catch(_e) {}
if (typeof syncRouletteBadge === 'function') try { syncRouletteBadge(); } catch(_e) {}
const entry = PRESTIGE_LEVELS[Math.min(state.level, PRESTIGE_LEVELS.length-1)];
return {
prevLevel, newLevel:state.level,
prevXP, xpEarned:earned,
currentXP:state.xp, xpNeeded:entry.xp,
leveledUp:leveled,
rewardLabel,
rankLabel: state.level>0 ? PRESTIGE_LEVELS[Math.min(state.level-1,PRESTIGE_LEVELS.length-1)].label : 'RECRUIT',
};
}
function _applyPrestigeReward(reward){
try{
if(reward.type==='token'){
$buildings.lifeTokens += reward.val;
localStorage.setItem('diy_tokens', String($buildings.lifeTokens));
} else if(reward.perk){
const perks = JSON.parse(localStorage.getItem('diy_perk')||'{}');
if(reward.type==='hp') perks.bonusHp = (perks.bonusHp||0) + reward.val;
if(reward.type==='grenade') perks.bonusGrenade = (perks.bonusGrenade||0) + reward.val;
if(reward.type==='ammo') perks.bonusAmmo = (perks.bonusAmmo||0) + reward.val;
if(reward.type==='skin') {
perks[reward.perk] = reward.val;
const exId = reward.perk==='skinOrange' ? 'ember_accent' : (reward.perk==='skinCyan' ? 'arctic_accent' : null);
if(exId){ try{ localStorage.setItem('diy_exclusive_'+exId+'_badge','1'); }catch(_e){} }
}
localStorage.setItem('diy_perk', JSON.stringify(perks));
}
}catch(e){}
}
function renderPrestigePanel(result){
const panel = document.getElementById('ec-prestige');
const lvlEl = document.getElementById('ec-prestige-lvl');
const xpText = document.getElementById('ec-prestige-xp-text');
const xpGained = document.getElementById('ec-prestige-xp-gained');
const fill = document.getElementById('ec-prestige-bar-fill');
const gain = document.getElementById('ec-prestige-bar-gain');
const rewardEl = document.getElementById('ec-prestige-reward');
const badge = document.getElementById('ec-prestige-levelup-badge');
if(!panel) return;
const entry = PRESTIGE_LEVELS[Math.min(result.newLevel, PRESTIGE_LEVELS.length-1)];
const nextReward = entry.reward.desc;
const pct = Math.min(100, (result.currentXP / entry.xp) * 100);
lvlEl.textContent = 'LVL ' + result.newLevel + ' · ' + result.rankLabel;
xpText.textContent = result.currentXP + ' / ' + entry.xp + ' XP';
xpGained.textContent = '+' + result.xpEarned + ' XP THIS RUN';
rewardEl.textContent = result.leveledUp ? 'OK ' + result.rewardLabel : 'NEXT: ' + nextReward;
badge.style.display = result.leveledUp ? 'block' : 'none';
if(result.leveledUp){
panel.classList.remove('leveled-up');
void panel.offsetWidth;
panel.classList.add('leveled-up');
badge.textContent = '▲ PRESTIGE LVL ' + result.prevLevel + ' -> ' + result.newLevel + ' ▲';
}
const prevPct = result.leveledUp ? 0 : Math.min(100, (result.prevXP / entry.xp) * 100);
fill.style.width = prevPct + '%';
gain.style.left = prevPct + '%';
gain.style.width = '0%';
requestAnimationFrame(()=>{
setTimeout(()=>{
fill.style.width = pct + '%';
gain.style.width = Math.max(0, pct - prevPct) + '%';
}, 200);
});
}
function updateDcTimer(){
const el2 = document.getElementById('dc-timer');
if(!el2) return;
const now = new Date();
const nextLocalMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
const diff = nextLocalMidnight.getTime() - now.getTime();
const h = Math.floor(diff / 3600000);
const m = Math.floor((diff % 3600000) / 60000);
const s = Math.floor((diff % 60000) / 1000);
el2.textContent = `RESETS IN ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
window.updateDcTimer = updateDcTimer;
setInterval(()=>{ if(document.hidden) return; if($buildings.state !== 'playing') updateDcTimer(); }, 1000);
(function _watchDcTimer(){
const _src = document.getElementById('dc-timer');
if (!_src) return;
new MutationObserver(() => {
const amsSub = document.querySelector('#acard-daily-sub');
if (amsSub) amsSub.textContent = _src.textContent || 'Resets in --:--:--';
}).observe(_src, { childList: true, characterData: true, subtree: true });
})();
function renderDailyChallengeEndCard(evalResult){
const panel = document.getElementById('ec-daily');
const body = document.getElementById('ec-dc-body');
const rewardEl = document.getElementById('ec-dc-reward');
if(!panel || !body) return;
const challenges = _dcPeekToday();
const state = getDailyState();
body.innerHTML = challenges.map(c=>{
const g = c.goal();
const completed = state.completed.includes(c.id);
const prog = Math.min(g.target, $mutators._dcProgress[c.id] || state.progress[c.id] || 0);
const done = completed || prog >= g.target;
return `<div class="ec-dc-row">
<span style="font-size:12px">${c.icon}</span>
<span class="ec-dc-label ${done?'done':''}">${c.label()}</span>
<span class="ec-dc-prog ${done?'done':''}">${prog}/${g.target}</span>
<span class="ec-dc-check">${done?'OK':'—'}</span>
</div>`;
}).join('');
if(evalResult.newlyCompleted.length > 0){
const xp = evalResult.totalRewardXP;
const tok = evalResult.totalRewardTokens;
rewardEl.textContent = `+${xp} XP${tok>0?' · +'+tok+' TOKEN'+(tok>1?'S':''):''}`;
rewardEl.style.display='block';
} else {
rewardEl.textContent = '';
}
panel.style.display = 'block';
}
function applyPersistentPerks(){
try{
const perks=JSON.parse(localStorage.getItem('diy_perk')||'{}');
if(perks.bonusGrenade){$buildings.grenadeCount=Math.min($buildings.grenadeCount+perks.bonusGrenade,9);updateGrenadeHUD();}
if(perks.bonusHp){$buildings.player.maxHp+=perks.bonusHp;$buildings.player.hp+=perks.bonusHp;updateHP();}
if(perks.bonusAmmo){$buildings.wepAmmo[$buildings.curWep]+=perks.bonusAmmo;updateHUD();}
}catch(e){}
}
function _unlockArmoryUI(){
try{
const _armTab = document.getElementById('armory-tab');
const _armCard = document.getElementById('acard-armory');
if(_armTab){ _armTab.style.opacity=''; _armTab.style.pointerEvents=''; _armTab.title=''; }
if(_armCard){ _armCard.style.opacity=''; _armCard.style.pointerEvents=''; _armCard.title=''; }
}catch(_e){}
}
(function restoreUnlocks(){
try{
if(localStorage.getItem('diy_unlocked_laser')==='1'){
$buildings.unlockedLaser=true;
if(!$buildings.WK.includes('laser')) $buildings.WK.push('laser');
}
if(localStorage.getItem('diy_weapon_plasmacutter')==='1'){
$psycho2._htPlasmaCutterUnlocked=true;
if(!$buildings.WK.includes('plasmacutter')) $buildings.WK.push('plasmacutter');
}
if(localStorage.getItem('diy_unlocked_alien')==='1'){
$buildings.unlockedAlien=true;
}
try{
const _dailyCard = document.getElementById('acard-daily');
const _hasPlayed = !!localStorage.getItem('diy_played');
if(!_hasPlayed){
const _armTab = document.getElementById('armory-tab');
const _armCard = document.getElementById('acard-armory');
if(_armTab){ _armTab.style.opacity='0.3'; _armTab.style.pointerEvents='none'; _armTab.title='Complete Boot Camp to unlock the Armory'; }
if(_armCard){ _armCard.style.opacity='0.3'; _armCard.style.pointerEvents='none'; _armCard.title='Complete Boot Camp to unlock'; }
if(_dailyCard){ _dailyCard.style.opacity='0.3'; _dailyCard.style.pointerEvents='none'; _dailyCard.title='Reach Wave 3 to unlock Daily Challenges'; }
} else {
_unlockArmoryUI();
if(_dailyCard){ _dailyCard.style.opacity=''; _dailyCard.style.pointerEvents=''; _dailyCard.title=''; }
}
}catch(_e){}
}catch(e){}
})();
window.getResumeInfo = function getResumeInfo(){
const cp = $legendary._checkpoint;
if(!(cp && cp.wave > 0)) return null;
const lvlName = cp.levelId && typeof gameDB !== 'undefined' && gameDB.getAllLevels
? (gameDB.getAllLevels().find(l=>l.id===cp.levelId)||{name:'CLASSIC'}).name
: 'CLASSIC';
const charName = (cp.selectedChar||'soldier').toUpperCase();
return { wave: cp.wave, detail: lvlName + ' · ' + charName + ' · SCORE ' + (cp.score||0) };
};
window.updateResumeButton = function updateResumeButton(){
if(typeof updateResumeBanner === 'function') updateResumeBanner();
}
window.resumeFromCheckpoint = function resumeFromCheckpoint(){
audioManager.uiClick();
if(!gameReady){ return; }
if(!$legendary._checkpoint) return;
if($legendary._checkpoint.selectedChar){
$replay.selectedChar = window.selectedChar = $legendary._checkpoint.selectedChar;
}
if($legendary._checkpoint.isBossRush){
startLevel({ bossRush: true, skipFirstWave: true, checkpoint: true });
return;
}
const allLevels = gameDB.getAllLevels();
const cp = $legendary._checkpoint;
let lvl = cp.levelId ? (allLevels.find(l=>l.id===cp.levelId)||null) : null;
const off = Number(cp.waveOffset) || 0;
if(lvl && off>0 && !lvl.isEndless){
  lvl = Object.assign({}, lvl, {
    minWaves: (Number(lvl.minWaves)||0) + off,
    maxWaves: (Number(lvl.maxWaves)||0) + off,
    _waveOffset: off,
    _carryBase: lvl,
  });
}
$replay.currentLevel = lvl;
startLevel({ level: lvl, skipFirstWave: true, checkpoint: true, waveOffset: off });
};
if(typeof updateResumeButton==='function') try{ updateResumeButton(); }catch(_e){}
initDailyChallenges();
renderDailyChallenges();
(function(){
const dcHeader = document.getElementById('dc-header');
const dcBody = document.getElementById('dc-body');
const dcTitle = document.getElementById('dc-title');
if(!dcHeader || !dcBody) return;
let dcOpen = false;
try { dcOpen = !localStorage.getItem('diy_played'); } catch(e) {}
if(dcOpen){ dcBody.style.display='block'; dcTitle.textContent='DAILY CHALLENGES ▲'; }
if(typeof renderDailyChallenges === 'function') try{ renderDailyChallenges(); }catch(_e){}
function toggleDC(){
dcOpen = !dcOpen;
dcBody.style.display = dcOpen ? 'block' : 'none';
dcTitle.textContent = 'DAILY CHALLENGES ' + (dcOpen ? '▲' : '▼');
if(dcOpen && typeof renderDailyChallenges === 'function') try{ renderDailyChallenges(); }catch(_e){}
}
let _dcPointerHandled = false;
dcHeader.addEventListener('pointerdown', e => {
e.stopPropagation();
_dcPointerHandled = true;
toggleDC();
});
dcHeader.addEventListener('click', e => {
if(_dcPointerHandled){ _dcPointerHandled = false; return; }
toggleDC();
});
})();
el('mobile-pause').addEventListener('touchstart', e => {
e.preventDefault();
if(el('upgrade-panel').style.display !== 'none') return;
togglePause();
}, {passive: false});
el('mobile-pause').addEventListener('click', e => {
if(el('upgrade-panel').style.display !== 'none') return;
togglePause();
});
const SCROLLABLE_SELECTORS = '#more-panel, #more-pane-settings, #more-pane-howtoplay, #more-pane-credits, #more-pane-armory, #story-crawl, #daily-challenges, #dc-body, #apple-menu-shell, .acard-body, .ams-content';
function isInsideScrollable(el) {
return !!el.closest(SCROLLABLE_SELECTORS);
}
document.addEventListener('touchmove', e => {
if($buildings.crawlActive) return;
if(isInsideScrollable(e.target)) return;
e.preventDefault();
}, {passive: false});
document.addEventListener('touchstart', e => {
if($buildings.crawlActive) return;
if(e.target.closest('#pause-overlay')||e.target.closest('#upgrade-panel')) return;
if(e.target.closest('#apple-menu-shell')||e.target.closest('#apple-pause-overlay')||e.target.closest('#first-launch-modal')) return;
if(e.target.closest('#more-panel')||e.target.closest('#end-card')) return;
if($buildings.state==='playing') e.preventDefault();
}, {passive: false});
});