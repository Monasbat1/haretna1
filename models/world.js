// Shared pieces for the countries around Syria: layered rock and cliffs,
// people, camels, street lamps and the horseshoe arch of the Maghreb.
import * as THREE from 'three';
import { GEO, put, box, cyl, taper, ball, face } from './kit.js';

export const ROCK = new THREE.DodecahedronGeometry(1, 0);
export const rock = (g, c, x, y, z, sx, sy = sx, sz = sx, ry = 0) => put(g, ROCK, c, x, y, z, sx, sy, sz, ry); // y = centre

// Sandstone and limestone: slabs stacked from y0 to y1, each one a little off
// the one below, so the rock reads in layers like the real cliffs.
export function strata(g, x, z, w, d, y0, y1, colors, rand, { jitter = 0.5, layer = [1.4, 2.6], ry = 0, shrink = 0, tilt = 0.12 } = {}) {
  let y = y0, i = Math.floor(rand() * colors.length);
  while (y < y1 - 0.2) {
    const h = Math.min(y1 - y, layer[0] + rand() * (layer[1] - layer[0]));
    const k = 1 - shrink * ((y - y0) / Math.max(1, y1 - y0));
    box(g, colors[i++ % colors.length], x + (rand() - 0.5) * jitter * 2, y, z + (rand() - 0.5) * jitter * 2,
      w * k * (0.9 + rand() * 0.2), h, d * k * (0.9 + rand() * 0.2), ry + (rand() - 0.5) * tilt);
    y += h;
  }
}

// A cliff along a path of [x, z, height] points.
export function cliff(g, pts, colors, rand, { step = 3.2, thick = 8, jitter = 0.6, layer, caps = null, y0 = 0 } = {}) {
  for (let p = 0; p < pts.length - 1; p++) {
    const [x0, z0, h0] = pts[p], [x1, z1, h1] = pts[p + 1];
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.ceil(len / step)), ry = Math.atan2(-(z1 - z0), x1 - x0);
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, h = (h0 + (h1 - h0) * t) * (0.86 + rand() * 0.28);
      strata(g, x, z, len / n + 1.8, thick, y0, h, colors, rand, { ry, jitter, layer, shrink: 0.28, tilt: jitter < 0.4 ? 0.05 : 0.12 });
      if (caps && rand() < 0.55) rock(g, caps[k % caps.length], x + (rand() - 0.5) * 2, h - 0.2, z + (rand() - 0.5) * 2, 1.3 + rand() * 1.4, 0.5 + rand() * 0.4, 1.3 + rand() * 1.4, rand() * 6);
    }
  }
}

const SKIN = ['#e0b48a', '#c98f62', '#f0c9a0', '#a8714a'];
const CLOTHES = ['#2c5f8a', '#c0392b', '#3f3f46', '#e7e2d6', '#6b4f8a', '#2e7d5b', '#d9a441', '#f4f1ea'];
export function person(g, x, y, z, i = 0, s = 1, { clothes = CLOTHES, hair = null } = {}) {
  const top = y + 1.05 * s;
  taper(g, clothes[i % clothes.length], x, y, z, 0.21 * s, 0.13 * s, 1.05 * s, 8);
  cyl(g, SKIN[i % SKIN.length], x, top + 0.03 * s, z, 0.13 * s, 0.24 * s, 8);
  put(g, GEO.halfBall, hair || (i % 4 === 1 ? '#f4f1ea' : i % 5 === 2 ? '#c0392b' : '#2b2420'), x, top + 0.25 * s, z, 0.14 * s, 0.12 * s, 0.14 * s);
}
// People scattered over an area [x0, x1, z0, z1]; `free(x, z)` says where they may stand.
export function crowd(g, n, [x0, x1, z0, z1], rand, { y = 0, free = () => true, ...opt } = {}) {
  for (let i = 0, tries = 0; i < n && tries < n * 20; tries++) {
    const x = x0 + rand() * (x1 - x0), z = z0 + rand() * (z1 - z0);
    if (!free(x, z)) continue;
    person(g, x, y, z, i, 0.9 + rand() * 0.2, opt);
    i++;
  }
}

export function camel(g, x, y, z, ry = 0, { color = '#c8a36f', saddle = '#b2263c' } = {}) {
  const f = face(g, x, z, ry, y);
  for (const [lx, lz] of [[-0.6, -0.2], [-0.6, 0.2], [0.6, -0.2], [0.6, 0.2]]) box(f, color, lx, 0, lz, 0.15, 1.3, 0.15);
  box(f, color, 0, 1.25, 0, 1.75, 0.6, 0.62);
  ball(f, color, -0.05, 1.82, 0, 0.48, 0.85);
  box(f, saddle, -0.05, 1.95, 0, 0.9, 0.12, 0.8);
  box(f, color, 1.0, 1.45, 0, 0.26, 1.05, 0.26).rotation.z = -0.55;
  box(f, color, 1.45, 2.22, 0, 0.6, 0.26, 0.26);
  box(f, color, -0.95, 1.2, 0, 0.08, 0.6, 0.08).rotation.z = 0.3; // tail
}

// A street lamp: shines at night.
export function lamp(g, x, y, z, { h = 3.4, color = '#2b2d33', light = '#f6d77a', arm = 0 } = {}) {
  cyl(g, color, x, y, z, 0.08, h, 8);
  if (arm) { box(g, color, x + arm / 2, y + h - 0.05, z, Math.abs(arm), 0.07, 0.07); ball(g, light, x + arm, y + h - 0.25, z, 0.2, 1.2); }
  else ball(g, light, x, y + h + 0.15, z, 0.22, 1.25);
}

// The country's big flag over its landmark. The model only has the pole; the
// cloth is a picture of the flag the city hangs at the returned spot (its
// centre), flying to the right of the pole.
export const BIG_FLAG = { w: 10, h: 7.5 };
export function flagPole(g, x, y, z, h) {
  cyl(g, '#8a8f98', x, y, z, 0.6, 0.7, 10);
  cyl(g, '#eef1f4', x, y + 0.7, z, 0.17, h - 0.7, 10);
  ball(g, '#e0b84a', x, y + h + 0.25, z, 0.32);
  return { x: x + 0.15, y: y + h - BIG_FLAG.h / 2 - 0.1, z };
}

// The horseshoe arch of Morocco: round, closing in a little below its widest point.
const horseshoes = new Map();
export function horseshoe(g, c, x, y, z, w, h, depth = 0.08, ry = 0) {
  const key = [w, h, depth].join('/');
  if (!horseshoes.has(key)) {
    const r = (w / 2) * 1.16, d = Math.sqrt(r * r - (w * w) / 4), hc = h - r, phi = Math.atan2(d, w / 2);
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, hc - d);
    s.absarc(0, hc, r, -phi, Math.PI + phi, false);
    s.lineTo(-w / 2, 0);
    horseshoes.set(key, new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 10 }).translate(0, 0, -depth / 2));
  }
  return put(g, horseshoes.get(key), c, x, y, z, 1, 1, 1, ry);
}

// Stepped battlements along a wall top, between two points (axis-aligned).
export function merlons(g, c, x1, z1, x2, z2, y, { w = 0.45, h = 0.5, gap = 0.9, thick = 0.3, stepped = false } = {}) {
  const len = Math.hypot(x2 - x1, z2 - z1), n = Math.max(1, Math.floor(len / gap));
  const alongX = Math.abs(x2 - x1) > Math.abs(z2 - z1);
  for (let i = 0; i <= n; i++) {
    const x = x1 + ((x2 - x1) * i) / n, z = z1 + ((z2 - z1) * i) / n;
    box(g, c, x, y, z, alongX ? w : thick, h, alongX ? thick : w);
    if (stepped) box(g, c, x, y + h, z, alongX ? w * 0.5 : thick, h * 0.6, alongX ? thick : w * 0.5);
  }
}
