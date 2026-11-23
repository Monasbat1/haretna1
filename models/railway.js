// «سكة حديد الحجاز»: a railway on a stone viaduct over the streets, joining
// Damascus to Amman, Beirut and Baghdad without touching a house. Stone
// portals stand at the street crossings (their legs in the middle of the
// cross street, between its lanes), arched spans carry the deck from one to
// the next, and steam trains in the old Hejaz colours run on it.
// «محطة الحجاز» is the station in Damascus, on a block of its own; small
// stations stand at the end of each line.
import * as THREE from 'three';
import { C, box, cyl, put, face, win, door, shine, ablaq, gable, ball, RIGHT, LEFT, BACK } from './kit.js';

export const DECK = 9;               // top of the deck: the ballast lies on it
export const RAIL = DECK + 0.5;      // top of the rails: the trains stand here
export const PLATFORM = DECK + 1.25; // top of a platform
const DW = 4.6;                      // the deck's width
const PIER_TOP = DECK - 2.6;         // where the spans spring from the portals
const STONE = '#e8dcc3', STONE2 = '#d3c3a1', CORNICE = '#c9b58e';
const BALLAST = '#7b7268', SLEEPER = '#5a4535', STEEL = '#a9afb8';
const LANTERN = shine('#ffdc8f', 3);
const GLASS = shine('#ffd88a', 1);   // a coach's window, lit at night

// --------------------------------------------------------------- the viaduct
const spanCache = new Map();
function spanGeo(L) { // one arched span, L long (along x), its top at DECK
  const key = L.toFixed(2);
  if (!spanCache.has(key)) {
    const s = new THREE.Shape(), steps = 16;
    s.moveTo(0, DECK);
    s.lineTo(L, DECK);
    for (let i = 0; i <= steps; i++) {
      const u = L * (1 - i / steps), q = 2 * u / L - 1;
      s.lineTo(u, DECK - 1.0 - 1.6 * (1 - Math.sqrt(Math.max(0, 1 - q * q))));
    }
    spanCache.set(key, new THREE.ExtrudeGeometry(s, { depth: DW, bevelEnabled: false, curveSegments: 4 }).translate(0, 0, -DW / 2));
  }
  return spanCache.get(key);
}
const portalGeo = (() => { // a stone arch across the street, legs 1 m thick
  const W = 7.4, H = PIER_TOP, ow = 5.2, oh = 5.0, s = new THREE.Shape();
  s.moveTo(-W / 2, 0); s.lineTo(W / 2, 0); s.lineTo(W / 2, H); s.lineTo(-W / 2, H); s.lineTo(-W / 2, 0);
  const hole = new THREE.Path(), r = ow / 2, spring = oh - r;
  hole.moveTo(-r, 0); hole.lineTo(-r, spring); hole.absarc(0, spring, r, Math.PI, 0, true); hole.lineTo(r, 0); hole.lineTo(-r, 0);
  s.holes.push(hole);
  return new THREE.ExtrudeGeometry(s, { depth: 1.0, bevelEnabled: false, curveSegments: 10 }).rotateY(Math.PI / 2).translate(-0.5, 0, 0);
})();

// A straight run of viaduct from a to b ([x, z] on the ground), with a portal
// at each point of `posts` (distances from a). Built along local x, then turned.
export function viaduct(g, a, b, posts, { ends = [true, true] } = {}) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
  const seg = new THREE.Group();
  seg.position.set(a[0], 0, a[1]);
  seg.rotation.y = -Math.atan2(dz, dx);
  g.add(seg);
  const cuts = [0, ...posts.filter((p) => p > 0.5 && p < L - 0.5), L];
  for (let i = 0; i + 1 < cuts.length; i++) put(seg, spanGeo(cuts[i + 1] - cuts[i]), STONE, cuts[i], 0, 0);
  for (const [i, p] of cuts.entries()) {
    if ((i === 0 && !ends[0]) || (i === cuts.length - 1 && !ends[1])) continue;
    put(seg, portalGeo, STONE2, p, 0, 0);
    box(seg, CORNICE, p, PIER_TOP - 0.35, 0, 1.3, 0.35, 7.8);        // the impost under the spans
    for (const v of [-3.2, 3.2]) box(seg, STONE2, p, 0, v, 1.4, 0.5, 1.4); // the legs' plinths
    for (const v of [-DW / 2 + 0.15, DW / 2 - 0.15]) {                // a lantern on each parapet
      box(seg, C.iron, p, DECK + 0.7, v, 0.12, 1.5, 0.12);
      box(seg, LANTERN, p, DECK + 2.2, v, 0.34, 0.42, 0.34);
      box(seg, C.iron, p, DECK + 2.62, v, 0.44, 0.1, 0.44);
    }
  }
  box(seg, CORNICE, L / 2, DECK - 0.35, 0, L, 0.3, DW + 0.3);             // the cornice under the parapets
  for (const v of [-1, 1]) box(seg, STONE2, L / 2, DECK, v * (DW / 2 - 0.15), L, 0.7, 0.3); // parapets
  box(seg, BALLAST, L / 2, DECK, 0, L, 0.22, 2.9);
  for (let u = 0.45; u < L; u += 0.9) box(seg, SLEEPER, u, DECK + 0.22, 0, 0.26, 0.12, 2.3);
  for (const v of [-0.72, 0.72]) box(seg, STEEL, L / 2, DECK + 0.34, v, L, 0.16, 0.1);
  return seg;
}

// A buffer stop at the end of a line, local x pointing out of the line.
export function bufferStop(g, x, z, ry) {
  const f = face(g, x, z, ry);
  box(f, '#b8322a', 0, DECK + 0.3, 0, 2.6, 0.9, 0.5);
  for (const v of [-0.72, 0.72]) box(f, '#2b2d33', v, DECK + 0.6, 0.35, 0.35, 0.35, 0.4);
  box(f, LANTERN, 0, DECK + 1.25, 0, 0.3, 0.3, 0.3);
}

// A platform on one side of the deck (local +z), from u0 to u1 along local x,
// with its canopy. Built in a group at `at`, turned by ry.
export function platform(g, at, ry, u0, u1, { side = 1, canopy = '#2f6b4f', w = 3.4 } = {}) {
  const f = new THREE.Group();
  f.position.set(at[0], 0, at[1]);
  f.rotation.y = ry;
  g.add(f);
  const L = u1 - u0, c = (u0 + u1) / 2, z = side * (DW / 2 + w / 2 - 0.9);
  box(f, STONE, c, PLATFORM - 1.6, z, L, 1.6, w);                 // the platform
  box(f, '#f2e7cf', c, PLATFORM, z, L, 0.06, w);                  // its paving
  box(f, '#f0c419', c, PLATFORM + 0.01, side * (DW / 2 - 0.55), L, 0.03, 0.22); // the yellow line
  box(f, CORNICE, c, PLATFORM - 2.0, z, L, 0.4, w + 0.2);
  const zp = z + side * (w / 2 - 0.45);
  for (let u = u0 + 1.5; u < u1 - 1; u += 4.2) {                 // iron posts and lamps
    box(f, C.iron, u, PLATFORM, zp, 0.16, 3.1, 0.16);
    box(f, LANTERN, u, PLATFORM + 2.4, zp - side * 0.3, 0.26, 0.32, 0.26);
  }
  box(f, canopy, c, PLATFORM + 3.1, z - side * 0.6, L + 0.6, 0.18, w + 1.6); // the canopy
  gable(f, canopy, c, PLATFORM + 3.28, z - side * 0.6, L + 0.6, 0.5, w + 1.6);
  box(f, '#f2e7cf', c, PLATFORM + 2.92, z - side * 0.6 - side * (w / 2 + 0.75), L + 0.6, 0.22, 0.08); // its fringe
  for (let u = u0 + 3; u < u1 - 2; u += 6) {                      // benches
    box(f, C.woodLight, u, PLATFORM + 0.45, zp - side * 0.4, 1.8, 0.1, 0.5);
    box(f, C.woodLight, u, PLATFORM + 0.55, zp, 1.8, 0.5, 0.08);
  }
}

// --------------------------------------------------------------- the station
// «محطة الحجاز» on its block (29 x 17, centre at 0, 0). The line to Beirut and
// Baghdad passes along the north street (z = -11.5), the line from Amman ends
// in the west street (x = -17.5); the platforms reach over the block's edges.
const BX = 14.5, BZ = 8.5;
export function hejazStation(g) {
  // the forecourt
  box(g, '#dcd3c0', 0, -0.25, 0, BX * 2, 0.27, BZ * 2);
  for (let i = 0; i < 9; i++) box(g, i % 2 ? '#cfc4ae' : '#e6ddca', -12 + i * 3, 0, 7.4, 3, 0.03, 2.2);

  // the building: 24 m long, 11 deep, two floors up to the platforms' level
  const X0 = -10.5, X1 = 13.6, Z0 = -6.2, Z1 = 4.6, H = PLATFORM;
  const cx = (X0 + X1) / 2, w = X1 - X0, d = Z1 - Z0, cz = (Z0 + Z1) / 2;
  ablaq(g, cx, 0, cz, w, 1.2, d, 4, [C.basalt, STONE, C.basalt, STONE]);
  box(g, STONE, cx, 1.2, cz, w, H - 1.2, d);
  box(g, CORNICE, cx, 5.2, cz, w + 0.3, 0.35, d + 0.3);              // the band between the floors
  box(g, CORNICE, cx, H - 0.1, cz, w + 0.6, 0.5, d + 0.6);           // the cornice
  for (let x = X0 + 0.6; x < X1; x += 1.2) box(g, STONE2, x, H + 0.4, Z1 + 0.15, 0.5, 0.6, 0.3); // the parapet
  box(g, STONE2, cx, H + 0.4, Z1 + 0.15, w, 0.2, 0.3);
  box(g, '#cdbfa3', cx, H + 0.05, cz, w - 0.4, 0.3, d - 0.4);         // the roof terrace

  // the central bay: three tall arches, the clock above, a red tiled roof
  const BW2 = 8.4, bz = Z1 + 0.8;
  box(g, STONE, cx, 0, bz - 0.5, BW2, H + 2.4, 1.6);
  ablaq(g, cx, 0, bz - 0.5, BW2 + 0.05, 1.2, 1.65, 4, [C.basalt, STONE, C.basalt, STONE]);
  box(g, CORNICE, cx, H + 2.3, bz - 0.5, BW2 + 0.6, 0.45, 2.1);
  gable(g, C.tile, cx, H + 2.75, bz - 0.9, BW2 + 0.4, 1.4, 3.2);
  const front = face(g, cx, bz + 0.3, 0);
  for (const x of [-2.6, 0, 2.6]) {                                   // the entrance arches
    door(front, x, 2.0, 4.2, '#5a3620', { arched: true, frame: STONE2, knob: null });
    win(front, x, 5.9, 1.3, 2.8, { arched: true, frame: STONE2, glass: C.glass });
  }
  box(front, '#1f5a46', 0, 9.3, 0.05, 5.8, 0.9, 0.08);                // the green sign board
  box(front, '#f2d27a', 0, 9.52, 0.1, 4.6, 0.45, 0.04);               // its golden letters (a band)
  cyl(g, '#f7f3e8', cx, H + 1.2, bz + 0.35, 0.75, 0.12);             // the clock (a white face)
  g.children[g.children.length - 1].rotation.x = Math.PI / 2;
  box(g, '#2b2d33', cx, H + 1.15, bz + 0.5, 0.06, 0.55, 0.04);
  box(g, '#2b2d33', cx + 0.15, H + 1.15, bz + 0.5, 0.36, 0.06, 0.04);

  // the wings: paired arched windows on both floors
  const fr = face(g, 0, Z1, 0);
  for (const x of [-9, -6.8, -4.6, 9.4, 11.6]) {
    if (Math.abs(x - cx) < BW2 / 2 + 0.4) continue;
    win(fr, x, 1.7, 1.2, 2.5, { arched: true, frame: STONE2, shutters: '#2f6b4f' });
    win(fr, x, 6.1, 1.0, 2.2, { arched: true, frame: STONE2 });
  }
  const east = face(g, X1, cz, RIGHT);
  for (const x of [-3.4, 0, 3.4]) {
    win(east, x, 1.7, 1.2, 2.5, { arched: true, frame: STONE2, shutters: '#2f6b4f' });
    win(east, x, 6.1, 1.0, 2.2, { arched: true, frame: STONE2 });
  }
  const back = face(g, cx, Z0, BACK);
  for (let x = -10; x <= 10; x += 3.3) win(back, x, 6.1, 1.0, 2.2, { arched: true, frame: STONE2 });
  const west = face(g, X0, cz, LEFT);
  for (const x of [-3.4, 0, 3.4]) win(west, x, 1.7, 1.2, 2.5, { arched: true, frame: STONE2, shutters: '#2f6b4f' });

  // the platforms: along the north street (Beirut – Damascus – Baghdad) and the west street (from Amman)
  platform(g, [0, -11.5], 0, -BX, BX, { side: 1 });
  platform(g, [-17.5, 0], -Math.PI / 2, -6.0, BZ + 0.2, { side: -1 });
  // the old engine on show in the forecourt, as in front of the real station
  const show = new THREE.Group();
  show.position.set(-7.4, 0.35, 6.7);
  show.scale.setScalar(0.8);
  g.add(show);
  box(show, '#8a8f98', 0, -0.35, 0, 11, 0.35, 2.6);
  for (const v of [-0.72, 0.72]) box(show, STEEL, 0, 0, v, 11, 0.12, 0.1);
  loco(show, 0);
  // palms and lamps on the forecourt
  for (const x of [3, 9.5]) {
    box(g, '#8a6a4a', x, 0, 7.4, 0.35, 4.2, 0.35);
    for (let k = 0; k < 6; k++) {
      const m = box(g, '#3f8f5a', x, 4.1, 7.4, 0.35, 0.12, 2.4, (k * Math.PI) / 3);
      m.rotation.x = 0.35;
    }
  }
}
hejazStation.label = 'محطة الحجاز';
hejazStation.top = PLATFORM + 4.2;
hejazStation.floodlight = { color: '#ffd59a', at: [2, 8, 14] };

// --------------------------------------------------------------- the trains
// Every car is built along +x with its rails at y = 0 and its middle at x = 0.
function wheel(g, x, r, z, color = '#b8322a') {
  const m = cyl(g, color, x, r, z, r, 0.18, 12);
  m.rotation.x = Math.PI / 2;
  m.position.z = z - 0.09;
  return m;
}
function along(g, color, x, y, z, r, len, seg = 14) { // a cylinder lying along x, from x back to x - len
  const m = cyl(g, color, x, y, z, r, len, seg);
  m.rotation.z = Math.PI / 2;
  return m;
}
const BLACK = '#22242a', RED = '#b8322a', BRASS = shine('#d6ad4e', 0.2);
export function loco(g, x0 = 0, dir = 1) { // a Hejaz steam engine, 9.6 long, chimney towards +x (dir = -1: towards -x)
  const f = new THREE.Group();
  f.position.x = x0;
  f.rotation.y = dir > 0 ? 0 : Math.PI;
  g.add(f);
  box(f, BLACK, 0, 0.75, 0, 9.4, 0.45, 2.3);
  box(f, RED, 0, 0.8, 1.17, 9.4, 0.25, 0.04);
  box(f, RED, 0, 0.8, -1.17, 9.4, 0.25, 0.04);
  for (const x of [-2.4, -0.7, 1.0]) for (const z of [-1.0, 1.0]) wheel(f, x, 0.78, z);
  for (const x of [3.3, -4.0]) for (const z of [-1.0, 1.0]) wheel(f, x, 0.45, z);
  box(f, '#3a3d44', -0.7, 0.72, 1.12, 3.6, 0.1, 0.05);              // coupling rods
  box(f, '#3a3d44', -0.7, 0.72, -1.22, 3.6, 0.1, 0.05);
  along(f, BLACK, 4.2, 2.15, 0, 0.88, 5.3);                         // the boiler
  along(f, '#2e3036', 4.25, 2.15, 0, 0.92, 0.9);                    // the smokebox
  for (const x of [2.6, 0.9]) along(f, BRASS, x, 2.15, 0, 0.9, 0.1); // brass bands
  cyl(f, BLACK, 3.6, 2.6, 0, 0.3, 1.3);                             // the chimney
  cyl(f, BLACK, 3.6, 3.8, 0, 0.42, 0.22);
  cyl(f, BRASS, 1.6, 2.8, 0, 0.36, 0.55);                           // the steam dome
  ball(f, BRASS, 1.6, 3.35, 0, 0.36, 0.6);
  box(f, BLACK, -0.3, 0.98, 0, 2.6, 1.6, 2.2);                      // the side tanks
  box(f, BLACK, -2.7, 0.98, 0, 2.6, 2.6, 2.5);                      // the cab
  box(f, GLASS, -2.1, 2.4, 1.26, 0.8, 0.7, 0.03);
  box(f, GLASS, -2.1, 2.4, -1.26, 0.8, 0.7, 0.03);
  box(f, RED, -2.7, 3.55, 0, 3.0, 0.16, 2.8);                       // the cab roof
  box(f, '#1b1b1d', -4.2, 0.98, 0, 0.9, 2.0, 2.3);                  // the coal bunker
  box(f, RED, 4.75, 0.55, 0, 0.3, 0.55, 2.6);                       // the buffer beam
  for (const z of [-0.9, 0.9]) box(f, '#3a3d44', 4.95, 0.68, z, 0.3, 0.3, 0.3);
  box(f, '#f6e6a8', 4.72, 2.95, 0, 0.18, 0.38, 0.42);                // the headlamp
  return f;
}
export function coach(g, x0 = 0, { lamp = false } = {}) { // 9.2 long; green below, cream above
  const f = new THREE.Group();
  f.position.x = x0;
  g.add(f);
  box(f, BLACK, 0, 0.55, 0, 8.6, 0.4, 2.2);
  for (const x of [-3.0, -2.0, 2.0, 3.0]) for (const z of [-1.0, 1.0]) wheel(f, x, 0.48, z, '#3a3d44');
  box(f, '#2e6a4e', 0, 0.95, 0, 9.0, 1.3, 2.7);
  box(f, '#efe2c2', 0, 2.25, 0, 9.0, 1.0, 2.7);
  box(f, '#2e6a4e', 0, 3.25, 0, 9.0, 0.12, 2.75);
  box(f, '#5d5f63', 0, 3.37, 0, 9.2, 0.22, 2.8);
  gable(f, '#6a6c70', 0, 3.59, 0, 9.2, 0.4, 2.8);
  for (let x = -3.3; x <= 3.4; x += 1.32) for (const z of [-1.36, 1.36]) box(f, GLASS, x, 2.3, z, 0.82, 0.78, 0.04);
  for (const z of [-1.36, 1.36]) box(f, '#f2d27a', 0, 1.55, z, 2.4, 0.18, 0.03); // a gold line on the green
  if (lamp) box(f, '#f6e6a8', -4.55, 2.6, 0, 0.12, 0.34, 0.4);
  return f;
}
// A whole train: the engine in front (+x) and `n` coaches behind it, centred on x = 0.
export function train(g, n = 3) {
  const lens = [9.6, ...Array(n).fill(9.4)], total = lens.reduce((a, b) => a + b, 0);
  let x = total / 2;
  lens.forEach((L, i) => {
    const c = x - L / 2;
    if (i === 0) loco(g, c);
    else coach(g, c, { lamp: i === n });
    x -= L;
  });
  return total;
}
