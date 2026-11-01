/* SHIELD CARRIER: a frontal riot shield. Bullets that hit from the player's side are swallowed (non-piercing) -
   rockets, napalm and grenades ignore it. Shoots the plain shared soldier pattern. */
window.__engine.files.push(function* enemyShield(){
  const $enemies = window.__engine.enemies, $props = window.__engine.props, $bosses = window.__engine.bosses, $buildings = window.__engine.buildings, $core = window.__engine.core;
  const S = $enemies.shared;
  $enemies.reg({
    id: 'shield',
    stats: { hpCapBase:24, hpCapMult:1.0, spdCap:2.8, spd2:1.1, baseHp:4, si:90, spawnPad:16, w:24, h:28, col:'#2a4a6a' },
    unlockWave: 5,
    ai: { sep: 32, contactDmg: 0.13, contactDmgP2: 0.1, knockback: 2,
          personality(r){ return r<0.60 ? 'aggressive' : 'steady'; } },
    /* returns the damage to apply, or null when the bullet is absorbed by the shield */
    onBulletHit(e, b, dmg){
      if(b.wt==='rocket' || b.napalm || b._isGrenade) return dmg;
      const facing = Math.atan2($buildings.player.y-e.y, $buildings.player.x-e.x);
      const bulletAng = Math.atan2(b.vy, b.vx);
      let diff = Math.abs(facing - bulletAng);
      if(diff > Math.PI) diff = Math.PI*2 - diff;
      if(diff < Math.PI * 0.33){
        dmg = Math.max(1, Math.ceil(dmg * 0.4));
        $bosses.ptcl(b.x,b.y,'#aaddff',5,3);
        if(!$core.isMobile){ $bosses.ptcl(b.x,b.y,'#ffffff',3,2); }
        if(!b.pierce) return null;
      }
      return dmg;
    },
    fire: S.genericFire,
    kill: { pts:28, xp:18, label:'▣ SHIELD DOWN', color:'#44aaff', shake:7, isElite:true, orbital:true },
    vis: { prominent:true, hpBarW:36, hpBarCol:'#ff6600', icon:'◆', hpAlwaysOnLowEnd:true },
    draw(e, facing){ $props.drawShieldCarrier(e, facing); },
  });
});