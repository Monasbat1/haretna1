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

let held = null; // آخر بيوت حمّلناها من القاعدة
let seen = null; // الـ meta الخاص بها
const SAME = ['rev', 'fv', 'total', 'coins'];
const unchanged = () => ({ rev: held.rev, fv: held.fv, coins: held.coins, total: held.total, houses: [] });

// كل 8 ثوانٍ نسأل عن meta الصغير فقط؛ لا نحمّل ~1MB من البيوت إلا إذا تغيّر شيء.
export async function getHousesData() {
  let meta = null;
  try { meta = await node('city/meta'); } catch (err) { if (held) return unchanged(); }
  if (meta && typeof meta.rev === 'number') {
    if (held && seen && SAME.every((k) => seen[k] === meta[k])) return unchanged();
    try {
      const h = parse(await node('city/houses'));
      if (h && Array.isArray(h.houses)) { held = h; seen = meta; return h; }
    } catch (err) { if (held) return unchanged(); }
  }
  return (await fetch('api/houses?after=0', NO_STORE)).json();
}
