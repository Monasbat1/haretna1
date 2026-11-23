// «ساحة الأعلام»: one city block (29 x 17) where every country of the city
// flies its flag, all flags the same size, and a big screen at the back ranks
// the countries with the most houses. Built with the house kit: +z is the
// entrance (towards the visitor), y = 0 is the top of the block.
// The fixed parts are baked into one mesh (square); city.js adds the flags,
// their plaques and the screen picture, which change as the city grows.
import { box, cyl, ball, tree, taper, ablaq, shine } from './kit.js';

export const FLAG_W = 1.8, FLAG_H = 1.35, POLE_TOP = 5.6;
export const SCREEN = { z: -5.71, w: 10, h: 5.625, y: 3.7 + 5.625 / 2 }; // the picture: centre and size (raised over the podium, 2026-11-23)

// «منصة الأبطال» (2026-11-23, promised in reel 45): the weekly race's first three
// countries on a podium in the middle of the square, where the fountain was. Gold
// in the middle, silver on its left (as seen from the gate), bronze on its right;
// a pole at the back of each step for the country's flag, a plate on each step's
// front (the place, the name, the houses), and its sign (the title, then the time left
// or the week) on top of the screen, over the whole square; drawn by city.js.
export const PODIUM = {
  z: -0.9, d: 2.6, w: 3.0, base: 0.36,
  steps: [{ place: 1, x: 0, h: 1.9 }, { place: 2, x: -3.1, h: 1.3 }, { place: 3, x: 3.1, h: 0.85 }],
  pole: 2.9, flag: 1.6,                          // the pole above each step, and the flag's size against the square's flags
  sign: { y: SCREEN.y + SCREEN.h / 2 + 1.1, z: SCREEN.z + 0.02, w: 10, h: 1.1 }, // the sign on top of the screen
};
const GOLD = shine('#e2bb4f', 1.6);
const FONT = 'Tajawal, system-ui, sans-serif';

// Where the flags stand, the leaders first: the back row next to the screen,
// then down the two sides, then the front row either side of the gate.
export const SPOTS = [];
for (const x of [6.7, 8.7, 10.7]) SPOTS.push([-x, -7.0], [x, -7.0]);
for (const z of [-4.4, -1.8, 0.8, 3.4, 6.0]) SPOTS.push([-12.6, z], [12.6, z]);
for (const x of [5.6, 7.8, 10.0]) SPOTS.push([-x, 6.6], [x, 6.6]);

export function square(g) {
  // paving, with a border and an eight-pointed star round the fountain
  box(g, '#ece4d0', 0, 0, 0, 28.4, 0.06, 16.4);
  for (const s of [-1, 1]) { box(g, '#cdb98f', 0, 0.06, s * 7.9, 28.4, 0.02, 0.4); box(g, '#cdb98f', s * 13.9, 0.06, 0, 0.4, 0.02, 16.4); }
  box(g, '#c9a96e', 0, 0.06, 1.0, 5.2, 0.02, 5.2);
  box(g, '#c9a96e', 0, 0.06, 1.0, 5.2, 0.02, 5.2, Math.PI / 4);
  box(g, '#efe7d4', 0, 0.075, 1.0, 4.1, 0.02, 4.1);
  box(g, '#efe7d4', 0, 0.075, 1.0, 4.1, 0.02, 4.1, Math.PI / 4);
  for (const z of [5.1, 6.8]) box(g, '#d9c8a2', 0, 0.06, z, 2.4, 0.02, 1.2); // the path in from the gate
  podium(g);
  // hedges and cypresses behind the flags
  box(g, '#3f7d4f', 0, 0.06, -7.95, 22, 0.9, 0.6);
  for (const s of [-1, 1]) box(g, '#3f7d4f', s * 13.55, 0.06, -0.6, 0.6, 0.9, 13.4);
  for (const [x, z] of [[-13.3, -7.6], [13.3, -7.6], [-12.6, 7.6], [12.6, 7.6]]) tree(g, x, z, 1.25, 'cypress');
  // the screen: legs, a dark frame and a gold rim (the picture itself is added by city.js)
  const Z = SCREEN.z, top = SCREEN.y + SCREEN.h / 2;
  for (const s of [-1, 1]) {
    box(g, '#2b2f38', s * 3.2, 0.06, Z - 0.3, 0.35, SCREEN.y - SCREEN.h / 2, 0.35);
    box(g, '#e6dcc6', s * 3.2, 0.06, Z - 0.3, 0.9, 0.25, 0.9);
  }
  box(g, '#22262e', 0, SCREEN.y - SCREEN.h / 2 - 0.25, Z - 0.2, SCREEN.w + 0.5, SCREEN.h + 0.5, 0.36);
  box(g, '#e2bb4f', 0, top + 0.25, Z - 0.2, SCREEN.w + 0.7, 0.12, 0.5);
  // the gate: two striped pillars, a lintel for the name, two lanterns
  for (const s of [-1, 1]) {
    ablaq(g, s * 2.9, 0.06, 7.6, 0.8, 4.3, 0.8, 9);
    box(g, '#f4eee2', s * 2.9, 4.36, 7.6, 1.0, 0.16, 1.0);
    box(g, '#f6d77a', s * 2.9, 4.52, 7.6, 0.36, 0.48, 0.36);
  }
  box(g, '#e8dcc0', 0, 3.4, 7.6, 6.6, 0.95, 0.7);
}
square.top = PODIUM.sign.y + PODIUM.sign.h / 2 + 0.6;

// The podium: a stone platform, three steps faced in gold, silver and bronze, their
// poles, a cup on the top step and the sign's frame behind.
function podium(g) {
  const P = PODIUM, z = P.z, colors = { 1: GOLD, 2: '#c9ced6', 3: '#c98a52' };
  box(g, '#d9cdb3', 0, 0.06, z + 0.2, 3 * P.w + 1.0, P.base - 0.06, P.d + 1.6);       // the platform
  box(g, '#b23a3a', 0, P.base, z + P.d / 2 + 0.55, 2.0, 0.02, 0.9);                    // a red carpet up to it
  for (const s of P.steps) {
    box(g, '#f1ebde', s.x, P.base, z, P.w, s.h, P.d);                                  // the step
    box(g, colors[s.place], s.x, P.base + s.h - 0.12, z, P.w + 0.08, 0.14, P.d + 0.08); // its coloured lip
    box(g, colors[s.place], s.x, P.base, z + P.d / 2 - 0.02, P.w, 0.12, 0.1);           // and foot
    const top = P.base + s.h;
    cyl(g, '#f2f2f0', s.x, top, z - P.d / 2 + 0.35, 0.07, P.pole + (s.place === 1 ? 0.6 : 0), 8); // the pole
    ball(g, GOLD, s.x, top + P.pole + (s.place === 1 ? 0.6 : 0) + 0.05, z - P.d / 2 + 0.35, 0.12);
  }
  // the cup on the top step
  const cx = -0.75, cz = z + 0.45, cy = P.base + P.steps[0].h;
  box(g, '#3a2f25', cx, cy, cz, 0.6, 0.22, 0.6);
  taper(g, GOLD, cx, cy + 0.22, cz, 0.16, 0.08, 0.3);
  taper(g, GOLD, cx, cy + 0.52, cz, 0.1, 0.36, 0.55);
  for (const s of [-1, 1]) ball(g, GOLD, cx + s * 0.38, cy + 0.82, cz, 0.12);
  // the sign's frame on top of the screen
  const S = P.sign;
  for (const s of [-1, 1]) box(g, GOLD, s * 3.2, S.y - S.h / 2 - 0.5, S.z - 0.2, 0.2, 0.5, 0.2);
  box(g, '#22262e', 0, S.y - S.h / 2 - 0.12, S.z - 0.2, S.w + 0.3, S.h + 0.24, 0.3);
  box(g, GOLD, 0, S.y + S.h / 2 + 0.12, S.z - 0.2, S.w + 0.4, 0.1, 0.42);
}

// One flagpole on its striped stone base (the flag is added by city.js).
export function post(g) {
  ablaq(g, 0, 0, 0, 0.62, 0.62, 0.62, 3);
  cyl(g, '#f2f2f0', 0, 0.62, 0, 0.06, POLE_TOP - 0.68, 8);
  ball(g, '#e2bb4f', 0, POLE_TOP + 0.04, 0, 0.1);
}

// Text on a rounded board (the plaques under the flags and the name on the gate).
export function drawPlaque(ctx, w, h, text, { bg = '#fbf7ee', fg = '#1d2433', size = 64 } = {}) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.roundRect(0, 0, w, h, Math.min(26, h / 3)); ctx.fill();
  ctx.fillStyle = fg;
  ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let s = size;
  do { ctx.font = `800 ${s}px ${FONT}`; s -= 2; } while (ctx.measureText(text).width > w - 40 && s > 18);
  ctx.fillText(text, w / 2, h / 2 + 4);
}

// The screen: the five countries with the most houses, with their flags and a bar each.
// countries: [{ code, name, n }] most houses first; flagImg(code) -> something drawable or null.
export function drawBoard(ctx, W, H, countries, flagImg) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#16224a'); bg.addColorStop(1, '#0b1230');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.direction = 'rtl'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd56a';
  ctx.font = `800 84px ${FONT}`;
  ctx.fillText('🏆 الدول المتصدرة بحارتنا', W / 2, 88);
  const top = countries.slice(0, 5), most = Math.max(1, top[0] ? top[0].n : 1);
  const medal = ['#f2c94c', '#d7dbe0', '#d08a50'];
  if (!top.length) {
    ctx.fillStyle = '#ffffff'; ctx.font = `700 60px ${FONT}`;
    ctx.fillText('أول علم بيرتفع مع أول تعليق فيه اسم بلد', W / 2, H / 2);
  }
  top.forEach((c, i) => {
    const y = 210 + i * 128, right = W - 70;
    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.08)';
    ctx.beginPath(); ctx.roundRect(50, y - 56, W - 100, 112, 22); ctx.fill();
    ctx.fillStyle = medal[i] || '#5d6a8f';
    ctx.beginPath(); ctx.arc(right - 42, y, 40, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = i < 3 ? '#1d2433' : '#ffffff';
    ctx.textAlign = 'center'; ctx.font = `800 52px ${FONT}`;
    ctx.fillText(String(i + 1), right - 42, y + 4);
    const img = flagImg(c.code);
    if (img) {
      ctx.drawImage(img, right - 210, y - 42, 112, 84);
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.strokeRect(right - 210, y - 42, 112, 84);
    }
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'right'; ctx.font = `800 58px ${FONT}`;
    ctx.fillText(c.name, right - 240, y + 4);
    const barR = right - 560, barL = 300, len = Math.max(32, (barR - barL) * (c.n / most));
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.beginPath(); ctx.roundRect(barL, y - 16, barR - barL, 32, 16); ctx.fill();
    const grad = ctx.createLinearGradient(barR - len, 0, barR, 0);
    grad.addColorStop(0, '#e1306c'); grad.addColorStop(1, '#f77737');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.roundRect(barR - len, y - 16, len, 32, 16); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.font = `800 54px ${FONT}`;
    ctx.direction = 'ltr';
    ctx.fillText(`${c.n.toLocaleString('en-US')} 🏠`, 80, y + 4);
    ctx.direction = 'rtl';
  });
  ctx.textAlign = 'center'; ctx.fillStyle = '#aab6d8'; ctx.font = `500 42px ${FONT}`;
  ctx.fillText('🚩 علّق واكتب بلدك… ليرتفع علمها هون', W / 2, H - 46);
}
