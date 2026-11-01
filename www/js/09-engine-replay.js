window.__engine.files.push(function* replay() {
const $buildings = window.__engine.buildings;
const $core = window.__engine.core;
const $psycho1 = window.__engine.psycho1;
const $replay = window.__engine.replay;
Object.assign($replay, { _getRenderScale, isMenuSurfaceOpen, resize });
yield;


const ReplayRecorder = (()=>{
  const BUFFER_SECONDS = 10;
  const POST_SECONDS = 2.5;
  const TIMESLICE_MS = 1000;
  const MAX_CLIPS = 24;
  const MIN_GAP_MS = 3000;
  const CAPTURE_FPS = ($core.isMobile || $core.isLowEndDesktop || $core.isUltraLow) ? 12 : 24;

  let recorder = null, mediaStream = null, chunks = [], clips = [], pending = [];
  let clipIdSeq = 0, lastCaptureAt = {}, enabled = true, runStartTs = 0;
  const supported = (typeof MediaRecorder !== 'undefined') &&
                     (typeof $core.canvas.captureStream === 'function');

const _rrLowMem = $core.isUltraLow;
try{
    const saved = localStorage.getItem('diy_set_replaycap');
    enabled = saved !== null ? (saved === '1') : !_rrLowMem;
  }catch(e){ enabled = !_rrLowMem; }

  function pickMime(withAudio){
    const opts = withAudio
      ? ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm']
      : ['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];
    for(const m of opts){ try{ if(MediaRecorder.isTypeSupported(m)) return m; }catch(e){} }
    return '';
  }

const RESTART_INTERVAL_MS = 14000;
  let currentGen = 0, genStartTs = 0, _restartTimer = null, _restartDue = false;

  function startRecorderInstance(){
    currentGen++;
    genStartTs = Date.now();
    const myGen = currentGen;
    mediaStream = $core.canvas.captureStream(CAPTURE_FPS);
    const mime = pickMime();
    recorder = new MediaRecorder(mediaStream, mime ? {mimeType:mime, videoBitsPerSecond:1800000} : {videoBitsPerSecond:1800000});
    recorder.ondataavailable = (e)=>{
      if(e.data && e.data.size>0){
        chunks.push({blob:e.data, t:Date.now(), gen:myGen});
        trim();
        settle();
      }
    };
    recorder.start(TIMESLICE_MS);
  }

  function doRestart(){
    try{ const old = recorder; recorder = null; if(old){ old.ondataavailable = null; old.stop(); } }catch(e){}
    try{ if(mediaStream){ mediaStream.getTracks().forEach(t=>t.stop()); } }catch(e){}
    startRecorderInstance();
  }

  function init(){
    runStartTs = Date.now();
    if(!supported || !enabled || recorder) return;
    try{
      startRecorderInstance();
      _restartTimer = setInterval(()=>{
        if(pending.some(p=>p.gen===currentGen)){ _restartDue = true; return; }
        doRestart();
      }, RESTART_INTERVAL_MS);
      const btn = document.getElementById('replay-gallery-btn');
      if(btn) btn.style.display = 'flex';
    }catch(err){
      console.warn('Highlight replay capture unavailable:', err);
    }
  }

  function stop(){
    if(_restartTimer){ clearInterval(_restartTimer); _restartTimer = null; }
    if(recorder){
      try{ recorder.stop(); }catch(e){}
      recorder = null;
    }
    if(mediaStream){
      try{ mediaStream.getTracks().forEach(t=>t.stop()); }catch(e){}
      mediaStream = null;
    }
    chunks = [];
    pending = [];
    _restartDue = false;
  }

  function setEnabled(on){
    enabled = on;
    try{ localStorage.setItem('diy_set_replaycap', on ? '1' : '0'); }catch(e){}
    if(!on){
      stop();
    } else if($buildings.state === 'playing'){
      init();
    }
  }

  function trim(){
    const cutoff = Date.now() - (BUFFER_SECONDS + POST_SECONDS + 3) * 1000;
    while(chunks.length && chunks[0].t < cutoff) chunks.shift();
  }

  function settle(){
    const now = Date.now();
    pending = pending.filter(p=>{
      if(now >= p.endTime){ finalize(p); return false; }
      return true;
    });
    if(_restartDue && !pending.some(p=>p.gen===currentGen)){
      _restartDue = false;
      doRestart();
    }
  }

  function finalize(p){
    const blobs = chunks.filter(c=>c.gen===p.gen && c.t>=p.startTime && c.t<=p.endTime+TIMESLICE_MS).map(c=>c.blob);
    if(!blobs.length) return;
    const blob = new Blob(blobs, {type: blobs[0].type || 'video/webm'});
    if(blob.size < 2000) return;
    const url = URL.createObjectURL(blob);
    clips.unshift({id:++clipIdSeq, url, blob, label:p.label, type:p.captureType, ts:p.triggerTime, poster:p.poster});
    while(clips.length > MAX_CLIPS){
      const old = clips.pop();
      URL.revokeObjectURL(old.url);
    }
    updateBadge();
    toast('Highlight saved: ' + p.label);
    if(document.getElementById('replay-modal').classList.contains('active')) renderGallery();
  }

  let _posterCanvas = null, _posterCtx = null;
  function grabPoster(){
    try{
      const THUMB_W = 320;
      const scale = THUMB_W / $core.canvas.width;
      const w = THUMB_W, h = Math.round($core.canvas.height * scale);
      if(!_posterCanvas){ _posterCanvas = document.createElement('canvas'); _posterCtx = _posterCanvas.getContext('2d'); }
      if(_posterCanvas.width !== w || _posterCanvas.height !== h){ _posterCanvas.width = w; _posterCanvas.height = h; }
      _posterCtx.drawImage($core.canvas, 0, 0, w, h);
      return _posterCanvas.toDataURL('image/jpeg', 0.6);
    }catch(e){ return null;  }
  }

  function capture(label, captureType){
    if(!supported || !recorder) return;
    const now = Date.now();
    if(lastCaptureAt[captureType] && now - lastCaptureAt[captureType] < MIN_GAP_MS) return;
    lastCaptureAt[captureType] = now;
    const poster = grabPoster();
    const p = {
      label, captureType, triggerTime: now, poster, gen: currentGen,
      startTime: Math.max(now - BUFFER_SECONDS*1000, genStartTs),
      endTime: now + POST_SECONDS*1000
    };
    pending.push(p);
    setTimeout(()=>{
      const idx = pending.indexOf(p);
      if(idx===-1) return;
      pending.splice(idx,1);
      finalize(p);
      if(_restartDue && !pending.some(q=>q.gen===currentGen)){
        _restartDue = false;
        doRestart();
      }
    }, POST_SECONDS*1000 + 2500);
  }

  function updateBadge(){
    const c = document.getElementById('replay-gallery-count');
    if(c) c.textContent = clips.length ? String(clips.length) : '';
  }

  let toastTO = null;
  function toast(msg){
    const t = document.getElementById('replay-toast');
    if(!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTO);
    toastTO = setTimeout(()=>t.classList.remove('show'), 2600);
  }

  function fmtTime(ts){
    const d = new Date(ts);
    return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
  }

  function renderGallery(){
    const grid = document.getElementById('replay-modal-grid');
    const empty = document.getElementById('replay-modal-empty');
    if(!grid) return;
    if(!clips.length){
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    grid.innerHTML = '';
    clips.forEach(clip=>{
      const card = document.createElement('div');
      card.className = 'replay-card';
      const video = document.createElement('video');
      video.src = clip.url;
      video.controls = true;
      video.playsInline = true;
      video.preload = 'none';
      if(clip.poster) video.poster = clip.poster;
      card.appendChild(video);
      const meta = document.createElement('div');
      meta.className = 'replay-card-meta';
      meta.innerHTML = `<div><div class="replay-card-label${clip.type&&clip.type.startsWith('boss')?' type-boss':''}">${clip.label}</div><div class="replay-card-time">${fmtTime(clip.ts)}</div></div>`;
      card.appendChild(meta);
      const actions = document.createElement('div');
      actions.className = 'replay-card-actions';
      const dlBtn = document.createElement('button');
      dlBtn.textContent = 'v SAVE';
      dlBtn.onclick = ()=>{
        const a = document.createElement('a');
        a.href = clip.url;
        a.download = `diy-military-highlight-${clip.id}.webm`;
        document.body.appendChild(a); a.click(); a.remove();
      };
      const delBtn = document.createElement('button');
      delBtn.textContent = 'X DELETE';
      delBtn.className = 'replay-delete-btn';
      delBtn.onclick = ()=>{
        clips = clips.filter(c=>c.id!==clip.id);
        URL.revokeObjectURL(clip.url);
        updateBadge();
        renderGallery();
      };
      actions.appendChild(dlBtn); actions.appendChild(delBtn);
      card.appendChild(actions);
      grid.appendChild(card);
    });
  }

  function openGallery(){
    renderGallery();
    document.getElementById('replay-modal').classList.add('active');
  }
  function closeGallery(){
    document.getElementById('replay-modal').classList.remove('active');
  }

  (function bindUI(){
    const btn = document.getElementById('replay-gallery-btn');
    const closeBtn = document.getElementById('replay-modal-close');
    const modal = document.getElementById('replay-modal');
    if(btn) btn.addEventListener('click', openGallery);
    if(closeBtn) closeBtn.addEventListener('click', closeGallery);
    if(modal) modal.addEventListener('click', (e)=>{ if(e.target===modal) closeGallery(); });
  })();

  function getRunClips(){
    return clips.filter(c=>c.ts >= runStartTs);
  }

  return { init, stop, capture, setEnabled, isEnabled:()=>enabled, isSupported:()=>supported, getClips:()=>clips, getRunClips, openGallery };
})(); ;$replay.ReplayRecorder = ReplayRecorder;

const CaptureTools = (()=>{
  const canTab = !$core.isMobile && !!(navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function');
  const supported = (typeof MediaRecorder !== 'undefined') && (canTab || typeof $core.canvas.captureStream === 'function');
  const RECORD_FPS = ($core.isMobile || $core.isLowEndDesktop || $core.isUltraLow) ? 20 : 30;
  const RECORD_BITRATE = ($core.isMobile || $core.isLowEndDesktop || $core.isUltraLow) ? 3500000 : 7000000;
  let recorder = null, mediaStream = null, chunks = [], recording = false, startedAt = 0, timerInt = null;

  function pickMime(withAudio){
    const opts = withAudio
      ? ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm']
      : ['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];
    for(const m of opts){ try{ if(MediaRecorder.isTypeSupported(m)) return m; }catch(e){} }
    return '';
  }
  function ts(){
    const d = new Date();
    const p = n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  }
  function downloadBlob(blob, filename){
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url), 4000);
  }
  function flash(){
    const el = document.getElementById('screenshot-flash');
    if(!el) return;
    el.style.transition = 'none';
    el.style.opacity = '0.85';
    requestAnimationFrame(()=>{
      el.style.transition = 'opacity 0.5s ease';
      el.style.opacity = '0';
    });
  }
  function screenshot(){
    if(!$core.canvas || $buildings.crawlActive) return;
    try{
      $core.canvas.toBlob(blob=>{
        if(!blob){ if(typeof $buildings.showPickupMsg==='function') $buildings.showPickupMsg('▸ SCREENSHOT FAILED','#ff4444'); return; }
        downloadBlob(blob, `diy-military-${ts()}.png`);
        flash();
        if(typeof $buildings.showPickupMsg==='function') $buildings.showPickupMsg('▸ SCREENSHOT SAVED','#7fff00');
      }, 'image/png');
    }catch(e){
      if(typeof $buildings.showPickupMsg==='function') $buildings.showPickupMsg('▸ SCREENSHOT FAILED','#ff4444');
    }
  }
  function updateTimer(){
    const el = document.getElementById('capture-rec-time');
    if(!el) return;
    const secs = Math.floor((Date.now()-startedAt)/1000);
    const m = String(Math.floor(secs/60)).padStart(2,'0');
    const s = String(secs%60).padStart(2,'0');
    el.textContent = m+':'+s;
    if(secs === 600 && typeof $buildings.showPickupMsg==='function') $buildings.showPickupMsg('▸ 10 MIN RECORDED — LARGE FILE AHEAD','#ffaa00');
  }
  let starting = false;
  async function acquireStream(){
    if(canTab){
      try{
        const st = await navigator.mediaDevices.getDisplayMedia({
          video:{frameRate:RECORD_FPS}, audio:true,
          preferCurrentTab:true, selfBrowserSurface:'include', surfaceSwitching:'exclude', systemAudio:'exclude'
        });
        return {stream:st, mode:'tab'};
      }catch(e){
        if(e && (e.name==='NotAllowedError' || e.name==='AbortError')) return {cancelled:true};
      }
    }
    if($buildings.crawlActive) return {blockedByCrawl:true};
    if(typeof $core.canvas.captureStream === 'function')
      return {stream:$core.canvas.captureStream(RECORD_FPS), mode:'canvas'};
    return null;
  }
  async function startRecording(){
    if(!supported || recording || starting || !$core.canvas) return;
    starting = true;
    try{
      const got = await acquireStream();
      if(!got){ if(typeof $buildings.showPickupMsg==='function') $buildings.showPickupMsg('▸ RECORDING UNAVAILABLE','#ff4444'); return; }
      if(got.blockedByCrawl){ if(typeof $buildings.showPickupMsg==='function') $buildings.showPickupMsg('▸ INTRO CRAWL CAN\'T BE RECORDED ON THIS DEVICE - TAP REC AFTER IT','#ffaa00'); return; }
      if(got.cancelled){ if(typeof $buildings.showPickupMsg==='function') $buildings.showPickupMsg('▸ RECORDING CANCELLED','#ffaa00'); return; }
      mediaStream = got.stream;
      const mime = pickMime(mediaStream.getAudioTracks().length > 0);
      recorder = new MediaRecorder(mediaStream, mime ? {mimeType:mime, videoBitsPerSecond:RECORD_BITRATE} : {videoBitsPerSecond:RECORD_BITRATE});
      chunks = [];
      recorder.ondataavailable = e=>{ if(e.data && e.data.size>0) chunks.push(e.data); };
      recorder.onstop = ()=>{
        if(chunks.length){
          const blob = new Blob(chunks, {type: mime || 'video/webm'});
          downloadBlob(blob, `diy-military-${ts()}.webm`);
          if(typeof $buildings.showPickupMsg==='function') $buildings.showPickupMsg('▸ RECORDING SAVED','#7fff00');
        }
        chunks = [];
        try{ if(mediaStream) mediaStream.getTracks().forEach(t=>t.stop()); }catch(e){}
        mediaStream = null; recorder = null;
      };
      const vt = mediaStream.getVideoTracks()[0];
      if(vt) vt.addEventListener('ended', ()=>stopRecording());
      recorder.start(1000);
      recording = true;
      startedAt = Date.now();
      const indicator = document.getElementById('capture-rec-indicator');
      const btn = document.getElementById('record-btn');
      if(indicator) indicator.classList.add('show');
      if(btn){ btn.classList.add('recording'); btn.textContent = '■'; btn.title = 'Stop recording (Shift+V)'; }
      updateTimer();
      timerInt = setInterval(updateTimer, 500);
      if(typeof $buildings.showPickupMsg==='function'){
        $buildings.showPickupMsg('▸ RECORDING STARTED','#ff5533');
        if(got.mode==='canvas') setTimeout(()=>$buildings.showPickupMsg('▸ GAME VIEW ONLY - MENUS/CRAWL NOT CAPTURED ON THIS DEVICE','#ffaa00'), 1600);
      }
      window.__recMode = got.mode;
    }catch(e){
      recording = false;
      try{ if(mediaStream) mediaStream.getTracks().forEach(t=>t.stop()); }catch(_){}
      mediaStream = null; recorder = null;
      if(typeof $buildings.showPickupMsg==='function') $buildings.showPickupMsg('▸ RECORDING UNAVAILABLE','#ff4444');
    }finally{ starting = false; }
  }
  function stopRecording(){
    if(!recording) return;
    recording = false;
    clearInterval(timerInt); timerInt = null;
    const indicator = document.getElementById('capture-rec-indicator');
    const btn = document.getElementById('record-btn');
    if(indicator) indicator.classList.remove('show');
    if(btn){ btn.classList.remove('recording'); btn.textContent = '●'; btn.title = 'Record video (Shift+V)'; }
    try{ recorder && recorder.stop(); }catch(e){}
  }
  function toggleRecording(){ if(recording) stopRecording(); else startRecording(); }
  function showButtons(show){
    const el = document.getElementById('capture-btns');
    if(el) el.classList.toggle('show', !!show && supported);
  }
  return { screenshot, toggleRecording, stopRecording, isRecording:()=>recording, isSupported:()=>supported, showButtons };
})(); ;$replay.CaptureTools = CaptureTools;
document.addEventListener('keydown', e=>{
  if(!e.shiftKey || e.repeat) return;
  const tag = (e.target && e.target.tagName) || '';
  if(tag==='INPUT' || tag==='TEXTAREA') return;
  if(e.code==='KeyX'){ e.preventDefault(); CaptureTools.screenshot(); }
  else if(e.code==='KeyV'){ e.preventDefault(); CaptureTools.toggleRecording(); }
});
(function bindCaptureButtons(){
  const shotBtn = document.getElementById('screenshot-btn');
  const recBtn = document.getElementById('record-btn');
  if(shotBtn) shotBtn.addEventListener('click', ()=>CaptureTools.screenshot());
  if(recBtn) recBtn.addEventListener('click', ()=>CaptureTools.toggleRecording());
})();

function isMenuSurfaceOpen(){ return $buildings.state==='menu' || $buildings.state==='levelcomplete'; }
window.isMenuSurfaceOpen = isMenuSurfaceOpen;
const waveAnn=document.getElementById('wave-announce'); ;$replay.waveAnn = waveAnn;
const mFlash=document.getElementById('muzzle-flash'); ;$replay.mFlash = mFlash;
const dFlash=document.getElementById('dmg-flash'); ;$replay.dFlash = dFlash;
const hFlash=document.getElementById('hitfx-flash');
const pMsg=document.getElementById('pickup-msg'); ;$replay.pMsg = pMsg;
const bBarW=document.getElementById('boss-bar-wrap'); ;$replay.bBarW = bBarW;
const bBarF=document.getElementById('boss-bar-fill'); ;$replay.bBarF = bBarF;
const envInd=document.getElementById('env-indicator'); ;$replay.envInd = envInd;
const pauseBtn=document.getElementById('pause-btn'); ;$replay.pauseBtn = pauseBtn;
const pauseOverlay=document.getElementById('pause-overlay'); ;$replay.pauseOverlay = pauseOverlay;
const resumeBtn=document.getElementById('resume-btn'); ;$replay.resumeBtn = resumeBtn;
const menuBtn=document.getElementById('menu-btn'); ;$replay.menuBtn = menuBtn;
const audioToggle=document.getElementById('audio-toggle'); ;$replay.audioToggle = audioToggle;
const weatherInd=document.getElementById('weather-indicator'); ;$replay.weatherInd = weatherInd;
$replay.W = 0; $replay.H = 0;
let _lastResizeW=0,_lastResizeH=0;
$replay._runtimeRenderScale = null;
$replay._userResPref = 'auto';
const _RES_SCALE_VALUES = { auto:null, high:1, medium:0.75, low:0.5 }; ;$replay._RES_SCALE_VALUES = _RES_SCALE_VALUES;
function _getRenderScale(){
// Ultra-HD Retina/High-DPI sampling
const dpr = window.devicePixelRatio || 1;
return Math.min(2.5, Math.max(1, dpr));
}
function resize(){
const nw=$core.canvas.offsetWidth||window.innerWidth;
const nh=$core.canvas.offsetHeight||window.innerHeight;
$replay.W=nw; $replay.H=nh;
const _rs=_getRenderScale();
$core.canvas.width=Math.round(nw*_rs);
$core.canvas.height=Math.round(nh*_rs);
if(_rs!==1){ $core.ctx.setTransform(_rs,0,0,_rs,0,0); } else { $core.ctx.setTransform(1,0,0,1,0,0); }
if((Math.abs(nw-_lastResizeW)>10 || Math.abs(nh-_lastResizeH)>10)){
$psycho1.groundCache=null;
_lastResizeW=nw; _lastResizeH=nh;
if(typeof $buildings.state==='undefined' || $buildings.state!=='playing'){
$psycho1.buildEnv();
}
}
}
window.addEventListener('resize',resize);
function clampPanelHeights(){
const panes = document.querySelectorAll('.more-pane, .acard-body-inner, .settings-pane');
const vh = window.innerHeight * 0.7;
panes.forEach(pane => {
const parentCard = pane.closest('.acard');
if(parentCard && !parentCard.classList.contains('open')){
pane.style.maxHeight = '';
pane.style.overflowY = '';
pane.style.webkitOverflowScrolling = '';
return;
}
pane.style.maxHeight = vh + 'px';
pane.style.overflowY = 'auto';
pane.style.webkitOverflowScrolling = 'touch';
});
}
window.addEventListener('resize', clampPanelHeights);
window.addEventListener('orientationchange', () => setTimeout(clampPanelHeights, 100));
setTimeout(clampPanelHeights, 500);
$replay.currentEnv = 'jungle';
$replay.selectedChar = window.selectedChar='soldier';
$replay.coopEnabled = false;
$replay.selectedChar2 = 'soldier';
$replay.player2 = null;
$replay.p2Down = false;
$replay.p1Down = false;
$replay.p2Ammo = {};
$replay.p2CurWep = 'rifle';
$replay.p2Reloading = false;
$replay.p2ReloadTimer = 0;
let p2Keys = {}; ;$replay.p2Keys = p2Keys;
$replay.p2ReviveTimer = 0;
$replay.p1ReviveTimer = 0;
const P2_COL = '#00aaff'; ;$replay.P2_COL = P2_COL;
const REVIVE_FRAMES = 180; ;$replay.REVIVE_FRAMES = REVIVE_FRAMES;
$replay.currentLevel = window.currentLevel=null;
$replay.levelExplicitlyChosen = window.levelExplicitlyChosen=false;
$replay._freezeFrames = 0;
});