(() => {
"use strict";
const canvas=document.getElementById("world");let ctx=canvas.getContext("2d");
const $=id=>document.getElementById(id);


const tracks=[
 {name:"1990",files:["music/1990.mp3","1990.mp3","music/Uncle_Dags_-_1990__Official_Music_Video_.mp3","Uncle_Dags_-_1990__Official_Music_Video_.mp3"],by:"Uncle Dags"},
 {name:"MATIKAS",files:["music/matikas.mp3","matikas.mp3","music/Gat_Putch_-_MATIKAS__feat__Smugglaz__Icetizy___Uncle_Dags___Official_Audio_.mp3","Gat_Putch_-_MATIKAS__feat__Smugglaz__Icetizy___Uncle_Dags___Official_Audio_.mp3"],by:"Gat Putch ft. Uncle Dags"},
 {name:"WELCOME2DTQ",files:["music/welcome2dtq.mp3","welcome2dtq.mp3","music/Hev_Abi_WELCOME2DTQ.mp3","Hev_Abi_WELCOME2DTQ.mp3"],by:"Hev Abi"},
 {name:"PARA SA STREETS",files:["music/para-sa-streets.mp3","para-sa-streets.mp3","music/Hev_Abi_-_Para_Sa_Streets__Official_Lyric_Video___Prod__Noane_.mp3","Hev_Abi_-_Para_Sa_Streets__Official_Lyric_Video___Prod__Noane_.mp3"],by:"Hev Abi"}
];
const themes=[
 {name:"1990 DISTRICT",sky:["#1a0a14","#4a1f35","#8a4a3a"],acc:"#ffe66d",bld:["#3a1f35","#4a2a3a","#2f2a45"],road:"#2d2530",walk:"#6a4a5a"},
 {name:"MATIKAS ROAD",sky:["#071a1a","#12403a","#3a6a4a"],acc:"#a7ff77",bld:["#12302e","#1a3a38","#0f2a30"],road:"#252d2c",walk:"#4a6a60"},
 {name:"DTQ BLOCK",sky:["#06142a","#12304a","#2b4a68"],acc:"#37f5ff",bld:["#1c2a4a","#223458","#18304a"],road:"#232a3a",walk:"#506080"},
 {name:"ESKINITA",sky:["#0b0820","#2a1a3d","#6a3050"],acc:"#ff2d9b",bld:["#3a2250","#4a2a55","#2c2048"],road:"#2a2433",walk:"#5a4a6a"}
];
const th=()=>themes[Math.floor((level-1)/2)%4]; 


const imgs={hev:new Image(),dags:new Image()};
imgs.hev.src="hev.png";imgs.dags.src="dags.png";

let W=innerWidth,H=innerHeight,DPR=1;
let state="menu",score=0,combo=0,lives=3,level=1,best=0;
let player={x:0,w:48},gy=0,jy=0,jv=0,inv=0,shake=0,flash=0;
const DIFFS={easy:{lives:10,spd:.8,hz:.7,hzStart:60,step:140},normal:{lives:8,spd:1,hz:1,hzStart:30,step:120},hard:{lives:5,spd:1.3,hz:1.5,hzStart:0,step:100}};
let diff="normal";try{diff=localStorage.getItem("dagsDiff")||"normal"}catch(e){}
if(!DIFFS[diff])diff="normal";
const D=()=>DIFFS[diff];
const maxL=()=>D().lives+Prog.bonus("life");
const PU={shield:{c:"#37f5ff",e:"🛡️",t:"SHIELD"},boost:{c:"#ffe66d",e:"⚡",t:"SPEED"},magnet:{c:"#ff2d9b",e:"🧲",t:"MAGNET"},double:{c:"#a7ff77",e:"2×",t:"2× POINTS"},slow:{c:"#b388ff",e:"⏳",t:"SLOW-MO"},heart:{c:"#ff4778",e:"❤️",t:"+1 LIFE"},blast:{c:"#ff7a1a",e:"💥",t:"BLAST"}};
const PKS=Object.keys(PU);PU.coin={c:"#ffd700",e:"🪙",t:"COIN"};
let banner=0,bannerName="",shield=0,boost=0,magnet=0,dbl=0,slow=0,blastNext=false,dashT=0,dashCd=0,face=1,pet=null,petT=0,petX=0,petY=0,zaps=[],SFXV=.7,shakeOn=true,rings=[],lvlPop=0,lean=0,squash=0,revive=0,healUsed=false,frost=0;
let dags=[],hz=[],particles=[],floaters=[],buildings=[];
let keys={left:false,right:false};
let last=performance.now(),spawn=0,hspawn=0,road=0,toastTimer=null,musicOn=true;
try{best=Number(localStorage.getItem("dagsBest")||0)}catch(e){}

function resize(){
 W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);
 canvas.width=Math.floor(W*DPR);canvas.height=Math.floor(H*DPR);
 canvas.style.width=W+"px";canvas.style.height=H+"px";
 ctx.setTransform(DPR,0,0,DPR,0,0);
 gy=H*.79;player.x=Math.max(35,Math.min(W-35,player.x||W/2));
 buildings=[];
 for(let x=-20;x<W+100;x+=70+Math.random()*45)buildings.push({x,w:55+Math.random()*45,h:90+Math.random()*H*.23,c:Math.random()});
}
addEventListener("resize",resize);resize();

const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
function label(s,x,y,size,color="#fff",align="left"){ctx.font="900 "+size+"px monospace";ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(s,x,y)}
function showPanel(id){
 ["home","tutorial","custom","hub","paused","over"].forEach(n=>$(n).classList.toggle("hidden",n!==id));
 $("overlay").classList.toggle("hidden",!id);$("overlay").classList.toggle("home",id==="home");document.body.classList.toggle("menu",["home","tutorial","custom","hub"].includes(id));if(id==="home"){$("homeBest").textContent=best;Prog.homeStats()}
}
function say(m){const el=$("toast");el.textContent=m;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),1800)}
function updateHUD(){
 $("score").textContent=String(score).padStart(4,"0");
 $("combo").textContent="x"+Math.max(1,combo);
 $("lives").textContent=lives>0?"♥ x"+lives:"—";
 $("level").textContent=String(level).padStart(2,"0");
 $("place").textContent="📍 "+th().name+" • "+Math.floor(road/12)+" m";
}

const SY={ctx:null,g:null,timer:0,step:0,next:0,song:null,idx:-1};
const SONGS=[
 {bpm:90,root:57,chords:[0,-4,3,-2],scale:[0,3,5,7,10],lead:[0,2,4,2,1,3,2,-1,0,2,3,4,2,1,0,-1],k:"x..x..x...x..x..",s:"....x.......x..."},
 {bpm:104,root:55,chords:[0,5,3,7],scale:[0,2,3,5,7],lead:[0,-1,2,-1,3,-1,2,4,0,-1,2,3,4,3,2,-1],k:"x...x...x...x..x",s:"....x.......x..."},
 {bpm:112,root:52,chords:[0,0,5,7],scale:[0,3,5,7,10],lead:[4,-1,3,2,-1,0,2,-1,4,3,2,-1,3,2,0,-1],k:"x..x..x.x..x..x.",s:"....x.......x..x"},
 {bpm:84,root:50,chords:[0,-2,-4,-5],scale:[0,3,5,7,10],lead:[0,-1,-1,2,-1,-1,3,-1,4,-1,-1,3,-1,2,-1,-1],k:"x.....x...x.....",s:"........x......."}
];
const mf=n=>440*Math.pow(2,(n-69)/12);
function bass(){return musicOn&&!bgm.paused?Math.abs(Math.sin(bgm.currentTime*Math.PI*1.6))*.6:0}
function eq(){if(!musicOn||bgm.paused)return;ctx.fillStyle=th().acc;ctx.globalAlpha=.55;
 const n=32,bw=W/n,t=bgm.currentTime;
 for(let i=0;i<n;i++){const h=(.25+.75*Math.abs(Math.sin(t*3.2+i*.7)*Math.cos(t*1.7+i*.31)))*H*.06;ctx.fillRect(i*bw+1,H*.61-h,bw-2,h)}
 ctx.globalAlpha=1}
function unlock(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
 if(!window.gameAudio)window.gameAudio=new AC();SY.ctx=window.gameAudio;if(SY.ctx.state==="suspended")SY.ctx.resume()}
function tone(f,t,d,type,vol){const c=SY.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(SY.g);o.start(t);o.stop(t+d+.02)}
function noise(t,d,vol,hp){const c=SY.ctx,b=c.createBuffer(1,Math.ceil(c.sampleRate*d),c.sampleRate),a=b.getChannelData(0);
 for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;
 const n=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();n.buffer=b;f.type="highpass";f.frequency.value=hp;
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+d);n.connect(f);f.connect(g);g.connect(SY.g);n.start(t)}
function kick(t){const c=SY.ctx,o=c.createOscillator(),g=c.createGain();
 o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+.12);
 g.gain.setValueAtTime(.9,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(g);g.connect(SY.g);o.start(t);o.stop(t+.2)}
function synthTick(){
 if(!SY.g)return;
 const c=SY.ctx,sg=SY.song,spb=60/(sg.bpm+Math.min(level,12)*2)/4;
 while(SY.next<c.currentTime+.12){
  const st=SY.step,i=st%16,root=sg.root+sg.chords[Math.floor(st/16)%4],t=SY.next;
  if(sg.k[i]==="x")kick(t);
  if(sg.s[i]==="x")noise(t,.14,.35,1500);
  if(i%2===0)noise(t,.04,.12,7000);
  if(i%4===0||i%8===6)tone(mf(root-12),t,spb*3,"triangle",.5);
  const n=sg.lead[st%sg.lead.length];
  if(n>=0&&i%2===0)tone(mf(root+12+sg.scale[n%sg.scale.length]),t,spb*1.6,"square",.1);
  if(i===0)[0,3,7].forEach(o=>tone(mf(root+o),t,spb*8,"sawtooth",.05));
  SY.step++;SY.next+=spb;
 }
}
function synthStart(idx){
 if(SY.g&&SY.idx===idx)return;
 synthStop();unlock();if(!SY.ctx)return;
 const c=SY.ctx;SY.g=c.createGain();SY.g.gain.setValueAtTime(0,c.currentTime);
 SY.g.gain.linearRampToValueAtTime(musicOn?.5*VOL:0,c.currentTime+.8);SY.g.connect(c.destination);
 SY.song=SONGS[idx%SONGS.length];SY.idx=idx;SY.step=0;SY.next=c.currentTime+.1;SY.timer=setInterval(synthTick,25);
}
function synthStop(){clearInterval(SY.timer);const g=SY.g;SY.g=null;SY.idx=-1;
 if(g){try{g.gain.setTargetAtTime(0,SY.ctx.currentTime,.1)}catch(e){}setTimeout(()=>{try{g.disconnect()}catch(e){}},700)}}
const bgm=new Audio();bgm.loop=true;bgm.preload="auto";let VOL=.7;let fi=0;
function fadeTo(v,ms,cb){clearInterval(fi);const a=bgm.volume,n=Math.max(1,ms/40);let i=0;
 fi=setInterval(()=>{i++;bgm.volume=Math.max(0,Math.min(1,a+(v-a)*i/n));if(i>=n){clearInterval(fi);fi=0;if(cb)cb()}},40)}
bgm.onerror=()=>{if(retry)retry();else{bgm.pause();synthStart(curTrack<0?0:curTrack)}};
let curTrack=-1,retry=null;
function songIndex(){return Math.floor((level-1)/2)%tracks.length}
function applySettings(){const s=Prog.settings();VOL=s.mv;SFXV=s.sv;shakeOn=s.shake;musicOn=!s.mute;bgm.muted=!musicOn;
 if(!fi)bgm.volume=VOL;if(SY.g)SY.g.gain.setTargetAtTime(musicOn?.5*VOL:0,SY.ctx.currentTime,.05);$("muteBtn").textContent=musicOn?"🔊":"🔇"}
function setTrack(force){
 const idx=songIndex();
 if(idx===curTrack&&!force)return;
 curTrack=idx;synthStop();
 const list=tracks[idx].files;let n=0;
 const go=()=>{
  if(n>=list.length){retry=null;bgm.pause();synthStart(idx);return}
  const f=list[n++];
  bgm.src=(window.SONG_DATA&&window.SONG_DATA[f])||f;bgm.currentTime=0;
  const pr=bgm.play();
  if(pr&&pr.catch)pr.catch(err=>{if(err&&err.name==="NotAllowedError"){
   const r=()=>{bgm.play().catch(()=>{});removeEventListener("pointerdown",r);removeEventListener("keydown",r)};
   addEventListener("pointerdown",r);addEventListener("keydown",r)}})
 };
 retry=go;
 if(bgm.paused||!bgm.src){bgm.volume=0;go();fadeTo(VOL,700)}
 else fadeTo(0,350,()=>{go();fadeTo(VOL,600)});
}
$("muteBtn").onclick=()=>{
 musicOn=!musicOn;Prog.setSetting("mute",!musicOn);applySettings();
 $("muteBtn").textContent=musicOn?"🔊":"🔇";
};
setInterval(()=>{
 if(state!=="playing"||!musicOn||SY.g||!bgm.src||bgm.error)return;
 if(bgm.paused)bgm.play().catch(()=>{});
 else if(bgm.volume<.1&&!fi)fadeTo(VOL,300);
},1500);


function beep(freq=500,dur=.07,type="square"){
 try{
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return;if(!window.gameAudio)window.gameAudio=new AC();
  const ac=window.gameAudio;if(ac.state==="suspended")ac.resume();
  const o=ac.createOscillator(),g=ac.createGain();
  o.type=type;o.frequency.value=freq;g.gain.value=.03*SFXV/.7;
  o.connect(g);g.connect(ac.destination);o.start();
  g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+dur);o.stop(ac.currentTime+dur);
 }catch(e){}
}


function sfx(n){const m={coin:[[988,.06],[1319,.1]],level:[[523,.1],[659,.1],[784,.1],[1047,.28]],claim:[[659,.08],[880,.08],[1175,.22]]};
 (m[n]||[]).forEach(([f,d],i)=>setTimeout(()=>beep(f,d,"triangle"),i*90))}

const fxc=$("fx"),fxx=fxc.getContext("2d");let fxp=[],fxRun=false,fxLast=0;
function fxSize(){fxc.width=innerWidth;fxc.height=innerHeight}fxSize();addEventListener("resize",fxSize);
function confetti(x,y,n=80){const cols=["#ffd24a","#2bd9c4","#ff2d9b","#fff","#a7ff77","#b388ff"];
 for(let i=0;i<n;i++)fxp.push({x,y,vx:(Math.random()-.5)*620,vy:-260-Math.random()*460,w:4+Math.random()*6,c:cols[i%6],l:1.7+Math.random()*.9,a:Math.random()*6});
 if(!fxRun){fxRun=true;fxLast=performance.now();requestAnimationFrame(fxLoop)}}
function fxLoop(now){const dt=Math.min(.04,(now-fxLast)/1000);fxLast=now;fxx.clearRect(0,0,fxc.width,fxc.height);
 fxp.forEach(p=>{p.vy+=900*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.a+=dt*9;p.l-=dt;fxx.globalAlpha=Math.min(1,p.l*1.5);fxx.fillStyle=p.c;fxx.fillRect(p.x,p.y,p.w,p.w*(.4+Math.abs(Math.sin(p.a))))});
 fxx.globalAlpha=1;fxp=fxp.filter(p=>p.l>0&&p.y<fxc.height+20);if(fxp.length)requestAnimationFrame(fxLoop);else fxRun=false}
function celebrate(msg){const el=$("cele");el.textContent=msg;el.classList.remove("show");void el.offsetWidth;el.classList.add("show");confetti(innerWidth/2,innerHeight*.36,90);sfx("claim")}
function levelFx(){lvlPop=1.6;flash=.35;for(let i=0;i<3;i++)rings.push({x:player.x,y:gy-jy,r:10+i*14,l:.9+i*.1,c:i%2?"#ffd24a":"#2bd9c4"});confetti(W/2,H*.3,70);sfx("level")}


function startGame(){
 score=0;combo=0;lives=maxL();level=1;spawn=.3;hspawn=3;road=0;jy=0;jv=0;inv=0;shake=0;flash=0;shield=boost=magnet=dbl=slow=0;dashT=dashCd=0;
 dags=[];hz=[];particles=[];floaters=[];player.x=W/2;
 if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
 {const rs=Prog.runStart();pet=rs.pet;petT=8;zaps=[];rings=[];lvlPop=0;revive=rs.revive?1:0;healUsed=false;frost=0;petX=W/2-50;petY=gy;if(rs.head)shield=6+Prog.shieldBonus()}
 state="playing";last=performance.now();
 showPanel(null);setTrack(true);updateHUD();banner=2.2;bannerName=th().name;say("MOVE ← → • JUMP SPACE");
}
function pauseGame(){if(state==="playing"){state="paused";showPanel("paused")}}
function resumeGame(){if(state==="paused"){state="playing";last=performance.now();showPanel(null)}}
function home(){state="menu";keys.left=keys.right=false;showPanel("home")}
function finish(){
 state="over";shield=boost=magnet=dbl=slow=0;best=Math.max(best,score);
 try{localStorage.setItem("dagsBest",String(best))}catch(e){}
 $("finalScore").textContent=String(score).padStart(4,"0");
 const rr=Prog.runEnd(score,level);$("runInfo").textContent=rr.text;$("runXpb").style.width=rr.pct+"%";if(rr.up)setTimeout(()=>celebrate("⭐ PLAYER LEVEL UP! LV "+rr.lv),350);
 $("bestScore").textContent=best;$("finalLevel").textContent=level+" • "+Math.floor(road/12)+" m";showPanel("over");
}
function jump(){
 if(state!=="playing"||jy>0)return;
 jv=800;beep(420,.12,"triangle");dust(player.x,gy+36,6);
}
function burst(x,y,color,n=15){
 for(let i=0;i<n;i++){const a=Math.random()*6.28,s=60+Math.random()*240;
  particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.4+Math.random()*.5,color,size:2+Math.random()*5})}
}
function dust(x,y,n){
 for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*200,vy:-Math.random()*60,life:.35,color:"#c9bfd8",size:3+Math.random()*3});
}
const pop=(x,y,msg,color)=>floaters.push({x,y,msg,color,life:1});
function getPU(k){
 if(k==="shield")shield=10+Prog.shieldBonus();else if(k==="boost")boost=7+Prog.bonus("boost");else if(k==="magnet")magnet=8+Prog.bonus("magnet");else if(k==="double")dbl=10;else if(k==="slow")slow=6;
 else if(k==="heart")lives=Math.min(maxL(),lives+1);
 say(PU[k].e+" "+PU[k].t+"!");
}
function doBlast(){
 hz.forEach(h=>burst(h.x,gy+20,"#ff7a1a",14));hz=[];
 dags=dags.filter(e=>{if(e.kind)return true;score+=10;burst(e.x,e.y,"#ffe66d",10);return false});
 shake=22;flash=.45;say("NICE ONE BABY!😜");beep(200,.3,"sawtooth");
}
function dash(){if(state!=="playing"||dashCd>0)return;dashT=.22;dashCd=1.1-Prog.bonus("dash");inv=Math.max(inv,.3);beep(300,.12,"sawtooth");dust(player.x,gy+36,8)}
function lose(msg,useInv){
 if(useInv&&inv>0)return false;
 if(shield>0){shield=0;inv=Math.max(inv,.9);shake=6;burst(player.x,gy-jy,"#37f5ff",30);pop(player.x,gy-jy-48,"BLOCKED!","#37f5ff");beep(700,.15,"triangle");return false}
 lives--;combo=0;shake=useInv?18:8;flash=useInv?.5:.25;if(useInv)inv=1.3;
 pop(player.x,gy-jy-48,msg,"#ff4778");beep(130,.2,"sawtooth");
 if(lives<=0&&revive){revive=0;lives=3;inv=2;say("💫 REVIVED! 3 hearts");celebrate("💫 REVIVED!")}
 if(lives<=0){updateHUD();finish();return true}
 return false;
}


function drawSky(){
 const t=th(),g=ctx.createLinearGradient(0,0,0,H);
 g.addColorStop(0,t.sky[0]);g.addColorStop(.5,t.sky[1]);g.addColorStop(1,t.sky[2]);
 ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 for(let i=0;i<60;i++)rect((i*173)%W,(i*61)%(H*.36),2,2,i%3?"#93efff":t.acc);
 const mx=W*.82,my=H*.16;
 [[70,"22"],[38,"55"],[24,""]].forEach(([r,a])=>{ctx.fillStyle=t.acc+a;ctx.beginPath();ctx.arc(mx,my,r*(1+bass()*.5),0,6.3);ctx.fill()});
 const horizon=H*.49;
 const tile=W+140,off=(road*.15)%tile;
 for(const sh of[-off,tile-off])buildings.forEach(b=>{
  const bx=b.x+sh;if(bx>W||bx+b.w<0)return;
  const y=horizon-b.h;
  rect(bx,y,b.w,b.h,t.bld[Math.floor(b.c*3)]);rect(bx,y,b.w,3,"#ffffff22");
  for(let wy=y+13;wy<horizon-9;wy+=20)for(let wx=8;wx<b.w-5;wx+=16)
   rect(bx+wx,wy,7,10,Math.sin((b.x+wx)*wy)*100>0?"#ffc96b":"#ffffff14");
 });

 const k=Math.floor((level-1)/2)%4;
 if(k===0){ 
  const x=W*.15;rect(x,horizon-95,5,95,"#9aa0b0");rect(x-4,horizon-110,38,26,"#f2f2f8");rect(x+8,horizon-90,16,3,"#ff6a2a");
 }else if(k===1){ 
  rect(W*.3,H*.28,5,horizon-H*.28,"#111522");rect(W*.7,H*.28,5,horizon-H*.28,"#111522");
  rect(W*.3,H*.28,W*.4+5,22,"#0b1126");rect(W*.3,H*.28,W*.4+5,3,t.acc);
  label("MATIKAS ROAD",W*.5,H*.28+16,Math.max(9,Math.min(14,W*.012)),t.acc,"center");
 }else if(k===2){ 
  ["DRUGS","PARES","FINE DINING RESTAURANT"].forEach((s,i)=>{const x=W*(.18+i*.28);
   rect(x,horizon-70,100,24,"#0b1126");rect(x,horizon-70,100,3,["#ff2d9b","#37f5ff","#ffe66d"][i]);
   label(s,x+50,horizon-52,11,["#ff2d9b","#37f5ff","#ffe66d"][i],"center")});
 }else{ 
  ctx.strokeStyle="#080b17";ctx.lineWidth=2;
  for(let i=0;i<3;i++){const y=H*(.14+i*.07);ctx.beginPath();ctx.moveTo(0,y);ctx.quadraticCurveTo(W*.5,y+30,W,y);ctx.stroke();
   for(let c=1;c<9;c++)rect(W*c/9,y+Math.sin(c/9*3.14)*22,16,20,["#ff2d9b","#37f5ff","#ffe66d","#fff"][(c+i)%4])}
 }
}
function drawJeep(x,y,s){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);
 rect(0,10,105,30,"#f6bb2c");rect(7,2,78,12,"#1ce0e0");
 for(let i=0;i<4;i++)rect(12+i*18,4,13,8,"#17223b");
 rect(86,17,14,10,"#fff4c8");rect(2,33,100,5,"#ed3597");
 rect(13,35,18,12,"#11131e");rect(76,35,18,12,"#11131e");ctx.restore();
}
function drawWorld(){
 const t=th();drawSky();
 const hg=ctx.createLinearGradient(0,H*.38,0,H*.49);hg.addColorStop(0,"#0000");hg.addColorStop(1,t.acc+"44");ctx.fillStyle=hg;ctx.fillRect(0,H*.38,W,H*.11);
 rect(0,H*.49,W,H*.12,t.walk);rect(0,H*.61,W,H*.39,t.road);rect(0,H*.61,W,4,t.acc);
 for(let x=-120+(road%160);x<W+100;x+=160)rect(x,H*.88,72,5,"#f2dba1");
 for(const x of[W*.08,W*.9]){rect(x,H*.36,4,H*.15,"#111522");rect(x-10,H*.36,25,4,"#ffe5a1");
  ctx.fillStyle="#ffe5a133";ctx.beginPath();ctx.arc(x+2,H*.37,35,0,6.3);ctx.fill()}
 drawJeep((road*1.2)%(W+140)-120,H*.64,.85);eq();
 ctx.fillStyle=t.acc;
 for(let i=0;i<28;i++){ctx.globalAlpha=.25+.35*Math.abs(Math.sin(road*.02+i));const ex=((i*137)%W-road*(.2+i%4*.08)+W*4)%W,ey=H*.08+(i*89)%(H*.55)+Math.sin(road*.015+i)*14;ctx.fillRect(ex,ey,2+i%3,2+i%3)}
 ctx.globalAlpha=1;
 if((level-1)%2===1){ctx.strokeStyle="#b4d6ff30";ctx.lineWidth=1;for(let i=0;i<40;i++){const rx=(i*97+road*.6)%W,ry=(i*71+road*3)%H;ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx-4,ry+14);ctx.stroke()}}
}
function photo(x,y,r,k){
 const im=imgs[k];if(!(im.complete&&im.naturalWidth))return;
 ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.clip();
 const s=Math.min(im.naturalWidth,im.naturalHeight);
 ctx.drawImage(im,(im.naturalWidth-s)/2,(im.naturalHeight-s)/2,s,s,x-r,y-r,r*2,r*2);ctx.restore();
 ctx.strokeStyle=k==="hev"?"#ff2d9b":"#ffe66d";ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.stroke();
}
const COL=k=>Prog.LOOK[k].o.map(o=>o[3]);
const HCOL=COL("hc"),JACKETS=COL("color"),SKIN=COL("sk"),EYEC=COL("ec"),PANTS=COL("pants"),SHOES=COL("shoes"),CAPEC=COL("cape");
let style={g:0,sk:2,eyes:0,ec:0,brow:0,mouth:0,face:0,hs:0,hc:0,topS:0,color:0,pants:0,shoes:0,hat:0,glasses:0,acc:0,cape:0,fx:0};
try{Object.assign(style,JSON.parse(localStorage.getItem("dagsStyle")||"{}"))}catch(e){}
function drawPet(){if(!pet)return;drawPetSprite(ctx,pet.id,pet.st,petX,petY+18,2.3,road*.02)}
function drawZap(z){const k=z.l/(z.f?.35:.3);
 if(z.f){ctx.strokeStyle="rgba(255,150,40,"+k+")";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(z.x1,z.y1);ctx.lineTo(z.x2,z.y2);ctx.stroke();
  ctx.strokeStyle="rgba(255,240,160,"+k+")";ctx.lineWidth=3;ctx.stroke();ctx.fillStyle="rgba(255,90,40,"+k+")";ctx.beginPath();ctx.arc(z.x2,z.y2,16*k+4,0,6.3);ctx.fill();return}
 ctx.strokeStyle="rgba(232,208,255,"+k+")";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(z.x1,z.y1);
 for(let i=1;i<5;i++)ctx.lineTo(z.x1+(z.x2-z.x1)*i/5+(Math.random()-.5)*26,z.y1+(z.y2-z.y1)*i/5+(Math.random()-.5)*26);ctx.lineTo(z.x2,z.y2);ctx.stroke()}
function drawHair(x,y){const hc=HCOL[style.hc],s=style.hs;
 if(s===1){rect(x-22,y-24,9,40,hc);rect(x+13,y-24,9,40,hc)}
 else if(s===2){rect(x+17,y-28,8,24,hc);rect(x+19,y-6,6,10,hc)}
 else if(s===3){ctx.fillStyle=hc;ctx.beginPath();ctx.arc(x,y-37,9,0,6.3);ctx.fill()}
 else if(s===4){rect(x-14,y-40,5,12,hc);rect(x-5,y-45,5,17,hc);rect(x+4,y-43,5,15,hc);rect(x+11,y-38,4,10,hc)}
 else if(s===5){ctx.fillStyle=hc;ctx.beginPath();ctx.arc(x,y-20,29,0,6.3);ctx.fill()}
 rect(x-17,y-29,34,11,hc);rect(x-21,y-22,42,8,hc)}
function drawFace(x,y){ 
 const D="#241532",blink=road%260>248,e=style.eyes,es=e===6?1:e,ec=EYEC[style.ec],lip=style.g?"#d94a7a":"#72273c";
 const f=style.face;
 if(f===1){rect(x-14,y-7,5,3,"#ff8fa8aa");rect(x+9,y-7,5,3,"#ff8fa8aa")}
 else if(f===2){[[-10,-8],[-7,-6],[-12,-5],[8,-8],[11,-6],[6,-5]].forEach(p=>rect(x+p[0],y+p[1],2,2,"#8a5a3a"))}
 else if(f===3){rect(x+8,y-10,5,1,"#ffd24a");rect(x+10,y-12,1,5,"#ffd24a");rect(x+9,y-11,3,3,"#ffd24a")}
 else if(f===4){rect(x-14,y-11,10,2,"#2bd9c4");rect(x+4,y-11,10,2,"#2bd9c4");rect(x-12,y-8,6,1,"#ffd24a");rect(x+6,y-8,6,1,"#ffd24a")}
 else if(f===5){rect(x+3,y-17,10,4,"#f1d9b5");rect(x+7,y-17,2,4,"#e0bf93")}
 const eye=(ex,open)=>{
  if(!open){rect(ex,y-11,4,2,D);return}
  if(es===0)rect(ex,y-13,4,4,ec);
  else if(es===1){rect(ex-1,y-14,6,6,"#fff");rect(ex,y-13,4,5,ec);rect(ex+2,y-13,2,2,"#fff")}
  else if(es===2){rect(ex,y-12,4,3,ec);rect(ex-1,y-13,6,2,"rgba(0,0,0,.5)")}
  else if(es===3){rect(ex,y-12,1,2,D);rect(ex+1,y-13,2,2,D);rect(ex+3,y-12,1,2,D)}
  else if(es===4){rect(ex-1,y-16,6,9,"#fff");rect(ex,y-15,4,7,ec);rect(ex+2,y-15,2,3,"#fff");rect(ex,y-9,2,1,"#fff")}
  else if(es===5){rect(ex+1,y-16,2,8,"#ffe66d");rect(ex-1,y-13,6,2,"#ffe66d");rect(ex+1,y-13,2,2,"#fff")}};
 eye(x-10,!blink);eye(x+6,!blink&&e!==6);
 const by=es===4?y-19:y-17,b=style.brow;
 if(b===1){rect(x-11,by,6,1,D);rect(x+5,by,6,1,D)}
 else if(b===2){rect(x-11,by,6,2,D);rect(x+5,by,6,2,D)}
 else if(b===3){rect(x-11,by+1,2,1,D);rect(x-9,by,4,1,D);rect(x+9,by+1,2,1,D);rect(x+5,by,4,1,D)}
 const m=style.mouth;
 if(m===0)rect(x-5,y-4,11,3,lip);
 else if(m===1){rect(x-6,y-5,2,1,D);rect(x-4,y-4,8,2,lip);rect(x+4,y-5,2,1,D)}
 else if(m===2){rect(x-6,y-6,12,6,"#fff");rect(x-6,y-6,12,1,D);rect(x-6,y-1,12,1,D);rect(x-1,y-6,1,6,D)}
 else if(m===3){rect(x-5,y-3,8,2,lip);rect(x+3,y-5,3,2,lip)}
 else if(m===4){rect(x-2,y-7,5,6,D);rect(x-1,y-6,3,4,"#c0394d")}
 else if(m===5){rect(x-5,y-4,4,2,lip);rect(x+1,y-4,4,2,lip);rect(x-1,y-5,2,1,lip)}
 const g=style.glasses,c="#2b2b3a";
 if(g===1){rect(x-14,y-16,28,7,"#0b0b12");rect(x-12,y-15,9,2,"#ffffff55");rect(x+3,y-15,9,2,"#ffffff55")}
 else if(g===2){[x-14,x+4].forEach(ax=>{rect(ax,y-16,10,1,c);rect(ax,y-8,10,1,c);rect(ax,y-16,1,9,c);rect(ax+9,y-16,1,9,c)});rect(x-4,y-13,8,1,c)}
 else if(g===3){[x-15,x+4].forEach(ax=>{rect(ax+1,y-16,4,3,"#ff4fa3");rect(ax+6,y-16,4,3,"#ff4fa3");rect(ax,y-14,11,3,"#ff4fa3");rect(ax+2,y-11,7,2,"#ff4fa3");rect(ax+4,y-9,3,1,"#ff4fa3")})}
 else if(g===4){rect(x-17,y-16,34,5,"#23d3d3cc");rect(x-17,y-16,34,1,"#fff")}}
function drawAcc(x,y){const a=style.acc;
 if(a===1){rect(x-17,y-8,3,5,"#ffd24a");rect(x+14,y-8,3,5,"#ffd24a")}
 else if(a===2){rect(x-19,y-36,11,8,"#ff4fa3");rect(x-15,y-34,3,4,"#ff2d9b")}
 else if(a===3){rect(x-21,y-35,42,4,"#2b2b3a");rect(x-23,y-27,7,15,"#2bd9c4");rect(x+16,y-27,7,15,"#2bd9c4")}
 else if(a===4){rect(x-15,y-8,30,11,"#1b1b2a");rect(x-15,y-8,30,1,"#555a7a")}
 else if(a===5){rect(x+9,y-35,8,8,"#ff9fcf");rect(x+11,y-33,4,4,"#ffe66d")}}
function drawHat(x,y){
 const t=style.hat;
 if(t===1){rect(x-19,y-37,38,10,"#e63946");rect(x-5,y-31,29,5,"#b5121e");rect(x-3,y-41,6,5,"#e63946")}
 else if(t===2){rect(x-19,y-40,38,15,"#3a86ff");rect(x-19,y-31,38,5,"#fff");ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x,y-44,5,0,6.3);ctx.fill()}
 else if(t===3){rect(x-17,y-34,34,9,"#ffd700");rect(x-17,y-44,7,11,"#ffd700");rect(x-3,y-48,7,15,"#ffd700");rect(x+10,y-44,7,11,"#ffd700");rect(x-1,y-31,3,3,"#ff2d9b")}
 else if(t===4){rect(x-30,y-33,60,5,"#8b5a2b");rect(x-15,y-47,30,15,"#a0692f");rect(x-15,y-37,30,4,"#3a2414")}
 else if(t===5){rect(x-19,y-27,38,5,"#e63946");rect(x+17,y-27,6,13,"#e63946");rect(x+19,y-16,4,6,"#b5121e")}
 else if(t===6){rect(x-18,y-38,9,10,"#2b2b3a");rect(x-16,y-36,5,7,"#ff8fb8");rect(x+9,y-38,9,10,"#2b2b3a");rect(x+11,y-36,5,7,"#ff8fb8");rect(x-18,y-30,36,3,"#2b2b3a")}
 else if(t===7){ctx.fillStyle="#ffe66d33";ctx.beginPath();ctx.arc(x,y-42,18,0,6.3);ctx.fill();rect(x-11,y-45,22,2,"#ffe66d");rect(x-11,y-39,22,2,"#ffe66d");rect(x-13,y-43,2,4,"#ffe66d");rect(x+11,y-43,2,4,"#ffe66d")}}
function drawPlayerFx(){ 
 const st=Math.max(-.12,Math.min(.15,jv*.00015)),sy=1+st-squash,sx=1-st*.6+squash*.8,fy=gy+36;
 ctx.save();ctx.translate(player.x,fy);ctx.transform(sx,0,-lean*.12,sy,0,0);ctx.translate(-player.x,-fy);drawPlayer();ctx.restore()}
function drawPlayer(){
 if(inv>0&&Math.floor(inv*14)%2)return;
 const x=player.x,y=gy-jy;
 ctx.fillStyle="#05061190";const sc=1-jy/400;
 ctx.beginPath();ctx.ellipse(x,gy+34,33*sc,8*sc,0,0,6.3);ctx.fill();
 if(combo>=8){ctx.strokeStyle=th().acc;ctx.lineWidth=3;ctx.globalAlpha=.6+Math.sin(road*.1)*.3;
  ctx.beginPath();ctx.arc(x,y,48,0,6.3);ctx.stroke();ctx.globalAlpha=1}
 if(magnet>0){ctx.strokeStyle="#ff2d9b88";ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,100+Math.sin(road*.15)*10,0,6.3);ctx.stroke()}
 if(dbl>0)label("x2",x,y-56,14,"#a7ff77","center");
 if(shield>0){ctx.globalAlpha=shield<2&&Math.floor(road/5)%2?.3:.8;ctx.strokeStyle="#37f5ff";ctx.lineWidth=4;ctx.fillStyle="#37f5ff22";ctx.beginPath();ctx.arc(x,y+4,56,0,6.3);ctx.fill();ctx.stroke();ctx.globalAlpha=1}
 if(boost>0&&Math.random()<.8)particles.push({x:x+(Math.random()-.5)*34,y:y+28,vx:(Math.random()-.5)*40,vy:60,life:.4,color:"#ffe66d",size:5});
 drawHair(x,y);
 rect(x-15,y-20,30,22,SKIN[style.sk]);
 drawFace(x,y);
 photo(x,y-12,19,"hev");drawAcc(x,y);drawHat(x,y);
 if(style.cape){rect(x-27,y+4,54,32,CAPEC[style.cape]);rect(x-27,y+34,54,3,"#ffd24a")}
 const jc=JACKETS[style.color],sk=SKIN[style.sk],ts=style.topS,short=ts===2||ts===3;
 rect(x-23,y+2,46,25,jc);
 if(short){rect(x-29,y+3,8,9,jc);rect(x+21,y+3,8,9,jc);rect(x-29,y+12,8,10,sk);rect(x+21,y+12,8,10,sk)}
 else{rect(x-29,y+3,8,19,jc);rect(x+21,y+3,8,19,jc)}
 if(ts===0){rect(x-16,y+4,32,4,"#ffd9ef");rect(x-5,y+5,6,15,"#ffe66d")}
 else if(ts===1){rect(x-18,y,36,7,jc);rect(x-18,y,36,2,"#00000040");rect(x-12,y+16,24,9,"#00000038");rect(x-3,y+7,2,9,"#fff");rect(x+2,y+7,2,9,"#fff")}
 else if(ts===2){rect(x-23,y+2,46,3,"#fff");rect(x-23,y+24,46,3,"#fff");label("07",x,y+20,14,"#fff","center")}
 else{rect(x-8,y+2,16,4,sk)}
 const l=jy>0?-4:0;
 rect(x-16,y+27,13,9+l,PANTS[style.pants]);rect(x+4,y+27,13,9+l,PANTS[style.pants]);
 rect(x-20,y+33+l,16,5,SHOES[style.shoes]);rect(x+5,y+33+l,16,5,SHOES[style.shoes]);
 if(style.g)rect(x-25,y+24,50,9,jc);
}
function drawOrb(d){const P=PU[d.kind],c=P.c,p=1+Math.sin(road*.12)*.12;
 ctx.fillStyle=c+"33";ctx.beginPath();ctx.arc(d.x,d.y,44*p,0,6.3);ctx.fill();
 ctx.fillStyle=c+"88";ctx.beginPath();ctx.arc(d.x,d.y,28*p,0,6.3);ctx.fill();
 ctx.fillStyle="#0b1126";ctx.beginPath();ctx.arc(d.x,d.y,20,0,6.3);ctx.fill();
 ctx.font="20px sans-serif";ctx.textAlign="center";ctx.fillStyle="#fff";ctx.fillText(P.e,d.x,d.y+7);ctx.textAlign="left"}
function drawDags(d){
 if(d.kind){drawOrb(d);return}
 const x=d.x,y=d.y,c=d.gold?"#37f5ff":"#ffe66d";
 ctx.fillStyle=d.gold?"#37f5ff44":"#ff2d9b2b";ctx.beginPath();ctx.arc(x,y,d.gold?46:36,0,6.3);ctx.fill();
 rect(x-16,y-24,32,9,"#17121b");rect(x-20,y-16,40,24,"#c88b67");
 rect(x-10,y-9,5,5,"#12121c");rect(x+6,y-9,5,5,"#12121c");rect(x-5,y-1,12,3,"#6b253a");
 photo(x,y-6,20,"dags");
 rect(x-23,y+8,46,25,c);rect(x-28,y+10,6,17,c);rect(x+22,y+10,6,17,c);
 rect(x-17,y+33,12,8,"#171523");rect(x+5,y+33,12,8,"#171523");
 label(d.gold?"+50":"DAGS",x,y+25,9,"#171523","center");
}
function drawHazard(h){
 const y=gy+36;
 if(h.type===0){ctx.fillStyle="#ff7a1a";ctx.beginPath();ctx.moveTo(h.x-16,y);ctx.lineTo(h.x+16,y);ctx.lineTo(h.x,y-34);ctx.fill();
  rect(h.x-9,y-17,18,5,"#fff")}
 else{ctx.fillStyle="#0b0d19";ctx.beginPath();ctx.arc(h.x,y-17,18,0,6.3);ctx.fill();
  ctx.fillStyle="#8993ac";ctx.beginPath();ctx.arc(h.x,y-17,8,0,6.3);ctx.fill();ctx.strokeStyle="#ffffffaa";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(h.x,y-17);ctx.lineTo(h.x+Math.cos(h.x*.07)*15,y-17+Math.sin(h.x*.07)*15);ctx.stroke()}
}
function drawHome(){
 const t=road*.016,g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#040922");g.addColorStop(.6,"#0b1c4d");g.addColorStop(1,"#123a63");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 for(let i=0;i<80;i++){ctx.globalAlpha=.3+.7*Math.abs(Math.sin(t*2+i));rect((i*197)%W,(i*83)%(H*.55),2,2,i%5?"#cfe8ff":"#ffd24a")}ctx.globalAlpha=1;
 const mx=W*.84,my=H*.15;ctx.fillStyle="#ffd24a22";ctx.beginPath();ctx.arc(mx,my,62,0,6.3);ctx.fill();
 rect(mx-24,my-24,48,48,"#ffe9a8");rect(mx-30,my-12,60,24,"#ffe9a8");rect(mx-12,my-30,24,60,"#ffe9a8");rect(mx+6,my-8,10,10,"#e8cf86");rect(mx-14,my+6,8,8,"#e8cf86");
 const gh=H*.70;
 [["#0a1745",.12,34,70],["#0f2a63",.3,46,110],["#164b78",.6,60,150]].forEach(([col,sp,bw,mh],L)=>{
  const n=Math.ceil(W/bw)+2,off=(road*sp)%bw,base=Math.floor(road*sp/bw);
  for(let i=0;i<n;i++){const idx=base+i,h=mh*.4+((idx*53+L*29)%7)/7*mh*.6,x=i*bw-off;
   rect(x,gh-h,bw-2,h+4,col);
   for(let wy=gh-h+8;wy<gh-6;wy+=14)for(let wx=x+6;wx<x+bw-10;wx+=12)if(((idx*7+i*3+Math.round(wy/14))%5)<2)rect(wx,wy,5,7,L>1?"#ffd24a":"#2bd9c4")}});
 rect(0,gh,W,H-gh,"#071231");rect(0,gh,W,4,"#2bd9c4");
 for(let x=-((road*1.5)%48);x<W;x+=48)rect(x,gh+4,2,H-gh,"#0d1f4a");
 for(let y=gh+22;y<H;y+=22)rect(0,y,W,2,"#0d1f4a");
 [W*.1,W*.9].forEach(x=>{rect(x,gh-110,4,110,"#0a1745");rect(x-12,gh-114,28,6,"#ffd24a");
  const gg=ctx.createRadialGradient(x+2,gh-108,2,x+2,gh-108,90);gg.addColorStop(0,"rgba(255,210,74,.35)");gg.addColorStop(1,"rgba(255,210,74,0)");ctx.fillStyle=gg;ctx.fillRect(x-90,gh-200,184,200)});
 for(let i=0;i<14;i++){const cx=((i*131+road*.35*(.6+i%3*.3))%(W+40))-20,cy=H*.16+(i*57)%(H*.4)+Math.sin(t*2+i)*10,w=Math.max(2,Math.abs(Math.cos(t*2.4+i))*10);
  rect(cx-w/2-1,cy-6,w+2,12,"#8a5a00");rect(cx-w/2,cy-5,w,10,"#ffd24a");rect(cx-w/2+1,cy-4,Math.max(1,w/3),3,"#fff6c0")}
 for(let i=0;i<40;i++){ctx.globalAlpha=.25+.45*Math.abs(Math.sin(t*1.5+i*1.3));rect((i*89+road*.15*(1+i%3))%W,H*.2+(i*47)%(H*.5)+Math.cos(t+i)*12,3,3,i%2?"#2bd9c4":"#ffd24a")}ctx.globalAlpha=1;
 
 for(let i=0;i<3;i++){const cx=((i*420+road*.25*(1+i*.3))%(W+260))-130,cy=H*.09+i*H*.07;ctx.globalAlpha=.55;rect(cx,cy,90,14,"#1a2c66");rect(cx+14,cy-10,56,12,"#1a2c66");rect(cx+30,cy+12,70,8,"#16255a")}ctx.globalAlpha=1;
 for(let i=0;i<20;i++){const a=t*.6+i*1.7,x=((i*173)%W)+Math.sin(a)*40,y=gh-30-(i*41)%(H*.28)+Math.cos(a*1.3)*22,al=.35+.65*Math.abs(Math.sin(t*2+i*2.3)),g=ctx.createRadialGradient(x,y,0,x,y,16);
  g.addColorStop(0,"rgba(220,255,120,"+al+")");g.addColorStop(1,"rgba(220,255,120,0)");ctx.fillStyle=g;ctx.fillRect(x-16,y-16,32,32);rect(x-1,y-1,3,3,"#f6ffb0")}
 const ss=t%9;if(ss<.8){const k=ss/.8,x=W*.15+k*W*.5,y=H*.05+k*H*.2;ctx.strokeStyle="rgba(255,255,255,"+(1-k)+")";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-70,y-28);ctx.stroke()}}
function drawMenuCast(){
 const s=Math.min(2.2,H*.0030,W<600?1.9:9),gh=H*.70+14,b=Math.sin(road*.05)*3,hx=W*(W<600?.4:.46);
 const sx=player.x,sg=gy,sc=combo,si=inv;
 player.x=0;gy=0;jy=0;combo=0;inv=0;
 ctx.save();ctx.translate(hx,gh-38*s+b);ctx.scale(s,s*(1+Math.sin(road*.06)*.014));drawPlayer();ctx.restore();
 player.x=sx;gy=sg;combo=sc;inv=si;
 label("HEV ABI",hx,gh+24,12,"#2bd9c4","center");
 const pi=Prog.pet();if(pi){drawPetSprite(ctx,pi.id,pi.st,hx+s*50,gh+2,s*1.9,road*.02);label(pi.n.toUpperCase(),hx+s*50,gh+24,11,"#ffd24a","center")}
 if(W>=600){ctx.save();ctx.translate(W*.84,gh-41*s*.8);ctx.scale(s*.8,s*.8);drawDags({x:0,y:0,gold:false});ctx.restore();label("UNCLE DAGS",W*.84,gh+24,11,"#ffd24a","center")}
}
function render(){
 ctx.clearRect(0,0,W,H);ctx.save();
 if(shake>0&&shakeOn)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
 if(state==="menu")drawHome();else drawWorld();
 if(boost>0){ctx.strokeStyle="#ffe66d55";ctx.lineWidth=2;for(let i=0;i<16;i++){const sy=(i*83+road*7)%H,sx=(i*191)%W;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx,sy+46);ctx.stroke()}}
 hz.forEach(drawHazard);dags.forEach(d=>{if(d.kind){drawDags(d);return}ctx.save();ctx.translate(d.x,d.y);ctx.rotate(Math.sin(d.phase)*.16);ctx.translate(-d.x,-d.y);drawDags(d);ctx.restore()});zaps.forEach(drawZap);
 if(state!=="menu"){drawPlayerFx();if(state==="playing")drawPet()}else drawMenuCast();
 particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life);rect(p.x,p.y,p.size,p.size,p.color);ctx.globalAlpha=1});
 rings.forEach(r=>{ctx.globalAlpha=Math.max(0,r.l);ctx.strokeStyle=r.c;ctx.lineWidth=4;ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,6.3);ctx.stroke()});ctx.globalAlpha=1;
 floaters.forEach(f=>{ctx.globalAlpha=Math.max(0,f.life);label(f.msg,f.x,f.y,18,f.color,"center");ctx.globalAlpha=1});
 ctx.restore();
 if(flash>0){ctx.fillStyle="rgba(255,45,155,"+flash+")";ctx.fillRect(0,0,W,H)}
 if(slow>0){ctx.fillStyle="rgba(120,90,255,.14)";ctx.fillRect(0,0,W,H)}
 if(frost>0){ctx.fillStyle="rgba(120,220,255,.16)";ctx.fillRect(0,0,W,H)}
 const vg=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);
 vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(5,3,15,.55)");ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
 if(state==="playing"){const pr=(score%D().step)/D().step,g2=ctx.createLinearGradient(0,0,W,0);ctx.fillStyle="#04092299";ctx.fillRect(0,0,W,5);g2.addColorStop(0,"#2bd9c4");g2.addColorStop(1,"#ffd24a");ctx.fillStyle=g2;ctx.fillRect(0,0,W*pr,5)}
 if(lvlPop>0){const k=1-lvlPop/1.6,sc=1+Math.sin(Math.min(1,k*3)*Math.PI)*.5;ctx.save();ctx.globalAlpha=Math.min(1,lvlPop*1.5);ctx.shadowColor="#ffd24a";ctx.shadowBlur=30;label("LEVEL UP!",W/2,H*.47,Math.max(26,Math.min(64,W*.06))*sc,"#ffd24a","center");ctx.restore()}
 if(banner>0){const a=Math.min(1,banner,(2.2-banner)*4),y=H*.3,c=th().acc;ctx.globalAlpha=a;
  rect(0,y-34,W,104,"#050611cc");rect(0,y-34,W,3,c);rect(0,y+67,W,3,c);
  label("LEVEL "+level,W/2,y+2,Math.max(16,Math.min(34,W*.035)),"#fff","center");
  label(bannerName,W/2,y+36,Math.max(12,Math.min(22,W*.022)),c,"center");label("♫ "+tracks[Math.floor((level-1)/2)%4].name+" • "+tracks[Math.floor((level-1)/2)%4].by,W/2,y+58,Math.max(11,Math.min(16,W*.016)),"#ffffffcc","center");ctx.globalAlpha=1}
 if(state==="playing"){const bw=Math.min(300,W*.55),bx=(W-bw)/2,by=H-30,f=Math.min(combo,8)/8;
  rect(bx,by,bw,10,"#0a0d20cc");rect(bx,by,bw*f,10,combo>=8?(Math.floor(road/6)%2?"#ffe66d":"#ff2d9b"):"#37f5ff");
  ctx.strokeStyle="#ffffff55";ctx.lineWidth=1;ctx.strokeRect(bx,by,bw,10);
  label(combo>=8?"FEVER x2":"COMBO "+combo+"/8",W/2,by-6,11,"#fff","center");
  label(dashCd>0?"DASH "+dashCd.toFixed(1):"DASH READY",bx-8,by+9,10,dashCd>0?"#8893b0":"#37f5ff","right");
  let ty=by-26;
  [["shield",shield],["boost",boost],["magnet",magnet],["double",dbl],["slow",slow]].forEach(([k,v])=>{if(v>0){label(PU[k].e+" "+PU[k].t+" "+v.toFixed(1)+"s",W/2,ty,12,PU[k].c,"center");ty-=17}})}
}


function update(dt){
 if(state==="menu"){road+=120*dt;return}
 if(state!=="playing")return;
 road+=(150+level*8)*dt;inv=Math.max(0,inv-dt);banner=Math.max(0,banner-dt);shield=Math.max(0,shield-dt);boost=Math.max(0,boost-dt);magnet=Math.max(0,magnet-dt);dbl=Math.max(0,dbl-dt);slow=Math.max(0,slow-dt);dashT=Math.max(0,dashT-dt);dashCd=Math.max(0,dashCd-dt);squash=Math.max(0,squash-dt*2);lvlPop=Math.max(0,lvlPop-dt);lean+=((keys.right?1:0)-(keys.left?1:0)-lean)*Math.min(1,dt*12);rings.forEach(r=>{r.r+=dt*170;r.l-=dt});rings=rings.filter(r=>r.l>0);
 if(pet){petT-=dt;const a=pet.a;
  if(pet.id==="yuki"&&a.heal&&!healUsed&&lives<=2&&lives<maxL()){lives++;healUsed=true;say("❄️ "+pet.n+" healed 1 heart!");celebrate("❄️ HEART RESTORED")}
  if(petT<=0){
   if(pet.id==="yuki"){slow=Math.max(slow,a.dur);frost=a.dur;say("❄️ "+pet.n+": FROST! Time slows");petT=a.every}
   else if(pet.id==="mochi"){if(shield<=0){shield=a.dur+Prog.shieldBonus();say("🟢 "+pet.n+": SHIELD!")}petT=a.every}
   else if(pet.id==="raze"){if(hz.length){hz.sort((p,q)=>Math.abs(p.x-player.x)-Math.abs(q.x-player.x));const hit=hz.splice(0,a.n);
     hit.forEach(h=>{zaps.push({x1:petX,y1:petY,x2:h.x,y2:gy+20,l:.35,f:1});burst(h.x,gy+20,"#ff7a1a",18);score+=a.pts});say("🔥 "+pet.n+" burned "+hit.length+" hazard(s)! +"+a.pts*hit.length);petT=a.every}else petT=1}
   else if(pet.id==="aurum"){for(let i=0;i<a.n;i++)dags.push({x:Math.max(30,Math.min(W-30,player.x+(i-(a.n-1)/2)*60)),y:-30-i*40,gold:false,kind:"coin",vy:170,phase:0});say("🦊 "+pet.n+" dug up treasure!");petT=a.every}
   else if(pet.id==="choco"){dags.push({x:Math.max(30,Math.min(W-30,player.x+(Math.random()-.5)*160)),y:-30,gold:false,kind:PKS[Math.floor(Math.random()*PKS.length)],vy:150,phase:0});say("🍀 "+pet.n+" found a lucky power-up!");petT=a.every}
   else petT=999}
  petX+=(player.x-face*60-petX)*Math.min(1,dt*6);petY+=((gy-jy-8)-petY)*Math.min(1,dt*8)}
 frost=Math.max(0,frost-dt);if(frost>0&&Math.random()<.5)particles.push({x:Math.random()*W,y:-5,vx:(Math.random()-.5)*30,vy:120,life:1.6,color:"#dff6ff",size:3});
 zaps.forEach(z=>z.l-=dt);zaps=zaps.filter(z=>z.l>0);shake=Math.max(0,shake-dt*40);flash=Math.max(0,flash-dt);
 const sp=Math.min(W*.95,430+level*12)*dt*(boost>0?1.5:1);
 if(keys.left){player.x-=sp;face=-1}if(keys.right){player.x+=sp;face=1}
 if(dashT>0){player.x+=face*sp*2.6;particles.push({x:player.x,y:gy-jy,vx:0,vy:0,life:.3,color:"#37f5ff",size:8})}
 player.x=Math.max(25,Math.min(W-25,player.x));
 jv-=2300*dt;jy+=jv*dt;
 if(jy<=0){if(jv<-400){dust(player.x,gy+36,5);squash=.16}jy=0;jv=0}
 if(style.fx&&(keys.left||keys.right||jy>0)&&Math.random()<.6){const TF=[0,["#2bd9c4","#ffd24a"],["#ff7a1a","#ff3b3b"],["#ff4fa3","#ff9fcf"]][style.fx];particles.push({x:player.x+(Math.random()-.5)*30,y:gy-jy+30,vx:(Math.random()-.5)*50,vy:style.fx===2?-60:-20,life:.5,color:TF[Math.random()<.5?0:1],size:style.fx===3?6:4})}
 if(combo>=8&&Math.random()<.6)particles.push({x:player.x+(Math.random()-.5)*30,y:gy-jy+30,vx:0,vy:20,life:.4,color:th().acc,size:4});

 spawn+=dt;
 if(spawn>=Math.max(.30,1.02-(level-1)*.045)/D().spd){
  spawn=0;
  dags.push({x:35+Math.random()*(W-70),y:-35,kind:Math.random()<.07+Prog.bonus("luck")+(pet&&pet.id==="choco"?pet.a.luck:0)?PKS[Math.floor(Math.random()*PKS.length)]:(Math.random()<.14+(pet&&pet.id==="choco"?pet.a.coin:0)?"coin":""),gold:Math.random()<.08,
   vy:(155+Math.random()*90)*D().spd*(1+(Math.min(level,25)-1)*.12),phase:Math.random()*6});
 }

 if(score>=D().hzStart){hspawn-=dt;
  if(hspawn<=0){hspawn=(Math.max(1.1,3.2-level*.2)+Math.random()*1.2)/D().hz;
   const dir=Math.random()<.5?-1:1;
   hz.push({x:dir<0?W+30:-30,vx:dir*(220+Math.min(level,25)*25)*D().spd,type:Math.random()<.5?0:1})}}
 for(let i=hz.length-1;i>=0;i--){
  const h=hz[i];h.x+=h.vx*dt*(slow>0?.5:1);
  if(Math.abs(h.x-player.x)<30&&jy<34){if(lose("OUCH!",true))return;h.hit=1}
  if(h.x<-60||h.x>W+60)hz.splice(i,1);
 }
 for(let i=dags.length-1;i>=0;i--){
  const d=dags[i];d.y+=d.vy*dt*(slow>0?.5:1);d.phase+=dt*4;d.x+=Math.sin(d.phase)*12*dt;
  if(pet&&pet.id==="aurum"&&d.kind==="coin"){const mx=player.x-d.x,my=gy-jy-d.y;if(Math.hypot(mx,my)<pet.a.r){d.x+=mx*5*dt;d.y+=my*3*dt}}
  if(magnet>0){const mx=player.x-d.x,my=gy-jy-d.y;if(Math.hypot(mx,my)<300+Prog.bonus("magnetR")){d.x+=mx*4*dt;d.y+=my*1.5*dt}}
  if(Math.abs(d.x-player.x)<44&&Math.abs(d.y-(gy-jy))<50){
   if(d.kind==="coin"){const v=Prog.coin(1);burst(d.x,d.y,"#ffd700",14);rings.push({x:d.x,y:d.y,r:8,l:.5,c:"#ffd700"});pop(d.x,d.y,"+"+v+" 🪙","#ffd700");sfx("coin");dags.splice(i,1);continue}
   if(d.kind){if(d.kind==="blast")blastNext=true;else getPU(d.kind);score+=20;burst(d.x,d.y,PU[d.kind].c,30);pop(d.x,d.y,PU[d.kind].t,"#fff");beep(760,.2,"triangle");dags.splice(i,1);continue}
   let pts=d.gold?50:10+Math.min(combo,10)*2;
   if(combo>=8)pts*=2;if(dbl>0)pts*=2;
   score+=pts;combo++;{const pm=Prog.onCatch();if(pm)say(pm)}
   if(combo===8)say("🔥 LASMO DRE x2!");
   burst(d.x,d.y,d.gold?"#37f5ff":"#ffe66d",d.gold?28:15);rings.push({x:d.x,y:d.y,r:8,l:.45,c:d.gold?"#37f5ff":"#ff2d9b"});pop(d.x,d.y,"+"+pts,d.gold?"#37f5ff":"#ffe66d");
   beep(580+Math.min(combo,12)*40);dags.splice(i,1);
   const nl=1+Math.floor(score/D().step);
   if(nl>level){const om=Math.floor((level-1)/2)%4;level=nl;lives=Math.min(maxL(),lives+1);setTrack(false);hz=[];
    say((Math.floor((level-1)/2)%4!==om?"NEW MAP • ":"LEVEL "+level+" • ")+th().name+" • +1 ♥");banner=2.2;bannerName=th().name;burst(W/2,H*.36,"#37f5ff",40);levelFx()}
   continue;
  }
  if(d.y>H+30){dags.splice(i,1);if(!d.kind&&lose("MISS U BABY!",false))return}
 }
 if(blastNext){blastNext=false;doBlast()}
 for(let i=particles.length-1;i>=0;i--){
  const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=160*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1)}
 for(let i=floaters.length-1;i>=0;i--){const f=floaters[i];f.y-=35*dt;f.life-=dt;if(f.life<=0)floaters.splice(i,1)}
 updateHUD();
}
function loop(now){const dt=Math.min((now-last)/1000,.035);last=now;update(dt);render();requestAnimationFrame(loop)}

$("playBtn").onclick=()=>{try{if(!localStorage.getItem("dagsSeen")){localStorage.setItem("dagsSeen","1");showPanel("tutorial");return}}catch(e){}startGame()};$("restartPause").onclick=startGame;$("againBtn").onclick=startGame;
$("pauseBtn").onclick=pauseGame;$("resumeBtn").onclick=resumeGame;
$("pauseHome").onclick=home;$("overHome").onclick=home;
function hold(id,dir){
 const el=$(id),on=e=>{e.preventDefault();keys[dir]=true},off=e=>{e.preventDefault();keys[dir]=false};
 el.addEventListener("pointerdown",on);["pointerup","pointercancel","pointerleave"].forEach(ev=>el.addEventListener(ev,off));
}
hold("leftBtn","left");hold("rightBtn","right");
$("jumpBtn").addEventListener("pointerdown",e=>{e.preventDefault();jump()});
$("dashBtn").addEventListener("pointerdown",e=>{e.preventDefault();dash()});
addEventListener("keydown",e=>{
 if(e.target&&e.target.tagName==="INPUT")return;
 const k=e.key.toLowerCase();
 if(["arrowleft","arrowright","arrowup"," "].includes(k))e.preventDefault();
 if(k==="arrowleft"||k==="a")keys.left=true;
 if(k==="arrowright"||k==="d")keys.right=true;
 if((k==="shift"||k==="s")&&!e.repeat&&state==="playing")dash();
 if((k===" "||k==="arrowup"||k==="w")&&!e.repeat){
  if(state==="playing")jump();else if(state==="menu"||state==="over")startGame();
 }
 if(k==="enter"&&(state==="menu"||state==="over"))startGame();
 if(k==="escape"||k==="p"){state==="playing"?pauseGame():resumeGame()}
});
addEventListener("keyup",e=>{
 const k=e.key.toLowerCase();
 if(k==="arrowleft"||k==="a")keys.left=false;
 if(k==="arrowright"||k==="d")keys.right=false;
});
addEventListener("blur",()=>{keys.left=keys.right=false});
$("howBtn").onclick=()=>showPanel("tutorial");$("tutBack").onclick=()=>showPanel("home");$("tutPlay").onclick=startGame;
function setDiff(d){diff=d;try{localStorage.setItem("dagsDiff",d)}catch(e){}
 document.querySelectorAll(".dbtn").forEach(b=>b.classList.toggle("on",b.dataset.d===d));
 $("chipLives").textContent="❤️ "+DIFFS[d].lives+" LIVES"}
document.querySelectorAll(".dbtn").forEach(b=>b.onclick=()=>setDiff(b.dataset.d));setDiff(diff);
function drawAvatar(id,head){
 const pc=$(id);if(!pc)return;const pctx=pc.getContext("2d"),main=ctx;ctx=pctx;
 pctx.fillStyle="#0a0d20";pctx.fillRect(0,0,pc.width,pc.height);
 const sx=player.x,sg=gy,sc=combo,si=inv,ss=[shield,boost,magnet,dbl];
 player.x=0;gy=0;jy=0;combo=0;inv=0;shield=boost=magnet=dbl=0;
 const k=head?pc.height/44:pc.height/98;
 pctx.save();pctx.translate(pc.width/2,head?pc.height*.78:pc.height/2+5*k);pctx.scale(k,k);drawPlayer();pctx.restore();
 player.x=sx;gy=sg;combo=sc;inv=si;[shield,boost,magnet,dbl]=ss;ctx=main}
let backup=null,ctab="Face";const CTABS=["Face","Hair","Outfit","Extras"];
function saveStyle(){try{localStorage.setItem("dagsStyle",JSON.stringify(style))}catch(e){}}
function sanitizeStyle(){if(style.shades!==undefined){if(style.shades&&Prog.can("glasses",1))style.glasses=1;delete style.shades}
 for(const k in Prog.LOOK){const n=Prog.LOOK[k].o.length;if(!(Number.isInteger(style[k])&&style[k]>=0&&style[k]<n))style[k]=k==="sk"?2:0;if(!Prog.can(k,style[k]))style[k]=0}
 if(style.g!==0&&style.g!==1)style.g=0}
function lockedCount(){let n=0;for(const k in Prog.LOOK)Prog.LOOK[k].o.forEach((o,i)=>{if(!Prog.can(k,i))n++});return n}
function buildCust(){
 $("custTabs").innerHTML=CTABS.map(t=>'<button class="arr'+(t===ctab?' on':'')+'" data-ct="'+t+'">'+t.toUpperCase()+'</button>').join("");
 const rows=[];
 if(ctab==="Face")rows.push('<div class="row"><span>CHARACTER</span><button class="arr" id="genBtn">'+(style.g?"GIRL":"BOY")+'</button></div>');
 for(const k in Prog.LOOK){const s=Prog.LOOK[k];if(s.cat!==ctab)continue;
  if(s.sw)rows.push('<div class="row"><span>'+s.n.toUpperCase()+'</span><div class="swr">'+s.o.map((o,i)=>{const ok=Prog.can(k,i);return '<span class="sw'+(i===style[k]?' on':'')+(ok?'':' lock')+'" data-k="'+k+'" data-i="'+i+'" style="background:'+o[3]+'" title="'+o[0]+(ok?'':' (locked, Lv '+o[2]+')')+'"></span>'}).join("")+'</div></div>');
  else rows.push('<div class="row"><span>'+s.n.toUpperCase()+'</span><button class="arr" data-k="'+k+'" data-d="-1">◀</button><b class="nm">'+s.o[style[k]][0]+'</b><button class="arr" data-k="'+k+'" data-d="1">▶</button></div>')}
 $("custRows").innerHTML=rows.join("");
 const n=lockedCount();$("custMsg").textContent=n?"🔒 "+n+" more cosmetics to unlock. Level up and visit the Shop!":"";
 drawAvatar("prev")}
$("custTabs").addEventListener("click",e=>{const b=e.target.closest("[data-ct]");if(b){ctab=b.dataset.ct;buildCust()}});
$("custRows").addEventListener("click",e=>{
 const sw=e.target.closest(".sw");
 if(sw){const k=sw.dataset.k,i=+sw.dataset.i;if(!Prog.can(k,i)){$("custMsg").textContent="🔒 "+Prog.LOOK[k].o[i][0]+" unlocks at player Lv "+Prog.LOOK[k].o[i][2]+" in the Shop";return}style[k]=i;buildCust();return}
 const ar=e.target.closest("[data-k][data-d]");
 if(ar){const k=ar.dataset.k,d=+ar.dataset.d,n=Prog.LOOK[k].o.length;let v=style[k];for(let t=0;t<n;t++){v=(v+d+n)%n;if(Prog.can(k,v)){style[k]=v;break}}buildCust();return}
 if(e.target.id==="genBtn"){style.g=style.g?0:1;buildCust()}});
function previewLoop(){if(!$("custom").classList.contains("hidden")){drawAvatar("prev");requestAnimationFrame(previewLoop)}}
$("custBtn").onclick=()=>{backup={...style};ctab="Face";showPanel("custom");buildCust();previewLoop()};
$("custApply").onclick=()=>{saveStyle();showPanel("home")};
$("custCancel").onclick=()=>{Object.assign(style,backup||{});showPanel("home")};
$("custReset").onclick=()=>{Object.assign(style,{g:0,sk:2,eyes:0,ec:0,brow:0,mouth:0,face:0,hs:0,hc:0,topS:0,color:0,pants:0,shoes:0,hat:0,glasses:0,acc:0,cape:0,fx:0});buildCust()};
$("custRand").onclick=()=>{for(const k in Prog.LOOK){const ok=Prog.LOOK[k].o.map((o,i)=>i).filter(i=>Prog.can(k,i));style[k]=ok[Math.floor(Math.random()*ok.length)]}style.g=Math.random()<.5?1:0;buildCust()};
$("custShop").onclick=()=>{saveStyle();Prog.open("shop")};
sanitizeStyle();window.GAME={showPanel,drawAvatar,applySettings,celebrate,confetti,sfx};Prog.init(window.GAME);applySettings();
document.addEventListener("click",e=>{if(e.target.tagName==="INPUT")return;if(e.target.blur)e.target.blur();window.focus()});
updateHUD();showPanel("home");requestAnimationFrame(loop);
})();
