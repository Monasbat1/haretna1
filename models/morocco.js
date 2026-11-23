// «المغرب»: a riad (a house round a courtyard with an orange tree and a tiled
// fountain), and the Koutoubia of Marrakech with its gardens.
import * as THREE from 'three';
import { C, GEO, put, box, cyl, taper, ball, gable, hip, face, win, lot, tree, bush, vine, pot, lattice, rng, shine, RIGHT, LEFT, BACK } from './kit.js';
import { horseshoe, merlons, crowd, lamp, flagPole } from './world.js';

// ---------------------------------------------------------------- the riad
const LOOKS = [
  { wall: '#dc9670', low: '#cf835f', accent: '#2f7d6b', door: '#6b3f26', climb: ['#d6337a', '#e85a9b'] }, // Marrakech, rose
  { wall: '#e2bc84', low: '#d4a96e', accent: '#2c5f8a', door: '#5a3620', climb: ['#f08a24', '#e85a9b'] }, // Fes, ochre
  { wall: '#eef2f7', low: '#4f86c6', accent: '#3d6fb6', door: '#2f5f9e', climb: ['#d6337a', '#ffffff'] }, // Chefchaouen, white and blue
];
const ZELLIGE = ['#2f7d6b', '#f3efe6', '#1f5f8b', '#e0b84a'];
const GREEN_TILE = '#2f7d5b', BRASS = '#f6d77a';

// A frame of little coloured tiles round a door (the "alfiz").
function zelligeFrame(f, x, y, w, h, s = 0.2) {
  box(f, '#f3efe6', x, y, 0.02, w, h, 0.05);
  const nx = Math.round(w / s), ny = Math.round(h / s);
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    if (i > 0 && i < nx - 1 && j < ny - 1) continue; // only the border
    box(f, ZELLIGE[(i + j) % 4], x - w / 2 + (i + 0.5) * (w / nx), y + j * (h / ny), 0.05, w / nx - 0.03, h / ny - 0.03, 0.03);
  }
}

export function moroccoHouse(g, v = {}) {
  const look = { ...LOOKS[0], ...v };
  if (!v.bare) lot(g, { ground: '#d9c7a3' });
  box(g, '#dccbb0', 0, 0, 0.1, 6.6, 0.05, 8.2);
  const T = 5.4, Y = 0.05;
  // four wings round the courtyard, a darker band at the bottom of the outer walls
  for (const [x, z, w, d] of [[0, -2.85, 6, 1.9], [0, 1.4, 6, 1.6], [-2.15, -0.65, 1.7, 2.5], [2.15, -0.65, 1.7, 2.5]]) {
    box(g, look.wall, x, Y, z, w, T, d);
  }
  box(g, look.low, 0, Y, 2.21, 6.04, 1.0, 0.04);
  for (const s of [-1, 1]) box(g, look.low, s * 3.01, Y, -0.8, 0.04, 1.0, 6.0);
  // parapet and battlements
  for (const [x, z, w, d] of [[0, 2.13, 6, 0.16], [0, -3.73, 6, 0.16], [-2.93, -0.8, 0.16, 6], [2.93, -0.8, 0.16, 6]]) box(g, look.wall, x, Y + T, z, w, 0.4, d);
  merlons(g, look.wall, -2.85, 2.13, 2.85, 2.13, Y + T + 0.4, { w: 0.3, h: 0.32, gap: 0.62, thick: 0.16, stepped: true });
  merlons(g, look.wall, -2.85, -3.73, 2.85, -3.73, Y + T + 0.4, { w: 0.3, h: 0.32, gap: 0.62, thick: 0.16, stepped: true });
  for (const s of [-1, 1]) merlons(g, look.wall, s * 2.93, -3.5, s * 2.93, 1.9, Y + T + 0.4, { w: 0.3, h: 0.32, gap: 0.62, thick: 0.16, stepped: true });
  for (const [x, z, w, d] of [[0, 0.62, 2.6, 0.12], [0, -1.92, 2.6, 0.12], [-1.32, -0.65, 0.12, 2.6], [1.32, -0.65, 0.12, 2.6]]) box(g, look.wall, x, Y + T, z, w, 0.55, d);

  // the courtyard: zellige floor, a fountain, an orange tree, arches all round
  box(g, '#f3efe6', 0, Y, -0.65, 2.6, 0.04, 2.5);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) if ((i + j) % 2) box(g, (i * j) % 3 ? ZELLIGE[0] : ZELLIGE[2], -1.08 + i * 0.43, Y + 0.04, -1.73 + j * 0.42, 0.42, 0.01, 0.41);
  put(g, GEO.cyl8, ZELLIGE[2], -0.35, Y, -0.3, 0.42, 0.32, 0.42);
  cyl(g, '#6ec6f0', -0.35, Y + 0.3, -0.3, 0.34, 0.04, 8);
  cyl(g, '#f3efe6', -0.35, Y, -0.3, 0.06, 0.55, 6);
  tree(g, 0.6, -1.25, 0.55, 'citrus');
  for (const [x, z, ry] of [[0, -1.9, 0], [0, 0.6, BACK], [-1.3, -0.65, RIGHT], [1.3, -0.65, LEFT]]) {
    const f = face(g, x, z, ry, Y);
    horseshoe(f, '#efe2c4', 0, 0, 0.02, 1.25, 2.3, 0.05);
    horseshoe(f, '#3a2c26', 0, 0, 0.05, 1.0, 2.1, 0.05);
    put(f, GEO.box, lattice('#8a5a34', '#4a2c18', 2, 2), 0, 3.0, 0.06, 0.9, 1.1, 0.04);
    box(f, '#5a3620', 0, 2.75, 0.2, 1.4, 0.08, 0.4);
  }
  pot(g, -0.95, Y, -1.55, 0.9, C.leaf, '#e0457b');
  pot(g, 0.95, Y, 0.25, 0.9, C.leaf, '#ffffff');

  // the street front: horseshoe door in a zellige frame, a green-tiled canopy, small grilled windows
  const f = face(g, 0, 2.2, 0, Y);
  zelligeFrame(f, 0, 0, 2.0, 3.0);
  horseshoe(f, '#efe2c4', 0, 0, 0.08, 1.45, 2.65, 0.04);
  horseshoe(f, look.door, 0, 0, 0.1, 1.2, 2.45, 0.05);
  for (const dx of [-0.3, 0.3]) for (const y of [0.6, 1.2, 1.8]) ball(f, '#c8963e', dx, y, 0.14, 0.04);
  box(f, '#5a3620', 0, 3.05, 0.35, 2.4, 0.1, 0.7);
  gable(f, GREEN_TILE, 0, 3.15, 0.35, 2.5, 0.45, 0.8);
  for (const s of [-1, 1]) { box(f, '#5a3620', s * 1.05, 2.55, 0.25, 0.1, 0.5, 0.5); }
  cyl(f, '#5a3620', 1.35, 1.9, 0.16, 0.03, 0.4, 6);
  ball(f, BRASS, 1.35, 1.8, 0.2, 0.14, 1.4);
  for (const s of [-1, 1]) {
    win(f, s * 2.0, 3.4, 0.55, 0.75, { frame: look.wall, glass: C.glassDark, bars: false });
    for (let i = 0; i < 4; i++) box(f, C.iron, s * 2.0 - 0.21 + i * 0.14, 3.35, 0.1, 0.03, 0.85, 0.03);
    box(f, look.accent, s * 2.0, 4.15, 0.05, 0.75, 0.1, 0.12);
    win(f, s * 2.0, 1.2, 0.35, 0.5, { frame: look.wall, glass: C.glassDark });
  }
  vine(f, -2.35, 0.2, 0.7, 4.2, 18, { dots: look.climb, seed: 8 });
  // the roof: a little room with a green pyramid roof, plants, a dish
  box(g, look.wall, -1.6, Y + T, -2.85, 2.2, 2.0, 1.6);
  hip(g, GREEN_TILE, -1.6, Y + T + 2.0, -2.85, 2.5, 1.0, 1.9);
  for (const [x, z] of [[1.0, -2.6], [2.2, -2.6], [2.2, 1.4]]) pot(g, x, Y + T, z, 1.1, C.leaf, '#d6337a');
  put(g, GEO.halfBall, '#f4f4f0', 0.8, Y + T + 0.7, 1.4, 0.42, 0.16, 0.42).rotation.x = 0.9;
  box(g, '#9aa0a8', 0.8, Y + T, 1.4, 0.05, 0.75, 0.05);
  ['#b2263c', '#e0b84a', '#2c5f8a'].forEach((c, i) => box(g, c, 0.4 + i * 0.7, Y + T + 0.2, -1.1 - 0, 0.6, 0.02, 0.9)); // rugs drying on the roof (over the side wing)
  // in front: a palm and big pots
  tree(g, -2.45, 3.3, 1.0, 'palm');
  for (const s of [-1, 1]) { taper(g, C.terracotta, s * 1.3, Y, 2.65, 0.28, 0.36, 0.55, 8); ball(g, '#4f9f5a', s * 1.3, Y + 0.85, 2.65, 0.38); }
}
moroccoHouse.looks = LOOKS;
moroccoHouse.top = 7.5;
moroccoHouse.flag = [2.55, 5.85, -3.4];

// ---------------------------------------------------------------- the Koutoubia
const SAND = '#c98a5f', SAND2 = '#b8774f', SAND3 = '#d79b70', TURQ = '#2a9088';
const GOLD = shine('#efc350', 2.6);
const WARM = shine('#ffd38a', 2.2); // the minaret is lit from below at night: its window niches glow

export function koutoubia(g) {
  const rand = rng(1158); // the minaret was finished in the 1190s; the mosque in 1158
  box(g, '#d9b98d', 0, 0, 0, 63.6, 0.2, 39.6);
  const Y = 0.2;

  // --- the minaret: a square tower of pink stone, its four faces each different
  const M = { x: 14, z: -8 }, W = 6.6, H = 30;
  box(g, SAND2, M.x, Y, M.z, W + 0.3, 1.2, W + 0.3);
  box(g, SAND, M.x, Y + 1.2, M.z, W, H - 1.2, W);
  for (const ry of [0, RIGHT, BACK, LEFT]) {
    const f = face(g, M.x + Math.sin(ry) * W / 2, M.z + Math.cos(ry) * W / 2, ry, Y);
    box(f, SAND3, 0, 4.0, 0.02, W - 0.6, 0.18, 0.06);
    horseshoe(f, SAND2, 0, 5.2, 0.03, 1.3, 2.4, 0.06);
    horseshoe(f, WARM, 0, 5.4, 0.06, 0.8, 1.9, 0.04);
    for (const s of [-1, 1]) { horseshoe(f, SAND2, s * 1.9, 9.6, 0.03, 1.0, 2.2, 0.06); horseshoe(f, WARM, s * 1.9, 9.8, 0.06, 0.6, 1.7, 0.04); }
    box(f, SAND3, 0, 13.0, 0.02, W - 0.6, 0.18, 0.06);
    horseshoe(f, SAND2, 0, 14.2, 0.03, 2.8, 4.2, 0.06);
    horseshoe(f, WARM, 0, 14.5, 0.06, 1.4, 2.8, 0.04);
    box(f, SAND3, 0, 19.3, 0.02, W - 0.6, 0.18, 0.06);
    put(f, GEO.box, lattice(SAND, SAND2, 3, 3), 0, 19.9, 0.04, W - 1.4, 5.6, 0.05);   // the "sebka" net of carved stone
    for (const s of [-1, 1]) { horseshoe(f, SAND2, s * 1.6, 20.6, 0.08, 0.9, 1.9, 0.04); horseshoe(f, WARM, s * 1.6, 20.75, 0.1, 0.55, 1.5, 0.04); }
    box(f, TURQ, 0, H - 2.2, 0.06, W, 0.75, 0.14);                                 // the band of green-blue tiles
    for (let i = 0; i < 9; i++) ball(f, '#f3efe6', -W / 2 + 0.4 + i * ((W - 0.8) / 8), H - 1.83, 0.15, 0.1);
  }
  box(g, SAND3, M.x, Y + H, M.z, W + 0.4, 0.3, W + 0.4);
  for (const [x1, z1, x2, z2] of [[-1, 1, 1, 1], [-1, -1, 1, -1], [-1, -1, -1, 1], [1, -1, 1, 1]]) merlons(g, SAND, M.x + x1 * (W / 2 - 0.1), M.z + z1 * (W / 2 - 0.1), M.x + x2 * (W / 2 - 0.1), M.z + z2 * (W / 2 - 0.1), Y + H + 0.3, { w: 0.55, h: 0.7, gap: 1.05, thick: 0.25, stepped: true });
  // the lantern on top, its little ribbed dome, and the three golden balls
  const L = Y + H + 0.3;
  box(g, SAND, M.x, L, M.z, 3.0, 5.5, 3.0);
  for (const ry of [0, RIGHT, BACK, LEFT]) {
    const f = face(g, M.x + Math.sin(ry) * 1.5, M.z + Math.cos(ry) * 1.5, ry, L);
    horseshoe(f, SAND2, 0, 1.2, 0.03, 1.2, 2.6, 0.06);
    horseshoe(f, WARM, 0, 1.35, 0.06, 0.75, 2.1, 0.04);
    box(f, TURQ, 0, 4.4, 0.05, 3.0, 0.4, 0.1);
  }
  box(g, SAND3, M.x, L + 5.5, M.z, 3.3, 0.25, 3.3);
  for (const [x1, z1, x2, z2] of [[-1, 1, 1, 1], [-1, -1, 1, -1], [-1, -1, -1, 1], [1, -1, 1, 1]]) merlons(g, SAND, M.x + x1 * 1.45, M.z + z1 * 1.45, M.x + x2 * 1.45, M.z + z2 * 1.45, L + 5.75, { w: 0.4, h: 0.45, gap: 0.72, thick: 0.2 });
  put(g, new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), TURQ, M.x, L + 5.75, M.z, 1.1, 1.0, 1.1);
  cyl(g, GOLD, M.x, L + 6.6, M.z, 0.07, 3.2, 6);
  for (const [y, r] of [[L + 7.3, 0.5], [L + 8.2, 0.4], [L + 8.95, 0.3]]) ball(g, GOLD, M.x, y, M.z, r);

  // the flag: a tall pole beside the minaret, flying higher than its golden balls
  box(g, SAND2, 22, Y, -8, 2.4, 0.8, 2.4);
  koutoubia.flag = { code: 'ma', ...flagPole(g, 22, Y + 0.8, -8, 47) };

  // --- the prayer hall: long low walls and rows of green-tiled roofs
  const HX0 = -27, HX1 = 10.5, HZ0 = -19, HZ1 = -3.5, HH = 6.5;
  box(g, SAND, (HX0 + HX1) / 2, Y, (HZ0 + HZ1) / 2, HX1 - HX0, HH, HZ1 - HZ0);
  merlons(g, SAND, HX0 + 0.2, HZ1 - 0.15, HX1 - 0.2, HZ1 - 0.15, Y + HH, { w: 0.5, h: 0.55, gap: 1.0, thick: 0.25, stepped: true });
  for (let x = HX0 + 2.1; x < HX1 - 1; x += 4.15) gable(g, GREEN_TILE, x, Y + HH, (HZ0 + HZ1) / 2 - 0.4, HZ1 - HZ0 - 1.4, 1.8, 4.0, RIGHT);
  box(g, '#2a6b4d', (HX0 + HX1) / 2, Y + HH + 1.75, -4.6, HX1 - HX0 - 1, 0.12, 0.3);
  put(g, GEO.halfBall, TURQ, -8, Y + HH + 1.6, -16, 2.0, 1.4, 2.0); // the dome over the mihrab
  const hf = face(g, 0, HZ1, 0, Y);
  for (let x = HX0 + 3; x < HX1 - 2; x += 4.15) {
    const big = Math.abs(x - (-8.3)) < 1;
    horseshoe(hf, SAND2, x, 0, 0.03, big ? 2.6 : 2.0, big ? 4.6 : 3.8, 0.06);
    horseshoe(hf, big ? '#6b3f26' : '#3a2c26', x, 0, 0.06, big ? 2.1 : 1.6, big ? 4.2 : 3.4, 0.05);
    if (big) { zelligeFrame(hf, x, 4.7, 3.2, 0.6, 0.2); gable(hf, GREEN_TILE, x, 5.4, 0.5, 3.6, 0.6, 1.0); }
  }

  // --- the gardens in front: red paths, lawns, orange trees in rows, palms, roses, a fountain
  box(g, '#c9764f', 0, Y, 8.5, 63.6, 0.03, 4.0);
  box(g, '#c9764f', -8.3, Y, 4.0, 4.0, 0.03, 15.0);
  box(g, '#c9764f', 22, Y, 8, 4.0, 0.03, 24);
  for (const [x, z, w, d] of [[-21, 2.0, 20, 6.0], [4.5, 2.0, 21, 6.0], [-21, 15.5, 20, 7.5], [4.5, 15.5, 21, 7.5], [28.5, 15.5, 6.0, 7.5], [28.5, 2.0, 6.0, 6.0]]) {
    box(g, '#7cc36a', x, Y, z, w, 0.06, d);
    for (let i = 0; i < Math.floor(w / 4.2); i++) for (let j = 0; j < Math.floor(d / 3.4); j++) {
      const tx = x - w / 2 + 2.1 + i * 4.2, tz = z - d / 2 + 1.7 + j * 3.4;
      if ((i + j) % 3 === 0) tree(g, tx, tz, 1.7, 'palm');
      else tree(g, tx, tz, 0.75, 'citrus');
    }
    for (let i = 0; i < w / 1.6; i++) bush(g, x - w / 2 + 0.5 + i * 1.6, z + d / 2 - 0.3, 0.6, i % 2 ? '#c0392b' : '#4f9f5a');
  }
  cyl(g, '#e9e1cf', -8.3, Y, 8.5, 1.8, 0.5, 8);
  cyl(g, '#6ec6f0', -8.3, Y + 0.35, 8.5, 1.5, 0.2, 8);
  put(g, GEO.cyl8, ZELLIGE[2], -8.3, Y + 0.5, 8.5, 0.5, 0.6, 0.5);
  for (const x of [-30, -20, -10, 0, 10, 20, 30]) lamp(g, x, Y, 10.7, { h: 3.0, light: BRASS });
  // a horse carriage (calèche) on the street in front
  const cal = new THREE.Group(); cal.position.set(22, Y, 1.5); g.add(cal);
  box(cal, GREEN_TILE, 0, 0.7, -1.0, 1.4, 0.7, 1.8);
  box(cal, '#2a2a2e', 0, 2.0, -1.0, 1.5, 0.08, 1.9);
  for (const s of [-1, 1]) { cyl(cal, '#e0b84a', s * 0.75, 0.45, -1.2, 0.45, 0.08, 10).rotation.z = Math.PI / 2; box(cal, '#2a2a2e', s * 0.6, 1.4, -1.8, 0.06, 0.6, 0.06); }
  box(cal, '#7a5a42', 0, 0.9, 1.2, 0.6, 0.65, 1.7);
  for (const [x, z] of [[-0.2, 0.6], [0.2, 0.6], [-0.2, 1.8], [0.2, 1.8]]) box(cal, '#7a5a42', x, 0, z, 0.12, 0.95, 0.12);
  box(cal, '#7a5a42', 0, 1.3, 2.1, 0.28, 0.8, 0.3).rotation.x = 0.5;
  crowd(g, 26, [-30, 30, 6.8, 10.3], rand, { y: Y });
  crowd(g, 6, [-10, -6.6, -2, 6], rand, { y: Y });
}
koutoubia.label = 'جامع الكتبية';
koutoubia.top = 49;
koutoubia.size = [64, 40];
