// احتفالية النصر: مؤثرات ثلاثية الأبعاد خفيفة وقابلة للتحكم من إعدادات cfg.party.
export function createVictory({ THREE, scene, zones, toast }) {
  const root = new THREE.Group(); root.name = 'haretna-victory'; scene.add(root);
  const sites = new Map();
  const palette = [0xffd54a, 0xffffff, 0x2ecc71, 0xff4757, 0x58c7ff];
  function makeSite(z) {
    const g = new THREE.Group(); g.position.set(z.x, 0, z.z); root.add(g);
    // حشود مجسمة: 180 شخصاً حول كل ساحة (جسم + رأس) مع ألوان احتفالية.
    const crowd=new THREE.Group(), count=180, dummy=new THREE.Object3D();
    const bodies=new THREE.InstancedMesh(new THREE.CylinderGeometry(.42,.58,2.5,6),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.8}),count);
    const heads=new THREE.InstancedMesh(new THREE.SphereGeometry(.48,7,6),new THREE.MeshStandardMaterial({color:0xf0c7a2,roughness:.9}),count);
    for(let i=0;i<count;i++){
      const a=Math.random()*Math.PI*2, r=18+Math.random()*43, x=Math.cos(a)*r, z=Math.sin(a)*r;
      dummy.position.set(x,1.35,z); dummy.rotation.y=Math.random()*Math.PI*2; dummy.scale.setScalar(.75+Math.random()*.5); dummy.updateMatrix(); bodies.setMatrixAt(i,dummy.matrix);
      dummy.position.set(x,3.0,z); dummy.scale.setScalar(.72+Math.random()*.35); dummy.updateMatrix(); heads.setMatrixAt(i,dummy.matrix);
      const shirt=new THREE.Color(palette[i%palette.length]); bodies.setColorAt(i,shirt);
    }
    bodies.instanceMatrix.needsUpdate=true; heads.instanceMatrix.needsUpdate=true; if(bodies.instanceColor)bodies.instanceColor.needsUpdate=true;
    crowd.add(bodies,heads); g.add(crowd);
    const n=96, p=new Float32Array(n*3), c=new Float32Array(n*3), a=new Float32Array(n);
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(p,3)); geo.setAttribute('color',new THREE.BufferAttribute(c,3)); geo.setAttribute('alpha',new THREE.BufferAttribute(a,1));
    const mat=new THREE.PointsMaterial({size:5,vertexColors:true,transparent:true,opacity:.95,depthWrite:false});
    const sparks=new THREE.Points(geo,mat); g.add(sparks);
    const flags=[];
    for(let i=0;i<8;i++){
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,8,6),new THREE.MeshBasicMaterial({color:0xe9e9e9}));
      const ang=i*Math.PI/4, x=Math.cos(ang)*30, zz=Math.sin(ang)*30; pole.position.set(x,4,zz); g.add(pole);
      const flag=new THREE.Mesh(new THREE.PlaneGeometry(4,2),new THREE.MeshBasicMaterial({color:[0x2e7d4f,0xffffff,0x202326][i%3],side:THREE.DoubleSide})); flag.position.set(x+2,7,zz); g.add(flag); flags.push(flag);
    }
    return {g,crowd,sparks,geo,p,c,a,flags,seed:Math.random()*10,top:z.top||28};
  }
  for(const z of zones) sites.set(z.id,makeSite(z));
  let config={on:false,zones:zones.map(z=>z.id),fireworks:true,crowd:true,music:true};
  function apply(next={}) {
    config={...config,...next}; const selected=new Set(Array.isArray(config.zones)?config.zones:[]);
    for(const [id,s] of sites){s.g.visible=!!config.on&&selected.has(id);s.crowd.visible=!!config.crowd;s.sparks.visible=!!config.fireworks;}
    if(config.on) toast('🎆 احتفالية النصر مفعّلة في المناطق المحددة',3500);
    syncMusicButton();
  }
  function update(sec){
    if(!config.on||!config.fireworks)return;
    for(const [id,s] of sites){if(!s.g.visible)continue;
      const t=sec*1.35+s.seed, burst=Math.floor(t/2.8), phase=(t%2.8)/2.8;
      const cx=Math.sin(burst*12.3+s.seed)*22, cz=Math.cos(burst*8.7+s.seed)*22, cy=s.top+22;
      for(let i=0;i<96;i++){const ang=i/96*Math.PI*2, ring=phase*19; s.p[i*3]=cx+Math.cos(ang)*ring; s.p[i*3+1]=cy+Math.sin(ang*3)*ring*.55-phase*phase*8; s.p[i*3+2]=cz+Math.sin(ang)*ring; const col=new THREE.Color(palette[(i+burst)%palette.length]);s.c[i*3]=col.r;s.c[i*3+1]=col.g;s.c[i*3+2]=col.b;s.a[i]=Math.max(0,1-phase);}
      s.geo.attributes.position.needsUpdate=true;s.geo.attributes.color.needsUpdate=true;s.flags.forEach((f,i)=>f.rotation.y=Math.sin(sec*2+i)*.18);
    }
  }
  let audio=null, musicOn=false;
  function syncMusicButton(){let b=document.getElementById('victoryMusic');if(!config.on||!config.music){if(b)b.hidden=true;stopMusic();return;}if(!b){b=document.createElement('button');b.id='victoryMusic';b.type='button';b.textContent='🎵 تشغيل أجواء الاحتفال';b.style.cssText='position:fixed;z-index:40;bottom:18px;left:14px;border:0;border-radius:30px;padding:12px 17px;background:#116b3c;color:white;font:700 14px system-ui;box-shadow:0 4px 18px #0005';b.onclick=()=>musicOn?stopMusic():startMusic();document.body.appendChild(b);}b.hidden=false;b.textContent=musicOn?'🔇 إيقاف الموسيقى':'🎵 تشغيل أجواء الاحتفال';}
  function startMusic(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=new AC();const master=audio.createGain();master.gain.value=.055;master.connect(audio.destination);const notes=[392,494,587,494,440,523,659,587];const playPhrase=()=>notes.forEach((hz,i)=>{const o=audio.createOscillator(),g=audio.createGain(),at=audio.currentTime+i*.28;o.type='triangle';o.frequency.value=hz;g.gain.setValueAtTime(.001,at);g.gain.linearRampToValueAtTime(.22,at+.04);g.gain.exponentialRampToValueAtTime(.001,at+.25);o.connect(g);g.connect(master);o.start(at);o.stop(at+.27);});playPhrase();const loop=setInterval(()=>{if(!audio){clearInterval(loop);return;}playPhrase();},2300);audio.__loop=loop;musicOn=true;syncMusicButton();audio.onstatechange=()=>{};}catch(e){toast('تعذّر تشغيل الصوت في هذا الجهاز');}}
  function stopMusic(){if(audio){if(audio.__loop)clearInterval(audio.__loop);audio.close().catch(()=>{});audio=null;}musicOn=false;const b=document.getElementById('victoryMusic');if(b)b.textContent='🎵 تشغيل أجواء الاحتفال';}
  return {apply,update,dispose(){stopMusic();scene.remove(root);root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});}};
}
