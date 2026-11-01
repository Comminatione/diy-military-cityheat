/* ELITE: twin purple rounds, 120px standoff, leads its shots, and every 4s RALLIES nearby enemies (+60% speed for 3s). */
window.__engine.files.push(function* enemyElite(){
  const $enemies = window.__engine.enemies, $buildings = window.__engine.buildings, $props = window.__engine.props, $bosses = window.__engine.bosses, $psycho2 = window.__engine.psycho2;
  $enemies.reg({
    id: 'elite',
    stats: { hpCapBase:50, hpCapMult:1.5, spdCap:3.5, spd2:1.4, baseHp:7, si:55, spawnPad:18, w:28, h:34, col:'#1a0a2e' },
    unlockWave: 7,
    ai: { minDist: 120, noSuppress: true, sep: 38, leadT: 9, heavyHit: true, eliteKill: true, contactDmg: 0.1, contactDmgP2: 0.1, knockback: 4 },
    fire(e, c){
      e.st++;
      const rate = Math.floor(e.si * (e._isSuppressing ? 0.5 : 1));
      if(e.st>rate){
        e.st=0;
        const a=Math.atan2(c.ldy,c.ldx);
        $buildings.bullets.push({x:e.x,y:e.y,vx:Math.cos(a-0.08)*9,vy:Math.sin(a-0.08)*9,own:'enemy',life:300,dmg:2,col:'#cc44ff',sz:3});
        $buildings.bullets.push({x:e.x,y:e.y,vx:Math.cos(a+0.08)*9,vy:Math.sin(a+0.08)*9,own:'enemy',life:300,dmg:2,col:'#cc44ff',sz:3});
        audioManager.at(e.x,()=>audioManager.fire('smg'));
      }
      e._rallyTimer=(e._rallyTimer||0)+1;
      if(e._rallyTimer>=240){
        e._rallyTimer=0;
        $psycho2.floatText(e.x,e.y-38,'RALLY!','#cc44ff',11);
        $bosses.shake(3);
        const near=$buildings._gridQuery(e.x,e.y,160);
        for(let i=0;i<near.length;i++){
          const o=near[i];
          if(o===e||!o.alive||o.boss) continue;
          if(Math.hypot(o.x-e.x,o.y-e.y)<160){ o._eliteRallyTimer=180; o.hitFlash=4; }
        }
      }
    },
    kill: { pts:50, xp:35, label:'◉ ELITE NEUTRALIZED', color:'#cc44ff', shake:11, isElite:true, orbital:true, flash:'rgba(180,60,255,0.18)' },
    vis: { outlineR:18, outlineCol:'rgba(180,80,255,0.85)', alwaysHalo:true, prominent:true, hpBarW:44, hpBarCol:'#cc44ff', icon:'◉', iconMobile:true, hpAlwaysOnLowEnd:true },
    draw(e, facing){ $props.drawElite(e, facing); },
  });
});