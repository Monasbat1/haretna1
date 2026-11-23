// House levels for every town (the user's ask, 2026-11-19: upgrade a whole
// country's houses at once from the control panel, and turn chosen houses
// into tall buildings).
//   Syria: levels 1..3 are its three houses (models/houses.js HOUSE_LEVELS).
//   A village: level 1 is the country's house; level 2 is the same house on a
//   floor of shops; level 3 has a floor of flats over the shops as well.
//   Level 4, everywhere: a tall block of flats (TOWER), for chosen houses.
// Every model sits on the 7 x 9 plot, +z is the street.
import * as THREE from 'three';
import { C, box, cyl, ball, ramp, face, win, door, lot, pot, railing, shine, RIGHT, LEFT, BACK } from './kit.js';

export const MAX_LEVEL = 4;
const FLOOR = 3.1;

// ---------------------------------------------------------------- a village house on shops (and flats)
const AWNINGS = ['#c0392b', '#2e7d5b', '#2f6fb0', '#d9a441'];
const SHOP_GLASS = '#6f8fa3';            // lit at night like a window (models/kit.js)
const SIGN_LIT = shine('#fff1c2', 2.2);  // the shop signs glow at night
function shops(g, y, n) {
  const P = '#ece4d4', T = '#d7ccb6';
  box(g, P, 0, y, 0, 6.8, FLOOR, 8.0);
  box(g, T, 0, y + FLOOR - 0.22, 0, 7.0, 0.22, 8.2);
  const f = face(g, 0, 4.0, 0, y);
  for (let i = 0; i < 3; i++) {
    const x = -2.2 + i * 2.2, c = AWNINGS[(i + n) % AWNINGS.length];
    box(f, '#3b3f47', x, 0, 0.02, 1.9, 2.4, 0.06);
    box(f, SHOP_GLASS, x - 0.35, 0.15, 0.06, 1.0, 1.9, 0.05);
    door(f, x + 0.55, 0.65, 2.1, '#2b2d33', { knob: null });
    box(f, SIGN_LIT, x, 2.45, 0.05, 1.8, 0.38, 0.06);
    box(f, c, x, 2.5, 0.09, 1.6, 0.26, 0.04);
    ramp(f, c, x, 2.05, 0.45, 0.8, 0.3, 1.9, Math.PI / 2);          // the awning, high at the wall
  }
  for (const [x, ry] of [[3.4, RIGHT], [-3.4, LEFT]]) { const s = face(g, x, 0, ry, y); for (const z of [-2.2, 0.6]) win(s, z, 0.9, 0.9, 1.2, { frame: T }); }
}
function flats(g, y) {
  const P = '#e6dcc9', T = '#d2c6ae';
  box(g, P, 0, y, 0, 6.8, FLOOR, 8.0);
  box(g, T, 0, y + FLOOR - 0.22, 0, 7.0, 0.22, 8.2);
  const f = face(g, 0, 4.0, 0, y);
  for (const x of [-2.1, 0, 2.1]) {
    win(f, x, 0.75, 1.0, 1.5, { frame: T, glass: C.glass });
    box(f, T, x, 0.6, 0.35, 1.5, 0.1, 0.7);                         // a small balcony
    for (let k = 0; k < 6; k++) box(f, '#2b2d33', x - 0.62 + k * 0.25, 0.7, 0.68, 0.035, 0.75, 0.035);
    box(f, '#2b2d33', x, 1.42, 0.68, 1.5, 0.04, 0.04);
  }
  box(f, '#e9ebee', 2.9, 2.2, 0.15, 0.6, 0.4, 0.3);                  // an air conditioner
  pot(f, -1.6, 0.7, 0.45, 0.6, C.leaf, '#e0457b');
  for (const [x, ry] of [[3.4, RIGHT], [-3.4, LEFT]]) { const s = face(g, x, 0, ry, y); for (const z of [-2.2, 0.6]) win(s, z, 0.9, 0.9, 1.2, { frame: T }); }
}
const raised = new Map();
// The country's house (house: its build function, with looks, top and flag) on `floors` floors.
export function onFloors(house, floors) {
  const key = house.name + '/' + floors;
  if (raised.has(key)) return raised.get(key);
  const H = FLOOR * floors;
  const build = (g, look = {}) => {
    if (!look.bare) lot(g); // the city draws the plot itself (bake passes bare)
    shops(g, 0, floors);
    if (floors > 1) flats(g, FLOOR);
    const up = new THREE.Group();
    up.position.y = H;
    g.add(up);
    house(up, { ...look, bare: true });  // the house on the roof, its garden a roof garden
  };
  build.looks = house.looks;
  build.top = house.top + H;
  build.flag = [house.flag[0], house.flag[1] + H, house.flag[2]];
  raised.set(key, build);
  return build;
}

// ---------------------------------------------------------------- the tower
const TOWER_LOOKS = [
  { wall: '#ece6da', trim: '#cfc6b4', accent: '#2f6f9f' },
  { wall: '#f3f3ef', trim: '#d9dde3', accent: '#c0392b' },
  { wall: '#dcbf9f', trim: '#bfa07f', accent: '#2e7d5b' },
];
const TW = 6.0, TD = 6.6, TZ = -0.5, LOBBY = 3.6, TFLOORS = 9;
const TGLASS = '#7fb8d6';                // lit at night (models/kit.js)
const RED = shine('#ff3030', 3);
export function tower(g, v = {}) {
  const k = { ...TOWER_LOOKS[0], ...v };
  if (!v.bare) lot(g); // the city draws the plot itself (bake passes bare)
  const z0 = TZ - TD / 2, z1 = TZ + TD / 2;
  // the lobby: glass all along the front, the door under a canopy
  box(g, k.trim, 0, 0, TZ, TW, LOBBY, TD);
  const lf = face(g, 0, z1, 0, 0);
  box(lf, '#3b3f47', 0, 0, 0.02, TW - 0.6, LOBBY - 0.4, 0.06);
  for (const x of [-2.0, -0.7, 0.7, 2.0]) box(lf, TGLASS, x, 0.1, 0.06, 1.15, LOBBY - 0.65, 0.05);
  door(lf, 0, 1.3, 2.4, '#2b2d33', { frame: k.accent, knob: null });
  box(lf, k.accent, 0, LOBBY - 0.25, 0.9, TW - 1.0, 0.18, 1.8);
  for (const x of [-2.4, 2.4]) cyl(lf, k.trim, x, 0, 1.6, 0.08, LOBBY - 0.25, 8);
  pot(g, -2.3, 0, z1 + 0.6, 0.9, C.leaf, '#e0457b');
  pot(g, 2.3, 0, z1 + 0.6, 0.9, C.leaf, '#f4c542');
  // the floors of flats
  const front = face(g, 0, z1, 0, 0), back = face(g, 0, z0, BACK, 0), right = face(g, TW / 2, TZ, RIGHT, 0), left = face(g, -TW / 2, TZ, LEFT, 0);
  for (let i = 0; i < TFLOORS; i++) {
    const y = LOBBY + i * FLOOR;
    box(g, k.wall, 0, y, TZ, TW, FLOOR, TD);
    box(g, k.trim, 0, y - 0.05, TZ, TW + 0.24, 0.22, TD + 0.24);   // the slab between floors
    for (const x of [-1.9, 0, 1.9]) win(front, x, y + 0.75, 1.3, 1.6, { frame: k.trim, glass: TGLASS, bars: false });
    for (const x of [-1.9, 0, 1.9]) win(back, x, y + 0.85, 1.0, 1.4, { frame: k.trim, glass: TGLASS, bars: false });
    for (const f of [right, left]) for (const x of [-1.6, 1.6]) win(f, x, y + 0.85, 1.1, 1.4, { frame: k.trim, glass: TGLASS, bars: false });
    // balconies on the front, left and right in turn
    const bx = i % 2 ? 1.25 : -1.25;
    box(front, k.trim, bx, y, 0.6, 2.9, 0.14, 1.2);
    for (let j = 0; j < 12; j++) box(front, '#2b2d33', bx - 1.38 + j * 0.25, y + 0.14, 1.17, 0.035, 0.85, 0.035);
    box(front, '#2b2d33', bx, y + 0.99, 1.17, 2.9, 0.045, 0.045);
    if (i % 3 === 1) pot(front, bx + 1.0, y + 0.14, 0.5, 0.6, C.leaf, '#e0457b');
    if (i % 2 === 0) box(right, '#e9ebee', 0.2, y + 2.3, 0.15, 0.6, 0.4, 0.3);  // an air conditioner
  }
  // stone fins up the front corners, the crown, the roof
  const topY = LOBBY + TFLOORS * FLOOR;
  for (const x of [-TW / 2 + 0.15, TW / 2 - 0.15]) box(g, k.trim, x, LOBBY, z1 + 0.1, 0.32, topY - LOBBY, 0.3);
  box(g, k.accent, 0, topY, TZ, TW + 0.3, 0.55, TD + 0.3);
  box(g, k.trim, 0, topY + 0.55, TZ, TW + 0.1, 0.5, TD + 0.1);
  box(g, k.wall, 1.4, topY + 1.05, TZ - 1.4, 2.2, 2.0, 2.4);       // the stair room
  for (const [x, z] of [[-1.8, -2.6], [-0.8, -2.6], [-1.8, -1.6]]) cyl(g, '#26272b', x, topY + 1.05, TZ + z + 1.2, 0.36, 0.9, 10); // water tanks
  const sol = face(g, -1.2, TZ + 1.6, 0, topY + 1.05);
  for (const x of [-0.7, 0.7]) box(sol, '#2c4a6e', x, 0.25, 0, 1.2, 0.06, 0.9).rotation.x = -0.6;
  cyl(g, '#9aa0a8', 1.4, topY + 3.05, TZ - 1.4, 0.05, 3.2, 6);     // the aerial with its red light
  box(g, RED, 1.4, topY + 6.25, TZ - 1.4, 0.2, 0.2, 0.2);
}
tower.looks = TOWER_LOOKS;
tower.top = LOBBY + TFLOORS * FLOOR + 1.1;
tower.flag = [-2.5, LOBBY + TFLOORS * FLOOR + 1.05, TZ + 2.6];
