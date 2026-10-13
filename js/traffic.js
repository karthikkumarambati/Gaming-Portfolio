/* Traffic: vehicles, two-way lanes, traffic signals */
// traffic & signals
const UB=new THREE.BoxGeometry(1,1,1),WG=new THREE.CylinderGeometry(.38,.38,.28,12).rotateZ(Math.PI/2),VM={};
const vm=c=>VM[c]||(VM[c]=new THREE.MeshStandardMaterial({
  color:c,metalness:.5,roughness:.4
})),glass=new THREE.MeshStandardMaterial({
  color:0x14213d,metalness:.9,roughness:.1
}),tyre=new THREE.MeshStandardMaterial({
  color:0x0a0a0a,roughness:.9
}),hlM=new THREE.MeshBasicMaterial({
  color:0xfff4c8
}),tlM=new THREE.MeshBasicMaterial({
  color:0xff2020
}), sH=new THREE.SpriteMaterial({
  map:glowT,color:0xfff2c0,blending:THREE.AdditiveBlending,depthWrite:false
}),sT=new THREE.SpriteMaterial({
  map:glowT,color:0xff2020,blending:THREE.AdditiveBlending,depthWrite:false
});
function bx(g,w,h,d,m,x,y,z){
  const q=new THREE.Mesh(UB,m);
  q.scale.set(w,h,d);
  q.position.set(x,y,z);
  g.add(q);
  return q
}

function wl(g,x,y,z,s){
  const q=new THREE.Mesh(WG,tyre);
  q.position.set(x,y,z);
  q.scale.setScalar(s||1);
  g.add(q);
  return q
}

function lights(g,x,y,zf,zb,hs){
  [-1,1].forEach(k=>{
    bx(g,.32,.2,.06,hlM,k*x,y,zf);
    bx(g,.3,.18,.06,tlM,k*x,y,zb);
    const a=new THREE.Sprite(sH);
    a.scale.set(hs,hs,1);
    a.position.set(k*x,y,zf-.1);
    g.add(a);
    const b=new THREE.Sprite(sT);
    b.scale.set(hs*.6,hs*.6,1);
    b.position.set(k*x,y,zb+.1);
    g.add(b)
  })
}

const BLD={
  car(c){
    const g=new THREE.Group();
    bx(g,1.9,.7,4.2,vm(c),0,.7,0);
    bx(g,1.6,.62,2.2,glass,0,1.33,.2);
    [-1,1].forEach(k=>{
      wl(g,k*.95,.38,-1.4);
      wl(g,k*.95,.38,1.4)
    });
    lights(g,.65,.8,-2.1,2.1,1.6);
    return{
      g,hl:2.1,hw:.95
    }
  }, jeep(c){
    const g=new THREE.Group();
    bx(g,1.9,.95,3.6,vm(c),0,.95,0);
    bx(g,1.82,.7,1.8,glass,0,1.75,.55);
    bx(g,1.9,.08,1.9,vm(c),0,2.15,.55);
    [-1,1].forEach(k=>{
      wl(g,k*.97,.45,-1.2,1.2);
      wl(g,k*.97,.45,1.2,1.2)
    });
    const sp=wl(g,0,1.1,1.85,1.1);
    sp.rotation.y=Math.PI/2;
    lights(g,.7,.95,-1.8,1.8,1.6);
    return{
      g,hl:1.9,hw:.97
    }
  }, truck(c){
    const g=new THREE.Group();
    bx(g,2.2,.5,8,vm(0x222222),0,.65,.2);
    bx(g,2.2,1.9,2,vm(0xdddddd),0,1.6,-3.1);
    bx(g,2,.7,.05,glass,0,2,-4.12);
    bx(g,2.4,2.5,5.6,vm(c),0,2.15,.9);
    [-1,1].forEach(k=>{
      wl(g,k*1.05,.5,-3.1,1.3);
      wl(g,k*1.05,.5,.6,1.3);
      wl(g,k*1.05,.5,2.3,1.3)
    });
    lights(g,.8,.9,-4.1,4.05,1.8);
    return{
      g,hl:4.1,hw:1.2
    }
  }, bus(c){
    const g=new THREE.Group();
    bx(g,2.5,2.7,9.2,vm(c),0,1.85,0);
    bx(g,2.52,.9,8.4,glass,0,2.4,0);
    bx(g,2.2,1,.05,glass,0,2.3,-4.62);
    [-1,1].forEach(k=>{
      wl(g,k*1.1,.5,-3,1.3);
      wl(g,k*1.1,.5,2.8,1.3)
    });
    lights(g,.8,.8,-4.6,4.6,2);
    return{
      g,hl:4.6,hw:1.27
    }
  }, van(c){
    const g=new THREE.Group();
    bx(g,2,1.7,4.6,vm(c),0,1.25,0);
    bx(g,1.9,.6,.05,glass,0,1.7,-2.31);
    [-1,1].forEach(k=>{
      wl(g,k*1,.38,-1.5);
      wl(g,k*1,.38,1.5)
    });
    lights(g,.7,.85,-2.3,2.3,1.6);
    return{
      g,hl:2.3,hw:1.02
    }
  }, auto(c){
    const g=new THREE.Group();
    bx(g,1.3,1,2.2,vm(0xffd400),0,.95,.1);
    bx(g,1.4,.1,2,vm(0x111111),0,1.95,.2);
    bx(g,1.2,.5,.05,glass,0,1.4,-.95);
    wl(g,0,.3,-1,.8);
    wl(g,-.65,.3,.9,.8);
    wl(g,.65,.3,.9,.8);
    bx(g,.3,.2,.06,hlM,0,.85,-1.02);
    const a=new THREE.Sprite(sH);
    a.scale.set(1.5,1.5,1);
    a.position.set(0,.85,-1.15);
    g.add(a);
    bx(g,.8,.2,.06,tlM,0,.85,1.22);
    return{
      g,hl:1.2,hw:.8
    }
  }, bike(c){
    const g=new THREE.Group(),w1=wl(g,0,.35,-.7,.9),w2=wl(g,0,.35,.7,.9);
    w1.scale.x=w2.scale.x=.4;
    bx(g,.3,.45,1.2,vm(c),0,.75,0);
    bx(g,.4,.75,.3,vm(0x223355),0,1.35,.15);
    bx(g,.3,.3,.3,vm(0xcc3333),0,1.9,.05);
    bx(g,.2,.15,.06,hlM,0,.95,-.62);
    const a=new THREE.Sprite(sH);
    a.scale.set(1.2,1.2,1);
    a.position.set(0,.95,-.75);
    g.add(a);
    bx(g,.2,.12,.05,tlM,0,.85,.62);
    return{
      g,hl:.9,hw:.45
    }
  }
};
const VC=[0xe53935,0x1e88e5,0xfdd835,0x43a047,0xffffff,0x212121,0x8e24aa,0xff7043,0x9e9e9e],TY=[['car',.38],['jeep',.48],['truck',.58],['bus',.64],['van',.71],['auto',.84],['bike',1]],SP={
  car:[14,24],jeep:[14,22],truck:[10,14],bus:[11,15],van:[13,20],auto:[9,13],bike:[14,20]
},TR=[];
function spawn(dir,n){
  const arr=[];
  for(let i=0;i<n;i++){
    const r=Math.random(),type=TY.find(t=>r<=t[1])[0],o=BLD[type](rnd(VC)),sp=SP[type],base=(sp[0]+Math.random()*(sp[1]-sp[0]))*(dir>0?1:1.15);
    S.add(o.g);
    arr.push({
      g:o.g,hl:o.hl,hw:o.hw,dir,base,spd:base,s:(i+Math.random()*.5)/n*LEN,d:dir>0?-3.5+(Math.random()-.5):3.5+(Math.random()-.5)
    })
  }
  arr.sort((a,b)=>a.s-b.s);
  arr.forEach((v,i)=>{
    v.lead=arr[dir>0?(i+1)%n:(i-1+n)%n];
    TR.push(v)
  })
}

spawn(1,38);
spawn(-1,44);
function clearStart(s0){
  s0=s0===undefined?3:s0;
  TR.forEach(v=>{
    v.spd=0;
    if(v.dir>0&&(mod(v.s-s0)<70||mod(s0-v.s)<30))v.s=mod(v.s+LEN*.37)
  })
}

clearStart();
const SIG=[.22,.41,.59,.77,.95].map((f,i)=>({
  s:LEN*f,i,st:'g',mr:new THREE.MeshBasicMaterial({
    color:0x2a0808
  }),my:new THREE.MeshBasicMaterial({
    color:0x2a2208
  }),mg:new THREE.MeshBasicMaterial({
    color:0x082a10
  })
}));
const zt=tex((g,w,h)=>{
  g.fillStyle='#e8e8e8';
  for(let x=0;x<w;x+=32)g.fillRect(x+4,0,16,h)
},256,32);
zt.wrapS=zt.wrapT=THREE.ClampToEdgeWrapping;
const zm=new THREE.MeshBasicMaterial({
  map:zt,transparent:true,depthWrite:false,opacity:.9
}),lnM=new THREE.MeshBasicMaterial({
  color:0xffffff
}),hdM=new THREE.MeshStandardMaterial({
  color:0x111118,roughness:.6
}),cg=new THREE.CircleGeometry(.2,16);
SIG.forEach(sg=>{
  const p=P(sg.s),g=new THREE.Group();
  g.position.set(p.x,0,p.z);
  g.rotation.y=-p.th;
  S.add(g);
  const z=new THREE.Mesh(new THREE.PlaneGeometry(14,3),zm);
  z.rotation.x=-Math.PI/2;
  z.position.y=.05;
  g.add(z);
  [[-3.5,5],[3.5,-5]].forEach(a=>{
    const l=new THREE.Mesh(new THREE.PlaneGeometry(6.6,.35),lnM);
    l.rotation.x=-Math.PI/2;
    l.position.set(a[0],.05,a[1]);
    g.add(l)
  });
  [-9.6,9.6].forEach(x=>{
    const b=new THREE.Mesh(new THREE.BoxGeometry(.4,7.6,.4),pm);
    b.position.set(x,3.8,0);
    g.add(b)
  });
  const bm=new THREE.Mesh(new THREE.BoxGeometry(19.2,.4,.4),pm);
  bm.position.y=7.6;
  g.add(bm);
  [[-3.5,1],[3.5,-1]].forEach(([x,f])=>{
    const h=new THREE.Mesh(new THREE.BoxGeometry(.7,1.9,.5),hdM);
    h.position.set(x,6.3,0);
    g.add(h);
    [[.6,sg.mr],[0,sg.my],[-.6,sg.mg]].forEach(([y,m])=>{
      const c=new THREE.Mesh(cg,m);
      c.position.set(x,6.3+y,f*.26);
      if(f<0)c.rotation.y=Math.PI;
      g.add(c)
    })
  })
});
function trafficStep(dt){
  SIG.forEach(sg=>{
    const ph=(st.clock+sg.i*3.7)%16;
    sg.st=ph<7?'g':ph<9?'y':'r';
    sg.mr.color.setHex(sg.st==='r'?0xff2020:0x2a0808);
    sg.my.color.setHex(sg.st==='y'?0xffc400:0x2a2208);
    sg.mg.color.setHex(sg.st==='g'?0x20ff60:0x082a10)
  });
  TR.forEach(v=>{
    if(dt>0){
      const l=v.lead;
      let tg=v.base;
      if(l&&l!==v){
        const gap=(v.dir>0?mod(l.s-v.s):mod(v.s-l.s))-l.hl-v.hl;
        if(gap<22)tg=Math.min(tg,Math.max(0,(gap-3)*1.2))
      }
      if(st.park){
        const dd=Math.abs(v.d-st.d);
        if(dd<2.6){
          const gp=(v.dir>0?mod(st.s-v.s):mod(v.s-st.s))-v.hl-1.2;
          if(gp>-1&&gp<30)tg=Math.min(tg,Math.max(0,(gp-4)*1.2))
        }
      }
      SIG.forEach(sg=>{
        const line=sg.s+(v.dir>0?-5:5),fd=(v.dir>0?mod(line-v.s):mod(v.s-line))-v.hl;
        if(sg.st!=='g'&&fd>-1.5&&fd<40&&(sg.st==='r'||fd>9))tg=Math.min(tg,Math.max(0,(fd-1)*1.2))
      });
      v.spd+=Math.max(-28*dt,Math.min(9*dt,tg-v.spd));
      v.s=mod(v.s+v.dir*v.spd*dt)
    }
    const near=cd(v.s,st.s)<230;
    v.g.visible=near;
    if(near){
      const p=P(v.s);
      v.g.position.set(p.x+p.nx*v.d,0,p.z+p.nz*v.d);
      v.g.rotation.y=-p.th+(v.dir>0?0:Math.PI)
    }
  })
}
