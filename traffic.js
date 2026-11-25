// إشارات المرور: كل تقاطع مأهول له إشارتان (4 وجوه) تتناوبان أخضر ← أصفر ← أحمر.
// السيارات العادية تقف عند الإشارة الحمراء وأمام أي سيارة أو شخص في طريقها،
// وسيارتك (drive.js) تُسجَّل عليها مخالفة إن قطعت الإشارة الحمراء.
import * as THREE_MOD from 'three';

export const CYCLE = 24; // ثانية: 10 أخضر (x) + 2 أصفر + 10 أخضر (z) + 2 أصفر
const GREEN = 10, YELLOW = 2;
const off = (i, j) => ((i * 7 + j * 13) % 12 + 12) % 12;

export function lightState(i, j, axis, nowMs) {
  const t = Number.isFinite(nowMs) ? nowMs : performance.now();
  const p = (((t / 1000 + off(i, j)) % CYCLE) + CYCLE) % CYCLE;
  if (axis === 'x') return p < GREEN ? 'g' : p < GREEN + YELLOW ? 'y' : 'r';
  const q = (p + GREEN + YELLOW) % CYCLE;
  return q < GREEN ? 'g' : q < GREEN + YELLOW ? 'y' : 'r';
}

export function createTraffic(opts = {}) {
  const THREE = (opts && opts.THREE) || THREE_MOD || globalThis.THREE;
  const scene = opts && opts.scene;
  const BW = (opts && opts.BW) || 40;
  const BD = (opts && opts.BD) || 40;
  const ROAD = (opts && opts.ROAD) || 10;
  const paved = typeof (opts && opts.paved) === 'function' ? opts.paved : () => 0;

  if (!THREE || typeof THREE.Color !== 'function' || !scene) {
    console.warn('[traffic.js] THREE أو scene غير متوفر، تم تشغيل الوضع الآمن.');
    return {
      state: lightState,
      update() {},
      zoneAt() { return null; },
      lived: () => false,
    };
  }

  const MAXI = 36, RADIUS = 260;
  const H = ROAD / 2 + 0.9;
  const COL = {
    g: new THREE.Color('#25e06a'),
    y: new THREE.Color('#ffc21a'),
    r: new THREE.Color('#ff3b30'),
    off: new THREE.Color('#2a2d33'),
  };
  const poleMat = new THREE.MeshLambertMaterial({ color: '#3b3f47' });
  const headMat = new THREE.MeshLambertMaterial({ color: '#16181c' });
  const lampMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const poles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.14, 1, 8), poleMat, MAXI * 2);
  const heads = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), headMat, MAXI * 2);
  const lamps = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), lampMat, MAXI * 2 * 12);
  for (const m of [poles, heads, lamps]) {
    m.frustumCulled = false;
    m.count = 0;
    scene.add(m);
  }
  lamps.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAXI * 2 * 12 * 3).fill(1), 3);

  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const v = new THREE.Vector3();
  const s = new THREE.Vector3();
  let shown = [], lastSet = 0, lastColors = 0;

  const lived = (i, j) => (paved(i, j) + paved(i + 1, j) + paved(i, j + 1) + paved(i + 1, j + 1)) >= 2;

  function chooseCorners(cx, cz) {
    const i0 = Math.floor(cx / BW);
    const j0 = Math.floor(cz / BD);
    const R = Math.ceil(RADIUS / Math.min(BW, BD)) + 1;
    const out = [];
    for (let i = i0 - R; i <= i0 + R; i++) {
      for (let j = j0 - R; j <= j0 + R; j++) {
        const x = (i + 0.5) * BW;
        const z = (j + 0.5) * BD;
        const d = (x - cx) ** 2 + (z - cz) ** 2;
        if (d < RADIUS * RADIUS && lived(i, j)) out.push({ i, j, x, z, d });
      }
    }
    out.sort((a, b) => a.d - b.d);
    return out.slice(0, MAXI);
  }

  function layout() {
    let p = 0, hd = 0, lp = 0;
    for (const c of shown) {
      for (const sx of [1, -1]) {
        const x = c.x + sx * H, z = c.z + sx * H;
        poles.setMatrixAt(p++, m4.compose(v.set(x, 2.1, z), q.identity(), s.set(1, 4.2, 1)));
        heads.setMatrixAt(hd++, m4.compose(v.set(x, 4.6, z), q.identity(), s.set(0.8, 2.1, 0.8)));
        for (const face of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          for (let k = 0; k < 3; k++) {
            lamps.setMatrixAt(
              lp++,
              m4.compose(
                v.set(x + face[0] * 0.42, 5.3 - k * 0.7, z + face[1] * 0.42),
                q.identity(),
                s.set(face[0] ? 0.06 : 0.5, 0.5, face[1] ? 0.06 : 0.5)
              )
            );
          }
        }
      }
    }
    poles.count = p;
    heads.count = hd;
    lamps.count = lp;
    for (const m of [poles, heads, lamps]) m.instanceMatrix.needsUpdate = true;
  }

  function recolor(now) {
    let lp = 0;
    for (const c of shown) {
      const sx = lightState(c.i, c.j, 'x', now);
      const sz = lightState(c.i, c.j, 'z', now);
      for (let n = 0; n < 2; n++) {
        for (const face of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const st = face[0] ? sx : sz;
          for (let k = 0; k < 3; k++) {
            const active = (k === 0 && st === 'r') || (k === 1 && st === 'y') || (k === 2 && st === 'g');
            lamps.setColorAt(lp++, active ? COL[st] : COL.off);
          }
        }
      }
    }
    if (lamps.instanceColor) lamps.instanceColor.needsUpdate = true;
  }

  return {
    state: lightState,
    update(cx, cz, now) {
      const t = Number.isFinite(now) ? now : performance.now();
      if (t - lastSet > 1500) {
        lastSet = t;
        shown = chooseCorners(cx, cz);
        layout();
        lastColors = 0;
      }
      if (t - lastColors > 250) {
        lastColors = t;
        recolor(t);
      }
    },
    zoneAt(x, z) {
      const i = Math.round(x / BW - 0.5);
      const j = Math.round(z / BD - 0.5);
      const cx = (i + 0.5) * BW;
      const cz = (j + 0.5) * BD;
      return Math.abs(x - cx) < ROAD / 2 + 0.6 && Math.abs(z - cz) < ROAD / 2 + 0.6 && lived(i, j)
        ? { i, j }
        : null;
    },
    lived,
  };
}
