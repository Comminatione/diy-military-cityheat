window.__engine.files.push(function* props() {
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
const $weather = window.__engine.weather;
const { fire, ptcl, ptclBurst, ptclQ, radioChatter, shake, showCampaignEndingCutscene, startReload, switchWep } = $bosses;
const { _clearGameTimers, _codeToLabel, _gcsi, _gsi, _gst, _isExclusiveUnlocked, _saveKeybinds, _updateHotkeyBarHints, el, showPickupMsg } = $buildings;
const { _updateShadowFlag, cachedLinearGradient, cachedRadialGradient } = $core;
const { _frostColor, _isoDX, _isoDY, _isoFlat, _serializeUpgrades, buildBuildingSnowCache, saveCheckpoint, updateCoopHUD, updateHP, updateHUD } = $legendary;
const { clearBosses, evaluateDailyChallenges, nextWave, recordRunStats, renderDailyChallenges, startLevel, updateRunStreak } = $mutators;
const { onBuilding } = $psycho1;
const { activatePsychoMode, armageddon, callAirstrike, deactivatePsychoMode, floatText, floatTextPop, killEnemy, throwGrenade, vibrate } = $psycho2;
Object.assign($props, { _genBuildingVariety, _makeProp, _shadeHex, _tickFPS, bomberDetonate, drawAlienGrunt, drawAlly, drawArcticBeast, drawBerserker, drawBomber, drawBoss, drawBuilding, drawElite, drawGhost, drawIsoShadow, drawJuggernaut, drawKnife, drawPhantom, drawPlayer, drawPlayer2, drawProp, drawShieldCarrier, drawSoldier, drawTank, drawTree, goToMenu, onGuidedGrenade, onGuidedKill, onGuidedPickup, onGuidedReload, onGuidedShot, onGuidedWaveClear, onGuidedWaveStart, onGuidedWeaponSwitch, pollGamepad, showHarmTugCredits, showTutorial, startGuidedWave, tickGuidedWave, togglePause, triggerP2Down, triggerPlayerDeath });
yield;

function _genBuildingVariety(){
return {
roofStyle:Math.floor(Math.random()*3),
winPattern:Math.floor(Math.random()*3),
shade:(Math.random()*2-1),
preDamage:Math.random()<0.4 ? 0.15+Math.random()*0.45 : 0
};
}
function _drawWzPropVec(p){
const c=$core.ctx,px=p.x,py=p.y;
if(p.type==='rubble'){
c.save();c.globalAlpha=0.28;c.fillStyle='#000';c.beginPath();c.ellipse(px+3,py+4,p.r*1.1,p.r*0.5,0,0,6.283);c.fill();c.restore();
for(const k of p.chunks){
c.fillStyle=k.col;c.beginPath();
for(let v=0;v<4;v++){const a=k.a+v*1.57+k.j[v],rr=k.s*(0.75+k.j[v]*0.4);v?c.lineTo(px+k.dx+Math.cos(a)*rr,py+k.dy+Math.sin(a)*rr*0.8):c.moveTo(px+k.dx+Math.cos(a)*rr,py+k.dy+Math.sin(a)*rr*0.8);}
c.closePath();c.fill();c.strokeStyle='rgba(0,0,0,0.65)';c.lineWidth=1;c.stroke();
c.fillStyle='rgba(255,255,255,0.08)';c.fillRect(px+k.dx-k.s*0.5,py+k.dy-k.s*0.5,k.s*0.6,1.2);
}
c.lineWidth=1.4;
for(const r of p.rebar){
c.strokeStyle=r.rust;c.beginPath();c.moveTo(px+r.x,py+r.y);c.lineTo(px+r.x+r.dx*0.6,py+r.y-r.l*0.6);c.lineTo(px+r.x+r.dx,py+r.y-r.l);c.stroke();
}
} else if(p.type==='slab'){
c.save();c.globalAlpha=0.28;c.fillStyle='#000';c.beginPath();c.ellipse(px+4,py+5,p.w*0.6,5,0,0,6.283);c.fill();c.restore();
c.save();c.translate(px,py);c.rotate(p.tilt);
c.fillStyle='#6a665b';c.fillRect(-p.w/2,-p.h,p.w,p.h);
c.fillStyle='#4a473f';c.fillRect(-p.w/2,-p.h,p.w,3);
c.strokeStyle='#0a0a0a';c.lineWidth=1.5;c.strokeRect(-p.w/2,-p.h,p.w,p.h);
c.strokeStyle='#6a3a1e';c.lineWidth=1.3;
for(let i=0;i<3;i++){const rx=-p.w/2+4+i*(p.w-8)/2;c.beginPath();c.moveTo(rx,-p.h);c.lineTo(rx+(i-1)*2,-p.h-9-i*2);c.stroke();}
c.strokeStyle='rgba(0,0,0,0.6)';c.beginPath();c.moveTo(-p.w*0.1,-p.h);c.lineTo(0,-p.h*0.5);c.lineTo(-p.w*0.05,0);c.stroke();
c.restore();
} else if(p.type==='barrel'){
c.save();c.globalAlpha=0.3;c.fillStyle='#000';c.beginPath();c.ellipse(px+2,py+2,8,3,0,0,6.283);c.fill();c.restore();
c.fillStyle='#4a2b1c';c.fillRect(px-6,py-14,12,14);
c.fillStyle='#2b1a10';c.fillRect(px-6,py-9,12,1.5);c.fillRect(px-6,py-4,12,1.5);
c.fillStyle='#6a4028';c.fillRect(px-6,py-14,3,14);
c.strokeStyle='#0a0a0a';c.lineWidth=1.3;c.strokeRect(px-6,py-14,12,14);
c.fillStyle=p.burning?'#a63a08':'#1a1410';c.beginPath();c.ellipse(px,py-14,6,2.6,0,0,6.283);c.fill();c.stroke();
} else if(p.type==='burntcar'){
c.save();c.globalAlpha=0.3;c.fillStyle='#000';c.beginPath();c.ellipse(px+4,py+4,p.w*0.55,p.w*0.2,0,0,6.283);c.fill();c.restore();
c.fillStyle='#2a2622';c.fillRect(px-p.w/2,py-p.h,p.w,p.h);
c.fillStyle='#14110e';c.fillRect(px-p.w/2+4,py-p.h+2,p.w-8,p.h*0.34);
c.fillStyle='#5a3a22';c.fillRect(px-p.w/2+3,py-p.h*0.45,8,3);c.fillRect(px+p.w/2-14,py-p.h*0.3,9,2.5);
c.fillStyle='#0c0b0a';c.beginPath();c.arc(px-p.w/2+6,py,3.5,0,6.283);c.fill();c.beginPath();c.arc(px+p.w/2-6,py,3.5,0,6.283);c.fill();
c.fillStyle='rgba(255,255,255,0.06)';c.fillRect(px-p.w/2,py-p.h,p.w,1.5);
c.strokeStyle='#0a0a0a';c.lineWidth=1.5;c.strokeRect(px-p.w/2,py-p.h,p.w,p.h);
if(p.burning){c.fillStyle='rgba(255,110,20,0.35)';c.fillRect(px-p.w/2+5,py-p.h+3,p.w-10,p.h*0.3);}
}
}
/* ---- pixel props: cached sprites ---- */
function _wzPropSprite(p,PX){
const GRY=['#5c584e','#47443c','#6d685c','#38352f','#7a7366'];
let wA,hA,cx,cy,draw;
if(p.type==='rubble'){wA=Math.ceil((p.r*2+24)/PX);hA=Math.ceil((p.r+30)/PX);cx=wA>>1;cy=hA-5;
draw=(R,g)=>{for(let i=0;i<wA;i+=2)for(let j=0;j<3;j++)if(((i>>1)+j)&1)R(i,cy+2+j,2,1,'rgba(0,0,0,0.3)');
for(const k of p.chunks){const w=Math.max(2,Math.round(k.s*0.9/PX)),h=Math.max(2,Math.round(k.s*0.7/PX)),x=cx+Math.round(k.dx/PX),y=cy+Math.round(k.dy/PX);
R(x-1,y-1,w+2,h+2,'#0a0806');R(x,y,w,h,k.col);R(x,y,w,1,'rgba(255,255,255,0.25)');R(x,y+h-1,w,1,'rgba(0,0,0,0.35)');}
for(const r of p.rebar){const l=Math.round(r.l/PX),x0=cx+Math.round(r.x/PX),y0=cy+Math.round(r.y/PX),dx=Math.round(r.dx/PX);for(let k=0;k<=l;k++)R(x0+Math.round(dx*k/l*(k>l*0.6?1:0.5)),y0-k,1,1,r.rust);}};}
else if(p.type==='slab'){wA=Math.ceil((p.w+26)/PX);hA=Math.ceil((p.h+30)/PX);cx=wA>>1;cy=hA-5;
draw=(R,g)=>{const sw=Math.round(p.w/PX),sh=Math.max(3,Math.round(p.h/PX)),sl=p.tilt*0.9;
for(let i=0;i<sw+2;i+=2)for(let j=0;j<2;j++)if(((i>>1)+j)&1)R(cx-(sw>>1)+i+2,cy+1+j,2,1,'rgba(0,0,0,0.3)');
for(let y=0;y<sh;y++){const off=Math.round(sl*(sh-y));R(cx-(sw>>1)+off-1,cy-y-1,sw+2,1,'#0a0806');R(cx-(sw>>1)+off,cy-y,sw,1,y===sh-1?'#8a8578':y===0?'#38352f':'#6a665b');}
R(cx-(sw>>1)+Math.round(sl*sh)-1,cy-sh-1,sw+2,1,'#0a0806');
for(let i=0;i<3;i++){const rx=cx-(sw>>1)+Math.round(sl*sh)+2+i*Math.floor((sw-4)/2);for(let k=0;k<3+i;k++)R(rx+((i-1)*k>>1),cy-sh-1-k,1,1,i&1?'#6a3a1e':'#8a4a26');}
R(cx+1,cy-sh+2,1,2,'#0a0806');};}
else if(p.type==='barrel'){wA=Math.ceil(30/PX);hA=Math.ceil(34/PX);cx=wA>>1;cy=hA-3;
draw=(R,g)=>{R(cx-2,cy,5,1,'rgba(0,0,0,0.35)');R(cx-3,cy-5,6,6,'#0a0806');R(cx-2,cy-4,4,5,'#4a2b1c');R(cx-2,cy-4,1,5,'#6a4028');R(cx-2,cy-3,4,1,'#2b1a10');R(cx-2,cy-1,4,1,'#2b1a10');R(cx-2,cy-5,4,1,p.burning?'#c8501a':'#1a1410');};}
else{wA=Math.ceil((p.w+22)/PX);hA=Math.ceil((p.h+26)/PX);cx=wA>>1;cy=hA-4;
draw=(R,g)=>{const cw=Math.round(p.w/PX),chh=Math.max(3,Math.round(p.h/PX));
for(let i=0;i<cw+2;i+=2)for(let j=0;j<2;j++)if(((i>>1)+j)&1)R(cx-(cw>>1)+i+1,cy+1+j,2,1,'rgba(0,0,0,0.35)');
R(cx-(cw>>1)-1,cy-chh-1,cw+2,chh+2,'#0a0806');R(cx-(cw>>1),cy-chh,cw,chh,'#2a2622');R(cx-(cw>>1),cy-chh,cw,1,'#4a443a');
R(cx-(cw>>1)+2,cy-chh+1,cw-4,Math.max(1,chh>>1),'#0e0c0a');
R(cx-(cw>>1)+1,cy-1,3,1,'#6a3a1e');R(cx+(cw>>1)-4,cy-2,3,1,'#5a3a22');
R(cx-(cw>>1)+1,cy,3,2,'#0a0806');R(cx+(cw>>1)-3,cy,3,2,'#0a0806');
if(p.burning)R(cx-(cw>>1)+2,cy-chh+1,cw-4,1,'#c8401a');};}
const c=_wzCv(wA,hA),g=c.getContext('2d');const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
draw(R,g);
const oc=_wzCv(wA*PX,hA*PX),o=oc.getContext('2d');o.imageSmoothingEnabled=false;o.drawImage(c,0,0,wA*PX,hA*PX);
return{c:oc,ox:-cx*PX,oy:-cy*PX,PX:PX};
}
function _drawWzProp(p){
const PX=_wzPXs();
if(!p._wzSpr||p._wzSpr.PX!==PX){try{p._wzSpr=_wzPropSprite(p,PX);}catch(e){p._wzSpr=null;_drawWzPropVec(p);return;}}
$core.ctx.drawImage(p._wzSpr.c,Math.round(p.x+p._wzSpr.ox),Math.round(p.y+p._wzSpr.oy));
}
/* ---- pixel poles / dead trees (pixel-snapped each frame so the cables can sway) ---- */
function _wzDot(c,x,y,col,PX){c.fillStyle=col;c.fillRect(Math.round(x/PX)*PX,Math.round(y/PX)*PX,PX,PX);}
function _wzLine(c,x0,y0,x1,y1,col,PX){const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))/PX));c.fillStyle=col;for(let i=0;i<=n;i++){c.fillRect(Math.round((x0+(x1-x0)*i/n)/PX)*PX,Math.round((y0+(y1-y0)*i/n)/PX)*PX,PX,PX);}}
function _drawWzTree(t){
const c=$core.ctx,PX=_wzPXs(),tx=t.x,ty=t.y,th=t.trunkH,v=_wzTreeVariant(t),tk=$buildings.tick;
c.fillStyle='rgba(0,0,0,0.3)';for(let i=-3;i<=3;i++)if((i&1)===0)c.fillRect(Math.round((tx+i*PX)/PX)*PX,Math.round((ty+PX)/PX)*PX,PX,PX);
if(v<2){
const H=40+th*0.9,lean=(t.phase-3.14)*0.05,ex=tx+Math.sin(lean)*H,ey=ty-Math.cos(lean)*H;
_wzLine(c,tx-PX,ty,ex-PX,ey,'#0a0806',PX);_wzLine(c,tx,ty,ex,ey,'#3a2a1a',PX);_wzLine(c,tx+PX,ty,ex+PX,ey,'#1c140c',PX);
const al=13,ax=Math.cos(lean)*al,ay=Math.sin(lean)*al;
_wzLine(c,ex-ax,ey-ay+PX,ex+ax,ey+ay+PX,'#4a3822',PX);_wzLine(c,ex-ax,ey-ay,ex+ax,ey+ay,'#0a0806',PX);
_wzDot(c,ex-ax,ey-ay-PX,'#9aa8a0',PX);_wzDot(c,ex+ax,ey+ay-PX,'#9aa8a0',PX);
const sw=Math.sin(tk*0.03+t.phase)*3,lx=ex-ax,ly=ey-ay+2;
for(let i=0;i<=10;i++){const u=i/10,x=lx-u*52,y=ly+Math.sin(u*Math.PI)*12+u*sw*0.3;_wzDot(c,x,y,'#0b0b0b',PX);}
const rx=ex+ax,ry=ey+ay+2,dx2=rx+sw*1.4,dy2=ry+26+Math.abs(sw)*0.8;
for(let i=0;i<=8;i++){const u=i/8,x=rx+(dx2-rx)*u+Math.sin(u*3.14)*3,y=ry+(dy2-ry)*u;_wzDot(c,x,y,'#0b0b0b',PX);}
_wzDot(c,dx2,dy2,'#6a6a6a',PX);
t._wzSpark={x:dx2,y:dy2};
}else{
const H=26+th*0.8;
_wzLine(c,tx,ty,tx+1,ty-H,'#14100c',PX);_wzLine(c,tx+PX,ty,tx+PX+1,ty-H,'#050403',PX);_wzLine(c,tx-PX,ty,tx-PX+1,ty-H*0.8,'#2a2018',PX);
_wzLine(c,tx+1,ty-H*0.6,tx-12,ty-H*0.95,'#050403',PX);_wzLine(c,tx+1,ty-H*0.45,tx+13,ty-H*0.8,'#050403',PX);_wzLine(c,tx+1,ty-H,tx+6,ty-H-9,'#050403',PX);
const burn=((t.phase*977)|0)%3===0;t._wzBurn=burn?{x:tx+1,y:ty-H*0.85}:null;
for(let i=0;i<4;i++)_wzDot(c,tx+((i*5)%4)*PX-PX,ty-H*(0.2+i*0.18),'#c8501a',PX);
}
}

function _wzTreeVariant(t){ return ((t.phase*1000)|0)%3; }
function _drawWzTreeVec(t){
const c=$core.ctx,tx=t.x,ty=t.y,th=t.trunkH,v=_wzTreeVariant(t),tk=$buildings.tick;
c.save();c.globalAlpha=0.25;c.fillStyle='#000';c.beginPath();c.ellipse(tx+_isoDX()*0.6,ty+3,9,3,0,0,6.283);c.fill();c.restore();
if(v<2){
const H=40+th*0.9,lean=(t.phase-3.14)*0.05,ex=tx+Math.sin(lean)*H,ey=ty-Math.cos(lean)*H;
c.lineCap='round';
c.strokeStyle='#0a0806';c.lineWidth=5.5;c.beginPath();c.moveTo(tx,ty);c.lineTo(ex,ey);c.stroke();
c.strokeStyle='#3a2a1a';c.lineWidth=3.6;c.beginPath();c.moveTo(tx,ty);c.lineTo(ex,ey);c.stroke();
c.strokeStyle='#5a4430';c.lineWidth=1;c.beginPath();c.moveTo(tx-1,ty);c.lineTo(ex-1,ey);c.stroke();
const al=13,ax=Math.cos(lean)*al,ay=Math.sin(lean)*al,ay2=ey+H*0.12*0;
c.strokeStyle='#0a0806';c.lineWidth=4;c.beginPath();c.moveTo(ex-ax,ey-ay+3);c.lineTo(ex+ax,ey+ay+3);c.stroke();
c.strokeStyle='#4a3822';c.lineWidth=2.4;c.beginPath();c.moveTo(ex-ax,ey-ay+3);c.lineTo(ex+ax,ey+ay+3);c.stroke();
c.fillStyle='#9aa8a0';c.fillRect(ex-ax-1,ey-ay-1,2,4);c.fillRect(ex+ax-1,ey+ay-1,2,4);
const sw=Math.sin(tk*0.03+t.phase)*3;
c.strokeStyle='#0b0b0b';c.lineWidth=1.2;
c.beginPath();c.moveTo(ex-ax,ey-ay+2);c.quadraticCurveTo(ex-ax-26,ey-ay+14,ex-ax-52,ey-ay+3+sw*0.3);c.stroke();
c.globalAlpha=0.55;c.beginPath();c.moveTo(ex-ax,ey-ay+2);c.quadraticCurveTo(ex-ax-20,ey-ay+8,ex-ax-40,ey-ay+16);c.stroke();c.globalAlpha=1;
const dx2=ex+ax+sw*1.4,dy2=ey+ay+26+Math.abs(sw)*0.8;
c.beginPath();c.moveTo(ex+ax,ey+ay+2);c.quadraticCurveTo(ex+ax+4,ey+ay+16,dx2,dy2);c.stroke();
c.fillStyle='#2a2a2a';c.fillRect(dx2-1,dy2-1,2.5,3);
t._wzSpark={x:dx2,y:dy2};
c.lineCap='butt';
} else {
const H=26+th*0.8;
c.lineCap='round';
c.strokeStyle='#050403';c.lineWidth=6;c.beginPath();c.moveTo(tx,ty);c.lineTo(tx+1,ty-H);c.stroke();
c.strokeStyle='#1c1612';c.lineWidth=3.6;c.beginPath();c.moveTo(tx,ty);c.lineTo(tx+1,ty-H);c.stroke();
c.strokeStyle='#050403';c.lineWidth=2.2;
c.beginPath();c.moveTo(tx+1,ty-H*0.6);c.lineTo(tx-12,ty-H*0.95);c.moveTo(tx+1,ty-H*0.45);c.lineTo(tx+13,ty-H*0.8);c.moveTo(tx+1,ty-H);c.lineTo(tx+6,ty-H-9);c.stroke();
const burn=((t.phase*977)|0)%3===0;
t._wzBurn=burn?{x:tx+1,y:ty-H*0.85}:null;
c.fillStyle='rgba(255,120,30,0.7)';
for(let i=0;i<4;i++){c.fillRect(tx-1+((i*5)%4),ty-H*(0.2+i*0.18),1.5,2);}
c.lineCap='butt';
}
}
function _wzMakeProp(type,px,py){
const R=Math.random;
if(type==='rubble'){
const r=12+R()*16,n=7+((R()*6)|0),chunks=[],rebar=[];
const greys=['#5c584e','#47443c','#6d685c','#38352f','#7a7366'];
for(let i=0;i<n;i++)chunks.push({dx:(R()-0.5)*r*1.7,dy:(R()-0.5)*r*0.9,s:3+R()*r*0.4,a:R()*6.283,j:[(R()-0.5)*0.7,(R()-0.5)*0.7,(R()-0.5)*0.7,(R()-0.5)*0.7],col:greys[(R()*greys.length)|0]});
for(let i=0;i<2+((R()*3)|0);i++)rebar.push({x:(R()-0.5)*r,y:(R()-0.5)*r*0.4,dx:(R()-0.5)*16,l:12+R()*16,rust:R()<0.5?'#4a2a17':'#7a4524'});
return {type,x:px,y:py,r,chunks,rebar};
}
if(type==='slab')return {type,x:px,y:py,w:28+R()*18,h:10+R()*6,tilt:(R()-0.5)*0.7};
if(type==='barrel')return {type,x:px,y:py,burning:R()<0.7};
if(type==='burntcar')return {type,x:px,y:py,w:34+R()*10,h:15+R()*4,burning:R()<0.5};
return null;
}

function _makeProp(type,px,py){
if(type==='rubble'||type==='slab'||type==='barrel'||type==='burntcar') return _wzMakeProp(type,px,py);
if(type==='rock'){
const r=8+Math.random()*10;
const n=5+Math.floor(Math.random()*3);
const pts=[];
for(let i=0;i<n;i++){
const a=(i/n)*Math.PI*2;
const rr=r*(0.7+Math.random()*0.5);
pts.push({x:Math.cos(a)*rr,y:Math.sin(a)*rr*0.7});
}
const cols=['#6b6b60','#7a7060','#5a5850','#8a7a68'];
return {type,x:px,y:py,r,pts,col:cols[Math.floor(Math.random()*cols.length)]};
}
if(type==='debris'){
const n=3+Math.floor(Math.random()*3);
const chunks=[];
for(let i=0;i<n;i++){
chunks.push({dx:(Math.random()-0.5)*16,dy:(Math.random()-0.5)*9,w:3+Math.random()*5,h:3+Math.random()*5,col:Math.random()<0.5?'#4a4a44':'#3a3630'});
}
return {type,x:px,y:py,chunks};
}
if(type==='lamp'){
return {type,x:px,y:py,h:24+Math.random()*8};
}
if(type==='car'){
const cols=['#7a2020','#20507a','#606060','#707030','#304030','#5a5a68'];
return {type,x:px,y:py,w:32+Math.random()*10,h:15+Math.random()*4,col:cols[Math.floor(Math.random()*cols.length)]};
}
return {type,x:px,y:py};
}
function drawProp(p,env){
const px=p.x, py=p.y;
if(p.type==='rubble'||p.type==='slab'||p.type==='barrel'||p.type==='burntcar'){ _drawWzProp(p); return; }
if(p.type==='landmark-wreck'){
$weather.drawLandmarkWreck(p,env,$buildings.tick*0.016);
return;
}
if(p.type==='rock'){
$core.ctx.save();$core.ctx.globalAlpha=0.22;$core.ctx.fillStyle='#000';
$core.ctx.beginPath();$core.ctx.ellipse(px+_isoDX()*0.4,py+3,p.r*0.9,p.r*0.4,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.fillStyle=p.col;
$core.ctx.beginPath();
$core.ctx.moveTo(px+p.pts[0].x,py+p.pts[0].y);
for(let i=1;i<p.pts.length;i++) $core.ctx.lineTo(px+p.pts[i].x,py+p.pts[i].y);
$core.ctx.closePath();$core.ctx.fill();
$core.ctx.save();$core.ctx.globalAlpha=0.3;$core.ctx.fillStyle='#000';
$core.ctx.beginPath();
$core.ctx.moveTo(px+p.pts[0].x,py+p.pts[0].y);
$core.ctx.lineTo(px+p.pts[1].x,py+p.pts[1].y);
$core.ctx.lineTo(px,py+p.r*0.3);
$core.ctx.closePath();$core.ctx.fill();$core.ctx.restore();
} else if(p.type==='debris'){
$core.ctx.save();$core.ctx.globalAlpha=0.18;$core.ctx.fillStyle='#000';
$core.ctx.beginPath();$core.ctx.ellipse(px,py+2,12,4,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
for(const ch of p.chunks){
$core.ctx.fillStyle=ch.col;
$core.ctx.fillRect(px+ch.dx,py+ch.dy,ch.w,ch.h);
}
if($replay.currentEnv==='spaceship'){
$core.ctx.fillStyle='rgba(24,224,255,0.45)';
for(const ch of p.chunks){$core.ctx.fillRect(px+ch.dx,py+ch.dy,ch.w,1);}
$core.ctx.fillStyle='rgba(255,176,32,0.55)';
const _c0=p.chunks[0];if(_c0)$core.ctx.fillRect(px+_c0.dx,py+_c0.dy+_c0.h-2,Math.min(_c0.w,8),2);
}
} else if(p.type==='lamp'){
if($replay.currentEnv==='spaceship'){
const _pu=0.65+0.35*Math.sin($buildings.tick*0.06+px*0.05);
$core.ctx.save();$core.ctx.globalAlpha=0.25;$core.ctx.fillStyle='#000';$core.ctx.beginPath();$core.ctx.ellipse(px,py+2,6,2.2,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.fillStyle='#10182c';$core.ctx.fillRect(px-3,py-p.h,6,p.h);
$core.ctx.fillStyle='#1c2a48';$core.ctx.fillRect(px-3,py-p.h,2,p.h);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=1.5;$core.ctx.strokeRect(px-3,py-p.h,6,p.h);
$core.ctx.fillStyle='#ffb020';$core.ctx.fillRect(px-3,py-5,6,3);
if($buildings._dqsQuality>=0.4&&!$core.isUltraLow){$core.ctx.save();$core.ctx.translate(px,py-p.h-5);$core.ctx.globalCompositeOperation='lighter';$core.ctx.globalAlpha=_pu;$core.ctx.fillStyle=cachedRadialGradient('ship_beacon',0,0,0,0,0,38,[[0,'rgba(24,224,255,0.40)'],[1,'rgba(24,224,255,0)']]);$core.ctx.fillRect(-38,-38,76,76);$core.ctx.restore();}
$core.ctx.save();$core.ctx.shadowColor='#18e0ff';$core.ctx.shadowBlur=$core.isMobile?0:12*$core.SHADOW;
$core.ctx.fillStyle='#d8fbff';$core.ctx.beginPath();$core.ctx.moveTo(px,py-p.h-11);$core.ctx.lineTo(px+5,py-p.h-5);$core.ctx.lineTo(px,py-p.h+1);$core.ctx.lineTo(px-5,py-p.h-5);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.restore();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=1.2;$core.ctx.beginPath();$core.ctx.moveTo(px,py-p.h-11);$core.ctx.lineTo(px+5,py-p.h-5);$core.ctx.lineTo(px,py-p.h+1);$core.ctx.lineTo(px-5,py-p.h-5);$core.ctx.closePath();$core.ctx.stroke();
return;
}
$core.ctx.save();$core.ctx.globalAlpha=0.2;$core.ctx.fillStyle='#000';
$core.ctx.beginPath();$core.ctx.ellipse(px,py+2,5,2,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.fillStyle='#2a2a2a';
$core.ctx.fillRect(px-2,py-p.h,4,p.h);
$core.ctx.fillStyle='#1a1a1a';
$core.ctx.beginPath();$core.ctx.arc(px,py-p.h-4,6,0,Math.PI*2);$core.ctx.fill();
$core.ctx.save();$core.ctx.shadowColor='rgba(255,240,180,0.9)';$core.ctx.shadowBlur=$core.isMobile?0:(14)*$core.SHADOW;
$core.ctx.fillStyle='rgba(255,240,180,0.85)';$core.ctx.beginPath();$core.ctx.arc(px,py-p.h-4,3,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
} else if(p.type==='car'){
$core.ctx.save();$core.ctx.globalAlpha=0.25;$core.ctx.fillStyle='#000';
$core.ctx.beginPath();$core.ctx.ellipse(px+_isoDX()*0.5,py+4,p.w*0.55,p.w*0.22,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.fillStyle=p.col;
$core.ctx.fillRect(px-p.w/2,py-p.h,p.w,p.h);
$core.ctx.fillStyle=_shadeHex(p.col,-0.35);
$core.ctx.fillRect(px-p.w/2,py-p.h,p.w,p.h*0.32);
$core.ctx.fillStyle='#182028';
$core.ctx.fillRect(px-p.w/2+4,py-p.h+2,p.w-8,p.h*0.3);
$core.ctx.fillStyle='#111';
$core.ctx.beginPath();$core.ctx.arc(px-p.w/2+6,py,3.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.arc(px+p.w/2-6,py,3.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='rgba(180,200,255,0.22)';$core.ctx.fillRect(px-p.w/2,py-p.h,p.w,1.5);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=1.5;$core.ctx.strokeRect(px-p.w/2,py-p.h,p.w,p.h);
$core.ctx.fillStyle='#ff2a3d';$core.ctx.fillRect(px-p.w/2+2,py-4,4,2);$core.ctx.fillRect(px+p.w/2-6,py-4,4,2);
}
}

function _jungleRng(b){
  let s = (((b.x|0)*73856093) ^ ((b.y|0)*19349663) ^
           ((b.w|0)*83492791) ^ ((b.h|0)*2971215073)) >>> 0;
  if(s === 0) s = 0x9e3779b9;
  return function(){
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}

function _buildJungleHut(b, env){
  const w = b.w, h = b.h, _dx = _isoDX(), _dy = _isoDY();

  const pad = 34;
  const oc = document.createElement('canvas');
  oc.width  = Math.ceil(w + pad*2);
  oc.height = Math.ceil(h + pad*2);
  const c = oc.getContext('2d');
  c.translate(pad, pad);
  const x = 0, y = 0;

  const rng = _jungleRng(b);
  if(b._woodRoll === undefined) b._woodRoll = rng();

  const s = (b.shade || 0) * 0.16;
  const darkTimber = b._woodRoll < 0.5;
  const woodBase  = _shadeHex(darkTimber ? '#2e1d0e' : '#46301a', s);
  const woodLight = _shadeHex(darkTimber ? '#3b2713' : '#573b20', s);
  const woodDark  = _shadeHex(darkTimber ? '#1a1008' : '#2a1c0e', s);
  const frameCol  = _shadeHex('#24160a', s * 0.7);
  const thatchA   = _shadeHex('#4a4222', s * 0.8);
  const thatchB   = _shadeHex('#352f16', s * 0.8);
  const thatchHi  = _shadeHex('#5e5630', s * 0.8);
  const mossA = '#1c3a10', mossB = '#264c16', mossHi = '#3f6e22';
  const vineA = '#193810', vineB = '#2a5018';
  const woodInk = '#1a1008';

  b._wallCol = woodBase;
  b._roofCol = thatchA;
  b._darkCol = woodDark;
  b._winCols = 1; b._winRows = 1; b._winW = 8; b._winH = 6;

  const roofH = 10 + (b.roofStyle === 1 ? 5 : 0);

  if(!_isoFlat()){
    c.save(); c.fillStyle = 'rgba(0,0,0,0.35)';
    c.beginPath();
    c.moveTo(x+_dx+4, y+_dy+4);     c.lineTo(x+w+_dx+4, y+_dy+4);
    c.lineTo(x+w+_dx+4, y+h+_dy+4); c.lineTo(x+_dx+4, y+h+_dy+4);
    c.closePath(); c.fill(); c.restore();

    c.fillStyle = woodDark;
    c.beginPath(); c.moveTo(x+w,y); c.lineTo(x+w+_dx,y+_dy);
    c.lineTo(x+w+_dx,y+h+_dy); c.lineTo(x+w,y+h); c.closePath(); c.fill();
    c.save(); c.globalAlpha = 0.75;
    c.beginPath(); c.moveTo(x,y+h); c.lineTo(x+w,y+h);
    c.lineTo(x+w+_dx,y+h+_dy); c.lineTo(x+_dx,y+h+_dy); c.closePath(); c.fill();
    c.restore();
  }

  const nRoots = 3 + Math.floor(rng()*3);
  c.fillStyle = woodDark; c.strokeStyle = woodInk; c.lineWidth = 1.4;
  for(let i=0;i<nRoots;i++){
    const rx = x + (i+0.5)*(w/nRoots) + (rng()-0.5)*8;
    const rw = 7 + rng()*7, rh = 5 + rng()*6;
    c.beginPath();
    c.moveTo(rx-rw*0.5, y+h);
    c.quadraticCurveTo(rx-rw*0.9, y+h+rh*0.7, rx-rw*1.3, y+h+rh);
    c.lineTo(rx+rw*1.3, y+h+rh);
    c.quadraticCurveTo(rx+rw*0.9, y+h+rh*0.7, rx+rw*0.5, y+h);
    c.closePath(); c.fill(); c.stroke();
  }
  c.strokeStyle = woodDark; c.lineWidth = 3; c.lineCap = 'round';
  for(let i=0;i<2;i++){
    const side = i===0 ? x : x+w, dir = i===0 ? 1 : -1;
    const ry = y + h - 6 - rng()*10;
    c.beginPath();
    c.moveTo(side, y+h);
    c.quadraticCurveTo(side + dir*(6+rng()*10), ry,
                       side + dir*(3+rng()*8), ry - 12 - rng()*10);
    c.stroke();
  }

  c.fillStyle = woodBase;
  c.fillRect(x, y, w, h);

  if(b.winPattern === 1){
    const slatW = 5 + Math.floor(rng()*3);
    for(let sx = x; sx < x+w; sx += slatW+1){
      const sw = Math.min(slatW, x+w-sx);
      c.fillStyle = _shadeHex(woodBase, Math.round((rng()-0.5)*14));
      c.fillRect(sx, y, sw, h);
      c.fillStyle = 'rgba(10,6,2,0.7)';
      c.fillRect(sx+sw, y, 1, h);
      c.fillStyle = 'rgba(30,18,6,0.45)';
      for(let ny = y + 8 + rng()*10; ny < y+h-4; ny += 22 + rng()*14){
        c.fillRect(sx, ny, sw, 1.2);
      }
    }
  } else {
    const plankH = 7 + Math.round(rng()*3);
    for(let py = y; py < y+h; py += plankH){
      const ph = Math.min(plankH, y+h-py);
      c.fillStyle = _shadeHex(woodBase, Math.round((rng()-0.5)*10));
      c.fillRect(x, py, w, ph);
      c.fillStyle = 'rgba(20,12,4,0.55)';
      c.fillRect(x, py, w, 1);
      if(rng() < 0.35){
        c.strokeStyle = 'rgba(30,18,6,0.28)'; c.lineWidth = 0.8;
        const gy = py + ph*0.55, gx = x + rng()*w*0.4, gl = 8 + rng()*w*0.45;
        c.beginPath(); c.moveTo(gx, gy); c.lineTo(Math.min(x+w, gx+gl), gy); c.stroke();
      }
      if(rng() < 0.22){
        c.fillStyle = 'rgba(30,16,4,0.5)';
        c.beginPath();
        c.ellipse(x + 3 + rng()*(w-6), py + ph*0.5, 2.2, 1.6, rng()*3, 0, 6.283);
        c.fill();
      }
    }
    c.fillStyle = 'rgba(20,12,4,0.4)';
    const nJoins = 1 + Math.floor(w/70);
    for(let i=0;i<nJoins;i++){
      const jx = x + (i+1)*(w/(nJoins+1)) + (rng()-0.5)*10;
      c.fillRect(jx, y+roofH, 1, h-roofH);
    }
  }

  c.save(); c.globalAlpha = 0.22;
  c.fillStyle = _shadeHex(woodLight, 8);
  c.fillRect(x, y+roofH, w, Math.min(12, h*0.22));
  c.restore();

  const postW = Math.max(4, Math.min(7, w*0.07));
  c.fillStyle = frameCol; c.strokeStyle = woodInk; c.lineWidth = 1.2;
  for(const px of [x, x+w-postW]){
    c.fillStyle = frameCol;  c.fillRect(px, y, postW, h);
    c.strokeRect(px, y, postW, h);
    c.fillStyle = _shadeHex(frameCol, 9);
    c.fillRect(px, y, postW*0.35, h);
  }
  const railY = y + roofH + (h-roofH)*0.42;
  c.fillStyle = frameCol;
  c.fillRect(x, railY, w, 3);
  c.strokeRect(x, railY, w, 3);
  if(b._woodRoll > 0.35){
    c.save(); c.strokeStyle = frameCol; c.lineWidth = 3;
    c.beginPath();
    if(b._woodRoll > 0.68){ c.moveTo(x+postW, railY);     c.lineTo(x+w*0.5, y+h); }
    else                  { c.moveTo(x+w-postW, railY);   c.lineTo(x+w*0.5, y+h); }
    c.stroke(); c.restore();
  }

  if(b.preDamage > 0){
    const rw = Math.max(10, w*(0.16 + b.preDamage*0.22));
    const rx = x + 4 + rng()*(w - rw - 8);
    const ry = y + roofH + 6 + rng()*Math.max(1, h - roofH - 22);
    const rh = Math.min(7 + Math.floor(b.preDamage*12), y+h - ry);
    c.fillStyle = '#120c04';
    c.fillRect(rx, ry, rw, rh);
    c.strokeStyle = woodDark; c.lineWidth = 1.6;
    c.beginPath();
    for(let i=0;i<=4;i++){
      const yy = ry + (rh*i/4);
      c.moveTo(rx, yy);      c.lineTo(rx - 3 - rng()*3, yy+1);
      c.moveTo(rx+rw, yy);   c.lineTo(rx+rw + 3 + rng()*3, yy+1);
    }
    c.stroke();
  }

  const shutCol = '#1a1206';
  let cols, rows, winW, winH;
  if(b.winPattern === 1){ winW=6;  winH=11; cols=Math.max(1,Math.floor(w/40)); rows=Math.max(1,Math.floor(h/26)); }
  else if(b.winPattern === 2){ winW=12; winH=10; cols=Math.max(1,Math.floor(w/48)); rows=Math.max(1,Math.floor(h/48)); }
  else { winW=8; winH=7; cols=Math.max(1,Math.floor(w/32)); rows=Math.max(1,Math.floor(h/32)); }
  for(let r=0;r<rows;r++) for(let ci=0;ci<cols;ci++){
    const wx = x + 11 + ci*((w-22)/Math.max(1,cols));
    const wy = y + roofH + 6 + r*((h-roofH-24)/Math.max(1,rows));
    if(!(wx < x+w-14 && wy < y+h-14)) continue;
    c.fillStyle = shutCol;
    c.fillRect(wx, wy, winW, winH);
    c.strokeStyle = woodInk; c.lineWidth = 1;
    c.strokeRect(wx, wy, winW, winH);
    c.strokeStyle = 'rgba(120,84,44,0.55)'; c.lineWidth = 0.7;
    for(let sy = wy+2; sy < wy+winH-1; sy += 3){
      c.beginPath(); c.moveTo(wx+1, sy); c.lineTo(wx+winW-1, sy); c.stroke();
    }
    if((r*3+ci)%5 === 0){
      c.save(); c.globalAlpha = 0.35; c.fillStyle = '#ffb04a';
      c.fillRect(wx, wy, winW, winH); c.restore();
    }
  }
  b._winCols=cols; b._winRows=rows; b._winW=winW; b._winH=winH;

  const nMoss = 10 + Math.floor(rng()*8);
  for(let i=0;i<nMoss;i++){
    const up = Math.pow(rng(), 2.1);
    const mx = x + rng()*w;
    const my = y + h - up*(h*0.55);
    const mr = 3 + rng()*7;
    c.save();
    c.globalAlpha = 0.30 + rng()*0.35;
    c.fillStyle = rng() < 0.5 ? mossA : mossB;
    c.beginPath();
    c.ellipse(mx, my, mr, mr*(0.5+rng()*0.4), rng()*3, 0, 6.283);
    c.fill();
    if(rng() < 0.4){
      c.globalAlpha = 0.35; c.fillStyle = mossHi;
      c.beginPath(); c.ellipse(mx-1, my-1, mr*0.45, mr*0.25, 0, 0, 6.283); c.fill();
    }
    c.restore();
  }

  const nVines = 2 + Math.floor(rng()*2);
  c.lineCap = 'round';
  for(let v=0; v<nVines; v++){
    const vx    = x + 6 + rng()*(w-12);
    const climb = h*(0.45 + rng()*0.5);
    const phase = rng()*6.283;
    const wob   = 3 + rng()*5;
    const segs  = 7;
    const col   = rng() < 0.5 ? vineA : vineB;
    const path = () => {
      c.beginPath();
      for(let i=0;i<=segs;i++){
        const py = y + h - (climb*i/segs);
        const px = vx + Math.sin(phase + i*0.85)*wob;
        if(i===0) c.moveTo(px,py); else c.lineTo(px,py);
      }
    };
    c.strokeStyle = 'rgba(12,8,2,0.55)'; c.lineWidth = 3.4; path(); c.stroke();
    c.strokeStyle = col;                 c.lineWidth = 2;   path(); c.stroke();
    const nLeaf = 5 + Math.floor(rng()*5);
    for(let i=0;i<nLeaf;i++){
      const t = rng();
      const py = y + h - climb*t;
      const px = vx + Math.sin(phase + t*segs*0.85)*wob;
      const side = rng() < 0.5 ? -1 : 1;
      const lr = 2.2 + rng()*2.2;
      c.save();
      c.translate(px, py);
      c.rotate(side*0.6 + (rng()-0.5)*0.5);
      c.fillStyle = side < 0 ? vineA : vineB;
      c.beginPath(); c.ellipse(side*lr*0.6, 0, lr, lr*0.5, 0, 0, 6.283); c.fill();
      c.restore();
    }
  }

  (function _jungleWarDamage(){
    const wr = _jungleRng({x:b.x+7, y:b.y+13, w:b.w, h:b.h});
    const sootG = c.createLinearGradient(x, y, x, y+h);
    sootG.addColorStop(0, 'rgba(6,3,1,0.55)');
    sootG.addColorStop(0.45, 'rgba(6,3,1,0.12)');
    sootG.addColorStop(1, 'rgba(6,3,1,0.45)');
    c.fillStyle = sootG; c.fillRect(x, y, w, h);
    const nScorch = 1 + Math.floor(wr()*3);
    for(let q=0;q<nScorch;q++){
      const qx = x + wr()*w, qr = 9 + wr()*16;
      const sg = c.createRadialGradient(qx, y+h, 1, qx, y+h, qr*1.6);
      sg.addColorStop(0, 'rgba(0,0,0,0.75)'); sg.addColorStop(0.6, 'rgba(10,5,2,0.4)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = sg; c.fillRect(qx-qr*1.6, y+h-qr*1.6, qr*3.2, qr*1.6);
      if(wr() < 0.5){ c.fillStyle = 'rgba(230,80,12,0.35)'; c.beginPath(); c.arc(qx+(wr()-0.5)*6, y+h-2, 1.6+wr()*1.4, 0, 6.283); c.fill(); }
    }
    const nHoles = 6 + Math.floor(wr()*10);
    for(let i=0;i<nHoles;i++){
      const hx = x + 6 + wr()*(w-12), hy = y + 8 + wr()*(h-16);
      const hr = 1.4 + wr()*2.2;
      c.fillStyle = '#0a0602';
      c.beginPath(); c.arc(hx,hy,hr,0,6.283); c.fill();
      c.fillStyle = 'rgba(140,105,60,0.35)';
      c.beginPath(); c.arc(hx,hy,hr+1.4,0,6.283); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(hx,hy); c.lineTo(hx+(wr()-0.5)*12, hy+wr()*12); c.stroke();
    }
    const bx = x + 10 + wr()*(w-20), by = y + 10 + wr()*(h*0.35);
    const bg = c.createLinearGradient(bx, by, bx, by + h*0.45);
    bg.addColorStop(0, 'rgba(80,8,6,0.75)');
    bg.addColorStop(1, 'rgba(80,8,6,0)');
    c.fillStyle = bg;
    c.beginPath();
    c.moveTo(bx-3.2, by); c.lineTo(bx+3.2, by);
    c.lineTo(bx+2.4, by+h*0.46); c.lineTo(bx-2.4, by+h*0.46);
    c.closePath(); c.fill();
    const bags = Math.max(2, Math.floor(w/22));
    for(let sI=0;sI<bags;sI++){
      const sx = x + 4 + sI*((w-8)/bags);
      for(let row=0;row<2;row++){
        c.fillStyle = row ? '#4a4628' : '#5a5638';
        c.beginPath(); c.ellipse(sx+7+(row%2?6:0), y+h+2-row*6, 7, 4, 0, 0, 6.283); c.fill();
        c.strokeStyle = '#1e1c10'; c.lineWidth = 0.7; c.stroke();
      }
    }
    if(wr() < 0.75){
      const nx = x + wr()*(w*0.4), nw = w*(0.3 + wr()*0.5);
      c.save(); c.beginPath(); c.rect(nx, y-2, nw, 14); c.clip();
      for(let k=0;k<50;k++){
        c.fillStyle = ['#1e2e12','#16260c','#2a3a1c'][Math.floor(wr()*3)];
        c.fillRect(nx+wr()*nw, y-2+wr()*14, 2+wr()*3, 2+wr()*2);
      }
      c.restore();
      c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 0.8; c.strokeRect(nx, y-2, nw, 14);
    }
  })();

  c.strokeStyle = '#0a0a0a'; c.lineWidth = 2.5;
  c.strokeRect(x, y, w, h);

  c.fillStyle = _shadeHex(thatchB, -8);
  c.fillRect(x-2, y-2, w+4, roofH+3);

  const frondRow = 3.2;
  for(let ry = y-2; ry < y+roofH; ry += frondRow){
    const t = (ry - (y-2)) / (roofH+2);
    c.fillStyle = t < 0.5 ? thatchHi : thatchA;
    c.save(); c.globalAlpha = 0.85;
    c.fillRect(x-2, ry, w+4, frondRow*0.9);
    c.restore();
    c.strokeStyle = 'rgba(60,48,16,0.5)'; c.lineWidth = 0.7;
    const step = 6 + ((b.x|0) % 3);
    c.beginPath();
    for(let fx = x-2 + ((ry*7) % step); fx < x+w+2; fx += step){
      c.moveTo(fx, ry+frondRow*0.9); c.lineTo(fx+2.5, ry);
    }
    c.stroke();
  }
  c.fillStyle = thatchB;
  const nFr = Math.max(3, Math.floor(w/9));
  for(let i=0;i<nFr;i++){
    const fx = x - 2 + (i+0.5)*(w+4)/nFr + (rng()-0.5)*4;
    const fw = 4 + rng()*5, fh = 3 + rng()*6;
    c.beginPath();
    c.moveTo(fx-fw*0.5, y+roofH-1);
    c.lineTo(fx,         y+roofH+fh);
    c.lineTo(fx+fw*0.5,  y+roofH-1);
    c.closePath(); c.fill();
  }
  if(b.roofStyle === 1){
    c.fillStyle = thatchHi;
    c.beginPath();
    c.moveTo(x-3, y+2); c.lineTo(x+w/2, y-6); c.lineTo(x+w+3, y+2);
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(60,48,16,0.6)'; c.lineWidth = 1; c.stroke();
  } else if(b.roofStyle === 2){
    c.fillStyle = thatchHi;
    for(let i=0;i<2;i++){
      c.beginPath();
      c.ellipse(x + w*(0.3 + i*0.4), y-1, 7, 4, 0, 0, 6.283);
      c.fill();
      c.strokeStyle = 'rgba(60,48,16,0.55)'; c.lineWidth = 1; c.stroke();
    }
  }
  for(let i=0;i<4;i++){
    c.save(); c.globalAlpha = 0.25 + rng()*0.25;
    c.fillStyle = rng() < 0.5 ? mossA : mossB;
    c.beginPath();
    c.ellipse(x + rng()*w, y + rng()*roofH, 3+rng()*5, 2+rng()*3, rng()*3, 0, 6.283);
    c.fill(); c.restore();
  }
  c.strokeStyle = '#0a0a0a'; c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(x, y+roofH-1); c.lineTo(x+w, y+roofH-1); c.stroke();

  const nOver = 3 + Math.floor(rng()*4);
  for(let i=0;i<nOver;i++){
    const edge = rng();
    let ox, oy, oa;
    if(edge < 0.45){        ox = x + rng()*w;              oy = y - 2;                       oa = -Math.PI/2 + (rng()-0.5)*1.1; }
    else if(edge < 0.72){   ox = x - 2;                    oy = y + 10 + rng()*(h*0.4);      oa =  Math.PI   + (rng()-0.5)*0.9; }
    else {                  ox = x + w + 2;                oy = y + 10 + rng()*(h*0.4);      oa = (rng()-0.5)*0.9; }
    const olen = 12 + rng()*14;
    c.save();
    c.translate(ox, oy); c.rotate(oa);
    c.strokeStyle = '#24481a'; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(olen*0.5, -3, olen, 1); c.stroke();
    c.fillStyle = rng() < 0.5 ? '#2c5a18' : '#3f7a24';
    for(let k=1;k<=5;k++){
      const t = k/6, lx = olen*t, ly = -3*Math.sin(t*Math.PI);
      for(const sd of [-1, 1]){
        c.beginPath();
        c.ellipse(lx, ly + sd*2.4, 3.2, 1.3, sd*0.7, 0, 6.283);
        c.fill();
      }
    }
    c.restore();
  }

  b._shellCache    = oc;
  b._shellCachePad = pad;
}


function _buildBuildingShellCache(b,env){
if($replay.currentEnv==='warzone'){
try{ _wzPixelBuilding(b,env,{PX:_wzPXs(),dx:_isoDX(),dy:_isoDY(),flat:_isoFlat()}); return; }catch(e){ if(!_wzPixelBuilding._w){ _wzPixelBuilding._w=1; console.warn('[warzone] pixel building',e); } }
_buildBuildingShellCacheBase(b,env); try{ _wzDamageShell(b,env); }catch(e){}
return; }
return _buildBuildingShellCacheBase(b,env);
}
function _wzRng(b,salt){
let s=((((b.x|0)*73856093)^((b.y|0)*19349663)^((b.w|0)*83492791)^(salt|0))>>>0)||0x9e3779b9;
return function(){s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};
}
/* ===== WAR ZONE PIXEL-ART BUILDINGS / PROPS / POLES ===== */
function _wzPXs(){return window.__artPX($replay.W,$replay.H);}
function _wzHx(i,j,k){let h=(Math.imul(i,374761393)+Math.imul(j,668265263)+Math.imul(k,2147483647))>>>0;h=(Math.imul(h^(h>>>13),1274126177))>>>0;return((h^(h>>>16))>>>0)/4294967296;}
function _wzC(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function _wzHex(r,g,b){const f=v=>{v=Math.max(0,Math.min(255,Math.round(v)));return(v<16?'0':'')+v.toString(16);};return'#'+f(r)+f(g)+f(b);}
function _wzShd(h,f){const c=_wzC(h);return _wzHex(c[0]*f,c[1]*f,c[2]*f);}
function _wzCv(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c;}
function _wzPixelBuilding(b,env,o){
const PX=o.PX,flat=o.flat,dxa=flat?0:Math.max(2,Math.round(o.dx/PX)),dya=flat?0:Math.max(2,Math.round(o.dy/PX));
const O=4,w=b.w,h=b.h,bw=Math.max(8,Math.floor(w/PX)),bh=Math.max(8,Math.floor(h/PX));
const gw=bw+O*2+dxa+3,gh=bh+O*2+dya+5,s=_wzCv(gw,gh),g=s.getContext('2d');
const R=(x,y,ww,hh,c)=>{g.fillStyle=c;g.fillRect(x,y,ww,hh);};
const hx=_wzHx,seed=(((b.x|0)*7+(b.y|0)*13)>>>0)%9973;
const wall=b._wallCol||env.bWall,roof=b._roofCol||env.bRoof;
const TONE=[_wzShd(wall,0.55),_wzShd(wall,0.68),_wzShd(wall,0.8),_wzShd(wall,0.92),wall];
const SEAM=_wzShd(wall,0.45),OUT='#0a0806';
const fires=[];
// collapsed top corner (stair-stepped mask)
const left=hx(seed,1,2)<0.5,cw=Math.max(4,Math.floor(bw*(0.28+hx(seed,2,2)*0.16))),ch=Math.max(4,Math.min(Math.floor(bh*(0.26+hx(seed,3,2)*0.14)),Math.floor(bh*0.55)));
const rowW=[];for(let r=0;r<ch;r++)rowW.push(Math.max(1,Math.floor(cw*(1-r/ch)+(hx(r,seed,4)-0.5)*2.2)));
const inCut=(x,y)=>{if(y>=ch)return false;const rw=rowW[y];return left?x<rw:x>=bw-rw;};
// 1. cast shadow (dithered)
g.fillStyle='rgba(0,0,0,0.4)';g.fillRect(O+dxa+1,O+dya+1,bw,bh);
for(let i=0;i<bh+2;i++)for(let k=0;k<3;k++)if(((i+k)&1)===0)g.fillRect(O+dxa+1+bw+k,O+dya+1+i,1,1);
for(let i=0;i<bw+2;i++)for(let k=0;k<3;k++)if(((i+k)&1)===0)g.fillRect(O+dxa+1+i,O+dya+1+bh+k,1,1);
// 2. side faces
const eastC=_wzShd(wall,0.4),southC=_wzShd(wall,0.32);
for(let i=0;i<dxa;i++)R(O+bw+i,O+Math.round((i+1)*dya/dxa),1,bh,i===0?_wzShd(eastC,1.2):eastC);
for(let i=0;i<dya;i++){const xo=Math.round((i+1)*dxa/dya);R(O+xo,O+bh+i,bw,1,i===dya-1?_wzShd(southC,0.8):southC);}
// 3. facade: concrete panels, soot, exposed brick
for(let y=0;y<bh;y++)for(let x=0;x<bw;x++){
if(inCut(x,y))continue;
const row=Math.floor(y/6),off=(row&1)?4:0,seamY=(y%6===5),seamX=((x+off)%8===0),pn=hx(Math.floor((x+off)/8),row,seed+2);
let t=3+(pn<0.2?-1:pn>0.85?1:0);const r=hx(x,y,seed+1);if(r<0.08)t--;else if(r>0.95)t++;
if(y<bh*0.35&&hx(x>>1,y,seed+5)>0.55)t--;
let col=TONE[Math.max(0,Math.min(4,t))];
if(seamY||seamX)col=SEAM;
const ex=hx(x>>3,y>>3,seed+6)>0.9&&y>6&&y<bh-4;
if(ex){col=(y&1)?'#4a2a20':'#6a3a2a';if((y&1)===0&&((x+(y>>1))%4===0))col='#2a1a14';}
if(x<2)col=_wzShd(col,1.15);else if(x>=bw-2)col=_wzShd(col,0.8);if(y>=bh-1)col=_wzShd(col,0.7);
R(O+x,O+y,1,1,col);
}
// 4. charred roof band + broken parapet
for(let x=0;x<bw;x++){if(inCut(x,0))continue;R(O+x,O,1,3,x%5===0?'#14110e':'#23201b');R(O+x,O,1,1,'#3a352d');if(x%3!==2&&hx(x,seed,7)>0.3)R(O+x,O-1,1,1,'#23201b');}
// 5. windows
const wp=b.winPattern||0;let winW=10,winH=8,cols,rows;
if(wp===1){winW=7;winH=15;cols=Math.max(1,Math.floor(w/40));rows=Math.max(1,Math.floor(h/26));}
else if(wp===2){winW=15;winH=13;cols=Math.max(1,Math.floor(w/48));rows=Math.max(1,Math.floor(h/48));}
else{cols=Math.max(1,Math.floor(w/32));rows=Math.max(1,Math.floor(h/32));}
const ww=Math.max(2,Math.round(winW/PX)),hh=Math.max(2,Math.round(winH/PX));
for(let rr=0;rr<rows;rr++)for(let cc=0;cc<cols;cc++){
const wx=11+cc*((w-22)/Math.max(1,cols)),wy=16+rr*((h-36)/Math.max(1,rows));
if(!(wx<w-16&&wy<h-16))continue;
const ax=Math.round(wx/PX),ay=Math.round(wy/PX);if(inCut(ax+(ww>>1),ay))continue;
const roll=hx(rr,cc,seed+8);
// soot streak above blown windows
if(roll<0.6)for(let k=1;k<=4;k++)for(let q=-1;q<=ww;q++)if(((q+k)&1)===0||k<3)R(O+ax+q,O+ay-k,1,1,k<3?'#0e0c0a':'#1a1714');
R(O+ax-1,O+ay-1,ww+2,hh+2,_wzShd(wall,0.4));
if(roll<0.6){
R(O+ax,O+ay,ww,hh,'#050403');
if(roll<0.2&&fires.length<2){R(O+ax+1,O+ay+1,Math.max(1,ww-2),Math.max(1,hh-1),'#c8401a');R(O+ax+1,O+ay+hh-1,Math.max(1,ww-2),1,'#ffb030');fires.push({x:(ax+ww/2)*PX,y:(ay+hh*0.7)*PX,s:0.55+hx(rr,cc,seed+9)*0.35,k:'win'});}
for(let q=0;q<ww;q+=2)R(O+ax+q,O+ay+hh-1,1,1,'#9fc4cc');
R(O+ax-1,O+ay-1,1,1,'#050403');R(O+ax+ww,O+ay-1,1,1,'#050403');
}else{
R(O+ax,O+ay,ww,hh,'#0a0807');R(O+ax,O+ay,ww,1,'#000');R(O+ax-1,O+ay+hh,ww+2,1,'#6a6458');
if(roll>0.8){R(O+ax,O+ay+Math.floor(hh/2),ww,1,'#4a3622');R(O+ax,O+ay,1,hh,'#4a3622');}
}
}
// 6. door frame
let dx0=w/2-8,dy0=h-22;if(b.door==='n')dy0=0;else if(b.door==='e'){dx0=w-16;dy0=h/2-11;}else if(b.door==='w'){dx0=0;dy0=h/2-11;}
const fx=O+Math.floor(dx0/PX)-1,fy=O+Math.floor(dy0/PX)-1,fw=Math.ceil(16/PX)+2,fh=Math.ceil(22/PX)+2;
R(fx,fy,fw,fh,'#4a443a');R(fx+1,fy+1,fw-2,fh-2,'#0a0806');R(fx,fy,fw,1,'#7a7366');
// 7. cracks + bullet pocks
for(let i=0;i<3;i++){let cx=O+3+Math.floor(hx(i,seed,10)*(bw-6)),cy=O+3;if(inCut(cx-O,3))continue;
for(let k=0;k<Math.floor(bh*0.6);k++){R(cx,cy,1,1,'#050403');cy++;if(hx(k,i,seed+11)<0.4)cx+=hx(i,k,seed+12)<0.5?1:-1;}}
for(let i=0;i<12;i++){const px=Math.floor(hx(i,seed,13)*bw),py=2+Math.floor(hx(i,seed,14)*(bh-3));if(inCut(px,py))continue;R(O+px,O+py,1,1,'#0a0806');if(i&1)R(O+px+1,O+py-1,1,1,_wzShd(wall,1.2));}
// 8. collapsed corner interior
for(let y=0;y<ch;y++){const rw2=rowW[y];for(let q=0;q<rw2;q++){
const x=left?q:bw-1-q;
const edge=(q===rw2-1)||(y===ch-1)||(y<ch-1&&q>=rowW[y+1]);
let col;
if(edge)col='#0a0806';
else if(y%4===3&&q<rw2*0.85)col='#4b443a';
else if(q===rw2-2)col='#2e2a24';
else col=(((x+y)&1)===0&&y>ch*0.4)?'#120e0b':'#1b1612';
R(O+x,O+y,1,1,col);
if(edge&&hx(x,y,seed+15)>0.5){const ox=left?x+1:x-1;if(!inCut(ox,y))R(O+ox,O+y,1,1,'#9a9282');}
}}
// rebar from the broken edge
for(let y=1;y<ch;y+=2){if(hx(y,seed,16)<0.35)continue;const rw2=rowW[y],bx=left?rw2:bw-rw2,len=3+Math.floor(hx(y,seed,17)*5),dirx=left?1:-1;
const col=hx(y,seed,18)<0.5?'#6a3a1e':'#8a4a26';for(let k=0;k<len;k++)R(O+bx+dirx*Math.floor(k*0.6),O+y-k,1,1,col);}
fires.push({x:(left?cw*0.45:bw-cw*0.45)*PX,y:ch*0.55*PX,s:1.15,k:'roof',plume:true});
// 9. rubble spilling round the base
const GRY=['#5c584e','#47443c','#6d685c','#38352f'];
for(let i=0;i<16;i++){
const side=hx(i,seed,19);let x,y;
if(side<0.6){x=Math.floor(hx(i,seed,20)*bw);y=bh+dya-1+Math.floor(hx(i,seed,21)*4);}
else if(side<0.8){x=-2-Math.floor(hx(i,seed,20)*3);y=Math.floor(bh*0.4+hx(i,seed,21)*bh*0.6);}
else{x=bw+dxa+Math.floor(hx(i,seed,20)*3);y=Math.floor(bh*0.4+hx(i,seed,21)*bh*0.6);}
const cw2=2+Math.floor(hx(i,seed,22)*3),chh=2+Math.floor(hx(i,seed,23)*2);
R(O+x-1,O+y-1,cw2+2,chh+2,OUT);R(O+x,O+y,cw2,chh,GRY[Math.floor(hx(i,seed,24)*4)]);R(O+x,O+y,cw2,1,'#9a9282');
}
// 10. outline
R(O-1,O,1,bh,OUT);for(let x=0;x<bw;x++)if(!inCut(x,0)&&x%3!==2)R(O+x,O-2,1,1,OUT);
// upscale (nearest) and match hit-box
const oc=_wzCv(gw*PX,gh*PX),c=oc.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(s,0,0,gw*PX,gh*PX);
b._wzFires=fires;b._shellCache=oc;b._shellCachePad=O*PX;
}

function _wzDamageShell(b,env){
const src=b._shellCache,op=b._shellCachePad,w=b.w,h=b.h;
const pad=30,off=pad-op;
const oc=document.createElement('canvas');oc.width=Math.ceil(w+pad*2);oc.height=Math.ceil(h+pad*2);
const c=oc.getContext('2d');
c.drawImage(src,off,off);
c.translate(pad,pad);
const R=_wzRng(b,0x77a);
const fires=[];
// soot and grime
const sg=c.createLinearGradient(0,0,0,h);sg.addColorStop(0,'rgba(8,6,4,0.55)');sg.addColorStop(0.5,'rgba(20,14,10,0.2)');sg.addColorStop(1,'rgba(8,6,4,0.4)');
c.fillStyle=sg;c.fillRect(0,0,w,h);
// plaster loss -> exposed brick
for(let i=0;i<3;i++){
const px=R()*(w-26),py=12+R()*(h-30),pw=12+R()*22,ph=8+R()*16;
c.globalAlpha=0.7;c.fillStyle='#5a3a2e';c.fillRect(px,py,pw,ph);c.globalAlpha=1;
c.strokeStyle='rgba(30,16,10,0.6)';c.lineWidth=1;
for(let by=py+4;by<py+ph;by+=4){c.beginPath();c.moveTo(px,by);c.lineTo(px+pw,by);c.stroke();}
for(let by=py,k=0;by<py+ph;by+=4,k++)for(let bx=px+(k%2?4:0);bx<px+pw;bx+=8){c.beginPath();c.moveTo(bx,by);c.lineTo(bx,by+4);c.stroke();}
}
// collapsed corner geometry (decided first so windows inside it are skipped)
const ox=R()<0.5?0:w,oy=R()<0.75?0:h;
const sx=ox===0?1:-1,sy=oy===0?1:-1;
const cw=w*(0.28+R()*0.16),ch=Math.max(14,Math.min(h*(0.26+R()*0.14),h*0.55));
const inCut=(x,y)=>{const rx=sx>0?x<ox+cw:x>ox-cw,ry=sy>0?y<oy+ch:y>oy-ch;return rx&&ry;};
// windows
const cols=b._winCols||1,rows=b._winRows||1,winW=b._winW||10,winH=b._winH||8;
for(let r=0;r<rows;r++)for(let ci=0;ci<cols;ci++){
const wx=11+ci*((w-22)/Math.max(1,cols)),wy=16+r*((h-36)/Math.max(1,rows));
if(!(wx<w-16&&wy<h-16))continue;
if(inCut(wx+winW/2,wy+winH/2))continue;
const roll=R();
if(roll<0.6){
const sk=c.createLinearGradient(0,wy-16,0,wy);sk.addColorStop(0,'rgba(0,0,0,0)');sk.addColorStop(1,'rgba(0,0,0,0.55)');
c.fillStyle=sk;c.fillRect(wx-2,wy-16,winW+4,16);
c.fillStyle='#050403';c.beginPath();c.moveTo(wx-1.5,wy-1);c.lineTo(wx+winW*0.5,wy-2.5);c.lineTo(wx+winW+1.5,wy-0.5);c.lineTo(wx+winW+1,wy+winH+1.5);c.lineTo(wx-1,wy+winH+1);c.closePath();c.fill();
if(roll<0.2&&fires.length<2){
const fg=c.createLinearGradient(0,wy,0,wy+winH);fg.addColorStop(0,'#ffcf5a');fg.addColorStop(1,'#b02a00');
c.fillStyle=fg;c.globalAlpha=0.85;c.fillRect(wx,wy,winW,winH);c.globalAlpha=1;
fires.push({x:wx+winW/2,y:wy+winH*0.7,s:0.55+R()*0.35,k:'win'});
}
c.fillStyle='rgba(170,200,210,0.75)';
for(let k=0;k<3;k++){const gx=wx+k*winW/3;c.beginPath();c.moveTo(gx,wy+winH+1);c.lineTo(gx+winW/6,wy+winH-2);c.lineTo(gx+winW/3,wy+winH+1);c.closePath();c.fill();}
}
}
// cracks
c.strokeStyle='rgba(6,4,3,0.75)';c.lineWidth=1.4;
for(let k=0;k<2;k++){
let x=w*(0.2+R()*0.6),y=10;c.beginPath();c.moveTo(x,y);
for(let i=0;i<5;i++){x+=(R()-0.5)*14;y+=h*0.14+R()*6;c.lineTo(x,y);}
c.stroke();
}
// bullet pocks
for(let i=0;i<14;i++){const px=R()*w,py=10+R()*(h-10);c.fillStyle='rgba(8,6,4,0.8)';c.beginPath();c.arc(px,py,1+R()*0.9,0,6.283);c.fill();c.strokeStyle='rgba(180,170,150,0.25)';c.lineWidth=0.6;c.stroke();}
// collapsed corner cut-out
const pts=[[ox,oy],[ox+sx*cw,oy]];
const steps=5;
for(let i=1;i<steps;i++){const t=i/steps;pts.push([ox+sx*(cw*(1-t)+(R()-0.5)*cw*0.22),oy+sy*(ch*t+(R()-0.5)*ch*0.14)]);}
pts.push([ox,oy+sy*ch]);
const poly=()=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();};
c.save();c.globalCompositeOperation='destination-out';poly();c.fill();c.restore();
c.save();poly();c.clip();
const ig=c.createLinearGradient(ox,oy,ox+sx*cw,oy+sy*ch);ig.addColorStop(0,'#0c0907');ig.addColorStop(1,'#2a231b');
c.fillStyle=ig;c.fillRect(0,0,w,h);
c.strokeStyle='#4e463b';c.lineWidth=2.2;
for(let k=1;k<4;k++){const yy=oy+sy*ch*k/4;c.beginPath();c.moveTo(ox,yy);c.lineTo(ox+sx*cw*(0.55+R()*0.45),yy+(R()-0.5)*3);c.stroke();}
c.fillStyle='rgba(110,98,82,0.55)';
for(let k=0;k<2;k++){const vx=ox+sx*cw*(0.25+k*0.35);c.fillRect(Math.min(vx,vx+3),Math.min(oy,oy+sy*ch*0.8),3,ch*0.8);}
c.restore();
c.strokeStyle='#0a0806';c.lineWidth=2;poly();c.stroke();
c.strokeStyle='rgba(190,178,150,0.35)';c.lineWidth=1;c.beginPath();pts.slice(1,-1).forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();
// rebar from the edge
for(let i=1;i<pts.length-1;i++){
if(R()<0.35)continue;
const p=pts[i],a=Math.atan2(oy+sy*ch/2-p[1],ox+sx*cw/2-p[0])+Math.PI+(R()-0.5)*1.2,l=8+R()*14;
c.strokeStyle=R()<0.5?'#4a2a17':'#7a4524';c.lineWidth=1.3;
c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(p[0]+Math.cos(a)*l*0.6,p[1]+Math.sin(a)*l*0.6);c.lineTo(p[0]+Math.cos(a+0.6)*l,p[1]+Math.sin(a+0.6)*l);c.stroke();
}
fires.push({x:ox+sx*cw*0.45,y:oy+sy*ch*0.55,s:1.15,k:'roof',plume:true});
// rubble spilling out around the base
const greys=['#5c584e','#47443c','#6d685c','#38352f'];
for(let i=0;i<14;i++){
const side=R();let x,y;
if(side<0.6){x=R()*w;y=h+R()*13;}else if(side<0.8){x=-2-R()*8;y=h*0.4+R()*h*0.6;}else{x=w+2+R()*8;y=h*0.4+R()*h*0.6;}
const s=2.5+R()*5,a=R()*6.283;
c.fillStyle=greys[(R()*4)|0];c.beginPath();
for(let v=0;v<4;v++){const aa=a+v*1.57+(R()-0.5)*0.6,rr=s*(0.7+R()*0.5);v?c.lineTo(x+Math.cos(aa)*rr,y+Math.sin(aa)*rr*0.8):c.moveTo(x+Math.cos(aa)*rr,y+Math.sin(aa)*rr*0.8);}
c.closePath();c.fill();c.strokeStyle='rgba(0,0,0,0.6)';c.lineWidth=1;c.stroke();
}
// charred roof strip
const rg=c.createLinearGradient(0,0,0,10);rg.addColorStop(0,'rgba(0,0,0,0.6)');rg.addColorStop(1,'rgba(0,0,0,0)');
c.fillStyle=rg;c.fillRect(0,0,w,10);
b._wzFires=fires;
b._shellCache=oc;b._shellCachePad=pad;
}

function _buildBuildingShellCacheBase(b,env){
if($replay.currentEnv==='jungle'){ _buildJungleHut(b,env); return; }
if($replay.currentEnv==='desert'&&window.__desertPixel&&window.__desertPixel.building){ try{ window.__desertPixel.building(b,env,{PX:window.__artPX($replay.W,$replay.H),dx:_isoDX(),dy:_isoDY(),flat:_isoFlat()}); return; }catch(pe){} }
const w=b.w, h=b.h, _dx=_isoDX(), _dy=_isoDY();
const pad=8;
const oc=document.createElement('canvas');
oc.width=Math.ceil(w+pad*2); oc.height=Math.ceil(h+pad*2);
const c=oc.getContext('2d');
c.translate(pad,pad);
const x=0,y=0;
if(!_isoFlat()){
c.save();
c.fillStyle='rgba(0,0,0,0.35)';
c.beginPath();
c.moveTo(x+_dx+4, y+_dy+4);
c.lineTo(x+w+_dx+4, y+_dy+4);
c.lineTo(x+w+_dx+4, y+h+_dy+4);
c.lineTo(x+_dx+4, y+h+_dy+4);
c.closePath();
c.fill();
c.restore();
}
if(!_isoFlat()){
c.fillStyle=b._darkCol;
c.beginPath();
c.moveTo(x+w, y);
c.lineTo(x+w+_dx, y+_dy);
c.lineTo(x+w+_dx, y+h+_dy);
c.lineTo(x+w, y+h);
c.closePath();
c.fill();
c.save();c.strokeStyle=env.bAccent;c.lineWidth=1;c.globalAlpha=0.4;
c.beginPath();c.moveTo(x+w,y);c.lineTo(x+w+_dx,y+_dy);c.stroke();
c.restore();
}
if(!_isoFlat()){
c.fillStyle=b._darkCol;
c.save();c.globalAlpha=0.75;
c.beginPath();
c.moveTo(x, y+h);
c.lineTo(x+w, y+h);
c.lineTo(x+w+_dx, y+h+_dy);
c.lineTo(x+_dx, y+h+_dy);
c.closePath();
c.fill();
c.restore();
}
c.fillStyle=b._wallCol;
c.fillRect(x, y, w, h);
c.fillStyle=b._roofCol;
c.fillRect(x, y, w, 10);
c.strokeStyle='#0a0a0a';c.lineWidth=2.5;
c.strokeRect(x,y,w,h);
c.beginPath();c.moveTo(x,y+10);c.lineTo(x+w,y+10);c.stroke();
const _roofStyle=b.roofStyle||0;
if(_roofStyle===1){
c.save();c.strokeStyle=b._darkCol;c.lineWidth=1;c.globalAlpha=0.55;
c.beginPath();c.moveTo(x+2,y+6);c.lineTo(x+w/2,y+1);c.lineTo(x+w-2,y+6);c.stroke();
c.restore();
} else if(_roofStyle===2){
c.save();c.fillStyle=b._darkCol;c.globalAlpha=0.8;
const vw=Math.max(4,Math.min(9,w*0.12)),vh=4;
c.fillRect(x+w*0.28-vw/2,y+2,vw,vh);
c.fillRect(x+w*0.68-vw/2,y+2,vw,vh);
c.restore();
}
if($replay.currentEnv==='arctic'){
if(!b._snowCache || b._snowCacheW!==w) buildBuildingSnowCache(b,w);
c.drawImage(b._snowCache, x, y-$legendary._SNOW_OVERHANG);
}
c.save();c.strokeStyle=env.bAccent;c.lineWidth=1;c.globalAlpha=0.25;
c.strokeRect(x+4,y+4,w-8,h-8);
c.restore();
if(b.preDamage>0){
c.save();
c.globalAlpha=0.14*b.preDamage;
c.fillStyle='#000000';
const pSeed=((x*11+y*17+b.x*7+b.y*13)|0)>>>0;
const smudgeCount=2+Math.floor(b.preDamage*3);
for(let si=0;si<smudgeCount;si++){
const ss=(pSeed+si*173)%991;
const sx=x+(ss*29)%Math.max(1,w);
const sy=y+10+(ss*41)%Math.max(1,Math.max(1,h-10));
const sr=5+(ss%9);
c.beginPath();c.ellipse(sx,sy,sr,sr*0.6,0,0,Math.PI*2);c.fill();
}
c.restore();
}
const _winPattern=b.winPattern||0;
let winW=10,winH=8,cols,rows;
if(_winPattern===1){winW=7;winH=15;cols=Math.max(1,Math.floor(w/40));rows=Math.max(1,Math.floor(h/26));}
else if(_winPattern===2){winW=15;winH=13;cols=Math.max(1,Math.floor(w/48));rows=Math.max(1,Math.floor(h/48));}
else{cols=Math.max(1,Math.floor(w/32));rows=Math.max(1,Math.floor(h/32));}
c.fillStyle=env.bWin;
for(let r=0;r<rows;r++) for(let cIdx=0;cIdx<cols;cIdx++){
const wx=x+11+cIdx*((w-22)/Math.max(1,cols));
const wy=y+16+r*((h-36)/Math.max(1,rows));
if(wx<x+w-16&&wy<y+h-16){
c.fillRect(wx,wy,winW,winH);
c.strokeStyle='#0a0a0a';c.lineWidth=1;c.globalAlpha=0.7;c.strokeRect(wx,wy,winW,winH);c.globalAlpha=1;
if($replay.currentEnv!=='arctic' && (r*3+cIdx)%5===0){c.save();c.fillStyle='rgba(255,220,100,0.25)';c.fillRect(wx,wy,winW,winH);c.restore();}
}
}
if($replay.currentEnv==='urban'){
const _liteWin=$core.isUltraLow||$core.isVeryLow||$core.isLowEndDesktop||$buildings.settingPerfMode||$buildings._dqsQuality<0.4;
const _hs=(a,k)=>(((a*73856093)^(k*19349663)^((b.x|0)*83492791))>>>0)%100;
const wg=c.createLinearGradient(0,y+10,0,y+h);
wg.addColorStop(0,'rgba(130,150,235,0.12)');wg.addColorStop(1,'rgba(0,0,12,0.42)');
c.fillStyle=wg;c.fillRect(x+1,y+11,w-2,h-12);
const _neon=['#ff2e88','#18e0ff','#ffb020','#9b6bff'];
for(let r=0;r<rows;r++) for(let cIdx=0;cIdx<cols;cIdx++){
const wx=x+11+cIdx*((w-22)/Math.max(1,cols));
const wy=y+16+r*((h-36)/Math.max(1,rows));
if(!(wx<x+w-16&&wy<y+h-16)) continue;
const n=_hs(r,cIdx);
if(n<38){
const warm=n<26;
if(_liteWin){
c.fillStyle=warm?'rgba(255,180,84,0.22)':'rgba(79,216,255,0.20)';c.fillRect(wx-2,wy-2,winW+4,winH+4);
c.fillStyle=warm?'#ffc468':'#7fdcff';c.fillRect(wx,wy,winW,winH);
} else {
c.save();c.shadowColor=warm?'#ffb454':'#4fd8ff';c.shadowBlur=9;
const lg=c.createLinearGradient(0,wy,0,wy+winH);
lg.addColorStop(0,warm?'#ffe2a0':'#b8f0ff');lg.addColorStop(1,warm?'#ff9a3c':'#2fa8e0');
c.fillStyle=lg;c.fillRect(wx,wy,winW,winH);c.restore();
}
c.strokeStyle='#0a0a0a';c.lineWidth=1;c.strokeRect(wx,wy,winW,winH);
c.fillStyle='rgba(10,10,20,0.55)';c.fillRect(wx+winW/2-0.5,wy,1,winH);
} else {
c.fillStyle='rgba(120,150,255,0.10)';
c.beginPath();c.moveTo(wx,wy+winH);c.lineTo(wx+winW*0.6,wy);c.lineTo(wx+winW,wy);c.lineTo(wx+winW*0.4,wy+winH);c.closePath();c.fill();
}
}
c.fillStyle='rgba(170,190,255,0.5)';c.fillRect(x,y,w,1.5);c.fillRect(x,y,1.5,h);
c.fillStyle='rgba(0,0,0,0.35)';c.fillRect(x,y+h-2,w,2);
const _nh=_hs(7,3);
if(_nh<55){const nc=_neon[_nh%4];
if(_liteWin){c.save();c.globalAlpha=0.28;c.fillStyle=nc;c.fillRect(x+w*0.18-2,y+8,w*0.64+4,6);c.restore();c.fillStyle=nc;c.fillRect(x+w*0.18,y+10,w*0.64,2);}
else{c.save();c.shadowColor=nc;c.shadowBlur=12;c.fillStyle=nc;c.fillRect(x+w*0.18,y+10,w*0.64,2);c.restore();}}
}
if($replay.currentEnv==='spaceship'){
const _hs=(a,k)=>(((a*73856093)^(k*19349663)^((b.x|0)*83492791))>>>0)%100;
const hg=c.createLinearGradient(0,y+10,0,y+h);
hg.addColorStop(0,'rgba(80,160,255,0.14)');hg.addColorStop(1,'rgba(0,0,10,0.5)');
c.fillStyle=hg;c.fillRect(x+1,y+11,w-2,h-12);
c.fillStyle='rgba(0,0,10,0.35)';
for(let sx=x+w/3;sx<x+w-4;sx+=w/3)c.fillRect(Math.round(sx),y+11,1,h-14);
for(let r=0;r<rows;r++) for(let cIdx=0;cIdx<cols;cIdx++){
const wx=x+11+cIdx*((w-22)/Math.max(1,cols));
const wy=y+16+r*((h-36)/Math.max(1,rows));
if(!(wx<x+w-16&&wy<y+h-16)) continue;
const n=_hs(r,cIdx);
c.fillStyle='#040812';c.fillRect(wx-1,wy-1,winW+2,winH+2);
if(n<48){
c.save();c.shadowColor='#18e0ff';c.shadowBlur=8;
const lg=c.createLinearGradient(0,wy,0,wy+winH);
lg.addColorStop(0,n<10?'#ffd27a':'#c8f8ff');lg.addColorStop(1,n<10?'#ff9a3c':'#1ab4ff');
c.fillStyle=lg;c.fillRect(wx,wy,winW,winH);c.restore();
c.fillStyle='rgba(0,0,10,0.5)';c.fillRect(wx,wy+winH*0.5,winW,1);
} else {
c.fillStyle='rgba(24,200,255,0.07)';c.fillRect(wx,wy,winW,winH);
}
c.strokeStyle='#0a0a0a';c.lineWidth=1;c.strokeRect(wx-1,wy-1,winW+2,winH+2);
}
c.fillStyle='rgba(120,220,255,0.55)';c.fillRect(x,y,w,1.5);c.fillRect(x,y,1.5,h);
c.fillStyle='rgba(0,0,0,0.4)';c.fillRect(x,y+h-2,w,2);
c.save();c.beginPath();c.rect(x+2,y+h-8,w-4,5);c.clip();
c.fillStyle='#ffb020';c.fillRect(x+2,y+h-8,w-4,5);
c.fillStyle='#0a0a0a';
for(let sx=x-4;sx<x+w;sx+=10){c.beginPath();c.moveTo(sx,y+h-3);c.lineTo(sx+5,y+h-3);c.lineTo(sx+9,y+h-8);c.lineTo(sx+4,y+h-8);c.closePath();c.fill();}
c.restore();
const _sc=_hs(7,3)%2?'#18e0ff':'#9b6bff';
c.save();c.shadowColor=_sc;c.shadowBlur=10;c.fillStyle=_sc;c.fillRect(x+w*0.15,y+4,w*0.7,2);c.restore();
const _led=['#38ff7a','#ff3a4a','#ffb020'];
for(let li=0;li<3;li++){const lc=_led[(_hs(li,11))%3];c.save();c.shadowColor=lc;c.shadowBlur=5;c.fillStyle=lc;c.fillRect(x+w-8-li*6,y+h-16,3,3);c.restore();}
c.fillStyle='rgba(150,190,255,0.35)';
c.fillRect(x+3,y+12,2,2);c.fillRect(x+w-5,y+12,2,2);c.fillRect(x+3,y+h-18,2,2);
}
b._shellCache=oc;
b._shellCachePad=pad;
b._winCols=cols; b._winRows=rows; b._winW=winW; b._winH=winH;
}

function drawBuilding(b,env){
const x=b.x, y=b.y, w=b.w, h=b.h;
const _dx=_isoDX(), _dy=_isoDY();
if(b._shadeEnv!==$replay.currentEnv || b._shadeAmt!==b.shade){
const sAmt=(b.shade||0)*0.16;
if($replay.currentEnv==='jungle'){
const dk=(b._woodRoll===undefined)||b._woodRoll<0.5;
b._wallCol=_shadeHex(dk?'#2e1d0e':'#46301a',sAmt);
b._roofCol=_shadeHex('#4a4222',sAmt*0.8);
b._darkCol=_shadeHex(dk?'#1a1008':'#2a1c0e',sAmt);
} else {
b._wallCol=_shadeHex(env.bWall,sAmt);
b._roofCol=_shadeHex(env.bRoof,sAmt);
b._darkCol=_shadeHex(env.bDark,sAmt*0.7);
}
b._shadeEnv=$replay.currentEnv; b._shadeAmt=b.shade;
}
bakeOnce(b,'_shellCache',{_shellCacheEnv:$replay.currentEnv,_isoFlatAtCache:_isoFlat()},()=>{ _buildBuildingShellCache(b,env); });
{ const _pad=b._shellCachePad|0; if(x+w+_pad<-40||x-_pad>$replay.W+40||y+h+_pad<-40||y-_pad>$replay.H+40) return; }
$core.ctx.drawImage(b._shellCache, x-b._shellCachePad, y-b._shellCachePad);
if($replay.currentEnv==='arctic'){
const _winTier = $buildings.settingPerfMode?0:$core.isMobile?1:2;
if(_winTier>0){$core.ctx.strokeStyle='rgba(200,240,255,0.45)';$core.ctx.lineWidth=0.8;}
const cols=b._winCols,rows=b._winRows,winW=b._winW,winH=b._winH;
for(let r=0;r<rows;r++) for(let cIdx=0;cIdx<cols;cIdx++){
const wx=x+11+cIdx*((w-22)/Math.max(1,cols));
const wy=y+16+r*((h-36)/Math.max(1,rows));
if(wx<x+w-16&&wy<y+h-16){
if(_winTier===0){
$core.ctx.fillStyle=_frostColor(0.18);$core.ctx.fillRect(wx,wy,winW,winH);
} else if(_winTier===1){
$core.ctx.fillStyle=_frostColor(0.20);$core.ctx.fillRect(wx,wy,winW,winH);
$core.ctx.strokeRect(wx,wy,winW,winH);
} else {
const frostPulse=0.15+Math.sin($buildings.tick*0.02+(r*3+cIdx)*0.7)*0.08;
$core.ctx.fillStyle=_frostColor(frostPulse);$core.ctx.fillRect(wx,wy,winW,winH);
$core.ctx.strokeRect(wx,wy,winW,winH);
}
}
}
}
const dw=16,dh=22;
let dx=x+w/2-dw/2, dy=y+h-dh;
if(b.door==='n')dy=y;
else if(b.door==='e'){dx=x+w-dw;dy=y+h/2-dh/2;}
else if(b.door==='w'){dx=x;dy=y+h/2-dh/2;}
$core.ctx.fillStyle=b._darkCol;$core.ctx.fillRect(dx,dy,dw,dh);
$core.ctx.save();
$core.ctx.strokeStyle='#ff3300';
if($core.isMobile){
$core.ctx.globalAlpha=0.5;$core.ctx.lineWidth=1.5;
} else {
$core.ctx.shadowColor='#ff3300';
$core.ctx.shadowBlur=(8+Math.sin($buildings.tick*0.05)*4)*$core.SHADOW;
$core.ctx.lineWidth=1.5;$core.ctx.globalAlpha=0.5+Math.sin($buildings.tick*0.05)*0.2;
}
$core.ctx.strokeRect(dx-1,dy-1,dw+2,dh+2);
$core.ctx.restore();
if(b.spawnFlash>0){
$core.ctx.save();$core.ctx.globalAlpha=b.spawnFlash*0.5;$core.ctx.fillStyle='#ff4400';$core.ctx.fillRect(x,y,w,h);$core.ctx.restore();
$core.ctx.save();$core.ctx.globalAlpha=b.spawnFlash*0.8;$core.ctx.fillStyle='#ff8800';$core.ctx.fillRect(dx,dy,dw,dh);$core.ctx.restore();
}
b.spawnFlash=Math.max(0,b.spawnFlash-0.05);
if(b.maxHp!==undefined && b.hp!==undefined && b.hp<b.maxHp){
const dmgRatio=1-Math.max(0,b.hp)/b.maxHp;
$core.ctx.save();
$core.ctx.strokeStyle='rgba(0,0,0,0.6)';
$core.ctx.lineWidth=1.4;
const crackSeed=(b.x*7+b.y*13)|0;
const crackCount=Math.min(7,Math.floor(dmgRatio*9));
for(let ci=0;ci<crackCount;ci++){
const cs=(crackSeed+ci*101)%997;
const cx0=x+((cs*37)%Math.max(1,w));
const cy0=y+((cs*53)%Math.max(1,h));
$core.ctx.beginPath();$core.ctx.moveTo(cx0,cy0);
let cxp=cx0,cyp=cy0; const _pts=[[cx0,cy0]];
for(let seg=0;seg<3;seg++){
const a=((cs+seg*61)%628)/100;
cxp+=Math.cos(a)*6; cyp+=Math.sin(a)*6;
$core.ctx.lineTo(cxp,cyp); _pts.push([cxp,cyp]);
}
if($replay.currentEnv==='desert'){ const _P=window.__artPX($replay.W,$replay.H); $core.ctx.fillStyle='rgba(42,26,16,0.9)'; for(let pi=0;pi<_pts.length-1;pi++){ for(let st=0;st<3;st++){ const q=st/3, px2=_pts[pi][0]+(_pts[pi+1][0]-_pts[pi][0])*q, py2=_pts[pi][1]+(_pts[pi+1][1]-_pts[pi][1])*q; $core.ctx.fillRect(Math.round(px2/_P)*_P,Math.round(py2/_P)*_P,_P,_P); } } } else $core.ctx.stroke();
}
$core.ctx.restore();
if(b.crackFlash>0){
$core.ctx.save();$core.ctx.globalAlpha=b.crackFlash*0.6;$core.ctx.fillStyle='#ffffff';$core.ctx.fillRect(x,y,w,h);$core.ctx.restore();
}
}
if(b.crackFlash>0) b.crackFlash=Math.max(0,b.crackFlash-0.15);
}
function drawTree(t,env){
const wob=Math.sin($buildings.tick*0.018+t.phase)*1.8;
const tx=t.x, ty=t.y, tr=t.r, th=t.trunkH;
if($replay.currentEnv==='warzone'){ _drawWzTree(t); return; }
if($replay.currentEnv==='urban'){
const lx=tx, ly=ty;
$core.ctx.save();$core.ctx.globalAlpha=0.25;$core.ctx.fillStyle='#000';
$core.ctx.beginPath();$core.ctx.ellipse(lx+_isoDX()*0.5,ly+4,8,3,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
const ink='#0a0a0a';
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.moveTo(lx+3,ly-th*2);$core.ctx.lineTo(lx+3+_isoDX()*0.4,ly-th*2+_isoDY()*0.4);
$core.ctx.lineTo(lx+3+_isoDX()*0.4,ly+_isoDY()*0.4);$core.ctx.lineTo(lx+3,ly);$core.ctx.closePath();$core.ctx.stroke();
$core.ctx.fillStyle='#333';
$core.ctx.beginPath();$core.ctx.moveTo(lx+3,ly-th*2);$core.ctx.lineTo(lx+3+_isoDX()*0.4,ly-th*2+_isoDY()*0.4);
$core.ctx.lineTo(lx+3+_isoDX()*0.4,ly+_isoDY()*0.4);$core.ctx.lineTo(lx+3,ly);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.fillStyle='#555';$core.ctx.fillRect(lx-3,ly-th*2,6,th*2);
$core.ctx.strokeRect(lx-3,ly-th*2,6,th*2);
$core.ctx.fillStyle='#444';$core.ctx.fillRect(lx-3,ly-th*2,16,5);
$core.ctx.strokeRect(lx-3,ly-th*2,16,5);
$core.ctx.fillStyle='#333';
$core.ctx.beginPath();$core.ctx.moveTo(lx+13,ly-th*2);$core.ctx.lineTo(lx+13+5,ly-th*2+4);
$core.ctx.lineTo(lx+13+5,ly-th*2+9);$core.ctx.lineTo(lx+13,ly-th*2+5);$core.ctx.closePath();$core.ctx.fill();$core.ctx.stroke();
if($buildings._dqsQuality>=0.4&&!$core.isUltraLow){$core.ctx.save();$core.ctx.translate(lx+5,ly-th*2+3);$core.ctx.globalCompositeOperation='lighter';$core.ctx.fillStyle=cachedRadialGradient('urb_halo',0,0,0,0,0,40,[[0,'rgba(255,200,120,0.38)'],[1,'rgba(255,200,120,0)']]);$core.ctx.fillRect(-40,-40,80,80);$core.ctx.restore();}
$core.ctx.save();$core.ctx.shadowColor='rgba(255,240,180,0.9)';$core.ctx.shadowBlur=(18)*$core.SHADOW;
$core.ctx.fillStyle='rgba(255,240,180,0.7)';$core.ctx.beginPath();$core.ctx.arc(lx+5,ly-th*2+3,5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=1.2;$core.ctx.globalAlpha=0.6;
$core.ctx.beginPath();$core.ctx.arc(lx+5,ly-th*2+3,5,0,Math.PI*2);$core.ctx.stroke();$core.ctx.globalAlpha=1;
return;
}
$core.ctx.save();$core.ctx.globalAlpha=0.22;$core.ctx.fillStyle='#000';
$core.ctx.beginPath();$core.ctx.ellipse(tx+_isoDX()*0.7,ty+_isoDY()*0.5,tr*0.9,tr*0.38,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
if($replay.currentEnv==='arctic'){
$core.ctx.fillStyle='#2a1600';
$core.ctx.beginPath();$core.ctx.moveTo(tx+2,ty-th);$core.ctx.lineTo(tx+2+_isoDX()*0.3,ty-th+_isoDY()*0.3);
$core.ctx.lineTo(tx+2+_isoDX()*0.3,ty+_isoDY()*0.3);$core.ctx.lineTo(tx+2,ty);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.fillStyle=env.trunkCol;$core.ctx.fillRect(tx-2,ty-th,4,th);
$core.ctx.save();$core.ctx.shadowColor='rgba(200,230,255,0.4)';$core.ctx.shadowBlur=(6)*$core.SHADOW;
for(let tier=0;tier<3;tier++){
const ty2=ty-th-(tier*tr*0.6);
const tr2=tr*(1-tier*0.25);
$core.ctx.fillStyle=env.leaf2;$core.ctx.globalAlpha=0.6;
$core.ctx.beginPath();$core.ctx.ellipse(tx+tr2*0.5+_isoDX()*0.3,ty2+_isoDY()*0.3,tr2*0.5,tr2*0.25,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.globalAlpha=1;
$core.ctx.fillStyle=env.leaf2;$core.ctx.beginPath();$core.ctx.moveTo(tx,ty2-tr2);$core.ctx.lineTo(tx+tr2*0.9+wob*0.3,ty2+tr2*0.4);$core.ctx.lineTo(tx-tr2*0.9+wob*0.2,ty2+tr2*0.4);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.fillStyle='rgba(230,245,255,0.85)';$core.ctx.beginPath();$core.ctx.moveTo(tx,ty2-tr2);$core.ctx.lineTo(tx+tr2*0.5,ty2-tr2*0.3);$core.ctx.lineTo(tx-tr2*0.5,ty2-tr2*0.3);$core.ctx.closePath();$core.ctx.fill();
}
$core.ctx.restore();
return;
}
if($replay.currentEnv==='jungle'){
$core.ctx.fillStyle=env.trunkCol;$core.ctx.globalAlpha=0.6;
$core.ctx.beginPath();$core.ctx.moveTo(tx+3,ty-th);$core.ctx.lineTo(tx+3+_isoDX()*0.35,ty-th+_isoDY()*0.35);
$core.ctx.lineTo(tx+3+_isoDX()*0.35,ty+_isoDY()*0.35);$core.ctx.lineTo(tx+3,ty);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.globalAlpha=1;
$core.ctx.fillStyle=env.trunkCol;$core.ctx.fillRect(tx-4,ty-th,8,th);
if($core.isUltraLow||$core.isLowEndDesktop||$buildings.settingPerfMode||$buildings._dqsQuality<0.5){
$core.ctx.fillStyle=env.leafRim;
$core.ctx.beginPath();$core.ctx.arc(tx+wob*0.3+tr*0.2,ty-th+tr*0.15,tr*0.85,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=env.leafCol;
$core.ctx.beginPath();$core.ctx.arc(tx+wob*0.4,ty-th-tr*0.2,tr*0.72,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=env.leafHi;$core.ctx.globalAlpha=0.7;
$core.ctx.beginPath();$core.ctx.arc(tx+wob*0.5-tr*0.28,ty-th-tr*0.5,tr*0.3,0,Math.PI*2);$core.ctx.fill();
$core.ctx.globalAlpha=1;
return;
}
$core.ctx.fillStyle='rgba(60,8,0,0.42)';
$core.ctx.beginPath();$core.ctx.arc(tx+wob*0.4,ty-th,tr*1.2,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=env.leafRim;
$core.ctx.beginPath();$core.ctx.arc(tx+wob*0.3+tr*0.25,ty-th+tr*0.22,tr*0.95,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.arc(tx+wob*0.5-tr*0.55,ty-th+3,tr*0.62,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.arc(tx+wob*0.5+tr*0.6,ty-th+3,tr*0.62,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=env.leafCol;
$core.ctx.beginPath();$core.ctx.arc(tx+wob*0.4-tr*0.5,ty-th-2,tr*0.6,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.arc(tx+wob*0.4+tr*0.55,ty-th-2,tr*0.6,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.arc(tx+wob*0.5,ty-th-tr*0.35,tr*0.78,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=env.leaf2;
$core.ctx.beginPath();$core.ctx.arc(tx+wob*0.6,ty-th-tr*0.15,tr*0.6,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=env.leafHi;$core.ctx.globalAlpha=0.45;
$core.ctx.beginPath();$core.ctx.arc(tx+wob*0.7-tr*0.32,ty-th-tr*0.55,tr*0.34,0,Math.PI*2);$core.ctx.fill();
$core.ctx.globalAlpha=1;
return;
}
$core.ctx.fillStyle=env.trunkCol;$core.ctx.globalAlpha=0.6;
$core.ctx.beginPath();$core.ctx.moveTo(tx+3,ty-th);$core.ctx.lineTo(tx+3+_isoDX()*0.35,ty-th+_isoDY()*0.35);
$core.ctx.lineTo(tx+3+_isoDX()*0.35,ty+_isoDY()*0.35);$core.ctx.lineTo(tx+3,ty);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.globalAlpha=1;
$core.ctx.fillStyle=env.trunkCol;$core.ctx.fillRect(tx-3,ty-th,6,th);
const glowStr=$replay.currentEnv==='jungle'?0:$replay.currentEnv==='night'?0:2;
$core.ctx.save();$core.ctx.shadowColor=env.leafCol;$core.ctx.shadowBlur=(glowStr)*$core.SHADOW;
$core.ctx.fillStyle=env.leaf2;$core.ctx.globalAlpha=0.65;
$core.ctx.beginPath();$core.ctx.ellipse(tx+tr*0.5+_isoDX()*0.4+wob*0.2,ty-th+_isoDY()*0.4,tr*0.55,tr*0.38,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.globalAlpha=1;
$core.ctx.fillStyle=env.leaf2;$core.ctx.beginPath();$core.ctx.arc(tx+wob*0.4,ty-th-3,tr*0.65,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=env.leafCol;$core.ctx.beginPath();$core.ctx.arc(tx+wob,ty-th,tr,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='rgba(255,255,255,0.07)';$core.ctx.beginPath();$core.ctx.arc(tx+wob-tr*0.28,ty-th-tr*0.3,tr*0.38,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
}
function drawPlayer(){
$core.ctx.save();$core.ctx.translate($buildings.player.x,$buildings.player.y);$core.ctx.rotate($buildings.player.angle);
const wt=$buildings.player.walkT,leg=_gaitSin(wt)*8,arm=_gaitSin(wt)*6;
const glowPulse=Math.sin($buildings.player.gp)*0.5+0.5;
const _am = $psycho2.playerUpgrades.mutations;
const _mutGlow = _am&&_am.size>0?(
_am.has('mut_pierce')?'#00ffff':_am.has('mut_explosive')?'#ff8800':
_am.has('mut_chain')?'#ffff00':_am.has('mut_poison')?'#88ff44':
_am.has('mut_ricochet')?'#ff00ff':_am.has('mut_magnet')?'#00ffcc':
_am.has('mut_lifesteal')?'#ff0044':_am.has('mut_multishot')?'#ffffaa':null
):null;
const _hpPct = $buildings.player.hp / $buildings.player.maxHp;
const _baseRingCol = _hpPct < 0.3 ? '#ff2200'
: $buildings.killStreak >= 5 ? '#ff8800'
: '#aaff00';
const _baseRingPulse = 0.65 + Math.sin(glowPulse * Math.PI * 2) * 0.25;
const _aliveCount = $buildings.enemies.filter(e=>e.alive&&!e.boss).length;
const _chaosFactor = Math.min(1, Math.max(0, (_aliveCount - 8) / 14));
if(_chaosFactor > 0){
$core.ctx.save();
const _chaosR = 18 + _chaosFactor * 10;
const _chaosAlpha = 0.18 + _chaosFactor * 0.32;
const _chaosPulse = 0.6 + Math.sin(glowPulse * Math.PI * 3) * 0.35;
$core.ctx.globalAlpha = _chaosAlpha * _chaosPulse;
$core.ctx.strokeStyle = _hpPct < 0.3 ? '#ff2200' : '#aaff00';
$core.ctx.lineWidth = 2 + _chaosFactor * 2;
$core.ctx.beginPath();
$core.ctx.arc(0, 0, _chaosR, 0, Math.PI * 2);
$core.ctx.stroke();
if(_chaosFactor > 0.5){
$core.ctx.globalAlpha = (_chaosAlpha * 0.4) * _chaosPulse;
$core.ctx.lineWidth = 1.5;
$core.ctx.beginPath();
$core.ctx.arc(0, 0, _chaosR + 8, 0, Math.PI * 2);
$core.ctx.stroke();
}
$core.ctx.restore();
}
$core.ctx.save();
$core.ctx.globalAlpha = 0.55 * _baseRingPulse;
$core.ctx.strokeStyle = _baseRingCol;
$core.ctx.lineWidth = 2.5;
if(!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow){ $core.ctx.shadowColor = _baseRingCol; $core.ctx.shadowBlur = 10; }
$core.ctx.beginPath(); $core.ctx.ellipse(0, 6, 14, 6, 0, 0, Math.PI*2); $core.ctx.stroke();
$core.ctx.globalAlpha = 0.22 * _baseRingPulse;
$core.ctx.lineWidth = 1;
$core.ctx.beginPath(); $core.ctx.ellipse(0, 6, 8, 3.5, 0, 0, Math.PI*2); $core.ctx.stroke();
$core.ctx.restore();
const _isGod=$buildings.player.godModeTimer>0;
const glowCol=_isGod?'#ffd700':_mutGlow||($buildings.player.rapidTimer>0?'#ff44ff':$buildings.player.speedTimer>0?'#ffaa00':$buildings.player.shield>0?'#00ccff':'#7fff00');
const hasPowerup = _isGod||$buildings.player.rapidTimer>0||$buildings.player.speedTimer>0||$buildings.player.shield>0||!!_mutGlow;
if(!hasPowerup){
$core.ctx.save();
$core.ctx.globalAlpha=0.4+glowPulse*0.15;
$core.ctx.fillStyle='#eaffcc';
$core.ctx.beginPath();$core.ctx.arc(0,0,$core.isMobile?15:17,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
if(!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow){
$core.ctx.save();
$core.ctx.strokeStyle='#d8ffb0';
$core.ctx.shadowColor='#d8ffb0';$core.ctx.shadowBlur=7;
$core.ctx.lineWidth=1.4;
$core.ctx.globalAlpha=0.5+glowPulse*0.2;
$core.ctx.beginPath();$core.ctx.arc(0,0,15,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.restore();
}
}
if($core.isMobile){
if(hasPowerup){
$core.ctx.globalAlpha=_isGod?0.3:0.18;$core.ctx.fillStyle=glowCol;
$core.ctx.beginPath();$core.ctx.arc(0,0,_isGod?38:26,0,Math.PI*2);$core.ctx.fill();
$core.ctx.globalAlpha=1;
}
} else {
if(hasPowerup){
const _gSz=_isGod?1.7:1;
$core.ctx.save();$core.ctx.globalAlpha=(0.12+glowPulse*0.1)*(_isGod?1.8:1);$core.ctx.fillStyle=glowCol;$core.ctx.beginPath();$core.ctx.arc(0,0,(30+glowPulse*5)*_gSz,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.save();$core.ctx.strokeStyle=glowCol;$core.ctx.shadowColor=glowCol;$core.ctx.shadowBlur=(20+glowPulse*12)*(_isGod?1.5:1);$core.ctx.lineWidth=_isGod?2.5:1.5;$core.ctx.globalAlpha=0.35+glowPulse*0.35;$core.ctx.beginPath();$core.ctx.arc(0,0,(22+glowPulse*3)*_gSz,0,Math.PI*2);$core.ctx.stroke();$core.ctx.restore();
if(_isGod){
for(let _ri=0;_ri<3;_ri++){
const _ra=$buildings.tick*0.04+_ri*(Math.PI*2/3);
$core.ctx.save();$core.ctx.globalAlpha=0.5+glowPulse*0.3;$core.ctx.fillStyle='#ffffee';
$core.ctx.beginPath();$core.ctx.arc(Math.cos(_ra)*34,Math.sin(_ra)*34,2.5,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
}
}
}
}
if($buildings.player.shield>0){$core.ctx.save();const _gmActive=$buildings.player.godModeTimer>0;$core.ctx.strokeStyle=_gmActive?'rgba(255,215,0,0.9)':`rgba(0,200,255,${Math.min(1,$buildings.player.shield/80)})`;if(!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow){$core.ctx.shadowColor=_gmActive?'#ffd700':'#00ccff';$core.ctx.shadowBlur=22;}$core.ctx.lineWidth=_gmActive?3.5:2.5;$core.ctx.beginPath();$core.ctx.arc(0,0,28,0,Math.PI*2);$core.ctx.stroke();$core.ctx.restore();}
$core.ctx.shadowBlur=0;
const skin = $buildings.playerCustom.skin || '#c8a070';
const charCol = $buildings.playerCustom.color || '#2d4a1e';
const charDark = $buildings.playerCustom.darkColor || '#1a2e10';
$core.ctx.lineCap='round';
if($replay.selectedChar==='heavy'){
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=11;
$core.ctx.save();$core.ctx.rotate(leg*0.05);$core.ctx.beginPath();$core.ctx.moveTo(-6,10);$core.ctx.lineTo(-7+leg*0.4,22);$core.ctx.stroke();$core.ctx.restore();
$core.ctx.save();$core.ctx.rotate(-leg*0.05);$core.ctx.beginPath();$core.ctx.moveTo(6,10);$core.ctx.lineTo(7-leg*0.4,22);$core.ctx.stroke();$core.ctx.restore();
$core.ctx.strokeStyle=charDark;$core.ctx.lineWidth=9;
$core.ctx.save();$core.ctx.rotate(leg*0.05);$core.ctx.beginPath();$core.ctx.moveTo(-6,10);$core.ctx.lineTo(-7+leg*0.4,22);$core.ctx.stroke();
$core.ctx.fillStyle='#111';$core.ctx.beginPath();$core.ctx.ellipse(-7+leg*0.4,22,5,3,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.save();$core.ctx.rotate(-leg*0.05);$core.ctx.beginPath();$core.ctx.moveTo(6,10);$core.ctx.lineTo(7-leg*0.4,22);$core.ctx.stroke();
$core.ctx.fillStyle='#111';$core.ctx.beginPath();$core.ctx.ellipse(7-leg*0.4,22,5,3,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.fillStyle=charCol;$core.ctx.fillRect(-14,-12,28,26);
$core.ctx.fillStyle='rgba(0,0,0,0.3)';$core.ctx.fillRect(-14,-12,28,5);
$core.ctx.fillStyle='#8a6000';$core.ctx.fillRect(-14,0,28,4);$core.ctx.fillStyle='#aa8000';$core.ctx.fillRect(-6,0,4,4);$core.ctx.fillRect(2,0,4,4);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=3;
$core.ctx.strokeRect(-14,-12,28,26);
$core.ctx.save();$core.ctx.rotate(-arm*0.05-0.1);$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=12;
$core.ctx.beginPath();$core.ctx.moveTo(-12,-4);$core.ctx.lineTo(-18+arm*0.3,8);$core.ctx.stroke();
$core.ctx.strokeStyle=charCol;$core.ctx.lineWidth=10;
$core.ctx.beginPath();$core.ctx.moveTo(-12,-4);$core.ctx.lineTo(-18+arm*0.3,8);$core.ctx.stroke();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.arc(-18+arm*0.3,8,5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.stroke();$core.ctx.restore();
drawWeaponOnPlayer();
$core.ctx.save();$core.ctx.rotate(arm*0.05);$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=12;
$core.ctx.beginPath();$core.ctx.moveTo(12,-4);$core.ctx.lineTo(20,-arm*0.2);$core.ctx.stroke();
$core.ctx.strokeStyle=charCol;$core.ctx.lineWidth=10;
$core.ctx.beginPath();$core.ctx.moveTo(12,-4);$core.ctx.lineTo(20,-arm*0.2);$core.ctx.stroke();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.arc(20,-arm*0.2,5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.stroke();$core.ctx.restore();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.ellipse(0,-18,8,9,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2.5;$core.ctx.stroke();
$core.ctx.fillStyle=$buildings.playerCustom.accent||'#cc0000';$core.ctx.fillRect(-8,-21,16,5);
$core.ctx.fillStyle='#000';$core.ctx.fillRect(-8,-18,16,2);
$core.ctx.fillStyle='#333';$core.ctx.fillRect(-3,-20,2.5,2);$core.ctx.fillRect(0.5,-20,2.5,2);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2.5;$core.ctx.strokeRect(-8,-21,16,5);
} else if($replay.selectedChar==='sniper'){
$core.ctx.strokeStyle=charDark;$core.ctx.lineWidth=4;
$core.ctx.save();$core.ctx.rotate(leg*0.07);$core.ctx.beginPath();$core.ctx.moveTo(-3,10);$core.ctx.lineTo(-3+leg*0.4,24);$core.ctx.stroke();
$core.ctx.fillStyle='#1a1a0a';$core.ctx.beginPath();$core.ctx.ellipse(-3+leg*0.4,24,3,2,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.save();$core.ctx.rotate(-leg*0.07);$core.ctx.beginPath();$core.ctx.moveTo(3,10);$core.ctx.lineTo(3-leg*0.4,24);$core.ctx.stroke();
$core.ctx.fillStyle='#1a1a0a';$core.ctx.beginPath();$core.ctx.ellipse(3-leg*0.4,24,3,2,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.fillStyle=charCol;$core.ctx.fillRect(-8,-12,16,22);
$core.ctx.fillStyle='rgba(60,80,20,0.4)';
for(let gx=-6;gx<=4;gx+=4)for(let gy=-10;gy<=6;gy+=5)$core.ctx.beginPath(),$core.ctx.arc(gx,gy,2.5,0,Math.PI*2),$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.strokeRect(-8,-12,16,22);
$core.ctx.save();$core.ctx.rotate(-arm*0.05-0.1);$core.ctx.strokeStyle=charCol;$core.ctx.lineWidth=5;
$core.ctx.beginPath();$core.ctx.moveTo(-7,-4);$core.ctx.lineTo(-12+arm*0.3,8);$core.ctx.stroke();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.arc(-12+arm*0.3,8,3,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
drawWeaponOnPlayer();
$core.ctx.save();$core.ctx.rotate(arm*0.05);$core.ctx.strokeStyle=charCol;$core.ctx.lineWidth=5;
$core.ctx.beginPath();$core.ctx.moveTo(7,-4);$core.ctx.lineTo(16,-arm*0.2);$core.ctx.stroke();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.arc(16,-arm*0.2,3,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.ellipse(0,-17,6,7,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.stroke();
$core.ctx.fillStyle=charCol;$core.ctx.fillRect(-11,-23,22,6);
$core.ctx.fillStyle=charDark;$core.ctx.fillRect(-7,-25,14,5);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.strokeRect(-11,-23,22,6);$core.ctx.strokeRect(-7,-25,14,5);
$core.ctx.fillStyle='rgba(60,80,20,0.5)';for(let i=-9;i<=9;i+=4)$core.ctx.beginPath(),$core.ctx.arc(i,-21,1.5,0,Math.PI*2),$core.ctx.fill();
$core.ctx.fillStyle='#333';$core.ctx.fillRect(-2.5,-19,2,2);$core.ctx.fillRect(0.5,-19,2,2);
} else if($replay.selectedChar==='commando'){
$core.ctx.strokeStyle=charDark;$core.ctx.lineWidth=6;
$core.ctx.save();$core.ctx.rotate(leg*0.07);$core.ctx.beginPath();$core.ctx.moveTo(-4,10);$core.ctx.lineTo(-5+leg*0.4,22);$core.ctx.stroke();
$core.ctx.fillStyle='#111';$core.ctx.beginPath();$core.ctx.ellipse(-5+leg*0.4,22,4,2.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#333';$core.ctx.fillRect(-8+leg*0.4,14,7,5);$core.ctx.restore();
$core.ctx.save();$core.ctx.rotate(-leg*0.07);$core.ctx.beginPath();$core.ctx.moveTo(4,10);$core.ctx.lineTo(5-leg*0.4,22);$core.ctx.stroke();
$core.ctx.fillStyle='#111';$core.ctx.beginPath();$core.ctx.ellipse(5-leg*0.4,22,4,2.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#333';$core.ctx.fillRect(1-leg*0.4,14,7,5);$core.ctx.restore();
$core.ctx.fillStyle=charCol;$core.ctx.fillRect(-11,-12,22,24);
$core.ctx.fillStyle='rgba(20,30,50,0.6)';$core.ctx.fillRect(-11,-12,22,10);
$core.ctx.fillStyle='rgba(255,255,255,0.08)';$core.ctx.fillRect(-9,-10,5,5);$core.ctx.fillRect(4,-10,5,5);
$core.ctx.fillStyle=$buildings.playerCustom.accent||'#00aacc';$core.ctx.fillRect(-2,-12,4,3);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2.5;$core.ctx.strokeRect(-11,-12,22,24);
$core.ctx.save();$core.ctx.rotate(-arm*0.05-0.1);$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=9;
$core.ctx.beginPath();$core.ctx.moveTo(-8,-4);$core.ctx.lineTo(-14+arm*0.3,8);$core.ctx.stroke();
$core.ctx.strokeStyle=charCol;$core.ctx.lineWidth=7;
$core.ctx.beginPath();$core.ctx.moveTo(-8,-4);$core.ctx.lineTo(-14+arm*0.3,8);$core.ctx.stroke();
$core.ctx.fillStyle='#333';$core.ctx.beginPath();$core.ctx.arc(-11+arm*0.2,2,3.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.arc(-14+arm*0.3,8,4,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=1.8;$core.ctx.stroke();$core.ctx.restore();
drawWeaponOnPlayer();
$core.ctx.save();$core.ctx.rotate(arm*0.05);$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=9;
$core.ctx.beginPath();$core.ctx.moveTo(8,-4);$core.ctx.lineTo(18,-arm*0.2);$core.ctx.stroke();
$core.ctx.strokeStyle=charCol;$core.ctx.lineWidth=7;
$core.ctx.beginPath();$core.ctx.moveTo(8,-4);$core.ctx.lineTo(18,-arm*0.2);$core.ctx.stroke();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.arc(18,-arm*0.2,4,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=1.8;$core.ctx.stroke();$core.ctx.restore();
$core.ctx.fillStyle=charDark;$core.ctx.beginPath();$core.ctx.ellipse(0,-18,7,8,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2.2;$core.ctx.stroke();
$core.ctx.fillStyle='rgba(0,0,0,0.5)';$core.ctx.fillRect(-6,-22,12,5);
$core.ctx.fillStyle='#fff';$core.ctx.fillRect(-3.5,-20,2.5,2.5);$core.ctx.fillRect(1,-20,2.5,2.5);
$core.ctx.fillStyle='#333';$core.ctx.fillRect(-3,-19.5,2,1.5);$core.ctx.fillRect(1.2,-19.5,2,1.5);
} else if($replay.selectedChar==='elite'){
$core.ctx.strokeStyle=charDark;$core.ctx.lineWidth=7;
$core.ctx.save();$core.ctx.rotate(leg*0.06);$core.ctx.beginPath();$core.ctx.moveTo(-4,10);$core.ctx.lineTo(-5+leg*0.4,22);$core.ctx.stroke();
$core.ctx.fillStyle='#111';$core.ctx.beginPath();$core.ctx.ellipse(-5+leg*0.4,22,4.5,3,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.save();$core.ctx.rotate(-leg*0.06);$core.ctx.beginPath();$core.ctx.moveTo(4,10);$core.ctx.lineTo(5-leg*0.4,22);$core.ctx.stroke();
$core.ctx.fillStyle='#111';$core.ctx.beginPath();$core.ctx.ellipse(5-leg*0.4,22,4.5,3,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.fillStyle=charCol;$core.ctx.fillRect(-12,-12,24,24);
$core.ctx.fillStyle='rgba(0,0,0,0.25)';$core.ctx.fillRect(-12,-12,24,6);
$core.ctx.fillStyle=charDark;$core.ctx.fillRect(-10,-10,9,8);$core.ctx.fillRect(1,-10,9,8);
$core.ctx.fillStyle=$buildings.playerCustom.accent||'#00ff88';$core.ctx.fillRect(-10,-10,9,2);$core.ctx.fillRect(1,-10,9,2);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2.5;$core.ctx.strokeRect(-12,-12,24,24);
$core.ctx.fillStyle=charDark;$core.ctx.beginPath();$core.ctx.arc(-13,-8,7,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.arc(13,-8,7,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.arc(-13,-8,7,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.arc(13,-8,7,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.fillStyle=$buildings.playerCustom.accent||'#00ff88';$core.ctx.beginPath();$core.ctx.arc(-13,-8,3,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.arc(13,-8,3,0,Math.PI*2);$core.ctx.fill();
$core.ctx.save();$core.ctx.rotate(-arm*0.05-0.1);$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=10;
$core.ctx.beginPath();$core.ctx.moveTo(-9,-4);$core.ctx.lineTo(-15+arm*0.3,8);$core.ctx.stroke();
$core.ctx.strokeStyle=charCol;$core.ctx.lineWidth=8;
$core.ctx.beginPath();$core.ctx.moveTo(-9,-4);$core.ctx.lineTo(-15+arm*0.3,8);$core.ctx.stroke();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.arc(-15+arm*0.3,8,4,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.stroke();$core.ctx.restore();
drawWeaponOnPlayer();
$core.ctx.save();$core.ctx.rotate(arm*0.05);$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=10;
$core.ctx.beginPath();$core.ctx.moveTo(9,-4);$core.ctx.lineTo(19,-arm*0.2);$core.ctx.stroke();
$core.ctx.strokeStyle=charCol;$core.ctx.lineWidth=8;
$core.ctx.beginPath();$core.ctx.moveTo(9,-4);$core.ctx.lineTo(19,-arm*0.2);$core.ctx.stroke();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.arc(19,-arm*0.2,4,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.stroke();$core.ctx.restore();
$core.ctx.fillStyle=charDark;$core.ctx.beginPath();$core.ctx.ellipse(0,-18,9,10,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2.5;$core.ctx.stroke();
$core.ctx.fillStyle=charDark;$core.ctx.fillRect(-9,-22,18,6);
$core.ctx.fillStyle=$buildings.playerCustom.accent||'rgba(0,255,136,0.6)';$core.ctx.fillRect(-7,-21,14,6);
$core.ctx.fillStyle='rgba(255,255,255,0.15)';$core.ctx.fillRect(-7,-21,5,3);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.strokeRect(-9,-22,18,6);
} else if($replay.selectedChar==='medic'){
$core.ctx.strokeStyle=charDark;$core.ctx.lineWidth=6;
$core.ctx.save();$core.ctx.rotate(leg*0.06);$core.ctx.beginPath();$core.ctx.moveTo(-4,10);$core.ctx.lineTo(-5+leg*0.4,22);$core.ctx.stroke();
$core.ctx.fillStyle='#1a1a1a';$core.ctx.beginPath();$core.ctx.ellipse(-5+leg*0.4,22,4,2.5,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.save();$core.ctx.rotate(-leg*0.06);$core.ctx.beginPath();$core.ctx.moveTo(4,10);$core.ctx.lineTo(5-leg*0.4,22);$core.ctx.stroke();
$core.ctx.fillStyle='#1a1a1a';$core.ctx.beginPath();$core.ctx.ellipse(5-leg*0.4,22,4,2.5,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.fillStyle=charCol;$core.ctx.fillRect(-11,-12,22,24);
$core.ctx.fillStyle='#ff2244';$core.ctx.fillRect(-2,-10,4,10);$core.ctx.fillRect(-6,-7,12,4);
$core.ctx.fillStyle='#e0e0d0';$core.ctx.fillRect(-14,0,6,8);
$core.ctx.fillStyle='#ff2244';$core.ctx.fillRect(-13,2,4,4);$core.ctx.fillRect(-12,1,2,6);
$core.ctx.fillStyle='#3a2800';$core.ctx.fillRect(-11,2,22,3);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2.5;
$core.ctx.strokeRect(-11,-12,22,24);$core.ctx.strokeRect(-14,0,6,8);
$core.ctx.save();$core.ctx.rotate(-arm*0.05-0.1);$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=9;
$core.ctx.beginPath();$core.ctx.moveTo(-8,-4);$core.ctx.lineTo(-14+arm*0.3,8);$core.ctx.stroke();
$core.ctx.strokeStyle=charCol;$core.ctx.lineWidth=7;
$core.ctx.beginPath();$core.ctx.moveTo(-8,-4);$core.ctx.lineTo(-14+arm*0.3,8);$core.ctx.stroke();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.arc(-14+arm*0.3,8,4,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.stroke();$core.ctx.restore();
drawWeaponOnPlayer();
$core.ctx.save();$core.ctx.rotate(arm*0.05);$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=9;
$core.ctx.beginPath();$core.ctx.moveTo(8,-4);$core.ctx.lineTo(18,-arm*0.2);$core.ctx.stroke();
$core.ctx.strokeStyle=charCol;$core.ctx.lineWidth=7;
$core.ctx.beginPath();$core.ctx.moveTo(8,-4);$core.ctx.lineTo(18,-arm*0.2);$core.ctx.stroke();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.arc(18,-arm*0.2,4,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.stroke();$core.ctx.restore();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.ellipse(0,-18,7,8,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2.2;$core.ctx.stroke();
$core.ctx.fillStyle='#d0d0c8';$core.ctx.beginPath();$core.ctx.ellipse(0,-20,8,6,0,Math.PI,Math.PI*2);$core.ctx.fill();
$core.ctx.fillRect(-8,-22,16,5);
$core.ctx.fillStyle='#ff2244';$core.ctx.fillRect(-1.5,-22,3,5);$core.ctx.fillRect(-5,-20,10,2);
$core.ctx.fillStyle='#333';$core.ctx.fillRect(-3,-20,2,2);$core.ctx.fillRect(1,-20,2,2);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.strokeRect(-8,-22,16,5);
} else if($replay.selectedChar==='alien'){
const alienSkin = '#7abf8a';
const alienDark = '#3a7a4a';
const alienAccent = $buildings.playerCustom.accent||'#cc80ff';
$core.ctx.strokeStyle=alienDark;$core.ctx.lineWidth=4;
$core.ctx.save();$core.ctx.rotate(leg*0.08);
$core.ctx.beginPath();$core.ctx.moveTo(-3,8);$core.ctx.lineTo(-3+leg*0.35,22);$core.ctx.stroke();
$core.ctx.fillStyle=alienSkin;
$core.ctx.beginPath();$core.ctx.ellipse(-3+leg*0.35,22,4,2,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=alienDark;
$core.ctx.beginPath();$core.ctx.ellipse(-1+leg*0.35,23,1.2,0.8,-0.4,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(-3+leg*0.35,23.5,1.2,0.8,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(-5+leg*0.35,23,1.2,0.8,0.4,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
$core.ctx.save();$core.ctx.rotate(-leg*0.08);
$core.ctx.beginPath();$core.ctx.moveTo(3,8);$core.ctx.lineTo(3-leg*0.35,22);$core.ctx.stroke();
$core.ctx.fillStyle=alienSkin;
$core.ctx.beginPath();$core.ctx.ellipse(3-leg*0.35,22,4,2,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=alienDark;
$core.ctx.beginPath();$core.ctx.ellipse(1-leg*0.35,23,1.2,0.8,-0.4,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(3-leg*0.35,23.5,1.2,0.8,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(5-leg*0.35,23,1.2,0.8,0.4,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
$core.ctx.fillStyle=charCol||'#1a0a3a';
$core.ctx.beginPath();$core.ctx.ellipse(0,-2,9,14,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2.2;$core.ctx.stroke();
$core.ctx.strokeStyle=alienAccent;$core.ctx.lineWidth=0.8;$core.ctx.globalAlpha=0.6;
$core.ctx.beginPath();$core.ctx.moveTo(-6,-8);$core.ctx.lineTo(-4,-2);$core.ctx.lineTo(-6,4);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(6,-8);$core.ctx.lineTo(4,-2);$core.ctx.lineTo(6,4);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(-4,0);$core.ctx.lineTo(4,0);$core.ctx.stroke();
$core.ctx.globalAlpha=1;
$core.ctx.fillStyle=alienAccent;$core.ctx.globalAlpha=0.85;
$core.ctx.beginPath();$core.ctx.arc(0,-4,3.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='rgba(255,255,255,0.5)';
$core.ctx.beginPath();$core.ctx.arc(-1,-5,1.2,0,Math.PI*2);$core.ctx.fill();
$core.ctx.globalAlpha=1;
$core.ctx.save();$core.ctx.rotate(-arm*0.06-0.1);$core.ctx.strokeStyle=alienSkin;$core.ctx.lineWidth=4;
$core.ctx.beginPath();$core.ctx.moveTo(-7,-4);$core.ctx.lineTo(-13+arm*0.3,6);$core.ctx.stroke();
$core.ctx.fillStyle=alienSkin;$core.ctx.beginPath();$core.ctx.arc(-13+arm*0.3,6,3.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=alienDark;
$core.ctx.beginPath();$core.ctx.ellipse(-15+arm*0.3,5,1,0.7,-0.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(-13+arm*0.3,4,1,0.7,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(-11+arm*0.3,5,1,0.7,0.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
drawWeaponOnPlayer();
$core.ctx.save();$core.ctx.rotate(arm*0.06);$core.ctx.strokeStyle=alienSkin;$core.ctx.lineWidth=4;
$core.ctx.beginPath();$core.ctx.moveTo(7,-4);$core.ctx.lineTo(17,-arm*0.2);$core.ctx.stroke();
$core.ctx.fillStyle=alienSkin;$core.ctx.beginPath();$core.ctx.arc(17,-arm*0.2,3.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=alienDark;
$core.ctx.beginPath();$core.ctx.ellipse(15,-arm*0.2-1,1,0.7,-0.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(17,-arm*0.2-2,1,0.7,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(19,-arm*0.2-1,1,0.7,0.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
$core.ctx.fillStyle=alienSkin;$core.ctx.fillRect(-3,-15,6,6);
$core.ctx.fillStyle=alienSkin;
$core.ctx.beginPath();$core.ctx.ellipse(0,-24,11,14,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2.2;$core.ctx.stroke();
if(!$buildings.playerCustom._faceDataUrl){
$core.ctx.strokeStyle=alienDark;$core.ctx.lineWidth=0.6;$core.ctx.globalAlpha=0.4;
$core.ctx.beginPath();$core.ctx.moveTo(-4,-32);$core.ctx.quadraticCurveTo(-8,-24,-6,-16);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(4,-32);$core.ctx.quadraticCurveTo(8,-24,6,-16);$core.ctx.stroke();
$core.ctx.globalAlpha=1;
}
if($buildings.playerCustom._faceDataUrl){
if(!$buildings.playerCustom.faceImage || $buildings.playerCustom.faceImage.src !== $buildings.playerCustom._faceDataUrl){
$buildings.playerCustom.faceImage = new Image();
$buildings.playerCustom.faceImage.src = $buildings.playerCustom._faceDataUrl;
}
if($buildings.playerCustom.faceImage && $buildings.playerCustom.faceImage.complete && $buildings.playerCustom.faceImage.naturalWidth > 0){
$core.ctx.save();
$core.ctx.imageSmoothingEnabled=true; $core.ctx.imageSmoothingQuality='high';
$core.ctx.beginPath(); $core.ctx.ellipse(0,-24,10,13,0,0,Math.PI*2); $core.ctx.clip();
$core.ctx.globalAlpha=1.0;
$core.ctx.drawImage($buildings.playerCustom.faceImage,-11,-38,22,28);
$core.ctx.restore();
}
}
const _eyeRx = $buildings.playerCustom._faceDataUrl ? 3.5 : 5.5;
const _eyeRy = $buildings.playerCustom._faceDataUrl ? 2.0 : 3.5;
$core.ctx.fillStyle='#050508';
$core.ctx.save();$core.ctx.translate(-4.5,-24);$core.ctx.rotate(-0.25);
$core.ctx.beginPath();$core.ctx.ellipse(0,0,_eyeRx,_eyeRy,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.save();$core.ctx.translate(4.5,-24);$core.ctx.rotate(0.25);
$core.ctx.beginPath();$core.ctx.ellipse(0,0,_eyeRx,_eyeRy,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.fillStyle='rgba(100,180,255,0.6)';
$core.ctx.save();$core.ctx.translate(-5.5,-25.5);$core.ctx.rotate(-0.25);
$core.ctx.beginPath();$core.ctx.ellipse(0,0,1.5,0.8,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.save();$core.ctx.translate(3.5,-25.5);$core.ctx.rotate(0.25);
$core.ctx.beginPath();$core.ctx.ellipse(0,0,1.5,0.8,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.fillStyle=alienDark;
$core.ctx.beginPath();$core.ctx.ellipse(-1.2,-19,0.8,0.5,0.2,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(1.2,-19,0.8,0.5,-0.2,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle=alienDark;$core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.moveTo(-3,-17);$core.ctx.quadraticCurveTo(0,-16,3,-17);$core.ctx.stroke();
} else {
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=8;
$core.ctx.save();$core.ctx.rotate(leg*0.06);$core.ctx.beginPath();$core.ctx.moveTo(-4,10);$core.ctx.lineTo(-5+leg*0.4,22);$core.ctx.stroke();$core.ctx.restore();
$core.ctx.save();$core.ctx.rotate(-leg*0.06);$core.ctx.beginPath();$core.ctx.moveTo(4,10);$core.ctx.lineTo(5-leg*0.4,22);$core.ctx.stroke();$core.ctx.restore();
$core.ctx.strokeStyle=charDark;$core.ctx.lineWidth=6;
$core.ctx.save();$core.ctx.rotate(leg*0.06);$core.ctx.beginPath();$core.ctx.moveTo(-4,10);$core.ctx.lineTo(-5+leg*0.4,22);$core.ctx.stroke();
$core.ctx.fillStyle='#1a1a1a';$core.ctx.beginPath();$core.ctx.ellipse(-5+leg*0.4,22,4,2.5,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.save();$core.ctx.rotate(-leg*0.06);$core.ctx.beginPath();$core.ctx.moveTo(4,10);$core.ctx.lineTo(5-leg*0.4,22);$core.ctx.stroke();
$core.ctx.fillStyle='#1a1a1a';$core.ctx.beginPath();$core.ctx.ellipse(5-leg*0.4,22,4,2.5,0,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.fillStyle=charCol;$core.ctx.fillRect(-11,-12,22,24);
$core.ctx.fillStyle='#3a2800';$core.ctx.fillRect(-11,2,22,4);$core.ctx.fillStyle='#8a6000';$core.ctx.fillRect(-3,2,6,4);
$core.ctx.fillStyle=charDark;$core.ctx.fillRect(-9,-4,18,4);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2.5;$core.ctx.strokeRect(-11,-12,22,24);
$core.ctx.save();$core.ctx.rotate(-arm*0.05-0.1);$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=9;
$core.ctx.beginPath();$core.ctx.moveTo(-8,-4);$core.ctx.lineTo(-14+arm*0.3,8);$core.ctx.stroke();
$core.ctx.strokeStyle=charCol;$core.ctx.lineWidth=7;
$core.ctx.beginPath();$core.ctx.moveTo(-8,-4);$core.ctx.lineTo(-14+arm*0.3,8);$core.ctx.stroke();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.arc(-14+arm*0.3,8,4,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.stroke();$core.ctx.restore();
drawWeaponOnPlayer();
$core.ctx.save();$core.ctx.rotate(arm*0.05);$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=9;
$core.ctx.beginPath();$core.ctx.moveTo(8,-4);$core.ctx.lineTo(18,-arm*0.2);$core.ctx.stroke();
$core.ctx.strokeStyle=charCol;$core.ctx.lineWidth=7;
$core.ctx.beginPath();$core.ctx.moveTo(8,-4);$core.ctx.lineTo(18,-arm*0.2);$core.ctx.stroke();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.arc(18,-arm*0.2,4,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.stroke();$core.ctx.restore();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.ellipse(0,-18,7,8,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2.2;$core.ctx.stroke();
$core.ctx.fillStyle=charDark;$core.ctx.beginPath();$core.ctx.ellipse(0,-20,8,6,0,Math.PI,Math.PI*2);$core.ctx.fill();
$core.ctx.fillRect(-8,-22,16,5);$core.ctx.fillStyle='#111d08';$core.ctx.fillRect(-9,-17,18,3);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.strokeRect(-8,-22,16,5);
$core.ctx.fillStyle='rgba(0,0,0,0.3)';$core.ctx.beginPath();$core.ctx.ellipse(-3,-21,2,1.5,0.3,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(3,-20,1.5,1,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#fff';$core.ctx.fillRect(-4,-20,3,2);$core.ctx.fillRect(1,-20,3,2);
$core.ctx.fillStyle='#333';$core.ctx.fillRect(-3,-20,2,2);$core.ctx.fillRect(2,-20,2,2);
}
if($psycho2.armorTier>0){
$core.ctx.save();
const _atPulse=0.6+Math.sin(glowPulse*Math.PI*2)*0.3;
if($psycho2.armorTier===1){
$core.ctx.globalAlpha=0.5;
$core.ctx.strokeStyle='#8899aa';
$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.rect(-13,-13,26,24);$core.ctx.stroke();
} else if($psycho2.armorTier===2){
$core.ctx.globalAlpha=0.65;
$core.ctx.strokeStyle='#5588cc';
$core.ctx.lineWidth=2.5;
if(!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow){$core.ctx.shadowColor='#5588cc';$core.ctx.shadowBlur=8;}
$core.ctx.beginPath();$core.ctx.rect(-14,-14,28,26);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(-14,-6);$core.ctx.lineTo(14,-6);$core.ctx.stroke();
} else if($psycho2.armorTier===3){
$core.ctx.globalAlpha=0.55+_atPulse*0.3;
$core.ctx.strokeStyle='#ffffff';
if(!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow){$core.ctx.shadowColor='#ffffff';$core.ctx.shadowBlur=16;}
$core.ctx.lineWidth=3;
$core.ctx.beginPath();$core.ctx.arc(0,0,24,0,Math.PI*2);$core.ctx.stroke();
for(let _ai=0;_ai<4;_ai++){
const _aa=$buildings.tick*0.05+_ai*(Math.PI/2);
$core.ctx.globalAlpha=0.5+_atPulse*0.4;
$core.ctx.fillStyle='#ffffff';
$core.ctx.beginPath();$core.ctx.arc(Math.cos(_aa)*24,Math.sin(_aa)*24,2,0,Math.PI*2);$core.ctx.fill();
}
}
$core.ctx.restore();
}
$core.ctx.restore();
}
function drawPlayer2(){
if(!$replay.player2) return;
const p2=$replay.player2;
const wt=p2.walkT, leg=_gaitSin(wt)*8, arm=_gaitSin(wt)*6;
const skin='#a0c8f0', charCol='#0a2a5e', charDark='#061840';
$core.ctx.save();
$core.ctx.translate(p2.x, p2.y);
$core.ctx.rotate(p2.angle);
$core.ctx.lineCap='round';
if($replay.p2Down){
$core.ctx.save();
$core.ctx.globalAlpha=0.55+Math.sin(Date.now()*0.006)*0.2;
$core.ctx.fillStyle='#ff2200';
$core.ctx.beginPath();$core.ctx.arc(0,0,18,0,Math.PI*2);$core.ctx.fill();
$core.ctx.globalAlpha=1;
$core.ctx.fillStyle='#fff';$core.ctx.font='bold 9px Share Tech Mono';
$core.ctx.textAlign='center';$core.ctx.textBaseline='middle';
$core.ctx.fillText('DOWN',0,0);
$core.ctx.restore();
$core.ctx.restore();
$core.ctx.save();
$core.ctx.fillStyle='#ff2200';$core.ctx.font='bold 8px Share Tech Mono';
$core.ctx.textAlign='center';$core.ctx.textBaseline='middle';
$core.ctx.fillText('P2 DOWN',p2.x,p2.y-34);
$core.ctx.restore();
return;
}
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=8;
$core.ctx.save();$core.ctx.rotate(leg*0.06);
$core.ctx.beginPath();$core.ctx.moveTo(-4,10);$core.ctx.lineTo(-5+leg*0.4,22);$core.ctx.stroke();
$core.ctx.restore();
$core.ctx.save();$core.ctx.rotate(-leg*0.06);
$core.ctx.beginPath();$core.ctx.moveTo(4,10);$core.ctx.lineTo(5-leg*0.4,22);$core.ctx.stroke();
$core.ctx.restore();
$core.ctx.strokeStyle=charDark;$core.ctx.lineWidth=6;
$core.ctx.save();$core.ctx.rotate(leg*0.06);
$core.ctx.beginPath();$core.ctx.moveTo(-4,10);$core.ctx.lineTo(-5+leg*0.4,22);$core.ctx.stroke();
$core.ctx.fillStyle='#0a1a3a';$core.ctx.beginPath();$core.ctx.ellipse(-5+leg*0.4,22,4,2.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
$core.ctx.save();$core.ctx.rotate(-leg*0.06);
$core.ctx.beginPath();$core.ctx.moveTo(4,10);$core.ctx.lineTo(5-leg*0.4,22);$core.ctx.stroke();
$core.ctx.fillStyle='#0a1a3a';$core.ctx.beginPath();$core.ctx.ellipse(5-leg*0.4,22,4,2.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
$core.ctx.fillStyle=charCol;$core.ctx.fillRect(-11,-12,22,24);
$core.ctx.fillStyle='rgba(0,80,180,0.3)';$core.ctx.fillRect(-11,-12,22,5);
$core.ctx.fillStyle=charDark;$core.ctx.fillRect(-9,-4,18,4);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2.5;$core.ctx.strokeRect(-11,-12,22,24);
$core.ctx.save();$core.ctx.rotate(-arm*0.05-0.1);$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=9;
$core.ctx.beginPath();$core.ctx.moveTo(-8,-4);$core.ctx.lineTo(-14+arm*0.3,8);$core.ctx.stroke();
$core.ctx.strokeStyle=charCol;$core.ctx.lineWidth=7;
$core.ctx.beginPath();$core.ctx.moveTo(-8,-4);$core.ctx.lineTo(-14+arm*0.3,8);$core.ctx.stroke();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.arc(-14+arm*0.3,8,4,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.stroke();
$core.ctx.restore();
const _p2w = $replay.p2CurWep;
$core.ctx.save();
if(_p2w==='rifle'){
$core.ctx.fillStyle='#1a3a6a';$core.ctx.fillRect(8,-5,28,7);
$core.ctx.fillStyle='#2a5a9a';$core.ctx.fillRect(34,-4,8,5);
$core.ctx.fillStyle='#0a2a5a';$core.ctx.fillRect(8,-5,10,7);
} else if(_p2w==='shotgun'){
$core.ctx.fillStyle='#1a2a5a';$core.ctx.fillRect(8,-5,20,8);
$core.ctx.fillStyle='#0a1a4a';$core.ctx.fillRect(26,-5,14,4);
$core.ctx.fillStyle='#0a1a4a';$core.ctx.fillRect(26,-1,14,4);
$core.ctx.fillStyle='#4a6aaa';$core.ctx.fillRect(39,-6,5,10);
} else if(_p2w==='smg'){
$core.ctx.fillStyle='#1a2a5a';$core.ctx.fillRect(8,-4,20,7);
$core.ctx.fillStyle='#2a4a8a';$core.ctx.fillRect(26,-3,10,5);
$core.ctx.fillStyle='#0a2a5a';$core.ctx.fillRect(14,3,6,8);
} else if(_p2w==='minigun'){
$core.ctx.fillStyle='#1a2a5a';$core.ctx.fillRect(6,-6,30,12);
$core.ctx.fillStyle='#4a6aaa';$core.ctx.fillRect(34,-4,8,8);
$core.ctx.fillStyle='#2a4a8a';$core.ctx.fillRect(10,-8,5,16);
} else {
$core.ctx.fillStyle='#1a3a6a';$core.ctx.fillRect(8,-3,20,5);
$core.ctx.fillStyle='#2a5a9a';$core.ctx.fillRect(26,-2,8,4);
}
$core.ctx.restore();
$core.ctx.save();$core.ctx.rotate(arm*0.05);$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=9;
$core.ctx.beginPath();$core.ctx.moveTo(8,-4);$core.ctx.lineTo(18,-arm*0.2);$core.ctx.stroke();
$core.ctx.strokeStyle=charCol;$core.ctx.lineWidth=7;
$core.ctx.beginPath();$core.ctx.moveTo(8,-4);$core.ctx.lineTo(18,-arm*0.2);$core.ctx.stroke();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.arc(18,-arm*0.2,4,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.stroke();
$core.ctx.restore();
$core.ctx.fillStyle=skin;$core.ctx.beginPath();$core.ctx.ellipse(0,-18,7,8,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2.2;$core.ctx.stroke();
$core.ctx.fillStyle='#0a2a6a';$core.ctx.beginPath();$core.ctx.arc(0,-20,8,Math.PI,0);$core.ctx.fill();
$core.ctx.fillRect(-8,-22,16,5);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.arc(0,-20,8,Math.PI,0);$core.ctx.stroke();
$core.ctx.strokeRect(-8,-22,16,5);
$core.ctx.fillStyle='#1a4a9a';$core.ctx.fillRect(-8,-17,16,3);
$core.ctx.fillStyle='#ffffff';$core.ctx.fillRect(-4,-20,3,2);$core.ctx.fillRect(1,-20,3,2);
$core.ctx.fillStyle='#0a1a4a';$core.ctx.fillRect(-3,-20,2,2);$core.ctx.fillRect(2,-20,2,2);
$core.ctx.globalAlpha=0.18;$core.ctx.fillStyle=$replay.P2_COL;
$core.ctx.beginPath();$core.ctx.ellipse(0,-2,14,22,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.globalAlpha=1;
if($replay.p2Reloading){
const pct = Math.min(1, $replay.p2ReloadTimer / Math.floor($buildings.WEAPONS[$replay.p2CurWep].reload));
$core.ctx.save();
$core.ctx.strokeStyle='rgba(100,180,255,0.6)';$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.arc(0,0,28,-Math.PI/2,-Math.PI/2+pct*Math.PI*2);$core.ctx.stroke();
$core.ctx.restore();
}
if(p2.shield>0){
$core.ctx.strokeStyle=`rgba(0,150,255,${Math.min(1,p2.shield/80)})`;
$core.ctx.lineWidth=2.5;$core.ctx.beginPath();$core.ctx.arc(0,0,26,0,Math.PI*2);$core.ctx.stroke();
}
$core.ctx.restore();
$core.ctx.save();
$core.ctx.fillStyle=$replay.P2_COL;$core.ctx.font='bold 8px Share Tech Mono';
$core.ctx.textAlign='center';$core.ctx.textBaseline='middle';
$core.ctx.fillText('P2',p2.x,p2.y-34);
const bw=28;
$core.ctx.fillStyle='#001030';$core.ctx.fillRect(p2.x-bw/2,p2.y-28,bw,4);
$core.ctx.fillStyle=$replay.P2_COL;$core.ctx.fillRect(p2.x-bw/2,p2.y-28,bw*(p2.hp/p2.maxHp),4);
$core.ctx.restore();
}
function drawWeaponOnPlayer(){
$core.ctx.save();
if($buildings.player.recoilOffset>0) $core.ctx.translate(-$buildings.player.recoilOffset,0);
const _tier = $psycho2.wepEvolution[$buildings.curWep]||0;
const _glow = !$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow;
const _pulse = 0.5+Math.sin($buildings.tick*0.08)*0.5;

if($buildings.curWep==='rifle'){
if(_tier===0){
$core.ctx.fillStyle='#3a3a3a';$core.ctx.fillRect(6,-5,28,7);$core.ctx.fillStyle='#222';$core.ctx.fillRect(6,-3,28,3);
$core.ctx.fillStyle='#555';$core.ctx.fillRect(32,-4,10,5);$core.ctx.fillStyle='#4a3000';$core.ctx.fillRect(6,-5,10,7);
$core.ctx.fillStyle='#666';$core.ctx.fillRect(14,-7,5,3);$core.ctx.fillStyle='#444';$core.ctx.fillRect(16,2,5,7);
} else if(_tier===1){
if(_glow){$core.ctx.shadowColor='#00ccff';$core.ctx.shadowBlur=10;}
$core.ctx.fillStyle='#1a2a3a';$core.ctx.fillRect(6,-5,30,7);$core.ctx.fillStyle='#0a1a2a';$core.ctx.fillRect(6,-3,30,3);
$core.ctx.fillStyle='#00aaff';$core.ctx.fillRect(34,-4,8,5);
$core.ctx.fillStyle='#00ccff';$core.ctx.fillRect(38,-3,4,3);
$core.ctx.fillStyle='#002244';$core.ctx.fillRect(6,-5,10,7);
$core.ctx.fillStyle='#0044aa';$core.ctx.fillRect(14,-7,6,3);
if(_glow){$core.ctx.shadowColor='#00ccff';$core.ctx.shadowBlur=14*_pulse;}
$core.ctx.strokeStyle='#00ccff';$core.ctx.lineWidth=1;$core.ctx.globalAlpha=0.6;
$core.ctx.beginPath();$core.ctx.moveTo(14,-2);$core.ctx.lineTo(34,-2);$core.ctx.stroke();
$core.ctx.globalAlpha=1;$core.ctx.shadowBlur=0;
} else if(_tier===2){
if(_glow){$core.ctx.shadowColor='#aa44ff';$core.ctx.shadowBlur=14;}
$core.ctx.fillStyle='#1a0a2e';$core.ctx.fillRect(6,-6,32,9);$core.ctx.fillStyle='#0a001e';$core.ctx.fillRect(6,-4,32,4);
$core.ctx.fillStyle='#aa44ff';$core.ctx.fillRect(36,-5,10,7);
$core.ctx.fillStyle='#cc88ff';$core.ctx.fillRect(43,-4,4,5);
$core.ctx.fillStyle='#220044';$core.ctx.fillRect(6,-6,10,9);
$core.ctx.fillStyle='#6600cc';$core.ctx.fillRect(14,-8,7,3);$core.ctx.fillRect(14,3,7,3);
$core.ctx.strokeStyle='#aa44ff';$core.ctx.lineWidth=1;$core.ctx.globalAlpha=0.7;
$core.ctx.beginPath();$core.ctx.moveTo(16,-1);$core.ctx.lineTo(36,-1);$core.ctx.stroke();
$core.ctx.globalAlpha=0.4;$core.ctx.beginPath();$core.ctx.moveTo(16,1);$core.ctx.lineTo(36,1);$core.ctx.stroke();
$core.ctx.globalAlpha=1;$core.ctx.shadowBlur=0;
} else {
if(_glow){$core.ctx.shadowColor='#ffffff';$core.ctx.shadowBlur=18*_pulse;}
$core.ctx.fillStyle='#1a1a0a';$core.ctx.fillRect(4,-7,36,10);$core.ctx.fillStyle='#2a2a10';$core.ctx.fillRect(4,-5,36,5);
$core.ctx.fillStyle='#ffffaa';$core.ctx.fillRect(38,-6,14,9);
$core.ctx.fillStyle='#ffffff';$core.ctx.fillRect(49,-4,6,5);
$core.ctx.fillStyle='#aaaa00';$core.ctx.fillRect(4,-7,12,10);
for(let _ri=0;_ri<3;_ri++){
$core.ctx.globalAlpha=0.5-_ri*0.12;
$core.ctx.strokeStyle='#ffffff';$core.ctx.lineWidth=1.5;
$core.ctx.beginPath();$core.ctx.arc(52,-2,3+_ri*3,0,Math.PI*2);$core.ctx.stroke();
}
$core.ctx.globalAlpha=1;
$core.ctx.fillStyle='#ffff44';$core.ctx.fillRect(16,-9,5,3);$core.ctx.fillRect(16,6,5,3);
$core.ctx.shadowBlur=0;
}

} else if($buildings.curWep==='shotgun'){
if(_tier===0){
$core.ctx.fillStyle='#5a3010';$core.ctx.fillRect(6,-5,20,8);$core.ctx.fillStyle='#333';$core.ctx.fillRect(24,-5,14,4);
$core.ctx.fillStyle='#333';$core.ctx.fillRect(24,-1,14,4);$core.ctx.fillStyle='#888';$core.ctx.fillRect(37,-6,5,10);
$core.ctx.fillStyle='#2a1800';$core.ctx.fillRect(6,-5,14,8);
} else if(_tier===1){
if(_glow){$core.ctx.shadowColor='#ff8800';$core.ctx.shadowBlur=10;}
$core.ctx.fillStyle='#3a1800';$core.ctx.fillRect(6,-6,22,10);$core.ctx.fillStyle='#ff6600';$core.ctx.fillRect(26,-6,14,4);
$core.ctx.fillStyle='#cc4400';$core.ctx.fillRect(26,-2,14,4);$core.ctx.fillStyle='#ffaa44';$core.ctx.fillRect(38,-8,6,14);
$core.ctx.fillStyle='#2a1000';$core.ctx.fillRect(6,-6,14,10);
$core.ctx.fillStyle='#ff8800';$core.ctx.fillRect(14,-8,5,3);$core.ctx.fillRect(14,5,5,3);
$core.ctx.shadowBlur=0;
} else if(_tier===2){
if(_glow){$core.ctx.shadowColor='#ff2200';$core.ctx.shadowBlur=14;}
$core.ctx.fillStyle='#1a0000';$core.ctx.fillRect(4,-7,24,12);$core.ctx.fillStyle='#330000';$core.ctx.fillRect(26,-7,16,5);
$core.ctx.fillStyle='#220000';$core.ctx.fillRect(26,-2,16,5);$core.ctx.fillStyle='#ff2200';$core.ctx.fillRect(40,-9,8,16);
$core.ctx.fillStyle='#ff6600';$core.ctx.fillRect(46,-7,4,12);
$core.ctx.fillStyle='#550000';$core.ctx.fillRect(4,-7,14,12);
$core.ctx.strokeStyle='#ff2200';$core.ctx.lineWidth=1.2;$core.ctx.globalAlpha=0.8;
$core.ctx.beginPath();$core.ctx.moveTo(14,-1);$core.ctx.lineTo(26,-1);$core.ctx.stroke();
$core.ctx.globalAlpha=1;$core.ctx.shadowBlur=0;
} else {
if(_glow){$core.ctx.shadowColor='#ffdd00';$core.ctx.shadowBlur=20*_pulse;}
$core.ctx.fillStyle='#1a1000';$core.ctx.fillRect(4,-7,28,13);$core.ctx.fillStyle='#aaaa00';$core.ctx.fillRect(30,-7,18,6);
$core.ctx.fillStyle='#886600';$core.ctx.fillRect(30,-1,18,6);$core.ctx.fillStyle='#ffee44';$core.ctx.fillRect(46,-9,8,16);
$core.ctx.fillStyle='#ffff88';$core.ctx.fillRect(52,-6,4,11);
for(let _ri=0;_ri<3;_ri++){
$core.ctx.globalAlpha=0.45-_ri*0.1;
$core.ctx.strokeStyle='#ffdd00';$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.arc(54,0,4+_ri*4,0,Math.PI*2);$core.ctx.stroke();
}
$core.ctx.globalAlpha=1;$core.ctx.shadowBlur=0;
}

} else if($buildings.curWep==='smg'){
if(_tier===0){
$core.ctx.fillStyle='#2a2a2a';$core.ctx.fillRect(6,-4,20,7);$core.ctx.fillStyle='#555';$core.ctx.fillRect(24,-3,10,5);
$core.ctx.fillStyle='#444';$core.ctx.fillRect(12,3,6,8);$core.ctx.fillStyle='#666';$core.ctx.fillRect(6,-6,8,3);
$core.ctx.fillStyle='#888';$core.ctx.fillRect(32,-2,4,4);
} else if(_tier===1){
if(_glow){$core.ctx.shadowColor='#00ffcc';$core.ctx.shadowBlur=10;}
$core.ctx.fillStyle='#002a22';$core.ctx.fillRect(6,-5,22,8);$core.ctx.fillStyle='#00aa88';$core.ctx.fillRect(26,-4,12,6);
$core.ctx.fillStyle='#004433';$core.ctx.fillRect(12,3,7,9);$core.ctx.fillStyle='#00ffcc';$core.ctx.fillRect(6,-7,9,3);
$core.ctx.fillStyle='#006655';$core.ctx.fillRect(36,-2,5,5);
for(let _v=0;_v<3;_v++){$core.ctx.fillStyle='#00ffcc';$core.ctx.fillRect(14+_v*4,-5,2,8);}
$core.ctx.shadowBlur=0;
} else if(_tier===2){
if(_glow){$core.ctx.shadowColor='#00ffff';$core.ctx.shadowBlur=14;}
$core.ctx.fillStyle='#001a2a';$core.ctx.fillRect(5,-6,24,10);$core.ctx.fillStyle='#0044aa';$core.ctx.fillRect(27,-6,12,3);
$core.ctx.fillStyle='#002266';$core.ctx.fillRect(27,-3,12,3);$core.ctx.fillStyle='#002266';$core.ctx.fillRect(27,0,12,3);
$core.ctx.fillStyle='#00ccff';$core.ctx.fillRect(37,-8,5,3);$core.ctx.fillRect(37,-1,5,3);$core.ctx.fillRect(37,4,5,3);
$core.ctx.fillStyle='#003344';$core.ctx.fillRect(12,4,8,10);
$core.ctx.strokeStyle='#00ffff';$core.ctx.lineWidth=1;$core.ctx.globalAlpha=0.7;
for(let _v=0;_v<3;_v++){$core.ctx.beginPath();$core.ctx.moveTo(14+_v*5,-3);$core.ctx.lineTo(14+_v*5,3);$core.ctx.stroke();}
$core.ctx.globalAlpha=1;$core.ctx.shadowBlur=0;
} else {
if(_glow){$core.ctx.shadowColor='#aaffee';$core.ctx.shadowBlur=18*_pulse;}
$core.ctx.fillStyle='#1a1a2a';$core.ctx.fillRect(5,-6,26,10);$core.ctx.fillStyle='#888899';$core.ctx.fillRect(29,-5,14,7);
$core.ctx.fillStyle='#aaaacc';$core.ctx.fillRect(41,-4,7,5);
$core.ctx.fillStyle='#333355';$core.ctx.fillRect(12,4,9,10);
$core.ctx.fillStyle='#aaffee';$core.ctx.fillRect(6,-8,10,3);
$core.ctx.save();$core.ctx.translate(24,0);$core.ctx.rotate($buildings.tick*0.05);
$core.ctx.strokeStyle='#aaffee';$core.ctx.lineWidth=1.2;$core.ctx.globalAlpha=0.8;
for(let _i=0;_i<4;_i++){$core.ctx.beginPath();$core.ctx.moveTo(0,0);$core.ctx.lineTo(Math.cos(_i*Math.PI/2)*5,Math.sin(_i*Math.PI/2)*5);$core.ctx.stroke();}
$core.ctx.restore();$core.ctx.globalAlpha=1;$core.ctx.shadowBlur=0;
}

} else if($buildings.curWep==='knife'){
$core.ctx.translate(14,0);$core.ctx.rotate(-Math.PI/6);
if(_tier===0){
drawKnife();
} else if(_tier===1){
if(_glow){$core.ctx.shadowColor='#ff8844';$core.ctx.shadowBlur=10;}
$core.ctx.fillStyle='#cc5500';
$core.ctx.beginPath();$core.ctx.moveTo(0,-14);$core.ctx.lineTo(8,0);$core.ctx.lineTo(4,6);$core.ctx.lineTo(-4,6);$core.ctx.lineTo(-8,0);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.fillStyle='#ff9944';$core.ctx.beginPath();$core.ctx.moveTo(0,-14);$core.ctx.lineTo(5,-4);$core.ctx.lineTo(0,0);$core.ctx.lineTo(-5,-4);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.fillStyle='#5a3000';$core.ctx.fillRect(-3,6,6,12);$core.ctx.fillStyle='#3a1800';$core.ctx.fillRect(-3,8,6,2);$core.ctx.fillRect(-3,13,6,2);
$core.ctx.shadowBlur=0;
} else if(_tier===2){
if(_glow){$core.ctx.shadowColor='#ffffff';$core.ctx.shadowBlur=14;}
for(let _b=0;_b<3;_b++){
$core.ctx.save();$core.ctx.rotate((_b-1)*0.25);
$core.ctx.fillStyle=_b===1?'#ffffff':'#aaccff';
$core.ctx.beginPath();$core.ctx.moveTo(0,-16);$core.ctx.lineTo(2,0);$core.ctx.lineTo(1.5,6);$core.ctx.lineTo(-1.5,6);$core.ctx.lineTo(-2,0);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.restore();
}
$core.ctx.fillStyle='#555';$core.ctx.fillRect(-5,5,10,3);$core.ctx.fillStyle='#222';$core.ctx.fillRect(-3,8,6,10);
$core.ctx.shadowBlur=0;
} else {
if(_glow){$core.ctx.shadowColor='#8800ff';$core.ctx.shadowBlur=20*_pulse;}
$core.ctx.globalAlpha=0.7+_pulse*0.2;
$core.ctx.fillStyle='#1a0033';
$core.ctx.beginPath();$core.ctx.moveTo(0,-18);$core.ctx.lineTo(4,0);$core.ctx.lineTo(2,8);$core.ctx.lineTo(-2,8);$core.ctx.lineTo(-4,0);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.fillStyle='#8800ff';$core.ctx.globalAlpha=0.5*_pulse;
$core.ctx.beginPath();$core.ctx.moveTo(0,-18);$core.ctx.lineTo(3,-6);$core.ctx.lineTo(0,0);$core.ctx.lineTo(-3,-6);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.globalAlpha=1;
$core.ctx.fillStyle='#0a0010';$core.ctx.fillRect(-3,8,6,10);
for(let _s=0;_s<3;_s++){
const _sa=$buildings.tick*0.1+_s*2.1;
$core.ctx.fillStyle='#cc44ff';$core.ctx.globalAlpha=0.7;
$core.ctx.beginPath();$core.ctx.arc(Math.cos(_sa)*8,Math.sin(_sa)*4-4,1.5,0,Math.PI*2);$core.ctx.fill();
}
$core.ctx.globalAlpha=1;$core.ctx.shadowBlur=0;
}

} else if($buildings.curWep==='minigun'){
if(_tier===0){
$core.ctx.fillStyle='#333';$core.ctx.fillRect(6,-6,20,10);$core.ctx.fillStyle='#555';$core.ctx.fillRect(24,-5,16,8);
$core.ctx.fillStyle='#222';$core.ctx.fillRect(6,-6,10,10);$core.ctx.fillStyle='#666';$core.ctx.fillRect(38,-4,6,7);
for(let _b=0;_b<3;_b++){$core.ctx.fillStyle='#444';$core.ctx.fillRect(22,(-5+_b*3),16,2);}
} else if(_tier===1){
if(_glow){$core.ctx.shadowColor='#ff6600';$core.ctx.shadowBlur=10;}
$core.ctx.fillStyle='#2a1800';$core.ctx.fillRect(5,-7,22,12);$core.ctx.fillStyle='#ff6600';$core.ctx.fillRect(25,-7,18,4);
$core.ctx.fillStyle='#cc4400';$core.ctx.fillRect(25,-3,18,4);$core.ctx.fillStyle='#ff4400';$core.ctx.fillRect(25,1,18,4);
$core.ctx.fillStyle='#ff8844';$core.ctx.fillRect(41,-9,7,16);$core.ctx.fillStyle='#333';$core.ctx.fillRect(6,-7,12,12);
$core.ctx.shadowBlur=0;
} else if(_tier===2){
if(_glow){$core.ctx.shadowColor='#ff0000';$core.ctx.shadowBlur=16;}
$core.ctx.fillStyle='#1a0000';$core.ctx.fillRect(4,-8,24,14);$core.ctx.fillStyle='#440000';$core.ctx.fillRect(26,-8,20,5);
$core.ctx.fillStyle='#330000';$core.ctx.fillRect(26,-3,20,5);$core.ctx.fillStyle='#330000';$core.ctx.fillRect(26,2,20,5);
$core.ctx.fillStyle='#ff0000';$core.ctx.fillRect(44,-10,8,18);$core.ctx.fillStyle='#ff4444';$core.ctx.fillRect(50,-8,4,14);
$core.ctx.strokeStyle='#ff2200';$core.ctx.lineWidth=1;$core.ctx.globalAlpha=0.7;
$core.ctx.beginPath();$core.ctx.moveTo(26,-5);$core.ctx.lineTo(44,-5);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(26,0);$core.ctx.lineTo(44,0);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(26,5);$core.ctx.lineTo(44,5);$core.ctx.stroke();
$core.ctx.globalAlpha=1;$core.ctx.shadowBlur=0;
} else {
if(_glow){$core.ctx.shadowColor='#ffaa00';$core.ctx.shadowBlur=22*_pulse;}
$core.ctx.fillStyle='#1a1000';$core.ctx.fillRect(3,-9,26,16);$core.ctx.fillStyle='#aaaa00';$core.ctx.fillRect(27,-9,22,5);
$core.ctx.fillStyle='#888800';$core.ctx.fillRect(27,-4,22,5);$core.ctx.fillStyle='#888800';$core.ctx.fillRect(27,1,22,5);
$core.ctx.fillStyle='#ffdd00';$core.ctx.fillRect(47,-11,10,20);$core.ctx.fillStyle='#ffff88';$core.ctx.fillRect(54,-9,4,16);
for(let _ri=0;_ri<3;_ri++){
$core.ctx.globalAlpha=0.5-_ri*0.12;$core.ctx.strokeStyle='#ffaa00';$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.arc(57,0,4+_ri*4,0,Math.PI*2);$core.ctx.stroke();
}
$core.ctx.globalAlpha=1;$core.ctx.shadowBlur=0;
}

} else if($buildings.curWep==='rpg'){
if(_tier===0){
$core.ctx.fillStyle='#4a3a20';$core.ctx.fillRect(6,-4,30,8);$core.ctx.fillStyle='#3a2a10';$core.ctx.fillRect(6,-4,20,8);
$core.ctx.fillStyle='#888';$core.ctx.fillRect(34,-3,8,6);$core.ctx.fillStyle='#ff4400';$core.ctx.fillRect(40,-2,6,4);
$core.ctx.fillStyle='#666';$core.ctx.fillRect(14,-6,4,3);$core.ctx.fillRect(14,3,4,3);
} else if(_tier===1){
if(_glow){$core.ctx.shadowColor='#ff4400';$core.ctx.shadowBlur=10;}
$core.ctx.fillStyle='#3a2000';$core.ctx.fillRect(5,-6,28,5);$core.ctx.fillRect(5,1,28,5);
$core.ctx.fillStyle='#555';$core.ctx.fillRect(31,-6,10,5);$core.ctx.fillRect(31,1,10,5);
$core.ctx.fillStyle='#ff4400';$core.ctx.fillRect(39,-7,8,5);$core.ctx.fillRect(39,1,8,5);
$core.ctx.fillStyle='#ff6600';$core.ctx.fillRect(44,-5,4,3);$core.ctx.fillRect(44,2,4,3);
$core.ctx.fillStyle='#2a1000';$core.ctx.fillRect(5,-6,14,12);
$core.ctx.shadowBlur=0;
} else if(_tier===2){
if(_glow){$core.ctx.shadowColor='#ff0000';$core.ctx.shadowBlur=18;}
$core.ctx.fillStyle='#1a0000';$core.ctx.fillRect(4,-8,30,14);$core.ctx.fillStyle='#333';$core.ctx.fillRect(32,-8,14,6);
$core.ctx.fillStyle='#222';$core.ctx.fillRect(32,-2,14,6);$core.ctx.fillStyle='#ff0000';$core.ctx.fillRect(44,-10,10,18);
$core.ctx.fillStyle='#ff5500';$core.ctx.fillRect(50,-8,5,14);$core.ctx.fillStyle='#ff8800';$core.ctx.fillRect(53,-6,3,10);
$core.ctx.fillStyle='#550000';$core.ctx.fillRect(4,-8,16,14);
$core.ctx.strokeStyle='#ff0000';$core.ctx.lineWidth=1.5;$core.ctx.globalAlpha=0.8;
$core.ctx.beginPath();$core.ctx.arc(54,0,7,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.globalAlpha=1;$core.ctx.shadowBlur=0;
} else {
if(_glow){$core.ctx.shadowColor='#ffffff';$core.ctx.shadowBlur=24*_pulse;}
$core.ctx.fillStyle='#101018';$core.ctx.fillRect(3,-9,32,16);$core.ctx.fillStyle='#aaaa44';$core.ctx.fillRect(33,-9,16,7);
$core.ctx.fillStyle='#888822';$core.ctx.fillRect(33,-2,16,7);$core.ctx.fillStyle='#ffffff';$core.ctx.fillRect(47,-12,14,22);
$core.ctx.fillStyle='#ffff88';$core.ctx.fillRect(56,-10,6,18);
for(let _ri=0;_ri<4;_ri++){
$core.ctx.globalAlpha=0.5-_ri*0.1;$core.ctx.strokeStyle='#ffffff';$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.arc(61,0,5+_ri*5,0,Math.PI*2);$core.ctx.stroke();
}
$core.ctx.globalAlpha=1;$core.ctx.shadowBlur=0;
}

} else if($buildings.curWep==='flamethrower'){
if(_tier===0){
$core.ctx.fillStyle='#3a2200';$core.ctx.fillRect(6,-4,18,8);$core.ctx.fillStyle='#555';$core.ctx.fillRect(22,-3,12,6);
$core.ctx.fillStyle='#ff6600';$core.ctx.fillRect(32,-2,6,4);$core.ctx.fillStyle='#cc4400';$core.ctx.fillRect(34,-3,6,6);
} else if(_tier===1){
if(_glow){$core.ctx.shadowColor='#ff6600';$core.ctx.shadowBlur=12;}
$core.ctx.fillStyle='#2a1000';$core.ctx.fillRect(5,-5,20,9);$core.ctx.fillStyle='#663300';$core.ctx.fillRect(23,-5,14,9);
$core.ctx.fillStyle='#ff6600';$core.ctx.fillRect(35,-6,8,11);$core.ctx.fillStyle='#ffaa00';$core.ctx.fillRect(40,-5,5,9);
$core.ctx.fillStyle='#ff8800';$core.ctx.fillRect(43,-3,4,5);
$core.ctx.shadowBlur=0;
} else if(_tier===2){
if(_glow){$core.ctx.shadowColor='#ff2200';$core.ctx.shadowBlur=18;}
$core.ctx.fillStyle='#1a0000';$core.ctx.fillRect(4,-5,24,9);$core.ctx.fillStyle='#440000';$core.ctx.fillRect(26,-5,18,9);
$core.ctx.fillStyle='#ff0000';$core.ctx.fillRect(42,-7,10,13);$core.ctx.fillStyle='#ff5500';$core.ctx.fillRect(48,-5,6,9);
$core.ctx.strokeStyle='#ff4400';$core.ctx.lineWidth=2;$core.ctx.globalAlpha=0.8;
$core.ctx.beginPath();$core.ctx.moveTo(26,-1);$core.ctx.lineTo(42,-1);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(26,1);$core.ctx.lineTo(42,1);$core.ctx.stroke();
$core.ctx.globalAlpha=1;$core.ctx.shadowBlur=0;
} else {
if(_glow){$core.ctx.shadowColor='#ffffff';$core.ctx.shadowBlur=22*_pulse;}
$core.ctx.fillStyle='#100800';$core.ctx.fillRect(3,-6,26,11);$core.ctx.fillStyle='#aaaa00';$core.ctx.fillRect(27,-6,18,11);
$core.ctx.fillStyle='#ffffff';$core.ctx.fillRect(43,-8,12,15);$core.ctx.fillStyle='#ffee88';$core.ctx.fillRect(51,-7,6,13);
for(let _ri=0;_ri<4;_ri++){
$core.ctx.globalAlpha=0.5-_ri*0.1;$core.ctx.strokeStyle='#ffffff';$core.ctx.lineWidth=1.5;
$core.ctx.beginPath();$core.ctx.arc(57,0,4+_ri*4,0,Math.PI*2);$core.ctx.stroke();
}
$core.ctx.globalAlpha=1;$core.ctx.shadowBlur=0;
}

} else if($buildings.curWep==='laser'){
if(_glow){$core.ctx.shadowColor='#cc44ff';$core.ctx.shadowBlur=12+_pulse*6;}
$core.ctx.fillStyle='#1a0033';$core.ctx.fillRect(6,-4,26,8);$core.ctx.fillStyle='#440088';$core.ctx.fillRect(30,-4,10,8);
$core.ctx.fillStyle='#cc44ff';$core.ctx.fillRect(38,-5,8,10);$core.ctx.fillStyle='#ff88ff';$core.ctx.fillRect(43,-3,5,6);
$core.ctx.fillStyle='#6600cc';$core.ctx.fillRect(6,-4,10,8);
$core.ctx.strokeStyle='#cc44ff';$core.ctx.lineWidth=1;$core.ctx.globalAlpha=0.6+_pulse*0.3;
$core.ctx.beginPath();$core.ctx.moveTo(16,-1);$core.ctx.lineTo(38,-1);$core.ctx.stroke();
$core.ctx.globalAlpha=1;$core.ctx.shadowBlur=0;

} else if($buildings.curWep==='plasmacutter'){
if(_glow){$core.ctx.shadowColor='#00ffaa';$core.ctx.shadowBlur=12+_pulse*6;}
$core.ctx.fillStyle='#002a1a';$core.ctx.fillRect(6,-4,18,8);$core.ctx.fillStyle='#00aa66';$core.ctx.fillRect(22,-5,10,10);
$core.ctx.fillStyle='#00ffaa';$core.ctx.fillRect(30,-6,8,12);$core.ctx.fillStyle='#aaffee';$core.ctx.fillRect(35,-4,5,8);
$core.ctx.strokeStyle='#00ffaa';$core.ctx.lineWidth=1;$core.ctx.globalAlpha=0.6+_pulse*0.4;
$core.ctx.beginPath();$core.ctx.arc(38,0,5,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.globalAlpha=1;$core.ctx.shadowBlur=0;
}

$core.ctx.restore();
}
const _shadeCache = new Map();
function _shadeHex(hex, amt){
if(!hex || hex[0]!=='#') return hex;
const key = hex+'|'+amt;
const cached = _shadeCache.get(key);
if(cached !== undefined) return cached;
let r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
r=Math.max(0,Math.min(255,r+amt*2.55));
g=Math.max(0,Math.min(255,g+amt*2.55));
b=Math.max(0,Math.min(255,b+amt*2.55));
const result = '#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
_shadeCache.set(key, result);
return result;
}
function _lighten(hex, amt){ return _shadeHex(hex, Math.abs(amt)); }
function _darken(hex, amt){ return _shadeHex(hex, -Math.abs(amt)); }
function _gaitSin(t){const s=Math.sin(t);return Math.sign(s)*Math.pow(Math.abs(s),0.7);}
function _gaitBob(t){return Math.abs(Math.sin(t));}
function drawIsoShadow(radius, alpha){
$core.ctx.save();
$core.ctx.globalAlpha=(alpha||0.35);
$core.ctx.fillStyle='#000';
$core.ctx.beginPath();
$core.ctx.ellipse(_isoDX()*0.6, _isoDY()*0.6+radius*0.4, radius*1.1, radius*0.45, 0, 0, Math.PI*2);
$core.ctx.fill();
$core.ctx.restore();
}
function _drawSoldierRaw(e,facing){
$core.ctx.rotate(facing);
{const _gb=_gaitBob(e.walkT);$core.ctx.scale(1+_gb*0.04,1-_gb*0.04);}
const wt=e.walkT, ls=_gaitSin(wt)*7;
const breathe=(e._sprB!==undefined)?e._sprB:Math.sin(wt*0.18)*1.1;
const skin='#c8a070';
const bodyCol=e.col;
const shadowCol=_darken(bodyCol,28);
const hiCol=_lighten(bodyCol,22);
const ink='#0a0a0a';
$core.ctx.lineCap='round';
$core.ctx.lineJoin='round';
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=5.5;
$core.ctx.beginPath();$core.ctx.moveTo(-3,4);$core.ctx.lineTo(-4+ls*0.5,15);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(3,4);$core.ctx.lineTo(4-ls*0.5,15);$core.ctx.stroke();
$core.ctx.strokeStyle=bodyCol;$core.ctx.lineWidth=3;
$core.ctx.beginPath();$core.ctx.moveTo(-3,4);$core.ctx.lineTo(-4+ls*0.5,14);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(3,4);$core.ctx.lineTo(4-ls*0.5,14);$core.ctx.stroke();
const bootL=-4+ls*0.5, bootR=4-ls*0.5;
$core.ctx.fillStyle='#0a0a0a';
$core.ctx.beginPath();$core.ctx.ellipse(bootL,16,4.5,2.6,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(bootR,16,4.5,2.6,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=bodyCol;
$core.ctx.fillRect(-8,-9+breathe,16,15);
$core.ctx.fillStyle=shadowCol;
$core.ctx.fillRect(-8,1+breathe,16,5);
$core.ctx.fillStyle=hiCol;
$core.ctx.fillRect(-8,-9+breathe,16,3);
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=2.5;
$core.ctx.strokeRect(-8,-9+breathe,16,15);
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=5.5;
$core.ctx.beginPath();$core.ctx.moveTo(-8,-4+breathe);$core.ctx.lineTo(-12-ls*0.3,4);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(8,-4+breathe);$core.ctx.lineTo(12+ls*0.3,4);$core.ctx.stroke();
$core.ctx.strokeStyle=bodyCol;$core.ctx.lineWidth=3.5;
$core.ctx.beginPath();$core.ctx.moveTo(-8,-4+breathe);$core.ctx.lineTo(-11-ls*0.3,4);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(7,-4+breathe);$core.ctx.lineTo(11+ls*0.3,4);$core.ctx.stroke();
$core.ctx.fillStyle=skin;
$core.ctx.beginPath();$core.ctx.arc(-11-ls*0.3,4,2.8,0,Math.PI*2);$core.ctx.fill();
const gunLen=e.type==='sniper'?18:10;
$core.ctx.save();$core.ctx.translate(7,0+breathe);
$core.ctx.fillStyle='#1a1a1a';$core.ctx.fillRect(-2,-1.2,4,3.6);
$core.ctx.fillStyle='#333';$core.ctx.fillRect(0,0.2,gunLen,2.2);
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=1;$core.ctx.strokeRect(0,0.2,gunLen,2.2);
$core.ctx.restore();
if(e.type==='sniper'){
$core.ctx.fillStyle='#444';$core.ctx.fillRect(20,-1+breathe,5,4);
$core.ctx.save();
$core.ctx.fillStyle='#00e5ff';
if(!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow){$core.ctx.shadowColor='#00e5ff';$core.ctx.shadowBlur=7;}
$core.ctx.beginPath();$core.ctx.arc(21,breathe,2.2,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
}
const headLook=(e._sprH!==undefined)?e._sprH:Math.sin(wt*0.07+1.3)*2.2;
$core.ctx.fillStyle=skin;
$core.ctx.beginPath();$core.ctx.arc(headLook,-13+breathe,7,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.arc(headLook,-13+breathe,7,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.fillStyle='#111';
$core.ctx.beginPath();$core.ctx.ellipse(-2.3+headLook,-13+breathe,1.6,1.7,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(2.3+headLook,-13+breathe,1.6,1.7,0,0,Math.PI*2);$core.ctx.fill();
if($replay.currentEnv==='mars'){
const hatCol=e.type==='sniper'?'#0d2040':e.type==='heavy'?'#3a1800':'#1e2e10';
$core.ctx.fillStyle='rgba(180,220,255,0.4)';
$core.ctx.beginPath();$core.ctx.arc(headLook,-13+breathe,8,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.arc(headLook,-13+breathe,8,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.strokeStyle='rgba(255,255,255,0.55)';$core.ctx.lineWidth=1.5;
$core.ctx.beginPath();$core.ctx.arc(headLook,-13+breathe,6.2,Math.PI*1.15,Math.PI*1.55);$core.ctx.stroke();
$core.ctx.fillStyle=_darken(hatCol,10);
$core.ctx.fillRect(-6.5+headLook,-8+breathe,13,3.5);
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=1.5;
$core.ctx.strokeRect(-6.5+headLook,-8+breathe,13,3.5);
} else {
const hatCol=e.type==='sniper'?'#0d2040':e.type==='heavy'?'#3a1800':'#1e2e10';
$core.ctx.fillStyle=hatCol;
$core.ctx.beginPath();$core.ctx.arc(headLook,-15.5+breathe,7.2,Math.PI,0);$core.ctx.fill();
$core.ctx.fillRect(-7.2+headLook,-16.5+breathe,14.4,4.5);
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.arc(headLook,-15.5+breathe,7.2,Math.PI,0);$core.ctx.stroke();
$core.ctx.strokeRect(-7.2+headLook,-16.5+breathe,14.4,4.5);
$core.ctx.fillStyle=hiCol;$core.ctx.globalAlpha=0.35;
$core.ctx.fillRect(-6+headLook,-16.5+breathe,14,1.4);
$core.ctx.globalAlpha=1;
}
if(e.type==='soldier'||e.type==='sniper') _soldierIdentity(breathe,headLook,e.type);
}
function _soldierIdentity(breathe,headLook,type){
const g=$core.ctx, ink='#0a0a0a';
g.save();
g.globalCompositeOperation='lighter';
g.fillStyle='rgba(200,230,255,0.75)';
g.fillRect(-3.4+headLook,-13.6+breathe,6.8,1.1);
g.globalAlpha=0.35;
g.fillRect(-3.4+headLook,-14.4+breathe,6.8,2.6);
g.restore();
g.strokeStyle=ink;g.lineWidth=1;
g.beginPath();g.moveTo(-3+headLook,-8.6+breathe);g.lineTo(headLook,-7.6+breathe);g.lineTo(3+headLook,-8.6+breathe);g.stroke();
g.strokeStyle='#3a3a3a';
g.beginPath();g.moveTo(-6,-9+breathe);g.lineTo(-8,-17+breathe);g.stroke();
g.fillStyle='rgba(255,60,40,0.9)';
g.beginPath();g.arc(-8,-17+breathe,1,0,Math.PI*2);g.fill();
g.fillStyle=type==='sniper'?'#88ccff':'#ddaa33';
g.beginPath();
g.moveTo(-7.5,-6+breathe);g.lineTo(-5.5,-8+breathe);g.lineTo(-3.5,-6+breathe);
g.lineTo(-3.5,-5+breathe);g.lineTo(-5.5,-7+breathe);g.lineTo(-7.5,-5+breathe);
g.closePath();g.fill();
g.fillStyle='rgba(0,0,0,0.55)';
g.fillRect(-6,-2+breathe,3,3);g.fillRect(-2,-2+breathe,3,3);g.fillRect(2,-2+breathe,3,3);
g.strokeStyle='rgba(255,255,255,0.12)';g.lineWidth=0.5;
g.strokeRect(-6,-2+breathe,3,3);g.strokeRect(-2,-2+breathe,3,3);g.strokeRect(2,-2+breathe,3,3);
g.fillStyle='#3a3a1a';
g.fillRect(-5.6,11,3,1.4);g.fillRect(2.6,11,3,1.4);
}
function _hvyVisor(){
switch($replay.currentEnv){
case 'night': return '#ff3322';
case 'mars': return '#ff8844';
case 'arctic': return '#aaddff';
case 'spaceship': return '#66ccff';
default: return '#ff5533';
}
}
function _heavyBody(g,ls,bob,headLook,bodyCol,visCol){
const darkCol=_shadeHex(bodyCol,-32), midCol=_shadeHex(bodyCol,-14), hiCol=_shadeHex(bodyCol,22), ink='#0a0a0a';
g.lineCap='round'; g.lineJoin='round';
g.strokeStyle=ink; g.lineWidth=8;
g.beginPath(); g.moveTo(-5,4); g.lineTo(-6+ls*0.4,15); g.stroke();
g.beginPath(); g.moveTo(5,4); g.lineTo(6-ls*0.4,15); g.stroke();
g.strokeStyle=darkCol; g.lineWidth=5.5;
g.beginPath(); g.moveTo(-5,4); g.lineTo(-6+ls*0.4,15); g.stroke();
g.beginPath(); g.moveTo(5,4); g.lineTo(6-ls*0.4,15); g.stroke();
g.fillStyle=midCol;
g.beginPath(); g.ellipse(-6+ls*0.4,10,2.6,2.2,0,0,Math.PI*2); g.fill();
g.beginPath(); g.ellipse(6-ls*0.4,10,2.6,2.2,0,0,Math.PI*2); g.fill();
g.strokeStyle=ink; g.lineWidth=0.9;
g.beginPath(); g.ellipse(-6+ls*0.4,10,2.6,2.2,0,0,Math.PI*2); g.stroke();
g.beginPath(); g.ellipse(6-ls*0.4,10,2.6,2.2,0,0,Math.PI*2); g.stroke();
g.fillStyle='#0a0a0a';
g.beginPath(); g.ellipse(-6+ls*0.4,16,5,2.8,0,0,Math.PI*2); g.fill();
g.beginPath(); g.ellipse(6-ls*0.4,16,5,2.8,0,0,Math.PI*2); g.fill();
const tw=13, th=15;
g.fillStyle=bodyCol; g.fillRect(-tw,-9-bob,tw*2,th);
g.fillStyle=hiCol; g.fillRect(-tw,-9-bob,tw*2,4);
g.fillStyle=darkCol; g.fillRect(-tw,2-bob,tw*2,4);
g.strokeStyle=ink; g.lineWidth=2.5; g.strokeRect(-tw,-9-bob,tw*2,th);
g.fillStyle='rgba(0,0,0,0.55)';
for(let i=0;i<3;i++) g.fillRect(-4,-4-bob+i*3,8,1.6);
g.strokeStyle=darkCol; g.lineWidth=2;
g.beginPath(); g.moveTo(-7,-9-bob); g.lineTo(-3,-2-bob); g.stroke();
g.beginPath(); g.moveTo(7,-9-bob); g.lineTo(3,-2-bob); g.stroke();
g.fillStyle=midCol; g.strokeStyle=ink; g.lineWidth=2;
g.beginPath(); g.moveTo(-13,-8-bob); g.lineTo(-16,-6-bob); g.lineTo(-16,-1-bob); g.lineTo(-13,1-bob); g.closePath(); g.fill(); g.stroke();
g.beginPath(); g.moveTo(13,-8-bob); g.lineTo(16,-6-bob); g.lineTo(16,-1-bob); g.lineTo(13,1-bob); g.closePath(); g.fill(); g.stroke();
g.fillStyle=hiCol;
g.fillRect(-15.5,-5-bob,3,1.4); g.fillRect(12.5,-5-bob,3,1.4);
g.strokeStyle=ink; g.lineWidth=8.5;
g.beginPath(); g.moveTo(-12,-5-bob); g.lineTo(-16,4-bob); g.stroke();
g.beginPath(); g.moveTo(12,-5-bob); g.lineTo(16,4-bob); g.stroke();
g.strokeStyle=darkCol; g.lineWidth=6;
g.beginPath(); g.moveTo(-12,-5-bob); g.lineTo(-16,4-bob); g.stroke();
g.beginPath(); g.moveTo(12,-5-bob); g.lineTo(16,4-bob); g.stroke();
g.fillStyle='#5a5a5a'; g.strokeStyle=ink; g.lineWidth=1;
g.beginPath(); g.arc(-16,4-bob,3,0,Math.PI*2); g.fill(); g.stroke();
g.beginPath(); g.arc(16,4-bob,3,0,Math.PI*2); g.fill(); g.stroke();
g.save(); g.translate(6,-1-bob);
g.fillStyle='#2a1a0a'; g.fillRect(-4,-1,8,3); g.strokeRect(-4,-1,8,3);
g.fillStyle='#2a2a2a'; g.fillRect(2,-2,14,4); g.strokeRect(2,-2,14,4);
g.fillStyle='#111'; g.fillRect(15,-1.2,14,2.4); g.strokeRect(15,-1.2,14,2.4);
g.fillStyle='#333'; g.fillRect(27,-1.8,4,3.6); g.strokeRect(27,-1.8,4,3.6);
g.fillStyle='#3a3a1a'; g.fillRect(3,2,6,5); g.strokeRect(3,2,6,5);
g.strokeStyle='#8a7a30'; g.lineWidth=1;
for(let i=0;i<4;i++){ g.beginPath(); g.moveTo(9+i*1.6,2); g.lineTo(11+i*1.6,7); g.stroke(); }
g.fillStyle='#1a1a1a'; g.fillRect(4,2,2,3);
g.restore();
const hy=-15-bob;
g.fillStyle=darkCol; g.fillRect(-5+headLook,hy+6,10,3);
g.beginPath(); g.arc(headLook,hy,7.5,0,Math.PI*2); g.fill();
g.strokeStyle=ink; g.lineWidth=2; g.stroke();
g.fillStyle='#0a0a0a';
g.beginPath(); g.moveTo(-5.5+headLook,hy-1); g.lineTo(5.5+headLook,hy-1); g.lineTo(4+headLook,hy+3); g.lineTo(-4+headLook,hy+3); g.closePath(); g.fill();
g.save();
g.globalCompositeOperation='lighter'; g.fillStyle=visCol;
g.globalAlpha=0.9; g.fillRect(-4+headLook,hy+0.5,8,1.2);
g.globalAlpha=0.35; g.fillRect(-4+headLook,hy-0.4,8,2.8);
g.restore();
g.strokeStyle='#3a3a3a'; g.lineWidth=1;
g.beginPath(); g.moveTo(-6+headLook,hy-2); g.lineTo(-9+headLook,hy-12); g.stroke();
g.fillStyle='rgba(255,60,40,0.9)';
g.beginPath(); g.arc(-9+headLook,hy-12,1.2,0,Math.PI*2); g.fill();
g.fillStyle='rgba(0,0,0,0.5)'; g.fillRect(-tw+1,-4-bob,2,5);
}
const _hvySprites=new Map();
const _HVY_S=$core.lowMemTier?1:1.25, _HVY_CAP=$core.lowMemTier?120:300, _HVY_X=24, _HVY_Y=34, _HVY_W=64, _HVY_H=56;
function _drawHeavyLive(e,facing){
const g=$core.ctx, wt=e.walkT||0;
g.save();
try{
g.rotate(facing);
_heavyBody(g,_gaitSin(wt)*4.5,Math.abs(Math.sin(wt*1.6))*1.2,Math.sin(wt*0.07+1.1)*1.6,e.col||'#c8621a',_hvyVisor());
}finally{ g.restore(); }
}
function _drawHeavyCached(e,facing){
const TAU=Math.PI*2, wt=e.walkT||0;
const li=Math.round((((wt%TAU)+TAU)%TAU)/TAU*12)%12;
const bq=Math.round(Math.abs(Math.sin(wt*1.6))*2);
const hq=Math.round(Math.sin(wt*0.07+1.1)*1.6);
const col=e.col||'#c8621a', vis=_hvyVisor();
const key=col+'|'+vis+'|'+li+'|'+bq+'|'+hq;
let spr=_hvySprites.get(key);
if(!spr){
if(_hvySprites.size>_HVY_CAP) _hvySprites.clear();
spr=document.createElement('canvas');
spr.width=Math.ceil(_HVY_W*_HVY_S); spr.height=Math.ceil(_HVY_H*_HVY_S);
const oc=spr.getContext('2d');
oc.scale(_HVY_S,_HVY_S); oc.translate(_HVY_X,_HVY_Y);
_heavyBody(oc,_gaitSin(li*TAU/12)*4.5,bq*0.6,hq,col,vis);
_hvySprites.set(key,spr);
}
const c=$core.ctx;
c.rotate(facing);
c.drawImage(spr,-_HVY_X,-_HVY_Y,_HVY_W,_HVY_H);
}
const _solSprites = new Map();
const _SOL_S = $core.lowMemTier?1:1.25, _SOL_CAP = $core.lowMemTier?160:400, _SOL_X = 20, _SOL_Y = 28, _SOL_W = 52, _SOL_H = 52;
function _solUseCache(){
return window._PERF_FIXES !== false && !_solBroken && ($core.isLowEndDesktop || $core.isUltraLow || $core.isMobile || $buildings.settingPerfMode || $buildings._dqsQuality < 0.5);
}
let _solBroken = false;
function drawSoldier(e,facing){
if(e.type==='heavy'){
try{ if(_solUseCache()) _drawHeavyCached(e,facing); else _drawHeavyLive(e,facing); return; }
catch(err){ console.warn('heavy renderer failed, falling back:', err); }
}
if(!_solUseCache()) return _drawSoldierRaw(e,facing);
try{ _drawSoldierCached(e,facing); }catch(err){ _solBroken = true; console.warn('soldier cache disabled:', err); _drawSoldierRaw(e,facing); }
}
function _drawSoldierCached(e,facing){
const TAU = Math.PI*2;
const wt = e.walkT || 0;
const li = Math.round((((wt % TAU) + TAU) % TAU) / TAU * 12) % 12;
const bb = Math.round(Math.sin(wt*0.18));
const hb = Math.round(Math.sin(wt*0.07+1.3));
const key = e.col+'|'+e.type+'|'+($replay.currentEnv==='mars'?1:0)+'|'+li+'|'+bb+'|'+hb;
let spr = _solSprites.get(key);
if(!spr){
if(_solSprites.size > _SOL_CAP) _solSprites.clear();
spr = document.createElement('canvas');
spr.width = Math.ceil(_SOL_W*_SOL_S); spr.height = Math.ceil(_SOL_H*_SOL_S);
const oc = spr.getContext('2d');
oc.scale(_SOL_S,_SOL_S); oc.translate(_SOL_X,_SOL_Y);
const real = $core.ctx;
$core.ctx = oc;
try{ _drawSoldierRaw({col:e.col, type:e.type, walkT:li*TAU/12, _sprB:bb*1.1, _sprH:hb*2.2}, 0); }
finally{ $core.ctx = real; }
_solSprites.set(key, spr);
}
const c = $core.ctx;
c.lineCap='round'; c.lineJoin='round';
c.rotate(facing);
c.drawImage(spr, -_SOL_X, -_SOL_Y, _SOL_W, _SOL_H);
}
function drawAlienGrunt(e,facing){
$core.ctx.rotate(facing);
const wt=e.walkT, ls=_gaitSin(wt)*6;
const bob=Math.sin(wt*0.22)*1.4;
const bodyCol=e.col;
const isBrute=e.type==='heavy';
const isStalker=e.type==='sniper';
const ink='#0a0a0a';
$core.ctx.lineCap='round';
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=(isBrute?4:3)+2;
$core.ctx.beginPath();$core.ctx.moveTo(-5,3);$core.ctx.lineTo(-8+ls*0.6,14);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(5,3);$core.ctx.lineTo(8-ls*0.6,14);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(-3,5);$core.ctx.lineTo(-5+ls*0.4,13);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(3,5);$core.ctx.lineTo(5-ls*0.4,13);$core.ctx.stroke();
$core.ctx.strokeStyle=_darken(bodyCol,30);$core.ctx.lineWidth=isBrute?4:3;
$core.ctx.beginPath();$core.ctx.moveTo(-5,3);$core.ctx.lineTo(-8+ls*0.6,14);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(5,3);$core.ctx.lineTo(8-ls*0.6,14);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(-3,5);$core.ctx.lineTo(-5+ls*0.4,13);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(3,5);$core.ctx.lineTo(5-ls*0.4,13);$core.ctx.stroke();
const tw=isBrute?11:isStalker?7:9, th=isBrute?16:isStalker?18:13;
$core.ctx.fillStyle=bodyCol;
$core.ctx.beginPath();$core.ctx.ellipse(0,-2+bob,tw,th,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=_darken(bodyCol,26);
$core.ctx.beginPath();$core.ctx.ellipse(tw*0.2,th*0.35-2+bob,tw*0.72,th*0.62,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=_lighten(bodyCol,20);
$core.ctx.beginPath();$core.ctx.ellipse(-tw*0.25,-th*0.4-2+bob,tw*0.4,th*0.28,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=2.5;
$core.ctx.beginPath();$core.ctx.ellipse(0,-2+bob,tw,th,0,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=5;
$core.ctx.beginPath();$core.ctx.moveTo(-tw,-4+bob);$core.ctx.lineTo(-tw-7,3);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(tw,-4+bob);$core.ctx.lineTo(tw+7,3);$core.ctx.stroke();
$core.ctx.strokeStyle=bodyCol;$core.ctx.lineWidth=3;
$core.ctx.beginPath();$core.ctx.moveTo(-tw,-4+bob);$core.ctx.lineTo(-tw-7,3);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(tw,-4+bob);$core.ctx.lineTo(tw+7,3);$core.ctx.stroke();
$core.ctx.fillStyle=_darken(bodyCol,20);
$core.ctx.beginPath();$core.ctx.moveTo(tw+7,3);$core.ctx.lineTo(tw+11,0);$core.ctx.lineTo(tw+11,6);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=1.5;$core.ctx.stroke();
if(isStalker){
$core.ctx.save();
$core.ctx.fillStyle='#66ffcc';
if(!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow){$core.ctx.shadowColor='#66ffcc';$core.ctx.shadowBlur=6;}
$core.ctx.beginPath();$core.ctx.arc(tw+9,3,2,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
}
const headLook=Math.sin(wt*0.07+1.1)*2;
const hy=-th-4+bob;
$core.ctx.fillStyle=_darken(bodyCol,10);
$core.ctx.beginPath();$core.ctx.ellipse(headLook,hy,5,7,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=_darken(bodyCol,28);
$core.ctx.beginPath();$core.ctx.ellipse(headLook+1.2,hy+2,3.4,4.4,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.ellipse(headLook,hy,5,7,0,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.fillStyle='#0aff88';
if(!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow){$core.ctx.shadowColor='#0aff88';$core.ctx.shadowBlur=5;}
$core.ctx.beginPath();$core.ctx.ellipse(-2.2+headLook,hy,1.6,1,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(2.2+headLook,hy,1.6,1,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.shadowBlur=0;
}
function drawArcticBeast(e,facing){
$core.ctx.rotate(facing);
const wt=e.walkT, ls=_gaitSin(wt)*7;
const bob=Math.sin(wt*0.2)*1.2;
const bodyCol=e.col;
const isBig=e.type==='heavy';
const ink='#0a0a0a';
$core.ctx.lineCap='round';
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=(isBig?6:4.5)+2;
$core.ctx.beginPath();$core.ctx.moveTo(-4,4);$core.ctx.lineTo(-5+ls*0.5,15);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(4,4);$core.ctx.lineTo(5-ls*0.5,15);$core.ctx.stroke();
$core.ctx.strokeStyle=_darken(bodyCol,35);$core.ctx.lineWidth=isBig?6:4.5;
$core.ctx.beginPath();$core.ctx.moveTo(-4,4);$core.ctx.lineTo(-5+ls*0.5,15);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(4,4);$core.ctx.lineTo(5-ls*0.5,15);$core.ctx.stroke();
const tw=isBig?13:9, th=isBig?15:11;
$core.ctx.fillStyle=bodyCol;
$core.ctx.beginPath();$core.ctx.ellipse(0,-3+bob,tw,th,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=_darken(bodyCol,24);
$core.ctx.beginPath();$core.ctx.ellipse(tw*0.2,th*0.35-3+bob,tw*0.7,th*0.6,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=2.5;
$core.ctx.beginPath();$core.ctx.ellipse(0,-3+bob,tw,th,0,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.fillStyle='rgba(220,245,255,0.85)';
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=1;
for(let i=-1;i<=1;i++){
$core.ctx.beginPath();
$core.ctx.moveTo(i*4,-th+2+bob);$core.ctx.lineTo(i*4-2,-th-6+bob);$core.ctx.lineTo(i*4+2,-th+2+bob);
$core.ctx.closePath();$core.ctx.fill();$core.ctx.stroke();
}
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=(isBig?4:3)+2;
$core.ctx.beginPath();$core.ctx.moveTo(-tw,-4+bob);$core.ctx.lineTo(-tw-6,4);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(tw,-4+bob);$core.ctx.lineTo(tw+6,4);$core.ctx.stroke();
$core.ctx.strokeStyle=bodyCol;$core.ctx.lineWidth=isBig?4:3;
$core.ctx.beginPath();$core.ctx.moveTo(-tw,-4+bob);$core.ctx.lineTo(-tw-6,4);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(tw,-4+bob);$core.ctx.lineTo(tw+6,4);$core.ctx.stroke();
$core.ctx.fillStyle='rgba(230,250,255,0.9)';
$core.ctx.beginPath();$core.ctx.moveTo(tw+6,4);$core.ctx.lineTo(tw+10,1);$core.ctx.lineTo(tw+9,7);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=1.2;$core.ctx.stroke();
const headLook=Math.sin(wt*0.07+0.9)*2;
const hy=-th-3+bob;
$core.ctx.fillStyle=_darken(bodyCol,8);
$core.ctx.beginPath();$core.ctx.ellipse(headLook,hy,6,6,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=_darken(bodyCol,26);
$core.ctx.beginPath();$core.ctx.ellipse(headLook+1.4,hy+1.4,3.8,3.8,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.ellipse(headLook,hy,6,6,0,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.fillStyle='#8fe8ff';
if(!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow){$core.ctx.shadowColor='#8fe8ff';$core.ctx.shadowBlur=6;}
$core.ctx.beginPath();$core.ctx.ellipse(-2+headLook,hy,1.5,1.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(2+headLook,hy,1.5,1.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.shadowBlur=0;
}
function drawBerserker(e,facing){
$core.ctx.rotate(facing);
const wt=e.walkT, ls=_gaitSin(wt)*10;
const breathe=Math.sin(wt*0.18)*1.3;
const headLook=Math.sin(wt*0.07+0.6)*1.8;
const ink='#0a0a0a';
$core.ctx.shadowColor='#ff0000';$core.ctx.shadowBlur=(10)*$core.SHADOW;
$core.ctx.lineCap='round';
$core.ctx.strokeStyle='#1a0000';$core.ctx.lineWidth=5;
$core.ctx.beginPath();$core.ctx.moveTo(-4,4);$core.ctx.lineTo(-6+ls*0.5,17);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(4,4);$core.ctx.lineTo(6-ls*0.5,17);$core.ctx.stroke();
$core.ctx.fillStyle='#1a0000';
$core.ctx.beginPath();$core.ctx.ellipse(-6+ls*0.5,17,4.5,2.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(6-ls*0.5,17,4.5,2.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#6a0000';$core.ctx.fillRect(-8,-9+breathe,16,14);
$core.ctx.fillStyle='rgba(255,0,0,0.15)';$core.ctx.fillRect(-8,-9+breathe,16,4);
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=2.5;
$core.ctx.strokeRect(-8,-9+breathe,16,14);
$core.ctx.strokeStyle='#3a0000';$core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.moveTo(-2,-9+breathe);$core.ctx.lineTo(-2,5+breathe);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(2,-9+breathe);$core.ctx.lineTo(2,5+breathe);$core.ctx.stroke();
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=7.5;
$core.ctx.beginPath();$core.ctx.moveTo(-8,-4+breathe);$core.ctx.lineTo(-13+ls*0.5,5);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(8,-4+breathe);$core.ctx.lineTo(13-ls*0.5,5);$core.ctx.stroke();
$core.ctx.strokeStyle='#6a0000';$core.ctx.lineWidth=5.5;
$core.ctx.beginPath();$core.ctx.moveTo(-8,-4+breathe);$core.ctx.lineTo(-13+ls*0.5,5);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(8,-4+breathe);$core.ctx.lineTo(13-ls*0.5,5);$core.ctx.stroke();
$core.ctx.save();$core.ctx.translate(13-ls*0.5,5);
$core.ctx.fillStyle='#888';$core.ctx.fillRect(0,-2,12,4);
$core.ctx.fillStyle='#aaa';$core.ctx.beginPath();$core.ctx.moveTo(10,-7);$core.ctx.lineTo(16,0);$core.ctx.lineTo(10,7);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=1.5;$core.ctx.stroke();
$core.ctx.restore();
if(((wt*10)|0)%2===0){
$core.ctx.save();$core.ctx.globalAlpha=0.2+_gaitSin(wt)*0.15;$core.ctx.fillStyle='#ff0000';
$core.ctx.beginPath();$core.ctx.arc(0,-2,13,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
}
$core.ctx.shadowColor='#ff0000';$core.ctx.shadowBlur=(8)*$core.SHADOW;
$core.ctx.fillStyle='#c8a070';$core.ctx.beginPath();$core.ctx.ellipse(headLook,-15+breathe,6,7,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=2;$core.ctx.stroke();
$core.ctx.fillStyle='#ff2200';
$core.ctx.beginPath();$core.ctx.ellipse(-2.5+headLook,-15+breathe,2,2,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(2.5+headLook,-15+breathe,2,2,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#1a0000';$core.ctx.beginPath();$core.ctx.arc(headLook,-17+breathe,7,Math.PI,0);$core.ctx.fill();
$core.ctx.fillRect(-7+headLook,-18+breathe,14,4);
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.arc(headLook,-17+breathe,7,Math.PI,0);$core.ctx.stroke();
$core.ctx.strokeRect(-7+headLook,-18+breathe,14,4);
}
function drawShieldCarrier(e,facing){
$core.ctx.rotate(facing);
const wt=e.walkT, ls=_gaitSin(wt)*6;
const breathe=Math.sin(wt*0.18)*1.0;
const headLook=Math.sin(wt*0.07+2.1)*1.6;
const ink='#0a0a0a';
$core.ctx.lineCap='round';
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=6;
$core.ctx.beginPath();$core.ctx.moveTo(-3,4);$core.ctx.lineTo(-4+ls*0.5,16);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(3,4);$core.ctx.lineTo(4-ls*0.5,16);$core.ctx.stroke();
$core.ctx.strokeStyle='#0d1a2a';$core.ctx.lineWidth=4;
$core.ctx.beginPath();$core.ctx.moveTo(-3,4);$core.ctx.lineTo(-4+ls*0.5,16);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(3,4);$core.ctx.lineTo(4-ls*0.5,16);$core.ctx.stroke();
$core.ctx.fillStyle='#111';
$core.ctx.beginPath();$core.ctx.ellipse(-4+ls*0.5,16,4,2,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(4-ls*0.5,16,4,2,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#2a4a6a';$core.ctx.fillRect(-7,-8+breathe,14,14);
$core.ctx.fillStyle='rgba(0,0,0,0.35)';$core.ctx.fillRect(-7,-8+breathe,14,4);
$core.ctx.fillStyle='rgba(100,180,255,0.1)';$core.ctx.fillRect(-5,-4+breathe,3,4);$core.ctx.fillRect(2,-4+breathe,3,4);
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=2.5;
$core.ctx.strokeRect(-7,-8+breathe,14,14);
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=6;
$core.ctx.beginPath();$core.ctx.moveTo(-7,-4+breathe);$core.ctx.lineTo(-11+ls*0.3,4);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(7,-4+breathe);$core.ctx.lineTo(11-ls*0.3,4);$core.ctx.stroke();
$core.ctx.strokeStyle='#2a4a6a';$core.ctx.lineWidth=4;
$core.ctx.beginPath();$core.ctx.moveTo(-7,-4+breathe);$core.ctx.lineTo(-11+ls*0.3,4);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(7,-4+breathe);$core.ctx.lineTo(11-ls*0.3,4);$core.ctx.stroke();
$core.ctx.fillStyle='#c8a070';
$core.ctx.beginPath();$core.ctx.arc(-11+ls*0.3,4,2.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#333';$core.ctx.fillRect(8,0+breathe,7,2.5);
$core.ctx.save();
$core.ctx.translate(-8+ls*0.2, -2);
$core.ctx.fillStyle='rgba(0,0,0,0.45)';
$core.ctx.fillRect(2,-14,14,26);
$core.ctx.fillStyle='#3a77b3';
$core.ctx.fillRect(0,-14,12,26);
$core.ctx.fillStyle='#7fb8e0';
$core.ctx.fillRect(0,-14,5,26);
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=2;
$core.ctx.strokeRect(0,-14,12,26);
$core.ctx.fillStyle='rgba(0,180,255,0.3)';$core.ctx.fillRect(2,-10,8,6);
$core.ctx.strokeStyle='rgba(0,220,255,0.6)';$core.ctx.lineWidth=0.8;$core.ctx.strokeRect(2,-10,8,6);
if(!$core.isMobile){
$core.ctx.shadowColor='#44aaff';$core.ctx.shadowBlur=8;
$core.ctx.strokeStyle='rgba(68,170,255,0.45)';$core.ctx.lineWidth=2;
$core.ctx.strokeRect(-1,-15,14,28);
$core.ctx.shadowBlur=0;
}
$core.ctx.restore();
$core.ctx.fillStyle='#c8a070';
$core.ctx.beginPath();$core.ctx.ellipse(headLook,-13+breathe,5.5,6.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=2;$core.ctx.stroke();
$core.ctx.fillStyle='#222';
$core.ctx.beginPath();$core.ctx.ellipse(-2+headLook,-13+breathe,1.5,1.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(2+headLook,-13+breathe,1.5,1.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#0d2040';
$core.ctx.beginPath();$core.ctx.arc(headLook,-15+breathe,6.5,Math.PI,0);$core.ctx.fill();
$core.ctx.fillRect(-6.5+headLook,-16+breathe,13,4);
$core.ctx.strokeStyle=ink;$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.arc(headLook,-15+breathe,6.5,Math.PI,0);$core.ctx.stroke();
$core.ctx.strokeRect(-6.5+headLook,-16+breathe,13,4);
$core.ctx.fillStyle='rgba(0,0,0,0.4)';$core.ctx.fillRect(-7+headLook,-12+breathe,14,2);
$core.ctx.fillStyle='rgba(0,180,255,0.4)';$core.ctx.fillRect(-5+headLook,-16+breathe,10,3);
}
function bomberDetonate(e){
const bx=e.x, by=e.y;
shake(10,$buildings.player.x-bx,$buildings.player.y-by); audioManager.explosion();
for(let i=0;i<28;i++) ptclQ(bx,by,'#ff6600',1,5+Math.random()*5);
for(let i=0;i<10;i++) ptcl(bx,by,'#ffcc00',1,3+Math.random()*4);
$buildings.debrisArr.push({x:bx,y:by,r:70,life:22,maxLife:22,col:'#ff6600'});
vibrate([60,30,80]);
const R=70;
const pd=Math.hypot($buildings.player.x-bx,$buildings.player.y-by);
if(pd<R){
const dmg=Math.ceil(18*(1-pd/R));
if($buildings.player.shield>0){$buildings.player.shield=Math.max(0,$buildings.player.shield-dmg*25);}
else{$buildings.player.hp-=dmg;updateHP();if(!$core.isVeryLow){if($buildings.settingPerfMode){$buildings._cvFlashColor='rgba(255,0,0,0.16)';$buildings._cvFlash=5;}else{$replay.dFlash.style.opacity='0.5';setTimeout(()=>$replay.dFlash.style.opacity='0',120);}}if($buildings.player.hp<=0)triggerPlayerDeath('bomber');}
if(pd>0){const pa=Math.atan2($buildings.player.y-by,$buildings.player.x-bx);const knk=18*(1-pd/R);const nx2=$buildings.player.x+Math.cos(pa)*knk,ny2=$buildings.player.y+Math.sin(pa)*knk;if(!onBuilding(nx2,ny2,8)){$buildings.player.x=nx2;$buildings.player.y=ny2;}}
}
if($replay.coopEnabled&&$replay.player2&&!$replay.p2Down){
const pd2=Math.hypot($replay.player2.x-bx,$replay.player2.y-by);
if(pd2<R){
const dmg2=Math.ceil(18*(1-pd2/R));
if($replay.player2.shield>0){$replay.player2.shield=Math.max(0,$replay.player2.shield-dmg2*25);}
else{
$replay.player2.hp-=dmg2;
if($replay.player2.hp<=0) triggerP2Down();
}
if(pd2>0){const pa2=Math.atan2($replay.player2.y-by,$replay.player2.x-bx);const knk2=18*(1-pd2/R);const nx3=$replay.player2.x+Math.cos(pa2)*knk2,ny3=$replay.player2.y+Math.sin(pa2)*knk2;if(!onBuilding(nx3,ny3,8)){$replay.player2.x=nx3;$replay.player2.y=ny3;}}
updateCoopHUD();
}
}
$buildings.enemies.forEach(en=>{
if(en===e||!en.alive)return;
const de=Math.hypot(en.x-bx,en.y-by);
if(de<R){en.hp-=Math.ceil(3*(1-de/R));if(en.hp<=0)killEnemy(en);}
});
}
function drawElite(e,facing){
$core.ctx.rotate(facing);
const wt=e.walkT;
const pulse=0.7+Math.sin($buildings.tick*0.18+e.x*0.02)*0.3;
const breathe=Math.sin(wt*0.18)*1.0;
const headLook=Math.sin(wt*0.07+3.4)*1.7;
if(!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow){ $core.ctx.shadowColor='#cc44ff'; $core.ctx.shadowBlur=12; }
$core.ctx.lineCap='round';
$core.ctx.strokeStyle='#1a0030';$core.ctx.lineWidth=5;
$core.ctx.beginPath();$core.ctx.moveTo(-4,8);$core.ctx.lineTo(-5+_gaitSin(wt)*6,20);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(4,8);$core.ctx.lineTo(5-_gaitSin(wt)*6,20);$core.ctx.stroke();
$core.ctx.fillStyle='#0d001a';$core.ctx.beginPath();$core.ctx.ellipse(-5+_gaitSin(wt)*6,20,4,2.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(5-_gaitSin(wt)*6,20,4,2.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#1a0a2e';$core.ctx.fillRect(-10,-10+breathe,20,20);
$core.ctx.fillStyle='rgba(180,80,255,0.18)';$core.ctx.fillRect(-10,-10+breathe,20,6);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2.5;
$core.ctx.strokeRect(-10,-10+breathe,20,20);
$core.ctx.strokeStyle='rgba(180,80,255,0.5)';$core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.moveTo(-10,-4+breathe);$core.ctx.lineTo(10,-4+breathe);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(-10,4+breathe);$core.ctx.lineTo(10,4+breathe);$core.ctx.stroke();
$core.ctx.fillStyle=`rgba(180,80,255,${0.6+pulse*0.4})`;
$core.ctx.beginPath();$core.ctx.arc(0,-1+breathe,3.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#ffffff';$core.ctx.beginPath();$core.ctx.arc(0,-1+breathe,1.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.save();$core.ctx.rotate(-_gaitSin(wt)*0.06-0.1);$core.ctx.strokeStyle='#1a0a2e';$core.ctx.lineWidth=7;
$core.ctx.beginPath();$core.ctx.moveTo(-9,-3);$core.ctx.lineTo(-15+_gaitSin(wt)*3,7);$core.ctx.stroke();
$core.ctx.fillStyle='#c8a070';$core.ctx.beginPath();$core.ctx.arc(-15+_gaitSin(wt)*3,7,4,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
drawWeaponOnPlayer&&drawWeaponOnPlayer();
$core.ctx.save();$core.ctx.rotate(_gaitSin(wt)*0.06);$core.ctx.strokeStyle='#1a0a2e';$core.ctx.lineWidth=7;
$core.ctx.beginPath();$core.ctx.moveTo(9,-3);$core.ctx.lineTo(17,-_gaitSin(wt)*2);$core.ctx.stroke();
$core.ctx.fillStyle='#c8a070';$core.ctx.beginPath();$core.ctx.arc(17,-_gaitSin(wt)*2,4,0,Math.PI*2);$core.ctx.fill();$core.ctx.restore();
$core.ctx.fillStyle='#c8a070';$core.ctx.beginPath();$core.ctx.ellipse(headLook,-17+breathe,5.5,6.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.stroke();
$core.ctx.fillStyle='#0d001a';$core.ctx.beginPath();$core.ctx.arc(headLook,-19+breathe,7,Math.PI,0);$core.ctx.fill();$core.ctx.fillRect(-7+headLook,-20+breathe,14,4);
$core.ctx.fillStyle=`rgba(180,80,255,${0.55+pulse*0.35})`;$core.ctx.fillRect(-6+headLook,-20+breathe,12,3);
$core.ctx.fillStyle='#ff44ff';$core.ctx.beginPath();$core.ctx.arc(-2+headLook,-19+breathe,1.2,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.arc(2+headLook,-19+breathe,1.2,0,Math.PI*2);$core.ctx.fill();
if(!$core.isMobile && e._rallyTimer>180){
$core.ctx.save();$core.ctx.globalAlpha=0.3;
$core.ctx.strokeStyle='#cc44ff';$core.ctx.lineWidth=2;
$core.ctx.setLineDash([6,4]);
$core.ctx.beginPath();$core.ctx.arc(0,0,24,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.setLineDash([]);$core.ctx.restore();
}
}
function drawBomber(e,facing){
$core.ctx.rotate(facing);
const wt=e.walkT;
const distToPlayer=Math.hypot($buildings.player.x-e.x,$buildings.player.y-e.y);
const blink=distToPlayer<80&&Math.sin($buildings.tick*0.4)>0;
$core.ctx.shadowColor='#ff4400';$core.ctx.shadowBlur=(blink?28:8)*$core.SHADOW;
$core.ctx.lineCap='round';
$core.ctx.strokeStyle='#3a1400';$core.ctx.lineWidth=4;
$core.ctx.beginPath();$core.ctx.moveTo(-3,3);$core.ctx.lineTo(-4+_gaitSin(wt)*7,14);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(3,3);$core.ctx.lineTo(4-_gaitSin(wt)*7,14);$core.ctx.stroke();
$core.ctx.fillStyle=blink?'#ff2200':'#cc4400';$core.ctx.fillRect(-8,-9,16,13);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2.5;
$core.ctx.strokeRect(-8,-9,16,13);
$core.ctx.fillStyle='#ffcc00';
$core.ctx.fillRect(-7,-8,4,4);$core.ctx.fillRect(3,-8,4,4);$core.ctx.fillRect(-7,0,4,4);$core.ctx.fillRect(3,0,4,4);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=1;
$core.ctx.strokeRect(-7,-8,4,4);$core.ctx.strokeRect(3,-8,4,4);$core.ctx.strokeRect(-7,0,4,4);$core.ctx.strokeRect(3,0,4,4);
$core.ctx.strokeStyle='#ff0000';$core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.moveTo(-5,-4);$core.ctx.lineTo(5,-4);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(-5,2);$core.ctx.lineTo(5,2);$core.ctx.stroke();
$core.ctx.strokeStyle='#cc4400';$core.ctx.lineWidth=4;
$core.ctx.beginPath();$core.ctx.moveTo(-8,-4);$core.ctx.lineTo(-13+_gaitSin(wt)*4,4);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(8,-4);$core.ctx.lineTo(13-_gaitSin(wt)*4,4);$core.ctx.stroke();
$core.ctx.fillStyle='#c8a070';$core.ctx.beginPath();$core.ctx.ellipse(0,-15,5,6,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.stroke();
$core.ctx.fillStyle=blink?'#ff0000':'#2a0a00';$core.ctx.beginPath();$core.ctx.arc(0,-17,6,Math.PI,0);$core.ctx.fill();
$core.ctx.fillRect(-6,-18,12,4);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.arc(0,-17,6,Math.PI,0);$core.ctx.stroke();
$core.ctx.strokeRect(-6,-18,12,4);
$core.ctx.fillStyle=blink?'#ff4400':'#ff2200';$core.ctx.shadowColor='#ff0000';$core.ctx.shadowBlur=(6)*$core.SHADOW;
$core.ctx.beginPath();$core.ctx.ellipse(-2,-15,1.5,1.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(2,-15,1.5,1.5,0,0,Math.PI*2);$core.ctx.fill();
}
function drawGhost(e,facing){
$core.ctx.rotate(facing);
const wt=e.walkT, ls=_gaitSin(wt)*8;
const pulse=0.6+Math.sin($buildings.tick*0.12+e.x*0.03)*0.4;
const breathe=Math.sin(wt*0.18)*1.0;
const headLook=Math.sin(wt*0.07+4.7)*1.6;
$core.ctx.shadowColor='#aaddff';$core.ctx.shadowBlur=(14+pulse*8)*$core.SHADOW;
$core.ctx.lineCap='round';
$core.ctx.strokeStyle='rgba(150,200,255,0.7)';$core.ctx.lineWidth=3;
$core.ctx.beginPath();$core.ctx.moveTo(-3,4);$core.ctx.lineTo(-4+ls*0.5,15);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(3,4);$core.ctx.lineTo(4-ls*0.5,15);$core.ctx.stroke();
$core.ctx.fillStyle='rgba(100,160,230,0.55)';
$core.ctx.beginPath();$core.ctx.ellipse(0,-1+breathe,9,13,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=`rgba(180,220,255,${0.2+pulse*0.15})`;
$core.ctx.beginPath();$core.ctx.ellipse(0,-3+breathe,5,8,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='rgba(150,200,255,0.5)';$core.ctx.lineWidth=3;
$core.ctx.beginPath();$core.ctx.moveTo(-8,-2);$core.ctx.lineTo(-12+ls*0.3,5);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(8,-2);$core.ctx.lineTo(12-ls*0.3,5);$core.ctx.stroke();
$core.ctx.fillStyle='rgba(120,180,255,0.6)';$core.ctx.fillRect(8,0,9,2);
$core.ctx.fillStyle='rgba(200,230,255,0.65)';
$core.ctx.beginPath();$core.ctx.ellipse(headLook,-15+breathe,5.5,6,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='rgba(0,20,60,0.9)';
$core.ctx.beginPath();$core.ctx.ellipse(-2+headLook,-15+breathe,2,2.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(2+headLook,-15+breathe,2,2.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=`rgba(100,200,255,${0.5+pulse*0.5})`;
$core.ctx.beginPath();$core.ctx.arc(-2+headLook,-15+breathe,1,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.arc(2+headLook,-15+breathe,1,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='rgba(80,130,200,0.45)';
$core.ctx.beginPath();$core.ctx.arc(headLook,-17+breathe,6.5,Math.PI,0);$core.ctx.fill();
$core.ctx.fillRect(-6.5+headLook,-18+breathe,13,4);
}
function drawJuggernaut(e,facing){
$core.ctx.rotate(facing);
const wt=e.walkT, ls=_gaitSin(wt)*5;
if(!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow){ $core.ctx.shadowColor='#ff6600'; $core.ctx.shadowBlur=8; }
$core.ctx.lineCap='round';
$core.ctx.strokeStyle='#2a1200';$core.ctx.lineWidth=9;
$core.ctx.beginPath();$core.ctx.moveTo(-6,8);$core.ctx.lineTo(-8+ls*0.4,24);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(6,8);$core.ctx.lineTo(8-ls*0.4,24);$core.ctx.stroke();
$core.ctx.fillStyle='#1a0a00';
$core.ctx.beginPath();$core.ctx.ellipse(-8+ls*0.4,24,7,3.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(8-ls*0.4,24,7,3.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#3a2200';$core.ctx.fillRect(-13,-12,26,22);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=3;
$core.ctx.strokeRect(-13,-12,26,22);
$core.ctx.fillStyle='#5a3800';$core.ctx.fillRect(-11,-10,22,10);
$core.ctx.strokeStyle='rgba(0,0,0,0.5)';$core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.moveTo(-8,-8);$core.ctx.lineTo(-4,-2);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(4,-8);$core.ctx.lineTo(8,-3);$core.ctx.stroke();
$core.ctx.fillStyle='#4a2a00';
$core.ctx.beginPath();$core.ctx.ellipse(-15,-6,6,5,0.3,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(15,-6,6,5,-0.3,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#3a2200';$core.ctx.lineWidth=8;
$core.ctx.beginPath();$core.ctx.moveTo(-13,-5);$core.ctx.lineTo(-17+ls*0.3,7);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(13,-5);$core.ctx.lineTo(17-ls*0.3,7);$core.ctx.stroke();
$core.ctx.fillStyle='#5a3000';
$core.ctx.beginPath();$core.ctx.arc(-17+ls*0.3,7,4.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.save();$core.ctx.translate(17-ls*0.3,7);
$core.ctx.fillStyle='#444';$core.ctx.fillRect(0,-4,20,8);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2;$core.ctx.strokeRect(0,-4,20,8);
$core.ctx.fillStyle='#333';$core.ctx.fillRect(18,-3,6,6);
for(let r=2;r<18;r+=5){ $core.ctx.strokeStyle='#555';$core.ctx.lineWidth=1.5;$core.ctx.beginPath();$core.ctx.arc(r+1,0,4,0,Math.PI*2);$core.ctx.stroke(); }
$core.ctx.restore();
$core.ctx.save();$core.ctx.globalAlpha=0.4+Math.sin($buildings.tick*0.15)*0.25;
$core.ctx.fillStyle='#ff6600';
$core.ctx.fillRect(-3,-12,6,4);
$core.ctx.restore();
$core.ctx.fillStyle='#4a2a00';$core.ctx.fillRect(-5,-16,10,6);
$core.ctx.fillStyle='#2a1500';
$core.ctx.beginPath();$core.ctx.ellipse(0,-21,8,9,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=2.5;$core.ctx.stroke();
$core.ctx.fillStyle='rgba(255,120,0,0.85)';
$core.ctx.fillRect(-6,-22,12,4);
$core.ctx.fillStyle='#555';
$core.ctx.beginPath();$core.ctx.arc(-7,-20,1.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.arc(7,-20,1.5,0,Math.PI*2);$core.ctx.fill();
}
function drawPhantom(e,facing){
$core.ctx.rotate(facing);
const wt=e.walkT, ls=_gaitSin(wt)*9;
const pulse=0.7+Math.sin($buildings.tick*0.22+e.y*0.02)*0.3;
const breathe=Math.sin(wt*0.18)*1.0;
const headLook=Math.sin(wt*0.07+5.9)*1.6;
if(!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow){ $core.ctx.shadowColor='#ff44ff'; $core.ctx.shadowBlur=10; }
$core.ctx.lineCap='round';
$core.ctx.strokeStyle='#1a001a';$core.ctx.lineWidth=4;
$core.ctx.beginPath();$core.ctx.moveTo(-3,4);$core.ctx.lineTo(-4+ls*0.5,16);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(3,4);$core.ctx.lineTo(4-ls*0.5,16);$core.ctx.stroke();
$core.ctx.fillStyle='#0d000d';
$core.ctx.beginPath();$core.ctx.ellipse(-4+ls*0.5,16,4,2,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(4-ls*0.5,16,4,2,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#1a001a';$core.ctx.fillRect(-8,-10+breathe,16,18);
$core.ctx.fillStyle=`rgba(255,60,255,${0.1+pulse*0.1})`;$core.ctx.fillRect(-8,-10+breathe,16,18);
$core.ctx.strokeStyle='#0a0a0a';$core.ctx.lineWidth=1.5;
$core.ctx.strokeRect(-8,-10+breathe,16,18);
$core.ctx.strokeStyle=`rgba(255,60,255,${0.4+pulse*0.3})`;$core.ctx.lineWidth=1.5;
$core.ctx.strokeRect(-8,-10+breathe,16,18);
$core.ctx.save();$core.ctx.translate(10-ls*0.2,2);
$core.ctx.fillStyle='rgba(180,0,180,0.35)';
$core.ctx.fillRect(-1.5,-12,3,16);
$core.ctx.fillStyle='rgba(255,120,255,0.9)';
$core.ctx.fillRect(-1.5,-12,1.4,16);
if(!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow){$core.ctx.shadowColor='#ff44ff';$core.ctx.shadowBlur=8;}
$core.ctx.restore();
$core.ctx.strokeStyle='#1a001a';$core.ctx.lineWidth=4;
$core.ctx.beginPath();$core.ctx.moveTo(-8,-4);$core.ctx.lineTo(-11+ls*0.3,4);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(8,-4);$core.ctx.lineTo(11-ls*0.3,4);$core.ctx.stroke();
$core.ctx.fillStyle='#1a001a';
$core.ctx.beginPath();$core.ctx.ellipse(headLook,-15+breathe,5.5,6.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle=`rgba(255,80,255,${0.8+pulse*0.2})`;
if(!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow){$core.ctx.shadowColor='#ff44ff';$core.ctx.shadowBlur=8;}
$core.ctx.beginPath();$core.ctx.ellipse(-2.5+headLook,-15+breathe,2.2,1.2,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(2.5+headLook,-15+breathe,2.2,1.2,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#0d000d';
$core.ctx.beginPath();$core.ctx.arc(headLook,-17+breathe,6.5,Math.PI,0);$core.ctx.fill();
$core.ctx.fillRect(-6.5+headLook,-18+breathe,13,5);
$core.ctx.strokeStyle=`rgba(255,60,255,${0.5+pulse*0.3})`;$core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.moveTo(-6.5+headLook,-18+breathe);$core.ctx.lineTo(6.5+headLook,-18+breathe);$core.ctx.stroke();
if(e._phantomTeleT!==undefined&&e._phantomTeleT>220){
$core.ctx.save();$core.ctx.globalAlpha=0.18;$core.ctx.fillStyle='#ff44ff';
$core.ctx.beginPath();$core.ctx.ellipse(0,0,10,18,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
}
}
function drawBoss(e,facing){
const wt=e.walkT,ls=_gaitSin(wt)*9;
$core.ctx.shadowColor='#ff2200';$core.ctx.shadowBlur=(24)*$core.SHADOW;
$core.ctx.strokeStyle='#330000';$core.ctx.lineWidth=10;$core.ctx.lineCap='round';
$core.ctx.beginPath();$core.ctx.moveTo(-10,e.h/2-8);$core.ctx.lineTo(-12+ls*0.4,e.h/2+14);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(10,e.h/2-8);$core.ctx.lineTo(12-ls*0.4,e.h/2+14);$core.ctx.stroke();
$core.ctx.fillStyle='#111';
$core.ctx.beginPath();$core.ctx.ellipse(-12+ls*0.4,e.h/2+14,8,5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(12-ls*0.4,e.h/2+14,8,5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#3a0000';$core.ctx.fillRect(-e.w/2,-e.h/2,e.w,e.h);
$core.ctx.fillStyle='#660000';$core.ctx.fillRect(-e.w/2,-e.h/2,e.w,10);$core.ctx.fillRect(-e.w/2,e.h/2-10,e.w,10);
$core.ctx.fillStyle='#aa4400';
for(let bx of[-e.w/2+5,0,e.w/2-5])$core.ctx.fillRect(bx-2,-e.h/2+3,4,4);
$core.ctx.strokeStyle='#550000';$core.ctx.lineWidth=10;
$core.ctx.beginPath();$core.ctx.moveTo(-e.w/2,-4);$core.ctx.lineTo(-e.w/2-14+ls*0.5,10);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(e.w/2,-4);$core.ctx.lineTo(e.w/2+14-ls*0.5,10);$core.ctx.stroke();
$core.ctx.fillStyle='#c06030';
$core.ctx.beginPath();$core.ctx.arc(-e.w/2-14+ls*0.5,10,7,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.arc(e.w/2+14-ls*0.5,10,7,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#c06030';$core.ctx.beginPath();$core.ctx.ellipse(0,-e.h/2-12,11,13,0,0,Math.PI*2);$core.ctx.fill();
if($replay.currentEnv==='mars'){
const _vDomeGrad=cachedRadialGradient('mars_voss_dome',-3,-e.h/2-16,1,0,-e.h/2-13,16,[[0,'rgba(220,240,255,0.45)'],[0.6,'rgba(150,190,230,0.26)'],[1,'rgba(70,90,120,0.22)']]);
$core.ctx.fillStyle=_vDomeGrad;
$core.ctx.beginPath();$core.ctx.ellipse(0,-e.h/2-14,14,12,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='rgba(230,245,255,0.6)';$core.ctx.lineWidth=1.4;
$core.ctx.beginPath();$core.ctx.ellipse(0,-e.h/2-14,14,12,0,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.strokeStyle='rgba(255,255,255,0.5)';$core.ctx.lineWidth=2;$core.ctx.globalAlpha=0.65;
$core.ctx.beginPath();$core.ctx.arc(0,-e.h/2-14,11,Math.PI*1.15,Math.PI*1.55);$core.ctx.stroke();
$core.ctx.globalAlpha=1;
$core.ctx.fillStyle='#3a0a0a';$core.ctx.fillRect(-13,-e.h/2-4,26,6);
$core.ctx.fillStyle='rgba(180,220,255,0.2)';$core.ctx.fillRect(-13,-e.h/2-4,26,2);
} else {
$core.ctx.fillStyle='#220000';$core.ctx.beginPath();$core.ctx.ellipse(0,-e.h/2-14,13,9,0,Math.PI,Math.PI*2);$core.ctx.fill();
$core.ctx.fillRect(-13,-e.h/2-17,26,8);
}
$core.ctx.fillStyle='#ff2200';$core.ctx.shadowColor='#ff0000';$core.ctx.shadowBlur=(8)*$core.SHADOW;
$core.ctx.beginPath();$core.ctx.arc(-4,-e.h/2-13,3,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.arc(4,-e.h/2-13,3,0,Math.PI*2);$core.ctx.fill();
$core.ctx.save();$core.ctx.rotate(facing);
$core.ctx.fillStyle='#333';$core.ctx.fillRect(10,-6,34,12);$core.ctx.fillStyle='#555';$core.ctx.fillRect(42,-4,10,8);
$core.ctx.fillStyle='#222';$core.ctx.fillRect(14,4,8,8);$core.ctx.restore();
}
function drawTank(e,facing){
const wt=e.walkT;
const W=e.w,H=e.h;
$core.ctx.save();
$core.ctx.globalAlpha=0.35;
$core.ctx.fillStyle='#000';
$core.ctx.beginPath();$core.ctx.ellipse(2,6,W/2+4,H/2-2,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
const treadW=14,treadH=H-2,treadX=W/2-treadW;
for(let side of[-1,1]){
const tx=side*treadX;
$core.ctx.fillStyle='#1c1c1c';
$core.ctx.beginPath();$core.ctx.roundRect(tx-treadW/2,-treadH/2,treadW,treadH,4);$core.ctx.fill();
const segH=9,offset=(wt*2.8)%segH;
$core.ctx.save();
$core.ctx.beginPath();$core.ctx.roundRect(tx-treadW/2,-treadH/2,treadW,treadH,4);$core.ctx.clip();
$core.ctx.strokeStyle='#333';$core.ctx.lineWidth=1.5;
for(let y=-treadH/2-segH+offset;y<treadH/2+segH;y+=segH){
$core.ctx.beginPath();$core.ctx.moveTo(tx-treadW/2,y);$core.ctx.lineTo(tx+treadW/2,y);$core.ctx.stroke();
}
$core.ctx.restore();
for(let wy of[-treadH*0.32,0,treadH*0.32]){
$core.ctx.fillStyle='#2a2a2a';$core.ctx.beginPath();$core.ctx.arc(tx,wy,5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#444';$core.ctx.beginPath();$core.ctx.arc(tx,wy,2.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.save();$core.ctx.translate(tx,wy);$core.ctx.rotate(wt*3);
$core.ctx.strokeStyle='#555';$core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.moveTo(-3,0);$core.ctx.lineTo(3,0);$core.ctx.moveTo(0,-3);$core.ctx.lineTo(0,3);$core.ctx.stroke();
$core.ctx.restore();
}
$core.ctx.strokeStyle='#3a3a3a';$core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.roundRect(tx-treadW/2,-treadH/2,treadW,treadH,4);$core.ctx.stroke();
}
const hullW=W-treadW*2+4,hullH=H-10;
$core.ctx.fillStyle='#3d4a28';
$core.ctx.beginPath();$core.ctx.roundRect(-hullW/2,-hullH/2,hullW,hullH,5);$core.ctx.fill();
const hGrad=cachedLinearGradient('tank_hGrad_'+hullH,0,-hullH/2,0,hullH/2,[[0,'rgba(120,150,60,0.35)'],[0.4,'rgba(255,255,255,0.04)'],[1,'rgba(0,0,0,0.45)']]);
$core.ctx.fillStyle=hGrad;
$core.ctx.beginPath();$core.ctx.roundRect(-hullW/2,-hullH/2,hullW,hullH,5);$core.ctx.fill();
$core.ctx.strokeStyle='rgba(0,0,0,0.5)';$core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.moveTo(0,-hullH/2+3);$core.ctx.lineTo(0,hullH/2-3);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(-hullW/2+4,4);$core.ctx.lineTo(hullW/2-4,4);$core.ctx.stroke();
$core.ctx.fillStyle='#222';
for(let i=0;i<4;i++) $core.ctx.fillRect(-hullW/2+6+i*8,hullH/2-7,5,5);
$core.ctx.shadowColor='#ff5500';$core.ctx.shadowBlur=8*$core.SHADOW;
$core.ctx.fillStyle='rgba(255,80,0,0.25)';
for(let i=0;i<4;i++) $core.ctx.fillRect(-hullW/2+6+i*8,hullH/2-7,5,5);
$core.ctx.shadowBlur=0;
$core.ctx.fillStyle='#555';
for(let[bx,by]of[[-hullW/2+5,-hullH/2+5],[hullW/2-5,-hullH/2+5],[-hullW/2+5,hullH/2-5],[hullW/2-5,hullH/2-5]]){
$core.ctx.beginPath();$core.ctx.arc(bx,by,2,0,Math.PI*2);$core.ctx.fill();
}
$core.ctx.save();$core.ctx.rotate(e.turretAngle);
$core.ctx.fillStyle='#2c3820';
$core.ctx.beginPath();$core.ctx.ellipse(0,0,20,18,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#4a5c30';$core.ctx.lineWidth=1.5;
$core.ctx.beginPath();$core.ctx.ellipse(0,0,20,18,0,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.fillStyle='#4a5c2a';
$core.ctx.beginPath();
$core.ctx.moveTo(-12,-13);$core.ctx.lineTo(12,-13);$core.ctx.lineTo(17,-6);$core.ctx.lineTo(17,6);
$core.ctx.lineTo(12,13);$core.ctx.lineTo(-12,13);$core.ctx.lineTo(-17,6);$core.ctx.lineTo(-17,-6);
$core.ctx.closePath();$core.ctx.fill();
const tGrad=cachedLinearGradient('tank_tGrad',0,-13,0,13,[[0,'rgba(180,220,80,0.2)'],[0.5,'rgba(255,255,255,0.04)'],[1,'rgba(0,0,0,0.4)']]);
$core.ctx.fillStyle=tGrad;
$core.ctx.beginPath();
$core.ctx.moveTo(-12,-13);$core.ctx.lineTo(12,-13);$core.ctx.lineTo(17,-6);$core.ctx.lineTo(17,6);
$core.ctx.lineTo(12,13);$core.ctx.lineTo(-12,13);$core.ctx.lineTo(-17,6);$core.ctx.lineTo(-17,-6);
$core.ctx.closePath();$core.ctx.fill();
$core.ctx.fillStyle='#323d1e';
$core.ctx.beginPath();$core.ctx.ellipse(-3,-4,7,6,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='#5a7030';$core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.ellipse(-3,-4,7,6,0,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.fillStyle='#4a5a28';$core.ctx.beginPath();$core.ctx.arc(-3,-4,2,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#3a4820';
$core.ctx.beginPath();$core.ctx.roundRect(12,-8,10,16,3);$core.ctx.fill();
$core.ctx.strokeStyle='#5a6e38';$core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.roundRect(12,-8,10,16,3);$core.ctx.stroke();
$core.ctx.fillStyle='#2a3318';$core.ctx.fillRect(22,-5,26,10);
$core.ctx.fillRect(46,-3.5,16,7);
$core.ctx.fillStyle='#1a2010';$core.ctx.fillRect(60,-5,6,10);
$core.ctx.fillStyle='#0a0d06';$core.ctx.beginPath();$core.ctx.ellipse(67,0,3.5,4,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.strokeStyle='rgba(120,160,50,0.3)';$core.ctx.lineWidth=1;
$core.ctx.beginPath();$core.ctx.moveTo(22,-4);$core.ctx.lineTo(62,-3);$core.ctx.stroke();
$core.ctx.shadowColor='#ff6600';$core.ctx.shadowBlur=10*$core.SHADOW;
$core.ctx.fillStyle='rgba(255,100,0,0.12)';
$core.ctx.beginPath();$core.ctx.arc(67,0,5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.shadowBlur=0;
$core.ctx.fillStyle='#252e14';
$core.ctx.fillRect(22,6,18,3.5);$core.ctx.fillRect(38,6.5,8,2.5);
$core.ctx.restore();
if(e._tele>0){ const _tp=1-e._tele/(e._teleMax||1); $core.ctx.save();$core.ctx.rotate(e.turretAngle);$core.ctx.globalAlpha=0.2+0.6*_tp;$core.ctx.strokeStyle='#ff2200';$core.ctx.lineWidth=1+_tp*2;$core.ctx.setLineDash([10,6]);$core.ctx.beginPath();$core.ctx.moveTo(72,0);$core.ctx.lineTo(560,0);$core.ctx.stroke();$core.ctx.restore(); }
$core.ctx.shadowColor='#ff2200';$core.ctx.shadowBlur=28*$core.SHADOW;
$core.ctx.strokeStyle='rgba(255,40,0,0.18)';$core.ctx.lineWidth=2;
$core.ctx.beginPath();$core.ctx.ellipse(0,0,W/2+2,H/2-1,0,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.shadowBlur=0;
$core.ctx.save();$core.ctx.globalAlpha=0.18;$core.ctx.strokeStyle='#000';$core.ctx.lineWidth=1.5;
$core.ctx.beginPath();$core.ctx.moveTo(-15,-8);$core.ctx.lineTo(-8,-4);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(6,5);$core.ctx.lineTo(16,2);$core.ctx.stroke();
$core.ctx.restore();
}
function drawKnife(){
$core.ctx.save();
$core.ctx.fillStyle='#d0dff0';$core.ctx.shadowColor='#a8bcd4';$core.ctx.shadowBlur=(5)*$core.SHADOW;
$core.ctx.beginPath();$core.ctx.moveTo(0,-14);$core.ctx.lineTo(3,0);$core.ctx.lineTo(2,6);$core.ctx.lineTo(-2,6);$core.ctx.lineTo(-3,0);$core.ctx.closePath();$core.ctx.fill();
$core.ctx.strokeStyle='#ffffff';$core.ctx.lineWidth=0.8;$core.ctx.globalAlpha=0.45;
$core.ctx.beginPath();$core.ctx.moveTo(-0.5,-12);$core.ctx.lineTo(1.5,4);$core.ctx.stroke();
$core.ctx.globalAlpha=1;
$core.ctx.fillStyle='#888888';$core.ctx.fillRect(-5,5,10,3);
$core.ctx.fillStyle='#4a2800';$core.ctx.fillRect(-3,8,6,10);
$core.ctx.fillStyle='#2a1000';$core.ctx.fillRect(-3,9,6,2);$core.ctx.fillRect(-3,13,6,2);
$core.ctx.restore();
}
function drawAlly(a){
$core.ctx.save();$core.ctx.translate(a.x,a.y);
const pulse=Math.sin($buildings.tick*0.06+a.x)*0.5+0.5;
$core.ctx.save();
$core.ctx.globalAlpha=0.10+pulse*0.08;
$core.ctx.fillStyle='#00ffcc';
$core.ctx.beginPath();$core.ctx.arc(0,0,20+pulse*3,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
$core.ctx.save();
$core.ctx.strokeStyle='#00ffcc';$core.ctx.shadowColor='#00ffcc';$core.ctx.shadowBlur=8*$core.SHADOW;
$core.ctx.lineWidth=1.2;$core.ctx.globalAlpha=0.5+pulse*0.25;
$core.ctx.beginPath();$core.ctx.arc(0,0,14,0,Math.PI*2);$core.ctx.stroke();
$core.ctx.restore();
$core.ctx.rotate(a.angle);
const leg=_gaitSin(a.walkT)*7;
$core.ctx.lineCap='round';
$core.ctx.strokeStyle='#2a3545';$core.ctx.lineWidth=5;
$core.ctx.beginPath();$core.ctx.moveTo(-3,6);$core.ctx.lineTo(-4+leg*0.5,18);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(3,6);$core.ctx.lineTo(4-leg*0.5,18);$core.ctx.stroke();
$core.ctx.fillStyle='#1a1208';
$core.ctx.beginPath();$core.ctx.ellipse(-4+leg*0.5,18,4.5,2.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(4-leg*0.5,18,4.5,2.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#3a3228';
$core.ctx.fillRect(-9,-10,18,18);
$core.ctx.fillStyle='#555e44';$core.ctx.fillRect(-9,-10,9,8);
$core.ctx.fillStyle='rgba(0,0,0,0.3)';$core.ctx.fillRect(-9,-10,9,2);
$core.ctx.save();$core.ctx.strokeStyle='#6a5020';$core.ctx.lineWidth=2;$core.ctx.globalAlpha=0.7;
$core.ctx.beginPath();$core.ctx.moveTo(-9,-8);$core.ctx.lineTo(7,4);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(-4,-10);$core.ctx.lineTo(-4,8);$core.ctx.stroke();
$core.ctx.restore();
$core.ctx.strokeStyle='#c8a070';$core.ctx.lineWidth=4;
$core.ctx.beginPath();$core.ctx.moveTo(-9,-2);$core.ctx.lineTo(-13+leg*0.2,8);$core.ctx.stroke();
$core.ctx.beginPath();$core.ctx.moveTo(9,-2);$core.ctx.lineTo(13-leg*0.2,8);$core.ctx.stroke();
$core.ctx.fillStyle='#c8a070';
$core.ctx.beginPath();$core.ctx.arc(-13+leg*0.2,8,2.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.arc(13-leg*0.2,8,2.5,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#2a1a08';$core.ctx.fillRect(7,-3,20,3.5);
$core.ctx.fillStyle='#4a3a20';$core.ctx.fillRect(7,-3,8,3.5);
$core.ctx.fillStyle='#111';$core.ctx.fillRect(22,-4,6,5);
$core.ctx.fillStyle='#333';$core.ctx.fillRect(28,-3,5,3);
$core.ctx.fillStyle='#c8a070';
$core.ctx.beginPath();$core.ctx.ellipse(0,-14,5.5,6,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.fillStyle='#00997a';$core.ctx.fillRect(-6,-18,12,5);
$core.ctx.fillStyle='rgba(0,0,0,0.25)';$core.ctx.fillRect(-6,-18,12,2);
$core.ctx.fillStyle='#222';
$core.ctx.beginPath();$core.ctx.ellipse(-2,-15,1.4,1.4,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.beginPath();$core.ctx.ellipse(2,-15,1.4,1.4,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.save();$core.ctx.globalAlpha=0.18;$core.ctx.fillStyle='#000';
$core.ctx.beginPath();$core.ctx.ellipse(0,-11,4,2.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
$core.ctx.restore();
const bw=28;
$core.ctx.fillStyle='#001810';$core.ctx.fillRect(a.x-bw/2,a.y-30,bw,4);
$core.ctx.fillStyle='#00ffcc';$core.ctx.fillRect(a.x-bw/2,a.y-30,bw*(a.hp/a.maxHp),4);
$core.ctx.save();$core.ctx.fillStyle='#00cc99';$core.ctx.font='bold 7px Share Tech Mono';
$core.ctx.textAlign='center';$core.ctx.textBaseline='middle';
$core.ctx.fillText('ALLY',a.x,a.y-36);
$core.ctx.restore();
}
function triggerP2Down(){
if($replay.p2Down) return;
$replay.p2Down=true; $replay.p2ReviveTimer=0;
$replay.player2.hp=0;
shake(8);
ptcl($replay.player2.x,$replay.player2.y,'#0066ff',12,5);
floatText($replay.player2.x,$replay.player2.y-40,'P2 DOWN!','#ff4400',18);
audioManager.death_enemy&&audioManager.death_enemy('soldier',false);
updateCoopHUD();
}
function triggerPlayerDeath(source){
if($buildings.playerDead) return;
if($buildings.player._iframes>0 && !$replay.coopEnabled){ $buildings.player.hp=Math.max(1,$buildings.player._hpSnap||1); return; }
if($replay.coopEnabled&&$replay.player2){
$replay.p1Down=true; $replay.p1ReviveTimer=0;
$buildings.player.hp=0; updateHP();
shake(10);
ptcl($buildings.player.x,$buildings.player.y,'#ff4400',12,5);
floatText($buildings.player.x,$buildings.player.y-40,'P1 DOWN!','#ff4400',18);
updateCoopHUD();
if(!$replay.p2Down){
return;
}
$buildings.playerDead=true; $buildings.state=window.state='dead'; $buildings.wavePending=false;
if(source) $buildings.lastDamageSource=source;
clearBosses(); showDead(); return;
}
if($profiler._shopMedic && !$profiler._medicUsed){
$profiler._medicUsed=true;
$buildings.player.hp=5; $buildings.player.maxHp=Math.max($buildings.player.maxHp,5); updateHP();
$buildings.playerDead=false; $buildings.state=window.state='playing';
shake(12);
floatTextPop($buildings.player.x,$buildings.player.y-50,'+ COMBAT MEDIC — REVIVED!','#00ffcc',16);
ptclBurst($buildings.player.x,$buildings.player.y,'#00ffcc',20,6,18,2);
return;
}
$buildings.playerDead=true;
if(source) $buildings.lastDamageSource=source;
$buildings.state=window.state='dead'; $buildings.wavePending=false;
clearBosses(); showDead();
}
function showDead(){
$profiler.stopAutoFire();
$profiler.clearMovementKeys();
audioManager.endMusicForOutcome('dead');
const _isEndlessRun = !$replay.currentLevel || !!$replay.currentLevel.isEndless;
let boardData = _isEndlessRun ? gameDB.loadEndlessLeaderboard() : gameDB.loadLeaderboard();
const newEntry={score: $buildings.score,wave: $buildings.wave,kills:$buildings.totalKills,char:$replay.selectedChar,level:$replay.currentLevel?$replay.currentLevel.name:'CLASSIC',ts:Date.now()};
const isDupe=boardData.some(e=>e.score===newEntry.score&&e.wave===newEntry.wave&&e.kills===newEntry.kills&&e.char===newEntry.char&&e.level===newEntry.level);
if(!isDupe) boardData.push(newEntry);
boardData.sort((a,b)=>b.score-a.score);
boardData=boardData.slice(0,10);
if(_isEndlessRun) gameDB.saveEndlessLeaderboard(boardData);
else gameDB.saveLeaderboard(boardData);
if (typeof syncLeaderboard === 'function') try { syncLeaderboard(); } catch(_e) {}
promptNameAndSubmit({score: $buildings.score, wave: $buildings.wave, kills:$buildings.totalKills, char:$replay.selectedChar, level:$replay.currentLevel?$replay.currentLevel.name:'CLASSIC'});
$buildings.lifeTokens++;
try { localStorage.setItem('diy_tokens', String($buildings.lifeTokens)); } catch(e){}
if($buildings.wave > 0){
const _safeAmmo = {...$buildings.wepAmmo};
if(_safeAmmo[$buildings.curWep] <= 0) _safeAmmo[$buildings.curWep] = $buildings.WEAPONS[$buildings.curWep].ammo + ($buildings.wepUpgrades[$buildings.curWep]?.ammo || 0);
$legendary._checkpoint = {
levelId: $replay.currentLevel ? $replay.currentLevel.id : null,
isBossRush: !!($replay.currentLevel && $replay.currentLevel.isBossRush),
selectedChar: $replay.selectedChar,
currentEnv: $replay.currentEnv,
wave: $buildings.wave,
waveOffset: $replay.waveOffset || 0,
score: $buildings.score,
hp: $buildings.player.maxHp,
maxHp: $buildings.player.maxHp,
wepAmmo: _safeAmmo,
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
killStreak: $buildings.killStreak,
upgradeRerollsUsed: $buildings._upgradeRerollsUsed,
};
try { localStorage.setItem('diy_checkpoint', JSON.stringify($legendary._checkpoint)); } catch(e){}
}
if(!$buildings.continueUsedThisRun && $buildings.lifeTokens > 0 && $buildings.wave >= 3) {
showContinuePrompt();
} else {
showEndCard();
}
}
let continueCountdown=null;
let _quickRestartLoadout = null;
function showContinuePrompt(){
if(continueCountdown){ clearInterval(continueCountdown); continueCountdown=null; }
const co = document.getElementById('continue-overlay');
document.getElementById('co-wave-num').textContent = $buildings.wave;
document.getElementById('co-tokens').textContent = $buildings.lifeTokens;
const reviveInfo = document.getElementById('co-revive-info');
if(reviveInfo) reviveInfo.textContent = 'KEEPS SCORE '+$buildings.score+' · '+$buildings.totalKills+' KILLS';
const cpBtn = document.getElementById('co-checkpoint-btn');
const cpInfo = document.getElementById('co-checkpoint-info');
if($legendary._checkpoint && $legendary._checkpoint.wave > 0 && $legendary._checkpoint.wave < $buildings.wave){
cpBtn.style.display = 'inline-block';
cpBtn.textContent = 'OK CHECKPOINT W' + $legendary._checkpoint.wave;
if(cpInfo){ cpInfo.style.display='block'; cpInfo.textContent='RESUME FROM WAVE '+$legendary._checkpoint.wave+' · SCORE '+$legendary._checkpoint.score; }
} else {
cpBtn.style.display = 'none';
if(cpInfo) cpInfo.style.display = 'none';
}
co.classList.add('active');
let secs = 6;
document.getElementById('co-timer').textContent = secs;
continueCountdown = _gsi(()=>{
secs--;
document.getElementById('co-timer').textContent = secs;
if(secs<=0){ _gcsi(continueCountdown); continueCountdown=null; co.classList.remove('active'); showEndCard(); }
},1000);
}
document.getElementById('co-yes-btn')?.addEventListener('click',()=>{
clearInterval(continueCountdown);
document.getElementById('continue-overlay').classList.remove('active');
$buildings.lifeTokens--;
try { localStorage.setItem('diy_tokens', String($buildings.lifeTokens)); } catch(e){}
const savedWave = $buildings.wave;
const savedScore = $buildings.score;
const savedKills = $buildings.totalKills;
startLevel({ level: $replay.currentLevel, skipFirstWave: true, carryOver: true, keepOffset: true });
$buildings.continueUsedThisRun = true;
$buildings.score = savedScore;
$buildings.totalKills = savedKills;
$buildings.wave = Math.max(0, savedWave - 1);
$buildings.waveKills=0; $buildings.waveTotal=999; $buildings.waveInProgress=false; $buildings.wavePending=false;
updateHUD();
_gst(nextWave, 600);
});
document.getElementById('co-no-btn')?.addEventListener('click',()=>{
_gcsi(continueCountdown); continueCountdown=null;
document.getElementById('continue-overlay').classList.remove('active');
showEndCard();
});
function renderRunHighlight(prefix, _attempt){
const box = document.getElementById(prefix+'-highlight');
if(!box || typeof $replay.ReplayRecorder === 'undefined') return;
const runClips = $replay.ReplayRecorder.getRunClips();
if(!runClips.length){
const attempt = _attempt || 0;
if(attempt < 14){
setTimeout(()=>renderRunHighlight(prefix, attempt+1), 500);
return;
}
if(typeof console!=='undefined' && console.info) console.info('[ReplayRecorder] no run clip after 7s — supported:', $replay.ReplayRecorder.isSupported(), 'enabled:', $replay.ReplayRecorder.isEnabled());
box.style.display = 'none';
return;
}
const pick = runClips.find(c=>c.type&&c.type.startsWith('boss')) || runClips[0];
const vid = document.getElementById(prefix+'-highlight-video');
vid.src = pick.url;
if(pick.poster) vid.poster = pick.poster;
document.getElementById(prefix+'-highlight-caption').textContent = pick.label + (runClips.length>1 ? ' · '+runClips.length+' captured this run' : '');
box.style.display = 'block';
const viewAllBtn = document.getElementById(prefix+'-highlight-viewall');
if(viewAllBtn && !viewAllBtn._wired){
viewAllBtn._wired = true;
viewAllBtn.addEventListener('click', ()=>$replay.ReplayRecorder.openGallery());
}
}
function showEndCard(){
if(typeof $buildings.particles !== 'undefined') $buildings.particles.length = 0;
if(typeof $buildings.enemies !== 'undefined') $buildings.enemies.length = 0;
if(typeof $buildings.bullets !== 'undefined') $buildings.bullets.length = 0;
if(typeof $buildings.grenades !== 'undefined') $buildings.grenades.length = 0;
if(typeof $buildings.powerups !== 'undefined') $buildings.powerups.length = 0;
if(typeof $buildings.allies !== 'undefined') $buildings.allies.length = 0;
if(typeof $buildings.debrisArr !== 'undefined') $buildings.debrisArr.length = 0;
if(typeof $buildings.floatingTexts!== 'undefined') $buildings.floatingTexts.length= 0;
let _dripRuns = 0;
try { _dripRuns = parseInt(localStorage.getItem('diy_runs_done')||'0'); } catch(e){}
_dripRuns++;
try { localStorage.setItem('diy_runs_done', String(_dripRuns)); } catch(e){}
if(_dripRuns === 2){
_gst(()=>{ radioChatter('◇ NEW UNLOCK — MUTATORS change the rules before a run. Select Endless Mode and toggle them before deploying for a score bonus.', '#ffd700', 7000); }, 2000);
_gst(()=>{ radioChatter('▸ TIP — SYNERGIES: pick the same upgrade type twice in a row to trigger a combo bonus.', '#aaffcc', 6000); }, 10000);
}
if(_dripRuns === 3){
_gst(()=>{ radioChatter('ARMORY — spend earned XP on persistent upgrades between runs. Open MORE -> ARMORY.', '#ffaa44', 7000); }, 2000);
_gst(()=>{ radioChatter('# PRESTIGE — reach max XP to prestige and unlock new character bonuses and badge colours.', '#cc88ff', 6000); }, 10000);
_gst(()=>{ radioChatter('CHARACTERS — each soldier has a unique passive. Try RECON or HEAVY for a new playstyle.', '#88ddff', 6000); }, 18000);
}
const maxWaves = $replay.currentLevel?$replay.currentLevel.maxWaves:15;
const waveRatio = $buildings.wave/maxWaves;
const killsPerWave = $buildings.wave>0?$buildings.totalKills/$buildings.wave:0;
let gradeScore = waveRatio*50 + Math.min(50, killsPerWave*3);
const grade = gradeScore>=90?'S':gradeScore>=75?'A':gradeScore>=55?'B':gradeScore>=35?'C':'D';
const gradeLabels={S:'S RANK — OUTSTANDING',A:'A RANK — EXCELLENT',B:'B RANK — SOLID',C:'C RANK — NEEDS WORK',D:'D RANK — KEEP TRAINING'};
const gradeColors={S:'ec-grade-s',A:'ec-grade-a',B:'ec-grade-b',C:'ec-grade-c',D:'ec-grade-d'};
const bestWep = Object.entries($buildings.wepKills).sort((a,b)=>b[1]-a[1])[0];
const bestWepName = bestWep?$buildings.WEAPONS[bestWep[0]].name:'—';
const bestWepKills = bestWep?bestWep[1]:0;
const deathMessages={'enemy bullet':'TAKEN DOWN BY ENEMY FIRE','contact':'OVERRUN BY ENEMY FORCES','explosion':'CAUGHT IN THE BLAST','bomber':'OBLITERATED BY BOMBER'};
const deathMsg=deathMessages[$buildings.lastDamageSource]||'KILLED IN ACTION';
const storyBeat = $buildings.wave < 10
  ? 'Ghost Reyes is MIA. His daughter is still waiting.'
  : $buildings.wave < 30
    ? 'Ghost Reyes went dark at Wave ' + $buildings.wave + '. NEXUS logs him as another number.'
    : 'Ghost Reyes gave them hell. His daughter would be proud.';
const storyBeatEl = document.getElementById('ec-story-beat');
if(storyBeatEl){ storyBeatEl.textContent = storyBeat; storyBeatEl.style.display = 'block'; }
const _isFirstEverRun = (_dripRuns === 1);
const prestigeResult = $profiler.awardPrestigeXP($buildings.totalKills, $buildings.wave, $buildings.score, _isFirstEverRun);
const dcResult = evaluateDailyChallenges();
const _streakResult = (typeof updateRunStreak === 'function') ? updateRunStreak() : null;
if(_streakResult && _streakResult.justIncreased && _streakResult.current >= 2){
_gst(()=>{
showPickupMsg(''+_streakResult.current+' DAY STREAK!','#ff6600',_streakResult.current===_streakResult.best?'NEW BEST':'COME BACK TOMORROW');
},600);
}
if (typeof syncDailyChallenges === 'function') try { syncDailyChallenges(); } catch(_e) {}
const ec=document.getElementById('end-card');
document.getElementById('ec-level-name').textContent=($replay.currentLevel?$replay.currentLevel.name:'CLASSIC')+' — '+deathMsg;
const gradeEl=document.getElementById('ec-grade');
gradeEl.textContent=grade;
gradeEl.className='ec-grade '+gradeColors[grade];
document.getElementById('ec-grade-label').textContent=gradeLabels[grade];
const boardData=gameDB.loadLeaderboard();
const rank=boardData.length?boardData.findIndex(e=>e.score===$buildings.score)+1:0;
const _runRecords = recordRunStats();
document.getElementById('ec-stats').innerHTML=`
<div class="ec-stat"><span class="ec-stat-label">WAVE</span><span class="ec-stat-val">${$buildings.wave}</span></div>
<div class="ec-stat"><span class="ec-stat-label">KILLS</span><span class="ec-stat-val">${$buildings.totalKills}</span></div>
<div class="ec-stat"><span class="ec-stat-label">SCORE</span><span class="ec-stat-val">${$buildings.score}</span></div>
<div class="ec-stat"><span class="ec-stat-label">RANK</span><span class="ec-stat-val" style="color:${rank===1?'#ffd700':rank<=3?'#aaaaff':'#aaff00'}">#${rank||'—'}</span></div>
<div class="ec-stat"><span class="ec-stat-label">BEST COMBO</span><span class="ec-stat-val" style="color:${_runRecords.isNewComboRecord?'#ffd700':''}">×${_runRecords.runCombo}${_runRecords.isNewComboRecord?' *NEW!':''}</span></div>
<div class="ec-stat"><span class="ec-stat-label">BOSS KILLS</span><span class="ec-stat-val">${_runRecords.runBossKills}${_runRecords.totalBossKills>_runRecords.runBossKills?' <span style="font-size:9px;opacity:0.55;">(career: '+_runRecords.totalBossKills+')</span>':''}</span></div>
<div class="ec-stat" style="grid-column:1/-1"><span class="ec-stat-label">BEST WEAPON</span><span class="ec-stat-val">${bestWepName} (${bestWepKills} kills)</span></div>
${$buildings._bossTypesThisRun.length ? `<div class="ec-stat" style="grid-column:1/-1"><span class="ec-stat-label">BOSSES DEFEATED</span><span class="ec-stat-val" style="font-size:11px;">${$buildings._bossTypesThisRun.join(' · ')}</span></div>` : ''}
`;
document.getElementById('ec-unlock-val').textContent = prestigeResult.rewardLabel || '';
document.getElementById('ec-unlock').style.display = prestigeResult.leveledUp ? 'block' : 'none';
renderRunHighlight('ec');
const _nudgeEl = document.getElementById('ec-aim-nudge');
if (_nudgeEl) {
if ($buildings.settingAutoAim && $buildings.score > 0) {
const _manualScore = Math.round($buildings.score * 1.2);
_nudgeEl.innerHTML =
'◎ MANUAL AIM would have earned <strong>' +
_manualScore.toLocaleString() + '</strong> (+20%)' +
' &nbsp;·&nbsp; Toggle in Settings';
_nudgeEl.style.display = 'block';
} else {
_nudgeEl.style.display = 'none';
}
}
$profiler.renderPrestigePanel(prestigeResult);
$profiler.renderDailyChallengeEndCard(dcResult);
const continueBtn=document.getElementById('ec-continue-btn');
continueBtn.style.display=($buildings.lifeTokens>0&&!$buildings.continueUsedThisRun&&$buildings.wave>=3)?'':'none';
if(continueBtn.style.display!=='none') continueBtn.textContent=`⟲ CONTINUE (${$buildings.lifeTokens} tokens)`;
_quickRestartLoadout = $profiler._getArmoryLoadout();
const _qrBtn = document.getElementById('ec-quick-restart-btn');
if (_qrBtn) {
const _isEndless = !$replay.currentLevel || !!$replay.currentLevel.isEndless;
_qrBtn.style.display = _isEndless ? 'none' : '';
}
ec.classList.add('active');
$replay.pauseBtn.style.display='none';
$replay.audioToggle.style.display='none';
$replay.CaptureTools.showButtons(false);$replay.CaptureTools.stopRecording();
}
document.getElementById('ec-retry-btn')?.addEventListener('click',()=>{
document.getElementById('end-card').classList.remove('active');
if($replay.currentLevel){
const _orig = (typeof gameDB !== 'undefined')
  ? (gameDB.getAllLevels().find(l => l.id === $replay.currentLevel.id) || $replay.currentLevel)
  : $replay.currentLevel;
startLevel({ level: _orig });
} else { (window.goToMenu||goToMenu)(); }
});
document.getElementById('ec-menu-btn')?.addEventListener('click',()=>{
document.getElementById('end-card').classList.remove('active');
(window.goToMenu||goToMenu)();
});
document.getElementById('ec-continue-btn')?.addEventListener('click',()=>{
document.getElementById('end-card').classList.remove('active');
showContinuePrompt();
});
document.getElementById('ec-quick-restart-btn')?.addEventListener('click', () => {
audioManager.uiClick();
document.getElementById('end-card').classList.remove('active');
if (_quickRestartLoadout && Object.keys(_quickRestartLoadout).length > 0) {
$profiler._saveArmoryLoadout(_quickRestartLoadout);
}
_quickRestartLoadout = null;
const _orig = ($replay.currentLevel && typeof gameDB !== 'undefined')
  ? (gameDB.getAllLevels().find(l => l.id === $replay.currentLevel.id) || $replay.currentLevel)
  : $replay.currentLevel;
startLevel({ level: _orig });
});
function showHarmTugCredits(isReplay){
if(window._creditsActive) return;
window._creditsActive = true;
window.endCredits = endCredits;
let _lastAnimTick = Date.now();
const _creditsHeartbeat = setInterval(function(){
if(!window._creditsActive){ clearInterval(_creditsHeartbeat); return; }
if(Date.now() - _lastAnimTick > 4000){
clearInterval(_creditsHeartbeat);
try{ if(typeof window.endCredits === 'function') window.endCredits(); }catch(_e){}
}
}, 1500);
if(!isReplay){
$buildings.state = window.state = 'menu';
$buildings.isPaused = false;
audioManager.stopMusic();
audioManager.playLevelMusic('menu');
try {
const _apo = document.getElementById('apple-pause-overlay');
if (_apo) _apo.classList.remove('visible');
const _ms = document.getElementById('apple-menu-shell');
if (_ms) _ms.classList.remove('active');
} catch(_e) {}
try{
const ctx2=audioManager._ensureCtx();
if(ctx2){
[261,330,392,523].forEach((f,i)=>{
const o=ctx2.createOscillator(),g=ctx2.createGain();
o.type='sine';o.frequency.value=f;
g.gain.setValueAtTime(0,ctx2.currentTime+i*0.08);
g.gain.linearRampToValueAtTime(0.06,ctx2.currentTime+i*0.08+0.05);
g.gain.exponentialRampToValueAtTime(0.001,ctx2.currentTime+i*0.08+2.5);
o.connect(g);g.connect(ctx2.destination);
o.start(ctx2.currentTime+i*0.08);o.stop(ctx2.currentTime+i*0.08+2.6);
});
}
}catch(e){}
}
const screen = document.getElementById('credits-screen');
const scroll = document.getElementById('credits-scroll');
const skipBtn = document.getElementById('credits-skip');
if(!screen||!scroll) { window._creditsActive=false; if(!isReplay) (window.goToMenu||goToMenu)(); return; }
screen.style.display = 'block';
const cc = document.getElementById('credits-stars');
if(cc){
cc.width=window.innerWidth; cc.height=window.innerHeight;
const cctx=cc.getContext('2d');
cctx.fillStyle='#000'; cctx.fillRect(0,0,cc.width,cc.height);
for(let i=0;i<200;i++){
const x=Math.random()*cc.width, y=Math.random()*cc.height;
const r=Math.random()*1.5+0.3;
cctx.fillStyle=`rgba(255,255,255,${0.2+Math.random()*0.6})`;
cctx.beginPath();cctx.arc(x,y,r,0,Math.PI*2);cctx.fill();
}
cctx.fillStyle='rgba(80,0,20,0.35)';cctx.fillRect(0,0,cc.width,cc.height);
}
scroll.style.transition='none';
scroll.style.transform='translateY(100vh)';
const totalScroll = scroll.scrollHeight + window.innerHeight;
const duration = Math.max(18000, totalScroll * 28);
let start=null, cancelled=false;
function animateScroll(ts){
if(cancelled) return;
_lastAnimTick = Date.now();
try{
if(!start) start=ts;
const pct=Math.min(1,(ts-start)/duration);
const y=window.innerHeight-(pct*(window.innerHeight+scroll.scrollHeight+200));
scroll.style.transform=`translateY(${y}px)`;
if(pct<1) requestAnimationFrame(animateScroll);
else { cancelled=true; endCredits(); }
}catch(_e){
cancelled=true; endCredits();
}
}
requestAnimationFrame(animateScroll);
const _creditsWatchdog = setTimeout(()=>{ cancelled=true; endCredits(); }, duration + 30000);
const _creditsLevel = $replay.currentLevel;
const _creditsScore = $buildings.score;
let _creditsDone = false;
function endCredits(){
if(_creditsDone) return;
_creditsDone = true;
cancelled = true;
try{ clearInterval(_creditsHeartbeat); }catch(_e){}
try{ clearTimeout(_creditsWatchdog); }catch(_e){}
window._creditsActive = false;
try{ screen.style.display = 'none'; }catch(_e){}
try{
if(!isReplay && _creditsLevel && _creditsLevel.isFinalBoss){
gameDB.updateLevel(_creditsLevel.id,{completed:true,timesPlayed:(_creditsLevel.timesPlayed||0)+1,bestScore:Math.max(_creditsLevel.bestScore||0,_creditsScore)});
}
}catch(_e){}
if(!isReplay){
try{ (window.goToMenu||goToMenu)(); }catch(_e){
try{
$buildings.state=window.state='menu';
const _shell=document.getElementById('apple-menu-shell');
if(_shell){ _shell.classList.add('active'); _shell.style.display=''; }
const _tc=document.getElementById('touch-controls'); if(_tc) _tc.style.display='none';
const _h=document.getElementById('hud'); if(_h) _h.style.display='none';
}catch(_e2){}
}
}
}
function dismiss(){
cancelled=true;
screen.style.display='none';
endCredits();
}
if(skipBtn){
skipBtn.onclick = null; skipBtn.ontouchstart = null;
skipBtn.addEventListener('click', dismiss, {once:true});
skipBtn.addEventListener('touchstart', e=>{ e.preventDefault(); dismiss(); }, {once:true, passive:false});
}
}
window.applyMenuOnboarding = function applyMenuOnboarding(){
// The old menu widgets are gone; this now only gates the control panels the Apple UI adopts.
const isNewPlayer = !localStorage.getItem('diy_played');
const tier = (()=>{ try{ return parseInt(localStorage.getItem('diy_unlock_tier')||'0'); }catch(e){ return 0; } })();
const extras = document.getElementById('veteran-extras');
const armoryTab = document.getElementById('armory-tab');
const dcPanel = document.getElementById('daily-challenges');
if(isNewPlayer && tier === 0){
if(extras) extras.style.display = 'none';
if(dcPanel) dcPanel.style.display = 'block';
if(armoryTab) armoryTab.style.display = 'none';
} else if(tier === 1){
if(extras) extras.style.display = 'none';
if(armoryTab) armoryTab.style.display = '';
const coopPanel = document.getElementById('coop-panel');
const customPanel = document.getElementById('custom-panel');
if(coopPanel) coopPanel.style.display = 'none';
if(customPanel) customPanel.style.display = 'none';
if(dcPanel) dcPanel.style.display = 'block';
} else {
if(extras) extras.style.display = 'block';
if(armoryTab) armoryTab.style.display = '';
}
}
function revealVeteranMenu(){
const extras = document.getElementById('veteran-extras');
if(extras) extras.style.display = 'block';
const _htp_seen_key = 'diy_htp_seen';
const _htpSeen = (() => { try{ return !!localStorage.getItem(_htp_seen_key); }catch(e){ return false; } })();
if(!_htpSeen){
// First time the full menu is revealed: open the How-To-Play tab of the More panel once.
_gst(() => {
const morePanelEl = document.getElementById('more-panel');
const shell = document.getElementById('apple-menu-shell');
if(morePanelEl && morePanelEl.style.display === 'none' && shell && shell.classList.contains('active') && typeof window._appleOpenMorePanel === 'function'){
window._appleOpenMorePanel('howtoplay');
}
}, 1200);
try{ localStorage.setItem(_htp_seen_key, '1'); }catch(e){}
}
}
function goToMenu(){
$buildings.state=window.state='menu';
try{ _clearGameTimers(); }catch(_e){}
$replay.currentLevel=null; $replay.levelExplicitlyChosen=false; window._bossRushMode=false;
try{ if($profiler._mm) $profiler._mm.style.display='none'; }catch(_e){}
try{
const _aiHudMenu = document.getElementById('audio-intensity-hud');
if(_aiHudMenu) _aiHudMenu.style.display = 'none';
}catch(_e){}
try{ const p2h=el('p2-hud'); if(p2h) p2h.style.display='none'; }catch(_e){}
try{
const _cp = document.getElementById('custom-panel');
if(_cp) _cp.style.display='none';
}catch(_e){}
try{ const _wn=el('wave-num'); if(_wn) _wn.textContent='1'; }catch(_e){}
try{ const _sn=el('score-num'); if(_sn) _sn.textContent='0'; }catch(_e){}
try{ const _kn=el('kills-num'); if(_kn) _kn.textContent='0'; }catch(_e){}
try{ const _mw=el('hud-mini-wave'); if(_mw) _mw.textContent='1'; }catch(_e){}
try{ if(typeof renderLB === 'function') renderLB(); }catch(_e){}
try{ if(typeof updateResumeButton === 'function') updateResumeButton(); }catch(_e){}
try{ if(typeof applyMenuOnboarding === 'function') applyMenuOnboarding(); }catch(_e){}
if (typeof syncLeaderboard === 'function') try { syncLeaderboard(); } catch(_e) {}
try{ audioManager.playLevelMusic('menu'); }catch(_e){}
}
window.goToMenu = goToMenu;
let showLevelComplete = window.showLevelComplete = function showLevelComplete(){
$buildings.state = window.state = 'levelcomplete';
$buildings.isPaused = false;
_clearGameTimers();
audioManager.endMusicForOutcome('win');
audioManager.playVictoryFanfare();
if(typeof $buildings.particles !== 'undefined') $buildings.particles.length = 0;
if(typeof $buildings.enemies !== 'undefined') $buildings.enemies.length = 0;
if(typeof $buildings.bullets !== 'undefined') $buildings.bullets.length = 0;
if(typeof $buildings.grenades !== 'undefined') $buildings.grenades.length = 0;
if(typeof $buildings.powerups !== 'undefined') $buildings.powerups.length = 0;
if(typeof $buildings.allies !== 'undefined') $buildings.allies.length = 0;
if(typeof $buildings.debrisArr !== 'undefined') $buildings.debrisArr.length = 0;
if(typeof $buildings.floatingTexts !== 'undefined') $buildings.floatingTexts.length = 0;
if($replay.currentLevel){
gameDB.updateLevel($replay.currentLevel.id,{
completed:true,
timesPlayed:$replay.currentLevel.timesPlayed+1,
bestScore:Math.max($replay.currentLevel.bestScore,$buildings.score)
});
}
if($replay.currentLevel && $replay.currentLevel.isTutorialLevel){
$replay.pauseBtn.style.display='none';
$replay.audioToggle.style.display='none';
$replay.CaptureTools.showButtons(false);$replay.CaptureTools.stopRecording();
el('upgrade-panel').style.display='none';
try{ localStorage.setItem('diy_played','1'); }catch(e){}
try{
if(localStorage.getItem('diy_set_autoaim') === null){
const _isTouch = $core.isMobile ||
('ontouchstart' in window) ||
(navigator.maxTouchPoints > 0);
localStorage.setItem('diy_set_autoaim', _isTouch ? '1' : '0');
}
}catch(e){}
try{
const _savedAim = localStorage.getItem('diy_set_autoaim');
const _realAim = _savedAim === '1';
$buildings.settingAutoAim = _realAim;
const _tog = el('auto-aim-toggle');
if(_tog){
_tog.dataset.on = String(_realAim);
const _tv = _tog.querySelector('.toggle-val');
if(_tv) _tv.textContent = _realAim ? 'ON' : 'OFF';
}
}catch(e){}
revealVeteranMenu();
$replay.currentLevel=null;
$replay.levelExplicitlyChosen=false;
document.getElementById('custom-panel').style.display='none';
audioManager.levelUp();
vibrate([100,50,100,50,200]);
shake(8);
if(typeof renderLB==='function') try{ renderLB(); }catch(_e){}
if(typeof updateResumeButton==='function') try{ updateResumeButton(); }catch(_e){}
applyMenuOnboarding();
_gst(()=>{
if($buildings.settingAutoAim){
radioChatter(
'◎ BOOT CAMP COMPLETE. You used Auto-Aim. For full tactical control & +20% score, try Manual Aim in Settings.',
'#aaff00', 8000
);
}
}, 1200);
return;
}
if($replay.currentLevel && typeof $profiler.checkWaveUnlocks === 'function'){
$profiler.checkWaveUnlocks($replay.currentLevel.maxWaves || $buildings.wave);
}
if($replay.currentLevel && !$replay.currentLevel.isTutorialLevel){
$buildings.lifeTokens += 2;
try{ localStorage.setItem('diy_tokens', String($buildings.lifeTokens)); }catch(e){}
}
const allLevels = gameDB.getAllLevels();
const isLastCampaign = $replay.currentLevel && $replay.currentLevel.id === 8;
const campaignAllDone = allLevels.filter(l=>l.id>=1&&l.id<=8).every(l=>l.completed);
const nextLvl = ($replay.levelExplicitlyChosen && !isLastCampaign && $replay.currentLevel && $replay.currentLevel.id >= 1 && $replay.currentLevel.id < 8)
? allLevels.find(l => l.id === $replay.currentLevel.id + 1 && l.unlocked)
: null;
const _lcLevelName = $replay.currentLevel ? $replay.currentLevel.name : 'CLASSIC';
const _isEndlessLC = !$replay.currentLevel || !!$replay.currentLevel.isEndless;
let boardData = _isEndlessLC ? gameDB.loadEndlessLeaderboard() : gameDB.loadLeaderboard();
const lcEntry={score: $buildings.score,wave: $buildings.wave,kills:$buildings.totalKills,char:$replay.selectedChar,level:_lcLevelName,ts:Date.now()};
const lcDupe=boardData.some(e=>e.score===lcEntry.score&&e.wave===lcEntry.wave&&e.kills===lcEntry.kills&&e.char===lcEntry.char&&e.level===lcEntry.level);
if(!lcDupe) boardData.push(lcEntry);
boardData.sort((a,b)=>b.score-a.score);
boardData=boardData.slice(0,10);
if(_isEndlessLC) gameDB.saveEndlessLeaderboard(boardData);
else gameDB.saveLeaderboard(boardData);
if (typeof syncLeaderboard === 'function') try { syncLeaderboard(); } catch(_e) {}
const _lcDcResult = evaluateDailyChallenges();
const _lcStreakResult = (typeof updateRunStreak === 'function') ? updateRunStreak() : null;
if(_lcStreakResult && _lcStreakResult.justIncreased && _lcStreakResult.current >= 2){
_gst(()=>{
showPickupMsg(''+_lcStreakResult.current+' DAY STREAK!','#ff6600',_lcStreakResult.current===_lcStreakResult.best?'NEW BEST':'COME BACK TOMORROW');
},600);
}
if (typeof syncDailyChallenges === 'function') try { syncDailyChallenges(); } catch(_e) {}
if (_lcDcResult && _lcDcResult.newlyCompleted && _lcDcResult.newlyCompleted.length > 0) {
if (typeof $profiler.showDailyChallengeCompleteBanner === 'function') $profiler.showDailyChallengeCompleteBanner(_lcDcResult.newlyCompleted);
}
promptNameAndSubmit({score: $buildings.score, wave: $buildings.wave, kills:$buildings.totalKills, char:$replay.selectedChar, level:_lcLevelName});
$replay.pauseBtn.style.display='none';
$replay.audioToggle.style.display='none';
$replay.CaptureTools.showButtons(false);$replay.CaptureTools.stopRecording();
el('upgrade-panel').style.display='none';
try{ localStorage.setItem('diy_played','1'); }catch(e){}
revealVeteranMenu();
el('wave-num').textContent='1';
document.getElementById('custom-panel').style.display='none';
// (legacy hidden results grid + its NEXT/MAIN MENU buttons removed; the Apple level-complete card owns this screen)
recordRunStats();
if(isLastCampaign) showCampaignEndingCutscene();
audioManager.levelUp();
vibrate([100,50,100,50,200]);
shake(8);
if(typeof renderLB==='function') try{ renderLB(); }catch(_e){}
if(typeof updateResumeButton==='function') try{ updateResumeButton(); }catch(_e){}
}
// Leaderboard data for the Apple menu (replaces the old hidden #lb-list DOM it used to scrape).
window.getLeaderboardRows = function getLeaderboardRows(tab){
const isEndless = (tab || window._lbTab || 'endless') === 'endless';
const boardData = isEndless ? gameDB.loadEndlessLeaderboard() : gameDB.loadLeaderboard();
return boardData.map((e,i)=>({
rank: i+1,
level: (e.level||'CLASSIC').substring(0,12),
wave: e.wave||0,
kills: e.kills||0,
char: e.char,
charIcon: e.char==='elite'?'◈':e.char==='commando'?'*':e.char==='heavy'?'::':e.char==='sniper'?'◎':e.char==='medic'?'+':e.char==='alien'?'A':'●',
score: e.score,
ts: e.ts||0
}));
};
window.renderLB = function renderLB(){
if(typeof window._lbTab === 'undefined') window._lbTab = 'endless';
// Same behaviour as before: the daily-challenge list is only refreshed here once there are records.
if(window.getLeaderboardRows(window._lbTab).length) renderDailyChallenges();
}
$core.canvas.addEventListener('mousemove',e=>{const r=$core.canvas.getBoundingClientRect();$buildings.mouse.x=(e.clientX-r.left)*($replay.W/r.width);$buildings.mouse.y=(e.clientY-r.top)*($replay.H/r.height);});
$core.canvas.addEventListener('mousedown',e=>{if(e.button===0&&$buildings.state==='playing')fire();});
$core.canvas.addEventListener('contextmenu',e=>e.preventDefault());
let _gp = null;
let _gpFiring = false;
let _gpBtnPrev = {};
let _gpRumbleSupported = false;
window.addEventListener('gamepadconnected', e=>{
_gp = e.gamepad;
_gpRumbleSupported = !!(e.gamepad.vibrationActuator);
showPickupMsg('GAMEPAD CONNECTED','#aaff00');
$profiler.lastInputScheme = 'gamepad';
});
window.addEventListener('gamepaddisconnected', ()=>{
_gp = null; _gpFiring = false; _gpBtnPrev = {};
});
function _gpRumble(strong=0.4, weak=0.2, dur=80){
if(!_gpRumbleSupported || !_gp?.vibrationActuator) return;
try{ _gp.vibrationActuator.playEffect('dual-rumble',{startDelay:0,duration:dur,weakMagnitude:weak,strongMagnitude:strong}); }catch(e){}
}
function pollGamepad(){
const _pads = navigator.getGamepads ? navigator.getGamepads() : [];
_gp = (_gp && _pads[_gp.index] && _pads[_gp.index].connected) ? _pads[_gp.index] : (Array.prototype.find.call(_pads, g => g && g.connected) || null);
if(!_gp) return;
const gp = _gp;
const DEAD = 0.18;
const FIRE_DEAD = 0.25;
const lx = Math.abs(gp.axes[0]) > DEAD ? gp.axes[0] : 0;
const ly = Math.abs(gp.axes[1]) > DEAD ? gp.axes[1] : 0;
$buildings.keys['_gpLeft'] = lx < -DEAD;
$buildings.keys['_gpRight'] = lx > DEAD;
$buildings.keys['_gpUp'] = ly < -DEAD;
$buildings.keys['_gpDown'] = ly > DEAD;
if(lx < -DEAD) $buildings.keys['KeyA'] = true; else if(!$buildings.keys['KeyA_kb']) $buildings.keys['KeyA'] = false;
if(lx > DEAD) $buildings.keys['KeyD'] = true; else if(!$buildings.keys['KeyD_kb']) $buildings.keys['KeyD'] = false;
if(ly < -DEAD) $buildings.keys['KeyW'] = true; else if(!$buildings.keys['KeyW_kb']) $buildings.keys['KeyW'] = false;
if(ly > DEAD) $buildings.keys['KeyS'] = true; else if(!$buildings.keys['KeyS_kb']) $buildings.keys['KeyS'] = false;
const rx = Math.abs(gp.axes[2]) > DEAD ? gp.axes[2] : 0;
const ry = Math.abs(gp.axes[3]) > DEAD ? gp.axes[3] : 0;
const rMag = Math.hypot(rx, ry);
if(rMag > DEAD && $buildings.state === 'playing' && $buildings.player){
const aimDist = 180;
$buildings.mouse.x = $buildings.player.x + (rx / rMag) * aimDist;
$buildings.mouse.y = $buildings.player.y + (ry / rMag) * aimDist;
$profiler.lastInputScheme = 'gamepad';
}
const wasGpFiring = _gpFiring;
_gpFiring = rMag > FIRE_DEAD && $buildings.state === 'playing';
if(_gpFiring && !wasGpFiring) fire();
if(_gpFiring && $buildings.state === 'playing' && $buildings.player && !$buildings.isPaused){
if(!$profiler.autoFireInterval) $profiler.autoFireInterval = setInterval(()=>{ if(_gpFiring&&$buildings.state==='playing'&&!$buildings.isPaused) fire(); }, 80);
} else if(!_gpFiring && $profiler.autoFireInterval){
$profiler.stopAutoFire();
}
if($buildings.state !== 'playing') return;
function _pressed(i){ const p=gp.buttons[i]?.pressed; const was=_gpBtnPrev[i]; _gpBtnPrev[i]=p; return p&&!was; }
if(_pressed(0)){ fire(); _gpRumble(0.3,0.1,60); }
if(_pressed(1)){ throwGrenade(); _gpRumble(0.6,0.3,100); }
if(_pressed(2)){
const maxA=$buildings.WEAPONS[$buildings.curWep].ammo+($buildings.wepUpgrades[$buildings.curWep]?.ammo||0);
if($buildings.wepAmmo[$buildings.curWep]<maxA&&!$buildings.reloading) startReload();
}
if(_pressed(3)){ switchWep(($buildings.WK.indexOf($buildings.curWep)+1)%$buildings.WK.length); }
if(_pressed(4)){ switchWep(($buildings.WK.indexOf($buildings.curWep)-1+$buildings.WK.length)%$buildings.WK.length); }
if(_pressed(5)){ switchWep(($buildings.WK.indexOf($buildings.curWep)+1)%$buildings.WK.length); }
if(_pressed(9)){ togglePause(); }
if(_pressed(12)){ switchWep(($buildings.WK.indexOf($buildings.curWep)-1+$buildings.WK.length)%$buildings.WK.length); }
if(_pressed(13)){ switchWep(($buildings.WK.indexOf($buildings.curWep)+1)%$buildings.WK.length); }
}
document.addEventListener('keydown',e=>{
$buildings.keys[e.code+'_kb'] = true;
$buildings.keys[e.code]=true;
if(e.code===$buildings.KEYBINDS.up){ $buildings.keys['KeyW']=true; $buildings.keys['KeyW_kb']=true; }
if(e.code===$buildings.KEYBINDS.down){ $buildings.keys['KeyS']=true; $buildings.keys['KeyS_kb']=true; }
if(e.code===$buildings.KEYBINDS.left){ $buildings.keys['KeyA']=true; $buildings.keys['KeyA_kb']=true; }
if(e.code===$buildings.KEYBINDS.right){ $buildings.keys['KeyD']=true; $buildings.keys['KeyD_kb']=true; }
if($replay.coopEnabled&&$buildings.state==='playing'){
if(e.code===$buildings.KEYBIND_P2_DEFAULTS.up||e.code===$buildings.KEYBIND_P2_DEFAULTS.left||e.code===$buildings.KEYBIND_P2_DEFAULTS.down||e.code===$buildings.KEYBIND_P2_DEFAULTS.right) $replay.p2Keys[e.code]=true;
if(e.code===$buildings.KEYBIND_P2_DEFAULTS.grenade){ $replay.p2Keys['_grenadePress']=true; e.preventDefault(); }
if(e.code===$buildings.KEYBIND_P2_DEFAULTS.switchWeapon&&$replay.player2&&!$replay.p2Down){
const idx=$buildings.WK.indexOf($replay.p2CurWep);
$replay.p2CurWep=$buildings.WK[(idx+1)%$buildings.WK.length];
$replay.p2Reloading=false;$replay.p2ReloadTimer=0;
}
}
if(e.code===$buildings.KEYBINDS.pause){ togglePause(); }
if($buildings.state!=='playing')return;
if(e.code===$buildings.KEYBINDS.reload){const maxA=$buildings.WEAPONS[$buildings.curWep].ammo+($buildings.wepUpgrades[$buildings.curWep]?.ammo||0);if($buildings.wepAmmo[$buildings.curWep]<maxA&&!$buildings.reloading)startReload();}
if(e.code===$buildings.KEYBINDS.grenade)throwGrenade();
if(e.code===$buildings.KEYBINDS.airstrike)callAirstrike();
if(e.code===$buildings.KEYBINDS.armageddon)armageddon();
if(e.code===$buildings.KEYBINDS.psycho && $buildings.state==='playing' && !$buildings.isPaused){ if($psycho1._psychoActive) deactivatePsychoMode(); else activatePsychoMode(); }
const _weaponCodes=[$buildings.KEYBINDS.weapon1,$buildings.KEYBINDS.weapon2,$buildings.KEYBINDS.weapon3,$buildings.KEYBINDS.weapon4,$buildings.KEYBINDS.weapon5,$buildings.KEYBINDS.weapon6,$buildings.KEYBINDS.weapon7,$buildings.KEYBINDS.weapon8,$buildings.KEYBINDS.weapon9];
if(_weaponCodes.includes(e.code)) e.preventDefault();
if(e.code===$buildings.KEYBINDS.weapon1)switchWep(0);if(e.code===$buildings.KEYBINDS.weapon2)switchWep(1);
if(e.code===$buildings.KEYBINDS.weapon3)switchWep(2);if(e.code===$buildings.KEYBINDS.weapon4)switchWep(3);
if(e.code===$buildings.KEYBINDS.weapon5)switchWep(4);if(e.code===$buildings.KEYBINDS.weapon6)switchWep(5);
if(e.code===$buildings.KEYBINDS.weapon7)switchWep(6);if(e.code===$buildings.KEYBINDS.weapon8)switchWep(7);
if(e.code===$buildings.KEYBINDS.weapon9)switchWep(8);
if(e.code===$buildings.KEYBINDS.fire){e.preventDefault();fire();}
});
document.addEventListener('keyup',e=>{
$buildings.keys[e.code]=false;
$buildings.keys[e.code+'_kb']=false;
if(e.code===$buildings.KEYBINDS.up){ $buildings.keys['KeyW']=false; $buildings.keys['KeyW_kb']=false; }
if(e.code===$buildings.KEYBINDS.down){ $buildings.keys['KeyS']=false; $buildings.keys['KeyS_kb']=false; }
if(e.code===$buildings.KEYBINDS.left){ $buildings.keys['KeyA']=false; $buildings.keys['KeyA_kb']=false; }
if(e.code===$buildings.KEYBINDS.right){ $buildings.keys['KeyD']=false; $buildings.keys['KeyD_kb']=false; }
if(e.code===$buildings.KEYBIND_P2_DEFAULTS.up||e.code===$buildings.KEYBIND_P2_DEFAULTS.left||e.code===$buildings.KEYBIND_P2_DEFAULTS.down||e.code===$buildings.KEYBIND_P2_DEFAULTS.right) $replay.p2Keys[e.code]=false;
});
el('coop-toggle').addEventListener('click',()=>{
audioManager.uiClick();
$replay.coopEnabled = !$replay.coopEnabled;
const tog = el('coop-toggle');
tog.dataset.on = String($replay.coopEnabled);
tog.innerHTML = $replay.coopEnabled
? '<span style=\"color:#00aaff;font-family:Share Tech Mono,monospace;font-size:9px;letter-spacing:2px;\">CO-OP ON OK</span>'
: 'OFF <span class=\"toggle-val\" style=\"color:#004488;\">OFF</span>';
tog.style.borderColor = $replay.coopEnabled ? '#00aaff' : '#004488';
el('coop-p2-select').style.display = $replay.coopEnabled ? 'block' : 'none';
});
document.querySelectorAll('.p2-char-btn').forEach(btn=>{
btn.addEventListener('click',()=>{
audioManager.uiClick();
$replay.selectedChar2 = btn.dataset.char;
document.querySelectorAll('.p2-char-btn').forEach(b=>{
b.style.borderColor='#003366';b.style.color='#0088cc';
});
btn.style.borderColor='#00aaff';btn.style.color='#00ddff';
});
});
window.selectCharacter = function selectCharacter(charId){
audioManager.uiClick();
const changingChar = $replay.selectedChar !== charId;
$replay.selectedChar=window.selectedChar=charId;
if(charId==='alien'){
try{localStorage.removeItem('diy_alien_badge_pending');}catch(e){}
document.querySelectorAll('.alien-new-badge').forEach(b=>b.remove());
}
const charDefaults={
soldier: {color:'#2d4a1e',darkColor:'#1a2e10',accent:'#7fff00'},
commando: {color:'#2a3a4e',darkColor:'#1a2840',accent:'#00aacc'},
elite: {color:'#1a4a2a',darkColor:'#0d2810',accent:'#00ff88'},
sniper: {color:'#2a1a4a',darkColor:'#1a0d2a',accent:'#7fff00'},
heavy: {color:'#4a2a1a',darkColor:'#2a1a0d',accent:'#cc0000'},
medic: {color:'#1a3a3a',darkColor:'#0d2020',accent:'#ff2244'},
alien: {color:'#1a0a3a',darkColor:'#0d0520',accent:'#cc80ff'},
};
const def=charDefaults[$replay.selectedChar]||charDefaults.soldier;
if(changingChar){
const overrides = $buildings.playerCustom._customOverrides || {};
if(!overrides.color) { $buildings.playerCustom.color=def.color; $buildings.playerCustom.darkColor=def.darkColor; }
if(!overrides.accent) { $buildings.playerCustom.accent=def.accent; }
}
document.querySelectorAll('.swatch[data-key="color"]').forEach(s=>{s.style.borderColor=s.dataset.val===$buildings.playerCustom.color?'#7fff00':'transparent';});
document.querySelectorAll('.swatch[data-key="accent"]').forEach(s=>{s.style.borderColor=s.dataset.val===$buildings.playerCustom.accent?'#7fff00':'transparent';});
_updateAlienFaceRow();
};
function handleSwatchPick(sw){
if(sw.dataset && sw.dataset.locked==='true'){
audioManager.uiClick();
const reqMsg = sw.dataset.reqLabel || ('REACH WAVE '+sw.dataset.reqWave);
if(typeof showPickupMsg==='function') showPickupMsg('<svg class="ico"><use href="#ico-lock"/></svg> LOCKED','#ffd700',reqMsg+' TO UNLOCK');
return;
}
audioManager.uiClick();
const key=sw.dataset.key;
const val=sw.dataset.val;
$buildings.playerCustom[key]=val;
if(key==='color'&&sw.dataset.dark) $buildings.playerCustom.darkColor=sw.dataset.dark;
if(!$buildings.playerCustom._customOverrides) $buildings.playerCustom._customOverrides = {};
$buildings.playerCustom._customOverrides[key] = true;
document.querySelectorAll(`.swatch[data-key="${key}"]`).forEach(s=>{s.style.borderColor='transparent';});
sw.style.borderColor='#7fff00';
try{ localStorage.setItem('diy_custom', JSON.stringify($buildings.playerCustom)); }catch(e){}
if(sw.dataset.exclusiveId){
try{localStorage.removeItem('diy_exclusive_'+sw.dataset.exclusiveId+'_badge');}catch(e){}
document.querySelectorAll(`[data-exclusive-id="${sw.dataset.exclusiveId}"] .exclusive-new-badge`).forEach(b=>b.remove());
}
}
window.handleSwatchPick = handleSwatchPick;
function _exclusiveReqLabel(ex){
if(ex.minLevel!=null){
try{
const tier = $profiler.PRESTIGE_LEVELS[ex.minLevel-1];
if(tier) return `REACH PRESTIGE RANK "${tier.label}"`;
}catch(e){}
return `REACH PRESTIGE LEVEL ${ex.minLevel}`;
}
return `REACH WAVE ${ex.wave}`;
}
window._exclusiveReqLabel = _exclusiveReqLabel;
const _EX_ROW_ID = { skin:'orig-skin-row', color:'orig-color-row', accent:'orig-accent-row' };
function _renderExclusiveSwatchesOld(){
$buildings.EXCLUSIVE_SKINS.forEach(ex=>{
const row = document.getElementById(_EX_ROW_ID[ex.key]);
if(!row) return;
const unlocked = _isExclusiveUnlocked(ex.id);
let sw = row.querySelector(`.swatch[data-exclusive-id="${ex.id}"]`);
if(!sw){
sw = document.createElement('div');
sw.className = 'swatch';
sw.dataset.key = ex.key;
sw.dataset.val = ex.val;
if(ex.dark) sw.dataset.dark = ex.dark;
sw.dataset.exclusiveId = ex.id;
sw.setAttribute('data-exclusive-id', ex.id);
sw.dataset.reqWave = ex.wave;
sw.dataset.reqLabel = _exclusiveReqLabel(ex);
sw.style.cssText = `background:${ex.val};width:22px;height:22px;border:2px solid transparent;cursor:pointer;border-radius:2px;position:relative;`;
sw.title = ex.label + (unlocked ? '' : ` — ${sw.dataset.reqLabel.toLowerCase()} to unlock`);
row.appendChild(sw);
}
sw.dataset.locked = unlocked ? 'false' : 'true';
sw.classList.toggle('locked', !unlocked);
sw.querySelector('.exclusive-new-badge')?.remove();
if(unlocked){
try{
if(localStorage.getItem('diy_exclusive_'+ex.id+'_badge')==='1'){
const badge=document.createElement('span');
badge.className='exclusive-new-badge';
badge.innerHTML='<svg class="ico"><use href="#ico-star"/></svg>';
sw.appendChild(badge);
}
}catch(e){}
}
});
}
window._refreshExclusiveSwatches = function(){
_renderExclusiveSwatchesOld();
if(typeof window._refreshExclusiveSwatchesApple==='function') window._refreshExclusiveSwatchesApple();
};
_renderExclusiveSwatchesOld();
document.querySelectorAll('.swatch').forEach(sw=>{
sw.addEventListener('click',()=>{ handleSwatchPick(sw); });
sw.addEventListener('touchstart', e=>{ e.preventDefault(); handleSwatchPick(sw); },{passive:false});
});
el('custom-done-btn')?.addEventListener('click',()=>{ el('custom-panel').style.display='none'; });
el('custom-done-btn')?.addEventListener('touchstart', e=>{ e.preventDefault(); el('custom-panel').style.display='none'; },{passive:false});
function _updateAlienFaceRow(){
const row = el('alien-face-row');
if(row) row.style.display = $replay.selectedChar==='alien' ? 'block' : 'none';
}
const faceUploadBtn = el('face-upload-btn');
const faceUploadInput = el('face-upload-input');
if(faceUploadBtn && faceUploadInput){
faceUploadBtn.addEventListener('touchend', e=>{
e.preventDefault();
faceUploadInput.click();
}, {passive:false});
}
el('face-upload-input')?.addEventListener('change', e=>{
const file = e.target.files && e.target.files[0];
if(!file) return;
const reader = new FileReader();
reader.onload = evt=>{
const img = new Image();
img.crossOrigin = 'Anonymous';
img.onload = ()=>{
const OUT_W = 256, OUT_H = 320;
const oc = document.createElement('canvas');
oc.width = OUT_W; oc.height = OUT_H;
const octx = oc.getContext('2d');
const srcW = Math.min(img.width, img.height * 0.8);
const srcH = srcW * 1.25;
const sx = (img.width - srcW) / 2;
const sy = Math.max(0, img.height * 0.02);
const safeH = Math.min(srcH, img.height - sy);
octx.imageSmoothingEnabled = true;
octx.imageSmoothingQuality = 'high';
octx.drawImage(img, sx, sy, srcW, safeH, 0, 0, OUT_W, OUT_H);
try{
const id = octx.getImageData(0, 0, OUT_W, OUT_H);
const d = id.data;
const factor = 1.25;
const bright = 12;
for(let i = 0; i < d.length; i += 4){
d[i] = Math.min(255, Math.max(0, (d[i] - 128) * factor + 128 + bright));
d[i+1] = Math.min(255, Math.max(0, (d[i+1] - 128) * factor + 128 + bright));
d[i+2] = Math.min(255, Math.max(0, (d[i+2] - 128) * factor + 128 + bright));
}
octx.putImageData(id, 0, 0);
}catch(_){}
const faceImg = new Image();
faceImg.onload = ()=>{
$buildings.playerCustom._faceDataUrl = faceImg.src;
$buildings.playerCustom.faceImage = null;
if (typeof FaceDB !== 'undefined'){
FaceDB.save(faceImg.src).catch(err => {
console.warn('[FaceDB] save failed, using localStorage fallback:', err);
try { localStorage.setItem('diy_face_src_fallback', faceImg.src); } catch(lsErr) {}
});
}
const prev = el('face-preview');
const prevImg = el('face-preview-img');
const hint = el('face-preview-hint');
prevImg.src = faceImg.src;
prev.style.display = 'block';
if(hint) hint.style.display = 'block';
el('face-clear-btn').style.display = 'inline-block';
audioManager.uiClick();
showPickupMsg('A FACE UPLOADED!','#cc80ff');
};
faceImg.onerror = ()=>{
showPickupMsg('! Face upload failed – try a different image', '#ff8800');
};
faceImg.src = oc.toDataURL('image/jpeg', 0.92);
oc.width = 0; oc.height = 0;
};
img.src = evt.target.result;
};
reader.readAsDataURL(file);
e.target.value = '';
});
el('face-clear-btn')?.addEventListener('click', ()=>{
$buildings.playerCustom._faceDataUrl = null;
$buildings.playerCustom.faceImage = null;
if (typeof FaceDB !== 'undefined') FaceDB.clear();
el('face-preview').style.display = 'none';
el('face-preview-img').src = '';
const hint = el('face-preview-hint');
if(hint) hint.style.display = 'none';
el('face-clear-btn').style.display = 'none';
audioManager.uiClick();
});
el('face-clear-btn')?.addEventListener('touchstart', e=>{ e.preventDefault(); el('face-clear-btn').click(); },{passive:false});
function togglePause(){
if($buildings.state!=='playing') return;
$buildings.isPaused = !$buildings.isPaused;
if($buildings.isPaused){ $profiler.stopAutoFire(); $profiler.clearMovementKeys(); audioManager.pauseMusic(); if(typeof onGuidedPause === 'function') onGuidedPause(); }
else { audioManager.resumeMusic(); }
$replay.pauseOverlay.classList.toggle('active', $buildings.isPaused);
if($buildings.isPaused){
const statsEl = el('pause-stats');
if(statsEl) statsEl.textContent = 'WAVE ' + $buildings.wave + '   •   SCORE ' + $buildings.score;
}
const mobileBtn = el('mobile-pause');
if(mobileBtn){
mobileBtn.innerHTML = $buildings.isPaused
? '<svg viewBox=\"0 0 18 18\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"3,2 15,9 3,16\" style=\"fill:#aaff00;filter:drop-shadow(0 0 4px rgba(170,255,0,0.8));\"/></svg>'
: '<svg viewBox=\"0 0 18 18\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"3\" y=\"2\" width=\"4\" height=\"14\" rx=\"1\" style=\"fill:#aaff00;filter:drop-shadow(0 0 4px rgba(170,255,0,0.8));\"/><rect x=\"11\" y=\"2\" width=\"4\" height=\"14\" rx=\"1\" style=\"fill:#aaff00;filter:drop-shadow(0 0 4px rgba(170,255,0,0.8));\"/></svg>';
mobileBtn.classList.toggle('paused-state', $buildings.isPaused);
}
$replay.pauseBtn.textContent = $buildings.isPaused ? '[ RESUME ]' : '[ PAUSE ]';
}
$replay.resumeBtn.addEventListener('click',()=>{
audioManager.uiClick();
$buildings.isPaused=false;
audioManager.resumeMusic();
$replay.pauseOverlay.classList.remove('active');
el('mobile-pause').innerHTML='<svg viewBox=\"0 0 18 18\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\"><rect x=\"3\" y=\"2\" width=\"4\" height=\"14\" rx=\"1\" style=\"fill:#aaff00;filter:drop-shadow(0 0 4px rgba(170,255,0,0.8));\"\/><rect x=\"11\" y=\"2\" width=\"4\" height=\"14\" rx=\"1\" style=\"fill:#aaff00;filter:drop-shadow(0 0 4px rgba(170,255,0,0.8));\"\/><\/svg>';el('mobile-pause').classList.remove('paused-state');
$replay.pauseBtn.textContent='[ PAUSE ]';
if($core.isMobile) $profiler.showTouchControls(true);
});
(function(){
const saveBtn = document.getElementById('pause-save-btn');
const cpInfo = document.getElementById('pause-checkpoint-info');
if(!saveBtn) return;
$replay.pauseOverlay.addEventListener('transitionend', _updatePauseCpInfo);
$replay.pauseOverlay.addEventListener('animationend', _updatePauseCpInfo);
new MutationObserver(_updatePauseCpInfo).observe($replay.pauseOverlay, {attributes:true, attributeFilter:['class']});
function _updatePauseCpInfo(){
if(!cpInfo) return;
if($legendary._checkpoint && $legendary._checkpoint.wave > 0){
const wavesDiff = $buildings.wave - $legendary._checkpoint.wave;
cpInfo.textContent = 'LAST SAVE: WAVE ' + $legendary._checkpoint.wave + (wavesDiff > 0 ? ' (' + wavesDiff + ' WAVES AGO)' : ' — CURRENT');
} else {
cpInfo.textContent = 'NO CHECKPOINT YET';
}
}
saveBtn.addEventListener('click', ()=>{
if($buildings.state!=='playing') return;
audioManager.uiClick();
saveCheckpoint();
_updatePauseCpInfo();
saveBtn.textContent = 'OK SAVED — WAVE ' + $buildings.wave;
setTimeout(()=>{ saveBtn.textContent = 'SAVE CHECKPOINT'; }, 2000);
});
})();
$replay.menuBtn.addEventListener('click',()=>{
audioManager.stopMusic();
audioManager.uiBack();
if($buildings.state==='playing' && $buildings.wave > 1){
saveCheckpoint();
}
$buildings.reloading=false; $buildings.reloadTimer=0;
_clearGameTimers();
$replay.currentLevel=null; $replay.levelExplicitlyChosen=false; window._bossRushMode=false;
$buildings.state=window.state='menu';
el('wave-num').textContent='1';
el('score-num').textContent='0';
el('kills-num').textContent='0';
const _mwPause=el('hud-mini-wave');if(_mwPause)_mwPause.textContent='1';
document.getElementById('custom-panel').style.display='none';
$replay.pauseOverlay.classList.remove('active');
if(typeof renderLB==='function') try{ renderLB(); }catch(_e){}
if(typeof updateResumeButton==='function') try{ updateResumeButton(); }catch(_e){}
audioManager.playLevelMusic('menu');
});
$replay.pauseBtn.addEventListener('click', togglePause);
window.clearAllProgress = function clearAllProgress(){
if(confirm('Reset all progress and leaderboard?')){
gameDB.clearAllData();
if(typeof renderLB==='function') try{ renderLB(); }catch(_e){}
if(typeof syncLeaderboard==='function') try{ syncLeaderboard(); }catch(_e){}
if(typeof updateResumeButton==='function') try{ updateResumeButton(); }catch(_e){}
if(typeof showPickupMsg === 'function') showPickupMsg('DATA CLEARED', '#ff8800');
}
};
const TUTORIAL_KEY = 'diy_tut_seen';
$props.tutSeen = false;
try { $props.tutSeen = !!localStorage.getItem(TUTORIAL_KEY); } catch(e){}
function showTutorial(onDone){
try{ localStorage.setItem(TUTORIAL_KEY,'1'); }catch(e){}
$props.tutSeen = true;
const bootCamp = gameDB.getAllLevels().find(l=>l.isTutorialLevel)||null;
if(bootCamp){ $replay.currentLevel=bootCamp; $replay.levelExplicitlyChosen=true; }
if(onDone) onDone();
}
$props._guidedWave = false;
$props._guidedCooldown = 0;
$props._guidedCurrentStep = 0;
let _guidedKills = 0;
$props._guidedDone = {};
let _guidedDropSpawned = false;
let _guidedSeen = {};
let _guidedAdvancing = false;
const GUIDED_STEPS = [
{ id:'move',
icon:'',
label:'MOVE YOUR SOLDIER',
hint(){ return $profiler.lastInputScheme==='touch'
? 'Push the LEFT joystick — drag from its centre outward'
: 'Hold W / A / S / D or the Arrow keys'; },
subhint(){ return $profiler.lastInputScheme==='touch'
? 'The joystick is in the bottom-left corner'
: 'Move in any direction to continue'; },
arrow(){ return $profiler.lastInputScheme==='touch' ? 'joystick' : null; },
trigger:'move',
freezeEnemies: true
},
{ id:'shoot',
icon:'◎',
label:'AIM & FIRE',
hint(){ return $profiler.lastInputScheme==='touch'
? 'Drag your RIGHT thumb toward an enemy'
: 'Point the mouse at an enemy and click'; },
subhint(){ return $profiler.lastInputScheme==='touch'
? 'Hold to keep firing — release to stop'
: 'Hold mouse button for continuous fire'; },
trigger:'shoot'
},
{ id:'kill1',
icon:'X',
label:'GET YOUR FIRST KILL',
hint(){ return $profiler.lastInputScheme==='touch'
? 'Keep firing — enemies take several hits'
: 'Keep shooting — move closer if bullets miss'; },
subhint(){ return 'Green enemies are SOLDIERS — your weakest target'; },
trigger:'kill1'
},
{ id:'reload',
icon:'⟲',
label:'RELOAD',
hint(){ return $profiler.lastInputScheme==='touch'
? 'Tap the ⟳ RELOAD button on the right'
: 'Press R to reload'; },
subhint(){ return 'Don\'t wait for empty — reload between fights'; },
arrow(){ return $profiler.lastInputScheme==='touch' ? 'reload-btn' : null; },
trigger:'reload'
},
{ id:'drops',
icon:'+',
label:'PICK UP A SUPPLY DROP',
hint(){ return 'Walk over the glowing item on the ground'; },
subhint(){ return 'Drops restore health, ammo, grenades and more'; },
trigger:'drops'
},
{ id:'grenade',
icon:'▪',
label:'THROW A GRENADE',
hint(){ return $profiler.lastInputScheme==='touch'
? 'Tap the ▪ NADE button — aim at a cluster of enemies'
: 'Press G to throw toward your cursor'; },
subhint(){ return 'Grenades deal heavy AoE damage — use them wisely'; },
arrow(){ return $profiler.lastInputScheme==='touch' ? 'grenade-btn' : null; },
trigger:'grenade'
},
{ id:'switchweapon',
icon:'<svg class="ico"><use href="#ico-play"/></svg>',
label:'SWITCH WEAPONS',
hint(){ return $profiler.lastInputScheme==='touch'
? 'Swipe LEFT or RIGHT on the aim zone, or tap a slot in the weapon bar at the bottom'
: 'Press 1 – 7 to jump to any weapon or scroll the mouse wheel to cycle through'; },
subhint(){ return $profiler.lastInputScheme==='touch'
? 'Pistol · SMG · Shotgun · Rifle · Minigun · Launcher · Knife — each has a different role'
: 'Pistol [1] · SMG [2] · Shotgun [3] · Rifle [4] · Minigun [5] · Launcher [6] · Knife [7] Switch freely — your ammo is separate for each gun'; },
trigger:'switchweapon'
},
{ id:'pause',
icon:__pauseSvg(34,'#aaff00'),
label:'PAUSE THE GAME',
hint(){ return $profiler.lastInputScheme==='touch'
? 'Tap the '+__pauseSvg(14,'#aaff00')+' button in the top-right corner'
: 'Press P or ESC to pause at any time'; },
subhint(){ return $profiler.lastInputScheme==='touch'
? 'Pausing freezes all enemies — safe to step away or review upgrades'
: 'While paused you can review active upgrades and mutations Unpause with the same key or the on-screen button'; },
arrow(){ return $profiler.lastInputScheme==='touch' ? 'pause-btn' : null; },
trigger:'pause'
},
{ id:'waveclear',
icon:'OK',
label:'SURVIVE THE WAVE',
hint(){ return 'Eliminate every enemy to complete Boot Camp Wave '+$buildings.wave; },
subhint(){ return $buildings.wave > 1 ? 'Enemies are tougher — use cover between buildings' : 'More enemies per wave — use cover between buildings'; },
trigger:'waveclear'
},
];
const GUIDED_TOTAL = GUIDED_STEPS.length;
function _mcEl(id){ return document.getElementById(id); }
const _MC_ARROW_TARGETS = {
'joystick': ()=>{ const b=el('joy-base'); if(!b||b.style.display==='none') return null; const r=b.getBoundingClientRect(),cr=$core.canvas.getBoundingClientRect(); return {x:r.left-cr.left+r.width/2, y:r.top-cr.top-14}; },
'reload-btn': ()=>{ const b=el('btn-reload'); if(!b) return null; const r=b.getBoundingClientRect(),cr=$core.canvas.getBoundingClientRect(); return {x:r.left-cr.left+r.width/2, y:r.top-cr.top-14}; },
'grenade-btn': ()=>{ const b=el('btn-grenade-left'); if(!b) return null; const r=b.getBoundingClientRect(),cr=$core.canvas.getBoundingClientRect(); return {x:r.left-cr.left+r.width/2, y:r.top-cr.top-14}; },
'pause-btn': ()=>{ const b=document.getElementById('pause-btn'); if(!b) return null; const r=b.getBoundingClientRect(),cr=$core.canvas.getBoundingClientRect(); return {x:r.left-cr.left+r.width/2, y:r.top-cr.top+r.height+10}; },
};
function _updateMissionCard(){
const card = _mcEl('mission-card');
if(!card) return;
const step = GUIDED_STEPS[$props._guidedCurrentStep];
if(!step){ _hideMissionCard(); return; }
_mcEl('mc-step').textContent = '◈ TRAINING — STEP ' + ($props._guidedCurrentStep+1) + ' OF ' + GUIDED_TOTAL + ' ◈';
_mcEl('mc-icon')[String(step.icon).indexOf('<svg')===0?'innerHTML':'textContent'] = step.icon;
_mcEl('mc-label').textContent = step.label;
const hintText = typeof step.hint === 'function' ? step.hint() : (step.hint||'');
const subText = typeof step.subhint === 'function' ? step.subhint() : (step.subhint||'');
_mcEl('mc-hint').innerHTML = hintText
+ (subText ? `<br><span style="color:#2a4a00;font-size:0.85em;">${subText}</span>` : '');
_mcEl('mc-done').style.display = 'none';
card.classList.remove('done');
const prog = _mcEl('mc-progress');
prog.innerHTML = GUIDED_STEPS.map((_,i)=>{
const cls = i < $props._guidedCurrentStep ? 'done' : i === $props._guidedCurrentStep ? 'active' : '';
return `<div class="mc-dot ${cls}"></div>`;
}).join('');
const arrowEl = _mcEl('mc-arrow');
if(arrowEl){
const arrowKey = typeof step.arrow === 'function' ? step.arrow() : step.arrow;
const targetFn = arrowKey && _MC_ARROW_TARGETS[arrowKey];
if(targetFn && $core.isMobile){
const pos = targetFn();
if(pos){
arrowEl.style.display='block';
arrowEl.style.left = pos.x+'px';
arrowEl.style.top = pos.y+'px';
arrowEl.style.transform = 'translateX(-50%)';
arrowEl.textContent = '▼';
} else { arrowEl.style.display='none'; }
} else { arrowEl.style.display='none'; }
}
$props._guidedFreeze = !!(step.freezeEnemies);
card.classList.add('show');
_gst(()=>{ if($props._guidedWave) _guidedCatchUp(); }, 700);
const skipBtn = _mcEl('mc-skip-btn');
if(skipBtn){
skipBtn.onclick = (e) => {
e.stopPropagation();
e.preventDefault();
_completeMissionStep();
};
}
if($core.isMobile && !$profiler._hudCollapsed && window.innerHeight > window.innerWidth && window.innerWidth < 480){
_hudAutoCollapsedForMission = true;
$profiler.setHudCollapsed(true);
}
}
$props._guidedFreeze = false;
function _guidedRunOk(gen, idx){
return !!$props._guidedWave && window._diyRunGen === gen && $props._guidedCurrentStep === idx;
}
function _completeMissionStep(){
if(_guidedAdvancing) return;
_guidedAdvancing = true;
const doneIdx = $props._guidedCurrentStep;
const gen = window._diyRunGen;
const card = _mcEl('mission-card');
if(card){
card.classList.add('done');
const doneEl = _mcEl('mc-done');
if(doneEl) doneEl.style.display = 'block';
const dots = card.querySelectorAll('.mc-dot');
if(dots[doneIdx]) dots[doneIdx].className = 'mc-dot done';
}
const arrowEl = _mcEl('mc-arrow');
if(arrowEl) arrowEl.style.display='none';
$props._guidedFreeze = false;
try{ audioManager.levelUp(); }catch(_e){}
setTimeout(()=>{
_guidedAdvancing = false;
if(!_guidedRunOk(gen, doneIdx)) return;
$props._guidedCurrentStep++;
if($props._guidedCurrentStep >= GUIDED_TOTAL){
_hideMissionCard();
stopGuidedWave();
} else {
_updateMissionCard();
}
}, 1200);
}
function _hideMissionCard(){
const card = _mcEl('mission-card');
if(card){ card.classList.remove('show'); }
if($core.isMobile && $profiler._hudCollapsed && _hudAutoCollapsedForMission){
_hudAutoCollapsedForMission = false;
$profiler.setHudCollapsed(false);
}
}
let _hudAutoCollapsedForMission = false;
function startGuidedWave(){
$props._guidedWave = true;
$props._guidedDone = {};
_guidedSeen = {};
_guidedAdvancing = false;
$props._guidedCurrentStep = 0;
_guidedKills = 0;
$props._guidedCooldown = 90;
$props._guidedFreeze = false;
_guidedDropSpawned = false;
const wm = document.getElementById('training-watermark');
if(wm) wm.style.display = 'block';
_gst(()=>{ if($props._guidedWave) _updateMissionCard(); }, 1500);
}
function stopGuidedWave(){
$props._guidedWave = false;
_hideMissionCard();
const wm = document.getElementById('training-watermark');
if(wm) wm.style.display = 'none';
const isBoot = $replay.currentLevel && $replay.currentLevel.isTutorialLevel;
$profiler.showIngameHint(isBoot ? '# BOOT CAMP COMPLETE — You\'re ready, soldier!' : '# TRAINING COMPLETE — Good luck, soldier!', 3500);
}
function _fireGuidedStep(id){
if(!$props._guidedWave) return;
_guidedSeen[id] = true;
if($props._guidedDone[id] || _guidedAdvancing) return;
const step = GUIDED_STEPS[$props._guidedCurrentStep];
if(!step || step.id !== id) return;
$props._guidedDone[id] = true;
_completeMissionStep();
}
function _guidedCatchUp(){
if(!$props._guidedWave || _guidedAdvancing) return;
const step = GUIDED_STEPS[$props._guidedCurrentStep];
if(!step || $props._guidedDone[step.id]) return;
if(_guidedSeen[step.id]) { _fireGuidedStep(step.id); return; }
if(step.id === 'reload' && $buildings.reloading) { _fireGuidedStep('reload'); return; }
if(step.id === 'switchweapon' && ($buildings.WK||[]).length < 2) { _fireGuidedStep('switchweapon'); return; }
}
function _guidedNoteMovement(){
if(_guidedSeen.move) return;
const k = $buildings.keys;
const moving = k['KeyW']||k['KeyS']||k['KeyA']||k['KeyD']||k['ArrowUp']||k['ArrowDown']||k['ArrowLeft']||k['ArrowRight'] ||
($core.isMobile && (Math.abs($buildings.player.vx)>0.5 || Math.abs($buildings.player.vy)>0.5));
if(moving) _fireGuidedStep('move');
}
function tickGuidedWave(){
if(!$props._guidedWave || $buildings.state !== 'playing') return;
if($props._guidedCooldown > 0){ $props._guidedCooldown--; return; }
_guidedNoteMovement();
if(_guidedAdvancing) return;
const step = GUIDED_STEPS[$props._guidedCurrentStep];
if(!step || $props._guidedDone[step.id]) return;
switch(step.id){
case 'drops':
if($buildings.powerups.length === 0){
const offX = (Math.random()-0.5)*120, offY = (Math.random()-0.5)*120;
$buildings.powerups.push({x:$buildings.player.x+offX, y:$buildings.player.y+offY, type:'health', life:600, _guided:true});
}
break;
case 'grenade':
if($buildings.grenadeCount === 0) _fireGuidedStep('grenade');
break;
}
}
function onGuidedShot(){
if(!$props._guidedWave) return;
_fireGuidedStep('shoot');
}
function onGuidedKill(){
if(!$props._guidedWave) return;
_guidedKills++;
_fireGuidedStep('kill1');
}
function onGuidedPickup(){
if(!$props._guidedWave) return;
_fireGuidedStep('drops');
}
function onGuidedGrenade(){
if(!$props._guidedWave) return;
_fireGuidedStep('grenade');
}
function onGuidedWeaponSwitch(){
if(!$props._guidedWave) return;
_fireGuidedStep('switchweapon');
}
function onGuidedPause(){
if(!$props._guidedWave) return;
_fireGuidedStep('pause');
}
function onGuidedReload(){
if(!$props._guidedWave) return;
_fireGuidedStep('reload');
}
function onGuidedWaveStart(){
if(!$props._guidedWave) return;
delete _guidedSeen.waveclear;
}
function onGuidedWaveClear(){
if(!$props._guidedWave) return;
const isBoot = $replay.currentLevel && $replay.currentLevel.isTutorialLevel;
const isFinalWave = isBoot ? ($buildings.wave >= 3) : true;
_fireGuidedStep('waveclear');
if(isFinalWave){
_gst(()=>{ _hideMissionCard(); stopGuidedWave(); }, 2000);
} else {
_gst(()=>{ _hideMissionCard(); }, 1500);
const _wcGen = window._diyRunGen;
setTimeout(()=>{
if($props._guidedWave && window._diyRunGen === _wcGen){
delete $props._guidedDone['waveclear'];
_guidedKills=0; $props._guidedCooldown=60; $props._guidedFreeze=false; _guidedDropSpawned=false;
const _waveclearIdx = GUIDED_STEPS.findIndex(s => s.id === 'waveclear');
let _resumeIdx = _waveclearIdx >= 0 ? _waveclearIdx : GUIDED_STEPS.length - 1;
for(let _i = 0; _i < GUIDED_STEPS.length; _i++){
if(!$props._guidedDone[GUIDED_STEPS[_i].id]){
_resumeIdx = _i;
break;
}
}
$props._guidedCurrentStep = _resumeIdx;
const _wcStep = GUIDED_STEPS.find(s => s.id === 'waveclear');
if(_wcStep){
_wcStep.hint = ()=>'Eliminate every enemy to complete Boot Camp Wave '+$buildings.wave;
_wcStep.subhint = ()=>'Enemies are tougher — use cover between buildings';
}
_gst(()=>{ if($props._guidedWave) _updateMissionCard(); }, 1000);
}
}, 3000);
}
}
const morePanel = el('more-panel');
document.querySelectorAll('.more-pane').forEach(pane => {
pane.addEventListener('wheel', e => {
if(!pane.classList.contains('active')) return;
const atTop = pane.scrollTop === 0;
const atBottom = pane.scrollTop + pane.clientHeight >= pane.scrollHeight - 1;
if(!(atTop && e.deltaY < 0) && !(atBottom && e.deltaY > 0)){
e.stopPropagation();
}
}, { passive: true });
});
document.querySelectorAll('.more-tab').forEach(tab => {
tab.addEventListener('click', () => {
audioManager.uiClick();
const pane = tab.dataset.pane;
document.querySelectorAll('.more-tab').forEach(t => t.classList.remove('active'));
document.querySelectorAll('.more-pane').forEach(p => p.classList.remove('active'));
tab.classList.add('active');
el('more-pane-' + pane).classList.add('active');
});
});
el('snd-toggle').addEventListener('click',()=>{
const tog = el('snd-toggle');
const on = tog.dataset.on === 'true';
tog.dataset.on = String(!on);
tog.querySelector('.toggle-val').textContent = !on ? 'ON' : 'OFF';
audioManager.enabled = !on;
if(!on && audioManager.audioContext && audioManager.audioContext.state==='suspended'){
audioManager.audioContext.resume().catch(()=>{});
}
const volRow = el('vol-row');
volRow.style.opacity = audioManager.enabled ? '1' : '0.4';
volRow.style.pointerEvents = audioManager.enabled ? 'auto' : 'none';
$replay.audioToggle.textContent = audioManager.enabled ? '[ SOUND ON ]' : '[ SOUND OFF ]';
if(typeof $profiler._syncPauseSoundBtn === 'function') $profiler._syncPauseSoundBtn();
try{ localStorage.setItem('diy_set_snd', audioManager.enabled?'1':'0'); }catch(e){}
});
el('music-toggle').addEventListener('click',()=>{
const tog = el('music-toggle');
const on = tog.dataset.on === 'true';
tog.dataset.on = String(!on);
tog.querySelector('.toggle-val').textContent = !on ? 'ON' : 'OFF';
audioManager.musicEnabled = !on;
const musicVolRow = el('music-vol-row');
musicVolRow.style.opacity = audioManager.musicEnabled ? '1' : '0.4';
musicVolRow.style.pointerEvents = audioManager.musicEnabled ? 'auto' : 'none';
if(audioManager.musicEnabled){
audioManager._musicEnv = null;
if($buildings.state==='playing') audioManager.playLevelMusic($replay.currentEnv);
} else {
audioManager.stopMusic();
}
try{ localStorage.setItem('diy_set_music', audioManager.musicEnabled?'1':'0'); }catch(e){}
});
el('music-vol-slider').addEventListener('input', e=>{
const val = parseInt(e.target.value);
audioManager.setMusicVolume(val / 100);
el('music-vol-label').textContent = val + '%';
try{ localStorage.setItem('diy_set_music_vol', String(val)); }catch(e){}
});
el('shake-toggle').addEventListener('click',()=>{
const tog = el('shake-toggle');
const on = tog.dataset.on === 'true';
tog.dataset.on = String(!on);
tog.querySelector('.toggle-val').textContent = !on ? 'ON' : 'OFF';
$buildings.settingShakeEnabled = !on;
try{ localStorage.setItem('diy_set_shake', $buildings.settingShakeEnabled?'1':'0'); }catch(e){}
});
el('shake-intensity-slider').addEventListener('input', e=>{
const val = parseInt(e.target.value);
$buildings.settingShakeIntensity = val / 100;
el('shake-intensity-label').textContent = val + '%';
try{ localStorage.setItem('diy_set_shake_intensity', String(val)); }catch(e){}
});
el('photosensitive-toggle').addEventListener('click',()=>{
const tog = el('photosensitive-toggle');
const on = tog.dataset.on === 'true';
tog.dataset.on = String(!on);
tog.querySelector('.toggle-val').textContent = !on ? 'ON' : 'OFF';
$buildings.settingPhotosensitive = !on;
document.body.classList.toggle('photosensitive-mode', $buildings.settingPhotosensitive);
try{ localStorage.setItem('diy_set_photosensitive', $buildings.settingPhotosensitive?'1':'0'); }catch(e){}
});
el('high-contrast-toggle').addEventListener('click',()=>{
const tog = el('high-contrast-toggle');
const on = tog.dataset.on === 'true';
tog.dataset.on = String(!on);
tog.querySelector('.toggle-val').textContent = !on ? 'ON' : 'OFF';
document.body.classList.toggle('high-contrast-mode', !on);
try{ localStorage.setItem('diy_set_high_contrast', !on?'1':'0'); }catch(e){}
});
el('vol-slider').addEventListener('input', e=>{
const val = parseInt(e.target.value);
audioManager.volume = val / 100;
el('vol-label').textContent = val + '%';
try{ localStorage.setItem('diy_set_vol', String(val)); }catch(e){}
});
$props.fpsVisible = false;
el('fps-toggle').addEventListener('click',()=>{
const tog = el('fps-toggle');
$props.fpsVisible = tog.dataset.on !== 'true';
tog.dataset.on = String($props.fpsVisible);
tog.querySelector('.toggle-val').textContent = $props.fpsVisible ? 'ON' : 'OFF';
el('fps-counter').style.display = $props.fpsVisible ? 'block' : 'none';
if(!$props.fpsVisible) el('fps-counter').textContent='FPS: --';
try{ localStorage.setItem('diy_set_fps', $props.fpsVisible?'1':'0'); }catch(e){}
});
el('perf-toggle').addEventListener('click',()=>{
const tog = el('perf-toggle');
$buildings.settingPerfMode = tog.dataset.on !== 'true';
_updateShadowFlag();
tog.dataset.on = String($buildings.settingPerfMode);
tog.querySelector('.toggle-val').textContent = $buildings.settingPerfMode ? 'ON' : 'OFF';
document.body.classList.toggle('perf-mode', $buildings.settingPerfMode);
const pRow = el('perf-particles-row');
if(pRow) pRow.style.display = $buildings.settingPerfMode ? 'flex' : 'none';
if($buildings.settingPerfMode && $buildings.state==='playing') showPickupMsg('▸ PERF MODE ON','#ffcc00');
try{ localStorage.setItem('diy_set_perf', $buildings.settingPerfMode?'1':'0'); }catch(e){}
});
$props._perfParticlePct = 20;
el('perf-particles-slider').addEventListener('input', e=>{
$props._perfParticlePct = parseInt(e.target.value);
el('perf-particles-label').textContent = $props._perfParticlePct + '%';
try{ localStorage.setItem('diy_set_perf_ptcl', String($props._perfParticlePct)); }catch(e){}
});
(function initKeybindUI(){
const listEl = el('keybind-list');
if(!listEl) return;
let _capturingAction = null;
function _renderKeybindList(){
listEl.innerHTML = '';
Object.keys($buildings.KEYBIND_LABELS).forEach(action=>{
const row = document.createElement('div');
row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;';
const label = document.createElement('span');
label.style.cssText = 'font-family:\'Share Tech Mono\',monospace;font-size:9px;color:#3a7000;letter-spacing:1px;';
label.textContent = $buildings.KEYBIND_LABELS[action];
const btn = document.createElement('button');
btn.className = 'diff-btn';
btn.style.cssText = 'min-width:64px;';
btn.textContent = (_capturingAction===action) ? 'PRESS KEY…' : _codeToLabel($buildings.KEYBINDS[action]);
btn.setAttribute('aria-label', 'Rebind ' + $buildings.KEYBIND_LABELS[action]);
btn.addEventListener('click', ()=>{
_capturingAction = action;
_renderKeybindList();
});
row.appendChild(label);
row.appendChild(btn);
listEl.appendChild(row);
});
}
document.addEventListener('keydown', e=>{
if(!_capturingAction) return;
e.preventDefault();
e.stopPropagation();
if(e.code==='Escape'){ _capturingAction=null; _renderKeybindList(); return; }
const conflictAction = Object.keys($buildings.KEYBINDS).find(a=>a!==_capturingAction && $buildings.KEYBINDS[a]===e.code);
if(conflictAction){ $buildings.KEYBINDS[conflictAction] = $buildings.KEYBINDS[_capturingAction]; }
$buildings.KEYBINDS[_capturingAction] = e.code;
_saveKeybinds();
_capturingAction = null;
_renderKeybindList();
_updateHotkeyBarHints();
}, true);
const resetBtn = el('keybind-reset-btn');
if(resetBtn) resetBtn.addEventListener('click', ()=>{
$buildings.KEYBINDS = Object.assign({}, $buildings.KEYBIND_DEFAULTS);
_saveKeybinds();
_capturingAction = null;
_renderKeybindList();
_updateHotkeyBarHints();
});
_renderKeybindList();
})();
let hudScale = 1.0;
const hudScaleSlider = el('hud-scale-slider');
if(hudScaleSlider){
try{
const saved = localStorage.getItem('diy_hud_scale');
if(saved) hudScale = parseFloat(saved);
hudScaleSlider.value = hudScale;
}catch(e){}
hudScaleSlider.addEventListener('input', e=>{
hudScale = parseFloat(e.target.value);
document.documentElement.style.setProperty('--hud-scale', hudScale);
el('hud-scale-label').textContent = Math.round(hudScale * 100) + '%';
try{ localStorage.setItem('diy_hud_scale', String(hudScale)); }catch(e){}
});
document.documentElement.style.setProperty('--hud-scale', hudScale);
el('hud-scale-label').textContent = Math.round(hudScale * 100) + '%';
}
el('fps30-toggle').addEventListener('click',()=>{
const tog = el('fps30-toggle');
$buildings.setting30fps = tog.dataset.on !== 'true';
tog.dataset.on = String($buildings.setting30fps);
tog.querySelector('.toggle-val').textContent = $buildings.setting30fps ? 'ON' : 'OFF';
const badge = el('fps30-badge');
if(badge) badge.style.display = $buildings.setting30fps ? 'block' : 'none';
$profiler._updateFrameBudget();
if($buildings.state==='playing') showPickupMsg($buildings.setting30fps ? '30FPS MODE ON' : '30FPS MODE OFF','#aaccff');
try{ localStorage.setItem('diy_set_30fps', $buildings.setting30fps?'1':'0'); }catch(e){}
});
(function(){
const tog = el('replay-capture-toggle');
if(!tog || !$replay.ReplayRecorder.isSupported()){ if(tog){ const row = tog.closest('.setting-row'); if(row) row.style.display='none'; } return; }
const sync = ()=>{
tog.dataset.on = String($replay.ReplayRecorder.isEnabled());
tog.querySelector('.toggle-val').textContent = $replay.ReplayRecorder.isEnabled() ? 'ON' : 'OFF';
};
sync();
tog.addEventListener('click',()=>{
$replay.ReplayRecorder.setEnabled(tog.dataset.on !== 'true');
sync();
if($buildings.state==='playing') showPickupMsg($replay.ReplayRecorder.isEnabled() ? 'REPLAY CAPTURE ON' : 'REPLAY CAPTURE OFF','#aaccff');
});
})();
if(!$core.isMobile){ const r=el('aim-assist-row'); if(r) r.style.display='none'; }
el('aim-assist-toggle').addEventListener('click',()=>{
const tog = el('aim-assist-toggle');
$buildings.settingAimAssist = tog.dataset.on !== 'true';
tog.dataset.on = String($buildings.settingAimAssist);
tog.querySelector('.toggle-val').textContent = $buildings.settingAimAssist ? 'ON' : 'OFF';
try{ localStorage.setItem('diy_set_aim', $buildings.settingAimAssist?'1':'0'); }catch(e){}
});
(function(){
try{ const s=localStorage.getItem('diy_set_fireaim'); if(s!==null){ $buildings.settingFireOnAim=s==='1'; const tog=el('fireaim-toggle'); if(tog){ tog.dataset.on=String($buildings.settingFireOnAim); tog.querySelector('.toggle-val').textContent=$buildings.settingFireOnAim?'ON':'OFF'; } } }catch(e){}
const tog=el('fireaim-toggle');
if(!tog) return;
tog.addEventListener('click',()=>{
$buildings.settingFireOnAim = tog.dataset.on !== 'true';
tog.dataset.on = String($buildings.settingFireOnAim);
tog.querySelector('.toggle-val').textContent = $buildings.settingFireOnAim ? 'ON' : 'OFF';
try{ localStorage.setItem('diy_set_fireaim', $buildings.settingFireOnAim?'1':'0'); }catch(e){}
});
})();
(function(){
const tog = el('auto-aim-toggle');
if(!tog) return;
try{ const s=localStorage.getItem('diy_set_autoaim'); if(s!==null){ $buildings.settingAutoAim=s==='1'; tog.dataset.on=String($buildings.settingAutoAim); tog.querySelector('.toggle-val').textContent=$buildings.settingAutoAim?'ON':'OFF'; } }catch(e){}
tog.addEventListener('click',()=>{
$buildings.settingAutoAim = tog.dataset.on !== 'true';
tog.dataset.on = String($buildings.settingAutoAim);
tog.querySelector('.toggle-val').textContent = $buildings.settingAutoAim ? 'ON' : 'OFF';
try{ localStorage.setItem('diy_set_autoaim', $buildings.settingAutoAim?'1':'0'); }catch(e){}
});
})();
if(!$core.isMobile){ const r=el('vibration-row'); if(r) r.style.display='none'; }
el('vibration-toggle').addEventListener('click',()=>{
const tog = el('vibration-toggle');
$buildings.settingVibration = tog.dataset.on !== 'true';
tog.dataset.on = String($buildings.settingVibration);
tog.querySelector('.toggle-val').textContent = $buildings.settingVibration ? 'ON' : 'OFF';
if($buildings.settingVibration) vibrate([20,10,40]);
try{ localStorage.setItem('diy_set_vib', $buildings.settingVibration?'1':'0'); }catch(e){}
});
el('cb-toggle').addEventListener('click',()=>{
const tog = el('cb-toggle');
$buildings.settingColorblind = tog.dataset.on !== 'true';
tog.dataset.on = String($buildings.settingColorblind);
tog.querySelector('.toggle-val').textContent = $buildings.settingColorblind ? 'ON' : 'OFF';
document.body.classList.toggle('cb-mode', $buildings.settingColorblind);
if($buildings.state==='playing') showPickupMsg($buildings.settingColorblind ? 'COLORBLIND ON' : 'COLORBLIND OFF','#ffffff');
try{ localStorage.setItem('diy_set_cb', $buildings.settingColorblind?'1':'0'); }catch(e){}
});
el('kbnav-toggle').addEventListener('click',()=>{
const tog = el('kbnav-toggle');
$buildings.settingKbNav = tog.dataset.on !== 'true';
tog.dataset.on = String($buildings.settingKbNav);
tog.querySelector('.toggle-val').textContent = $buildings.settingKbNav ? 'ON' : 'OFF';
applyKbNav($buildings.settingKbNav);
});
el('auto-switch-toggle').addEventListener('click',()=>{
const tog = el('auto-switch-toggle');
$buildings.settingAutoSwitch = tog.dataset.on !== 'true';
tog.dataset.on = String($buildings.settingAutoSwitch);
tog.querySelector('.toggle-val').textContent = $buildings.settingAutoSwitch ? 'ON' : 'OFF';
try{ localStorage.setItem('diy_set_auto_switch', $buildings.settingAutoSwitch?'1':'0'); }catch(e){}
});
let _sheetsUrl = '';
try{ _sheetsUrl = localStorage.getItem('diy_sheets_url') || ''; }catch(e){}
(function initSheetsUI(){
const input = el('sheets-url-input');
const saveBtn= el('sheets-save-btn');
const testBtn= el('sheets-test-btn');
const status = el('sheets-status');
if(!input) return;
if(_sheetsUrl) input.value = _sheetsUrl;
function _setStatus(msg, col){
status.textContent = msg;
status.style.color = col || '#2a4a00';
}
saveBtn.addEventListener('click', ()=>{
const url = input.value.trim();
if(url && !/^https:\/\/[^\s<>"']+$/.test(url)){
_setStatus('X MUST BE A VALID HTTPS URL','#ff4400');
audioManager.uiClick();
setTimeout(()=>_setStatus(''), 2500);
return;
}
_sheetsUrl = url;
try{ localStorage.setItem('diy_sheets_url', url); }catch(e){}
_setStatus(url ? 'OK URL SAVED' : 'X CLEARED', url ? '#aaff00' : '#aa4400');
audioManager.uiClick();
setTimeout(()=>_setStatus(''), 2500);
});
saveBtn.addEventListener('touchstart', e=>{ e.preventDefault(); saveBtn.click(); },{passive:false});
testBtn.addEventListener('click', async ()=>{
if(!_sheetsUrl){ _setStatus('NO URL SET','#aa4400'); return; }
_setStatus('TESTING...','#ffcc00');
const ok = await submitToSheets({name:'TEST',score:0,wave:0,kills:0,char:'test',level:'test'}, true);
_setStatus(ok ? 'OK CONNECTED' : 'X FAILED — CHECK URL', ok ? '#aaff00' : '#ff4400');
setTimeout(()=>_setStatus(''), 3500);
});
testBtn.addEventListener('touchstart', e=>{ e.preventDefault(); testBtn.click(); },{passive:false});
})();
async function submitToSheets(data, silent=false){
if(!_sheetsUrl) return false;
try{
await fetch(_sheetsUrl, {
method:'POST',
mode:'no-cors',
headers:{'Content-Type':'application/json'},
body: JSON.stringify(data)
});
if(!silent) showPickupMsg('SCORE SUBMITTED','#aaff00');
return true;
}catch(err){
if(!silent) showPickupMsg('SUBMIT FAILED','#ff4400');
return false;
}
}
let _playerName = '';
try{ _playerName = localStorage.getItem('diy_player_name') || ''; }catch(e){}
function promptNameAndSubmit(scoreData){
if(typeof renderLB === 'function') try{ renderLB(); }catch(_e){}
if(!_sheetsUrl) return;
if(_playerName){
submitToSheets({...scoreData, name:_playerName});
return;
}
const overlay = document.createElement('div');
overlay.style.cssText='position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;';
overlay.innerHTML=`
<div style="font-family:'Black Ops One',sans-serif;font-size:18px;color:#aaff00;letter-spacing:4px;">ENTER YOUR NAME</div>
<div style="font-family:'Share Tech Mono',monospace;font-size:9px;color:#3a6000;letter-spacing:2px;">FOR THE GLOBAL LEADERBOARD</div>
<input id="_name-input" maxlength="16" placeholder="GHOST REYES" style="background:rgba(0,15,0,0.95);border:1px solid #3a7000;color:#aaff00;font-family:'Share Tech Mono',monospace;font-size:14px;letter-spacing:3px;padding:10px 16px;text-align:center;outline:none;width:200px;text-transform:uppercase;"/>
<div style="display:flex;gap:10px;">
<button id="_name-ok" style="background:rgba(0,40,0,0.8);border:1px solid #aaff00;color:#aaff00;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:3px;padding:10px 24px;cursor:pointer;">SUBMIT</button>
<button id="_name-skip" style="background:transparent;border:1px solid #2a4000;color:#3a6000;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:3px;padding:10px 24px;cursor:pointer;">SKIP</button>
</div>
`;
document.body.appendChild(overlay);
const inp = overlay.querySelector('#_name-input');
inp.focus();
inp.addEventListener('keydown', e=>{ if(e.key==='Enter') overlay.querySelector('#_name-ok').click(); });
overlay.querySelector('#_name-ok').addEventListener('click', ()=>{
const name = (inp.value.trim().toUpperCase() || 'GHOST').replace(/[<>&"'`]/g, '').slice(0,16) || 'GHOST';
_playerName = name;
try{ localStorage.setItem('diy_player_name', name); }catch(e){}
overlay.remove();
submitToSheets({...scoreData, name});
});
overlay.querySelector('#_name-skip').addEventListener('click', ()=>{
overlay.remove();
submitToSheets({...scoreData, name:'GHOST'});
});
}
(function(){
const btn = el('reset-tutorial-btn');
const status = el('reset-tutorial-status');
if(!btn) return;
function _updateStatus(){
const seen = !!localStorage.getItem(TUTORIAL_KEY);
status.textContent = seen ? 'COMPLETED' : 'NOT YET PLAYED';
status.style.color = seen ? '#2a6040' : '#00ffcc';
}
_updateStatus();
btn.addEventListener('click', ()=>{
audioManager.uiClick();
try{ localStorage.removeItem(TUTORIAL_KEY); }catch(e){}
$props.tutSeen = false;
const bootLevel = gameDB.getAllLevels().find(l=>l.isTutorialLevel);
if(bootLevel){
gameDB.updateLevel(bootLevel.id, { completed: false, timesPlayed: 0, bestScore: 0 });
}
status.textContent = 'OK RESET — OPENS ON NEXT PLAY';
status.style.color = '#aaff00';
btn.textContent = 'OK DONE';
btn.style.borderColor = '#aaff00';
btn.style.color = '#aaff00';
setTimeout(()=>{
btn.textContent = '⟳ REPLAY BOOT CAMP';
btn.style.borderColor = '#2a6040';
btn.style.color = '#00ffcc';
_updateStatus();
}, 2500);
});
btn.addEventListener('touchstart', e=>{ e.preventDefault(); btn.click(); }, {passive:false});
(window._morePanelOpenHooks = window._morePanelOpenHooks || []).push(_updateStatus);   // run when the More panel opens
})();
function applyKbNav(on){
$buildings.settingKbNav = on;
document.body.classList.toggle('kb-nav', on);
document.querySelectorAll('.setting-toggle').forEach(t=>{
t.setAttribute('tabindex', '0');
if(!t._kbListener){
t._kbListener = e=>{
if(e.key==='Enter'||e.key===' '){e.preventDefault();t.click();}
};
t.addEventListener('keydown', t._kbListener);
}
});
document.querySelectorAll('.upgrade-card').forEach(c=>{
c.setAttribute('tabindex', on ? '0' : '-1');
});
}
(function _wireToggleAria(){
document.querySelectorAll('.setting-toggle[role="switch"]').forEach(t=>{
const sync = ()=> t.setAttribute('aria-checked', t.dataset.on === 'true' ? 'true' : 'false');
new MutationObserver(sync).observe(t, {attributes:true, attributeFilter:['data-on']});
sync();
});
})();
(function loadPersistedSettings(){
try{
if(localStorage.getItem('diy_set_fps')==='1'){
$props.fpsVisible=true;
const tog=el('fps-toggle');
tog.dataset.on='true';
tog.querySelector('.toggle-val').textContent='ON';
el('fps-counter').style.display='block';
}
if(localStorage.getItem('diy_set_perf')==='1'){
$buildings.settingPerfMode=true;
_updateShadowFlag();
document.body.classList.add('perf-mode');
const tog=el('perf-toggle');
tog.dataset.on='true';
tog.querySelector('.toggle-val').textContent='ON';
const pRow=el('perf-particles-row');
if(pRow) pRow.style.display='flex';
}
const savedPerfPtcl=localStorage.getItem('diy_set_perf_ptcl');
if(savedPerfPtcl!==null){
$props._perfParticlePct=parseInt(savedPerfPtcl)||20;
const sld=el('perf-particles-slider');
if(sld){ sld.value=$props._perfParticlePct; el('perf-particles-label').textContent=$props._perfParticlePct+'%'; }
}
if(localStorage.getItem('diy_set_30fps')==='1'){
$buildings.setting30fps=true;
const tog=el('fps30-toggle');
tog.dataset.on='true';
tog.querySelector('.toggle-val').textContent='ON';
const badge=el('fps30-badge');
if(badge) badge.style.display='block';
}
$profiler._updateFrameBudget();
if(localStorage.getItem('diy_set_aim')==='0'){
$buildings.settingAimAssist=false;
const tog=el('aim-assist-toggle');
tog.dataset.on='false';
tog.querySelector('.toggle-val').textContent='OFF';
}
if(localStorage.getItem('diy_set_vib')==='0'){
$buildings.settingVibration=false;
const tog=el('vibration-toggle');
tog.dataset.on='false';
tog.querySelector('.toggle-val').textContent='OFF';
}
if(localStorage.getItem('diy_set_cb')==='1'){
$buildings.settingColorblind=true;
const tog=el('cb-toggle');
tog.dataset.on='true';
tog.querySelector('.toggle-val').textContent='ON';
document.body.classList.add('cb-mode');
}
if(localStorage.getItem('diy_set_snd')==='0'){
audioManager.enabled=false;
const tog=el('snd-toggle');
tog.dataset.on='false';
tog.querySelector('.toggle-val').textContent='OFF';
const volRow=el('vol-row');
volRow.style.opacity='0.4';
volRow.style.pointerEvents='none';
}
if(localStorage.getItem('diy_set_music')==='0'){
audioManager.musicEnabled=false;
const tog=el('music-toggle');
tog.dataset.on='false';
tog.querySelector('.toggle-val').textContent='OFF';
const musicVolRow=el('music-vol-row');
musicVolRow.style.opacity='0.4';
musicVolRow.style.pointerEvents='none';
}
const savedMusicVol=localStorage.getItem('diy_set_music_vol');
if(savedMusicVol!==null){
const val=parseInt(savedMusicVol);
audioManager.setMusicVolume(val/100);
el('music-vol-slider').value=val;
el('music-vol-label').textContent=val+'%';
}
if(localStorage.getItem('diy_set_shake')==='0'){
$buildings.settingShakeEnabled=false;
const tog=el('shake-toggle');
tog.dataset.on='false';
tog.querySelector('.toggle-val').textContent='OFF';
}
const savedShakeIntensity=localStorage.getItem('diy_set_shake_intensity');
if(savedShakeIntensity!==null){
const val=parseInt(savedShakeIntensity);
$buildings.settingShakeIntensity=val/100;
el('shake-intensity-slider').value=val;
el('shake-intensity-label').textContent=val+'%';
}
if(localStorage.getItem('diy_set_photosensitive')==='1'){
$buildings.settingPhotosensitive=true;
document.body.classList.add('photosensitive-mode');
const tog=el('photosensitive-toggle');
tog.dataset.on='true';
tog.querySelector('.toggle-val').textContent='ON';
}
if(localStorage.getItem('diy_set_high_contrast')==='1'){
document.body.classList.add('high-contrast-mode');
const tog=el('high-contrast-toggle');
tog.dataset.on='true';
tog.querySelector('.toggle-val').textContent='ON';
}
const savedVol=localStorage.getItem('diy_set_vol');
if(savedVol!==null){
const val=parseInt(savedVol);
audioManager.volume=val/100;
el('vol-slider').value=val;
el('vol-label').textContent=val+'%';
}
const savedDiff=localStorage.getItem('diy_set_diff');
if(savedDiff){
$buildings.settingDifficulty=savedDiff;
document.querySelectorAll('.diff-btn').forEach(b=>{
if(b.dataset.diff) b.classList.toggle('active', b.dataset.diff===savedDiff);
});
}
(function _loadCustomDifficulty(){
const keys = ['hp','speed','spawn','dmg','pspeed'];
const ids = {hp:'cd-hp',speed:'cd-speed',spawn:'cd-spawn',dmg:'cd-dmg',pspeed:'cd-pspeed'};
keys.forEach(key=>{
const saved = localStorage.getItem('diy_set_cd_'+key);
if(saved===null) return;
const val = parseInt(saved);
$buildings.customDiff[key] = val/100;
const slider = el(ids[key]+'-slider'), label = el(ids[key]+'-label');
if(slider) slider.value = val;
if(label) label.textContent = val+'%';
});
if($buildings.settingDifficulty==='custom'){
const cdPanel = el('custom-diff-panel');
if(cdPanel) cdPanel.style.display = 'flex';
}
})();
const savedRes=localStorage.getItem('diy_set_res');
if(savedRes && Object.prototype.hasOwnProperty.call($replay._RES_SCALE_VALUES, savedRes)){
$replay._userResPref = savedRes;
$replay._runtimeRenderScale = $replay._RES_SCALE_VALUES[savedRes];
document.querySelectorAll('.res-btn').forEach(b=>{
b.classList.toggle('active', b.dataset.res===savedRes);
});
}
if(localStorage.getItem('diy_set_auto_switch')==='1'){
$buildings.settingAutoSwitch=true;
const tog=el('auto-switch-toggle');
if(tog){
tog.dataset.on='true';
tog.querySelector('.toggle-val').textContent='ON';
}
}
const savedCustom=localStorage.getItem('diy_custom');
if(savedCustom){
try{
const c=JSON.parse(savedCustom);
Object.assign($buildings.playerCustom, c);
function _applyFaceSrc(src) {
if (!src) return;
const fi = new Image();
fi.onload = () => {
$buildings.playerCustom.faceImage = fi;
const prevImg = el('face-preview-img');
const prev = el('face-preview');
const hint = el('face-preview-hint');
if (prevImg) prevImg.src = fi.src;
if (prev) prev.style.display = 'block';
if (hint) hint.style.display = 'block';
const clearBtn = el('face-clear-btn');
if (clearBtn) clearBtn.style.display = 'inline-block';
const amsPrevImg = document.getElementById('ams-face-preview-img');
const amsPrev = document.getElementById('ams-face-preview');
const amsClear = document.getElementById('ams-face-clear-btn');
if (amsPrevImg) amsPrevImg.src = fi.src;
if (amsPrev) amsPrev.style.display = 'block';
if (amsClear) amsClear.style.display = 'inline-block';
};
fi.src = src;
}
if (typeof FaceDB !== 'undefined') FaceDB.load().then(idbSrc => {
if (idbSrc) {
_applyFaceSrc(idbSrc);
} else {
try {
const lsSrc = localStorage.getItem('diy_face_src');
if (lsSrc) {
if (typeof FaceDB !== 'undefined') FaceDB.save(lsSrc).then(() => {
try { localStorage.removeItem('diy_face_src'); } catch(_) {}
});
_applyFaceSrc(lsSrc);
}
} catch(_) {}
}
});
['skin','color','accent'].forEach(key=>{
document.querySelectorAll(`.swatch[data-key="${key}"]`).forEach(s=>{
s.style.borderColor = s.dataset.val===$buildings.playerCustom[key] ? '#7fff00' : 'transparent';
});
});
}catch(e){}
}
}catch(e){}
})();
(function autoDetectLowEnd(){
try{
if(localStorage.getItem('diy_set_perf') !== null) return;
const mem = navigator.deviceMemory || 4;
const cores = navigator.hardwareConcurrency || 4;
if($core.isUltraLow && !$buildings.settingPerfMode){
$buildings.settingPerfMode = true;
_updateShadowFlag();
document.body.classList.add('perf-mode');
const tog = el('perf-toggle');
if(tog){ tog.dataset.on='true'; tog.querySelector('.toggle-val').textContent='ON'; }
const pRow = el('perf-particles-row');
if(pRow) pRow.style.display='flex';
$props._perfParticlePct = 10;
const sld = el('perf-particles-slider');
if(sld){ sld.value = $props._perfParticlePct; const lbl = el('perf-particles-label'); if(lbl) lbl.textContent = $props._perfParticlePct + '%'; }
$buildings._dqsCap(0.25);
return;
}
const isLowEnd = mem <= 3 || cores <= 4;
if(isLowEnd && !$buildings.settingPerfMode){
$buildings.settingPerfMode = true;
_updateShadowFlag();
document.body.classList.add('perf-mode');
const tog = el('perf-toggle');
if(tog){ tog.dataset.on='true'; tog.querySelector('.toggle-val').textContent='ON'; }
const pRow = el('perf-particles-row');
if(pRow) pRow.style.display='flex';
$buildings._dqsCap(0.4);
}
}catch(e){}
})();
document.addEventListener('keydown', e=>{
if(e.key==='Tab'){ document.body.classList.add('kb-nav'); }
});
document.addEventListener('mousedown', ()=>{
if(!$buildings.settingKbNav) document.body.classList.remove('kb-nav');
});
document.addEventListener('keydown', e=>{
if(e.key==='Escape'){
if(el('more-panel').style.display!=='none'){ if(typeof window._appleCloseMorePanel==='function') window._appleCloseMorePanel(); return; }
const _apoPauseEsc = document.getElementById('apple-pause-overlay');
if(_apoPauseEsc && _apoPauseEsc.classList.contains('visible')){
const _apoRes = document.getElementById('apo-resume');
if(_apoRes) _apoRes.click();
return;
}
if($buildings.isPaused && $buildings.state==='playing'){ togglePause(); return; }
}
if(el('upgrade-panel').style.display!=='none' && $buildings.state==='playing'){
const cards = [...document.querySelectorAll('.upgrade-card')];
if(!cards.length) return;
const focused = document.activeElement;
const idx = cards.indexOf(focused);
if(e.key==='ArrowRight'||e.key==='ArrowDown'){
e.preventDefault();
cards[Math.min(idx+1,cards.length-1)].focus();
}
if(e.key==='ArrowLeft'||e.key==='ArrowUp'){
e.preventDefault();
cards[Math.max(idx-1,0)].focus();
}
if((e.key==='Enter'||e.key===' ') && idx>=0){
e.preventDefault(); focused.click();
}
}
if($buildings.isPaused && $buildings.state==='playing'){
if(e.key==='Enter'||e.key==='r'||e.key==='R'){ el('resume-btn')?.click(); }
if(e.key==='m'||e.key==='M'){ el('menu-btn')?.click(); }
}
});
document.getElementById('co-checkpoint-btn')?.addEventListener('click',()=>{
clearInterval(continueCountdown);
document.getElementById('continue-overlay').classList.remove('active');
$buildings.playerDead = false;
startLevel({ level: $replay.currentLevel, skipFirstWave: true, checkpoint: true });
});
let _fpsFrames=0, _fpsAccum=0, _fpsLast=performance.now(), _fpsDisplay=0;
function _tickFPS(now){
const dt=now-_fpsLast; _fpsLast=now;
_fpsAccum+=dt; _fpsFrames++;
if(_fpsFrames>=30){
_fpsDisplay=Math.round(1000/(_fpsAccum/_fpsFrames));
_fpsAccum=0; _fpsFrames=0;
if($props.fpsVisible) el('fps-counter').textContent='FPS: '+_fpsDisplay;
}
}
});