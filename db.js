// قراءة بيانات المدينة من Firebase Realtime Database (قراءة فقط، بدون مفاتيح ولا SDK).
// الكتابة ممنوعة على الجميع إلا حساب الأدمن (انظر database.rules.json).
// إذا كانت القاعدة فارغة أو غير متاحة نرجع تلقائياً للملفين الثابتين api/config و api/houses.
const DB = 'https://ahmad-662ee-default-rtdb.firebaseio.com';
const NO_STORE = { cache: 'no-store' };

async function node(path) {
  const r = await fetch(`${DB}/${path}.json`, NO_STORE);
  if (!r.ok) throw new Error('db ' + r.status);
  return r.json();
}
const parse = (s) => (typeof s === 'string' ? JSON.parse(s) : null);

export async function getConfig() {
  try {
    const c = parse(await node('city/config'));
    if (c && typeof c === 'object') return c;
  } catch (err) { /* نرجع للملف الثابت */ }
  return (await fetch('api/config', NO_STORE)).json();
}

const TOWNS = ['JO', 'PS', 'LB', 'IQ', 'MA', 'EG', 'YE', 'SA']; // الدول التي لها حارة خاصة
let held = null;  // آخر بيوت حمّلناها من القاعدة
let seen = null;  // الـ meta الخاص بها
let names = null; // أسماء أصحاب البيوت (لمنع التكرار)
let sentPending = '';
const SAME = ['rev', 'fv', 'total', 'coins'];
const unchanged = (houses = []) => ({ rev: held.rev, fv: held.fv, coins: held.coins, total: held.total, houses });

// طلبات إنستغرام التي لم يدمجها الأدمن بعد (تعليق باسم الدولة): تظهر فوراً كبيوت جديدة بعد آخر بيت
async function pendingRows() {
  try {
    const p = await node('pending');
    if (!p || typeof p !== 'object') return [];
    names = names || new Set(held.houses.map((r) => String(r[1]).toLowerCase()));
    const taken = new Set(names), rows = [];
    for (const [k, v] of Object.entries(p).sort((a, b) => (a[1].t - b[1].t) || (a[0] < b[0] ? -1 : 1))) {
      const u = v && typeof v.u === 'string' ? v.u.toLowerCase() : '';
      if (!u || taken.has(u) || typeof v.c !== 'string') continue;
      taken.add(u);
      rows.push([held.houses.length + rows.length + 1, v.u, 1, v.c, TOWNS.includes(v.c) ? v.c : '', 0, 0]);
    }
    return rows;
  } catch (err) { return []; }
}
const sigOf = (rows) => rows.length + ':' + (rows.length ? rows[rows.length - 1][1] : '');

// كل 8 ثوانٍ نسأل عن meta الصغير فقط؛ لا نحمّل ~1MB من البيوت إلا إذا تغيّر شيء.
export async function getHousesData() {
  let meta = null;
  try { meta = await node('city/meta'); } catch (err) { if (held) return unchanged(); }
  if (meta && typeof meta.rev === 'number') {
    if (held && seen && SAME.every((k) => seen[k] === meta[k])) {
      const extra = await pendingRows(), sig = sigOf(extra);
      if (sig === sentPending) return unchanged();
      sentPending = sig;
      return unchanged(extra);
    }
    try {
      const h = parse(await node('city/houses'));
      if (h && Array.isArray(h.houses)) {
        held = h; seen = meta; names = null;
        const extra = await pendingRows(); sentPending = sigOf(extra);
        return { ...h, houses: h.houses.concat(extra) };
      }
    } catch (err) { if (held) return unchanged(); }
  }
  return (await fetch('api/houses?after=0', NO_STORE)).json();
}
