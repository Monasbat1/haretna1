// حارتنا — القسمان 2 و3: الشخصية، الطيران، الأسلحة، القصف، الإنذار الجوي، الدفاعات الأرضية
import * as THREE from 'three';
import {buildSoldier} from './jet.js';
const V=THREE.Vector3,R=(a,b)=>a+Math.random()*(b-a);
const mat=(c,e)=>new THREE.MeshStandardMaterial({color:c,roughness:.8,metalness:.1,emissive:e||'#000'});
export const COUNTRIES=[['JO','الأردن'],['LB','لبنان'],['IQ','العراق'],['SA','السعودية']];
export function createGame({scene,camera,base,jet,cfg,hud,ext}){
  const c={...{hp:100,speed:1,rockets:40,lasers:12,gun:600,alertRadius:260,defenses:6},...cfg};
  const K={},inp={x:0,y:0},T=ext?ext.targets:[],P=[],X=[],H=[];let t=0,beepCtx=null;
  const S={mode:'foot',hp:c.hp,gun:c.gun,rockets:c.rockets,lasers:c.lasers,score:0,alert:'',can:'',alt:0};
  const pilot=buildSoldier('#2f4a22');pilot.scale.setScalar(1.4);pilot.position.copy(base.spawn).add(new V(5,0,3));scene.add(pilot);
  const J={pos:jet.position.clone(),yaw:Math.PI,pitch:0,roll:0,speed:0};
  // ---- العالم: بيوت وسيارات وعوالم + دول أخرى
  const zones=ext?ext.zones:[{id:'HOME',n:'حارتنا',x:0,z:0,r:c.alertRadius}];
  if(!ext)COUNTRIES.forEach(([id,n],i)=>{const a=i*Math.PI/2+.4,d=c.alertRadius+140;zones.push({id,n,x:Math.cos(a)*d,z:Math.sin(a)*d,r:140})});
  const add=(type,x,z,hp,m,r,country)=>{m.position.set(x,m.position.y,z);scene.add(m);T.push({type,m,hp,r,country,y:m.position.y})};
  const house=()=>{const g=new THREE.Group(),w=R(5,8),h=R(4,7),b=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),mat(['#e8d9b5','#d9b99b','#c9d4dc'][Math.random()*3|0]));b.position.y=h/2;g.add(b);const r=new THREE.Mesh(new THREE.ConeGeometry(w*.8,2.5,4),mat('#a5432e'));r.rotation.y=Math.PI/4;r.position.y=h+1.2;g.add(r);return g};
  const car=()=>{const g=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(1.8,.8,3.8),mat(['#d64545','#2f6fd6','#e6c229','#eee'][Math.random()*4|0]));b.position.y=.6;g.add(b);const u=new THREE.Mesh(new THREE.BoxGeometry(1.5,.6,1.8),mat('#8fc7e8'));u.position.set(0,1.2,-.1);g.add(u);return g};
  const world=()=>{const g=new THREE.Group(),s=new THREE.Mesh(new THREE.SphereGeometry(7,20,12,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:'#7fd0ff',transparent:true,opacity:.6,metalness:.8,roughness:.1}));g.add(s);const b=new THREE.Mesh(new THREE.CylinderGeometry(7.4,7.4,1.2,20),mat('#555'));b.position.y=.6;g.add(b);return g};
  const turret=()=>{const g=new THREE.Group(),b=new THREE.Mesh(new THREE.CylinderGeometry(1.6,2,3,8),mat('#444'));b.position.y=1.5;g.add(b);const gun=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,3,6),mat('#222'));gun.rotation.x=Math.PI/2.4;gun.position.set(0,3.4,-1);g.add(gun);return g};
  const spot=(z)=>{for(;;){const a=Math.random()*6.283,d=Math.sqrt(Math.random())*(z.r-12),x=z.x+Math.cos(a)*d,y=z.z+Math.sin(a)*d;if(z.id!=='HOME'||(x<-70||x>50)||(y<-70||y>80))return[x,y]}};
  if(!ext)zones.forEach(z=>{const n=z.id==='HOME'?40:22;for(let i=0;i<n;i++){const[x,y]=spot(z),q=Math.random();add(q<.6?'house':q<.9?'car':'world',x,y,q<.6?60:q<.9?25:140,q<.6?house():q<.9?car():world(),q<.9?4:8,z.id)}});
  const fz=zones.slice(1);if(!ext)for(let i=0;i<c.defenses;i++){const z=fz[i%fz.length],[x,y]=spot(z);add('def',x,y,80,turret(),3,z.id);T[T.length-1].cd=R(0,2)}
  // ---- مؤثرات
  const boom=(p,r)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),new THREE.MeshBasicMaterial({color:'#ff9b2e',transparent:true,opacity:.9}));m.position.copy(p);scene.add(m);X.push({m,r,a:0})};
  const hit=(p,r,d)=>{boom(p,r);(ext&&ext.near?ext.near(p):T).forEach(o=>{if(o.hp>0&&o.m.position.distanceTo(p)<r+o.r){o.hp-=d;if(o.hp<=0){o.m.scale.y=.25;o.m.traverse(q=>{if(q.material&&q.material.color)q.material=mat('#222','#331100')});o.onDie&&o.onDie();boom(o.m.position,o.r*2);if(o.type!=='def')S.score+=o.type==='world'?30:o.type==='house'?10:5;else S.score+=40}}})};
  const shot=(type,pos,dir,sp,life,color,size)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(size,size,size*(type==='gun'?5:3)),new THREE.MeshBasicMaterial({color}));m.position.copy(pos);m.lookAt(pos.clone().add(dir));scene.add(m);P.push({type,m,v:dir.clone().multiplyScalar(sp),life,sp,tg:null})};
  const fwd=()=>new V(0,0,-1).applyEuler(new THREE.Euler(J.pitch,J.yaw,0,'YXZ'));
  // ---- أسلحة
  const cd={gun:0,rk:0,ls:0};
  function fire(w){if(S.mode!=='air')return;const f=fwd(),o=J.pos.clone().addScaledVector(f,5);
    if(w==='gun'&&S.gun>0&&cd.gun<=0){S.gun--;cd.gun=.06;const d=f.clone().add(new V(R(-.02,.02),R(-.02,.02),0)).normalize();shot('gun',o,d,200,1.2,'#ffe066',.15)}
    if(w==='rk'&&S.rockets>0&&cd.rk<=0){cd.rk=.3;for(let i=0;i<2&&S.rockets>0;i++){S.rockets--;const d=f.clone().add(new V(R(-.18,.18),R(-.1,.1),R(-.18,.18))).normalize();shot('rk',o.clone().add(new V((i?1:-1)*2,-.4,0)),d,90,4,'#ff5a3d',.35)}}
    if(w==='ls'&&S.lasers>0&&cd.ls<=0){cd.ls=.7;S.lasers--;const q=shot('ls',o,f,130,5,'#37f0ff',.3),p=P[P.length-1];let b=null,bd=1e9;T.forEach(x=>{if(x.hp>0&&x.type!=='def'||x.hp>0){const v=x.m.position.clone().sub(J.pos),d=v.length();if(d<350&&v.normalize().dot(f)>.7&&d<bd){bd=d;b=x}}});p.tg=b}}
  // ---- صعود/هبوط
  function toggle(){if(S.mode==='foot'&&pilot.position.distanceTo(jet.position)<9){S.mode='air';pilot.visible=false;J.pos.copy(jet.position);J.yaw=Math.PI;J.speed=0}
    else if(S.mode==='air'&&J.pos.y<6){S.mode='foot';pilot.visible=true;J.speed=0;J.pos.y=1.4;jet.position.copy(J.pos);pilot.position.copy(J.pos).add(new V(4,-1.4,0))}}
  const beep=()=>{try{beepCtx=beepCtx||new AudioContext();[0,.25,.5].forEach(d=>{const o=beepCtx.createOscillator(),g=beepCtx.createGain();o.frequency.value=880;o.connect(g);g.connect(beepCtx.destination);g.gain.value=.15;o.start(beepCtx.currentTime+d);o.stop(beepCtx.currentTime+d+.15)})}catch(e){}};
  const die=(q)=>{if(q===undefined)boom(J.pos,12);S.mode='foot';pilot.visible=true;J.pos.copy(base.spawn).setY(1.4);J.speed=0;J.pitch=J.roll=0;jet.position.copy(J.pos);pilot.position.copy(base.spawn).add(new V(5,0,3));Object.assign(S,{hp:c.hp,gun:c.gun,rockets:c.rockets,lasers:c.lasers});q===undefined&&hud.msg('💥 أُسقطت طائرتك! عدت للمطار')};
  addEventListener('keydown',e=>{if(ext&&!ext.active())return;K[e.code]=1;if(e.code==='KeyE')toggle()});addEventListener('keyup',e=>K[e.code]=0);
  function update(dt){t+=dt;cd.gun-=dt;cd.rk-=dt;cd.ls-=dt;
    const kx=(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0),ky=(K.ArrowDown||K.KeyS?1:0)-(K.ArrowUp||K.KeyW?1:0),ix=inp.x||kx,iy=inp.y||ky;
    if(K.Space||K.on_gun)fire('gun');if(K.KeyR||K.on_rk)fire('rk');if(K.KeyL||K.on_ls)fire('ls');
    if(S.mode==='foot'){pilot.position.x+=ix*8*dt;pilot.position.z+=iy*8*dt;if(ix||iy)pilot.rotation.y=Math.atan2(ix,iy);
      S.can=pilot.position.distanceTo(jet.position)<9?'board':'';const w=pilot.position;camera.position.lerp(new V(w.x,7,w.z+14),.1);camera.lookAt(w.x,1.5,w.z)}
    else{J.yaw-=ix*dt*(.5+J.speed/50);J.pitch+=((J.speed>18?-iy*.7:0)-J.pitch)*Math.min(1,dt*2);J.roll+=(-ix*.9-J.roll)*Math.min(1,dt*3);
      J.speed+=(30*c.speed-J.speed)*dt*.4;J.pos.addScaledVector(fwd(),J.speed*dt);if(J.pos.y<1.4){J.pos.y=1.4;J.pitch=Math.max(0,J.pitch)}if(J.pos.y>220)J.pos.y=220;
      jet.position.copy(J.pos);jet.rotation.set(J.pitch,J.yaw+Math.PI,J.roll,'YXZ');jet.rotation.y=J.yaw;
      const f=fwd();camera.position.lerp(J.pos.clone().addScaledVector(f,-15).add(new V(0,5,0)),.12);camera.lookAt(J.pos.clone().addScaledVector(f,25));
      S.can=J.pos.y<6?'land':'';
      // إنذار المجال الجوي
      const z=zones.find(z=>z.id!=='HOME'&&Math.hypot(J.pos.x-z.x,J.pos.z-z.z)<z.r&&J.pos.y<200);
      if(z&&S.alert!==z.n){S.alert=z.n;beep();hud.msg('⚠️ إنذار! دخلت المجال الجوي: '+z.n)}else if(!z&&S.alert){S.alert='';hud.msg('✅ خرجت من المجال الجوي المعادي')}
      // الدفاعات الأرضية
      T.forEach(o=>{if(o.type!=='def'||o.hp<=0)return;const d=o.m.position.distanceTo(J.pos);if(d<130){o.cd-=dt;if(o.cd<=0){o.cd=1.4;const dir=J.pos.clone().sub(o.m.position.clone().setY(3)).normalize();shot('en',o.m.position.clone().setY(3.5),dir,70,3,'#ff2d2d',.3)}}});
      if(S.hp<=0)die()}
    jet.userData.flames.forEach(f=>f.visible=S.mode==='air');
    // قذائف
    for(let i=P.length-1;i>=0;i--){const p=P[i];p.life-=dt;
      if(p.tg&&p.tg.hp>0){const d=p.tg.m.position.clone().sub(p.m.position).normalize();p.v.lerp(d.multiplyScalar(p.sp),Math.min(1,dt*3))}
      if(p.type==='rk')p.v.y-=6*dt;p.m.position.addScaledVector(p.v,dt);
      let end=p.life<=0||p.m.position.y<=0;
      if(p.type==='en'){if(p.m.position.distanceTo(J.pos)<3&&S.mode==='air'){S.hp-=6;end=true;boom(p.m.position,3)}}
      else if(!end)for(const o of(ext&&ext.near?ext.near(p.m.position):T))if(o.hp>0&&p.m.position.distanceTo(o.m.position.clone().setY(o.y+2))<o.r+1){end=true;break}
      if(end){if(p.type!=='en')hit(p.m.position,p.type==='gun'?1.5:p.type==='rk'?9:13,p.type==='gun'?5:p.type==='rk'?45:90);scene.remove(p.m);P.splice(i,1)}}
    for(let i=X.length-1;i>=0;i--){const e=X[i];e.a+=dt*2;e.m.scale.setScalar(.5+e.a*e.r);e.m.material.opacity=Math.max(0,.9-e.a);if(e.a>1){scene.remove(e.m);X.splice(i,1)}}
    S.alt=Math.round(J.pos.y);hud.update(S)}
  return{S,pilot,respawn:()=>die(''),update,toggle,fire,inp,key:K,zones,targets:T,get alive(){return T.filter(o=>o.hp>0&&o.type!=='def').length}}}
