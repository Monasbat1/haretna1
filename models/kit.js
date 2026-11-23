// A small modelling kit for low-poly houses. Every part is a flat-shaded
// primitive. Sizes are roughly metres, y is the BOTTOM of a part, and +z is
// the street side of the plot.
import * as THREE from 'three';

export const C = {
  stone: '#efe6d2', basalt: '#3d3d42', ochre: '#d8a56c', plaster: '#f5efe2',
  wood: '#7b4b2a', woodLight: '#b07a45', woodDark: '#5a3620', tile: '#c2553b',
  glass: '#8fc7e8', glassDark: '#4a6b85', steel: '#3c4048', white: '#ffffff',
  leaf: '#4f9f5a', water: '#5cc3e6', terracotta: '#c7764f', iron: '#2b2d33',
};
export const GREENS = ['#4f9f5a', '#5fb46a', '#3f8f5a', '#6cba5c'];

// Parts that shine at night are known by their colour. A value up to 1 is a
// window lit from inside (warm light); 2 + strength makes the part shine in
// its own colour (lanterns, headlights, gold). The city's shader does the rest.
const GLOW = new Map();
export function shine(color, k = 1) { GLOW.set(new THREE.Color(color).getHex(), k); return color; }
for (const glass of [C.glass, '#9fc9d8', '#6f8fa3', '#7fa8bf', '#5d8fae', '#7fb8d6']) shine(glass);
shine('#3a2c26', 0.45); // the shaded inside of an iwan reads as a lit room
shine('#f0d48a', 2.9);  // the lantern inside the iwan
shine('#f6d77a', 3);    // gate and wall lanterns
shine('#f6e6a8', 3);    // headlights
shine('#e5362b', 2.8);  // tail lights

const matCache = new Map();
export function mat(color, extra) {
  const key = color + (extra ? JSON.stringify(extra) : '');
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshLambertMaterial({ color, flatShading: true, ...extra }));
  return matCache.get(key);
}

function geoFrom(points) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
  g.computeVertexNormals();
  return g;
}
const prism = (() => { // roof shape: 1 x 1 base, ridge along x at height 1
  const A = [-.5, 0, .5], B = [.5, 0, .5], Cc = [.5, 0, -.5], D = [-.5, 0, -.5], E = [-.5, 1, 0], F = [.5, 1, 0];
  return geoFrom([A, B, F, A, F, E, Cc, D, E, Cc, E, F, D, A, E, B, Cc, F, A, D, Cc, A, Cc, B]);
})();
const wedge = (() => { // ramp: height 0 at x=-0.5 rising to 1 at x=+0.5
  const P1 = [-.5, 0, .5], Q1 = [.5, 0, .5], R1 = [.5, 1, .5], P2 = [-.5, 0, -.5], Q2 = [.5, 0, -.5], R2 = [.5, 1, -.5];
  return geoFrom([P1, Q1, R1, Q2, P2, R2, Q1, Q2, R2, Q1, R2, R1, P1, R1, R2, P1, R2, P2, P1, P2, Q2, P1, Q2, Q1]);
})();

export const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 14).translate(0, 0.5, 0),
  cyl8: new THREE.CylinderGeometry(1, 1, 1, 8).translate(0, 0.5, 0),
  cone: new THREE.ConeGeometry(1, 1, 9).translate(0, 0.5, 0),
  hip: new THREE.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0),
  ball: new THREE.IcosahedronGeometry(1, 1),
  ballLow: new THREE.IcosahedronGeometry(1, 0), // swapped in for small or far-away balls when a house is baked
  halfBall: new THREE.SphereGeometry(1, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2),
  torus: new THREE.TorusGeometry(1, 0.3, 6, 14).rotateX(Math.PI / 2),
  prism, wedge,
};
const taperCache = new Map();
function taperGeo(top, seg) {
  const key = top + '/' + seg;
  if (!taperCache.has(key)) taperCache.set(key, new THREE.CylinderGeometry(top, 1, 1, seg).translate(0, 0.5, 0));
  return taperCache.get(key);
}
// Tall pointed dome of the mud "beehive" houses.
GEO.beehive = (() => {
  const pts = [];
  for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push(new THREE.Vector2(Math.pow(1 - t, 0.5) * (1 - 0.12 * t), t)); }
  return new THREE.LatheGeometry(pts, 14);
})();

export function put(g, geo, color, x, y, z, sx = 1, sy = 1, sz = 1, ry = 0) {
  const m = new THREE.Mesh(geo, typeof color === 'string' ? mat(color) : color);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  m.rotation.y = ry;
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  return m;
}
export const box = (g, c, x, y, z, w, h, d, ry) => put(g, GEO.box, c, x, y, z, w, h, d, ry);
export const cyl = (g, c, x, y, z, r, h, seg = 14) => put(g, seg <= 8 ? GEO.cyl8 : GEO.cyl, c, x, y, z, r, h, r);
export const taper = (g, c, x, y, z, rBottom, rTop, h, seg = 12) => put(g, taperGeo(+(rTop / rBottom).toFixed(3), seg), c, x, y, z, rBottom, h, rBottom);
export const cone = (g, c, x, y, z, r, h) => put(g, GEO.cone, c, x, y, z, r, h, r);
export const hip = (g, c, x, y, z, w, h, d) => put(g, GEO.hip, c, x, y, z, w, h, d);
export const gable = (g, c, x, y, z, w, h, d, ry) => put(g, GEO.prism, c, x, y, z, w, h, d, ry); // ridge along local x
export const ramp = (g, c, x, y, z, w, h, d, ry) => put(g, GEO.wedge, c, x, y, z, w, h, d, ry);
export const ball = (g, c, x, y, z, r, sy = 1) => put(g, GEO.ball, c, x, y, z, r, r * sy, r); // y = centre

const archCache = new Map();
let coarse = false; // true while a far-away version is baked: curves get fewer steps
// An arched panel (door, window or opening): w wide, h tall to the top of the arch.
export function arch(g, c, x, y, z, w, h, depth = 0.08, ry = 0, pointed = false) {
  const key = [w, h, depth, pointed, coarse].join('/');
  if (!archCache.has(key)) {
    const s = new THREE.Shape(), r = w / 2, spring = h - (pointed ? r * 1.35 : r);
    s.moveTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, spring);
    if (pointed) { s.quadraticCurveTo(r, spring + r * 0.95, 0, h); s.quadraticCurveTo(-r, spring + r * 0.95, -r, spring); }
    else s.absarc(0, spring, r, 0, Math.PI, false);
    s.lineTo(-r, 0);
    archCache.set(key, new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: coarse ? 3 : 8 }).translate(0, 0, -depth / 2));
  }
  return put(g, archCache.get(key), c, x, y, z, 1, 1, 1, ry);
}

// A wall to decorate: inside the returned group, z = 0 is the wall surface and +z points away from it.
export function face(g, x, z, ry = 0, y = 0) {
  const f = new THREE.Group();
  f.position.set(x, y, z);
  f.rotation.y = ry;
  g.add(f);
  return f;
}
export const RIGHT = Math.PI / 2, LEFT = -Math.PI / 2, BACK = Math.PI;

export function win(f, x, y, w, h, { frame = C.white, glass = C.glass, arched = false, pointed = false, shutters = null, sill = null, bars = true } = {}) {
  if (arched) {
    arch(f, frame, x, y - 0.07, 0.03, w + 0.16, h + 0.12, 0.06, 0, pointed);
    arch(f, glass, x, y, 0.05, w, h, 0.06, 0, pointed);
  } else {
    box(f, frame, x, y - 0.07, 0.03, w + 0.14, h + 0.14, 0.06);
    box(f, glass, x, y, 0.05, w, h, 0.06);
    if (bars) { box(f, frame, x, y, 0.07, 0.05, h, 0.04); box(f, frame, x, y + h / 2 - 0.025, 0.07, w, 0.05, 0.04); }
  }
  if (shutters) for (const s of [-1, 1]) box(f, shutters, x + s * (w / 2 + w * 0.26), y, 0.05, w * 0.44, h, 0.07);
  if (sill) box(f, sill, x, y - 0.15, 0.1, w + 0.3, 0.08, 0.2);
}
export function door(f, x, w, h, color, { arched = false, pointed = false, frame = null, y = 0, knob = '#d9b44a' } = {}) {
  if (arched) {
    if (frame) arch(f, frame, x, y, 0.03, w + 0.3, h + 0.2, 0.06, 0, pointed);
    arch(f, color, x, y, 0.06, w, h, 0.07, 0, pointed);
  } else {
    if (frame) box(f, frame, x, y, 0.03, w + 0.22, h + 0.12, 0.06);
    box(f, color, x, y, 0.06, w, h, 0.07);
  }
  if (knob) ball(f, knob, x + w * 0.3, y + h * 0.45, 0.12, 0.05);
}

export function rng(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Stone courses in alternating colours (the "ablaq" of Damascus houses).
export function ablaq(g, x, y, z, w, h, d, n, colors = [C.basalt, C.stone, C.ochre, C.stone]) {
  if (coarse) n = Math.max(2, Math.round(n / 2)); // from far away, half the courses read the same
  for (let i = 0; i < n; i++) box(g, colors[i % colors.length], x, y + (h / n) * i, z, w, h / n, d);
}

// The plot: grass, a strip of sidewalk and a strip of road in front.
export function lot(g, { ground = '#9bd486', paved = '#d9d4c8' } = {}) {
  box(g, ground, 0, -0.3, 0, 7.2, 0.3, 9);
  box(g, paved, 0, -0.3, 4.95, 7.2, 0.34, 0.9);
  box(g, '#6b707c', 0, -0.3, 6.1, 7.2, 0.3, 1.4);
}

export function tree(g, x, z, s = 1, kind = 'round') {
  const r = rng(Math.round(x * 131 + z * 71 + s * 13) + 5);
  if (kind === 'cypress') {
    cyl(g, '#7a5235', x, 0, z, 0.09 * s, 0.5 * s);
    cone(g, '#3c7a4c', x, 0.35 * s, z, 0.5 * s, 3.7 * s);
    return;
  }
  if (kind === 'pine') {
    cyl(g, '#7a5235', x, 0, z, 0.13 * s, 2.7 * s);
    ball(g, '#3f8050', x, 3.0 * s, z, 1.3 * s, 0.5);
    ball(g, '#4a8f5a', x + 0.3 * s, 3.4 * s, z - 0.2 * s, 0.85 * s, 0.5);
    return;
  }
  if (kind === 'palm') {
    for (let i = 0; i < 5; i++) put(g, taperGeo(0.85, 8), mat(i % 2 ? '#9a7a52' : '#8a6c47'), x + i * 0.05 * s, i * 0.62 * s, z, 0.17 * s, 0.66 * s, 0.17 * s);
    const crown = face(g, x + 0.25 * s, z, 0, 3.1 * s);
    for (let i = 0; i < 8; i++) {
      const p = face(crown, 0, 0, (i * Math.PI) / 4);
      put(p, GEO.box, mat(i % 2 ? '#4f9f5a' : '#5fae62'), 0.75 * s, 0, 0, 1.5 * s, 0.05, 0.36 * s).rotation.z = -0.5;
    }
    ball(g, '#8a6c47', x + 0.25 * s, 3.05 * s, z, 0.2 * s);
    return;
  }
  if (kind === 'birch') {
    cyl(g, '#eeeae0', x, 0, z, 0.08 * s, 2.0 * s);
    ball(g, '#9ccf6a', x, 2.5 * s, z, 0.8 * s, 1.1);
    ball(g, '#8cc45e', x + 0.35 * s, 2.0 * s, z + 0.2 * s, 0.5 * s);
    return;
  }
  const olive = kind === 'olive';
  const leaf = olive ? ['#8aa27a', '#7d9670', '#96ad86'] : GREENS;
  cyl(g, olive ? '#6f6250' : '#7a5235', x, 0, z, (olive ? 0.17 : 0.12) * s, 1.2 * s);
  ball(g, leaf[0], x, 1.9 * s, z, 0.95 * s, 0.9);
  ball(g, leaf[1], x + 0.45 * s, 1.6 * s, z + 0.25 * s, 0.6 * s);
  ball(g, leaf[2], x - 0.4 * s, 1.65 * s, z - 0.3 * s, 0.65 * s);
  const fruit = { citrus: '#f08a24', lemon: '#f4d03f', apple: '#d8343a' }[kind];
  if (fruit) {
    for (let i = 0; i < 10; i++) {
      const a = r() * 6.283, b = 0.25 + r() * 1.1;
      ball(g, fruit, x + Math.cos(a) * Math.sin(b) * 0.95 * s, 1.9 * s + Math.cos(b) * 0.82 * s, z + Math.sin(a) * Math.sin(b) * 0.95 * s, 0.11 * s);
    }
  }
}
export function bush(g, x, z, s = 1, color = '#4f9f5a') {
  ball(g, color, x, 0.3 * s, z, 0.45 * s, 0.8);
  ball(g, color, x + 0.28 * s, 0.22 * s, z + 0.1 * s, 0.3 * s, 0.8);
}
export function flowers(g, x, z, w, d, n, colors, seed = 1) {
  const r = rng(seed * 977 + 3);
  for (let i = 0; i < n; i++) {
    const px = x + (r() - 0.5) * w, pz = z + (r() - 0.5) * d;
    ball(g, GREENS[i % 4], px, 0.1, pz, 0.14, 0.9);
    ball(g, colors[i % colors.length], px, 0.25, pz, 0.1);
  }
}
// A climbing plant on a wall face (z = 0 is the wall): leaves with optional flower dots.
export function vine(f, x, y, w, h, n, { dots = null, seed = 1, leaf = GREENS } = {}) {
  const r = rng(seed * 613 + 11);
  for (let i = 0; i < n; i++) {
    const px = x + (r() - 0.5) * w, py = y + r() * h, s = 0.2 + r() * 0.16;
    ball(f, leaf[i % leaf.length], px, py, 0.08, s, 0.8);
    if (dots) ball(f, dots[i % dots.length], px + (r() - 0.5) * 0.2, py + (r() - 0.5) * 0.2, 0.08 + s * 0.8, 0.07);
  }
}
export function pot(g, x, y, z, s = 1, plant = '#4f9f5a', flower = null) {
  taper(g, C.terracotta, x, y, z, 0.16 * s, 0.22 * s, 0.3 * s, 8);
  ball(g, plant, x, y + 0.48 * s, z, 0.24 * s);
  if (flower) for (const [dx, dz] of [[0.12, 0.08], [-0.1, 0.1], [0, -0.14]]) ball(g, flower, x + dx * s, y + 0.62 * s, z + dz * s, 0.08 * s);
}
export function fountain(g, x, z, r = 0.8, y = 0) {
  cyl(g, '#e9e1cf', x, y, z, r, 0.45, 8);
  cyl(g, '#6ec6f0', x, y + 0.3, z, r * 0.82, 0.2, 8);
  cyl(g, '#e9e1cf', x, y, z, 0.1, 1.0, 8);
  taper(g, '#e9e1cf', x, y + 0.95, z, 0.14, 0.36, 0.14, 8);
  ball(g, '#bfe8fa', x, y + 1.14, z, 0.13);
}
// Posts and two rails between two points (axis-aligned).
export function fence(g, x1, z1, x2, z2, { color = C.white, h = 0.75, y = 0, thick = 0.1, gap = 0.3, rails = [0.3, 0.72] } = {}) {
  const len = Math.hypot(x2 - x1, z2 - z1), n = Math.max(1, Math.round(len / gap));
  const alongX = Math.abs(x2 - x1) > Math.abs(z2 - z1);
  for (let i = 0; i <= n; i++) box(g, color, x1 + ((x2 - x1) * i) / n, y, z1 + ((z2 - z1) * i) / n, thick, h, thick);
  for (const t of rails) box(g, color, (x1 + x2) / 2, y + h * t, (z1 + z2) / 2, alongX ? len : thick * 0.6, thick * 0.7, alongX ? thick * 0.6 : len);
}
export const railing = (g, x1, z1, x2, z2, y, h = 0.6, color = C.iron) =>
  fence(g, x1, z1, x2, z2, { color, h, y, thick: 0.05, gap: 0.24, rails: [0.12, 0.96] });

// A wooden frame with a vine on top (the grape "areesheh").
export function pergola(g, x, z, w, d, h, { y = 0, wood = C.wood, grapes = true, seed = 1 } = {}) {
  const r = rng(seed * 331 + 7);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, wood, x + (sx * (w - 0.14)) / 2, y, z + (sz * (d - 0.14)) / 2, 0.14, h, 0.14);
  for (const sz of [-1, 1]) box(g, wood, x, y + h, z + (sz * (d - 0.14)) / 2, w + 0.3, 0.1, 0.12);
  const slats = Math.max(2, Math.round(w / 0.5));
  for (let i = 0; i <= slats; i++) box(g, wood, x - w / 2 + (w * i) / slats, y + h + 0.1, z, 0.08, 0.07, d + 0.3);
  const n = Math.round(w * d * 2.2);
  for (let i = 0; i < n; i++) {
    const px = x + (r() - 0.5) * w, pz = z + (r() - 0.5) * d;
    ball(g, GREENS[i % 4], px, y + h + 0.22, pz, 0.3 + r() * 0.15, 0.45);
    if (grapes && i % 3 === 0) ball(g, '#6b3fa0', px, y + h - 0.12, pz, 0.11, 1.5);
  }
}

export function car(g, x, z, color = '#d64545', ry = 0) {
  const c = face(g, x, z, ry);
  box(c, color, 0, 0.2, 0, 1.25, 0.42, 2.5);
  box(c, C.glassDark, 0, 0.62, -0.15, 1.1, 0.4, 1.3);
  box(c, color, 0, 1.0, -0.15, 1.12, 0.05, 1.32);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    cyl(c, '#26282d', sx * 0.66 + (sx > 0 ? 0 : 0.2), 0.28, sz * 0.8, 0.28, 0.2).rotation.z = Math.PI / 2;
  }
  box(c, '#f6e6a8', 0.4, 0.38, 1.26, 0.25, 0.12, 0.03);
  box(c, '#f6e6a8', -0.4, 0.38, 1.26, 0.25, 0.12, 0.03);
  for (const sx of [-1, 1]) box(c, '#e5362b', sx * 0.42, 0.4, -1.26, 0.22, 0.1, 0.03);
}

// A see-through wooden screen (mashrabiya): criss-cross lines on a canvas.
const latticeCache = new Map();
export function lattice(base = '#8a5a34', line = '#4a2c18', repeatX = 4, repeatY = 3) {
  const key = [base, line, repeatX, repeatY].join('/');
  if (!latticeCache.has(key)) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = base; ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = line; ctx.lineWidth = 5;
    for (let i = -64; i <= 64; i += 16) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 64, 64); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i + 64, 0); ctx.lineTo(i, 64); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    const m = new THREE.MeshLambertMaterial({ map: tex });
    m.userData.tint = new THREE.Color(base).lerp(new THREE.Color(line), 0.4); // its colour when baked without the picture
    latticeCache.set(key, m);
  }
  return latticeCache.get(key);
}

// A shape's corners, each once, and the triangles between them. houseMat takes
// every face's direction from the picture itself (flatShading), so corners
// need no copy per face: a box is 8 corners, not 36.
const cornerCache = new WeakMap();
function cornersOf(geo) {
  let out = cornerCache.get(geo);
  if (out) return out;
  const p = geo.attributes.position, index = geo.index, n = index ? index.count : p.count;
  const seen = new Map(), at = [], tri = new Uint32Array(n);
  for (let k = 0; k < n; k++) {
    const i = index ? index.getX(k) : k, x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const key = Math.round(x * 1e6) + ',' + Math.round(y * 1e6) + ',' + Math.round(z * 1e6);
    let j = seen.get(key);
    if (j === undefined) { j = at.length / 3; seen.set(key, j); at.push(x, y, z); }
    tri[k] = j;
  }
  out = { at: new Float32Array(at), tri };
  cornerCache.set(geo, out);
  return out;
}

// Turns a whole house into ONE geometry with a colour per corner, so the city
// can draw thousands of copies cheaply. `far` keeps only the big parts, for
// houses that are a long way from the camera. Every corner also carries a
// "glow" value (see shine above), so windows can light up at night.
export function bake(build, options = {}, far = false) {
  const g = new THREE.Group();
  coarse = far;
  try { build(g, { ...options, bare: true }); } finally { coarse = false; }
  g.updateMatrixWorld(true);
  const parts = []; // counted first, then written into buffers of the exact size: the railway alone is 28,000 sleepers
  let verts = 0, tris = 0, brightest = 0;
  const v = new THREE.Vector3(), bounds = new THREE.Box3(), size = new THREE.Vector3(), slab = new THREE.Matrix4();
  g.traverse((m) => {
    if (!m.isMesh) return;
    let geo = m.geometry;
    if (!geo.boundingBox) geo.computeBoundingBox();
    bounds.copy(geo.boundingBox).applyMatrix4(m.matrixWorld).getSize(size);
    const d = [size.x, size.y, size.z].sort((a, b) => b - a);
    const c = m.material.userData.tint || m.material.color;
    const lit = GLOW.get(c.getHex()) || 0;
    let world = m.matrixWorld;
    if (far) { // keep walls, roofs, big openings and tree crowns; drop everything small
      const keep = geo === GEO.ball ? d[0] >= 1.3 : (geo === GEO.box && d[0] >= 2.2 && d[1] >= 0.2) || d[0] * d[1] >= 3;
      if (!keep) {
        if (!lit || d[0] * d[1] < 0.5) return;
        // a window: from far away a plain lit panel is enough, so the city still twinkles at night
        geo = GEO.box;
        world = slab.clone().makeScale(size.x, size.y, size.z).setPosition((bounds.min.x + bounds.max.x) / 2, bounds.min.y, (bounds.min.z + bounds.max.z) / 2);
      }
    }
    if (geo === GEO.ball && (far || d[0] < 0.9)) geo = GEO.ballLow; // only tree crowns stay round
    const shape = cornersOf(geo);
    parts.push({ shape, world, c, lit });
    verts += shape.at.length / 3;
    tris += shape.tri.length;
    brightest = Math.max(brightest, c.r, c.g, c.b);
  });
  const short = brightest <= 1; // colours fit 16 bits unless one is brighter than white
  const pos = new Float32Array(verts * 3), glow = new Float32Array(verts);
  const col = short ? new Uint16Array(verts * 3) : new Float32Array(verts * 3), white = short ? 65535 : 1;
  const index = verts < 65536 ? new Uint16Array(tris) : new Uint32Array(tris);
  let nv = 0, ni = 0;
  for (const { shape: { at, tri }, world, c, lit } of parts) {
    for (let k = 0; k < tri.length; k++) index[ni++] = nv + tri[k];
    const r = c.r * white + (short ? 0.5 : 0), gr = c.g * white + (short ? 0.5 : 0), b = c.b * white + (short ? 0.5 : 0);
    for (let k = 0; k < at.length; k += 3) {
      v.set(at[k], at[k + 1], at[k + 2]).applyMatrix4(world);
      const o = nv * 3;
      pos[o] = v.x; pos[o + 1] = v.y; pos[o + 2] = v.z;
      col[o] = r; col[o + 1] = gr; col[o + 2] = b;
      glow[nv++] = lit;
    }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3, short));
  out.setAttribute('glow', new THREE.BufferAttribute(glow, 1));
  out.setIndex(new THREE.BufferAttribute(index, 1));
  return out;
}
