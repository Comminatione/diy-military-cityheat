/* GHOST: fast cloaked skirmisher. Fades to near-invisible, unmasks when it fires or you get within 60px. */
window.__engine.files.push(function* enemyGhost(){
  const $enemies = window.__engine.enemies, $buildings = window.__engine.buildings, $core = window.__engine.core, $props = window.__engine.props;
  $enemies.reg({
    id: 'ghost',
    stats: { hpCapBase:18, hpCapMult:0.7, spdCap:5.5, spd2:2.6, baseHp:2, si:45, spawnPad:12, w:20, h:26, col:'#aaccff' },
    unlockWave: 20,
    ai: { contactDmg: 0.1, contactDmgP2: 0.1, knockback: 4 },
    fire(e, c){
      e.st++;
      if(e.st>e.si){
        const a=Math.atan2(c.ldy,c.ldx);
        $buildings.bullets.push({x:e.x,y:e.y,vx:Math.cos(a)*8.5,vy:Math.sin(a)*8.5,own:'enemy',life:300,dmg:1,col:'#aaddff',sz:2});
        e.st=0;
        e._ghostCloak=0.7;
      }
    },
    /* runs before the body is drawn: sets the cloak alpha */
    preDraw(e){
      e._ghostCloak = e._ghostCloak ?? 1.0;
      const near = Math.hypot($buildings.player.x-e.x,$buildings.player.y-e.y) < 60;
      const firing = e.st <= 0;
      if(near || firing) e._ghostCloak = Math.max(0.55, e._ghostCloak - 0.06);
      else e._ghostCloak = Math.min(0.18 + Math.sin($buildings.tick*0.04+e.x)*0.08, e._ghostCloak + 0.02);
      $core.ctx.globalAlpha = e._ghostCloak;
    },
    kill: { pts:35, xp:22, label:'X GHOST UNCLOAKED', color:'#aaddff', shake:5, isElite:true },
    vis: { icon:'◇' },
    draw(e, facing){ $props.drawGhost(e, facing); },
  });
});