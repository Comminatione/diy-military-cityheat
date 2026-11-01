(function(){
const bar = document.getElementById('hotkey-bar');
if(!bar) return;
if(/Android|iPhone|iPad|iPod|Touch/i.test(navigator.userAgent)||'ontouchstart' in window) return;
const _hasSeen = ()=>{ try{ return !!localStorage.getItem('diy_hotkeys_seen'); }catch(e){ return true; } };
if(_hasSeen()) return;
const _check = setInterval(()=>{
if(!window.gameReady) return;
clearInterval(_check);
bar.style.display = 'flex';
setTimeout(()=>{ bar.classList.add('visible'); }, 800);
}, 200);
const _waveWatch = setInterval(()=>{
if((window.wave||0) >= 2){
clearInterval(_waveWatch);
bar.classList.add('fade-out');
setTimeout(()=>{ bar.style.display='none'; }, 1300);
try{ localStorage.setItem('diy_hotkeys_seen','1'); }catch(e){}
}
}, 1000);
})();
function showAdvancedTips(){
const modal = document.getElementById('adv-tips-modal');
if(!modal) return;
try{ localStorage.setItem('diy_adv_tips_seen','1'); }catch(e){}
modal.classList.add('active');
const closeBtn = document.getElementById('adv-tips-close');
function _closeAdvModal(e){
  if(e && e.cancelable) e.preventDefault();
  modal.classList.remove('active');
}
if(closeBtn){
  const freshBtn = closeBtn.cloneNode(true);
  closeBtn.parentNode.replaceChild(freshBtn, closeBtn);
  freshBtn.addEventListener('touchend', _closeAdvModal, {passive:false});
  freshBtn.addEventListener('click',    _closeAdvModal);
}
modal.addEventListener('click', (e)=>{ if(e.target===modal) modal.classList.remove('active'); }, {once:true});
}
(function(){
const exportBtn = document.getElementById('export-save-btn');
const importInput = document.getElementById('import-save-input');
const status = document.getElementById('save-io-status');
function setStatus(msg, col){ if(status){ status.textContent=msg; status.style.color=col||'#3a6000'; setTimeout(()=>{ status.textContent=''; },3000); } }
if(exportBtn){
exportBtn.addEventListener('click', ()=>{
try {
const data = {};
for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); data[k]=localStorage.getItem(k); }
const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href=url; a.download='diy-military-save.json'; a.click();
URL.revokeObjectURL(url);
setStatus('OK EXPORTED','#aaff00');
} catch(e){ setStatus('x EXPORT FAILED','#ff4400'); }
});
}
if(importInput){
importInput.addEventListener('change', e=>{
const file = e.target.files[0];
if(!file) return;
const reader = new FileReader();
reader.onload = ev=>{
try {
const data = JSON.parse(ev.target.result);
Object.entries(data).forEach(([k,v])=>{ try{ localStorage.setItem(k,v); }catch(err){} });
setStatus('OK IMPORTED — RELOAD TO APPLY','#aaff00');
} catch(err){ setStatus('x INVALID FILE','#ff4400'); }
};
reader.readAsText(file);
importInput.value='';
});
}
})();
(function() {
const modal = document.getElementById('first-launch-modal');
if (!modal) return;
let firstLaunchFlag = false;
try {
firstLaunchFlag = !localStorage.getItem('diy_first_launch_seen');
} catch(e) { }
if (!firstLaunchFlag) return;
const checkGameReady = setInterval(() => {
if (window.gameReady && typeof startLevel === 'function') {
clearInterval(checkGameReady);
modal.classList.add('active');
}
}, 200);
let bootCampLevel = null;
const getBootCampLevel = () => {
if (bootCampLevel) return bootCampLevel;
try {
const allLevels = gameDB.getAllLevels();
bootCampLevel = allLevels.find(l => l.isTutorialLevel) || null;
} catch(e) { }
return bootCampLevel;
};
const deployBtn = document.getElementById('flm-btn-deploy');
if (deployBtn) {
deployBtn.addEventListener('click', (e) => {
e.preventDefault();
try { localStorage.setItem('diy_first_launch_seen', '1'); } catch(e) {}
modal.classList.remove('active');
if (typeof startLevel === 'function') startLevel({ level: null, skipIntro: true });
});
}
const bootCampBtn = document.getElementById('flm-btn-bootcamp');
if (bootCampBtn) {
bootCampBtn.addEventListener('click', (e) => {
e.preventDefault();
try { localStorage.setItem('diy_first_launch_seen', '1'); } catch(e) {}
try { localStorage.setItem('diy_played', '1'); } catch(e) {}
modal.classList.remove('active');
try { localStorage.removeItem('diy_tut_seen'); } catch(e) {}
const level = getBootCampLevel();
if (level && typeof startLevel === 'function') {
startLevel({ level: level });
} else {
console.warn('Boot Camp level not found, starting normal game.');
if (typeof startLevel === 'function') startLevel({ level: null });
}
});
}
const skipBtn = document.getElementById('flm-btn-skip');
if (skipBtn) {
skipBtn.addEventListener('click', (e) => {
e.preventDefault();
try { localStorage.setItem('diy_first_launch_seen', '1'); } catch(e) {}
try { localStorage.setItem('diy_played', '1'); } catch(e) {}
modal.classList.remove('active');
});
}
})();