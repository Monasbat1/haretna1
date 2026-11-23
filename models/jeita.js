// «مغارة جعيتا»: Jeita Grotto in Lebanon (the user's ask, 2026-11-23: real and big).
// It stands in Lebanon's village on blocks of its own past the last house, west of the
// middle like the real one north of Beirut (server.js ensureJeita). The site is 175 x 115
// (+z towards the visitor, south):
//  - a limestone mountain of Mount Lebanon across the back, pines on its green slopes,
//    a cliff of layered rock along its foot;
//  - in the cliff the mouth of the lower grotto, and through it the cave itself: a great
//    hall under the mountain, its stalactites and stalagmites lit amber, white and blue
//    over the underground lake, like the real one;
//  - the river (Nahr al-Kalb) coming out of the cave between stone quays, the boats
//    taking visitors in and bringing them out, a jetty and a footbridge;
//  - the cable car from the visitor centre up the cliff to the upper grotto's door;
//  - the visitor centre and its square on the right bank, a café garden on the left.
// The static part is baked by the city (jeita); the cave's lit stone (jeitaCave), the
// water, the boats and the cabins (jeitaWater) and the lights at night (jeitaLights)
// are their own.
import * as THREE from 'three';
import { put, box, cyl, cone, ball, face, win, door, tree, rng, shine, C } from './kit.js';
import { rock, strata, cliff, crowd, person, lamp, flagPole } from './world.js';

export const SIZE = [175, 115];
const HX = SIZE[0] / 2, HZ = SIZE[1] / 2;
export const Y = 1.25;                   // the banks and the square (over the town's own ground, like the norias)
export const WY = 0.95;                  // the water
const BED = 0.7;                         // the river's and the lake's bed
const CLIFF_Z = -5, BACK = -9;           // the cliff's middle line; the mountain starts behind it
export const RIVER = { x0: -15, x1: -5 }; // the river between its quays, out of the cave to the front edge
export const MOUTH = { x0: -24, x1: 4, h: 15 }; // the lower grotto's mouth in the cliff
export const HALL = { x0: -32, x1: 12, z0: -52, z1: BACK, h: 22 }; // the cave inside the mountain
export const DOCK = { x: -2.5, z: 30 };   // the jetty on the right bank
const LIME = ['#d8cfbd', '#cbc1ac', '#bfb49d', '#e0d8c6'], LIME_DARK = '#a89c86';
const GREEN = ['#5f8f4a', '#6c9a52', '#557f43'], CAVE = '#3b3430', CAVE2 = '#4a413a';

// The mountain's height: f along the cliff's top, rising behind it, falling to the site's edges.
const smooth = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
const edgeX = (x) => smooth(HX, HX - 16, Math.abs(x));
export const cliffTop = (x) => (6 + 28 * Math.exp(-((x / 55) ** 2)) + 3 * Math.sin(0.13 * x)) * edgeX(x);
export function height(x, z) {
  const t = Math.max(0, Math.min(1, (BACK - z) / (BACK + HZ)));
  const ridge = 18 + 9 * Math.sin(0.05 * x + 1);
  const n = 2.2 * Math.sin(0.21 * x + 0.13 * z) * Math.sin(0.17 * z - 0.11 * x);
  return Math.max(0, (cliffTop(x) + ridge * Math.sin(Math.PI * t * 0.85) * edgeX(x) + n * edgeX(x)) * smooth(-HZ, -HZ + 9, z));
}
// The cable car: from the visitor centre's station up to the upper grotto's.
const UP_X = 42, UP_Z = -13;
export const CABLE = { a: [56, 8.6, 38], b: [UP_X, cliffTop(UP_X) + 4.6, UP_Z + 2] };

// A bar from p to q (any direction), w x d thick.
const CBOX = new THREE.BoxGeometry(1, 1, 1);
function bar(g, c, p, q, w, d = w) {
  const a = new THREE.Vector3(...p), b = new THREE.Vector3(...q), len = a.distanceTo(b);
  const m = put(g, CBOX, c, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, w, len, d);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize());
  return m;
}
// A pine standing on the slope at (x, z).
function pine(g, x, z, s, rand) {
  const y = height(x, z);
  if (y < 1) return;
  const f = face(g, x, z, rand() * 6, y - 0.2);
  cyl(f, '#6b4a30', 0, 0, 0, 0.18 * s, 1.6 * s, 8);
  cone(f, rand() < 0.5 ? '#2f6b3e' : '#3b7a47', 0, 1.0 * s, 0, 1.5 * s, 2.4 * s);
  cone(f, '#36744a', 0, 2.3 * s, 0, 1.1 * s, 2.0 * s);
}

export function jeita(g) {
  const rand = rng(23);
  // ---- the ground: the banks and the square, the river's bed between them
  box(g, '#8dbb6a', (-HX + RIVER.x0) / 2, 0, (CLIFF_Z + HZ) / 2, RIVER.x0 + HX, Y, HZ - CLIFF_Z);      // left bank
  box(g, '#d9d2c2', (RIVER.x1 + HX) / 2, 0, (CLIFF_Z + HZ) / 2, HX - RIVER.x1, Y, HZ - CLIFF_Z);       // right bank, paved
  box(g, '#8dbb6a', 50, Y, 12, 66, 0.04, 22);                                                          // a lawn on it
  box(g, '#24403f', (RIVER.x0 + RIVER.x1) / 2, 0, (BACK + HZ) / 2, RIVER.x1 - RIVER.x0, BED, HZ - BACK); // the river's bed
  for (const x of [RIVER.x0, RIVER.x1]) box(g, '#cfc6b4', x, 0, (CLIFF_Z + HZ) / 2, 0.9, Y + 0.25, HZ - CLIFF_Z); // the quays' edges
  // ---- the cave: its floor, walls and roof (the lit stone is jeitaCave)
  const H = HALL;
  box(g, '#1f3a3c', (H.x0 + H.x1) / 2, 0, (H.z0 + H.z1) / 2, H.x1 - H.x0, BED, H.z1 - H.z0);
  box(g, CAVE, H.x0 - 1, 0, (H.z0 + H.z1) / 2, 2, H.h + 1, H.z1 - H.z0);
  box(g, CAVE, H.x1 + 1, 0, (H.z0 + H.z1) / 2, 2, H.h + 1, H.z1 - H.z0);
  box(g, CAVE, (H.x0 + H.x1) / 2, 0, H.z0 - 1, H.x1 - H.x0 + 4, H.h + 1, 2);
  box(g, CAVE2, (H.x0 + H.x1) / 2, H.h, (H.z0 + H.z1) / 2, H.x1 - H.x0 + 4, 1.2, H.z1 - H.z0 + 2);
  for (let i = 0; i < 26; i++) { // the hall's rough walls and the ledges along them
    const side = i % 2 ? H.x0 + 1.2 : H.x1 - 1.2, z = H.z0 + 3 + rand() * (H.z1 - H.z0 - 6);
    rock(g, i % 3 ? CAVE : CAVE2, side, 1 + rand() * 14, z, 2 + rand() * 2.5, 2 + rand() * 4, 2 + rand() * 3, rand() * 6);
  }
  for (const [x0, x1] of [[H.x0 + 0.5, H.x0 + 5], [H.x1 - 5, H.x1 - 0.5]]) box(g, '#5a5048', (x0 + x1) / 2, 0, (H.z0 + 8 + BACK) / 2, x1 - x0, Y + 0.15, BACK - H.z0 - 8); // walkways
  // ---- the cliff along the mountain's foot, the mouth open in it
  const stone = LIME, caps = GREEN;
  const run = (a, b) => { const pts = []; for (let x = a; x <= b + 0.01; x += (b - a) / Math.max(1, Math.round((b - a) / 9))) pts.push([x, CLIFF_Z, Math.max(1.2, cliffTop(x))]); return pts; };
  cliff(g, run(-HX + 4, MOUTH.x0 - 1), stone, rand, { thick: 8, step: 4, jitter: 0.7, caps });
  cliff(g, run(MOUTH.x1 + 1, HX - 4), stone, rand, { thick: 8, step: 4, jitter: 0.7, caps });
  for (let x = MOUTH.x0 + 1.5; x < MOUTH.x1; x += 4.7) { // over the mouth, its top in a rough arch
    const k = (x - (MOUTH.x0 + MOUTH.x1) / 2) / ((MOUTH.x1 - MOUTH.x0) / 2), y0 = MOUTH.h - 3.5 * (1 - k * k) * 0 + 3.2 * k * k;
    strata(g, x, CLIFF_Z, 5.4, 8, y0, cliffTop(x) * (0.95 + rand() * 0.1), stone, rand, { jitter: 0.5, shrink: 0.1 });
    rock(g, LIME_DARK, x, y0 + 0.3, CLIFF_Z + 3.6, 2.2, 1.4, 1.4, rand() * 6); // drips of stone hanging over the mouth
    cone(g, '#e6dcc8', x + 1.2, y0 - 1.9, CLIFF_Z + 3.2, 0.45, 2.1).rotation.x = Math.PI;
  }
  for (const [x, s] of [[MOUTH.x0 - 0.5, -1], [MOUTH.x1 + 0.5, 1]]) for (let y = 1; y < MOUTH.h + 2; y += 3.2) rock(g, LIME[(y | 0) % 4], x + s * rand() * 1.2, y, CLIFF_Z + 2, 2.4 + rand(), 2.2, 3.5, rand() * 6); // the mouth's rounded sides
  // ---- the mountain behind: a height field, steep faces in bare limestone, gentle ones green
  const buckets = new Map(), STEP_X = 3.5, STEP_Z = 3.2;
  const add = (c, ...pts) => { if (!buckets.has(c)) buckets.set(c, []); buckets.get(c).push(...pts.flat()); };
  const P = (x, z) => [x, height(x, z), z];
  const n = new THREE.Vector3(), u = new THREE.Vector3(), v = new THREE.Vector3();
  for (let x = -HX; x < HX - 0.01; x += STEP_X) for (let z = -HZ; z < CLIFF_Z - 0.01; z += STEP_Z) { // over the cliff's top too, so no gap shows
    const x1 = Math.min(HX, x + STEP_X), z1 = Math.min(CLIFF_Z, z + STEP_Z);
    for (const tri of [[P(x, z), P(x, z1), P(x1, z)], [P(x1, z), P(x, z1), P(x1, z1)]]) {
      if (tri.every((p) => p[1] < 0.05)) continue;
      u.set(...tri[1]).sub(v.set(...tri[0])); n.set(...tri[2]).sub(v); n.crossVectors(u, n).normalize();
      const steep = Math.abs(n.y) < 0.72 + 0.12 * Math.sin(x * 0.4 + z * 0.3), r = rand();
      add(steep ? LIME[Math.floor(r * 4)] : GREEN[Math.floor(r * 3)], ...tri);
    }
  }
  for (const [c, flat] of buckets) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(flat, 3));
    put(g, geo, c, 0, 0, 0);
  }
  for (let i = 0; i < 230; i++) { // pines on the slopes, thicker towards the top
    const x = -HX + 8 + rand() * (SIZE[0] - 16), z = -HZ + 6 + rand() * (BACK - 4 + HZ - 6);
    const h = height(x, z), dx = height(x + 1, z) - h, dz = height(x, z + 1) - h;
    if (Math.hypot(dx, dz) < 1.1 && rand() < 0.85) pine(g, x, z, 1.1 + rand() * 0.9, rand);
  }
  // ---- the river's banks: the jetty, the footbridge, lamps along the quays
  box(g, '#7a5a3c', DOCK.x, Y - 0.1, DOCK.z, 5, 0.3, 9);                                // the jetty
  for (const dz of [-4, 0, 4]) for (const dx of [-2.2, 2.2]) cyl(g, '#5c4430', DOCK.x + dx, 0, DOCK.z + dz, 0.15, Y + 0.6, 8);
  box(g, '#cfc6b4', (RIVER.x0 + RIVER.x1) / 2, Y + 1.2, 46, RIVER.x1 - RIVER.x0 + 5, 0.5, 3.4);   // the footbridge
  for (const s of [-1, 1]) box(g, '#e2d8c4', (RIVER.x0 + RIVER.x1) / 2, Y + 1.7, 46 + s * 1.55, RIVER.x1 - RIVER.x0 + 5, 0.7, 0.25);
  for (const x of [RIVER.x0 - 1.6, RIVER.x1 + 1.6]) box(g, '#cfc6b4', x, 0, 46, 2.4, Y + 1.25, 3.4);
  for (let z = 2; z < HZ - 2; z += 9) for (const x of [RIVER.x0 - 1.4, RIVER.x1 + 1.4]) if (Math.abs(z - 46) > 3) lamp(g, x, Y, z);
  // ---- the visitor centre and its square on the right bank
  const vc = face(g, 30, 24, 0, Y);
  box(vc, '#e9e2d2', 0, 0, 0, 24, 6, 11);
  box(vc, '#7a6a55', 0, 6, 0, 25.5, 0.6, 12.5);
  for (let x = -10; x <= 10; x += 2.5) win(face(vc, x, 5.51), 0, 1.0, 1.9, 3.6, { arched: false });
  door(face(vc, 0, 5.51), 0, 3, 3.8, '#5b6f7a');
  box(vc, '#3d6b50', 0, 6.6, 3.2, 14, 1.3, 0.3);                                         // the board for the name (city.js writes it)
  box(g, '#e6dcc8', 30, Y, 38, 30, 0.06, 14);                                           // the square in front
  ball(g, '#cfc6b4', 30, Y + 0.6, 38, 2.2, 0.35);                                       // its round basin
  // the lower cable car station
  const ls = face(g, CABLE.a[0] + 2, CABLE.a[2] + 1.5, 0, Y);
  box(ls, '#d6d0c4', 0, 0, 0, 9, 4.2, 7);
  box(ls, '#b23a3a', 0, 4.2, 0, 10, 0.8, 8);
  box(ls, '#5d6670', -1.8, 4.9, -0.5, 0.6, 3.4, 0.6);
  for (const x of [-3, 0, 3]) win(face(ls, x, 3.51), 0, 1.0, 1.8, 2.2);
  // the café garden on the left bank: tables under umbrellas, pines
  for (let i = 0; i < 14; i++) {
    const x = -78 + (i % 7) * 8.5, z = 14 + Math.floor(i / 7) * 11 + rand() * 2;
    cyl(g, '#e8e2d6', x, Y, z, 0.55, 0.75, 8);
    cyl(g, '#8a8a8a', x, Y + 0.75, z, 0.05, 1.7, 6);
    cone(g, i % 2 ? '#c0392b' : '#f4f1ea', x, Y + 2.3, z, 1.7, 0.7);
  }
  for (let i = 0; i < 24; i++) { const x = -HX + 5 + rand() * 60, z = 4 + rand() * 50; if (Math.abs(z - 20) > 10) tree(face(g, x, z, 0, Y), 0, 0, 1.4 + rand() * 0.6, 'pine'); }
  for (let i = 0; i < 12; i++) tree(face(g, 64 + rand() * 20, 2 + rand() * 52, 0, Y), 0, 0, 1.3 + rand() * 0.5, 'pine');
  // visitors: on the square, on the quays, queueing on the jetty
  crowd(g, 46, [8, 70, 30, 55], rand, { y: Y, free: (x, z) => Math.hypot(x - 30, z - 38) > 3 });
  crowd(g, 20, [-70, -24, 4, 40], rand, { y: Y });
  for (let i = 0; i < 9; i++) person(g, DOCK.x + 1.6, Y + 0.2, DOCK.z + 4.5 - i * 0.9, i);
  // ---- the upper grotto: its door in the cliff top and the cable car's upper station
  const up = face(g, UP_X, UP_Z, 0, cliffTop(UP_X) - 0.4);
  box(up, '#d6d0c4', 0, 0, 0, 9, 4.6, 6);
  box(up, '#b23a3a', 0, 4.6, 0, 10, 0.7, 7);
  for (const x of [-2.5, 2.5]) win(face(up, x, 3.01), 0, 1.0, 1.6, 2.2);
  box(g, '#2a2420', UP_X - 9, cliffTop(UP_X - 9) - 0.6, UP_Z - 3, 4.4, 5, 1.2);          // the upper grotto's dark door
  box(g, LIME_DARK, UP_X - 9, cliffTop(UP_X - 9) + 4.2, UP_Z - 2.6, 6, 0.9, 1.6);
  // the cable car's cables and its one pylon half way
  const mid = [(CABLE.a[0] + CABLE.b[0]) / 2 + 3, 0, (CABLE.a[2] + CABLE.b[2]) / 2];
  const midTop = (CABLE.a[1] + CABLE.b[1]) / 2 - 1.2;
  bar(g, '#6c737c', [mid[0], Y, mid[2]], [mid[0], midTop + 1.2, mid[2]], 0.8);
  box(g, '#6c737c', mid[0], midTop + 1.2, mid[2], 4, 0.5, 0.8);
  for (const dx of [-1.3, 1.3]) {
    const a = [CABLE.a[0] + dx, CABLE.a[1], CABLE.a[2]], m = [mid[0] + dx, midTop + 1.5, mid[2]], b = [CABLE.b[0] + dx, CABLE.b[1], CABLE.b[2]];
    bar(g, '#2b2f38', a, m, 0.09); bar(g, '#2b2f38', m, b, 0.09);
  }
  // Lebanon's flag over the square
  jeita.flag = { code: 'lb', ...flagPole(g, 46, Y, 30, 11) };
}
jeita.label = 'مغارة جعيتا';
jeita.top = 62;
jeita.size = SIZE;
jeita.sign = { x: 30, y: Y + 7.25, z: 24 + 5.5 + 0.18, w: 13.4, h: 1.15 }; // the visitor centre's name board
jeita.floodlight = { color: '#ffcf8a', at: [(MOUTH.x0 + MOUTH.x1) / 2, 8, 14] };

// ---- the cave's stone, lit like the real one: amber, warm white and some blue
export function jeitaCave() {
  const group = new THREE.Group(), rand = rng(41), H = HALL;
  const cones = [];
  const hang = (x, z, len, r, top) => cones.push({ x, y: top, z, len, r, down: true });
  const rise = (x, z, len, r) => cones.push({ x, y: Y - 0.4, z, len, r, down: false });
  for (let i = 0; i < 150; i++) hang(H.x0 + 2 + rand() * (H.x1 - H.x0 - 4), H.z0 + 2 + rand() * (H.z1 - H.z0 - 2), 1.5 + rand() ** 2.4 * 9, 0.3 + rand() * 0.8, H.h);
  for (let i = 0; i < 18; i++) hang(MOUTH.x0 + 1 + rand() * (MOUTH.x1 - MOUTH.x0 - 2), BACK + 1 + rand() * 2.5, 1.2 + rand() * 2.6, 0.25 + rand() * 0.4, MOUTH.h + 0.8);
  for (let i = 0; i < 90; i++) { // stalagmites on the walkways along the walls, none in the water
    const x = rand() < 0.5 ? H.x0 + 1 + rand() * 3.5 : H.x1 - 1 - rand() * 3.5;
    rise(x, H.z0 + 2 + rand() * (H.z1 - H.z0 - 6), 1.2 + rand() ** 2 * 7, 0.4 + rand() * 0.9);
  }
  for (let i = 0; i < 8; i++) { // columns where the two have met
    const x = i % 2 ? H.x0 + 2.5 + rand() * 1.5 : H.x1 - 2.5 - rand() * 1.5, z = H.z0 + 4 + rand() * 30;
    rise(x, z, H.h * 0.55, 1.4 + rand()); hang(x, z, H.h * 0.5, 1.2 + rand(), H.h);
  }
  const geo = new THREE.ConeGeometry(1, 1, 7, 3).translate(0, 0.5, 0), gp = geo.attributes.position, shadeTip = [];
  for (let i = 0; i < gp.count; i++) { const k = 1 - 0.5 * gp.getY(i); shadeTip.push(k, k * 0.97, k * 0.92); } // lit at the root, darker to the tip
  geo.setAttribute('color', new THREE.Float32BufferAttribute(shadeTip, 3));
  const tones = ['#f3e3c3', '#e9c58f', '#f0b765', '#d99a52', '#fff3dc', '#ead2a6', '#f3e3c3', '#9cc6f2'];
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: '#ffffff', vertexColors: true, fog: false }), cones.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), flip = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI), col = new THREE.Color();
  cones.forEach((c, i) => {
    m4.compose(p.set(c.x, c.y, c.z), c.down ? flip : q.identity(), s.set(c.r, c.len, c.r));
    mesh.setMatrixAt(i, m4);
    const deep = Math.max(0, Math.min(1, (BACK - c.z) / (BACK - H.z0)));
    col.set(tones[Math.floor(rand() * tones.length)]).multiplyScalar(0.62 + 0.38 * (1 - deep * 0.5));
    mesh.setColorAt(i, col);
  });
  mesh.raycast = () => {};
  group.add(mesh);
  // the light on the hall's walls and roof: warm in front, blue at the back
  const glow = (w, h, a, b, x, y, z, rx = 0, ry = 0, opacity = 0.55) => {
    const gg = new THREE.PlaneGeometry(w, h, 1, 8), pos = gg.attributes.position, cl = [];
    const ca = new THREE.Color(a), cb = new THREE.Color(b);
    for (let i = 0; i < pos.count; i++) { const k = (pos.getY(i) + h / 2) / h; const c2 = ca.clone().lerp(cb, k); cl.push(c2.r, c2.g, c2.b); }
    gg.setAttribute('color', new THREE.Float32BufferAttribute(cl, 3));
    const m = new THREE.Mesh(gg, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.raycast = () => {};
    group.add(m);
  };
  glow(H.x1 - H.x0, H.h, '#ffad5c', '#26406a', (H.x0 + H.x1) / 2, H.h / 2, H.z0 + 0.2, 0, 0, 0.42);   // the back wall
  glow(H.z1 - H.z0, H.h, '#ffb35a', '#5a4632', H.x0 + 0.2, H.h / 2, (H.z0 + H.z1) / 2, 0, Math.PI / 2, 0.3);
  glow(H.z1 - H.z0, H.h, '#ffb35a', '#3c4f6a', H.x1 - 0.2, H.h / 2, (H.z0 + H.z1) / 2, 0, -Math.PI / 2, 0.3);
  glow(H.x1 - H.x0, H.z1 - H.z0, '#c98a4a', '#2a3550', (H.x0 + H.x1) / 2, H.h - 0.2, (H.z0 + H.z1) / 2, Math.PI / 2, 0, 0.18); // the roof
  return group;
}
jeita.cave = jeitaCave;

// ---- the water (the lake in the cave, the river out of it), the boats, the cable car's cabins
function waterTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d'), rand = rng(9);
  ctx.fillStyle = '#7fb4c0'; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 240; i++) {
    const x = rand() * 256, y = rand() * 256, h = 12 + rand() * 40, a = 0.08 + rand() * 0.2;
    ctx.fillStyle = rand() < 0.55 ? `rgba(255,255,255,${a})` : `rgba(30,70,80,${a})`;
    ctx.fillRect(x, y, 1 + rand() * 2.5, h);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function boat(g) { // a flat boat with its boatman at the back and visitors on its benches
  box(g, '#e9e4da', 0, 0, 0, 1.9, 0.55, 6.2);
  box(g, '#2e6f8e', 0, 0.45, 0, 2.0, 0.14, 6.3);
  box(g, '#f4f1ea', 0, 0.55, 2.9, 1.6, 0.2, 0.5);
  for (let k = 0; k < 4; k++) for (const sx of [-0.45, 0.45]) person(g, sx, 0.25, -1.9 + k * 1.15, k * 2 + (sx > 0), 0.75);
  person(g, 0, 0.3, -2.8, 3, 0.95);
}
export function jeitaWater() {
  const group = new THREE.Group(), base = waterTexture(), scrolls = [];
  const sheet = (w, h, color, opacity, rx, ry, speed) => {
    const tex = base.clone(); tex.needsUpdate = true; tex.repeat.set(rx, ry);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: tex, color, transparent: true, opacity, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.raycast = () => {};
    scrolls.push([tex, speed]); group.add(m);
    return m;
  };
  const rw = RIVER.x1 - RIVER.x0 - 0.9, len = HZ - BACK;
  sheet(rw, len, '#5d9aa8', 0.92, 1.2, len / 9, [0, 0.9 / 9]).position.set((RIVER.x0 + RIVER.x1) / 2, WY, (BACK + HZ) / 2);
  const H = HALL; // the lake: still, dark and clear, lit from the stone above
  const lake = new THREE.Mesh(new THREE.PlaneGeometry(H.x1 - H.x0, H.z1 - H.z0), new THREE.MeshBasicMaterial({ color: '#173f47', transparent: true, opacity: 0.9, depthWrite: false, fog: false }));
  lake.rotation.x = -Math.PI / 2; lake.position.set((H.x0 + H.x1) / 2, WY, (H.z0 + H.z1) / 2); lake.raycast = () => {};
  group.add(lake);
  // the boats: up the left lane into the cave, round the lake, back down the right lane to the jetty
  const boatGeo = new THREE.Group(); boat(boatGeo);
  const boats = [];
  for (let i = 0; i < 5; i++) { const b = boatGeo.clone(); b.traverse((o) => { o.raycast = () => {}; }); group.add(b); boats.push(b); }
  const L1 = RIVER.x0 + 2.6, L2 = RIVER.x1 - 2.6, zIn = DOCK.z + 2, zFar = H.z0 + 10;
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(L2, 0, zIn), new THREE.Vector3(L1, 0, zIn - 6), new THREE.Vector3(L1, 0, 0), new THREE.Vector3(L1 - 3, 0, BACK - 10),
    new THREE.Vector3(H.x0 + 8, 0, zFar + 8), new THREE.Vector3((H.x0 + H.x1) / 2 - 4, 0, zFar - 4), new THREE.Vector3(H.x1 - 8, 0, zFar + 6),
    new THREE.Vector3(L2 + 3, 0, BACK - 10), new THREE.Vector3(L2, 0, 0), new THREE.Vector3(L2, 0, zIn - 4),
  ], true, 'catmullrom', 0.5);
  const total = path.getLength(), SPEED = 2.4;
  // the cable car: two cabins, one going up while the other comes down
  const cab = new THREE.Group();
  box(cab, '#d9342b', -1.1, -2.6, -0.9, 2.2, 1.9, 1.8);
  box(cab, '#9fc9d8', -1.15, -2.0, -0.95, 2.3, 0.8, 1.9);
  box(cab, '#2b2f38', -0.06, -0.7, -0.06, 0.12, 1.9, 0.12);
  cab.children.forEach((m) => { m.position.x += 1.1; m.position.z += 0.9; });
  const cabins = [0, 1].map(() => { const c = cab.clone(); group.add(c); return c; });
  const A = new THREE.Vector3(...CABLE.a), B = new THREE.Vector3(...CABLE.b), M = new THREE.Vector3((A.x + B.x) / 2 + 3, (A.y + B.y) / 2 + 0.3, (A.z + B.z) / 2);
  const onCable = (k, dx, out) => { (k < 0.5 ? out.lerpVectors(A, M, k * 2) : out.lerpVectors(M, B, k * 2 - 1)); out.x += dx; return out; };
  const v = new THREE.Vector3(), tan = new THREE.Vector3();
  const ride = { k: null }; // while someone takes the tour (city.js), the first boat carries them: its place on the path
  let last = 0;
  const update = (t) => {
    const dt = Math.min(0.1, Math.max(0, t - last)); last = t;
    for (const [tex, [uu, vv]] of scrolls) { tex.offset.x = (tex.offset.x + uu * dt) % 1; tex.offset.y = (tex.offset.y + vv * dt) % 1; }
    boats.forEach((b, i) => {
      const k = i === 0 && ride.k !== null ? ride.k : ((t * SPEED) / total + i / boats.length) % 1;
      path.getPointAt(k, v); path.getTangentAt(k, tan);
      b.position.set(v.x, WY - 0.2, v.z);
      b.rotation.y = Math.atan2(tan.x, tan.z);
    });
    const climb = 70; // seconds up or down
    cabins.forEach((c, i) => {
      const ph = ((t / climb + i * 0.5) % 2), k = ph < 1 ? ph : 2 - ph, s = k * k * (3 - 2 * k);
      onCable(s, i ? 1.3 : -1.3, c.position);
    });
  };
  return { group, update, path, total, ride };
}
jeita.water = jeitaWater;

// ---- at night: the cliff washed gold, the mouth glowing, light on the river
export function jeitaLights() {
  const group = new THREE.Group(), mats = [];
  const glowMat = (color, strength) => {
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
  const gold = glowMat('#ffc874', 0.22), water = glowMat('#ffd28a', 0.35);
  for (let x = -HX + 14; x < HX - 10; x += 16) { // the cliff's face, lit from its foot
    const h = cliffTop(x);
    if (h < 4) continue;
    add(shade(new THREE.PlaneGeometry(15, h, 6, 6).translate(0, h / 2, 0), (px, y) => Math.max(0, 1 - Math.abs(px) / 7.5) * (0.15 + 0.85 * Math.pow(1 - y / h, 1.3))), gold, x, 0, CLIFF_Z + 4.4);
  }
  for (let z = 4; z < HZ - 2; z += 9) add(shade(new THREE.PlaneGeometry(1.2, 6).rotateX(-Math.PI / 2), (px, py, pz) => Math.max(0, 1 - Math.abs(pz) / 3)), water, (RIVER.x0 + RIVER.x1) / 2, WY + 0.06, z);
  return { group, mats };
}
jeita.lights = jeitaLights;
