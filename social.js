// الدردشة (عامة وخاصة) + مزامنة الشخصيات + زر إخفاء الأزرار + عصا الحركة.
// هوية المتابع: حساب Firebase مجهول (Anonymous) على جهازه + حجز اسم بيته (claims/<الاسم> = uid).
// الكتابة مسموحة فقط للاسم المحجوز لجهازك (انظر rules-chat.txt). بدون SDK: REST فقط.
const KEY = 'AIzaSyCVJclfpEp9Jo9879C3RfZKiEdBUibwrxI'; // مفتاح الويب عام بطبيعته، الحماية في القواعد
const DB = 'https://ahmad-662ee-default-rtdb.firebaseio.com';
const LS = {
  get: (k) => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* نافذة خاصة */ } },
};
const norm = (s) => String(s || '').trim().replace(/^@+/, '').toLowerCase();
const OKNAME = /^[a-z0-9._]{1,30}$/;
const key = (n) => n.replace(/\./g, ','); // مفاتيح القاعدة لا تقبل النقطة
const unkey = (k) => k.replace(/,/g, '.');
const SV = { '.sv': 'timestamp' };

// ---------------------------------------------------------------- الحساب المجهول
const A = { id: '', refresh: '', exp: 0, uid: '' };
try { Object.assign(A, JSON.parse(LS.get('hzAuth') || '{}')); A.id = ''; A.exp = 0; } catch (e) { /* فارغ */ }
const keep = () => LS.set('hzAuth', JSON.stringify({ refresh: A.refresh, uid: A.uid }));
async function jpost(url, body, form) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': form ? 'application/x-www-form-urlencoded' : 'application/json' },
    body: form ? new URLSearchParams(body).toString() : JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(String((j.error && j.error.message) || r.status).split(' ')[0]);
  return j;
}
let tokenP = null;
function token() {
  if (A.id && Date.now() < A.exp - 60000) return Promise.resolve(A.id);
  if (tokenP) return tokenP;
  tokenP = (async () => {
    if (A.refresh) {
      try {
        const j = await jpost('https://securetoken.googleapis.com/v1/token?key=' + KEY, { grant_type: 'refresh_token', refresh_token: A.refresh }, true);
        Object.assign(A, { id: j.id_token, refresh: j.refresh_token, uid: j.user_id, exp: Date.now() + Number(j.expires_in) * 1000 });
        keep(); return A.id;
      } catch (e) { A.refresh = ''; }
    }
    const j = await jpost('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + KEY, { returnSecureToken: true });
    Object.assign(A, { id: j.idToken, refresh: j.refreshToken, uid: j.localId, exp: Date.now() + Number(j.expiresIn) * 1000 });
    keep(); return A.id;
  })().finally(() => { tokenP = null; });
  return tokenP;
}
async function db(method, path, body, q = '', authed = true, keepalive = false) {
  const tok = authed ? await token() : '';
  const qs = [q, tok ? 'auth=' + encodeURIComponent(tok) : ''].filter(Boolean).join('&');
  const r = await fetch(`${DB}/${path}.json${qs ? '?' + qs : ''}`, {
    method, cache: 'no-store', keepalive,
    ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  });
  if (r.status === 401 || r.status === 403) throw new Error('DENIED');
  if (!r.ok) throw new Error('db ' + r.status);
  return r.json();
}
const LAST = (n) => `orderBy=${encodeURIComponent('"$key"')}&limitToLast=${n}`;

export const me = () => LS.get('hzName');
async function claim(name) {
  await token();
  const k = key(name), cur = await db('GET', 'claims/' + k, undefined, '', false);
  if (cur && cur !== A.uid) throw new Error('TAKEN');
  if (!cur) await db('PUT', 'claims/' + k, A.uid);
  LS.set('hzName', name);
}
const why = (e) => e.message === 'TAKEN' ? 'هذا الاسم محجوز من جهاز آخر. إن كان حسابك فراسل الأدمن ليفكّ الحجز.'
  : e.message === 'DENIED' ? 'مرفوض من القاعدة (قواعد الدردشة غير منشورة بعد؟)'
  : /ADMIN_ONLY|CONFIGURATION_NOT_FOUND|OPERATION_NOT_ALLOWED/.test(e.message) ? 'الدردشة غير مفعّلة بعد في Firebase (Anonymous)'
  : 'تعذّر الاتصال، جرّب بعد قليل';

// ---------------------------------------------------------------- الشخصيات
export async function putPlayer(x, z, r) {
  const n = me(); if (!n) return;
  await db('PUT', 'players/' + key(n), { x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10, r: Math.round(r * 100) / 100, t: SV }).catch(() => {});
}
export function dropPlayer() { const n = me(); if (n) db('DELETE', 'players/' + key(n), undefined, '', true, true).catch(() => {}); }
export async function getPlayers() {
  try {
    const p = await db('GET', 'players', undefined, '', false);
    return p && typeof p === 'object' ? Object.entries(p).map(([k, v]) => ({ key: k, name: unkey(k), ...v })) : [];
  } catch (e) { return []; }
}

// ---------------------------------------------------------------- الواجهة
const css = document.createElement('style');
css.textContent = `
.hz-dock{position:fixed;inset-inline-end:8px;top:46%;transform:translateY(-50%);display:flex;flex-direction:column;gap:8px;z-index:8}
.hz-dock button{width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.93);box-shadow:0 6px 18px rgba(30,50,90,.18);font-size:21px;cursor:pointer;padding:0}
.hz-dock button.on{box-shadow:inset 0 0 0 3px #e1306c,0 6px 18px rgba(30,50,90,.18)}
.hz-dock .walk-only{display:none}body.hz-walk .hz-dock .walk-only{display:block}
body.hz-hide header,body.hz-hide .nav,body.hz-hide .how-btn,body.hz-hide .how,body.hz-hide .adbar,body.hz-hide .hz-dock button:not(#hzHide),body.hz-hide .hz-joy{display:none!important}
body.hz-hide #hzHide{opacity:.5}
body.hz-walk .nav{display:none!important}
.hz-joy{display:none;position:fixed;inset-inline-end:14px;bottom:calc(18px + env(safe-area-inset-bottom));width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.35);border:2px solid rgba(255,255,255,.8);touch-action:none;z-index:8}
body.hz-walk .hz-joy{display:block}
.hz-joy i{position:absolute;left:50%;top:50%;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:rgba(225,48,108,.85);box-shadow:0 4px 12px rgba(0,0,0,.25)}
.hz-sheet{position:fixed;inset-inline:0;bottom:0;max-height:74vh;height:74vh;display:none;flex-direction:column;background:#fff;border-radius:18px 18px 0 0;box-shadow:0 -8px 30px rgba(30,50,90,.25);z-index:12;font-family:inherit;color:#1d2433}
.hz-sheet.show{display:flex}
.hz-top{display:flex;gap:6px;align-items:center;padding:10px 12px;border-bottom:1px solid #eef1f6}
.hz-top button{border:0;border-radius:12px;padding:9px 14px;font:inherit;font-weight:700;background:#eef1f6;color:#1d2433;cursor:pointer}
.hz-top button.on{background:#e1306c;color:#fff}.hz-top .x{margin-inline-start:auto;background:#eef1f6}
.hz-list{flex:1;overflow:auto;padding:10px 12px;display:flex;flex-direction:column;gap:6px}
.hz-msg{max-width:86%;padding:8px 12px;border-radius:14px;background:#f1f3f8;word-break:break-word;font-size:15px}
.hz-msg b{display:block;font-size:12px;color:#e1306c;cursor:pointer;direction:ltr;text-align:right}
.hz-msg.mine{align-self:flex-start;background:#ffe3ee}
.hz-send{display:flex;gap:6px;padding:10px 12px calc(10px + env(safe-area-inset-bottom));border-top:1px solid #eef1f6}
.hz-send input,.hz-box input{flex:1;min-width:0;border:1px solid #d9dee8;border-radius:12px;padding:10px 12px;font:inherit;font-size:16px}
.hz-send button,.hz-box button{border:0;border-radius:12px;padding:0 16px;font:inherit;font-weight:800;background:#e1306c;color:#fff;cursor:pointer}
.hz-box{display:flex;gap:6px;padding:8px 12px}
.hz-chips{display:flex;gap:6px;flex-wrap:wrap;padding:0 12px 8px}
.hz-chips span{padding:6px 12px;border-radius:999px;background:#eef1f6;cursor:pointer;direction:ltr;font-size:14px}
.hz-note{padding:8px 12px;color:#5d6678;font-size:13px}.hz-err{color:#d73a49}
@media(min-width:700px){.hz-sheet{inset-inline:auto 16px;width:400px;border-radius:18px;bottom:16px;height:66vh}}
`;
document.head.appendChild(css);
const h = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

let exists = () => true, nameWait = null;
function ask(msg) { // يطلب اسم البيت ويحجزه
  return new Promise((resolve) => {
    const sheet = ensureSheet(); open(sheet);
    const L = sheet._list; L.replaceChildren(); sheet._send.style.display = 'none'; sheet._tabs.style.display = 'none'; sheet._box.style.display = 'none'; sheet._chips.style.display = 'none';
    L.append(h('div', 'hz-note', msg || '🏠 اكتب اسم حسابك على إنستغرام (صاحب بيت بالمدينة) لتدخل الدردشة وتتجول بشخصيتك.'));
    const box = h('div', 'hz-box'), inp = h('input'), go = h('button', '', 'دخول'), err = h('div', 'hz-note hz-err');
    inp.placeholder = 'username'; inp.dir = 'ltr'; inp.autocapitalize = 'none'; inp.spellcheck = false;
    box.append(inp, go); L.append(box, err);
    const done = async () => {
      const n = norm(inp.value); err.textContent = '';
      if (!OKNAME.test(n)) { err.textContent = 'اسم غير صالح'; return; }
      if (!exists(n)) { err.textContent = 'ما لقينا بيتاً بهذا الاسم. علّق على المنشور وانتظر ليُبنى بيتك.'; return; }
      go.disabled = true;
      try { await claim(n); sheet._onClose = null; closeSheet(); resolve(n); } catch (e) { err.textContent = why(e); go.disabled = false; }
    };
    go.onclick = done; inp.onkeydown = (e) => { if (e.key === 'Enter') done(); };
    sheet._onClose = () => resolve('');
    inp.focus();
  });
}
let sheetEl = null, timer = 0, view = { tab: 'pub', peer: '' }, lastSig = '';
function ensureSheet() {
  if (sheetEl) return sheetEl;
  const s = h('section', 'hz-sheet'); s.setAttribute('role', 'dialog'); s.setAttribute('aria-label', 'الدردشة');
  const top = h('div', 'hz-top'), pub = h('button', 'on', '🌍 عامة'), dm = h('button', '', '🔒 خاصة'), x = h('button', 'x', '✕');
  top.append(pub, dm, x);
  const chips = h('div', 'hz-chips'), pbox = h('div', 'hz-box'), pin = h('input'), pgo = h('button', '', 'فتح');
  pin.placeholder = 'اسم صديقك (username)'; pin.dir = 'ltr'; pin.autocapitalize = 'none'; pbox.append(pin, pgo);
  const list = h('div', 'hz-list'), send = h('div', 'hz-send'), inp = h('input'), go = h('button', '', 'إرسال');
  inp.placeholder = 'اكتب رسالة…'; inp.maxLength = 300; send.append(inp, go);
  s.append(top, pbox, chips, list, send);
  Object.assign(s, { _list: list, _send: send, _tabs: top, _box: pbox, _chips: chips, _in: inp, _pin: pin });
  const setTab = (t, peer = '') => { view = { tab: t, peer }; pub.classList.toggle('on', t === 'pub'); dm.classList.toggle('on', t === 'dm'); lastSig = ''; render(); };
  pub.onclick = () => setTab('pub'); dm.onclick = () => setTab('dm');
  x.onclick = closeSheet;
  pgo.onclick = () => { const n = norm(pin.value); if (!OKNAME.test(n)) return; if (!exists(n)) { toastish('ما في بيت بهذا الاسم'); return; } contact(n); setTab('dm', n); pin.value = ''; };
  const sendNow = async () => {
    const t = inp.value.trim(); if (!t || go.disabled) return;
    go.disabled = true; setTimeout(() => { go.disabled = false; }, 1500); // مهلة صغيرة بين الرسائل
    try {
      const k = key(me());
      if (view.tab === 'pub') await db('POST', 'chat/public', { u: k, x: t, t: SV });
      else if (view.peer) await db('POST', `dm/${key(view.peer)}/${k}`, { x: t, t: SV });
      else return;
      inp.value = ''; lastSig = ''; render();
    } catch (e) { toastish(why(e)); if (e.message === 'DENIED') LS.set('hzName', ''); }
  };
  go.onclick = sendNow; inp.onkeydown = (e) => { if (e.key === 'Enter') sendNow(); };
  s._setTab = setTab; document.body.appendChild(s);
  return (sheetEl = s);
}
let toastEl = null;
function toastish(t) { const l = ensureSheet()._list; if (toastEl) toastEl.remove(); toastEl = h('div', 'hz-note hz-err', t); l.append(toastEl); setTimeout(() => toastEl && toastEl.remove(), 4000); }
const contacts = () => { try { return JSON.parse(LS.get('hzContacts') || '[]'); } catch (e) { return []; } };
const contact = (n) => { const c = contacts().filter((x) => x !== n); c.unshift(n); LS.set('hzContacts', JSON.stringify(c.slice(0, 20))); };
function bubble(list, u, text, mine) {
  const m = h('div', 'hz-msg' + (mine ? ' mine' : ''));
  if (!mine) { const b = h('b', '', '@' + u); b.onclick = () => { if (u !== me()) { contact(u); sheetEl._setTab('dm', u); } }; m.append(b); }
  m.append(document.createTextNode(text)); list.append(m);
}
async function render() {
  const s = sheetEl; if (!s || !s.classList.contains('show') || !me()) return;
  s._tabs.style.display = ''; s._send.style.display = ''; s._in.disabled = false;
  const pub = view.tab === 'pub'; s._box.style.display = pub ? 'none' : ''; s._chips.style.display = pub ? 'none' : '';
  const L = s._list, k = key(me());
  try {
    let rows = [];
    if (pub) {
      const o = await db('GET', 'chat/public', undefined, LAST(60), false) || {};
      rows = Object.entries(o).sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([id, v]) => ({ id, u: unkey(String(v.u)), x: String(v.x), t: v.t }));
    } else {
      try { for (const f of Object.keys(await db('GET', 'dm/' + k, undefined, 'shallow=true') || {})) contact(unkey(f)); } catch (e) { /* لا شيء بعد */ }
      s._chips.replaceChildren(...contacts().map((n) => { const c = h('span', '', '@' + n); c.onclick = () => s._setTab('dm', n); return c; }));
      if (view.peer) {
        const p = key(view.peer), get = (path) => db('GET', path, undefined, LAST(60)).catch(() => ({}));
        const [got, sent] = await Promise.all([get(`dm/${k}/${p}`), get(`dm/${p}/${k}`)]);
        rows = [...Object.entries(got || {}).map(([id, v]) => ({ id, u: view.peer, x: String(v.x), t: v.t })), ...Object.entries(sent || {}).map(([id, v]) => ({ id, u: me(), x: String(v.x), t: v.t }))].sort((a, b) => (a.t || 0) - (b.t || 0));
      }
    }
    const sig = view.tab + view.peer + rows.map((r) => r.id).join();
    if (sig === lastSig) return;
    lastSig = sig; const atEnd = L.scrollHeight - L.scrollTop - L.clientHeight < 80; L.replaceChildren();
    if (!pub && !view.peer) L.append(h('div', 'hz-note', 'اكتب اسم صديقك أعلاه، أو اضغط على اسم أحد في الدردشة العامة. الرسائل الخاصة يقرؤها المرسل والمستلم (ومشرف الموقع عند الحاجة).'));
    else if (pub) L.append(h('div', 'hz-note', 'دردشة عامة لأصحاب البيوت. كن لطيفاً 🌿'));
    for (const r of rows) bubble(L, r.u, r.x, r.u === me());
    if (atEnd || rows.length < 4) L.scrollTop = L.scrollHeight;
  } catch (e) { L.replaceChildren(h('div', 'hz-note hz-err', why(e))); }
}
function open(s) { s.classList.add('show'); clearInterval(timer); timer = setInterval(() => { if (!document.hidden) render(); }, 3000); }
function closeSheet() { const s = sheetEl; if (!s) return; s.classList.remove('show'); clearInterval(timer); if (s._onClose) { const f = s._onClose; s._onClose = null; f(); } }

export async function needName() { // اسم المتابع، أو يفتح نافذة الدخول
  if (me() && A.refresh) return me();
  if (me()) { try { await claim(me()); return me(); } catch (e) { LS.set('hzName', ''); } }
  if (!nameWait) nameWait = ask().finally(() => { nameWait = null; });
  return nameWait;
}
export async function openChat() {
  const n = await needName(); if (!n) return;
  const s = ensureSheet(); s._onClose = null; lastSig = ''; open(s); s._setTab('pub');
}

// ---------------------------------------------------------------- الأزرار
export function setup({ houseExists, onWalk, onSpeed, onMove }) {
  exists = houseExists;
  const dock = h('div', 'hz-dock'), mk = (id, txt, title, fn, cls) => { const b = h('button', cls || '', txt); b.id = id; b.title = title; b.setAttribute('aria-label', title); b.onclick = fn; dock.append(b); return b; };
  mk('hzChat', '💬', 'الدردشة', openChat);
  const walk = mk('hzWalk', '🚶', 'شخصيتي', () => onWalk());
  mk('hzSpeed', '⚡', 'السرعة', () => onSpeed(), 'walk-only');
  const hide = mk('hzHide', '🙈', 'إخفاء الأزرار', () => {
    const on = document.body.classList.toggle('hz-hide'); hide.textContent = on ? '👁️' : '🙈'; hide.title = on ? 'إظهار الأزرار' : 'إخفاء الأزرار';
  });
  document.body.appendChild(dock);
  const joy = h('div', 'hz-joy'), knob = h('i'); joy.append(knob); document.body.appendChild(joy);
  let id = null;
  const move = (e) => {
    const r = joy.getBoundingClientRect(), R = r.width / 2;
    let dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R); const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / R);
    dx = dx / d * k; dy = dy / d * k;
    knob.style.transform = `translate(${dx * R * 0.6}px,${dy * R * 0.6}px)`;
    onMove(Math.abs(dx) < 0.12 ? 0 : dx, Math.abs(dy) < 0.12 ? 0 : -dy);
  };
  joy.addEventListener('pointerdown', (e) => { id = e.pointerId; joy.setPointerCapture(id); move(e); });
  joy.addEventListener('pointermove', (e) => { if (e.pointerId === id) move(e); });
  for (const t of ['pointerup', 'pointercancel']) joy.addEventListener(t, (e) => { if (e.pointerId !== id) return; id = null; knob.style.transform = ''; onMove(0, 0); });
  return { walkBtn: walk };
}

// ---- للمتجر: نفس الحساب المجهول ونفس الاتصال بالقاعدة
export const myUid = () => A.uid;
export async function api(method, path, body, q = '', authed = true) { if (authed) await token(); return db(method, path, body, q, authed); }
export const TS = SV;
