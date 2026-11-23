// «مدرج بصرى»: the Roman theatre of Bosra in the south of Syria (the user's
// ask, 2026-11-19: big, nicely lit, with ruins round it like the real one).
// It stands on its own in the border strip between Syria and Jordan, east of
// the sword's roundabout, like the real Bosra near the Nasib crossing. The
// site is 128 x 40 (x across, +z towards the visitor):
//  - the theatre of black basalt: the seats rising towards +z in three tiers,
//    the arcaded outer wall with the covered gallery on top, the orchestra, the
//    stage, and the two storeys of white marble columns of the stage front;
//  - round it the Ayyubid citadel: walls with battlements and square towers,
//    the gate tower in front flying the flag;
//  - west of it the colonnaded street through the monumental arch, the baths;
//  - east of it the four tall columns of the Nymphaeum, the cathedral's ruins,
//    the Omari Mosque, a row of columns; fallen drums and rubble everywhere.
import * as THREE from 'three';
import { GEO, put, box, cyl, taper, cone, ball, gable, arch, face, rng, shine, tree, BACK, RIGHT, LEFT } from './kit.js';
import { crowd, person, merlons } from './world.js';

const B1 = '#686462', B2 = '#716c69', B3 = '#7a7571', B4 = '#5d5957', TRIM = '#8a847e'; // basalt, weathered and warm in the sun
const MARBLE = '#ebe5d8', MARBLE2 = '#d8d0c2', SOIL = '#cdb98f', DRY = '#b9b07a', PAVE = '#7d7976';
const DARK = '#2a2626';                 // the shadow in arches and doors
const TORCH = shine('#ffb347', 3);      // the torches on the battlements
const Y = 0.2;
export const CZ = -6;                   // the centre of the orchestra
const R0 = 5.8, RUN = 0.72, RISE = 0.36, NROWS = 19, R = R0 + RUN * NROWS + 0.05; // the seats
const WALL_TOP = Y + RISE * NROWS + 0.45, GALLERY = WALL_TOP + 2.8;
const CIT = { x: 31, z: 17, t: 2.2, h: 9 };     // the citadel's walls: half-width, half-depth, thickness, height
const FRONT_H = 6;                               // the front wall, lower, so the seats show over it
export const TOWERS = [ // x, z, w, d, h
  [-CIT.x, -CIT.z, 6, 5, 13], [CIT.x, -CIT.z, 6, 5, 13], [-CIT.x, CIT.z, 6, 5, 11], [CIT.x, CIT.z, 6, 5, 11],
  [0, CIT.z, 9, 5, 11], [-15, CIT.z, 5, 5, 8.5], [15, CIT.z, 5, 5, 8.5], [-15, -CIT.z, 5, 5, 12], [15, -CIT.z, 5, 5, 12],
  [-CIT.x, 0, 5, 6, 12], [CIT.x, 0, 5, 6, 12],
];
export const LOWER_COLS = [-17.4, -13.8, -12.2, -8.6, -7.0, -3.4, -1.8, 1.8, 3.4, 7.0, 8.6, 12.2, 13.8, 17.4];
const FRONS_Z = CZ - 5.0;               // the face of the stage front
export const RUINS = [];                // the columns still standing whole (x, z, h), for the lights
export const TORCHES = [];              // where the torches burn (x, y, z)

const sectors = new Map();
// A flat ring between radii r0 and r1 over the half circle on the +z side, h high (y from 0).
function sector(r0, r1, h, seg = 30) {
  const key = [r0, r1, h, seg].join('/');
  if (!sectors.has(key)) {
    const s = new THREE.Shape();
    s.moveTo(r1, 0);
    s.absarc(0, 0, r1, 0, Math.PI, false);
    s.lineTo(-r0, 0);
    s.absarc(0, 0, r0, Math.PI, 0, true);
    s.lineTo(r1, 0);
    sectors.set(key, new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: seg }).rotateX(Math.PI / 2).translate(0, h, 0));
  }
  return sectors.get(key);
}
const outward = (a) => Math.atan2(Math.cos(a), Math.sin(a)); // the turn that makes a face look out along angle a

function column(g, x, y, z, h, { r = 0.38, c = MARBLE, cap = true } = {}) {
  box(g, c === MARBLE ? MARBLE2 : TRIM, x, y, z, r * 2.6, 0.45, r * 2.6);
  cyl(g, c, x, y + 0.45, z, r, h - 0.45 - (cap ? 0.6 : 0), 10);
  if (cap) taper(g, c === MARBLE ? MARBLE2 : TRIM, x, y + h - 0.6, z, r * 1.05, r * 1.6, 0.6, 8);
}
// A ruined column: whole, broken at some height, or just its base; some drums lie on the ground beside it.
function ruin(g, x, z, h, rand, { r = 0.42, c = B3 } = {}) {
  const s = rand();
  if (s < 0.5) { column(g, x, Y, z, h, { r, c }); RUINS.push([x, z, h]); }
  else if (s < 0.85) column(g, x, Y, z, 1.4 + rand() * (h * 0.5), { r, c, cap: false });
  else box(g, TRIM, x, Y, z, r * 2.6, 0.45, r * 2.6);
  if (rand() < 0.4) { const d = cyl(g, c, x + 1.2 + rand(), Y + r, z + (rand() - 0.5) * 2, r, 1.2 + rand(), 10); d.rotation.z = Math.PI / 2; d.rotation.y = rand() * 3; d.position.y = Y + r; }
}
function rubble(g, x0, x1, z0, z1, n, rand) {
  for (let i = 0; i < n; i++) {
    const s = 0.4 + rand() * 0.8;
    box(g, [B1, B2, B3, TRIM][i % 4], x0 + rand() * (x1 - x0), Y, z0 + rand() * (z1 - z0), s * 1.4, s * 0.6, s, rand() * 3);
  }
}

// ---------------------------------------------------------------- the theatre
function theatre(g, rand) {
  // the seats in three tiers, the walkways between them lighter
  for (let i = 0; i < NROWS; i++) {
    const walk = i === 7 || i === 14;
    put(g, sector(R0 + i * RUN, R0 + (i + 1) * RUN, RISE * (i + 1)), walk ? TRIM : [B2, B3][i % 2], 0, Y, CZ);
  }
  // the stairs between the wedges of seats
  for (const [i0, i1, at] of [[0, 7, [0.15, 0.32, 0.5, 0.68, 0.85]], [7, 14, [0.24, 0.41, 0.59, 0.76]], [14, NROWS, [0.2, 0.4, 0.6, 0.8]]]) {
    for (const t of at) for (let i = i0; i < i1; i++) {
      const a = t * Math.PI, rm = R0 + (i + 0.5) * RUN;
      box(g, '#8a8682', Math.cos(a) * rm, Y + RISE * (i + 1), CZ + Math.sin(a) * rm, 0.55, 0.03, RUN + 0.02, Math.atan2(Math.cos(a), Math.sin(a)));
    }
  }
  // the outer wall, in two storeys of arches, and the covered gallery round the top
  put(g, sector(R, R + 1.0, WALL_TOP - Y, 36), B1, 0, Y, CZ);
  for (let k = 0; k <= 20; k++) {
    const a = (k / 20) * Math.PI, f = face(g, Math.cos(a) * (R + 1.0), CZ + Math.sin(a) * (R + 1.0), outward(a), Y);
    if (k > 0 && k < 20) { arch(f, DARK, 0, 0.6, 0.02, 1.7, 3.2, 0.05); arch(f, DARK, 0, 4.6, 0.02, 1.4, 2.6, 0.05); }
    box(f, TRIM, 0, 3.95, 0.02, 3.2, 0.35, 0.12);
  }
  // what is left of the gallery round the top: its columns, some still standing, with a piece of beam here and there
  for (let k = 0; k <= 24; k++) { const a = (k / 24) * Math.PI, h = k % 3 === 1 ? 1.2 : 2.8; column(g, Math.cos(a) * (R + 0.45), WALL_TOP, CZ + Math.sin(a) * (R + 0.45), h, { r: 0.22, c: B3, cap: h > 2 }); }
  for (const k of [0, 6, 15, 21]) { const a = ((k + 1.5) / 24) * Math.PI; box(g, B4, Math.cos(a) * (R + 0.45), GALLERY - 0.3, CZ + Math.sin(a) * (R + 0.45), 0.6, 0.45, 2.6, outward(a) + Math.PI / 2); }
  put(g, sector(R - 0.2, R + 1.05, 0.06, 36), TRIM, 0, WALL_TOP, CZ);
  // the orchestra and the stage
  put(g, sector(0.01, R0, 0.05), '#8a8784', 0, Y, CZ);
  box(g, B1, 0, Y, CZ - 2.8, 34, 1.4, 4.4);
  box(g, TRIM, 0, Y + 1.4, CZ - 2.8, 34.2, 0.1, 4.5);
  const pf = face(g, 0, CZ - 0.6, 0, Y);
  for (let x = -15; x <= 15; x += 3.75) arch(pf, x % 7.5 === 0 ? DARK : B4, x, 0.1, 0.02, 1.3, 1.1, 0.05); // niches in the stage's front
  // the stage front: a basalt wall with three doors and two storeys of white columns
  box(g, B1, 0, Y, FRONS_Z - 1.2, 40, 17, 2.4);
  box(g, TRIM, 0, Y + 17, FRONS_Z - 1.2, 40.6, 0.5, 2.8);
  const ff = face(g, 0, FRONS_Z, 0, Y + 1.4);
  arch(ff, TRIM, 0, 0, 0.02, 4.0, 6.6, 0.06); arch(ff, DARK, 0, 0, 0.05, 3.2, 6.0, 0.06);       // the royal door
  for (const s of [-1, 1]) { arch(ff, TRIM, s * 10.4, 0, 0.02, 3.0, 5.4, 0.06); arch(ff, DARK, s * 10.4, 0, 0.05, 2.4, 5.0, 0.06); }
  for (const x of [-15.6, -5.2, 0, 5.2, 15.6]) arch(ff, DARK, x, 9.0, 0.03, 1.5, 3.4, 0.05);   // niches upstairs
  for (const x of LOWER_COLS) {
    column(g, x, Y + 1.4, FRONS_Z + 0.55, 7.0);
    column(g, x, Y + 9.0, FRONS_Z + 0.55, 5.7, { r: 0.32 });
  }
  for (const y of [Y + 8.4, Y + 14.7]) { box(g, MARBLE2, 0, y, FRONS_Z + 0.55, 37, 0.6, 1.3); box(g, MARBLE, 0, y + 0.6, FRONS_Z + 0.55, 37.4, 0.18, 1.45); }
  // the wings either side of the stage, with their doors
  for (const s of [-1, 1]) {
    box(g, B2, s * 23, Y, CZ - 4.5, 6, 15, 7);
    box(g, TRIM, s * 23, Y + 15, CZ - 4.5, 6.4, 0.4, 7.4);
    const wf = face(g, s * 23, CZ - 1.0, 0, Y);
    arch(wf, DARK, 0, 0, 0.02, 2.2, 4.2, 0.05);
    arch(wf, DARK, 0, 7.0, 0.02, 1.4, 2.6, 0.05);
  }
  // a festival on: musicians and dancers on the stage, people on the seats
  const S = Y + 1.5;
  for (const [x, i] of [[-3.0, 0], [-1.6, 1], [-0.2, 2], [1.2, 3], [2.6, 4], [4.0, 5]]) person(g, x, S, CZ - 1.6, i, 0.95, { clothes: ['#f4f1ea', '#1d1d22', '#c0392b'][i % 3] === '#c0392b' ? ['#c0392b'] : ['#f4f1ea', '#1d1d22'] });
  for (const x of [-9, -7.4, 7.4, 9]) person(g, x, S, CZ - 3.6, 2, 0.9, { clothes: ['#1d1d22'] });
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) box(g, '#1d1d22', s * 15.5, S + k * 1.2, CZ - 2.5, 1.1, 1.15, 0.9);
  for (let i = 1; i < NROWS; i += 1) {
    if (i === 7 || i === 14) continue;
    const rm = R0 + (i + 0.55) * RUN, step = 0.9 / rm;
    for (let a = 0.04 * Math.PI + rand() * step; a < 0.96 * Math.PI; a += step * (1.6 + rand() * 2.2)) {
      if (rand() < 0.55) continue;
      person(g, Math.cos(a) * rm, Y + RISE * (i + 1), CZ + Math.sin(a) * rm, Math.floor(rand() * 8), 0.62);
    }
  }
}

// ---------------------------------------------------------------- the Ayyubid citadel round it
function citadel(g) {
  box(g, PAVE, 0, Y, 0, CIT.x * 2, 0.04, CIT.z * 2);
  const walls = [[0, -CIT.z, CIT.x * 2, CIT.t, CIT.h], [0, CIT.z, CIT.x * 2, CIT.t, FRONT_H], [-CIT.x, 0, CIT.t, CIT.z * 2, CIT.h], [CIT.x, 0, CIT.t, CIT.z * 2, CIT.h]];
  for (const [x, z, w, d, h] of walls) {
    for (let k = 0; k < 4; k++) box(g, [B1, B2, B4, B2][k], x, Y + (h / 4) * k, z, w, h / 4, d);
    box(g, TRIM, x, Y + h, z, w + 0.2, 0.25, d + 0.2);
  }
  merlons(g, B2, -CIT.x, -CIT.z - CIT.t / 2 + 0.2, CIT.x, -CIT.z - CIT.t / 2 + 0.2, Y + CIT.h + 0.25, { gap: 1.1, h: 0.7, w: 0.6 });
  merlons(g, B2, -CIT.x, CIT.z + CIT.t / 2 - 0.2, CIT.x, CIT.z + CIT.t / 2 - 0.2, Y + FRONT_H + 0.25, { gap: 1.1, h: 0.7, w: 0.6 });
  for (const s of [-1, 1]) merlons(g, B2, s * (CIT.x + CIT.t / 2 - 0.2), -CIT.z, s * (CIT.x + CIT.t / 2 - 0.2), CIT.z, Y + CIT.h + 0.25, { gap: 1.1, h: 0.7, w: 0.6 });
  for (const [x, z, w, d, h] of TOWERS) {
    for (let k = 0; k < 5; k++) box(g, [B4, B1, B2, B1, B3][k], x, Y + (h / 5) * k, z, w, h / 5, d);
    box(g, TRIM, x, Y + h, z, w + 0.4, 0.35, d + 0.4);
    merlons(g, B2, x - w / 2, z + d / 2, x + w / 2, z + d / 2, Y + h + 0.35, { gap: 1.0, h: 0.8, w: 0.55 });
    merlons(g, B2, x - w / 2, z - d / 2, x + w / 2, z - d / 2, Y + h + 0.35, { gap: 1.0, h: 0.8, w: 0.55 });
    merlons(g, B2, x - w / 2, z - d / 2, x - w / 2, z + d / 2, Y + h + 0.35, { gap: 1.0, h: 0.8, w: 0.55 });
    merlons(g, B2, x + w / 2, z - d / 2, x + w / 2, z + d / 2, Y + h + 0.35, { gap: 1.0, h: 0.8, w: 0.55 });
    for (const [fx, fz, ry, half] of [[x, z + d / 2, 0, w], [x, z - d / 2, BACK, w], [x + w / 2, z, RIGHT, d], [x - w / 2, z, LEFT, d]]) {
      const f = face(g, fx, fz, ry, Y);
      for (const dx of half > 5.5 ? [-half / 4, half / 4] : [0]) for (const y of [h * 0.45, h * 0.75]) box(f, DARK, dx, y, 0.02, 0.22, 1.1, 0.06); // arrow slits
    }
    TORCHES.push([x + w / 2 - 0.4, Y + h + 1.15, z + d / 2 + 0.25], [x - w / 2 + 0.4, Y + h + 1.15, z + d / 2 + 0.25]);
  }
  // the gate in the front tower, its steps, and the torches along the front wall
  const gt = face(g, 0, CIT.z + 2.5, 0, Y);
  arch(gt, TRIM, 0, 0, 0.02, 4.0, 6.0, 0.08, 0, true);
  arch(gt, DARK, 0, 0, 0.06, 3.0, 5.4, 0.08, 0, true);
  for (let i = 0; i < 3; i++) box(g, TRIM, 0, Y + i * 0.15, CIT.z + 2.8 + (2 - i) * 0.3, 5 - i * 0.6, 0.15, 0.6);
  for (let x = -27; x <= 27; x += 6) if (Math.abs(x) > 5 && Math.abs(Math.abs(x) - 15) > 3) TORCHES.push([x, Y + FRONT_H + 1.15, CIT.z + CIT.t / 2 + 0.25]);
  for (const [x, y, z] of TORCHES) { box(g, '#2b2d33', x, y - 0.7, z, 0.12, 0.7, 0.12); box(g, TORCH, x, y, z, 0.3, 0.42, 0.3); }
  // the flag pole on the gate tower
  cyl(g, '#eef1f4', 3.2, Y + 11.35, CIT.z + 1.8, 0.1, 8.5, 8);
  ball(g, '#e0b84a', 3.2, Y + 19.9, CIT.z + 1.8, 0.2);
}

// ---------------------------------------------------------------- the ruins round it
function ruinsWest(g, rand) {
  const X = -48;
  box(g, PAVE, X, Y, 0, 8.4, 0.04, 39);                                         // the colonnaded street, north to south
  for (let z = -19; z <= 19; z += 0.9) box(g, '#6f6b68', X, Y + 0.04, z, 8.2, 0.02, 0.05);
  for (const sx of [-4.6, 4.6]) for (let z = -17.6; z <= 18; z += 3.2) if (Math.abs(z - 6) > 2.2) ruin(g, X + sx, z, 7.2, rand);
  for (const [z0, z1] of [[-17.6, -11.2], [11.2, 17.6]]) for (const sx of [-4.6, 4.6]) box(g, B3, X + sx, Y + 7.2, (z0 + z1) / 2, 1.1, 0.8, z1 - z0 + 1.0); // what is left of the beams
  // the monumental arch across the street: three openings, pilasters, a cornice
  const az = 6, aw = 13, ah = 11.5;
  for (const [x, w] of [[-5.6, 1.8], [-2.85, 1.3], [2.85, 1.3], [5.6, 1.8]]) box(g, B2, X + x, Y, az, w, ah, 3.4);
  box(g, B2, X, Y + 7.8, az, aw, ah - 7.8, 3.4);
  for (const s of [-1, 1]) box(g, B2, X + s * 3.85, Y + 5.0, az, 2.7, ah - 5.0, 3.4);
  box(g, TRIM, X, Y + ah, az, aw + 0.6, 0.5, 3.9);
  box(g, B1, X, Y + ah + 0.5, az, aw - 1.0, 1.2, 3.2);
  for (const zf of [az + 1.72, az - 1.72]) {
    const f = face(g, X, zf, zf > az ? 0 : BACK, Y);
    arch(f, TRIM, 0, 0, 0.02, 4.8, 8.0, 0.06); arch(f, DARK, 0, 0, 0.05, 4.3, 7.7, 0.04);
    for (const s of [-1, 1]) { arch(f, TRIM, s * 3.85, 0, 0.02, 2.6, 5.2, 0.06); arch(f, DARK, s * 3.85, 0, 0.05, 2.1, 4.9, 0.04); }
    for (const x of [-6.1, -1.75, 1.75, 6.1]) box(f, TRIM, x, 0, 0.12, 0.55, 9.5, 0.2);
  }
  // the baths: low walls of rooms, broken arches, a half dome
  for (const [x, z, w, d, h] of [[-60, -13, 7, 0.9, 4.2], [-60, -6, 7, 0.9, 3.0], [-63.3, -9.5, 0.9, 7.8, 3.6], [-56.7, -9.5, 0.9, 7.8, 2.4], [-60, 2, 7, 0.9, 2.2], [-63.3, 6.5, 0.9, 9, 1.8], [-60, 11, 7, 0.9, 3.4]]) box(g, B1, x, Y, z, w, h, d);
  for (const z of [-13.45, -5.55]) { const f = face(g, -60, z, z < -9 ? 0 : BACK, Y); arch(f, DARK, -1.5, 0, 0.02, 1.6, 2.6, 0.05); arch(f, DARK, 1.6, 0, 0.02, 1.6, 2.4, 0.05); }
  cyl(g, B2, -60, Y, 15.5, 2.6, 3.2, 14);
  put(g, GEO.halfBall, B1, -60, Y + 3.2, 15.5, 2.7, 1.8, 2.7);
  // house foundations, fallen drums and rubble between the street and the citadel
  for (const [x, z] of [[-38.5, -14], [-38.5, 10.5]]) for (const [dx, dz, w, d] of [[0, -2.5, 6, 0.6], [0, 2.5, 6, 0.6], [-3, 0, 0.6, 5.6], [3, 0, 0.6, 5.6]]) box(g, B1, x + dx, Y, z + dz, w, 0.9 + rand() * 0.8, d);
  for (const [x, z] of [[-37, -2], [-40, 3]]) ruin(g, x, z, 6.5, rand);
  rubble(g, -63, -34, -18.5, 18.5, 40, rand);
}
function ruinsEast(g, rand) {
  // the Nymphaeum: four tall Corinthian columns on their podium, a piece of the beam still on two of them
  box(g, B1, 48, Y, -6, 12, 1.3, 4.4);
  for (const x of [43.6, 46.5, 49.5, 52.4]) { column(g, x, Y + 1.3, -6, 12.5, { r: 0.6, c: '#cfc8bc' }); RUINS.push([x, -6, 13.8]); }
  box(g, '#c4bcae', 45.05, Y + 13.8, -6, 4.2, 1.0, 1.6);
  box(g, '#d4ccbf', 45.05, Y + 14.8, -6, 4.5, 0.3, 1.9);
  // the cathedral: a round ruin with a few arches still standing
  for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2, h = 1.2 + ((k * 7) % 5) * 0.45; box(g, B1, 42 + Math.cos(a) * 5.5, Y, 12 + Math.sin(a) * 5.5, 2.3, h, 0.9, -a + Math.PI / 2); }
  for (const a of [0.4, 1.3, 2.4, 3.6]) {
    const f = face(g, 42 + Math.cos(a) * 5.5, 12 + Math.sin(a) * 5.5, outward(a), Y);
    for (const s of [-1, 1]) box(f, B2, s * 1.1, 0, 0, 0.5, 4.2, 0.8);
    box(f, B2, 0, 4.2, 0, 2.7, 0.9, 0.8);
  }
  // the Omari Mosque: a basalt hall and its square minaret
  box(g, B2, 57, Y, 14, 11, 6.2, 6);
  box(g, TRIM, 57, Y + 6.2, 14, 11.3, 0.3, 6.3);
  const mf = face(g, 57, 17, 0, Y);
  for (const x of [-3.5, 0, 3.5]) arch(mf, DARK, x, 0, 0.02, 1.6, 3.4, 0.05, 0, true);
  box(g, B1, 61, Y, 10.2, 3.2, 14.5, 3.2);
  box(g, TRIM, 61, Y + 14.5, 10.2, 3.6, 0.4, 3.6);
  for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 2, f = face(g, 61 + Math.sin(a) * 1.6, 10.2 + Math.cos(a) * 1.6, a, Y); arch(f, DARK, 0, 11.6, 0.02, 1.0, 2.2, 0.05); }
  box(g, B2, 61, Y + 14.9, 10.2, 2.4, 1.6, 2.4);
  cone(g, B4, 61, Y + 16.5, 10.2, 1.4, 1.6);
  // a row of columns along the old street at the back
  for (let x = 35; x <= 64; x += 3.3) ruin(g, x, -16.5, 6.8, rand);
  for (let x = 36.6; x <= 63; x += 6.6) ruin(g, x, -18.6, 6.0, rand);
  rubble(g, 34, 63, -18.5, 18.5, 36, rand);
}

export function bosra(g) {
  const rand = rng(106); // Bosra became the capital of the Roman province of Arabia in 106
  RUINS.length = 0; TORCHES.length = 0;
  box(g, SOIL, 0, 0, 0, 128, 0.2, 40);
  for (let i = 0; i < 70; i++) box(g, DRY, -63 + rand() * 126, 0.2, -19 + rand() * 38, 1 + rand() * 3, 0.03, 0.8 + rand() * 2); // dry grass
  citadel(g);
  theatre(g, rand);
  ruinsWest(g, rand);
  ruinsEast(g, rand);
  for (const [x, z] of [[-34, -18], [-35, 18], [34.5, 18.2], [34, 3], [-62.5, -18]]) tree(face(g, 0, 0, 0, Y), x, z, 1.2, 'olive');
  crowd(g, 18, [-63, -33, -18, 18], rand, { y: Y, free: (x, z) => Math.abs(x + 48) < 3.5 || (x > -42 && x < -34) });
  crowd(g, 14, [34, 64, -14, 6], rand, { y: Y });
  crowd(g, 12, [-28, 28, 13.5, 15.4], rand, { y: Y, free: (x, z) => Math.hypot(x, z - CZ) > R + 1.6 });
  bosra.flag = { x: 3.3, y: Y + 19.9 - 0.5 - 3.75 * 0.6, z: CIT.z + 1.8, scale: 0.6 };
}
// The portrait of His Excellency President Ahmed al-Sharaa over the theatre (the
// user, 2026-11-20, with the picture; over Bosra, not on the mosque): a gold
// frame standing on the citadel's back wall behind the stage, facing the seats
// and the gate, three red stars of the flag over it, and the banner «الجمهورية
// العربية السورية» above. The picture, the name and the words are drawn by the
// city on the spots given in PRESIDENT.
const PGOLD = shine('#d4af37', 2.6), PGOLD2 = shine('#c9a032', 2.3), PSTAR = shine('#d62b2b', 2.8);
const PZ = -16.6, PW = 20, PH = 22, PB = 17.5; // high enough to stand clear over the stage front // frame centre z (on the back wall), picture size, bottom of the frame
// Since 2026-11-21 two portraits of one size stand side by side under the banner:
// the president's on the left (seen from the seats), al-Sarout's on the right.
const PX = 12.4;
export const PRESIDENT = {
  x: -PX, y: PB + 1.0 + PH / 2, w: PW, h: PH, z: PZ + 0.42,
  plaque: { dy: -(PH / 2) + 2.1, w: 16, h: 2.4, text: 'فخامة الرئيس أحمد الشرع' }, // across the foot of the picture (below it the stage front would hide it)
  banner: { x: 0, y: PB + PH + 9.5, w: 48, h: 5.6, text: 'الجمهورية العربية السورية' },
};
const starGeo = (() => {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.42 : 1;
    if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r); else s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  return new THREE.ExtrudeGeometry(s, { depth: 0.25, bevelEnabled: false });
})();
// A portrait's gold frame on its plinth on the wall, green inside as the flag.
function goldFrame(g, x, cy, W, H) {
  box(g, B2, x, Y + 8, PZ - 1.2, W + 3.4, PB - Y - 8, 2.6);                               // the plinth on the wall
  box(g, PGOLD2, x, PB - 0.5, PZ - 0.3, W + 3.8, 0.5, 3.0);
  box(g, '#1c2a22', x, PB, PZ - 0.5, W + 2.8, H + 2.4, 0.6);                               // the back
  for (const [dx, dy, w, h] of [[0, -H / 2 - 0.6, W + 2.6, 1.2], [0, H / 2 - 0.6, W + 2.6, 1.2], [-W / 2 - 0.6, -H / 2, 1.2, H], [W / 2 + 0.6, -H / 2, 1.2, H]]) {
    box(g, PGOLD, x + dx, cy + dy, PZ, w, h, 0.9);                                         // the gold frame
  }
  for (const [dx, dy, w, h] of [[0, -H / 2 - 0.05, W + 0.6, 0.35], [0, H / 2 - 0.3, W + 0.6, 0.35], [-W / 2 - 0.15, -H / 2, 0.35, H], [W / 2 + 0.15, -H / 2, 0.35, H]]) {
    box(g, '#0f5132', x + dx, cy + dy, PZ + 0.1, w, h, 0.7);                               // green inside it, as the flag
  }
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) ball(g, PGOLD2, x + sx * (W / 2 + 0.6), cy + sy * (H / 2 + 0.6), PZ + 0.5, 1.0);
  for (const sy of [-1, 1]) ball(g, PGOLD2, x, cy + sy * (H / 2 + 0.6), PZ + 0.5, 0.75);
  for (const sx of [-1, 1]) ball(g, PGOLD2, x + sx * (W / 2 + 0.6), cy, PZ + 0.5, 0.75);
}
export function presidentFrame(g) {
  const { x } = PRESIDENT, cy = PRESIDENT.y, W = PW, H = PH;
  goldFrame(g, x, cy, W, H);
  // the crest: a gold arc with the flag's three red stars
  box(g, PGOLD, x, cy + H / 2 + 1.2, PZ, 9, 0.9, 0.8);
  for (const dx of [-3, 0, 3]) put(g, starGeo, PSTAR, x + dx, cy + H / 2 + 3.4, PZ + 0.1, 1.15, 1.15, 1);
  // the name plate under the picture
  box(g, PGOLD, x, cy + PRESIDENT.plaque.dy - PRESIDENT.plaque.h / 2 - 0.25, PZ + 0.2, PRESIDENT.plaque.w + 0.5, PRESIDENT.plaque.h + 0.5, 0.5);
  // the banner above, on two gold posts from the wall
  const B = PRESIDENT.banner;
  for (const s of [-1, 1]) {
    cyl(g, PGOLD2, s * (B.w / 2 + 0.6), Y + 9, PZ - 1.4, 0.35, B.y - Y - 9 + B.h / 2, 10);
    ball(g, PGOLD, s * (B.w / 2 + 0.6), B.y + B.h / 2 + 0.4, PZ - 1.4, 0.8);
    put(g, starGeo, PSTAR, s * (B.w / 2 - 2.6), B.y + B.h / 2 + 1.6, PZ - 1.0, 1.0, 1.0, 1);
  }
  box(g, PGOLD, 0, B.y - B.h / 2 - 0.5, PZ - 1.1, B.w + 1.2, B.h + 1.0, 0.5);
}
// The portrait of the martyr hero Abdul Basit al-Sarout beside the president's
// (the user, 2026-11-21, with the picture; "as big as the president's"): the same
// gold frame on the same wall, on the seats' right, a red heart on top instead of
// the stars: a tap on it gives him a heart (city.js).
const SW = PW, SH = PH, SX = PX;
const heartGeo = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, -1);
  s.bezierCurveTo(-0.3, -0.7, -1.1, -0.2, -1.1, 0.35);
  s.bezierCurveTo(-1.1, 0.85, -0.55, 1.05, 0, 0.6);
  s.bezierCurveTo(0.55, 1.05, 1.1, 0.85, 1.1, 0.35);
  s.bezierCurveTo(1.1, -0.2, 0.3, -0.7, 0, -1);
  return new THREE.ExtrudeGeometry(s, { depth: 0.35, bevelEnabled: false, curveSegments: 10 });
})();
export const SAROUT = {
  x: SX, y: PB + 1.0 + SH / 2, w: SW, h: SH, z: PZ + 0.42,
  plaque: { dy: -(SH / 2) + 2.6, w: 16, h: 3.6, lines: ['الشهيد البطل', 'عبد الباسط الساروت'] },
  heart: { dy: SH / 2 + 3.3 }, // under the banner
};
export function saroutFrame(g) {
  const { x } = SAROUT, cy = SAROUT.y, W = SW, H = SH;
  goldFrame(g, x, cy, W, H);
  // the crest: a gold bar with a red heart
  box(g, PGOLD, x, cy + H / 2 + 1.2, PZ, 9, 0.9, 0.8);
  put(g, heartGeo, PSTAR, x, cy + SAROUT.heart.dy, PZ + 0.1, 1.7, 1.7, 1);
  // the name plate under the picture
  const Q = SAROUT.plaque;
  box(g, PGOLD, x, cy + Q.dy - Q.h / 2 - 0.25, PZ + 0.2, Q.w + 0.5, Q.h + 0.5, 0.5);
}
bosra.label = 'مدرج بصرى';
bosra.top = 22;
bosra.size = [128, 40];
bosra.floodlight = { color: '#ffc978', at: [0, 12, 14] };

// ---------------------------------------------------------------- by night
// The theatre lit gold like the festival nights: the rows of seats glowing
// warm, brightest low down; the white columns of the stage front washed up in
// gold, the doors and niches glowing amber and violet; a warm pool on the
// stage and spots on the musicians; the citadel washed amber with the torches
// flickering on its battlements and a cool blue on its towers; every standing
// column of the ruins lit from its foot; and four beams from the corner towers
// slowly sweeping the sky (update(t)).
export function bosraLights() {
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
  const up = new THREE.Vector3(0, 1, 0);
  const cone = (len, r0, r1) => { const geo = new THREE.CylinderGeometry(r1, r0, len, 12, 4, true).translate(0, len / 2, 0); return shade(geo, (x, y) => Math.pow(1 - y / len, 1.4)); };
  const pool = (r) => shade(new THREE.CircleGeometry(r, 24).rotateX(-Math.PI / 2), (x, y, z, i) => (i === 0 ? 1 : 0));
  const blob = (r) => shade(new THREE.SphereGeometry(r, 12, 8), (x, y, z) => Math.max(0, 1 - Math.hypot(x, y, z) / r) ** 2);

  // the seats: each row's top glowing gold, brighter low down
  const seats = glow('#ffb860', 0.5);
  for (let i = 0; i < NROWS; i++) {
    const k = Math.pow(1 - i / NROWS, 0.7) * 0.85 + 0.15;
    add(shade(new THREE.RingGeometry(R0 + i * RUN, R0 + (i + 1) * RUN, 30, 1, 0, Math.PI).rotateX(Math.PI / 2), () => k), seats, 0, Y + RISE * (i + 1) + 0.02, CZ);
  }
  // the outer wall's arches washed from below, and the gallery's columns
  add(shade(new THREE.CylinderGeometry(R + 1.08, R + 1.08, WALL_TOP - Y, 36, 4, true, -Math.PI / 2, Math.PI).translate(0, (WALL_TOP - Y) / 2, 0), (x, y) => 0.15 + 0.6 * (0.5 - y / (WALL_TOP - Y))), glow('#ffb860', 0.45), 0, Y, CZ);
  // the stage front: gold up each white column, amber in the doors, violet in the niches, a warm wash over it all
  const gold = glow('#ffd27a', 0.55);
  for (const x of LOWER_COLS) { add(cone(7.2, 0.9, 0.35), gold, x, Y + 1.4, FRONS_Z + 0.55); add(cone(5.8, 0.7, 0.3), gold, x, Y + 9.0, FRONS_Z + 0.55); }
  add(shade(new THREE.PlaneGeometry(40, 17, 1, 6).translate(0, 8.5, 0), (x, y) => 0.3 + 0.7 * (1 - y / 17)), glow('#ffc070', 0.32), 0, Y, FRONS_Z + 0.06);
  for (const [x, w, h] of [[0, 3.2, 6.0], [-10.4, 2.4, 5.0], [10.4, 2.4, 5.0]]) add(shade(new THREE.PlaneGeometry(w, h).translate(0, h / 2, 0), () => 0.9), glow('#ff9a3c', 0.6), x, Y + 1.4, FRONS_Z + 0.12);
  for (const x of [-15.6, -5.2, 0, 5.2, 15.6]) add(shade(new THREE.PlaneGeometry(1.5, 3.4).translate(0, 1.7, 0), () => 0.9), glow('#b070ff', 0.75), x, Y + 10.4, FRONS_Z + 0.1);
  // the stage: a warm pool, and spots on the musicians from the gallery
  add(pool(9), glow('#ffcf80', 0.45), 0, Y + 1.52, CZ - 2.4);
  for (const [x, c] of [[-1.5, '#fff1c8'], [1.5, '#ffd0f0']]) {
    const a = new THREE.Vector3(x * 6, GALLERY, CZ + R), b = new THREE.Vector3(x, Y + 1.5, CZ - 1.6), len = a.distanceTo(b);
    const m = add(shade(new THREE.CylinderGeometry(1.5, 0.15, len, 14, 4, true).translate(0, len / 2, 0), (px, y) => 0.25 + 0.5 * (y / len)), glow(c, 0.22), a.x, a.y, a.z);
    m.quaternion.setFromUnitVectors(up, b.clone().sub(a).normalize());
  }
  // the citadel: amber washed up the walls, blue on the towers, the torches
  for (const [x, z, w, d, h] of [[0, -CIT.z - CIT.t / 2 - 0.05, CIT.x * 2, 0, CIT.h], [0, CIT.z + CIT.t / 2 + 0.05, CIT.x * 2, 0, FRONT_H], [-CIT.x - CIT.t / 2 - 0.05, 0, 0, CIT.z * 2, CIT.h], [CIT.x + CIT.t / 2 + 0.05, 0, 0, CIT.z * 2, CIT.h]]) {
    const len = w || d, geo = shade(new THREE.PlaneGeometry(len, h, 1, 4).translate(0, h / 2, 0), (px, y) => 0.15 + 0.85 * Math.pow(1 - y / h, 1.5));
    if (d) geo.rotateY(Math.PI / 2);
    add(geo, glow('#ffa850', 0.42), x, Y, z);
  }
  const blue = glow('#6fb0ff', 0.18);
  for (const [x, z, w, d, h] of TOWERS) add(shade(new THREE.BoxGeometry(w + 0.1, h, d + 0.1).translate(0, h / 2, 0), (px, y) => 0.15 + 0.85 * Math.pow(y / h, 1.2)), blue, x, Y, z);
  const flames = [];
  const flameMat = glow('#ffa040', 0.95, { side: THREE.BackSide });
  for (const [x, y, z] of TORCHES) { flames.push(add(blob(1.3), flameMat, x, y + 0.25, z)); add(pool(2.2), glow('#ff9a40', 0.28), x, Y + 0.06, z + 1.2); }
  // the ruins: every standing column lit from its foot, the arch washed gold, the Nymphaeum brightest
  const ruinGold = glow('#ffc670', 0.5);
  for (const [x, z, h] of RUINS) { add(cone(h + 0.4, 1.0, 0.4), ruinGold, x, Y, z); add(pool(1.8), ruinGold, x, Y + 0.05, z); }
  add(shade(new THREE.PlaneGeometry(13, 11.5, 1, 4).translate(0, 5.75, 0), (x, y) => 0.25 + 0.75 * (1 - y / 11.5)), glow('#ffc070', 0.45), -48, Y, 6 + 1.78);
  add(shade(new THREE.PlaneGeometry(13, 11.5, 1, 4).translate(0, 5.75, 0), (x, y) => 0.25 + 0.75 * (1 - y / 11.5)), glow('#ffc070', 0.35), -48, Y, 6 - 1.78);
  add(shade(new THREE.BoxGeometry(3.4, 14.5, 3.4).translate(0, 7.25, 0), (x, y) => 0.2 + 0.8 * (1 - y / 14.5)), glow('#ffd08a', 0.3), 61, Y, 10.2);
  add(new THREE.TorusGeometry(1.9, 0.08, 6, 24).rotateX(Math.PI / 2), glow('#3cf08a', 0.9, { vertexColors: false }), 61, Y + 14.7, 10.2);
  // four beams from the corner towers, slowly sweeping the sky over the theatre
  const beams = [];
  for (const [x, z, , , h] of TOWERS.slice(0, 4)) {
    const len = 70, m = add(shade(new THREE.CylinderGeometry(3.2, 0.4, len, 16, 8, true).translate(0, len / 2, 0), (px, y) => Math.pow(1 - y / len, 1.6)), glow('#ffe3a8', 0.16), x, Y + h + 0.6, z);
    beams.push({ m, x, z, phase: (x > 0 ? 1 : 0) + (z > 0 ? 2 : 0) });
  }
  const update = (t) => {
    for (const b of beams) {
      const a = 0.35 * Math.sin(t * 0.25 + b.phase * 1.6), dir = new THREE.Vector3(-b.x * 0.55 + Math.sin(a) * 18, 60, -b.z * 0.6 + Math.cos(a) * 10 + 4).normalize();
      b.m.quaternion.setFromUnitVectors(up, dir);
    }
    flames.forEach((f, i) => f.scale.setScalar(0.8 + 0.25 * Math.abs(Math.sin(t * 9 + i * 1.7)) + 0.1 * Math.sin(t * 23 + i)));
  };
  update(0);
  return { group, mats, update };
}
bosra.lights = bosraLights;
