// «مركز الشرطة»: a police station for every town (the user asked for one in
// each country as they grow, 2026-11-19). One block (28.6 x 16.6, +z towards
// the street): a white two-storey building with a blue band, a taller
// entrance block carrying the sign (drawn by the city), glass doors under a
// canopy with the blue police lamp, a radio mast on the roof, the country's
// flag on a pole in front, and a fenced car park with a barrier and a guard
// booth where the patrol cars stand. At night the cars' light bars flash red
// and blue (update(t)), the lamp glows blue and the mast blinks red.
import * as THREE from 'three';
import { C, GEO, put, box, cyl, ball, face, win, rng, shine, tree, RIGHT, LEFT, BACK } from './kit.js';
import { crowd, person, lamp } from './world.js';

const WALL = '#eef0f2', WALL2 = '#dfe3e8', BLUE = '#1f4e9c', BLUE2 = '#2a63c2', ROOF = '#c9ced6';
const PAVE = '#d9d4c8', TAR = '#5d636e', LINE = '#f4f4f0';
const GLASS = '#5d8fae'; // the city lights these windows at night
const LAMP_BLUE = shine('#3b7bff', 3), BAR_RED = shine('#ff3b3b', 2.6), BAR_BLUE = shine('#3b8bff', 2.6), MAST_RED = shine('#ff2a2a', 3);
const NAVY = ['#1d2a44'];
const Y = 0.2;

const B = { x0: -13.2, x1: 3.2, z0: -7.6, z1: 0.6, h: 7.0 };  // the main building
const T = { x: -5.0, w: 5.6, d: 9.2, h: 9.6 };                // the taller entrance block
const CARS = [[6.2, -3.2, 0], [8.8, -3.2, 0], [11.4, -3.2, 0], [9.0, 4.6, Math.PI / 2]]; // x, z, ry (the last one parked by the gate)
const MAST = [-10.5, -5.0];

// A patrol car, white with a blue stripe and a light bar; bars[] collects where its two lights are.
function patrolCar(g, x, z, ry, bars) {
  const f = face(g, x, z, ry, Y);
  box(f, '#f4f6f8', 0, 0.3, 0, 1.8, 0.62, 4.2);
  box(f, '#f4f6f8', 0, 0.92, -0.25, 1.62, 0.55, 2.2);
  box(f, '#3a4656', 0, 0.96, 0.87, 1.5, 0.42, 0.05);        // the windscreen
  box(f, '#3a4656', 0, 0.96, -1.36, 1.5, 0.4, 0.05);
  for (const s of [-1, 1]) {
    box(f, BLUE2, s * 0.905, 0.52, 0, 0.03, 0.2, 4.0);      // the stripe
    box(f, '#3a4656', s * 0.815, 0.98, -0.25, 0.03, 0.36, 1.9);
    for (const dz of [-1.35, 1.35]) box(f, '#1d1f24', s * 0.82, 0, dz, 0.26, 0.62, 0.66);
  }
  box(f, '#2b2d33', 0, 1.47, -0.15, 1.2, 0.08, 0.36);
  box(f, BAR_RED, -0.32, 1.55, -0.15, 0.5, 0.16, 0.3);
  box(f, BAR_BLUE, 0.32, 1.55, -0.15, 0.5, 0.16, 0.3);
  box(f, '#f6e6a8', 0, 0.55, 2.1, 1.4, 0.12, 0.04);         // headlights
  // where the two lights are, in the station's own space
  const c = Math.cos(ry), s = Math.sin(ry);
  for (const [lx, red] of [[-0.32, true], [0.32, false]]) bars.push({ x: x + lx * c + -0.15 * s, y: Y + 1.63, z: z - lx * s + -0.15 * c, red });
}

export function policeStation(g) {
  const rand = rng(112);
  const bars = [];
  box(g, PAVE, 0, 0, 0, 28.6, 0.2, 16.6);
  box(g, TAR, 9.4, 0.2, 0.2, 9.6, 0.02, 15.0);              // the car park
  for (const x of [5.0, 7.5, 10.1, 12.7]) box(g, LINE, x, 0.22, -3.2, 0.1, 0.01, 4.4);
  box(g, '#9bd486', -9.0, 0.2, 5.0, 9.0, 0.06, 4.6);         // a lawn in front

  // --- the building: two floors, a blue band between them, rows of windows
  const W = B.x1 - B.x0, D = B.z1 - B.z0, cx = (B.x0 + B.x1) / 2, cz = (B.z0 + B.z1) / 2;
  box(g, WALL, cx, Y, cz, W, B.h, D);
  box(g, BLUE, cx, Y + 3.3, cz, W + 0.1, 0.45, D + 0.1);
  box(g, WALL2, cx, Y + B.h, cz, W + 0.3, 0.35, D + 0.3);      // the parapet
  const front = face(g, 0, B.z1, 0, Y), back = face(g, 0, B.z0, BACK, Y);
  for (let x = B.x0 + 1.3; x < B.x1 - 0.8; x += 1.9) {
    if (Math.abs(x - T.x) < T.w / 2 + 0.3) continue;
    for (const y of [1.2, 4.4]) { win(front, x, y, 1.2, 1.5, { frame: WALL2, glass: GLASS, bars: false }); win(back, -x, y, 1.2, 1.5, { frame: WALL2, glass: GLASS, bars: false }); }
  }
  for (const [x, ry] of [[B.x0, LEFT], [B.x1, RIGHT]]) {
    const side = face(g, x, cz, ry, Y);
    for (const z of [-2.2, 0, 2.2]) for (const y of [1.2, 4.4]) win(side, z, y, 1.1, 1.5, { frame: WALL2, glass: GLASS, bars: false });
  }
  // the taller entrance block, standing a little forward, with the sign board high up
  const tz = B.z1 - T.d / 2 + 0.8;
  box(g, WALL, T.x, Y, tz, T.w, T.h, T.d);
  box(g, BLUE, T.x, Y + T.h - 0.5, tz, T.w + 0.1, 0.5, T.d + 0.1);
  box(g, WALL2, T.x, Y + T.h, tz, T.w + 0.3, 0.3, T.d + 0.3);
  const tf = face(g, T.x, tz + T.d / 2, 0, Y);
  box(tf, BLUE, 0, 6.0, 0.03, T.w - 0.6, 2.2, 0.06);          // the board behind the sign
  for (const x of [-1.7, 1.7]) win(tf, x, 4.2, 1.0, 1.2, { frame: WALL2, glass: GLASS, bars: false });
  // the way in: glass doors, the canopy on two columns, the blue lamp, steps
  box(tf, '#2f3b4a', 0, 0, 0.04, 2.6, 2.7, 0.06);
  box(tf, GLASS, -0.62, 0.05, 0.08, 1.15, 2.5, 0.05);
  box(tf, GLASS, 0.62, 0.05, 0.08, 1.15, 2.5, 0.05);
  box(tf, WALL2, 0, 3.0, 1.2, 4.2, 0.3, 2.4);
  box(tf, BLUE, 0, 2.95, 2.4, 4.2, 0.4, 0.06);
  for (const x of [-1.9, 1.9]) cyl(tf, WALL2, x, 0, 2.2, 0.13, 3.0, 8);
  box(tf, '#2b2d33', 0, 3.3, 2.35, 0.08, 0.5, 0.08);
  box(tf, LAMP_BLUE, 0, 3.75, 2.35, 0.55, 0.55, 0.55);         // the blue police lamp
  for (let i = 0; i < 3; i++) box(tf, WALL2, 0, i * 0.09, (1.6 - i * 0.5) / 2, 3.4 - i * 0.3, 0.09, 1.6 - i * 0.5);
  // the roof: the radio mast with its red light, air conditioners, a dish
  const [mx, mz] = MAST;
  box(g, '#8a8f98', mx, Y + B.h + 0.35, mz, 0.6, 0.3, 0.6);
  cyl(g, '#9aa0a8', mx, Y + B.h + 0.65, mz, 0.09, 6.2, 6);
  for (let k = 1; k < 4; k++) box(g, '#9aa0a8', mx, Y + B.h + 0.65 + k * 1.5, mz, 0.9 - k * 0.15, 0.06, 0.06);
  box(g, MAST_RED, mx, Y + B.h + 6.85, mz, 0.22, 0.22, 0.22);
  for (const [x, z] of [[-1.0, -5.5], [0.6, -5.5], [-0.2, -3.6]]) box(g, '#c0c5cc', x, Y + B.h + 0.35, z, 1.0, 0.7, 0.9);
  put(g, GEO.halfBall, '#e8eaee', -12.0, Y + B.h + 0.9, -2.0, 0.6, 0.25, 0.6).rotation.x = 1.0;

  // --- the flag pole in front (the city hangs the country's flag on it)
  cyl(g, '#8a8f98', -12.6, Y, 5.8, 0.3, 0.4, 10);
  cyl(g, '#eef1f4', -12.6, Y + 0.4, 5.8, 0.09, 9.6, 8);
  ball(g, '#e0b84a', -12.6, Y + 10.1, 5.8, 0.18);
  policeStation.flag = { x: -12.5, y: Y + 8.3, z: 5.8, scale: 0.42 };
  policeStation.sign = { x: T.x, y: Y + 6.0 + 1.1, z: tz + T.d / 2 + 0.08, w: T.w - 0.9, h: 1.7 };

  // --- the car park: patrol cars, the fence along the street, a barrier and the guard booth
  for (const [x, z, ry] of CARS) patrolCar(g, x, z, ry, bars);
  policeStation.bars = bars;
  for (let x = 4.6; x < 14.3; x += 0.5) if (x < 6.3 || x > 11.9) box(g, '#2b2d33', x, Y, 7.6, 0.06, 1.3, 0.06);
  for (const [x0, x1] of [[4.6, 6.3], [11.9, 14.1]]) box(g, '#2b2d33', (x0 + x1) / 2, Y + 1.25, 7.6, x1 - x0, 0.06, 0.06);
  for (let z = -7.6; z < 7.7; z += 0.5) box(g, '#2b2d33', 14.1, Y, z, 0.06, 1.3, 0.06);
  box(g, '#2b2d33', 14.1, Y + 1.25, 0, 0.06, 0.06, 15.2);
  box(g, WALL2, 12.9, Y, 6.4, 1.6, 2.4, 1.6);                   // the booth
  box(g, BLUE, 12.9, Y + 2.4, 6.4, 1.9, 0.25, 1.9);
  box(g, GLASS, 12.9, Y + 1.0, 7.22, 1.2, 0.8, 0.04);
  box(g, '#3a3f48', 12.0, Y, 7.6, 0.25, 1.0, 0.25);             // the barrier, down
  for (let i = 0; i < 6; i++) box(g, i % 2 ? '#f4f4f0' : '#d93030', 11.45 - i * 0.9, Y + 0.92, 7.6, 0.9, 0.14, 0.14);
  // the low wall and railing along the front of the building's side
  for (const [x0, x1] of [[-14.0, -6.9], [-3.1, 4.4]]) {
    box(g, WALL2, (x0 + x1) / 2, Y, 7.6, x1 - x0, 0.6, 0.35);
    for (let x = x0 + 0.25; x < x1; x += 0.5) box(g, '#2b2d33', x, Y + 0.6, 7.6, 0.05, 0.7, 0.05);
  }
  box(g, PAVE, T.x, Y, 5.0, 3.6, 0.04, 5.2);                    // the path to the door
  // trees, lamps, officers and visitors
  for (const [x, z] of [[-10.5, 4.0], [-7.4, 6.2], [-1.2, 5.4], [2.4, 6.4]]) tree(face(g, 0, 0, 0, Y), x, z, 0.95, 'round');
  for (const [x, z] of [[-8.2, 7.2], [-1.8, 7.2], [5.0, 7.0]]) lamp(g, x, Y, z, { h: 3.4 });
  for (const [x, z] of [[-6.4, 3.6], [-3.6, 3.8], [12.0, 5.8], [7.6, -0.4]]) person(g, x, Y, z, 0, 1, { clothes: NAVY, hair: '#1d2a44' });
  crowd(g, 6, [-8, 2, 2.0, 7.0], rand, { y: Y, free: (x, z) => Math.abs(x - T.x) > 1.0 || z > 4.5 });
}
policeStation.label = 'مركز الشرطة';
policeStation.top = 10.5;
policeStation.size = [28.6, 16.6];
policeStation.floodlight = { color: '#d8e6ff', at: [-5, 5, 9] };

// By night: the cars' light bars flash red and blue in turn (each car a
// little out of step), the lamp over the door glows blue, the mast's light
// blinks, warm pools under the lamps and a cool light on the front.
export function policeLights() {
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
  const blob = (r) => shade(new THREE.SphereGeometry(r, 14, 8), (x, y, z) => Math.max(0, 1 - Math.hypot(x, y, z) / r) ** 2);
  const pool = (r) => shade(new THREE.CircleGeometry(r, 24).rotateX(-Math.PI / 2), (x, y, z, i) => (i === 0 ? 1 : 0));

  // the light bars: a glow round each light and its colour on the ground, flashing
  const red = glow('#ff3030', 1, { side: THREE.BackSide }), blue = glow('#3a7bff', 1, { side: THREE.BackSide });
  const redPool = glow('#ff3030', 0.7), bluePool = glow('#3a7bff', 0.8);
  const flashers = [];
  (policeStation.bars || []).forEach((b, i) => {
    const car = Math.floor(i / 2);
    flashers.push({ on: [add(blob(2.8), b.red ? red : blue, b.x, b.y, b.z), add(blob(1.0), b.red ? red : blue, b.x, b.y, b.z), add(pool(4.6), b.red ? redPool : bluePool, b.x, Y + 0.06, b.z)], red: b.red, phase: car * 0.37 });
  });
  // the lamp over the door, the mast's light
  const tz = B.z1 - T.d / 2 + 0.8 + T.d / 2;
  add(blob(2.2), glow('#3b7bff', 0.9, { side: THREE.BackSide }), T.x, Y + 4.0, tz + 2.35);
  add(pool(4.5), glow('#5a8cff', 0.35), T.x, Y + 0.08, tz + 3.0);
  const mast = add(blob(1.4), glow('#ff2a2a', 0.9, { side: THREE.BackSide }), MAST[0], Y + B.h + 6.95, MAST[1]);
  // a cool wash up the front and warm pools under the lamps
  add(shade(new THREE.PlaneGeometry(B.x1 - B.x0, B.h, 1, 4).translate(0, B.h / 2, 0), (x, y) => 0.15 + 0.6 * (1 - y / B.h)), glow('#cfe0ff', 0.25), (B.x0 + B.x1) / 2, Y, B.z1 + 0.05);
  for (const [x, z] of [[-8.2, 7.2], [-1.8, 7.2], [5.0, 7.0]]) add(pool(3.0), glow('#ffc070', 0.4), x, Y + 0.07, z);

  const update = (t) => {
    for (const f of flashers) {
      const k = (t * 2.2 + f.phase) % 1; // two quick flashes of red, then two of blue
      const on = f.red ? (k < 0.12 || (k > 0.2 && k < 0.32)) : ((k > 0.5 && k < 0.62) || (k > 0.7 && k < 0.82));
      for (const m of f.on) m.visible = on;
    }
    mast.visible = (t % 1.6) < 0.8;
  };
  update(0);
  return { group, mats, update };
}
policeStation.lights = policeLights;
