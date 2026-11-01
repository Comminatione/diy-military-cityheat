(function(){
  try{
    var q = (location.search.match(/[?&]lowmem=([01])/)||[])[1];
    var ua = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    var touch = (navigator.maxTouchPoints||0) > 1 && window.matchMedia && matchMedia('(pointer:coarse)').matches;
    var mem = navigator.deviceMemory; 
    var on = q ? q === '1' : ((ua || touch) && typeof mem === 'number' && mem <= 2);
    if (on) document.documentElement.classList.add('lowmem');
    window.__lowMem = on;
  }catch(e){ window.__lowMem = false; }
})();
window.__assertOrig = function(name){
  var f = window[name];
  if (typeof f !== 'function') console.error('[patch] window.' + name + ' is not a function at patch time (script load-order bug?)');
  return f;
};