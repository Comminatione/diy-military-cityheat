/* HUD QA (read-only). Does NOT change any element's visibility.
   Shift+D toggles coloured outlines; window.diagHud() prints mode + visible HUD elements + overlapping pairs.
   Hud.overlaps() is what a Playwright regression test should assert is empty during gameplay. */
(function(){
  'use strict';
  var IDS=['hud','hud-mini','mhud','mhud-drawer','stat-chip','wave-status','kill-feed','env-indicator','weather-indicator','mut-pill-strip',
    'mobile-pause','hud-toggle','replay-gallery-btn','wep-grenade-hud','left-action-stack','wep-switcher','wep-active-pill','wep-picker-float',
    'dash-chip','xp-hud','action-btns','btn-grenade-left','boss-bar-wrap','wave-announce','pickup-msg','mission-card'];
  var dbg=null;
  function visible(el){
    if(!el) return null;
    var cs=getComputedStyle(el); if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<0.05) return null;
    var r=el.getBoundingClientRect(); if(r.width<2||r.height<2) return null;
    if(r.right<=0||r.bottom<=0||r.left>=innerWidth||r.top>=innerHeight) return null;
    return r;
  }
  function visibleList(){ var o=[]; IDS.forEach(function(id){ var el=document.getElementById(id), r=visible(el); if(r) o.push({id:id,el:el,r:r}); }); return o; }
  function overlaps(){
    var v=visibleList(), out=[];
    for(var i=0;i<v.length;i++) for(var j=i+1;j<v.length;j++){
      var a=v[i], b=v[j];
      if(a.el.contains(b.el)||b.el.contains(a.el)) continue;           // nesting is fine
      if(a.id==='mhud'||b.id==='mhud') continue;                        // full-screen container: its children are checked individually
      var w=Math.min(a.r.right,b.r.right)-Math.max(a.r.left,b.r.left), h=Math.min(a.r.bottom,b.r.bottom)-Math.max(a.r.top,b.r.top);
      if(w>2&&h>2) out.push({a:a.id,b:b.id,w:Math.round(w),h:Math.round(h)});
    }
    return out;
  }
  function mode(){ var c=document.body.classList; return {mobileMinimal:c.contains('mobile-minimal-hud'),mobile:!!(window.__engine&&window.__engine.core&&window.__engine.core.isMobile),vw:innerWidth,vh:innerHeight}; }
  function outlines(on){
    if(on===undefined) on=!dbg;
    if(!on){ if(dbg){ clearInterval(dbg.t); dbg.c.remove(); } dbg=null; return false; }
    if(dbg) return true;
    var c=document.createElement('canvas'); c.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:99999'; document.body.appendChild(c);
    dbg={c:c,t:setInterval(function(){
      c.width=innerWidth; c.height=innerHeight; var g=c.getContext('2d'); g.font='10px monospace';
      var bad={}; overlaps().forEach(function(o){bad[o.a]=bad[o.b]=1;});
      visibleList().forEach(function(v){ g.strokeStyle=g.fillStyle=bad[v.id]?'#f00':'#7fff00'; g.lineWidth=2; g.strokeRect(v.r.left,v.r.top,v.r.width,v.r.height); g.fillText(v.id,v.r.left+3,v.r.top+11); });
    },250)};
    return true;
  }
  var Hud={ids:IDS,visible:function(){return visibleList().map(function(v){return v.id;});},overlaps:overlaps,outlines:outlines,mode:mode};
  window.Hud=window.Hud||Hud; window.__hudQA=Hud;
  window.diagHud=function(){ var o={mode:mode(),visible:Hud.visible(),overlaps:overlaps()}; console.log(JSON.stringify(o,null,1)); return o; };
  document.addEventListener('keydown',function(e){ if(e.shiftKey&&e.code==='KeyD'&&!/INPUT|TEXTAREA/.test((e.target||{}).tagName||'')) outlines(); });
})();