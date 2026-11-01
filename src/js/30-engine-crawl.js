window.__engine.files.push(function* crawl() {
const $buildings = window.__engine.buildings;
const $crawl = window.__engine.crawl;
Object.assign($crawl, { showArcticCrawl, showDesertCrawl, showMarsCrawl, showNightCrawl, showOpeningCrawl, showOrbitalCrawl, showSpaceCrawl, showUrbanCrawl });
yield;

/* shared crawl math (was copy-pasted into each crawl function) */
function rand(a,b){ return a + Math.random()*(b-a); }
function wrap(v,m){ return ((v%m)+m)%m; }
function clamp01(v){ return v<0?0:v>1?1:v; }
function lerp(a,b,t){ return a+(b-a)*t; }
function ease(t){ t=clamp01(t); return t*t*(3-2*t); }



function showOpeningCrawl(onDone){
const crawl = document.getElementById('story-crawl');
const canvas = document.createElement('canvas');
canvas.id = 'cutscene-canvas';
crawl.insertBefore(canvas, crawl.firstChild);
const cctx = canvas.getContext('2d');
const skipBtn = document.getElementById('cutscene-skip');
const advanceHint = document.getElementById('cutscene-advance-hint');
const beginHint = document.getElementById('cutscene-begin-hint');
const panels = Array.from(crawl.querySelectorAll('.cutscene-panel'));
crawl.classList.add('active');
$buildings.crawlActive = true;

const calm = document.body.classList.contains('photosensitive-mode') || !!$buildings.settingPhotosensitive ||
  (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

let cw=0, ch=0;
function resizeCanvas(){
cw = canvas.width = window.innerWidth;
ch = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function easeOut(t){ t=clamp01(t); return 1-Math.pow(1-t,3); }
function mixColor(c1,c2,t){
const p=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
const [r1,g1,b1]=p(c1), [r2,g2,b2]=p(c2);
return 'rgb('+Math.round(r1+(r2-r1)*t)+','+Math.round(g1+(g2-g1)*t)+','+Math.round(b1+(b2-b1)*t)+')';
}
const MONO = '"Share Tech Mono", monospace';
function fmtTC(t){ const f=Math.floor((t%1)*24), s=Math.floor(t)%60, m=Math.floor(t/60); return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+':'+String(f).padStart(2,'0'); }
function trackedText(str, cx, y, spacing, align){
let w=0; const ws=[]; for(const c of str){ const m=cctx.measureText(c).width; ws.push(m); w+=m+spacing; } w-=spacing;
let x = align==='left' ? cx : cx - w/2;
const prev = cctx.textAlign; cctx.textAlign='left';
let i=0; for(const c of str){ cctx.fillText(c,x,y); x+=ws[i++]+spacing; }
cctx.textAlign=prev;
}
function barH(){ return Math.round(Math.min(Math.max(ch*0.085, 26), 64)); }
function hudSize(){ return ch<460 ? 10 : 11; }

const STARS = (()=>{ const r=mulberry32(2031); return Array.from({length:150},()=>({x:r(), y:r()*0.82, r:0.3+r()*1.3, z:0.2+r()*0.8, ph:r()*10})); })();
function drawStars(t, a){
for(let i=0;i<STARS.length;i++){
const st=STARS[i];
const x=((st.x*cw - t*2.2*st.z)%cw+cw)%cw;
const tw=0.55+0.45*Math.sin(t*1.3+st.ph);
cctx.fillStyle='rgba(215,232,255,'+(tw*a*(0.35+st.z*0.65)).toFixed(2)+')';
cctx.beginPath(); cctx.arc(x, st.y*ch, st.r, 0, Math.PI*2); cctx.fill();
}
}

let SCENE_TOP = 0;
function drawBars(open, leftTop, rightTop, leftBot, rightBot, alertTop){
const h = barH()*ease(open);
cctx.fillStyle='#000'; cctx.fillRect(0,0,cw,h); cctx.fillRect(0,ch-h,cw,h);
if(h>8){
cctx.fillStyle='rgba(170,255,0,0.22)'; cctx.fillRect(0,h,cw,1); cctx.fillRect(0,ch-h-1,cw,1);
const fs=hudSize(); cctx.font=fs+'px '+MONO; cctx.textBaseline='middle';
const ty=h/2, by=ch-h/2;
cctx.textAlign='left';
if(leftTop){ cctx.fillStyle = alertTop ? 'rgba(255,120,100,1)' : 'rgba(190,240,255,1)'; cctx.fillText(leftTop, 16, ty); }
if(leftBot){ cctx.fillStyle='rgba(190,255,60,1)'; cctx.fillText(leftBot, 16, by); }
cctx.textAlign='right';
if(rightBot){ cctx.fillStyle='rgba(190,240,255,0.95)'; cctx.fillText(rightBot, cw-16, by); }
if(rightTop && cw>640){ cctx.fillStyle='rgba(160,230,255,0.7)'; cctx.fillText(rightTop, cw-120, ty); }
cctx.textAlign='left'; cctx.textBaseline='alphabetic';
}
SCENE_TOP = h;
}
function cornerBrackets(){
const h=barH(), m=14, L=16;
cctx.strokeStyle='rgba(170,255,0,0.4)'; cctx.lineWidth=1.5;
[[m,h+m,1,1],[cw-m,h+m,-1,1],[m,ch-h-m,1,-1],[cw-m,ch-h-m,-1,-1]].forEach(c=>{
cctx.beginPath(); cctx.moveTo(c[0], c[1]+c[3]*L); cctx.lineTo(c[0],c[1]); cctx.lineTo(c[0]+c[2]*L,c[1]); cctx.stroke();
});
}
function glitchSlices(n, amt){
if(calm) return;
for(let i=0;i<n;i++){
const sy=Math.floor(rand(0,ch)), sh=Math.floor(rand(3,18)), dx=Math.floor(rand(-amt,amt));
try{ cctx.drawImage(canvas, 0,sy,cw,sh, dx,sy,cw,sh); }catch(e){}
}
}
function anamorphic(x,y,len,a,col){
const g=cctx.createLinearGradient(x-len,y,x+len,y);
g.addColorStop(0,'rgba('+col+',0)'); g.addColorStop(0.5,'rgba('+col+','+a.toFixed(3)+')'); g.addColorStop(1,'rgba('+col+',0)');
cctx.fillStyle=g; cctx.fillRect(x-len,y-1.2,len*2,2.4);
const r=cctx.createRadialGradient(x,y,0,x,y,len*0.18);
r.addColorStop(0,'rgba(255,255,255,'+(a*0.9).toFixed(3)+')'); r.addColorStop(1,'rgba('+col+',0)');
cctx.fillStyle=r; cctx.beginPath(); cctx.arc(x,y,len*0.18,0,Math.PI*2); cctx.fill();
}

let embers = [];
function spawnEmbers(n, colorFn, up){
for(let i=0;i<n;i++){
embers.push({x:rand(0,cw), y:up? ch+rand(0,60) : rand(-40,ch*0.3), vy: up? rand(-48,-16) : rand(14,34), vx:rand(-10,10), r:rand(0.8,2.6), life:rand(3,7), t:0, col:colorFn()});
}
}
function stepEmbers(dt){
for(let i=embers.length-1;i>=0;i--){
const e=embers[i];
e.t+=dt; e.x+=e.vx*dt + Math.sin(e.t*2+i)*0.25; e.y+=e.vy*dt;
if(e.t>e.life || e.y<-20 || e.y>ch+20){ embers.splice(i,1); continue; }
const a=Math.max(0,1-e.t/e.life);
cctx.fillStyle=e.col.replace('ALPHA',(a*0.85).toFixed(2));
cctx.beginPath(); cctx.arc(e.x,e.y,e.r,0,Math.PI*2); cctx.fill();
}
}

const CITIES = (()=>{
const r=mulberry32(77), arr=[];
const g=()=> (r()+r()+r()-1.5)/1.5;
const regions=[
{u:0.02,v:0.20,n:78,s:0.10,nova:true},
{u:-0.46,v:0.14,n:42,s:0.09}, {u:0.52,v:0.22,n:46,s:0.10},
{u:-0.82,v:0.32,n:26,s:0.07}, {u:0.86,v:0.12,n:22,s:0.06}, {u:-0.20,v:0.52,n:30,s:0.10}, {u:0.30,v:0.58,n:24,s:0.08}
];
regions.forEach(rg=>{
for(let i=0;i<rg.n;i++){
const u=rg.u+g()*rg.s*2.2, v=Math.max(0.01,rg.v+g()*rg.s*1.6);
const d=Math.hypot(u-0.02,(v-0.20)*1.3);
arr.push({u,v,b:0.4+r()*0.6,ph:r()*10,d, off: d<0.5 ? 1.4 + d*8.5 + r()*0.4 : 99});
}
});
return arr;
})();
function earthGeom(t){
const k=1+Math.min(t,9)*0.016;
const R=Math.max(cw*0.95, ch*1.5)*k;
const topY=ch*0.64 - Math.min(t,8)*ch*0.004;
return {R, cx:cw*0.5, cy:topY+R, topY};
}
function cityXY(c, E){
const x=E.cx + c.u*E.R*0.8;
const yTop=E.cy - Math.sqrt(Math.max(0,E.R*E.R-(x-E.cx)*(x-E.cx)));
return {x, y:yTop + c.v*E.R*0.26};
}
function drawScene0(t){
const g=cctx.createLinearGradient(0,0,0,ch); g.addColorStop(0,'#01030a'); g.addColorStop(1,'#050e22');
cctx.fillStyle=g; cctx.fillRect(0,0,cw,ch);
drawStars(t,0.95);
const E=earthGeom(t);
const body=cctx.createRadialGradient(E.cx,E.cy-E.R*0.92,E.R*0.04,E.cx,E.cy,E.R);
body.addColorStop(0,'#0e2f5a'); body.addColorStop(0.55,'#071b36'); body.addColorStop(1,'#02060d');
cctx.fillStyle=body; cctx.beginPath(); cctx.arc(E.cx,E.cy,E.R,0,Math.PI*2); cctx.fill();
const gx=E.cx-E.R*0.62, gy=E.cy-Math.sqrt(E.R*E.R-E.R*E.R*0.62*0.62);
const dawn=cctx.createRadialGradient(gx,gy,0,gx,gy,E.R*0.35);
dawn.addColorStop(0,'rgba(255,170,90,0.55)'); dawn.addColorStop(1,'rgba(255,120,40,0)');
cctx.fillStyle=dawn; cctx.fillRect(0,0,cw,ch);
cctx.save();
cctx.shadowColor='rgba(90,170,255,0.95)'; cctx.shadowBlur=26;
cctx.strokeStyle='rgba(120,190,255,0.75)'; cctx.lineWidth=2.4;
cctx.beginPath(); cctx.arc(E.cx,E.cy,E.R,Math.PI*1.2,Math.PI*1.8); cctx.stroke();
cctx.restore();
const fres=cctx.createRadialGradient(E.cx,E.cy,E.R*0.94,E.cx,E.cy,E.R);
fres.addColorStop(0,'rgba(80,160,255,0)'); fres.addColorStop(1,'rgba(80,160,255,0.28)');
cctx.fillStyle=fres; cctx.beginPath(); cctx.arc(E.cx,E.cy,E.R,0,Math.PI*2); cctx.fill();
cctx.globalCompositeOperation='lighter';
let novaXY=null;
for(let i=0;i<CITIES.length;i++){
const c=CITIES[i], p=cityXY(c,E);
if(c.d<0.04) novaXY=novaXY||p;
let a=c.b*(0.7+0.3*Math.sin(t*3+c.ph));
if(t>c.off) a*=Math.max(0,1-(t-c.off)/0.35);
if(a<=0.01) continue;
cctx.fillStyle='rgba(255,196,120,'+a.toFixed(2)+')';
cctx.fillRect(p.x,p.y,1.8,1.8);
if(c.b>0.8){ cctx.fillStyle='rgba(255,170,90,'+(a*0.12).toFixed(3)+')'; cctx.beginPath(); cctx.arc(p.x,p.y,5,0,Math.PI*2); cctx.fill(); }
}
cctx.globalCompositeOperation='source-over';
const NOVA=cityXY({u:0.02,v:0.20},E);
if(t>1.0){
const per=1.8, ph=((t-1.0)%per)/per;
cctx.strokeStyle='rgba(255,70,50,'+((1-ph)*0.65).toFixed(2)+')'; cctx.lineWidth=1.6;
cctx.beginPath(); cctx.ellipse(NOVA.x,NOVA.y,ph*E.R*0.26,ph*E.R*0.08,0,0,Math.PI*2); cctx.stroke();
}
if(t>2.2 && ch>=500){
const a=easeOut((t-2.2)/0.8);
cctx.strokeStyle='rgba(255,90,70,'+(a*0.9).toFixed(2)+')'; cctx.lineWidth=1.2;
const lx=NOVA.x+Math.min(cw*0.1,120), ly=NOVA.y+hudSize()+2;
cctx.beginPath(); cctx.moveTo(NOVA.x+6,NOVA.y); cctx.lineTo(lx-10,NOVA.y); cctx.lineTo(lx,ly); cctx.lineTo(lx+84,ly); cctx.stroke();
cctx.strokeRect(NOVA.x-5,NOVA.y-5,10,10);
cctx.font=hudSize()+'px '+MONO; cctx.fillStyle='rgba(255,130,110,'+a.toFixed(2)+')'; cctx.textAlign='left';
cctx.fillText('NOVA CITY', lx+4, ly-5);
cctx.fillStyle='rgba(255,200,190,'+(a*0.8).toFixed(2)+')'; cctx.fillText(t>3.6?'SIGNAL: NONE':'SIGNAL: ····', lx+4, ly+hudSize()+4);
}
const sp=clamp01(t/9);
const sx=lerp(-0.08*cw,1.08*cw,sp), sy=ch*0.2+Math.sin(sp*Math.PI)*-ch*0.04;
cctx.save(); cctx.translate(sx,sy);
cctx.fillStyle='#0b1424'; cctx.fillRect(-3,-2,6,4);
cctx.fillStyle='#16294a'; cctx.fillRect(-15,-1.5,10,3); cctx.fillRect(5,-1.5,10,3);
if(Math.sin(t*5)>0.4){ cctx.fillStyle='rgba(255,80,60,0.95)'; cctx.fillRect(-1,-4,2,2); }
cctx.restore();
drawBars(t/1.4, 'SAT-LINK 7 // ORBITAL RECON', null, 'N 41°22′  E 12°08′  ALT 412 KM', 'T−21 DAYS  '+fmtTC(t));
}

function makeLayer(seed,count,wMin,wMax,hMin,hMax,winProb){
const r=mulberry32(seed), bs=[], wins=[]; let x=0;
for(let i=0;i<count;i++){ const w=wMin+r()*(wMax-wMin), h=hMin+r()*(hMax-hMin); bs.push({x,w,h}); x+=w+3+r()*10; }
bs.forEach(b=>{
for(let wy=22; wy<b.h-8; wy+=16) for(let wx=7; wx<b.w-9; wx+=13){
if(r()<winProb) wins.push({bx:b.x+wx, by:b.h-wy, lit:r()<0.7, off:1+r()*4.2, ph:r()*10});
}
});
return {bs,wins,totalW:x};
}
const FAR_L  = makeLayer(11,34,26,56,50,190,0.35);
const NEAR_L = makeLayer(29,22,46,96,100,330,0.5);
function drawLayer(L, t, fill, lightRGB, parallax, strikeT, haze){
const scale=Math.max(cw/L.totalW,0.001)*1.55;
const baseX=-(L.totalW*scale-cw)/2 - t*parallax;
cctx.fillStyle=fill;
L.bs.forEach(b=>{ cctx.fillRect(baseX+b.x*scale, ch-b.h*scale*0.9-barH()*0.4, b.w*scale, b.h*scale*0.9+80); });
if(haze){ const hg=cctx.createLinearGradient(0,ch*0.45,0,ch); hg.addColorStop(0,'rgba(20,40,70,0)'); hg.addColorStop(1,'rgba(40,70,110,'+haze+')'); cctx.fillStyle=hg; cctx.fillRect(0,ch*0.45,cw,ch*0.55); }
if(!lightRGB) return;
for(let i=0;i<L.wins.length;i++){
const w=L.wins[i];
let on=w.lit;
if(t>w.off+1.5 && w.ph>4) on=false;
if(strikeT>0 && strikeT>w.ph*0.06) on=false;
if(!on) continue;
const fl=0.5+0.4*Math.sin(t*2.4+w.ph);
cctx.fillStyle='rgba('+lightRGB+','+fl.toFixed(2)+')';
cctx.fillRect(baseX+w.bx*scale, ch-w.by*scale*0.9-barH()*0.4, 4.5*scale*0.9, 6*scale*0.9);
}
}
function drawVrethShip(x,y,W,t,beamA,beamCol,ph){
cctx.save(); cctx.translate(x,y);
const H=W*0.2;
if(beamA>0.01){
cctx.globalCompositeOperation='lighter';
const bg=cctx.createLinearGradient(0,H*0.4,0,ch-y);
bg.addColorStop(0,'rgba('+beamCol+','+beamA.toFixed(3)+')'); bg.addColorStop(1,'rgba('+beamCol+',0)');
cctx.fillStyle=bg;
cctx.beginPath(); cctx.moveTo(-W*0.035,H*0.4); cctx.lineTo(W*0.035,H*0.4); cctx.lineTo(W*0.2,ch-y); cctx.lineTo(-W*0.2,ch-y); cctx.closePath(); cctx.fill();
cctx.globalCompositeOperation='source-over';
}
cctx.fillStyle='#04070a';
cctx.beginPath();
cctx.moveTo(-W*0.5,H*0.12);
cctx.quadraticCurveTo(-W*0.28,-H*0.28,-W*0.1,-H*0.3);
cctx.quadraticCurveTo(0,-H*0.62,W*0.1,-H*0.3);
cctx.quadraticCurveTo(W*0.28,-H*0.28,W*0.5,H*0.12);
cctx.quadraticCurveTo(W*0.28,H*0.5,0,H*0.46);
cctx.quadraticCurveTo(-W*0.28,H*0.5,-W*0.5,H*0.12);
cctx.fill();
cctx.strokeStyle='rgba(150,230,120,0.4)'; cctx.lineWidth=1.2;
cctx.beginPath(); cctx.moveTo(-W*0.48,H*0.1); cctx.quadraticCurveTo(-W*0.26,-H*0.24,-W*0.1,-H*0.28); cctx.quadraticCurveTo(0,-H*0.58,W*0.1,-H*0.28); cctx.quadraticCurveTo(W*0.26,-H*0.24,W*0.48,H*0.1); cctx.stroke();
for(let i=0;i<16;i++){
const a=(i/16)*Math.PI*2 + ph;
const lx=Math.cos(a)*W*0.34, ly=H*0.28+Math.sin(a)*H*0.12;
const on=0.4+0.6*Math.max(0,Math.sin(t*3+i*0.9));
if(Math.sin(a)<-0.1) continue;
cctx.fillStyle='rgba(150,255,80,'+on.toFixed(2)+')'; cctx.fillRect(lx-1.5,ly-1.5,3,3);
}
const eg=cctx.createRadialGradient(0,H*0.42,0,0,H*0.42,W*0.09);
eg.addColorStop(0,'rgba('+beamCol+','+Math.min(1,beamA*5+0.35).toFixed(2)+')'); eg.addColorStop(1,'rgba('+beamCol+',0)');
cctx.fillStyle=eg; cctx.beginPath(); cctx.arc(0,H*0.42,W*0.09,0,Math.PI*2); cctx.fill();
cctx.restore();
}
function drawTrooper(x,y,k,bobT,alive){
if(alive<=0) return;
const bob=Math.sin(bobT*5)*1.6*k;
cctx.fillStyle='rgba(3,4,3,'+alive.toFixed(2)+')';
cctx.fillRect(x-3*k,y-20*k+bob,6*k,20*k);
cctx.beginPath(); cctx.arc(x,y-23*k+bob,4.2*k,0,Math.PI*2); cctx.fill();
cctx.fillRect(x+2*k,y-17*k+bob,15*k,2.4*k);
if(Math.sin(bobT*2.3+x)>0.6){ cctx.fillStyle='rgba(255,80,60,'+alive.toFixed(2)+')'; cctx.fillRect(x-1,y-28*k+bob,2,2); }
}
const TROOPS = Array.from({length:7},(_,i)=>({x:0.1+i*0.12, bob:i*1.3}));
let scene1Struck=false;
const STRIKE_T = 5.0;
function drawScene1(t, dt){
const st = t-STRIKE_T;
const struck = st>0;
const sk = struck ? Math.max(0,1-st/1.2) : 0;
const shake = (calm?0.25:1) * (0.6 + (struck? sk*14 : Math.max(0,(t-3.6))*1.4));
const ox=(Math.sin(t*23)+Math.sin(t*37.7))*0.5*shake, oy=(Math.sin(t*29.1)+Math.sin(t*41.3))*0.5*shake;
cctx.save(); cctx.translate(ox,oy);
const sg=cctx.createLinearGradient(0,0,0,ch);
const red=Math.min(1,Math.max(0,st/2.5));
sg.addColorStop(0,mixColor('#050912','#240606',red)); sg.addColorStop(1,mixColor('#101a2c','#4a1405',red));
cctx.fillStyle=sg; cctx.fillRect(-40,-40,cw+80,ch+80);
for(let i=0;i<6;i++){
const y=ch*(0.08+i*0.07), dir=i%2?1:-1;
for(let j=0;j<6;j++){
const x=(((j*cw/4.6 + t*(6+i*3)*dir)%(cw*1.4))+cw*1.4)%(cw*1.4)-cw*0.2;
const rg=cctx.createRadialGradient(x,y,2,x,y,cw*0.22);
rg.addColorStop(0,'rgba(34,46,70,'+(0.34-i*0.03).toFixed(2)+')'); rg.addColorStop(1,'rgba(34,46,70,0)');
cctx.fillStyle=rg; cctx.beginPath(); cctx.ellipse(x,y,cw*0.22,ch*0.07,0,0,Math.PI*2); cctx.fill();
}
}
const lf=[1.25,3.05,4.55];
let bolt=0; lf.forEach(L=>{ const d=t-L; if(d>0&&d<0.28) bolt=Math.max(bolt,(1-d/0.28)*(Math.sin(d*60)>-0.3?1:0.4)); });
if(bolt>0){ cctx.fillStyle='rgba(190,215,255,'+(bolt*(calm?0.08:0.2)).toFixed(3)+')'; cctx.fillRect(-40,-40,cw+80,ch+80); }
const beamBase = 0.07+0.04*Math.sin(t*1.6);
const beamA = struck ? Math.min(0.85, 0.2+sk*0.7) : beamBase + clamp01((t-3.6)/1.4)*0.18;
const beamCol = struck ? '255,235,210' : '140,255,70';
const mW = Math.min(cw*0.78, ch*1.35, 760);
drawVrethShip(cw*0.5, Math.max(ch*0.2, barH()+mW*0.2*0.7) + Math.sin(t*0.5)*3, mW, t, beamA, beamCol, t*0.3);
[[0.17,0.17,0.2],[0.84,0.2,0.17],[0.7,0.1,0.13]].forEach((e,i)=>{
drawVrethShip(cw*e[0] + Math.sin(t*0.4+i)*8, ch*e[1] + Math.sin(t*0.7+i*2)*4, cw*e[2], t+i, 0.03, '140,255,70', t*0.4+i);
});
drawLayer(FAR_L, t, '#0a1220', '255,190,120', 2.2, struck?st:0, 0.35);
drawLayer(NEAR_L, t, '#03050a', '255,160,95', 4.5, struck?st:0, 0);
if(struck){
const fg=cctx.createLinearGradient(0,ch*0.55,0,ch);
fg.addColorStop(0,'rgba(255,90,20,0)'); fg.addColorStop(1,'rgba(255,100,30,'+Math.min(0.55,st*0.22).toFixed(2)+')');
cctx.fillStyle=fg; cctx.fillRect(-40,ch*0.55,cw+80,ch*0.5);
}
TROOPS.forEach(tr=>{
const k=Math.max(0.8,Math.min(1.5,ch/520));
const alive = struck ? Math.max(0, 1-st/0.35) : 1;
drawTrooper(tr.x*cw + t*3, ch-barH()-8, k, t+tr.bob, alive);
});
if(struck){
if(!scene1Struck){ scene1Struck=true; spawnEmbers(calm?20:60, ()=> Math.random()<0.5?'rgba(255,150,70,ALPHA)':'rgba(255,70,25,ALPHA)', true); }
const fa=Math.max(0,1-st/0.9);
cctx.fillStyle='rgba(255,236,210,'+(fa*(calm?0.3:0.95)).toFixed(3)+')'; cctx.fillRect(-40,-40,cw+80,ch+80);
const rp=clamp01(st/1.6);
cctx.strokeStyle='rgba(255,210,160,'+((1-rp)*0.8).toFixed(2)+')'; cctx.lineWidth=3+ (1-rp)*6;
cctx.beginPath(); cctx.ellipse(cw*0.5, ch*0.8, rp*cw*0.9, rp*ch*0.22, 0, 0, Math.PI*2); cctx.stroke();
if(st<0.5) anamorphic(cw*0.5, ch*0.78, cw*0.6, (1-st/0.5)*(calm?0.3:0.8), '255,220,180');
}
stepEmbers(dt||0.016);
cctx.restore();
if(struck && st<1.4 && !calm) glitchSlices(6, 26);
if(bolt>0.5 && !calm) anamorphic(cw*0.3, ch*0.12, cw*0.35, bolt*0.5, '190,215,255');
const count = struck ? Math.max(0, 12 - Math.floor(st*40)) : 12;
if(struck && !calm){ for(let i=0;i<40;i++){ cctx.fillStyle='rgba(255,255,255,'+(Math.random()*0.12*Math.max(0,1-st/2)).toFixed(3)+')'; cctx.fillRect(rand(0,cw),rand(0,ch),rand(10,80),1); } }
const live = !struck || (Math.floor(t*6)%2===0);
drawBars(1, struck ? (live?'A7-03 // NO CARRIER':'') : 'HELMCAM A7-03 // LIVE', null, 'ALPHA-7  ACTIVE '+String(count).padStart(2,'0')+'/12', fmtTC(t+14.0), struck);
if(!struck && Math.floor(t*1.6)%2===0){ cctx.fillStyle='rgba(255,60,50,0.95)'; cctx.beginPath(); cctx.arc(barH()*0.5 + (hudSize()===10?170:200), barH()/2, 3, 0, Math.PI*2); cctx.fill(); }
cornerBrackets();
}

const SMOKE = Array.from({length:3},(_,i)=>({x:0.2+i*0.3+(i%2?0.05:-0.04), sp:14+i*5, sz:0.09+i*0.015}));
const RUBBLE = (()=>{ const r=mulberry32(5), pts=[]; for(let i=0;i<=40;i++) pts.push({x:i/40, h: 4+r()*22 + (r()<0.12? r()*46 : 0)}); return pts; })();
function reyesPath(sx, sy, k, t){
const step=Math.sin(t*2.6)*5, bob=Math.abs(Math.sin(t*2.6))*1.4;
cctx.beginPath(); cctx.arc(0,-46-bob,7.5,0,Math.PI*2);
cctx.rect(-8,-41-bob,16,4);
cctx.rect(-7,-38-bob,14,32);
cctx.rect(-6+step,-8-bob,7,26);
cctx.rect(0-step,-8-bob,7,26);
cctx.rect(-12,-34-bob,6,20);
cctx.moveTo(3,-47-bob); cctx.rect(6,-58-bob,1.6,14);
}
function drawReyesCine(sx, sy, k, t){
cctx.save(); cctx.translate(sx,sy); cctx.scale(k,k);
reyesPath(0,0,1,t);
cctx.strokeStyle='rgba(255,140,60,0.55)'; cctx.lineWidth=3; cctx.stroke();
cctx.fillStyle='#030201'; cctx.fill();
cctx.save(); cctx.rotate(-0.12);
cctx.fillStyle='#030201'; cctx.fillRect(4,-33,36,4); cctx.fillRect(14,-30,6,8);
cctx.strokeStyle='rgba(255,140,60,0.35)'; cctx.lineWidth=1; cctx.strokeRect(4,-33,36,4);
cctx.restore();
cctx.fillStyle='#6a1a10';
const bob=Math.abs(Math.sin(t*2.6))*1.4;
cctx.beginPath(); cctx.moveTo(-6,-38-bob);
cctx.quadraticCurveTo(-20,-37+Math.sin(t*5)*3-bob,-34-Math.sin(t*3.4)*3,-31+Math.sin(t*4.2)*4-bob);
cctx.lineTo(-32-Math.sin(t*3.4)*3,-25+Math.sin(t*4.2)*4-bob);
cctx.quadraticCurveTo(-18,-30-bob,-5,-33-bob); cctx.closePath(); cctx.fill();
cctx.restore();
}
function drawScene2(t, dt){
const sg=cctx.createLinearGradient(0,0,0,ch);
sg.addColorStop(0,'#09030a'); sg.addColorStop(0.5,'#33090a'); sg.addColorStop(1,'#8a3010');
cctx.fillStyle=sg; cctx.fillRect(0,0,cw,ch);
drawStars(t,0.25);
[[0.78,0.2,0.05],[0.9,0.28,0.035]].forEach((e,i)=>{
const x=cw*e[0]+t*(4+i*2), y=ch*e[1]-t*(1.5+i);
drawVrethShip(x%(cw*1.1), y, cw*e[2], t+i, 0, '140,255,70', t*0.5);
});
const heat=cctx.createRadialGradient(cw*0.6,ch*0.9,10,cw*0.6,ch*0.9,cw*0.7);
heat.addColorStop(0,'rgba(255,120,40,'+(0.4+0.08*Math.sin(t*1.3)).toFixed(2)+')'); heat.addColorStop(1,'rgba(255,90,20,0)');
cctx.fillStyle=heat; cctx.fillRect(0,0,cw,ch);
drawLayer(FAR_L, 0, '#1a0805', null, 0, 1, 0);
for(let i=0;i<6;i++){
const fx=cw*(0.12+i*0.15), fy=ch*(0.58+0.05*Math.sin(i*2.3)), fl=0.6+0.4*Math.sin(t*9+i*3);
const fg=cctx.createRadialGradient(fx,fy,0,fx,fy,26+fl*10);
fg.addColorStop(0,'rgba(255,200,90,'+(0.55*fl).toFixed(2)+')'); fg.addColorStop(1,'rgba(255,90,20,0)');
cctx.fillStyle=fg; cctx.beginPath(); cctx.arc(fx,fy,36,0,Math.PI*2); cctx.fill();
}
drawLayer(NEAR_L, 0, '#0d0403', null, 0, 1, 0);
SMOKE.forEach((sm,i)=>{
for(let j=0;j<9;j++){
const p=(((t*0.07*sm.sp/14)+j/9)%1);
const x=cw*sm.x + Math.sin(p*5+i)*cw*0.03 + p*cw*0.05, y=ch*0.62 - p*ch*0.5;
const r=cw*sm.sz*(0.5+p*1.4);
const sg2=cctx.createRadialGradient(x,y,0,x,y,r);
sg2.addColorStop(0,'rgba(20,10,8,'+((1-p)*0.4).toFixed(2)+')'); sg2.addColorStop(1,'rgba(20,10,8,0)');
cctx.fillStyle=sg2; cctx.beginPath(); cctx.arc(x,y,r,0,Math.PI*2); cctx.fill();
}
});
cctx.fillStyle='#050202';
cctx.beginPath(); cctx.moveTo(0,ch);
const gY=ch-barH()-ch*0.06;
RUBBLE.forEach(p=>cctx.lineTo(p.x*cw, gY-p.h*(ch/600)));
cctx.lineTo(cw,ch); cctx.closePath(); cctx.fill();
cctx.strokeStyle='rgba(255,120,50,0.25)'; cctx.lineWidth=1.2; cctx.beginPath();
RUBBLE.forEach((p,i)=>{ const x=p.x*cw,y=gY-p.h*(ch/600); if(i===0) cctx.moveTo(x,y); else cctx.lineTo(x,y); }); cctx.stroke();
const k=Math.max(0.85,Math.min(1.55,ch/520));
const rx=cw*(ch<460?0.2:0.31) + Math.min(t,12)*2.2;
drawReyesCine(rx, gY+2, k, t);
if(embers.length<46 && Math.random()<0.45) spawnEmbers(1, ()=> Math.random()<0.5?'rgba(255,130,60,ALPHA)':'rgba(190,190,190,ALPHA)', Math.random()<0.5);
stepEmbers(dt||0.016);
anamorphic(cw*0.62, ch*0.62, cw*0.5, 0.10+0.04*Math.sin(t*2), '255,150,70');
if(t>4.0){
const a=easeOut((t-4.0)/1.4);
const ty=barH()+Math.max(ch*0.1,32);
cctx.save(); cctx.globalAlpha=a;
const fs=Math.max(18,Math.min(ch*0.075,52));
cctx.font=fs+'px "Black Ops One", sans-serif'; cctx.fillStyle='#fff1e6';
cctx.shadowColor='rgba(255,70,30,0.8)'; cctx.shadowBlur=18;
trackedText('OPERATION: CITY HEAT', cw/2, ty, fs*0.2, 'center');
cctx.shadowBlur=0;
const lw=lerp(0,Math.min(cw*0.5,420),easeOut((t-4.2)/1.2));
cctx.fillStyle='rgba(255,74,34,0.9)'; cctx.fillRect(cw/2-lw/2, ty+fs*0.45, lw, 1.5);
cctx.restore();
if(t<4.6) anamorphic(cw/2, ty-fs*0.3, cw*0.5, (1-(t-4.0)/0.6)*0.5, '255,170,110');
}
const L2=['EXTRACTION: NONE','BACKUP: NONE','ALPHA-7: 1 SURVIVOR'];
const li=Math.min(2,Math.floor(Math.max(0,t-0.8)/2.2));
const typed=L2[li].slice(0, Math.floor(Math.max(0,(t-0.8-li*2.2))*16));
const caret=(Math.floor(t*3)%2===0)?'▌':' ';
glitchSlices(t>0.4 && Math.sin(t*7.1)>0.93?3:0, 10);
drawBars(1,'RADIO // JAMMED', null, typed+caret, fmtTC(t+31.0), true);
const mh=barH();
if(cw>520){ for(let i=0;i<14;i++){ const h=2+Math.abs(Math.sin(t*9+i*1.7)+Math.sin(t*5+i))*mh*0.16; cctx.fillStyle='rgba(255,90,70,0.8)'; cctx.fillRect(190+i*5, mh/2-h/2, 3, h); } }
cornerBrackets();
}

_startCrawl({
crawl: crawl, panels: panels, advanceHint: advanceHint, beginHint: beginHint,
durations: [3200, 3800], pulse: 'crawlBtnPulse', resize: resizeCanvas, canvas: canvas,
draw: (i, t, dt)=>{
cctx.clearRect(0,0,cw,ch);
if(i===0) drawScene0(t);
else if(i===1) drawScene1(t, dt);
else drawScene2(t, dt);
},
onReset: ()=>{ embers = []; },
skipBtn: skipBtn,
onDone: onDone
});
}

function showDesertCrawl(onDone){
const crawl = document.getElementById('story-crawl-desert');
const canvas = document.createElement('canvas');
canvas.id = 'cutscene-canvas-desert';
crawl.insertBefore(canvas, crawl.firstChild);
const cctx = canvas.getContext('2d');
const advanceHint = document.getElementById('cutscene-advance-hint-desert');
const beginHint = document.getElementById('cutscene-begin-hint-desert');
const panels = Array.from(crawl.querySelectorAll('.cutscene-panel'));
crawl.classList.add('active');
$buildings.crawlActive = true;

const calm = document.body.classList.contains('photosensitive-mode') || !!$buildings.settingPhotosensitive ||
  (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

let cw=0, ch=0;
function resizeCanvas(){
cw = canvas.width = window.innerWidth;
ch = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function easeOut(t){ t=clamp01(t); return 1-Math.pow(1-t,3); }
function mixColor(c1,c2,t){
const p=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
const [r1,g1,b1]=p(c1), [r2,g2,b2]=p(c2);
return 'rgb('+Math.round(r1+(r2-r1)*t)+','+Math.round(g1+(g2-g1)*t)+','+Math.round(b1+(b2-b1)*t)+')';
}
const MONO = '"Share Tech Mono", monospace';
function fmtTC(t){ const f=Math.floor((t%1)*24), s2=Math.floor(t)%60, m=Math.floor(t/60); return String(m).padStart(2,'0')+':'+String(s2).padStart(2,'0')+':'+String(f).padStart(2,'0'); }
function trackedText(str, cx, y, spacing){
let w=0; const ws=[]; for(const c of str){ const m=cctx.measureText(c).width; ws.push(m); w+=m+spacing; } w-=spacing;
let x=cx-w/2; const prev=cctx.textAlign; cctx.textAlign='left';
let i=0; for(const c of str){ cctx.fillText(c,x,y); x+=ws[i++]+spacing; }
cctx.textAlign=prev;
}
function barH(){ return Math.round(Math.min(Math.max(ch*0.085, 26), 64)); }
function hudSize(){ return ch<460 ? 10 : 11; }
function drawBars(open, leftTop, leftBot, rightBot, alertTop){
const h=barH()*ease(open);
cctx.fillStyle='#000'; cctx.fillRect(0,0,cw,h); cctx.fillRect(0,ch-h,cw,h);
if(h>8){
cctx.fillStyle='rgba(255,170,60,0.28)'; cctx.fillRect(0,h,cw,1); cctx.fillRect(0,ch-h-1,cw,1);
cctx.font=hudSize()+'px '+MONO; cctx.textBaseline='middle';
cctx.shadowColor='rgba(255,170,60,0.6)'; cctx.shadowBlur=6;
const ty=h/2, by=ch-h/2; cctx.textAlign='left';
if(leftTop){ cctx.fillStyle = alertTop ? 'rgba(255,130,90,1)' : 'rgba(255,226,176,1)'; cctx.fillText(leftTop,16,ty); }
if(leftBot){ cctx.fillStyle='rgba(255,196,100,1)'; cctx.fillText(leftBot,16,by); }
cctx.textAlign='right';
if(rightBot){ cctx.fillStyle='rgba(255,226,176,0.95)'; cctx.fillText(rightBot,cw-16,by); }
cctx.textAlign='left'; cctx.textBaseline='alphabetic'; cctx.shadowBlur=0;
}
}
function cornerBrackets(){
const h=barH(), m=14, L=16;
cctx.strokeStyle='rgba(255,190,90,0.4)'; cctx.lineWidth=1.5;
[[m,h+m,1,1],[cw-m,h+m,-1,1],[m,ch-h-m,1,-1],[cw-m,ch-h-m,-1,-1]].forEach(c=>{
cctx.beginPath(); cctx.moveTo(c[0],c[1]+c[3]*L); cctx.lineTo(c[0],c[1]); cctx.lineTo(c[0]+c[2]*L,c[1]); cctx.stroke();
});
}
function anamorphic(x,y,len,a,col){
const g=cctx.createLinearGradient(x-len,y,x+len,y);
g.addColorStop(0,'rgba('+col+',0)'); g.addColorStop(0.5,'rgba('+col+','+a.toFixed(3)+')'); g.addColorStop(1,'rgba('+col+',0)');
cctx.fillStyle=g; cctx.fillRect(x-len,y-1.2,len*2,2.4);
const r=cctx.createRadialGradient(x,y,0,x,y,len*0.18);
r.addColorStop(0,'rgba(255,255,255,'+(a*0.9).toFixed(3)+')'); r.addColorStop(1,'rgba('+col+',0)');
cctx.fillStyle=r; cctx.beginPath(); cctx.arc(x,y,len*0.18,0,Math.PI*2); cctx.fill();
}

let dust = [];
function stepDust(dt, n, alpha){
if(dust.length<n && Math.random()<0.6) dust.push({x:cw+rand(0,40), y:rand(barH(),ch-barH()), vx:-rand(60,170), vy:rand(-6,6), r:rand(0.6,1.8), t:0, life:rand(2,5)});
for(let i=dust.length-1;i>=0;i--){
const d=dust[i]; d.t+=dt; d.x+=d.vx*dt; d.y+=d.vy*dt;
if(d.t>d.life || d.x<-20){ dust.splice(i,1); continue; }
cctx.fillStyle='rgba(255,214,160,'+(Math.max(0,1-d.t/d.life)*alpha).toFixed(2)+')';
cctx.fillRect(d.x,d.y,d.r*3,d.r);
}
}

function makeMesas(seed,n,wMin,wMax,hMin,hMax){
const r=mulberry32(seed), arr=[]; let x=-0.08;
for(let i=0;i<n;i++){ const w=wMin+r()*(wMax-wMin), h=hMin+r()*(hMax-hMin); arr.push({x,w,h,step:r()<0.5}); x+=w*(0.55+r()*0.7); }
return arr;
}
const MESA_FAR=makeMesas(41,9,0.07,0.16,0.02,0.06), MESA_NEAR=makeMesas(7,6,0.1,0.22,0.03,0.08);
function drawMesas(arr, baseY, color){
cctx.fillStyle=color;
arr.forEach(m=>{
const x=m.x*cw, w=m.w*cw, h=m.h*ch;
cctx.beginPath(); cctx.moveTo(x,baseY);
cctx.lineTo(x+w*0.1,baseY-h*0.55); if(m.step){ cctx.lineTo(x+w*0.28,baseY-h*0.58); cctx.lineTo(x+w*0.3,baseY-h); } else cctx.lineTo(x+w*0.18,baseY-h);
cctx.lineTo(x+w*0.82,baseY-h); cctx.lineTo(x+w*0.92,baseY-h*0.5); cctx.lineTo(x+w,baseY); cctx.closePath(); cctx.fill();
});
}

function drawSaltPan(hy, t, sunX, tone){
const gg=cctx.createLinearGradient(0,hy,0,ch);
gg.addColorStop(0,tone[0]); gg.addColorStop(0.35,tone[1]); gg.addColorStop(1,tone[2]);
cctx.fillStyle=gg; cctx.fillRect(0,hy,cw,ch-hy);
const glare=cctx.createRadialGradient(sunX,hy+ch*0.02,2,sunX,hy+ch*0.02,cw*0.38);
glare.addColorStop(0,'rgba(255,244,214,0.6)'); glare.addColorStop(1,'rgba(255,244,214,0)');
cctx.save(); cctx.translate(0,hy+ch*0.02); cctx.scale(1,0.22); cctx.translate(0,-(hy+ch*0.02));
cctx.fillStyle=glare; cctx.fillRect(0,hy-ch,cw,ch*3); cctx.restore();
const vx=cw*0.5;
cctx.lineCap='round';
const rr=mulberry32(99);
for(let i=-16;i<=16;i++){
const jit=(rr()-0.5)*cw*0.05, bx=vx+i*cw*0.11+jit;
cctx.strokeStyle='rgba(95,62,34,'+(0.1+0.14*(1-Math.abs(i)/17)).toFixed(2)+')'; cctx.lineWidth=1;
cctx.beginPath(); cctx.moveTo(vx+i*2,hy); cctx.lineTo(bx,ch); cctx.stroke();
}
const N=16;
for(let k=0;k<N;k++){
const d=((k+t*0.22)%N)/N;
const y=hy+(ch-hy)*d*d;
cctx.strokeStyle='rgba(95,62,34,'+(0.06+d*0.3).toFixed(2)+')'; cctx.lineWidth=0.6+d*1.4;
cctx.beginPath();
for(let x=0;x<=cw+40;x+=40){ const yy=y+Math.sin(x*0.045+k*2.7)*d*3; if(x===0) cctx.moveTo(x,yy); else cctx.lineTo(x,yy); }
cctx.stroke();
}
}
function drawShimmer(hy, t){
const amp = calm ? 1 : 3.2;
for(let i=0;i<8;i++){
const y=hy-ch*0.012+i*ch*0.009;
cctx.strokeStyle='rgba(255,236,196,'+(0.16-i*0.014).toFixed(3)+')'; cctx.lineWidth=1.3;
cctx.beginPath();
for(let x=0;x<=cw+20;x+=20){ const yy=y+Math.sin(x*0.02+t*1.8+i*1.3)*amp*(0.4+i*0.15); if(x===0) cctx.moveTo(x,yy); else cctx.lineTo(x,yy); }
cctx.stroke();
}
const mg=cctx.createLinearGradient(0,hy,0,hy+ch*0.03);
mg.addColorStop(0,'rgba(255,232,190,0.4)'); mg.addColorStop(1,'rgba(255,232,190,0)');
cctx.fillStyle=mg; cctx.fillRect(0,hy,cw,ch*0.03);
}
function drawSun(sx, sy, r, glowA, col){
const g=cctx.createRadialGradient(sx,sy,r*0.4,sx,sy,cw*0.55);
g.addColorStop(0,'rgba('+col+','+glowA.toFixed(2)+')'); g.addColorStop(0.25,'rgba('+col+','+(glowA*0.35).toFixed(2)+')'); g.addColorStop(1,'rgba('+col+',0)');
cctx.fillStyle=g; cctx.fillRect(0,0,cw,ch);
cctx.fillStyle='#fff6e0'; cctx.beginPath(); cctx.arc(sx,sy,r,0,Math.PI*2); cctx.fill();
}

function reyesPath(t, mode){
const step = mode==='walk' ? Math.sin(t*2.4)*5 : 0, bob = mode==='walk' ? Math.abs(Math.sin(t*2.4))*1.4 : 0;
cctx.beginPath(); cctx.arc(0,-46-bob,7.5,0,Math.PI*2);
cctx.rect(-8,-41-bob,16,4); cctx.rect(-7,-38-bob,14,32);
cctx.rect(-6+step,-8-bob,7,26); cctx.rect(0-step,-8-bob,7,26);
cctx.rect(-12,-34-bob,6,20);
cctx.rect(6,-58-bob,1.6,14);
}
function drawReyes(x, y, k, t, mode, alpha, bodyCol, rimA, rimCol, shadowA){
cctx.save(); cctx.translate(x,y);
if(shadowA>0){
cctx.save(); cctx.scale(k,k); cctx.transform(1,0,1.5,-0.22,0,0);
reyesPath(t,'walk'); cctx.fillStyle='rgba(30,14,6,'+shadowA.toFixed(2)+')'; cctx.fill(); cctx.restore();
}
cctx.globalAlpha=alpha; cctx.scale(k,k);
reyesPath(t,mode);
if(rimA>0){ cctx.strokeStyle='rgba('+rimCol+','+rimA.toFixed(2)+')'; cctx.lineWidth=3; cctx.stroke(); }
cctx.fillStyle=bodyCol; cctx.fill();
cctx.save(); cctx.rotate(-0.1); cctx.fillRect(4,-33,36,4); cctx.fillRect(14,-30,6,8); cctx.restore();
cctx.fillStyle='#7a2a10';
const bob = mode==='walk' ? Math.abs(Math.sin(t*2.4))*1.4 : 0;
cctx.beginPath(); cctx.moveTo(-6,-38-bob);
cctx.quadraticCurveTo(-20,-37+Math.sin(t*4.2)*3-bob,-34-Math.sin(t*3.1)*3,-31+Math.sin(t*3.7)*4-bob);
cctx.lineTo(-32-Math.sin(t*3.1)*3,-25+Math.sin(t*3.7)*4-bob);
cctx.quadraticCurveTo(-18,-30-bob,-5,-33-bob); cctx.closePath(); cctx.fill();
cctx.restore();
}
function drawArmor(x,y,s,kind,t,seed){
cctx.save(); cctx.translate(x,y); cctx.scale(-s,s);
const bob=Math.sin(t*5+seed)*0.8;
cctx.fillStyle='#160a07';
if(kind===0){
cctx.fillRect(-36,-6,72,6);
cctx.beginPath(); cctx.moveTo(-34,-6); cctx.lineTo(-30,-16+bob); cctx.lineTo(30,-16+bob); cctx.lineTo(38,-6); cctx.closePath(); cctx.fill();
cctx.beginPath(); cctx.moveTo(-14,-16+bob); cctx.lineTo(-9,-26+bob); cctx.lineTo(16,-26+bob); cctx.lineTo(21,-16+bob); cctx.closePath(); cctx.fill();
cctx.fillRect(16,-23+bob,42,3);
} else {
cctx.fillRect(-32,-20+bob,64,15);
cctx.beginPath(); cctx.moveTo(8,-20+bob); cctx.lineTo(16,-28+bob); cctx.lineTo(30,-28+bob); cctx.lineTo(32,-20+bob); cctx.closePath(); cctx.fill();
for(const wx of [-22,-8,8,22]){ cctx.beginPath(); cctx.arc(wx,-4,6,0,Math.PI*2); cctx.fill(); }
}
cctx.strokeStyle='rgba(255,170,90,0.45)'; cctx.lineWidth=1.2;
cctx.beginPath(); cctx.moveTo(-30,-16+bob); cctx.lineTo(30,-16+bob); cctx.stroke();
cctx.restore();
}
function drawPlume(x,y,s,t,seed,a){
for(let j=0;j<12;j++){
const p=j/12;
const px=x+(30+j*22)*s, py=y-(8+p*34)*s - Math.sin(t*1.5+j+seed)*3;
const r=(10+j*7)*s;
const g=cctx.createRadialGradient(px,py,0,px,py,r);
g.addColorStop(0,'rgba(222,160,98,'+((1-p)*0.34*a).toFixed(3)+')'); g.addColorStop(1,'rgba(222,160,98,0)');
cctx.fillStyle=g; cctx.beginPath(); cctx.arc(px,py,r,0,Math.PI*2); cctx.fill();
}
}
function drawBracket(x,y,w,h,label,a){
cctx.save();
cctx.strokeStyle='rgba(255,214,150,'+a.toFixed(2)+')'; cctx.lineWidth=1.4;
const c=7; cctx.beginPath();
[[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]].forEach(q=>{ cctx.moveTo(q[0],q[1]+q[3]*c); cctx.lineTo(q[0],q[1]); cctx.lineTo(q[0]+q[2]*c,q[1]); });
cctx.stroke();
cctx.font=Math.max(9,hudSize()-1)+'px '+MONO; cctx.fillStyle='rgba(255,230,190,'+a.toFixed(2)+')'; cctx.textAlign='left';
cctx.fillText(label,x,y-4);
cctx.restore();
}

const BIRDS=[0,1,2].map(i=>({ox:0.24+i*0.2, oy:0.14+i*0.035, ph:i*1.9}));
function drawScene0(t, dt){
const hy=ch*0.5;
const sg=cctx.createLinearGradient(0,0,0,hy+ch*0.04);
sg.addColorStop(0,'#1b0c0a'); sg.addColorStop(0.45,'#a8501f'); sg.addColorStop(0.8,'#e9a45a'); sg.addColorStop(1,'#f6d9a0');
cctx.fillStyle=sg; cctx.fillRect(0,0,cw,hy+ch*0.04);
const sx=cw*0.7, sy=hy-ch*0.075;
drawSun(sx,sy,Math.max(16,ch*0.04),0.7,'255,170,70');
drawMesas(MESA_FAR,hy,'#b9703a');
drawMesas(MESA_NEAR,hy+2,'#8a4a24');
const hz=cctx.createLinearGradient(0,hy-ch*0.1,0,hy+ch*0.02);
hz.addColorStop(0,'rgba(246,217,160,0)'); hz.addColorStop(1,'rgba(246,217,160,0.65)');
cctx.fillStyle=hz; cctx.fillRect(0,hy-ch*0.1,cw,ch*0.12);
drawSaltPan(hy,t,sx,['#f0d9a6','#cdb083','#7a5c3a']);
drawShimmer(hy,t);
const bx=cw*0.84, by=hy+ch*0.04;
for(let j=0;j<16;j++){
const p=j/16;
const x=bx+Math.sin(t*1.6+p*6)*p*cw*0.016+p*cw*0.012, y=by-p*ch*0.27;
const rx=cw*0.004+p*cw*0.024;
cctx.fillStyle='rgba(214,160,100,'+((1-p)*0.26).toFixed(3)+')';
cctx.beginPath(); cctx.ellipse(x,y,rx,rx*0.28,0,0,Math.PI*2); cctx.fill();
}
BIRDS.forEach((b,i)=>{
const x=cw*b.ox+Math.cos(t*0.3+b.ph)*cw*0.07, y=ch*b.oy+Math.sin(t*0.4+b.ph)*10, w=Math.min(22,cw*0.02), fl=Math.sin(t*3+b.ph)*w*0.25;
cctx.strokeStyle='rgba(20,8,4,0.85)'; cctx.lineWidth=1.6;
cctx.beginPath(); cctx.moveTo(x-w,y+fl); cctx.quadraticCurveTo(x-w*0.4,y-w*0.35,x,y); cctx.quadraticCurveTo(x+w*0.4,y-w*0.35,x+w,y+fl); cctx.stroke();
});
const p=ease(t/8);
const k=lerp(0.3,0.55,p)*Math.max(0.8,Math.min(1.5,ch/600));
const rx=cw*0.36, ry=hy+ch*0.06+p*ch*0.07;
drawReyes(rx,ry,k,t,'walk',1,'#080402',0.55,'255,214,150',0.4);
anamorphic(sx,sy,cw*0.5,calm?0.18:0.28+0.05*Math.sin(t*2),'255,200,120');
stepDust(dt||0.016,22,0.45);
const gr=cctx.createLinearGradient(0,0,0,ch); gr.addColorStop(0,'rgba(60,20,0,0.25)'); gr.addColorStop(1,'rgba(40,12,0,0.35)');
cctx.fillStyle=gr; cctx.fillRect(0,0,cw,ch);
drawBars(t/1.4,'SAT-LINK 7 // THERMAL','SALT FLATS  N 33°41′  E 14°20′','SURFACE '+Math.round(46+Math.min(t,9)*0.6)+'°C   '+fmtTC(t));
cornerBrackets();
}

const CONVOY=[0,1,2,3,4,5].map(i=>({kind:i%2?1:0, x0:0.6+i*0.1, dy:0.055+0.018*((i*5)%4), seed:i*1.7}));
function drawScene1(t, dt){
const hy=ch*0.48;
const sg=cctx.createLinearGradient(0,0,0,hy+ch*0.04);
sg.addColorStop(0,'#12070a'); sg.addColorStop(0.5,'#7a2814'); sg.addColorStop(0.85,'#f08a3a'); sg.addColorStop(1,'#f9c47a');
cctx.fillStyle=sg; cctx.fillRect(0,0,cw,hy+ch*0.04);
const sx=cw*0.82, sy=hy-ch*0.02;
drawSun(sx,sy,Math.max(18,ch*0.048),0.8,'255,120,40');
drawMesas(MESA_FAR,hy,'#8a3a1a'); drawMesas(MESA_NEAR,hy+2,'#5a2410');
drawSaltPan(hy,t*0.4,sx,['#e8b980','#a97a4c','#4a301c']);
drawShimmer(hy,t);
const sc=Math.max(0.6,Math.min(1.4,ch/620));
const veh=CONVOY.map(c=>({c, x:cw*(c.x0 + 0.1 - t*0.03), y:hy+ch*c.dy, s:sc*(0.75+c.dy*7)}));
veh.forEach(v=>drawPlume(v.x,v.y,v.s,t,v.c.seed,1));
veh.forEach(v=>drawArmor(v.x,v.y,v.s,v.c.kind,t,v.c.seed));
veh.forEach(v=>{
if(v.x>cw+40||v.x<-60) return;
const g=cctx.createRadialGradient(v.x-32*v.s,v.y-12*v.s,0,v.x-32*v.s,v.y-12*v.s,18*v.s);
g.addColorStop(0,'rgba(255,230,170,0.85)'); g.addColorStop(1,'rgba(255,200,120,0)');
cctx.fillStyle=g; cctx.beginPath(); cctx.arc(v.x-32*v.s,v.y-12*v.s,18*v.s,0,Math.PI*2); cctx.fill();
});
const hz=cctx.createLinearGradient(0,hy-ch*0.05,0,hy+ch*0.2);
hz.addColorStop(0,'rgba(240,160,90,0.0)'); hz.addColorStop(0.4,'rgba(240,160,90,0.22)'); hz.addColorStop(1,'rgba(240,160,90,0)');
cctx.fillStyle=hz; cctx.fillRect(0,hy-ch*0.05,cw,ch*0.25);
cctx.fillStyle='#120804';
cctx.beginPath(); cctx.moveTo(0,ch);
for(let x=0;x<=cw+20;x+=20){ cctx.lineTo(x, ch*0.8 + Math.sin(x*0.004+1.2)*ch*0.04 + Math.sin(x*0.011)*ch*0.012); }
cctx.lineTo(cw,ch); cctx.closePath(); cctx.fill();
cctx.strokeStyle='rgba(255,150,70,0.4)'; cctx.lineWidth=1.4; cctx.beginPath();
for(let x=0;x<=cw+20;x+=20){ const y=ch*0.8 + Math.sin(x*0.004+1.2)*ch*0.04 + Math.sin(x*0.011)*ch*0.012; if(x===0) cctx.moveTo(x,y); else cctx.lineTo(x,y); }
cctx.stroke();
const rxp=cw*(ch<460?0.16:0.2);
const ryp=ch*0.8 + Math.sin(rxp*0.004+1.2)*ch*0.04 + Math.sin(rxp*0.011)*ch*0.012 + 4;
drawReyes(rxp,ryp,Math.max(0.8,Math.min(1.4,ch/560))*0.9,t,'crouch',1,'#030201',0.5,'255,170,90',0);
anamorphic(sx,sy,cw*0.6,calm?0.2:0.34+0.06*Math.sin(t*2.3),'255,150,70');
stepDust(dt||0.016,30,0.55);
const gr=cctx.createLinearGradient(0,0,0,ch); gr.addColorStop(0,'rgba(60,15,0,0.25)'); gr.addColorStop(1,'rgba(30,8,0,0.4)');
cctx.fillStyle=gr; cctx.fillRect(0,0,cw,ch);
let locked=0;
veh.forEach((v,i)=>{
const at=0.9+i*0.55;
if(t<at || v.x>cw-24 || v.x<24) return;
locked++;
const a=clamp01((t-at)/0.3)*(0.75+0.25*Math.sin(t*6+i));
const bw=76*v.s, bh=38*v.s;
const dist=(2.7+v.c.x0*0.9+i*0.12 - t*0.08).toFixed(1);
drawBracket(v.x-bw*0.56,v.y-bh*0.95,bw,bh,(v.c.kind?'APC':'ARMOR')+'  '+dist+' KM',a);
});
const talking=t>1.0&&t<5.6;
drawBars(1,'CH-02 // VOSS — SECURE','RAPID RESPONSE  CONTACTS '+String(Math.min(6,veh.filter((v,i)=>t>0.9+i*0.55).length)).padStart(2,'0')+'/06',fmtTC(t+11.0));
const mh=barH();
if(cw>520){
for(let i=0;i<16;i++){ const amp=talking?(0.35+0.65*Math.abs(Math.sin(t*8+i*1.4)+Math.sin(t*3.3+i))*0.5):0.1; const h=2+amp*mh*0.28; cctx.fillStyle=talking?'rgba(255,196,110,0.95)':'rgba(255,196,110,0.4)'; cctx.fillRect(196+i*5,mh/2-h/2,3,h); }
}
if(Math.floor(t*1.6)%2===0){ cctx.fillStyle='rgba(255,70,50,0.95)'; cctx.beginPath(); cctx.arc(cw>520?186:176,mh/2,3,0,Math.PI*2); cctx.fill(); }
cornerBrackets();
}

function drawScene2(t, dt){
const hy=ch*0.52;
const fog=0.12+0.62*ease(t/7);
const sg=cctx.createLinearGradient(0,0,0,hy+ch*0.04);
sg.addColorStop(0,'#150a0a'); sg.addColorStop(0.55,'#8a3416'); sg.addColorStop(1,'#d98a4a');
cctx.fillStyle=sg; cctx.fillRect(0,0,cw,hy+ch*0.04);
const sx=cw*0.5, sy=hy-ch*0.1;
drawSun(sx,sy,Math.max(18,ch*0.05),0.55*(1-fog*0.5),'255,110,40');
drawMesas(MESA_FAR,hy,'#7a3418'); drawMesas(MESA_NEAR,hy+2,'#4e2010');
drawSaltPan(hy,t*0.6,sx,['#d9a26a','#9a6c40','#3e2816']);
const sc=Math.max(0.7,Math.min(1.5,ch/600));
[[0.5,0.07,0.9,0],[0.3,0.09,1.1,1],[0.72,0.085,1.0,0]].forEach((v,i)=>{
const gx=cw*v[0]+Math.sin(t*0.5+i)*6, gy=hy+ch*v[1], s=sc*v[2]*(0.9+0.25*clamp01(t/9));
drawArmor(gx,gy,s,v[3],t,i);
});
for(let L=0;L<5;L++){
const y=hy+ch*(0.02+L*0.07);
for(let j=0;j<7;j++){
const x=(((j*cw/5 - t*(22+L*14))%(cw*1.4))+cw*1.4)%(cw*1.4)-cw*0.2;
const r=cw*(0.2+0.04*Math.sin(t*0.5+j+L));
const g=cctx.createRadialGradient(x,y,2,x,y,r);
g.addColorStop(0,'rgba(214,150,88,'+(0.2*fog+0.04).toFixed(3)+')'); g.addColorStop(1,'rgba(214,150,88,0)');
cctx.fillStyle=g; cctx.beginPath(); cctx.ellipse(x,y,r,ch*0.09,0,0,Math.PI*2); cctx.fill();
}
}
[[0.5,0.07,0.9],[0.3,0.09,1.1],[0.72,0.085,1.0]].forEach((v,i)=>{
const gx=cw*v[0]+Math.sin(t*0.5+i)*6-(32*sc*v[2]), gy=hy+ch*v[1]-12*sc*v[2], r=18*sc*v[2]*(1+0.2*Math.sin(t*3+i));
const g=cctx.createRadialGradient(gx,gy,0,gx,gy,r*1.6);
g.addColorStop(0,'rgba(255,236,180,'+(0.9-fog*0.25).toFixed(2)+')'); g.addColorStop(1,'rgba(255,200,120,0)');
cctx.fillStyle=g; cctx.beginPath(); cctx.arc(gx,gy,r*1.6,0,Math.PI*2); cctx.fill();
});
const dissolve=ease((t-2.4)/4.8);
const k=Math.max(0.9,Math.min(1.5,ch/540));
const rx=cw*0.3+Math.min(t,12)*3, ry=ch*0.86;
drawReyes(rx,ry,k,t,'walk',1-0.8*dissolve,mixColor('#050201','#a2703e',dissolve),0.5*(1-dissolve),'255,190,110',0);
const fv=cctx.createLinearGradient(0,ch*0.4,0,ch);
fv.addColorStop(0,'rgba(200,136,78,0)'); fv.addColorStop(1,'rgba(200,136,78,'+(0.12+0.5*fog).toFixed(2)+')');
cctx.fillStyle=fv; cctx.fillRect(0,ch*0.4,cw,ch*0.6);
anamorphic(sx,sy,cw*0.5,calm?0.12:0.2*(1-fog*0.6),'255,140,60');
stepDust(dt||0.016,46,0.7);
const gr=cctx.createLinearGradient(0,0,0,ch); gr.addColorStop(0,'rgba(60,15,0,0.25)'); gr.addColorStop(1,'rgba(30,8,0,0.4)');
cctx.fillStyle=gr; cctx.fillRect(0,0,cw,ch);
if(t>4.3){
const a=easeOut((t-4.3)/1.3);
const ty=barH()+Math.max(ch*0.1,32);
cctx.save(); cctx.globalAlpha=a;
cctx.font=Math.max(9,hudSize())+'px '+MONO; cctx.fillStyle='#ffd08a';
trackedText('CHAPTER II',cw/2,ty-Math.max(18,ch*0.065),5);
const fs=Math.max(18,Math.min(ch*0.07,50));
cctx.font=fs+'px "Black Ops One", sans-serif'; cctx.fillStyle='#fff4dc';
cctx.shadowColor='rgba(255,130,30,0.8)'; cctx.shadowBlur=18;
trackedText('THE SALT FLATS',cw/2,ty,fs*0.2);
cctx.shadowBlur=0;
const lw=lerp(0,Math.min(cw*0.5,400),easeOut((t-4.5)/1.2));
cctx.fillStyle='rgba(255,170,50,0.9)'; cctx.fillRect(cw/2-lw/2,ty+fs*0.45,lw,1.5);
cctx.restore();
if(t<4.9) anamorphic(cw/2,ty-fs*0.3,cw*0.5,(1-(t-4.3)/0.6)*0.45,'255,190,110');
}
const sig=Math.max(4,Math.round(100-96*dissolve));
drawBars(1,'GHOST // SIGNATURE MASKED','VISUAL SIGNATURE '+String(sig).padStart(3,' ')+'%   DUST COVER '+String(Math.round(fog*100)).padStart(2,' ')+'%',fmtTC(t+23.0), sig<30);
cornerBrackets();
}

_startCrawl({
crawl: crawl, panels: panels, advanceHint: advanceHint, beginHint: beginHint,
durations: [7000, 8600], pulse: 'crawlBtnPulseDesert', resize: resizeCanvas, canvas: canvas,
draw: (i, t, dt)=>{
cctx.clearRect(0,0,cw,ch);
if(i===0) drawScene0(t, dt);
else if(i===1) drawScene1(t, dt);
else drawScene2(t, dt);
},
onReset: ()=>{ dust = []; },
onDone: onDone
});
}

function showUrbanCrawl(onDone){
const crawl = document.getElementById('story-crawl-urban');
const canvas = document.createElement('canvas');
canvas.id = 'cutscene-canvas-urban';
crawl.insertBefore(canvas, crawl.firstChild);
const cctx = canvas.getContext('2d');
const advanceHint = document.getElementById('cutscene-advance-hint-urban');
const beginHint = document.getElementById('cutscene-begin-hint-urban');
const panels = Array.from(crawl.querySelectorAll('.cutscene-panel'));
crawl.classList.add('active');
$buildings.crawlActive = true;

const calm = document.body.classList.contains('photosensitive-mode') || !!$buildings.settingPhotosensitive ||
  (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

let cw=0, ch=0;
function resizeCanvas(){
cw = canvas.width = window.innerWidth;
ch = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function easeOut(t){ t=clamp01(t); return 1-Math.pow(1-t,3); }
function mixColor(c1,c2,t){
const p=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
const [r1,g1,b1]=p(c1), [r2,g2,b2]=p(c2);
return 'rgb('+Math.round(r1+(r2-r1)*t)+','+Math.round(g1+(g2-g1)*t)+','+Math.round(b1+(b2-b1)*t)+')';
}
const MONO = '"Share Tech Mono", monospace';
function fmtTC(t){ const f=Math.floor((t%1)*24), s2=Math.floor(t)%60, m=Math.floor(t/60); return String(m).padStart(2,'0')+':'+String(s2).padStart(2,'0')+':'+String(f).padStart(2,'0'); }
function trackedText(str, cx, y, spacing){
let w=0; const ws=[]; for(const c of str){ const m=cctx.measureText(c).width; ws.push(m); w+=m+spacing; } w-=spacing;
let x=cx-w/2; const prev=cctx.textAlign; cctx.textAlign='left';
let i=0; for(const c of str){ cctx.fillText(c,x,y); x+=ws[i++]+spacing; }
cctx.textAlign=prev;
}
function barH(){ return Math.round(Math.min(Math.max(ch*0.085, 26), 64)); }
function hudSize(){ return ch<460 ? 10 : 11; }
function drawBars(open, leftTop, leftBot, rightBot, alertTop){
const h=barH()*ease(open);
cctx.fillStyle='#000'; cctx.fillRect(0,0,cw,h); cctx.fillRect(0,ch-h,cw,h);
if(h>8){
cctx.fillStyle='rgba(120,190,230,0.3)'; cctx.fillRect(0,h,cw,1); cctx.fillRect(0,ch-h-1,cw,1);
cctx.font=hudSize()+'px '+MONO; cctx.textBaseline='middle';
cctx.shadowColor='rgba(110,190,240,0.6)'; cctx.shadowBlur=6;
const ty=h/2, by=ch-h/2; cctx.textAlign='left';
if(leftTop){ cctx.fillStyle = alertTop ? 'rgba(255,140,100,1)' : 'rgba(206,232,246,1)'; cctx.fillText(leftTop,16,ty); }
if(leftBot){ cctx.fillStyle='rgba(150,215,255,1)'; cctx.fillText(leftBot,16,by); }
cctx.textAlign='right';
if(rightBot){ cctx.fillStyle='rgba(206,232,246,0.95)'; cctx.fillText(rightBot,cw-16,by); }
cctx.textAlign='left'; cctx.textBaseline='alphabetic'; cctx.shadowBlur=0;
}
}
function cornerBrackets(){
const h=barH(), m=14, L=16;
cctx.strokeStyle='rgba(140,200,235,0.4)'; cctx.lineWidth=1.5;
[[m,h+m,1,1],[cw-m,h+m,-1,1],[m,ch-h-m,1,-1],[cw-m,ch-h-m,-1,-1]].forEach(c=>{
cctx.beginPath(); cctx.moveTo(c[0],c[1]+c[3]*L); cctx.lineTo(c[0],c[1]); cctx.lineTo(c[0]+c[2]*L,c[1]); cctx.stroke();
});
}
function anamorphic(x,y,len,a,col){
const g=cctx.createLinearGradient(x-len,y,x+len,y);
g.addColorStop(0,'rgba('+col+',0)'); g.addColorStop(0.5,'rgba('+col+','+a.toFixed(3)+')'); g.addColorStop(1,'rgba('+col+',0)');
cctx.fillStyle=g; cctx.fillRect(x-len,y-1.2,len*2,2.4);
const r=cctx.createRadialGradient(x,y,0,x,y,len*0.18);
r.addColorStop(0,'rgba(255,255,255,'+(a*0.9).toFixed(3)+')'); r.addColorStop(1,'rgba('+col+',0)');
cctx.fillStyle=r; cctx.beginPath(); cctx.arc(x,y,len*0.18,0,Math.PI*2); cctx.fill();
}
function fireGlow(x,y,r,t,seed,a){
const fl=0.65+0.35*Math.sin(t*9+seed)*Math.sin(t*4.3+seed*2.1);
const g=cctx.createRadialGradient(x,y,0,x,y,r*(0.9+0.2*fl));
g.addColorStop(0,'rgba(255,214,120,'+(0.85*fl*a).toFixed(3)+')'); g.addColorStop(0.4,'rgba(255,120,40,'+(0.45*fl*a).toFixed(3)+')'); g.addColorStop(1,'rgba(255,70,20,0)');
cctx.fillStyle=g; cctx.beginPath(); cctx.arc(x,y,r,0,Math.PI*2); cctx.fill();
}
function smokeColumn(x,baseY,h,t,seed,a,w){
for(let j=0;j<9;j++){
const p=(((t*0.09)+j/9+seed)%1);
const px=x+Math.sin(p*5+seed*3)*w*0.4+p*w*1.6, py=baseY-p*h;
const r=w*(0.35+p*1.3);
const g=cctx.createRadialGradient(px,py,0,px,py,r);
g.addColorStop(0,'rgba(24,22,24,'+((1-p)*0.5*a).toFixed(3)+')'); g.addColorStop(1,'rgba(24,22,24,0)');
cctx.fillStyle=g; cctx.beginPath(); cctx.arc(px,py,r,0,Math.PI*2); cctx.fill();
}
}
let embers = [];
function stepEmbers(dt, n, rate){
if(embers.length<n && Math.random()<rate){
const up=Math.random()<0.65;
embers.push({x:rand(0,cw), y: up? ch-barH()-rand(0,40) : barH()+rand(0,30), vy: up? -rand(24,70) : rand(10,26), vx:rand(-12,16), r:rand(0.7,2.2), life:rand(3,7), t:0, hot:up});
}
for(let i=embers.length-1;i>=0;i--){
const e=embers[i]; e.t+=dt; e.x+=e.vx*dt+Math.sin(e.t*2+i)*0.3; e.y+=e.vy*dt;
if(e.t>e.life || e.y<-10 || e.y>ch+10){ embers.splice(i,1); continue; }
const a=Math.max(0,1-e.t/e.life);
cctx.fillStyle = e.hot ? 'rgba(255,'+(110+Math.floor(a*100))+',50,'+(a*0.9).toFixed(2)+')' : 'rgba(170,170,176,'+(a*0.5).toFixed(2)+')';
cctx.beginPath(); cctx.arc(e.x,e.y,e.r,0,Math.PI*2); cctx.fill();
}
}

function reyesPath(t, mode){
const step = mode==='walk' ? Math.sin(t*2.6)*5 : 0, bob = mode==='walk' ? Math.abs(Math.sin(t*2.6))*1.4 : 0;
cctx.beginPath(); cctx.arc(0,-46-bob,7.5,0,Math.PI*2);
cctx.rect(-8,-41-bob,16,4); cctx.rect(-7,-38-bob,14,32);
cctx.rect(-6+step,-8-bob,7,26); cctx.rect(0-step,-8-bob,7,26);
cctx.rect(-12,-34-bob,6,20);
cctx.rect(6,-58-bob,1.6,14);
}
function drawReyes(x,y,k,t,mode,rimA,rimCol){
cctx.save(); cctx.translate(x,y); cctx.scale(k,k);
reyesPath(t,mode);
if(rimA>0){ cctx.strokeStyle='rgba('+rimCol+','+rimA.toFixed(2)+')'; cctx.lineWidth=3; cctx.stroke(); }
cctx.fillStyle='#030405'; cctx.fill();
cctx.save(); cctx.rotate(-0.1); cctx.fillRect(4,-33,36,4); cctx.fillRect(14,-30,6,8); cctx.restore();
const bob = mode==='walk' ? Math.abs(Math.sin(t*2.6))*1.4 : 0;
cctx.fillStyle='#5a2a1c';
cctx.beginPath(); cctx.moveTo(-6,-38-bob);
cctx.quadraticCurveTo(-20,-37+Math.sin(t*4.6)*3-bob,-34-Math.sin(t*3.2)*3,-31+Math.sin(t*3.9)*4-bob);
cctx.lineTo(-32-Math.sin(t*3.2)*3,-25+Math.sin(t*3.9)*4-bob);
cctx.quadraticCurveTo(-18,-30-bob,-5,-33-bob); cctx.closePath(); cctx.fill();
cctx.restore();
}

function drawWreckSide(x,y,s,lean,t,seed,burn){
cctx.save(); cctx.translate(x,y); cctx.scale(s,s); cctx.rotate(lean);
cctx.fillStyle='#050607';
cctx.beginPath(); cctx.arc(30,-7,8.5,0,Math.PI*2); cctx.fill();
cctx.beginPath(); cctx.ellipse(-30,-3,9,4,0,0,Math.PI*2); cctx.fill();
cctx.beginPath();
cctx.moveTo(-50,-5); cctx.lineTo(-49,-15); cctx.quadraticCurveTo(-46,-19,-36,-19);
cctx.lineTo(-25,-20); cctx.quadraticCurveTo(-19,-32,-8,-32); cctx.lineTo(10,-32);
cctx.quadraticCurveTo(21,-31,27,-20); cctx.lineTo(41,-18); cctx.quadraticCurveTo(50,-16,51,-8); cctx.lineTo(50,-3);
cctx.lineTo(-50,-3); cctx.closePath();
cctx.fillStyle='#0a0b0c'; cctx.fill();
cctx.strokeStyle='rgba(255,150,80,0.45)'; cctx.lineWidth=1.3; cctx.stroke();
cctx.fillStyle='#020303';
cctx.beginPath(); cctx.moveTo(-20,-21); cctx.quadraticCurveTo(-16,-30,-8,-30); cctx.lineTo(0,-30); cctx.lineTo(0,-21); cctx.closePath(); cctx.fill();
cctx.beginPath(); cctx.moveTo(4,-30); cctx.lineTo(10,-30); cctx.quadraticCurveTo(18,-29,22,-21); cctx.lineTo(4,-21); cctx.closePath(); cctx.fill();
cctx.strokeStyle='rgba(180,200,215,0.45)'; cctx.lineWidth=0.8;
cctx.beginPath(); cctx.moveTo(-8,-30); cctx.lineTo(-12,-24); cctx.lineTo(-6,-22); cctx.moveTo(14,-29); cctx.lineTo(10,-24); cctx.lineTo(16,-22); cctx.stroke();
cctx.save(); cctx.translate(27,-20); cctx.rotate(-0.55);
cctx.fillStyle='#08090a'; cctx.fillRect(0,-3,24,4); cctx.restore();
cctx.strokeStyle='rgba(0,0,0,0.9)'; cctx.lineWidth=1; cctx.beginPath(); cctx.moveTo(-2,-19); cctx.lineTo(-2,-4); cctx.stroke();
cctx.fillStyle='#010101'; cctx.beginPath(); cctx.ellipse(-26,-10,5,3.4,0.3,0,Math.PI*2); cctx.fill();
cctx.fillStyle='#07080a'; cctx.save(); cctx.translate(50,-5); cctx.rotate(0.5); cctx.fillRect(0,0,9,3); cctx.restore();
cctx.restore();
if(burn){
fireGlow(x+30*s,y-26*s,34*s,t,seed,0.9);
fireGlow(x-6*s,y-30*s,22*s,t+1.3,seed+2,0.6);
smokeColumn(x+20*s,y-34*s,ch*0.16,t,seed,0.9,10*s);
}
}
function drawWreckRear(x,y,s,tilt,t,seed,burn){
cctx.save(); cctx.translate(x,y); cctx.scale(s,s); cctx.rotate(tilt);
cctx.fillStyle='#040506';
cctx.beginPath(); cctx.ellipse(-34,-3,8,5,0,0,Math.PI*2); cctx.ellipse(35,-5,9,7,0,0,Math.PI*2); cctx.fill();
cctx.beginPath();
cctx.moveTo(-46,-3); cctx.lineTo(-47,-17); cctx.quadraticCurveTo(-46,-21,-40,-22);
cctx.lineTo(-28,-23); cctx.lineTo(-24,-37); cctx.quadraticCurveTo(-22,-41,-16,-41);
cctx.lineTo(16,-41); cctx.quadraticCurveTo(22,-41,24,-37); cctx.lineTo(28,-23);
cctx.lineTo(40,-22); cctx.quadraticCurveTo(46,-21,47,-17); cctx.lineTo(46,-3); cctx.closePath();
cctx.fillStyle='#090a0c'; cctx.fill();
cctx.strokeStyle='rgba(255,150,80,0.5)'; cctx.lineWidth=1.4; cctx.stroke();
cctx.fillStyle='#010202';
cctx.beginPath(); cctx.moveTo(-20,-27); cctx.lineTo(-17,-38); cctx.lineTo(17,-38); cctx.lineTo(20,-27); cctx.closePath(); cctx.fill();
cctx.strokeStyle='rgba(190,205,220,0.45)'; cctx.lineWidth=0.8;
cctx.beginPath(); cctx.moveTo(-6,-38); cctx.lineTo(-2,-31); cctx.lineTo(-9,-28); cctx.moveTo(8,-38); cctx.lineTo(5,-32); cctx.lineTo(12,-28); cctx.stroke();
cctx.fillStyle='rgba(120,20,10,0.8)'; cctx.fillRect(-42,-17,10,4); cctx.fillRect(32,-17,10,4);
cctx.fillStyle='#16181a'; cctx.fillRect(-9,-14,18,6);
cctx.restore();
if(burn){ fireGlow(x,y-34*s,40*s,t,seed,0.85); smokeColumn(x,y-40*s,ch*0.22,t,seed,0.9,14*s); }
}

function makeDistrict(seed,count,dmgChance){
const r=mulberry32(seed), arr=[]; let x=-0.06;
for(let i=0;i<count;i++){
const roll=r(); let type,w,h;
if(roll<0.46){ type='wh'; w=0.07+r()*0.1; h=0.05+r()*0.08; }
else if(roll<0.64){ type='stack'; w=0.02+r()*0.012; h=0.15+r()*0.13; }
else if(roll<0.76){ type='tank'; w=0.04+r()*0.03; h=0.07+r()*0.04; }
else if(roll<0.9){ type='crane'; w=0.05+r()*0.02; h=0.22+r()*0.1; }
else { type='silo'; w=0.045+r()*0.02; h=0.1+r()*0.06; }
const dmg=r()<dmgChance, da=0.15+r()*0.4;
arr.push({type,x,w,h,dmg,da,db:da+0.25+r()*0.25,jag:Array.from({length:14},()=>r()),lit:Array.from({length:14},()=>r()<0.18),fire:dmg&&r()<0.7,ph:r()*10,seed:r()*7});
x+=w*(0.8+r()*0.45);
}
return arr;
}
function drawStructure(st,x,y,w,h,col,rim,t,detail){
cctx.fillStyle=col; cctx.strokeStyle=rim; cctx.lineWidth=1.2;
if(st.type==='wh'){
const teeth=Math.max(2,Math.round(w/22)), tw=w/teeth, top=y-h*0.7;
cctx.beginPath(); cctx.moveTo(x,y); cctx.lineTo(x,top);
for(let i=0;i<teeth;i++){
const jx=x+i*tw, frac=(i+0.5)/teeth, bad=st.dmg && frac>st.da && frac<st.db, jg=st.jag[i%14];
if(bad){ cctx.lineTo(jx+tw*0.3,y-h*(0.38+0.5*jg)); cctx.lineTo(jx+tw*0.6,y-h*(0.3+0.32*st.jag[(i+4)%14])); cctx.lineTo(jx+tw,y-h*(0.5+0.35*st.jag[(i+8)%14])); }
else { cctx.lineTo(jx+tw,top-h*0.3); cctx.lineTo(jx+tw,top); }
}
cctx.lineTo(x+w,y); cctx.closePath(); cctx.fill(); cctx.stroke();
if(detail){
for(let i=0;i<Math.min(8,teeth*2);i++){ if(!st.lit[i]) continue; cctx.fillStyle='rgba(255,170,90,0.55)'; cctx.fillRect(x+w*(0.08+i*0.11),y-h*0.35,4,3); }
if(st.dmg){
const hx=x+w*st.da, hw=w*(st.db-st.da);
cctx.fillStyle='#020304'; cctx.fillRect(hx,y-h*0.55,hw,h*0.5);
cctx.strokeStyle='rgba(120,130,140,0.55)'; cctx.lineWidth=1;
for(let i=0;i<4;i++){ const bx=hx+hw*(i+0.5)/4; cctx.beginPath(); cctx.moveTo(bx,y-h*0.55); cctx.lineTo(bx+(st.jag[i]-0.5)*14,y-h*(0.7+0.3*st.jag[i+3])); cctx.stroke(); }
cctx.fillStyle=col; cctx.save(); cctx.translate(x+w*st.db,y-h*0.5); cctx.rotate(0.9); cctx.fillRect(0,0,w*0.16,3); cctx.restore();
}
}
} else if(st.type==='stack'){
cctx.beginPath(); cctx.moveTo(x,y); cctx.lineTo(x+w*0.18,y-h);
if(st.dmg){ cctx.lineTo(x+w*0.3,y-h*0.9); cctx.lineTo(x+w*0.42,y-h*0.97); cctx.lineTo(x+w*0.55,y-h*0.86); cctx.lineTo(x+w*0.72,y-h*0.93); }
else { cctx.lineTo(x+w*0.82,y-h); }
cctx.lineTo(x+w*0.82,y-h*(st.dmg?0.9:1)); cctx.lineTo(x+w,y); cctx.closePath(); cctx.fill(); cctx.stroke();
if(detail){ cctx.fillStyle='rgba(150,40,30,0.55)'; cctx.fillRect(x+w*0.16,y-h*0.55,w*0.68,4); cctx.fillRect(x+w*0.12,y-h*0.3,w*0.76,4); }
if(st.dmg){ cctx.fillStyle=col; cctx.beginPath(); cctx.moveTo(x-w*0.8,y); cctx.lineTo(x+w*0.1,y-h*0.14); cctx.lineTo(x+w*0.5,y); cctx.closePath(); cctx.fill(); }
} else if(st.type==='tank'){
cctx.fillRect(x,y-h*0.8,w,h*0.8);
cctx.beginPath(); cctx.ellipse(x+w/2,y-h*0.8,w/2,h*0.2,0,Math.PI,Math.PI*2); cctx.fill();
cctx.fillRect(x+w*0.08,y-h*0.05,w*0.06,h*0.05); cctx.fillRect(x+w*0.86,y-h*0.05,w*0.06,h*0.05);
if(detail){ cctx.fillStyle='rgba(0,0,0,0.5)'; for(let i=0;i<3;i++) cctx.fillRect(x+w*(0.2+i*0.25),y-h*0.7,2,h*0.6); }
} else if(st.type==='silo'){
for(let i=0;i<3;i++){ const sx=x+i*w/3; cctx.fillRect(sx,y-h*(0.8+0.1*((i*5)%3)/3),w/3-2,h*(0.8+0.1*((i*5)%3)/3)); cctx.beginPath(); cctx.ellipse(sx+w/6-1,y-h*(0.8+0.1*((i*5)%3)/3),w/6-1,3,0,0,Math.PI*2); cctx.fill(); }
} else if(st.type==='crane'){
const mx=x+w*0.18, mw=Math.max(5,w*0.1);
cctx.fillRect(mx,y-h,mw,h);
cctx.strokeStyle=col; cctx.lineWidth=1;
if(detail){ for(let i=0;i<10;i++){ cctx.beginPath(); cctx.moveTo(mx-3,y-h*(i/10)); cctx.lineTo(mx+mw+3,y-h*((i+1)/10)); cctx.stroke(); } }
cctx.lineWidth=Math.max(3,w*0.07);
const jl=w*0.95, jy=y-h;
cctx.beginPath(); cctx.moveTo(mx-w*0.14,jy+4); cctx.lineTo(mx+mw,jy);
if(st.dmg){ cctx.lineTo(mx+jl*0.52,jy+2); cctx.lineTo(mx+jl*0.7,jy+h*0.2); } else { cctx.lineTo(mx+jl,jy+2); }
cctx.stroke();
cctx.lineWidth=1; cctx.strokeStyle='rgba(180,190,200,0.5)';
const hx=st.dmg? mx+jl*0.7 : mx+jl*0.8, hy2=st.dmg? jy+h*0.2 : jy+2;
cctx.beginPath(); cctx.moveTo(hx,hy2); cctx.lineTo(hx+(st.dmg?6:0),hy2+h*0.28); cctx.stroke();
cctx.fillStyle=col; cctx.save(); cctx.translate(hx+(st.dmg?6:0),hy2+h*0.28); cctx.rotate(st.dmg?0.35:0); cctx.fillRect(-9,0,18,8); cctx.restore();
}
if(st.fire && detail){ fireGlow(x+w*(st.da+st.db)/2,y-h*0.35,Math.max(30,w*0.5),t,st.seed,0.9); }
}
function drawDistrict(arr,baseY,scale,col,rim,off,t,detail){
arr.forEach(st=>{
const x=st.x*cw+off, w=st.w*cw*scale, h=st.h*ch*scale;
if(x>cw+80||x+w<-80) return;
drawStructure(st,x,baseY,w,h,col,rim,t,detail);
});
}
const FAR=makeDistrict(31,22,0.15), MID=makeDistrict(57,15,0.45), NEAR=makeDistrict(88,8,0.7);

const CRATERS=Array.from({length:4},(_,i)=>({x:0.15+i*0.22+((i*37)%7)*0.01, w:0.1+((i*13)%5)*0.015}));
const RIDGE=(()=>{ const r=mulberry32(12), pts=[]; for(let i=0;i<=48;i++) pts.push({x:i/48,h:4+r()*20+(r()<0.14?r()*40:0)}); return pts; })();
function drawScene0(t, dt){
const hy=ch*0.7;
const sg=cctx.createLinearGradient(0,0,0,hy);
sg.addColorStop(0,'#070d14'); sg.addColorStop(0.5,'#24323e'); sg.addColorStop(0.85,'#8a5a44'); sg.addColorStop(1,'#c27a48');
cctx.fillStyle=sg; cctx.fillRect(0,0,cw,ch);
for(let i=0;i<5;i++){
const y=ch*(0.18+i*0.1);
for(let j=0;j<5;j++){
const x=(((j*cw/3.5+t*(5+i*3))%(cw*1.4))+cw*1.4)%(cw*1.4)-cw*0.2;
const rg=cctx.createRadialGradient(x,y,2,x,y,cw*0.25);
rg.addColorStop(0,'rgba(60,66,74,'+(0.26-i*0.03).toFixed(2)+')'); rg.addColorStop(1,'rgba(60,66,74,0)');
cctx.fillStyle=rg; cctx.beginPath(); cctx.ellipse(x,y,cw*0.25,ch*0.06,0,0,Math.PI*2); cctx.fill();
}
}
fireGlow(cw*0.7,hy,cw*0.35,t,1,0.5);
drawDistrict(FAR,hy,0.9,'#2a3743','rgba(255,160,90,0.18)',-t*3,t,false);
const hz=cctx.createLinearGradient(0,hy-ch*0.2,0,hy); hz.addColorStop(0,'rgba(194,122,72,0)'); hz.addColorStop(1,'rgba(194,122,72,0.35)');
cctx.fillStyle=hz; cctx.fillRect(0,hy-ch*0.2,cw,ch*0.2);
drawDistrict(MID,hy+ch*0.05,1.0,'#151e27','rgba(255,160,90,0.28)',-t*7,t,true);
[...FAR,...MID].filter(s2=>s2.type==='stack').forEach((st,i)=>{
const mid=MID.indexOf(st)>=0, off=mid?-t*7:-t*3, base=mid?hy+ch*0.05:hy;
const sx=st.x*cw+off+st.w*cw*0.5, top=base-st.h*ch*(mid?1:0.9);
if(sx>-40&&sx<cw+40) smokeColumn(sx,top,ch*0.3,t,st.seed,mid?0.8:0.5,st.w*cw*0.9);
});
drawDistrict(NEAR,hy+ch*0.12,1.15,'#07090c','rgba(255,150,80,0.4)',-t*14,t,true);
const gY=ch-barH()-ch*0.05;
const gg=cctx.createLinearGradient(0,hy+ch*0.1,0,ch); gg.addColorStop(0,'#10151a'); gg.addColorStop(1,'#050607');
cctx.fillStyle=gg; cctx.beginPath(); cctx.moveTo(0,ch);
RIDGE.forEach(p=>cctx.lineTo(p.x*cw,gY-p.h*(ch/600)-ch*0.1)); cctx.lineTo(cw,ch); cctx.closePath(); cctx.fill();
cctx.strokeStyle='rgba(255,150,80,0.28)'; cctx.lineWidth=1.2; cctx.beginPath();
RIDGE.forEach((p,i)=>{ const x=p.x*cw,y=gY-p.h*(ch/600)-ch*0.1; if(i===0) cctx.moveTo(x,y); else cctx.lineTo(x,y); }); cctx.stroke();
CRATERS.forEach((c,i)=>{
const cx=c.x*cw, cy=gY-ch*0.02+i%2*ch*0.025, rw=c.w*cw;
cctx.fillStyle='#020304'; cctx.beginPath(); cctx.ellipse(cx,cy,rw,rw*0.14,0,0,Math.PI*2); cctx.fill();
cctx.strokeStyle='rgba(255,140,70,0.35)'; cctx.lineWidth=1.4; cctx.beginPath(); cctx.ellipse(cx,cy-1,rw,rw*0.14,0,Math.PI*1.05,Math.PI*1.95); cctx.stroke();
});
const k=Math.max(0.8,Math.min(1.5,ch/560));
drawWreckSide(cw*0.12,gY-ch*0.02,k*1.25,-0.05,t,3,true);
drawWreckSide(cw*0.58,gY+ch*0.006,k*1.45,0.04,t,9,false);
drawReyes(cw*(ch<460?0.82:0.78),gY-ch*0.03,k*0.95,t,'crouch',0.55,'255,150,80');
stepEmbers(dt||0.016,40,0.5);
anamorphic(cw*0.72,hy-ch*0.02,cw*0.5,calm?0.12:0.22+0.04*Math.sin(t*2.3),'255,150,80');
const gr=cctx.createLinearGradient(0,0,0,ch); gr.addColorStop(0,'rgba(10,20,36,0.3)'); gr.addColorStop(1,'rgba(10,8,6,0.4)');
cctx.fillStyle=gr; cctx.fillRect(0,0,cw,ch);
drawBars(t/1.4,'SAT-LINK 7 // DAMAGE SURVEY','INDUSTRIAL QUARTER  N 41°19′  E 12°11′','STRUCTURES DESTROYED: '+Math.min(47,Math.round(t*5.6))+'   '+fmtTC(t));
cornerBrackets();
}

const BOKEH=(()=>{ const r=mulberry32(61), arr=[]; for(let i=0;i<46;i++){ const c=r(); arr.push({x:r(),y:0.15+r()*0.6,r:0.012+r()*0.04,col:c<0.55?'255,160,80':c<0.8?'255,90,50':'120,190,240',ph:r()*10,a:0.06+r()*0.16}); } return arr; })();
const SHARDS=Array.from({length:32},(_,i)=>({x:((i*97)%100)/100,y:((i*53)%100)/100,s:0.5+((i*29)%10)/10,sp:30+((i*17)%40)}));
function drawRadio(x,y,sc,t,sig,burst){
cctx.save(); cctx.translate(x,y); cctx.scale(sc,sc);
const sp=cctx.createRadialGradient(40,-20,10,40,-20,260);
sp.addColorStop(0,'rgba(120,220,255,'+(0.18*(0.4+sig)).toFixed(3)+')'); sp.addColorStop(1,'rgba(120,220,255,0)');
cctx.fillStyle=sp; cctx.beginPath(); cctx.arc(40,-20,260,0,Math.PI*2); cctx.fill();
const sw=Math.sin(t*1.3)*2;
cctx.strokeStyle='#2a323a'; cctx.lineWidth=3; cctx.beginPath(); cctx.moveTo(48,-150); cctx.lineTo(60+sw,-300); cctx.stroke();
cctx.fillStyle='#1a1f24'; cctx.beginPath(); cctx.arc(60+sw,-302,4,0,Math.PI*2); cctx.fill();
cctx.beginPath(); cctx.roundRect ? cctx.roundRect(-52,-160,130,200,14) : cctx.rect(-52,-160,130,200);
cctx.fillStyle='#10161c'; cctx.fill(); cctx.strokeStyle='rgba(160,205,230,0.4)'; cctx.lineWidth=2; cctx.stroke();
cctx.fillStyle='#05080a'; for(let i=0;i<6;i++) cctx.fillRect(-36,-146+i*8,98,3);
cctx.fillStyle='#02070a'; cctx.fillRect(-40,-92,106,64); cctx.strokeStyle='rgba(120,220,255,0.5)'; cctx.lineWidth=1; cctx.strokeRect(-40,-92,106,64);
cctx.save(); cctx.beginPath(); cctx.rect(-40,-92,106,64); cctx.clip();
cctx.strokeStyle='rgba(130,240,255,'+(0.55+0.4*sig).toFixed(2)+')'; cctx.lineWidth=1.4; cctx.beginPath();
for(let i=0;i<=106;i+=2){
const amp = burst ? (10+8*Math.sin(t*20+i*0.3)) : (sig>0.05 ? 2+sig*5 : 0);
const yy=-60 + Math.sin(i*0.55+t*30)*amp*0.5 + (sig>0.02?(Math.random()-0.5)*(10*(1-sig)+2):0);
if(i===0) cctx.moveTo(-40,yy); else cctx.lineTo(-40+i,yy);
}
cctx.stroke(); cctx.restore();
cctx.font='9px '+MONO; cctx.fillStyle='rgba(130,240,255,0.95)'; cctx.textAlign='left';
cctx.fillText('146.520 MHz',-36,-80);
cctx.fillStyle = sig>0.05 ? 'rgba(130,240,255,0.9)' : 'rgba(255,110,90,1)';
cctx.fillText(sig>0.05?'RX  VOSS':'NO CARRIER',-36,-35);
cctx.fillStyle='#07090b'; cctx.beginPath(); cctx.arc(-18,14,14,0,Math.PI*2); cctx.arc(30,14,14,0,Math.PI*2); cctx.fill();
cctx.strokeStyle='rgba(160,205,230,0.35)'; cctx.lineWidth=1; cctx.beginPath(); cctx.arc(-18,14,14,0,Math.PI*2); cctx.arc(30,14,14,0,Math.PI*2); cctx.stroke();
cctx.fillStyle = sig>0.05 ? 'rgba(80,255,140,0.95)' : (Math.sin(t*6)>0 ? 'rgba(255,70,50,0.95)' : 'rgba(90,20,15,0.9)');
cctx.beginPath(); cctx.arc(64,-110,3.2,0,Math.PI*2); cctx.fill();
cctx.restore();
}
function drawScene1(t, dt){
const sg=cctx.createLinearGradient(0,0,0,ch);
sg.addColorStop(0,'#06090e'); sg.addColorStop(0.6,'#18222c'); sg.addColorStop(1,'#2a1c16');
cctx.fillStyle=sg; cctx.fillRect(0,0,cw,ch);
cctx.globalCompositeOperation='lighter';
BOKEH.forEach(b=>{
const x=b.x*cw+Math.sin(t*0.3+b.ph)*8, y=b.y*ch, r=b.r*Math.max(cw,ch)*0.5;
const f=0.75+0.25*Math.sin(t*(calm?1:4)+b.ph);
const g=cctx.createRadialGradient(x,y,0,x,y,r);
g.addColorStop(0,'rgba('+b.col+','+(b.a*f).toFixed(3)+')'); g.addColorStop(0.8,'rgba('+b.col+','+(b.a*f*0.6).toFixed(3)+')'); g.addColorStop(1,'rgba('+b.col+',0)');
cctx.fillStyle=g; cctx.beginPath(); cctx.arc(x,y,r,0,Math.PI*2); cctx.fill();
});
cctx.globalCompositeOperation='source-over';
cctx.filter='blur(2px)';
drawDistrict(MID,ch*0.74,1.2,'#090d12','rgba(255,150,80,0.18)',0,t,false);
cctx.filter='none';
cctx.fillStyle='#030405';
cctx.beginPath(); cctx.moveTo(0,ch); cctx.lineTo(0,ch*0.3);
const pts=[[0.04,0.34],[0.07,0.3],[0.09,0.42],[0.13,0.4],[0.16,0.56],[0.21,0.58],[0.24,0.72],[0.3,0.74],[0.33,1]];
pts.forEach(p=>cctx.lineTo(p[0]*cw,p[1]*ch)); cctx.closePath(); cctx.fill();
cctx.strokeStyle='rgba(255,150,80,0.3)'; cctx.lineWidth=1.2; cctx.beginPath(); cctx.moveTo(0,ch*0.3); pts.forEach(p=>cctx.lineTo(p[0]*cw,p[1]*ch)); cctx.stroke();
cctx.strokeStyle='#05080a'; cctx.lineWidth=2.4;
for(let i=0;i<5;i++){ cctx.beginPath(); cctx.moveTo(cw*(0.18+i*0.018),ch*(0.58+i*0.02)); cctx.lineTo(cw*(0.2+i*0.03),ch*(0.4-i*0.03)); cctx.stroke(); }
cctx.fillStyle='#030405';
cctx.beginPath(); cctx.moveTo(cw,ch); cctx.lineTo(cw,ch*0.46); cctx.lineTo(cw*0.93,ch*0.5); cctx.lineTo(cw*0.9,ch*0.62); cctx.lineTo(cw*0.84,ch*0.66); cctx.lineTo(cw*0.8,ch*0.86); cctx.lineTo(cw*0.76,ch); cctx.closePath(); cctx.fill();
const sc=Math.max(0.55,Math.min(1.25,ch/560))*0.9;
const rx=cw*(ch<460?0.14:0.2), ry=ch-barH()-ch*0.09;
cctx.fillStyle='#07090b'; cctx.beginPath(); cctx.moveTo(rx-90*sc,ry+6); cctx.lineTo(rx-70*sc,ry-10*sc); cctx.lineTo(rx+110*sc,ry-8*sc); cctx.lineTo(rx+130*sc,ry+8); cctx.closePath(); cctx.fill();
const burst=t>1.6&&t<3.6, sig = t<1.0 ? 0.25+0.15*Math.sin(t*9) : burst ? 0.9 : (t<4.4 ? 0.3*(1-(t-3.6)/0.8) : 0);
drawRadio(rx,ry,sc,t,sig,burst);
for(let i=0;i<SHARDS.length;i++){
const sh=SHARDS[i];
const x=((sh.x*cw - t*sh.sp*1.4)%cw+cw)%cw, y=((sh.y*ch + t*sh.sp*0.7)%ch+ch)%ch;
if(y<barH()||y>ch-barH()) continue;
const tw=0.5+0.5*Math.sin(t*5+i*3);
cctx.fillStyle='rgba(190,225,245,'+(0.2+0.45*tw).toFixed(2)+')';
cctx.save(); cctx.translate(x,y); cctx.rotate(t*2+i); cctx.fillRect(-2*sh.s,-0.8,4*sh.s,1.6); cctx.restore();
}
stepEmbers(dt||0.016,30,0.4);
if(!calm){
const n = sig<0.35 ? 26 : 8;
for(let i=0;i<n;i++){ cctx.fillStyle='rgba(220,235,245,'+(Math.random()*0.12).toFixed(3)+')'; cctx.fillRect(rand(0,cw),rand(barH(),ch-barH()),rand(20,160),1); }
}
const gr=cctx.createLinearGradient(0,0,0,ch); gr.addColorStop(0,'rgba(8,16,28,0.25)'); gr.addColorStop(1,'rgba(8,6,4,0.4)');
cctx.fillStyle=gr; cctx.fillRect(0,0,cw,ch);
const bars=['▁','▂','▃','▄','▅','▆','▇'];
const lvl=Math.round(sig*6), sigStr=Array.from({length:6},(_,i)=>i<lvl?bars[i+1]:'·').join('');
drawBars(1,sig>0.05?'CH-01 // VOSS — DEGRADED':'CH-01 // VOSS — NO CARRIER','SIGNAL '+sigStr+'   LAST CONTACT 48 H',fmtTC(t+19.0),sig<=0.05);
const mh=barH();
if(sig<=0.05 && Math.floor(t*1.8)%2===0){ cctx.fillStyle='rgba(255,70,50,0.95)'; cctx.beginPath(); cctx.arc(cw>520?256:230,mh/2,3,0,Math.PI*2); cctx.fill(); }
cornerBrackets();
}

const STREET=(()=>{ const r=mulberry32(303), arr=[];
for(let i=0;i<16;i++) arr.push({side:i%2?1:-1,base:Math.floor(i/2)/8+(i%2?0.06:0),w:0.55+r()*0.5,h:0.5+r()*0.7,dmg:r()<0.6,jag:Array.from({length:8},()=>r()),win:Array.from({length:30},()=>r()),fire:r()<0.4,ph:r()*10,car:r()<0.55,carSeed:r()*9,rubble:r()<0.6});
return arr; })();
function drawScene2(t, dt){
const vx=cw*0.55, hy=ch*0.48;
const sg=cctx.createLinearGradient(0,0,0,hy);
sg.addColorStop(0,'#05080d'); sg.addColorStop(0.6,'#2a1a18'); sg.addColorStop(1,'#a8541e');
cctx.fillStyle=sg; cctx.fillRect(0,0,cw,ch);
fireGlow(vx,hy,cw*0.42,t,5,0.95);
smokeColumn(vx-cw*0.02,hy,ch*0.5,t,2,0.9,cw*0.05);
smokeColumn(vx+cw*0.03,hy,ch*0.45,t+3,4,0.8,cw*0.045);
cctx.strokeStyle='#0a0c10'; cctx.lineWidth=3; cctx.beginPath();
cctx.moveTo(vx+cw*0.06,hy); cctx.lineTo(vx+cw*0.06,hy-ch*0.2); cctx.moveTo(vx-cw*0.02,hy-ch*0.2); cctx.lineTo(vx+cw*0.16,hy-ch*0.19); cctx.stroke();
const rg=cctx.createLinearGradient(0,hy,0,ch); rg.addColorStop(0,'#2a1a14'); rg.addColorStop(0.3,'#14181c'); rg.addColorStop(1,'#050607');
cctx.fillStyle=rg; cctx.beginPath(); cctx.moveTo(vx-6,hy); cctx.lineTo(vx+6,hy); cctx.lineTo(vx+cw*0.62,ch); cctx.lineTo(vx-cw*0.62,ch); cctx.closePath(); cctx.fill();
for(let k=0;k<10;k++){
const d=((k+t*0.5)%10)/10, s=Math.pow(d,2.2), y=hy+(ch-hy)*s;
cctx.fillStyle='rgba(235,200,140,'+(0.12+0.4*s).toFixed(2)+')';
cctx.fillRect(vx+(0)-1-s*5,y,2+s*10,2+s*16);
}
const items=STREET.map(b=>({b, d:((b.base + t*0.04)%1)})).map(o=>({...o,s:Math.pow(o.d,2.2)})).sort((a,c)=>a.s-c.s);
const haz=(s)=>1-Math.min(1,s*1.4);
items.forEach(({b,s})=>{
if(s<0.012||s>0.97) return;
const rw=cw*0.3*s+5, gy=hy+(ch-hy)*s;
const bw=cw*0.5*s*b.w, bh=ch*0.95*s*b.h;
const x0 = b.side<0 ? vx-rw-bw-cw*0.01*s : vx+rw+cw*0.01*s;
const col=mixColor('#0a0d11','#4a2e22',haz(s)*0.6);
cctx.fillStyle=col;
cctx.beginPath(); cctx.moveTo(x0,gy); cctx.lineTo(x0,gy-bh);
if(b.dmg){
const n=6; for(let i=1;i<=n;i++){ const jx=x0+bw*i/n, jh=bh*(0.55+0.45*b.jag[i%8]); cctx.lineTo(jx,gy-jh); }
} else { cctx.lineTo(x0+bw,gy-bh); }
cctx.lineTo(x0+bw,gy); cctx.closePath(); cctx.fill();
if(s>0.05){
const cols=Math.max(2,Math.round(bw/(14+s*20))), rows=Math.max(3,Math.round(bh/(16+s*26)));
for(let r2=0;r2<rows;r2++) for(let c2=0;c2<cols;c2++){
const wi=(r2*cols+c2)%30, v=b.win[wi];
const wx=x0+bw*(c2+0.2)/cols, wy=gy-bh*(r2+0.8)/rows, ww=bw/cols*0.55, wh=bh/rows*0.45;
if(wy<gy-bh*0.45 && b.dmg && v<0.35){ continue; }
if(v<0.12 && b.fire){ fireGlow(wx+ww/2,wy+wh/2,Math.max(10,ww*1.6),t,b.ph+wi,0.8); cctx.fillStyle='rgba(255,170,80,0.9)'; cctx.fillRect(wx,wy,ww,wh); }
else if(v<0.5){ cctx.fillStyle='rgba(0,0,0,0.75)'; cctx.fillRect(wx,wy,ww,wh); }
else if(v<0.58){ cctx.fillStyle='rgba(255,176,100,'+(0.35+0.2*Math.sin(t*3+wi)).toFixed(2)+')'; cctx.fillRect(wx,wy,ww,wh); }
}
}
cctx.strokeStyle='rgba(255,150,80,'+(0.12+0.3*s).toFixed(2)+')'; cctx.lineWidth=1.2;
cctx.beginPath(); cctx.moveTo(x0+(b.side<0?bw:0),gy-bh); cctx.lineTo(x0+(b.side<0?bw:0),gy); cctx.stroke();
if(b.rubble){ cctx.fillStyle=col; cctx.beginPath(); const rx0=b.side<0?vx-rw:vx+rw; cctx.moveTo(rx0-bw*0.1*b.side,gy); cctx.lineTo(rx0-b.side*bw*0.28,gy-bh*0.08); cctx.lineTo(rx0-b.side*bw*0.55,gy); cctx.closePath(); cctx.fill(); }
if(b.car && s>0.1){
const cx=vx + b.side*rw*(0.62+0.2*b.carSeed%0.3), tilt=(b.carSeed%1-0.5)*0.12;
drawWreckRear(cx,gy+2,Math.max(0.1,s*2.1),tilt,t,b.carSeed,b.carSeed>5);
}
});
const k=Math.max(0.9,Math.min(1.6,ch/520));
cctx.save(); cctx.shadowColor='rgba(255,140,70,0.7)'; cctx.shadowBlur=14;
drawReyes(cw*0.4,ch-barH()-ch*0.04,k,t,'walk',0.7,'255,170,90');
cctx.restore();
stepEmbers(dt||0.016,48,0.6);
anamorphic(vx,hy,cw*0.55,calm?0.14:0.26+0.05*Math.sin(t*2.1),'255,150,70');
const gr=cctx.createLinearGradient(0,0,0,ch); gr.addColorStop(0,'rgba(8,14,24,0.3)'); gr.addColorStop(1,'rgba(8,6,4,0.4)');
cctx.fillStyle=gr; cctx.fillRect(0,0,cw,ch);
if(t>4.3){
const a=easeOut((t-4.3)/1.3);
const ty=barH()+Math.max(ch*0.1,32);
cctx.save(); cctx.globalAlpha=a;
cctx.font=Math.max(9,hudSize())+'px '+MONO; cctx.fillStyle='#9fc4da';
trackedText('CHAPTER III',cw/2,ty-Math.max(18,ch*0.065),5);
const fs=Math.max(16,Math.min(ch*0.062,44));
cctx.font=fs+'px "Black Ops One", sans-serif'; cctx.fillStyle='#eef5f9';
cctx.shadowColor='rgba(80,160,220,0.8)'; cctx.shadowBlur=18;
trackedText('THE INDUSTRIAL QUARTER',cw/2,ty,fs*0.16);
cctx.shadowBlur=0;
const lw=lerp(0,Math.min(cw*0.5,440),easeOut((t-4.5)/1.2));
cctx.fillStyle='rgba(120,190,235,0.9)'; cctx.fillRect(cw/2-lw/2,ty+fs*0.45,lw,1.5);
cctx.restore();
if(t<4.9) anamorphic(cw/2,ty-fs*0.3,cw*0.5,(1-(t-4.3)/0.6)*0.4,'170,215,245');
}
const L2=['ORDERS: NONE','COMMS: DOWN','STATUS: MOVING'];
const li=Math.min(2,Math.floor(Math.max(0,t-0.8)/2.2));
const typed=L2[li].slice(0,Math.floor(Math.max(0,(t-0.8-li*2.2))*16));
drawBars(1,'GHOST // NO ORDERS',typed+((Math.floor(t*3)%2===0)?'▌':' '),fmtTC(t+41.0),true);
cornerBrackets();
}

_startCrawl({
crawl: crawl, panels: panels, advanceHint: advanceHint, beginHint: beginHint,
durations: [7000, 8600], pulse: 'crawlBtnPulseUrban', resize: resizeCanvas, canvas: canvas,
draw: (i, t, dt)=>{
cctx.clearRect(0,0,cw,ch);
if(i===0) drawScene0(t, dt);
else if(i===1) drawScene1(t, dt);
else drawScene2(t, dt);
},
onReset: ()=>{ embers = []; },
onDone: onDone
});
}

function showNightCrawl(onDone){
const crawl = document.getElementById('story-crawl-night');
const canvas = document.createElement('canvas');
canvas.id = 'cutscene-canvas-night';
crawl.insertBefore(canvas, crawl.firstChild);
const cctx = canvas.getContext('2d');
const advanceHint = document.getElementById('cutscene-advance-hint-night');
const beginHint = document.getElementById('cutscene-begin-hint-night');
const panels = Array.from(crawl.querySelectorAll('.cutscene-panel'));
crawl.classList.add('active');
$buildings.crawlActive = true;

let cw=0, ch=0;
function resizeCanvas(){
cw = canvas.width = window.innerWidth;
ch = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function mixColor(c1,c2,t){
const p=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
const [r1,g1,b1]=p(c1), [r2,g2,b2]=p(c2);
const r=Math.round(r1+(r2-r1)*t), g=Math.round(g1+(g2-g1)*t), b=Math.round(b1+(b2-b1)*t);
return 'rgb('+r+','+g+','+b+')';
}

const ROOFS = (()=>{
const arr=[]; let x=0;
for(let i=0;i<24;i++){
const w = rand(45,95), h = rand(40,150);
arr.push({x,w,h});
x += w + rand(4,14);
}
return {arr, totalW:x};
})();
const STARS = [0].map(()=>null).concat(Array.from({length:70}, ()=>({x:rand(0,1), y:rand(0,0.55), r:rand(0.4,1.6), phase:rand(0,10)}))).slice(1);
function drawRooftops(t, panSpd){
const scale = Math.max(cw / ROOFS.totalW, 0.001) * 1.5;
const panX = -t*panSpd;
STARS.forEach(s=>{
const tw = 0.5+0.5*Math.sin(t*1.5+s.phase);
cctx.fillStyle = 'rgba(220,230,255,'+(tw*0.8).toFixed(2)+')';
cctx.beginPath(); cctx.arc(s.x*cw, s.y*ch, s.r, 0, Math.PI*2); cctx.fill();
});
const baseX = -(ROOFS.totalW*scale-cw)/2 + panX;
cctx.fillStyle = '#04070a';
ROOFS.arr.forEach(b=>{
const bx = baseX + b.x*scale;
cctx.fillRect(bx, ch-b.h, b.w*scale, b.h+80);
});
}

let motes = [];
function spawnMotes(n, colorFn){
for(let i=0;i<n;i++){
motes.push({x:rand(0,cw), y:rand(0,ch*0.7), vx:rand(-6,6), vy:rand(-10,-2), r:rand(0.6,2), life:rand(3,7), t:0, col:colorFn()});
}
}
function stepMotes(dt){
for(let i=motes.length-1;i>=0;i--){
const m = motes[i];
m.t += dt; m.x += m.vx*dt; m.y += m.vy*dt;
if(m.t > m.life){ motes.splice(i,1); continue; }
const a = Math.max(0, 1 - m.t/m.life);
cctx.fillStyle = m.col.replace('ALPHA', (a*0.8).toFixed(2));
cctx.beginPath(); cctx.arc(m.x, m.y, m.r, 0, Math.PI*2); cctx.fill();
}
}

function drawScene0(t){
const g = cctx.createLinearGradient(0,0,0,ch);
g.addColorStop(0,'#050810'); g.addColorStop(1,'#0a1018');
cctx.fillStyle = g; cctx.fillRect(0,0,cw,ch);
drawRooftops(t, 3);
if(Math.random()<0.05) spawnMotes(1, ()=> 'rgba(200,220,255,ALPHA)');
stepMotes(0.016);
}

let scene1FlashFired = false;
function drawSaucer(x,y,s,t){
cctx.save();
cctx.translate(x,y); cctx.scale(s,s);
const rim = cctx.createRadialGradient(0,0,10,0,0,90);
rim.addColorStop(0,'rgba(120,255,190,0.25)'); rim.addColorStop(1,'rgba(120,255,190,0)');
cctx.fillStyle = rim;
cctx.beginPath(); cctx.arc(0,0,90,0,Math.PI*2); cctx.fill();
cctx.fillStyle = 'rgba(8,12,10,0.97)';
cctx.beginPath();
cctx.ellipse(0,0,58,20,0,0,Math.PI*2);
cctx.fill();
cctx.beginPath();
cctx.ellipse(0,-8,26,16,0,Math.PI,Math.PI*2);
cctx.fill();
const pulse = 0.5+0.5*Math.sin(t*3);
cctx.fillStyle = 'rgba(120,255,190,'+(0.5+pulse*0.4).toFixed(2)+')';
for(let i=-2;i<=2;i++){
cctx.beginPath(); cctx.arc(i*18, 4, 2.2, 0, Math.PI*2); cctx.fill();
}
const beam = cctx.createLinearGradient(0,10,0,ch);
beam.addColorStop(0,'rgba(140,255,200,0.16)'); beam.addColorStop(1,'rgba(140,255,200,0)');
cctx.fillStyle = beam;
cctx.beginPath();
cctx.moveTo(-14,14); cctx.lineTo(14,14); cctx.lineTo(70,ch); cctx.lineTo(-70,ch);
cctx.closePath(); cctx.fill();
cctx.restore();
}
function drawScene1(t){
const g = cctx.createLinearGradient(0,0,0,ch);
g.addColorStop(0, mixColor('#050810','#0a2016', Math.min(t/4,1))); g.addColorStop(1,'#0a1018');
cctx.fillStyle = g; cctx.fillRect(0,0,cw,ch);
drawRooftops(t, 8);
const rise = Math.min(t/3.2, 1);
const sx = cw*0.55 + Math.sin(t*0.4)*30;
const sy = ch*0.62 - rise*ch*0.24;
drawSaucer(sx, sy, 1.1+rise*0.35, t);
if(Math.random()<0.5) spawnMotes(1, ()=> 'rgba(140,255,200,ALPHA)');
stepMotes(0.016);
if(t > 5.0){
const ft = t - 5.0;
if(ft < 0.6){
const a = 1-ft/0.6;
cctx.fillStyle = 'rgba(140,255,200,'+(a*0.35).toFixed(2)+')';
cctx.fillRect(0,0,cw,ch);
}
if(!scene1FlashFired){ scene1FlashFired = true; spawnMotes(40, ()=> 'rgba(160,255,210,ALPHA)'); }
}
}

function drawScene2(t){
const g = cctx.createLinearGradient(0,0,0,ch);
g.addColorStop(0,'#050b0a'); g.addColorStop(1,'#020504');
cctx.fillStyle = g; cctx.fillRect(0,0,cw,ch);
cctx.save(); cctx.globalAlpha = 0.6;
drawRooftops(t*0.3, 2);
cctx.restore();
drawSaucer(cw*0.78, ch*0.22, 0.7, t);
if(motes.length < 30 && Math.random()<0.3) spawnMotes(1, ()=> 'rgba(120,255,190,ALPHA)');
stepMotes(0.016);
const sx = cw*0.32, sy = ch*0.84;
const bob = Math.sin(t*2.2)*1.2;
cctx.fillStyle = 'rgba(4,5,5,0.95)';
cctx.save();
cctx.translate(sx, sy+bob);
cctx.beginPath(); cctx.arc(0,-44,7,0,Math.PI*2); cctx.fill();
cctx.fillRect(-6,-38,12,30);
cctx.fillRect(-9,-8,7,26);
cctx.fillRect(2,-8,7,26);
cctx.save(); cctx.rotate(-0.05);
cctx.fillRect(3,-32,32,4);
cctx.restore();
cctx.restore();
cctx.fillStyle = 'rgba(255,40,40,0.7)';
cctx.beginPath(); cctx.arc(sx+3, sy-32+bob, 1.6, 0, Math.PI*2); cctx.fill();
}

_startCrawl({
crawl: crawl, panels: panels, advanceHint: advanceHint, beginHint: beginHint,
durations: [7000, 8600], pulse: 'crawlBtnPulseNight', resize: resizeCanvas, canvas: canvas,
draw: (i, t)=>{
cctx.clearRect(0,0,cw,ch);
if(i===0) drawScene0(t);
else if(i===1) drawScene1(t);
else drawScene2(t);
},
onReset: ()=>{ motes = []; },
onDone: onDone
});
}

function _startCrawl(cfg){
const crawl = cfg.crawl, panels = cfg.panels;
const advanceHint = cfg.advanceHint, beginHint = cfg.beginHint;
let currentPanel = 0;
let panelStart = performance.now();
let lastNow = panelStart;
let dismissed = false;
let autoAdvanceTimer = null, readyTimer = null, rafId = null;

function activatePanel(i){
panels.forEach((p,idx)=> p.classList.toggle('active', idx===i));
currentPanel = i;
panelStart = performance.now();
advanceHint.classList.remove('show');
beginHint.classList.remove('show');
beginHint.style.animation = '';
clearTimeout(autoAdvanceTimer); clearTimeout(readyTimer);
if(i < panels.length-1){
setTimeout(()=>{ if(!dismissed && currentPanel===i) advanceHint.classList.add('show'); }, 1400);
autoAdvanceTimer = setTimeout(()=>{ if(!dismissed && currentPanel===i) nextPanel(); }, cfg.durations[i]);
} else {
setTimeout(()=>{ if(!dismissed) beginHint.classList.add('show'); }, 1000);
readyTimer = setTimeout(()=>{ if(!dismissed) beginHint.style.animation = cfg.pulse+' 1.2s ease-in-out infinite'; }, 4000);
}
}
function nextPanel(){
clearTimeout(autoAdvanceTimer);
if(currentPanel < panels.length-1) activatePanel(currentPanel+1);
}
function dismiss(){
if(dismissed) return;
dismissed = true;
$buildings.crawlActive = false;
clearTimeout(autoAdvanceTimer); clearTimeout(readyTimer);
window.removeEventListener('resize', cfg.resize);
if(rafId) cancelAnimationFrame(rafId);
crawl.style.transition = 'opacity 0.8s';
crawl.style.opacity = '0';
setTimeout(()=>{
crawl.style.opacity = '';
crawl.style.transition = '';
crawl.classList.remove('active');
panels.forEach((p,idx)=> p.classList.toggle('active', idx===0));
beginHint.style.animation = '';
beginHint.classList.remove('show');
advanceHint.classList.remove('show');
if(cfg.onReset) cfg.onReset();
if(cfg.canvas){ cfg.canvas.width = 0; cfg.canvas.height = 0; cfg.canvas.remove(); }
cfg.onDone();
}, 800);
}
function loop(now){
const t = Math.max(0, (now - panelStart)/1000);
const dt = Math.min(0.05, Math.max(0, (now - lastNow)/1000));
lastNow = now;
cfg.draw(currentPanel, t, dt);
rafId = requestAnimationFrame(loop);
}
rafId = requestAnimationFrame(loop);
activatePanel(0);

const MIN_DISMISS_DELAY = 900;
let touchStartY = 0, touchMoved = false;
crawl.addEventListener('touchstart', e=>{ touchStartY = e.touches[0].clientY; touchMoved = false; }, {passive:true});
crawl.addEventListener('touchmove', e=>{ if(Math.abs(e.touches[0].clientY - touchStartY) > 10) touchMoved = true; }, {passive:true});
const skipBtn = cfg.skipBtn || null;
if(skipBtn){
skipBtn.addEventListener('click', e=>{ e.preventDefault(); e.stopPropagation(); dismiss(); });
skipBtn.addEventListener('touchstart', e=>{ e.preventDefault(); e.stopPropagation(); dismiss(); }, {passive:false});
}
crawl.addEventListener('touchend', e=>{
if((skipBtn && e.target===skipBtn) || touchMoved) return;
if(performance.now()-panelStart < MIN_DISMISS_DELAY) return;
e.preventDefault();
if(currentPanel === panels.length-1) dismiss(); else nextPanel();
}, {passive:false});
crawl.addEventListener('click', e=>{
if(skipBtn && e.target===skipBtn) return;
if(performance.now()-panelStart < MIN_DISMISS_DELAY) return;
if(currentPanel === panels.length-1) dismiss(); else nextPanel();
});
}

function showArcticCrawl(onDone){
const crawl = document.getElementById('story-crawl-arctic');
const canvas = document.createElement('canvas');
canvas.id = 'cutscene-canvas-arctic';
crawl.insertBefore(canvas, crawl.firstChild);
const cctx = canvas.getContext('2d');
const advanceHint = document.getElementById('cutscene-advance-hint-arctic');
const beginHint = document.getElementById('cutscene-begin-hint-arctic');
const panels = Array.from(crawl.querySelectorAll('.cutscene-panel'));
crawl.classList.add('active');
$buildings.crawlActive = true;

let cw=0, ch=0;
function resizeCanvas(){
cw = canvas.width = window.innerWidth;
ch = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);


const STARS = Array.from({length:60}, ()=>({x:rand(0,1), y:rand(0,0.42), r:rand(0.4,1.4), ph:rand(0,10)}));
const SNOW = Array.from({length: window.innerWidth<700 ? 70 : 130}, ()=>({x:Math.random(), y:Math.random(), z:Math.random(), ph:rand(0,6.28)}));

function drawStars(t, a){
STARS.forEach(s=>{
const tw = 0.4+0.6*Math.sin(t*1.3+s.ph)*0.5+0.3;
cctx.fillStyle = 'rgba(210,235,255,'+(clamp01(tw)*a).toFixed(2)+')';
cctx.beginPath(); cctx.arc(s.x*cw, s.y*ch, s.r, 0, Math.PI*2); cctx.fill();
});
}
function drawSnow(t, wind, fall, alphaMul){
cctx.fillStyle = '#e8f4ff';
for(let i=0;i<SNOW.length;i++){
const s = SNOW[i];
const sp = 0.35 + s.z*0.9;
const x = wrap(s.x*cw + t*wind*sp + Math.sin(t*0.8+s.ph)*14, cw);
const y = wrap(s.y*ch + t*fall*sp, ch);
const r = 0.7 + s.z*2.3;
cctx.globalAlpha = (0.25 + s.z*0.6) * alphaMul;
if(s.z > 0.8 && wind > 90){ cctx.fillRect(x, y, r*5, r*0.8); }
else { cctx.beginPath(); cctx.arc(x, y, r, 0, Math.PI*2); cctx.fill(); }
}
cctx.globalAlpha = 1;
}
function ridgeY(x, baseY, amp, seed, freq){
return baseY - amp*(0.55*Math.sin(x*freq+seed) + 0.3*Math.sin(x*freq*2.3+seed*1.7) + 0.15*Math.sin(x*freq*5.1+seed*0.6));
}
function drawRidge(baseY, amp, seed, freq, color, offX, rimA){
cctx.fillStyle = color;
cctx.beginPath(); cctx.moveTo(0, ch);
for(let x=0; x<=cw+10; x+=10) cctx.lineTo(x, ridgeY(x+offX, baseY, amp, seed, freq));
cctx.lineTo(cw+10, ch); cctx.closePath(); cctx.fill();
if(rimA){
cctx.strokeStyle = 'rgba(190,228,250,'+rimA+')'; cctx.lineWidth = 1.2;
cctx.beginPath();
for(let x=0; x<=cw+10; x+=10){
const y = ridgeY(x+offX, baseY, amp, seed, freq);
if(x===0) cctx.moveTo(x,y); else cctx.lineTo(x,y);
}
cctx.stroke();
}
}
function scrim(a){
const g = cctx.createRadialGradient(cw/2,ch/2,Math.min(cw,ch)*0.1, cw/2,ch/2,Math.max(cw,ch)*0.65);
g.addColorStop(0,'rgba(3,8,14,'+a+')'); g.addColorStop(1,'rgba(3,8,14,0)');
cctx.fillStyle = g; cctx.fillRect(0,0,cw,ch);
}

function drawAurora(t){
for(let b=0;b<3;b++){
const y0 = ch*(0.13 + b*0.07);
const g = cctx.createLinearGradient(0,y0-34,0,y0+120);
g.addColorStop(0,'rgba(90,255,220,0)');
g.addColorStop(0.4,'rgba(90,230,210,'+(0.17-b*0.035).toFixed(3)+')');
g.addColorStop(1,'rgba(60,140,255,0)');
cctx.fillStyle = g;
cctx.beginPath();
for(let x=0;x<=cw+12;x+=12){
const y = y0 + Math.sin(x*0.005 + t*0.35 + b*2)*32;
if(x===0) cctx.moveTo(x,y); else cctx.lineTo(x,y);
}
for(let x=cw+12;x>=0;x-=12){
cctx.lineTo(x, y0 + 100 + Math.sin(x*0.005 + t*0.35 + b*2)*32 + Math.sin(x*0.011 - t*0.5)*18);
}
cctx.closePath(); cctx.fill();
}
}

function drawBunker(px, gy, sc, t, i){
cctx.save(); cctx.translate(px, gy); cctx.scale(sc, sc);
cctx.fillStyle = '#050b12';
cctx.beginPath(); cctx.moveTo(-26,0); cctx.lineTo(-20,-16); cctx.lineTo(20,-16); cctx.lineTo(26,0); cctx.closePath(); cctx.fill();
cctx.fillStyle = 'rgba(200,230,250,0.25)'; cctx.fillRect(-20,-17,40,2);
const blink = 0.35 + 0.65*(Math.sin(t*2.2+i*1.9) > 0.55 ? 1 : 0.2);
cctx.fillStyle = 'rgba(255,60,40,'+blink.toFixed(2)+')'; cctx.fillRect(-9,-11,18,2.5);
cctx.strokeStyle = '#050b12'; cctx.lineWidth = 1.4;
cctx.beginPath(); cctx.moveTo(14,-16); cctx.lineTo(14,-34); cctx.stroke();
cctx.fillStyle = 'rgba(255,70,50,'+(Math.sin(t*3+i)>0?0.9:0.15).toFixed(2)+')';
cctx.beginPath(); cctx.arc(14,-35,1.8,0,Math.PI*2); cctx.fill();
cctx.restore();
}
function drawTank(px, gy, sc, dir, lights, t){
cctx.save(); cctx.translate(px, gy); cctx.scale(sc*dir, sc);
cctx.fillStyle = '#070d14';
cctx.fillRect(-70,-20,140,20);
cctx.beginPath(); cctx.moveTo(-64,-20); cctx.lineTo(-56,-38); cctx.lineTo(58,-38); cctx.lineTo(68,-20); cctx.closePath(); cctx.fill();
cctx.beginPath(); cctx.moveTo(-28,-38); cctx.lineTo(-22,-56); cctx.lineTo(24,-56); cctx.lineTo(30,-38); cctx.closePath(); cctx.fill();
cctx.fillRect(24,-51,78,5);
cctx.fillRect(100,-53,8,9);
cctx.fillStyle = 'rgba(200,230,250,0.22)';
cctx.fillRect(-56,-39,114,2); cctx.fillRect(-22,-57,46,2);
cctx.fillStyle = '#0e1a26';
for(let i=0;i<7;i++){ cctx.beginPath(); cctx.arc(-57+i*19,-9,7,0,Math.PI*2); cctx.fill(); }
if(lights){
const flick = 0.85 + 0.15*Math.sin(t*9);
const beam = cctx.createLinearGradient(66,-28,300,-8);
beam.addColorStop(0,'rgba(255,200,110,'+(0.30*flick).toFixed(2)+')'); beam.addColorStop(1,'rgba(255,200,110,0)');
cctx.fillStyle = beam;
cctx.beginPath(); cctx.moveTo(66,-32); cctx.lineTo(66,-22); cctx.lineTo(320,20); cctx.lineTo(320,-70); cctx.closePath(); cctx.fill();
const glow = cctx.createRadialGradient(68,-28,1,68,-28,28);
glow.addColorStop(0,'rgba(255,220,140,'+(0.9*flick).toFixed(2)+')'); glow.addColorStop(1,'rgba(255,170,70,0)');
cctx.fillStyle = glow; cctx.beginPath(); cctx.arc(68,-28,28,0,Math.PI*2); cctx.fill();
}
cctx.restore();
}

function drawScene0(t){
const g = cctx.createLinearGradient(0,0,0,ch*0.75);
g.addColorStop(0,'#060e1a'); g.addColorStop(0.5,'#132639'); g.addColorStop(1,'#37576f');
cctx.fillStyle = g; cctx.fillRect(0,0,cw,ch);
drawStars(t, 0.75);
drawAurora(t);
const hg = cctx.createRadialGradient(cw*0.72,ch*0.66,4,cw*0.72,ch*0.66,cw*0.5);
hg.addColorStop(0,'rgba(150,200,230,0.24)'); hg.addColorStop(1,'rgba(150,200,230,0)');
cctx.fillStyle = hg; cctx.fillRect(0,0,cw,ch);
drawRidge(ch*0.60, 70, 1.0, 0.006, '#1c3247', t*2, 0.22);
drawRidge(ch*0.68, 55, 4.0, 0.009, '#132434', t*4, 0.16);
const nearOff = t*7;
drawRidge(ch*0.79, 28, 7.0, 0.013, '#0b1926', nearOff, 0.12);
const xs = [0.10, 0.30, 0.50, 0.71, 0.90];
const sc = Math.max(0.6, Math.min(cw/900, 1.25));
xs.forEach((fx,i)=>{
const px = wrap(fx*cw*1.15 - nearOff*0.0, cw*1.15) - cw*0.075;
const gy = ridgeY(px+nearOff, ch*0.79, 28, 7.0, 0.013) + 2;
if(i===2) drawTank(px, gy, sc*0.62, 1, false, t);
else drawBunker(px, gy, sc, t, i);
});
drawSnow(t, 70, 45, 0.8);
scrim(0.5);
}

function drawRadioHUD(t){
const x = 18, y = 20, w = Math.min(cw*0.46, 300), h = 44;
cctx.save();
cctx.font = '10px "Share Tech Mono", monospace';
cctx.fillStyle = 'rgba(160,230,255,0.88)';
cctx.fillText('CH-04 // NEXUS — UNSECURED', x, y+10);
if(Math.floor(t*2)%2===0){ cctx.fillStyle = 'rgba(255,70,60,0.95)'; cctx.beginPath(); cctx.arc(x+w-30, y+6, 3, 0, Math.PI*2); cctx.fill(); }
cctx.fillStyle = 'rgba(160,230,255,0.7)'; cctx.fillText('REC', x+w-22, y+10);
cctx.strokeStyle = 'rgba(150,225,255,0.4)'; cctx.lineWidth = 1;
cctx.strokeRect(x+0.5, y+16.5, w, h);
const voice = t > 1.2 && t < 5.2;
cctx.strokeStyle = voice ? 'rgba(170,242,255,0.95)' : 'rgba(120,180,210,0.45)';
cctx.beginPath();
for(let i=0;i<=w;i+=3){
const env = voice ? (0.35 + 0.65*Math.abs(Math.sin(t*3+i*0.02))) : 0.08;
const a = (Math.sin(i*0.9 + t*38)*0.5 + (Math.random()-0.5)) * env * (h/2-3);
const yy = y + 16 + h/2 + a;
if(i===0) cctx.moveTo(x+i, yy); else cctx.lineTo(x+i, yy);
}
cctx.stroke();
cctx.restore();
}
function drawGunship(gx, gy, t){
cctx.save(); cctx.translate(gx, gy);
cctx.fillStyle = '#03070b';
cctx.beginPath(); cctx.ellipse(0,0,34,12,0,0,Math.PI*2); cctx.fill();
cctx.fillRect(-84,-6,54,5);
cctx.beginPath(); cctx.moveTo(-84,-6); cctx.lineTo(-92,-20); cctx.lineTo(-78,-6); cctx.closePath(); cctx.fill();
cctx.fillRect(-2,-16,4,5);
cctx.fillStyle = 'rgba(120,200,255,0.4)';
cctx.beginPath(); cctx.ellipse(18,-2,12,6,0,Math.PI,Math.PI*2); cctx.fill();
cctx.fillStyle = 'rgba(190,225,245,'+(0.30+0.12*Math.sin(t*40)).toFixed(2)+')';
cctx.beginPath(); cctx.ellipse(0,-17,64,2.2,0,0,Math.PI*2); cctx.fill();
cctx.strokeStyle = '#03070b'; cctx.lineWidth = 1.6;
cctx.beginPath(); cctx.moveTo(-18,12); cctx.lineTo(-18,17); cctx.lineTo(20,17); cctx.lineTo(20,12); cctx.stroke();
if(Math.sin(t*4) > 0){ cctx.fillStyle = 'rgba(255,60,50,0.95)'; cctx.beginPath(); cctx.arc(-90,-19,1.8,0,Math.PI*2); cctx.fill(); }
cctx.restore();
}
function drawScene1(t){
const g = cctx.createLinearGradient(0,0,0,ch);
g.addColorStop(0,'#040a14'); g.addColorStop(0.55,'#112336'); g.addColorStop(1,'#26425a');
cctx.fillStyle = g; cctx.fillRect(0,0,cw,ch);
drawStars(t, 0.5);
drawRidge(ch*0.56, 60, 2.0, 0.007, '#0f1f2f', 0, 0.16);
const B=ch*0.72, A=34, SD=5.0, F=0.010;
drawRidge(B, A, SD, F, '#08131d', 0, 0.28);
for(let i=0;i<6;i++){
const x = cw + 40 + i*64 - t*58;
if(x < -50 || x > cw+50) continue;
const y = ridgeY(x, B, A, SD, F) - 1;
cctx.fillStyle = '#03070b'; cctx.fillRect(x-1, y-12, 34, 11);
cctx.fillStyle = '#03070b'; cctx.fillRect(x+6, y-17, 16, 6);
const gl = cctx.createRadialGradient(x,y-6,1,x,y-6,15);
gl.addColorStop(0,'rgba(255,205,120,0.95)'); gl.addColorStop(1,'rgba(255,170,70,0)');
cctx.fillStyle = gl; cctx.beginPath(); cctx.arc(x,y-6,15,0,Math.PI*2); cctx.fill();
}
const gx = -100 + t*84, gy = ch*0.26 + Math.sin(t*1.1)*10;
const tx = gx + 150 + Math.sin(t*1.4)*110, ty = ch*0.76;
const cone = cctx.createLinearGradient(gx+10, gy+14, tx, ty);
cone.addColorStop(0,'rgba(205,238,255,0.32)'); cone.addColorStop(1,'rgba(205,238,255,0.05)');
cctx.fillStyle = cone;
cctx.beginPath(); cctx.moveTo(gx+8,gy+14); cctx.lineTo(gx+18,gy+14); cctx.lineTo(tx+50,ty); cctx.lineTo(tx-50,ty); cctx.closePath(); cctx.fill();
const pool = cctx.createRadialGradient(tx,ty,4,tx,ty,70);
pool.addColorStop(0,'rgba(215,242,255,0.28)'); pool.addColorStop(1,'rgba(215,242,255,0)');
cctx.fillStyle = pool; cctx.beginPath(); cctx.ellipse(tx,ty,70,22,0,0,Math.PI*2); cctx.fill();
drawGunship(gx, gy, t);
drawSnow(t, 60, 55, 0.7);
if(t > 5.2){
const ft = t - 5.2;
if(ft < 0.5){ cctx.fillStyle = 'rgba(200,235,255,'+((1-ft/0.5)*0.28).toFixed(3)+')'; cctx.fillRect(0,0,cw,ch); }
}
scrim(0.5);
drawRadioHUD(t);
}

let breath = [];
let breathClock = 0;
function drawReyes(sx, sy, k, t){
cctx.save(); cctx.translate(sx, sy); cctx.scale(k, k);
const step = Math.sin(t*3.2)*5, bob = Math.abs(Math.sin(t*3.2))*1.6;
cctx.fillStyle = '#05080c';
cctx.beginPath(); cctx.arc(0,-46-bob,7.5,0,Math.PI*2); cctx.fill();
cctx.fillRect(-8,-40-bob,16,4);
cctx.fillRect(-7,-38-bob,14,32);
cctx.save(); cctx.translate(step,0); cctx.fillRect(-6,-8-bob,7,26); cctx.restore();
cctx.save(); cctx.translate(-step,0); cctx.fillRect(0,-8-bob,7,26); cctx.restore();
cctx.save(); cctx.rotate(-0.06); cctx.fillRect(4,-32-bob,34,4); cctx.restore();
cctx.fillStyle = '#4a1616';
cctx.beginPath();
cctx.moveTo(-5,-38-bob);
cctx.quadraticCurveTo(-18,-36+Math.sin(t*6)*3-bob, -32-Math.sin(t*4)*3, -32+Math.sin(t*5)*4-bob);
cctx.lineTo(-30-Math.sin(t*4)*3, -26+Math.sin(t*5)*4-bob);
cctx.quadraticCurveTo(-16,-30-bob,-4,-33-bob);
cctx.closePath(); cctx.fill();
cctx.strokeStyle = 'rgba(160,225,250,0.28)'; cctx.lineWidth = 1;
cctx.beginPath(); cctx.moveTo(7,-38-bob); cctx.lineTo(7,-8-bob); cctx.moveTo(4,-52-bob); cctx.lineTo(8,-46-bob); cctx.stroke();
cctx.restore();
}
function drawScene2(t, dt){
const g = cctx.createLinearGradient(0,0,0,ch);
g.addColorStop(0,'#101c2b'); g.addColorStop(0.6,'#2c4560'); g.addColorStop(1,'#3d5d78');
cctx.fillStyle = g; cctx.fillRect(0,0,cw,ch);
cctx.save(); cctx.globalAlpha = 0.5; drawRidge(ch*0.62, 40, 3.0, 0.008, '#22384d', t*3, 0); cctx.restore();
const gyGround = ch*0.80;
const gg = cctx.createLinearGradient(0,gyGround-20,0,ch);
gg.addColorStop(0,'#2b4459'); gg.addColorStop(1,'#0d1824');
cctx.fillStyle = gg; cctx.fillRect(0,gyGround-10,cw,ch);
const prog = clamp01(t/8.6);
const tsc = Math.max(0.55, Math.min(cw/900,1.3)) * (0.9 + 0.2*prog);
cctx.save(); cctx.globalAlpha = 0.5 + 0.3*prog;
drawTank(cw*0.80, gyGround, tsc, -1, true, t);
cctx.restore();
const fog = cctx.createLinearGradient(0,ch*0.42,0,ch*0.88);
fog.addColorStop(0,'rgba(95,125,150,0)'); fog.addColorStop(0.5,'rgba(95,125,150,0.30)'); fog.addColorStop(1,'rgba(95,125,150,0)');
cctx.fillStyle = fog; cctx.fillRect(0,ch*0.42,cw,ch*0.46);
const k = Math.max(0.8, Math.min(1.3, ch/620));
const rx = cw*0.28, ry = ch*0.86;
breathClock += dt;
if(breathClock > 0.9){ breathClock = 0; breath.push({x:rx+12*k, y:ry-50*k, t:0}); }
for(let i=breath.length-1;i>=0;i--){
const b = breath[i]; b.t += dt; b.x += 16*dt; b.y -= 9*dt;
if(b.t > 1.6){ breath.splice(i,1); continue; }
cctx.fillStyle = 'rgba(225,240,255,'+((1-b.t/1.6)*0.5).toFixed(2)+')';
cctx.beginPath(); cctx.arc(b.x, b.y, 3 + b.t*7, 0, Math.PI*2); cctx.fill();
}
drawReyes(rx, ry, k, t);
drawSnow(t, 190, 70, 1.0);
const gust = 0.05 + 0.06*(0.5+0.5*Math.sin(t*1.3));
cctx.fillStyle = 'rgba(220,240,255,'+gust.toFixed(3)+')'; cctx.fillRect(0,0,cw,ch);
scrim(0.55);
}

_startCrawl({
crawl: crawl, panels: panels, advanceHint: advanceHint, beginHint: beginHint,
durations: [7000, 8600], pulse: 'crawlBtnPulseArctic', resize: resizeCanvas, canvas: canvas,
draw: (i, t, dt)=>{
cctx.clearRect(0,0,cw,ch);
if(i===0) drawScene0(t);
else if(i===1) drawScene1(t);
else drawScene2(t, dt);
},
onReset: ()=>{ breath = []; },
onDone: onDone
});
}

function showSpaceCrawl(onDone){
const crawl = document.getElementById('story-crawl-space');
const canvas = document.createElement('canvas');
canvas.id = 'cutscene-canvas-space';
crawl.insertBefore(canvas, crawl.firstChild);
const cctx = canvas.getContext('2d');
const advanceHint = document.getElementById('cutscene-advance-hint-space');
const beginHint = document.getElementById('cutscene-begin-hint-space');
const panels = Array.from(crawl.querySelectorAll('.cutscene-panel'));
crawl.classList.add('active');
$buildings.crawlActive = true;

let cw=0, ch=0;
function resizeCanvas(){
cw = canvas.width = window.innerWidth;
ch = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);


const STARS = Array.from({length:110}, ()=>({x:rand(0,1), y:rand(0,1), r:rand(0.3,1.5), ph:rand(0,10), z:rand(0.2,1)}));
const CITY = Array.from({length:34}, ()=>({u:rand(-0.7,0.7), v:rand(0.02,0.2), ph:rand(0,10)}));
const DUST = Array.from({length: window.innerWidth<700 ? 28 : 50}, ()=>({x:Math.random(), y:Math.random(), z:Math.random(), ph:rand(0,6.28)}));

function drawStars(t, a, drift){
for(let i=0;i<STARS.length;i++){
const s = STARS[i];
const x = wrap(s.x*cw - t*drift*s.z, cw);
const tw = clamp01(0.55 + 0.45*Math.sin(t*1.4 + s.ph));
cctx.fillStyle = 'rgba(210,230,255,'+(tw*a*(0.4+s.z*0.6)).toFixed(2)+')';
cctx.beginPath(); cctx.arc(x, s.y*ch, s.r, 0, Math.PI*2); cctx.fill();
}
}
function scrim(a){
const g = cctx.createRadialGradient(cw/2,ch/2,Math.min(cw,ch)*0.1, cw/2,ch/2,Math.max(cw,ch)*0.65);
g.addColorStop(0,'rgba(2,4,12,'+a+')'); g.addColorStop(1,'rgba(2,4,12,0)');
cctx.fillStyle = g; cctx.fillRect(0,0,cw,ch);
}
function drawEarth(t){
const r = cw*0.95, ex = cw*0.38, ey = ch + r*0.80;
const g = cctx.createRadialGradient(ex, ey-r*0.9, r*0.05, ex, ey, r);
g.addColorStop(0,'#0d3a6e'); g.addColorStop(0.7,'#06182f'); g.addColorStop(1,'#020812');
cctx.fillStyle = g; cctx.beginPath(); cctx.arc(ex, ey, r, 0, Math.PI*2); cctx.fill();
cctx.save();
cctx.shadowColor = 'rgba(90,170,255,0.9)'; cctx.shadowBlur = 22;
cctx.strokeStyle = 'rgba(110,185,255,0.65)'; cctx.lineWidth = 2.5;
cctx.beginPath(); cctx.arc(ex, ey, r, Math.PI*1.16, Math.PI*1.84); cctx.stroke();
cctx.restore();
for(let i=0;i<CITY.length;i++){
const c = CITY[i];
const x = ex + c.u*r*0.9;
const yTop = ey - Math.sqrt(Math.max(0, r*r - (x-ex)*(x-ex)));
const y = yTop + c.v*r*0.22;
cctx.fillStyle = 'rgba(255,200,120,'+(clamp01(0.25+0.5*Math.sin(t*0.9+c.ph))).toFixed(2)+')';
cctx.fillRect(x, y, 1.6, 1.6);
}
}
function drawCarrier(x, y, sc, t){
cctx.save(); cctx.translate(x, y); cctx.scale(sc, sc);
const pulse = 0.5+0.5*Math.sin(t*2.2);
for(let k=-1;k<=1;k+=2){
const eg = cctx.createRadialGradient(-216,k*9,1,-216,k*9,46);
eg.addColorStop(0,'rgba(160,220,255,0.85)'); eg.addColorStop(0.4,'rgba(100,150,255,0.35)'); eg.addColorStop(1,'rgba(100,150,255,0)');
cctx.fillStyle = eg; cctx.beginPath(); cctx.arc(-216,k*9,46,0,Math.PI*2); cctx.fill();
}
cctx.fillStyle = '#17263d';
cctx.beginPath();
cctx.moveTo(-212,0); cctx.quadraticCurveTo(-202,-26,-150,-28); cctx.lineTo(130,-24);
cctx.quadraticCurveTo(204,-20,218,0); cctx.quadraticCurveTo(204,20,130,22);
cctx.lineTo(-150,26); cctx.quadraticCurveTo(-202,24,-212,0); cctx.closePath(); cctx.fill();
cctx.fillStyle = '#101c30'; cctx.fillRect(-120,-40,196,13);
cctx.fillRect(-28,-58,4,18); cctx.fillRect(40,-52,3,12);
cctx.strokeStyle = 'rgba(150,215,255,0.8)'; cctx.lineWidth = 1.6;
cctx.beginPath(); cctx.moveTo(-190,-24); cctx.lineTo(-150,-28); cctx.lineTo(130,-24); cctx.lineTo(196,-12); cctx.stroke();
for(let i=0;i<28;i++){
const lit = Math.sin(i*7.3 + 1.1) > -0.2;
if(!lit) continue;
cctx.fillStyle = 'rgba(140,220,255,'+(0.45+0.25*Math.sin(t*1.7+i)).toFixed(2)+')';
cctx.fillRect(-176+i*12, -9, 5, 2); cctx.fillRect(-170+i*12, 7, 5, 2);
}
if(Math.sin(t*3) > 0){ cctx.fillStyle = 'rgba(255,70,60,0.95)'; cctx.beginPath(); cctx.arc(-26,-58,1.8,0,Math.PI*2); cctx.fill(); }
const ex = 52, ey = 22;
const hg = cctx.createRadialGradient(ex,ey,1,ex,ey,26);
hg.addColorStop(0,'rgba(190,120,255,'+(0.55+pulse*0.4).toFixed(2)+')'); hg.addColorStop(1,'rgba(150,80,255,0)');
cctx.fillStyle = hg; cctx.beginPath(); cctx.arc(ex,ey,26,0,Math.PI*2); cctx.fill();
cctx.fillStyle = '#12061f'; cctx.beginPath(); cctx.arc(ex,ey,8,0,Math.PI*2); cctx.fill();
cctx.strokeStyle = 'rgba(200,140,255,0.9)'; cctx.lineWidth = 1.4; cctx.beginPath(); cctx.arc(ex,ey,8,0,Math.PI*2); cctx.stroke();
cctx.restore();
}
function drawShuttle(x, y, ang, sc, t){
cctx.save(); cctx.translate(x, y); cctx.rotate(ang); cctx.scale(sc, sc);
const fl = 0.7 + 0.3*Math.sin(t*38);
const pg = cctx.createLinearGradient(-14,0,-60,0);
pg.addColorStop(0,'rgba(170,225,255,'+(0.9*fl).toFixed(2)+')'); pg.addColorStop(1,'rgba(120,170,255,0)');
cctx.fillStyle = pg; cctx.beginPath(); cctx.moveTo(-14,-3); cctx.lineTo(-60*fl-10,0); cctx.lineTo(-14,3); cctx.closePath(); cctx.fill();
cctx.fillStyle = '#04070d';
cctx.beginPath(); cctx.moveTo(20,0); cctx.lineTo(-6,-9); cctx.lineTo(-15,-6); cctx.lineTo(-15,6); cctx.lineTo(-6,9); cctx.closePath(); cctx.fill();
cctx.strokeStyle = 'rgba(140,210,255,0.55)'; cctx.lineWidth = 0.8; cctx.stroke();
cctx.fillStyle = 'rgba(150,225,255,0.9)'; cctx.fillRect(4,-2,7,3);
cctx.restore();
}

function drawScene0(t){
const g = cctx.createLinearGradient(0,0,0,ch);
g.addColorStop(0,'#010309'); g.addColorStop(1,'#07122a');
cctx.fillStyle = g; cctx.fillRect(0,0,cw,ch);
drawStars(t, 0.9, 3);
drawEarth(t);
const sc = Math.max(0.7, Math.min(cw/820, 1.6));
const cx = cw*0.60 + Math.sin(t*0.25)*6, cy = ch*0.17;
const dockX = cx + 52*sc, dockY = cy + 26*sc;
const prog = ease(t/8.2);
const shx = lerp(cw*0.06, dockX-8*sc, prog), shy = lerp(ch*0.74, dockY+46*sc, prog);
const beamA = clamp01((t-2.5)/3)*0.5;
const bg = cctx.createLinearGradient(dockX,dockY,shx,shy);
bg.addColorStop(0,'rgba(200,140,255,'+beamA.toFixed(2)+')'); bg.addColorStop(1,'rgba(200,140,255,0)');
cctx.fillStyle = bg;
cctx.beginPath(); cctx.moveTo(dockX-6*sc,dockY); cctx.lineTo(dockX+6*sc,dockY); cctx.lineTo(shx+22*sc,shy); cctx.lineTo(shx-22*sc,shy); cctx.closePath(); cctx.fill();
drawCarrier(cx, cy, sc, t);
const ang = Math.atan2(dockY-shy, dockX-shx);
drawShuttle(shx, shy, ang, sc*1.7*(1-prog*0.25), t);
scrim(0.5);
}

function drawReyes(sx, sy, k, t, walking){
cctx.save(); cctx.translate(sx, sy); cctx.scale(k, k);
cctx.shadowColor = 'rgba(140,220,255,0.75)'; cctx.shadowBlur = 8;
const step = walking ? Math.sin(t*3.4)*5 : 0, bob = walking ? Math.abs(Math.sin(t*3.4))*1.5 : 0;
cctx.fillStyle = '#04070b';
cctx.beginPath(); cctx.arc(0,-46-bob,7.5,0,Math.PI*2); cctx.fill();
cctx.fillRect(-8,-40-bob,16,4); cctx.fillRect(-7,-38-bob,14,32);
cctx.save(); cctx.translate(step,0); cctx.fillRect(-6,-8-bob,7,26); cctx.restore();
cctx.save(); cctx.translate(-step,0); cctx.fillRect(0,-8-bob,7,26); cctx.restore();
cctx.save(); cctx.rotate(-0.06); cctx.fillRect(-36,-32-bob,34,4); cctx.restore();
cctx.fillStyle = 'rgba(255,40,40,0.75)'; cctx.beginPath(); cctx.arc(-36,-30-bob,1.5,0,Math.PI*2); cctx.fill();
cctx.restore();
}
function drawScene1(t){
const hy = ch*0.60;
const g = cctx.createLinearGradient(0,0,0,ch);
g.addColorStop(0,'#0a1626'); g.addColorStop(1,'#16283f');
cctx.fillStyle = g; cctx.fillRect(0,0,cw,ch);
cctx.strokeStyle = 'rgba(120,190,255,0.14)'; cctx.lineWidth = 1;
for(let x=0;x<cw;x+=70){ cctx.beginPath(); cctx.moveTo(x,0); cctx.lineTo(x,hy); cctx.stroke(); }
const wx = cw*0.34, wy = ch*0.10, ww = cw*0.32, wh = ch*0.30;
cctx.fillStyle = '#01030a'; cctx.fillRect(wx,wy,ww,wh);
cctx.save(); cctx.beginPath(); cctx.rect(wx,wy,ww,wh); cctx.clip();
for(let i=0;i<STARS.length;i+=2){ const st=STARS[i]; cctx.fillStyle='rgba(215,232,255,'+(0.5*st.z).toFixed(2)+')'; cctx.fillRect(wx+st.x*ww, wy+st.y*wh, st.r, st.r); }
const eg = cctx.createRadialGradient(wx+ww*0.3, wy+wh*1.9, 10, wx+ww*0.3, wy+wh*1.9, wh*1.15);
eg.addColorStop(0,'#0d3a6e'); eg.addColorStop(0.9,'#06182f'); eg.addColorStop(1,'rgba(110,185,255,0.8)');
cctx.fillStyle = eg; cctx.beginPath(); cctx.arc(wx+ww*0.3, wy+wh*1.9, wh*1.15, 0, Math.PI*2); cctx.fill();
cctx.restore();
cctx.strokeStyle = 'rgba(140,210,255,0.4)'; cctx.lineWidth = 2; cctx.strokeRect(wx,wy,ww,wh);
const fg = cctx.createLinearGradient(0,hy,0,ch);
fg.addColorStop(0,'#1a2f48'); fg.addColorStop(1,'#0a1626');
cctx.fillStyle = fg; cctx.fillRect(0,hy,cw,ch-hy);
cctx.strokeStyle = 'rgba(120,200,255,0.24)'; cctx.lineWidth = 1;
cctx.beginPath();
for(let k=-14;k<=14;k++){ cctx.moveTo(cw/2+k*cw*0.025, hy); cctx.lineTo(cw/2+k*cw*0.12, ch); }
for(let j=1;j<=10;j++){ const y = hy+(ch-hy)*Math.pow(j/10,2); cctx.moveTo(0,y); cctx.lineTo(cw,y); }
cctx.stroke();
const k = Math.max(0.7, Math.min(1.2, ch/620))*0.85;
const gy = hy + (ch-hy)*0.62;
const shx = cw*0.84;
cctx.fillStyle = 'rgba(160,225,255,'+(0.10+0.04*Math.sin(t*5)).toFixed(3)+')';
cctx.beginPath(); cctx.moveTo(shx-70*k,gy-34*k); cctx.lineTo(shx-250*k,gy+30*k); cctx.lineTo(shx-20*k,gy+30*k); cctx.closePath(); cctx.fill();
cctx.fillStyle = '#0b1424';
cctx.beginPath(); cctx.moveTo(shx-60*k,gy-90*k); cctx.lineTo(shx+170*k,gy-70*k); cctx.lineTo(shx+170*k,gy+14*k); cctx.lineTo(shx-80*k,gy+14*k); cctx.lineTo(shx-100*k,gy-30*k); cctx.closePath(); cctx.fill();
cctx.strokeStyle = 'rgba(140,210,255,0.4)'; cctx.lineWidth = 1; cctx.stroke();
const px = t<0.6 ? shx-80*k : t<3.4 ? lerp(shx-80*k, cw*0.43, ease((t-0.6)/2.8)) : t<5.9 ? cw*0.43 : lerp(cw*0.43, cw*0.26, ease((t-5.9)/2.4));
const walking = (t>0.6 && t<3.4) || t>5.9;
drawReyes(px, gy, k, t, walking);
[[0.43,1],[0.22,0.8],[0.60,0.7]].forEach(c=>{
const cx2 = cw*c[0], cs = c[1]*k, w = 74*cs, h = 56*cs;
cctx.fillStyle = '#16263c'; cctx.fillRect(cx2-w/2, gy+14*k-h, w, h);
cctx.strokeStyle = 'rgba(140,210,255,0.45)'; cctx.lineWidth = 1.2; cctx.strokeRect(cx2-w/2, gy+14*k-h, w, h);
cctx.fillStyle = 'rgba(255,180,60,0.7)'; cctx.fillRect(cx2-w/2+4*cs, gy+14*k-h+5*cs, 12*cs, 3*cs);
});
const sx = cw*(1.02 - clamp01((t-2.5)/4)*1.1);
if(t>2.3 && sx>-60){
const sg = cctx.createLinearGradient(sx-46,0,sx+46,0);
sg.addColorStop(0,'rgba(120,220,255,0)'); sg.addColorStop(0.5,'rgba(120,220,255,0.22)'); sg.addColorStop(1,'rgba(120,220,255,0)');
cctx.fillStyle = sg; cctx.fillRect(sx-46,0,92,ch);
cctx.fillStyle = 'rgba(190,240,255,0.7)'; cctx.fillRect(sx-1,0,2,ch);
}
[[0.14,0.06],[0.88,0.06]].forEach((l,i)=>{
cctx.save(); cctx.translate(cw*l[0], ch*l[1]); cctx.rotate(t*2.3 + i*1.6);
const bgm = cctx.createLinearGradient(0,0,cw*0.38,0);
bgm.addColorStop(0,'rgba(255,60,50,0.30)'); bgm.addColorStop(1,'rgba(255,60,50,0)');
cctx.fillStyle = bgm; cctx.beginPath(); cctx.moveTo(0,0); cctx.lineTo(cw*0.38,-34); cctx.lineTo(cw*0.38,34); cctx.closePath(); cctx.fill();
cctx.restore();
cctx.fillStyle = 'rgba(255,90,70,'+(0.5+0.5*Math.sin(t*6+i)).toFixed(2)+')';
cctx.beginPath(); cctx.arc(cw*l[0], ch*l[1], 4, 0, Math.PI*2); cctx.fill();
});
scrim(0.35);
cctx.save();
cctx.font = '10px "Share Tech Mono", monospace';
cctx.fillStyle = 'rgba(160,225,255,0.9)'; cctx.fillText('DOCK 04 // UNSCHEDULED ARRIVAL', 18, 26);
if(Math.floor(t*2)%2===0){ cctx.fillStyle = 'rgba(255,80,70,0.95)'; cctx.fillText('! BIOSIGNATURE: UNVERIFIED', 18, 42); }
if(t>5.9){ cctx.fillStyle = 'rgba(160,225,255,0.75)'; cctx.fillText('SCAN COMPLETE — NO ANOMALY LOGGED', 18, 58); }
cctx.restore();
}

let motes = [];
function drawScene2(t){
const vx = cw*0.62, vy = ch*0.47;
cctx.fillStyle = '#02050b'; cctx.fillRect(0,0,cw,ch);
const bgG = cctx.createRadialGradient(vx,vy,4,vx,vy,Math.max(cw,ch)*0.8);
bgG.addColorStop(0,'#2a5a86'); bgG.addColorStop(0.35,'#142a45'); bgG.addColorStop(1,'#050b16');
cctx.fillStyle = bgG; cctx.fillRect(0,0,cw,ch);
const open = ease((t-1.2)/3.6);
const dw = Math.max(2, 70*open*Math.min(cw/900,1.3)), dh = 96*Math.min(cw/900,1.3);
if(open>0){
const dg = cctx.createRadialGradient(vx,vy,2,vx,vy,dh*1.4);
dg.addColorStop(0,'rgba(255,225,170,'+(0.55*open).toFixed(2)+')'); dg.addColorStop(1,'rgba(255,150,60,0)');
cctx.fillStyle = dg; cctx.beginPath(); cctx.arc(vx,vy,dh*1.4,0,Math.PI*2); cctx.fill();
cctx.fillStyle = 'rgba(255,214,150,'+(0.9*open).toFixed(2)+')'; cctx.fillRect(vx-dw/2, vy-dh/2, dw, dh);
cctx.fillStyle = 'rgba(30,22,16,'+(0.85*open).toFixed(2)+')';
cctx.fillRect(vx-dw*0.36, vy+dh*0.16, dw*0.30, dh*0.34);
cctx.fillRect(vx-dw*0.30, vy+dh*0.06, dw*0.14, dh*0.12);
cctx.beginPath(); cctx.moveTo(vx+dw*0.04, vy+dh*0.5); cctx.lineTo(vx+dw*0.20, vy+dh*0.30); cctx.lineTo(vx+dw*0.38, vy+dh*0.5); cctx.closePath(); cctx.fill();
}
const N = 9;
const ribs = [];
for(let i=0;i<N;i++) ribs.push(((i/N) + t*0.09) % 1);
ribs.sort((a,b)=>a-b);
ribs.forEach(pr=>{
const e = pr*pr;
const hw = 14 + e*cw*0.85, hh = 9 + e*ch*0.8;
const a = 0.12 + pr*0.5;
cctx.strokeStyle = 'rgba(110,190,255,'+a.toFixed(2)+')'; cctx.lineWidth = 1 + pr*2.4;
cctx.strokeRect(vx-hw, vy-hh, hw*2, hh*2);
cctx.fillStyle = 'rgba(180,235,255,'+(a*0.9).toFixed(2)+')';
cctx.fillRect(vx-hw*0.4, vy-hh+1, hw*0.8, 2+pr*3);
const warn = Math.sin(t*3 + pr*9) > 0.7;
if(warn){ cctx.fillStyle = 'rgba(255,70,60,'+(a*0.9).toFixed(2)+')'; cctx.fillRect(vx+hw-5-pr*8, vy-hh+3, 4+pr*6, 4+pr*6); }
});
cctx.strokeStyle = 'rgba(110,190,255,0.28)'; cctx.lineWidth = 1;
cctx.beginPath();
[[0,0],[cw,0],[0,ch],[cw,ch],[0,ch*0.5],[cw,ch*0.5]].forEach(c=>{ cctx.moveTo(c[0],c[1]); cctx.lineTo(vx+(c[0]<vx?-1:1)*dw/2*0.3, vy); });
cctx.stroke();
for(let i=0;i<DUST.length;i++){
const d = DUST[i];
const x = wrap(d.x*cw + Math.sin(t*0.6+d.ph)*20 - t*8*d.z, cw);
const y = wrap(d.y*ch - t*10*d.z, ch);
cctx.fillStyle = 'rgba(170,225,255,'+(0.15+d.z*0.35).toFixed(2)+')';
cctx.fillRect(x, y, 1+d.z*1.6, 1+d.z*1.6);
}
const k = Math.max(0.8, Math.min(1.3, ch/620));
const rx = lerp(cw*0.20, cw*0.30, ease(t/9)), ry = ch*0.90;
cctx.save(); cctx.shadowColor='rgba(120,200,255,0.0)';
drawReyes(rx, ry, k, t, true);
cctx.restore();
const flick = Math.sin(t*11) > 0.92 ? 0.12 : 0;
if(flick){ cctx.fillStyle = 'rgba(255,255,255,'+flick+')'; cctx.fillRect(0,0,cw,ch); }
scrim(0.5);
}

_startCrawl({
crawl: crawl, panels: panels, advanceHint: advanceHint, beginHint: beginHint,
durations: [7000, 8600], pulse: 'crawlBtnPulseSpace', resize: resizeCanvas, canvas: canvas,
draw: (i, t, dt)=>{
cctx.clearRect(0,0,cw,ch);
if(i===0) drawScene0(t);
else if(i===1) drawScene1(t);
else drawScene2(t, dt);
},

onDone: onDone
});
}

function showOrbitalCrawl(onDone){
const crawl = document.getElementById('story-crawl-orbital');
const canvas = document.createElement('canvas');
canvas.id = 'cutscene-canvas-orbital';
crawl.insertBefore(canvas, crawl.firstChild);
const cctx = canvas.getContext('2d');
const advanceHint = document.getElementById('cutscene-advance-hint-orbital');
const beginHint = document.getElementById('cutscene-begin-hint-orbital');
const panels = Array.from(crawl.querySelectorAll('.cutscene-panel'));
crawl.classList.add('active');
$buildings.crawlActive = true;

let cw=0, ch=0;
function resizeCanvas(){
cw = canvas.width = window.innerWidth;
ch = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);


const STARS = Array.from({length:110}, ()=>({x:rand(0,1), y:rand(0,1), r:rand(0.3,1.5), ph:rand(0,10), z:rand(0.2,1)}));
const CITY = Array.from({length:34}, ()=>({u:rand(-0.7,0.7), v:rand(0.02,0.2), ph:rand(0,10)}));
const DUST = Array.from({length: window.innerWidth<700 ? 28 : 50}, ()=>({x:Math.random(), y:Math.random(), z:Math.random(), ph:rand(0,6.28)}));

function drawStars(t, a, drift){
for(let i=0;i<STARS.length;i++){
const s = STARS[i];
const x = wrap(s.x*cw - t*drift*s.z, cw);
const tw = clamp01(0.55 + 0.45*Math.sin(t*1.4 + s.ph));
cctx.fillStyle = 'rgba(210,230,255,'+(tw*a*(0.4+s.z*0.6)).toFixed(2)+')';
cctx.beginPath(); cctx.arc(x, s.y*ch, s.r, 0, Math.PI*2); cctx.fill();
}
}
function scrim(a){
const g = cctx.createRadialGradient(cw/2,ch/2,Math.min(cw,ch)*0.1, cw/2,ch/2,Math.max(cw,ch)*0.65);
g.addColorStop(0,'rgba(2,4,12,'+a+')'); g.addColorStop(1,'rgba(2,4,12,0)');
cctx.fillStyle = g; cctx.fillRect(0,0,cw,ch);
}
function drawEarth(t){
const r = cw*0.95, ex = cw*0.38, ey = ch + r*0.80;
const g = cctx.createRadialGradient(ex, ey-r*0.9, r*0.05, ex, ey, r);
g.addColorStop(0,'#0d3a6e'); g.addColorStop(0.7,'#06182f'); g.addColorStop(1,'#020812');
cctx.fillStyle = g; cctx.beginPath(); cctx.arc(ex, ey, r, 0, Math.PI*2); cctx.fill();
cctx.save();
cctx.shadowColor = 'rgba(90,170,255,0.9)'; cctx.shadowBlur = 22;
cctx.strokeStyle = 'rgba(110,185,255,0.65)'; cctx.lineWidth = 2.5;
cctx.beginPath(); cctx.arc(ex, ey, r, Math.PI*1.16, Math.PI*1.84); cctx.stroke();
cctx.restore();
for(let i=0;i<CITY.length;i++){
const c = CITY[i];
const x = ex + c.u*r*0.9;
const yTop = ey - Math.sqrt(Math.max(0, r*r - (x-ex)*(x-ex)));
const y = yTop + c.v*r*0.22;
cctx.fillStyle = 'rgba(255,200,120,'+(clamp01(0.25+0.5*Math.sin(t*0.9+c.ph))).toFixed(2)+')';
cctx.fillRect(x, y, 1.6, 1.6);
}
}
function drawReyes(sx, sy, k, t, walking){
cctx.save(); cctx.translate(sx, sy); cctx.scale(k, k);
cctx.shadowColor = 'rgba(140,220,255,0.75)'; cctx.shadowBlur = 8;
const step = walking ? Math.sin(t*3.4)*5 : 0, bob = walking ? Math.abs(Math.sin(t*3.4))*1.5 : 0;
cctx.fillStyle = '#04070b';
cctx.beginPath(); cctx.arc(0,-46-bob,7.5,0,Math.PI*2); cctx.fill();
cctx.fillRect(-8,-40-bob,16,4); cctx.fillRect(-7,-38-bob,14,32);
cctx.save(); cctx.translate(step,0); cctx.fillRect(-6,-8-bob,7,26); cctx.restore();
cctx.save(); cctx.translate(-step,0); cctx.fillRect(0,-8-bob,7,26); cctx.restore();
cctx.save(); cctx.rotate(-0.06); cctx.fillRect(-36,-32-bob,34,4); cctx.restore();
cctx.fillStyle = 'rgba(255,40,40,0.75)'; cctx.beginPath(); cctx.arc(-36,-30-bob,1.5,0,Math.PI*2); cctx.fill();
cctx.restore();
}

function drawSpire(x, y, sc, t){
cctx.save(); cctx.translate(x, y); cctx.scale(sc, sc);
cctx.fillStyle = '#1d3150'; cctx.fillRect(-4,-150,8,112);
cctx.fillStyle = '#16263d'; cctx.fillRect(-26,-40,52,40);
[[-118,40],[-84,27],[-56,18]].forEach(d=>{
cctx.fillStyle = '#233c60';
cctx.beginPath(); cctx.ellipse(0,d[0],d[1],d[1]*0.3,0,0,Math.PI); cctx.fill();
cctx.strokeStyle = 'rgba(150,220,255,0.75)'; cctx.lineWidth = 1.3;
cctx.beginPath(); cctx.ellipse(0,d[0],d[1],d[1]*0.3,0,0,Math.PI*2); cctx.stroke();
});
const pulse = 0.5+0.5*Math.sin(t*2.6);
const g = cctx.createRadialGradient(0,-152,1,0,-152,26);
g.addColorStop(0,'rgba(190,130,255,'+(0.5+pulse*0.5).toFixed(2)+')'); g.addColorStop(1,'rgba(150,90,255,0)');
cctx.fillStyle = g; cctx.beginPath(); cctx.arc(0,-152,26,0,Math.PI*2); cctx.fill();
if(Math.sin(t*3.2)>0){ cctx.fillStyle='rgba(255,70,60,0.95)'; cctx.beginPath(); cctx.arc(0,-153,2.2,0,Math.PI*2); cctx.fill(); }
cctx.restore();
}

const SATS = [[0.40,0.10],[0.55,0.06],[0.30,0.26],[0.90,0.10],[0.96,0.34]];
function drawScene0(t){
const g = cctx.createLinearGradient(0,0,0,ch);
g.addColorStop(0,'#010309'); g.addColorStop(1,'#07122a');
cctx.fillStyle = g; cctx.fillRect(0,0,cw,ch);
drawStars(t, 0.9, 2.5);
drawEarth(t);
const sc = Math.max(0.6, Math.min(cw/1000, 1.2));
const cx = cw*0.76, cy = ch*0.36, R = 230*sc, ry = R*0.26, rw = 15*sc;
const spin = t*0.18;
const tipX = cx, tipY = cy-152*sc;
SATS.forEach((st,i)=>{
const sx = cw*st[0], sy = ch*st[1]+20;
cctx.strokeStyle = 'rgba(190,140,255,0.28)'; cctx.lineWidth = 1;
cctx.beginPath(); cctx.moveTo(tipX,tipY); cctx.lineTo(sx,sy); cctx.stroke();
const pp = (t*0.45 + i*0.27)%1;
cctx.fillStyle = 'rgba(225,200,255,0.95)';
cctx.beginPath(); cctx.arc(lerp(tipX,sx,pp), lerp(tipY,sy,pp), 2.2, 0, Math.PI*2); cctx.fill();
cctx.fillStyle = '#9fd8ff'; cctx.fillRect(sx-2,sy-2,4,4);
});
cctx.strokeStyle = '#101c32'; cctx.lineWidth = rw;
cctx.beginPath(); cctx.ellipse(cx,cy,R,ry,0,Math.PI,Math.PI*2); cctx.stroke();
cctx.strokeStyle = '#0e1a2e'; cctx.lineWidth = 5*sc;
for(let k=0;k<4;k++){ const a = spin + k*Math.PI/2; cctx.beginPath(); cctx.moveTo(cx,cy); cctx.lineTo(cx+R*Math.cos(a), cy+ry*Math.sin(a)); cctx.stroke(); }
drawSpire(cx, cy, sc, t);
cctx.strokeStyle = '#1f3556'; cctx.lineWidth = rw;
cctx.beginPath(); cctx.ellipse(cx,cy,R,ry,0,0,Math.PI); cctx.stroke();
cctx.strokeStyle = 'rgba(150,220,255,0.7)'; cctx.lineWidth = 1.4;
cctx.beginPath(); cctx.ellipse(cx,cy,R+rw/2,ry+rw/2,0,0,Math.PI); cctx.stroke();
for(let i=0;i<44;i++){
const a = spin + i*(Math.PI*2/44);
const front = Math.sin(a) > 0;
const lit = Math.sin(i*5.7+1.3) > -0.25;
if(!lit) continue;
cctx.fillStyle = 'rgba(150,225,255,'+((front?0.85:0.3)*(0.7+0.3*Math.sin(t*2+i))).toFixed(2)+')';
cctx.fillRect(cx+R*Math.cos(a)-2*sc, cy+ry*Math.sin(a)-1*sc, 4*sc, 2*sc);
}
for(let i=0;i<8;i++){
const a = Math.PI*0.08 + i*(Math.PI*0.84/7) + spin*0.0;
cctx.fillStyle = 'rgba(255,60,50,'+(0.35+0.6*(Math.sin(t*3+i*1.4)>0?1:0.2)).toFixed(2)+')';
cctx.beginPath(); cctx.arc(cx+(R+4*sc)*Math.cos(a), cy+(ry+4*sc)*Math.sin(a), 2.4*sc, 0, Math.PI*2); cctx.fill();
}
const prog = ease(t/8);
const px = lerp(cw*0.05, cx-R*0.55, prog), py = lerp(ch*0.80, cy+ry*0.85, prog);
const ang = Math.atan2(cy+ry*0.85-py, cx-R*0.55-px);
cctx.save(); cctx.translate(px,py); cctx.rotate(ang); cctx.scale(sc*1.5,sc*1.5);
const fl = 0.7+0.3*Math.sin(t*38);
const pg = cctx.createLinearGradient(-10,0,-46,0);
pg.addColorStop(0,'rgba(170,225,255,'+(0.9*fl).toFixed(2)+')'); pg.addColorStop(1,'rgba(120,170,255,0)');
cctx.fillStyle = pg; cctx.beginPath(); cctx.moveTo(-10,-3); cctx.lineTo(-46*fl-6,0); cctx.lineTo(-10,3); cctx.closePath(); cctx.fill();
cctx.fillStyle = '#0a1424'; cctx.beginPath(); cctx.moveTo(14,0); cctx.lineTo(-4,-7); cctx.lineTo(-10,-5); cctx.lineTo(-10,5); cctx.lineTo(-4,7); cctx.closePath(); cctx.fill();
cctx.strokeStyle = 'rgba(150,220,255,0.7)'; cctx.lineWidth = 0.9; cctx.stroke();
cctx.restore();
scrim(0.5);
}

function drawScene1(t){
const hy = ch*0.64;
const g = cctx.createLinearGradient(0,0,0,ch);
g.addColorStop(0,'#0a1424'); g.addColorStop(1,'#1c2e46');
cctx.fillStyle = g; cctx.fillRect(0,0,cw,ch);
cctx.fillStyle = 'rgba(120,190,255,0.12)';
for(let x=40;x<cw;x+=90) cctx.fillRect(x,ch*0.16,2,hy-ch*0.16);
const fg = cctx.createLinearGradient(0,hy,0,ch);
fg.addColorStop(0,'#1b3050'); fg.addColorStop(1,'#0a1626');
cctx.fillStyle = fg; cctx.fillRect(0,hy,cw,ch-hy);
cctx.strokeStyle = 'rgba(120,200,255,0.22)'; cctx.lineWidth = 1;
cctx.beginPath();
for(let k=-14;k<=14;k++){ cctx.moveTo(cw/2+k*cw*0.025, hy); cctx.lineTo(cw/2+k*cw*0.12, ch); }
for(let j=1;j<=9;j++){ const y = hy+(ch-hy)*Math.pow(j/9,2); cctx.moveTo(0,y); cctx.lineTo(cw,y); }
cctx.stroke();
const k = Math.max(0.75, Math.min(1.2, ch/620))*0.9;
const rx = cw*0.5, ryy = hy+(ch-hy)*0.62;
const sc = Math.max(0.7, Math.min(cw/900,1.3));
const N = 7;
for(let i=0;i<N;i++){
const tx = cw*(0.08+i*0.14), ty = ch*0.11;
const lockT = 0.6 + i*0.38;
const locked = t > lockT;
const aim = Math.atan2(ryy-44*k-ty, rx-tx);
const ang = locked ? aim : aim + Math.sin(t*2.2+i*1.7)*0.55;
cctx.fillStyle = '#12213a'; cctx.fillRect(tx-13*sc, ty-8*sc, 26*sc, 12*sc);
cctx.strokeStyle = 'rgba(140,210,255,0.5)'; cctx.lineWidth = 1; cctx.strokeRect(tx-13*sc, ty-8*sc, 26*sc, 12*sc);
cctx.save(); cctx.translate(tx,ty); cctx.rotate(ang);
cctx.fillStyle = '#2a4163'; cctx.fillRect(0,-2*sc,32*sc,4*sc);
cctx.restore();
if(locked){
const flick = 0.5+0.5*Math.sin(t*14+i*2);
cctx.strokeStyle = 'rgba(255,60,50,'+(0.30+0.35*flick).toFixed(2)+')'; cctx.lineWidth = 1.2;
cctx.beginPath(); cctx.moveTo(tx+Math.cos(ang)*32*sc, ty+Math.sin(ang)*32*sc); cctx.lineTo(rx, ryy-44*k); cctx.stroke();
cctx.fillStyle = 'rgba(255,60,50,'+(0.5+0.5*flick).toFixed(2)+')';
cctx.beginPath(); cctx.arc(tx+Math.cos(ang)*34*sc, ty+Math.sin(ang)*34*sc, 2.6*sc, 0, Math.PI*2); cctx.fill();
}
}
for(let i=0;i<3;i++){
const dx = cw*(0.2+0.3*i) + Math.sin(t*0.8+i*2)*cw*0.08, dy = ch*(0.32+0.04*Math.sin(t*1.3+i));
const cg = cctx.createLinearGradient(dx,dy,dx,hy+40);
cg.addColorStop(0,'rgba(255,90,70,0.20)'); cg.addColorStop(1,'rgba(255,90,70,0)');
cctx.fillStyle = cg; cctx.beginPath(); cctx.moveTo(dx-4,dy+8); cctx.lineTo(dx+4,dy+8); cctx.lineTo(dx+46*sc,hy+40); cctx.lineTo(dx-46*sc,hy+40); cctx.closePath(); cctx.fill();
cctx.fillStyle = '#0a1424'; cctx.beginPath(); cctx.arc(dx,dy,11*sc,0,Math.PI*2); cctx.fill();
cctx.strokeStyle = 'rgba(150,220,255,0.6)'; cctx.lineWidth = 1; cctx.stroke();
cctx.fillStyle = 'rgba(255,70,60,0.95)'; cctx.beginPath(); cctx.arc(dx,dy+1,3.2*sc,0,Math.PI*2); cctx.fill();
}
cctx.save(); cctx.shadowColor = 'rgba(255,120,100,0.6)'; cctx.shadowBlur = 8;
drawReyes(rx, ryy, k, t, false);
cctx.restore();
const wL = cw*0.17*ease((t-3)/1.6);
if(wL>0){
[[0,wL,1],[cw-wL,wL,-1]].forEach(sh=>{
cctx.fillStyle = '#1a2538'; cctx.fillRect(sh[0],0,sh[1],ch);
const ex2 = sh[2]>0 ? sh[0]+sh[1]-10 : sh[0];
for(let y=0;y<ch;y+=26){ cctx.fillStyle = (Math.floor(y/26)%2)?'#e8b800':'#0a0a00'; cctx.fillRect(ex2,y,10,26); }
});
}
scrim(0.35);
cctx.save();
cctx.font = '12px "Share Tech Mono", monospace';
cctx.fillStyle = 'rgba(200,240,255,1)'; cctx.fillText('STATION SECURITY // AUTONOMOUS', 18, 26);
cctx.fillStyle = 'rgba(200,240,255,0.9)'; cctx.fillText('TURRETS ONLINE: '+Math.min(N, Math.floor((t-0.2)/0.38)+1 > 0 ? Math.min(N, Math.floor((t-0.2)/0.38)+1) : 0)+'/'+N, 18, 44);
if(t>2.5 && Math.floor(t*2.5)%2===0){ cctx.fillStyle = 'rgba(255,110,95,1)'; cctx.fillText('! TARGET ACQUIRED', 18, 62); }
cctx.restore();
}

const NODEU = [-0.62,-0.45,-0.28,-0.1,0.08,0.24,0.42,0.58,0.72];
const NODEV = [0.10,0.05,0.14,0.07,0.16,0.04,0.12,0.18,0.08];
function drawScene2(t){
const g = cctx.createLinearGradient(0,0,0,ch);
g.addColorStop(0,'#010309'); g.addColorStop(1,'#07122a');
cctx.fillStyle = g; cctx.fillRect(0,0,cw,ch);
drawStars(t, 0.9, 2);
drawEarth(t);
const r = cw*0.95, ex = cw*0.38, ey = ch + r*0.80;
const sc = Math.max(0.7, Math.min(cw/900, 1.3))*1.15;
const hx = cw*0.68, hy2 = ch*0.60;
for(let i=0;i<4;i++){
const pp = ((t*0.35)+i/4)%1;
cctx.strokeStyle = 'rgba(190,140,255,'+((1-pp)*0.45).toFixed(2)+')'; cctx.lineWidth = 1.5;
cctx.beginPath(); cctx.arc(hx, hy2-120*sc, pp*cw*0.22, 0, Math.PI*2); cctx.stroke();
}
for(let i=0;i<NODEU.length;i++){
const nx = ex + NODEU[i]*r*0.85;
const yTop = ey - Math.sqrt(Math.max(0, r*r-(nx-ex)*(nx-ex)));
const ny = yTop + NODEV[i]*r*0.16;
const dieAt = 4.5 + i*0.45;
let a = 0.55;
if(t > dieAt) a = t < dieAt+0.5 ? 0.55*(Math.sin(t*40)>0?1:0.1) : 0;
if(a>0){
cctx.strokeStyle = 'rgba(190,140,255,'+(a*0.55).toFixed(2)+')'; cctx.lineWidth = 1;
cctx.beginPath(); cctx.moveTo(hx,hy2-30*sc); cctx.lineTo(nx,ny); cctx.stroke();
const pp = (t*0.5+i*0.17)%1;
cctx.fillStyle = 'rgba(230,205,255,'+a.toFixed(2)+')';
cctx.beginPath(); cctx.arc(lerp(hx,nx,pp), lerp(hy2-30*sc,ny,pp), 2, 0, Math.PI*2); cctx.fill();
}
cctx.fillStyle = a>0 ? 'rgba(220,180,255,0.95)' : 'rgba(90,70,110,0.5)';
cctx.fillRect(nx-2,ny-2,4,4);
}
drawSpire(hx, hy2, sc, t);
cctx.fillStyle = '#05080f'; cctx.fillRect(0,ch*0.86,cw,ch*0.14);
cctx.fillStyle = 'rgba(140,210,255,0.55)'; cctx.fillRect(0,ch*0.86,cw,2);
cctx.fillStyle = '#05080f'; cctx.fillRect(cw*0.10,0,10,ch*0.86); cctx.fillRect(cw*0.90,0,10,ch*0.86);
const k = Math.max(0.8, Math.min(1.3, ch/620));
cctx.save(); cctx.shadowColor = 'rgba(140,215,255,0.8)'; cctx.shadowBlur = 9;
drawReyes(cw*0.26, ch*0.97, k, t, false);
cctx.restore();
scrim(0.5);
}

_startCrawl({
crawl: crawl, panels: panels, advanceHint: advanceHint, beginHint: beginHint,
durations: [7000, 8600], pulse: 'crawlBtnPulseOrbital', resize: resizeCanvas, canvas: canvas,
draw: (i, t, dt)=>{
cctx.clearRect(0,0,cw,ch);
if(i===0) drawScene0(t);
else if(i===1) drawScene1(t);
else drawScene2(t, dt);
},

onDone: onDone
});
}

function showMarsCrawl(onDone){
const crawl = document.getElementById('story-crawl-mars');
const canvas = document.createElement('canvas');
canvas.id = 'cutscene-canvas-mars';
crawl.insertBefore(canvas, crawl.firstChild);
const cctx = canvas.getContext('2d');
const advanceHint = document.getElementById('cutscene-advance-hint-mars');
const beginHint = document.getElementById('cutscene-begin-hint-mars');
const panels = Array.from(crawl.querySelectorAll('.cutscene-panel'));
crawl.classList.add('active');
$buildings.crawlActive = true;

let cw=0, ch=0;
function resizeCanvas(){
cw = canvas.width = window.innerWidth;
ch = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function drawReyes(sx, sy, k, t){
cctx.save(); cctx.translate(sx, sy); cctx.scale(k, k);
const step = Math.sin(t*3.2)*5, bob = Math.abs(Math.sin(t*3.2))*1.6;
cctx.fillStyle = '#05080c';
cctx.beginPath(); cctx.arc(0,-46-bob,7.5,0,Math.PI*2); cctx.fill();
cctx.fillRect(-8,-40-bob,16,4);
cctx.fillRect(-7,-38-bob,14,32);
cctx.save(); cctx.translate(step,0); cctx.fillRect(-6,-8-bob,7,26); cctx.restore();
cctx.save(); cctx.translate(-step,0); cctx.fillRect(0,-8-bob,7,26); cctx.restore();
cctx.save(); cctx.rotate(-0.06); cctx.fillRect(4,-32-bob,34,4); cctx.restore();
cctx.fillStyle = '#7a2218';
cctx.beginPath();
cctx.moveTo(-5,-38-bob);
cctx.quadraticCurveTo(-18,-36+Math.sin(t*6)*3-bob, -32-Math.sin(t*4)*3, -32+Math.sin(t*5)*4-bob);
cctx.lineTo(-30-Math.sin(t*4)*3, -26+Math.sin(t*5)*4-bob);
cctx.quadraticCurveTo(-16,-30-bob,-4,-33-bob);
cctx.closePath(); cctx.fill();
cctx.strokeStyle = 'rgba(160,225,250,0.28)'; cctx.lineWidth = 1;
cctx.beginPath(); cctx.moveTo(7,-38-bob); cctx.lineTo(7,-8-bob); cctx.moveTo(4,-52-bob); cctx.lineTo(8,-46-bob); cctx.stroke();
cctx.restore();
}

const STARS = Array.from({length:70}, ()=>({x:rand(0,1), y:rand(0,0.4), r:rand(0.3,1.2), ph:rand(0,10)}));
const DUSTP = Array.from({length: window.innerWidth<700 ? 60 : 110}, ()=>({x:Math.random(), y:Math.random(), z:Math.random()}));

function ridgeY(x, baseY, amp, seed, freq){
return baseY - amp*(0.55*Math.sin(x*freq+seed) + 0.3*Math.sin(x*freq*2.3+seed*1.7) + 0.15*Math.sin(x*freq*5.1+seed*0.6));
}
function drawRidge(baseY, amp, seed, freq, color, offX, rim){
cctx.fillStyle = color;
cctx.beginPath(); cctx.moveTo(0, ch);
for(let x=0; x<=cw+10; x+=10) cctx.lineTo(x, ridgeY(x+offX, baseY, amp, seed, freq));
cctx.lineTo(cw+10, ch); cctx.closePath(); cctx.fill();
if(rim){
cctx.strokeStyle = rim; cctx.lineWidth = 1.2; cctx.beginPath();
for(let x=0; x<=cw+10; x+=10){ const y = ridgeY(x+offX, baseY, amp, seed, freq); if(x===0) cctx.moveTo(x,y); else cctx.lineTo(x,y); }
cctx.stroke();
}
}
function scrim(a){
const g = cctx.createRadialGradient(cw/2,ch/2,Math.min(cw,ch)*0.1, cw/2,ch/2,Math.max(cw,ch)*0.65);
g.addColorStop(0,'rgba(18,6,4,'+a+')'); g.addColorStop(1,'rgba(18,6,4,0)');
cctx.fillStyle = g; cctx.fillRect(0,0,cw,ch);
}
function drawSky(t, stops, hy){
const g = cctx.createLinearGradient(0,0,0,hy);
stops.forEach(st=> g.addColorStop(st[0], st[1]));
cctx.fillStyle = g; cctx.fillRect(0,0,cw,ch);
for(let i=0;i<STARS.length;i++){
const st = STARS[i];
cctx.fillStyle = 'rgba(255,225,200,'+(0.35*clamp01(0.5+0.5*Math.sin(t*1.2+st.ph))).toFixed(2)+')';
cctx.beginPath(); cctx.arc(st.x*cw, st.y*ch, st.r, 0, Math.PI*2); cctx.fill();
}
}
function drawMoon(x, y, r){
cctx.fillStyle = '#9a7a68'; cctx.beginPath(); cctx.ellipse(x,y,r*1.15,r,0.4,0,Math.PI*2); cctx.fill();
cctx.fillStyle = 'rgba(30,10,8,0.55)'; cctx.beginPath(); cctx.ellipse(x+r*0.35,y+r*0.1,r*0.85,r*0.95,0.4,0,Math.PI*2); cctx.fill();
}
function drawDust(t, amt, wind, bandY){
for(let b=0;b<4;b++){
const y = ch*(bandY + b*0.10);
for(let i=0;i<7;i++){
const x = wrap(i*cw/6 - t*(30+b*22)*(wind/100) + b*90, cw*1.3) - cw*0.15;
const rw = cw*(0.20+0.05*Math.sin(t*0.6+i+b)), rh = ch*(0.05+0.02*b);
const g = cctx.createRadialGradient(x,y,2,x,y,rw);
g.addColorStop(0,'rgba(205,110,60,'+(0.20*amt).toFixed(3)+')'); g.addColorStop(1,'rgba(205,110,60,0)');
cctx.fillStyle = g; cctx.beginPath(); cctx.ellipse(x,y,rw,rh+rw*0.18,0,0,Math.PI*2); cctx.fill();
}
}
for(let i=0;i<DUSTP.length;i++){
const d = DUSTP[i];
const sp = 0.4+d.z;
const x = wrap(d.x*cw - t*wind*sp, cw);
const y = wrap(d.y*ch + Math.sin(t*0.9+i)*6, ch);
cctx.fillStyle = 'rgba(255,196,150,'+((0.12+d.z*0.4)*amt).toFixed(3)+')';
cctx.fillRect(x, y, 3+d.z*wind*0.04, 1+d.z*1.3);
}
}
function drawBunker(x, gy, sc, t, i){
cctx.save(); cctx.translate(x, gy); cctx.scale(sc, sc);
cctx.fillStyle = '#1a0a07';
cctx.beginPath(); cctx.moveTo(-60,0); cctx.lineTo(-52,-26); cctx.lineTo(52,-26); cctx.lineTo(60,0); cctx.closePath(); cctx.fill();
cctx.fillRect(-22,-44,44,18);
cctx.fillStyle = 'rgba(255,200,150,0.22)'; cctx.fillRect(-52,-27,104,2);
cctx.fillStyle = 'rgba(255,60,40,'+(0.6+0.4*Math.sin(t*2.4+i)).toFixed(2)+')'; cctx.fillRect(-14,-38,28,4);
cctx.fillRect(-40,-16,16,3); cctx.fillRect(24,-16,16,3);
cctx.strokeStyle = '#1a0a07'; cctx.lineWidth = 2; cctx.beginPath(); cctx.moveTo(30,-44); cctx.lineTo(30,-70); cctx.stroke();
if(Math.sin(t*3+i)>0){ cctx.fillStyle='rgba(255,70,50,0.95)'; cctx.beginPath(); cctx.arc(30,-71,2.2,0,Math.PI*2); cctx.fill(); }
cctx.restore();
}
function drawSpire(x, gy, sc, t){
cctx.save(); cctx.translate(x, gy); cctx.scale(sc, sc);
cctx.fillStyle = '#220f12'; cctx.beginPath(); cctx.moveTo(-18,0); cctx.lineTo(-6,-120); cctx.lineTo(0,-170); cctx.lineTo(6,-120); cctx.lineTo(18,0); cctx.closePath(); cctx.fill();
cctx.strokeStyle = 'rgba(200,130,255,0.7)'; cctx.lineWidth = 1.2;
cctx.beginPath(); cctx.ellipse(0,-110,26,7,0,0,Math.PI*2); cctx.stroke();
cctx.beginPath(); cctx.ellipse(0,-70,34,9,0,0,Math.PI*2); cctx.stroke();
const pulse = 0.5+0.5*Math.sin(t*2.4);
const g = cctx.createRadialGradient(0,-172,1,0,-172,34);
g.addColorStop(0,'rgba(200,130,255,'+(0.5+pulse*0.5).toFixed(2)+')'); g.addColorStop(1,'rgba(150,80,255,0)');
cctx.fillStyle = g; cctx.beginPath(); cctx.arc(0,-172,34,0,Math.PI*2); cctx.fill();
cctx.restore();
}
function drawWalker(x, gy, sc, t){
cctx.save(); cctx.translate(x, gy); cctx.scale(sc, sc);
const ph = t*1.2;
cctx.strokeStyle = '#1a0a0d'; cctx.lineWidth = 5; cctx.lineCap = 'round'; cctx.lineJoin = 'round';
[[-1,0],[0.15,2.1],[1,4.2]].forEach(l=>{
const lift = Math.max(0, Math.sin(ph + l[1]))*10;
const fx = l[0]*58, kx = l[0]*34;
cctx.beginPath(); cctx.moveTo(l[0]*10,-92); cctx.lineTo(kx,-122+lift*0.4); cctx.lineTo(fx,-lift); cctx.stroke();
});
cctx.fillStyle = '#220f12'; cctx.beginPath(); cctx.ellipse(0,-98,30,16,0,0,Math.PI*2); cctx.fill();
cctx.beginPath(); cctx.ellipse(0,-108,14,9,0,Math.PI,Math.PI*2); cctx.fill();
cctx.fillStyle = 'rgba(200,120,255,'+(0.6+0.4*Math.sin(t*3)).toFixed(2)+')'; cctx.beginPath(); cctx.arc(0,-98,3.4,0,Math.PI*2); cctx.fill();
cctx.restore();
}
function drawEye(x, y, sc, t, beam, gyBeam){
if(beam){
const a = Math.PI/2 + Math.sin(t*0.9)*0.5;
const g = cctx.createLinearGradient(x,y,x+Math.cos(a)*(gyBeam-y)/Math.sin(a),gyBeam);
g.addColorStop(0,'rgba(255,70,50,0.35)'); g.addColorStop(1,'rgba(255,70,50,0)');
cctx.fillStyle = g; cctx.beginPath(); cctx.moveTo(x-3*sc,y+8*sc);
const bx = x + Math.cos(a)*(gyBeam-y)/Math.sin(a);
cctx.lineTo(bx-46*sc,gyBeam); cctx.lineTo(bx+46*sc,gyBeam); cctx.lineTo(x+3*sc,y+8*sc); cctx.closePath(); cctx.fill();
}
cctx.fillStyle = '#12080a'; cctx.beginPath(); cctx.arc(x,y,17*sc,0,Math.PI*2); cctx.fill();
cctx.strokeStyle = 'rgba(210,150,255,0.75)'; cctx.lineWidth = 1.4; cctx.stroke();
const pulse = 0.6+0.4*Math.sin(t*3);
cctx.fillStyle = 'rgba(255,70,50,'+pulse.toFixed(2)+')'; cctx.beginPath(); cctx.arc(x,y,6*sc,0,Math.PI*2); cctx.fill();
}
function drawJet(x, y, sc, t){
cctx.save(); cctx.translate(x,y); cctx.scale(sc,sc);
cctx.fillStyle = '#12080a';
cctx.beginPath(); cctx.moveTo(40,0); cctx.lineTo(-10,-6); cctx.lineTo(-34,-22); cctx.lineTo(-30,-2); cctx.lineTo(-40,0); cctx.lineTo(-30,2); cctx.lineTo(-34,22); cctx.lineTo(-10,6); cctx.closePath(); cctx.fill();
const f = 0.5+0.5*Math.sin(t*9);
cctx.fillStyle = 'rgba(255,170,80,'+(0.4+0.5*f).toFixed(2)+')'; cctx.beginPath(); cctx.arc(-42,0,4+f*2,0,Math.PI*2); cctx.fill();
cctx.restore();
}
function drawTank(px, gy, sc, dir, lights, t){
cctx.save(); cctx.translate(px, gy); cctx.scale(sc*dir, sc);
cctx.fillStyle = '#12080a';
cctx.fillRect(-70,-20,140,20);
cctx.beginPath(); cctx.moveTo(-64,-20); cctx.lineTo(-56,-38); cctx.lineTo(58,-38); cctx.lineTo(68,-20); cctx.closePath(); cctx.fill();
cctx.beginPath(); cctx.moveTo(-28,-38); cctx.lineTo(-22,-56); cctx.lineTo(24,-56); cctx.lineTo(30,-38); cctx.closePath(); cctx.fill();
cctx.fillRect(24,-51,78,5); cctx.fillRect(100,-53,8,9);
cctx.fillStyle = 'rgba(255,200,150,0.2)'; cctx.fillRect(-56,-39,114,2);
if(lights){
const fl = 0.85+0.15*Math.sin(t*9);
const beam = cctx.createLinearGradient(66,-28,300,-8);
beam.addColorStop(0,'rgba(255,200,110,'+(0.34*fl).toFixed(2)+')'); beam.addColorStop(1,'rgba(255,200,110,0)');
cctx.fillStyle = beam; cctx.beginPath(); cctx.moveTo(66,-32); cctx.lineTo(66,-22); cctx.lineTo(320,20); cctx.lineTo(320,-70); cctx.closePath(); cctx.fill();
const gl = cctx.createRadialGradient(68,-28,1,68,-28,26);
gl.addColorStop(0,'rgba(255,225,150,'+(0.9*fl).toFixed(2)+')'); gl.addColorStop(1,'rgba(255,170,70,0)');
cctx.fillStyle = gl; cctx.beginPath(); cctx.arc(68,-28,26,0,Math.PI*2); cctx.fill();
}
cctx.restore();
}

function drawScene0(t){
const hy = ch*0.64;
drawSky(t, [[0,'#14080b'],[0.5,'#5a2216'],[1,'#d27a3a']], hy);
drawMoon(cw*0.20, ch*0.16, 9); drawMoon(cw*0.80, ch*0.10, 5);
drawRidge(ch*0.66, 24, 1.0, 0.006, '#7a3018', t*2, 'rgba(255,190,130,0.25)');
[0.12,0.28,0.45,0.63,0.82].forEach((fx,i)=>{
const x = fx*cw, y = ridgeY(x+t*2, ch*0.66, 24, 1.0, 0.006);
cctx.fillStyle = 'rgba(255,'+(i%2?90:190)+',70,'+(0.5+0.5*Math.sin(t*2+i*2)).toFixed(2)+')';
cctx.fillRect(x, y-2, 3, 2);
});
drawRidge(ch*0.76, 34, 4.0, 0.009, '#4a1c10', t*5, 'rgba(255,170,110,0.18)');
drawDust(t, 0.7, 70, 0.50);
const sc = Math.max(0.7, Math.min(cw/900, 1.25));
const landX = cw*0.46, landY = ch*0.82;
const p = ease(t/6.0);
const posAt = (q)=>({ x: lerp(cw*0.10, landX, q) + Math.sin(q*Math.PI)*cw*0.07, y: lerp(-30, landY, q*q*0.35+q*0.65) });
for(let j=18;j>=1;j--){
const q = p - j*0.013; if(q<=0) continue;
const pp = posAt(q);
cctx.fillStyle = 'rgba(255,'+(120+j*5)+',50,'+((1-j/19)*0.45).toFixed(2)+')';
cctx.beginPath(); cctx.arc(pp.x, pp.y, (1-j/19)*9*sc+1, 0, Math.PI*2); cctx.fill();
}
const pos = posAt(p);
const retro = p > 0.7 && p < 1;
cctx.save(); cctx.translate(pos.x, pos.y); cctx.scale(sc*lerp(0.7,1.2,p), sc*lerp(0.7,1.2,p));
const hg = cctx.createRadialGradient(0,8,1,0,8,34);
hg.addColorStop(0,'rgba(255,190,100,0.9)'); hg.addColorStop(1,'rgba(255,110,40,0)');
cctx.fillStyle = hg; cctx.beginPath(); cctx.arc(0,8,34,0,Math.PI*2); cctx.fill();
if(retro){ cctx.fillStyle='rgba(190,225,255,0.9)'; cctx.beginPath(); cctx.moveTo(-5,12); cctx.lineTo(0,12+30+Math.sin(t*50)*5); cctx.lineTo(5,12); cctx.closePath(); cctx.fill(); }
cctx.fillStyle = '#12080a'; cctx.beginPath(); cctx.moveTo(0,-14); cctx.lineTo(9,6); cctx.lineTo(7,12); cctx.lineTo(-7,12); cctx.lineTo(-9,6); cctx.closePath(); cctx.fill();
cctx.strokeStyle = 'rgba(255,190,130,0.8)'; cctx.lineWidth = 1; cctx.stroke();
cctx.restore();
if(t>6.0){
const q = clamp01((t-6.0)/1.6);
cctx.strokeStyle = 'rgba(255,170,110,'+((1-q)*0.55).toFixed(2)+')'; cctx.lineWidth = 3;
cctx.beginPath(); cctx.ellipse(landX, landY+10, q*cw*0.16, q*cw*0.035, 0, 0, Math.PI*2); cctx.stroke();
}
drawRidge(ch*0.90, 22, 8.0, 0.012, '#1c0a07', t*9, null);
scrim(0.5);
}

function drawBracket(x, y, w, h, label, a, below){
cctx.save();
cctx.strokeStyle = 'rgba(255,215,150,'+a.toFixed(2)+')'; cctx.lineWidth = 1.5;
const c = 8;
cctx.beginPath();
[[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]].forEach(q=>{ cctx.moveTo(q[0],q[1]+q[3]*c); cctx.lineTo(q[0],q[1]); cctx.lineTo(q[0]+q[2]*c,q[1]); });
cctx.stroke();
cctx.font = '11px "Share Tech Mono", monospace';
cctx.fillStyle = 'rgba(255,225,170,'+a.toFixed(2)+')';
cctx.fillText(label, x, below ? y+h+14 : y-5);
cctx.restore();
}
function drawScene1(t){
const hy = ch*0.62;
drawSky(t, [[0,'#16090b'],[0.55,'#4a1c14'],[1,'#b8622e']], hy);
drawMoon(cw*0.86, ch*0.12, 7);
drawRidge(ch*0.64, 18, 2.0, 0.007, '#6a2a16', 0, 'rgba(255,180,120,0.2)');
const short = ch < 500;
const gy = ch*(short?0.85:0.77);
const gg = cctx.createLinearGradient(0,hy,0,ch);
gg.addColorStop(0,'#5a2412'); gg.addColorStop(1,'#1f0b07');
cctx.fillStyle = gg; cctx.fillRect(0,ch*0.66,cw,ch);
const sc = Math.max(0.65, Math.min(cw/900, 1.2));
cctx.fillStyle = 'rgba(30,12,8,0.8)';
cctx.beginPath(); cctx.moveTo(cw*0.50,gy+2); cctx.lineTo(cw*0.70,gy+2); cctx.lineTo(cw*0.78,gy+ch*0.10); cctx.lineTo(cw*0.44,gy+ch*0.10); cctx.closePath(); cctx.fill();
cctx.strokeStyle = 'rgba(255,200,130,0.5)'; cctx.lineWidth = 1.5; cctx.setLineDash([8,10]);
cctx.beginPath(); cctx.moveTo(cw*0.60,gy+2); cctx.lineTo(cw*0.61,gy+ch*0.10); cctx.stroke(); cctx.setLineDash([]);
const E = [
{ id:'spire', x:cw*0.12, w:70*sc, h:178*sc, label:'SURVEY SITE' },
{ id:'bunker', x:cw*0.32, w:130*sc, h:76*sc, label:'NEXUS BUNKER 03' },
{ id:'jet', x:cw*0.60, w:96*sc, h:44*sc, label:'LAST RUNWAY' },
{ id:'walker', x:cw*(short?0.90:0.82) - t*5, w:132*sc, h:136*sc, label:'VRETH WALKER' },
{ id:'eye', x:cw*0.47, w:50*sc, h:42*sc, label:'ARCHITECT\'S EYE' }
];
drawSpire(E[0].x, gy, sc, t);
drawBunker(E[1].x, gy, sc, t, 1);
drawJet(E[2].x, gy+ch*0.04, sc*1.1, t);
drawWalker(E[3].x, gy+ch*0.02, sc*0.95, t);
const eyeY = ch*(short?0.15:0.27) + Math.sin(t*1.1)*6;
drawEye(E[4].x, eyeY, sc, t, true, gy+ch*0.05);
const amt = 0.55 + 0.22*Math.sin(t*0.9);
drawDust(t, amt, 140, 0.45);
drawRidge(ch*0.92, 18, 6.0, 0.011, '#160806', 0, null);
scrim(0.42);
const order = ['spire','bunker','eye','jet','walker'];
order.forEach((id,i)=>{
const e = E.find(q=>q.id===id);
const at = 0.9 + i*0.95;
if(t<at) return;
const a = clamp01((t-at)/0.35) * (0.7+0.3*Math.sin(t*6+i));
let top = gy - e.h, left = e.x - e.w/2;
if(id==='eye'){ top = eyeY - e.h/2; }
if(id==='jet'){ top = gy+ch*0.04 - e.h; }
if(id==='walker'){ top = gy+ch*0.02 - e.h; }
drawBracket(left, top, e.w, e.h, e.label, a, short && (id==='bunker'||id==='spire'||id==='walker'));
});
cctx.save();
cctx.font = '12px "Share Tech Mono", monospace';
cctx.fillStyle = 'rgba(255,225,170,1)'; cctx.fillText('SURFACE RECON // MARS', 18, 26);
cctx.fillStyle = 'rgba(255,225,170,0.9)'; cctx.fillText('VISIBILITY: '+Math.round((1-amt)*100)+'%', 18, 44);
cctx.restore();
}

function drawScene2(t){
const hy = ch*0.62;
const clear = ease(t/8);
drawSky(t, [[0,'#10070b'],[0.45,'#4a1a18'],[0.85,'#a85a38'],[1,'#3f6a9a']], hy);
const sx = cw*0.74, sy = hy-6;
const halo = cctx.createRadialGradient(sx,sy,2,sx,sy,cw*0.26);
halo.addColorStop(0,'rgba(255,255,255,0.95)'); halo.addColorStop(0.08,'rgba(170,205,255,0.65)'); halo.addColorStop(0.4,'rgba(90,140,220,0.22)'); halo.addColorStop(1,'rgba(90,140,220,0)');
cctx.fillStyle = halo; cctx.fillRect(0,0,cw,ch);
drawRidge(hy+2, 14, 3.0, 0.008, '#3a1610', 0, 'rgba(255,200,140,0.18)');
const gg = cctx.createLinearGradient(0,hy,0,ch);
gg.addColorStop(0,'#3a160e'); gg.addColorStop(1,'#120504');
cctx.fillStyle = gg; cctx.fillRect(0,hy+4,cw,ch);
const sc = Math.max(0.55, Math.min(cw/1100, 1.0));
const gy = hy+10;
drawSpire(cw*0.52, gy, sc*0.75, t);
drawBunker(cw*0.62, gy, sc*0.85, t, 0);
drawEye(cw*0.84, ch*0.34+Math.sin(t*1.1)*5, sc*0.9, t, false, gy);
drawTank(cw*0.70, gy+8, sc*0.55, -1, true, t);
drawDust(t, 0.65 - 0.5*clear, 120, 0.50);
const k = Math.max(0.9, Math.min(1.4, ch/560));
const rxp = cw*0.20;
const ryg = ridgeY(rxp, ch*0.93, 20, 9.0, 0.010) + 4;
drawRidge(ch*0.93, 20, 9.0, 0.010, '#0a0303', 0, 'rgba(255,170,110,0.25)');
cctx.save(); cctx.shadowColor = 'rgba(255,150,100,0.5)'; cctx.shadowBlur = 8;
drawReyes(rxp, ryg, k, t*0.4);
cctx.restore();
scrim(0.5);
}

_startCrawl({
crawl: crawl, panels: panels, advanceHint: advanceHint, beginHint: beginHint,
durations: [7000, 8600], pulse: 'crawlBtnPulseMars', resize: resizeCanvas, canvas: canvas,
draw: (i, t, dt)=>{
cctx.clearRect(0,0,cw,ch);
if(i===0) drawScene0(t);
else if(i===1) drawScene1(t);
else drawScene2(t, dt);
},

onDone: onDone
});
}
});