// 🎆 احتفال بنصر سوريا: ألعاب نارية فوق كل معالم سوريا + لافتة فوق الجامع الأموي.
// وإخفاء أي معلم لوحده (cfg.lmHide = مفاتيح) وإيقاف الحفلة (cfg.party.on = false) من لوحة الإدارة.
export function createParty({ THREE, scene, camera, renderer, spinners, landmarkGroups, zones, toast, reducedMotion }) {
  const keyOf = (e) => {
    if (!e) return null;
    if (e.town) return 't' + e.town.code;
    const lm = e.lm;
    if (!lm) return null;
    if (lm.type === 'syria') { const z = zones.find((q) => q.place + ' · ' + q.zone === lm.name); return z ? z.id : null; }
    if (['bosra', 'sword', 'rum', 'abdali'].includes(lm.type)) return lm.type;
    if (lm.type === 'airport') return 'air' + (lm.t || '');
    if (lm.type === 'center' || lm.type === 'hearts') return null;
    return lm.id != null ? 'lm' + lm.id : null;
  };
  const isSyria = (e) => {
    if (!e || e.town || !e.lm) return false;
    if (['rum', 'abdali', 'hearts'].includes(e.lm.type)) return false;
    return !e.lm.t;
  };
  const COLORS = ['#ffffff', '#2ecc71', '#ff3b30', '#ffd54a', '#7dffb0', '#ffffff'].map((c) => new THREE.Color(c));
  const N = 64, BURSTS = 3, CYCLE = 3.4, LAUNCH = 0.8;
  const VS = `attribute vec3 aCol; attribute float aA; uniform float uScale; uniform float uSize; varying vec3 vC; varying float vA;
    void main(){ vC=aCol; vA=aA; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=max(1.5,uSize*uScale/-mv.z); gl_Position=projectionMatrix*mv; }`;
  const FS = `varying vec3 vC; varying float vA;
    void main(){ float d=length(gl_PointCoord-0.5); if(d>0.5) discard; gl_FragColor=vec4(vC, smoothstep(0.5,0.05,d)*vA); }`;
  const hash = (a) => { const s = Math.sin(a) * 43758.5453; return s - Math.floor(s); };
  const sites = [];
  function makeSite(e, idx) {
    const total = N * BURSTS;
    const geo = new THREE.BufferGeometry();
    const pos = new THREE.BufferAttribute(new Float32Array(total * 3), 3), col = new THREE.BufferAttribute(new Float32Array(total * 3), 3), alp = new THREE.BufferAttribute(new Float32Array(total), 1);
    geo.setAttribute('position', pos); geo.setAttribute('aCol', col); geo.setAttribute('aA', alp);
    const mat = new THREE.ShaderMaterial({ uniforms: { uScale: { value: 1 }, uSize: { value: 2.8 } }, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    pts.raycast = () => {};
    scene.add(pts);
    const dirs = [];
    for (let b = 0; b < BURSTS; b++) {
      const d = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u), k = 0.55 + Math.random() * 0.45;
        d[i * 3] = Math.cos(a) * r * k; d[i * 3 + 1] = u * k; d[i * 3 + 2] = Math.sin(a) * r * k;
      }
      dirs.push(d);
    }
    sites.push({ x: e.x, z: e.z, h: e.height || 20, pts, mat, pos, col, alp, dirs, seed: idx * 7.31 });
  }
  function update(sec) {
    if (camera.position.y > 1500) { for (const s of sites) s.pts.visible = false; return; }
    const scale = renderer.domElement.height / (2 * Math.tan((camera.fov * Math.PI) / 360));
    for (const s of sites) {
      const dist = Math.hypot(camera.position.x - s.x, camera.position.z - s.z, camera.position.y);
      s.pts.visible = dist < 1500;
      if (!s.pts.visible) continue;
      s.mat.uniforms.uScale.value = scale;
      const R = 16 + Math.min(s.h * 0.25, 18), base = s.h * 0.8 + 20;
      for (let b = 0; b < BURSTS; b++) {
        const t0 = sec + b * (CYCLE / BURSTS) + s.seed, k = Math.floor(t0 / CYCLE), tt = t0 - k * CYCLE;
        const cx = s.x + (hash(k * 12.9 + b * 78.2 + s.seed) - 0.5) * 44, cz = s.z + (hash(k * 39.3 + b * 11.1 + s.seed) - 0.5) * 44, cy = base + hash(k * 5.7 + b + s.seed) * 16;
        const c = COLORS[(k + b + Math.floor(s.seed)) % COLORS.length], dir = s.dirs[b], o = b * N;
        for (let i = 0; i < N; i++) {
          const j = o + i;
          let x, y, z, a = 0, cr = c.r, cg = c.g, cb = c.b;
          if (i === 0) { // الصاروخ الصاعد
            if (tt < LAUNCH) { const u = tt / LAUNCH; x = s.x + (cx - s.x) * u; z = s.z + (cz - s.z) * u; y = 1 + (cy - 1) * u; a = 1; cr = 1; cg = 0.9; cb = 0.6; }
            else { x = cx; y = -50; z = cz; }
          } else if (tt < LAUNCH) { x = cx; y = -50; z = cz; }
          else {
            const q = tt - LAUNCH, r = R * (1 - Math.exp(-q * 2.4));
            x = cx + dir[i * 3] * r; y = cy + dir[i * 3 + 1] * r - 3.2 * q * q; z = cz + dir[i * 3 + 2] * r;
            a = Math.pow(Math.max(0, 1 - q / (CYCLE - LAUNCH)), 0.7);
            if (i % 3 === 0) { cr = 1; cg = 1; cb = 1; }
          }
          s.pos.setXYZ(j, x, y, z); s.col.setXYZ(j, cr, cg, cb); s.alp.setX(j, a);
        }
      }
      s.pos.needsUpdate = s.col.needsUpdate = s.alp.needsUpdate = true;
    }
  }
  function banner(e) {
    const cv = document.createElement('canvas');
    cv.width = 1024; cv.height = 200;
    const x = cv.getContext('2d');
    const bg = x.createLinearGradient(0, 0, 1024, 0);
    bg.addColorStop(0, '#0f6e3a'); bg.addColorStop(0.5, '#1b8f4e'); bg.addColorStop(1, '#0f6e3a');
    x.fillStyle = bg; x.beginPath(); x.roundRect(6, 6, 1012, 188, 40); x.fill();
    x.strokeStyle = '#ffd54a'; x.lineWidth = 8; x.stroke();
    x.fillStyle = '#ffffff'; x.direction = 'rtl'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '800 92px Tajawal, system-ui, sans-serif';
    x.fillText('🎉 احتفال بنصر سوريا 🎉', 512, 104);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false }));
    sp.scale.set(64, 64 * 200 / 1024, 1);
    sp.position.set(e.x, (e.height || 30) + 34, e.z);
    sp.renderOrder = 4;
    scene.add(sp);
  }
  function apply(cfg) {
    const hide = new Set(Array.isArray(cfg.lmHide) ? cfg.lmHide : []);
    for (const g of [...landmarkGroups]) { // إخفاء المعالم المعطّلة كلٌّ لوحده
      const k = keyOf(g.userData.entry);
      if (k && hide.has(k)) { scene.remove(g); landmarkGroups.splice(landmarkGroups.indexOf(g), 1); }
    }
    if (cfg.party && cfg.party.on === false) return; // الحفلة موقوفة من لوحة الإدارة
    landmarkGroups.forEach((g, i) => {
      const e = g.userData.entry;
      if (!isSyria(e)) return;
      if (e.lm.type === 'center') banner(e);
      if (!reducedMotion) makeSite(e, i);
    });
    if (!reducedMotion) spinners.push((now) => update(now / 1000));
    toast('🎆🇸🇾 احتفالات بنصر سوريا في كل المعالم', 6000);
  }
  return { apply };
}
