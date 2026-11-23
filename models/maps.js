// The countries far apart, each on its own land shaped like its map (the
// user's idea, 2026-11-20). This file is read by public/city.js AND by
// server.js (which evaluates it, see loadMaps there), so both place towns and
// blocks the same way: keep it plain (consts and functions, no imports).
//
// The countries' outlines, simplified by hand (longitude, latitude).
// Palestine is the whole of historic Palestine, and Morocco includes its
// Sahara, as maps in the Arab world show them.
export const OUTLINES = {
  '': [ // Syria
    [35.92, 35.93], [36.2, 36.0], [36.45, 36.22], [36.65, 36.25], [36.6, 36.6], [36.7, 36.82], [37.1, 36.65], [38.0, 36.85],
    [39.0, 36.7], [40.0, 36.9], [41.0, 37.1], [42.0, 37.3], [42.36, 37.11], [41.85, 36.6], [41.4, 35.6], [41.0, 34.8],
    [40.95, 34.4], [38.79, 33.37], [36.84, 32.31], [35.78, 32.74], [35.82, 33.3], [36.05, 33.75], [36.35, 33.95],
    [36.62, 34.2], [36.45, 34.62], [35.97, 34.65], [35.9, 35.0], [35.85, 35.45], [35.75, 35.6],
  ],
  LB: [
    [35.1, 33.09], [35.22, 33.25], [35.37, 33.55], [35.48, 33.9], [35.65, 34.25], [35.84, 34.45], [35.97, 34.65],
    [36.45, 34.62], [36.62, 34.2], [36.35, 33.95], [36.05, 33.75], [35.82, 33.3], [35.6, 33.25],
  ],
  JO: [
    [35.57, 32.65], [35.78, 32.74], [36.84, 32.31], [38.79, 33.37], [39.3, 32.24], [37.0, 31.5], [38.0, 30.5],
    [37.5, 30.0], [36.75, 29.87], [36.5, 29.5], [36.07, 29.19], [34.96, 29.36], [35.15, 30.0], [35.42, 31.1],
    [35.55, 31.8], [35.55, 32.4],
  ],
  PS: [
    [35.1, 33.09], [35.5, 33.1], [35.64, 33.24], [35.65, 32.7], [35.57, 32.65], [35.55, 32.4], [35.55, 31.8],
    [35.42, 31.1], [35.15, 30.0], [34.96, 29.55], [34.9, 29.5], [34.27, 31.22], [34.5, 31.6], [34.75, 32.1],
    [34.9, 32.5], [35.07, 32.9],
  ],
  IQ: [
    [42.36, 37.11], [43.0, 37.35], [44.2, 37.3], [44.8, 37.15], [45.0, 36.7], [45.5, 36.0], [46.1, 35.7],
    [45.6, 35.0], [45.9, 34.5], [46.1, 33.0], [47.4, 32.4], [47.7, 31.9], [47.85, 31.0], [48.0, 30.45],
    [48.6, 29.95], [47.95, 29.95], [46.55, 29.1], [44.7, 29.18], [42.0, 31.1], [40.4, 31.95], [39.2, 32.16],
    [38.79, 33.37], [40.95, 34.4], [41.0, 34.8], [41.4, 35.6], [41.85, 36.6],
  ],
  EG: [
    [25.15, 31.65], [27.0, 31.35], [29.0, 30.85], [29.9, 31.2], [31.0, 31.6], [32.3, 31.25], [33.2, 31.1],
    [34.22, 31.32], [34.9, 29.5], [34.25, 27.73], [33.75, 28.4], [32.55, 29.95], [33.0, 28.6], [33.8, 27.2],
    [34.6, 26.0], [35.6, 24.0], [36.9, 22.0], [25.0, 22.0], [25.0, 29.25], [24.7, 30.1],
  ],
  MA: [
    [-5.9, 35.8], [-5.3, 35.9], [-4.0, 35.2], [-2.9, 35.25], [-2.2, 35.1], [-1.75, 34.75], [-1.65, 33.9],
    [-1.75, 32.6], [-1.2, 32.1], [-3.7, 30.9], [-5.6, 29.5], [-8.67, 28.7], [-8.67, 26.0], [-12.0, 26.0],
    [-12.0, 23.45], [-13.1, 22.75], [-13.0, 21.33], [-16.95, 21.33], [-15.9, 23.7], [-14.5, 26.1],
    [-13.15, 27.65], [-11.5, 28.2], [-10.0, 29.0], [-9.6, 30.4], [-9.8, 31.4], [-9.25, 32.5], [-7.6, 33.6],
    [-6.8, 34.1], [-6.2, 35.0],
  ],
  YE: [ // Yemen (2026-11-20)
    [42.75, 16.4], [43.2, 16.7], [43.4, 17.5], [44.2, 17.4], [45.2, 17.4], [46.4, 17.2], [47.4, 17.0], [48.2, 18.2],
    [49.1, 18.6], [52.0, 19.0], [53.1, 16.65], [52.2, 15.7], [51.5, 15.3], [50.5, 15.1], [49.5, 14.6], [48.7, 14.0],
    [47.5, 13.9], [46.0, 13.4], [45.0, 12.8], [44.2, 12.6], [43.47, 12.67], [43.25, 13.3], [43.1, 14.1], [42.8, 14.8],
    [42.95, 15.5],
  ],
  SA: [ // Saudi Arabia (2026-11-22)
    [34.95, 29.35], [36.07, 29.19], [36.5, 29.5], [36.75, 29.87], [37.5, 30.0], [38.0, 30.5], [37.0, 31.5], [39.3, 32.24],
    [40.4, 31.95], [42.0, 31.1], [44.7, 29.18], [46.55, 29.1], [48.4, 28.5], [49.6, 27.0], [50.2, 26.3], [50.8, 25.5],
    [50.8, 24.75], [51.6, 24.3], [52.6, 22.9], [55.2, 22.7], [55.6, 22.0], [55.0, 20.0], [52.0, 19.0], [49.1, 18.6],
    [48.2, 18.2], [47.4, 17.0], [46.4, 17.2], [45.2, 17.4], [44.2, 17.4], [43.4, 17.5], [43.2, 16.7], [42.75, 16.4],
    [42.5, 17.5], [41.5, 19.0], [40.5, 20.5], [39.2, 21.5], [38.5, 23.5], [37.5, 24.5], [36.6, 25.8], [35.5, 27.5], [34.6, 28.1],
  ],
};
export const AT = { '': [36.3, 33.51], LB: [35.85, 33.95], JO: [36.0, 31.95], PS: [35.22, 31.78], IQ: [44.4, 33.3], EG: [31.2, 29.5], MA: [-7.6, 31.6], YE: [44.2, 15.35], SA: [46.72, 24.69] };

// Where each town's spiral of blocks starts on the one grid all towns share
// (ox, oz in blocks). OLD_AT: where they were before; a town moved whole (its
// spiral start, its territory band, what stands at fixed places in it), so
// every house kept its place inside its own country.
// Yemen came after the spread (2026-11-20): it never moved, east of Egypt on Egypt's row (the highway between them).
// Saudi Arabia came after the spread too (2026-11-22): south of Iraq on Iraq's column (the highway between them), east of Jordan.
export const OLD_AT = { '': [0, 0], LB: [-18, 0], JO: [0, 18], IQ: [18, 0], MA: [-38, 0], EG: [0, 38], PS: [-22, 18], YE: [88, 480], SA: [274, 184] };
export const TOWN_AT = { '': [0, 0], LB: [-87, 0], MA: [-140, 0], IQ: [274, 0], JO: [0, 276], EG: [0, 480], PS: [-56, 276], YE: [88, 480], SA: [274, 184] };
// Each town's land: where the village's middle is on its map (map units round
// AT) and how many metres a degree is. Worked out from each village's size
// (2026-11-20): a land holds its village with room to grow, Syria bigger than
// Jordan as on the map, and 400 m or more of desert between two lands.
export const LAND = {
  '': { at: [0.781, -0.172], s: 1650 }, LB: { at: [0.103, -0.115], s: 1110 }, JO: { at: [-0.146, 1.297], s: 1350 },
  IQ: { at: [-0.589, -0.131], s: 520 }, MA: { at: [2.768, -1.386], s: 230 }, EG: { at: [-1.675, 4.846], s: 330 }, PS: { at: [-0.25, 0.597], s: 900 },
  YE: { at: [0, 0], s: 330 }, // the village at Sana'a
  SA: { at: [0, 0], s: 280 }, // the village at Riyadh, 800 m or more of desert to Iraq, Jordan and Yemen
};
// Kept free of new houses besides the reserved places: the road from the
// Damascus–Baghdad highway to Damascus airport (x0, x1, z0, z1).
export const KEEP_CLEAR = [[426, 454, -297, -12]];

// A town's land as [x, z] points on the ground. bw, bd: a block with its street.
export function landPolygon(code, bw, bd) {
  const L = LAND[code], [ox, oz] = TOWN_AT[code], cx = (ox + 0.5) * bw, cz = (oz + 0.5) * bd;
  return project(code).map(([x, z]) => [cx + (x - L.at[0]) * L.s, cz + (z - L.at[1]) * L.s]);
}
// Is the block at bx, bz of the grid wholly on the land (12 m in from its edge)?
export function blockOnLand(poly, bx, bz, bw, bd) {
  const m = 12, x0 = bx * bw - bw / 2 - m, x1 = bx * bw + bw / 2 + m, z0 = bz * bd - bd / 2 - m, z1 = bz * bd + bd / 2 + m;
  return inside(poly, x0, z0) && inside(poly, x1, z0) && inside(poly, x0, z1) && inside(poly, x1, z1);
}

// Longitude, latitude -> map units round AT (x east, z south; one degree of latitude is 1).
export function project(code) {
  const [lon0, lat0] = AT[code], k = Math.cos((lat0 * Math.PI) / 180);
  return OUTLINES[code].map(([lon, lat]) => [(lon - lon0) * k, -(lat - lat0)]);
}
export function inside(poly, x, z) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}

// The spiral of blocks (spiral() in public/city.js) the other way round: which
// step of it the block x, z (from the spiral's start) is.
export function spiralIndex(x, z) {
  const k = Math.max(Math.abs(x), Math.abs(z));
  if (!k) return 0;
  const s = (2 * k - 1) ** 2;
  if (x === k && z > -k) return s + z + k - 1;
  if (z === k) return s + 3 * k - 1 - x;
  if (x === -k) return s + 5 * k - 1 - z;
  return s + 7 * k - 1 + x;
}

// «السيف الدمشقي» in the middle of Damascus, a little north-west of the mosque
// (the user, 2026-11-21: «حط السيف الدمشقي بنص دمشق بعدو شوي عن الجامع الأموي و كبّرو»):
// 2 x 4 of Syria's blocks, columns -5..-4, rows -6..-3 of the shared grid, so
// its roundabout is on a crossing of two streets, which run into it.
export const SWORD_TILES = [-5, -4, -6, -3];
export const SWORD_SCALE = 1.6;
// Blocks that never hold houses, besides each town's landmark blocks and the
// reserved places: Bosra, the big Souq al-Hamidiyeh and the sword in Syria,
// Abdali in Jordan (min col, max col, min row, max row of the shared grid).
export const FIXED_TILES = { '': [[0, 3, 2, 3], [-4, -3, 1, 1], SWORD_TILES], JO: [[7, 8, 277, 278]] };

// Where a town's houses go (the user, 2026-11-21: «زبّط بيوت سوريا وحطّهم كلهم
// حوالي الجامع الأموي… كل الدول زبّط بيوتها حوالي المعلم الرئيسي»): its blocks
// nearest its main landmark first (the mosque in Syria, the 2 x 2 landmark of a
// village), on its own land, past its landmark blocks (taken: a Set of "bx,bz")
// and the reserved places (reserved: [x0, x1, z0, z1], kept 8 m clear). Its
// houses take them in order, one block of PER_BLOCK houses after another, so
// the oldest are nearest the landmark. They never go off its map (the user,
// 2026-11-21: «لا تخلي البيوت الجديدة تطلع برا الخريطة لما يصيرو كتار»): every
// free block of its land comes first; only once its land is full (Syria's
// holds about 400,000 houses, the smallest, Lebanon's, about 8,500), the nearest free ground
// off it, never on another country's land.
// Returns k -> [bx, bz], the k-th house block on the shared grid.
// Used by public/city.js and server.js alike: keep the two in step.
export function compactOrder(code, bw, bd, reserved, taken) {
  const [ox, oz] = TOWN_AT[code], poly = landPolygon(code, bw, bd);
  const hx = code ? 2 * ox + 1 : 0, hz = code ? 2 * oz + 1 : 0; // the landmark's middle, in half blocks
  const box = [Infinity, -Infinity, Infinity, -Infinity];
  for (const [x, z] of poly) {
    box[0] = Math.min(box[0], Math.floor(x / bw)); box[1] = Math.max(box[1], Math.ceil(x / bw));
    box[2] = Math.min(box[2], Math.floor(z / bd)); box[3] = Math.max(box[3], Math.ceil(z / bd));
  }
  const others = Object.keys(TOWN_AT).filter((c) => c !== code).map((c) => landPolygon(c, bw, bd));
  const fixed = FIXED_TILES[code] || [];
  const free = (bx, bz) => {
    if (code ? bx >= ox && bx <= ox + 1 && bz >= oz && bz <= oz + 1 : !bx && !bz) return false;
    if (taken.has(bx + ',' + bz)) return false;
    for (const f of fixed) if (bx >= f[0] && bx <= f[1] && bz >= f[2] && bz <= f[3]) return false;
    const x0 = bx * bw - bw / 2, x1 = bx * bw + bw / 2, z0 = bz * bd - bd / 2, z1 = bz * bd + bd / 2;
    for (const r of reserved) if (x1 > r[0] - 8 && x0 < r[1] + 8 && z1 > r[2] - 8 && z0 < r[3] + 8) return false;
    for (const r of KEEP_CLEAR) if (x1 > r[0] && x0 < r[1] && z1 > r[2] && z0 < r[3]) return false;
    return true;
  };
  const onLand = (bx, bz) => bx >= box[0] && bx <= box[1] && bz >= box[2] && bz <= box[3] && blockOnLand(poly, bx, bz, bw, bd);
  const ok = (bx, bz) => {
    if (!free(bx, bz)) return false;
    if (!past) return onLand(bx, bz); // first the whole land
    if (onLand(bx, bz)) return false; // (already in the list)
    for (const p of others) if (inside(p, bx * bw, bz * bd)) return false;
    return true;
  };
  // How far the land's box reaches from the middle: past that, the land is all in the list.
  let reach = 0;
  for (const bx of [box[0], box[1]]) for (const bz of [box[2], box[3]]) reach = Math.max(reach, Math.hypot((2 * bx - hx) * bw, (2 * bz - hz) * bd) / 2 + bw);
  const tiles = [];
  let R = 0, past = false; // tiles up to R metres from the middle are in the list, nearest first (the land's, then, past, the rest)
  const grow = () => {
    if (past && R > reach * 4) throw new Error('compactOrder: no room for ' + code);
    const R1 = past ? (R ? R * 1.5 : 400) : Math.min(reach, R ? R * 1.5 : 400), lo = 4 * R * R, hi = 4 * R1 * R1, shell = [];
    const cx = hx / 2, cz = hz / 2, nx = Math.ceil(R1 / bw) + 1, nz = Math.ceil(R1 / bd) + 1;
    for (let bz = Math.floor(cz) - nz; bz <= Math.ceil(cz) + nz; bz++) {
      for (let bx = Math.floor(cx) - nx; bx <= Math.ceil(cx) + nx; bx++) {
        const ex = (2 * bx - hx) * bw, ez = (2 * bz - hz) * bd, d = ex * ex + ez * ez;
        if (d > lo && d <= hi || (!R && d === 0)) if (ok(bx, bz)) shell.push([d, bz, bx]);
      }
    }
    shell.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    for (const [, bz, bx] of shell) tiles.push([bx, bz]);
    R = R1;
    if (!past && R >= reach) { past = true; R = 0; } // the whole land is in: now the ground round it
  };
  return (k) => { while (tiles.length <= k) grow(); return tiles[k]; };
}
