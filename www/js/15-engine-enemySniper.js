/* SNIPER: holds 280px out, charges a laser telegraph, fires one fast 2-damage round, kites sideways when you close in,
   runs for cover when hurt. Rolls a 25% weapon drop (shotgun). */
window.__engine.files.push(function* enemySniper(){
  const $enemies = window.__engine.enemies, $buildings = window.__engine.buildings, $replay = window.__engine.replay, $core = window.__engine.core, $psycho1 = window.__engine.psycho1, $props = window.__engine.props;
  const S = $enemies.shared;
  $enemies.reg({
    id: 'sniper',
    stats: { hpCapBase:10, hpCapMult:0.6, spdCap:3.0, spd2:0.85, baseHp:1, si:200, spawnPad:12, w:20, h:24, col:'#2a5ba8' },
    unlockWave: 2,
    ai: { minDist: 280, sep: 38, leadT: 16, seeksCover: true, contactDmg: 0.1, contactDmgP2: 0.1, knockback: 4,
          personality(){ return 'cautious'; } },
    closeRange: 200,
    closeMove(e, c){ S.strafeStep(e, c.dx, c.dy, {margin:60, timer:40, speed:c.eSpd*0.9}); },
    fire(e, c){
      if(e._laserCharge===undefined) e._laserCharge=0;
      e._laserCharge++;
      const rate = e._isSuppressing ? Math.floor(e.si*0.5) : e.si;
      if(e._laserCharge>=rate){
        const a=Math.atan2(c.ldy,c.ldx);
        $buildings.bullets.push({x:e.x,y:e.y,vx:Math.cos(a)*8,vy:Math.sin(a)*8,own:'enemy',life:300,dmg:2,col:'#ff4400'});
        e._laserCharge=0;
      }
    },
    /* red dashed laser telegraph for the last 60 frames before the shot */
    drawOverlay(e, o){
      const charge = e._laserCharge || 0;
      const framesUntilFire = e.si - charge;
      if(framesUntilFire > 60) return;
      const ctx = $core.ctx;
      const targ = $replay.coopEnabled && $replay.player2 && !$replay.p2Down
        ? (Math.hypot($replay.player2.x-e.x,$replay.player2.y-e.y) < Math.hypot($buildings.player.x-e.x,$buildings.player.y-e.y) ? $replay.player2 : $buildings.player)
        : $buildings.player;
      const laserAngle = Math.atan2(targ.y - e.y, targ.x - e.x);
      const laserMaxLen = 400;
      const cosA = Math.cos(laserAngle), sinA = Math.sin(laserAngle);
      let laserLen;
      if(o.recalc || e._cachedLaserLen===undefined){
        laserLen = laserMaxLen;
        for(let dist2 = o.step; dist2 <= laserMaxLen; dist2 += o.step){
          if($psycho1.onBuilding(e.x + cosA * dist2, e.y + sinA * dist2, 2)){ laserLen = dist2 - o.step; break; }
        }
        e._cachedLaserLen = laserLen;
      } else { laserLen = e._cachedLaserLen; }
      const fadeIn = 1 - (framesUntilFire / 60);
      const flash = framesUntilFire < 20 ? ($buildings.tick % 4 < 2 ? 1.0 : 0.4) : fadeIn;
      ctx.save();
      ctx.globalAlpha = Math.min(0.75, flash * 0.75);
      ctx.strokeStyle = '#ff2200';
      ctx.lineWidth = framesUntilFire < 20 ? 2 : 1;
      if(!$core.isMobile&&!$core.isLowEndDesktop&&!$core.isUltraLow){ ctx.shadowColor = '#ff0000'; ctx.shadowBlur = framesUntilFire < 20 ? 10 : 4; }
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + cosA * laserLen, e.y + sinA * laserLen); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    },
    kill: { pts:25, xp:15, label:'◎ SNIPER DELETED', color:'#aaff00', shake:6, isElite:true, orbital:true, weaponDrop:'shotgun' },
    vis: { icon:'◎' },
    draw: S.drawInfantry,
  });
});