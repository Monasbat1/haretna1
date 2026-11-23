// «الأردن»: a white-stone house of Amman, and the Treasury of Petra carved in
// a rose-red cliff. Houses sit on the 7 x 9 plot (+z is the street); the
// landmark takes four city blocks (64 x 40), +z towards the visitor.
import * as THREE from 'three';
import { C, GEO, put, box, cyl, cone, taper, ball, gable, ramp, face, win, door, ablaq, lot, tree, vine, pot, railing, rng, shine, arch, RIGHT, LEFT, BACK } from './kit.js';
import { cliff, strata, rock, crowd, person, camel, lamp, flagPole } from './world.js';

// ---------------------------------------------------------------- the house of Amman
const LOOKS = [
  { stone: ['#f0e8d6', '#e7ddc8'], door: '#2f5d55', rail: '#2b2d33', trees: ['olive', 'lemon'], flower: '#e0457b' },
  { stone: ['#ece0c6', '#e2d4b6'], door: '#6b3f26', rail: '#f2f2f2', trees: ['lemon', 'olive'], flower: '#f4c542' },
  { stone: ['#f3eee2', '#e9e2d2'], door: '#3d4a6b', rail: '#2b2d33', trees: ['olive', 'citrus'], flower: '#ffffff' },
];
const TRIM = '#d6caaf', TANK = '#26272b';

export function jordanHouse(g, v = {}) {
  const look = { ...LOOKS[0], ...v };
  if (!v.bare) lot(g);
  box(g, '#ddd5c4', 0, 0, 0.1, 6.6, 0.05, 8.2);
  box(g, '#8fcf7a', 1.6, 0.05, 2.35, 3.0, 0.05, 3.0); // a patch of garden
  // two floors of Amman stone, the floors marked by a stone band
  ablaq(g, 0, 0.05, -1.7, 5.8, 5.65, 4.2, 18, look.stone);
  box(g, TRIM, 0, 2.85, -1.7, 6.0, 0.16, 4.4);
  for (const [x, z, w, d] of [[0, 0.33, 5.8, 0.14], [0, -3.73, 5.8, 0.14], [-2.83, -1.7, 0.14, 4.2], [2.83, -1.7, 0.14, 4.2]]) box(g, look.stone[0], x, 5.7, z, w, 0.5, d);
  for (const [x, z, w, d] of [[0, 0.33, 6.0, 0.24], [0, -3.73, 6.0, 0.24], [-2.9, -1.7, 0.24, 4.4], [2.9, -1.7, 0.24, 4.4]]) box(g, TRIM, x, 6.2, z, w, 0.08, d);

  const f = face(g, 0, 0.4);
  // ground floor: a metal door up three steps, a big window with a grille
  for (let i = 0; i < 3; i++) box(g, TRIM, -1.5, 0.05 + i * 0.12, 0.95 - i * 0.22, 1.7 - i * 0.15, 0.12, 1.1 - i * 0.44);
  door(f, -1.5, 1.0, 2.2, look.door, { frame: TRIM, y: 0.4 });
  box(f, look.door, -1.5, 2.66, 0.07, 1.0, 0.1, 0.06);
  win(f, 1.25, 0.95, 1.5, 1.3, { frame: TRIM, glass: C.glass, bars: false });
  for (let i = 0; i < 6; i++) box(f, look.rail, 0.6 + i * 0.26, 0.9, 0.12, 0.04, 1.4, 0.04);
  for (const y of [0.95, 1.6, 2.2]) box(f, look.rail, 1.25, y, 0.12, 1.55, 0.04, 0.04);
  // first floor: a balcony with a railing, a balcony door and a window
  box(g, TRIM, 0.9, 2.9, 0.95, 3.6, 0.16, 1.1);
  railing(g, -0.9, 1.45, 2.7, 1.45, 3.06, 0.9, look.rail);
  railing(g, -0.9, 0.45, -0.9, 1.45, 3.06, 0.9, look.rail);
  railing(g, 2.7, 0.45, 2.7, 1.45, 3.06, 0.9, look.rail);
  win(f, 0.9, 3.1, 1.0, 2.0, { frame: TRIM, glass: '#9fc9d8' });
  win(f, -1.9, 3.6, 0.9, 1.25, { frame: TRIM, glass: C.glass, sill: TRIM });
  for (const x of [0.2, 1.65]) { box(g, '#f4f4f0', x, 3.06, 1.0, 0.42, 0.42, 0.42); box(g, '#f4f4f0', x, 3.48, 0.82, 0.42, 0.42, 0.06); } // two plastic chairs
  pot(g, 2.35, 3.06, 1.15, 0.8, C.leaf, look.flower);
  const fr = face(g, 2.9, -1.7, RIGHT);
  for (const x of [-1.0, 1.0]) { win(fr, x, 0.95, 0.8, 1.2, { frame: TRIM }); win(fr, x, 3.6, 0.8, 1.2, { frame: TRIM }); }
  const fl = face(g, -2.9, -1.7, LEFT);
  win(fl, 0, 3.6, 0.8, 1.2, { frame: TRIM });

  // the roof: black water tanks on a stand, a solar heater, the stair room, a dish and washing
  const R = 5.7;
  for (const [x, z] of [[-1.9, -3.0], [-1.0, -3.0], [-1.9, -2.1]]) { box(g, '#55585f', x, R, z, 0.7, 0.5, 0.7); cyl(g, TANK, x, R + 0.5, z, 0.38, 0.95, 10); }
  const sol = face(g, 1.4, -3.0, 0, R);
  for (const s of [-1, 1]) box(sol, '#9aa0a8', s * 0.75, 0, 0.35, 0.06, 0.9, 0.06);
  put(sol, GEO.box, '#2c4a6e', 0, 0.35, 0, 1.7, 0.06, 1.1).rotation.x = -0.65;
  cyl(sol, '#f1f1ee', -0.9, 1.0, -0.35, 0.28, 1.8, 10).rotation.z = -Math.PI / 2;
  box(g, look.stone[1], 1.6, R, -1.4, 1.7, 2.1, 1.6);
  box(g, TRIM, 1.6, R + 2.1, -1.4, 1.9, 0.12, 1.8);
  door(face(g, 1.6, -0.6, 0, R), 0, 0.75, 1.8, '#5a5f66', { knob: null });
  put(g, GEO.halfBall, '#f4f4f0', -2.3, R + 0.8, -0.6, 0.45, 0.18, 0.45).rotation.x = 0.9;
  cyl(g, '#9aa0a8', -2.3, R, -0.6, 0.04, 0.85, 6);
  for (const x of [-1.8, 0.2]) box(g, '#9aa0a8', x, R, -0.6, 0.05, 1.4, 0.05);
  box(g, '#cfcfcf', -0.8, R + 1.35, -0.6, 2.0, 0.02, 0.02);
  ['#e3b23c', '#2f6f9f', '#f4f1ea', '#c0392b'].forEach((c, i) => box(g, c, -1.5 + i * 0.45, R + 0.85, -0.6, 0.34, 0.5, 0.03));

  // the street wall, an iron gate, the olive tree and the jasmine
  ablaq(g, 1.65, 0.05, 4.0, 3.3, 0.85, 0.28, 3, look.stone);
  ablaq(g, -2.95, 0.05, 4.0, 0.7, 0.85, 0.28, 3, look.stone);
  box(g, TRIM, 1.65, 0.9, 4.0, 3.4, 0.08, 0.36);
  box(g, TRIM, -2.95, 0.9, 4.0, 0.8, 0.08, 0.36);
  for (const s of [-1, 1]) ablaq(g, s * 3.15, 0.05, 2.2, 0.28, 0.85, 3.4, 3, look.stone);
  for (const x of [-2.55, -0.05]) { box(g, look.stone[1], x, 0.05, 4.0, 0.4, 1.3, 0.4); box(g, TRIM, x, 1.35, 4.0, 0.48, 0.08, 0.48); }
  for (let i = 0; i < 9; i++) box(g, look.rail, -2.3 + i * 0.27, 0.05, 4.0, 0.04, 1.1, 0.04);
  box(g, look.rail, -1.3, 1.1, 4.0, 2.3, 0.05, 0.05);
  tree(g, 1.8, 2.5, 0.85, look.trees[0]);
  tree(g, -2.5, 2.0, 0.6, look.trees[1]);
  vine(face(g, 1.65, 4.15), 0, 0.3, 3.0, 0.9, 12, { dots: ['#ffffff'], seed: 7 });
  pot(g, -0.6, 0.45, 1.3, 0.9, C.leaf, look.flower);
  pot(g, -2.4, 0.05, 0.9, 1.0, C.leaf, '#ffffff');
}
jordanHouse.looks = LOOKS;
jordanHouse.top = 7.8;
jordanHouse.flag = [2.5, 6.28, -3.4]; // where the pole of the owner's flag stands on the roof

// ---------------------------------------------------------------- Petra: the Treasury
const ROSE = ['#d48a6c', '#cc8064', '#da9373', '#c77b60', '#d98f70', '#cf8467', '#e09a79'];
const CAPS = ['#c27458', '#d68f70', '#b06450'];
const CARVED = '#e2a183', CARVED2 = '#d89478', SHADE = '#3a2520', SAND = '#e6c39b';
const CANDLE = shine('#ffcf73', 3); // Petra by Night: the candles on the sand

export function petra(g) {
  const rand = rng(312); // 312 BC: the first time the Nabataeans are written about
  box(g, SAND, 0, 0, 0, 63.6, 0.2, 39.6);
  const Y = 0.2, ZW = -7.5; // the carved wall of the facade

  // the cliffs: behind the Treasury, and the two walls of the Siq coming round to the front
  const smooth = { y0: Y, caps: CAPS, step: 4.6, jitter: 0.3, layer: [2.6, 4.4] };
  cliff(g, [[-32, -14, 30], [-12, -15, 42], [12, -15, 42], [32, -14, 30]], ROSE, rand, { ...smooth, thick: 11 });
  for (const s of [-1, 1]) {
    cliff(g, [[s * 13, -9, 38], [s * 15, 0, 30], [s * 11.5, 8, 21], [s * 7, 15, 13], [s * 5, 19.5, 9]], ROSE, rand, { ...smooth, thick: 7 });
    cliff(g, [[s * 22, -6, 27], [s * 26, 4, 19], [s * 20, 14, 12], [s * 12, 19, 8]], ROSE, rand, { ...smooth, thick: 9 });
    strata(g, s * 28, 14, 7, 8, Y, 7, ROSE, rand, { jitter: 0.3, layer: [2.4, 3.6] });
  }
  box(g, '#c97a5e', 0, Y, -11.5, 26, 42, 8); // the rock the facade is cut from

  // --- lower storey: six columns, the portico and its pediment
  box(g, CARVED2, 0, Y, ZW + 0.9, 21, 0.9, 3.4);
  box(g, CARVED, 0, Y, ZW - 0.6, 21, 15.0, 1.2);
  box(g, SHADE, 0, Y + 0.9, ZW + 0.05, 3.2, 7.2, 0.1);                   // the dark doorway
  box(g, CARVED2, 0, Y + 8.1, ZW + 0.1, 3.9, 0.5, 0.25);
  for (const x of [-5.2, 5.2]) { box(g, SHADE, x, Y + 0.9, ZW + 0.05, 1.6, 4.2, 0.1); box(g, CARVED2, x, Y + 5.1, ZW + 0.1, 2.0, 0.3, 0.2); }
  for (const x of [-8.6, -5.2, -1.8, 1.8, 5.2, 8.6]) {
    const z = Math.abs(x) > 8 ? ZW + 0.3 : ZW + 1.6;
    box(g, CARVED2, x, Y + 0.9, z, 1.6, 0.6, 1.6);
    cyl(g, CARVED, x, Y + 1.5, z, 0.62, 9.6, 12);
    taper(g, CARVED2, x, Y + 11.1, z, 0.65, 1.0, 1.0, 8);
  }
  box(g, CARVED2, 0, Y + 12.1, ZW + 0.9, 19.6, 0.7, 2.4);
  box(g, CARVED, 0, Y + 12.8, ZW + 0.9, 19.6, 0.8, 2.4);                  // frieze
  box(g, CARVED2, 0, Y + 13.6, ZW + 0.95, 20.4, 0.35, 2.6);              // cornice
  gable(g, CARVED, 0, Y + 13.95, ZW + 1.3, 1.6, 2.9, 11.6, RIGHT);       // pediment
  gable(g, CARVED2, 0, Y + 13.95, ZW + 2.1, 0.2, 2.5, 10.4, RIGHT);
  for (const s of [-1, 1]) { // the two riders between the outer columns (worn by time)
    box(g, CARVED2, s * 6.9, Y + 1.5, ZW + 0.15, 1.2, 2.4, 0.3);
    box(g, CARVED2, s * 6.9, Y + 3.6, ZW + 0.15, 0.6, 1.4, 0.35);
  }

  // --- upper storey: the round tholos between two half-pavilions with broken pediments
  const U = Y + 15.0;
  box(g, CARVED2, 0, U - 0.6, ZW + 0.2, 20.4, 0.6, 1.4);
  box(g, CARVED, 0, U, ZW - 0.6, 21, 14.5, 1.2);
  cyl(g, CARVED, 0, U, ZW + 0.4, 2.5, 9.6, 16);                            // tholos drum
  for (let i = 0; i < 7; i++) { const a = Math.PI * (0.1 + (0.8 * i) / 6); cyl(g, CARVED2, Math.cos(a) * 3.0, U, ZW + 0.4 + Math.sin(a) * 3.0, 0.32, 9.6, 8); }
  cyl(g, CARVED2, 0, U + 9.6, ZW + 0.4, 3.45, 0.9, 16);
  taper(g, CARVED, 0, U + 10.5, ZW + 0.4, 3.2, 0.5, 3.0, 16);             // the roof of the tholos
  taper(g, CARVED2, 0, U + 13.5, ZW + 0.4, 0.45, 0.75, 0.9, 10);
  ball(g, CARVED, 0, U + 14.9, ZW + 0.4, 0.95, 1.1);                       // the urn
  cyl(g, CARVED2, 0, U + 15.9, ZW + 0.4, 0.3, 0.7, 8);
  for (const s of [-1, 1]) {
    box(g, CARVED, s * 7.1, U, ZW + 0.2, 4.6, 9.6, 1.2);
    for (const x of [s * 5.2, s * 9.0]) cyl(g, CARVED2, x, U, ZW + 1.0, 0.42, 9.6, 10);
    box(g, SHADE, s * 7.1, U + 1.0, ZW + 0.85, 1.4, 4.0, 0.1);
    box(g, CARVED2, s * 7.1, U + 9.6, ZW + 0.7, 5.2, 0.9, 1.9);
    ramp(g, CARVED, s * 7.6, U + 10.5, ZW + 0.7, 3.6, 1.9, 1.7, s > 0 ? BACK : 0); // half a pediment, high side towards the tholos
    taper(g, CARVED2, s * 9.3, U + 10.5, ZW + 0.7, 0.4, 0.65, 0.9, 8);
    ball(g, CARVED, s * 9.3, U + 11.7, ZW + 0.7, 0.55, 1.1);
  }

  // --- the square in front: sand, camels, people, and rows of candles for the night
  for (let row = 0; row < 7; row++) for (let i = 0; i < 9; i++) {
    const x = (i - 4) * 1.6 + (row % 2) * 0.8, z = ZW + 5 + row * 1.5;
    if (Math.abs(x) < 1.3) continue;
    box(g, '#f1e3c6', x, Y, z, 0.24, 0.22, 0.24);
    box(g, CANDLE, x, Y + 0.22, z, 0.12, 0.08, 0.12);
  }
  for (const x of [-1.1, 1.1]) for (let z = ZW + 4; z < 19; z += 1.3) { box(g, '#f1e3c6', x, Y, z, 0.24, 0.22, 0.24); box(g, CANDLE, x, Y + 0.22, z, 0.12, 0.08, 0.12); }
  camel(g, -6.5, Y, 5.0, 0.4);
  camel(g, -8.0, Y, 7.5, -0.2, { saddle: '#2f5d8a' });
  camel(g, 7.5, Y, 6.0, Math.PI - 0.3, { saddle: '#d9a441' });
  crowd(g, 22, [-10, 10, -2, 15], rand, { y: Y, free: (x) => Math.abs(x) > 1.6 });
  crowd(g, 6, [-3, 3, 15, 22], rand, { y: Y });
  // a Bedouin tea tent at the side
  const tent = face(g, 9.6, 0.5, -0.4, Y);
  for (const [x, z] of [[-1.4, -1], [1.4, -1], [-1.4, 1], [1.4, 1]]) box(tent, '#5a3620', x, 0, z, 0.1, 2.0, 0.1);
  box(tent, '#2b2420', 0, 2.0, 0, 3.2, 0.12, 2.4);
  for (let i = 0; i < 6; i++) box(tent, i % 2 ? '#b2263c' : '#f1e3c6', -1.35 + i * 0.54, 2.12, 1.2, 0.54, 0.25, 0.06);
  box(tent, '#b2263c', 0, 0, -0.6, 2.8, 0.35, 0.8);
  lamp(tent, 1.4, 1.2, 1.05, { h: 0.6, color: '#5a3620' });
  petra.flag = { code: 'jo', ...flagPole(g, 0, Y + 42, -9, 13) }; // on the cliff top, right over the Treasury
}
petra.label = 'البتراء';
petra.top = 56;
petra.size = [64, 40];

// The portraits of His Majesty King Abdullah II and His Royal Highness Crown
// Prince Hussein on the cliff top over the Treasury, either side of the flag,
// in gold royal frames with a crown on each, and over them the banner «المملكة
// الأردنية الهاشمية» (the user, 2026-11-20, with the pictures). The pictures, the
// names and the words are drawn by the city on the spots given in ROYAL.
const RGOLD = shine('#d4af37', 2.6), RGOLD2 = shine('#c9a032', 2.3), RJEWEL = shine('#d42a2a', 2.8), RBLUE = shine('#2a5bd4', 2.8);
const VELVET = '#7a1020', WOOD_DARK = '#2a1414';
const FZ = -10, PW = 13, PH = 17, FB = 46.5; // frame centre z, picture size, bottom of the frames
export const ROYAL = {
  frames: [
    { who: 'king', x: 18.5, y: FB + 1.0 + PH / 2, w: PW, h: PH, plaque: 'جلالة الملك عبدالله الثاني ابن الحسين' },
    { who: 'prince', x: -18.5, y: FB + 1.0 + PH / 2, w: PW, h: PH, plaque: 'سمو الأمير الحسين بن عبدالله الثاني · ولي العهد' },
  ],
  z: FZ + 0.42,                             // the pictures' face
  plaque: { dy: -(PH / 2 + 2.6), w: 15, h: 2.0 },
  banner: { x: 0, y: 76, w: 50, h: 5.4 }, // «المملكة الأردنية الهاشمية»
};
function crown(g, x, y, z, s) {
  box(g, RGOLD, x, y, z, 4.6 * s, 1.0 * s, 1.0 * s);
  for (let i = -2; i <= 2; i++) {
    const h = (i === 0 ? 2.6 : Math.abs(i) === 1 ? 2.0 : 1.5) * s;
    cone(g, RGOLD2, x + i * 1.0 * s, y + 1.0 * s, z, 0.42 * s, h);
    ball(g, i === 0 ? RBLUE : RJEWEL, x + i * 1.0 * s, y + 1.0 * s + h, z, 0.26 * s);
  }
  for (const dx of [-1.5, 0, 1.5]) ball(g, RJEWEL, x + dx * s, y + 0.5 * s, z + 0.5 * s, 0.22 * s);
}
export function royalFrames(g) {
  for (const f of ROYAL.frames) {
    const { x } = f, cy = f.y;
    box(g, '#c97a5e', x, 33, FZ - 1.4, PW + 3, FB - 33, 2.4);                         // the stone plinth on the cliff
    box(g, RGOLD2, x, FB - 0.6, FZ - 0.2, PW + 3.4, 0.6, 3.0);
    box(g, WOOD_DARK, x, FB, FZ - 0.5, PW + 2.8, PH + 2.4, 0.6);                      // the back
    // the gold frame, its moulding and the red velvet inside it
    for (const [dx, dy, w, h] of [[0, -PH / 2 - 0.6, PW + 2.6, 1.2], [0, PH / 2 - 0.6, PW + 2.6, 1.2], [-PW / 2 - 0.6, -PH / 2, 1.2, PH], [PW / 2 + 0.6, -PH / 2, 1.2, PH]]) {
      box(g, RGOLD, x + dx, cy + dy, FZ, w, h + (h > 2 ? 0 : 0), 0.9);
    }
    for (const [dx, dy, w, h] of [[0, -PH / 2 - 0.05, PW + 0.6, 0.35], [0, PH / 2 - 0.3, PW + 0.6, 0.35], [-PW / 2 - 0.15, -PH / 2, 0.35, PH], [PW / 2 + 0.15, -PH / 2, 0.35, PH]]) {
      box(g, VELVET, x + dx, cy + dy, FZ + 0.1, w, h, 0.7);
    }
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {                               // the corner rosettes
      ball(g, RGOLD2, x + sx * (PW / 2 + 0.6), cy + sy * (PH / 2 + 0.6), FZ + 0.5, 0.95);
      ball(g, RJEWEL, x + sx * (PW / 2 + 0.6), cy + sy * (PH / 2 + 0.6), FZ + 1.3, 0.35);
    }
    for (const sy of [-1, 1]) ball(g, RGOLD2, x, cy + sy * (PH / 2 + 0.6), FZ + 0.5, 0.7);       // and the middle ones
    for (const sx of [-1, 1]) ball(g, RGOLD2, x + sx * (PW / 2 + 0.6), cy, FZ + 0.5, 0.7);
    crown(g, x, cy + PH / 2 + 1.2, FZ, 1.25);
    // the name plaque under the picture
    box(g, RGOLD, x, cy + ROYAL.plaque.dy - ROYAL.plaque.h / 2 - 0.25, FZ + 0.2, ROYAL.plaque.w + 0.5, ROYAL.plaque.h + 0.5, 0.5);
  }
  // the banner over them, on two gold posts, a crown at each end
  const B = ROYAL.banner;
  for (const s of [-1, 1]) {
    cyl(g, RGOLD2, s * (B.w / 2 + 0.6), 34, FZ - 1.2, 0.35, B.y - 34 + B.h / 2, 10);
    ball(g, RGOLD, s * (B.w / 2 + 0.6), B.y + B.h / 2 + 0.4, FZ - 1.2, 0.8);
    crown(g, s * (B.w / 2 - 3), B.y + B.h / 2 + 0.6, FZ - 0.9, 1.0);
  }
  box(g, RGOLD, 0, B.y - B.h / 2 - 0.5, FZ - 0.9, B.w + 1.2, B.h + 1.0, 0.5);
}

// ---------------------------------------------------------------- the Roman Theatre of Amman
// One block (28.6 x 16.6), +z the street. The half circle of stone seats in
// three tiers, cut into the hill of Jabal al-Jofeh with white houses on it,
// the orchestra and the low stage with its row of columns, and the paving in
// front. At night the seats are lit warm from below and the columns glow.
const LIME = ['#dfba84', '#d6ae76', '#e6c592', '#cfa66f'];   // the honey limestone of the seats
const AISLE = '#efdab0', HILL = ['#cdb48c', '#c2a77d', '#d6bf98', '#b99c72'];
const TY = 0.2, CZ = 3.2; // the ground, and the centre of the orchestra
const sectorGeos = new Map();
// A flat ring between radii r1 and r2 over the half circle behind the centre (the -z side), h high.
function sectorGeo(r1, r2, h) {
  const key = [r1, r2, h].join('/');
  if (!sectorGeos.has(key)) {
    const s = new THREE.Shape();
    s.absarc(0, 0, r2, 0, Math.PI, false);
    s.absarc(0, 0, r1, Math.PI, 0, true);
    sectorGeos.set(key, new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 22 }).rotateX(-Math.PI / 2));
  }
  return sectorGeos.get(key);
}
// The rows of seats: inner radius, depth and top of each, worked out once.
const ROWS = (() => {
  const rows = [];
  let r = 3.2, y = TY;
  for (const [n, run, rise, step] of [[6, 0.55, 0.42, 0], [5, 0.55, 0.48, 0.6], [2, 0.55, 0.62, 0.6]]) {
    if (step) { rows.push({ r, run: 0.45, top: y + 0.08, walk: true }); r += 0.45; y += step; } // the walkway between two tiers
    for (let i = 0; i < n; i++) { y += rise; rows.push({ r, run, top: y }); r += run; }
  }
  return rows;
})();
const RIM = ROWS[ROWS.length - 1].r + ROWS[ROWS.length - 1].run; // the outer edge of the top row
const STAGE_COLS = [-8.4, -6.0, -3.6, -1.2, 1.2, 3.6, 6.0, 8.4];
const FLAG_SPOTS = []; // where the audience's flags fly (the top of each stick), filled in by theatre()
const STAGE_Y = TY + 1.12; // the top of the stage
// The concert's light rig: a truss over the stage on two towers, and floodlights on poles round the top of the seats.
const TRUSS = { y: 10.2, z: 3.9, x: 10.2 };
const HEADS = [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5];     // the moving heads hanging from the truss
const HEAD_COLORS = ['#fffbe8', '#4cff7a', '#ff4a4a', '#ff4a4a', '#4cff7a', '#fffbe8'].map((c) => shine(c, 3)); // white, green and red: the flag's colours
const RIM_LIGHTS = [0.1, 0.3, 0.5, 0.7, 0.9].map((t) => t * Math.PI);

export function theatre(g) {
  const rand = rng(161); // the theatre was built about AD 161
  box(g, '#e7d7b8', 0, 0, 0, 28.6, TY, 16.6);

  // --- the seats
  ROWS.forEach((row, i) => put(g, sectorGeo(row.r, row.r + row.run, row.top - TY), row.walk ? AISLE : LIME[i % LIME.length], 0, TY, CZ));
  put(g, sectorGeo(RIM, RIM + 0.35, ROWS[ROWS.length - 1].top + 0.5 - TY), '#c99f68', 0, TY, CZ); // the wall round the top
  // the stairs between the wedges of seats: lighter strips running up the rows
  const tiers = [[0, 6, [0.12, 0.33, 0.5, 0.67, 0.88]], [7, 12, [0.2, 0.4, 0.6, 0.8]], [13, 15, [0.25, 0.5, 0.75]]];
  for (const [i0, i1, at] of tiers) for (const t of at) for (let i = i0; i < Math.min(i1, ROWS.length); i++) {
    const row = ROWS[i], a = t * Math.PI;
    if (row.walk) continue;
    const rm = row.r + row.run / 2, ry = Math.atan2(Math.cos(a), -Math.sin(a));
    box(g, AISLE, Math.cos(a) * rm, row.top, CZ - Math.sin(a) * rm, 0.5, 0.03, row.run + 0.02, ry);
  }
  // a full house for the concert: the audience on every row (not on the stairs), and every few of
  // them holding up a flag of Jordan on a stick (the cloth is drawn and waved by theatreFlags)
  FLAG_SPOTS.length = 0;
  let who = 0;
  for (const [i0, i1, at] of tiers) for (let i = i0; i < Math.min(i1, ROWS.length); i++) {
    const row = ROWS[i];
    if (row.walk) continue;
    const rm = row.r + row.run * 0.55, step = 0.62 / rm;
    for (let a = 0.03 * Math.PI + rand() * step; a < 0.97 * Math.PI; a += step * (0.85 + rand() * 0.4)) {
      if (at.some((t) => Math.abs(a - t * Math.PI) * rm < 0.5) || rand() < 0.12) continue; // the stairs, and a few empty seats
      const x = Math.cos(a) * rm, z = CZ - Math.sin(a) * rm;
      person(g, x, row.top, z, who++, 0.6 + rand() * 0.08);
      if (rand() < 0.2) { // a flag on a stick, held up from the shoulder
        const px = x + Math.sin(a) * 0.05 + 0.16, pz = z + Math.cos(a) * 0.05, top = row.top + 1.95;
        cyl(g, '#e9e4d8', px, row.top + 0.55, pz, 0.025, top - row.top - 0.55, 6);
        FLAG_SPOTS.push({ x: px, y: top, z: pz, ry: (rand() - 0.5) * 1.6, phase: rand() * 6.28 });
      }
    }
  }

  // --- the orchestra and the stage with its columns
  put(g, sectorGeo(0.01, 3.2, 0.04), '#efdfbd', 0, TY, CZ);
  box(g, '#d4ad75', 0, TY, 4.6, 19, 1.0, 2.8);                  // the stage
  box(g, '#e2c08a', 0, TY + 1.0, 4.6, 19.2, 0.12, 2.9);
  for (let x = -9; x < 9.1; x += 1.5) box(g, '#c99f68', x, TY, 3.15, 0.5, 0.95, 0.12); // its front, in panels
  // the back wall of the stage, left low and broken, with a row of columns standing on the stage
  for (let x = -9.2; x < 9.3; x += 2.3) box(g, LIME[Math.floor(rand() * 4)], x, TY + 1.0, 6.4, 2.35, 0.9 + rand() * 1.4, 0.8);
  for (const x of STAGE_COLS) {
    box(g, '#e2c08a', x, TY + 1.12, 5.4, 0.8, 0.4, 0.8);
    cyl(g, '#ecd2a2', x, TY + 1.52, 5.4, 0.27, 4.4, 10);
    taper(g, '#e2c08a', x, TY + 5.92, 5.4, 0.3, 0.5, 0.45, 8);
  }
  box(g, '#e6c896', -2.4, TY + 6.37, 5.4, 7.6, 0.55, 0.9);        // what is left of the beam over them
  box(g, '#d9b780', -2.4, TY + 6.92, 5.4, 7.9, 0.2, 1.0);

  // --- the concert: the singer at the front of the stage, the band behind, speakers either side
  const S = STAGE_Y;
  person(g, 0, S, 3.9, 0, 0.95, { clothes: ['#1d1d22'], hair: '#2b2420' });       // the singer
  box(g, '#c98f62', 0.16, S + 0.72, 3.72, 0.1, 0.42, 0.1).rotation.x = 0.5;       // the arm with the microphone
  ball(g, '#2b2d33', 0.16, S + 1.05, 3.55, 0.07);
  cyl(g, '#2b2d33', -0.35, S, 3.5, 0.025, 1.15, 6);                                  // a second mic on its stand
  ball(g, '#2b2d33', -0.35, S + 1.2, 3.5, 0.07);
  for (const s of [-1, 1]) ramp(g, '#1d1d22', s * 1.4, S, 3.45, 0.7, 0.35, 0.5, s > 0 ? BACK : 0); // monitors facing the singer
  // drums
  person(g, 2.4, S, 5.0, 3, 0.85);
  cyl(g, '#b2263c', 2.4, S + 0.1, 4.45, 0.34, 0.5, 12);
  for (const dx of [-0.45, 0.45]) cyl(g, '#e9e4d8', 2.4 + dx, S + 0.5, 4.6, 0.17, 0.22, 10);
  for (const dx of [-0.75, 0.75]) { cyl(g, '#8a8f98', 2.4 + dx, S, 4.5, 0.02, 1.15, 6); cyl(g, '#e0b84a', 2.4 + dx, S + 1.15, 4.5, 0.3, 0.02, 12); }
  // guitar, and the keyboard
  person(g, -2.4, S, 4.4, 1, 0.9);
  box(g, '#8a4b2a', -2.4, S + 0.45, 4.12, 0.42, 0.5, 0.08).rotation.z = 0.6;
  box(g, '#5a3620', -2.12, S + 0.78, 4.12, 0.6, 0.06, 0.06).rotation.z = 0.6;
  person(g, -4.8, S, 4.85, 5, 0.9);
  for (const dx of [-0.4, 0.4]) box(g, '#2b2d33', -4.8 + dx, S, 4.45, 0.05, 0.7, 0.05);
  box(g, '#1d1d22', -4.8, S + 0.7, 4.45, 1.1, 0.06, 0.32);
  box(g, '#f4f4f0', -4.8, S + 0.76, 4.4, 1.0, 0.02, 0.14);
  for (const s of [-1, 1]) { // the speaker stacks
    for (let k = 0; k < 2; k++) {
      box(g, '#1d1d22', s * 9.0, S + k * 1.25, 3.9, 1.1, 1.2, 0.9);
      for (const dy of [0.35, 0.85]) cyl(g, '#4a4d55', s * 9.0, S + k * 1.25 + dy, 3.44, 0.22, 0.03, 12).rotation.x = Math.PI / 2;
    }
  }

  // --- the light rig: a truss over the stage on two towers, with moving heads hanging under it
  for (const s of [-1, 1]) {
    for (const dz of [-0.22, 0.22]) for (const dx of [-0.22, 0.22]) box(g, '#2b2d33', s * TRUSS.x + dx, TY, TRUSS.z + dz, 0.07, TRUSS.y - TY + 0.3, 0.07);
    for (let y = TY + 0.6; y < TRUSS.y; y += 0.8) box(g, '#3b3f47', s * TRUSS.x, y, TRUSS.z, 0.5, 0.05, 0.5);
    box(g, '#2b2d33', s * TRUSS.x, TY, TRUSS.z, 0.9, 0.15, 0.9);
  }
  for (const dz of [-0.22, 0.22]) for (const dy of [0, 0.42]) box(g, '#2b2d33', 0, TRUSS.y + dy, TRUSS.z + dz, 2 * TRUSS.x + 0.5, 0.07, 0.07);
  for (let x = -TRUSS.x; x <= TRUSS.x; x += 0.7) box(g, '#3b3f47', x, TRUSS.y, TRUSS.z, 0.05, 0.42, 0.5);
  HEADS.forEach((x, i) => {
    box(g, '#2b2d33', x, TRUSS.y - 0.12, TRUSS.z, 0.12, 0.14, 0.12);
    box(g, '#1d1d22', x, TRUSS.y - 0.6, TRUSS.z, 0.42, 0.48, 0.42);
    box(g, HEAD_COLORS[i], x, TRUSS.y - 0.06 - 0.6 + 0.48, TRUSS.z, 0.26, 0.06, 0.26); // the lens, shining up
  });
  // floodlights on poles round the top of the seats, aimed down at the stage
  const wallTop = ROWS[ROWS.length - 1].top + 0.5;
  for (const a of RIM_LIGHTS) {
    const x = Math.cos(a) * (RIM + 0.17), z = CZ - Math.sin(a) * (RIM + 0.17);
    cyl(g, '#2b2d33', x, wallTop, z, 0.07, 3.0, 6);
    const head = face(g, x, z, Math.atan2(-Math.cos(a), Math.sin(a)), wallTop + 3.0);
    box(head, '#1d1d22', 0, 0, 0, 0.9, 0.55, 0.4);
    box(head, shine('#fff3c4', 3), 0, 0.06, 0.21, 0.75, 0.42, 0.04);
  }

  // --- the hill it is cut into, with white Amman houses on top, at the two back corners
  for (const s of [-1, 1]) {
    for (let x = 7; x <= 13.4; x += 2.1) {
      const xi = x - 1.3, back = -8.3; // xi: the column's side nearest the seats, which must stay clear of them
      const edge = xi < RIM + 0.4 ? CZ - Math.sqrt(Math.max(0, (RIM + 0.4) ** 2 - xi * xi)) : CZ + 1.5, d = edge - back;
      if (d < 0.4) continue;
      const top = 7.4 + (x - 7) * 0.35 + rand() * 1.2;
      strata(g, s * x, back + d / 2, 2.4, d + 0.3, TY, top, HILL, rand, { jitter: 0.25, layer: [1.2, 2.0] });
      if (x > 9 && d > 3) { // a house on the hill
        const hz = back + Math.min(d / 2, 2.2);
        box(g, '#f2ece0', s * x, top, hz, 2.0, 1.8, 2.0);
        box(g, '#e4dccb', s * x, top + 1.8, hz, 2.1, 0.12, 2.1);
        for (const dx of [-0.45, 0.45]) box(g, C.glass, s * x + dx, top + 0.7, hz + 1.01, 0.4, 0.55, 0.04);
        cyl(g, TANK, s * x + 0.5, top + 1.92, hz - 0.4, 0.3, 0.7, 8);
      }
    }
    // the vaulted way in at each end of the seats
    box(g, '#d4ad75', s * 12.9, TY, 4.4, 2.8, 3.4, 4.0);
    box(g, '#c99f68', s * 12.9, TY + 3.4, 4.4, 3.0, 0.3, 4.2);
    arch(g, '#3a2c26', s * 12.9, TY, 6.42, 1.5, 2.4, 0.06);
  }
  tree(g, -11.6, 7.3, 1.1, 'cypress');
  tree(g, 11.6, 7.3, 1.1, 'cypress');

  // --- the paving at the front, lamps and people
  box(g, '#e9dcc2', 0, TY, 7.6, 28.6, 0.05, 1.4);
  for (const x of [-10, -4, 4, 10]) lamp(g, x, TY, 7.7, { h: 3.0 });
  crowd(g, 8, [-9, 9, 6.9, 8.1], rand, { y: TY });
  crowd(g, 16, [-2.8, 2.8, 0.3, 2.9], rand, { y: TY, free: (x, z) => Math.hypot(x, z - CZ) < 3.0 }); // fans standing in the orchestra
}
theatre.label = 'المدرج الروماني';
theatre.top = 13;
theatre.size = [28.6, 16.6];
theatre.floodlight = { color: '#ffc978', at: [0, 6, 7] };

// At night the theatre is lit gold from below, like the real one: a warm
// light on the rows of seats (brightest at the bottom), and light going up
// each column of the stage.
export function theatreLights() {
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
  const seats = glow('#ffb860', 0.5);
  ROWS.forEach((row, i) => {
    const k = Math.pow(1 - i / ROWS.length, 0.8) * 0.9 + 0.1;
    const top = new THREE.Mesh(shade(new THREE.RingGeometry(row.r, row.r + row.run, 22, 1, 0, Math.PI).rotateX(-Math.PI / 2), () => k), seats);
    top.position.set(0, row.top + 0.02, CZ);
    group.add(top);
    if (i < ROWS.length - 1) { // the front of the next row up, lit too
      const next = ROWS[i + 1], h = next.top - row.top;
      const wall = new THREE.Mesh(shade(new THREE.CylinderGeometry(next.r - 0.01, next.r - 0.01, h, 22, 1, true, Math.PI / 2, Math.PI), () => k * 0.8), seats); // the half behind (-z)
      wall.position.set(0, row.top + h / 2, CZ);
      group.add(wall);
    }
  });
  const gold = glow('#ffd27a', 0.55);
  for (const x of STAGE_COLS) {
    const len = 5.4, geo = new THREE.CylinderGeometry(0.75, 0.32, len, 12, 4, true).translate(0, len / 2, 0);
    shade(geo, (i) => Math.pow(1 - geo.attributes.position.getY(i) / len, 1.5));
    const m = new THREE.Mesh(geo, gold);
    m.position.set(x, TY + 1.5, 5.4);
    group.add(m);
  }
  const pool = new THREE.Mesh(shade(new THREE.CircleGeometry(4.5, 24).rotateX(-Math.PI / 2), (i) => (i === 0 ? 1 : 0)), glow('#ffc070', 0.5));
  pool.position.set(0, TY + 0.08, CZ);
  group.add(pool);

  // the concert's beams: a cone of light from a lens towards a point, brightest at the lens
  const up = new THREE.Vector3(0, 1, 0);
  const beam = (from, to, m, r0, r1) => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), len = a.distanceTo(b);
    const geo = new THREE.CylinderGeometry(r1, r0, len, 16, 6, true).translate(0, len / 2, 0);
    shade(geo, (i) => Math.pow(1 - geo.attributes.position.getY(i) / len, 1.3));
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.copy(a);
    mesh.quaternion.setFromUnitVectors(up, b.sub(a).normalize());
    group.add(mesh);
  };
  const beamMats = new Map();
  const beamMat = (c) => { if (!beamMats.has(c)) beamMats.set(c, glow(c, 0.42)); return beamMats.get(c); };
  // up into the sky from the truss, fanned out: the light you see from the whole town
  HEADS.forEach((x, i) => {
    const y = TRUSS.y - 0.1;
    beam([x, y, TRUSS.z], [x + x * 1.6 + (i % 2 ? 3 : -3), y + 30, TRUSS.z - 8 + (i % 3) * 4], beamMat(HEAD_COLORS[i]), 0.16, 2.6);
  });
  // a white spot from the truss on the singer, and its pool on the stage
  beam([0, TRUSS.y - 0.4, TRUSS.z], [0, STAGE_Y, 3.9], beamMat('#fff6dc'), 0.2, 1.1);
  const spot = new THREE.Mesh(shade(new THREE.CircleGeometry(1.4, 20).rotateX(-Math.PI / 2), (i) => (i === 0 ? 1 : 0.2)), glow('#fff6dc', 0.7));
  spot.position.set(0, STAGE_Y + 0.02, 3.9);
  group.add(spot);
  // the floodlights round the top, down over the audience to the stage
  const wallTop = ROWS[ROWS.length - 1].top + 0.5;
  for (const a of RIM_LIGHTS) {
    const x = Math.cos(a) * (RIM + 0.17), z = CZ - Math.sin(a) * (RIM + 0.17);
    beam([x, wallTop + 3.05, z], [x * 0.25, STAGE_Y, CZ + 1.2 - Math.sin(a) * 1.5], beamMat('#fff0c8'), 0.3, 2.2);
  }
  return { group, mats };
}
theatre.lights = theatreLights;

// The audience's flags of Jordan, waving: one mesh for all of them, the
// cloth drawn on a canvas (black, white and green with the red triangle and
// its white star), bent by the vertex shader with the time the city gives
// to update(seconds). Call after the theatre is built (it knows where the sticks are).
export function theatreFlags() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
  ['#111111', '#ffffff', '#007a3d'].forEach((col, i) => { ctx.fillStyle = col; ctx.fillRect(0, (i * 128) / 3, 256, 128 / 3 + 1); });
  ctx.fillStyle = '#ce1126';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(128, 64); ctx.lineTo(0, 128); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  for (let i = 0; i < 14; i++) { const r = i % 2 ? 5 : 12, a = -Math.PI / 2 + (i * Math.PI) / 7; ctx.lineTo(42 + Math.cos(a) * r, 64 + Math.sin(a) * r); }
  ctx.closePath(); ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;

  const W = 0.78, H = 0.42, plane = new THREE.PlaneGeometry(W, H, 6, 1).translate(W / 2, -H / 2, 0);
  const pos = [], uv = [], along = [], phase = [], swing = [], index = [];
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), n = new THREE.Vector3(), v = new THREE.Vector3();
  for (const f of FLAG_SPOTS) {
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), f.ry);
    m.compose(new THREE.Vector3(f.x, f.y, f.z), q, new THREE.Vector3(1, 1, 1));
    n.set(0, 0, 1).applyQuaternion(q);
    const base = pos.length / 3, p = plane.attributes.position, t = plane.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      along.push(v.x / W);
      v.applyMatrix4(m);
      pos.push(v.x, v.y, v.z);
      uv.push(t.getX(i), t.getY(i));
      phase.push(f.phase);
      swing.push(n.x, n.y, n.z);
    }
    for (let i = 0; i < plane.index.count; i++) index.push(base + plane.index.getX(i));
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute('along', new THREE.Float32BufferAttribute(along, 1));
  geo.setAttribute('phase', new THREE.Float32BufferAttribute(phase, 1));
  geo.setAttribute('swing', new THREE.Float32BufferAttribute(swing, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  const time = { value: 0 };
  const mat = new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = time;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nattribute float along;\nattribute float phase;\nattribute vec3 swing;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        float w = sin(uTime * 5.5 + phase - along * 4.5);
        transformed += swing * w * 0.13 * along + vec3(0.0, -0.05 * along * along, 0.0);`);
  };
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  return { mesh, update: (t) => { time.value = t; } };
}
theatre.flags = theatreFlags;
