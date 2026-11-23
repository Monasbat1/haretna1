// «بوليفارد العبدلي»: Amman's new city centre (the user's ask, 2026-11-19),
// in Jordan's village on 2 x 2 blocks kept for it (city.js ABDALI). 64 x 40,
// +z towards the visitor:
//  - the boulevard itself, east to west across the middle: pale paving, a
//    water channel with fountains, palms, benches, lamps, café umbrellas;
//  - either side, buildings of white Amman stone and glass, shops below;
//  - behind, the Rotana hotel: a tall glass tower with rounded ends and white
//    bands, its crown and mast lit in changing colours at night (update(t));
//    and a second, lower glass tower beside it.
import * as THREE from 'three';
import { C, box, cyl, cone, ball, face, win, door, rng, shine, tree, ramp, RIGHT, LEFT, BACK } from './kit.js';
import { crowd, person, lamp } from './world.js';

const PAVE = '#ece5d6', PAVE2 = '#ddd3bf', STONE = '#f1ebdf', STONE2 = '#e3dacb';
const GLASS = '#5d8fae';                  // lit at night like a window (models/kit.js)
const TGLASS = '#4f86ab', BAND = '#f4f6f8';
const SHOP = '#6f8fa3';                   // shop windows, lit at night
const WATER = '#6ec6f0';
const Y = 0.2;
export const ROT = { x: -17, z: -11, w: 15, d: 9.5, base: 9, h: 96 };   // the Rotana tower: centre, plan, podium height, glass height
export const GATE = { x: 22, z: -12, w: 10, h: 52 };                     // the second tower
export const BOULEVARD = { z0: -2, z1: 8 };

// A building of stone and glass on the boulevard: shops on the ground, flats or offices above.
function block(g, x, z, w, d, floors, faceZ, look = 0) {
  const st = look % 2 ? STONE2 : STONE, H = 3.4 + (floors - 1) * 3.1;
  box(g, st, x, Y, z, w, H, d);
  box(g, '#d4cab8', x, Y + H, z, w + 0.3, 0.35, d + 0.3);
  const f = face(g, x, z + (faceZ > 0 ? d / 2 : -d / 2), faceZ > 0 ? 0 : BACK, Y);
  // the shops: a glass front all along, a canopy over it
  box(f, '#3b3f47', 0, 0, 0.02, w - 0.8, 3.0, 0.06);
  for (let k = -w / 2 + 1.6; k < w / 2 - 1; k += 2.6) box(f, SHOP, k, 0.15, 0.06, 2.2, 2.6, 0.05);
  box(f, look % 3 === 0 ? '#2f6f9f' : look % 3 === 1 ? '#b2263c' : '#2e7d5b', 0, 3.0, 0.7, w - 0.6, 0.18, 1.4);
  // the floors above: bands of glass between the stone
  for (let i = 1; i < floors; i++) {
    const y = 3.4 + (i - 1) * 3.1;
    box(f, GLASS, 0, y + 0.7, 0.04, w - 1.6, 1.8, 0.05);
    for (let k = -w / 2 + 0.8; k <= w / 2 - 0.8; k += 2.2) box(f, st, k, y + 0.6, 0.08, 0.25, 2.0, 0.08);
  }
  for (const [sx, ry] of [[w / 2, RIGHT], [-w / 2, LEFT]]) {
    const s = face(g, x + sx, z, ry, Y);
    for (let i = 1; i < floors; i++) for (let k = -d / 2 + 1.5; k < d / 2 - 1; k += 2.4) win(s, k, 3.4 + (i - 1) * 3.1 + 0.6, 1.4, 1.6, { frame: STONE2, glass: GLASS, bars: false });
  }
}

// The Rotana: a glass shaft with rounded ends, white bands at every few floors, a stone spine up the front.
function rotana(g) {
  const { x, z, w, d, base, h } = ROT, r = d / 2, core = w - d;
  // the podium: the lobby, the entrance canopy
  box(g, STONE, x, Y, z, w + 7, base, d + 6);
  box(g, '#d4cab8', x, Y + base, z, w + 7.4, 0.4, d + 6.4);
  const pf = face(g, x, z + (d + 6) / 2, 0, Y);
  box(pf, '#3b3f47', 0, 0, 0.02, w + 3, 6.2, 0.06);
  for (let k = -w / 2 - 0.6; k <= w / 2 + 0.6; k += 2.4) box(pf, SHOP, k, 0.2, 0.06, 2.0, 5.6, 0.05);
  door(pf, 0, 2.4, 3.2, '#2b2d33', { frame: '#c9a24a', knob: null });
  box(pf, '#c9a24a', 0, 4.6, 2.2, 10, 0.3, 4.4);                                   // the gold canopy
  for (const s of [-1, 1]) cyl(pf, '#c9a24a', s * 4.6, 0, 4.0, 0.15, 4.6, 8);
  // the shaft
  const y0 = Y + base + 0.4;
  box(g, TGLASS, x, y0, z, core, h, d);
  for (const s of [-1, 1]) cyl(g, TGLASS, x + s * core / 2, y0, z, r, h, 18);
  for (let y = 3; y < h; y += 3) {                                                // the floors: a thin white line each, a broad band every eighth
    const t = y % 24 === 0 ? 0.55 : 0.12;
    box(g, BAND, x, y0 + y, z, core, t, d + 0.08);
    for (const s of [-1, 1]) cyl(g, BAND, x + s * core / 2, y0 + y, z, r + 0.04, t, 18);
    box(g, GLASS, x, y0 + y + 0.6, z + d / 2 + 0.02, core - 0.6, 1.5, 0.04);      // a row of lit windows on the front and back
    box(g, GLASS, x, y0 + y + 0.6, z - d / 2 - 0.02, core - 0.6, 1.5, 0.04);
  }
  box(g, STONE, x, y0, z + d / 2 + 0.25, 1.4, h + 4, 0.5);                       // the stone spine up the front, rising past the top
  // the crown: two setbacks, a sloping glass top, the mast
  const top = y0 + h;
  box(g, TGLASS, x, top, z, core - 1, 4, d - 1.2);
  for (const s of [-1, 1]) cyl(g, TGLASS, x + s * (core - 1) / 2, top, z, r - 0.6, 4, 18);
  box(g, BAND, x, top + 4, z, core + 0.4, 0.4, d - 0.6);
  ramp(g, TGLASS, x, top + 4.4, z, core + 4, 6, d - 2.2, 0);                       // the top sloping up to the east
  cyl(g, '#d9dde3', x + core / 2 + 1.2, top + 10.4, z, 0.25, 12, 8);
  ROT.top = top + 22.4;
}

function gateTower(g) {
  const { x, z, w, h } = GATE;
  box(g, STONE2, x, Y, z, w + 3, 5, w + 3);
  box(g, TGLASS, x, Y + 5, z, w, h, w);
  for (let y = 4; y < h; y += 4) box(g, BAND, x, Y + 5 + y, z, w + 0.1, 0.18, w + 0.1);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, STONE, x + sx * (w / 2), Y + 5, z + sz * (w / 2), 0.45, h, 0.45); // stone fins up the corners
  for (const [fx, fz, ry] of [[x, z + w / 2, 0], [x, z - w / 2, BACK], [x + w / 2, z, RIGHT], [x - w / 2, z, LEFT]]) {
    const f = face(g, fx, fz, ry, Y + 5);
    for (let y = 1; y < h - 2; y += 4) box(f, GLASS, 0, y, 0.03, w - 1.4, 2.2, 0.04);
  }
  box(g, BAND, x, Y + 5 + h, z, w + 0.4, 1.2, w + 0.4);
  cyl(g, '#d9dde3', x, Y + 6.2 + h, z, 0.15, 6, 6);
}

export function abdali(g) {
  const rand = rng(2019); // the boulevard opened about 2014-2019
  box(g, PAVE, 0, 0, 0, 64, 0.2, 40);
  // the boulevard: patterned paving, the water channel down the middle with its fountains
  const { z0, z1 } = BOULEVARD, zm = (z0 + z1) / 2;
  for (let x = -31; x <= 31; x += 2) box(g, PAVE2, x, Y, zm, 0.12, 0.02, z1 - z0);
  box(g, '#bfb6a4', 0, Y, zm, 60, 0.3, 1.8);
  box(g, WATER, 0, Y + 0.3, zm, 59.4, 0.04, 1.3);
  for (let x = -26; x <= 26; x += 6.5) { cyl(g, '#d9dde3', x, Y + 0.3, zm, 0.12, 0.6, 6); ball(g, '#bfe9fb', x, Y + 1.0, zm, 0.3, 1.6); }
  // palms, benches, lamps and café umbrellas along it
  for (let x = -29; x <= 29; x += 5.8) for (const zz of [z0 + 0.8, z1 - 0.8]) tree(face(g, 0, 0, 0, Y), x, zz, 1.25, 'palm');
  for (let x = -26.1; x <= 26; x += 5.8) for (const zz of [zm - 2.2, zm + 2.2]) { box(g, '#7b4b2a', x, Y + 0.4, zz, 1.6, 0.1, 0.5); box(g, '#3b3f47', x, Y, zz, 1.4, 0.4, 0.3); }
  for (let x = -23.2; x <= 24; x += 11.6) for (const zz of [z0 + 0.3, z1 - 0.3]) lamp(g, x, Y, zz, { h: 4.2, light: '#f6d77a' });
  for (const [x, zz, c] of [[-8, 9.6, '#b2263c'], [-5, 9.6, '#f4f1ea'], [6, 9.6, '#2f6f9f'], [9, 9.6, '#f4f1ea'], [14, -3.4, '#b2263c'], [17, -3.4, '#f4f1ea']]) {
    cyl(g, '#d9dde3', x, Y, zz, 0.05, 2.3, 6);
    cone(g, c, x, Y + 2.0, zz, 1.3, 0.6);
    cyl(g, '#f4f1ea', x, Y, zz, 0.55, 0.75, 10);
    for (const a of [0, 2.1, 4.2]) box(g, '#2b2d33', x + Math.cos(a) * 0.95, Y, zz + Math.sin(a) * 0.95, 0.4, 0.45, 0.4);
  }
  // the north side: the Rotana, the second tower, a building between them
  rotana(g);
  gateTower(g);
  block(g, 4, -8.5, 12, 9, 6, 1, 1);
  // the south side: a row of buildings facing the boulevard, a passage between them
  block(g, -22, 14.5, 18, 10, 5, -1, 0);
  block(g, -2, 14.5, 16, 10, 4, -1, 2);
  block(g, 18, 14.5, 20, 10, 6, -1, 1);
  for (const x of [-11.5, 7.5]) { box(g, PAVE2, x, Y, 14.5, 4.5, 0.03, 10); lamp(g, x, Y, 18, { h: 3.4 }); }
  // people strolling
  crowd(g, 46, [-30, 30, z0 + 0.6, z1 - 0.6], rand, { y: Y, free: (x, z) => Math.abs(z - zm) > 1.4 });
  crowd(g, 10, [-30, 30, z1 + 0.4, z1 + 2.8], rand, { y: Y });
}
abdali.label = 'بوليفارد العبدلي';
abdali.top = 28;   // where its name floats: over the boulevard, the towers rise far above
abdali.size = [64, 40];
abdali.floodlight = { color: '#ffd9a0', at: [0, 10, 10] };

// By night: the Rotana's crown and mast in slowly changing colours, lines of
// light up its rounded ends, the second tower's top band, strings of lights
// along the boulevard, the fountains glowing, warm pools under the lamps.
export function abdaliLights() {
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
  const pool = (r) => shade(new THREE.CircleGeometry(r, 24).rotateX(-Math.PI / 2), (x, y, z, i) => (i === 0 ? 1 : 0));
  const blob = (r) => shade(new THREE.SphereGeometry(r, 14, 8), (x, y, z) => Math.max(0, 1 - Math.hypot(x, y, z) / r) ** 2);

  // the Rotana: its crown wrapped in colour, a glow round the top, lines up its rounded ends
  const { x, z, w, d, base, h } = ROT, core = w - d, top = Y + base + 0.4 + h;
  const crown = glow('#7a5cff', 0.55); // not more, or the colour washes out to white
  add(shade(new THREE.BoxGeometry(core + d + 0.5, 10.5, d + 0.5).translate(0, 5.25, 0), (px, py) => 0.55 + 0.45 * (py / 10.5)), crown, x, top, z);
  const halo = glow('#7a5cff', 0.9, { side: THREE.BackSide });
  add(blob(24), halo, x, top + 7, z);
  const mastTip = add(blob(2.4), glow('#ff3030', 1, { side: THREE.BackSide }), x + core / 2 + 1.2, top + 22.4, z);
  // lines of light up the rounded ends and the spine, in the crown's colour
  const lineMat = glow('#7a5cff', 0.8, { vertexColors: false });
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.5, h, 0.5).translate(0, h / 2, 0), lineMat, x + s * (w / 2 + 0.05), Y + base + 0.4, z);
  // the glass shaft faintly lit from inside, brighter up high
  add(shade(new THREE.BoxGeometry(w + 0.2, h, d + 0.2).translate(0, h / 2, 0), (px, py) => 0.15 + 0.35 * (py / h)), glow('#ffe2b0', 0.22), x, Y + base + 0.4, z);
  add(new THREE.BoxGeometry(1.6, h + 4, 0.2).translate(0, (h + 4) / 2, 0), glow('#ffe9c0', 0.35, { vertexColors: false }), x, Y + base + 0.4, z + d / 2 + 0.55);
  // the gold canopy and the lobby
  add(pool(7), glow('#ffcf80', 0.55), x, Y + 0.06, z + (d + 6) / 2 + 2.5);
  // the second tower's top
  const G = GATE;
  add(shade(new THREE.BoxGeometry(G.w + 0.6, 1.4, G.w + 0.6).translate(0, 0.7, 0), () => 0.8), glow('#4fd8ff', 0.7), G.x, Y + 5 + G.h - 0.1, G.z);
  // the boulevard: the fountains glowing, warm pools under the lamps, strings of little lights across it
  const { z0, z1 } = BOULEVARD, zm = (z0 + z1) / 2;
  add(shade(new THREE.PlaneGeometry(59.4, 1.3).rotateX(-Math.PI / 2), () => 0.8), glow('#6fe0ff', 0.6), 0, Y + 0.36, zm);
  for (let xx = -26; xx <= 26; xx += 6.5) add(blob(1.6), glow('#9fefff', 0.6, { side: THREE.BackSide }), xx, Y + 1.1, zm);
  for (let xx = -23.2; xx <= 24; xx += 11.6) for (const zz of [z0 + 0.3, z1 - 0.3]) add(pool(4.2), glow('#ffc070', 0.45), xx, Y + 0.05, zz);
  const dots = [];
  for (let xx = -28; xx <= 28; xx += 0.9) for (const [za, zb] of [[z0 + 0.3, z1 - 0.3]]) {
    const t = ((xx + 28) % 5.8) / 5.8; // strung between the palms, sagging
    dots.push([xx, Y + 4.6 - Math.sin(t * Math.PI) * 0.6, za], [xx, Y + 4.6 - Math.sin(t * Math.PI) * 0.6, zb]);
  }
  const pos = new Float32Array(dots.flat());
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d'), gr = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(0.35, 'rgba(255,214,140,0.7)'); gr.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, 64, 64);
  const pm = new THREE.PointsMaterial({ size: 0.7, map: new THREE.CanvasTexture(c), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  mats.push([pm, 1]);
  const points = new THREE.Points(pg, pm);
  points.raycast = () => {};
  group.add(points);

  // the crown's colour goes slowly round the wheel; the mast's light blinks
  const col = new THREE.Color();
  const update = (t) => {
    col.setHSL((t * 0.03) % 1, 0.75, 0.6);
    crown.color.copy(col);
    halo.color.copy(col);
    lineMat.color.copy(col);
    mastTip.visible = (t % 1.4) < 0.7;
  };
  update(0);
  return { group, mats, update };
}
abdali.lights = abdaliLights;
