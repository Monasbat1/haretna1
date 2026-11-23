// «السعودية» (the user, 2026-11-22: «بدنا نبني حارة السعودية و نحط معلم برج الرياض»,
// then «برج المملكة»): the village of Saudi Arabia round the Kingdom Centre of Riyadh.
//  - the house: Najdi mud brick, two floors, stepped crenellations on the parapet,
//    rows of small triangular vents, a painted wooden door, a palm in the yard;
//  - the landmark: the Kingdom Centre, its glass body narrowing as it rises and opening
//    at the top into a parabola, the Sky Bridge across the opening; at its foot the
//    mall, a plaza with palms and fountains, the flag. Its opening glows at night.
import * as THREE from 'three';
import { C, box, cyl, cone, ball, face, win, door, lot, tree, pot, rng, shine, put, RIGHT, LEFT, BACK } from './kit.js';
import { merlons, crowd, lamp, flagPole } from './world.js';

// ---------------------------------------------------------------- the Najdi house
const LOOKS = [
  { mud: '#c9a173', trim: '#b38a5c', door: '#2f6f8f', paint: '#e2b13c' },
  { mud: '#d4ae80', trim: '#bd9566', door: '#8a3b2e', paint: '#3f8f6a' },
  { mud: '#bf956a', trim: '#a87f55', door: '#4f6b3a', paint: '#d8553f' },
];
const VENT = '#3a2c22';

export function saudiHouse(g, v = {}) {
  const k = { ...LOOKS[0], ...v };
  if (!v.bare) lot(g, { ground: '#e2cfa6' });
  const W = 6.2, D = 6.0, F = 3.0, z0 = -1.4;
  box(g, k.mud, 0, 0, z0, W, F, D);                         // ground floor
  box(g, k.mud, -0.6, F, z0 - 0.4, W - 1.2, F, D - 0.8);     // upper floor, set back
  box(g, k.trim, 0, F - 0.12, z0, W + 0.1, 0.14, D + 0.1);   // the mud band between floors
  // the stepped crenellations on both parapets
  for (const [y, w, d, dx, dz] of [[F, W, D, 0, z0], [2 * F, W - 1.2, D - 0.8, -0.6, z0 - 0.4]]) {
    merlons(g, k.mud, dx - w / 2 + 0.2, dz + d / 2 - 0.15, dx + w / 2 - 0.2, dz + d / 2 - 0.15, y, { w: 0.4, h: 0.45, gap: 0.8, thick: 0.25, stepped: true });
    merlons(g, k.mud, dx - w / 2 + 0.15, dz - d / 2 + 0.2, dx - w / 2 + 0.15, dz + d / 2 - 0.2, y, { w: 0.4, h: 0.45, gap: 0.8, thick: 0.25, stepped: true });
  }
  const f = face(g, 0, z0 + D / 2);
  // the painted door, its frame, the small windows and the triangular vents
  box(f, k.trim, 1.3, 0, 0.02, 1.7, 2.45, 0.06);
  door(f, 1.3, 1.3, 2.25, k.door, { knob: '#d9b44a' });
  for (let i = 0; i < 3; i++) box(f, k.paint, 1.3, 0.5 + i * 0.6, 0.12, 1.05, 0.12, 0.02);
  for (const x of [-2.0, -0.6]) { box(f, '#5a3620', x, 1.1, 0.03, 0.75, 0.9, 0.06); box(f, VENT, x, 1.15, 0.06, 0.55, 0.7, 0.03); }
  const up = face(g, -0.6, z0 - 0.4 + (D - 0.8) / 2, 0, F);
  win(up, -1.3, 0.9, 0.8, 0.9, { frame: '#5a3620', glass: '#7fa8bf', bars: false });
  win(up, 0.6, 0.9, 0.8, 0.9, { frame: '#5a3620', glass: '#7fa8bf', bars: false });
  for (const [ff, y, n] of [[f, F - 0.55, 7], [up, F - 0.55, 5]]) for (let i = 0; i < n; i++) { // the row of little triangles under the parapet
    const t = put(ff, new THREE.ConeGeometry(0.12, 0.22, 3), VENT, -W / 2 + 0.6 + i * ((W - 1.2) / (n - 1)) - (ff === up ? 0.6 : 0), y, 0.05);
    t.rotation.z = Math.PI;
  }
  tree(g, -2.4, 3.3, 0.8, 'palm');
  pot(g, 2.6, 0, 2.2, 1.1, C.leaf, k.paint);
}
saudiHouse.looks = LOOKS;
saudiHouse.top = 6.8;
saudiHouse.flag = [1.6, 6.45, -2.5];

// ---------------------------------------------------------------- the Kingdom Centre
const H = 118, BASE_W = 17, DEPTH = 19, OPEN_Y = 70; // height, half-width at the foot, thickness, where the opening starts
const outer = (y) => BASE_W * (1 - 0.56 * (y / H) ** 2);            // the body narrowing as it rises
const inner = (y) => (y <= OPEN_Y ? 0 : 6.3 * Math.sqrt((y - OPEN_Y) / (H - OPEN_Y))); // half the opening
const GLASS = '#8db1c6', MULLION = '#d7e1e7', STEEL = '#9aa3ad';
const BRIDGE_Y = H - 6;
export const KINGDOM = { H, BRIDGE_Y, OPEN_Y, outer, inner, DEPTH, TZ: -6 };

export function kingdomCentre(g) {
  const rand = rng(31), TZ = KINGDOM.TZ;
  // the plaza and its paving lines
  box(g, '#e3dccd', 0, 0, 0, 66, 0.12, 42);
  for (let x = -30; x <= 30; x += 6) box(g, '#d2c9b6', x, 0.12, 0, 0.15, 0.01, 42);
  // the tower: its silhouette (the body and the parabolic opening at the top) pushed out to its thickness
  const s = new THREE.Shape(), N = 40;
  s.moveTo(-BASE_W, 0);
  for (let i = 1; i <= N; i++) { const y = (i / N) * H; s.lineTo(-outer(y), y); }
  for (let i = N; i >= 0; i--) { const y = OPEN_Y + (i / N) * (H - OPEN_Y); s.lineTo(-inner(y), y); }
  for (let i = 1; i <= N; i++) { const y = OPEN_Y + (i / N) * (H - OPEN_Y); s.lineTo(inner(y), y); }
  for (let i = N; i >= 0; i--) { const y = (i / N) * H; s.lineTo(outer(y), y); }
  const body = new THREE.ExtrudeGeometry(s, { depth: DEPTH, bevelEnabled: false, curveSegments: 4 }).translate(0, 0, -DEPTH / 2);
  put(g, body, GLASS, 0, 0.1, TZ);
  // its glass skin: floor bands and mullions on both broad faces
  for (const side of [-1, 1]) {
    const zf = TZ + side * (DEPTH / 2 + 0.03);
    for (let y = 4; y < H - 1; y += 3.6) {
      const o = outer(y), i = inner(y);
      if (i > 0) for (const sx of [-1, 1]) box(g, MULLION, sx * (o + i) / 2, y, zf, o - i, 0.18, 0.06);
      else box(g, MULLION, 0, y, zf, 2 * o, 0.18, 0.06);
    }
    for (let x = -BASE_W + 1.4; x < BASE_W - 1; x += 2.3) {
      const ax = Math.abs(x), yo = H * Math.sqrt(Math.max(0, (1 - ax / BASE_W) / 0.56));
      const top = Math.min(H, yo, ax < 6.3 ? OPEN_Y + (H - OPEN_Y) * (ax / 6.3) ** 2 : H);
      box(g, MULLION, x, 0.1, zf, 0.12, top - 0.2, 0.06);
    }
  }
  // the Sky Bridge across the opening near the top
  box(g, STEEL, 0, BRIDGE_Y, TZ, 2 * inner(BRIDGE_Y) + 1.2, 2.6, 5.5);
  box(g, '#5d7f96', 0, BRIDGE_Y + 0.5, TZ, 2 * inner(BRIDGE_Y) + 1.0, 1.4, 5.7);
  // the mall at its foot, the entrance canopy
  for (const sx of [-1, 1]) { box(g, '#ede8dd', sx * 22, 0.1, TZ + 2, 14, 11, 22); box(g, GLASS, sx * 22, 2, TZ + 13.05, 12, 7, 0.1); }
  box(g, '#ede8dd', 0, 0.1, TZ + 12, 32, 6, 4);
  box(g, '#f5f2ea', 0, 6, TZ + 15, 18, 0.4, 7);
  for (const x of [-8, 8]) cyl(g, STEEL, x, 0.1, TZ + 18, 0.18, 5.9, 8);
  box(g, '#3a3f47', 0, 0.1, TZ + 14.05, 8, 4.2, 0.1); // the doors
  // the plaza in front: two fountains, palms in rows, lamps, people, a few cars
  for (const x of [-14, 14]) {
    cyl(g, '#e9e1cf', x, 0.1, 14, 3.2, 0.6, 16); cyl(g, '#6ec6f0', x, 0.3, 14, 2.8, 0.45, 16);
    cyl(g, '#e9e1cf', x, 0.1, 14, 0.25, 1.8, 8); ball(g, '#bfe8fa', x, 2.0, 14, 0.35);
  }
  for (let x = -30; x <= 30; x += 6) for (const z of [8, 19]) if (Math.abs(x) > 3) tree(g, x, z, 1.25, 'palm');
  for (let x = -27; x <= 27; x += 9) lamp(g, x, 0.1, 11, { h: 4 });
  crowd(g, 40, [-30, 30, 9, 20], rand, { y: 0.12 });
  kingdomCentre.flag = { code: 'sa', ...flagPole(g, 27, 0.1, 13, 18) };
}
kingdomCentre.label = 'برج المملكة';
kingdomCentre.top = H + 26; // over the portraits on its top
kingdomCentre.size = [66, 42];
kingdomCentre.floodlight = { color: '#cfe6ff', at: [0, 40, 30] };

// ---------------------------------------------------------------- the portraits on its top
// King Salman and Crown Prince Mohammed bin Salman (the user's ask and pictures, 2026-11-22:
// «حط صورة الملك و ولي العهد فوق البرج»), each in a gold royal frame on green velvet with a
// crown, standing on one of the tower's two horns (the King on the right, as in Jordan), their
// names below, «المملكة العربية السعودية» on the Sky Bridge between them. The frames are baked
// here; the pictures and the words are drawn by the city (buildRoyal, SAUDI_ROYAL).
const SGOLD = shine('#d4af37', 2.6), SGOLD2 = shine('#c9a032', 2.3), SJEWEL = shine('#1aa35a', 2.8);
const SVELVET = '#0d5c2e', SPW = 11.6, SPH = 14.5;
const hornX = (inner(H) + outer(H)) / 2, FRAME_Z = KINGDOM.TZ + 0.6, PIC_Y = H + 4.2 + SPH / 2; // the name plate clear of the plinth
export const SAUDI_ROYAL = {
  frames: [
    { who: 'king', x: hornX + 1.3, y: PIC_Y, w: SPW, h: SPH, plaque: 'خادم الحرمين الشريفين الملك سلمان' },
    { who: 'prince', x: -hornX - 1.3, y: PIC_Y, w: SPW, h: SPH, plaque: 'ولي العهد الأمير محمد بن سلمان' },
  ],
  z: FRAME_Z + 0.48,
  plaque: { dy: -(SPH / 2 + 2.3), w: SPW + 1.2, h: 1.5 }, // under the frame's corner rosettes
  banner: { x: 0, y: BRIDGE_Y - 2.0, w: 2 * inner(BRIDGE_Y - 2.0) - 0.4, h: 2.4, z: KINGDOM.TZ + 3.1 },
};
function saudiCrown(g, x, y, z, s) {
  box(g, SGOLD, x, y, z, 4.0 * s, 0.9 * s, 0.9 * s);
  for (let i = -2; i <= 2; i++) {
    const h = (i === 0 ? 2.3 : Math.abs(i) === 1 ? 1.8 : 1.3) * s;
    cone(g, SGOLD2, x + i * 0.88 * s, y + 0.9 * s, z, 0.38 * s, h);
    ball(g, i === 0 ? SJEWEL : SGOLD, x + i * 0.88 * s, y + 0.9 * s + h, z, 0.24 * s);
  }
}
export function saudiFrames(g) {
  const Z = FRAME_Z;
  for (const f of SAUDI_ROYAL.frames) {
    const { x } = f, cy = f.y;
    box(g, SGOLD2, x, H, Z - 0.6, SPW + 1.8, 0.8, 3.2);                         // the gold plinth on the horn (a little out past it)
    box(g, STEEL, x, H - 4, Z - 1.2, 1.6, 4.2, 1.6);                           // and its post into the tower
    box(g, '#1c1410', x, cy - SPH / 2 - 0.9, Z - 0.5, SPW + 2.6, SPH + 2.2, 0.6); // the back
    for (const [dx, dy, w, h] of [[0, -SPH / 2 - 1.1, SPW + 2.4, 1.1], [0, SPH / 2, SPW + 2.4, 1.1], [-SPW / 2 - 0.6, -SPH / 2, 1.1, SPH], [SPW / 2 + 0.6, -SPH / 2, 1.1, SPH]]) box(g, SGOLD, x + dx, cy + dy, Z, w, h, 0.9);
    for (const [dx, dy, w, h] of [[0, -SPH / 2 - 0.05, SPW + 0.5, 0.32], [0, SPH / 2 - 0.27, SPW + 0.5, 0.32], [-SPW / 2 - 0.14, -SPH / 2, 0.32, SPH], [SPW / 2 + 0.14, -SPH / 2, 0.32, SPH]]) box(g, SVELVET, x + dx, cy + dy, Z + 0.1, w, h, 0.7);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) { ball(g, SGOLD2, x + sx * (SPW / 2 + 0.6), cy + sy * (SPH / 2 + 0.6), Z + 0.5, 0.85); ball(g, SJEWEL, x + sx * (SPW / 2 + 0.6), cy + sy * (SPH / 2 + 0.6), Z + 1.2, 0.32); }
    saudiCrown(g, x, cy + SPH / 2 + 1.1, Z, 1.15);
    const P = SAUDI_ROYAL.plaque;
    box(g, SGOLD, x, cy + P.dy - P.h / 2 - 0.22, Z + 0.2, P.w + 0.45, P.h + 0.45, 0.5);  // the name plate
  }
  const B = SAUDI_ROYAL.banner;
  box(g, SGOLD, 0, B.y - B.h / 2 - 0.25, B.z - 0.3, B.w + 0.5, B.h + 0.5, 0.3);       // the banner's gold plate on the bridge
}
kingdomCentre.royal = saudiFrames;

// At night: the opening and the bridge glow, the faces washed blue from below.
export function kingdomLights() {
  const group = new THREE.Group(), mats = [];
  const glow = (color, strength) => {
    const m = new THREE.MeshBasicMaterial({ color, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
    mats.push([m, strength]);
    return m;
  };
  const shade = (geo, f) => {
    const p = geo.attributes.position, col = [];
    for (let i = 0; i < p.count; i++) { const v = f(p.getX(i), p.getY(i), p.getZ(i), i); col.push(v, v, v); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return geo;
  };
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.raycast = () => {}; group.add(o); return o; };
  const TZ = KINGDOM.TZ, edge = glow('#7fd0ff', 0.95), bridge = glow('#c9a0ff', 0.9), wash = glow('#6fa8ff', 0.3);
  // a strip of light along the inside of the opening, on both faces
  for (const side of [-1, 1]) for (const sx of [-1, 1]) {
    const pts = [];
    for (let i = 0; i <= 24; i++) { const y = OPEN_Y + (i / 24) * (H - OPEN_Y); pts.push(new THREE.Vector3(sx * inner(y), y, 0)); }
    const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.45, 6, false);
    add(shade(tube, () => 1), edge, 0, 0, TZ + side * (DEPTH / 2 + 0.2));
  }
  add(shade(new THREE.BoxGeometry(2 * inner(BRIDGE_Y) + 1.6, 3, 6), () => 1), bridge, 0, BRIDGE_Y + 1.3, TZ);
  for (const side of [-1, 1]) add(shade(new THREE.PlaneGeometry(2 * BASE_W, 60, 1, 6).translate(0, 30, 0), (x, y) => 0.15 + 0.85 * (1 - y / 60) ** 1.5), wash, 0, 0.2, TZ + side * (DEPTH / 2 + 0.25));
  return { group, mats };
}
kingdomCentre.lights = kingdomLights;
