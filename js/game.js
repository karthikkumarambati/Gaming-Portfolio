/* Game: state, input, UI, route map, main loop */
// state & input
const st={
  tg:-1,park:0,hb:false,on:0,clock:0,gear:1,thr:0,crash:0,up:0,s:3,d:-3.5,v:0,xp:0,lvl:1,paused:true,near:null,seen:0,roll:0
};
const K={};
addEventListener('keydown',e=>{
  K[e.code]=1;
  if(e.code==='KeyE')interact();
  if(e.code==='Escape')closeM();
  if(e.code==='Space'){
    e.preventDefault();
    hornOn()
  }
  if(e.code==='KeyR')restartGame();
  if(e.code==='KeyP')togglePause();
  if(e.code==='KeyG')setGear(-st.gear);
  if(e.code==='KeyI')toggleEngine();
  if(e.code==='KeyH')setPark(!st.park)
});
addEventListener('keyup',e=>{
  K[e.code]=0;
  if(e.code==='Space')hornOff()
});
hold('mL','KeyA');
hold('mR','KeyD');
hold('gasB','pedA');
hold('brkB','pedB');
function toast(t){
  const e=$('toast');
  e.textContent=t;
  e.style.opacity=1;
  clearTimeout(toast.t);
  toast.t=setTimeout(()=>e.style.opacity=0,2200)
}

function addXP(n){
  st.xp+=n;
  while(st.xp>=st.lvl*100){
    st.xp-=st.lvl*100;
    st.lvl++;
    toast('LEVEL UP! LVL '+st.lvl)
  }
  $('lvl').textContent='LVL '+st.lvl;
  $('xpt').textContent=st.xp+' / '+st.lvl*100+' XP';
  $('xpb').style.width=st.xp/(st.lvl*100)*100+'%'
}

function interact(){
  if(st.paused||st.up||st.crash||!st.near)return;
  const s=st.near;
  st.paused=true;
  st.v=0;
  $('mk').textContent='SHOP '+(STOPS.indexOf(s)+1)+' / 5 · '+s.shop;
  $('mt').textContent=s.hd;
  $('mb').innerHTML=s.h;
  fx(s);
  $('modal').classList.remove('hid');
  if(!s.seen){
    s.seen=true;
    s.li.classList.add('d');
    st.seen++;
    addXP(80);
    if(st.seen===5)toast('🏁 ALL SHOPS VISITED!')
  }
}

function fx(s){
  const pn=document.querySelector('.panel');
  pn.style.setProperty('--acc','#'+s.col.toString(16).padStart(6,'0'));
  pn.style.setProperty('--hb','url('+IMGS[HDI[STOPS.indexOf(s)]]+')');
  pn.scrollTop=0;
  pn.classList.remove('in');
  void pn.offsetWidth;
  pn.classList.add('in');
  pn.querySelectorAll('.rv').forEach((e,i)=>e.style.setProperty('--i',i));
  pn.querySelectorAll('.cnt').forEach(e=>{
    const n=+e.dataset.n,t0=performance.now();
    (function f(){
      const k=Math.min(1,(performance.now()-t0-500)/1200);
      e.textContent=Math.round(n*Math.max(0,k))+(n>9?'+':'');
      if(k<1)requestAnimationFrame(f)
    })()
  })
}

function restartGame(){
  st.gear=1;
  st.s=3;
  st.d=-3.5;
  clearStart();
  st.v=0;
  st.xp=0;
  st.lvl=1;
  st.seen=0;
  st.crash=0;
  st.up=0;
  STOPS.forEach(s=>{
    s.seen=false;
    s.li.classList.remove('d')
  });
  orbs.forEach(o=>o.visible=true);
  addXP(0);
  $('crash').classList.add('hid');
  $('pov').classList.add('hid');
  $('pauseB').textContent='⏸';
  if(ac)ac.resume();
  gearUI();
  toast('Game restarted')
}

function togglePause(){
  if(!$('start').classList.contains('hid')||!$('modal').classList.contains('hid')||st.crash)return;
  st.up=st.up?0:1;
  $('pauseB').textContent=st.up?'▶':'⏸';
  $('pov').classList.toggle('hid',!st.up);
  if(ac)st.up?ac.suspend():ac.resume()
}

function crashNow(m){
  $('crash').querySelector('small').textContent=m||'You hit a building · restarting the game…';
  burst(.7,180,.9);
  burst(.4,1600,.5);
  st.crash=1.4;
  st.v=0;
  $('crash').classList.remove('hid')
}

function setTarget(i,f){
  st.tg=(f||st.tg!==i)?i:-1;
  STOPS.forEach((s,k)=>s.li.classList.toggle('tg',k===st.tg));
  if(st.tg>=0)toast('Navigating to '+STOPS[st.tg].hd)
}

function travelTo(i){
  if(st.paused||st.up||st.crash){
    toast('Close the open panel first');
    return
  }
  const s=STOPS[i];
  st.s=s.s-45;
  st.d=-3.5;
  st.v=0;
  clearStart(st.s);
  setTarget(i,true);
  const sl=$('slist');
  sl.hidden=true;
  $('mlist').textContent='STOPS ▾';
  toast('Fast travel → '+s.hd)
}

function closeM(){
  if($('modal').classList.contains('hid'))return;
  $('modal').classList.add('hid');
  st.paused=false
}

$('mc').onclick=closeM;
$('pauseB').onclick=togglePause;
$('restartB').onclick=restartGame;
$('resB').onclick=togglePause;
$('rsB').onclick=restartGame;
{
  const hb=$('hornB');
  hb.addEventListener('pointerdown',e=>{
    hornOn();
    try{
      hb.setPointerCapture(e.pointerId)
    }catch(_){}
    e.preventDefault()
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>hb.addEventListener(ev,hornOff));
  hb.oncontextmenu=e=>e.preventDefault()
}

$('engB').onclick=toggleEngine;
$('parkB').onclick=()=>setPark(!st.park);
$('gF').onclick=()=>setGear(1);
$('gR').onclick=()=>setGear(-1);
$('sndB').onclick=()=>{
  muted=!muted;
  $('sndB').textContent=muted?'🔇':'🔊';
  if(eng)eng.master.gain.value=muted?0:.9
};
$('prompt').onclick=interact;
$('pf').style.backgroundImage='url('+IMGS[0]+')';
$('go').onclick=()=>{
  $('start').classList.add('hid');
  st.paused=false;
  audio();
  toast('Tap START ENGINE to begin riding')
};
function setPark(v,q){
  st.park=v?1:0;
  $('parkB').classList.toggle('on',!!v);
  if(!q)toast(v?'Parking lights ON — traffic will keep clear of your bike':'Parking lights OFF')
}

function toggleEngine(){
  if(st.paused||st.up||st.crash)return;
  st.on=st.on?0:1;
  document.body.classList.toggle('off',!st.on);
  $('engB').classList.toggle('on',!!st.on);
  $('engT').textContent=st.on?'STOP ENGINE':'START ENGINE';
  if(st.on){
    if(eng)eng.rpm=250;
    crank();
    setPark(0,true);
    toast('Engine started — controls ready')
  }else{
    st.thr=0;
    setPark(1,true);
    toast('Engine stopped · parking lights ON')
  }
}

function setGear(g){
  if(st.gear===g)return;
  if(Math.abs(st.v)>2.5){
    toast('Stop first to change gear');
    return
  }
  st.gear=g;
  gearUI();
  blip(300,.08,.06);
  toast(g>0?'Gear: FORWARD (D)':'Gear: REVERSE (R) ♪ reverse music on')
}

function gearUI(){
  $('gF').classList.toggle('on',st.gear>0);
  $('gR').classList.toggle('on',st.gear<0)
}

function hold(id,key){
  const b=$(id);
  const on=e=>{
    K[key]=1;
    b.classList.add('on');
    try{
      b.setPointerCapture(e.pointerId)
    }catch(_){}
    e.preventDefault()
  },off=()=>{
    K[key]=0;
    b.classList.remove('on')
  };
  b.addEventListener('pointerdown',on);
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,off));
  b.oncontextmenu=e=>e.preventDefault()
}

// route map (closed circuit)
const mc=$('mapc'),mx=mc.getContext('2d');
let bx0=1e9,bx1=-1e9,bz0=1e9,bz1=-1e9;
pts.forEach(p=>{
  bx0=Math.min(bx0,p.x);
  bx1=Math.max(bx1,p.x);
  bz0=Math.min(bz0,p.z);
  bz1=Math.max(bz1,p.z)
});
const MW=mc.width,sc=(MW-50)/Math.max(bx1-bx0,bz1-bz0),MP=p=>[25+(p.x-bx0)*sc,25+(p.z-bz0)*sc];
function trace(){
  mx.beginPath();
  pts.forEach((p,i)=>{
    const[a,b]=MP(p);
    i?mx.lineTo(a,b):mx.moveTo(a,b)
  });
  mx.closePath()
}

function drawMap(pp){
  mx.clearRect(0,0,MW,MW);
  mx.lineCap=mx.lineJoin='round';
  trace();
  mx.strokeStyle='#0a0f2a';
  mx.lineWidth=14;
  mx.stroke();
  trace();
  mx.strokeStyle='#ffffff55';
  mx.lineWidth=10;
  mx.stroke();
  trace();
  mx.strokeStyle='#2a2f55';
  mx.lineWidth=7;
  mx.stroke();
  trace();
  mx.strokeStyle='#00e5ff';
  mx.lineWidth=1.5;
  mx.setLineDash([5,6]);
  mx.stroke();
  mx.setLineDash([]);
  {
    const q=P(0),[a,b]=MP(q);
    mx.save();
    mx.translate(a,b);
    mx.rotate(q.th);
    for(let i=0;i<4;i++){
      mx.fillStyle=i%2?'#fff':'#000';
      mx.fillRect(-8+i*4,-2,4,2);
      mx.fillStyle=i%2?'#000':'#fff';
      mx.fillRect(-8+i*4,0,4,2)
    }
    mx.restore();
    mx.fillStyle='#fff';
    mx.font='bold 9px Arial';
    mx.textAlign='left';
    mx.fillText('START',a+10,b+4)
  }
  SIG.forEach(sg=>{
    const[a,b]=MP(P(sg.s));
    mx.fillStyle=sg.st==='r'?'#ff3b3b':sg.st==='y'?'#ffd400':'#7dff6b';
    mx.fillRect(a-3,b-3,6,6);
    mx.strokeStyle='#000';
    mx.lineWidth=1;
    mx.strokeRect(a-3,b-3,6,6)
  });
  STOPS.forEach((s,i)=>{
    const[a,b]=MP(P(s.s)),c='#'+s.col.toString(16).padStart(6,'0');
    mx.beginPath();
    mx.arc(a,b,10,0,6.3);
    mx.fillStyle=s.seen?c:'#050816';
    mx.fill();
    mx.strokeStyle=c;
    mx.lineWidth=2;
    mx.stroke();
    if(i===st.tg){
      mx.beginPath();
      mx.arc(a,b,16,0,6.3);
      mx.strokeStyle='#fff';
      mx.lineWidth=2.5;
      mx.stroke()
    }
    mx.fillStyle=s.seen?'#000':c;
    mx.font='bold 12px Arial';
    mx.textAlign='center';
    mx.textBaseline='middle';
    mx.fillText(i+1,a,b+1)
  });
  const[a,b]=MP(pp);
  mx.save();
  mx.translate(a,b);
  mx.rotate(pp.th);
  mx.beginPath();
  mx.moveTo(0,-9);
  mx.lineTo(6,7);
  mx.lineTo(-6,7);
  mx.closePath();
  mx.fillStyle='#fff';
  mx.shadowColor='#00e5ff';
  mx.shadowBlur=10;
  mx.fill();
  mx.restore()
}

// loop
const clk=new THREE.Clock();
function frame(){
  requestAnimationFrame(frame);
  const dt=Math.min(clk.getDelta(),.05),t=clk.elapsedTime,braking=K.KeyS||K.ArrowDown||K.pedB;
  const pa=P(st.s),pb=P(st.s+6),curv=(pa.nx*pb.nz-pa.nz*pb.nx)/6;
  let sd=0;
  st.thr=0;
  if(!st.paused&&!st.up&&!st.crash){
    st.clock+=dt;
    trafficStep(dt);
    const bo=1;
    const thr=!!(K.KeyW||K.ArrowUp||K.pedA)&&!!st.on;
    st.thr=thr?1:0;
    if(!st.on&&(K.KeyW||K.ArrowUp)&&t-(st.ht||-9)>3){
      st.ht=t;
      toast('Engine is OFF — press START ENGINE (I)')
    }
    if(thr)st.v+=st.gear>0?(32*(1-Math.pow(Math.max(0,st.v)/104,1.6))+2)*dt:-9*dt;
    else st.v-=Math.sign(st.v)*(st.on?8:12)*dt;
    if(braking){
      const bk=55*dt;
      st.v=Math.abs(st.v)<=bk?0:st.v-Math.sign(st.v)*bk
    }
    if(!thr&&!braking&&Math.abs(st.v)<.3)st.v=0;
    st.v=Math.max(-22,Math.min(100,st.v));
    sd=((K.KeyD||K.ArrowRight)?1:0)-((K.KeyA||K.ArrowLeft)?1:0);
    st.d+=sd*Math.min(1,.3+Math.abs(st.v)/25)*12*dt-curv*st.v*st.v*.012*dt;
    {
      const ad=Math.abs(st.d);
      if(ad>7.4)st.v*=1-1.4*dt;
      if(ad>21)st.d=Math.sign(st.d)*21;
      if(BL.some(b=>b.sd===Math.sign(st.d)&&cd(b.s,st.s)<8&&ad>b.e))crashNow();
      if(!(st.park&&Math.abs(st.v)<14)&&TR.some(v=>cd(v.s,st.s)<v.hl+.9&&Math.abs(v.d-st.d)<v.hw+.45))crashNow('You hit a vehicle · restarting the game…')
    }
    const o=st.s;
    st.s+=st.v*dt;
    if(st.s<0){
      st.s=0;
      st.v=0
    }
    if(st.v>0)SIG.forEach(sg=>{
      const d0=mod(sg.s-5-o);
      if(d0>0&&d0<=st.s-o&&sg.st==='r'&&st.clock-(sg.vt===undefined?-9:sg.vt)>3){
        sg.vt=st.clock;
        st.xp=Math.max(0,st.xp-15);
        addXP(0);
        toast('🚦 Red light jumped! −15 XP');
        blip(220,.25,.08)
      }
    });
    if(Math.floor(o/LEN)<Math.floor(st.s/LEN))toast('LAP '+(Math.floor(st.s/LEN)+1)+' — circuit complete!');
    orbs.forEach(q=>{
      if(q.visible&&cd(q.userData.s,st.s)<3&&Math.abs(q.userData.d-st.d)<1.8){
        q.visible=false;
        addXP(10);
        blip(1200,.1,.05,'sine');
        toast('+10 XP')
      }
    })
  }
  if(st.crash>0){
    st.crash-=dt;
    st.v=0;
    if(st.crash<=0)restartGame()
  }
  const lt=-sd*.35-Math.max(-.55,Math.min(.55,curv*st.v*st.v*.004));
  st.roll+=(lt-st.roll)*5*dt;
  lean.rotation.z=st.crash>0?1.3:st.roll;
  const hb=!!st.park&&(Math.floor(t*2.6)%2===0);
  if(hb!==st.hb){
    st.hb=hb;
    hz.forEach(m=>m.visible=hb);
    if(hb)blip(1400,.02,.02)
  }
  {
    const sT=-(sd*.42+Math.max(-.3,Math.min(.3,curv*28)));
    fr.rotation.y+=(sT-fr.rotation.y)*Math.min(1,dt*9);
    const ca=Math.cos(fr.rotation.y),sa=Math.sin(fr.rotation.y);
    ARM.forEach(([k,m])=>{
      const x=k*.38,z=.1;
      setSeg(m,[k*.2,1.85,-.02],[x*ca+z*sa,1.5,-.72+(-x*sa+z*ca)])
    })
  }
  orbs.forEach(q=>{
    q.rotation.y=t*2;
    q.position.y=1.2+Math.sin(t*3+q.userData.s)*.2
  });
  STOPS.forEach(s=>s.bc.material.opacity=s.seen?.1:(s===STOPS[st.tg]?.45:.22)+Math.sin(t*3+s.s)*.08);
  tlm.color.setHex(st.gear<0?0xffffff:braking?0xff2020:0x990000);
  const p=P(st.s);
  bike.position.set(p.x+p.nx*st.d,0,p.z+p.nz*st.d);
  bike.rotation.y=-p.th+fr.rotation.y*.3;
  w1.rotation.x=w2.rotation.x-=st.v*dt*2.4;
  st.near=STOPS.find(s=>cd(s.s,st.s)<14)||null;
  const pr=$('prompt');
  pr.style.display=st.near&&!st.paused&&!st.up&&!st.crash?'block':'none';
  if(st.near)pr.textContent=(TOUCH?'Tap here · Enter ':'Press E · Enter ')+st.near.shop;
  const nx=(st.tg>=0&&!STOPS[st.tg].seen)?STOPS[st.tg]:STOPS.find(s=>!s.seen),lap='LAP '+(Math.floor(st.s/LEN)+1)+' · ';
  $('obj').innerHTML=nx?lap+'NEXT: <b>'+nx.shop+'</b> · '+Math.round(mod(nx.s-st.s))+' m':lap+'All shops visited — keep racing! (R restarts)';
  if(!$('slist').hidden&&((st.fc=(st.fc||0)+1)%12===0))STOPS.forEach(s=>{
    s.li.querySelector('.ds').textContent=Math.round(mod(s.s-st.s))+' m'
  });
  const cp=P(st.s-9),lp=P(st.s+18);
  cam.position.set(cp.x+cp.nx*st.d*.8,3.4+st.v*.004,cp.z+cp.nz*st.d*.8);
  cam.lookAt(lp.x+lp.nx*st.d*.9,1.6,lp.z+lp.nz*st.d*.9);
  cam.rotateZ(st.roll*.25);
  if(st.crash>0){
    cam.position.x+=(Math.random()-.5)*.8;
    cam.position.y+=(Math.random()-.5)*.6
  }
  cam.fov=65+Math.max(0,st.v)*.26;
  cam.updateProjectionMatrix();
  moon.position.set(cam.position.x-150,130,cam.position.z-380);
  stars.position.copy(cam.position);
  $('sp').textContent=Math.round(Math.abs(st.v)*2.2);
  engine(dt);
  if(!st.up){
    PD.forEach(o=>{
      const q=o.g;
      if(cd(o.s,st.s)>150){
        q.visible=false;
        return
      }
      q.visible=true;
      o.s+=o.dir*o.sp*dt;
      o.ph+=o.sp*dt*4.5;
      const pp=P(o.s);
      q.position.set(pp.x+pp.nx*o.off,.15+Math.abs(Math.sin(o.ph))*.03,pp.z+pp.nz*o.off);
      q.rotation.y=-pp.th+(o.dir>0?0:Math.PI);
      const u=q.userData,sw=Math.sin(o.ph)*.6;
      u.l[0].rotation.x=sw;
      u.l[1].rotation.x=-sw;
      u.a[0].rotation.x=-sw*.8;
      u.a[1].rotation.x=sw*.8
    });
    HOST.forEach((q,i)=>{
      q.userData.a[1].rotation.z=2.6+Math.sin(t*6+i)*.35
    })
  }
  drawMap({
    x:bike.position.x,z:bike.position.z,th:p.th
  });
  R.render(S,cam)
}

addEventListener('resize',()=>{
  R.setSize(innerWidth,innerHeight);
  cam.aspect=innerWidth/innerHeight;
  cam.updateProjectionMatrix()
});
{
  const rm=$('rmap');
  let dr=null;
  function place(x,y){
    x=Math.max(0,Math.min(innerWidth-rm.offsetWidth,x));
    y=Math.max(0,Math.min(innerHeight-rm.offsetHeight,y));
    rm.style.left=x+'px';
    rm.style.top=y+'px';
    rm.style.right='auto'
  }
  try{
    const v=JSON.parse(localStorage.getItem('rmpos')||'null');
    if(v)place(v[0],v[1])
  }catch(e){}
  rm.addEventListener('pointerdown',e=>{
    if(e.target.closest('button'))return;
    const r=rm.getBoundingClientRect();
    dr={
      x:e.clientX-r.left,y:e.clientY-r.top
    };
    rm.setPointerCapture(e.pointerId);
    rm.classList.add('drag');
    e.preventDefault()
  });
  rm.addEventListener('pointermove',e=>{
    if(dr)place(e.clientX-dr.x,e.clientY-dr.y)
  });
  const end=()=>{
    if(!dr)return;
    dr=null;
    rm.classList.remove('drag');
    try{
      const r=rm.getBoundingClientRect();
      localStorage.setItem('rmpos',JSON.stringify([r.left,r.top]))
    }catch(e){}
  };
  rm.addEventListener('pointerup',end);
  rm.addEventListener('pointercancel',end);
  rm.addEventListener('dblclick',()=>{
    rm.style.left=rm.style.top=rm.style.right='';
    try{
      localStorage.removeItem('rmpos')
    }catch(e){}
  });
  $('mmin').onclick=()=>rm.classList.toggle('min');
  $('mlist').onclick=()=>{
    const sl=$('slist'),open=sl.hidden;
    sl.hidden=!open;
    $('mlist').textContent='STOPS '+(open?'▴':'▾');
    $('mlist').setAttribute('aria-expanded',open);
    if(open)STOPS.forEach(s=>{
      s.li.querySelector('.ds').textContent=Math.round(mod(s.s-st.s))+' m'
    });
    requestAnimationFrame(()=>{
      if(rm.style.left)place(parseFloat(rm.style.left),parseFloat(rm.style.top))
    })
  };
  $('mx').onclick=closeM;
  addEventListener('resize',()=>{
    if(rm.style.left)place(parseFloat(rm.style.left),parseFloat(rm.style.top))
  })
}

trafficStep(0);
frame();
