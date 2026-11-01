window.__engine.files.push(function* weather() {
const $buildings = window.__engine.buildings;
const $core = window.__engine.core;
const $props = window.__engine.props;
const $psycho1 = window.__engine.psycho1;
const $replay = window.__engine.replay;
const $weather = window.__engine.weather;
const { cachedLinearGradient, cachedRadialGradient } = $core;
const { _shadeHex } = $props;
const { onBuilding } = $psycho1;
Object.assign($weather, { drawEnvironmentFX, drawLandmarkWreck, placeLandmarkForEnv });
yield;


function drawEnvironmentFX(){
const env = $psycho1.ENVS[$replay.currentEnv];
if($buildings.weather.intensity>0 && $buildings.weather.name==='SANDSTORM' && window.__desertPixel){
try{ window.__desertPixel.storm($core.ctx,$replay.W,$replay.H,$buildings,$replay.currentEnv,cachedRadialGradient,!!($core.isMobile||$core.isUltraLow)); }catch(pe){}
} else if($buildings.weather.intensity>0){
$core.ctx.fillStyle=$buildings.weather.color;
$core.ctx.fillRect(0,0,$replay.W,$replay.H);
if($buildings.weather.wind>0){
if(!$buildings.weather._rainY || $buildings.weather._rainY.length !== 20){
$buildings.weather._rainY = Array.from({length:20},()=>Math.random()*1000);
}
$core.ctx.save();$core.ctx.strokeStyle='rgba(200,200,200,0.1)';$core.ctx.lineWidth=1;
for(let i=0;i<20;i++){
const x=($buildings.tick*$buildings.weather.wind+i*30)%$replay.W;
const y=$buildings.weather._rainY[i]%$replay.H;
$core.ctx.beginPath();$core.ctx.moveTo(x,y);$core.ctx.lineTo(x+20,y);$core.ctx.stroke();
}
$core.ctx.restore();
}
}
if($replay.currentEnv==='night'){
const _sBase = $core.isMobile ? Math.max($replay.W,$replay.H) : Math.min($replay.W,$replay.H);
const sR = _sBase * ($core.isMobile ? 0.52 : 0.42);
const _innerR = $core.isMobile ? 120 : 80;
const grad=cachedRadialGradient('night_vignette_'+sR+'_'+_innerR,0,0,_innerR,0,0,sR,[[0,'rgba(0,0,0,0)'],[0.55,'rgba(0,0,10,0.22)'],[1,`rgba(0,0,10,${$core.isMobile?0.62:0.74})`]]);
$core.ctx.save();$core.ctx.translate($buildings.player.x,$buildings.player.y);$core.ctx.fillStyle=grad;$core.ctx.fillRect(-$buildings.player.x,-$buildings.player.y,$replay.W,$replay.H);$core.ctx.restore();
$core.ctx.fillStyle='rgba(20,30,80,0.06)';$core.ctx.fillRect(0,0,$replay.W,$replay.H);
} else if($replay.currentEnv==='spaceship'){
const shipGrad=cachedRadialGradient('ship_vignette_'+$replay.W+'_'+$replay.H,$replay.W/2,$replay.H/2,$replay.H*0.2,$replay.W/2,$replay.H/2,Math.max($replay.W,$replay.H)*0.7,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,2,22,0.66)']]);
$core.ctx.fillStyle=shipGrad;$core.ctx.fillRect(0,0,$replay.W,$replay.H);
$core.ctx.save();$core.ctx.strokeStyle='rgba(0,80,255,0.06)';$core.ctx.lineWidth=1;
const gridSize=40;
$core.ctx.beginPath();
for(let gx=0;gx<$replay.W;gx+=gridSize){$core.ctx.moveTo(gx,0);$core.ctx.lineTo(gx,$replay.H);}
for(let gy=0;gy<$replay.H;gy+=gridSize){$core.ctx.moveTo(0,gy);$core.ctx.lineTo($replay.W,gy);}
$core.ctx.stroke();
$core.ctx.restore();
$core.ctx.fillStyle='rgba(0,30,80,0.08)';$core.ctx.fillRect(0,0,$replay.W,$replay.H);
if($buildings._dqsQuality>=0.4){
$core.ctx.fillStyle=cachedLinearGradient('ship_top_'+$replay.H,0,0,0,$replay.H*0.3,[[0,'rgba(24,224,255,0.09)'],[1,'rgba(24,224,255,0)']]);$core.ctx.fillRect(0,0,$replay.W,$replay.H*0.3);
$core.ctx.save();$core.ctx.globalAlpha=0.05+0.05*(0.5+0.5*Math.sin($buildings.tick*0.03));
$core.ctx.fillStyle=cachedRadialGradient('ship_alarm_'+$replay.W+'_'+$replay.H,$replay.W/2,$replay.H/2,Math.min($replay.W,$replay.H)*0.5,$replay.W/2,$replay.H/2,Math.max($replay.W,$replay.H)*0.78,[[0,'rgba(255,40,60,0)'],[1,'rgba(255,40,60,1)']]);$core.ctx.fillRect(0,0,$replay.W,$replay.H);$core.ctx.restore();
const _sy=($buildings.tick*0.7)%($replay.H+120)-60;
$core.ctx.save();$core.ctx.translate(0,_sy);$core.ctx.fillStyle=cachedLinearGradient('ship_scan',0,-30,0,30,[[0,'rgba(24,224,255,0)'],[0.5,'rgba(24,224,255,0.07)'],[1,'rgba(24,224,255,0)']]);$core.ctx.fillRect(0,-30,$replay.W,60);$core.ctx.restore();
}
} else if($replay.currentEnv==='mars'){
const marsGrad=cachedRadialGradient('mars_vignette_'+$replay.W+'_'+$replay.H,$replay.W/2,$replay.H/2,$replay.H*0.15,$replay.W/2,$replay.H/2,Math.max($replay.W,$replay.H)*0.75,[[0,'rgba(0,0,0,0)'],[1,'rgba(40,10,2,0.52)']]);
$core.ctx.fillStyle=marsGrad;$core.ctx.fillRect(0,0,$replay.W,$replay.H);
$core.ctx.fillStyle='rgba(180,60,10,0.06)';$core.ctx.fillRect(0,0,$replay.W,$replay.H);
$core.ctx.save();$core.ctx.globalAlpha=0.12;$core.ctx.fillStyle='#ff8844';
$core.ctx.beginPath();
for(let i=0;i<14;i++){
const dx2=(($buildings.tick*0.4+i*97)%$replay.W);
const dy2=(($buildings.tick*0.15+i*63)%$replay.H);
const dr=1+((i*73)%3)*0.5;
$core.ctx.moveTo(dx2+dr,dy2);$core.ctx.arc(dx2,dy2,dr,0,Math.PI*2);
}
$core.ctx.fill();
$core.ctx.restore();
} else if($replay.currentEnv==='arctic'){
const _arcTier = $buildings.settingPerfMode ? 0 : $core.isMobile ? 1 : 2;
if(_arcTier > 0){
if(!$core.ctx._arcticVigCache || $core.ctx._arcticVigW!==$replay.W || $core.ctx._arcticVigH!==$replay.H){
const g=$core.ctx.createRadialGradient($replay.W/2,$replay.H/2,Math.min($replay.W,$replay.H)*0.2,$replay.W/2,$replay.H/2,Math.max($replay.W,$replay.H)*0.8);
g.addColorStop(0,'rgba(0,0,0,0)');
g.addColorStop(1,'rgba(80,130,200,0.28)');
$core.ctx._arcticVigCache=g;
const g2=$core.ctx.createLinearGradient(0,0,0,$replay.H*0.14);
g2.addColorStop(0,'rgba(200,230,255,0.20)');
g2.addColorStop(1,'rgba(200,230,255,0)');
$core.ctx._arcticFrostCache=g2;
$core.ctx._arcticVigW=$replay.W; $core.ctx._arcticVigH=$replay.H;
}
$core.ctx.fillStyle=$core.ctx._arcticVigCache; $core.ctx.fillRect(0,0,$replay.W,$replay.H);
} else {
$core.ctx.fillStyle='rgba(100,150,210,0.18)'; $core.ctx.fillRect(0,0,$replay.W,$replay.H);
}
const wind = Math.sin($buildings.tick*0.004)*16;
if(_arcTier === 0){
$core.ctx.fillStyle='rgba(220,240,255,0.55)';
const n=6;
for(let i=0;i<n;i++){
const sx = (((i*491)%$replay.W) + wind + $buildings.tick*0.4 + i*61) % $replay.W;
const sy = ($buildings.tick*0.5 + i*97) % $replay.H;
$core.ctx.fillRect(sx, sy, 2, 2);
}
} else if(_arcTier === 1){
$core.ctx.save();
$core.ctx.fillStyle='rgba(200,230,255,0.30)';
for(let i=0;i<6;i++){
const sx = (((i*491)%$replay.W) + wind*0.6 + $buildings.tick*0.28 + i*61) % $replay.W;
const sy = ($buildings.tick*0.30 + i*67) % $replay.H;
$core.ctx.fillRect(sx, sy, 2, 2);
}
$core.ctx.fillStyle='rgba(255,255,255,0.60)';
for(let i=0;i<5;i++){
const sx = (((i*317)%$replay.W) + wind + $buildings.tick*0.55 + i*89) % $replay.W;
const sy = ($buildings.tick*0.62 + i*97) % $replay.H;
$core.ctx.fillRect(sx, sy, 3, 3);
}
$core.ctx.restore();
} else {
const _TWO_PI = Math.PI*2;
$core.ctx.save();
$core.ctx.globalAlpha=0.25; $core.ctx.fillStyle='#d8eeff';
$core.ctx.beginPath();
for(let i=0;i<30;i++){
const sx = (((i*491)%$replay.W) + wind + ($buildings.tick*0.25+i*61)%$replay.W) % $replay.W;
const sy = ($buildings.tick*0.28 + i*67) % $replay.H;
const sr = 0.6 + (i*53)%3 * 0.3;
$core.ctx.moveTo(sx+sr,sy); $core.ctx.arc(sx,sy,sr,0,_TWO_PI);
}
$core.ctx.fill();
$core.ctx.globalAlpha=0.55; $core.ctx.fillStyle='#ffffff';
$core.ctx.beginPath();
for(let i=0;i<22;i++){
const sx = (((i*317)%$replay.W) + wind*1.4 + ($buildings.tick*0.55+i*89)%$replay.W) % $replay.W;
const sy = ($buildings.tick*0.65 + i*97) % $replay.H;
const sr = 1.2 + (i*79)%4 * 0.4;
$core.ctx.moveTo(sx+sr,sy); $core.ctx.arc(sx,sy,sr,0,_TWO_PI);
}
$core.ctx.fill();
$core.ctx.globalAlpha=1;
$core.ctx.restore();
}
if(_arcTier > 0){
if(!$core.ctx._arcticFrostCache) $core.ctx._arcticFrostCache='rgba(200,230,255,0.10)';
$core.ctx.fillStyle=$core.ctx._arcticFrostCache; $core.ctx.fillRect(0,0,$replay.W,$replay.H*0.12);
}
} else if($replay.currentEnv==='urban'){
$core.ctx.fillStyle=cachedRadialGradient('urb_vig_'+$replay.W+'_'+$replay.H,$replay.W/2,$replay.H*0.48,Math.min($replay.W,$replay.H)*0.22,$replay.W/2,$replay.H*0.48,Math.max($replay.W,$replay.H)*0.78,[[0,'rgba(0,0,0,0)'],[0.6,'rgba(14,8,40,0.22)'],[1,'rgba(8,4,28,0.62)']]);
$core.ctx.fillRect(0,0,$replay.W,$replay.H);
if($buildings._dqsQuality>=0.4){
$core.ctx.fillStyle=cachedLinearGradient('urb_top_'+$replay.H,0,0,0,$replay.H*0.35,[[0,'rgba(255,46,136,0.10)'],[1,'rgba(255,46,136,0)']]);$core.ctx.fillRect(0,0,$replay.W,$replay.H*0.35);
$core.ctx.fillStyle=cachedLinearGradient('urb_bot_'+$replay.H,0,$replay.H*0.65,0,$replay.H,[[0,'rgba(24,224,255,0)'],[1,'rgba(24,224,255,0.08)']]);$core.ctx.fillRect(0,$replay.H*0.65,$replay.W,$replay.H*0.35);
}
$core.ctx.fillStyle=env.ambient;$core.ctx.fillRect(0,0,$replay.W,$replay.H);
} else if($replay.currentEnv==='jungle'){
const _jfVig=cachedRadialGradient('jungle_vig_'+$replay.W+'_'+$replay.H,$replay.W*0.5,$replay.H*0.45,Math.min($replay.W,$replay.H)*0.08,$replay.W*0.5,$replay.H*0.45,Math.max($replay.W,$replay.H)*0.75,[[0,'rgba(0,0,0,0)'],[0.5,'rgba(0,4,0,0.28)'],[1,'rgba(0,0,0,0.72)']]);
$core.ctx.fillStyle=_jfVig;$core.ctx.fillRect(0,0,$replay.W,$replay.H);
$core.ctx.fillStyle=env.ambient;$core.ctx.fillRect(0,0,$replay.W,$replay.H);
} else {
$core.ctx.fillStyle=env.ambient;$core.ctx.fillRect(0,0,$replay.W,$replay.H);
}
}

function _spawnLandmarkSmoke(p, n){
if(!p._smoke) p._smoke=[];
const cap = $core.isUltraLow ? 0 : $core.isMobile ? 6 : 14;
if(p._smoke.length >= cap) return;
for(let i=0;i<n && p._smoke.length<cap;i++){
p._smoke.push({
dx:(Math.random()-0.5)*10, dy:-4-Math.random()*4,
vy:-6-Math.random()*6, vx:(Math.random()-0.5)*4,
r:4+Math.random()*5, life:2.2+Math.random()*1.8, t:0
});
}
}
function _stepLandmarkSmoke(p, dt){
if(!p._smoke || !p._smoke.length) return;
for(let i=p._smoke.length-1;i>=0;i--){
const s=p._smoke[i];
s.t+=dt; s.dx+=s.vx*dt; s.dy+=s.vy*dt; s.r+=dt*2;
if(s.t>s.life){ p._smoke.splice(i,1); continue; }
const a=Math.max(0,(1-s.t/s.life)*0.32);
$core.ctx.fillStyle='rgba(60,60,58,'+a.toFixed(2)+')';
$core.ctx.beginPath();$core.ctx.arc(p.x+s.dx,p.y+s.dy,s.r,0,Math.PI*2);$core.ctx.fill();
}
}

function _makeLandmarkWreck(px,py,rot){
return {
type:'landmark-wreck', x:px, y:py,
rot: rot!==undefined ? rot : (Math.random()*Math.PI*2),
hullW: 46+Math.random()*8, hullH: 20+Math.random()*4,
tailLen: 34+Math.random()*8,
bladeAngle: Math.random()*Math.PI*2,
bladeLen: 30+Math.random()*6,
scorchR: 58+Math.random()*14,
_smoke:[], _lastSmokeT:0
};
}

function drawLandmarkWreck(p, env, t){
const px=p.x, py=p.y;

$core.ctx.save();
$core.ctx.globalAlpha=0.28;
const scorchGrad=$core.ctx.createRadialGradient(px,py,4,px,py,p.scorchR);
scorchGrad.addColorStop(0,'#100e0c');
scorchGrad.addColorStop(0.55,'#1c1712');
scorchGrad.addColorStop(1,'rgba(28,23,18,0)');
$core.ctx.fillStyle=scorchGrad;
$core.ctx.beginPath();$core.ctx.ellipse(px,py,p.scorchR,p.scorchR*0.62,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();

$core.ctx.save();
$core.ctx.translate(px,py);
$core.ctx.rotate(p.rot);

$core.ctx.save();$core.ctx.globalAlpha=0.3;$core.ctx.fillStyle='#000';
$core.ctx.beginPath();$core.ctx.ellipse(2,3,p.hullW*0.55,p.hullH*0.5,0,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();

$core.ctx.save();$core.ctx.rotate(0.18);
$core.ctx.fillStyle='#3a3d38';
$core.ctx.fillRect(p.hullW*0.3, -3, p.tailLen, 6);
$core.ctx.fillStyle='#2a2c28';
$core.ctx.fillRect(p.hullW*0.3+p.tailLen-6, -5, 6, 10);
$core.ctx.restore();

$core.ctx.fillStyle='#33352f';
$core.ctx.beginPath();
$core.ctx.ellipse(0,0,p.hullW*0.5,p.hullH*0.5,0,0,Math.PI*2);
$core.ctx.fill();
$core.ctx.fillStyle=_shadeHex('#33352f',0.12);
$core.ctx.beginPath();
$core.ctx.ellipse(-p.hullW*0.08,-p.hullH*0.15,p.hullW*0.32,p.hullH*0.28,0,0,Math.PI*2);
$core.ctx.fill();

$core.ctx.fillStyle='rgba(120,160,170,0.35)';
$core.ctx.beginPath();
$core.ctx.ellipse(-p.hullW*0.32,0,p.hullW*0.16,p.hullH*0.32,0,0,Math.PI*2);
$core.ctx.fill();
$core.ctx.strokeStyle='rgba(20,20,20,0.5)';$core.ctx.lineWidth=1;
$core.ctx.beginPath();
$core.ctx.moveTo(-p.hullW*0.44,-2);$core.ctx.lineTo(-p.hullW*0.2,3);
$core.ctx.moveTo(-p.hullW*0.4,4);$core.ctx.lineTo(-p.hullW*0.22,-3);
$core.ctx.stroke();

$core.ctx.save();$core.ctx.globalAlpha=0.35;$core.ctx.fillStyle='#100e0c';
$core.ctx.beginPath();$core.ctx.ellipse(p.hullW*0.1,-2,p.hullW*0.22,p.hullH*0.14,0.3,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();

$core.ctx.restore();

$core.ctx.save();
$core.ctx.translate(px + Math.cos(p.bladeAngle)*p.hullW*0.9, py + Math.sin(p.bladeAngle)*p.hullW*0.5);
$core.ctx.rotate(p.bladeAngle+0.4);
$core.ctx.fillStyle='#26281f';
$core.ctx.fillRect(-p.bladeLen/2, -3, p.bladeLen, 5);
$core.ctx.fillStyle='#1a1c16';
$core.ctx.fillRect(-p.bladeLen/2, -3, 8, 5);
$core.ctx.restore();

p._lastSmokeT = (p._lastSmokeT||0) + 0.016;
if(p._lastSmokeT > 0.7){ p._lastSmokeT=0; _spawnLandmarkSmoke(p,1); }
_stepLandmarkSmoke(p, 0.016);

const flicker = 0.4 + 0.3*Math.sin((t||0)*2.1);
$core.ctx.save();$core.ctx.globalAlpha=flicker*0.6;
$core.ctx.fillStyle='rgba(255,110,40,0.8)';
$core.ctx.beginPath();$core.ctx.arc(px+6,py+2,3,0,Math.PI*2);$core.ctx.fill();
$core.ctx.restore();
}

function placeLandmarkForEnv(){
if($replay.currentEnv!=='urban' && $replay.currentEnv!=='night') return null;
let px,py,ok=false,tries=0;
while(!ok && tries<24){
px=70+Math.random()*($replay.W-140); py=70+Math.random()*($replay.H-140);
ok = !onBuilding(px,py,70) && !(Math.abs(px-$replay.W/2)<130 && Math.abs(py-$replay.H*0.72)<130);
tries++;
}
if(!ok) return null;
const wreck=_makeLandmarkWreck(px,py);
$psycho1.sceneProps.push(wreck);
return wreck;
}

});