// حارتنا — ربط الطائرة الحربية بالمدينة الحقيقية (city.js)
import * as THREE from 'three';
import {buildAirbase,buildJet,key} from './jet.js';
import {createGame} from './flight.js';
const V=THREE.Vector3,R=(a,b)=>a+Math.random()*(b-a),DB='https://ahmad-662ee-default-rtdb.firebaseio.com',CELL=48;
const stub=(x,z)=>({position:new V(x,0,z),scale:{y:1},traverse(){}});
export function createWarJet(ctx){
  const {scene,camera,controls,canvas,toast,houses,towns,cars,landmarks,byName,writeHouse,takeOver,social,getConfig,stopAll,openShop,at}=ctx;
  let cfg={},g=null,jet=null,on=false,busy=false,ui=null,grid=new Map(),defM=[];
  const base=buildAirbase();base.group.position.set(at.x,.3,at.z);scene.add(base.group);
  const grass=new THREE.Mesh(new THREE.PlaneGeometry(190,190),new THREE.MeshStandardMaterial({color:'#6f9a52',roughness:1}));grass.rotation.x=-Math.PI/2;grass.position.set(at.x-5,.22,at.z-5);scene.add(grass);
  const spawn=base.spawn.clone().add(base.group.position),B={spawn,update:base.update};
  const ext={targets:[],zones:[],active:()=>on,near:p=>{const cx=Math.floor(p.x/CELL),cz=Math.floor(p.z/CELL),o=[];
    for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const l=grid.get((cx+i)+','+(cz+j));if(l)o.push(...l)}
    for(const t of ext.dyn){if(t.car)t.m.position.set(t.car.px||0,0,t.car.pz||0);o.push(t)}return o},dyn:[]};
  async function owns(name){try{const r=await fetch(DB+'/owned/'+encodeURIComponent(key(name))+'/f_jet.json');return r.ok&&(await r.json())===1}catch(e){toast('تعذّر التحقق من الشراء، حاول لاحقاً');return false}}
  function makeUI(){const d=document.createElement('div'),b=(t,c)=>{const e=document.createElement('button');e.textContent=t;e.style.cssText='padding:15px 12px;font-size:15px;border-radius:14px;border:0;color:#fff;background:'+(c||'#16202ccc');return e};
    d.style.cssText='position:fixed;bottom:12px;inset-inline:10px;z-index:40;display:none;flex-direction:column;gap:8px;align-items:center;direction:rtl';
    const st=document.createElement('div');st.style.cssText='background:#fffe;border-radius:12px;padding:6px 12px;font-weight:800;font-size:14px';
    const row=document.createElement('div');row.style.cssText='display:flex;gap:8px;flex-wrap:wrap;justify-content:center';
    const e=b('✈️ صعود','#1f8a4c'),x=b('✕ خروج','#b02a37'),W={};e.style.display='none';
    [['gun','🔫 رشاش'],['rk','🚀 صواريخ'],['ls','⚡ ليزر']].forEach(([w,t])=>{const q=b(t);const f=v=>ev=>{ev.preventDefault();g&&(g.key['on_'+w]=v)};q.onpointerdown=f(1);q.onpointerup=q.onpointerleave=f(0);row.append(q);W[w]=q});
    row.append(e,x);d.append(st,row);document.body.append(d);
    const m=document.createElement('div');m.style.cssText='position:fixed;top:25%;left:50%;transform:translateX(-50%);z-index:41;background:#b02a37;color:#fff;padding:12px 18px;border-radius:14px;font-weight:800;display:none;text-align:center;direction:rtl;max-width:90vw';document.body.append(m);
    e.onclick=()=>g&&g.toggle();x.onclick=exit;return{d,st,e,m}}
  const hud={msg(t){ui.m.textContent=t;ui.m.style.display='block';clearTimeout(hud.t);hud.t=setTimeout(()=>ui.m.style.display='none',3500)},
    update(S){ui.st.textContent=`❤️ ${Math.max(0,S.hp|0)} · 🔫 ${S.gun} · 🚀 ${S.rockets} · ⚡ ${S.lasers} · ⬆️ ${S.alt}م · 🏆 ${S.score}`;ui.e.style.display=S.can?'block':'none';ui.e.textContent=S.can==='land'?'🛬 هبوط':'✈️ صعود'}};
  function buildTargets(name,rec){const me=name.toLowerCase(),T=ext.targets;T.length=0;ext.dyn.length=0;grid.clear();ext.zones.length=0;defM.forEach(m=>scene.remove(m));defM=[];
    const tw=new Map();
    for(const r of houses){if(!r||r.username.toLowerCase()===me)continue;
      const t={type:'house',hp:40+r.level*25,r:5.5,y:0,m:stub(r.x,r.z),onDie(){writeHouse(r,0);setTimeout(()=>writeHouse(r,1),60000)}};
      T.push(t);const k=Math.floor(r.x/CELL)+','+Math.floor(r.z/CELL);(grid.get(k)||grid.set(k,[]).get(k)).push(t);
      const z=tw.get(r.town)||tw.set(r.town,{sx:0,sz:0,n:0,rs:[]}).get(r.town);z.sx+=r.x;z.sz+=r.z;z.n++;z.rs.push(r)}
    if(rec&&!tw.has(rec.town))tw.set(rec.town,{sx:rec.x,sz:rec.z,n:1,rs:[rec]});
    const fz=[];for(const [town,z] of tw){const x=z.sx/z.n,zz=z.sz/z.n,rad=Math.max(...z.rs.map(r=>Math.hypot(r.x-x,r.z-zz)))+70,own=rec&&town===rec.town;
      const zo={id:own?'HOME':(town.code||'SY'),n:town.name,x,z:zz,r:rad,rs:z.rs};ext.zones.push(zo);if(!own)fz.push(zo)}
    for(const c of cars){const t={type:'car',hp:25,r:4,y:0,m:stub(0,0),car:c,onDie(){c.dead=performance.now()+45000}};T.push(t);ext.dyn.push(t)}
    for(const lg of landmarks()){const e=lg.userData.entry;if(!e||!lg.visible||(e.lm&&e.lm.type==='airport'))continue;
      const t={type:'world',hp:220,r:Math.max(10,(e.height||20)*.6),y:0,m:stub(e.x,e.z),onDie(){lg.visible=false;setTimeout(()=>lg.visible=true,90000)}};T.push(t);ext.dyn.push(t)}
    const D=Math.max(+cfg.defenses||6,fz.length);fz.forEach((z,i)=>{const n=Math.ceil(D/Math.max(1,fz.length));for(let k=0;k<n;k++){const r=z.rs[Math.random()*z.rs.length|0];
      const m=new THREE.Group(),bd=new THREE.Mesh(new THREE.CylinderGeometry(1.6,2,3,8),new THREE.MeshStandardMaterial({color:'#444'})),gn=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,3,6),new THREE.MeshStandardMaterial({color:'#222'}));
      bd.position.y=1.5;gn.rotation.x=Math.PI/2.4;gn.position.set(0,3.4,-1);m.add(bd,gn);m.scale.setScalar(1.5);m.position.set(r.x+12,0,r.z+12);scene.add(m);defM.push(m);
      T.push({type:'def',m,hp:80,r:4,y:0,cd:R(0,2)})}})}
  async function begin(){if(busy)return;busy=true;try{
    const name=await social.needName();if(!name)return;
    if(!(new URLSearchParams(location.search).has('freejet')||await owns(name))){toast('✈️ الطائرة الحربية لأصحابها فقط — اشترِها من المتجر');openShop&&openShop();return}
    const rec=byName.get(name);if(!rec){toast('ما لقينا بيتك بالمدينة');return}
    cfg={...cfg,...(((await getConfig())||{}).jet||{})};ui=ui||makeUI();
    if(!jet){jet=buildJet(key(name).replace(/,/g,'.'),cfg.color||'#2e3642');jet.scale.setScalar(1.3);jet.position.copy(spawn).setY(1.4);scene.add(jet)}
    buildTargets(name,rec);
    if(!g)g=createGame({scene,camera,base:B,jet,cfg:{...cfg,speed:(+cfg.speed||1)*4},hud,ext});
    stopAll();takeOver();controls.enabled=false;on=true;ui.d.style.display='flex';g.respawn();
    camera.position.set(spawn.x,8,spawn.z+16);toast('✈️ انزل بالبدلة الحربية واقترب من الطائرة ثم صعود',5000)}finally{busy=false}}
  function exit(){if(!on)return;g.respawn();on=false;ui.d.style.display='none';controls.enabled=true;camera.position.set(at.x-60,55,at.z+110);controls.target.set(at.x,0,at.z)}
  let o=null;canvas.addEventListener('pointerdown',e=>{if(on)o={x:e.clientX,y:e.clientY}});
  addEventListener('pointermove',e=>{if(on&&o&&g){g.inp.x=Math.max(-1,Math.min(1,(e.clientX-o.x)/60));g.inp.y=Math.max(-1,Math.min(1,(e.clientY-o.y)/60))}});
  addEventListener('pointerup',()=>{o=null;g&&(g.inp.x=g.inp.y=0)});
  return{get on(){return on},toggle:()=>on?exit():begin(),frame:(dt,t)=>base.update(dt,t),
    update(dt){g.update(dt);controls.target.copy(g.S.mode==='air'?jet.position:g.pilot.position)}}}
