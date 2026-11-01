/* HEAVY: slow, tanky, 90px standoff, retreats to cover when hurt, shoves back less when shot. Rolls a 25% weapon drop (SMG).
   Shoots the plain shared soldier pattern. */
window.__engine.files.push(function* enemyHeavy(){
  const $enemies = window.__engine.enemies, $props = window.__engine.props;
  const S = $enemies.shared;
  $enemies.reg({
    id: 'heavy',
    stats: { hpCapBase:28, hpCapMult:1.2, spdCap:3.0, spd2:1.05, baseHp:4, si:80, spawnPad:17, w:26, h:32, col:'#c8621a' },
    unlockWave: 1,
    ai: { minDist: 90, sep: 36, seeksCover: true, heavyHit: true, eliteKill: true, contactDmg: 0.15, contactDmgP2: 0.15, knockback: 2,
          personality(r){ return r<0.55 ? 'aggressive' : 'steady'; } },
    fire: S.genericFire,
    kill: { pts:30, xp:20, label:'X HEAVY DOWN', color:'#ffaa00', shake:9, isElite:true, orbital:true, weaponDrop:'smg' },
    vis: { prominent:true, hpBarW:36, hpBarCol:'#ff6600', icon:'▣', iconMobile:true, hpAlwaysOnLowEnd:true },
    draw: S.drawInfantry,
  });
});