import * as THREE from 'three';
// Pictures in img/: a relative path (works under any folder) + a version that changes every minute,
// so a picture replaced in the admin panel shows up instead of the browser's old copy.
const IMG = (name) => 'img/' + name + '?v=' + Math.floor(Date.now() / 60000);
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getConfig, getHousesData } from './db.js'; // البيانات من Firebase (مع رجوع للملفات الثابتة)
import { bake, car as carModel, box as kitBox, tree as kitTree } from './models/kit.js';
import { HOUSE_LEVELS } from './models/houses.js';
import { MAX_LEVEL, onFloors, tower } from './models/levels.js';
import { villa } from './models/villa.js';
import { umayyad } from './models/landmarks.js';
import { souq as souqModel, SIGN as SOUQ_SIGN, STREET as SOUQ_STREET, MERCHANT as SOUQ_MERCHANT } from './models/souq.js';
import { square as flagSquareModel, post as flagPostModel, SPOTS as FLAG_SPOTS, FLAG_W, FLAG_H, POLE_TOP, SCREEN, PODIUM, drawPlaque, drawBoard } from './models/flags.js';
import { jordanHouse, petra, theatre as theatreModel, royalFrames, ROYAL } from './models/jordan.js';
import { lebanonHouse, raouche } from './models/lebanon.js';
import { iraqHouse, babylon } from './models/iraq.js';
import { moroccoHouse, koutoubia } from './models/morocco.js';
import { egyptHouse, giza } from './models/egypt.js';
import { palestineHouse, aqsa, nativity as nativityModel } from './models/palestine.js';
import { yemenHouse, sanaa } from './models/yemen.js';
import { saudiHouse, kingdomCentre, saudiFrames, SAUDI_ROYAL } from './models/saudi.js';
import { policeStation } from './models/police.js';
import { BIG_FLAG } from './models/world.js';
import { swordRoundabout, RING_R as SWORD_RING, ROAD_W as ROAD_W_SWORD } from './models/sword.js';
import { wadiRum } from './models/wadirum.js';
import { bosra, presidentFrame, PRESIDENT, saroutFrame, SAROUT } from './models/bosra.js';
import { abdali } from './models/abdali.js';
import { norias, wheel as noriaWheel, WHEELS as NORIA_WHEELS } from './models/norias.js';
import { stadium } from './models/stadium.js';
import { jeita } from './models/jeita.js';
import { fence, crossing, FLAGS as CROSSING_FLAGS } from './models/border.js';
import { hejazStation, viaduct, platform as railPlatform, bufferStop, train as trainModel, RAIL } from './models/railway.js';
import { TOWN_AT, landPolygon, inside as inPolygon, compactOrder, spiralIndex, SWORD_TILES, SWORD_SCALE } from './models/maps.js';
import * as social from './social.js'; // الدردشة + الشخصية + زر إخفاء الأزرار
import { createTraffic } from './traffic.js'; // إشارات المرور
import { createDrive } from './drive.js';     // قيادة السيارة الخاصة
import { createWarJet } from './airbase/warjet.js'; // الطائرة الحربية والمطار الحربي
import { createShop } from './shop.js';       // التسوق والدفع والدخول للبيت
import { airport as airportModel, airliner, LIVERIES, SIZE as AIR_SIZE, RUNWAY, TAXI, GATES, STAND_Z, GROUND_Y, ROAD as AIR_ROAD, SIGN as AIR_SIGN, FLAG as AIR_FLAG, RADAR, radarMast, radarDish, airportLights, lightSpots, BEACON } from './models/airport.js';

const $ = (s) => document.querySelector(s);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ------------------------------------------------------------------ layout
// The city is a spiral of blocks around a central plaza. Each block holds
// 8 houses (two rows of four), so every house faces a road.
const PLOT_W = 7, COLS = 4, PER_BLOCK = COLS * 2, ROW_Z = 4.4;
const SLAB_W = COLS * PLOT_W + 1, SLAB_D = 17, ROAD = 6;
const BW = SLAB_W + ROAD, BD = SLAB_D + ROAD;
const BASE_Y = 0.34, FLOOR_H = 2.4;

const spiralCache = [[0, 0]];
let sx = 0, sz = 0, sdx = 1, sdz = 0, segLen = 1, segPassed = 0, turns = 0;
function spiral(n) {
  while (spiralCache.length <= n) {
    sx += sdx; sz += sdz; segPassed++;
    spiralCache.push([sx, sz]);
    if (segPassed === segLen) {
      segPassed = 0;
      [sdx, sdz] = [-sdz, sdx];
      if (++turns % 2 === 0) segLen++;
    }
  }
  return spiralCache[n];
}

// The towns. Syria is the city round the mosque. Each neighbouring country
// has a village of its own: the same spiral of blocks, round its landmark,
// which takes the first four blocks of the spiral (a 2 x 2 square), out along
// highways from Syria (Morocco on past Lebanon, by the Mediterranean; Egypt on past Jordan).
// ox, oz: where the town's spiral starts, in blocks of the one grid all towns share.
// A house lives in the town the server says (house.t); its plot is counted
// among that town's houses only, so a town never moves the houses of another.
const TOWNS = [
  { code: '', name: 'سوريا', ox: 0, oz: 0 },
  { code: 'LB', name: 'لبنان', ox: -18, oz: 0, landmark: raouche, house: lebanonHouse, view: [[26, 20, 52], [-1, 19, -7]] },
  { code: 'JO', name: 'الأردن', ox: 0, oz: 18, landmark: petra, house: jordanHouse, view: [[5, 64, 122], [0, 40, -8]] },
  { code: 'IQ', name: 'العراق', ox: 18, oz: 0, landmark: babylon, house: iraqHouse, view: [[48, 50, 74], [0, 11, -4]] },
  { code: 'MA', name: 'المغرب', ox: -38, oz: 0, landmark: koutoubia, house: moroccoHouse, view: [[-16, 26, 66], [8, 24, -6]] },
  { code: 'EG', name: 'مصر', ox: 0, oz: 38, landmark: giza, house: egyptHouse, view: [[34, 21, 46], [1, 7, -3]] },
  { code: 'PS', name: 'فلسطين', ox: -22, oz: 18, landmark: aqsa, house: palestineHouse, view: [[30, 34, 62], [0, 13, 0]] },
  { code: 'YE', name: 'اليمن', ox: 88, oz: 480, landmark: sanaa, house: yemenHouse, view: [[30, 22, 60], [0, 9, 8]] }, // 2026-11-20, after the spread (models/maps.js)
  { code: 'SA', name: 'السعودية', ox: 274, oz: 184, landmark: kingdomCentre, house: saudiHouse, view: [[60, 70, 150], [0, 48, -6]] }, // 2026-11-22, after the spread
];
// Which towns a highway joins: [from, to]. Syria to its three neighbours; Morocco past Lebanon, Egypt past Jordan, Yemen past Egypt.
const HIGHWAYS = [['', 'LB'], ['', 'JO'], ['', 'IQ'], ['LB', 'MA'], ['JO', 'EG'], ['JO', 'PS'], ['EG', 'YE'], ['IQ', 'SA']];
// «السيف الدمشقي» (models/sword.js), made bigger (SWORD_SCALE), on its roundabout
// in the middle of Damascus a little north-west of the mosque (the user,
// 2026-11-21), on the middle of its 3 x 3 blocks (SWORD_TILES in models/maps.js),
// which no house takes. Until then it stood on the highway to Amman.
const SWORD = { on: [], x: ((SWORD_TILES[0] + SWORD_TILES[1]) / 2) * BW, z: ((SWORD_TILES[2] + SWORD_TILES[3]) / 2) * BD, r: (SWORD_RING + 0.6) * SWORD_SCALE };
// «وادي رم» (models/wadirum.js): Jordan's desert, south of its village by the
// road to Egypt (its track meets that road at x = -0.5 BW), off the block grid
// so it can be big. Moved south with the village drawn in round Petra (2026-11-21), just past its houses.
const RUM = { x: -0.5 * BW - 97.5, z: 1060, w: 160, d: 120 };
// «مدرج بصرى» (models/bosra.js): the theatre of Bosra with its citadel and
// ruins, inside Syria next to the mosque, on 4 x 2 of its blocks (columns
// 0..3, rows 2..3 of the shared grid). The houses on them were taken off by
// the server (ensureBosra in server.js), their plots kept empty under it, so
// no other house moves. 128 x 40, inside the streets round those blocks.
const BOSRA = { tiles: [0, 3, 2, 3], x: 1.5 * BW, z: 2.5 * BD, w: 128, d: 40 };
// «بوليفارد العبدلي» (models/abdali.js): in Jordan's village, a little east of
// Petra, on its four blocks at columns 7..8, rows 19..20 of the shared grid.
// The server built the houses that were there again as Jordan's newest
// (ensureAbdali in server.js); their plots stay empty under it.
const ABDALI = { tiles: [7, 8, 19, 20], x: 7.5 * BW, z: 19.5 * BD, w: 64, d: 40 };
// «سوق الحميدية» (models/souq.js), made bigger and taller (user, 2026-11-19):
// it keeps its landmark block (67, column -4 of row 1) and now also covers the
// block east of it (column -3) and the street between, a long covered street
// with its gate to the west and its Roman columns towards the mosque. The
// server built the houses of that block again as Syria's newest (ensureSouqBig).
const SOUQ = { tiles: [-4, -3, 1, 1], x: -3.5 * BW, z: 1 * BD, rot: -Math.PI / 2 };
const inSouq = (bx, bz) => bx >= SOUQ.tiles[0] && bx <= SOUQ.tiles[1] && bz >= SOUQ.tiles[2] && bz <= SOUQ.tiles[3];
const inAbdali = (bx, bz) => bx >= ABDALI.tiles[0] && bx <= ABDALI.tiles[1] && bz >= ABDALI.tiles[2] && bz <= ABDALI.tiles[3];
const inBosra = (bx, bz) => bx >= BOSRA.tiles[0] && bx <= BOSRA.tiles[1] && bz >= BOSRA.tiles[2] && bz <= BOSRA.tiles[3];
// Territories (must match server.js): from the block each town had reached
// when the rule came in (town.frozen, from the server), a town only takes
// blocks inside its own band of rows and columns (TERRITORY), each open on
// at least one side, with border strips between neighbours, and clear of the
// sword's roundabout and Wadi Rum. So towns never touch, never run out of
// room, and the houses that existed before never move.
const TERRITORY = { // [min col, max col, min row, max row] on the shared grid
  '': [-7, 7, -Infinity, 7], LB: [-27, -10, -Infinity, 7], MA: [-Infinity, -30, -Infinity, 7],
  IQ: [11, Infinity, -Infinity, 7], JO: [-11, Infinity, 11, 33], PS: [-Infinity, -14, 11, 33], EG: [-Infinity, Infinity, 37, Infinity],
};
// The two airports (models/airport.js), off the block grid like Wadi Rum, each
// on land no town had reached when they came (2026-11-20), so no house moved:
// Damascus's east of the city, on the Iraq side of the gap, reached by a road
// from the Damascus–Baghdad highway; Queen Alia's just past the east end of
// Jordan's village (moved up close the same day, the user: "why so far from
// Jordan?"), its kerb facing the town, with a road from the village's edge
// along a strip kept free of houses (ALIA_ROAD). Jordan's houses grow round it.
// Both moved 560 m west when the village was drawn in round Petra (2026-11-21), to stay at its edge.
const ALIA_ROAD = { x0: 549, z: 437, strip: [551, 590, 434, 446] }; // the strip reserved between the village and the airport
const AIRPORTS = [
  { code: '', name: 'مطار دمشق الدولي', en: 'DAMASCUS INTERNATIONAL AIRPORT', x: 640, z: -480, rot: 0, style: 'damascus', seed: 11,
    parked: ['syrianair', 'chamwings', 'qatar', 'syrianair', 'rj', 'emirates'], landing: 'syrianair', takeoff: 'chamwings', sign: ['#2f5d4a', '#f6e7b8'] },
  { code: 'JO', name: 'مطار الملكة علياء الدولي', en: 'QUEEN ALIA INTERNATIONAL AIRPORT', x: 950, z: 640, rot: Math.PI, style: 'alia', seed: 23,
    parked: ['rj', 'qatar', 'rj', 'turkish', 'saudia', 'emirates'], landing: 'rj', takeoff: 'emirates', sign: ['#1d2433', '#ffffff'] },
];
const airRect = (A) => [A.x - AIR_SIZE.w / 2, A.x + AIR_SIZE.w / 2, A.z - AIR_SIZE.d / 2, A.z + AIR_SIZE.d / 2];
// The countries far apart, each on its own land shaped like its map
// (models/maps.js, 2026-11-20, the user's idea). Every town moved whole from
// OLD_AT to TOWN_AT: its spiral's start (ox, oz), its band (TERRITORY) and what
// stands at fixed places in it (Jordan's Abdali, Wadi Rum, Queen Alia and its
// road), so every house kept its place inside its own country (the values
// above are where things were before; server.js moves them the same way).
for (const t of TOWNS) {
  const to = TOWN_AT[t.code];
  const dx = to[0] - t.ox, dz = to[1] - t.oz, X = dx * BW, Z = dz * BD, T = TERRITORY[t.code];
  t.ox = to[0]; t.oz = to[1];
  if (T) { T[0] += dx; T[1] += dx; T[2] += dz; T[3] += dz; } // (a town that came after the spread has no band: its land is its territory)
  if (t.code !== 'JO') continue;
  ABDALI.tiles[0] += dx; ABDALI.tiles[1] += dx; ABDALI.tiles[2] += dz; ABDALI.tiles[3] += dz; ABDALI.x += X; ABDALI.z += Z;
  RUM.x += X; RUM.z += Z;
  AIRPORTS[1].x += X; AIRPORTS[1].z += Z;
  ALIA_ROAD.x0 += X; ALIA_ROAD.z += Z;
  ALIA_ROAD.strip[0] += X; ALIA_ROAD.strip[1] += X; ALIA_ROAD.strip[2] += Z; ALIA_ROAD.strip[3] += Z;
}
const RESERVED = [[RUM.x - RUM.w / 2, RUM.x + RUM.w / 2, RUM.z - RUM.d / 2, RUM.z + RUM.d / 2], ...AIRPORTS.map(airRect), ALIA_ROAD.strip]; // Wadi Rum, the airports, Queen Alia's road: x0, x1, z0, z1 (must match server.js)
function inTerritory(town, bx, bz) {
  const t = TERRITORY[town.code];
  if (!t) return true;
  if (bx < t[0] || bx > t[1] || bz < t[2] || bz > t[3]) return false;
  const x0 = bx * BW - BW / 2, x1 = bx * BW + BW / 2, z0 = bz * BD - BD / 2, z1 = bz * BD + BD / 2;
  for (const r of RESERVED) if (x1 > r[0] - 8 && x0 < r[1] + 8 && z1 > r[2] - 8 && z0 < r[3] + 8) return false;
  return true;
}
const townOf = new Map();
for (const t of TOWNS) {
  Object.assign(t, {
    landmarkBlocks: new Map(), // block number -> landmark, from the server (lm.t names the town, '' or none for Syria)
    houseBlocks: [],           // k-th house block -> block number
    lastBlock: t.code ? 3 : 0, // a village's blocks 0..3 are its landmark
    frozen: Infinity,          // up to this block the old rule (see inTerritory), from the server
    spreadK: null,             // house blocks laid out before the countries spread apart (server db.spread); after them, the land rule
    count: 0,                  // plots taken (removed houses keep theirs)
    bounds: [t.ox, t.ox, t.oz, t.oz], // the blocks it reaches: min x, max x, min z, max z
  });
  const land = landPolygon(t.code, BW, BD), cx = (t.ox + 0.5) * BW, cz = (t.oz + 0.5) * BD;
  const R = Math.max(...land.map(([x, z]) => Math.max(Math.abs(x - cx) / BW, Math.abs(z - cz) / BD)));
  t.land = land;
  t.landEnd = (2 * Math.ceil(R) + 3) ** 2; // the spiral is past the whole land after this block
  townOf.set(t.code, t);
}
const SYRIA = townOf.get('');
const townFor = (code) => townOf.get(code || '') || SYRIA;

// Since 2026-11-21 (the user: every country's houses round its main landmark):
// a town's houses fill its own land nearest its landmark first, past its
// landmark blocks and the reserved places (compactOrder in models/maps.js, the
// same in server.js), the oldest nearest; a removed house leaves no gap.
function blockOfK(town, k) {
  if (!town.order) {
    const taken = new Set([...town.landmarkBlocks.keys()].map((b) => tileOf(town, b).join(',')));
    for (const lm of town.landmarkBlocks.values()) for (const key of lmTiles(lm)) taken.add(key);
    town.order = compactOrder(town.code, BW, BD, RESERVED, taken);
  }
  while (town.houseBlocks.length <= k) {
    const [bx, bz] = town.order(town.houseBlocks.length);
    town.houseBlocks.push(spiralIndex(bx - town.ox, bz - town.oz));
  }
  return town.houseBlocks[k];
}
// The blocks a landmark over several blocks covers ("bx,bz" on the shared grid): lm.tiles is
// [min col, max col, min row, max row] (server.js ensureNorias picks them past the town's houses).
function lmTiles(lm) {
  const out = [];
  if (lm.tiles) for (let bx = lm.tiles[0]; bx <= lm.tiles[1]; bx++) for (let bz = lm.tiles[2]; bz <= lm.tiles[3]; bz++) out.push(bx + ',' + bz);
  return out;
}
// The block of a town on the shared grid.
function tileOf(town, b) {
  const [bx, bz] = spiral(b);
  return [town.ox + bx, town.oz + bz];
}

// The j-th plot of a town.
function plotOf(town, j) {
  const b = blockOfK(town, Math.floor(j / PER_BLOCK));
  const s = j % PER_BLOCK;
  const [bx, bz] = tileOf(town, b);
  const col = s % COLS, back = s >= COLS;
  return {
    b, town, bx, bz,
    x: bx * BW + (col - (COLS - 1) / 2) * PLOT_W,
    z: bz * BD + (back ? ROW_Z : -ROW_Z),
    // Every house looks south (+z), which is where a visitor's first view of the
    // city comes from, so people arrive to courtyards and front doors, not back walls.
    rot: 0, // local +z is the front door
  };
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// ------------------------------------------------------------------ scene
const canvas = $('#city');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// asking the graphics chip whether each shader compiled stalls a phone for seconds: only with ?debug
renderer.debug.checkShaderErrors = new URLSearchParams(location.search).has('debug');

const SKY = new THREE.Color('#bfe6ff');
const scene = new THREE.Scene();
scene.background = SKY;
scene.fog = new THREE.Fog(SKY, 260, 950);

const camera = new THREE.PerspectiveCamera(45, 1, 1, 3200);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.46;
controls.minDistance = 14;
controls.maxDistance = 900;
controls.autoRotate = !reducedMotion;
controls.autoRotateSpeed = 0.35;
// Moving around works like a map: dragging slides the city under the finger,
// the wheel or a pinch zooms towards that spot, and turning the view is the
// right mouse button or a two-finger twist.
controls.screenSpacePanning = false;
controls.zoomToCursor = true;
controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE };
controls.addEventListener('start', takeOver);
// The visitor is steering now: stop the slow spin and any camera flight.
function takeOver() { controls.autoRotate = false; flight = null; }

const hemi = new THREE.HemisphereLight('#ffffff', '#c3d2ae', 1.55);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff3dd', 1.75);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -110, right: 110, top: 110, bottom: -110, near: 1, far: 420 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.05;
scene.add(sun, sun.target);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(8000, 8000),
  new THREE.MeshLambertMaterial({ color: '#97d480' }),
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
// Everything laid flat on the ground (the airports' grass and aprons, roads, lawns) sits a hair
// above it; the ground is drawn a little behind them and a little lower, so they never flicker
// through it (they did once it became a map of many colours, 2026-11-20).
ground.position.y = -0.08;
Object.assign(ground.material, { polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 4 });
scene.add(ground);
// The ground is a map: every country's land (models/maps.js) grass in the
// shape of its map, drying out into the desert between them, and each
// country's name high over its land, seen from far off.
const LAND_DAY = new THREE.Color('#bdbdbd'), LAND_NIGHT = new THREE.Color('#2c323c'); // under white the strong light washes the ground's shades out
const landNames = [];
let landPolys = []; // world [x, z] outlines, for the grass (scatterGround)
function mulberry(seed) { // a small seeded random: the same ground on every visit
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// A tile of soft random patches round mid-grey: a few random dots made big and smooth, tiling.
function softPatches() {
  const n = 16, N = 256, rnd = mulberry(9), small = document.createElement('canvas');
  small.width = small.height = n * 3;
  const s = small.getContext('2d'), vals = [];
  for (let i = 0; i < n * n; i++) vals.push(78 + rnd() * 100);
  for (let ty = 0; ty < 3; ty++) for (let tx = 0; tx < 3; tx++) for (let i = 0; i < n * n; i++) {
    const v = vals[i]; s.fillStyle = `rgb(${v},${v},${v})`; s.fillRect(tx * n + (i % n), ty * n + Math.floor(i / n), 1, 1);
  }
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.filter = 'blur(11px)';
  g.drawImage(small, -N, -N, N * 3, N * 3); // the middle copy of the 3 x 3, smoothed: it tiles
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
// A tile of soil grain round mid-grey (0.5 = leaves the colour as it is): grit, small stones and short blades.
function soilGrain() {
  const N = 256, c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d'), rnd = mulberry(3), img = g.createImageData(N, N);
  for (let i = 0; i < N * N; i++) { const v = 130 + (rnd() - 0.5) * 70; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
  g.putImageData(img, 0, 0);
  const wrap = (f) => { for (const dx of [-N, 0, N]) for (const dy of [-N, 0, N]) { g.save(); g.translate(dx, dy); f(); g.restore(); } }; // drawn across the edges, so it tiles
  for (let i = 0; i < 260; i++) { // pebbles
    const x = rnd() * N, y = rnd() * N, r = 0.8 + rnd() * 2.6, v = 70 + rnd() * 130;
    wrap(() => { g.fillStyle = `rgb(${v},${v},${v})`; g.beginPath(); g.ellipse(x, y, r, r * (0.6 + rnd() * 0.4), rnd() * 3, 0, 7); g.fill(); });
  }
  for (let i = 0; i < 900; i++) { // blades and twigs
    const x = rnd() * N, y = rnd() * N, a = rnd() * Math.PI, l = 2 + rnd() * 5, v = 60 + rnd() * 110;
    wrap(() => { g.strokeStyle = `rgba(${v},${v},${v},.8)`; g.lineWidth = 0.7; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); });
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}
// Real grass round the villages and along the highways: tufts and bushes, at random,
// on the land (not on the blocks or the roads); a few dry shrubs in the desert.
function scatterGround() {
  const rnd = mulberry(11), keep = [];
  const inPoly = (poly, x, z) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c; } return c; };
  const busy = (x, z) => areas.some((a) => x > a[0] - 4 && x < a[1] + 4 && z > a[2] - 4 && z < a[3] + 4);
  for (const { t, pts } of landPolys) { // a ring round each village, thick near it and thinning out
    const r = [(t.bounds[0] - 0.5) * BW, (t.bounds[1] + 0.5) * BW, (t.bounds[2] - 0.5) * BD, (t.bounds[3] + 0.5) * BD];
    const n = 5000 + Math.min(9000, (r[1] - r[0] + r[3] - r[2]) * 2.5);
    for (let i = 0; i < n * 3 && keep.length < 70000; i++) {
      const d = 8 + Math.pow(rnd(), 2.6) * 600, side = rnd() * 4 | 0, u = rnd();
      const x = side < 2 ? r[0] + (r[1] - r[0]) * u : (side === 2 ? r[0] - d : r[1] + d);
      const z = side >= 2 ? r[2] + (r[3] - r[2]) * u : (side === 0 ? r[2] - d : r[3] + d);
      if (!inPoly(pts, x, z) || busy(x, z)) continue;
      keep.push([x, z, rnd() < 0.86 ? 0 : 1]);
    }
  }
  for (const a of areas) { // along the highways: the long thin areas
    const w = a[1] - a[0], d = a[3] - a[2];
    if (Math.max(w, d) < 600 || Math.min(w, d) > 60) continue;
    const along = w > d, L = Math.max(w, d);
    for (let i = 0; i < L / 6; i++) {
      const u = rnd() * L, off = (rnd() < 0.5 ? -1 : 1) * (22 + Math.pow(rnd(), 1.6) * 160);
      const x = along ? a[0] + u : (a[0] + a[1]) / 2 + off, z = along ? (a[2] + a[3]) / 2 + off : a[2] + u;
      if (busy(x, z)) continue;
      const green = landPolys.some((l) => inPoly(l.pts, x, z));
      if (!green && rnd() < 0.6) continue;
      keep.push([x, z, green ? (rnd() < 0.8 ? 0 : 1) : 2]);
    }
  }
  const tuft = (() => { // a tuft: thin blades leaning out from one root
    const pos = [], r2 = mulberry(5);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + r2() * 0.6, lean = 0.25 + r2() * 0.45, h = 0.7 + r2() * 0.7, w = 0.07 + r2() * 0.05;
      const ox = Math.cos(a) * 0.12, oz = Math.sin(a) * 0.12, px = -Math.sin(a) * w, pz = Math.cos(a) * w;
      pos.push(ox - px, 0, oz - pz, ox + px, 0, oz + pz, ox + Math.cos(a) * lean, h, oz + Math.sin(a) * lean);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    return geo;
  })();
  const bush = new THREE.IcosahedronGeometry(1, 0); bush.scale(1, 0.7, 1); bush.translate(0, 0.5, 0);
  const shrub = new THREE.IcosahedronGeometry(0.8, 0); shrub.scale(1, 0.55, 1); shrub.translate(0, 0.35, 0);
  const kinds = [[tuft, ['#5f9a3e', '#78b04b', '#8fbf55', '#a3b85a', '#4f8a36']], [bush, ['#3f7a34', '#55903f', '#6a9a45']], [shrub, ['#9a8a5a', '#8a7d55', '#a89a68']]];
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3(), col = new THREE.Color();
  const mats = kinds.map(() => new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }));
  const cells = new Map(); // in squares of 2 km, so the grass far off the screen is not drawn
  for (const v of keep) { const key = `${Math.floor(v[0] / 2000)},${Math.floor(v[1] / 2000)},${v[2]}`; if (!cells.has(key)) cells.set(key, []); cells.get(key).push(v); }
  for (const list of cells.values()) {
    const kind = list[0][2], [geo, colors] = kinds[kind];
    const mesh = new THREE.InstancedMesh(geo, mats[kind], list.length);
    list.forEach(([x, z], i) => {
      const k = kind === 0 ? 0.6 + rnd() * 0.8 : 0.8 + rnd() * 1.4;
      m.compose(p.set(x, 0, z), q.setFromEuler(e.set((rnd() - 0.5) * 0.25, rnd() * 6.3, (rnd() - 0.5) * 0.25)), s.set(k * (0.8 + rnd() * 0.5), k, k * (0.8 + rnd() * 0.5)));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, col.set(colors[Math.floor(rnd() * colors.length)]).offsetHSL(0, 0, (rnd() - 0.5) * 0.08));
    });
    mesh.receiveShadow = true;
    mesh.raycast = () => {};
    mesh.computeBoundingSphere();
    scene.add(mesh);
  }
}
function paintLands() {
  const lands = TOWNS.map((t) => ({ t, pts: t.land }));
  landPolys = lands;
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const l of lands) for (const [x, z] of l.pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
  x0 -= 4000; x1 += 4000; z0 -= 4000; z1 += 4000;
  const W = x1 - x0, D = z1 - z0, k = 4096 / Math.max(W, D);
  const c = document.createElement('canvas');
  c.width = Math.ceil(W * k); c.height = Math.ceil(D * k);
  const g = c.getContext('2d');
  const rnd = mulberry(7);
  // soft round patches of a colour, scattered at random over the canvas (clipped to whatever path is set)
  const blobs = (n, colors, r0, r1, alpha, box = [0, 0, c.width, c.height]) => {
    for (let i = 0; i < n; i++) {
      const x = box[0] + rnd() * (box[2] - box[0]), y = box[1] + rnd() * (box[3] - box[1]), r = r0 + (r1 - r0) * rnd() * rnd();
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      const col = colors[Math.floor(rnd() * colors.length)];
      grd.addColorStop(0, col.replace('A', alpha)); grd.addColorStop(1, col.replace('A', 0));
      g.fillStyle = grd;
      g.save(); g.translate(x, y); g.scale(1, 0.55 + rnd() * 0.9); g.translate(-x, -y); // not all round
      g.fillRect(x - r, y - r, r * 2, r * 2);
      g.restore();
    }
  };
  // the desert: sand of many shades, with gravel and some reddish earth
  g.fillStyle = '#d9bf8a'; g.fillRect(0, 0, c.width, c.height);
  blobs(2600, ['rgba(234,214,166,A)', 'rgba(201,168,112,A)', 'rgba(214,170,118,A)', 'rgba(190,160,115,A)'], 20, 260, 0.45);
  blobs(1800, ['rgba(176,146,104,A)', 'rgba(240,224,186,A)'], 4, 30, 0.5);
  { // the map's own edge goes back to plain sand: past it the edge's colour is stretched to the horizon
    const m = 2500 * k;
    for (const [ax, ay, bx, by, rx, ry, rw, rh] of [[0, 0, 0, m, 0, 0, c.width, m], [0, c.height, 0, c.height - m, 0, c.height - m, c.width, m], [0, 0, m, 0, 0, 0, m, c.height], [c.width, 0, c.width - m, 0, c.width - m, 0, m, c.height]]) {
      const grd = g.createLinearGradient(ax, ay, bx, by);
      grd.addColorStop(0, 'rgba(217,191,138,1)'); grd.addColorStop(1, 'rgba(217,191,138,0)');
      g.fillStyle = grd; g.fillRect(rx, ry, rw, rh);
    }
  }
  const path = (pts) => { g.beginPath(); pts.forEach(([x, z], i) => g[i ? 'lineTo' : 'moveTo']((x - x0) * k, (z - z0) * k)); g.closePath(); };
  for (const l of lands) {
    path(l.pts); g.lineJoin = 'round';
    const lx = l.pts.map((p) => p[0]), lz = l.pts.map((p) => p[1]);
    const F = Math.min(1, Math.min(Math.max(...lx) - Math.min(...lx), Math.max(...lz) - Math.min(...lz)) / 6000); // a small country gets a narrower fade, so it keeps its shape
    for (let w = 1300; w > 30; w -= 40) { g.strokeStyle = 'rgba(160,132,88,.04)'; g.lineWidth = w * F * k; g.stroke(); } // bare earth where the land meets the desert, fading out
    g.save(); path(l.pts); g.clip();
    const px = l.pts.map((p) => (p[0] - x0) * k), py = l.pts.map((p) => (p[1] - z0) * k);
    const box = [Math.min(...px), Math.min(...py), Math.max(...px), Math.max(...py)], area = (box[2] - box[0]) * (box[3] - box[1]) / 1e4;
    g.fillStyle = '#78a952'; g.fillRect(0, 0, c.width, c.height);         // grass, of many greens, with patches of dry grass and bare earth
    blobs(Math.ceil(area * 1.6), ['rgba(88,134,58,A)', 'rgba(142,186,92,A)', 'rgba(176,180,96,A)', 'rgba(104,152,66,A)', 'rgba(66,112,48,A)'], 5, 80, 0.8, box);
    blobs(Math.ceil(area * 0.7), ['rgba(152,124,84,A)', 'rgba(182,156,104,A)', 'rgba(196,184,120,A)'], 2, 22, 0.75, box);
    blobs(Math.ceil(area * 7), ['rgba(60,104,44,A)', 'rgba(170,200,112,A)', 'rgba(140,120,80,A)'], 1, 5, 0.35, box);
    path(l.pts); // inside the edge the grass dries out: yellower, then earth, towards the desert
    for (let w = 1900; w > 30; w -= 40) { g.strokeStyle = w > 420 ? 'rgba(182,176,100,.045)' : 'rgba(172,146,94,.06)'; g.lineWidth = w * F * k; g.stroke(); }
    g.restore();
    // a ragged edge: patches of grass running out into the sand and of sand into the grass
    for (let i = 0; i < l.pts.length; i++) {
      const [ax, az] = l.pts[i], [bx, bz] = l.pts[(i + 1) % l.pts.length], len = Math.hypot(bx - ax, bz - az);
      for (let d = 0; d < len; d += 40) {
        const u = d / len, px2 = (ax + (bx - ax) * u - x0) * k, py2 = (az + (bz - az) * u - z0) * k, r = (60 + rnd() * 240) * F * k;
        const ox = (rnd() - 0.5) * 300 * F * k, oy = (rnd() - 0.5) * 300 * F * k, grass = rnd() < 0.5;
        const grd = g.createRadialGradient(px2 + ox, py2 + oy, 0, px2 + ox, py2 + oy, r);
        const col = grass ? '150,150,88' : '186,160,110';
        grd.addColorStop(0, `rgba(${col},.45)`); grd.addColorStop(1, `rgba(${col},0)`);
        g.fillStyle = grd; g.fillRect(px2 + ox - r, py2 + oy - r, r * 2, r * 2);
      }
    }
    path(l.pts); g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = Math.max(1, 5 * k); g.stroke(); // the border, a faint line
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  ground.geometry.dispose(); // the desert goes on to the horizon: the plane is bigger, the map's edge (sand) is stretched over the rest
  const BIG = 140000;
  ground.geometry = new THREE.PlaneGeometry(BIG, BIG);
  tex.repeat.set(BIG / W, BIG / D);
  tex.offset.set(-(BIG - W) / 2 / W, -(BIG - D) / 2 / D);
  ground.material.map = tex;
  ground.material.color.copy(LAND_DAY);
  // Close up, the soil itself: a fine grain (grit, pebbles, blades) over the map's colours, at two
  // sizes so it never looks tiled, fading out with distance.
  const grain = soilGrain(), patch = softPatches();
  ground.material.onBeforeCompile = (sh) => {
    sh.uniforms.grain = { value: grain };
    sh.uniforms.patchy = { value: patch };
    sh.vertexShader = 'varying vec2 vGroundXZ;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n  vGroundXZ = (modelMatrix * vec4(transformed, 1.0)).xz;');
    sh.fragmentShader = 'uniform sampler2D grain, patchy;\nvarying vec2 vGroundXZ;\n' + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
  float gNear = 1.0 - smoothstep(300.0, 2200.0, length(vViewPosition));
  float fine = texture2D(grain, vGroundXZ / 34.0).r * texture2D(grain, vGroundXZ.yx / 13.0 + 0.41).r * 4.0;
  float p1 = texture2D(patchy, vGroundXZ / 140.0).r, p2 = texture2D(patchy, vGroundXZ.yx / 620.0 + 0.3).r;
  float pNear = 1.0 - smoothstep(1800.0, 7000.0, length(vViewPosition)); // from high up the map's own patches are enough (no tiling)
  float pat = mix(1.0, p1 * p2 * 4.0, 0.75 * pNear);
  diffuseColor.rgb *= pat * mix(1.0, fine, gNear * 0.7);
  diffuseColor.g *= mix(1.0, 0.9 + 0.2 * p1, 0.6 * pNear); // greener and yellower patches`);
  };
  ground.material.needsUpdate = true;
  ground.position.set((x0 + x1) / 2, ground.position.y, (z0 + z1) / 2);
  camera.near = 2; camera.far = 120000; camera.updateProjectionMatrix();
  controls.maxDistance = 60000; // the first view shows every country, on a phone too
  for (const l of lands) { // the name, over the middle of the land
    const xs = l.pts.map((p) => p[0]), zs = l.pts.map((p) => p[1]);
    const s = textSprite(null, 768, 150, 1);
    pill(s.userData.ctx, 768, 150, l.t.name, '#ffffff', '#1d2433', 92, 'rtl');
    s.userData.tex.needsUpdate = true;
    s.scale.set(2000, 2000 * 150 / 768, 1); // the same size for every country
    s.position.set((Math.min(...xs) + Math.max(...xs)) / 2, 500, (Math.min(...zs) + Math.max(...zs)) / 2);
    s.material.fog = false;
    scene.add(s);
    landNames.push(s);
  }
  spinners.push(() => { // the names only from high up, and big enough to read however high
    const on = camera.position.y > 1500, w = THREE.MathUtils.clamp(camera.position.distanceTo(controls.target) * 0.11, 2000, 9000);
    for (const s of landNames) { s.visible = on; s.scale.set(w, w * 150 / 768, 1); }
  });
}

// ------------------------------------------------------------------ instancing
// Every house part is one InstancedMesh, so thousands of houses stay cheap.
class Pool {
  constructor(geo, mat, { colored = false, cast = true, receive = false } = {}) {
    Object.assign(this, { geo, mat, colored, cast, receive, count: 0, dirty: false, mesh: null });
    this.alloc(256);
  }
  alloc(cap) {
    const old = this.mesh;
    const m = new THREE.InstancedMesh(this.geo, this.mat, cap);
    m.frustumCulled = false;
    m.castShadow = this.cast;
    m.receiveShadow = this.receive;
    if (this.colored) m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3).fill(1), 3);
    if (old) {
      m.instanceMatrix.array.set(old.instanceMatrix.array);
      if (this.colored) m.instanceColor.array.set(old.instanceColor.array);
      scene.remove(old);
      old.dispose();
    }
    m.count = this.count;
    scene.add(m);
    this.mesh = m;
    this.cap = cap;
    this.dirty = true;
  }
  add(color) {
    if (this.count >= this.cap) this.alloc(this.cap * 2);
    const i = this.count++;
    this.mesh.count = this.count;
    if (color) { this.mesh.setColorAt(i, color); this.mesh.instanceColor.needsUpdate = true; }
    return i;
  }
  drop() { // forget the last instance
    this.count--;
    this.mesh.count = this.count;
    this.dirty = true;
  }
  flush() {
    if (this.dirty) { this.mesh.instanceMatrix.needsUpdate = true; this.dirty = false; }
  }
}

const lambert = (color, extra) => new THREE.MeshLambertMaterial({ color, ...extra });
const box = new THREE.BoxGeometry(1, 1, 1);
const pyramid = new THREE.ConeGeometry(1, 1, 4).rotateY(Math.PI / 4);
const cone = new THREE.ConeGeometry(1, 1, 7);
const cyl = new THREE.CylinderGeometry(1, 1, 1, 7);

const pools = {
  road: new Pool(box, lambert('#666c78'), { cast: false, receive: true }),
  walk: new Pool(box, lambert('#ddd8cc'), { cast: false, receive: true }),
  lawn: new Pool(box, lambert('#a9de90'), { cast: false, receive: true }),
};
const poolList = Object.values(pools);

const LEAVES = ['#4fa05a', '#5fb46a', '#3f8f5a', '#6cba5c'].map((c) => new THREE.Color(c));

const _base = new THREE.Matrix4(), _local = new THREE.Matrix4(), _out = new THREE.Matrix4();
const _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _e = new THREE.Euler();

function setBase(x, y, z, rot, kx, ky) {
  _q.setFromEuler(_e.set(0, rot, 0));
  _base.compose(_p.set(x, y, z), _q, _s.set(kx, ky, kx));
}
function part(pool, idx, px, py, pz, w, h, d) {
  _q.identity();
  _local.compose(_p.set(px, py, pz), _q, _s.set(w, h, d));
  _out.multiplyMatrices(_base, _local);
  pool.mesh.setMatrixAt(idx, _out);
  pool.dirty = true;
}

// ------------------------------------------------------------------ blocks
const blockAt = new Set();  // "bx,bz" of every block laid on the shared grid
const bigTiles = new Map(); // "bx,bz" -> town, for the four blocks under a village's landmark
for (let bx = BOSRA.tiles[0]; bx <= BOSRA.tiles[1]; bx++) for (let bz = BOSRA.tiles[2]; bz <= BOSRA.tiles[3]; bz++) bigTiles.set(bx + ',' + bz, SYRIA); // and the eight under Bosra
const ABDALI_GROUND = {}; // its own mark, so the street between it and Petra stays a street
for (let bx = ABDALI.tiles[0]; bx <= ABDALI.tiles[1]; bx++) for (let bz = ABDALI.tiles[2]; bz <= ABDALI.tiles[3]; bz++) bigTiles.set(bx + ',' + bz, ABDALI_GROUND); // and the four under Abdali
const SOUQ_GROUND = {}; // and the two under the souq (its own mark, so only the street between them is covered)
for (let bx = SOUQ.tiles[0]; bx <= SOUQ.tiles[1]; bx++) for (let bz = SOUQ.tiles[2]; bz <= SOUQ.tiles[3]; bz++) bigTiles.set(bx + ',' + bz, SOUQ_GROUND);
let boundsDirty = true;     // a town reached further: the highways and the view limits follow
function ensureBlock(town, b) {
  const [bx, bz] = tileOf(town, b);
  const key = bx + ',' + bz;
  if (blockAt.has(key)) return;
  blockAt.add(key);
  const bd = town.bounds;
  if (bx < bd[0] || bx > bd[1] || bz < bd[2] || bz > bd[3]) {
    bd[0] = Math.min(bd[0], bx); bd[1] = Math.max(bd[1], bx); bd[2] = Math.min(bd[2], bz); bd[3] = Math.max(bd[3], bz);
    boundsDirty = true;
  }
  setBase(bx * BW, 0, bz * BD, 0, 1, 1);
  part(pools.road, pools.road.add(), 0, 0.05, 0, BW, 0.1, BD);
  part(pools.walk, pools.walk.add(), 0, 0.15, 0, SLAB_W, 0.3, SLAB_D);
  const lm = town.landmarkBlocks.get(b);
  const lawn = b >= (town.code ? 4 : 1) && (!lm || lm.type === 'park');
  if (lawn) part(pools.lawn, pools.lawn.add(), 0, 0.17, 0, SLAB_W - 1.4, 0.34, SLAB_D - 1.4);
}

// ------------------------------------------------------------------ streets
// Where people live (and around the mosque and the landmarks) the roads are
// asphalt with painted lines, lit by street lamps at night. The asphalt of a
// block reaches to the middle of the next road on every side, so a street
// next to an empty block is still a whole street.
const pavedTiles = new Set(); // "bx,bz" of blocks with asphalt around them
const asphaltPool = new Pool(box, lambert('#43464e'), { cast: false, receive: true });
const paintPool = new Pool(box, lambert('#ecebe4'), { cast: false, receive: true });
const lampPostPool = new Pool(cyl, lambert('#3b3f47'));
const lampMat = new THREE.MeshBasicMaterial({ color: '#d9dde3' }); // the lanterns light up at night
const lampHeadPool = new Pool(box, lampMat, { cast: false });
function glowTexture(inner, outer = 'rgba(255,255,255,0)') {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const flat = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
const lampLightMat = new THREE.MeshBasicMaterial({
  map: glowTexture('rgba(255,214,140,1)'), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
});
const lampLightPool = new Pool(flat, lampLightMat, { cast: false });
poolList.push(asphaltPool, paintPool, lampPostPool, lampHeadPool, lampLightPool);

const CURB_X = SLAB_W / 2, CURB_Z = SLAB_D / 2;
function lamp(x, z) {
  part(lampPostPool, lampPostPool.add(), x, 1.8, z, 0.08, 3.4, 0.08);
  part(lampHeadPool, lampHeadPool.add(), x, 3.62, z, 0.42, 0.5, 0.42);
  part(lampLightPool, lampLightPool.add(), x, 0.33, z, 9, 1, 9);
}
function paveBlock(town, b) {
  const [bx, bz] = tileOf(town, b);
  const key = bx + ',' + bz;
  if (pavedTiles.has(key)) return;
  ensureBlock(town, b);
  pavedTiles.add(key);
  setBase(bx * BW, 0, bz * BD, 0, 1, 1);
  part(asphaltPool, asphaltPool.add(), 0, 0.06, 0, BW + ROAD, 0.12, BD + ROAD);
  if (bigTiles.has(key)) { carsDirty = true; return; } // under a village's landmark: no markings, no lamps poking through it
  const paint = (x, z, w, d) => part(paintPool, paintPool.add(), x, 0.127, z, w, 0.014, d);
  // dashed centre lines, stopping short of the crossings
  for (const sz of [-1, 1]) for (let x = -CURB_X + 4.4; x < CURB_X - 4.4 - 1.7; x += 3.6) paint(x + 0.9, sz * BD / 2, 1.8, 0.18);
  for (const sx of [-1, 1]) for (let z = -CURB_Z + 4.4; z < CURB_Z - 4.4 - 1.7; z += 3.6) paint(sx * BW / 2, z + 0.9, 0.18, 1.8);
  // solid edge lines along the kerb
  for (const sz of [-1, 1]) paint(0, sz * (CURB_Z + 0.22), SLAB_W, 0.12);
  for (const sx of [-1, 1]) paint(sx * (CURB_X + 0.22), 0, 0.12, SLAB_D);
  // zebra crossings at the four corners of the block
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      paint(sx * (CURB_X - 0.6 - i * 0.75), sz * (BD / 2), 0.4, ROAD - 1.2);
      paint(sx * (BW / 2), sz * (CURB_Z - 0.6 - i * 0.75), ROAD - 1.2, 0.4);
    }
  }
  // street lamps on both long sides and at the ends
  for (const sz of [-1, 1]) for (const x of [-CURB_X - 0.45, -4.9, 4.9, CURB_X + 0.45]) lamp(x, sz * (CURB_Z + 0.45));
  for (const sx of [-1, 1]) lamp(sx * (CURB_X + 0.45), 0);
  carsDirty = true;
}

// ------------------------------------------------------------------ cars
// Cars drive on the streets of the lived-in blocks, on the right, turning at
// the crossings. Each colour is one instanced mesh.
const CAR_COLORS = ['#d64545', '#f4f4f0', '#2f6fb5', '#f4c542', '#3c4048', '#5aa469', '#9aa3ad'];
const MAX_CARS = matchMedia('(pointer: coarse)').matches ? 18 : 34;
const LANE = 1.5, CAR_SPEED = 6.5, CAR_Y = 0.12, CAR_SCALE = 0.92, INSET = ROAD / 2 + 0.4;
const beamMat = new THREE.MeshBasicMaterial({
  map: glowTexture('rgba(255,236,190,0.9)'), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
});
const beamGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5);
const beamPool = new Pool(beamGeo, beamMat, { cast: false });
poolList.push(beamPool);
let carPools = null; // made once the house material exists (below)
const cars = [];
let carsDirty = false, lastCarNow = 0;
const cornerX = (i) => (i + 0.5) * BW, cornerZ = (j) => (j + 0.5) * BD;
// Is the street between two neighbouring crossings next to a lived-in block?
function streetLived(i1, j1, i2, j2) {
  const [a, b] = j1 === j2 ? [Math.max(i1, i2) + ',' + j1, Math.max(i1, i2) + ',' + (j1 + 1)] : [i1 + ',' + Math.max(j1, j2), (i1 + 1) + ',' + Math.max(j1, j2)];
  if (bigTiles.has(a) && bigTiles.get(a) === bigTiles.get(b)) return false; // the street under a village's landmark
  return pavedTiles.has(a) || pavedTiles.has(b);
}
function livedStreets() {
  const seen = new Set(), out = [];
  for (const key of pavedTiles) {
    const [bx, bz] = key.split(',').map(Number);
    for (const seg of [[bx - 1, bz - 1, bx, bz - 1], [bx - 1, bz, bx, bz], [bx - 1, bz - 1, bx - 1, bz], [bx, bz - 1, bx, bz]]) {
      const k = seg.join(',');
      if (!seen.has(k)) { seen.add(k); out.push(seg); }
    }
  }
  return out;
}
// A piece of a car's path is a quadratic curve; a straight road is one too.
function curve(p0, c, p1) {
  const len = (Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + Math.hypot(c[0] - p0[0], c[1] - p0[1]) + Math.hypot(p1[0] - c[0], p1[1] - c[1])) / 2;
  return { p0, c, p1, len: Math.max(0.5, len) };
}
function roadPiece(car, ai, aj, bi, bj) {
  const dx = Math.sign(bi - ai), dz = Math.sign(bj - aj), rx = -dz, rz = dx; // the right-hand side
  const ax = cornerX(ai), az = cornerZ(aj), bx = cornerX(bi), bz = cornerZ(bj);
  const p0 = [ax + dx * INSET + rx * LANE, az + dz * INSET + rz * LANE];
  const p1 = [bx - dx * INSET + rx * LANE, bz - dz * INSET + rz * LANE];
  car.piece = curve(p0, [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], p1);
  Object.assign(car, { from: [ai, aj], at: [bi, bj], dir: [dx, dz], onRoad: true });
}
function turnPiece(car) {
  const [i, j] = car.at, [dx, dz] = car.dir;
  const options = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([ox, oz]) => !(ox === -dx && oz === -dz) && streetLived(i, j, i + ox, j + oz));
  let next;
  if (!options.length) next = [-dx, -dz]; // a dead end: turn round
  else {
    const straight = options.find(([ox, oz]) => ox === dx && oz === dz);
    next = straight && Math.random() < 0.55 ? straight : options[Math.floor(Math.random() * options.length)];
  }
  const [nx, nz] = next, bx = cornerX(i), bz = cornerZ(j);
  const p0 = car.piece.p1, p1 = [bx + nx * INSET - nz * LANE, bz + nz * INSET + nx * LANE];
  let c;
  if (nx === dx && nz === dz) c = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
  else if (nx === -dx && nz === -dz) c = [bx + dx * INSET * 0.7, bz + dz * INSET * 0.7];
  else c = [bx - dz * LANE - nz * LANE, bz + dx * LANE + nx * LANE]; // where the two lanes cross
  car.piece = curve(p0, c, p1);
  car.next = [i + nx, j + nz];
  car.onRoad = false;
}
function spawnCars() {
  carsDirty = false;
  if (!carPools) return;
  const streets = livedStreets().filter((seg) => streetLived(...seg));
  const want = Math.min(MAX_CARS, Math.round(streets.length * 0.7));
  while (cars.length < want && streets.length) {
    const seg = streets[Math.floor(Math.random() * streets.length)];
    const pool = carPools[cars.length % carPools.length];
    const car = { pool, idx: pool.add(), beam: beamPool.add(), s: 0 };
    if (Math.random() < 0.5) roadPiece(car, seg[0], seg[1], seg[2], seg[3]);
    else roadPiece(car, seg[2], seg[3], seg[0], seg[1]);
    car.s = Math.random() * car.piece.len;
    cars.push(car);
  }
}
// ---- traffic: a city car slows to a halt at a red light, for the car or the person
// in front of it (yours, a walker, another city car), and honks when you block it.
function trafficBlockers() {
  const out = [];
  if (drive && drive.on) out.push({ x: drive.state.x, z: drive.state.z, car: true });
  if (walker.on) out.push({ x: walker.x, z: walker.z, car: false });
  return out;
}
function carBrake(car, now, blockers, dt) {
  let want = 1;
  if (car.px !== undefined) {
    // 1) a red or yellow light at the crossing ahead (only on a straight road, before the stop line)
    if (car.onRoad && traffic) {
      const rem = car.piece.len - car.s, axis = car.dir[0] ? 'x' : 'z';
      if (rem < 8 && rem > 1.4 && traffic.state(car.at[0], car.at[1], axis, Date.now()) !== 'g') want = 0;
    }
    // 2) someone in front: the player's car, a walker, another city car
    for (const b of blockers) {
      const dx = b.x - car.px, dz = b.z - car.pz, ahead = dx * car.hx + dz * car.hz, side = Math.abs(dx * car.hz - dz * car.hx);
      if (ahead > 0 && ahead < (b.car ? 11 : 8) && side < 2.4) {
        want = Math.min(want, ahead < 5 ? 0 : 0.4);
        if (b.car && ahead < 9 && car.v < 0.15) { car.held = (car.held || 0) + dt; if (car.held > 1.4 && drive) { drive.honkAt(car.px, car.pz); car.held = 0.4; } }
      }
    }
    if (want > 0) car.held = 0;
    for (const o of cars) {
      if (o === car || o.px === undefined) continue;
      const dx = o.px - car.px, dz = o.pz - car.pz, ahead = dx * car.hx + dz * car.hz, side = Math.abs(dx * car.hz - dz * car.hx);
      if (ahead > 0 && ahead < 7 && side < 2.2 && o.hx * car.hx + o.hz * car.hz > 0.5) want = Math.min(want, ahead < 4 ? 0 : 0.5);
    }
  }
  const v = car.v === undefined ? 1 : car.v;
  return v + (want - v) * Math.min(1, dt * (want < v ? 4.5 : 1.8));
}
function updateCars(now) {
  const dt = Math.min(0.1, Math.max(0, (now - lastCarNow) / 1000));
  lastCarNow = now;
  if (carsDirty) spawnCars();
  const blockers = trafficBlockers();
  for (const car of cars) {
    if (!reducedMotion) {
      car.v = carBrake(car, now, blockers, dt);
      car.s += dt * CAR_SPEED * car.v;
      while (car.s >= car.piece.len) {
        car.s -= car.piece.len;
        if (car.onRoad) turnPiece(car);
        else roadPiece(car, car.at[0], car.at[1], car.next[0], car.next[1]);
      }
    }
    const { p0, c, p1, len } = car.piece, t = car.s / len, u = 1 - t;
    const x = u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], z = u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1];
    const hx = u * (c[0] - p0[0]) + t * (p1[0] - c[0]), hz = u * (c[1] - p0[1]) + t * (p1[1] - c[1]);
    const dd = car.dead && now < car.dead; // سيارة قصفتها الطائرة: تختفي ٤٥ ثانية
    setBase(x, dd ? -50 : CAR_Y, z, Math.atan2(hx, hz), CAR_SCALE, CAR_SCALE);
    car.pool.mesh.setMatrixAt(car.idx, _base);
    car.pool.dirty = true;
    part(beamPool, car.beam, 0, dd ? -50 : 0.06, 1.25, 2.6, 1, 7.5);
    const hl = Math.hypot(hx, hz) || 1; car.px = x; car.pz = z; car.hx = hx / hl; car.hz = hz / hl; // where it is and where it looks (for the cars behind it)
  }
  updateHighwayCars(now);
}

// ------------------------------------------------------------------ plaza
function textSprite(draw, w, h, scaleX) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false }));
  sprite.scale.set(scaleX, scaleX * h / w, 1);
  sprite.userData = { canvas: c, ctx: c.getContext('2d'), tex, draw };
  return sprite;
}
function pill(ctx, w, h, text, bg, fg, maxFont, dir = 'inherit') { // dir 'rtl' for Arabic with marks at its ends (« » ؟), so they land on the right side
  ctx.direction = dir;
  ctx.clearRect(0, 0, w, h);
  let font = maxFont;
  do { ctx.font = `800 ${font}px Tajawal, system-ui, sans-serif`; font -= 2; }
  while (ctx.measureText(text).width > w - 56 && font > 14);
  const tw = Math.min(w - 8, ctx.measureText(text).width + 52);
  const x = (w - tw) / 2, r = (h - 12) / 2;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(x, 6, tw, h - 12, r);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 2);
}

const plazaSign = textSprite(null, 768, 160, 13);
// The city centre: the Umayyad Mosque, with the account name above its dome.
// It is one baked mesh, like the houses. (The CN Tower that stood here at the
// start is still a landmark the city can buy.)
const CENTER = umayyad;
// The mosque fills its block, so it can only grow upwards: drawn this much
// taller (and a touch wider, still inside the block), so it stands out over the city.
const MOSQUE = { w: 1.04, h: 2.0, d: 1.02 };
const plazaTop = CENTER.top * MOSQUE.h; // the opening view frames the centre building
function buildPlaza() {
  ensureBlock(SYRIA, 0);
  const g = new THREE.Group();
  g.position.y = 0.3;
  const building = new THREE.Mesh(bake(CENTER), houseMat);
  building.castShadow = true;
  building.receiveShadow = true;
  building.scale.set(MOSQUE.w, MOSQUE.h, MOSQUE.d);
  plazaSign.position.set(0, CENTER.signY * MOSQUE.h, -5);
  g.add(building, plazaSign);
  g.userData.entry = { lm: { type: 'center', name: CENTER.label }, height: plazaTop * 0.7, x: 0, z: 0 };
  const night = mosqueNight();
  night.scale.copy(building.scale);
  g.add(night);
  scene.add(g);
  landmarkGroups.push(g);
  paveBlock(SYRIA, 0);
}

// The mosque by night: green rings of light round the balconies of its three
// minarets (as in Damascus), lanterns along the front colonnade, warm
// floodlights on the facade, the dome and the courtyard, and a soft glow round it.
const ringMat = new THREE.MeshBasicMaterial({ color: '#3cf08a', transparent: true, opacity: 0 });
const haloMat = new THREE.SpriteMaterial({
  map: glowTexture('rgba(255,200,120,0.9)'), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
});
const floodlights = [];
function mosqueNight() {
  const n = new THREE.Group(), Y = 0.35;
  const ring = (x, y, z, r) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.09, 6, 28).rotateX(Math.PI / 2), ringMat);
    m.position.set(x, Y + y, z);
    n.add(m);
  };
  ring(0, 9.95, 6.9, 1.5); ring(0, 15.15, 6.9, 1.47); ring(0, 18.95, 6.9, 0.68);     // the Minaret of the Bride
  ring(11.9, 18.25, -6.2, 1.32); ring(11.9, 21.3, -6.2, 1.07);                       // the Minaret of Jesus
  ring(-11.9, 9.3, -6.2, 1.76); ring(-11.9, 13.96, -6.2, 1.62); ring(-11.9, 17.6, -6.2, 1.32); // Qaytbay
  const lantern = new THREE.OctahedronGeometry(0.2);
  for (let i = 0; i < 12; i++) {
    const x = -11 + i * 2;
    if (Math.abs(x) < 1.5) continue;
    const m = new THREE.Mesh(lantern, lampMat);
    m.position.set(x, Y + 2.75, 6.9);
    n.add(m);
  }
  for (const [x, y, z] of [[-8, 6, 13], [8, 6, 13], [0, 16, 1.5]]) {
    const light = new THREE.PointLight('#ffc978', 0, 34, 1);
    light.position.set(x, y, z);
    floodlights.push(light);
    n.add(light);
  }
  const halo = new THREE.Sprite(haloMat);
  halo.position.set(0, 8, -2);
  halo.scale.set(64, 38, 1);
  n.add(halo);
  return n;
}

// ------------------------------------------------------------------ flags square
// «ساحة الأعلام» (models/flags.js): every country of the city flies its flag,
// most houses first, and the screen ranks the top five. The fixed parts are one
// baked mesh; the flags, plaques and screen are redrawn as houses and flags change.
let flagSquare = null;
let flagSquareDirty = false, flagSquareAt = 0;
const flagSquareMats = []; // flag materials, lit a little at night
function textBoard(pxW, pxH, w, h, extra) {
  const c = document.createElement('canvas');
  c.width = pxW; c.height = pxH;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, ...extra }));
  m.userData = { canvas: c, ctx: c.getContext('2d'), tex };
  return m;
}
const flagWave = (() => { // the same gently bent flag for every pole, hanging from the pole on its left
  const geo = new THREE.PlaneGeometry(FLAG_W, FLAG_H, 12, 1);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) + FLAG_W / 2; p.setZ(i, Math.sin(x * 2.2) * 0.12 * (x / FLAG_W)); }
  geo.translate(FLAG_W / 2, 0, 0);
  geo.computeVertexNormals();
  return geo;
})();
function buildFlagSquare(g) {
  const base = new THREE.Mesh(bake(flagSquareModel), houseMat);
  base.castShadow = base.receiveShadow = true;
  g.add(base);
  const gate = textBoard(1024, 166, 4.8, 0.78);
  drawPlaque(gate.userData.ctx, 1024, 166, 'ساحة الأعلام', { bg: '#2f5d4a', fg: '#f6e7b8', size: 120 });
  gate.position.set(0, 3.88, 7.96);
  g.add(gate);
  const screen = textBoard(1600, 900, SCREEN.w, SCREEN.h, { transparent: false, toneMapped: false });
  screen.position.set(0, SCREEN.y, SCREEN.z);
  g.add(screen);
  const postGeo = bake(flagPostModel);
  setBase(g.position.x, 0.3, g.position.z, 0, 1, 1);
  const spots = FLAG_SPOTS.map(([x, z]) => {
    const group = new THREE.Group();
    group.visible = false;
    const pole = new THREE.Mesh(postGeo, houseMat);
    pole.position.set(x, 0.06, z);
    pole.castShadow = true;
    const mat = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, emissive: '#ffffff', emissiveIntensity: 0 });
    flagSquareMats.push(mat);
    const flag = new THREE.Mesh(flagWave, mat);
    flag.position.set(x + 0.06, POLE_TOP - FLAG_H * 0.62, z);
    flag.castShadow = true;
    const plaque = textBoard(512, 146, 1.25, 0.36);
    plaque.position.set(x, 0.37, z + 0.32);
    group.add(pole, flag, plaque);
    g.add(group);
    const glow = lampLightPool.add();
    hidePart(lampLightPool, glow);
    return { x, z, group, mat, plaque, glow, code: null, text: '' };
  });
  // light on the paving (it sits just above it): from the screen and round the fountain
  part(lampLightPool, lampLightPool.add(), 0, 0.12, SCREEN.z + 1.6, 12, 1, 5);
  part(lampLightPool, lampLightPool.add(), 0, 0.12, 1.0, 9, 1, 9);
  flagSquare = { x: g.position.x, z: g.position.z, spots, screen, list: [], podium: buildPodium(g) };
  flagSquareDirty = true;
  return flagSquareModel.top;
}
// «منصة الأبطال» (models/flags.js PODIUM): a flag over each step, a plate on its
// front, and the sign behind; updatePodium fills them from the weekly race.
function buildPodium(g) {
  const P = PODIUM;
  const steps = P.steps.map((s) => {
    const k = s.place === 1 ? 0.6 : 0, top = P.base + s.h + P.pole + k;
    const mat = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, emissive: '#ffffff', emissiveIntensity: 0 });
    flagSquareMats.push(mat);
    const flag = new THREE.Mesh(flagWave, mat);
    flag.scale.setScalar(P.flag);
    flag.position.set(s.x + 0.07, top - FLAG_H * P.flag * 0.6, P.z - P.d / 2 + 0.35);
    flag.castShadow = true;
    flag.visible = false;
    const ph = s.h - 0.3, plate = textBoard(512, Math.round((512 * ph) / (P.w - 0.3)), P.w - 0.3, ph);
    plate.position.set(s.x, P.base + 0.1 + ph / 2, P.z + P.d / 2 + 0.02);
    g.add(flag, plate);
    return { ...s, flag, mat, plate, code: undefined, text: '' };
  });
  const S = P.sign, sign = textBoard(1600, Math.round((1600 * S.h) / S.w), S.w, S.h, { transparent: false, toneMapped: false });
  sign.position.set(0, S.y, S.z);
  g.add(sign);
  part(lampLightPool, lampLightPool.add(), 0, 0.12, P.z + 0.5, 11, 1, 6); // light on the podium at night
  return { steps, sign, text: '', at: 0 };
}
// The first three: last week's champions once a week has ended, else this week's
// race as it stands. A page left open past the week's end asks for the new week.
let podiumAsked = 0;
const STEP_PLATE = { 1: ['#f6d26b', '#d9a92a'], 2: ['#eef1f5', '#bfc6d1'], 3: ['#e3a46c', '#b8743e'] };
function updatePodium(now = Date.now()) {
  const P = flagSquare && flagSquare.podium;
  if (!P) return;
  P.at = now;
  if (race && now >= race.end && now - podiumAsked > 120000) {
    podiumAsked = now;
    getConfig().then((c) => { if (c && c.race) { race = c.race; flagSquareDirty = true; } }).catch(() => {});
  }
  const champs = race && race.podium && race.podium.length ? race.podium : null;
  const counts = race ? raceCounts() : {};
  const top = champs || Object.entries(counts).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const nameOf = (code) => (TOWNS.find((x) => x.code === code) || { name: countryNames[code] || code }).name;
  for (const s of P.steps) {
    const e = top[s.place - 1], code = e ? e[0] : null;
    if (s.code !== code) {
      s.code = code;
      s.flag.visible = code !== null;
      if (code !== null) { const map = flagFor(code || 'SY').pool.mat.map; s.mat.map = map; s.mat.emissiveMap = map; s.mat.needsUpdate = true; }
    }
    const text = e ? `${nameOf(code)}|${e[1].toLocaleString('en-US')} 🏠` : '|';
    if (s.text === text) continue;
    s.text = text;
    const { ctx, canvas: c, tex } = s.plate.userData, [name, n] = text.split('|'), [a, b] = STEP_PLATE[s.place];
    ctx.clearRect(0, 0, c.width, c.height);
    const bg = ctx.createLinearGradient(0, 0, 0, c.height); bg.addColorStop(0, a); bg.addColorStop(1, b);
    ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(0, 0, c.width, c.height, 22); ctx.fill();
    ctx.fillStyle = '#1d2433'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
    const tall = c.height > 260, big = tall ? 170 : 96;
    ctx.font = `800 ${big}px Tajawal, system-ui, sans-serif`;
    if (tall) {
      ctx.fillText(String(s.place), c.width / 2, c.height * 0.27);
      ctx.font = `800 84px Tajawal, system-ui, sans-serif`; ctx.fillText(name || '—', c.width / 2, c.height * 0.6);
      ctx.font = `700 60px Tajawal, system-ui, sans-serif`; ctx.direction = 'ltr'; ctx.fillText(n || '', c.width / 2, c.height * 0.84);
    } else {
      let f = 78; const line = name ? `${s.place} · ${name} · ${n}` : String(s.place);
      do { ctx.font = `800 ${f}px Tajawal, system-ui, sans-serif`; f -= 2; } while (ctx.measureText(line).width > c.width - 30 && f > 30);
      ctx.fillText(line, c.width / 2, c.height / 2 + 3);
    }
    tex.needsUpdate = true;
  }
  // the sign: the title, then the time left, or the week the champions won
  let sub;
  if (champs) sub = `أبطال الأسبوع ${race.week - 1}`;
  else if (race) {
    const ms = Math.max(0, race.end - now), d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5);
    const days = d === 0 ? '' : d === 1 ? 'يوم' : d === 2 ? 'يومين' : d <= 10 ? `${d} أيام` : `${d} يوم`;
    const hours = h === 0 ? '' : h === 1 ? 'ساعة' : h === 2 ? 'ساعتين' : h <= 10 ? `${h} ساعات` : `${h} ساعة`;
    sub = `الترتيب الحين · ⏳ باقي ${[days, hours].filter(Boolean).join(' و') || 'دقايق'}`;
  } else sub = 'سباق الأسبوع';
  const text = `🏆 منصة الأبطال|${sub}`;
  if (P.text === text) return;
  P.text = text;
  const { ctx, canvas: c, tex } = P.sign.userData;
  const bg = ctx.createLinearGradient(0, 0, c.width, 0); bg.addColorStop(0, '#16224a'); bg.addColorStop(1, '#0b1230');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
  ctx.textBaseline = 'middle'; ctx.direction = 'rtl'; ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd56a'; ctx.font = '800 64px Tajawal, system-ui, sans-serif';
  ctx.fillText('🏆 منصة الأبطال', c.width * 0.73, c.height / 2 + 3);
  ctx.fillStyle = '#ffffff'; ctx.font = '700 50px Tajawal, system-ui, sans-serif';
  ctx.fillText(sub, c.width * 0.3, c.height / 2 + 3);
  tex.needsUpdate = true;
}
// The countries of the city, most houses first.
const NOT_IN_SQUARE = new Set(['IL']); // flags the square never flies (the user's decision, 2026-11-19)
function countryRanking() {
  const n = new Map();
  for (const rec of houses) if (rec && rec.country && !NOT_IN_SQUARE.has(rec.country)) n.set(rec.country, (n.get(rec.country) || 0) + 1);
  return [...n].map(([code, k]) => ({ code, name: countryNames[code] || code, n: k }))
    .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, 'ar'));
}
function updateFlagSquare() {
  flagSquareDirty = false;
  if (!flagSquare) return;
  const list = countryRanking();
  flagSquare.list = list;
  setBase(flagSquare.x, 0.3, flagSquare.z, 0, 1, 1);
  flagSquare.spots.forEach((spot, i) => {
    const c = list[i];
    spot.group.visible = !!c;
    if (!c) { hidePart(lampLightPool, spot.glow); spot.code = null; return; }
    part(lampLightPool, spot.glow, spot.x, 0.12, spot.z, 4.4, 1, 4.4);
    if (spot.code !== c.code) {
      const map = flagFor(c.code).pool.mat.map;
      spot.mat.map = map; spot.mat.emissiveMap = map; spot.mat.needsUpdate = true;
      spot.code = c.code;
    }
    const text = `${c.name} · ${c.n.toLocaleString('en-US')} 🏠`;
    if (spot.text !== text) {
      drawPlaque(spot.plaque.userData.ctx, 512, 146, text);
      spot.plaque.userData.tex.needsUpdate = true;
      spot.text = text;
    }
  });
  updatePodium();
  const { ctx, canvas, tex } = flagSquare.screen.userData;
  drawBoard(ctx, canvas.width, canvas.height, list, (code) => (flags.get(code) && flags.get(code).loaded ? flagFor(code).pool.mat.map.image : null));
  tex.needsUpdate = true;
}
function setAccount(handle) {
  const { ctx, canvas: c, tex } = plazaSign.userData;
  pill(ctx, c.width, c.height, '@' + handle, '#ffffff', '#d62976', 84);
  tex.needsUpdate = true;
}

// ------------------------------------------------------------------ landmarks
// Low-poly monuments, added from the control panel. To add a new kind:
// write a builder here (returns its height) and name it in server.js.
const landmarkGroups = [];
let LM_OFF = false; // من لوحة الأدمن (cfg.lmOff): كل المعالم مخفية، والبيوت تبقى بأماكنها
const spinners = [];
const UP = new THREE.Vector3(0, 1, 0);
const cyl16 = new THREE.CylinderGeometry(1, 1, 1, 16);
const taper = (top, bottom, h, seg) => new THREE.CylinderGeometry(top, bottom, h, seg);
const square = (top, bottom, h) => taper(top * Math.SQRT2, bottom * Math.SQRT2, h, 4).rotateY(Math.PI / 4);

function solid(g, geo, color, x, y, z, w = 1, h = 1, d = 1) {
  const m = new THREE.Mesh(geo, lambert(color, { flatShading: true }));
  m.position.set(x, y, z);
  m.scale.set(w, h, d);
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  return m;
}
function beam(g, color, ax, ay, az, bx, by, bz, th) {
  const a = new THREE.Vector3(ax, ay, az), b = new THREE.Vector3(bx, by, bz);
  const m = solid(g, box, color, 0, 0, 0, th, a.distanceTo(b), th);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, b.sub(a).normalize());
  return m;
}

const BUILDERS = {
  cn_tower(g) {
    const C = '#cbc7bf', W = '#e3e6ea';
    solid(g, taper(1.5, 3.8, 36, 6), C, 0, 18, 0);
    solid(g, taper(4.3, 2.6, 2.2, 16), W, 0, 37.1, 0);
    solid(g, cyl16, '#2f3b4a', 0, 38.9, 0, 4.4, 1.4, 4.4);
    solid(g, taper(3.0, 4.3, 1.8, 16), W, 0, 40.5, 0);
    solid(g, taper(0.9, 1.4, 10, 6), C, 0, 46.4, 0);
    solid(g, cyl16, W, 0, 51.9, 0, 1.5, 1.0, 1.5);
    solid(g, taper(0.08, 0.55, 13, 6), '#f0f0f0', 0, 58.9, 0);
    return 65.4;
  },
  eiffel(g) {
    const C = '#7d5f47', L = 7.2;
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      beam(g, C, sx * L, 0, sz * L, sx * 4, 13, sz * 4, 1.7);
      beam(g, C, sx * 3.8, 14, sz * 3.8, sx * 2, 26, sz * 2, 1.2);
    }
    for (const s of [1, -1]) {
      solid(g, box, C, 0, 6.5, s * 5.6, 11.2, 0.6, 0.6);
      solid(g, box, C, s * 5.6, 6.5, 0, 0.6, 0.6, 11.2);
      solid(g, box, C, 0, 20, s * 2.9, 5.8, 0.45, 0.45);
      solid(g, box, C, s * 2.9, 20, 0, 0.45, 0.45, 5.8);
    }
    solid(g, box, C, 0, 13.5, 0, 10, 1, 10);
    solid(g, box, C, 0, 26.4, 0, 5.4, 0.8, 5.4);
    solid(g, square(0.45, 2.0, 24), C, 0, 38.8, 0);
    solid(g, box, C, 0, 51.1, 0, 1.7, 0.6, 1.7);
    solid(g, taper(0.05, 0.3, 6, 4), C, 0, 54.4, 0);
    return 57.4;
  },
  burj(g) {
    let y = 0;
    [5, 4.3, 3.6, 2.9, 2.2, 1.5, 0.9].forEach((r, i) => {
      solid(g, taper(r * 0.86, r, 8.5, 6), i % 2 ? '#b3c3d4' : '#c6d3e0', 0, y + 4.25, 0).rotation.y = i * 0.5;
      y += 8.5;
    });
    solid(g, taper(0.05, 0.6, 12, 6), '#e6edf4', 0, y + 6, 0);
    return y + 12;
  },
  clock(g) {
    solid(g, box, '#d2b48c', 0, 11, 0, 5, 22, 5);
    solid(g, box, '#bf9b68', 0, 24.6, 0, 5.8, 5.2, 5.8);
    for (const s of [1, -1]) {
      solid(g, cyl16, '#fbfaf2', 0, 24.6, s * 2.95, 1.9, 0.12, 1.9).rotation.x = Math.PI / 2;
      solid(g, cyl16, '#fbfaf2', s * 2.95, 24.6, 0, 1.9, 0.12, 1.9).rotation.z = Math.PI / 2;
      solid(g, box, '#2b2b2b', 0, 25.2, s * 3.03, 0.16, 1.3, 0.05);
      solid(g, box, '#2b2b2b', 0.45, 24.6, s * 3.03, 0.9, 0.16, 0.05);
    }
    solid(g, pyramid, '#46565c', 0, 30.4, 0, 4.4, 6.4, 4.4);
    solid(g, taper(0.05, 0.25, 3, 4), '#d9b44a', 0, 35.1, 0);
    return 36.6;
  },
  pyramid(g) {
    solid(g, pyramid, '#e4c98d', -3.5, 6.5, 0, 11.5, 13, 11.5);
    solid(g, pyramid, '#d9bb7c', 9.5, 3, 2.5, 5.5, 6, 5.5);
    return 13;
  },
  ferris(g) {
    const R = 7.4, cy = 9.6, wheel = new THREE.Group();
    wheel.position.y = cy;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.22, 6, 32), lambert('#e84a6f', { flatShading: true }));
    rim.castShadow = true;
    wheel.add(rim);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      solid(wheel, box, '#f2f2f2', Math.cos(a) * R / 2, Math.sin(a) * R / 2, 0, 0.14, R, 0.14).rotation.z = a - Math.PI / 2;
      solid(wheel, box, ['#ffd23f', '#4f9dde', '#58c27d', '#f77737'][i % 4], Math.cos(a) * R, Math.sin(a) * R, 0, 1.3, 1.3, 1.3);
    }
    g.add(wheel);
    for (const s of [1, -1]) {
      beam(g, '#8d99ae', -4, 0, s * 1.5, 0, cy, s * 0.9, 0.45);
      beam(g, '#8d99ae', 4, 0, s * 1.5, 0, cy, s * 0.9, 0.45);
    }
    solid(g, cyl16, '#8d99ae', 0, cy, 0, 0.5, 2.3, 0.5).rotation.x = Math.PI / 2;
    if (!reducedMotion) spinners.push((now) => { wheel.rotation.z = now / 9000; });
    return cy + R + 1;
  },
  cinema(g) {
    solid(g, box, '#3a3f58', 0, 4.5, -1.5, 18, 9, 8);
    solid(g, box, '#ffd23f', 0, 9.3, -1.5, 18.6, 0.6, 8.6);
    const c = document.createElement('canvas');
    c.width = 768; c.height = 384;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 768, 384);
    ['#feda75', '#fa7e1e', '#d62976', '#962fbf', '#4f5bd5'].forEach((col, i) => grad.addColorStop(i / 4, col));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 768, 384);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 112px Tajawal, system-ui, sans-serif';
    ctx.fillText('🎬 ريلز', 384, 150);
    ctx.font = '700 52px Tajawal, system-ui, sans-serif';
    ctx.fillText('اضغط للمشاهدة', 384, 282);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), new THREE.MeshBasicMaterial({ map: tex }));
    screen.position.set(0, 4.7, 2.56);
    g.add(screen);
    return 9.6;
  },
  flags(g) { return buildFlagSquare(g); },
  souq(g) { // «سوق الحميدية» (models/souq.js), the gift of the 500th house, on two blocks (see SOUQ)
    const turn = new THREE.Group(); // the model's street runs along z; in the city, west (gate) to east (columns)
    turn.rotation.y = SOUQ.rot;
    g.add(turn);
    const base = new THREE.Mesh(bake(souqModel), houseMat);
    base.castShadow = base.receiveShadow = true;
    turn.add(base);
    const sign = textBoard(1024, Math.round(1024 * SOUQ_SIGN.h / SOUQ_SIGN.w), SOUQ_SIGN.w, SOUQ_SIGN.h);
    drawPlaque(sign.userData.ctx, sign.userData.canvas.width, sign.userData.canvas.height, 'سوق الحميدية', { bg: '#2f5d4a', fg: '#f6e7b8', size: 112 });
    sign.userData.tex.needsUpdate = true;
    sign.position.set(0, SOUQ_SIGN.y, SOUQ_SIGN.z + 0.01);
    turn.add(sign);
    if (titles.souq) { // «قرعة حارتنا»: the merchant's board on the roof, facing the road
      const B = SOUQ_MERCHANT, holder = new THREE.Group();
      holder.position.set(B.x, B.y, B.z);
      holder.rotation.y = B.rot;
      const board = textBoard(1280, Math.round(1280 * B.h / B.w), B.w, B.h);
      drawPlaque(board.userData.ctx, board.userData.canvas.width, board.userData.canvas.height, `🛍️ دكانة ${handle(titles.souq)}`, { bg: '#7b2d26', fg: '#f6e7b8', size: 150 });
      board.userData.tex.needsUpdate = true;
      board.position.z = 0.04;
      const back = board.clone();
      back.rotation.y = Math.PI;
      back.position.z = -0.04;
      holder.add(board, back);
      solid(holder, box, '#5a3620', 0, 0, 0, B.w + 0.2, B.h + 0.2, 0.06); // the frame
      for (const dx of [-B.w / 2 + 0.4, B.w / 2 - 0.4]) solid(holder, box, '#3e4750', dx, -B.h / 2 - 0.5, 0, 0.12, 1.0, 0.12);
      turn.add(holder);
    }
    // at night: warm light along the street under the vault, in front of the gate and at the columns
    setBase(g.position.x, 0.3, g.position.z, SOUQ.rot, 1, 1);
    const { z0, z1, w } = SOUQ_STREET, n = 4, len = (z1 - z0) / n;
    for (let i = 0; i < n; i++) part(lampLightPool, lampLightPool.add(), 0, 0.26, z0 + (i + 0.5) * len, w * 1.05, 1, len * 1.4);
    part(lampLightPool, lampLightPool.add(), 0, 0.24, z1 + 3.6, 13, 1, 5);
    part(lampLightPool, lampLightPool.add(), 0, 0.24, z0 - 2.4, 13, 1, 4);
    return souqModel.top;
  },
  theatre(g) { // «المدرج الروماني» in Jordan's village (models/jordan.js): a concert on, flags waving, beams in the sky at night
    const base = new THREE.Mesh(bake(theatreModel), houseMat); // baking it also tells where the audience's flags fly
    base.castShadow = base.receiveShadow = true;
    g.add(base);
    const fx = theatreModel.lights();
    fx.group.traverse((m) => { if (m.isMesh) m.raycast = () => {}; }); // a tap on the sky by a beam is not a tap on the theatre
    g.add(fx.group);
    townFx.push(...fx.mats);
    const flags = theatreModel.flags();
    flags.mesh.castShadow = true;
    g.add(flags.mesh);
    if (reducedMotion) flags.update(1.3);
    else spinners.push((now) => flags.update(now / 1000));
    const lit = theatreModel.floodlight, light = new THREE.PointLight(lit.color, 0, 60, 1);
    light.position.set(...lit.at);
    floodlights.push(light);
    g.add(light);
    return theatreModel.top;
  },
  nativity(g) { // «كنيسة المهد» in Palestine's village (models/palestine.js): Manger Square with its Christmas tree, lit and twinkling at night
    const base = new THREE.Mesh(bake(nativityModel), houseMat);
    base.castShadow = base.receiveShadow = true;
    g.add(base);
    const fx = nativityModel.lights();
    g.add(fx.group);
    townFx.push(...fx.mats);
    if (reducedMotion) fx.update(1.3);
    else spinners.push((now) => fx.update(now / 1000));
    const lit = nativityModel.floodlight, light = new THREE.PointLight(lit.color, 0, 60, 1);
    light.position.set(...lit.at);
    floodlights.push(light);
    g.add(light);
    return nativityModel.top;
  },
  police(g, lm) { // «مركز الشرطة» (models/police.js), one in every town: its country's flag in front, patrol lights flashing at night
    const base = new THREE.Mesh(bake(policeStation), houseMat); // baking it also tells where the cars' lights are
    base.castShadow = base.receiveShadow = true;
    g.add(base);
    const fx = policeStation.lights();
    g.add(fx.group);
    townFx.push(...fx.mats);
    if (reducedMotion) fx.update(0.05);
    else spinners.push((now) => fx.update(now / 1000));
    const S = policeStation.sign, sign = textBoard(1024, Math.round(1024 * S.h / S.w), S.w, S.h);
    drawPlaque(sign.userData.ctx, sign.userData.canvas.width, sign.userData.canvas.height, 'مركز الشرطة', { bg: '#1f4e9c', fg: '#ffffff', size: 150 });
    sign.userData.tex.needsUpdate = true;
    sign.position.set(S.x, S.y, S.z);
    g.add(sign);
    const F = policeStation.flag, cloth = bigFlagCloth(lm.t || 'SY');
    cloth.position.set(F.x, F.y, F.z);
    cloth.scale.setScalar(F.scale);
    g.add(cloth);
    const lit = policeStation.floodlight, light = new THREE.PointLight(lit.color, 0, 50, 1);
    light.position.set(...lit.at);
    floodlights.push(light);
    g.add(light);
    const chief = titles.police && titles.police[lm.t || '']; // «قرعة حارتنا»: this week's police chief of the town, over the station's name
    if (chief) {
      const tag = titlePill(`👮 رئيس الشرطة ${handle(chief)}`, '#1f4e9c', 15);
      tag.position.set(0, policeStation.top + 6.6, 0);
      g.add(tag);
    }
    return policeStation.top;
  },
  station(g) { // «محطة الحجاز» (models/railway.js): the trains leave from its platforms over the streets
    const base = new THREE.Mesh(bake(hejazStation), houseMat);
    base.position.y = -0.3; // its platforms meet the viaduct, which stands on the ground
    base.castShadow = base.receiveShadow = true;
    g.add(base);
    const lit = hejazStation.floodlight, light = new THREE.PointLight(lit.color, 0, 60, 1);
    light.position.set(...lit.at);
    floodlights.push(light);
    g.add(light);
    return hejazStation.top;
  },
  park(g, lm) {
    solid(g, cyl16, '#d8d2c4', 0, 0.4, 0, 3.2, 0.7, 3.2);
    solid(g, cyl16, '#6ec6f0', 0, 0.55, 0, 2.7, 0.5, 2.7);
    solid(g, cyl16, '#d8d2c4', 0, 1.1, 0, 0.5, 1.7, 0.5);
    let h = hash('park' + lm.id);
    for (let i = 0; i < 18; i++) {
      h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
      const x = ((h % 1000) / 1000 - 0.5) * 25;
      const z = (((h >>> 10) % 1000) / 1000 - 0.5) * 13.5;
      const s = 0.9 + ((h >>> 20) % 6) * 0.12;
      if (Math.hypot(x, z) < 4.6) continue;
      solid(g, cyl, '#8a5a3a', x, 0.6 * s, z, 0.18 * s, 1.2 * s, 0.18 * s);
      solid(g, cone, LEAVES[i % LEAVES.length], x, 2.3 * s, z, 1.1 * s, 2.8 * s, 1.1 * s);
    }
    return 5;
  },
};

function buildLandmark(lm) {
  if (LM_OFF) { if (!lm.tiles) { const tw = townFor(lm.t); ensureBlock(tw, lm.block); paveBlock(tw, lm.block); } return; }
  if (lm.type === 'norias' && lm.tiles) { buildNorias(lm); return; } // its own blocks, its own ground
  if (lm.type === 'stadium' && lm.tiles) { buildStadium(lm); return; }
  if (lm.type === 'jeita' && lm.tiles) { buildJeita(lm); return; }
  const town = townFor(lm.t);
  ensureBlock(town, lm.block);
  const [bx, bz] = tileOf(town, lm.block);
  paveBlock(town, lm.block);
  if (town === SYRIA && inBosra(bx, bz)) return; // the old park keeps its block, under Bosra
  const g = new THREE.Group();
  g.position.set(bx * BW, 0.3, bz * BD);
  if (lm.type === 'souq' && town === SYRIA) { // over its two blocks (see SOUQ)
    for (let b = 1; b < 200; b++) { const [x, z] = tileOf(SYRIA, b); if (inSouq(x, z)) paveBlock(SYRIA, b); }
    g.position.set(SOUQ.x, 0.3, SOUQ.z);
  }
  const height = (BUILDERS[lm.type] || BUILDERS.park)(g, lm);
  const label = textSprite(null, 512, 112, Math.max(9, Math.min(16, height * 0.3)));
  pill(label.userData.ctx, 512, 112, lm.name, '#ffffff', '#1d2433', 58);
  label.userData.tex.needsUpdate = true;
  label.position.y = height + 3.5;
  g.add(label);
  g.userData.entry = { lm, height, x: g.position.x, z: g.position.z };
  scene.add(g);
  landmarkGroups.push(g);
}

// ------------------------------------------------------------------ villages
// Each neighbouring country's landmark (models/<country>.js) stands on the
// first four blocks of its village, with the country's big flag above it.
const bigWave = (() => { // a big flag, gently bent, flying to the right of its pole
  const geo = new THREE.PlaneGeometry(BIG_FLAG.w, BIG_FLAG.h, 24, 1), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) + BIG_FLAG.w / 2; p.setZ(i, Math.sin(x * 0.85) * 0.45 * (x / BIG_FLAG.w)); }
  geo.translate(BIG_FLAG.w / 2, 0, 0);
  geo.computeVertexNormals();
  return geo;
})();
function bigFlagCloth(code) {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 480;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#dfe3ea';
  ctx.fillRect(0, 0, c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  fetch(FLAG_CDN + code.toLowerCase() + '.svg')
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error('no flag'))))
    .then((svg) => {
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0, c.width, c.height); tex.needsUpdate = true; };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace('<svg ', '<svg width="640" height="480" '));
    })
    .catch(() => {});
  return new THREE.Mesh(bigWave, new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
}

const townFx = []; // [material, strength] of the landmarks' night lights
// The royal portraits over Petra (models/jordan.js ROYAL): the gold frames are
// baked; the pictures (public/img), the names and «المملكة الأردنية الهاشمية» are drawn here.
let NAMES = {}; // the names under the portraits, set from the admin panel (cfg.names: picture file -> text)
const ROYAL_PICTURES = { king: IMG('royal-king.jpg'), prince: IMG('royal-crown-prince.jpg') };
const JORDAN_ROYAL = { model: royalFrames, R: ROYAL, pictures: ROYAL_PICTURES, keys: { king: 'royal-king.jpg', prince: 'royal-crown-prince.jpg' }, words: '👑 المملكة الأردنية الهاشمية 👑', banner: ['#8e1426', '#5e0c18'], back: '#2a1414', plaque: '#1d2433' };
// The same on top of the Kingdom Centre (models/saudi.js SAUDI_ROYAL): King Salman and the Crown Prince.
const SAUDI_PORTRAITS = { model: saudiFrames, R: SAUDI_ROYAL, keys: { king: 'saudi-king.jpg', prince: 'saudi-crown-prince.jpg' }, pictures: { king: IMG('saudi-king.jpg'), prince: IMG('saudi-crown-prince.jpg') },
  words: '👑 المملكة العربية السعودية 👑', banner: ['#0f6e3a', '#09502a'], back: '#0b1f14', plaque: '#0b3d22', plaqueSize: 76 };
function buildRoyal(g, set = JORDAN_ROYAL) {
  const { R: ROYAL, pictures: ROYAL_PICTURES } = set;
  const frames = new THREE.Mesh(bake(set.model), houseMat);
  frames.castShadow = frames.receiveShadow = true;
  g.add(frames);
  for (const f of ROYAL.frames) {
    const c = document.createElement('canvas');
    c.width = 520; c.height = Math.round(520 * f.h / f.w);
    const ctx = c.getContext('2d');
    ctx.fillStyle = set.back; ctx.fillRect(0, 0, c.width, c.height);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const img = new Image();
    img.onload = () => { // fill the frame, cut evenly from the sides or the top and bottom
      const k = Math.max(c.width / img.width, c.height / img.height), w = img.width * k, h = img.height * k;
      ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
      tex.needsUpdate = true;
    };
    img.src = ROYAL_PICTURES[f.who];
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(f.w, f.h), new THREE.MeshBasicMaterial({ map: tex }));
    pic.position.set(f.x, f.y, ROYAL.z);
    const P = ROYAL.plaque, plaque = textBoard(1280, Math.round(1280 * P.h / P.w), P.w, P.h);
    drawPlaque(plaque.userData.ctx, plaque.userData.canvas.width, plaque.userData.canvas.height, NAMES[set.keys[f.who]] || f.plaque, { bg: set.plaque, fg: '#f6e7b8', size: set.plaqueSize || 96 });
    plaque.userData.tex.needsUpdate = true;
    plaque.position.set(f.x, f.y + P.dy, ROYAL.z + 0.06); // just in front of its gold plate
    g.add(pic, plaque);
  }
  const B = ROYAL.banner, banner = textBoard(2048, Math.round(2048 * B.h / B.w), B.w, B.h);
  { const { ctx, canvas: c } = banner.userData;
    const bg = ctx.createLinearGradient(0, 0, 0, c.height);
    bg.addColorStop(0, set.banner[0]); bg.addColorStop(1, set.banner[1]);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = '#e8c35a'; ctx.lineWidth = 10; ctx.strokeRect(14, 14, c.width - 28, c.height - 28);
    ctx.fillStyle = '#f3d27a'; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const words = set.words;
    let size = 150;
    do { ctx.font = `800 ${size}px Tajawal, system-ui, sans-serif`; size -= 4; } while (ctx.measureText(words).width > c.width - 140 && size > 60);
    ctx.fillText(words, c.width / 2, c.height / 2 + 10);
    banner.userData.tex.needsUpdate = true; }
  banner.position.set(B.x, B.y, B.z != null ? B.z : ROYAL.z - 0.75);
  g.add(banner);
}
function buildTown(town) {
  const L = town.landmark;
  for (let b = 0; b < 4; b++) { const [bx, bz] = tileOf(town, b); bigTiles.set(bx + ',' + bz, town); }
  for (let b = 0; b < 4; b++) paveBlock(town, b);
  for (let b = 4; b < 12; b++) ensureBlock(town, b); // empty lots round it from day one, waiting for their owners
  const cx = (town.ox + 0.5) * BW, cz = (town.oz + 0.5) * BD;
  const g = new THREE.Group();
  g.position.set(cx, 0.3, cz);
  const building = new THREE.Mesh(bake(L), houseMat); // building it also tells where its flag flies (L.flag)
  building.castShadow = building.receiveShadow = true;
  const cloth = bigFlagCloth(town.code);
  cloth.position.set(L.flag.x, L.flag.y, L.flag.z);
  if (LM_OFF) { // المعالم مخفية: اسم الحارة فقط
    const lab = textSprite(null, 640, 112, 16);
    pill(lab.userData.ctx, 640, 112, 'حارة ' + town.name, '#ffffff', '#1d2433', 58, 'rtl');
    lab.userData.tex.needsUpdate = true;
    lab.position.set(0, 10, 0);
    g.add(lab);
    g.userData.entry = { lm: { type: 'town', name: 'حارة ' + town.name }, town, height: 6, x: cx, z: cz };
    scene.add(g); landmarkGroups.push(g); town.group = g;
    return;
  }
  const label = textSprite(null, 640, 112, 20);
  pill(label.userData.ctx, 640, 112, `${L.label} · ${town.name}`, '#ffffff', '#1d2433', 58, 'rtl');
  label.userData.tex.needsUpdate = true;
  label.position.set(0, L.top + 6 + (town.code === 'JO' ? 26 : 0), 0); // over the royal portraits in Jordan
  const lit = L.floodlight || { color: '#ffc978', at: [0, 14, 16] }; // lit up at night like the mosque
  const light = new THREE.PointLight(lit.color, 0, 80, 1);
  light.position.set(...lit.at);
  floodlights.push(light);
  g.add(building, cloth, label, light);
  if (town.code === 'JO') buildRoyal(g);
  if (town.code === 'SA') buildRoyal(g, SAUDI_PORTRAITS); // King Salman and the Crown Prince on top of the Kingdom Centre
  if (L.lights) { // a landmark's own light at night (Giza's projectors): see-through, faded in with the night
    const fx = L.lights();
    g.add(fx.group);
    townFx.push(...fx.mats);
    if (fx.update) { fx.update(0); if (!reducedMotion) spinners.push((now) => fx.update(now / 1000)); } // what moves in it (Al-Aqsa's sparks)
  }
  g.userData.entry = { lm: { type: 'town', name: 'حارة ' + town.name }, town, height: L.top * 0.6, x: cx, z: cz };
  scene.add(g);
  landmarkGroups.push(g);
  town.group = g;
}

// ------------------------------------------------------------------ highways
// From the edge of Syria's city to the edge of each village, along a line of
// the shared street grid, so a highway meets the towns' own streets. Two
// carriageways, a concrete median and tall lamps; rebuilt (one baked mesh)
// whenever a town grows past its edge.
const HIGHWAY_W = 16;
let highwayMesh = null, highwayAt = 0;
const highwaySigns = HIGHWAYS.map(() => { const s = textSprite(null, 640, 120, 15); scene.add(s); return s; });
let areas = []; // the rectangles the view may aim at: every town and every highway
function highwayEnds(from, to) {
  const A = townFor(from), B = townFor(to);
  if (A.oz === B.oz) { // east-west, on the street line just north of the landmarks
    const dir = Math.sign(B.ox - A.ox), z = (A.oz - 0.5) * BD;
    return { dir, alongX: true, z0: z, z1: z,
      x0: (dir > 0 ? A.bounds[1] + 0.5 : A.bounds[0] - 0.5) * BW, x1: (dir > 0 ? B.bounds[0] - 0.5 : B.bounds[1] + 0.5) * BW };
  }
  const dir = Math.sign(B.oz - A.oz), x = (A.ox - 0.5) * BW; // north-south, on the street line just west of the landmarks
  return { dir, alongX: false, x0: x, x1: x,
    z0: (dir > 0 ? A.bounds[3] + 0.5 : A.bounds[2] - 0.5) * BD, z1: (dir > 0 ? B.bounds[2] - 0.5 : B.bounds[3] + 0.5) * BD };
}
function highwayModel(g, s) {
  const len = Math.abs(s.alongX ? s.x1 - s.x0 : s.z1 - s.z0), cx = (s.x0 + s.x1) / 2, cz = (s.z0 + s.z1) / 2;
  // a box u along the highway, v across it (from its centre line)
  const piece = (color, u, v, y, lu, lv, h) => kitBox(g, color, s.alongX ? cx + u : cx + v, y, s.alongX ? cz + v : cz + u, s.alongX ? lu : lv, h, s.alongX ? lv : lu);
  piece('#3a3d44', 0, 0, 0.02, len, HIGHWAY_W, 0.12);
  for (const v of [-1, 1]) piece('#ecebe4', 0, v * (HIGHWAY_W / 2 - 0.5), 0.14, len, 0.18, 0.01);
  piece('#d6d1c4', 0, 0, 0.14, len, 0.7, 0.55);                                     // the median
  for (let u = -len / 2 + 6; u < len / 2 - 4; u += 10) for (const v of [-3.7, 3.7]) piece('#ecebe4', u, v, 0.14, 3.2, 0.16, 0.01);
  for (let u = -len / 2 + 18; u < len / 2 - 10; u += 36) {                            // lamps on the median, one head over each side
    piece('#8a8f98', u, 0, 0.69, 0.18, 0.18, 7.2);
    piece('#8a8f98', u, 0, 7.8, 0.12, 5.0, 0.12);
    for (const v of [-2.4, 2.4]) piece('#f6d77a', u, v, 7.45, 0.9, 0.5, 0.3);
  }
  let n = 0; // trees along both sides: a row in the countries, now and then out in the desert (lighter for phones)
  const onSomeLand = (x, z) => TOWNS.some((t) => inPolygon(t.land, x, z));
  for (let u = -len / 2 + 9; u < len / 2 - 6; u += 15) for (const v of [-1, 1]) {
    const off = v * (HIGHWAY_W / 2 + 3.5 + (n % 3) * 0.8), x = s.alongX ? cx + u : cx + off, z = s.alongX ? cz + off : cz + u;
    if (!onSomeLand(x, z) && Math.floor((u + len) / 15) % 6) { n++; continue; }
    kitTree(g, x, z, 1.1 + (n % 4) * 0.12, ['cypress', 'olive', 'cypress', 'round'][n++ % 4]);
  }
}
// A highway with the sword's roundabout on it is cut in two round the roundabout.
function highwayPieces(s, a, b) {
  if (a !== SWORD.on[0] || b !== SWORD.on[1] || s.alongX) return [s];
  const lo = Math.min(s.z0, s.z1), hi = Math.max(s.z0, s.z1);
  if (SWORD.z - SWORD.r <= lo || SWORD.z + SWORD.r >= hi) return [s]; // a town has grown up to it: leave the road whole
  return [{ ...s, z0: lo, z1: SWORD.z - SWORD.r }, { ...s, z0: SWORD.z + SWORD.r, z1: hi }];
}
function buildHighways() {
  boundsDirty = false;
  const segs = HIGHWAYS.map(([a, b]) => ({ ...highwayEnds(a, b), to: townFor(b), a, b }));
  if (highwayMesh) { scene.remove(highwayMesh); highwayMesh.geometry.dispose(); }
  highwayMesh = new THREE.Mesh(bake((g) => {
    for (const seg of segs) for (const s of highwayPieces(seg, seg.a, seg.b)) if (Math.abs(s.x1 - s.x0) + Math.abs(s.z1 - s.z0) > 1) highwayModel(g, s);
  }), houseMat);
  highwayMesh.receiveShadow = true;
  scene.add(highwayMesh);
  segs.forEach((s, n) => { // where each highway leaves a town: the name of the town it goes to
    const sign = highwaySigns[n];
    pill(sign.userData.ctx, 640, 120, 'إلى حارة ' + s.to.name, '#2f7d5b', '#ffffff', 60, 'rtl');
    sign.userData.tex.needsUpdate = true;
    sign.position.set(s.x0 + (s.alongX ? s.dir * 30 : 0), 11, s.z0 + (s.alongX ? 0 : s.dir * 30));
  });
  areas = TOWNS.map((t) => [(t.bounds[0] - 0.5) * BW, (t.bounds[1] + 0.5) * BW, (t.bounds[2] - 0.5) * BD, (t.bounds[3] + 0.5) * BD]);
  for (const s of segs) areas.push([Math.min(s.x0, s.x1) - 12, Math.max(s.x0, s.x1) + 12, Math.min(s.z0, s.z1) - 12, Math.max(s.z0, s.z1) + 12]);
  areas.push([SWORD.x - SWORD.r - 6, SWORD.x + SWORD.r + 6, SWORD.z - SWORD.r - 6, SWORD.z + SWORD.r + 6]); // the sword's roundabout
  areas.push(...railAreas);
  areas.push([RUM.x - RUM.w / 2, RUM.x + RUM.w / 2, RUM.z - RUM.d / 2, RUM.z + RUM.d / 2]); // Wadi Rum
  areas.push([BOSRA.x - BOSRA.w / 2, BOSRA.x + BOSRA.w / 2, BOSRA.z - BOSRA.d / 2, BOSRA.z + BOSRA.d / 2]); // Bosra
  areas.push([ABDALI.x - ABDALI.w / 2, ABDALI.x + ABDALI.w / 2, ABDALI.z - ABDALI.d / 2, ABDALI.z + ABDALI.d / 2]); // Abdali
  areas.push(...AIRPORTS.map(airRect)); // the airports
  areas.push(...airRoadAreas);
  areas.push(...noriaAreas);
  layHighwayTraffic(segs);
  buildBorders(segs);
}

// ------------------------------------------------------------------ borders
// Every country has a fence round its town (and round what belongs to it
// outside the houses: Jordan's Wadi Rum, the railway's stations at Beirut and
// Baghdad), and a border crossing where each highway goes through it. Rebuilt
// with the highways when a town grows.
const CROSSING_NAMES = {
  '': { JO: 'منفذ نصيب', LB: 'منفذ جديدة يابوس', IQ: 'منفذ البوكمال' },
  JO: { '': 'معبر جابر', EG: 'منفذ العقبة', PS: 'جسر الملك حسين' },
  PS: { JO: 'معبر الكرامة' },
  LB: { '': 'منفذ المصنع', MA: 'منفذ لبنان' },
  IQ: { '': 'منفذ القائم', SA: 'منفذ عرعر' },
  SA: { IQ: 'منفذ جديدة عرعر' },
  MA: { LB: 'منفذ المغرب' },
  EG: { JO: 'منفذ نويبع', YE: 'منفذ مصر' },
  YE: { EG: 'منفذ اليمن' },
};
const ownLand = { JO: [[RUM.x - RUM.w / 2, RUM.x + RUM.w / 2, RUM.z - RUM.d / 2, RUM.z + RUM.d / 2]] }; // more from buildRailway
let borderGroup = null;
const crossingFlags = new Map(); // country -> flag cloth, made once
function fenceRect(t) {
  let r = [(t.bounds[0] - 0.5) * BW - 6, (t.bounds[1] + 0.5) * BW + 6, (t.bounds[2] - 0.5) * BD - 6, (t.bounds[3] + 0.5) * BD + 6];
  for (const e of ownLand[t.code] || []) r = [Math.min(r[0], e[0] - 6), Math.max(r[1], e[1] + 6), Math.min(r[2], e[2] - 6), Math.max(r[3], e[3] + 6)];
  return r;
}
function buildBorders(segs) {
  if (borderGroup) {
    scene.remove(borderGroup);
    borderGroup.traverse((o) => { if (o.userData.own) o.geometry.dispose(); if (o.isSprite) { o.material.map.dispose(); o.material.dispose(); } });
  }
  borderGroup = new THREE.Group();
  // Since the countries spread apart, a country's border is the edge of its
  // land (its map): the crossing stands where the highway leaves one land and
  // where it comes into the other, out in the desert; no fence round the towns.
  const crossAt = (s, poly, last) => { // where the highway's line crosses the land's edge: the first crossing from its start, or the last
    let best = null;
    for (let i = 0; i < poly.length; i++) {
      const [ax, az] = poly[i], [bx, bz] = poly[(i + 1) % poly.length];
      let u, v; // u along the highway (0..1), v along the edge (0..1)
      if (s.alongX) { if ((az - s.z0) * (bz - s.z0) > 0 || az === bz) continue; v = (s.z0 - az) / (bz - az); u = (ax + (bx - ax) * v - s.x0) / (s.x1 - s.x0); }
      else { if ((ax - s.x0) * (bx - s.x0) > 0 || ax === bx) continue; v = (s.x0 - ax) / (bx - ax); u = (az + (bz - az) * v - s.z0) / (s.z1 - s.z0); }
      if (u < 0 || u > 1) continue;
      if (!best || (last ? u > best : u < best)) best = u;
    }
    return best;
  };
  const gates = [];
  for (const s of segs) for (const [code, other, last] of [[s.a, s.b, false], [s.b, s.a, true]]) {
    const u = crossAt(s, townFor(code).land, last);
    if (u == null) continue;
    gates.push({ code, other, x: s.x0 + (s.x1 - s.x0) * u, z: s.z0 + (s.z1 - s.z0) * u, alongX: s.alongX });
  }
  const mesh = new THREE.Mesh(bake((g) => {
    for (const q of gates) {
      const c = new THREE.Group();
      c.position.set(q.x, 0.02, q.z);
      c.rotation.y = q.alongX ? Math.PI / 2 : 0;
      g.add(c);
      crossing(c, q.code);
    }
  }), houseMat);
  mesh.userData.own = true;
  mesh.castShadow = mesh.receiveShadow = true;
  borderGroup.add(mesh);
  for (const q of gates) { // the flags and the name over each crossing
    const flagCode = q.code || 'SY';
    if (!crossingFlags.has(flagCode)) crossingFlags.set(flagCode, bigFlagCloth(flagCode));
    const cloth = crossingFlags.get(flagCode), ry = q.alongX ? Math.PI / 2 : 0;
    for (const [fx, top] of CROSSING_FLAGS) {
      const f = new THREE.Mesh(cloth.geometry, cloth.material);
      const lx = fx, lz = 4.05;
      f.position.set(q.x + Math.cos(ry) * lx + Math.sin(ry) * lz, top - 1.45, q.z - Math.sin(ry) * lx + Math.cos(ry) * lz);
      f.rotation.y = ry;
      f.scale.setScalar(0.36);
      borderGroup.add(f);
    }
    const name = (CROSSING_NAMES[q.code] || {})[q.other] || 'المنفذ الحدودي';
    const label = textSprite(null, 640, 112, 13);
    pill(label.userData.ctx, 640, 112, name, '#ffffff', '#1d2433', 58, 'rtl');
    label.userData.tex.needsUpdate = true;
    label.position.set(q.x, 10.4, q.z);
    borderGroup.add(label);
  }
  scene.add(borderGroup);
}

// Cars on the highways: two lanes each way, on the right, and round the
// sword's roundabout (anticlockwise seen from above) on the road to Amman.
// A car's place comes from the clock, so the traffic keeps flowing when a
// highway is rebuilt; cars shrink into the towns at the ends of the road.
const HW_SPEED = 12, HW_PER_LANE = 5, HW_LANES = [2.0, 5.6], hwLanes = [];
function hwPath(s, back, off) {
  let a = [s.x0, s.z0], b = [s.x1, s.z1];
  if (back) [a, b] = [b, a];
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (L < 12) return null;
  const dx = (b[0] - a[0]) / L, dz = (b[1] - a[1]) / L, rx = -dz, rz = dx;
  const at = (u) => [a[0] + dx * u + rx * off, a[1] + dz * u + rz * off];
  const pts = [at(0)];
  if (highwayPieces(s, s.a, s.b).length > 1) {
    const R = off < 4 ? 14.4 : 17.4, k = Math.asin(off / R), cx = SWORD.x, cz = SWORD.z;
    const uc = (cx - a[0]) * dx + (cz - a[1]) * dz; // the roundabout's middle, along the road
    const E = at(uc - R * Math.cos(k)), X = at(uc + R * Math.cos(k));
    pts.push(at(uc - SWORD.r), E);
    const t0 = Math.atan2(E[1] - cz, E[0] - cx);
    let t1 = Math.atan2(X[1] - cz, X[0] - cx);
    while (t1 >= t0) t1 -= Math.PI * 2;
    for (let i = 1; i < 16; i++) { const t = t0 + (t1 - t0) * (i / 16); pts.push([cx + Math.cos(t) * R, cz + Math.sin(t) * R]); }
    pts.push(X, at(uc + SWORD.r));
  }
  pts.push(at(L));
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, L: cum[cum.length - 1] };
}
function layHighwayTraffic(segs) {
  if (!carPools) return;
  let i = 0;
  for (const s of segs) for (const back of [false, true]) for (const off of HW_LANES) {
    let lane = hwLanes[i];
    if (!lane) {
      lane = hwLanes[i] = { cars: [], speed: HW_SPEED * (off < 4 ? 1.12 : 0.9) };
      for (let k = 0; k < HW_PER_LANE; k++) {
        const pool = carPools[(i * 3 + k * 2) % carPools.length];
        lane.cars.push({ pool, idx: pool.add(), beam: beamPool.add(), phase: (k + ((i * 0.37) % 1)) / HW_PER_LANE });
      }
    }
    lane.path = hwPath(s, back, off);
    i++;
  }
}
function updateHighwayCars(now) {
  const t = reducedMotion ? 0 : now / 1000;
  for (const lane of hwLanes) {
    const p = lane.path;
    for (const car of lane.cars) {
      if (!p) setBase(0, -50, 0, 0, 0, 0);
      else {
        const s = (((car.phase * p.L + t * lane.speed) % p.L) + p.L) % p.L;
        let j = 1;
        while (j < p.cum.length - 1 && p.cum[j] < s) j++;
        const a = p.pts[j - 1], b = p.pts[j], f = (s - p.cum[j - 1]) / Math.max(1e-6, p.cum[j] - p.cum[j - 1]);
        const k = Math.min(1, s / 4, (p.L - s) / 4) * CAR_SCALE;
        setBase(a[0] + (b[0] - a[0]) * f, CAR_Y, a[1] + (b[1] - a[1]) * f, Math.atan2(b[0] - a[0], b[1] - a[1]), k, k);
      }
      car.pool.mesh.setMatrixAt(car.idx, _base);
      car.pool.dirty = true;
      part(beamPool, car.beam, 0, 0.06, 1.25, 2.6, 1, 7.5);
    }
  }
}

// ------------------------------------------------------------------ railway
// «سكة حديد الحجاز» (models/railway.js): from «محطة الحجاز» (a landmark on a
// block of Damascus) one line runs west to Beirut and east to Baghdad over the
// street along the station's north side, and one runs south to Amman over the
// street along its west side. The viaduct only stands in streets and on open
// ground, so no house is touched, and the towns can grow under it.
let railAreas = [];
const trains = [];
// Smoke from an engine's chimney: a puff every DT seconds, left where the
// chimney was when it came out, rising, swelling and drifting with the wind,
// so a moving train draws a trail behind it. Follows the train's mesh, so it
// is right whoever moves the train (its timetable or a reel).
function trainSmoke(train, length) {
  const N = 34, DT = 0.065, LIFE = N * DT;
  const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1),
    new THREE.MeshLambertMaterial({ color: '#eceae6', transparent: true, opacity: 0.72, flatShading: true, depthWrite: false }), N);
  mesh.frustumCulled = false;
  mesh.raycast = () => {};
  scene.add(mesh);
  const born = new Float64Array(N).fill(-1e9), from = Array.from({ length: N }, () => new THREE.Vector3());
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3();
  const ahead = length / 2 - 1.2; // the chimney, from the middle of the train
  let last = null;
  const was = new THREE.Vector3();
  return (sec) => {
    const t = train.mesh, n = Math.floor(sec / DT);
    if (last === null || n < last || n - last > N) last = n - N;
    for (let k = last + 1; k <= n; k++) {
      const i = ((k % N) + N) % N, th = t.rotation.y;
      const moving = t.position.distanceToSquared(was) > 0.0004;
      if (!moving && k % 5) { born[i] = -1e9; continue; } // standing at a station: only a gentle puff now and then
      from[i].set(t.position.x + Math.cos(th) * ahead, t.position.y + 4.1, t.position.z - Math.sin(th) * ahead);
      born[i] = k * DT;
    }
    was.copy(train.mesh.position);
    last = n;
    for (let i = 0; i < N; i++) {
      const age = sec - born[i];
      if (age < 0 || age > LIFE) m4.makeScale(0, 0, 0);
      else {
        const u = age / LIFE, r = (0.3 + 1.05 * Math.sqrt(u)) * (u > 0.75 ? (1 - u) / 0.25 : 1);
        p.set(from[i].x + age * (1.8 + age * 0.6) + Math.sin(born[i] * 5.1) * 0.5 * u, from[i].y + age * 2.2, from[i].z + age * 0.9 + Math.cos(bor
