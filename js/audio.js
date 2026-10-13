/* Sound: synthesized single-cylinder engine, horn, starter, reverse music */
let ac,eng=null,muted=false;
function audio(){
  try{
    ac=new (window.AudioContext||window.webkitAudioContext)();
    const sr=ac.sampleRate;
    const L=Math.floor(sr*.1),b=ac.createBuffer(1,L,sr),d=b.getChannelData(0);
    let ph=0,lp=0,pk=0;
    for(let i=0;i<L;i++){
      const t=i/sr,f=48+50*Math.exp(-t*45);
      ph+=2*Math.PI*f/sr;
      lp+=(Math.random()*2-1-lp)*.15;
      const x=Math.sin(ph)*Math.exp(-t*34)+.55*Math.sin(ph*2+.6)*Math.exp(-t*50)+.3*Math.sin(ph*3.01+1.2)*Math.exp(-t*70)+(Math.random()*2-1)*Math.exp(-t*420)*.6+lp*Math.exp(-t*90)*.9;
      d[i]=x;
      pk=Math.max(pk,Math.abs(x))
    }
    const fade=Math.floor(sr*.006);
    for(let i=0;i<L;i++){
      d[i]/=pk;
      if(i>L-fade)d[i]*=(L-i)/fade
    }
    const src=ac.createBufferSource();
    src.buffer=b;
    src.loop=true;
    const sh=ac.createWaveShaper(),cv=new Float32Array(256);
    for(let i=0;i<256;i++)cv[i]=Math.tanh((i/128-1)*2.2);
    sh.curve=cv;
    const lpf=ac.createBiquadFilter();
    lpf.type='lowpass';
    lpf.Q.value=.9;
    lpf.frequency.value=900;
    const hpf=ac.createBiquadFilter();
    hpf.type='highpass';
    hpf.frequency.value=35;
    const g=ac.createGain();
    g.gain.value=.5;
    const nb=ac.createBuffer(1,sr*2,sr),nd=nb.getChannelData(0);
    for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
    const ns=ac.createBufferSource();
    ns.buffer=nb;
    ns.loop=true;
    const nf=ac.createBiquadFilter();
    nf.type='bandpass';
    nf.Q.value=.8;
    nf.frequency.value=900;
    const ng=ac.createGain();
    ng.gain.value=0;
    const ws=ac.createBufferSource();
    ws.buffer=nb;
    ws.loop=true;
    const wf=ac.createBiquadFilter();
    wf.type='highpass';
    wf.frequency.value=1200;
    const wg=ac.createGain();
    wg.gain.value=0;
    const comp=ac.createDynamicsCompressor(),master=ac.createGain();
    master.gain.value=muted?0:.9;
    src.connect(sh);
    sh.connect(hpf);
    hpf.connect(lpf);
    lpf.connect(g);
    g.connect(comp);
    ns.connect(nf);
    nf.connect(ng);
    ng.connect(comp);
    ws.connect(wf);
    wf.connect(wg);
    wg.connect(comp);
    comp.connect(master);
    master.connect(ac.destination);
    src.start();
    ns.start();
    ws.start();
    eng={
      src,lpf,g,ng,wg,nb,master,rpm:1400,gear:1,cut:0,beep:0
    };
  }catch(e){}
}

function blip(f,d,v,type){
  if(!ac||muted)return;
  try{
    const o=ac.createOscillator(),g=ac.createGain(),T=ac.currentTime;
    o.type=type||'square';
    o.frequency.value=f;
    g.gain.setValueAtTime(v||.05,T);
    g.gain.exponentialRampToValueAtTime(.0001,T+d);
    o.connect(g);
    g.connect(ac.destination);
    o.start();
    o.stop(T+d)
  }catch(e){}
}

function burst(dur,fc,vol){
  if(!ac||!eng||muted)return;
  try{
    const s=ac.createBufferSource();
    s.buffer=eng.nb;
    const f=ac.createBiquadFilter();
    f.type='bandpass';
    f.frequency.value=fc;
    f.Q.value=1;
    const g=ac.createGain(),T=ac.currentTime;
    g.gain.setValueAtTime(vol,T);
    g.gain.exponentialRampToValueAtTime(.0001,T+dur);
    s.connect(f);
    f.connect(g);
    g.connect(ac.destination);
    s.start(0,Math.random());
    s.stop(T+dur)
  }catch(e){}
}

function engine(dt){
  if(!eng)return;
  const e=eng;
  if(!st.on){
    const T0=ac.currentTime;
    e.g.gain.setTargetAtTime(0,T0,.08);
    e.ng.gain.setTargetAtTime(0,T0,.05);
    e.rpm=300;
    return
  }
  const v=Math.abs(st.v),thr=st.thr,B=[0,20,40,62,84,110];
  let gi=1;
  for(let i=1;i<5;i++)if(v>=B[i])gi=i+1;
  const lo=B[gi-1],hi=B[gi],fr=Math.max(0,Math.min(1,(v-lo)/(hi-lo)));
  let tg=1400+fr*3600+thr*500;
  if(v<2&&thr)tg=4300;
  if(gi===1&&v>=2&&thr)tg=Math.max(tg,2800);
  if(gi!==e.gear){
    e.cut=gi>e.gear?.14:.05;
    if(gi<e.gear)e.rpm+=900;
    e.gear=gi
  }
  e.cut=Math.max(0,e.cut-dt);
  e.rpm+=(tg-e.rpm)*Math.min(1,dt*(thr?9:4.5));
  let rpm=Math.max(1200,Math.min(6600,e.rpm));
  if(rpm>6200&&thr)rpm-=Math.random()*250;
  const T=ac.currentTime;
  e.src.playbackRate.setTargetAtTime(rpm/1200,T,.03);
  e.lpf.frequency.setTargetAtTime(500+(rpm-1200)/5400*3600+thr*700,T,.05);
  e.g.gain.setTargetAtTime((.5+.3*thr)*(e.cut>0?.15:1),T,.02);
  e.ng.gain.setTargetAtTime(.02+thr*(rpm/6600)*.3,T,.05);
  if(!thr&&rpm>3500&&v>15&&Math.random()<dt*2.5)burst(.07,500+Math.random()*500,.35);
  if(st.gear<0&&v>.5){
    e.mt=(e.mt||0)-dt;
    if(e.mt<=0){
      e.mi=(e.mi||0)+1;
      const f=RM[e.mi%RM.length];
      blip(f,.2,.06,'triangle');
      if(e.mi%4===0)blip(f/2,.45,.05,'sine');
      e.mt=.23
    }
  }else{
    e.mi=0;
    e.mt=0
  }
}

let horn=null;
function hornOn(){
  if(!ac||muted||horn||ac.state!=='running')return;
  try{
    const T=ac.currentTime,g=ac.createGain(),f=ac.createBiquadFilter(),o1=ac.createOscillator(),o2=ac.createOscillator(),lf=ac.createOscillator(),lg=ac.createGain();
    g.gain.setValueAtTime(0,T);
    g.gain.linearRampToValueAtTime(.16,T+.03);
    f.type='bandpass';
    f.frequency.value=950;
    f.Q.value=.55;
    o1.type=o2.type='sawtooth';
    o1.frequency.value=405;
    o2.frequency.value=506;
    lf.frequency.value=22;
    lg.gain.value=5;
    lf.connect(lg);
    lg.connect(o1.frequency);
    lg.connect(o2.frequency);
    o1.connect(f);
    o2.connect(f);
    f.connect(g);
    g.connect(ac.destination);
    o1.start();
    o2.start();
    lf.start();
    horn={
      o1,o2,lf,g
    };
    $('hornB').classList.add('on')
  }catch(e){}
}

function hornOff(){
  if(!horn)return;
  const T=ac.currentTime,h=horn;
  horn=null;
  try{
    h.g.gain.cancelScheduledValues(T);
    h.g.gain.setValueAtTime(h.g.gain.value,T);
    h.g.gain.linearRampToValueAtTime(0,T+.07);
    h.o1.stop(T+.1);
    h.o2.stop(T+.1);
    h.lf.stop(T+.1)
  }catch(e){}
  $('hornB').classList.remove('on')
}

const RM=[523.25,659.25,783.99,659.25,587.33,698.46,880,698.46,659.25,783.99,1046.5,783.99,1046.5,783.99,659.25,523.25];
function crank(){
  if(!ac||muted)return;
  try{
    const o=ac.createOscillator(),g=ac.createGain(),T=ac.currentTime;
    o.type='sawtooth';
    o.frequency.setValueAtTime(60,T);
    o.frequency.linearRampToValueAtTime(130,T+.6);
    g.gain.setValueAtTime(.05,T);
    g.gain.linearRampToValueAtTime(.0001,T+.65);
    o.connect(g);
    g.connect(ac.destination);
    o.start();
    o.stop(T+.7)
  }catch(e){}
}
