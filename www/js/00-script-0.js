window.__DIY_VERSION='106';try{window.__DIY_STRESS=/[?&]stress=1\b/.test(location.search);}catch(e){}

/* shared pixel-art grid size (ground, buildings, props, FX must all agree). Tier-aware: fewer art-pixels on weak devices, never finer than the old W/H rule. */
window.__artPX=function(W,H){
  var E=window.__engine||{}, c=E.core||{}, b=E.buildings||{}, r=E.replay||{};
  W=W||r.W||900; H=H||r.H||600;
  var old=Math.max(3,Math.round(Math.min(W,H)/190));
  var t=(c.isUltraLow||c.isLowEndDesktop||b.settingPerfMode)?20000:c.isMobile?30000:60000;
  return Math.max(old,Math.round(Math.sqrt((W*H)/t)));
};
/* Low-end test: let ultra-low / low-end devices spawn EVERY enemy type (elite, ghost, phantom, juggernaut, shield, sniper, bomber, berserker). Set ?lowtypes=0 (or window.__DIY_LOWEND_ALL_TYPES=false) to restore the old remap. */
try{ window.__DIY_LOWEND_ALL_TYPES=!/[?&]lowtypes=0\b/.test(location.search); }catch(e){ window.__DIY_LOWEND_ALL_TYPES=true; }