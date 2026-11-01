window.__engine.files.push(function* legendary() {
const $bosses = window.__engine.bosses;
const $enemies = window.__engine.enemies;
let _hitmarkUntil = 0;
const _ectx = {d:0,dx:0,dy:0,ldx:0,ldy:0,eSpd:0,minDist:0,night:false,atEngage:false,keepStrafing:false};   /* reused per-enemy context handed to js/engine/enemies/<type>.js hooks */
const $buildings = window.__engine.buildings;
const $core = window.__engine.core;
const $legendary = window.__engine.legendary;
const $mutators = window.__engine.mutators;
const $profiler = window.__engine.profiler;
const $props = window.__engine.props;
const $psycho1 = window.__engine.psycho1;
const $psycho2 = window.__engine.psycho2;
const $replay = window.__engine.replay;
const $weather = window.__engine.weather;
const { _decayAllEnemyRecoil, _drawEnemyMuzzleFlashes, _registerNewEnemyBullets, _updateEnemyMuzzleFlashes, canSpawnBoss, ptcl, ptclBurst, ptclQ, shake, switchWep } = $bosses;
const { _compactEnemies, _getAliveEnemies, _gridQuery, _gst, _markEnemiesDirty, _rebuildSpatialGrid, applyChaosReroll, buildGroundCache, buildMutatorConfig, el, moveBossToward, showPickupMsg, unstuckBoss } = $buildings;
const { cachedLinearGradient, cachedRadialGradient } = $core;
const { _tickGodMode, activateGodMode, dcOnBossKill, dcOnDamageTaken, dcOnHealthPickup, dcOnRapidState, dcOnWaveOrScore, nextWave, onBossDefeated } = $mutators;
const { _navRebuildIfNeeded, buildingOverlap, damageBuilding, findBuildingAt, navMoveEnemy, onBuilding } = $psycho1;
const { _mutPillRebuild, deactivatePsychoMode, drawDrone, drawHarmTug, drawSpiderTank, floatText, floatTextPop, gainXP, grenadeExplode, hitJuice, killEnemy, killFlash, rocketExplode, showUpgradePanel, spawnAlly, updateAllies, updateDrone, updateGrenadeHUD, updateHarmTug, updateSpiderTank, vibrate } = $psycho2;
Object.assign($legendary, { _attachBulletPool, _frostColor, _isoDX, _isoDY, _isoFlat, _phantomSlashCheck, _removeBullet, _serializeUpgrades, applyAerialBossContact, buildBuildingSnowCache, clearCheckpoint, draw, loadCheckpoint, saveCheckpoint, spawnAlienShip, spawnArmoredCar, spawnFighterJet, updateCoopHUD, updateGame, updateHP, updateHUD, updateWepUpgradeHUD });
yield;



// ───────── SPECIAL SUPPLY-DROP WEAPONS (airdrop-only; all loops capped, safe on low-end) ─────────
let _spChaosDepth=0;
function _spHas(id){ const pu=$psycho2.playerUpgrades; return !!(pu&&pu.taken&&pu.taken.has(id)); }
function _spHit(e,dmg){
  if(!e.alive) return;
  e.hp-=dmg;
  if(e.hp<=0) killEnemy(e);
  else if(e.boss&&$replay.bBarF) $replay.bBarF.style.width=(e.hp/e.maxHp*100)+'%';
}
const _GD_R=46, _GD_HIT=13;
let _vampFlash=-99;
function _drawAuras(){
  const pu=$psycho2.playerUpgrades; if(!pu||!pu.taken) return;
  const p=$buildings.player; if(!p) return;
  const c=$core.ctx, t=$buildings.tick, hi=!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow;
  if(pu.taken.has('sp_vampire')){
    const fl=Math.max(0,1-(t-_vampFlash)/18), pl=0.5+0.5*Math.sin(t*0.1);
    c.save(); c.translate(p.x,p.y-24); c.scale(1,0.45);
    c.strokeStyle='rgba(255,40,70,'+(0.55+pl*0.2+fl*0.25)+')'; c.lineWidth=3+fl*3;
    if(hi){ c.shadowColor='#ff2244'; c.shadowBlur=12; }
    c.beginPath(); c.arc(0,0,20+fl*6,0,Math.PI*2); c.stroke();
    c.restore();
  }
}
const _gdAngle=(t,k)=>t*0.075+k*Math.PI*2/3;
function _tickGuardianBullets(){
  const pu=$psycho2.playerUpgrades; if(!pu||!pu.taken||!pu.taken.has('sp_guardian')) return;
  if($buildings.state!=='playing'||$buildings.isPaused) return;
  const p=$buildings.player, bl=$buildings.bullets; if(!p||!bl||!bl.length) return;
  const t=$buildings.tick, low=$core.isUltraLow||$core.isVeryLow;
  for(let k=0;k<3;k++){
    const a=_gdAngle(t,k), ox=p.x+Math.cos(a)*_GD_R, oy=p.y+Math.sin(a)*_GD_R, r=_GD_HIT+8;
    for(let i=bl.length-1;i>=0;i--){
      const b=bl[i]; if(b.own!=='enemy') continue;
      const dx=b.x-ox, dy=b.y-oy; if(dx*dx+dy*dy>r*r) continue;
      _removeBullet(i);
      if(!low) ptclBurst(ox,oy,'#ff88ff',2,4,10,2);
    }
  }
}
function _drawGuardians(){
  const pu=$psycho2.playerUpgrades; if(!pu||!pu.taken||!pu.taken.has('sp_guardian')) return;
  const p=$buildings.player; if(!p) return;
  const c=$core.ctx, t=$buildings.tick, hi=!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow;
  const pulse=0.5+0.5*Math.sin(t*0.12);
  c.save();
  c.globalAlpha=0.28+pulse*0.12; c.strokeStyle='#ff44ff'; c.lineWidth=1.5; c.setLineDash([4,6]);
  c.beginPath(); c.arc(p.x,p.y,_GD_R,0,Math.PI*2); c.stroke(); c.setLineDash([]);
  for(let k=0;k<3;k++){
    const a=_gdAngle(t,k), ox=p.x+Math.cos(a)*_GD_R, oy=p.y+Math.sin(a)*_GD_R;
    // trail
    for(let j=1;j<=4;j++){ const ta=a-j*0.13; c.globalAlpha=0.30-j*0.06; c.fillStyle='#ff44ff'; c.beginPath(); c.arc(p.x+Math.cos(ta)*_GD_R,p.y+Math.sin(ta)*_GD_R,_GD_HIT*0.55-j*0.7,0,Math.PI*2); c.fill(); }
    c.globalAlpha=1;
    if(hi){ c.shadowColor='#ff44ff'; c.shadowBlur=14; }
    c.fillStyle='#2a0a33'; c.beginPath(); c.arc(ox,oy,_GD_HIT*0.8,0,Math.PI*2); c.fill();
    c.strokeStyle='#ff66ff'; c.lineWidth=2; c.stroke();
    c.shadowBlur=0;
    c.fillStyle='rgba(255,220,255,'+(0.75+pulse*0.25)+')'; c.beginPath(); c.arc(ox,oy,_GD_HIT*0.38,0,Math.PI*2); c.fill();
  }
  c.restore();
}
$buildings._drawGuardians=function(){ _drawGuardians(); _drawAuras(); try{ _drawPerks(); }catch(_e){ if(!window._pkDW){ window._pkDW=1; console.warn('[perk] draw', _e); } } };
function _tickSpecials(){
  _tickGuardianBullets();
  const pu=$psycho2.playerUpgrades; if(!pu||!pu.taken||!pu.taken.size) return;
  if($buildings.state!=='playing'||$buildings.isPaused) return;
  const t=$buildings.tick, p=$buildings.player; if(!p) return;
  const en=$buildings.enemies; if(!en||!en.length) return;
  const low=$core.isUltraLow||$core.isVeryLow, W=$replay.W, H=$replay.H, wave=$buildings.wave||1;
  if(pu.taken.has('sp_shock') && t%150===0){
    const R2=210*210; let hit=0;
    for(let i=0;i<en.length&&hit<40;i++){
      const e=en[i]; if(!e.alive) continue;
      const dx=e.x-p.x, dy=e.y-p.y, d2=dx*dx+dy*dy; if(d2>R2) continue;
      hit++;
      if(!e.boss){ const d=Math.sqrt(d2)||1; e.x+=dx/d*45; e.y+=dy/d*45; }
      _spHit(e,10+wave);
    }
    if(hit){ shake(8); ptclBurst(p.x,p.y,'#00ffcc',low?5:16,7,20,3); floatTextPop(p.x,p.y-50,'◉ SHOCKWAVE','#00ffcc',14); }
  }
  if(pu.taken.has('sp_guardian')){
    const R=_GD_R, hr=_GD_HIT, dmg=8+wave;
    for(let k=0;k<3;k++){
      const a=_gdAngle(t,k), ox=p.x+Math.cos(a)*R, oy=p.y+Math.sin(a)*R;
      for(let i=0;i<en.length;i++){
        const e=en[i]; if(!e.alive) continue;
        const dx=e.x-ox, dy=e.y-oy, rr=hr+(e.boss?22:10);
        if(dx*dx+dy*dy>rr*rr) continue;
        if(t-(e._gdT||-99)<18) continue;
        e._gdT=t; _spHit(e,dmg);
        if(!e.boss){ const d=Math.sqrt(dx*dx+dy*dy)||1; e.x+=dx/d*16; e.y+=dy/d*16; }
        if(!low) ptclBurst(ox,oy,'#ff44ff',3,5,14,2);
      }
    }
  }
  if(pu.taken.has('sp_orbital') && t%420===0){
    let hit=0;
    for(let i=0;i<en.length;i++){
      const e=en[i]; if(!e.alive||e.x<-20||e.x>W+20||e.y<-20||e.y>H+20) continue;
      hit++;
      if(hit<=10&&!low) ptclBurst(e.x,e.y,'#ffffff',3,6,16,3);
      _spHit(e, e.boss?Math.max(8,Math.ceil(e.maxHp*0.05)):40+wave*2);
    }
    if(hit){ shake(18); killFlash('rgba(255,255,255,0.45)',120); floatTextPop(p.x,p.y-70,'ORBITAL LANCE','#ffffff',20); try{ navigator.vibrate&&navigator.vibrate([80,40,160]); }catch(e){} }
  }
}
window.__spOnKill=function(e){
  try{ _pkOnKill(e); }catch(_e){ console.warn('[perk] kill hook', _e); }
  if(_spHas('sp_vampire')){ const p=$buildings.player; if(p&&p.hp>0&&p.hp<p.maxHp){ if(Math.random()<0.3){ p.hp=Math.min(p.maxHp,p.hp+1); } _vampFlash=$buildings.tick; try{ updateHP(); }catch(_e){} } }
  if(_spChaosDepth>=2||Math.random()>0.35||!_spHas('sp_chaos')) return;
  _spChaosDepth++;
  try{
    const en=$buildings.enemies, R2=110*110, dmg=12+($buildings.wave||1); let hit=0;
    for(let i=0;i<en.length&&hit<8;i++){
      const o=en[i]; if(!o.alive||o===e) continue;
      const dx=o.x-e.x, dy=o.y-e.y; if(dx*dx+dy*dy>R2) continue;
      hit++; _spHit(o,dmg);
    }
    ptclBurst(e.x,e.y,'#ff5500',($core.isUltraLow||$core.isVeryLow)?3:9,6,18,3); shake(3);
  } finally { _spChaosDepth--; }
};

/* ═══ v102: PERK ARSENAL — effects for the repeatable perks defined in 07-psycho2.js (PERKS) ═══
   Design rule: lots of juicy damage/utility, never invulnerability. Heals and shields are small, rare and capped. */
function _pk(id){ const pu=$psycho2.playerUpgrades; return (pu&&pu.perk&&pu.perk[id])||0; }
let _pkGen=-1, _pkMines=[], _pkFire=[], _pkBeams=[], _pkBolts=[], _pkRings=[];
let _pkKills=0, _pkSalvoUntil=-1, _pkMomUntil=-1, _pkLastX=0, _pkLastY=0, _pkDepth=0;
window.__perkSpeed=1; window.__perkXp=1;
function _pkReset(){
  _pkMines=[]; _pkFire=[]; _pkBeams=[]; _pkBolts=[]; _pkRings=[];
  _pkKills=0; _pkSalvoUntil=-1; _pkMomUntil=-1; _pkDepth=0;
  window.__perkSpeed=1; window.__perkXp=1;
}
function _pkLow(){ return $core.isUltraLow||$core.isVeryLow; }
function _pkRing(x,y,max,col){ if(_pkRings.length<24) _pkRings.push({x,y,max,t:0,life:20,col}); }
function _pkAoE(x,y,R,dmg,cap,skip){
  const en=$buildings.enemies; if(!en) return 0;
  const R2=R*R; let hit=0;
  for(let i=0;i<en.length&&hit<cap;i++){
    const o=en[i]; if(!o.alive||o===skip) continue;
    const dx=o.x-x, dy=o.y-y; if(dx*dx+dy*dy>R2) continue;
    hit++; _spHit(o,dmg);
  }
  return hit;
}
function _pkNearest(x,y,R){
  const en=$buildings.enemies; if(!en) return null;
  let best=null, bd=R*R;
  for(let i=0;i<en.length;i++){ const o=en[i]; if(!o.alive) continue; const dx=o.x-x, dy=o.y-y, d=dx*dx+dy*dy; if(d<bd){ bd=d; best=o; } }
  return best;
}
function _pkRound(v){ const f=Math.floor(v); return f+(Math.random()<(v-f)?1:0); }
function _pkMaxAmmo(w){
  const W=$buildings.WEAPONS[w], u=$buildings.wepUpgrades[w];
  return W ? W.ammo+((u&&u.ammo)||0) : 0;
}

/* Called when a perk is picked. s = new stack count. */
window.__perkApply=function(id,s,def){
  const B=$buildings, p=B.player;
  if(def && def.wep){
    const u=B.wepUpgrades[def.wep]; if(u) u.dmg+=def.dmg||1;
    if($psycho2.wepUpgradeCount) $psycho2.wepUpgradeCount[def.wep]=($psycho2.wepUpgradeCount[def.wep]||0)+1;
    return;
  }
  switch(id){
    case 'mag_size': {
      const CAP={rpg:10,minigun:150};
      Object.keys(B.WEAPONS).forEach(w=>{
        const W=B.WEAPONS[w], u=B.wepUpgrades[w]; if(!W||!u) return;
        const inc=Math.max(1,Math.ceil(W.ammo*0.15)), cap=(CAP[w]||999);
        u.ammo=Math.min((u.ammo||0)+inc, Math.max(u.ammo||0, cap-W.ammo));
        B.wepAmmo[w]=Math.min(W.ammo+u.ammo, Math.max(B.wepAmmo[w]||0, cap));
      });
      try{ $legendary.updateHUD(); }catch(_e){}
      break; }
    case 'quick_hands': Object.keys(B.wepUpgrades).forEach(k=>{ B.wepUpgrades[k].reload=(B.wepUpgrades[k].reload||0)+0.5; }); break;
    case 'hair_trigger': Object.keys(B.WEAPONS).forEach(w=>{ const W=B.WEAPONS[w]; if(W&&typeof W.cd==='number') W.cd=Math.max(2,Math.floor(W.cd*0.9)); }); break;
    case 'velocity': Object.keys(B.WEAPONS).forEach(w=>{ const W=B.WEAPONS[w]; if(!W) return; if(typeof W.spd==='number') W.spd=Math.min(W.spd*1.08,28); if(typeof W.range==='number'&&w!=='flamethrower') W.range=Math.min(W.range*1.08,W.range+80); }); break;
    case 'nade_pack': B.grenadeCount=Math.min(9,(B.grenadeCount||0)+3); try{ updateGrenadeHUD(); }catch(_e){} break;
    case 'glass_cannon': if(p){ p.maxHp=Math.max(30,p.maxHp-15); p.hp=Math.min(p.hp,p.maxHp); try{ updateHP(); }catch(_e){} } break;
    case 'ally_squad': try{ spawnAlly(); }catch(_e){} break;
    case 'blood_rush': case 'sprint_boots': case 'quick_study': break;
  }
};

/* Outgoing player-bullet damage modifier (crits, execute, boss damage, streak…). Probabilistic rounding keeps small numbers meaningful. */
window.__perkHit=function(b,e,dmg){
  if(!$psycho2.playerUpgrades||!$psycho2.playerUpgrades.perk) return dmg;
  const B=$buildings, t=B.tick, p=B.player; let m=1, crit=false, echo=false;
  const cc=_pk('crit_chance');
  if(cc && Math.random()<cc*0.08){ crit=true; m*=2+0.5*_pk('crit_dmg'); }
  const ex=_pk('execute'); if(ex && e.maxHp && e.hp<=e.maxHp*0.25) m*=1+0.6*ex;
  const bb=_pk('boss_buster'); if(bb && e.boss) m*=1+0.15*bb;
  const op=_pk('opener'); if(op && e.maxHp && e.hp>=e.maxHp) m*=1+0.5*op;
  const os=_pk('opening_salvo'); if(os && t<_pkSalvoUntil) m*=1+0.2+0.2*os;
  const ms=_pk('momentum_strike'); if(ms) m*=1+Math.min(0.2,(B.killStreak||0)*0.008)*ms;
  const ls=_pk('last_stand'); if(ls && p && p.hp<=p.maxHp*0.3) m*=1+0.35*ls;
  if(_pk('glass_cannon')) m*=1.35;
  m=Math.min(m,2.0); /* BALANCE v106: cap combined perk multiplier (crit+execute+... stack) */
  let out=_pkRound(dmg*m);
  const ec=_pk('echo_shot'); if(ec && Math.random()<0.08*ec){ out+=Math.max(1,Math.ceil(dmg*0.5)); echo=true; }
  const sp=_pk('stopping'); if(sp && !e.boss){ e.kbx=(e.kbx||0)+b.vx*0.07*sp; e.kby=(e.kby||0)+b.vy*0.07*sp; }
  if((crit||echo) && e._pkTxtT!==t && (b.wt!=='flame'||Math.random()<0.2)){
    e._pkTxtT=t;
    try{ floatTextPop(e.x,e.y-26,crit?'CRIT!':'ECHO',crit?'#ffdd33':'#88ddff',crit?18:14); }catch(_e){}
  }
  return out;
};

/* Kill-driven rewards (called from __spOnKill). */
function _pkOnKill(e){
  const pk=$psycho2.playerUpgrades&&$psycho2.playerUpgrades.perk; if(!pk) return;
  const B=$buildings, p=B.player; if(!p||p.hp<=0) return;
  const t=B.tick; _pkKills++;
  let s;
  if((s=pk.scavenger) && Math.random()<0.12*s){
    const w=B.curWep, mx=_pkMaxAmmo(w);
    if(B.wepAmmo[w]!==undefined && B.wepAmmo[w]<mx){ B.wepAmmo[w]++; }
  }
  if((s=pk.second_wind) && _pkKills%(34-4*s)===0 && p.hp<p.maxHp){
    p.hp=Math.min(p.maxHp,p.hp+4); try{ updateHP(); floatText(p.x,p.y-34,'+4 HP','#ff6688',13); }catch(_e){}
  }
  if((s=pk.nade_finder) && _pkKills%(24-4*s)===0 && B.grenadeCount<9){
    B.grenadeCount++; try{ updateGrenadeHUD(); floatText(p.x,p.y-34,'+1 GRENADE','#88cc44',13); }catch(_e){}
  }
  if((s=pk.bounty)) gainXP(2*s);
  if((s=pk.blood_rush)) _pkMomUntil=t+100;
  if((s=pk.adrenal_reload) && _pkKills%(18-4*s)===0){
    const w=B.curWep, mx=_pkMaxAmmo(w);
    if(B.wepAmmo[w]!==undefined && B.wepAmmo[w]<mx){ B.wepAmmo[w]=mx; B.reloading=false; B.reloadTimer=0; try{ $legendary.updateHUD(); floatText(p.x,p.y-34,'RELOADED','#66ffcc',13); }catch(_e){} }
  }
  if((s=pk.kinetic_barrier) && _pkKills%(44-8*s)===0){
    p.shield=Math.max(p.shield||0,90+30*s); try{ floatText(p.x,p.y-34,'BARRIER','#33ccff',13); }catch(_e){}
  }
  if((s=pk.death_bloom) && _pkDepth<2 && Math.random()<0.10*s){
    _pkDepth++;
    try{ const wv=B.wave||1; _pkAoE(e.x,e.y,80,4+Math.ceil(wv*0.6),8,e); _pkRing(e.x,e.y,80,'#ff55aa'); if(!_pkLow()) ptclBurst(e.x,e.y,'#ff55aa',8,6,16,3); }
    finally{ _pkDepth--; }
  }
}

function _tickPerks(){
  if(_pkGen!==window._diyRunGen){ _pkGen=window._diyRunGen; _pkReset(); }
  const pk=$psycho2.playerUpgrades&&$psycho2.playerUpgrades.perk;
  if(!pk){ window.__perkSpeed=1; window.__perkXp=1; return; }
  const B=$buildings; if(B.state!=='playing'||B.isPaused) return;
  const p=B.player; if(!p) return;
  const t=B.tick, wave=B.wave||1, low=_pkLow(), en=B.enemies||[];
  window.__perkSpeed=Math.min(1.5,1+0.06*(pk.sprint_boots||0)+(t<_pkMomUntil?0.08*(pk.blood_rush||0):0));
  window.__perkXp=1+0.15*(pk.quick_study||0);
  let s;
  // pickups drift toward the player
  if((s=pk.magnetism) && B.powerups && B.powerups.length){
    const R=110+55*s, R2=R*R;
    for(let i=0;i<B.powerups.length;i++){
      const o=B.powerups[i], dx=p.x-o.x, dy=p.y-o.y, d2=dx*dx+dy*dy;
      if(d2>R2||d2<36) continue; const d=Math.sqrt(d2);
      const st=Math.min(d,2.5+(1-d/R)*4); o.x+=dx/d*st; o.y+=dy/d*st;
    }
  }
  if(!en.length&&!_pkMines.length) { _pkAge(); return; }
  if((s=pk.static_field) && t%(270-50*s)===0){
    const hit=_pkAoE(p.x,p.y,130+15*s,4+Math.ceil(wave*0.8)+s*2,30);
    _pkRing(p.x,p.y,130+15*s,'#44ddff');
    if(hit&&!low) ptclBurst(p.x,p.y,'#44ddff',8,6,16,2);
  }
  if((s=pk.laser_drones)){
    for(let k=0;k<s;k++){
      if((t+k*13)%40!==0) continue;
      const a=t*0.045+k*Math.PI*2/s, dx=p.x+Math.cos(a)*58, dy=p.y-20+Math.sin(a)*30;
      const tg=_pkNearest(dx,dy,320); if(!tg) continue;
      _pkBeams.length<30 && _pkBeams.push({x1:dx,y1:dy,x2:tg.x,y2:tg.y,t:0,life:7});
      _spHit(tg,2+Math.floor(wave*0.35));
      if(!low) ptclBurst(tg.x,tg.y,'#44ffdd',2,4,10,2);
    }
  }
  if((s=pk.storm_caller) && t%(300-30*s)===0){
    const W=$replay.W, H=$replay.H, pool=[];
    for(let i=0;i<en.length;i++){ const o=en[i]; if(o.alive&&o.x>0&&o.x<W&&o.y>0&&o.y<H) pool.push(o); }
    for(let k=0;k<1+s&&pool.length;k++){
      const idx=(Math.random()*pool.length)|0, tg=pool.splice(idx,1)[0];
      const bx=tg.x, by=tg.y;
      _pkBolts.length<14 && _pkBolts.push({x:bx,y:by,t:0,life:10,seed:Math.random()*1000});
      _spHit(tg,14+Math.ceil(wave*1.5));
      _pkAoE(bx,by,50,6+Math.ceil(wave*0.6),6,tg);
      if(!low) ptclBurst(bx,by,'#ffff55',6,6,14,3);
    }
    shake(6);
  }
  if((s=pk.minefield)){
    if(t%(150-20*s)===0 && _pkMines.length<4+2*s) _pkMines.push({x:p.x,y:p.y+6,t:0,life:900});
    for(let i=_pkMines.length-1;i>=0;i--){
      const m=_pkMines[i]; m.t++;
      if(m.t>m.life){ _pkMines.splice(i,1); continue; }
      if(m.t<30) continue;
      let trig=false;
      for(let j=0;j<en.length;j++){ const o=en[j]; if(!o.alive) continue; const dx=o.x-m.x, dy=o.y-m.y; if(dx*dx+dy*dy<34*34){ trig=true; break; } }
      if(trig){
        _pkAoE(m.x,m.y,95,12+Math.ceil(wave*1.2),12);
        _pkRing(m.x,m.y,95,'#ff9944'); shake(5);
        if(!low) ptclBurst(m.x,m.y,'#ff8833',10,7,18,3);
        _pkMines.splice(i,1);
      }
    }
  }
  if((s=pk.scorched_earth)){
    const mv=Math.hypot(p.x-_pkLastX,p.y-_pkLastY);
    if(t%8===0){
      if(mv>6 && _pkFire.length<(low?16:36)) _pkFire.push({x:p.x,y:p.y+8,t:0,life:150+30*s,r:20+4*s});
      _pkLastX=p.x; _pkLastY=p.y;
    }
    for(let i=_pkFire.length-1;i>=0;i--){
      const f=_pkFire[i]; f.t++;
      if(f.t>f.life){ _pkFire.splice(i,1); continue; }
      if(f.t%15===0){
        const R2=f.r*f.r, d=1+Math.ceil(wave*0.3);
        for(let j=0;j<en.length;j++){ const o=en[j]; if(!o.alive) continue; const dx=o.x-f.x, dy=o.y-f.y; if(dx*dx+dy*dy<=R2) _spHit(o,d); }
      }
    }
  }
  if((s=pk.cryo_pulse) && t%(520-70*s)===0){
    const R=190+20*s, R2=R*R; let hit=0;
    for(let i=0;i<en.length;i++){ const o=en[i]; if(!o.alive) continue; const dx=o.x-p.x, dy=o.y-p.y; if(dx*dx+dy*dy>R2) continue; o._slowTicks=(o._slowTicks||0)+100+20*s; hit++; }
    _pkRing(p.x,p.y,R,'#88eeff');
    if(hit&&!low) ptclBurst(p.x,p.y,'#88eeff',10,6,18,2);
  }
  if((s=pk.bullet_time) && t%(1500-200*s)===0 && t>0){
    const W=$replay.W, H=$replay.H;
    for(let i=0;i<en.length;i++){ const o=en[i]; if(o.alive&&o.x>-40&&o.x<W+40&&o.y>-40&&o.y<H+40) o._slowTicks=(o._slowTicks||0)+120+30*s; }
    _pkRing(p.x,p.y,Math.max(W,H)*0.6,'#bb99ff'); shake(5);
    try{ killFlash('rgba(150,110,255,0.25)',120); floatTextPop(p.x,p.y-60,'BULLET TIME','#bb99ff',18); }catch(_e){}
  }
  if((s=pk.ally_tough) && t%30===0 && B.allies){
    for(let i=0;i<B.allies.length;i++){
      const a=B.allies[i]; if(!a.alive) continue;
      if(a._pkBase===undefined) a._pkBase=a.maxHp;
      if(a._pkS!==s){ const nm=Math.round(a._pkBase*(1+0.4*s)); a.hp+=nm-a.maxHp; a.maxHp=nm; a._pkS=s; }
    }
  }
  _pkAge();
}
function _pkAge(){
  for(let i=_pkRings.length-1;i>=0;i--){ if(++_pkRings[i].t>_pkRings[i].life) _pkRings.splice(i,1); }
  for(let i=_pkBeams.length-1;i>=0;i--){ if(++_pkBeams[i].t>_pkBeams[i].life) _pkBeams.splice(i,1); }
  for(let i=_pkBolts.length-1;i>=0;i--){ if(++_pkBolts[i].t>_pkBolts[i].life) _pkBolts.splice(i,1); }
}
window.__perkOnWave=function(){
  try{
    const B=$buildings, p=B.player; if(!p) return;
    const wc=_pk('war_chest'); if(wc){ B.grenadeCount=Math.min(9,(B.grenadeCount||0)+wc); updateGrenadeHUD(); }
    const fr=_pk('field_rations'); if(fr&&p.hp<p.maxHp){ p.hp=Math.min(p.maxHp,p.hp+Math.ceil(p.maxHp*0.08*fr)); updateHP(); floatText(p.x,p.y-34,'RATIONS','#ff88aa',13); }
    if(_pk('opening_salvo')) _pkSalvoUntil=B.tick+300;
  }catch(_e){}
};
function _drawPerks(){
  const pk=$psycho2.playerUpgrades&&$psycho2.playerUpgrades.perk; if(!pk) return;
  const p=$buildings.player; if(!p) return;
  const c=$core.ctx, t=$buildings.tick, hi=!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow;
  c.save();
  for(const f of _pkFire){
    const k=1-f.t/f.life, fl=0.7+0.3*Math.sin((t+f.x)*0.3);
    c.globalAlpha=Math.min(0.55,k*0.7)*fl; c.fillStyle='#ff6a1a';
    c.beginPath(); c.ellipse(f.x,f.y,f.r,f.r*0.5,0,0,Math.PI*2); c.fill();
    c.globalAlpha=Math.min(0.5,k)*fl; c.fillStyle='#ffd24a';
    c.beginPath(); c.ellipse(f.x,f.y,f.r*0.45,f.r*0.22,0,0,Math.PI*2); c.fill();
  }
  for(const m of _pkMines){
    const armed=m.t>=30, blink=armed&&((t>>3)&1);
    c.globalAlpha=0.9; c.fillStyle='#2a2a2a'; c.strokeStyle='#ff9944'; c.lineWidth=1.5;
    c.beginPath(); c.ellipse(m.x,m.y,9,4.5,0,0,Math.PI*2); c.fill(); c.stroke();
    c.fillStyle=blink?'#ff3322':'#662211'; c.beginPath(); c.arc(m.x,m.y-2,2.2,0,Math.PI*2); c.fill();
  }
  for(const r of _pkRings){
    const k=r.t/r.life; c.globalAlpha=(1-k)*0.8; c.strokeStyle=r.col; c.lineWidth=3*(1-k)+1;
    if(hi){ c.shadowColor=r.col; c.shadowBlur=10; }
    c.beginPath(); c.ellipse(r.x,r.y,r.max*k,r.max*k*0.6,0,0,Math.PI*2); c.stroke(); c.shadowBlur=0;
  }
  const nd=pk.laser_drones||0;
  for(let k=0;k<nd;k++){
    const a=t*0.045+k*Math.PI*2/nd, dx=p.x+Math.cos(a)*58, dy=p.y-20+Math.sin(a)*30;
    c.globalAlpha=1; if(hi){ c.shadowColor='#44ffdd'; c.shadowBlur=10; }
    c.fillStyle='#0b2a2a'; c.strokeStyle='#44ffdd'; c.lineWidth=1.8;
    c.beginPath(); c.moveTo(dx,dy-6); c.lineTo(dx+6,dy); c.lineTo(dx,dy+6); c.lineTo(dx-6,dy); c.closePath(); c.fill(); c.stroke();
    c.shadowBlur=0; c.fillStyle='#bffff0'; c.beginPath(); c.arc(dx,dy,1.8,0,Math.PI*2); c.fill();
  }
  for(const b of _pkBeams){
    c.globalAlpha=1-b.t/b.life; c.strokeStyle='#66fff0'; c.lineWidth=2;
    c.beginPath(); c.moveTo(b.x1,b.y1); c.lineTo(b.x2,b.y2); c.stroke();
  }
  for(const b of _pkBolts){
    const k=1-b.t/b.life; c.globalAlpha=k; c.strokeStyle='#ffffaa'; c.lineWidth=3;
    if(hi){ c.shadowColor='#ffff55'; c.shadowBlur=14; }
    c.beginPath(); let x=b.x, y=-10; c.moveTo(x,y);
    const n=7;
    for(let i=1;i<=n;i++){ const jx=i===n?0:(Math.sin(b.seed+i*7.3)*14); c.lineTo(b.x+jx,-10+(b.y+10)*i/n); }
    c.stroke(); c.shadowBlur=0;
    c.globalAlpha=k*0.6; c.fillStyle='#ffffcc'; c.beginPath(); c.ellipse(b.x,b.y,22*k+6,10*k+3,0,0,Math.PI*2); c.fill();
  }
  c.restore();
}

function _triggerLegendaryEffect(wep){
if(!window._legendaryWeps || !window._legendaryWeps.has(wep)) return;
if(wep==='rifle' && $psycho2.wepEvolution.rifle===3){
const bx=$buildings.mouse.x, by=$buildings.mouse.y;
ptclBurst(bx,by,'#e8f4ff',$core.isMobile?30:60,12,30,5);
ptclBurst(bx,by,'#ffffff',$core.isMobile?15:30,6,25,3);
$buildings.debrisArr.push({x:bx,y:by,r:120,life:35,maxLife:35});
shake(14);
const targets=_getAliveEnemies();
for(const e of targets){
const d=Math.hypot(e.x-bx,e.y-by);
if(d<120){ const dmg=Math.ceil(30*(1-d/120)); e.hp-=dmg; floatText(e.x,e.y-20,'-'+dmg,'#e8f4ff',14); if(e.hp<=0) killEnemy(e); else if(e.boss) $replay.bBarF.style.width=(e.hp/e.maxHp*100)+'%'; }
}
killFlash('rgba(200,230,255,0.5)',200); audioManager.explosion();
floatTextPop($buildings.mouse.x,$buildings.mouse.y-60,'▸ ORBITAL LASER','#ffffff',16);
}
if(wep==='flamethrower' && $psycho2.wepEvolution.flamethrower===3){
const r=200;
ptclBurst($buildings.player.x,$buildings.player.y,'#ffaa00',$core.isMobile?40:80,14,35,6);
ptclBurst($buildings.player.x,$buildings.player.y,'#ff6600',$core.isMobile?20:40,8,28,4);
$buildings.debrisArr.push({x:$buildings.player.x,y:$buildings.player.y,r:r+40,life:40,maxLife:40});
shake(16);
const targets=_getAliveEnemies();
for(const e of targets){
const d=Math.hypot(e.x-$buildings.player.x,e.y-$buildings.player.y);
if(d<r){ const dmg=Math.ceil(25*(1-d/r)); e.hp-=dmg; floatText(e.x,e.y-20,'-'+dmg,'#ffaa00',14); if(e.hp<=0) killEnemy(e); else if(e.boss) $replay.bBarF.style.width=(e.hp/e.maxHp*100)+'%'; }
}
killFlash('rgba(255,150,0,0.45)',250); audioManager.explosion();
floatTextPop($buildings.player.x,$buildings.player.y-60,'SOLAR FLARE','#ffaa00',16);
}
}

function _phantomSlashCheck(){
if(!window._legendaryWeps || !window._legendaryWeps.has('knife')) return;
if($psycho2.wepEvolution.knife!==3) return;
const targets=_getAliveEnemies();
if(!targets.length) return;
targets.sort((a,b)=>Math.hypot(a.x-$buildings.player.x,a.y-$buildings.player.y)-Math.hypot(b.x-$buildings.player.x,b.y-$buildings.player.y));
const nearest=targets[0];
const dist=Math.hypot(nearest.x-$buildings.player.x,nearest.y-$buildings.player.y);
if(dist>240) return;
$buildings.player.x=nearest.x; $buildings.player.y=nearest.y;
const r=90;
ptclBurst($buildings.player.x,$buildings.player.y,'#c8d8ff',$core.isMobile?20:40,10,22,4);
shake(10);
for(const e of targets){
const d=Math.hypot(e.x-$buildings.player.x,e.y-$buildings.player.y);
if(d<r){ const dmg=Math.ceil(20*(1-d/r)); e.hp-=dmg; floatText(e.x,e.y-20,'-'+dmg,'#c8d8ff',14); if(e.hp<=0){killEnemy(e);} else if(e.boss) $replay.bBarF.style.width=(e.hp/e.maxHp*100)+'%'; }
}
floatTextPop($buildings.player.x,$buildings.player.y-50,'◎ PHANTOM SLASH','#c8d8ff',15);
}

function updateWepUpgradeHUD(){
const u=$buildings.wepUpgrades[$buildings.curWep]||{dmg:0,ammo:0,reload:0};
const parts=[];
if(u.dmg>0) parts.push('DMG +'+u.dmg);
if(u.ammo>0) parts.push('MAG +'+u.ammo);
if(u.reload>0)parts.push('SPD +'+Math.round(u.reload*20)+'%');
const tier = $psycho2.wepEvolution[$buildings.curWep]||0;
if(tier===1) parts.unshift('EVOLVED');
if(tier===2) parts.unshift('ASCENDED');
if(tier===3) parts.unshift('LEGENDARY');
el('wep-upgrades').textContent = parts.length ? parts.join(' · ') : '';
let mutEl = el('mut-hud');
if(!mutEl){
mutEl = document.createElement('div');
mutEl.id = 'mut-hud';
mutEl.style.cssText = 'font-size:7px;letter-spacing:1px;color:#44aaaa;margin-top:3px;line-height:1.6;pointer-events:none;';
const wepHud = el('weapon-hud');
if(wepHud) wepHud.appendChild(mutEl);
}
const activeMuts = [...$psycho2.playerUpgrades.mutations];
const MUT_SHORT = {
mut_pierce:'PIERCE', mut_explosive:'FRAG', mut_chain:'CHAIN',
mut_poison:'TOXIN', mut_ricochet:'RICOCHET', mut_magnet:'HOMING',
mut_lifesteal:'LEECH', mut_multishot:'BURST'
};
mutEl.textContent = activeMuts.length
? ':: '+activeMuts.map(m=>MUT_SHORT[m]||m).join(' · ')
: '';
}
function _coopTarget(sx, sy){
if(!$replay.coopEnabled || !$replay.player2 || $replay.p2Down){
return { x: $buildings.player.x, y: $buildings.player.y };
}
const d1 = Math.hypot($buildings.player.x - sx, $buildings.player.y - sy);
const d2 = Math.hypot($replay.player2.x - sx, $replay.player2.y - sy);
return d1 <= d2 ? { x: $buildings.player.x, y: $buildings.player.y } : { x: $replay.player2.x, y: $replay.player2.y };
}
const WEAPON_SPARK_COUNT={rifle:7,shotgun:4,smg:3,knife:2,minigun:2,rpg:0,flamethrower:2,laser:5,plasmacutter:4};
function _emitSpark(x,y,col,ang,spd,life,sz){
const p=$bosses._acquireParticle();
p.x=x;p.y=y;p.vx=Math.cos(ang)*spd;p.vy=Math.sin(ang)*spd;
p.life=life;p.col=col;p.sz=sz;p._alive=true;
$buildings.particles.push(p);
}
function hitSparks(b){
if($core.isUltraLow)return;
const wk=(b.own==='player')?$buildings.curWep:(b.wt==='laser'?'laser':'rifle');
let n=WEAPON_SPARK_COUNT[b.wt==='laser'?'laser':wk];
if(n===undefined)n=6;
if($core.isMobile)n=Math.max(1,Math.round(n*0.7));
if(n<=0)return;
const ric=Math.atan2(-b.vy,-b.vx),spread=0.55,base=(b.wt==='shotgun'||wk==='shotgun')?5:3.5;
const wcol=b.col||'#ffcc00';
for(let i=0;i<n;i++){
const a=ric+(Math.random()-0.5)*spread*2;
_emitSpark(b.x,b.y,Math.random()<0.35?'#ffffff':wcol,a,base*(0.6+Math.random()*0.8),6+Math.random()*6,1.4+Math.random()*1.6);
}
}
function bossRayLen(x,y,a,maxD,pad){
const cx=Math.cos(a),cy=Math.sin(a);
for(let r=10;r<=maxD;r+=10){ if(onBuilding(x+cx*r,y+cy*r,pad)) return r-10; }
return maxD;
}
function bossLineClear(x0,y0,x1,y1,pad){
const d=Math.hypot(x1-x0,y1-y0); if(d<1) return true;
return bossRayLen(x0,y0,Math.atan2(y1-y0,x1-x0),Math.min(d,600),pad)>=Math.min(d,600)-10;
}
function bossPickDetour(e,tx,ty,pad){
const base=Math.atan2(ty-e.y,tx-e.x);
let best=null,bs=-Infinity;
for(let k=0;k<16;k++){
const a=k*Math.PI/8;
const clear=bossRayLen(e.x,e.y,a,260,pad);
let sc=clear/260+0.5*Math.max(0,Math.cos(a-base));
if(e._detDx!==undefined&&(Math.cos(a)*e._detDx+Math.sin(a)*e._detDy)>0.7) sc+=0.2;
if(clear<40) sc-=1;
if(sc>bs){bs=sc;best=a;}
}
e._detDx=Math.cos(best);e._detDy=Math.sin(best);
e._detourT=60+((Math.random()*30)|0);
}
const _SYN_COLS={
pierce_explosive:['#ff9d2e','#ffe066','#00e5ff'],magnet_chain:['#00ffd5','#fff44f','#ff4fd8'],poison_lifesteal:['#7dff4d','#ff3d7f','#d24dff'],
multishot_explosive:['#ffe94d','#ff7a2e','#ff2e63'],pierce_chain:['#6df0ff','#fff44f','#ffffff'],ricochet_explosive:['#ff4dff','#ff9d2e','#ffe066'],
poison_chain:['#9dff3d','#ffee33','#33ffcc'],multishot_lifesteal:['#ff5c8a','#ffd0e0','#ffe94d'],
pierce_poison:['#00ffa8','#b84dff','#d6ff4d'],magnet_explosive:['#ff6a3d','#ffd23d','#ff3da6'],ricochet_chain:['#ff4dff','#fff44f','#4dd2ff'],
ricochet_poison:['#7dff4d','#ff4dff','#4dffd5'],chain_explosive:['#fff44f','#ff8c1a','#ff4d4d'],magnet_pierce:['#4df0ff','#ffffff','#b84dff'],
lifesteal_explosive:['#ff3d7f','#ff9d2e','#ffd0e0'],multishot_magnet:['#ff4d4d','#ffe94d','#4dd2ff','#7dff4d'],
pierce_ricochet:['#ff4d4d','#ffe94d','#4dff88','#4dd2ff','#b84dff'],pierce_lifesteal:['#ff5c8a','#ffffff','#b8f0ff'],pierce_multishot:['#ffd23d','#4df0ff','#ffffff'],
explosive_poison:['#b8ff3d','#ff8c1a','#ffe94d'],chain_lifesteal:['#ff3d7f','#ff9dbf','#fff44f'],chain_multishot:['#4dd2ff','#fff44f','#ffffff'],
poison_magnet:['#6dff9d','#b84dff','#4dffe6'],poison_multishot:['#9dff3d','#ffe94d','#ff4dff'],ricochet_magnet:['#4dffe6','#ff4dff','#ffffff'],
ricochet_lifesteal:['#ff3d7f','#ff4dff','#ffd0e0'],ricochet_multishot:['#ff4d4d','#ffe94d','#4dff88','#4dd2ff'],magnet_lifesteal:['#ff3d5a','#4df0ff','#ffd0e0']
};
const _SYN_DEFS=[['pierce_explosive','mut_pierce','mut_explosive'],['magnet_chain','mut_magnet','mut_chain'],['poison_lifesteal','mut_poison','mut_lifesteal'],['multishot_explosive','mut_multishot','mut_explosive'],['pierce_chain','mut_pierce','mut_chain'],['ricochet_explosive','mut_ricochet','mut_explosive'],['poison_chain','mut_poison','mut_chain'],['multishot_lifesteal','mut_multishot','mut_lifesteal'],['pierce_poison','mut_pierce','mut_poison'],['magnet_explosive','mut_magnet','mut_explosive'],['ricochet_chain','mut_ricochet','mut_chain'],['ricochet_poison','mut_ricochet','mut_poison'],['chain_explosive','mut_chain','mut_explosive'],['magnet_pierce','mut_magnet','mut_pierce'],['lifesteal_explosive','mut_lifesteal','mut_explosive'],['multishot_magnet','mut_multishot','mut_magnet'],['pierce_ricochet','mut_pierce','mut_ricochet'],['pierce_lifesteal','mut_pierce','mut_lifesteal'],['pierce_multishot','mut_pierce','mut_multishot'],['explosive_poison','mut_explosive','mut_poison'],['chain_lifesteal','mut_chain','mut_lifesteal'],['chain_multishot','mut_chain','mut_multishot'],['poison_magnet','mut_poison','mut_magnet'],['poison_multishot','mut_poison','mut_multishot'],['ricochet_magnet','mut_ricochet','mut_magnet'],['ricochet_lifesteal','mut_ricochet','mut_lifesteal'],['ricochet_multishot','mut_ricochet','mut_multishot'],['magnet_lifesteal','mut_magnet','mut_lifesteal']];
let _synTrailTick=-1,_synTrailCols=null;
function _synTrail(){
if(__fxLv()<2)return null;
const B=$buildings;
if(_synTrailTick===B.tick)return _synTrailCols;
_synTrailTick=B.tick;_synTrailCols=null;
const m=$psycho2.playerUpgrades.mutations;
if(!m||m.size<2)return null;
for(let i=0;i<_SYN_DEFS.length;i++){const d=_SYN_DEFS[i];if(m.has(d[1])&&m.has(d[2])){(_synTrailCols=_synTrailCols||[]).push(..._SYN_COLS[d[0]]);}}
return _synTrailCols;
}
function _synLv(){const B=$buildings;if(B._synLvT===B.tick)return B._synLvV;B._synLvT=B.tick;return(B._synLvV=__fxLv());}
let _synBT=-1,_synBN=0;
function _synFxOk(){const l=_synLv();if(l>=2)return true;const t=$buildings.tick;if(_synBT!==t){_synBT=t;_synBN=l===0?1:2;}return _synBN-->0;}
function _synThr(key,gap){const l=_synLv();if(l>=2)return true;const B=$buildings;B._synT2=B._synT2||{};if(B.tick-(B._synT2[key]||-99)<gap*(l===0?4:2))return false;B._synT2[key]=B.tick;return true;}
function _synAdd(o){const A=($buildings._synFX=$buildings._synFX||[]);const _l=_synLv(),_cap=_l===0?2:_l===1?4:($core.isMobile?20:40);while(A.length>=_cap)A.shift();A.push(o);}
function _synOk(key,gap){const B=$buildings;B._synT=B._synT||{};const _l=_synLv();if(B.tick-(B._synT[key]||-99)<gap*(_l===0?6:_l===1?3:1))return false;B._synT[key]=B.tick;return true;}
function _synRing(x,y,r,cols){if(!_synFxOk())return;const _lf=_synLv()<2?10:16;_synAdd({k:'ring',x,y,r,cols,life:_lf,max:_lf});}
function _synPetals(x,y,r,cols){const _l=_synLv();if(_l===0||!_synFxOk())return;const _lf=_l===1?14:22;_synAdd({k:'petals',x,y,r,cols,n:_l===1?2:$core.isMobile?6:9,rot:Math.random()*6.283,life:_lf,max:_lf});}
function _synBurst(x,y,r,cols){const _l=_synLv();if(_l===0||!_synFxOk())return;const _lf=_l===1?10:16;_synAdd({k:'burst',x,y,r,cols,n:_l===1?4:$core.isMobile?8:14,rot:Math.random()*6.283,life:_lf,max:_lf});}
function _synBolt(x1,y1,x2,y2,cols){
const _l=_synLv();if(!_synFxOk())return;
if(_l===0){_synAdd({k:'bolt',pts:[[x1,y1],[x2,y2]],cols,life:7,max:7});return;}
const n=_l<2?2:6,pts=[[x1,y1]],dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
for(let i=1;i<n;i++){const t=i/n,j=(Math.random()-0.5)*18;pts.push([x1+dx*t+nx*j,y1+dy*t+ny*j]);}
pts.push([x2,y2]);const _lf=_l<2?8:11;_synAdd({k:'bolt',pts,cols,life:_lf,max:_lf});
}
function _synCloud(x,y,cols,life,r){const A=($buildings._synClouds=$buildings._synClouds||[]);const _l=_synLv(),_cc=_l<2?1:5;while(A.length>=_cc)A.shift();life=life||180;if(_l<2)life=Math.min(life,_l===0?60:80);A.push({x,y,r:r||48,life,max:life,cols,ph:Math.random()*6.283});}
function _synNearest(x,y,range,skip,pierced){
let best=null,bd=range;const E=$buildings.enemies;
for(let i=0;i<E.length;i++){const q=E[i];if(!q.alive||q===skip||(pierced&&pierced.has(q)))continue;const d=Math.hypot(q.x-x,q.y-y);if(d<bd){bd=d;best=q;}}
return best;
}
function _synOnBounce(b){
if(b.own!=='player')return;
const m=$psycho2.playerUpgrades.mutations;
if(m.has('mut_ricochet')&&m.has('mut_chain')){
const t=_synNearest(b.x,b.y,260,null,null);
if(t){const c=_SYN_COLS.ricochet_chain;t.hp-=Math.ceil((b.dmg||1)*0.8);t.hitFlash=8;_synBolt(b.x,b.y,t.x,t.y,c);_synBurst(t.x,t.y,22,c);if(t.hp<=0)killEnemy(t);}
else{_synBurst(b.x,b.y,18,_SYN_COLS.ricochet_chain);}
}
if(m.has('mut_ricochet')&&m.has('mut_poison')){_synCloud(b.x,b.y,_SYN_COLS.ricochet_poison);_synPetals(b.x,b.y,28,_SYN_COLS.ricochet_poison);}
if(m.has('mut_ricochet')&&m.has('mut_pierce')){if(b._pierced)b._pierced.clear();_synRing(b.x,b.y,34,_SYN_COLS.pierce_ricochet);_synBurst(b.x,b.y,30,_SYN_COLS.pierce_ricochet);}
if(m.has('mut_ricochet')&&m.has('mut_magnet')){
const t=_synNearest(b.x,b.y,420,null,null);
if(t){const sp=Math.hypot(b.vx,b.vy)||10,a=Math.atan2(t.y-b.y,t.x-b.x);b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp;b.life=(b.life||60)+45;b.homing=true;}
_synRing(b.x,b.y,30,_SYN_COLS.ricochet_magnet);_synPetals(b.x,b.y,22,_SYN_COLS.ricochet_magnet);
}
if(m.has('mut_ricochet')&&m.has('mut_lifesteal')){
const B=$buildings;B.player.hp=Math.min(B.player.maxHp,B.player.hp+0.1);updateHP();
floatText(B.player.x,B.player.y-30,'+0.6','#ff4dff',12);_synPetals(b.x,b.y,24,_SYN_COLS.ricochet_lifesteal);
}
if(m.has('mut_ricochet')&&m.has('mut_multishot')&&$buildings.bullets.length<(_synLv()===0?60:_synLv()<2?100:260)){
const c=_SYN_COLS.ricochet_multishot,sp=Math.hypot(b.vx,b.vy)||10,a0=Math.atan2(b.vy,b.vx);
for(let k=-1;k<=1;k+=2){const a=a0+k*0.4;$buildings.bullets.push({x:b.x,y:b.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,own:'player',life:45,wt:'bullet',col:c[(k+1)&3],dmg:Math.ceil((b.dmg||1)*0.5),sz:(b.sz||3)*1.2,_chained:true});}
_synPetals(b.x,b.y,32,c);
}
}
function _synOnBurst(b,m){
const B=$buildings;
if(m.has('mut_magnet'))_synPetals(b.x,b.y,30,_SYN_COLS.multishot_magnet);
if(m.has('mut_pierce'))_synBurst(b.x,b.y,34,_SYN_COLS.pierce_multishot);
if(m.has('mut_chain')){
const c=_SYN_COLS.chain_multishot,E=B.enemies,used=new Set();
for(let n=0,_nmax=_synLv()<2?2:3;n<_nmax;n++){let best=null,bd=220;for(let i=0;i<E.length;i++){const q=E[i];if(!q.alive||used.has(q))continue;const d=Math.hypot(q.x-b.x,q.y-b.y);if(d<bd){bd=d;best=q;}}
if(!best)break;used.add(best);best.hp-=Math.ceil((b.dmg||1)*0.5);best.hitFlash=7;_synBolt(b.x,b.y,best.x,best.y,c);_synBurst(best.x,best.y,18,c);if(best.hp<=0)killEnemy(best);}
}
if(m.has('mut_poison')){
const c=_SYN_COLS.poison_multishot,E=B.enemies;
for(let i=0;i<E.length;i++){const q=E[i];if(q.alive&&Math.hypot(q.x-b.x,q.y-b.y)<75){if(!q.poisoned){q.poisoned=3;q.poisonTimer=0;}}}
_synCloud(b.x,b.y,c,110,40);_synPetals(b.x,b.y,34,c);
}
}
function _synOnHit(b,e,m){
const B=$buildings;
if(m.has('mut_pierce')&&m.has('mut_poison')&&b.pierce){
e.poisoned=Math.max(e.poisoned||0,5);if(!e.poisonTimer)e.poisonTimer=0;
if(_synOk('vl',2))_synPetals(e.x,e.y,26,_SYN_COLS.pierce_poison);
}
if(m.has('mut_magnet')&&m.has('mut_explosive')&&b.homing){
const R=_synLv()<2?50:66,c=_SYN_COLS.magnet_explosive;
const E=B.enemies;if(_synThr('me',1))for(let i=0;i<E.length;i++){const q=E[i];if(!q.alive||q===e||q.boss)continue;const d=Math.hypot(q.x-b.x,q.y-b.y);if(d<R){q.hp-=Math.ceil(3*(1-d/R));q.hitFlash=5;if(q.hp<=0)killEnemy(q);}}
if(_synOk('hs',3)){_synBurst(b.x,b.y,44,c);_synRing(b.x,b.y,58,c);shake(2);}
}
if(m.has('mut_chain')&&m.has('mut_explosive')&&!b._chained&&_synThr('ce',1)){
const t=_synNearest(e.x,e.y,140,e,null);
if(t){const c=_SYN_COLS.chain_explosive,R=44;
const E=B.enemies;for(let i=0;i<E.length;i++){const q=E[i];if(!q.alive||q===e||q.boss)continue;const d=Math.hypot(q.x-t.x,q.y-t.y);if(d<R){q.hp-=Math.ceil(2*(1-d/R))+(q===t?1:0);q.hitFlash=6;if(q.hp<=0&&q!==t)killEnemy(q);}}
if(_synOk('tf',3)){_synBolt(e.x,e.y,t.x,t.y,c);_synBurst(t.x,t.y,36,c);_synRing(t.x,t.y,40,c);}
}
}
if(m.has('mut_magnet')&&m.has('mut_pierce')&&b.pierce&&_synThr('mp',1)){
const t=_synNearest(b.x,b.y,300,e,b._pierced);
if(t){const sp=Math.hypot(b.vx,b.vy)||10,a=Math.atan2(t.y-b.y,t.x-b.x);b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp;
if(_synOk('gl',2)){_synRing(b.x,b.y,24,_SYN_COLS.magnet_pierce);_synPetals(b.x,b.y,18,_SYN_COLS.magnet_pierce);}}
}
if(m.has('mut_lifesteal')&&m.has('mut_explosive')){
let n=0;if(_synLv()<2)n=1;else{const E=B.enemies;for(let i=0;i<E.length;i++){const q=E[i];if(q.alive&&q!==e&&Math.hypot(q.x-b.x,q.y-b.y)<40)n++;}}
const heal=Math.min(0.4,0.05*(1+n));
B.player.hp=Math.min(B.player.maxHp,B.player.hp+heal);
if(_synOk('bb',3)){_synPetals(e.x,e.y,28,_SYN_COLS.lifesteal_explosive);updateHP();if(heal>=0.9)floatText(B.player.x,B.player.y-30,'+'+heal.toFixed(1),'#ff5c8a',12);}
}
if(m.has('mut_pierce')&&m.has('mut_lifesteal')&&b.pierce&&b._pierced&&b._pierced.size>=1){
B.player.hp=Math.min(B.player.maxHp,B.player.hp+0.05);
if(_synOk('ss',3)){_synPetals(e.x,e.y,24,_SYN_COLS.pierce_lifesteal);updateHP();}
}
if(m.has('mut_explosive')&&m.has('mut_poison')){
const R=46,c=_SYN_COLS.explosive_poison,E=B.enemies;
if(_synThr('ep',1))for(let i=0;i<E.length;i++){const q=E[i];if(!q.alive||q.boss)continue;if(Math.hypot(q.x-b.x,q.y-b.y)<R){if(!q.poisoned){q.poisoned=3;q.poisonTimer=0;}}}
if(_synOk('cf',3)){_synBurst(b.x,b.y,38,c);_synRing(b.x,b.y,44,c);}
}
if(m.has('mut_chain')&&m.has('mut_lifesteal')&&!b._chained){
const t=_synNearest(e.x,e.y,140,e,null);
if(t){B.player.hp=Math.min(B.player.maxHp,B.player.hp+0.08);
if(_synOk('la',3)){_synBolt(t.x,t.y,B.player.x,B.player.y,_SYN_COLS.chain_lifesteal);_synPetals(B.player.x,B.player.y,22,_SYN_COLS.chain_lifesteal);updateHP();}}
}
if(m.has('mut_poison')&&m.has('mut_magnet')&&e.poisoned&&b.homing&&_synThr('pm',1)){
const c=_SYN_COLS.poison_magnet;let n=0;const E=B.enemies;
for(let i=0;i<E.length&&n<2;i++){const q=E[i];if(!q.alive||q===e||q.poisoned)continue;if(Math.hypot(q.x-e.x,q.y-e.y)<230){q.poisoned=3;q.poisonTimer=0;n++;if(_synOk('ps'+n,2)){_synBolt(e.x,e.y,q.x,q.y,c);_synPetals(q.x,q.y,20,c);}}}
}
if(m.has('mut_magnet')&&m.has('mut_lifesteal')&&b.homing&&!e.boss&&e.hp>0&&e.hp<=4){
e.hp-=2;e.hitFlash=9;
if(_synOk('hl',3)){_synRing(e.x,e.y,30,_SYN_COLS.magnet_lifesteal);_synBurst(e.x,e.y,26,_SYN_COLS.magnet_lifesteal);}
}
}
function updateHelicopter(){
if(!$psycho2.helicopter||!$psycho2.helicopter.alive)return;
const h=$psycho2.helicopter;
h.rotorSpin=(h.rotorSpin+0.3)%(Math.PI*2);
h.phase=(h.phase+0.02)%(Math.PI*2);
h.strafeCooldown=Math.max(0,h.strafeCooldown-1);
h.dropCooldown=Math.max(0,h.dropCooldown-1);
h.smokeTrail.push({x:h.x,y:h.y,life:30,sz:8+Math.random()*6});
{let _st=h.smokeTrail,_sw=0;for(let _si=0;_si<_st.length;_si++){_st[_si].life--;if(_st[_si].life>0)_st[_sw++]=_st[_si];}h.smokeTrail.length=_sw;}
const _W=$replay.W,_H=$replay.H,_P=$buildings.player;
const _frac=h.hp/h.maxHp, stage=_frac>0.66?1:_frac>0.33?2:3;
const sm=stage===3?1.3:stage===2?1.12:1;
if(h.stage!==stage){
if(h.stage){
shake(10);audioManager.explosion();
floatText(h.x,h.y-56,stage===2?'▲ VULTURE: AGGRESSIVE':'▲ VULTURE: ENRAGED',stage===2?'#ff8800':'#ff2200',17);
ptclBurst(h.x,h.y,stage===2?'#ff8800':'#ff2200',22,6,20,3);
h.mode='hover';h.modeT=0;h.fireCd=30;
}
h.stage=stage;
}
const setMode=(m)=>{h.lastAtk=(h.mode!=='hover'&&h.mode!=='enter')?h.mode:h.lastAtk;h.mode=m;h.modeT=0;h.tele=null;h._fired=0;};
const steer=(tx,ty,sp)=>{
const ddx=tx-h.x,ddy=ty-h.y,dd=Math.hypot(ddx,ddy)||1;
const want=Math.min(sp,dd*0.06+0.3);
h.vx+=(ddx/dd*want-h.vx)*0.07;h.vy+=(ddy/dd*want-h.vy)*0.07;
};
const faceTo=(a,k)=>{let da=a-h.angle;while(da>Math.PI)da-=Math.PI*2;while(da<-Math.PI)da+=Math.PI*2;h.angle+=da*k;};
const leadAim=(spd)=>{
const t=_coopTarget(h.x,h.y);
const isP=(t.x===_P.x&&t.y===_P.y);
const vx=isP?(_P.vx||0):0,vy=isP?(_P.vy||0):0;
const d=Math.hypot(t.x-h.x,t.y-h.y);
const f=Math.min(40,d/spd);
return Math.atan2(t.y+vy*f*0.8-h.y,t.x+vx*f*0.8-h.x);
};
const fireBullet=(ang,spd,dmg,col,sz)=>{
$buildings.bullets.push({x:h.x+Math.cos(ang)*30,y:h.y+Math.sin(ang)*30,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,own:'enemy',life:400,dmg,col,sz});
};
const pickPatrol=()=>{
let nx,tries=0;
do{nx=_W*0.12+Math.random()*_W*0.76;tries++;}while(Math.abs(nx-h.x)<_W*0.18&&tries<6);
h.tx=nx;h.ty=_H*0.1+Math.random()*_H*0.22;
};
const pickAttack=()=>{
let pool=['chase','minigun','rockets'];
if(stage>=2)pool.push('strafe','bombrun','rockets');
if(stage>=3)pool.push('nova','strafe','minigun');
pool=pool.filter(m=>m!==h.lastAtk);
const m=pool[(Math.random()*pool.length)|0];
setMode(m);
const label={chase:'▲ HUNTING',minigun:'▲ MINIGUN SPIN-UP',rockets:'! ROCKET LOCK',strafe:'▲ STRAFING RUN',bombrun:'▲ BOMBING RUN',nova:'! SUPPRESSION BURST'}[m];
floatText(h.x,h.y-48,label,'#ff6600',13);
if(m==='strafe'||m==='bombrun'){
h.side=h.x<_W/2?1:-1;
h.laneY=m==='strafe'?Math.max(_H*0.16,Math.min(_H*0.5,_P.y-110)):_H*(0.14+Math.random()*0.1);
}
};
h.modeT++;
h.fireCd=Math.max(0,h.fireCd-1);
h.tele=null;
let wide=false;
switch(h.mode){
case 'enter':{
steer(_W/2,_H*0.2,3.4);
faceTo(Math.atan2(_P.y-h.y,_P.x-h.x),0.05);
if(Math.hypot(_W/2-h.x,_H*0.2-h.y)<30||h.modeT>180){pickPatrol();setMode('hover');}
break;}
case 'hover':{
if(Math.hypot(h.tx-h.x,h.ty-h.y)<30||h.modeT%130===0)pickPatrol();
steer(h.tx,h.ty,2.2*sm);
h.y+=Math.sin(h.phase*3)*0.4;
faceTo(Math.atan2(_P.y-h.y,_P.x-h.x),0.08);
if(h.fireCd<=0&&h.modeT>20){
h.fireCd=Math.round(h.si/sm);
const a=leadAim(9);
for(let i=-1;i<=1;i++)fireBullet(a+i*0.25,9,2,'#ff2200',3);
audioManager.fire('smg');
h._recoilOffX=-Math.cos(a)*2;h._recoilOffY=-Math.sin(a)*2;
}
if(h.modeT>Math.round(170/sm))pickAttack();
break;}
case 'chase':{
const ty=Math.max(_H*0.12,Math.min(_H*0.34,_P.y-260));
steer(_P.x+Math.sin(h.phase*2)*140,ty,3.4*sm);
faceTo(Math.atan2(_P.y-h.y,_P.x-h.x),0.1);
if(h.fireCd<=0){
h.fireCd=Math.round(22/sm);
const a=leadAim(10);
fireBullet(a-0.08,10,2,'#ff5500',3);fireBullet(a+0.08,10,2,'#ff5500',3);
audioManager.fire('smg');
}
if(h.modeT>Math.round(200/sm)){setMode('hover');h.fireCd=25;}
break;}
case 'minigun':{
const shots=stage===1?16:stage===2?22:30;
const wind=Math.round(44/sm);
h.vx*=0.9;h.vy*=0.9;
if(h.modeT<=wind){
faceTo(leadAim(11),0.12);
h.lockA=leadAim(11);
h.tele={kind:'aim',t:h.modeT,max:wind,ang:h.angle};
}else{
faceTo(h.lockA,0.2);
const k=h.modeT-wind;
if(k%3===0&&h._fired<shots){
const a=h.lockA+(h._fired-shots/2)*0.014+(Math.random()-0.5)*0.03;
fireBullet(a,11,1.5,'#ffaa00',3);
h._fired++;
audioManager.fire('smg');
h._recoilOffX=-Math.cos(a)*2.5;h._recoilOffY=-Math.sin(a)*2.5;
}
if(h._fired>=shots&&k>shots*3+30){setMode('hover');h.fireCd=40;pickPatrol();}
}
break;}
case 'rockets':{
const n=stage===1?3:stage===2?4:6;
const wind=Math.round(55/sm);
h.vx*=0.9;h.vy*=0.9;
faceTo(Math.atan2(_P.y-h.y,_P.x-h.x),0.1);
if(h.modeT<=wind){
h.tele={kind:'aim',t:h.modeT,max:wind,ang:Math.atan2(_P.y-h.y,_P.x-h.x),lock:true};
}else{
const k=h.modeT-wind;
if(k%9===1&&h._fired<n){
const a=Math.atan2(_P.y-h.y,_P.x-h.x)+(h._fired-(n-1)/2)*0.16;
const off=(h._fired%2?1:-1)*20;
$buildings.bullets.push({x:h.x+Math.cos(a+Math.PI/2)*off,y:h.y+Math.sin(a+Math.PI/2)*off,vx:Math.cos(a)*4.5,vy:Math.sin(a)*4.5,own:'enemy',life:260,dmg:3,col:'#ff7700',sz:5,wt:'heli_rocket',hd:22});
h._fired++;
audioManager.fire('rpg');shake(3);
}
if(h._fired>=n&&k>n*9+45){setMode('hover');h.fireCd=40;pickPatrol();}
}
break;}
case 'strafe':{
wide=true;
const startX=h.side>0?_W*0.04:_W*0.96;
if(!h._dash){
steer(startX,h.laneY,5*sm);
h.tele={kind:'lane',y:h.laneY,t:h.modeT};
faceTo(h.side>0?0:Math.PI,0.1);
if((Math.hypot(startX-h.x,h.laneY-h.y)<24&&h.modeT>40)||h.modeT>110){h._dash=true;h.dashT=0;floatText(h.x,h.y-40,'▼ INCOMING','#ff3300',15);}
}else{
h.dashT++;
h.vx+=(h.side*6.2*sm-h.vx)*0.1;
h.vy+=(h.laneY-h.y)*0.05-h.vy*0.3;
faceTo(h.side>0?0:Math.PI,0.2);
h.tele={kind:'lane',y:h.laneY,t:h.modeT};
if(h.dashT%5===0){
const a=Math.atan2(_P.y-h.y,_P.x-h.x)+(Math.random()-0.5)*0.35;
fireBullet(a,9,2,'#ff3300',3);
if(stage>=2)fireBullet(a+0.35*(Math.random()<0.5?-1:1),9,2,'#ff3300',3);
audioManager.fire('smg');
}
if((h.side>0&&h.x>_W*1.05)||(h.side<0&&h.x<-_W*0.05)||h.dashT>260){h._dash=false;h.vx*=0.3;setMode('hover');h.fireCd=50;pickPatrol();h.x=Math.max(44,Math.min(_W-44,h.x));}
}
break;}
case 'bombrun':{
wide=true;
const startX=h.side>0?_W*0.04:_W*0.96;
if(!h._dash){
steer(startX,h.laneY,5*sm);
faceTo(h.side>0?0:Math.PI,0.1);
h.tele={kind:'lane',y:h.laneY,t:h.modeT,bomb:true};
if((Math.hypot(startX-h.x,h.laneY-h.y)<24&&h.modeT>30)||h.modeT>110){h._dash=true;h.dashT=0;floatText(h.x,h.y-40,'▼ BOMBS AWAY','#ffaa00',15);}
}else{
h.dashT++;
h.vx+=(h.side*4.2*sm-h.vx)*0.1;
h.vy+=(h.laneY-h.y)*0.05-h.vy*0.3;
faceTo(h.side>0?0:Math.PI,0.2);
if(h.dashT%Math.round(13/sm)===0&&h.x>20&&h.x<_W-20){
const bx=h.x+h.side*70,by=_P.y+(Math.random()-0.5)*140;
$buildings.grenades.push({x:h.x,y:h.y,tx:Math.max(20,Math.min(_W-20,bx)),ty:Math.max(20,Math.min(_H-20,by)),speed:6,spin:0,fuse:40,life:1,fromHeli:true});
audioManager.fire('grenade_throw');
}
if((h.side>0&&h.x>_W*1.05)||(h.side<0&&h.x<-_W*0.05)||h.dashT>320){h._dash=false;h.vx*=0.3;setMode('hover');h.fireCd=50;pickPatrol();h.x=Math.max(44,Math.min(_W-44,h.x));}
}
break;}
case 'nova':{
h.vx*=0.9;h.vy*=0.9;
const wind=Math.round(45/sm);
if(h.modeT<=wind){h.tele={kind:'ring',t:h.modeT,max:wind};}
else{
const k=h.modeT-wind;
if((k===1||k===28)&&h._fired<2){
const cnt=18,off=h._fired*(Math.PI/cnt);
for(let i=0;i<cnt;i++)fireBullet(off+i*Math.PI*2/cnt,5,2,'#ff2200',3);
h._fired++;
shake(6);audioManager.explosion();
ptclBurst(h.x,h.y,'#ff4400',18,5,18,2);
}
if(k>70){setMode('hover');h.fireCd=30;pickPatrol();}
}
break;}
default:setMode('hover');
}
if(stage>=2&&(h.mode==='hover'||h.mode==='chase')){
let n=0;
for(let i=0;i<$buildings.bullets.length&&n<3;i++){
const b=$buildings.bullets[i];
if(b.own!=='player'&&b.own!=='ally')continue;
const ddx=h.x-b.x,ddy=h.y-b.y;
if(ddx*ddx+ddy*ddy>110*110)continue;
const sp=Math.hypot(b.vx,b.vy)||1;
if((ddx*b.vx+ddy*b.vy)<=0)continue;
const sg=(ddx*(-b.vy)+ddy*b.vx)>=0?1:-1;
h.vx+=(-b.vy/sp)*sg*0.22*(stage-1);h.vy+=(b.vx/sp)*sg*0.22*(stage-1);
n++;
}
}
for(let i=0;i<$buildings.bullets.length;i++){
const b=$buildings.bullets[i];
if(b.wt!=='heli_rocket')continue;
ptclQ(b.x,b.y,'#ff8800',1,2);
if(b.hd>0){b.hd--;continue;}
const cur=Math.atan2(b.vy,b.vx);
let da=Math.atan2(_P.y-b.y,_P.x-b.x)-cur;
while(da>Math.PI)da-=Math.PI*2;while(da<-Math.PI)da+=Math.PI*2;
da=Math.max(-0.03,Math.min(0.03,da));
const sp=Math.min(Math.hypot(b.vx,b.vy)+0.03,5.8);
b.vx=Math.cos(cur+da)*sp;b.vy=Math.sin(cur+da)*sp;
}
const vmax=7*sm;const vm=Math.hypot(h.vx,h.vy);
if(vm>vmax){h.vx*=vmax/vm;h.vy*=vmax/vm;}
h.x+=h.vx;h.y+=h.vy;
if(h.mode==='enter'){h.x=Math.max(44,Math.min(_W-44,h.x));h.y=Math.min(_H*0.4,h.y);}
else if(wide){h.x=Math.max(-_W*0.15,Math.min(_W*1.15,h.x));h.y=Math.max(20,Math.min(_H*0.55,h.y));}
else{h.x=Math.max(44,Math.min(_W-44,h.x));h.y=Math.max(20,Math.min(_H*0.4,h.y));}
h.tx=Math.max(44,Math.min(_W-44,h.tx));h.ty=Math.max(20,Math.min(_H*0.35,h.ty));
if(!wide&&h.mode!=='enter'){
const hFX=h.x+h.vx*2,hFY=h.y+h.vy*2;
const hD=Math.hypot(_P.x-hFX,_P.y-hFY),hSafe=60;
if(hD<hSafe){
const pa=Math.atan2(_P.y-hFY,_P.x-hFX),pd=Math.max(1,hSafe-hD+10);
_P.x=Math.max(20,Math.min(_W-20,_P.x+Math.cos(pa)*pd));
_P.y=Math.max(20,Math.min(_H-20,_P.y+Math.sin(pa)*pd));
}
}
$buildings.bullets.forEach(b=>{
if(!h.alive)return;
if(b.own!=='player'&&b.own!=='ally')return;
const d=Math.hypot(b.x-h.x,b.y-h.y);
if(d<36){
h.hp-=b.dmg||1;
ptcl(b.x,b.y,'#ff6600',4,2);
audioManager.hit();
b.life=0;
$replay.bBarF.style.width=(Math.max(0,h.hp)/h.maxHp*100)+'%';
if(h.hp<=0){
h.alive=false;
ptclBurst(h.x,h.y,'#ff6600',40,8,22,3);
ptclBurst(h.x,h.y,'#ffcc00',14,5,20,2);
$buildings.debrisArr.push({x:h.x,y:h.y,r:180,life:50,maxLife:50});
if($buildings.craters.filter(c=>!c._fromBuilding).length<$psycho1.MAX_OPEN_CRATERS){$psycho1._pushCrater({x:h.x,y:h.y,r:90,seed:(h.x*13+h.y*7)|0,_fromBuilding:false});}
shake(20);audioManager.explosion();
setTimeout(()=>audioManager.explosion(),380);
const pts=1000;$buildings.score+=pts;el('score-num').textContent=$buildings.score;
gainXP(150);floatText(h.x,h.y-40,'+'+pts,'#ff6600',22);
$buildings.bossAlive=false;$replay.bBarW.style.opacity='0';audioManager.stopBossMusic();
$buildings.waveKills=$buildings.waveTotal;
$psycho2.bossRegistry.unregister('helicopter');
$psycho2.helicopter=null;
dcOnBossKill();$buildings._bossTypesThisRun.push('Helicopter');onBossDefeated('helicopter');$replay.ReplayRecorder.capture('* HELICOPTER ELIMINATED','boss_helicopter');
}
}
});
applyAerialBossContact(h, 44);
}
function applyAerialBossContact(boss, radius){
const d=Math.hypot($buildings.player.x-boss.x,$buildings.player.y-boss.y);
if(d>0&&d<radius){
if($buildings.player.shield>0){$buildings.player.shield=Math.max(0,$buildings.player.shield-2);}
else{$buildings.player.hp-=0.25;updateHP();shake(3);vibrate(30);if($buildings.player.hp<=0)$props.triggerPlayerDeath('contact');}
const pushA=Math.atan2($buildings.player.y-boss.y,$buildings.player.x-boss.x);
const overlap=radius-d;
const nx=$buildings.player.x+Math.cos(pushA)*(overlap+2);
const ny=$buildings.player.y+Math.sin(pushA)*(overlap+2);
if(!onBuilding(nx,ny,8)){$buildings.player.x=nx;$buildings.player.y=ny;}
else if(!onBuilding(nx,$buildings.player.y,8)){$buildings.player.x=nx;}
else if(!onBuilding($buildings.player.x,ny,8)){$buildings.player.y=ny;}
}
}
function drawHelicopter(){
if(!$psycho2.helicopter||!$psycho2.helicopter.alive)return;
const h=$psycho2.helicopter;
const hp_pct = h.hp/h.maxHp;
const rs = h.rotorSpin;
const t = $buildings.tick*0.05;
if(!$profiler._skipTrailParticles){ for(let s of h.smokeTrail){
$core.ctx.save();$core.ctx.globalAlpha=s.life/30*0.35;$core.ctx.fillStyle='#777';
$core.ctx.beginPath();$core.ctx.arc(s.x,s.y,s.sz,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
} }
if(h.tele){
const T=h.tele,c=$core.ctx;c.save();
if(T.kind==='aim'){
const pr=T.t/T.max,pulse=0.35+0.4*pr+0.2*Math.sin($buildings.tick*0.5);
const a=T.lock?Math.atan2($buildings.player.y-h.y,$buildings.player.x-h.x):(h.lockA!==undefined?h.lockA:T.ang);
c.globalAlpha=pulse;c.strokeStyle='#ff2200';c.lineWidth=1+pr*2.5;c.setLineDash([10,8]);
c.beginPath();c.moveTo(h.x,h.y);c.lineTo(h.x+Math.cos(a)*900,h.y+Math.sin(a)*900);c.stroke();c.setLineDash([]);
c.globalAlpha=0.5+0.4*Math.sin($buildings.tick*0.8);c.beginPath();c.arc(h.x,h.y,50-pr*18,0,Math.PI*2);c.stroke();
}else if(T.kind==='lane'){
const w=$replay.W;c.globalAlpha=0.10+0.07*Math.sin($buildings.tick*0.4);c.fillStyle=T.bomb?'#ffaa00':'#ff2200';
c.fillRect(0,T.y-26,w,52);
c.globalAlpha=0.35;c.strokeStyle=T.bomb?'#ffaa00':'#ff2200';c.lineWidth=1.5;c.setLineDash([14,10]);
c.beginPath();c.moveTo(0,T.y);c.lineTo(w,T.y);c.stroke();c.setLineDash([]);
}else if(T.kind==='ring'){
const pr=T.t/T.max;c.globalAlpha=0.3+0.5*pr;c.strokeStyle='#ff3300';c.lineWidth=2+pr*3;
c.beginPath();c.arc(h.x,h.y,70-pr*40,0,Math.PI*2);c.stroke();
}
c.restore();
}
$core.ctx.save();$core.ctx.translate(h.x+(h._recoilOffX||0),h.y+(h._recoilOffY||0));
$core.ctx.rotate(h.angle + Math.PI);
$core.ctx.save();
$core.ctx.globalAlpha=0.2;$core.ctx.fillStyle='#000';
$core.ctx.beginPath();$core.ctx.ellipse(0,$replay.H*0.35-h.y,80,18,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
$core.ctx.shadowColor='#ff1a00';$core.ctx.shadowBlur=18*$core.SHADOW;
const fGrad=cachedLinearGradient('veh_fGrad',-42,0,36,0,[[0,'#2a2a2a'],[0.45,'#1e1e1e'],[1,'#131313']]);
$core.ctx.fillStyle=fGrad;
$core.ctx.beginPath();
$core.ctx.moveTo(-42, 0);
$core.ctx.bezierCurveTo(-34,-8,-16,-16, 4,-16);
$core.ctx.lineTo(22,-14);
$core.ctx.lineTo(32,-7);
$core.ctx.lineTo(36,-4);$core.ctx.lineTo(36, 4);
$core.ctx.lineTo(32, 7);
$core.ctx.lineTo(22, 14);
$core.ctx.bezierCurveTo(-16,16,-34,8,-42, 0);
$core.ctx.closePath();$core.ctx.fill();
$core.ctx.shadowBlur=0;
$core.ctx.strokeStyle='rgba(70,70,70,0.65)';$core.ctx.lineWidth=0.9;
$core.ctx.beginPath();$core.ctx.moveTo(-8,-15);$core.ctx.lineTo(-8,15);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(12,-13);$core.ctx.lineTo(12,13);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(22,-14);$core.ctx.lineTo(22,14);$core.ctx.stroke();
$core.ctx.strokeStyle='rgba(90,90,90,0.4)';$core.ctx.lineWidth=1.2;
$core.ctx.beginPath();$core.ctx.moveTo(-40,0);$core.ctx.lineTo(32,0);$core.ctx.stroke();
[[-12,-13],[-12,13],[10,-11],[10,11],[20,-12],[20,12]].forEach(([bx,by])=>{
$core.ctx.fillStyle='#3a3a3a';$core.ctx.beginPath();$core.ctx.arc(bx,by,1.5,0,Math.PI*2);$core.ctx.fill();
});
$core.ctx.shadowColor='#ff1a00';$core.ctx.shadowBlur=10*$core.SHADOW;
$core.ctx.fillStyle='#111';
$core.ctx.beginPath();
$core.ctx.moveTo(-42,0);
$core.ctx.bezierCurveTo(-36,-7,-20,-14,-4,-13);
$core.ctx.lineTo(-4,13);
$core.ctx.bezierCurveTo(-20,14,-36,7,-42,0);
$core.ctx.closePath();$core.ctx.fill();
$core.ctx.shadowBlur=0;
const glassGrad=cachedRadialGradient('veh_glassGrad',-22,-5,2,-22,0,16,[[0,'rgba(60,160,255,0.45)'],[0.6,'rgba(20,100,200,0.25)'],[1,'rgba(10,60,140,0.1)']]);
$core.ctx.fillStyle=glassGrad;
$core.ctx.strokeStyle='rgba(120,210,255,0.7)';$core.ctx.lineWidth=1.2;
$core.ctx.beginPath();
$core.ctx.moveTo(-40,0);
$core.ctx.bezierCurveTo(-34,-6,-18,-12,-5,-11);
$core.ctx.lineTo(-5,11);
$core.ctx.bezierCurveTo(-18,12,-34,6,-40,0);
$core.ctx.closePath();$core.ctx.fill();$core.ctx.stroke();
$core.ctx.strokeStyle='rgba(160,230,255,0.55)';$core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.moveTo(-40,0);$core.ctx.lineTo(-5,0);$core.ctx.stroke();
$core.ctx.fillStyle='rgba(255,80,0,0.15)';
$core.ctx.beginPath();$core.ctx.ellipse(-26,0,7,4,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.shadowColor='#ff4400';$core.ctx.shadowBlur=8*$core.SHADOW;
$core.ctx.fillStyle='#0d0d0d';
$core.ctx.beginPath();$core.ctx.ellipse(-44,0,5,3.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#2a2a2a';$core.ctx.lineWidth=1;$core.ctx.stroke();
$core.ctx.fillStyle='rgba(255,50,0,0.7)';
$core.ctx.beginPath();$core.ctx.arc(-44,0,1.8,0,Math.PI*2);$core.ctx.fill();
$core.ctx.shadowBlur=0;
$core.ctx.fillStyle='#141414';
$core.ctx.fillRect(-52,-3.5,20,2.5);
$core.ctx.fillRect(-52, 1, 20,2.5);
$core.ctx.strokeStyle='rgba(90,90,90,0.4)';$core.ctx.lineWidth=0.7;
$core.ctx.beginPath();$core.ctx.moveTo(-52,-2.2);$core.ctx.lineTo(-32,-2.2);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(-52, 2.2);$core.ctx.lineTo(-32, 2.2);$core.ctx.stroke();
$core.ctx.shadowColor='#ff1a00';$core.ctx.shadowBlur=6*$core.SHADOW;
$core.ctx.fillStyle='#1a1a1a';
$core.ctx.beginPath();
$core.ctx.moveTo(-2,-14);$core.ctx.lineTo(-12,-14);$core.ctx.lineTo(-22,-28);$core.ctx.lineTo(-4,-22);
$core.ctx.closePath();$core.ctx.fill();
$core.ctx.strokeStyle='rgba(80,80,80,0.45)';$core.ctx.lineWidth=0.8;$core.ctx.stroke();
$core.ctx.beginPath();
$core.ctx.moveTo(-2, 14);$core.ctx.lineTo(-12, 14);$core.ctx.lineTo(-22, 28);$core.ctx.lineTo(-4, 22);
$core.ctx.closePath();$core.ctx.fill();$core.ctx.stroke();
$core.ctx.shadowColor='#ff0000';$core.ctx.shadowBlur=8;
$core.ctx.fillStyle='rgba(255,30,0,0.9)';
$core.ctx.beginPath();$core.ctx.arc(-21,-28,2.2,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.arc(-21, 28,2.2,0,Math.PI*2);$core.ctx.fill();
$core.ctx.shadowBlur=0;
[[-13,-25],[-13,25]].forEach(([wx,wy])=>{
const sgn=wy<0?-1:1;
$core.ctx.strokeStyle='#252525';$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.moveTo(wx+6,wy-sgn*5);$core.ctx.lineTo(wx+6,wy-sgn*2);$core.ctx.stroke();
const podGrad=cachedLinearGradient('veh_podGrad_'+wx+'_'+wy,wx,wy,wx+22,wy,[[0,'#161616'],[1,'#202020']]);
$core.ctx.fillStyle=podGrad;
$core.ctx.fillRect(wx-2,wy-sgn*3,24,sgn*6);
$core.ctx.strokeStyle='rgba(70,70,70,0.5)';$core.ctx.lineWidth=0.7;$core.ctx.stroke();
$core.ctx.fillStyle='#080808';
for(let r=0;r<4;r++){
$core.ctx.beginPath();$core.ctx.arc(wx+r*4+2,wy-sgn*1.5,1.4,0,Math.PI*2);$core.ctx.fill();
}
$core.ctx.fillStyle='#1a1a1a';
$core.ctx.beginPath();$core.ctx.moveTo(wx-2,wy-sgn*3);$core.ctx.lineTo(wx-6,wy);$core.ctx.lineTo(wx-2,wy+sgn*3);$core.ctx.closePath();$core.ctx.fill();
});
$core.ctx.shadowBlur=0;
const tbGrad=cachedLinearGradient('veh_tbGrad',36,0,86,0,[[0,'#1e1e1e'],[1,'#111']]);
$core.ctx.fillStyle=tbGrad;
$core.ctx.beginPath();
$core.ctx.moveTo(36,-4);$core.ctx.lineTo(36,4);
$core.ctx.lineTo(86,2);$core.ctx.lineTo(86,-2);
$core.ctx.closePath();$core.ctx.fill();
$core.ctx.strokeStyle='rgba(60,60,60,0.5)';$core.ctx.lineWidth=0.7;
for(let rx=44;rx<84;rx+=8){
const w=(86-rx)/50*3.5;
$core.ctx.beginPath();$core.ctx.moveTo(rx,-w);$core.ctx.lineTo(rx,w);$core.ctx.stroke();
}
$core.ctx.fillStyle='#141414';
$core.ctx.beginPath();$core.ctx.moveTo(68,-2);$core.ctx.lineTo(86,-2);$core.ctx.lineTo(86,-12);$core.ctx.lineTo(72,-8);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.fillStyle='rgba(160,0,0,0.45)';
$core.ctx.beginPath();$core.ctx.moveTo(80,-2);$core.ctx.lineTo(86,-2);$core.ctx.lineTo(86,-12);$core.ctx.lineTo(80,-8);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.save();$core.ctx.translate(86,0);$core.ctx.rotate(rs*3.5);
for(let b=0;b<4;b++){
$core.ctx.save();$core.ctx.rotate(b*Math.PI/2);
$core.ctx.fillStyle='#2e2e2e';
$core.ctx.beginPath();$core.ctx.moveTo(0,-1.5);$core.ctx.lineTo(0,-14);$core.ctx.lineTo(2,-12);$core.ctx.lineTo(2,0);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.restore();
}
$core.ctx.fillStyle='#333';$core.ctx.beginPath();$core.ctx.arc(0,0,3,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
$core.ctx.strokeStyle='#353535';$core.ctx.lineWidth=2.5;$core.ctx.lineCap='round';
$core.ctx.beginPath();$core.ctx.moveTo(-26,-20);$core.ctx.lineTo(24,-20);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(-26, 20);$core.ctx.lineTo(24, 20);$core.ctx.stroke();
$core.ctx.strokeStyle='#2a2a2a';$core.ctx.lineWidth=2;
[[-14],[ 8]].forEach(([sx])=>{
$core.ctx.beginPath();$core.ctx.moveTo(sx,-14);$core.ctx.lineTo(sx,-20);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(sx, 14);$core.ctx.lineTo(sx, 20);$core.ctx.stroke();
});
$core.ctx.strokeStyle='#303030';$core.ctx.lineWidth=2.5;
$core.ctx.beginPath();$core.ctx.moveTo(-26,-20);$core.ctx.bezierCurveTo(-30,-20,-32,-16,-32,-10);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(-26, 20);$core.ctx.bezierCurveTo(-30, 20,-32, 16,-32, 10);$core.ctx.stroke();
$core.ctx.save();
$core.ctx.globalAlpha=0.07;
const rdGrad=cachedRadialGradient('veh_rdGrad',0,0,10,0,0,62,[[0,'#bbb'],[1,'transparent']]);
$core.ctx.fillStyle=rdGrad;
$core.ctx.beginPath();$core.ctx.arc(0,0,64,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
$core.ctx.save();$core.ctx.rotate(rs);
for(let b=0;b<4;b++){
$core.ctx.save();$core.ctx.rotate(b*Math.PI/2);
const bGrad=cachedLinearGradient('veh_bGrad',-58,0,58,0,[[0,'#1a1a1a'],[0.5,'#383838'],[1,'#1a1a1a']]);
$core.ctx.fillStyle=bGrad;
$core.ctx.beginPath();
$core.ctx.moveTo(-58,-1);
$core.ctx.bezierCurveTo(-36,-6, -10,-5, 0,-3);
$core.ctx.bezierCurveTo( 10,-5, 36,-6, 58,-1);
$core.ctx.lineTo(58, 1);
$core.ctx.bezierCurveTo( 36, 6, 10, 5, 0, 3);
$core.ctx.bezierCurveTo(-10, 5, -36, 6,-58, 1);
$core.ctx.closePath();$core.ctx.fill();
$core.ctx.strokeStyle='rgba(200,200,200,0.18)';$core.ctx.lineWidth=0.8;
$core.ctx.beginPath();$core.ctx.moveTo(-56,-1);$core.ctx.bezierCurveTo(-30,-4,30,-4,56,-1);$core.ctx.stroke();
$core.ctx.fillStyle='#bb1100';
$core.ctx.beginPath();$core.ctx.moveTo(-58,-1);$core.ctx.lineTo(-52,-1);$core.ctx.lineTo(-52,1);$core.ctx.lineTo(-58,1);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.moveTo( 58,-1);$core.ctx.lineTo( 52,-1);$core.ctx.lineTo( 52,1);$core.ctx.lineTo( 58,1);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.restore();
}
$core.ctx.restore();
const hubGrad=cachedRadialGradient('veh_hubGrad',-2,-2,1,0,0,9,[[0,'#666'],[1,'#1c1c1c']]);
$core.ctx.fillStyle=hubGrad;$core.ctx.beginPath();$core.ctx.arc(0,0,9,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#555';$core.ctx.lineWidth=1.5;$core.ctx.beginPath();$core.ctx.arc(0,0,9,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.fillStyle='#888';$core.ctx.beginPath();$core.ctx.arc(0,0,3.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#aaa';$core.ctx.beginPath();$core.ctx.arc(-1,-1,1.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.save();
const ep=0.5+0.5*Math.sin(t*5);
$core.ctx.globalAlpha=0.28*ep;
$core.ctx.fillStyle='#ff7700';
$core.ctx.beginPath();$core.ctx.ellipse(20,-14,4,3,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(20, 14,4,3,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
if(hp_pct<0.5){
ptcl(h.x+(Math.random()-0.5)*20,h.y+(Math.random()-0.5)*14,'#ff6600',1,2);
if(hp_pct<0.25){
ptcl(h.x+(Math.random()-0.5)*24,h.y+(Math.random()-0.5)*16,'#ff3300',1,3);
}
}
$core.ctx.restore();
$core.ctx.save();$core.ctx.translate(h.x+(h._recoilOffX||0),h.y+(h._recoilOffY||0));
const bw=110;
$core.ctx.shadowBlur=0;
$core.ctx.fillStyle='rgba(0,0,0,0.7)';$core.ctx.fillRect(-bw/2,-50,bw,8);
$core.ctx.fillStyle=hp_pct>0.6?'#ff2200':hp_pct>0.3?'#ff6600':'#ffbb00';
$core.ctx.fillRect(-bw/2,-50,bw*hp_pct,8);
$core.ctx.strokeStyle='rgba(60,60,60,0.5)';$core.ctx.lineWidth=1;
for(let seg=1;seg<10;seg++){
$core.ctx.beginPath();$core.ctx.moveTo(-bw/2+bw*seg/10,-50);$core.ctx.lineTo(-bw/2+bw*seg/10,-42);$core.ctx.stroke();
}
$core.ctx.strokeStyle='rgba(255,50,0,0.5)';$core.ctx.lineWidth=1.2;
$core.ctx.strokeRect(-bw/2,-50,bw,8);
$core.ctx.restore();
}
function spawnAlienShip(){
if($buildings.state!=='playing'||$buildings.isPaused||!canSpawnBoss())return;
const hp=100+$buildings.wave*15;
$psycho2.alienShip={x:$replay.W/2,y:-100,tx:$replay.W/2,ty:$replay.H*0.2,hp,maxHp:hp,spd:1.2,st:0,si:45,
alive:true,spin:0,phase:0,beamTimer:0,shieldPulse:0,strafeDir:1,strafeCooldown:0};
$buildings.bossAlive=true;$buildings._airstrikeGraceUntil=$buildings.tick+1200;$replay.bBarW.style.opacity='1';
if($buildings._firstBossSpawnTick===null) $buildings._firstBossSpawnTick=$buildings.tick;
el('boss-bar-label').textContent='WAVE '+$buildings.wave+' — THE ARCHITECT\'S EYE';
$psycho2.bossRegistry.register('alienShip', ()=>$psycho2.alienShip, ()=>!!($psycho2.alienShip&&$psycho2.alienShip.alive));
}
function updateAlienShip(){
if(!$psycho2.alienShip||!$psycho2.alienShip.alive)return;
const s=$psycho2.alienShip;
s.spin+=0.04;s.phase+=0.015;s.shieldPulse+=0.08;
s.strafeCooldown=Math.max(0,s.strafeCooldown-1);
s.beamTimer=Math.max(0,s.beamTimer-1);
const dx=s.tx-s.x,dy=s.ty-s.y,dist=Math.hypot(dx,dy);
if(dist>5){s.x+=dx/dist*s.spd;s.y+=dy/dist*s.spd;}
if(dist<30&&s.strafeCooldown<=0){
s.tx=$replay.W*0.15+Math.random()*$replay.W*0.7;
s.ty=$replay.H*0.08+Math.random()*$replay.H*0.3;
s.strafeCooldown=100;
}
if(dist<60) s.y+=Math.sin(s.phase*2)*0.5;
s.st++;
if(s.beamTimer===0&&s.st>s.si){
s.st=0;
s.beamTimer=60;
const _ast=_coopTarget(s.x,s.y);
const a=Math.atan2(_ast.y-s.y,_ast.x-s.x);
for(let i=-2;i<=2;i++){
const aa=a+i*0.12;
$buildings.bullets.push({x:s.x,y:s.y,vx:Math.cos(aa)*11,vy:Math.sin(aa)*11,own:'enemy',life:350,dmg:2,col:'#aa00ff',sz:4});
}
if(Math.random()<0.4){
const bombX=_ast.x+(Math.random()-0.5)*120;
const bombY=_ast.y+(Math.random()-0.5)*120;
$buildings.grenades.push({x:s.x,y:s.y,tx:bombX,ty:bombY,speed:7,spin:0,fuse:50,life:1,fromAlien:true});
}
audioManager.fire('rpg');
}
$buildings.bullets.forEach(b=>{
if(!s.alive)return;
if(b.own!=='player'&&b.own!=='ally')return;
const d=Math.hypot(b.x-s.x,b.y-s.y);
if(d<44){
s.hp-=b.dmg||1;ptcl(b.x,b.y,'#aa00ff',4,2);audioManager.hit();b.life=0;
$replay.bBarF.style.width=(Math.max(0,s.hp)/s.maxHp*100)+'%';
if(s.hp<=0){
s.alive=false;
ptclBurst(s.x,s.y,'#aa00ff',45,8,22,3);
ptclBurst(s.x,s.y,'#ffcc00',16,5,20,2);
$buildings.debrisArr.push({x:s.x,y:s.y,r:200,life:55,maxLife:55});
if($buildings.craters.filter(c=>!c._fromBuilding).length<$psycho1.MAX_OPEN_CRATERS){$psycho1._pushCrater({x:s.x,y:s.y,r:85,seed:(s.x*13+s.y*7)|0,_fromBuilding:false});}
shake(22);audioManager.explosion();setTimeout(()=>audioManager.explosion(),250);
const pts=1500;$buildings.score+=pts;el('score-num').textContent=$buildings.score;
gainXP(200);floatText(s.x,s.y-40,'+'+pts,'#aa00ff',24);
$buildings.bossAlive=false;$replay.bBarW.style.opacity='0';audioManager.stopBossMusic();$buildings.waveKills=$buildings.waveTotal;$psycho2.bossRegistry.unregister('alienShip');$psycho2.alienShip=null;
dcOnBossKill();$buildings._bossTypesThisRun.push('Alien Ship');onBossDefeated('alien');$replay.ReplayRecorder.capture('* ALIEN SHIP ELIMINATED','boss_alien');
}
}
});
applyAerialBossContact(s, 50);
}
function drawAlienShip(){
if(!$psycho2.alienShip||!$psycho2.alienShip.alive)return;
const s=$psycho2.alienShip;
$core.ctx.save();$core.ctx.translate(s.x,s.y);
$core.ctx.save();$core.ctx.globalAlpha=0.14;$core.ctx.fillStyle='#000';
$core.ctx.beginPath();$core.ctx.ellipse(0,$replay.H*0.2-s.y,65,20,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.save();$core.ctx.rotate(s.spin);
$core.ctx.shadowColor='#aa00ff';$core.ctx.shadowBlur=(25)*$core.SHADOW;
$core.ctx.strokeStyle='#8800cc';$core.ctx.lineWidth=6;
$core.ctx.beginPath();$core.ctx.arc(0,0,50,0,Math.PI*2);$core.ctx.stroke();
for(let i=0;i<8;i++){
const a=i/8*Math.PI*2;
const lx=Math.cos(a)*50,ly=Math.sin(a)*50;
const pulse=Math.sin(s.shieldPulse+i)*0.5+0.5;
$core.ctx.fillStyle=`rgba(${170+Math.floor(pulse*80)},0,255,${0.6+pulse*0.4})`;
$core.ctx.shadowColor='#aa00ff';$core.ctx.shadowBlur=(14)*$core.SHADOW;
$core.ctx.beginPath();$core.ctx.arc(lx,ly,4,0,Math.PI*2);$core.ctx.fill();
}
$core.ctx.restore();
$core.ctx.shadowColor='#6600aa';$core.ctx.shadowBlur=(20)*$core.SHADOW;
$core.ctx.fillStyle='#1a0033';$core.ctx.beginPath();$core.ctx.ellipse(0,0,46,14,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#2a0055';$core.ctx.beginPath();$core.ctx.ellipse(0,0,42,11,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='rgba(150,0,255,0.3)';
$core.ctx.beginPath();$core.ctx.arc(0,-8,22,Math.PI,0);$core.ctx.fill();
$core.ctx.strokeStyle='#8800cc';$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.arc(0,-8,22,Math.PI,0);$core.ctx.stroke();
$core.ctx.save();$core.ctx.globalAlpha=0.4+Math.sin(s.shieldPulse)*0.2;$core.ctx.fillStyle='#aa00ff';
$core.ctx.beginPath();$core.ctx.arc(0,-8,12,Math.PI,0);$core.ctx.fill();$core.ctx.restore();
$core.ctx.save();$core.ctx.rotate(s.spin*-1.3);
for(let i=0;i<6;i++){
const a=i/6*Math.PI*2;
$core.ctx.fillStyle=i%2===0?'#ff00aa':'#00ffff';
$core.ctx.shadowColor=i%2===0?'#ff00aa':'#00ffff';$core.ctx.shadowBlur=(8)*$core.SHADOW;
$core.ctx.beginPath();$core.ctx.arc(Math.cos(a)*28,Math.sin(a)*6,3,0,Math.PI*2);$core.ctx.fill();
}
$core.ctx.restore();
const bw=100;
$core.ctx.fillStyle='#1a001a';$core.ctx.fillRect(-bw/2,-38,bw,7);
$core.ctx.fillStyle=s.hp/s.maxHp>0.5?'#aa00ff':'#ff00aa';
$core.ctx.fillRect(-bw/2,-38,bw*(s.hp/s.maxHp),7);
$core.ctx.restore();
if(s.hp/s.maxHp<0.4) ptcl(s.x+(Math.random()-0.5)*30,s.y+(Math.random()-0.5)*10,'#aa00ff',1,2);
}
function spawnFighterJet(){
if($buildings.state!=='playing'||$buildings.isPaused||!canSpawnBoss())return;
const hp = 120 + $buildings.wave*14;
$psycho2.fighterJet = {
x:-120, y:$replay.H*0.25,
hp, maxHp:hp,
alive:true,
angle:0,
spd:5,
mode:'approach',
modeTimer:0,
strafeTargetY:$replay.H*0.3,
strafeDir:1,
bankAngle:0, bankSpeed:0,
missileArmed:false, missileLockTimer:0, missileFired:false,
lowPassActive:false, lowPassY:0,
gunTimer:0,
afterburnTimer:0,
smokeTrail:[],
phase:0,
hitFlash:0,
bossPhase:1,
rearGunTimer:0,
warningActive:false, warningTimer:0
};
$buildings.bossAlive=true; $buildings._airstrikeGraceUntil=$buildings.tick+1200; $replay.bBarW.style.opacity='1'; $replay.bBarF.style.width='100%';
if($buildings._firstBossSpawnTick===null) $buildings._firstBossSpawnTick=$buildings.tick;
el('boss-bar-label').innerHTML='WAVE '+$buildings.wave+' — <span style=\"color:#00aaff\">GHOST PROTOCOL</span>';
$psycho2.bossRegistry.register('fighterJet', ()=>$psycho2.fighterJet, ()=>!!($psycho2.fighterJet&&$psycho2.fighterJet.alive));
}
function updateFighterJet(){
if(!$psycho2.fighterJet||!$psycho2.fighterJet.alive)return;
const j=$psycho2.fighterJet;
j.phase+=0.05; j.modeTimer++; j.hitFlash=Math.max(0,j.hitFlash-1);
if(j.warningActive){ j.warningTimer--; if(j.warningTimer<=0) j.warningActive=false; }
if(j.hp/j.maxHp<0.5 && j.bossPhase===1){
j.bossPhase=2; j._phaseWindupUntil=$buildings.tick+32; shake(8);
floatText(j.x,j.y-40,'▸ PHASE 2 — GHOST PROTOCOL','#00aaff',14);
j.spd*=1.15;
j.mode='approach'; j.modeTimer=0; j._approachInit=undefined;
j.strafeDir = j.x < $replay.W/2 ? 1 : -1;
j.x = j.strafeDir>0 ? -120 : $replay.W+120;
j.angle = j.strafeDir>0 ? 0 : Math.PI;
j.y = Math.max($replay.H*0.12, Math.min($replay.H*0.45, j.y));
}
const _effPhase = (j._phaseWindupUntil && $buildings.tick < j._phaseWindupUntil) ? 1 : j.bossPhase;
j.smokeTrail.push({x:j.x,y:j.y,life:20,sz:8+Math.random()*5});
{let _st=j.smokeTrail,_sw=0;for(let _si=0;_si<_st.length;_si++){_st[_si].life--;if(_st[_si].life>0)_st[_sw++]=_st[_si];}j.smokeTrail.length=_sw;}
switch(j.mode){
case 'approach': {
if(j.x > 0 && j.x < $replay.W){
j.x = j.strafeDir>0 ? -110 : $replay.W+110;
j.y = Math.max($replay.H*0.1, Math.min($replay.H*0.50, j.strafeTargetY||j.y));
j.angle = j.strafeDir>0 ? 0 : Math.PI;
j._approachInit = undefined;
break;
}
if(j._approachInit === undefined){
j.strafeTargetY = Math.max($replay.H*0.12, Math.min($replay.H*0.50, $replay.H*0.15 + Math.random() * $replay.H * 0.32));
j._approachInit = true;
}
const aimX = j.strafeDir>0 ? -180 : $replay.W+180;
const aimA = Math.atan2(j.strafeTargetY-j.y, aimX-j.x);
let _da = aimA - j.angle;
while(_da > Math.PI) _da -= Math.PI*2;
while(_da < -Math.PI) _da += Math.PI*2;
j.angle += Math.max(-0.05, Math.min(0.05, _da*0.10));
j.x += Math.cos(j.angle)*j.spd;
j.y += Math.sin(j.angle)*j.spd;
j.y = Math.max(-60, Math.min($replay.H+60, j.y));
if((j.strafeDir>0&&j.x<-100)||(j.strafeDir<0&&j.x>$replay.W+100)){
j.x = j.strafeDir>0 ? -110 : $replay.W+110;
j.y = Math.max($replay.H*0.1, Math.min($replay.H*0.50, j.strafeTargetY));
j.angle = j.strafeDir>0 ? 0 : Math.PI;
j.mode = 'strafe'; j.modeTimer=0; j.afterburnTimer=40;
j._approachInit = undefined;
j.warningActive=true; j.warningTimer=60;
floatText($replay.W/2,$replay.H*0.15,'! INCOMING STRAFE RUN','#ff4400',14);
if(!$core.isMobile) shake(4);
}
break;
}
case 'strafe': {
j.angle = j.strafeDir>0 ? 0 : Math.PI;
j.x += j.strafeDir*j.spd*(j.afterburnTimer>0?1.6:1);
if(j.afterburnTimer>0) j.afterburnTimer--;
j.gunTimer++;
const fireInterval = _effPhase===2 ? 10 : 14;
if(j.gunTimer>fireInterval){
j.gunTimer=0;
const _jt=_coopTarget(j.x,j.y);
const aimAtPlayer=Math.atan2(_jt.y-j.y,_jt.x-j.x);
for(let i=-1;i<=1;i++){
const a=j.angle+i*0.12;
$buildings.bullets.push({x:j.x,y:j.y,vx:Math.cos(a)*13,vy:Math.sin(a)*13,own:'enemy',life:260,dmg:2,col:'#00aaff',sz:3});
}
$buildings.bullets.push({x:j.x,y:j.y,vx:Math.cos(aimAtPlayer)*11,vy:Math.sin(aimAtPlayer)*11,own:'enemy',life:260,dmg:2,col:'#44ccff',sz:2.5});
audioManager.fire('smg');
ptclQ(j.x+Math.cos(j.angle)*32,j.y+Math.sin(j.angle)*32,'#00aaff',2,3);
}
if((j.strafeDir>0&&j.x>$replay.W+100)||(j.strafeDir<0&&j.x<-100)){
j.strafeDir*=-1;
j.mode='bank'; j.modeTimer=0; j.bankAngle=j.angle; j._bankTotal=0;
const roll=Math.random();
j._nextMode = _effPhase===2
? (roll<0.15?'missile':roll<0.45?'lowpass':'approach')
: (roll<0.15?'cruise':roll<0.35?'lowpass':'approach');
}
break;
}
case 'bank': {
if(!j._bankTotal) j._bankTotal=0;
const BANK_RATE = 0.05;
if(j._bankTotal < Math.PI){
j.angle += BANK_RATE;
j._bankTotal += BANK_RATE;
}
j.x += Math.cos(j.angle)*j.spd*1.1;
j.y += Math.sin(j.angle)*j.spd*1.1;
j.x = Math.max(-$replay.W*0.5, Math.min($replay.W*1.5, j.x));
j.y = Math.max(-60, Math.min($replay.H*0.55, j.y));
ptclQ(j.x-Math.cos(j.angle)*28,j.y-Math.sin(j.angle)*28,'#00aaff',2,2);
if(j._bankTotal >= Math.PI){
j._bankTotal = 0;
j.angle = j.strafeDir>0 ? 0 : Math.PI;
j.x = j.strafeDir>0 ? -110 : $replay.W+110;
j.y = Math.max($replay.H*0.1, Math.min($replay.H*0.50, j.y));
const next=j._nextMode||'approach';
j._nextMode=null; j.modeTimer=0; j.afterburnTimer=40;
if(next==='missile'){
j.y=Math.max($replay.H*0.05, Math.min($replay.H*0.40, j.y));
j.mode='missile'; j.missileLockTimer=0; j.missileFired=false; j.missileArmed=true;
} else if(next==='lowpass'){
j.mode='lowpass'; j.lowPassActive=true;
j.lowPassY=Math.max($replay.H*0.40,Math.min($replay.H*0.55,$replay.H*0.45+Math.random()*$replay.H*0.08));
} else if(next==='cruise'){
j.mode='cruise'; j._cruiseInit=false; j._cruiseTotalFrames=undefined;
floatText($replay.W/2, $replay.H*0.12, '▲ CRUISE PATTERN', '#aaff00', 12);
} else {
j.strafeTargetY=Math.max($replay.H*0.12,Math.min($replay.H*0.50,$replay.H*0.18+Math.random()*$replay.H*0.32));
j._approachInit=true;
j.mode='approach';
}
}
break;
}
case 'missile':
j.angle+=j.strafeDir*0.022;
j.x=Math.max($replay.W*0.05,Math.min($replay.W*0.95, j.x+Math.cos(j.angle)*j.spd*0.5));
j.y=Math.max($replay.H*0.05,Math.min($replay.H*0.40, j.y+Math.sin(j.angle)*j.spd*0.5));
j.missileLockTimer++;
if(j.missileLockTimer===20) floatText($buildings.player.x,$buildings.player.y-50,'! MISSILE LOCK','#ff6600',14);
if(j.missileLockTimer===60) floatText($buildings.player.x,$buildings.player.y-50,'! MISSILE LOCK','#ff3300',15);
if(j.missileLockTimer===100) floatText($buildings.player.x,$buildings.player.y-50,'! INCOMING — MOVE!','#ff0000',16);
if(j.missileLockTimer===120 && !j.missileFired){
j.missileFired=true;
const _mt=_coopTarget(j.x,j.y);
const mAng=Math.atan2(_mt.y-j.y,_mt.x-j.x);
$buildings.bullets.push({x:j.x,y:j.y,
vx:Math.cos(mAng)*6, vy:Math.sin(mAng)*6,
own:'enemy', life:260, dmg:4,
col:'#ff4400', sz:6,
isHoming:true, homingStr:0.022,
homingDelay:40,
wt:'missile_homing'});
shake(6); audioManager.fire('rpg');
floatText(j.x,j.y-30,'▲ MISSILE FIRED','#ff4400',14);
}
if(j.modeTimer>200){ j.mode='approach'; j.modeTimer=0; }
break;
case 'lowpass': {
j.y += (j.lowPassY - j.y) * 0.04;
const lpTargetX = j.strafeDir>0 ? $replay.W+120 : -120;
const lpA = Math.atan2(j.lowPassY-j.y, lpTargetX-j.x);
j.angle += (lpA-j.angle)*0.06;
j.x += Math.cos(j.angle)*j.spd*0.45;
if(j.modeTimer%20<10) floatText(j.x,j.y-34,'▼ VULNERABLE','#aaff00',10);
if(j.modeTimer===40 && j.x > 20 && j.x < $replay.W-20 && j.y > 20 && j.y < $replay.H-20){
$buildings.grenades.push({x:j.x,y:j.y,tx:$buildings.player.x+(Math.random()-0.5)*80,
ty:$buildings.player.y+(Math.random()-0.5)*60,speed:9,spin:0,fuse:40,life:1,fromJet:true});
audioManager.fire('grenade_throw');
}
if((j.strafeDir>0&&j.x>$replay.W+80)||(j.strafeDir<0&&j.x<-80)||j.modeTimer>160){
j.mode='approach'; j.modeTimer=0; j.strafeDir*=-1;
}
break;
}
case 'cruise': {
if(!j._cruiseInit){
j._cruiseTargetY = $replay.H*0.10 + Math.random()*$replay.H*0.18;
j.angle = j.strafeDir>0 ? 0 : Math.PI;
j.x = j.strafeDir>0 ? -120 : $replay.W+120;
j.y = j._cruiseTargetY;
j._cruiseWave = 0;
j._cruiseInit = true;
j.afterburnTimer = 0;
if(j._cruiseTotalFrames===undefined) j._cruiseTotalFrames=0;
}
j._cruiseWave = (j._cruiseWave||0) + 0.035;
j._cruiseTotalFrames = (j._cruiseTotalFrames||0) + 1;
const cTargetY = j._cruiseTargetY + Math.sin(j._cruiseWave)*10;
j.y += (cTargetY - j.y)*0.04;
j.angle = j.strafeDir>0 ? 0 : Math.PI;
j.x += j.strafeDir * j.spd * 0.65;
if((j.strafeDir>0 && j.x > $replay.W+130)||(j.strafeDir<0 && j.x < -130)){
j.strafeDir *= -1;
j._cruiseInit = false;
j.x = j.strafeDir>0 ? -120 : $replay.W+120;
}
if(j._cruiseTotalFrames > 600){
j._cruiseInit = false;
j._cruiseWave = 0;
j._cruiseTotalFrames = undefined;
j.mode = 'approach';
j.modeTimer = 0;
j._approachInit = undefined;
floatText($replay.W/2, $replay.H*0.15, '! HOSTILE RE-ENGAGED', '#ff4400', 13);
}
break;
}
}
$buildings.bullets.forEach(b=>{
if(!b.isHoming || b.wt!=='missile_homing') return;
if(b.homingDelay > 0){ b.homingDelay--; ptclQ(b.x,b.y,'#ff6600',1,2); return; }
const ta=Math.atan2($buildings.player.y-b.y,$buildings.player.x-b.x);
let da=ta-Math.atan2(b.vy,b.vx);
while(da>Math.PI)da-=Math.PI*2; while(da<-Math.PI)da+=Math.PI*2;
const turnRate = 0.035;
da = Math.max(-turnRate, Math.min(turnRate, da));
const spd=Math.hypot(b.vx,b.vy);
const na=Math.atan2(b.vy,b.vx)+da;
b.vx=Math.cos(na)*Math.min(spd+0.02, 6.5);
b.vy=Math.sin(na)*Math.min(spd+0.02, 6.5);
ptclQ(b.x,b.y,'#ff6600',1,2);
});
if(_effPhase===2 && j.mode==='strafe'){
j.rearGunTimer++;
if(j.rearGunTimer>50){
j.rearGunTimer=0;
const rearA=j.angle+Math.PI+(Math.random()-0.5)*0.4;
$buildings.bullets.push({x:j.x,y:j.y,vx:Math.cos(rearA)*7,vy:Math.sin(rearA)*7,own:'enemy',life:300,dmg:2,col:'#ff4400',sz:3});
}
}
if(j.mode!=='bank' && j.mode!=='cruise'){
j.x=Math.max(-140,Math.min($replay.W+140,j.x));
j.y=Math.max(-60, Math.min($replay.H*0.6, j.y));
}
const hitRadius = j.mode==='lowpass' ? 52 : 36;
$buildings.bullets.forEach(b=>{
if(!j.alive)return;
if(b.own!=='player'&&b.own!=='ally'&&b.own!=='player2')return;
const d=Math.hypot(b.x-j.x,b.y-j.y);
if(d<hitRadius){
j.hp-=b.dmg||1; j.hitFlash=8;
ptcl(b.x,b.y,'#00aaff',4,2);
audioManager.hit(); b.life=0;
$replay.bBarF.style.width=(Math.max(0,j.hp)/j.maxHp*100)+'%';
if(j.hp<=0){
j.alive=false;
ptclBurst(j.x,j.y,'#00aaff',40,8,22,3);
ptclBurst(j.x,j.y,'#ff4400',14,5,20,2);
$buildings.debrisArr.push({x:j.x,y:j.y,r:180,life:50,maxLife:50});
if($buildings.craters.filter(c=>!c._fromBuilding).length<$psycho1.MAX_OPEN_CRATERS){$psycho1._pushCrater({x:j.x,y:j.y,r:85,seed:(j.x*13+j.y*7)|0,_fromBuilding:false});}
shake(22); audioManager.explosion();
setTimeout(()=>audioManager.explosion(),350);
setTimeout(()=>audioManager.explosion(),700);
const pts=1400; $buildings.score+=pts; el('score-num').textContent=$buildings.score;
gainXP(200); floatText(j.x,j.y-40,'+'+pts,'#00aaff',22);
$buildings.bossAlive=false; $replay.bBarW.style.opacity='0';
audioManager.stopBossMusic(); $buildings.waveKills=$buildings.waveTotal;
$psycho2.bossRegistry.unregister('fighterJet'); $psycho2.fighterJet=null;
dcOnBossKill();$buildings._bossTypesThisRun.push('Fighter Jet');onBossDefeated('jet');$replay.ReplayRecorder.capture('* FIGHTER JET ELIMINATED','boss_jet'); vibrate([80,40,80,40,200]);
}
}
});
if($psycho2.fighterJet&&$psycho2.fighterJet.alive) applyAerialBossContact($psycho2.fighterJet, 34);
}
function drawFighterJet(){
if(!$psycho2.fighterJet||!$psycho2.fighterJet.alive)return;
const j=$psycho2.fighterJet;
const hitCol=j.hitFlash>0;
const phase2=j.bossPhase===2;
const isCruise=j.mode==='cruise';
const bodyBase = hitCol?'#ffffff': phase2?'#2a0808':'#0d1a2e';
const bodyPanel = hitCol?'#ffff88': phase2?'#3d1010':'#162440';
const bodyAccent = hitCol?'#ffee00': phase2?'#551818':'#1e3358';
const stripeCol = hitCol?'#ff8800': phase2?'#cc2200':'#003a80';
const accentCol = hitCol?'#ffff00': phase2?'#ff4400':'#00aaff';
const canopyCol = phase2?'rgba(255,60,0,0.65)':'rgba(0,180,255,0.60)';
const glowCol = phase2?'#ff4400':'#00aaff';
const glowCruise = '#aaff00';
if(!$profiler._skipTrailParticles){ for(const sm of j.smokeTrail){
$core.ctx.save();$core.ctx.globalAlpha=sm.life/20*(isCruise?0.18:0.30);
$core.ctx.fillStyle=isCruise?'#88ff44':phase2?'#ff4400':'#00aaff';
$core.ctx.beginPath();$core.ctx.arc(sm.x,sm.y,sm.sz*(isCruise?0.7:1),0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
} }
$core.ctx.save();$core.ctx.translate(j.x+(j._recoilOffX||0),j.y+(j._recoilOffY||0));$core.ctx.rotate(j.angle);
$core.ctx.shadowColor=isCruise?glowCruise:glowCol;
$core.ctx.shadowBlur=(hitCol?32:isCruise?10:18)*$core.SHADOW;
const sweep = j.afterburnTimer>0 ? 0.88 : 1.0;
$core.ctx.fillStyle=bodyPanel;
$core.ctx.beginPath();
$core.ctx.moveTo(6, -1);
$core.ctx.lineTo(-8*sweep, -34);
$core.ctx.lineTo(-26, -22);
$core.ctx.lineTo(-24, -2);
$core.ctx.closePath();$core.ctx.fill();
$core.ctx.beginPath();
$core.ctx.moveTo(6, 1);
$core.ctx.lineTo(-8*sweep, 34);
$core.ctx.lineTo(-26, 22);
$core.ctx.lineTo(-24, 2);
$core.ctx.closePath();$core.ctx.fill();
$core.ctx.strokeStyle=stripeCol; $core.ctx.lineWidth=1.2;
$core.ctx.beginPath();$core.ctx.moveTo(6,-1);$core.ctx.lineTo(-8*sweep,-34);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(6, 1);$core.ctx.lineTo(-8*sweep, 34);$core.ctx.stroke();
$core.ctx.fillStyle=bodyBase;
$core.ctx.fillRect(-6,-28,5,5);
$core.ctx.fillRect(-6, 23,5,5);
if(phase2){
$core.ctx.fillStyle='#cc2200';
$core.ctx.fillRect(-14,-33,8,4);
$core.ctx.fillRect(-14, 29,8,4);
$core.ctx.fillStyle=accentCol;$core.ctx.shadowColor='#ff4400';$core.ctx.shadowBlur=8*$core.SHADOW;
$core.ctx.beginPath();$core.ctx.arc(-10,-33,2.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.arc(-10, 33,2.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.shadowBlur=(hitCol?32:18)*$core.SHADOW;
}
$core.ctx.fillStyle=bodyBase;
$core.ctx.beginPath();
$core.ctx.moveTo(-20, -4);
$core.ctx.lineTo(-32,-16);
$core.ctx.lineTo(-36, -6);
$core.ctx.lineTo(-28, 0);
$core.ctx.closePath();$core.ctx.fill();
$core.ctx.beginPath();
$core.ctx.moveTo(-20, 4);
$core.ctx.lineTo(-32, 16);
$core.ctx.lineTo(-36, 6);
$core.ctx.lineTo(-28, 0);
$core.ctx.closePath();$core.ctx.fill();
$core.ctx.strokeStyle=stripeCol;$core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.moveTo(-20,-4);$core.ctx.lineTo(-32,-16);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(-20, 4);$core.ctx.lineTo(-32, 16);$core.ctx.stroke();
$core.ctx.fillStyle=bodyBase;
$core.ctx.beginPath();
$core.ctx.moveTo(-34, 0);
$core.ctx.lineTo(-16,-5);
$core.ctx.lineTo( 18,-7);
$core.ctx.lineTo( 36, 0);
$core.ctx.lineTo( 18, 7);
$core.ctx.lineTo(-16, 5);
$core.ctx.closePath();$core.ctx.fill();
$core.ctx.fillStyle=bodyPanel;
$core.ctx.beginPath();
$core.ctx.moveTo(-28, 0);
$core.ctx.lineTo(-12,-4);
$core.ctx.lineTo( 26,-4);
$core.ctx.lineTo( 26, 4);
$core.ctx.lineTo(-12, 4);
$core.ctx.closePath();$core.ctx.fill();
$core.ctx.strokeStyle=stripeCol;$core.ctx.lineWidth=1.5;
$core.ctx.beginPath();$core.ctx.moveTo(-28,0);$core.ctx.lineTo(24,0);$core.ctx.stroke();
$core.ctx.fillStyle=bodyAccent;
$core.ctx.beginPath();$core.ctx.ellipse(8,-6,5,2.5,0.3,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(8, 6,5,2.5,-0.3,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#000a14';
$core.ctx.beginPath();$core.ctx.ellipse(8,-6,3,1.5,0.3,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(8, 6,3,1.5,-0.3,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=canopyCol;
$core.ctx.shadowColor=glowCol;$core.ctx.shadowBlur=10*$core.SHADOW;
$core.ctx.beginPath();$core.ctx.ellipse(16,0,10,4.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle=accentCol;$core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.ellipse(16,0,10,4.5,0,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.strokeStyle=accentCol;$core.ctx.lineWidth=0.8;$core.ctx.globalAlpha=0.5;
$core.ctx.beginPath();$core.ctx.moveTo(16,-4.5);$core.ctx.lineTo(16,4.5);$core.ctx.stroke();
$core.ctx.globalAlpha=1;
$core.ctx.strokeStyle=accentCol;$core.ctx.lineWidth=2;$core.ctx.shadowBlur=6*$core.SHADOW;
$core.ctx.beginPath();$core.ctx.moveTo(34,0);$core.ctx.lineTo(46,0);$core.ctx.stroke();
if(phase2){
$core.ctx.lineWidth=1.5;
$core.ctx.beginPath();$core.ctx.moveTo(34,-3);$core.ctx.lineTo(44,-3);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(34, 3);$core.ctx.lineTo(44, 3);$core.ctx.stroke();
}
const abOn=j.afterburnTimer>0;
const nozzleCol = abOn?'rgba(255,140,0,0.95)':isCruise?'rgba(80,255,80,0.85)':phase2?'rgba(255,70,0,0.90)':'rgba(0,210,255,0.85)';
const nozzleGlow= abOn?'#ff8800':isCruise?'#aaff00':phase2?'#ff4400':'#00ffff';
$core.ctx.fillStyle=nozzleCol;
$core.ctx.shadowColor=nozzleGlow;
$core.ctx.shadowBlur=(abOn?26:isCruise?12:16)*$core.SHADOW;
const nozzleR=abOn?5:4;
$core.ctx.beginPath();$core.ctx.arc(-33,-3,nozzleR,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.arc(-33, 3,nozzleR,0,Math.PI*2);$core.ctx.fill();
if(abOn){
$core.ctx.globalAlpha=0.55;
$core.ctx.fillStyle='rgba(255,200,0,0.6)';
$core.ctx.beginPath();$core.ctx.moveTo(-33,-3);$core.ctx.lineTo(-48,-2);$core.ctx.lineTo(-48,2);$core.ctx.lineTo(-33,3);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.globalAlpha=1;
}
if(j.mode==='lowpass'){
$core.ctx.globalAlpha=0.45+Math.sin(j.phase*5)*0.35;
$core.ctx.strokeStyle='#aaff00';$core.ctx.lineWidth=3;
$core.ctx.shadowColor='#aaff00';$core.ctx.shadowBlur=22*$core.SHADOW;
$core.ctx.beginPath();$core.ctx.ellipse(0,0,40,9,0,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.globalAlpha=1;
}
if(isCruise){
$core.ctx.globalAlpha=0.25+Math.sin(j.phase*2)*0.12;
$core.ctx.strokeStyle='#aaff00';$core.ctx.lineWidth=2;
$core.ctx.shadowColor='#aaff00';$core.ctx.shadowBlur=14*$core.SHADOW;
$core.ctx.beginPath();$core.ctx.ellipse(0,0,46,10,0,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.globalAlpha=1;
}
$core.ctx.rotate(-j.angle);
const bw=94;
$core.ctx.fillStyle='#000915';$core.ctx.fillRect(-bw/2,-42,bw,7);
$core.ctx.fillStyle=j.hp/j.maxHp>0.5?'#0099ff':j.hp/j.maxHp>0.25?'#ffcc00':'#ff2200';
$core.ctx.fillRect(-bw/2,-42,bw*(Math.max(0,j.hp)/j.maxHp),7);
$core.ctx.fillStyle='rgba(0,0,0,0.6)';$core.ctx.fillRect(-bw/2+bw*0.5-1,-42,2,7);
$core.ctx.restore();
if(j.mode==='missile' && !j.missileFired && j.missileLockTimer>0){
const lockPct=Math.min(1,j.missileLockTimer/120);
const pulse=0.5+Math.sin(j.phase*6)*0.4;
$core.ctx.save();
$core.ctx.strokeStyle=`rgba(255,${Math.floor(100*(1-lockPct))},0,${0.4+pulse*0.4})`;
$core.ctx.lineWidth=2+lockPct*2;$core.ctx.shadowColor='#ff0000';$core.ctx.shadowBlur=(10+lockPct*8)*$core.SHADOW;
$core.ctx.beginPath();$core.ctx.arc($buildings.player.x,$buildings.player.y,30+Math.sin(j.phase*6)*3,0,Math.PI*2*lockPct);$core.ctx.stroke();
$core.ctx.strokeStyle='rgba(255,80,0,0.3)';$core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.arc($buildings.player.x,$buildings.player.y,18,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.restore();
}
}
function spawnArmoredCar(side){
if($buildings.state!=='playing'||$buildings.isPaused)return;
const noCarsAlive = $psycho2.armoredCars.filter(c=>c.alive).length===0;
if(!canSpawnBoss() && noCarsAlive) return;
const hp=Math.round((55+$buildings.wave*9)*($core.isMobile?0.65:0.8));
const isRammer = side>0;
const car={x:side>0?-80:$replay.W+80,y:$replay.H*0.3+Math.random()*$replay.H*0.4,
tx:$replay.W/2+(side>0?-60:60),ty:$replay.H*0.3+Math.random()*$replay.H*0.4,
hp,maxHp:hp,spd:isRammer?2.0:1.6,st:0,si:isRammer?105:80,alive:true,angle:0,side,phase:0,bombTimer:0,
role:isRammer?'rammer':'gunner',chargeState:'orbit',chargeCD:isRammer?240+Math.floor(Math.random()*60):999999,chargeTimer:0,chargeVX:0,chargeVY:0,_chargeHitDone:false};
$psycho2.armoredCars.push(car);
$buildings.bossAlive=true;$psycho2._carsEncounterActive=true;$buildings._airstrikeGraceUntil=$buildings.tick+1200;$replay.bBarW.style.opacity='1';
if($buildings._firstBossSpawnTick===null) $buildings._firstBossSpawnTick=$buildings.tick;
el('boss-bar-label').textContent='WAVE '+$buildings.wave+' ARMORED CARS';
}
function updateArmoredCars(){
let anyAlive=false;
$psycho2.armoredCars=$psycho2.armoredCars.filter(c=>{
if(!c.alive)return false;
anyAlive=true;
c.phase+=0.02;c.bombTimer=Math.max(0,c.bombTimer-1);
const _cpt=_coopTarget(c.x,c.y);
const carPad=34;
if(c.chargeState==='orbit'){
const dx=_cpt.x-c.x,dy=_cpt.y-c.y;
c.angle=Math.atan2(dy,dx);
const d=Math.hypot(dx,dy);
if(d>230){
const pos=moveBossToward(c.x,c.y,_cpt.x,_cpt.y,c.spd,carPad);
c.x=pos.x;c.y=pos.y;
} else {
const perpA=c.angle+Math.PI/2;
const cx=c.x+Math.cos(perpA)*c.spd*c.side;
const cy=c.y+Math.sin(perpA)*c.spd*c.side;
if(!onBuilding(cx,cy,carPad)){c.x=cx;c.y=cy;}
}
if(c.role==='rammer'){
c.chargeCD--;
if(c.chargeCD<=0 && d<460 && d>60){
c.chargeState='telegraph';c.chargeTimer=70;
audioManager.fire('reload');
}
}
} else if(c.chargeState==='telegraph'){
const dx=_cpt.x-c.x,dy=_cpt.y-c.y;
c.angle=Math.atan2(dy,dx);
c.chargeTimer--;
if(c.chargeTimer%6===0) shake(1.5);
if(c.chargeTimer<=0){
c.chargeState='charging';c.chargeTimer=30;c._chargeHitDone=false;
c.chargeVX=Math.cos(c.angle)*8;c.chargeVY=Math.sin(c.angle)*8;
shake(5);audioManager.fire('smg');
}
} else if(c.chargeState==='charging'){
c.chargeTimer--;
if($buildings.tick%2===0) ptcl(c.x-Math.cos(c.angle)*22,c.y-Math.sin(c.angle)*22,'#222222',2,4);
const nx=c.x+c.chargeVX,ny=c.y+c.chargeVY;
if(!onBuilding(nx,ny,34)){c.x=nx;c.y=ny;}
else{c.chargeState='cooldown';c.chargeTimer=100;shake(10);ptclQ(c.x,c.y,'#888888',1,10);}
if(c.chargeTimer<=0 && c.chargeState==='charging'){c.chargeState='cooldown';c.chargeTimer=100;}
} else if(c.chargeState==='cooldown'){
const dx=_cpt.x-c.x,dy=_cpt.y-c.y;
c.angle=Math.atan2(dy,dx);
c.chargeTimer--;
if(c.chargeTimer<=0){c.chargeState='orbit';c.chargeCD=340+Math.floor(Math.random()*120);}
}
$psycho2.armoredCars.forEach(other=>{
if(other===c||!other.alive)return;
const cdx=c.x-other.x,cdy=c.y-other.y;
const cd=Math.hypot(cdx,cdy);
const minSep=66;
if(cd>0&&cd<minSep){
const push=(minSep-cd)*0.5+1;
const px=(cdx/cd)*push,py=(cdy/cd)*push;
c.x+=px;c.y+=py;
other.x-=px;other.y-=py;
}
});
c.x=Math.max(-80,Math.min($replay.W+80,c.x));c.y=Math.max(0,Math.min($replay.H,c.y));
if(c.chargeState==='orbit'){
c.st++;
if(c.st>c.si){
c.st=0;
if(c.bombTimer<=0){
c.bombTimer=240;
const _cbt=_coopTarget(c.x,c.y);
const bombX=_cbt.x+(Math.random()-0.5)*110;
const bombY=_cbt.y+(Math.random()-0.5)*110;
$buildings.grenades.push({x:c.x,y:c.y,tx:bombX,ty:bombY,speed:5,spin:0,fuse:70,life:1,fromCar:true});
audioManager.fire('grenade_throw');
}
for(let i=-1;i<=1;i++){
const a=c.angle+i*0.24;
$buildings.bullets.push({x:c.x,y:c.y,vx:Math.cos(a)*6,vy:Math.sin(a)*6,own:'enemy',life:350,dmg:1,col:'#ff8800',sz:3});
}
audioManager.fire('smg');
}
}
$buildings.bullets.forEach(b=>{
if(b.own!=='player'&&b.own!=='ally')return;
const bd=Math.hypot(b.x-c.x,b.y-c.y);
if(bd<42){
c.hp-=b.dmg||1;ptcl(b.x,b.y,'#ff8800',4,2);audioManager.hit();b.life=0;
if(c.hp<=0){
c.alive=false;
for(let i=0;i<40;i++) ptclQ(c.x,c.y,'#ff8800',1,6+Math.random()*7);
$buildings.debrisArr.push({x:c.x,y:c.y,r:120,life:40,maxLife:40});
if($buildings.craters.filter(c=>!c._fromBuilding).length<$psycho1.MAX_OPEN_CRATERS){$psycho1._pushCrater({x:c.x,y:c.y,r:55,seed:(c.x*13+c.y*7)|0,_fromBuilding:false});}
shake(15);audioManager.explosion();
const pts=600;$buildings.score+=pts;el('score-num').textContent=$buildings.score;
gainXP(120);floatText(c.x,c.y-30,'+'+pts,'#ff8800',18);
}
}
});
const carD=Math.hypot($buildings.player.x-c.x,$buildings.player.y-c.y);
const carR=36;
if(c.chargeState==='charging'){
if(carD>0&&carD<carR+6 && !c._chargeHitDone){
c._chargeHitDone=true;
if($buildings.player.shield>0){$buildings.player.shield=Math.max(0,$buildings.player.shield-4);}
else{$buildings.player.hp-=7;updateHP();shake(12);vibrate([60,30,60]);killFlash('rgba(255,60,0,0.3)',120);if($buildings.player.hp<=0)$props.triggerPlayerDeath('contact');}
const pushA=Math.atan2($buildings.player.y-c.y,$buildings.player.x-c.x);
const nx=$buildings.player.x+Math.cos(pushA)*46;
const ny=$buildings.player.y+Math.sin(pushA)*46;
if(!onBuilding(nx,ny,8)){$buildings.player.x=nx;$buildings.player.y=ny;}
}
} else if(carD>0&&carD<carR){
if($buildings.player.shield>0){$buildings.player.shield=Math.max(0,$buildings.player.shield-2);}
else{$buildings.player.hp-=0.1;updateHP();shake(4);vibrate(40);if($buildings.player.hp<=0)$props.triggerPlayerDeath('contact');}
const pushA=Math.atan2($buildings.player.y-c.y,$buildings.player.x-c.x);
const overlap=carR-carD;
const nx=$buildings.player.x+Math.cos(pushA)*(overlap+2);
const ny=$buildings.player.y+Math.sin(pushA)*(overlap+2);
if(!onBuilding(nx,ny,8)){$buildings.player.x=nx;$buildings.player.y=ny;}
else if(!onBuilding(nx,$buildings.player.y,8)){$buildings.player.x=nx;}
else if(!onBuilding($buildings.player.x,ny,8)){$buildings.player.y=ny;}
}
$buildings.allies.forEach(a=>{
if(!a.alive)return;
const ad=Math.hypot(a.x-c.x,a.y-c.y);
if(ad>0&&ad<carR+4){
a.hp-=c.chargeState==='charging'?1.5:0.15;
const pushA=Math.atan2(a.y-c.y,a.x-c.x);
const overlap=(carR+4)-ad;
const nx=a.x+Math.cos(pushA)*(overlap+2);
const ny=a.y+Math.sin(pushA)*(overlap+2);
if(!onBuilding(nx,ny,12)){a.x=nx;a.y=ny;}
else if(!onBuilding(nx,a.y,12)){a.x=nx;}
else if(!onBuilding(a.x,ny,12)){a.y=ny;}
if(a.hp<=0) a.alive=false;
}
});
return c.alive;
});
if(!anyAlive&&$psycho2._carsEncounterActive&&$psycho2.armoredCars.length===0){
$psycho2._carsEncounterActive=false;
$buildings.bossAlive=false;$replay.bBarW.style.opacity='0';audioManager.stopBossMusic();$buildings.waveKills=$buildings.waveTotal;
dcOnBossKill();$buildings._bossTypesThisRun.push('Armored Cars');onBossDefeated('cars');$replay.ReplayRecorder.capture('* ARMORED CARS ELIMINATED','boss_cars');
}
if(anyAlive&&$psycho2.armoredCars.length>0){
const totalHp=$psycho2.armoredCars.reduce((s,c)=>s+c.hp,0);
const totalMax=$psycho2.armoredCars.reduce((s,c)=>s+c.maxHp,0);
$replay.bBarF.style.width=(totalHp/totalMax*100)+'%';
}
}
const _dmCarHull=[[-33,-10],[-29,-14],[18,-14],[27,-10],[34,-5],[34,5],[27,10],[18,14],[-29,14],[-33,10]];
const _dmCarRoof=[[-28,-9],[15,-9],[23,-6],[23,6],[15,9],[-28,9]];
const _dmCarGlacis=[[23,-6],[27,-8.2],[33,-4.2],[33,4.2],[27,8.2],[23,6]];
const _dmCarRam=[[32,-11],[39,-8.5],[44,-3],[44,3],[39,8.5],[32,11]];
const _dmCarAxles=[-24,-8,8,24];
function drawArmoredCars(){
const g=$core.ctx;
const poly=(p)=>{g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)g.lineTo(p[i][0],p[i][1]);g.closePath();};
for(const c of $psycho2.armoredCars){
if(!c.alive)continue;
const isRammer=c.role==='rammer';
const accent=isRammer?'#ff2200':'#ff8800';
const tele=c.chargeState==='telegraph';
const chg=c.chargeState==='charging';
const orbit=c.chargeState==='orbit';
const tp=tele?(0.5+0.5*Math.sin(c.chargeTimer*0.9)):0;
const hpR=Math.max(0,c.hp/c.maxHp);
const rk=isRammer?'r':'g';
const ox=c._recoilOffX||0, oy=c._recoilOffY||0;
if(chg){
g.save();g.globalAlpha=0.35;g.fillStyle=accent;
for(let i=1;i<=3;i++){
g.beginPath();g.ellipse(c.x-Math.cos(c.angle)*(14+i*10),c.y-Math.sin(c.angle)*(14+i*10),9-i*2,5-i,c.angle,0,Math.PI*2);g.fill();
}
g.restore();
}
g.save();g.shadowBlur=0;g.translate(c.x+ox+3,c.y+oy+5);g.rotate(c.angle);g.globalAlpha=0.34;g.fillStyle='#000';
poly(_dmCarHull);g.fill();g.restore();

g.save();g.translate(c.x+ox,c.y+oy);g.rotate(c.angle);
g.lineJoin='round';
g.fillStyle='#0b0c0e';
g.beginPath();
for(const ax of _dmCarAxles){g.rect(ax-5,-18.5,10,5.5);g.rect(ax-5,13,10,5.5);}
g.fill();
g.strokeStyle='rgba(255,255,255,0.07)';g.lineWidth=0.7;g.stroke();
g.strokeStyle='rgba(0,0,0,0.9)';g.lineWidth=0.9;
g.beginPath();
for(const ax of _dmCarAxles){for(let t=-3;t<=3;t+=3){g.moveTo(ax+t,-18.3);g.lineTo(ax+t,-13.2);g.moveTo(ax+t,13.2);g.lineTo(ax+t,18.3);}}
g.stroke();
const hullGrad=cachedLinearGradient('dm_car_hull_'+rk,0,-14,0,14,isRammer?[[0,'#50535a'],[0.5,'#2c2e33'],[1,'#17181b']]:[[0,'#5c6451'],[0.5,'#363c2e'],[1,'#1c2018']]);
g.save();
g.shadowColor=accent;g.shadowBlur=(chg?18:7)*$core.SHADOW;
g.fillStyle=hullGrad;poly(_dmCarHull);g.fill();
g.restore();
g.strokeStyle='rgba(0,0,0,0.7)';g.lineWidth=1.2;poly(_dmCarHull);g.stroke();
g.strokeStyle='rgba(255,255,255,0.09)';g.lineWidth=0.7;
g.beginPath();g.moveTo(-29,-13.3);g.lineTo(18,-13.3);g.lineTo(26.6,-9.7);g.lineTo(33.3,-4.8);g.stroke();
g.fillStyle='rgba(6,8,10,0.55)';
g.beginPath();
for(let x=-27;x<=15;x+=6){g.rect(x,-13,5,3.6);g.rect(x,9.4,5,3.6);}
g.fill();
g.strokeStyle='rgba(255,255,255,0.12)';g.lineWidth=0.5;
g.beginPath();
for(let x=-27;x<=15;x+=6){g.moveTo(x,-13);g.lineTo(x+5,-13);g.moveTo(x,9.4);g.lineTo(x+5,9.4);}
g.stroke();
const roofGrad=cachedLinearGradient('dm_car_roof_'+rk,0,-9,0,9,isRammer?[[0,'#62656d'],[1,'#2f3136']]:[[0,'#707a64'],[1,'#3c4433']]);
g.fillStyle=roofGrad;poly(_dmCarRoof);g.fill();
g.strokeStyle='rgba(0,0,0,0.55)';g.lineWidth=0.9;g.stroke();
g.fillStyle='rgba(0,0,0,0.28)';poly(_dmCarGlacis);g.fill();
g.strokeStyle='rgba(255,255,255,0.1)';g.lineWidth=0.6;g.stroke();
g.strokeStyle='rgba(0,0,0,0.45)';g.lineWidth=0.7;
g.beginPath();g.moveTo(-21,-9);g.lineTo(-21,9);g.moveTo(19,-7.4);g.lineTo(19,7.4);g.moveTo(-28,0);g.lineTo(-21,0);g.stroke();
g.strokeStyle=accent;g.globalAlpha=0.5;g.lineWidth=0.7;
g.beginPath();g.moveTo(-26,-8.1);g.lineTo(14,-8.1);g.moveTo(-26,8.1);g.lineTo(14,8.1);g.stroke();
g.globalAlpha=1;
g.fillStyle='rgba(0,0,0,0.3)';g.fillRect(-27,-6.5,6,13);
g.strokeStyle='rgba(0,0,0,0.7)';g.lineWidth=0.8;
g.beginPath();for(let y=-5;y<=5;y+=2){g.moveTo(-26.5,y);g.lineTo(-21.5,y);}g.stroke();
if(hpR<0.25){
g.fillStyle='rgba(255,'+(90+Math.floor(70*Math.abs(Math.sin(c.phase*9))))+',0,'+(0.35+0.25*Math.abs(Math.sin(c.phase*7)))+')';
g.fillRect(-27,-6.5,6,13);
}
g.fillStyle='#0a1317';g.strokeStyle='rgba(120,190,205,0.45)';g.lineWidth=0.5;
for(let i=-1;i<=1;i++){g.beginPath();g.rect(20.4,i*4.2-1.5,2.4,3);g.fill();g.stroke();}
g.fillStyle='#1d2024';g.strokeStyle='rgba(255,255,255,0.14)';g.lineWidth=0.7;
g.beginPath();g.arc(-9,-4.6,3.3,0,Math.PI*2);g.fill();g.stroke();
g.beginPath();g.arc(-9,4.6,2.6,0,Math.PI*2);g.fill();g.stroke();
g.fillStyle='rgba(255,255,255,0.18)';g.beginPath();g.arc(-9,-4.6,1,0,Math.PI*2);g.fill();
g.fillStyle='#101215';
g.beginPath();for(let x=12.5;x<=16.5;x+=2){g.rect(x,-8.6,1.5,2.4);g.rect(x,6.2,1.5,2.4);}g.fill();
g.strokeStyle='#9a9fa6';g.lineWidth=0.7;g.lineCap='round';
const sw=Math.sin(c.phase*5)*2;
g.beginPath();g.moveTo(-23,-7);g.lineTo(-31+sw,-17);g.stroke();
g.fillStyle='#9a9fa6';g.beginPath();g.arc(-31+sw,-17,0.9,0,Math.PI*2);g.fill();
g.fillStyle='#1d2024';g.beginPath();g.arc(-23,-7,1.5,0,Math.PI*2);g.fill();

if(isRammer){
g.fillStyle='#14161a';g.fillRect(-19,-5.5,8,11);
g.strokeStyle='rgba(255,255,255,0.14)';g.lineWidth=0.6;g.strokeRect(-19,-5.5,8,11);
g.strokeStyle='rgba(255,255,255,0.07)';g.beginPath();
for(let i=1;i<4;i++){g.moveTo(-19+i*2,-5.5);g.lineTo(-19+i*2,5.5);}
for(let j=1;j<5;j++){g.moveTo(-19,-5.5+j*2.2);g.lineTo(-11,-5.5+j*2.2);}
g.stroke();
g.fillStyle='#0c0d0f';g.beginPath();g.arc(7,0,6.3,0,Math.PI*2);g.fill();
const mgGrad=cachedRadialGradient('dm_car_mg_r',5,-2,0.5,7,0,6,[[0,'#6a6d75'],[1,'#25272c']]);
g.fillStyle=mgGrad;g.beginPath();g.arc(7,0,5.2,0,Math.PI*2);g.fill();
g.strokeStyle='rgba(0,0,0,0.7)';g.lineWidth=0.9;g.stroke();
const mgK=orbit?Math.max(0,1-c.st/6)*1.6:0;
g.fillStyle='#1a1b1e';g.fillRect(11-mgK,-1,10,2);
g.fillStyle='#3a3c41';g.fillRect(11-mgK,-1.6,6,3.2);
g.fillStyle='#0c0d0f';g.fillRect(20-mgK,-1.5,2.2,3);
g.fillStyle='#4a6a80';g.beginPath();g.arc(5.5,-3,1.1,0,Math.PI*2);g.fill();
g.strokeStyle='#0c0d0f';g.lineWidth=3.2;g.lineCap='butt';
g.beginPath();g.moveTo(28,-6);g.lineTo(36,-6.8);g.moveTo(28,6);g.lineTo(36,6.8);g.stroke();
g.strokeStyle='#8a8f98';g.lineWidth=1.6;
g.beginPath();g.moveTo(28,-6);g.lineTo(36,-6.8);g.moveTo(28,6);g.lineTo(36,6.8);g.stroke();
const ramGrad=cachedLinearGradient('dm_car_ram',32,0,44,0,[[0,'#3c3f45'],[1,'#141518']]);
g.fillStyle=ramGrad;poly(_dmCarRam);g.fill();
g.strokeStyle='rgba(0,0,0,0.85)';g.lineWidth=1.1;g.stroke();
g.strokeStyle='rgba(255,255,255,0.12)';g.lineWidth=0.6;
g.beginPath();g.moveTo(36,-9.8);g.lineTo(36,9.8);g.moveTo(40.5,-6);g.lineTo(40.5,6);g.stroke();
g.save();
g.strokeStyle=accent;g.lineWidth=1.4;g.lineCap='round';g.globalAlpha=chg?1:(0.55+0.3*tp);
g.shadowColor=accent;g.shadowBlur=(chg?12:5)*$core.SHADOW;
g.beginPath();g.moveTo(39,-8.5);g.lineTo(44,-3);g.lineTo(44,3);g.lineTo(39,8.5);g.stroke();
g.restore();
} else {
g.fillStyle='#0c0d0f';g.beginPath();g.arc(7,0,8.2,0,Math.PI*2);g.fill();
g.strokeStyle='rgba(255,255,255,0.12)';g.lineWidth=0.7;g.stroke();
g.save();g.translate(7,0);
g.fillStyle='#22261d';
g.fillRect(-3,-11,11,3.4);g.fillRect(-3,7.6,11,3.4);
g.strokeStyle='rgba(0,0,0,0.8)';g.lineWidth=0.7;g.strokeRect(-3,-11,11,3.4);g.strokeRect(-3,7.6,11,3.4);
g.fillStyle='#050607';
g.beginPath();g.arc(8,-9.3,1.2,0,Math.PI*2);g.arc(8,9.3,1.2,0,Math.PI*2);g.fill();
g.strokeStyle=accent;g.globalAlpha=0.7;g.lineWidth=0.6;
g.beginPath();g.arc(8,-9.3,1.5,0,Math.PI*2);g.arc(8,9.3,1.5,0,Math.PI*2);g.stroke();g.globalAlpha=1;
const gk=orbit?Math.max(0,1-c.st/8)*3:0;
const barrelGrad=cachedLinearGradient('dm_car_barrel',0,-1.2,0,1.2,[[0,'#7a7e86'],[0.5,'#2b2d31'],[1,'#0e0f11']]);
g.fillStyle=barrelGrad;g.fillRect(9-gk,-1.1,23,2.2);
g.fillStyle='#34373c';g.fillRect(11-gk,-1.9,11,3.8);
g.strokeStyle='rgba(0,0,0,0.8)';g.lineWidth=0.6;g.strokeRect(11-gk,-1.9,11,3.8);
g.beginPath();g.moveTo(14.5-gk,-1.9);g.lineTo(14.5-gk,1.9);g.moveTo(18-gk,-1.9);g.lineTo(18-gk,1.9);g.stroke();
g.fillStyle='#0b0c0e';g.fillRect(30-gk,-2.2,4,4.4);
g.fillStyle='#000';g.fillRect(31.2-gk,-2.2,0.8,4.4);g.fillRect(32.8-gk,-2.2,0.8,4.4);
g.fillStyle='#16181b';g.fillRect(9-gk,2.6,13,1.1);
const turGrad=cachedLinearGradient('dm_car_tur',0,-7,0,7,[[0,'#7a8470'],[0.55,'#40483a'],[1,'#20241c']]);
g.fillStyle=turGrad;
poly([[-6,-5.4],[3,-6.8],[9,-4],[10,-2.2],[10,2.2],[9,4],[3,6.8],[-6,5.4]]);g.fill();
g.strokeStyle='rgba(0,0,0,0.8)';g.lineWidth=1;g.stroke();
g.strokeStyle='rgba(255,255,255,0.14)';g.lineWidth=0.6;
g.beginPath();g.moveTo(-5,-4.6);g.lineTo(3,-5.9);g.lineTo(8.5,-3.4);g.stroke();
g.fillStyle='#0f1114';g.fillRect(9.6,-3,2,6);
g.fillStyle='#14161a';g.beginPath();g.arc(1,-3.2,2.5,0,Math.PI*2);g.fill();
g.strokeStyle='rgba(255,255,255,0.2)';g.lineWidth=0.6;g.stroke();
g.fillStyle='rgba(90,180,230,0.9)';g.beginPath();g.arc(2,-3.2,0.9,0,Math.PI*2);g.fill();
g.restore();
if(orbit&&c.st<3){
g.save();g.translate(7+34,0);g.globalAlpha=0.9-c.st*0.3;
g.shadowColor=accent;g.shadowBlur=12*$core.SHADOW;g.fillStyle='#ffe3a0';
g.beginPath();g.moveTo(0,-1.6);g.lineTo(7-c.st*2,0);g.lineTo(0,1.6);g.closePath();g.fill();
g.restore();
}
}
g.save();
const barA=chg?1:(tele?0.6+0.4*tp:0.5+0.2*Math.sin(c.phase*3));
g.globalAlpha=barA;g.strokeStyle=chg?'#ffffff':(tele?'#ff2200':accent);g.lineWidth=1.5;g.lineCap='round';
g.shadowColor=tele?'#ff2200':accent;g.shadowBlur=(tele?14:8)*$core.SHADOW;
g.beginPath();g.moveTo(isRammer?30.2:32.6,-4.3);g.lineTo(isRammer?30.2:32.6,4.3);g.stroke();
g.restore();
g.save();
g.fillStyle=tele?'rgba(255,'+Math.round(40+tp*40)+',0,'+(0.7+tp*0.3)+')':'rgba(255,200,0,0.75)';
g.shadowColor=tele?'#ff2200':'#ffcc00';g.shadowBlur=(tele?14:6)*$core.SHADOW;
g.fillRect(26.5,-10.6,2.6,1.8);g.fillRect(26.5,8.8,2.6,1.8);
g.restore();
g.fillStyle='rgba(210,25,15,0.85)';g.fillRect(-33.6,-9,1.2,3.2);g.fillRect(-33.6,5.8,1.2,3.2);
if(tele){
g.strokeStyle='rgba(255,40,0,'+(0.45+tp*0.5)+')';g.lineWidth=1.4;poly(_dmCarHull);g.stroke();
}
if(hpR<0.5){
g.fillStyle='rgba(0,0,0,0.38)';
g.beginPath();g.ellipse(-2,5,5,2.6,0.4,0,Math.PI*2);g.ellipse(12,-5,3.6,2,-0.3,0,Math.PI*2);g.fill();
g.strokeStyle='rgba(0,0,0,0.6)';g.lineWidth=0.8;
g.beginPath();g.moveTo(-14,-2);g.lineTo(-10,1);g.lineTo(-12,5);g.moveTo(16,3);g.lineTo(12,6);g.stroke();
}
g.rotate(-c.angle);
if(tele){
g.save();
g.globalAlpha=0.7+0.3*Math.sin(c.chargeTimer*0.9);
g.font='bold 16px Share Tech Mono';
g.textAlign='center';
g.fillStyle='#ff2200';
g.shadowColor='#ff2200';g.shadowBlur=10*$core.SHADOW;
g.fillText('!',0,-38);
g.restore();
}
const bw=70,bx=-35,by=-30;
g.fillStyle='rgba(8,10,12,0.88)';g.fillRect(bx-1,by-1,bw+2,6);
g.fillStyle=hpR>0.5?accent:'#ff2200';g.fillRect(bx,by,bw*hpR,4);
g.fillStyle='rgba(0,0,0,0.65)';
for(let i=1;i<10;i++)g.fillRect(bx+bw*i/10-0.4,by,0.8,4);
g.strokeStyle='rgba(255,255,255,0.2)';g.lineWidth=0.6;g.strokeRect(bx-1,by-1,bw+2,6);
g.font='7px Share Tech Mono';g.textAlign='left';g.fillStyle=accent;g.globalAlpha=0.85;
g.fillText(isRammer?'NX-R  BREACH':'NX-G  OVERWATCH',bx-1,by-3);
g.globalAlpha=1;
g.restore();
}
}
function updatePowerups(){
$buildings.powerups=$buildings.powerups.filter(pu=>{
pu.life--;if(pu.life<=0)return false;
if($buildings.player.godModeTimer>0){
const md=Math.hypot($buildings.player.x-pu.x,$buildings.player.y-pu.y);
if(md<320 && md>4){
pu.x+=($buildings.player.x-pu.x)/md*Math.min(md,11);
pu.y+=($buildings.player.y-pu.y)/md*Math.min(md,11);
}
}
const d=Math.hypot($buildings.player.x-pu.x,$buildings.player.y-pu.y);
if(d<26){
audioManager.pickup(pu.type);
if(pu.type==='rapid'){$buildings.player.rapidTimer=300;showPickupMsg('▸ RAPID FIRE!','#ffaa00');dcOnRapidState(true);}
else if(pu.type==='shield'){$buildings.player.shield=300;showPickupMsg('◈ SHIELD UP!','#00ccff');}
else if(pu.type==='health'){ if($buildings._mutCfg&&$buildings._mutCfg.ironMan){ showPickupMsg('x NO HEALTH — IRON MAN','#ff2255'); } else { $buildings.player.hp=Math.min($buildings.player.maxHp,$buildings.player.hp+40);updateHP();showPickupMsg('+ HEALTH +40','#ff4466');dcOnHealthPickup(); } }
else if(pu.type==='ammo'){$buildings.wepAmmo[$buildings.curWep]=$buildings.WEAPONS[$buildings.curWep].ammo+($buildings.wepUpgrades[$buildings.curWep].ammo||0);$buildings.reloading=false;$buildings.reloadTimer=0;updateHUD();showPickupMsg('◉ AMMO REFILLED!','#aaff00');}
else if(pu.type==='speed'){$buildings.player.speedTimer=300;showPickupMsg('* SPEED BOOST!','#ff00ff');}
else if(pu.type==='grenade'){$buildings.grenadeCount=Math.min($buildings.grenadeCount+1,6);updateGrenadeHUD();showPickupMsg('▪ GRENADE +1','#ffcc00');}
else if(pu.type==='godmode'){activateGodMode(180);}
else if(pu.type&&pu.type.startsWith('weapon_')){const wk=pu.type.replace('weapon_','');if($buildings.WK.includes(wk)){
$buildings.wepAmmo[wk]=$buildings.WEAPONS[wk].ammo;
let _isNewWeaponEver=false;
try{
const _seenKey='diy_seen_weapons';
const _seen=new Set(JSON.parse(localStorage.getItem(_seenKey)||'[]'));
if(!_seen.has(wk)){
_isNewWeaponEver=true;
_seen.add(wk);
localStorage.setItem(_seenKey,JSON.stringify([..._seen]));
}
}catch(_e){}
if(_isNewWeaponEver){
showPickupMsg(':: '+$buildings.WEAPONS[wk].name+' ACQUIRED!','#7fff00','NEW WEAPON UNLOCKED');
killFlash('rgba(127,255,0,0.25)',220);
shake(5);
vibrate([25,15,25]);
} else {
showPickupMsg(':: '+$buildings.WEAPONS[wk].name+' AMMO!','#aaff00');
}
}}
if($props._guidedWave) $props.onGuidedPickup();
ptcl(pu.x,pu.y,pu.type==='rapid'?'#ffaa00':pu.type==='shield'?'#00ccff':pu.type==='health'?'#ff4466':pu.type==='grenade'?'#ffcc00':pu.type==='godmode'?'#ffd700':'#aaff00',8,3);
return false;
}
return true;
});
}
function updateBossEntities(){
updateHelicopter();
updateAlienShip();
updateFighterJet();
updateArmoredCars();
updateSpiderTank();
updateHarmTug();
}
$legendary._checkpoint = null;
const SET_FIELDS = ['mutations', 'taken'];
function _serializeUpgrades(upgrades) {
const copy = Object.assign({}, upgrades);
copy.perk = Object.assign({}, upgrades.perk || {});
SET_FIELDS.forEach(k => {
copy[k] = [...(upgrades[k] instanceof Set ? upgrades[k] : [])];
});
return copy;
}
function _deserializeUpgrades(raw) {
const copy = Object.assign({}, raw);
copy.perk = Object.assign({}, raw.perk || {});
SET_FIELDS.forEach(k => {
copy[k] = new Set(Array.isArray(raw[k]) ? raw[k] : []);
});
return copy;
}
function saveCheckpoint(){
const safeWepAmmo = {...$buildings.wepAmmo};
if(safeWepAmmo[$buildings.curWep] <= 0 || $buildings.reloading){
safeWepAmmo[$buildings.curWep] = $buildings.WEAPONS[$buildings.curWep].ammo + ($buildings.wepUpgrades[$buildings.curWep]?.ammo || 0);
}
$legendary._checkpoint = {
levelId: $replay.currentLevel ? $replay.currentLevel.id : null,
levelName: $replay.currentLevel ? $replay.currentLevel.name : null,
isBossRush: !!($replay.currentLevel && $replay.currentLevel.isBossRush),
selectedChar: $replay.selectedChar,
currentEnv: $replay.currentEnv,
wave: $buildings.wave,
waveOffset: $replay.waveOffset || 0,
score: $buildings.score,
hp: Math.round($buildings.player.hp),
maxHp: $buildings.player.maxHp,
wepAmmo: safeWepAmmo,
wepUpgrades: JSON.parse(JSON.stringify($buildings.wepUpgrades)),
wepEvolution: JSON.parse(JSON.stringify($psycho2.wepEvolution)),
legendaryWeps: [...(window._legendaryWeps || [])],
armorTier: $psycho2.armorTier || 0,
wepStats: Object.fromEntries(Object.keys($buildings.WEAPONS).map(w => [w, { cd: $buildings.WEAPONS[w].cd, spd: $buildings.WEAPONS[w].spd, range: $buildings.WEAPONS[w].range }])),
wepUpgradeCount: Object.assign({}, $psycho2.wepUpgradeCount),
WK: [...$buildings.WK],
curWep: $buildings.curWep,
playerUpgrades: _serializeUpgrades($psycho2.playerUpgrades),
grenadeCount: $buildings.grenadeCount,
totalKills: $buildings.totalKills,
playerXP: $buildings.playerXP,
playerLevel: $buildings.playerLevel,
xpToNext: $buildings.xpToNext,
waveInProgress: false,
wavePending: false,
waveKills: 0,
waveTotal: 999,
bossAlive: false,
_activeMutators: [...$buildings.activeMutators],
killStreak: $buildings.killStreak,
upgradeRerollsUsed: $buildings._upgradeRerollsUsed,
allies: ($buildings.allies||[]).filter(a=>a.alive).map(a=>({hpFrac: a.maxHp ? a.hp/a.maxHp : 1})),
};
try { localStorage.setItem('diy_checkpoint', JSON.stringify($legendary._checkpoint)); } catch(e){}
showPickupMsg('OK CHECKPOINT SAVED — WAVE '+$buildings.wave,'#00ffcc');
vibrate([20,10,20,10,60]);
if(typeof updateResumeButton === 'function') updateResumeButton();
}
window.saveCheckpoint = saveCheckpoint;
function loadCheckpoint(){
if(!$legendary._checkpoint) return false;
$replay.waveOffset = $legendary._checkpoint.waveOffset || 0;
$buildings.wave = $legendary._checkpoint.wave;
$buildings.score = $legendary._checkpoint.score;
if($legendary._checkpoint.currentEnv) $replay.currentEnv = $legendary._checkpoint.currentEnv;
$buildings.player.hp = $legendary._checkpoint.hp;
$buildings.player.maxHp = $legendary._checkpoint.maxHp;
$buildings.wepAmmo = {...$legendary._checkpoint.wepAmmo};
$buildings.wepUpgrades = JSON.parse(JSON.stringify($legendary._checkpoint.wepUpgrades));
if($legendary._checkpoint.wepEvolution) $psycho2.wepEvolution = JSON.parse(JSON.stringify($legendary._checkpoint.wepEvolution));
{
const _cp = $legendary._checkpoint;
window._legendaryWeps = new Set(Array.isArray(_cp.legendaryWeps)
? _cp.legendaryWeps
: Object.entries($psycho2.wepEvolution || {}).filter(([, t]) => t >= 3).map(([w]) => w));
if(typeof _cp.armorTier === 'number') $psycho2.armorTier = _cp.armorTier;
if(_cp.wepStats){
Object.entries(_cp.wepStats).forEach(([w, st]) => {
const W = $buildings.WEAPONS[w];
if(!W || !st) return;
if(typeof st.cd === 'number') W.cd = st.cd;
if(typeof st.spd === 'number') W.spd = st.spd;
if(typeof st.range === 'number') W.range = st.range;
});
}
if(_cp.wepUpgradeCount && $psycho2.wepUpgradeCount) Object.assign($psycho2.wepUpgradeCount, _cp.wepUpgradeCount);
}
if($legendary._checkpoint.WK && Array.isArray($legendary._checkpoint.WK)) {
$buildings.WK.length = 0;
$legendary._checkpoint.WK.forEach(w => { if(!$buildings.WK.includes(w)) $buildings.WK.push(w); });
}
$buildings.curWep = $legendary._checkpoint.curWep;
if(!$buildings.wepAmmo[$buildings.curWep] || $buildings.wepAmmo[$buildings.curWep] <= 0){
$buildings.wepAmmo[$buildings.curWep] = $buildings.WEAPONS[$buildings.curWep].ammo + ($buildings.wepUpgrades[$buildings.curWep]?.ammo || 0);
}
$buildings.reloading = false; $buildings.reloadTimer = 0;
$psycho2.playerUpgrades = _deserializeUpgrades($legendary._checkpoint.playerUpgrades || {});
$buildings.grenadeCount = ($legendary._checkpoint.grenadeCount !== undefined) ? $legendary._checkpoint.grenadeCount : 3;
$buildings.totalKills = $legendary._checkpoint.totalKills || 0;
$buildings.playerXP = $legendary._checkpoint.playerXP || 0;
$buildings.playerLevel = $legendary._checkpoint.playerLevel || 1;
$buildings.xpToNext = $legendary._checkpoint.xpToNext || 100;
$buildings.waveInProgress = false;
$buildings.wavePending = false;
$buildings.waveKills = 0;
$buildings.waveTotal = ($legendary._checkpoint.waveTotal !== undefined) ? $legendary._checkpoint.waveTotal : 999;
$buildings.bossAlive = ($legendary._checkpoint.bossAlive !== undefined) ? $legendary._checkpoint.bossAlive : false;
if($legendary._checkpoint.killStreak !== undefined) $buildings.killStreak = $legendary._checkpoint.killStreak;
if($legendary._checkpoint.upgradeRerollsUsed !== undefined) $buildings._upgradeRerollsUsed = $legendary._checkpoint.upgradeRerollsUsed;
if($legendary._checkpoint._activeMutators && Array.isArray($legendary._checkpoint._activeMutators)){
$buildings.activeMutators.clear();
$legendary._checkpoint._activeMutators.forEach(id => $buildings.activeMutators.add(id));
$buildings._mutCfg = buildMutatorConfig();
}
if($legendary._checkpoint.allies && Array.isArray($legendary._checkpoint.allies) && typeof spawnAlly === 'function'){
$legendary._checkpoint.allies.forEach(a=>{
spawnAlly(true);
const spawned = $buildings.allies[$buildings.allies.length-1];
if(spawned){
const frac = (typeof a.hpFrac === 'number') ? Math.min(1, Math.max(0, a.hpFrac)) : 1;
spawned.hp = Math.max(1, Math.round(spawned.maxHp * frac));
}
});
}
updateHUD(); updateHP(); updateGrenadeHUD(); updateWepUpgradeHUD();
if(typeof _mutPillRebuild === 'function') _mutPillRebuild();
return true;
}
function clearCheckpoint(){
$legendary._checkpoint = null;
try { localStorage.removeItem('diy_checkpoint'); } catch(e){}
if(typeof updateResumeButton === 'function') updateResumeButton();
}
try {
const saved = localStorage.getItem('diy_checkpoint');
if(saved){
$legendary._checkpoint = JSON.parse(saved);
if($legendary._checkpoint && $legendary._checkpoint.playerUpgrades){
const pu = $legendary._checkpoint.playerUpgrades;
SET_FIELDS.forEach(k => { if(!Array.isArray(pu[k])) pu[k] = []; });
}
}
} catch(e){}
function checkWaveCompletion(){
if(!$buildings.waveInProgress || $buildings.wavePending) return;
const _muts = $psycho2.playerUpgrades ? $psycho2.playerUpgrades.mutations : new Set();
if(_muts.has('mut_explosive') || _muts.has('mut_pierce') || $buildings.bossAlive){
const _actualDead = $buildings.enemies.filter(e=>!e.alive&&!e.boss).length;
if(_actualDead > $buildings.waveKills) $buildings.waveKills = Math.min(_actualDead, $buildings.waveTotal);
}
const anySpecialBossAlive = ($psycho2.helicopter&&$psycho2.helicopter.alive) ||
($psycho2.alienShip&&$psycho2.alienShip.alive) ||
($psycho2.fighterJet&&$psycho2.fighterJet.alive) ||
($psycho2.spiderTank&&$psycho2.spiderTank.alive) ||
($psycho2.harmTug&&$psycho2.harmTug.alive) ||
$psycho2.armoredCars.some(c=>c.alive);
const currentWaveKills = Math.min($buildings.waveKills, $buildings.waveTotal);
if(currentWaveKills>=$buildings.waveTotal&&!$buildings.enemies.some(e=>e.alive)&&!$buildings.bossAlive&&!anySpecialBossAlive){
$buildings.waveInProgress=false;$buildings.wavePending=true;$buildings.waveKills=0;
_compactEnemies();
try{
if(!localStorage.getItem('diy_first_wave')){
localStorage.setItem('diy_first_wave','1');
_gst(()=>{
floatTextPop($buildings.player.x,$buildings.player.y-50,'▣ WAVE CLEARED!','#00ffcc',18);
floatText($buildings.player.x,$buildings.player.y-72,'You\'re getting the hang of it!','#aaffcc',12);
shake(6);
vibrate([25,15,25,15,40]);
},150);
}
const _wCtx = audioManager._ensureCtx();
if(_wCtx){
const _wNow = _wCtx.currentTime;
[523, 659, 784].forEach((f,i)=>{
const _o=_wCtx.createOscillator(), _g=_wCtx.createGain();
_o.type='triangle'; _o.frequency.value=f;
_g.gain.setValueAtTime(0,_wNow+i*0.1);
_g.gain.linearRampToValueAtTime(0.12,_wNow+i*0.1+0.04);
_g.gain.exponentialRampToValueAtTime(0.001,_wNow+i*0.1+0.35);
_o.connect(_g);_g.connect(_wCtx.destination);
_o.start(_wNow+i*0.1);_o.stop(_wNow+i*0.1+0.4);
});
}
}catch(_e){}
const _nodmgSnapshot = $mutators._dcNodmgWaveTaken;
if(!_nodmgSnapshot && $mutators._dcTodayChallenges){
$mutators._dcTodayChallenges.forEach(c=>{
const g=c.goal();
if(g.type==='nodmgWave') $mutators._dcProgress[c.id]=($mutators._dcProgress[c.id]||0)+1;
});
}
const maxW=$replay.currentLevel?$replay.currentLevel.maxWaves:999;
const justFinishedFinalWave = $replay.currentLevel && !$replay.currentLevel.isEndless && $buildings.wave>=maxW;
if(($buildings.wave%5===0 || ($buildings.wave%2===0 && $buildings.wave>2)) && !justFinishedFinalWave) saveCheckpoint();
$profiler.checkWaveUnlocks($buildings.wave);
applyChaosReroll();
if($props._guidedWave) $props.onGuidedWaveClear();
if(justFinishedFinalWave){
clearCheckpoint();
window.currentLevel=$replay.currentLevel;window.score=$buildings.score;window.wave=$buildings.wave;window.totalKills=$buildings.totalKills;
_gst(()=>{ if($buildings.state==='playing') window.showLevelComplete(); }, 600);
} else {
_gst(()=>{
if($buildings.state==='playing'&&el('upgrade-panel').style.display==='none') showUpgradePanel();
_gst(()=>{
if($buildings.state==='playing' && $buildings.wavePending && el('upgrade-panel').style.display==='none'){
const maxW2=$replay.currentLevel?$replay.currentLevel.maxWaves:999;
$buildings.wavePending=false;
if($replay.currentLevel && !$replay.currentLevel.isEndless && $buildings.wave>=maxW2){ window.showLevelComplete(); }
else { nextWave(); }
}
}, 1200);
}, 250);
}
}
}
// ===== v9: wave status / rush / call-next-wave / low-HP readability =====
let _rushStartTick=0;
function _specialBossAlive(){
return ($psycho2.helicopter&&$psycho2.helicopter.alive)||($psycho2.alienShip&&$psycho2.alienShip.alive)||($psycho2.fighterJet&&$psycho2.fighterJet.alive)||($psycho2.spiderTank&&$psycho2.spiderTank.alive)||($psycho2.harmTug&&$psycho2.harmTug.alive)||$psycho2.armoredCars.some(c=>c.alive);
}
function _callNextWave(){
const B=$buildings;
if(B.state!=='playing'||!B.waveInProgress||B.wavePending||B.bossAlive||_specialBossAlive()) return;
const left=B.enemies.filter(e=>e.alive&&!e.boss);
if(left.length>3 || B.waveTotal-Math.min(B.waveKills,B.waveTotal)>left.length) return;
const bonus=50+B.wave*10+left.length*25;
left.forEach(e=>{ e.alive=false; ptcl(e.x,e.y,'#ffcc00',8,3); });
if(typeof _markEnemiesDirty==='function') _markEnemiesDirty();
B.waveKills=B.waveTotal;
B.score+=bonus;
floatTextPop(B.player.x,B.player.y-48,'WAVE CALLED +'+bonus,'#ffee44',16);
try{audioManager.upgradeConfirm();}catch(_e){}
_rushStartTick=0;
}
function _tryDash(dv){
const P=$buildings.player;
if($buildings.state!=='playing'||$buildings.isPaused||$buildings.playerDead) return;
if(P._dashCD>0||(P._knifeDash&&P._knifeDash.frames>0)) return;
let dx=dv.x,dy=dv.y;
if(!dx&&!dy){ dx=Math.cos(P.angle||0); dy=Math.sin(P.angle||0); }
const m=Math.hypot(dx,dy)||1;
const base=($replay.selectedChar==='commando'?4.5:$replay.selectedChar==='elite'?3.2:$replay.selectedChar==='heavy'?2.8:$replay.selectedChar==='sniper'?4.2:$replay.selectedChar==='medic'?3.6:$replay.selectedChar==='alien'?5.0:3.8);
const sp=base*4.8;
P._knifeDash={vx:dx/m*sp,vy:dy/m*sp,frames:10};
P._iframes=12;
P._dashCD=75;
ptclQ(P.x,P.y,'#9fe8ff',$core.isMobile?4:8,5);
try{audioManager._tone(520,0.07,'sine',0.07,180);}catch(_e){}
shake(2);
}
let _wsLastText='';
function _updateWaveStatus(){
const B=$buildings, P=B.player;
const t=B.tick|0;
if(t%5!==0) return;
const playing=B.state==='playing';
// low HP vignette + mild bullet-time
const low=playing && P.maxHp>0 && P.hp>0 && P.hp/P.maxHp<0.25;
if(document.body.classList.contains('lowhp')!==low) document.body.classList.toggle('lowhp',low);
window._bt=low?0.82:1;
// dash chip
const chip=document.getElementById('dash-chip');
if(chip){
const show=playing&&!$core.isMobile;
if(show){
if(chip.style.display!=='block') chip.style.display='block';
const cd=P._dashCD||0, f=cd>0?(1-cd/75):1;
document.getElementById('dash-fill').style.width=(f*100)+'%';
const tx=cd>0?'DASH ...':'[C] DASH READY';
if(tx!==_wsLastText){ document.getElementById('dash-txt').textContent=tx; _wsLastText=tx; }
} else if(chip.style.display!=='none') chip.style.display='none';
}
const mb=document.getElementById('btn-dash'); if(mb) mb.classList.toggle('cd',(P._dashCD||0)>0);
// remaining chip
const ws=document.getElementById('wave-status');
if(!ws) return;
if(!playing||!B.waveInProgress||B.wavePending){ if(ws.style.display!=='none') ws.style.display='none'; _rushStartTick=0; return; }
const alive=B.enemies.filter(e=>e.alive&&!e.boss);
const bossy=B.bossAlive||_specialBossAlive();
const pending=Math.max(0,B.waveTotal-Math.min(B.waveKills,B.waveTotal)-alive.length);
const rem=alive.length+pending;
if(ws.style.display!=='flex') ws.style.display='flex';
document.getElementById('ws-remaining').textContent=bossy?'BOSS FIGHT':'REMAINING '+rem;
const rush=!bossy && pending===0 && alive.length>0 && alive.length<=3;
const rushEl=document.getElementById('ws-rush'), callEl=document.getElementById('ws-call');
if(rush){
if(!_rushStartTick) _rushStartTick=t;
const dur=t-_rushStartTick;
rushEl.style.display='block'; rushEl.textContent='RUSH - '+alive.length+' LEFT';
// stragglers sprint
alive.forEach(e=>{ if(!e._rushBoost){ e._rushBoost=true; e.spd=Math.min((e.spd||1)*1.6,6.5); e.si=Math.max(10,Math.floor((e.si||40)*0.8)); } });
// still alive after ~6s -> teleport them close to the player
if(dur>360){
alive.forEach(e=>{
if(Math.hypot(e.x-P.x,e.y-P.y)<300) return;
for(let k=0;k<14;k++){
const a=Math.random()*Math.PI*2, r=230+Math.random()*70;
const nx=Math.max(20,Math.min($replay.W-20,P.x+Math.cos(a)*r)), ny=Math.max(20,Math.min($replay.H-20,P.y+Math.sin(a)*r));
if(!onBuilding(nx,ny,14)){ ptcl(e.x,e.y,'#ffcc00',6,3); e.x=nx; e.y=ny; e.stuckTimer=0; ptcl(nx,ny,'#ffcc00',8,3); break; }
}
});
_rushStartTick=t-240;
}
if(dur>90){ callEl.style.display='block'; callEl.textContent='CALL NEXT WAVE  +'+(50+B.wave*10+alive.length*25)+(!$core.isMobile?'  [N]':''); }
} else {
_rushStartTick=0;
if(rushEl.style.display!=='none') rushEl.style.display='none';
if(callEl.style.display!=='none') callEl.style.display='none';
}
}
(function(){
const b=document.getElementById('ws-call');
if(b){ b.addEventListener('click',_callNextWave); b.addEventListener('touchstart',e=>{e.preventDefault();_callNextWave();},{passive:false}); }
const d=document.getElementById('btn-dash');
if(d){ d.addEventListener('touchstart',e=>{e.preventDefault();$buildings.player._dashQueued=true;},{passive:false}); d.addEventListener('click',()=>{$buildings.player._dashQueued=true;}); }
document.addEventListener('keydown',e=>{
if(e.code==='KeyN'&&!e.repeat&&!e.ctrlKey&&!e.metaKey){ const tg=(e.target&&e.target.tagName)||''; if(tg==='INPUT'||tg==='TEXTAREA') return; _callNextWave(); }
});
})();
const TOUCH_ANALOG_MOVE=true, TOUCH_MOVE_DEAD=0.16, TOUCH_MOVE_FULL=0.82;
function updateMovement(){
_applyPlayerKnockback();
const baseSpd=($replay.selectedChar==='commando'?4.5:$replay.selectedChar==='elite'?3.2:$replay.selectedChar==='heavy'?2.8:$replay.selectedChar==='sniper'?4.2:$replay.selectedChar==='medic'?3.6:$replay.selectedChar==='alien'?5.0:3.8)*$psycho2.playerUpgrades.speed*(window.__perkSpeed||1)*($buildings.settingDifficulty==='custom'?$buildings.customDiff.pspeed:1.0);
let _craterSlow=1;
if($buildings.craters.length){
for(const cr of $buildings.craters){
if(Math.hypot($buildings.player.x-cr.x,$buildings.player.y-cr.y)<cr.r*0.85){ _craterSlow=0.7; break; }
}
}
const spd=baseSpd*($buildings.player.speedTimer>0?1.7:1)*($buildings.player.godModeTimer>0?1.4:1)*_craterSlow;
const dv={x:0,y:0};
if($buildings.keys['KeyW']||$buildings.keys['ArrowUp'])dv.y-=spd;
if($buildings.keys['KeyS']||$buildings.keys['ArrowDown'])dv.y+=spd;
if($buildings.keys['KeyA']||$buildings.keys['ArrowLeft'])dv.x-=spd;
if($buildings.keys['KeyD']||$buildings.keys['ArrowRight'])dv.x+=spd;
let _analogF=1;
try{
if(TOUCH_ANALOG_MOVE && $core.isMobile && $profiler.joyActive && $profiler.lastInputScheme==='touch'){
const _jm=Math.hypot($profiler.joyDX,$profiler.joyDY);
if(_jm>=TOUCH_MOVE_DEAD){
const _t=Math.min(1,(_jm-TOUCH_MOVE_DEAD)/(TOUCH_MOVE_FULL-TOUCH_MOVE_DEAD));
_analogF=0.4+0.6*(_t*(2-_t));
dv.x=$profiler.joyDX/_jm*spd; dv.y=$profiler.joyDY/_jm*spd;
}
}
}catch(_e){}
{
const _P=$buildings.player;
if(_P._dashCD>0) _P._dashCD--;
if(_P._iframes>0){ _P._iframes--; if(!$core.isVeryLow) ptclQ(_P.x,_P.y,'#9fe8ff',1,1); }
const _sh=!!$buildings.keys['KeyC'];
const _want=(_sh&&!$buildings.keys['_prev_Shift'])||_P._dashQueued;
$buildings.keys['_prev_Shift']=_sh; _P._dashQueued=false;
if(_want) _tryDash(dv);
}
if($psycho2.playerUpgrades.knifeDash && $buildings.curWep === 'knife'){
const _dashKeys = ['KeyW','KeyS','KeyA','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
const now = performance.now();
if($buildings.player._knifeDashCD > 0) $buildings.player._knifeDashCD--;
for(const k of _dashKeys){
if($buildings.keys[k] && !$buildings.keys['_prev_'+k]){
if($buildings.player._knifeTap && $buildings.player._knifeTap.key === k && now - $buildings.player._knifeTap.time < 320 && !$buildings.player._knifeDashCD){
const dxK = (k==='KeyA'||k==='ArrowLeft')?-1:(k==='KeyD'||k==='ArrowRight')?1:0;
const dyK = (k==='KeyW'||k==='ArrowUp')?-1:(k==='KeyS'||k==='ArrowDown')?1:0;
$buildings.player._knifeDash = { vx: dxK * baseSpd * 5.5, vy: dyK * baseSpd * 5.5, frames: 10 };
$buildings.player._knifeTap = null;
$buildings.player._knifeDashCD = 45; $buildings.player._iframes = 10;
ptclQ($buildings.player.x, $buildings.player.y, '#c8d8ff', $core.isMobile?4:8, 5);
audioManager._tone(600, 0.06, 'sine', 0.07, 200);
shake(3);
} else {
$buildings.player._knifeTap = { key: k, time: now };
}
}
}
for(const k of _dashKeys) $buildings.keys['_prev_'+k] = $buildings.keys[k];
}
if($buildings.player._knifeDash && $buildings.player._knifeDash.frames > 0){
const dash = $buildings.player._knifeDash;
dv.x = dash.vx; dv.y = dash.vy;
dash.frames--;
if(dash.frames <= 0) $buildings.player._knifeDash = null;
}
if(dv.x||dv.y){
const mag=Math.hypot(dv.x,dv.y);
const targetSpd = $buildings.player._knifeDash ? mag : spd*_analogF;
$buildings.player.vx=(dv.x/mag)*targetSpd; $buildings.player.vy=(dv.y/mag)*targetSpd;
{ const _prevHalf=Math.floor($buildings.player.walkT/Math.PI);
$buildings.player.walkT+=0.18;
if(Math.floor($buildings.player.walkT/Math.PI)!==_prevHalf && (Math.abs($buildings.player.vx)+Math.abs($buildings.player.vy))>1.2) audioManager.footstep(); }
} else{$buildings.player.vx=0;$buildings.player.vy=0;}
const _dt = window._dt || 1;
const nx=Math.max(12,Math.min($replay.W-12,$buildings.player.x+$buildings.player.vx*_dt));
const ny=Math.max(12,Math.min($replay.H-12,$buildings.player.y+$buildings.player.vy*_dt));
if(!onBuilding(nx,ny,16)){$buildings.player.x=nx;$buildings.player.y=ny;}
else if(!onBuilding(nx,$buildings.player.y,16)){$buildings.player.x=nx;}
else if(!onBuilding($buildings.player.x,ny,16)){$buildings.player.y=ny;}
else {
const ov=buildingOverlap(nx,ny,16);
if(ov){
const tx2=$buildings.player.vy*ov.nx-$buildings.player.vx*ov.ny;
const tangX=-ov.ny, tangY=ov.nx;
const sx=Math.max(12,Math.min($replay.W-12,$buildings.player.x+tangX*tx2));
const sy=Math.max(12,Math.min($replay.H-12,$buildings.player.y+tangY*tx2));
if(!onBuilding(sx,sy,16)){$buildings.player.x=sx;$buildings.player.y=sy;}
else{
const sx2=Math.max(12,Math.min($replay.W-12,$buildings.player.x-tangX*tx2));
const sy2=Math.max(12,Math.min($replay.H-12,$buildings.player.y-tangY*tx2));
if(!onBuilding(sx2,sy2,16)){$buildings.player.x=sx2;$buildings.player.y=sy2;}
else{
$buildings.player.x=Math.max(12,Math.min($replay.W-12,$buildings.player.x+ov.nx*(ov.depth+2)));
$buildings.player.y=Math.max(12,Math.min($replay.H-12,$buildings.player.y+ov.ny*(ov.depth+2)));
}
}
}
}
$buildings.player.angle=Math.atan2($buildings.mouse.y-$buildings.player.y,$buildings.mouse.x-$buildings.player.x);
if(!$core.isMobile) $buildings.player.gp+=0.07;
$buildings.allies.forEach(a=>{
if(!a.alive)return;
const da=Math.hypot($buildings.player.x-a.x,$buildings.player.y-a.y);
const minR=20;
if(da<minR&&da>0){
const pushA=Math.atan2($buildings.player.y-a.y,$buildings.player.x-a.x);
const push=(minR-da)*0.5+1;
const px=$buildings.player.x+Math.cos(pushA)*push, py=$buildings.player.y+Math.sin(pushA)*push;
if(!onBuilding(px,py,8)){$buildings.player.x=px;$buildings.player.y=py;}
else if(!onBuilding(px,$buildings.player.y,8)){$buildings.player.x=px;}
else if(!onBuilding($buildings.player.x,py,8)){$buildings.player.y=py;}
const ax2=a.x-Math.cos(pushA)*push, ay2=a.y-Math.sin(pushA)*push;
if(!onBuilding(ax2,ay2,12)){a.x=ax2;a.y=ay2;}
else if(!onBuilding(ax2,a.y,12)){a.x=ax2;}
else if(!onBuilding(a.x,ay2,12)){a.y=ay2;}
}
});
}
function updatePlayer2(){
if(!$replay.coopEnabled||!$replay.player2) return;
const p2=$replay.player2;
if($replay.p2Down){
if(!$replay.p1Down&&Math.hypot($buildings.player.x-p2.x,$buildings.player.y-p2.y)<40){
$replay.p2ReviveTimer++;
if($replay.p2ReviveTimer>=$replay.REVIVE_FRAMES) reviveP2();
} else { $replay.p2ReviveTimer=Math.max(0,$replay.p2ReviveTimer-2); }
updateCoopHUD(); return;
}
if($replay.p1Down){
if(Math.hypot(p2.x-$buildings.player.x,p2.y-$buildings.player.y)<40){
$replay.p1ReviveTimer++;
if($replay.p1ReviveTimer>=$replay.REVIVE_FRAMES) reviveP1();
} else { $replay.p1ReviveTimer=Math.max(0,$replay.p1ReviveTimer-2); }
}
const baseSpd=($replay.selectedChar2==='commando'?4.5:$replay.selectedChar2==='elite'?3.2:$replay.selectedChar2==='heavy'?2.8:$replay.selectedChar2==='sniper'?4.2:$replay.selectedChar2==='medic'?3.6:$replay.selectedChar2==='alien'?5.0:3.8);
const spd=baseSpd*(p2.speedTimer>0?1.7:1);
const dv={x:0,y:0};
if($replay.p2Keys['KeyI'])dv.y-=spd;
if($replay.p2Keys['KeyK'])dv.y+=spd;
if($replay.p2Keys['KeyJ'])dv.x-=spd;
if($replay.p2Keys['KeyL'])dv.x+=spd;
if(dv.x||dv.y){
const mag=Math.hypot(dv.x,dv.y);
p2.vx=(dv.x/mag)*spd; p2.vy=(dv.y/mag)*spd;
p2.walkT+=0.18;
p2.angle=Math.atan2(dv.y,dv.x);
} else { p2.vx=0; p2.vy=0; }
if(!dv.x&&!dv.y){
let nearest=null,minD=Infinity;
const _p2Targets=_getAliveEnemies();
for(const e of _p2Targets){ const d=Math.hypot(e.x-p2.x,e.y-p2.y); if(d<minD){minD=d;nearest=e;} }
if(!nearest||minD>400){
if($psycho2.helicopter&&$psycho2.helicopter.alive){ const d=Math.hypot($psycho2.helicopter.x-p2.x,$psycho2.helicopter.y-p2.y); if(d<minD){minD=d;nearest=$psycho2.helicopter;} }
if($psycho2.alienShip&&$psycho2.alienShip.alive){ const d=Math.hypot($psycho2.alienShip.x-p2.x,$psycho2.alienShip.y-p2.y); if(d<minD){minD=d;nearest=$psycho2.alienShip;} }
if($psycho2.fighterJet&&$psycho2.fighterJet.alive){ const d=Math.hypot($psycho2.fighterJet.x-p2.x,$psycho2.fighterJet.y-p2.y); if(d<minD){minD=d;nearest=$psycho2.fighterJet;} }
if($psycho2.spiderTank&&$psycho2.spiderTank.alive){ const d=Math.hypot($psycho2.spiderTank.x-p2.x,$psycho2.spiderTank.y-p2.y); if(d<minD){minD=d;nearest=$psycho2.spiderTank;} }
for(const c of $psycho2.armoredCars){ if(c.alive){ const d=Math.hypot(c.x-p2.x,c.y-p2.y); if(d<minD){minD=d;nearest=c;} } }
}
if(nearest) p2.angle=Math.atan2(nearest.y-p2.y,nearest.x-p2.x);
}
const nx=Math.max(12,Math.min($replay.W-12,p2.x+p2.vx));
const ny=Math.max(12,Math.min($replay.H-12,p2.y+p2.vy));
if(!onBuilding(nx,ny,16)){p2.x=nx;p2.y=ny;}
else if(!onBuilding(nx,p2.y,16)){p2.x=nx;}
else if(!onBuilding(p2.x,ny,16)){p2.y=ny;}
p2.sc=Math.max(0,(p2.sc||0)-1);
if(p2.speedTimer>0) p2.speedTimer--;
if(p2.rapidTimer>0) p2.rapidTimer--;
if($replay.selectedChar2==='medic'&&$buildings.tick%180===0&&p2.hp<p2.maxHp) p2.hp=Math.min(p2.maxHp,p2.hp+5);
if($replay.p2Reloading){
$replay.p2ReloadTimer++;
if($replay.p2ReloadTimer>=Math.floor($buildings.WEAPONS[$replay.p2CurWep].reload)){
$replay.p2Reloading=false;$replay.p2ReloadTimer=0;$replay.p2Ammo[$replay.p2CurWep]=$buildings.WEAPONS[$replay.p2CurWep].ammo;
}
}
if(p2.sc<=0&&!$replay.p2Reloading&&$replay.p2Ammo[$replay.p2CurWep]>0){
let hasTarget=false;
const _p2FireT=_getAliveEnemies();
for(const e of _p2FireT){ if(Math.hypot(e.x-p2.x,e.y-p2.y)<320){hasTarget=true;break;} }
if(!hasTarget){
if($psycho2.helicopter&&$psycho2.helicopter.alive&&Math.hypot($psycho2.helicopter.x-p2.x,$psycho2.helicopter.y-p2.y)<320) hasTarget=true;
else if($psycho2.alienShip&&$psycho2.alienShip.alive&&Math.hypot($psycho2.alienShip.x-p2.x,$psycho2.alienShip.y-p2.y)<320) hasTarget=true;
else if($psycho2.fighterJet&&$psycho2.fighterJet.alive&&Math.hypot($psycho2.fighterJet.x-p2.x,$psycho2.fighterJet.y-p2.y)<320) hasTarget=true;
else if($psycho2.spiderTank&&$psycho2.spiderTank.alive&&Math.hypot($psycho2.spiderTank.x-p2.x,$psycho2.spiderTank.y-p2.y)<320) hasTarget=true;
}
if(hasTarget) fireP2();
}
if($replay.p2Keys['_grenadePress']){
$replay.p2Keys['_grenadePress']=false;
if($buildings.grenadeCount>0){
$buildings.grenadeCount=Math.max(0,$buildings.grenadeCount-1);
updateGrenadeHUD();
let tx=p2.x+Math.cos(p2.angle)*180, ty=p2.y+Math.sin(p2.angle)*180;
const _p2GrenT=_getAliveEnemies();
let nn=null,nd=Infinity;
for(const e of _p2GrenT){const d=Math.hypot(e.x-p2.x,e.y-p2.y);if(d<nd){nd=d;nn=e;}}
if($psycho2.helicopter&&$psycho2.helicopter.alive){const d=Math.hypot($psycho2.helicopter.x-p2.x,$psycho2.helicopter.y-p2.y);if(d<nd){nd=d;nn=$psycho2.helicopter;}}
if(nn){tx=nn.x;ty=nn.y;}
$buildings.grenades.push({x:p2.x,y:p2.y,tx,ty,speed:8,spin:0,fuse:28,life:1});
audioManager.fire('grenade_throw');
}
}
for(let i=$buildings.powerups.length-1;i>=0;i--){
const pu=$buildings.powerups[i];
if(Math.hypot(p2.x-pu.x,p2.y-pu.y)<20){ applyPowerupToP2(pu); $buildings.powerups.splice(i,1); }
}
updateCoopHUD();
}
function applyPowerupToP2(pu){
const p2=$replay.player2;
if(!p2) return;
const t=pu.type;
if(t==='health'){p2.hp=Math.min(p2.maxHp,p2.hp+30);audioManager.pickup('health');}
else if(t==='shield'){p2.shield=300;audioManager.pickup('shield');}
else if(t==='rapid'){p2.rapidTimer=300;audioManager.pickup('rapid');}
else if(t==='speed'){p2.speedTimer=240;audioManager.pickup('speed');}
else if(t==='ammo'){$replay.p2Ammo[$replay.p2CurWep]=$buildings.WEAPONS[$replay.p2CurWep].ammo;audioManager.pickup('ammo');}
else if(t==='grenade'){$buildings.grenadeCount=Math.min($buildings.grenadeCount+2,9);updateGrenadeHUD();}
else if(t&&t.startsWith('weapon_')){
const wn=t.replace('weapon_','');
if($buildings.WEAPONS[wn]&&!$buildings.WK.includes(wn)){$buildings.WK.push(wn);$replay.p2Ammo[wn]=$buildings.WEAPONS[wn].ammo;}
$replay.p2CurWep=wn;
}
showPickupMsg('P2: '+t.toUpperCase(),'#00aaff');
}
function fireP2(){
if(!$replay.player2||$replay.p2Down) return;
const p2=$replay.player2;
const w=$buildings.WEAPONS[$replay.p2CurWep];
p2.sc=w.cd*(p2.rapidTimer>0?0.5:1)|0;
const base=p2.angle;
const dmg=($replay.p2CurWep==='rifle'?2:1)*(p2.rapidTimer>0?1.5:1);
if(w.wt==='flame'){
for(let i=0;i<2;i++){
const a=base+(Math.random()-0.5)*w.spread;
const life=Math.floor(w.range/w.spd*(0.7+Math.random()*0.5));
$buildings.bullets.push({x:p2.x+Math.cos(base)*14,y:p2.y+Math.sin(base)*14,vx:Math.cos(a)*w.spd*(0.6+Math.random()*0.7),vy:Math.sin(a)*w.spd*(0.6+Math.random()*0.7),own:'player2',life,wt:'flame',col:'#4488ff',dmg:0.9,sz:3+Math.random()*3,fade:life});
}
} else if(w.wt==='rocket'){
$buildings.bullets.push({x:p2.x,y:p2.y,vx:Math.cos(base)*w.spd,vy:Math.sin(base)*w.spd,own:'player2',life:180,wt:'rocket',col:$replay.P2_COL,dmg:8,sz:6,ang:base});
shake(3);
} else if(w.wt==='knife'){
$buildings.bullets.push({x:p2.x,y:p2.y,vx:Math.cos(base)*w.spd,vy:Math.sin(base)*w.spd,own:'player2',life:80,wt:'knife',ang:base,spin:0,stuck:false,sl:0,dmg:3,sz:0});
} else {
for(let i=0;i<(w.pels||1);i++){
const a=base+(Math.random()-0.5)*w.spread;
$buildings.bullets.push({x:p2.x,y:p2.y,vx:Math.cos(a)*w.spd,vy:Math.sin(a)*w.spd,own:'player2',life:120,wt:'bullet',col:$replay.P2_COL,dmg,sz:w.sz});
}
}
$replay.p2Ammo[$replay.p2CurWep]--;
audioManager.fire($replay.p2CurWep);
if($replay.p2Ammo[$replay.p2CurWep]<=0){$replay.p2Reloading=true;$replay.p2ReloadTimer=0;}
}
function reviveP2(){
$replay.p2Down=false;$replay.p2ReviveTimer=0;
$replay.player2.hp=Math.floor($replay.player2.maxHp*0.4);
ptcl($replay.player2.x,$replay.player2.y,$replay.P2_COL,10,4);
floatText($replay.player2.x,$replay.player2.y-40,'P2 REVIVED!',$replay.P2_COL,16);
audioManager.pickup('health');
updateCoopHUD();
}
function reviveP1(){
$replay.p1Down=false;$replay.p1ReviveTimer=0;
$buildings.player.hp=Math.floor($buildings.player.maxHp*0.4);
$buildings.player.sc=0;
ptcl($buildings.player.x,$buildings.player.y,'#aaff00',10,4);
floatText($buildings.player.x,$buildings.player.y-40,'P1 REVIVED!','#aaff00',16);
audioManager.pickup('health');
if($buildings.playerDead){$buildings.playerDead=false;$buildings.state=window.state='playing';}
updateCoopHUD();
}
function updateCoopHUD(){
const wrap=el('p2-hud');
if(!wrap) return;
if($replay.coopEnabled&&$replay.player2){
wrap.style.display='flex';
const pct=Math.max(0,$replay.player2.hp/$replay.player2.maxHp)*100;
const col=pct>50?$replay.P2_COL:pct>25?'#ffaa00':'#ff3300';
const fill=el('p2-hp-fill');
if(fill){fill.style.width=pct+'%';fill.style.background=col;}
const p2rev=el('p2-revive-bar');
if(p2rev){p2rev.style.display=($replay.p2Down&&!$replay.p1Down)?'block':'none';if($replay.p2Down){const f=p2rev.querySelector('.rbar-fill');if(f)f.style.width=($replay.p2ReviveTimer/$replay.REVIVE_FRAMES*100)+'%';}}
const p1rev=el('p1-revive-bar');
if(p1rev){p1rev.style.display=($replay.p1Down&&!$replay.p2Down)?'block':'none';if($replay.p1Down){const f=p1rev.querySelector('.rbar-fill');if(f)f.style.width=($replay.p1ReviveTimer/$replay.REVIVE_FRAMES*100)+'%';}}
const p2dn=el('p2-down-label');if(p2dn)p2dn.style.display=$replay.p2Down?'block':'none';
const p1dn=el('p1-down-label');if(p1dn)p1dn.style.display=$replay.p1Down?'block':'none';
} else {
wrap.style.display='none';
}
}
function updatePlayerStatus(){
if($buildings.player.rapidTimer>0){ $buildings.player.rapidTimer--; if($buildings.player.rapidTimer===0) dcOnRapidState(false); }
if($buildings.player.shield>0)$buildings.player.shield--;
if($buildings.player.speedTimer>0)$buildings.player.speedTimer--;
_tickGodMode();
_tickSpecials();
try{ _tickPerks(); }catch(_e){ if(!window._pkWarned){ window._pkWarned=1; console.warn('[perk] tick', _e); } }
if($replay.selectedChar==='medic' && $buildings.tick%180===0 && $buildings.player.hp < $buildings.player.maxHp){ $buildings.player.hp=Math.min($buildings.player.maxHp,$buildings.player.hp+5); updateHP(); }
if(($psycho2.playerUpgrades.hpRegen||$profiler._shopHpRegen) && $buildings.tick%600===0 && $buildings.player.hp < $buildings.player.maxHp){ $buildings.player.hp=Math.min($buildings.player.maxHp,$buildings.player.hp+1); updateHP(); }
{const _cl=$buildings._synClouds;
if(_cl&&_cl.length){for(let _ci=_cl.length-1;_ci>=0;_ci--){const c=_cl[_ci];c.life--;if(c.life<=0){_cl.splice(_ci,1);continue;}
if(c.life%15===0){const E=$buildings.enemies;for(let i=0;i<E.length;i++){const q=E[i];if(!q.alive)continue;if(Math.hypot(q.x-c.x,q.y-c.y)<c.r){if(!q.poisoned){q.poisoned=3;q.poisonTimer=0;}else q.poisoned=Math.max(q.poisoned,2);}}}}}}
if($buildings.reloading){
$buildings.reloadTimer++;
const reloadFrames=Math.floor($buildings.WEAPONS[$buildings.curWep].reload*Math.max(0.4,1-$buildings.wepUpgrades[$buildings.curWep].reload*0.2));
if($buildings.reloadTimer===Math.max(2,Math.floor(reloadFrames*0.5)))audioManager.reloadMid($buildings.curWep);
if($buildings.reloadTimer>=reloadFrames){$buildings.reloading=false;$buildings.reloadTimer=0;floatText($buildings.player.x,$buildings.player.y-36,'RELOADED','#aaff00',11);($buildings._impactRings=$buildings._impactRings||[]).push({x:$buildings.player.x,y:$buildings.player.y,r:8,maxR:36,life:12,maxLife:12});$buildings.wepAmmo[$buildings.curWep]=$buildings.WEAPONS[$buildings.curWep].ammo+($buildings.wepUpgrades[$buildings.curWep].ammo||0);updateHUD();audioManager.reloadDone($buildings.curWep);
if(window._legendaryWeps && window._legendaryWeps.has('rifle') && $buildings.curWep==='rifle' && $buildings.state==='playing'){
_gst(()=>_triggerLegendaryEffect('rifle'), 100);
}
}
}
if($buildings.wepAmmo[$buildings.curWep] === 0 && !$buildings.reloading){
const currentIdx = $buildings.WK.indexOf($buildings.curWep);
for(let i = 1; i < $buildings.WK.length; i++){
const nextIdx = (currentIdx + i) % $buildings.WK.length;
if($buildings.wepAmmo[$buildings.WK[nextIdx]] > 0){
switchWep(nextIdx);
break;
}
}
}
}
const MAX_BULLETS_POOL_SIZE = 320;
const _bulletFreeList = [];
function _poolReturnBullet(obj){
}
function _poolTakeBullet(props){ return props; }
function _attachBulletPool(arr){ return arr; }
function _removeBullet(idx){
const last = $buildings.bullets.length - 1;
const removed = $buildings.bullets[idx];
if(idx !== last) $buildings.bullets[idx] = $buildings.bullets[last];
$buildings.bullets.pop();
_poolReturnBullet(removed);
}
function updateProjectiles(){
const MAX_BULLETS = $core.isUltraLow ? 90 : $core.isLowEndDesktop ? 130 : $core.isMobile ? 180 : 300;
const PLAYER_BULLET_CAP = $core.isUltraLow ? 55 : $core.isLowEndDesktop ? 85 : $core.isMobile ? 120 : 200;
const BULLET_TRIM_MARGIN = 40;
if($buildings.bullets.length > MAX_BULLETS + BULLET_TRIM_MARGIN){
const targetTotal = MAX_BULLETS - BULLET_TRIM_MARGIN;
const playerBullets = [];
const enemyBullets = [];
for(let i=0;i<$buildings.bullets.length;i++){
($buildings.bullets[i].own==='enemy' ? enemyBullets : playerBullets).push($buildings.bullets[i]);
}
const enemyAllowed = targetTotal - Math.min(playerBullets.length, PLAYER_BULLET_CAP);
const trimmedEnemy = enemyBullets.length > enemyAllowed
? enemyBullets.slice(enemyBullets.length - enemyAllowed)
: enemyBullets;
const playerAllowed = targetTotal - trimmedEnemy.length;
const trimmedPlayer = playerBullets.length > playerAllowed
? playerBullets.slice(playerBullets.length - playerAllowed)
: playerBullets;
const droppedEnemy = enemyBullets.length > enemyAllowed ? enemyBullets.slice(0, enemyBullets.length - enemyAllowed) : [];
const droppedPlayer = playerBullets.length > playerAllowed ? playerBullets.slice(0, playerBullets.length - playerAllowed) : [];
droppedEnemy.forEach(_poolReturnBullet);
droppedPlayer.forEach(_poolReturnBullet);
$buildings.bullets = _attachBulletPool(trimmedPlayer.concat(trimmedEnemy));
}
{
const ENEMY_BULLET_CAP = $core.isUltraLow ? 50 : $core.isLowEndDesktop ? 70 : $core.isMobile ? 90 : 120;
const _bl=$buildings.bullets; let _ne=0;
for(let i=0;i<_bl.length;i++) if(_bl[i].own==='enemy') _ne++;
if(_ne>ENEMY_BULLET_CAP){
const px=$buildings.player.x, py=$buildings.player.y;
const eb=_bl.filter(b=>b.own==='enemy'&&!b.isWeb);
eb.sort((a,b)=>(Math.hypot(b.x-px,b.y-py))-(Math.hypot(a.x-px,a.y-py)));
const cull=new Set(eb.slice(0,_ne-ENEMY_BULLET_CAP));
$buildings.bullets=_attachBulletPool(_bl.filter(b=>!cull.has(b)));
}
}
for(let i=$buildings.grenades.length-1;i>=0;i--){
const g=$buildings.grenades[i];
g.spin+=0.15;
const dx2=g.tx-g.x,dy2=g.ty-g.y,d2=Math.hypot(dx2,dy2);
if(d2>g.speed){g.x+=dx2/d2*g.speed;g.y+=dy2/d2*g.speed;}else{g.x=g.tx;g.y=g.ty;}
g.fuse--;
if(g.fuse<=0){grenadeExplode(g);$buildings.grenades.splice(i,1);}
}
for(let i=$buildings.debrisArr.length-1;i>=0;i--){if(--$buildings.debrisArr[i].life<=0)$buildings.debrisArr.splice(i,1);}
if($buildings.debrisArr.length>$bosses.DEBRIS_CAP) $buildings.debrisArr.splice(0,$buildings.debrisArr.length-$bosses.DEBRIS_CAP);
const MAX_RUBBLE_TOTAL = ($core.isUltraLow || $core.isLowEndDesktop) ? 30 : $core.isMobile ? 60 : 140;
if ($buildings.rubblePieces.length > MAX_RUBBLE_TOTAL) {
$buildings.rubblePieces.splice(0, $buildings.rubblePieces.length - MAX_RUBBLE_TOTAL);
}
for(let i=$buildings.rubblePieces.length-1;i>=0;i--){
const rp=$buildings.rubblePieces[i];
if(rp.settled) continue;
rp.life--;
rp.x+=rp.vx; rp.y+=rp.vy;
rp.vx*=0.88; rp.vy*=0.88;
rp.rot+=rp.vr;
if(!rp.dmgDone && Math.hypot(rp.vx,rp.vy)>1.2){
for(let ei=0;ei<$buildings.enemies.length;ei++){
const ee=$buildings.enemies[ei];
if(!ee.alive) continue;
if(Math.hypot(ee.x-rp.x,ee.y-rp.y)<(ee.w||20)*0.5+rp.sz){
ee.hp-=3; ee.hitFlash=4; rp.dmgDone=true;
floatText(ee.x,ee.y-16,'-3','#cc9988',9);
if(ee.hp<=0) killEnemy(ee);
break;
}
}
}
if(rp.life<=0){
rp.settled=true; rp.vx=0; rp.vy=0;
if($buildings.rubblePieces.filter(r2=>r2.settled).length>$psycho1.MAX_SETTLED_RUBBLE){
const _firstSettled=$buildings.rubblePieces.findIndex(r2=>r2.settled);
if(_firstSettled>=0) $buildings.rubblePieces.splice(_firstSettled,1);
}
}
}
for(let i=$buildings.floatingTexts.length-1;i>=0;i--){const ft=$buildings.floatingTexts[i];ft.life--;ft.y+=ft.vy;if(ft.scale!==undefined){ft.scale+=ft.scaleV||0;if(ft.scale<1){ft.scale=1;ft.scaleV=0;}}if(ft.life<=0)$buildings.floatingTexts.splice(i,1);}
for(let _bi=$buildings.bullets.length-1;_bi>=0;_bi--){const b=$buildings.bullets[_bi];
if ($psycho1._psychoActive && (b.own === 'enemy' || b.own === 'ally')) continue;
if (b._psycho) { continue; }
{const _k=(window._dt||1)*(b.own==='enemy'?(window._bt||1):1);b.life--;b.x+=b.vx*_k;b.y+=b.vy*_k;}
if(b.homing && b.own==='player' && $buildings.tick%3===0){
let nearest=null, minD=Infinity;
const _homingTargets=_getAliveEnemies();
for(const e of _homingTargets){ const d=Math.hypot(e.x-b.x,e.y-b.y); if(d<200&&d<minD){minD=d;nearest=e;} }
if(nearest){
const ha=Math.atan2(nearest.y-b.y,nearest.x-b.x);
const spd=Math.hypot(b.vx,b.vy);
const curA=Math.atan2(b.vy,b.vx);
let da=ha-curA; while(da>Math.PI)da-=Math.PI*2; while(da<-Math.PI)da+=Math.PI*2;
const na=curA+Math.sign(da)*Math.min(0.12,Math.abs(da));
b.vx=Math.cos(na)*spd; b.vy=Math.sin(na)*spd;
}
}
if(b.own==='player'&&(($buildings.tick+_bi)&($core.isMobile?3:1))===0){const _tc=_synTrail();if(_tc)ptclQ(b.x,b.y,_tc[(Math.random()*_tc.length)|0],1,1.4);}
if(b.bounces>0){
if(b.x<0||b.x>$replay.W){ b.vx=-b.vx; b.x=Math.max(0,Math.min($replay.W,b.x)); b.bounces--; _synOnBounce(b); }
if(b.y<0||b.y>$replay.H){ b.vy=-b.vy; b.y=Math.max(0,Math.min($replay.H,b.y)); b.bounces--; _synOnBounce(b); }
}
if(b.wt==='knife'&&!b.stuck)b.spin+=0.25;
if(b.wt==='flame'){b.sz=Math.max(1,b.sz*(0.96));b.col=b.life/b.fade>0.5?'#ff6600':'#cc2200';}
if(b.wt==='knife'&&b.stuck){b.sl--;if(b.sl<=0){_removeBullet(_bi);}continue;}
if(b.wt==='rocket'){
ptcl(b.x-b.vx*0.5,b.y-b.vy*0.5,'#ff6600',2,2);
ptcl(b.x-b.vx*0.8,b.y-b.vy*0.8,'#888',1,1);
}
if(b.life<=0||b.x<-40||b.x>$replay.W+40||b.y<-40||b.y>$replay.H+40){
_removeBullet(_bi);continue;
}
if(b.wt==='rocket'&&onBuilding(b.x,b.y)){
if(b.own==='player'||b.own==='player2'||b.own==='ally'){
const _hb=findBuildingAt(b.x,b.y);
if(_hb) damageBuilding(_hb,12,b.x,b.y);
}
_removeBullet(_bi);continue;}
if(b.own==='player'||b.own==='ally'||b.own==='player2'){
if(b.wt!=='knife'&&onBuilding(b.x,b.y)){
const _hb=findBuildingAt(b.x,b.y);
if(_hb) damageBuilding(_hb,Math.max(2,Math.ceil((b.dmg||2)*1.4)),b.x,b.y);
if(b.own==='player' && b.wt!=='flame' && !$core.isUltraLow) ptcl(b.x,b.y,'#ddccaa',1,2);   /* wall-hit spark */
_removeBullet(_bi);continue;}
const _bcx=b.x,_bcy=b.y;
const _bSpd=Math.abs(b.vx)+Math.abs(b.vy);
const _bCullSq=(_bSpd+68)*(+_bSpd+68);
const _bTargets=_gridQuery(b.x,b.y,68+Math.abs(b.vx)+Math.abs(b.vy));
for(let e of _bTargets){
if(b._pierced&&b._pierced.has(e))continue;
const _edx=e.x-_bcx,_edy=e.y-_bcy;
const _edSq=_edx*_edx+_edy*_edy;
if(_edSq>_bCullSq)continue;
const _hitR=e.w/2+4;
if(_edSq<_hitR*_hitR){
if(b.wt==='rocket'&&!b.exploded){b.exploded=true;rocketExplode(b);_removeBullet(_bi);break;}
let _hitDmg = b.dmg||1;
if($buildings.player.godModeTimer>0 && b.own==='player'){ _hitDmg = _hitDmg*3; }
if(b.own==='player' && window.__perkHit){ try{ _hitDmg = window.__perkHit(b,e,_hitDmg); }catch(_e){} }
{ const _hk=$enemies.get(e.type); if(_hk.onBulletHit){ const _r=_hk.onBulletHit(e,b,_hitDmg); if(_r===null){ _removeBullet(_bi); break; } _hitDmg=_r; } }
if(e._hpHitTick!==$buildings.tick){ e._hpHitTick=$buildings.tick; e._hpBeforeHit=e.hp; }
e.hp-=_hitDmg;
if(b.own==='player' && b.wt!=='flame'){
_hitmarkUntil = performance.now() + 90;   /* crosshair hitmarker */
if($core.isMobile){   /* touch: flash the aim-stick knob instead */
const _k=document.getElementById('aim-joy-knob');
if(_k){ _k.style.boxShadow='0 0 0 2px #fff, 0 0 14px #fff'; clearTimeout(_k._hmt); _k._hmt=setTimeout(()=>{ _k.style.boxShadow=''; },70); }
}
}
if(!e.boss && b.own==='player'){
const _kbA=Math.atan2(b.vy,b.vx);
const _kb=Math.min(3.4, 0.6+_hitDmg*0.4);
e.kbx=(e.kbx||0)+Math.cos(_kbA)*_kb;
e.kby=(e.kby||0)+Math.sin(_kbA)*_kb;
}
hitSparks(b);
const _hw=($enemies.get(e.type).ai.heavyHit||e.boss)?1:0;
audioManager.at(b.x,()=>audioManager.hit(_hw));
if(b.own==='player'&&$buildings.curWep==='minigun'){ if($buildings.tick%4===0) shake(1.6); }
else shake(1+Math.min(4.5,_hitDmg*0.18), b.vx, b.vy);   /* damage-scaled + pushed along the bullet */
if(_hw&&!$core.isMobile){ ($buildings._impactRings=$buildings._impactRings||[]).push({x:b.x,y:b.y,r:4,maxR:22,life:10,maxLife:10}); }
e.hitFlash = Math.max(e.hitFlash||0, 5);
if(b.own==='player'){ hitJuice(e,_hitDmg,b.x,b.y,e.hp<=0); }
if(b.napalm && !e.boss){ e._burnTicks=(e._burnTicks||0)+6; e._burnDmg=2; }
if(b._t3slow && b.own==='player' && !e.boss){
const _slowR = 80;
for(const _se of _getAliveEnemies()){
const _sd = Math.hypot(_se.x-b.x,_se.y-b.y);
if(_sd < _slowR){ _se._slowTicks=(_se._slowTicks||0)+30; }
}
ptclQ(b.x,b.y,'#00ffcc',$core.isMobile?3:6,3);
}
if(b._t3explode && b.own==='player' && !e.boss){
const _mr=45;
for(const _me of _getAliveEnemies()){
const _md=Math.hypot(_me.x-b.x,_me.y-b.y);
if(_md<_mr && _me!==e){ const _mdmg=Math.ceil(3*(1-_md/_mr)); _me.hp-=_mdmg; _me.hitFlash=4; if(_me.hp<=0) killEnemy(_me); }
}
ptclQ(b.x,b.y,'#ff3300',$core.isMobile?4:8,5);
$buildings.debrisArr.push({x:b.x,y:b.y,r:_mr*0.7,life:8,maxLife:8,col:'#ff4400'});
}
e.hitFlash = e.boss ? Math.min(4, e.hitFlash||0) : 8;
if(!e.boss){
const _ka=Math.atan2(e.y-b.y,e.x-b.x);
const _comboKb = b.own==='player' ? 1+Math.min(1,$buildings.killStreak/15) : 1;
const _ks=$enemies.get(e.type).ai.knockback*_comboKb;
const _knx=e.x+Math.cos(_ka)*_ks, _kny=e.y+Math.sin(_ka)*_ks;
if(!onBuilding(_knx,_kny,8)){e.x=_knx;e.y=_kny;}
}
const _muts = $psycho2.playerUpgrades.mutations;
if(b.own==='player' && _muts.has('mut_explosive')){
if(!e.boss){
const _er=40;
$buildings.enemies.forEach(_ee=>{ if(_ee===e||!_ee.alive||_ee.boss)return; const _ed=Math.hypot(_ee.x-b.x,_ee.y-b.y); if(_ed<_er){_ee.hp-=Math.ceil(2*(1-_ed/_er));_ee.hitFlash=4;if(_ee.hp<=0)killEnemy(_ee);} });
}
if(_synLv()<2){ptclQ(b.x,b.y,'#ff8800',2,5);}else{ptclQ(b.x,b.y,'#ff8800',$core.isMobile?3:6,5);
ptclQ(b.x,b.y,'#ffcc00',$core.isMobile?2:4,3);}
if(!e.boss && $buildings.debrisArr.length<(_synLv()===0?3:_synLv()<2?6:40)) $buildings.debrisArr.push({x:b.x,y:b.y,r:28,life:10,maxLife:10,col:'#ff6600'});
}
if(b.own==='player' && _muts.has('mut_pierce') && _muts.has('mut_explosive') && b.pierce && b._pierced && b._pierced.size >= 1 && !e.boss){
b._fragDeferred = { x: e.x, y: e.y };
}
if(b.own==='player' && _muts.has('mut_chain')&&!b._chained){
let _cn=null,_cd=Infinity;
$buildings.enemies.forEach(_ce=>{ if(_ce===e||!_ce.alive)return; const _d=Math.hypot(_ce.x-e.x,_ce.y-e.y); if(_d<140&&_d<_cd){_cd=_d;_cn=_ce;} });
if(_cn){
_cn.hp-=Math.ceil((b.dmg||1)*0.6);_cn.hitFlash=8;
if(_muts.has('mut_magnet')){
let _cn2=null,_cd2=Infinity;
$buildings.enemies.forEach(_ce=>{ if(_ce===e||_ce===_cn||!_ce.alive)return; const _d=Math.hypot(_ce.x-_cn.x,_ce.y-_cn.y); if(_d<160&&_d<_cd2){_cd2=_d;_cn2=_ce;} });
if(_cn2){ _cn2.hp-=Math.ceil((b.dmg||1)*0.35); _cn2.hitFlash=5; ptclQ(_cn2.x,_cn2.y,'#aaffff',$core.isMobile?3:6,3); if(_cn2.hp<=0)killEnemy(_cn2); }
}
if(__fxLv()>1) $buildings.floatingTexts.push({x:(_cn.x+e.x)/2,y:(_cn.y+e.y)/2-10,text:'▸',col:'#ffff00',size:16,life:25,vy:-0.3,scale:1,scaleV:0});
ptclQ(_cn.x,_cn.y,'#ffff00',_synLv()<2?2:$core.isMobile?4:8,4);
if(_cn.hp<=0)killEnemy(_cn);
}
}
if(b.own==='player' && _muts.has('mut_poison')&&!e.poisoned){
e.poisoned=3; e.poisonTimer=0;
ptclQ(b.x,b.y,'#88ff44',_synLv()<2?2:$core.isMobile?4:8,3);
if(__fxLv()>1) floatText(e.x,e.y-18,'X','#88ff44',14);
}
if(b.own==='player' && _muts.has('mut_lifesteal')&&e.hp>0){
$buildings.player.hp=Math.min($buildings.player.maxHp,$buildings.player.hp+0.05);
if(_muts.has('mut_poison') && e.poisoned){
$buildings.player.hp=Math.min($buildings.player.maxHp,$buildings.player.hp+0.03);
}
}
if(b.own==='player' && _muts.has('mut_multishot')&&b._shotIdx&&b._shotIdx%5===0&&!b._chained&&!b._burstFired){
b._burstFired = true;
for(let _s=-1;_s<=1;_s+=2){
const _sa=Math.atan2(b.vy,b.vx)+_s*0.4;
const _spd2=Math.hypot(b.vx,b.vy);
const _burstExplode = _muts.has('mut_explosive');
if($buildings.bullets.length < (_synLv()===0?70:_synLv()<2?110:280))
$buildings.bullets.push({x:b.x,y:b.y,vx:Math.cos(_sa)*_spd2,vy:Math.sin(_sa)*_spd2,own:'player',life:60,wt:'bullet',col:(_muts.has('mut_magnet')?_SYN_COLS.multishot_magnet[(_s+1)&3]:'#ffffaa'),homing:_muts.has('mut_magnet')||undefined,pierce:_muts.has('mut_pierce')||undefined,dmg:Math.ceil((b.dmg||1)*0.5),sz:b.sz*1.4,_chained:true,_shotIdx:b._shotIdx,_burstExplode});
}
_synOnBurst(b,_muts);
if($buildings.settingPerfMode||__fxLv()<2){$buildings._cvFlashColor='rgba(255,255,150,0.12)';$buildings._cvFlash=3;}else{$replay.mFlash.style.background='rgba(255,255,150,0.18)';$replay.mFlash.style.opacity='0.6';setTimeout(()=>$replay.mFlash.style.opacity='0',60);}
}
if(b.own==='player'&&_muts.size>1)_synOnHit(b,e,_muts);
if(e.hp<=0){
const _isEliteKill = $enemies.get(e.type).ai.eliteKill;
if(b.own==='player' && _isEliteKill){ audioManager._playEliteKillThud(); }
killEnemy(e);
if(b.own==='player' && _muts.has('mut_lifesteal')){
if(Math.random()<0.35){ $buildings.player.hp=Math.min($buildings.player.maxHp,$buildings.player.hp+1); updateHP();
floatText($buildings.player.x,$buildings.player.y-30,'+1 HP','#ff0044',12); }
}
} else if(e.boss) $replay.bBarF.style.width=(e.hp/e.maxHp*100)+'%';
if(b.wt==='knife'){b.stuck=true;b.sl=40;}
if(b.pierce){ b._pierced=(b._pierced||new Set()); b._pierced.add(e); continue; }
_removeBullet(_bi);continue;
}
}
}
if(b.own==='enemy'){
if(onBuilding(b.x,b.y)){ptcl(b.x,b.y,'#ff6600',2,1);_removeBullet(_bi);continue;}
for(let a of $buildings.allies){
if(!a.alive)continue;
const da=Math.hypot(a.x-b.x,a.y-b.y);
if(da<14){
a.hp-=b.dmg||1;
ptcl(b.x,b.y,'#00ffcc',3,2);
if(a.hp<=0){a.alive=false;ptcl(a.x,a.y,'#00ffcc',10,3);shake(4);}
_removeBullet(_bi);continue;
}
}
if($replay.coopEnabled&&$replay.player2&&!$replay.p2Down){
const dp2=Math.hypot($replay.player2.x-b.x,$replay.player2.y-b.y);
if(dp2<15){
let dmg2=b.dmg||1;
if($replay.player2.shield>0){$replay.player2.shield=Math.max(0,$replay.player2.shield-dmg2*30);ptcl(b.x,b.y,'#00ccff',5,2);dmg2=0;}
if(dmg2>0){$replay.player2.hp-=dmg2;ptcl($replay.player2.x,$replay.player2.y,'#0066ff',4,2);shake(4);
if($replay.player2.hp<=0) $props.triggerP2Down();}
updateCoopHUD();
_removeBullet(_bi);continue;
}
}
const d=Math.hypot($buildings.player.x-b.x,$buildings.player.y-b.y);
if(d<15 && !($buildings.player._iframes>0)){
let dmg=(b.dmg||1)*$buildings._hardTune().dmg*(1+Math.min(40,b.vreth?Math.max($buildings.wave,27):$buildings.wave)*0.035); /* BALANCE v106: enemy bullet damage scales with wave (Vreth aliens: never below wave 27) */
if($buildings.player.shield>0){$buildings.player.shield=Math.max(0,$buildings.player.shield-dmg*30);ptcl(b.x,b.y,'#00ccff',5,2);dmg=0;}
if(dmg>0){$buildings.lastDamageSource='enemy bullet';$buildings._hitAng=Math.atan2(-b.vy,-b.vx);$buildings._hitAngTick=$buildings.tick;if($buildings._mutCfg&&$buildings._mutCfg.suddenDeath){$buildings.player.hp=0;updateHP();$props.triggerPlayerDeath('enemy bullet');}else{$buildings.player.hp-=dmg;updateHP();if(!$core.isVeryLow){if($buildings.settingPerfMode){$buildings._cvFlashColor='rgba(255,0,0,0.14)';$buildings._cvFlash=4;}else{$replay.dFlash.style.opacity='0.4';setTimeout(()=>$replay.dFlash.style.opacity='0',100);}}ptcl($buildings.player.x,$buildings.player.y,'#ff0033',4,2);shake(6,b.vx,b.vy);vibrate(40);const _bkA=Math.atan2(b.vy,b.vx);$buildings.player.kbx=($buildings.player.kbx||0)+Math.cos(_bkA)*2.5;$buildings.player.kby=($buildings.player.kby||0)+Math.sin(_bkA)*2.5;if($buildings.player.hp<=0)$props.triggerPlayerDeath('enemy bullet');}}
_removeBullet(_bi);continue;
}
}
}
for(let i=$buildings.particles.length-1;i>=0;i--){
const p=$buildings.particles[i];
p.life--;p.x+=p.vx;p.y+=p.vy;p.vx*=0.9;p.vy*=0.9;
if(p.life<=0){ p._alive=false; $buildings.particles[i]=$buildings.particles[$buildings.particles.length-1]; $buildings.particles.pop(); }
}
if($psycho2.playerUpgrades.mutations.has('mut_poison')){
const _poisonTargets=_getAliveEnemies();
for(const e of _poisonTargets){
if(!(e.poisoned>0)) continue;
e.poisonTimer=(e.poisonTimer||0)+1;
if(e.poisonTimer%30===0){
e.hp-=2; e.hitFlash=5;
if(__fxLv()>1) ptcl(e.x,e.y,'#88ff44',$core.isMobile?1:2,2);
if(e.hp<=0){ killEnemy(e); continue; }
else if(e.boss) $replay.bBarF.style.width=(e.hp/e.maxHp*100)+'%';
e.poisoned--;
if(e.poisoned<=0){ e.poisoned=0; e.poisonTimer=0; }
}
}
}
if($profiler._shopNapalm){
const _burnTargets=_getAliveEnemies();
for(const e of _burnTargets){
if(!(e._burnTicks>0)) continue;
e._burnTicks--;
if(e._burnTicks%20===0){
const bd=e._burnDmg||2;
e.hp-=bd; e.hitFlash=4;
ptcl(e.x,e.y,'#ff6600',$core.isMobile?2:4,2);
floatText(e.x,e.y-18,''+bd,'#ff6600',10);
if(e.hp<=0){ killEnemy(e); continue; }
else if(e.boss) $replay.bBarF.style.width=(e.hp/e.maxHp*100)+'%';
}
}
for(const e of _burnTargets){
if(e._slowTicks>0){ e._slowTicks--; if(e._slowTicks%6===0) ptcl(e.x,e.y,'#00ffcc',1,2); }
}
}
}
function _applyEnemyKnockback(){
for(let i=0;i<$buildings.enemies.length;i++){
const e=$buildings.enemies[i];
if(!e.alive||e.boss||!(e.kbx||e.kby))continue;
const pad=(e.w||20)/2;
const nx=Math.max(pad,Math.min($replay.W-pad,e.x+e.kbx)), ny=Math.max(pad,Math.min($replay.H-pad,e.y+e.kby));
if(!onBuilding(nx,ny,pad)){e.x=nx;e.y=ny;}
else if(!onBuilding(nx,e.y,pad)){e.x=nx;e.kby=0;}
else if(!onBuilding(e.x,ny,pad)){e.y=ny;e.kbx=0;}
else{e.kbx=0;e.kby=0;}
e.kbx*=0.72;e.kby*=0.72;
if(Math.abs(e.kbx)<0.05)e.kbx=0;
if(Math.abs(e.kby)<0.05)e.kby=0;
}
}
function _applyPlayerKnockback(){
if(!($buildings.player.kbx||$buildings.player.kby))return;
const nx=$buildings.player.x+$buildings.player.kbx, ny=$buildings.player.y+$buildings.player.kby;
const pad=16;
if(!onBuilding(nx,ny,pad)){$buildings.player.x=Math.max(12,Math.min($replay.W-12,nx));$buildings.player.y=Math.max(12,Math.min($replay.H-12,ny));}
else if(!onBuilding(nx,$buildings.player.y,pad)){$buildings.player.x=Math.max(12,Math.min($replay.W-12,nx));$buildings.player.kby=0;}
else if(!onBuilding($buildings.player.x,ny,pad)){$buildings.player.y=Math.max(12,Math.min($replay.H-12,ny));$buildings.player.kbx=0;}
else{$buildings.player.kbx=0;$buildings.player.kby=0;}
$buildings.player.kbx*=0.72;$buildings.player.kby*=0.72;
if(Math.abs($buildings.player.kbx)<0.05)$buildings.player.kbx=0;
if(Math.abs($buildings.player.kby)<0.05)$buildings.player.kby=0;
}
function _assignPersonality(e){
const r=Math.random();
let cls;
cls=$enemies.get(e.type).ai.personality ? $enemies.get(e.type).ai.personality(r) : undefined;
if(cls===undefined) cls=r<0.28?'aggressive':r<0.58?'flanker':r<0.82?'steady':'cautious';
e._personality=cls;
const sign=Math.random()<0.5?-1:1;
e._orbitSpeed=(0.15+Math.random()*0.35)*sign;
e._rangeBias=cls==='aggressive'?0.72+Math.random()*0.13:cls==='flanker'?0.85+Math.random()*0.10:cls==='cautious'?0.95+Math.random()*0.05:0.90+Math.random()*0.10;
e._rangePhase=Math.random()*Math.PI*2;
e._rangeFreq=0.006+Math.random()*0.010;
e._laneOff=(Math.random()<0.5?-1:1)*(28+Math.random()*62);
e._weaveAmp=8+Math.random()*16;
e._weaveF=0.015+Math.random()*0.02;
e._weaveP=Math.random()*Math.PI*2;
if(cls==='aggressive'){ e._orbitSpeed*=1.30; if(typeof e.spd==='number') e.spd*=1.08; }
else if(cls==='cautious'){ e._orbitSpeed*=0.65; if(typeof e.spd==='number') e.spd*=0.94; }
else if(cls==='flanker'){
const _fs=Math.random()<0.5?-1:1;
e._flankAngle=_fs*(0.6+Math.random()*0.5);
e._orbitSpeed=Math.abs(e._orbitSpeed)*_fs*1.15;
}
if(cls!=='flanker') e._flankAngle=0;
if(typeof e.si==='number'&&e.si>0) e.si=Math.max(8,Math.round(e.si*(0.82+Math.random()*0.40)));
}
function updateEnemyAI(){
_applyEnemyKnockback();
updateBossEntities();
updatePowerups();
$buildings._frameAliveAlliesScratch.length=0;
for(let _a=0;_a<$buildings.allies.length;_a++){ if($buildings.allies[_a].alive) $buildings._frameAliveAlliesScratch.push($buildings.allies[_a]); }
const _frameAliveAllies = $buildings._frameAliveAlliesScratch;
_rebuildSpatialGrid();
let _suppressNearCount = 0;
if($buildings.tick%3===0){
for(let _sn=0;_sn<$buildings.enemies.length;_sn++){
const _sne=$buildings.enemies[_sn];
if(_sne.alive&&!_sne.boss&&Math.hypot(_sne.x-$buildings.player.x,_sne.y-$buildings.player.y)<150) _suppressNearCount++;
}
}
for(let _ei=$buildings.enemies.length-1;_ei>=0;_ei--){const e=$buildings.enemies[_ei];
if(!e.alive){
$buildings.enemies[_ei]=$buildings.enemies[$buildings.enemies.length-1];
$buildings.enemies.length--;
_markEnemiesDirty();
continue;
}
if($props._guidedFreeze && !e.boss) continue;
const _ePrevX=e.x, _ePrevY=e.y;
e.targetTimer=(e.targetTimer||0)-1;
const aliveAllies=_frameAliveAllies;
const targetDead = e.targetRef && e.targetRef!=='player' && e.targetRef!=='player2' && !e.targetRef.alive;
if(e.targetTimer<=0 || !e.targetRef || targetDead){
e.targetTimer=90+Math.floor(Math.random()*60);
const candidateAllies = aliveAllies;
if(candidateAllies.length>0&&Math.random()<0.35){
let _best=null,_bestD=Infinity;
for(let _ci=0;_ci<candidateAllies.length;_ci++){const _cc=candidateAllies[_ci];const _cd=Math.hypot(_cc.x-e.x,_cc.y-e.y);if(_cd<_bestD){_bestD=_cd;_best=_cc;}}
if($replay.coopEnabled&&$replay.player2&&!$replay.p2Down){const _p2d=Math.hypot($replay.player2.x-e.x,$replay.player2.y-e.y);if(_p2d<_bestD){_bestD=_p2d;_best=$replay.player2;}}
const chosen = _best;
e.targetRef = (chosen === $replay.player2) ? 'player2' : chosen;
} else {
e.targetRef='player';
}
}
let tx=$buildings.player.x,ty=$buildings.player.y;
if(e.targetRef==='player2'){
if($replay.coopEnabled && $replay.player2 && !$replay.p2Down){ tx=$replay.player2.x; ty=$replay.player2.y; }
else { e.targetRef='player'; }
} else if(e.targetRef&&e.targetRef!=='player'){
if(e.targetRef.alive){tx=e.targetRef.x;ty=e.targetRef.y;}
else{e.targetRef='player';}
}
const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);
const _edef=$enemies.get(e.type);
e._aimX=tx; e._aimY=ty;
if(e.boss){
e.stuckTimer=(e.stuckTimer||0);
e.stuckX=(e.stuckX===undefined?e.x:e.stuckX);
e.stuckY=(e.stuckY===undefined?e.y:e.stuckY);
if(e.isTank){
_tankAI(e,tx,ty,dx,dy,d);
} else {
const bossPad=e.w/2+6;
let _mtx=tx,_mty=ty;
e._progT=(e._progT||0)+1;
if(e._progD===undefined)e._progD=d;
if(e._detourT>0){
e._detourT--;
_mtx=e.x+e._detDx*220;_mty=e.y+e._detDy*220;
if(e._detourT%8===0&&bossLineClear(e.x,e.y,tx,ty,bossPad)) e._detourT=0;
}else{
if(e._progT>=40){
const _noProg=(e._progD-d)<8&&d>130;
e._progT=0;e._progD=d;
if(_noProg) bossPickDetour(e,tx,ty,bossPad);
}
if(!(e._detourT>0)&&(e.stuckTimer||0)>=10&&d>90) bossPickDetour(e,tx,ty,bossPad);
}
const pos=moveBossToward(e.x,e.y,_mtx,_mty,e.spd,bossPad);
e.x=Math.max(bossPad,Math.min($replay.W-bossPad,pos.x));
e.y=Math.max(bossPad,Math.min($replay.H-bossPad,pos.y));
e.st++;
e._chargeTimer = (e._chargeTimer||0) - 1;
e._chargeCooldown = (e._chargeCooldown||0) - 1;
if(e.hp/e.maxHp < 0.5 && e._chargeCooldown <= 0 && !e._charging){
e._charging = true; e._chargeTimer = 40; e._chargeCooldown = 240;
e._chargeDx = (tx-e.x); e._chargeDy = (ty-e.y);
const _cd = Math.hypot(e._chargeDx,e._chargeDy)||1;
e._chargeDx /= _cd; e._chargeDy /= _cd;
floatText(e.x,e.y-50,'CHARGING!','#ff4400',14);
shake(3);
}
if(e._charging){
e._chargeTimer--;
e.hitFlash = (e.hitFlash||0) + 1;
if(e._chargeTimer <= 0){
for(let _ci=0;_ci<12;_ci++){
const _nx=e.x+e._chargeDx*(8+_ci*6),_ny=e.y+e._chargeDy*(8+_ci*6);
if(!onBuilding(_nx,_ny,e.w/2+6)){e.x=_nx;e.y=_ny;}
}
e.x=Math.max(bossPad,Math.min($replay.W-bossPad,e.x));
e.y=Math.max(bossPad,Math.min($replay.H-bossPad,e.y));
shake(8); e._charging = false;
ptcl(e.x,e.y,'#ff4400',8,5);
}
}
if(e.st>e.si){
for(let i=-1;i<=1;i++){const a=Math.atan2(dy,dx)+i*0.4;$buildings.bullets.push({x:e.x,y:e.y,vx:Math.cos(a)*8,vy:Math.sin(a)*8,own:'enemy',life:400,dmg:2,col:'#ff4400'});}
if(e.hp/e.maxHp < 0.5 && Math.random()<0.4){
for(let _gv=0;_gv<2;_gv++){
const _ga=Math.atan2(dy,dx)+(_gv===0?0.6:-0.6);
const _gd=100+Math.random()*60;
$buildings.grenades.push({x:e.x,y:e.y,tx:e.x+Math.cos(_ga)*_gd,ty:e.y+Math.sin(_ga)*_gd,speed:6,spin:0,fuse:35,life:1});
}
}
e.st=0;
}
}
const movedDist=Math.hypot(e.x-e.stuckX,e.y-e.stuckY);
if(movedDist<2.5){
e.stuckTimer++;
} else {
e.stuckTimer=0;e.stuckX=e.x;e.stuckY=e.y;
}
if(e.stuckTimer>30){
e.stuckTimer=0;
const pad=e.w/2+6;
let freed=unstuckBoss(e.x,e.y,pad);
if(onBuilding(freed.x,freed.y,pad)){
freed=unstuckBoss(freed.x,freed.y,pad+16);
}
e.x=Math.max(pad,Math.min($replay.W-pad,freed.x));
e.y=Math.max(pad,Math.min($replay.H-pad,freed.y));
e.stuckX=e.x;e.stuckY=e.y;
}
e.walkT+=0.16;
} else {
e._lodPhase = (e._lodPhase===undefined ? (_ei & 3) : e._lodPhase + 1);
const _lodSkip = !e._isSuppressing && (d > 700 ? ((e._lodPhase & 3) !== 0) : d > 420 ? ((e._lodPhase & 1) !== 0) : false);
if(_lodSkip){
const _lodSpd = (_edef.ai.speedCap!==undefined ? Math.min(e.spd, _edef.ai.speedCap) : e.spd) * ((e._slowTicks > 0) ? 0.35 : 1);
if(d > 5){
const _lnx=dx/d, _lny=dy/d;
if(!onBuilding(e.x+_lnx*_lodSpd, e.y+_lny*_lodSpd, e.w/2+6)){ e.x+=_lnx*_lodSpd; e.y+=_lny*_lodSpd; }
}
e.walkT+=0.16;
} else {
const _eliteBoost = e._eliteRallyTimer > 0 ? (e._eliteRallyTimer--, 1.6) : 1;
const _slowFactor = (e._slowTicks > 0) ? 0.35 : 1;
const eSpd = (_edef.ai.speedCap!==undefined ? Math.min(e.spd, _edef.ai.speedCap) : e.spd) * _eliteBoost * _slowFactor;
const _nightLevel = $replay.currentEnv === 'night' || ($buildings._mutCfg && $buildings._mutCfg.fogOfWar);
const _wepAware = ($buildings.curWep==='shotgun') ? 60
: ($buildings.curWep==='sniper'||$buildings.curWep==='laser') ? -50
: ($buildings.curWep==='knife') ? 70
: ($buildings.curWep==='smg'||$buildings.curWep==='minigun') ? -15
: 0;
const minDist = (typeof _edef.ai.minDist==='number') ? _edef.ai.minDist : Math.max(50, (_nightLevel ? 130 : 100) + _wepAware);
if(!_edef.ai.noSuppress){
if(_suppressNearCount >= 3){
e._suppressTimer = (e._suppressTimer||0) - 1;
if(e._suppressTimer <= 0){
e._isSuppressing = (_suppressNearCount >= 5) ? (Math.random()<0.5) : (Math.random()<0.3);
e._suppressTimer = 40 + Math.floor(Math.random()*30);
}
} else {
e._isSuppressing = false;
}
}
if(e._personality===undefined) _assignPersonality(e);
if(_edef.think){ _ectx.d=d; _ectx.dx=dx; _ectx.dy=dy; _edef.think(e,_ectx); }
if(_edef.ai.seeksCover && e.hp/e.maxHp < 0.4 && e.hitFlash > 0){
e._coverTimer = 60;
}
if(e._coverTimer > 0){
e._coverTimer--;
let bestBx=null, bestBy=null, bestBd=Infinity;
for(const b of $psycho1.buildings){
const bcx=b.x+b.w/2, bcy=b.y+b.h/2;
const bd=Math.hypot(e.x-bcx,e.y-bcy);
if(bd < bestBd){ bestBd=bd; bestBx=bcx; bestBy=bcy; }
}
if(bestBx!==null && bestBd < 200){
const pos=moveBossToward(e.x,e.y,bestBx,bestBy,eSpd*0.8,8);
if(!onBuilding(pos.x,pos.y,8)){e.x=pos.x;e.y=pos.y;}
}
}
const _atEngageDist = d <= minDist && d > minDist * 0.55;
const _keepStrafing = e._strafeDir !== undefined && d <= minDist * 1.15 && d > minDist * 0.55;
if(_edef.engageMove){ _ectx.night=_nightLevel; _ectx.atEngage=_atEngageDist; _ectx.keepStrafing=_keepStrafing; _ectx.dx=dx; _ectx.dy=dy; _edef.engageMove(e,_ectx); }
if(e._sepHold > 0){ e._sepHold--; }
if(d > minDist && !e._berzWindup && !(e._coverTimer > 0) && !e._isSuppressing && !(e._sepHold > 0)){
_navRebuildIfNeeded();
if(_edef.ai.hover){
e.x += (dx/d)*eSpd; e.y += (dy/d)*eSpd;   /* Vreth aliens hover straight over buildings */
} else if(e._flankAngle && d > 100){
const _flankFade = Math.min(1,(d-100)/140);
const _fa = Math.atan2(dy,dx) + e._flankAngle*_flankFade;
const _ftx = e.x + Math.cos(_fa)*100, _fty = e.y + Math.sin(_fa)*100;
const pos = navMoveEnemy(e, eSpd, 8, _ftx, _fty);
e.x = pos.x; e.y = pos.y;
} else if(e._laneOff && d > 110 && !e.boss){
const _fade = Math.min(1,(d-110)/150);
const _off = (e._laneOff + Math.sin($buildings.tick*e._weaveF+e._weaveP)*e._weaveAmp) * _fade;
const _ux = dx/d, _uy = dy/d;
const pos = navMoveEnemy(e, eSpd, 8, tx - _uy*_off, ty + _ux*_off);
e.x = pos.x; e.y = pos.y;
} else {
const pos = navMoveEnemy(e, eSpd, 8);
e.x = pos.x; e.y = pos.y;
}
} else if(_edef.closeMove && d < _edef.closeRange){
_ectx.dx=dx; _ectx.dy=dy; _ectx.eSpd=eSpd; _edef.closeMove(e,_ectx);
}
const ePad = e.w/2 + 4;
e.x = Math.max(ePad, Math.min($replay.W - ePad, e.x));
e.y = Math.max(ePad, Math.min($replay.H - ePad, e.y));
e.stuckTimer = (e.stuckTimer||0);
e.stuckX = (e.stuckX===undefined ? e.x : e.stuckX);
e.stuckY = (e.stuckY===undefined ? e.y : e.stuckY);
if(Math.hypot(e.x-e.stuckX, e.y-e.stuckY) < 1.2){
e.stuckTimer++;
} else {
e.stuckTimer=0; e.stuckX=e.x; e.stuckY=e.y;
}
if(e.stuckTimer > 80){
e.stuckTimer=0;
let freed = unstuckBoss(e.x, e.y, 10);
if(onBuilding(freed.x, freed.y, 10)){
freed = unstuckBoss(freed.x, freed.y, 22);
}
e.x=freed.x; e.y=freed.y;
e.stuckX=e.x; e.stuckY=e.y;
}
if(_edef.onTick){ _ectx.d=d; _edef.onTick(e,_ectx); }
const _sepInterval = ($core.isUltraLow || $core.isLowEndDesktop) ? 6 : $core.isMobile ? 2 : 1;
if($buildings.tick%_sepInterval===0){
const _sepCandidates=_gridQuery(e.x,e.y,46);
for(let _sci=0;_sci<_sepCandidates.length;_sci++){
const other=_sepCandidates[_sci];
if(other===e||!other.alive||other.boss)continue;
const sdx=e.x-other.x,sdy=e.y-other.y;
const sep=e.boss?0:((_nightLevel&&_edef.ai.nightSep)?_edef.ai.nightSep:(_edef.ai.sep!==undefined?_edef.ai.sep:30));
if(Math.abs(sdx)>sep||Math.abs(sdy)>sep)continue;
const sd=Math.hypot(sdx,sdy);
if(sd>0&&sd<sep){
const push=Math.min(3,((sep-sd)*0.2+0.15)*Math.min(_sepInterval,3));
const px=(sdx/sd)*push,py=(sdy/sd)*push;
const nx=e.x+px, ny=e.y+py;
if(!onBuilding(nx,ny,8)){e.x=nx;e.y=ny;}
else if(!onBuilding(nx,e.y,8)){e.x=nx;}
else if(!onBuilding(e.x,ny,8)){e.y=ny;}
const ox=other.x-px, oy=other.y-py;
if(!onBuilding(ox,oy,8)){other.x=ox;other.y=oy;}
else if(!onBuilding(ox,other.y,8)){other.x=ox;}
else if(!onBuilding(other.x,oy,8)){other.y=oy;}
if(_nightLevel){
e._sepHold = Math.max(e._sepHold||0, 6);
other._sepHold = Math.max(other._sepHold||0, 6);
}
}
}
}
let ldx=dx, ldy=dy;
{
let _tvx=0,_tvy=0;
if(e.targetRef==='player2'){ if(typeof $replay.player2!=='undefined'&&$replay.player2){ _tvx=$replay.player2.vx||0; _tvy=$replay.player2.vy||0; } }
else if(!e.targetRef || e.targetRef==='player'){ _tvx=$buildings.player.vx||0; _tvy=$buildings.player.vy||0; }
if(_tvx||_tvy){
const _leadT = _edef.ai.leadT||6;
let _lox=_tvx*_leadT, _loy=_tvy*_leadT;
const _loMag = Math.hypot(_lox,_loy);
const _loCap = d * 0.3;
if(_loMag > _loCap && _loMag > 0){ const _s=_loCap/_loMag; _lox*=_s; _loy*=_s; }
const _lx=tx+_lox, _ly=ty+_loy;
ldx=_lx-e.x; ldy=_ly-e.y;
}
}
_ectx.d=d; _ectx.dx=dx; _ectx.dy=dy; _ectx.ldx=ldx; _ectx.ldy=ldy; _ectx.minDist=minDist; _ectx.night=_nightLevel;
(_edef.fire||$enemies.shared.genericFire)(e,_ectx);
if(d<=320 && d>0.01 && !(e._berzWindup>0) && !(e._coverTimer>0)){
const _pt=$buildings.tick, _lowT=($core.isUltraLow||$core.isLowEndDesktop);
if(!_lowT || !(_pt&1)){
const _ps=(window._dt||1)*(_lowT?2:1);
const _ux=dx/d, _uy=dy/d;
const _om=e._orbitSpeed*0.55*_ps;
let _rm=0;
if(d<minDist+8){
const _err=minDist*e._rangeBias-d;
if(Math.abs(_err)>8) _rm=-Math.sign(_err)*Math.min(0.55,Math.abs(_err)*0.014)*_ps;
}
_rm+=Math.sin(_pt*e._rangeFreq+e._rangePhase)*0.22*_ps;
let _nx=e.x-_uy*_om+_ux*_rm, _ny=e.y+_ux*_om+_uy*_rm;
const _pp=(e.w||20)*0.5+4;
_nx=Math.max(_pp,Math.min($replay.W-_pp,_nx)); _ny=Math.max(_pp,Math.min($replay.H-_pp,_ny));
if(!onBuilding(_nx,_ny,(e.w||20)*0.5)){ e.x=_nx; e.y=_ny; }
}
}
const _eMoved = Math.hypot(e.x-_ePrevX, e.y-_ePrevY) > 0.3;
e.walkT += _eMoved ? 0.17 : 0.035;
}
}
const dpPlayer=Math.hypot($buildings.player.x-e.x,$buildings.player.y-e.y);
const playerHitR = e.boss ? e.w/2+12 : e.w/2+10;
if(dpPlayer>0&&dpPlayer<playerHitR){
const overlap=playerHitR-dpPlayer;
{
let dmg=e.boss?0.3:_edef.ai.contactDmg;
if($buildings.player.shield>0){$buildings.player.shield=Math.max(0,$buildings.player.shield-1);dmg=0;}
if(dmg>0){$buildings.player.hp-=dmg;updateHP();shake(3);vibrate(40);if($buildings.player.hp<=0)$props.triggerPlayerDeath('explosion');}
const pushA=Math.atan2($buildings.player.y-e.y,$buildings.player.x-e.x);
const pushDist=overlap*0.7+2;
const nx=$buildings.player.x+Math.cos(pushA)*pushDist;
const ny=$buildings.player.y+Math.sin(pushA)*pushDist;
if(!onBuilding(nx,ny,8)){$buildings.player.x=nx;$buildings.player.y=ny;}
else if(!onBuilding(nx,$buildings.player.y,8)){$buildings.player.x=nx;}
else if(!onBuilding($buildings.player.x,ny,8)){$buildings.player.y=ny;}
else{
const ov=buildingOverlap(nx,ny,8);
let freed=false;
if(ov){
const ex2=$buildings.player.x+ov.nx*(ov.depth+3),ey2=$buildings.player.y+ov.ny*(ov.depth+3);
if(!onBuilding(ex2,ey2,8)){$buildings.player.x=ex2;$buildings.player.y=ey2;freed=true;}
}
if(!freed){
for(let step=1;step<=6&&!freed;step++){
const a1=pushA+step*(Math.PI/4);
const a2=pushA-step*(Math.PI/4);
const d=pushDist+step*2;
const c1x=$buildings.player.x+Math.cos(a1)*d, c1y=$buildings.player.y+Math.sin(a1)*d;
if(!onBuilding(c1x,c1y,8)){$buildings.player.x=c1x;$buildings.player.y=c1y;freed=true;break;}
const c2x=$buildings.player.x+Math.cos(a2)*d, c2y=$buildings.player.y+Math.sin(a2)*d;
if(!onBuilding(c2x,c2y,8)){$buildings.player.x=c2x;$buildings.player.y=c2y;freed=true;break;}
}
}
if(!freed){
const ov2=buildingOverlap($buildings.player.x,$buildings.player.y,8);
if(ov2){$buildings.player.x+=ov2.nx*(ov2.depth+4);$buildings.player.y+=ov2.ny*(ov2.depth+4);}
}
}
}
const pushE=Math.atan2(e.y-$buildings.player.y,e.x-$buildings.player.x);
const ex2=e.x+Math.cos(pushE)*(overlap*0.5);
const ey2=e.y+Math.sin(pushE)*(overlap*0.5);
if(!onBuilding(ex2,ey2,8)){e.x=ex2;e.y=ey2;}
else if(!onBuilding(ex2,e.y,8)){e.x=ex2;}
else if(!onBuilding(e.x,ey2,8)){e.y=ey2;}
}
if($replay.coopEnabled&&$replay.player2&&!$replay.p2Down){
const dp2m=Math.hypot($replay.player2.x-e.x,$replay.player2.y-e.y);
const p2HitR=e.boss?e.w/2+12:e.w/2+10;
if(dp2m>0&&dp2m<p2HitR){
let dmg2=e.boss?0.3:_edef.ai.contactDmgP2;
if($replay.player2.shield>0){$replay.player2.shield=Math.max(0,$replay.player2.shield-1);dmg2=0;}
if(dmg2>0){$replay.player2.hp-=dmg2;if($replay.player2.hp<=0)$props.triggerP2Down();}
const pa2=Math.atan2($replay.player2.y-e.y,$replay.player2.x-e.x);
const nx2=$replay.player2.x+Math.cos(pa2)*3,ny2=$replay.player2.y+Math.sin(pa2)*3;
if(!onBuilding(nx2,ny2,8)){$replay.player2.x=nx2;$replay.player2.y=ny2;}
updateCoopHUD();
}
}
if(_frameAliveAllies.length>0) for(let _ai=0;_ai<_frameAliveAllies.length;_ai++){
const a=_frameAliveAllies[_ai];
if(!a.alive)continue;
const da=Math.hypot(a.x-e.x,a.y-e.y);
const allyHitR = e.boss ? e.w/2+12 : e.w/2+8;
if(da<allyHitR){
a.hp-=e.boss?0.2:0.08;
if(a.hp<=0){a.alive=false;ptcl(a.x,a.y,'#00ffcc',8,3);shake(3);}
if(da>0){
const pushA=Math.atan2(a.y-e.y,a.x-e.x);
const pushDist=allyHitR-da+1;
const nx=a.x+Math.cos(pushA)*pushDist;
const ny=a.y+Math.sin(pushA)*pushDist;
if(!onBuilding(nx,ny,12)){a.x=nx;a.y=ny;}
else if(!onBuilding(nx,a.y,12)){a.x=nx;}
else if(!onBuilding(a.x,ny,12)){a.y=ny;}
}
}
}
}
}
function updateWorld(){
checkWaveCompletion();
try{_updateWaveStatus();}catch(_e){}
if($buildings.player.hp<=0&&!$buildings.playerDead){
if($replay.currentLevel){
let lu={timesPlayed:$replay.currentLevel.timesPlayed+1};
if($buildings.score>$replay.currentLevel.bestScore)lu.bestScore=$buildings.score;
if($buildings.wave>=$replay.currentLevel.maxWaves && !$buildings.bossAlive) lu.completed=true;
gameDB.updateLevel($replay.currentLevel.id,lu);
}
$replay.pauseBtn.style.display='none';$replay.audioToggle.style.display='none';$replay.CaptureTools.showButtons(false);$replay.CaptureTools.stopRecording();
$props.triggerPlayerDeath('enemy bullet');
}
$buildings.weatherTimer=Math.max(0,($buildings.weatherTimer||0)-0.01);
if($buildings.weatherTimer<=0&&$buildings.weather!==$mutators.WEATHERS.clear){$buildings.weather=$mutators.WEATHERS.clear;$replay.weatherInd.style.display='none';}
if(!window._simSkipHud){
if(!$core.isMobile || $buildings.tick % 3 === 0){ updateHUD(); updateHP(); }
if(!$core.isUltraLow || $buildings.tick % 6 === 0){ updateGrenadeHUD(); updateWepUpgradeHUD(); }
}
}
function _orbitalPressure(){
const L=$replay.currentLevel, P=$buildings.player;
const maxW=Math.max(2,(L&&L.maxWaves)||30);
const wavePressure=Math.min(1,Math.max(0,($buildings.wave-1)/(maxW-1)));
const hpPressure=1-Math.max(0,Math.min(1,P.hp/P.maxHp));
const streakPressure=Math.min(1,($buildings.killStreak||0)/15);
const bossPressure=$buildings.bossAlive?0.5:0;
return Math.min(1,wavePressure*0.35+hpPressure*0.35+streakPressure*0.15+bossPressure*0.15);
}

/* ---- IRON PACT tank boss AI (3 phases: 100-66%, 66-33%, <33% HP) ---- */
function _tankTurn(e,ta,rate){
let df=ta-e.turretAngle; df=Math.atan2(Math.sin(df),Math.cos(df));
e.turretAngle+=Math.max(-rate,Math.min(rate,df));
}
function _tankSpread(e,n,sp,spd,dmg,off){
const a0=e.turretAngle+(off||0), mx=e.x+Math.cos(e.turretAngle)*50, my=e.y+Math.sin(e.turretAngle)*50;
for(let i=0;i<n;i++){
const a=a0+(i-(n-1)/2)*sp;
$buildings.bullets.push({x:mx,y:my,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,own:'enemy',life:400,dmg,col:'#ff4400',sz:3});
}
}
function _tankShells(e,n,sp){
const mx=e.x+Math.cos(e.turretAngle)*60, my=e.y+Math.sin(e.turretAngle)*60;
for(let i=0;i<n;i++){
const a=e.turretAngle+(i-(n-1)/2)*sp;
$buildings.bullets.push({x:mx,y:my,vx:Math.cos(a)*13,vy:Math.sin(a)*13,own:'enemy',life:400,dmg:5,col:'#ffcc00',sz:6});
}
ptcl(mx,my,'#ffaa00',8,5); shake(5);
try{ audioManager.fire('rpg'); }catch(_e){}
}
function _tankMortar(e,tx,ty,n){
for(let i=0;i<n;i++){
let gx=tx,gy=ty;
if(i>0){ const a=Math.random()*Math.PI*2, r=50+Math.random()*90; gx+=Math.cos(a)*r; gy+=Math.sin(a)*r; }
gx=Math.max(30,Math.min($replay.W-30,gx)); gy=Math.max(30,Math.min($replay.H-30,gy));
const fuse=55+i*9, dist=Math.hypot(gx-e.x,gy-e.y);
$buildings.grenades.push({x:e.x,y:e.y,tx:gx,ty:gy,speed:Math.max(5,Math.min(20,dist/(fuse-8))),spin:0,fuse,life:1,fromTank:true});
}
try{ audioManager.fire('grenade_throw'); }catch(_e){}
}
function _tankAI(e,tx,ty,dx,dy,d){
const pad=e.w/2+6, W=$replay.W, H=$replay.H;
const hpR=e.hp/e.maxHp, ph=hpR>0.66?1:hpR>0.33?2:3;
if(e._ph!==ph){
if(e._ph){ floatText(e.x,e.y-60,ph===2?'ARMOUR BREACHED!':'ENGINE OVERDRIVE!','#ff6600',16); shake(10); ptcl(e.x,e.y,'#ff6600',10,6); }
e._ph=ph; e._atk=null; e._dashT=0; e._tele=0; e._atkT=Math.min(e._atkT||60,45);
}
/* target velocity per tick (smoothed, clamped) for lead aiming */
if(e._ltx===undefined){ e._ltx=tx; e._lty=ty; e._tvx=0; e._tvy=0; }
e._tvx=e._tvx*0.7+Math.max(-6,Math.min(6,tx-e._ltx))*0.3;
e._tvy=e._tvy*0.7+Math.max(-6,Math.min(6,ty-e._lty))*0.3;
e._ltx=tx; e._lty=ty;
const spd=e.spd*(ph===1?1:ph===2?1.3:1.6);
const turn=ph===1?0.07:ph===2?0.10:0.14;
const tf=Math.min(40,d/13);
const leadA=Math.atan2(ty+e._tvy*tf-e.y,tx+e._tvx*tf-e.x);
const clampPos=()=>{ e.x=Math.max(pad,Math.min(W-pad,e.x)); e.y=Math.max(pad,Math.min(H-pad,e.y)); };
if(e._tele>0) e._tele--;
if(e._v2>0){ e._v2--; if(e._v2===0) _tankSpread(e,ph===3?8:6,0.19,10,3,0.1); }

/* --- charge in progress (phase 3) --- */
if(e._dashT>0){
e._dashT--;
const p0x=e.x,p0y=e.y;
const pos=moveBossToward(e.x,e.y,e.x+Math.cos(e._dashA)*100,e.y+Math.sin(e._dashA)*100,6.5,pad);
e.x=pos.x; e.y=pos.y; clampPos();
e.walkT+=0.5;
if(Math.random()<0.5) ptcl(e.x-Math.cos(e._dashA)*30,e.y-Math.sin(e._dashA)*30,'#888',2,3);
const P=$buildings.player;
if(!e._dashHit && Math.hypot(P.x-e.x,P.y-e.y)<e.w/2+16){
e._dashHit=true;
if(P.shield>0){ P.shield=Math.max(0,P.shield-60); }
else { P.hp-=14; updateHP(); if(P.hp<=0) $props.triggerPlayerDeath('explosion'); }
P.kbx=(P.kbx||0)+Math.cos(e._dashA)*7; P.kby=(P.kby||0)+Math.sin(e._dashA)*7;
shake(12); floatText(P.x,P.y-30,'RAMMED!','#ff4400',14);
}
if(Math.hypot(e.x-p0x,e.y-p0y)<2) e._dashT=0;
if(e._dashT<=0){ e._atk=null; e._atkT=70; e._tele=0; floatText(e.x,e.y-55,'OVERHEATED','#ffcc00',12); shake(6); }
return;
}

/* --- idle: reposition, then pick the next attack --- */
if(!e._atk){
const R=ph===3?190:260;
e._sdT=(e._sdT||0)-1;
if(!e._sd||e._sdT<=0){ e._sd=Math.random()<0.5?-1:1; e._sdT=90+Math.floor(Math.random()*110); }
const nx=dx/(d||1), ny=dy/(d||1), px=-ny*e._sd, py=nx*e._sd;
let mx=0,my=0,ms=spd;
if(d>R+50){ mx=nx; my=ny; }
else if(d<R-70){ mx=-nx*0.8+px*0.7; my=-ny*0.8+py*0.7; ms=spd*0.85; }
else { mx=px; my=py; ms=spd*0.7; }
const pos=moveBossToward(e.x,e.y,e.x+mx*100,e.y+my*100,ms,pad);
e.x=pos.x; e.y=pos.y; clampPos(); e.walkT+=0.16;
_tankTurn(e,leadA,turn);
e._atkT--;
if(e._atkT<=0){
const r=Math.random();
let pick=ph===1?(r<0.6?'cannon':'volley'):ph===2?(r<0.35?'cannon':r<0.6?'volley':'mortar'):(r<0.25?'cannon':r<0.45?'volley':r<0.7?'mortar':'dash');
if(pick===e._lastAtk) pick=(pick==='cannon'?'volley':'cannon');
if(pick==='dash' && d>520) pick='cannon';
e._atk=pick; e._lastAtk=pick;
const w=pick==='cannon'?(ph===1?40:ph===2?32:26):pick==='volley'?24:pick==='mortar'?30:36;
e._atkMax=w; e._atkT=w;
e._tele=(pick==='cannon'||pick==='dash')?w:0; e._teleMax=w;
if(pick==='mortar') floatText(e.x,e.y-55,'INCOMING!','#ffaa00',13);
}
return;
}

/* --- attack windup / fire (tank holds still) --- */
e._atkT--;
const a=e._atk;
const locked = e._atkT <= e._atkMax*0.4;
if(a==='volley'||a==='mortar') _tankTurn(e,leadA,turn*1.6);
else if(!locked) _tankTurn(e,leadA,turn*1.4);
if(e._atkT>0) return;
if(a==='cannon'){
_tankShells(e,ph===1?1:3,ph===2?0.13:0.17);
}
else if(a==='volley'){
_tankSpread(e,ph===1?5:ph===2?7:9,ph===3?0.17:0.2,10,3,0);
if(ph>=2) e._v2=14;
}
else if(a==='mortar'){
_tankMortar(e,tx+e._tvx*30,ty+e._tvy*30,ph===2?3:5);
}
else if(a==='dash'){
e._dashT=30; e._dashA=e.turretAngle; e._dashHit=false; e._tele=0;
floatText(e.x,e.y-55,'CHARGING!','#ff4400',14); shake(6);
e._atk='dash'; return;
}
e._atk=null; e._tele=0;
e._atkT=ph===1?70:ph===2?52:38;
}
function updateGame(dt=1){
if($buildings.isPaused) return;
if($buildings._waveDef) window.__engine.waves.tick(dt);
$buildings.tick++; $buildings.player.sc=Math.max(0,$buildings.player.sc-1);
if($buildings.tick%15===0 && audioManager.updateTension){ audioManager.updateTension(); }
if(audioManager._orb && $buildings.tick%15===0){ try{ audioManager.setOrbitalPressure(_orbitalPressure(), $buildings.wave|0, Math.max(0,$buildings.player.hp/$buildings.player.maxHp)); }catch(_e){} }
if ($psycho1._psychoCooldown > 0) $psycho1._psychoCooldown--;
if ($psycho1._psychoActive) {
  $psycho1._psychoDuration++;
  if ($psycho1._psychoDuration >= $psycho1.PSYCHO_MAX_DURATION) deactivatePsychoMode();
}
window._dt = dt;
if($props._guidedWave) $props.tickGuidedWave();
if($buildings.shakeMag>0){if($buildings._shakeAng!==undefined){const _sa=$buildings._shakeAng,_sm=$buildings.shakeMag;$buildings.shakeX=Math.cos(_sa)*_sm*1.2+(Math.random()-0.5)*_sm*0.4;$buildings.shakeY=Math.sin(_sa)*_sm*1.2+(Math.random()-0.5)*_sm*0.4;}else{$buildings.shakeX=(Math.random()-0.5)*$buildings.shakeMag*2;$buildings.shakeY=(Math.random()-0.5)*$buildings.shakeMag*2;}$buildings.shakeMag*=($buildings.tick<$buildings.shakeHeavyUntil?0.88:0.8);if($buildings.shakeMag<0.3){$buildings.shakeMag=0;$buildings._shakeAng=undefined;}}
else{$buildings.shakeX=0;$buildings.shakeY=0;}
if($buildings._zoom>0){$buildings._zoom*=0.9;if($buildings._zoom<0.002)$buildings._zoom=0;}
if($buildings.player.recoilOffset>0){$buildings.player.recoilOffset*=0.78;if($buildings.player.recoilOffset<0.1)$buildings.player.recoilOffset=0;}
let _fragBudget = __fxLv()===0?1:__fxLv()<2?2:3;
for(let _bi = $buildings.bullets.length - 1; _bi >= 0 && _fragBudget > 0; _bi--){
const _fb = $buildings.bullets[_bi];
if(!_fb || !_fb._fragDeferred) continue;
const {x:_fx, y:_fy} = _fb._fragDeferred;
_fb._fragDeferred = null;
const _er2 = 55;
$buildings.enemies.forEach(_ee=>{ if(!_ee.alive||_ee.boss)return; const _ed=Math.hypot(_ee.x-_fx,_ee.y-_fy); if(_ed<_er2){_ee.hp-=Math.ceil(3*(1-_ed/_er2));_ee.hitFlash=6;if(_ee.hp<=0)killEnemy(_ee);} });
ptclQ(_fx,_fy,'#ff6600',__fxLv()<2?2:$core.isMobile?4:8,6);
if($buildings.debrisArr.length<(__fxLv()===0?3:__fxLv()<2?6:40))$buildings.debrisArr.push({x:_fx,y:_fy,r:40,life:12,maxLife:12,col:'#ff4400'});
_fragBudget--;
}
$profiler._frameProfiler.mark('sub:movement');
updateMovement();
updatePlayer2();
updatePlayerStatus();
{ const _P=$buildings.player; _P._hpSnap=_P.hp; _P._shSnap=_P.shield; }
$profiler._frameProfiler.end('sub:movement');
$profiler._frameProfiler.mark('sub:projectiles');
updateProjectiles();
$profiler._frameProfiler.end('sub:projectiles');
$profiler._frameProfiler.mark('sub:enemyAI');
if (!$psycho1._psychoActive) { const _preEBLen = $buildings.bullets.length; updateEnemyAI(); _registerNewEnemyBullets(_preEBLen); }
_decayAllEnemyRecoil();
_updateEnemyMuzzleFlashes();
$profiler._frameProfiler.end('sub:enemyAI');
if (!$psycho1._psychoActive) { updateAllies(); updateDrone(); }
{ const _P=$buildings.player; if(_P._iframes>0 && _P._hpSnap!==undefined){ if(_P.hp<_P._hpSnap) _P.hp=_P._hpSnap; if(_P.shield<_P._shSnap) _P.shield=_P._shSnap; } }
updateWorld();
if($buildings.tick % 60 === 0) dcOnWaveOrScore();
if($buildings.tick % 30 === 0) $profiler._applyHordeThrottle();
if($buildings.tick % 300 === 0){ $psycho2.bossRegistry.purgeStale(); _compactEnemies(); }
}
$legendary._hudLastAmmo = -1; $legendary._hudLastMaxAmmo = -1; $legendary._hudLastWep = ''; $legendary._hudLastReloading = false;
function updateHUD(){
el('score-num').textContent=$buildings.score;el('kills-num').textContent=$buildings.totalKills;
const w=$buildings.WEAPONS[$buildings.curWep];
const _upgAmmo = ($buildings.wepUpgrades&&$buildings.wepUpgrades[$buildings.curWep]&&$buildings.wepUpgrades[$buildings.curWep].ammo)||0;
const maxAmmo = w.ammo + _upgAmmo;
const curAmmo = $buildings.wepAmmo[$buildings.curWep]||0;
if($buildings.settingAutoSwitch && curAmmo === 0 && !$buildings.reloading){
const owned = (typeof $buildings.WK !== 'undefined') ? $buildings.WK : [];
const currentIdx = owned.indexOf($buildings.curWep);
for(let i = 1; i < owned.length; i++){
const nextIdx = (currentIdx + i) % owned.length;
if($buildings.wepAmmo[owned[nextIdx]] > 0){
$buildings.curWep = owned[nextIdx];
break;
}
}
}
if($buildings.curWep !== $legendary._hudLastWep || curAmmo !== $legendary._hudLastAmmo || maxAmmo !== $legendary._hudLastMaxAmmo || $buildings.reloading !== $legendary._hudLastReloading){
$legendary._hudLastWep = $buildings.curWep; $legendary._hudLastAmmo = curAmmo; $legendary._hudLastMaxAmmo = maxAmmo; $legendary._hudLastReloading = $buildings.reloading;
const bar = el('ammo-bar');
if(bar.children.length !== maxAmmo){
bar.innerHTML = '';
for(let i=0;i<maxAmmo;i++){
const pip=document.createElement('div');
pip.className='bullet ammo-pip';
pip.style.background=w.col;
bar.appendChild(pip);
}
}
const pips=bar.children;
for(let i=0;i<pips.length;i++){
const isFull = !$buildings.reloading && i < curAmmo;
pips[i].style.background = isFull ? w.col : '';
pips[i].classList.toggle('empty', !isFull);
}
const wgwWep = el('wgw-wep');
if(wgwWep) wgwWep.textContent = w.name;
if(typeof $profiler.updateWepStrip==='function') $profiler.updateWepStrip();
}
if($profiler._hudCollapsed) $profiler._syncMiniHud();
$profiler.renderMinimalHud();
}
$legendary._prevPlayerHp = 100; $legendary._hudLastHpPct = -1;
$legendary._inCloseCall = false;
let _hpFillEl = null, _vignetteEl = null, _hpCbBadgeEl = null;
$buildings._dmgInd = [];
$buildings._onPlayerHurt = function(drop){
const B=$buildings, p=B.player;
if(B.state!=='playing' || B.isPaused || p.hp<=0) return;
let ang=null;
const _ht = B.tick - B._hitAngTick;
if(B._hitAngTick!=null && _ht>=0 && _ht<=2) ang=B._hitAng;
else if(drop>=0.75){
let best=220*220;
for(let i=0;i<B.enemies.length;i++){ const e=B.enemies[i]; if(!e||!e.alive) continue; const dx=e.x-p.x, dy=e.y-p.y, d2=dx*dx+dy*dy; if(d2<best){ best=d2; ang=Math.atan2(dy,dx); } }
}
if(ang!==null){
const L=B._dmgInd;
let merged=false;
for(let i=0;i<L.length;i++){ let da=Math.abs(((L[i].a-ang+Math.PI*3)%(Math.PI*2))-Math.PI); if(da<0.5 && B.tick-L[i].t0<10){ L[i].a=ang; L[i].t0=B.tick; merged=true; break; } }
if(!merged){ L.push({a:ang,t0:B.tick}); if(L.length>6) L.shift(); }
}
if(drop>=1 && !$core.isVeryLow && (B.bossAlive||!($core.isUltraLow||$core.isLowEndDesktop)) && !(B.tick-(B._lastHurtStop||-99) < 10)){ B._lastHurtStop=B.tick; $replay._freezeFrames=Math.max($replay._freezeFrames||0,2); }
};
function updateHP(){
const pct=Math.max(0,$buildings.player.hp/$buildings.player.maxHp)*100;
if($buildings.bossAlive && pct/100 < $buildings._bossFightMinHpPct) $buildings._bossFightMinHpPct = pct/100;
if($buildings.player.hp < $legendary._prevPlayerHp){ const _hurt = $legendary._prevPlayerHp - $buildings.player.hp; dcOnDamageTaken(); try{ $buildings._onPlayerHurt(_hurt); }catch(_e){} }
$legendary._prevPlayerHp = $buildings.player.hp;
if($buildings.player.hp>0){
if(!$legendary._inCloseCall && pct < 20){
$legendary._inCloseCall = true;
} else if($legendary._inCloseCall && pct >= 50){
$legendary._inCloseCall = false;
try{
if(!localStorage.getItem('diy_first_close_call')){
localStorage.setItem('diy_first_close_call','1');
floatTextPop($buildings.player.x,$buildings.player.y-40,'THAT WAS CLOSE!','#7fff00',16);
showPickupMsg('OK SURVIVED THE CLOSE CALL','#7fff00','KEEP FIGHTING');
vibrate([20,15,20,15,35]);
}
}catch(_e){}
}
} else {
$legendary._inCloseCall = false;
}
const pctR = Math.round(pct);
$profiler.renderMinimalHud();
if(pctR === $legendary._hudLastHpPct) return;
$legendary._hudLastHpPct = pctR;
const col=pct>50?'#7fff00':pct>25?'#ffaa00':'#ff3300';
if(!_hpFillEl) _hpFillEl = el('hp-fill');
_hpFillEl.style.width=pct+'%'; _hpFillEl.style.background=col;
_hpFillEl.setAttribute('aria-valuenow', String(pctR));
if(!_hpCbBadgeEl) _hpCbBadgeEl = el('hp-cb-badge');
if(_hpCbBadgeEl) _hpCbBadgeEl.textContent = pct>50?'OK':pct>25?'LOW':'CRIT';
if(!_vignetteEl) _vignetteEl = el('vignette');
const vig=_vignetteEl;
if(vig){
if($buildings.settingPerfMode){
vig.style.opacity='0';
} else {
vig.style.opacity = (!$core.isVeryLow && pct < 30) ? String(Math.min(1,(30-pct)/30*1.4)) : '0';
}
}
if($profiler._hudCollapsed) $profiler._syncMiniHud();
if($replay.coopEnabled) updateCoopHUD();
const _wc = document.getElementById('wave-chip');
if(_wc) _wc.textContent = $buildings.wave || 1;
const _fb = document.getElementById('btn-fire');
if(_fb){ const _ammo = $buildings.wepAmmo[$buildings.curWep]||0; _fb.classList.toggle('has-ammo', _ammo > 0); }
}
const _drawListPool = [];
const _drawEntryPool = [];
function draw(){
if(!$replay.W || !$replay.H) return;
if(!$psycho1.groundCache) buildGroundCache();
$core.ctx.save();
if($buildings.shakeMag>0.3) $core.ctx.translate($buildings.shakeX, $buildings.shakeY);
if($buildings._zoom>0.002){ const _z=1+$buildings._zoom, _zx=$buildings._zoomFx==null?$replay.W/2:$buildings._zoomFx, _zy=$buildings._zoomFy==null?$replay.H/2:$buildings._zoomFy; $core.ctx.translate(_zx,_zy); $core.ctx.scale(_z,_z); $core.ctx.translate(-_zx,-_zy); }
$core.ctx.drawImage($psycho1.groundCache,0,0,$replay.W,$replay.H);
if($replay.currentEnv==='desert'&&window.__desertPixel){ try{ window.__desertPixel.tracks($core.ctx,$replay.W,$replay.H,$buildings,$psycho1.groundCache); }catch(pe){} }
if($psycho1._envMotes.length && $buildings._dqsQuality>=0.4 && !$buildings.settingPerfMode){
$core.ctx.save();
const _moteDrawN = Math.max(1, Math.round($psycho1._envMotes.length * Math.min(1, $buildings._dqsQuality)));
for(let mi=0;mi<$psycho1._envMotes.length;mi++){
const m=$psycho1._envMotes[mi];
m.y+=m.spd*$psycho1._envMoteDir;m.x+=Math.sin($buildings.tick*0.01+m.phase)*m.drift*0.3;
if($psycho1._envMoteDir<0 && m.y<-6){m.y=$replay.H+6;m.x=Math.random()*$replay.W;}
if($psycho1._envMoteDir>0 && m.y>$replay.H+6){m.y=-6;m.x=Math.random()*$replay.W;}
if(mi>=_moteDrawN) continue;
const tw=0.5+0.5*Math.sin($buildings.tick*0.03+m.phase);
$core.ctx.globalAlpha=0.25+tw*0.35;
$core.ctx.fillStyle=$psycho1._envMoteCol;
$core.ctx.beginPath();$core.ctx.arc(m.x,m.y,m.r,0,Math.PI*2);$core.ctx.fill();
}
$core.ctx.globalAlpha=1;
$core.ctx.restore();
}
if($buildings.craters.length){
$core.ctx.save();
for(const cr of $buildings.craters){
$core.ctx.beginPath();$core.ctx.ellipse(cr.x,cr.y,cr.r,cr.r*0.78,0,0,Math.PI*2);
$core.ctx.fillStyle='rgba(25,20,18,0.55)';
$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(cr.x,cr.y,cr.r*0.62,cr.r*0.5,0,0,Math.PI*2);
$core.ctx.fillStyle='rgba(15,12,10,0.5)';
$core.ctx.fill();
$core.ctx.strokeStyle='rgba(90,75,60,0.35)';
$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.ellipse(cr.x,cr.y,cr.r,cr.r*0.78,0,0,Math.PI*2);
$core.ctx.stroke();
const _rs=cr.seed;
for(let k=0;k<5;k++){
const ang=((_rs+k*97)%628)/100;
const rr=cr.r*(0.5+((_rs+k*53)%40)/100);
$core.ctx.beginPath();
$core.ctx.arc(cr.x+Math.cos(ang)*rr,cr.y+Math.sin(ang)*rr*0.78,1.6+((_rs+k)%3),0,Math.PI*2);
$core.ctx.fillStyle='rgba(60,50,40,0.4)';
$core.ctx.fill();
}
}
$core.ctx.restore();
}
if($buildings.rubblePieces.length){
$core.ctx.save();
for(const rp of $buildings.rubblePieces){
if(!rp.settled && rp.life>0 && Math.hypot(rp.vx,rp.vy)<0.3) continue;
$core.ctx.save();
$core.ctx.translate(rp.x,rp.y);
$core.ctx.rotate(rp.rot);
$core.ctx.fillStyle=rp.col;
$core.ctx.fillRect(-rp.sz/2,-rp.sz/2,rp.sz,rp.sz);
$core.ctx.restore();
}
$core.ctx.restore();
}
if(!$profiler._skipTrailParticles){
for(let d of $buildings.debrisArr){
if($core.isUltraLow) continue;
const a=d.life/d.maxLife;
const r=Math.max(0,d.r*(1-a)*2.5);
$core.ctx.save();
$core.ctx.globalAlpha=a*0.7;
$core.ctx.strokeStyle=d.col||'#ff6600';
$core.ctx.lineWidth=3*(a);
$core.ctx.shadowColor='#ff4400';$core.ctx.shadowBlur=(12*a)*$core.SHADOW;
$core.ctx.beginPath();$core.ctx.arc(d.x,d.y,r,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.globalAlpha=a*a*0.25;
$core.ctx.fillStyle='rgba(255,100,0,0.3)';
$core.ctx.fill();
const r2=r*0.55;
$core.ctx.globalAlpha=a*0.5;
$core.ctx.lineWidth=1.5;
$core.ctx.strokeStyle='#ffcc00';
$core.ctx.beginPath();$core.ctx.arc(d.x,d.y,r2,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.restore();
}
}
for(let b of $buildings.bullets){
if(b.x<-20||b.x>$replay.W+20||b.y<-20||b.y>$replay.H+20) continue;
if(b.wt==='laser'||b.wt==='plasma') continue;
if(b.wt==='flame'){
const fa=Math.max(0,b.life/b.fade)*0.85;
$core.ctx.save();$core.ctx.globalAlpha=fa;$core.ctx.shadowColor=b.col;$core.ctx.shadowBlur=(10)*$core.SHADOW;
$core.ctx.fillStyle=b.col;$core.ctx.beginPath();$core.ctx.arc(b.x,b.y,b.sz,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
} else if(b.wt==='knife'){
$core.ctx.save();$core.ctx.translate(b.x,b.y);$core.ctx.rotate(b.stuck?b.ang+Math.PI/5:b.spin);$core.ctx.globalAlpha=b.stuck?0.5:1;$props.drawKnife();$core.ctx.restore();
} else if(b.wt==='rocket'){
$core.ctx.save();$core.ctx.translate(b.x,b.y);$core.ctx.rotate(b.ang||0);
$core.ctx.fillStyle='#cc3300';$core.ctx.fillRect(-12,-3,20,6);$core.ctx.fillStyle='#ff6600';$core.ctx.fillRect(6,-3,8,6);
$core.ctx.fillStyle='#ffcc00';$core.ctx.beginPath();$core.ctx.moveTo(8,-5);$core.ctx.lineTo(14,0);$core.ctx.lineTo(8,5);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.fillStyle='#888';$core.ctx.fillRect(-14,-2,4,4);$core.ctx.shadowColor='#ff4400';$core.ctx.shadowBlur=(12)*$core.SHADOW;$core.ctx.restore();
} else {
let col=b.col||'#00ff00'; const sz=b.sz||3;
if($buildings.settingColorblind){
if(b.own==='enemy'){
$core.ctx.fillStyle='#ffdd00';$core.ctx.shadowBlur=0;
$core.ctx.save();$core.ctx.translate(b.x,b.y);$core.ctx.rotate(Math.PI/4);$core.ctx.fillRect(-sz*0.8,-sz*0.8,sz*1.6,sz*1.6);$core.ctx.restore();
} else if(b.own==='ally'){
$core.ctx.shadowColor='#00aaff';$core.ctx.shadowBlur=8*$core.SHADOW;$core.ctx.fillStyle='#00aaff';
$core.ctx.save();$core.ctx.translate(b.x,b.y);$core.ctx.beginPath();$core.ctx.moveTo(0,-sz*1.3);$core.ctx.lineTo(sz*1.1,sz*0.9);$core.ctx.lineTo(-sz*1.1,sz*0.9);$core.ctx.closePath();$core.ctx.fill();$core.ctx.restore();
} else {
$core.ctx.shadowColor='#ffffff';$core.ctx.shadowBlur=8*$core.SHADOW;$core.ctx.fillStyle='#ffffff';
$core.ctx.beginPath();$core.ctx.arc(b.x,b.y,sz*1.1,0,Math.PI*2);$core.ctx.fill();
}
} else {
const _muts=$psycho2.playerUpgrades.mutations;
const _isPlayer=b.own==='player'||b.own==='player2';
if(_isPlayer&&_muts&&_muts.size>0){
const _isBurst=b._shotIdx&&b._shotIdx%5===0&&_muts.has('mut_multishot');
const _isPierce=b.pierce&&_muts.has('mut_pierce');
const _isFrag=_muts.has('mut_explosive');
const _isChain=_muts.has('mut_chain');
const _isPoison=_muts.has('mut_poison');
const _isRico=b.bounces>0&&_muts.has('mut_ricochet');
const _isHoming=b.homing&&_muts.has('mut_magnet');
const _isLeech=_muts.has('mut_lifesteal');
if(_isBurst){
$core.ctx.shadowColor='#ffff88';$core.ctx.shadowBlur=$core.isMobile?0:14*$core.SHADOW;
$core.ctx.fillStyle='#ffffff';$core.ctx.beginPath();$core.ctx.arc(b.x,b.y,sz*2.2,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#ffff00';$core.ctx.beginPath();$core.ctx.arc(b.x,b.y,sz*1.4,0,Math.PI*2);$core.ctx.fill();
} else if(_isPierce){
$core.ctx.save();const ang=Math.atan2(b.vy,b.vx);$core.ctx.translate(b.x,b.y);$core.ctx.rotate(ang);
$core.ctx.shadowColor='#00ffff';$core.ctx.shadowBlur=$core.isMobile?0:10*$core.SHADOW;
$core.ctx.fillStyle='#00ffff';$core.ctx.beginPath();$core.ctx.ellipse(0,0,sz*3.5,sz*0.8,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#ffffff';$core.ctx.beginPath();$core.ctx.ellipse(sz,0,sz*1.5,sz*0.4,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
} else if(_isFrag){
$core.ctx.shadowColor='#ff8800';$core.ctx.shadowBlur=$core.isMobile?0:12*$core.SHADOW;
$core.ctx.fillStyle='#ff6600';$core.ctx.beginPath();$core.ctx.arc(b.x,b.y,sz*1.8,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#ffcc00';$core.ctx.beginPath();$core.ctx.arc(b.x,b.y,sz*0.9,0,Math.PI*2);$core.ctx.fill();
if(!$core.isMobile){$core.ctx.strokeStyle='#ffaa00';$core.ctx.lineWidth=1;for(let s=0;s<4;s++){const sa=s*Math.PI/2+($buildings.tick*0.3);$core.ctx.beginPath();$core.ctx.moveTo(b.x+Math.cos(sa)*(sz*1.8),b.y+Math.sin(sa)*(sz*1.8));$core.ctx.lineTo(b.x+Math.cos(sa)*(sz*2.8),b.y+Math.sin(sa)*(sz*2.8));$core.ctx.stroke();}}
} else if(_isChain){
$core.ctx.shadowColor='#ffff00';$core.ctx.shadowBlur=$core.isMobile?0:12*$core.SHADOW;
$core.ctx.fillStyle='#ffff44';$core.ctx.beginPath();$core.ctx.arc(b.x,b.y,sz*1.6,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#ffffff';$core.ctx.beginPath();$core.ctx.arc(b.x,b.y,sz*0.7,0,Math.PI*2);$core.ctx.fill();
} else if(_isPoison){
const pulse=0.7+Math.sin($buildings.tick*0.4+b.x*0.1)*0.3;
$core.ctx.shadowColor='#88ff44';$core.ctx.shadowBlur=$core.isMobile?0:10*$core.SHADOW;
$core.ctx.fillStyle='#44aa00';$core.ctx.beginPath();$core.ctx.arc(b.x,b.y,sz*1.8*pulse,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#aaff44';$core.ctx.beginPath();$core.ctx.arc(b.x,b.y,sz*0.8,0,Math.PI*2);$core.ctx.fill();
} else if(_isRico){
$core.ctx.save();$core.ctx.translate(b.x,b.y);$core.ctx.rotate(Math.PI/4);
$core.ctx.shadowColor='#ff00ff';$core.ctx.shadowBlur=$core.isMobile?0:12*$core.SHADOW;
$core.ctx.fillStyle='#ff44ff';$core.ctx.fillRect(-sz*1.4,-sz*1.4,sz*2.8,sz*2.8);
$core.ctx.fillStyle='#ffffff';$core.ctx.fillRect(-sz*0.6,-sz*0.6,sz*1.2,sz*1.2);$core.ctx.restore();
} else if(_isHoming){
$core.ctx.save();const ang2=Math.atan2(b.vy,b.vx);$core.ctx.translate(b.x,b.y);$core.ctx.rotate(ang2);
$core.ctx.shadowColor='#00ffcc';$core.ctx.shadowBlur=$core.isMobile?0:10*$core.SHADOW;
$core.ctx.fillStyle='#00ffcc';$core.ctx.beginPath();$core.ctx.moveTo(sz*2,0);$core.ctx.arc(0,0,sz*1.4,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
} else if(_isLeech){
$core.ctx.shadowColor='#cc0033';$core.ctx.shadowBlur=$core.isMobile?0:10*$core.SHADOW;
$core.ctx.fillStyle='#ff0044';$core.ctx.beginPath();$core.ctx.arc(b.x,b.y,sz*1.6,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#440011';$core.ctx.beginPath();$core.ctx.arc(b.x-b.vx*0.3,b.y-b.vy*0.3,sz*1.0,0,Math.PI*2);$core.ctx.fill();
} else {
if(b.own==='player2'){$core.ctx.shadowColor=$replay.P2_COL;$core.ctx.shadowBlur=8*$core.SHADOW;$core.ctx.fillStyle=$replay.P2_COL;}
else{$core.ctx.shadowColor=col;$core.ctx.shadowBlur=8*$core.SHADOW;$core.ctx.fillStyle=col;}
$core.ctx.beginPath();$core.ctx.arc(b.x,b.y,sz,0,Math.PI*2);$core.ctx.fill();
}
if(!$core.isMobile&&_muts.size>1&&__fxLv()>1){const _secRings=[];if(!_isBurst&&_muts.has('mut_multishot'))_secRings.push({col:'#ffff44',r:sz*2.6,w:1.2});if(!_isPierce&&_muts.has('mut_pierce'))_secRings.push({col:'#00ffff',r:sz*2.2,w:1.2});if(!_isFrag&&_muts.has('mut_explosive'))_secRings.push({col:'#ff8800',r:sz*2.4,w:1.0});if(!_isChain&&_muts.has('mut_chain'))_secRings.push({col:'#ffff00',r:sz*2.0,w:1.0});if(!_isPoison&&_muts.has('mut_poison'))_secRings.push({col:'#88ff44',r:sz*2.0,w:1.0});if(!_isLeech&&_muts.has('mut_lifesteal'))_secRings.push({col:'#ff0044',r:sz*1.8,w:1.0});if(!_isHoming&&_muts.has('mut_magnet'))_secRings.push({col:'#00ffcc',r:sz*2.2,w:1.0});if(_secRings.length>0){const _phase=$buildings.tick*0.15;_secRings.forEach(({col:rc,r,w},ri)=>{$core.ctx.save();$core.ctx.globalAlpha=0.55;$core.ctx.strokeStyle=rc;$core.ctx.lineWidth=w;$core.ctx.shadowBlur=0;const _arc=Math.PI*0.6;$core.ctx.beginPath();$core.ctx.arc(b.x,b.y,r+ri*sz*0.6,_phase+ri*1.1,_phase+ri*1.1+_arc);$core.ctx.stroke();$core.ctx.restore();});}}
} else {
if(b.own==='player2'){$core.ctx.shadowColor=$replay.P2_COL;$core.ctx.shadowBlur=8*$core.SHADOW;$core.ctx.fillStyle=$replay.P2_COL;}
else if(b.own!=='enemy'){$core.ctx.shadowColor=col;$core.ctx.shadowBlur=(b.own==='ally'?10:8)*$core.SHADOW;$core.ctx.fillStyle=col;}
else{$core.ctx.shadowBlur=0;$core.ctx.fillStyle=col;}
if(b.own==='enemy'&&!b.isWeb){
const _er=Math.max(sz*1.35,5);
const _ec=b.col||'#ff5a2a', _cx=$core.ctx;
if(!$core.isUltraLow){
_cx.fillStyle=_ec;
for(let _k=1;_k<=3;_k++){ const _s=Math.max(2,Math.round(_er*(1.5-0.35*_k))); _cx.globalAlpha=0.6-0.15*_k; _cx.fillRect(Math.round(b.x-b.vx*0.9*_k-_s/2),Math.round(b.y-b.vy*0.9*_k-_s/2),_s,_s); }
_cx.globalAlpha=1;
}
_cx.fillStyle='#000';_cx.beginPath();_cx.arc(b.x,b.y,_er+1.8,0,Math.PI*2);_cx.fill();
_cx.fillStyle=_ec;_cx.beginPath();_cx.arc(b.x,b.y,_er,0,Math.PI*2);_cx.fill();
_cx.fillStyle='#fff';_cx.beginPath();_cx.arc(b.x,b.y,_er*0.45,0,Math.PI*2);_cx.fill();
} else {
$core.ctx.beginPath();$core.ctx.arc(b.x,b.y,sz,0,Math.PI*2);$core.ctx.fill();
}
}
}
}
}
$core.ctx.shadowBlur=0;
const env=$psycho1.ENVS[$replay.currentEnv];
for(let b of $psycho1.buildings){
if(b.x+b.w<-40||b.x>$replay.W+40||b.y+b.h<-40||b.y>$replay.H+60) continue;
$props.drawBuilding(b,env);
}
let lastAlpha=-1;
const _pn=$buildings.particles.length,_pm=_pn>100?Math.max(0.3,100/_pn):1,_pcap=_pn>100?3.5:99;
for(let pi=0;pi<$buildings.particles.length;pi++){const p=$buildings.particles[pi];
if(p.x<-10||p.x>$replay.W+10||p.y<-10||p.y>$replay.H+10)continue;
const a=Math.max(0,p.life/28)*_pm;
const aRounded=Math.round(a*10)/10;
if(aRounded!==lastAlpha){$core.ctx.globalAlpha=aRounded;lastAlpha=aRounded;}
$core.ctx.fillStyle=p.col;
const sz=Math.min(p.sz||2,_pcap);
$core.ctx.fillRect(p.x-sz/2,p.y-sz/2,sz,sz);
}
$core.ctx.globalAlpha=1;
const PCOLS2={rapid:'#ffaa00',shield:'#00ccff',health:'#ff4466',ammo:'#aaff00',speed:'#ff00ff',grenade:'#ffcc00',godmode:'#ffd700'};
const PICON2={rapid:'>>',shield:'◈',health:'+',ammo:'◉',speed:'*',grenade:'▪',godmode:'*'};
for(let pu of $buildings.powerups){
const c=PCOLS2[pu.type]||(pu.type&&pu.type.startsWith('weapon_')?'#7fff00':'#ffffff');
const icon=PICON2[pu.type]||(pu.type&&pu.type.startsWith('weapon_')?'::':'?');
$core.ctx.save();
if($core.isMobile){
$core.ctx.strokeStyle=c;$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.arc(pu.x,pu.y,10,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.fillStyle=c+'44';$core.ctx.fill();
} else {
const pulse=Math.sin($buildings.tick*0.1)*3;
$core.ctx.shadowColor=c;$core.ctx.shadowBlur=14+pulse;
$core.ctx.strokeStyle=c;$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.arc(pu.x,pu.y,10+pulse,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.fillStyle=c+'44';$core.ctx.fill();
}
$core.ctx.fillStyle=c;$core.ctx.font='bold 10px Share Tech Mono';$core.ctx.textAlign='center';$core.ctx.textBaseline='middle';
$core.ctx.fillText(icon,pu.x,pu.y);$core.ctx.restore();
}
for(let g of $buildings.grenades){
if(g.fromTank){ $core.ctx.save();$core.ctx.globalAlpha=0.25+0.3*Math.abs(Math.sin($buildings.tick*0.25));$core.ctx.strokeStyle='#ff3300';$core.ctx.lineWidth=2;$core.ctx.beginPath();$core.ctx.arc(g.tx,g.ty,80,0,Math.PI*2);$core.ctx.stroke();$core.ctx.restore(); }
$core.ctx.save();$core.ctx.translate(g.x,g.y);$core.ctx.rotate(g.spin);
$core.ctx.fillStyle='#664400';$core.ctx.beginPath();$core.ctx.arc(0,0,5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#ffcc00';$core.ctx.beginPath();$core.ctx.arc(0,-3,2,0,Math.PI*2);$core.ctx.fill();
$core.ctx.shadowColor='#ffaa00';$core.ctx.shadowBlur=(8)*$core.SHADOW;$core.ctx.restore();
}
for(let b of $buildings.bullets){
if(b.x<-20||b.x>$replay.W+20||b.y<-20||b.y>$replay.H+20) continue;
if(b.wt==='laser'){
$core.ctx.save();$core.ctx.translate(b.x,b.y);$core.ctx.rotate(b.ang||0);
$core.ctx.shadowColor='#ff00ff';$core.ctx.shadowBlur=(16)*$core.SHADOW;
$core.ctx.strokeStyle='#ffffff';$core.ctx.lineWidth=2;$core.ctx.globalAlpha=0.9;
$core.ctx.beginPath();$core.ctx.moveTo(-10,0);$core.ctx.lineTo(10,0);$core.ctx.stroke();
$core.ctx.strokeStyle='#ff00ff';$core.ctx.lineWidth=4;$core.ctx.globalAlpha=0.5;
$core.ctx.beginPath();$core.ctx.moveTo(-10,0);$core.ctx.lineTo(10,0);$core.ctx.stroke();
$core.ctx.restore();
} else if(b.wt==='plasma'){
$core.ctx.save();const ang=Math.atan2(b.vy,b.vx);$core.ctx.translate(b.x,b.y);$core.ctx.rotate(ang);
$core.ctx.shadowColor='#00eeff';$core.ctx.shadowBlur=$core.isMobile?0:16*$core.SHADOW;
$core.ctx.fillStyle='#00eeff';$core.ctx.beginPath();$core.ctx.ellipse(0,0,b.sz*2.5,b.sz*1.1,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#aaffff';$core.ctx.beginPath();$core.ctx.ellipse(b.sz*0.4,0,b.sz*1.0,b.sz*0.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#ffffff';$core.ctx.beginPath();$core.ctx.ellipse(b.sz*0.6,0,b.sz*0.4,b.sz*0.25,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
}
}
$core.ctx.shadowBlur=0;
const drawList=_drawListPool;
let _dlN=0;
const _dlPush=(t,o,sy)=>{ let it=_drawEntryPool[_dlN]; if(it===undefined){ it=_drawEntryPool[_dlN]={t:t,o:o,sy:sy}; } else { it.t=t; it.o=o; it.sy=sy; } drawList[_dlN]=it; _dlN++; };
const CULL=80;
const _drawEnemies=_getAliveEnemies();
for(let e of _drawEnemies){
if(e.x<-CULL||e.x>$replay.W+CULL||e.y<-CULL||e.y>$replay.H+CULL) continue;
_dlPush('enemy',e,e.y+e.h/2);
}
_dlPush('player',$buildings.player,$buildings.player.y+20);
if($replay.coopEnabled&&$replay.player2&&!$replay.p2Down) _dlPush('player2',$replay.player2,$replay.player2.y+20);
for(let a of $buildings.allies){
if(!a.alive) continue;
if(a.x<-CULL||a.x>$replay.W+CULL||a.y<-CULL||a.y>$replay.H+CULL) continue;
_dlPush('ally',a,a.y+20);
}
for(let tr of $psycho1.trees) _dlPush('tree',tr,tr.y+2);
for(let pr of $psycho1.sceneProps){
if(pr.x<-CULL||pr.x>$replay.W+CULL||pr.y<-CULL||pr.y>$replay.H+CULL) continue;
_dlPush('prop',pr,pr.y+2);
}
drawList.length=_dlN;
if(drawList.length > 3) drawList.sort((a,b)=>a.sy-b.sy);
for(let item of drawList){
if(item.t==='tree'){
$props.drawTree(item.o,env);
} else if(item.t==='prop'){
$props.drawProp(item.o,env);
} else if(item.t==='enemy'){
const e=item.o;
if(!$core.isUltraLow || e.boss){
const _c=$core.ctx, _sr=e.boss?(e.isTank?36:22):12, _pa=_c.globalAlpha, _pf=_c.fillStyle;
_c.globalAlpha=0.3; _c.fillStyle='#000';
_c.beginPath();
_c.ellipse(e.x+$legendary._isoDX()*0.6, e.y+$legendary._isoDY()*0.6+_sr*0.4, _sr*1.1, _sr*0.45, 0, 0, Math.PI*2);
_c.fill();
_c.globalAlpha=_pa; _c.fillStyle=_pf;
}
if(!$buildings.settingPerfMode){
const _vis = $enemies.get(e.type).vis;
const _outlineR = e.boss ? (e.isTank?44:26) : _vis.outlineR;
const _blinkBomber = !!(_vis.blink && _vis.blink(e));
const _crowd=$buildings.enemies.length>14;
const _tr=e.si?e.st/e.si:0;
const _tele=!e.boss&&_tr>0.8&&!_vis.noTelegraph;
const _haloSkip=_crowd&&!e.boss&&!_vis.alwaysHalo&&!_blinkBomber&&!_tele;
const _outlineCol = e.boss ? 'rgba(255,80,0,0.9)' : _vis.outlineCol ? _vis.outlineCol : _blinkBomber ? 'rgba(255,0,0,0.95)' : (_tele?'rgba(255,50,30,0.95)':'rgba(255,255,255,0.55)');
if(!_haloSkip){
$core.ctx.save();
$core.ctx.translate(e.x, e.y);
if($core.isMobile){
$core.ctx.strokeStyle = e.boss ? 'rgba(255,80,0,0.7)' : _blinkBomber ? 'rgba(255,0,0,0.9)' : 'rgba(255,255,255,0.35)';
$core.ctx.lineWidth = e.boss ? 2.5 : 1.5;
$core.ctx.globalAlpha = e.boss ? 0.8 : 0.5;
$core.ctx.beginPath();
$core.ctx.ellipse(0, 0, _outlineR * 0.58, _outlineR * 0.72, 0, 0, Math.PI * 2);
$core.ctx.stroke();
} else {
$core.ctx.shadowColor = _outlineCol;
$core.ctx.shadowBlur = e.boss ? 14 : 8;
$core.ctx.globalAlpha = e.boss ? 0.85 : 0.6;
$core.ctx.fillStyle = _outlineCol;
$core.ctx.beginPath();
$core.ctx.ellipse(0, 0, _outlineR * 0.55, _outlineR * 0.7, 0, 0, Math.PI * 2);
$core.ctx.fill();
}
$core.ctx.restore();
}}
$core.ctx.save();$core.ctx.translate(e.x+(e._recoilOffX||0),e.y+(e._recoilOffY||0));
const facing=Math.atan2((e._aimY!==undefined?e._aimY:$buildings.player.y)-e.y,(e._aimX!==undefined?e._aimX:$buildings.player.x)-e.x);
if(!e.boss){
const _ant=e.si?Math.max(0,(e.st/e.si-0.8)/0.2):0;
const _hs=Math.min(8,e.hitFlash||0);
const _mv=(e.walkT%6.2832); 
if(_ant>0){$core.ctx.translate(-Math.cos(facing)*3.5*_ant,-Math.sin(facing)*3.5*_ant);$core.ctx.scale(1+0.10*_ant,1+0.10*_ant);}
if(_hs>0){$core.ctx.scale(1+_hs*0.012,1-_hs*0.012);}
}
if(e._hitPulse>0){const _sq=1+e._hitPulse*0.10;$core.ctx.scale(_sq,1/_sq);e._hitPulse=Math.max(0,e._hitPulse-0.22);}
const _dd=$enemies.get(e.type);
if(_dd.preDraw) _dd.preDraw(e,facing);
if(e.boss){
if(e.isTank)$props.drawTank(e,facing);
else $props.drawBoss(e,facing);
} else _dd.draw(e,facing);
if((e.hitFlash||0)>0){
$core.ctx.save();
$core.ctx.globalAlpha=Math.min(0.55,(e.hitFlash/8)*0.55);
$core.ctx.fillStyle='#ffffff';
$core.ctx.beginPath();$core.ctx.arc(0,0,e.w/2+2,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
e.hitFlash=Math.max(0,(e.hitFlash||0)-1);
}
if(e.poisoned>0){
$core.ctx.save();
$core.ctx.globalAlpha=0.5+Math.sin($buildings.tick*0.25)*0.2;
$core.ctx.strokeStyle='#88ff44';$core.ctx.lineWidth=2;
if(!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow){$core.ctx.shadowColor='#88ff44';$core.ctx.shadowBlur=6;}
$core.ctx.beginPath();$core.ctx.arc(0,0,e.w/2+5,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.restore();
}
$core.ctx.restore();
if(e.hp>0 && !(e.hp>=e.maxHp && !$enemies.get(e.type).vis.hpAlwaysOnLowEnd && !e.boss && ($core.isUltraLow||$core.isLowEndDesktop||$core.isMobile||$buildings.settingPerfMode) && $buildings.enemies.length>14)){
const _hv = $enemies.get(e.type).vis;
const _isProminent = _hv.prominent||e.boss;
const bw=e.isTank?120:e.boss?68:_hv.hpBarW?_hv.hpBarW:_isProminent?36:Math.max(18,e.w*0.9);
const bh=_isProminent?5:3;
const by=e.y-e.h/2-(_isProminent?20:14);
const _hc=$core.ctx, _hpa=_hc.globalAlpha, _hpf=_hc.fillStyle;
if(!_isProminent) _hc.globalAlpha=0.8;
_hc.fillStyle='#200000';_hc.fillRect(e.x-bw/2,by,bw,bh);
_hc.fillStyle=e.boss?'#ff3300':_hv.hpBarCol;
_hc.fillRect(e.x-bw/2,by,bw*(e.hp/e.maxHp),bh);
_hc.globalAlpha=_hpa; _hc.fillStyle=_hpf;
}
if(!e.boss && e.type !== 'soldier'){
const _iv = $enemies.get(e.type).vis;
const icon=_iv.icon;
const _showOnMobile = $core.isMobile && _iv.iconMobile;
if(icon && (!$core.isMobile || _showOnMobile)){
$core.ctx.save();
$core.ctx.font = $core.isMobile ? '9px Share Tech Mono' : '10px Share Tech Mono';
$core.ctx.textAlign='center';$core.ctx.textBaseline='middle';
$core.ctx.globalAlpha=$core.isMobile?0.7:0.85;
$core.ctx.fillText(icon, e.x, e.y-e.h/2-($core.isMobile?20:28));
$core.ctx.restore();
}
}
} else if(item.t==='ally'){
$core.ctx.save();$core.ctx.translate(item.o.x,item.o.y);$props.drawIsoShadow(11,0.28);$core.ctx.restore();
$props.drawAlly(item.o);
} else if(item.t==='player2'){
$core.ctx.save();$core.ctx.translate($replay.player2.x,$replay.player2.y);$props.drawIsoShadow(13,0.28);$core.ctx.restore();
$props.drawPlayer2();
} else {
$core.ctx.save();$core.ctx.translate($buildings.player.x,$buildings.player.y);$props.drawIsoShadow(14,0.32);$core.ctx.restore();
$props.drawPlayer();
if($buildings._drawGuardians) $buildings._drawGuardians();
}
}
if($replay.coopEnabled&&$replay.player2){
if($replay.p2Down){
$core.ctx.save();$core.ctx.globalAlpha=0.55+Math.sin($buildings.tick*0.15)*0.25;
$core.ctx.fillStyle=$replay.P2_COL;$core.ctx.font='bold 22px Share Tech Mono';$core.ctx.textAlign='center';$core.ctx.textBaseline='middle';
$core.ctx.fillText('x',$replay.player2.x,$replay.player2.y);
$core.ctx.fillStyle='rgba(0,80,255,0.18)';$core.ctx.beginPath();$core.ctx.arc($replay.player2.x,$replay.player2.y,22,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
if($replay.p2ReviveTimer>0){
$core.ctx.save();$core.ctx.strokeStyle=$replay.P2_COL;$core.ctx.lineWidth=3;$core.ctx.globalAlpha=0.85;
$core.ctx.beginPath();$core.ctx.arc($replay.player2.x,$replay.player2.y,24,-Math.PI/2,-Math.PI/2+($replay.p2ReviveTimer/$replay.REVIVE_FRAMES)*Math.PI*2);$core.ctx.stroke();
$core.ctx.restore();
}
}
if($replay.p1Down){
$core.ctx.save();$core.ctx.globalAlpha=0.55+Math.sin($buildings.tick*0.15)*0.25;
$core.ctx.fillStyle='#aaff00';$core.ctx.font='bold 22px Share Tech Mono';$core.ctx.textAlign='center';$core.ctx.textBaseline='middle';
$core.ctx.fillText('x',$buildings.player.x,$buildings.player.y);$core.ctx.restore();
if($replay.p1ReviveTimer>0){
$core.ctx.save();$core.ctx.strokeStyle='#aaff00';$core.ctx.lineWidth=3;$core.ctx.globalAlpha=0.85;
$core.ctx.beginPath();$core.ctx.arc($buildings.player.x,$buildings.player.y,24,-Math.PI/2,-Math.PI/2+($replay.p1ReviveTimer/$replay.REVIVE_FRAMES)*Math.PI*2);$core.ctx.stroke();
$core.ctx.restore();
}
}
}
if($core.ctx._godBolt && $core.ctx._godBolt.life>0){
const gb=$core.ctx._godBolt;
$core.ctx.save();
$core.ctx.strokeStyle='#ffff00';
$core.ctx.shadowColor='#ffd700';$core.ctx.shadowBlur=16*$core.SHADOW;
$core.ctx.lineWidth=2.5;$core.ctx.globalAlpha=Math.min(1,gb.life/3);
$core.ctx.beginPath();$core.ctx.moveTo(gb.x1,gb.y1);
const segs=5,dx=(gb.x2-gb.x1)/segs,dy=(gb.y2-gb.y1)/segs;
for(let s=1;s<segs;s++){
const jx=gb.x1+dx*s+(Math.random()-0.5)*14;
const jy=gb.y1+dy*s+(Math.random()-0.5)*14;
$core.ctx.lineTo(jx,jy);
}
$core.ctx.lineTo(gb.x2,gb.y2);
$core.ctx.stroke();
$core.ctx.restore();
gb.life--;
}
const _snipers=_getAliveEnemies();
const _laserStep = ($core.isUltraLow||$core.isLowEndDesktop) ? 32 : $core.isMobile ? 16 : 8;
const _laserRecalc = ($core.isUltraLow||$core.isLowEndDesktop) ? ($buildings.tick%3===0) : true;
for(let e of _snipers){
const _od=$enemies.get(e.type);
if(!_od.drawOverlay) continue;
_od.drawOverlay(e,{step:_laserStep,recalc:_laserRecalc});
}
drawDrone();
{const _c=$core.ctx,_cl=$buildings._synClouds,_fx=$buildings._synFX,_tk=$buildings.tick,_lo=_synLv()<2;
if(_cl&&_cl.length){
_c.save();
for(let i=0;i<_cl.length;i++){const q=_cl[i],f=Math.min(1,q.life/40)*Math.min(1,(q.max-q.life)/12+0.3),cs=q.cols;
_c.globalAlpha=0.22*f;_c.fillStyle=cs[0];_c.beginPath();_c.arc(q.x,q.y,q.r*(0.95+0.05*Math.sin(_tk*0.12+q.ph)),0,6.283);_c.fill();
if(!_lo){_c.globalAlpha=0.2*f;_c.fillStyle=cs[1];_c.beginPath();_c.arc(q.x+Math.cos(_tk*0.05+q.ph)*q.r*0.3,q.y+Math.sin(_tk*0.06+q.ph)*q.r*0.25,q.r*0.55,0,6.283);_c.fill();}
_c.globalAlpha=0.55*f;_c.strokeStyle=cs[2];_c.lineWidth=1.5;_c.beginPath();_c.arc(q.x,q.y,q.r,0,6.283);_c.stroke();
if(!_lo)for(let k=0;k<6;k++){const ph=(_tk*0.018+k*0.17+q.ph)%1,bx=q.x+Math.cos(k*2.1+q.ph)*q.r*0.65,by=q.y+q.r*0.5-ph*q.r*1.2;
_c.globalAlpha=(1-ph)*0.9*f;_c.fillStyle=cs[(k+1)%cs.length];_c.beginPath();_c.arc(bx,by,1.6+(k%3),0,6.283);_c.fill();}}
_c.restore();
}
if(_fx&&_fx.length){
_c.save();_c.lineCap='round';
for(let i=_fx.length-1;i>=0;i--){const o=_fx[i];o.life--;if(o.life<=0){_fx.splice(i,1);continue;}
const t=1-o.life/o.max,a=1-t,cs=o.cols;
if(o.k==='ring'){
const r=o.r*(0.25+0.75*t);
_c.globalAlpha=a;_c.strokeStyle=cs[0];_c.lineWidth=4*a+1;_c.beginPath();_c.arc(o.x,o.y,r,0,6.283);_c.stroke();
_c.globalAlpha=a*0.8;_c.strokeStyle=cs[1%cs.length];_c.lineWidth=2*a+0.5;_c.beginPath();_c.arc(o.x,o.y,r*0.72,0,6.283);_c.stroke();
}else if(o.k==='petals'){
const r=4+o.r*Math.sqrt(t);
for(let k=0;k<o.n;k++){const ang=o.rot+t*1.2+k*6.283/o.n;
if(_lo){_c.globalAlpha=a;_c.fillStyle=cs[k%cs.length];_c.fillRect(o.x+Math.cos(ang)*r-2,o.y+Math.sin(ang)*r-2,4,4);continue;}
_c.save();_c.translate(o.x+Math.cos(ang)*r,o.y+Math.sin(ang)*r);_c.rotate(ang);
_c.globalAlpha=a;_c.fillStyle=cs[k%cs.length];_c.beginPath();_c.ellipse(0,0,6*a+2,2.6*a+1,0,0,6.283);_c.fill();
_c.globalAlpha=a*0.9;_c.fillStyle='#ffffff';_c.beginPath();_c.arc(1,0,1,0,6.283);_c.fill();_c.restore();}
}else if(o.k==='burst'){
const r0=o.r*0.2+o.r*0.5*t,r1=o.r*(0.45+0.55*t);
for(let k=0;k<o.n;k++){const ang=o.rot+k*6.283/o.n;_c.globalAlpha=a;_c.strokeStyle=cs[k%cs.length];_c.lineWidth=(k%2?2.4:1.4)*a+0.6;
_c.beginPath();_c.moveTo(o.x+Math.cos(ang)*r0,o.y+Math.sin(ang)*r0);_c.lineTo(o.x+Math.cos(ang)*r1,o.y+Math.sin(ang)*r1);_c.stroke();
_c.fillStyle=cs[(k+1)%cs.length];_c.fillRect(o.x+Math.cos(ang)*r1-1.5,o.y+Math.sin(ang)*r1-1.5,3,3);}
}else if(o.k==='bolt'){
const P=o.pts;
if(!_lo){_c.globalAlpha=a*0.6;_c.strokeStyle=cs[0];_c.lineWidth=5;_c.beginPath();_c.moveTo(P[0][0],P[0][1]);for(let k=1;k<P.length;k++)_c.lineTo(P[k][0],P[k][1]);_c.stroke();}
_c.globalAlpha=a;_c.strokeStyle=cs[1%cs.length];_c.lineWidth=2.4;_c.beginPath();_c.moveTo(P[0][0],P[0][1]);for(let k=1;k<P.length;k++)_c.lineTo(P[k][0],P[k][1]);_c.stroke();
if(!_lo){_c.strokeStyle='#ffffff';_c.lineWidth=1;_c.beginPath();_c.moveTo(P[0][0],P[0][1]);for(let k=1;k<P.length;k++)_c.lineTo(P[k][0],P[k][1]);_c.stroke();}
}}
_c.restore();
}}
if($buildings.reloading&&$buildings.state==='playing'){
const _rw=$buildings.WEAPONS[$buildings.curWep];
const _rf=Math.max(1,Math.floor(_rw.reload*Math.max(0.4,1-$buildings.wepUpgrades[$buildings.curWep].reload*0.2)));
const _rp=Math.min(1,$buildings.reloadTimer/_rf);
const _c=$core.ctx;_c.save();
_c.lineWidth=2.5;_c.lineCap='round';
_c.strokeStyle='rgba(255,255,255,0.18)';
_c.beginPath();_c.arc($buildings.player.x,$buildings.player.y,22,0,Math.PI*2);_c.stroke();
_c.strokeStyle=_rp>0.85?'#ffffff':'#aaff00';
_c.beginPath();_c.arc($buildings.player.x,$buildings.player.y,22,-Math.PI/2,-Math.PI/2+_rp*Math.PI*2);_c.stroke();
_c.restore();
}
{const _rings=$buildings._impactRings;
if(_rings&&_rings.length){
for(let _i=_rings.length-1;_i>=0;_i--){
const _r=_rings[_i];_r.life--;
if(_r.life<=0){_rings.splice(_i,1);continue;}
const _t=1-_r.life/_r.maxLife;
$core.ctx.save();
$core.ctx.strokeStyle='rgba(255,255,255,'+((1-_t)*0.7)+')';$core.ctx.lineWidth=1.5;
$core.ctx.beginPath();$core.ctx.arc(_r.x,_r.y,_r.r+(_r.maxR-_r.r)*_t,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.restore();
}}}
for(let ft of $buildings.floatingTexts){
$core.ctx.save();
const a=Math.max(0,ft.life/60);
$core.ctx.globalAlpha=Math.min(1,a*1.4);
const sc=Math.max(0.1,ft.scale||1);
$core.ctx.translate(ft.x,ft.y);
$core.ctx.scale(sc,sc);
$core.ctx.fillStyle=ft.col;
$core.ctx.font=`bold ${ft.size}px 'Russo One', Oswald, sans-serif`;
$core.ctx.textAlign='center';
if(!$buildings.settingPerfMode && !$core.isVeryLow){ $core.ctx.shadowColor=ft.col;$core.ctx.shadowBlur=(10)*$core.SHADOW; }   /* glow is the expensive part on weak devices */
$core.ctx.fillText(ft.text,0,0);
$core.ctx.strokeStyle='rgba(0,0,0,0.6)';$core.ctx.lineWidth=2/sc;$core.ctx.strokeText(ft.text,0,0);
$core.ctx.restore();
}
if($buildings.grenadeCount>0&&$buildings.keys['KeyG']){
$core.ctx.save();$core.ctx.globalAlpha=0.25;$core.ctx.strokeStyle='#ffcc00';$core.ctx.lineWidth=1;$core.ctx.setLineDash([4,6]);
$core.ctx.beginPath();$core.ctx.arc($buildings.player.x,$buildings.player.y,280,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.setLineDash([]);$core.ctx.restore();
}
if($buildings.player.speedTimer>0&&($buildings.keys['KeyW']||$buildings.keys['KeyS']||$buildings.keys['KeyA']||$buildings.keys['KeyD']||$buildings.keys['ArrowUp']||$buildings.keys['ArrowDown']||$buildings.keys['ArrowLeft']||$buildings.keys['ArrowRight']))
ptcl($buildings.player.x,$buildings.player.y,'#ff00ff',1,1);
if($buildings.player.speedTimer>0){$core.ctx.save();$core.ctx.fillStyle='rgba(255,0,255,0.85)';$core.ctx.font='10px Share Tech Mono';$core.ctx.textAlign='center';$core.ctx.fillText('SPEED BOOST',$buildings.player.x,$buildings.player.y+52);$core.ctx.restore();}
const mx=$buildings.mouse.x,my=$buildings.mouse.y,cc=$buildings.curWep==='knife'?'#c8d8ff':'#7fff00';
/* weapon-specific reticle: wide arms = spread weapons, short arms + fat ring = explosive/energy, tight cross = precision */
const _ra=({shotgun:18,flamethrower:16,smg:14,minigun:14,rpg:10,plasmacutter:10,knife:8})[$buildings.curWep]||12;
const _fat=$buildings.curWep==='rpg'||$buildings.curWep==='plasmacutter';
$core.ctx.save();$core.ctx.strokeStyle=cc;$core.ctx.shadowColor=cc;$core.ctx.shadowBlur=(5)*$core.SHADOW;$core.ctx.lineWidth=_fat?2.2:1.5;$core.ctx.globalAlpha=0.85;
$core.ctx.beginPath();$core.ctx.moveTo(mx-_ra,my);$core.ctx.lineTo(mx-4,my);$core.ctx.moveTo(mx+4,my);$core.ctx.lineTo(mx+_ra,my);
$core.ctx.moveTo(mx,my-_ra);$core.ctx.lineTo(mx,my-4);$core.ctx.moveTo(mx,my+4);$core.ctx.lineTo(mx,my+_ra);
$core.ctx.stroke();$core.ctx.beginPath();$core.ctx.arc(mx,my,_fat?5:2,0,Math.PI*2);$core.ctx.stroke();$core.ctx.restore();
if(_hitmarkUntil>0){
const _hmNow=performance.now();
if(_hmNow<_hitmarkUntil){
const _t=1-(_hmNow-(_hitmarkUntil-90))/90;
const _c=$core.ctx; _c.save(); _c.strokeStyle='rgba(255,255,255,'+_t.toFixed(2)+')'; _c.lineWidth=2;
const _s=5+_t*3;
_c.beginPath();
for(const _a of [0.75,2.39,3.89,5.53]){ _c.moveTo(mx+Math.cos(_a)*_s,my+Math.sin(_a)*_s); _c.lineTo(mx+Math.cos(_a)*(_s+4),my+Math.sin(_a)*(_s+4)); }
_c.stroke(); _c.restore();
} else _hitmarkUntil=0;
}
if($buildings.reloading){
const reloadFrames=Math.floor($buildings.WEAPONS[$buildings.curWep].reload*Math.max(0.4,1-$buildings.wepUpgrades[$buildings.curWep].reload*0.2));
const pct=1-$buildings.reloadTimer/reloadFrames;
$core.ctx.save();$core.ctx.strokeStyle='#ffaa00';$core.ctx.shadowColor='#ffaa00';$core.ctx.shadowBlur=(6)*$core.SHADOW;$core.ctx.lineWidth=3;
$core.ctx.beginPath();$core.ctx.arc($buildings.player.x,$buildings.player.y-38,14,-Math.PI/2,-Math.PI/2+pct*Math.PI*2);$core.ctx.stroke();
$core.ctx.fillStyle='#ffaa00';$core.ctx.font='9px Share Tech Mono';$core.ctx.textAlign='center';$core.ctx.fillText('RELOAD',$buildings.player.x,$buildings.player.y-50);
$core.ctx.restore();
}
if($buildings.player.rapidTimer>0){$core.ctx.save();$core.ctx.fillStyle='rgba(255,170,0,0.85)';$core.ctx.font='10px Share Tech Mono';$core.ctx.textAlign='center';$core.ctx.fillText('RAPID FIRE',$buildings.player.x,$buildings.player.y+40);$core.ctx.restore();}
if(!$replay.p1Down){
const hpPct = $buildings.player.hp / $buildings.player.maxHp;
const ringCol = hpPct > 0.4 ? '#aaff00' : hpPct > 0.2 ? '#ffaa00' : '#ff3300';
const ringPulse = 0.55 + Math.sin($buildings.tick * 0.18) * 0.2;
$core.ctx.save();
$core.ctx.globalAlpha = ringPulse;
$core.ctx.strokeStyle = ringCol;
$core.ctx.lineWidth = 2;
if(!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow){ $core.ctx.shadowColor = ringCol; $core.ctx.shadowBlur = 8; }
$core.ctx.beginPath();
$core.ctx.ellipse($buildings.player.x, $buildings.player.y + 14, 14, 5, 0, 0, Math.PI * 2);
$core.ctx.stroke();
$core.ctx.globalAlpha = ringPulse * 0.7;
$core.ctx.fillStyle = ringCol;
$core.ctx.beginPath();
$core.ctx.arc($buildings.player.x, $buildings.player.y + 14, 2, 0, Math.PI * 2);
$core.ctx.fill();
$core.ctx.restore();
}
if(window.__DIY_STRESS && $weather.drawAllBiomeFX) $weather.drawAllBiomeFX(); else $weather.drawEnvironmentFX();
if($buildings._muzzleLight.life > 0 && !$core.isVeryLow){
const _ml = $buildings._muzzleLight;
const _alpha = (_ml.life / _ml.maxLife) * ($core.isMobile ? 0.32 : 0.48);
const _grad = $core.ctx.createRadialGradient(_ml.x,_ml.y,0,_ml.x,_ml.y,_ml.r);
_grad.addColorStop(0, _ml.col + Math.round(_alpha*255).toString(16).padStart(2,'0'));
_grad.addColorStop(0.35, _ml.col + Math.round(_alpha*0.45*255).toString(16).padStart(2,'0'));
_grad.addColorStop(1, _ml.col + '00');
$core.ctx.save();
$core.ctx.globalCompositeOperation = 'lighter';
$core.ctx.globalAlpha = 1;
$core.ctx.fillStyle = _grad;
$core.ctx.beginPath();
$core.ctx.arc(_ml.x, _ml.y, _ml.r, 0, Math.PI*2);
$core.ctx.fill();
$core.ctx.restore();
_ml.life--;
}
if($buildings._cvFlash > 0){
$core.ctx.save();
$core.ctx.globalAlpha = $buildings._cvFlash / 7;
$core.ctx.fillStyle = $buildings._cvFlashColor;
$core.ctx.fillRect(0, 0, $replay.W, $replay.H);
$core.ctx.restore();
$buildings._cvFlash--;
}
_drawEnemyMuzzleFlashes();
drawHelicopter();
drawAlienShip();
drawFighterJet();
drawArmoredCars();
drawSpiderTank();
drawHarmTug();
if($buildings._waveDef) window.__engine.waves.draw();
_drawDamageIndicators();
_drawOffscreenBossIndicators();
$core.ctx.restore();
}
function _drawDamageIndicators(){
const L=$buildings._dmgInd; if(!L || !L.length) return;
const ctx=$core.ctx, p=$buildings.player, T=$buildings.tick, LIFE=45;
ctx.save();
for(let i=L.length-1;i>=0;i--){
const d=L[i], age=T-d.t0;
if(age<0 || age>=LIFE){ L.splice(i,1); continue; }
const a=1-age/LIFE, r=46+age*0.3;
ctx.globalAlpha=Math.min(1,a*1.5);
ctx.strokeStyle='#ff2a2a'; ctx.fillStyle='#ff4040'; ctx.lineWidth=7; ctx.lineCap='round';
ctx.shadowColor='#ff0000'; ctx.shadowBlur=10*($core.SHADOW||0);
ctx.beginPath(); ctx.arc(p.x,p.y,r,d.a-0.4,d.a+0.4); ctx.stroke();
ctx.beginPath();
ctx.moveTo(p.x+Math.cos(d.a)*(r+17), p.y+Math.sin(d.a)*(r+17));
ctx.lineTo(p.x+Math.cos(d.a-0.17)*(r+3), p.y+Math.sin(d.a-0.17)*(r+3));
ctx.lineTo(p.x+Math.cos(d.a+0.17)*(r+3), p.y+Math.sin(d.a+0.17)*(r+3));
ctx.closePath(); ctx.fill();
}
ctx.restore();
}
function _drawOffscreenBossIndicators(){
if($buildings.state !== 'playing' || !$buildings.bossAlive) return;
const MARGIN = 28;
const SIZE = 11;
const PULSE = 0.55 + Math.sin($buildings.tick * 0.12) * 0.45;
const targets = [];
if(typeof $psycho2.fighterJet !== 'undefined' && $psycho2.fighterJet && $psycho2.fighterJet.alive && ($psycho2.fighterJet.x < 0 || $psycho2.fighterJet.x > $replay.W || $psycho2.fighterJet.y < 0 || $psycho2.fighterJet.y > $replay.H)){
const isMissileLock = $psycho2.fighterJet.mode === 'missile' && !$psycho2.fighterJet.missileFired;
targets.push({ x: $psycho2.fighterJet.x, y: $psycho2.fighterJet.y, color: isMissileLock ? '#ff3300' : '#ffaa00' });
}
if(typeof $psycho2.armoredCars !== 'undefined'){
$psycho2.armoredCars.forEach(c => {
if(c.alive && (c.x < 0 || c.x > $replay.W || c.y < 0 || c.y > $replay.H))
targets.push({ x: c.x, y: c.y, color: '#ffcc00' });
});
}
if(typeof $psycho2.helicopter !== 'undefined' && $psycho2.helicopter && $psycho2.helicopter.alive && ($psycho2.helicopter.x < 0 || $psycho2.helicopter.x > $replay.W || $psycho2.helicopter.y < 0 || $psycho2.helicopter.y > $replay.H))
targets.push({ x: $psycho2.helicopter.x, y: $psycho2.helicopter.y, color: '#00ccff' });
if(typeof $psycho2.alienShip !== 'undefined' && $psycho2.alienShip && $psycho2.alienShip.alive && ($psycho2.alienShip.x < 0 || $psycho2.alienShip.x > $replay.W || $psycho2.alienShip.y < 0 || $psycho2.alienShip.y > $replay.H))
targets.push({ x: $psycho2.alienShip.x, y: $psycho2.alienShip.y, color: '#cc44ff' });
if(typeof $psycho2.spiderTank !== 'undefined' && $psycho2.spiderTank && $psycho2.spiderTank.alive && ($psycho2.spiderTank.x < 0 || $psycho2.spiderTank.x > $replay.W || $psycho2.spiderTank.y < 0 || $psycho2.spiderTank.y > $replay.H))
targets.push({ x: $psycho2.spiderTank.x, y: $psycho2.spiderTank.y, color: '#ff4444' });
if(!targets.length) return;
$core.ctx.save();
targets.forEach(t => {
const cx = $replay.W / 2, cy = $replay.H / 2;
const angle = Math.atan2(t.y - cy, t.x - cx);
const cosA = Math.cos(angle), sinA = Math.sin(angle);
const tx_edge = Math.max(MARGIN, Math.min($replay.W - MARGIN, cx + cosA * $replay.W));
const ty_edge = Math.max(MARGIN, Math.min($replay.H - MARGIN, cy + sinA * $replay.H));
let scale = Infinity;
if(cosA !== 0) scale = Math.min(scale, ((cosA > 0 ? $replay.W - MARGIN : MARGIN) - cx) / cosA);
if(sinA !== 0) scale = Math.min(scale, ((sinA > 0 ? $replay.H - MARGIN : MARGIN) - cy) / sinA);
const ax = cx + cosA * scale;
const ay = cy + sinA * scale;
$core.ctx.globalAlpha = 0.25 + PULSE * 0.65;
$core.ctx.fillStyle = t.color;
$core.ctx.shadowColor = t.color;
$core.ctx.shadowBlur = 8;
$core.ctx.save();
$core.ctx.translate(ax, ay);
$core.ctx.rotate(angle);
$core.ctx.beginPath();
$core.ctx.moveTo(SIZE, 0);
$core.ctx.lineTo(-SIZE * 0.7, SIZE * 0.6);
$core.ctx.lineTo(-SIZE * 0.3, 0);
$core.ctx.lineTo(-SIZE * 0.7, -SIZE * 0.6);
$core.ctx.closePath();
$core.ctx.fill();
$core.ctx.restore();
});
$core.ctx.globalAlpha = 1;
$core.ctx.shadowBlur = 0;
$core.ctx.restore();
}
const ISO_DX = 10;
const ISO_DY = 10;
function _isoFlat(){ return $core.isMobile && $buildings.settingPerfMode; }
function _isoDX(){ return _isoFlat() ? 0 : ISO_DX; }
function _isoDY(){ return _isoFlat() ? 0 : ISO_DY; }
const _SNOW_OVERHANG=14; ;$legendary._SNOW_OVERHANG = _SNOW_OVERHANG;
function buildBuildingSnowCache(b,w){
const capH=7;
const oc=document.createElement('canvas');
oc.width=Math.max(1,Math.ceil(w));
oc.height=_SNOW_OVERHANG+capH+14;
const c=oc.getContext('2d');
c.fillStyle='rgba(240,250,255,0.82)';
c.fillRect(0,_SNOW_OVERHANG,w,capH);
c.fillStyle='rgba(255,255,255,0.7)';
const driftSegs=Math.max(2,Math.floor(w/18));
for(let ds=0;ds<driftSegs;ds++){
const dx=ds*(w/driftSegs)+w/(driftSegs*2);
const driftH=4+((ds*73+b.x)%5);
c.beginPath();c.ellipse(dx,_SNOW_OVERHANG,w/(driftSegs*1.5),driftH,0,Math.PI,Math.PI*2);c.fill();
}
c.strokeStyle='rgba(180,220,255,0.55)';c.lineWidth=1.2;
const icicleCount=Math.floor(w/14);
for(let ic=0;ic<icicleCount;ic++){
const ix=8+ic*(w-16)/Math.max(1,icicleCount-1);
const ilen=4+((ic*47+b.y)%7);
c.beginPath();c.moveTo(ix,_SNOW_OVERHANG+capH);c.lineTo(ix,_SNOW_OVERHANG+capH+ilen);c.stroke();
}
b._snowCache=oc;
b._snowCacheW=w;
}
const _frostColorCache={};
function _frostColor(alpha){
const key=Math.round(alpha*50);
let s=_frostColorCache[key];
if(!s){s=`rgba(160,220,255,${key/50})`;_frostColorCache[key]=s;}
return s;
}
});