import { box, cyl, face, square, tree, win } from './kit.js';
import { lamp } from './world.js';

export function idlibClock(g) {
  const stone = '#dfd7c4', trim = '#3c4a46', faceBg = '#f7f4eb', handCol = '#1c2024';
  square(g, 28, 28, '#e2dccd', '#c7beaa');

  box(g, stone, 0, 0.36, 0, 8.2, 1.4, 8.2);
  box(g, trim, 0, 1.76, 0, 6.8, 0.45, 6.8);
  box(g, stone, 0, 2.21, 0, 5.4, 15.5, 5.4);
  box(g, trim, 0, 17.71, 0, 6.2, 0.6, 6.2);
  box(g, stone, 0, 18.31, 0, 4.6, 5.2, 4.6);

  for (const ang of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const f = new THREE.Group();
    f.rotation.y = ang;
    g.add(f);

    const dial = cyl(f, faceBg, 0, 20.9, 2.38, 1.65, 0.25, 24);
    dial.rotation.x = Math.PI / 2;

    const rim = cyl(f, trim, 0, 20.9, 2.42, 1.75, 0.16, 24);
    rim.rotation.x = Math.PI / 2;

    box(f, handCol, 0, 21.35, 2.54, 0.12, 0.95, 0.06);
    const minHand = box(f, handCol, 0.38, 20.9, 2.55, 0.78, 0.1, 0.06);
    minHand.rotation.z = -0.35;
  }

  cyl(g, trim, 0, 24.4, 0, 0.35, 3.2, 12);
  cyl(g, '#d8b24c', 0, 26.2, 0, 0.65, 0.65, 14);

  for (const [tx, tz] of [[-9, -9], [9, -9], [-9, 9], [9, 9]]) tree(g, tx, tz, 0.9);
  for (const [lx, lz] of [[-6.5, 6.5], [6.5, 6.5], [-6.5, -6.5], [6.5, -6.5]]) lamp(g, lx, lz, 3.2);
}
idlibClock.label = 'ساعة إدلب';
idlibClock.top = 26.5;
idlibClock.size = [28, 28];

export function freedomClock(g) {
  const stone = '#e6e1d5', accent = '#2e7d4f', dark = '#24292e';
  square(g, 26, 26, '#e5e0d3', '#c8c0ad');

  box(g, stone, 0, 0.36, 0, 7.6, 1.2, 7.6);
  box(g, accent, 0, 1.56, 0, 6.4, 0.4, 6.4);
  box(g, stone, 0, 1.96, 0, 4.8, 16.0, 4.8);
  box(g, dark, 0, 17.96, 0, 5.6, 0.55, 5.6);
  box(g, stone, 0, 18.51, 0, 4.2, 4.4, 4.2);

  for (const ang of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const side = face(g, 0, 20.7, 0, 0);
    side.rotation.y = ang;
    const dial = cyl(side, '#ffffff', 0, 0, 2.18, 1.5, 0.2, 24);
    dial.rotation.x = Math.PI / 2;
    box(side, dark, 0, 0.42, 2.3, 0.12, 0.85, 0.06);
    box(side, accent, -0.35, 0, 2.31, 0.72, 0.1, 0.06);
  }

  cyl(g, accent, 0, 23.6, 0, 1.4, 1.4, 16);
  cyl(g, '#d8b24c', 0, 24.8, 0, 0.25, 2.2, 10);

  for (const [tx, tz] of [[-8.5, 8.5], [8.5, 8.5], [-8.5, -8.5], [8.5, -8.5]]) tree(g, tx, tz, 0.85);
  lamp(g, -6, 6, 3.0);
  lamp(g, 6, 6, 3.0);
}
freedomClock.label = 'ساعة الحرية';
freedomClock.top = 25.8;
freedomClock.size = [26, 26];

export function homsClock(g) {
  const basalt = '#3c3b39', stone = '#d8d0be', faceCol = '#f6f3ea';
  square(g, 28, 28, '#ddd6c5', '#bfb6a2');

  box(g, basalt, 0, 0.36, 0, 8.4, 1.5, 8.4);
  box(g, stone, 0, 1.86, 0, 6.6, 14.5, 6.6);
  box(g, basalt, 0, 16.36, 0, 7.2, 0.65, 7.2);
  box(g, stone, 0, 17.01, 0, 5.2, 5.0, 5.2);

  for (const ang of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const f = new THREE.Group();
    f.rotation.y = ang;
    g.add(f);
    const d = cyl(f, faceCol, 0, 19.5, 2.68, 1.7, 0.22, 24);
    d.rotation.x = Math.PI / 2;
    box(f, basalt, 0, 19.95, 2.82, 0.13, 0.9, 0.06);
    box(f, basalt, 0.42, 19.5, 2.83, 0.82, 0.1, 0.06);
  }

  cyl(g, basalt, 0, 22.8, 0, 1.8, 1.6, 6);
  cyl(g, '#d8b24c', 0, 24.4, 0, 0.3, 2.4, 10);

  for (const [tx, tz] of [[-9, 9], [9, 9], [-9, -9], [9, -9]]) tree(g, tx, tz, 0.9);
  lamp(g, -6.5, 6.5, 3.2);
  lamp(g, 6.5, -6.5, 3.2);
}
homsClock.label = 'ساعة حمص';
homsClock.top = 25.5;
homsClock.size = [28, 28];

export function aleppoCitadel(g) {
  const stone = '#cbb997', darkStone = '#a99572';
  square(g, 64, 64, '#d9cca9', '#b8a57e');

  // Slope / glacis & main citadel wall
  cyl(g, darkStone, 0, 5.5, 0, 29, 11, 28);
  cyl(g, stone, 0, 13.5, 0, 23.5, 6.5, 28);

  // Towers around the citadel
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const tx = Math.cos(a) * 22.5;
    const tz = Math.sin(a) * 22.5;
    cyl(g, stone, tx, 14.2, tz, 3.4, 8.2, 14);
  }

  // Keep / upper hall
  box(g, stone, 0, 18.8, 0, 15, 4.5, 13);
  box(g, darkStone, 0, 21.3, 0, 16, 0.6, 14);

  for (const [lx, lz] of [[-18, 18], [18, 18], [-18, -18], [18, -18]]) lamp(g, lx, lz, 3.6);
}
aleppoCitadel.label = 'قلعة حلب';
aleppoCitadel.top = 22.5;
aleppoCitadel.size = [64, 64];

export function krak(g) {
  const stone = '#c7b89c', shadow = '#9e8e72';
  square(g, 56, 56, '#d6c8ad', '#b5a384');

  box(g, stone, 0, 5.5, 0, 34, 11, 30);
  box(g, shadow, 0, 12.2, -3, 22, 6.5, 18);
  for (const [wx, wz] of [[-17, -15], [17, -15], [-17, 15], [17, 15]]) {
    cyl(g, stone, wx, 7.5, wz, 4.2, 15, 14);
  }
  lamp(g, -14, 18, 3.4);
  lamp(g, 14, 18, 3.4);
}
krak.label = 'قلعة الحصن';
krak.top = 16.0;
krak.size = [56, 56];

export function marqab(g) {
  const basalt = '#363432', stone = '#8e8578';
  square(g, 52, 52, '#cfc6b6', '#ada28f');

  box(g, basalt, 0, 6.5, 0, 32, 13, 28);
  box(g, stone, 2, 14.5, -2, 20, 5.5, 16);
  cyl(g, basalt, -12, 8.5, 10, 4.5, 17, 14);
  lamp(g, -12, 16, 3.2);
  lamp(g, 12, 16, 3.2);
}
marqab.label = 'قلعة المرقب';
marqab.top = 17.5;
marqab.size = [52, 52];

export function palmyra(g) {
  const sand = '#e3cfa3', accent = '#caa86e';
  square(g, 60, 60, '#e8d8b5', '#cbb487');

  // Temple of Bel podium & colonnade
  box(g, sand, -10, 1.5, -8, 22, 3.0, 16);
  for (let x = -19; x <= -1; x += 3.6) {
    for (const z of [-15, -1]) {
      cyl(g, sand, x, 6.5, z, 0.55, 7.0, 10);
    }
  }
  box(g, accent, -10, 10.3, -8, 22.8, 0.9, 16.8);

  // Colonnade avenue & tetrapylon
  for (let z = -2; z <= 22; z += 4.8) {
    cyl(g, sand, 8, 5.2, z, 0.45, 9.5, 10);
    cyl(g, sand, 15, 5.2, z, 0.45, 9.5, 10);
  }
  for (const [px, pz] of [[10, 10], [13, 10], [10, 13], [13, 13]]) {
    cyl(g, accent, px, 4.8, pz, 0.42, 8.8, 10);
  }

  for (const [tx, tz] of [[-22, 18], [22, -18]]) tree(g, tx, tz, 0.9);
  lamp(g, 11.5, 18, 3.2);
}
palmyra.label = 'تدمر';
palmyra.top = 11.5;
palmyra.size = [60, 60];

export function maaratHospital(g) {
  const stone = '#e6dec8', stone2 = '#cfc3a4', trim = '#2f6b5f', glass = '#7fa8bf', dark = '#2b2d33';
  square(g, 56, 48, '#e3ddd0', '#c7bca2');

  // المبنى الرئيسي للمشفى الوطني (طابقان رئيسيان + ملحق علوي)
  box(g, stone, -4, 0.36, -5, 28, 4.4, 14);
  box(g, stone2, -4, 4.76, -5, 28.4, 0.35, 14.4);
  box(g, stone, -4, 5.11, -5, 27.6, 4.2, 13.6);
  box(g, stone2, -4, 9.31, -5, 28.6, 0.45, 14.6);
  box(g, stone, -6, 9.76, -6, 16, 2.2, 8);
  box(g, trim, -4, 9.2, -5, 28.5, 0.18, 14.5);

  // نوافذ الواجهة الأمامية وشعار الصليب الطبي
  const front = face(g, -4, 2.0, 0, 0.36);
  for (const x of [-11, -7.5, -4, -0.5, 3, 6.5, 10]) {
    win(front, x, 1.1, 1.4, 1.8, { frame: stone2, glass, bars: false });
    win(front, x, 5.6, 1.4, 1.8, { frame: stone2, glass, bars: false });
  }
  box(front, '#c93b2b', 0, 7.9, 0.08, 0.45, 1.3, 0.06);
  box(front, '#c93b2b', 0, 7.9, 0.08, 1.3, 0.45, 0.06);

  // مدخل الإسعاف والمظلة الجانبية وسيارات الإسعاف
  box(g, trim, 13.5, 0.36, 1.5, 8.5, 4.2, 11);
  box(g, dark, 13.5, 0.36, 7.05, 3.6, 2.8, 0.12);
  box(g, '#c93b2b', 13.5, 3.4, 7.1, 5.2, 0.65, 0.12);

  for (const [ax, az] of [[10.5, 13.5], [16.5, 13.5]]) {
    const amb = face(g, ax, az, 0, 0.36);
    box(amb, '#f5f6f8', 0, 0.45, 0, 2.1, 1.1, 4.4);
    box(amb, '#f5f6f8', 0, 1.55, -0.3, 2.0, 0.95, 2.8);
    box(amb, glass, 0, 1.65, 1.12, 1.75, 0.6, 0.05);
    box(amb, '#c93b2b', 0, 1.15, 2.22, 1.4, 0.24, 0.05);
    box(amb, '#2b6cb0', 0, 2.55, 0.4, 0.9, 0.22, 0.35);
    for (const [wx, wz] of [[-1.05, -1.3], [1.05, -1.3], [-1.05, 1.3], [1.05, 1.3]]) {
      const w = cyl(amb, dark, wx, 0.38, wz, 0.38, 0.24, 10);
      w.rotation.z = Math.PI / 2;
    }
  }

  // سارية العلم والأشجار وأعمدة الإنارة
  cyl(g, '#d8d8d8', -22, 0.36, 16, 0.08, 11, 8);
  box(g, '#2e7d4f', -20.6, 10.6, 16, 2.8, 0.5, 0.05);
  box(g, '#ffffff', -20.6, 10.1, 16, 2.8, 0.5, 0.05);
  box(g, '#1f2326', -20.6, 9.6, 16, 2.8, 0.5, 0.05);

  for (const [tx, tz] of [[-22, -16], [-12, 17], [-3, 17], [6, 17], [22, -14]]) tree(g, tx, tz, 1.05);
  for (const [lx, lz] of [[-16, 11], [4, 11], [-16, -16], [18, -16]]) lamp(g, lx, lz, 3.4);
}
maaratHospital.label = 'المشفى الوطني - معرة النعمان';
maaratHospital.top = 13.5;
maaratHospital.size = [56, 48];

export const ZONES = [
  { id: 'idlib-clock', zone: 'إدلب', place: 'ساعة إدلب', at: [35.931, 36.630], model: idlibClock, ground: '#dcd5c3' },
  { id: 'freedom-clock', zone: 'إدلب', place: 'ساعة الحرية', at: [35.932, 36.631], model: freedomClock, ground: '#dcd5c3' },
  { id: 'homs-clock', zone: 'حمص', place: 'ساعة حمص', at: [34.714, 36.713], model: homsClock, ground: '#d8d1c1' },
  { id: 'aleppo-citadel', zone: 'حلب', place: 'قلعة حلب', at: [37.162, 36.199], model: aleppoCitadel, ground: '#d2c3a3' },
  { id: 'krak-des-chevaliers', zone: 'طرطوس / حمص', place: 'قلعة الحصن', at: [36.295, 34.757], model: krak, ground: '#cfc2a6' },
  { id: 'marqab-castle', zone: 'طرطوس', place: 'قلعة المرقب', at: [35.948, 35.016], model: marqab, ground: '#c8bfb0' },
  { id: 'palmyra', zone: 'حمص - تدمر', place: 'تدمر', at: [38.268, 34.551], model: palmyra, ground: '#e2d1ae' },
  { id: 'maarat-hospital', zone: 'معرة النعمان - إدلب', place: 'المشفى الوطني', at: [36.674, 35.647], model: maaratHospital, ground: '#dcd5c2' },
];
