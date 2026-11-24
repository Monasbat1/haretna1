// حارتنا — القسم 1: الطائرة الحربية + المطار الحربي + التحقق من الملكية
import * as THREE from 'three';
export const JET_ITEM={id:'f_jet',cat:'car',kind:'jet',emoji:'✈️',name:'طائرة F-77 الشبح',price:50,desc:'طائرة حربية حصرية باسمك: صواريخ عشوائية وليزرية ورشاش',color:'#2e3642'};
export const JET_CFG={color:'#2e3642',price:50,hp:100,speed:1,rockets:40,lasers:12,gun:600,alertRadius:260,defenses:6};
// ملكية: owned/<user>/f_jet===1 (تكتبها لوحة الإدارة عند قبول الطلب)
export const key=n=>String(n||'').trim().replace(/^@+/,'').toLowerCase().replace(/\./g,',');
export const ownsJet=(owned,user,id='f_jet')=>!!(owned&&owned[key(user)]&&owned[key(user)][id]===1);
const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.45,metalness:.55,...o});
function tex(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t}
export function buildJet(owner='',color=JET_CFG.color){
  const g=new THREE.Group(),b=M(color),dk=M('#11151b');
  const fus=new THREE.Mesh(new THREE.CylinderGeometry(.55,.8,7,12),b);fus.rotation.x=Math.PI/2;g.add(fus);
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.55,3.2,12),b);nose.rotation.x=-Math.PI/2;nose.position.z=-5.1;g.add(nose);
  const can=new THREE.Mesh(new THREE.SphereGeometry(.6,16,12),M('#7fd0ff',{transparent:true,opacity:.8,metalness:.9,roughness:.1}));can.scale.set(.8,.7,2.2);can.position.set(0,.55,-1.6);g.add(can);
  const wg=new THREE.BufferGeometry(),v=[0,0,-2.2, 5.2,0,2.6, 0,0,2.6, 0,0,-2.2, 0,0,2.6, -5.2,0,2.6];
  wg.setAttribute('position',new THREE.Float32BufferAttribute(v,3));wg.computeVertexNormals();
  const w=new THREE.Mesh(wg,new THREE.MeshStandardMaterial({color,metalness:.5,roughness:.5,side:THREE.DoubleSide}));w.position.y=-.1;g.add(w);
  for(const s of[-1,1]){const t=new THREE.Mesh(new THREE.BoxGeometry(.12,1.6,1.6),b);t.position.set(s*.9,.9,3.1);t.rotation.z=s*-.25;g.add(t);
    const e=new THREE.Mesh(new THREE.CylinderGeometry(.38,.42,2.2,10),dk);e.rotation.x=Math.PI/2;e.position.set(s*.85,-.1,2.4);g.add(e);
    const f=new THREE.Mesh(new THREE.ConeGeometry(.3,1.6,10),new THREE.MeshBasicMaterial({color:'#ff8a2b'}));f.rotation.x=-Math.PI/2;f.position.set(s*.85,-.1,4.2);f.name='flame';g.add(f)}
  // الاسم على الجناحين (اسم المتابع)
  const label=tex(512,128,(x,w,h)=>{x.fillStyle='rgba(0,0,0,0)';x.fillRect(0,0,w,h);x.fillStyle='#ffd23f';x.font='bold 64px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('@'+(owner||'—'),w/2,h/2)});
  for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(3.4,.85),new THREE.MeshBasicMaterial({map:label,transparent:true}));p.rotation.x=-Math.PI/2;p.position.set(s*2.6,.02,1.2);p.rotation.z=s>0?0:Math.PI;g.add(p)}
  g.userData={owner,flames:g.children.filter(c=>c.name==='flame')};return g}
export function buildSoldier(vest='#3d5a2a'){const s=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.18,.2,.7,8),M(vest,{metalness:.1,roughness:.9}));body.position.y=.75;s.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.15,10,8),M('#e0b890',{metalness:0}));head.position.y=1.25;s.add(head);
  const hel=new THREE.Mesh(new THREE.SphereGeometry(.17,10,6,0,Math.PI*2,0,Math.PI/2),M('#2b3a1f',{metalness:.1}));hel.position.y=1.28;s.add(hel);
  for(const x of[-.1,.1]){const l=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.5,6),M('#2b3a1f',{metalness:.1}));l.position.set(x,.25,0);s.add(l)}
  return s}
export function buildAirbase(){const g=new THREE.Group(),anim=[];
  const rw=new THREE.Mesh(new THREE.PlaneGeometry(14,120),new THREE.MeshStandardMaterial({map:tex(128,512,(x,w,h)=>{x.fillStyle='#2a2d33';x.fillRect(0,0,w,h);x.fillStyle='#e8e8e8';for(let y=10;y<h;y+=48)x.fillRect(w/2-3,y,6,26);x.fillRect(4,0,3,h);x.fillRect(w-7,0,3,h)}),roughness:.9}));
  rw.rotation.x=-Math.PI/2;rw.position.y=.02;g.add(rw);
  const apron=new THREE.Mesh(new THREE.PlaneGeometry(40,30),M('#3a3d44',{roughness:.95,metalness:0}));apron.rotation.x=-Math.PI/2;apron.position.set(-28,.015,-20);g.add(apron);
  const hg=new THREE.Mesh(new THREE.CylinderGeometry(9,9,26,16,1,false,0,Math.PI),M('#6b7280'));hg.rotation.set(0,0,Math.PI/2);hg.rotation.order='ZYX';hg.rotation.y=Math.PI/2;hg.position.set(-38,0,-34);g.add(hg);
  const tw=new THREE.Group();const sh=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.6,14,10),M('#8a8f98'));sh.position.y=7;tw.add(sh);
  const cab=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.2,2.4,10),M('#9fd3e8',{transparent:true,opacity:.75}));cab.position.y=15;tw.add(cab);tw.position.set(14,0,-10);g.add(tw);
  const radar=new THREE.Group(),mast=new THREE.Mesh(new THREE.CylinderGeometry(.3,.4,5,8),M('#555'));mast.position.y=2.5;radar.add(mast);
  const dish=new THREE.Mesh(new THREE.SphereGeometry(2.2,16,8,0,Math.PI*2,0,Math.PI/2.6),M('#d7dbe0'));dish.rotation.x=-Math.PI/2.4;dish.position.y=5.4;dish.name='dish';radar.add(dish);radar.position.set(22,0,8);g.add(radar);anim.push(dt=>{dish.parent.rotation.y+=dt*1.2});
  const r2=radar.clone();r2.position.set(22,0,24);g.add(r2);anim.push(dt=>{r2.rotation.y-=dt*.9});
  const crew=[];[[-20,-12],[-24,-16],[-30,-14],[-18,-24],[-26,-26],[8,-6]].forEach(([x,z],i)=>{const s=buildSoldier(i%2?'#3d5a2a':'#c9a227');s.position.set(x,0,z);s.rotation.y=Math.random()*6;g.add(s);crew.push(s)});
  anim.push((dt,t)=>crew.forEach((s,i)=>{s.position.y=Math.abs(Math.sin(t*2+i))*.04}));
  const truck=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.6,5),M('#b8481f'));truck.position.set(-12,.9,-30);g.add(truck);
  return{group:g,update:(dt,t)=>anim.forEach(f=>f(dt,t)),crew,spawn:new THREE.Vector3(-26,.5,-20)}}
export function mountAirbase(scene,{user,owned,cfg={}}){const c={...JET_CFG,...cfg},base=buildAirbase();scene.add(base.group);
  const has=ownsJet(owned,user);let jet=null;
  if(has){jet=buildJet(key(user).replace(/,/g,'.'),c.color);jet.position.copy(base.spawn).setY(1.4);jet.rotation.y=Math.PI/2;scene.add(jet)}
  return{base,jet,owned:has,update(dt,t){base.update(dt,t);if(jet)jet.userData.flames.forEach(f=>f.scale.y=.8+Math.random()*.5)}}}
