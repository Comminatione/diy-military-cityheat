/* v102: AUTHORED WAVES. A handful of waves per level replace the random spawn queue with a named encounter:
   a name + tagline banner, one signature mechanic, a colour tint, and one lesson (radio line).
   Everything else still uses buildWaveQueue/scheduleWaveSpawns. Hooks live in:
     05-mutators.js  nextWave()          -> $waves.pick / $waves.start
     08-legendary.js updateGame / draw() -> $waves.tick / $waves.draw
     07-psycho2.js   killEnemy()         -> e._onDeath(e)   (chain blasts, swarm splits)
   Add a wave: reg({...}) below, then reference its id in CURRICULA. */
window.__engine.files.push(function* waves(){
  const $waves     = window.__engine.waves;
  const $buildings = window.__engine.buildings;
  const $bosses    = window.__engine.bosses;
  const $core      = window.__engine.core;
  const $mutators  = window.__engine.mutators;
  const $props     = window.__engine.props;
  const $psycho1   = window.__engine.psycho1;
  const $psycho2   = window.__engine.psycho2;
  const $replay    = window.__engine.replay;
  const $legendary = window.__engine.legendary;
  const B = $buildings;
  Object.assign($waves, { pick, start, tick, draw, end, all: ()=>WAVES.slice(), curricula: ()=>CURRICULA });
  yield;
  const { _gst } = $buildings;
  const { onBuilding } = $psycho1;

  // ───────── registry ─────────
  const WAVES = [];
  const reg = d => { WAVES.push(d); return d; };
  const byId = id => WAVES.find(w => w.id === id) || null;

  // ───────── helpers ─────────
  const lowHw = () => !!($core.isUltraLow || $core.isLowEndDesktop);
  const spawnCap = () => lowHw() ? 14 : $core.isMobile ? 22 : 40;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const dist = (a, b, c, d) => Math.hypot(a - c, b - d);

  // damage the player the same way the other hazards do (shield soaks first, death goes through triggerPlayerDeath)
  function hurtPlayer(dmg, cause){
    const p = B.player; if(!p || B.playerDead) return;
    if(p.shield > 0){ p.shield = Math.max(0, p.shield - dmg * 15); return; }
    p.hp -= dmg;
    try{ $legendary.updateHP(); }catch(_e){}
    if(p.hp <= 0) try{ $props.triggerPlayerDeath(cause || 'fire'); }catch(_e){}
  }

  // ───────── active-wave state ─────────
  let cur = null;     // { def, wave, token, S:{}, ... }
  let _token = 0;

  function makeCtx(def, lvlWave, enemyCount){
    const token = ++_token;
    const ctx = {
      def, token, lvlWave, wave: B.wave, S: {},
      W: $replay.W, H: $replay.H,
      base: Math.max(1, enemyCount|0),
      alive(){ return cur && cur.token === token && B.state === 'playing'; },
      setTotal(n){ B.waveTotal = Math.max(1, n|0); },
      addTotal(n){ B.waveTotal += n|0; },
      // run fn after ms of *game* time; waits out pauses, drops itself if the wave is gone
      after(ms, fn){
        const go = (tries) => {
          if(!ctx.alive()) return;
          if(B.isPaused){ if(tries < 120) _gst(() => go(tries + 1), 500); return; }
          try{ fn(); }catch(e){ console.warn('[wave] step failed', def.id, e); }
        };
        _gst(() => go(0), ms);
      },
      // spawn through the REAL spawner (HP/speed scaling, skins, device remaps) then move the result.
      // x/y omitted = keep the building-door position the spawner picked.
      spawn(type, x, y, exact){
        const E = B.enemies, n0 = E.length;
        $bosses.spawnFromBuilding(type);
        const e = E.length > n0 ? E[E.length - 1] : null;
        if(!e) return null;
        if(x != null){
          let px = clamp(x, 14, ctx.W - 14), py = clamp(y, 14, ctx.H - 14), tries = 0;
          if(exact){ e.x = px; e.y = py; e.stuckX = px; e.stuckY = py; e._wave = def.id; return e; }
          while(onBuilding(px, py, 14) && tries++ < 14){ px = clamp(x + rnd(-70, 70), 14, ctx.W - 14); py = clamp(y + rnd(-70, 70), 14, ctx.H - 14); }
          if(!onBuilding(px, py, 14)){ e.x = px; e.y = py; e.stuckX = px; e.stuckY = py; }
        }
        e._wave = def.id;
        return e;
      },
      // a point on the map at least minD px from the player
      farPoint(minD){
        const p = B.player;
        for(let i = 0; i < 30; i++){
          const x = rnd(40, ctx.W - 40), y = rnd(40, ctx.H - 40);
          if(!onBuilding(x, y, 16) && (!p || dist(x, y, p.x, p.y) >= minD)) return { x, y };
        }
        return { x: ctx.W * 0.5, y: ctx.H * 0.12 };
      },
    };
    return ctx;
  }

  // ═══════════════════════════════════════════════════════════
  // 1. THE FUNNEL — everything comes out of ONE door
  // ═══════════════════════════════════════════════════════════
  reg({
    id: 'funnel', name: 'THE FUNNEL', tagline: 'One door. Hold it.',
    color: '#ff8800', tint: 'rgba(255,140,0,0.06)',
    hint: 'Ghost: "They\'re all coming out of one door. Pick your spot and make them come to you."',
    pools: ['urban', 'spaceship', 'warzone', 'jungle'], range: [2, 60],
    run(ctx){
      const total = clamp(Math.round(ctx.base * 1.5), 6, spawnCap());
      ctx.setTotal(total);
      const bs = $psycho1.buildings || [], p = B.player;
      // the door furthest from the player, so you have room to set up
      let door = null;
      if(bs.length){
        const b = bs.reduce((best, c) => dist(c.x, c.y, p.x, p.y) > dist(best.x, best.y, p.x, p.y) ? c : best, bs[0]);
        door = B.doorPos(b); ctx.S.door = door; ctx.S.bld = b;
      }
      for(let i = 0; i < total; i++){
        const f = i / total, type = f < 0.6 ? 'soldier' : f < 0.9 ? 'heavy' : 'berserker';
        ctx.after(i * 600, () => {
          // no buildings on this map -> door is null and the spawner uses a map edge
          ctx.spawn(type, door ? door.x : null, door ? door.y : null, true);
          if(door && ctx.S.bld) ctx.S.bld.spawnFlash = 1;
        });
      }
    },
    draw(ctx, c){
      const d = ctx.S.door; if(!d) return;
      const t = B.tick * 0.08, r = 20 + Math.sin(t) * 5;
      c.save(); c.strokeStyle = '#ff8800'; c.globalAlpha = 0.55 + Math.sin(t) * 0.2; c.lineWidth = 2;
      c.setLineDash([5, 5]); c.beginPath(); c.arc(d.x, d.y, r, 0, Math.PI * 2); c.stroke();
      c.setLineDash([]); c.globalAlpha = 0.8; c.fillStyle = '#ff8800';
      c.font = 'bold 10px "Share Tech Mono",monospace'; c.textAlign = 'center'; c.fillText('ENTRY', d.x, d.y - r - 6);
      c.restore();
    },
  });

  // ═══════════════════════════════════════════════════════════
  // 2. THE HUNT — snipers from every side
  // ═══════════════════════════════════════════════════════════
  reg({
    id: 'hunt', name: 'THE HUNT', tagline: 'Every rifle has an angle on you.',
    color: '#00aaff', tint: 'rgba(0,150,255,0.05)',
    hint: 'Ghost: "Snipers on every side. Watch for the red lines, and don\'t stand still."',
    pools: ['desert', 'arctic', 'mars', 'urban', 'jungle'], range: [2, 60],
    run(ctx){
      const N = clamp(2 + ctx.lvlWave, 4, 6);
      ctx.setTotal(N);
      const W = ctx.W, H = ctx.H;
      const spots = [[.1,.12],[.9,.12],[.1,.88],[.9,.88],[.5,.06],[.5,.94]];
      for(let i = 0; i < N; i++){
        const s = spots[i], pt = { x: s[0] * W, y: s[1] * H };
        ctx.after(i * 450, () => {
          let x = pt.x, y = pt.y;
          if(B.player && dist(x, y, B.player.x, B.player.y) < 260){ const f = ctx.farPoint(260); x = f.x; y = f.y; }
          ctx.spawn('sniper', x, y);
        });
      }
    },
  });

  // ═══════════════════════════════════════════════════════════
  // 3. THE CHASE — a sweeping line of fire; it burns enemies too
  // ═══════════════════════════════════════════════════════════
  reg({
    id: 'chase', name: 'THE CHASE', tagline: 'The fire never stops. Neither can you.',
    color: '#ff3300', tint: 'rgba(255,60,0,0.07)',
    hint: 'Ghost: "A firewall is sweeping the field. It burns them too, so lead them into it."',
    pools: ['desert', 'warzone', 'mars', 'jungle'], range: [2, 60],
    setup(ctx){
      ctx.S.fx = -70; ctx.S.dir = 1; ctx.S.halfW = 46;
      ctx.S.speed = clamp(ctx.W / 1500, 0.8, 1.7);   // px per frame; ~25s to cross
    },
    run(ctx){
      const total = clamp(Math.round(ctx.base * 1.1), 8, spawnCap());
      ctx.setTotal(total);
      for(let i = 0; i < total; i++) ctx.after(i * 650, () => ctx.spawn(Math.random() < 0.5 ? 'berserker' : 'soldier'));
    },
    tick(ctx, dt){
      const S = ctx.S, W = ctx.W;
      S.fx += S.dir * S.speed * dt;
      if(S.fx > W + 90) S.dir = -1; else if(S.fx < -90) S.dir = 1;
      const p = B.player;
      if(p && Math.abs(p.x - S.fx) < S.halfW) hurtPlayer(0.3 * dt, 'fire');
      if($replay.coopEnabled && $replay.player2 && !$replay.p2Down && Math.abs($replay.player2.x - S.fx) < S.halfW){
        const p2 = $replay.player2;
        if(p2.shield > 0) p2.shield = Math.max(0, p2.shield - 0.3 * dt * 15); else p2.hp -= 0.3 * dt;
      }
      const E = B.enemies;
      for(let i = 0; i < E.length; i++){
        const e = E[i];
        if(!e.alive || e.boss || Math.abs(e.x - S.fx) >= S.halfW) continue;
        e.hp -= 0.05 * dt; e.hitFlash = Math.max(e.hitFlash || 0, 3);
        if(e.hp <= 0) $psycho2.killEnemy(e);
      }
    },
    draw(ctx, c){
      const S = ctx.S, x = S.fx, hw = S.halfW, H = ctx.H, T = B.tick;
      c.save();
      const g = c.createLinearGradient(x - hw, 0, x + hw, 0);
      g.addColorStop(0, 'rgba(150,10,0,0)'); g.addColorStop(0.22, 'rgba(190,20,0,0.55)'); g.addColorStop(0.42, 'rgba(255,90,0,0.7)');
      g.addColorStop(0.5, 'rgba(255,235,120,0.85)'); g.addColorStop(0.58, 'rgba(255,90,0,0.7)'); g.addColorStop(0.78, 'rgba(190,20,0,0.55)'); g.addColorStop(1, 'rgba(150,10,0,0)');
      c.fillStyle = g; c.fillRect(x - hw, 0, hw * 2, H);
      if(!$core.isUltraLow){
        c.fillStyle = 'rgba(255,170,40,0.7)';
        const n = $core.isMobile ? 10 : 20;
        for(let i = 0; i < n; i++){
          const fy = ((i * 97 + T * 3) % H), fx = x + Math.sin(T * 0.1 + i * 2.3) * hw * 0.6;
          c.beginPath(); c.arc(fx, H - fy, 3 + (i % 3), 0, Math.PI * 2); c.fill();
        }
      }
      c.restore();
    },
  });

  // ═══════════════════════════════════════════════════════════
  // 4. THE SWARM — one enemy that splits when it dies
  // ═══════════════════════════════════════════════════════════
  reg({
    id: 'swarm', name: 'THE SWARM', tagline: 'Kill one, get two.',
    color: '#cc44ff', tint: 'rgba(160,0,255,0.07)',
    hint: 'Ghost: "It splits every time it dies. Keep killing the small ones before they surround you."',
    pools: ['spaceship', 'night', 'urban'], range: [2, 60],
    run(ctx){
      ctx.S.maxDepth = lowHw() ? 2 : 3;
      ctx.setTotal(1);
      ctx.after(0, () => { const e = ctx.spawn('heavy', ctx.W * 0.5, ctx.H * 0.12); if(e) armSplitter(ctx, e, 0); });
    },
  });
  function armSplitter(ctx, e, depth){
    e._depth = depth;
    const k = Math.pow(0.82, depth);
    e.w = Math.round(e.w * k); e.h = Math.round(e.h * k);
    e._onDeath = (dead) => {
      if(depth >= ctx.S.maxDepth || !ctx.alive()) return;
      ctx.addTotal(2);
      const hp0 = Math.max(1, Math.ceil(dead.maxHp / 2)), spd0 = dead.spd * 1.12;
      for(let i = 0; i < 2; i++){
        const c = ctx.spawn('heavy', dead.x + (i ? 16 : -16), dead.y + rnd(-8, 8));
        if(!c){ ctx.addTotal(-1); continue; }
        c.hp = c.maxHp = hp0; c.spd = spd0; c.si = Math.max(20, Math.round(c.si * 1.15));
        armSplitter(ctx, c, depth + 1);
      }
      $bosses.ptcl(dead.x, dead.y, '#cc44ff', 10, 4);
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 5. THE SILENCE — lights out; gunfire reveals
  // ═══════════════════════════════════════════════════════════
  reg({
    id: 'silence', name: 'THE SILENCE', tagline: 'You only see what shoots.',
    color: '#88ffcc', tint: null,
    hint: 'Ghost: "Total blackout. Muzzle flashes are the only light, so move after you fire."',
    pools: ['night', 'spaceship', 'arctic'], range: [2, 60],
    run(ctx){
      const N = clamp(Math.round(ctx.base * 0.8), 5, Math.min(18, spawnCap()));
      ctx.setTotal(N);
      for(let i = 0; i < N; i++){
        const r = i % 7, type = r === 6 ? 'sniper' : r % 3 === 2 ? 'heavy' : 'soldier';
        ctx.after(i * 1300, () => ctx.spawn(type));
      }
    },
    draw(ctx, c){
      const W = ctx.W, H = ctx.H, S = ctx.S;
      const sc = 0.5, w = Math.ceil(W * sc), h = Math.ceil(H * sc);
      if(!S.cv){ S.cv = document.createElement('canvas'); S.cv.width = w; S.cv.height = h; S.c = S.cv.getContext('2d'); S.spr = lightSprite(); }
      const o = S.c;
      o.globalCompositeOperation = 'source-over'; o.clearRect(0, 0, w, h);
      o.fillStyle = 'rgba(0,0,0,0.95)'; o.fillRect(0, 0, w, h);
      o.globalCompositeOperation = 'destination-out';
      const hole = (x, y, r, a) => { o.globalAlpha = a; o.drawImage(S.spr, (x - r) * sc, (y - r) * sc, r * 2 * sc, r * 2 * sc); };
      const p = B.player; if(p) hole(p.x, p.y, 135, 1);
      if($replay.coopEnabled && $replay.player2 && !$replay.p2Down) hole($replay.player2.x, $replay.player2.y, 120, 1);
      const bl = B.bullets;
      for(let i = 0; i < bl.length; i++){ const b = bl[i]; if(b.own === 'enemy') hole(b.x, b.y, 48, 0.9); else if(b.own === 'player') hole(b.x, b.y, 22, 0.5); }
      const E = B.enemies;   // sniper telegraph lines stay readable
      for(let i = 0; i < E.length; i++){ const e = E[i]; if(e.alive && e.type === 'sniper' && (e.si - (e._laserCharge || 0)) < 60) hole(e.x, e.y, 60, 0.8); }
      o.globalAlpha = 1; o.globalCompositeOperation = 'source-over';
      c.save(); c.imageSmoothingEnabled = true; c.drawImage(S.cv, -4, -4, W + 8, H + 8); c.restore();
    },
    end(ctx){ ctx.S.cv = null; ctx.S.c = null; },
  });
  function lightSprite(){
    const s = document.createElement('canvas'); s.width = s.height = 128;
    const g = s.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return s;
  }

  // ═══════════════════════════════════════════════════════════
  // 6. THE CHAIN — every kill detonates; blasts hurt everyone nearby
  // ═══════════════════════════════════════════════════════════
  const CHAIN_R = 70;   // same radius props.bomberDetonate uses for the player hit
  reg({
    id: 'chain', name: 'THE CHAIN', tagline: 'Every kill is a bomb.',
    color: '#ffd700', tint: 'rgba(255,215,0,0.05)',
    hint: 'Ghost: "Their bodies are rigged. Kill them far from you and close to each other."',
    pools: ['warzone', 'spaceship', 'mars', 'jungle'], range: [2, 60],
    run(ctx){
      const N = clamp(Math.round(ctx.base * 0.8), 6, Math.min(24, spawnCap()));
      ctx.setTotal(N);
      for(let i = 0; i < N; i++){
        ctx.after(i * 750, () => {
          const e = ctx.spawn(i % 4 === 3 ? 'heavy' : 'soldier');
          if(e) e._onDeath = chainBlast;
        });
      }
    },
    draw(ctx, c){
      const E = B.enemies, pulse = 0.5 + 0.5 * Math.sin(B.tick * 0.12);
      c.save(); c.lineWidth = 2.5; c.setLineDash([6, 5]);
      for(let i = 0; i < E.length; i++){
        const e = E[i]; if(!e.alive || e._onDeath !== chainBlast) continue;
        c.beginPath(); c.arc(e.x, e.y, CHAIN_R, 0, Math.PI * 2);
        c.globalAlpha = 0.10 + pulse * 0.06; c.fillStyle = '#ffcc00'; c.fill();
        c.globalAlpha = 0.55 + pulse * 0.35; c.strokeStyle = '#ff6a00'; c.stroke();
      }
      c.restore();
    },
  });
  function chainBlast(dead){
    dead._onDeath = null;
    try{ $props.bomberDetonate(dead); }catch(_e){}      // FX + shield-aware player/co-op damage + knockback
    const E = B.enemies.slice();
    for(let i = 0; i < E.length; i++){
      const q = E[i];
      if(!q.alive || q.boss || q === dead) continue;
      const d = dist(q.x, q.y, dead.x, dead.y);
      if(d >= CHAIN_R) continue;
      q.hp -= Math.max(2, Math.ceil(q.maxHp * 0.6 * (1 - d / CHAIN_R))); q.hitFlash = 8;
      if(q.hp <= 0) $psycho2.killEnemy(q);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 7. THE COUNT — five heavies, each tougher than the last
  // ═══════════════════════════════════════════════════════════
  const COUNT_HP = [0.8, 1.3, 2.0, 3.0, 4.5], ROMAN = ['I', 'II', 'III', 'IV', 'V'];
  reg({
    id: 'count', name: 'THE COUNT', tagline: 'Five of them. Each one harder.',
    color: '#ffffff', tint: 'rgba(255,255,255,0.03)',
    hint: 'Ghost: "Five heavies, one at a time. Save your best ammo for the last one."',
    pools: ['arctic', 'mars', 'desert'], range: [2, 60],
    run(ctx){
      ctx.setTotal(5);
      for(let i = 0; i < 5; i++){
        ctx.after(i * 4500, () => {
          const e = ctx.spawn('heavy');
          if(!e) return;
          e.maxHp = Math.max(2, Math.round(e.maxHp * COUNT_HP[i])); e.hp = e.maxHp;
          e.spd *= 0.85 + i * 0.06; e._countTier = i + 1;
        });
      }
    },
    draw(ctx, c){
      const E = B.enemies; c.save(); c.font = 'bold 14px "Share Tech Mono",monospace'; c.textAlign = 'center'; c.lineJoin = 'round'; c.lineWidth = 4; c.strokeStyle = '#000'; c.fillStyle = '#fff';
      for(let i = 0; i < E.length; i++){ const e = E[i]; if(!e.alive || !e._countTier) continue; const t = ROMAN[e._countTier - 1], y = e.y - e.h * 0.5 - 18; c.strokeText(t, e.x, y); c.fillText(t, e.x, y); }
      c.restore();
    },
  });

  // ═══════════════════════════════════════════════════════════
  // 8. THE GHOST — cloaked hunters
  // ═══════════════════════════════════════════════════════════
  reg({
    id: 'ghost', name: 'THE GHOST', tagline: 'You only see them when they shoot.',
    color: '#aaddff', tint: 'rgba(150,220,255,0.04)',
    hint: 'Ghost: "Cloaked hostiles. Listen for the shots, then shoot where they were."',
    pools: ['night', 'arctic', 'spaceship'], range: [2, 60],
    run(ctx){
      const N = clamp(Math.round(ctx.base * 0.6), 4, Math.min(14, spawnCap()));
      ctx.setTotal(N);
      for(let i = 0; i < N; i++) ctx.after(i * 1400, () => ctx.spawn('ghost'));
    },
  });

  // ───────── curriculum ─────────
  // Campaign levels are 5 waves: wave 1 is the scripted opener, wave 5 is the boss, so authored waves live in 2..4.
  // Order: [wave 2, wave 3, wave 4]; null = normal wave. Keys are level ids from GameDatabase.
  const CURRICULA = {
    1:  [null,      'funnel', null     ],   // Rookie Training (jungle): one lesson only
    2:  [null,      'hunt',   'chase'  ],   // Desert
    3:  ['funnel',  'hunt',   'swarm'  ],   // Urban
    9:  ['chase',   'chain',  'funnel' ],   // War Zone
    4:  ['hunt',    'count',  'silence'],   // Arctic
    5:  ['silence', 'ghost',  'swarm'  ],   // Night Raid
    6:  ['funnel',  'swarm',  'chain'  ],   // Space Infiltration
    7:  ['ghost',   'silence','chain'  ],   // Orbital Defense
    8:  ['chase',   'count',  'chain'  ],   // Mars Frontline
  };

  function pick(levelId, lvlWave, env, isEndless){
    if(isEndless){
      // endless: one authored wave per 5-wave block (the block's 3rd wave), chosen by environment, rotating
      if(lvlWave < 3 || lvlWave % 5 !== 3) return null;
      const ok = WAVES.filter(w => (!w.pools || w.pools.includes(env)) && lvlWave >= w.range[0] && lvlWave <= w.range[1]);
      return ok.length ? ok[Math.floor(lvlWave / 5) % ok.length] : null;
    }
    const cur = CURRICULA[levelId];
    if(!cur || lvlWave < 2 || lvlWave > 4) return null;
    return byId(cur[lvlWave - 2]);
  }

  // ───────── lifecycle ─────────
  function start(def, lvlWave, enemyCount){
    end();
    cur = makeCtx(def, lvlWave, enemyCount);
    $mutators._waveTypeQueue = [];          // don't let leftover random queue entries leak into forced spawns
    B._waveDef = def;
    // 2-second tell: name + tagline banner, then the lesson over the radio
    $bosses.announce(def.name + '<span class="wv-sub" style="color:' + def.color + '">' + def.tagline + '</span>', def.color, '0 0 20px ' + def.color);
    if(def.hint) _gst(() => $bosses.radioChatter(def.hint, def.color, 5200), 700);
    try{ if(def.setup) def.setup(cur); }catch(e){ console.warn('[wave] setup failed', def.id, e); }
    try{ def.run(cur); }
    catch(e){
      // never leave the player in a wave with zero enemies: fall back to the normal spawner
      console.warn('[wave] run failed, falling back', def.id, e);
      const n = Math.max(1, cur.base); B.waveTotal = n;
      const q = []; for(let i = 0; i < n; i++) q.push('soldier'); $mutators._waveTypeQueue = q;
      for(let i = 0; i < n; i++) _gst(() => { if(B.state === 'playing' && !B.isPaused) $bosses.spawnFromBuilding(); }, i * 700);
    }
  }

  function live(){
    if(!cur) return false;
    if(B.state !== 'playing' || !B.waveInProgress || B.wave !== cur.wave){ end(); return false; }
    return true;
  }
  function end(){
    if(!cur) { B._waveDef = null; return; }
    const c = cur; cur = null; B._waveDef = null;
    try{ if(c.def.end) c.def.end(c); }catch(_e){}
  }
  function tick(dt){
    if(!live() || !cur.def.tick) return;
    try{ cur.def.tick(cur, dt || 1); }catch(e){ console.warn('[wave] tick failed', e); }
  }
  function draw(){
    if(!live()) return;
    const c = $core.ctx, d = cur.def;
    try{
      if(d.tint){ c.save(); c.fillStyle = d.tint; c.fillRect(0, 0, cur.W, cur.H); c.restore(); }
      if(d.draw) d.draw(cur, c);
    }catch(e){ console.warn('[wave] draw failed', e); }
  }

  window.__waves = { byId, pick, all: WAVES, curricula: CURRICULA, force: (id) => { const d = byId(id); if(d) start(d, Math.max(2, B.wave), 12); } };
});