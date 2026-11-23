// The two international airports (user, 2026-11-20): «مطار دمشق الدولي» for
// Syria and «مطار الملكة علياء الدولي» for Jordan. "Big, grand and tidy": a
// long runway with its markings and lights, a parallel taxiway, the apron with
// airliners of the region's airlines at the jet bridges, the terminal (Damascus:
// white stone arcades of pointed arches round a gold dome; Queen Alia: a glass
// hall under its roof of shallow concrete domes), the control tower, hangars,
// fuel tanks, the car park and the road in. The city adds the moving planes
// (one landing, one taking off, round and round), the names and the flag.
// Local space: x along the runway, the runway to the north (-z), the landside
// (road, car park) to the south (+z); y = 0 is the ground. About 720 x 380.
import * as THREE from 'three';
import { GEO, put, box, cyl, taper, ball, arch, face, shine, rng, car, tree } from './kit.js';
import { flagPole, BIG_FLAG } from './world.js';

export const SIZE = { w: 720, d: 380 };
export const RUNWAY = { z: -150, w: 36, x0: -330, x1: 330 };
export const TAXI = { z: -106, w: 18 };
const APRON = { z0: -96, z1: -28, x0: -235, x1: 235 };
const TERM = { z0: -28, z1: 18, x0: -130, x1: 130 };
export const ROAD = { x: -200, z: 30 };      // the road in: from the south edge to the curb in front of the terminal
export const GROUND_Y = 0.16;                  // where the wheels stand on the runway and the apron
export const GATES = [-95, -57, -19, 19, 57, 95]; // x of each jet bridge; the plane's nose is at z = -46
export const STAND_Z = -61;                    // the middle of a parked plane

const STONE = '#efe6d2', STONE2 = '#ddd2b8', BASALT = '#3d3d42', CONCRETE = '#d8d2c4';
const GLASS = '#7fb8d6', GLASS2 = '#5d8fae';  // both light up at night
const ASPHALT = '#3a3d44', TAXIWAY = '#474a52', APRON_C = '#bdbbb4', MARK = '#f4f2ea', YELLOW = '#e8c23a';
const GOLD = shine('#d9b44a', 2.6);
const WINDOWS = shine('#2c3a4d', 0.95); // a plane's row of windows: dark by day, the cabin's light at night
const EDGE = shine('#fff6d8', 3), GREEN = shine('#3fe07a', 3), RED = shine('#ff4a3a', 3), BLUE = shine('#4a8cff', 3), AMBER = shine('#ffc04a', 3);

// ------------------------------------------------------------------ the airliners
// Liveries of the region's airlines: body, the stripe along the windows, the
// tail, the mark on the tail, the engines. Colours only, drawn simply.
export const LIVERIES = {
  syrianair: { name: 'السورية للطيران', body: '#f7f7f4', stripe: '#1d5aa8', tail: '#1d5aa8', mark: '#e8c35a', engine: '#f7f7f4' },
  chamwings: { name: 'أجنحة الشام', body: '#f7f7f4', stripe: '#6a3fa0', tail: '#6a3fa0', mark: '#f0c94a', engine: '#6a3fa0' },
  rj: { name: 'الملكية الأردنية', body: '#f2f1ee', stripe: '#2b2c31', tail: '#2b2c31', mark: '#c9a227', engine: '#2b2c31' },
  qatar: { name: 'القطرية', body: '#f7f7f4', stripe: '#5c0f2e', tail: '#5c0f2e', mark: '#f7f7f4', engine: '#c9c9c9' },
  emirates: { name: 'طيران الإمارات', body: '#f7f7f4', stripe: '#c8102e', tail: '#c8102e', mark: '#1f8a4c', engine: '#e6e6e6' },
  turkish: { name: 'التركية', body: '#f7f7f4', stripe: '#c8102e', tail: '#c8102e', mark: '#f7f7f4', engine: '#9aa0a8' },
  saudia: { name: 'السعودية', body: '#f2efe6', stripe: '#0d5f86', tail: '#0d5f86', mark: '#c9a227', engine: '#f2efe6' },
  egyptair: { name: 'مصر للطيران', body: '#f7f7f4', stripe: '#1b2b5c', tail: '#1b2b5c', mark: '#c9a227', engine: '#f7f7f4' },
  mea: { name: 'طيران الشرق الأوسط', body: '#f7f7f4', stripe: '#0b7a3e', tail: '#f7f7f4', mark: '#0b7a3e', engine: '#f7f7f4' },
  iraqi: { name: 'الخطوط الجوية العراقية', body: '#f7f7f4', stripe: '#0f6b3c', tail: '#0f6b3c', mark: '#f7f7f4', engine: '#f7f7f4' },
};

// The fin: a swept trapezoid, its root along the tail cone, 0.36 thick.
const FIN = (() => {
  const s = new THREE.Shape();
  s.moveTo(-13.2, 0); s.lineTo(-20.4, 0); s.lineTo(-22.6, 7.6); s.lineTo(-18.9, 7.6); s.lineTo(-13.2, 0);
  return new THREE.ExtrudeGeometry(s, { depth: 0.36, bevelEnabled: false }).translate(0, 0, -0.18);
})();
const along = (m) => { m.rotation.z = -Math.PI / 2; return m; };   // a cylinder lying along +x from where it is put
const back = (m) => { m.rotation.z = Math.PI / 2; return m; };     // ... along -x
// An airliner, nose towards +x, centred on x = 0, the wheels on y = 0. About 36 long, 34 across the wings.
export function airliner(g, L, { gear = true } = {}) {
  const Y = 3.7, R = 2.05;                    // the fuselage's axis and radius
  along(cyl(g, L.body, -13, Y, 0, R, 27, 16));
  put(g, GEO.ball, L.body, 14, Y - 0.15, 0, 4.2, R * 0.97, R * 0.97);                  // the nose
  back(taper(g, L.body, -13, Y + 0.25, 0, R, 0.45, 7.5, 14));                          // the tail cone, swept up a little
  box(g, '#22303f', 15.6, Y + 0.45, 0, 1.5, 0.55, 2.6);                                // the cockpit windows
  for (const s of [-1, 1]) {
    box(g, L.stripe, 0, Y - 0.15, s * (R - 0.02), 26.5, 0.55, 0.06);                    // the stripe
    box(g, WINDOWS, 1, Y + 0.55, s * (R - 0.04), 22, 0.36, 0.06);                       // the windows (the cabin lit at night)
    box(g, L.stripe, 10.5, Y - 1.0, s * (R - 0.25), 1.0, 1.9, 0.06);                     // a door
    // the wing, swept back, and its engine
    const sweep = 0.46, span = 16.5;
    box(g, L.body, 0.5 - Math.sin(sweep) * span / 2, Y - 1.25, s * (1.2 + Math.cos(sweep) * span / 2), 5.4, 0.42, span, -s * sweep);
    box(g, L.stripe, -7.2, Y - 1.25, s * 16.4, 1.2, 2.2, 0.18, -s * sweep);              // the winglet
    box(g, s > 0 ? GREEN : RED, -6.4, Y - 1.3, s * 16.0, 0.4, 0.4, 0.4);                 // the navigation light at its tip
    along(cyl(g, L.engine, 1.2, Y - 2.35, s * 5.6, 1.0, 4.4, 14));
    along(cyl(g, '#2b2d33', 5.55, Y - 2.35, s * 5.6, 0.82, 0.1, 14));                   // the intake
    box(g, L.engine, 1.8, Y - 1.6, s * 5.6, 2.6, 0.45, 0.3);                             // the pylon
    // the tail planes
    box(g, L.tail === L.body ? L.stripe : L.body, -17.6, Y + 0.25, s * 3.2, 2.8, 0.25, 6.4, -s * 0.5);
  }
  put(g, FIN, L.tail, 0, Y + 0.9, 0);                                                    // the fin, swept back
  for (const s of [-1, 1]) put(g, GEO.ball, L.mark, -18.7, Y + 4.6, s * 0.2, 1.15, 1.15, 0.06); // the airline's mark on both sides
  if (gear) {
    for (const [x, zs] of [[11.5, [0]], [-0.8, [-1.7, 1.7]]]) for (const z of zs) {
      box(g, '#9aa0a8', x, 0.6, z, 0.25, Y - R - 0.4, 0.25);
      const w = cyl(g, '#26282c', x, 0.55, z - 0.35, 0.55, 0.7, 10);
      w.rotation.x = Math.PI / 2;
    }
  }
}

// ------------------------------------------------------------------ the ground
function runway(g) {
  const { z, w, x0, x1 } = RUNWAY, len = x1 - x0;
  box(g, '#8f9399', 0, 0.1, z, len + 24, 0.04, w + 14);                                // the shoulders
  box(g, ASPHALT, 0, 0.12, z, len, 0.04, w);
  for (let x = x0 + 40; x < x1 - 40; x += 26) box(g, MARK, x, 0.16, z, 13, 0.01, 0.9); // the centre line
  for (const s of [-1, 1]) box(g, MARK, 0, 0.16, z + s * (w / 2 - 1), len - 4, 0.01, 0.7); // the edges
  for (const [end, dir] of [[x0, 1], [x1, -1]]) {
    for (let i = 0; i < 8; i++) for (const s of [-1, 1]) box(g, MARK, end + dir * 12, 0.16, z + s * (2.6 + i * 1.9), 22, 0.01, 1.1); // the threshold's piano keys
    for (const s of [-1, 1]) box(g, MARK, end + dir * 70, 0.16, z + s * 6.5, 30, 0.01, 4.2);    // the aiming points
    for (let k = 0; k < 3; k++) for (const s of [-1, 1]) box(g, MARK, end + dir * (110 + k * 30), 0.16, z + s * 6.5, 18, 0.01, 1.2);
    for (let i = -8; i <= 8; i++) box(g, dir > 0 ? GREEN : RED, end - dir * 1.5, 0.12, z + i * 2.2, 0.6, 0.4, 0.6); // green where planes land, red at the far end
    for (let k = 1; k <= 6; k++) {                                                     // the approach lights, out past the end
      const x = end - dir * (16 + k * 9);
      box(g, '#8a8f98', x, 0.1, z, 0.25, 1.2, 9);
      for (let i = -3; i <= 3; i++) box(g, EDGE, x, 1.3, z + i * 1.3, 0.45, 0.35, 0.45);
    }
  }
  for (let x = x0 + 8; x <= x1 - 8; x += 20) for (const s of [-1, 1]) box(g, EDGE, x, 0.12, z + s * (w / 2 + 1.5), 0.45, 0.45, 0.45); // edge lights
  for (let x = x0 + 15; x <= x1 - 15; x += 15) box(g, EDGE, x, 0.12, z, 0.35, 0.08, 0.35);                    // centre-line lights
  for (let i = 0; i < 4; i++) { // the PAPI by the touchdown point: two white, two red to a plane on the right slope
    const pz = z - w / 2 - 8 - i * 3;
    box(g, '#3a3d44', x0 + 70, 0.1, pz, 1.4, 0.8, 1.4);
    box(g, i < 2 ? EDGE : RED, x0 + 70.75, 0.5, pz, 0.1, 0.4, 0.8);
  }
}
// Every light of the airfield, for the halos the city draws round them at night (local space).
export function lightSpots() {
  const { z, w, x0, x1 } = RUNWAY, out = { white: [], green: [], red: [], blue: [], warm: [], approach: [], obstacle: [], papiW: [], papiR: [] };
  for (let x = x0 + 8; x <= x1 - 8; x += 20) for (const s of [-1, 1]) out.white.push([x, 0.6, z + s * (w / 2 + 1.5)]);
  for (let x = x0 + 15; x <= x1 - 15; x += 15) out.white.push([x, 0.3, z]);
  for (let i = -8; i <= 8; i += 2) { out.green.push([x0 - 1.5, 0.6, z + i * 2.2]); out.red.push([x1 + 1.5, 0.6, z + i * 2.2]); }
  for (let x = x0 + 10; x <= x1 - 10; x += 24) for (const s of [-1, 1]) out.blue.push([x, 0.5, TAXI.z + s * (TAXI.w / 2 + 1)]);
  for (let x = x0 + 16; x <= x1 - 16; x += 12) out.green.push([x, 0.25, TAXI.z]);
  for (let k = 6; k >= 1; k--) out.approach.push([x0 - (16 + k * 9), 1.5, z]);      // far to near: the "rabbit" runs along them
  for (let k = 1; k <= 6; k++) for (const i of [-3, -1, 1, 3]) out.white.push([x0 - (16 + k * 9), 1.5, z + i * 1.3]);
  for (let i = 0; i < 4; i++) (i < 2 ? out.papiW : out.papiR).push([x0 + 71, 0.7, z - w / 2 - 8 - i * 3]);
  for (let x = APRON.x0 + 10; x <= APRON.x1 - 10; x += 58) out.warm.push([x, 23.6, APRON.z0 + 1.5]);
  out.obstacle.push([168, 50.8, -6], [262, 15.5, -60], [312, 15.5, -60], [RADAR.x, 18.6, RADAR.z]);
  for (let x = APRON.x0 + 10; x <= APRON.x1 - 10; x += 58) out.obstacle.push([x, 24.6, APRON.z0 + 1.5]);
  return out;
}
export const BEACON = [168, 47.5, -6]; // the tower's rotating beacon (green and white)
function taxiways(g) {
  const { z, w } = TAXI;
  box(g, TAXIWAY, 0, 0.12, z, RUNWAY.x1 - RUNWAY.x0 - 10, 0.04, w);
  box(g, YELLOW, 0, 0.16, z, RUNWAY.x1 - RUNWAY.x0 - 14, 0.01, 0.45);
  const links = [RUNWAY.x0 + 30, -120, 120, RUNWAY.x1 - 30];
  for (const x of links) {                                                             // to the runway
    const z0 = RUNWAY.z + RUNWAY.w / 2, z1 = z - w / 2;
    box(g, TAXIWAY, x, 0.12, (z0 + z1) / 2, w, 0.04, z1 - z0 + 1);
    box(g, YELLOW, x, 0.16, (z0 + z1) / 2, 0.45, 0.01, z1 - z0);
    for (let i = 0; i < 4; i++) box(g, YELLOW, x - w / 2 + 2 + i * 4.5, 0.16, z0 + 4, 3.2, 0.01, 0.5); // the holding point
  }
  for (const x of [-180, 0, 180]) {                                                    // to the apron
    const z0 = z + w / 2, z1 = APRON.z0;
    box(g, TAXIWAY, x, 0.12, (z0 + z1) / 2, w, 0.04, z1 - z0 + 1);
    box(g, YELLOW, x, 0.16, (z0 + z1) / 2, 0.45, 0.01, z1 - z0);
  }
  for (let x = RUNWAY.x0 + 10; x <= RUNWAY.x1 - 10; x += 24) for (const s of [-1, 1]) box(g, BLUE, x, 0.12, z + s * (w / 2 + 1), 0.4, 0.4, 0.4); // its blue lights
}
function apron(g) {
  const { z0, z1, x0, x1 } = APRON;
  box(g, APRON_C, (x0 + x1) / 2, 0.11, (z0 + z1) / 2, x1 - x0, 0.05, z1 - z0);
  for (let x = x0; x < x1; x += 6) box(g, '#b0aea7', x, 0.16, (z0 + z1) / 2, 0.08, 0.01, z1 - z0); // the slabs' joints
  box(g, YELLOW, (x0 + x1) / 2, 0.165, z0 + 7, x1 - x0 - 10, 0.01, 0.45);               // the apron's taxi line
  for (const x of GATES) {
    box(g, YELLOW, x, 0.165, (z0 + 7 + TERM.z0) / 2, 0.45, 0.01, TERM.z0 - z0 - 9);     // the lead-in line
    for (const s of [-1, 1]) box(g, '#c0392b', x + s * 18.5, 0.165, -62, 0.4, 0.01, 50); // the stand's red edges
  }
}

// ------------------------------------------------------------------ the buildings
function jetBridge(g, x) {
  const z0 = TERM.z0, len = 13;
  box(g, '#c9cdd3', x - 4, 4.6, z0 - len / 2 - 1, 3.2, 3.0, len);                     // the tunnel
  box(g, GLASS2, x - 4, 5.4, z0 - len / 2 - 1, 3.25, 1.1, len - 1);                    // its windows
  box(g, '#9aa0a8', x - 4, 4.4, z0 - len - 2.6, 4.2, 3.4, 3.4);                         // the cab at the plane's door
  for (const dz of [-6, -12]) { box(g, '#7d828a', x - 4, 0.16, z0 + dz, 0.5, 4.5, 0.5); box(g, '#26282c', x - 4, 0.16, z0 + dz, 1.4, 0.7, 0.9); }
}
function terminalDamascus(g, name) {
  const { x0, x1, z0, z1 } = TERM, W = x1 - x0, D = z1 - z0, cz = (z0 + z1) / 2;
  // the two long wings: glass to the planes, stone arcades to the city
  box(g, STONE, 0, 0.12, cz, W, 15, D);
  box(g, GLASS, 0, 3.2, z0 - 0.05, W - 8, 9.5, 0.2);
  for (let x = x0 + 4; x <= x1 - 4; x += 8) box(g, STONE2, x, 0.12, z0 - 0.2, 0.9, 15, 0.5);
  const front = face(g, 0, z1, 0, 0.12);
  for (let x = x0 + 7; x < x1 - 4; x += 9) {
    if (Math.abs(x) < 28) continue;
    arch(front, STONE2, x, 0, 0.35, 7.6, 11.6, 0.7, 0, true);                         // the arcade of pointed arches
    arch(front, GLASS, x, 0, 0.75, 6.2, 10.6, 0.3, 0, true);
  }
  for (let i = 0; i < 6; i++) box(g, i % 2 ? BASALT : STONE, 0, 12.4 + i * 0.42, z1 + 0.25, W, 0.42, 0.5); // ablaq bands under the cornice
  box(g, STONE2, 0, 15.1, cz, W + 1.2, 0.7, D + 1.2);                                    // the cornice
  for (let x = x0 + 2; x <= x1 - 2; x += 3.2) box(g, STONE, x, 15.8, z1 + 0.3, 1.6, 1.1, 0.6); // crenellations
  // the great hall in the middle, under its gold dome
  box(g, STONE, 0, 0.12, cz + 2, 56, 24, D + 6);
  box(g, GLASS, 0, 2.5, z0 - 1.05, 44, 17, 0.2);
  const hall = face(g, 0, z1 + 5, 0, 0.12);                                              // on the front of the hall
  arch(hall, STONE2, 0, 0, 0.4, 30, 20.5, 0.8, 0, true);                                 // the great entrance arch
  arch(hall, GLASS, 0, 0, 0.85, 26, 18.8, 0.3, 0, true);
  for (const s of [-1, 1]) arch(hall, STONE2, s * 21.5, 0, 0.4, 7, 13, 0.6, 0, true), arch(hall, GLASS, s * 21.5, 0, 0.8, 5.6, 12, 0.3, 0, true);
  for (let i = 0; i < 8; i++) box(g, i % 2 ? BASALT : STONE, 0, 21.4 + i * 0.35, z1 + 5.2, 56, 0.35, 0.4);
  cyl(g, STONE2, 0, 24.1, cz + 2, 15, 2.5, 24);                                          // the drum
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; box(g, GLASS, Math.cos(a) * 15.05, 24.6, cz + 2 + Math.sin(a) * 15.05, 2.2, 1.5, 0.3, -a + Math.PI / 2); }
  put(g, GEO.halfBall, GOLD, 0, 26.6, cz + 2, 14.6, 11, 14.6);                          // the dome
  cyl(g, GOLD, 0, 37.4, cz + 2, 0.5, 2.6, 8);
  ball(g, GOLD, 0, 40.4, cz + 2, 0.9);
  // the corner towers and the small domes on the wings
  for (const s of [-1, 1]) {
    box(g, STONE, s * (W / 2 - 4), 0.12, z1 - 4, 9, 22, 9);
    put(g, GEO.halfBall, '#8f9aa5', s * (W / 2 - 4), 22.1, z1 - 4, 4.4, 4, 4.4);
    for (const x of [s * 62, s * 96]) put(g, GEO.halfBall, '#8f9aa5', x, 15.5, cz, 5, 3.6, 5);
  }
  // the canopy over the kerb, on slim columns
  box(g, STONE2, 0, 7.6, z1 + 9, W - 30, 0.8, 11);
  for (let x = x0 + 18; x <= x1 - 18; x += 12) cyl(g, STONE, x, 0.12, z1 + 13.5, 0.5, 7.5, 10);
}
function terminalAlia(g) {
  const { x0, x1, z0, z1 } = TERM, W = x1 - x0, D = z1 - z0, cz = (z0 + z1) / 2;
  box(g, GLASS, 0, 0.12, cz, W - 6, 11, D - 4);                                          // the glass hall
  for (let x = x0 + 5; x <= x1 - 5; x += 5) for (const z of [z0 + 2, z1 - 2]) box(g, '#e4ddcf', x, 0.12, z, 0.35, 11, 0.35); // its mullions
  // the roof: rows of shallow concrete domes, each on a column that opens like a palm
  const nx = 10, nz = 2, sx = W / nx, sz = D / nz;
  box(g, CONCRETE, 0, 11.1, cz, W + 4, 0.9, D + 4);
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const x = x0 + sx * (i + 0.5), z = z0 + sz * (j + 0.5);
    put(g, GEO.halfBall, '#e6dfd0', x, 11.9, z, sx * 0.5, 3.4, sz * 0.5);
    ball(g, GLASS, x, 15.15, z, 1.3, 0.35);                                              // the skylight at its top
    if (j === 0 || i % 2 === 0) taper(g, '#d8d0c0', x, 0.12, z + (j ? -sz * 0.5 + 2.5 : sz * 0.5 - 2.5), 0.8, 2.6, 11, 10); // the palm column
  }
  for (let i = 0; i <= nx; i++) for (const z of [z0 - 2, z1 + 2]) { // the domes' edges come down to columns all round
    const x = x0 + sx * i;
    taper(g, '#d8d0c0', x, 0.12, z, 0.7, 1.9, 11, 10);
  }
  // the canopy over the kerb
  box(g, CONCRETE, 0, 7.2, z1 + 9, W - 30, 0.8, 11);
  for (let x = x0 + 18; x <= x1 - 18; x += 12) taper(g, '#d8d0c0', x, 0.12, z1 + 13.5, 0.45, 1.3, 7.2, 10);
}
function tower(g, x, z, style) {
  const top = 44;
  taper(g, style === 'alia' ? CONCRETE : STONE, x, 0.12, z, 4.2, 2.8, top - 6, 16);
  for (let y = 6; y < top - 8; y += 5) cyl(g, GLASS2, x, y, z, 2.95 + (top - y) * 0.03, 0.6, 16); // slits of windows up the shaft
  cyl(g, '#e9e6de', x, top - 6, z, 5.2, 1.0, 16);
  taper(g, GLASS, x, top - 5, z, 5.0, 6.2, 4.6, 16);                                    // the cab, leaning out
  cyl(g, '#e9e6de', x, top - 0.4, z, 6.5, 0.9, 16);
  cyl(g, '#9aa0a8', x, top + 0.5, z, 0.25, 6, 8);
  box(g, RED, x, top + 6.5, z, 0.5, 0.5, 0.5);
  if (style === 'damascus') put(g, GEO.halfBall, GOLD, x, top + 0.5, z, 3, 2, 3);
}
function hangar(g, x, z, w, d) {
  const halfTube = new THREE.CylinderGeometry(1, 1, 1, 16, 1, false, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI / 2);
  box(g, '#d7dade', x, 0.12, z, w, 9, d);
  put(g, halfTube, '#b9bec6', x, 9.1, z, w / 2, 6, d);
  box(g, '#9aa0a8', x, 0.12, z - d / 2 - 0.2, w - 4, 12, 0.4);                           // the doors
  for (let i = 1; i < 6; i++) box(g, '#878d96', x - w / 2 + 2 + (i * (w - 4)) / 6, 0.12, z - d / 2 - 0.45, 0.3, 12, 0.2);
}
function fuelFarm(g, x, z) {
  for (let i = 0; i < 4; i++) {
    const tx = x + (i % 2) * 22, tz = z + Math.floor(i / 2) * 22;
    cyl(g, '#eef0f2', tx, 0.12, tz, 8, 9, 20);
    cyl(g, '#dfe3e8', tx, 9.12, tz, 8.2, 0.5, 20);
    box(g, '#c0392b', tx, 6, tz + 7.9, 5, 0.9, 0.3);
  }
  box(g, '#8a8f98', x + 11, 0.12, z + 11, 46, 0.9, 46);
}
function mast(g, x, z) { // an apron floodlight mast
  cyl(g, '#8a8f98', x, 0.12, z, 0.4, 24, 8);
  box(g, '#5d636c', x, 24, z, 4.5, 0.4, 1.2);
  for (const dx of [-1.5, 0, 1.5]) box(g, EDGE, x + dx, 23.4, z, 1.1, 0.6, 0.9);
}
function tug(g, x, z, ry, rand) { // a baggage tug with its carts
  const f = face(g, x, z, ry, 0.16);
  box(f, '#f2c230', 0, 0.3, 0, 1.6, 1.1, 2.2);
  box(f, '#2b2d33', 0, 1.4, -0.4, 1.4, 0.8, 0.1);
  for (let i = 1; i <= 3; i++) {
    box(f, '#5d636c', 0, 0.4, -i * 3, 1.7, 0.2, 2.4);
    box(f, ['#c0392b', '#2c5f8a', '#3f8f5a', '#d9a441'][(i + Math.floor(rand() * 4)) % 4], 0, 0.6, -i * 3, 1.4, 0.9, 1.9);
  }
}
function truck(g, x, z, ry, color, long = 7) {
  const f = face(g, x, z, ry, 0.16);
  box(f, color, 0, 0.5, long / 2 - 1.2, 2.3, 2.1, 2.4);
  box(f, '#4a6b85', 0, 1.6, long / 2 - 0.05, 2.0, 0.8, 0.1);
  const t = cyl(f, color === '#c0392b' ? '#c0392b' : '#eef0f2', 0, 1.6, -long / 2 + 0.3, 1.1, long - 2.6, 12);
  t.rotation.x = Math.PI / 2;
  for (const dz of [-long / 2 + 1.4, long / 2 - 1.4]) for (const s of [-1, 1]) { const w = cyl(f, '#26282c', s * 1.05, 0.5, dz, 0.5, 0.3, 10); w.rotation.z = Math.PI / 2; }
}

// ------------------------------------------------------------------ the whole airport
// spec: { style: 'damascus' | 'alia', parked: [livery keys, one per gate], seed }
export function airport(g, spec) {
  const rand = rng(spec.seed || 5);
  const { w: W, d: D } = SIZE;
  box(g, '#9fcf86', 0, 0, 0, W, 0.1, D);                                                 // the airfield's grass
  for (const [x, z, sx, sz] of [[-W / 2, 0, 1.2, D], [W / 2, 0, 1.2, D], [0, -D / 2, W, 1.2]]) box(g, '#cfcac0', x, 0.1, z, sx, 1.6, sz); // the perimeter wall
  const gx = ROAD.x;                                                                     // the south wall, open for the road
  box(g, '#cfcac0', (-W / 2 + gx - 12) / 2, 0.1, D / 2, gx - 12 + W / 2, 1.6, 1.2);
  box(g, '#cfcac0', (W / 2 + gx + 12) / 2, 0.1, D / 2, W / 2 - gx - 12, 1.6, 1.2);
  runway(g);
  taxiways(g);
  apron(g);
  // the terminal and its gates
  if (spec.style === 'alia') terminalAlia(g); else terminalDamascus(g);
  for (const x of GATES) jetBridge(g, x);
  // the planes at the gates, noses to the terminal
  GATES.forEach((x, i) => {
    const L = LIVERIES[spec.parked[i % spec.parked.length]];
    const f = face(g, x, STAND_Z, -Math.PI / 2, GROUND_Y);
    airliner(f, L);
    tug(g, x + 9, STAND_Z + 4, Math.PI / 2, rand);
    truck(g, x - 10, STAND_Z - 8, 0, i % 2 ? '#e6e6e6' : '#f2c230', 6);
  });
  // the control tower beside the terminal, the hangars and the fuel farm at the ends
  tower(g, 168, -6, spec.style);
  box(g, spec.style === 'alia' ? CONCRETE : STONE, 168, 0.12, -6, 22, 7, 16);
  hangar(g, 262, -60, 46, 34);
  hangar(g, 312, -60, 40, 30);
  const hf = face(g, 262, -50, -Math.PI / 2, GROUND_Y);                                  // a plane half out of the first hangar
  airliner(hf, LIVERIES[spec.parked[0]]);
  fuelFarm(g, -318, 60);
  // the fire station by the taxiway, its engines out in front
  box(g, '#c0392b', -215, 0.12, -60, 30, 7, 16);
  box(g, '#eef0f2', -215, 7.1, -60, 31, 0.6, 17);
  for (let i = 0; i < 3; i++) box(g, '#e8e2d2', -225 + i * 10, 0.12, -51.9, 7, 5.2, 0.2);
  for (let i = 0; i < 2; i++) truck(g, -222 + i * 13, -44, Math.PI, '#c0392b', 8);
  // apron floodlights
  for (let x = APRON.x0 + 10; x <= APRON.x1 - 10; x += 58) mast(g, x, APRON.z0 + 1.5);
  // landside: the kerb road, the car park, the road in, palms and lawns
  const { x: rx, z: rz } = ROAD;
  box(g, ASPHALT, (rx + 150) / 2, 0.12, rz, 150 - rx + 14, 0.05, 14);                    // the kerb road
  for (let x = rx; x < 150; x += 8) box(g, MARK, x, 0.17, rz, 4, 0.01, 0.3);
  box(g, ASPHALT, rx, 0.12, (rz + D / 2) / 2 + 3, 14, 0.05, D / 2 - rz + 6);             // the road in
  for (let z = rz + 10; z < D / 2; z += 8) box(g, MARK, rx, 0.17, z, 0.3, 0.01, 4);
  box(g, '#c9c5bb', 0, 0.12, 82, 260, 0.05, 76);                                          // the car park
  for (let row = 0; row < 4; row++) {
    const z = 54 + row * 19;
    for (let x = -122; x <= 122; x += 3.4) {
      box(g, MARK, x, 0.17, z, 0.12, 0.01, 5);
      if (rand() < 0.72) car(g, x + 1.7, z, ['#d64545', '#e9e9e9', '#2c5f8a', '#3f3f46', '#d9a441', '#9aa0a8', '#2e7d5b'][Math.floor(rand() * 7)], row % 2 ? Math.PI : 0);
    }
  }
  for (let z = rz + 14; z < D / 2 - 4; z += 14) for (const s of [-1, 1]) tree(g, rx + s * 11, z, 2.6, 'palm');
  for (let x = -126; x <= 126; x += 14) tree(g, x, 44, 2.4, 'palm');
  for (let x = -120; x <= 120; x += 20) tree(g, x, 126, 2.2, 'round');
  flagPole(g, FLAG.x, 0.1, FLAG.z, FLAG.h);
  // the windsock by the runway
  cyl(g, '#d6d1c4', 200, 0.1, RUNWAY.z + 30, 0.15, 6, 8);
  const sock = cyl(g, '#ff7a1a', 200.2, 5.4, RUNWAY.z + 30, 0.5, 2.6, 8);
  sock.rotation.z = -1.3;
}
airport.top = 42;

// The spots the city needs: where the name goes, the flag, the radar.
export const SIGN = { y: 10.9, z: TERM.z1 + 14.8, w: 74, h: 4.6 };      // standing on the front of the kerb's canopy, facing the road
export const FLAG = flagPoleAt(ROAD.x + 22, ROAD.z + 32, 24); // the country's big flag by the road in (the city hangs the cloth)
function flagPoleAt(x, z, h) { return { x, z, h, cloth: { x: x + 0.15, y: 0.1 + h - BIG_FLAG.h / 2 - 0.1, z } }; }
export const RADAR = { x: 300, z: 0 };

// The rotating radar on its mast (moved by the city).
export function radarMast(g) {
  cyl(g, '#8a8f98', RADAR.x, 0.12, RADAR.z, 0.6, 16, 8);
  box(g, '#5d636c', RADAR.x, 16, RADAR.z, 3, 1.2, 3);
}
export function radarDish() {
  const g = new THREE.Group();
  box(g, '#eef0f2', 0, 0, 0, 1.2, 1.2, 1.2);
  box(g, '#eef0f2', 0, 1.0, 0, 9, 2.4, 0.5);
  box(g, '#9aa0a8', 0, 1.0, 0.4, 8, 0.4, 0.4);
  return g;
}

// At night: the apron and the kerb flooded with light, the runway's edges glowing (additive, faded in with the night).
export function airportLights() {
  const group = new THREE.Group(), mats = [];
  const glow = (color, strength) => {
    const m = new THREE.MeshBasicMaterial({ color, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    mats.push([m, strength]);
    return m;
  };
  const pool = (rx, rz) => {
    const geo = new THREE.CircleGeometry(1, 28).rotateX(-Math.PI / 2).scale(rx, 1, rz), col = [];
    for (let i = 0; i < geo.attributes.position.count; i++) { const v = i === 0 ? 1 : 0; col.push(v, v, v); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return geo;
  };
  const warm = glow('#ffd590', 0.75), white = glow('#e6eeff', 0.55), blue = glow('#7aa8ff', 0.45);
  const add = (geo, m, x, z, y = 0.2) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.raycast = () => {}; group.add(o); };
  for (let x = APRON.x0 + 10; x <= APRON.x1 - 10; x += 58) add(pool(34, 30), white, x, APRON.z0 + 22);
  add(pool(150, 16), warm, 0, ROAD.z + 6);
  add(pool(140, 44), warm, 0, 82);
  for (let z = ROAD.z + 20; z < SIZE.d / 2; z += 30) add(pool(14, 14), warm, ROAD.x, z);
  add(pool(RUNWAY.x1 - RUNWAY.x0, 26), blue, 0, RUNWAY.z);
  return { group, mats };
}
