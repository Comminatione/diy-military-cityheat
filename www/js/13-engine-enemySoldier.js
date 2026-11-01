/* SOLDIER: the baseline grunt. Also wears the alien / arctic skins (same stats, different body). */
window.__engine.files.push(function* enemySoldier(){
  const $enemies = window.__engine.enemies, $props = window.__engine.props;
  const S = $enemies.shared;
  $enemies.reg({
    id: 'soldier',
    stats: { hpCapBase:8, hpCapMult:0.55, spdCap:4.5, spd2:1.8, baseHp:1, si:(wave)=>Math.max(20,110-wave*4), spawnPad:12, w:20, h:24, col:'#6b9c34' },
    unlockWave: 0,
    ai: { sep: 30, nightSep: 34, contactDmg: 0.1, contactDmgP2: 0.1, knockback: 4 },
    /* 30% of soldiers roll a flanking angle once */
    think(e){
      if(e._flankAngle === undefined){
        e._flankAngle = Math.random()<0.3 ? (Math.random()<0.5 ? 1 : -1) * (0.9+Math.random()*0.5) : 0;
      }
    },
    /* on night / fog levels soldiers strafe once they are at engage range */
    engageMove(e, c){
      if(c.night && (c.atEngage || c.keepStrafing)) S.strafeStep(e, c.dx, c.dy, {margin:50, timer:50, speed:e.spd*0.7});
    },
    fire: S.genericFire,
    kill: { pts:10, xp:8, label:'x ELIMINATED', color:'#aaff00', shake:4 },
    draw: S.drawInfantry,
  });
});