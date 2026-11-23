// «فلسطين»: a stone house of Jerusalem's old city with its domed roof, and
// Al-Aqsa: the Dome of the Rock with its golden dome on the raised platform in
// the middle, Al-Qibli Mosque with its lead dome behind it, the arcades at the
// top of the stairs, the Dome of the Chain, minarets, olives and cypresses.
// Houses sit on the 7 x 9 plot (+z is the street); the landmark takes four
// city blocks (64 x 40), +z towards the visitor.
import * as THREE from 'three';
import { C, GEO, put, box, cyl, taper, cone, hip, ramp, ball, gable, arch, face, win, door, ablaq, lot, tree, vine, pot, rng, shine, RIGHT, LEFT, BACK } from './kit.js';
import { crowd, person, lamp, flagPole, merlons } from './world.js';

// ---------------------------------------------------------------- the house of Jerusalem
const LOOKS = [
  { stone: ['#efe3c8', '#e6d7b8'], door: '#2f6b4f', shutter: '#2f6b4f', trees: ['olive', 'lemon'], flower: '#e0457b' },
  { stone: ['#ecd8c0', '#e3c9ac'], door: '#2f5d8a', shutter: '#2f5d8a', trees: ['olive', 'olive'], flower: '#ffffff' },
  { stone: ['#f2eadb', '#e9dfcb'], door: '#7b4b2a', shutter: '#5f7f3a', trees: ['lemon', 'olive'], flower: '#f4c542' },
];
const TRIM = '#d9c9a6', DOME = '#ede4d2';

export function palestineHouse(g, v = {}) {
  const look = { ...LOOKS[0], ...v };
  if (!v.bare) lot(g);
  box(g, '#ddd2bc', 0, 0, 0.1, 6.6, 0.05, 8.2);
  // two floors of pale stone, the upper one a little set back over arches
  ablaq(g, 0, 0.05, -1.7, 5.8, 3.0, 4.2, 9, look.stone);
  ablaq(g, -0.4, 3.05, -2.0, 5.0, 2.6, 3.6, 8, look.stone);
  box(g, TRIM, 0, 3.0, -1.7, 6.0, 0.14, 4.4);
  box(g, TRIM, -0.4, 5.62, -2.0, 5.2, 0.14, 3.8);
  const f = face(g, 0, 0.4);
  // the ground floor: an arched door under a pointed arch, two arched windows with iron bars
  door(f, -1.4, 1.05, 2.25, look.door, { arched: true, pointed: true, frame: TRIM });
  for (const x of [0.6, 2.0]) {
    win(f, x, 0.95, 0.85, 1.35, { arched: true, frame: TRIM, glass: C.glass });
    for (let i = 0; i < 3; i++) box(f, '#2b2d33', x - 0.25 + i * 0.25, 0.95, 0.1, 0.03, 1.2, 0.03);
  }
  // the upper floor: a balcony between two arches, windows with wooden shutters
  const up = face(g, -0.4, -0.2, 0, 3.05);
  for (const x of [-1.5, 1.5]) win(up, x, 0.5, 0.75, 1.3, { arched: true, frame: TRIM, shutters: look.shutter });
  arch(up, TRIM, 0, 0, 0.02, 1.5, 2.2, 0.05, 0, true);
  arch(up, '#9fc9d8', 0, 0.1, 0.05, 1.2, 1.95, 0.05, 0, true);
  box(g, TRIM, -0.4, 3.12, 1.05, 4.6, 0.12, 1.2);   // the terrace over the front room
  for (let i = 0; i < 12; i++) box(g, '#2b2d33', -2.5 + i * 0.38, 3.24, 1.6, 0.04, 0.8, 0.04);
  box(g, '#2b2d33', -0.4, 4.02, 1.6, 4.6, 0.05, 0.05);
  pot(g, 1.6, 3.24, 1.2, 0.8, C.leaf, look.flower);
  const fr = face(g, 2.9, -1.7, RIGHT);
  for (const x of [-1.0, 1.0]) win(fr, x, 1.0, 0.75, 1.2, { arched: true, frame: TRIM, shutters: look.shutter });
  const fl = face(g, -2.9, -1.7, LEFT);
  win(fl, 0, 1.0, 0.75, 1.2, { arched: true, frame: TRIM, shutters: look.shutter });

  // the roof: the stone domes of Jerusalem, a parapet, water tanks and a solar heater
  put(g, GEO.halfBall, DOME, -0.8, 5.76, -2.0, 1.55, 1.25, 1.55);
  ball(g, TRIM, -0.8, 7.05, -2.0, 0.12);
  for (const [x, z, w, d] of [[-0.4, -0.2, 5.0, 0.16], [-0.4, -3.8, 5.0, 0.16], [-2.9, -2.0, 0.16, 3.6], [2.1, -2.0, 0.16, 3.6]]) box(g, look.stone[0], x, 5.76, z, w, 0.45, d);
  for (const x of [1.2, 1.9]) { box(g, '#55585f', x, 5.76, -3.2, 0.6, 0.4, 0.6); cyl(g, '#26272b', x, 6.16, -3.2, 0.32, 0.8, 10); }
  const sol = face(g, 1.4, -1.6, 0, 5.76);
  put(sol, GEO.box, '#2c4a6e', 0, 0.3, 0, 1.2, 0.06, 0.9).rotation.x = -0.65;
  for (const s of [-1, 1]) box(sol, '#9aa0a8', s * 0.55, 0, 0.3, 0.05, 0.75, 0.05);

  // the street wall with an arched gate, an olive tree, a lemon tree and a vine
  ablaq(g, 1.75, 0.05, 4.0, 3.1, 1.0, 0.3, 3, look.stone);
  ablaq(g, -2.85, 0.05, 4.0, 0.9, 1.0, 0.3, 3, look.stone);
  for (const s of [-1, 1]) ablaq(g, s * 3.15, 0.05, 2.2, 0.28, 1.0, 3.4, 3, look.stone);
  const gate = face(g, -1.1, 4.0, 0, 0.05);
  arch(gate, look.stone[1], 0, 0, 0, 2.6, 2.3, 0.32, 0, true);
  arch(gate, look.door, 0, 0, 0.05, 1.6, 1.9, 0.34, 0, true);
  tree(g, 1.9, 2.4, 0.9, look.trees[0]);
  tree(g, -2.4, 2.1, 0.6, look.trees[1]);
  vine(face(g, 1.75, 4.16), 0, 0.3, 2.8, 1.0, 12, { dots: ['#6b2a5e'], seed: 13 });
  pot(g, -0.1, 0.05, 1.0, 0.9, C.leaf, look.flower);
}
palestineHouse.looks = LOOKS;
palestineHouse.top = 7.3;
palestineHouse.flag = [-2.4, 6.2, -3.4]; // where the pole of the owner's flag stands on the roof

// ---------------------------------------------------------------- Al-Aqsa
const PAVE = '#e9dfcc', PAVE2 = '#ddd1ba', STONE = '#e6d8bc', STONE2 = '#d8c7a6', MARBLE = '#f4efe5';
const TILE = '#2f6fb0', TILE2 = '#3aa6b9', TILE3 = '#f4efe5';
const GOLD = shine('#e7b53e', 2.6);  // the dome shines in its own gold at night
const LEAD = '#9aa3ad', LEAD2 = '#87909b';
const WIN = shine('#ffd88a', 1);
const CRESCENT = new THREE.TorusGeometry(0.55, 0.12, 6, 14, Math.PI * 1.45);
const R8 = 12.2, WALL_H = 9.2, PLAT = 2.4; // the Dome of the Rock: the octagon's radius, its walls, the platform it stands on

// An octagon of walls, each face decorated (x, z: centre; y: bottom).
function octagon(g, x, y, z) {
  const side = 2 * R8 * Math.tan(Math.PI / 8), apo = R8;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const f = face(g, x + Math.sin(a) * apo, z + Math.cos(a) * apo, a, y);
    box(f, MARBLE, 0, 0, -0.35, side + 0.05, 4.2, 0.7);       // the marble below
    box(f, TILE, 0, 4.2, -0.35, side + 0.05, WALL_H - 4.2, 0.7); // the blue tiles above
    box(f, TILE2, 0, 4.2, 0.02, side, 0.35, 0.04);
    box(f, TILE2, 0, WALL_H - 0.9, 0.02, side, 0.5, 0.04);
    for (let k = 0; k < 7; k++) box(f, TILE3, -side / 2 + (k + 0.5) * (side / 7), WALL_H - 0.75, 0.05, 0.25, 0.25, 0.03); // the band of white lettering
    for (const dx of [-side * 0.33, 0, side * 0.33]) {                                   // windows in the tiles
      arch(f, TILE3, dx, 5.0, 0.03, 1.15, 2.4, 0.04, 0, true);
      arch(f, WIN, dx, 5.12, 0.05, 0.85, 2.15, 0.04, 0, true);
    }
    if (i % 2 === 0) { // a porch in front of the doors on four sides
      for (const s of [-1, 1]) cyl(f, MARBLE, s * 1.9, 0, 1.6, 0.22, 3.4, 8);
      box(f, STONE, 0, 3.4, 1.0, 4.6, 0.6, 2.4);
      arch(f, '#5a3620', 0, 0, 0.05, 2.0, 3.1, 0.06, 0, true);
    }
  }
  // the parapet
  cyl(g, TILE, x, y + WALL_H, z, R8 / Math.cos(Math.PI / 8) + 0.1, 0.5, 8).rotation.y = Math.PI / 8;
}

function domeOfTheRock(g, x, y, z) {
  octagon(g, x, y, z);
  box(g, STONE2, x, y + WALL_H, z, R8 * 1.6, 0.6, R8 * 1.6); // the roof round the drum
  const DR = 6.4, DH = 5.4, top = y + WALL_H + 0.6;
  cyl(g, TILE, x, top, z, DR, DH, 16);                          // the drum, all blue
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + Math.PI / 16;
    const f = face(g, x + Math.sin(a) * DR, z + Math.cos(a) * DR, a, top);
    arch(f, TILE3, 0, 1.4, 0.02, 0.95, 2.6, 0.04, 0, true);
    arch(f, WIN, 0, 1.5, 0.04, 0.7, 2.35, 0.04, 0, true);
  }
  cyl(g, TILE2, x, top + DH - 0.5, z, DR + 0.15, 0.5, 16);
  put(g, GEO.halfBall, GOLD, x, top + DH, z, DR + 0.35, DR * 1.12, DR + 0.35); // the golden dome
  const tip = top + DH + DR * 1.12;
  cyl(g, GOLD, x, tip - 0.2, z, 0.18, 2.2, 8);
  ball(g, GOLD, x, tip + 1.0, z, 0.38);
  put(g, CRESCENT, GOLD, x, tip + 2.3, z, 1, 1, 1).rotation.z = Math.PI * 0.27; // the crescent
  return tip + 3;
}

function qibli(g, z) { // Al-Qibli Mosque along the back, its lead dome over the middle
  const W = 40, D = 9.5, H = 8.5, z0 = z;
  ablaq(g, 0, 0.2, z0, W, H, D, 10, [STONE, STONE2]);
  for (const dz of [-2.6, 0, 2.6]) gable(g, LEAD, 0, 0.2 + H, z0 + dz, W + 0.2, 1.4, 2.8);
  const fr = face(g, 0, z0 + D / 2, 0, 0.2);
  box(fr, STONE2, 0, 0, 0.9, 22, 5.2, 1.8);                      // the porch with its seven arches
  for (let i = 0; i < 7; i++) {
    const x = -9.4 + i * 3.13;
    arch(fr, MARBLE, x, 0, 1.82, 2.5, 4.4, 0.06, 0, true);
    arch(fr, '#3a2c26', x, 0, 1.85, 2.0, 4.0, 0.06, 0, true);
  }
  for (const x of [-15, -12, 12, 15]) win(fr, x, 3.0, 1.0, 2.2, { arched: true, pointed: true, frame: MARBLE, glass: WIN });
  for (let i = 0; i < 9; i++) box(fr, STONE, -10.6 + i * 2.65, 5.2, 1.6, 0.9, 0.5, 0.5); // the merlons on the porch
  // the lead dome
  cyl(g, STONE2, 0, 0.2 + H, z0 - 1.5, 4.0, 3.0, 12);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; box(g, WIN, Math.sin(a) * 4.0, 0.2 + H + 1.0, z0 - 1.5 + Math.cos(a) * 4.0, 0.5, 1.2, 0.1, a); }
  put(g, GEO.halfBall, LEAD2, 0, 0.2 + H + 3.0, z0 - 1.5, 4.4, 4.2, 4.4);
  cyl(g, GOLD, 0, 0.2 + H + 7.1, z0 - 1.5, 0.1, 1.4, 8);
  ball(g, GOLD, 0, 0.2 + H + 8.6, z0 - 1.5, 0.26);
}

function minaret(g, x, z, h) { // the square stone minarets of the haram
  box(g, STONE, x, 0.2, z, 3.0, h * 0.62, 3.0);
  box(g, STONE2, x, 0.2 + h * 0.62, z, 3.6, 0.5, 3.6);
  for (const [dx, dz] of [[1.8, 0], [-1.8, 0], [0, 1.8], [0, -1.8]]) box(g, STONE2, x + dx, 0.7 + h * 0.62, z + dz, dx ? 0.1 : 3.6, 0.7, dz ? 0.1 : 3.6);
  box(g, STONE, x, 0.7 + h * 0.62, z, 2.3, h * 0.18, 2.3);
  for (const [dx, dz] of [[1.16, 0], [-1.16, 0], [0, 1.16], [0, -1.16]]) arch(g, '#3a2c26', x + dx, 1.2 + h * 0.62, z + dz, 0.7, 1.6, 0.06, Math.atan2(dx, dz), true);
  cyl(g, STONE2, x, 0.7 + h * 0.8, z, 1.0, 0.5, 10);
  put(g, GEO.halfBall, LEAD2, x, 1.2 + h * 0.8, z, 1.0, 1.2, 1.0);
  cyl(g, GOLD, x, 2.4 + h * 0.8, z, 0.06, 1.0, 6);
  ball(g, GOLD, x, 3.5 + h * 0.8, z, 0.16);
  box(g, '#3a7d4a', x, 0.7 + h * 0.62, z + 1.85, 0.9, 0.12, 0.05); // a green lamp band
}

function arcade(g, x, z, ry, n = 4, w = 9) { // a "qanatir": a row of arches on columns at the top of the stairs
  const f = face(g, x, z, ry, PLAT + 0.2);
  const step = w / n;
  for (let i = 0; i <= n; i++) cyl(f, MARBLE, -w / 2 + i * step, 0, 0, 0.22, 3.6, 8);
  box(f, STONE, 0, 3.6, 0, w + 0.6, 0.9, 0.7);
  for (let i = 0; i < n; i++) arch(f, STONE2, -w / 2 + (i + 0.5) * step, 2.6, 0.36, step - 0.3, 1.1, 0.05);
  // the stairs down to the courtyard, in front of it
  for (let k = 0; k < 6; k++) box(face(g, x, z, ry, 0.2), PAVE2, 0, k * (PLAT / 6), 1.0 + (5 - k) * 0.45, w + 1, PLAT / 6, 0.45);
}

export function aqsa(g) {
  const rand = rng(691); // the Dome of the Rock was finished in 691
  box(g, PAVE, 0, 0, 0, 63.6, 0.2, 39.6);                         // the haram, paved
  for (let i = 0; i < 13; i++) box(g, PAVE2, -30 + i * 5, 0.2, 0, 0.18, 0.02, 39);
  // the walls round the haram, with gates
  for (const [x, z, w, d] of [[0, -19.4, 63.6, 0.8], [-31.4, 0, 0.8, 39.6], [31.4, 0, 0.8, 39.6]]) ablaq(g, x, 0.2, z, w, 2.6, d, 4, [STONE, STONE2]);
  for (const s of [-1, 1]) ablaq(g, s * 20, 0.2, 19.4, 23.6, 2.6, 0.8, 4, [STONE, STONE2]);
  for (const s of [-1, 1]) { const gt = face(g, s * 4.6, 19.4, 0, 0.2); arch(gt, STONE2, 0, 0, 0, 3.2, 4.2, 0.9, 0, true); arch(gt, '#5a3620', 0, 0, 0.05, 2.2, 3.6, 0.95, 0, true); }

  // the raised platform in the middle, with the Dome of the Rock on it
  const PZ = 4.0, PW = 36, PD = 25;
  ablaq(g, 0, 0.2, PZ, PW, PLAT, PD, 3, [STONE2, STONE]);
  box(g, MARBLE, 0, 0.2 + PLAT, PZ, PW - 0.4, 0.06, PD - 0.4);
  arcade(g, 0, PZ + PD / 2, 0);                                     // the arcade at the top of the front stairs
  arcade(g, -PW / 2, PZ + 6, -Math.PI / 2, 3, 7);                   // and on the sides
  arcade(g, PW / 2, PZ + 6, Math.PI / 2, 3, 7);
  const top = domeOfTheRock(g, 0, 0.26 + PLAT, PZ);
  // the Dome of the Chain beside it: an open dome on columns
  const cx = 15.2, cz = PZ - 6.5, cy = 0.26 + PLAT;
  for (let i = 0; i < 11; i++) { const a = (i / 11) * Math.PI * 2; cyl(g, MARBLE, cx + Math.sin(a) * 2.2, cy, cz + Math.cos(a) * 2.2, 0.14, 3.0, 8); }
  cyl(g, TILE, cx, cy + 3.0, cz, 2.6, 0.9, 6);
  put(g, GEO.halfBall, LEAD2, cx, cy + 3.9, cz, 2.1, 1.8, 2.1);
  // Al-Qibli Mosque at the back, the fountain (al-Kas) between them
  qibli(g, -14.0);
  cyl(g, MARBLE, 0, 0.2, -6.8, 2.0, 0.5, 14);
  cyl(g, '#6ec6f0', 0, 0.45, -6.8, 1.7, 0.2, 14);
  // the minarets
  minaret(g, -29.4, -17.4, 27);
  minaret(g, 29.4, -17.4, 25);
  minaret(g, -29.4, 17.4, 24);
  // olives, cypresses, lamps, worshippers
  for (const [x, z, k] of [[-26, 2, 'olive'], [-24, 12, 'olive'], [-27, -8, 'cypress'], [26, 4, 'olive'], [24, 13, 'olive'], [27, -7, 'cypress'],
    [-21, 16, 'cypress'], [21, 16, 'cypress'], [-11, 17.5, 'olive'], [11, 17.5, 'olive'], [-24, -12, 'olive'], [24, -12, 'olive']]) tree(g, x, z, 1.3, k);
  for (const x of [-26, -14, 14, 26]) lamp(g, x, 0.2, 18.2, { h: 3.4 });
  for (const x of [-17, 17]) lamp(g, x, 0.2 + PLAT, PZ + 11, { h: 3.0 });
  crowd(g, 26, [-28, 28, -4, 18], rand, { y: 0.2, free: (x, z) => Math.abs(x) > PW / 2 + 1 || z > PZ + PD / 2 + 3.5 });
  crowd(g, 14, [-16, 16, -8, 16], rand, { y: 0.26 + PLAT, free: (x, z) => Math.hypot(x, z - PZ) > R8 + 1.5 && Math.abs(z - PZ) < PD / 2 - 1 });
  aqsa.top = top;
  aqsa.flag = { code: 'ps', ...flagPole(g, 29.4, 0.2, 12, 30) }; // a tall pole at the corner of the haram, the flag as high as the dome
}
aqsa.label = 'المسجد الأقصى';
aqsa.top = 36;
aqsa.size = [64, 40];
aqsa.floodlight = { color: '#ffd08a', at: [0, 16, 26] }; // the warm light on the Dome of the Rock

// Al-Aqsa by night, drawn on top of the stone (additive, faded in with the
// night by the city; mats: [material, strength]): blue light washing up the
// walls of the Dome of the Rock, a golden glow on the dome and a soft halo
// round it, four beams from the corners of the platform meeting over the
// dome, green rings on the minarets, warm pools on the platform and the
// courtyard, and golden sparks drifting slowly round the dome (update(t)).
const MINARETS = [[-29.4, -17.4, 27], [29.4, -17.4, 25], [-29.4, 17.4, 24]];
export function aqsaLights() {
  const group = new THREE.Group(), mats = [];
  const glow = (color, strength, extra = {}) => {
    const m = new THREE.MeshBasicMaterial({ color, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide, ...extra });
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
  const PZ = 4.0, base = 0.26 + PLAT, drumY = base + WALL_H + 0.6, DR = 6.4, domeY = drumY + 5.4, top = domeY + DR * 1.12;

  // the walls of the octagon, washed in blue from below
  const RW = (R8 / Math.cos(Math.PI / 8)) * 1.015;
  const wall = shade(new THREE.CylinderGeometry(RW, RW, WALL_H, 8, 6, true).rotateY(Math.PI / 8).translate(0, WALL_H / 2, 0), (x, y) => 0.25 + 0.75 * Math.pow(1 - y / WALL_H, 1.4));
  add(wall, glow('#6fc3ff', 0.55), 0, base, PZ);
  // the drum, turquoise
  const drum = shade(new THREE.CylinderGeometry(DR * 1.03, DR * 1.03, 5.4, 16, 3, true).translate(0, 2.7, 0), (x, y) => 0.4 + 0.6 * (1 - y / 5.4));
  add(drum, glow('#5fe3e0', 0.45), 0, drumY, PZ);
  // the golden dome: a glow on it, brightest low down, and a wide halo round it
  const dome = shade(new THREE.SphereGeometry(DR + 0.5, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 1.12, 1), (x, y) => 0.35 + 0.65 * (1 - y / ((DR + 0.5) * 1.12)));
  add(dome, glow('#ffb43a', 0.28), 0, domeY, PZ);
  const halo = shade(new THREE.SphereGeometry(DR * 2.1, 24, 12), (x, y, z) => Math.max(0, 1 - Math.hypot(x, y * 0.9, z) / (DR * 2.1)) ** 2);
  add(halo, glow('#ffcf6a', 0.55, { side: THREE.BackSide }), 0, domeY + 2.5, PZ);
  // four beams from the corners of the platform, crossing high over the dome
  const up = new THREE.Vector3(0, 1, 0);
  for (const [cx, cz] of [[-17, PZ - 11.5], [17, PZ - 11.5], [-17, PZ + 11.5], [17, PZ + 11.5]]) {
    const a = new THREE.Vector3(cx, base, cz), b = new THREE.Vector3(-cx * 0.35, top + 34, PZ - (cz - PZ) * 0.35), len = a.distanceTo(b);
    const geo = shade(new THREE.CylinderGeometry(2.6, 0.35, len, 16, 8, true).translate(0, len / 2, 0), (x, y) => Math.pow(1 - y / len, 1.5));
    const m = add(geo, glow('#ffe9b0', 0.2), a.x, a.y, a.z);
    m.quaternion.setFromUnitVectors(up, b.clone().sub(a).normalize());
    add(shade(new THREE.CircleGeometry(1.6, 16).rotateX(-Math.PI / 2), (x, y, z, i) => (i === 0 ? 1 : 0)), glow('#ffe9b0', 0.7), cx, base + 0.08, cz);
  }
  // warm pools: round the octagon on the platform, under the arcades, in the courtyard, the fountain
  const ring = shade(new THREE.RingGeometry(R8 + 0.5, R8 + 7, 48, 2).rotateX(-Math.PI / 2), (x, y, z) => Math.max(0, 1 - (Math.hypot(x, z) - R8 - 0.5) / 6.5));
  add(ring, glow('#ffcf80', 0.45), 0, base + 0.09, PZ);
  const pool = (r) => shade(new THREE.CircleGeometry(r, 24).rotateX(-Math.PI / 2), (x, y, z, i) => (i === 0 ? 1 : 0));
  for (const [x, z, r] of [[0, PZ + 12.5, 7], [-18, PZ + 6, 5], [18, PZ + 6, 5], [-24, 12, 6], [24, 12, 6], [-24, -6, 6], [24, -6, 6], [0, 17, 7]]) add(pool(r), glow("#ffc070", 0.4), x, 0.25, z);
  add(pool(3.2), glow('#6fe0ff', 0.6), 0, 0.5, -6.8);
  // Al-Qibli: its facade warm, its lead dome silver-blue
  const front = shade(new THREE.PlaneGeometry(24, 7, 1, 4), (x, y) => Math.max(0, 0.15 + 0.85 * (0.5 - y / 7)));
  add(front, glow('#ffd59a', 0.4), 0, 3.7, -14.0 + 9.5 / 2 + 1.9);
  const lead = shade(new THREE.SphereGeometry(4.6, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), (x, y) => 0.3 + 0.7 * (1 - y / 4.6));
  add(lead, glow('#9fc4ff', 0.35), 0, 0.2 + 8.5 + 3.0, -14.0 - 1.5);
  // the minarets: green rings round their balconies, a warm wash up the shaft
  for (const [x, z, h] of MINARETS) {
    for (const [y, r] of [[0.85 + h * 0.62, 2.0], [0.95 + h * 0.8, 1.15]]) add(new THREE.TorusGeometry(r, 0.1, 6, 28).rotateX(Math.PI / 2), glow('#3cf08a', 0.95, { vertexColors: false }), x, y, z);
    const shaft = shade(new THREE.BoxGeometry(3.2, h * 0.62, 3.2).translate(0, h * 0.31, 0), (px, py) => Math.pow(1 - py / (h * 0.62), 1.3));
    add(shaft, glow('#ffd08a', 0.3), x, 0.2, z);
  }

  // golden sparks drifting round the dome
  const N = 90, rand = rng(17), sparks = [];
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) sparks.push({ r: 12 + rand() * 14, a: rand() * Math.PI * 2, y: base + 2 + rand() * 26, s: 0.05 + rand() * 0.12, b: rand() * Math.PI * 2 });
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d'), g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,240,190,1)'); g.addColorStop(0.35, 'rgba(255,205,110,0.7)'); g.addColorStop(1, 'rgba(255,190,80,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const pm = new THREE.PointsMaterial({ size: 1.5, map: new THREE.CanvasTexture(c), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  mats.push([pm, 0.95]);
  const points = new THREE.Points(pg, pm);
  points.raycast = () => {};
  points.frustumCulled = false;
  group.add(points);
  const update = (t) => {
    for (let i = 0; i < N; i++) {
      const s = sparks[i], a = s.a + t * s.s;
      pos[i * 3] = Math.cos(a) * s.r;
      pos[i * 3 + 1] = s.y + Math.sin(t * 0.6 + s.b) * 1.2;
      pos[i * 3 + 2] = PZ + Math.sin(a) * s.r;
    }
    pg.attributes.position.needsUpdate = true;
  };
  update(0);
  return { group, mats, update };
}
aqsa.lights = aqsaLights;

// ---------------------------------------------------------------- the Church of the Nativity
// «كنيسة المهد» in Bethlehem, the second landmark of Palestine's village, on a
// block of its own among the houses (28.6 x 16.6, +z towards the street). The
// old stone basilica with its plain front, buttresses and the tiny Door of
// Humility under the outlines of the older, bigger doors; the lead roofs of
// the nave and the transept with its three apses; the bell tower; the
// convents either side; and in front, Manger Square with its Christmas tree,
// the crib, and the minaret of the Mosque of Omar across the square.
const NST = '#e9dcc0', NST2 = '#dccaa6', NST3 = '#f1e7d2', NROOF = '#8e959c', NPAVE = '#e7dcc6', NPAVE2 = '#d6c8ae';
const FIR = ['#2f7a4a', '#2a6e43', '#358553'];
const STAR_GOLD = shine('#ffd64b', 3);
const BAUBLES = ['#d6262f', '#f3c23f', '#2f7fe0', '#f4f4fe'].map((c) => shine(c, 2.4));
const CROSS = shine('#fbf3dc', 2.2); // the crosses shine softly at night
const STAR = (() => { // a flat five-pointed star, 1 across, facing +z
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.2 : 0.5;
    if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r); else s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  return new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false }).translate(0, 0, -0.06);
})();
const NAT = {
  front: 3.0,            // the front of the church, on the square
  tower: [-8.6, -1.6],   // the bell tower
  minaret: [12.6, 0.6],  // the minaret of the Mosque of Omar
  tree: [-5.8, 5.6],     // the Christmas tree
  tiers: [[2.5, 1.0, 3.4], [2.0, 3.4, 3.0], [1.5, 5.6, 2.7], [0.95, 7.6, 2.4]], // the tree's cones: radius, bottom, height
  lamps: [-12.5, -1.9, 1.9, 12.5],
};

function cross(g, x, y, z, s = 1) {
  box(g, CROSS, x, y, z, 0.16 * s, 1.5 * s, 0.16 * s);
  box(g, CROSS, x, y + 0.85 * s, z, 0.85 * s, 0.16 * s, 0.16 * s);
}

export function nativity(g) {
  const rand = rng(565); // Justinian's church, rebuilt about 565
  box(g, NPAVE, 0, 0, 0, 28.6, 0.2, 16.6);
  for (let i = 0; i < 9; i++) box(g, NPAVE2, -12.8 + i * 3.2, 0.2, 5.65, 0.16, 0.02, 5.3); // the square's paving pattern
  box(g, NPAVE2, 0, 0.2, 3.2, 28.6, 0.02, 0.2);
  const Y = 0.2, F = NAT.front;

  // --- the basilica: the narthex in front, the nave and its aisles, the transept and its three apses
  ablaq(g, 0, Y, F - 0.9, 11.6, 7.2, 1.8, 12, [NST, NST2]);
  box(g, NST2, 0, Y + 7.2, F - 0.9, 11.8, 0.25, 2.0);
  ablaq(g, 0, Y, -1.2, 5.6, 9.4, 4.8, 14, [NST, NST2]);                 // the nave
  gable(g, NROOF, 0, Y + 9.4, -1.2, 5.0, 2.2, 6.0, Math.PI / 2);
  gable(g, NST, 0, Y + 9.4, 1.25, 0.14, 2.2, 5.6, Math.PI / 2);          // its stone gable end over the narthex
  cross(g, 0, Y + 11.6, 1.25);
  for (const s of [-1, 1]) {                                            // the aisles, lower, with lean-to roofs
    ablaq(g, s * 4.3, Y, -1.2, 3.0, 6.4, 4.8, 9, [NST2, NST]);
    ramp(g, NROOF, s * 4.3, Y + 6.4, -1.2, 3.2, 1.4, 4.9, s < 0 ? 0 : BACK);
    const side = face(g, s * 5.8, -1.2, s > 0 ? RIGHT : LEFT, Y);
    for (const x of [-1.2, 1.2]) win(side, x, 3.4, 0.6, 1.3, { arched: true, frame: NST3, glass: WIN });
    const clere = face(g, s * 2.8, -1.2, s > 0 ? RIGHT : LEFT, Y);       // small windows high in the nave
    for (const x of [-1.4, 0, 1.4]) win(clere, x, 8.0, 0.5, 0.95, { arched: true, frame: NST3, glass: WIN });
  }
  ablaq(g, 0, Y, -5.0, 14.4, 9.4, 2.8, 14, [NST, NST2]);                // the transept
  gable(g, NROOF, 0, Y + 9.4, -5.0, 14.6, 2.2, 3.2);
  cross(g, 0, Y + 11.6, -5.0, 0.8);
  for (const [x, z, r] of [[0, -6.4, 1.9], [-7.2, -5.0, 1.35], [7.2, -5.0, 1.35]]) { // the three apses
    cyl(g, NST2, x, Y, z, r, 6.4, 14);
    put(g, GEO.halfBall, NROOF, x, Y + 6.4, z, r + 0.05, r * 0.75, r + 0.05);
  }

  // --- the front: three buttresses, the outline of Justinian's great door, the Crusaders' pointed arch, and the tiny Door of Humility
  for (const [x, w, h] of [[-5.0, 1.3, 5.2], [-2.3, 1.2, 4.4], [2.3, 1.2, 4.4]]) {
    box(g, NST2, x, Y, F + 0.6, w, h, 1.2);
    ramp(g, NST2, x, Y + h, F + 0.6, 1.2, 1.4, w, Math.PI / 2);
  }
  const fr = face(g, 0, F, 0, Y);
  box(fr, NST3, 0, 0, 0.02, 3.1, 4.4, 0.04);                             // the great door of Justinian, walled up
  box(fr, NST2, 0, 4.4, 0.03, 3.5, 0.45, 0.06);                          // its lintel
  arch(fr, NST2, 0, 0, 0.05, 2.2, 3.1, 0.05, 0, true);                   // the Crusaders' arch, walled up
  arch(fr, NST3, 0, 0, 0.07, 1.8, 2.8, 0.05, 0, true);
  box(fr, NST2, 0, 0, 0.1, 1.1, 1.45, 0.06);                             // the Door of Humility: you bow to go in
  box(fr, '#5a3620', 0, 0, 0.13, 0.8, 1.25, 0.06);
  for (const x of [-3.6, 3.6, 0]) win(fr, x, x ? 5.4 : 5.0, 0.55, 1.0, { arched: true, frame: NST3, glass: WIN });
  for (let i = 0; i < 3; i++) box(g, NPAVE2, 0, Y + i * 0.08, F + 0.35 + (2 - i) * 0.3, 2.4 - i * 0.4, 0.08, 0.6); // worn steps

  // --- the bell tower
  const [tx, tz] = NAT.tower;
  ablaq(g, tx, Y, tz, 3.2, 10.0, 3.2, 12, [NST, NST2]);
  box(g, NST2, tx, Y + 10.0, tz, 3.5, 0.3, 3.5);
  box(g, NST, tx, Y + 10.3, tz, 3.0, 2.9, 3.0);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2, bf = face(g, tx + Math.sin(a) * 1.5, tz + Math.cos(a) * 1.5, a, Y + 10.3);
    arch(bf, '#3a2c26', 0, 0.3, 0.02, 1.5, 2.3, 0.04);
    taper(bf, '#c9a24a', 0, 0.9, 0.1, 0.42, 0.16, 0.9, 10);               // a bell in each opening
  }
  for (const y of [2.2, 5.6]) for (const [dx, dz, ry] of [[0, 1.6, 0], [1.6, 0, RIGHT], [-1.6, 0, LEFT]]) win(face(g, tx + dx, tz + dz, ry, Y), 0, y, 0.45, 0.9, { arched: true, frame: NST3, glass: WIN });
  box(g, NST2, tx, Y + 13.2, tz, 3.5, 0.35, 3.5);
  hip(g, NROOF, tx, Y + 13.55, tz, 3.4, 2.6, 3.4);
  cross(g, tx, Y + 16.15, tz);

  // --- the convents either side: the Franciscans' on the left, the Greeks' with its battlements on the right
  ablaq(g, -12.4, Y, -3.0, 3.6, 6.2, 10.0, 9, [NST2, NST]);
  gable(g, NROOF, -12.4, Y + 6.2, -3.0, 10.2, 1.5, 3.8, Math.PI / 2);
  const lf = face(g, -12.4, 2.0, 0, Y);
  arch(lf, NST3, 0, 0, 0.02, 1.6, 2.5, 0.05, 0, true);
  arch(lf, '#5a3620', 0, 0, 0.05, 1.2, 2.2, 0.05, 0, true);
  win(lf, 0, 3.9, 0.6, 1.1, { arched: true, frame: NST3, glass: WIN });
  cross(g, -12.4, Y + 7.7, 2.05, 0.6);
  const lr = face(g, -10.6, -3.0, RIGHT, Y);
  for (const x of [-3.5, -1.2, 1.2, 3.5]) win(lr, x, 3.6, 0.55, 1.0, { arched: true, frame: NST3, glass: WIN });
  ablaq(g, 10.8, Y, -5.2, 6.4, 7.0, 6.0, 10, [NST, NST2]);
  merlons(g, NST2, 7.8, -2.35, 13.8, -2.35, Y + 7.0, { gap: 1.0 });
  merlons(g, NST2, 7.75, -8.0, 7.75, -2.4, Y + 7.0, { gap: 1.0 });
  const gf = face(g, 10.8, -2.2, 0, Y);
  for (const x of [-2.0, 0, 2.0]) for (const y of [1.4, 4.4]) win(gf, x, y, 0.6, 1.1, { arched: true, frame: NST3, glass: WIN });

  // --- the Mosque of Omar across the square, with its minaret
  ablaq(g, 11.0, Y, -0.3, 5.6, 4.6, 3.8, 7, [NST3, NST]);
  merlons(g, NST2, 8.3, 1.55, 13.7, 1.55, Y + 4.6, { gap: 0.8, h: 0.4 });
  const mf = face(g, 11.0, 1.6, 0, Y);
  arch(mf, NST2, -0.6, 0, 0.02, 1.5, 2.6, 0.05, 0, true);
  arch(mf, '#2f6b4f', -0.6, 0, 0.05, 1.1, 2.3, 0.05, 0, true);
  for (const x of [-2.2, 1.4]) win(mf, x, 1.2, 0.6, 1.2, { arched: true, pointed: true, frame: NST2, glass: WIN });
  const [mx, mz] = NAT.minaret;
  box(g, NST, mx, Y, mz, 1.7, 6.4, 1.7);
  box(g, NST2, mx, Y + 6.4, mz, 1.9, 0.25, 1.9);
  cyl(g, NST3, mx, Y + 6.65, mz, 0.62, 6.6, 8);
  cyl(g, NST2, mx, Y + 13.25, mz, 1.0, 0.35, 8);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; box(g, NST2, mx + Math.sin(a) * 0.95, Y + 13.6, mz + Math.cos(a) * 0.95, 0.1, 0.5, 0.1); }
  cyl(g, NST3, mx, Y + 13.6, mz, 0.45, 1.8, 8);
  cone(g, NROOF, mx, Y + 15.4, mz, 0.55, 1.8);
  cyl(g, GOLD, mx, Y + 17.1, mz, 0.05, 0.7, 6);
  put(g, CRESCENT, GOLD, mx, Y + 18.0, mz, 0.6, 0.6, 0.6).rotation.z = Math.PI * 0.27;

  // --- Manger Square: the Christmas tree with its star, baubles and presents
  const [cx, cz] = NAT.tree;
  cyl(g, '#6b4a30', cx, Y, cz, 0.28, 1.2, 8);
  NAT.tiers.forEach(([r, y, h], i) => cone(g, FIR[i % FIR.length], cx, Y + y, cz, r, h));
  const topY = Y + NAT.tiers[3][1] + NAT.tiers[3][2];
  put(g, STAR, STAR_GOLD, cx, topY + 0.45, cz, 1.5, 1.5, 1.5);
  put(g, STAR, STAR_GOLD, cx, topY + 0.45, cz, 1.5, 1.5, 1.5, Math.PI / 2);
  for (let i = 0; i < 46; i++) {
    const [r, y, h] = NAT.tiers[i % 4], f = 0.1 + rand() * 0.75, a = rand() * Math.PI * 2, rr = r * (1 - f) + 0.08;
    ball(g, BAUBLES[i % BAUBLES.length], cx + Math.cos(a) * rr, Y + y + f * h, cz + Math.sin(a) * rr, 0.16);
  }
  for (const [dx, dz, c, s] of [[1.6, 1.2, '#c0392b', 0.7], [-1.4, 1.5, '#2e7d5b', 0.55], [0.4, 2.0, '#d9a441', 0.6], [-2.0, 0.2, '#3d5a9a', 0.5], [2.1, -0.4, '#c0392b', 0.5]]) {
    box(g, c, cx + dx, Y, cz + dz, s, s, s);
    box(g, '#f4f1ea', cx + dx, Y, cz + dz, s + 0.02, s + 0.02, 0.1);
  }
  // the crib: a wooden stable with Mary, Joseph, the manger and two sheep
  const crib = face(g, 6.2, 5.3, 0, Y);
  for (const [x, z] of [[-1.4, -0.9], [1.4, -0.9], [-1.4, 0.9], [1.4, 0.9]]) box(crib, '#7b4b2a', x, 0, z, 0.16, 2.2, 0.16);
  box(crib, '#8a5a34', 0, 0, -0.95, 3.0, 1.9, 0.12);
  gable(crib, '#b07a45', 0, 2.2, 0, 3.4, 0.9, 2.4);
  box(crib, '#7b4b2a', 0, 0, 0.1, 0.9, 0.45, 0.5);
  box(crib, '#e3c46a', 0, 0.45, 0.1, 0.85, 0.08, 0.45);
  ball(crib, '#f4f1ea', 0, 0.6, 0.1, 0.16);
  person(crib, -0.75, 0, 0.0, 0, 0.8, { clothes: ['#3d6fb6'], hair: '#3d6fb6' });
  person(crib, 0.8, 0, -0.1, 0, 0.85, { clothes: ['#8a5a34'] });
  for (const x of [-1.9, 1.9]) { ball(crib, '#f4f4f0', x, 0.35, 0.9, 0.3, 0.8); ball(crib, '#2b2b2b', x + (x < 0 ? -0.3 : 0.3), 0.45, 0.9, 0.12); }
  ball(crib, STAR_GOLD, 0, 3.4, 0.9, 0.2);

  // trees, lamps and people on the square
  for (const [x, z, k, s] of [[-13.2, 6.8, 'palm', 1.5], [13.4, 6.9, 'palm', 1.5], [10.2, 6.8, 'olive', 1.0], [-9.9, 7.2, 'olive', 0.9], [-14.0, -7.6, 'cypress', 1.2], [14.0, 2.6, 'cypress', 1.1]]) tree(face(g, 0, 0, 0, Y), x, z, s, k);
  for (const x of NAT.lamps) lamp(g, x, Y, 7.9, { h: 3.2 });
  crowd(g, 26, [-13, 13, 3.8, 8.0], rand, { y: Y, free: (x, z) => Math.hypot(x - cx, z - cz) > 3.0 && !(Math.abs(x - 6.2) < 2.2 && Math.abs(z - 5.3) < 1.4) && Math.abs(x) > 0.8 });
}
nativity.label = 'كنيسة المهد';
nativity.top = 10; // where its name tag floats: over the nave (the tower and the minaret reach 18), so from up high it doesn't land on Al-Aqsa behind
nativity.size = [28.6, 16.6];
nativity.floodlight = { color: '#ffc978', at: [0, 6, 9] };

// The Church of the Nativity by night (additive, faded in with the night by
// the city): the old stone front washed gold from below, the bell tower and
// the minaret lit, green rings on the minaret, warm pools on the square, and
// Christmas: the tree's lights twinkling in their colours, a glow round its
// star, and strings of lights across the square (update(t) twinkles them).
export function nativityLights() {
  const group = new THREE.Group(), mats = [];
  const glow = (color, strength, extra = {}) => {
    const m = new THREE.MeshBasicMaterial({ color, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide, ...extra });
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
  const Y = 0.2, F = NAT.front;

  // the front and the gable end over it, gold, brightest low down
  add(shade(new THREE.PlaneGeometry(11.8, 7.2, 1, 6).translate(0, 3.6, 0), (x, y) => 0.25 + 0.75 * Math.pow(1 - y / 7.2, 1.3)), glow('#ffc874', 0.5), 0, Y, F + 0.04);
  const gableEnd = new THREE.Shape([[-2.8, 0], [2.8, 0], [2.8, 2.2], [0, 4.4], [-2.8, 2.2]].map(([x, y]) => new THREE.Vector2(x, y)));
  add(shade(new THREE.ShapeGeometry(gableEnd), (x, y) => 0.5 * (1 - y / 4.4)), glow('#ffc874', 0.4), 0, Y + 7.4, 1.34);
  for (const [x, w, h] of [[-5.0, 1.3, 5.2], [-2.3, 1.2, 4.4], [2.3, 1.2, 4.4]]) add(shade(new THREE.BoxGeometry(w + 0.08, h, 1.28).translate(0, h / 2, 0), (px, py) => 0.3 + 0.7 * (1 - py / h)), glow('#ffc874', 0.4), x, Y, F + 0.6);
  // the bell tower and the minaret
  const [tx, tz] = NAT.tower, [mx, mz] = NAT.minaret;
  add(shade(new THREE.BoxGeometry(3.35, 10, 3.35).translate(0, 5, 0), (x, y) => 0.2 + 0.8 * Math.pow(1 - y / 10, 1.4)), glow('#ffd08a', 0.38), tx, Y, tz);
  add(shade(new THREE.BoxGeometry(3.1, 2.9, 3.1).translate(0, 1.45, 0), () => 0.8), glow('#ffcf70', 0.3), tx, Y + 10.3, tz);
  add(shade(new THREE.CylinderGeometry(0.7, 0.7, 6.6, 8, 4, true).translate(0, 3.3, 0), (x, y) => 0.3 + 0.7 * (1 - y / 6.6)), glow('#ffd08a', 0.35), mx, Y + 6.65, mz);
  for (const [y, r] of [[13.45, 1.08], [15.3, 0.55]]) add(new THREE.TorusGeometry(r, 0.08, 6, 24).rotateX(Math.PI / 2), glow('#3cf08a', 0.95, { vertexColors: false }), mx, Y + y, mz);
  // warm pools on the square
  const pool = (r) => shade(new THREE.CircleGeometry(r, 24).rotateX(-Math.PI / 2), (x, y, z, i) => (i === 0 ? 1 : 0));
  add(pool(4.2), glow('#ffc070', 0.5), 0, Y + 0.06, F + 1.6);
  for (const x of NAT.lamps) add(pool(2.6), glow('#ffc070', 0.4), x, Y + 0.06, 7.9);
  add(pool(3.6), glow('#ffcf80', 0.35), 6.2, Y + 0.06, 5.6);
  // the star on the tree: a glow round it
  const [cx, cz] = NAT.tree, T = NAT.tiers, top = Y + T[3][1] + T[3][2];
  add(shade(new THREE.SphereGeometry(2.4, 18, 10), (x, y, z) => Math.max(0, 1 - Math.hypot(x, y, z) / 2.4) ** 2), glow('#ffd860', 0.9, { side: THREE.BackSide }), cx, top + 0.45, cz);

  // the little lights: on the tree (spiralling up its cones) and on strings across the square
  const dots = [], TREE_COLORS = ['#fff1c8', '#ff4a4a', '#ffd04a', '#4aa8ff', '#5cff8a'];
  for (const [r, y, h] of T) {
    const n = Math.round(r * 18);
    for (let i = 0; i < n; i++) {
      const f = i / n, a = f * Math.PI * 2 * 3.3 + y, rr = r * (1 - f * 0.92) + 0.1;
      dots.push({ x: cx + Math.cos(a) * rr, y: Y + y + f * h * 0.95, z: cz + Math.sin(a) * rr, c: TREE_COLORS[i % TREE_COLORS.length], s: 2.2 + (i % 5) * 0.7, b: i * 1.7 });
    }
  }
  const strands = [[-5.4, -12.5], [-2.6, -1.9], [2.6, 1.9], [5.4, 12.5], [-5.4, -1.9], [5.4, 1.9]];
  for (const [x0, x1] of strands) {
    const a = new THREE.Vector3(x0, Y + 7.3, F + 0.1), b = new THREE.Vector3(x1, Y + 3.3, 7.9);
    for (let i = 1; i < 18; i++) {
      const t = i / 18, p = a.clone().lerp(b, t);
      p.y -= Math.sin(t * Math.PI) * 0.9; // the string sags
      dots.push({ x: p.x, y: p.y, z: p.z, c: i % 3 ? '#ffe3a0' : '#ffb86b', s: 0.9 + (i % 4) * 0.25, b: i * 2.3 + x0 });
    }
  }
  const N = dots.length, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), base = [];
  dots.forEach((d, i) => { pos.set([d.x, d.y, d.z], i * 3); const c = new THREE.Color(d.c); base.push(c); col.set([c.r, c.g, c.b], i * 3); });
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d'), gr = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, 64, 64);
  const pm = new THREE.PointsMaterial({ size: 0.75, map: new THREE.CanvasTexture(c), vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  mats.push([pm, 1]);
  const points = new THREE.Points(pg, pm);
  points.raycast = () => {};
  group.add(points);
  const update = (t) => {
    for (let i = 0; i < N; i++) {
      const d = dots[i], k = 0.35 + 0.65 * Math.max(0, Math.sin(t * d.s + d.b)) ** 0.6;
      col[i * 3] = base[i].r * k; col[i * 3 + 1] = base[i].g * k; col[i * 3 + 2] = base[i].b * k;
    }
    pg.attributes.color.needsUpdate = true;
  };
  update(0);
  return { group, mats, update };
}
nativity.lights = nativityLights;
