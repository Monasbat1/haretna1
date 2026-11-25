// مشفى معرة النعمان الوطني: مجسم ثلاثي الأبعاد تخطيطي مستوحى من مباني المشافي العامة.
// ليس مخططاً هندسياً تنفيذياً أو توثيقاً معمارياً للمبنى الحقيقي.
import { box, cyl, gable, arch, tree, shine } from './kit.js';

const GLASS = shine('#79b4d1', 1.15);
const RED = shine('#d62828', 2.2);
const HEAD = shine('#fff1b5', 2.4);

function vehicle(g, x, z, kind = 'car', color = '#e7e9eb', rot = 0) {
  const ambulance = kind === 'ambulance';
  const w = ambulance ? 3.4 : 2.8, d = ambulance ? 7.2 : 5.8;
  const bodyY = 0.65;
  box(g, '#343a40', x, 0.22, z, w + .25, .42, d + .2, rot);
  box(g, color, x, bodyY, z, w, ambulance ? 1.55 : 1.15, d, rot);
  box(g, ambulance ? '#f7f7f4' : '#a9c8d8', x, ambulance ? 1.75 : 1.35, z - d * .13, w * .92, ambulance ? 1.15 : .65, d * .52, rot);
  // Front windscreen and side windows
  box(g, '#52798d', x, ambulance ? 1.95 : 1.48, z + d * .28, w * .82, ambulance ? .78 : .48, .12, rot);
  for (const side of [-1, 1]) {
    box(g, '#52798d', x + side * (w / 2 + .015), ambulance ? 1.78 : 1.32, z - d * .12, .08, ambulance ? .72 : .45, d * .28, rot);
    for (const wz of [-d * .3, d * .3]) { const wheel = cyl(g, '#24272b', x + side * (w / 2), .48, z + wz, .48, .32, 10); wheel.rotation.z = Math.PI / 2; }
  }
  box(g, HEAD, x - w * .29, .82, z + d / 2 + .04, .55, .22, .12, rot);
  box(g, HEAD, x + w * .29, .82, z + d / 2 + .04, .55, .22, .12, rot);
  if (ambulance) {
    box(g, RED, x, 1.55, z, .22, .12, d * .72, rot);
    box(g, RED, x, 2.45, z - d * .05, 1.15, .22, .48, rot);
    box(g, RED, x, 2.58, z - d * .05, .24, .12, .92, rot);
    box(g, RED, x, 2.58, z - d * .05, .92, .12, .22, rot);
    box(g, '#d62828', x - .75, 2.35, z + d * .12, .5, .18, .22, rot);
    box(g, '#d62828', x + .75, 2.35, z + d * .12, .5, .18, .22, rot);
  }
}

export function hospital(g) {
  const stone = '#e9e7df', trim = '#2f7658', roof = '#aeb7b7', pavement = '#c9c8bf';
  // Landscaped site and arrival forecourt
  box(g, '#9eae83', 0, 0, 0, 116, .22, 92);
  box(g, pavement, 0, .12, 24, 112, .18, 32);
  box(g, '#454b50', 0, .14, 43, 116, .16, 12);
  box(g, '#f0eee6', 0, .25, 5, 66, .25, 46);

  // Main multi-storey hospital block, central entrance and two wings
  box(g, stone, 0, .3, -8, 42, 17, 28);
  box(g, trim, 0, 17.25, -8, 43, .75, 29);
  box(g, '#d6d6cf', 0, 18, -8, 44, .35, 30);
  box(g, stone, -31, .3, -4, 19, 12, 34);
  box(g, stone, 31, .3, -4, 19, 12, 34);
  box(g, trim, -31, 12.3, -4, 19.5, .65, 34.5);
  box(g, trim, 31, 12.3, -4, 19.5, .65, 34.5);
  // Central clinical tower
  box(g, '#f4f2eb', 0, 17.9, -9, 17, 9, 17);
  box(g, roof, 0, 26.9, -9, 18, .6, 18);
  box(g, '#52798d', 0, 21.3, -.35, 9.5, 5.2, .2);
  // Windows in regular bays
  for (const x of [-17, -12, -7, 7, 12, 17]) for (const y of [3, 7, 11, 15]) {
    box(g, GLASS, x, y, 6.18, 2.25, 2.25, .18);
  }
  for (const side of [-1, 1]) for (const x of [side * 25, side * 31, side * 37]) for (const y of [2.8, 6.5, 10]) {
    box(g, GLASS, x, y, 13.15, 2.1, 1.9, .18);
  }
  // Main entrance: glass doors, canopy, steps and clear signage
  box(g, '#5f8798', 0, 2.1, 6.25, 9, 3.8, .25);
  box(g, '#d9e6e8', 0, 1.5, 6.42, 2.6, 2.7, .12);
  box(g, trim, 0, 4.25, 9.5, 18, .55, 8);
  for (const x of [-8, 8]) box(g, '#d7d7d0', x, 2.1, 9.3, .55, 4, .55);
  for (let i = 0; i < 4; i++) box(g, '#b6b5ae', 0, .35 + i * .32, 12 + i * 1.05, 13, .28, 2.1);
  // Red medical cross above the entrance
  box(g, RED, 0, 14.7, 6.35, 1.2, 6.5, .35);
  box(g, RED, 0, 14.7, 6.55, 6.5, 1.2, .35);
  // Roof helipad and small service tower
  box(g, '#68747b', 0, 27.3, -9, 14, .2, 14);
  box(g, '#ffffff', 0, 27.45, -9, 1.1, .08, 8);
  box(g, '#ffffff', 0, 27.45, -9, 8, .08, 1.1);
  box(g, '#f2f0e8', 0, 28, -9, 4, 1.2, 4);

  // Covered emergency bay and two clearly marked ambulances
  box(g, '#e3e4df', 0, 4.3, 19, 31, .5, 12);
  for (const x of [-13, 0, 13]) box(g, '#9a9d98', x, 2.1, 19, .35, 4.2, .35);
  vehicle(g, -8, 23, 'ambulance', '#ffffff');
  vehicle(g, 8, 23, 'ambulance', '#ffffff');
  // Civilian parking and arrival lane
  for (const [x, z, c, r] of [[-30,31,'#d9e0e3',0],[-20,31,'#536d83',0],[20,31,'#b9b7ad',0],[30,31,'#6f7d69',0],[-39,18,'#c7c7c2',0],[39,18,'#a7b9c4',0]]) vehicle(g, x, z, 'car', c, r);
  // Hospital name board
  box(g, '#244b3c', 0, 7.2, 34, 25, 5.4, .55);
  box(g, '#f7f4e9', 0, 7.3, 34.32, 22.8, 4.5, .12);
  box(g, RED, -9.2, 7.3, 34.45, .65, 3.2, .12);
  box(g, RED, -9.2, 7.3, 34.5, 3.2, .65, .12);
  // Trees, lamps and planted beds
  for (const [x,z] of [[-49,-29],[49,-29],[-49,5],[49,5],[-48,38],[48,38],[-24,-32],[24,-32]]) tree(g,x,z,1.7,'round');
  for (const x of [-44,-34,34,44]) { cyl(g,'#41464b',x,.25,12,.12,5,8); cyl(g,'#f6d77a',x,5.35,12,.34,.35,8); }
}
hospital.label = 'مشفى معرة النعمان الوطني';
hospital.top = 29;
hospital.size = [120, 100];
