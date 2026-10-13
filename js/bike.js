/* Player bike model with steering assembly, rider and parking lights */
// bike
const bike=new THREE.Group(),lean=new THREE.Group();
bike.add(lean);
const M=(c,m,r,e)=>new THREE.MeshStandardMaterial({
  color:c,metalness:m,roughness:r,emissive:e||0
}),red=M(0xb3211e,.7,.3),wht=M(0xe9e9e9,.6,.3),blk=M(0x151515,.5,.5),sil=M(0xbfc4cc,.9,.25),rub=M(0x0b0b0b,0,.95),jk=M(0x0a8fb0,.2,.6,0x02303a),hm=M(0xff2bd6,.5,.2,0x44003a);
function seg(a,b,r,m){
  const A=V(...a),B=V(...b),d=B.clone().sub(A),me=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),8),m);
  me.userData.L=d.length();
  me.position.copy(A).add(B).multiplyScalar(.5);
  me.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());
  lean.add(me);
  return me
}

function box(w,h,d,m,x,y,z,rx){
  const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
  b.position.set(x,y,z);
  if(rx)b.rotation.x=rx;
  lean.add(b);
  return b
}

function wheel(z){
  const g=new THREE.Group();
  g.position.set(0,.43,z);
  const t=new THREE.Mesh(new THREE.TorusGeometry(.33,.1,12,28),rub);
  t.rotation.y=Math.PI/2;
  g.add(t);
  const r=new THREE.Mesh(new THREE.CylinderGeometry(.27,.27,.07,20),sil);
  r.rotation.z=Math.PI/2;
  g.add(r);
  for(let k=0;k<4;k++){
    const b=new THREE.Mesh(new THREE.BoxGeometry(.03,.56,.03),sil);
    b.rotation.x=k*Math.PI/4;
    g.add(b)
  }
  lean.add(g);
  return g
}

const w1=wheel(-.95),w2=wheel(.95),FRP=[w1],ARM=[];
[-1,1].forEach(k=>{
  FRP.push(seg([k*.1,.43,-.95],[k*.08,1.38,-.72],.032,sil));
  seg([k*.09,.62,.3],[k*.1,.43,.95],.03,blk);
  seg([k*.2,1.3,-.35],[k*.15,.5,.1],.025,blk)
});
FRP.push(seg([-.4,1.5,-.62],[.4,1.5,-.62],.022,blk));
[-.4,.4].forEach(x=>FRP.push(seg([x*.95,1.5,-.62],[x*1.08,1.5,-.62],.04,rub)));
box(.32,.4,.55,M(0x2a2a2e,.8,.4),0,.65,.05);
box(.24,.1,.5,sil,0,.9,.05);
const tk=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),red);
tk.scale.set(.27,.21,.42);
tk.position.set(0,1.28,-.22);
lean.add(tk);
const tk2=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),wht);
tk2.scale.set(.28,.1,.3);
tk2.position.set(0,1.42,-.22);
lean.add(tk2);
box(.3,.1,.8,blk,0,1.13,.5);
box(.22,.04,.55,red,0,1.0,1.1,-.15);
FRP.push(box(.14,.04,.55,red,0,.95,-.95));
seg([.17,.45,-.1],[.2,.52,.7],.05,sil);
seg([.2,.52,.6],[.2,.56,1.25],.08,sil);
const hh=new THREE.Mesh(new THREE.SphereGeometry(.17,12,10),blk);
hh.position.set(0,1.28,-.9);
lean.add(hh);
FRP.push(hh);
const lens=new THREE.Mesh(new THREE.SphereGeometry(.12,12,10),new THREE.MeshBasicMaterial({
  color:0xffffff
}));
lens.scale.z=.5;
lens.position.set(0,1.28,-1.04);
lean.add(lens);
FRP.push(lens);
{
  const ws=box(.4,.28,.03,M(0x88ccff,.1,.1),0,1.62,-.78,-.4);
  ws.material.transparent=true;
  FRP.push(ws)
}

const tlm=new THREE.MeshBasicMaterial({
  color:0x990000
});
box(.3,.08,.05,tlm,0,.98,1.38);

// rider
seg([0,1.3,.5],[0,1.92,-.02],.18,jk);
const hd=new THREE.Mesh(new THREE.SphereGeometry(.2,16,12),hm);
hd.position.set(0,2.16,-.14);
lean.add(hd);
box(.3,.1,.12,M(0x050510,.9,.1),0,2.14,-.31);
[-1,1].forEach(k=>{
  ARM.push([k,seg([k*.2,1.85,-.02],[k*.38,1.5,-.62],.06,jk)]);
  seg([k*.15,1.25,.5],[k*.24,.78,.05],.09,M(0x1d2540,0,.8));
  seg([k*.24,.78,.05],[k*.24,.42,.3],.07,M(0x1d2540,0,.8));
  box(.1,.08,.26,blk,k*.24,.38,.38)
});
const fr=new THREE.Group();
fr.position.set(0,1.38,-.72);
lean.add(fr);
FRP.forEach(m=>fr.attach(m));
const _a=new THREE.Vector3(),_b=new THREE.Vector3(),_u=new THREE.Vector3(0,1,0);
function setSeg(m,A,B){
  _a.set(A[0],A[1],A[2]);
  _b.set(B[0],B[1],B[2]);
  const d=_b.clone().sub(_a),L=d.length();
  m.position.copy(_a).add(_b).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(_u,d.normalize());
  m.scale.y=L/m.userData.L
}

const AM=new THREE.MeshBasicMaterial({
  color:0xffa000
}),hz=[];
[[-1,fr,.42,.12,.1],[1,fr,.42,.12,.1],[-1,lean,.34,1.0,1.36],[1,lean,.34,1.0,1.36]].forEach(([k,par,x,y,z])=>{
  const m=new THREE.Mesh(new THREE.SphereGeometry(.08,8,8),AM);
  m.position.set(k*x,y,z);
  m.visible=false;
  par.add(m);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({
    map:glowT,color:0xffa000,blending:THREE.AdditiveBlending,depthWrite:false
  }));
  sp.scale.set(1.2,1.2,1);
  m.add(sp);
  hz.push(m)
});
const sh=new THREE.Mesh(new THREE.PlaneGeometry(2.4,3.6),new THREE.MeshBasicMaterial({
  map:radial('rgba(0,0,0,.7)'),transparent:true,depthWrite:false
}));
sh.rotation.x=-Math.PI/2;
sh.position.y=.04;
bike.add(sh);
const glow=new THREE.PointLight(0x00e5ff,1.5,9);
glow.position.set(0,.3,0);
bike.add(glow);
const beam=new THREE.SpotLight(0xffffff,3.5,110,.5,.6);
beam.position.set(0,1.3,-1);
beam.target.position.set(0,0,-30);
bike.add(beam,beam.target);
S.add(bike);
