window.__engine.files.push(function* psycho2() {
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
const { _hitScreenDesaturate, _ptclQPush, canSpawnBoss, ptcl, ptclBurst, ptclQ, radioChatter, shake } = $bosses;
const { _checkRunMilestones, _getAliveEnemies, _gst, _markEnemiesDirty, el, explodeDamageBuildings, showPickupMsg, unstuckBoss } = $buildings;
const { cachedLinearGradient } = $core;
const { activateGodMode, checkKillWhispers, dcOnBossKill, dcOnGrenadeKill, dcOnKill, dcOnStreak, dcOnWaveOrScore, nextWave, onBossDefeated } = $mutators;
const { _pushCrater, breakBuilding, onBuilding } = $psycho1;
Object.assign($psycho2, { _mutPillClear, _mutPillRebuild, _spawnShopDrone, _updateArmageddonBtnUI, activatePsychoMode, addKillFeed, armageddon, callAirstrike, deactivatePsychoMode, drawDrone, drawHarmTug, drawSpiderTank, floatText, floatTextPop, gainXP, grenadeExplode, hitJuice, killEnemy, killFlash, rocketExplode, showUpgradePanel, spawnAlly, spawnHarmTug, spawnHelicopter, spawnSpiderTank, throwGrenade, updateAllies, updateDrone, updateGrenadeHUD, updateHarmTug, updateSpiderTank, vibrate });
yield;


function activatePsychoMode() {
  if ($psycho1._psychoActive || $psycho1._psychoCooldown > 0 || $buildings.state !== 'playing' || $buildings.isPaused) return;
  $psycho1._psychoActive = true;
  $psycho1._psychoDuration = 0;
  const ov = document.getElementById('psycho-overlay');
  if (ov) ov.classList.add('active');
  radioChatter('▸ PSYCHO MODE', '#ff00ff', 2000);
  shake(4);
  try { audioManager.uiClick(); } catch(e) {}
}

function deactivatePsychoMode() {
  if (!$psycho1._psychoActive) return;
  $psycho1._psychoActive = false;
  $psycho1._psychoCooldown = $psycho1.PSYCHO_COOLDOWN;
  $psycho1._psychoDuration = 0;
  let released = 0;
  for (let i = 0; i < $buildings.bullets.length; i++) {
    const b = $buildings.bullets[i];
    if (b._psycho) {
      b.vx = b._pvx;
      b.vy = b._pvy;
      b.life = Math.min(b.life, 80);
      b._psycho = false;
      released++;
    }
  }
  const ov = document.getElementById('psycho-overlay');
  if (ov) ov.classList.remove('active');
  if (released > 0) {
    shake(released > 8 ? 12 : 6);
    if (!$core.isUltraLow) {
      try {
        $replay.mFlash.style.background = 'rgba(255,0,255,0.35)';
        $replay.mFlash.style.opacity = '1';
        setTimeout(() => { $replay.mFlash.style.opacity = '0'; }, 180);
      } catch(e) {}
    }
    floatTextPop($buildings.player.x, $buildings.player.y - 40, '* ' + released + ' ROUNDS FREE', '#ff00ff', 18);
  }
}
const _vibrateSupported = (()=>{
try { return $core.isMobile && typeof navigator.vibrate === 'function' && !(/iPad|iPhone|iPod/.test(navigator.userAgent)); } catch(e){ return false; }
})();
function vibrate(pattern){
if(!_vibrateSupported || !$buildings.settingVibration) return;
try{ navigator.vibrate(pattern); }catch(e){}
}
const MAX_FLOAT_TEXTS = 40;
/* per-tick kill 'juice budget': 1st kill of a burst = 100% particles/shake/flash/text, 2nd = 60%, 3rd+ = 30% */
let _killBurstTick = -1, _killBurstCount = 0;
function floatText(x,y,text,col='#aaff00',size=14){
if($buildings.floatingTexts.length>=MAX_FLOAT_TEXTS) $buildings.floatingTexts.shift();
$buildings.floatingTexts.push({x,y,text,col,size,life:60,vy:-0.8,scale:1,scaleV:0});
}
function floatTextPop(x,y,text,col='#aaff00',size=16){
if($buildings.floatingTexts.length>=MAX_FLOAT_TEXTS) $buildings.floatingTexts.shift();
$buildings.floatingTexts.push({x,y,text,col,size,life:70,vy:-1.1,scale:1.6,scaleV:-0.04});
}
let _killFlashTimeout = null;
let _killFlashAlpha = 0;
function _flashAlpha(col){
const m = /rgba?\([^)]*,\s*([\d.]+)\)/.exec(col);
return m ? parseFloat(m[1]) : 0.2;
}
function killFlash(col='rgba(255,220,100,0.18)', duration=55){
if($core.isVeryLow) return;
if($buildings.settingPerfMode){
$buildings._cvFlashColor=col; $buildings._cvFlash=Math.max(3,Math.round(duration/16));
return;
}
if(!$replay.mFlash) return;
const alpha = _flashAlpha(col);
if(_killFlashTimeout && alpha < _killFlashAlpha * 0.6) return;
_killFlashAlpha = alpha;
$replay.mFlash.style.background=col;
$replay.mFlash.style.opacity='1';
if(_killFlashTimeout) clearTimeout(_killFlashTimeout);
_killFlashTimeout=setTimeout(()=>{ $replay.mFlash.style.opacity='0'; _killFlashTimeout=null; _killFlashAlpha=0; }, duration);
}
function gainXP(amt){
const _waveXpMult = 1 + Math.min((typeof $buildings.wave !== 'undefined' ? $buildings.wave : 0), 20) * 0.02;
$buildings.playerXP += Math.round(amt * ($profiler._shopXpMult||1) * _waveXpMult * (window.__perkXp||1));
let _leveledUp = false;
while($buildings.playerXP >= $buildings.xpToNext){
$buildings.playerXP -= $buildings.xpToNext;
$buildings.playerLevel++;
$buildings.xpToNext = Math.floor(100 * Math.pow(1.55, $buildings.playerLevel-1) + 30 * Math.pow($buildings.playerLevel-1, 2));
_leveledUp = true;
}
if(_leveledUp){
audioManager.levelUp();
vibrate([50,30,50,30,50]);
const ln = el('levelup-notif');
ln.innerHTML = '▲ LEVEL UP ' + $buildings.playerLevel + ' ▲<br><span style="font-size:14px;letter-spacing:3px;color:#7fff00">STAT BONUS APPLIED</span>';
ln.style.opacity = '1';
setTimeout(() => ln.style.opacity='0', 2000);
if (typeof syncPrestigeBadge === 'function') try { syncPrestigeBadge(); } catch(_e) {}
if (typeof syncStreakBadge === 'function') try { syncStreakBadge(); } catch(_e) {}
if (typeof syncRouletteBadge === 'function') try { syncRouletteBadge(); } catch(_e) {}
const hpGain = 14 + Math.max(0, $buildings.playerLevel - 5) * 6;
$buildings.player.maxHp += hpGain;
$buildings.player.hp = Math.min($buildings.player.maxHp, $buildings.player.hp + hpGain);
$legendary.updateHP();
shake(4);
}
const pct = ($buildings.playerXP/$buildings.xpToNext)*100;
el('xp-fill').style.width = pct+'%';
el('player-level').textContent = $buildings.playerLevel;
}
const KF_MAX=5;
let kfEntries=[];
function addKillFeed(text,col='#aaff00',bigKill=false){
const feed=el('kill-feed');
if(!feed)return;
const div=document.createElement('div');
div.className='kf-entry'+(bigKill?' kf-big':'');
div.style.borderColor=col;
div.style.color=col;
if(bigKill){
div.style.background=`linear-gradient(90deg,rgba(0,0,0,0.95),${col}22,rgba(0,0,0,0.85))`;
div.style.borderWidth='2px';
div.style.fontSize='10px';
div.style.letterSpacing='2px';
}
div.textContent=text;
feed.appendChild(div);
kfEntries.push(div);
if(kfEntries.length>KF_MAX){const old=kfEntries.shift();old.remove();}
requestAnimationFrame(()=>div.classList.add('show'));
if(bigKill){
setTimeout(()=>{div.style.background=`linear-gradient(90deg,${col}44,${col}11,rgba(0,0,0,0.9))`;},80);
setTimeout(()=>{div.style.background=`linear-gradient(90deg,rgba(0,0,0,0.95),${col}22,rgba(0,0,0,0.85))`;},180);
}
setTimeout(()=>{div.classList.remove('show');setTimeout(()=>{div.remove();kfEntries=kfEntries.filter(e=>e!==div);},320);},bigKill?5000:3500);
}
function registerKill(x, y, pts){
$buildings.killStreak++;
if($buildings.killStreak===10) audioManager.orbitalEvent('streak');
dcOnStreak($buildings.killStreak);
clearTimeout($buildings.streakTO);
$buildings.streakTO = setTimeout(()=>{ $buildings.killStreak=0; $buildings._streakFired.clear(); el('streak-hud').style.opacity='0'; audioManager.setMusicIntensity(0); }, 4000);
const sh = el('streak-hud');
if($buildings.killStreak >= 3){
const labels = {3:'TRIPLE KILL!',5:'RAMPAGE!',8:'UNSTOPPABLE!',12:'GODLIKE!',20:'LEGENDARY!'};
const msg = Object.entries(labels).reverse().find(([k])=>$buildings.killStreak>=+k);
if(msg){
sh.innerHTML = msg[1] + '<br><span style=\"font-size:12px;color:#ffaa00\">×'+$buildings.killStreak+' STREAK</span>';
sh.style.opacity='1';
if($buildings.killStreak%5===0){ $buildings.score+=pts*$buildings.killStreak; floatText(x,y,'STREAK BONUS +'+pts*$buildings.killStreak,'#ff8800',16); shake(5); audioManager.streakSound(Math.min($buildings.killStreak,10)); killFlash('rgba(255,136,0,0.18)',70); vibrate([25,15,25]); }
[8,10,12,20].forEach(t=>{
if($buildings.killStreak>=t && !$buildings._streakFired.has(t)){
$buildings._streakFired.add(t);
if(t===8) $replay.ReplayRecorder.capture('▸ UNSTOPPABLE ×'+$buildings.killStreak,'combo');
if(t===10){ audioManager.playKillChord(); floatText(x, y - 30, '10 KILL STREAK', '#ffd700', 14); killFlash('rgba(255,255,255,0.45)', 150); }
if(t===12){ $replay.ReplayRecorder.capture('* GODLIKE ×'+$buildings.killStreak,'combo'); }
if(t===20){ activateGodMode(120); $replay.ReplayRecorder.capture('* LEGENDARY ×'+$buildings.killStreak+' — GOD MODE','combo'); }
}
});
}
} else { sh.style.opacity='0'; }
const _streakI = Math.min(1, $buildings.killStreak / 12);
const _enemyI = Math.min(0.5, ($buildings.enemies.filter(e=>e.alive&&!e.boss).length) / 20);
const _lowHpI = $buildings.player.hp / $buildings.player.maxHp < 0.3 ? 0.4 : 0;
const _bossI = $buildings.bossAlive ? 0.3 : 0;
const intensityLevel = Math.min(1, _streakI + _enemyI * 0.4 + _lowHpI + _bossI);
audioManager.setMusicIntensity(intensityLevel);
const _aiBars = document.querySelectorAll('.aint-bar');
if(_aiBars.length === 4){
const _aiHud = document.getElementById('audio-intensity-hud');
if(_aiHud) _aiHud.style.display = 'flex';
const _barCols = ['#3a7000','#aacc00','#ff8800','#ff2200'];
const _barHeights = [6, 9, 13, 18];
_aiBars.forEach((bar, i) => {
const lit = intensityLevel > i * 0.25;
bar.style.background = lit ? _barCols[i] : '#1e3200';
bar.style.height = lit ? _barHeights[i] + 'px' : '4px';
});
}
}
let _hitJuiceCounter=0;
let _lastBigHitStop=0;
function hitJuice(e,dmg,bx,by,isKillingBlow){
_hitJuiceCounter++;
e._hitPulse=Math.min(1,(e._hitPulse||0)+(dmg>=3?0.55:0.30));
const comboT=Math.min(1,$buildings.killStreak/15);
const _hjHp0 = (e._hpHitTick===$buildings.tick && e._hpBeforeHit!==undefined) ? e._hpBeforeHit : dmg;
const _hjTotal = Math.max(dmg, _hjHp0 - e.hp);
const overkill = isKillingBlow && _hjTotal > _hjHp0*1.8 && _hjHp0>3;
const showNum = overkill || $buildings.killStreak>=3 || (_hitJuiceCounter%2===0);
if(showNum && !$core.isUltraLow){
const numSize = 9+Math.min(7,comboT*7)+(overkill?5:0);
const numCol = overkill?'#ffff00':comboT>0.6?'#ff8800':'#ffcc99';
$buildings.floatingTexts.push({x:bx+(Math.random()-0.5)*6,y:by-10,text:(overkill?'!':'')+Math.round(dmg),col:numCol,size:numSize,life:26,vy:-1.4-comboT*0.6,scale:overkill?1.4:1,scaleV:overkill?-0.02:0});
}
if(overkill && !$core.isVeryLow){
ptclBurst(e.x,e.y,'#ffff00',$core.isMobile?6:14,6,18,3);
if(e.boss) $replay._freezeFrames=Math.max($replay._freezeFrames,6);
shake(7);
floatTextPop(e.x,e.y-30,'OVERKILL','#ffff00',15);
} else if(comboT>0.4 && !e.boss){
shake(1+comboT*1.5);
}
if(!isKillingBlow && !overkill && !$core.isVeryLow && (e.boss||(!($core.isUltraLow||$core.isLowEndDesktop)&&$enemies.get(e.type).ai.heavyHit)) && dmg>=3 && $buildings.tick-_lastBigHitStop>=6){
$replay._freezeFrames=Math.max($replay._freezeFrames,e.boss?2:1);
_lastBigHitStop=$buildings.tick;
}
}
function throwGrenade(){
if($buildings.grenadeCount<=0||$buildings.isPaused||$buildings.state!=='playing')return;
$buildings.grenadeCount=Math.max(0,$buildings.grenadeCount-1);
updateGrenadeHUD();
const angle = Math.atan2($buildings.mouse.y-$buildings.player.y, $buildings.mouse.x-$buildings.player.x);
const dist = Math.min(Math.hypot($buildings.mouse.x-$buildings.player.x, $buildings.mouse.y-$buildings.player.y), 280);
const tx = $buildings.player.x + Math.cos(angle)*dist;
const ty = $buildings.player.y + Math.sin(angle)*dist;
$buildings.grenades.push({x:$buildings.player.x,y:$buildings.player.y,tx,ty,speed:8,spin:0,fuse:Math.ceil(dist/8)+8,life:1});
audioManager.fire('grenade_throw');
if($props._guidedWave) $props.onGuidedGrenade();
}
function grenadeExplode(g){
shake(12,$buildings.player.x-g.x,$buildings.player.y-g.y);
audioManager.at(g.x,()=>audioManager.explosion());
ptclBurst(g.x,g.y,'#ff6600',30,7,20,3);
ptclBurst(g.x,g.y,'#ffcc00',12,4,22,2);
for(let i=0;i<4;i++) _ptclQPush({x:g.x,y:g.y,col:'#444',spd:8+Math.random(),life:38+Math.random()*8,sz:6+Math.random()*5});
$buildings.debrisArr.push({x:g.x,y:g.y,r:90,life:30,maxLife:30});
if($buildings.craters.filter(c=>!c._fromBuilding).length<$psycho1.MAX_OPEN_CRATERS){
_pushCrater({x:g.x,y:g.y,r:36,seed:(g.x*11+g.y*5)|0,_fromBuilding:false});
}
const fromEnemy = g.fromJet || g.fromHeli || g.fromAlien || g.fromCar || g.fromTank;
if(!fromEnemy){
const R = $psycho2.playerUpgrades&&$psycho2.playerUpgrades.bigBoom ? 130 : 90;
explodeDamageBuildings(g.x,g.y,R,10);
const _gExpTargets=_getAliveEnemies();
for(const e of _gExpTargets){
const d=Math.hypot(e.x-g.x,e.y-g.y);
if(d<R){
const dmg = Math.ceil(5*(1-d/R));
e.hp -= dmg;
floatText(e.x, e.y-20, '-'+dmg, '#ff6600', 12);
if(e.hp>0 && !e.boss && d>0){
const _kbA=Math.atan2(e.y-g.y,e.x-g.x);
const _kb=Math.min(5.5, (1-d/R)*6+1);
e.kbx=(e.kbx||0)+Math.cos(_kbA)*_kb;
e.kby=(e.kby||0)+Math.sin(_kbA)*_kb;
}
if(e.hp<=0){
let _isFirstGrenadeKillEver=false;
try{
if(!localStorage.getItem('diy_first_grenade_kill')){
localStorage.setItem('diy_first_grenade_kill','1');
_isFirstGrenadeKillEver=true;
}
}catch(_e){}
$mutators._dcLastKillWasGrenade = true;
killEnemy(e);
$mutators._dcLastKillWasGrenade = false;
dcOnGrenadeKill();
if(_isFirstGrenadeKillEver){
floatTextPop(g.x,g.y-40,'* EXPLOSIVE!','#ffcc00',18);
showPickupMsg('* GRENADE KILL!','#ffcc00','NICE THROW');
shake(10,$buildings.player.x-g.x,$buildings.player.y-g.y);
vibrate([30,20,30,20,50]);
}
} else if(e.boss){
$replay.bBarF.style.width=(e.hp/e.maxHp*100)+'%';
}
}
}
}
const pd=Math.hypot($buildings.player.x-g.x,$buildings.player.y-g.y);
const playerDmgRadius = fromEnemy ? 80 : 50;
if(pd<playerDmgRadius&&$buildings.player.shield<=0){
const _gDmg = $profiler._shopBlastArmor ? Math.ceil(15*0.4) : 15;
$buildings.player.hp-=_gDmg; $legendary.updateHP(); shake(8,$buildings.player.x-g.x,$buildings.player.y-g.y);
if(pd>0){const _gkA=Math.atan2($buildings.player.y-g.y,$buildings.player.x-g.x);const _gkb=3.5*(1-pd/playerDmgRadius);$buildings.player.kbx=($buildings.player.kbx||0)+Math.cos(_gkA)*_gkb;$buildings.player.kby=($buildings.player.kby||0)+Math.sin(_gkA)*_gkb;}
if($profiler._shopBlastArmor) floatTextPop($buildings.player.x,$buildings.player.y-30,'BLAST ARMOR','#aaff00',9);
}
}
function rocketExplode(b){
shake(18,$buildings.player.x-b.x,$buildings.player.y-b.y); audioManager.orbitalEvent('rocket');
audioManager.at(b.x,()=>audioManager.explosion());
ptclBurst(b.x,b.y,'#ff6600',$core.isMobile?24:50,9,25,4);
ptclBurst(b.x,b.y,'#ffcc00',$core.isMobile?10:20,5,22,2);
for(let i=0;i<6;i++) _ptclQPush({x:b.x,y:b.y,col:'#333',spd:12+Math.random()*2,life:52+Math.random()*8,sz:8+Math.random()*8});
$buildings.debrisArr.push({x:b.x,y:b.y,r:150,life:40,maxLife:40});
$buildings.debrisArr.push({x:b.x,y:b.y,r:80,life:28,maxLife:28});
if($buildings.craters.filter(c=>!c._fromBuilding).length<$psycho1.MAX_OPEN_CRATERS){
_pushCrater({x:b.x,y:b.y,r:42,seed:(b.x*11+b.y*5)|0,_fromBuilding:false});
}
if(!$core.isVeryLow){if($buildings.settingPerfMode){$buildings._cvFlashColor='rgba(255,100,0,0.18)';$buildings._cvFlash=7;}else{$replay.mFlash.style.opacity='1';setTimeout(()=>$replay.mFlash.style.opacity='0',200);}}
const R = (window._legendaryWeps && window._legendaryWeps.has('rpg')) ? 320 : 140;
if(b.own!=='enemy') explodeDamageBuildings(b.x,b.y,R,16);
if(window._legendaryWeps && window._legendaryWeps.has('rpg')){
shake(30);
ptclBurst(b.x,b.y,'#ffaa00',$core.isMobile?40:80,14,40,7);
killFlash('rgba(255,200,0,0.65)', 500);
floatTextPop(b.x, b.y-80, '! NUKE', '#ffff00', 24);
setTimeout(()=>audioManager.explosion(), 200);
}
const _rExpTargets=_getAliveEnemies();
for(const e of _rExpTargets){
const d=Math.hypot(e.x-b.x,e.y-b.y);
if(d<R){
const dmg=Math.ceil((b.dmg||8)*(1-d/R)*1.5);
e.hp-=dmg;
floatText(e.x,e.y-20,'-'+dmg,'#ff6600',14);
if(e.hp>0 && !e.boss && d>0){
const _kbA=Math.atan2(e.y-b.y,e.x-b.x);
const _kb=Math.min(7, (1-d/R)*8+1.5);
e.kbx=(e.kbx||0)+Math.cos(_kbA)*_kb;
e.kby=(e.kby||0)+Math.sin(_kbA)*_kb;
}
if(e.hp<=0) killEnemy(e);
else if(e.boss) $replay.bBarF.style.width=(e.hp/e.maxHp*100)+'%';
}
}
const pd=Math.hypot($buildings.player.x-b.x,$buildings.player.y-b.y);
const now=performance.now();
if(pd<40 && !($buildings.player._rpgInvincUntil && now < $buildings.player._rpgInvincUntil)){
if($buildings.player.shield>0){$buildings.player.shield=Math.max(0,$buildings.player.shield-60);}
else{
const _rDmg = $profiler._shopBlastArmor ? Math.ceil(4*0.4) : 4;
$buildings.player.hp-=_rDmg;$legendary.updateHP();shake(5);
if(pd>0){const _rkA=Math.atan2($buildings.player.y-b.y,$buildings.player.x-b.x);const _rkb=3*(1-pd/40);$buildings.player.kbx=($buildings.player.kbx||0)+Math.cos(_rkA)*_rkb;$buildings.player.kby=($buildings.player.kby||0)+Math.sin(_rkA)*_rkb;}
}
$buildings.player._rpgInvincUntil = now + 750;
floatTextPop($buildings.player.x, $buildings.player.y-30, $profiler._shopBlastArmor?'BLAST ARMOR':'▣ BLAST GUARD', $profiler._shopBlastArmor?'#aaff00':'#ffaa44', 9);
}
}
function callAirstrike(){
if(!$profiler._shopAirstrike || $buildings.state!=='playing' || $buildings.isPaused) return;
if($buildings.bossAlive && $buildings.tick < $buildings._airstrikeGraceUntil) {
floatTextPop($buildings.player.x, $buildings.player.y-50, '! BOSS JAMMING SIGNAL', '#ff4400', 13);
return;
}
$profiler._shopAirstrike = false;
const btn = document.getElementById('btn-airstrike');
if(btn) btn.style.display = 'none';
const pcBtn = document.getElementById('airstrike-btn-pc');
if(pcBtn) pcBtn.style.display = 'none';
const strikes = 3;
const spread = $replay.W * 0.7;
const startX = $replay.W * 0.15;
for(let i = 0; i < strikes; i++){
_gst(()=>{
const bx = startX + (spread / (strikes - 1)) * i + (Math.random()-0.5)*50;
const by = $buildings.player.y - 20 + (Math.random()-0.5)*60;
const bomb = { x:bx, y:by, dmg:30 };
ptclBurst(bx, by-60, '#ff8800', 12, 8, 30, 3);
_gst(()=>{
rocketExplode(bomb);
$buildings.enemies.forEach(e=>{
if(!e.alive) return;
const d = Math.hypot(e.x-bx, e.y-by);
if(d >= 140 && d < 160){
const dmg = Math.ceil(10 * (1 - (d-140)/20));
e.hp -= dmg;
floatText(e.x, e.y-20, '-'+dmg, '#ff6600', 11);
if(e.hp <= 0) killEnemy(e);
else if(e.boss) $replay.bBarF.style.width=(e.hp/e.maxHp*100)+'%';
}
});
}, 120);
}, i * 380);
}
floatTextPop($buildings.player.x, $buildings.player.y - 60, '▲ AIRSTRIKE!', '#ff8800', 18);
shake(10);
}
$psycho2._armageddonCDUntil = 0;
const ARMAGEDDON_CD_MS=45000;
function armageddonReady(){
return ($buildings._mutCfg&&$buildings._mutCfg.armageddon) && $buildings.state==='playing' && !$buildings.isPaused && performance.now()>=$psycho2._armageddonCDUntil;
}
function armageddonCooldownPct(){
const now=performance.now();
if(now>=$psycho2._armageddonCDUntil) return 1;
return 1-Math.min(1,($psycho2._armageddonCDUntil-now)/ARMAGEDDON_CD_MS);
}
function armageddon(){
if(!($buildings._mutCfg&&$buildings._mutCfg.armageddon) || $buildings.state!=='playing' || $buildings.isPaused) return;
const now=performance.now();
if(now<$psycho2._armageddonCDUntil){
floatTextPop($buildings.player.x, $buildings.player.y-50, 'ARMAGEDDON RECHARGING', '#ff4400', 12);
return;
}
$psycho2._armageddonCDUntil=now+ARMAGEDDON_CD_MS;
shake(30);
audioManager.explosion();_gst(()=>audioManager.explosion(),200);_gst(()=>audioManager.explosion(),420);
if(!$core.isVeryLow){if($buildings.settingPerfMode){$buildings._cvFlashColor='rgba(255,60,0,0.32)';$buildings._cvFlash=10;}else{$replay.mFlash.style.background='rgba(255,80,0,0.5)';$replay.mFlash.style.opacity='1';setTimeout(()=>$replay.mFlash.style.opacity='0',260);}}
const _aTargets=_getAliveEnemies();
const _n=$core.isMobile?40:90;
for(let i=0;i<_n;i++){
const ang=Math.random()*Math.PI*2, dist=Math.random()*Math.max($replay.W,$replay.H)*0.5;
_gst(()=>{
ptclBurst($buildings.player.x+Math.cos(ang)*dist, $buildings.player.y+Math.sin(ang)*dist, Math.random()<0.5?'#ff6600':'#ffee00', $core.isMobile?6:14, 7, 26, 3);
}, Math.random()*500);
}
$buildings.debrisArr.push({x:$buildings.player.x,y:$buildings.player.y,r:Math.max($replay.W,$replay.H)*0.6,life:50,maxLife:50});
_pushCrater({x:$buildings.player.x,y:$buildings.player.y,r:130,seed:($buildings.player.x*17+$buildings.player.y*9)|0,_fromBuilding:false});
for(const e of _aTargets){
const dmg=Math.ceil((e.maxHp||e.hp||10)*0.85)+40;
e.hp-=dmg;
floatText(e.x,e.y-20,'-'+dmg,'#ff6600',13);
if(e.hp<=0) killEnemy(e);
else if(e.boss) $replay.bBarF.style.width=(Math.max(0,e.hp)/e.maxHp*100)+'%';
}
if($psycho2.spiderTank&&$psycho2.spiderTank.alive){
$psycho2.spiderTank.hp-=Math.ceil($psycho2.spiderTank.maxHp*0.4);
if($psycho2.spiderTank.hp<=0) $psycho2.spiderTank.alive=false;
}
for(const b of [...$psycho1.buildings]){
if(Math.hypot((b.x+b.w/2)-$buildings.player.x,(b.y+b.h/2)-$buildings.player.y) < 220){
breakBuilding(b);
}
}
for(let i=$buildings.bullets.length-1;i>=0;i--){
if($buildings.bullets[i].own==='enemy'){ $legendary._removeBullet(i); }
}
floatTextPop($buildings.player.x, $buildings.player.y - 70, '! ARMAGEDDON!', '#ff2200', 22);
}
function _updateArmageddonBtnUI(){
const ready=armageddonReady();
const pct=armageddonCooldownPct();
const ids=['armageddon-btn-pc','btn-armageddon','av-armageddon'];
for(const id of ids){
const el2=document.getElementById(id);
if(!el2||el2.style.display==='none') continue;
el2.style.opacity=ready?'1':'0.4';
el2.style.filter=ready?'none':'grayscale(0.7)';
}
}
$psycho2.spiderTank = null;
function spawnSpiderTank(){
if($buildings.state!=='playing'||$buildings.isPaused||!canSpawnBoss())return;
const hp=120+$buildings.wave*15;
$psycho2.spiderTank={
x:$replay.W*0.5,y:-120,
hp,maxHp:hp,
alive:true,
spd:2.4+$buildings.wave*0.04,
phase:0,
legPhase:0,
dashTimer:0,
dashVx:0,dashVy:0,dashLife:0,
shootTimer:0,
webTimer:0,
angle:0,
smokeTrail:[],
hitFlash:0
};
$buildings.bossAlive=true;$buildings._airstrikeGraceUntil=$buildings.tick+1200;$replay.bBarW.style.opacity='1';$replay.bBarF.style.width='100%';
if($buildings._firstBossSpawnTick===null) $buildings._firstBossSpawnTick=$buildings.tick;
el('boss-bar-label').textContent='WAVE '+$buildings.wave+' — WIDOW MAKER';
audioManager.playBossMusic('spider');
bossRegistry.register('spiderTank', ()=>$psycho2.spiderTank, ()=>!!($psycho2.spiderTank&&$psycho2.spiderTank.alive));
}
function updateSpiderTank(){
if(!$psycho2.spiderTank||!$psycho2.spiderTank.alive)return;
const s=$psycho2.spiderTank;
s.phase+=0.08;
s.legPhase+=0.14;
s.hitFlash=Math.max(0,s.hitFlash-1);
if(s.dashLife>0){
s.smokeTrail.push({x:s.x,y:s.y,life:18,sz:10+Math.random()*6});
}
{let _st=s.smokeTrail,_sw=0;for(let _si=0;_si<_st.length;_si++){_st[_si].life--;if(_st[_si].life>0)_st[_sw++]=_st[_si];}s.smokeTrail.length=_sw;}
const dx=$buildings.player.x-s.x, dy=$buildings.player.y-s.y, dist=Math.hypot(dx,dy);
s.angle=Math.atan2(dy,dx);
if(s.dashLife>0){
s.x+=s.dashVx; s.y+=s.dashVy;
s.dashLife--;
if(s.dashLife===0){s.dashTimer=60+Math.floor(Math.random()*40);}
} else {
s.dashTimer=Math.max(0,s.dashTimer-1);
if(dist>60){
const jitter=(Math.random()-0.5)*0.6;
const a=s.angle+jitter;
const nx=s.x+Math.cos(a)*s.spd, ny=s.y+Math.sin(a)*s.spd;
const pad=38;
if(!onBuilding(nx,ny,pad)){s.x=nx;s.y=ny;}
else if(!onBuilding(nx,s.y,pad)){s.x=nx;}
else if(!onBuilding(s.x,ny,pad)){s.y=ny;}
}
if(s.dashTimer===0&&dist<400){
if(!s._dashWindup){ s._dashWindup=18; floatText(s.x,s.y-44,'CHARGE!','#ff4400',12); shake(3); }
s._dashWindup=(s._dashWindup||0)-1;
if(s._dashWindup<=0){
s._dashWindup=0;
s.dashVx=Math.cos(s.angle)*(s.spd*3.5);
s.dashVy=Math.sin(s.angle)*(s.spd*3.5);
s.dashLife=14;
shake(5); audioManager.hit();
}
} else { s._dashWindup=0; }
}
s.x=Math.max(50,Math.min($replay.W-50,s.x));
s.y=Math.max(50,Math.min($replay.H-50,s.y));
const predictFrames = 2;
const futureBossX = s.x + (s.dashVx || Math.cos(s.angle) * s.spd) * predictFrames;
const futureBossY = s.y + (s.dashVy || Math.sin(s.angle) * s.spd) * predictFrames;
const distToFuture = Math.hypot($buildings.player.x - futureBossX, $buildings.player.y - futureBossY);
const safetyDist = s.w * 0.8 + 15;
if(distToFuture < safetyDist){
const pushAngle = Math.atan2($buildings.player.y - futureBossY, $buildings.player.x - futureBossX);
const pushDist = Math.max(1, safetyDist - distToFuture + 12);
const pushX = Math.cos(pushAngle) * pushDist;
const pushY = Math.sin(pushAngle) * pushDist;
$buildings.player.x = Math.max(20, Math.min($replay.W - 20, $buildings.player.x + pushX));
$buildings.player.y = Math.max(20, Math.min($replay.H - 20, $buildings.player.y + pushY));
}
s.shootTimer++;
if(s.shootTimer>45){
s.shootTimer=0;
for(let i=-2;i<=2;i++){
const a=s.angle+i*0.22;
$buildings.bullets.push({x:s.x,y:s.y,vx:Math.cos(a)*9,vy:Math.sin(a)*9,own:'enemy',life:320,dmg:2,col:'#88ffcc',sz:3.5});
}
audioManager.at(s.x,()=>audioManager.fire('smg'));
}
s.webTimer++;
if(s.webTimer>120){
s.webTimer=0;
$buildings.bullets.push({x:s.x,y:s.y,vx:Math.cos(s.angle)*7,vy:Math.sin(s.angle)*7,own:'enemy',life:280,dmg:1,col:'#ccffee',sz:6,isWeb:true});
}
$legendary.applyAerialBossContact(s,44);
$buildings.allies.forEach(a=>{
if(!a.alive)return;
const da=Math.hypot(a.x-s.x,a.y-s.y);
if(da<50&&da>0){
a.hp-=0.3;
if(a.hp<=0){a.alive=false;ptcl(a.x,a.y,'#00ffcc',8,3);shake(3);}
const pushA=Math.atan2(a.y-s.y,a.x-s.x);
const nx=a.x+Math.cos(pushA)*(50-da+2);
const ny=a.y+Math.sin(pushA)*(50-da+2);
if(!onBuilding(nx,ny,12)){a.x=nx;a.y=ny;}
else if(!onBuilding(nx,a.y,12)){a.x=nx;}
else if(!onBuilding(a.x,ny,12)){a.y=ny;}
}
});
$buildings.bullets.forEach(b=>{
if(!s.alive)return;
if(b.own!=='player'&&b.own!=='ally')return;
const d=Math.hypot(b.x-s.x,b.y-s.y);
if(d<40){
s.hp-=b.dmg||1;
s.hitFlash=6;
ptcl(b.x,b.y,'#88ffcc',4,2);
audioManager.hit();
b.life=0;
$replay.bBarF.style.width=(Math.max(0,s.hp)/s.maxHp*100)+'%';
if(s.hp<=0){
s.alive=false;
ptclBurst(s.x,s.y,'#88ffcc',40,8,22,3);
ptclBurst(s.x,s.y,'#ff6600',16,5,20,2);
$buildings.debrisArr.push({x:s.x,y:s.y,r:200,life:55,maxLife:55});
if($buildings.craters.filter(c=>!c._fromBuilding).length<$psycho1.MAX_OPEN_CRATERS){
_pushCrater({x:s.x,y:s.y,r:80,seed:(s.x*13+s.y*7)|0,_fromBuilding:false});
}
shake(22); audioManager.explosion();
setTimeout(()=>audioManager.explosion(),350);
setTimeout(()=>audioManager.explosion(),700);
const pts=1800;$buildings.score+=pts;el('score-num').textContent=$buildings.score;
gainXP(200);floatText(s.x,s.y-50,'+'+pts,'#88ffcc',24);
$buildings.bossAlive=false;$replay.bBarW.style.opacity='0';audioManager.stopBossMusic();
bossRegistry.unregister('spiderTank');
$buildings.waveKills=$buildings.waveTotal;
$psycho2.spiderTank=null;
dcOnBossKill();$buildings._bossTypesThisRun.push('Spider Tank');onBossDefeated('spider');$replay.ReplayRecorder.capture('* SPIDER TANK ELIMINATED','boss_spider');
vibrate([80,40,80,40,200]);
}
}
});
}
function drawSpiderTank(){
if(!$psycho2.spiderTank||!$psycho2.spiderTank.alive)return;
const s=$psycho2.spiderTank;
$core.ctx.save();$core.ctx.translate(s.x+(s._recoilOffX||0),s.y+(s._recoilOffY||0));
if(s._dashWindup>0){
const prog=1-(s._dashWindup/18);
$core.ctx.save();
$core.ctx.globalAlpha=0.55+prog*0.35;
$core.ctx.strokeStyle='#ff4400';
$core.ctx.lineWidth=3+prog*3;
$core.ctx.setLineDash([6,4]);
$core.ctx.shadowColor='#ff4400';$core.ctx.shadowBlur=12*$core.SHADOW;
$core.ctx.beginPath();$core.ctx.arc(0,0,52+prog*12,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.setLineDash([]);
$core.ctx.restore();
}
$core.ctx.save();$core.ctx.globalAlpha=0.2;$core.ctx.fillStyle='#000';
$core.ctx.beginPath();$core.ctx.ellipse(0,18,50,14,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
if(!$profiler._skipTrailParticles){ for(let sm of s.smokeTrail){
$core.ctx.save();$core.ctx.globalAlpha=sm.life/18*0.35;$core.ctx.fillStyle='#88ffcc';
$core.ctx.beginPath();$core.ctx.arc(sm.x-s.x,sm.y-s.y,sm.sz,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
} }
const hitCol = s.hitFlash>0;
const bodyCol = hitCol?'#ffffff':'#1a3a2a';
const accentCol = hitCol?'#ffff00':'#00cc88';
$core.ctx.strokeStyle=hitCol?'#ffff00':'#00aa66';$core.ctx.lineWidth=4;$core.ctx.lineCap='round';
const legPositions=[[-18,-8],[-12,-6],[12,-6],[18,-8],[-18,8],[-12,6],[12,6],[18,8]];
legPositions.forEach(([lx,ly],i)=>{
const side=ly<0?-1:1;
const phase=s.legPhase+(i%4)*0.78;
const stepY=Math.sin(phase)*8*side;
const stepX=Math.cos(phase)*5;
$core.ctx.beginPath();$core.ctx.moveTo(lx,ly);$core.ctx.lineTo(lx+lx*0.9+stepX,ly+side*14+stepY);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(lx+lx*0.9+stepX,ly+side*14+stepY);$core.ctx.lineTo(lx+lx*1.4+stepX*0.6,ly+side*26+stepY*0.4);$core.ctx.stroke();
$core.ctx.fillStyle=accentCol;$core.ctx.beginPath();$core.ctx.arc(lx+lx*1.4+stepX*0.6,ly+side*26+stepY*0.4,3,0,Math.PI*2);$core.ctx.fill();
});
$core.ctx.shadowColor='#00ff88';$core.ctx.shadowBlur=(hitCol?30:16)*$core.SHADOW;
$core.ctx.fillStyle=bodyCol;
$core.ctx.beginPath();
$core.ctx.moveTo(-28,0);$core.ctx.lineTo(-20,-18);$core.ctx.lineTo(0,-22);$core.ctx.lineTo(20,-18);
$core.ctx.lineTo(28,0);$core.ctx.lineTo(20,18);$core.ctx.lineTo(0,22);$core.ctx.lineTo(-20,18);
$core.ctx.closePath();$core.ctx.fill();
$core.ctx.strokeStyle=accentCol;$core.ctx.lineWidth=1.5;$core.ctx.globalAlpha=0.5;
$core.ctx.beginPath();$core.ctx.moveTo(-14,-10);$core.ctx.lineTo(0,-14);$core.ctx.lineTo(14,-10);$core.ctx.lineTo(14,10);$core.ctx.lineTo(0,14);$core.ctx.lineTo(-14,10);$core.ctx.closePath();$core.ctx.stroke();
$core.ctx.globalAlpha=1;
$core.ctx.fillStyle=hitCol?'#ffff88':'#002a18';
$core.ctx.beginPath();$core.ctx.ellipse(0,-4,14,11,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='rgba(0,255,136,0.25)';
$core.ctx.beginPath();$core.ctx.ellipse(0,-4,12,9,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=hitCol?'#ff0000':'#00ff88';$core.ctx.shadowColor=hitCol?'#ff0000':'#00ff88';$core.ctx.shadowBlur=(10)*$core.SHADOW;
$core.ctx.beginPath();$core.ctx.arc(-5,-5,3.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.arc(5,-5,3.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.save();$core.ctx.rotate(s.angle);
$core.ctx.fillStyle=hitCol?'#ffff00':'#0a2a1a';$core.ctx.fillRect(0,-5,20,10);
$core.ctx.fillStyle=accentCol;$core.ctx.fillRect(18,-3,10,6);
$core.ctx.fillStyle='#004422';$core.ctx.beginPath();$core.ctx.arc(28,0,5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
$core.ctx.restore();
$core.ctx.save();
$core.ctx.translate(s.x, s.y);
const bw = 90;
$core.ctx.fillStyle='#200000'; $core.ctx.fillRect(-bw/2,-38,bw,7);
$core.ctx.fillStyle = s.hp/s.maxHp > 0.5 ? '#00ff88' : s.hp/s.maxHp > 0.25 ? '#ffcc00' : '#ff3300';
$core.ctx.fillRect(-bw/2,-38, bw*(Math.max(0,s.hp)/s.maxHp), 7);
$core.ctx.restore();
}
$psycho2.harmTug = null;
$psycho2._htMedal = false;
try { $psycho2._htMedal = !!localStorage.getItem('diy_medal_ironGhost'); } catch(e){}
$psycho2._htPlasmaCutterUnlocked = false;
try { $psycho2._htPlasmaCutterUnlocked = !!localStorage.getItem('diy_weapon_plasmacutter'); } catch(e){}
function spawnHarmTug(){
if($buildings.state!=='playing'||$buildings.isPaused||!canSpawnBoss())return;
const hp = 400 + $buildings.wave*20;
$psycho2.harmTug = {
x:$replay.W*0.5, y:$replay.H*0.15,
hp, maxHp:hp,
alive:true,
spd:1.8,
phase:0,
legPhase:0,
hitFlash:0,
bossPhase:1,
laserTimer:0, laserActive:false, laserAngle:0, laserSweep:0, laserCooldown:0,
jumpTimer:0, jumping:false, jumpVy:0, jumpY:0, landTimer:0,
dashTimer:0, dashVx:0, dashVy:0, dashLife:0, dashCooldown:0,
troopTimer:0,
eyePulse:0,
smokeTrail:[],
angle:0
};
$buildings.bossAlive=true; $buildings._airstrikeGraceUntil=$buildings.tick+1200; $replay.bBarW.style.opacity='1'; $replay.bBarF.style.width='100%';
if($buildings._firstBossSpawnTick===null) $buildings._firstBossSpawnTick=$buildings.tick;
el('boss-bar-label').innerHTML='<span style=\"color:#ff0066\">▸ HARM &amp; TUG — ROGUE PROTOCOL</span>';
audioManager.playBossMusic('harmtug');
bossRegistry.register('harmTug', ()=>$psycho2.harmTug, ()=>!!($psycho2.harmTug&&$psycho2.harmTug.alive));
}
function updateHarmTug(){
if(!$psycho2.harmTug||!$psycho2.harmTug.alive)return;
const s=$psycho2.harmTug;
s.phase+=0.07; s.legPhase+=0.16; s.eyePulse+=0.08;
s.hitFlash=Math.max(0,s.hitFlash-1);
const hpPct = s.hp/s.maxHp;
if(hpPct<0.25 && s.bossPhase<3){ s.bossPhase=3; s._phaseWindupUntil=$buildings.tick+32; shake(14); floatText(s.x,s.y-60,'DESPERATE PROTOCOL!','#ff0066',18); }
else if(hpPct<0.55 && s.bossPhase<2){ s.bossPhase=2; s._phaseWindupUntil=$buildings.tick+32; shake(10); floatText(s.x,s.y-60,'BERSERK MODE!','#ff6600',16); }
const _effPhase = (s._phaseWindupUntil && $buildings.tick < s._phaseWindupUntil) ? s.bossPhase - 1 : s.bossPhase;
const speedMult = _effPhase===3?1.9:_effPhase===2?1.4:1.0;
if(s.dashLife>0 || s.jumping){
s.smokeTrail.push({x:s.x,y:s.y,life:14,sz:12+Math.random()*6});
}
{let _st=s.smokeTrail,_sw=0;for(let _si=0;_si<_st.length;_si++){_st[_si].life--;if(_st[_si].life>0)_st[_sw++]=_st[_si];}s.smokeTrail.length=_sw;}
s.jumpTimer++;
const jumpInterval = _effPhase===3?140:_effPhase===2?180:240;
if(!s.jumping && !s.laserActive && s.jumpTimer>jumpInterval){
if(!s._jumpWindup){
s._jumpWindup=24;
s.jumpTargetX=$buildings.player.x+(Math.random()-0.5)*60;
s.jumpTargetY=$buildings.player.y+(Math.random()-0.5)*60;
floatText(s.x,s.y-50,'JUMP!','#ff0066',13);
shake(4);
}
s._jumpWindup--;
if(s._jumpWindup<=0){
s._jumpWindup=0; s.jumpTimer=0; s.jumping=true;
s.jumpY=s.y; s.jumpVy=-18;
ptclQ(s.x,s.y,'#ff0066',$core.isMobile?4:8,5);
}
}
if(s.jumping){
s.y+=s.jumpVy; s.jumpVy+=1.2;
const dx=s.jumpTargetX-s.x, dy=s.jumpTargetY-s.y;
s.x+=dx*0.06;
if(s.y>=s.jumpY){
s.y=s.jumpY; s.jumping=false; s.jumpVy=0;
shake(16); ptclQ(s.x,s.y,'#ff4400',$core.isMobile?6:14,7);
ptclQ(s.x,s.y,'#ffffff',$core.isMobile?3:6,4);
$buildings.debrisArr.push({x:s.x,y:s.y,r:60,life:18,maxLife:18,col:'#ff0066'});
const pd=Math.hypot($buildings.player.x-s.x,$buildings.player.y-s.y);
if(pd<70){ const dmg=Math.ceil(12*(1-pd/70)); if($buildings.player.shield>0){$buildings.player.shield=Math.max(0,$buildings.player.shield-dmg*25);}else{$buildings.player.hp-=dmg;$legendary.updateHP();vibrate(50);if(pd>0){const _skA=Math.atan2($buildings.player.y-s.y,$buildings.player.x-s.x);const _skb=4*(1-pd/70);$buildings.player.kbx=($buildings.player.kbx||0)+Math.cos(_skA)*_skb;$buildings.player.kby=($buildings.player.kby||0)+Math.sin(_skA)*_skb;}} }
}
}
s.dashCooldown=Math.max(0,s.dashCooldown-1);
if(!s.jumping && !s.laserActive){
if(s.dashLife>0){
s.x+=s.dashVx; s.y+=s.dashVy; s.dashLife--;
if(s.dashLife===0){ s.dashCooldown=_effPhase===3?80:120; }
} else if(s.dashCooldown===0){
if(!s._dashWindup){ s._dashWindup=16; floatText(s.x,s.y-44,'DASH!','#ff6600',11); shake(3); }
s._dashWindup=(s._dashWindup||0)-1;
if(s._dashWindup<=0){
s._dashWindup=0;
const a=Math.atan2($buildings.player.y-s.y,$buildings.player.x-s.x);
s.dashVx=Math.cos(a)*(s.spd*5*speedMult); s.dashVy=Math.sin(a)*(s.spd*5*speedMult);
s.dashLife=10; shake(7);
ptclQ(s.x,s.y,'#ff0066',$core.isMobile?3:6,4);
}
}
}
if(!s.jumping && s.dashLife===0 && !s.laserActive){
const dx=$buildings.player.x-s.x, dy=$buildings.player.y-s.y, dist=Math.hypot(dx,dy);
s.angle=Math.atan2(dy,dx);
if(dist>80){
const jitter=(Math.random()-0.5)*0.4;
const a=s.angle+jitter;
const nx=s.x+Math.cos(a)*s.spd*speedMult;
const ny=s.y+Math.sin(a)*s.spd*speedMult;
const pad=42;
if(!onBuilding(nx,ny,pad)){s.x=nx;s.y=ny;}
else if(!onBuilding(nx,s.y,pad)){s.x=nx;}
else if(!onBuilding(s.x,ny,pad)){s.y=ny;}
}
}
s.x=Math.max(60,Math.min($replay.W-60,s.x));
s.y=Math.max(60,Math.min($replay.H-60,s.y));
s.laserCooldown=Math.max(0,s.laserCooldown-1);
if(!s.jumping && s.dashLife===0 && s.laserCooldown===0 && !s.laserActive){
const laserInterval = _effPhase===3?80:_effPhase===2?120:180;
s.laserTimer++;
if(s.laserTimer>laserInterval){
s.laserTimer=0; s.laserActive=true;
s.laserAngle=Math.atan2($buildings.player.y-s.y,$buildings.player.x-s.x);
s.laserSweep=0;
floatText(s.x,s.y-55,'LASER!','#ff0066',14);
}
}
if(s.laserActive){
const sweepSpeed=_effPhase===3?0.055:0.038;
s.laserSweep+=sweepSpeed;
s.laserAngle+=sweepSpeed*0.6;
const laserLen=220;
const lx=s.x+Math.cos(s.laserAngle)*laserLen;
const ly=s.y+Math.sin(s.laserAngle)*laserLen;
const pdl=Math.hypot($buildings.player.x-s.x,$buildings.player.y-s.y);
if(pdl<laserLen){
const playerAngle=Math.atan2($buildings.player.y-s.y,$buildings.player.x-s.x);
let angleDiff=Math.abs(playerAngle-s.laserAngle);
while(angleDiff>Math.PI)angleDiff=Math.abs(angleDiff-Math.PI*2);
if(angleDiff<0.2){
const dmg=0.35*speedMult;
if($buildings.player.shield>0){$buildings.player.shield=Math.max(0,$buildings.player.shield-dmg*8);}
else{$buildings.player.hp-=dmg;$legendary.updateHP();if($buildings.tick%20===0)shake(3);}
if($buildings.player.hp<=0)$props.triggerPlayerDeath('laser');
}
}
if(s.laserSweep>1.8){s.laserActive=false;s.laserCooldown=_effPhase===3?60:100;}
}
const troopInterval = _effPhase===3?220:_effPhase===2?300:420;
s.troopTimer++;
if(s.troopTimer>troopInterval && $buildings.enemies.filter(e=>e.alive&&!e.boss).length<8){
s.troopTimer=0;
const count=_effPhase===3?3:2;
for(let t=0;t<count;t++){
const ta=Math.random()*Math.PI*2;
const td=80+Math.random()*60;
const tx=Math.max(20,Math.min($replay.W-20,s.x+Math.cos(ta)*td));
const ty=Math.max(20,Math.min($replay.H-20,s.y+Math.sin(ta)*td));
ptclQ(tx,ty,'#ff0066',$core.isMobile?3:6,3);
$buildings.enemies.push({x:tx,y:ty,type:'soldier',w:20,h:24,hp:2,maxHp:2,spd:2.8,st:0,si:50,alive:true,boss:false,
walkT:Math.random()*100,col:'#220033',bomber:false,stuckTimer:0,stuckX:tx,stuckY:ty});
}
floatText(s.x,s.y-45,'DEPLOYING TROOPS','#ff0066',11);
$buildings.waveTotal+=count;
}
if(!s.laserActive && s.dashLife===0){
s.angle=Math.atan2($buildings.player.y-s.y,$buildings.player.x-s.x);
s.shootTimer=(s.shootTimer||0)+1;
const shootInterval=_effPhase===3?18:_effPhase===2?24:34;
if(s.shootTimer>shootInterval){
s.shootTimer=0;
const spread = _effPhase===3?5:_effPhase===2?4:3;
for(let i=-(spread>>1);i<=(spread>>1);i++){
const a=s.angle+i*0.18;
$buildings.bullets.push({x:s.x,y:s.y,vx:Math.cos(a)*11,vy:Math.sin(a)*11,own:'enemy',life:380,dmg:2,col:'#ff0066',sz:3.5});
}
audioManager.at(s.x,()=>audioManager.fire('smg'));
}
}
$buildings.bullets.forEach(b=>{
if(!s.alive)return;
if(b.own!=='player'&&b.own!=='ally'&&b.own!=='player2')return;
const d=Math.hypot(b.x-s.x,b.y-s.y);
if(d<46){
s.hp-=b.dmg||1; s.hitFlash=8;
ptcl(b.x,b.y,'#ff0066',4,3);
audioManager.hit(); b.life=0;
$replay.bBarF.style.width=(Math.max(0,s.hp)/s.maxHp*100)+'%';
if(s.hp<=0){ _killHarmTug(); }
}
});
const cd=Math.hypot($buildings.player.x-s.x,$buildings.player.y-s.y);
if(cd<52&&cd>0){
const dmg=0.4*(_effPhase===3?2:1);
if($buildings.player.shield>0){$buildings.player.shield=Math.max(0,$buildings.player.shield-dmg*15);}
else{$buildings.player.hp-=dmg;$legendary.updateHP();if($buildings.tick%15===0){shake(4);vibrate(30);}if($buildings.player.hp<=0)$props.triggerPlayerDeath('contact');}
const pa=Math.atan2($buildings.player.y-s.y,$buildings.player.x-s.x);
const ovlp=52-cd;
const nx=$buildings.player.x+Math.cos(pa)*(ovlp+2),ny=$buildings.player.y+Math.sin(pa)*(ovlp+2);
if(!onBuilding(nx,ny,8)){$buildings.player.x=nx;$buildings.player.y=ny;}
else if(!onBuilding(nx,$buildings.player.y,8)){$buildings.player.x=nx;}
else if(!onBuilding($buildings.player.x,ny,8)){$buildings.player.y=ny;}
}
}
function _tryRun(fn, label){ try{ return fn(); }catch(_e){ if(label) console.warn('['+label+'] failed', _e); } }
function _runBoundTimeout(fn, ms){
const gen = window._diyRunGen || 0;
return setTimeout(()=>{ try{ if((window._diyRunGen||0) !== gen) return; fn(); }catch(_e){} }, ms);
}
function _killHarmTug(){
const s=$psycho2.harmTug;
s.alive=false;
shake(28);
audioManager.at(s.x,()=>audioManager.explosion());
setTimeout(()=>audioManager.explosion(),300);
setTimeout(()=>audioManager.explosion(),700);
setTimeout(()=>audioManager.explosion(),1200);
ptclBurst(s.x,s.y,'#ff0066',$core.isMobile?24:50,9,25,3);
ptclBurst(s.x,s.y,'#ffffff',$core.isMobile?12:25,6,22,2);
ptclBurst(s.x,s.y,'#00eeff',$core.isMobile?10:20,5,20,2);
$buildings.debrisArr.push({x:s.x,y:s.y,r:280,life:70,maxLife:70,col:'#ff0066'});
$buildings.debrisArr.push({x:s.x,y:s.y,r:160,life:50,maxLife:50,col:'#ffffff'});
if($buildings.craters.filter(c=>!c._fromBuilding).length<$psycho1.MAX_OPEN_CRATERS){
_pushCrater({x:s.x,y:s.y,r:100,seed:(s.x*13+s.y*7)|0,_fromBuilding:false});
}
const pts=8000; $buildings.score+=pts; el('score-num').textContent=$buildings.score;
gainXP(1000);
floatText(s.x,s.y-60,'+'+pts,'#ff0066',28);
floatText(s.x,s.y-90,'▸ HARM & TUG DEFEATED','#ff0066',14);
$buildings.bossAlive=false; $replay.bBarW.style.opacity='0';
audioManager.stopBossMusic();
bossRegistry.unregister('harmTug');
$psycho2.harmTug=null;
try{ $legendary.clearCheckpoint(); }catch(_e){}
_tryRun(()=>dcOnBossKill(), 'HarmTug dcOnBossKill');
_tryRun(()=>$buildings._bossTypesThisRun.push('Harm & Tug'));
_tryRun(()=>onBossDefeated('harmtug'), 'HarmTug onBossDefeated');
_tryRun(()=>$replay.ReplayRecorder.capture('* HARM & TUG ELIMINATED','boss_harmtug'));
_tryRun(()=>vibrate([100,40,100,40,100,40,300]));
$buildings.waveInProgress=false; $buildings.wavePending=true;
if(!$psycho2._htPlasmaCutterUnlocked){
$psycho2._htPlasmaCutterUnlocked=true;
try{localStorage.setItem('diy_weapon_plasmacutter','1');}catch(e){}
try{ if(!$buildings.WK.includes('plasmacutter'))$buildings.WK.push('plasmacutter'); }catch(_e){}
try{ $buildings.wepAmmo.plasmacutter=$buildings.WEAPONS.plasmacutter.ammo; }catch(_e){}
try{ if(!$buildings.wepUpgrades.plasmacutter)$buildings.wepUpgrades.plasmacutter={dmg:0,ammo:0,reload:0}; }catch(_e){}
try{ if(typeof $profiler.buildWepStrip==='function') $profiler.buildWepStrip(); }catch(_e){ console.warn('[HarmTug] buildWepStrip failed', _e); }
_gst(()=>{
try{ $profiler.showUnlockBanner('PLASMA CUTTER UNLOCKED — THE ROGUE\'S OWN WEAPON','NOW IN YOUR ARSENAL'); }catch(_e){}
},600);
}
if(!$psycho2._htMedal){
$psycho2._htMedal=true;
try{localStorage.setItem('diy_medal_ironGhost','1');}catch(e){}
_gst(()=>{
try{ $profiler.showUnlockBanner('#1 IRON GHOST MEDAL AWARDED','YOU FACED THE ROGUE AI — AND WON'); }catch(_e){}
},2800);
}
if(window._bossRushMode){
const _bossRushGen = window._diyRunGen || 0;
window._armStuckWatchdog('Boss Rush ending', 'menu', 8000);
_gst(()=>{
if((window._diyRunGen||0) !== _bossRushGen) return;
try{ $profiler.showUnlockBanner('▸ BOSS RUSH CLEARED','ALL 7 BOSSES DEFEATED'); }catch(_e){}
_gst(()=>{
if((window._diyRunGen||0) !== _bossRushGen) return;
try{ (window.goToMenu||$props.goToMenu)(); }catch(_e){}
}, 2400);
}, 4500);
_runBoundTimeout(()=>{ if(window.state!=='menu') (window.goToMenu||$props.goToMenu)(); }, 9000);
} else {
window._armStuckWatchdog('Harm & Tug credits', 'menu', 45000);
_gst(()=>{ try{ $props.showHarmTugCredits(false); }catch(_e){ try{ (window.goToMenu||$props.goToMenu)(); }catch(_e2){} } }, 4500);
_runBoundTimeout(()=>{ if(window.state!=='menu') (window.goToMenu||$props.goToMenu)(); }, 12000);
}
}
function drawHarmTug(){
if(!$psycho2.harmTug||!$psycho2.harmTug.alive)return;
const s=$psycho2.harmTug;
const hitCol=s.hitFlash>0;
const phase2col = s.bossPhase===3?'#ff0000':s.bossPhase===2?'#ff4400':'#ff0066';
const legCol = hitCol?'#ffffff':phase2col;
if(s._jumpWindup>0 && s.jumpTargetX!==undefined){
const prog = 1-(s._jumpWindup/24);
$core.ctx.save();
$core.ctx.globalAlpha=0.4+prog*0.45;
$core.ctx.strokeStyle='#ff0066';
$core.ctx.lineWidth=2+prog*2;
$core.ctx.setLineDash([5,4]);
$core.ctx.shadowColor='#ff0066';$core.ctx.shadowBlur=14*$core.SHADOW;
$core.ctx.beginPath();$core.ctx.arc(s.jumpTargetX,s.jumpTargetY,36+prog*20,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.setLineDash([]);
$core.ctx.globalAlpha=0.18+prog*0.2;
$core.ctx.fillStyle='#ff0066';
$core.ctx.beginPath();$core.ctx.arc(s.jumpTargetX,s.jumpTargetY,36+prog*20,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
}
if(s._dashWindup>0){
const prog=1-(s._dashWindup/16);
$core.ctx.save();
$core.ctx.globalAlpha=0.5+prog*0.4;
$core.ctx.strokeStyle='#ff6600';
$core.ctx.lineWidth=3+prog*3;
$core.ctx.setLineDash([6,3]);
$core.ctx.shadowColor='#ff6600';$core.ctx.shadowBlur=10*$core.SHADOW;
$core.ctx.beginPath();$core.ctx.arc(s.x,s.y,62+prog*10,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.setLineDash([]);
$core.ctx.restore();
}
$core.ctx.save();$core.ctx.translate(s.x,s.y);
$core.ctx.save();$core.ctx.globalAlpha=0.22;$core.ctx.fillStyle='#000';
$core.ctx.beginPath();$core.ctx.ellipse(0,28,52,16,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
if(!$profiler._skipTrailParticles){ for(const sm of s.smokeTrail){
$core.ctx.save();$core.ctx.globalAlpha=sm.life/14*0.3;$core.ctx.fillStyle=phase2col;
$core.ctx.beginPath();$core.ctx.arc(sm.x-s.x,sm.y-s.y,sm.sz,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
} }
$core.ctx.strokeStyle=legCol; $core.ctx.lineWidth=5; $core.ctx.lineCap='round';
const legDefs=[[-20,-6],[-16,-4],[16,-4],[20,-6],[-20,6],[16,6]];
legDefs.forEach(([lx,ly],i)=>{
const side=ly>=0?1:-1;
const phase=s.legPhase+(i%3)*1.05;
const sw=Math.sin(phase)*9*side;
const cw=Math.cos(phase)*6;
$core.ctx.beginPath();$core.ctx.moveTo(lx,ly);$core.ctx.lineTo(lx+lx*1.1+cw,ly+side*16+sw);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(lx+lx*1.1+cw,ly+side*16+sw);$core.ctx.lineTo(lx+lx*1.6+cw*0.5,ly+side*30+sw*0.4);$core.ctx.stroke();
$core.ctx.strokeStyle=hitCol?'#ffff00':phase2col; $core.ctx.lineWidth=2;
const fx=lx+lx*1.6+cw*0.5, fy=ly+side*30+sw*0.4;
$core.ctx.beginPath();$core.ctx.moveTo(fx,fy);$core.ctx.lineTo(fx+4*Math.sign(lx),fy+3);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(fx,fy);$core.ctx.lineTo(fx+4*Math.sign(lx),fy-3);$core.ctx.stroke();
$core.ctx.strokeStyle=legCol; $core.ctx.lineWidth=5;
});
$core.ctx.shadowColor=phase2col; $core.ctx.shadowBlur=(hitCol?32:18)*$core.SHADOW;
$core.ctx.fillStyle=hitCol?'#ffffff':'#1a0020';
$core.ctx.beginPath();
$core.ctx.moveTo(-26,0);$core.ctx.lineTo(-18,-22);$core.ctx.lineTo(0,-26);$core.ctx.lineTo(18,-22);
$core.ctx.lineTo(26,0);$core.ctx.lineTo(18,22);$core.ctx.lineTo(0,26);$core.ctx.lineTo(-18,22);
$core.ctx.closePath();$core.ctx.fill();
$core.ctx.strokeStyle=hitCol?'#ffff00':phase2col;$core.ctx.lineWidth=1.5;$core.ctx.globalAlpha=0.5;
$core.ctx.beginPath();$core.ctx.moveTo(-12,-12);$core.ctx.lineTo(0,-16);$core.ctx.lineTo(12,-12);
$core.ctx.lineTo(16,0);$core.ctx.lineTo(12,12);$core.ctx.lineTo(0,16);$core.ctx.lineTo(-12,12);$core.ctx.lineTo(-16,0);$core.ctx.closePath();$core.ctx.stroke();
$core.ctx.globalAlpha=1;
$core.ctx.fillStyle=hitCol?'#ffff00':'#2a0030';
$core.ctx.beginPath();$core.ctx.ellipse(0,-18,10,6,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle=phase2col;$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.ellipse(0,-18,10,6,0,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.fillStyle=hitCol?'#ffffff':'#1a0818';
$core.ctx.fillRect(-14,-42,28,24);
$core.ctx.fillStyle=hitCol?'#ffff88':phase2col+'44';
$core.ctx.fillRect(-12,-40,24,8);
$core.ctx.fillStyle=hitCol?'#ffffff':phase2col;
$core.ctx.fillRect(-4,-40,8,8);
$core.ctx.strokeStyle=hitCol?'#ffff00':'#440033'; $core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.moveTo(-14,-34);$core.ctx.lineTo(14,-34);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(-14,-28);$core.ctx.lineTo(14,-28);$core.ctx.stroke();
$core.ctx.save();$core.ctx.rotate(-0.2+Math.sin(s.phase)*0.1);
$core.ctx.strokeStyle=hitCol?'#ffffff':'#330022'; $core.ctx.lineWidth=7;
$core.ctx.beginPath();$core.ctx.moveTo(-14,-36);$core.ctx.lineTo(-24,-26);$core.ctx.stroke();
$core.ctx.save();$core.ctx.translate(-24,-26);$core.ctx.rotate(-0.5);
$core.ctx.fillStyle=hitCol?'#ffff00':'#220018';$core.ctx.fillRect(0,-4,18,8);
$core.ctx.fillStyle=phase2col;$core.ctx.beginPath();$core.ctx.arc(18,0,4,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
$core.ctx.restore();
$core.ctx.save();$core.ctx.rotate(0.2+Math.sin(s.phase+1)*0.1);
$core.ctx.strokeStyle=hitCol?'#ffffff':'#330022'; $core.ctx.lineWidth=7;
$core.ctx.beginPath();$core.ctx.moveTo(14,-36);$core.ctx.lineTo(24,-26);$core.ctx.stroke();
$core.ctx.save();$core.ctx.translate(24,-26);$core.ctx.rotate(0.5);
$core.ctx.fillStyle=hitCol?'#ffff00':'#220018';$core.ctx.fillRect(-18,-4,18,8);
$core.ctx.fillStyle=phase2col;$core.ctx.beginPath();$core.ctx.arc(-18,0,4,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
$core.ctx.restore();
$core.ctx.strokeStyle=hitCol?'#ffff00':'#440033'; $core.ctx.lineWidth=3;
for(let nc=-2;nc<=2;nc++){
$core.ctx.beginPath();$core.ctx.moveTo(nc*2,-42);$core.ctx.lineTo(nc*3,-52);$core.ctx.stroke();
}
const skinCol=hitCol?'#ffffff':'#c8a070';
$core.ctx.fillStyle=skinCol;
$core.ctx.beginPath();$core.ctx.ellipse(0,-58,9,11,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=hitCol?'#ffff88':'#330055';
$core.ctx.beginPath();$core.ctx.ellipse(0,-64,9,6,0,Math.PI,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle=phase2col;$core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.moveTo(-6,-64);$core.ctx.lineTo(6,-64);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(-4,-67);$core.ctx.lineTo(4,-67);$core.ctx.stroke();
$core.ctx.fillStyle=hitCol?'#ffffff':s.bossPhase===3?'#ff0000':'#ff0066';
$core.ctx.shadowColor=s.bossPhase===3?'#ff0000':'#ff0066'; $core.ctx.shadowBlur=(10+Math.sin(s.eyePulse)*4)*$core.SHADOW;
$core.ctx.beginPath();$core.ctx.ellipse(-4,-58,3,2.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(4,-58,3,2.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle=hitCol?'#ffffff':skinCol; $core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.moveTo(-5,-54);$core.ctx.quadraticCurveTo(0,-51,5,-54);$core.ctx.stroke();
if(s.bossPhase>=2){
$core.ctx.strokeStyle='#220011';$core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.moveTo(-2,-56);$core.ctx.lineTo(-1,-52);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(2,-56);$core.ctx.lineTo(1,-52);$core.ctx.stroke();
}
$core.ctx.restore();
if(s.laserActive){
$core.ctx.save();
$core.ctx.translate(s.x,s.y-36);
$core.ctx.rotate(s.laserAngle);
const grad=cachedLinearGradient('boss_laser',0,0,220,0,[[0,'rgba(255,0,102,1)'],[0.4,'rgba(255,80,160,0.8)'],[1,'rgba(255,0,102,0)']]);
$core.ctx.strokeStyle=grad; $core.ctx.lineWidth=6; $core.ctx.globalAlpha=0.9;
if(!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow){$core.ctx.shadowColor='#ff0066';$core.ctx.shadowBlur=18;}
$core.ctx.beginPath();$core.ctx.moveTo(0,0);$core.ctx.lineTo(220,0);$core.ctx.stroke();
$core.ctx.strokeStyle='rgba(255,200,220,0.9)'; $core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.moveTo(0,0);$core.ctx.lineTo(160,0);$core.ctx.stroke();
$core.ctx.restore();
if($buildings.tick%8===0) audioManager.fire('smg');
}
const bw=110;
$core.ctx.save();$core.ctx.translate(s.x,s.y);
$core.ctx.fillStyle='#200010'; $core.ctx.fillRect(-bw/2,-80,bw,8);
const hpPct=Math.max(0,s.hp)/s.maxHp;
$core.ctx.fillStyle=hpPct>0.5?phase2col:hpPct>0.25?'#ffcc00':'#ff0000';
$core.ctx.fillRect(-bw/2,-80,bw*hpPct,8);
$core.ctx.fillStyle='rgba(0,0,0,0.4)';
$core.ctx.fillRect(-bw/2+bw*0.55-1,-80,2,8);
$core.ctx.fillRect(-bw/2+bw*0.25-1,-80,2,8);
$core.ctx.restore();
}
$psycho2.alienShip = null;
$psycho2.fighterJet = null;
$psycho2.armoredCars = [];
$psycho2._carsEncounterActive = false;
const bossRegistry = {
_entries: new Map(),
register(key, getRef, isAlive) { this._entries.set(key, {getRef, isAlive}); },
unregister(key) { this._entries.delete(key); },
anyAlive() {
for(const [,e] of this._entries) if(e.isAlive()) return true;
return false;
},
purgeStale() {
for(const [k, e] of this._entries) if(!e.isAlive()) this._entries.delete(k);
},
clearAll() {
for(const [,e] of this._entries){ const r=e.getRef(); if(r) r.alive=false; }
this._entries.clear();
}
}; ;$psycho2.bossRegistry = bossRegistry;
$psycho2.helicopter = null;
function spawnHelicopter(){
if($buildings.state!=='playing'||$buildings.isPaused||!canSpawnBoss())return;
const hp=80+$buildings.wave*12;
$psycho2.helicopter={
x:Math.max(44,Math.min($replay.W-44,$replay.W/2)),y:-120,
tx:Math.max(44,Math.min($replay.W-44,$replay.W/2)),ty:Math.max(20,Math.min($replay.H*0.32,$replay.H*0.25)),
hp,maxHp:hp,
spd:1.8,st:0,si:35,
alive:true,
angle:Math.PI/2,
rotorSpin:0,
phase:0,
strafeDir:1,
strafeCooldown:0,
dropCooldown:0,
smokeTrail:[],
vx:0,vy:0,mode:'enter',modeT:0,stage:0,lastAtk:'',fireCd:0,tele:null,side:1
};
$buildings.bossAlive=true;$buildings._airstrikeGraceUntil=$buildings.tick+1200;$replay.bBarW.style.opacity='1';
if($buildings._firstBossSpawnTick===null) $buildings._firstBossSpawnTick=$buildings.tick;
el('boss-bar-label').textContent='WAVE '+$buildings.wave+' — IRON VULTURE';
bossRegistry.register('helicopter', ()=>$psycho2.helicopter, ()=>!!($psycho2.helicopter&&$psycho2.helicopter.alive));
}
function updateGrenadeHUD(){
const icons = el('grenade-icons');
let html='';
for(let i=0;i<3;i++) html+=`<div style="width:14px;height:14px;border-radius:0;transform:rotate(45deg);background:${i<$buildings.grenadeCount?'#ffaa00':'#1a1a00'};border:1px solid ${i<$buildings.grenadeCount?'#ff8800':'#3a3000'};"></div>`;
icons.innerHTML=html;
const wgwIcons = el('wgw-nade-icons');
if(wgwIcons){
let h2='';
for(let i=0;i<Math.min($buildings.grenadeCount,6);i++) h2+=`<div style="width:10px;height:10px;border-radius:0;transform:rotate(45deg);background:#ffaa00;border:1px solid #664400;"></div>`;
for(let i=$buildings.grenadeCount;i<3;i++) h2+=`<div style="width:10px;height:10px;border-radius:0;transform:rotate(45deg);background:#1a1200;border:1px solid #2a2000;"></div>`;
wgwIcons.innerHTML=h2;
}
}
function _openingStinger(e){
window._ow.stinger=true;
const pl=$buildings.player;
floatTextPop(e.x,e.y-30,'◎ FIRST BLOOD!','#ffd700',22);
const sh=el('streak-hud');
if(sh){ sh.innerHTML='FIRST BLOOD!<br><span style="font-size:12px;color:#ffaa00">KEEP THE STREAK ALIVE</span>'; sh.style.opacity='1'; }
killFlash('rgba(255,200,60,0.30)',130);
shake(8); vibrate([30,20,45]);
if(!($core.isUltraLow||$core.isLowEndDesktop)) $replay._freezeFrames=Math.max($replay._freezeFrames||0,4);
try{ audioManager.streakSound(4); audioManager.playKillChord && audioManager.playKillChord(); }catch(_e){}
if($buildings._mutCfg&&$buildings._mutCfg.noPowerupDrops) return;
_gst(()=>{
if($buildings.state!=='playing') return;
const ang=Math.random()*Math.PI*2;
const x=pl.x+Math.cos(ang)*38, y=pl.y+Math.sin(ang)*38;
const needHp = pl.hp < pl.maxHp*0.5 && !($buildings._mutCfg&&$buildings._mutCfg.ironMan);
const type = needHp ? 'health' : 'rapid';
$buildings.powerups.push({x,y,type,life:600});
ptcl(x,y,type==='health'?'#ff4466':'#ffaa00',14,4);
floatText(x,y-26,type==='health'?'+ HEALTH — GRAB IT':'▸ RAPID FIRE — GRAB IT',type==='health'?'#ff4466':'#ffaa00',14);
shake(3); vibrate([15]);
},380);
}
function killEnemy(e){
if(!e.alive)return;
e.alive=false;
_markEnemiesDirty();
if(_killBurstTick !== $buildings.tick){ _killBurstTick = $buildings.tick; _killBurstCount = 0; }
_killBurstCount++;
const _budget = e.boss ? 1 : (_killBurstCount >= 3 ? 0.3 : _killBurstCount === 2 ? 0.6 : 1);
if(e._onDeath){ const _od=e._onDeath; e._onDeath=null; try{ _od(e); }catch(_x){ console.warn('[onDeath]',_x); } }
if(window.__spOnKill) window.__spOnKill(e);
const _kd = $enemies.get(e.type).kill;   /* score / xp / feed / shake / drops come from js/engine/enemies/<type>.js */
if(audioManager._orb && !e.boss && _kd.orbital) audioManager.orbitalEvent('turret');
if(_kd.onKill) _kd.onKill(e);
const pts=e.boss?500:_kd.pts;
const bonusPts = $buildings.killStreak>=5?Math.floor(pts*0.5):0;
$buildings.score+=Math.round((pts+bonusPts)*($buildings._mutCfg?.scoreMult||1)*($profiler._shopDeathWish?3:1));
$buildings.totalKills++;
const _owKill = window._ow && window._ow.active && !window._ow.stinger && $buildings.wave===1 && !e.boss;
if(_owKill) _openingStinger(e);
if(!window._hasFirstKillEver){
try{
if(!localStorage.getItem('diy_first_kill')){
localStorage.setItem('diy_first_kill','1');
window._hasFirstKillEver=false;
if(!_owKill) _gst(()=>{
floatTextPop(e.x,e.y-30,'◎ FIRST BLOOD!','#7fff00',20);
killFlash('rgba(127,255,0,0.35)',180);
shake(8);
vibrate([30,20,30]);
audioManager.playKillChord && audioManager.playKillChord();
},1);
} else {
window._hasFirstKillEver=true;
}
}catch(_e){ window._hasFirstKillEver=true; }
}
if($profiler._shopScavenger && $buildings.totalKills%10===0){
$buildings.lifeTokens++;
try{ localStorage.setItem('diy_tokens',String($buildings.lifeTokens)); }catch(e2){}
floatText($buildings.player.x,$buildings.player.y-40,'+1 ¤ SCAVENGER','#ffcc00',12);
}
checkKillWhispers();
if($buildings.tick % 60 === 0) $profiler._updateStressMixer();
$buildings.wepKills[$buildings.curWep]=($buildings.wepKills[$buildings.curWep]||0)+1;
el('score-num').textContent=$buildings.score;
el('kills-num').textContent=$buildings.totalKills;
gainXP(e.boss?80:_kd.xp);
if($props._guidedWave) $props.onGuidedKill();
dcOnKill($buildings.curWep, e ? e.type : undefined);
dcOnWaveOrScore();
_checkRunMilestones($buildings.curWep);
const isElite = _kd.isElite;
const isBoss = e.boss;
const isOverkill = !isBoss && e._hpHitTick===$buildings.tick && e._hpBeforeHit!==undefined && e._hpBeforeHit>3 && (e._hpBeforeHit-e.hp) > e._hpBeforeHit*1.8;
if(isOverkill){
_hitScreenDesaturate(100);
}
const killAngle = Math.atan2($buildings.mouse.y-e.y, $buildings.mouse.x-e.x) + Math.PI;
const bloodCount = Math.ceil((isBoss?60:isElite?35:22)*(isOverkill?1.6:1)*_budget);
for(let i=0;i<bloodCount;i++){
const spread = isBoss?Math.PI*2:(Math.PI*0.8);
const a = killAngle + (Math.random()-0.5)*spread;
const spd = 2+Math.random()*(isBoss?12:isElite?8:6);
const life = 20+Math.random()*25;
_ptclQPush({x:e.x,y:e.y,col:Math.random()<0.6?'#cc2200':'#ff4400',spd,life,sz:Math.random()*3+1});
}
const flashCount = Math.ceil((isBoss?30:isElite?18:10)*_budget);
for(let i=0;i<flashCount;i++){
const a=Math.random()*Math.PI*2;
const spd=1+Math.random()*(isBoss?8:5);
_ptclQPush({x:e.x,y:e.y,col:Math.random()<0.5?'#ff8800':'#ffcc00',spd,life:10+Math.random()*14,sz:Math.random()*4+2});
}
const smokeCount = Math.ceil((isBoss?20:isElite?10:5)*_budget);
for(let i=0;i<smokeCount;i++){
const a=Math.random()*Math.PI*2, spd=0.5+Math.random()*3;
_ptclQPush({x:e.x+(Math.random()-0.5)*12,y:e.y+(Math.random()-0.5)*12,col:Math.random()<0.5?'#333':'#555',spd,life:30+Math.random()*20,sz:Math.random()*5+3});
}
$buildings.debrisArr.push({x:e.x,y:e.y,r:e.w*1.5,life:isBoss?40:28,maxLife:isBoss?40:28,col:e.col||'#556B2F'});
if(isElite||isBoss) $buildings.debrisArr.push({x:e.x,y:e.y,r:e.w*0.6,life:isBoss?30:18,maxLife:isBoss?30:18,col:'#ff6600'});
if(isBoss && $buildings.craters.filter(c=>!c._fromBuilding).length<$psycho1.MAX_OPEN_CRATERS){
_pushCrater({x:e.x,y:e.y,r:70,seed:(e.x*13+e.y*7)|0,_fromBuilding:false});
}
const ptsTxt = bonusPts>0 ? '+'+pts+' +'+bonusPts+'*' : '+'+pts;
const ptsSize = isBoss?30:isElite?22:16;
const ptsCol = isBoss?'#ff4400':isElite?'#ffaa00':'#aaff00';
if(_budget >= 0.5) floatTextPop(e.x, e.y-24, ptsTxt, ptsCol, Math.round(ptsSize*(0.5+0.5*_budget)));   /* 3rd+ kill in a tick: no pop (score still counts) */
const kfLabel=e.boss?'* BOSS ELIMINATED':e.skin==='alien'?'◉ ALIEN NEUTRALIZED':e.skin==='arctic'?'▸ BEAST FROZEN OUT':_kd.label;
const kfCol=e.boss?'#ff4400':e.skin==='alien'?'#66ff99':e.skin==='arctic'?'#8fe8ff':_kd.color;
addKillFeed((isOverkill?'! ':'')+kfLabel+' +'+pts, isOverkill?'#ffff00':kfCol, isElite||isBoss||isOverkill);
const shakePow = isBoss?14:_kd.shake;
shake(shakePow*_budget);
if(_budget>=0.6 && !$core.isVeryLow && $enemies.get(e.type).ai.heavyHit && !isBoss){ $buildings._zoom=Math.min(0.06,Math.max($buildings._zoom||0,0.045)); $buildings._zoomFx=$buildings._zoomFy=null; }   /* zoom punch on heavy/elite/juggernaut kills */
if(_budget >= 0.6){   /* each killFlash = clearTimeout + setTimeout + style write: skip on 3rd+ kill */
killFlash('rgba(170,255,0,0.07)',55);
if(isElite) killFlash('rgba(255,180,0,0.12)');
if(_kd.flash) killFlash(_kd.flash);
if(isBoss) killFlash('rgba(255,80,0,0.22)');
}
audioManager.at(e.x,()=>audioManager.death_enemy(e.type, isBoss));
vibrate(isBoss?[60,30,60]:[20]);
registerKill(e.x, e.y, pts);
if(e.boss){
const specialBossStillAlive = ($psycho2.helicopter&&$psycho2.helicopter.alive) ||
($psycho2.alienShip&&$psycho2.alienShip.alive) ||
($psycho2.fighterJet&&$psycho2.fighterJet.alive) ||
($psycho2.spiderTank&&$psycho2.spiderTank.alive) ||
($psycho2.harmTug&&$psycho2.harmTug.alive) ||
$psycho2.armoredCars.some(c=>c.alive);
if(!specialBossStillAlive){
$buildings.bossAlive=false;$replay.bBarW.style.opacity='0';
audioManager.stopBossMusic();
vibrate([80,40,80,40,160]);
dcOnBossKill();$buildings._bossTypesThisRun.push(e&&e.isTank?'Tank':'Commander');onBossDefeated(e&&e.isTank?'tank':'commander');$replay.ReplayRecorder.capture(e&&e.isTank?'* TANK ELIMINATED':'* COMMANDER ELIMINATED',e&&e.isTank?'boss_tank':'boss_commander');
window._slowMoUntil = performance.now() + 150;
try {
const _bCtx = audioManager.audioContext;
if(_bCtx) {
const _now = _bCtx.currentTime;
[440,554,660,880].forEach((f,i)=>{
const _o=_bCtx.createOscillator(), _g=_bCtx.createGain();
_o.type='square'; _o.frequency.value=f;
_g.gain.setValueAtTime(0,_now+i*0.08);
_g.gain.linearRampToValueAtTime(0.1,_now+i*0.08+0.05);
_g.gain.exponentialRampToValueAtTime(0.001,_now+i*0.08+0.8);
_o.connect(_g);_g.connect(_bCtx.destination);
_o.start(_now+i*0.08);_o.stop(_now+i*0.08+0.85);
});
}
} catch(_e){}
const livingEnemies = $buildings.enemies.filter(en => en.alive && !en.boss);
if (livingEnemies.length === 0) { $buildings.waveKills = $buildings.waveTotal; }
}
if($psycho2.helicopter&&$psycho2.helicopter.alive&&e===$psycho2.helicopter){$psycho2.helicopter.alive=false;}
}
else{$buildings.waveKills++;}
const r2=Math.random();
const isBoot = $replay.currentLevel && $replay.currentLevel.isTutorialLevel;
if(isBoot){
const bootTypes=['health','ammo','health'];
$buildings.powerups.push({x:e.x,y:e.y,type:bootTypes[Math.floor(Math.random()*bootTypes.length)],life:480});
} else if(r2<(e.boss?1:0.3) && !_owKill && !($buildings._mutCfg&&$buildings._mutCfg.noPowerupDrops)){
const types=['rapid','shield','health','ammo','speed','grenade'].filter(t=>{
if(t==='health' && $buildings._mutCfg&&$buildings._mutCfg.ironMan) return false;
if(t==='ammo' && $buildings._mutCfg&&$buildings._mutCfg.noAmmoDrops) return false;
return true;
});
if(types.length) $buildings.powerups.push({x:e.x,y:e.y,type:types[Math.floor(Math.random()*types.length)],life:420});
}
if(e.boss && Math.random()<0.1 && !($buildings._mutCfg&&$buildings._mutCfg.noPowerupDrops)){
$buildings.powerups.push({x:e.x,y:e.y+24,type:'godmode',life:300});
}
if(!isBoot && _kd.weaponDrop&&Math.random()<0.25 && !($buildings._mutCfg&&$buildings._mutCfg.noPowerupDrops)){
const wepDrop = _kd.weaponDrop;
$buildings.powerups.push({x:e.x+20,y:e.y,type:'weapon_'+wepDrop,life:480});
}
if(window._legendaryWeps && window._legendaryWeps.has('shotgun') && $buildings.curWep==='shotgun' && !e.boss){
const numPels = 16;
for(let _pi=0; _pi<numPels; _pi++){
const _pa = (_pi/numPels)*Math.PI*2;
$buildings.bullets.push({x:e.x,y:e.y,vx:Math.cos(_pa)*14,vy:Math.sin(_pa)*14,own:'player',life:50,wt:'bullet',col:'#ff6600',dmg:4+(($buildings.wepUpgrades.shotgun||{}).dmg||0),sz:3});
}
ptclBurst(e.x,e.y,'#ff8800',$core.isMobile?12:24,8,18,4);
floatTextPop(e.x,e.y-40,'* NOVA BLAST','#ffaa00',13);
}
if(window._legendaryWeps && window._legendaryWeps.has('knife') && $buildings.curWep==='knife' && !e.boss){
_gst($legendary._phantomSlashCheck, 80);
}
}
function spawnAlly(silent){
let ax=$buildings.player.x+(Math.random()-0.5)*80, ay=$buildings.player.y+40;
while(onBuilding(ax,ay,16)){ax+=20;ay+=20;}
$buildings.allies.push({x:ax,y:ay,hp:60,maxHp:60,angle:0,walkT:0,sc:0,st:0,si:90,alive:true});
el('ally-hud').style.display='block';
if(!silent){
audioManager.allySpawn();
showPickupMsg('◈ ALLY DEPLOYED!','#00ffcc');
}
}
function updateAllies(){
for(let _ai=$buildings.allies.length-1;_ai>=0;_ai--){const a=$buildings.allies[_ai];let _aKeep=true;
if(!a.alive)_aKeep=false;
a.sc=Math.max(0,(a.sc||0)-1);
a.targetTimer=(a.targetTimer||0)-1;
if(a.targetTimer<=0||!a.stickyTarget||!a.stickyTarget.alive){
a.targetTimer=120+Math.floor(Math.random()*60);
let nearest=null,minD=Infinity;
const allTargets=[...$buildings.enemies];
if($psycho2.helicopter&&$psycho2.helicopter.alive) allTargets.push($psycho2.helicopter);
if($psycho2.alienShip&&$psycho2.alienShip.alive) allTargets.push($psycho2.alienShip);
if($psycho2.fighterJet&&$psycho2.fighterJet.alive) allTargets.push($psycho2.fighterJet);
if($psycho2.spiderTank&&$psycho2.spiderTank.alive) allTargets.push($psycho2.spiderTank);
if($psycho2.harmTug&&$psycho2.harmTug.alive) allTargets.push($psycho2.harmTug);
$psycho2.armoredCars.forEach(c=>{ if(c.alive) allTargets.push(c); });
allTargets.forEach(e=>{ if(!e.alive)return; const d=Math.hypot(e.x-a.x,e.y-a.y); if(d<minD){minD=d;nearest=e;} });
a.stickyTarget=nearest;
}
const target=a.stickyTarget&&a.stickyTarget.alive?a.stickyTarget:null;
if(target){
const dx=target.x-a.x,dy=target.y-a.y,d=Math.hypot(dx,dy);
a.angle=Math.atan2(dy,dx);
if(d>80){
const ax2=a.x+(dx/d)*2.2, ay2=a.y+(dy/d)*2.2;
if(!onBuilding(ax2,ay2,12)){a.x=ax2;a.y=ay2;}
else if(!onBuilding(ax2,a.y,12)){a.x=ax2;}
else if(!onBuilding(a.x,ay2,12)){a.y=ay2;}
}
a.stuckTimer=(a.stuckTimer||0);
a.stuckX=(a.stuckX===undefined?a.x:a.stuckX);
a.stuckY=(a.stuckY===undefined?a.y:a.stuckY);
const _aMovedDist=Math.hypot(a.x-a.stuckX,a.y-a.stuckY);
if(_aMovedDist<2.5){
a.stuckTimer++;
} else {
a.stuckTimer=0;a.stuckX=a.x;a.stuckY=a.y;
}
if(a.stuckTimer>30){
a.stuckTimer=0;
const _aPad=12;
let freed=unstuckBoss(a.x,a.y,_aPad);
if(onBuilding(freed.x,freed.y,_aPad)){
freed=unstuckBoss(freed.x,freed.y,_aPad+16);
}
a.x=Math.max(_aPad,Math.min($replay.W-_aPad,freed.x));
a.y=Math.max(_aPad,Math.min($replay.H-_aPad,freed.y));
a.stuckX=a.x;a.stuckY=a.y;
}
a.walkT+=0.14;
a.st++;
if(a.st>a.si){
a.st=0;
$buildings.bullets.push({x:a.x,y:a.y,vx:Math.cos(a.angle)*12,vy:Math.sin(a.angle)*12,own:'ally',life:180,wt:'bullet',col:'#00ffcc',dmg:1,sz:2.5});
audioManager.fire('smg');
}
}
const ALLY_R = 22;
for(let b of $buildings.allies){
if(b===a||!b.alive) continue;
const sx=a.x-b.x, sy=a.y-b.y;
const dist=Math.hypot(sx,sy);
if(dist<ALLY_R&&dist>0.1){
const push=(ALLY_R-dist)*0.5;
const nx=sx/dist, ny=sy/dist;
const nx2=a.x+nx*push, ny2=a.y+ny*push;
if(!onBuilding(nx2,ny2,12)){a.x=nx2;a.y=ny2;}
}
}
if(!_aKeep)$buildings.allies.splice(_ai,1);}
if($buildings.allies.length===0) el('ally-hud').style.display='none';
}
$psycho2._shopDroneObj = null;
function _spawnShopDrone(){
$psycho2._shopDroneObj = { angle:0, fireTimer:0, alive:true };
showPickupMsg('DRONE BUDDY DEPLOYED!','#aaffff');
}
function updateDrone(){
if(!$psycho2._shopDroneObj||!$psycho2._shopDroneObj.alive) return;
const d = $psycho2._shopDroneObj;
d.angle += 0.045;
const dx = Math.cos(d.angle)*40, dy = Math.sin(d.angle)*40;
const droneX = $buildings.player.x+dx, droneY = $buildings.player.y+dy;
d.x = droneX; d.y = droneY;
d.fireTimer++;
if(d.fireTimer>=60){
d.fireTimer=0;
let nearest=null, minD=Infinity;
const _dt=[..._getAliveEnemies()];
if($psycho2.helicopter&&$psycho2.helicopter.alive) _dt.push($psycho2.helicopter);
if($psycho2.alienShip&&$psycho2.alienShip.alive) _dt.push($psycho2.alienShip);
if($psycho2.fighterJet&&$psycho2.fighterJet.alive) _dt.push($psycho2.fighterJet);
_dt.forEach(e=>{ if(!e.alive)return; const ed=Math.hypot(e.x-droneX,e.y-droneY); if(ed<minD){minD=ed;nearest=e;} });
if(nearest){
const a=Math.atan2(nearest.y-droneY,nearest.x-droneX);
$buildings.bullets.push({x:droneX,y:droneY,vx:Math.cos(a)*11,vy:Math.sin(a)*11,own:'ally',life:180,wt:'bullet',col:'#aaffff',dmg:2,sz:2.5});
audioManager.fire('smg');
}
}
}
function drawDrone(){
if(!$psycho2._shopDroneObj||!$psycho2._shopDroneObj.alive) return;
const d = $psycho2._shopDroneObj;
$core.ctx.save(); $core.ctx.translate(d.x, d.y);
$core.ctx.globalAlpha=0.18; $core.ctx.strokeStyle='#aaffff'; $core.ctx.lineWidth=1;
$core.ctx.beginPath(); $core.ctx.arc(0,0,1,0,Math.PI*2); $core.ctx.stroke();
$core.ctx.globalAlpha=1;
const pulse=Math.sin($buildings.tick*0.12)*0.15+0.85;
$core.ctx.shadowColor='#aaffff'; $core.ctx.shadowBlur=8*$core.SHADOW;
$core.ctx.fillStyle='#223344';
$core.ctx.beginPath(); $core.ctx.arc(0,0,6,0,Math.PI*2); $core.ctx.fill();
$core.ctx.strokeStyle='#aaffff'; $core.ctx.lineWidth=1.5; $core.ctx.globalAlpha=pulse;
$core.ctx.beginPath(); $core.ctx.arc(0,0,6,0,Math.PI*2); $core.ctx.stroke();
$core.ctx.globalAlpha=1; $core.ctx.fillStyle='#00ffff';
$core.ctx.beginPath(); $core.ctx.arc(0,0,2,0,Math.PI*2); $core.ctx.fill();
$core.ctx.restore();
}
const _upIconSvg = (paths, filled) => `<svg viewBox="0 0 24 24" fill="${filled?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" style="display:inline-block;">${paths}</svg>`;
const _upWepIconSvg = (paths) => `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="24" height="24" style="display:inline-block;">${paths}</svg>`;
const WEP_SILHOUETTES = {
rifle: '<rect x="1" y="10" width="14" height="2"/><rect x="2" y="8" width="1.5" height="2"/><rect x="13" y="7" width="7" height="6"/><polygon points="20,9 24,11 24,13 20,13"/><polygon points="15,13 18,13 17,20 14,20"/>',
shotgun: '<rect x="1" y="10" width="11" height="3"/><rect x="6" y="14" width="6" height="2.5"/><rect x="12" y="8" width="6" height="6"/><polygon points="18,10 23,12 23,14.5 18,14.5"/>',
smg: '<rect x="4" y="8" width="12" height="6"/><rect x="16" y="10" width="6" height="2"/><polygon points="8,14 12,14 11,21 7,20"/><rect x="1" y="9.5" width="3" height="3"/>',
knife: '<g transform="rotate(45 12 12)"><polygon points="12,1.5 14.2,5 14.2,11 9.8,11 9.8,5"/><rect x="6.5" y="11" width="11" height="1.8" rx="0.4"/><rect x="10" y="12.8" width="4" height="6.5" rx="1"/><circle cx="12" cy="19.8" r="1.6"/></g>',
minigun: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="5" r="1.6"/><circle cx="18" cy="8.5" r="1.6"/><circle cx="18" cy="15.5" r="1.6"/><circle cx="12" cy="19" r="1.6"/><circle cx="6" cy="15.5" r="1.6"/><circle cx="6" cy="8.5" r="1.6"/>',
rpg: '<rect x="2" y="10" width="14" height="4" rx="1"/><polygon points="16,9 22,12 16,15"/><rect x="5" y="14" width="2" height="5"/><rect x="10" y="14" width="2" height="3"/>',
flamethrower: '<rect x="2" y="12" width="6" height="8" rx="1"/><rect x="8" y="14" width="4" height="2.5"/><path d="M15 5c1 2.5 4 4 4 7.5a5 5 0 01-10 0c0-1.6.7-2.8 1.5-3.8-.4 1.8.4 3 1.6 2.8-1-1.5-.6-3 .2-4.3.3 1.6 1.3 2 1.7 1-.6-1.3 0-2.3 1-3.2z"/>',
laser: '<rect x="2" y="10" width="8" height="4" rx="1"/><circle cx="12" cy="12" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="15" y="11" width="8" height="2"/>',
plasmacutter: '<rect x="2" y="15" width="6" height="4" rx="1"/><polygon points="8,15 14,15 14,17 8,19"/><polygon points="14,12 22,4 20,10 24,8 16,18 18,12"/>'
};
const UPGRADES=[
{id:'hp_boost', cat:'survival', name:'MEDPACK', desc:'+30 max HP, full heal', icon:_upIconSvg('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/><line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/>'), col:'#ff4466'},
{id:'shield_up', cat:'survival', name:'ARMOR PLATING', desc:'Start each wave with shield', icon:_upIconSvg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'), col:'#00ccff'},
{id:'double_shield',cat:'survival', name:'REACTIVE ARMOR', desc:'Shield lasts longer (×2)', icon:_upIconSvg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>'), col:'#00aaff'},
{id:'hp_regen', cat:'survival', name:'NANO ARMOR', desc:'Slow HP regen (1 HP / 10s)', icon:_upIconSvg('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/><polyline points="7 12 9.5 12 11 9 13.5 15 15 12 17 12"/>'), col:'#ff88aa'},
{id:'speed_up', cat:'survival', name:'ADRENALINE', desc:'Move speed +10%', icon:_upIconSvg('<path d="M13 2L4.5 14h6l-1 8L19 10h-6l1-8z"/>', true), col:'#ff00ff'},
{id:'grenade_up', cat:'ordnance', name:'RESUPPLY', desc:'+2 grenades', icon:_upIconSvg('<defs><radialGradient id="nadeGradUp" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#5aa834"/><stop offset="60%" stop-color="#3f7d22"/><stop offset="100%" stop-color="#2a5716"/></radialGradient></defs><circle cx="12" cy="14.13" r="6.8" fill="url(#nadeGradUp)" stroke="#1a3a0d" stroke-width="0.65"/><path d="M8.53 11.07 A4 4 0 0 1 15.47 11.07" fill="none" stroke="#254012" stroke-width="0.9" stroke-linecap="round"/><path d="M8.53 14.13 A4 4 0 0 1 15.47 14.13" fill="none" stroke="#254012" stroke-width="0.9" stroke-linecap="round"/><path d="M8.53 17.2 A4 4 0 0 1 15.47 17.2" fill="none" stroke="#254012" stroke-width="0.9" stroke-linecap="round"/><path d="M9.2 11.07v7.93M12 11.07v8.93M14.8 11.07v7.93" stroke="#254012" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/><path d="M12.67 7.87 16.27 3.93" stroke="#8a8a8a" stroke-width="1.8" stroke-linecap="round" fill="none"/><circle cx="17.2" cy="3.0" r="1.4" fill="none" stroke="#c9a227" stroke-width="1.7"/>'),col:'#ffcc00'},
{id:'grenade_bonus',cat:'ordnance', name:'DEMO CACHE', desc:'+3 grenades & bigger blast', icon:_upIconSvg('<defs><radialGradient id="nadeGradBonus" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#5aa834"/><stop offset="60%" stop-color="#3f7d22"/><stop offset="100%" stop-color="#2a5716"/></radialGradient></defs><circle cx="12" cy="14.13" r="6.8" fill="url(#nadeGradBonus)" stroke="#1a3a0d" stroke-width="0.65"/><path d="M8.53 11.07 A4 4 0 0 1 15.47 11.07" fill="none" stroke="#254012" stroke-width="0.9" stroke-linecap="round"/><path d="M8.53 14.13 A4 4 0 0 1 15.47 14.13" fill="none" stroke="#254012" stroke-width="0.9" stroke-linecap="round"/><path d="M8.53 17.2 A4 4 0 0 1 15.47 17.2" fill="none" stroke="#254012" stroke-width="0.9" stroke-linecap="round"/><path d="M9.2 11.07v7.93M12 11.07v8.93M14.8 11.07v7.93" stroke="#254012" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/><path d="M12.67 7.87 16.27 3.93" stroke="#8a8a8a" stroke-width="1.8" stroke-linecap="round" fill="none"/><circle cx="17.2" cy="3.0" r="1.4" fill="none" stroke="#c9a227" stroke-width="1.7"/><path d="M6.5 20l-1.2 2M17.5 20l1.2 2M9 22l-0.6 1.7M15 22l0.6 1.7" stroke="#ff8800" stroke-width="1.4" stroke-linecap="round"/>'),col:'#ffaa00'},
{id:'rpg_ammo', cat:'ordnance', name:'ROCKET CACHE', desc:'RPG: +2 rockets', icon:_upWepIconSvg(WEP_SILHOUETTES.rpg),col:'#ff4400'},
{id:'rifle_dmg', cat:'weapon', name:'RIFLE UP', desc:'Rifle damage +1', icon:_upWepIconSvg(WEP_SILHOUETTES.rifle), col:'#aaff00'},
{id:'shotgun_ammo', cat:'weapon', name:'SHOTGUN MAG', desc:'Shotgun +2 shells', icon:_upWepIconSvg(WEP_SILHOUETTES.shotgun), col:'#ffaa00'},
{id:'smg_fire', cat:'weapon', name:'SMG OVERCLOCK', desc:'SMG fire rate +30%', icon:_upWepIconSvg(WEP_SILHOUETTES.smg), col:'#00ffcc'},
{id:'knife_dmg', cat:'weapon', name:'BLADE EDGE', desc:'Knife damage ×2', icon:_upWepIconSvg(WEP_SILHOUETTES.knife), col:'#c8d8ff'},
{id:'knife_speed', cat:'weapon', name:'SWIFT BLADE', desc:'Knife: faster throw & reload', icon:_upWepIconSvg(WEP_SILHOUETTES.knife), col:'#aaccff'},
{id:'minigun_ammo', cat:'weapon', name:'AMMO BELT', desc:'Minigun: +30 rounds', icon:_upWepIconSvg(WEP_SILHOUETTES.minigun), col:'#ff6600'},
{id:'flame_fuel', cat:'weapon', name:'FUEL TANK', desc:'Flamethrower: +40% fuel & range', icon:_upWepIconSvg(WEP_SILHOUETTES.flamethrower), col:'#ff6600'},
{id:'dmg_all', cat:'weapon', name:'WAR MODE', desc:'All weapons +1 damage', icon:_upIconSvg('<path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/>'),col:'#ff2200'},
{id:'reload_up', cat:'weapon', name:'SPEED LOADER', desc:'All reload speeds -20%', icon:_upIconSvg('<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>'), col:'#aaff00'},
{id:'sp_shock', cat:'special', minWave:2, name:'SHOCKWAVE CORE', desc:'Pulse blasts & shoves everything near you every 2.5s', icon:_upIconSvg('<circle cx="12" cy="12" r="2.5" fill="currentColor"/><circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="10" opacity=".5"/>'), col:'#00ffcc'},
{id:'sp_chaos', cat:'special', minWave:3, name:'CHAOS ROUNDS', desc:'Kills have a 35% chance to detonate & chain', icon:_upIconSvg('<path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5L19 19M19 5l-3.5 3.5M8.5 15.5L5 19"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/>'), col:'#ff5500'},
{id:'sp_overdrive', cat:'special', minWave:4, name:'OVERDRIVE', desc:'ALL weapons +3 damage. Raw power.', icon:_upIconSvg('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>', true), col:'#ffee00'},
{id:'sp_orbital', cat:'special', minWave:5, name:'ORBITAL LANCE', desc:'Every 7s: screen-wide strike wipes the field', icon:_upIconSvg('<circle cx="17" cy="7" r="3.2" fill="currentColor"/><path d="M14.5 9.5L4 20M10.5 7.5L3 12.5M16.5 13.5L11.5 21"/>'), col:'#ffffff'},
{id:'sp_guardian', cat:'special', minWave:2, name:'GUARDIAN DRONES', desc:'3 plasma drones orbit you: shred enemies on contact & block enemy bullets', icon:_upIconSvg('<polygon points="12 2 22 12 12 22 2 12"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/>'), col:'#ff44ff'},
{id:'sp_vampire', cat:'special', minWave:3, name:'BLOOD HALO', desc:'Kills sometimes heal you 1 HP. Crimson halo marks the hunger', icon:_upIconSvg('<path d="M12 2.500S5 10 5 15a7 7 0 0014 0c0-5-7-12.500-7-12.500z"/>', true), col:'#ff2244'},
{id:'ally_call', cat:'support', name:'CALL ALLY', desc:'Deploy an ally soldier', icon:_upIconSvg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>'), col:'#00ffcc'},
{id:'xp_boost', cat:'support', name:'VETERAN', desc:'+500 XP instantly', icon:_upIconSvg('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', true),col:'#ffff00'},
{id:'mut_pierce', cat:'mutation', name:'TUNGSTEN CORE', desc:'Bullets pierce through enemies', icon:_upIconSvg('<polygon points="6 3 21 12 6 21"/>', true), col:'#aaffff', minWave:3},
{id:'mut_explosive',cat:'mutation', name:'FRAG ROUNDS', desc:'Bullets explode on hit (tiny AoE)', icon:_upIconSvg('<path d="M4 8c4 1 6 3 7 6"/><path d="M20 8c-4 1-6 3-7 6"/><path d="M4 17c4-1 6-3 7-6"/><path d="M20 17c-4-1-6-3-7-6"/>'),col:'#ff8800', minWave:4},
{id:'mut_chain', cat:'mutation', name:'CHAIN LIGHTNING',desc:'Hits arc to 1 nearby enemy', icon:_upIconSvg('<polygon points="13 2 4 14 11 14 9 22 20 9 13 9"/>', true),col:'#ffff00', minWave:5},
{id:'mut_poison', cat:'mutation', name:'TOXIN ROUNDS', desc:'Enemies burn for 3 ticks after hit', icon:_upIconSvg('<path d="M12 2C7.6 2 4 5.6 4 10c0 2.7 1.3 5 3.3 6.5L6.5 20h11l-.8-3.5C18.7 15 20 12.7 20 10c0-4.4-3.6-8-8-8z"/><circle cx="9" cy="10" r="1.6" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.6" fill="currentColor" stroke="none"/><path d="M9.5 20v2M14.5 20v2"/>'), col:'#88ff44', minWave:4},
{id:'mut_ricochet', cat:'mutation', name:'RICOCHET', desc:'Bullets bounce once off walls', icon:_upIconSvg('<path d="M20 6v6a5 5 0 0 1-5 5H5"/><polyline points="9 21 5 17 9 13"/>'), col:'#ff44ff', minWave:6},
{id:'mut_magnet', cat:'mutation', name:'HOMING SHOT', desc:'Bullets curve toward nearest enemy', icon:_upIconSvg('<path d="M5 14V9a7 7 0 0 1 14 0v5"/><rect x="3" y="14" width="6" height="6" rx="1"/><rect x="15" y="14" width="6" height="6" rx="1"/><path d="M5 17h4M15 17h4" stroke-width="1.6"/>'),col:'#00ffff', minWave:7},
{id:'mut_lifesteal',cat:'mutation', name:'LEECH ROUNDS', desc:'Kills sometimes restore 1 HP, hits drain a little', icon:_upIconSvg('<path d="M12 2C8 8 5 11.5 5 15a7 7 0 0 0 14 0c0-3.5-3-7-7-13z"/>', true),col:'#ff2266', minWave:5},
{id:'mut_multishot',cat:'mutation', name:'BURST CORE', desc:'Every 5th bullet splits into 3', icon:_upIconSvg('<path d="M12 2c0 4.5 1.5 6 6 6-4.5 0-6 1.5-6 6 0-4.5-1.5-6-6-6 4.5 0 6-1.5 6-6z"/>', true), col:'#ffffaa', minWave:6},
{id:'evo_rifle', cat:'evolution',name:'RIFLE: EVOLVED', desc:'-> PLASMA RIFLE: piercing plasma beam', icon:_upIconSvg('<polyline points="6 15 12 9 18 15"/>'),col:'#aaff00', wep:'rifle', tier:1},
{id:'evo_rifle2', cat:'evolution',name:'RIFLE: ASCENDED', desc:'-> STORM RIFLE: fires 2-round burst', icon:_upIconSvg('<polyline points="6 17 12 11 18 17"/><polyline points="6 10 12 4 18 10"/>'),col:'#ffff00', wep:'rifle', tier:2},
{id:'evo_shotgun', cat:'evolution',name:'SHOTGUN: EVOLVED',desc:'-> SCATTER CANNON: wider, more pellets',icon:_upIconSvg('<polyline points="6 15 12 9 18 15"/>'),col:'#ffaa00', wep:'shotgun',tier:1},
{id:'evo_shotgun2', cat:'evolution',name:'SHOTGUN: ASCENDED',desc:'-> FLAK CANNON: pellets explode', icon:_upIconSvg('<polyline points="6 17 12 11 18 17"/><polyline points="6 10 12 4 18 10"/>'),col:'#ff6600', wep:'shotgun',tier:2},
{id:'evo_smg', cat:'evolution',name:'SMG: EVOLVED', desc:'-> STORM GUN: triple fire rate', icon:_upIconSvg('<polyline points="6 15 12 9 18 15"/>'),col:'#00ffcc', wep:'smg', tier:1},
{id:'evo_smg2', cat:'evolution',name:'SMG: ASCENDED', desc:'-> TYPHOON: sprays 3 bullets per shot', icon:_upIconSvg('<polyline points="6 17 12 11 18 17"/><polyline points="6 10 12 4 18 10"/>'),col:'#00ffff', wep:'smg', tier:2},
{id:'evo_knife', cat:'evolution',name:'KNIFE: EVOLVED', desc:'-> THROWING AXE: +dmg, wide arc', icon:_upIconSvg('<polyline points="6 15 12 9 18 15"/>'),col:'#c8d8ff', wep:'knife', tier:1},
{id:'evo_knife2', cat:'evolution',name:'KNIFE: ASCENDED', desc:'-> BLADE STORM: throws 3 knives', icon:_upIconSvg('<polyline points="6 17 12 11 18 17"/><polyline points="6 10 12 4 18 10"/>'),col:'#ffffff', wep:'knife', tier:2},
{id:'evo_minigun', cat:'evolution',name:'MINIGUN: EVOLVED',desc:'-> ROTARY CANNON: larger rounds', icon:_upIconSvg('<polyline points="6 15 12 9 18 15"/>'),col:'#ff6600', wep:'minigun',tier:1},
{id:'evo_minigun2', cat:'evolution',name:'MINIGUN: ASCENDED',desc:'-> DEATH SPIRAL: homing micro-rounds', icon:_upIconSvg('<polyline points="6 17 12 11 18 17"/><polyline points="6 10 12 4 18 10"/>'),col:'#ff4400', wep:'minigun',tier:2},
{id:'evo_rpg', cat:'evolution',name:'RPG: EVOLVED', desc:'-> HYDRA: fires 2 rockets per shot', icon:_upIconSvg('<polyline points="6 15 12 9 18 15"/>'),col:'#ff4400', wep:'rpg', tier:1},
{id:'evo_rpg2', cat:'evolution',name:'RPG: ASCENDED', desc:'-> ANNIHILATOR: massive blast radius', icon:_upIconSvg('<polyline points="6 17 12 11 18 17"/><polyline points="6 10 12 4 18 10"/>'),col:'#ff0000', wep:'rpg', tier:2},
{id:'evo_flame', cat:'evolution',name:'FLAME: EVOLVED', desc:'-> NAPALM: leaves burning ground patches',icon:_upIconSvg('<polyline points="6 15 12 9 18 15"/>'),col:'#ff6600', wep:'flamethrower',tier:1},
{id:'evo_flame2', cat:'evolution',name:'FLAME: ASCENDED', desc:'-> INFERNO: continuous beam, max range', icon:_upIconSvg('<polyline points="6 17 12 11 18 17"/><polyline points="6 10 12 4 18 10"/>'),col:'#ffaa00', wep:'flamethrower',tier:2},
{id:'evo_rifle3', cat:'evolution', name:'RIFLE: LEGENDARY', desc:'-> ORBITAL LASER: calls a beam strike at cursor on reload', icon:_upIconSvg('<path d="M2 18h20l-2 4H4z"/><path d="M2 18l2-9 4 4 4-8 4 8 4-4 2 9"/>', true), col:'#ffffff', wep:'rifle', tier:3, minWave:12},
{id:'evo_shotgun3', cat:'evolution', name:'SHOTGUN: LEGENDARY', desc:'-> NOVA BLAST: 360° pellet ring + shockwave on kill', icon:_upIconSvg('<path d="M2 18h20l-2 4H4z"/><path d="M2 18l2-9 4 4 4-8 4 8 4-4 2 9"/>', true), col:'#ffffff', wep:'shotgun', tier:3, minWave:12},
{id:'evo_smg3', cat:'evolution', name:'SMG: LEGENDARY', desc:'-> TIME-SLOW FIELD: bullets slow nearby enemies on hit', icon:_upIconSvg('<path d="M2 18h20l-2 4H4z"/><path d="M2 18l2-9 4 4 4-8 4 8 4-4 2 9"/>', true), col:'#ffffff', wep:'smg', tier:3, minWave:12},
{id:'evo_knife3', cat:'evolution', name:'KNIFE: LEGENDARY', desc:'-> PHANTOM SLASH: auto-dashes to nearest enemy, massive AoE', icon:_upIconSvg('<path d="M2 18h20l-2 4H4z"/><path d="M2 18l2-9 4 4 4-8 4 8 4-4 2 9"/>', true), col:'#ffffff', wep:'knife', tier:3, minWave:12},
{id:'evo_minigun3', cat:'evolution', name:'MINIGUN: LEGENDARY', desc:'-> DEATH RAIN: rounds home AND explode on impact', icon:_upIconSvg('<path d="M2 18h20l-2 4H4z"/><path d="M2 18l2-9 4 4 4-8 4 8 4-4 2 9"/>', true), col:'#ffffff', wep:'minigun', tier:3, minWave:12},
{id:'evo_rpg3', cat:'evolution', name:'RPG: LEGENDARY', desc:'-> NUKE: one shot, massive screen-filling explosion radius', icon:_upIconSvg('<path d="M2 18h20l-2 4H4z"/><path d="M2 18l2-9 4 4 4-8 4 8 4-4 2 9"/>', true), col:'#ffffff', wep:'rpg', tier:3, minWave:12},
{id:'evo_flame3', cat:'evolution', name:'FLAME: LEGENDARY', desc:'-> SOLAR FLARE: giant pulse ring that burns everything near you', icon:_upIconSvg('<path d="M2 18h20l-2 4H4z"/><path d="M2 18l2-9 4 4 4-8 4 8 4-4 2 9"/>', true), col:'#ffffff', wep:'flamethrower', tier:3, minWave:12},
{id:'armor_t1', cat:'armor', name:'ARMOR: HARDENED', desc:'-> Composite plating: +20 max HP. A visible plate sheen appears on your outfit.', icon:_upIconSvg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'), col:'#8899aa', tier:1},
{id:'armor_t2', cat:'armor', name:'ARMOR: FORTIFIED', desc:'-> Heavy plating: +30 more max HP. Shoulder and chest plates become visible.', icon:_upIconSvg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>'), col:'#5588cc', tier:2, minWave:6},
{id:'armor_t3', cat:'armor', name:'ARMOR: LEGENDARY', desc:'-> Powered exosuit: +50 more max HP, start each wave with a shield. Glowing legendary aura.', icon:_upIconSvg('<path d="M2 18h20l-2 4H4z"/><path d="M2 18l2-9 4 4 4-8 4 8 4-4 2 9"/>', true), col:'#ffffff', tier:3, minWave:12},
]; ;$psycho2.UPGRADES = UPGRADES; $psycho2.applyUpgrade = applyUpgrade;
/* ═══ v102: PERK ARSENAL — repeatable upgrades (effects live in 08-legendary.js: window.__perkApply/__perkHit/__perkOnWave/_tickPerks) ═══ */
const _PK_IC = {
target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="1" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="23"/>',
bolt:'<polygon points="13 2 4 14 11 14 9 22 20 9 13 9"/>',
shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
heart:'<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>',
bullet:'<rect x="9" y="3" width="6" height="13" rx="3"/><line x1="8" y1="21" x2="16" y2="21"/>',
nade:'<circle cx="12" cy="14" r="7"/><path d="M12 7V3h4"/>',
star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
skull:'<circle cx="12" cy="10" r="7"/><path d="M9 17v4h6v-4"/><circle cx="9.5" cy="10" r="1.3" fill="currentColor"/><circle cx="14.5" cy="10" r="1.3" fill="currentColor"/>',
drone:'<circle cx="12" cy="12" r="3"/><path d="M3 8l5 2M21 8l-5 2M3 16l5-2M21 16l-5-2"/>',
wave:'<path d="M2 12c3-6 6 6 10 0s7 6 10 0"/>',
flame:'<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-2.5 1.2-4 2.5-5.5C8.5 11 10 12 11 11c-1.2-2.600-.6-5.400 1-9z"/>',
snow:'<line x1="12" y1="2" x2="12" y2="22"/><line x1="3" y1="7" x2="21" y2="17"/><line x1="21" y1="7" x2="3" y2="17"/>',
mine:'<circle cx="12" cy="12" r="6"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
magnet:'<path d="M5 14V9a7 7 0 0 1 14 0v5"/><rect x="3" y="14" width="6" height="6"/><rect x="15" y="14" width="6" height="6"/>',
up:'<polyline points="6 15 12 9 18 15"/><polyline points="6 20 12 14 18 20"/>',
people:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.870"/>',
boot:'<path d="M5 4h7v9l7 3v4H5z"/>',
book:'<path d="M4 4h16v16H4z"/><line x1="12" y1="4" x2="12" y2="20"/>',
reload:'<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
burst:'<path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.500 3.500M15.500 15.500L19 19M19 5l-3.500 3.500M8.500 15.500L5 19"/>'
};
const PERKS = [
/* ── DAMAGE & CRITS ── */
{id:'crit_chance', cat:'weapon', name:'LUCKY STRIKE', desc:'+8% crit chance (crits hit ×2)', col:'#ffdd33', ic:'target', max:5},
{id:'crit_dmg', cat:'weapon', name:'HEADHUNTER', desc:'+50% crit damage', col:'#ffaa22', ic:'skull', max:4, req:'crit_chance'},
{id:'execute', cat:'weapon', name:'EXECUTIONER', desc:'+60% damage to enemies under 25% HP', col:'#ff4455', ic:'skull', max:3, minWave:2},
{id:'boss_buster', cat:'weapon', name:'GIANT SLAYER', desc:'+15% damage to bosses', col:'#ff7733', ic:'star', max:4, minWave:3},
{id:'opener', cat:'weapon', name:'FIRST BLOOD', desc:'+50% damage to full-health enemies', col:'#ff5566', ic:'target', max:3},
{id:'echo_shot', cat:'weapon', name:'ECHO ROUNDS', desc:'8% chance a hit strikes twice', col:'#88ddff', ic:'wave', max:4, minWave:2},
{id:'stopping', cat:'weapon', name:'STOPPING POWER', desc:'Hits knock enemies back harder', col:'#ffcc88', ic:'burst', max:3},
{id:'momentum_strike', cat:'weapon', name:'COMBO FURY', desc:'Damage climbs with your kill streak (up to +20%)', col:'#ff8800', ic:'flame', max:3, minWave:2},
{id:'last_stand', cat:'weapon', name:'LAST STAND', desc:'+35% damage while under 30% HP', col:'#ff2233', ic:'heart', max:2, minWave:3},
{id:'glass_cannon', cat:'weapon', name:'GLASS CANNON', desc:'+35% damage, but -15 max HP', col:'#ff66ff', ic:'bolt', max:1, minWave:3},
{id:'opening_salvo', cat:'weapon', name:'OPENING SALVO', desc:'Each wave opens with a burst of bonus damage', col:'#ffee55', ic:'up', max:3},
/* ── WEAPON HANDLING ── */
{id:'mag_size', cat:'weapon', name:'EXTENDED MAGS', desc:'All weapons +15% ammo', col:'#aaff00', ic:'bullet', max:4},
{id:'quick_hands', cat:'weapon', name:'QUICK HANDS', desc:'All reloads ~10% faster', col:'#88ffaa', ic:'reload', max:3},
{id:'hair_trigger', cat:'weapon', name:'HAIR TRIGGER', desc:'All weapons fire ~10% faster', col:'#00ffcc', ic:'bolt', max:4},
{id:'velocity', cat:'weapon', name:'HIGH VELOCITY', desc:'Bullets fly ~8% faster and farther', col:'#99ddff', ic:'up', max:3},
{id:'adrenal_reload', cat:'weapon', name:'ADRENAL RELOAD', desc:'Every ~14 kills your magazine refills instantly', col:'#66ffcc', ic:'reload', max:2, minWave:2},
/* ── PER-WEAPON DAMAGE ── */
{id:'shotgun_dmg', cat:'weapon', name:'BUCKSHOT LOAD', desc:'Shotgun damage +1', col:'#ffaa00', ic:'bullet', max:5, wep:'shotgun', dmg:1},
{id:'smg_dmg', cat:'weapon', name:'AP SMG ROUNDS', desc:'SMG damage +1', col:'#00ffcc', ic:'bullet', max:5, wep:'smg', dmg:1},
{id:'minigun_dmg', cat:'weapon', name:'TUNGSTEN BELT', desc:'Minigun damage +1', col:'#ff6600', ic:'bullet', max:5, wep:'minigun', dmg:1},
{id:'rpg_dmg', cat:'weapon', name:'SHAPED CHARGE', desc:'RPG damage +2', col:'#ff4400', ic:'burst', max:5, wep:'rpg', dmg:2},
{id:'flame_dmg', cat:'weapon', name:'NAPALM MIX', desc:'Flamethrower damage +1', col:'#ff8800', ic:'flame', max:5, wep:'flamethrower', dmg:1},
/* ── KILL REWARDS ── */
{id:'scavenger', cat:'ordnance', name:'SCAVENGER', desc:'12% chance a kill refunds a round', col:'#ccff66', ic:'bullet', max:4},
{id:'nade_finder', cat:'ordnance', name:'DEMO SCAVENGER', desc:'Every ~20 kills you find a grenade', col:'#88cc44', ic:'nade', max:3},
{id:'second_wind', cat:'survival', name:'SECOND WIND', desc:'Every ~30 kills restore 4 HP', col:'#ff6688', ic:'heart', max:3},
{id:'kinetic_barrier', cat:'survival', name:'KINETIC BARRIER', desc:'Every ~36 kills gain a brief shield', col:'#33ccff', ic:'shield', max:2, minWave:2},
{id:'blood_rush', cat:'survival', name:'BLOOD RUSH', desc:'Kills grant a short burst of speed', col:'#ff3366', ic:'boot', max:3},
{id:'death_bloom', cat:'support', name:'DEATH BLOOM', desc:'10% chance a kill bursts into a damaging ring', col:'#ff55aa', ic:'burst', max:4, minWave:2},
{id:'bounty', cat:'support', name:'BOUNTY HUNTER', desc:'Kills grant bonus XP', col:'#ffee44', ic:'star', max:3},
{id:'quick_study', cat:'support', name:'QUICK STUDY', desc:'+15% XP from everything', col:'#ffff88', ic:'book', max:3},
/* ── MOBILITY & UTILITY ── */
{id:'sprint_boots', cat:'survival', name:'SPRINT BOOTS', desc:'+6% move speed', col:'#ff44ff', ic:'boot', max:4},
{id:'magnetism', cat:'support', name:'SCRAP MAGNET', desc:'Pickups drift toward you', col:'#cc88ff', ic:'magnet', max:3},
{id:'nade_pack', cat:'ordnance', name:'DEMO PACK', desc:'+3 grenades', col:'#66aa33', ic:'nade', max:4},
{id:'war_chest', cat:'ordnance', name:'WAR CHEST', desc:'Each wave start: +1 grenade', col:'#aacc55', ic:'nade', max:3},
{id:'field_rations', cat:'survival', name:'FIELD RATIONS', desc:'Each wave start: heal 8% max HP', col:'#ff88aa', ic:'heart', max:3},
/* ── AUTOMATIC SYSTEMS ── */
{id:'static_field', cat:'support', name:'STATIC FIELD', desc:'Periodic shock ring zaps nearby enemies', col:'#44ddff', ic:'wave', max:3, minWave:2},
{id:'laser_drones', cat:'support', name:'LASER WINGMEN', desc:'+1 orbiting drone that snipes nearby enemies', col:'#44ffdd', ic:'drone', max:4, minWave:3},
{id:'storm_caller', cat:'support', name:'STORM CALLER', desc:'Lightning strikes random enemies', col:'#ffff55', ic:'bolt', max:3, minWave:4},
{id:'minefield', cat:'support', name:'MINE LAYER', desc:'Drops proximity mines as you fight', col:'#ff9944', ic:'mine', max:3, minWave:3},
{id:'scorched_earth', cat:'support', name:'SCORCHED EARTH', desc:'Your trail burns anything that follows', col:'#ff6622', ic:'flame', max:3, minWave:3},
{id:'bullet_time', cat:'support', name:'BULLET TIME', desc:'Every ~20s the whole battlefield slows to a crawl for a few seconds', col:'#bb99ff', ic:'reload', max:3, minWave:4},
{id:'cryo_pulse', cat:'support', name:'CRYO PULSE', desc:'Periodic frost wave slows nearby enemies', col:'#88eeff', ic:'snow', max:3, minWave:3},
/* ── SQUAD ── */
{id:'ally_squad', cat:'support', name:'REINFORCEMENTS', desc:'Deploy another ally soldier', col:'#00ffcc', ic:'people', max:3, minWave:2},
{id:'ally_tough', cat:'support', name:'SQUAD ARMOR', desc:'Allies gain +40% HP', col:'#44ccaa', ic:'shield', max:3, needAlly:true}
];
PERKS.forEach(p=>{
  p.perk = true;
  p.icon = _upIconSvg(_PK_IC[p.ic]||_PK_IC.star);
  const _base = p.desc;
  Object.defineProperty(p, 'desc', { enumerable:true, configurable:true, get(){
    const pu=$psycho2.playerUpgrades, s=(pu&&pu.perk&&pu.perk[p.id])||0;
    return _base + '  ['+s+'/'+p.max+']';
  }});
  UPGRADES.push(p);
});
const PERK_BY_ID = {}; PERKS.forEach(p=>{ PERK_BY_ID[p.id]=p; });
$psycho2.PERKS = PERKS;
$psycho2._perkEligible = function(u){
  const pu=$psycho2.playerUpgrades, pk=(pu&&pu.perk)||{};
  if((pk[u.id]||0) >= u.max) return false;
  if(u.req && !(pk[u.req]>0)) return false;
  if(u.wep && !$buildings.WK.includes(u.wep)) return false;
  if(u.needAlly && !(($buildings.allies||[]).length>0)) return false;
  return true;
};

$psycho2.playerUpgrades = {speed:1,shieldOnWave:false,hpRegen:false,bigBoom:false,mutations:new Set(),taken:new Set()};
$psycho2.wepEvolution = Object.fromEntries(Object.keys($buildings.WEAPONS).map(w=>[w,0]));
$psycho2.armorTier = 0;
$psycho2.wepUpgradeCount = Object.fromEntries(Object.keys($buildings.WEAPONS).map(w=>[w,0]));
const SYNERGY_PAIRS = [
{key:'pierce_explosive',    a:'mut_pierce',    b:'mut_explosive', name:'TUNGSTEN FRAG',  effect:'bullets explode after piercing'},
{key:'magnet_chain',        a:'mut_magnet',    b:'mut_chain',     name:'SEEKING STORM',  effect:'chain arcs home to targets'},
{key:'poison_lifesteal',    a:'mut_poison',    b:'mut_lifesteal', name:'VAMPIRIC TOXIN', effect:'poison heals you'},
{key:'multishot_explosive', a:'mut_multishot', b:'mut_explosive', name:'FRAG BURST',     effect:'all burst pellets explode'},
{key:'pierce_chain',        a:'mut_pierce',    b:'mut_chain',     name:'CHAIN PIERCE',   effect:'pierced enemies arc lightning'},
{key:'ricochet_explosive',  a:'mut_ricochet',  b:'mut_explosive', name:'BOUNCING BETTY', effect:'ricochets explode'},
{key:'poison_chain',        a:'mut_poison',    b:'mut_chain',     name:'PLAGUE ARC',     effect:'chain spreads toxin'},
{key:'multishot_lifesteal', a:'mut_multishot', b:'mut_lifesteal', name:'BLOOD BURST',    effect:'burst hits restore HP'},
{key:'pierce_poison',       a:'mut_pierce',    b:'mut_poison',    name:'VENOM LANCE',    effect:'pierced enemies get a long, deep poison'},
{key:'magnet_explosive',    a:'mut_magnet',    b:'mut_explosive', name:'HEAT SEEKER',    effect:'homing rounds detonate in a wide blast'},
{key:'ricochet_chain',      a:'mut_ricochet',  b:'mut_chain',     name:'ARC REBOUND',    effect:'every ricochet fires a lightning arc'},
{key:'ricochet_poison',     a:'mut_ricochet',  b:'mut_poison',    name:'TOXIC BOUNCE',   effect:'ricochets leave poison clouds'},
{key:'chain_explosive',     a:'mut_chain',     b:'mut_explosive', name:'THUNDER FRAG',   effect:'chain arcs detonate on arrival'},
{key:'magnet_pierce',       a:'mut_magnet',    b:'mut_pierce',    name:'GUIDED LANCE',   effect:'piercing rounds re-aim at the next enemy'},
{key:'lifesteal_explosive', a:'mut_lifesteal', b:'mut_explosive', name:'BLOOD BLAST',    effect:'explosions heal you per enemy caught'},
{key:'multishot_magnet',    a:'mut_multishot', b:'mut_magnet',    name:'SWARM SPLIT',    effect:'burst pellets home in as a rainbow swarm'},
{key:'pierce_ricochet',     a:'mut_pierce',    b:'mut_ricochet',  name:'PRISM RAIL',     effect:'bounces refresh piercing so it cuts the same line twice'},
{key:'pierce_lifesteal',    a:'mut_pierce',    b:'mut_lifesteal', name:'SOUL SKEWER',    effect:'every extra enemy pierced heals you'},
{key:'pierce_multishot',    a:'mut_pierce',    b:'mut_multishot', name:'PIERCING BARRAGE', effect:'burst pellets pierce too'},
{key:'explosive_poison',    a:'mut_explosive', b:'mut_poison',    name:'CAUSTIC FRAG',   effect:'blasts poison everything they touch'},
{key:'chain_lifesteal',     a:'mut_chain',     b:'mut_lifesteal', name:'LEECH ARC',      effect:'chain arcs drain HP back to you'},
{key:'chain_multishot',     a:'mut_chain',     b:'mut_multishot', name:'STORM CELL',     effect:'each burst calls 3 lightning strikes'},
{key:'poison_magnet',       a:'mut_poison',    b:'mut_magnet',    name:'PLAGUE SEEKER',  effect:'hits on poisoned enemies spread the plague'},
{key:'poison_multishot',    a:'mut_poison',    b:'mut_multishot', name:'SPORE BURST',    effect:'every burst releases a toxic spore cloud'},
{key:'ricochet_magnet',     a:'mut_ricochet',  b:'mut_magnet',    name:'BOOMERANG',      effect:'bounces re-lock onto the nearest enemy'},
{key:'ricochet_lifesteal',  a:'mut_ricochet',  b:'mut_lifesteal', name:'BLOOD RICOCHET', effect:'every bounce heals you'},
{key:'ricochet_multishot',  a:'mut_ricochet',  b:'mut_multishot', name:'PRISM SCATTER',  effect:'bounces split into 3 rainbow shards'},
{key:'magnet_lifesteal',    a:'mut_magnet',    b:'mut_lifesteal', name:'HUNTING LEECH',  effect:'homing rounds finish wounded enemies for extra HP'},
];
function _wouldSynergy(upgradeId){
const has = $psycho2.playerUpgrades.mutations;
for(const p of SYNERGY_PAIRS){
if(upgradeId===p.a && has.has(p.b)) return p.effect;
if(upgradeId===p.b && has.has(p.a)) return p.effect;
}
return null;
}
const MAX_UPGRADE_REROLLS = 2;
function showUpgradePanel(isReroll){
$buildings.isPaused=true;
const panel=el('upgrade-panel');
panel.style.display='flex';
panel.style.flexDirection='column';
panel.style.alignItems='center';
panel.style.justifyContent='center';
const ONE_TIME = new Set(['shield_up','double_shield','hp_regen','speed_up','reload_up']);
const eligible = UPGRADES.filter(u=>{
if(u.minWave && $buildings.wave < u.minWave) return false;
if(u.perk && !$psycho2._perkEligible(u)) return false;
if(u.cat === 'mutation' && $psycho2.playerUpgrades.mutations.has(u.id)) return false;
if(ONE_TIME.has(u.id) && $psycho2.playerUpgrades.taken.has(u.id)) return false;
if(u.id === 'double_shield' && !$psycho2.playerUpgrades.taken.has('shield_up')) return false;
if(u.cat === 'evolution'){
const currentTier = $psycho2.wepEvolution[u.wep] || 0;
if(u.tier !== currentTier + 1) return false;
if($psycho2.wepUpgradeCount[u.wep] < u.tier * 2) return false;
if(u.tier === 3 && u.minWave && $buildings.wave < u.minWave) return false;
}
if(u.cat === 'armor'){
if(u.tier !== ($psycho2.armorTier||0) + 1) return false;
}
return true;
});
const mutations = eligible.filter(u=>u.cat==='mutation');
const evolutions = eligible.filter(u=>u.cat==='evolution');
const normal = eligible.filter(u=>u.cat!=='mutation'&&u.cat!=='evolution');
let pool = [];
if(evolutions.length > 0){
pool.push(evolutions[Math.floor(Math.random()*evolutions.length)]);
}
if(mutations.length > 0 && $buildings.wave >= 3 && pool.length < 2){
const available = mutations.filter(m=>!pool.includes(m));
if(available.length > 0) pool.push(available[Math.floor(Math.random()*available.length)]);
}
function _fyshuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=arr[i]; arr[i]=arr[j]; arr[j]=t; } return arr; }
const shuffled = _fyshuffle([...normal]);
while(pool.length < 3 && shuffled.length > 0) pool.push(shuffled.shift());
const remainder = _fyshuffle(eligible.filter(u=>!pool.includes(u)));
while(pool.length < 3 && remainder.length > 0) pool.push(remainder.shift());
pool = _fyshuffle(pool).slice(0,3);
if(pool.length === 0){
panel.style.display='none'; $buildings.isPaused=false; $buildings.wavePending=false;
if($core.isMobile) $profiler.showTouchControls(true);
const maxW0=$replay.currentLevel?$replay.currentLevel.maxWaves:999;
window.currentLevel=$replay.currentLevel;window.score=$buildings.score;window.wave=$buildings.wave;window.totalKills=$buildings.totalKills;
if($replay.currentLevel && !$replay.currentLevel.isEndless && $buildings.wave>=maxW0){ _gst(()=>{ if($buildings.state==='playing') window.showLevelComplete(); },400); }
else { _gst(nextWave,150); }
return;
}
const choices=el('upgrade-choices');
choices.innerHTML='';
let _upgradeHintEl = el('upgrade-panel').querySelector('#upgrade-hint-line');
if(!_upgradeHintEl){
_upgradeHintEl = document.createElement('div');
_upgradeHintEl.id = 'upgrade-hint-line';
_upgradeHintEl.style.cssText = 'font-size:9px;color:#3a6000;letter-spacing:2px;margin-bottom:18px;text-align:center;max-width:600px;line-height:1.6;min-height:14px;';
el('upgrade-panel').insertBefore(_upgradeHintEl, choices);
}
let _panelsOpened = 0;
try{ _panelsOpened = parseInt(localStorage.getItem('diy_upgrade_panels_seen')||'0'); }catch(e){}
const _hasAnyMutation = $psycho2.playerUpgrades.mutations.size > 0;
const _hasAnyEvolution = Object.values($psycho2.wepEvolution).some(t=>t>0);
const _FIRST_HINTS = [
'TIP — MUTATIONS stack with each other. PIERCE + EXPLOSIVE = bullets explode after going through enemies.',
'TIP — * EVOLUTION cards appear after 2 weapon upgrades. Evolved weapons are dramatically stronger.',
'TIP — MUTATIONS listed with ▸ COMBO already synergise with something you have active.',
];
if(_panelsOpened < 3 && !isReroll){
_upgradeHintEl.innerHTML = `<span style="color:#5a8800">${_FIRST_HINTS[_panelsOpened]}</span>`;
try{ localStorage.setItem('diy_upgrade_panels_seen', String(_panelsOpened+1)); }catch(e){}
} else if(!isReroll){
const _mutCount = $psycho2.playerUpgrades.mutations.size;
const _evoCount = Object.values($psycho2.wepEvolution).filter(t=>t>0).length;
const parts = [];
if(_mutCount) parts.push(`${_mutCount} MUTATION${_mutCount>1?'S':''} ACTIVE`);
if(_evoCount) parts.push(`${_evoCount} WEAPON${_evoCount>1?'S':''} EVOLVED`);
_upgradeHintEl.textContent = parts.length ? parts.join(' · ') : '';
}
const CAT_LABEL = {survival:'SURVIVAL',ordnance:'ORDNANCE',weapon:'WEAPON',support:'SUPPORT',mutation:':: MUTATION',evolution:'* EVOLUTION'};
const CAT_COL = {survival:'#ff4466',ordnance:'#ffcc00',weapon:'#aaff00',support:'#00ffcc',mutation:'#aaffff',evolution:'#ffff00'};
pool.forEach(u=>{
const btn=document.createElement('div');
btn.className='upgrade-card';
btn.setAttribute('tabindex','0');
const catLabel = CAT_LABEL[u.cat]||'';
const catCol = u.col;
const isMutation = u.cat==='mutation';
const isEvolution = u.cat==='evolution';
const borderCol = isEvolution ? '#ffff00' : isMutation ? '#aaffff' : u.col;
btn.style.cssText=`background:rgba(0,20,0,0.9);border:2px solid ${borderCol}44;padding:24px 20px;cursor:pointer;text-align:center;min-width:140px;max-width:220px;flex:1 1 140px;min-height:160px;transition:all 0.2s;font-family:'Share Tech Mono',monospace;position:relative;overflow:hidden;touch-action:manipulation;-webkit-tap-highlight-color:transparent;border-radius:8px;`;
if(isEvolution) btn.style.background='rgba(20,20,0,0.95)';
if(isMutation) btn.style.background='rgba(0,20,20,0.95)';
const glowStyle = (isEvolution||isMutation) ? `box-shadow:0 0 18px ${borderCol}44;` : '';
btn.style.cssText += glowStyle;
btn.innerHTML=`
<div class="upgrade-card-icon" style="font-size:28px;margin-bottom:8px;">${u.icon}</div>
<div class="upgrade-card-body">
<div style="font-size:8px;letter-spacing:3px;color:${borderCol};margin-bottom:6px;opacity:0.7;">${catLabel}</div>
<div style="color:${u.col};font-size:12px;letter-spacing:2px;margin-bottom:6px;">${u.name}</div>
${(()=>{const _syn=_wouldSynergy(u.id);return _syn?`<div style="font-size:8px;letter-spacing:1px;color:#ffff44;margin-bottom:5px;padding:3px 6px;background:rgba(40,40,0,0.6);border:1px solid #ffff4444;">▸ COMBO: ${_syn}</div>`:''})()}
<div style="color:#3a5a00;font-size:10px;line-height:1.5;">${u.desc}</div>
</div>
`;
btn.onmouseover=()=>{btn.style.borderColor=borderCol;btn.style.background=isEvolution?'rgba(40,40,0,0.98)':isMutation?'rgba(0,40,40,0.98)':'rgba(0,40,0,0.95)';btn.style.transform='scale(1.04)';};
btn.onmouseout=()=>{btn.style.borderColor=borderCol+'44';btn.style.background=isEvolution?'rgba(20,20,0,0.95)':isMutation?'rgba(0,20,20,0.95)':'rgba(0,20,0,0.9)';btn.style.transform='';};
btn.onfocus=()=>{btn.style.borderColor=borderCol;btn.style.background=isEvolution?'rgba(40,40,0,0.98)':isMutation?'rgba(0,40,40,0.98)':'rgba(0,40,0,0.95)';};
btn.onblur=()=>{btn.style.borderColor=borderCol+'44';btn.style.background=isEvolution?'rgba(20,20,0,0.95)':isMutation?'rgba(0,20,20,0.95)':'rgba(0,20,0,0.9)';};
const doUpgrade=()=>{
audioManager.upgradeConfirm();
btn.style.transition = 'background 0.08s, transform 0.08s';
btn.style.background = borderCol + '55';
btn.style.transform = 'scale(1.08)';
_gst(()=>{
const _pickedDef = applyUpgrade(u.id);
panel.style.display='none'; $buildings.isPaused=false; $buildings.wavePending=false;
const _sg2 = document.getElementById('synergy-glossary');
if(_sg2) _sg2.style.display='none';
if($core.isMobile) $profiler.showTouchControls(true);
$core.canvas.setAttribute('tabindex', '0');
$core.canvas.focus({ preventScroll: true });
if(_pickedDef){
showPickupMsg((_pickedDef.icon||'::')+' '+_pickedDef.name, _pickedDef.col||'#aaff00', _pickedDef.desc);
}
const maxW = $replay.currentLevel ? $replay.currentLevel.maxWaves : 999;
window.currentLevel=$replay.currentLevel;window.score=$buildings.score;window.wave=$buildings.wave;window.totalKills=$buildings.totalKills;
if($replay.currentLevel && !$replay.currentLevel.isEndless && $buildings.wave >= maxW) { _gst(()=>{ if($buildings.state==='playing') window.showLevelComplete(); }, 400); }
else { _gst(nextWave, 120); }
}, 90);
};
btn.addEventListener('click', doUpgrade);
btn.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();doUpgrade();} });
btn.addEventListener('touchstart', e=>{ e.preventDefault(); e.stopPropagation(); doUpgrade(); }, {passive:false});
choices.appendChild(btn);
});
if($buildings.settingKbNav || document.body.classList.contains('kb-nav')){
_gst(()=>{ choices.querySelector('.upgrade-card')?.focus(); }, 80);
}
if(pool.some(u=>u.cat==='mutation')){
let _mutPanelsSeen = 0;
try{ _mutPanelsSeen = parseInt(localStorage.getItem('diy_mut_panels_seen')||'0'); }catch(e){}
if(_mutPanelsSeen < 2){
const _sgAuto = el('synergy-glossary');
if(_sgAuto) _sgAuto.style.display = 'flex';
try{ localStorage.setItem('diy_mut_panels_seen', String(_mutPanelsSeen+1)); }catch(e){}
}
}
let _rerollBtn = el('upgrade-reroll-btn');
if(!_rerollBtn){
_rerollBtn = document.createElement('div');
_rerollBtn.id = 'upgrade-reroll-btn';
_rerollBtn.style.cssText = 'margin-top:16px;font-family:\'Share Tech Mono\',monospace;font-size:11px;letter-spacing:2px;padding:9px 22px;cursor:pointer;touch-action:manipulation;border-radius:6px;';
panel.appendChild(_rerollBtn);
}
const _rerollsLeft = MAX_UPGRADE_REROLLS - $buildings._upgradeRerollsUsed;
if(_rerollsLeft > 0){
_rerollBtn.style.display='block';
_rerollBtn.style.background='rgba(0,30,40,0.5)';
_rerollBtn.style.border='1px solid #00cccc88';
_rerollBtn.style.color='#00eeee';
_rerollBtn.innerHTML = `◇ RE-ROLL <span style="opacity:0.6;">(${_rerollsLeft} left)</span>`;
_rerollBtn.onclick = () => {
audioManager.uiClick();
$buildings._upgradeRerollsUsed += 1;
showUpgradePanel(true);
};
} else {
_rerollBtn.style.display='block';
_rerollBtn.style.background='rgba(20,20,20,0.3)';
_rerollBtn.style.border='1px solid #333333';
_rerollBtn.style.color='#555555';
_rerollBtn.innerHTML = '◇ NO RE-ROLLS LEFT';
_rerollBtn.onclick = null;
}
}
const MUT_PILL_DEF = {
  mut_pierce:    ['>', 'PIERCE',   '#00eeff'],
  mut_explosive: ['!','FRAG',     '#ff8800'],
  mut_chain:     ['▸','CHAIN',    '#ffee00'],
  mut_poison:    ['X', 'TOXIN',   '#88ff44'],
  mut_ricochet:  ['⟲', 'RICO',    '#ff44ff'],
  mut_magnet:    ['⟲','HOMING',  '#00ffcc'],
  mut_lifesteal: ['+','LEECH',   '#ff2266'],
  mut_multishot: ['*', 'BURST',   '#ffffaa'],
}; ;$psycho2.MUT_PILL_DEF = MUT_PILL_DEF;

function _mutPillRebuild(){
  const strip = document.getElementById('mut-pill-strip');
  if(!strip) return;
  const isPlaying = (typeof $buildings.state !== 'undefined' && $buildings.state === 'playing');
  if(!isPlaying){ strip.classList.remove('has-muts'); strip.innerHTML=''; return; }
  const muts = $psycho2.playerUpgrades ? [...$psycho2.playerUpgrades.mutations] : [];
  if(!muts.length){ strip.classList.remove('has-muts'); strip.innerHTML=''; return; }
  const existing = new Set([...strip.querySelectorAll('.mut-chip')].map(c=>c.dataset.mid));
  muts.forEach(mid => {
    if(existing.has(mid)) return;
    const [icon, label, col] = MUT_PILL_DEF[mid] || ['::', mid.replace('mut_','').toUpperCase(), '#aaffff'];
    const chip = document.createElement('div');
    chip.className = 'mut-chip';
    chip.dataset.mid = mid;
    chip.style.color = col;
    chip.style.boxShadow = `0 0 8px ${col}55, inset 0 0 6px ${col}22`;
    chip.innerHTML = `<span class="mut-chip-icon">${icon}</span><span class="mut-chip-name" style="color:${col}">${label}</span>`;
    strip.appendChild(chip);
  });
  strip.classList.add('has-muts');
}

function _mutPillAdd(id, mu){
  const strip = document.getElementById('mut-pill-strip');
  if(!strip) return;
  _mutPillRebuild();
  _gst(()=>{
    const chip = strip.querySelector(`.mut-chip[data-mid="${id}"]`);
    if(chip){ chip.classList.remove('flash'); void chip.offsetWidth; chip.classList.add('flash'); }
  }, 80);
  _gst(()=>{
    const muts = $psycho2.playerUpgrades ? $psycho2.playerUpgrades.mutations : new Set();
    const pair = SYNERGY_PAIRS.find(p => p.a === id || p.b === id
      ? (muts.has(p.a) && muts.has(p.b)) : false);
    if(!pair) return;
    const oldBadge = strip.querySelector(`.mut-synergy-badge[data-key="${pair.a}_${pair.b}"]`);
    if(oldBadge) oldBadge.remove();
    const badge = document.createElement('div');
    badge.className = 'mut-synergy-badge';
    badge.dataset.key = `${pair.a}_${pair.b}`;
    badge.textContent = '▸ ' + pair.name;
    strip.appendChild(badge);
    const _removeBadge = ()=>{
      if($buildings.isPaused){ setTimeout(_removeBadge, 500); return; }
      setTimeout(()=>{ if(badge.parentNode) badge.remove(); }, 8000);
    };
    _removeBadge();
  }, 3000);
}

function _mutPillClear(){
  const strip = document.getElementById('mut-pill-strip');
  if(!strip) return;
  strip.classList.remove('has-muts');
  strip.innerHTML = '';
}
(function _mutPillWatcher(){
  let _lastState = null;
  setInterval(()=>{
    if(document.hidden) return;
    const s = (typeof $buildings.state !== 'undefined') ? $buildings.state : null;
    if(s !== _lastState){
      if(s !== 'playing') _mutPillClear();
      _lastState = s;
    }
  }, 600);
})();

function applyUpgrade(id){
audioManager.levelUp();
shake(4);
if($psycho2.playerUpgrades.taken) $psycho2.playerUpgrades.taken.add(id);
{
const _pd = PERK_BY_ID[id];
if(_pd){
const _pk = ($psycho2.playerUpgrades.perk = $psycho2.playerUpgrades.perk || {});
_pk[id] = (_pk[id]||0) + 1;
showPickupMsg(':: '+_pd.name+'  '+_pk[id]+'/'+_pd.max, _pd.col, _pd.desc);
if(window.__perkApply) window.__perkApply(id, _pk[id], _pd);
$legendary.updateWepUpgradeHUD(); $legendary.updateHUD();
return _pd;
}
}
if(id.startsWith('mut_')){
$psycho2.playerUpgrades.mutations.add(id);
const mu = UPGRADES.find(u=>u.id===id);
const muts = $psycho2.playerUpgrades.mutations;
const _SYN_FLAVOR = {
pierce_explosive:   { cryptic: '▸ Something stirs in your rounds...',
reveal: '▸ SYNERGY UNLOCKED: PIERCE + FRAG -> bullets explode AFTER piercing!' },
magnet_chain:        { cryptic: '▸ The arcs... they feel drawn...',
reveal: '▸ SYNERGY UNLOCKED: HOMING + CHAIN -> chain lightning also homes!' },
poison_lifesteal:    { cryptic: '▸ Something toxic... yet restorative...',
reveal: '▸ SYNERGY UNLOCKED: TOXIN + LEECH -> poison ticks restore your HP!' },
multishot_explosive: { cryptic: '▸ Each pellet... vibrating with pressure...',
reveal: '▸ SYNERGY UNLOCKED: BURST + FRAG -> every burst pellet explodes!' },
pierce_chain:        { cryptic: '▸ The arc leaps further than it should...',
reveal: '▸ SYNERGY UNLOCKED: PIERCE + CHAIN -> chain lightning arcs from pierced enemies!' },
ricochet_explosive:  { cryptic: '▸ The bounce... it carries too much energy...',
reveal: '▸ SYNERGY UNLOCKED: RICOCHET + FRAG -> bounced bullets explode on impact!' },
poison_chain:        { cryptic: '▸ The sickness... spreading further...',
reveal: '▸ SYNERGY UNLOCKED: TOXIN + CHAIN -> chain lightning spreads poison!' },
multishot_lifesteal: { cryptic: '▸ Every hit... feeding you...',
reveal: '▸ SYNERGY UNLOCKED: BURST + LEECH -> every burst pellet leeches HP!' },
pierce_poison:       { cryptic: '▸ The lance... it drips...',
reveal: '▸ SYNERGY UNLOCKED: PIERCE + TOXIN -> VENOM LANCE: pierced enemies get a deep poison!' },
magnet_explosive:    { cryptic: '▸ Your rounds hunger for a target...',
reveal: '▸ SYNERGY UNLOCKED: HOMING + FRAG -> HEAT SEEKER: homing rounds detonate wide!' },
ricochet_chain:      { cryptic: '▸ The walls... crackle when you strike them...',
reveal: '▸ SYNERGY UNLOCKED: RICOCHET + CHAIN -> ARC REBOUND: every bounce fires lightning!' },
ricochet_poison:     { cryptic: '▸ Where the bullet bounced, the air turns green...',
reveal: '▸ SYNERGY UNLOCKED: RICOCHET + TOXIN -> TOXIC BOUNCE: bounces leave poison clouds!' },
chain_explosive:     { cryptic: '▸ The arc lands... and the ground answers...',
reveal: '▸ SYNERGY UNLOCKED: CHAIN + FRAG -> THUNDER FRAG: chain arcs detonate on arrival!' },
magnet_pierce:       { cryptic: '▸ The lance finds its own way...',
reveal: '▸ SYNERGY UNLOCKED: HOMING + PIERCE -> GUIDED LANCE: piercing rounds re-aim at the next enemy!' },
lifesteal_explosive: { cryptic: '▸ The blast... it feeds you...',
reveal: '▸ SYNERGY UNLOCKED: LEECH + FRAG -> BLOOD BLAST: explosions heal you per enemy caught!' },
multishot_magnet:    { cryptic: '▸ The pellets scatter... then turn...',
reveal: '▸ SYNERGY UNLOCKED: BURST + HOMING -> SWARM SPLIT: a rainbow swarm of homing pellets!' },
pierce_ricochet:     { cryptic: '▸ The light bends... and comes back through...',
reveal: '▸ SYNERGY UNLOCKED: PIERCE + RICOCHET -> PRISM RAIL: bounces refresh piercing!' },
pierce_lifesteal:    { cryptic: '▸ Each body the lance passes... gives something...',
reveal: '▸ SYNERGY UNLOCKED: PIERCE + LEECH -> SOUL SKEWER: every extra pierce heals you!' },
pierce_multishot:    { cryptic: '▸ The pellets feel... sharper...',
reveal: '▸ SYNERGY UNLOCKED: PIERCE + BURST -> PIERCING BARRAGE: burst pellets pierce!' },
explosive_poison:    { cryptic: '▸ The blast leaves a taste in the air...',
reveal: '▸ SYNERGY UNLOCKED: FRAG + TOXIN -> CAUSTIC FRAG: blasts poison everything!' },
chain_lifesteal:     { cryptic: '▸ The lightning... drinks...',
reveal: '▸ SYNERGY UNLOCKED: CHAIN + LEECH -> LEECH ARC: chain arcs drain HP to you!' },
chain_multishot:     { cryptic: '▸ The sky answers every burst...',
reveal: '▸ SYNERGY UNLOCKED: CHAIN + BURST -> STORM CELL: each burst calls 3 lightning strikes!' },
poison_magnet:       { cryptic: '▸ The sickness knows where to go...',
reveal: '▸ SYNERGY UNLOCKED: TOXIN + HOMING -> PLAGUE SEEKER: hits spread the plague!' },
poison_multishot:    { cryptic: '▸ Something blooms at every split...',
reveal: '▸ SYNERGY UNLOCKED: TOXIN + BURST -> SPORE BURST: bursts release spore clouds!' },
ricochet_magnet:     { cryptic: '▸ The bounce... remembers where you aimed...',
reveal: '▸ SYNERGY UNLOCKED: RICOCHET + HOMING -> BOOMERANG: bounces re-lock on targets!' },
ricochet_lifesteal:  { cryptic: '▸ The wall gives back more than it takes...',
reveal: '▸ SYNERGY UNLOCKED: RICOCHET + LEECH -> BLOOD RICOCHET: every bounce heals you!' },
ricochet_multishot:  { cryptic: '▸ The wall shatters your shot into colour...',
reveal: '▸ SYNERGY UNLOCKED: RICOCHET + BURST -> PRISM SCATTER: bounces split into shards!' },
magnet_lifesteal:    { cryptic: '▸ The hunt... feeds you...',
reveal: '▸ SYNERGY UNLOCKED: HOMING + LEECH -> HUNTING LEECH: homing finishes the wounded!' },
};
const _SYNERGY_PAIRS_FULL = SYNERGY_PAIRS.map(p => ({
...p,
cryptic: _SYN_FLAVOR[p.key].cryptic,
reveal: _SYN_FLAVOR[p.key].reveal,
reminder: '▸ ' + p.name + ' active — ' + p.effect,
}));
let _discovered;
try { _discovered = new Set((localStorage.getItem('diy_syn_discovered')||'').split(',').filter(Boolean)); }
catch(e) { _discovered = new Set(); }
const _saveDiscovered = (set) => {
try { localStorage.setItem('diy_syn_discovered', [...set].join(',')); } catch(e) {}
};
const _activePairs = _SYNERGY_PAIRS_FULL.filter(p => muts.has(p.a) && muts.has(p.b));
const _newPair = _activePairs.find(p => !_discovered.has(p.key));
if (_newPair) {
_discovered.add(_newPair.key);
_saveDiscovered(_discovered);
_gst(() => {
radioChatter(_newPair.cryptic, '#ffff88', 3000);
}, 400);
_gst(() => {
radioChatter(_newPair.reveal, '#ffff00', 6000);
shake(3);
try {
const _ctx = audioManager._ensureCtx();
if (_ctx) {
[[880, 0], [1109, 0.12]].forEach(([freq, delay]) => {
const o = _ctx.createOscillator();
const g = _ctx.createGain();
o.type = 'sine'; o.frequency.value = freq;
g.gain.setValueAtTime(0, _ctx.currentTime + delay);
g.gain.linearRampToValueAtTime(0.08, _ctx.currentTime + delay + 0.02);
g.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + delay + 0.35);
o.connect(g); g.connect(_ctx.destination);
o.start(_ctx.currentTime + delay);
o.stop(_ctx.currentTime + delay + 0.36);
});
}
} catch(e) {}
floatTextPop($buildings.player.x, $buildings.player.y - 60, '▸ ' + _newPair.name, '#ffff00', 18);
}, 2800);
} else if (_activePairs.length > 0) {
_activePairs.forEach((p, i) => {
_gst(() => radioChatter(p.reminder, '#aaaa44', 4000), i * 1100);
});
}
showPickupMsg(':: MUTATION: '+(mu?mu.name:id),'#aaffff', mu?mu.desc:undefined);
_mutPillAdd(id, mu);
$legendary.updateWepUpgradeHUD(); $legendary.updateHUD(); return;
}
if(id.startsWith('evo_')){
const ev = UPGRADES.find(u=>u.id===id);
if(ev){
$psycho2.wepEvolution[ev.wep] = ev.tier;
const tierLabel = ev.tier===3 ? '* LEGENDARY' : ev.tier===2 ? '* ASCENDED' : 'EVOLVED';
showPickupMsg(tierLabel+': '+$buildings.WEAPONS[ev.wep].name,'#ffff00', ev.desc);
shake(ev.tier===3 ? 18 : 8);
_applyEvolution(ev.wep, ev.tier);
if(ev.tier===3){
_gst(()=>{ $profiler.showUnlockBanner('* LEGENDARY: '+$buildings.WEAPONS[ev.wep].name.toUpperCase(), ev.desc); audioManager.levelUp(); }, 200);
_gst(()=>{ audioManager.levelUp(); }, 600);
}
}
$legendary.updateWepUpgradeHUD(); $legendary.updateHUD(); return;
}
if(id.startsWith('armor_t')){
const av = UPGRADES.find(u=>u.id===id);
if(av){
$psycho2.armorTier = av.tier;
const tierLabel = av.tier===3 ? '* LEGENDARY' : av.tier===2 ? '* FORTIFIED' : 'HARDENED';
showPickupMsg(tierLabel+': ARMOR','#00ccff', av.desc);
shake(av.tier===3 ? 18 : 8);
_applyArmorTier(av.tier);
if(av.tier===3){
_gst(()=>{ $profiler.showUnlockBanner('* LEGENDARY ARMOR ONLINE', av.desc); audioManager.levelUp(); }, 200);
_gst(()=>{ audioManager.levelUp(); }, 600);
}
}
$legendary.updateHUD(); return;
}
const WEP_IDS = {rifle_dmg:'rifle',shotgun_ammo:'shotgun',smg_fire:'smg',knife_dmg:'knife',knife_speed:'knife',minigun_ammo:'minigun',rpg_ammo:'rpg',flame_fuel:'flamethrower'};
if(WEP_IDS[id]) $psycho2.wepUpgradeCount[WEP_IDS[id]] = ($psycho2.wepUpgradeCount[WEP_IDS[id]]||0)+1;
switch(id){
case 'hp_boost': $buildings.player.maxHp+=30; $buildings.player.hp=$buildings.player.maxHp; $legendary.updateHP(); break;
case 'rifle_dmg': $buildings.wepUpgrades.rifle.dmg++; break;
case 'shotgun_ammo': $buildings.wepUpgrades.shotgun.ammo+=2; $buildings.wepAmmo.shotgun=$buildings.WEAPONS.shotgun.ammo+$buildings.wepUpgrades.shotgun.ammo; break;
case 'smg_fire': $buildings.WEAPONS.smg.cd=Math.max(2,$buildings.WEAPONS.smg.cd-1); break;
case 'knife_dmg': $buildings.wepUpgrades.knife.dmg+=2;
if(($psycho2.wepUpgradeCount.knife||0) >= 2 && !$psycho2.playerUpgrades.knifeDash){
$psycho2.playerUpgrades.knifeDash = true;
_gst(()=>{ radioChatter('KNIFE MASTERY — DASH UNLOCKED! Double-tap move to dash while holding knife', '#c8d8ff', 6000); }, 500);
showPickupMsg('KNIFE DASH UNLOCKED!', '#c8d8ff');
const kSlot = document.querySelector('.wep-slot[data-wk=\"knife\"]');
if(kSlot) kSlot.classList.add('dash-unlocked');
}
break;
case 'speed_up': $psycho2.playerUpgrades.speed=Math.min($psycho2.playerUpgrades.speed+0.1,1.8); break;
case 'grenade_up': $buildings.grenadeCount=Math.min($buildings.grenadeCount+2,6); updateGrenadeHUD(); break;
case 'shield_up': $psycho2.playerUpgrades.shieldOnWave=true; $buildings.player.shield=300; break;
case 'reload_up': Object.keys($buildings.wepUpgrades).forEach(k=>$buildings.wepUpgrades[k].reload++); break;
case 'sp_overdrive': Object.keys($buildings.wepUpgrades).forEach(k=>{ $buildings.wepUpgrades[k].dmg+=3; }); try{ shake(14); $psycho2.killFlash('rgba(255,238,0,0.35)',100); navigator.vibrate&&navigator.vibrate([60,30,120]); }catch(e){} break;
case 'sp_shock': case 'sp_chaos': case 'sp_orbital': case 'sp_guardian': case 'sp_vampire': try{ shake(12); $psycho2.killFlash('rgba(255,255,255,0.3)',90); navigator.vibrate&&navigator.vibrate([40,20,80]); }catch(e){} break;
case 'ally_call': spawnAlly(); break;
case 'rpg_ammo': $buildings.wepUpgrades.rpg.ammo+=2; $buildings.wepAmmo.rpg=Math.min($buildings.WEAPONS.rpg.ammo+$buildings.wepUpgrades.rpg.ammo,10); $legendary.updateHUD(); break;
case 'minigun_ammo': $buildings.wepUpgrades.minigun.ammo+=30; $buildings.wepAmmo.minigun=Math.min($buildings.WEAPONS.minigun.ammo+$buildings.wepUpgrades.minigun.ammo,150); $legendary.updateHUD(); break;
case 'flame_fuel': $buildings.wepUpgrades.flamethrower.ammo+=16; $buildings.WEAPONS.flamethrower.range=Math.min($buildings.WEAPONS.flamethrower.range+64,320); $buildings.wepAmmo.flamethrower=Math.min($buildings.WEAPONS.flamethrower.ammo+$buildings.wepUpgrades.flamethrower.ammo,96); $legendary.updateHUD(); break;
case 'dmg_all': Object.keys($buildings.wepUpgrades).forEach(k=>$buildings.wepUpgrades[k].dmg++); break;
case 'double_shield':$psycho2.playerUpgrades.shieldOnWave=true; $buildings.player.shield=Math.min(($buildings.player.shield||0)+600,600); break;
case 'xp_boost': gainXP(500); break;
case 'knife_speed': $buildings.wepUpgrades.knife.dmg++;$buildings.wepUpgrades.knife.reload++;$buildings.wepUpgrades.knife.ammo+=2; break;
case 'hp_regen': $psycho2.playerUpgrades.hpRegen=true; break;
case 'grenade_bonus':$buildings.grenadeCount=Math.min($buildings.grenadeCount+3,9);$psycho2.playerUpgrades.bigBoom=true;updateGrenadeHUD(); break;
}
$legendary.updateWepUpgradeHUD();
$legendary.updateHUD();
return UPGRADES.find(u=>u.id===id)||null;
}
function _applyEvolution(wep, tier){
const u = $buildings.wepUpgrades[wep];
if(!u) return;
if(tier===1){
u.dmg += 2; u.ammo += Math.ceil($buildings.WEAPONS[wep].ammo * 0.25);
$buildings.WEAPONS[wep].cd = Math.max(2, Math.floor($buildings.WEAPONS[wep].cd * 0.85));
} else if(tier===2){
u.dmg += 4; u.ammo += Math.ceil($buildings.WEAPONS[wep].ammo * 0.5); u.reload += 2;
$buildings.WEAPONS[wep].cd = Math.max(2, Math.floor($buildings.WEAPONS[wep].cd * 0.75));
$buildings.WEAPONS[wep].spd = Math.min(30, $buildings.WEAPONS[wep].spd + 3);
} else if(tier===3){
u.dmg += 8; u.ammo += Math.ceil($buildings.WEAPONS[wep].ammo * 0.75); u.reload += 3;
$buildings.WEAPONS[wep].cd = Math.max(2, Math.floor($buildings.WEAPONS[wep].cd * 0.60));
$buildings.WEAPONS[wep].spd = Math.min(35, $buildings.WEAPONS[wep].spd + 6);
if(!window._legendaryWeps) window._legendaryWeps = new Set();
window._legendaryWeps.add(wep);
killFlash('rgba(255,255,255,0.7)', 400);
shake(18);
setTimeout(()=>{ killFlash('rgba(200,180,255,0.4)', 300); }, 450);
}
$buildings.wepAmmo[wep] = $buildings.WEAPONS[wep].ammo + u.ammo;
}
function _applyArmorTier(tier){
if(tier===1){
$buildings.player.maxHp += 20; $buildings.player.hp += 20;
} else if(tier===2){
$buildings.player.maxHp += 30; $buildings.player.hp += 30;
} else if(tier===3){
$buildings.player.maxHp += 50; $buildings.player.hp += 50;
$psycho2.playerUpgrades.shieldOnWave = true;
$buildings.player.shield = Math.max($buildings.player.shield||0, 300);
killFlash('rgba(255,255,255,0.7)', 400);
shake(18);
setTimeout(()=>{ killFlash('rgba(150,220,255,0.4)', 300); }, 450);
}
$legendary.updateHP();
}
});