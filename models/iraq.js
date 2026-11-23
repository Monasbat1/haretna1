// «العراق»: the Baghdadi house of yellow brick with its long wooden
// shanasheel, and the city of Babylon: the blue Ishtar Gate in the walls, the
// Processional Way with its lions, the ziggurat, and the Hanging Gardens.
import * as THREE from 'three';
import { C, GEO, put, box, cyl, cone, ball, arch, ramp, face, win, door, ablaq, lot, tree, vine, pot, lattice, rng, shine, RIGHT, LEFT, BACK } from './kit.js';
import { merlons, crowd, lamp, flagPole } from './world.js';

// ---------------------------------------------------------------- the Baghdadi house
const LOOKS = [
  { brick: ['#dcb57c', '#d1a96e'], wood: '#6b4228', glass: ['#5d8fae', '#7fa8bf'], door: '#5a3620' },
  { brick: ['#e2c08c', '#d6b37e'], wood: '#5a3620', glass: ['#7fa8bf', '#9fc9d8'], door: '#2f5d55' },
  { brick: ['#d4a873', '#c99c66'], wood: '#7b4b2a', glass: ['#5d8fae', '#9fc9d8'], door: '#6b3f26' },
];

export function iraqHouse(g, v = {}) {
  const look = { ...LOOKS[0], ...v };
  if (!v.bare) lot(g, { ground: '#d9c9a3' });
  box(g, '#dccbae', 0, 0, 0.1, 6.6, 0.05, 8.2);
  const Y = 0.05, H = 6.0;
  ablaq(g, 0, Y, -1.7, 5.8, H, 3.8, 22, look.brick);
  box(g, look.brick[1], 0, Y + 2.85, -1.7, 5.95, 0.2, 3.95);
  // the parapet of brick piers with gaps, so the roof catches the breeze
  for (const [x1, z1, x2, z2] of [[-2.8, 0.1, 2.8, 0.1], [-2.8, -3.5, 2.8, -3.5], [-2.8, -3.5, -2.8, 0.1], [2.8, -3.5, 2.8, 0.1]]) {
    merlons(g, look.brick[0], x1, z1, x2, z2, Y + H, { w: 0.3, h: 0.7, gap: 0.55, thick: 0.2 });
    box(g, look.brick[1], (x1 + x2) / 2, Y + H + 0.7, (z1 + z2) / 2, Math.abs(x2 - x1) + 0.3, 0.1, Math.abs(z2 - z1) + 0.3);
  }

  // the shanasheel: a long wooden bay on brackets, lattice below and coloured glass above
  const SZ = 0.6, SD = 0.95;
  for (let i = 0; i < 6; i++) { const x = -2.5 + i * 1.0; box(g, look.wood, x, Y + 2.55, 0.45, 0.12, 0.45, 0.7); box(g, look.wood, x, Y + 2.2, 0.25, 0.12, 0.4, 0.3); }
  box(g, look.wood, 0, Y + 3.0, SZ, 5.4, 0.2, SD + 0.1);
  box(g, look.wood, 0, Y + 3.2, SZ, 5.2, 2.4, SD);
  const sf = face(g, 0, SZ + SD / 2, 0, Y + 3.2);
  put(sf, GEO.box, lattice('#8a5a34', '#3e2414', 8, 1), 0, 0.1, 0.01, 5.0, 0.75, 0.02);
  for (let i = 0; i < 6; i++) {
    const x = -2.15 + i * 0.86;
    box(sf, look.glass[i % 2], x, 0.95, 0.02, 0.7, 1.1, 0.03);
    box(sf, look.wood, x, 1.47, 0.04, 0.7, 0.04, 0.03);
    box(sf, look.wood, x, 0.95, 0.04, 0.04, 1.1, 0.03);
  }
  for (let i = 0; i < 7; i++) box(sf, look.wood, -2.58 + i * 0.86, 0.85, 0.05, 0.08, 1.3, 0.05);
  box(g, look.wood, 0, Y + 5.6, SZ + 0.05, 5.6, 0.18, SD + 0.3);
  for (const s of [-1, 1]) put(face(g, s * 2.6, SZ, s > 0 ? RIGHT : LEFT, Y + 3.2), GEO.box, lattice('#8a5a34', '#3e2414', 2, 3), 0, 0.1, 0.01, SD - 0.1, 2.2, 0.02);

  // ground floor: a studded wooden door in a pointed arch, small high windows
  const f = face(g, 0, 0.1, 0, Y);
  arch(f, look.brick[1], 0, 0, 0.02, 1.6, 2.75, 0.06, 0, true);
  door(f, 0, 1.2, 2.45, look.door, { arched: true, pointed: true, knob: null });
  for (const dx of [-0.35, 0, 0.35]) for (const y of [0.5, 1.0, 1.5]) ball(f, '#c8963e', dx, y, 0.12, 0.045);
  for (const s of [-1, 1]) {
    win(f, s * 1.95, 1.4, 0.6, 0.8, { frame: look.wood, glass: C.glassDark, bars: false });
    for (let i = 0; i < 3; i++) box(f, look.wood, s * 1.95 - 0.18 + i * 0.18, 1.4, 0.1, 0.04, 0.8, 0.04);
  }
  const fr = face(g, 2.9, -1.7, RIGHT, Y);
  for (const x of [-1, 1]) { win(fr, x, 1.4, 0.55, 0.8, { frame: look.wood, glass: C.glassDark }); win(fr, x, 3.7, 0.7, 1.2, { frame: look.wood, glass: look.glass[0], arched: true, pointed: true }); }

  // the roof: a wind catcher, and beds for the summer nights
  box(g, look.brick[0], 1.9, Y + H, -2.75, 1.3, 2.6, 1.2);
  for (const ry of [0, RIGHT]) { const w = face(g, 1.9 + (ry ? 0.65 : 0), -2.75 + (ry ? 0 : 0.6), ry, Y + H); for (const x of [-0.3, 0.3]) box(w, '#3a2c26', x, 1.6, 0.01, 0.2, 0.8, 0.02); }
  box(g, look.brick[1], 1.9, Y + H + 2.6, -2.75, 1.5, 0.12, 1.4);
  for (const [x, z] of [[-1.6, -2.4], [-0.3, -2.4]]) {
    for (const [dx, dz] of [[-0.4, -0.85], [0.4, -0.85], [-0.4, 0.85], [0.4, 0.85]]) box(g, '#4a4f58', x + dx, Y + H, z + dz, 0.05, 0.45, 0.05);
    box(g, '#f4f1ea', x, Y + H + 0.45, z, 0.95, 0.14, 1.85);
    box(g, x < -1 ? '#b2263c' : '#2c5f8a', x, Y + H + 0.59, z + 0.35, 0.97, 0.05, 1.0);
    box(g, '#ffffff', x, Y + H + 0.59, z - 0.65, 0.6, 0.12, 0.35);
  }

  // the yard: a brick wall, date palms, pots
  for (const [x, w] of [[-2.0, 2.6], [2.0, 2.6]]) { ablaq(g, x, Y, 4.0, w, 1.1, 0.3, 5, look.brick); box(g, look.brick[1], x, Y + 1.1, 4.0, w + 0.1, 0.08, 0.38); }
  for (const s of [-1, 1]) ablaq(g, s * 3.15, Y, 2.05, 0.28, 1.1, 3.9, 5, look.brick);
  tree(g, -2.55, 2.4, 1.3, 'palm');
  tree(g, 2.3, 2.8, 0.7, 'citrus');
  pot(g, -0.9, Y, 1.0, 1.0, C.leaf, '#e0457b');
  pot(g, 0.9, Y, 1.0, 1.0, C.leaf, '#ffffff');
  vine(face(g, 2.0, 4.15), 0, 0.2, 2.2, 1.0, 10, { dots: ['#d6337a'], seed: 12 });
}
iraqHouse.looks = LOOKS;
iraqHouse.top = 8.9;
iraqHouse.flag = [-2.45, 6.85, -3.2];

// ---------------------------------------------------------------- Babylon
const BLUE = ['#1d4f9e', '#2459ab'], MUD = ['#cfa96c', '#c49d62'], MUD2 = '#b8905a';
const GOLDEN = shine('#e6bd4f', 2.4), IVORY = '#f1e6c6', DARK = '#2a2320';

// The animals of the glazed bricks, on a wall face (z = 0 is the wall).
function beast(f, x, y, kind, dir = 1, s = 1) {
  const c = kind === 'dragon' ? IVORY : GOLDEN, z = 0.05, d = 0.08;
  box(f, c, x, y + 0.38 * s, z, 1.2 * s, 0.42 * s, d);
  for (const dx of [-0.42, 0.42]) box(f, c, x + dx * s, y, z, 0.13 * s, 0.4 * s, d);
  if (kind === 'lion') {
    box(f, IVORY, x + dir * 0.55 * s, y + 0.38 * s, z + 0.01, 0.38 * s, 0.6 * s, d);
    box(f, c, x + dir * 0.82 * s, y + 0.5 * s, z + 0.02, 0.3 * s, 0.28 * s, d);
    box(f, c, x - dir * 0.75 * s, y + 0.72 * s, z, 0.4 * s, 0.07 * s, d);
  } else if (kind === 'bull') {
    box(f, c, x + dir * 0.72 * s, y + 0.62 * s, z, 0.3 * s, 0.32 * s, d);
    box(f, IVORY, x + dir * 0.78 * s, y + 0.94 * s, z + 0.01, 0.06 * s, 0.3 * s, d);
  } else {
    box(f, c, x + dir * 0.62 * s, y + 0.7 * s, z, 0.14 * s, 0.6 * s, d);
    box(f, c, x + dir * 0.75 * s, y + 1.25 * s, z, 0.4 * s, 0.17 * s, d);
    box(f, c, x - dir * 0.66 * s, y + 0.75 * s, z, 0.09 * s, 0.55 * s, d);
  }
}
const rosettes = (f, x0, x1, y, n) => { for (let i = 0; i < n; i++) ball(f, IVORY, x0 + ((x1 - x0) * (i + 0.5)) / n, y, 0.08, 0.09); };

export function babylon(g) {
  const rand = rng(575); // the Ishtar Gate was built about 575 BC
  box(g, '#e2cb9c', 0, 0, 0, 63.6, 0.2, 39.6);
  const Y = 0.2;

  // --- the walls of the city along the front, with towers
  const WZ = 15, WH = 10;
  for (const s of [-1, 1]) {
    ablaq(g, s * 19.8, Y, WZ, 24.4, WH, 3.4, 10, MUD);
    merlons(g, MUD2, s * 7.8, WZ + 1.55, s * 31.8, WZ + 1.55, Y + WH, { w: 0.6, h: 0.6, gap: 1.2, thick: 0.3, stepped: true });
    for (const x of [12, 20, 28]) {
      ablaq(g, s * x, Y, WZ + 0.3, 3.6, WH + 2.2, 4.6, 12, MUD);
      merlons(g, MUD2, s * x - 1.6, WZ + 2.45, s * x + 1.6, WZ + 2.45, Y + WH + 2.2, { w: 0.55, h: 0.55, gap: 0.8, thick: 0.3, stepped: true });
      box(g, DARK, s * x, Y + WH - 0.4, WZ + 2.62, 0.5, 1.0, 0.05);
    }
  }

  // --- the Ishtar Gate: two blue towers and the arch between them
  const GZ = 15, GD = 6.5, GF = GZ + GD / 2, GH = 17.5;
  for (const s of [-1, 1]) {
    ablaq(g, s * 5.25, Y, GZ, 4.5, GH, GD, 26, BLUE);
    merlons(g, BLUE[0], s * 5.25 - 2.0, GF - 0.15, s * 5.25 + 2.0, GF - 0.15, Y + GH, { w: 0.55, h: 0.7, gap: 0.8, thick: 0.3, stepped: true });
    const f = face(g, s * 5.25, GF, 0, Y);
    for (const [r, y] of [[0, 2.2], [1, 5.6], [2, 9.0], [3, 12.4]]) {
      for (const dx of [-1.05, 1.05]) beast(f, dx, y, r % 2 ? 'dragon' : 'bull', -s, 0.85);
      rosettes(f, -2.2, 2.2, y - 0.45, 9);
    }
    rosettes(f, -2.2, 2.2, 15.9, 9);
  }
  ablaq(g, 0, Y, GZ, 6.1, GH - 2.5, GD - 0.4, 22, BLUE);
  merlons(g, BLUE[1], -2.8, GF - 0.35, 2.8, GF - 0.35, Y + GH - 2.5, { w: 0.55, h: 0.7, gap: 0.8, thick: 0.3, stepped: true });
  const gf = face(g, 0, GF - 0.2, 0, Y);
  arch(gf, IVORY, 0, 0, 0.02, 4.4, 9.4, 0.06);
  arch(gf, DARK, 0, 0, 0.05, 3.8, 9.0, 0.06);
  beast(gf, 0, 10.6, 'dragon', 1, 0.85);
  beast(gf, 0, 12.6, 'bull', -1, 0.85);
  rosettes(gf, -2.8, 2.8, 10.0, 11);

  // --- the Processional Way, between blue walls with lions
  box(g, '#d9c8a6', 0, Y, 5.5, 7.0, 0.04, 16);
  for (let z = -2; z < 12; z += 1.1) box(g, '#cbb995', 0, Y + 0.04, z, 6.8, 0.01, 0.08);
  for (const s of [-1, 1]) {
    ablaq(g, s * 6.2, Y, 6.5, 1.0, 5.0, 11, 8, BLUE);
    merlons(g, BLUE[0], s * 6.2, 1.2, s * 6.2, 11.8, Y + 5.0, { w: 0.5, h: 0.5, gap: 0.9, thick: 0.4, stepped: true });
    const f = face(g, s * 5.7, 6.5, s > 0 ? LEFT : RIGHT, Y);
    for (let i = 0; i < 5; i++) beast(f, -4.4 + i * 2.2, 1.6, 'lion', s > 0 ? 1 : -1, 1);
    rosettes(f, -5.4, 5.4, 1.2, 20);
    rosettes(f, -5.4, 5.4, 3.0, 20);
    for (const z of [3, 7, 11]) lamp(g, s * 4.4, Y, z, { h: 2.2, color: MUD2 });
  }

  // --- the ziggurat Etemenanki, with its three stairways and the blue temple on top
  const ZX = -15, ZZ = -10.5;
  let y = Y;
  for (const [w, d, h, dz] of [[22, 17, 6, 0], [16.5, 12.5, 5, -0.4], [11.5, 8.5, 4.5, -0.8], [7.5, 5.5, 4, -1.1]]) {
    ablaq(g, ZX, y, ZZ + dz, w, h, d, Math.round(h * 1.6), MUD);
    const f = face(g, ZX, ZZ + dz + d / 2, 0, y);
    for (let x = -w / 2 + 0.9; x < w / 2 - 0.5; x += 1.6) box(f, MUD2, x, 0, 0.1, 0.55, h, 0.2);
    y += h;
  }
  box(g, BLUE[0], ZX, y, ZZ - 1.1, 5.0, 3.6, 3.6);
  box(g, GOLDEN, ZX, y + 3.6, ZZ - 1.1, 5.3, 0.3, 3.9);
  for (const s of [-1, 1]) cone(g, GOLDEN, ZX + s * 2.3, y + 3.9, ZZ + 0.6, 0.25, 1.1);
  door(face(g, ZX, ZZ + 0.7, 0, y), 0, 1.2, 2.3, GOLDEN, { knob: null });
  babylon.flag = { code: 'iq', ...flagPole(g, ZX, y + 3.9, ZZ - 1.1, 10) }; // on the temple at the top of the ziggurat
  ramp(g, MUD2, ZX, Y, 1.0, 10.6, 11.0, 3.6, RIGHT);
  for (let i = 0; i < 22; i++) box(g, '#a88452', ZX, Y + i * 0.5, 6.0 - i * 0.48, 3.6, 0.08, 0.2);
  ramp(g, MUD2, ZX - 7, Y, -1.0, 8, 6.0, 2.0, 0);
  ramp(g, MUD2, ZX + 7, Y, -1.0, 8, 6.0, 2.0, BACK);

  // --- the Hanging Gardens: terraces on arches, trees and vines spilling over
  const HX = 22;
  y = Y;
  for (const [w, d, h, cz] of [[18, 16, 3.4, -11], [14, 12, 3.4, -12], [10, 8, 3.4, -13]]) {
    ablaq(g, HX, y, cz, w, h, d, 4, MUD);
    const f = face(g, HX, cz + d / 2, 0, y);
    for (let x = -w / 2 + 1.2; x < w / 2 - 0.8; x += 2.0) arch(f, DARK, x, 0.2, 0.04, 1.1, 2.4, 0.05);
    vine(f, 0, h - 1.2, w - 0.6, 1.1, Math.round(w * 1.8), { seed: Math.round(w) });
    for (let x = -w / 2 + 0.6; x < w / 2; x += 1.2) ball(g, rand() < 0.5 ? '#4f9f5a' : '#3f8f5a', HX + x, y + h + 0.25, cz + d / 2 - 0.4, 0.55, 0.8);
    const top = face(g, 0, 0, 0, y + h);
    for (let x = -w / 2 + 2; x < w / 2 - 1; x += 4) tree(top, HX + x, cz - d / 2 + 1.6, 1.3, 'palm');
    box(g, '#7fd0f0', HX, y, cz + d / 2 + 0.12, 1.2, h + 0.1, 0.2); // the water falling from terrace to terrace
    y += h;
  }
  tree(face(g, 0, 0, 0, y), HX, -13, 1.6, 'palm');
  cyl(g, '#e9e1cf', HX, Y, -1.6, 1.6, 0.4, 8);
  cyl(g, '#6ec6f0', HX, Y + 0.25, -1.6, 1.35, 0.2, 8);

  // --- houses of the city, palms, the Lion of Babylon, people
  const spots = [[-28, 4], [-23, 6.5], [-29, 10], [-18, 9.5], [-12, 5], [-24, 1.5], [12, 1], [16, 8], [24, 6], [29, 10], [29, 2], [19, 11.5]];
  for (const [x, z] of spots) {
    const w = 3.2 + rand() * 1.6, d = 3.0 + rand() * 1.4, h = 2.6 + rand() * 2.2;
    ablaq(g, x, Y, z, w, h, d, 3, MUD);
    box(g, MUD2, x, Y + h, z, w + 0.1, 0.25, d + 0.1);
    door(face(g, x, z + d / 2, 0, Y), (rand() - 0.5) * w * 0.4, 0.75, 1.6, DARK, { knob: null });
  }
  for (const [x, z] of [[-8.5, 12], [8.5, 12], [-9, 2], [9, 3], [-31, -1], [31, -1], [-3, -18], [4, -16], [6, -3], [-30, 13], [30, 13.3]]) tree(g, x, z, 1.6 + rand() * 0.4, 'palm');
  box(g, '#8a8580', 8.5, Y, 7.5, 2.6, 1.4, 1.3);
  const lion = face(g, 8.5, 7.5, 0, Y + 1.4);
  box(lion, '#3d3d42', 0, 0.9, 0, 2.2, 0.9, 0.85);
  for (const [x, z] of [[-0.85, -0.25], [-0.85, 0.25], [0.8, -0.25], [0.8, 0.25]]) box(lion, '#3d3d42', x, 0, z, 0.3, 0.9, 0.25);
  box(lion, '#3d3d42', 1.3, 1.4, 0, 0.7, 0.8, 0.8);
  box(lion, '#4b4b52', 0, 0, 0, 1.4, 0.35, 0.6);
  crowd(g, 18, [-3, 3, -2, 12], rand, { y: Y });
  crowd(g, 10, [-28, 30, 12, 13], rand, { y: Y, free: (x) => Math.abs(x) > 8 });
}
babylon.label = 'مدينة بابل';
babylon.top = 34;
babylon.size = [64, 40];
