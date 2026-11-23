// «اليمن» (2026-11-20: the country with the most houses in Syria's village
// that had no village of its own, the user's call): the tower house of Sana'a,
// a ground floor of dark stone, floors of brown brick above, white gypsum
// bands and the qamariya windows (a half-moon of coloured glass over each
// window); and Old Sana'a: Bab al-Yemen in the city wall, the tower houses
// behind it, the market inside the gate and the minaret over the roofs.
import { C, box, cyl, ball, arch, face, win, door, lot, tree, pot, rng, shine, RIGHT, LEFT } from './kit.js';
import { merlons, crowd, lamp, flagPole } from './world.js';

// the qamariya's coloured glass, lit from inside at night
const QAMARIYA = [shine('#e8553f', 0.9), shine('#f2c14e', 0.9), shine('#3c8dde', 0.9), shine('#5cbf6e', 0.9)];
const GYPSUM = '#f7f3ea';

// A window of Sana'a on a wall face: the window with its white frame, and the
// qamariya over it (a white half-moon with coloured glass in it).
function sanaaWindow(f, x, y, w, h, i = 0) {
  box(f, GYPSUM, x, y - 0.12, 0.03, w + 0.3, h + 0.24, 0.06);
  box(f, '#2e2622', x, y, 0.05, w, h, 0.06);
  for (const dx of [-w / 4, w / 4]) box(f, GYPSUM, x + dx, y, 0.08, 0.06, h, 0.03);
  const r = w / 2 + 0.12;
  arch(f, GYPSUM, x, y + h + 0.08, 0.03, r * 2 + 0.24, r + 0.12, 0.06);
  arch(f, QAMARIYA[i % 4], x, y + h + 0.14, 0.06, r * 2 - 0.1, r - 0.08, 0.05);
  box(f, QAMARIYA[(i + 1) % 4], x, y + h + 0.14, 0.09, 0.05, r - 0.15, 0.03);
}
// White zigzag and dots between the floors, as the gypsum is laid on the brick.
function frieze(f, x0, x1, y) {
  box(f, GYPSUM, (x0 + x1) / 2, y, 0.03, x1 - x0, 0.12, 0.05);
  for (let x = x0 + 0.25; x < x1 - 0.1; x += 0.5) box(f, GYPSUM, x, y + 0.2, 0.03, 0.14, 0.14, 0.05);
}

// ---------------------------------------------------------------- the tower house
const LOOKS = [
  { brick: '#8a5a3c', stone: '#5b4a3e', door: '#6b3f26' },
  { brick: '#9a6644', stone: '#4f4440', door: '#3f5d55' },
  { brick: '#7b4e34', stone: '#665446', door: '#7b4b2a' },
];

export function yemenHouse(g, v = {}) {
  const look = { ...LOOKS[0], ...v };
  if (!v.bare) lot(g, { ground: '#d9c9a3' });
  box(g, '#d8c7a6', 0, 0, 0.6, 6.6, 0.05, 7.4);
  const Y = 0.05, W = 5.4, D = 4.0, Z = -1.6, F = Z + D / 2;
  box(g, look.stone, 0, Y, Z, W, 2.6, D);                       // ground floor of stone
  box(g, look.brick, 0, Y + 2.6, Z, W, 5.6, D);                 // two floors of brick
  for (const y of [2.6, 4.45, 6.3, 8.2]) box(g, GYPSUM, 0, Y + y - 0.06, Z, W + 0.1, 0.14, D + 0.1);
  const f = face(g, 0, F, 0, Y);
  door(f, 0, 1.1, 2.1, look.door, { arched: true, frame: GYPSUM, knob: '#d9b44a' });
  for (const s of [-1, 1]) win(f, s * 1.7, 1.2, 0.45, 0.6, { frame: GYPSUM, glass: C.glassDark, bars: true });
  let i = 0;
  for (const y of [3.0, 4.85, 6.7]) {
    for (const x of [-1.5, 0, 1.5]) sanaaWindow(f, x, y, 0.62, 0.85, i++);
    frieze(f, -W / 2 + 0.1, W / 2 - 0.1, y - 0.45);
  }
  for (const s of [-1, 1]) { // the sides: a column of windows each
    const sf = face(g, s * W / 2, Z, s > 0 ? RIGHT : LEFT, Y);
    for (const y of [3.0, 4.85, 6.7]) sanaaWindow(sf, 0, y, 0.55, 0.75, i++);
  }
  // the roof: white crenellations, a little room for the evening (the mafraj)
  merlons(g, GYPSUM, -W / 2, F, W / 2, F, Y + 8.2, { w: 0.35, h: 0.55, gap: 0.6, thick: 0.25, stepped: true });
  merlons(g, GYPSUM, -W / 2, Z - D / 2, W / 2, Z - D / 2, Y + 8.2, { w: 0.35, h: 0.55, gap: 0.6, thick: 0.25, stepped: true });
  for (const s of [-1, 1]) merlons(g, GYPSUM, s * W / 2, Z - D / 2, s * W / 2, F, Y + 8.2, { w: 0.35, h: 0.55, gap: 0.6, thick: 0.25, stepped: true });
  box(g, look.brick, 1.2, Y + 8.2, Z - 0.6, 2.4, 1.8, 2.2);
  box(g, GYPSUM, 1.2, Y + 10.0, Z - 0.6, 2.6, 0.14, 2.4);
  sanaaWindow(face(g, 1.2, Z + 0.5, 0, Y + 8.2), 0, 0.5, 0.7, 0.6, 2);
  // the yard: a low stone wall with a white top, an almond tree and pots of basil
  for (const [x, w] of [[-2.1, 2.4], [2.1, 2.4]]) { box(g, look.stone, x, Y, 4.0, w, 1.0, 0.3); box(g, GYPSUM, x, Y + 1.0, 4.0, w + 0.1, 0.1, 0.36); }
  for (const s of [-1, 1]) box(g, look.stone, s * 3.15, Y, 2.05, 0.28, 1.0, 3.9);
  tree(g, -2.4, 2.4, 1.0, 'round');
  pot(g, 1.0, Y, 1.2, 1.0, C.leaf, null);
  pot(g, -0.9, Y, 1.2, 0.9, C.leaf, '#e0457b');
}
yemenHouse.looks = LOOKS;
yemenHouse.top = 10.4;
yemenHouse.flag = [-2.3, 8.75, -3.2];

// ---------------------------------------------------------------- Old Sana'a
const MUD = '#a8794f', MUD2 = '#97693f', STONE = '#6b5a4a', DARK = '#2a2320';

// A tower house of Old Sana'a, w x d, h tall, its front towards +z.
function tower(g, x, z, w, d, h, rand, n0 = 0) {
  const base = 3.2;
  box(g, STONE, x, 0.2, z, w, base, d);
  box(g, rand() < 0.5 ? '#8a5a3c' : '#7b4e34', x, 0.2 + base, z, w, h - base, d);
  for (let y = base; y < h; y += 2.6) box(g, GYPSUM, x, 0.2 + y - 0.06, z, w + 0.1, 0.14, d + 0.1);
  let i = n0;
  for (const [fx, fz, ry, span] of [[x, z + d / 2, 0, w], [x + w / 2, z, RIGHT, d], [x - w / 2, z, LEFT, d]]) {
    const f = face(g, fx, fz, ry, 0.2);
    const cols = Math.max(1, Math.floor((span - 0.8) / 1.6));
    for (let y = base + 0.5; y < h - 1.8; y += 2.6) {
      for (let c = 0; c < cols; c++) sanaaWindow(f, -((cols - 1) * 1.6) / 2 + c * 1.6, y, 0.6, 0.8, i++);
      if (ry === 0) for (let xx = -span / 2 + 0.3; xx < span / 2 - 0.1; xx += 0.55) box(f, GYPSUM, xx, y - 0.25, 0.03, 0.14, 0.14, 0.05);
    }
  }
  merlons(g, GYPSUM, x - w / 2, z + d / 2, x + w / 2, z + d / 2, 0.2 + h, { w: 0.4, h: 0.6, gap: 0.65, thick: 0.25, stepped: true });
  merlons(g, GYPSUM, x - w / 2, z - d / 2, x + w / 2, z - d / 2, 0.2 + h, { w: 0.4, h: 0.6, gap: 0.65, thick: 0.25, stepped: true });
  for (const s of [-1, 1]) merlons(g, GYPSUM, x + s * w / 2, z - d / 2, x + s * w / 2, z + d / 2, 0.2 + h, { w: 0.4, h: 0.6, gap: 0.65, thick: 0.25, stepped: true });
  if (rand() < 0.6) { box(g, MUD2, x + w * 0.2, 0.2 + h, z - d * 0.15, w * 0.45, 2.0, d * 0.45); box(g, GYPSUM, x + w * 0.2, 2.2 + h, z - d * 0.15, w * 0.45 + 0.2, 0.14, d * 0.45 + 0.2); }
}

export function sanaa(g) {
  const rand = rng(1986); // Old Sana'a, a World Heritage site since 1986
  box(g, '#d9c39a', 0, 0, 0, 63.6, 0.2, 39.6);
  const Y = 0.2;

  // --- the city wall along the front, of mud with white rounded merlons, and its round towers
  const WZ = 15.5, WH = 7;
  for (const s of [-1, 1]) {
    box(g, MUD, s * 19.4, Y, WZ, 25.2, WH, 2.4);
    for (let x = 7.2; x < 31.6; x += 0.9) ball(g, GYPSUM, s * x, Y + WH + 0.2, WZ, 0.3, 1.1);
    for (const x of [14, 24, 31]) {
      cyl(g, MUD2, s * x, Y, WZ + 0.4, 2.1, WH + 1.6, 12);
      for (let a = 0; a < 12; a++) ball(g, GYPSUM, s * x + Math.cos(a * 0.52) * 2.0, Y + WH + 1.8, WZ + 0.4 + Math.sin(a * 0.52) * 2.0, 0.28, 1.1);
    }
  }

  // --- Bab al-Yemen: the great gate, its arch with a white border, the flag on top
  const GZ = 15.5, GW = 13, GH = 12.5, GD = 6;
  box(g, STONE, 0, Y, GZ, GW, 4, GD);
  box(g, MUD, 0, Y + 4, GZ, GW, GH - 4, GD);
  for (const y of [4, 7, 10]) box(g, GYPSUM, 0, Y + y - 0.07, GZ, GW + 0.1, 0.16, GD + 0.1);
  const gf = face(g, 0, GZ + GD / 2, 0, Y);
  arch(gf, GYPSUM, 0, 0, 0.02, 6.4, 8.6, 0.06);
  arch(gf, DARK, 0, 0, 0.05, 5.4, 8.0, 0.06);
  for (const s of [-1, 1]) for (const y of [8.6, 10.4]) sanaaWindow(gf, s * 4.6, y, 0.7, 0.9, s > 0 ? 1 : 3);
  for (let x = -5.8; x <= 5.8; x += 0.58) box(gf, GYPSUM, x, 11.6, 0.03, 0.18, 0.18, 0.05);
  merlons(g, GYPSUM, -GW / 2, GZ + GD / 2, GW / 2, GZ + GD / 2, Y + GH, { w: 0.55, h: 0.8, gap: 0.85, thick: 0.3, stepped: true });
  merlons(g, GYPSUM, -GW / 2, GZ - GD / 2, GW / 2, GZ - GD / 2, Y + GH, { w: 0.55, h: 0.8, gap: 0.85, thick: 0.3, stepped: true });
  sanaa.flag = { code: 'ye', ...flagPole(g, 0, Y + GH, GZ, 10) };
  for (const s of [-1, 1]) lamp(g, s * 4.2, Y, GZ + GD / 2 + 1.2, { h: 3.0, color: DARK });

  // --- the market inside the gate (Souq al-Milh): stalls with awnings, sacks of spice and coffee
  const AWN = ['#c0392b', '#2e86c1', '#d4a017', '#27ae60', '#8e44ad'];
  for (const [x, z, ry] of [[-6.5, 7.5, 0], [-6.5, 3.5, 0], [6.5, 7.5, 0], [6.5, 3.5, 0], [-11, 9, 0], [11, 9, 0]]) {
    box(g, '#7b4b2a', x, Y, z, 3.4, 1.0, 1.6, ry);
    for (const dx of [-1.2, 0, 1.2]) ball(g, ['#c0392b', '#d4a017', '#6b3f26', '#e67e22'][Math.floor(rand() * 4)], x + dx, Y + 1.15, z, 0.38, 0.7);
    for (const dx of [-1.6, 1.6]) box(g, '#5a3620', x + dx, Y, z - 0.7, 0.1, 2.6, 0.1);
    box(g, AWN[Math.floor(rand() * AWN.length)], x, Y + 2.6, z - 0.1, 3.8, 0.12, 2.2);
  }
  box(g, '#cdb48a', 0, Y, 6, 9, 0.04, 9); // the square paved inside the gate

  // --- the tower houses behind, on narrow lanes
  const spots = [
    [-26, -3, 7, 7, 15], [-18.5, -6, 6.5, 7.5, 19], [-25, -14, 8, 7, 22], [-15.5, -15.5, 7, 6.5, 17],
    [-9, -4, 6, 6.5, 14], [9.5, -5, 6.5, 7, 16], [17.5, -3.5, 7, 6.5, 20], [25.5, -6, 7, 7.5, 15],
    [14, -15, 7.5, 7, 23], [25, -16, 7, 6.5, 18], [-4, -15, 6.5, 7, 21], [4.5, -15.5, 6, 6.5, 15],
  ];
  spots.forEach(([x, z, w, d, h], n) => tower(g, x, z, w, d, h, rand, n * 3));

  // --- the minaret over the roofs: square, then eight-sided, white bands, a little dome
  const MX = 0, MZ = -7.5;
  box(g, '#8a5a3c', MX, Y, MZ, 3.4, 16, 3.4);
  for (const y of [5, 9, 13]) box(g, GYPSUM, MX, Y + y, MZ, 3.5, 0.18, 3.5);
  for (const ry of [0, RIGHT, Math.PI, LEFT]) { const f = face(g, MX + Math.sin(ry) * 1.7, MZ + Math.cos(ry) * 1.7, ry, Y); for (const y of [6, 10]) sanaaWindow(f, 0, y, 0.5, 0.9, ry ? 2 : 0); }
  cyl(g, GYPSUM, MX, Y + 16, MZ, 2.2, 0.4, 8);
  cyl(g, '#9a6644', MX, Y + 16.4, MZ, 1.35, 9, 8);
  for (const y of [19, 22, 25]) cyl(g, GYPSUM, MX, Y + y, MZ, 1.4, 0.18, 8);
  cyl(g, GYPSUM, MX, Y + 25.4, MZ, 1.8, 0.35, 8);
  cyl(g, '#9a6644', MX, Y + 25.75, MZ, 0.9, 3.0, 8);
  ball(g, GYPSUM, MX, Y + 29.2, MZ, 1.0, 1.0);
  cyl(g, '#d9b44a', MX, Y + 30, MZ, 0.08, 1.4, 8);
  ball(g, '#d9b44a', MX, Y + 31.5, MZ, 0.18);

  // --- people, lamps along the lanes, a few trees
  for (const [x, z] of [[-13, 2], [13, 2], [-21, 6], [21, 6], [-29, 9], [29, 9]]) lamp(g, x, Y, z, { h: 3.2, color: DARK });
  for (const [x, z] of [[-30, -10], [30, -11], [-12, -10], [20, -10.5]]) tree(g, x, z, 1.2, 'round');
  crowd(g, 26, [-14, 14, 1, 12], rand, { y: Y });
  crowd(g, 10, [-30, 30, 17.5, 19], rand, { y: Y, free: (x) => Math.abs(x) > 7.5 });
}
sanaa.label = 'صنعاء القديمة';
sanaa.top = 32;
sanaa.size = [64, 40];
