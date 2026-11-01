/* ===== WAR ZONE — pixel-art fire, smoke, embers, haze ===== */
(function(){
  var tries=0, t=setInterval(function(){
    var E=window.__engine;
    if(E&&E.psycho1&&E.weather&&E.core&&E.replay&&E.buildings&&typeof E.weather.drawEnvironmentFX==='function'){
      clearInterval(t); try{ install(E); }catch(e){ console.warn('[warzone-fx] install failed',e); }
    } else if(++tries>200){ clearInterval(t); }
  },100);

  function install(E){
    var $psycho1=E.psycho1,$weather=E.weather,$buildings=E.buildings,$replay=E.replay,$core=E.core;
    var R=Math.random;
    var smoke=[], embers=[], sparks=[], lastT=0, lastEnv='', warned=false, cache={px:0}, vig=null;
    function PXV(){ return window.__artPX($replay.W,$replay.H); }
    function mk(w,h){ var c=document.createElement('canvas'); c.width=Math.max(1,w); c.height=Math.max(1,h); return c; }
    function up(small,PX){ var c=mk(small.width*PX,small.height*PX),x=c.getContext('2d'); x.imageSmoothingEnabled=false; x.drawImage(small,0,0,c.width,c.height); return c; }
    var BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
    // ---- sprite builders (art-pixel grids, upscaled nearest-neighbour) ----
    var FSZ=[[6,10],[9,15],[12,20]];
    function flame(frame,cls,PX){
      var wA=FSZ[cls][0],hA=FSZ[cls][1],c=mk(wA,hA),g=c.getContext('2d'),cx=(wA-1)/2;
      for(var y=0;y<hA;y++){
        var tt=y/(hA-1), hw=(wA/2)*Math.pow(tt,0.65)*(tt>0.88?1-(tt-0.88)*4:1)+0.4;
        var sw=Math.sin(frame*2.1+tt*5)*1.3*(1-tt);
        for(var x=0;x<wA;x++){
          var dx=(x-cx-sw), d=Math.abs(dx)/Math.max(0.5,hw); if(d>1) continue;
          if(d>0.92&&((x+y+frame)&1)===0) continue;
          var col=(d<0.3&&tt>0.45)?'#fff3a8':(d<0.58&&tt>0.25)?'#ffc83a':(d<0.84)?'#ff7a1c':'#d3321a';
          g.fillStyle=col; g.fillRect(x,y,1,1);
        }
      }
      return up(c,PX);
    }
    function puff(rad,dark,PX){
      var n=rad*2+1,c=mk(n,n),g=c.getContext('2d'),T=dark?['#241f1b','#171411','#0d0b0a']:['#8a8176','#6a6258','#4a443c'];
      for(var y=0;y<n;y++)for(var x=0;x<n;x++){
        var d=Math.hypot(x-rad,y-rad)/rad; if(d>1) continue;
        if(d>0.72&&((x+y)&1)===0) continue;
        g.fillStyle=d<0.4?T[0]:d<0.72?T[1]:T[2]; g.fillRect(x,y,1,1);
      }
      return up(c,PX);
    }
    function glow(rad,PX){
      var w=rad*2+1,h=Math.round(rad*1.6)+1,c=mk(w,h),g=c.getContext('2d');
      for(var y=0;y<h;y++)for(var x=0;x<w;x++){
        var d=Math.hypot(x-rad,(y-h/2)*1.25)/rad; if(d>1) continue;
        var col=d<0.35?'rgba(255,200,90,0.26)':d<0.65?'rgba(255,140,40,0.17)':(((x+y)&1)===0?'rgba(255,100,20,0.1)':null);
        if(col){ g.fillStyle=col; g.fillRect(x,y,1,1); }
      }
      return up(c,PX);
    }
    function sprites(){
      var PX=PXV(); if(cache.px===PX) return cache;
      cache={px:PX,flames:[],puffD:[puff(3,true,PX),puff(5,true,PX),puff(8,true,PX)],puffG:[puff(3,false,PX),puff(5,false,PX),puff(8,false,PX)],glow:[glow(6,PX),glow(9,PX),glow(13,PX)]};
      for(var f=0;f<3;f++){ cache.flames[f]=[flame(f,0,PX),flame(f,1,PX),flame(f,2,PX)]; }
      vig=null; return cache;
    }
    function tier(){ return ($core.isUltraLow||$core.isLowEndDesktop||$buildings.settingPerfMode)?0:($core.isMobile?1:2); }
    function lvl(){ var l=tier(); try{ if(window.__fxLv){ var f=window.__fxLv(); if(f<l||l===2&&f<2) l=Math.min(l,f); } }catch(e){} return l; }
    function calm(){ var b=document.body; return !!(b&&(b.classList.contains('photosensitive-mode')||b.classList.contains('lowfx'))); }
    var CAP={smoke:[10,30,70],ember:[4,16,40]};

    function collect(out){
      var i,j,k,bl=$psycho1.buildings||[],pr=$psycho1.sceneProps||[],tr=$psycho1.trees||[],G=$psycho1._wzGround;
      for(i=0;i<bl.length;i++){ var b=bl[i], F=b._wzFires; if(!F||b._shellCacheEnv!=='warzone') continue;
        for(j=0;j<F.length;j++) out.push({x:b.x+F[j].x,y:b.y+F[j].y,s:F[j].s,plume:!!F[j].plume,seed:(b.x*0.013+j*1.7)}); }
      for(i=0;i<pr.length;i++){ var p=pr[i];
        if(p.type==='barrel'&&p.burning) out.push({x:p.x,y:p.y-14,s:0.5,plume:false,seed:p.x*0.021});
        else if(p.type==='burntcar'&&p.burning) out.push({x:p.x,y:p.y-p.h*0.7,s:0.85,plume:true,seed:p.x*0.017}); }
      for(i=0;i<tr.length;i++){ if(tr[i]._wzBurn) out.push({x:tr[i]._wzBurn.x,y:tr[i]._wzBurn.y,s:0.75,plume:false,seed:tr[i].phase*3}); }
      if(G&&G.smolders) for(i=0;i<G.smolders.length;i++){ k=G.smolders[i]; out.push({x:k.x,y:k.y,s:0.4,plume:false,seed:k.x*0.01,smolder:true}); }
    }
    function vigCanvas(W,H,hs,PX){
      var key=W+'x'+H+'x'+hs+'x'+PX; if(vig&&vig.key===key) return vig.c;
      var gw=Math.ceil(W/PX),gh=Math.ceil(H/PX),c=mk(gw,gh),g=c.getContext('2d');
      for(var y=0;y<gh;y++)for(var x=0;x<gw;x++){
        var ex=Math.max(Math.abs(x/gw-0.5),Math.abs(y/gh-0.5))*2, v=Math.pow(Math.max(0,ex-0.55)/0.45,1.5)*0.62;
        if(hs){ var top=Math.max(0,1-y*PX/(hs*1.6))*0.5; v=Math.max(v,top); }
        if(v>BAYER[(y&3)*4+(x&3)]/16){ g.fillStyle='rgba(14,8,5,0.5)'; g.fillRect(x,y,1,1); }
      }
      vig={key:key,c:up(c,PX)}; return vig.c;
    }
    var SRC=[];
    function drawWar(){
      var S=sprites(), PX=S.px, c=$core.ctx, W=$replay.W, H=$replay.H, now=performance.now(), tk=$buildings.tick||0, lv=lvl(), cm=calm();
      var dtf=Math.min(3,Math.max(0,(now-lastT)/16.667)); lastT=now; if($buildings.isPaused) dtf=0;
      var G=$psycho1._wzGround, hs=(G&&G.hs)||0, wind=0.28+Math.sin(tk*0.004)*0.12, i,k,s,p,n;
      SRC.length=0; collect(SRC);
      if(SRC.length>6){ // cull: on-screen only, nearest N to the player (N by fx tier)
        var _p=$buildings.player, _px=_p?_p.x:W*0.5, _py=_p?_p.y:H*0.5, _w=0, _s, _dx, _dy;
        for(i=0;i<SRC.length;i++){ _s=SRC[i];
          if(_s.x<-60||_s.x>W+60||_s.y<-60||_s.y>H+60) continue;
          _dx=_s.x-_px; _dy=_s.y-_py; _s._d2=_dx*_dx+_dy*_dy; SRC[_w++]=_s; }
        SRC.length=_w;
        var _cap=lv===0?8:lv===1?16:30;
        if(_w>_cap){ SRC.sort(function(a,b){return a._d2-b._d2;}); SRC.length=_cap; }
      }
      if(dtf>0){
        for(i=0;i<SRC.length;i++){ s=SRC[i];
          var sr=(s.plume?0.34:(s.smolder?0.05:0.1))*(lv===0?0.4:lv===1?0.7:1)*dtf;
          if(smoke.length<CAP.smoke[lv]&&R()<sr) smoke.push({x:s.x+(R()-0.5)*8*s.s,y:s.y-4,vx:wind*0.4+(R()-0.5)*0.2,vy:-(0.45+R()*0.4),r:(10+R()*7)*(s.plume?1.8:1.0)*s.s,gr:0.07+R()*0.05,life:0,max:130+R()*90,dark:s.plume||R()<0.5});
          if(!s.smolder&&embers.length<CAP.ember[lv]&&R()<0.11*dtf*s.s*(lv===0?0.3:1)) embers.push({x:s.x+(R()-0.5)*8,y:s.y-6,vx:(R()-0.5)*0.7+wind,vy:-(0.7+R()*1.0),life:0,max:50+R()*50});
        }
        var trs=$psycho1.trees||[];
        for(i=0;i<trs.length;i++){ var sp=trs[i]._wzSpark; if(!sp||cm) continue;
          if(((tk+i*53)%170)<3&&R()<0.5&&sparks.length<14) for(n=0;n<4;n++) sparks.push({x:sp.x,y:sp.y,vx:(R()-0.5)*2.4,vy:-R()*1.6,life:0,max:14+R()*10});
        }
        for(i=smoke.length-1;i>=0;i--){ p=smoke[i]; p.life+=dtf; p.x+=p.vx*dtf; p.y+=p.vy*dtf; p.vx+=0.002*dtf; p.r+=p.gr*dtf; if(p.life>p.max){ smoke[i]=smoke[smoke.length-1]; smoke.pop(); } }
        for(i=embers.length-1;i>=0;i--){ p=embers[i]; p.life+=dtf; p.x+=(p.vx+Math.sin(p.life*0.2+i)*0.3)*dtf; p.y+=p.vy*dtf; p.vy*=0.995; if(p.life>p.max){ embers[i]=embers[embers.length-1]; embers.pop(); } }
        for(i=sparks.length-1;i>=0;i--){ p=sparks[i]; p.life+=dtf; p.x+=p.vx*dtf; p.y+=p.vy*dtf; p.vy+=0.18*dtf; if(p.life>p.max){ sparks[i]=sparks[sparks.length-1]; sparks.pop(); } }
      }
      c.save(); c.imageSmoothingEnabled=false;
      var flick=cm?0.25:1;
      // ground glow (stepped, dithered discs)
      c.globalCompositeOperation='lighter';
      for(i=0;i<SRC.length;i++){ s=SRC[i]; var gc=(s.s<0.6)?0:(s.s<1)?1:2, gs=S.glow[gc];
        c.globalAlpha=(0.85+0.15*Math.sin(tk*0.21*(cm?0.3:1)+s.seed*9)*flick)*(s.smolder?0.6:1);
        c.drawImage(gs,Math.round(s.x/PX)*PX-(gs.width>>1),Math.round(s.y/PX)*PX-(gs.height>>1)); }
      // puddle fire reflection (pixel dashes)
      if(G&&G.puddles&&lv>0&&SRC.length){
        for(i=0;i<G.puddles.length;i++){ var pd=G.puddles[i],near=0,d;
          for(k=0;k<SRC.length;k++){ var ddx=SRC[k].x-pd.x,ddy=SRC[k].y-pd.y; d=ddx*ddx+ddy*ddy; if(d<67600) near+=1-Math.sqrt(d)/260; }
          if(near>0){ c.globalAlpha=Math.min(0.5,near*0.3)*(0.75+0.25*Math.sin(tk*0.15+i)*flick); c.fillStyle='#c8641e';
            for(k=-1;k<=1;k++){ var dw=Math.max(PX,Math.round(pd.rx*(0.8-Math.abs(k)*0.3)/PX)*PX); c.fillRect(Math.round((pd.x-dw/2+Math.sin(tk*0.05+i+k)*PX)/PX)*PX,Math.round((pd.y+k*PX*1.2)/PX)*PX,dw,PX); } }
        }
      }
      // distant fires
      c.globalCompositeOperation='source-over';
      if(G&&G.far&&hs>0&&lv>0){
        for(i=0;i<G.far.length;i++){ var ff=G.far[i];
          for(k=0;k<4;k++){ var ph2=((tk*0.0025+i*0.31+k*0.25)%1), rcls=ph2<0.4?0:ph2<0.75?1:2, ps=S.puffD[rcls];
            c.globalAlpha=(1-ph2)*0.5; c.drawImage(ps,Math.round((ff.x+ph2*70+wind*ph2*40)/PX)*PX-(ps.width>>1),Math.round((ff.y-ph2*hs*1.1)/PX)*PX-(ps.height>>1)); } }
      }
      // smoke
      for(i=0;i<smoke.length;i++){ p=smoke[i]; var u=p.life/p.max, cl=p.r<9?0:p.r<17?1:2, sp2=(p.dark?S.puffD:S.puffG)[cl];
        c.globalAlpha=Math.min(0.55,(u<0.15?u/0.15:1-(u-0.15)/0.85)*0.55);
        c.drawImage(sp2,Math.round(p.x/PX)*PX-(sp2.width>>1),Math.round(p.y/PX)*PX-(sp2.height>>1)); }
      // flames (opaque pixel sprites)
      c.globalAlpha=1;
      var tongues=lv===0?1:lv===1?2:3;
      for(i=0;i<SRC.length;i++){ s=SRC[i]; if(s.smolder&&lv===0) continue;
        for(k=0;k<tongues;k++){
          var ph3=tk*0.32*(cm?0.4:1)+s.seed*7+k*2.3, st=s.s*(k?0.75:1)*(0.88+0.2*Math.sin(ph3)*flick)*(s.smolder?0.6:1);
          var cls=st<0.45?0:st<0.85?1:2, fr=(((tk*(cm?0.06:0.2))|0)+k+((s.seed*3)|0))%3, fs=S.flames[fr][cls];
          var ox=(k===0?0:(k===1?-6:6))*s.s;
          c.drawImage(fs,Math.round((s.x+ox)/PX)*PX-(fs.width>>1),Math.round(s.y/PX)*PX-fs.height);
        }
      }
      // embers + sparks (single pixels)
      for(i=0;i<embers.length;i++){ p=embers[i]; var eu=p.life/p.max; c.fillStyle=eu<0.35?'#fff0a0':eu<0.7?'#ff9a2a':'#b8350f';
        c.fillRect(Math.round(p.x/PX)*PX,Math.round(p.y/PX)*PX,PX,PX); }
      c.fillStyle='#ffe9a0';
      for(i=0;i<sparks.length;i++){ p=sparks[i]; c.fillRect(Math.round(p.x/PX)*PX,Math.round(p.y/PX)*PX,PX,PX); }
      // dithered vignette + warm tint
      c.globalAlpha=1; c.drawImage(vigCanvas(W,H,hs,PX),0,0);
      c.globalAlpha=0.05+0.015*Math.sin(tk*0.01); c.fillStyle='#d8651c'; c.fillRect(0,0,W,H);
      c.restore();
    }
    var orig=$weather.drawEnvironmentFX;
    $weather.drawEnvironmentFX=function(){
      var r=orig.apply(this,arguments);
      var env=$replay.currentEnv;
      if(env!==lastEnv){ lastEnv=env; smoke.length=embers.length=sparks.length=0; lastT=performance.now(); }
      if(env==='warzone'){ try{ drawWar(); }catch(e){ if(!warned){ warned=true; console.warn('[warzone-fx]',e); } } }
      return r;
    };
    window.__warzoneFX={smoke:smoke,embers:embers};
  }
})();