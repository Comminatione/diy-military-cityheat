/* BERSERKER: rushes in, winds up for 18 frames, then dashes ~50px straight at you. Fast, fragile, hits hard in melee. */
window.__engine.files.push(function* enemyBerserker(){
  const $enemies = window.__engine.enemies, $buildings = window.__engine.buildings, $bosses = window.__engine.bosses, $psycho1 = window.__engine.psycho1, $props = window.__engine.props;
  $enemies.reg({
    id: 'berserker',
    stats: { hpCapBase:14, hpCapMult:0.8, spdCap:4.2, spd2:2.8, baseHp:2, si:35, spawnPad:12, w:22, h:28, col:'#c81c1c' },
    unlockWave: 4,
    ai: { minDist: 45, noSuppress: true, sep: 28, speedCap: 4.2, contactDmg: 0.2, contactDmgP2: 0.2, knockback: 3, eliteKill: true,
          personality(){ return 'aggressive'; } },
    /* wind-up + dash */
    think(e, c){
      e._berzWindup = (e._berzWindup||0);
      e._berzCooldown = (e._berzCooldown||0) - 1;
      if(c.d < 200 && c.d > 45 && e._berzWindup === 0 && e._berzCooldown <= 0){
        e._berzWindup = 18;
        e._berzCooldown = 180;
        e._berzDirX = c.dx/(c.d||1);
        e._berzDirY = c.dy/(c.d||1);
      }
      if(e._berzWindup > 0){
        e._berzWindup--;
        e.hitFlash = (e.hitFlash||0) + 1;
        if(e._berzWindup === 0){
          for(let i=0;i<10;i++){
            const nx = e.x+e._berzDirX*(6+i*5), ny = e.y+e._berzDirY*(6+i*5);
            if(!$psycho1.onBuilding(nx,ny,8)){ e.x=nx; e.y=ny; } else break;
          }
          $bosses.ptcl(e.x,e.y,'#ff2200',4,4);
        }
      }
    },
    /* does not shoot while winding up */
    fire(e, c){
      if(!e._berzWindup){
        e.st++;
        if(e.st>e.si){ const a=Math.atan2(c.ldy,c.ldx); $buildings.bullets.push({x:e.x,y:e.y,vx:Math.cos(a)*7,vy:Math.sin(a)*7,own:'enemy',life:300,dmg:1,col:'#ff4400'}); e.st=0; }
      }
    },
    kill: { pts:20, xp:12, label:'▸ BERSERKER SLAIN', color:'#ff2200', shake:8, isElite:true },
    vis: { icon:'▸', iconMobile:true },
    draw(e, facing){ $props.drawBerserker(e, facing); },
  });
});