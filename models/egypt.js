// «مصر»: a painted Nubian house of Aswan, and Giza: the Sphinx lying in front
// of the three pyramids, with the projectors of the Sound and Light show that
// paint the pyramids in colour at night.
import * as THREE from 'three';
import { C, GEO, put, box, cyl, taper, ball, arch, face, win, door, lot, tree, vine, pot, lattice, rng, shine, RIGHT, LEFT, BACK } from './kit.js';
import { crowd, camel, lamp, merlons, flagPole } from './world.js';

// ---------------------------------------------------------------- the Nubian house
const LOOKS = [
  { wall: '#f4efe4', low: '#3f8fd0', accent: '#f2c14e', door: '#2f6fb0', paint: ['#3f8fd0', '#f2c14e', '#e0584f'] }, // white and blue
  { wall: '#f2c14e', low: '#d9703c', accent: '#2f6fb0', door: '#2e7d5b', paint: ['#2f6fb0', '#ffffff', '#2e7d5b'] }, // yellow and orange
  { wall: '#9fd3e8', low: '#2f7fb8', accent: '#f4efe4', door: '#c0392b', paint: ['#f2c14e', '#ffffff', '#c0392b'] }, // sky blue
];
const MUD = '#d8b98a';
const halfTube = new THREE.CylinderGeometry(1, 1, 1, 14, 1, false, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI / 2);

// A painted band of triangles along a wall face (z = 0 is the wall).
function zigzag(f, x, y, w, colors, s = 0.28) {
  const n = Math.floor(w / s);
  for (let i = 0; i < n; i++) put(f, GEO.box, colors[i % colors.length], x - w / 2 + (i + 0.5) * (w / n), y, 0.03, s * 0.6, s * 0.6, 0.04).rotation.z = Math.PI / 4;
}

export function egyptHouse(g, v = {}) {
  const look = { ...LOOKS[0], ...v };
  if (!v.bare) lot(g, { ground: '#e6cf9f' });
  box(g, '#e8d4a8', 0, 0, 0.1, 6.6, 0.05, 8.2);
  const Y = 0.05, H = 3.5;
  // the house: one storey, painted, a darker band at the bottom
  box(g, look.wall, 0, Y, -1.6, 5.8, H, 4.0);
  box(g, look.low, 0, Y, 0.41, 5.84, 1.0, 0.04);
  for (const s of [-1, 1]) box(g, look.low, s * 2.91, Y, -1.6, 0.04, 1.0, 4.04);
  // the roof: a long vault on the right, a dome on the left, and a painted parapet with battlements
  put(g, halfTube, MUD, 1.25, Y + H, -1.6, 1.4, 1.2, 3.8);
  put(g, GEO.halfBall, MUD, -1.45, Y + H, -1.6, 1.35, 1.25, 1.35);
  ball(g, look.accent, -1.45, Y + H + 1.35, -1.6, 0.14);
  for (const [x1, z1, x2, z2] of [[-2.85, 0.35, 2.85, 0.35], [-2.85, -3.55, 2.85, -3.55], [-2.85, -3.55, -2.85, 0.35], [2.85, -3.55, 2.85, 0.35]]) {
    box(g, look.wall, (x1 + x2) / 2, Y + H, (z1 + z2) / 2, Math.abs(x2 - x1) + 0.16, 0.3, Math.abs(z2 - z1) + 0.16);
    merlons(g, look.wall, x1, z1, x2, z2, Y + H + 0.3, { w: 0.22, h: 0.3, gap: 0.5, thick: 0.16, stepped: true });
  }

  // the front: a painted arched door, little lattice windows, painted bands and hanging plates
  const f = face(g, 0, 0.4, 0, Y);
  arch(f, look.accent, 0, 0, 0.02, 1.7, 2.75, 0.04);
  arch(f, look.door, 0, 0, 0.05, 1.25, 2.45, 0.05);
  for (const dx of [-0.25, 0.25]) for (const y of [0.7, 1.3, 1.9]) ball(f, '#f4efe4', dx, y, 0.1, 0.06);
  zigzag(f, 0, 3.05, 5.6, look.paint);
  zigzag(f, 0, 1.12, 5.6, [look.wall]);
  for (const s of [-1, 1]) {
    box(f, look.accent, s * 1.9, 1.75, 0.02, 1.0, 1.0, 0.04);
    put(f, GEO.box, lattice('#7b4b2a', '#3e2414', 2, 2), s * 1.9, 1.85, 0.05, 0.75, 0.8, 0.03);
    // plates hung on the wall, as in Nubian houses
    for (const [dx, dy, c] of [[-0.45, 2.75, look.paint[0]], [0, 2.85, look.paint[1]], [0.45, 2.75, look.paint[2]]]) {
      cyl(f, '#f4efe4', s * 1.9 + dx, dy, 0.03, 0.17, 0.03, 10).rotation.x = Math.PI / 2;
      cyl(f, c, s * 1.9 + dx, dy, 0.06, 0.1, 0.02, 10).rotation.x = Math.PI / 2;
    }
  }
  cyl(f, '#2b2d33', 1.05, 2.1, 0.12, 0.03, 0.35, 6);
  ball(f, '#f6d77a', 1.05, 2.0, 0.2, 0.14, 1.3);
  // a painted sun and a crocodile over the door (the Nubian door charms)
  cyl(f, look.paint[1], 0, 2.95, 0.05, 0.22, 0.03, 12).rotation.x = Math.PI / 2;
  const croc = '#3f7d4a';
  box(f, croc, 0, 3.3, 0.05, 1.3, 0.16, 0.05);
  box(f, croc, 0.75, 3.33, 0.05, 0.35, 0.1, 0.05);
  for (const dx of [-0.35, 0.35]) box(f, croc, dx, 3.22, 0.05, 0.08, 0.14, 0.05);
  const fr = face(g, 2.9, -1.6, RIGHT, Y);
  zigzag(fr, 0, 3.05, 3.8, look.paint);
  put(fr, GEO.box, lattice('#7b4b2a', '#3e2414', 2, 2), 0, 1.6, 0.04, 0.7, 0.8, 0.03);
  const fl = face(g, -2.9, -1.6, LEFT, Y);
  zigzag(fl, 0, 3.05, 3.8, look.paint);

  // the yard: a low painted wall with an arched gate, a mud bench, water jars, a palm and bougainvillea
  for (const [x, w] of [[-2.1, 2.4], [2.1, 2.4]]) { box(g, look.wall, x, Y, 4.0, w, 1.2, 0.3); box(g, look.low, x, Y, 4.16, w, 0.45, 0.02); }
  for (const s of [-1, 1]) box(g, look.wall, s * 3.15, Y, 2.2, 0.3, 1.2, 3.6);
  const gate = face(g, 0, 4.0, 0, Y);
  for (const s of [-1, 1]) box(gate, look.wall, s * 0.75, 0, 0, 0.3, 2.1, 0.32);
  box(gate, look.wall, 0, 1.9, 0, 1.8, 0.4, 0.32);
  zigzag(gate, 0, 2.1, 1.6, look.paint, 0.22);
  box(g, MUD, -1.8, Y, 1.0, 2.0, 0.45, 0.7);            // the mastaba bench along the house
  box(g, MUD, -1.8, Y + 0.45, 0.75, 2.0, 0.4, 0.15);
  for (const x of [1.6, 2.3]) { box(g, '#7b4b2a', x, Y, 1.2, 0.5, 0.35, 0.5); put(g, GEO.ball, '#c7764f', x, Y + 0.75, 1.2, 0.3, 0.45, 0.3); } // the "zir" water jars
  tree(g, 2.3, 2.9, 1.15, 'palm');
  vine(face(g, -2.1, 4.16), 0, 0.3, 2.2, 0.9, 12, { dots: ['#d6337a', '#e85a9b'], seed: 21 });
  pot(g, -0.9, Y, 2.8, 0.9, C.leaf, '#e0457b');
}
egyptHouse.looks = LOOKS;
egyptHouse.top = 5.2;
egyptHouse.flag = [2.55, 3.85, -3.3];

// ---------------------------------------------------------------- Giza
const SAND = '#e6c98f', STONE = ['#d9b77c', '#cfa96c'], CASING = '#efe3c4';
const LS = '#d8b47a', LS2 = '#c79f63', NEMES = '#d6b176', STRIPE = '#b08654';
// the colours the projectors throw at night, and the glass of each projector (shines in its colour)
const BEAMS = { blue: '#4f8bff', gold: '#ffb347', purple: '#b36bff', green: '#4fe0a0' };
const LENS = Object.fromEntries(Object.entries(BEAMS).map(([k, c]) => [k, shine(c, 3)]));

// The pyramids: square, in bands of stone (every other one a touch darker), the top of Khafre's still cased.
const PYRAMIDS = [
  { x: -16, z: -7.5, base: 24, h: 20, bands: 16, light: 'blue' },   // Khufu
  { x: 17, z: -11, base: 18, h: 16.5, bands: 14, cap: 3, light: 'gold' }, // Khafre
  { x: 28, z: 2, base: 8, h: 7, bands: 7, light: 'purple' },        // Menkaure
  { x: 21.5, z: 10.5, base: 3.4, h: 3, bands: 3 }, { x: 26.5, z: 10.5, base: 3.4, h: 3, bands: 3 }, // queens' pyramids
];
function pyramid(g, Y, { x, z, base, h, bands, cap = 0 }) {
  const f = face(g, x, z, Math.PI / 4, Y), R = base / Math.SQRT2;
  for (let i = 0; i < bands; i++) {
    const r0 = R * (1 - i / bands), r1 = R * (1 - (i + 1) / bands);
    taper(f, i >= bands - cap ? CASING : STONE[i % 2], 0, (h * i) / bands, 0, r0, r1, h / bands, 4);
  }
  // the dark doorway on its north... here, the face towards the visitor
  if (base > 10) box(g, '#3a2e24', x, Y + h * 0.12, z + base / 2 * (1 - 0.12) + 0.02, 1.0, 1.4, 0.3);
}

// The Sphinx, lying with its paws forward, its face to the visitor (+z).
function sphinx(g, x, y, z, s) {
  const sp = face(g, x, z, 0, y);
  sp.scale.setScalar(s);
  box(sp, '#c8a46e', 0, 0, -1, 6.6, 0.6, 16);                     // the bedrock it is carved from
  box(sp, LS, 0, 0.6, -1.6, 4.2, 3.0, 9.6);                      // body
  put(sp, GEO.ball, LS, 0, 2.0, -6.0, 2.2, 2.0, 2.4);             // haunch
  box(sp, LS2, 0, 3.6, -1.8, 3.4, 0.35, 8.4);                     // the ridge of the back
  for (const k of [-3.5, -1.5, 0.5]) box(sp, LS2, 0, 0.9, k, 4.26, 2.2, 0.12); // weathered layers
  for (const sd of [-1, 1]) {
    box(sp, LS, sd * 1.4, 0.6, 5.3, 1.1, 0.95, 5.2);              // front legs and paws
    box(sp, '#e2c08a', sd * 1.4, 0.6, 7.95, 1.15, 0.6, 0.3);
    box(sp, LS, sd * 2.0, 0.6, -5.4, 0.9, 1.0, 2.6);              // hind legs
  }
  box(sp, LS, 2.2, 0.6, -6.8, 0.25, 0.3, 4.0);                   // the tail along its side
  box(sp, LS, 0, 0.6, 3.5, 4.6, 3.3, 2.0);                       // chest
  for (const sd of [-1, 1]) box(sp, LS, sd * 1.9, 0.6, 2.2, 1.0, 2.6, 2.6); // shoulders
  box(sp, LS, 0, 3.8, 3.7, 2.1, 1.3, 1.7);                       // neck
  box(sp, LS, 0, 4.6, 4.05, 2.2, 2.4, 2.0);                      // head
  // the royal headdress (nemes), striped, falling to the shoulders
  box(sp, NEMES, 0, 6.6, 3.85, 2.6, 0.6, 2.4);
  for (const sd of [-1, 1]) {
    box(sp, NEMES, sd * 1.28, 3.9, 3.95, 0.4, 3.0, 1.7);
    put(sp, GEO.wedge, NEMES, sd * 1.75, 3.3, 3.95, 0.9, 1.6, 1.8, sd > 0 ? Math.PI : 0); // the headdress spreading over the shoulders
    for (let k = 0; k < 7; k++) box(sp, STRIPE, sd * 1.49, 3.75 + k * 0.45, 3.95, 0.03, 0.18, 1.6);
    box(sp, NEMES, sd * 0.95, 2.3, 5.05, 0.55, 2.7, 0.3);
    for (let k = 0; k < 6; k++) box(sp, STRIPE, sd * 0.95, 2.4 + k * 0.45, 5.21, 0.56, 0.16, 0.03);
    box(sp, '#5b4430', sd * 0.48, 5.9, 5.06, 0.42, 0.14, 0.04);    // eyes
    box(sp, LS2, sd * 0.48, 6.15, 5.06, 0.5, 0.08, 0.06);           // brows
    box(sp, LS2, sd * 1.15, 5.3, 4.3, 0.12, 0.7, 0.5);              // ears
  }
  box(sp, STRIPE, 0, 6.55, 5.05, 2.4, 0.14, 0.05);                // the band over the forehead
  box(sp, LS2, 0, 5.25, 5.08, 0.32, 0.55, 0.16);                  // what is left of the nose
  box(sp, '#7a5c3c', 0, 4.95, 5.06, 0.6, 0.07, 0.04);             // mouth
  box(sp, LS2, 0, 6.8, 5.05, 0.25, 0.5, 0.12);                    // the cobra on the brow
}

// A projector on its stand, aimed at (tx, ty, tz); returns where its light comes out.
function projector(g, Y, x, z, kind, tx, ty, tz) {
  const ry = Math.atan2(tx - x, tz - z), d = Math.hypot(tx - x, tz - z), tilt = Math.atan2(ty - (Y + 1.6), d);
  for (const [dx, dz] of [[-0.35, -0.3], [0.35, -0.3], [0, 0.35]]) box(g, '#2b2d33', x + dx, Y, z + dz, 0.08, 1.3, 0.08);
  const head = new THREE.Group();
  head.position.set(x, Y + 1.5, z);
  head.rotation.order = 'YXZ';
  head.rotation.set(-tilt, ry, 0);
  g.add(head);
  box(head, '#3a3d44', 0, -0.35, -0.2, 0.9, 0.7, 1.1);
  cyl(head, LENS[kind], 0, 0, 0.36, 0.33, 0.04, 12).rotation.x = Math.PI / 2;
  return [x + Math.sin(ry) * Math.cos(tilt) * 0.4, Y + 1.5 + Math.sin(tilt) * 0.4, z + Math.cos(ry) * Math.cos(tilt) * 0.4];
}

const AIMS = []; // [from, to, colour] of every projector, kept for the beams of the night
export function giza(g) {
  const rand = rng(2560); // the Great Pyramid, about 2560 BC
  const Y = 0.2;
  box(g, SAND, 0, 0, 0, 63.6, Y, 39.6);
  for (let i = 0; i < 14; i++) put(g, GEO.ball, i % 2 ? '#e1c286' : '#ecd29c', -30 + rand() * 60, Y - 0.4, -18 + rand() * 36, 2 + rand() * 3, 0.5, 2 + rand() * 3); // dunes

  for (const p of PYRAMIDS) pyramid(g, Y, p);
  // the causeway from the Sphinx up to Khafre's pyramid
  const cw = face(g, 11.5, -3.5, -0.62, Y);
  box(cw, '#d6be8e', 0, 0, 0, 2.2, 0.25, 12);

  // the Sphinx in its hollow of rock, with its temple in front
  const S = { x: 4.5, z: 6.5, s: 1.35 };
  for (const [x, z, w, d, h] of [[S.x - 6.6, S.z, 0.8, 22, 0.9], [S.x + 6.6, S.z, 0.8, 22, 0.9], [S.x, S.z - 11.4, 14, 0.8, 0.9]]) box(g, '#cba56c', x, Y, z, w, h, d);
  sphinx(g, S.x, Y, S.z, S.s);
  for (const sd of [-1, 1]) { box(g, '#a88a6a', S.x + sd * 6.0, Y, S.z + 12.6, 2.6, 1.2, 2.0); box(g, '#8e7358', S.x + sd * 6.0, Y + 1.2, S.z + 12.6, 2.8, 0.25, 2.2); }

  // the Sound and Light show: rows of seats facing the pyramids, and the projectors
  for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) {
    const x = -27 + i * 2.2, z = 13.5 + r * 1.4;
    box(g, '#c0392b', x, Y + r * 0.25, z, 1.7, 0.45, 0.6);
    box(g, '#8e2a20', x, Y + r * 0.25 + 0.45, z + 0.27, 1.7, 0.5, 0.08);
  }
  for (let r = 0; r < 4; r++) box(g, '#9a9a9a', -18.2, Y, 13.5 + r * 1.4, 20, r * 0.25, 1.4);
  AIMS.length = 0;
  const aim = (x, z, kind, tx, ty, tz) => AIMS.push([projector(g, Y, x, z, kind, tx, ty, tz), [tx, ty, tz], kind]);
  aim(-28, 9, 'blue', -18, Y + 8, -6);
  aim(-6, 11, 'blue', -14, Y + 9, -3);
  aim(-1, 17.5, 'gold', S.x, Y + 7, S.z + 6);
  aim(10, 17.5, 'gold', S.x, Y + 7, S.z + 6);
  aim(12, 6, 'gold', 16, Y + 7, -6);
  aim(30, 13, 'purple', 28, Y + 3, 4);
  aim(22, 3, 'purple', 18, Y + 9, -6);
  aim(-20, 9, 'green', -16, Y + 13, -4);

  // visitors, camels with their drivers, palms at the edge of the desert
  crowd(g, 24, [-28, -6, 4, 12], rand, { y: Y });
  crowd(g, 10, [12, 30, 13, 19], rand, { y: Y });
  camel(g, -4, Y, 13, 0.5);
  camel(g, -1.5, Y, 14.5, 0.2, { saddle: '#2f5d8a' });
  camel(g, 31, Y, 8, Math.PI - 0.5, { saddle: '#d9a441' });
  for (const [x, z] of [[-31, 18], [-31, 13], [31, 18], [-31, -17], [31, -17]]) tree(g, x, z, 1.5, 'palm');
  for (const x of [-30, -20, 18, 28]) lamp(g, x, Y, 19, { h: 3.2 });
  giza.flag = { code: 'eg', ...flagPole(g, -16, Y + 20 + 0.1, -7.5, 9) }; // on the tip of the Great Pyramid
}
giza.label = 'أهرامات الجيزة وأبو الهول';
giza.top = 30;
giza.size = [64, 40];
giza.floodlight = { color: '#ffc072', at: [4.5, 9, 24] }; // the warm light on the Sphinx's face

// The light of the show, drawn on top of the stone at night: a coloured light
// on each pyramid, strongest on the faces turned to the projectors and fading
// upwards, the beams from the projectors, and pools of light on the sand under
// them. Additive and see-through; the city sets their strength with the night
// (mats: [material, strength]).
export function gizaLights() {
  const group = new THREE.Group(), mats = [];
  const glow = (color, strength) => {
    const m = new THREE.MeshBasicMaterial({ color, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    mats.push([m, strength]);
    return m;
  };
  const shade = (geo, k) => { // k(i) -> brightness of corner i
    const col = [];
    for (let i = 0; i < geo.attributes.position.count; i++) { const v = k(i); col.push(v, v, v); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return geo;
  };
  const toward = new THREE.Vector3(0.3, 0.5, 1).normalize(); // the projectors stand in front, a little to the right
  for (const p of PYRAMIDS) {
    if (!p.light) continue;
    const R = (p.base / Math.SQRT2) * 1.012, h = p.h * 1.012;
    const geo = new THREE.ConeGeometry(R, h, 4, 6, true).rotateY(Math.PI / 4).translate(0, h / 2, 0).toNonIndexed();
    geo.computeVertexNormals(); // flat: one normal per face
    const pos = geo.attributes.position, nor = geo.attributes.normal;
    shade(geo, (i) => {
      const lit = Math.max(0, nor.getX(i) * toward.x + nor.getY(i) * toward.y + nor.getZ(i) * toward.z);
      return (0.1 + 0.9 * lit) * Math.pow(1 - pos.getY(i) / h, 1.3);
    });
    const m = new THREE.Mesh(geo, glow(BEAMS[p.light], 0.75));
    m.position.set(p.x, 0.2, p.z);
    group.add(m);
  }
  const up = new THREE.Vector3(0, 1, 0);
  for (const [from, to, kind] of AIMS) {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), full = a.distanceTo(b), len = full * 0.8; // stops before the stone
    const geo = new THREE.CylinderGeometry(2.4, 0.3, len, 18, 6, true).translate(0, len / 2, 0); // narrow at the lens (y = 0)
    shade(geo, (i) => Math.pow(1 - geo.attributes.position.getY(i) / len, 1.6));
    const m = new THREE.Mesh(geo, glow(BEAMS[kind], 0.2));
    m.position.copy(a);
    m.quaternion.setFromUnitVectors(up, b.clone().sub(a).normalize());
    group.add(m);
    const pool = new THREE.CircleGeometry(2.6, 20).rotateX(-Math.PI / 2);
    shade(pool, (i) => (i === 0 ? 1 : 0)); // bright under the lamp, nothing at the rim
    const pm = new THREE.Mesh(pool, glow(BEAMS[kind], 0.55));
    pm.position.set(a.x + ((b.x - a.x) / full) * 1.5, 0.25, a.z + ((b.z - a.z) / full) * 1.5);
    group.add(pm);
  }
  return { group, mats };
}
giza.lights = gizaLights;
