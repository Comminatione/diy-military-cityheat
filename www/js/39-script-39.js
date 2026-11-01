(function(){
  var tries=0, t=setInterval(function(){
    var E=window.__engine;
    if(E&&E.psycho1&&E.props&&E.weather&&E.core&&E.replay&&E.buildings&&
       typeof E.props.drawProp==='function'&&typeof E.props.drawTree==='function'&&
       typeof E.weather.drawEnvironmentFX==='function'){
      clearInterval(t); try{ install(E); }catch(e){ console.warn('[biome-ambience] install failed',e); }
    } else if(++tries>200){ clearInterval(t); console.warn('[biome-ambience] engine not ready — skipped'); }
  },100);

  function install(E){
    var $psycho1=E.psycho1,$props=E.props,$weather=E.weather,$buildings=E.buildings,$replay=E.replay,$core=E.core;
    var CARC=[];
    var AMB={shafts:[],fireflies:[],leaves:[],mist:[],tumbleweeds:[],sandPuffs:[],vultures:[],ripples:[],t:0,nextTumble:6};
    var BIOME_TYPES={frond:1,fern:1,vine:1,log:1,mushroom:1,cactus:1,bones:1,rocks:1};
    var R=Math.random;

    var ua=navigator.userAgent||'';
    var av=(/Android (\d+)/.exec(ua)||[])[1], iv=(/(?:iPhone|iPad|iPod).*? OS (\d+)_/.exec(ua)||[])[1];
    var ANCIENT=!!((av&&+av<=5)||(iv&&+iv<=10)||/Opera Mini|MSIE |Trident\/|Windows Phone|Symbian|BlackBerry|Series60/.test(ua));
    function tier(){
      if(window.__DIY_STRESS) return 2;
      var q=$buildings._dqsQuality; if(q===undefined||q===null) q=1;
      if(ANCIENT||$core.isVeryLow||q<0.15) return 0;
      if($core.isUltraLow||$core.isLowEndDesktop||$buildings.settingPerfMode||q<0.4) return 1;
      if(window.__fxLv&&window.__fxLv()<2) return 1;
      return 2;
    }
    function liteEnv(e){ return e==='jungle'||e==='desert'||e==='urban'; }

    var BAKE_PER_FRAME=6, budget=BAKE_PER_FRAME;
    function rscale(){ var w=$replay.W||1, s=(($core.canvas&&$core.canvas.width)||w)/w; return s<0.25?0.25:(s>1?1:s); }
    function mk(w,h){ var rs=rscale(), c=document.createElement('canvas'); c.width=Math.max(1,Math.ceil(w*rs)); c.height=Math.max(1,Math.ceil(h*rs)); c._rs=rs; return c; }
    function bake(ox,oy,w,h,fn){
      var c=mk(w,h), g=c.getContext('2d'), real=$core.ctx, ok=true;
      g.scale(c._rs,c._rs); g.translate(-ox,-oy);
      $core.ctx=g;
      try{ fn(); }catch(e){ ok=false; } finally{ $core.ctx=real; }
      return ok?c:null;
    }

    var origTree=$props.drawTree;
    $props.drawTree=function(t,env){
      var e=$replay.currentEnv;
      if(t&&(e==='jungle'||e==='urban')&&!t._sprFail&&tier()<2){
        var key=e+($buildings.settingPerfMode?1:0), s=t._spr;
        if(!s||s.key!==key){
          if(budget>0){
            budget--;
            var urban=e==='urban', th=t.trunkH, tr=t.r, ox,oy,w,h;
            if(urban){ ox=-48; oy=-(2*th+50); w=100; h=2*th+72; }
            else { var hw=Math.ceil(1.3*tr+26); ox=-hw; oy=-Math.ceil(th+1.3*tr+14); w=hw*2; h=Math.ceil(th+1.8*tr+36); }
            var q={x:0,y:0,r:tr,trunkH:th,phase:-($buildings.tick||0)*0.018};
            var c=bake(ox,oy,w,h,function(){ origTree.call($props,q,env); });
            if(!c){ t._sprFail=true; return origTree.apply(this,arguments); }
            s=t._spr={c:c,ox:ox,oy:oy,w:w,h:h,key:key};
          } else return origTree.apply(this,arguments);
        }
        var sway=(e==='jungle')?Math.sin(($buildings.tick||0)*0.018+t.phase)*1.2:0;
        $core.ctx.drawImage(s.c,Math.round(t.x+s.ox+sway),Math.round(t.y+s.oy),s.w,s.h);
        return;
      }
      return origTree.apply(this,arguments);
    };

    function makeProp(type,x,y){
      switch(type){
        case 'fern': return {type:type,x:x,y:y,r:8+R()*6,fronds:6+Math.floor(R()*3),phase:R()*6.283};
        case 'frond': return {type:type,x:x,y:y,len:22+R()*18,rot:R()*6.283,leaflets:6+Math.floor(R()*3),col:R()<0.5?'#2f6a1a':'#3f7a24'};
        case 'vine': return {type:type,x:x,y:y,len:26+R()*38,segs:4+Math.floor(R()*4),width:2+R()*1.4,sway:R()*6.283,leaves:3+Math.floor(R()*4),col:R()<0.5?'#153206':'#1e420a'};
        case 'log': return {type:type,x:x,y:y,len:30+R()*22,thick:6+R()*3,rot:R()*Math.PI,moss:R()<0.7};
        case 'mushroom': return {type:type,x:x,y:y,h:4+R()*4,capR:3+R()*2.5,col:R()<0.5?'#cc4422':'#ddaa33'};
        case 'cactus': return {type:type,x:x,y:y,h:22+R()*16,arms:R()<0.6?(R()<0.5?1:2):0,armY:0.45+R()*0.3,col:R()<0.5?'#4a6a2a':'#5a7a34'};
        case 'bones': { var b=[],n=2+Math.floor(R()*3); for(var i=0;i<n;i++) b.push({dx:(R()-0.5)*22,dy:(R()-0.5)*12,r:2+R()*4,rot:R()*Math.PI}); return {type:type,x:x,y:y,bits:b}; }
        case 'rocks': { var s=[],m=2+Math.floor(R()*3); for(var j=0;j<m;j++) s.push({dx:(R()-0.5)*22,dy:(R()-0.5)*10,r:3+R()*5,col:['#7a5a3a','#8a6a48','#6a4a2a'][Math.floor(R()*3)]}); return {type:type,x:x,y:y,stones:s}; }
      }
      return {type:type,x:x,y:y};
    }
    function ell(g,x,y,rx,ry,rot){ g.beginPath(); g.ellipse(x,y,rx,ry,rot||0,0,6.2832); }

    function drawBiomeProp(p,env,t){
      var g=$core.ctx,i;
      g.save(); g.translate(p.x,p.y);
      if(p.type==='fern'){
        g.rotate(Math.sin(t*1.4+p.phase)*0.1);
        for(i=0;i<p.fronds;i++){
          var a=-Math.PI/2+(i-(p.fronds-1)/2)*0.32, len=p.r*(0.85+0.3*Math.sin(i*1.7));
          var ex=Math.cos(a)*len, ey=Math.sin(a)*len;
          g.strokeStyle=env.leafCol||'#2e7a16'; g.lineWidth=1.6; g.beginPath(); g.moveTo(0,0); g.quadraticCurveTo(ex*0.4,ey*0.55,ex,ey); g.stroke();
          g.strokeStyle=env.leafHi||'#7fd456'; g.globalAlpha=0.7; g.lineWidth=1; g.beginPath(); g.moveTo(0,0); g.quadraticCurveTo(ex*0.4,ey*0.55,ex*0.7,ey*0.75); g.stroke(); g.globalAlpha=1;
        }
      } else if(p.type==='frond'){
        g.rotate(p.rot); g.fillStyle='rgba(0,0,0,0.2)'; ell(g,1,2,p.len*0.55,2.4); g.fill();
        g.strokeStyle='#1a3a10'; g.lineWidth=1.6; g.beginPath(); g.moveTo(-p.len/2,0); g.quadraticCurveTo(0,-3,p.len/2,1); g.stroke();
        g.fillStyle=p.col;
        for(i=0;i<p.leaflets;i++){ var ft=(i+0.5)/p.leaflets, fx=-p.len/2+ft*p.len, fy=-3*Math.sin(ft*Math.PI)*0.9, fl=5.5*(1-Math.abs(ft-0.45)*0.9);
          for(var sd2=-1;sd2<=1;sd2+=2){ g.beginPath(); g.ellipse(fx,fy+sd2*fl*0.55,fl*0.55,1.3,sd2*0.8,0,6.283); g.fill(); } }
      } else if(p.type==='vine'){
        var sw=Math.sin(t*0.7+p.sway)*4, sl=p.len/p.segs; g.lineCap='round';
        g.strokeStyle='#0a0a0a'; g.lineWidth=p.width+1.4; g.beginPath(); g.moveTo(0,0); for(i=1;i<=p.segs;i++) g.lineTo(sw*(i/p.segs),i*sl); g.stroke();
        g.strokeStyle=p.col; g.lineWidth=p.width; g.beginPath(); g.moveTo(0,0); for(i=1;i<=p.segs;i++) g.lineTo(sw*(i/p.segs),i*sl); g.stroke();
        g.fillStyle=env.leafHi||'#7fd456';
        for(i=0;i<p.leaves;i++){ var f=(i+0.5)/p.leaves; ell(g,sw*f+(i%2?-3:3),f*p.len,2.6,1.4,i%2?-0.5:0.5); g.fill(); }
      } else if(p.type==='log'){
        g.rotate(p.rot); g.fillStyle='rgba(0,0,0,0.25)'; ell(g,1,3,p.len*0.55,p.thick*0.6); g.fill();
        g.fillStyle='#4a2a08'; g.fillRect(-p.len/2,-p.thick/2,p.len,p.thick);
        g.fillStyle='#5a3a18'; g.fillRect(-p.len/2,-p.thick/2,p.len,p.thick*0.4);
        g.strokeStyle='#0a0a0a'; g.lineWidth=1.4; g.strokeRect(-p.len/2,-p.thick/2,p.len,p.thick);
        if(p.moss){ g.fillStyle='#2d6018'; for(i=0;i<5;i++){ ell(g,-p.len/2+(i+0.5)*(p.len/5),-p.thick/2+1,3,1.4); g.fill(); } }
      } else if(p.type==='mushroom'){
        g.fillStyle='#e8d8b8'; g.fillRect(-1,-p.h,2,p.h);
        g.fillStyle=p.col; g.beginPath(); g.ellipse(0,-p.h,p.capR,p.capR*0.55,0,Math.PI,Math.PI*2); g.fill();
        g.fillStyle='rgba(255,255,255,0.7)'; g.beginPath(); g.arc(-p.capR*0.3,-p.h-0.6,0.7,0,6.283); g.fill(); g.beginPath(); g.arc(p.capR*0.25,-p.h-0.4,0.6,0,6.283); g.fill();
      } else if(p.type==='cactus'){
        g.fillStyle='rgba(0,0,0,0.28)'; ell(g,1,2,7,2.5); g.fill();
        var seg=function(pts,w,col){ g.strokeStyle=col; g.lineWidth=w; g.beginPath(); g.moveTo(pts[0][0],pts[0][1]); for(var k=1;k<pts.length;k++) g.lineTo(pts[k][0],pts[k][1]); g.stroke(); };
        var trunk=[[0,0],[0,-p.h]]; seg(trunk,8.6,'#0a0a0a'); seg(trunk,6,p.col);
        if(p.arms>=1){ var ay=-p.h*p.armY, a1=[[0,ay],[-8,ay],[-8,ay-9]]; seg(a1,7.2,'#0a0a0a'); seg(a1,5,p.col); }
        if(p.arms>=2){ var by=-p.h*(p.armY+0.15), a2=[[0,by],[7,by],[7,by-8]]; seg(a2,7.2,'#0a0a0a'); seg(a2,5,p.col); }
        g.strokeStyle='rgba(255,255,255,0.1)'; g.lineWidth=0.8;
        for(i=0;i<5;i++){ var yy=-p.h*(0.15+i*0.15); g.beginPath(); g.moveTo(-1.5,yy); g.lineTo(1.5,yy); g.stroke(); }
      } else if(p.type==='bones'){
        g.fillStyle='rgba(0,0,0,0.22)'; ell(g,0,2,12,3); g.fill();
        for(i=0;i<p.bits.length;i++){ var b=p.bits[i]; g.save(); g.translate(b.dx,b.dy); g.rotate(b.rot); g.fillStyle='#ddd0b0'; ell(g,0,0,b.r,b.r*0.5); g.fill(); g.strokeStyle='#8a7a50'; g.lineWidth=0.7; g.stroke(); g.restore(); }
      } else if(p.type==='rocks'){
        for(i=0;i<p.stones.length;i++){ var s=p.stones[i];
          g.fillStyle='rgba(0,0,0,0.25)'; ell(g,s.dx+1,s.dy+2,s.r,s.r*0.4); g.fill();
          g.fillStyle=s.col; ell(g,s.dx,s.dy,s.r,s.r*0.7); g.fill();
          g.fillStyle='rgba(255,255,255,0.12)'; ell(g,s.dx-s.r*0.3,s.dy-s.r*0.3,s.r*0.5,s.r*0.25); g.fill(); }
      }
      g.restore();
    }

    var PB={ rock:[-30,-26,60,52], debris:[-24,-20,48,40], lamp:[-20,-54,40,70], car:[-34,-28,68,46],
             fern:[-20,-24,40,32], frond:[-26,-22,52,44], vine:[-14,-8,28,82], log:[-36,-36,72,72], mushroom:[-10,-16,20,22],
             cactus:[-18,-52,36,62], bones:[-22,-16,44,32], rocks:[-24,-18,48,40], 'landmark-wreck':[-96,-64,192,128] };

    var origProp=$props.drawProp;
    function spriteProp(p,env){
      var e=$replay.currentEnv, key=e+($buildings.settingPerfMode?1:0), s=p._spr, b=PB[p.type];
      if(!s||s.key!==key){
        if(budget<=0) return false;
        budget--;
        var q=Object.assign({},p,{x:0,y:0}); delete q._spr;
        if(p.type==='landmark-wreck'){ q._smoke=[]; q._lastSmokeT=0; }
        var tt=($buildings.tick||0)*0.016;
        var c=bake(b[0],b[1],b[2],b[3],function(){ if(BIOME_TYPES[q.type]) drawBiomeProp(q,env||{},tt); else origProp.call($props,q,env); });
        if(!c){ p._sprFail=true; return false; }
        s=p._spr={c:c,ox:b[0],oy:b[1],w:b[2],h:b[3],key:key};
      }
      var tk=$buildings.tick||0, sw=0;
      if(p.type==='vine') sw=Math.sin(tk*0.0112+p.sway)*1.4; else if(p.type==='fern') sw=Math.sin(tk*0.0224+p.phase)*0.8;
      $core.ctx.drawImage(s.c,Math.round(p.x+s.ox+sw),Math.round(p.y+s.oy),s.w,s.h);
      return true;
    }
    $props.drawProp=function(p,env){
      if(p&&PB[p.type]&&!p._sprFail&&liteEnv($replay.currentEnv)&&tier()<2){ if(spriteProp(p,env)) return; }
      if(p&&BIOME_TYPES[p.type]) return drawBiomeProp(p,env||{}, ($buildings.tick||0)*0.016);
      return origProp.apply(this,arguments);
    };

    function carcassPass(g,W,H,env){
      var sd=((W*131+H*17)>>>0||1)^(env==='desert'?0x5bd1e995:0); sd=sd>>>0||1;
      var rnd=function(){ sd^=sd<<13; sd>>>=0; sd^=sd>>>17; sd^=sd<<5; sd>>>=0; return sd/4294967296; };
      var area=W*H/(900*600), i, desert=(env==='desert');
      var kinds=desert?['camel','deer','soldier','enemy','bird']:(tier()<2?['boar','deer','monkey','jaguar','soldier','deer','boar']:['boar','deer','monkey','bird','jaguar','soldier','enemy','deer','boar']);
      var STAIN={bird:18,monkey:28,boar:40,deer:50,jaguar:42,soldier:36,enemy:36,camel:58};
      var PADK={bird:46,monkey:56,boar:78,deer:90,jaguar:82,soldier:72,enemy:72,camel:104};
      var bl=($psycho1&&$psycho1.buildings)||[], placed=[], spX=W/2, spY=H*0.72;
      var nCorp0=desert?Math.min(Math.round(1.2*area)+2,4):Math.min(Math.round(2.4*area)+3,7), _tl=tier(), nCorp=_tl===0?Math.min(nCorp0,2):_tl===1?Math.min(nCorp0,desert?3:4):nCorp0;
      CARC.length=0;
      function corpseBlocked(cx,cy,pd){
        for(var bi=0;bi<bl.length;bi++){ var bb=bl[bi]; if(cx>bb.x-pd&&cx<bb.x+bb.w+pd&&cy>bb.y-pd&&cy<bb.y+bb.h+pd) return true; }
        if(Math.abs(cx-spX)<150&&Math.abs(cy-spY)<150) return true;
        for(var pi=0;pi<placed.length;pi++){ var dx=cx-placed[pi][0], dy=cy-placed[pi][1]; if(dx*dx+dy*dy<(desert?32400:8100)) return true; }
        return false;
      }
      var BONE='#efe7cf', BSH='#b9ad8c', OUT='#1f160e';
      function seg(x1,y1,x2,y2,w,col){ g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.lineWidth=w; g.strokeStyle=col; g.stroke(); }
      function bone(x1,y1,x2,y2,w){ g.lineCap='round'; seg(x1,y1,x2,y2,w+1.7,OUT); seg(x1,y1,x2,y2,w,BONE); }
      function knob(x,y,r){ g.fillStyle=BONE; g.strokeStyle=OUT; g.lineWidth=0.9; g.beginPath(); g.arc(x,y,r,0,6.283); g.fill(); g.stroke(); }
      function spine(x1,x2,w){ bone(x1,0,x2,0,w); var st=(x2>x1?1:-1)*2.4; for(var x=x1;(st>0?x<=x2:x>=x2);x+=st) knob(x,0,w*0.62); }
      function ribs(x0,n,sp,len,fwd){
        for(var k=0;k<n;k++){ var x=x0+k*sp, L=len*(1-0.32*Math.abs(k-(n-1)/2)/Math.max(1,n/2));
          for(var sd2=-1;sd2<=1;sd2+=2){
            g.lineCap='round'; g.beginPath(); g.moveTo(x,0); g.quadraticCurveTo(x+fwd,sd2*L*0.85,x+fwd*0.3,sd2*L);
            g.lineWidth=3; g.strokeStyle=OUT; g.stroke(); g.lineWidth=1.5; g.strokeStyle=BONE; g.stroke(); } }
      }
      function pelvis(x,r){ g.beginPath(); g.ellipse(x,0,r*0.5,r*0.85,0,0,6.283); g.lineWidth=2.8; g.strokeStyle=OUT; g.stroke(); g.lineWidth=1.3; g.strokeStyle=BONE; g.stroke(); }
      function limb(x,y,side,dir,l1,l2,w,foot){
        var a1=side*(1.25+(rnd()-0.5)*0.7)+dir*0.35, a2=a1+side*(0.45+rnd()*0.5)*(rnd()<0.5?-1:1);
        var kx=x+Math.cos(a1)*l1, ky=y+Math.sin(a1)*l1, fx=kx+Math.cos(a2)*l2, fy=ky+Math.sin(a2)*l2;
        bone(x,y,kx,ky,w); bone(kx,ky,fx,fy,w*0.8); knob(kx,ky,w*0.75); knob(x,y,w*0.8);
        if(foot){ g.fillStyle=foot; g.strokeStyle=OUT; g.lineWidth=0.9; g.beginPath(); g.ellipse(fx,fy,w*1.2,w*0.8,a2,0,6.283); g.fill(); g.stroke(); }
      }
      function skull(x,y,rx,ry,rot){
        g.beginPath(); g.ellipse(x,y,rx,ry,rot,0,6.283); g.fillStyle=BONE; g.fill(); g.lineWidth=1.3; g.strokeStyle=OUT; g.stroke();
        g.fillStyle='#120b06'; var ex=Math.cos(rot)*rx*0.2, ey=Math.sin(rot)*rx*0.2, px=-Math.sin(rot)*ry*0.5, py=Math.cos(rot)*ry*0.5;
        g.beginPath(); g.arc(x+ex+px,y+ey+py,Math.max(0.9,ry*0.32),0,6.283); g.fill();
        g.beginPath(); g.arc(x+ex-px,y+ey-py,Math.max(0.9,ry*0.32),0,6.283); g.fill();
        g.beginPath(); g.arc(x+Math.cos(rot)*rx*0.65,y+Math.sin(rot)*rx*0.65,Math.max(0.6,ry*0.18),0,6.283); g.fill();
      }
      function patch(x,y,rx,ry,rot,col,spots){
        g.fillStyle=col; g.strokeStyle='rgba(20,12,6,0.7)'; g.lineWidth=0.8;
        g.beginPath(); for(var q=0;q<10;q++){ var aa=q*0.6283, rr=1+(rnd()-0.5)*0.35; var px=x+Math.cos(aa+rot)*rx*rr, py=y+Math.sin(aa+rot)*ry*rr; if(q) g.lineTo(px,py); else g.moveTo(px,py); } g.closePath(); g.fill(); g.stroke();
        if(spots){ g.fillStyle=spots; for(var sp=0;sp<7;sp++){ g.beginPath(); g.arc(x+(rnd()-0.5)*rx*1.3,y+(rnd()-0.5)*ry*1.3,0.9+rnd()*0.7,0,6.283); g.fill(); } }
      }
      function chain(x1,y1,x2,y2,cx,cy,n,r){ for(var k=0;k<=n;k++){ var t=k/n, u=1-t; knob(u*u*x1+2*u*t*cx+t*t*x2, u*u*y1+2*u*t*cy+t*t*y2, r*(1-t*0.4)); } }
      function loose(n,rad){ for(var k=0;k<n;k++){ var a=rnd()*6.283, d=rad*(0.5+rnd()*0.6), bx=Math.cos(a)*d, by=Math.sin(a)*d, ba=rnd()*6.283, bl2=2+rnd()*3; bone(bx,by,bx+Math.cos(ba)*bl2,by+Math.sin(ba)*bl2,1.2); } }

      g.save();
      for(i=0;i<nCorp;i++){
        var ak=kinds[(rnd()*kinds.length)|0], arot=rnd()*6.283, human=(ak==='soldier'||ak==='enemy'), asz=(human?1.7:ak==='bird'?2.0:ak==='monkey'?2.0:1.85)+rnd()*0.3, ax=0, ay=0, ok=false;
        for(var tryN=0;tryN<14&&!ok;tryN++){ ax=60+rnd()*(W-120); ay=60+rnd()*(H-120); ok=!corpseBlocked(ax,ay,PADK[ak]); }
        if(!ok) continue;
        placed.push([ax,ay]); CARC.push({x:ax,y:ay,k:ak,r:PADK[ak]*0.5,ph:rnd()*6.283});
        if(desert&&window.__desertPixel){ try{ window.__desertPixel.carcass(g,ak,ax,ay,W,H,rnd); }catch(pe){} continue; }
        var sR=STAIN[ak]*(0.9+rnd()*0.2);
        g.fillStyle='rgba(0,0,0,0.22)'; ell(g,ax+3,ay+4,sR*1.05,sR*0.7,arot); g.fill();
        g.fillStyle=desert?'rgba(86,28,16,0.6)':'rgba(70,14,8,0.62)';
        for(var lb=0;lb<3;lb++){ ell(g,ax+(rnd()-0.5)*sR*0.6,ay+(rnd()-0.5)*sR*0.5,sR*(0.5+rnd()*0.35),sR*(0.35+rnd()*0.25),rnd()*6.283); g.fill(); }
        g.fillStyle='rgba(40,6,4,0.5)'; ell(g,ax,ay,sR*0.45,sR*0.3,arot); g.fill();
        g.save(); g.translate(ax,ay); g.rotate(arot); g.scale(asz,asz); g.lineJoin='round'; g.lineCap='round';
        if(ak==='deer'){
          patch(-7,1.5,7,4,0.2,'#8f6234','rgba(240,226,196,0.8)');
          limb(-13,3.5,1,-1,7,8,1.7,'#2b1d12'); limb(-13,-3.5,-1,-1,7,8,1.7,'#2b1d12'); limb(7,3.5,1,1,7,8,1.6,'#2b1d12'); limb(7,-3.5,-1,1,7,8,1.6,'#2b1d12');
          spine(-14,9,1.9); ribs(-6,6,2.6,7.5,1.2); pelvis(-14,4.4);
          bone(9,0,13,0,1.8); skull(15,0,5.6,3.1,0);
          g.lineCap='round'; for(var sd3=-1;sd3<=1;sd3+=2){ var ac='#b99a62'; seg(13,sd3*2,17,sd3*8,2.6,OUT); seg(13,sd3*2,17,sd3*8,1.3,ac); seg(15,sd3*5,20,sd3*5.5,2.4,OUT); seg(15,sd3*5,20,sd3*5.5,1.1,ac); seg(16,sd3*7,18,sd3*11,2.2,OUT); seg(16,sd3*7,18,sd3*11,1,ac); }
          loose(3,16);
        } else if(ak==='boar'){
          patch(-6,0,8,5,0.1,'#3d2c1f','rgba(120,96,70,0.7)');
          limb(-11,4,1,-1,5,5.5,1.9,'#1c130c'); limb(-11,-4,-1,-1,5,5.5,1.9,'#1c130c'); limb(5,4.5,1,1,5,5.5,1.8,'#1c130c'); limb(5,-4.5,-1,1,5,5.5,1.8,'#1c130c');
          spine(-13,6,2.1); ribs(-6,6,2.4,8.8,1); pelvis(-12,4.6);
          bone(6,0,10,0,2.2);
          g.beginPath(); g.moveTo(9,-4.2); g.lineTo(19,-1.7); g.lineTo(19,1.7); g.lineTo(9,4.2); g.closePath(); g.fillStyle=BONE; g.fill(); g.lineWidth=1.3; g.strokeStyle=OUT; g.stroke();
          g.fillStyle='#120b06'; g.beginPath(); g.arc(12,-2,1.2,0,6.283); g.arc(12,2,1.2,0,6.283); g.fill();
          for(var sd4=-1;sd4<=1;sd4+=2){ g.beginPath(); g.moveTo(17.5,sd4*1.6); g.quadraticCurveTo(21,sd4*3,19.5,sd4*7); g.lineWidth=3; g.strokeStyle=OUT; g.stroke(); g.lineWidth=1.6; g.strokeStyle='#fff6df'; g.stroke(); }
          loose(3,15);
        } else if(ak==='monkey'){
          patch(-3,1,4.5,3,0.3,'#74512e',null);
          chain(-8,0,-22,-5,-16,-12,9,1.1);
          limb(-7,2,1,-1,5,5,1.3,null); limb(-7,-2,-1,-1,5,5,1.3,null); limb(3,2.5,1,1,6,6,1.2,null); limb(3,-2.5,-1,1,6,6,1.2,null);
          spine(-8,4,1.4); ribs(-3,4,2,4.6,0.8); pelvis(-8,2.6);
          skull(8.5,0,3.4,3,0); g.strokeStyle=OUT; g.lineWidth=0.9; g.beginPath(); g.moveTo(10.5,-0.8); g.lineTo(11.6,-0.8); g.moveTo(10.5,0.8); g.lineTo(11.6,0.8); g.stroke();
          loose(2,10);
        } else if(ak==='bird'){
          for(var wd=-1;wd<=1;wd+=2){ for(var fk=0;fk<6;fk++){ var fl=10+fk*1.2;
              var ex=Math.cos(wd*(1.0+fk*0.14))*fl*0.9, ey=wd*Math.abs(Math.sin(1.0+fk*0.14))*fl;
              seg(0,wd*2,ex,ey+wd*2,3.2,'rgba(20,14,8,0.9)'); seg(0,wd*2,ex,ey+wd*2,2.1,fk%2?'#34557a':'#4a6f99'); }
            bone(0,wd*2,-1,wd*10,1); }
          spine(-6,4,1.2); ribs(-3,3,2,3.2,0.6); knob(5,-1.6,1.1); knob(5,1.6,1.1); skull(8,0,2.6,2.2,0);
          g.beginPath(); g.moveTo(10,-1.1); g.lineTo(14,0); g.lineTo(10,1.1); g.closePath(); g.fillStyle='#d8a020'; g.fill(); g.lineWidth=0.9; g.strokeStyle=OUT; g.stroke();
          bone(-6,0,-12,-1.5,1); bone(-6,0,-12,1.5,1);
        } else if(ak==='jaguar'){
          patch(-7,1,7,4,0.2,'#c8913c','#2f1c06');
          chain(-15,0,-35,-2,-26,10,12,1.5);
          limb(-12,3.5,1,-1,7,7,1.7,'#3a2208'); limb(-12,-3.5,-1,-1,7,7,1.7,'#3a2208'); limb(8,3.5,1,1,7,7,1.6,'#3a2208'); limb(8,-3.5,-1,1,7,7,1.6,'#3a2208');
          spine(-15,9,1.9); ribs(-7,7,2.4,7,1.1); pelvis(-15,4.2);
          bone(9,0,12,0,1.8); skull(15,0,5.2,3.6,0);
          g.fillStyle='#fffbea'; g.strokeStyle=OUT; g.lineWidth=0.6; for(var fg=-1;fg<=1;fg+=2){ g.beginPath(); g.moveTo(18,fg*1.7); g.lineTo(19.5,fg*3.2); g.lineTo(17,fg*2.4); g.closePath(); g.fill(); g.stroke(); }
          loose(3,17);
        } else if(ak==='camel'){
          patch(-3,0,7,6,0,'#bd9656','rgba(240,226,190,0.5)');
          var cny=(rnd()-0.5)*10; chain(10,0,32,cny,21,-8,11,1.6);
          limb(-12,4,1,-1,11,11,2,'#4a3820'); limb(-12,-4,-1,-1,11,11,2,'#4a3820'); limb(8,4,1,1,11,11,1.9,'#4a3820'); limb(8,-4,-1,1,11,11,1.9,'#4a3820');
          spine(-16,10,2.1); ribs(-8,7,2.6,9,1.2); pelvis(-16,5.2);
          skull(35,cny,6,3,Math.atan2(cny,3)*0.3); bone(30,cny,33,cny,1.6);
          loose(4,20);
        } else {
          var en=(ak==='enemy'), uc=en?'#5c1c1c':'#58693c', uc2=en?'#3a0f0f':'#3a4828', hc=en?'#2d2d33':'#46563a';
          patch(-3,0,7,5.5,0.2,uc,null);
          limb(-9,2,1,-1,9,9,1.8,'#1a120a'); limb(-9,-2,-1,-1,9,9,1.8,'#1a120a');
          limb(2,5,1,0,7,6.5,1.5,null); limb(2,-5,-1,0,7,6.5,1.5,null);
          spine(-9,3,1.7); ribs(-6,5,2.1,5.4,0.9); pelvis(-9,4); bone(2,-5,2,5,1.5);
          bone(3,0,5.5,0,1.5);
          skull(8,0,3.8,3.3,0);
          g.beginPath(); g.arc(8,0,4.5,-Math.PI*0.9,Math.PI*0.9,false); g.lineTo(6.6,0); g.closePath(); g.fillStyle=hc; g.fill(); g.lineWidth=1.2; g.strokeStyle=OUT; g.stroke();
          g.fillStyle='#8f8f8f'; g.strokeStyle=OUT; g.lineWidth=0.7; g.beginPath(); g.arc(1.5,-1.2,1,0,6.283); g.fill(); g.stroke();
          seg(-2,12,18,16,3,'#15110d'); seg(-2,12,18,16,1.6,'#2d2d2d'); seg(-2,12,3,13.4,4.2,'#15110d'); seg(-2,12,3,13.4,3,'#5a3a1e');
          loose(2,13);
        }
        g.restore();
      }
      g.restore();
    }
    function jungleDetail(g,W,H){
      var sd=(W*131+H*17)>>>0||1, rnd=function(){ sd^=sd<<13; sd>>>=0; sd^=sd>>>17; sd^=sd<<5; sd>>>=0; return sd/4294967296; };
      var area=W*H/(900*600), i, x, y, r;
      g.save();
      for(i=0;i<Math.round(20*area)+8;i++){
        x=rnd()*W; y=rnd()*H; r=50+rnd()*90;
        for(var k=0;k<3;k++){ g.fillStyle='rgba(0,8,0,0.09)'; ell(g,x,y,r*(1-k*0.25),r*0.62*(1-k*0.25),rnd()*3); g.fill(); }
      }
      for(i=0;i<Math.round(24*area)+8;i++){
        x=rnd()*W; y=rnd()*H;
        var bn=2+((rnd()*5)|0);
        for(var bq=0;bq<bn;bq++){
          g.globalAlpha=0.35+rnd()*0.4;
          g.fillStyle=rnd()<0.5?'#2a0804':'#4a0e04';
          ell(g,x+(rnd()-0.5)*30,y+(rnd()-0.5)*18,0.8+rnd()*2.4,0.6+rnd()*1.6,rnd()*3);
          g.fill();
        }
      }
      g.globalAlpha=1;
      for(i=0;i<Math.round(5*area)+2;i++){
        x=rnd()*W; y=rnd()*H; r=10+rnd()*22;
        g.fillStyle='rgba(18,44,38,0.42)'; ell(g,x,y,r,r*0.5,rnd()*0.6); g.fill();
        g.fillStyle='rgba(150,205,190,0.20)'; ell(g,x-r*0.2,y-r*0.12,r*0.55,r*0.18,0); g.fill();
        g.strokeStyle='rgba(8,18,12,0.5)'; g.lineWidth=1; ell(g,x,y,r,r*0.5,0); g.stroke();
      }
      var lit=['#3a2510','#4a3a14','#2a4a10','#5a3a14','#221a08'];
      for(i=0;i<Math.round(150*area)+40;i++){
        x=rnd()*W; y=rnd()*H; g.globalAlpha=0.35+rnd()*0.3; g.fillStyle=lit[(rnd()*lit.length)|0];
        ell(g,x,y,2+rnd()*2.4,1+rnd()*1.1,rnd()*3.14); g.fill();
      }
      g.globalAlpha=1;
      for(i=0;i<Math.round(4*area)+1;i++){
        var bx=rnd()*W, by=rnd()*H, br=6+rnd()*16;
        g.fillStyle='rgba(52,5,3,0.55)';
        ell(g,bx,by,br,br*0.55,rnd()*3); g.fill();
        g.fillStyle='rgba(28,2,2,0.55)';
        ell(g,bx,by,br*0.5,br*0.28,0); g.fill();
        var da=rnd()*6.283, dl=20+rnd()*45;
        g.strokeStyle='rgba(52,5,3,0.42)'; g.lineWidth=1.4+rnd()*1.6;
        g.beginPath(); g.moveTo(bx,by);
        g.lineTo(bx+Math.cos(da)*dl, by+Math.sin(da)*dl); g.stroke();
      }
      for(i=0;i<Math.round(2.5*area)+1;i++){
        var sx=rnd()*W, sy=rnd()*H, sr=18+rnd()*34;
        g.fillStyle='rgba(6,3,1,0.6)';
        ell(g,sx,sy,sr,sr*0.7,rnd()*3); g.fill();
        g.fillStyle='rgba(18,8,3,0.5)';
        ell(g,sx,sy,sr*0.6,sr*0.42,0); g.fill();
        g.fillStyle='rgba(220,70,10,0.13)';
        ell(g,sx,sy,sr*0.28,sr*0.18,0); g.fill();
        for(var ai=0;ai<14;ai++){
          var aa=rnd()*6.283, ar=sr*(0.6+rnd()*0.6);
          g.fillStyle='rgba(150,140,120,'+(0.12+rnd()*0.22)+')';
          g.fillRect(sx+Math.cos(aa)*ar, sy+Math.sin(aa)*ar*0.7, 1.5, 1.5);
        }
      }
      carcassPass(g,W,H,'jungle');
      g.restore();
    }
    function paintStatic(g,env,W,H,lv,skipDetail){
      if(env==='jungle'&&!skipDetail) jungleDetail(g,W,H);
      var Ev=($psycho1.ENVS&&$psycho1.ENVS[env])||{};
      if(env==='urban'){
        var gr=g.createRadialGradient(W/2,H*0.48,Math.min(W,H)*0.22,W/2,H*0.48,Math.max(W,H)*0.78);
        gr.addColorStop(0,'rgba(0,0,0,0)'); gr.addColorStop(0.6,'rgba(14,8,40,0.22)'); gr.addColorStop(1,'rgba(8,4,28,0.62)');
        g.fillStyle=gr; g.fillRect(0,0,W,H);
        var tp=g.createLinearGradient(0,0,0,H*0.35); tp.addColorStop(0,'rgba(255,46,136,0.10)'); tp.addColorStop(1,'rgba(255,46,136,0)');
        g.fillStyle=tp; g.fillRect(0,0,W,H*0.35);
        var bt=g.createLinearGradient(0,H*0.65,0,H); bt.addColorStop(0,'rgba(24,224,255,0)'); bt.addColorStop(1,'rgba(24,224,255,0.08)');
        g.fillStyle=bt; g.fillRect(0,H*0.65,W,H*0.35);
      }
      if(env==='jungle'&&lv<2){
        g.save(); g.globalCompositeOperation='lighter';
        for(var k=0;k<5;k++){
          var sx=W*(0.08+k*0.2+((k*37)%11)*0.01), sw=34+((k*53)%7)*7, sl=H*(0.7+((k*29)%5)*0.05), tl=0.3;
          g.save(); g.translate(sx,-10); g.rotate(tl);
          var sg=g.createLinearGradient(0,0,0,sl); sg.addColorStop(0,'rgba(150,190,110,0.10)'); sg.addColorStop(0.6,'rgba(150,190,110,0.04)'); sg.addColorStop(1,'rgba(150,190,110,0)');
          g.fillStyle=sg; g.beginPath(); g.moveTo(-sw*0.3,0); g.lineTo(sw*0.3,0); g.lineTo(sw*0.7,sl); g.lineTo(-sw*0.7,sl); g.closePath(); g.fill(); g.restore();
        }
        g.restore();
      }
      if(Ev.ambient){ g.fillStyle=Ev.ambient; g.fillRect(0,0,W,H); }
    }
    var OV={key:'',c:null};
    function ovCanvas(env,W,H){
      var key=env+'|'+W+'|'+H+'|'+rscale();
      if(OV.key!==key){ var c=mk(W,H), g=c.getContext('2d'); g.scale(c._rs,c._rs); paintStatic(g,env,W,H); OV.key=key; OV.c=c; }
      return OV.c;
    }
    function bakeGround(env,W,H){
      var gc=$psycho1.groundCache; if(!gc) return false; if(gc._ovb) return true;
      try{ var g=gc.getContext('2d'), s=gc.width/W; g.save(); g.setTransform(s,0,0,s,0,0); paintStatic(g,env,W,H,tier(),!!gc._jdet); g.restore(); gc._ovb=1; gc._jdet=1; return true; }
      catch(e){ return false; }
    }
    function liteFX(env,lv){
      var g=$core.ctx, W=$replay.W, H=$replay.H, w=$buildings.weather, gc=$psycho1.groundCache;
      g.save();
      if(w&&w.intensity>0&&w.color){
        g.fillStyle=w.color; g.fillRect(0,0,W,H);
        if(w.wind>0&&lv>0){
          var n=lv===1?8:20, tk=$buildings.tick||0;
          g.strokeStyle='rgba(200,200,200,0.1)'; g.lineWidth=1; g.beginPath();
          for(var i=0;i<n;i++){ var x=(tk*w.wind+i*(600/n))%W, y=(i*397)%H; g.moveTo(x,y); g.lineTo(x+20,y); }
          g.stroke();
        }
      }
      if(!(gc&&gc._ovb)){
        if(env!=='urban'||lv===0){ if(!bakeGround(env,W,H)&&env==='urban') g.drawImage(ovCanvas(env,W,H),0,0,W,H); }
        else g.drawImage(ovCanvas(env,W,H),0,0,W,H);
      }
      g.restore();
    }

    var glow=document.createElement('canvas'); glow.width=glow.height=64;
    (function(){ var c=glow.getContext('2d'),gr=c.createRadialGradient(32,32,0,32,32,32);
      gr.addColorStop(0,'rgba(200,255,130,0.95)'); gr.addColorStop(0.4,'rgba(160,255,90,0.45)'); gr.addColorStop(1,'rgba(120,220,40,0)');
      c.fillStyle=gr; c.fillRect(0,0,64,64); })();
    var ember=document.createElement('canvas'); ember.width=ember.height=48;
    (function(){ var c=ember.getContext('2d'),gr=c.createRadialGradient(24,24,0,24,24,24);
      gr.addColorStop(0,'rgba(255,230,150,0.95)');
      gr.addColorStop(0.35,'rgba(255,150,40,0.55)');
      gr.addColorStop(1,'rgba(180,40,0,0)');
      c.fillStyle=gr; c.fillRect(0,0,48,48); })();
    var puff=document.createElement('canvas'); puff.width=puff.height=64;
    (function(){ var c=puff.getContext('2d'),gr=c.createRadialGradient(32,32,2,32,32,32);
      gr.addColorStop(0,'rgba(232,196,128,0.55)'); gr.addColorStop(1,'rgba(232,196,128,0)');
      c.fillStyle=gr; c.fillRect(0,0,64,64); })();
    var SPR=null;
    function sprites(){
      if(SPR) return SPR;
      function mkc(w,h){ var c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
      function leaf(col){ var c=mkc(10,6), g=c.getContext('2d'); g.fillStyle=col; ell(g,5,3,4.5,2.2); g.fill();
        g.strokeStyle='rgba(0,0,0,0.4)'; g.lineWidth=0.6; g.beginPath(); g.moveTo(0.5,3); g.lineTo(9.5,3); g.stroke(); return c; }
      var tum=mkc(30,30), tg=tum.getContext('2d'); tg.translate(15,15); tg.strokeStyle='#7a5a2a'; tg.lineWidth=1;
      for(var k=0;k<7;k++){ tg.beginPath(); tg.ellipse(0,0,11,11*(0.35+0.1*(k%3)),k*0.9,0,6.283); tg.stroke(); }
      tg.strokeStyle='#a07a3a'; tg.beginPath(); tg.arc(0,0,6,0.5,4.5); tg.stroke();
      var vul=mkc(40,24), vg=vul.getContext('2d'); vg.translate(20,12); vg.fillStyle='rgba(20,14,8,0.62)';
      vg.beginPath(); vg.moveTo(0,-5); vg.lineTo(3,0); vg.lineTo(0,5); vg.lineTo(-3,0); vg.closePath(); vg.fill();
      vg.beginPath(); vg.moveTo(-2,0); vg.quadraticCurveTo(-10,-8,-19,-2); vg.lineTo(-9,2); vg.closePath(); vg.fill();
      vg.beginPath(); vg.moveTo(2,0); vg.quadraticCurveTo(10,-8,19,-2); vg.lineTo(9,2); vg.closePath(); vg.fill();
      return (SPR={leafA:leaf('#25480e'),leafB:leaf('#3a5c18'),tumble:tum,vulture:vul});
    }

    function spawn(){
      var env=$replay.currentEnv, W=$replay.W, H=$replay.H, i;
      AMB.shafts.length=AMB.fireflies.length=AMB.leaves.length=AMB.mist.length=AMB.tumbleweeds.length=AMB.sandPuffs.length=AMB.vultures.length=AMB.ripples.length=0;
      AMB.t=0; AMB.nextTumble=5+R()*6;
      if(env!=='jungle'&&env!=='desert') return;
      var lv=tier(), mob=$core.isMobile;
      var N=function(p,l,m,d){ return lv===0?p:lv===1?l:mob?m:d; };
      var safe=function(x,y,pad){ try{ return $psycho1.onBuilding(x,y,pad); }catch(e){ return false; } };
      var scatter=function(type,n,pad,margin){
        for(var k=0;k<n;k++){ var x=margin+R()*(W-2*margin), y=margin+R()*(H-2*margin);
          if(safe(x,y,pad)) continue; $psycho1.sceneProps.push(makeProp(type,x,y)); }
      };
      if(env==='jungle'){
        for(i=0;i<(lv===2?(mob?4:7):0);i++) AMB.shafts.push({x:W*(0.05+R()*0.9),w:34+R()*50,len:H*(0.7+R()*0.25),tilt:0.3+(R()-0.5)*0.25,phase:R()*6.283,speed:0.1+R()*0.1,a:0.09+R()*0.06});
        for(i=0;i<N(0,4,13,24);i++) AMB.fireflies.push({x:R()*W,y:H*(0.15+R()*0.85),vx:0,vy:0,phase:R()*6.283,speed:0.12+R()*0.22,wander:0.35+R()*0.5,glow:0.6+R()*0.4,r:1.4+R()*0.9});
        for(i=0;i<N(0,4,10,22);i++) AMB.leaves.push({x:R()*W,y:R()*H,vx:8+R()*14,vy:14+R()*16,rot:R()*6.283,vr:(R()-0.5)*0.9,phase:R()*6.283,r:2.4+R()*1.4,col:R()<0.5?'#25480e':'#3a5c18'});
        for(i=0;i<N(0,0,6,12);i++) AMB.mist.push({x:R()*W,y:H*(0.35+R()*0.55),rx:40+R()*60,ry:14+R()*18,vx:6+R()*10,phase:R()*6.283,a:0.05+R()*0.06});
        scatter('fern',N(3,4,10,22),22,30); 
        (function(){ var bl0=$psycho1.buildings||[], nf=N(0,1,1,2); for(var q=0;q<bl0.length;q++) for(var z=0;z<nf;z++){ var b0=bl0[q], fx=b0.x-14+R()*(b0.w+28), fy=b0.y+b0.h+6+R()*18; if(!safe(fx,fy,6)) $psycho1.sceneProps.push(makeProp('frond',fx,fy)); } })(); scatter('log',N(1,2,4,7),30,40); scatter('mushroom',N(0,2,5,12),12,30);
        var bl=$psycho1.buildings||[];
        for(var bi=0;bi<bl.length;bi++){ var b=bl[bi], cnt=lv===0?0:lv===1?1:2+Math.floor(R()*3);
          for(var v=0;v<cnt;v++){ var side=R()<0.6?0:Math.floor(R()*4), vx,vy;
            if(side===0){ vx=b.x+6+R()*(b.w-12); vy=b.y; } else if(side===1){ vx=b.x+6+R()*(b.w-12); vy=b.y+b.h; }
            else if(side===2){ vx=b.x+b.w; vy=b.y+6+R()*(b.h-12); } else { vx=b.x; vy=b.y+6+R()*(b.h-12); }
            $psycho1.sceneProps.push(makeProp('vine',vx,vy)); } }
      } else {
        for(i=0;i<N(0,1,3,5);i++) AMB.vultures.push({cx:W*(0.2+R()*0.6),cy:H*(0.08+R()*0.22),r:60+R()*100,phase:R()*6.283,speed:0.25+R()*0.35,size:0.85+R()*0.4,flap:R()*6.283});
        if(lv===2) for(i=0;i<4;i++) AMB.ripples.push({y:H*(0.42+i*0.06),amp:2+R()*2,freq:0.014+R()*0.012,speed:0.8+R()*0.6,phase:R()*6.283,a:0.06+R()*0.05});
        for(i=0;i<N(0,2,6,12);i++) AMB.sandPuffs.push({x:R()*W,y:H*(0.3+R()*0.65),r:30+R()*50,vx:10+R()*18,phase:R()*6.283,a:0.05+R()*0.07});
        scatter('cactus',N(2,3,7,14),26,40); scatter('bones',N(1,2,4,8),20,40); scatter('rocks',N(2,3,6,12),18,30);
      }
    }

    function tumbleweedSpawn(){
      var W=$replay.W,H=$replay.H, dir=R()<0.5?1:-1;
      AMB.tumbleweeds.push({x:dir>0?-30:W+30,y:H*(0.4+R()*0.5),vx:dir*(55+R()*55),r:7+R()*5,rot:0,bob:R()*6.283,seed:R()*10});
    }

    var SHAFT=null;
    function shaftSprite(){
      if(SHAFT) return SHAFT;
      var c=document.createElement('canvas'); c.width=64; c.height=256; var g=c.getContext('2d');
      var v=g.createLinearGradient(0,0,0,256); v.addColorStop(0,'rgba(150,190,110,1)'); v.addColorStop(0.6,'rgba(150,190,110,0.35)'); v.addColorStop(1,'rgba(150,190,110,0)');
      g.fillStyle=v; g.beginPath(); g.moveTo(14,0); g.lineTo(50,0); g.lineTo(64,256); g.lineTo(0,256); g.closePath(); g.fill();
      var hg=g.createLinearGradient(0,0,64,0); hg.addColorStop(0,'rgba(0,0,0,0)'); hg.addColorStop(0.5,'rgba(0,0,0,1)'); hg.addColorStop(1,'rgba(0,0,0,0)');
      g.globalCompositeOperation='destination-in'; g.fillStyle=hg; g.fillRect(0,0,64,256);
      return (SHAFT=c);
    }
    function stepShafts(g){
      if(!AMB.shafts.length) return;
      var spr=shaftSprite(), t=AMB.t;
      g.save(); g.globalCompositeOperation='lighter';
      for(var i=0;i<AMB.shafts.length;i++){ var s=AMB.shafts[i];
        g.globalAlpha=s.a*(0.65+0.35*Math.sin(t*s.speed*2+s.phase));
        g.save(); g.translate(s.x+Math.sin(t*s.speed+s.phase)*14,-10); g.rotate(s.tilt+Math.sin(t*s.speed*0.7+s.phase)*0.05);
        g.drawImage(spr,-s.w/2,0,s.w,s.len); g.restore(); }
      g.restore();
    }

    function stepJungle(g,dt,W,H){
      var tick=$buildings.tick||0,i;
      stepShafts(g);
      g.save();
      for(i=0;i<AMB.mist.length;i++){ var m=AMB.mist[i]; m.x+=m.vx*dt; if(m.x>W+m.rx) m.x=-m.rx;
        g.globalAlpha=m.a*(0.7+0.3*Math.sin(tick*0.008+m.phase));
        var gr=g.createRadialGradient(m.x,m.y,2,m.x,m.y,m.rx); gr.addColorStop(0,'rgba(60,50,45,0.4)'); gr.addColorStop(1,'rgba(60,50,45,0)');
        g.fillStyle=gr; ell(g,m.x,m.y,m.rx,m.ry); g.fill(); }
      g.restore();
      g.save(); g.globalCompositeOperation='lighter';
      for(i=0;i<AMB.fireflies.length;i++){ var f=AMB.fireflies[i];
        if(dt){ f.phase+=dt*f.speed*60/60; f.vx+=Math.cos(f.phase*1.3+f.wander)*0.03; f.vy+=Math.sin(f.phase*1.1+f.wander)*0.02-0.05; f.vx*=0.94; f.vy*=0.94; f.x+=f.vx; f.y+=f.vy; }
        if(f.x<0) f.x=W; else if(f.x>W) f.x=0; if(f.y<0) f.y=H; else if(f.y>H) f.y=0;
        var a=f.glow*(0.5+0.5*Math.sin(tick*0.09+f.phase*3)); if(a<0.05) continue;
        var s=f.r*10; g.globalAlpha=a*0.8; g.drawImage(ember,f.x-s/2,f.y-s/2,s,s);
        g.globalAlpha=a; g.fillStyle='#ffd890'; g.beginPath(); g.arc(f.x,f.y,f.r*0.55,0,6.283); g.fill(); }
      g.restore();
      g.save();
      for(i=0;i<AMB.leaves.length;i++){ var l=AMB.leaves[i];
        if(dt){ l.phase+=dt*2.2; l.x+=l.vx*dt+Math.sin(l.phase)*0.6; l.y+=l.vy*dt; l.rot+=l.vr*dt; }
        if(l.y>H+12){ l.y=-12; l.x=R()*W; } if(l.x>W+20) l.x=-20;
        g.save(); g.translate(l.x,l.y); g.rotate(l.rot+Math.sin(l.phase)*0.4);
        g.fillStyle='rgba(0,0,0,0.15)'; ell(g,0.6,0.8,l.r,l.r*0.5); g.fill();
        g.fillStyle=l.col; ell(g,0,0,l.r,l.r*0.5); g.fill();
        g.strokeStyle='rgba(0,0,0,0.4)'; g.lineWidth=0.5; g.beginPath(); g.moveTo(-l.r,0); g.lineTo(l.r,0); g.stroke(); g.restore(); }
      g.restore();
    }

    function stepDesert(g,dt,W,H){
      var i;
      g.save(); g.globalCompositeOperation='lighter'; g.strokeStyle='#ffe6b0'; g.lineWidth=1.4;
      for(i=0;i<AMB.ripples.length;i++){ var r=AMB.ripples[i]; r.phase+=dt*r.speed; g.globalAlpha=r.a; g.beginPath();
        for(var x=-20;x<=W+20;x+=22){ var y=r.y+Math.sin(x*r.freq+r.phase)*r.amp+Math.sin(x*r.freq*2.7+r.phase*1.3)*r.amp*0.5; if(x===-20) g.moveTo(x,y); else g.lineTo(x,y); }
        g.stroke(); }
      g.restore();
      var gust=0.5+0.5*Math.sin(AMB.t*0.3);
      g.save();
      for(i=0;i<AMB.sandPuffs.length;i++){ var p=AMB.sandPuffs[i]; p.x+=p.vx*(0.5+gust*1.4)*dt; if(p.x>W+p.r) p.x=-p.r;
        var s=p.r*2; g.globalAlpha=p.a*(0.6+0.4*gust)*(0.8+0.2*Math.sin(AMB.t+p.phase)); g.drawImage(puff,p.x-s/2,p.y-s/2,s,s); }
      g.restore();
      if(dt){ AMB.nextTumble-=dt; if(AMB.nextTumble<=0&&AMB.tumbleweeds.length<2){ tumbleweedSpawn(); AMB.nextTumble=9+R()*10; } }
      g.save();
      for(i=AMB.tumbleweeds.length-1;i>=0;i--){ var w=AMB.tumbleweeds[i];
        w.x+=w.vx*dt; w.rot+=w.vx/w.r*dt; w.bob+=dt*6;
        if(w.x<-50||w.x>W+50){ AMB.tumbleweeds.splice(i,1); continue; }
        var wy=w.y-Math.abs(Math.sin(w.bob))*5;
        g.fillStyle='rgba(0,0,0,0.2)'; ell(g,w.x,w.y+w.r*0.7,w.r*0.9,w.r*0.3); g.fill();
        g.save(); g.translate(w.x,wy); g.rotate(w.rot); g.strokeStyle='#7a5a2a'; g.lineWidth=1;
        for(var k=0;k<7;k++){ var a1=k*0.9+w.seed; g.beginPath(); g.ellipse(0,0,w.r,w.r*(0.35+0.1*(k%3)),a1,0,6.283); g.stroke(); }
        g.strokeStyle='#a07a3a'; g.beginPath(); g.arc(0,0,w.r*0.55,0.5,4.5); g.stroke(); g.restore(); }
      g.restore();
      g.save();
      for(i=0;i<AMB.vultures.length;i++){ var v=AMB.vultures[i]; v.phase+=dt*v.speed; v.flap+=dt*3;
        var vx=v.cx+Math.cos(v.phase)*v.r, vy=v.cy+Math.sin(v.phase)*v.r*0.32;
        var hd=Math.atan2(Math.cos(v.phase)*v.r*0.32,-Math.sin(v.phase)*v.r)+0; var fl=Math.sin(v.flap)*0.25;
        g.save(); g.translate(vx,vy); g.scale(v.size,v.size);
        g.fillStyle='rgba(0,0,0,0.18)'; ell(g,0,34,9,3); g.fill();
        g.rotate(hd); g.fillStyle='rgba(20,14,8,0.62)';
        g.beginPath(); g.moveTo(8,0); g.lineTo(-3,-2); g.lineTo(-7,0); g.lineTo(-3,2); g.closePath(); g.fill();
        for(var sd=-1;sd<=1;sd+=2){ g.beginPath(); g.moveTo(1,0); g.quadraticCurveTo(-1,sd*(9+fl*10),-9,sd*(13+fl*14)); g.lineTo(-5,sd*3); g.closePath(); g.fill(); }
        g.restore(); }
      g.restore();
    }

    function stepJungleLite(g,dt,W,H){
      var S=sprites(), tick=$buildings.tick||0, i, n;
      g.save();
      n=Math.min(AMB.fireflies.length,6);
      for(i=0;i<n;i++){ var f=AMB.fireflies[i];
        if(dt){ f.phase+=dt*f.speed; f.vx+=Math.cos(f.phase*1.3+f.wander)*0.03; f.vy+=Math.sin(f.phase*1.1+f.wander)*0.02-0.05; f.vx*=0.94; f.vy*=0.94; f.x+=f.vx; f.y+=f.vy; }
        if(f.x<0) f.x=W; else if(f.x>W) f.x=0; if(f.y<0) f.y=H; else if(f.y>H) f.y=0;
        var a=f.glow*(0.5+0.5*Math.sin(tick*0.09+f.phase*3)); if(a<0.05) continue;
        var s=f.r*9; g.globalAlpha=a*0.85; g.drawImage(ember,Math.round(f.x-s/2),Math.round(f.y-s/2),s,s); }
      g.globalAlpha=1;
      n=Math.min(AMB.leaves.length,4);
      for(i=0;i<n;i++){ var l=AMB.leaves[i];
        if(dt){ l.phase+=dt*2.2; l.x+=l.vx*dt+Math.sin(l.phase)*0.6; l.y+=l.vy*dt; }
        if(l.y>H+12){ l.y=-12; l.x=R()*W; } if(l.x>W+20) l.x=-20;
        g.drawImage(l.col==='#25480e'?S.leafA:S.leafB,Math.round(l.x-l.r),Math.round(l.y-l.r*0.5),l.r*2,l.r); }
      g.restore();
    }

    function stepDesertLite(g,dt,W,H){
      var S=sprites(), i, n, gust=0.5+0.5*Math.sin(AMB.t*0.3);
      g.save();
      n=Math.min(AMB.sandPuffs.length,2);
      for(i=0;i<n;i++){ var p=AMB.sandPuffs[i]; p.x+=p.vx*(0.5+gust*1.4)*dt; if(p.x>W+p.r) p.x=-p.r;
        var s=p.r*2; g.globalAlpha=p.a*(0.6+0.4*gust); g.drawImage(puff,Math.round(p.x-s/2),Math.round(p.y-s/2),s,s); }
      g.globalAlpha=1;
      if(dt){ AMB.nextTumble-=dt; if(AMB.nextTumble<=0&&AMB.tumbleweeds.length<1){ tumbleweedSpawn(); AMB.nextTumble=12+R()*10; } }
      for(i=AMB.tumbleweeds.length-1;i>=0;i--){ var w=AMB.tumbleweeds[i];
        w.x+=w.vx*dt; w.bob+=dt*6;
        if(w.x<-50||w.x>W+50){ AMB.tumbleweeds.splice(i,1); continue; }
        var sz=30*w.r/11, wy=w.y-Math.abs(Math.sin(w.bob))*5;
        g.drawImage(S.tumble,Math.round(w.x-sz/2),Math.round(wy-sz/2),sz,sz); }
      n=Math.min(AMB.vultures.length,1);
      for(i=0;i<n;i++){ var v=AMB.vultures[i]; v.phase+=dt*v.speed;
        var vx=v.cx+Math.cos(v.phase)*v.r, vy=v.cy+Math.sin(v.phase)*v.r*0.32, dw=40*v.size, dh=24*v.size;
        g.drawImage(S.vulture,Math.round(vx-dw/2),Math.round(vy-dh/2),dw,dh); }
      g.restore();
    }

    var SCAV=null;
    function scavSprites(){
      if(SCAV) return SCAV;
      function mkc(w,h){ var c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
      var st=mkc(34,26), g=st.getContext('2d'); g.translate(15,13);
      g.fillStyle='#14100d'; g.beginPath(); g.moveTo(-14,0); g.lineTo(-9,-3); g.lineTo(-9,3); g.closePath(); g.fill();
      g.fillStyle='#2b241f'; ell(g,0,0,10,6.4,0); g.fill();
      g.strokeStyle='#14100d'; g.lineWidth=1; g.beginPath(); g.moveTo(-7,-3.5); g.lineTo(4,-2); g.moveTo(-7,3.5); g.lineTo(4,2); g.stroke();
      g.fillStyle='#3a312a'; ell(g,7,0,3.4,3,0); g.fill();
      g.fillStyle='#c4503f'; ell(g,11.5,0,3.2,2.6,0); g.fill();
      g.fillStyle='#d9cf9a'; g.beginPath(); g.moveTo(14,-1.2); g.lineTo(18,0.4); g.lineTo(14,1.2); g.closePath(); g.fill();
      function fly(span){ var c=mkc(44,44), q=c.getContext('2d'); q.translate(22,22);
        q.fillStyle='#231d19';
        q.beginPath(); q.moveTo(-2,0); q.quadraticCurveTo(-4,-span*0.6,-9,-span); q.lineTo(2,-span*0.6); q.lineTo(5,0); q.closePath(); q.fill();
        q.beginPath(); q.moveTo(-2,0); q.quadraticCurveTo(-4,span*0.6,-9,span); q.lineTo(2,span*0.6); q.lineTo(5,0); q.closePath(); q.fill();
        q.fillStyle='#2f2823'; ell(q,0,0,8,4.4,0); q.fill();
        q.fillStyle='#c4503f'; ell(q,9,0,2.6,2.2,0); q.fill();
        q.fillStyle='#d9cf9a'; q.beginPath(); q.moveTo(11,-1); q.lineTo(14,0.3); q.lineTo(11,1); q.closePath(); q.fill();
        return c; }
      return (SCAV={stand:st,flyA:fly(20),flyB:fly(11)});
    }
    function stepScavengers(g,t,lv){
      if(!CARC.length) return;
      var S=scavSprites(), P=$buildings.player, nb=lv>=2?2:1, cntB=0, MAXB=lv>=2?8:3, i, j, c, near, a, bx, by, d, ang, bob, sp, spr, w, h, tk=$buildings.tick||0;
      g.save();
      for(i=0;i<CARC.length;i++){
        c=CARC[i];
        if(c.sp===undefined) c.sp=0;
        near=P&&Math.hypot(P.x-c.x,P.y-c.y)<135;
        c.sp=near?Math.min(1,c.sp+0.16):Math.max(0,c.sp-0.011);
        sp=c.sp;
        for(j=0;j<nb;j++){
          if(cntB>=MAXB) break; cntB++;
          a=c.ph*1.7+j*(6.283/nb)+j*0.5+t*0.45*(j%2?1:-1);
          d=c.r*(1.15+0.25*((j*37+i*11)%3)/2);
          bx=c.x+Math.cos(a)*d; by=c.y+Math.sin(a)*d;
          if(sp>0.02){
            var fo=sp*sp*380, al=sp<0.55?1:Math.max(0,1-(sp-0.55)/0.45);
            bx+=Math.cos(a)*fo; by+=Math.sin(a)*fo-sp*50;
            g.globalAlpha=al; if(al<=0.01) continue;
            spr=((tk>>1)+j)%2?S.flyA:S.flyB;
            g.save(); g.translate(bx,by); g.rotate(a); g.drawImage(spr,-22,-22); g.restore();
            g.globalAlpha=1; continue;
          }
          ang=Math.atan2(c.y-by,c.x-bx);
          bob=Math.pow(Math.max(0,Math.sin(t*7+j*2.1+c.ph*3)),3);
          bx+=Math.cos(ang)*bob*8; by+=Math.sin(ang)*bob*8;
          g.save(); g.translate(Math.round(bx),Math.round(by)); g.rotate(ang+Math.sin(t*0.7+j+c.ph)*0.12); g.scale(1.3,1.3);
          g.drawImage(S.stand,-15,-13); g.restore();
        }
      }
      g.globalAlpha=1; g.restore();
    }

    function stepFlies(g,t,lv){
      var n=lv>=2?4:2, i, j, c, a, rr, fx, fy, land;
      g.save();
      for(i=0;i<CARC.length&&i<(lv>=2?6:3);i++){
        c=CARC[i];
        g.fillStyle='#0b0b0b';
        for(j=0;j<n;j++){
          a=t*(2.2+j*0.55)+j*1.9+c.ph;
          land=Math.sin(t*0.45+j*2.3+c.ph)>0.72;
          rr=land?c.r*0.25:c.r*(0.35+0.65*Math.abs(Math.sin(t*0.8+j*1.3+c.ph)));
          fx=c.x+Math.cos(a)*rr+Math.sin(t*23+j*5)*(land?0.4:1.6);
          fy=c.y+Math.sin(a*1.3)*rr*0.8+Math.cos(t*27+j*3)*(land?0.4:1.6);
          g.fillRect(fx-1.3,fy-1.3,2.6,2.6);
          if(lv>=2&&!land&&((t*40+j*3)|0)%2===0){ g.fillStyle='rgba(220,230,255,0.55)'; g.fillRect(fx-2,fy-1,1,1); g.fillRect(fx+1,fy-1,1,1); g.fillStyle='#0b0b0b'; }
        }
      }
      g.restore();
    }

    var origFX=$weather.drawEnvironmentFX, lastProps=null;
    $weather.drawEnvironmentFX=function(){
      var env=$replay.currentEnv, lv=tier(), gc=$psycho1.groundCache, r;
      if(env==='jungle'&&gc&&!gc._jdet){ try{ var gg=gc.getContext('2d'), ss=gc.width/$replay.W; gg.save(); gg.setTransform(ss,0,0,ss,0,0); jungleDetail(gg,$replay.W,$replay.H); gg.restore(); gc._jdet=1; }catch(e){} }
      if(env==='desert'&&gc&&!gc._cdet){ try{ var gd=gc.getContext('2d'), sd2=gc.width/$replay.W; gd.save(); gd.setTransform(sd2,0,0,sd2,0,0); carcassPass(gd,$replay.W,$replay.H,'desert'); gd.restore(); gc._cdet=1; }catch(e){} }
      if(liteEnv(env)&&(lv<2||(gc&&gc._ovb))) liteFX(env,lv); else r=origFX.apply(this,arguments);
      try{
        if($psycho1.sceneProps!==lastProps){ lastProps=$psycho1.sceneProps; spawn(); }
        if(env==='jungle'||env==='desert'){
          var g=$core.ctx, dt=$buildings.isPaused?0:1/60; AMB.t+=dt;
          if(lv===2){ if(env==='jungle') stepJungle(g,dt,$replay.W,$replay.H); else stepDesert(g,dt,$replay.W,$replay.H); }
          else if(lv===1){ if(env==='jungle') stepJungleLite(g,dt,$replay.W,$replay.H); else stepDesertLite(g,dt,$replay.W,$replay.H); }
          if(lv>=1&&CARC.length){ stepScavengers(g,AMB.t,lv); stepFlies(g,AMB.t,lv); }
        }
      }catch(e){ if(!install._warned){ install._warned=1; console.warn('[biome-ambience]',e); } }
      budget=BAKE_PER_FRAME;
      return r;
    };
    window.__biomeAmbience={AMB:AMB,spawn:spawn,tier:tier};
  }
})();