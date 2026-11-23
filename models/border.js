// The borders: every country's fence round its town, and a border crossing
// where a highway goes through it. Built along local x (a fence) or across a
// road that runs along local z (a crossing); the city places and turns them.
import { box, cyl, put, GEO, shine } from './kit.js';

const POST = '#4a5750', RAIL = '#6d7b72', GLASS = shine('#bfe3f2', 1);
const LAMP = shine('#ffe3a0', 3);
export const COUNTRY_COLOR = { '': '#ce1126', JO: '#007a3d', LB: '#00a651', IQ: '#ce1126', EG: '#c09300', MA: '#c1272d' };

// A straight fence from (x0, z0) to (x1, z1), with gaps [from, to] (distances along it).
export function fence(g, x0, z0, x1, z1, gaps = []) {
  const L = Math.hypot(x1 - x0, z1 - z0);
  if (L < 0.5) return;
  const dx = (x1 - x0) / L, dz = (z1 - z0) / L, ry = Math.atan2(-dz, dx);
  const open = (u) => gaps.some(([a, b]) => u > a && u < b);
  // runs between the gaps
  const cuts = [0, ...gaps.flat().filter((u) => u > 0 && u < L).sort((a, b) => a - b), L];
  for (let i = 0; i + 1 < cuts.length; i++) {
    const a = cuts[i], b = cuts[i + 1];
    if (b - a < 0.3 || open((a + b) / 2)) continue;
    const m = (a + b) / 2, x = x0 + dx * m, z = z0 + dz * m;
    for (const y of [0.35, 1.15, 1.95]) box(g, RAIL, x, y, z, b - a, 0.09, 0.09, ry);
    box(g, '#8d9a90', x, 0.05, z, b - a, 0.3, 0.25, ry); // a low kerb under it
  }
  for (let u = 0; u <= L + 0.01; u += 3.5) {
    if (open(u)) continue;
    box(g, POST, x0 + dx * u, 0, z0 + dz * u, 0.2, 2.35, 0.2, ry);
  }
}

// A border crossing across a road 16 wide that runs along local z, at z = 0:
// a canopy over both carriageways, a booth on the median and one on each side,
// raised barrier arms, lamps, and two flag poles (the city hangs the flags at FLAGS).
export const FLAGS = [[-13.5, 9.5], [13.5, 9.5]]; // [x, top of the pole]
export function crossing(g, code) {
  const color = COUNTRY_COLOR[code] || '#2f6b4f';
  for (const x of [-10, 10]) for (const z of [-3.2, 3.2]) cyl(g, '#f2f0ea', x, 0, z, 0.28, 6.2, 10);
  box(g, '#f2f0ea', 0, 6.2, 0, 21.6, 0.55, 8.2);                 // the canopy
  box(g, color, 0, 5.9, 4.12, 21.6, 0.65, 0.08);                  // its band in the country's colour
  box(g, color, 0, 5.9, -4.12, 21.6, 0.65, 0.08);
  for (const x of [-7, -3.5, 3.5, 7]) box(g, LAMP, x, 6.0, 0, 1.2, 0.08, 0.5); // lights under it
  const booth = (x) => {
    box(g, '#dcd6c8', x, 0.15, 0, 1.6, 0.25, 3.4);
    box(g, '#f7f5ef', x, 0.4, 0, 1.4, 2.4, 3.0);
    for (const s of [-1, 1]) box(g, GLASS, x + s * 0.71, 1.4, 0, 0.04, 1.0, 2.4);
    box(g, color, x, 2.8, 0, 1.6, 0.25, 3.2);
  };
  booth(0); booth(-11.6); booth(11.6);
  for (const s of [-1, 1]) { // the barrier arms, raised, one over each carriageway
    box(g, '#2b2d33', s * 1.2, 0.15, -3.6, 0.35, 1.1, 0.35);
    const arm = box(g, '#e5362b', s * 1.2, 1.15, -3.6, 0.12, 6.6, 0.12);
    arm.rotation.z = -s * 0.42;
    for (let i = 0; i < 3; i++) {
      const w = box(g, '#ffffff', s * 1.2 + s * (0.55 + i * 0.95), 1.6 + i * 2.1, -3.6, 0.13, 0.7, 0.13);
      w.rotation.z = -s * 0.42;
    }
  }
  for (const [x, top] of FLAGS) {                                 // the flag poles
    cyl(g, '#dfe3ea', x, 0, 4, 0.12, top, 8);
    put(g, GEO.ball, '#d6ad4e', x, top + 0.15, 4, 0.2, 0.2, 0.2);
  }
  for (const s of [-1, 1]) box(g, '#f0c419', s * 4.4, 0.13, -6.5, 7.6, 0.02, 0.4); // the stop lines
}
