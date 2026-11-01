/* v98 desert pixel extras: pixel carcasses, player footprints, sandstorm */
(function(){
  'use strict';
  var PXOF=function(W,H){ return window.__artPX(W,H); };
  var BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
  function mk(w,h){ var c=document.createElement('canvas'); c.width=w; c.height=h; return c; }

  /* ---------- pixel carcass (hand-built from 1px ops, snapped to the sand's pixel grid) ---------- */
  var BONE='#f2e9d2', BONES='#c4b898', DARK='#2a1a10', CSH='rgba(72,50,86,0.6)';
  function carcass(g,kind,ax,ay,W,H,rnd){
    var PX=PXOF(W,H), S=48, c=mk(S,S), x=c.getContext('2d'), cx=24, cy=24;
    var ops=[]; // [x0,y0,x1,y1,color,castShadow]
    function L(x0,y0,x1,y1,col,sh){ ops.push([x0,y0,x1,y1,col||BONE,sh!==false]); }
    function P(X,Y,col,sh){ ops.push([X,Y,X,Y,col||BONE,sh===true]); }
    function R(X,Y,w,h,col){ for(var j=0;j<h;j++) L(X,Y+j,X+w-1,Y+j,col,true); }
    var ri=function(a,b){ return a+Math.floor(rnd()*(b-a+1)); };
    var Rb={camel:13,deer:10,soldier:9,enemy:9,bird:6}[kind]||9;
    // dried-blood stain, dithered edge
    for(var yy=-Rb;yy<=Rb;yy++) for(var xx=-Rb*1.2;xx<=Rb*1.2;xx++){
      var d=Math.hypot(xx/1.2,yy)+(rnd()-0.5)*3.2, bay=BAY[((cy+yy)&3)*4+((cx+Math.round(xx))&3)]/16-0.5;
      if(d<Rb*(0.82+bay*0.3)){ x.fillStyle=d<Rb*0.42?'#5a2218':d<Rb*0.7?'#7c3822':'#9a5a2a'; x.fillRect(cx+Math.round(xx),cy+yy,1,1); }
    }
    function ribs(x0,n,sp,len){ for(var k=0;k<n;k++){ var xk=x0+k*sp, l=len-(Math.abs(k-(n-1)/2)>(n/4)?1:0); L(xk,cy,xk+1,cy-l); L(xk,cy,xk+1,cy+l); } }
    function skull(X,Y,w,h){ R(X,Y,w,h,BONE); P(X+1,Y+((h/2)|0),DARK); P(X+1,Y+((h/2)|0)-(h>3?1:0),DARK,false); L(X,Y+h-1,X+w-1,Y+h-1,BONES); }
    function loose(n,rad){ for(var k=0;k<n;k++){ var a=rnd()*6.283, d=rad*(0.55+rnd()*0.5), bx=Math.round(cx+Math.cos(a)*d), by=Math.round(cy+Math.sin(a)*d), t=ri(0,3), l=ri(2,4); L(bx,by,bx+(t&1?l:0),by+(t&1?0:l),BONE); } }
    function scraps(n,col,col2,rx,ry,ox){ for(var k=0;k<n;k++){ P(cx+(ox||0)+ri(-rx,rx),cy+ri(-ry,ry),rnd()<0.6?col:col2,false); } }
    if(kind==='camel'){
      L(cx-12,cy,cx+6,cy); for(var h=-8;h<=-4;h+=2) P(cx+h,cy-1);
      ribs(cx-9,7,2,4); L(cx-13,cy-2,cx-13,cy+2);
      L(cx+6,cy,cx+11,cy-2); skull(cx+11,cy-4,5,3); R(cx+16,cy-3,3,2,BONE); P(cx+18,cy-3,BONES,false);
      var sg=rnd()<0.5?1:-1;
      L(cx+5,cy-4,cx+3,cy-9); L(cx+3,cy-9,cx+6,cy-12); L(cx+5,cy+4,cx+8,cy+9); L(cx+8,cy+9,cx+6,cy+12);
      L(cx-12,cy-2,cx-15,cy-8*sg); L(cx-15,cy-8*sg,cx-12,cy-11*sg); L(cx-12,cy+2,cx-14,cy+8); 
      scraps(14,'#bd9656','#9a7640',9,3,-2); loose(5,Rb+3);
    } else if(kind==='deer'){
      L(cx-8,cy,cx+4,cy); ribs(cx-6,5,2,3); L(cx-9,cy-2,cx-9,cy+2);
      L(cx+4,cy,cx+7,cy-1); skull(cx+7,cy-3,4,2); R(cx+11,cy-2,2,1,BONE);
      L(cx+8,cy-4,cx+10,cy-8); L(cx+9,cy-6,cx+12,cy-7); L(cx+8,cy+2,cx+10,cy+6); L(cx+9,cy+4,cx+12,cy+5);
      L(cx+3,cy-3,cx+1,cy-7); L(cx+1,cy-7,cx+4,cy-9); L(cx-8,cy+3,cx-11,cy+7); L(cx-11,cy+7,cx-8,cy+9);
      scraps(10,'#8f6234','#e8dcc0',6,2,-2); loose(4,Rb+2);
    } else if(kind==='bird'){
      for(var sd=-1;sd<=1;sd+=2) for(var f=0;f<5;f++) L(cx-1,cy+sd,cx-3+f,cy+sd*(4+f),f%2?'#4a6a8c':'#2a3a50');
      L(cx-3,cy,cx+2,cy,BONE); R(cx+3,cy-1,2,2,BONE); P(cx+4,cy-1,DARK); P(cx+5,cy,'#d8a020',false); P(cx+6,cy,'#d8a020',false);
      loose(2,Rb+1);
    } else { // soldier / enemy
      var en=(kind==='enemy'), u1=en?'#3a4048':'#5f6a3a', u2=en?'#566068':'#4a5430';
      scraps(22,u1,u2,5,3,-1);
      L(cx-6,cy,cx+2,cy); ribs(cx-4,3,2,3);
      skull(cx+3,cy-2,4,4); if(en){ L(cx+3,cy-3,cx+6,cy-3,'#566068'); }
      L(cx+1,cy-2,cx+3,cy-8); L(cx+3,cy-8,cx+6,cy-9); L(cx+1,cy+2,cx+4,cy+7); L(cx+4,cy+7,cx+2,cy+10);
      L(cx-6,cy-1,cx-11,cy-5); L(cx-11,cy-5,cx-15,cy-4); L(cx-6,cy+1,cx-12,cy+4); L(cx-12,cy+4,cx-15,cy+7);
      R(cx-17,cy-5,2,2,'#2a1a10'); R(cx-16,cy+6,2,2,'#2a1a10');
      L(cx-9,cy+9,cx+3,cy+11,'#2c2c2c'); L(cx-9,cy+10,cx-6,cy+10,'#7a4a22',false);
      loose(2,Rb+2);
    }
    function line(col,ox,oy,o){ x.fillStyle=col; var x0=o[0]+ox,y0=o[1]+oy,x1=o[2]+ox,y1=o[3]+oy,dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,e=dx+dy,n=0;
      for(;;){ x.fillRect(x0,y0,1,1); if((x0===x1&&y0===y1)||n++>80) break; var e2=2*e; if(e2>=dy){e+=dy;x0+=sx;} if(e2<=dx){e+=dx;y0+=sy;} } }
    for(var i=0;i<ops.length;i++) if(ops[i][5]) line(CSH,1,1,ops[i]);
    for(i=0;i<ops.length;i++) line(ops[i][4],0,0,ops[i]);
    // random quarter-turn + mirror keeps every pixel crisp
    var out=mk(S,S), o=out.getContext('2d'); o.imageSmoothingEnabled=false;
    o.translate(S/2,S/2); o.rotate(((rnd()*4)|0)*Math.PI/2); if(rnd()<0.5) o.scale(-1,1); o.drawImage(c,-S/2,-S/2);
    var dx0=Math.round((ax-S*PX/2)/PX)*PX, dy0=Math.round((ay-S*PX/2)/PX)*PX;
    g.save(); g.imageSmoothingEnabled=false; g.drawImage(out,dx0,dy0,S*PX,S*PX); g.restore();
  }

  /* ---------- player footprints (drawn on the ground layer, under units) ---------- */
  var T={gc:null,list:[],lx:null,ly:null,side:1,extra:0};
  function tracks(ctx,W,H,B,gc){
    if(T.gc!==gc){ T={gc:gc,list:[],lx:null,ly:null,side:1,extra:0}; }
    var p=B.player; if(!p) return;
    var PX=PXOF(W,H), snap=function(v){ return Math.round(v/PX)*PX; };
    var storm=B.weather&&B.weather.name==='SANDSTORM';
    if(!B.isPaused){
      if(T.lx==null){ T.lx=p.x; T.ly=p.y; }
      var dx=p.x-T.lx, dy=p.y-T.ly, d=Math.hypot(dx,dy);
      if(d>150){ T.lx=p.x; T.ly=p.y; }
      else if(d>=PX*3.4){
        var a=Math.atan2(dy,dx); T.side=-T.side;
        T.list.push({x:snap(p.x-Math.sin(a)*T.side*PX*1.7),y:snap(p.y+PX*3+Math.cos(a)*T.side*PX*1.7),v:Math.abs(dy)>Math.abs(dx),b:B.tick,e0:T.extra});
        if(T.list.length>170) T.list.shift();
        T.lx=p.x; T.ly=p.y;
      }
      if(storm) T.extra+=3;
    }
    ctx.save();
    for(var i=T.list.length-1;i>=0;i--){
      var t=T.list[i], f=((B.tick-t.b)+(T.extra-t.e0))/2600;
      if(f>=1){ T.list.splice(i,1); continue; }
      var al=f<0.3?1:f<0.55?0.72:f<0.8?0.48:0.26, w=t.v?2:3, h=t.v?3:2;
      ctx.globalAlpha=al*0.75; ctx.fillStyle='#fbe3a0'; ctx.fillRect(t.x-PX,t.y-PX,(w+1)*PX,PX);   // sunlit lip (upper-left)
      ctx.globalAlpha=al; ctx.fillStyle='#a06c30'; ctx.fillRect(t.x,t.y,w*PX,h*PX);                 // trodden hollow
      ctx.fillStyle='#6a5268'; ctx.fillRect(t.x+(w-1)*PX,t.y+(h-1)*PX,PX,PX);                        // cool shadow pixel
    }
    ctx.restore();
  }

  /* ---------- sandstorm: haze, shrinking visibility, chunky grain, wind streaks ---------- */
  var PALS={desert:{haze:'214,166,92',dark:'104,58,14',vis:'184,132,66',grain:['#f0d48c','#d9a85a','#fff0c0','#b8884a'],streak:['rgba(255,236,170,0.55)','rgba(150,96,36,0.45)']},
            mars:{haze:'200,90,50',dark:'90,30,10',vis:'160,66,34',grain:['#ff9a5a','#d2663a','#ffc08a','#a8482a'],streak:['rgba(255,190,150,0.5)','rgba(120,40,16,0.45)']}};
  function hs(i,k){ var h=(i*374761393+k*668265263)>>>0; h=((h^(h>>>13))*1274126177)>>>0; return ((h^(h>>>16))>>>0)/4294967296; }
  function storm(ctx,W,H,B,env,radial,lite){
    var pal=PALS[env]||PALS.desert, PX=PXOF(W,H), tk=B.tick||0, tm=B.weatherTimer==null?30:B.weatherTimer;
    var e=Math.max(0,Math.min(1,(30-tm)/2,tm/3)); if(e<=0) return;
    ctx.save();
    // sun dims, sky goes ochre
    ctx.globalAlpha=e; ctx.fillStyle='rgba('+pal.dark+',0.30)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba('+pal.haze+',0.30)'; ctx.fillRect(0,0,W,H);
    // visibility closes in around the player
    var p=B.player||{x:W/2,y:H/2}, outer=Math.max(W,H)*0.62, inner=Math.min(W,H)*0.16;
    var gr=radial('sand_vis_'+(outer|0)+'_'+(inner|0)+'_'+env,0,0,inner,0,0,outer,[[0,'rgba('+pal.vis+',0)'],[0.5,'rgba('+pal.vis+',0.28)'],[1,'rgba('+pal.vis+',0.74)']]);
    ctx.save(); ctx.translate(p.x,p.y); ctx.fillStyle=gr; ctx.fillRect(-p.x,-p.y,W,H); ctx.restore();
    // wind-wall: stepped, dithered dust bank on the upwind (left) edge
    for(var b=0;b<10;b++){ ctx.globalAlpha=e*(0.5-b*0.05); ctx.fillStyle='rgb('+pal.haze+')'; ctx.fillRect(b*PX*3,0,PX*3,H); }
    // chunky grain on the pixel grid
    var N=lite?70:230, wob=Math.sin(tk*0.02);
    for(var i=0;i<N;i++){
      var sp=5+hs(i,3)*9, gx=((hs(i,1)*W+tk*sp)%W+W)%W, gy=((hs(i,2)*H+Math.sin(tk*0.05+i)*7+wob*10)%H+H)%H, s=PX*(hs(i,4)<0.8?1:2);
      ctx.globalAlpha=e*(0.35+hs(i,5)*0.45); ctx.fillStyle=pal.grain[(hs(i,6)*4)|0];
      ctx.fillRect(Math.floor(gx/PX)*PX,Math.floor(gy/PX)*PX,s,s);
    }
    // wind streaks: long 1-pixel dashes, two parallax speeds
    var M=lite?14:42;
    for(i=0;i<M;i++){
      var ln=Math.floor((5+hs(i,7)*20))*PX, v=14+hs(i,8)*22, sx=((hs(i,9)*(W+ln)+tk*v)%(W+ln)+W+ln)%(W+ln)-ln, sy=Math.floor(hs(i,10)*H/PX)*PX;
      ctx.globalAlpha=e; ctx.fillStyle=pal.streak[i&1]; ctx.fillRect(Math.floor(sx/PX)*PX,sy,ln,PX);
      if(i%3===0){ ctx.fillRect(Math.floor((sx+ln*0.5)/PX)*PX,sy+PX*2,Math.floor(ln*0.4/PX)*PX,PX); }
    }
    ctx.restore();
  }

  /* ---------- adobe / sandstone buildings (pixel-art shell cache) ---------- */
  function hxs(i,j,k){ var h=(i*374761393+j*668265263+k*2147483647)>>>0; h=((h^(h>>>13))*1274126177)>>>0; return ((h^(h>>>16))>>>0)/4294967296; }
  function pc(hex){ return [parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)]; }
  function ph(r,g,b){ var f=function(v){ v=Math.max(0,Math.min(255,Math.round(v))); return (v<16?'0':'')+v.toString(16); }; return '#'+f(r)+f(g)+f(b); }
  function shd(hex,f){ var c=pc(hex); return ph(c[0]*f,c[1]*f,c[2]*f); }
  function mix(a,b,t){ var x=pc(a),y=pc(b); return ph(x[0]+(y[0]-x[0])*t,x[1]+(y[1]-x[1])*t,x[2]+(y[2]-x[2])*t); }
  function building(b,env,o){
    var PX=o.PX, flat=o.flat, dxa=flat?0:Math.max(2,Math.round(o.dx/PX)), dya=flat?0:Math.max(2,Math.round(o.dy/PX));
    var O=3, w=b.w, h=b.h, bw=Math.max(8,Math.floor(w/PX)), bh=Math.max(8,Math.floor(h/PX));
    var gw=bw+O*2+dxa+3, gh=bh+O*2+dya+3, s=mk(gw,gh), g=s.getContext('2d');
    var rg=function(x,y,ww,hh,c){ g.fillStyle=c; g.fillRect(x,y,ww,hh); };
    var seed=(((b.x|0)*7+(b.y|0)*13)>>>0)%9973;
    var wall=b._wallCol||env.bWall, roof=b._roofCol||env.bRoof, dark=b._darkCol||env.bDark;
    var TONE=[shd(wall,0.82),shd(wall,0.92),wall,shd(wall,1.07),shd(wall,1.15)];
    var SEAM=shd(wall,0.74), BRICK=['#9a6240','#a8704a','#b87c52'], HI='#f0dcaa', OUTL='#2a1a10', COOL='#5e5470';
    // 1. cast shadow (cool), dithered fringe
    g.fillStyle='rgba(70,52,92,0.42)'; g.fillRect(O+dxa+1,O+dya+1,bw,bh);
    for(var i=0;i<bh+2;i++) for(var k=0;k<3;k++) if(((i+k)&1)===0) g.fillRect(O+dxa+1+bw+k,O+dya+1+i,1,1);
    for(i=0;i<bw+2;i++) for(k=0;k<3;k++) if(((i+k)&1)===0) g.fillRect(O+dxa+1+i,O+dya+1+bh+k,1,1);
    // 2. side faces (east + south), cool-tinted
    var eastC=mix(shd(wall,0.7),COOL,0.35), southC=mix(shd(wall,0.6),COOL,0.45);
    for(i=0;i<dxa;i++){ rg(O+bw+i,O+Math.round((i+1)*dya/dxa),1,bh,i===0?shd(eastC,1.12):eastC); }
    for(i=0;i<dya;i++){ var xo=Math.round((i+1)*dxa/dya); rg(O+xo,O+bh+i,bw,1,i===dya-1?shd(southC,0.85):southC); }
    // 3. facade: mud-brick courses, per-brick tone, plaster washes and exposed brick
    for(var y=0;y<bh;y++) for(var x=0;x<bw;x++){
      var row=Math.floor(y/3), off=(row&1)?3:0, seamY=(y%3===2), seamX=((x+off)%6===0), bk=hxs(Math.floor((x+off)/6),row,seed+2);
      var pl=hxs(Math.floor(x/5),Math.floor(y/5),seed+3)>0.76, ex=(y>bh*0.55)&&hxs(Math.floor(x/4),Math.floor(y/4),seed+4)>0.84;
      var t=2+(bk<0.22?-1:bk>0.8?1:0); var r=hxs(x,y,seed+1); if(r<0.07) t--; else if(r>0.94) t++;
      var col=TONE[Math.max(0,Math.min(4,t))];
      if(pl){ col=TONE[3]; if(r<0.1) col=TONE[2]; }
      else if(seamY||seamX) col=SEAM;
      if(ex&&!pl){ col=BRICK[Math.min(2,(r*3)|0)]; if(seamY||seamX) col='#7e4c30'; }
      if(x<2) col=shd(col,1.18); else if(x>=bw-2) col=shd(col,0.84); if(y>=bh-1) col=shd(col,0.78);
      rg(O+x,O+y,1,1,col);
    }
    // 4. roof band + parapet teeth
    rg(O,O,bw,3,roof); rg(O,O,bw,1,shd(roof,1.25)); rg(O,O+2,bw,1,shd(roof,0.72));
    for(x=0;x<bw;x++){ if(x%3!==2){ rg(O+x,O-1,1,1,roof); if(x%6===0) rg(O+x,O-1,1,1,shd(roof,1.22)); } }
    var rs=b.roofStyle||0;
    if(rs===1){ for(x=1;x<bw-1;x+=4){ rg(O+x,O+3,2,1,'#5a3a1c'); rg(O+x,O+4,2,1,'rgba(40,24,40,0.5)'); } }
    else if(rs===2){ var tw=Math.min(12,bw-6); for(x=0;x<tw;x++) rg(O+2+x,O,1,3,x&1?'#8a9090':'#aab0b0'); rg(O+bw-7,O,3,2,'#2a1a0c'); rg(O+bw-7,O,3,1,'#5a4030'); }
    // 5. outline (left + parapet), selective
    rg(O-1,O,1,bh,OUTL); for(x=0;x<bw;x++) if(x%3!==2) rg(O+x,O-2,1,1,OUTL);
    // 6. windows (same grid as the game's layout), arched, shuttered, some lit
    var wp=b.winPattern||0, winW=10,winH=8,cols,rows;
    if(wp===1){winW=7;winH=15;cols=Math.max(1,Math.floor(w/40));rows=Math.max(1,Math.floor(h/26));}
    else if(wp===2){winW=15;winH=13;cols=Math.max(1,Math.floor(w/48));rows=Math.max(1,Math.floor(h/48));}
    else{cols=Math.max(1,Math.floor(w/32));rows=Math.max(1,Math.floor(h/32));}
    var ww=Math.max(2,Math.round(winW/PX)), hh=Math.max(2,Math.round(winH/PX));
    for(var rr=0;rr<rows;rr++) for(var cc=0;cc<cols;cc++){
      var wx=11+cc*((w-22)/Math.max(1,cols)), wy=16+rr*((h-36)/Math.max(1,rows));
      if(!(wx<w-16&&wy<h-16)) continue;
      var ax=O+Math.round(wx/PX), ay=O+Math.round(wy/PX), lit=((rr*3+cc)%5===0);
      rg(ax-1,ay-1,ww+2,1,shd(wall,0.62)); rg(ax-1,ay+hh,ww+2,1,HI);
      rg(ax,ay,ww,hh,lit?'#6a3c10':env.bWin); rg(ax,ay,ww,1,'#0e0802');
      if(lit) rg(ax+1,ay+hh-1,Math.max(1,ww-2),1,'#e6b552');
      if(hh>=3){ rg(ax,ay,1,1,TONE[2]); rg(ax+ww-1,ay,1,1,TONE[2]); }
      if((rr+cc)%3===1){ rg(ax-1,ay,1,hh,'#4f7d7a'); rg(ax+ww,ay,1,hh,'#386058'); }
    }
    // 7. door frame + stone threshold (the game draws its red-outlined door on top)
    var dx0=w/2-8, dy0=h-22; if(b.door==='n') dy0=0; else if(b.door==='e'){ dx0=w-16; dy0=h/2-11; } else if(b.door==='w'){ dx0=0; dy0=h/2-11; }
    var fx=O+Math.floor(dx0/PX)-1, fy=O+Math.floor(dy0/PX)-1, fw=Math.ceil(16/PX)+2, fh=Math.ceil(22/PX)+2;
    rg(fx,fy,fw,fh,'#e6cf98'); rg(fx+1,fy+1,fw-2,fh-2,'#2a1a0c'); rg(fx,fy,fw,1,HI); rg(fx,fy,1,1,TONE[2]); rg(fx+fw-1,fy,1,1,TONE[2]);
    if(!b.door||b.door==='s') rg(fx-1,fy+fh-1,fw+2,1,'#cf983c');
    // 8. pre-damage: jagged cracks + a chipped patch down to the brick
    var pd=b.preDamage||0;
    if(pd>0){ var n=2+Math.floor(pd*3); for(i=0;i<n;i++){ var cx=O+2+Math.floor(hxs(i,seed,7)*(bw-4)), cy=O+4+Math.floor(hxs(i,seed,8)*(bh-6));
        for(k=0;k<5;k++){ rg(cx,cy,1,1,'#3a2414'); cx+=hxs(i,k,seed)<0.5?1:0; cy+=1; if(hxs(k,i,seed)<0.3) cx-=1; }
        rg(cx-2,cy-1,3,2,'#a8704a'); } }
    // 9. wind-blown sand banked on the base corners
    var SD=['#cf983c','#e6b552','#f4cf78']; function drift(x0,dir){ for(var q=0;q<7;q++){ var ht=Math.max(0,5-Math.floor(q*0.85)); for(var u=0;u<ht;u++){ if(u===ht-1&&hxs(q,u,seed+9)<0.3) continue; rg(x0+dir*q,O+bh+dya-u,1,1,SD[Math.min(2,Math.floor(u*3/Math.max(1,ht)))]); } } }
    drift(O-3,1); drawDriftR(); function drawDriftR(){ drift(O+bw+dxa+1,-1); }
    // upscale with nearest-neighbour; pad the sub-pixel remainder so hit-boxes match
    var oc=mk(gw*PX,gh*PX), c=oc.getContext('2d'); c.imageSmoothingEnabled=false; c.drawImage(s,0,0,gw*PX,gh*PX);
    c.fillStyle=TONE[1]; if(w>bw*PX) c.fillRect(O*PX+bw*PX,O*PX,w-bw*PX,h); if(h>bh*PX) c.fillRect(O*PX,O*PX+bh*PX,w,h-bh*PX);
    b._shellCache=oc; b._shellCachePad=O*PX;
  }
  window.__desertPixel={carcass:carcass,tracks:tracks,storm:storm,building:building};
})();