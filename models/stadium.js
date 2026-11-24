// «ستاد الملك عبدالله الثاني» in Jordan's village (the user's ask, 2026-11-22: big, like
// the real one in Al-Quwaysimah, with a match on between Al-Wehdat and Al-Faisaly and
// their crests). It stands on 6 x 7 of Jordan's blocks of its own past the village's
// houses (server.js ensureBigLandmark). The site is 204 x 155 (x along the pitch,
// +z towards the visitor, south):
//  - a bowl of seats round an athletics track and the pitch, the concrete facade with
//    its ribs and gates, the main stand on the north side under a white roof on an arch;
//  - the crowd: Al-Wehdat's green on the west half, Al-Faisaly's blue on the east,
//    flags waving, a giant crest on each end's stand, the two screens at the ends;
//  - four floodlight masts; the players, the referee and the ball (stadiumMatch).
// The concrete and the roof are baked by the city (stadium); the bowl and the crowd
// are their own coloured meshes (stadiumBowl); the match moves (stadiumMatch).
import * as THREE from 'three';
import { put, box, cyl, ball, face, rng, C } from './kit.js';

export const SIZE = [204, 155];
const HX = SIZE[0] / 2, HZ = SIZE[1] / 2;
const PITCH = [105, 68];
const A0 = 63, B0 = 45, ROWS = 26, RUN = 0.86, RISE = 0.46, Y0 = 0.9; // the first row's ellipse, the steps
const A1 = A0 + ROWS * RUN, B1 = B0 + ROWS * RUN, TOP = Y0 + ROWS * RISE;   // the last row
const FA = A1 + 1.8, FB = B1 + 1.8, FH = TOP + 3.2;                             // the facade
export const MAST_H = 46;
export const MASTS = [[-80, -60], [80, -60], [-80, 60], [80, 60]];
const CONCRETE = '#d9d5cc', CONCRETE2 = '#c7c2b8', STEEL = '#8d949e', TRACK = '#c9573b', LAMP = '#f6d77a';
const ROOF = { th0: -Math.PI * 0.78, th1: -Math.PI * 0.22, h: TOP + 12 }; // the main stand's roof (north)
const onEllipse = (a, b, th) => [a * Math.cos(th), b * Math.sin(th)];

// The concrete, the track and the roof (baked by the city: one colour per part).
export function stadium(g) {
  // the ground of the site, the outer plaza
  box(g, '#cfc8b8', 0, 0, 0, SIZE[0], 0.3, SIZE[1]);
  // the facade: a ring of concrete ribs with glass between, gates on the four sides
  const N = 120;
  for (let i = 0; i < N; i++) {
    const t0 = (i / N) * Math.PI * 2, t1 = ((i + 1) / N) * Math.PI * 2, [x0, z0] = onEllipse(FA, FB, t0), [x1, z1] = onEllipse(FA, FB, t1);
    const len = Math.hypot(x1 - x0, z1 - z0) + 0.05, ang = -Math.atan2(z1 - z0, x1 - x0), gate = i % 30 === 0;
    const f = face(g, (x0 + x1) / 2, (z0 + z1) / 2, ang, 0.3);
    if (!gate) box(f, i % 2 ? '#6f8fa3' : '#7fa8bf', 0, 2.2, 0, len, FH - 4.2, 0.2);
    box(f, CONCRETE2, 0, 0, 0, len, gate ? 0.3 : 2.2, 0.6);
    box(f, CONCRETE, 0, FH - 2.0, 0, len, 2.0, 0.7);
    if (i % 2 === 0) box(f, CONCRETE, -len / 2, 0, 0.3, 0.7, FH, 0.9); // the ribs
    if (gate) box(f, '#2b2d33', 0, 0, 0.1, len - 0.8, 4.2, 0.3);
  }
  // the athletics track round the pitch, its kerb, and the grass beyond the lines
  const ring = (a0, b0, a1, b1, color, y) => {
    const s = new THREE.Shape(), h = new THREE.Path();
    s.absellipse(0, 0, a1, b1, 0, Math.PI * 2, false);
    h.absellipse(0, 0, a0, b0, 0, Math.PI * 2, true);
    s.holes.push(h);
    put(g, new THREE.ShapeGeometry(s, 64).rotateX(-Math.PI / 2), color, 0, y, 0);
  };
  ring(55.5, 38.5, A0 - 0.6, B0 - 0.6, TRACK, 0.34);
  for (const k of [2, 4, 6]) ring(55.5 + k - 0.04, 38.5 + k - 0.04, 55.5 + k + 0.04, 38.5 + k + 0.04, '#f2ece4', 0.35);
  ring(A0 - 0.6, B0 - 0.6, A0 + 0.1, B0 + 0.1, '#eeeeee', 0.36);
  put(g, new THREE.CircleGeometry(1, 64).rotateX(-Math.PI / 2), '#3f8f3a', 0, 0.33, 0, 55.6, 1, 38.6);
  // the main stand's back wall and the roof over it on a great arch (north side)
  const arcPts = 28;
  for (let i = 0; i < arcPts; i++) { // the roof: a band of white panels from the top of the stand out over the seats
    const t0 = ROOF.th0 + (i / arcPts) * (ROOF.th1 - ROOF.th0), t1 = ROOF.th0 + ((i + 1) / arcPts) * (ROOF.th1 - ROOF.th0);
    const mid = (t0 + t1) / 2, [ox, oz] = onEllipse(FA, FB, mid), [ix, iz] = onEllipse(A0 + 8, B0 + 8, mid);
    const w = Math.hypot(...onEllipse(FA, FB, t1).map((v, k) => v - onEllipse(FA, FB, t0)[k])) + 0.2;
    const len = Math.hypot(ox - ix, oz - iz), f = face(g, (ox + ix) / 2, (oz + iz) / 2, -Math.atan2(oz - iz, ox - ix) + Math.PI / 2, ROOF.h);
    const p = put(f, new THREE.BoxGeometry(1, 1, 1), i % 2 ? '#f4f6f8' : '#e9edf1', 0, 0, 0, w, 0.35, len);
    p.rotation.x = -0.12;
  }
  const [lx] = onEllipse(FA, FB, ROOF.th0), [rx] = onEllipse(FA, FB, ROOF.th1);
  for (let i = 0; i <= 40; i++) { // the arch the roof hangs from, and its cables
    const u = i / 40, x = lx + (rx - lx) * u, y = ROOF.h + 2 + Math.sin(u * Math.PI) * 16, z = -FB + 4;
    if (i < 40) { const x2 = lx + (rx - lx) * (u + 1 / 40), y2 = ROOF.h + 2 + Math.sin((u + 1 / 40) * Math.PI) * 16; const m = put(g, new THREE.BoxGeometry(1, 1, 1), STEEL, (x + x2) / 2, (y + y2) / 2, z, Math.hypot(x2 - x, y2 - y) + 0.05, 1.1, 1.1); m.rotation.z = Math.atan2(y2 - y, x2 - x); }
    if (i % 4 === 2) cyl(g, '#b9bfc8', x, ROOF.h, z + 6, 0.07, y - ROOF.h, 6);
  }
  for (const x of [lx, rx]) { cyl(g, CONCRETE2, x, 0.3, -FB + 4, 1.6, ROOF.h + 2, 10); }
  // the floodlight masts with their banks of lamps
  for (const [x, z] of MASTS) {
    cyl(g, STEEL, x, 0.3, z, 0.9, MAST_H, 10);
    const f = face(g, x, z, Math.atan2(-x, -z), MAST_H);
    box(f, '#3b3f47', 0, 0, 0, 9, 5, 0.6);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) box(f, LAMP, -3.75 + c * 1.5, 0.6 + r * 1.5, 0.35, 1.1, 1.1, 0.2);
  }
  // the goals and the corner flags
  for (const s of [-1, 1]) {
    const x = s * PITCH[0] / 2;
    for (const z of [-3.66, 3.66]) box(g, '#ffffff', x, 0.33, z, 0.15, 2.44, 0.15);
    box(g, '#ffffff', x, 2.7, 0, 0.15, 0.15, 7.47);
    box(g, '#e8e8e8', x + s * 1.0, 0.33, 0, 0.05, 2.4, 7.3); // the net's back
    for (const z of [-PITCH[1] / 2, PITCH[1] / 2]) { cyl(g, '#ffffff', x, 0.33, z, 0.04, 1.5, 6); box(g, '#ffd23f', x + s * 0.2, 1.4, z, 0.4, 0.3, 0.02); }
  }
  // the benches by the halfway line on the south side
  for (const s of [-1, 1]) { box(g, '#2f3640', s * 9, 0.33, 36.6, 8, 1.6, 1.2); box(g, '#9fd3f0', s * 9, 1.9, 36.9, 8, 0.1, 0.8); }
  // trees and lamps round the outer plaza
  for (let i = 0; i < 48; i++) {
    const t = (i / 48) * Math.PI * 2, [x, z] = onEllipse(FA + 7, FB + 4, t);
    if (Math.abs(x) > HX - 3 || Math.abs(z) > HZ - 3) continue;
    if (i % 3) { cyl(g, '#7a5235', x, 0.3, z, 0.15, 1.4); ball(g, i % 2 ? '#4f9f5a' : '#5fb46a', x, 2.6, z, 1.5, 1.1); }
    else { cyl(g, '#2b2d33', x, 0.3, z, 0.1, 5.5, 6); ball(g, LAMP, x, 5.9, z, 0.3); }
  }
}
stadium.label = 'ستاد الملك عبدالله الثاني';
stadium.top = MAST_H + 4;
stadium.size = SIZE;
stadium.floodlight = { color: '#ffffff', at: [0, 38, 0] };

// ---- the bowl of seats with the crowd in it: one mesh, a colour per step
const WEHDAT = ['#1f8a3c', '#ffffff', '#2fa84f', '#156b2d', '#e9f5ea', '#1f8a3c'];
const FAISALY = ['#1f5fb5', '#ffffff', '#3b7fd6', '#163f80', '#eaf1fb', '#1f5fb5'];
const SKIN = ['#e0b48a', '#c98f62', '#f0c9a0', '#a8714a'];
export function stadiumBowl() {
  const S = 160, pos = [], col = [], rand = rng(41), c = new THREE.Color();
  const quad = (p, color) => { // two triangles, one colour
    c.set(color);
    for (const k of [0, 1, 2, 0, 2, 3]) { pos.push(...p[k]); col.push(c.r, c.g, c.b); }
  };
  for (let i = 0; i < ROWS; i++) {
    const a0 = A0 + i * RUN, b0 = B0 + i * RUN, a1 = a0 + RUN, b1 = b0 + RUN, y0 = Y0 + i * RISE, y1 = y0 + RISE;
    for (let j = 0; j < S; j++) {
      const t0 = (j / S) * Math.PI * 2, t1 = ((j + 1) / S) * Math.PI * 2, tm = (t0 + t1) / 2;
      const [x00, z00] = onEllipse(a0, b0, t0), [x01, z01] = onEllipse(a0, b0, t1), [x10, z10] = onEllipse(a1, b1, t0), [x11, z11] = onEllipse(a1, b1, t1);
      // who sits here: the west half Al-Wehdat, the east half Al-Faisaly, a few empty seats and the aisles
      const aisle = j % 20 === 0;
      const side = Math.cos(tm) < 0 ? WEHDAT : FAISALY;
      const r = rand(), seat = aisle ? '#b9b4ab' : r < 0.06 ? '#c0392b' : r < 0.17 ? SKIN[Math.floor(rand() * 4)] : side[Math.floor(rand() * side.length)];
      quad([[x00, y1, z00], [x01, y1, z01], [x11, y1, z11], [x10, y1, z10]], seat);                      // the step people sit on
      c.set(seat).multiplyScalar(aisle ? 0.85 : 0.72); // its riser: the people's bodies, in the shade of the row above
      quad([[x00, y0, z00], [x01, y0, z01], [x01, y1, z01], [x00, y1, z00]], '#' + c.getHexString());
    }
  }
  for (let j = 0; j < S; j++) { // the wall at the front, round the track
    const t0 = (j / S) * Math.PI * 2, t1 = ((j + 1) / S) * Math.PI * 2, [x0, z0] = onEllipse(A0, B0, t0), [x1, z1] = onEllipse(A0, B0, t1);
    quad([[x0, 0.3, z0], [x1, 0.3, z1], [x1, Y0, z1], [x0, Y0, z0]], j % 8 < 4 ? '#ce1126' : '#ffffff'); // advertising boards in the flag's colours
    const [a0x, a0z] = onEllipse(A1, B1, t0), [a1x, a1z] = onEllipse(A1, B1, t1), [o0x, o0z] = onEllipse(FA, FB, t0), [o1x, o1z] = onEllipse(FA, FB, t1);
    quad([[a0x, TOP, a0z], [a1x, TOP, a1z], [o1x, TOP, o1z], [o0x, TOP, o0z]], CONCRETE2); // the walkway at the top
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  mesh.receiveShadow = true;
  return mesh;
}

// A picture on a canvas (the crests, the screens), loaded once.
function picture(src) {
  const im = new Image();
  im.src = src;
  return im;
}
const CRESTS = { wehdat: picture('img/club-wehdat.png?v=' + Math.floor(Date.now() / 60000)), faisaly: picture('img/club-faisaly.png?v=' + Math.floor(Date.now() / 60000)) };

// ---- the match: the players, the referee, the ball, the flags, the crests and the screens
const KITS = {
  wehdat: { shirt: '#1f8a3c', shorts: '#ffffff', socks: '#1f8a3c', keeper: '#f4c542' },
  faisaly: { shirt: '#1f5fb5', shorts: '#ffffff', socks: '#1f5fb5', keeper: '#f08a24' },
};
function playerMesh(shirt, shorts, socks, skin) {
  const g = new THREE.Group(), m = (c) => new THREE.MeshLambertMaterial({ color: c });
  const add = (geo, color, x, y, z) => { const o = new THREE.Mesh(geo, m(color)); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
  for (const s of [-1, 1]) {
    add(new THREE.BoxGeometry(0.18, 0.5, 0.18), socks, s * 0.13, 0.25, 0);
    add(new THREE.BoxGeometry(0.2, 0.42, 0.2), skin, s * 0.13, 0.66, 0);
    add(new THREE.BoxGeometry(0.2, 0.08, 0.3), '#111111', s * 0.13, 0.04, 0.05);
  }
  add(new THREE.BoxGeometry(0.52, 0.3, 0.3), shorts, 0, 0.95, 0);
  add(new THREE.BoxGeometry(0.56, 0.62, 0.32), shirt, 0, 1.4, 0);
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.14, 0.55, 0.14), shirt, s * 0.36, 1.28, 0);
  add(new THREE.SphereGeometry(0.17, 8, 6), skin, 0, 1.92, 0);
  add(new THREE.SphereGeometry(0.175, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), '#2b2420', 0, 1.95, 0);
  g.scale.setScalar(1.45); // a little bigger than life, to read from the stands' height
  g.traverse((o) => { o.raycast = () => {}; });
  return g;
}
// 4-4-2, as fractions of the half the team defends (x from its own goal line, z across)
const SHAPE = [[0.03, 0], [0.22, -0.32], [0.2, -0.11], [0.2, 0.11], [0.22, 0.32], [0.45, -0.33], [0.42, -0.11], [0.42, 0.11], [0.45, 0.33], [0.7, -0.12], [0.7, 0.12]];

export function stadiumMatch() {
  const group = new THREE.Group(), rand = rng(77), players = [];
  // west: Al-Wehdat attacking east; east: Al-Faisaly attacking west
  for (const [team, dir] of [['wehdat', 1], ['faisaly', -1]]) {
    const k = KITS[team];
    SHAPE.forEach(([fx, fz], i) => {
      const keeper = i === 0, mesh = playerMesh(keeper ? k.keeper : k.shirt, keeper ? '#2b2d33' : k.shorts, keeper ? k.keeper : k.socks, SKIN[(i + (dir > 0 ? 0 : 2)) % 4]);
      group.add(mesh);
      players.push({ mesh, team, dir, keeper, home: [-dir * PITCH[0] / 2 + dir * fx * PITCH[0], fz * PITCH[1]], ph: rand() * 6.28, last: null });
    });
  }
  const ref = playerMesh('#1d2433', '#1d2433', '#1d2433', SKIN[1]);
  group.add(ref);
  const ballMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 1), new THREE.MeshLambertMaterial({ color: '#ffffff' }));
  ballMesh.castShadow = true; ballMesh.raycast = () => {};
  group.add(ballMesh);
  // where each player stands: home, the team pushing up and back with the play, a little drift
  const push = (t) => Math.sin(t * 0.11) * 14 + Math.sin(t * 0.037) * 8;
  const base = (p, t) => {
    const sx = p.keeper ? push(t) * 0.08 : push(t) * 0.55;
    return [p.home[0] + sx + Math.sin(t * 0.5 + p.ph) * 2.2, p.home[1] + Math.cos(t * 0.43 + p.ph * 1.3) * 2.6];
  };
  // the play: a long chain of passes and short runs with the ball, made once (seeded), looping
  const plays = [], LOOP = 240;
  let tt = 0, owner = 9;
  while (tt < LOOP) {
    const dribble = 1.2 + rand() * 2.2, pass = 0.9 + rand() * 1.4, own = players[owner];
    const mates = players.map((p, i) => i).filter((i) => i !== owner && players[i].team === own.team && !players[i].keeper);
    const lose = rand() < 0.22, rivals = players.map((p, i) => i).filter((i) => players[i].team !== own.team && !players[i].keeper);
    const to = lose ? rivals[Math.floor(rand() * rivals.length)] : mates[Math.floor(rand() * mates.length)];
    plays.push({ owner, to, t0: tt, t1: tt + dribble, t2: tt + dribble + pass });
    tt += dribble + pass; owner = to;
  }
  const playAt = (t) => { const T = ((t % LOOP) + LOOP) % LOOP; return plays.find((p) => T < p.t2) || plays[plays.length - 1]; };
  const ballAt = (t) => {
    const T = ((t % LOOP) + LOOP) % LOOP, p = playAt(t), off = t - T;
    const own = players[p.owner], to = players[p.to];
    if (T < p.t1) { // at the owner's feet, running a little forward
      const [x, z] = base(own, T + off), k = (T - p.t0) / (p.t1 - p.t0);
      return [x + own.dir * k * 4, 0.35 + 0.33, z, p.owner, k];
    }
    const [ax, az] = base(own, p.t1 + off), [bx, bz] = base(to, p.t2 + off), u = (T - p.t1) / (p.t2 - p.t1), d = Math.hypot(bx - ax, bz - az);
    return [ax + own.dir * 4 + (bx - ax - own.dir * 4) * u, 0.68 + Math.sin(u * Math.PI) * Math.min(6, d * 0.12), az + (bz - az) * u, -1, u, p.to];
  };
  // flags waving in the crowd, green to the west, blue to the east
  const flagGeo = new THREE.PlaneGeometry(1.6, 1.1).translate(0.8, 0.55, 0);
  const flags = new THREE.InstancedMesh(flagGeo, new THREE.MeshLambertMaterial({ vertexColors: false, side: THREE.DoubleSide }), 220);
  flags.raycast = () => {};
  const flagAt = [];
  for (let i = 0; i < 220; i++) {
    const th = rand() * Math.PI * 2, row = 2 + rand() * (ROWS - 4), a = A0 + row * RUN, b = B0 + row * RUN;
    const [x, z] = onEllipse(a, b, th), w = Math.cos(th) < 0;
    flags.setColorAt(i, new THREE.Color(w ? (i % 3 ? '#1f8a3c' : '#ffffff') : (i % 3 ? '#1f5fb5' : '#ffffff')));
    flagAt.push({ x, z, y: Y0 + row * RISE + 1.6, ph: rand() * 6.28, face: Math.atan2(-x, -z) });
  }
  group.add(flags);
  // the giant crests on the end stands, lying on the slope, and the two screens
  const slope = Math.atan(RISE / RUN);
  const tifo = (key, x) => {
    const tex = new THREE.Texture(CRESTS[key]);
    tex.colorSpace = THREE.SRGBColorSpace;
    const ready = () => { tex.needsUpdate = true; };
    if (CRESTS[key].complete && CRESTS[key].naturalWidth) ready(); else CRESTS[key].addEventListener('load', ready);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), new THREE.MeshLambertMaterial({ map: tex }));
    const s = Math.sign(x), row = 13, a = A0 + row * RUN;
    m.position.set(s * a, Y0 + (row + 1) * RISE + 0.3, 0); // just over the steps' front edges, which lie on the slope
    // lying on the seats: its top up the slope, facing the pitch
    const up = new THREE.Vector3(s * Math.cos(slope), Math.sin(slope), 0), right = new THREE.Vector3(0, 0, s), normal = new THREE.Vector3().crossVectors(right, up);
    m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, normal));
    m.raycast = () => {};
    group.add(m);
  };
  tifo('wehdat', -1); tifo('faisaly', 1);
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 1024; screenCanvas.height = 512;
  const screenTex = new THREE.CanvasTexture(screenCanvas);
  screenTex.colorSpace = THREE.SRGBColorSpace;
  const paintScreen = () => {
    const x = screenCanvas.getContext('2d');
    const bg = x.createLinearGradient(0, 0, 1024, 0);
    bg.addColorStop(0, '#0f5a2a'); bg.addColorStop(0.5, '#10151f'); bg.addColorStop(1, '#123f86');
    x.fillStyle = bg; x.fillRect(0, 0, 1024, 512);
    for (const [key, cx] of [['wehdat', 200], ['faisaly', 824]]) if (CRESTS[key].complete && CRESTS[key].naturalWidth) x.drawImage(CRESTS[key], cx - 150, 60, 300, 300);
    x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.direction = 'rtl';
    x.font = '800 120px Tajawal, system-ui, sans-serif'; x.fillText('×', 512, 210);
    x.font = '800 64px Tajawal, system-ui, sans-serif';
    x.fillText('الوحدات', 200, 430); x.fillText('الفيصلي', 824, 430);
    screenTex.needsUpdate = true;
  };
  paintScreen();
  for (const key of ['wehdat', 'faisaly']) CRESTS[key].addEventListener('load', paintScreen);
  for (const s of [-1, 1]) {
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(22, 11), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
    scr.position.set(s * (A1 - 2), TOP + 7.5, s * 14);
    scr.rotation.y = -s * Math.PI / 2;
    scr.raycast = () => {};
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 12.4, 23.4), new THREE.MeshLambertMaterial({ color: '#2b2d33' }));
    frame.position.set(s * (A1 - 1.5), TOP + 7.5, s * 14);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.6, 7, 0.6), new THREE.MeshLambertMaterial({ color: STEEL }));
    leg.position.set(s * (A1 - 1.5), TOP - 1.5 + 3.5, s * 14);
    group.add(scr, frame, leg);
  }
  // the pitch: stripes and lines on a canvas
  const pc = document.createElement('canvas');
  pc.width = 1050; pc.height = 680;
  const x2 = pc.getContext('2d'), k = 10;
  for (let i = 0; i < 14; i++) { x2.fillStyle = i % 2 ? '#4a9e3f' : '#56ad48'; x2.fillRect(i * 75, 0, 75, 680); }
  x2.strokeStyle = '#ffffff'; x2.lineWidth = 6;
  x2.strokeRect(3, 3, 1044, 674);
  x2.beginPath(); x2.moveTo(525, 0); x2.lineTo(525, 680); x2.stroke();
  x2.beginPath(); x2.arc(525, 340, 9.15 * k, 0, Math.PI * 2); x2.stroke();
  for (const s of [0, 1]) {
    const gx = s ? 1050 : 0, d = s ? -1 : 1;
    x2.strokeRect(s ? 1050 - 16.5 * k : 0, 340 - 20.16 * k, 16.5 * k, 40.32 * k);
    x2.strokeRect(s ? 1050 - 5.5 * k : 0, 340 - 9.16 * k, 5.5 * k, 18.32 * k);
    x2.beginPath(); x2.arc(gx + d * 11 * k, 340, 9.15 * k, d > 0 ? -0.93 : Math.PI - 0.93, d > 0 ? 0.93 : Math.PI + 0.93); x2.stroke();
    x2.fillStyle = '#ffffff'; x2.beginPath(); x2.arc(gx + d * 11 * k, 340, 5, 0, 7); x2.fill();
  }
  const pitchTex = new THREE.CanvasTexture(pc);
  pitchTex.colorSpace = THREE.SRGBColorSpace; pitchTex.anisotropy = 4;
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(PITCH[0] + 1, PITCH[1] + 1).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: pitchTex }));
  pitch.position.y = 0.345; pitch.receiveShadow = true; pitch.raycast = () => {};
  group.add(pitch);

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(1, 1, 1), pv = new THREE.Vector3();
  const update = (t) => {
    const [bx, by, bz, ownerIdx, , toIdx] = ballAt(t);
    ballMesh.position.set(bx, by, bz);
    ballMesh.rotation.set(t * 6, 0, t * 4);
    players.forEach((p, i) => {
      let [x, z] = base(p, t);
      if (i === ownerIdx) { x = bx - p.dir * 0.6; z = bz; }
      else if (i === toIdx) { const [tx, tz] = base(p, t + 0.3); x = tx; z = tz; }
      else if (!p.keeper) { const pull = 0.12; x += (bx - x) * pull; z += (bz - z) * pull; } // everyone leans towards the ball
      if (p.keeper) z = Math.max(-5, Math.min(5, bz * 0.12 + z * 0.3));
      const moving = p.last ? Math.hypot(x - p.last[0], z - p.last[1]) : 0;
      const yaw = moving > 0.002 ? Math.atan2(x - p.last[0], z - p.last[1]) : Math.atan2(bx - x, bz - z);
      p.mesh.position.set(x, 0.34 + Math.abs(Math.sin(t * 9 + p.ph)) * 0.1, z);
      p.mesh.rotation.y = yaw;
      p.last = [x, z];
    });
    ref.position.set(bx * 0.7, 0.34, bz * 0.6 + 6);
    ref.rotation.y = Math.atan2(bx - ref.position.x, bz - ref.position.z);
    flagAt.forEach((f, i) => {
      e.set(0, f.face + Math.sin(t * 2.4 + f.ph) * 0.5, Math.sin(t * 3.1 + f.ph) * 0.25);
      q.setFromEuler(e);
      m4.compose(pv.set(f.x, f.y + Math.abs(Math.sin(t * 2 + f.ph)) * 0.4, f.z), q, sc);
      flags.setMatrixAt(i, m4);
    });
    flags.instanceMatrix.needsUpdate = true;
  };
  update(0);
  return { group, update };
}

// ---- at night: the floodlights on, the pitch washed white, the roof lit from below
export function stadiumLights() {
  const group = new THREE.Group(), mats = [];
  const glow = (color, strength) => {
    const m = new THREE.MeshBasicMaterial({ color, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
    mats.push([m, strength]);
    return m;
  };
  const shade = (geo, f) => {
    const p = geo.attributes.position, col = [];
    for (let i = 0; i < p.count; i++) { const v = f(p.getX(i), p.getY(i), p.getZ(i), i); col.push(v, v, v); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return geo;
  };
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.raycast = () => {}; group.add(o); return o; };
  add(shade(new THREE.PlaneGeometry(PITCH[0] + 14, PITCH[1] + 14).rotateX(-Math.PI / 2), (x, y, z) => 0.55 + 0.45 * (1 - Math.min(1, Math.hypot(x / 60, z / 41)))), glow('#ffffff', 0.32), 0, 0.42, 0);
  const up = new THREE.Vector3(0, 1, 0);
  for (const [x, z] of MASTS) { // the beams from each mast down onto the pitch
    const a = new THREE.Vector3(x, MAST_H + 2, z), b = new THREE.Vector3(x * 0.25, 0.4, z * 0.25), len = a.distanceTo(b);
    const m = add(shade(new THREE.CylinderGeometry(4, 22, len, 16, 6, true).translate(0, -len / 2, 0), (px, py) => 0.25 + 0.5 * (1 + py / len)), glow('#fff6dd', 0.05), a.x, a.y, a.z);
    m.quaternion.setFromUnitVectors(up.clone().negate(), b.clone().sub(a).normalize());
    add(shade(new THREE.PlaneGeometry(10, 6), () => 1), glow('#fffbe8', 0.9), x, MAST_H + 2.5, z).rotation.y = Math.atan2(-x, -z);
  }
  return { group, mats };
}
stadium.bowl = stadiumBowl;
stadium.match = stadiumMatch;
stadium.lights = stadiumLights;
