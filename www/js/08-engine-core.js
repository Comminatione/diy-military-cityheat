window.__engine.files.push(function* core() {
const $buildings = window.__engine.buildings;
const $core = window.__engine.core;
Object.assign($core, { _updateShadowFlag, cachedLinearGradient, cachedRadialGradient });
yield;

const isMobile = /Android|iPhone|iPad|iPod|Touch/i.test(navigator.userAgent) || ('ontouchstart' in window); ;$core.isMobile = isMobile;
function _detectNoGPU(){
try {
const _c = document.createElement('canvas');
const gl = _c.getContext('webgl') || _c.getContext('experimental-webgl');
if(!gl) return true;
const _dbg = gl.getExtension('WEBGL_debug_renderer_info');
if(_dbg){
const renderer = (gl.getParameter(_dbg.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
if(/swiftshader|llvmpipe|softpipe|software|microsoft basic render|virtualbox|vmware/.test(renderer)) return true;
}
return false;
} catch(e) { return true; }
}
const _noGPU = _detectNoGPU();
window._noGPU = _noGPU;
const _nonMobileUltraLow = !isMobile && (
(navigator.deviceMemory !== undefined && navigator.deviceMemory <= 1) ||
(navigator.hardwareConcurrency || 4) <= 1 ||
_noGPU
);
const _androidVer = (/Android (\d+)/.exec(navigator.userAgent) || [])[1];
const _oldAndroid = isMobile && _androidVer && +_androidVer <= 8;
const isUltraLow = (isMobile && ((navigator.deviceMemory || 4) <= 2 || (navigator.hardwareConcurrency || 4) <= 2 || _oldAndroid)) || _nonMobileUltraLow; ;$core.isUltraLow = isUltraLow;
window.isUltraLow = isUltraLow;
const isVeryLow = isMobile && (navigator.deviceMemory || 4) <= 1; ;$core.isVeryLow = isVeryLow;
window.isVeryLow = isVeryLow;
const _lowMemTier = (navigator.deviceMemory !== undefined && navigator.deviceMemory <= 2) || !!window.__lowMem; ;$core.lowMemTier = _lowMemTier;
window.__lowMemTier = _lowMemTier;
const _lowendQ = (location.search.match(/[?&#]lowend=([01])/) || location.hash.match(/lowend=([01])/) || [])[1];
let _slowDevSaved = false; try{ const _sd = localStorage.getItem('diy_slowdev'); if(_sd === '1'){ localStorage.removeItem('diy_slowdev'); } else if(_sd){ _slowDevSaved = (Date.now() - (+_sd || 0)) < 3*24*3600*1000; if(!_slowDevSaved) localStorage.removeItem('diy_slowdev'); } }catch(e){}
const _celeronClass = (navigator.hardwareConcurrency || 8) <= 4 && navigator.deviceMemory !== undefined && navigator.deviceMemory <= 4;
const isLowEndDesktop = !isMobile && !isUltraLow && (_lowendQ ? _lowendQ === '1' : (
(navigator.hardwareConcurrency || 4) <= 2 ||
(navigator.deviceMemory !== undefined && navigator.deviceMemory <= 2) ||
_celeronClass || _slowDevSaved ||
_noGPU
)); ;$core.isLowEndDesktop = isLowEndDesktop;
window.isLowEndDesktop = isLowEndDesktop;
const PerfController = {
  device: Object.freeze({
    isMobile, isUltraLow, isVeryLow, isLowEndDesktop,
    noGPU: _noGPU, celeronClass: _celeronClass, slowDevSaved: _slowDevSaved,
    deviceMemory: navigator.deviceMemory, cores: navigator.hardwareConcurrency
  }),
  deviceClass(){
    const d = this.device;
    return (d.isVeryLow || d.isUltraLow) ? 'ultra-low' : d.isLowEndDesktop ? 'low' : d.isMobile ? 'mid' : 'high';
  },
  perfMode(){ return !!$buildings.settingPerfMode; },
  quality(){ const q = $buildings._dqsQuality; return (q === undefined || q === null) ? 1 : q; },
  shadow(){
    const d = this.device;
    return (d.isMobile || d.isLowEndDesktop || d.isUltraLow || this.perfMode()) ? 0 : 1;
  },
  lowFx(){ const d = this.device; return !!(d.isLowEndDesktop || d.isUltraLow || this.perfMode()); },
  level(){
    const d = this.device, q = this.quality();
    if (d.isVeryLow || q < 0.15) return 0;
    if (d.isUltraLow || d.isLowEndDesktop || this.perfMode() || q < 0.4) return 1;
    return 2;
  },
  snapshot(){
    return Object.assign({}, this.device, {
      deviceClass: this.deviceClass(), level: this.level(), shadow: this.shadow(), lowFx: this.lowFx(),
      perfMode: this.perfMode(), quality: this.quality(),
      lowmemClass: !!(document.documentElement && document.documentElement.classList.contains('lowmem')),
      perfFixes: typeof _PERF_FIXES !== 'undefined' ? _PERF_FIXES : undefined,
      renderScale: (window.__engine.replay && window.__engine.replay._runtimeRenderScale) || null
    });
  }
};
['isMobile','isUltraLow','isVeryLow','isLowEndDesktop'].forEach(k => {
  Object.defineProperty($core, k, { value: PerfController.device[k], writable: false, enumerable: true, configurable: true });
});
['isUltraLow','isVeryLow','isLowEndDesktop'].forEach(k => {
  try { Object.defineProperty(window, k, { value: PerfController.device[k], writable: false, enumerable: true, configurable: true }); } catch(e) {}
});
$core.perf = PerfController;
window.PerfController = PerfController;
window.__fxLv = function(){
  try{
    var lv = PerfController.level();
    if(lv > 1){
      var d = PerfController.device || {};
      if((d.deviceMemory && d.deviceMemory <= 3) || (d.cores && d.cores <= 2) || document.documentElement.classList.contains('lowmem')) lv = 1;
    }
    return lv;
  }catch(e){ return 2; }
};
$core.SHADOW = PerfController.shadow();
function _updateShadowFlag(){
$core.SHADOW = PerfController.shadow();
if(typeof _applyShadowGovernor === 'function') _applyShadowGovernor();
document.body && document.body.classList.toggle('lowfx', _PERF_FIXES && PerfController.lowFx());
}
const _PERF_FIXES = !/nofix/.test(location.hash + location.search);
window._PERF_FIXES = _PERF_FIXES;
function _applyShadowGovernor(){
  if(!_PERF_FIXES || typeof ctx === 'undefined' || !ctx) return;
  try{ _applyShadowGovernorInner(); }catch(e){ console.warn('shadow governor disabled:', e); }
}
function _applyShadowGovernorInner(){
  const d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'shadowBlur');
  if($core.SHADOW === 0){
    if(!ctx.__sbGoverned){
      Object.defineProperty(ctx, 'shadowBlur', { configurable:true, get(){ return 0; }, set(v){} });
      ctx.__sbGoverned = true;
    }
    d.set.call(ctx, 0);
  } else if(ctx.__sbGoverned){
    delete ctx.shadowBlur; ctx.__sbGoverned = false;
  }
}

const _gradCache = new Map();
function cachedLinearGradient(key,x0,y0,x1,y1,stops){
  let g=_gradCache.get(key);
  if(!g){
    g=ctx.createLinearGradient(x0,y0,x1,y1);
    for(const [off,col] of stops) g.addColorStop(off,col);
    _gradCache.set(key,g);
  }
  return g;
}
function cachedRadialGradient(key,x0,y0,r0,x1,y1,r1,stops){
  let g=_gradCache.get(key);
  if(!g){
    g=ctx.createRadialGradient(x0,y0,r0,x1,y1,r1);
    for(const [off,col] of stops) g.addColorStop(off,col);
    _gradCache.set(key,g);
  }
  return g;
}
const canvas=document.getElementById('canvas'); ;$core.canvas = canvas;
const ctx=canvas.getContext('2d', isUltraLow ? {alpha:false} : undefined); ;$core.ctx = ctx;
_applyShadowGovernor();
document.body.classList.toggle('lowfx', _PERF_FIXES && !!(isLowEndDesktop || isUltraLow));

(function patchArcRadius(proto){
  const _arc = proto.arc;
  proto.arc = function(x, y, radius, startAngle, endAngle, counterclockwise){
    if(radius < 0) radius = 0;
    return _arc.call(this, x, y, radius, startAngle, endAngle, counterclockwise);
  };
})(CanvasRenderingContext2D.prototype);
});