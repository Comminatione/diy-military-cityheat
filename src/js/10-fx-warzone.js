window.__engine.files.push(function* psycho1() {
const $bosses = window.__engine.bosses;
const $buildings = window.__engine.buildings;
const $core = window.__engine.core;
const $profiler = window.__engine.profiler;
const $props = window.__engine.props;
const $psycho1 = window.__engine.psycho1;
const $psycho2 = window.__engine.psycho2;
const $replay = window.__engine.replay;
const $weather = window.__engine.weather;
Object.assign($psycho1, { _navRebuildIfNeeded, _pushCrater, breakBuilding, buildEnv, buildNavField, buildingOverlap, damageBuilding, findBuildingAt, navMoveEnemy, onBuilding });
yield;

$psycho1._psychoActive = false;
$psycho1._psychoCooldown = 0;
const PSYCHO_COOLDOWN = 480; ;$psycho1.PSYCHO_COOLDOWN = PSYCHO_COOLDOWN;
const PSYCHO_MAX_DURATION = 300; ;$psycho1.PSYCHO_MAX_DURATION = PSYCHO_MAX_DURATION;
$psycho1._psychoDuration = 0;
const ENVS={
jungle:{
name:'JUNGLE OPS',
g0:'#153206',g1:'#1e420a',g2:'#0d2204',
grass:['#264a10','#315814','#1c3a0a','#2d5210','#142e06','#3a6016'],
dirt:'#3a2410',
trunkCol:'#1e1206',leafCol:'#143806',leaf2:'#1e480c',leafRim:'#061204',leafHi:'#4a8a1c',
bWall:'#3a382c',bRoof:'#24221a',bDark:'#131208',bAccent:'#5a5844',bWin:'#0a0906',
ambient:'rgba(40,8,0,0.06)',fog:'rgba(2,6,1,0.55)'
},
desert:{
name:'DESERT STORM',
g0:'#c8862c',g1:'#e8ac48',g2:'#b87820',
grass:['#8a6c26','#a68536','#c29e46','#785a1e','#9c7a30','#b08a3a'],
dirt:'#8a5c1c',
trunkCol:'#5a3a10',leafCol:'#7a6820',leaf2:'#9a8840',duneShadow:'#8a5a18',duneHi:'#ffd878',
bWall:'#c8aa70',bRoof:'#a88a50',bDark:'#886840',bAccent:'#d8be88',bWin:'#3a2800',
ambient:'rgba(255,200,80,0.03)',fog:'rgba(35,25,6,0.4)'
},
urban:{
name:'URBAN WARFARE',
g0:'#14161f',g1:'#1d2030',g2:'#171a28',
grass:['#1a1d2c','#202438','#161828','#262b40','#12141f','#1e2234'],
dirt:'#10121c',
trunkCol:'#2a2010',leafCol:'#203820',leaf2:'#2a4828',
bWall:'#2b3044',bRoof:'#1f2334',bDark:'#12141f',bAccent:'#5a6a9a',bWin:'#0b1220',
ambient:'rgba(90,60,200,0.05)',fog:'rgba(6,6,18,0.4)'
},
arctic:{
name:'ARCTIC ASSAULT',
g0:'#c8dce8',g1:'#daeaf4',g2:'#b8ccd8',
grass:['#d4e8f4','#c0d4e4','#e8f4ff','#b0c8d8','#cce0ee','#d8ecf8'],
dirt:'#a0b8c8',
trunkCol:'#5a4a3a',leafCol:'#c0d8e8',leaf2:'#d8eef8',
bWall:'#8090a0',bRoof:'#607080',bDark:'#405060',bAccent:'#a0b8c8',bWin:'#203040',
ambient:'rgba(200,230,255,0.05)',fog:'rgba(180,210,240,0.15)'
},
night:{
name:'NIGHT RAID',
g0:'#050810',g1:'#080d18',g2:'#060a14',
grass:['#0a0e18','#0c1020','#08090f','#121624','#0e121c','#0a0c14'],
dirt:'#0a0808',
trunkCol:'#1a1210',leafCol:'#0a1a08',leaf2:'#081408',
bWall:'#181820',bRoof:'#101018',bDark:'#080810',bAccent:'#282830',bWin:'#002040',
ambient:'rgba(0,60,255,0.04)',fog:'rgba(0,0,10,0.5)'
},
spaceship:{
name:'SPACESHIP INTERIOR',
g0:'#04070f',g1:'#080f1e',g2:'#060b18',
grass:['#0a1224','#0e1830','#070e1e','#111a36','#0b1428','#050a18'],
dirt:'#070a14',
trunkCol:'#1a1a3a',leafCol:'#001a3a',leaf2:'#002040',
bWall:'#1c2640',bRoof:'#121a2e',bDark:'#070b16',bAccent:'#18e0ff',bWin:'#18c8ff',
ambient:'rgba(0,160,255,0.05)',fog:'rgba(0,2,14,0.5)'
},
mars:{
name:'MARS SURFACE',
g0:'#3a1408',g1:'#5a2010',g2:'#4a1a0c',
grass:['#5a2810','#6a3018','#4a2008','#3a1808','#7a3820','#602818'],
dirt:'#2a0e04',
trunkCol:'#4a1a08',leafCol:'#5a2808',leaf2:'#3a1408',
bWall:'#8a5840',bRoof:'#6a3820',bDark:'#4a2010',bAccent:'#aa7050',bWin:'#ff6030',
ambient:'rgba(255,80,20,0.06)',fog:'rgba(30,8,2,0.45)'
},
warzone:{
name:'WAR ZONE',
g0:'#2b2925',g1:'#36332d',g2:'#221f1b',
grass:['#3a362e','#2f2c26','#443f35','#26231e','#4a4438','#35312a'],
dirt:'#1d1a16',
trunkCol:'#1a1410',leafCol:'#2a2620',leaf2:'#35302a',
bWall:'#5f5b52',bRoof:'#3b3934',bDark:'#161412',bAccent:'#9a8668',bWin:'#0a0807',
ambient:'rgba(255,90,20,0.05)',fog:'rgba(22,16,13,0.5)'
}
}; ;$psycho1.ENVS = ENVS;
$psycho1.grassBlades = []; $psycho1.dirtPatches = []; $psycho1.trees = []; $psycho1.buildings = []; $psycho1.sceneProps = []; $psycho1.groundCache = null; $psycho1._envMotes = []; $psycho1._envMoteCol = '#ffffff'; $psycho1._envMoteDir = -1;
class SpatialHashGrid {
constructor(cellSize=80){
this.cs=cellSize;
this.cells=new Map();
}
_key(cx,cy){return (cx+32768)*65536+(cy+32768);}
_cellsFor(x,y,w,h){
const x0=Math.floor(x/this.cs), y0=Math.floor(y/this.cs);
const x1=Math.floor((x+w)/this.cs), y1=Math.floor((y+h)/this.cs);
const out=[];
for(let cx=x0;cx<=x1;cx++) for(let cy=y0;cy<=y1;cy++) out.push(this._key(cx,cy));
return out;
}
clear(){this.cells.clear();}
insert(obj){
for(const k of this._cellsFor(obj.x,obj.y,obj.w,obj.h)){
if(!this.cells.has(k)) this.cells.set(k,[]);
this.cells.get(k).push(obj);
}
}
query(x,y,pad=0){
const x0=Math.floor((x-pad)/this.cs)-1, y0=Math.floor((y-pad)/this.cs)-1;
const x1=Math.floor((x+pad)/this.cs)+1, y1=Math.floor((y+pad)/this.cs)+1;
const results=new Set();
for(let cx=x0;cx<=x1;cx++) for(let cy=y0;cy<=y1;cy++){
const bucket=this.cells.get(this._key(cx,cy));
if(bucket) for(const b of bucket) results.add(b);
}
return results;
}
rebuild(list){
this.clear();
for(const obj of list) this.insert(obj);
}
}
const buildingGrid=new SpatialHashGrid(80); ;$psycho1.buildingGrid = buildingGrid;
const BUILDING_MAX_HP=20; ;$psycho1.BUILDING_MAX_HP = BUILDING_MAX_HP;
const MAX_SETTLED_RUBBLE=140; ;$psycho1.MAX_SETTLED_RUBBLE = MAX_SETTLED_RUBBLE;
const MAX_OPEN_CRATERS=18; ;$psycho1.MAX_OPEN_CRATERS = MAX_OPEN_CRATERS;
const MAX_TOTAL_CRATERS = ($core.isUltraLow || $core.isLowEndDesktop) ? 14 : $core.isMobile ? 24 : 40;
function _pushCrater(c){
if ($buildings.craters.length >= MAX_TOTAL_CRATERS) {
const idx = $buildings.craters.findIndex(cr => !cr._fromBuilding);
$buildings.craters.splice(idx >= 0 ? idx : 0, 1);
}
$buildings.craters.push(c);
}
function damageBuilding(b,dmg,hitX,hitY,fromChain){
if(!b||b.hp===undefined) return false;
if($buildings._mutCfg && $buildings._mutCfg.breakableWalls) dmg*=2.5;
b.hp-=dmg;
b.crackFlash=1.0;
const _n=$core.isMobile?2:4;
for(let i=0;i<_n;i++) $bosses.ptcl(hitX,hitY,'#998877',1,2);
if(b.hp<=0){
breakBuilding(b,fromChain);
return true;
}
return false;
}
function breakBuilding(b,fromChain){
const idx=$psycho1.buildings.indexOf(b);
if(idx<0) return;
$psycho1.buildings.splice(idx,1);
buildingGrid.rebuild($psycho1.buildings);
if (typeof $profiler._markMinimapDirty === 'function') $profiler._markMinimapDirty();
const cx=b.x+b.w/2, cy=b.y+b.h/2;
const cRad=Math.max(b.w,b.h)*0.62;
_pushCrater({x:cx,y:cy,r:cRad,seed:(cx*13+cy*7)|0,_fromBuilding:true});
$buildings.debrisArr.push({x:cx,y:cy,r:Math.max(b.w,b.h)*0.7,life:34,maxLife:34,col:'#887766'});
const _chunks=$core.isMobile?6:14;
for(let i=0;i<_chunks;i++){
const ang=Math.random()*Math.PI*2, dist=Math.random()*Math.max(b.w,b.h)*0.5;
$bosses.ptclQ(cx+Math.cos(ang)*dist, cy+Math.sin(ang)*dist, '#776655', 1, 2+Math.random()*3);
}
const _flyChunks=$core.isMobile?5:10;
for(let i=0;i<_flyChunks;i++){
const ang=Math.random()*Math.PI*2;
const spd=2+Math.random()*4;
$buildings.rubblePieces.push({
x:cx,y:cy,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,
sz:3+Math.random()*5,rot:Math.random()*Math.PI*2,vr:(Math.random()-0.5)*0.3,
life:24+Math.random()*16,settled:false,
col:Math.random()<0.5?'#776655':'#554444',
dmgDone:false
});
}
$bosses.shake(fromChain?2:3);
audioManager.explosion && audioManager.explosion();
$psycho2.floatText(cx,cy-20,fromChain?'CHAIN REACTION':'WALL DESTROYED',fromChain?'#ffcc22':'#ff8833',11);
if(!fromChain){
const _chainR=Math.max(b.w,b.h)*1.6;
const _nearby=[...buildingGrid.query(cx,cy,_chainR)].filter(nb=>nb!==b);
for(const nb of _nearby){
const nd=Math.hypot((nb.x+nb.w/2)-cx,(nb.y+nb.h/2)-cy);
if(nd<_chainR && nb.hp!==undefined){
$buildings._gst(()=>{ if($psycho1.buildings.includes(nb)) damageBuilding(nb,14,nb.x+nb.w/2,nb.y+nb.h/2,true); }, 90+Math.random()*120);
}
}
}
}
const _NAV_CELL = 40;
let _navW = 0, _navH = 0, _navField = null;
$psycho1._navLastPx = -9999; let _navLastPy = -9999;
function _navCellFree(cx,cy,pad){ return !onBuilding(cx*_NAV_CELL+_NAV_CELL*0.5, cy*_NAV_CELL+_NAV_CELL*0.5, pad); }

let _navWorker = null;
let _navWorkerReady = false;
let _navRequestId = 0;
let _navBuildingsSentFor = null;
(function _initNavWorker(){
if(typeof Worker === 'undefined') return;
if(navigator.deviceMemory !== undefined && navigator.deviceMemory <= 2) return;
try{
const workerSrc = `// ============================================================================
// 10-nav-worker.js
// Runs the enemy pathfinding flow-field build (buildNavField in
// 03-engine-core.js) on a background thread via Web Worker.
//
// Scope: ONLY the BFS flood-fill grid computation. Everything else about
// enemy AI (shooting, damage, audio, particles, boss logic — the other ~40
// functions updateEnemyAI() touches) stays on the main thread, since none
// of that can cross a Worker boundary without shared memory.
//
// Protocol (all messages are plain objects, structured-clone safe):
//   main -> worker: { type:'buildings', list:[{x,y,w,h}, ...] }
//     Sent whenever the building layout changes (level start, resize).
//     Rebuilds this worker's internal SpatialHashGrid.
//   main -> worker: { type:'rebuild', w, h, navCell, requestId }
//     Requests a fresh flow field for the given arena size. requestId is
//     echoed back so the main thread can discard stale/out-of-order replies
//     (e.g. if a resize fires again before the previous rebuild finished).
//   worker -> main: { type:'field', field: Float32Array, navW, navH, requestId }
//     field is sent as a Transferable (zero-copy) for speed.
// ============================================================================

// ---- ported verbatim from 03-engine-core.js — plain data structure, no
// DOM/game-state dependency, safe to duplicate here rather than share ----
class SpatialHashGrid {
constructor(cellSize=80){
this.cs=cellSize;
this.cells=new Map();
}
_key(cx,cy){return cx+'_'+cy;}
_cellsFor(x,y,w,h){
const x0=Math.floor(x/this.cs), y0=Math.floor(y/this.cs);
const x1=Math.floor((x+w)/this.cs), y1=Math.floor((y+h)/this.cs);
const out=[];
for(let cx=x0;cx<=x1;cx++) for(let cy=y0;cy<=y1;cy++) out.push(this._key(cx,cy));
return out;
}
clear(){this.cells.clear();}
insert(obj){
for(const k of this._cellsFor(obj.x,obj.y,obj.w,obj.h)){
if(!this.cells.has(k)) this.cells.set(k,[]);
this.cells.get(k).push(obj);
}
}
query(x,y,pad=0){
const x0=Math.floor((x-pad)/this.cs)-1, y0=Math.floor((y-pad)/this.cs)-1;
const x1=Math.floor((x+pad)/this.cs)+1, y1=Math.floor((y+pad)/this.cs)+1;
const results=new Set();
for(let cx=x0;cx<=x1;cx++) for(let cy=y0;cy<=y1;cy++){
const bucket=this.cells.get(this._key(cx,cy));
if(bucket) for(const b of bucket) results.add(b);
}
return results;
}
rebuild(list){
this.clear();
for(const obj of list) this.insert(obj);
}
}

const _grid = new SpatialHashGrid(80);

function _onBuilding(x,y,pad){
for(const b of _grid.query(x,y,pad)){
if(x>b.x-pad && x<b.x+b.w+pad && y>b.y-pad && y<b.y+b.h+pad) return true;
}
return false;
}

// Identical algorithm to buildNavField() in 03-engine-core.js — BFS flood
// fill from every walkable cell, then a second pass picking each cell's
// best downhill direction toward the nearest walkable region.
function _buildField(W, H, navCell){
const navW = Math.ceil(W/navCell)+1, navH = Math.ceil(H/navCell)+1;
const total = navW*navH, pad = 8;
const dist = new Int32Array(total).fill(-1);
const queue = [];
const cellFree = (cx,cy)=> !_onBuilding(cx*navCell+navCell*0.5, cy*navCell+navCell*0.5, pad);
// BUG FIX (ported from 03-engine-core.js's identical fix): seed BLOCKED
// cells at dist=0 (they ARE the walls), not free cells — seeding free
// cells meant every reachable cell ended up at dist=0 with no gradient
// ever forming, so navSample() always returned null in the original code.
for(let cy=0;cy<navH;cy++) for(let cx=0;cx<navW;cx++){
if(!cellFree(cx,cy)){ dist[cy*navW+cx]=0; queue.push(cx,cy); }
}
const dirs8=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
let head=0;
while(head<queue.length){
const cx=queue[head++], cy=queue[head++], d=dist[cy*navW+cx];
for(const [ox,oy] of dirs8){
const nx=cx+ox, ny=cy+oy;
if(nx<0||ny<0||nx>=navW||ny>=navH) continue;
const ni=ny*navW+nx;
if(dist[ni]!==-1 || !cellFree(nx,ny)) continue;
dist[ni]=d+1; queue.push(nx,ny);
}
}
const field = new Float32Array(total*2);
for(let cy=0;cy<navH;cy++) for(let cx=0;cx<navW;cx++){
const i=cy*navW+cx;
if(dist[i]===-1) continue;
if(!cellFree(cx,cy)) continue; // walls themselves need no vector
let bestD=dist[i], bdx=0, bdy=0;
for(const [ox,oy] of dirs8){
const nx=cx+ox, ny=cy+oy;
if(nx<0||ny<0||nx>=navW||ny>=navH) continue;
const nd=dist[ny*navW+nx];
// point toward the FARTHEST-from-wall neighbor, guiding escape away
// from the obstacle instead of collapsing everything to distance 0.
if(nd!==-1 && nd>bestD){ bestD=nd; bdx=ox; bdy=oy; }
}
const len=Math.hypot(bdx,bdy)||1;
field[i*2]=bdx/len; field[i*2+1]=bdy/len;
}
return { field, navW, navH };
}

self.onmessage = function(ev){
const msg = ev.data;
if(msg.type === 'buildings'){
_grid.rebuild(msg.list);
return;
}
if(msg.type === 'rebuild'){
const { field, navW, navH } = _buildField(msg.w, msg.h, msg.navCell);
// Transfer the underlying buffer — zero-copy handoff back to main thread
// instead of a structured-clone deep copy.
self.postMessage({ type:'field', field, navW, navH, requestId: msg.requestId }, [field.buffer]);
}
};
`;
const blob = new Blob([workerSrc], { type: 'application/javascript' });
const blobUrl = URL.createObjectURL(blob);
_navWorker = new Worker(blobUrl);
_navWorker.onmessage = function(ev){
const msg = ev.data;
if(msg.type === 'field' && msg.requestId === _navRequestId){
_navField = msg.field;
_navW = msg.navW; _navH = msg.navH;
}
};
_navWorker.onerror = function(){
_navWorkerReady = false;
_navWorker = null;
};
_navWorkerReady = true;
} catch(e){
_navWorker = null;
_navWorkerReady = false;
}
})();
function _navSyncBuildingsToWorker(){
if(!_navWorkerReady || !_navWorker) return;
if(_navBuildingsSentFor === $psycho1.buildings) return;
const list = $psycho1.buildings.map(b=>({x:b.x,y:b.y,w:b.w,h:b.h}));
_navWorker.postMessage({ type:'buildings', list });
_navBuildingsSentFor = $psycho1.buildings;
}
function buildNavField(){
if(!$replay.W||!$replay.H) return;
if(_navWorkerReady && _navWorker){
_navSyncBuildingsToWorker();
_navRequestId++;
_navWorker.postMessage({ type:'rebuild', w:$replay.W, h:$replay.H, navCell:_NAV_CELL, requestId:_navRequestId });
return;
}
_buildNavFieldSync();
}
function _buildNavFieldSync(){
  if(!$replay.W||!$replay.H) return;
  _navW = Math.ceil($replay.W/_NAV_CELL)+1; _navH = Math.ceil($replay.H/_NAV_CELL)+1;
  const total = _navW*_navH, pad = 8;
  const dist = new Int32Array(total).fill(-1);
  const queue = [];
  for(let cy=0;cy<_navH;cy++) for(let cx=0;cx<_navW;cx++){
    if(!_navCellFree(cx,cy,pad)){ dist[cy*_navW+cx]=0; queue.push(cx,cy); }
  }
  const dirs8=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
  let head=0;
  while(head<queue.length){
    const cx=queue[head++],cy=queue[head++],d=dist[cy*_navW+cx];
    for(const [ox,oy] of dirs8){
      const nx=cx+ox,ny=cy+oy;
      if(nx<0||ny<0||nx>=_navW||ny>=_navH) continue;
      const ni=ny*_navW+nx;
      if(dist[ni]!==-1||!_navCellFree(nx,ny,pad)) continue;
      dist[ni]=d+1; queue.push(nx,ny);
    }
  }
  _navField = new Float32Array(total*2);
  for(let cy=0;cy<_navH;cy++) for(let cx=0;cx<_navW;cx++){
    const i=cy*_navW+cx;
    if(dist[i]===-1) continue;
    if(!_navCellFree(cx,cy,pad)) continue;
    let bestD=dist[i],bdx=0,bdy=0;
    for(const [ox,oy] of dirs8){
      const nx=cx+ox,ny=cy+oy;
      if(nx<0||ny<0||nx>=_navW||ny>=_navH) continue;
      const nd=dist[ny*_navW+nx];
      if(nd!==-1&&nd>bestD){ bestD=nd; bdx=ox; bdy=oy; }
    }
    const len=Math.hypot(bdx,bdy)||1;
    _navField[i*2]=bdx/len; _navField[i*2+1]=bdy/len;
  }
}

function navSample(wx,wy){
  if(!_navField) return null;
  const cx=Math.floor(wx/_NAV_CELL), cy=Math.floor(wy/_NAV_CELL);
  if(cx<0||cy<0||cx>=_navW||cy>=_navH) return null;
  const i=(cy*_navW+cx)*2, dx=_navField[i], dy=_navField[i+1];
  return (dx===0&&dy===0) ? null : {dx,dy};
}
function _navRebuildIfNeeded(){
  if(!$buildings.player||!_navField) return;
  if(Math.hypot($buildings.player.x-$psycho1._navLastPx,$buildings.player.y-_navLastPy)>120){
    $psycho1._navLastPx=$buildings.player.x; _navLastPy=$buildings.player.y; buildNavField();
  }
}
function navMoveEnemy(e,spd,pad,gx,gy){
  const _custom = gx!==undefined;
  if(!_custom){ gx=$buildings.player.x; gy=$buildings.player.y; }
  if(!_navField) return $buildings.moveBossToward(e.x,e.y,gx,gy,spd,pad);
  const ddx=gx-e.x, ddy=gy-e.y, ddist=Math.hypot(ddx,ddy)||1;
  const flow=navSample(e.x,e.y);
  let mdx,mdy;
  if(flow&&ddist>80){
    const blocked=onBuilding(e.x+(ddx/ddist)*_NAV_CELL*0.5, e.y+(ddy/ddist)*_NAV_CELL*0.5, pad);
    const fw=blocked?0.85:(_custom?0:0.3);
    mdx=flow.dx*fw+(ddx/ddist)*(1-fw); mdy=flow.dy*fw+(ddy/ddist)*(1-fw);
  } else { mdx=ddx/ddist; mdy=ddy/ddist; }
  const ml=Math.hypot(mdx,mdy)||1; mdx/=ml; mdy/=ml;
  const dt=window._dt||1;
  const nx=e.x+mdx*spd*dt, ny=e.y+mdy*spd*dt;
  if(!onBuilding(nx,ny,pad)) return {x:nx,y:ny};
  if(!onBuilding(nx,e.y,pad)) return {x:nx,y:e.y};
  if(!onBuilding(e.x,ny,pad)) return {x:e.x,y:ny};
  return $buildings.moveBossToward(e.x,e.y,gx,gy,spd,pad);
}
function buildEnv(){
if(!$replay.W||!$replay.H) return;
const env=ENVS[$replay.currentEnv];
$psycho1.grassBlades=[];$psycho1.dirtPatches=[];$psycho1.trees=[];$psycho1.buildings=[];$psycho1.sceneProps=[];$psycho1.groundCache=null;
const _moteCfg = {
jungle:  {col:'#eaff9a', vy:-1, sizeMin:1,   sizeMax:3,   spdMin:0.12, spdMax:0.30, mobileN:14, desktopN:26},
desert:  {col:'#ffe0a0', vy:-1, sizeMin:1,   sizeMax:2.4, spdMin:0.10, spdMax:0.22, mobileN:10, desktopN:20},
urban:   {col:'#c0c0b8', vy:-1, sizeMin:0.8, sizeMax:2,   spdMin:0.08, spdMax:0.20, mobileN:10, desktopN:18},
arctic:  {col:'#ffffff', vy:1,  sizeMin:1.2, sizeMax:2.6, spdMin:0.35, spdMax:0.75, mobileN:16, desktopN:30},
mars:    {col:'#e08050', vy:-1, sizeMin:1,   sizeMax:2.2, spdMin:0.10, spdMax:0.24, mobileN:10, desktopN:20},
spaceship:{col:'#66c8ff',vy:-1, sizeMin:0.8, sizeMax:1.8, spdMin:0.06, spdMax:0.16, mobileN:12, desktopN:22},
night:   {col:'#ffcc66', vy:-1, sizeMin:1,   sizeMax:2.2, spdMin:0.08, spdMax:0.18, mobileN:8,  desktopN:16},
warzone: {col:'#a89c8c', vy:1,  sizeMin:0.8, sizeMax:2.2, spdMin:0.12, spdMax:0.34, mobileN:14, desktopN:28},
};
const _mc = _moteCfg[$replay.currentEnv];
$psycho1._envMotes=[];
$psycho1._envMoteCol = _mc ? _mc.col : '#ffffff';
$psycho1._envMoteDir = _mc ? _mc.vy : -1;
if(_mc && !(($core.isUltraLow||$core.isLowEndDesktop||$buildings.settingPerfMode))){
const moteCount = $core.isMobile ? _mc.mobileN : _mc.desktopN;
for(let i=0;i<moteCount;i++) $psycho1._envMotes.push({
x:Math.random()*$replay.W,y:Math.random()*$replay.H,
r:_mc.sizeMin+Math.random()*(_mc.sizeMax-_mc.sizeMin),
spd:_mc.spdMin+Math.random()*(_mc.spdMax-_mc.spdMin),
drift:(Math.random()-0.5)*0.3,phase:Math.random()*Math.PI*2
});
}
const maxBlades = ($core.isUltraLow || $core.isLowEndDesktop || $buildings.settingPerfMode) ? 150 : $core.isMobile ? 600 : 2800;
const n=Math.min(Math.floor($replay.W*$replay.H/900), maxBlades);
for(let i=0;i<n;i++) $psycho1.grassBlades.push({x:Math.random()*$replay.W,y:Math.random()*$replay.H,h:3+Math.random()*8,lean:(Math.random()-0.5)*0.65,col:env.grass[Math.floor(Math.random()*env.grass.length)],lw:0.7+Math.random()*1.4});
for(let i=0;i<16;i++) $psycho1.dirtPatches.push({x:Math.random()*$replay.W,y:Math.random()*$replay.H,rx:14+Math.random()*50,ry:8+Math.random()*25,rot:Math.random()*Math.PI});
const isPortrait = $replay.H > $replay.W || (window.screen && window.screen.height > window.screen.width);
if(isPortrait){
const cw = Math.min(Math.floor($replay.W * 0.13), 52);
const ch = Math.min(Math.floor($replay.H * 0.055), 46);
const lx = 0, rx = $replay.W - cw;
const ty = 0, by = $replay.H - ch;
$psycho1.buildings.push({x:lx, y:ty, w:cw, h:ch, door:'s', ...$props._genBuildingVariety(), spawnFlash:0, hp:BUILDING_MAX_HP, maxHp:BUILDING_MAX_HP});
$psycho1.buildings.push({x:rx, y:ty, w:cw, h:ch, door:'s', ...$props._genBuildingVariety(), spawnFlash:0, hp:BUILDING_MAX_HP, maxHp:BUILDING_MAX_HP});
$psycho1.buildings.push({x:lx, y:by, w:cw, h:ch, door:'n', ...$props._genBuildingVariety(), spawnFlash:0, hp:BUILDING_MAX_HP, maxHp:BUILDING_MAX_HP});
$psycho1.buildings.push({x:rx, y:by, w:cw, h:ch, door:'n', ...$props._genBuildingVariety(), spawnFlash:0, hp:BUILDING_MAX_HP, maxHp:BUILDING_MAX_HP});
} else {
const bScale = Math.min(1, $replay.W / 900, $replay.H / 500);
const bLayout=[
{fx:0.07,fy:0.05,fw:110,fh:85},{fx:0.87,fy:0.05,fw:110,fh:85},
{fx:0.07,fy:0.86,fw:110,fh:85},{fx:0.87,fy:0.86,fw:110,fh:85},
{fx:0.34,fy:0.03,fw:95,fh:78},{fx:0.60,fy:0.03,fw:95,fh:78},
{fx:0.34,fy:0.89,fw:95,fh:78},{fx:0.60,fy:0.89,fw:95,fh:78},
{fx:0.02,fy:0.42,fw:72,fh:88},{fx:0.92,fy:0.42,fw:72,fh:88},
{fx:0.21,fy:0.24,fw:68,fh:58},{fx:0.73,fy:0.24,fw:68,fh:58},
{fx:0.21,fy:0.68,fw:68,fh:58},{fx:0.73,fy:0.68,fw:68,fh:58},
];
const chokepointLayout = ($replay.currentEnv==='urban'||$replay.currentEnv==='spaceship'||$replay.currentEnv==='arctic') ? [
{fx:0.44,fy:0.20,fw:40,fh:65},
{fx:0.55,fy:0.20,fw:40,fh:65},
{fx:0.44,fy:0.62,fw:40,fh:65},
{fx:0.55,fy:0.62,fw:40,fh:65},
] : [];
const cx=$replay.W/2,cy=$replay.H/2;
const _doorFor=(bx,by,bw,bh)=>{
let door='s';
const toRight=bx+bw/2>cx, toBottom=by+bh/2>cy;
if(Math.abs(bx+bw/2-cx)>Math.abs(by+bh/2-cy)) door=toRight?'w':'e';
else door=toBottom?'n':'s';
return door;
};
for(let bc of [...bLayout,...chokepointLayout]){
const bx=bc.fx*$replay.W, by=bc.fy*$replay.H;
const bw=Math.round(bc.fw*bScale), bh=Math.round(bc.fh*bScale);
$psycho1.buildings.push({x:bx,y:by,w:bw,h:bh,door:_doorFor(bx,by,bw,bh),...$props._genBuildingVariety(),spawnFlash:0,hp:BUILDING_MAX_HP,maxHp:BUILDING_MAX_HP});
}
}
buildingGrid.rebuild($psycho1.buildings);
(function _enforceMinBuildingGaps(){
const MIN_GAP = 40;
for(let pass=0; pass<3; pass++){
for(let i=0;i<$psycho1.buildings.length;i++){
for(let j=i+1;j<$psycho1.buildings.length;j++){
const a=$psycho1.buildings[i], b=$psycho1.buildings[j];
const xOverlap = a.x < b.x+b.w && b.x < a.x+a.w;
const yOverlap = a.y < b.y+b.h && b.y < a.y+a.h;
if(xOverlap && yOverlap){
const overlapX = Math.min(a.x+a.w,b.x+b.w) - Math.max(a.x,b.x);
const overlapY = Math.min(a.y+a.h,b.y+b.h) - Math.max(a.y,b.y);
if(overlapX < overlapY){
const push=(overlapX+MIN_GAP*0.5)/2;
if(a.x<b.x){ a.x=Math.max(0,a.x-push); b.x=Math.min($replay.W-b.w,b.x+push); }
else { b.x=Math.max(0,b.x-push); a.x=Math.min($replay.W-a.w,a.x+push); }
} else {
const push=(overlapY+MIN_GAP*0.5)/2;
if(a.y<b.y){ a.y=Math.max(0,a.y-push); b.y=Math.min($replay.H-b.h,b.y+push); }
else { b.y=Math.max(0,b.y-push); a.y=Math.min($replay.H-a.h,a.y+push); }
}
} else if(xOverlap && !yOverlap){
const gap = a.y < b.y ? (b.y - (a.y+a.h)) : (a.y - (b.y+b.h));
if(gap>=0 && gap<MIN_GAP){
const push=(MIN_GAP-gap)/2;
if(a.y<b.y){ a.y=Math.max(0,a.y-push); b.y=Math.min($replay.H-b.h,b.y+push); }
else { b.y=Math.max(0,b.y-push); a.y=Math.min($replay.H-a.h,a.y+push); }
}
} else if(yOverlap && !xOverlap){
const gap = a.x < b.x ? (b.x - (a.x+a.w)) : (a.x - (b.x+b.w));
if(gap>=0 && gap<MIN_GAP){
const push=(MIN_GAP-gap)/2;
if(a.x<b.x){ a.x=Math.max(0,a.x-push); b.x=Math.min($replay.W-b.w,b.x+push); }
else { b.x=Math.max(0,b.x-push); a.x=Math.min($replay.W-a.w,a.x+push); }
}
}
}
}
}
const spawnCx=$replay.W/2, spawnCy=$replay.H*0.72, spawnClear=110;
for(const b of $psycho1.buildings){
const bcx=b.x+b.w/2, bcy=b.y+b.h/2;
const ddx=bcx-spawnCx, ddy=bcy-spawnCy;
const dist=Math.hypot(ddx,ddy);
const minDist=spawnClear+Math.max(b.w,b.h)/2;
if(dist<minDist){
const pushDist=minDist-dist;
const dirx=dist>0.01?ddx/dist:1, diry=dist>0.01?ddy/dist:0;
b.x=Math.max(0,Math.min($replay.W-b.w,b.x+dirx*pushDist));
b.y=Math.max(0,Math.min($replay.H-b.h,b.y+diry*pushDist));
}
}
(function _capBuildingCoverage(){
const totalArea = $replay.W*$replay.H;
const MAX_COVERAGE = 0.32;
const MIN_BUILDINGS = 6;
let usedArea = $psycho1.buildings.reduce((s,b)=>s+b.w*b.h,0);
if(usedArea <= totalArea*MAX_COVERAGE) return;
$psycho1.buildings.sort((a,b)=>(b.w*b.h)-(a.w*a.h));
while($psycho1.buildings.length>MIN_BUILDINGS && usedArea>totalArea*MAX_COVERAGE){
const removed = $psycho1.buildings.shift();
usedArea -= removed.w*removed.h;
}
})();
buildingGrid.rebuild($psycho1.buildings);
})();
buildNavField();
if($replay.currentEnv !== 'desert' && $replay.currentEnv !== 'spaceship' && $replay.currentEnv !== 'mars') {
let maxTrees = ($core.isUltraLow || $core.isLowEndDesktop || $buildings.settingPerfMode) ? 14 : $core.isMobile ? 24 : 40;
if($replay.currentEnv==='warzone') maxTrees=Math.max(5,Math.round(maxTrees*0.35));
for(let i=0;i<maxTrees;i++){
let tx,ty,ok=false,tries=0;
while(!ok&&tries<20){
tx=40+Math.random()*($replay.W-80);ty=40+Math.random()*($replay.H-80);
ok=!onBuilding(tx,ty,30)&&!(Math.abs(tx-$replay.W/2)<90&&Math.abs(ty-$replay.H*0.72)<90);
tries++;
}
if(ok) $psycho1.trees.push({x:tx,y:ty,r:13+Math.random()*10,trunkH:16+Math.random()*14,phase:Math.random()*Math.PI*2});
}
}
{
const _propTypesForEnv=()=>{
switch($replay.currentEnv){
case 'desert': return ['rock','rock','rock','debris'];
case 'mars': return ['rock','rock','debris'];
case 'warzone': return ['rubble','rubble','rubble','slab','barrel','burntcar','debris','debris'];
case 'arctic': return ['rock','debris','lamp'];
case 'urban': return ['lamp','lamp','car','debris','rock'];
case 'spaceship': return ['debris','debris','lamp'];
default: return ['rock','debris','lamp'];
}
};
const _propTypes=_propTypesForEnv();
const propCount=($replay.currentEnv==='warzone'?14:8)+Math.floor(Math.random()*8);
for(let i=0;i<propCount;i++){
let px,py,ok=false,tries=0;
while(!ok&&tries<20){
px=30+Math.random()*($replay.W-60); py=30+Math.random()*($replay.H-60);
ok=!onBuilding(px,py,26)&&!(Math.abs(px-$replay.W/2)<100&&Math.abs(py-$replay.H*0.72)<100);
tries++;
}
if(!ok) continue;
const ptype=_propTypes[Math.floor(Math.random()*_propTypes.length)];
$psycho1.sceneProps.push($props._makeProp(ptype,px,py));
}
$weather.placeLandmarkForEnv();
}
}
function onBuilding(x,y,pad=0){
const cs=buildingGrid.cs, cells=buildingGrid.cells;
const x0=Math.floor((x-pad)/cs), x1=Math.floor((x+pad)/cs);
const y0=Math.floor((y-pad)/cs), y1=Math.floor((y+pad)/cs);
for(let cx=x0;cx<=x1;cx++){
const kx=(cx+32768)*65536+32768;
for(let cy=y0;cy<=y1;cy++){
const bk=cells.get(kx+cy);
if(bk===undefined) continue;
for(let i=0;i<bk.length;i++){
const b=bk[i];
if(x>b.x-pad&&x<b.x+b.w+pad&&y>b.y-pad&&y<b.y+b.h+pad) return true;
}
}
}
return false;
}
function findBuildingAt(x,y,pad=0){
const cs=buildingGrid.cs, cells=buildingGrid.cells;
const x0=Math.floor((x-pad)/cs), x1=Math.floor((x+pad)/cs);
const y0=Math.floor((y-pad)/cs), y1=Math.floor((y+pad)/cs);
for(let cx=x0;cx<=x1;cx++){
const kx=(cx+32768)*65536+32768;
for(let cy=y0;cy<=y1;cy++){
const bk=cells.get(kx+cy);
if(bk===undefined) continue;
for(let i=0;i<bk.length;i++){
const b=bk[i];
if(x>b.x-pad&&x<b.x+b.w+pad&&y>b.y-pad&&y<b.y+b.h+pad) return b;
}
}
}
return null;
}
function buildingOverlap(x,y,pad){
let best=null;
for(const b of buildingGrid.query(x,y,pad)){
const l=b.x-pad, r=b.x+b.w+pad, t=b.y-pad, bo=b.y+b.h+pad;
if(x<l||x>r||y<t||y>bo) continue;
const dLeft=x-l, dRight=r-x, dTop=y-t, dBottom=bo-y;
const minD=Math.min(dLeft,dRight,dTop,dBottom);
let nx=0,ny=0;
if(minD===dLeft) nx=-1;
else if(minD===dRight) nx=1;
else if(minD===dTop) ny=-1;
else ny=1;
if(!best||minD<best.depth) best={nx,ny,depth:minD};
}
return best;
}
});