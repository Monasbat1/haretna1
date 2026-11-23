// Big buildings for the centre of the city, built with the same kit as the houses.
// They sit on the central plaza (29 x 17), with +z towards the visitor.
import { GEO, mat, put, box, cyl, cone, hip, gable, ball, arch, face, RIGHT, LEFT, shine } from './kit.js';

// At night the windows of the mosque are lit, its golden mosaic and green
// ornaments shine in their own colours (the arches glow like every iwan).
shine('#2f4a5a');
shine('#dab54b', 2.75);
shine('#3f7e5b', 2.9);

// The Umayyad Mosque of Damascus, turned so that its courtyard opens towards
// the visitor: prayer hall and the Dome of the Eagle at the back, the two
// corner minarets behind it, and the Minaret of the Bride in front.
export function umayyad(g) {
  const stone = '#e8dcc0', stone2 = '#d8c9a4', marble = '#f4eee2', lead = '#8f9aa5', leadDark = '#74808c';
  const gold = '#dab54b', green = '#3f7e5b', dark = '#3a2c26', glass = '#2f4a5a', wood = '#7b4b2a';
  const Y = 0.35; // top of the platform
  const dome = (x, y, z, r, h, color = lead) => put(g, GEO.halfBall, mat(color), x, y, z, r, h, r);
  const finial = (x, y, z, s = 1) => { cyl(g, gold, x, y, z, 0.05 * s, 0.9 * s, 8); ball(g, gold, x, y + 0.9 * s, z, 0.16 * s); };

  box(g, '#d8cfba', 0, 0, 0, 27.6, Y, 16);

  // --- courtyard, paved in pale marble with darker bands
  box(g, marble, 0, Y, 1.6, 21.8, 0.06, 8.6);
  for (let i = 0; i < 9; i++) box(g, '#cfc1a2', -9.6 + i * 2.4, Y + 0.06, 1.6, 0.3, 0.02, 8.4);
  for (const z of [-1.3, 1.6, 4.5]) box(g, '#cfc1a2', 0, Y + 0.06, z, 21.6, 0.02, 0.3);

  // --- prayer hall along the back, under three lead roofs
  box(g, stone, 0, Y, -5.1, 26.6, 5.6, 5.0);
  for (const z of [-6.75, -5.1, -3.45]) gable(g, lead, 0, Y + 5.6, z, 26.8, 1.3, 1.7);
  const hall = face(g, 0, -2.6);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const x = s * (4.1 + i * 2.05);
      arch(hall, marble, x, Y, 0.02, 1.75, 3.75, 0.05);
      arch(hall, dark, x, Y, 0.05, 1.45, 3.5, 0.05);
      for (const dx of [-0.42, 0.42]) arch(hall, glass, x + dx, Y + 4.05, 0.04, 0.5, 1.0, 0.05);
    }
  }

  // --- the transept: marble below, golden mosaic above, a golden gable
  box(g, stone, 0, Y, -5.05, 5.8, 9.2, 5.9);
  gable(g, lead, 0, Y + 9.2, -5.05, 6.1, 1.9, 6.2, RIGHT);
  const front = face(g, 0, -2.1);
  box(front, marble, 0, Y, 0.03, 5.6, 4.6, 0.06);
  for (const x of [-1.75, 0, 1.75]) arch(front, dark, x, Y, 0.07, 1.3, 3.9, 0.06);
  for (const x of [-0.88, 0.88]) cyl(front, '#fbf8f0', x, Y, 0.16, 0.12, 2.9, 8);
  box(front, gold, 0, Y + 4.6, 0.03, 5.6, 4.6, 0.06);
  for (const x of [-1.6, 0, 1.6]) arch(front, glass, x, Y + 5.2, 0.07, 0.9, 1.9, 0.06);
  for (const x of [-2.35, -0.8, 0.8, 2.35]) { box(front, green, x, Y + 7.5, 0.07, 0.34, 1.1, 0.04); ball(front, green, x, Y + 8.6, 0.07, 0.3, 0.9); }
  gable(g, gold, 0, Y + 9.2, -2.07, 0.1, 1.75, 5.7, RIGHT);
  ball(g, green, 0, Y + 9.85, -2.0, 0.3);

  // --- the Dome of the Eagle over the crossing
  box(g, stone, 0, Y + 9.2, -5.05, 4.6, 1.5, 4.6);
  cyl(g, stone2, 0, Y + 10.7, -5.05, 2.25, 1.5, 8);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    box(g, glass, Math.sin(a) * 2.1, Y + 11.0, -5.05 + Math.cos(a) * 2.1, 0.5, 0.9, 0.12, a);
  }
  dome(0, Y + 12.2, -5.05, 2.4, 2.8, leadDark);
  finial(0, Y + 15.0, -5.05, 1.3);

  // --- side arcades of the courtyard
  for (const s of [-1, 1]) {
    box(g, stone, s * 12.1, Y, 1.7, 2.4, 4.4, 8.6);
    box(g, lead, s * 12.1, Y + 4.4, 1.7, 2.7, 0.2, 8.8);
    const inner = face(g, s * 10.9, 1.7, s > 0 ? LEFT : RIGHT);
    for (const x of [-3.1, -1.05, 1.05, 3.1]) {
      arch(inner, marble, x, Y, 0.02, 1.7, 3.3, 0.05);
      arch(inner, dark, x, Y, 0.05, 1.4, 3.05, 0.05);
    }
    const outer = face(g, s * 13.3, 1.7, s > 0 ? RIGHT : LEFT);
    arch(outer, marble, 0, Y, 0.02, 1.9, 3.4, 0.05);
    arch(outer, wood, 0, Y, 0.05, 1.5, 3.1, 0.05);
    for (const x of [-2.9, 2.9]) arch(outer, glass, x, Y + 2.3, 0.04, 0.55, 1.1, 0.05);
  }

  // --- an open colonnade across the front, so the courtyard shows through
  box(g, stone, 0, Y, 6.9, 26.6, 0.45, 1.9);
  for (let i = 0; i < 13; i++) {
    const x = -12 + i * 2;
    if (Math.abs(x) < 1.5) continue; // the minaret stands here
    cyl(g, marble, x, Y + 0.45, 6.9, 0.2, 2.6, 8);
    box(g, marble, x, Y + 3.0, 6.9, 0.56, 0.16, 0.56);
  }
  box(g, stone, 0, Y + 3.16, 6.9, 26.6, 0.6, 1.3);
  box(g, lead, 0, Y + 3.76, 6.9, 26.8, 0.18, 1.6);
  for (const s of [-1, 1]) box(g, stone, s * 12.6, Y, 6.9, 1.4, 3.2, 1.9);

  // --- the Minaret of the Bride, in the middle of the front
  box(g, stone, 0, Y, 6.9, 2.6, 9.6, 2.6);
  arch(face(g, 0, 8.2), marble, 0, Y, 0.02, 1.7, 3.5, 0.05);
  arch(face(g, 0, 8.2), wood, 0, Y, 0.05, 1.35, 3.2, 0.05);
  box(g, stone2, 0, Y + 9.6, 6.9, 3.0, 0.3, 3.0);
  box(g, stone2, 0, Y + 9.9, 6.9, 2.1, 4.4, 2.1);
  for (const [dx, dz] of [[0, 1.06], [1.06, 0], [0, -1.06], [-1.06, 0]]) box(g, glass, dx, Y + 11.2, 6.9 + dz, dx ? 0.06 : 0.6, 1.4, dx ? 0.6 : 0.06);
  box(g, stone, 0, Y + 14.3, 6.9, 3.2, 0.3, 3.2);
  box(g, wood, 0, Y + 14.6, 6.9, 2.9, 0.5, 2.9);
  box(g, stone, 0, Y + 14.6, 6.9, 1.5, 3.2, 1.5);
  cyl(g, stone2, 0, Y + 17.8, 6.9, 0.62, 1.1, 8);
  dome(0, Y + 18.9, 6.9, 0.8, 1.1);
  finial(0, Y + 20.0, 6.9);

  // --- the Minaret of Jesus, tall and slender, at the back right
  const jx = 11.9, jz = -6.2;
  box(g, stone, jx, Y, jz, 2.6, 11.2, 2.6);
  box(g, stone2, jx, Y + 11.2, jz, 3.1, 0.3, 3.1);
  cyl(g, stone, jx, Y + 11.5, jz, 0.98, 6.0, 8);
  cyl(g, stone2, jx, Y + 17.5, jz, 1.45, 0.25, 8);
  cyl(g, wood, jx, Y + 17.75, jz, 1.3, 0.45, 8);
  cyl(g, stone, jx, Y + 17.75, jz, 0.72, 3.3, 8);
  cyl(g, stone2, jx, Y + 21.05, jz, 1.05, 0.22, 8);
  cone(g, leadDark, jx, Y + 21.27, jz, 0.85, 3.2);
  finial(jx, Y + 24.4, jz);

  // --- the Minaret of Qaytbay, eight-sided with three balconies, at the back left
  const qx = -11.9, qz = -6.2;
  box(g, stone, qx, Y, qz, 2.6, 9.0, 2.6);
  cyl(g, stone2, qx, Y + 9.0, qz, 1.75, 0.28, 8);
  cyl(g, stone, qx, Y + 9.28, qz, 1.12, 4.4, 8);
  cyl(g, stone2, qx, Y + 13.68, qz, 1.6, 0.26, 8);
  cyl(g, stone, qx, Y + 13.94, qz, 0.9, 3.4, 8);
  cyl(g, stone2, qx, Y + 17.34, qz, 1.3, 0.24, 8);
  cyl(g, stone, qx, Y + 17.58, qz, 0.62, 2.2, 8);
  ball(g, stone2, qx, Y + 20.35, qz, 0.72, 1.15);
  finial(qx, Y + 21.1, qz);

  // --- in the courtyard: the Dome of the Treasury, the fountain, the Dome of the Clocks
  const kiosk = (x, z, r, bodyColor, bodyH) => {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      cyl(g, '#fbf8f0', x + Math.cos(a) * r * 0.82, Y + 0.06, z + Math.sin(a) * r * 0.82, 0.1, 1.7, 8);
    }
    cyl(g, bodyColor, x, Y + 1.76, z, r, bodyH, 8);
    dome(x, Y + 1.76 + bodyH, z, r * 1.03, r * 0.85);
    finial(x, Y + 1.76 + bodyH + r * 0.85, z, 0.7);
  };
  kiosk(-6.8, 0.9, 1.4, gold, 1.25);
  cyl(g, green, -6.8, Y + 2.2, 0.9, 1.43, 0.22, 8);
  kiosk(6.8, 0.9, 1.05, stone2, 0.5);
  cyl(g, marble, 0, Y + 0.06, 2.6, 1.35, 0.4, 8);
  cyl(g, '#6ec6f0', 0, Y + 0.3, 2.6, 1.1, 0.2, 8);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    cyl(g, '#fbf8f0', Math.cos(a) * 1.55, Y + 0.06, 2.6 + Math.sin(a) * 1.55, 0.08, 1.9, 8);
  }
  hip(g, lead, 0, Y + 1.96, 2.6, 3.7, 0.9, 3.7);
  finial(0, Y + 2.86, 2.6, 0.6);

  // --- the pigeons of the courtyard
  for (const [x, z, c] of [[-3.2, 3.4, '#f4f4f0'], [-2.7, 3.9, '#b9bec6'], [-3.8, 4.1, '#f4f4f0'], [3.1, 0.4, '#b9bec6'], [3.6, -0.1, '#f4f4f0'],
    [4.2, 4.0, '#f4f4f0'], [-8.4, 3.6, '#b9bec6'], [8.2, 3.2, '#f4f4f0'], [2.6, 4.6, '#b9bec6'], [-0.6, -0.9, '#f4f4f0']]) {
    ball(g, c, x, Y + 0.16, z, 0.13, 0.8);
  }
}
umayyad.label = 'الجامع الأموي';
umayyad.top = 25.6;   // the tip of the tallest minaret
umayyad.signY = 19.5; // where the account name floats, above the Dome of the Eagle
