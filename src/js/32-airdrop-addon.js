/* v100: level-up SUPPLY DROP (plane flyover -> parachute crate -> pick 1 of 3 supplies). Pixel-art in desert. */
window.__engine.files.push(function* airdrop(){
  const $buildings = window.__engine.buildings;
  const $bosses    = window.__engine.bosses;
  const $psycho2   = window.__engine.psycho2;
  const $replay    = window.__engine.replay;
  yield;
  const { el, showPickupMsg, _gst } = $buildings;

  // ───────── state ─────────
  const MAX_DROPS_PER_RUN=8, MAX_QUEUED=1;   // tune here
  let _dropsThisRun=0;
  const _room=()=>_dropsThisRun+_queue.length+(_active?1:0)<MAX_DROPS_PER_RUN && _queue.length<MAX_QUEUED;
  let _queue=[], _active=false, _panelOpen=false, _forcedPause=false, _plane=null, _crate=null;
  let _lastLevel=1, _lastTime=performance.now(), _playingFrames=0, _upWasOpen=false;
  // v106: drops are queued on level-up but only DELIVERED when the wave-clear upgrade panel opens
  const _upOpen=()=>{ const up=el('upgrade-panel'); return !!up&&up.style.display!=='none'&&up.style.display!==''; };
  function _startDeferred(){
    if(_active||_panelOpen||!_queue.length) return;
    _active=true; _queue.shift(); _dropsThisRun++; _spawnPlane();
    if(_plane){ _plane.vx=$replay.W/1.5; _plane.dropX=$replay.W*(0.2+Math.random()*0.4); _plane.deferred=true; }   // quick flyover so it lands inside the pause
  }
  const SUPPLY_CATS=['survival','ordnance','weapon','support','special'];
  const ONE_TIME=new Set(['shield_up','double_shield','hp_regen','speed_up','reload_up','sp_shock','sp_chaos','sp_overdrive','sp_orbital','sp_guardian','sp_vampire']);
  const PXOF=()=>window.__artPX($replay.W,$replay.H);
  const isDesert=()=>$replay.currentEnv==='desert';

  function _pickSupplies(n){
    const all=$psycho2.UPGRADES||[], pu=$psycho2.playerUpgrades||{}, taken=pu.taken||new Set();
    const pool=all.filter(u=>{
      if(!SUPPLY_CATS.includes(u.cat)) return false;
      if(u.minWave && $buildings.wave<u.minWave) return false;
      if(ONE_TIME.has(u.id)&&taken.has(u.id)) return false;
      if(u.perk&&$psycho2._perkEligible&&!$psycho2._perkEligible(u)) return false;
      if(u.id==='double_shield'&&!taken.has('shield_up')) return false;
      return true;
    });
    for(let i=pool.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
    const picks=pool.slice(0,n);
    // guarantee a special weapon slot ~65% of the time so they actually show up
    const sp=pool.filter(u=>u.cat==='special');
    if(sp.length&&!picks.some(u=>u.cat==='special')&&Math.random()<0.65&&picks.length) picks[picks.length-1]=sp[Math.floor(Math.random()*sp.length)];
    return picks;
  }

  // ───────── queue / trigger ─────────
  function _queueAirdrop(){
    if(!$buildings.player||$buildings.state!=='playing') return;
    if(!_room()) return;
    _queue.push({ts:performance.now()}); _processQueue();
  }
  function _processQueue(){
    if(_active||_panelOpen||!_queue.length) return;
    if($buildings.state!=='playing') return;
    if($buildings.playerDead){ _queue=[]; return; }
    if($buildings.isPaused){ _gst(_processQueue,500); return; }
    const up=el('upgrade-panel');
    if(up&&up.style.display!=='none'&&up.style.display!==''){ _gst(_processQueue,800); return; }
    _active=true; _queue.shift(); _dropsThisRun++; _spawnPlane();
  }

  // ───────── plane + crate ─────────
  function _spawnPlane(){
    const W=$replay.W,H=$replay.H;
    _plane={x:-120,y:Math.max(60,H*0.11),vx:W/2.4,dropX:W*(0.25+Math.random()*0.5),hasDropped:false,trail:[]};
    try{ audioManager._play(()=>audioManager._tone(70,0.5,'sawtooth',0.04,52)); }catch(e){}
    showPickupMsg('▸ SUPPLY DROP INBOUND','#ffcc00');
  }
  function _dropCrate(){
    if(!_plane||_plane.hasDropped) return;
    _plane.hasDropped=true;
    const W=$replay.W,H=$replay.H,pl=$buildings.player;
    const tx=pl?pl.x+(Math.random()-0.5)*100:W/2, ty=pl?pl.y-60+(Math.random()-0.5)*40:H/2;
    _crate={x:_plane.x,y:_plane.y,vx:_plane.vx*0.35,vy:40,targetX:Math.max(60,Math.min(W-60,tx)),targetY:Math.max(100,Math.min(H-100,ty)),landed:false,openDelay:0,glow:0};
    if(_plane.deferred){                             // wave-clear cards fill the centre: land the crate to one side, low
      const side=Math.random()<0.5; _crate.targetX=side?60+Math.random()*70:W-60-Math.random()*70; _crate.targetY=Math.min(H-100,H*0.8);
    }
    try{ audioManager._play(()=>audioManager._tone(400,0.12,'square',0.05,220)); }catch(e){}
  }
  function _updateAnimations(dt){
    if(_plane){
      _plane.x+=_plane.vx*dt;
      if(isDesert()&&_plane.trail){ _plane.trail.push({x:_plane.x-14,y:_plane.y+(Math.random()<0.5?-4:4),a:1}); if(_plane.trail.length>60) _plane.trail.shift(); for(const t of _plane.trail) t.a-=dt*0.9; }
      if(!_plane.hasDropped&&_plane.x>=_plane.dropX) _dropCrate();
      if(_plane.x>$replay.W+200) _plane=null;
    }
    if(_crate&&!_crate.landed){
      // parachute: gentle drift toward the target, capped fall speed (pure free-fall looks like a brick)
      _crate.vy=Math.min(_crate.vy+950*dt,230);
      _crate.x+=((_crate.targetX-_crate.x)*1.4)*dt+_crate.vx*dt; _crate.vx*=0.95;
      _crate.y+=_crate.vy*dt;
      if(_crate.y>=_crate.targetY-4&&_crate.vy>0){
        _crate.x=Math.abs(_crate.x-_crate.targetX)<80?_crate.x:_crate.targetX;
        _crate.y=_crate.targetY; _crate.landed=true; _crate.openDelay=0.95; _crate.glow=1;
        try{ $bosses.shake(4); $bosses.ptclBurst(_crate.x,_crate.y,isDesert()?'#f4cf78':'#ffcc00',12,5,20,3); audioManager.explosion(); }catch(e){}
        if(!$buildings.isPaused){ $buildings.isPaused=true; _forcedPause=true; }
      }
    }
    if(_crate&&_crate.landed){
      if(_upOpen()){                                   // wave-clear upgrade still being chosen: crate waits, glowing
        _crate.waiting=true; _crate.openDelay=Math.max(_crate.openDelay,0.6); _crate.glow=1;
      } else {
        if(_crate.waiting){                            // upgrade just picked: re-pause before the next wave starts, then open supplies
          _crate.waiting=false; _crate.openDelay=0.25;
          if(!$buildings.isPaused){ $buildings.isPaused=true; _forcedPause=true; }
        }
        _crate.openDelay-=dt; _crate.glow=Math.max(0.3,_crate.openDelay);
        if(_crate.openDelay<=0) _openPanel();
      }
    }
  }

  // ───────── pixel sprites (desert) ─────────
  const SP={};
  function mk(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
  function sprites(){
    if(SP.plane) return SP;
    let c=mk(30,15),g=c.getContext('2d'); const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
    R(4,6,22,3,'#3b4048'); R(26,7,2,1,'#3b4048'); R(4,8,22,1,'#262a30'); R(11,0,5,15,'#4a5058'); R(11,0,1,15,'#6a7078'); R(12,3,3,2,'#2a2e34'); R(12,10,3,2,'#2a2e34');
    R(2,3,3,9,'#4a5058'); R(1,6,3,3,'#3b4048'); R(21,6,3,2,'#7fb4d8'); R(21,6,3,1,'#bfe0f4'); R(8,14,3,1,'#262a30');
    SP.plane=c;
    const sh=mk(30,15),sg=sh.getContext('2d'); sg.drawImage(c,0,0); sg.globalCompositeOperation='source-in'; sg.fillStyle='rgba(70,52,92,0.30)'; sg.fillRect(0,0,30,15); SP.planeSh=sh;
    c=mk(10,10); g=c.getContext('2d'); R(0,0,10,10,'#3a2414'); R(1,1,8,8,'#a8742e'); R(1,1,8,1,'#cf983c'); R(1,4,8,1,'#8a5a22'); R(1,8,8,1,'#7a4c1c');
    R(4,1,2,8,'#5a3a1c');
    // tiny "?" in supply-yellow
    [[3,2],[4,2],[5,2],[6,3],[5,4],[4,5],[4,7]].forEach(p=>R(p[0],p[1],1,1,'#ffd700'));
    SP.crate=c;
    c=mk(26,10); g=c.getContext('2d');
    for(let y=0;y<10;y++) for(let x=0;x<26;x++){ const dx=(x-12.5)/13, dy=(y-9.5)/9.5; if(dx*dx+dy*dy<=1){ g.fillStyle=(Math.floor(x/3)&1)?'#e8e0c8':'#c8502c'; g.fillRect(x,y,1,1);} }
    R(0,9,26,1,'#7a3a1c'); SP.chute=c;
    return SP;
  }
  function pline(g,x0,y0,x1,y1,P,col){ g.fillStyle=col; let n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))/P|0; for(let i=0;i<=n;i++){ const t=n?i/n:0; g.fillRect(Math.round((x0+(x1-x0)*t)/P)*P,Math.round((y0+(y1-y0)*t)/P)*P,P,P); } }

  // ───────── overlay canvas ─────────
  function _overlay(){
    let c=document.getElementById('airdrop-canvas');
    if(!c){ c=document.createElement('canvas'); c.id='airdrop-canvas'; c.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;'; const s=document.getElementById('screen'); if(s) s.appendChild(c); }
    return c;
  }
  function _drawAnimations(){
    const c=_overlay(); if(!c) return;
    c.style.zIndex=((_plane||_crate)&&_upOpen())?'29':'4';
    const W=$replay.W,H=$replay.H;
    if(c.width!==W||c.height!==H){ c.width=W; c.height=H; }
    const ctx=c.getContext('2d'); ctx.clearRect(0,0,W,H);
    if(!_plane&&!_crate) return;
    if(isDesert()){ _drawPixel(ctx,W,H); return; }
    if(_plane){
      ctx.save(); ctx.translate(_plane.x,_plane.y);
      ctx.strokeStyle='rgba(200,200,200,0.35)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-90,0); ctx.lineTo(-25,0); ctx.stroke();
      ctx.fillStyle='#1a1a1a'; ctx.beginPath(); ctx.moveTo(34,0); ctx.lineTo(8,-9); ctx.lineTo(-32,-5); ctx.lineTo(-32,5); ctx.lineTo(8,9); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#333'; ctx.fillRect(-18,-13,22,4); ctx.fillRect(-18,9,22,4);
      ctx.fillStyle='#88ccff'; ctx.beginPath(); ctx.ellipse(16,0,5,3,0,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
    if(_crate){
      const cx=_crate.x,cy=_crate.y; ctx.save();
      if(!_crate.landed){
        const t=Math.max(0,Math.min(1,1-(_crate.targetY-cy)/420));
        ctx.globalAlpha=t*0.4; ctx.fillStyle='#000'; ctx.beginPath(); ctx.ellipse(cx,_crate.targetY,20*t+4,6*t+2,0,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
        ctx.fillStyle='rgba(255,200,80,0.85)'; ctx.beginPath(); ctx.arc(cx,cy-52,32,Math.PI,0); ctx.lineTo(cx+32,cy-8); ctx.lineTo(cx,cy-22); ctx.lineTo(cx-32,cy-8); ctx.closePath(); ctx.fill();
        ctx.strokeStyle='rgba(80,60,20,0.7)'; ctx.lineWidth=1; ctx.beginPath();
        ctx.moveTo(cx-28,cy-14); ctx.lineTo(cx-10,cy); ctx.moveTo(cx+28,cy-14); ctx.lineTo(cx+10,cy); ctx.moveTo(cx-28,cy-14); ctx.lineTo(cx+10,cy); ctx.moveTo(cx+28,cy-14); ctx.lineTo(cx-10,cy); ctx.stroke();
      }
      const S=28;
      ctx.fillStyle='#8a6a1e'; ctx.fillRect(cx-S/2,cy-S/2,S,S); ctx.fillStyle='#a8801e'; ctx.fillRect(cx-S/2,cy-S/2,S,6);
      ctx.strokeStyle='#3a2a08'; ctx.lineWidth=2; ctx.strokeRect(cx-S/2,cy-S/2,S,S);
      ctx.fillStyle='#3a2a08'; ctx.fillRect(cx-3,cy-S/2,6,S); ctx.fillRect(cx-S/2,cy-3,S,6);
      ctx.fillStyle='#ffd700'; ctx.font='bold 14px "Share Tech Mono", monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('?',cx,cy);
      if(_crate.landed){
        const g=0.4+0.6*Math.sin(performance.now()*0.01)*_crate.glow;
        ctx.save(); ctx.globalCompositeOperation='lighter';
        const grd=ctx.createRadialGradient(cx,cy,4,cx,cy,55); grd.addColorStop(0,'rgba(255,240,140,'+(0.9*g)+')'); grd.addColorStop(1,'rgba(255,200,60,0)');
        ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(cx,cy,55,0,Math.PI*2); ctx.fill(); ctx.restore();
      }
      ctx.restore();
    }
  }
  function _drawPixel(ctx,W,H){
    const P=PXOF(), S=sprites(); ctx.save(); ctx.imageSmoothingEnabled=false;
    const sn=v=>Math.round(v/P)*P;
    if(_plane){
      for(const t of _plane.trail||[]){ if(t.a<=0) continue; ctx.globalAlpha=Math.min(1,t.a)*0.75; ctx.fillStyle='#f4efe0'; ctx.fillRect(sn(t.x),sn(t.y),P,P); }
      ctx.globalAlpha=1;
      const px=sn(_plane.x-15*P/2), py=sn(_plane.y-7*P);
      ctx.drawImage(S.planeSh,px+P*3,py+P*7,30*P,15*P);   // high-altitude shadow, offset
      ctx.drawImage(S.plane,px,py,30*P,15*P);
    }
    if(_crate){
      const cx=sn(_crate.x), cy=sn(_crate.y);
      if(!_crate.landed){
        const t=Math.max(0,Math.min(1,1-(_crate.targetY-_crate.y)/420)), sw=Math.max(2,Math.round((3+t*7)))*P, sh=Math.max(1,Math.round(1+t*2))*P;
        ctx.globalAlpha=0.28+t*0.14; ctx.fillStyle='rgb(70,52,92)'; ctx.fillRect(sn(_crate.targetX-sw/2),sn(_crate.targetY+4),sw,sh); ctx.globalAlpha=1;
        const sway=Math.round(Math.sin(performance.now()*0.004)*1)*P;
        ctx.drawImage(S.chute,cx-13*P+sway,cy-17*P,26*P,10*P);
        const lc=['#2a1a10']; pline(ctx,cx-13*P+sway,cy-8*P,cx-4*P,cy-4*P,P,lc[0]); pline(ctx,cx+13*P+sway,cy-8*P,cx+4*P,cy-4*P,P,lc[0]); pline(ctx,cx+sway,cy-8*P,cx,cy-4*P,P,lc[0]);
      }
      ctx.drawImage(S.crate,cx-5*P,cy-5*P,10*P,10*P);
      if(_crate.landed){
        const tt=performance.now()*0.006, g=0.4+0.6*Math.abs(Math.sin(tt))*_crate.glow;
        ctx.fillStyle='rgba(255,240,140,'+(0.85*g)+')';
        for(let i=0;i<8;i++){ const a=tt*0.5+i*Math.PI/4, r=(9+Math.sin(tt*2+i)*1.5)*P; ctx.fillRect(sn(cx+Math.cos(a)*r),sn(cy+Math.sin(a)*r),P,P); }
        ctx.fillStyle='rgba(255,215,0,'+(0.7*g)+')'; ctx.fillRect(cx-P/2,sn(cy-8*P),P,P*2); ctx.fillRect(cx-P/2,sn(cy+7*P),P,P*2); ctx.fillRect(sn(cx-8*P),cy-P/2,P*2,P); ctx.fillRect(sn(cx+7*P),cy-P/2,P*2,P);
      }
    }
    ctx.restore();
  }

  // ───────── panel ─────────
  function _openPanel(){
    _panelOpen=true; _crate=null;
    if(!$buildings.isPaused){ $buildings.isPaused=true; _forcedPause=true; }
    const cards=_pickSupplies(3);
    if(!cards.length||typeof $psycho2.applyUpgrade!=='function'){ _finishPanel(); return; }
    const panel=document.createElement('div'); panel.id='airdrop-panel';
    panel.style.cssText='position:fixed;inset:0;z-index:96;background:rgba(0,0,0,0.9);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;';
    panel.innerHTML=`<div style="font-family:'Black Ops One',sans-serif;font-size:clamp(20px,5vw,34px);color:#ffcc00;letter-spacing:4px;text-shadow:0 0 20px #ffaa00,0 0 40px rgba(255,150,0,0.5);margin-bottom:4px;text-align:center;">▸ SUPPLY DROP</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:11px;color:#7a9a40;letter-spacing:3px;margin-bottom:22px;text-align:center;">LEVEL UP — CHOOSE YOUR SUPPLY</div>
      <div id="airdrop-cards" style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;max-width:760px;width:100%;padding:0 8px;box-sizing:border-box;"></div>`;
    document.body.appendChild(panel);
    const host=panel.querySelector('#airdrop-cards'); let picked=false;
    cards.forEach(u=>{
      const bc=u.col||'#aaff00', card=document.createElement('div');
      card.style.cssText=`background:rgba(20,15,0,0.95);border:2px solid ${bc}55;padding:22px 18px;cursor:pointer;text-align:center;min-width:140px;max-width:220px;flex:1 1 140px;min-height:160px;transition:all 0.18s;font-family:'Share Tech Mono',monospace;position:relative;overflow:hidden;touch-action:manipulation;-webkit-tap-highlight-color:transparent;border-radius:8px;box-shadow:0 0 18px ${bc}33;`;
      const cat={survival:'SURVIVAL',ordnance:'ORDNANCE',weapon:'WEAPON',support:'SUPPORT',special:'★ SPECIAL'}[u.cat]||'SUPPLY';
      card.innerHTML=`<div style="font-size:28px;margin-bottom:8px;">${u.icon||'▪'}</div><div style="font-size:8px;letter-spacing:3px;color:${bc};margin-bottom:6px;opacity:0.75;">${cat}</div><div style="color:${bc};font-size:12px;letter-spacing:2px;margin-bottom:6px;">${u.name}</div><div style="color:#8aac50;font-size:10px;line-height:1.5;">${u.desc}</div>`;
      card.onmouseover=()=>{card.style.borderColor=bc;card.style.transform='scale(1.04)';};
      card.onmouseout=()=>{card.style.borderColor=bc+'55';card.style.transform='';};
      const pick=()=>{
        if(picked) return; picked=true;
        try{ const d=$psycho2.applyUpgrade(u.id); audioManager.upgradeConfirm(); if(d) showPickupMsg((d.icon||'::')+' '+d.name,d.col||'#aaff00',d.desc); }catch(e){ console.warn('[airdrop] apply failed',e); }
        card.style.background=bc+'44'; card.style.transform='scale(1.08)'; _gst(()=>_finishPanel(),180);
      };
      card.addEventListener('click',pick);
      card.addEventListener('touchstart',e=>{e.preventDefault();pick();},{passive:false});
      host.appendChild(card);
    });
    try{ audioManager._play(()=>{[880,1100,1320].forEach(f=>audioManager._tone(f,0.18,'triangle',0.06));}); }catch(e){}
  }
  function _finishPanel(){
    _panelOpen=false; const p=document.getElementById('airdrop-panel'); if(p) p.remove();
    if(_forcedPause){ $buildings.isPaused=false; _forcedPause=false; }
    _active=false;                                   // any further queued drop waits for the next wave-clear
  }

  // ───────── loop ─────────
  function _tick(now){
    const dt=Math.min(0.05,(now-_lastTime)/1000); _lastTime=now;
    const st=$buildings.state, lvl=$buildings.playerLevel||1;
    if(st==='playing') _playingFrames++; else _playingFrames=0;
    const tut=$replay.currentLevel&&$replay.currentLevel.isTutorialLevel;
    if(st==='playing'&&lvl===1&&_lastLevel>1){ _lastLevel=1; _dropsThisRun=0; _queue=[]; _plane=null; _crate=null; _active=false; if(_panelOpen) _finishPanel(); }
    if(st==='playing'&&_playingFrames<25){ _lastLevel=lvl; }                 // run just (re)started / checkpoint restored: sync silently
    else if(st==='playing'&&lvl>_lastLevel){
      const gained=lvl-_lastLevel; _lastLevel=lvl;
      if(!tut){ for(let i=0;i<Math.min(gained,3);i++){ if(!_room()) break; _queue.push({ts:now}); } }
    } else if(lvl!==_lastLevel&&st!=='playing'){ _lastLevel=lvl; }
    if(st!=='playing'&&(_active||_queue.length||_plane||_crate||_panelOpen)){ _queue=[]; _plane=null; _crate=null; _active=false; if(_panelOpen) _finishPanel(); }
    if(_panelOpen&&!$buildings.isPaused) $buildings.isPaused=true;           // pause key must not leak the game behind the panel
    const _upNow=_upOpen();
    if(_upNow&&!_upWasOpen&&st==='playing'&&_queue.length&&!$buildings.playerDead) _startDeferred();
    _upWasOpen=_upNow;
    if(_plane||_crate) _updateAnimations(dt);
    _drawAnimations();
    requestAnimationFrame(_tick);
  }
  requestAnimationFrame(_tick);
  window._airdrop={trigger:_queueAirdrop,queue:()=>_queue,isActive:()=>_active,isPanelOpen:()=>_panelOpen};
});