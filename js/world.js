/* World: renderer, circuit path, road, city, banners, lamps, shops, pedestrians */
const SHOP=['ABOUT ME STUDIO','CAREER GARAGE','SKILL ARMORY','PROJECT MALL','CONTACT HUB'];
const TOUCH=matchMedia("(pointer:coarse)").matches;
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const CP=[[0,0],[0,-250],[40,-450],[180,-560],[380,-560],[520,-470],[560,-320],[450,-230],[300,-250],[220,-150],[320,-60],[430,40],[380,150],[200,160],[60,120]].map(a=>V(a[0]*1.6,0,a[1]*1.6));
const curve=new THREE.CatmullRomCurve3(CP,true,'centripetal'),LEN=curve.getLength(),N=Math.round(LEN/8),STEP=LEN/N;
STOPS.forEach((s,i)=>{
  s.s=LEN*[.13,.31,.5,.68,.86][i];
  s.side=i%2?-1:1;
  s.shop=SHOP[i]
});
const pts=[];
for(let i=0;i<N;i++){
  const p=curve.getPointAt(i/N),t=curve.getTangentAt(i/N);
  pts.push({
    x:p.x,z:p.z,nx:-t.z,nz:t.x
  })
}

const mod=(a)=>((a%LEN)+LEN)%LEN,cd=(a,b)=>{
  const d=mod(a-b);
  return Math.min(d,LEN-d)
};
function P(s){
  s=mod(s);
  const i=Math.floor(s/STEP)%N,j=(i+1)%N,f=s/STEP-Math.floor(s/STEP),a=pts[i],b=pts[j];
  let nx=a.nx+(b.nx-a.nx)*f,nz=a.nz+(b.nz-a.nz)*f;
  const l=Math.hypot(nx,nz);
  nx/=l;
  nz/=l;
  return{
    x:a.x+(b.x-a.x)*f,z:a.z+(b.z-a.z)*f,nx,nz,th:Math.atan2(nz,nx)
  }
}

const R=new THREE.WebGLRenderer({
  antialias:true
});
R.setPixelRatio(Math.min(devicePixelRatio,TOUCH?1.5:2));
R.setSize(innerWidth,innerHeight);
R.toneMapping=THREE.ACESFilmicToneMapping;
R.toneMappingExposure=1.15;
R.outputEncoding=THREE.sRGBEncoding;
document.body.prepend(R.domElement);
const S=new THREE.Scene();
S.background=new THREE.Color(0x120a2e);
S.fog=new THREE.FogExp2(0x1a0d3d,.0072);
const cam=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,800);
S.add(new THREE.HemisphereLight(0x8a7bff,0x1a0b3a,.85));
function tex(draw,w,h,rep){
  const c=document.createElement('canvas');
  c.width=w;
  c.height=h;
  draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c);
  t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.anisotropy=R.capabilities.getMaxAnisotropy();
  t.encoding=THREE.sRGBEncoding;
  return t
}

function radial(c,a){
  return tex((g,w,h)=>{
    const r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
    r.addColorStop(0,c);
    r.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=r;
    g.fillRect(0,0,w,h)
  },64,64)
}

function ribbon(o1,o2,y,mat,vr){
  const pos=[],uv=[],idx=[];
  for(let i=0;i<=N;i++){
    const p=pts[i%N];
    pos.push(p.x+p.nx*o1,y,p.z+p.nz*o1,p.x+p.nx*o2,y,p.z+p.nz*o2);
    uv.push(0,i*STEP/vr,1,i*STEP/vr);
    if(i<N){
      const k=i*2;
      idx.push(k,k+2,k+1,k+1,k+2,k+3)
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat);
  S.add(m);
  return m
}

const vr=LEN/Math.round(LEN/16);
const rt=tex((g,w,h)=>{
  g.fillStyle='#15151f';
  g.fillRect(0,0,w,h);
  for(let i=0;i<900;i++){
    g.fillStyle='rgba(255,255,255,'+Math.random()*.05+')';
    g.fillRect(Math.random()*w,Math.random()*h,2,2)
  }
  g.fillStyle='#e8e8e8';
  g.fillRect(5,0,4,h);
  g.fillRect(w-9,0,4,h);
  g.fillStyle='#ffd400';
  g.fillRect(w/2-6,0,3,h);
  g.fillRect(w/2+3,0,3,h);
  g.fillStyle='#ffffffaa';
  g.fillRect(w*.25-2,0,4,h*.4);
  g.fillRect(w*.75-2,0,4,h*.4)
},128,128);
ribbon(-7,7,0,new THREE.MeshStandardMaterial({
  map:rt,roughness:.28,metalness:.35,side:2
}),vr);
const kt=tex((g,w,h)=>{
  g.fillStyle='#e8e8e8';
  g.fillRect(0,0,w,h);
  g.fillStyle='#d3202a';
  g.fillRect(0,h/2,w,h/2)
},8,16),km=new THREE.MeshStandardMaterial({
  map:kt,side:2
});
ribbon(7,8.3,.03,km,4);
ribbon(-8.3,-7,.03,km,4);
const swt=tex((g,w,h)=>{
  g.fillStyle='#2b2b46';
  g.fillRect(0,0,w,h);
  g.strokeStyle='#14142a';
  g.lineWidth=3;
  g.strokeRect(0,0,w,h)
},64,64),swm=new THREE.MeshStandardMaterial({
  map:swt,side:2,roughness:.7
});
ribbon(8.3,13,.15,swm,5);
ribbon(-13,-8.3,.15,swm,5);
const gnd=new THREE.Mesh(new THREE.PlaneGeometry(5000,5000),new THREE.MeshStandardMaterial({
  color:0x090915
}));
gnd.rotation.x=-Math.PI/2;
gnd.position.y=-.05;
S.add(gnd);
const moon=new THREE.Mesh(new THREE.SphereGeometry(35,24,24),new THREE.MeshBasicMaterial({
  color:0xffc9f3,fog:false
}));
S.add(moon);
const sg=new THREE.BufferGeometry(),sp=[];
for(let i=0;i<600;i++){
  const a=Math.random()*6.28,e=Math.random()*1.3+.1;
  sp.push(Math.cos(a)*Math.cos(e)*700,Math.sin(e)*700,Math.sin(a)*Math.cos(e)*700)
}

sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
const stars=new THREE.Points(sg,new THREE.PointsMaterial({
  color:0xffffff,size:2,fog:false
}));
S.add(stars);

// start/finish
{
  const p=P(0),g=new THREE.Group();
  g.position.set(p.x,0,p.z);
  g.rotation.y=-p.th;
  S.add(g);
  const ck=tex((a,w,h)=>{
    for(let y=0;y<4;y++)for(let x=0;x<16;x++){
      a.fillStyle=(x+y)%2?'#fff':'#111';
      a.fillRect(x*w/16,y*h/4,w/16,h/4)
    }
  },128,32);
  const f=new THREE.Mesh(new THREE.PlaneGeometry(14,2.5),new THREE.MeshBasicMaterial({
    map:ck
  }));
  f.rotation.x=-Math.PI/2;
  f.position.y=.04;
  g.add(f);
  const m=new THREE.MeshStandardMaterial({
    color:0xdddddd,metalness:.8,roughness:.3
  });
  [-8.5,8.5].forEach(x=>{
    const b=new THREE.Mesh(new THREE.BoxGeometry(.7,12,.7),m);
    b.position.set(x,6,0);
    g.add(b)
  });
  const bm=new THREE.Mesh(new THREE.BoxGeometry(17.7,3.4,.6),new THREE.MeshBasicMaterial({
    color:0x111111
  }));
  bm.position.y=11;
  g.add(bm);
  const sn=new THREE.Mesh(new THREE.PlaneGeometry(15,3),label('START / FINISH','#ffffff',15,3));
  sn.position.set(0,11,.35);
  g.add(sn)
}

// photo flex banners (vertical, crisp, no glow)
const IM=[],FOC=[[.45,.3],[.4,.48],[.48,.3],[.22,.17],[.45,.6],[.45,.45],[.5,.4]],HDI=[0,2,1,6,3];
const BN=[{
  im:0,c:'#00e5ff',k:'WELCOME TO MY CITY',t:['KARTHIK','AMBATI'],l:['Senior WordPress Developer','Hyderabad · India']
}, {
  im:2,c:'#ff2bd6',k:'LIVE PROJECTS',t:['PROJECTS'],l:['Ritewaymed · Drogo · MRVV','Masters Visa · Cogniflex']
}, {
  im:1,c:'#ffd400',k:'SKILLS',t:['WORDPRESS','EXPERT'],l:['PHP · WooCommerce · Plugins','HTML5 · CSS · JavaScript']
}, {
  im:3,c:'#7dff6b',k:'EXPERIENCE',t:['3+ YEARS'],l:['MRVV · Tectoro · Masters Visa','Sunrise · Yaaron Media']
}, {
  im:5,c:'#ff7a00',k:'OPEN FOR FREELANCE',t:['HIRE ME'],l:['WordPress · WooCommerce','karthikkumarambati@gmail.com']
}, {
  im:6,c:'#b18cff',k:'DESIGN & CREATIVITY',t:['CREATIVE','MIND'],l:['Custom themes · Responsive UI','SEO-friendly builds']
}, {
  im:4,c:'#00e5ff',k:'CLEAN CODE',t:['KARTHIK','DEV'],l:['Fast, secure websites','Built with passion']
}];
function cover(g,im,fx,fy,w,h,ax,ay,z){
  const r=Math.max(w/im.width,h/im.height)*z,sw=w/r,sh=h/r,sx=Math.max(0,Math.min(im.width-sw,fx*im.width-ax*sw)),sy=Math.max(0,Math.min(im.height-sh,fy*im.height-ay*sh));
  g.drawImage(im,sx,sy,sw,sh,0,0,w,h)
}

function fit(g,txt,mw,fs,fam){
  while(fs>14){
    g.font='bold '+fs+'px '+fam;
    if(g.measureText(txt).width<=mw)break;
    fs-=2
  }
  g.font='bold '+fs+'px '+fam;
  return fs
}

BN.forEach(b=>{
  const c=document.createElement('canvas');
  c.width=512;
  c.height=1024;
  const t=new THREE.CanvasTexture(c);
  t.encoding=THREE.sRGBEncoding;
  t.anisotropy=R.capabilities.getMaxAnisotropy();
  b.cv=c;
  b.tx=t;
  b.mat=new THREE.MeshBasicMaterial({
    map:t,side:2,fog:false
  })
});
function drawBanner(b){
  const g=b.cv.getContext('2d'),w=512,h=1024,F='Impact,"Arial Black",Arial',A='Arial';
  g.fillStyle='#07091c';
  g.fillRect(0,0,w,h);
  const im=IM[b.im];
  if(im)cover(g,im,FOC[b.im][0],FOC[b.im][1],w,600,.5,.4,1.1);
  else{
    g.fillStyle='#14183a';
    g.fillRect(0,0,w,600)
  }
  g.fillStyle=b.c;
  g.fillRect(0,600,w,10);
  g.textAlign='center';
  g.textBaseline='alphabetic';
  fit(g,b.k,w-60,30,A);
  g.fillStyle=b.c;
  g.fillText(b.k,w/2,664);
  let y=742;
  g.fillStyle='#fff';
  b.t.forEach((s,i)=>{
    const fs=fit(g,s,w-60,72,F);
    g.fillText(s,w/2,y);
    if(i<b.t.length-1)y+=fs+2
  });
  y+=52;
  g.fillStyle='#ffe9c8';
  b.l.forEach(s=>{
    fit(g,s,w-50,30,A);
    g.fillText(s,w/2,y);
    y+=42
  });
  fit(g,'karthikkumarambati.github.io/karthik_kumar',w-40,20,A);
  g.fillStyle='#cfd6ff';
  g.fillText('karthikkumarambati.github.io/karthik_kumar',w/2,h-26);
  g.strokeStyle=b.c;
  g.lineWidth=10;
  g.strokeRect(5,5,w-10,h-10);
  b.tx.needsUpdate=true
}

function redrawAll(){
  BN.forEach(drawBanner)
}

redrawAll();
IMGS.forEach((u,i)=>{
  const im=new Image();
  im.onload=()=>{
    IM[i]=im;
    redrawAll()
  };
  im.src=u
});
let bi=0;

// buildings
const BL=[];
const cols=['#ffd9a0','#ffe9c8','#ffd9a0','#9fd8ff','#ff4fd8','#00e5ff','#ffd400'],NC=['#ff2bd6','#00e5ff','#ffd400','#8a6bff'];
const bmats=[0,1,2].map(k=>{
  const t=tex((g,w,h)=>{
    g.fillStyle=['#10122e','#161233','#0c1a2e'][k];
    g.fillRect(0,0,w,h);
    for(let y=6;y<h;y+=16)for(let x=6;x<w;x+=16)if(Math.random()<.5){
      g.fillStyle=cols[(Math.random()*7)|0];
      g.globalAlpha=.5+Math.random()*.5;
      g.fillRect(x,y,8,9);
      g.globalAlpha=1
    }else{
      g.fillStyle='#1c2250';
      g.fillRect(x,y,8,9)
    }
  },128,256);
  t.repeat.set(2,[3,6,10][k]);
  return new THREE.MeshStandardMaterial({
    map:t,emissiveMap:t,emissive:0xffffff,emissiveIntensity:.85,roughness:.6
  })
});
function label(txt,col,pw,ph){
  const ch=Math.round(1024*ph/pw),t=tex((g,w,h)=>{
    g.fillStyle='#07091c';
    g.fillRect(0,0,w,h);
    g.fillStyle=col;
    const bt=Math.round(h*.08);
    g.fillRect(0,0,w,bt);
    g.fillRect(0,h-bt,w,bt);
    let fs=Math.round(h*.5);
    const F='bold FSpx Impact,"Arial Black",Arial';
    g.font=F.replace('FS',fs);
    while(g.measureText(txt).width>w*.88&&fs>12){
      fs-=2;
      g.font=F.replace('FS',fs)
    }
    g.fillStyle='#fff';
    g.textAlign='center';
    g.textBaseline='middle';
    g.fillText(txt,w/2,h/2)
  },1024,ch);
  t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
  return new THREE.MeshBasicMaterial({
    map:t,fog:false
  })
}

const bg=new THREE.BoxGeometry(14,1,14),words=['RAMEN','ARCADE','NEON BAR','TECH','PIZZA','MOTO','SUSHI','BOOKS','HOTEL'],wm={},roofm=new THREE.MeshStandardMaterial({
  color:0x222233
});
for(let s=10;s<LEN;s+=14)for(const sd of[-1,1]){
  if(cd(s,0)<16||(sd===1&&cd(s,78)<24)||STOPS.some(t=>t.side===sd&&cd(t.s,s)<17))continue;
  const p=P(s),k=(Math.random()*3)|0,h=[14,26,46][k]*(.8+Math.random()*.6),o=(15+Math.random()*5+7)*sd,bx=p.x+p.nx*o,bz=p.z+p.nz*o;
  let bad=false;
  for(let j=0;j<N;j+=2){
    const ci=Math.abs(Math.floor(s/STEP)-j);
    if(Math.min(ci,N-ci)>30&&Math.hypot(pts[j].x-bx,pts[j].z-bz)<27){
      bad=true;
      break
    }
  }
  if(bad)continue;
  const b=new THREE.Mesh(bg,bmats[k]);
  b.scale.y=h;
  b.position.set(bx,h/2,bz);
  b.rotation.y=-p.th;
  S.add(b);
  BL.push({
    s,sd,e:Math.abs(o)-7.6
  });
  if(Math.random()<.5){
    const r=new THREE.Mesh(new THREE.BoxGeometry(3,2,3),roofm);
    r.position.set(bx,h+1,bz);
    S.add(r);
    if(Math.random()<.5){
      const a=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,7),roofm);
      a.position.set(bx,h+5,bz);
      S.add(a);
      const rl=new THREE.Mesh(new THREE.SphereGeometry(.3),new THREE.MeshBasicMaterial({
        color:0xff2020
      }));
      rl.position.set(bx,h+8.5,bz);
      S.add(rl)
    }
  }
  const q=o-sd*7.1,gx=p.x+p.nx*q,gz=p.z+p.nz*q,gc=NC[(Math.random()*4)|0];
  const gs=new THREE.Mesh(new THREE.PlaneGeometry(11,3),new THREE.MeshBasicMaterial({
    color:gc,transparent:true,opacity:.45
  }));
  gs.position.set(gx,2,gz);
  gs.rotation.y=-p.th-sd*Math.PI/2;
  S.add(gs);
  if(k>=1&&Math.random()<(k===2?.9:.5)){
    const bq=o-sd*10.1,bn=new THREE.Mesh(new THREE.PlaneGeometry(6,12),BN[(bi++)%BN.length].mat);
    bn.position.set(p.x+p.nx*bq,Math.min(h-7,17+Math.random()*4),p.z+p.nz*bq);
    bn.rotation.y=-p.th;
    S.add(bn)
  }
  if(Math.random()<.4){
    const w=words[(Math.random()*words.length)|0],m=wm[w+gc]||(wm[w+gc]=label(w,gc,8,2.5)),sn=new THREE.Mesh(new THREE.PlaneGeometry(8,2.5),m);
    sn.position.set(gx,5.5+Math.random()*4,gz);
    sn.rotation.y=-p.th-sd*Math.PI/2;
    S.add(sn)
  }
}

// lamps, glow, trees
const lm=new THREE.MeshBasicMaterial({
  color:0xfff2c0
}),pm=new THREE.MeshStandardMaterial({
  color:0x2a2a3a,metalness:.7,roughness:.4
}),poolT=radial('rgba(255,225,160,.7)'),glowT=radial('rgba(255,235,180,1)'),trm=new THREE.MeshStandardMaterial({
  color:0x3a2a1a
}),lfm=new THREE.MeshStandardMaterial({
  color:0x1d6b52,emissive:0x0a3a2c
});
for(let s=0;s<LEN;s+=30)for(const sd of[-1,1]){
  const p=P(s),o=12*sd,x=p.x+p.nx*o,z=p.z+p.nz*o;
  const pl=new THREE.Mesh(new THREE.CylinderGeometry(.08,.14,8),pm);
  pl.position.set(x,4,z);
  S.add(pl);
  if(((s/30)|0)%3===0){
    const lb=new THREE.Mesh(new THREE.PlaneGeometry(2.4,4.8),BN[(bi++)%BN.length].mat);
    lb.position.set(x-p.nx*sd*1.4,5.2,z-p.nz*sd*1.4);
    lb.rotation.y=-p.th;
    S.add(lb)
  }
  const ax=x-p.nx*sd*1.3,az=z-p.nz*sd*1.3,arm=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,1.4),pm);
  arm.position.set(x-p.nx*sd*.65,8,z-p.nz*sd*.65);
  arm.rotation.y=-p.th-sd*Math.PI/2;
  arm.rotation.y=-p.th+Math.PI/2;
  S.add(arm);
  const l=new THREE.Sprite(new THREE.SpriteMaterial({
    map:glowT,blending:THREE.AdditiveBlending,depthWrite:false
  }));
  l.scale.set(5,5,1);
  l.position.set(ax,8,az);
  S.add(l);
  const pool=new THREE.Mesh(new THREE.PlaneGeometry(22,22),new THREE.MeshBasicMaterial({
    map:poolT,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false
  }));
  pool.rotation.x=-Math.PI/2;
  pool.position.set(ax-p.nx*sd*3,.06,az-p.nz*sd*3);
  S.add(pool)
}

for(let s=15;s<LEN;s+=45)for(const sd of[-1,1]){
  const p=P(s),o=11*sd;
  if(STOPS.some(t=>t.side===sd&&cd(t.s,s)<14))continue;
  const x=p.x+p.nx*o,z=p.z+p.nz*o,t=new THREE.Mesh(new THREE.CylinderGeometry(.15,.2,3),trm);
  t.position.set(x,1.5,z);
  S.add(t);
  const l=new THREE.Mesh(new THREE.SphereGeometry(1.7,10,8),lfm);
  l.position.set(x,4,z);
  S.add(l)
}

// shops
STOPS.forEach((st,i)=>{
  const p=P(st.s),sd=st.side,c='#'+st.col.toString(16).padStart(6,'0'),g=new THREE.Group(),bm=new THREE.MeshBasicMaterial({
    color:st.col
  });
  g.position.set(p.x+p.nx*sd*21,0,p.z+p.nz*sd*21);
  g.rotation.y=-p.th;
  S.add(g);
  BL.push({
    s:st.s,sd,e:13.7
  });
  const body=new THREE.Mesh(new THREE.BoxGeometry(14,10,16),new THREE.MeshStandardMaterial({
    color:0x1b1b44,roughness:.5
  }));
  body.position.y=5;
  g.add(body);
  const tw=new THREE.Mesh(bg,bmats[1]);
  tw.scale.set(.85,28,1);
  tw.position.y=24;
  g.add(tw);
  const fx=-sd*7.06,rot=-sd*Math.PI/2;
  const win=new THREE.Mesh(new THREE.PlaneGeometry(13,4),new THREE.MeshBasicMaterial({
    color:st.col,transparent:true,opacity:.55
  }));
  win.position.set(fx,2.6,0);
  win.rotation.y=rot;
  g.add(win);
  const sn=new THREE.Mesh(new THREE.PlaneGeometry(13,3.4),label(st.shop,c,13,3.4));
  sn.position.set(fx-sd*.05,7.6,0);
  sn.rotation.y=rot;
  g.add(sn);
  const aw=new THREE.Mesh(new THREE.BoxGeometry(2.2,.3,14),bm);
  aw.position.set(fx-sd*1.1,5,0);
  g.add(aw);
  const nm=new THREE.Mesh(new THREE.BoxGeometry(.2,.2,16),bm);
  nm.position.set(fx-sd*.1,9.4,0);
  g.add(nm);
  const bc=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,90,16,1,true),new THREE.MeshBasicMaterial({
    color:st.col,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false,side:2
  }));
  bc.position.y=45;
  g.add(bc);
  st.bc=bc;
  const pl=new THREE.PointLight(st.col,2.2,34);
  pl.position.set(fx-sd*5,4,0);
  g.add(pl);
  const li=document.createElement('button');
  li.className='si';
  li.style.setProperty('--sc',c);
  li.innerHTML='<b class="n">'+(i+1)+'</b><span class="t">'+st.hd+'<small>'+st.shop+'</small></span><em class="ds">–</em><i class="ck">✓</i><span class="go" role="button" title="Fast travel">⤳ GO</span>';
  st.li=li;
  li.onclick=e=>{
    if(e.target.closest('.go'))travelTo(i);
    else setTarget(i)
  };
  $('slist').appendChild(li)
});

// orbs
const orbs=[],og=new THREE.OctahedronGeometry(.6),om=new THREE.MeshBasicMaterial({
  color:0x00ffd0
});
for(let s=60;s<LEN-30;s+=30){
  if(STOPS.some(t=>cd(t.s,s)<22))continue;
  const p=P(s),d=(Math.random()*2-1)*5.5,o=new THREE.Mesh(og,om);
  o.position.set(p.x+p.nx*d,1.2,p.z+p.nz*d);
  o.userData={
    s,d
  };
  S.add(o);
  orbs.push(o)
}

// people, welcome board, section gantries
const PG={
  leg:new THREE.CylinderGeometry(.065,.055,.8,6),torso:new THREE.CylinderGeometry(.16,.19,.6,8),skirt:new THREE.CylinderGeometry(.17,.33,.5,10),head:new THREE.SphereGeometry(.14,10,8),hair:new THREE.SphereGeometry(.16,10,8),arm:new THREE.CylinderGeometry(.045,.04,.6,6),long:new THREE.BoxGeometry(.28,.5,.1)
},PMc={};
const pmat=c=>PMc[c]||(PMc[c]=new THREE.MeshStandardMaterial({
  color:c,roughness:.7,emissive:c,emissiveIntensity:.18
}));
function person(f,top,bot,hair,skin){
  const g=new THREE.Group(),A=(geo,m,x,y,z)=>{
    const q=new THREE.Mesh(geo,m);
    q.position.set(x,y,z);
    return q
  },l=[],a=[];
  [-1,1].forEach(k=>{
    const p=new THREE.Group();
    p.position.set(k*.1,.85,0);
    p.add(A(PG.leg,pmat(f?skin:bot),0,-.4,0));
    g.add(p);
    l.push(p);
    const q=new THREE.Group();
    q.position.set(k*.22,1.46,0);
    q.add(A(PG.arm,pmat(f?top:skin),0,-.28,0));
    g.add(q);
    a.push(q)
  });
  g.add(A(PG.torso,pmat(top),0,1.18,0));
  if(f)g.add(A(PG.skirt,pmat(bot),0,.9,0));
  g.add(A(PG.head,pmat(skin),0,1.7,0));
  const h=A(PG.hair,pmat(hair),0,1.74,.02);
  g.add(h);
  if(f)g.add(A(PG.long,pmat(hair),0,1.5,.1));
  g.userData={
    l,a
  };
  return g
}

const skins=[0xf1c9a5,0xd9a47c,0xb97c54,0x8d5a3b],tops=[0xff2bd6,0x00e5ff,0xffd400,0x7dff6b,0xff7a00,0x8a6bff,0xffffff],bots=[0x223355,0x334466,0x552244,0x224455,0x333333],hairs=[0x111111,0x2b1a10,0x5a3a1a,0xb0702a];
const rnd=a=>a[(Math.random()*a.length)|0],PD=[];
for(let i=0;i<150;i++){
  const g=person(Math.random()<.5,rnd(tops),rnd(bots),rnd(hairs),rnd(skins));
  S.add(g);
  PD.push({
    g,s:Math.random()*LEN,off:(i%2?1:-1)*(9+Math.random()*1.4),dir:Math.random()<.5?1:-1,sp:1.1+Math.random()*1.1,ph:Math.random()*6
  })
}

const HOST=[];
function host(x,z,A,sc,top){
  const g=person(true,top,0x222244,0x111111,0xf1c9a5);
  g.scale.setScalar(sc);
  g.position.set(x,.15,z);
  g.rotation.y=A;
  S.add(g);
  HOST.push(g)
}

function girlArt(g,x,y,s,dress,hair){
  g.save();
  g.translate(x,y);
  g.scale(s,s);
  g.fillStyle=hair;
  g.beginPath();
  g.ellipse(0,-195,34,46,0,0,6.3);
  g.fill();
  g.fillRect(-32,-195,64,70);
  g.fillStyle='#f1c9a5';
  g.fillRect(-14,-80,10,80);
  g.fillRect(4,-80,10,80);
  g.fillStyle='#222';
  g.fillRect(-18,-8,16,8);
  g.fillRect(2,-8,16,8);
  g.fillStyle=dress;
  g.beginPath();
  g.moveTo(-22,-172);
  g.lineTo(22,-172);
  g.lineTo(44,-72);
  g.lineTo(-44,-72);
  g.fill();
  g.strokeStyle='#f1c9a5';
  g.lineWidth=9;
  g.lineCap='round';
  g.beginPath();
  g.moveTo(-20,-165);
  g.lineTo(-36,-112);
  g.moveTo(20,-165);
  g.lineTo(48,-205);
  g.lineTo(52,-245);
  g.stroke();
  g.fillStyle='#f1c9a5';
  g.fillRect(-6,-186,12,16);
  g.beginPath();
  g.arc(0,-205,26,0,6.3);
  g.fill();
  g.fillStyle=hair;
  g.beginPath();
  g.arc(0,-208,28,Math.PI,2*Math.PI);
  g.fill();
  g.fillRect(-29,-208,9,45);
  g.fillRect(20,-208,9,45);
  g.fillStyle='#222';
  g.beginPath();
  g.ellipse(-9,-203,3,4.5,0,0,6.3);
  g.ellipse(9,-203,3,4.5,0,0,6.3);
  g.fill();
  g.fillStyle='rgba(255,100,140,.5)';
  g.beginPath();
  g.arc(-15,-193,5,0,6.3);
  g.arc(15,-193,5,0,6.3);
  g.fill();
  g.strokeStyle='#c03060';
  g.lineWidth=2.5;
  g.beginPath();
  g.arc(0,-194,8,.2,Math.PI-.2);
  g.stroke();
  g.restore()
}

{
  const bt=tex((g,w,h)=>{
    const r=g.createLinearGradient(0,0,w,h);
    r.addColorStop(0,'#1a0b3a');
    r.addColorStop(1,'#4a0f5c');
    g.fillStyle=r;
    g.fillRect(0,0,w,h);
    for(let i=0;i<70;i++){
      g.fillStyle='rgba(255,255,255,'+Math.random()*.6+')';
      g.fillRect(Math.random()*w,Math.random()*h,2,2)
    }
    g.strokeStyle='#ff2bd6';
    g.lineWidth=12;
    g.strokeRect(10,10,w-20,h-20);
    g.textAlign='center';
    g.fillStyle='#fff';
    g.font='bold 104px Impact,Arial';
    g.fillText('WELCOME',w/2,115);
    g.font='bold 42px Impact,Arial';
    g.fillStyle='#00e5ff';
    g.fillText("TO KARTHIK'S CITY",w/2,168);
    g.shadowBlur=0;
    g.font='22px Arial';
    g.fillStyle='#ffd9f7';
    g.fillText('Ride the circuit · stop at the glowing shops · discover my portfolio',w/2,206);
    girlArt(g,250,500,1.2,'#ff2bd6','#2b1a10');
    girlArt(g,512,505,1.35,'#00e5ff','#111111');
    girlArt(g,774,500,1.2,'#ffd400','#b0702a')
  },1024,512);
  bt.wrapS=bt.wrapT=THREE.ClampToEdgeWrapping;
  const p=P(78),g=new THREE.Group();
  g.position.set(p.x+p.nx*21,0,p.z+p.nz*21);
  g.rotation.y=-p.th;
  S.add(g);
  const bd=new THREE.Group();
  bd.rotation.y=-Math.PI/2+.7;
  g.add(bd);
  const pl=new THREE.Mesh(new THREE.PlaneGeometry(26,13),new THREE.MeshBasicMaterial({
    map:bt,fog:false
  }));
  pl.position.y=11.5;
  bd.add(pl);
  [-11,11].forEach(x=>{
    const b=new THREE.Mesh(new THREE.BoxGeometry(.7,12,.7),pm);
    b.position.set(x,5,-.4);
    bd.add(b)
  });
  const lt=new THREE.PointLight(0xff2bd6,2.5,40);
  lt.position.set(0,8,4);
  bd.add(lt);
  [70,87].forEach((s,i)=>{
    const q=P(s);
    host(q.x+q.nx*10.4,q.z+q.nz*10.4,-q.th+Math.PI/2-.3,1.25,i?0x00e5ff:0xff2bd6)
  })
}

STOPS.forEach(s=>{
  const p=P(s.s-85),g=new THREE.Group(),c='#'+s.col.toString(16).padStart(6,'0'),m=new THREE.MeshBasicMaterial({
    color:s.col
  });
  g.position.set(p.x,0,p.z);
  g.rotation.y=-p.th;
  S.add(g);
  [-8.4,8.4].forEach(x=>{
    const b=new THREE.Mesh(new THREE.BoxGeometry(.6,10.5,.6),pm);
    b.position.set(x,5.2,0);
    g.add(b)
  });
  const bm=new THREE.Mesh(new THREE.BoxGeometry(17.4,.5,.5),m);
  bm.position.y=10.5;
  g.add(bm);
  const sn=new THREE.Mesh(new THREE.PlaneGeometry(15,3.6),label(s.hd+' »',c,15,3.6));
  sn.position.set(0,12.4,0);
  g.add(sn);
  const q=P(s.s+10);
  host(q.x+q.nx*s.side*10.4,q.z+q.nz*s.side*10.4,-q.th+s.side*Math.PI/2,1.2,s.col)
});
