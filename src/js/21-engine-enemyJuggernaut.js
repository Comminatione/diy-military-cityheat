/* JUGGERNAUT: wave 31+. Very slow, huge HP, fires a 3-round spread of heavy 3-damage slugs, shakes the screen. */
window.__engine.files.push(function* enemyJuggernaut(){
  const $enemies = window.__engine.enemies, $buildings = window.__engine.buildings, $bosses = window.__engine.bosses, $props = window.__engine.props;
  $enemies.reg({
    id: 'juggernaut',
    stats: { hpCapBase:80, hpCapMult:2.0, spdCap:2.0, spd2:0.65, baseHp:14, si:60, spawnPad:20, w:34, h:40, col:'#3a2200' },
    unlockWave: 31,
    ai: { heavyHit: true, contactDmg: 0.25, contactDmgP2: 0.1, knockback: 4 },
    fire(e, c){
      e.st++;
      if(e.st>e.si){
        e.st=0;
        const a=Math.atan2(c.ldy,c.ldx);
        for(let s=-1;s<=1;s++) $buildings.bullets.push({x:e.x,y:e.y,vx:Math.cos(a+s*0.18)*6,vy:Math.sin(a+s*0.18)*6,own:'enemy',life:300,dmg:3,col:'#ff8833',sz:4});
        $bosses.shake(2);
      }
    },
    kill: { pts:80, xp:55, label:'▣ JUGGERNAUT CRUSHED', color:'#ff8833', shake:13, isElite:true, orbital:true },
    vis: { icon:'▲' },
    draw(e, facing){ $props.drawJuggernaut(e, facing); },
  });
});