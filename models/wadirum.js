// «وادي رم» (Wadi Rum), south of Jordan's village on the road to Egypt and
// Aqaba: red sand, the rounded sandstone mountains (jebels), the rock arch,
// and a desert camp of bubble tents round a Bedouin tent and a fire, with
// candles and lanterns everywhere that light the sand at night.
// Built round 0, 0 over about 150 x 110 (x east, +z south); the road to Egypt
// passes just east of it (x = 97.5), and a sand track runs from it to the camp.
import * as THREE from 'three';
import { GEO, put, box, cyl, cone, ball, gable, face, shine, rng, C } from './kit.js';
import { rock, strata, camel, person, crowd } from './world.js';

const ROCKS = ['#c0562f', '#a94a2a', '#d4703f', '#b8613a', '#9b4327', '#cf6a3c'];
const CAPS = ['#b04d2b', '#c86440', '#9e4529'];
const SAND = '#e2a067', SAND2 = '#d58f57', SAND3 = '#eab27c';
const FLAME = shine('#ffc95c', 3), FLAME2 = shine('#ff8a2a', 3);
const CANDLE = '#f6ead2', WAX = '#efe1c2';
const WINDOW = shine('#ffd79a', 1);      // a bubble's round window, warm at night
const LANTERN = shine('#ffbf5a', 3);
export const TRACK = { z: 5, from: 89.5, to: 56 }; // the sand track from the road to the camp
export const CAMP = { x: 34, z: 5 };              // the fire in the middle of the camp
const DOMES = []; // [x, z, facing, clear]
for (let i = 0; i < 9; i++) {
  const a = Math.PI * (1.08 + (i / 8) * 0.84), R = 21;
  DOMES.push([CAMP.x + Math.cos(a) * R, CAMP.z + Math.sin(a) * R * 0.9, Math.atan2(-Math.cos(a), -Math.sin(a)), i % 3 === 1]); // the door and the window towards the fire
}
export const CLEAR = DOMES.filter((d) => d[3]);

const sandShape = (() => { // the edge of the sand, not a straight line anywhere
  const s = new THREE.Shape(), r = rng(7), n = 40;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const ex = Math.cos(a), ez = Math.sin(a);
    const k = 1 + (r() - 0.5) * 0.12;
    const x = Math.sign(ex) * Math.pow(Math.abs(ex), 0.6) * 80 * k, z = Math.sign(ez) * Math.pow(Math.abs(ez), 0.6) * 60 * k;
    if (i) s.lineTo(x, -z); else s.moveTo(x, -z);
  }
  return new THREE.ExtrudeGeometry(s, { depth: 0.28, bevelEnabled: false }).rotateX(-Math.PI / 2);
})();

// A rounded sandstone mountain: a core in layers, buttresses round it, domed tops.
function jebel(g, x, z, w, d, h, rand) {
  strata(g, x, z, w, d, 0.2, h, ROCKS, rand, { jitter: 1.6, layer: [2.6, 5.2], shrink: 0.38, tilt: 0.06 });
  const n = Math.round((w + d) / 6);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand() * 0.4, bx = x + Math.cos(a) * w * 0.48, bz = z + Math.sin(a) * d * 0.48;
    strata(g, bx, bz, 4 + rand() * 6, 4 + rand() * 6, 0.2, h * (0.35 + rand() * 0.45), ROCKS, rand, { jitter: 0.9, layer: [2, 4.2], shrink: 0.3 });
    rock(g, CAPS[i % 3], bx, h * (0.35 + rand() * 0.2), bz, 2.5 + rand() * 2.5, 1.2 + rand(), 2.5 + rand() * 2.5, rand() * 6);
  }
  for (let i = 0; i < 4; i++) {
    rock(g, CAPS[i % 3], x + (rand() - 0.5) * w * 0.35, h - 0.6, z + (rand() - 0.5) * d * 0.35, w * (0.16 + rand() * 0.1), 2.2 + rand() * 1.6, d * (0.16 + rand() * 0.1), rand() * 6);
  }
  for (let i = 0; i < 10; i++) { // fallen boulders at the foot
    const a = rand() * Math.PI * 2;
    rock(g, ROCKS[i % ROCKS.length], x + Math.cos(a) * (w * 0.55 + rand() * 4), 0.5, z + Math.sin(a) * (d * 0.55 + rand() * 4), 0.6 + rand() * 1.2, 0.5 + rand() * 0.6, 0.6 + rand() * 1.2, rand() * 6);
  }
}

function candle(g, x, z, h = 0.35) {
  cyl(g, CANDLE, x, 0.28, z, 0.09, h, 8);
  box(g, FLAME, x, 0.28 + h, z, 0.07, 0.16, 0.07);
}
function lantern(g, x, z, y = 0.28) {
  box(g, '#3a2f29', x, y, z, 0.42, 0.08, 0.42);
  box(g, LANTERN, x, y + 0.08, z, 0.32, 0.46, 0.32);
  for (const [dx, dz] of [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]]) box(g, '#3a2f29', x + dx, y + 0.08, z + dz, 0.05, 0.46, 0.05);
  cone(g, '#3a2f29', x, y + 0.54, z, 0.26, 0.24);
}

function bubble(g, x, z, ry, clear) {
  const f = face(g, x, z, ry, 0.28);
  cyl(f, '#8a5a34', 0, 0, 0, 3.4, 0.35, 16);              // the wooden deck
  if (!clear) {
    put(f, GEO.halfBall, '#f7f5ef', 0, 0.35, 0, 2.9, 2.9, 2.9);
    // the big round window, on the dome's skin above the door
    const rim = cyl(f, '#d8d4ca', 0, 2.1, 2.3, 1.12, 0.08, 18);
    rim.rotation.x = Math.PI / 2 - 0.65;
    const w = cyl(f, WINDOW, 0, 2.1, 2.36, 1.0, 0.08, 18);
    w.rotation.x = Math.PI / 2 - 0.65;
  }
  box(f, '#f7f5ef', 0, 0.35, 2.9, 1.3, 1.9, 1.0);          // the entrance
  box(f, '#8a5a34', 0, 0.35, 3.42, 0.9, 1.6, 0.06);
  // inside: a big white bed with cushions, a lamp
  box(f, '#efe9de', 0, 0.35, -0.6, 2.2, 0.55, 2.0);
  box(f, '#f8f6f0', 0, 0.9, -0.6, 2.1, 0.12, 1.9);
  for (const dx of [-0.5, 0.5]) box(f, '#c4643a', dx, 1.02, -1.35, 0.7, 0.3, 0.3);
  box(f, LANTERN, 1.5, 0.35, -1.2, 0.25, 0.5, 0.25);
  for (const dx of [-1.1, 1.1]) candle(f, dx, 3.8, 0.3);
  lantern(f, 1.0, 3.6, 0.35);
}

function bedouinTent(g, x, z) {
  const f = face(g, x, z, 0, 0.28);
  box(f, '#b2263c', 0, 0, 0, 14, 0.06, 6.4);                // the carpet
  for (let i = 0; i < 7; i++) box(f, i % 2 ? '#e8c35a' : '#2f6b4f', -6 + i * 2, 0.06, 0, 0.25, 0.02, 6.2);
  for (const dx of [-6.6, -2.2, 2.2, 6.6]) for (const dz of [-2.8, 2.8]) cyl(f, '#5a3620', dx, 0, dz, 0.08, 2.6, 6);
  gable(f, '#3b2f29', -3.6, 2.4, 0, 7.4, 1.0, 6.8);         // the black goat-hair roof
  gable(f, '#33281f', 3.6, 2.4, 0, 7.4, 1.0, 6.8);
  box(f, '#3b2f29', 0, 0, 3.2, 14.2, 2.4, 0.08);             // the back wall (the open side faces the fire)
  for (let i = 0; i < 14; i++) box(f, i % 2 ? '#9c2a24' : '#efe3c9', -6.5 + i, 0.4, 3.12, 1.0, 0.35, 0.04); // its woven band
  for (let i = 0; i < 6; i++) {                              // floor cushions along the back
    box(f, ['#9c2a24', '#2f6b4f', '#c4643a'][i % 3], -5.5 + i * 2.2, 0.06, 2.2, 1.8, 0.4, 1.0);
    box(f, ['#c4643a', '#9c2a24', '#2f6b4f'][i % 3], -5.5 + i * 2.2, 0.46, 2.75, 1.8, 0.7, 0.3);
  }
  box(f, '#5a3620', 0, 0.06, 0.5, 2.2, 0.45, 1.0);           // a low table, the coffee pots on it
  for (const dx of [-0.5, 0.4]) { cyl(f, '#d6ad4e', dx, 0.51, 0.5, 0.17, 0.35, 8); cone(f, '#d6ad4e', dx, 0.86, 0.5, 0.12, 0.2); }
  for (const dx of [-6.6, 6.6]) lantern(f, dx, -2.8, 2.0);
  for (const dx of [-4, -1.5, 1.5, 4]) lantern(f, dx, 1.5, 0.06);
}

function campfire(g, x, z, rand) {
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; rock(g, '#8a8580', x + Math.cos(a) * 1.3, 0.45, z + Math.sin(a) * 1.3, 0.32, 0.26, 0.32, rand() * 6); }
  for (let i = 0; i < 3; i++) box(g, '#5a3620', x, 0.32, z, 2.0, 0.25, 0.25, (i * Math.PI) / 3);
  cone(g, FLAME2, x, 0.45, z, 0.8, 1.9);
  cone(g, FLAME, x + 0.15, 0.45, z - 0.1, 0.48, 1.4);
  cone(g, FLAME, x - 0.3, 0.45, z + 0.2, 0.36, 1.0);
  for (let i = 0; i < 10; i++) { // cushions round the fire, and the people on them
    const a = (i / 10) * Math.PI * 2;
    box(g, ['#9c2a24', '#2f6b4f', '#c4643a', '#e8c35a'][i % 4], x + Math.cos(a) * 4.2, 0.28, z + Math.sin(a) * 4.2, 1.2, 0.35, 1.2, -a);
    if (i % 2 === 0) person(g, x + Math.cos(a) * 4.2, 0.6, z + Math.sin(a) * 4.2, i, 0.8);
  }
  for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2; candle(g, x + Math.cos(a) * 6.3, z + Math.sin(a) * 6.3, 0.25 + (i % 3) * 0.1); }
}

function jeep(g, x, z, ry, color = '#efe8d6') {
  const f = face(g, x, z, ry, 0.28);
  box(f, color, 0, 0.55, 0, 1.9, 0.9, 4.2);
  box(f, color, 0, 1.45, -0.4, 1.8, 0.75, 2.4);
  box(f, '#4a6b85', 0, 1.55, 0.82, 1.6, 0.5, 0.04);
  for (const s of [-1, 1]) box(f, '#4a6b85', s * 0.91, 1.55, -0.4, 0.04, 0.45, 2.0);
  for (const [dx, dz] of [[-0.95, -1.3], [0.95, -1.3], [-0.95, 1.3], [0.95, 1.3]]) { const w = cyl(f, '#26282c', dx - Math.sign(dx) * 0.12, 0.42, dz, 0.42, 0.24, 10); w.rotation.z = Math.PI / 2; }
  box(f, '#3a3d44', 0, 2.2, -0.4, 1.7, 0.1, 2.2);           // the roof rack
  for (const s of [-0.6, 0.6]) box(f, '#f6e6a8', s, 0.8, 2.11, 0.35, 0.2, 0.04);
}

export function wadiRum(g) {
  const rand = rng(31);
  put(g, sandShape, SAND, 0, 0, 0);                          // the red sand
  for (let i = 0; i < 70; i++) {                             // dunes and ripples
    const x = (rand() - 0.5) * 140, z = (rand() - 0.5) * 100;
    if (Math.hypot(x - CAMP.x, z - CAMP.z) < 30 || (Math.abs(z - TRACK.z) < 6 && x > 40)) continue;
    rock(g, [SAND, SAND2, SAND3][i % 3], x, 0.2, z, 3 + rand() * 6, 0.5 + rand() * 0.9, 1.6 + rand() * 3, rand() * 6);
  }
  box(g, '#c98a55', (TRACK.from + TRACK.to) / 2, 0.24, TRACK.z, TRACK.from - TRACK.to + 6, 0.08, 5); // the track from the road
  for (let i = 0; i < 18; i++) box(g, '#b97b49', TRACK.to + 2 + i * 1.8, 0.33, TRACK.z + (i % 2 ? 1.1 : -1.1), 0.9, 0.02, 0.35); // tyre marks

  // the mountains, and the rock arch
  jebel(g, -48, -32, 40, 28, 34, rand);
  jebel(g, -62, 14, 24, 32, 27, rand);
  jebel(g, 4, -42, 38, 16, 22, rand);
  jebel(g, -30, 42, 30, 16, 19, rand);
  jebel(g, 62, -38, 18, 14, 15, rand);
  for (const dx of [-6.5, 6.5]) strata(g, 16 + dx, 36, 4.5, 4, 0.2, 11, ROCKS, rand, { jitter: 0.5, layer: [1.6, 2.8], shrink: 0.15 });
  strata(g, 16, 36, 18, 3.6, 10.6, 13.6, ROCKS, rand, { jitter: 0.3, layer: [1.2, 1.8], shrink: 0.05 });
  for (let i = 0; i < 4; i++) rock(g, CAPS[i % 3], 10 + i * 4, 13.6, 36, 2.2, 1.0, 1.8, rand() * 6);
  // the mushroom rock
  strata(g, -6, 18, 2.2, 2.2, 0.2, 5, ROCKS, rand, { jitter: 0.15, layer: [1, 1.6], shrink: 0.1 });
  rock(g, CAPS[0], -6, 5.6, 18, 4.2, 1.6, 3.6, 0.4);

  // the camp: the bubbles in an arc round the fire, the Bedouin tent across it
  for (const [x, z, ry, clear] of DOMES) bubble(g, x, z, ry, clear);
  bedouinTent(g, CAMP.x, CAMP.z + 14);
  campfire(g, CAMP.x, CAMP.z, rand);
  // candles all along the track, lanterns on posts
  for (let x = TRACK.to + 1; x < TRACK.from - 2; x += 1.6) for (const s of [-1, 1]) candle(g, x, TRACK.z + s * 3.1, 0.25 + ((x * 7) % 3) * 0.08);
  for (let x = TRACK.to + 4; x < TRACK.from - 2; x += 8) for (const s of [-1, 1]) {
    cyl(g, '#5a3620', x, 0.28, TRACK.z + s * 3.8, 0.07, 1.6, 6);
    lantern(g, x, TRACK.z + s * 3.8, 1.85);
  }
  for (let i = 0; i < 40; i++) { // candles in little groups on the sand round the camp
    const a = rand() * Math.PI * 2, r = 9 + rand() * 18, x = CAMP.x + Math.cos(a) * r, z = CAMP.z + Math.sin(a) * r;
    if (DOMES.some(([dx, dz]) => Math.hypot(x - dx, z - dz) < 4.5) || (Math.abs(x - CAMP.x) < 8 && z > CAMP.z + 9 && z < CAMP.z + 19)) continue;
    for (let k = 0; k < 3; k++) candle(g, x + (k - 1) * 0.35, z + (k % 2) * 0.3, 0.2 + k * 0.12);
  }
  for (const [x, z, ry] of [[12, -8, 0.4], [9, -3, 1.8], [14, 2, 2.6], [6, 4, 0.9]]) camel(g, x, 0.28, z, ry);
  jeep(g, 60, 13, 0.2);
  jeep(g, 64, -4, 2.6, '#c98a3c');
  crowd(g, 6, [24, 46, 9, 12], rand, { y: 0.34 });
  for (let i = 0; i < 16; i++) { // desert shrubs
    const x = (rand() - 0.5) * 130, z = (rand() - 0.5) * 90;
    if (Math.hypot(x - CAMP.x, z - CAMP.z) < 28) continue;
    ball(g, ['#7d8a4a', '#6b7a3e', '#8c9653'][i % 3], x, 0.5, z, 0.6 + rand() * 0.5, 0.6);
  }
}
wadiRum.label = 'وادي رم';
wadiRum.top = 36;
wadiRum.floodlight = { color: '#ffb35a', at: [CAMP.x, 8, CAMP.z] };

// The see-through shells of the clear bubbles (their beds show inside).
export function wadiRumShells() {
  const group = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: '#dff3ff', transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide });
  const geo = new THREE.SphereGeometry(2.9, 18, 9, 0, Math.PI * 2, 0, Math.PI / 2);
  for (const [x, z] of CLEAR) { const m = new THREE.Mesh(geo, mat); m.position.set(x, 0.63, z); group.add(m); }
  return group;
}

// At night: the glow of the fire, the candles and the bubbles on the sand
// (additive, faded in with the night; mats: [material, strength]).
export function wadiRumLights() {
  const group = new THREE.Group(), mats = [];
  const glow = (color, strength) => {
    const m = new THREE.MeshBasicMaterial({ color, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    mats.push([m, strength]);
    return m;
  };
  const pool = (r) => {
    const geo = new THREE.CircleGeometry(r, 24).rotateX(-Math.PI / 2), col = [];
    for (let i = 0; i < geo.attributes.position.count; i++) { const v = i === 0 ? 1 : 0; col.push(v, v, v); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return geo;
  };
  const warm = glow('#ff9a3c', 0.9), soft = glow('#ffc070', 0.55), dome = glow('#ffd59a', 0.5);
  const add = (geo, m, x, z, y = 0.34) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.raycast = () => {}; group.add(o); };
  add(pool(11), warm, CAMP.x, CAMP.z);
  const small = pool(1.6);
  for (let x = TRACK.to + 1; x < TRACK.from - 2; x += 3.2) for (const s of [-1, 1]) add(small, soft, x, TRACK.z + s * 3.1);
  for (let i = 0; i < 26; i += 2) { const a = (i / 26) * Math.PI * 2; add(small, soft, CAMP.x + Math.cos(a) * 6.3, CAMP.z + Math.sin(a) * 6.3); }
  const big = pool(5.5);
  for (const [x, z] of DOMES) add(big, dome, x, z, 0.3);
  add(pool(9), soft, CAMP.x, CAMP.z + 14);
  // the clear bubbles glow from inside
  const inner = new THREE.SphereGeometry(2.7, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), col = [];
  for (let i = 0; i < inner.attributes.position.count; i++) { const v = 0.15 + 0.5 * (1 - inner.attributes.position.getY(i) / 2.7); col.push(v, v, v); }
  inner.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  for (const [x, z] of CLEAR) add(inner, dome, x, z, 0.64);
  return { group, mats };
}
wadiRum.lights = wadiRumLights;
wadiRum.shells = wadiRumShells;
