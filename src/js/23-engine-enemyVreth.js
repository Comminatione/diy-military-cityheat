/* VRETH ALIENS (Mars + spaceship levels).  Three alien-only enemy types that replace some ordinary grunts there.

   What makes them different from every other enemy:
     * POWER LEVEL: their HP, speed, fire rate and bullet damage scale as if it were wave 27 from the moment they spawn
       (ALIEN_SCALE_WAVE below). Later waves still scale them further.
     * HOVER: they float over buildings and obstacles, so cover does not stop them walking at you.
     * SPECIAL WEAPONS, all telegraphed so a careful player can always avoid them:
         VRETH WARDEN  - GRAVITY WELL. A purple ring marks a spot for 0.75 s, then a well pulls you toward its core for
                         ~2.3 s; the red core hurts. Leave the ring (or dash out) and it does nothing.
         VRETH LANCER  - RIFT LANCE. A cyan aim line tracks you, then LOCKS for 0.45 s and fires a piercing beam down
                         that lane. Step sideways off the lane. Afterwards it blinks to a new position.
         VRETH WEAVER  - PLASMA BLOOM. It freezes, glows for 0.6 s, then spins a twin spiral of slow plasma orbs for
                         1.3 s. Weave through the gaps or get behind it. It reverses spin every bloom.
     * All three damage you through the normal enemy-bullet path, so shields, i-frames and mutators work as usual.

   Spawning is handled by $enemies.vrethRoll(), called from 06-bosses spawnFromBuilding().  Tune ALIEN_SCALE_WAVE,
   the spawn chance / cap in vrethRoll, and the per-type numbers below. */
window.__engine.files.push(function* enemyVreth(){
  const $enemies = window.__engine.enemies, $buildings = window.__engine.buildings, $replay = window.__engine.replay,
        $core = window.__engine.core, $props = window.__engine.props, $bosses = window.__engine.bosses, $psycho2 = window.__engine.psycho2;
  const S = $enemies.shared;

  const ALIEN_SCALE_WAVE = 27;                 /* aliens are as strong as wave-27 enemies (never weaker) */
  $enemies.VRETH_SCALE_WAVE = ALIEN_SCALE_WAVE;

  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const cue = (e, d, f0, dur, type, gain, f1) => {          /* short audio warning, only for aliens that are near you */
    if(d > 720) return;
    try{ audioManager._tone(f0, dur, type, gain, f1); }catch(_e){}
  };
  /* Damage the player through the standard enemy-bullet hit path (shield, i-frames, hit direction, death handling...). */
  const zap = (x, y, dmg, col) => { $buildings.bullets.push({x, y, vx:0, vy:0, own:'enemy', life:2, dmg, col, sz:1, vreth:true}); };
  const targets = () => {
    const t = [$buildings.player];
    if($replay.coopEnabled && $replay.player2 && !$replay.p2Down) t.push($replay.player2);
    return t;
  };
  const clampMap = (v, max, m) => Math.max(m, Math.min(max - m, v));

  /* ---- spawn roll: called from spawnFromBuilding; returns an alien type id or null ---- */
  $enemies.vrethRoll = function(type, forceType, isBoot){
    if(forceType || isBoot || window.__DIY_STRESS) return null;
    if(type !== 'soldier' && type !== 'heavy' && type !== 'sniper') return null;   /* only replaces ordinary grunts */
    const env = $replay.currentEnv;
    if(env !== 'mars' && env !== 'spaceship') return null;
    if($core.isUltraLow) return null;
    const lw = Math.max(1, $buildings.wave - ($replay.waveOffset || 0));            /* wave inside this level */
    if(lw < 2) return null;
    const cap = Math.min(5, 2 + Math.floor(lw / 8));                                /* max aliens alive at once */
    let alive = 0;
    for(let i = 0; i < $buildings.enemies.length; i++){ const q = $buildings.enemies[i]; if(q.alive && q.vreth) alive++; }
    if(alive >= cap) return null;
    if(Math.random() >= Math.min(0.28, 0.06 + lw * 0.012)) return null;
    const pool = lw < 4 ? ['vreth_weaver', 'vreth_lancer'] : ['vreth_warden', 'vreth_lancer', 'vreth_weaver'];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  /* ---- shared drawing: hover shadow + the alien sprite, lifted and bobbing ---- */
  function hoverBody(e, facing, tint){
    const ctx = $core.ctx, t = $buildings.tick;
    const bob = Math.sin(t * 0.09 + (e.walkT || 0)) * 2;
    ctx.save();
    ctx.globalAlpha = 0.35; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 13, 11, 4.5, 0, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(0, -5 + bob);
    $props.drawAlienGrunt(e, facing);
    ctx.restore();
    /* hover ring */
    ctx.save();
    ctx.globalAlpha = 0.55 + 0.25 * Math.sin(t * 0.2);
    ctx.strokeStyle = tint; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(0, 9 + bob * 0.3, 13, 5, 0, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  const BASE_AI = { sep: 40, leadT: 12, noSuppress: true, hover: true, contactDmg: 0.15, contactDmgP2: 0.1, knockback: 2 };
  const VIS = (col, icon) => ({ prominent: true, hpBarW: 34, hpBarCol: col, icon, hpAlwaysOnLowEnd: true });

  /* =====================================================================================================
     VRETH WARDEN - gravity well
     ===================================================================================================== */
  const WELL_R = 125, WELL_CORE = 34, CAST_T = 45, WELL_T = 140;
  $enemies.reg({
    id: 'vreth_warden',
    vreth: true,
    stats: { hpCapBase:30, hpCapMult:1.1, spdCap:2.2, spd2:0.9, baseHp:3, si:330, spawnPad:16, w:26, h:30, col:'#7a2bd1', scaleWaveMin: ALIEN_SCALE_WAVE, vreth: true },
    unlockWave: 0,
    ai: Object.assign({}, BASE_AI, { minDist: 300 }),
    think(e, c){
      if(e._vs === undefined){ e._vs = 'idle'; e._vt = Math.floor(rnd(60, 130)); }
      const P = $buildings.player;
      if(e._vs === 'idle'){
        if(--e._vt <= 0 && c.d < 560){
          /* lock the well where you are heading in ~0.3 s; it will NOT follow you afterwards */
          e._wx = clampMap(e._aimX + (P.vx || 0) * 18, $replay.W, 60);
          e._wy = clampMap(e._aimY + (P.vy || 0) * 18, $replay.H, 60);
          e._vs = 'cast'; e._vt = CAST_T;
          cue(e, c.d, 200, 0.7, 'sine', 0.12, 520);
          $psycho2.floatText(e.x, e.y - 34, 'GRAVITY WELL', '#c070ff', 11);
        } else if(e._vt < -240){ e._vt = 30; }
      } else if(e._vs === 'cast'){
        e._sepHold = 2;                                    /* stand still while casting */
        if(--e._vt <= 0){ e._vs = 'well'; e._vt = WELL_T; cue(e, c.d, 90, 0.5, 'sawtooth', 0.1, 50); }
      } else if(e._vs === 'well'){
        e._vt--;
        for(const T of targets()){
          const rx = e._wx - T.x, ry = e._wy - T.y, rd = Math.hypot(rx, ry);
          if(rd < WELL_R && rd > 1){
            const pull = 0.7 * (1 - rd / WELL_R * 0.55);
            if(T === P){ P.kbx = (P.kbx || 0) + rx / rd * pull; P.kby = (P.kby || 0) + ry / rd * pull; }
          }
          if(rd < WELL_CORE && (e._vt % 20) === 0) zap(T.x, T.y, 2.5, '#ff2266');
        }
        if(e._vt <= 0){ e._vs = 'idle'; e._vt = e.si + Math.floor(rnd(-40, 60)); }
      }
    },
    fire(){ /* the Warden has no gun: the well is its weapon */ },
    drawOverlay(e){
      if(e._vs !== 'cast' && e._vs !== 'well') return;
      const ctx = $core.ctx, t = $buildings.tick, x = e._wx, y = e._wy;
      ctx.save();
      if(e._vs === 'cast'){
        const p = 1 - e._vt / CAST_T;
        ctx.globalAlpha = 0.25 + 0.5 * p;
        ctx.strokeStyle = '#c070ff'; ctx.lineWidth = 2; ctx.setLineDash([8, 6]);
        ctx.beginPath(); ctx.arc(x, y, WELL_R, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
        ctx.globalAlpha = 0.12 + 0.18 * p; ctx.fillStyle = '#7a2bd1';
        ctx.beginPath(); ctx.arc(x, y, WELL_R * p, 0, TAU); ctx.fill();
      } else {
        const fade = Math.min(1, e._vt / 20);
        ctx.globalAlpha = 0.18 * fade; ctx.fillStyle = '#5a1fa0';
        ctx.beginPath(); ctx.arc(x, y, WELL_R, 0, TAU); ctx.fill();
        ctx.globalAlpha = 0.7 * fade; ctx.strokeStyle = '#c070ff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, WELL_R, 0, TAU); ctx.stroke();
        for(let k = 0; k < 3; k++){                          /* inward-spiralling arcs */
          const r = WELL_R * (1 - (((t * 0.018) + k / 3) % 1));
          ctx.globalAlpha = 0.5 * fade * (r / WELL_R);
          ctx.beginPath(); ctx.arc(x, y, Math.max(2, r), t * 0.1 + k, t * 0.1 + k + 2.2); ctx.stroke();
        }
        ctx.globalAlpha = (0.45 + 0.3 * Math.sin(t * 0.4)) * fade; ctx.fillStyle = '#ff2266';
        ctx.beginPath(); ctx.arc(x, y, WELL_CORE, 0, TAU); ctx.fill();
      }
      ctx.restore();
    },
    kill: { pts:70, xp:45, label:'✦ VRETH WARDEN DOWN', color:'#c070ff', shake:8, isElite:true, orbital:true },
    vis: VIS('#c070ff', '✦'),
    draw(e, facing){
      hoverBody(e, facing, '#c070ff');
      const ctx = $core.ctx, t = $buildings.tick;
      ctx.save(); ctx.fillStyle = '#d9a0ff';
      for(let k = 0; k < 3; k++){                           /* orbiting gravity motes */
        const a = t * 0.07 + k * TAU / 3;
        ctx.globalAlpha = e._vs === 'cast' ? 1 : 0.8;
        ctx.beginPath(); ctx.arc(Math.cos(a) * 21, Math.sin(a) * 9 - 4, 2.4, 0, TAU); ctx.fill();
      }
      ctx.restore();
    },
  });

  /* =====================================================================================================
     VRETH LANCER - rift lance (locked lane beam) + blink
     ===================================================================================================== */
  const LANCE_LEN = 820, LANCE_HALF = 18, AIM_T = 72, LOCK_T = 32;
  $enemies.reg({
    id: 'vreth_lancer',
    vreth: true,
    stats: { hpCapBase:24, hpCapMult:1.0, spdCap:3.0, spd2:1.1, baseHp:2, si:260, spawnPad:14, w:22, h:30, col:'#16c7b8', scaleWaveMin: ALIEN_SCALE_WAVE, vreth: true },
    unlockWave: 0,
    ai: Object.assign({}, BASE_AI, { minDist: 340, sep: 36 }),
    closeRange: 220,
    closeMove(e, c){ S.strafeStep(e, c.dx, c.dy, { margin: 60, timer: 36, speed: c.eSpd * 0.9 }); },
    think(e, c){
      if(e._vs === undefined){ e._vs = 'idle'; e._vt = Math.floor(rnd(50, 110)); }
      if(e._beamT > 0) e._beamT--;
      if(e._ghostT > 0) e._ghostT--;
      if(e._vs === 'idle'){
        if(--e._vt <= 0 && c.d < 600){
          e._vs = 'aim'; e._vt = AIM_T; e._lanceA = Math.atan2(c.dy, c.dx);
          cue(e, c.d, 700, 0.9, 'sawtooth', 0.05, 1700);
        }
      } else if(e._vs === 'aim'){
        e._sepHold = 2;                                    /* plants its feet while aiming */
        if(e._vt > LOCK_T){                                /* tracking: the line follows you */
          let df = Math.atan2(c.dy, c.dx) - e._lanceA; df = Math.atan2(Math.sin(df), Math.cos(df));
          e._lanceA += Math.max(-0.045, Math.min(0.045, df));
        }                                                  /* last LOCK_T ticks: the lane is frozen - move off it */
        if(--e._vt <= 0){
          const ux = Math.cos(e._lanceA), uy = Math.sin(e._lanceA);
          for(const T of targets()){
            const rx = T.x - e.x, ry = T.y - e.y;
            const fwd = rx * ux + ry * uy, perp = Math.abs(rx * uy - ry * ux);
            if(fwd > 0 && fwd < LANCE_LEN && perp < LANCE_HALF) zap(T.x, T.y, 4, '#66fff0');
          }
          e._beamT = 10; e._beamA = e._lanceA; e._beamX = e.x; e._beamY = e.y;
          try{ $bosses.shake(5); }catch(_e){}
          cue(e, c.d, 1400, 0.25, 'square', 0.09, 300);
          /* blink away so it is never a stationary target for long */
          e._ghostX = e.x; e._ghostY = e.y; e._ghostT = 22;
          for(let k = 0; k < 8; k++){
            const a = rnd(0, TAU), dist = rnd(170, 270);
            const nx = clampMap(e.x + Math.cos(a) * dist, $replay.W, 40), ny = clampMap(e.y + Math.sin(a) * dist, $replay.H, 40);
            if(Math.hypot(nx - $buildings.player.x, ny - $buildings.player.y) > 230){ e.x = nx; e.y = ny; break; }
          }
          for(let k = 0; k < 8; k++) $bosses.ptcl(e.x, e.y, '#66fff0', 1, 3 + Math.random() * 3);
          e._vs = 'idle'; e._vt = e.si + Math.floor(rnd(-30, 50));
        }
      }
    },
    fire(){ /* the Lancer only uses the lance */ },
    drawOverlay(e){
      const ctx = $core.ctx;
      if(e._ghostT > 0){
        ctx.save(); ctx.globalAlpha = e._ghostT / 22 * 0.5; ctx.strokeStyle = '#66fff0'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(e._ghostX, e._ghostY, 14 + (22 - e._ghostT) * 0.8, 0, TAU); ctx.stroke(); ctx.restore();
      }
      if(e._beamT > 0){
        const a = e._beamA, k = e._beamT / 10;
        ctx.save(); ctx.globalAlpha = 0.9 * k; ctx.strokeStyle = '#e8fffd'; ctx.lineWidth = 8 + 24 * k; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(e._beamX, e._beamY); ctx.lineTo(e._beamX + Math.cos(a) * LANCE_LEN, e._beamY + Math.sin(a) * LANCE_LEN); ctx.stroke();
        ctx.globalAlpha = 0.5 * k; ctx.strokeStyle = '#16c7b8'; ctx.lineWidth = 3 + 40 * k;
        ctx.stroke(); ctx.restore();
      }
      if(e._vs !== 'aim') return;
      const locked = e._vt <= LOCK_T, a = e._lanceA, t = $buildings.tick;
      const x2 = e.x + Math.cos(a) * LANCE_LEN, y2 = e.y + Math.sin(a) * LANCE_LEN;
      ctx.save();
      if(!locked){
        ctx.globalAlpha = 0.4; ctx.strokeStyle = '#66fff0'; ctx.lineWidth = 1.5; ctx.setLineDash([10, 8]);
        ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
      } else {
        const flick = (t % 4 < 2) ? 1 : 0.65;               /* the lane the beam will fill: same width as the hit zone */
        ctx.globalAlpha = 0.22 * flick; ctx.strokeStyle = '#16c7b8'; ctx.lineWidth = LANCE_HALF * 2; ctx.lineCap = 'butt';
        ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.globalAlpha = 0.9 * flick; ctx.strokeStyle = '#e8fffd'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(x2, y2); ctx.stroke();
      }
      ctx.restore();
    },
    kill: { pts:70, xp:45, label:'✦ VRETH LANCER DOWN', color:'#66fff0', shake:8, isElite:true, orbital:true },
    vis: VIS('#66fff0', '✦'),
    draw(e, facing){
      hoverBody(e, facing, '#66fff0');
      const ctx = $core.ctx, t = $buildings.tick, aimGlow = e._vs === 'aim' ? 1 : 0.35;
      ctx.save(); ctx.rotate(e._vs === 'aim' ? e._lanceA : facing);
      ctx.globalAlpha = aimGlow; ctx.fillStyle = '#e8fffd';
      ctx.beginPath(); ctx.moveTo(18, -4); ctx.lineTo(28 + 2 * Math.sin(t * 0.3), 0); ctx.lineTo(18, 4); ctx.closePath(); ctx.fill();
      ctx.restore();
    },
  });

  /* =====================================================================================================
     VRETH WEAVER - plasma bloom (twin rotating spiral)
     ===================================================================================================== */
  const BLOOM_CHARGE = 36, BLOOM_T = 80, BLOOM_EVERY = 5, BLOOM_STEP = 0.34;
  $enemies.reg({
    id: 'vreth_weaver',
    vreth: true,
    stats: { hpCapBase:30, hpCapMult:1.2, spdCap:2.4, spd2:1.0, baseHp:3, si:300, spawnPad:15, w:24, h:30, col:'#e0409a', scaleWaveMin: ALIEN_SCALE_WAVE, vreth: true },
    unlockWave: 0,
    ai: Object.assign({}, BASE_AI, { minDist: 240 }),
    think(e, c){
      if(e._vs === undefined){ e._vs = 'idle'; e._vt = Math.floor(rnd(50, 120)); e._spin = Math.random() < 0.5 ? 1 : -1; }
      if(e._vs === 'idle'){
        if(--e._vt <= 0 && c.d < 520){
          e._vs = 'charge'; e._vt = BLOOM_CHARGE;
          e._spin = -e._spin;                              /* reverses every bloom so the pattern cannot be memorised */
          e._bA = Math.atan2(c.dy, c.dx) + rnd(-0.6, 0.6);
          cue(e, c.d, 160, 0.6, 'triangle', 0.1, 340);
          $psycho2.floatText(e.x, e.y - 34, 'PLASMA BLOOM', '#ff7ac0', 11);
        }
      } else if(e._vs === 'charge'){
        e._sepHold = 2;
        if(--e._vt <= 0){ e._vs = 'bloom'; e._vt = BLOOM_T; }
      } else if(e._vs === 'bloom'){
        e._sepHold = 2;
        const el = BLOOM_T - e._vt;
        if(el % BLOOM_EVERY === 0){
          const base = e._bA + (el / BLOOM_EVERY) * BLOOM_STEP * e._spin;
          for(let arm = 0; arm < 2; arm++){
            const a = base + arm * Math.PI;
            $buildings.bullets.push({ x:e.x, y:e.y, vx:Math.cos(a) * 4.6, vy:Math.sin(a) * 4.6, own:'enemy', life:260, dmg:1.6, col:'#ff7ac0', sz:4, vreth:true });
          }
        }
        if(--e._vt <= 0){ e._vs = 'idle'; e._vt = e.si + Math.floor(rnd(-30, 50)); }
      }
    },
    fire(){ /* the bloom is its only attack */ },
    drawOverlay(e){
      if(e._vs !== 'charge' && e._vs !== 'bloom') return;
      const ctx = $core.ctx, t = $buildings.tick;
      ctx.save();
      if(e._vs === 'charge'){
        const p = 1 - e._vt / BLOOM_CHARGE;
        ctx.globalAlpha = 0.3 + 0.5 * p; ctx.strokeStyle = '#ff7ac0'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(e.x, e.y, 18 + 30 * p, 0, TAU); ctx.stroke();
        ctx.globalAlpha = 0.15 + 0.25 * p; ctx.fillStyle = '#e0409a';
        ctx.beginPath(); ctx.arc(e.x, e.y, 18 + 30 * p, 0, TAU); ctx.fill();
        ctx.globalAlpha = 0.5 * p; ctx.setLineDash([6, 6]); ctx.lineWidth = 1.5;     /* preview of where the first arms leave */
        for(let arm = 0; arm < 2; arm++){
          const a = e._bA + arm * Math.PI;
          ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(a) * 90, e.y + Math.sin(a) * 90); ctx.stroke();
        }
        ctx.setLineDash([]);
      } else {
        const el = BLOOM_T - e._vt, base = e._bA + (el / BLOOM_EVERY) * BLOOM_STEP * e._spin;
        ctx.globalAlpha = 0.55; ctx.strokeStyle = '#ff7ac0'; ctx.lineWidth = 2;
        for(let arm = 0; arm < 2; arm++){
          const a = base + arm * Math.PI;
          ctx.beginPath(); ctx.moveTo(e.x + Math.cos(a) * 14, e.y + Math.sin(a) * 14); ctx.lineTo(e.x + Math.cos(a) * 34, e.y + Math.sin(a) * 34); ctx.stroke();
        }
        ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t * 0.5); ctx.beginPath(); ctx.arc(e.x, e.y, 24, 0, TAU); ctx.stroke();
      }
      ctx.restore();
    },
    kill: { pts:70, xp:45, label:'✦ VRETH WEAVER DOWN', color:'#ff7ac0', shake:8, isElite:true, orbital:true },
    vis: VIS('#ff7ac0', '✦'),
    draw(e, facing){
      hoverBody(e, facing, '#ff7ac0');
      const ctx = $core.ctx, t = $buildings.tick, hot = e._vs === 'charge' || e._vs === 'bloom';
      ctx.save();
      ctx.globalAlpha = hot ? 0.95 : 0.55; ctx.fillStyle = '#ffd0ea';
      ctx.beginPath(); ctx.arc(0, -5, 3 + (hot ? 1.5 * Math.sin(t * 0.5) : 0), 0, TAU); ctx.fill();
      ctx.restore();
    },
  });
});