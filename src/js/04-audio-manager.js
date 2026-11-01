class AudioManager {
constructor() {
this.enabled = true;
this.volume = 0.7;
this.musicEnabled = true;
this.musicVolume = 0.5;
this.audioContext = null;
this._lastPlay = {};
this._minInterval = {explosion:120, hit:30, death_enemy:40};
this._noiseBufCache = {};
this._activeVoices = 0;
this._musicNodes = [];
this._orb = null; this._musicBus = null;
this._STATION_LINES = {5:'Structural breach detected. Deck twelve. Casualties: zero. Personnel: zero.',10:'Environmental controls offline. Life support: insufficient.',15:"Captain's override revoked. Intruder classification: delta.",20:'Reactor three sealed. Reactor four sealed. Reactor five \u2014',25:'No personnel remain to seal. Auto-response only.',30:'Integrity: catastrophic. Requesting reset.'};
this._bossNodes = [];
this._musicEnv = null;
this._musicPaused = false;
this._suspendedAt = 0;
const resumeOnce = ()=>{
if(this.audioContext && this.audioContext.state==='suspended'){
this.audioContext.resume().catch(()=>{});
}
};
['touchstart','mousedown','keydown'].forEach(ev=>document.addEventListener(ev, resumeOnce, {once:false, passive:true}));
this._aubShown = false;
this._aubDismissed = false;
}
showAudioBanner(){
if(this._aubShown) return;
this._aubShown = true;
}
checkAudioBanner(){
if(!this.audioContext) return;
if(this.audioContext.state === 'running'){
this._aubDismissed = true;
} else if(this.audioContext.state === 'suspended'){
this.showAudioBanner();
}
}
_ensureCtx(){
if(!this.audioContext){
try{ this.audioContext = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){}
}
if(this.audioContext && this.audioContext.state==='suspended') this.audioContext.resume().catch(()=>{});
this.checkAudioBanner();
if(this.audioContext && this.audioContext.state==='running' && !this._aubDismissed){
this._aubDismissed = true;
}
return this.audioContext;
}
_throttled(key, fn){
const now = performance.now();
let minGap = this._minInterval[key] || 0;
if(typeof isUltraLow !== 'undefined' && isUltraLow) minGap *= 1.8;
else if(typeof isLowEndDesktop !== 'undefined' && isLowEndDesktop) minGap *= 1.3;
if(minGap && this._lastPlay[key] && now - this._lastPlay[key] < minGap) return;
this._lastPlay[key] = now;
fn();
}
_play(fn) {
if(!this.enabled) return;
const ctx = this._ensureCtx();
if(!ctx) return;
try { fn(ctx); } catch(e){}
}
at(x, fn){
const ctx=this.audioContext;
if(!ctx || !ctx.createStereoPanner || typeof x!=='number' || !isFinite(x)) return fn();
let pan=0;
try{ pan=Math.max(-1,Math.min(1,(x-$buildings.player.x)/(($replay.W||800)*0.5)))*0.85; }catch(e){ return fn(); }
if(Math.abs(pan)<0.06) return fn();
if(this._destPatched!==ctx){
const real=ctx.destination; this._realDest=real;
try{ Object.defineProperty(ctx,'destination',{configurable:true,get:()=>this._panBus||real}); this._destPatched=ctx; }catch(e){ return fn(); }
}
const p=ctx.createStereoPanner(); p.pan.value=pan; p.connect(this._realDest);
this._panBus=p;
try{ return fn(); } finally { this._panBus=null; }
}
_getMaxVoices(){
if(typeof isUltraLow !== 'undefined' && isUltraLow) return 4;
if(typeof isLowEndDesktop !== 'undefined' && isLowEndDesktop) return 7;
if(typeof isMobile !== 'undefined' && isMobile) return 14;
return 999;
}
_tryBeginVoice(durSec){
if(this._activeVoices >= this._getMaxVoices()) return false;
this._activeVoices++;
let released = false;
const release = ()=>{
if(released) return;
released = true;
this._activeVoices = Math.max(0, this._activeVoices - 1);
};
setTimeout(release, Math.max(20, durSec * 1000) + 50);
return release;
}
_getNoiseBuffer(ctx, dur){
const key = Math.round(dur * 1000) + '@' + ctx.sampleRate;
let buf = this._noiseBufCache[key];
if(!buf){
buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
const d = buf.getChannelData(0);
for(let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
this._noiseBufCache[key] = buf;
}
return buf;
}
_noise(dur, gain=0.15, onEnded=null) {
const ctx = this.audioContext;
if(!ctx) return;
const vol = this.volume;
const buf = this._getNoiseBuffer(ctx, dur);
const src = ctx.createBufferSource(); src.buffer = buf;
const g = ctx.createGain();
const now = ctx.currentTime;
const attack = Math.min(0.005, dur * 0.05);
g.gain.setValueAtTime(0.0001, now);
g.gain.linearRampToValueAtTime(gain*vol, now + attack);
g.gain.exponentialRampToValueAtTime(0.001, now + dur);
const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 400;
src.connect(f); f.connect(g); g.connect(ctx.destination);
if(onEnded) src.onended = onEnded;
src.start(now);
}
_tone(freq, dur, type='sine', gain=0.1, freqEnd=null, onEnded=null) {
const ctx = this.audioContext;
if(!ctx) return;
const vol = this.volume;
const osc = ctx.createOscillator(); const g = ctx.createGain();
osc.connect(g); g.connect(ctx.destination);
osc.type = type;
const now = ctx.currentTime;
const attack = Math.min(0.004, dur * 0.05);
osc.frequency.setValueAtTime(freq, now);
if(freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, now + dur);
g.gain.setValueAtTime(0.0001, now);
g.gain.linearRampToValueAtTime(gain*vol, now + attack);
g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
if(onEnded) osc.onended = onEnded;
osc.start(now); osc.stop(now + dur + 0.01);
}
_musicOsc(freq, type, gainVal, detune=0, list=null) {
const ctx = this.audioContext;
if(!ctx) return null;
const osc = ctx.createOscillator();
const g = ctx.createGain();
osc.type = type;
osc.frequency.value = freq;
osc.detune.value = detune;
g.gain.setValueAtTime(0.0001, ctx.currentTime);
g.gain.linearRampToValueAtTime(gainVal * this.musicVolume, ctx.currentTime + 0.02);
osc.connect(g); g.connect(this._musicBus || ctx.destination);
osc.start();
const node = {osc, gain:g, _baseGain:gainVal};
(list || this._musicNodes).push(node);
return node;
}
_calmOsc(freq, type, gainVal, detune=0) {
const ctx = this.audioContext;
if(!ctx) return null;
const osc = ctx.createOscillator();
const g = ctx.createGain();
osc.type = type;
osc.frequency.value = freq;
osc.detune.value = detune;
g.gain.setValueAtTime(0.0001, ctx.currentTime);
g.gain.linearRampToValueAtTime(gainVal * this.musicVolume, ctx.currentTime + 0.02);
osc.connect(g); g.connect(this._musicBus || ctx.destination);
osc.start();
const node = {osc, gain:g, _baseGain:gainVal};
this._musicNodes.push(node);
return node;
}
_intensityOsc(freq, type, gainVal, detune=0) {
const ctx = this.audioContext;
if(!ctx) return null;
const osc = ctx.createOscillator();
const g = ctx.createGain();
osc.type = type;
osc.frequency.value = freq;
osc.detune.value = detune;
g.gain.value = 0.0001;
osc.connect(g); g.connect(this._musicBus || ctx.destination);
osc.start();
const node = {osc, gain:g, _baseGain:gainVal, _iLayer:true};
this._intensityNodes = this._intensityNodes || [];
this._intensityNodes.push(node);
this._musicNodes.push(node);
return node;
}
_musicNoise(freqCenter, bw, gainVal, list=null) {
const ctx = this.audioContext;
if(!ctx) return null;
const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
const d = buf.getChannelData(0);
for(let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
const src = ctx.createBufferSource();
src.buffer = buf; src.loop = true;
const f = ctx.createBiquadFilter();
f.type = 'bandpass'; f.frequency.value = freqCenter; f.Q.value = freqCenter/Math.max(1,bw);
const g = ctx.createGain();
g.gain.setValueAtTime(0.0001, ctx.currentTime);
g.gain.linearRampToValueAtTime(gainVal * this.musicVolume, ctx.currentTime + 0.02);
src.connect(f); f.connect(g); g.connect(this._musicBus || ctx.destination);
src.start();
const node = {osc:src, gain:g, _baseGain:gainVal};
(list || this._musicNodes).push(node);
return node;
}
_pulse(gainNode, bpm, beatGain, swingRatio=1) {
const ctx = this.audioContext;
if(!ctx) return;
const intervalSec = 60 / bpm * swingRatio;
const _lowTier = (typeof isUltraLow !== 'undefined' && isUltraLow) ||
                 (typeof isLowEndDesktop !== 'undefined' && isLowEndDesktop);
const scheduleAhead = _lowTier ? 0.45 : 0.1;
const checkInterval = _lowTier ? 90 : 25;
let nextBeatTime = ctx.currentTime + 0.01;
const schedule = () => {
if(!gainNode._pulseAlive) return;
if(nextBeatTime < ctx.currentTime) nextBeatTime = ctx.currentTime + 0.02;
while(nextBeatTime < ctx.currentTime + scheduleAhead) {
gainNode.gain.setValueAtTime(beatGain * this.musicVolume, nextBeatTime);
gainNode.gain.exponentialRampToValueAtTime(0.0001, nextBeatTime + 0.08);
nextBeatTime += intervalSec;
}
gainNode._pulseTO = setTimeout(schedule, checkInterval);
};
gainNode._pulseAlive = true;
gainNode._pulseTO = setTimeout(schedule, 0);
}
_stopNodes(list) {
for(const n of list) {
try {
if(n._stopArp) { n._stopArp(); }
if(n._pulseAlive) { n._pulseAlive=false; clearTimeout(n._pulseTO); }
if(n.gain) { n.gain.gain.setValueAtTime(n.gain.gain.value, this.audioContext.currentTime);
n.gain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime+0.4); }
const g = n.gain, o = n.osc;
setTimeout(()=>{
try{ if(o) o.stop(); }catch(e){}
try{ if(o && o.disconnect) o.disconnect(); }catch(e){}
try{ if(g && g.disconnect) g.disconnect(); }catch(e){}
}, 450);
} catch(e){}
}
list.length = 0;
}
playLevelMusic(env) {
if(!this.musicEnabled) return;
if(this._musicEnv === env && this._musicNodes.length > 0) return;
this.stopMusic();
this._musicEnv = env;
this._ensureCtx();
if(!this.audioContext) return;
this._orbitalInit(env);
try { this['_music_'+env](); } catch(e){}
if(env!=='menu') this._startIntensityLayers(env);   // menu stays a pure, smooth pad (no pulsed drum/bass layers)
}
_startIntensityLayers(env) {
const ctx = this.audioContext;
if(!ctx) return;
this._intensityNodes = this._intensityNodes || [];
this._stopNodes(this._intensityNodes);
this._intensity = this._intensity || 0;
const drum = this._musicNoise(200, 150, 0.0001, this._intensityNodes);
drum._baseGain = 0.0001; drum._iLayer = 'drum';
this._pulse(drum.gain, 120, 0.18, 1.0);
const bass = this._musicOsc(55, 'sawtooth', 0.0001, 0, this._intensityNodes);
bass._baseGain = 0.0001; bass._iLayer = 'bass';
this._pulse(bass.gain, 80, 0.22, 0.5);
const lead = this._musicOsc(880, 'sine', 0.0001, 0, this._intensityNodes);
lead._baseGain = 0.0001; lead._iLayer = 'lead';
this._pulse(lead.gain, 240, 0.08, 1.5);
}
setMusicIntensity(level) {
if(!this.audioContext || !this._intensityNodes) return;
const ctx = this.audioContext;
const vol = this.musicVolume;
const t = ctx.currentTime;
const RAMP = 2.5;
this._intensity = Math.max(0, Math.min(1, level));
const i = this._intensity;
for(const n of this._intensityNodes) {
try {
let target = 0;
if(n._iLayer === 'drum') target = i * 0.06 * vol;
else if(n._iLayer === 'bass') target = i * 0.05 * vol;
else if(n._iLayer === 'lead') target = Math.max(0, i - 0.6) * 0.12 * vol;
if(n.gain && n._pulseAlive) {
const floor = Math.max(0.0001, target * 0.3);
n.gain.gain.setTargetAtTime(floor, t, RAMP);
}
} catch(e) {}
}
}
_playEliteKillThud() {
this._play(ctx => {
const vol = this.volume;
const sub = ctx.createOscillator();
const subG = ctx.createGain();
sub.type = 'sine'; sub.frequency.value = 60;
subG.gain.setValueAtTime(0.45 * vol, ctx.currentTime);
subG.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
sub.connect(subG); subG.connect(ctx.destination);
sub.start(); sub.stop(ctx.currentTime + 0.25);
const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
const d = buf.getChannelData(0);
for(let i=0;i<d.length;i++) d[i] = (Math.random()*2-1) * (1 - i/d.length);
const noise = ctx.createBufferSource();
noise.buffer = buf;
const f = ctx.createBiquadFilter();
f.type='lowpass'; f.frequency.value = 280; f.Q.value = 0.8;
const nG = ctx.createGain();
nG.gain.setValueAtTime(0.3 * vol, ctx.currentTime);
nG.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
noise.connect(f); f.connect(nG); nG.connect(ctx.destination);
noise.start();
const click = ctx.createOscillator();
const clickG = ctx.createGain();
click.type='square'; click.frequency.value=180;
clickG.gain.setValueAtTime(0.12 * vol, ctx.currentTime);
clickG.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
click.connect(clickG); clickG.connect(ctx.destination);
click.start(); click.stop(ctx.currentTime + 0.05);
});
}
playKillChord() {
this._play(ctx => {
const vol = this.volume;
const freqs = [220, 277, 330, 415, 554];
freqs.forEach((f, i) => {
const o = ctx.createOscillator();
const g = ctx.createGain();
const filter = ctx.createBiquadFilter();
filter.type = 'lowpass'; filter.frequency.value = 2400;
o.type = 'sine'; o.frequency.value = f;
o.detune.value = (Math.random() - 0.5) * 8;
const startT = ctx.currentTime + i * 0.06;
g.gain.setValueAtTime(0, startT);
g.gain.linearRampToValueAtTime(0.055 * vol, startT + 0.08);
g.gain.exponentialRampToValueAtTime(0.001, startT + 2.2);
o.connect(filter); filter.connect(g); g.connect(ctx.destination);
o.start(startT); o.stop(startT + 2.4);
});
const shimmer = ctx.createOscillator();
const sg = ctx.createGain();
shimmer.type = 'triangle'; shimmer.frequency.value = 1108;
sg.gain.setValueAtTime(0, ctx.currentTime + 0.1);
sg.gain.linearRampToValueAtTime(0.025 * vol, ctx.currentTime + 0.25);
sg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
shimmer.connect(sg); sg.connect(ctx.destination);
shimmer.start(ctx.currentTime + 0.1); shimmer.stop(ctx.currentTime + 2.0);
});
}
setMusicVolume(vol) {
this.musicVolume = vol;
if(!this.audioContext) return;
[...this._musicNodes, ...this._bossNodes].forEach(n=>{
try{ if(n.gain && n._baseGain!==undefined) n.gain.gain.setValueAtTime(n._baseGain*vol, this.audioContext.currentTime); }catch(e){}
});
}
stopMusic() {
this._orbitalTeardown();
this._stopNodes(this._musicNodes);
this._stopNodes(this._bossNodes);
if(this._intensityNodes) this._stopNodes(this._intensityNodes);
this._musicEnv = null;
}
stopIntensityLayers() {
if(this._intensityNodes) this._stopNodes(this._intensityNodes);
this._intensity = 0;
}
pauseMusic() {
if(!this.audioContext || this._musicPaused) return;
this.audioContext.suspend().catch(()=>{});
this._musicPaused = true;
}
resumeMusic() {
if(!this.audioContext || !this._musicPaused) return;
this.audioContext.resume().catch(()=>{});
this._musicPaused = false;
}
playBossMusic(bossType) {
if(!this.musicEnabled) return;
this._stopNodes(this._bossNodes);
this._ensureCtx();
if(!this.audioContext) return;
this._musicNodes.forEach(n=>{
try{
if(n.gain){
const ctx = this.audioContext;
const target = Math.max(0.0001, n.gain.gain.value*0.35);
n.gain.gain.cancelScheduledValues(ctx.currentTime);
n.gain.gain.setValueAtTime(n.gain.gain.value, ctx.currentTime);
n.gain.gain.linearRampToValueAtTime(target, ctx.currentTime+0.25);
}
}catch(e){}
});
this._orbitalBossStart();
try { this['_boss_'+bossType] ? this['_boss_'+bossType]() : this._boss_default(); } catch(e){ this._boss_default(); }
}
stopBossMusic() {
this._orbitalBossEnd();
this._stopNodes(this._bossNodes);
const vol = this.musicVolume;
this._musicNodes.forEach(n=>{
try{
if(n.gain && n._baseGain!==undefined){
const ctx = this.audioContext;
const target = n._baseGain*vol;
n.gain.gain.cancelScheduledValues(ctx.currentTime);
n.gain.gain.setValueAtTime(n.gain.gain.value, ctx.currentTime);
n.gain.gain.linearRampToValueAtTime(target, ctx.currentTime+0.3);
}
}catch(e){}
});
}
_mg(gainVal) { return gainVal * this.musicVolume; }

// ===== ORBITAL DEFENSE: tension audio (level 7 only) =====
_orbitalInit(env) {
this._orbitalTeardown();
if(env !== 'spaceship') return;
let lvl = null;
try { lvl = (typeof $replay !== 'undefined' && $replay.currentLevel) ? $replay.currentLevel : null; } catch(e){}
if(!lvl || lvl.id !== 7) return;
const ctx = this.audioContext;
if(!ctx) return;
const bus = ctx.createGain();
bus.gain.value = 1;
bus.connect(ctx.destination);
this._musicBus = bus;
this._orb = {
token: (this._orbToken = (this._orbToken||0)+1),
pressure: 0, dead: 0, arpDead: false, halfTempo: false,
silenceUntil: 0, sil: [false,false,false],
lastVoiceWave: 0, bossLine: false, nodes: {},
lastHp: 1, lastGroan: 0, lastHiss: 0, lastChime: 0, ending: false,
bossDetuned: false
};
}
_orbitalTeardown() {
const bus = this._musicBus;
if(this._orb) this._orb.token = -1;
this._orb = null;
this._musicBus = null;
if(bus){ setTimeout(()=>{ try{ bus.disconnect(); }catch(e){} }, 700); }
}
_orbDirect() { return this.audioContext ? this.audioContext.destination : null; }
_orbBlip(freq, dur, type, gain, delay=0, viaBus=true, slideTo=null) {
const ctx = this.audioContext; if(!ctx) return;
const o = ctx.createOscillator(), g = ctx.createGain();
const t0 = ctx.currentTime + delay;
o.type = type; o.frequency.setValueAtTime(freq, t0);
if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0+dur);
g.gain.setValueAtTime(0.0001, t0);
g.gain.linearRampToValueAtTime(gain*this.musicVolume, t0+Math.min(0.02,dur/3));
g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
o.connect(g); g.connect((viaBus && this._musicBus) || ctx.destination);
o.start(t0); o.stop(t0+dur+0.02);
o.onended = ()=>{ try{ g.disconnect(); }catch(e){} };
}
_orbNoise(center, bw, dur, gain, sweepTo=null) {
const ctx = this.audioContext; if(!ctx) return;
if(!this._orbBuf){
const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
const d = b.getChannelData(0);
for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
this._orbBuf = b;
}
const src = ctx.createBufferSource(); src.buffer=this._orbBuf; src.loop=true;
const f = ctx.createBiquadFilter(); f.type='bandpass';
const t0 = ctx.currentTime;
f.frequency.setValueAtTime(center, t0); f.Q.value = center/Math.max(1,bw);
if(sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t0+dur);
const g = ctx.createGain();
g.gain.setValueAtTime(0.0001, t0);
g.gain.linearRampToValueAtTime(gain*this.musicVolume, t0+0.08);
g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
src.connect(f); f.connect(g); g.connect(this._musicBus || ctx.destination);
src.start(t0); src.stop(t0+dur+0.05);
src.onended = ()=>{ try{ g.disconnect(); f.disconnect(); }catch(e){} };
}
_orbMute(ms, tail=0.15) {
const bus = this._musicBus, ctx = this.audioContext; if(!bus||!ctx) return;
const orb = this._orb;
orb.silenceUntil = performance.now() + ms;
const t = ctx.currentTime;
bus.gain.cancelScheduledValues(t);
bus.gain.setTargetAtTime(0.0001, t, 0.02);
const tok = orb.token;
setTimeout(()=>{
if(!this._orb || this._orb.token!==tok || this._orb.ending) return;
const t2 = ctx.currentTime;
bus.gain.cancelScheduledValues(t2);
bus.gain.setTargetAtTime(1, t2, tail);
}, ms);
}
_orbVoice(text) {
if(!text) return;
try {
let el = document.getElementById('station-voice');
if(!el){
el = document.createElement('div');
el.id = 'station-voice';
el.style.cssText = 'position:fixed;left:50%;top:16%;transform:translateX(-50%);max-width:80vw;text-align:center;font:600 13px/1.4 monospace;letter-spacing:2px;text-transform:uppercase;color:#66e0ff;text-shadow:0 0 8px #0af;background:rgba(0,16,28,.55);border:1px solid rgba(102,224,255,.35);padding:6px 14px;border-radius:3px;pointer-events:none;z-index:9000;opacity:0;transition:opacity .4s';
document.body.appendChild(el);
}
el.textContent = '▸ STATION: ' + text;
el.style.opacity = '1';
clearTimeout(el._to);
el._to = setTimeout(()=>{ el.style.opacity='0'; }, 4200 + text.length*35);
} catch(e){}
this._orbBlip(880, 0.07, 'square', 0.05, 0, false);
this._orbBlip(660, 0.07, 'square', 0.05, 0.1, false);
this._orbBlip(990, 0.09, 'square', 0.04, 0.2, false);
}
setOrbitalPressure(p, wave, hpFrac) {
const orb = this._orb, ctx = this.audioContext;
if(!orb || !ctx || orb.ending) return;
orb.pressure = Math.max(0, Math.min(1, p));
p = orb.pressure;
const n = orb.nodes, t = ctx.currentTime;
const now = performance.now()/1000;
try {
if(n.thrum){
const wob = Math.sin(now*0.9)*p*3.5;
n.thrum.osc.frequency.setTargetAtTime(55+wob, t, 0.3);
n.thrum2.osc.frequency.setTargetAtTime(110+wob*2, t, 0.3);
}
if(n.sub){
const target = p>0.6 ? Math.min(0.04, (p-0.6)*0.1+0.015)*this.musicVolume : 0.0001;
n.sub.gain.gain.setTargetAtTime(Math.max(0.0001,target), t, 0.6);
}
const loss = Math.min(1, wave/30);
if(n.leak){
const lg = loss>0.4 ? (loss-0.4)*0.06*this.musicVolume : 0.0001;
n.leak.gain.gain.setTargetAtTime(Math.max(0.0001,lg), t, 0.5);
}
} catch(e){}
// every 5 waves one more system dies; station speaks
if(wave > orb.lastVoiceWave){
for(let w = orb.lastVoiceWave+1; w <= wave; w++){
if(w % 5 === 0 && w <= 30){
orb.dead = Math.max(orb.dead, Math.min(3, Math.floor(w/5)));
const line = this._STATION_LINES[w];
if(line) this._orbVoice(line);
}
}
orb.lastVoiceWave = wave;
}
// silences at pressure thresholds
if(p >= 0.35 && !orb.sil[0]){
orb.sil[0] = true;
this._orbMute(1500, 0.05);
const tok = orb.token;
setTimeout(()=>{ if(this._orb && this._orb.token===tok) this._orbBlip(1244.5, 0.5, 'sine', 0.06, 0, true); }, 1560);
} else if(p >= 0.6 && !orb.sil[1]){
orb.sil[1] = true;
this._orbMute(2500, 0.05);
orb.dead = Math.min(3, orb.dead+1);
} else if(p >= 0.85 && !orb.sil[2]){
orb.sil[2] = true;
this._orbMute(4000, 0.8);
orb.halfTempo = true;
// hull breathing: sub only, bypasses the muted bus
const o = ctx.createOscillator(), g = ctx.createGain();
o.type='sine'; o.frequency.value=32;
const t0 = ctx.currentTime;
g.gain.setValueAtTime(0.0001,t0);
g.gain.linearRampToValueAtTime(0.05*this.musicVolume, t0+1.5);
g.gain.linearRampToValueAtTime(0.012*this.musicVolume, t0+2.4);
g.gain.linearRampToValueAtTime(0.05*this.musicVolume, t0+3.3);
g.gain.linearRampToValueAtTime(0.0001, t0+4.0);
o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0+4.1);
o.onended=()=>{ try{g.disconnect();}catch(e){} };
}
// pressure-hiss on heavy damage
if(hpFrac !== undefined){
if(orb.lastHp - hpFrac >= 0.12 && performance.now()-orb.lastHiss > 3000){
orb.lastHiss = performance.now();
this._orbNoise(5000, 3000, 2.0, 0.07, 1200);
}
orb.lastHp = hpFrac;
}
}
orbitalEvent(kind) {
const orb = this._orb; if(!orb || orb.ending) return;
const now = performance.now();
if(kind === 'rocket'){
if(now-orb.lastGroan < 2500) return;
orb.lastGroan = now;
this._orbBlip(46, 1.0, 'triangle', 0.09, 0, true, 26);
} else if(kind === 'turret'){
if(now-orb.lastChime < 800) return;
orb.lastChime = now;
this._orbBlip(2349, 0.5, 'sine', 0.035, 0, true);
orb.silenceUntil = Math.max(orb.silenceUntil, now+250);
} else if(kind === 'streak'){
this._orbVoice('Countermeasure deployed.');
} else if(kind === 'boss'){
if(!orb.bossLine){ orb.bossLine = true; this._orbVoice('Authorization revoked. All remaining personnel: deceased. Please continue, intruder.'); }
}
}
_orbitalBossStart() {
const orb = this._orb; if(!orb) return;
orb.pressure = Math.max(orb.pressure, 0.5);
this.orbitalEvent('boss');
if(orb.bossDetuned || !this.audioContext) return;
orb.bossDetuned = true;
const t = this.audioContext.currentTime;
this._musicNodes.forEach(n=>{
try{ if(n.osc && typeof OscillatorNode!=='undefined' && n.osc instanceof OscillatorNode) n.osc.detune.setTargetAtTime(-200, t, 0.5); }catch(e){}
});
}
_orbitalBossEnd() {
const orb = this._orb; if(!orb || !orb.bossDetuned || !this.audioContext) return;
orb.bossDetuned = false;
const t = this.audioContext.currentTime;
this._musicNodes.forEach(n=>{
try{ if(n.osc && typeof OscillatorNode!=='undefined' && n.osc instanceof OscillatorNode) n.osc.detune.setTargetAtTime(n.osc.type==='sawtooth' && n.osc.frequency.value>80 ? 6 : 0, t, 0.5); }catch(e){}
});
}
// outcome: 'win' (systems die one by one) | 'dead' (instant cut, station resets)
endMusicForOutcome(kind) {
const orb = this._orb, ctx = this.audioContext;
if(!orb || !ctx || !this._musicBus){ this.stopMusic(); return; }
orb.ending = true;
const tok = orb.token, bus = this._musicBus, n = orb.nodes;
const alive = ()=> this._orb && this._orb.token===tok;
if(kind === 'dead'){
bus.gain.cancelScheduledValues(ctx.currentTime);
bus.gain.setValueAtTime(0.0001, ctx.currentTime);
this.stopMusic();
setTimeout(()=>{
this._orbBlip(1320, 0.12, 'sine', 0.07, 0, false);
this._orbBlip(880, 0.25, 'sine', 0.06, 0.14, false);
this._orbVoice('Intruder eliminated. Pressure equalizing. Resuming standard patrol.');
}, 1000);
return;
}
// win: logic -> status -> engine -> hull
const fade = (node, sec)=>{ try{
if(!node) return;
node._pulseAlive = false; clearTimeout(node._pulseTO);
const g = node.gain.gain, t = ctx.currentTime;
g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001,g.value), t);
g.exponentialRampToValueAtTime(0.0001, t+sec);
}catch(e){} };
orb.arpDead = true;
setTimeout(()=>{ if(alive()){ fade(n.ping,1.5); } }, 2000);
setTimeout(()=>{ if(alive()){ fade(n.thrum,2); fade(n.thrum2,2); fade(n.eng,2); fade(n.leak,2); } }, 4500);
setTimeout(()=>{ if(alive()){ fade(n.pulse,2.5); fade(n.sub,2.5); } }, 7500);
setTimeout(()=>{ if(alive()) this.stopMusic(); }, 10500);
}
_music_menu() {
// Smooth ambient pad: slow-fading chords, no percussion, no pulsed gain (so nothing clicks).
const ctx = this.audioContext; if(!ctx) return;
const out = this._musicBus || ctx.destination;
const master = ctx.createGain();
master.gain.setValueAtTime(0.0001, ctx.currentTime);
master.gain.linearRampToValueAtTime(0.07 * this.musicVolume, ctx.currentTime + 4);   // slow fade-in
const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 1100; filt.Q.value = 0.4;
filt.connect(master); master.connect(out);
const lfo = ctx.createOscillator(), lfoG = ctx.createGain();            // very slow filter drift
lfo.frequency.value = 0.05; lfoG.gain.value = 380; lfo.connect(lfoG); lfoG.connect(filt.frequency); lfo.start();
const CHORDS = [
  [110.00, 164.81, 261.63, 392.00],   // Am9
  [ 87.31, 130.81, 220.00, 329.63],   // Fmaj7
  [130.81, 164.81, 196.00, 246.94],   // Cmaj7
  [ 98.00, 146.83, 246.94, 329.63]    // G6
];
const live = [lfo];                      // every oscillator we own, so stop() can clean up
let groups = [], step = 0, timer = null, dead = false;
const playChord = () => {
  if(dead) return;
  const now = ctx.currentTime;
  groups.forEach(g => { g.gain.gain.setTargetAtTime(0, now, 2.2); });        // old chord melts away
  const gg = ctx.createGain(); gg.gain.setValueAtTime(0.0001, now); gg.gain.setTargetAtTime(1, now, 2.5);
  gg.connect(filt);
  const oscs = [];
  CHORDS[step % CHORDS.length].forEach(f => {
    [-3, 3].forEach(cents => {
      const o = ctx.createOscillator(), vg = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f; o.detune.value = cents;
      vg.gain.value = 0.1; o.connect(vg); vg.connect(gg); o.start(); oscs.push(o); live.push(o);
    });
  });
  const grp = {gain: gg, oscs};
  groups.push(grp);
  const old = groups.filter(g => g !== grp);
  groups = [grp, ...old.slice(-1)];
  setTimeout(() => { old.forEach(g => g.oscs.forEach(o => { try{ o.stop(); o.disconnect(); }catch(e){} })); try{ old.forEach(g=>g.gain.disconnect()); }catch(e){} }, 14000);
  step++;
  timer = setTimeout(playChord, 10000);
};
playChord();
this._musicNodes.push({
  osc: null, gain: master, _baseGain: 0.07,
  _stopArp: () => { dead = true; clearTimeout(timer); setTimeout(() => live.forEach(o => { try{ o.stop(); }catch(e){} }), 500); }
});
}
playVictoryFanfare() {
if(!this.musicEnabled) return;
this._ensureCtx();
const ctx = this.audioContext;
if(!ctx) return;
const now = ctx.currentTime;
const notes = [523, 659, 784, 1047];
notes.forEach((f,i)=>{
const o = ctx.createOscillator(), g = ctx.createGain();
o.type = 'triangle'; o.frequency.value = f;
const t0 = now + i*0.11;
g.gain.setValueAtTime(0, t0);
g.gain.linearRampToValueAtTime(this._mg(0.16), t0+0.03);
g.gain.exponentialRampToValueAtTime(0.0001, t0+0.6);
o.connect(g); g.connect(ctx.destination);
o.start(t0); o.stop(t0+0.65);
});
[784,1047,1319].forEach((f,i)=>{
const o = ctx.createOscillator(), g = ctx.createGain();
o.type = 'sine'; o.frequency.value = f;
const t0 = now + 0.33;
g.gain.setValueAtTime(0, t0);
g.gain.linearRampToValueAtTime(this._mg(0.08), t0+0.05);
g.gain.exponentialRampToValueAtTime(0.0001, t0+1.1);
o.connect(g); g.connect(ctx.destination);
o.start(t0); o.stop(t0+1.15);
});
}
_music_jungle() {
const ctx = this.audioContext;
const d1 = this._calmOsc(55, 'sine', 0.06);
const d2 = this._calmOsc(110, 'sine', 0.04, 3);
const d3 = this._calmOsc(82, 'triangle',0.03, -2);
const rain = this._musicNoise(300, 200, 0.025);
rain._baseGain = 0.025;
const perc1 = this._musicOsc(80, 'sine', 0.001);
perc1._baseGain=0.001;
this._pulse(perc1.gain, 92, 0.18, 0.66);
const perc2 = this._musicOsc(55, 'sine', 0.001);
perc2._baseGain=0.001;
this._pulse(perc2.gain, 46, 0.22, 1.33);
[880, 1320, 660].forEach((f,i)=>{
const n = this._musicOsc(f, 'sine', 0.008, i*7);
n._baseGain=0.008;
this._pulse(n.gain, 240+i*40, 0.07, 0.8+i*0.15);
});
}
_music_desert() {
const ctx = this.audioContext;
const wind = this._musicNoise(180, 140, 0.04);
wind._baseGain=0.04;
const wind2 = this._musicNoise(80, 60, 0.025);
wind2._baseGain=0.025;
const d1 = this._musicOsc(55, 'sawtooth', 0.022);
const d2 = this._musicOsc(82, 'sine', 0.018, 5);
const d3 = this._musicOsc(110, 'sine', 0.012, -4);
d1._baseGain=0.022; d2._baseGain=0.018; d3._baseGain=0.012;
const pluck = this._musicOsc(220, 'triangle', 0.001);
pluck._baseGain=0.001;
this._pulse(pluck.gain, 38, 0.14, 1.5);
const hiss = this._musicNoise(2400, 800, 0.012);
hiss._baseGain=0.012;
this._pulse(hiss.gain, 76, 0.08, 0.9);
const iPerc = this._intensityOsc(60, 'sine', 0.05);
if(iPerc) this._pulse(iPerc.gain, 100, 0.22, 0.75);
const iSaw = this._intensityOsc(110, 'sawtooth', 0.025, 5);
if(iSaw) this._pulse(iSaw.gain, 80, 0.10, 1.5);
}
_music_urban() {
const ctx = this.audioContext;
const hum = this._musicOsc(60, 'sawtooth', 0.028);
hum._baseGain=0.028;
const hum2 = this._musicOsc(120, 'square', 0.014, 8);
hum2._baseGain=0.014;
const kick = this._musicOsc(55, 'sine', 0.001);
kick._baseGain=0.001;
this._pulse(kick.gain, 120, 0.25, 1.0);
const snare = this._musicNoise(900, 600, 0.001);
snare._baseGain=0.001;
this._pulse(snare.gain, 120, 0.16, 2.0);
const hat = this._musicNoise(6000, 2000, 0.001);
hat._baseGain=0.001;
this._pulse(hat.gain, 240, 0.06, 0.5);
const bass = this._musicOsc(80, 'sawtooth', 0.032);
bass._baseGain=0.032;
const siren = this._musicOsc(440, 'sine', 0.009);
siren._baseGain=0.009;
if(ctx) {
siren.osc.frequency.setValueAtTime(440, ctx.currentTime);
const lfo = ctx.createOscillator();
const lfoG = ctx.createGain();
lfo.frequency.value = 0.3;
lfoG.gain.value = 80;
lfo.connect(lfoG); lfoG.connect(siren.osc.frequency);
lfo.start();
this._musicNodes.push({osc:lfo, gain:lfoG, _baseGain:0});
}
const iDrum = this._intensityOsc(55, 'sine', 0.07);
if(iDrum) this._pulse(iDrum.gain, 160, 0.28, 0.5);
const iDistort = this._intensityOsc(80, 'sawtooth', 0.04, 12);
if(iDistort) this._pulse(iDistort.gain, 120, 0.14, 1.0);
const iHat = this._intensityOsc(8000, 'square', 0.015);
if(iHat) this._pulse(iHat.gain, 320, 0.05, 0.25);
}
_music_warzone() {
const rumble = this._musicNoise(120, 60, 0.05);
rumble._baseGain=0.05;
this._pulse(rumble.gain, 40, 0.03, 7.5);
const crackle = this._musicNoise(3200, 900, 0.02);
crackle._baseGain=0.02;
this._pulse(crackle.gain, 70, 0.018, 0.9);
const d1 = this._calmOsc(49, 'sawtooth', 0.025);
const d2 = this._calmOsc(73, 'triangle', 0.02, 4);
[330, 392, 466].forEach((f,i)=>{
const n = this._musicOsc(f, 'sine', 0.007, i*9);
n._baseGain=0.007;
this._pulse(n.gain, 36+i*5, 0.05, 4+i*0.7);
});
const thud = this._musicOsc(46, 'sine', 0.001);
thud._baseGain=0.001;
this._pulse(thud.gain, 52, 0.2, 1.1);
}
_music_arctic() {
const wind = this._musicNoise(2200, 600, 0.04);
wind._baseGain=0.04;
const wind2 = this._musicNoise(400, 200, 0.025);
wind2._baseGain=0.025;
const wind3 = this._musicNoise(3400, 800, 0.018);
wind3._baseGain=0.018;
this._pulse(wind3.gain, 55, 0.06, 5.5);
[440, 554, 660, 880, 1108].forEach((f,i)=>{
const n = this._musicOsc(f, 'sine', 0.011-i*0.0015, i*14);
n._baseGain=0.011-i*0.0015;
this._pulse(n.gain, 44+i*6, 0.05+i*0.008, 3.2+i*0.3);
});
const creak = this._musicOsc(40, 'sawtooth', 0.022);
creak._baseGain=0.022;
this._pulse(creak.gain, 20, 0.16, 4.5);
const creak2 = this._musicOsc(28, 'sine', 0.012);
creak2._baseGain=0.012;
this._pulse(creak2.gain, 35, 0.10, 6.0);
const ctx2 = this.audioContext;
if(ctx2){
const pingNotes=[1108,932,1244,880,1046,880,932,1108];
let pingStep=0;
const pingOsc=this._musicOsc(pingNotes[0],'sine',0.001);
pingOsc._baseGain=0.001;
const pingSecs=[0.7,0.88,1.06];
const pingSchedAhead=0.3;
const pingCheckMs=25;
let pingStep2=0;
let nextPingTime=ctx2.currentTime+1.2;
const pingFn=()=>{
if(!pingOsc._pulseAlive) return;
try{
while(nextPingTime < ctx2.currentTime + pingSchedAhead){
const freq=pingNotes[pingStep2%pingNotes.length];
pingOsc.osc.frequency.setValueAtTime(freq, nextPingTime);
pingOsc.gain.gain.setValueAtTime(0.001*this.musicVolume, nextPingTime);
pingOsc.gain.gain.exponentialRampToValueAtTime(0.0001, nextPingTime+0.35);
nextPingTime+=pingSecs[pingStep2%3];
pingStep2++;
}
}catch(e){}
pingOsc._pulseTO=setTimeout(pingFn,pingCheckMs);
};
pingOsc._pulseAlive=true;
pingOsc._pulseTO=setTimeout(pingFn,0);
const sub=this._musicOsc(55,'triangle',0.014);
sub._baseGain=0.014;
this._pulse(sub.gain,90,0.07,8.0);
}
}
_music_night() {
const hb = this._musicOsc(60, 'sine', 0.001);
hb._baseGain=0.001;
this._pulse(hb.gain, 68, 0.28, 1.0);
const hb2 = this._musicOsc(50, 'sine', 0.001);
hb2._baseGain=0.001;
this._pulse(hb2.gain, 68, 0.18, 1.12);
const sub = this._musicOsc(30, 'sine', 0.05);
const sub2= this._musicOsc(60, 'triangle',0.025, 4);
const sub3= this._musicOsc(45, 'sine', 0.018,-3);
sub._baseGain=0.05; sub2._baseGain=0.025; sub3._baseGain=0.018;
const whistle = this._musicOsc(880, 'sine', 0.013, 0);
whistle._baseGain=0.013;
const ctx = this.audioContext;
if(ctx) {
const lfo = ctx.createOscillator();
const lfoG = ctx.createGain();
lfo.frequency.value = 0.12;
lfoG.gain.value = 30;
lfo.connect(lfoG); lfoG.connect(whistle.osc.frequency);
lfo.start();
this._musicNodes.push({osc:lfo, gain:lfoG, _baseGain:0});
}
const crackle = this._musicNoise(1200, 400, 0.008);
crackle._baseGain=0.008;
this._pulse(crackle.gain, 200, 0.04, 0.7);
}
_music_spaceship() {
const ctx = this.audioContext;
if(!ctx) return;
const orb = this._orb;
const thrum = this._musicOsc(55, 'sawtooth', 0.022);
thrum._baseGain=0.022;
const thrum2= this._musicOsc(110,'sawtooth', 0.014, 6);
thrum2._baseGain=0.014;
const eng = this._musicNoise(220, 100, 0.028);
eng._baseGain=0.028;
const arpNotes = [220, 261.6, 311.1, 369.9, 440, 369.9, 311.1, 261.6];
const arpBaseStep = 0.34;
const arpGainV = 0.022 * this.volume;
const arpAhead = 0.2;
let arpIdx = 0;
let arpNext = ctx.currentTime + 0.05;
let arpAlive = true;
const dest = () => this._musicBus || ctx.destination;
const playNote = (freq, when, stepS, gainMul) => {
const osc = ctx.createOscillator();
const env = ctx.createGain();
osc.type = 'square';
osc.frequency.value = freq;
env.gain.setValueAtTime(0, when);
env.gain.linearRampToValueAtTime(arpGainV*gainMul, when + 0.008);
env.gain.exponentialRampToValueAtTime(0.0001, when + 0.07);
osc.connect(env);
env.connect(dest());
osc.start(when);
osc.stop(when + stepS);
osc.onended = () => { try{ env.disconnect(); }catch(e){} };
};
const scheduleArp = () => {
if(!arpAlive) return;
while(arpNext < ctx.currentTime + arpAhead){
let stepS = arpBaseStep;
try {
let notes = arpNotes, p = 0;
if(orb){
p = orb.pressure;
stepS = arpBaseStep / (1 + p*0.4);
if(orb.halfTempo) stepS *= 2;
if(orb.dead > 0){
const uniq = [...new Set(arpNotes)].sort((x,y)=>y-x);
const gone = new Set(uniq.slice(0, Math.min(orb.dead, 3)));
notes = arpNotes.filter(f=>!gone.has(f));
}
}
const muted = orb && (orb.arpDead || performance.now() < orb.silenceUntil);
let skip = false;
if(orb && !muted){
skip = Math.random() < Math.max(0, p-0.15)*0.45;
}
if(!muted && !skip){
const f = notes[arpIdx % notes.length];
playNote(f, arpNext, stepS, 1);
if(orb && p > 0.5) playNote(f*1.004, arpNext, stepS, Math.min(1,(p-0.5)*2)*0.8);
}
if(orb && p > 0.6 && !muted && Math.random() < 0.2) arpIdx--;
} catch(e) {}
arpNext += stepS;
arpIdx++;
}
arpAlive && (this._arpRAF = requestAnimationFrame(scheduleArp));
};
scheduleArp();
this._musicNodes.push({
osc: { stop: ()=>{}, disconnect: ()=>{} },
gain: { gain: { value: 0 }, disconnect: ()=>{} },
_baseGain: 0,
_arpCleanup: true,
_stopArp: () => {
arpAlive = false;
cancelAnimationFrame(this._arpRAF);
arpIdx = 0;
arpNext = undefined;
}
});
const ping = this._musicOsc(1760, 'sine', 0.007);
ping._baseGain=0.007;
this._pulse(ping.gain, 60, 0.04, 2.0);
const pulse = this._musicOsc(40, 'sine', 0.035);
pulse._baseGain=0.035;
this._pulse(pulse.gain, 80, 0.12, 1.0);
if(orb){
const sub = this._musicOsc(32, 'sine', 0.0001);
sub._baseGain = 0.0001;
const leak = this._musicNoise(3200, 1400, 0.0001);
leak._baseGain = 0.0001;
orb.nodes = {thrum, thrum2, eng, ping, pulse, sub, leak};
}
}
_music_mars() {
const ctx = this.audioContext;
const wind = this._musicNoise(3500, 1000, 0.018);
wind._baseGain=0.018;
const wind2 = this._musicNoise(800, 400, 0.012);
wind2._baseGain=0.012;
const d1 = this._musicOsc(55, 'sine', 0.04);
const d2 = this._musicOsc(77.8,'sine', 0.03, 8);
const d3 = this._musicOsc(38, 'triangle',0.025,-5);
d1._baseGain=0.04; d2._baseGain=0.03; d3._baseGain=0.025;
const dust = this._musicNoise(1800, 600, 0.001);
dust._baseGain=0.001;
this._pulse(dust.gain, 55, 0.09, 1.4);
[311, 415, 554].forEach((f,i)=>{
const n = this._musicOsc(f, 'triangle', 0.009-i*0.002, i*15);
n._baseGain=0.009-i*0.002;
this._pulse(n.gain, 30+i*7, 0.065, 2.2+i*0.5);
});
if(ctx) {
const lfo = ctx.createOscillator();
const lfoG = ctx.createGain();
lfo.frequency.value = 0.07; lfoG.gain.value = 0.015 * this.volume;
lfo.connect(lfoG); lfoG.connect(ctx.destination);
lfo.start();
this._musicNodes.push({osc:lfo, gain:lfoG, _baseGain:0.015});
}
}
_boss_spider() {
const scratch = this._musicNoise(600, 400, 0.001, this._bossNodes);
scratch._baseGain=0.001;
this._pulse(scratch.gain, 480, 0.30, 0.25);
const scratch2 = this._musicNoise(1200, 500, 0.001, this._bossNodes);
scratch2._baseGain=0.001;
this._pulse(scratch2.gain, 360, 0.18, 0.33);
const bass = this._musicOsc(55,'sawtooth',0.04,0,this._bossNodes);
bass._baseGain=0.04;
this._pulse(bass.gain, 120, 0.22, 0.5);
const sting = this._musicOsc(880,'square',0.018,0,this._bossNodes);
sting._baseGain=0.018;
this._pulse(sting.gain, 240, 0.09, 0.75);
const drone = this._musicOsc(220,'sawtooth',0.025,8,this._bossNodes);
drone._baseGain=0.025;
}
_boss_default() {
const b1 = this._musicOsc(55, 'sawtooth', 0.06, 0, this._bossNodes);
const b2 = this._musicOsc(110, 'sawtooth', 0.03, 5, this._bossNodes);
b1._baseGain=0.06; b2._baseGain=0.03;
this._pulse(b1.gain, 100, 0.14, 1.0);
const alarm = this._musicOsc(440,'square',0.018,0,this._bossNodes);
alarm._baseGain=0.018;
this._pulse(alarm.gain, 200, 0.06, 0.5);
}
_boss_commander() {
const snare = this._musicNoise(1000, 600, 0.001, this._bossNodes);
snare._baseGain=0.001;
this._pulse(snare.gain, 160, 0.22, 1.0);
const kick = this._musicOsc(60, 'sine', 0.001, 0, this._bossNodes);
kick._baseGain=0.001;
this._pulse(kick.gain, 80, 0.3, 1.0);
const march = this._musicOsc(220,'square',0.02,0,this._bossNodes);
march._baseGain=0.02;
this._pulse(march.gain, 160, 0.1, 1.0);
const bass = this._musicOsc(55,'sawtooth',0.04,0,this._bossNodes);
bass._baseGain=0.04;
}
_boss_cars() {
const rev = this._musicNoise(300, 200, 0.04, this._bossNodes);
rev._baseGain=0.04;
this._pulse(rev.gain, 180, 0.15, 0.75);
const bass = this._musicOsc(80,'sawtooth',0.045,0,this._bossNodes);
bass._baseGain=0.045;
this._pulse(bass.gain, 120, 0.18, 1.0);
const squeal = this._musicNoise(2200, 400, 0.012, this._bossNodes);
squeal._baseGain=0.012;
this._pulse(squeal.gain, 360, 0.06, 0.33);
}
_boss_helicopter() {
const rotor = this._musicNoise(180, 80, 0.001, this._bossNodes);
rotor._baseGain=0.001;
this._pulse(rotor.gain, 480, 0.35, 0.5);
const rotor2= this._musicNoise(90, 40, 0.001, this._bossNodes);
rotor2._baseGain=0.001;
this._pulse(rotor2.gain, 240, 0.28, 1.0);
const wail = this._musicOsc(660,'sawtooth',0.022,0,this._bossNodes);
wail._baseGain=0.022;
this._pulse(wail.gain, 100, 0.07, 1.5);
const sub = this._musicOsc(55,'sine',0.05,0,this._bossNodes);
sub._baseGain=0.05;
}
_boss_tank() {
const grind = this._musicNoise(150, 100, 0.05, this._bossNodes);
grind._baseGain=0.05;
this._pulse(grind.gain, 60, 0.28, 1.0);
const thud = this._musicOsc(40,'sine',0.001,0,this._bossNodes);
thud._baseGain=0.001;
this._pulse(thud.gain, 60, 0.40, 1.0);
const metal = this._musicNoise(800, 300, 0.018, this._bossNodes);
metal._baseGain=0.018;
this._pulse(metal.gain, 120, 0.10, 2.0);
const bass = this._musicOsc(55,'sawtooth',0.04,0,this._bossNodes);
bass._baseGain=0.04;
}
_boss_alien() {
const ctx = this.audioContext;
const a1 = this._musicOsc(311,'sine',0.035,0,this._bossNodes);
a1._baseGain=0.035;
const a2 = this._musicOsc(415,'sine',0.025,0,this._bossNodes);
a2._baseGain=0.025;
const a3 = this._musicOsc(233,'sine',0.02,0,this._bossNodes);
a3._baseGain=0.02;
if(ctx) {
[a1,a2,a3].forEach((n,i)=>{
const lfo = ctx.createOscillator();
const lfoG= ctx.createGain();
lfo.frequency.value = 3+i*1.3; lfoG.gain.value = 12+i*5;
lfo.connect(lfoG); lfoG.connect(n.osc.frequency);
lfo.start();
this._bossNodes.push({osc:lfo, gain:lfoG, _baseGain:0});
});
}
const zap = this._musicNoise(1400, 400, 0.012, this._bossNodes);
zap._baseGain=0.012;
this._pulse(zap.gain, 140, 0.09, 0.7);
const sub = this._musicOsc(55,'sine',0.04,0,this._bossNodes);
sub._baseGain=0.04;
this._pulse(sub.gain, 70, 0.15, 1.4);
}
_boss_jet() {
const jet = this._musicNoise(2800, 1200, 0.038, this._bossNodes);
jet._baseGain=0.038;
const jet2= this._musicNoise(1200, 500, 0.025, this._bossNodes);
jet2._baseGain=0.025;
const bass = this._musicOsc(55,'sawtooth',0.05,0,this._bossNodes);
bass._baseGain=0.05;
this._pulse(bass.gain, 140, 0.22, 0.75);
const stab = this._musicOsc(880,'square',0.02,0,this._bossNodes);
stab._baseGain=0.02;
this._pulse(stab.gain, 280, 0.08, 0.5);
}
_boss_harmtug() {
const bass1 = this._musicOsc(40,'sawtooth',0.055,0,this._bossNodes);
bass1._baseGain=0.055;
this._pulse(bass1.gain, 70, 0.28, 1.0);
const bass2 = this._musicOsc(41.5,'sawtooth',0.04,0,this._bossNodes);
bass2._baseGain=0.04;
const glitch1 = this._musicNoise(800, 600, 0.001, this._bossNodes);
glitch1._baseGain=0.001;
this._pulse(glitch1.gain, 220, 0.35, 0.45);
const glitch2 = this._musicNoise(3200, 800, 0.001, this._bossNodes);
glitch2._baseGain=0.001;
this._pulse(glitch2.gain, 330, 0.22, 0.33);
const siren = this._musicOsc(660,'sawtooth',0.025,0,this._bossNodes);
siren._baseGain=0.025;
this._pulse(siren.gain, 90, 0.12, 1.5);
const sub = this._musicOsc(28,'sine',0.06,0,this._bossNodes);
sub._baseGain=0.06;
const whine = this._musicOsc(1760,'sine',0.012,0,this._bossNodes);
whine._baseGain=0.012;
this._pulse(whine.gain, 180, 0.04, 2.0);
}
_rt(ctx,t,freq,dur,type,gain,freqEnd){
const o=ctx.createOscillator(),g=ctx.createGain();
o.type=type;const t0=ctx.currentTime+t;
o.frequency.setValueAtTime(freq,t0);
if(freqEnd)o.frequency.exponentialRampToValueAtTime(freqEnd,t0+dur);
g.gain.setValueAtTime(0.0001,t0);
g.gain.linearRampToValueAtTime(gain*this.volume,t0+Math.min(0.004,dur*0.1));
g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
o.connect(g);g.connect(ctx.destination);o.start(t0);o.stop(t0+dur+0.02);
}
_rn(ctx,t,dur,gain,freq,q){
const src=ctx.createBufferSource();src.buffer=this._getNoiseBuffer(ctx,dur);
const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=freq;if(q)f.Q.value=q;
const g=ctx.createGain();const t0=ctx.currentTime+t;
g.gain.setValueAtTime(0.0001,t0);
g.gain.linearRampToValueAtTime(gain*this.volume,t0+Math.min(0.004,dur*0.1));
g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
src.connect(f);f.connect(g);g.connect(ctx.destination);src.start(t0);
}
reloadStart(wk) {
wk=wk||(typeof $buildings!=="undefined"&&$buildings?$buildings.curWep:"rifle");
this._play(ctx => {
if(wk==='minigun'){
this._rt(ctx,0,70,0.5,'sawtooth',0.05,230);
this._rn(ctx,0,0.12,0.12,900,1);
this._rt(ctx,0,140,0.08,'square',0.07,70);
} else if(wk==='laser'||wk==='plasmacutter'){
this._rt(ctx,0,1000,0.2,'sine',0.07,180);
this._rn(ctx,0,0.08,0.06,3000,2);
} else if(wk==='flamethrower'){
this._rn(ctx,0,0.25,0.12,700,0.7);
this._rt(ctx,0,120,0.1,'square',0.05,80);
} else if(wk==='shotgun'||wk==='rpg'){
this._rt(ctx,0,130,0.09,'square',0.09,60);
this._rn(ctx,0,0.06,0.14,1200,1);
} else {
this._rt(ctx,0,190,0.07,'square',0.08,85);
this._rn(ctx,0,0.05,0.16,2200,1.5);
this._rt(ctx,0.05,1500,0.025,'triangle',0.04,900);
}
});
}
reloadMid(wk) {
wk=wk||(typeof $buildings!=="undefined"&&$buildings?$buildings.curWep:"rifle");
this._play(ctx => {
if(wk==='shotgun'){
for(let i=0;i<3;i++){this._rt(ctx,i*0.1,1500+i*120,0.04,'triangle',0.07,900);this._rn(ctx,i*0.1,0.03,0.08,2600,2);}
} else if(wk==='minigun'){
for(let i=0;i<5;i++){this._rt(ctx,i*0.045,2200,0.012,'square',0.04,1500);this._rn(ctx,i*0.045,0.015,0.07,3200,2);}
} else if(wk==='laser'||wk==='plasmacutter'){
this._rt(ctx,0,260,0.4,'sine',0.06,1500);
this._rt(ctx,0,130,0.4,'triangle',0.04,750);
} else if(wk==='flamethrower'){
this._rt(ctx,0,400,0.08,'square',0.05,200);this._rt(ctx,0.12,400,0.08,'square',0.05,200);
this._rn(ctx,0,0.2,0.07,600,0.7);
} else if(wk==='rpg'){
this._rt(ctx,0,110,0.14,'square',0.1,55);this._rn(ctx,0,0.1,0.12,500,1);
} else {
this._rt(ctx,0,280,0.06,'square',0.09,120);
this._rn(ctx,0,0.04,0.14,1800,1.5);
this._rt(ctx,0.03,2000,0.02,'triangle',0.04,1200);
}
});
}
reloadDone(wk) {
wk=wk||(typeof $buildings!=="undefined"&&$buildings?$buildings.curWep:"rifle");
this._play(ctx => {
if(wk==='shotgun'){
this._rn(ctx,0,0.05,0.15,1400,1);this._rt(ctx,0,300,0.06,'square',0.09,140);
this._rn(ctx,0.11,0.06,0.17,1000,1);this._rt(ctx,0.11,200,0.08,'square',0.11,90);
} else if(wk==='laser'||wk==='plasmacutter'){
this._rt(ctx,0,880,0.09,'sine',0.08,1100);this._rt(ctx,0.08,1320,0.16,'sine',0.08,1500);
} else if(wk==='minigun'){
this._rt(ctx,0,260,0.25,'sawtooth',0.04,60);
this._rt(ctx,0.1,150,0.1,'square',0.12,60);this._rn(ctx,0.1,0.07,0.15,800,1);
} else if(wk==='flamethrower'){
this._rt(ctx,0,300,0.06,'square',0.07,500);this._rn(ctx,0.02,0.12,0.1,1500,0.8);
this._rt(ctx,0.1,660,0.1,'sine',0.05,880);
} else if(wk==='rpg'){
this._rt(ctx,0,90,0.18,'square',0.13,45);this._rn(ctx,0,0.12,0.14,600,1);
this._rt(ctx,0.14,1000,0.07,'sine',0.05,1250);
} else {
this._rn(ctx,0,0.06,0.15,2600,1.2);this._rt(ctx,0,950,0.03,'square',0.07,600);
this._rt(ctx,0.07,420,0.07,'square',0.11,170);this._rn(ctx,0.07,0.05,0.14,1200,1);
this._rt(ctx,0.16,1320,0.09,'sine',0.045,1580);
}
});
}
lowAmmo() {
this._play(ctx => { this._rt(ctx,0,1900,0.03,'square',0.035,1500); });
}
fire(weaponType) {
let _fireMinGap = 0;
if(typeof isUltraLow !== 'undefined' && isUltraLow) _fireMinGap = 38;
else if(typeof isLowEndDesktop !== 'undefined' && isLowEndDesktop) _fireMinGap = 20;
if(_fireMinGap){
const now = performance.now();
const throttleKey = 'fire_' + weaponType;
if(this._lastPlay[throttleKey] && now - this._lastPlay[throttleKey] < _fireMinGap) return;
this._lastPlay[throttleKey] = now;
}
const releaseVoice = this._tryBeginVoice(0.12);
if(!releaseVoice) return;
this._play(ctx => {
const pv = 0.92 + Math.random()*0.16;
if(weaponType === 'rifle') {
this._noise(0.07, 0.34); this._tone(140*pv, 0.09, 'sawtooth', 0.1, 65*pv, releaseVoice);
} else if(weaponType === 'shotgun') {
this._noise(0.12, 0.5); this._tone(90*pv, 0.12, 'sawtooth', 0.12, 50*pv, releaseVoice);
} else if(weaponType === 'smg') {
this._noise(0.03, 0.15); this._tone(320*pv, 0.035, 'square', 0.055, 200*pv, releaseVoice);
} else if(weaponType === 'knife') {
this._tone(600*pv, 0.06, 'sine', 0.08, 200*pv, releaseVoice);
} else if(weaponType === 'grenade_throw') {
this._tone(300*pv, 0.1, 'sine', 0.07, 150*pv, releaseVoice);
} else if(weaponType === 'minigun') {
this._noise(0.03, 0.25); this._tone(280*pv, 0.03, 'sawtooth', 0.06, 200*pv, releaseVoice);
} else if(weaponType === 'flamethrower') {
this._noise(0.05, 0.28);
this._tone(120*pv, 0.05, 'sawtooth', 0.07, 80*pv, releaseVoice);
} else if(weaponType === 'rpg') {
const now = ctx.currentTime;
const oscR = ctx.createOscillator(); const gR = ctx.createGain();
oscR.type='sawtooth'; oscR.frequency.setValueAtTime(60,now); oscR.frequency.exponentialRampToValueAtTime(30,now+0.2);
gR.gain.setValueAtTime(0.0001,now); gR.gain.linearRampToValueAtTime(0.18*this.volume,now+0.005);
gR.gain.exponentialRampToValueAtTime(0.001,now+0.2);
oscR.connect(gR); gR.connect(ctx.destination); oscR.start(now); oscR.stop(now+0.21);
const bufR = this._getNoiseBuffer(ctx, 0.18);
const srcR = ctx.createBufferSource(); srcR.buffer=bufR;
const fR = ctx.createBiquadFilter(); fR.type='bandpass'; fR.frequency.value=400;
const gR2 = ctx.createGain();
gR2.gain.setValueAtTime(0.0001,now); gR2.gain.linearRampToValueAtTime(0.6*this.volume,now+0.005);
gR2.gain.exponentialRampToValueAtTime(0.001,now+0.18);
srcR.connect(fR); fR.connect(gR2); gR2.connect(ctx.destination); srcR.start(now);
const bufR3 = this._getNoiseBuffer(ctx, 0.1);
const srcR3 = ctx.createBufferSource(); srcR3.buffer=bufR3;
const fR3 = ctx.createBiquadFilter(); fR3.type='bandpass'; fR3.frequency.value=350;
const gR3 = ctx.createGain();
gR3.gain.setValueAtTime(0.0001,now+0.1); gR3.gain.linearRampToValueAtTime(0.3*this.volume,now+0.105);
gR3.gain.exponentialRampToValueAtTime(0.001,now+0.2);
srcR3.connect(fR3); fR3.connect(gR3); gR3.connect(ctx.destination); srcR3.start(now+0.1);
srcR3.onended = releaseVoice;
}
});
}
explosion() {
this._throttled('explosion', ()=>{
const releaseVoice = this._tryBeginVoice(0.5);
if(!releaseVoice) return;
this._play(ctx => {
const now = ctx.currentTime;
const buf1 = this._getNoiseBuffer(ctx, 0.5);
const src1 = ctx.createBufferSource(); src1.buffer = buf1;
const f1 = ctx.createBiquadFilter(); f1.type='bandpass'; f1.frequency.value=400;
const g1 = ctx.createGain();
g1.gain.setValueAtTime(0.0001, now); g1.gain.linearRampToValueAtTime(0.8*this.volume, now+0.005);
g1.gain.exponentialRampToValueAtTime(0.001, now+0.5);
src1.connect(f1); f1.connect(g1); g1.connect(ctx.destination); src1.start(now);
const osc = ctx.createOscillator(); const go = ctx.createGain();
osc.type='sawtooth'; osc.frequency.setValueAtTime(60,now); osc.frequency.exponentialRampToValueAtTime(30,now+0.4);
go.gain.setValueAtTime(0.0001,now); go.gain.linearRampToValueAtTime(0.2*this.volume,now+0.005);
go.gain.exponentialRampToValueAtTime(0.001,now+0.4);
osc.connect(go); go.connect(ctx.destination); osc.start(now); osc.stop(now+0.41);
const buf2 = this._getNoiseBuffer(ctx, 0.3);
const src2 = ctx.createBufferSource(); src2.buffer = buf2;
const f2 = ctx.createBiquadFilter(); f2.type='bandpass'; f2.frequency.value=300;
const g2 = ctx.createGain();
g2.gain.setValueAtTime(0.0001, now+0.08); g2.gain.linearRampToValueAtTime(0.4*this.volume, now+0.085);
g2.gain.exponentialRampToValueAtTime(0.001, now+0.38);
src2.connect(f2); f2.connect(g2); g2.connect(ctx.destination); src2.start(now+0.08);
src2.onended = releaseVoice;
/* duck the music bus under the blast, then swell back (skipped while the orbital score is hard-muted) */
if(this._musicBus && !(this._orb && this._orb.silenceUntil > performance.now())){
const bg = this._musicBus.gain;
bg.cancelScheduledValues(now);
bg.setTargetAtTime(0.35, now, 0.04);
bg.setTargetAtTime(1.0, now + 0.18, 0.35);
}
});
});
}
footstep() {
if(this._getMaxVoices() < 14) return;   /* never spend scarce voices on footsteps on weak devices */
const releaseVoice = this._tryBeginVoice(0.05);
if(!releaseVoice) return;
this._play(() => {
const pv = 0.9 + Math.random()*0.2;
this._noise(0.035, 0.05);
this._tone(70*pv, 0.03, 'sine', 0.04, 50*pv, releaseVoice);
});
}
hit(weight = 0) {
this._throttled('hit', ()=>{
const releaseVoice = this._tryBeginVoice(0.05);
if(!releaseVoice) return;
this._play(() => {
const pv = 0.85 + Math.random()*0.3;
this._noise(weight > 0 ? 0.06 : 0.04, weight > 0 ? 0.28 : 0.2);
this._tone((weight > 0 ? 250 : 350)*pv, 0.05, 'square', weight > 0 ? 0.09 : 0.06, 200*pv, releaseVoice);
});
});
}
pickup(type) {
this._play(ctx => {
const now = ctx.currentTime;
const vol = this.volume;
if(type==='health'){
const freqs=[440,660,880]; const delays=[0,0.08,0.18];
freqs.forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f; g.gain.setValueAtTime(0.0001,now+delays[i]); g.gain.linearRampToValueAtTime(0.09*vol,now+delays[i]+0.004); g.gain.exponentialRampToValueAtTime(0.001,now+delays[i]+0.1); o.connect(g);g.connect(ctx.destination);o.start(now+delays[i]);o.stop(now+delays[i]+0.11); });
} else if(type==='shield'){
[{f:300,t:0},{f:600,t:0.07}].forEach(({f,t})=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type=t?'sine':'square'; o.frequency.value=f; g.gain.setValueAtTime(0.0001,now+t); g.gain.linearRampToValueAtTime(0.07*vol,now+t+0.004); g.gain.exponentialRampToValueAtTime(0.001,now+t+(t?0.1:0.05)); o.connect(g);g.connect(ctx.destination);o.start(now+t);o.stop(now+t+(t?0.11:0.06)); });
} else if(type==='rapid'){
[{f:500,t:0},{f:750,t:0.06},{f:1000,t:0.12}].forEach(({f,t})=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='square'; o.frequency.value=f; g.gain.setValueAtTime(0.0001,now+t); g.gain.linearRampToValueAtTime(0.08*vol,now+t+0.004); g.gain.exponentialRampToValueAtTime(0.001,now+t+0.06); o.connect(g);g.connect(ctx.destination);o.start(now+t);o.stop(now+t+0.07); });
} else {
[{f:500,t:0},{f:700,t:0.08}].forEach(({f,t})=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f; g.gain.setValueAtTime(0.0001,now+t); g.gain.linearRampToValueAtTime(0.08*vol,now+t+0.004); g.gain.exponentialRampToValueAtTime(0.001,now+t+0.1); o.connect(g);g.connect(ctx.destination);o.start(now+t);o.stop(now+t+0.11); });
}
});
}
bomberWarning(){ this._play(ctx => {
const now=ctx.currentTime, vol=this.volume;
for(let i=0;i<3;i++){ const t=now+i*0.14; const o=ctx.createOscillator(),g=ctx.createGain(); o.type='square'; o.frequency.value=880; g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.1*vol,t+0.004); g.gain.exponentialRampToValueAtTime(0.001,t+0.06); o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+0.07); }
}); }
bomberBeep(proximity, scheduleAt){
if(!this.enabled) return;
const ctx = this._ensureCtx();
if(!ctx) return;
const freq = 600 + proximity * 800;
const vol = (0.04 + proximity * 0.08) * this.volume;
const dur = 0.04 + (1 - proximity) * 0.04;
const t = (scheduleAt !== undefined && scheduleAt > ctx.currentTime) ? scheduleAt : ctx.currentTime;
const osc = ctx.createOscillator();
const g = ctx.createGain();
osc.type = 'square';
osc.frequency.value = freq;
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(vol, t + 0.003);
g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
osc.connect(g); g.connect(ctx.destination);
osc.start(t);
osc.stop(t + dur + 0.01);
return t + dur;
}
waveStart() { this._play(ctx => {
const now=ctx.currentTime,vol=this.volume;
[{f:350,t:0},{f:500,t:0.18}].forEach(({f,t})=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='square'; o.frequency.value=f; g.gain.setValueAtTime(0.0001,now+t);g.gain.linearRampToValueAtTime(0.07*vol,now+t+0.004);g.gain.exponentialRampToValueAtTime(0.001,now+t+0.15);o.connect(g);g.connect(ctx.destination);o.start(now+t);o.stop(now+t+0.16); });
}); }
bossWarning(){ this._play(ctx => {
const now=ctx.currentTime,vol=this.volume;
for(let i=0;i<3;i++){ const t=now+i*0.22; const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sawtooth'; o.frequency.value=80; g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.15*vol,t+0.005);g.gain.exponentialRampToValueAtTime(0.001,t+0.3);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+0.31); }
}); }
death() { this._play(ctx => {
const now=ctx.currentTime,vol=this.volume;
const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(200,now); o.frequency.exponentialRampToValueAtTime(60,now+0.4); g.gain.setValueAtTime(0.0001,now);g.gain.linearRampToValueAtTime(0.12*vol,now+0.005);g.gain.exponentialRampToValueAtTime(0.001,now+0.4);o.connect(g);g.connect(ctx.destination);o.start(now);o.stop(now+0.41);
const buf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.5),ctx.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
const src=ctx.createBufferSource();src.buffer=buf;const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=400;
const gn=ctx.createGain();gn.gain.setValueAtTime(0.0001,now+0.1);gn.gain.linearRampToValueAtTime(0.3*vol,now+0.105);gn.gain.exponentialRampToValueAtTime(0.001,now+0.6);
src.connect(f);f.connect(gn);gn.connect(ctx.destination);src.start(now+0.1);
}); }
levelUp() { this._play(ctx => {
const now=ctx.currentTime,vol=this.volume;
[400,500,650,800].forEach((f,i)=>{ const t=now+i*0.08; const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f; g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.1*vol,t+0.004);g.gain.exponentialRampToValueAtTime(0.001,t+0.15);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+0.16); });
}); }
upgradeConfirm(){ this._play(ctx => {
const now=ctx.currentTime,vol=this.volume;
[{f:880,t:0},{f:1100,t:0.055}].forEach(({f,t})=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f; g.gain.setValueAtTime(0.0001,now+t);g.gain.linearRampToValueAtTime((t?0.07:0.09)*vol,now+t+0.004);g.gain.exponentialRampToValueAtTime(0.001,now+t+(t?0.09:0.06));o.connect(g);g.connect(ctx.destination);o.start(now+t);o.stop(now+t+(t?0.1:0.07)); });
}); }
streakSound(n){ this._play(() => { this._tone(300 + n*40, 0.12, 'square', 0.09, 600 + n*50); }); }
allySpawn() { this._play(ctx => {
const now=ctx.currentTime,vol=this.volume;
[{f:440,t:0},{f:660,t:0.12}].forEach(({f,t})=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f; g.gain.setValueAtTime(0.0001,now+t);g.gain.linearRampToValueAtTime(0.08*vol,now+t+0.004);g.gain.exponentialRampToValueAtTime(0.001,now+t+0.15);o.connect(g);g.connect(ctx.destination);o.start(now+t);o.stop(now+t+0.16); });
}); }
dailyChallengeComplete() {
if (!this.enabled) return;
const ctx = this._ensureCtx();
if (!ctx) return;
const vol = this.volume;
const notes = [523, 659, 784, 1047];
notes.forEach((freq, i) => {
const osc = ctx.createOscillator();
const gain = ctx.createGain();
osc.type = 'triangle';
osc.frequency.value = freq;
const startTime = ctx.currentTime + i * 0.12;
const endTime = startTime + 0.25;
gain.gain.setValueAtTime(0, startTime);
gain.gain.linearRampToValueAtTime(0.12 * vol, startTime + 0.02);
gain.gain.exponentialRampToValueAtTime(0.001, endTime);
osc.connect(gain);
gain.connect(ctx.destination);
osc.start(startTime);
osc.stop(endTime);
});
const sparkle = ctx.createOscillator();
const sgain = ctx.createGain();
sparkle.type = 'sine';
sparkle.frequency.value = 1760;
const sTime = ctx.currentTime + 0.48;
sgain.gain.setValueAtTime(0, sTime);
sgain.gain.linearRampToValueAtTime(0.08 * vol, sTime + 0.01);
sgain.gain.exponentialRampToValueAtTime(0.001, sTime + 0.4);
sparkle.connect(sgain);
sgain.connect(ctx.destination);
sparkle.start(sTime);
sparkle.stop(sTime + 0.5);
}
death_enemy(type='soldier', isBoss=false) {
this._throttled('death_enemy', ()=>{
this._play(() => {
const ctx = this.audioContext;
const now = ctx.currentTime;
const vol = isBoss ? 0.38 : type==='heavy'||type==='berserker' ? 0.28 : 0.22;
const pitchVar = 0.88 + Math.random()*0.24;
const bufLen = ctx.sampleRate * 0.08;
const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
const data = buf.getChannelData(0);
for(let i=0;i<bufLen;i++) data[i]=(Math.random()*2-1)*Math.pow(1-i/bufLen,3);
const src = ctx.createBufferSource();
src.buffer = buf;
src.playbackRate.value = pitchVar;
const hp = ctx.createBiquadFilter();
hp.type = 'highpass';
hp.frequency.value = (type==='heavy'?800:1800) * pitchVar;
const gainN = ctx.createGain();
gainN.gain.setValueAtTime(vol*2.5, now);
gainN.gain.exponentialRampToValueAtTime(0.001, now+0.08);
src.connect(hp);hp.connect(gainN);gainN.connect(ctx.destination);
src.start(now);
const osc = ctx.createOscillator();
osc.type = 'sine';
const startFreq = (type==='heavy'?220:type==='berserker'?200:180) * pitchVar;
osc.frequency.setValueAtTime(startFreq, now);
osc.frequency.exponentialRampToValueAtTime(40*pitchVar, now+0.15);
const gainO = ctx.createGain();
gainO.gain.setValueAtTime(vol*1.8, now);
gainO.gain.exponentialRampToValueAtTime(0.001, now+0.18);
osc.connect(gainO);gainO.connect(ctx.destination);
osc.start(now);osc.stop(now+0.2);
if(isBoss){
const oscB = ctx.createOscillator();
oscB.type = 'sawtooth';
oscB.frequency.setValueAtTime(120*pitchVar, now+0.02);
oscB.frequency.exponentialRampToValueAtTime(25*pitchVar, now+0.25);
const gainB = ctx.createGain();
gainB.gain.setValueAtTime(0.45, now+0.02);
gainB.gain.exponentialRampToValueAtTime(0.001, now+0.3);
oscB.connect(gainB);gainB.connect(ctx.destination);
oscB.start(now+0.02);oscB.stop(now+0.32);
}
});
});
}
uiClick() { this._play(() => { this._tone(440, 0.05, 'square', 0.06, 480); }); }
uiBack() { this._play(() => { this._tone(320, 0.06, 'square', 0.05, 280); }); }
toggle() {
this.enabled = !this.enabled;
return this.enabled;
}
}
const audioManager = new AudioManager();

window.audioManager = audioManager;