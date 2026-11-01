window.__engine.files.push(function* buildings() {
const $bosses = window.__engine.bosses;
const $buildings = window.__engine.buildings;
const $core = window.__engine.core;
const $legendary = window.__engine.legendary;
const $profiler = window.__engine.profiler;
const $psycho1 = window.__engine.psycho1;
const $psycho2 = window.__engine.psycho2;
const $replay = window.__engine.replay;
const { buildNavField, buildingOverlap, onBuilding } = $psycho1;
Object.assign($buildings, { _checkRunMilestones, _clearGameTimers, _codeToLabel, _compactEnemies, _gcsi, _getAliveEnemies, _getGodModeBadge, _gridQuery, _gsi, _gst, _isExclusiveUnlocked, _markEnemiesDirty, _rebuildSpatialGrid, _resetMilestones, _saveKeybinds, _spawnMuzzleEffect, _updateHotkeyBarHints, applyChaosReroll, buildGroundCache, buildMutatorConfig, doorPos, el, explodeDamageBuildings, moveBossToward, showPickupMsg, unstuckBoss });
yield;

function explodeDamageBuildings(x,y,radius,maxDmg){
let _anyDestroyed=false;
let _destroyedCount=0;
for(let i=$psycho1.buildings.length-1;i>=0;i--){
const b=$psycho1.buildings[i];
const cx=b.x+b.w/2, cy=b.y+b.h/2;
const reach=radius+Math.max(b.w,b.h)/2;
const d=Math.hypot(cx-x,cy-y);
if(d>=reach) continue;
const dmg=Math.ceil(maxDmg*(1-d/reach));
if(dmg<=0) continue;
b.hp=(b.hp==null?$psycho1.BUILDING_MAX_HP:b.hp)-dmg;
b.spawnFlash=1.0;
if(b.hp<=0){ destroyBuilding(b,i,true,_destroyedCount); _anyDestroyed=true; _destroyedCount++; }
}
if(_anyDestroyed){
$psycho1.buildingGrid.rebuild($psycho1.buildings);
if(typeof buildNavField==='function') buildNavField();
}
}
function destroyBuilding(b,idx,skipRebuild,_batchIndex=0){
const cx=b.x+b.w/2, cy=b.y+b.h/2;
$bosses.shake(10);
$bosses.ptclBurst(cx,cy,'#888888',$core.isMobile?12:26,8,26,4);
$bosses.ptclBurst(cx,cy,'#553311',$core.isMobile?8:16,6,20,3);
const _isBatchOverflow = _batchIndex >= 4;
const rubbleCount = _isBatchOverflow ? 1 : ($core.isUltraLow?2:$core.isMobile?4:8);
for(let i=0;i<rubbleCount;i++) $buildings.debrisArr.push({x:cx+(Math.random()-0.5)*b.w*0.6,y:cy+(Math.random()-0.5)*b.h*0.6,r:14+Math.random()*10,life:600,maxLife:600,col:'#3a3a3a'});
$psycho1.dirtPatches.push({x:cx,y:cy,rx:b.w*0.55,ry:b.h*0.55,rot:Math.random()*Math.PI});
$psycho1.buildings.splice(idx,1);
if(!skipRebuild){
$psycho1.buildingGrid.rebuild($psycho1.buildings);
if(typeof buildNavField==='function') buildNavField();
}
$psycho2.addKillFeed('BUILDING DEMOLISHED','#ff8800',true);
if(!_isBatchOverflow) audioManager.explosion();
if($buildings.state==='playing' && !_isBatchOverflow) showPickupMsg('STRUCTURE DEMOLISHED','#ff8800');
}
function moveBossToward(ex,ey,tx,ty,spd,pad){
const dx=tx-ex,dy=ty-ey,dist=Math.hypot(dx,dy);
if(dist<1) return {x:ex,y:ey};
const _sdt = spd*(window._dt||1);
const mvx=dx/dist*_sdt, mvy=dy/dist*_sdt;
const fx=ex+mvx, fy=ey+mvy;
if(!onBuilding(fx,fy,pad)) return {x:fx,y:fy};
const ax=ex+mvx, ay=ey;
if(!onBuilding(ax,ay,pad)) return {x:ax,y:ay};
const bx=ex, by=ey+mvy;
if(!onBuilding(bx,by,pad)) return {x:bx,y:by};
const ov=buildingOverlap(fx,fy,pad);
if(ov){
const t1x=-ov.ny, t1y=ov.nx;
const t2x=ov.ny, t2y=-ov.nx;
const tangents=[[t1x,t1y],[t2x,t2y],[-t1x,-t1y],[-t2x,-t2y]];
tangents.sort((a,b)=>(b[0]*dx+b[1]*dy)-(a[0]*dx+a[1]*dy));
for(const [ttx,tty] of tangents){
const sx=ex+ttx*spd, sy=ey+tty*spd;
if(!onBuilding(sx,sy,pad)) return {x:sx,y:sy};
const hx=ex+ttx*spd*0.5, hy=ey+tty*spd*0.5;
if(!onBuilding(hx,hy,pad)) return {x:hx,y:hy};
}
const dot=mvx*t1x+mvy*t1y;
if(Math.abs(dot)>0.01){
const px=ex+t1x*dot, py=ey+t1y*dot;
if(!onBuilding(px,py,pad)) return {x:px,y:py};
}
}
const baseAngle=Math.atan2(dy,dx);
let bestAngle=null, bestScore=-Infinity;
for(let step=1;step<=18;step++){
for(const sign of [1,-1]){
const a=baseAngle+sign*step*(Math.PI/18);
const cax=Math.cos(a), cay=Math.sin(a);
const cx=ex+cax*spd, cy=ey+cay*spd;
if(!onBuilding(cx,cy,pad)){
const score=cax*(dx/dist)+cay*(dy/dist);
if(score>bestScore){ bestScore=score; bestAngle={x:cx,y:cy}; }
} else {
const hx=ex+cax*spd*0.5, hy=ey+cay*spd*0.5;
if(!onBuilding(hx,hy,pad)){
const score=(cax*(dx/dist)+cay*(dy/dist))*0.5;
if(score>bestScore){ bestScore=score; bestAngle={x:hx,y:hy}; }
}
}
}
}
if(bestAngle) return bestAngle;
const ov2=buildingOverlap(ex,ey,pad);
if(ov2){
const px=ex+ov2.nx*(ov2.depth+spd+1), py=ey+ov2.ny*(ov2.depth+spd+1);
if(!onBuilding(px,py,pad)) return {x:px,y:py};
return {x:ex+ov2.nx*(ov2.depth+pad+4),y:ey+ov2.ny*(ov2.depth+pad+4)};
}
return {x:ex,y:ey};
}
function unstuckBoss(bx,by,pad){
if(!onBuilding(bx,by,pad)) return {x:bx,y:by};
const ov=buildingOverlap(bx,by,pad);
if(ov){
const px=bx+ov.nx*(ov.depth+pad+2), py=by+ov.ny*(ov.depth+pad+2);
if(!onBuilding(px,py,pad)) return {x:px,y:py};
const px2=bx+ov.nx*(ov.depth+pad*2+6), py2=by+ov.ny*(ov.depth+pad*2+6);
if(!onBuilding(px2,py2,pad)) return {x:px2,y:py2};
}
for(let r=pad+4;r<=pad*4+32;r+=8){
for(let a=0;a<Math.PI*2;a+=Math.PI/4){
const cx=bx+Math.cos(a)*r, cy=by+Math.sin(a)*r;
if(!onBuilding(cx,cy,pad)) return {x:cx,y:cy};
}
}
const _safeX = $replay.W/2, _safeY = $replay.H*0.45;
if(typeof $buildings.player !== 'undefined' && $buildings.player){
const _pdx = _safeX - $buildings.player.x, _pdy = _safeY - $buildings.player.y;
const _pd = Math.hypot(_pdx, _pdy);
if(_pd < 120){
const _a = Math.atan2(_pdy, _pdx) + Math.PI;
return {x: _safeX + Math.cos(_a)*130, y: _safeY + Math.sin(_a)*130};
}
}
return {x:_safeX, y:_safeY};
}
function doorPos(b){
const hw=b.w/2,hh=b.h/2;
if(b.door==='n')return{x:b.x+hw,y:b.y-22};
if(b.door==='s')return{x:b.x+hw,y:b.y+b.h+22};
if(b.door==='e')return{x:b.x+b.w+22,y:b.y+hh};
return{x:b.x-22,y:b.y+hh};
}
function _gcDprCap(){
const d=window.devicePixelRatio||1;
return $core.lowMemTier ? Math.min(d,2) : d;
}
function buildGroundCache(){
bakeOnce($psycho1,'groundCache',{},()=>{
const _t0=performance.now();
if($core.isUltraLow || $core.isLowEndDesktop){ _buildGroundCacheSimple(); }
else { _buildGroundCacheRich(); }
$psycho1._gcLastMs=performance.now()-_t0;
if(window.__DIY_DEBUG) console.debug('[groundCache] built in '+$psycho1._gcLastMs.toFixed(1)+'ms');
});
}
let _gcPrewarmPending=false;
function prewarmGroundCache(){
if(_gcPrewarmPending || $psycho1.groundCache || !$replay.W || !$replay.H) return;
_gcPrewarmPending=true;
const run=()=>{ _gcPrewarmPending=false; try{ buildGroundCache(); }catch(e){} };
if(typeof requestIdleCallback==='function') requestIdleCallback(run,{timeout:250});
else setTimeout(run,0);
}
$buildings.prewarmGroundCache=prewarmGroundCache;
function _buildGroundCacheSimple(){
const _grs=Math.min(_gcDprCap(),Math.max(0.25,($core.canvas.width||$replay.W)/($replay.W||1)));
const oc=document.createElement('canvas');oc.width=Math.round($replay.W*_grs);oc.height=Math.round($replay.H*_grs);
const oc2=oc.getContext('2d');if(_grs!==1)oc2.setTransform(_grs,0,0,_grs,0,0);
const env=$psycho1.ENVS[$replay.currentEnv];
if($replay.currentEnv==='warzone'){ $paintWarzonePixel(oc2,$replay.W,$replay.H,$psycho1.buildings); $psycho1.groundCache=oc; return; }
if($replay.currentEnv==='spaceship'){
const g=oc2.createLinearGradient(0,0,$replay.W,$replay.H);
g.addColorStop(0,'#04080f');g.addColorStop(0.5,'#09122a');g.addColorStop(1,'#050a1c');
oc2.fillStyle=g;oc2.fillRect(0,0,$replay.W,$replay.H);
oc2.strokeStyle='rgba(0,60,180,0.25)';oc2.lineWidth=2;
const ps=60;
for(let px=0;px<$replay.W;px+=ps){for(let py=0;py<$replay.H;py+=ps){
oc2.strokeRect(px+2,py+2,ps-4,ps-4);
oc2.fillStyle='rgba(0,40,120,0.08)';oc2.fillRect(px+2,py+2,ps-4,ps-4);
}}
oc2.shadowColor='#0066ff';oc2.shadowBlur=12;
oc2.strokeStyle='rgba(0,100,255,0.2)';oc2.lineWidth=3;
for(let py=ps*2;py<$replay.H;py+=ps*4){
oc2.beginPath();oc2.moveTo(0,py);oc2.lineTo($replay.W,py);oc2.stroke();
}
oc2.shadowBlur=0;
$psycho1.groundCache=oc;return;
}
if($replay.currentEnv==='mars'){
const g=oc2.createLinearGradient(0,0,$replay.W,$replay.H);
g.addColorStop(0,'#3a1408');g.addColorStop(0.4,'#5a2010');g.addColorStop(1,'#4a1a0c');
oc2.fillStyle=g;oc2.fillRect(0,0,$replay.W,$replay.H);
oc2.globalAlpha=0.18;
const _mrDirtN=($core.isUltraLow||$core.isLowEndDesktop)?8:$core.isMobile?14:24;
for(let i=0;i<_mrDirtN;i++){
const cx=Math.random()*$replay.W, cy=Math.random()*$replay.H;
const cr=18+Math.random()*60;
const cg2=oc2.createRadialGradient(cx,cy,cr*0.2,cx,cy,cr);
cg2.addColorStop(0,'#2a0e04');cg2.addColorStop(0.6,'#5a2010');cg2.addColorStop(1,'transparent');
oc2.fillStyle=cg2;oc2.beginPath();oc2.ellipse(cx,cy,cr,cr*0.6,Math.random()*Math.PI,0,Math.PI*2);oc2.fill();
}
oc2.globalAlpha=0.25;oc2.fillStyle='#7a3820';
for(let d of $psycho1.dirtPatches){oc2.save();oc2.translate(d.x,d.y);oc2.rotate(d.rot);oc2.beginPath();oc2.ellipse(0,0,d.rx,d.ry,0,0,Math.PI*2);oc2.fill();oc2.restore();}
oc2.globalAlpha=0.35;oc2.strokeStyle='#2a0e04';oc2.lineWidth=1.5;
for(let b of $psycho1.grassBlades){oc2.beginPath();oc2.moveTo(b.x,b.y);oc2.lineTo(b.x+b.lean*b.h*0.5,b.y-b.h*0.4);oc2.stroke();}
oc2.globalAlpha=1;
$psycho1.groundCache=oc;return;
}
const g=oc2.createLinearGradient(0,0,$replay.W,$replay.H);
g.addColorStop(0,env.g0);g.addColorStop(0.5,env.g1);g.addColorStop(1,env.g2);
oc2.fillStyle=g;oc2.fillRect(0,0,$replay.W,$replay.H);
if($replay.currentEnv==='desert'){ $paintDesertPixel(oc2,$replay.W,$replay.H,$psycho1.buildings); $psycho1.groundCache=oc; return; }
if($replay.currentEnv==='urban'||$replay.currentEnv==='night'){
const asphalt = $replay.currentEnv==='night'?'#141414':'#1a1c2a';
oc2.fillStyle=asphalt;oc2.fillRect(0,0,$replay.W,$replay.H);
oc2.globalAlpha=0.07;
for(let i=0;i<300;i++){
oc2.fillStyle=Math.random()>0.5?'#fff':'#000';
oc2.fillRect(Math.random()*$replay.W,Math.random()*$replay.H,Math.random()*4+1,Math.random()*4+1);
}
oc2.globalAlpha=1;
oc2.setLineDash([18,14]);
oc2.strokeStyle=$replay.currentEnv==='night'?'rgba(255,220,0,0.55)':'rgba(255,220,0,0.4)';
oc2.lineWidth=2.5;
const laneW=90;
for(let lx=laneW;lx<$replay.W;lx+=laneW){
oc2.beginPath();oc2.moveTo(lx,0);oc2.lineTo(lx,$replay.H);oc2.stroke();
}
for(let ly=laneW;ly<$replay.H;ly+=laneW){
oc2.beginPath();oc2.moveTo(0,ly);oc2.lineTo($replay.W,ly);oc2.stroke();
}
oc2.setLineDash([]);
oc2.globalAlpha=0.18;
oc2.fillStyle='#888';
for(let lx=0;lx<$replay.W;lx+=laneW){oc2.fillRect(lx-3,0,6,$replay.H);}
for(let ly=0;ly<$replay.H;ly+=laneW){oc2.fillRect(0,ly-3,$replay.W,6);}
oc2.globalAlpha=1;
oc2.globalAlpha=0.22;oc2.fillStyle='#ffffff';
for(let lx=laneW;lx<$replay.W;lx+=laneW){
for(let ly=laneW;ly<$replay.H;ly+=laneW){
for(let s=0;s<5;s++){oc2.fillRect(lx-22+s*9,ly-3,7,6);}
for(let s=0;s<5;s++){oc2.fillRect(lx-3,ly-22+s*9,6,7);}
}
}
oc2.globalAlpha=1;
} else if($replay.currentEnv==='arctic'){
const snowG=oc2.createLinearGradient(0,0,$replay.W,$replay.H);
snowG.addColorStop(0,'#d8ecf8');snowG.addColorStop(0.4,'#e8f4ff');snowG.addColorStop(0.75,'#cce0f0');snowG.addColorStop(1,'#b8d0e4');
oc2.fillStyle=snowG;oc2.fillRect(0,0,$replay.W,$replay.H);
const rng=(seed)=>{let s=seed;return()=>{s=(s*1664525+1013904223)&0xffffffff;return(s>>>0)/0xffffffff;};};
const r=rng(42);
oc2.globalAlpha=0.07;
for(let i=0;i<120;i++){
const px=r()*$replay.W,py=r()*$replay.H,pr=12+r()*40;
oc2.fillStyle=r()>0.5?'#ffffff':'#a8c8de';
oc2.beginPath();oc2.ellipse(px,py,pr,pr*0.55,r()*Math.PI,0,Math.PI*2);oc2.fill();
}
oc2.globalAlpha=0.18;oc2.strokeStyle='rgba(200,230,255,0.9)';oc2.lineWidth=0.8;
const r2=rng(137);
const crystalCount=$core.isMobile?14:30;
for(let i=0;i<crystalCount;i++){
const cx=r2()*$replay.W,cy=r2()*$replay.H,cs=6+r2()*14;
oc2.save();oc2.translate(cx,cy);oc2.rotate(r2()*Math.PI);
for(let sp=0;sp<6;sp++){
const ang=sp*Math.PI/3;
oc2.beginPath();oc2.moveTo(0,0);oc2.lineTo(Math.cos(ang)*cs,Math.sin(ang)*cs);oc2.stroke();
const bx=Math.cos(ang)*cs*0.55,by=Math.sin(ang)*cs*0.55;
const ba=ang+Math.PI/2;
oc2.beginPath();oc2.moveTo(bx-Math.cos(ba)*cs*0.22,by-Math.sin(ba)*cs*0.22);
oc2.lineTo(bx+Math.cos(ba)*cs*0.22,by+Math.sin(ba)*cs*0.22);oc2.stroke();
}
oc2.restore();
}
oc2.globalAlpha=0.13;oc2.strokeStyle='#7090a8';oc2.lineWidth=1;
const r3=rng(271);
const crackCount=$core.isMobile?8:18;
for(let i=0;i<crackCount;i++){
let cx=r3()*$replay.W,cy=r3()*$replay.H;
const ang=r3()*Math.PI*2;
const len=40+r3()*120;
const segs=4+Math.floor(r3()*5);
oc2.beginPath();oc2.moveTo(cx,cy);
let ca=ang;
for(let s=0;s<segs;s++){
cx+=Math.cos(ca)*(len/segs);cy+=Math.sin(ca)*(len/segs);
ca+=( r3()-0.5)*0.8;
oc2.lineTo(cx,cy);
if(r3()>0.6){
oc2.moveTo(cx,cy);
const ba=ca+(r3()>0.5?0.6:-0.6);
oc2.lineTo(cx+Math.cos(ba)*20,cy+Math.sin(ba)*20);
oc2.moveTo(cx,cy);
}
}
oc2.stroke();
}
oc2.globalAlpha=0.14;oc2.fillStyle='#a0b8cc';
const pathW=30;
for(let b of $psycho1.buildings){
oc2.fillRect(0,b.y+b.h/2-pathW/2,$replay.W,pathW);
oc2.fillRect(b.x+b.w/2-pathW/2,0,pathW,$replay.H);
}
oc2.globalAlpha=0.22;
for(let b of $psycho1.buildings){
oc2.fillStyle='#eef8ff';
oc2.beginPath();oc2.ellipse(b.x+b.w*0.5,b.y+b.h+8,b.w*0.45,10,0,0,Math.PI*2);oc2.fill();
oc2.beginPath();oc2.ellipse(b.x+b.w*0.5,b.y-8,b.w*0.35,8,0,0,Math.PI*2);oc2.fill();
}
oc2.globalAlpha=1;
} else {
oc2.globalAlpha=0.2;oc2.fillStyle=env.dirt;
for(let d of $psycho1.dirtPatches){oc2.save();oc2.translate(d.x,d.y);oc2.rotate(d.rot);oc2.beginPath();oc2.ellipse(0,0,d.rx,d.ry,0,0,Math.PI*2);oc2.fill();oc2.restore();}
oc2.globalAlpha=0.12;oc2.fillStyle=env.dirt;
const pathW=30;
for(let b of $psycho1.buildings){
oc2.fillRect(0,b.y+b.h/2-pathW/2,$replay.W,pathW);
oc2.fillRect(b.x+b.w/2-pathW/2,0,pathW,$replay.H);
}
oc2.globalAlpha=0.5;
for(let b of $psycho1.grassBlades){oc2.strokeStyle=b.col;oc2.lineWidth=b.lw;oc2.beginPath();oc2.moveTo(b.x,b.y);oc2.quadraticCurveTo(b.x+b.lean*b.h*0.8,b.y-b.h*0.55,b.x+b.lean*b.h*1.5,b.y-b.h);oc2.stroke();}
oc2.globalAlpha=1;
}
$psycho1.groundCache=oc;
}
/* ===== WAR ZONE GROUND (gritty textured flat) ===== */
/* ===== WAR ZONE PIXEL-ART GROUND ===== */
function $paintWarzonePixel(ctx,W,H,buildings){
const PX=window.__artPX(W,H);
const gw=Math.ceil(W/PX),gh=Math.ceil(H/PX);
const cv=document.createElement('canvas');cv.width=gw;cv.height=gh;
const g=cv.getContext('2d');const img=g.createImageData(gw,gh);const d=img.data;
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const GR=['#100e0c','#191714','#23201b','#2e2a24','#3a352d','#484238','#5a5448'].map(hex);
const AS=['#0a0a0b','#111112','#18181a','#212123','#2b2b2d','#363638'].map(hex);
const SKH=['#120e0c','#1a110d','#271810','#3a2314','#53321a','#6e4624'],SK=SKH.map(hex);
let s=0x5a17+((W*31+H*17)|0);const rnd=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
const hash=(x,y,k)=>{let h=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(k,2147483647))>>>0;h=(Math.imul(h^(h>>>13),1274126177))>>>0;return((h^(h>>>16))>>>0)/4294967296;};
const vnoise=(x,y,sc,k)=>{const fx=x/sc,fy=y/sc,ix=Math.floor(fx),iy=Math.floor(fy);let tx=fx-ix,ty=fy-iy;tx=tx*tx*(3-2*tx);ty=ty*ty*(3-2*ty);const a=hash(ix,iy,k),b=hash(ix+1,iy,k),c=hash(ix,iy+1,k),e=hash(ix+1,iy+1,k);return(a+(b-a)*tx)*(1-ty)+(c+(e-c)*tx)*ty;};
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const info={puddles:[],smolders:[],far:[],hs:0};$psycho1._wzGround=info;
const hs=0;   // no skyline strip: top-down view
const ry=Math.round(gh*(0.56+rnd()*0.06)),rx=Math.round(gw*(0.47+rnd()*0.06)),rw=Math.max(14,Math.round(Math.min(gw,gh)*0.14));
const craters=[];for(let i=0;i<6;i++)craters.push({x:Math.round(14+rnd()*(gw-28)),y:Math.round(hs+14+rnd()*(gh-hs-28)),r:Math.round(4+rnd()*5)});
const bl=buildings.map(b=>({x:b.x/PX,y:b.y/PX,w:b.w/PX,h:b.h/PX}));
// ---- terrain pass (ramp + ordered dither) ----
for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){
let col;
if(y<hs){
const t=y/hs,bay=BAYER[(y&3)*4+(x&3)]/16-0.5;
col=SK[Math.max(0,Math.min(5,Math.round(t*5.2+bay*0.9)))];
}else{
const road=Math.abs(y-ry)<rw/2||(Math.abs(x-rx)<rw/2);
let lvl;
if(road)lvl=2.3+(vnoise(x,y,12,3)-0.5)*1.5;else lvl=2.7+(vnoise(x,y,26,1)-0.5)*2.2+(vnoise(x,y,8,2)-0.5)*0.9;
for(let k=0;k<craters.length;k++){const c=craters[k],dd=Math.hypot(x-c.x,(y-c.y)*1.25)/(c.r*2.6);if(dd<1)lvl-=(1-dd)*2.6;}
for(let k=0;k<bl.length;k++){const b=bl[k],dx=Math.max(b.x-x,0,x-(b.x+b.w)),dy=Math.max(b.y-y,0,y-(b.y+b.h)),dd=Math.hypot(dx,dy);if(dd<14)lvl-=(1-dd/14)*1.4;}
const ex=Math.max(Math.abs(x/gw-0.5),Math.abs(y/gh-0.5))*2,vv=Math.max(0,ex-0.6)/0.4;lvl-=Math.pow(vv,1.6)*1.8;
const bay=(BAYER[(y&3)*4+(x&3)]/16-0.5)*0.9,ramp=road?AS:GR;
let li=Math.max(0,Math.min(ramp.length-1,Math.round(lvl+bay)));
const gr=hash(x,y,21);if(gr>0.992)li=Math.min(ramp.length-1,li+2);else if(gr<0.006)li=Math.max(0,li-2);
col=ramp[li];
}
const o=(y*gw+x)*4;d[o]=col[0];d[o+1]=col[1];d[o+2]=col[2];d[o+3]=255;
}
g.putImageData(img,0,0);
const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h);};
const line=(x0,y0,x1,y1,c)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0||1;for(let i=0;i<=n;i++)R(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,1,1,c);};
// ---- road furniture ----
for(let x=0;x<gw;x+=7){if(hash(x,1,5)>0.3&&Math.abs(x-rx)>rw/2+3)R(x,ry,4,1,hash(x,2,5)>0.5?'#8a7430':'#a38d3a');}
for(let y=hs+4;y<gh;y+=7){if(hash(y,3,5)>0.3&&Math.abs(y-ry)>rw/2+3)R(rx,y,1,4,'#8a7430');}
const kerb=(x,y,w,h)=>{R(x,y,w,h,'#5a5448');};
kerb(0,ry-(rw>>1),gw,1);kerb(0,ry+(rw>>1),gw,1);R(0,ry-(rw>>1)-1,gw,1,'#23201b');R(0,ry+(rw>>1)+1,gw,1,'#23201b');
kerb(rx-(rw>>1),hs,1,gh-hs);kerb(rx+(rw>>1),hs,1,gh-hs);
for(let i=0;i<6;i++)if(hash(i,9,5)>0.25)R(rx-(rw>>1)+2+i*Math.floor(rw/6),ry-(rw>>1)-5,2,4,'#9a968a');
// ---- cracks (random walks) ----
const crack=(x,y,n)=>{let a=rnd()*6.283;for(let i=0;i<n;i++){R(x,y,1,1,'#040404');a+=(rnd()-0.5)*0.9;x+=Math.round(Math.cos(a)*1.4);y+=Math.round(Math.sin(a)*1.4);if(rnd()<0.08)crack(x,y,(n/3)|0);}};
for(let i=0;i<26;i++)crack(Math.round(rnd()*gw),Math.round(hs+4+rnd()*(gh-hs-6)),8+((rnd()*16)|0));
// ---- broken asphalt patches ----
for(let i=0;i<5;i++){const cx=Math.round(10+rnd()*(gw-20)),cy=Math.round(hs+10+rnd()*(gh-hs-20)),r=3+((rnd()*5)|0);
for(let y=-r;y<=r;y++)for(let x=-r*1.4;x<=r*1.4;x++){const dd=Math.hypot(x/1.4,y)+(hash(cx+x|0,cy+y,3)-0.5)*1.5;if(dd<r)R(cx+x,cy+y,1,1,hash(x|0,y,4)>0.7?'#3a2c20':'#271d15');}}
// ---- pavements ----
for(const b of bl){
const x0=Math.round(b.x)-3,y0=Math.round(b.y)-3,w=Math.round(b.w)+6,h=Math.round(b.h)+6;
R(x0,y0,w,h,'#37332c');
g.fillStyle='#2a2620';for(let i=6;i<w;i+=7)g.fillRect(x0+i,y0,1,h);for(let j=6;j<h;j+=7)g.fillRect(x0,y0+j,w,1);
g.fillStyle='#14110e';g.fillRect(x0,y0,w,1);g.fillRect(x0,y0+h-1,w,1);g.fillRect(x0,y0,1,h);g.fillRect(x0+w-1,y0,1,h);
for(let k=0;k<2;k++){const cx=hash(k,Math.round(b.x),6)>0.5?x0:x0+w-3,cy=hash(k,Math.round(b.y),7)>0.5?y0:y0+h-3;R(cx,cy,3,3,'#1b1814');}
}
// ---- craters ----
for(const c of craters){
for(let y=-c.r*1.4;y<=c.r*1.4;y++)for(let x=-c.r*1.4;x<=c.r*1.4;x++){
const dd=Math.hypot(x,y*1.2)/c.r;let col=null;
if(dd<0.45)col='#030302';else if(dd<0.85)col='#0b0907';else if(dd<1.15)col=(x+y<0)?'#5a5448':'#2a2620';
if(col)R(c.x+x,c.y+y,1,1,col);
}
for(let k=0;k<12;k++){const a=rnd()*6.283,dd=c.r*(1.3+rnd()*1.2);R(c.x+Math.cos(a)*dd,c.y+Math.sin(a)*dd*0.8,1+((rnd()*2)|0),1,rnd()<0.5?'#2c2620':'#5a5144');}
if(rnd()<0.55)info.smolders.push({x:c.x*PX,y:c.y*PX,r:c.r*PX});
}
// ---- puddles ----
for(let i=0;i<7;i++){
const px=Math.round(8+rnd()*(gw-16)),py=Math.round(hs+10+rnd()*(gh-hs-20)),rx2=Math.round(4+rnd()*7),ry2=Math.max(2,Math.round(rx2*(0.4+rnd()*0.2)));
for(let y=-ry2-1;y<=ry2+1;y++)for(let x=-rx2-1;x<=rx2+1;x++){
const nd=Math.hypot(x/(rx2+0.5),y/(ry2+0.5));if(nd>1)continue;
let col=nd>0.82?'#0c1114':(y<-ry2*0.2?'#2c424b':'#1b2a31');
if(nd<=0.82&&((x+y)&1)===0&&y>ry2*0.1&&rnd()<0.35)col='#7a4220';
if(nd<=0.82&&y===-1&&x>-rx2*0.5&&x<rx2*0.3)col='#6f929e';
R(px+x,py+y,1,1,col);
}
info.puddles.push({x:px*PX,y:py*PX,rx:rx2*PX,ry:ry2*PX,rot:0});
}
// ---- rubble piles, rebar and glass ----
const GRY=['#5c584e','#47443c','#6d685c','#38352f','#7a7366'];
const chunk=(x,y,w,h,c)=>{R(x-1,y-1,w+2,h+2,'#0a0806');R(x,y,w,h,c);R(x,y,w,1,'rgba(255,255,255,0.25)');R(x,y+h-1,w,1,'rgba(0,0,0,0.35)');};
for(let i=0;i<9;i++){
const x=Math.round(8+rnd()*(gw-16)),y=Math.round(hs+6+rnd()*(gh-hs-12)),r=3+((rnd()*5)|0);
for(let k=0;k<6+((rnd()*6)|0);k++){chunk(x+Math.round((rnd()-0.5)*r*2.4),y+Math.round((rnd()-0.5)*r*1.2),2+((rnd()*3)|0),2+((rnd()*2)|0),GRY[(rnd()*5)|0]);}
for(let k=0;k<2+((rnd()*2)|0);k++){const a=-Math.PI/2+(rnd()-0.5)*2.2,l=4+((rnd()*5)|0),sx=x+Math.round((rnd()-0.5)*r),sy=y+Math.round((rnd()-0.5)*r*0.5);line(sx,sy,sx+Math.cos(a)*l,sy+Math.sin(a)*l,rnd()<0.5?'#6a3a1e':'#8a4a26');}
for(let k=0;k<6;k++)R(x+Math.round((rnd()-0.5)*r*3),y+Math.round((rnd()-0.5)*r*1.8),1,1,rnd()<0.6?'#9fc4cc':'#e0f2f4');
}
for(let i=0;i<45;i++)R(rnd()*gw,hs+2+rnd()*(gh-hs-4),1,1,'#9fc4cc');
info.hs=hs*PX;
ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(cv,0,0,gw,gh,0,0,gw*PX,gh*PX);ctx.restore();
}

function $paintWarzoneGround(c,W,H,buildings,rich){
const rng=(seed)=>{let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};};
const R=rng(0x5a17+((W*31+H*17)|0));
const info={puddles:[],smolders:[],far:[],hs:0};
$psycho1._wzGround=info;
const hs=Math.round(Math.min(120,H*0.17)); info.hs=hs;
let g=c.createLinearGradient(0,0,W,H);
g.addColorStop(0,'#312e29');g.addColorStop(0.5,'#3a362f');g.addColorStop(1,'#25221e');
c.fillStyle=g;c.fillRect(0,0,W,H);
// ash / dirt mottling
const nBl=rich?46:20;
for(let i=0;i<nBl;i++){
const x=R()*W,y=R()*H,r=40+R()*120,dark=R()<0.55;
const rg=c.createRadialGradient(x,y,0,x,y,r);
rg.addColorStop(0,dark?'rgba(10,8,6,0.22)':'rgba(120,108,90,0.13)');rg.addColorStop(1,'rgba(0,0,0,0)');
c.fillStyle=rg;c.fillRect(x-r,y-r,r*2,r*2);
}
// roads
const roadW=Math.max(72,Math.min(W,H)*0.14);
const ry=H*(0.56+R()*0.06), rx=W*(0.47+R()*0.06);
const road=(x,y,w,h)=>{
c.fillStyle='#22211e';c.fillRect(x,y,w,h);
c.fillStyle='rgba(255,255,255,0.025)';c.fillRect(x,y,w,h*0.5);
};
road(0,ry-roadW/2,W,roadW); road(rx-roadW/2,hs,roadW,H-hs);
// kerbs
c.strokeStyle='#4b473e';c.lineWidth=3;
c.beginPath();c.moveTo(0,ry-roadW/2);c.lineTo(W,ry-roadW/2);c.moveTo(0,ry+roadW/2);c.lineTo(W,ry+roadW/2);c.stroke();
c.beginPath();c.moveTo(rx-roadW/2,hs);c.lineTo(rx-roadW/2,H);c.moveTo(rx+roadW/2,hs);c.lineTo(rx+roadW/2,H);c.stroke();
// broken centre line
c.fillStyle='rgba(176,150,60,0.5)';
for(let x=0;x<W;x+=44){ if(R()<0.3) continue; if(Math.abs(x-rx)<roadW/2+10) continue; c.fillRect(x,ry-1.5,24,3); }
for(let y=hs+10;y<H;y+=44){ if(R()<0.3) continue; if(Math.abs(y-ry)<roadW/2+10) continue; c.fillRect(rx-1.5,y,3,24); }
// crosswalk remnants
c.fillStyle='rgba(210,205,190,0.22)';
for(let s=0;s<6;s++){ if(R()<0.3) continue; c.fillRect(rx-roadW/2+s*roadW/6+3,ry-roadW/2-16,roadW/12,12); }
// asphalt cracks
const crack=(x,y,len,lw)=>{
c.beginPath();c.moveTo(x,y);let a=R()*6.283;
for(let i=0;i<len;i++){ a+=(R()-0.5)*1.1; x+=Math.cos(a)*(6+R()*8); y+=Math.sin(a)*(6+R()*8); c.lineTo(x,y); }
c.lineWidth=lw;c.stroke();
};
c.strokeStyle='rgba(0,0,0,0.6)';
const nCr=rich?34:14;
for(let i=0;i<nCr;i++){ crack(R()*W,hs+R()*(H-hs),4+((R()*6)|0),0.8+R()*1.4); }
// broken-up asphalt (exposed dirt)
for(let i=0;i<(rich?9:4);i++){
const x=R()*W,y=hs+R()*(H-hs),r=14+R()*30;
c.fillStyle='#2b2118';c.beginPath();
const n=7+((R()*4)|0);
for(let k=0;k<n;k++){const a=k/n*6.283,rr=r*(0.6+R()*0.6);k?c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr*0.7):c.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr*0.7);}
c.closePath();c.fill();
c.strokeStyle='rgba(120,108,90,0.35)';c.lineWidth=1.5;c.stroke();
for(let k=0;k<5;k++){c.fillStyle='#3a3126';c.fillRect(x+(R()-0.5)*r*1.4,y+(R()-0.5)*r,2+R()*3,2+R()*3);}
}
// pavements round buildings
const sw=11;
for(const b of buildings){
c.fillStyle='#403d36';c.fillRect(b.x-sw,b.y-sw,b.w+sw*2,b.h+sw*2);
c.strokeStyle='#15130f';c.lineWidth=2;c.strokeRect(b.x-sw,b.y-sw,b.w+sw*2,b.h+sw*2);
c.globalAlpha=0.4;c.lineWidth=1;
for(let jx=b.x-sw+12;jx<b.x+b.w+sw;jx+=20){c.beginPath();c.moveTo(jx,b.y-sw);c.lineTo(jx,b.y);c.moveTo(jx,b.y+b.h);c.lineTo(jx,b.y+b.h+sw);c.stroke();}
c.globalAlpha=1;
// scorch beneath building
const sg=c.createRadialGradient(b.x+b.w/2,b.y+b.h/2,Math.min(b.w,b.h)*0.3,b.x+b.w/2,b.y+b.h/2,Math.max(b.w,b.h)*0.85);
sg.addColorStop(0,'rgba(0,0,0,0.5)');sg.addColorStop(1,'rgba(0,0,0,0)');
c.fillStyle=sg;c.fillRect(b.x-60,b.y-60,b.w+120,b.h+120);
}
// craters
const nCrat=rich?6:3;
for(let i=0;i<nCrat;i++){
const x=70+R()*(W-140),y=hs+60+R()*(H-hs-120),r=16+R()*22;
const sg=c.createRadialGradient(x,y,r*0.4,x,y,r*2.6);
sg.addColorStop(0,'rgba(0,0,0,0.6)');sg.addColorStop(1,'rgba(0,0,0,0)');
c.fillStyle=sg;c.beginPath();c.ellipse(x,y,r*2.6,r*2.0,0,0,6.283);c.fill();
c.fillStyle='#4a4236';c.beginPath();c.ellipse(x,y,r*1.15,r*0.85,0,0,6.283);c.fill();
c.fillStyle='#0f0c09';c.beginPath();c.ellipse(x,y+1,r*0.9,r*0.65,0,0,6.283);c.fill();
c.fillStyle='#050403';c.beginPath();c.ellipse(x,y+3,r*0.55,r*0.38,0,0,6.283);c.fill();
for(let k=0;k<10;k++){const a=R()*6.283,d=r*(1.2+R()*1.3);c.fillStyle=R()<0.5?'#2c2620':'#5a5144';c.fillRect(x+Math.cos(a)*d,y+Math.sin(a)*d*0.75,2+R()*3,2+R()*3);}
if(R()<0.5) info.smolders.push({x:x,y:y,r:r});
}
// puddles
const nP=rich?8:4;
for(let i=0;i<nP;i++){
const x=40+R()*(W-80),y=hs+30+R()*(H-hs-60),rx2=14+R()*24,ry2=rx2*(0.4+R()*0.25),rot=(R()-0.5)*0.6;
c.save();c.translate(x,y);c.rotate(rot);
c.fillStyle='#11161a';c.beginPath();c.ellipse(0,0,rx2+3,ry2+3,0,0,6.283);c.fill();
const pg=c.createLinearGradient(0,-ry2,0,ry2);pg.addColorStop(0,'#46585f');pg.addColorStop(1,'#1b262b');
c.fillStyle=pg;c.beginPath();c.ellipse(0,0,rx2,ry2,0,0,6.283);c.fill();
c.fillStyle='rgba(255,122,40,0.14)';c.beginPath();c.ellipse(rx2*0.2,ry2*0.2,rx2*0.55,ry2*0.4,0,0,6.283);c.fill();
c.strokeStyle='rgba(170,200,210,0.4)';c.lineWidth=1.2;c.beginPath();c.ellipse(0,0,rx2*0.8,ry2*0.7,0,3.4,4.9);c.stroke();
c.restore();
info.puddles.push({x:x,y:y,rx:rx2,ry:ry2,rot:rot});
}
// rubble piles + rebar + glass
const nRub=rich?16:7;
const greys=['#5c584e','#47443c','#6d685c','#38352f','#7a7366'];
for(let i=0;i<nRub;i++){
const x=30+R()*(W-60),y=hs+20+R()*(H-hs-50),r=10+R()*20;
c.fillStyle='rgba(0,0,0,0.3)';c.beginPath();c.ellipse(x+3,y+4,r*1.1,r*0.55,0,0,6.283);c.fill();
const n=6+((R()*7)|0);
for(let k=0;k<n;k++){
const cx=x+(R()-0.5)*r*1.8,cy=y+(R()-0.5)*r*1.0,s=3+R()*r*0.42,a=R()*6.283;
c.fillStyle=greys[(R()*greys.length)|0];c.beginPath();
for(let v=0;v<4;v++){const aa=a+v*1.57+(R()-0.5)*0.7,rr=s*(0.7+R()*0.5);v?c.lineTo(cx+Math.cos(aa)*rr,cy+Math.sin(aa)*rr*0.75):c.moveTo(cx+Math.cos(aa)*rr,cy+Math.sin(aa)*rr*0.75);}
c.closePath();c.fill();c.strokeStyle='rgba(0,0,0,0.55)';c.lineWidth=1;c.stroke();
}
c.strokeStyle='#6a3a1e';c.lineWidth=1.3;
for(let k=0;k<2+((R()*3)|0);k++){
const a=-Math.PI/2+(R()-0.5)*2.4,l=12+R()*18,sx=x+(R()-0.5)*r,sy=y+(R()-0.5)*r*0.5;
c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+Math.cos(a)*l*0.6,sy+Math.sin(a)*l*0.6);c.lineTo(sx+Math.cos(a+0.5)*l,sy+Math.sin(a+0.5)*l);c.stroke();
}
c.fillStyle='rgba(168,200,210,0.6)';
for(let k=0;k<6;k++){const gx=x+(R()-0.5)*r*2.6,gy=y+(R()-0.5)*r*1.6;c.beginPath();c.moveTo(gx,gy);c.lineTo(gx+2+R()*3,gy+1);c.lineTo(gx+1,gy+2+R()*3);c.closePath();c.fill();}
}
// scattered glass sparkle fields
c.fillStyle='rgba(190,220,230,0.5)';
for(let i=0;i<(rich?220:80);i++){const gx=R()*W,gy=hs+R()*(H-hs);c.fillRect(gx,gy,1+R()*1.5,1+R()*1.5);}
// scorch streaks
c.strokeStyle='rgba(0,0,0,0.16)';c.lineCap='round';
for(let i=0;i<3;i++){c.lineWidth=5+R()*5;c.beginPath();const x=R()*W,y=hs+R()*(H-hs);c.moveTo(x,y);c.quadraticCurveTo(x+80+R()*80,y+(R()-0.5)*80,x+160+R()*120,y+(R()-0.5)*120);c.stroke();}
c.lineCap='butt';
// grain
const nG=rich?1800:500;
for(let i=0;i<nG;i++){c.fillStyle=R()<0.5?'rgba(255,240,220,0.05)':'rgba(0,0,0,0.12)';c.fillRect(R()*W,R()*H,1+R()*2,1+R()*2);}
// ===== background horizon strip =====
const sk=c.createLinearGradient(0,0,0,hs);
sk.addColorStop(0,'#14100e');sk.addColorStop(0.55,'#3c2b20');sk.addColorStop(1,'#6b5238');
c.fillStyle=sk;c.fillRect(0,0,W,hs);
for(let i=0;i<3;i++){
const fx=W*(0.15+R()*0.7),fy=hs*(0.65+R()*0.3);
const fg=c.createRadialGradient(fx,fy,0,fx,fy,hs*1.1);
fg.addColorStop(0,'rgba(255,140,50,0.55)');fg.addColorStop(1,'rgba(255,90,20,0)');
c.fillStyle=fg;c.fillRect(fx-hs*1.2,0,hs*2.4,hs);
info.far.push({x:fx,y:fy});
}
const skyline=(col,hMin,hMax,wMin,wMax,win)=>{
let x=-10;
while(x<W+10){
const w=wMin+R()*(wMax-wMin),h=hs*(hMin+R()*(hMax-hMin));
c.fillStyle=col;c.beginPath();c.moveTo(x,hs);c.lineTo(x,hs-h);
const broken=R()<0.55;
if(broken){c.lineTo(x+w*0.3,hs-h);c.lineTo(x+w*0.45,hs-h*(0.75+R()*0.1));c.lineTo(x+w*0.6,hs-h*0.9);c.lineTo(x+w*0.8,hs-h*0.7);c.lineTo(x+w,hs-h*0.8);}
else c.lineTo(x+w,hs-h);
c.lineTo(x+w,hs);c.closePath();c.fill();
if(win){c.fillStyle='rgba(255,170,70,0.5)';for(let k=0;k<4;k++){if(R()<0.25)c.fillRect(x+3+R()*(w-8),hs-h*0.7+R()*h*0.6,2,3);}}
if(R()<0.18){c.strokeStyle=col;c.lineWidth=1;c.beginPath();c.moveTo(x+w*0.5,hs-h);c.lineTo(x+w*0.5+(R()-0.5)*8,hs-h-12);c.stroke();}
x+=w*(0.8+R()*0.3);
}
};
skyline('#2d231c',0.35,0.75,22,50,false);
skyline('#0f0d0b',0.2,0.6,26,60,true);
// baked smoke plumes in strip
for(let p=0;p<(rich?4:2);p++){
const px=W*(0.1+R()*0.8);
for(let k=0;k<7;k++){
const rr=14+k*6+R()*8,py=hs*0.6-k*hs*0.12;
const sg=c.createRadialGradient(px+(R()-0.5)*14+k*3,py,0,px+k*3,py,rr);
sg.addColorStop(0,'rgba(10,8,7,0.55)');sg.addColorStop(1,'rgba(10,8,7,0)');
c.fillStyle=sg;c.fillRect(px-rr*1.4,py-rr,rr*2.8+k*6,rr*2);
}
}
// ruined barrier at strip foot
c.fillStyle='#12100d';c.fillRect(0,hs-2,W,10);
for(let x=0;x<W;x+=14){const bh=R()<0.4?7+R()*7:0;if(bh)c.fillRect(x,hs-2-bh,8+R()*5,bh);}
const fs=c.createLinearGradient(0,hs+8,0,hs+44);fs.addColorStop(0,'rgba(0,0,0,0.55)');fs.addColorStop(1,'rgba(0,0,0,0)');
c.fillStyle=fs;c.fillRect(0,hs+8,W,36);
// vignette
const vg=c.createRadialGradient(W*0.5,H*0.5,Math.min(W,H)*0.2,W*0.5,H*0.5,Math.max(W,H)*0.8);
vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(8,5,3,0.5)');
c.fillStyle=vg;c.fillRect(0,0,W,H);
}

/* ===== DESERT PIXEL-ART GROUND (v97) ===== */
function $paintDesertPixel(ctx, W, H, buildings){
  const PX = window.__artPX(W,H);   // logical px per art-pixel
  const gw = Math.ceil(W/PX), gh = Math.ceil(H/PX);
  const cv = document.createElement('canvas'); cv.width = gw; cv.height = gh;
  const g = cv.getContext('2d'); const img = g.createImageData(gw, gh); const d = img.data;
  const hex = h => [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  // sand ramp: shadow -> highlight
  const SAND = ['#5e5470','#85665c','#a8742e','#cf983c','#e6b552','#f4cf78','#fbe3a0'].map(hex); // [0],[1] = cool reflected-skylight shadows
  const CLAY = ['#7a4a1e','#8e5a26','#a06c30'].map(hex);
  const CRACK = hex('#4e2e12');
  let s = 90210; const rnd = () => { s = (s*1664525+1013904223)>>>0; return s/4294967296; };
  const hash = (x,y,k) => { let h = (x*374761393 + y*668265263 + k*2147483647)>>>0; h = ((h^(h>>>13))*1274126177)>>>0; return ((h^(h>>>16))>>>0)/4294967296; };
  const vnoise = (x,y,sc,k) => { const fx=x/sc, fy=y/sc, ix=Math.floor(fx), iy=Math.floor(fy); let tx=fx-ix, ty=fy-iy; tx=tx*tx*(3-2*tx); ty=ty*ty*(3-2*ty);
    const a=hash(ix,iy,k),b=hash(ix+1,iy,k),c=hash(ix,iy+1,k),e=hash(ix+1,iy+1,k); return (a+(b-a)*tx)*(1-ty)+(c+(e-c)*tx)*ty; };
  const BAYER = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
  const CELL = 17; // clay voronoi cell size (art px)
  for(let y=0;y<gh;y++){
    for(let x=0;x<gw;x++){
      // wind-swept dune ridges: diagonal sine bands warped by noise
      const warp = vnoise(x,y,60,1)*3.2 + vnoise(x,y,17,2)*0.7;
      const ph = (x*0.55 + y*0.83)/26 + warp;
      const f = ph - Math.floor(ph);                 // 0..1 saw: slow windward rise, sharp lee drop
      let lvl = f < 0.8 ? 2.4 + (f/0.8)*1.4 : 1.7 - ((f-0.8)/0.2)*1.9; // 0..4.6
      lvl += (vnoise(x,y,7,3)-0.5)*0.7;
      const bay = (BAYER[(y&3)*4+(x&3)]/16 - 0.5)*0.9; // ordered dither between tones
      let li = Math.max(0, Math.min(6, Math.round(lvl + bay) + 1));
      let col = SAND[li];
      // cracked clay pans
      const pan = vnoise(x,y,70,7);
      if(pan > 0.7){
        const cx = Math.floor(x/CELL), cy = Math.floor(y/CELL);
        let d1=9e9,d2=9e9;
        for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){
          const px=(cx+i+hash(cx+i,cy+j,11)*0.8+0.1)*CELL, py=(cy+j+hash(cx+i,cy+j,12)*0.8+0.1)*CELL;
          const dd=Math.hypot(x-px,y-py); if(dd<d1){d2=d1;d1=dd;} else if(dd<d2) d2=dd;
        }
        if(d2-d1 < 1.15) col = CRACK;
        else col = CLAY[Math.min(2, Math.max(0, Math.round(vnoise(x,y,5,9)*2 + bay)))];
      }
      // sparse grit pixels
      const gr = hash(x,y,21);
      if(gr > 0.992) col = SAND[Math.max(0,li-2)]; else if(gr < 0.006) col = SAND[Math.min(6,li+2)];
      const o=(y*gw+x)*4; d[o]=col[0];d[o+1]=col[1];d[o+2]=col[2];d[o+3]=255;
    }
  }
  g.putImageData(img,0,0);

  // ---------- props (hand-drawn pixel sprites) ----------
  const PAL = {a:'#27421a',g:'#3f6b2a',G:'#5c9440',h:'#8cc25e',k:'#2a1a0e',q:'#5a4028',r:'#7a5a3a',R:'#a8845a',
    w:'#f2e9d2',W:'#c4b898',p:'#a8482a',P:'#d9733f',o:'#6e3016',s:'#7a5c22',S:'#b0904a',t:'#8c6c34',c:'#2a2420',e:'#d4502a',y:'#f0b030',m:'#5a3d1c',f:'#e8a8b8'};
  const SPR = {
    saguaro:[ "....gh....","...agGh...","...agGh.a.","a..agGh.gh","gh.agGh.gh","gh.agGhagh","ghagagGhgh","aghgGGGhgh",".aggagGha.","...agGh...","...agGh...","...agGh...","...agGh...","..aagGhh..","..kkkkkk.." ],
    barrel:[ "..f.f..","..aGGa.","aGhGGGa","aGhGGGa","aGGhGGa",".aGGGa.","..qqq.."],
    pear:[ ".f..f..",".aGGa.f","aGhGGGa","aGGhGa.",".aGGGGa","..aGGhG","...kqk."],
    rock:[ "..qrr...",".qrRRr..","qrRRRrq.","qrRRrrqq",".qqrrqq."],
    rockS:[ ".qrr.","qrRRq",".qqq."],
    skull:[ ".wwww.","wwWwwW","wkwwkw","wwwwww",".wkwkw",".WwWw."],
    ribs:[ "w.w.w.w","wwwwwww",".W.W.W.","wwwwwww"],
    bone:[ "w....w","wwwwww","w....w"],
    pot:[ "..oo..",".pPPp.","pPPPPp","pPPpPp",".pppp."],
    shard:[ ".pP.","pPPp",".pp."],
    shrub:[ ".s.s..s.","sSsSs.sS",".SsSSsS.","sSSsSSSs",".mmmmmm."],
    weed:[ "..tt.tt..",".t.tt.t.t","tt.t.tt.t","t.tt.t.tt",".t.tt.tt.","..tt.tt..."],
    ash:[ "..cc....",".ccccc..","cecycce.","ccccccc",".cccec..","..ccc..."],
    log:[ "mmmmmmmm","qrrrrrrq"]
  };
  const sprCache = {};
  function sprite(name){
    if(sprCache[name]) return sprCache[name];
    const rows = SPR[name], h = rows.length, w = Math.max(...rows.map(r=>r.length));
    const c = document.createElement('canvas'); c.width = w; c.height = h; const cc = c.getContext('2d');
    rows.forEach((r,y)=>{ for(let x=0;x<r.length;x++){ const ch=r[x]; if(ch==='.'||ch===' ') continue; cc.fillStyle=PAL[ch]; cc.fillRect(x,y,1,1);} });
    return (sprCache[name] = c);
  }
  const blocked = (ax,ay,aw,ah) => {
    for(const b of buildings||[]) if(ax*PX < b.x+b.w+14 && (ax+aw)*PX > b.x-14 && ay*PX < b.y+b.h+14 && (ay+ah)*PX > b.y-14) return true;
    return false;
  };
  const area = (W*H)/(900*600);
  const plan = [['saguaro',3],['barrel',3],['pear',3],['rock',6],['rockS',9],['shrub',9],['weed',4],['skull',2],['ribs',1],['bone',3],['pot',2],['shard',4],['ash',1],['log',1]];
  const _lowT = !!($core.isUltraLow || $core.isMobile), _maxTries = _lowT ? 8 : 25, _chkOverlap = !_lowT;
  const placed = []; const items = [];
  for(const [name,n] of plan){
    const count = Math.max(1, Math.round(n*area));
    for(let k=0;k<count;k++){
      for(let tries=0;tries<_maxTries;tries++){
        const sp = sprite(name), ax = Math.floor(rnd()*(gw-sp.width-2))+1, ay = Math.floor(rnd()*(gh-sp.height-2))+1;
        if(blocked(ax,ay,sp.width,sp.height)) continue;
        if(_chkOverlap && placed.some(p => Math.abs(p[0]-ax)<14 && Math.abs(p[1]-ay)<12)) continue;
        placed.push([ax,ay]); items.push({name,ax,ay,sp,flip:rnd()<0.5}); break;
      }
    }
  }
  items.sort((a,b)=>(a.ay+a.sp.height)-(b.ay+b.sp.height));
  const SH = 'rgba(70,52,92,0.46)';
  for(const it of items){
    const {sp,ax,ay,name} = it, w = sp.width, h = sp.height;
    // pixel shadow: flat dark ellipse at the base, offset right/down (sun upper-left)
    g.fillStyle = SH;
    const sw = Math.max(3, w), sh = name==='saguaro' ? 3 : Math.max(2, Math.ceil(h/3));
    for(let yy=0; yy<sh; yy++){ const inset = yy===0||yy===sh-1 ? 1 : 0; g.fillRect(ax+1+inset, ay+h-1+yy, sw-inset*2+(name==='saguaro'?4:1), 1); }
    if(it.flip){ g.save(); g.translate(ax+w, ay); g.scale(-1,1); g.drawImage(sp,0,0); g.restore(); }
    else g.drawImage(sp, ax, ay);
  }
  // tire-track / footprint trails: two parallel dashed lines wandering across
  g.fillStyle = 'rgba(110,64,16,0.55)';
  let ty = Math.floor(gh*(0.25+rnd()*0.5));
  for(let x=0;x<gw;x++){ ty += Math.round((vnoise(x,3,24,5)-0.5)*1.6); if((x&3)<2){ g.fillRect(x,ty,1,1); g.fillRect(x,ty+4,1,1); } }

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(cv, 0, 0, gw, gh, 0, 0, gw*PX, gh*PX);
  // soft heat vignette so the HUD stays readable
  const v = ctx.createRadialGradient(W*0.5,H*0.45,Math.min(W,H)*0.25,W*0.5,H*0.45,Math.max(W,H)*0.8);
  v.addColorStop(0,'rgba(255,220,120,0)'); v.addColorStop(1,'rgba(90,40,0,0.38)');
  ctx.fillStyle = v; ctx.fillRect(0,0,W,H);
  ctx.restore();
}

function _buildGroundCacheRich(){
const _grs=Math.min(_gcDprCap(),Math.max(0.25,($core.canvas.width||$replay.W)/($replay.W||1)));
const oc=document.createElement('canvas');oc.width=Math.round($replay.W*_grs);oc.height=Math.round($replay.H*_grs);
const oc2=oc.getContext('2d');if(_grs!==1)oc2.setTransform(_grs,0,0,_grs,0,0);
const env=$psycho1.ENVS[$replay.currentEnv];
if($replay.currentEnv==='warzone'){ $paintWarzonePixel(oc2,$replay.W,$replay.H,$psycho1.buildings); $psycho1.groundCache=oc; return; }
if($replay.currentEnv==='spaceship'){
const g=oc2.createLinearGradient(0,0,$replay.W,$replay.H);
g.addColorStop(0,'#04080f');g.addColorStop(0.5,'#09122a');g.addColorStop(1,'#050a1c');
oc2.fillStyle=g;oc2.fillRect(0,0,$replay.W,$replay.H);
const _sVig=oc2.createRadialGradient($replay.W*0.5,$replay.H*0.45,Math.min($replay.W,$replay.H)*0.12,$replay.W*0.5,$replay.H*0.45,Math.max($replay.W,$replay.H)*0.8);
_sVig.addColorStop(0,'rgba(24,200,255,0.14)');_sVig.addColorStop(1,'rgba(0,2,12,0.62)');
oc2.fillStyle=_sVig;oc2.fillRect(0,0,$replay.W,$replay.H);
const _rgRng=(seed)=>{let s=seed;return()=>{s=(s*1664525+1013904223)&0xffffffff;return(s>>>0)/0xffffffff;};};
const _rg=_rgRng(3131);
for(let i=0;i<4;i++){
const px=_rg()*$replay.W, py=_rg()*$replay.H, pr=45+_rg()*45;
const pg=oc2.createRadialGradient(px,py,0,px,py,pr);
pg.addColorStop(0,'rgba(0,160,255,0.16)');pg.addColorStop(1,'transparent');
oc2.fillStyle=pg;oc2.beginPath();oc2.arc(px,py,pr,0,Math.PI*2);oc2.fill();
oc2.strokeStyle='rgba(80,180,255,0.3)';oc2.lineWidth=2;
oc2.beginPath();oc2.arc(px,py,pr*0.55,0,Math.PI*2);oc2.stroke();
oc2.strokeStyle='rgba(24,224,255,0.45)';oc2.lineWidth=1.5;
oc2.beginPath();oc2.arc(px,py,pr*0.3,0,Math.PI*2);oc2.stroke();
oc2.lineWidth=1;
for(let k=0;k<12;k++){const a=k*Math.PI/6;oc2.beginPath();oc2.moveTo(px+Math.cos(a)*pr*0.55,py+Math.sin(a)*pr*0.55);oc2.lineTo(px+Math.cos(a)*pr*0.65,py+Math.sin(a)*pr*0.65);oc2.stroke();}
}
{
const _dr=_rgRng(7777),_ps=60;
oc2.fillStyle='rgba(120,170,255,0.16)';
for(let rx=0;rx<$replay.W;rx+=_ps)for(let ry=0;ry<$replay.H;ry+=_ps){oc2.fillRect(rx+5,ry+5,2,2);oc2.fillRect(rx+_ps-7,ry+_ps-7,2,2);}
oc2.save();oc2.shadowColor='#18e0ff';oc2.shadowBlur=$core.isMobile?0:8;
oc2.strokeStyle='rgba(24,224,255,0.38)';oc2.lineWidth=2;oc2.lineJoin='round';
for(let i=0;i<($core.isMobile?3:6);i++){
let cx=Math.round(_dr()*$replay.W/_ps)*_ps+_ps/2,cy=Math.round(_dr()*$replay.H/_ps)*_ps+_ps/2;
oc2.beginPath();oc2.moveTo(cx,cy);
for(let k=0;k<4;k++){
if(k%2===0)cx+=(_dr()<0.5?-1:1)*_ps*(1+Math.floor(_dr()*3));else cy+=(_dr()<0.5?-1:1)*_ps*(1+Math.floor(_dr()*2));
oc2.lineTo(cx,cy);
}
oc2.stroke();
oc2.fillStyle='#18e0ff';oc2.beginPath();oc2.arc(cx,cy,3,0,Math.PI*2);oc2.fill();
}
oc2.restore();
oc2.save();
for(let py=_ps*2;py<$replay.H;py+=_ps*4){
oc2.beginPath();oc2.rect(0,py+10,$replay.W,6);oc2.clip();
oc2.fillStyle='rgba(255,176,32,0.20)';oc2.fillRect(0,py+10,$replay.W,6);
oc2.fillStyle='rgba(0,0,0,0.45)';
for(let sx=-10;sx<$replay.W;sx+=16){oc2.beginPath();oc2.moveTo(sx,py+16);oc2.lineTo(sx+8,py+16);oc2.lineTo(sx+14,py+10);oc2.lineTo(sx+6,py+10);oc2.closePath();oc2.fill();}
oc2.restore();oc2.save();
}
oc2.restore();
for(let py=_ps*2;py<$replay.H;py+=_ps*4){
for(let gx=_ps/2;gx<$replay.W;gx+=_ps){oc2.fillStyle=((gx/_ps)|0)%2?'rgba(24,224,255,0.55)':'rgba(255,176,32,0.45)';oc2.fillRect(gx-3,py-8,6,2);}
}
for(let i=0;i<5;i++){
const vx=_dr()*($replay.W-90)+20,vy=_dr()*($replay.H-70)+20;
oc2.fillStyle='rgba(0,4,14,0.75)';oc2.fillRect(vx,vy,52,30);
oc2.strokeStyle='rgba(80,140,220,0.35)';oc2.lineWidth=1;oc2.strokeRect(vx,vy,52,30);
for(let k=1;k<6;k++){oc2.beginPath();oc2.moveTo(vx+4,vy+k*5);oc2.lineTo(vx+48,vy+k*5);oc2.stroke();}
}
}
oc2.strokeStyle='rgba(0,60,180,0.25)';oc2.lineWidth=2;
const ps=60;
for(let px=0;px<$replay.W;px+=ps){for(let py=0;py<$replay.H;py+=ps){
oc2.strokeRect(px+2,py+2,ps-4,ps-4);
oc2.fillStyle='rgba(0,40,120,0.08)';oc2.fillRect(px+2,py+2,ps-4,ps-4);
}}
oc2.shadowColor='#0066ff';oc2.shadowBlur=12;
oc2.strokeStyle='rgba(0,100,255,0.2)';oc2.lineWidth=3;
for(let py=ps*2;py<$replay.H;py+=ps*4){
oc2.beginPath();oc2.moveTo(0,py);oc2.lineTo($replay.W,py);oc2.stroke();
}
oc2.shadowBlur=0;
$psycho1.groundCache=oc;return;
}
if($replay.currentEnv==='mars'){
const g=oc2.createLinearGradient(0,0,$replay.W,$replay.H);
g.addColorStop(0,'#3a1408');g.addColorStop(0.4,'#5a2010');g.addColorStop(1,'#4a1a0c');
oc2.fillStyle=g;oc2.fillRect(0,0,$replay.W,$replay.H);
const _mVig=oc2.createRadialGradient($replay.W*0.5,$replay.H*0.45,Math.min($replay.W,$replay.H)*0.12,$replay.W*0.5,$replay.H*0.45,Math.max($replay.W,$replay.H)*0.8);
_mVig.addColorStop(0,'rgba(255,140,80,0.14)');_mVig.addColorStop(1,'rgba(20,4,2,0.5)');
oc2.fillStyle=_mVig;oc2.fillRect(0,0,$replay.W,$replay.H);
const _mrRng=(seed)=>{let s=seed;return()=>{s=(s*1664525+1013904223)&0xffffffff;return(s>>>0)/0xffffffff;};};
const _mr=_mrRng(8181);
const _mrCount=($core.isUltraLow||$core.isLowEndDesktop)?3:5;
for(let i=0;i<_mrCount;i++){
const mx=_mr()*$replay.W, my=_mr()*$replay.H, mrr=40+_mr()*55;
oc2.globalAlpha=0.22;oc2.fillStyle='#2a0e04';
oc2.beginPath();oc2.ellipse(mx,my,mrr,mrr*0.55,_mr()*Math.PI,0,Math.PI*2);oc2.fill();
oc2.globalAlpha=0.14;oc2.fillStyle='#ff9860';
oc2.beginPath();oc2.ellipse(mx-mrr*0.2,my-mrr*0.15,mrr*0.5,mrr*0.22,_mr()*Math.PI,0,Math.PI*2);oc2.fill();
}
oc2.globalAlpha=0.18;
const _mrDirtN=($core.isUltraLow||$core.isLowEndDesktop)?8:$core.isMobile?14:24;
for(let i=0;i<_mrDirtN;i++){
const cx=Math.random()*$replay.W, cy=Math.random()*$replay.H;
const cr=18+Math.random()*60;
const cg2=oc2.createRadialGradient(cx,cy,cr*0.2,cx,cy,cr);
cg2.addColorStop(0,'#2a0e04');cg2.addColorStop(0.6,'#5a2010');cg2.addColorStop(1,'transparent');
oc2.fillStyle=cg2;oc2.beginPath();oc2.ellipse(cx,cy,cr,cr*0.6,Math.random()*Math.PI,0,Math.PI*2);oc2.fill();
}
oc2.globalAlpha=0.25;oc2.fillStyle='#7a3820';
for(let d of $psycho1.dirtPatches){oc2.save();oc2.translate(d.x,d.y);oc2.rotate(d.rot);oc2.beginPath();oc2.ellipse(0,0,d.rx,d.ry,0,0,Math.PI*2);oc2.fill();oc2.restore();}
oc2.globalAlpha=0.35;oc2.strokeStyle='#2a0e04';oc2.lineWidth=1.5;
for(let b of $psycho1.grassBlades){oc2.beginPath();oc2.moveTo(b.x,b.y);oc2.lineTo(b.x+b.lean*b.h*0.5,b.y-b.h*0.4);oc2.stroke();}
oc2.globalAlpha=1;
$psycho1.groundCache=oc;return;
}
const g=oc2.createLinearGradient(0,0,$replay.W,$replay.H);
g.addColorStop(0,env.g0);g.addColorStop(0.5,env.g1);g.addColorStop(1,env.g2);
oc2.fillStyle=g;oc2.fillRect(0,0,$replay.W,$replay.H);
if($replay.currentEnv==='urban'||$replay.currentEnv==='night'){
const asphalt = $replay.currentEnv==='night'?'#141414':'#1a1c2a';
oc2.fillStyle=asphalt;oc2.fillRect(0,0,$replay.W,$replay.H);
const _uVig=oc2.createRadialGradient($replay.W*0.5,$replay.H*0.45,Math.min($replay.W,$replay.H)*0.15,$replay.W*0.5,$replay.H*0.45,Math.max($replay.W,$replay.H)*0.78);
_uVig.addColorStop(0,'rgba(0,0,0,0)');_uVig.addColorStop(1,$replay.currentEnv==='night'?'rgba(0,0,0,0.55)':'rgba(0,0,0,0.4)');
oc2.fillStyle=_uVig;oc2.fillRect(0,0,$replay.W,$replay.H);
oc2.globalAlpha=0.07;
for(let i=0;i<300;i++){
oc2.fillStyle=Math.random()>0.5?'#fff':'#000';
oc2.fillRect(Math.random()*$replay.W,Math.random()*$replay.H,Math.random()*4+1,Math.random()*4+1);
}
oc2.globalAlpha=1;
oc2.globalAlpha=0.25;oc2.strokeStyle='#000';oc2.lineWidth=2;
const seamW=140;
for(let sx=seamW;sx<$replay.W;sx+=seamW){oc2.beginPath();oc2.moveTo(sx,0);oc2.lineTo(sx,$replay.H);oc2.stroke();}
for(let sy=seamW;sy<$replay.H;sy+=seamW){oc2.beginPath();oc2.moveTo(0,sy);oc2.lineTo($replay.W,sy);oc2.stroke();}
oc2.globalAlpha=1;
oc2.setLineDash([18,14]);
oc2.strokeStyle=$replay.currentEnv==='night'?'rgba(255,220,0,0.55)':'rgba(255,220,0,0.4)';
oc2.lineWidth=2.5;
const laneW=90;
for(let lx=laneW;lx<$replay.W;lx+=laneW){
oc2.beginPath();oc2.moveTo(lx,0);oc2.lineTo(lx,$replay.H);oc2.stroke();
}
for(let ly=laneW;ly<$replay.H;ly+=laneW){
oc2.beginPath();oc2.moveTo(0,ly);oc2.lineTo($replay.W,ly);oc2.stroke();
}
oc2.setLineDash([]);
oc2.globalAlpha=0.18;
oc2.fillStyle='#888';
for(let lx=0;lx<$replay.W;lx+=laneW){oc2.fillRect(lx-3,0,6,$replay.H);}
for(let ly=0;ly<$replay.H;ly+=laneW){oc2.fillRect(0,ly-3,$replay.W,6);}
oc2.globalAlpha=1;
oc2.globalAlpha=0.22;oc2.fillStyle='#ffffff';
for(let lx=laneW;lx<$replay.W;lx+=laneW){
for(let ly=laneW;ly<$replay.H;ly+=laneW){
for(let s=0;s<5;s++){oc2.fillRect(lx-22+s*9,ly-3,7,6);}
for(let s=0;s<5;s++){oc2.fillRect(lx-3,ly-22+s*9,6,7);}
}
}
oc2.globalAlpha=1;
for(const t of $psycho1.trees){
const lg=oc2.createRadialGradient(t.x,t.y,0,t.x,t.y,t.r*3.2);
lg.addColorStop(0,$replay.currentEnv==='night'?'rgba(255,235,170,0.16)':'rgba(255,225,150,0.10)');
lg.addColorStop(1,'transparent');
oc2.fillStyle=lg;oc2.beginPath();oc2.arc(t.x,t.y,t.r*3.2,0,Math.PI*2);oc2.fill();
}
const sw=12;
for(const b of $psycho1.buildings){
oc2.fillStyle=$replay.currentEnv==='night'?'#2a2a2a':'#363b52';
oc2.fillRect(b.x-sw,b.y-sw,b.w+sw*2,b.h+sw*2);
oc2.fillStyle=$replay.currentEnv==='night'?'#242424':'#2b3045';
oc2.fillRect(b.x-sw,b.y-sw,b.w+sw*2,4);
oc2.fillRect(b.x-sw,b.y+b.h+sw-4,b.w+sw*2,4);
oc2.fillRect(b.x-sw,b.y-sw,4,b.h+sw*2);
oc2.fillRect(b.x+b.w+sw-4,b.y-sw,4,b.h+sw*2);
oc2.strokeStyle='#0a0a0a';oc2.lineWidth=2;
oc2.strokeRect(b.x-sw,b.y-sw,b.w+sw*2,b.h+sw*2);
oc2.globalAlpha=0.4;oc2.lineWidth=1;
for(let jx=b.x-sw+10;jx<b.x+b.w+sw;jx+=18){
oc2.beginPath();oc2.moveTo(jx,b.y-sw);oc2.lineTo(jx,b.y);oc2.stroke();
oc2.beginPath();oc2.moveTo(jx,b.y+b.h);oc2.lineTo(jx,b.y+b.h+sw);oc2.stroke();
}
oc2.globalAlpha=1;
}
if($replay.currentEnv==='urban'){
const _sh=oc2.createLinearGradient(0,0,$replay.W,$replay.H);
_sh.addColorStop(0,'rgba(110,90,255,0.07)');_sh.addColorStop(0.5,'rgba(0,0,0,0)');_sh.addColorStop(1,'rgba(0,220,255,0.06)');
oc2.fillStyle=_sh;oc2.fillRect(0,0,$replay.W,$replay.H);
const _neon=['#ff2e88','#18e0ff','#ffb020','#9b6bff'];
for(let bi=0;bi<$psycho1.buildings.length;bi++){
const b=$psycho1.buildings[bi],nc=_neon[(bi*7+((b.x/13)|0))%4];
const sg=oc2.createLinearGradient(0,b.y+b.h+sw,0,b.y+b.h+sw+46);
sg.addColorStop(0,nc);sg.addColorStop(1,nc+'00');
oc2.globalAlpha=0.16;oc2.fillStyle=sg;oc2.fillRect(b.x,b.y+b.h+sw,b.w,46);
}
oc2.globalAlpha=1;
for(let i=0;i<($core.isMobile?6:12);i++){
const px=40+Math.random()*($replay.W-80),py=40+Math.random()*($replay.H-80);
if($psycho1.buildings.some(b=>px>b.x-30&&px<b.x+b.w+30&&py>b.y-30&&py<b.y+b.h+30)) continue;
const pr=14+Math.random()*26,nc=_neon[i%4];
const pg=oc2.createRadialGradient(px,py,0,px,py,pr);
pg.addColorStop(0,'rgba(8,10,24,0.85)');pg.addColorStop(0.7,'rgba(14,18,40,0.6)');pg.addColorStop(1,'rgba(14,18,40,0)');
oc2.fillStyle=pg;oc2.beginPath();oc2.ellipse(px,py,pr,pr*0.45,0,0,Math.PI*2);oc2.fill();
oc2.globalAlpha=0.35;oc2.strokeStyle=nc;oc2.lineWidth=1;
oc2.beginPath();oc2.ellipse(px-pr*0.1,py-pr*0.06,pr*0.6,pr*0.2,0,Math.PI*1.1,Math.PI*1.9);oc2.stroke();oc2.globalAlpha=1;
}
oc2.strokeStyle='rgba(150,170,255,0.28)';oc2.lineWidth=1;
for(const b of $psycho1.buildings){oc2.beginPath();oc2.moveTo(b.x-sw,b.y+b.h+sw);oc2.lineTo(b.x-sw,b.y-sw);oc2.lineTo(b.x+b.w+sw,b.y-sw);oc2.stroke();}
for(let i=0;i<3;i++){
const mx=60+Math.random()*($replay.W-120),my=60+Math.random()*($replay.H-120);
if($psycho1.buildings.some(b=>mx>b.x-30&&mx<b.x+b.w+30&&my>b.y-30&&my<b.y+b.h+30)) continue;
oc2.fillStyle='#0c0e18';oc2.beginPath();oc2.arc(mx,my,8,0,Math.PI*2);oc2.fill();
oc2.strokeStyle='rgba(120,140,220,0.3)';oc2.beginPath();oc2.arc(mx,my,8,0,Math.PI*2);oc2.stroke();
oc2.beginPath();oc2.moveTo(mx-5,my);oc2.lineTo(mx+5,my);oc2.moveTo(mx,my-5);oc2.lineTo(mx,my+5);oc2.stroke();
}
}
} else if($replay.currentEnv==='arctic'){
const snowG=oc2.createLinearGradient(0,0,$replay.W,$replay.H);
snowG.addColorStop(0,'#d8ecf8');snowG.addColorStop(0.4,'#e8f4ff');snowG.addColorStop(0.75,'#cce0f0');snowG.addColorStop(1,'#b8d0e4');
oc2.fillStyle=snowG;oc2.fillRect(0,0,$replay.W,$replay.H);
const _aVig=oc2.createRadialGradient($replay.W*0.5,$replay.H*0.45,Math.min($replay.W,$replay.H)*0.15,$replay.W*0.5,$replay.H*0.45,Math.max($replay.W,$replay.H)*0.8);
_aVig.addColorStop(0,'rgba(255,255,255,0.25)');_aVig.addColorStop(0.6,'rgba(255,255,255,0)');_aVig.addColorStop(1,'rgba(70,110,150,0.28)');
oc2.fillStyle=_aVig;oc2.fillRect(0,0,$replay.W,$replay.H);
const _mdRng=(seed)=>{let s=seed;return()=>{s=(s*1664525+1013904223)&0xffffffff;return(s>>>0)/0xffffffff;};};
const _md=_mdRng(6161);
for(let i=0;i<6;i++){
const mx=_md()*$replay.W, my=_md()*$replay.H, mr=50+_md()*70;
oc2.globalAlpha=0.16;oc2.fillStyle='#7fa8c8';
oc2.beginPath();oc2.ellipse(mx,my+mr*0.28,mr,mr*0.42,0,0,Math.PI*2);oc2.fill();
oc2.globalAlpha=0.30;oc2.fillStyle='#ffffff';
oc2.beginPath();oc2.ellipse(mx,my,mr*0.92,mr*0.4,0,0,Math.PI*2);oc2.fill();
}
oc2.globalAlpha=1;
const rng=(seed)=>{let s=seed;return()=>{s=(s*1664525+1013904223)&0xffffffff;return(s>>>0)/0xffffffff;};};
const r=rng(42);
oc2.globalAlpha=0.07;
for(let i=0;i<120;i++){
const px=r()*$replay.W,py=r()*$replay.H,pr=12+r()*40;
oc2.fillStyle=r()>0.5?'#ffffff':'#a8c8de';
oc2.beginPath();oc2.ellipse(px,py,pr,pr*0.55,r()*Math.PI,0,Math.PI*2);oc2.fill();
}
oc2.globalAlpha=0.18;oc2.strokeStyle='rgba(200,230,255,0.9)';oc2.lineWidth=0.8;
const r2=rng(137);
const crystalCount=$core.isMobile?14:30;
for(let i=0;i<crystalCount;i++){
const cx=r2()*$replay.W,cy=r2()*$replay.H,cs=6+r2()*14;
oc2.save();oc2.translate(cx,cy);oc2.rotate(r2()*Math.PI);
for(let sp=0;sp<6;sp++){
const ang=sp*Math.PI/3;
oc2.beginPath();oc2.moveTo(0,0);oc2.lineTo(Math.cos(ang)*cs,Math.sin(ang)*cs);oc2.stroke();
const bx=Math.cos(ang)*cs*0.55,by=Math.sin(ang)*cs*0.55;
const ba=ang+Math.PI/2;
oc2.beginPath();oc2.moveTo(bx-Math.cos(ba)*cs*0.22,by-Math.sin(ba)*cs*0.22);
oc2.lineTo(bx+Math.cos(ba)*cs*0.22,by+Math.sin(ba)*cs*0.22);oc2.stroke();
}
oc2.restore();
}
oc2.globalAlpha=0.13;oc2.strokeStyle='#7090a8';oc2.lineWidth=1;
const r3=rng(271);
const crackCount=$core.isMobile?8:18;
for(let i=0;i<crackCount;i++){
let cx=r3()*$replay.W,cy=r3()*$replay.H;
const ang=r3()*Math.PI*2;
const len=40+r3()*120;
const segs=4+Math.floor(r3()*5);
oc2.beginPath();oc2.moveTo(cx,cy);
let ca=ang;
for(let s=0;s<segs;s++){
cx+=Math.cos(ca)*(len/segs);cy+=Math.sin(ca)*(len/segs);
ca+=( r3()-0.5)*0.8;
oc2.lineTo(cx,cy);
if(r3()>0.6){
oc2.moveTo(cx,cy);
const ba=ca+(r3()>0.5?0.6:-0.6);
oc2.lineTo(cx+Math.cos(ba)*20,cy+Math.sin(ba)*20);
oc2.moveTo(cx,cy);
}
}
oc2.stroke();
}
oc2.globalAlpha=0.14;oc2.fillStyle='#a0b8cc';
const pathW=30;
for(let b of $psycho1.buildings){
oc2.fillRect(0,b.y+b.h/2-pathW/2,$replay.W,pathW);
oc2.fillRect(b.x+b.w/2-pathW/2,0,pathW,$replay.H);
}
oc2.globalAlpha=0.22;
for(let b of $psycho1.buildings){
oc2.fillStyle='#eef8ff';
oc2.beginPath();oc2.ellipse(b.x+b.w*0.5,b.y+b.h+8,b.w*0.45,10,0,0,Math.PI*2);oc2.fill();
oc2.beginPath();oc2.ellipse(b.x+b.w*0.5,b.y-8,b.w*0.35,8,0,0,Math.PI*2);oc2.fill();
}
oc2.globalAlpha=1;
} else if($replay.currentEnv==='jungle'){
oc2.fillStyle='#050d02';oc2.fillRect(0,0,$replay.W,$replay.H);
const _jVig=oc2.createRadialGradient($replay.W*0.5,$replay.H*0.42,Math.min($replay.W,$replay.H)*0.05,$replay.W*0.5,$replay.H*0.42,Math.max($replay.W,$replay.H)*0.62);
_jVig.addColorStop(0,'#3a6818');_jVig.addColorStop(0.28,env.g0);_jVig.addColorStop(0.62,'#0a1804');_jVig.addColorStop(1,'#010401');
oc2.fillStyle=_jVig;oc2.fillRect(0,0,$replay.W,$replay.H);
const _hRng=(seed)=>{let s=seed;return()=>{s=(s*1664525+1013904223)&0xffffffff;return(s>>>0)/0xffffffff;};};
const _hr=_hRng(5511);
oc2.globalAlpha=0.35;
for(let i=0;i<22;i++){
const hx=_hr()*$replay.W, hy=_hr()*$replay.H, hrr=40+_hr()*90;
const hg=oc2.createRadialGradient(hx,hy,0,hx,hy,hrr);
hg.addColorStop(0,'#000a00');hg.addColorStop(1,'transparent');
oc2.fillStyle=hg;oc2.beginPath();oc2.ellipse(hx,hy,hrr,hrr*0.65,_hr()*Math.PI,0,Math.PI*2);oc2.fill();
}
oc2.globalAlpha=1;
for(let d of $psycho1.dirtPatches){
oc2.save();oc2.translate(d.x,d.y);oc2.rotate(d.rot);
oc2.globalAlpha=0.36;oc2.fillStyle=env.dirt;
oc2.beginPath();oc2.ellipse(0,0,d.rx,d.ry,0,0,Math.PI*2);oc2.fill();
oc2.globalAlpha=0.14;oc2.fillStyle='#4a3018';
oc2.beginPath();oc2.ellipse(-d.rx*0.15,-d.ry*0.15,d.rx*0.6,d.ry*0.6,0,0,Math.PI*2);oc2.fill();
oc2.restore();
}
oc2.globalAlpha=0.14;oc2.fillStyle=env.dirt;
const jPathW=30;
for(let b of $psycho1.buildings){
oc2.fillRect(0,b.y+b.h/2-jPathW/2,$replay.W,jPathW);
oc2.fillRect(b.x+b.w/2-jPathW/2,0,jPathW,$replay.H);
}
oc2.globalAlpha=1;
const _dr=_hRng(9001);
oc2.globalAlpha=0.55;
for(let i=0;i<32;i++){
const bx=_dr()*$replay.W, by=_dr()*$replay.H;
const n=3+Math.floor(_dr()*5);
for(let k=0;k<n;k++){
const ox=(_dr()-0.5)*36, oy=(_dr()-0.5)*22, rr=1+_dr()*3.2;
oc2.fillStyle = _dr()<0.4 ? '#3a0a04' : '#5c1206';
oc2.beginPath();oc2.ellipse(bx+ox,by+oy,rr,rr*0.7,_dr()*Math.PI,0,Math.PI*2);oc2.fill();
}
}
oc2.globalAlpha=1;
for(let b of $psycho1.grassBlades){
oc2.strokeStyle=b.col;oc2.lineWidth=b.lw;
oc2.beginPath();oc2.moveTo(b.x,b.y);oc2.quadraticCurveTo(b.x+b.lean*b.h*0.8,b.y-b.h*0.55,b.x+b.lean*b.h*1.5,b.y-b.h);oc2.stroke();
oc2.globalAlpha=0.35;oc2.strokeStyle=env.leafHi;oc2.lineWidth=Math.max(0.8,b.lw*0.35);
oc2.beginPath();oc2.moveTo(b.x+b.lean*b.h*0.9,b.y-b.h*0.62);oc2.lineTo(b.x+b.lean*b.h*1.5,b.y-b.h);oc2.stroke();
oc2.globalAlpha=1;
}
} else if($replay.currentEnv==='desert'){
$paintDesertPixel(oc2,$replay.W,$replay.H,$psycho1.buildings);
} else {
oc2.globalAlpha=0.2;oc2.fillStyle=env.dirt;
for(let d of $psycho1.dirtPatches){oc2.save();oc2.translate(d.x,d.y);oc2.rotate(d.rot);oc2.beginPath();oc2.ellipse(0,0,d.rx,d.ry,0,0,Math.PI*2);oc2.fill();oc2.restore();}
oc2.globalAlpha=0.12;oc2.fillStyle=env.dirt;
const pathW=30;
for(let b of $psycho1.buildings){
oc2.fillRect(0,b.y+b.h/2-pathW/2,$replay.W,pathW);
oc2.fillRect(b.x+b.w/2-pathW/2,0,pathW,$replay.H);
}
oc2.globalAlpha=0.5;
for(let b of $psycho1.grassBlades){oc2.strokeStyle=b.col;oc2.lineWidth=b.lw;oc2.beginPath();oc2.moveTo(b.x,b.y);oc2.quadraticCurveTo(b.x+b.lean*b.h*0.8,b.y-b.h*0.55,b.x+b.lean*b.h*1.5,b.y-b.h);oc2.stroke();}
oc2.globalAlpha=1;
}
$psycho1.groundCache=oc;
}
const KEYBIND_DEFAULTS = {
up:'KeyW', down:'KeyS', left:'KeyA', right:'KeyD',
fire:'Space', reload:'KeyR', grenade:'KeyG', airstrike:'KeyQ', armageddon:'KeyE',
psycho:'KeyF', pause:'KeyP',
weapon1:'Digit1', weapon2:'Digit2', weapon3:'Digit3', weapon4:'Digit4', weapon5:'Digit5',
weapon6:'Digit6', weapon7:'Digit7', weapon8:'Digit8', weapon9:'Digit9',
}; ;$buildings.KEYBIND_DEFAULTS = KEYBIND_DEFAULTS;
const KEYBIND_P2_DEFAULTS = {
up:'KeyI', down:'KeyK', left:'KeyJ', right:'KeyL', grenade:'KeyU', switchWeapon:'KeyO',
}; ;$buildings.KEYBIND_P2_DEFAULTS = KEYBIND_P2_DEFAULTS;
const KEYBIND_LABELS = {
up:'Move Up', down:'Move Down', left:'Move Left', right:'Move Right',
fire:'Fire', reload:'Reload', grenade:'Grenade', airstrike:'Airstrike', armageddon:'Nuke',
psycho:'Psycho Mode', pause:'Pause',
weapon1:'Weapon 1', weapon2:'Weapon 2', weapon3:'Weapon 3', weapon4:'Weapon 4', weapon5:'Weapon 5',
weapon6:'Weapon 6', weapon7:'Weapon 7', weapon8:'Weapon 8', weapon9:'Weapon 9',
}; ;$buildings.KEYBIND_LABELS = KEYBIND_LABELS;
function _loadKeybinds(){
try{
const saved = JSON.parse(localStorage.getItem('diy_keybinds')||'{}');
return Object.assign({}, KEYBIND_DEFAULTS, saved);
}catch(e){ return Object.assign({}, KEYBIND_DEFAULTS); }
}
$buildings.KEYBINDS = _loadKeybinds();
function _saveKeybinds(){
try{ localStorage.setItem('diy_keybinds', JSON.stringify($buildings.KEYBINDS)); }catch(e){}
}
function _codeToLabel(code){
if(!code) return '?';
if(code.startsWith('Key')) return code.slice(3);
if(code.startsWith('Digit')) return code.slice(5);
if(code==='Space') return 'Space';
if(code.startsWith('Arrow')) return code.slice(5);
return code;
}
function _updateHotkeyBarHints(){
const moveEl = document.getElementById('hk-move');
if(moveEl) moveEl.textContent = _codeToLabel($buildings.KEYBINDS.up)+_codeToLabel($buildings.KEYBINDS.left)+_codeToLabel($buildings.KEYBINDS.down)+_codeToLabel($buildings.KEYBINDS.right);
const map = {'hk-reload':'reload','hk-grenade':'grenade','hk-airstrike':'airstrike','hk-pause':'pause'};
Object.keys(map).forEach(id=>{
const elx = document.getElementById(id);
if(elx) elx.textContent = _codeToLabel($buildings.KEYBINDS[map[id]]);
});
const strikeEl = document.getElementById('hint-strike');
if(strikeEl) strikeEl.textContent = '['+_codeToLabel($buildings.KEYBINDS.airstrike)+']';
const nukeEl = document.getElementById('hint-nuke');
if(nukeEl) nukeEl.textContent = '['+_codeToLabel($buildings.KEYBINDS.armageddon)+']';
}
if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', _updateHotkeyBarHints); } else { window.addEventListener('load', _updateHotkeyBarHints); _updateHotkeyBarHints(); }
const WEAPONS={
rifle:{name:'RIFLE',ammo:18,reload:100,cd:9,spread:0.06,col:'#aaff00',spd:15,sz:3,wt:'bullet'},
shotgun:{name:'SHOTGUN',ammo:6,reload:140,cd:26,spread:0.24,col:'#ffaa00',spd:14,sz:3.5,wt:'bullet',pels:7},
smg:{name:'SMG',ammo:30,reload:130,cd:4,spread:0.18,col:'#00ffcc',spd:16,sz:2.5,wt:'bullet'},
knife:{name:'KNIFE',ammo:5,reload:70,cd:14,spread:0,col:'#c8d8ff',spd:15,sz:0,wt:'knife'},
minigun:{name:'MINIGUN',ammo:70,reload:190,cd:2,spread:0.20,col:'#ff6600',spd:17,sz:3,wt:'bullet'},
rpg:{name:'RPG',ammo:3,reload:220,cd:60,spread:0.02,col:'#ff4400',spd:10,sz:5,wt:'rocket'},
flamethrower:{name:'FLAMETHROWER',ammo:40,reload:150,cd:2,spread:0.50,col:'#ff6600',spd:9,sz:5,wt:'flame',range:160},
laser:{name:'LASER RIFLE',ammo:8,reload:120,cd:12,spread:0.01,col:'#ff00ff',spd:30,sz:3,wt:'laser',dmg:35},
plasmacutter:{name:'PLASMA CUTTER',ammo:12,reload:90,cd:8,spread:0.02,col:'#00eeff',spd:22,sz:5,wt:'plasma',dmg:12}
}; ;$buildings.WEAPONS = WEAPONS;
const WK=['rifle','shotgun','smg','knife','minigun','rpg','flamethrower']; ;$buildings.WK = WK;
$buildings.unlockedLaser = false;
$buildings.unlockedAlien = false;
const EXCLUSIVE_SKINS = [
{ id:'crimson_accent', wave:15, key:'accent', val:'#ff0055', label:'Crimson Ops' },
{ id:'shadow_outfit',  wave:20, key:'color',  val:'#0a0a0a', dark:'#000000', label:'Shadow Ops' },
{ id:'ghost_skin',     wave:25, key:'skin',   val:'#e8e8f0', label:'Ghost Ops' },
{ id:'cyber_accent',   wave:30, key:'accent', val:'#00ffe0', label:'Cyber Ops' },
{ id:'ember_accent',   minLevel:3, key:'accent', val:'#ff6600', label:'Ember' },
{ id:'arctic_accent',  minLevel:8, key:'accent', val:'#00ccff', label:'Arctic' },
]; ;$buildings.EXCLUSIVE_SKINS = EXCLUSIVE_SKINS;
window.EXCLUSIVE_SKINS = EXCLUSIVE_SKINS;
function _isExclusiveUnlocked(id){
try{
const ex = EXCLUSIVE_SKINS.find(e=>e.id===id);
if(ex && ex.minLevel!=null){
const ps = (typeof $profiler.getPrestigeState==='function') ? $profiler.getPrestigeState() : JSON.parse(localStorage.getItem('diy_prestige')||'{"level":0,"xp":0}');
return (ps.level||0) >= ex.minLevel;
}
return localStorage.getItem('diy_exclusive_'+id)==='1';
}catch(e){ return false; }
}
window._isExclusiveUnlocked = _isExclusiveUnlocked;
window.FaceDB = (() => {
const DB_NAME = 'diy_face_db';
const DB_VER = 1;
const STORE = 'faces';
const KEY = 'player_face';
let _db = null;
function _open() {
if (_db) return Promise.resolve(_db);
return new Promise((resolve, reject) => {
const req = indexedDB.open(DB_NAME, DB_VER);
req.onupgradeneeded = e => {
e.target.result.createObjectStore(STORE);
};
req.onsuccess = e => { _db = e.target.result; resolve(_db); };
req.onerror = e => reject(e.target.error);
});
}
function save(dataUrl) {
return _open().then(db => new Promise((resolve, reject) => {
const tx = db.transaction(STORE, 'readwrite');
const req = tx.objectStore(STORE).put(dataUrl, KEY);
req.onsuccess = () => resolve();
req.onerror = e => reject(e.target.error);
})).catch(err => console.warn('[FaceDB] save failed:', err));
}
function load() {
return _open().then(db => new Promise((resolve, reject) => {
const tx = db.transaction(STORE, 'readonly');
const req = tx.objectStore(STORE).get(KEY);
req.onsuccess = e => resolve(e.target.result || null);
req.onerror = e => reject(e.target.error);
})).catch(err => { console.warn('[FaceDB] load failed:', err); return null; });
}
function clear() {
return _open().then(db => new Promise((resolve, reject) => {
const tx = db.transaction(STORE, 'readwrite');
const req = tx.objectStore(STORE).delete(KEY);
req.onsuccess = () => resolve();
req.onerror = e => reject(e.target.error);
})).catch(err => console.warn('[FaceDB] clear failed:', err));
}
return { save, load, clear };
})();
let playerCustom = window.playerCustom = { skin: '#c8a070', color: '#2d4a1e', darkColor: '#1a2e10', accent: '#7fff00', faceImage: null }; ;$buildings.playerCustom = playerCustom;
$buildings.state = window.state='menu'; $buildings.player = undefined; $buildings.bullets = undefined; $buildings.enemies = undefined; $buildings.particles = undefined; $buildings.powerups = undefined; $buildings.allies = undefined; $buildings.grenades = undefined; $buildings.debrisArr = undefined; $buildings.floatingTexts = undefined; $buildings.craters = []; $buildings.rubblePieces = [];
let _aliveEnemies = []; ;$buildings._aliveEnemies = _aliveEnemies;
$buildings._aliveEnemiesDirty = true;
let _frameAliveAlliesScratch = []; ;$buildings._frameAliveAlliesScratch = _frameAliveAlliesScratch;
const _GRID_CELL = 128;
const _GRID_KEY_OFFSET = 1 << 20;
let _spatialGrid = new Map();
function _gridKeyNum(gx,gy){ return (gx+_GRID_KEY_OFFSET)*2097152 + (gy+_GRID_KEY_OFFSET); }
function _rebuildSpatialGrid(){
_spatialGrid.clear();
const alive = _getAliveEnemies();
for(let _gi=0;_gi<alive.length;_gi++){
const _ge=alive[_gi];
const _gk=_gridKeyNum((_ge.x/_GRID_CELL)|0,(_ge.y/_GRID_CELL)|0);
const _cell=_spatialGrid.get(_gk);
if(_cell)_cell.push(_ge);
else _spatialGrid.set(_gk,[_ge]);
}
}
const _GRID_EMPTY = [];
const _gridScratch = [];
function _gridQuery(x,y,radius){
const _r=Math.ceil(radius/_GRID_CELL);
const _cx=(x/_GRID_CELL)|0;
const _cy=(y/_GRID_CELL)|0;
let _out=null, _multi=false;
for(let _gx=_cx-_r;_gx<=_cx+_r;_gx++){
for(let _gy=_cy-_r;_gy<=_cy+_r;_gy++){
const _cell=_spatialGrid.get(_gridKeyNum(_gx,_gy));
if(!_cell)continue;
if(_out===null){ _out=_cell; }
else {
if(!_multi){ _multi=true; _gridScratch.length=0; for(let _i=0;_i<_out.length;_i++) _gridScratch.push(_out[_i]); }
for(let _i=0;_i<_cell.length;_i++) _gridScratch.push(_cell[_i]);
}
}
}
if(_multi) return _gridScratch;
return _out||_GRID_EMPTY;
}
function _markEnemiesDirty(){ $buildings._aliveEnemiesDirty = true; }
function _getAliveEnemies(){
if($buildings._aliveEnemiesDirty){
_aliveEnemies.length = 0;
for(let i=0;i<$buildings.enemies.length;i++){ if($buildings.enemies[i].alive) _aliveEnemies.push($buildings.enemies[i]); }
$buildings._aliveEnemiesDirty = false;
}
return _aliveEnemies;
}
function _compactEnemies(){
let w=0;
for(let i=0;i<$buildings.enemies.length;i++){ if($buildings.enemies[i].alive) $buildings.enemies[w++]=$buildings.enemies[i]; }
$buildings.enemies.length=w;
$buildings._aliveEnemiesDirty=true;
}
$buildings.crawlActive = false;
$buildings.score = undefined; $buildings.wave = undefined; $buildings.waveKills = undefined; $buildings.waveTotal = undefined; $buildings.waveInProgress = undefined; $buildings.wavePending = undefined; $buildings.playerDead = undefined;
$buildings._upgradeRerollsUsed = 0;
const _gameIntervals = new Set();
const _gameTimeouts = new Set();
function _gsi(fn, ms){
const id = setInterval(()=>{
try { fn(); } catch(e) { console.warn('[gsi] callback error', e); }
}, ms);
_gameIntervals.add(id);
return id;
}
function _gst(fn, ms){
let id;
id = setTimeout(()=>{
_gameTimeouts.delete(id);
try { fn(); } catch(e) { console.warn('[gst] callback error', e); }
}, ms);
_gameTimeouts.add(id);
return id;
}
function _gcsi(id){ clearInterval(id); _gameIntervals.delete(id); }
function _gcst(id){ clearTimeout(id); _gameTimeouts.delete(id); }
function _clearGameTimers(){
_gameIntervals.forEach(id=>{ clearInterval(id); }); _gameIntervals.clear();
_gameTimeouts.forEach(id=>{ clearTimeout(id); }); _gameTimeouts.clear();
}
$buildings._dqsQuality = ($core.isUltraLow || $core.isLowEndDesktop) ? 0.2 : $core.isMobile ? 0.45 : 1.0;
// Later detection (memory/core count) may only lower the starting quality, never raise it.
$buildings._dqsCap = function(q){ $buildings._dqsQuality = Math.min($buildings._dqsQuality, q); };
const activeMutators = new Set(); ;$buildings.activeMutators = activeMutators;
window.activeMutators = activeMutators;
const MUTATOR_DEFS = [
{ id:'mut_swarm', icon:'<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><circle cx="6" cy="8" r="2.6"/><circle cx="14" cy="6" r="2.2"/><circle cx="19" cy="11" r="2"/><circle cx="9" cy="15" r="2.4"/><circle cx="17" cy="17" r="2.2"/><circle cx="4" cy="18" r="1.8"/></svg>', name:'SWARM', tag:'ENEMIES', col:'#ff8800', desc:'+40% enemy count per wave', apply:(c)=>{ c.waveCountMult=(c.waveCountMult||1)*1.4; } },
{ id:'mut_juggernaut', icon:'<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2l8 3v6c0 5.5-3.5 9.5-8 11-4.5-1.5-8-5.5-8-11V5z"/><path d="M12 5.2v13.5c3-1.3 5.2-4.3 5.2-8.3V6.9z" fill="#0a1a05"/></svg>', name:'JUGGERNAUT', tag:'ENEMIES', col:'#ff4400', desc:'All enemies have +50% HP', apply:(c)=>{ c.hpMult=(c.hpMult||1)*1.5; } },
{ id:'mut_overdrive', icon:'<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>', name:'OVERDRIVE', tag:'ENEMIES', col:'#ffcc00', desc:'Enemies move 35% faster', apply:(c)=>{ c.spdMult=(c.spdMult||1)*1.35; } },
{ id:'mut_bullethell', icon:'<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><circle cx="12" cy="12" r="3.4"/><circle cx="12" cy="3.5" r="1.6"/><circle cx="12" cy="20.5" r="1.6"/><circle cx="3.5" cy="12" r="1.6"/><circle cx="20.5" cy="12" r="1.6"/><circle cx="6.2" cy="6.2" r="1.4"/><circle cx="17.8" cy="17.8" r="1.4"/><circle cx="6.2" cy="17.8" r="1.4"/><circle cx="17.8" cy="6.2" r="1.4"/></svg>', name:'BULLET HELL', tag:'ENEMIES', col:'#ff2200', desc:'Enemies fire twice as often', apply:(c)=>{ c.enemyFireMult=(c.enemyFireMult||1)*2; } },
{ id:'mut_ironman', icon:'<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" fill-rule="evenodd"><path d="M12 2a7.5 7.5 0 00-7.5 7.5c0 3 1.6 4.7 2.5 6v3h2v-2h2v2h2v-2h2v2h2v-3c.9-1.3 2.5-3 2.5-6A7.5 7.5 0 0012 2z"/><circle cx="9" cy="9.5" r="1.8" fill="#0a1a05"/><circle cx="15" cy="9.5" r="1.8" fill="#0a1a05"/><path d="M11 10.5h2l-.6 2.4h-.8z" fill="#0a1a05"/></svg>', name:'IRON MAN', tag:'PLAYER', col:'#ff2255', desc:'Start at 40 HP · no health pickups', apply:(c)=>{ c.ironMan=true; } },
{ id:'mut_sudden', icon:'<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><circle cx="11" cy="14.5" r="7"/><path d="M13 6c0-1.6 1.4-2.8 3.2-2.8" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="17" cy="2.6" r="1.7"/><path d="M8 11.5a3.5 3.5 0 013.5-3.5" stroke="#0a1a05" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.6"/></svg>', name:'SUDDEN DEATH', tag:'PLAYER', col:'#ff0044', desc:'One hit = instant death', apply:(c)=>{ c.suddenDeath=true; } },
{ id:'mut_glasscannon',icon:'<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2l6 6-6 14L6 8z"/><path d="M12 2l6 6h-6zM12 2l-6 6h6z" fill="#0a1a05" opacity="0.35"/></svg>', name:'GLASS CANNON', tag:'PLAYER', col:'#00eeff', desc:'Deal 2× damage but start with half HP', apply:(c)=>{ c.dmgMult=(c.dmgMult||1)*2; c.hpStartMult=(c.hpStartMult||1)*0.5; } },
{ id:'mut_knifeonly', icon:'<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><g transform="rotate(45 12 12)"><polygon points="12,1.5 14.2,5 14.2,11 9.8,11 9.8,5"/><rect x="6.5" y="11" width="11" height="1.8" rx="0.4"/><rect x="10" y="12.8" width="4" height="6.5" rx="1"/><circle cx="12" cy="19.8" r="1.6"/></g></svg>', name:'PACIFIST+', tag:'PLAYER', col:'#88ff88', desc:'Knife only — but knife deals 4× damage',apply:(c)=>{ c.knifeOnly=true; c.dmgMult=(c.dmgMult||1)*4; } },
{ id:'mut_fogofwar', icon:'<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6.5 16A4 4 0 016 8.1 5 5 0 0115.5 6.5 4.2 4.2 0 0118 14.5v.2a3.3 3.3 0 01-.5 1.3z"/><path d="M4 18.5h13a2 2 0 000-4H5a2 2 0 00-1 3.7z"/></svg>', name:'FOG OF WAR', tag:'WORLD', col:'#aaaacc', desc:'Permanent night fog covers the map', apply:(c)=>{ c.fogOfWar=true; } },
{ id:'mut_oneclip', icon:'<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" width="18" height="18"><path d="M3 8l9-4 9 4v9l-9 4-9-4z"/><path d="M12 4v18M3 8l9 4 9-4" stroke="#0a1a05" stroke-width="1" fill="none"/></svg>', name:'ONE CLIP', tag:'WORLD', col:'#ffaa00', desc:'No ammo pickups ever drop', apply:(c)=>{ c.noAmmoDrops=true; } },
{ id:'mut_doubledown', icon:'<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg>', name:'DOUBLE DOWN', tag:'SCORING', col:'#aaff00', desc:'2× score multiplier — no powerup drops',apply:(c)=>{ c.scoreMult=(c.scoreMult||1)*2; c.noPowerupDrops=true; } },
{ id:'mut_goldrush', icon:'<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" width="18" height="18"><path d="M7 3h10v6a5 5 0 01-10 0z"/><path d="M7 4.5H3.5v2A3.5 3.5 0 007 10zM17 4.5h3.5v2A3.5 3.5 0 0117 10z"/><rect x="10.5" y="14" width="3" height="4"/><rect x="7" y="19" width="10" height="2" rx="0.6"/></svg>', name:'GOLD RUSH', tag:'SCORING', col:'#ffd700', desc:'3× score — enemies are 50% faster too', apply:(c)=>{ c.scoreMult=(c.scoreMult||1)*3; c.spdMult=(c.spdMult||1)*1.5; } },
{ id:'mut_chaos', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><path d="M12 3a9 9 0 106.4 2.6"/><path d="M12 3v6l4-3"/></svg>', name:'CHAOS MODE', tag:'WORLD', col:'#ff44ff', desc:'Every 5 waves: 3 random mutators replace the current set', apply:(c)=>{ c.chaosActive=true; } },
{ id:'mut_turbo', icon:'<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M9 2 2 12h4.5L4 22l10-12H9.5z"/><path d="M15 2 9.5 10h4l-2 6 8-9h-4.5z" opacity="0.55"/></svg>', name:'TURBO MODE', tag:'ENEMIES', col:'#ffaa00', desc:'2× enemy speed · 2× spawn count', apply:(c)=>{ c.spdMult=(c.spdMult||1)*2; c.waveCountMult=(c.waveCountMult||1)*2; } },
{ id:'mut_breakwalls', icon:'<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" width="18" height="18"><rect x="2" y="3" width="20" height="18" rx="1"/><path d="M2 8h20M2 14h20M2 19h20M7 3v5M12 8v6M17 3v5M7 14v5M17 14v5" stroke="#0a1a05" stroke-width="1" fill="none"/></svg>', name:'BREACH MODE', tag:'WORLD', col:'#dd9955', desc:'Buildings can be shot down and destroyed', apply:(c)=>{ c.breakableWalls=true; } },
{ id:'mut_playerheaven', icon:'<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 1l2.5 7.5H22l-6 5 2.3 7.5L12 16.5 5.7 21l2.3-7.5-6-5h7.5z"/></svg>', name:'PLAYER BULLET HEAVEN', tag:'WEAPONS', col:'#ffdd00', desc:'Your gun fires a massive fan of bullets every shot', apply:(c)=>{ c.playerBulletHeaven=true; } },
{ id:'mut_armageddon', icon:'<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" width="18" height="18"><circle cx="12" cy="12" r="2.6"/><path d="M12 12L9 5.5A7 7 0 0119 12z"/><path d="M12 12l7 3.5A7 7 0 015 15.5z"/><path d="M12 12L5 8.5A7 7 0 0112 5z"/><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>', name:'ARMAGEDDON', tag:'WEAPONS', col:'#ff2200', desc:'Press E for a screen-clearing nuke (45s cooldown)', apply:(c)=>{ c.armageddon=true; } },
]; ;$buildings.MUTATOR_DEFS = MUTATOR_DEFS;
window.MUTATOR_DEFS = MUTATOR_DEFS;
function buildMutatorConfig(){
const c={
waveCountMult:1, hpMult:1, spdMult:1, scoreMult:1,
dmgMult:1, hpStartMult:1, enemyFireMult:1,
ironMan:false, suddenDeath:false, knifeOnly:false,
fogOfWar:false, noAmmoDrops:false, noPowerupDrops:false,
chaosActive:false, breakableWalls:false,
playerBulletHeaven:false, armageddon:false,
};
for(const id of activeMutators){ const d=MUTATOR_DEFS.find(x=>x.id===id); if(d)d.apply(c); }
if(c.suddenDeath){
c.waveCountMult = Math.min(c.waveCountMult, 1.4);
c.spdMult = Math.min(c.spdMult, 1.35);
c.enemyFireMult = Math.min(c.enemyFireMult, 1.5);
}
return c;
}
function getRandomMutators(count, excludeIds=['mut_chaos','mut_turbo']){
const candidates=MUTATOR_DEFS.filter(m=>!excludeIds.includes(m.id));
const shuffled=[...candidates];
for(let i=shuffled.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
}
return shuffled.slice(0,count).map(m=>m.id);
}
$buildings._mutCfg = null;
Object.defineProperty(window,'_mutCfg',{get:()=>$buildings._mutCfg,set:(v)=>{$buildings._mutCfg=v;},configurable:true});
function applyChaosReroll(){
if(!$buildings._mutCfg||!$buildings._mutCfg.chaosActive) return;
if($buildings.wave<=0||$buildings.wave%5!==0) return;
const newIds=getRandomMutators(3);
activeMutators.clear();
activeMutators.add('mut_chaos');
(window._dailyRouletteMutators || []).forEach(id => activeMutators.add(id));
newIds.forEach(id=>activeMutators.add(id));
$buildings._mutCfg=buildMutatorConfig();
$buildings._mutCfg.chaosActive=true;
if(typeof $legendary.updateWepUpgradeHUD==='function') $legendary.updateWepUpgradeHUD();
const mhud=document.getElementById('mutator-hud');
if(mhud){
mhud.style.display='block';
mhud.innerHTML='◎ CHAOS: '+newIds.map(id=>{
const d=MUTATOR_DEFS.find(x=>x.id===id);
return d?`<span style="color:${d.col}">${d.icon}${d.name}</span>`:id;
}).join(' · ');
}
showPickupMsg('◎ CHAOS RE-ROLL! New mutators active','#ff44ff');
if(typeof $psycho2.floatTextPop==='function') $psycho2.floatTextPop($buildings.player.x,$buildings.player.y-60,'◎ CHAOS!','#ff44ff',20);
}
$buildings.reloading = undefined; $buildings.reloadTimer = undefined; $buildings.curWep = undefined; $buildings.wepAmmo = undefined;
$buildings.lastDamageSource = 'enemy';
$buildings.totalKills = undefined; $buildings.bossAlive = undefined; $buildings.weather = undefined; $buildings.weatherTimer = 0;
$buildings._bossFightMinHpPct = 1; $buildings._bossFightStartTick = 0;
$buildings._airstrikeGraceUntil = 0;
$buildings.wepKills = {};
$buildings.lifeTokens = 0;
$buildings.continueUsedThisRun = false;
$buildings.firstPlay = false;
try { $buildings.lifeTokens = parseInt(localStorage.getItem('diy_tokens')||'0'); } catch(e){}
if (typeof tokens === 'undefined') window.tokens = $buildings.lifeTokens;
let mouse = {x:0,y:0}; let keys = {}; let pickTO; let leaderboard = []; $buildings.isPaused = false; ;$buildings.mouse = mouse; $buildings.keys = keys;
$buildings.tick = 0;
$buildings.playerXP = 0; $buildings.playerLevel = 1; $buildings.xpToNext = 100;
$buildings.killStreak = 0; $buildings.streakTimer = 0; $buildings.streakTO = null; let _streakFired = new Set(); ;$buildings._streakFired = _streakFired;
$buildings._bossTypesThisRun = [];
$buildings._firstBossSpawnTick = null;
const _milestoneFired = new Set();
function _resetMilestones(){ _milestoneFired.clear(); }
function _checkRunMilestones(weapon){
if($buildings.state !== 'playing') return;
const kk = $buildings.wepKills[weapon] || 0;
const tk = $buildings.totalKills;
const ks = $buildings.killStreak;
const wepMilestones = [
{ key:'knife5', w:'knife', n:5, text:'5 KNIFE KILLS', sub:'KNIFE MASTER — CLOSE RANGE LETHAL' },
{ key:'knife15', w:'knife', n:15, text:'15 KNIFE KILLS', sub:'BLADE SPECIALIST UNLOCKED' },
{ key:'shotgun10',w:'shotgun', n:10, text:'* 10 SHOTGUN KILLS', sub:'POINT BLANK SPECIALIST' },
{ key:'rifle25', w:'rifle', n:25, text:'25 RIFLE KILLS', sub:'MARKSMAN RATING ACHIEVED' },
{ key:'laser10', w:'laser', n:10, text:'▸ 10 LASER KILLS', sub:'ENERGY WEAPON PROFICIENCY' },
{ key:'grenade5', w:'grenade', n:5, text:'▪ 5 GRENADE KILLS', sub:'EXPLOSIVE ORDNANCE EXPERT' },
{ key:'plasma5', w:'plasma', n:5, text:'● 5 PLASMA KILLS', sub:'PLASMA TECHNOLOGY MASTERED' },
];
wepMilestones.forEach(m => {
if(m.w === weapon && kk >= m.n && !_milestoneFired.has(m.key)){
_milestoneFired.add(m.key);
_gst(() => { $profiler.showUnlockBanner(m.text, m.sub); audioManager.levelUp(); }, 300);
}
});
const killMilestones = [
{ key:'kills10', n:10, text:'X 10 KILLS', sub:'SOLDIER RATING ACHIEVED' },
{ key:'kills25', n:25, text:'X 25 KILLS', sub:'VETERAN RATING ACHIEVED' },
{ key:'kills50', n:50, text:'X 50 KILLS', sub:'ELITE RATING ACHIEVED' },
{ key:'kills100', n:100, text:'X 100 KILLS', sub:'DEATH MACHINE — CENTURY MARK' },
];
killMilestones.forEach(m => {
if(tk >= m.n && !_milestoneFired.has(m.key)){
_milestoneFired.add(m.key);
_gst(() => { $profiler.showUnlockBanner(m.text, m.sub); audioManager.levelUp(); }, 300);
}
});
const streakMilestones = [
{ key:'streak5', n:5, text:'5-KILL STREAK', sub:'ON FIRE — KEEP PUSHING' },
{ key:'streak10', n:10, text:'10-KILL STREAK', sub:'UNSTOPPABLE — MAXIMUM INTENSITY' },
{ key:'streak20', n:20, text:'20-KILL STREAK', sub:'LEGENDARY — NO ONE SURVIVES' },
];
streakMilestones.forEach(m => {
if(ks >= m.n && !_milestoneFired.has(m.key)){
_milestoneFired.add(m.key);
_gst(() => { $profiler.showUnlockBanner(m.text, m.sub); audioManager.levelUp(); }, 300);
}
});
}
const Game = {
get state(){return $buildings.state;}, set state(v){$buildings.state=v;},
get player(){return $buildings.player;}, set player(v){$buildings.player=v;},
get bullets(){return $buildings.bullets;}, set bullets(v){$buildings.bullets=v;},
get enemies(){return $buildings.enemies;}, set enemies(v){$buildings.enemies=v;},
get particles(){return $buildings.particles;}, set particles(v){$buildings.particles=v;},
get allies(){return $buildings.allies;}, set allies(v){$buildings.allies=v;},
get score(){return $buildings.score;}, set score(v){$buildings.score=v;},
get wave(){return $buildings.wave;}, set wave(v){$buildings.wave=v;},
get tick(){return $buildings.tick;}, set tick(v){$buildings.tick=v;},
get isPaused(){return $buildings.isPaused;}, set isPaused(v){$buildings.isPaused=v;},
get bossAlive(){return $buildings.bossAlive;}, set bossAlive(v){$buildings.bossAlive=v;},
get aliveEnemies(){ return $buildings.enemies ? $buildings.enemies.filter(e=>e.alive) : []; },
get aliveAllies(){ return $buildings.allies ? $buildings.allies.filter(a=>a.alive) : []; },
};
$buildings.shakeX = 0; $buildings.shakeY = 0; $buildings.shakeMag = 0; $buildings.shakeHeavyUntil = 0;
$buildings.settingShakeEnabled = true;
$buildings.settingShakeIntensity = 1.0;
$buildings.settingPhotosensitive = false;
$buildings.settingDifficulty = 'normal';
// ---- HARDER TUNING (v2): global multipliers per difficulty ----
$buildings._hardTune = function(){
  const d = $buildings.settingDifficulty;
  if(d==='easy')   return {spawn:0.95, hp:0.9,  spd:1.0,  fire:1.0,  dmg:1.0};
  if(d==='hard')   return {spawn:1.7,  hp:1.9,  spd:1.3,  fire:1.7,  dmg:1.6};
  if(d==='custom') return {spawn:1.0,  hp:1.0,  spd:1.0,  fire:1.0,  dmg:1.0};
  return                  {spawn:1.35, hp:1.45, spd:1.15, fire:1.35, dmg:1.25};
};
let customDiff = { hp:1.0, speed:1.0, spawn:1.0, dmg:1.0, pspeed:1.0 }; ;$buildings.customDiff = customDiff;
$buildings.settingPerfMode = false;
$buildings._cvFlash = 0;
$buildings._cvFlashColor = 'rgba(200,255,100,0.12)';
const _muzzleLight={x:0,y:0,col:'#aaff44',r:0,life:0,maxLife:1}; ;$buildings._muzzleLight = _muzzleLight;
function _spawnMuzzleEffect(bx,by,angle,wepType,col){
if($core.isVeryLow) return;
const _cfg={
rifle:       {col:'#c8e8ff',r:80, life:4,sparks:5,spd:3.5,sz:2.5},
shotgun:     {col:'#ff9900',r:110,life:5,sparks:9,spd:4.5,sz:3.0},
smg:         {col:'#aaff44',r:65, life:3,sparks:4,spd:3.0,sz:2.0},
minigun:     {col:'#ff6600',r:100,life:4,sparks:7,spd:4.0,sz:2.5},
rpg:         {col:'#ff4400',r:160,life:7,sparks:12,spd:5.0,sz:4.0},
flamethrower:{col:'#ff8800',r:90, life:4,sparks:6,spd:3.5,sz:3.0},
plasma:      {col:'#00eeff',r:120,life:5,sparks:8,spd:4.0,sz:3.5},
knife:       {col:'#aaddff',r:40, life:2,sparks:3,spd:2.5,sz:1.5},
laser:       {col:'#ff00ff',r:90, life:4,sparks:5,spd:3.5,sz:2.5},
}[wepType]||{col:col||'#aaff44',r:70,life:3,sparks:4,spd:3.0,sz:2.0};
_muzzleLight.x=bx; _muzzleLight.y=by;
_muzzleLight.col=_cfg.col;
_muzzleLight.r=$core.isMobile?Math.round(_cfg.r*0.75):_cfg.r;
_muzzleLight.maxLife=_cfg.life; _muzzleLight.life=_cfg.life;
if($buildings.settingPerfMode && $core.isMobile) return;
const sparkCount=$core.isMobile?Math.max(2,Math.ceil(_cfg.sparks*0.55)):_cfg.sparks;
const spreadArc=wepType==='shotgun'?0.9:wepType==='flamethrower'?0.7:0.45;
for(let i=0;i<sparkCount;i++){
const a=angle+(Math.random()-0.5)*spreadArc;
const spd=_cfg.spd*(0.6+Math.random()*0.8);
const p=$bosses._acquireParticle();
p.x=bx; p.y=by; p.vx=Math.cos(a)*spd; p.vy=Math.sin(a)*spd;
p.col=i%3===0?'#ffffff':_cfg.col;
p.sz=_cfg.sz*(0.5+Math.random()*0.7);
p.life=Math.floor(8+Math.random()*10); p._alive=true;
$buildings.particles.push(p);
}
const _shellWeps=['rifle','shotgun','smg','minigun'];
if(!$core.isMobile && _shellWeps.includes(wepType) && Math.random()<0.85){
const shellAng=angle+Math.PI*0.5*(Math.random()<0.5?1:-1)+(Math.random()-0.5)*0.3;
const sc=$bosses._acquireParticle();
sc.x=bx-Math.cos(angle)*8; sc.y=by-Math.sin(angle)*8;
sc.vx=Math.cos(shellAng)*(1.8+Math.random()*1.4);
sc.vy=Math.sin(shellAng)*(1.8+Math.random()*1.4);
sc.col='#d4a840'; sc.sz=1.8;
sc.life=Math.floor(22+Math.random()*14); sc._alive=true;
$buildings.particles.push(sc);
}
}
$buildings.settingAimAssist = true;
$buildings.settingFireOnAim = true;
$buildings.settingAutoAim = false;
$buildings.settingVibration = true;
$buildings.settingColorblind = false;
$buildings.settingKbNav = false;
$buildings.setting30fps = false;
$buildings.settingAutoSwitch = false;
$buildings.wepUpgrades = Object.fromEntries(Object.keys(WEAPONS).map(w=>[w,{dmg:0,ammo:0,reload:0}]));
$buildings.grenadeCount = 3;
let upgradePanel=null;
function el(id){return document.getElementById(id);}
function showPickupMsg(text,col,sub){
$replay.pMsg.innerHTML = sub
? `<span>${text}</span><div style="font-size:11px;letter-spacing:2px;opacity:0.65;margin-top:4px;font-family:'Share Tech Mono',monospace;">${sub}</div>`
: text;
$replay.pMsg.style.color=col;$replay.pMsg.style.opacity='1';
clearTimeout(pickTO);pickTO=setTimeout(()=>$replay.pMsg.style.opacity='0',2000);
}
window.showPickupMsg = showPickupMsg;

function _getGodModeBadge(){
  let badge = document.getElementById('god-mode-badge');
  if(!badge){
    badge = document.createElement('div');
    badge.id = 'god-mode-badge';
    badge.style.cssText = 'position:fixed;top:calc(max(6px,env(safe-area-inset-top,6px)) + 34px);left:50%;transform:translateX(-50%);'+
      'z-index:20;font-family:"Black Ops One",sans-serif;font-size:14px;letter-spacing:3px;color:#1a1200;'+
      'background:linear-gradient(180deg,#ffe066,#ffaa00);padding:8px 22px;border-radius:0;'+
      'border:2px solid #fff4cc;box-shadow:0 0 24px rgba(255,200,0,0.7),0 0 50px rgba(255,170,0,0.4);'+
      'opacity:0;pointer-events:none;transition:opacity 0.25s;text-shadow:0 1px 0 rgba(255,255,255,0.4);';
    badge.innerHTML = '▸ GOD MODE <span id="god-mode-timer" style="color:#4a2a00;">8</span>s';
    document.body.appendChild(badge);
  }
  return badge;
}
const GOD_MODE_RETRIGGER_CAP_TICKS = 30; ;$buildings.GOD_MODE_RETRIGGER_CAP_TICKS = GOD_MODE_RETRIGGER_CAP_TICKS;
});