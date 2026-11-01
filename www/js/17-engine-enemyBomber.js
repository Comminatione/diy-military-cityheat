/* BOMBER: never shoots. Sprints at you, beeps faster as it closes, blows up at <28px (or when killed). Fixed 4 HP cap. */
window.__engine.files.push(function* enemyBomber(){
  const $enemies = window.__engine.enemies, $props = window.__engine.props, $psycho2 = window.__engine.psycho2, $buildings = window.__engine.buildings;
  $enemies.reg({
    id: 'bomber',
    stats: { hpCapFixed:4, spdCap:5.0, spd2:3.4, baseHp:1, si:null, spawnPad:12, w:18, h:18, col:'#ff6600' },
    unlockWave: 5,
    ai: { minDist: 45, noSuppress: true, contactDmg: 0.1, contactDmgP2: 0.1, knockback: 4,
          personality(){ return 'aggressive'; } },
    onTick(e, c){
      e.si = 9999;
      if(c.d < 28 && !e._detonated){
        e._detonated = true;
        $props.bomberDetonate(e);
        $psycho2.killEnemy(e);
      }
      if(c.d < 200){
        const proximity = Math.max(0, 1 - (c.d / 200));
        const ctx = audioManager.audioContext;
        if(ctx){
          const now = ctx.currentTime;
          const intervalSec = Math.max(0.13, 1.0 * (1 - proximity * 0.87));
          if(!e._nextBeepAt || e._nextBeepAt <= now){
            e._nextBeepAt = audioManager.bomberBeep(proximity, now) + intervalSec;
          }
        }
      } else { e._nextBeepAt = 0; }
    },
    kill: { pts:15, xp:8, label:'* BOMBER OBLITERATED', color:'#ff8800', shake:4,
            onKill(e){ if(!e._detonated){ e._detonated = true; $props.bomberDetonate(e); } } },
    vis: { outlineR: 16, icon:'*', noTelegraph: true,
           /* blinks red when you are within 80px */
           blink(e){ return Math.hypot($buildings.player.x-e.x,$buildings.player.y-e.y) < 80 && Math.sin($buildings.tick*0.4) > 0; } },
    draw(e, facing){ $props.drawBomber(e, facing); },
  });
});