import * as THREE from 'three';
// Pictures in img/: a relative path (works under any folder) + a version that changes every minute,
// so a picture replaced in the admin panel shows up instead of the browser's old copy.
const IMG = (name) => 'img/' + name + '?v=' + Math.floor(Date.now() / 60000);
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getConfig, getHousesData } from './db.js';
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
import * as social from './social.js';
import { createTraffic } from './traffic.js';
import { createDrive } from './drive.js';
import { createWarJet } from './airbase/warjet.js';
import { createShop } from './shop.js';
import { airport as airportModel, airliner, LIVERIES, SIZE as AIR_SIZE, RUNWAY, TAXI, GATES, STAND_Z, GROUND_Y, ROAD as AIR_ROAD, SIGN as AIR_SIGN, FLAG as AIR_FLAG, RADAR, radarMast, radarDish, airportLights, lightSpots, BEACON } from './models/airport.js';

const $ = (s) => document.querySelector(s);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ------------------------------------------------------------------ layout
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

const TOWNS = [
  { code: '', name: 'سوريا', ox: 0, oz: 0 },
  { code: 'LB', name: 'لبنان', ox: -18, oz: 0, landmark: raouche, house: lebanonHouse, view: [[26, 20, 52], [-1, 19, -7]] },
  { code: 'JO', name: 'الأردن', ox: 0, oz: 18, landmark: petra, house: jordanHouse, view: [[5, 64, 122], [0, 40, -8]] },
  { code: 'IQ', name: 'العراق', ox: 18, oz: 0, landmark: babylon, house: iraqHouse, view: [[48, 50, 74], [0, 11, -4]] },
  { code: 'MA', name: 'المغرب', ox: -38, oz: 0, landmark: koutoubia, house: moroccoHouse, view: [[-16, 26, 66], [8, 24, -6]] },
  { code: 'EG', name: 'مصر', ox: 0, oz: 38, landmark: giza, house: egyptHouse, view: [[34, 21, 46], [1, 7, -3]] },
  { code: 'PS', name: 'فلسطين', ox: -22, oz: 18, landmark: aqsa, house: palestineHouse, view: [[30, 34, 62], [0, 13, 0]] },
  { code: 'YE', name: 'اليمن', ox: 88, oz: 480, landmark: sanaa, house: yemenHouse, view: [[30, 22, 60], [0, 9, 8]] },
  { code: 'SA', name: 'السعودية', ox: 274, oz: 184, landmark: kingdomCentre, house: saudiHouse, view: [[60, 70, 150], [0, 48, -6]] },
];

const HIGHWAYS = [['', 'LB'], ['', 'JO'], ['', 'IQ'], ['LB', 'MA'], ['JO', 'EG'], ['JO', 'PS'], ['EG', 'YE'], ['IQ', 'SA']];
const SWORD = { on: [], x: ((SWORD_TILES[0] + SWORD_TILES[1]) / 2) * BW, z: ((SWORD_TILES[2] + SWORD_TILES[3]) / 2) * BD, r: (SWORD_RING + 0.6) * SWORD_SCALE };
const RUM = { x: -0.5 * BW - 97.5, z: 1060, w: 160, d: 120 };
const BOSRA = { tiles: [0, 3, 2, 3], x: 1.5 * BW, z: 2.5 * BD, w: 128, d: 40 };
const ABDALI = { tiles: [7, 8, 19, 20], x: 7.5 * BW, z: 19.5 * BD, w: 64, d: 40 };
const SOUQ = { tiles: [-4, -3, 1, 1], x: -3.5 * BW, z: 1 * BD, rot: -Math.PI / 2 };
const inSouq = (bx, bz) => bx >= SOUQ.tiles[0] && bx <= SOUQ.tiles[1] && bz >= SOUQ.tiles[2] && bz <= SOUQ.tiles[3];
const inAbdali = (bx, bz) => bx >= ABDALI.tiles[0] && bx <= ABDALI.tiles[1] && bz >= ABDALI.tiles[2] && bz <= ABDALI.tiles[3];
const inBosra = (bx, bz) => bx >= BOSRA.tiles[0] && bx <= BOSRA.tiles[1] && bz >= BOSRA.tiles[2] && bz <= BOSRA.tiles[3];

const TERRITORY = {
  '': [-7, 7, -Infinity, 7], LB: [-27, -10, -Infinity, 7], MA: [-Infinity, -30, -Infinity, 7],
  IQ: [11, Infinity, -Infinity, 7], JO: [-11, Infinity, 11, 33], PS: [-Infinity, -14, 11, 33], EG: [-Infinity, Infinity, 37, Infinity],
};

const ALIA_ROAD = { x0: 549, z: 437, strip: [551, 590, 434, 446] };
const AIRPORTS = [
  { code: '', name: 'مطار دمشق الدولي', en: 'DAMASCUS INTERNATIONAL AIRPORT', x: 640, z: -480, rot: 0, style: 'damascus', seed: 11,
    parked: ['syrianair', 'chamwings', 'qatar', 'syrianair', 'rj', 'emirates'], landing: 'syrianair', takeoff: 'chamwings', sign: ['#2f5d4a', '#f6e7b8'] },
  { code: 'JO', name: 'مطار الملكة علياء الدولي', en: 'QUEEN ALIA INTERNATIONAL AIRPORT', x: 950, z: 640, rot: Math.PI, style: 'alia', seed: 23,
    parked: ['rj', 'qatar', 'rj', 'turkish', 'saudia', 'emirates'], landing: 'rj', takeoff: 'emirates', sign: ['#1d2433', '#ffffff'] },
];
const airRect = (A) => [A.x - AIR_SIZE.w / 2, A.x + AIR_SIZE.w / 2, A.z - AIR_SIZE.d / 2, A.z + AIR_SIZE.d / 2];

for (const t of TOWNS) {
  const to = TOWN_AT[t.code];
  const dx = to[0] - t.ox, dz = to[1] - t.oz, X = dx * BW, Z = dz * BD, T = TERRITORY[t.code];
  t.ox = to[0]; t.oz = to[1];
  if (T) { T[0] += dx; T[1] += dx; T[2] += dz; T[3] += dz; }
  if (t.code !== 'JO') continue;
  ABDALI.tiles[0] += dx; ABDALI.tiles[1] += dx; ABDALI.tiles[2] += dz; ABDALI.tiles[3] += dz; ABDALI.x += X; ABDALI.z += Z;
  RUM.x += X; RUM.z += Z;
  AIRPORTS[1].x += X; AIRPORTS[1].z += Z;
  ALIA_ROAD.x0 += X; ALIA_ROAD.z += Z;
  ALIA_ROAD.strip[0] += X; ALIA_ROAD.strip[1] += X; ALIA_ROAD.strip[2] += Z; ALIA_ROAD.strip[3] += Z;
}

const RESERVED = [[RUM.x - RUM.w / 2, RUM.x + RUM.w / 2, RUM.z - RUM.d / 2, RUM.z + RUM.d / 2], ...AIRPORTS.map(airRect), ALIA_ROAD.strip];

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
    landmarkBlocks: new Map(),
    houseBlocks: [],
    lastBlock: t.code ? 3 : 0,
    frozen: Infinity,
    spreadK: null,
    count: 0,
    bounds: [t.ox, t.ox, t.oz, t.oz],
  });
  const land = landPolygon(t.code, BW, BD), cx = (t.ox + 0.5) * BW, cz = (t.oz + 0.5) * BD;
  const R = Math.max(...land.map(([x, z]) => Math.max(Math.abs(x - cx) / BW, Math.abs(z - cz) / BD)));
  t.land = land;
  t.landEnd = (2 * Math.ceil(R) + 3) ** 2;
  townOf.set(t.code, t);
}
const SYRIA = townOf.get('');
const townFor = (code) => townOf.get(code || '') || SYRIA;

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

function lmTiles(lm) {
  const out = [];
  if (lm.tiles) for (let bx = lm.tiles[0]; bx <= lm.tiles[1]; bx++) for (let bz = lm.tiles[2]; bz <= lm.tiles[3]; bz++) out.push(bx + ',' + bz);
  return out;
}

function tileOf(town, b) {
  const [bx, bz] = spiral(b);
  return [town.ox + bx, town.oz + bz];
}

function plotOf(town, j) {
  const b = blockOfK(town, Math.floor(j / PER_BLOCK));
  const s = j % PER_BLOCK;
  const [bx, bz] = tileOf(town, b);
  const col = s % COLS, back = s >= COLS;
  return {
    b, town, bx, bz,
    x: bx * BW + (col - (COLS - 1) / 2) * PLOT_W,
    z: bz * BD + (back ? ROW_Z : -ROW_Z),
    rot: 0,
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
controls.screenSpacePanning = false;
controls.zoomToCursor = true;
controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE };
controls.addEventListener('start', takeOver);

// إتاحة مراجع المشهد للتكامل الخارجي وأدوات الإدارة
window.__CITY_SCENE__ = scene;
window.__CITY_CAMERA__ = camera;
window.__CITY_RENDERER__ = renderer;
window.__CITY_CONTROLS__ = controls;

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
ground.position.y = -0.08;
Object.assign(ground.material, { polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 4 });
scene.add(ground);

const LAND_DAY = new THREE.Color('#bdbdbd'), LAND_NIGHT = new THREE.Color('#2c323c');
const landNames = [];
let landPolys = [];

function mulberry(seed) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

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
  g.drawImage(small, -N, -N, N * 3, N * 3);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function soilGrain() {
  const N = 256, c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d'), rnd = mulberry(3), img = g.createImageData(N, N);
  for (let i = 0; i < N * N; i++) { const v = 130 + (rnd() - 0.5) * 70; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
  g.putImageData(img, 0, 0);
  const wrap = (f) => { for (const dx of [-N, 0, N]) for (const dy of [-N, 0, N]) { g.save(); g.translate(dx, dy); f(); g.restore(); } };
  for (let i = 0; i < 260; i++) {
    const x = rnd() * N, y = rnd() * N, r = 0.8 + rnd() * 2.6, v = 70 + rnd() * 130;
    wrap(() => { g.fillStyle = `rgb(${v},${v},${v})`; g.beginPath(); g.ellipse(x, y, r, r * (0.6 + rnd() * 0.4), rnd() * 3, 0, 7); g.fill(); });
  }
  for (let i = 0; i < 900; i++) {
    const x = rnd() * N, y = rnd() * N, a = rnd() * Math.PI, l = 2 + rnd() * 5, v = 60 + rnd() * 110;
    wrap(() => { g.strokeStyle = `rgba(${v},${v},${v},.8)`; g.lineWidth = 0.7; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); });
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

function scatterGround() {
  const rnd = mulberry(11), keep = [];
  const inPoly = (poly, x, z) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c; } return c; };
  const busy = (x, z) => areas.some((a) => x > a[0] - 4 && x < a[1] + 4 && z > a[2] - 4 && z < a[3] + 4);
  for (const { t, pts } of landPolys) {
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
  for (const a of areas) {
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
  const tuft = (() => {
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
  const cells = new Map();
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
  const blobs = (n, colors, r0, r1, alpha, box = [0, 0, c.width, c.height]) => {
    for (let i = 0; i < n; i++) {
      const x = box[0] + rnd() * (box[2] - box[0]), y = box[1] + rnd() * (box[3] - box[1]), r = r0 + (r1 - r0) * rnd() * rnd();
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      const col = colors[Math.floor(rnd() * colors.length)];
      grd.addColorStop(0, col.replace('A', alpha)); grd.addColorStop(1, col.replace('A', 0));
      g.fillStyle = grd;
      g.save(); g.translate(x, y); g.scale(1, 0.55 + rnd() * 0.9); g.translate(-x, -y);
      g.fillRect(x - r, y - r, r * 2, r * 2);
      g.restore();
    }
  };
  g.fillStyle = '#d9bf8a'; g.fillRect(0, 0, c.width, c.height);
  blobs(2600, ['rgba(234,214,166,A)', 'rgba(201,168,112,A)', 'rgba(214,170,118,A)', 'rgba(190,160,115,A)'], 20, 260, 0.45);
  blobs(1800, ['rgba(176,146,104,A)', 'rgba(240,224,186,A)'], 4, 30, 0.5);
  {
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
    const F = Math.min(1, Math.min(Math.max(...lx) - Math.min(...lx), Math.max(...lz) - Math.min(...lz)) / 6000);
    for (let w = 1300; w > 30; w -= 40) { g.strokeStyle = 'rgba(160,132,88,.04)'; g.lineWidth = w * F * k; g.stroke(); }
    g.save(); path(l.pts); g.clip();
    const px = l.pts.map((p) => (p[0] - x0) * k), py = l.pts.map((p) => (p[1] - z0) * k);
    const box = [Math.min(...px), Math.min(...py), Math.max(...px), Math.max(...py)], area = (box[2] - box[0]) * (box[3] - box[1]) / 1e4;
    g.fillStyle = '#78a952'; g.fillRect(0, 0, c.width, c.height);
    blobs(Math.ceil(area * 1.6), ['rgba(88,134,58,A)', 'rgba(142,186,92,A)', 'rgba(176,180,96,A)', 'rgba(104,152,66,A)', 'rgba(66,112,48,A)'], 5, 80, 0.8, box);
    blobs(Math.ceil(area * 0.7), ['rgba(152,124,84,A)', 'rgba(182,156,104,A)', 'rgba(196,184,120,A)'], 2, 22, 0.75, box);
    blobs(Math.ceil(area * 7), ['rgba(60,104,44,A)', 'rgba(170,200,112,A)', 'rgba(140,120,80,A)'], 1, 5, 0.35, box);
    path(l.pts);
    for (let w = 1900; w > 30; w -= 40) { g.strokeStyle = w > 420 ? 'rgba(182,176,100,.045)' : 'rgba(172,146,94,.06)'; g.lineWidth = w * F * k; g.stroke(); }
    g.restore();
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
    path(l.pts); g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = Math.max(1, 5 * k); g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  ground.geometry.dispose();
  const BIG = 140000;
  ground.geometry = new THREE.PlaneGeometry(BIG, BIG);
  tex.repeat.set(BIG / W, BIG / D);
  tex.offset.set(-(BIG - W) / 2 / W, -(BIG - D) / 2 / D);
  ground.material.map = tex;
  ground.material.color.copy(LAND_DAY);
  const grain = soilGrain(), patch = softPatches();
  ground.material.onBeforeCompile = (sh) => {
    sh.uniforms.grain = { value: grain };
    sh.uniforms.patchy = { value: patch };
    sh.vertexShader = 'varying vec2 vGroundXZ;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n  vGroundXZ = (modelMatrix * vec4(transformed, 1.0)).xz;');
    sh.fragmentShader = 'uniform sampler2D grain, patchy;\nvarying vec2 vGroundXZ;\n' + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
  float gNear = 1.0 - smoothstep(300.0, 2200.0, length(vViewPosition));
  float fine = texture2D(grain, vGroundXZ / 34.0).r * texture2D(grain, vGroundXZ.yx / 13.0 + 0.41).r * 4.0;
  float p1 = texture2D(patchy, vGroundXZ / 140.0).r, p2 = texture2D(patchy, vGroundXZ.yx / 620.0 + 0.3).r;
  float pNear = 1.0 - smoothstep(1800.0, 7000.0, length(vViewPosition));
  float pat = mix(1.0, p1 * p2 * 4.0, 0.75 * pNear);
  diffuseColor.rgb *= pat * mix(1.0, fine, gNear * 0.7);
  diffuseColor.g *= mix(1.0, 0.9 + 0.2 * p1, 0.6 * pNear);`);
  };
  ground.material.needsUpdate = true;
  ground.position.set((x0 + x1) / 2, ground.position.y, (z0 + z1) / 2);
  camera.near = 2; camera.far = 120000; camera.updateProjectionMatrix();
  controls.maxDistance = 60000;
  for (const l of lands) {
    const xs = l.pts.map((p) => p[0]), zs = l.pts.map((p) => p[1]);
    const s = textSprite(null, 768, 150, 1);
    pill(s.userData.ctx, 768, 150, l.t.name, '#ffffff', '#1d2433', 92, 'rtl');
    s.userData.tex.needsUpdate = true;
    s.scale.set(2000, 2000 * 150 / 768, 1);
    s.position.set((Math.min(...xs) + Math.max(...xs)) / 2, 500, (Math.min(...zs) + Math.max(...zs)) / 2);
    s.material.fog = false;
    scene.add(s);
    landNames.push(s);
  }
  spinners.push(() => {
    const on = camera.position.y > 1500, w = THREE.MathUtils.clamp(camera.position.distanceTo(controls.target) * 0.11, 2000, 9000);
    for (const s of landNames) { s.visible = on; s.scale.set(w, w * 150 / 768, 1); }
  });
}

// ------------------------------------------------------------------ instancing
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
  drop() {
    this.count = Math.max(0, this.count - 1);
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
const blockAt = new Set();
const bigTiles = new Map();
for (let bx = BOSRA.tiles[0]; bx <= BOSRA.tiles[1]; bx++) for (let bz = BOSRA.tiles[2]; bz <= BOSRA.tiles[3]; bz++) bigTiles.set(bx + ',' + bz, SYRIA);
const ABDALI_GROUND = {};
for (let bx = ABDALI.tiles[0]; bx <= ABDALI.tiles[1]; bx++) for (let bz = ABDALI.tiles[2]; bz <= ABDALI.tiles[3]; bz++) bigTiles.set(bx + ',' + bz, ABDALI_GROUND);
const SOUQ_GROUND = {};
for (let bx = SOUQ.tiles[0]; bx <= SOUQ.tiles[1]; bx++) for (let bz = SOUQ.tiles[2]; bz <= SOUQ.tiles[3]; bz++) bigTiles.set(bx + ',' + bz, SOUQ_GROUND);
let boundsDirty = true;

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
const pavedTiles = new Set();
const asphaltPool = new Pool(box, lambert('#43464e'), { cast: false, receive: true });
const paintPool = new Pool(box, lambert('#ecebe4'), { cast: false, receive: true });
const lampPostPool = new Pool(cyl, lambert('#3b3f47'));
const lampMat = new THREE.MeshBasicMaterial({ color: '#d9dde3' });
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
  if (bigTiles.has(key)) { carsDirty = true; return; }
  const paint = (x, z, w, d) => part(paintPool, paintPool.add(), x, 0.127, z, w, 0.014, d);
  for (const sz of [-1, 1]) for (let x = -CURB_X + 4.4; x < CURB_X - 4.4 - 1.7; x += 3.6) paint(x + 0.9, sz * BD / 2, 1.8, 0.18);
  for (const sx of [-1, 1]) for (let z = -CURB_Z + 4.4; z < CURB_Z - 4.4 - 1.7; z += 3.6) paint(sx * BW / 2, z + 0.9, 0.18, 1.8);
  for (const sz of [-1, 1]) paint(0, sz * (CURB_Z + 0.22), SLAB_W, 0.12);
  for (const sx of [-1, 1]) paint(sx * (CURB_X + 0.22), 0, 0.12, SLAB_D);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      paint(sx * (CURB_X - 0.6 - i * 0.75), sz * (BD / 2), 0.4, ROAD - 1.2);
      paint(sx * (BW / 2), sz * (CURB_Z - 0.6 - i * 0.75), ROAD - 1.2, 0.4);
    }
  }
  for (const sz of [-1, 1]) for (const x of [-CURB_X - 0.45, -4.9, 4.9, CURB_X + 0.45]) lamp(x, sz * (CURB_Z + 0.45));
  for (const sx of [-1, 1]) lamp(sx * (CURB_X + 0.45), 0);
  carsDirty = true;
}

// ------------------------------------------------------------------ cars
const CAR_COLORS = ['#d64545', '#f4f4f0', '#2f6fb5', '#f4c542', '#3c4048', '#5aa469', '#9aa3ad'];
const MAX_CARS = matchMedia('(pointer: coarse)').matches ? 18 : 34;
const LANE = 1.5, CAR_SPEED = 6.5, CAR_Y = 0.12, CAR_SCALE = 0.92, INSET = ROAD / 2 + 0.4;
const beamMat = new THREE.MeshBasicMaterial({
  map: glowTexture('rgba(255,236,190,0.9)'), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
});
const beamGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5);
const beamPool = new Pool(beamGeo, beamMat, { cast: false });
poolList.push(beamPool);
let carPools = null;
const cars = [];
let carsDirty = false, lastCarNow = 0;
const cornerX = (i) => (i + 0.5) * BW, cornerZ = (j) => (j + 0.5) * BD;

function streetLived(i1, j1, i2, j2) {
  const [a, b] = j1 === j2 ? [Math.max(i1, i2) + ',' + j1, Math.max(i1, i2) + ',' + (j1 + 1)] : [i1 + ',' + Math.max(j1, j2), (i1 + 1) + ',' + Math.max(j1, j2)];
  if (bigTiles.has(a) && bigTiles.get(a) === bigTiles.get(b)) return false;
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

function curve(p0, c, p1) {
  const len = (Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + Math.hypot(c[0] - p0[0], c[1] - p0[1]) + Math.hypot(p1[0] - c[0], p1[1] - c[1])) / 2;
  return { p0, c, p1, len: Math.max(0.5, len) };
}

function roadPiece(car, ai, aj, bi, bj) {
  const dx = Math.sign(bi - ai), dz = Math.sign(bj - aj), rx = -dz, rz = dx;
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
  if (!options.length) next = [-dx, -dz];
  else {
    const straight = options.find(([ox, oz]) => ox === dx && oz === dz);
    next = straight && Math.random() < 0.55 ? straight : options[Math.floor(Math.random() * options.length)];
  }
  const [nx, nz] = next, bx = cornerX(i), bz = cornerZ(j);
  const p0 = car.piece.p1, p1 = [bx + nx * INSET - nz * LANE, bz + nz * INSET + nx * LANE];
  let c;
  if (nx === dx && nz === dz) c = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
  else if (nx === -dx && nz === -dz) c = [bx + dx * INSET * 0.7, bz + dz * INSET * 0.7];
  else c = [bx - dz * LANE - nz * LANE, bz + dx * LANE + nx * LANE];
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

function trafficBlockers() {
  const out = [];
  if (drive && drive.on) out.push({ x: drive.state.x, z: drive.state.z, car: true });
  if (walker.on) out.push({ x: walker.x, z: walker.z, car: false });
  return out;
}

function carBrake(car, now, blockers, dt) {
  let want = 1;
  if (car.px !== undefined) {
    if (car.onRoad && traffic) {
      const rem = car.piece.len - car.s, axis = car.dir[0] ? 'x' : 'z';
      if (rem < 8 && rem > 1.4 && traffic.state(car.at[0], car.at[1], axis, now) !== 'g') want = 0;
    }
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
    const dd = car.dead && now < car.dead;
    setBase(x, dd ? -50 : CAR_Y, z, Math.atan2(hx, hz), CAR_SCALE, CAR_SCALE);
    car.pool.mesh.setMatrixAt(car.idx, _base);
    car.pool.dirty = true;
    part(beamPool, car.beam, 0, dd ? -50 : 0.06, 1.25, 2.6, 1, 7.5);
    const hl = Math.hypot(hx, hz) || 1; car.px = x; car.pz = z; car.hx = hx / hl; car.hz = hz / hl;
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

function pill(ctx, w, h, text, bg, fg, maxFont, dir = 'inherit') {
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
const CENTER = umayyad;
const MOSQUE = { w: 1.04, h: 2.0, d: 1.02 };
const plazaTop = CENTER.top * MOSQUE.h;

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
  ring(0, 9.95, 6.9, 1.5); ring(0, 15.15, 6.9, 1.47); ring(0, 18.95, 6.9, 0.68);
  ring(11.9, 18.25, -6.2, 1.32); ring(11.9, 21.3, -6.2, 1.07);
  ring(-11.9, 9.3, -6.2, 1.76); ring(-11.9, 13.96, -6.2, 1.62); ring(-11.9, 17.6, -6.2, 1.32);
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
let flagSquare = null;
let flagSquareDirty = false, flagSquareAt = 0;
const flagSquareMats = [];

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

const flagWave = (() => {
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
  part(lampLightPool, lampLightPool.add(), 0, 0.12, SCREEN.z + 1.6, 12, 1, 5);
  part(lampLightPool, lampLightPool.add(), 0, 0.12, 1.0, 9, 1, 9);
  flagSquare = { x: g.position.x, z: g.position.z, spots, screen, list: [], podium: buildPodium(g) };
  flagSquareDirty = true;
  return flagSquareModel.top;
}

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
  part(lampLightPool, lampLightPool.add(), 0, 0.12, P.z + 0.5, 11, 1, 6);
  return { steps, sign, text: '', at: 0 };
}

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

const NOT_IN_SQUARE = new Set(['IL']);
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
  const { ctx, canvas: c, tex } = flagSquare.screen.userData;
  drawBoard(ctx, c.width, c.height, list, (code) => (flags.get(code) && flags.get(code).loaded ? flagFor(code).pool.mat.map.image : null));
  tex.needsUpdate = true;
}

function setAccount(handle) {
  const { ctx, canvas: c, tex } = plazaSign.userData;
  pill(ctx, c.width, c.height, '@' + handle, '#ffffff', '#d62976', 84);
  tex.needsUpdate = true;
}

// ------------------------------------------------------------------ landmarks
const landmarkGroups = [];
let LM_OFF = false;
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
  souq(g) {
    const turn = new THREE.Group();
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
    if (titles.souq) {
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
      solid(holder, box, '#5a3620', 0, 0, 0, B.w + 0.2, B.h + 0.2, 0.06);
      for (const dx of [-B.w / 2 + 0.4, B.w / 2 - 0.4]) solid(holder, box, '#3e4750', dx, -B.h / 2 - 0.5, 0, 0.12, 1.0, 0.12);
      turn.add(holder);
    }
    setBase(g.position.x, 0.3, g.position.z, SOUQ.rot, 1, 1);
    const { z0, z1, w } = SOUQ_STREET, n = 4, len = (z1 - z0) / n;
    for (let i = 0; i < n; i++) part(lampLightPool, lampLightPool.add(), 0, 0.26, z0 + (i + 0.5) * len, w * 1.05, 1, len * 1.4);
    part(lampLightPool, lampLightPool.add(), 0, 0.24, z1 + 3.6, 13, 1, 5);
    part(lampLightPool, lampLightPool.add(), 0, 0.24, z0 - 2.4, 13, 1, 4);
    return souqModel.top;
  },
  theatre(g) {
    const base = new THREE.Mesh(bake(theatreModel), houseMat);
    base.castShadow = base.receiveShadow = true;
    g.add(base);
    const fx = theatreModel.lights();
    fx.group.traverse((m) => { if (m.isMesh) m.raycast = () => {}; });
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
  nativity(g) {
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
  police(g, lm) {
    const base = new THREE.Mesh(bake(policeStation), houseMat);
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
    const chief = titles.police && titles.police[lm.t || ''];
    if (chief) {
      const tag = titlePill(`👮 رئيس الشرطة ${handle(chief)}`, '#1f4e9c', 15);
      tag.position.set(0, policeStation.top + 6.6, 0);
      g.add(tag);
    }
    return policeStation.top;
  },
  station(g) {
    const base = new THREE.Mesh(bake(hejazStation), houseMat);
    base.position.y = -0.3;
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
  if (lm.type === 'norias' && lm.tiles) { buildNorias(lm); return; }
  if (lm.type === 'stadium' && lm.tiles) { buildStadium(lm); return; }
  if (lm.type === 'jeita' && lm.tiles) { buildJeita(lm); return; }
  const town = townFor(lm.t);
  ensureBlock(town, lm.block);
  const [bx, bz] = tileOf(town, lm.block);
  paveBlock(town, lm.block);
  if (town === SYRIA && inBosra(bx, bz)) return;
  const g = new THREE.Group();
  g.position.set(bx * BW, 0.3, bz * BD);
  if (lm.type === 'souq' && town === SYRIA) {
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
const bigWave = (() => {
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

const townFx = [];
let NAMES = {};
const ROYAL_PICTURES = { king: IMG('royal-king.jpg'), prince: IMG('royal-crown-prince.jpg') };
const JORDAN_ROYAL = { model: royalFrames, R: ROYAL, pictures: ROYAL_PICTURES, keys: { king: 'royal-king.jpg', prince: 'royal-crown-prince.jpg' }, words: '👑 المملكة الأردنية الهاشمية 👑', banner: ['#8e1426', '#5e0c18'], back: '#2a1414', plaque: '#1d2433' };
const SAUDI_PORTRAITS = {
  model: saudiFrames, R: SAUDI_ROYAL, keys: { king: 'saudi-king.jpg', prince: 'saudi-crown-prince.jpg' },
  pictures: { king: IMG('saudi-king.jpg'), prince: IMG('saudi-crown-prince.jpg') },
  words: '👑 المملكة العربية السعودية 👑', banner: ['#0f6e3a', '#09502a'], back: '#0b1f14', plaque: '#0b3d22', plaqueSize: 76,
};

function buildRoyal(g, set = JORDAN_ROYAL) {
  const { R: ROYAL_SET, pictures: ROYAL_PICS } = set;
  const frames = new THREE.Mesh(bake(set.model), houseMat);
  frames.castShadow = frames.receiveShadow = true;
  g.add(frames);
  for (const f of ROYAL_SET.frames) {
    const c = document.createElement('canvas');
    c.width = 520; c.height = Math.round(520 * f.h / f.w);
    const ctx = c.getContext('2d');
    ctx.fillStyle = set.back; ctx.fillRect(0, 0, c.width, c.height);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const img = new Image();
    img.onload = () => {
      const k = Math.max(c.width / img.width, c.height / img.height), w = img.width * k, h = img.height * k;
      ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
      tex.needsUpdate = true;
    };
    img.src = ROYAL_PICS[f.who];
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(f.w, f.h), new THREE.MeshBasicMaterial({ map: tex }));
    pic.position.set(f.x, f.y, ROYAL_SET.z);
    const P = ROYAL_SET.plaque, plaque = textBoard(1280, Math.round(1280 * P.h / P.w), P.w, P.h);
    drawPlaque(plaque.userData.ctx, plaque.userData.canvas.width, plaque.userData.canvas.height, NAMES[set.keys[f.who]] || f.plaque, { bg: set.plaque, fg: '#f6e7b8', size: set.plaqueSize || 96 });
    plaque.userData.tex.needsUpdate = true;
    plaque.position.set(f.x, f.y + P.dy, ROYAL_SET.z + 0.06);
    g.add(pic, plaque);
  }
  const B = ROYAL_SET.banner, banner = textBoard(2048, Math.round(2048 * B.h / B.w), B.w, B.h);
  {
    const { ctx, canvas: c } = banner.userData;
    const bg = ctx.createLinearGradient(0, 0, 0, c.height);
    bg.addColorStop(0, set.banner[0]); bg.addColorStop(1, set.banner[1]);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = '#e8c35a'; ctx.lineWidth = 10; ctx.strokeRect(14, 14, c.width - 28, c.height - 28);
    ctx.fillStyle = '#f3d27a'; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const words = set.words;
    let size = 150;
    do { ctx.font = `800 ${size}px Tajawal, system-ui, sans-serif`; size -= 4; } while (ctx.measureText(words).width > c.width - 140 && size > 60);
    ctx.fillText(words, c.width / 2, c.height / 2 + 10);
    banner.userData.tex.needsUpdate = true;
  }
  banner.position.set(B.x, B.y, B.z != null ? B.z : ROYAL_SET.z - 0.75);
  g.add(banner);
}

function buildTown(town) {
  const L = town.landmark;
  for (let b = 0; b < 4; b++) { const [bx, bz] = tileOf(town, b); bigTiles.set(bx + ',' + bz, town); }
  for (let b = 0; b < 4; b++) paveBlock(town, b);
  for (let b = 4; b < 12; b++) ensureBlock(town, b);
  const cx = (town.ox + 0.5) * BW, cz = (town.oz + 0.5) * BD;
  const g = new THREE.Group();
  g.position.set(cx, 0.3, cz);
  const building = new THREE.Mesh(bake(L), houseMat);
  building.castShadow = building.receiveShadow = true;
  const cloth = bigFlagCloth(town.code);
  cloth.position.set(L.flag.x, L.flag.y, L.flag.z);
  if (LM_OFF) {
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
  label.position.set(0, L.top + 6 + (town.code === 'JO' ? 26 : 0), 0);
  const lit = L.floodlight || { color: '#ffc978', at: [0, 14, 16] };
  const light = new THREE.PointLight(lit.color, 0, 80, 1);
  light.position.set(...lit.at);
  floodlights.push(light);
  g.add(building, cloth, label, light);
  if (town.code === 'JO') buildRoyal(g);
  if (town.code === 'SA') buildRoyal(g, SAUDI_PORTRAITS);
  if (L.lights) {
    const fx = L.lights();
    g.add(fx.group);
    townFx.push(...fx.mats);
    if (fx.update) { fx.update(0); if (!reducedMotion) spinners.push((now) => fx.update(now / 1000)); }
  }
  g.userData.entry = { lm: { type: 'town', name: 'حارة ' + town.name }, town, height: L.top * 0.6, x: cx, z: cz };
  scene.add(g);
  landmarkGroups.push(g);
  town.group = g;
}

// ------------------------------------------------------------------ highways
const HIGHWAY_W = 16;
let highwayMesh = null, highwayAt = 0;
const highwaySigns = HIGHWAYS.map(() => { const s = textSprite(null, 640, 120, 15); scene.add(s); return s; });
let areas = [];

function highwayEnds(from, to) {
  const A = townFor(from), B = townFor(to);
  if (A.oz === B.oz) {
    const dir = Math.sign(B.ox - A.ox), z = (A.oz - 0.5) * BD;
    return {
      dir, alongX: true, z0: z, z1: z,
      x0: (dir > 0 ? A.bounds[1] + 0.5 : A.bounds[0] - 0.5) * BW,
      x1: (dir > 0 ? B.bounds[0] - 0.5 : B.bounds[1] + 0.5) * BW,
    };
  }
  const dir = Math.sign(B.oz - A.oz), x = (A.ox - 0.5) * BW;
  return {
    dir, alongX: false, x0: x, x1: x,
    z0: (dir > 0 ? A.bounds[3] + 0.5 : A.bounds[2] - 0.5) * BD,
    z1: (dir > 0 ? B.bounds[2] - 0.5 : B.bounds[3] + 0.5) * BD,
  };
}

function highwayModel(g, s) {
  const len = Math.abs(s.alongX ? s.x1 - s.x0 : s.z1 - s.z0), cx = (s.x0 + s.x1) / 2, cz = (s.z0 + s.z1) / 2;
  const piece = (color, u, v, y, lu, lv, h) => kitBox(g, color, s.alongX ? cx + u : cx + v, y, s.alongX ? cz + v : cz + u, s.alongX ? lu : lv, h, s.alongX ? lv : lu);
  piece('#3a3d44', 0, 0, 0.02, len, HIGHWAY_W, 0.12);
  for (const v of [-1, 1]) piece('#ecebe4', 0, v * (HIGHWAY_W / 2 - 0.5), 0.14, len, 0.18, 0.01);
  piece('#d6d1c4', 0, 0, 0.14, len, 0.7, 0.55);
  for (let u = -len / 2 + 6; u < len / 2 - 4; u += 10) for (const v of [-3.7, 3.7]) piece('#ecebe4', u, v, 0.14, 3.2, 0.16, 0.01);
  for (let u = -len / 2 + 18; u < len / 2 - 10; u += 36) {
    piece('#8a8f98', u, 0, 0.69, 0.18, 0.18, 7.2);
    piece('#8a8f98', u, 0, 7.8, 0.12, 5.0, 0.12);
    for (const v of [-2.4, 2.4]) piece('#f6d77a', u, v, 7.45, 0.9, 0.5, 0.3);
  }
  let n = 0;
  const onSomeLand = (x, z) => TOWNS.some((t) => inPolygon(t.land, x, z));
  for (let u = -len / 2 + 9; u < len / 2 - 6; u += 15) for (const v of [-1, 1]) {
    const off = v * (HIGHWAY_W / 2 + 3.5 + (n % 3) * 0.8), x = s.alongX ? cx + u : cx + off, z = s.alongX ? cz + off : cz + u;
    if (!onSomeLand(x, z) && Math.floor((u + len) / 15) % 6) { n++; continue; }
    kitTree(g, x, z, 1.1 + (n % 4) * 0.12, ['cypress', 'olive', 'cypress', 'round'][n++ % 4]);
  }
}

function highwayPieces(s, a, b) {
  if (a !== SWORD.on[0] || b !== SWORD.on[1] || s.alongX) return [s];
  const lo = Math.min(s.z0, s.z1), hi = Math.max(s.z0, s.z1);
  if (SWORD.z - SWORD.r <= lo || SWORD.z + SWORD.r >= hi) return [s];
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
  segs.forEach((s, n) => {
    const sign = highwaySigns[n];
    pill(sign.userData.ctx, 640, 120, 'إلى حارة ' + s.to.name, '#2f7d5b', '#ffffff', 60, 'rtl');
    sign.userData.tex.needsUpdate = true;
    sign.position.set(s.x0 + (s.alongX ? s.dir * 30 : 0), 11, s.z0 + (s.alongX ? 0 : s.dir * 30));
  });
  areas = TOWNS.map((t) => [(t.bounds[0] - 0.5) * BW, (t.bounds[1] + 0.5) * BW, (t.bounds[2] - 0.5) * BD, (t.bounds[3] + 0.5) * BD]);
  for (const s of segs) areas.push([Math.min(s.x0, s.x1) - 12, Math.max(s.x0, s.x1) + 12, Math.min(s.z0, s.z1) - 12, Math.max(s.z0, s.z1) + 12]);
  areas.push([SWORD.x - SWORD.r - 6, SWORD.x + SWORD.r + 6, SWORD.z - SWORD.r - 6, SWORD.z + SWORD.r + 6]);
  areas.push(...railAreas);
  areas.push([RUM.x - RUM.w / 2, RUM.x + RUM.w / 2, RUM.z - RUM.d / 2, RUM.z + RUM.d / 2]);
  areas.push([BOSRA.x - BOSRA.w / 2, BOSRA.x + BOSRA.w / 2, BOSRA.z - BOSRA.d / 2, BOSRA.z + BOSRA.d / 2]);
  areas.push([ABDALI.x - ABDALI.w / 2, ABDALI.x + ABDALI.w / 2, ABDALI.z - ABDALI.d / 2, ABDALI.z + ABDALI.d / 2]);
  areas.push(...AIRPORTS.map(airRect));
  areas.push(...airRoadAreas);
  areas.push(...noriaAreas);
  layHighwayTraffic(segs);
  buildBorders(segs);
}

// ------------------------------------------------------------------ borders
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
const ownLand = { JO: [[RUM.x - RUM.w / 2, RUM.x + RUM.w / 2, RUM.z - RUM.d / 2, RUM.z + RUM.d / 2]] };
let borderGroup = null;
const crossingFlags = new Map();

function buildBorders(segs) {
  if (borderGroup) {
    scene.remove(borderGroup);
    borderGroup.traverse((o) => { if (o.userData.own) o.geometry.dispose(); if (o.isSprite) { o.material.map.dispose(); o.material.dispose(); } });
  }
  borderGroup = new THREE.Group();
  const crossAt = (s, poly, last) => {
    let best = null;
    for (let i = 0; i < poly.length; i++) {
      const [ax, az] = poly[i], [bx, bz] = poly[(i + 1) % poly.length];
      let u, v;
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
  for (const q of gates) {
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
    const uc = (cx - a[0]) * dx + (cz - a[1]) * dz;
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
let railAreas = [];
const trains = [];

function trainSmoke(train, length) {
  const N = 34, DT = 0.065, LIFE = N * DT;
  const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1),
    new THREE.MeshLambertMaterial({ color: '#eceae6', transparent: true, opacity: 0.72, flatShading: true, depthWrite: false }), N);
  mesh.frustumCulled = false;
  mesh.raycast = () => {};
  scene.add(mesh);
  const born = new Float64Array(N).fill(-1e9), from = Array.from({ length: N }, () => new THREE.Vector3());
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3();
  const ahead = length / 2 - 1.2;
  let last = null;
  const was = new THREE.Vector3();
  return (sec) => {
    const t = train.mesh, n = Math.floor(sec / DT);
    if (last === null || n < last || n - last > N) last = n - N;
    for (let k = last + 1; k <= n; k++) {
      const i = ((k % N) + N) % N, th = t.rotation.y;
      const moving = t.position.distanceToSquared(was) > 0.0004;
      if (!moving && k % 5) { born[i] = -1e9; continue; }
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
        p.set(from[i].x + age * (1.8 + age * 0.6) + Math.sin(born[i] * 5.1) * 0.5 * u, from[i].y + age * 2.2, from[i].z + age * 0.9 + Math.cos(born[i] * 6.7) * 0.5 * u);
        m4.compose(p, q, sc.set(r, r * 0.85, r));
      }
      mesh.setMatrixAt(i, m4);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };
}

function buildRailway(lm) {
  const [sx, sz] = tileOf(SYRIA, lm.block);
  const LB = townFor('LB'), IQ = townFor('IQ'), JO = townFor('JO');
  const zEW = (sz - 0.5) * BD, xNS = (sx - 0.5) * BW;
  const xLB = (LB.ox + 0.5) * BW - 34, xIQ = (IQ.ox + 0.5) * BW + 34;
  const z0 = sz * BD - 6.5, zJO = (JO.oz - 0.5) * BD;
  const posts = (from, to, step) => {
    const out = [];
    for (let k = Math.ceil(from / step + 0.5); (k - 0.5) * step < to; k++) out.push((k - 0.5) * step - from);
    return out;
  };
  const mesh = new THREE.Mesh(bake((g) => {
    viaduct(g, [xLB, zEW], [xIQ, zEW], posts(xLB, xIQ, BW));
    viaduct(g, [xNS, z0], [xNS, zJO], posts(z0, zJO, BD), { ends: [true, true] });
    railPlatform(g, [xLB, zEW], 0, 1, 31, { side: -1 });
    railPlatform(g, [xIQ, zEW], 0, -31, -1, { side: -1 });
    railPlatform(g, [xNS, zJO], -Math.PI / 2, -31, -1, { side: -1 });
    bufferStop(g, xLB, zEW, -Math.PI / 2);
    bufferStop(g, xIQ, zEW, Math.PI / 2);
    bufferStop(g, xNS, zJO, 0);
  }), houseMat);
  mesh.castShadow = mesh.receiveShadow = true;
  scene.add(mesh);
  const sign = (text, x, z) => {
    const s = textSprite(null, 512, 112, 11);
    pill(s.userData.ctx, 512, 112, text, '#2f6b4f', '#ffffff', 58, 'rtl');
    s.userData.tex.needsUpdate = true;
    s.position.set(x, RAIL + 7, z);
    scene.add(s);
  };
  sign('محطة بيروت', xLB + 16, zEW);
  sign('محطة بغداد', xIQ - 16, zEW);
  sign('محطة عمّان', xNS, zJO - 16);
  railAreas = [[xLB - 10, xIQ + 10, zEW - 12, zEW + 12], [xNS - 12, xNS + 12, z0 - 10, zJO + 10]];
  ownLand.LB = [[xLB - 2, xLB + 34, zEW - 6, zEW + 6]];
  ownLand.IQ = [[xIQ - 34, xIQ + 2, zEW - 6, zEW + 6]];

  const run = (n, stops, axis, fixed, speed = 15, dwell = 9) => {
    let length = 0;
    const m = new THREE.Mesh(bake((g) => { length = trainModel(g, n); }), houseMat);
    m.castShadow = true;
    m.raycast = () => {};
    if (axis === 'z') m.rotation.y = -Math.PI / 2;
    scene.add(m);
    const legs = [];
    const path = [...stops, ...stops.slice(1, -1).reverse()];
    let t = 0;
    for (let i = 0; i < path.length; i++) {
      const a = path[i], b = path[(i + 1) % path.length], move = Math.abs(b - a) / speed + 6;
      legs.push({ a, b, t0: t, t1: t + dwell, t2: t + dwell + move });
      t += dwell + move;
    }
    const at = (sec) => {
      const T = ((sec % t) + t) % t;
      for (const L of legs) {
        if (T < L.t1) return L.a;
        if (T < L.t2) { const u = (T - L.t1) / (L.t2 - L.t1), k = u * u * u * (u * (u * 6 - 15) + 10); return L.a + (L.b - L.a) * k; }
      }
      return path[0];
    };
    const train = { mesh: m, set(sec) { const v = at(sec); if (axis === 'x') m.position.set(v, RAIL, fixed); else m.position.set(fixed, RAIL, v); } };
    train.set(0);
    trains.push(train);
    if (!reducedMotion) {
      spinners.push((now) => train.set(now / 1000));
      const smoke = trainSmoke(train, length);
      spinners.push((now) => smoke(now / 1000));
    }
    return train;
  };
  const main = run(3, [xLB + 16, sx * BW, xIQ - 16], 'x', zEW);
  run(2, [sz * BD + 1.5, zJO - 16], 'z', xNS);
  if (titles.train) {
    const tag = titlePill(`🚂 السائق ${handle(titles.train)}`, '#2f6b4f', 12);
    tag.position.set(0, 6.6, 0);
    main.mesh.add(tag);
  }
}

// ------------------------------------------------------------------ weekly draw's titles & fleet
let titles = { police: {} };
const handle = (u) => '\u200E@' + u + '\u200E';
function titlePill(text, bg, scaleX) {
  const s = textSprite(null, 640, 112, scaleX);
  pill(s.userData.ctx, 640, 112, text, bg, '#ffffff', 56, 'rtl');
  s.userData.tex.needsUpdate = true;
  s.renderOrder = 3;
  return s;
}

let bannerPlane = null;
function buildPlane(name) {
  const g = new THREE.Group();
  const body = new THREE.Group();
  const red = '#d63a3a', white = '#f4f4f0';
  solid(body, box, white, 0, 0, 0, 3.6, 0.8, 0.8);
  solid(body, box, red, 0.2, 0.05, 0, 3.0, 0.22, 0.84);
  solid(body, box, '#7fa8bf', 0.9, 0.38, 0, 0.8, 0.3, 0.62);
  solid(body, box, red, 0.4, 0.42, 0, 1.0, 0.08, 6.2);
  solid(body, box, white, -1.6, 0.1, 0, 0.6, 0.08, 2.2);
  solid(body, box, red, -1.65, 0.55, 0, 0.55, 0.9, 0.08);
  solid(body, box, '#3e4750', 1.86, 0, 0, 0.14, 0.3, 0.3);
  const prop = solid(body, box, '#2b2d33', 1.96, 0, 0, 0.06, 1.7, 0.16);
  body.scale.setScalar(2.6);
  body.position.x = 3.6;
  g.add(body);
  const BW_ = 22, BH_ = 3.4, gap = 6;
  solid(g, box, '#5d5d65', -1.8 - gap / 2, 0, 0, gap, 0.04, 0.04).castShadow = false;
  const cloth = textBoard(1536, Math.round(1536 * BH_ / BW_), BW_, BH_, { side: THREE.FrontSide });
  const { ctx, canvas: c } = cloth.userData;
  ctx.fillStyle = '#fffaf0'; ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#e1306c'; ctx.fillRect(0, 0, c.width, 16); ctx.fillRect(0, c.height - 16, c.width, 16);
  ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1d2433';
  const text = `🎉 ${handle(name)} · رابح قرعة حارتنا`;
  let f = 150;
  do { ctx.font = `800 ${f}px Tajawal, system-ui, sans-serif`; f -= 4; } while (ctx.measureText(text).width > c.width - 80 && f > 30);
  ctx.fillText(text, c.width / 2, c.height / 2 + 8);
  cloth.userData.tex.needsUpdate = true;
  cloth.position.set(-1.8 - gap - BW_ / 2, -0.2, 0);
  const back = cloth.clone();
  back.rotation.y = Math.PI;
  g.add(cloth, back);
  g.traverse((m) => { if (m.isMesh) m.raycast = () => {}; });
  scene.add(g);
  const R = 170, H = 70, SPEED = 0.04;
  const set = (sec) => {
    const a = sec * SPEED;
    g.position.set(Math.cos(a) * R, H + Math.sin(a * 3) * 1.5, Math.sin(a) * R);
    g.rotation.y = -a - Math.PI / 2;
    body.rotation.x = -0.18;
    prop.rotation.x = sec * 40;
    cloth.position.y = back.position.y = -0.2 + Math.sin(sec * 2.3) * 0.12;
  };
  set(0);
  if (!reducedMotion) spinners.push((now) => set(now / 1000));
  bannerPlane = { group: g, set };
}

const DEFAULT_PLANES = ['', 'LB', 'JO', 'IQ', 'MA', 'EG'].map((t, i) => ({ id: i + 1, town: t, owner: '', text: '', active: true }));
const FLEET_LIVERY = { '': 'syrianair', JO: 'rj', LB: 'mea', IQ: 'iraqi', EG: 'egyptair', SA: 'saudia', PS: 'chamwings', MA: 'emirates', YE: 'qatar' };
const WAIT_TEXT = 'انتظر… من يحصل عليّ ليكون باسمك';

function buildFleet(list) {
  (list || []).forEach((spec, idx) => { if (spec && spec.active !== false) buildFleetPlane(spec, idx); });
}

function buildFleetPlane(spec, idx) {
  const town = townFor(spec.town || ''), cx = (town.ox + 0.5) * BW, cz = (town.oz + 0.5) * BD;
  const g = new THREE.Group(), plane = makePlane(FLEET_LIVERY[spec.town || ''] || 'syrianair');
  g.add(plane);
  const W = 70, H = 9, GAP = 16, TAIL = 24;
  const owner = cleanName(spec.owner);
  const text = String(spec.text || '').trim() || (owner ? `✈️ هذه الطائرة باسم ${handle(owner)}` : '✈️ ' + WAIT_TEXT);
  const c = document.createElement('canvas');
  c.width = 1536; c.height = Math.round(1536 * H / W);
  const ctx = c.getContext('2d');
  ctx.fillStyle = owner ? '#fff6d6' : '#fffaf0'; ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#e1306c'; ctx.fillRect(0, 0, c.width, 22); ctx.fillRect(0, c.height - 22, c.width, 22);
  ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1d2433';
  let f = 190;
  do { ctx.font = `800 ${f}px Tajawal, system-ui, sans-serif`; f -= 4; } while (ctx.measureText(text).width > c.width - 120 && f > 30);
  ctx.fillText(text, c.width / 2, c.height / 2 + 8);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const back = tex.clone(); back.wrapS = THREE.RepeatWrapping; back.repeat.x = -1; back.offset.x = 1; back.needsUpdate = true;
  const geo = new THREE.PlaneGeometry(W, H, 36, 4);
  const front = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, side: THREE.FrontSide }));
  const rear = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: back, side: THREE.BackSide }));
  front.position.x = rear.position.x = -(TAIL + GAP + W / 2);
  solid(g, box, '#5d5d65', -TAIL - GAP / 2, 0, 0, GAP, 0.15, 0.15).castShadow = false;
  g.add(front, rear);
  g.traverse((m) => { if (m.isMesh) m.raycast = () => {}; });
  scene.add(g);
  const pos = geo.attributes.position, base = Float32Array.from(pos.array);
  const flutter = (t) => {
    for (let i = 0; i < pos.count; i++) {
      const u = (base[i * 3] + W / 2) / W, a = 1 - u;
      pos.array[i * 3 + 2] = Math.sin(u * 10 - t * 5.5) * a * 2.2;
      pos.array[i * 3 + 1] = base[i * 3 + 1] + Math.sin(u * 7 - t * 4) * a * 0.8;
    }
    pos.needsUpdate = true;
  };
  const R = 250 + idx * 22, Hh = 105 + (idx % 3) * 16, dir = idx % 2 ? -1 : 1, w = dir * 36 / R, phase = idx * 1.1;
  const set = (sec) => {
    const a = phase + sec * w;
    g.position.set(cx + Math.cos(a) * R, Hh + Math.sin(a * 2) * 3, cz + Math.sin(a) * R);
    g.rotation.y = Math.atan2(-Math.cos(a) * dir, -Math.sin(a) * dir);
    plane.rotation.x = 0.2 * dir;
    flutter(sec);
    plane.userData.lights(sec);
  };
  set(0);
  if (!reducedMotion) spinners.push((now) => set(now / 1000));
}

function buildSword() {
  if (LM_OFF) return;
  const g = new THREE.Group();
  g.position.set(SWORD.x, 0.02, SWORD.z);
  g.scale.setScalar(SWORD_SCALE);
  const base = new THREE.Mesh(bake(swordRoundabout), houseMat);
  base.castShadow = base.receiveShadow = true;
  g.add(base);
  const fx = swordRoundabout.lights();
  fx.group.traverse((m) => { if (m.isMesh) m.raycast = () => {}; });
  g.add(fx.group);
  townFx.push(...fx.mats);
  const lit = swordRoundabout.floodlight, light = new THREE.PointLight(lit.color, 0, 60 * SWORD_SCALE, 1);
  light.position.set(...lit.at);
  floodlights.push(light);
  g.add(light);
  const height = swordRoundabout.top * SWORD_SCALE;
  const label = textSprite(null, 512, 112, 12 / SWORD_SCALE);
  pill(label.userData.ctx, 512, 112, swordRoundabout.label, '#ffffff', '#1d2433', 58, 'rtl');
  label.userData.tex.needsUpdate = true;
  label.position.y = swordRoundabout.top + 3.5 / SWORD_SCALE;
  g.add(label);
  g.userData.entry = { lm: { type: 'sword', name: swordRoundabout.label }, height, x: g.position.x, z: g.position.z };
  scene.add(g);
  const half = ((SWORD_TILES[3] - SWORD_TILES[2] + 1) / 2) * BD, w = ROAD_W_SWORD * SWORD_SCALE, len = half - SWORD.r + 3;
  for (const s of [-1, 1]) {
    const road = new THREE.Mesh(box, lambert('#3a3d44'));
    road.scale.set(w, 0.12, len);
    road.position.set(SWORD.x, 0.06, SWORD.z + s * (half - len / 2));
    road.receiveShadow = true;
    scene.add(road);
  }
  landmarkGroups.push(g);
}

function buildRum() {
  if (LM_OFF) return;
  const g = new THREE.Group();
  g.position.set(RUM.x, 0.02, RUM.z);
  const base = new THREE.Mesh(bake(wadiRum), houseMat);
  base.castShadow = base.receiveShadow = true;
  g.add(base);
  g.add(wadiRum.shells());
  const fx = wadiRum.lights();
  g.add(fx.group);
  townFx.push(...fx.mats);
  const lit = wadiRum.floodlight, light = new THREE.PointLight(lit.color, 0, 60, 1);
  light.position.set(...lit.at);
  floodlights.push(light);
  g.add(light);
  const label = textSprite(null, 640, 112, 16);
  pill(label.userData.ctx, 640, 112, wadiRum.label + ' · الأردن', '#ffffff', '#1d2433', 58, 'rtl');
  label.userData.tex.needsUpdate = true;
  label.position.set(-40, wadiRum.top + 4, -20);
  g.add(label);
  g.userData.entry = { lm: { type: 'rum', name: wadiRum.label }, height: 20, x: RUM.x, z: RUM.z };
  scene.add(g);
  landmarkGroups.push(g);
}

// ------------------------------------------------------------------ airports
const airportList = [];
function airlineNames(L, x, y) {
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    const b = textBoard(1024, 128, 9.6, 1.2);
    const { ctx, canvas: c } = b.userData;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = L.stripe;
    let f = 104;
    do { ctx.font = `800 ${f}px Tajawal, system-ui, sans-serif`; f -= 4; } while (ctx.measureText(L.name).width > c.width - 30 && f > 30);
    ctx.fillText(L.name, c.width / 2, c.height / 2 + 6);
    b.userData.tex.needsUpdate = true;
    b.position.set(x, y, s * 2.08);
    if (s < 0) b.rotation.y = Math.PI;
    b.raycast = () => {};
    g.add(b);
  }
  return g;
}

const haloTex = glowTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)');
function halos(points, color, size) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
  const mat = new THREE.PointsMaterial({ color, size, map: haloTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const p = new THREE.Points(geo, mat);
  p.raycast = () => {};
  p.frustumCulled = false;
  return p;
}

const nightFactor = () => Math.max(0, nightShown);

function planeLights(g) {
  const red = halos([[-6.4, 2.45, -16.0]], '#ff3b30', 3.2), green = halos([[-6.4, 2.45, 16.0]], '#3dff7a', 3.2);
  const strobe = halos([[-6.6, 2.45, -16.3], [-6.6, 2.45, 16.3], [-21.0, 4.2, 0]], '#ffffff', 9);
  const beacon = halos([[-1, 5.95, 0], [-1, 1.5, 0]], '#ff2a1a', 4.5);
  const landing = halos([[3.5, 2.3, -3.2], [3.5, 2.3, 3.2], [12, 1.6, 0]], '#fff4d6', 7);
  const beamGeo = new THREE.ConeGeometry(4.5, 55, 18, 6, true).translate(0, -27.5, 0).rotateZ(Math.PI / 2), col = [];
  for (let i = 0; i < beamGeo.attributes.position.count; i++) { const v = Math.pow(Math.max(0, 1 - beamGeo.attributes.position.getX(i) / 55), 1.6); col.push(v, v, v); }
  beamGeo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const beamMat = new THREE.MeshBasicMaterial({ color: '#fff1cf', vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.set(12.5, 1.8, 0);
  beam.rotation.z = -0.09;
  beam.raycast = () => {};
  g.add(red, green, strobe, beacon, landing, beam);
  return (sec) => {
    const k = nightFactor(), day = 0.25 + 0.75 * k;
    red.material.opacity = green.material.opacity = 0.9 * k;
    const s = ((sec % 1.2) + 1.2) % 1.2;
    strobe.material.opacity = (s < 0.05 || (s > 0.13 && s < 0.18) ? 1 : 0) * day;
    beacon.material.opacity = (((sec + 0.4) % 1.0) < 0.12 ? 1 : 0) * day;
    landing.material.opacity = 0.95 * k;
    beamMat.opacity = 0.16 * k;
  };
}

function makePlane(key) {
  const L = LIVERIES[key], g = new THREE.Group();
  const m = new THREE.Mesh(bake((p) => airliner(p, L)), houseMat);
  m.castShadow = true;
  g.add(m, airlineNames(L, 2.5, 4.55));
  g.traverse((o) => { if (o.isMesh) o.raycast = () => {}; });
  g.userData.lights = planeLights(g);
  return g;
}

function airfieldLights(g) {
  const L = lightSpots(), fixed = [];
  const add = (pts, color, size, strength) => { if (!pts.length) return; const p = halos(pts, color, size); g.add(p); fixed.push([p.material, strength]); };
  add(L.white, '#fff3d2', 3.2, 0.95);
  add(L.green, '#3dff86', 2.6, 0.9);
  add(L.red, '#ff4436', 2.8, 0.9);
  add(L.blue, '#4f8dff', 2.6, 0.95);
  add(L.warm, '#ffe0a0', 14, 0.9);
  add(L.papiW, '#ffffff', 3, 1);
  add(L.papiR, '#ff3b30', 3, 1);
  for (const f of fixed) { townFx.push(f); f[0].opacity = f[1] * nightFactor(); }
  const rabbit = halos([[0, 0, 0]], '#ffffff', 10), obstacle = halos(L.obstacle, '#ff2a1a', 4), beacon = halos([BEACON], '#ffffff', 9);
  g.add(rabbit, obstacle, beacon);
  return (sec) => {
    const k = nightFactor();
    const step = Math.floor(((sec % 0.5) + 0.5) % 0.5 / 0.5 * (L.approach.length + 2));
    rabbit.visible = step < L.approach.length;
    if (rabbit.visible) { const [x, y, z] = L.approach[step]; rabbit.geometry.attributes.position.setXYZ(0, x, y, z); rabbit.geometry.attributes.position.needsUpdate = true; }
    rabbit.material.opacity = k;
    obstacle.material.opacity = k * (Math.sin(sec * 3) > -0.2 ? 0.95 : 0.25);
    const b = ((sec % 2) + 2) % 2;
    beacon.material.color.set(b < 1 ? '#3dff86' : '#ffffff');
    beacon.material.opacity = k * (b % 1 < 0.35 ? 1 : 0.15);
  };
}

const AIR_CYCLE = 76;
const smooth = (u) => u * u * (3 - 2 * u);

function landingAt(t) {
  const z = RUNWAY.z, gy = GROUND_Y;
  if (t < 0 || t >= 40) return null;
  if (t < 16) { const u = t / 16; return { x: -1300 + (RUNWAY.x0 + 70 + 1300) * u, y: gy + 110 * (1 - u), z, yaw: 0, pitch: 0.06 }; }
  if (t < 30) { const u = (t - 16) / 14; return { x: RUNWAY.x0 + 70 + 380 * (1 - (1 - u) * (1 - u)), y: gy, z, yaw: 0, pitch: 0.06 * Math.max(0, 1 - u * 4) }; }
  const u = smooth((t - 30) / 10), xe = RUNWAY.x0 + 450;
  return { x: xe + 30 * Math.sin(u * Math.PI / 2), y: gy, z: z + (TAXI.z - z) * (1 - Math.cos(u * Math.PI / 2)), yaw: -u * Math.PI / 2, pitch: 0 };
}

function takeoffAt(t) {
  const z = RUNWAY.z, gy = GROUND_Y, x0 = RUNWAY.x0 + 30;
  if (t < 0 || t >= 34) return null;
  if (t < 8) { const u = smooth(t / 8); return { x: x0 + 16 * Math.sin(u * Math.PI / 2), y: gy, z: TAXI.z + (z - TAXI.z) * Math.sin(u * Math.PI / 2), yaw: Math.PI / 2 * (1 - u), pitch: 0 }; }
  if (t < 10) return { x: x0 + 16, y: gy, z, yaw: 0, pitch: 0 };
  if (t < 22) { const u = (t - 10) / 12; return { x: x0 + 16 + 400 * u * u, y: gy, z, yaw: 0, pitch: u > 0.85 ? (u - 0.85) * 1.2 : 0 }; }
  const u = (t - 22) / 12;
  return { x: x0 + 416 + 790 * u, y: gy + 170 * u * u + 20 * u, z, yaw: 0, pitch: 0.18 };
}

function placePlane(p, at) {
  p.visible = !!at;
  if (!at) return;
  p.position.set(at.x, at.y, at.z);
  p.rotation.set(0, at.yaw, at.pitch);
}

let airRoadAreas = [];
function buildAirports() {
  if (LM_OFF) return;
  for (const A of AIRPORTS) {
    const g = new THREE.Group();
    g.position.set(A.x, 0.02, A.z);
    g.rotation.y = A.rot;
    const base = new THREE.Mesh(bake((m) => { airportModel(m, A); radarMast(m); }), houseMat);
    base.castShadow = base.receiveShadow = true;
    g.add(base);
    const dish = new THREE.Mesh(bake((m) => m.add(radarDish())), houseMat);
    dish.position.set(RADAR.x, 17.2, RADAR.z);
    g.add(dish);
    GATES.forEach((x, i) => {
      const L = LIVERIES[A.parked[i % A.parked.length]];
      const names = airlineNames(L, 2.5, 4.55);
      names.position.set(x, GROUND_Y, STAND_Z);
      names.rotation.y = -Math.PI / 2;
      g.add(names);
    });
    const S = AIR_SIGN, sign = textBoard(2048, Math.round(2048 * S.h / S.w), S.w, S.h);
    {
      const { ctx, canvas: c } = sign.userData, [bg, fg] = A.sign;
      ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(0, 0, c.width, c.height, 24); ctx.fill();
      ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.direction = 'rtl'; ctx.font = '800 64px Tajawal, system-ui, sans-serif'; ctx.fillText(A.name, c.width / 2, c.height * 0.37);
      ctx.direction = 'ltr'; ctx.font = '700 32px Tajawal, system-ui, sans-serif'; ctx.fillText(A.en, c.width / 2, c.height * 0.76);
      sign.userData.tex.needsUpdate = true;
    }
    sign.position.set(0, S.y, S.z);
    g.add(sign);
    const cloth = bigFlagCloth(A.code || 'SY');
    cloth.position.set(AIR_FLAG.cloth.x, AIR_FLAG.cloth.y, AIR_FLAG.cloth.z);
    cloth.scale.setScalar(0.8);
    g.add(cloth);
    const fx = airportLights();
    g.add(fx.group);
    townFx.push(...fx.mats);
    const light = new THREE.PointLight('#ffe2b0', 0, 120, 1);
    light.position.set(0, 26, 40);
    floodlights.push(light);
    g.add(light);
    const landing = makePlane(A.landing), departing = makePlane(A.takeoff);
    g.add(landing, departing);
    const fieldLights = airfieldLights(g);
    const offset = A.seed * 7;
    const set = (sec) => {
      const t = (((sec + offset) % AIR_CYCLE) + AIR_CYCLE) % AIR_CYCLE;
      placePlane(landing, landingAt(t));
      placePlane(departing, takeoffAt(t - 38));
      landing.userData.lights(sec);
      departing.userData.lights(sec + 0.5);
      fieldLights(sec);
      dish.rotation.y = sec * 1.2;
    };
    set(0);
    if (!reducedMotion) spinners.push((now) => set(now / 1000));
    const label = textSprite(null, 768, 112, 26);
    pill(label.userData.ctx, 768, 112, '✈️ ' + A.name, '#ffffff', '#1d2433', 58, 'rtl');
    label.userData.tex.needsUpdate = true;
    label.position.set(0, 60, 0);
    g.add(label);
    g.userData.entry = { lm: { type: 'airport', name: A.name, t: A.code }, height: 40, x: A.x, z: A.z };
    scene.add(g);
    landmarkGroups.push(g);
    airportList.push({ ...A, group: g, set, landing, departing });
  }
  const D = AIRPORTS[0], dx = D.x + AIR_ROAD.x;
  const J = AIRPORTS[1], jx = J.x - AIR_ROAD.x, jz = J.z - AIR_SIZE.d / 2;
  const legs = [
    [dx, D.z + AIR_SIZE.d / 2, dx, -0.5 * BD - HIGHWAY_W / 2],
    [ALIA_ROAD.x0, ALIA_ROAD.z, jx + 7, ALIA_ROAD.z],
    [jx, ALIA_ROAD.z + 7, jx, jz + 1],
  ];
  setBase(0, 0, 0, 0, 1, 1);
  const road = new THREE.Mesh(bake((g) => {
    for (const [x0, z0, x1, z1] of legs) {
      const alongX = z0 === z1, len = Math.abs(alongX ? x1 - x0 : z1 - z0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      const at = (u, v, y, lu, lv, h, color) => kitBox(g, color, alongX ? cx + u : cx + v, y, alongX ? cz + v : cz + u, alongX ? lu : lv, h, alongX ? lv : lu);
      at(0, 0, 0.02, len + 14, 14, 0.12, '#3a3d44');
      for (let u = -len / 2 + 4; u < len / 2 - 4; u += 8) at(u, 0, 0.14, 4, 0.3, 0.01, '#ecebe4');
      if (len < 40) continue;
      let n = 0;
      for (let u = -len / 2 + 10; u < len / 2 - 6; u += 22) for (const v of [-11, 11]) kitTree(g, alongX ? cx + u : cx + v, alongX ? cz + v : cz + u, 2.4, n++ % 3 === 2 ? 'cypress' : 'palm');
      for (let u = -len / 2 + 20; u < len / 2 - 6; u += 40) {
        at(u, 0, 0.02, 0.18, 0.18, 7.2, '#8a8f98');
        at(u, 0, 7.2, 0.12, 9, 0.12, '#8a8f98');
        for (const v of [-4, 4]) at(u, v, 6.95, 0.5, 0.9, 0.3, '#f6d77a');
        for (const v of [-4.5, 4.5]) part(lampLightPool, lampLightPool.add(), alongX ? cx + u : cx + v, 0.2, alongX ? cz + v : cz + u, 13, 1, 13);
      }
    }
  }), houseMat);
  road.receiveShadow = true;
  scene.add(road);
  airRoadAreas = legs.map(([x0, z0, x1, z1]) => [Math.min(x0, x1) - 14, Math.max(x0, x1) + 14, Math.min(z0, z1) - 14, Math.max(z0, z1) + 14]);
  for (const [text, x, z] of [['✈️ إلى مطار دمشق الدولي', dx, -0.5 * BD - HIGHWAY_W / 2 - 26], ['✈️ إلى مطار الملكة علياء الدولي', ALIA_ROAD.x0 + 30, ALIA_ROAD.z]]) {
    const sign = textSprite(null, 768, 120, 17);
    pill(sign.userData.ctx, 768, 120, text, '#2f7d5b', '#ffffff', 56, 'rtl');
    sign.userData.tex.needsUpdate = true;
    sign.position.set(x, 11, z);
    scene.add(sign);
  }
}

// ------------------------------------------------------------------ bosra
function buildPresident(g) {
  const P = PRESIDENT;
  const frame = new THREE.Mesh(bake(presidentFrame), houseMat);
  frame.castShadow = frame.receiveShadow = true;
  g.add(frame);
  const c = document.createElement('canvas');
  c.width = 560; c.height = Math.round(560 * P.h / P.w);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1c2a22'; ctx.fillRect(0, 0, c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const img = new Image();
  img.onload = () => {
    const k = Math.max(c.width / img.width, c.height / img.height), w = img.width * k, h = img.height * k;
    ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
    tex.needsUpdate = true;
  };
  img.src = IMG('syria-president.jpg');
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(P.w, P.h), new THREE.MeshBasicMaterial({ map: tex }));
  pic.position.set(P.x, P.y, P.z);
  const Q = P.plaque, plaque = textBoard(1280, Math.round(1280 * Q.h / Q.w), Q.w, Q.h);
  drawPlaque(plaque.userData.ctx, plaque.userData.canvas.width, plaque.userData.canvas.height, NAMES['syria-president.jpg'] || Q.text, { bg: '#0f3d2a', fg: '#f6e7b8', size: 104 });
  plaque.userData.tex.needsUpdate = true;
  plaque.position.set(P.x, P.y + Q.dy, P.z + 0.06);
  const B = P.banner, banner = textBoard(2048, Math.round(2048 * B.h / B.w), B.w, B.h);
  {
    const { ctx: b, canvas: bc } = banner.userData;
    const bg = b.createLinearGradient(0, 0, 0, bc.height);
    bg.addColorStop(0, '#13643f'); bg.addColorStop(1, '#0b4129');
    b.fillStyle = bg; b.fillRect(0, 0, bc.width, bc.height);
    b.strokeStyle = '#e8c35a'; b.lineWidth = 10; b.strokeRect(14, 14, bc.width - 28, bc.height - 28);
    b.fillStyle = '#f3d27a'; b.direction = 'rtl'; b.textAlign = 'center'; b.textBaseline = 'middle';
    let size = 150;
    do { b.font = `800 ${size}px Tajawal, system-ui, sans-serif`; size -= 4; } while (b.measureText(B.text).width > bc.width - 160 && size > 60);
    b.fillText(B.text, bc.width / 2, bc.height / 2 + 10);
    banner.userData.tex.needsUpdate = true;
  }
  banner.position.set(B.x, B.y, P.z - 1.15 + 0.3);
  g.add(pic, plaque, banner);
}

function buildSarout(g) {
  const P = SAROUT, s = new THREE.Group();
  const frame = new THREE.Mesh(bake(saroutFrame), houseMat);
  frame.castShadow = frame.receiveShadow = true;
  const c = document.createElement('canvas');
  c.width = 560; c.height = Math.round(560 * P.h / P.w);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1c2a22'; ctx.fillRect(0, 0, c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const img = new Image();
  img.onload = () => {
    const k = Math.max(c.width / img.width, c.height / img.height), w = img.width * k, h = img.height * k;
    ctx.drawImage(img, (c.width - w) / 2, Math.min(0, (c.height - h) * 0.4), w, h);
    tex.needsUpdate = true;
  };
  img.src = IMG('sarout.jpg');
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(P.w, P.h), new THREE.MeshBasicMaterial({ map: tex }));
  pic.position.set(P.x, P.y, P.z);
  const Q = P.plaque, plaque = textBoard(1280, Math.round(1280 * Q.h / Q.w), Q.w, Q.h);
  const QL = NAMES['sarout.jpg'] ? (NAMES['sarout.jpg'].includes('|') ? NAMES['sarout.jpg'].split('|') : ['', NAMES['sarout.jpg']]) : Q.lines;
  {
    const { ctx: b, canvas: bc } = plaque.userData;
    b.fillStyle = '#0f3d2a'; b.beginPath(); b.roundRect(0, 0, bc.width, bc.height, 26); b.fill();
    b.direction = 'rtl'; b.textAlign = 'center'; b.textBaseline = 'middle';
    b.fillStyle = '#ff8a8a'; b.font = '800 96px Tajawal, system-ui, sans-serif';
    b.fillText(QL[0], bc.width / 2, bc.height * 0.3);
    b.fillStyle = '#f6e7b8';
    let size = 124;
    do { b.font = `800 ${size}px Tajawal, system-ui, sans-serif`; size -= 2; } while (b.measureText(QL[1]).width > bc.width - 80 && size > 40);
    b.fillText(QL[1], bc.width / 2, bc.height * 0.68);
    plaque.userData.tex.needsUpdate = true;
  }
  plaque.position.set(P.x, P.y + Q.dy, P.z + 0.06);
  s.add(frame, pic, plaque);
  s.userData.entry = { lm: { type: 'hearts', name: 'الشهيد البطل عبد الباسط الساروت' }, hearts: 'sarout', x: BOSRA.x + P.x, z: BOSRA.z + P.z, y: P.y };
  g.add(s);
}

function buildBosra() {
  for (let b = 1; b < 120; b++) { const [bx, bz] = tileOf(SYRIA, b); if (inBosra(bx, bz)) paveBlock(SYRIA, b); }
  if (LM_OFF) return;
  const g = new THREE.Group();
  g.position.set(BOSRA.x, 0.34, BOSRA.z);
  const base = new THREE.Mesh(bake(bosra), houseMat);
  base.castShadow = base.receiveShadow = true;
  g.add(base);
  const fx = bosra.lights();
  g.add(fx.group);
  townFx.push(...fx.mats);
  if (reducedMotion) fx.update(1.3);
  else spinners.push((now) => fx.update(now / 1000));
  const F = bosra.flag, cloth = bigFlagCloth('SY');
  cloth.position.set(F.x, F.y, F.z);
  cloth.scale.setScalar(F.scale);
  g.add(cloth);
  const lit = bosra.floodlight, light = new THREE.PointLight(lit.color, 0, 70, 1);
  light.position.set(...lit.at);
  floodlights.push(light);
  g.add(light);
  buildPresident(g);
  buildSarout(g);
  const label = textSprite(null, 640, 112, 18);
  pill(label.userData.ctx, 640, 112, bosra.label + ' · سوريا', '#ffffff', '#1d2433', 58, 'rtl');
  label.userData.tex.needsUpdate = true;
  label.position.set(0, PRESIDENT.banner.y + 9, -4);
  g.add(label);
  g.userData.entry = { lm: { type: 'bosra', name: bosra.label }, height: bosra.top, x: BOSRA.x, z: BOSRA.z };
  scene.add(g);
  landmarkGroups.push(g);
}

// ------------------------------------------------------------------ norias, stadium, jeita, abdali
const noriaAreas = [];
function buildNorias(lm) {
  const [x0, x1, z0, z1] = lm.tiles, cx = ((x0 + x1) / 2) * BW, cz = ((z0 + z1) / 2) * BD;
  const g = new THREE.Group();
  g.position.set(cx, 0.02, cz);
  const base = new THREE.Mesh(bake(norias), houseMat);
  base.castShadow = base.receiveShadow = true;
  g.add(base);
  const water = norias.water(), wheels = [];
  g.add(water.group);
  for (const w of NORIA_WHEELS) {
    const m = new THREE.Mesh(bake((wg) => noriaWheel(wg, w)), houseMat);
    m.position.set(w.x, w.yc, w.z);
    m.castShadow = true;
    m.raycast = () => {};
    g.add(m);
    wheels.push({ mesh: m, w });
  }
  water.setWheels(wheels);
  if (reducedMotion) water.update(0);
  else spinners.push((now) => water.update(now / 1000));
  const fx = norias.lights();
  g.add(fx.group);
  townFx.push(...fx.mats);
  const lit = norias.floodlight, light = new THREE.PointLight(lit.color, 0, 70, 1);
  light.position.set(...lit.at);
  floodlights.push(light);
  g.add(light);
  const label = textSprite(null, 640, 112, 18);
  pill(label.userData.ctx, 640, 112, (lm.name || norias.label) + ' · سوريا', '#ffffff', '#1d2433', 58, 'rtl');
  label.userData.tex.needsUpdate = true;
  label.position.set(NORIA_WHEELS[0].x, norias.top + 6, NORIA_WHEELS[0].z);
  g.add(label);
  g.userData.entry = { lm, height: norias.top, x: cx + NORIA_WHEELS[0].x, z: cz };
  const [w, d] = norias.size;
  noriaAreas.push([cx - w / 2, cx + w / 2, cz - d / 2, cz + d / 2]);
  scene.add(g);
  landmarkGroups.push(g);
}

function buildStadium(lm) {
  const [x0, x1, z0, z1] = lm.tiles, cx = ((x0 + x1) / 2) * BW, cz = ((z0 + z1) / 2) * BD;
  const g = new THREE.Group();
  g.position.set(cx, 0.02, cz);
  const base = new THREE.Mesh(bake(stadium), houseMat);
  base.castShadow = base.receiveShadow = true;
  g.add(base);
  g.add(stadium.bowl());
  const match = stadium.match();
  g.add(match.group);
  if (reducedMotion) match.update(0);
  else spinners.push((now) => match.update(now / 1000));
  const fx = stadium.lights();
  g.add(fx.group);
  townFx.push(...fx.mats);
  const lit = stadium.floodlight, light = new THREE.PointLight(lit.color, 0, 120, 1);
  light.position.set(...lit.at);
  floodlights.push(light);
  g.add(light);
  const label = textSprite(null, 640, 112, 20);
  pill(label.userData.ctx, 640, 112, (lm.name || stadium.label) + ' · الأردن', '#ffffff', '#1d2433', 58, 'rtl');
  label.userData.tex.needsUpdate = true;
  label.position.set(0, stadium.top + 4, 0);
  g.add(label);
  g.userData.entry = { lm, height: 30, x: cx, z: cz };
  const [w, d] = stadium.size;
  noriaAreas.push([cx - w / 2, cx + w / 2, cz - d / 2, cz + d / 2]);
  scene.add(g);
  landmarkGroups.push(g);
}

const grottoes = [];
let tour = null;
const TOUR_SPEED = 3.0;
const JEITA_BACK = -9, JEITA_DEEP = -34, JEITA_LAKE = [-10, -27];
const _tp = new THREE.Vector3(), _tt = new THREE.Vector3(), _ta = new THREE.Vector3();

function startTour() {
  const G = grottoes[0];
  if (!G || tour) return;
  showCard(false);
  flight = null;
  tour = { G, t0: performance.now(), dur: (G.water.total / TOUR_SPEED) * 1000, text: '' };
  document.body.classList.add('touring');
  $('#tourBar').hidden = false;
}

function stopTour() {
  if (!tour) return;
  const { G } = tour;
  tour = null;
  G.water.ride.k = null;
  document.body.classList.remove('touring');
  $('#tourBar').hidden = true;
  const e = G.g.userData.entry;
  flyView(e.view[0], e.view[1], 1800);
  toast('🚤 رجعنا عالرصيف · شكراً لزيارتكم مغارة جعيتا', 4000);
}

function tourStep(now) {
  const k = Math.min(1, (now - tour.t0) / tour.dur), text = tourView(tour.G, k);
  if (tour.text !== text) { tour.text = text; $('#tourText').textContent = text; }
  if (k >= 1) stopTour();
}

function tourView(G, k) {
  const W = G.water, at = G.g.position;
  W.ride.k = k;
  W.path.getPointAt(k, _tp); W.path.getTangentAt(k, _ta);
  W.path.getPointAt(Math.min(1, k + 12 / W.total), _tt);
  const inside = _tp.z < JEITA_BACK;
  camera.position.set(at.x + _tp.x - _ta.x * 2.6, 2.95, at.z + _tp.z - _ta.z * 2.6);
  const lean = inside ? 0.45 : 0;
  controls.target.set(at.x + _tt.x + (JEITA_LAKE[0] - _tt.x) * lean, inside ? 5.5 : 2.6, at.z + _tt.z + (JEITA_LAKE[1] - _tt.z) * lean);
  camera.lookAt(controls.target);
  return !inside ? (k < 0.5 ? '🚤 على نهر الكلب… داخلين على المغارة' : '☀️ طالعين من المغارة… راجعين عالرصيف')
    : _tp.z < JEITA_DEEP ? '💧 البحيرة الجوفية تحت الجبل' : '✨ هوابط وصواعد عمرها آلاف السنين';
}

function buildJeita(lm) {
  const [x0, x1, z0, z1] = lm.tiles, cx = ((x0 + x1) / 2) * BW, cz = ((z0 + z1) / 2) * BD;
  const g = new THREE.Group();
  g.position.set(cx, 0.02, cz);
  const base = new THREE.Mesh(bake(jeita), houseMat);
  base.castShadow = base.receiveShadow = true;
  g.add(base);
  g.add(jeita.cave());
  const water = jeita.water();
  water.group.userData.update = water.update;
  grottoes.push({ g, water });
  g.add(water.group);
  if (reducedMotion) water.update(0);
  else spinners.push((now) => water.update(now / 1000));
  const fx = jeita.lights();
  g.add(fx.group);
  townFx.push(...fx.mats);
  const lit = jeita.floodlight, light = new THREE.PointLight(lit.color, 0, 90, 1);
  light.position.set(...lit.at);
  floodlights.push(light);
  g.add(light);
  const F = jeita.flag, cloth = bigFlagCloth('LB');
  cloth.position.set(F.x, F.y, F.z);
  cloth.scale.setScalar(F.scale);
  g.add(cloth);
  const S = jeita.sign, sign = textBoard(1024, Math.round((1024 * S.h) / S.w), S.w, S.h);
  drawPlaque(sign.userData.ctx, sign.userData.canvas.width, sign.userData.canvas.height, 'مغارة جعيتا', { bg: '#3d6b50', fg: '#f6e7b8', size: 70 });
  sign.userData.tex.needsUpdate = true;
  sign.position.set(S.x, S.y, S.z);
  g.add(sign);
  const label = textSprite(null, 640, 112, 22);
  pill(label.userData.ctx, 640, 112, (lm.name || jeita.label) + ' · لبنان', '#ffffff', '#1d2433', 58, 'rtl');
  label.userData.tex.needsUpdate = true;
  label.position.set(-10, jeita.top, -20);
  g.add(label);
  g.userData.entry = {
    lm, height: 40, x: cx - 10, z: cz, tour: true,
    view: [new THREE.Vector3(cx + 55, 75, cz + 150), new THREE.Vector3(cx - 5, 12, cz - 10)],
  };
  const [w, d] = jeita.size;
  noriaAreas.push([cx - w / 2, cx + w / 2, cz - d / 2, cz + d / 2]);
  scene.add(g);
  landmarkGroups.push(g);
}

function buildAbdali() {
  const JO = townOf.get('JO');
  for (let b = 4; b < 1000; b++) { const [bx, bz] = tileOf(JO, b); if (inAbdali(bx, bz)) paveBlock(JO, b); }
  if (LM_OFF) return;
  const g = new THREE.Group();
  g.position.set(ABDALI.x, 0.34, ABDALI.z);
  const base = new THREE.Mesh(bake(abdali), houseMat);
  base.castShadow = base.receiveShadow = true;
  g.add(base);
  const fx = abdali.lights();
  g.add(fx.group);
  townFx.push(...fx.mats);
  if (reducedMotion) fx.update(1.3);
  else spinners.push((now) => fx.update(now / 1000));
  const lit = abdali.floodlight, light = new THREE.PointLight(lit.color, 0, 60, 1);
  light.position.set(...lit.at);
  floodlights.push(light);
  g.add(light);
  const label = textSprite(null, 640, 112, 18);
  pill(label.userData.ctx, 640, 112, abdali.label + ' · الأردن', '#ffffff', '#1d2433', 58, 'rtl');
  label.userData.tex.needsUpdate = true;
  label.position.set(0, abdali.top + 4, 3);
  g.add(label);
  g.userData.entry = { lm: { type: 'abdali', name: abdali.label, t: 'JO' }, height: abdali.top, x: ABDALI.x, z: ABDALI.z };
  scene.add(g);
  landmarkGroups.push(g);
}

// ------------------------------------------------------------------ flags
const FLAG_CDN = 'https://cdn.jsdelivr.net/npm/flag-icons@7.6.0/flags/4x3/';
const flagPlane = new THREE.PlaneGeometry(1, 1);
const polePool = new Pool(cyl, lambert('#eef1f4'));
poolList.push(polePool);
const flags = new Map();
let countryNames = {};

function flagFor(code) {
  let f = flags.get(code);
  if (f) return f;
  const c = document.createElement('canvas');
  c.width = 128; c.height = 96;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#dfe3ea';
  ctx.fillRect(0, 0, c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const pool = new Pool(flagPlane, new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }), { cast: false });
  poolList.push(pool);
  f = { pool };
  flags.set(code, f);
  fetch(FLAG_CDN + code.toLowerCase() + '.svg')
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error('no flag'))))
    .then((svg) => {
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0, c.width, c.height); tex.needsUpdate = true; f.loaded = true; flagSquareDirty = true; };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace('<svg ', '<svg width="640" height="480" '));
    })
    .catch(() => {});
  return f;
}

function hidePart(pool, idx) {
  _out.makeScale(0, 0, 0);
  pool.mesh.setMatrixAt(idx, _out);
  pool.dirty = true;
}

function setCountry(rec, code) {
  code = /^[A-Z]{2}$/.test(code || '') ? code : '';
  if (rec.country === code) return;
  flagSquareDirty = true;
  if (rec.flag) hidePart(rec.flag.pool, rec.flag.idx);
  rec.flag = null;
  rec.country = code;
  if (code) {
    const pool = flagFor(code).pool;
    rec.flag = { pool, idx: pool.add() };
    if (rec.pole == null) rec.pole = polePool.add();
  } else if (rec.pole != null) {
    hidePart(polePool, rec.pole);
  }
  if (rec.s != null) writeHouse(rec, rec.s);
  if (rec === selected) showHouseCard(rec);
}

// ------------------------------------------------------------------ houses
const MODEL_SCALE = 0.93;
const houseMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
const nightU = { value: 0 };

houseMat.onBeforeCompile = (sh) => {
  sh.uniforms.uNight = nightU;
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', '#include <common>\nattribute float glow;\nvarying float vGlow;')
    .replace('#include <begin_vertex>', `#include <begin_vertex>
      vGlow = glow;
      #ifdef USE_INSTANCING
        float houseLuck = fract(sin(float(gl_InstanceID) * 12.9898 + 4.1) * 43758.5453);
        if (glow <= 1.0) vGlow = glow * (houseLuck < 0.18 ? 0.25 : 0.7 + 0.3 * houseLuck);
      #endif`);
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>', '#include <common>\nuniform float uNight;\nvarying float vGlow;')
    .replace('#include <opaque_fragment>', `if (vGlow > 0.001 && uNight > 0.001) {
        if (vGlow < 1.5) outgoingLight = mix(outgoingLight, vec3(1.0, 0.64, 0.28) * (0.35 + 0.8 * vGlow), uNight * min(1.0, vGlow + 0.2));
        else outgoingLight = mix(outgoingLight, diffuseColor.rgb * (vGlow - 1.3), uNight * 0.9);
      }
      #include <opaque_fragment>`);
};

carPools = CAR_COLORS.map((color) => {
  const p = new Pool(bake((g) => carModel(g, 0, 0, color)), houseMat);
  poolList.push(p);
  return p;
});

const models = new Map();
function modelFor(kind, spec, look) {
  const key = kind + '/' + look;
  let m = models.get(key);
  if (!m) {
    const build = spec.build || spec;
    m = {
      near: new Pool(bake(build, spec.looks[look], false), houseMat, { receive: true }),
      far: new Pool(bake(build, spec.looks[look], true), houseMat, { cast: false }),
      owners: [],
      top: spec.top, flag: spec.flag,
    };
    poolList.push(m.near, m.far);
    models.set(key, m);
  }
  return m;
}

const VILLA_PREVIEW = (() => { const q = new URLSearchParams(location.search); return new Set(q.has('debug') && q.get('villa') ? q.get('villa').toLowerCase().split(',') : []); })();
const houses = [];
const byName = new Map();
const growing = [];
const tileRecs = new Map();

function addHouse(username, level, delay, country, townCode, isVilla = false) {
  const i = houses.length;
  const town = townFor(townCode);
  if (!username) {
    if (level) plotOf(town, town.count++);
    houses.push(null);
    return null;
  }
  const plot = plotOf(town, town.count++);
  ensureBlock(town, plot.b);
  paveBlock(town, plot.b);
  const h = hash(username.toLowerCase());
  let model;
  level = Math.max(1, Math.min(MAX_LEVEL, level || 1));
  if (isVilla || VILLA_PREVIEW.has(username.toLowerCase())) {
    model = modelFor('villa', villa, h % villa.looks.length);
  } else if (level === MAX_LEVEL) {
    model = modelFor('tower', tower, h % tower.looks.length);
  } else if (town.code) {
    const spec = level === 1 ? town.house : onFloors(town.house, level - 1);
    model = modelFor(town.code + level, spec, h % town.house.looks.length);
  } else {
    const spec = HOUSE_LEVELS[level - 1];
    model = modelFor(level, spec, h % spec.looks.length);
  }
  const rec = {
    i, username, level, villa: !!isVilla || VILLA_PREVIEW.has(username.toLowerCase()), town, x: plot.x, z: plot.z, rot: plot.rot,
    model, far: model.far.add(), near: -1, top: model.top * MODEL_SCALE,
    country: '', flag: null, pole: null, s: null,
  };
  if (country) setCountry(rec, country);
  houses.push(rec);
  town.live = (town.live || 0) + 1;
  const tile = plot.bx + ',' + plot.bz;
  if (!tileRecs.has(tile)) tileRecs.set(tile, []);
  tileRecs.get(tile).push(rec);
  byName.set(username.toLowerCase(), rec);
  if (delay == null || reducedMotion) writeHouse(rec, 1);
  else { writeHouse(rec, 0); growing.push({ rec, t0: performance.now() + delay }); }
  return rec;
}

function writeHouse(r, s) {
  r.s = s;
  const m = r.model;
  setBase(r.x, BASE_Y, r.z, r.rot, (0.55 + 0.45 * s) * MODEL_SCALE, Math.max(s, 0.0001) * MODEL_SCALE);
  if (r.near >= 0) {
    m.near.mesh.setMatrixAt(r.near, _base);
    m.near.dirty = true;
    m.far.mesh.setMatrixAt(r.far, _out.makeScale(0, 0, 0));
  } else {
    m.far.mesh.setMatrixAt(r.far, _base);
  }
  m.far.dirty = true;
  if (r.flag) {
    const [fx, fy, fz] = m.flag;
    part(polePool, r.pole, fx, fy + 1.5, fz, 0.07, 3.0, 0.07);
    part(r.flag.pool, r.flag.idx, fx + 1.05, fy + 2.3, fz, 2.0, 1.4, 1);
  }
}

const nearSet = new Set();
const NEAR_BLOCKS = matchMedia('(pointer: coarse)').matches ? 2 : 3;
const NEAR_DISTANCE = 330;

function setNear(rec, on) {
  if (on === (rec.near >= 0)) return;
  const m = rec.model;
  if (on) {
    rec.near = m.near.add();
    m.owners[rec.near] = rec;
    nearSet.add(rec);
  } else {
    const last = m.near.count - 1, moved = m.owners[last];
    if (moved !== rec) {
      m.near.mesh.getMatrixAt(last, _out);
      m.near.mesh.setMatrixAt(rec.near, _out);
      moved.near = rec.near;
      m.owners[rec.near] = moved;
    }
    m.owners.length = last;
    m.near.drop();
    rec.near = -1;
    nearSet.delete(rec);
  }
  writeHouse(rec, rec.s);
}

function updateDetail() {
  const t = controls.target;
  const want = new Set(camera.position.distanceTo(t) < NEAR_DISTANCE ? nearbyHouses(t.x, t.z, NEAR_BLOCKS) : []);
  for (const rec of [...nearSet]) if (!want.has(rec)) setNear(rec, false);
  for (const rec of want) setNear(rec, true);
}

function tagY(rec) {
  const roof = rec.flag ? Math.max(rec.top, (rec.model.flag[1] + 3.0) * MODEL_SCALE) : rec.top;
  return BASE_Y + roof + 1.1;
}

const easeOutBack = (t) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);

const padMat = new THREE.MeshBasicMaterial({ color: '#ffd23f', transparent: true, opacity: 0.5 });
function makeNextSign(text) {
  const sign = new THREE.Group();
  const post = new THREE.Mesh(box, lambert('#8a5a3a'));
  post.scale.set(0.18, 2.4, 0.18); post.position.y = 1.2;
  const label = textSprite(null, 512, 128, 7);
  pill(label.userData.ctx, 512, 128, text, '#e1306c', '#ffffff', 60, 'rtl');
  label.userData.tex.needsUpdate = true;
  label.position.y = 3.3;
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), padMat);
  pad.rotation.x = -Math.PI / 2; pad.position.y = 0.03;
  sign.add(post, label, pad);
  scene.add(sign);
  return sign;
}

const nextSign = makeNextSign('بيتك هون؟ 🏠');
for (const t of TOWNS) t.sign = t.code ? makeNextSign(`علّق «${t.name}» 🏠`) : nextSign;

function placeNextSign() {
  for (const t of TOWNS) {
    const plot = plotOf(t, t.count);
    ensureBlock(t, plot.b);
    t.sign.position.set(plot.x, BASE_Y, plot.z);
  }
}

// ------------------------------------------------------------------ labels
const LABELS = 26;
const labels = [];
for (let i = 0; i < LABELS; i++) {
  const s = textSprite(null, 384, 96, 5.4);
  s.visible = false;
  s.userData.rec = null;
  scene.add(s);
  labels.push(s);
}
let selected = null;

function nearbyHouses(x, z, radius) {
  const out = [];
  const cbx = Math.round(x / BW), cbz = Math.round(z / BD);
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dz = -radius; dz <= radius; dz++) {
      const list = tileRecs.get((cbx + dx) + ',' + (cbz + dz));
      if (list) out.push(...list);
    }
  }
  return out;
}

function drawLabel(sprite, rec) {
  const { ctx, canvas: c, tex } = sprite.userData;
  const on = rec === selected;
  const bd = hzShop ? hzShop.badgeOf(rec.username) : '';
  pill(
    ctx, c.width, c.height,
    '@' + rec.username + (bd ? ' ✔' : ''),
    on ? '#e1306c' : bd === 'gold' ? '#f5b800' : bd === 'blue' ? '#1d9bf0' : 'rgba(255,255,255,.94)',
    on ? '#ffffff' : bd === 'gold' ? '#3a2a00' : bd === 'blue' ? '#ffffff' : '#1d2433',
    44
  );
  tex.needsUpdate = true;
  sprite.userData.rec = rec;
  sprite.userData.on = on;
  sprite.position.set(rec.x, tagY(rec), rec.z);
  sprite.renderOrder = on ? 2 : 1;
  sprite.visible = true;
}

function updateLabels() {
  const t = controls.target;
  let want = [];
  if (camera.position.distanceTo(t) < 150) {
    const cx = camera.position.x, cz = camera.position.z;
    want = nearbyHouses(t.x, t.z, 2).filter((rec) => rec.s > 0.5 && (rec.x - cx) ** 2 + (rec.z - cz) ** 2 > 14 * 14);
    want.sort((a, b) => ((a.x - t.x) ** 2 + (a.z - t.z) ** 2) - ((b.x - t.x) ** 2 + (b.z - t.z) ** 2));
    want.length = Math.min(want.length, LABELS);
  }
  if (selected && !want.includes(selected)) { want.unshift(selected); want.length = Math.min(want.length, LABELS); }
  const wanted = new Set(want);
  const shown = new Set();
  const free = [];
  for (const s of labels) {
    const rec = s.userData.rec;
    if (rec && wanted.has(rec)) {
      shown.add(rec);
      if (s.userData.on !== (rec === selected)) drawLabel(s, rec);
    } else { s.visible = false; s.userData.rec = null; free.push(s); }
  }
  for (const rec of want) if (!shown.has(rec) && free.length) drawLabel(free.pop(), rec);
}

// ------------------------------------------------------------------ selection & camera
const marker = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.8, 4), new THREE.MeshBasicMaterial({ color: '#e1306c' }));
marker.rotation.x = Math.PI;
marker.visible = false;
scene.add(marker);

let flight = null;
let liftY = 2, liftDist = 1;
function setLift(p, t) { liftY = t.y; liftDist = Math.max(1, p.distanceTo(t)); }

function flyView(toP, toT, dur = 1400) {
  flight = {
    t0: performance.now(), dur: reducedMotion ? 1 : dur,
    fromP: camera.position.clone(), fromT: controls.target.clone(), toP, toT,
  };
  setLift(toP, toT);
  controls.autoRotate = false;
}

function flyTo(x, z, height, front) {
  flyView(
    new THREE.Vector3(x + 10 + height * 0.5, 14 + height * 0.7, z + front * (24 + height * 1.3)),
    new THREE.Vector3(x, 2 + height * 0.42, z),
  );
}

const held = new Set();
const KEYS = {
  ArrowUp: 'fwd', KeyW: 'fwd', ArrowDown: 'back', KeyS: 'back',
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  KeyQ: 'rotL', KeyE: 'rotR',
  Equal: 'in', NumpadAdd: 'in', Minus: 'out', NumpadSubtract: 'out',
};
const _off = new THREE.Vector3(), _fwd = new THREE.Vector3(), _side = new THREE.Vector3();
const on = (a) => (held.has(a) ? 1 : 0);

function steer(dt) {
  if (!held.size) return;
  const t = controls.target;
  _off.subVectors(camera.position, t);
  const dist = _off.length();
  _fwd.set(-_off.x, 0, -_off.z);
  if (_fwd.lengthSq() < 1e-6) _fwd.set(0, 0, -1);
  _fwd.normalize();
  _side.set(-_fwd.z, 0, _fwd.x);
  const step = Math.max(14, dist * 0.5) * dt;
  _p.set(0, 0, 0)
    .addScaledVector(_fwd, (on('fwd') - on('back')) * step)
    .addScaledVector(_side, (on('right') - on('left')) * step);
  t.add(_p);
  camera.position.add(_p);
  const turn = (on('rotL') - on('rotR')) * 1.5 * dt;
  const zoom = on('in') - on('out');
  if (turn || zoom) {
    _off.subVectors(camera.position, t);
    if (turn) _off.applyAxisAngle(UP, turn);
    if (zoom) _off.setLength(THREE.MathUtils.clamp(_off.length() * Math.exp(-zoom * 1.6 * dt), controls.minDistance, controls.maxDistance));
    camera.position.copy(t).add(_off);
  }
}

function pullIntoCity(v) {
  let best = null, bestD = Infinity;
  for (const [x0, x1, z0, z1] of areas) {
    const dx = THREE.MathUtils.clamp(v.x, x0, x1) - v.x, dz = THREE.MathUtils.clamp(v.z, z0, z1) - v.z;
    const d = dx * dx + dz * dz;
    if (!d) return null;
    if (d < bestD) { bestD = d; best = [dx, dz]; }
  }
  if (!best) return null;
  v.x += best[0]; v.z += best[1];
  return best;
}

function keepInCity() {
  const t = controls.target;
  if (flight || camera.position.y > 1500) return;
  const moved = pullIntoCity(t);
  if (moved) { camera.position.x += moved[0]; camera.position.z += moved[1]; }
  const k = THREE.MathUtils.smoothstep(camera.position.distanceTo(t), liftDist * 0.35, liftDist * 0.8);
  t.y += (2 + (liftY - 2) * k - t.y) * 0.1;
}

function zoomAt(point) {
  _off.subVectors(camera.position, controls.target);
  _off.setLength(Math.max(controls.minDistance + 14, _off.length() * 0.45));
  const toT = new THREE.Vector3(point.x, 2, point.z);
  pullIntoCity(toT);
  flyView(toT.clone().add(_off), toT, 700);
}

function goHome() {
  for (const o of document.querySelectorAll('#towns [data-town]')) o.classList.remove('on');
  const view = homeView();
  flyView(view.p, view.t, 1100);
}

addEventListener('keydown', (e) => {
  const action = KEYS[e.code];
  if (!action || e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  if ($('#reels').classList.contains('show') || $('#shop').classList.contains('show') || $('#support').classList.contains('show')) return;
  e.preventDefault();
  takeOver();
  held.add(action);
});
addEventListener('keyup', (e) => held.delete(KEYS[e.code]));
addEventListener('blur', () => held.clear());

for (const btn of document.querySelectorAll('#nav [data-act]')) {
  const action = btn.dataset.act;
  const TAP = 260;
  let since = 0, timer = 0;
  const press = () => { clearTimeout(timer); since = performance.now(); takeOver(); held.add(action); };
  const release = () => { timer = setTimeout(() => held.delete(action), Math.max(0, TAP - (performance.now() - since))); };
  btn.addEventListener('pointerdown', (e) => { btn.setPointerCapture(e.pointerId); press(); });
  for (const type of ['pointerup', 'pointercancel']) btn.addEventListener(type, release);
  btn.addEventListener('click', (e) => { if (e.detail === 0) { press(); release(); } });
}
$('#navHome').addEventListener('click', goHome);

function showCard(on, name, meta, isHouse, showReels) {
  document.body.classList.toggle('has-card', on);
  $('#card').classList.toggle('show', on);
  if (!on) return;
  $('#cardName').textContent = name;
  $('#cardName').style.direction = isHouse ? 'ltr' : 'rtl';
  $('#cardMeta').textContent = meta;
  $('#cardProfile').hidden = !isHouse;
  $('#cardShare').hidden = !isHouse;
  $('#cardReels').hidden = !showReels;
  $('#cardHeart').hidden = true;
  $('#cardTour').hidden = true;
  $('#cardEnter').hidden = true;
  $('#cardFlag').hidden = true;
}

let heartFor = null;
function heartId() {
  let id = '';
  try { id = localStorage.getItem('heartId') || ''; } catch (err) {}
  if (!/^[0-9a-f]{32}$/.test(id)) {
    id = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');
    try { localStorage.setItem('heartId', id); } catch (err) {}
  }
  return id;
}

function showHearts(key, n, mine) {
  if (heartFor !== key) return;
  $('#cardMeta').textContent = n == null ? '❤️ …' : `❤️ ${n.toLocaleString('en-US')} قلب حب`;
  const b = $('#cardHeart');
  b.hidden = false;
  b.disabled = !!mine;
  b.classList.toggle('given', !!mine);
  b.textContent = mine ? '❤️ حطيت قلب حب' : '❤️ حط قلب حب';
}

async function openHearts(key) {
  heartFor = key;
  showHearts(key, null, false);
  try {
    const r = await (await fetch(`api/hearts?k=${key}&id=${heartId()}`, { cache: 'no-store' })).json();
    showHearts(key, r.n, r.mine);
  } catch (err) { $('#cardMeta').textContent = '❤️'; }
}

$('#cardHeart').addEventListener('click', async () => {
  const key = heartFor, b = $('#cardHeart');
  if (!key || b.disabled) return;
  b.disabled = true;
  try {
    const res = await fetch('api/hearts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ k: key, id: heartId() }) });
    const r = await res.json();
    if (!res.ok) { b.disabled = false; toast(r.error === 'slow' ? 'انحطّ كتير قلوب من هالشبكة 🙏 جرّب من نت تاني' : 'ما زبطت، جرّب كمان مرة'); return; }
    showHearts(key, r.n, true);
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    if (!r.already) toast('❤️ الله يرحمه… حطيت قلب حب للشهيد البطل عبد الباسط الساروت');
  } catch (err) { b.disabled = false; toast('ما زبطت، جرّب كمان مرة'); }
});

function showHouseCard(rec) {
  const village = rec && rec.town.code;
  const country = rec && rec.country && rec.country !== village ? ' · ' + (countryNames[rec.country] || rec.country) : '';
  const level = rec && (rec.villa ? 'فيلا 👑' : rec.level === MAX_LEVEL ? 'برج 🏢' : 'مستوى ' + rec.level);
  const bd = rec && hzShop ? hzShop.badgeOf(rec.username) : '';
  showCard(!!rec, rec && '@' + rec.username + (bd ? (bd === 'gold' ? ' 🟡✔' : ' 🔵✔') : ''), rec && `بيت رقم ${rec.i + 1} · ${village ? 'حارة ' + rec.town.name + ' · ' : ''}${level}${country}`, true, false);
  $('#cardEnter').hidden = !rec;
  if (rec) $('#cardEnter').textContent = social.me() === rec.username ? '🚪 دخول بيتي والترقية' : '🚪 دخول البيت';
  if (rec && rec.country) {
    $('#cardFlag').src = FLAG_CDN + rec.country.toLowerCase() + '.svg';
    $('#cardFlag').hidden = false;
  }
}

function houseView(rec) {
  const top = rec.top, f = rec.rot === 0 ? 1 : -1;
  const aim = new THREE.Vector3(rec.x, BASE_Y + top * 0.4, rec.z);
  const places = [
    [9, top + 15, 17 + top], [-9, top + 15, 17 + top], [0, top + 25, 12 + top],
    [18 + top * 0.6, top + 19, 5], [-18 - top * 0.6, top + 19, 5],
    [9, top + 15, -17 - top], [-9, top + 15, -17 - top],
    [0, top + 36, 7], [4, top + 62, 12], [4, top + 95, 18],
  ];

  const boxes = [];
  for (const o of nearbyHouses(rec.x, rec.z, 2)) {
    if (o === rec) continue;
    const g = o.model.far.geo;
    if (!g.boundingBox) g.computeBoundingBox();
    setBase(o.x, BASE_Y, o.z, o.rot, MODEL_SCALE, MODEL_SCALE);
    boxes.push(g.boundingBox.clone().applyMatrix4(_base));
  }
  const solids = [], ball = new THREE.Sphere();
  scene.traverseVisible((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.material.transparent || o === marker) return;
    const g = o.geometry;
    if (!g.boundingSphere) g.computeBoundingSphere();
    if (g.boundingSphere.radius > 300) return;
    ball.copy(g.boundingSphere).applyMatrix4(o.matrixWorld);
    if (ball.center.distanceTo(aim) < ball.radius + 110) solids.push(o);
  });

  const ray = new THREE.Raycaster(), hit = new THREE.Vector3();
  const blocked = (from, to, upTo) => {
    const dir = to.clone().sub(from), d = dir.length() * upTo;
    ray.set(from, dir.normalize());
    ray.far = d;
    for (const b of boxes) if (b.containsPoint(from) || (ray.ray.intersectBox(b, hit) && from.distanceTo(hit) < d)) return true;
    return ray.intersectObjects(solids, false).length > 0;
  };

  const roof = new THREE.Vector3(rec.x, BASE_Y + top + 0.4, rec.z), middle = new THREE.Vector3(rec.x, BASE_Y + top * 0.75, rec.z + f * 1.5);
  let best = null, least = Infinity;
  for (const [dx, y, dz] of places) {
    const p = new THREE.Vector3(rec.x + dx, BASE_Y + y, rec.z + f * dz);
    const side = new THREE.Vector3().subVectors(aim, p).cross(UP).normalize();
    const down = new THREE.Vector3().subVectors(aim, p).cross(side).normalize();
    if (down.y > 0) down.negate();
    const d = p.distanceTo(aim);
    let bad = (blocked(p, roof, 0.97) ? 3 : 0) + (blocked(p, middle, 0.94) ? 3 : 0);
    for (const [s, n] of [[0, 0], [0.15, 0], [-0.15, 0], [0, 0.2], [0.12, 0.2], [-0.12, 0.2]]) {
      if (bad >= least) break;
      if (blocked(p, aim.clone().addScaledVector(side, s * d).addScaledVector(down, n * d), 0.5)) bad++;
    }
    if (bad < least) { least = bad; best = p; }
    if (!bad) break;
  }
  return { p: best, t: aim };
}

function select(rec) {
  selected = rec;
  marker.visible = !!rec;
  showHouseCard(rec);
  if (rec) {
    $('#cardProfile').href = 'https://www.instagram.com/' + encodeURIComponent(rec.username) + '/';
    const view = houseView(rec);
    flyView(view.p, view.t);
  }
  updateLabels();
}

function selectLandmark(entry) {
  selected = null;
  marker.visible = false;
  const isCinema = entry.lm.type === 'cinema';
  let meta = isCinema && !reels.length ? 'الريلز جاية قريباً 🎬' : 'معلم من معالم المدينة';
  if (entry.lm.type === 'flags' && flagSquare) {
    const list = flagSquare.list;
    meta = list.length ? `🚩 ${list.length} دولة بحارتنا · الأولى ${list[0].name} بـ ${list[0].n} بيت` : '🚩 علّق واكتب بلدك ليرتفع علمها هون';
  }
  const town = entry.town;
  if (town) {
    meta = town.live
      ? `${town.live.toLocaleString('en-US')} بيت · علّق واكتب «${town.name}» ليصير بيتك هون`
      : `علّق واكتب «${town.name}» وبيتك بيكون أول بيت هون 🏠`;
  }
  heartFor = null;
  if (entry.hearts) {
    showCard(true, entry.lm.name, '❤️ …', false, false);
    openHearts(entry.hearts);
    flyView(new THREE.Vector3(entry.x - 8, entry.y + 12, entry.z + 72), new THREE.Vector3(entry.x, entry.y + 2, entry.z), 1600);
    updateLabels();
    return;
  }
  if (entry.tour) meta = '🚤 خود جولة بالقارب جوا المغارة';
  showCard(true, entry.lm.name, meta, false, isCinema && reels.length > 0);
  $('#cardTour').hidden = !entry.tour;
  if (entry.view) flyView(entry.view[0], entry.view[1], 1800);
  else if (town) {
    $('#cardFlag').src = FLAG_CDN + town.code.toLowerCase() + '.svg';
    $('#cardFlag').hidden = false;
    const [p, t] = town.view;
    flyView(new THREE.Vector3(entry.x + p[0], p[1], entry.z + p[2]), new THREE.Vector3(entry.x + t[0], t[1], entry.z + t[2]), 1800);
  } else if (entry.lm.type === 'center') flyView(new THREE.Vector3(17, 36, 47), new THREE.Vector3(0, 6, -1.5));
  else if (entry.lm.type === 'flags') flyView(new THREE.Vector3(entry.x + 9, 17, entry.z + 24), new THREE.Vector3(entry.x, 3.2, entry.z - 2));
  else flyTo(entry.x, entry.z, entry.height, 1);
  updateLabels();
}

// ------------------------------------------------------------------ reels & picking
let reels = [];
function openReels() {
  const row = $('#reelsRow');
  if (!row.children.length) {
    for (const r of reels) {
      const fig = document.createElement('figure');
      const frame = document.createElement('iframe');
      frame.src = `https://www.instagram.com/${r.kind === 'p' ? 'p' : 'reel'}/${encodeURIComponent(r.code)}/embed/`;
      frame.title = r.title || 'ريل';
      frame.loading = 'lazy';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      fig.append(frame);
      if (r.title) {
        const cap = document.createElement('figcaption');
        cap.textContent = r.title;
        fig.append(cap);
      }
      row.append(fig);
    }
  }
  $('#reels').classList.add('show');
}
function closeReels() { $('#reels').classList.remove('show'); }

const raycaster = new THREE.Raycaster();
const pickPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.6);
const _hit = new THREE.Vector3(), _ndc = new THREE.Vector2();

function pick(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  _ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
  raycaster.setFromCamera(_ndc, camera);
  const lmHit = raycaster.intersectObjects(landmarkGroups, true).find((h) => h.object.material !== haloMat);
  if (lmHit) {
    let o = lmHit.object;
    while (o && !o.userData.entry) o = o.parent;
    if (o) return { entry: o.userData.entry };
  }
  if (!raycaster.ray.intersectPlane(pickPlane, _hit)) return null;
  let best = null, bestD = 3.4 * 3.4;
  for (const rec of nearbyHouses(_hit.x, _hit.z, 1)) {
    const d = (rec.x - _hit.x) ** 2 + (rec.z - _hit.z) ** 2;
    if (d < bestD) { bestD = d; best = rec; }
  }
  return best && { rec: best };
}

let downAt = null, lastTap = null;
canvas.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; });
canvas.addEventListener('pointerup', (e) => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]);
  downAt = null;
  if (moved > 6) return;
  const again = lastTap && e.timeStamp - lastTap.at < 340 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 28;
  lastTap = again ? null : { at: e.timeStamp, x: e.clientX, y: e.clientY };
  const hit = pick(e.clientX, e.clientY);
  if (camera.position.y > 1500) {
    const land = (raycaster.ray.intersectPlane(pickPlane, _hit) && TOWNS.find((t) => inPolygon(t.land, _hit.x, _hit.z)))
      || (hit && hit.entry && (hit.entry.town || (hit.entry.lm && townFor(hit.entry.lm.t))));
    if (land) { lastTap = null; chooseTown(land); }
    return;
  }
  if (again) {
    if (!hit && raycaster.ray.intersectPlane(pickPlane, _hit)) zoomAt(_hit);
    return;
  }
  if (hit && hit.entry) selectLandmark(hit.entry);
  else if (hit) select(hit.rec);
});

// ------------------------------------------------------------------ ui & search
function toast(text, ms = 3200) {
  const el = document.createElement('div');
  el.className = 'panel toast';
  el.textContent = text;
  $('#toasts').append(el);
  while ($('#toasts').children.length > 3) $('#toasts').firstChild.remove();
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, ms);
}

const cleanName = (v) => String(v || '').trim().replace(/^@+/, '').toLowerCase();

function findHouse(name) {
  const rec = byName.get(cleanName(name));
  if (rec) select(rec);
  else toast('ما لقينا بيتك لسا 🙈 تابع الحساب وعلّق على آخر منشور', 4200);
  return rec;
}

const suggestBox = $('#suggest');
let suggestions = [], active = -1;

function hideSuggest() {
  suggestBox.hidden = true;
  suggestions = [];
  active = -1;
  $('#q').setAttribute('aria-expanded', 'false');
  $('#q').removeAttribute('aria-activedescendant');
}

function showSuggest() {
  const q = cleanName($('#q').value);
  if (!q) { hideSuggest(); return; }
  const starts = [], within = [];
  for (const [name, rec] of byName) {
    if (name.startsWith(q)) starts.push(rec);
    else if (within.length < 8 && name.includes(q)) within.push(rec);
  }
  starts.sort((a, b) => a.username.length - b.username.length || a.username.localeCompare(b.username));
  suggestions = starts.concat(within).slice(0, 8);
  active = -1;
  suggestBox.replaceChildren();
  if (!suggestions.length) suggestBox.append(el('li', 'none', 'ما في بيت بهالاسم لسا'));
  suggestions.forEach((rec, n) => {
    const li = el('li');
    li.id = 'sug' + n;
    li.setAttribute('role', 'option');
    const name = el('span', 'who');
    const at = rec.username.toLowerCase().indexOf(q);
    name.append('@' + rec.username.slice(0, at), el('b', '', rec.username.slice(at, at + q.length)), rec.username.slice(at + q.length));
    li.append(name);
    if (rec.country) {
      const img = el('img', 'flag');
      img.src = FLAG_CDN + rec.country.toLowerCase() + '.svg';
      img.alt = '';
      li.append(img);
    }
    li.append(el('small', '', 'بيت ' + (rec.i + 1)));
    li.addEventListener('pointerdown', (e) => { e.preventDefault(); pickSuggestion(n); });
    suggestBox.append(li);
  });
  suggestBox.hidden = false;
  $('#q').setAttribute('aria-expanded', 'true');
}

function markActive(n) {
  active = n;
  [...suggestBox.children].forEach((li, i) => li.classList.toggle('on', i === n));
  if (n >= 0) $('#q').setAttribute('aria-activedescendant', 'sug' + n);
}

function pickSuggestion(n) {
  const rec = suggestions[n];
  if (!rec) return;
  $('#q').value = rec.username;
  hideSuggest();
  select(rec);
  $('#q').blur();
}

$('#q').addEventListener('input', showSuggest);
$('#q').addEventListener('focus', showSuggest);
$('#q').addEventListener('blur', () => setTimeout(hideSuggest, 120));
$('#q').addEventListener('keydown', (e) => {
  if (suggestBox.hidden || !suggestions.length) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); markActive((active + 1) % suggestions.length); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); markActive((active - 1 + suggestions.length) % suggestions.length); }
  else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pickSuggestion(active); }
  else if (e.key === 'Escape') hideSuggest();
});

$('#search').addEventListener('submit', (e) => {
  e.preventDefault();
  hideSuggest();
  if (cleanName($('#q').value)) { findHouse($('#q').value); $('#q').blur(); }
});
$('#cardClose').addEventListener('click', () => select(null));
$('#cardReels').addEventListener('click', openReels);
$('#cardTour').addEventListener('click', startTour);
$('#tourEnd').addEventListener('click', stopTour);
$('#reelsBtn').addEventListener('click', openReels);
$('#reelsClose').addEventListener('click', closeReels);
$('#reels').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeReels(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeReels(); closeShop(); closeSupport(); } });
$('#cardShare').addEventListener('click', async () => {
  if (!selected) return;
  const link = location.origin + location.pathname + '?u=' + encodeURIComponent(selected.username);
  try { await navigator.clipboard.writeText(link); toast('انتسخ الرابط ✅'); }
  catch (err) { toast(link, 6000); }
});

function setCount() {
  $('#count').textContent = byName.size.toLocaleString('en-US');
  for (const b of document.querySelectorAll('#towns [data-town]')) b.querySelector('b').textContent = (townFor(b.dataset.town).live || 0).toLocaleString('en-US');
}

let race = null;
function raceCounts() {
  const n = { '': 0, JO: 0, PS: 0, LB: 0, IQ: 0, MA: 0, EG: 0, YE: 0, SA: 0 };
  if (race) for (let i = race.from; i < houses.length; i++) { const r = houses[i]; if (r && !r.moved) n[r.town.code] = (n[r.town.code] || 0) + 1; }
  return n;
}

window.haretnaCity = {
  show: (name) => {
    const r = ready && byName.get(String(name || '').toLowerCase());
    if (!r) return false;
    showHow(false);
    select(r);
    return true;
  },
  back: () => {
    if ($('#shop').classList.contains('show')) closeShop();
    else if ($('#reels').classList.contains('show')) closeReels();
    else if (document.querySelector('header').classList.contains('finding')) closeFind();
    else if ($('#card').classList.contains('show')) select(null);
    else if (document.body.classList.contains('how-open')) showHow(false);
    else return false;
    return true;
  },
  race: () => race && { ...race, counts: raceCounts() },
  coins: () => coins,
  house: (name) => { const r = byName.get(String(name || '').toLowerCase()); return r && { i: r.i, username: r.username, town: r.town.code, villa: !!r.villa }; },
};

function townView(t) {
  const e = t.group ? t.group.userData.entry : { x: 0, z: 0 };
  const D = (t.code === 'SA' ? 380 : t.code ? 240 : 320) * Math.max(1, Math.sqrt(0.9 / camera.aspect));
  const side = t.code ? 1 : -1;
  return { p: new THREE.Vector3(e.x + side * D * 0.32, D * 0.6, e.z + D * 0.74), t: new THREE.Vector3(e.x, t.code === 'SA' ? 62 : 6, e.z) };
}

function chooseTown(t) {
  takeOver();
  for (const o of document.querySelectorAll('#towns [data-town]')) o.classList.toggle('on', townFor(o.dataset.town) === t);
  if (t.group) selectLandmark(t.group.userData.entry);
  else select(null);
  if (walker.on) { const e = t.group ? t.group.userData.entry : { x: 0, z: 0 }; walkTo(e.x + 10, e.z + 36); return; }
  const v = townView(t);
  flyView(v.p, v.t, 2200);
}

for (const b of document.querySelectorAll('#towns [data-town]')) b.addEventListener('click', () => chooseTown(townFor(b.dataset.town)));

$('#findBtn').addEventListener('click', () => {
  const open = document.querySelector('header').classList.toggle('finding');
  $('#findBtn').setAttribute('aria-expanded', String(open));
  if (open) $('#q').focus();
});

function closeFind() {
  document.querySelector('header').classList.remove('finding');
  $('#findBtn').setAttribute('aria-expanded', 'false');
  hideSuggest();
  $('#q').blur();
}

$('#search').addEventListener('submit', () => {
  if (matchMedia('(max-width: 640px)').matches) closeFind();
});

function showHow(on) {
  document.body.classList.toggle('how-open', on);
  $('#howBtn').setAttribute('aria-expanded', String(on));
  if (!on) try { localStorage.setItem('howSeen', '1'); } catch (err) {}
}

$('#howBtn').addEventListener('click', () => showHow(true));
$('#howClose').addEventListener('click', () => showHow(false));
$('#howCoins').addEventListener('click', () => { showHow(false); $('#coinsBtn').click(); });
{ let seen = false; try { seen = localStorage.getItem('howSeen') === '1'; } catch (err) {} showHow(!seen); }

// ------------------------------------------------------------------ city balance & support
let coins = 0, perHouse = 0, shop = [];
const SHOP_ICONS = { cn_tower: '🗼', eiffel: '🗼', burj: '🏙️', clock: '🕰️', pyramid: '🔺', ferris: '🎡', cinema: '🎬', park: '🌳' };
const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
};

function setCoins(n) {
  coins = n;
  $('#coins').textContent = n.toLocaleString('en-US');
  if ($('#shop').classList.contains('show')) renderShop();
}

function renderShop() {
  $('#shopCoins').textContent = coins.toLocaleString('en-US');
  $('#shopRule').textContent = `كل بيت جديد بيزيد رصيد المدينة ${perHouse} 🪙، وبالرصيد منشتري معالم جديدة لحارتنا.`;
  const list = $('#shopList');
  list.replaceChildren();
  for (const item of shop) {
    const li = el('li');
    const body = el('div', 'grow');
    const missing = Math.max(0, item.price - coins);
    body.append(el('b', '', item.name));
    body.append(el('small', missing ? '' : 'ready', missing ? `ناقص ${Math.ceil(missing / Math.max(1, perHouse)).toLocaleString('en-US')} بيت` : 'الرصيد بيكفي ✅'));
    const bar = el('div', 'bar');
    const fill = el('i');
    fill.style.width = Math.min(100, (coins / item.price) * 100) + '%';
    bar.append(fill);
    body.append(bar);
    li.append(el('span', 'icon', SHOP_ICONS[item.type] || '🏗️'), body, el('span', 'price', item.price.toLocaleString('en-US') + ' 🪙'));
    list.append(li);
  }
}

function openShop() { $('#shop').classList.add('show'); renderShop(); }
function closeShop() { $('#shop').classList.remove('show'); }
$('#coinsBtn').addEventListener('click', openShop);
$('#shopClose').addEventListener('click', closeShop);
$('#shop').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeShop(); });

const safeUrl = (u) => { try { if (!String(u || '').trim()) return ''; const x = new URL(String(u).trim(), location.href); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch (err) { return ''; } };
const igLink = (h) => { const u = String(h || '').trim().replace(/^@+/, ''); return /^[A-Za-z0-9._]{1,30}$/.test(u) ? 'https://ig.me/m/' + u : safeUrl(u); };
let support = {}, sponsors = [], ads = [], adIdx = 0, adTimer = 0, adClosed = false;

function renderSupport() {
  $('#supportIntro').textContent = support.intro || 'ادعم المدينة واحصل على برج أو معلم باسمك، أو أعلن عن مشروعك فيها.';
  const list = $('#supportPrices');
  list.replaceChildren();
  for (const p of support.prices || []) {
    const li = el('li'), body = el('div', 'grow');
    body.append(el('b', '', String(p.name || '')));
    if (p.desc) body.append(el('small', '', String(p.desc)));
    li.append(el('span', 'icon', '💎'), body, el('span', 'price', String(p.price || '')));
    list.append(li);
  }
  const link = igLink(support.contact), a = $('#supportContact');
  a.hidden = !link;
  if (link) a.href = link;
  const sl = $('#sponsorList');
  sl.replaceChildren();
  $('#sponsorsHead').hidden = !sponsors.length;
  for (const sp of sponsors) {
    const li = el('li'), body = el('div', 'grow');
    body.append(el('b', '', '@' + String(sp.name || '')));
    body.append(el('small', '', String(sp.item || '') + (sp.t && countryNames[sp.t] ? ' — ' + countryNames[sp.t] : '')));
    li.append(el('span', 'icon', '🌟'), body);
    sl.append(li);
  }
}

function showAd() {
  const live = ads.filter((a) => a && a.active !== false && (a.title || a.img));
  const bar = $('#adBar');
  if (!live.length || adClosed) { bar.hidden = true; return; }
  const ad = live[adIdx++ % live.length], link = safeUrl(ad.link), img = ad.img ? safeUrl(ad.img) : '';
  $('#adText').textContent = String(ad.title || 'إعلان');
  const pic = $('#adImg');
  if (img) { pic.src = img; pic.hidden = false; } else { pic.removeAttribute('src'); pic.hidden = true; }
  const a = $('#adLink');
  a.hidden = !link;
  if (link) a.href = link;
  bar.hidden = false;
  clearTimeout(adTimer);
  if (live.length > 1) adTimer = setTimeout(showAd, 9000);
}

function openSupport() { $('#support').classList.add('show'); renderSupport(); }
function closeSupport() { $('#support').classList.remove('show'); }
$('#supportBtn').addEventListener('click', openSupport);
$('#supportClose').addEventListener('click', closeSupport);
$('#support').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeSupport(); });
$('#adClose').addEventListener('click', () => { adClosed = true; clearTimeout(adTimer); $('#adBar').hidden = true; });

function applyConfig(cfg) {
  if (!cfg) return;
  if (cfg.account) { setAccount(cfg.account); document.title = 'حارتنا — @' + cfg.account; }
  if (cfg.coins != null) setCoins(cfg.coins);
  if (cfg.perHouse != null) perHouse = cfg.perHouse;
  if (cfg.shop) shop = cfg.shop;
  if (cfg.reels) reels = cfg.reels;
  if (cfg.countries) { countryNames = cfg.countries; flagSquareDirty = true; }
  if (cfg.support) support = cfg.support;
  if (cfg.sponsors) sponsors = cfg.sponsors;
  if (cfg.ads) { ads = cfg.ads; adIdx = 0; showAd(); }
  if (cfg.race !== undefined) { race = cfg.race; flagSquareDirty = true; }
  if (cfg.titles) titles = cfg.titles;
  if (cfg.names) NAMES = cfg.names;
}

// ------------------------------------------------------------------ sky & night
const SKY_DAY = new THREE.Color('#bfe6ff'), SKY_NIGHT = new THREE.Color('#0c1428');
const FOG_DAY = new THREE.Color('#bfe6ff'), FOG_NIGHT = new THREE.Color('#0c1428');
const HEMI_SKY_DAY = new THREE.Color('#ffffff'), HEMI_SKY_NIGHT = new THREE.Color('#2c3e6b');
const HEMI_GND_DAY = new THREE.Color('#c3d2ae'), HEMI_GND_NIGHT = new THREE.Color('#131926');
const SUN_DAY = new THREE.Color('#fff3dd'), SUN_NIGHT = new THREE.Color('#6b88c9');

const sky = { mode: 'auto', manual: false, last: -1 };
let nightShown = 0;

function targetNight(now) {
  if (sky.mode === 'day') return 0;
  if (sky.mode === 'night') return 1;
  const h = new Date(now).getHours() + new Date(now).getMinutes() / 60;
  if (h >= 19.5 || h < 5) return 1;
  if (h >= 17.5) return (h - 17.5) / 2;
  if (h < 7) return 1 - (h - 5) / 2;
  return 0;
}

function applySky(n, now) {
  nightShown = n;
  nightU.value = n;
  scene.background.copy(SKY_DAY).lerp(SKY_NIGHT, n);
  scene.fog.color.copy(FOG_DAY).lerp(FOG_NIGHT, n);
  hemi.color.copy(HEMI_SKY_DAY).lerp(HEMI_SKY_NIGHT, n);
  hemi.groundColor.copy(HEMI_GND_DAY).lerp(HEMI_GND_NIGHT, n);
  hemi.intensity = 1.55 - 0.9 * n;
  sun.color.copy(SUN_DAY).lerp(SUN_NIGHT, n);
  sun.intensity = 1.75 - 1.35 * n;
  ground.material.color.copy(LAND_DAY).lerp(LAND_NIGHT, n);
  lampMat.color.set(n > 0.35 ? '#ffdfa0' : '#d9dde3');
  lampLightMat.opacity = 0.58 * n;
  ringMat.opacity = 0.9 * Math.max(0, (n - 0.25) / 0.75);
  haloMat.opacity = 0.42 * n;
  beamMat.opacity = 0.34 * n;
  for (const l of floodlights) l.intensity = 1.4 * n;
  for (const m of flagSquareMats) m.emissiveIntensity = 0.22 * n;
  for (const [m, s] of townFx) m.opacity = s * n;
  if (traffic) traffic.setNight(n, now);

  const step = Math.round(n * 20);
  if (step === sky.last) return;
  sky.last = step;
  const isNight = n >= 0.5;
  $('#skyBtn').textContent = isNight ? '☀️' : '🌙';
  $('#skyBtn').setAttribute('aria-label', isNight ? 'النهار' : 'الليل');
  $('#skyBtn').title = isNight ? 'النهار' : 'الليل';
}

function updateSky(now) {
  const goal = targetNight(now);
  if (reducedMotion || !sky.manual) { applySky(goal, now); return; }
  const next = nightShown + (goal - nightShown) * 0.08;
  applySky(Math.abs(goal - next) < 0.005 ? goal : next, now);
}

$('#skyBtn').addEventListener('click', () => {
  sky.manual = true;
  sky.mode = nightShown >= 0.5 ? 'day' : 'night';
  updateSky(performance.now());
});

// ------------------------------------------------------------------ walking in the city
const walker = {
  on: false, group: null, head: null, body: null, armL: null, armR: null, legL: null, legR: null,
  x: 0, z: 0, yaw: 0, vx: 0, vz: 0, walkPhase: 0, goal: null, lastNow: 0,
};
const WALK_SPEED = 11;
const WALK_KEYS = { KeyW: 1, ArrowUp: 1, KeyS: -1, ArrowDown: -1, KeyA: 1, ArrowLeft: 1, KeyD: -1, ArrowRight: -1 };
const walkHeld = new Set();

function makeWalker() {
  const g = new THREE.Group();
  const skin = lambert('#e6b89c', { flatShading: true });
  const shirt = lambert('#2f7d5b', { flatShading: true });
  const pants = lambert('#2e3848', { flatShading: true });
  const shoe = lambert('#3b281e', { flatShading: true });
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.62), skin);
  head.position.y = 2.02; head.castShadow = true;
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.2, 0.72), lambert('#e1306c', { flatShading: true }));
  cap.position.set(0, 2.34, 0.04);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.92, 0.42), shirt);
  body.position.y = 1.24; body.castShadow = true;
  const pivot = (px, py, geo, mat, zOff = 0) => {
    const p = new THREE.Group(); p.position.set(px, py, 0);
    const m = new THREE.Mesh(geo, mat); m.position.y = zOff; m.castShadow = true;
    p.add(m); g.add(p); return p;
  };
  const armL = pivot(-0.52, 1.62, new THREE.BoxGeometry(0.24, 0.76, 0.26), skin, -0.32);
  const armR = pivot(0.52, 1.62, new THREE.BoxGeometry(0.24, 0.76, 0.26), skin, -0.32);
  const legL = pivot(-0.2, 0.78, new THREE.BoxGeometry(0.28, 0.78, 0.3), pants, -0.39);
  const legR = pivot(0.2, 0.78, new THREE.BoxGeometry(0.28, 0.78, 0.3), pants, -0.39);
  const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.42), shoe); shoeL.position.set(0, -0.74, 0.05); legL.add(shoeL);
  const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.42), shoe); shoeR.position.set(0, -0.74, 0.05); legR.add(shoeR);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.65, 16).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.25, depthWrite: false }));
  shadow.position.y = 0.02;
  g.add(head, cap, body, shadow);
  g.traverse((o) => { if (o.isMesh) o.raycast = () => {}; });
  return Object.assign(walker, { group: g, head, body, armL, armR, legL, legR });
}

function setWalkerPose(swing, bob) {
  walker.group.position.set(walker.x, 0.3, walker.z);
  walker.group.rotation.y = walker.yaw;
  walker.body.position.y = 1.24 + bob;
  walker.head.position.y = 2.02 + bob;
  walker.armL.rotation.x = swing * 0.7;
  walker.armR.rotation.x = -swing * 0.7;
  walker.legL.rotation.x = -swing * 0.75;
  walker.legR.rotation.x = swing * 0.75;
}

function placeWalkerCamera(snap) {
  const backX = -Math.sin(walker.yaw), backZ = -Math.cos(walker.yaw);
  const wantP = new THREE.Vector3(walker.x + backX * 7.5, 5.2, walker.z + backZ * 7.5);
  const wantT = new THREE.Vector3(walker.x - backX * 2.5, 1.8, walker.z - backZ * 2.5);
  if (snap) { camera.position.copy(wantP); controls.target.copy(wantT); }
  else { camera.position.lerp(wantP, 0.14); controls.target.lerp(wantT, 0.18); }
}

function walkTo(x, z) {
  if (!walker.on) return;
  const p = new THREE.Vector3(x, 0, z);
  pullIntoCity(p);
  walker.goal = { x: p.x, z: p.z };
}

function enterWalk() {
  if (walker.on) return;
  if (drive && drive.on) drive.exit();
  walker.on = true;
  walker.goal = null;
  walkHeld.clear();
  flight = null;
  controls.autoRotate = false;
  controls.enableRotate = false;
  controls.enablePan = false;
  controls.minDistance = 4;
  controls.maxDistance = 28;
  const start = new THREE.Vector3(controls.target.x, 0, controls.target.z);
  pullIntoCity(start);
  walker.x = start.x; walker.z = start.z;
  walker.yaw = 0; walker.vx = 0; walker.vz = 0; walker.lastNow = performance.now();
  if (!walker.group) makeWalker();
  setWalkerPose(0, 0);
  scene.add(walker.group);
  placeWalkerCamera(true);
  document.body.classList.add('walking');
  $('#walkBtn').setAttribute('aria-pressed', 'true');
  toast('🚶 عم تمشي بالحارة · الأسهم أو WASD أو أزرار الحركة، أو اضغط عالأرض', 4500);
}

function exitWalk() {
  if (!walker.on) return;
  walker.on = false;
  walker.goal = null;
  walkHeld.clear();
  controls.enableRotate = true;
  controls.enablePan = true;
  controls.minDistance = 14;
  controls.maxDistance = 900;
  if (walker.group) scene.remove(walker.group);
  document.body.classList.remove('walking');
  $('#walkBtn').setAttribute('aria-pressed', 'false');
}

function stepWalk(now) {
  const dt = Math.min(0.05, (now - walker.lastNow) / 1000);
  walker.lastNow = now;
  let move = 0, turn = 0;
  if (walkHeld.has('KeyW') || walkHeld.has('ArrowUp')) move += 1;
  if (walkHeld.has('KeyS') || walkHeld.has('ArrowDown')) move -= 1;
  if (walkHeld.has('KeyA') || walkHeld.has('ArrowLeft')) turn += 1;
  if (walkHeld.has('KeyD') || walkHeld.has('ArrowRight')) turn -= 1;
  if (move || turn) walker.goal = null;
  if (walker.goal) {
    const dx = walker.goal.x - walker.x, dz = walker.goal.z - walker.z, dist = Math.hypot(dx, dz);
    if (dist < 0.5) walker.goal = null;
    else {
      const wantYaw = Math.atan2(dx, dz);
      let diff = wantYaw - walker.yaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      walker.yaw += diff * Math.min(1, dt * 8);
      move = Math.cos(diff) > 0.2 ? 1 : 0;
    }
  } else {
    walker.yaw += turn * 2.2 * dt;
  }
  const targetVx = move ? Math.sin(walker.yaw) * move * WALK_SPEED : 0;
  const targetVz = move ? Math.cos(walker.yaw) * move * WALK_SPEED : 0;
  walker.vx += (targetVx - walker.vx) * Math.min(1, dt * 10);
  walker.vz += (targetVz - walker.vz) * Math.min(1, dt * 10);
  const nx = walker.x + walker.vx * dt, nz = walker.z + walker.vz * dt;
  const p = new THREE.Vector3(nx, 0, nz);
  if (!pullIntoCity(p)) { walker.x = nx; walker.z = nz; }
  else { walker.vx = 0; walker.vz = 0; walker.goal = null; }
  const speed = Math.hypot(walker.vx, walker.vz);
  if (speed > 0.2) {
    walker.walkPhase += dt * speed * 1.1;
    setWalkerPose(Math.sin(walker.walkPhase), Math.abs(Math.cos(walker.walkPhase)) * 0.12);
  } else {
    walker.walkPhase = 0;
    setWalkerPose(0, 0);
  }
  placeWalkerCamera(false);
}

$('#walkBtn').addEventListener('click', () => (walker.on ? exitWalk() : enterWalk()));
$('#walkExit').addEventListener('click', exitWalk);
for (const btn of document.querySelectorAll('#walkPad [data-w]')) {
  const k = btn.dataset.w;
  const down = (e) => { e.preventDefault(); walker.goal = null; walkHeld.add(k); };
  const up = () => walkHeld.delete(k);
  btn.addEventListener('pointerdown', down);
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) btn.addEventListener(ev, up);
}
addEventListener('keydown', (e) => {
  if (!walker.on || !WALK_KEYS[e.code]) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  walkHeld.add(e.code);
});
addEventListener('keyup', (e) => walkHeld.delete(e.code));

// ------------------------------------------------------------------ traffic, driving & warjet
const traffic = createTraffic({
  scene, houseMat, box, cyl, flat, glowTexture, poolList,
  BW, BD, ROAD, CURB_X, CURB_Z, lampLightPool, part, setBase,
  livedStreets, streetLived, cornerX, cornerZ, cars,
});

const drive = createDrive({
  scene, camera, controls, canvas, houseMat, box, cyl, flat, glowTexture, poolList,
  BW, BD, ROAD, CURB_X, CURB_Z, lampLightPool, part, setBase,
  inPolygon, TOWNS, HIGHWAYS, highwayEnds, highwayPieces, SWORD,
  traffic, cars, walker, exitWalk, toast, reducedMotion,
});

let warjet = null;
function initWarJet() {
  if (warjet) return warjet;
  warjet = createWarJet({
    scene, camera, controls, canvas, houseMat, box, cyl, flat, glowTexture, poolList,
    BW, BD, ROAD, CURB_X, CURB_Z, lampLightPool, part, setBase,
    inPolygon, TOWNS, HIGHWAYS, highwayEnds, highwayPieces, SWORD,
    traffic, cars, walker, exitWalk, toast, reducedMotion,
    drive, spinners, getNight: nightFactor,
  });
  return warjet;
}
window.haretnaWarJet = {
  open: () => initWarJet().open(),
  close: () => { if (warjet) warjet.close(); },
  exit: () => { if (warjet) warjet.exit(); },
};

const hzShop = createShop({
  toast,
  cleanName,
  onBadgeChange: () => {
    for (const s of labels) if (s.visible && s.userData.rec) drawLabel(s, s.userData.rec);
    if (selected) showHouseCard(selected);
  },
  onEnterHouse: (rec) => {
    if (drive && drive.on) drive.exit();
    if (walker.on) exitWalk();
    select(null);
    return rec;
  },
  onExitHouse: (rec) => {
    if (rec) {
      const v = houseView(rec);
      flyView(v.p, v.t, 900);
    }
  },
  onCoinsChange: (delta) => setCoins(coins + delta),
  getCoins: () => coins,
  getHouse: (name) => byName.get(cleanName(name)),
  getSelectedHouse: () => selected,
  getMyName: () => social.me(),
});
window.haretnaShop = hzShop;

$('#cardEnter').addEventListener('click', () => {
  if (!selected) return;
  hzShop.enterHouse(selected);
});

// ------------------------------------------------------------------ loop & data
function homeView() {
  const cx = (SYRIA.ox + 0.5) * BW, cz = (SYRIA.oz + 0.5) * BD;
  return { p: new THREE.Vector3(cx, 1650, cz + 2100), t: new THREE.Vector3(cx, 0, cz) };
}

let ready = false;
let lastFrame = performance.now();

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;

  if (tour) {
    tourStep(now);
    for (const fn of spinners) fn(now);
    updateSky(now);
    renderer.render(scene, camera);
    return;
  }

  if (boundsDirty && now - highwayAt > 250) { highwayAt = now; buildHighways(); }
  if (flagSquareDirty && now - flagSquareAt > 400) { flagSquareAt = now; updateFlagSquare(); }
  if (flagSquare && now - flagSquare.podium.at > 15000) updatePodium(now);

  for (let i = growing.length - 1; i >= 0; i--) {
    const g = growing[i];
    if (now < g.t0) continue;
    const t = Math.min(1, (now - g.t0) / 700);
    writeHouse(g.rec, t < 1 ? Math.max(0.01, easeOutBack(t)) : 1);
    if (t >= 1) growing.splice(i, 1);
  }

  if (flight) {
    const u = Math.min(1, (now - flight.t0) / flight.dur);
    const e = 1 - Math.pow(1 - u, 3);
    camera.position.lerpVectors(flight.fromP, flight.toP, e);
    controls.target.lerpVectors(flight.fromT, flight.toT, e);
    if (u >= 1) flight = null;
  } else if (drive && drive.on) {
    drive.step(now);
  } else if (walker.on) {
    stepWalk(now);
  } else {
    steer(dt);
    controls.update();
    keepInCity();
  }

  if (traffic) traffic.update(now);
  updateCars(now);

  if (warjet) warjet.step(now);

  for (const fn of spinners) fn(now);

  const d = controls.target;
  sun.position.set(d.x + 55, d.y + 85, d.z + 45);
  sun.target.position.copy(d);
  sun.target.updateMatrixWorld();

  const t = now * 0.004;
  for (const town of TOWNS) {
    if (!town.sign) continue;
    const plot = plotOf(town, town.count);
    town.sign.position.y = BASE_Y + Math.sin(t) * 0.25;
    town.sign.rotation.y = Math.sin(t * 0.5) * 0.12;
    padMat.opacity = 0.35 + 0.25 * Math.sin(t * 1.3);
    void plot;
  }

  if (selected) {
    marker.position.set(selected.x, tagY(selected) + 2.4 + Math.sin(t * 1.4) * 0.35, selected.z);
    marker.rotation.y += dt * 1.6;
  }

  updateDetail();
  updateLabels();
  updateSky(now);
  for (const p of poolList) p.flush();
  renderer.render(scene, camera);
}

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

setAccount('haretna.sy');
buildPlaza();
for (const town of TOWNS) if (town.code) buildTown(town);
buildBosra();
buildAbdali();
buildSword();
buildRum();
buildAirports();
buildHighways();
paintLands();
scatterGround();
buildFleet(DEFAULT_PLANES);
const hv = homeView();
camera.position.copy(hv.p);
controls.target.copy(hv.t);
controls.update();
requestAnimationFrame(frame);

getConfig().then(applyConfig).catch(() => {});

getHousesData().then((data) => {
  if (data.config) applyConfig(data.config);
  if (data.landmarks) {
    for (const lm of data.landmarks) {
      if (lm.type === 'railway') { buildRailway(lm); continue; }
      const tw = townFor(lm.t);
      if (lm.tiles) for (const key of lmTiles(lm)) tw.landmarkBlocks.set(key, lm);
      else tw.landmarkBlocks.set(lm.block, lm);
      buildLandmark(lm);
    }
  }
  const list = data.houses || [];
  const stagger = list.length < 400;
  list.forEach((h, i) => {
    if (!h) { addHouse('', 0, null, '', ''); return; }
    addHouse(h.u, h.l, stagger ? Math.min(i * 35, 1800) : null, h.c, h.t, !!h.v);
  });
  setCount();
  placeNextSign();
  updateDetail();
  updateLabels();
  ready = true;

  const q = new URLSearchParams(location.search);
  const u = q.get('u');
  if (u) {
    $('#q').value = u;
    findHouse(u);
  }
}).catch((err) => {
  console.error(err);
  toast('تعذّر تحميل بيانات المدينة');
});

social.init({
  toast,
  onSelect: (rec) => {
    if (rec) select(rec);
    else select(null);
  },
  getHouse: (name) => byName.get(cleanName(name)),
  getCamera: () => ({ camera, controls, flyView }),
});
