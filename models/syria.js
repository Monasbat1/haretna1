// Real Syrian landmarks, each in a zone of its own (see SY_ZONES in city.js),
// built with the same kit as everything else. Local space: the zone's middle
// is x = 0, z = 0 on the ground; +z faces the visitor.
// Each builder has .label (Arabic name), .top (height of the tallest part) and
// .size [w, d] (what it needs on the ground).
import { GEO, mat, put, box, cyl, taper, cone, hip, gable, ball, arch, face, RIGHT, LEFT, BACK, shine, tree, ablaq } from './kit.js';

const CLOCK_GLOW = shine('#f6efd0', 2.6); // clock faces shine at night
const GOLD = shine('#dab54b', 2.75);
const LANTERN = '#f6d77a';                // kit already makes this shine

// ---------------------------------------------------------------- helpers
// A clock face on a wall (f = face()): r the dial's radius, hands at hh:mm.
function clockFace(f, x, y, r, hh = 10, mm = 10) {
  const rim = cyl(f, '#3b3f45', x, y, 0.0, r + 0.2, 0.1, 14); rim.rotation.x = Math.PI / 2;
  const dial = cyl(f, CLOCK_GLOW, x, y, 0.08, r, 0.06, 14); dial.rotation.x = Math.PI / 2;
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6, t = box(f, '#2a2d33', x + Math.sin(a) * r * 0.82, y + Math.cos(a) * r * 0.82, 0.16, r * 0.09, r * 0.16, 0.03);
    t.rotation.z = -a;
  }
  const hand = (len, w, ang) => {
    const h = box(f, '#1c1e22', x, y, 0.18, w, len, 0.04);
    h.rotation.z = -ang; // geometry grows up from its base, so it turns round the dial's middle
  };
  hand(r * 0.55, r * 0.1, ((hh % 12) + mm / 60) * (Math.PI / 6));
  hand(r * 0.82, r * 0.07, mm * (Math.PI / 30));
  ball(f, '#1c1e22', x, y, 0.2, r * 0.08);
}
// The four sides of a square tower: callback(face, side) with the face
// standing on the wall at distance half from the middle.
function sides(g, half, y, fn) {
  const R = [[0, half, 0], [half, 0, RIGHT], [0, -half, BACK], [-half, 0, LEFT]];
  R.forEach(([x, z, ry], i) => fn(face(g, x, z, ry, y), i));
}
const finial = (g, x, y, z, s = 1) => { cyl(g, GOLD, x, y, z, 0.07 * s, 1.0 * s, 8); ball(g, GOLD, x, y + 1.0 * s, z, 0.22 * s); };
function crenels(g, color, x, y, z, w, d, n, ry = 0, along = 'x') { // merlons along a wall top
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1) - 0.5, o = t * (w - 0.8);
    const ca = Math.cos(ry), sa = Math.sin(ry);
    box(g, color, x + o * ca, y, z - o * sa, 0.8, 0.9, d + 0.2, ry);
  }
}
const lamp = (g, x, z, h = 3.2) => { cyl(g, '#2b2d33', x, 0.3, z, 0.1, h, 8); ball(g, LANTERN, x, 0.3 + h + 0.2, z, 0.32); };
const bench = (g, x, z, ry = 0) => { box(g, '#7b4b2a', x, 0.3 + 0.45, z, 1.8, 0.14, 0.6, ry); box(g, '#5a3620', x, 0.3, z, 1.6, 0.45, 0.4, ry); };

// A pale paved square with a darker border, the base of every clock tower.
function square(g, w, d, stone = '#e0d9c6', band = '#c4b898') {
  box(g, '#bdb9ae', 0, 0, 0, w, 0.3, d);
  box(g, stone, 0, 0.3, 0, w - 2, 0.06, d - 2);
  box(g, band, 0, 0.36, 0, w - 6, 0.02, d - 6);
}

// ---------------------------------------------------------------- Idlib clock
// «ساعة إدلب»: the old clock tower in Idlib's central square: a square tower of
// pale limestone, a clock under each of its roofs' four gables, a small dome.
export function idlibClock(g) {
  const stone = '#e8dfc6', stone2 = '#d3c7a6', dark = '#3a2c26', roof = '#5d6c78', green = '#2f7d5b';
  square(g, 44, 44);
  for (const s of [-1, 1]) for (const t of [-1, 1]) { tree(g, s * 17, t * 17, 1.1); lamp(g, s * 9, t * 9); }
  // three steps, then the tower
  box(g, stone2, 0, 0.36, 0, 10.4, 0.5, 10.4);
  box(g, stone, 0, 0.86, 0, 9.0, 0.5, 9.0);
  box(g, stone, 0, 1.36, 0, 6.6, 6.2, 6.6);                 // the base with its four arched doors
  box(g, stone2, 0, 7.56, 0, 7.2, 0.45, 7.2);
  sides(g, 3.3, 1.36, (f) => { arch(f, stone2, 0, 0, 0.03, 2.5, 4.4, 0.06, 0, true); arch(f, dark, 0, 0, 0.06, 2.0, 4.0, 0.06, 0, true); });
  box(g, stone, 0, 8.0, 0, 5.4, 6.0, 5.4);                  // the shaft
  sides(g, 2.7, 8.0, (f) => { for (const x of [-1.1, 1.1]) arch(f, '#2f4a5a', x, 1.4, 0.03, 0.8, 2.6, 0.06, 0, true); });
  box(g, stone2, 0, 14.0, 0, 6.2, 0.5, 6.2);
  box(g, stone, 0, 14.5, 0, 5.6, 5.0, 5.6);                 // the clock stage
  sides(g, 2.8, 14.5, (f) => clockFace(f, 0, 2.5, 1.7, 10, 10));
  box(g, stone2, 0, 19.5, 0, 6.4, 0.5, 6.4);
  for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { box(g, stone, dx * 2.7, 20.0, dz * 2.7, 0.5, 2.4, 0.5); ball(g, stone2, dx * 2.7, 22.7, dz * 2.7, 0.35); }
  for (let i = 0; i < 4; i++) gable(g, stone, 0, 20.0, 0, 4.8, 1.6, 4.8, (i * Math.PI) / 2); // little gables over the clocks
  hip(g, roof, 0, 20.0, 0, 5.6, 4.0, 5.6);
  cyl(g, stone2, 0, 24.0, 0, 0.9, 0.7, 8);
  ball(g, green, 0, 24.7, 0, 0.9, 0.9);
  finial(g, 0, 25.4, 0, 1.2);
  // the green flag of the revolution beside the tower
  cyl(g, '#d8d8d8', 8.5, 0.3, 8.5, 0.07, 10, 8);
  box(g, '#2e7d4f', 9.6, 8.6, 8.5, 2.2, 0.5, 0.05); box(g, '#ffffff', 9.6, 8.1, 8.5, 2.2, 0.5, 0.05); box(g, '#1f2326', 9.6, 7.6, 8.5, 2.2, 0.5, 0.05);
  for (const x of [-5, 5]) bench(g, x, 13);
}
idlibClock.label = 'ساعة إدلب';
idlibClock.top = 26.7;
idlibClock.size = [44, 44];

// ---------------------------------------------------------------- Freedom clock
// «ساعة الحرية»: a modern octagonal clock tower in the colours of the Syrian
// flag (green, white, black) with three red stars, in a ring of flag poles.
export function freedomClock(g) {
  const white = '#f7f5ee', green = '#2e7d4f', black = '#1f2326', red = '#d3322e';
  square(g, 44, 44, '#ebe7da', '#cfc7ae');
  cyl(g, '#2e7d4f', 0, 0.3, 0, 13.5, 0.2, 14);          // a round green lawn
  cyl(g, '#e9e5d6', 0, 0.3, 0, 12.2, 0.26, 14);
  cyl(g, white, 0, 0.5, 0, 6.2, 1.0, 8);
  cyl(g, green, 0, 1.5, 0, 5.4, 0.45, 8);
  cyl(g, white, 0, 1.95, 0, 4.2, 3.0, 8);
  for (let i = 0; i < 8; i++) { // eight pillars round the plinth
    const a = (i * Math.PI) / 4 + Math.PI / 8; cyl(g, white, Math.cos(a) * 3.6, 4.95, Math.sin(a) * 3.6, 0.3, 4.0, 8);
  }
  cyl(g, white, 0, 4.95, 0, 3.4, 0.35, 8);
  cyl(g, white, 0, 5.3, 0, 2.2, 9.0, 8);                // the shaft
  cyl(g, green, 0, 6.2, 0, 2.28, 0.9, 8); cyl(g, black, 0, 8.2, 0, 2.28, 0.9, 8); cyl(g, green, 0, 10.2, 0, 2.28, 0.9, 8);
  cyl(g, white, 0, 14.3, 0, 3.0, 0.5, 8);
  cyl(g, '#f1eee4', 0, 14.8, 0, 2.7, 4.6, 8);           // the clock drum
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2, f = face(g, Math.sin(a) * 2.5, Math.cos(a) * 2.5, a, 14.8);
    clockFace(f, 0, 2.3, 1.55, 3, 0);
  }
  cyl(g, black, 0, 19.4, 0, 3.1, 0.5, 8);
  put(g, GEO.halfBall, mat(green), 0, 19.9, 0, 2.9, 2.6, 2.9);
  cyl(g, '#d8d8d8', 0, 22.3, 0, 0.08, 3.6, 8);
  for (const [a, y] of [[0, 25.6], [2.1, 25.0], [4.2, 25.0]]) ball(g, red, Math.sin(a) * 0.6, y - 0.5, Math.cos(a) * 0.6, 0.34); // the three red stars
  // the ring of flag poles on the paving
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6, x = Math.sin(a) * 17, z = Math.cos(a) * 17;
    cyl(g, '#d8d8d8', x, 0.3, z, 0.06, 8.0, 8);
    box(g, green, x + 0.8, 7.2, z, 1.6, 0.34, 0.05); box(g, white, x + 0.8, 6.86, z, 1.6, 0.34, 0.05); box(g, black, x + 0.8, 6.52, z, 1.6, 0.34, 0.05);
  }
  for (const s of [-1, 1]) for (const t of [-1, 1]) { tree(g, s * 19.5, t * 19.5, 1.0); lamp(g, s * 9.5, t * 9.5); }
}
freedomClock.label = 'ساعة الحرية';
freedomClock.top = 26;
freedomClock.size = [44, 44];

// ---------------------------------------------------------------- Homs clock
// «ساعة حمص»: the old clock tower in Homs's Clock Square (al-Saa), striped
// black and white like the old houses of Homs, with the arcade of shops round.
export function homsClock(g) {
  const white = '#efe9d8', black = '#3a3d44', stone = '#e2d8be', roof = '#6d7a86', dark = '#3a2c26';
  square(g, 54, 54, '#ddd5c0', '#bfb393');
  for (const [x, z, w, d] of [[-21, -19, 8, 12], [21, -19, 8, 12], [-21, 19, 8, 12], [21, 19, 8, 12]]) { // the shops of the old market round the square
    box(g, stone, x, 0.3, z, w, 5.2, d); box(g, '#9a6a45', x, 5.5, z, w + 0.5, 0.35, d + 0.5);
    const f = face(g, x + (x > 0 ? -w / 2 : w / 2), z, x > 0 ? LEFT : RIGHT, 0.3);
    for (const dz of [-2.6, 2.6]) { arch(f, white, dz, 0, 0.03, 2.0, 3.6, 0.06); arch(f, dark, dz, 0, 0.06, 1.6, 3.3, 0.06); }
  }
  box(g, stone, 0, 0.36, 0, 8.6, 0.6, 8.6);
  ablaq(g, 0, 0.96, 0, 6.2, 7.0, 6.2, 14, [black, white]);
  sides(g, 3.1, 0.96, (f) => { arch(f, white, 0, 0, 0.03, 2.2, 4.2, 0.06, 0, true); arch(f, dark, 0, 0, 0.06, 1.8, 3.9, 0.06, 0, true); });
  box(g, stone, 0, 7.96, 0, 7.0, 0.5, 7.0);
  ablaq(g, 0, 8.46, 0, 5.6, 5.6, 5.6, 8, [black, white]);
  sides(g, 2.8, 8.46, (f) => clockFace(f, 0, 2.8, 1.9, 4, 20));
  box(g, stone, 0, 14.06, 0, 6.4, 0.5, 6.4);
  cyl(g, white, 0, 14.56, 0, 2.6, 3.0, 8);
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4 + Math.PI / 8; arch(face(g, Math.sin(a) * 2.45, Math.cos(a) * 2.45, a, 15.2), dark, 0, 0, 0.03, 0.8, 1.9, 0.06); }
  cyl(g, stone, 0, 17.56, 0, 2.9, 0.4, 8);
  put(g, GEO.halfBall, mat(roof), 0, 17.96, 0, 2.8, 3.4, 2.8);
  finial(g, 0, 21.2, 0, 1.2);
  for (const s of [-1, 1]) for (const t of [-1, 1]) { tree(g, s * 12, t * 12, 1.0); lamp(g, s * 7, t * 7); }
  for (const x of [-4.5, 4.5]) { bench(g, x, 7.5); bench(g, x, -7.5, BACK); }
}
homsClock.label = 'ساعة حمص';
homsClock.top = 23;
homsClock.size = [54, 54];

// ---------------------------------------------------------------- Aleppo Citadel
// «قلعة حلب»: the citadel on its great mound, ringed by a moat, with the long
// stone bridge to the fortified gate tower, the Ayyubid palace, the mosque and
// its minaret, and the towers round the wall. The mound is in the middle.
export function aleppoCitadel(g) {
  const stone = '#cdbf9a', stone2 = '#b9a982', dark = '#3a2c26', water = '#4aa8c8', glacis = '#c3b48c', roofC = '#8d8f95';
  cyl(g, '#b9b09a', 0, 0, 0, 74, 0.1, 14);                 // the paved ring outside the moat
  cyl(g, '#a89c80', 0, 0.1, 0, 64.5, 0.3, 14);
  cyl(g, water, 0, 0.3, 0, 62, 0.12, 14);                  // the moat
  taper(g, glacis, 0, 0.3, 0, 50, 38, 12, 16);             // the mound with its sloping stone skin
  cyl(g, stone, 0, 12.3, 0, 38, 0.8, 14);                  // the plateau
  // the wall and its towers
  const N = 20;
  for (let i = 0; i < N; i++) {
    const a = (i * 2 * Math.PI) / N, r = 36.6, x = Math.cos(a) * r, z = Math.sin(a) * r, ry = -(a + Math.PI / 2);
    box(g, stone, x, 13.1, z, 12.6, 6.4, 2.6, ry);
    crenels(g, stone2, x, 19.5, z, 12.4, 2.6, 7, ry);
  }
  for (let i = 0; i < N; i++) {
    const a = ((i + 0.5) * 2 * Math.PI) / N + Math.PI / N, r = 37.2, x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (i % 2) { cyl(g, stone, x, 13.1, z, 3.0, 9.0, 8); cyl(g, stone2, x, 22.1, z, 3.4, 0.5, 8); for (let k = 0; k < 8; k++) { const b = (k * Math.PI) / 4; box(g, stone2, x + Math.cos(b) * 3.1, 22.6, z + Math.sin(b) * 3.1, 0.8, 0.9, 0.8); } }
  }
  // the entrance tower on the visitor's side (+z) and the long bridge to it
  box(g, stone, 0, 11.0, 38.5, 16.0, 13.0, 9.0);
  box(g, stone2, 0, 24.0, 38.5, 17.4, 0.6, 10.4);
  crenels(g, stone2, 0, 24.6, 43.6, 17.0, 0.6, 7);
  for (const s of [-1, 1]) { cyl(g, stone, s * 8.4, 11.0, 42.2, 2.8, 13.4, 8); cyl(g, stone2, s * 8.4, 24.4, 42.2, 3.2, 0.5, 8); }
  const gate = face(g, 0, 43.0, 0, 11.0);
  arch(gate, '#e4d8b6', 0, 0, 0.02, 5.6, 8.4, 0.08, 0, true); arch(gate, dark, 0, 0, 0.06, 4.4, 7.6, 0.08, 0, true);
  box(g, stone2, 0, 11.0, 38.5, 12.0, 9.0, 10.0);          // the gate passage
  // bridge from the south edge of the moat up to the gate: seven arches
  box(g, stone, 0, 6.0, 56.0, 7.6, 1.0, 26.0);              // deck
  for (const s of [-1, 1]) box(g, stone2, s * 3.8, 7.0, 56.0, 0.5, 1.1, 26.0);
  box(g, stone, 0, 0.3, 69.0, 8.4, 5.7, 2.4);               // the abutment on the far bank
  for (let i = 0; i < 7; i++) {
    const z = 45.4 + i * 3.6;
    box(g, stone2, 0, 0.3, z, 7.6, 6.0, 0.9);               // piers
    for (const s of [-1, 1]) arch(face(g, s * 3.82, z + 1.8, s > 0 ? RIGHT : LEFT, 0.3), dark, 0, 0, 0.02, 2.4, 4.2, 0.06);
  }
  box(g, stone, 0, 6.0, 44.0, 7.6, 7.0, 2.4);               // the ramp up to the gate
  // inside: the palace, the mosque with its minaret, the barracks, the throne hall
  box(g, '#d8c9a0', -8, 13.1, -8, 18, 10, 12);              // Ayyubid palace
  box(g, stone2, -8, 23.1, -8, 18.8, 0.5, 12.8);
  const pf = face(g, -8, -1.9, 0, 13.1);
  arch(pf, '#efe4c4', -4, 0, 0.03, 3.4, 6.4, 0.06, 0, true); arch(pf, dark, -4, 0, 0.06, 2.8, 6.0, 0.06, 0, true);
  arch(pf, '#efe4c4', 4, 0, 0.03, 3.4, 6.4, 0.06, 0, true); arch(pf, dark, 4, 0, 0.06, 2.8, 6.0, 0.06, 0, true);
  for (const x of [-9, -3, 3]) arch(pf, '#2f4a5a', x * 0.9, 6.8, 0.05, 1.0, 1.8, 0.06, 0, true);
  box(g, '#cdbf9a', 12, 13.1, -9, 11, 6.5, 9);              // mosque hall
  put(g, GEO.halfBall, mat('#7a8a92'), 12, 19.6, -9, 4.0, 3.0, 4.0);
  finial(g, 12, 22.6, -9, 1.0);
  box(g, stone, 18.2, 13.1, -3, 2.4, 11, 2.4);              // minaret
  box(g, stone2, 18.2, 24.1, -3, 3.1, 0.4, 3.1);
  box(g, stone, 18.2, 24.5, -3, 1.6, 3.4, 1.6);
  put(g, GEO.halfBall, mat('#7a8a92'), 18.2, 27.9, -3, 1.2, 1.6, 1.2);
  finial(g, 18.2, 29.4, -3, 0.9);
  box(g, stone2, -14, 13.1, 10, 12, 4.5, 6);               // barracks
  gable(g, '#9a6a45', -14, 17.6, 10, 12.6, 1.8, 6.6);
  cyl(g, '#d8c9a0', 4, 13.1, 6, 4.2, 5.0, 8);              // throne hall with a dome
  put(g, GEO.halfBall, mat('#9aa3aa'), 4, 18.1, 6, 4.4, 3.0, 4.4);
  finial(g, 4, 21.1, 6, 0.9);
  cyl(g, '#d8d8d8', 0, 12.4, -22, 0.1, 17.0, 8);            // flag pole of the citadel
  box(g, '#2e7d4f', 1.6, 27.4, -22, 3.2, 0.7, 0.06); box(g, '#ffffff', 1.6, 26.7, -22, 3.2, 0.7, 0.06); box(g, '#1f2326', 1.6, 26.0, -22, 3.2, 0.7, 0.06);
  for (const [x, z] of [[-22, 18], [22, 20], [-30, -10], [26, -22]]) { cyl(g, '#d8d8d8', x, 12.4, z, 0.1, 1, 8); }
  for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5 + 0.3; tree(g, Math.cos(a) * 69, Math.sin(a) * 69 * (Math.sin(a) > 0.8 ? 1.0 : 1), 0.9); } // palms round the moat
  box(g, stone2, -8, 23.6, -8, 4, 1.5, 3);                  // a little lantern on the palace roof
}
aleppoCitadel.label = 'قلعة حلب';
aleppoCitadel.top = 32;
aleppoCitadel.size = [150, 150];

// ---------------------------------------------------------------- fortress helper (Krak, Marqab)
function fortress(g, o) {
  const { stone, stone2, hill, hillTop, R, h, n, towerR, towerH, keep, roof } = o;
  cyl(g, o.ground || '#b4a884', 0, 0, 0, R * 1.5, 0.12, 14);
  taper(g, hill, 0, 0.1, 0, R * 1.25, R * 0.97, h, 16); // the hill
  cyl(g, hillTop, 0, h + 0.1, 0, R * 0.97, 0.5, 14);
  const y0 = h + 0.6;
  // outer curtain wall with round towers
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n + Math.PI / n, r = R * 0.9, x = Math.cos(a) * r, z = Math.sin(a) * r, ry = -(a + Math.PI / 2), len = 2 * r * Math.sin(Math.PI / n) + 1;
    box(g, stone, x, y0, z, len, 7.0, 2.4, ry);
    crenels(g, stone2, x, y0 + 7.0, z, len, 2.4, Math.max(4, Math.round(len / 2.4)), ry);
  }
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n, r = R * 0.92, x = Math.cos(a) * r, z = Math.sin(a) * r;
    cyl(g, stone, x, y0, z, towerR, towerH, 8); cyl(g, stone2, x, y0 + towerH, z, towerR + 0.5, 0.5, 8);
    if (o.cones) cone(g, roof, x, y0 + towerH + 0.5, z, towerR + 0.5, 3.4);
  }
  // inner ward: a higher wall, the keep towers, a hall and a chapel
  const ri = R * 0.55, ni = 8;
  taper(g, stone2, 0, y0, 0, ri + 4, ri, 7.0, 16);           // the sloping base (the glacis) of the inner ward
  for (let i = 0; i < ni; i++) {
    const a = (i * 2 * Math.PI) / ni + Math.PI / ni, r = ri * 0.93, x = Math.cos(a) * r, z = Math.sin(a) * r, ry = -(a + Math.PI / 2), len = 2 * r * Math.sin(Math.PI / ni) + 1;
    box(g, stone, x, y0 + 7.0, z, len, 6.0, 2.2, ry);
    crenels(g, stone2, x, y0 + 13.0, z, len, 2.2, Math.max(4, Math.round(len / 2.4)), ry);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4, x = Math.cos(a) * ri * 0.95, z = Math.sin(a) * ri * 0.95, big = i === keep ? 1.3 : 1;
    cyl(g, stone, x, y0 + 7.0, z, 4.4 * big, 12.0 * big, 8); cyl(g, stone2, x, y0 + 7.0 + 12.0 * big, z, 4.9 * big, 0.6, 8);
    cone(g, roof, x, y0 + 7.6 + 12.0 * big, z, 4.9 * big, 5.2 * big);
    finial(g, x, y0 + 7.6 + 12.0 * big + 5.2 * big, z, 0.7);
  }
  box(g, '#d9ccaa', 0, y0 + 7.0, -3, 16, 7.0, 7);            // the great hall
  gable(g, roof, 0, y0 + 14.0, -3, 17, 3.2, 8);
  const hf = face(g, 0, 0.55, 0, y0 + 7.0);
  for (const x of [-5.4, -2.7, 0, 2.7, 5.4]) { arch(hf, '#efe4c4', x, 0, 0.03, 1.8, 4.4, 0.06, 0, true); arch(hf, '#3a2c26', x, 0, 0.06, 1.4, 4.0, 0.06, 0, true); }
  box(g, '#d9ccaa', 7, y0 + 7.0, 7, 6, 5.0, 9);              // the chapel
  gable(g, roof, 7, y0 + 12.0, 7, 6.5, 2.4, 9.4, RIGHT);
  // the gate and the ramp up to it, on the visitor's side
  const gz = R * 0.92;
  box(g, stone, 0, y0, gz + 1.0, 9.0, 9.0, 5.0);
  cyl(g, stone, -5.8, y0, gz + 1.6, 2.6, 10.0, 8); cyl(g, stone, 5.8, y0, gz + 1.6, 2.6, 10.0, 8);
  const gf = face(g, 0, gz + 3.55, 0, y0);
  arch(gf, '#e4d8b6', 0, 0, 0.02, 4.0, 6.4, 0.08, 0, true); arch(gf, '#3a2c26', 0, 0, 0.06, 3.2, 5.8, 0.08, 0, true);
  for (let i = 0; i < 7; i++) box(g, o.ramp || stone2, 0, h * (1 - i / 7) * 0.8 + 0.1, gz + 6 + i * (h * 0.38 / 7) * 2.4, 7.0, 0.5 + (h * (1 - i / 7)) * 0.1, 4.2);
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4 + 0.5; tree(g, Math.cos(a) * R * 1.32, Math.sin(a) * R * 1.32, 0.9); }
}

// «قلعة الحصن» (Crac des Chevaliers) in Wadi al-Nasara, west of Homs: the best
// preserved crusader castle, with its glacis, the round towers and the keep.
export function krak(g) {
  fortress(g, { stone: '#cfc3a2', stone2: '#b8aa86', hill: '#8fa56b', hillTop: '#a99a74', R: 50, h: 14, n: 12, towerR: 3.2, towerH: 11, keep: 0, roof: '#8a7a66', cones: true, ground: '#9bb36f' });
}
krak.label = 'قلعة الحصن';
krak.top = 56;
krak.size = [150, 150];

// «قلعة المرقب» (Margat) above Baniyas on the coast: dark basalt, a great round keep.
export function marqab(g) {
  fortress(g, { stone: '#4b4d55', stone2: '#3a3c44', hill: '#7b8f5a', hillTop: '#6c6f6a', R: 36, h: 12, n: 10, towerR: 2.8, towerH: 9, keep: 2, roof: '#34363c', cones: false, ground: '#8fa563', ramp: '#3a3c44' });
  cyl(g, '#4b4d55', 0, 12.7, 0, 8.4, 22, 8); cyl(g, '#3a3c44', 0, 34.7, 0, 9.0, 0.7, 8); // the keep: one huge round tower
  crenels(g, '#3a3c44', 0, 35.4, 8.6, 8, 1, 4);
  put(g, GEO.halfBall, mat('#8d8f95'), 0, 35.4, 0, 6.5, 3.2, 6.5);
  finial(g, 0, 38.6, 0, 1.1);
}
marqab.label = 'قلعة المرقب';
marqab.top = 44;
marqab.size = [110, 110];

// ---------------------------------------------------------------- Palmyra
// «تدمر»: the Temple of Bel, the Great Colonnade with its monumental arch and
// the tetrapylon, and the tower tombs on the hills behind, in the desert.
export function palmyra(g) {
  const sand = '#d9b98a', pale = '#e6cfa2', dark = '#3a2c26', granite = '#b78a6b';
  box(g, '#e3cf9d', 0, 0, 0, 200, 0.2, 110);               // the desert floor of the site
  // the Temple of Bel, at the left
  const bx = -62, bz = -6;
  box(g, '#d8c496', bx, 0.2, bz, 44, 0.8, 44);             // the sanctuary court
  box(g, sand, bx, 1.0, bz, 20, 2.0, 30);                    // the temple platform
  box(g, pale, bx, 3.0, bz, 11, 11, 20);                     // the cella
  const cf = face(g, bx, bz + 10.02, 0, 3.0);
  arch(cf, '#f1e3be', 0, 0, 0.03, 3.8, 7.4, 0.06); arch(cf, dark, 0, 0, 0.06, 3.0, 6.9, 0.06);
  for (let i = 0; i < 8; i++) for (const s of [-1, 1]) { const z = bz - 13 + i * 3.8; cyl(g, pale, bx + s * 8.4, 3.0, z, 0.6, 10.6, 8); box(g, sand, bx + s * 8.4, 13.6, z, 1.5, 0.5, 1.5); }
  for (let i = 0; i < 4; i++) for (const z of [bz - 14.5, bz + 14.5]) { cyl(g, pale, bx - 6 + i * 4, 3.0, z, 0.6, 10.6, 8); box(g, sand, bx - 6 + i * 4, 13.6, z, 1.5, 0.5, 1.5); }
  box(g, sand, bx, 13.6, bz, 18.5, 0.7, 29.5);               // the stone roof
  for (let i = 0; i < 7; i++) for (const s of [-1, 1]) cyl(g, sand, bx + s * 20.5, 0.2, bz - 19.5 + i * 6.5, 0.45, 5, 8); // the old court's columns
  // the Great Colonnade: two rows of columns along the middle, then the arch and the tetrapylon
  for (let i = 0; i < 26; i++) for (const s of [-1, 1]) {
    const x = -22 + i * 3.6, z = 4 + s * 5.6;
    cyl(g, pale, x, 0.2, z, 0.5, 7.2, 8); box(g, sand, x, 7.4, z, 1.2, 0.5, 1.2);
  }
  for (let i = 0; i < 25; i++) box(g, pale, -20.2 + i * 3.6, 7.9, 4 - 5.6, 3.6, 0.5, 0.8), box(g, pale, -20.2 + i * 3.6, 7.9, 4 + 5.6, 3.6, 0.5, 0.8);
  box(g, '#cfb88a', 25, 0.2, 4, 100 - 22, 0.05, 9);          // the paved street
  // the monumental arch (a gate with two side bays)
  const ax = -22 - 7, az = 4;
  box(g, pale, ax, 0.2, az, 5.2, 12, 13, 0); box(g, pale, ax, 0.2, az - 9.2, 2.2, 8, 5.6); box(g, pale, ax, 0.2, az + 9.2, 2.2, 8, 5.6);
  const af = face(g, ax + 2.62, az, RIGHT, 0.2);
  arch(af, dark, 0, 0, 0.02, 5.4, 10.0, 0.06);
  const af2 = face(g, ax - 2.62, az, LEFT, 0.2);
  arch(af2, dark, 0, 0, 0.02, 5.4, 10.0, 0.06);
  // the tetrapylon: four groups of four granite columns
  const tx = 40, tz = 4;
  box(g, pale, tx, 0.2, tz, 12, 0.8, 12);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const dx of [-1, 1]) for (const dz of [-1, 1]) {
    cyl(g, granite, tx + sx * 3.8 + dx * 0.7, 1.0, tz + sz * 3.8 + dz * 0.7, 0.42, 6.0, 8);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, sand, tx + sx * 3.8, 7.0, tz + sz * 3.8, 3.2, 0.6, 3.2);
  // the tower tombs of the Valley, on the hills behind
  taper(g, '#c9a977', 70, 0.2, -34, 26, 14, 9, 8);
  taper(g, '#c9a977', -4, 0.2, -42, 22, 11, 7, 8);
  for (const [x, z, h] of [[62, -34, 11], [76, -30, 9], [70, -42, 12]]) { box(g, sand, x, 9.2, z, 4.4, h, 4.4); box(g, pale, x, 9.2 + h, z, 4.8, 0.5, 4.8); }
  for (const [x, z, h] of [[-8, -42, 10], [2, -40, 8]]) { box(g, sand, x, 7.2, z, 4.0, h, 4.0); box(g, pale, x, 7.2 + h, z, 4.4, 0.5, 4.4); }
  // the Arab castle (Qalaat Ibn Maan) on its hill, far left-back
  taper(g, '#bd9b6c', -86, 0.2, -42, 17, 9, 17, 8);
  box(g, '#8b7a5e', -86, 17.2, -42, 9, 4, 9);
  for (const dx of [-3.4, 3.4]) for (const dz of [-3.4, 3.4]) cyl(g, '#7a6a50', -86 + dx, 17.2, -42 + dz, 1.4, 6, 8);
  for (const [x, z] of [[-38, 40], [-30, 44], [10, 42], [36, 44], [62, 40], [80, 30]]) tree(g, x, z, 0.85, 'palm');
}
palmyra.label = 'تدمر';
palmyra.top = 22;
palmyra.size = [200, 110];

// the list the city reads: id, Arabic zone name, real place (lon, lat), model, ground colour
export const ZONES = [
  { id: 'aleppo', zone: 'منطقة حلب', place: 'قلعة حلب', at: [37.162, 36.199], model: aleppoCitadel, ground: '#d9cfae' },
  { id: 'idlib', zone: 'منطقة إدلب', place: 'ساعة إدلب', at: [36.631, 35.931], model: idlibClock, ground: '#cfd9b0' },
  { id: 'freedom', zone: 'منطقة الحرية', place: 'ساعة الحرية', at: [36.45, 35.86], model: freedomClock, ground: '#cfd9b0' },
  { id: 'homs', zone: 'منطقة حمص', place: 'ساعة حمص', at: [36.719, 34.727], model: homsClock, ground: '#d6d0b4' },
  { id: 'krak', zone: 'منطقة وادي النصارى', place: 'قلعة الحصن', at: [36.295, 34.757], model: krak, ground: '#a9bf7a' },
  { id: 'marqab', zone: 'منطقة بانياس', place: 'قلعة المرقب', at: [35.95, 35.18], model: marqab, ground: '#a6bd78' },
  { id: 'palmyra', zone: 'منطقة تدمر', place: 'تدمر', at: [38.268, 34.551], model: palmyra, ground: '#e3cf9d' },
];
