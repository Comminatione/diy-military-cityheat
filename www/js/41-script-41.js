(function(){
  var badge=null;
  function showBadge(){
    if(badge||!document.body) return;
    badge=document.createElement('div');
    badge.style.cssText="position:fixed;left:50%;bottom:6px;transform:translateX(-50%);z-index:99999;font:10px 'Share Tech Mono',monospace;letter-spacing:2px;color:#ffcc00;background:rgba(0,0,0,.7);border:1px solid #ffcc00;padding:2px 8px;pointer-events:none;";
    badge.id='stress-badge'; document.body.appendChild(badge);
  }
  function refresh(){
    if(window.__DIY_STRESS){ showBadge(); badge.style.display=''; }
    else if(badge){ badge.style.display='none'; }
  }
  window.__stress=function(on){
    window.__DIY_STRESS=(on===undefined)?!window.__DIY_STRESS:!!on;
    refresh(); console.log('[stress] '+(window.__DIY_STRESS?'ON':'OFF')); return window.__DIY_STRESS;
  };
  var tries=0, t=setInterval(function(){
    var E=window.__engine;
    if(E&&E.weather&&E.psycho1&&E.replay&&E.buildings&&typeof E.weather.drawEnvironmentFX==='function'){
      clearInterval(t);
      var W=E.weather,P=E.psycho1,R=E.replay,B=E.buildings, fpsN=0, fpsT=performance.now();
      W.drawAllBiomeFX=function(){
        var keep=R.currentEnv, gc=P.groundCache, keys=Object.keys(P.ENVS);
        B._dqsQuality=1;
        try{
          for(var i=0;i<keys.length;i++){
            var k=keys[i];
            R.currentEnv=k;
            if(k!==keep) P.groundCache=null;   // don't paint other biomes' detail onto this level's ground cache
            try{ W.drawEnvironmentFX(); }catch(e){}
            P.groundCache=gc;
          }
        } finally { R.currentEnv=keep; P.groundCache=gc; }
        fpsN++; var now=performance.now();
        if(now-fpsT>=1000){ if(badge) badge.textContent='STRESS TEST · ALL BIOME FX · ALL ENEMIES · '+fpsN+' fps'; fpsN=0; fpsT=now; }
      };
      refresh();
    } else if(++tries>300){ clearInterval(t); }
  },100);
  if(document.readyState!=='loading') refresh(); else document.addEventListener('DOMContentLoaded',refresh);
})();