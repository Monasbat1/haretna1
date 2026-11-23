// «لبنان»: the old Lebanese house with its three arches and red tiled roof,
// and the Pigeon Rocks of Raouché standing in the sea off the Corniche.
import * as THREE from 'three';
import { C, GEO, put, box, cyl, ball, arch, hip, face, win, door, ablaq, lot, tree, vine, pot, railing, rng, shine, RIGHT, LEFT } from './kit.js';
import { strata, rock, crowd, lamp, flagPole } from './world.js';

// ---------------------------------------------------------------- the house with three arches
const LOOKS = [
  { stone: ['#e8d3a8', '#dcc394'], shutters: '#3e7d5f', climb: ['#d6337a', '#e85a9b'], trees: ['pine', 'lemon'] },
  { stone: ['#ecdcbc', '#e0cca6'], shutters: '#2f6f9f', climb: ['#f08a24', '#e85a9b'], trees: ['lemon', 'pine'] },
  { stone: ['#e3c99a', '#d6b986'], shutters: '#8a3b3b', climb: ['#ffffff', '#d6337a'], trees: ['pine', 'citrus'] },
];
const TILE = '#c2553b', TILE2 = '#a9452f', WHITE = '#f3ede0', IRON = '#2b3a33';

export function lebanonHouse(g, v = {}) {
  const look = { ...LOOKS[0], ...v };
  if (!v.bare) lot(g);
  box(g, '#dcd4c2', 0, 0, 0.1, 6.6, 0.05, 8.2);
  box(g, '#8fcf7a', 0, 0.05, 2.6, 6.2, 0.05, 2.6);
  const X = -0.35; // the house is a little to the left, the outside stair on its right
  ablaq(g, X, 0.05, -1.4, 5.4, 5.75, 4.0, 16, look.stone);
  box(g, look.stone[1], X, 2.85, -1.4, 5.6, 0.16, 4.2);
  for (const s of [-1, 1]) for (const z of [0.6, -3.4]) box(g, look.stone[1], X + s * 2.62, 0.05, z - Math.sign(z + 1) * 0.08, 0.32, 5.75, 0.32); // corner stones

  // the roof: wide eaves and four slopes of red tiles
  box(g, WHITE, X, 5.8, -1.4, 6.1, 0.16, 4.7);
  hip(g, TILE, X, 5.96, -1.4, 6.3, 2.1, 4.9);
  for (let i = 1; i < 5; i++) { const k = 1 - i * 0.18; box(g, TILE2, X, 5.96 + i * 0.4, -1.4, 6.3 * k, 0.04, 4.9 * k); }

  const f = face(g, X, 0.6);
  // upstairs: the three arches over a balcony
  box(f, WHITE, 0, 2.98, 0.02, 3.4, 2.55, 0.05);
  for (const x of [-1.0, 0, 1.0]) arch(f, '#9fc9d8', x, 3.1, 0.06, 0.82, 2.2, 0.05, 0, true);
  for (const x of [-1.5, -0.5, 0.5, 1.5]) { cyl(f, WHITE, x, 3.1, 0.12, 0.07, 1.75, 8); box(f, WHITE, x, 4.85, 0.12, 0.2, 0.14, 0.2); }
  box(g, look.stone[1], X, 2.9, 1.1, 3.6, 0.16, 1.0);
  for (const x of [-1.4, 1.4]) box(g, look.stone[1], X + x, 2.5, 0.75, 0.25, 0.4, 0.3);
  railing(g, X - 1.8, 1.6, X + 1.8, 1.6, 3.06, 0.85, IRON);
  railing(g, X - 1.8, 0.6, X - 1.8, 1.6, 3.06, 0.85, IRON);
  railing(g, X + 1.8, 0.6, X + 1.8, 1.6, 3.06, 0.85, IRON);
  pot(g, X - 1.35, 3.06, 1.25, 0.8, C.leaf, '#e0457b');
  pot(g, X + 1.35, 3.06, 1.25, 0.8, C.leaf, '#ffffff');
  for (const s of [-1, 1]) win(f, s * 2.1, 3.4, 0.6, 1.4, { frame: WHITE, glass: C.glass, shutters: look.shutters });
  // downstairs: an arched door between two arched windows
  door(f, 0, 1.1, 2.35, C.wood, { arched: true, frame: look.stone[1] });
  for (const s of [-1, 1]) win(f, s * 1.6, 0.9, 0.7, 1.35, { frame: WHITE, glass: C.glass, arched: true, shutters: look.shutters });
  box(g, look.stone[1], X, 0.05, 0.95, 1.6, 0.15, 0.7);
  vine(f, -2.25, 0.2, 0.5, 2.6, 14, { dots: look.climb, seed: 4 });
  const fr = face(g, X + 2.7, -1.4, RIGHT);
  win(fr, -1.0, 0.9, 0.6, 1.2, { frame: WHITE, shutters: look.shutters });
  win(fr, 1.0, 3.4, 0.6, 1.3, { frame: WHITE, shutters: look.shutters });
  const fl = face(g, X - 2.7, -1.4, LEFT);
  for (const x of [-1, 1]) { win(fl, x, 0.9, 0.6, 1.2, { frame: WHITE, shutters: look.shutters }); win(fl, x, 3.4, 0.6, 1.3, { frame: WHITE, shutters: look.shutters }); }

  // the outside stone stair up the right side, to the upper floor
  for (let i = 0; i < 12; i++) box(g, look.stone[0], 2.95, 0.05, 0.25 - i * 0.28, 0.75, 0.25 * (i + 1), 0.3);
  box(g, look.stone[0], 2.95, 0.05, -3.2, 0.75, 2.85, 0.5);
  door(face(g, X + 2.7, -3.05, RIGHT, 2.9), 0, 0.75, 1.9, C.wood, { arched: true });
  railing(g, 3.3, 0.35, 3.3, -3.3, 1.5, 0.7, IRON);

  // the garden: a stone wall, a pine, a lemon tree, pots of flowers
  for (const [x, w] of [[-2.0, 2.6], [2.0, 2.6]]) { ablaq(g, x, 0.05, 4.0, w, 0.75, 0.3, 3, look.stone); box(g, look.stone[1], x, 0.8, 4.0, w + 0.1, 0.08, 0.38); }
  for (const s of [-1, 1]) { box(g, look.stone[1], s * 0.65, 0.05, 4.0, 0.36, 1.25, 0.36); ball(g, '#f6d77a', s * 0.65, 1.45, 4.0, 0.13); }
  tree(g, -2.3, 2.5, 1.0, look.trees[0]);
  tree(g, 1.8, 2.7, 0.65, look.trees[1]);
  for (const [x, z, fl2] of [[-0.9, 1.2, '#d6337a'], [0.9, 1.2, '#f4c542'], [2.4, 1.0, '#ffffff']]) pot(g, x, 0.05, z, 1.0, C.leaf, fl2);
}
lebanonHouse.looks = LOOKS;
lebanonHouse.top = 8.0;
lebanonHouse.flag = [-0.35, 7.9, -1.4]; // the top of the tiled roof

// ---------------------------------------------------------------- Raouché: the Pigeon Rocks
const LIME = ['#ddc9a4', '#d4bd94', '#e2d0ac', '#cdb48a', '#d9c49c', '#d2b98f'];
const SCRUB = ['#7a9a52', '#8aa85e', '#6c8c4a'];
const SEA = '#2f8fc6', SHALLOW = '#5ec5d8', FOAM = '#f2fbff';
const LIGHT = shine('#ffe3a3', 3);

export function raouche(g) {
  const rand = rng(1975); // the year of the old Corniche postcards
  const SY = 0.08, LY = 1.6; // sea level, and the top of the Corniche
  // the sea fills the block; the Corniche runs along the front, the headland on the left
  box(g, '#1f6f9f', 0, 0, 0, 63.6, SY - 0.02, 39.6);
  box(g, SEA, 0, SY - 0.02, -2.5, 63.6, 0.04, 34.6);
  // --- the big rock, with its arch, and the small one
  const B = { x: -2, z: -6 };
  strata(g, B.x - 7.5, B.z, 7.5, 9.5, -0.5, 12.5, LIME, rand, { jitter: 0.3, layer: [1.8, 3.0], tilt: 0.05 });  // left leg
  strata(g, B.x + 5.0, B.z + 0.5, 4.8, 7.5, -0.5, 12.0, LIME, rand, { jitter: 0.3, layer: [1.8, 3.0], tilt: 0.05 }); // right leg
  strata(g, B.x - 1.6, B.z, 17.5, 10.0, 12.0, 16.5, LIME, rand, { jitter: 0.3, layer: [1.8, 3.0], tilt: 0.05 });      // over the arch
  strata(g, B.x - 2.4, B.z - 0.4, 15.5, 9.5, 16.5, 24.0, LIME, rand, { jitter: 0.3, layer: [1.8, 3.0], tilt: 0.05, shrink: 0.18 });
  strata(g, B.x - 4.0, B.z - 0.6, 9.5, 7.0, 24.0, 27.5, LIME, rand, { jitter: 0.3, layer: [1.8, 3.0], tilt: 0.05, shrink: 0.25 });
  for (let i = 0; i < 9; i++) rock(g, SCRUB[i % 3], B.x - 9 + rand() * 13, 24 + (i < 4 ? 3.4 : 0) + rand() * 0.4, B.z - 3 + rand() * 6, 1.1 + rand() * 0.8, 0.45, 1.1 + rand() * 0.8);
  for (let i = 0; i < 7; i++) rock(g, LIME[i % 6], B.x - 12 + rand() * 20, 0.2, B.z + 4 + rand() * 3, 0.8 + rand() * 1.2, 0.7, 0.9 + rand());
  raouche.flag = { code: 'lb', ...flagPole(g, B.x - 4.5, 27.3, B.z - 0.5, 10) }; // on top of the big rock
  const S = { x: 17, z: -11 };
  strata(g, S.x, S.z, 6.0, 6.5, -0.5, 9.0, LIME, rand, { jitter: 0.3, layer: [1.8, 3.0], tilt: 0.05 });
  strata(g, S.x - 0.4, S.z, 5.2, 5.8, 9.0, 16.5, LIME, rand, { jitter: 0.3, layer: [1.8, 3.0], tilt: 0.05, shrink: 0.3 });
  for (let i = 0; i < 4; i++) rock(g, SCRUB[i % 3], S.x - 1.2 + rand() * 2, 16.6, S.z - 1 + rand() * 2, 1.0, 0.4, 1.0);
  // turquoise shallows and white foam round their feet
  for (const [x, z, rx, rz] of [[B.x - 7.5, B.z, 6.5, 6.5], [B.x + 5.0, B.z + 0.5, 4.2, 5.0], [S.x, S.z, 4.6, 4.6]]) {
    put(g, GEO.cyl, SHALLOW, x, SY, z, rx + 2.2, 0.03, rz + 2.2);
    put(g, GEO.torus, FOAM, x, SY + 0.05, z, rx + 0.2, 0.25, rz + 0.2);
  }
  // little boats
  for (const [x, z, ry, c] of [[8, 4, 0.4, '#2c5f8a'], [-16, 2, -0.7, '#c0392b'], [24, 1, 1.2, '#2e7d5b']]) {
    const b = new THREE.Group(); b.position.set(x, SY, z); b.rotation.y = ry; g.add(b);
    box(b, '#f6f3ea', 0, 0, 0, 1.1, 0.5, 3.0); box(b, c, 0, 0.32, 0, 1.14, 0.12, 3.04); box(b, '#7b4b2a', 0, 0.5, 0.2, 0.6, 0.6, 0.8);
  }

  // --- the headland on the left: a limestone cliff with a café on top
  box(g, '#6a8a4a', -26, 9.2, -4, 12.0, 0.4, 28);
  for (let z = -18; z <= 10; z += 3.2) strata(g, -20.5 + (rand() - 0.5), z, 3.4, 3.6, -0.5, 9.3, LIME, rand, { jitter: 0.3, tilt: 0.06 });
  box(g, LIME[1], -26.5, -0.5, -4, 10, 9.7, 28);
  for (let i = 0; i < 4; i++) {
    const x = -27 + (i % 2) * 3.5, z = -10 + Math.floor(i / 2) * 4;
    cyl(g, '#f4f1ea', x, 9.6, z, 0.06, 2.0, 6);
    put(g, GEO.cone, i % 2 ? '#c0392b' : '#f4f1ea', x, 11.3, z, 1.4, 0.55, 1.4);
    box(g, '#f4f1ea', x, 9.6, z, 1.0, 0.75, 1.0);
  }
  box(g, '#f3ede0', -28.5, 9.6, -16, 5, 3.2, 5);
  box(g, TILE, -28.5, 12.8, -16, 5.4, 0.25, 5.4);
  lamp(g, -21.6, 9.6, -6, { light: LIGHT, h: 2 });
  lamp(g, -21.6, 9.6, 2, { light: LIGHT, h: 2 });
  const head = face(g, 0, 0, 0, 9.6);
  for (let i = 0; i < 4; i++) tree(head, -30 + rand() * 4, -1 + i * 3, 1.0 + rand() * 0.3, 'pine');
  crowd(g, 8, [-30, -22, -12, 4], rand, { y: 9.6 });

  // --- the Corniche along the front: sea wall, blue railing, palms, lamps, people
  box(g, LIME[3], 6, 0, 16.5, 52, LY, 7.0);
  box(g, '#d8d2c4', 6, LY, 16.5, 52, 0.1, 7.0);
  for (let x = -19; x < 32; x += 2.6) box(g, '#c9c2b2', x, LY + 0.1, 16.5, 1.3, 0.01, 7.0);
  box(g, '#3f4148', 6, LY, 20.5, 52, 0.1, 1.0); // the road edge
  railing(g, -20, 13.1, 32, 13.1, LY + 0.1, 1.0, '#3d7fb0');
  const walk = face(g, 0, 0, 0, LY + 0.1);
  for (let x = -18; x <= 31; x += 7) { tree(walk, x, 18.8, 1.6, 'palm'); lamp(g, x + 3.5, LY + 0.1, 13.6, { light: LIGHT, h: 3.6, arm: -0.6 }); }
  for (const x of [-12, 4, 20]) { box(g, '#7b4b2a', x, LY + 0.1, 14.0, 2.2, 0.45, 0.6); box(g, '#7b4b2a', x, LY + 0.55, 13.75, 2.2, 0.55, 0.1); } // benches
  // a ka'ak cart
  const cart = new THREE.Group(); cart.position.set(10, LY + 0.1, 15.2); g.add(cart);
  box(cart, '#c0392b', 0, 0.45, 0, 1.6, 0.9, 0.9); box(cart, '#d9a441', 0, 1.35, 0, 1.4, 0.25, 0.8);
  for (const s of [-1, 1]) cyl(cart, '#2b2d33', s * 0.7, 0.3, 0, 0.3, 0.1, 8).rotation.x = Math.PI / 2;
  crowd(g, 20, [-19, 31, 13.8, 19.5], rand, { y: LY + 0.1 });
  // the rocks of the shore under the railing
  for (let x = -19; x < 31; x += 2.2) rock(g, LIME[(x + 40) % 6 | 0], x + rand(), 0.4, 12.6 + rand() * 0.6, 1.0 + rand() * 0.6, 0.8, 0.8);
}
raouche.label = 'صخرة الروشة';
raouche.top = 38;
raouche.size = [64, 40];
