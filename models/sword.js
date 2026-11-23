// «السيف الدمشقي»: the sword of the Umayyad Square in its new dress of
// stained glass, in the middle of a big roundabout. One flat panel, the same
// from the front and the back: two white edges rise from two arched legs,
// sweep out to wide shoulders and close into one tall, thin blade; between
// them, glass in red, orange, yellow, blue and green (a rose of fire in the
// middle), lit from inside at night. Round it: a pool
// of water, a ring of grass with palms and jasmine, and projectors that throw
// long blue beams across the square, like the real one.
// The model's centre is the roundabout's centre; y = 0 is the road.
import * as THREE from 'three';
import { GEO, put, box, cyl, ball, face, tree, rng, shine, mat } from './kit.js';
import { lamp, crowd } from './world.js';

export const SWORD_H = 26;            // the height of the blade's tip
export const ISLAND_R = 12;           // the roundabout's island (grass and pool)
export const RING_R = 20;             // the outer edge of the road going round it
export const ROAD_W = 16;             // the avenue that comes in from the north and the south (the city's highway)
const SHOULDER = 0.28;                // the shoulders' sharp tips: how high, of the height
const WHITE = shine('#f1efe8', 2.2), CURB = '#d9d4c6', GRASS = '#7cc46a'; // the white edges are floodlit at night

// Half the width of the glass at height y (0..1 of the sword), measured off a
// photo of the real one: sharp shoulders a quarter of the height out, a quick
// concave sweep in, then a long straight blade, hardly narrowing, to a blunt top.
const PROFILE = [[0.28, 0.256], [0.3, 0.238], [0.313, 0.22], [0.34, 0.18], [0.365, 0.146], [0.4, 0.098], [0.43, 0.065],
  [0.48, 0.045], [0.55, 0.035], [0.75, 0.026], [0.92, 0.017], [0.985, 0.01], [1, 0.005]];
function R(y) {
  y = Math.max(y, SHOULDER);
  for (let i = 1; i < PROFILE.length; i++) {
    const [y1, r1] = PROFILE[i];
    if (y <= y1) { const [y0, r0] = PROFILE[i - 1], k = (y - y0) / (y1 - y0), e = k * k * (3 - 2 * k) * 0.35 + k * 0.65; return r0 + (r1 - r0) * e; }
  }
  return PROFILE[PROFILE.length - 1][1];
}
const RS = PROFILE[0][1];             // the shoulders' half width
// The two legs are thick arches: from each shoulder tip they run almost flat,
// then bend down to stand straight on the ground near the middle (also off
// the photo). s = 0 at the foot .. 1 at the shoulder; x = how far out, y = how high.
const LEG_K = 1.85;
const legOuter = (s) => [0.05 + (RS + 0.01 - 0.05) * Math.pow(s, LEG_K), (SHOULDER - 0.012) * s];
const legInner = (s) => [0.02 + (RS - 0.006 - 0.02) * Math.pow(s, LEG_K), 0.06 + (SHOULDER - 0.06) * s];
// The bottom of the glass follows the legs' inner edge, down to a point between them.
function glassBottom(x) {
  x = Math.abs(x);
  if (x <= 0.02) return 0.06;
  const s = Math.pow(Math.min(1, (x - 0.02) / (RS - 0.026)), 1 / LEG_K);
  return 0.06 + (SHOULDER - 0.06) * s;
}

// The colours of the glass, a cell at a time: the rose of fire in the middle,
// rings of yellow and blue round it, green leaves at the bottom, and a strip
// of every colour up the blade. Every colour shines at night (lit from inside).
const GLASS = {
  red: shine('#d8281f', 2.7), orange: shine('#f07a1a', 2.7), yellow: shine('#f5c51b', 2.7), blue: shine('#1f4fc4', 2.6),
  sky: shine('#2fa3e6', 2.6), green: shine('#2e9e46', 2.6), white: shine('#f2f2ec', 2.4), deep: shine('#1b2f8a', 2.5),
};
// The pattern, like the real panel: up the blade, blocks of one colour each
// stacked on top of one another (row = which block); below, a rose of fire
// whose petals turn red and orange round a white heart, a ring of yellow,
// streaks of blue and sky round it, and green leaves under the rose.
const BLADE = [GLASS.red, GLASS.orange, GLASS.yellow, GLASS.green, GLASS.red, GLASS.white, GLASS.blue, GLASS.orange, GLASS.yellow, GLASS.red, GLASS.sky, GLASS.orange];
function glassColor(x, y, row, rand) { // x, y in heights of the sword
  if (y > 0.47) return BLADE[Math.floor(row / 2) % BLADE.length];
  const dy = y - 0.285, d = Math.hypot(x, dy * 1.15), a = Math.atan2(dy, x);
  const petal = Math.floor(((a + Math.PI) / (2 * Math.PI)) * 9 + d * 40) % 2; // petals swirling round the heart
  if (d < 0.025) return GLASS.white;
  if (d < 0.105) return petal ? GLASS.red : GLASS.orange;
  if (d < 0.125) return rand() < 0.8 ? GLASS.yellow : GLASS.white;
  if (y < 0.2 && Math.abs(x) < 0.11) return rand() < 0.75 ? GLASS.green : GLASS.white; // the leaves
  const streak = Math.floor(((a + Math.PI) / (2 * Math.PI)) * 14) % 3;
  if (y > 0.33) return [GLASS.blue, GLASS.sky, GLASS.yellow][streak];
  return [GLASS.blue, GLASS.deep, GLASS.sky][streak];
}

// The glass: one flat panel between the two white edges, the same seen from
// the front and from the back, cut at the bottom into a V that comes down
// between the legs. Built as cells, one colour each, on both faces, gathered
// into one mesh per colour (so it bakes like the rest of the city).
const GLASS_T = 0.022; // the panel's thickness, of the height
function glassFaces(g, H, rand) {
  const tris = new Map(); // colour -> positions
  const NT = 24, NY = 60;
  const at = (t, s, z) => { // t: across, left edge to right edge; s: up, from the bottom of the glass to the tip
    const yb = glassBottom((-1 + 2 * t) * RS), y = yb + (1 - yb) * Math.pow(s, 1.6);
    return [(-1 + 2 * t) * R(y) * H * 0.995, y * H, z];
  };
  // the same pattern on both faces, mirrored, so the back is the front seen from behind
  const colors = [];
  for (let i = 0; i < NT; i++) { colors.push([]); for (let j = 0; j < NY; j++) colors[i].push(null); }
  for (let i = 0; i < NT; i++) for (let j = 0; j < NY; j++) {
    const p00 = at(i / NT, j / NY, 0), p11 = at((i + 1) / NT, (j + 1) / NY, 0);
    colors[i][j] = glassColor((p00[0] + p11[0]) / 2 / H, (p00[1] + p11[1]) / 2 / H, j, rand);
  }
  for (const side of [1, -1]) {
    const z = side * GLASS_T * H / 2;
    for (let i = 0; i < NT; i++) for (let j = 0; j < NY; j++) {
      const t0 = i / NT, t1 = (i + 1) / NT, s0 = j / NY, s1 = (j + 1) / NY;
      const p00 = at(t0, s0, z), p10 = at(t1, s0, z), p01 = at(t0, s1, z), p11 = at(t1, s1, z);
      const col = colors[side > 0 ? i : NT - 1 - i][j];
      if (!tris.has(col)) tris.set(col, []);
      const list = tris.get(col);
      for (const tri of [[p00, p10, p11], [p00, p11, p01]]) {
        list.push(...tri[0], ...tri[1], ...tri[2]);
        list.push(...tri[0], ...tri[2], ...tri[1]); // facing either way
      }
    }
  }
  for (const [col, pos] of tris) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat(col));
    g.add(m);
  }
}

// One white edge of the sword (side 1: right, -1: left), a little thicker
// than the glass and in its plane: a band along the blade's edge from the top
// down the sweep to the shoulder's sharp tip, and from there the thick leg,
// under the glass's rounded V, curving in and down to the ground near the middle.
const finGeos = new Map();
function fin(H, side) {
  if (finGeos.has(side)) return finGeos.get(side);
  const pts = [], out = 0.017, inn = 0.006, steps = 60;
  // outer edge: down the blade and the sweep to the shoulder tip
  for (let i = 0; i <= steps; i++) {
    const y = 1 - (1 - SHOULDER) * (i / steps);
    pts.push([R(y) + out * Math.min(1, (1 - y) * 25), y]);
  }
  pts.push([RS + out + 0.012, SHOULDER - 0.006]); // the sharp tip
  // the leg's outer (lower) edge: from the shoulder, flat at first, then down to the foot
  for (let i = steps; i >= 0; i--) pts.push(legOuter(i / steps));
  // the foot, then the leg's inner (upper) edge back up under the glass to the shoulder
  for (let i = 0; i <= steps; i++) { const [x, y] = legInner(i / steps); pts.push([x, y + 0.004]); }
  pts.splice(pts.length - steps - 1, 0, [0.02, 0]); // the inner corner of the foot, on the ground
  // inner edge: up the sweep and the blade, just over the glass
  for (let i = 0; i <= steps; i++) { const y = SHOULDER + (1 - SHOULDER) * (i / steps); pts.push([Math.max(0.0005, R(y) - inn), y]); }
  const clean = pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 1e-4); // no repeated corners
  const shape = new THREE.Shape(clean.map(([x, y]) => new THREE.Vector2(x * side * H, y * H)));
  const depth = GLASS_T * 1.9 * H;
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }).translate(0, 0, -depth / 2);
  finGeos.set(side, geo);
  return geo;
}

export function sword(g, H = SWORD_H) {
  const rand = rng(1946); // the year the last soldier of the mandate left Syria
  glassFaces(g, H, rand);
  for (const side of [1, -1]) put(g, fin(H, side), WHITE, 0, 0, 0); // the two white edges, in the glass's plane
  box(g, WHITE, 0, 0, 0, 0.2 * H, 0.015 * H, GLASS_T * 2.6 * H); // the foot joining the two legs
  cyl(g, WHITE, 0, H * 0.995, 0, 0.06, H * 0.02, 6); // the small point on the blunt top
  box(g, '#3b3f47', 0, 0, 0, 1.6, 0.9, 1.6);           // the machine box under the glass
}

// The whole roundabout: the road round it, the island with its pool, grass,
// palms and lamps, the projectors, and the sword in the middle.
export function swordRoundabout(g) {
  const rand = rng(2024);
  // the road round the island, with a dashed line and a kerb
  put(g, ringGeo(ISLAND_R + 0.4, RING_R, 0.12), '#3a3d44', 0, 0, 0);
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2, r = (ISLAND_R + RING_R) / 2 + 0.2;
    box(g, '#ecebe4', Math.cos(a) * r, 0.12, Math.sin(a) * r, 0.16, 0.01, 1.2, -a);
  }
  // the outer kerb, open where the avenue comes in from the north and the south (±z),
  // and the asphalt that joins the avenue to the ring there
  const gap = Math.asin((ROAD_W / 2 + 0.6) / RING_R);
  for (const mid of [0, Math.PI]) put(g, arcGeo(RING_R, RING_R + 0.6, 0.3, mid - Math.PI / 2 + gap, mid + Math.PI / 2 - gap), CURB, 0, 0, 0);
  for (const s of [-1, 1]) box(g, '#3a3d44', 0, 0, s * (RING_R - 1), ROAD_W, 0.115, 4.4);
  // the island: a stone kerb, grass, and a square pool of water round the sword
  put(g, ringGeo(ISLAND_R, ISLAND_R + 0.45, 0.45), CURB, 0, 0, 0);
  put(g, ringGeo(0.01, ISLAND_R, 0.35), GRASS, 0, 0, 0);
  put(g, ringGeo(6.4, 7.2, 0.6), '#e4dfd2', 0, 0, 0);            // the pool's rim
  put(g, ringGeo(0.01, 6.4, 0.42), shine('#3b8fc4', 2.2), 0, 0, 0); // the water (it glows a little at night)
  put(g, ringGeo(0.01, 2.6, 0.62), '#d9d4c6', 0, 0, 0);          // the plinth the legs stand on
  sword(face(g, 0, 0, 0, 0.62));
  // jasmine and palms round the grass, lamps on the kerb
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    tree(face(g, 0, 0, 0, 0.35), Math.cos(a) * 9.6, Math.sin(a) * 9.6, 1.5, 'palm');
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2, r = 8.2 + (i % 2) * 0.6;
    ball(g, i % 3 ? '#4f9f5a' : '#5fb46a', Math.cos(a) * r, 0.55, Math.sin(a) * r, 0.5, 0.8);
    if (i % 2 === 0) ball(g, '#ffffff', Math.cos(a) * r, 0.95, Math.sin(a) * r, 0.14);
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    lamp(g, Math.cos(a) * (ISLAND_R - 0.4), 0.45, Math.sin(a) * (ISLAND_R - 0.4), { h: 3.2 });
  }
  // the projectors: low boxes on the grass, aimed out across the square
  for (const a of PROJECTORS) {
    const p = face(g, Math.cos(a) * 7.8, Math.sin(a) * 7.8, -a + Math.PI / 2, 0.35);
    box(p, '#2b2d33', 0, 0, 0, 0.7, 0.5, 0.7);
    box(p, shine('#7fd8ff', 3), 0, 0.12, 0.36, 0.42, 0.3, 0.04);
  }
  // a few people by the pool (the cars going round are the city's highway traffic)
  crowd(g, 10, [-6.8, 6.8, -6.8, 6.8], rand, { y: 0.6, free: (x, z) => { const d = Math.hypot(x, z); return d > 6.5 && d < 7.0; } });
}
const PROJECTORS = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (i / 8) * Math.PI * 2 + 0.2);
swordRoundabout.label = 'السيف الدمشقي';
swordRoundabout.top = SWORD_H + 1;
swordRoundabout.size = [2 * (RING_R + 0.6), 2 * (RING_R + 0.6)];

const rings = new Map();
function ringGeo(r1, r2, h) {
  const key = [r1, r2, h].join('/');
  if (!rings.has(key)) {
    const s = new THREE.Shape();
    s.absarc(0, 0, r2, 0, Math.PI * 2, false);
    if (r1 > 0.05) { const hole = new THREE.Path(); hole.absarc(0, 0, r1, 0, Math.PI * 2, true); s.holes.push(hole); }
    rings.set(key, new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 48 }).rotateX(-Math.PI / 2));
  }
  return rings.get(key);
}
// A piece of a ring between angles a0 and a1 (in the x-z plane, a = 0 along +x, +π/2 along +z).
const arcs = new Map();
function arcGeo(r1, r2, h, a0, a1) {
  const key = [r1, r2, h, a0, a1].map((v) => v.toFixed(4)).join('/');
  if (!arcs.has(key)) {
    const s = new THREE.Shape(); // shape y = -world z, so the angles turn round
    s.absarc(0, 0, r2, -a0, -a1, true);
    s.absarc(0, 0, r1, -a1, -a0, false);
    arcs.set(key, new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 40 }).rotateX(-Math.PI / 2));
  }
  return arcs.get(key);
}
function carAt(g, x, z, ry, color) {
  const c = face(g, x, z, ry, 0.12);
  box(c, color, 0, 0.25, 0, 1.7, 0.6, 3.6);
  box(c, color, 0, 0.85, -0.2, 1.5, 0.5, 1.9);
  box(c, '#9fc9d8', 0, 0.9, -0.2, 1.52, 0.38, 1.6);
  for (const [dx, dz] of [[-0.8, -1.2], [0.8, -1.2], [-0.8, 1.2], [0.8, 1.2]]) cyl(c, '#2b2d33', dx, 0, dz, 0.3, 0.25, 8);
}

// At night: long blue beams from the projectors out across the square (the
// photo's), and the glow of the lit glass on the pool (the glass itself shines through the city's shader).
export function swordLights() {
  const group = new THREE.Group(), mats = [];
  const glow = (color, strength) => {
    const m = new THREE.MeshBasicMaterial({ color, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    mats.push([m, strength]);
    return m;
  };
  const shade = (geo, k) => {
    const col = [];
    for (let i = 0; i < geo.attributes.position.count; i++) { const v = k(i); col.push(v, v, v); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return geo;
  };
  const up = new THREE.Vector3(0, 1, 0);
  const beam = (from, to, m, r0, r1) => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), len = a.distanceTo(b);
    const geo = new THREE.CylinderGeometry(r1, r0, len, 14, 6, true).translate(0, len / 2, 0);
    shade(geo, (i) => Math.pow(1 - geo.attributes.position.getY(i) / len, 1.2));
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.copy(a);
    mesh.quaternion.setFromUnitVectors(up, b.sub(a).normalize());
    group.add(mesh);
  };
  const blue = glow('#3aa8ff', 0.75);
  PROJECTORS.forEach((a, i) => { // low and long, out over the road, a little up
    const x = Math.cos(a) * 7.8, z = Math.sin(a) * 7.8, sweep = a + (i % 2 ? 0.35 : -0.35);
    beam([x, 0.75, z], [x + Math.cos(sweep) * 46, 3 + (i % 3) * 2.5, z + Math.sin(sweep) * 46], blue, 0.18, 1.0);
  });
  const glassGlow = glow('#ff9a3a', 0.45); // the light of the glass on the water
  const pool = new THREE.Mesh(shade(new THREE.CircleGeometry(6.3, 32).rotateX(-Math.PI / 2), (i) => (i === 0 ? 1 : 0.25)), glassGlow);
  pool.position.set(0, 1.05, 0);
  group.add(pool);
  return { group, mats };
}
swordRoundabout.lights = swordLights;
swordRoundabout.floodlight = { color: '#ffffff', at: [0, 10, 10] };
