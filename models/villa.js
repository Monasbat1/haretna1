// The villa with a pool on its roof (2026-11-22, the user's idea: the house of
// those who install the Android app, taller and bigger than a house and set
// apart from the rest, but not the draw's tower). The same villa in every town:
// three floors of white stone and glass over the whole width of the plot, the
// upper two reaching out over the garden, wood on one side, a long balcony on
// the top floor; on the roof a wooden deck round a lit pool, a light railing,
// sun loungers and an umbrella; palms in the front garden. Sits on the 7 x 9
// plot, +z is the street.
import { C, box, cyl, cone, ball, face, win, door, lot, tree, bush, pot, shine, RIGHT, LEFT, BACK } from './kit.js';

const LOOKS = [
  { accent: '#d4a24c' }, // gold
  { accent: '#1f8a8a' }, // teal
  { accent: '#e0603e' }, // coral
];
const WALL = '#f7f5f0', TRIM = '#e4e0d6', STEEL = '#2f333b', PLINTH = '#4a4d55';
const GLASS = '#7fb8d6';                  // lit at night (models/kit.js)
const WATER = shine('#2fc4f2', 2.5);      // the pool shines blue at night
const WATER_EDGE = '#1d9fd0';
const DECK = '#c99a64', DECK_DARK = '#b5864f';
const RAIL = '#cfe8f2';
const LAMP = '#f6d77a';                   // garden and deck lamps (shine in kit.js)
const WOOD = ['#b8814b', '#a8713f'];
const F1 = 3.6, FU = 3.4, ROOF = F1 + 2 * FU;
const W = 7.0;                            // the whole width of the plot
const G0 = -4.3, G1 = 1.9;                // the ground floor, back to front
const U0 = -4.3, U1 = 3.1;                // the upper floors, reaching out over the garden
const UC = (U0 + U1) / 2;

// a light railing (posts and two rails) from (x1, z1) to (x2, z2), axis-aligned
function rail(g, x1, z1, x2, z2, y, h = 0.95) {
  const along = x1 === x2 ? 'z' : 'x', len = along === 'x' ? Math.abs(x2 - x1) : Math.abs(z2 - z1);
  const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2, n = Math.max(1, Math.round(len / 0.8));
  for (const [hh, c] of [[h, STEEL], [h * 0.5, RAIL]]) box(g, c, cx, y + hh, cz, along === 'x' ? len : 0.06, 0.05, along === 'z' ? len : 0.06);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    box(g, STEEL, along === 'x' ? x1 + (x2 - x1) * t : x1, y, along === 'z' ? z1 + (z2 - z1) * t : z1, 0.05, h, 0.05);
  }
}

// one upper floor: white walls, glass across the front, wood slats on the right
function upper(g, y, k, top) {
  box(g, TRIM, 0, y, UC, W + 0.2, 0.28, U1 - U0 + 0.2);                   // the slab (on the top floor, also the balcony's floor)
  const front = top ? U1 - 1.0 : U1, c = (U0 + front) / 2, len = front - U0; // the top floor stands back behind a long balcony
  box(g, WALL, 0, y + 0.28, c, W, FU - 0.28, len);
  const f = face(g, 0, front, 0, y + 0.28);
  box(f, STEEL, -1.2, 0.15, 0.02, 4.4, 2.5, 0.06);
  for (const x of [-2.75, -1.2, 0.35]) box(f, GLASS, x, 0.22, 0.06, 1.45, 2.35, 0.05);
  for (let i = 0; i < 10; i++) box(f, WOOD[i % 2], 1.6 + i * 0.19, 0, 0.08, 0.17, FU - 0.28, 0.08);
  const r = face(g, W / 2, c, RIGHT, y + 0.28), nr = Math.floor(len / 0.34);
  for (let i = 0; i < nr; i++) box(r, WOOD[i % 2], -len / 2 + 0.17 + i * 0.34, 0, 0.06, 0.3, FU - 0.28, 0.06);
  { const s = face(g, -W / 2, c, LEFT, y + 0.28); for (const x of [-2.3, 0, 2.3].filter((x) => Math.abs(x) < len / 2 - 0.7)) win(s, x, 0.65, 1.3, 1.7, { frame: STEEL, glass: GLASS, bars: false }); }
  { const s = face(g, 0, U0, BACK, y + 0.28); for (const x of [-2.0, 0, 2.0]) win(s, x, 0.65, 1.3, 1.7, { frame: STEEL, glass: GLASS, bars: false }); }
  box(g, k.accent, 0, y + 0.06, U1 + 0.11, W + 0.2, 0.16, 0.04);            // a coloured band along each slab
  if (top) { // the balcony: a railing along the front, plants, two chairs
    rail(g, -W / 2 + 0.05, U1 - 0.05, W / 2 - 0.05, U1 - 0.05, y + 0.28);
    pot(g, -3.0, y + 0.28, U1 - 0.45, 1.2, C.leaf, '#e0457b');
    pot(g, 3.0, y + 0.28, U1 - 0.45, 1.2, C.leaf, '#f4c542');
    for (const x of [-0.6, 0.4]) { box(g, '#ffffff', x, y + 0.28, U1 - 0.55, 0.55, 0.45, 0.55); box(g, '#ffffff', x, y + 0.73, U1 - 0.8, 0.55, 0.5, 0.08); }
  }
}

// a gold crown with jewels on top of the house (the user's ask, 2026-11-22); it glows at night
const GOLD = shine('#f5c542', 2.4), GOLD_DARK = '#d49a1e';
function crown(g, x, y, z, r = 1.0) {
  cyl(g, GOLD_DARK, x, y, z, r * 0.55, 0.18, 12);                         // a small stand
  cyl(g, GOLD, x, y + 0.18, z, r, 0.45, 14);                               // the band
  cyl(g, GOLD_DARK, x, y + 0.18, z, r * 1.03, 0.08, 14);
  cyl(g, GOLD_DARK, x, y + 0.55, z, r * 1.03, 0.08, 14);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2, cx = x + Math.cos(a) * r * 0.85, cz = z + Math.sin(a) * r * 0.85;
    cone(g, GOLD, cx, y + 0.6, cz, 0.24 * r, 0.75 * r);                    // the points
    ball(g, '#fff4c2', cx, y + 0.6 + 0.8 * r, cz, 0.09 * r);               // a pearl on each
    ball(g, i % 2 ? '#d8343a' : '#2f6fdc', x + Math.cos(a + Math.PI / 6) * r * 1.0, y + 0.4, z + Math.sin(a + Math.PI / 6) * r * 1.0, 0.1 * r); // jewels on the band
  }
  ball(g, '#d8343a', x, y + 0.75, z, 0.22 * r);                            // the big jewel in the middle
}

export function villa(g, v = {}) {
  const k = { ...LOOKS[0], ...v };
  if (!v.bare) lot(g); // the city draws the plot itself (bake passes bare)

  // ---- the front garden: a paved path, two palms, bushes, lamps
  box(g, '#e6e1d6', 2.25, 0, 3.2, 1.4, 0.04, 2.4);
  for (const x of [-2.7, 3.0]) tree(g, x, 3.7, 0.85, 'palm');
  bush(g, -1.2, 3.9, 0.85); bush(g, 0.6, 4.0, 0.7, '#5fb46a');
  for (const x of [1.3, 3.2]) { cyl(g, STEEL, x, 0, 4.2, 0.05, 0.7, 6); box(g, LAMP, x, 0.7, 4.2, 0.16, 0.16, 0.16); }

  // ---- the ground floor: white stone, glass from floor to ceiling on the front
  const gc = (G0 + G1) / 2;
  box(g, PLINTH, 0, 0, gc, W - 0.1, 0.25, G1 - G0 + 0.1);
  box(g, WALL, 0, 0.25, gc, W - 0.3, F1 - 0.25, G1 - G0);
  const gf = face(g, 0, G1, 0, 0.25);
  box(gf, STEEL, -1.1, 0, 0.02, 4.4, 2.9, 0.06);
  for (const x of [-2.7, -1.1, 0.5]) box(gf, GLASS, x, 0.08, 0.06, 1.45, 2.75, 0.05);
  door(gf, 2.25, 1.3, 2.7, '#6b3f22', { frame: STEEL, knob: '#d9b44a' });
  box(gf, k.accent, 2.25, 2.9, 0.55, 1.9, 0.14, 1.1);                     // the canopy over the door
  for (const [x, ry] of [[(W - 0.3) / 2, RIGHT], [-(W - 0.3) / 2, LEFT]]) { const s = face(g, x, gc, ry, 0.25); win(s, -1.4, 0.8, 1.7, 1.8, { frame: STEEL, glass: GLASS, bars: false }); win(s, 1.4, 0.8, 1.2, 1.8, { frame: STEEL, glass: GLASS, bars: false }); }
  { const s = face(g, 0, G0, BACK, 0.25); for (const x of [-2.0, 0, 2.0]) win(s, x, 0.8, 1.3, 1.8, { frame: STEEL, glass: GLASS, bars: false }); }
  for (const x of [-2.4, 0, 2.4]) box(g, LAMP, x, F1 - 0.05, 2.6, 0.3, 0.05, 0.3); // lights under the overhang

  // ---- two upper floors, the top one with a long balcony
  upper(g, F1, k, false);
  upper(g, F1 + FU, k, true);

  // ---- the roof: a wooden deck round a lit pool, a light railing, loungers, an umbrella
  box(g, TRIM, 0, ROOF, UC, W + 0.3, 0.3, U1 - U0 + 0.3);
  box(g, k.accent, 0, ROOF + 0.05, U1 + 0.16, W + 0.3, 0.18, 0.04);
  box(g, DECK, 0, ROOF + 0.3, UC, W, 0.12, U1 - U0);
  for (let i = 0; i < 12; i++) box(g, DECK_DARK, -3.3 + i * 0.6, ROOF + 0.42, UC, 0.03, 0.01, U1 - U0); // the boards
  const px = -0.85, pz = -0.4, pw = 4.8, pd = 3.9, py = ROOF + 0.42;
  box(g, '#ece8df', px, py, pz, pw + 0.5, 0.32, pd + 0.5);                 // the stone edge
  box(g, WATER_EDGE, px, py + 0.02, pz, pw, 0.31, pd);
  box(g, WATER, px, py + 0.06, pz, pw - 0.12, 0.28, pd - 0.12);
  for (const x of [px - 1.3, px + 0.5]) box(g, '#7fe0ff', x, py + 0.35, pz + 0.4, 1.0, 0.005, 0.12); // glints on the water
  for (const z of [pz - 0.8, pz + 0.8]) cyl(g, '#d9dde3', px + pw / 2 + 0.05, py + 0.3, z, 0.03, 0.7, 6); // the pool ladder
  box(g, '#d9dde3', px + pw / 2 + 0.05, py + 0.95, pz, 0.05, 0.05, 1.6);
  const ry = ROOF + 0.42;
  rail(g, -W / 2 + 0.05, U1 - 0.05, W / 2 - 0.05, U1 - 0.05, ry);
  rail(g, -W / 2 + 0.05, U0 + 0.05, W / 2 - 0.05, U0 + 0.05, ry);
  rail(g, -W / 2 + 0.05, U0 + 0.05, -W / 2 + 0.05, U1 - 0.05, ry);
  rail(g, W / 2 - 0.05, U0 + 0.05, W / 2 - 0.05, U1 - 0.05, ry);
  for (const z of [1.5, -0.2]) {
    box(g, '#8a5a34', 2.55, ry, z, 0.75, 0.25, 1.7);
    box(g, '#ffffff', 2.55, ry + 0.25, z + 0.15, 0.7, 0.12, 1.35);
    const back = face(g, 2.55, z - 0.65, 0, ry + 0.3);
    box(back, '#ffffff', 0, 0, 0, 0.7, 0.12, 0.6).rotation.x = -0.9;
  }
  cyl(g, STEEL, 2.7, ry, 2.5, 0.04, 2.1, 6);
  cone(g, k.accent, 2.7, ry + 1.85, 2.5, 1.25, 0.6);
  ball(g, k.accent, 2.7, ry + 2.47, 2.5, 0.06);
  // the glass stair room at the back, a palm in a pot, deck lamps
  box(g, WALL, 2.45, ry, -3.35, 1.9, 2.3, 1.5);
  box(g, TRIM, 2.45, ry + 2.3, -3.35, 2.1, 0.15, 1.7);
  { const s = face(g, 2.45, -2.6, 0, ry); box(s, GLASS, 0, 0.05, 0.02, 1.3, 2.0, 0.05); }
  crown(g, 2.45, ry + 2.45, -3.35);
  pot(g, -3.1, ry, 2.6, 1.6, '#4f9f5a');
  tree(g, -3.05, -3.7, 0.45, 'palm');
  for (const [x, z] of [[-3.1, -1.0], [0.9, 2.8], [-3.05, 1.1]]) box(g, LAMP, x, ry, z, 0.14, 0.3, 0.14);
}
villa.looks = LOOKS;
villa.top = ROOF + 0.42 + 2.45 + 1.5; // to the top of the crown
villa.flag = [-3.05, ROOF + 0.42, -2.4]; // where the pole of the owner's flag stands on the roof
