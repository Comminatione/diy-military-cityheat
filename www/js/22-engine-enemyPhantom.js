/* PHANTOM: wave 41+. Fires a pink twin burst and every 4s teleports to just behind you (if the spot is clear). */
window.__engine.files.push(function* enemyPhantom(){
  const $enemies = window.__engine.enemies, $buildings = window.__engine.buildings, $bosses = window.__engine.bosses, $psycho1 = window.__engine.psycho1, $psycho2 = window.__engine.psycho2, $props = window.__engine.props;
  $enemies.reg({
    id: 'phantom',
    stats: { hpCapBase:28, hpCapMult:0.9, spdCap:4.8, spd2:2.2, baseHp:3, si:30, spawnPad:12, w:22, h:28, col:'#1a001a' },
    unlockWave: 41,
    ai: { contactDmg: 0.18, contactDmgP2: 0.1, knockback: 4 },
    fire(e, c){
      e.st++;
      if(e.st>e.si){
        const a=Math.atan2(c.ldy,c.ldx);
        for(let i=0;i<2;i++) $buildings.bullets.push({x:e.x,y:e.y,vx:Math.cos(a+(i===0?-0.12:0.12))*9,vy:Math.sin(a+(i===0?-0.12:0.12))*9,own:'enemy',life:300,dmg:2,col:'#ff44ff',sz:3});
        e.st=0;
      }
      e._phantomTeleT=(e._phantomTeleT||0)+1;
      if(e._phantomTeleT>=240){
        e._phantomTeleT=0;
        const ang=Math.atan2($buildings.player.y-e.y,$buildings.player.x-e.x)+Math.PI;
        const tx=$buildings.player.x+Math.cos(ang)*50, ty=$buildings.player.y+Math.sin(ang)*50;
        if(!$psycho1.onBuilding(tx,ty,12)){
          for(let i=0;i<12;i++) $bosses.ptclQ(e.x,e.y,'#ff44ff',1,3+Math.random()*4);
          e.x=tx; e.y=ty;
          for(let i=0;i<12;i++) $bosses.ptclQ(e.x,e.y,'#ff44ff',1,3+Math.random()*4);
          $psycho2.floatText(e.x,e.y-30,'PHASE!','#ff44ff',10);
        }
      }
    },
    kill: { pts:60, xp:40, label:'◎ PHANTOM DISPERSED', color:'#ff44ff', shake:9, isElite:true },
    vis: { icon:'◈' },
    draw(e, facing){ $props.drawPhantom(e, facing); },
  });
});