// House ideas for Haretna. Each one is built from the kit on a 7 x 9 plot,
// with the street on the +z side. Pick the ones to put in the city.
import {
  C, GEO, mat, put, box, cyl, taper, cone, hip, gable, ramp, ball, arch, face, RIGHT, win, door, rng, ablaq, lot,
  tree, bush, flowers, vine, pot, fountain, fence, railing, pergola, car, lattice,
} from './kit.js';

const RAIL = mat('#cfeaf5', { transparent: true, opacity: 0.5 });
const MODERN_GLASS = '#7fb8d6';

function hen(g, x, z) {
  ball(g, '#fbfbf6', x, 0.16, z, 0.15, 0.9);
  ball(g, '#fbfbf6', x + 0.12, 0.3, z, 0.08);
  ball(g, '#d8343a', x + 0.13, 0.39, z, 0.035);
  ball(g, '#f08a24', x + 0.21, 0.29, z, 0.03);
}
function tiles(g, x0, z0, nx, nz, color = '#c9b08a') {
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) if ((i + j) % 2) box(g, color, x0 + i * 0.5, 0.06, z0 + j * 0.5, 0.5, 0.02, 0.5);
}
function gatePosts(g, z, half = 0.65) {
  for (const s of [-1, 1]) {
    box(g, C.stone, s * half, 0, z, 0.34, 1.45, 0.34);
    box(g, C.basalt, s * half, 1.45, z, 0.42, 0.08, 0.42);
    ball(g, '#f6d77a', s * half, 1.68, z, 0.14);
  }
}

// What changes from one family's house to the next: stone tone, fabrics, trees, flowers.
const style = (v) => ({
  stripes: [C.basalt, C.stone, v.ochre || C.ochre, C.stone],
  cushion: v.cushion || '#b8433f', accent: v.accent || '#2f6f7f', flower: v.flower || '#e0457b',
  shutters: v.shutters || '#4f7f6a', climb: v.climb || ['#d6337a', '#e85a9b'], trees: v.trees || ['citrus', 'lemon'],
});

// 1 ---------------------------------------------------------------- Damascene courtyard
function shamiCourtyard(g, v = {}) {
  const look = style(v), ab = (...a) => ablaq(...a, look.stripes);
  if (!v.bare) lot(g);
  box(g, '#e6dcc6', 0, 0, 0.1, 6.6, 0.06, 8.2);
  tiles(g, -1.25, -1.35, 6, 8);
  // back wing, two floors, with the iwan
  ab(g, 0, 0, -2.9, 6.4, 2.8, 2.4, 7);
  box(g, C.wood, 0, 2.8, -2.9, 6.5, 0.12, 2.5);
  box(g, C.plaster, 0, 2.92, -2.9, 6.4, 2.5, 2.4);
  box(g, '#e3d9c3', 0, 5.42, -2.9, 6.7, 0.16, 2.7);
  const fb = face(g, 0, -1.7);
  arch(fb, C.stone, 0, 0, 0.02, 2.3, 2.75, 0.06, 0, true);
  arch(fb, '#3a2c26', 0, 0, 0.05, 2.0, 2.55, 0.06, 0, true);
  box(fb, look.cushion, 0, 0.06, 0.1, 1.6, 0.4, 0.08);
  arch(fb, '#f0d48a', 0, 1.0, 0.09, 0.55, 0.95, 0.04);
  for (const x of [-2.2, 0, 2.2]) win(fb, x, 3.5, 0.8, 1.35, { frame: C.wood, arched: true, glass: '#9fc9d8' });
  box(fb, C.ochre, 0, 5.05, 0.02, 6.4, 0.14, 0.04);
  // side wings, one floor
  ab(g, -2.4, 0, 0.35, 1.6, 2.8, 4.1, 7);
  box(g, '#e3d9c3', -2.4, 2.8, 0.35, 1.8, 0.14, 4.3);
  ab(g, 2.4, 0, -0.5, 1.6, 2.8, 2.4, 7);
  box(g, '#e3d9c3', 2.4, 2.8, -0.5, 1.8, 0.14, 2.6);
  const fl = face(g, -1.6, 0.35, RIGHT);
  door(fl, 0.95, 0.85, 2.0, C.wood, { arched: true, frame: C.stone });
  win(fl, -0.9, 0.9, 0.75, 1.3, { frame: C.wood, arched: true });
  vine(fl, 0, 0.2, 0.7, 2.4, 9, { dots: ['#ffffff'], seed: 3 });
  win(face(g, -2.4, 2.4), 0, 1.3, 0.6, 0.9, { frame: C.wood, arched: true });
  door(face(g, 2.4, 0.7), 0, 0.8, 1.9, C.wood, { arched: true, frame: C.stone });
  const fr = face(g, 3.2, -2.9, RIGHT);
  win(fr, 0, 3.5, 0.8, 1.3, { frame: C.wood, arched: true });
  win(fr, 0, 1.2, 0.6, 0.8, { frame: C.wood, arched: true });
  win(face(g, 3.2, -0.5, RIGHT), 0, 1.4, 0.55, 0.8, { frame: C.wood, arched: true });
  // street wall and gate
  ab(g, -1.1, 0, 2.3, 1.0, 1.05, 0.26, 3);
  ab(g, 1.95, 0, 2.3, 2.7, 1.05, 0.26, 3);
  ab(g, 3.17, 0, 1.5, 0.26, 1.05, 1.6, 3);
  gatePosts(g, 2.3, 0.62);
  fountain(g, 0, 0.3, 0.78, 0.06);
  tree(g, 2.3, 1.5, 0.72, look.trees[0]);
  pot(g, 1.3, 0.06, -1.35, 1, C.leaf, look.flower);
  pot(g, -1.3, 0.06, -1.35, 1, C.leaf, look.flower);
  pot(g, 1.25, 0.06, 0.3, 0.9, C.leaf, '#ffffff');
  pot(g, -1.25, 0.06, 2.0, 0.9, C.leaf, '#f4c542');
  pergola(g, -2.4, 0.9, 1.4, 2.4, 1.7, { y: 2.94, seed: 6 });
}

// 2 ---------------------------------------------------------------- old-town house with a mashrabiya
function shamiMashrabiya(g, v = {}) {
  const look = style(v), ab = (...a) => ablaq(...a, look.stripes);
  if (!v.bare) lot(g, { ground: '#cfc6b2' });
  else box(g, '#d6cdb9', 0, 0, 0.1, 6.6, 0.05, 8.2); // old-town paving around the house
  ab(g, 0, 0, -1.0, 5.4, 2.9, 5.0, 7);
  box(g, C.wood, 0, 2.9, -0.7, 5.7, 0.14, 5.8);
  box(g, C.plaster, 0, 3.04, -0.7, 5.6, 2.7, 5.7);
  for (const x of [-2.5, -0.85, 0.85, 2.5]) {
    box(g, C.wood, x, 2.3, 1.68, 0.16, 0.6, 0.3);
    box(g, C.wood, x, 2.62, 1.85, 0.16, 0.28, 0.6);
  }
  box(g, '#e3d9c3', 0, 5.74, -0.7, 5.9, 0.16, 6.0);
  box(g, C.plaster, 0, 5.9, 2.08, 5.7, 0.4, 0.14);
  box(g, C.plaster, 0, 5.9, -3.48, 5.7, 0.4, 0.14);
  for (const s of [-1, 1]) box(g, C.plaster, s * 2.78, 5.9, -0.7, 0.14, 0.4, 5.7);
  const f0 = face(g, 0, 1.5);
  door(f0, -1.3, 1.1, 2.3, C.wood, { arched: true, frame: C.stone, knob: null });
  for (const dx of [-0.3, 0, 0.3]) for (const y of [0.7, 1.4]) ball(f0, '#2b2019', -1.3 + dx, y, 0.1, 0.045);
  ball(f0, '#d9b44a', -1.3, 1.05, 0.11, 0.07);
  win(f0, 1.2, 1.25, 0.9, 1.0, { frame: C.woodDark, glass: '#6f8fa3', bars: false });
  for (let i = 0; i < 4; i++) box(f0, C.iron, 0.9 + i * 0.2, 1.25, 0.1, 0.03, 1.0, 0.03);
  box(f0, C.iron, -0.35, 2.05, 0.14, 0.05, 0.05, 0.28);
  box(f0, '#f6d77a', -0.35, 1.75, 0.24, 0.17, 0.28, 0.17);
  vine(f0, -2.35, 0.1, 0.6, 2.6, 10, { dots: ['#ffffff'], seed: 5 });
  const f1 = face(g, 0, 2.15);
  box(f1, C.woodDark, 0, 3.25, 0.28, 2.3, 0.14, 0.6);
  box(f1, C.wood, 0, 3.39, 0.28, 2.2, 1.7, 0.56);
  put(f1, GEO.box, lattice(), 0, 3.6, 0.565, 1.9, 1.25, 0.02);
  put(f1, GEO.box, lattice('#8a5a34', '#4a2c18', 1, 3), 1.105, 3.6, 0.28, 0.02, 1.25, 0.4);
  box(f1, C.woodDark, 0, 5.09, 0.3, 2.45, 0.12, 0.72);
  for (const x of [-1.95, 1.95]) win(f1, x, 3.7, 0.75, 1.3, { frame: C.wood, arched: true });
  const fr1 = face(g, 2.8, -0.7, RIGHT);
  for (const x of [-1.3, 1.3]) win(fr1, x, 3.7, 0.8, 1.3, { frame: C.wood, shutters: look.shutters });
  const fr0 = face(g, 2.7, -1.0, RIGHT);
  win(fr0, 1.0, 1.3, 0.7, 1.0, { frame: C.wood, arched: true });
  vine(fr0, -1.5, 0.2, 1.5, 2.6, 16, { dots: look.climb, seed: 9 });
  // roof: a small room, a grape pergola and pots
  box(g, C.plaster, -1.5, 5.9, -2.3, 2.3, 1.7, 2.2);
  box(g, '#e3d9c3', -1.5, 7.6, -2.3, 2.5, 0.12, 2.4);
  door(face(g, -1.5, -1.2, 0, 5.9), 0, 0.7, 1.4, C.wood, { knob: null });
  win(face(g, -0.35, -2.3, RIGHT), 0, 6.4, 0.6, 0.7, { frame: C.wood });
  pergola(g, 1.2, -1.4, 2.6, 2.8, 1.6, { y: 5.9, seed: 2 });
  for (const x of [-2.0, -0.6, 0.8, 2.2]) pot(g, x, 6.3, 2.08, 0.8, C.leaf, look.flower);
}

// 3 ---------------------------------------------------------------- one-floor Arabic house with an iwan
function shamiIwan(g, v = {}) {
  const look = style(v), ab = (...a) => ablaq(...a, look.stripes);
  if (!v.bare) lot(g);
  box(g, '#e6dcc6', 0, 0, 0.95, 6.6, 0.06, 6.5);
  tiles(g, -1.25, 0.2, 6, 6);
  ab(g, 0, 0, -2.75, 6.4, 3.3, 3.0, 8);
  box(g, C.wood, 0, 3.3, -2.75, 6.6, 0.12, 3.2);
  box(g, C.plaster, 0, 3.42, -2.75, 6.4, 0.5, 3.0);
  box(g, '#e3d9c3', 0, 3.92, -2.75, 6.7, 0.14, 3.3);
  const f = face(g, 0, -1.25);
  arch(f, C.stone, 0, 0, 0.02, 2.75, 3.2, 0.06, 0, true);
  arch(f, '#3a2c26', 0, 0, 0.05, 2.4, 2.98, 0.06, 0, true);
  box(f, look.cushion, 0, 0.06, 0.1, 1.9, 0.4, 0.08);
  box(f, look.accent, -0.5, 0.46, 0.1, 0.5, 0.3, 0.06);
  box(f, '#d9a441', 0.45, 0.46, 0.1, 0.5, 0.3, 0.06);
  arch(f, '#f0d48a', 0, 1.3, 0.09, 0.6, 1.0, 0.04);
  for (const s of [-1, 1]) win(f, s * 2.25, 0.9, 0.85, 1.6, { frame: C.wood, arched: true, pointed: true, glass: '#9fc9d8' });
  win(face(g, 3.2, -2.75, RIGHT), 0, 1.0, 0.8, 1.4, { frame: C.wood, arched: true, pointed: true });
  fountain(g, 0, 1.45, 0.85, 0.06);
  tree(g, -2.45, 0.2, 0.85, look.trees[0]);
  tree(g, 2.45, 2.9, 0.8, look.trees[1]);
  ab(g, -2.0, 0, 4.1, 2.6, 0.95, 0.26, 3);
  ab(g, 2.0, 0, 4.1, 2.6, 0.95, 0.26, 3);
  ab(g, -3.2, 0, 1.4, 0.26, 0.95, 5.3, 3);
  ab(g, 3.2, 0, 1.4, 0.26, 0.95, 5.3, 3);
  gatePosts(g, 4.1, 0.7);
  for (const s of [-1, 1]) pot(g, s * 1.6, 0.06, -0.95, 1.1, C.leaf, look.flower);
  pot(g, -1.3, 0.06, 3.6, 0.9, C.leaf, '#f4c542');
  pot(g, 1.4, 0.06, 3.6, 0.9, C.leaf, '#ffffff');
  vine(face(g, -2.0, 4.23), 0, 0.15, 2.2, 0.85, 9, { dots: ['#ffffff'], seed: 4 });
  box(g, C.wood, 2.55, 0.06, 0.4, 0.5, 0.4, 1.4);
  box(g, look.accent, 2.55, 0.46, 0.4, 0.5, 0.08, 1.4);
}

// 4 ---------------------------------------------------------------- mud beehive houses of the Syrian countryside
function beehive(g) {
  lot(g, { ground: '#dcc793', paved: '#cdb888' });
  const mud = '#cfa772', mud2 = '#b98d58';
  const dome = (x, z, r, h) => {
    box(g, mud, x, 0, z, r * 2, 1.5, r * 2);
    put(g, GEO.beehive, mat(mud), x, 1.5, z, r, h, r);
    ball(g, mud2, x, 1.5 + h, z, 0.1);
    for (let i = 0; i < 8; i++) {
      const a = i * 2.4 + 0.6, t = 0.18 + (i % 4) * 0.17, rr = r * Math.pow(1 - t, 0.5) * (1 - 0.12 * t);
      box(g, mud2, x + Math.cos(a) * rr, 1.5 + t * h, z + Math.sin(a) * rr, 0.17, 0.08, 0.17);
    }
  };
  dome(-1.9, -2.5, 1.45, 3.5);
  dome(1.0, -2.7, 1.55, 3.9);
  dome(2.25, 0.2, 1.1, 2.8);
  const d1 = face(g, -1.9, -1.05);
  door(d1, 0, 0.75, 1.3, C.wood, { arched: true, frame: mud2, knob: null });
  box(d1, '#3a2c26', 0.95, 0.75, 0.03, 0.3, 0.3, 0.06);
  const d2 = face(g, 1.0, -1.15);
  door(d2, -0.75, 0.75, 1.3, '#2f6f7f', { arched: true, frame: mud2, knob: null });
  const d3 = face(g, 2.25, 1.3);
  door(d3, 0, 0.7, 1.25, C.wood, { arched: true, frame: mud2, knob: null });
  box(face(g, 3.35, 0.2, RIGHT), '#3a2c26', 0, 0.8, 0.03, 0.3, 0.3, 0.06);
  // yard wall and gate
  box(g, mud2, -1.55, 0, 3.95, 3.5, 0.85, 0.32);
  box(g, mud2, 2.5, 0, 3.95, 1.7, 0.85, 0.32);
  box(g, mud2, -3.25, 0, 1.45, 0.32, 0.85, 5.3);
  for (const x of [0.25, 1.6]) box(g, C.wood, x, 0, 3.95, 0.14, 1.2, 0.14);
  box(g, C.woodLight, 0.6, 0.08, 4.25, 0.07, 0.9, 0.75, 0.5);
  // tannour oven, bread, jars, hay and hens
  put(g, GEO.halfBall, mat('#b98a58'), -2.35, 0, 1.5, 0.6, 0.75, 0.6);
  ball(g, '#2b2019', -2.2, 0.3, 2.0, 0.19);
  cyl(g, C.wood, -1.35, 0, 1.75, 0.32, 0.25, 8);
  for (let i = 0; i < 3; i++) cyl(g, '#ecd3a0', -1.35, 0.25 + i * 0.04, 1.75, 0.26, 0.035, 8);
  for (const [x, z, s] of [[-2.75, 3.3, 1], [-2.3, 3.45, 0.75]]) { taper(g, C.terracotta, x, 0, z, 0.2 * s, 0.1 * s, 0.5 * s); ball(g, C.terracotta, x, 0.3 * s, z, 0.24 * s); }
  box(g, '#e2c456', 0.2, 0, 0.3, 0.95, 0.5, 0.6);
  box(g, '#d9b94a', 0.15, 0.5, 0.3, 0.7, 0.4, 0.55);
  hen(g, -0.6, 2.2);
  hen(g, 0.3, 2.9);
  hen(g, -1.2, 3.1);
  tree(g, 1.0, 2.6, 0.75, 'olive');
  for (const [x, z] of [[-2.9, 0.3], [2.9, 2.9], [0.9, 3.6]]) bush(g, x, z, 0.6, '#a8b46a');
}

// 5 ---------------------------------------------------------------- white modern villa
function modernVilla(g) {
  lot(g);
  const W = '#f8f7f3', K = C.steel;
  box(g, '#d8d8da', 2.4, 0, 0.5, 1.7, 0.05, 7.2);
  box(g, W, -0.75, 0, -1.3, 4.6, 2.8, 4.6);
  box(g, K, 0.55, 2.8, -1.0, 5.1, 0.12, 5.5);
  box(g, '#ffffff', 0.55, 2.92, -1.0, 5.0, 2.6, 5.4);
  box(g, K, 0.55, 5.52, -1.0, 5.1, 0.1, 5.5);
  cyl(g, K, 2.85, 0, 1.5, 0.07, 2.8);
  car(g, 2.4, -1.2, '#2f6f9f');
  put(g, GEO.box, RAIL, -2.5, 2.8, 0.97, 1.1, 0.75, 0.04);
  put(g, GEO.box, RAIL, -3.02, 2.8, -1.3, 0.04, 0.75, 4.6);
  box(g, K, -2.5, 2.8, -2.6, 0.8, 0.4, 0.5);
  ball(g, C.leaf, -2.5, 3.5, -2.6, 0.4);
  const f0 = face(g, -0.75, 1.0);
  box(f0, K, -0.75, 0.12, 0.03, 2.9, 2.45, 0.06);
  box(f0, MODERN_GLASS, -0.75, 0.2, 0.05, 2.76, 2.3, 0.06);
  for (const x of [-1.67, -0.75, 0.17]) box(f0, K, x, 0.2, 0.07, 0.06, 2.3, 0.04);
  box(f0, C.woodLight, 1.55, 0, 0.04, 1.45, 2.8, 0.08);
  door(f0, 1.55, 0.85, 2.1, '#2f3238', { knob: null });
  box(f0, '#d9d9d9', 1.85, 0.8, 0.13, 0.04, 0.7, 0.04);
  const f1 = face(g, 0.55, 1.7);
  box(f1, K, -0.35, 3.5, 0.03, 3.6, 1.5, 0.06);
  box(f1, MODERN_GLASS, -0.35, 3.57, 0.05, 3.46, 1.36, 0.06);
  for (const x of [-1.5, -0.35, 0.8]) box(f1, K, x, 3.57, 0.07, 0.06, 1.36, 0.04);
  box(f1, C.woodLight, 1.95, 2.92, 0.04, 1.0, 2.6, 0.08);
  const fr = face(g, 3.05, -1.0, RIGHT);
  for (const x of [-1.4, 1.2]) { box(fr, K, x, 3.4, 0.03, 0.7, 1.8, 0.06); box(fr, MODERN_GLASS, x, 3.47, 0.05, 0.56, 1.66, 0.06); }
  for (let i = 0; i < 4; i++) box(g, '#e4e1d8', 0.8, 0, 1.6 + i * 0.75, 1.0, 0.05, 0.5);
  box(g, '#3f8f5a', -2.0, 0, 4.05, 2.6, 0.55, 0.5);
  tree(g, -2.8, 2.5, 0.8, 'cypress');
  tree(g, -1.95, 2.9, 0.62, 'cypress');
  bush(g, -0.6, 1.6, 0.9, '#5fb46a');
  bush(g, -2.6, 1.5, 0.8);
  for (const [x, z] of [[0.15, 4.0], [1.45, 4.0]]) { cyl(g, K, x, 0, z, 0.05, 0.45, 8); ball(g, '#f6e6a8', x, 0.5, z, 0.09); }
}

// 6 ---------------------------------------------------------------- modern house with a sloped roof
function modernSlope(g) {
  lot(g);
  const W = '#f2f0ea', K = C.steel;
  box(g, C.woodLight, 0.2, 0, 1.9, 5.6, 0.14, 2.2);
  for (let i = 0; i < 7; i++) box(g, C.wood, 0.2, 0.14, 0.95 + i * 0.32, 5.6, 0.012, 0.03);
  box(g, W, 0.85, 0, -1.4, 3.9, 3.356, 4.4);
  box(g, C.woodLight, -1.95, 0, -1.4, 1.7, 2.9, 4.44);
  ramp(g, C.woodLight, -1.95, 2.9, -1.4, 1.7, 0.456, 4.44);
  ramp(g, W, 0.85, 3.356, -1.4, 3.9, 1.045, 4.4);
  box(g, K, 0, 3.68, -1.3, 6.7, 0.16, 5.3).rotation.z = Math.atan2(1.5, 5.6);
  const f = face(g, 0, 0.8);
  box(f, K, 0.85, 0.1, 0.03, 3.4, 2.7, 0.06);
  box(f, MODERN_GLASS, 0.85, 0.18, 0.05, 3.26, 2.54, 0.06);
  for (const x of [-0.25, 1.95]) box(f, K, x, 0.18, 0.07, 0.06, 2.54, 0.04);
  box(f, K, 0.85, 2.05, 0.07, 3.26, 0.06, 0.04);
  ramp(f, '#6aa6c6', 0.85, 2.98, 0.04, 3.3, 0.88, 0.05);
  door(f, -1.95, 0.9, 2.1, '#2f3238', { knob: null });
  box(f, '#d9d9d9', -1.65, 0.8, 0.13, 0.04, 0.7, 0.04);
  box(f, '#f6d77a', -1.2, 1.9, 0.08, 0.12, 0.25, 0.1);
  const fr = face(g, 2.8, -1.4, RIGHT);
  box(fr, K, 0, 0.9, 0.03, 2.4, 1.4, 0.06);
  box(fr, MODERN_GLASS, 0, 0.97, 0.05, 2.26, 1.26, 0.06);
  box(fr, K, 0, 3.0, 0.03, 1.4, 0.8, 0.06);
  box(fr, MODERN_GLASS, 0, 3.07, 0.05, 1.26, 0.66, 0.06);
  cyl(g, K, -1.9, 3.0, -2.6, 0.13, 1.7);
  // deck furniture
  for (const x of [0.4, 1.7]) { box(g, '#e9e4d8', x, 0.14, 2.3, 0.6, 0.32, 0.6); box(g, '#e9e4d8', x, 0.46, 2.56, 0.6, 0.4, 0.08); }
  cyl(g, K, 1.05, 0.14, 1.5, 0.05, 0.35, 8);
  cyl(g, '#e9e4d8', 1.05, 0.49, 1.5, 0.32, 0.05);
  box(g, K, -2.1, 0.14, 2.6, 0.9, 0.42, 0.5);
  ball(g, '#5fb46a', -2.1, 0.75, 2.6, 0.36);
  ball(g, '#4f9f5a', -1.8, 0.7, 2.6, 0.26);
  box(g, '#d6d2c6', 0.2, 0, 3.75, 5.6, 0.04, 1.1);
  for (const [x, z] of [[-1.2, 3.7], [-0.7, 3.9], [2.2, 3.8], [1.8, 3.6]]) cone(g, '#8fbf6a', x, 0, z, 0.14, 0.6);
  for (const x of [-0.1, 0.5, 1.1]) box(g, '#bdb8ac', x, 0.04, 3.75, 0.4, 0.03, 0.9);
  tree(g, -2.8, 3.7, 0.9, 'birch');
  tree(g, 2.95, 3.5, 0.75, 'birch');
}

// 7 ---------------------------------------------------------------- villa with a pool
function poolVilla(g) {
  lot(g);
  const W = '#f6f4ee', K = C.steel;
  box(g, W, 0, 0, -3.0, 6.4, 5.5, 2.4);
  box(g, '#cdb994', -2.3, 0, -2.98, 1.8, 5.5, 2.46);
  box(g, K, 0, 5.5, -3.0, 6.5, 0.1, 2.5);
  box(g, W, 2.2, 0, -0.5, 2.0, 2.8, 2.6);
  box(g, K, 2.2, 2.8, -0.5, 2.1, 0.1, 2.7);
  put(g, GEO.box, RAIL, 2.2, 2.9, 0.77, 2.0, 0.7, 0.04);
  put(g, GEO.box, RAIL, 3.17, 2.9, -0.5, 0.04, 0.7, 2.6);
  put(g, GEO.box, RAIL, 1.23, 2.9, -0.5, 0.04, 0.7, 2.6);
  cyl(g, K, 2.2, 2.9, -0.6, 0.04, 1.7, 8);
  cone(g, '#e8554e', 2.2, 4.4, -0.6, 1.05, 0.45);
  box(g, '#e9e4d8', 2.2, 2.9, 0.1, 0.9, 0.3, 0.5);
  const f = face(g, 0, -1.8);
  box(f, K, -0.1, 0.1, 0.03, 2.5, 2.4, 0.06);
  box(f, MODERN_GLASS, -0.1, 0.17, 0.05, 2.36, 2.26, 0.06);
  box(f, K, -0.1, 0.17, 0.07, 0.06, 2.26, 0.04);
  box(f, K, 0.9, 3.3, 0.03, 4.3, 1.6, 0.06);
  box(f, MODERN_GLASS, 0.9, 3.37, 0.05, 4.16, 1.46, 0.06);
  for (const x of [-0.5, 0.9, 2.3]) box(f, K, x, 3.37, 0.07, 0.06, 1.46, 0.04);
  box(g, W, -0.1, 2.75, -1.35, 2.6, 0.12, 0.9);
  put(g, GEO.box, RAIL, -0.1, 2.87, -0.92, 2.6, 0.65, 0.04);
  put(g, GEO.box, RAIL, -1.38, 2.87, -1.35, 0.04, 0.65, 0.9);
  const fw = face(g, 2.2, 0.8);
  box(fw, K, 0, 0.1, 0.03, 1.5, 2.3, 0.06);
  box(fw, MODERN_GLASS, 0, 0.17, 0.05, 1.36, 2.16, 0.06);
  const fr = face(g, 3.2, -0.5, RIGHT);
  box(fr, K, 0, 1.0, 0.03, 1.6, 1.2, 0.06);
  box(fr, MODERN_GLASS, 0, 1.07, 0.05, 1.46, 1.06, 0.06);
  const fr2 = face(g, 3.2, -3.0, RIGHT);
  box(fr2, K, 0, 3.3, 0.03, 1.2, 1.6, 0.06);
  box(fr2, MODERN_GLASS, 0, 3.37, 0.05, 1.06, 1.46, 0.06);
  // deck, pool and loungers
  box(g, C.woodLight, -1.0, 0, -0.95, 4.4, 0.1, 1.7);
  box(g, '#ffffff', -1.1, 0, 1.75, 4.2, 0.12, 3.5);
  box(g, C.water, -1.1, 0.03, 1.75, 3.7, 0.13, 3.0);
  for (const z of [0.9, 2.1, 2.9]) box(g, '#8fdcf2', -1.3 + z * 0.2, 0.04, z, 1.6, 0.125, 0.12);
  put(g, GEO.torus, mat('#f06a9b'), -2.0, 0.24, 2.4, 0.32, 0.32, 0.32);
  for (const z of [0.5, 0.85]) cyl(g, '#d9dde0', 0.72, 0.1, z, 0.03, 0.6, 8);
  for (const x of [-2.5, -1.55]) {
    box(g, '#ffffff', x, 0.1, -0.85, 0.6, 0.16, 1.2);
    box(g, '#ffffff', x, 0.2, -1.5, 0.6, 0.12, 0.6).rotation.x = -0.6;
    box(g, '#f4c542', x, 0.26, -0.75, 0.5, 0.03, 0.7);
  }
  tree(g, -2.95, 4.0, 0.9, 'palm');
  tree(g, 2.5, 2.9, 1.0, 'palm');
  box(g, '#3f8f5a', 2.4, 0, 4.1, 1.8, 0.5, 0.45);
  for (let i = 0; i < 3; i++) box(g, '#e4e1d8', 1.75, 0, 1.4 + i * 0.75, 0.8, 0.05, 0.5);
}

// 8 ---------------------------------------------------------------- modern house with Damascene details
function shamiModern(g) {
  lot(g);
  const W = '#f7f4ec', brass = '#c9a24d';
  ablaq(g, -1.95, 0, -1.3, 1.9, 5.88, 4.7, 14, [C.stone, C.basalt, C.stone, C.ochre]);
  box(g, C.basalt, -1.95, 5.88, -1.3, 2.0, 0.1, 4.8);
  box(g, W, 0.95, 0, -1.3, 3.9, 2.9, 4.6);
  box(g, C.basalt, 0.95, 2.9, -1.0, 4.0, 0.1, 5.3);
  box(g, '#ffffff', 0.95, 3.0, -1.0, 3.9, 2.6, 5.2);
  box(g, C.basalt, 0.95, 5.6, -1.0, 4.0, 0.1, 5.3);
  const fa = face(g, -1.95, 1.05);
  arch(fa, brass, 0, 0, 0.03, 1.36, 3.0, 0.06, 0, true);
  arch(fa, '#2f3d4a', 0, 0, 0.06, 1.2, 2.86, 0.06, 0, true);
  box(fa, brass, 0, 0, 0.1, 0.04, 2.2, 0.03);
  arch(fa, brass, 0, 3.75, 0.03, 0.8, 1.45, 0.06, 0, true);
  put(fa, GEO.box, lattice('#c79a5b', '#8a6233', 2, 3), 0, 3.82, 0.07, 0.56, 0.95, 0.02);
  const f0 = face(g, 0.95, 1.0);
  for (const x of [-1.2, 0, 1.2]) { arch(f0, '#d9cdb4', x, 0.08, 0.03, 1.0, 2.55, 0.06); arch(f0, MODERN_GLASS, x, 0.08, 0.05, 0.86, 2.44, 0.06); }
  const f1 = face(g, 0.95, 1.6);
  box(f1, C.steel, 0, 3.35, 0.03, 3.3, 1.9, 0.06);
  box(f1, '#5d8fae', 0, 3.42, 0.05, 3.16, 1.76, 0.06);
  box(f1, brass, -0.6, 3.3, 0.12, 2.1, 2.0, 0.03);
  put(f1, GEO.box, lattice('#c79a5b', '#8a6233', 6, 5), -0.6, 3.36, 0.14, 1.98, 1.88, 0.02);
  const fr = face(g, 2.9, -1.0, RIGHT);
  box(fr, brass, 0.4, 3.3, 0.03, 1.5, 2.0, 0.03);
  put(fr, GEO.box, lattice('#c79a5b', '#8a6233', 4, 5), 0.4, 3.36, 0.05, 1.38, 1.88, 0.02);
  const fr0 = face(g, 2.9, -1.3, RIGHT);
  for (const x of [-0.9, 0.9]) { arch(fr0, '#d9cdb4', x, 0.08, 0.03, 1.0, 2.55, 0.06); arch(fr0, MODERN_GLASS, x, 0.08, 0.05, 0.86, 2.44, 0.06); }
  pergola(g, 1.2, -1.8, 2.6, 2.4, 1.5, { y: 5.7, wood: C.steel, grapes: false, seed: 5 });
  // water channel, olive tree, cypress
  box(g, '#e9e1cf', 0.95, 0, 2.7, 2.9, 0.16, 0.95);
  box(g, C.water, 0.95, 0.05, 2.7, 2.6, 0.14, 0.65);
  for (const x of [0.1, 0.95, 1.8]) ball(g, '#bfe8fa', x, 0.3, 2.7, 0.09);
  for (let i = 0; i < 3; i++) box(g, '#e4e1d8', -1.95, 0, 1.5 + i * 0.85, 1.1, 0.05, 0.6);
  tree(g, -2.75, 3.4, 0.85, 'olive');
  tree(g, 3.0, 3.6, 0.8, 'cypress');
  tree(g, 2.45, 3.9, 0.6, 'cypress');
  for (const x of [-2.75, -1.15]) { box(g, C.basalt, x, 0, 1.25, 0.1, 1.0, 0.1); box(g, '#f6d77a', x, 1.0, 1.25, 0.18, 0.26, 0.18); }
  bush(g, 0.0, 3.7, 0.8);
  bush(g, 1.6, 3.8, 0.7, '#5fb46a');
}

// 9 ---------------------------------------------------------------- tiled cottage with a flower garden
function cottage(g) {
  lot(g);
  const wall = '#f6ecd4', green = '#3f7d6b';
  box(g, '#b9b2a2', 0, 0, -1.9, 4.8, 0.25, 4.0);
  box(g, wall, 0, 0.25, -1.9, 4.6, 2.5, 3.8);
  gable(g, C.tile, 0, 2.75, -1.9, 5.3, 2.0, 4.6);
  gable(g, wall, 0, 2.75, -1.9, 5.34, 1.65, 3.8);
  box(g, '#b5694a', -1.5, 2.9, -2.6, 0.55, 2.1, 0.55);
  box(g, '#8f4f38', -1.5, 5.0, -2.6, 0.7, 0.12, 0.7);
  box(g, wall, 1.2, 3.1, -0.75, 0.95, 0.85, 1.2);
  gable(g, C.tile, 1.2, 3.95, -0.7, 1.5, 0.5, 1.2, RIGHT);
  win(face(g, 1.2, -0.15), 0, 3.32, 0.5, 0.5, {});
  box(g, '#b9b2a2', 0, 0, 0.65, 2.0, 0.2, 1.3);
  for (const s of [-1, 1]) box(g, C.white, s * 0.8, 0.2, 1.15, 0.12, 2.0, 0.12);
  gable(g, C.tile, 0, 2.2, 0.6, 1.5, 0.7, 2.0, RIGHT);
  gable(g, wall, 0, 2.2, 0.62, 1.5, 0.55, 1.7, RIGHT);
  const f = face(g, 0, 0);
  door(f, 0, 0.9, 1.95, green, { frame: C.white, y: 0.2 });
  const colors = ['#e8475f', '#f4c542', '#ff8fb1', '#9b6bd6'];
  for (const s of [-1, 1]) {
    win(f, s * 1.55, 1.2, 0.85, 1.1, { shutters: green, sill: C.white });
    box(f, C.wood, s * 1.55, 0.86, 0.22, 1.0, 0.18, 0.22);
    for (let k = 0; k < 4; k++) ball(f, colors[k], s * 1.55 - 0.36 + k * 0.24, 1.1, 0.22, 0.1);
  }
  win(face(g, 2.3, -1.9, RIGHT), 0, 1.2, 0.85, 1.1, { shutters: green, sill: C.white });
  win(face(g, 2.68, -1.9, RIGHT), 0, 3.1, 0.5, 0.55, {});
  fence(g, -3.3, 4.2, -0.6, 4.2);
  fence(g, 0.6, 4.2, 3.3, 4.2);
  fence(g, -3.3, 0.2, -3.3, 4.2);
  fence(g, 3.3, 0.2, 3.3, 4.2);
  for (let i = 0; i < 5; i++) cyl(g, '#d9d4c8', Math.sin(i * 0.9) * 0.25, 0, 1.75 + i * 0.6, 0.3, 0.04, 8);
  flowers(g, -1.95, 3.65, 2.2, 0.7, 16, colors, 1);
  flowers(g, 1.95, 3.65, 2.2, 0.7, 16, colors, 2);
  flowers(g, -1.6, 0.45, 1.5, 0.5, 8, colors, 3);
  flowers(g, 1.6, 0.45, 1.5, 0.5, 8, colors, 4);
  tree(g, -2.35, 2.1, 0.85, 'apple');
  bush(g, 2.5, 2.3, 1.1);
  bush(g, 1.9, 1.5, 0.8, '#5fb46a');
  box(g, C.wood, 0.95, 0, 4.5, 0.08, 0.8, 0.08);
  box(g, '#d8343a', 0.95, 0.8, 4.5, 0.22, 0.2, 0.34);
}

// 10 --------------------------------------------------------------- house with a grape pergola and a vegetable garden
function gardenHouse(g) {
  lot(g);
  const blue = '#2f6f9f';
  box(g, '#cbb593', -1.3, 0, -2.5, 3.9, 1.0, 3.3);
  box(g, '#f3e7cf', -1.3, 1.0, -2.5, 3.8, 1.8, 3.2);
  hip(g, '#b9573a', -1.3, 2.8, -2.5, 4.5, 1.5, 3.9);
  box(g, '#b5694a', -2.3, 3.0, -3.0, 0.45, 1.4, 0.45);
  const f = face(g, -1.3, -0.88);
  door(f, -0.9, 0.85, 1.9, blue, { frame: C.white });
  win(f, 0.8, 1.15, 0.8, 1.0, { shutters: blue, sill: C.white });
  win(face(g, 0.62, -2.5, RIGHT), 0, 1.15, 0.8, 1.0, { shutters: blue });
  pergola(g, 2.0, -2.3, 2.4, 3.0, 2.2, { seed: 4 });
  cyl(g, C.wood, 2.0, 0, -2.3, 0.08, 0.6, 8);
  cyl(g, C.woodLight, 2.0, 0.6, -2.3, 0.55, 0.07);
  for (const [x, z] of [[1.3, -2.0], [2.7, -2.1], [2.0, -1.4]]) cyl(g, C.wood, x, 0, z, 0.17, 0.36, 8);
  ball(g, '#c9a24d', 2.0, 0.78, -2.3, 0.13);
  // vegetable rows
  for (let i = 0; i < 4; i++) {
    const x = -2.75 + i * 0.85;
    box(g, '#7a5a3c', x, 0, 1.9, 0.6, 0.14, 3.4);
    for (let j = 0; j < 7; j++) {
      const z = 0.5 + j * 0.47;
      if (i === 0) { ball(g, '#4f9f5a', x, 0.34, z, 0.19); ball(g, '#e23b3b', x + 0.12, 0.38, z + 0.08, 0.07); ball(g, '#e23b3b', x - 0.1, 0.3, z - 0.1, 0.06); }
      else if (i === 1) ball(g, '#a6d86a', x, 0.22, z, 0.19, 0.7);
      else if (i === 2) { ball(g, '#5fae62', x, 0.3, z, 0.17); ball(g, '#6b3fa0', x + 0.1, 0.26, z, 0.08, 1.4); }
      else { cone(g, '#6cba5c', x, 0.14, z, 0.1, 0.3); ball(g, '#f08a24', x, 0.16, z, 0.06); }
    }
  }
  // scarecrow and well
  box(g, C.wood, 0.8, 0, 2.0, 0.07, 1.5, 0.07);
  box(g, C.wood, 0.8, 1.0, 2.0, 0.9, 0.07, 0.07);
  box(g, '#c94f4f', 0.8, 0.72, 2.0, 0.4, 0.5, 0.14);
  ball(g, '#e9d3a3', 0.8, 1.42, 2.0, 0.17);
  cone(g, '#b98f4a', 0.8, 1.5, 2.0, 0.32, 0.26);
  cyl(g, '#bdb5a6', 2.55, 0, 0.5, 0.5, 0.6, 8);
  cyl(g, '#3f6f8a', 2.55, 0.5, 0.5, 0.38, 0.12, 8);
  for (const s of [-1, 1]) box(g, C.wood, 2.55 + s * 0.45, 0.6, 0.5, 0.08, 1.0, 0.08);
  gable(g, '#b9573a', 2.55, 1.6, 0.5, 1.3, 0.4, 0.9);
  box(g, C.wood, 2.55, 0.95, 0.5, 0.16, 0.2, 0.16);
  tree(g, 2.9, 3.3, 0.8, 'olive');
  fence(g, -3.3, 4.2, 0.3, 4.2, { color: C.woodLight, h: 0.6 });
  fence(g, 1.5, 4.2, 3.3, 4.2, { color: C.woodLight, h: 0.6 });
  hen(g, 1.7, 1.2);
  hen(g, 0.9, 3.4);
}

// 11 --------------------------------------------------------------- stone mountain house with a red roof
function mountainHouse(g) {
  lot(g);
  const S = '#e3cda3', S2 = '#d2b98b', cream = '#f4ead6', blue = '#2f6f9f';
  box(g, S, 0, 0, -1.6, 5.0, 5.6, 4.4);
  const r = rng(42);
  for (let i = 0; i < 22; i++) box(g, S2, (r() - 0.5) * 4.3, 0.2 + r() * 5.1, 0.6, 0.45 + r() * 0.3, 0.22, 0.04);
  for (let i = 0; i < 18; i++) box(g, S2, 2.5, 0.2 + r() * 5.1, -3.5 + r() * 3.8, 0.04, 0.22, 0.45 + r() * 0.3);
  box(g, cream, 0, 5.6, -1.6, 5.4, 0.14, 4.8);
  hip(g, C.tile, 0, 5.74, -1.6, 5.8, 1.7, 5.2);
  box(g, S2, 1.3, 6.2, -2.4, 0.5, 1.5, 0.5);
  const f = face(g, 0, 0.6);
  door(f, 0, 1.05, 2.25, C.wood, { arched: true, frame: cream });
  for (const s of [-1, 1]) win(f, s * 1.6, 0.85, 0.75, 1.45, { arched: true, frame: cream, glass: '#7fa8bf' });
  box(f, cream, 0, 3.22, 0.03, 2.5, 1.95, 0.06);
  for (const i of [-1, 0, 1]) arch(f, '#5d8fae', i * 0.76, 3.3, 0.06, 0.62, 1.7, 0.06);
  for (const x of [-0.38, 0.38]) cyl(f, '#ffffff', x, 3.3, 0.11, 0.045, 1.35, 8);
  for (const s of [-1, 1]) win(f, s * 1.95, 3.45, 0.5, 1.2, { frame: cream, shutters: blue });
  box(g, '#d8c7a4', 0, 2.95, 1.05, 3.0, 0.14, 0.9);
  for (const x of [-1.2, 0, 1.2]) box(g, '#c9b690', x, 2.65, 0.85, 0.2, 0.3, 0.5);
  railing(g, -1.5, 1.5, 1.5, 1.5, 3.09, 0.75);
  railing(g, -1.5, 0.6, -1.5, 1.5, 3.09, 0.75);
  railing(g, 1.5, 0.6, 1.5, 1.5, 3.09, 0.75);
  pot(g, -1.2, 3.09, 1.25, 0.8, C.leaf, '#d8343a');
  pot(g, 1.2, 3.09, 1.25, 0.8, C.leaf, '#d8343a');
  const fr = face(g, 2.5, -1.6, RIGHT);
  for (const x of [-1.0, 1.0]) win(fr, x, 3.45, 0.55, 1.2, { frame: cream, shutters: blue });
  win(fr, 0, 0.95, 0.75, 1.4, { arched: true, frame: cream, glass: '#7fa8bf' });
  // terrace wall, path, trees
  box(g, '#cdb48a', -2.05, 0, 4.15, 3.1, 0.75, 0.45);
  box(g, '#cdb48a', 2.05, 0, 4.15, 3.1, 0.75, 0.45);
  for (let i = 0; i < 10; i++) box(g, '#bda276', (i < 5 ? -1 : 1) * (0.8 + (i % 5) * 0.55), 0.1 + (i % 3) * 0.2, 4.38, 0.4, 0.16, 0.03);
  box(g, '#d9cfb8', 0, 0, 2.6, 1.0, 0.05, 3.4);
  tree(g, -2.35, 2.5, 0.95, 'pine');
  tree(g, 2.7, 2.9, 0.85, 'cypress');
  for (const s of [-1, 1]) pot(g, s * 0.9, 0, 0.9, 1.1, C.leaf, '#d8343a');
  bush(g, 1.7, 1.6, 0.9);
  bush(g, -1.2, 3.5, 0.7, '#5fb46a');
}

// 12 --------------------------------------------------------------- two-floor neighbourhood house with a balcony
function townHouse(g) {
  lot(g, { ground: '#d8d3c7' });
  const S = '#eadfc8', S2 = '#d6c8aa', cream = '#f5efe2', K = '#7d8288';
  box(g, S, 0, 0, -1.5, 5.0, 5.9, 4.6);
  box(g, S2, 0, 2.9, -1.5, 5.06, 0.14, 4.66);
  for (const y of [0.95, 1.9, 3.95, 4.9]) box(g, S2, 0, y, -1.5, 5.02, 0.03, 4.62);
  box(g, S, 0, 5.9, 0.73, 5.0, 0.5, 0.14);
  box(g, S, 0, 5.9, -3.73, 5.0, 0.5, 0.14);
  for (const s of [-1, 1]) box(g, S, s * 2.43, 5.9, -1.5, 0.14, 0.5, 4.6);
  const f0 = face(g, 0, 0.8);
  box(f0, '#8f9aa3', 1.1, 0, 0.03, 2.4, 2.45, 0.06);
  box(f0, '#4f8f7a', 1.1, 0, 0.05, 2.2, 2.3, 0.06);
  for (let i = 0; i < 8; i++) box(f0, '#3f7868', 1.1, 0.14 + i * 0.28, 0.085, 2.2, 0.04, 0.02);
  box(g, '#cfc6b2', -1.5, 0, 1.15, 1.3, 0.14, 0.7);
  box(g, '#cfc6b2', -1.5, 0, 1.6, 1.3, 0.07, 0.3);
  door(f0, -1.5, 0.9, 2.05, '#6b4226', { frame: cream, y: 0.14 });
  box(f0, '#b9c2c9', -0.55, 1.3, 0.06, 0.3, 0.42, 0.1);
  vine(f0, -2.25, 0.2, 0.4, 2.5, 8, { dots: ['#ffffff'], seed: 8 });
  // balcony with an awning
  box(g, S2, 0, 2.95, 1.35, 4.7, 0.16, 1.1);
  railing(g, -2.3, 1.85, 2.3, 1.85, 3.11, 0.8);
  railing(g, -2.3, 0.85, -2.3, 1.85, 3.11, 0.8);
  railing(g, 2.3, 0.85, 2.3, 1.85, 3.11, 0.8);
  box(f0, cream, -1.1, 3.11, 0.03, 1.1, 2.1, 0.06);
  box(f0, C.glass, -1.1, 3.11, 0.05, 0.95, 2.0, 0.06);
  win(f0, 1.0, 3.6, 1.5, 1.2, { frame: cream });
  const aw = face(g, 0, 0.8, 0, 5.4);
  for (let i = 0; i < 10; i++) put(aw, GEO.box, mat(i % 2 ? '#ffffff' : '#d94f4f'), -2.07 + i * 0.46, 0, 0.6, 0.46, 0.05, 1.3).rotation.x = 0.38;
  for (const x of [-2.0, 0.2, 2.0]) pot(g, x, 3.11, 1.6, 0.8, C.leaf, '#d8343a');
  box(g, '#ffffff', 1.3, 3.11, 1.3, 0.42, 0.4, 0.42);
  box(g, '#ffffff', 1.3, 3.51, 1.12, 0.42, 0.42, 0.06);
  // side wall
  const fr = face(g, 2.5, -1.5, RIGHT);
  for (const x of [-1.2, 1.0]) win(fr, x, 3.6, 0.9, 1.2, { frame: cream, shutters: '#4f8f7a' });
  win(fr, 1.0, 1.15, 0.9, 1.1, { frame: cream, bars: false, glass: '#6f8fa3' });
  for (let i = 0; i < 4; i++) box(fr, C.iron, 0.7 + i * 0.2, 1.15, 0.1, 0.03, 1.1, 0.03);
  box(fr, '#eeeeea', -1.0, 1.6, 0.2, 0.85, 0.58, 0.36);
  cyl(fr, '#b5b9bd', -1.0, 1.9, 0.38, 0.2, 0.02).rotation.x = Math.PI / 2;
  // roof: water tanks, solar heater, dish, laundry, columns waiting for the next floor
  box(g, K, -1.5, 5.9, -2.9, 2.0, 0.45, 1.0);
  for (const x of [-2.0, -1.0]) { cyl(g, '#f4f4f1', x, 6.35, -2.9, 0.44, 1.0); cyl(g, '#e3e3df', x, 7.35, -2.9, 0.2, 0.08); }
  cyl(g, '#2b2d33', 0.2, 5.9, -3.1, 0.42, 0.9);
  box(g, '#2f4a6b', 1.5, 6.35, -2.3, 1.3, 0.06, 1.7).rotation.x = 0.55;
  box(g, K, 1.5, 5.9, -2.9, 1.2, 0.9, 0.06);
  cyl(g, '#d9dde0', 2.2, 7.0, -3.1, 0.22, 1.4).rotation.z = Math.PI / 2;
  cyl(g, K, 1.9, 5.9, -0.4, 0.04, 0.7, 8);
  cyl(g, '#e6e6e6', 1.9, 6.6, -0.35, 0.48, 0.05).rotation.x = 1.0;
  for (const [x, z] of [[-2.2, -3.45], [2.2, -3.45], [-2.2, 0.45], [2.2, 0.45]]) {
    box(g, '#bdb7a8', x, 5.9, z, 0.3, 1.0, 0.3);
    for (const dx of [-0.08, 0.08]) for (const dz of [-0.08, 0.08]) box(g, '#6b4a3a', x + dx, 6.9, z + dz, 0.03, 0.5, 0.03);
  }
  for (const x of [-1.9, 0.9]) cyl(g, K, x, 5.9, -0.9, 0.04, 1.5, 8);
  box(g, C.iron, -0.5, 7.36, -0.9, 2.8, 0.02, 0.02);
  ['#e8475f', '#ffffff', '#4f9dde', '#f4c542', '#ffffff', '#58c27d'].forEach((c, i) => {
    const h = 0.5 + (i % 3) * 0.12;
    box(g, c, -1.6 + i * 0.43, 7.36 - h, -0.9, 0.34, h, 0.03);
  });
  tree(g, 2.9, 3.6, 0.85, 'round');
  for (const x of [-2.35, -0.7]) pot(g, x, 0, 1.3, 1.1, C.leaf, '#e0457b');
}

export const HOUSES = [
  { id: 1, name: 'بيت شامي بحوش وبحرة', group: 'شامي وتراثي', build: shamiCourtyard, cam: { az: 24, el: 38, dist: 27.5, ty: 2.7 } },
  { id: 2, name: 'بيت شامي قديم بمشربية', group: 'شامي وتراثي', build: shamiMashrabiya, cam: { ty: 3.5, dist: 28 } },
  { id: 3, name: 'بيت عربي بليوان', group: 'شامي وتراثي', build: shamiIwan, cam: { az: 26, el: 32, ty: 1.4 } },
  { id: 4, name: 'بيوت القباب الطينية', group: 'شامي وتراثي', build: beehive, cam: { el: 30 } },
  { id: 5, name: 'فيلا عصرية بيضا', group: 'عصري', build: modernVilla, cam: {} },
  { id: 6, name: 'بيت عصري بسقف مايل', group: 'عصري', build: modernSlope, cam: { ty: 1.8 } },
  { id: 7, name: 'فيلا مع مسبح', group: 'عصري', build: poolVilla, cam: { az: 26, el: 34, dist: 28, ty: 2.9 } },
  { id: 8, name: 'شامي مودرن', group: 'عصري', build: shamiModern, cam: { dist: 28.5, ty: 3.2 } },
  { id: 9, name: 'بيت قرميد مع جنينة ورد', group: 'جنينة وحارات', build: cottage, cam: { ty: 1.6 } },
  { id: 10, name: 'بيت مع عريشة وجنينة خضرة', group: 'جنينة وحارات', build: gardenHouse, cam: { el: 34, ty: 1.3 } },
  { id: 11, name: 'بيت حجر جبلي بقرميد', group: 'جنينة وحارات', build: mountainHouse, cam: { ty: 3.0, dist: 27 } },
  { id: 12, name: 'بيت الحارة بطابقين وبلكون', group: 'جنينة وحارات', build: townHouse, cam: { ty: 3.5, dist: 29 } },
];

// The houses of the city, by level. `top` is the roof height and `flag` is
// where the flag pole stands (both in the model's own metres).
const LOOKS = [
  { ochre: '#d8a56c', cushion: '#b8433f', accent: '#2f6f7f', flower: '#e0457b', shutters: '#4f7f6a', climb: ['#d6337a', '#e85a9b'], trees: ['citrus', 'lemon'] },
  { ochre: '#cf9d86', cushion: '#2f6f7f', accent: '#b8433f', flower: '#f4c542', shutters: '#2f6f9f', climb: ['#ffffff'], trees: ['lemon', 'olive'] },
  { ochre: '#dcb878', cushion: '#6a4a8a', accent: '#3f7d5a', flower: '#ffffff', shutters: '#8a5a34', climb: ['#f08a24', '#f4c542'], trees: ['olive', 'citrus'] },
  { ochre: '#c9a27a', cushion: '#3f7d5a', accent: '#d9a441', flower: '#d8343a', shutters: '#3f6f8a', climb: ['#9b6bd6', '#c9a0e8'], trees: ['citrus', 'citrus'] },
];
export const HOUSE_LEVELS = [
  { build: shamiIwan, looks: LOOKS, top: 4.06, flag: [-2.7, 4.06, -3.7] },
  { build: shamiMashrabiya, looks: LOOKS, top: 7.72, flag: [-2.2, 7.72, -3.0] },
  { build: shamiCourtyard, looks: LOOKS, top: 5.58, flag: [-2.7, 5.58, -3.6] },
];
