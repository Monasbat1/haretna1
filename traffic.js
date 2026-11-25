// إشارات المرور: كل تقاطع مأهول له إشارتان (4 وجوه) تتناوبان أخضر ← أصفر ← أحمر.
// السيارات العادية تقف عند الإشارة الحمراء وأمام أي سيارة أو شخص في طريقها،
// وسيارتك (drive.js) تُسجَّل عليها مخالفة إن قطعت الإشارة الحمراء.
// الاستخدام من city.js: const traffic = createTraffic({THREE, scene, BW, BD, ROAD, paved});
//   traffic.update(centerX, centerZ, nowMs)   كل إطار
//   traffic.state(i, j, axis, nowMs)           'g' | 'y' | 'r'   (axis: 'x' السير على x، 'z' السير على z)
export const CYCLE = 24; // ثانية: 10 أخضر (x) + 2 أصفر + 10 أخضر (z) + 2 أصفر
const GREEN = 10, YELLOW = 2;
const off = (i, j) => ((i * 7 + j * 13) % 12 + 12) % 12; // كل تقاطع له إزاحة زمنية مختلفة فلا تتزامن كل الإشارات

export function lightState(i, j, axis, nowMs) {
  const p = (((nowMs / 1000 + off(i, j)) % CYCLE) + CYCLE) % CYCLE;
  if (axis === 'x') return p < GREEN ? 'g' : p < GREEN + YELLOW ? 'y' : 'r';
  const q = (p + GREEN + YELLOW) % CYCLE; // الاتجاه الآخر متأخر نصف دورة
  return q < GREEN ? 'g' : q < GREEN + YELLOW ? 'y' : 'r';
}

export function createTraffic({ THREE, scene, BW, BD, ROAD, paved }) {
  const MAXI = 36, RADIUS = 260; // أقصى عدد تقاطعات مرسومة معاً، ونصف قطر الرسم حول الكاميرا
  const H = ROAD / 2 + 0.9;
  const COL = { g: new THREE.Color('#25e06a'), y: new THREE.Color('#ffc21a'), r: new THREE.Color('#ff3b30'), off: new THREE.Color('#2a2d33') };
  const poleMat = new THREE.MeshLambertMaterial({ color: '#3b3f47' });
  const headMat = new THREE.MeshLambertMaterial({ color: '#16181c' });
  const lampMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const poles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.14, 1, 8), poleMat, MAXI * 2);
  const heads = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), headMat, MAXI * 2);
  const lamps = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), lampMat, MAXI * 2 * 12);
  for (const m of [poles, heads, lamps]) { m.frustumCulled = false; m.count = 0; scene.add(m); }
  lamps.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAXI * 2 * 12 * 3).fill(1), 3);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  let shown = [], lastSet = 0, lastColors = 0;

  // التقاطع (i,j) يقع بين البلوكات (i..i+1, j..j+1). مأهول إن كان بجانبه بلوكان معبّدان على الأقل.
  const lived = (i, j) => (paved(i, j) + paved(i + 1, j) + paved(i, j + 1) + paved(i + 1, j + 1)) >= 2;

  function chooseCorners(cx, cz) {
    const i0 = Math.floor(cx / BW), j0 = Math.floor(cz / BD), R = Math.ceil(RADIUS / Math.min(BW, BD)) + 1, out = [];
    for (let i = i0 - R; i <= i0 + R; i++) for (let j = j0 - R; j <= j0 + R; j++) {
      const x = (i + 0.5) * BW, z = (j + 0.5) * BD, d = (x - cx) ** 2 + (z - cz) ** 2;
      if (d < RADIUS * RADIUS && lived(i, j)) out.push({ i, j, x, z, d });
    }
    out.sort((a, b) => a.d - b.d);
    return out.slice(0, MAXI);
  }
  function layout() {
    let p = 0, hd = 0, lp = 0;
    for (const c of shown) {
      for (const sx of [1, -1]) { // عمودان بزاويتين متقابلتين
        const x = c.x + sx * H, z = c.z + sx * H;
        poles.setMatrixAt(p++, m4.compose(v.set(x, 2.1, z), q.identity(), s.set(1, 4.2, 1)));
        heads.setMatrixAt(hd++, m4.compose(v.set(x, 4.6, z), q.identity(), s.set(0.8, 2.1, 0.8)));
        // 12 لمبة: 3 على كل وجه (±x: حالة السير على x، ±z: حالة السير على z)
        for (const face of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (let k = 0; k < 3; k++) {
          lamps.setMatrixAt(lp++, m4.compose(v.set(x + face[0] * 0.42, 5.3 - k * 0.7, z + face[1] * 0.42), q.identity(), s.set(face[0] ? 0.06 : 0.5, 0.5, face[1] ? 0.06 : 0.5)));
        }
      }
    }
    poles.count = p; heads.count = hd; lamps.count = lp;
    for (const m of [poles, heads, lamps]) m.instanceMatrix.needsUpdate = true;
  }
  function recolor(now) {
    let lp = 0;
    for (const c of shown) {
      const sx = lightState(c.i, c.j, 'x', now), sz = lightState(c.i, c.j, 'z', now);
      for (let n = 0; n < 2; n++) for (const face of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const st = face[0] ? sx : sz; // الوجه الذي يواجه x يخص السير على x
        for (let k = 0; k < 3; k++) lamps.setColorAt(lp++, (k === 0 && st === 'r') || (k === 1 && st === 'y') || (k === 2 && st === 'g') ? COL[st] : COL.off);
      }
    }
    if (lamps.instanceColor) lamps.instanceColor.needsUpdate = true;
  }
  void e;
  return {
    state: lightState,
    update(cx, cz, now) {
      if (now - lastSet > 1500) { lastSet = now; shown = chooseCorners(cx, cz); layout(); lastColors = 0; }
      if (now - lastColors > 250) { lastColors = now; recolor(now); }
    },
    // أقرب تقاطع لنقطة، وهل النقطة داخل منطقته
    zoneAt(x, z) {
      const i = Math.round(x / BW - 0.5), j = Math.round(z / BD - 0.5), cx = (i + 0.5) * BW, cz = (j + 0.5) * BD;
      return Math.abs(x - cx) < ROAD / 2 + 0.6 && Math.abs(z - cz) < ROAD / 2 + 0.6 && lived(i, j) ? { i, j } : null;
    },
    lived,
  };
}
