(function(){
  const KEY='diy_ach_v1';
  const TROPHY=(z)=>'<svg width="'+z+'" height="'+z+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/></svg>';

  const DEFS=[
    {id:'k1',n:'First Blood',d:'Get a kill',t:s=>s.kills>=1},
    {id:'k100',n:'Centurion',d:'100 lifetime kills',t:s=>s.kills>=100},
    {id:'k1k',n:'Meat Grinder',d:'1,000 lifetime kills',t:s=>s.kills>=1000},
    {id:'k10k',n:'One-Man Army',d:'10,000 lifetime kills',t:s=>s.kills>=10000},
    {id:'w5',n:'Dug In',d:'Reach wave 5',t:s=>s.bestWave>=5},
    {id:'w10',n:'Veteran',d:'Reach wave 10',t:s=>s.bestWave>=10},
    {id:'w20',n:'Unkillable',d:'Reach wave 20',t:s=>s.bestWave>=20},
    {id:'w40',n:'Legend',d:'Reach wave 40',t:s=>s.bestWave>=40},
    {id:'b1',n:'Giant Slayer',d:'Defeat a boss',t:s=>s.bosses>=1},
    {id:'b10',n:'Boss Hunter',d:'Defeat 10 bosses',t:s=>s.bosses>=10},
    {id:'s10k',n:'High Roller',d:'Score 10,000 in one run',t:s=>s.bestScore>=10000},
    {id:'s100k',n:'Warlord',d:'Score 100,000 in one run',t:s=>s.bestScore>=100000},
    {id:'r10',n:'Persistent',d:'Play 10 runs',t:s=>s.runs>=10}
  ];
  let S={kills:0,bestWave:0,bestScore:0,bosses:0,runs:0,got:{}};
  try{const r=localStorage.getItem(KEY);if(r)S=Object.assign(S,JSON.parse(r));}catch(e){}
  let _lastSaved='';const save=()=>{try{const j=JSON.stringify(S);if(j===_lastSaved)return;_lastSaved=j;localStorage.setItem(KEY,j);}catch(e){}};
  const g=n=>{try{return (0,eval)('typeof '+n+'!=="undefined"?'+n+':undefined');}catch(e){return undefined;}};
  const st=document.createElement('style');
  st.textContent='#ach-toast{position:fixed;top:max(12px,env(safe-area-inset-top));left:50%;transform:translate(-50%,calc(-100% - 24px));opacity:0;visibility:hidden;z-index:9999;background:rgba(2,10,1,.96);border:1px solid #aaff00;color:#aaff00;font:12px "Share Tech Mono",monospace;padding:10px 16px;letter-spacing:1px;transition:transform .4s,opacity .4s,visibility 0s linear .4s;pointer-events:none;text-align:center}#ach-toast.on{transform:translate(-50%,0);opacity:1;visibility:visible;transition-delay:0s}#ach-btn{position:fixed;right:max(10px,env(safe-area-inset-right));bottom:max(76px,calc(env(safe-area-inset-bottom) + 66px));opacity:.85;z-index:9998;width:40px;height:40px;border:1px solid #5aaa00;background:rgba(2,10,1,.85);color:#aaff00;font-size:18px;display:none;touch-action:manipulation}#ach-panel{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.94);color:#aaff00;font:13px "Share Tech Mono",monospace;display:none;overflow:auto;padding:max(16px,env(safe-area-inset-top)) 16px 24px;touch-action:pan-y}#ach-panel h2{font:22px "Black Ops One",sans-serif;letter-spacing:3px;margin-bottom:4px}#ach-panel .r{border:1px solid #2a5000;padding:10px;margin:8px 0;opacity:.4}#ach-panel .r.y{opacity:1;border-color:#aaff00}#ach-panel b{display:block;letter-spacing:1px}#ach-x{position:sticky;top:0;float:right;border:1px solid #aaff00;background:#000;color:#aaff00;padding:8px 14px;font:inherit;touch-action:manipulation}';
  document.head.appendChild(st);
  const toast=document.createElement('div');toast.id='ach-toast';document.body.appendChild(toast);
  const btn=document.createElement('button');btn.id='ach-btn';btn.innerHTML=TROPHY(22);btn.setAttribute('aria-label','Achievements');document.body.appendChild(btn);
  const panel=document.createElement('div');panel.id='ach-panel';document.body.appendChild(panel);
  let q=[],showing=false;
  function pump(){if(showing||!q.length)return;showing=true;const a=q.shift();toast.innerHTML=TROPHY(16)+' ACHIEVEMENT<br><b>'+a.n+'</b>'+a.d;toast.classList.add('on');setTimeout(()=>{toast.classList.remove('on');setTimeout(()=>{showing=false;pump();},450);},2800);}
  function check(){DEFS.forEach(a=>{if(!S.got[a.id]&&a.t(S)){S.got[a.id]=Date.now();q.push(a);}});save();pump();}
  function render(){const n=Object.keys(S.got).length;panel.innerHTML='<button id="ach-x">CLOSE</button><h2>ACHIEVEMENTS</h2><div>'+n+' / '+DEFS.length+' UNLOCKED</div>'+DEFS.map(a=>'<div class="r'+(S.got[a.id]?' y':'')+'"><b>'+a.n+'</b>'+a.d+'</div>').join('');panel.querySelector('#ach-x').onclick=()=>panel.style.display='none';}
  btn.addEventListener('click',e=>{e.stopPropagation();render();panel.style.display='block';});
  ['pointerdown','touchstart'].forEach(ev=>{btn.addEventListener(ev,e=>e.stopPropagation());panel.addEventListener(ev,e=>e.stopPropagation());});
  let lastK=0,lastBoss=false,lastState='';
  setInterval(()=>{
    if(document.hidden) return;
    const state=g('state'),k=g('totalKills'),w=g('wave'),sc=g('score'),ba=g('bossAlive');
    btn.style.display=(state&&state!=='playing')?'block':'none';
    if(state==='playing'&&lastState!=='playing'){S.runs++;lastK=(typeof k==='number')?k:0;}
    lastState=state||'';
    if(state!=='playing')return;
    if(typeof k==='number'){if(k>lastK)S.kills+=k-lastK;lastK=k;}
    if(typeof w==='number'&&w>S.bestWave)S.bestWave=w;
    if(typeof sc==='number'&&sc>S.bestScore)S.bestScore=sc;
    if(lastBoss&&!ba&&typeof w==='number'&&w>0)S.bosses++;
    lastBoss=!!ba;
    check();
  },500);
})();