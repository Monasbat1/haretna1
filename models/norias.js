// «نواعير حماة»: the water wheels of Hama on the Orontes (the user's ask,
// 2026-11-22: big, turning, realistic, with water). They stand in Syria on
// 5 x 4 blocks of their own at the northern edge of Damascus, towards Hama
// (server.js ensureNorias picks the blocks no house has reached). The site is
// 170 x 88 (x along the river, +z towards the visitor, south):
//  - the Orontes across the middle, between stone quays, with a weir upstream;
//  - four wheels of dark wood turning with the current, the biggest 26 m across
//    like al-Muhammadiyah; each one lifts water in its boxes, the water runs off
//    its rim, and it pours into a trough on its tower;
//  - from the towers the aqueducts on pointed arches carry the water away and
//    let it fall into the gardens' pools;
//  - an old stone bridge, a promenade with lanterns and a café on the south
//    bank, old houses of Hama and poplars on the north bank.
// The static part is baked by the city (norias); each wheel is baked on its own
// and turned (wheel, WHEELS); the water moves (noriaWater) and lights up at
// night (noriaLights).
import * as THREE from 'three';
import { GEO, put, box, cyl, ball, arch, face, win, door, tree, bush, pergola, rng, ablaq, C } from './kit.js';
import { crowd, person, lamp } from './world.js';

export const SIZE = [170, 88];
const HX = SIZE[0] / 2, HZ = SIZE[1] / 2;
export const Y = 1.25;                  // the banks
export const WY = 0.6;                  // the river's surface
const RZ = 7;                           // the river runs between z = -RZ and +RZ
const WZ = -3;                          // the wheels' middle
const TZ = -6.3;                        // the towers and the aqueducts
export const FLOW = 1.4;                // the current, m/s towards +x
const STONE = '#d2bd94', STONE2 = '#c2aa80', STONE3 = '#b49a70', CAP = '#e2d3b2', BASALT = '#55524f';
const WOOD = ['#5c4430', '#684d35', '#523b29'], WET = '#3f2e21', BOXC = '#46331f';
const LAMP = '#f6d77a';
const R_SPEED = 2.2;                    // how fast the rim moves, m/s

// The wheels: x, radius, width. Their middle stands so each dips about a metre into the river.
export const WHEELS = [
  { x: -30, R: 13, W: 2.4 },            // the biggest, like al-Muhammadiyah
  { x: 2, R: 10, W: 2.0 },
  { x: 26, R: 10, W: 2.0 },
  { x: 48, R: 7.5, W: 1.7 },
].map((w) => {
  const yc = WY + w.R - 1.1;
  return { ...w, z: WZ, yc, top: yc + 0.84 * w.R, speed: R_SPEED / w.R };
});
// The aqueducts on the towers' line: from x0 to x1, at the height of their wheel's trough,
// the water running to the end (x1) and falling there into a pool on the north bank.
export const AQUEDUCTS = [
  { x0: WHEELS[0].x + 1.6, x1: -80, h: WHEELS[0].top },
  { x0: WHEELS[2].x + 1.6, x1: -12, h: WHEELS[1].top },
  { x0: WHEELS[3].x - 1.6, x1: 64, h: WHEELS[3].top },
];
const BRIDGE_X = 76, WEIR_X = -62;

const CBOX = new THREE.BoxGeometry(1, 1, 1);           // centred, for parts turned in their own plane
const ZCYL = new THREE.CylinderGeometry(1, 1, 1, 12).rotateX(Math.PI / 2); // along z, centred
// A bar from (x1, y1) to (x2, y2) at depth z: t thick in the wheel's plane, d deep along z.
function bar(g, c, x1, y1, x2, y2, z, t, d) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const m = put(g, CBOX, c, (x1 + x2) / 2, (y1 + y2) / 2, z, len, t, d);
  m.rotation.z = Math.atan2(y2 - y1, x2 - x1);
  return m;
}

// One wheel round its own axle (x across, y up, the axle along z), for the city to turn.
export function wheel(g, w) {
  const { R, W } = w, N = Math.max(24, 2 * Math.round(Math.PI * R / 1.9)), rand = rng(Math.round(R * 100));
  const at = (r, a) => [r * Math.cos(a), r * Math.sin(a)];
  for (const s of [-1, 1]) {
    const z = s * W / 2;
    for (let i = 0; i < N; i++) { // the rim, a little uneven like old timber
      const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2, [x1, y1] = at(R, a0), [x2, y2] = at(R, a1);
      bar(g, WOOD[i % 3], x1, y1, x2, y2, z, 0.42, 0.34);
      bar(g, WET, ...at(R - 0.75, a0), ...at(R - 0.75, a1), z, 0.2, 0.2);
    }
    const N2 = N / 2;
    for (let i = 0; i < N2; i++) bar(g, WOOD[(i + 1) % 3], ...at(R * 0.56, (i / N2) * 6.283), ...at(R * 0.56, ((i + 1) / N2) * 6.283), z, 0.26, 0.26); // the inner ring
    // the spokes: long beams crossing near the hub, each passing it at the same distance (the star of Hama's wheels)
    const K = R > 11 ? 14 : 10, hub = 1.15, d = 2 * Math.asin(hub / R);
    for (let k = 0; k < K; k++) {
      const a = (k / K) * Math.PI * 2 + (s > 0 ? Math.PI / K : 0);
      bar(g, WOOD[k % 3], ...at(R - 0.1, a), ...at(R - 0.1, a + Math.PI - d), z, 0.3, 0.3);
    }
  }
  for (let i = 0; i < N; i++) { // across the two rims: the paddles outside, the boxes that lift the water inside
    const a = (i / N) * Math.PI * 2 + Math.PI / N;
    bar(g, WOOD[i % 3], ...at(R - 0.1, a), ...at(R + 0.85 + rand() * 0.1, a), 0, 0.12, W + 0.25);
    const [bx, by] = at(R - 0.38, a + Math.PI / N * 0.5), m = put(g, CBOX, BOXC, bx, by, 0, 0.55, 0.85, W - 0.2);
    m.rotation.z = a + Math.PI / N * 0.5;
  }
  for (let k = 0; k < 8; k++) { const [x, y] = at(R * 0.56, (k / 8) * 6.283); put(g, ZCYL, WET, x, y, 0, 0.12, 0.12, W); } // ties between the two sides
  put(g, ZCYL, '#3a2c20', 0, 0, 0, 1.25, 1.25, W + 0.4);            // the hub
  put(g, ZCYL, '#2b2420', 0, 0, -(W / 2 + 1.1), 0.32, 0.32, 2.6);   // the axle, into the tower
}

// A wall from x0 to x1 (centre z, d deep, from y0 to y1) opened by pointed arches.
// Two tiers once it is tall, like the aqueducts of Hama; the lower tier's arches reach the ground.
function arcade(g, c, x0, x1, z, y0, y1, d, { span = 4.2, pier = 1.5, tiers = null, top = 1.8 } = {}) {
  const left = Math.min(x0, x1), right = Math.max(x0, x1), total = right - left;
  const n = Math.max(1, Math.round((total - pier) / (span + pier))), s = (total - pier * (n + 1)) / n;
  const nt = tiers || (y1 - y0 > 13 ? 2 : 1);
  const shape = new THREE.Shape();
  shape.moveTo(left, y0); shape.lineTo(right, y0); shape.lineTo(right, y1); shape.lineTo(left, y1); shape.lineTo(left, y0);
  const band = (y1 - y0) / nt;
  for (let t = 0; t < nt; t++) {
    const yb = y0 + band * t + (t ? 1.2 : 0), yt = y0 + band * (t + 1) - (t === nt - 1 ? top : 1.4);
    if (yt - yb < s * 0.9) continue;
    for (let i = 0; i < n; i++) {
      const xa = left + pier + i * (s + pier), r = s / 2, spring = yt - r * 1.35, p = new THREE.Path();
      p.moveTo(xa, yb); p.lineTo(xa, spring); p.quadraticCurveTo(xa, spring + r * 0.95, xa + r, yt);
      p.quadraticCurveTo(xa + s, spring + r * 0.95, xa + s, spring); p.lineTo(xa + s, yb); p.lineTo(xa, yb);
      shape.holes.push(p);
    }
    if (t) box(g, STONE3, (left + right) / 2, y0 + band * t, z, total + 0.3, 0.45, d + 0.3); // the string course between the tiers
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: 5 }).translate(0, 0, -d / 2);
  put(g, geo, c, 0, 0, z);
  box(g, CAP, (left + right) / 2, y1, z, total + 0.5, 0.4, d + 0.5); // the cornice
}

// An old house of Hama: courses of limestone and basalt, small windows, a wooden balcony.
function hamaHouse(g, x, z, w, d, h, rand, ry = 0) {
  const f = face(g, x, z, ry, Y);
  const bands = rand() < 0.5 ? [STONE, STONE, BASALT, STONE] : [CAP, STONE2, CAP, BASALT];
  ablaq(f, 0, 0, 0, w, h, d, Math.round(h / 0.9), bands);
  box(f, CAP, 0, h, 0, w + 0.3, 0.35, d + 0.3);
  for (const sx of [-1, 1]) box(f, CAP, sx * (w / 2 - 0.1), h + 0.35, 0, 0.2, 0.5, d);
  const fr = face(f, 0, d / 2);
  door(fr, -w * 0.25, 1.2, 2.3, '#6b3f22', { arched: true, pointed: true, frame: STONE3 });
  for (const xx of [w * 0.12, w * 0.32]) win(fr, xx, 1.2, 0.8, 1.0, { frame: STONE3, glass: '#7fa8bf', arched: true, bars: false });
  if (h > 5) {
    for (const xx of [-w * 0.3, 0, w * 0.3]) win(fr, xx, h * 0.62, 0.8, 1.1, { frame: STONE3, glass: '#7fa8bf', arched: true, bars: false });
    if (rand() < 0.7) { box(fr, '#7b5434', w * 0.05, h * 0.55, 0.5, w * 0.45, 1.5, 1.0); box(fr, '#5a3620', w * 0.05, h * 0.55 + 1.5, 0.5, w * 0.5, 0.15, 1.1); } // the wooden balcony
  }
  if (rand() < 0.5) for (let i = 0; i < 4; i++) ball(f, '#4f9f5a', (rand() - 0.5) * w, h + 0.5, (rand() - 0.5) * d, 0.4); // plants on the roof
}

export function norias(g) {
  const rand = rng(91);
  // ---- the ground: two banks of gardens and paths, the riverbed between them
  box(g, '#8a7a5c', 0, 0, -(RZ + HZ) / 2, SIZE[0], Y, HZ - RZ);
  box(g, '#8a7a5c', 0, 0, (RZ + HZ) / 2, SIZE[0], Y, HZ - RZ);
  box(g, '#7fb565', 0, Y, -(RZ + 9 + HZ) / 2 - 1, SIZE[0] - 2, 0.06, HZ - RZ - 11);
  box(g, '#7fb565', 0, Y, (RZ + 15 + HZ) / 2, SIZE[0] - 2, 0.06, HZ - RZ - 16);
  box(g, '#3d5a50', 0, -0.05, 0, SIZE[0], 0.3, RZ * 2);
  // the quays: stone walls up from the water, a parapet, lanterns on posts
  for (const s of [-1, 1]) {
    box(g, STONE2, 0, 0, s * RZ, SIZE[0], Y + 0.05, 0.9);
    for (let x = -HX + 1; x < HX; x += 2.2) box(g, (Math.round(x) % 2) ? STONE3 : STONE2, x, 0.35 + (Math.round(x * 3) % 3) * 0.25, s * (RZ - 0.47), 2.1, 0.22, 0.05); // the courses
    for (let x = -HX + 2; x < HX - 1; x += 3.2) if (Math.abs(x - BRIDGE_X) > 4) box(g, CAP, x, Y + 0.05, s * (RZ + 0.1), 2.6, 0.55, 0.45);
    for (let x = -HX + 6; x < HX - 4; x += 12) if (Math.abs(x - BRIDGE_X) > 6) lamp(g, x, Y, s * (RZ + 0.6), { h: 3.2, light: LAMP });
  }
  // the outer wall of the site, steps down to the streets in the middle of each long side
  for (const s of [-1, 1]) {
    box(g, STONE3, 0, 0, s * (HZ - 0.4), SIZE[0], Y + 0.35, 0.8);
    box(g, STONE3, s * (HX - 0.4), 0, 0, 0.8, Y + 0.35, SIZE[1]);
    for (let k = 0; k < 3; k++) box(g, CAP, 0, k * 0.42, s * (HZ + 0.6 - k * 0.5), 10, 0.42, 0.5);
  }
  // the weir upstream, slanting across the river
  { const wf = face(g, WEIR_X, 0, 0.35); box(wf, STONE3, 0, 0, 0, 1.6, WY + 0.25, RZ * 2 + 1); box(wf, CAP, 0, WY + 0.25, 0, 1.8, 0.12, RZ * 2 + 1); }

  // ---- the towers: from the river up to each wheel's trough, the axle's bearing, the trough
  for (const w of WHEELS) {
    const h = w.top + 0.1;
    box(g, STONE, w.x, 0, TZ, 3.4, h, 2.6);
    for (let y = 1.5; y < h - 1; y += 1.15) box(g, STONE3, w.x, y, TZ, 3.5, 0.12, 2.7); // courses
    arch(g, '#2b2622', w.x, Y + 0.4, TZ + 1.32, 1.1, 2.0, 0.06, 0, true);
    box(g, BASALT, w.x - 0.6, w.yc - 0.6, TZ + 1.0, 1.2, 1.2, 0.8);               // the bearing
    box(g, STONE3, w.x - 1.6, w.top, -4.9, 4.4, 0.35, 1.4);                         // the trough
    for (const s of [-1, 1]) box(g, STONE3, w.x - 1.6, w.top + 0.35, -4.9 + s * 0.6, 4.4, 0.45, 0.18);
    box(g, STONE3, w.x - 1.6, w.top - 2.2, -4.9, 0.9, 2.2, 0.9);                   // its post
  }
  // ---- the aqueducts on pointed arches, the water running on top, the end towers with their spouts
  for (const A of AQUEDUCTS) {
    arcade(g, STONE, A.x0, A.x1, TZ, 0, A.h, 2.4);
    for (const s of [-1, 1]) box(g, CAP, (A.x0 + A.x1) / 2, A.h + 0.4, TZ + s * 1.05, Math.abs(A.x1 - A.x0), 0.5, 0.3); // the channel's sides
    const dir = Math.sign(A.x1 - A.x0);
    box(g, STONE2, A.x1 + dir * 1.6, 0, TZ, 3.4, A.h + 1.4, 3.4);                  // the end tower
    box(g, CAP, A.x1 + dir * 1.6, A.h + 1.4, TZ, 3.8, 0.4, 3.8);
    box(g, STONE3, A.x1 + dir * 1.6, A.h - 0.2, TZ - 2.4, 0.9, 0.35, 1.6);          // the spout, over the pool
    // the pool on the north bank where its water falls
    box(g, STONE2, A.x1 + dir * 1.6, Y - 0.1, TZ - 6.5, 8.5, 0.55, 6.5);
    box(g, '#3d5a50', A.x1 + dir * 1.6, Y + 0.05, TZ - 6.5, 7.5, 0.42, 5.5);
  }
  // ---- the stone bridge downstream
  { const b = face(g, BRIDGE_X, 0, Math.PI / 2);
    arcade(b, STONE2, -RZ - 0.5, RZ + 0.5, 0, -0.3, Y + 1.6, 5, { span: 2.5, pier: 1.0, tiers: 1, top: 0.55 });
    for (const s of [-1, 1]) box(b, CAP, 0, Y + 2.0, s * 2.3, RZ * 2 + 6, 0.8, 0.35);
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) box(b, STONE3, s * (RZ + 1.2 + k * 0.8), Y + 1.6 - k * 0.42, 0, 0.8, 0.42, 4.6); // the steps down to the banks
  }

  // ---- the south bank: the promenade, benches, the café under vines, people looking at the wheels
  box(g, '#d8ccb0', 0, Y + 0.02, RZ + 4.5, SIZE[0] - 2, 0.06, 7);
  for (let x = -HX + 8; x < HX - 8; x += 9) if (Math.abs(x - BRIDGE_X) > 7) { box(g, '#7b5434', x, Y, RZ + 2.0, 2.2, 0.45, 0.55); box(g, '#5a3620', x, Y + 0.45, RZ + 2.25, 2.2, 0.5, 0.1); }
  crowd(g, 55, [-HX + 6, HX - 6, RZ + 1.4, RZ + 7.5], rand, { y: Y, free: (x) => Math.abs(x - BRIDGE_X) > 4 });
  for (const [cx, cz] of [[-12, 22], [8, 22], [-2, 31]]) {
    pergola(g, cx, cz, 8, 6, 2.6, { y: Y, seed: Math.round(cx + cz) });
    for (const [tx, tz] of [[-2, -1.4], [2, -1.4], [-2, 1.4], [2, 1.4]]) {
      cyl(g, '#e9e1cf', cx + tx, Y, cz + tz, 0.08, 0.75, 8); cyl(g, '#e9e1cf', cx + tx, Y + 0.75, cz + tz, 0.5, 0.06, 10);
      for (const s of [-1, 1]) { box(g, '#2e7d5b', cx + tx + s * 0.75, Y, cz + tz, 0.4, 0.45, 0.4); person(g, cx + tx + s * 0.75, Y + 0.05, cz + tz, Math.round(tx * 3 + tz + s), 0.8); }
    }
  }
  box(g, '#d8ccb0', 0, Y + 0.02, 26, 3, 0.06, 30);
  // the gardens: poplars along the walls, fruit trees, bushes (on the banks)
  const bank = face(g, 0, 0, 0, Y);
  for (let x = -HX + 4; x < HX - 3; x += 6.5) for (const z of [HZ - 3, -HZ + 3]) tree(bank, x + (rand() - 0.5), z, 1.5 + rand() * 0.5, 'cypress');
  const free = (x, z) => !(Math.abs(x + 2) < 18 && z > 16 && z < 36) && Math.abs(x) > 2.5;
  for (let i = 0; i < 70; i++) {
    const x = -HX + 6 + rand() * (SIZE[0] - 12), z = RZ + 10 + rand() * (HZ - RZ - 14);
    if (free(x, z)) (rand() < 0.75 ? tree : bush)(bank, x, z, 0.9 + rand() * 0.5, ['apple', 'round', 'olive', 'citrus'][i % 4]);
  }
  // ---- the north bank: old houses of Hama behind the aqueducts, gardens round them
  const houses = [[-70, -30, 12, 9, 7], [-52, -34, 10, 8, 5], [-36, -27, 9, 8, 6.5], [-16, -33, 12, 10, 7.5], [4, -27, 9, 7, 5],
    [20, -33, 11, 9, 7], [38, -28, 10, 8, 6], [56, -34, 12, 9, 7.5], [74, -28, 9, 8, 5]];
  for (const [x, z, w, d, h] of houses) hamaHouse(g, x, z, w, d, h, rand);
  for (let i = 0; i < 60; i++) {
    const x = -HX + 5 + rand() * (SIZE[0] - 10), z = -RZ - 5 - rand() * 13;
    if (AQUEDUCTS.some((A) => Math.abs(x - A.x1 - Math.sign(A.x1 - A.x0) * 1.6) < 6 && z > TZ - 11)) continue;
    tree(bank, x, z, 0.9 + rand() * 0.6, ['apple', 'round', 'cypress', 'olive'][i % 4]);
  }
  crowd(g, 18, [-HX + 6, HX - 6, -RZ - 4, -RZ - 1.2], rand, { y: Y });
}
norias.label = 'نواعير حماة';
norias.top = 26;
norias.size = SIZE;
norias.floodlight = { color: '#ffd59a', at: [WHEELS[0].x, 10, 12] };

// ---- the water: the river, the aqueducts' channels, the falls, the drops off the wheels, the foam
function waterTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d'), rand = rng(7);
  ctx.fillStyle = '#7fb4c0'; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 260; i++) { // streaks along the current
    const x = rand() * 256, y = rand() * 256, w = 12 + rand() * 46, a = 0.08 + rand() * 0.2;
    ctx.fillStyle = rand() < 0.55 ? `rgba(255,255,255,${a})` : `rgba(30,70,80,${a})`;
    ctx.fillRect(x, y, w, 1 + rand() * 2.5);
    if (x + w > 256) ctx.fillRect(x - 256, y, w, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export function noriaWater() {
  const group = new THREE.Group(), base = waterTexture(), scrolls = [];
  const sheet = (w, h, color, opacity, rx, ry, speed) => { // a scrolling sheet of water (speed in its texture's v or u)
    const tex = base.clone();
    tex.needsUpdate = true;
    tex.repeat.set(rx, ry);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: tex, color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide }));
    m.raycast = () => {};
    scrolls.push([tex, speed]);
    group.add(m);
    return m;
  };
  // the river
  const river = sheet(SIZE[0], RZ * 2 - 0.9, '#5d9aa8', 0.93, 9, 1.4, [-FLOW / (SIZE[0] / 9), 0]);
  river.rotation.x = -Math.PI / 2; river.position.y = WY;
  // the white water over the weir, and under each wheel
  const foamMat = new THREE.MeshLambertMaterial({ color: '#f4fbff', transparent: true, opacity: 0.6, depthWrite: false });
  const foams = [];
  const foam = (x, z, w, d, ry = 0) => { const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d), foamMat.clone()); f.rotation.x = -Math.PI / 2; f.rotation.z = ry; f.position.set(x, WY + 0.04, z); f.raycast = () => {}; group.add(f); foams.push(f); return f; };
  for (let k = -2; k <= 2; k++) foam(WEIR_X + 1.2 + k * 0.35 * 2.5, k * 2.6, 2.4, 2.8, -0.35);
  for (const w of WHEELS) for (const s of [-1, 1]) foam(w.x + s * 0.55 * w.R, w.z, 2.2, w.W + 1.2);
  // the water in the troughs and along the aqueducts, running to their far end
  for (const w of WHEELS) { const t = sheet(4.2, 1.0, '#6aa8b5', 0.95, 1, 1, [0.5, 0]); t.rotation.x = -Math.PI / 2; t.position.set(w.x - 1.6, w.top + 0.4, -4.9); }
  for (const A of AQUEDUCTS) {
    const len = Math.abs(A.x1 - A.x0), dir = Math.sign(A.x1 - A.x0);
    const ch = sheet(len, 1.8, '#6aa8b5', 0.95, len / 12, 0.5, [-dir * 1.2 / 12, 0]);
    ch.rotation.x = -Math.PI / 2; ch.position.set((A.x0 + A.x1) / 2, A.h + 0.45, TZ);
    // the fall from the spout into the pool
    const fallH = A.h - 0.2 - Y;
    const fall = sheet(1.0, fallH, '#d6eef4', 0.8, 0.4, fallH / 6, [0, 0.9]);
    fall.position.set(A.x1 + dir * 1.6, Y + fallH / 2, TZ - 3.2);
    const splash = foam(A.x1 + dir * 1.6, TZ - 3.4, 3, 3); splash.position.y = Y + 0.5;
  }
  // the water poured from the boxes into the trough near the top of each wheel
  for (const w of WHEELS) {
    const y0 = w.yc + 0.97 * w.R, h = Math.max(0.6, y0 - w.top - 0.4);
    const p = sheet(0.7, h, '#d6eef4', 0.7, 0.3, 0.5, [0, 1.1]);
    p.position.set(w.x - 0.3 * w.R, w.top + 0.4 + h / 2, -4.4);
  }
  // the drops running off each wheel: born on its rising side, flying off with the rim, falling back into the river
  const PER = 70, all = WHEELS.length * PER;
  const drops = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, 0.42, 0.09), new THREE.MeshLambertMaterial({ color: '#d8f0f6', transparent: true, opacity: 0.75, depthWrite: false }), all);
  drops.frustumCulled = false; drops.raycast = () => {};
  group.add(drops);
  const seeds = [], rand = rng(5);
  WHEELS.forEach((w, wi) => {
    for (let i = 0; i < PER; i++) {
      const side = rand() < 0.8; // most from the rising side, some spilling past the top
      const phi = side ? -0.55 + rand() * 1.95 : 1.65 + rand() * 0.5;
      seeds.push({ w, phi, z: w.z + (rand() - 0.5) * w.W, period: 1.1 + rand() * 1.4, phase: rand() * 10, wi });
    }
  });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(), zAxis = new THREE.Vector3(0, 0, 1);
  const wheelsSpin = []; // the city hands over each wheel's mesh (setWheels)
  let last = 0;
  const update = (t) => {
    const dt = Math.min(0.1, Math.max(0, t - last)); last = t;
    for (const [tex, [u, v]] of scrolls) { tex.offset.x = (tex.offset.x + u * dt) % 1; tex.offset.y = (tex.offset.y + v * dt) % 1; }
    foams.forEach((f, i) => { f.material.opacity = 0.45 + 0.25 * Math.sin(t * 3.1 + i * 1.7) * Math.sin(t * 1.3 + i); });
    for (const { mesh, w } of wheelsSpin) mesh.rotation.z = t * w.speed;
    seeds.forEach((s, i) => {
      const { w } = s, u = (t + s.phase) % s.period;
      const vx = -Math.sin(s.phi) * w.R * w.speed, vy = Math.cos(s.phi) * w.R * w.speed;
      const x = w.x + w.R * Math.cos(s.phi) + vx * u, y = w.yc + w.R * Math.sin(s.phi) + vy * u - 4.9 * u * u;
      if (y < WY) { m4.makeScale(0, 0, 0); drops.setMatrixAt(i, m4); return; }
      q.setFromAxisAngle(zAxis, Math.atan2(vy - 9.8 * u, vx) - Math.PI / 2);
      m4.compose(p.set(x, y, s.z), q, sc.set(1, 1 + Math.min(2, u * 2), 1));
      drops.setMatrixAt(i, m4);
    });
    drops.instanceMatrix.needsUpdate = true;
  };
  return { group, update, setWheels: (list) => wheelsSpin.push(...list) };
}
norias.water = noriaWater;

// ---- at night: the wheels washed gold from the quays, light on the water, the arches lit from below
export function noriaLights() {
  const group = new THREE.Group(), mats = [];
  const glow = (color, strength) => {
    const m = new THREE.MeshBasicMaterial({ color, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
    mats.push([m, strength]);
    return m;
  };
  const shade = (geo, k) => {
    const p = geo.attributes.position, col = [];
    for (let i = 0; i < p.count; i++) { const v = k(p.getX(i), p.getY(i), p.getZ(i), i); col.push(v, v, v); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return geo;
  };
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.raycast = () => {}; group.add(o); return o; };
  const gold = glow('#ffc874', 0.3), water = glow('#ffd28a', 0.35), arches = glow('#ffb45c', 0.38);
  const up = new THREE.Vector3(0, 1, 0);
  for (const w of WHEELS) {
    // two lamps on the south quay throw light up across the face of the wheel, fading as it rises
    for (const s of [-1, 1]) {
      const a = new THREE.Vector3(w.x + s * w.R * 0.45, Y + 0.3, RZ + 0.2), b = new THREE.Vector3(w.x + s * w.R * 0.15, w.yc + w.R * 0.55, w.z + w.W / 2), len = a.distanceTo(b);
      const m = add(shade(new THREE.CylinderGeometry(w.R * 0.55, 0.3, len, 16, 6, true).translate(0, len / 2, 0), (px, y) => 0.9 * Math.pow(1 - y / len, 1.3)), gold, a.x, a.y, a.z);
      m.quaternion.setFromUnitVectors(up, b.clone().sub(a).normalize());
    }
    add(shade(new THREE.CircleGeometry(w.R * 0.7, 20).rotateX(-Math.PI / 2), (x, y, z, i) => (i === 0 ? 1 : 0)), water, w.x, WY + 0.08, w.z + 2.5);
  }
  for (const A of AQUEDUCTS) { // the arches' face towards the river
    const len = Math.abs(A.x1 - A.x0);
    add(shade(new THREE.PlaneGeometry(len, A.h, 1, 6).translate(0, A.h / 2, 0), (x, y) => 0.1 + 0.9 * Math.pow(1 - y / A.h, 1.4)), arches, (A.x0 + A.x1) / 2, 0, TZ + 1.3);
  }
  for (let x = -HX + 6; x < HX - 4; x += 12) if (Math.abs(x - BRIDGE_X) > 6) for (const s of [-1, 1]) add(shade(new THREE.PlaneGeometry(1.4, 9).rotateX(-Math.PI / 2), (px, py, pz) => Math.max(0, 1 - Math.abs(pz) / 4.5)), water, x, WY + 0.06, s * (RZ - 4.6)); // the lanterns' reflections
  return { group, mats };
}
norias.lights = noriaLights;
