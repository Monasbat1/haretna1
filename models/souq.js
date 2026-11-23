// «سوق الحميدية»: the covered market of Damascus. A street of shops under a
// tall iron vault, pierced with little holes that let the sun in by day and
// twinkle like stars at night. The street ends at the Roman columns of the
// Temple of Jupiter, as the real souq ends at the gate of the Umayyad Mosque.
// Two city blocks end to end and the street between them (17 x 64, the user
// asked for it bigger and taller, 2026-11-19): the covered street runs along
// z, +z is the gate, -z the columns; y = 0 is the top of the blocks. In the
// city it is turned so the gate faces west and the columns face the mosque.
import * as THREE from 'three';
import { GEO, put, box, cyl, taper, ball, arch, face, gable, win, ablaq, rng, shine, RIGHT, LEFT } from './kit.js';

const STONE = '#e6d8b8', STONE2 = '#d3c19a', PLASTER = '#efe4cc', CORNICE = '#cdbb93';
const VAULT = '#59646f', RIB = '#3e4750', BASALT = '#4b4b52', PAVE = '#a59f92';
const WOOD = '#7b4b2a', WOOD2 = '#5a3620', GLASS = '#7fa8bf', SHOP = '#3a2c26', COLUMN = '#dccfae';
const HOLE = shine('#fff4cf', 3);   // a hole in the iron roof: a star of light at night
const LANTERN = '#f6d77a';          // already shines (the lanterns of the gates)
const SUN = '#f3e2ad';              // a patch of sunlight on the street under a hole
const AWNINGS = ['#c0392b', '#2e7d5b', '#d9a441', '#2c5f8a', '#8e3b5e'];

const Y = 0.2;   // top of the paving
const H = 8.6;   // the three storeys of shops; the vault springs from here
const R = 3.5;   // half the width of the street = radius of the vault
const Z1 = 27.0, Z0 = -26.5; // front and back of the covered street
const ROW = 4.7; // depth of each row of shops, from the street out
const OUT = R + ROW; // the outer walls of the rows
const STEP = 2.45; // one shop
export const SIZE = [16.6, 63.6]; // x, z

// Half a cylinder, radius 1 and length 1 along z, the round side up (open at both ends).
const halfTube = new THREE.CylinderGeometry(1, 1, 1, 18, 1, true, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI / 2);
// The same tube seen from inside (the triangles turned round, so the inside is drawn).
const halfTubeInside = (() => {
  const g = halfTube.clone();
  const idx = g.index.array;
  for (let i = 0; i < idx.length; i += 3) { const t = idx[i]; idx[i] = idx[i + 2]; idx[i + 2] = t; }
  return g;
})();
// A wall with a round-topped opening of radius r, w wide and h tall above the springing line.
const archWalls = new Map();
function archWall(r, w, h, depth) {
  const key = [r, w, h, depth].join('/');
  if (!archWalls.has(key)) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0); s.lineTo(-r, 0);
    s.absarc(0, 0, r, Math.PI, 0, true);
    s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.lineTo(-w / 2, 0);
    archWalls.set(key, new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 14 }).translate(0, 0, -depth / 2));
  }
  return archWalls.get(key);
}
// A half ring (the stone outline of an arch), from radius r1 to r2.
const archRings = new Map();
function archRing(r1, r2, depth) {
  const key = [r1, r2, depth].join('/');
  if (!archRings.has(key)) {
    const s = new THREE.Shape();
    s.moveTo(r2, 0); s.absarc(0, 0, r2, 0, Math.PI, false); s.lineTo(-r1, 0); s.absarc(0, 0, r1, Math.PI, 0, true); s.lineTo(r2, 0);
    archRings.set(key, new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 14 }).translate(0, 0, -depth / 2));
  }
  return archRings.get(key);
}

// One shop front on a wall (f: z = 0 is the wall, +z points out): an arched
// opening, its goods spilling out, an awning, and a window above.
function shop(f, x, kind, rand, upper = true) {
  arch(f, STONE2, x, Y, 0.03, 2.15, 2.65, 0.06);
  arch(f, SHOP, x, Y, 0.07, 1.8, 2.4, 0.06);
  const awning = AWNINGS[kind % AWNINGS.length];
  box(f, awning, x, Y + 2.72, 0.5, 2.25, 0.09, 1.0);
  for (const dx of [-0.95, 0.95]) box(f, WOOD2, x + dx, Y, 0.95, 0.06, 2.72, 0.06);
  switch (kind % 5) {
    case 0: // fabrics: tall rolls in bright colours
      ['#b2263c', '#e3b23c', '#2f6f9f', '#7a3e8e', '#3f8f5a'].forEach((c, i) => cyl(f, c, x - 0.72 + i * 0.36, Y, 0.32, 0.14, 1.05 + (i % 2) * 0.25, 8));
      break;
    case 1: // spices: little hills on a wooden table
      box(f, WOOD2, x, Y, 0.45, 1.7, 0.55, 0.55);
      ['#d9822b', '#b5322b', '#e8c547', '#7a9a3a'].forEach((c, i) => put(f, cylCone, c, x - 0.6 + i * 0.4, Y + 0.55, 0.45, 0.2, 0.3, 0.2));
      break;
    case 2: // brass and copper: plates and jugs
      box(f, WOOD, x, Y, 0.4, 1.6, 0.75, 0.45);
      for (let i = 0; i < 3; i++) cyl(f, '#c8963e', x - 0.5 + i * 0.5, Y + 0.75, 0.4, 0.17, 0.32, 8);
      for (const dx of [-0.45, 0.45]) cyl(f, '#d6a85a', x + dx, Y + 1.25, 0.1, 0.28, 0.04, 8).rotation.x = Math.PI / 2;
      break;
    case 3: // ice cream, white counter with a green band (the famous one of the souq)
      box(f, '#f6f3ea', x, Y, 0.42, 1.7, 0.95, 0.6);
      box(f, '#3f8f5a', x, Y + 0.6, 0.73, 1.7, 0.14, 0.02);
      for (let i = 0; i < 3; i++) ball(f, ['#f7e7c6', '#e9a3b0', '#bfe3b4'][i], x - 0.45 + i * 0.45, Y + 1.05, 0.42, 0.14);
      break;
    default: // sweets: trays stacked high
      for (let i = 0; i < 4; i++) box(f, ['#e7b84a', '#c98b3a', '#f0d27a', '#b9772f'][i], x, Y + i * 0.26, 0.4, 1.5 - i * 0.18, 0.24, 0.55);
  }
  if (!upper) return;
  if (rand() < 0.5) { // a wooden bay window (mashrabiya)
    box(f, WOOD, x, Y + 3.25, 0.32, 1.35, 1.7, 0.62);
    win(f, x, Y + 3.5, 0.9, 1.1, { frame: WOOD2, glass: GLASS, bars: true });
    f.children[f.children.length - 1].position.z += 0.6;
    f.children[f.children.length - 2].position.z += 0.6;
    f.children[f.children.length - 3].position.z += 0.6;
    f.children[f.children.length - 4].position.z += 0.6;
  } else {
    win(f, x, Y + 3.55, 0.85, 1.15, { frame: WOOD, glass: GLASS, arched: true, sill: STONE2 });
  }
  // the third storey: a pair of arched windows, shuttered now and then
  const sh = rand() < 0.35 ? '#4f7d6a' : undefined;
  for (const dx of [-0.48, 0.48]) win(f, x + dx, Y + 6.15, 0.6, 1.25, { frame: WOOD, glass: GLASS, arched: true, sill: STONE2, shutters: sh });
}
const cylCone = new THREE.ConeGeometry(1, 1, 8).translate(0, 0.5, 0);

export function souq(g) {
  const rand = rng(1855); // the year the souq was first built
  const L = Z1 - Z0, cz = (Z1 + Z0) / 2;
  const dome = new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2);

  // --- the ground: stone paving, a basalt street under the vault, out past both ends
  box(g, PAVE, 0, 0, 0, SIZE[0], Y, SIZE[1]);
  box(g, BASALT, 0, Y, cz + 0.75, 2 * R, 0.03, L + 4.5);
  for (let z = Z0 - 1.4; z < Z1 + 3; z += 1.2) box(g, '#5d5d65', 0, Y + 0.03, z, 2 * R - 0.2, 0.01, 0.06);

  // --- the two long rows of shops along the street, three storeys under flat roofs
  const N = Math.floor((L - 2.4) / STEP); // shops in a row
  for (const s of [-1, 1]) {
    const cx = s * (R + ROW / 2);
    box(g, STONE, cx, Y, cz, ROW, 2.9, L);
    box(g, PLASTER, cx, Y + 2.9, cz, ROW, 2.85, L);
    box(g, CORNICE, cx, Y + 5.75, cz, ROW + 0.16, 0.18, L + 0.1); // the band between the second and third storeys
    box(g, '#e9dec4', cx, Y + 5.93, cz, ROW, H - 5.93, L);
    box(g, CORNICE, cx, Y + H, cz, ROW + 0.2, 0.25, L + 0.2);
    for (const [dx, dz, w, d] of [[0, L / 2 - 0.1, ROW + 0.2, 0.2], [0, -L / 2 + 0.1, ROW + 0.2, 0.2], [s * ROW / 2, 0, 0.2, L]]) box(g, CORNICE, cx + dx, Y + H + 0.25, cz + dz, w, 0.5, d);
    // the shops inside, facing the street, and outside, facing the road
    const inner = face(g, s * R, cz, s > 0 ? LEFT : RIGHT);
    const outer = face(g, s * OUT, cz, s > 0 ? RIGHT : LEFT);
    for (let i = 0; i < N; i++) {
      const at = (i - (N - 1) / 2) * STEP;
      shop(inner, at * (s > 0 ? 1 : -1), i + (s > 0 ? 0 : 2), rand);
      shop(outer, at, i * 3 + (s > 0 ? 1 : 4), rand);
    }
    // a shop on the front of each row, beside the gate, and windows on the back
    shop(face(g, 0, Z1), s * 6.65, s > 0 ? 3 : 0, rand);
    const back = face(g, cx, Z0, Math.PI);
    for (const x of [-1.2, 1.2]) { win(back, x, Y + 3.7, 0.8, 1.1, { frame: WOOD, glass: GLASS }); win(back, x, Y + 6.3, 0.7, 1.1, { frame: WOOD, glass: GLASS, shutters: '#4f7d6a' }); }
    // on the roofs: water tanks and little domes
    for (let z = Z0 + 3, k = 0; z < Z1 - 2; z += 5.2, k++) {
      cyl(g, '#f1f1ee', cx + s * (rand() - 0.5) * 2.4, Y + H + 0.25, z, 0.38, 0.75, 8);
      if (k % 2) put(g, dome, '#8f9aa5', cx, Y + H + 0.25, z + 2.4, 1.0, 0.8, 1.0);
    }
  }

  // --- the iron vault over the street, with its ribs and its holes of light
  put(g, halfTube, VAULT, 0, Y + H, cz, R + 0.02, R + 0.02, L);
  put(g, halfTubeInside, '#3b4148', 0, Y + H, cz, R - 0.02, R - 0.02, L);
  for (let z = Z0 + 0.4; z <= Z1 - 0.3; z += 1.55) {
    put(g, halfTube, RIB, 0, Y + H, z, R + 0.1, R + 0.1, 0.22);
    put(g, halfTubeInside, RIB, 0, Y + H, z, R - 0.1, R - 0.1, 0.22);
  }
  for (let i = 0; i < 180; i++) {
    const a = 0.3 + rand() * (Math.PI - 0.6), z = Z0 + 0.3 + rand() * (L - 0.6);
    box(g, HOLE, Math.cos(a) * R, Y + H + Math.sin(a) * R - 0.07, z, 0.14, 0.14, 0.14);
    if (i < 100) box(g, SUN, (rand() - 0.5) * 2 * (R - 0.6), Y + 0.035, z + (rand() - 0.5), 0.32, 0.012, 0.32);
  }
  // lanterns hanging along the street
  for (let z = Z0 + 1.2; z < Z1; z += 2.5) {
    box(g, RIB, 0, Y + H + 1.9, z, 0.04, R - 1.9, 0.04);
    ball(g, LANTERN, 0, Y + H + 1.75, z, 0.24, 1.3);
  }

  // --- the great gate at the entrance, in black and white stone, with two turrets
  const GX = R + 0.8, GZ = Z1 + 0.7, GW = 2 * (R + 1.6) + 0.4;
  for (const s of [-1, 1]) ablaq(g, s * GX, Y, GZ, 1.6, H, 1.4, 13, [BASALT, STONE, STONE, STONE]);
  put(g, archWall(R, GW, 5.6, 1.4), STONE, 0, Y + H, GZ);
  put(g, archRing(R, R + 0.5, 0.1), BASALT, 0, Y + H, GZ + 0.72);
  box(g, CORNICE, 0, Y + H + 5.6, GZ, GW + 0.4, 0.3, 1.7);
  for (let x = -GW / 2 + 0.3; x <= GW / 2 - 0.29; x += (GW - 0.6) / 12) box(g, STONE, x, Y + H + 5.9, GZ, 0.45, 0.55, 1.2);
  for (const s of [-1, 1]) {
    cyl(g, STONE2, s * (GW / 2 - 0.1), Y + H + 5.9, GZ, 0.45, 1.6, 10);
    put(g, cylCone, '#8f9aa5', s * (GW / 2 - 0.1), Y + H + 7.5, GZ, 0.55, 1.1, 0.55);
    ball(g, LANTERN, s * (GW / 2 - 0.1), Y + H + 8.7, GZ, 0.14, 1.3);
  }
  box(g, '#2f5d4a', 0, SIGN.y - SIGN.h / 2 - 0.12, SIGN.z - 0.06, SIGN.w + 0.3, SIGN.h + 0.24, 0.08); // the board behind the name
  for (const s of [-1, 1]) { // a lantern on each pillar
    box(g, RIB, s * GX, Y + 4.6, GZ + 0.7, 0.06, 0.06, 0.45);
    box(g, RIB, s * GX, Y + 4.15, GZ + 0.92, 0.05, 0.45, 0.05);
    ball(g, LANTERN, s * GX, Y + 4.0, GZ + 0.92, 0.26, 1.3);
  }

  // --- the Roman columns of the Temple of Jupiter, closing the street
  const cz2 = Z0 - 1.1;
  box(g, '#bfb7a6', 0, Y, cz2, 13.6, 0.4, 1.5);
  for (const x of [-5.9, -3.55, -1.2, 1.2, 3.55, 5.9]) {
    box(g, COLUMN, x, Y + 0.4, cz2, 1.1, 0.5, 1.1);
    cyl(g, COLUMN, x, Y + 0.9, cz2, 0.45, 12.2, 10);
    box(g, '#cfc09a', x, Y + 13.1, cz2, 1.15, 0.6, 1.15);
  }
  box(g, COLUMN, 0, Y + 13.7, cz2, 13.0, 1.0, 1.25);
  box(g, '#cfc09a', 0, Y + 14.7, cz2, 13.4, 0.3, 1.4);
  put(g, archRing(1.8, 2.4, 1.15), COLUMN, 0, Y + 15.0, cz2);
  gable(g, COLUMN, -4.6, Y + 15.0, cz2, 1.2, 1.25, 3.8, RIGHT);
  gable(g, COLUMN, 4.6, Y + 15.0, cz2, 1.2, 1.25, 3.8, RIGHT);

  // --- people walking in the souq, and in front of the gate
  const SKIN = ['#e0b48a', '#c98f62', '#f0c9a0'], CLOTHES = ['#2c5f8a', '#c0392b', '#3f3f46', '#e7e2d6', '#6b4f8a', '#2e7d5b', '#d9a441'];
  for (let i = 0; i < 52; i++) {
    const inside = i < 42;
    const x = inside ? (rand() - 0.5) * 2 * (R - 1.0) : (rand() - 0.5) * 15;
    const z = inside ? Z0 + 0.8 + rand() * (L - 1.4) : Z1 + 2.0 + rand() * 2.2;
    if (!inside && Math.abs(x) < 3.6) continue;
    const s = 0.85 + rand() * 0.25, top = Y + 1.05 * s;
    taper(g, CLOTHES[i % CLOTHES.length], x, Y, z, 0.21 * s, 0.13 * s, 1.05 * s, 8);
    cyl(g, SKIN[i % SKIN.length], x, top + 0.03 * s, z, 0.13 * s, 0.24 * s, 8);
    put(g, GEO.halfBall, i % 4 === 1 ? '#f4f1ea' : '#2b2420', x, top + 0.25 * s, z, 0.14 * s, 0.12 * s, 0.14 * s); // hair, or a white cap
  }
}
// Where the name of the souq is written, on the gate, facing the visitor.
// (Its centre: above the crown of the arch, below the top of the gate.)
export const SIGN = { y: Y + H + 4.72, z: Z1 + 1.42, w: 7.0, h: 1.15 };
// The covered street (for the night light along it), the gate and the columns.
export const STREET = { z0: Z0, z1: Z1, w: 2 * R };
// The merchant's board (the weekly draw's «تاجر السوق»), on posts on the roof of
// the row on the +x side, along its outer edge near the gate, facing the road.
export const MERCHANT = { x: OUT - 0.5, y: Y + H + 2.0, z: Z1 - 8, w: 7.4, h: 1.5, rot: Math.PI / 2 };
souq.label = 'سوق الحميدية';
souq.top = Y + 17.5;
