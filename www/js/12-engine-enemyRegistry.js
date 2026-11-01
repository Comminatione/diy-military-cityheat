/* ENEMY REGISTRY (v106). One file per enemy type lives next to this one (soldier.js, heavy.js, ...).
   Each type file calls $enemies.reg({...}) and owns EVERYTHING that is specific to that type:
     stats        spawn table row (HP/speed/size/fire interval)      -> read by 06-bosses spawnFromBuilding
     unlockWave   first wave after which the type may spawn           -> read by 05-mutators _gateType
     ai           tuning numbers (minDist, sep, leadT, speedCap, contactDmg, knockback, personality...)
     think(e,c)   runs every frame before movement (windup, flank roll...)
     engageMove(e,c)  optional extra movement when at engage range (night strafe)
     closeMove(e,c) / closeRange   optional movement when the player is closer than closeRange (sniper kite)
     onTick(e,c)  runs every frame after movement (bomber fuse)
     fire(e,c)    how the type shoots  (c = {ldx,ldy,d,dx,dy,eSpd,minDist,night})
     onBulletHit(e,b,dmg)  may return a new damage number, or null to swallow the bullet (shield)
     kill         score / xp / kill-feed / shake / drops / onKill hook   -> read by 07-psycho2 killEnemy
     vis          outline, hp-bar, icon       -> read by the enemy draw pass in 08-legendary
     draw(e,facing)  body renderer, preDraw(e,facing) optional, drawOverlay(e) optional (sniper laser)
   Anything two or more types genuinely share lives in $enemies.shared (below), so a type file only
   mentions the helper by name instead of copy-pasting it. Unknown types fall back to DEFAULT. */
window.__engine.files.push(function* enemyRegistry(){
  const $enemies   = window.__engine.enemies;
  const $buildings = window.__engine.buildings;
  const $replay    = window.__engine.replay;
  const $psycho1   = window.__engine.psycho1;

  const TYPES = Object.create(null);
  const ORDER = [];

  const DEFAULT = {
    id: '_default',
    stats: null,
    unlockWave: 0,
    ai: { contactDmg: 0.1, contactDmgP2: 0.1, knockback: 4 },
    kill: { pts: 10, xp: 8, label: 'x ELIMINATED', color: '#aaff00', shake: 4, isElite: false, orbital: false },
    vis: { outlineR: 14, prominent: false, hpBarW: null, hpBarCol: '#dddd44', icon: null, iconMobile: false },
    draw(e, facing){ shared.drawInfantry(e, facing); },
  };

  function reg(def){
    if(!def || !def.id) throw new Error('enemy def needs an id');
    def.ai   = Object.assign({}, DEFAULT.ai,   def.ai);
    def.kill = Object.assign({}, DEFAULT.kill, def.kill);
    def.vis  = Object.assign({}, DEFAULT.vis,  def.vis);
    if(def.unlockWave === undefined) def.unlockWave = 0;
    if(!TYPES[def.id]) ORDER.push(def.id);
    TYPES[def.id] = def;
    return def;
  }
  const get = type => TYPES[type] || DEFAULT;
  function statsTable(){ const o = {}; for(const id of ORDER) o[id] = TYPES[id].stats; return o; }
  function unlockTable(){ const o = {}; for(const id of ORDER) o[id] = TYPES[id].unlockWave; return o; }

  /* ───── helpers shared by several types ───── */
  const shared = {
    /* Body renderer for the infantry family (soldier, sniper, heavy). On Mars / arctic levels they wear the alien / beast skin. */
    drawInfantry(e, facing){
      const P = window.__engine.props;
      if(e.skin==='alien') P.drawAlienGrunt(e, facing);
      else if(e.skin==='arctic') P.drawArcticBeast(e, facing);
      else P.drawSoldier(e, facing);
    },
    /* The plain "aim at the player and shoot" behaviour used by soldier, heavy and shield.
       While suppressing it fires a 3-bullet fan instead of a single shot. */
    genericFire(e, c){
      e.st++;
      if(e.st > e.si){
        const a = Math.atan2(c.ldy, c.ldx);
        if(e._isSuppressing){
          for(let s = -1; s <= 1; s++) $buildings.bullets.push({x:e.x,y:e.y,vx:Math.cos(a+s*0.18)*8,vy:Math.sin(a+s*0.18)*8,own:'enemy',life:300,dmg:1,col:'#ff4400'});
        } else {
          $buildings.bullets.push({x:e.x,y:e.y,vx:Math.cos(a)*8,vy:Math.sin(a)*8,own:'enemy',life:300,dmg:1,col:'#ff4400'});
        }
        e.st = 0;
      }
    },
    /* Sidestep perpendicular to the player, picking whichever side has more room before the map edge.
       Used by soldier (night strafe) and sniper (kiting). o = {margin, timer, speed}. */
    strafeStep(e, dx, dy, o){
      e._strafeTimer = (e._strafeTimer || 0) - 1;
      if(e._strafeTimer <= 0 || e._strafeDir === undefined){
        const ea = Math.atan2(dy, dx);
        const a1 = ea + Math.PI * 0.5, a2 = ea - Math.PI * 0.5;
        const m = o.margin, W = $replay.W, H = $replay.H;
        const x1 = e.x + Math.cos(a1) * 30, y1 = e.y + Math.sin(a1) * 30;
        const x2 = e.x + Math.cos(a2) * 30, y2 = e.y + Math.sin(a2) * 30;
        const s1 = Math.min(x1 - m, W - m - x1, y1 - m, H - m - y1);
        const s2 = Math.min(x2 - m, W - m - x2, y2 - m, H - m - y2);
        e._strafeDir = s1 >= s2 ? a1 : a2;
        e._strafeTimer = o.timer;
      }
      const sx = e.x + Math.cos(e._strafeDir) * o.speed;
      const sy = e.y + Math.sin(e._strafeDir) * o.speed;
      if(!$psycho1.onBuilding(sx, sy, 8)){ e.x = sx; e.y = sy; }
      else { e._strafeTimer = 0; }
    },
  };

  Object.assign($enemies, { reg, get, statsTable, unlockTable, shared, types: TYPES, order: ORDER, DEFAULT });
});