window.__DIY_VERSION='106';try{window.__DIY_STRESS=/[?&]stress=1\b/.test(location.search);}catch(e){}

/* shared pixel-art grid size: ULTRA-HD clarity mode */
window.__artPX=function(W,H){
  return 1; // Ultra HD 1:1 pixel rendering
};
/* Low-end test: let ultra-low / low-end devices spawn EVERY enemy type (elite, ghost, phantom, juggernaut, shield, sniper, bomber, berserker). Set ?lowtypes=0 (or window.__DIY_LOWEND_ALL_TYPES=false) to restore the old remap. */
try{ window.__DIY_LOWEND_ALL_TYPES=!/[?&]lowtypes=0\b/.test(location.search); }catch(e){ window.__DIY_LOWEND_ALL_TYPES=true; }