// Cloudflare Worker: يستقبل تعليقات إنستغرام (Webhook) ويحوّل "اسم الدولة" إلى بيت جديد في حارتها.
// لا يكتب مباشرة في المدينة: يضع الطلب في Firebase تحت /pending، والموقع يعرضه فوراً،
// والأدمن يدمجه في البيوت عند فتح اللوحة ثم النشر.
//
// المتغيرات السرية (Settings > Variables and Secrets):
//   VERIFY_TOKEN  أي نص تختاره (نفس النص تضعه في ميتا)
//   APP_SECRET    App Secret من إعدادات تطبيق ميتا
//   BOT_EMAIL / BOT_PASSWORD  حساب Firebase مخصص للبوت فقط (ليس حساب الأدمن)
//   MEDIA_ID      (اختياري) رقم منشور واحد فقط؛ إن تركته فارغاً يقبل كل المنشورات

const KEY = 'AIzaSyCVJclfpEp9Jo9879C3RfZKiEdBUibwrxI'; // مفتاح الويب العام
const DB = 'https://ahmad-662ee-default-rtdb.firebaseio.com';
const DEFAULT_COUNTRIES = {"SY": "سوريا", "EG": "مصر", "JO": "الأردن", "PS": "فلسطين", "LB": "لبنان", "IQ": "العراق", "SA": "السعودية", "AE": "الإمارات", "QA": "قطر", "KW": "الكويت", "BH": "البحرين", "OM": "عُمان", "YE": "اليمن", "LY": "ليبيا", "TN": "تونس", "DZ": "الجزائر", "MA": "المغرب", "SD": "السودان", "MR": "موريتانيا", "SO": "الصومال", "DJ": "جيبوتي", "KM": "جزر القمر", "TR": "تركيا", "IR": "إيران", "CA": "كندا", "US": "أمريكا", "GB": "بريطانيا", "DE": "ألمانيا", "FR": "فرنسا", "SE": "السويد", "NL": "هولندا", "BE": "بلجيكا", "AT": "النمسا", "CH": "سويسرا", "IT": "إيطاليا", "ES": "إسبانيا", "PT": "البرتغال", "NO": "النرويج", "DK": "الدنمارك", "FI": "فنلندا", "GR": "اليونان", "IE": "أيرلندا", "PL": "بولندا", "RO": "رومانيا", "HU": "هنغاريا", "CZ": "التشيك", "BG": "بلغاريا", "RS": "صربيا", "BA": "البوسنة", "AL": "ألبانيا", "CY": "قبرص", "MT": "مالطا", "RU": "روسيا", "UA": "أوكرانيا", "AU": "أستراليا", "NZ": "نيوزيلندا", "BR": "البرازيل", "AR": "الأرجنتين", "MX": "المكسيك", "CL": "تشيلي", "CO": "كولومبيا", "VE": "فنزويلا", "CU": "كوبا", "IN": "الهند", "PK": "باكستان", "BD": "بنغلاديش", "AF": "أفغانستان", "ID": "إندونيسيا", "MY": "ماليزيا", "SG": "سنغافورة", "PH": "الفلبين", "TH": "تايلاند", "VN": "فيتنام", "CN": "الصين", "JP": "اليابان", "KR": "كوريا", "AZ": "أذربيجان", "KZ": "كازاخستان", "UZ": "أوزبكستان", "IL": "إسرائيل", "NG": "نيجيريا", "ZA": "جنوب أفريقيا", "ET": "إثيوبيا", "ER": "إريتريا", "KE": "كينيا", "GH": "غانا", "SN": "السنغال", "NE": "النيجر", "TD": "تشاد", "ML": "مالي"};
const ALIASES = {
  SY: ['سوريه', 'الشام'], US: ['امريكا', 'الولايات المتحده', 'امريكه'], GB: ['بريطانيا', 'انجلترا', 'المملكه المتحده'],
  TR: ['تركيه'], AE: ['الامارات', 'الإمارات'], SA: ['السعوديه', 'المملكه العربيه السعوديه'], BA: ['البوسنه والهرسك'],
  KR: ['كوريا الجنوبيه'], IE: ['ايرلندا'], NZ: ['نيوزلندا'], CZ: ['تشيكيا'], PS: ['غزه'],
};

const norm = (s) => String(s || '').normalize('NFKC').toLowerCase()
  .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
  .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
  .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const stripAl = (s) => norm(s).split(' ').filter(Boolean).map((t) => (t.length > 3 && t.startsWith('ال') ? t.slice(2) : t)).join(' ');

// أول دولة مذكورة في التعليق (وعند التساوي الاسم الأطول)، أو null
function matchCountry(text, countries) {
  const hay = ' ' + stripAl(text) + ' ';
  let best = null;
  const consider = (code, phrase) => {
    const p = stripAl(phrase);
    if (!p) return;
    const at = hay.indexOf(' ' + p + ' ');
    if (at < 0) return;
    if (!best || at < best.at || (at === best.at && p.length > best.len)) best = { code, at, len: p.length };
  };
  for (const [code, name] of Object.entries(countries)) consider(code, name);
  for (const [code, list] of Object.entries(ALIASES)) for (const a of list) consider(code, a);
  return best ? best.code : null;
}

const enc = new TextEncoder();
async function validSig(buf, header, secret) {
  if (!header || !secret) return false;
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const hex = [...new Uint8Array(await crypto.subtle.sign('HMAC', key, buf))].map((b) => b.toString(16).padStart(2, '0')).join('');
  const want = 'sha256=' + hex;
  if (want.length !== header.length) return false;
  let d = 0;
  for (let i = 0; i < want.length; i++) d |= want.charCodeAt(i) ^ header.charCodeAt(i);
  return d === 0;
}

let botTok = null;
async function botToken(env) {
  if (botTok && Date.now() < botTok.exp - 60000) return botTok.id;
  const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + KEY, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env.BOT_EMAIL, password: env.BOT_PASSWORD, returnSecureToken: true }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error('bot login failed');
  botTok = { id: j.idToken, exp: Date.now() + Number(j.expiresIn) * 1000 };
  return botTok.id;
}

async function countries() {
  try {
    const r = await fetch(`${DB}/city/config.json`);
    const raw = r.ok ? await r.json() : null;
    // Firebase stores city/config as a JSON string; tolerate an object too.
    const c = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (c && c.countries && typeof c.countries === 'object' && !Array.isArray(c.countries)) {
      return { ...DEFAULT_COUNTRIES, ...c.countries };
    }
  } catch (e) { /* نستخدم القائمة المدمجة */ }
  return DEFAULT_COUNTRIES;
}

// يرجع 'added' أو 'exists'
async function addPending(username, code, env) {
  const key = username.replace(/\./g, ',');
  const url = `${DB}/pending/${encodeURIComponent(key)}.json`;
  // Read with the bot identity: pending usernames must not be publicly readable.
  const auth = encodeURIComponent(await botToken(env));
  const haveRes = await fetch(`${url}?auth=${auth}`, { cache: 'no-store' });
  if (!haveRes.ok) throw new Error('firebase read ' + haveRes.status);
  if (await haveRes.json()) return 'exists';
  const res = await fetch(`${url}?auth=${auth}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ u: username, c: code, t: Date.now() }),
  });
  if (res.ok) return 'added';
  if (res.status === 401 || res.status === 403) {
    // Another webhook may have created the same username at the same time.
    const check = await fetch(`${url}?auth=${auth}`, { cache: 'no-store' });
    if (check.ok && await check.json()) return 'exists';
  }
  throw new Error('firebase write ' + res.status);
}

async function processBody(body, env) {
  const out = { added: 0, exists: 0, ignored: 0 };
  if (!body || body.object !== 'instagram') return out;
  let list = null;
  for (const entry of body.entry || []) {
    for (const ch of entry.changes || []) {
      if (ch.field !== 'comments' || !ch.value) { out.ignored++; continue; }
      const v = ch.value, user = String((v.from && v.from.username) || '').toLowerCase();
      if (!/^[a-z0-9._]{1,30}$/.test(user) || (v.from && v.from.id === entry.id)) { out.ignored++; continue; }
      if (env.MEDIA_ID && !(v.media && v.media.id === env.MEDIA_ID)) { out.ignored++; continue; }
      list = list || await countries();
      const code = matchCountry(v.text, list);
      if (!code) { out.ignored++; continue; }
      out[await addPending(user, code, env)]++;
    }
  }
  return out;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname !== '/webhook') return new Response('haretna webhook ok');
    if (req.method === 'GET') { // تحقق ميتا عند حفظ الـ Callback URL
      const ok = url.searchParams.get('hub.mode') === 'subscribe' && env.VERIFY_TOKEN && url.searchParams.get('hub.verify_token') === env.VERIFY_TOKEN;
      return ok ? new Response(url.searchParams.get('hub.challenge') || '') : new Response('forbidden', { status: 403 });
    }
    if (req.method !== 'POST') return new Response('method', { status: 405 });
    const buf = await req.arrayBuffer();
    if (!(await validSig(buf, req.headers.get('x-hub-signature-256'), env.APP_SECRET))) return new Response('bad signature', { status: 401 });
    let body;
    try { body = JSON.parse(new TextDecoder().decode(buf)); } catch (e) { return new Response('bad json', { status: 400 }); }
    try { return Response.json(await processBody(body, env)); } catch (e) { return new Response('error', { status: 500 }); } // 500 = ميتا تعيد المحاولة
  },
};
