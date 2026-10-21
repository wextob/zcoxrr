(()=>{"use strict";
const C=window.CONFIG,W=240,H=160,SK="akkualu_save_v1",PK="akkualu_prefs_v1",CL=C.colors;
const $=id=>document.getElementById(id),cv=$("c"),ctx=cv.getContext("2d"),tcv=$("t"),tctx=tcv.getContext("2d");
const P=C.placeOrder,MEM={},AREA={};P.forEach(p=>AREA[p]=[]);C.memories.forEach(m=>{MEM[m.id]=m;AREA[m.scene].push(m.id)});
const TOTAL=C.memories.length;
const DOORS=[{id:"chat",x:36,y:90,c:"#6aa7ff"},{id:"rave",x:120,y:84,c:"#e25a7a"},{id:"winter",x:204,y:90,c:"#a8d8ff"},{id:"garden",x:60,y:138,c:"#ff9ccf"},{id:"universe",x:180,y:138,c:"#8f6bff"},{id:"date",x:120,y:138,c:"#ffb86b"}];
const DG=["catch","match","dance"],dg={};let ds=false,mg=null,mt=0;
let state="title",scene="hub",t=0,last=0,px=120,py=116,face=1,moving=false,walkT=0,got=new Set(),ended=false,sound=true,pc=false,dlg=null,tr=null,fx=null,intro=false,ei=0,ep=0,fin=false,endMove=false,lockCd=0,near=null,ac=null,bc="",hc="";
const kb={},tc={},parts=[];
const has=id=>got.has(id),areaDone=a=>a==="date"?DG.every(g=>dg[g]>0):AREA[a].every(has),locked=a=>a==="universe"&&P.slice(0,4).some(x=>!areaDone(x));
/* ---------- save / prefs (safe against corrupt data) ---------- */
function load(){try{const d=JSON.parse(localStorage.getItem(SK));if(d&&Array.isArray(d.got))d.got.forEach(i=>{if(MEM[i])got.add(i)});ended=!!(d&&d.ended);if(d&&d.dg)DG.forEach(g=>{const v=+d.dg[g];if(v>=1&&v<=3)dg[g]=v|0});ds=!!(d&&d.ds)}catch(e){got.clear();ended=false}
 pc=false;try{const p=JSON.parse(localStorage.getItem(PK));if(p&&typeof p.sound==="boolean")sound=p.sound}catch(e){}}
function save(){try{localStorage.setItem(SK,JSON.stringify({got:[...got],ended,dg,ds}))}catch(e){}}
function prefs(){try{localStorage.setItem(PK,JSON.stringify({sound,pc}))}catch(e){}}
/* ---------- audio (synth, optional) ---------- */
function audio(){if(ac===null){try{ac=new(window.AudioContext||window.webkitAudioContext)()}catch(e){ac=false}}if(ac&&ac.state==="suspended")ac.resume()}
const AU=C.audio||{},SV=Math.max(0,Math.min(1,AU.sfxVolume==null?1:AU.sfxVolume));let bgm=null,bgmOk=false;
function initBgm(){if(bgm!==null||!AU.music)return;try{bgm=new Audio(AU.music);bgm.loop=true;bgm.preload="auto";bgm.volume=Math.max(0,Math.min(1,AU.musicVolume==null?.5:AU.musicVolume));
 bgm.addEventListener("canplay",()=>{bgmOk=true});bgm.addEventListener("error",()=>{bgmOk=false;bgm=false})}catch(e){bgm=false}}
function playBgm(){if(bgm&&sound){const p=bgm.play();if(p&&p.catch)p.catch(()=>{})}}
function sfx(k){if(!sound||!ac)return;const n={get:[523,659,784,1047],ui:[440],ok:[392,523,659]}[k]||[];n.forEach((f,i)=>{try{const o=ac.createOscillator(),g=ac.createGain(),s=ac.currentTime+i*.09;o.type="triangle";o.frequency.value=f;g.gain.setValueAtTime(.22*SV,s);g.gain.exponentialRampToValueAtTime(.0001,s+.2);o.connect(g);g.connect(ac.destination);o.start(s);o.stop(s+.2)}catch(e){}})}
/* ---------- drawing helpers ---------- */
const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x|0,y|0,w,h)};
function sky(a,b,h){const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,a);g.addColorStop(1,b);ctx.fillStyle=g;ctx.fillRect(0,0,W,h)}
function stars(n,h){for(let i=0;i<n;i++)if(Math.sin(t*2+i*1.7)>-.3)R(i*53%W,i*29%h,i%7?1:2,i%7?1:2,i%3?"#fff":"#ffe9a8")}
function disc(cx,cy,r,c){for(let y=-r;y<=r;y++){const w=Math.sqrt(r*r-y*y)|0;R(cx-w,cy+y,2*w,1,c)}}
function heart(x,y,c,s){R(x+s,y,2*s,s,c);R(x+4*s,y,2*s,s,c);R(x,y+s,7*s,2*s,c);R(x+s,y+3*s,5*s,s,c);R(x+2*s,y+4*s,3*s,s,c)}
let tn=0;const TQ=[];
function txt(s,x,y,z,c,a,ol){const o=TQ[tn]||(TQ[tn]={});o.s=s;o.x=x;o.y=y;o.z=z;o.c=c;o.a=a||"center";o.ol=ol!==false;tn++}
const label=(s,x,y)=>txt(s,x,y,9,"#fff");
function flushText(){const sc=tcv.width/W;tctx.clearRect(0,0,tcv.width,tcv.height);tctx.lineJoin="round";
 for(let i=0;i<tn;i++){const o=TQ[i],z=o.z*sc;tctx.font="bold "+z+'px "Trebuchet MS",system-ui,sans-serif';tctx.textAlign=o.a;
  if(o.ol){tctx.lineWidth=Math.max(2,z*.3);tctx.strokeStyle="rgba(25,8,35,.9)";tctx.strokeText(o.s,o.x*sc,o.y*sc)}tctx.fillStyle=o.c;tctx.fillText(o.s,o.x*sc,o.y*sc)}tn=0}
function poly(p,a){ctx.strokeStyle="rgba(255,233,168,"+a+")";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)ctx.lineTo(p[i][0],p[i][1]);ctx.stroke();for(const q of p)R(q[0]-1,q[1]-1,2,2,"#fff6b0")}
function token(x,y,hrt){const b=Math.sin(t*4)*2;ctx.globalAlpha=.25+.15*Math.sin(t*5);R(x-10,y-20+b,20,20,hrt?"#ff8fb8":"#ffe27a");ctx.globalAlpha=1;
 if(hrt){heart(x-7,y-16+b,"#ff4f8b",2);R(x-5,y-14+b,2,2,"#fff")}else{R(x-1,y-18+b,2,14,"#fff6b0");R(x-7,y-12+b,14,2,"#fff6b0");R(x-3,y-14+b,6,6,"#ffd23f")}}
function person(x,y,hair,shirt,dir,wt,girl){const b=wt&&Math.sin(wt*1.5)>0?1:0;x|=0;y|=0;
 R(x-5,y-2,10,3,"rgba(0,0,0,.25)");R(x-3,y-4,2,4-b,"#3a3358");R(x+1,y-4,2,3+b,"#3a3358");
 R(x-4,y-10-b,8,7,shirt);R(x-4,y-17-b,8,7,"#ffd7b8");R(x-4,y-18-b,8,3,hair);R(x-5,y-17-b,1,girl?9:3,hair);R(x+4,y-17-b,1,girl?9:3,hair);
 R(x-2+dir,y-14-b,1,2,"#222");R(x+1+dir,y-14-b,1,2,"#222");R(x-3,y-12-b,1,1,"#ff9ab0");R(x+3,y-12-b,1,1,"#ff9ab0");
 if(girl){R(x+2,y-21-b,4,3,"#ff5c93");R(x-1,y-21-b,2,3,"#ff5c93")}}
const aliNpc=(x,y,d)=>person(x,y,CL.aliHair,CL.aliShirt,d,0,false);
function floatHearts(n,c){ctx.globalAlpha=.55;for(let i=0;i<n;i++)heart((i*47+Math.sin(t+i)*8)%W|0,H-(t*14+i*31)%H,c,1);ctx.globalAlpha=1}
/* ---------- scene backgrounds ---------- */
const tree=(x,y)=>{R(x+4,y,4,8,"#8a5a3c");R(x-2,y-12,16,14,"#3f9c5a");R(x,y-16,12,6,"#52b56d")};
function dHub(){sky("#ff9a8b","#ffd3a5",64);disc(120,50,14,"#fff2b0");R(20,22,30,6,"#fff5");R(180,30,36,6,"#fff5");R(0,60,W,100,"#7ed08a");
 for(let i=0;i<40;i++)R(i*37%W,62+i*23%96,2,2,i%3?"#a6e6a0":"#ffb3d1");
 R(112,66,16,94,"#f2dca8");R(20,100,200,10,"#f2dca8");
 tree(12,122);tree(218,122);tree(150,108);
 for(const d of DOORS){const L=locked(d.id),x=d.x,y=d.y;R(x-10,y-20,20,20,L?"#4b3f7a":d.c);R(x-12,y-25,24,6,"#0005");R(x-3,y-11,6,11,"#2a1b4a");R(x-8,y-16,4,4,"#ffe9a8");R(x+4,y-16,4,4,"#ffe9a8");
  if(L){R(x-4,y-36,8,7,"#ccc");R(x-3,y-40,6,4,"#999")}else if(areaDone(d.id))heart(x-3,y-36,"#ff5c93",1);
  if(!L){ctx.globalAlpha=.16+.08*Math.sin(t*2+x);R(x-14,y-26,28,34,"#ffcf8a");ctx.globalAlpha=1}txt(C.short[d.id],x,y+11,9,L?"#cbb8ff":"#fff")}
 floatHearts(6,"#ff8fb8")}
function dChat(){sky("#0b0a2a","#2b1f5e",100);stars(70,100);R(0,100,W,60,"#1b1745");for(let i=0;i<12;i++)R(i*20,100,1,60,"#2e2766");for(let j=0;j<4;j++)R(0,100+j*16,W,1,"#2e2766");
 const f=Math.sin(t*2)*2|0;R(80,24+f,80,56,"#f4eeff");R(80,24+f,80,9,"#8f6bff");R(84,27+f,3,3,"#fff");R(88,27+f,3,3,"#fff");
 R(86,38+f,34,8,"#bfe0ff");R(112,50+f,36,8,"#ffc2dd");R(86,62+f,28,8,(t*2|0)%2?"#bfe0ff":"#a9c3e0");
 for(let i=0;i<3;i++)R(124+i*5,66+f,2,2,Math.sin(t*5+i)>0?"#8f6bff":"#cbb8ff");
 ctx.globalAlpha=.2;R(100,84,40,16,"#ffe27a");ctx.globalAlpha=1;aliNpc(200,134,-1)}
function dRave(){R(0,0,W,H,"#1a0f2b");R(0,0,W,17,"#3a1450");for(let i=0;i<30;i++)R(i*8+2,13,3,3,(i+(t*3|0))%2?"#ffe27a":"#ff7aa8");
 txt("R  A  V  E",120,12,11,"#ffe27a");
 R(58,26,124,52,"#0a0614");ctx.globalAlpha=.65+.15*Math.sin(t*3);R(62,30,116,44,"#9fd0ff");ctx.globalAlpha=1;heart(112,42,"#ffb3d1",2);
 for(const p of [[14,24,"#e25a7a"],[34,24,"#6aa7ff"],[196,24,"#ffcf5a"],[216,24,"#8f6bff"]]){R(p[0],p[1],16,24,p[2]);disc(p[0]+8,p[1]+10,4,"#fff8");R(p[0]+3,p[1]+18,10,2,"#fff")}
 R(0,84,W,76,"#4a1d4f");R(84,84,72,76,"#7a2a58");
 for(const s of [[40,104],[156,104],[40,126],[156,126]]){R(s[0],s[1]-6,44,6,"#8e2a48");R(s[0],s[1],44,8,"#c23b5a");for(let i=0;i<4;i++)R(s[0]+i*11,s[1]+8,1,0,"#000")}
 R(4,98,28,32,"#e0a84a");R(8,104,20,10,"#222");R(8,118,20,3,"#ffe9a8");label("TICKETS",18,96);ctx.globalAlpha=.07;ctx.beginPath();ctx.moveTo(62,76);ctx.lineTo(178,76);ctx.lineTo(220,160);ctx.lineTo(20,160);ctx.fill();ctx.globalAlpha=1}
const CP=[[30,18],[62,34],[92,16],[124,38],[160,20],[204,32]];
function dWinter(){sky("#0a1030","#34467e",96);stars(50,70);disc(200,26,10,"#fff6d5");disc(205,23,9,"#18205a");
 R(0,92,W,68,"#e9f2ff");R(0,92,W,3,"#fff");R(0,40,64,56,"#5b3a2e");R(-4,32,72,10,"#d9e4f5");R(18,56,28,22,"#ffd27a");R(31,56,2,22,"#8a5a3c");R(18,66,28,2,"#8a5a3c");
 R(140,108,56,30,"#e25a7a");R(140,116,56,3,"#ffd0dc");R(140,126,56,3,"#ffd0dc");
 R(16,112,24,10,"#8a5a3c");R(20,106,6,6,"#fff");R(30,106,6,6,"#ffb3d1");R(22,100-(t*8%6|0),1,3,"#fff8");
 R(166,114,8,14,"#222");R(167,115,6,12,"#7ad0ff");ctx.globalAlpha=.25+.15*Math.sin(t*4);R(160,108,20,26,"#7ad0ff");ctx.globalAlpha=1;
 const n=fx?fx.t/2.2:(has("winter")?1:0)*(CP.length-1)/(CP.length-1);if(n>0){const k=n*(CP.length-1);ctx.strokeStyle="rgba(255,226,122,.85)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(CP[0][0],CP[0][1]);
  for(let i=1;i<CP.length;i++){const f=Math.min(1,Math.max(0,k-(i-1)));if(f<=0)break;ctx.lineTo(CP[i-1][0]+(CP[i][0]-CP[i-1][0])*f,CP[i-1][1]+(CP[i][1]-CP[i-1][1])*f)}ctx.stroke();for(let i=0;i<CP.length;i++)if(k>=i-.01)R(CP[i][0]-1,CP[i][1]-1,3,3,"#fff6b0")}
 for(let i=0;i<60;i++)R(((i*41+Math.sin(t+i)*6)%W+W)%W,(t*(12+i%4*5)+i*37)%H,i%5?1:2,i%5?1:2,"#fff")}
function dGarden(){sky("#c9a8ff","#ffc2dd",70);stars(14,40);R(0,58,W,102,"#69c47a");const fc=["#fff","#ff9ccf","#ffe27a","#c9a8ff"];
 for(let i=0;i<60;i++){const x=i*47%W,y=62+i*31%92;R(x,y,2,2,fc[i%4]);R(x+1,y+2,1,2,"#3b8a4f")}
 for(let i=0;i<22;i++){ctx.globalAlpha=.5+.4*Math.sin(t*2+i);R(20+i*9,116+Math.sin(i*.5)*18,5,3,"#fff3b0")}ctx.globalAlpha=1;
 for(const b of SC.garden.solids){R(b[0],b[1],b[2],b[3],"#3b8a4f");R(b[0]+2,b[1]-3,b[2]-4,5,"#58b86a")}
 for(let i=0;i<14;i++){const x=(i*67+Math.sin(t*.7+i)*14)%W,y=64+(i*41%86)+Math.cos(t*.9+i*2)*8;if(Math.sin(t*3+i)>-.2){ctx.globalAlpha=.3;R(x-1,y-1,4,4,"#fff7a0");ctx.globalAlpha=1;R(x,y,2,2,"#fff7a0")}}}
const UC=[[[20,20],[44,34],[70,18],[96,40]],[[150,14],[176,30],[210,16],[226,40]]];
function dUni(){sky("#060524","#2b1a5e",H);stars(90,H);disc(30,30,10,"#ff9ccf");R(16,29,28,2,"#ffe9a8");disc(200,34,7,"#7ad0ff");disc(150,18,4,"#ffd27a");poly(UC[0],.35);poly(UC[1],.35);
 for(const o of [10,150]){R(o,92,80,38,"#69c47a");R(o,128,80,3,"#8fe09a");R(o+2,131,76,6,"#6b4a3a");R(o+14,137,52,8,"#5a3d30");R(o+28,145,24,7,"#4a3228")}
 R(24,70,22,20,"#ffe9d0");R(20,64,30,8,"#e25a7a");R(32,78,6,12,"#2a1b4a");R(194,70,22,20,"#ffe9d0");R(190,64,30,8,"#6aa7ff");R(202,78,6,12,"#2a1b4a");
 ctx.globalAlpha=.5+.2*Math.sin(t*3);R(88,106,64,16,"#ffe9a8");ctx.globalAlpha=1;R(90,110,60,8,"#fff3c4");
 for(let i=0;i<8;i++)R(92+i*8,104+Math.sin(t*3+i)*2,2,2,"#fff");aliNpc(204,122,-1)}
function dDate(){sky("#3a1d4a","#ff9a8b",72);stars(16,40);disc(206,34,8,"#fff2c8");R(0,70,W,90,"#6fbf73");
 for(let i=0;i<50;i++)R(i*43%W,72+i*29%86,2,2,["#fff","#ffb3d1","#ffe27a"][i%3]);
 for(let i=0;i<24;i++){const x=i*10+2,y=8+Math.sin(i*.5)*5;R(x,y,6,1,"#3a2a2a");R(x+2,y+1,3,3,(i+(t*2|0))%3?"#ffe27a":"#ff9ccf")}
 R(86,122,70,28,"#e25a7a");for(let i=0;i<7;i+=2)R(86+i*10,122,10,28,"#fff4");R(94,128,12,8,"#c98d5a");R(160,128,6,8,"#ffd27a");ctx.globalAlpha=.2+.1*Math.sin(t*3);disc(163,132,14,"#ffd27a");ctx.globalAlpha=1;
 R(46,76,4,26,"#8a5a3c");heart(37,62+Math.sin(t*2),"#ff4f8b",3);label("Heart Catch",48,56);
 R(100,86,40,10,"#c98d5a");R(104,80,8,8,"#fff");R(116,80,8,8,"#ffd0dc");R(128,80,8,8,"#fff");label("Match Pairs",120,76);
 R(176,100,32,6,"#a06bd0");R(178,94,28,6,"#c9a8ff");R(191,82,2,12,"#ffd23f");R(187,87,10,2,"#ffd23f");label("Star Dance",192,78);
 person(150,138,CL.aliHair,CL.aliShirt,-1,0,false)}
/* ---------- ending scene ---------- */
const hx=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
function mix(a,b,p){a=hx(a);b=hx(b);return"rgb("+a.map((v,i)=>v+(b[i]-v)*p|0).join(",")+")"}
function dEnd(){const p=ep;sky(mix("#0b0a2a","#ff9a8b",p),mix("#2b1a5e","#ffe0b0",p),H);ctx.globalAlpha=1-p*.85;stars(80,110);ctx.globalAlpha=1;
 disc(120,150-p*60,16,"#fff2b0");R(0,126,W,34,mix("#1b1745","#7ed08a",p));
 for(let i=0;i<24;i++){const s=(i+(t*3|0))%3?2:3;R(10+i*9.5,112+Math.sin(i*.7+t*2)*1.5,s,s,"#fff6b0")}ctx.globalAlpha=.4;R(8,114,224,2,"#ffe9a8");ctx.globalAlpha=1;
 const ax=30+82*p,bx=210-82*p,w=endMove?t*8:0;person(ax,114,CL.aliHair,CL.aliShirt,1,w,false);person(bx,114,CL.herHair,CL.herShirt,-1,w,true);
 floatHearts(p>.95?9:3,"#ff8fb8");if(p>.95)heart(116,84+Math.sin(t*3)*2,"#ff4f8b",2)}
const SC={hub:{top:80,exitY:999,solids:[[26,84,20,6],[110,78,20,6],[194,84,20,6],[50,132,20,6],[170,132,20,6],[110,132,20,6],[12,114,12,10],[218,114,12,10],[150,100,12,10]],draw:dHub},
 chat:{top:100,exitY:153,solids:[],draw:dChat},
 rave:{top:94,exitY:153,solids:[[4,98,28,32],[40,104,44,8],[156,104,44,8],[40,126,44,8],[156,126,44,8]],draw:dRave},
 winter:{top:96,exitY:153,solids:[[16,110,24,12]],draw:dWinter},
 garden:{top:62,exitY:153,solids:[[100,70,20,10],[10,92,16,12],[212,92,16,12],[104,128,26,10]],draw:dGarden},
 universe:{top:0,exitY:128,exitMaxX:90,walk:[[10,92,80,38],[90,108,60,12],[150,92,80,38]],solids:[[24,84,22,8],[194,84,22,8]],draw:dUni}};
SC.date={top:70,exitY:153,solids:[[38,96,20,10],[102,84,36,12],[178,96,28,10]],draw:dDate};
const SPAWN={chat:[36,138],universe:[36,114]};
const ITEMS={hub:[{x:120,y:104,fin:1}],
 chat:[{x:120,y:108,mem:"chat"},{x:200,y:134,npc:1,say:C.npc.chat}],
 rave:[{x:120,y:102,mem:"rave"}],winter:[{x:170,y:124,mem:"winter",fx:1}],
 garden:[{x:40,y:76,mem:"h1",heart:1},{x:200,y:74,mem:"h2",heart:1},{x:122,y:108,mem:"h3",heart:1},{x:48,y:134,mem:"h4",heart:1},{x:196,y:136,mem:"h5",heart:1}],
 universe:[{x:120,y:114,mem:"universe"},{x:204,y:122,npc:1,say:C.npc.universe}]};
ITEMS.date=[{x:48,y:114,mini:"catch"},{x:120,y:104,mini:"match"},{x:192,y:114,mini:"dance"},{x:150,y:138,npc:1,say:C.date.aliLines}];
const vis=it=>it.fin?got.size===TOTAL:it.npc||!it.heart||!has(it.mem);
/* ---------- cozy extras: warm glow, dust motes, soft music ---------- */
let vg=null;const PEN=[262,294,330,392,440,523,587];
function cozy(){if(!vg){vg=ctx.createRadialGradient(120,80,50,120,80,150);vg.addColorStop(0,"rgba(255,170,90,0)");vg.addColorStop(1,"rgba(60,15,40,.38)")}
 ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);for(let i=0;i<14;i++){ctx.globalAlpha=.25+.25*Math.sin(t*2+i);R((i*61+t*6+Math.sin(t*.6+i)*10)%W,H-(i*43+t*9)%H,2,2,"#ffe9b0")}ctx.globalAlpha=1}
function note(){try{const o=ac.createOscillator(),g=ac.createGain(),s=ac.currentTime;o.type="sine";o.frequency.value=PEN[Math.random()*PEN.length|0]*(Math.random()<.2?.5:1);g.gain.setValueAtTime(.0001,s);g.gain.linearRampToValueAtTime(.025,s+.05);g.gain.exponentialRampToValueAtTime(.0001,s+1.6);o.connect(g);g.connect(ac.destination);o.start(s);o.stop(s+1.7)}catch(e){}}
/* ---------- Dream Date mini-games ---------- */
const GAMES={catch:{name:"Heart Catch",dur:25,how:["Left / Right or drag to move.","Catch the falling hearts!","Gold ones are worth more."]},
 match:{name:"Match the Pairs",how:["Find the matching cards.","Arrows + A, or just tap a card.","Take all the time you like."]},
 dance:{name:"Star Dance",dur:30,how:["Tap a lane when a star hits the glow.","Left / Up / Right keys work too.","No pressure, just dance!"]}};
const LX=[60,120,180];
function startMini(id){const c=[0,0,1,1,2,2,3,3];for(let i=7;i>0;i--){const j=Math.random()*(i+1)|0,x=c[i];c[i]=c[j];c[j]=x}
 mg={id,ph:"intro",t:0,sc:0,tl:0,sp:.3,bx:120,tx:null,drag:false,fl:[],cards:c,up:new Array(8).fill(false),sel:[],lock:0,cur:0,moves:0,ar:0,ln:"",lt:0,stars:0};state="mini";near=null;clearKeys()}
function leaveMini(){mg=null;state="play";clearKeys()}
function react(m){m.ar=.6;if(m.lt<=0){m.ln=C.date.live[Math.random()*C.date.live.length|0];m.lt=1.4}}
function finishMini(){const m=mg;let s=1;if(m.id==="catch")s=m.sc>=24?3:m.sc>=12?2:1;else if(m.id==="dance")s=m.sc>=30?3:m.sc>=16?2:1;else s=m.moves<=8?3:m.moves<=12?2:1;
 m.ph="done";m.stars=s;dg[m.id]=Math.max(dg[m.id]||0,s);save();m.ln=C.date.end[s-1];m.lt=99;m.ar=2;sfx("ok");burst(120,90)}
function mgAct(){const m=mg;if(!m)return;if(m.ph==="intro"){m.ph="play";m.tl=GAMES[m.id].dur||0;sfx("ui")}else if(m.ph==="done")leaveMini();else if(m.id==="match")flip(m.cur);else if(m.id==="dance")hit(1)}
function mgPress(d){const m=mg;if(!m||m.ph!=="play")return;if(m.id==="dance")hit(d==="left"?0:d==="right"?2:1);else if(m.id==="match"){let r=m.cur>>2,c=m.cur&3;if(d==="left")c=(c+3)&3;else if(d==="right")c=(c+1)&3;else r^=1;m.cur=r*4+c}}
function mgTap(x,y){const m=mg;if(!m)return;if(m.ph!=="play"){mgAct();return}
 if(m.id==="catch"){m.drag=true;m.tx=x}else if(m.id==="dance")hit(x<90?0:x<150?1:2);else for(let i=0;i<8;i++){const a=52+(i&3)*36,b=40+(i>>2)*44;if(x>=a&&x<=a+28&&y>=b&&y<=b+34){m.cur=i;flip(i);break}}}
function hit(l){const m=mg;if(!m||m.ph!=="play")return;let b=-1,bd=18;for(let i=0;i<m.fl.length;i++){const d=Math.abs(m.fl[i].y-128);if(m.fl[i].l===l&&d<bd){bd=d;b=i}}
 if(b>=0){m.fl.splice(b,1);m.sc++;burst(LX[l],126);react(m);sfx("ui")}}
function flip(i){const m=mg;if(!m||m.ph!=="play"||m.lock>0||m.up[i])return;m.up[i]=true;m.sel.push(i);sfx("ui");
 if(m.sel.length===2){m.moves++;const a=m.sel[0],b=m.sel[1];if(m.cards[a]===m.cards[b]){m.sel=[];burst(52+(i&3)*36+14,40+(i>>2)*44+17);react(m);sfx("get");if(m.up.every(Boolean))finishMini()}else m.lock=.8}}
function updMini(dt){const m=mg;m.t+=dt;if(m.ph!=="done"&&m.lt>0)m.lt-=dt;if(m.ar>0)m.ar-=dt;if(m.ph!=="play")return;const G=GAMES[m.id];
 if(G.dur){m.tl-=dt;if(m.tl<=0){finishMini();return}}
 if(m.id==="catch"){const mv=dir("right")-dir("left");if(m.tx!==null)m.bx+=(m.tx-m.bx)*Math.min(1,dt*10);m.bx=Math.max(14,Math.min(W-14,m.bx+mv*110*dt));
  m.sp-=dt;if(m.sp<=0){m.sp=.55;m.fl.push({x:16+Math.random()*(W-32),y:-6,v:45+Math.random()*30,k:Math.random()<.2?1:0})}
  for(let i=m.fl.length-1;i>=0;i--){const f=m.fl[i];f.y+=f.v*dt;if(f.y>=126&&f.y<=140&&Math.abs(f.x-m.bx)<14){m.sc+=f.k?3:1;burst(f.x,f.y);react(m);sfx("ui");m.fl.splice(i,1)}else if(f.y>H)m.fl.splice(i,1)}}
 else if(m.id==="dance"){m.sp-=dt;if(m.sp<=0){m.sp=.65;m.fl.push({l:Math.random()*3|0,y:-6})}for(let i=m.fl.length-1;i>=0;i--){m.fl[i].y+=70*dt;if(m.fl[i].y>152)m.fl.splice(i,1)}}
 else if(m.lock>0){m.lock-=dt;if(m.lock<=0){m.up[m.sel[0]]=false;m.up[m.sel[1]]=false;m.sel=[]}}}
function star(x,y,on){const c=on?"#ffd23f":"#5a4a7a";R(x-1,y-6,2,12,c);R(x-6,y-1,12,2,c);R(x-3,y-3,6,6,c)}
function card(a,st){R(20,36,200,68,"#ffd6e8");R(22,38,196,64,"#2a1b4a");if(st)for(let i=0;i<3;i++)star(100+i*20,54,i<st);for(let i=0;i<a.length;i++)label(a[i],120,(st?72:52)+i*12)}
function icon(k,x,y){if(k===0)heart(x-7,y-5,"#ff4f8b",2);else if(k===1){R(x-2,y-10,4,20,"#ffb800");R(x-10,y-2,20,4,"#ffb800");R(x-6,y-6,12,12,"#ffb800")}
 else if(k===2){disc(x,y,8,"#7ab8ff");disc(x+4,y-3,7,"#fff8ee")}else{for(const q of [[0,-6],[0,6],[-6,0],[6,0]])disc(x+q[0],y+q[1],4,"#ff9ccf");disc(x,y,3,"#ffd23f")}}
function drawMini(){const m=mg,G=GAMES[m.id];sky("#2b1633","#ff9a8b",112);stars(18,50);R(0,112,W,48,"#5a3344");R(0,112,W,2,"#ffcf8a");
 for(let i=0;i<24;i++){const x=i*10+2,y=6+Math.sin(i*.5)*4;R(x,y,6,1,"#3a2a2a");R(x+2,y+1,3,3,(i+(t*2|0))%3?"#ffe27a":"#ff9ccf")}
 label(G.name,120,26);label((m.id==="match"?"Moves ":"Score ")+(m.id==="match"?m.moves:m.sc),206,26);
 if(m.ph==="play"&&G.dur){R(60,30,120,4,"#0006");R(60,30,120*Math.max(0,m.tl)/G.dur,4,"#ffe27a")}
 if(m.id==="catch"){for(const f of m.fl)heart(f.x-3,f.y,f.k?"#ffd23f":"#ff4f8b",1);R(m.bx-9,134,18,6,"#c98d5a");R(m.bx-9,134,18,1,"#e0a96a")}
 else if(m.id==="dance"){for(let i=0;i<3;i++){ctx.globalAlpha=.12;R(LX[i]-14,40,28,100,"#fff");ctx.globalAlpha=1;R(LX[i]-11,124,22,8,"#ffe9a8");txt(["<","^",">"][i],LX[i],132,10,"#2a1b4a","center",false)}
  for(const n of m.fl){const x=LX[n.l];R(x-1,n.y-7,2,14,"#fff6b0");R(x-7,n.y-1,14,2,"#fff6b0");R(x-3,n.y-3,6,6,"#ffd23f")}}
 else for(let i=0;i<8;i++){const x=52+(i&3)*36,y=40+(i>>2)*44;if(m.up[i]){R(x,y,28,34,"#fff8ee");icon(m.cards[i],x+14,y+17)}else{R(x,y,28,34,"#d9568a");R(x+3,y+3,22,28,"#f08ab4");heart(x+10,y+12,"#fff",1)}
  if(i===m.cur&&m.ph==="play"){const c="#ffe27a";R(x-3,y-3,34,2,c);R(x-3,y+35,34,2,c);R(x-3,y-3,2,40,c);R(x+29,y-3,2,40,c)}}
 const ax=m.id==="catch"?m.bx:m.id==="dance"?120:28,ay=m.ar>0?150-Math.abs(Math.sin(t*14))*3:150;
 person(ax,ay,CL.herHair,CL.herShirt,1,0,true);if(m.id!=="match"){R(ax-8,ay-26,2,8,"#ffd7b8");R(ax+6,ay-26,2,8,"#ffd7b8")}
 const ab=m.ar>0?Math.abs(Math.sin(t*12))*3:Math.sin(t*2)*.6;person(214,150-ab,CL.aliHair,CL.aliShirt,-1,0,false);if(m.ar>0)heart(210,112-(.6-Math.min(.6,m.ar))*14,"#ff4f8b",1);
 if(m.lt>0){const w=m.ln.length*5.3+10,l=Math.max(2,Math.min(W-w-2,214-w/2));R(l-1,107,w+2,16,"#2a1b4a");R(l,108,w,14,"#fff8ee");txt(m.ln,l+w/2,118,9,"#2a1b4a","center",false)}
 for(const p of parts)R(p.x,p.y,2,2,p.c);
 if(m.ph==="intro")card([G.name,G.how[0],G.how[1],G.how[2],"Press A / tap to start"]);
 else if(m.ph==="done")card(["Nice one, Akku!",m.id==="match"?"Moves: "+m.moves:"Score: "+m.sc,"Press A / tap to continue"],m.stars)}
/* ---------- dialogue ---------- */
function say(lines,name,cb,skip){dlg={q:lines.slice(),i:0,name,cb,c:[],n:0,sh:-1};$("dname").textContent=name;$("dskip").hidden=!skip;$("dlg").hidden=false;state="dialog";nextLine()}
function nextLine(){if(dlg.i>=dlg.q.length){endDlg();return}dlg.c=Array.from(dlg.q[dlg.i++]);dlg.n=0;dlg.sh=-1}
function advance(){if(!dlg)return;if(dlg.n<dlg.c.length)dlg.n=dlg.c.length;else{sfx("ui");nextLine()}}
function endDlg(){const cb=dlg&&dlg.cb;dlg=null;$("dlg").hidden=true;if(state==="dialog")state="play";if(cb)cb()}
/* ---------- game flow ---------- */
function burst(x,y){const c=["#ffe27a","#ff9ccf","#fff","#9ad7ff"];for(let i=0;i<28&&parts.length<150;i++){const a=Math.random()*6.28,s=20+Math.random()*40;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-20,l:1,c:c[i%4]})}}
function go(id,x,y){if(tr)return;tr={t:0,cb:()=>{scene=id;px=x;py=y;near=null;fx=null;if(id==="date"&&!ds){ds=true;save();say(C.date.intro,"✦")}}};state="trans"}
function interact(it){if(it.mini){startMini(it.mini);return}if(it.npc){say(it.say,C.ali.name);return}if(it.fin){startEnding();return}
 if(has(it.mem)){say([MEM[it.mem].text],MEM[it.mem].title);return}
 if(it.fx){fx={t:0,id:it.mem};state="fx"}else collect(it.mem)}
function collect(id){got.add(id);save();burst(px,py-14);sfx("get");
 say([MEM[id].text],MEM[id].title,()=>{if(got.size===TOTAL)startEnding();else if(id!=="universe"&&P.slice(0,4).every(areaDone)&&P.slice(0,4).some(a=>AREA[a].includes(id)))say([C.msgs.unlocked],"✦")})}
function act(){if(state==="play"&&near)interact(near)}
function startEnding(){closePanels();state="ending";ei=0;ep=0;fin=false;ended=true;save();$("final").hidden=true;$("end").hidden=false;setLine();sfx("ok")}
function setLine(){const e=$("etext");e.textContent=C.letter[ei];e.classList.remove("fade");void e.offsetWidth;e.classList.add("fade");$("enext").textContent=ei===C.letter.length-1?"Finish ▶":"Continue ▶"}
function endNext(){if(state!=="ending"||fin)return;sfx("ui");if(ei<C.letter.length-1){ei++;setLine()}else{fin=true;$("end").hidden=true;$("final").hidden=false;sfx("get")}}
function openPanel(id){if(state!=="play")return;state="pause";$(id).hidden=false;if(id==="journal")renderJournal()}
function closePanels(){$("pause").hidden=true;$("journal").hidden=true;if(state==="pause")state="play"}
function renderJournal(){const el=$("jlist");el.textContent="";for(const id of P){const h=document.createElement("h3");h.textContent=C.places[id]+(areaDone(id)?" ✓":locked(id)?" (locked)":"");el.append(h);
 for(const k of AREA[id]){const m=MEM[k],b=document.createElement("button"),o=has(k);b.textContent=o?m.title:"? ? ?";b.disabled=!o;b.onclick=()=>{closePanels();say([m.text],m.title)};el.append(b)}}const h=document.createElement("h3");h.textContent=C.places.date;el.append(h);
 for(const g of DG){const q=document.createElement("p");q.style.textAlign="left";q.textContent=GAMES[g].name+": "+"★".repeat(dg[g]||0)+"☆".repeat(3-(dg[g]||0));el.append(q)}
 $("jfinal").disabled=got.size<TOTAL}
function showTitle(){state="title";$("title").hidden=false;const p=got.size||ended;$("bStart").textContent=p?"Continue":"Start Game";$("bReset").hidden=!p}
function resetAll(){got.clear();ended=false;DG.forEach(g=>delete dg[g]);ds=false;mg=null;save();scene="hub";px=120;py=116;fx=null;dlg=null;$("dlg").hidden=true;$("end").hidden=true;$("final").hidden=true;closePanels();showTitle()}
function startGame(){audio();initBgm();playBgm();$("title").hidden=true;px=120;py=116;
 if(!got.size&&!ended){scene="chat";intro=true;say(C.intro,"✦",()=>{intro=false;scene="hub";px=120;py=116},true)}else{scene="hub";state="play"}}
function setMode(){pc=false}
function setSound(v){sound=v;prefs();if(bgm){if(v)playBgm();else bgm.pause()}$("bSnd").textContent="Sound: "+(v?"On":"Off")}
/* ---------- update ---------- */
function blocked(x,y){const s=SC[scene];if(x<6||x>W-6||y<s.top||y>H-3)return true;
 if(s.walk){let ok=false;for(const r of s.walk)if(x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]&&y<=r[1]+r[3]){ok=true;break}if(!ok)return true}
 for(const r of s.solids)if(x+4>r[0]&&x-4<r[0]+r[2]&&y>r[1]&&y-5<r[1]+r[3])return true;return false}
const dir=d=>kb[d]||tc[d]?1:0;
function update(dt){mt-=dt;if(mt<=0){mt=.6+Math.random()*.7;if(sound&&ac&&!bgmOk&&state!=="title")note()}if(state==="mini"&&mg)updMini(dt);
 if(dlg&&(dlg.n|0)!==dlg.sh){dlg.n=Math.min(dlg.c.length,dlg.n+dt*60);const k=dlg.n|0;if(k!==dlg.sh){dlg.sh=k;$("dtext").textContent=dlg.c.slice(0,k).join("")}}
 for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=40*dt;p.l-=dt*.9;if(p.l<=0){parts[i]=parts[parts.length-1];parts.pop()}}
 if(tr){tr.t+=dt;if(tr.t>.25&&tr.cb){tr.cb();tr.cb=null}if(tr.t>.5){tr=null;if(state==="trans")state="play"}}
 if(fx&&state==="fx"){fx.t+=dt;if(fx.t>2.4){const id=fx.id;fx=null;state="play";collect(id)}}
 if(state==="ending"){const tg=fin?1:(ei+1)/C.letter.length;endMove=tg-ep>.01;ep+=(tg-ep)*Math.min(1,dt*1.2)}
 if(lockCd>0)lockCd-=dt;
 if(state!=="play")return;
 let dx=dir("right")-dir("left"),dy=dir("down")-dir("up");moving=!!(dx||dy);
 if(moving){if(dx&&dy){dx*=.707;dy*=.707}if(dx)face=dx<0?-1:1;const sp=58*dt;let n=px+dx*sp;if(!blocked(n,py))px=n;n=py+dy*sp;if(!blocked(px,n))py=n;walkT+=dt*8}
 const s=SC[scene];
 if(scene==="hub"){for(const d of DOORS)if(px>d.x-10&&px<d.x+10&&py>=d.y&&py<=d.y+12){
   if(locked(d.id)){if(lockCd<=0){lockCd=1.5;py=d.y+16;say([C.msgs.locked],"✦")}}
   else if(lockCd<=0){const sp2=SPAWN[d.id]||[120,146];go(d.id,sp2[0],sp2[1])}break}}
 else if(py>=s.exitY&&(!s.exitMaxX||px<s.exitMaxX)){const d=DOORS.find(q=>q.id===scene);lockCd=.8;go("hub",d.x,d.y+16)}
 near=null;let bd=22;for(const it of ITEMS[scene]){if(!vis(it))continue;const d=Math.hypot(it.x-px,it.y-py);if(d<bd){bd=d;near=it}}
}
function hudText(){if(got.size===TOTAL)return"All memories found! Visit the glowing heart in the middle of the map to replay the finale.";
 if(scene==="hub"){const n=P.find(a=>!areaDone(a)&&!locked(a));return"Next: "+C.places[n]+" (Dream Date is always open)"}if(scene==="date")return"Dream Date: not a memory, just for fun! Walk to a game and press "+(pc?"E":"A")+". Exit with the button.";
 return C.places[scene]+": find the glowing memories. Exit: tap the Exit button or walk onto the glowing EXIT strip."}
/* ---------- render ---------- */
function drawExit(){const u=scene==="universe",x=u?46:120,y=u?126:154;ctx.globalAlpha=.5+.3*Math.sin(t*4);R(x-24,y,48,4,"#ffe27a");ctx.globalAlpha=1;label("EXIT",x,y-2)}
function draw(){if(state==="mini"&&mg)drawMini();else drawMain();cozy()}
function drawMain(){
 if(state==="ending"){dEnd();return}
 SC[scene].draw();
 if(state==="title"){ctx.globalAlpha=.3;R(0,0,W,H,"#1d0f22");ctx.globalAlpha=1;return}
 if(scene!=="hub")drawExit();
 for(const it of ITEMS[scene]){if(!vis(it))continue;if(it.npc||it.mini)continue;if(it.fin){heart(it.x-10,it.y-22+Math.sin(t*3)*2,"#ff4f8b",3);continue}
  if(!has(it.mem))token(it.x,it.y,it.heart)}
 if(!intro){person(px,py,CL.herHair,CL.herShirt,face,moving?walkT:0,true);
  if(near&&state==="play"){const bx=px-9,by=py-44+(Math.sin(t*6)>0?1:0);R(bx-2,by-2,22,20,"#2a1b4a");R(bx,by,18,16,"#ffe27a");R(px-2,by+16,4,3,"#ffe27a");txt("A",px,by+13,12,"#2a1b4a","center",false)}}
 for(const p of parts)R(p.x,p.y,2,2,p.c);
 if(tr){ctx.globalAlpha=1-Math.abs(tr.t-.25)/.25;R(0,0,W,H,"#1d0f22");ctx.globalAlpha=1}}
function frame(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;t+=dt;
 try{update(dt);draw()}catch(e){console.error(e)}flushText();
 const cls=(state==="title"?"title ":"")+(pc?"pc":"");if(cls!==bc){bc=cls;document.body.className=cls}
 const h=got.size+"|"+scene+"|"+state;if(h!==hc){hc=h;$("cnt").textContent="♥ "+got.size+"/"+TOTAL;$("bar").firstChild.style.width=got.size/TOTAL*100+"%";$("hint").textContent=hudText()}
 $("bX").hidden=!(scene!=="hub"&&(state==="play"||state==="mini"));
 requestAnimationFrame(frame)}
/* ---------- input ---------- */
const KM={ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down",ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right"};
function clearKeys(){for(const k in kb)kb[k]=false;for(const k in tc)tc[k]=false}
addEventListener("keydown",e=>{const k=e.code;if(KM[k]){kb[KM[k]]=true;e.preventDefault();if(state==="mini"&&!e.repeat)mgPress(KM[k]);return}
 if(e.target.tagName==="BUTTON"&&(k==="Enter"||k==="Space"))return;
 if(k==="Space")e.preventDefault();if(e.repeat)return;
 if(k==="Escape"){if(state==="play")openPanel("pause");else if(state==="pause")closePanels();else if(state==="mini")leaveMini();return}
 if(k==="Enter"||k==="Space"||k==="KeyE"){if(dlg)advance();else if(state==="ending")endNext();else if(state==="mini")mgAct();else act()}});
addEventListener("keyup",e=>{if(KM[e.code])kb[KM[e.code]]=false});
addEventListener("blur",clearKeys);document.addEventListener("visibilitychange",clearKeys);document.addEventListener("visibilitychange",()=>{if(!bgm)return;if(document.hidden)bgm.pause();else if(state!=="title")playBgm()});
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("button");if(b)b.blur()});
document.querySelectorAll("#dpad button").forEach(b=>{const d=b.dataset.d,up=()=>{tc[d]=false};
 b.addEventListener("pointerdown",e=>{e.preventDefault();tc[d]=true;audio();if(state==="mini")mgPress(d);try{b.setPointerCapture(e.pointerId)}catch(x){}});
 b.addEventListener("pointerup",up);b.addEventListener("pointercancel",up);b.addEventListener("lostpointercapture",up);b.addEventListener("contextmenu",e=>e.preventDefault())});
$("act").addEventListener("pointerdown",e=>{e.preventDefault();if(dlg)advance();else if(state==="ending")endNext();else if(state==="mini")mgAct();else act()});
$("dnext").onclick=advance;$("dskip").onclick=()=>{if(dlg){dlg.i=dlg.q.length;dlg.n=dlg.c.length;nextLine()}};
$("enext").onclick=endNext;$("bStart").onclick=startGame;
$("bReset").onclick=()=>{if(confirm("Reset all saved progress?"))resetAll()};
$("bX").onclick=()=>{if(state==="mini"){leaveMini();return}if(state==="play"&&scene!=="hub"){const d=DOORS.find(q=>q.id===scene);lockCd=.8;go("hub",d.x,d.y+16)}};
$("bP").onclick=()=>openPanel("pause");$("bJ").onclick=()=>openPanel("journal");$("bJ2").onclick=()=>{closePanels();openPanel("journal")};
$("bRes").onclick=closePanels;$("jclose").onclick=closePanels;
$("bSnd").onclick=()=>{audio();setSound(!sound);sfx("ui")};
$("bRst").onclick=()=>{if(confirm("Restart the game? All progress will be erased."))resetAll()};
$("jfinal").onclick=startEnding;$("rereplay").onclick=startEnding;
$("again").onclick=()=>{$("final").hidden=true;$("end").hidden=true;scene="hub";px=120;py=116;state="play"};

const cpos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]};
cv.addEventListener("pointerdown",e=>{if(state!=="mini"||!mg)return;e.preventDefault();audio();const p=cpos(e);mgTap(p[0],p[1])});
cv.addEventListener("pointermove",e=>{if(mg&&mg.drag)mg.tx=cpos(e)[0]});
const rel=()=>{if(mg){mg.drag=false;mg.tx=null}};["pointerup","pointercancel","pointerleave"].forEach(n=>cv.addEventListener(n,rel));
function resize(){const r=$("wrap").getBoundingClientRect(),s=Math.min(r.width/W,r.height/H),w=Math.floor(W*s),h=Math.floor(H*s),d=Math.min(window.devicePixelRatio||1,3),st=$("stage");st.style.width=w+"px";st.style.height=h+"px";tcv.width=Math.round(w*d);tcv.height=Math.round(h*d)}
addEventListener("resize",resize);addEventListener("orientationchange",()=>setTimeout(resize,200));
if(window.ResizeObserver)new ResizeObserver(resize).observe($("wrap"));
/* ---------- boot ---------- */
load();ctx.imageSmoothingEnabled=false;
$("tname").textContent=C.title;$("tsub").textContent=C.subtitle;$("ttag").textContent=C.tagline;$("ftitle").textContent=C.finalTitle;$("fsub").textContent=C.finalSub;
setMode(pc);setSound(sound);resize();showTitle();requestAnimationFrame(frame);
})();
