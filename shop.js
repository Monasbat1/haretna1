// التسوق: بيوت فخمة + توثيق (علامة زرقاء/صفراء) + أثاث + سيارات + ترقية البيت.
// الدفع: شام كاش (صورة حساب الإدارة) أو عملات رقمية، ثم رمز المعاملة، ثم مؤقت لقبول الطلب.
// الطلب يُكتب في Firebase: orders/<uid>/<id> ويقبله الأدمن من لوحته فيظهر الأثر (owned/ verified/ أو تعديل البيت).
// بيانات المتجر (الأسعار، الحساب، الصورة، واتساب) في العقدة storecfg، يعدّلها الأدمن من لوحته وتُحفظ فوراً.
import * as social from './social.js';

const DB = 'https://ahmad-662ee-default-rtdb.firebaseio.com';
const key = (n) => String(n).replace(/\./g, ',');
const unkey = (k) => String(k).replace(/,/g, '.');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => '$' + Number(n || 0).toLocaleString('en-US');
const digits = (s) => String(s || '').replace(/[^0-9]/g, '');

export const DEFAULT_STORE = {
  whatsapp: '', hold: 15,
  sham: { account: '', name: '', qr: '' },
  crypto: [{ coin: 'USDT (TRC20)', addr: '' }, { coin: 'USDT (BEP20)', addr: '' }],
  items: [
    { id: 'villa', cat: 'house', kind: 'villa', emoji: '🏰', name: 'فيلا فخمة 👑', price: 30, desc: 'بيتك يتحوّل لفيلا بمسبح وتاج، مع لوحة اسمك الذهبية فوقه.' },
    { id: 'tower', cat: 'house', kind: 'tower', emoji: '🏢', name: 'برج سكني', price: 50, desc: 'ارفع بيتك لبرج شاهق (المستوى الأخير).' },
    { id: 'landmark', cat: 'house', kind: 'landmark', emoji: '🗽', name: 'معلم على بيتك', price: 20, desc: 'نصب ذهبي على سطح بيتك مع يوزرك فوقه، يُرى من بعيد.' },
    { id: 'upgrade', cat: 'house', kind: 'upgrade', emoji: '⬆️', name: 'ترقية مستوى', price: 8, desc: 'يرفع بيتك مستوى واحداً (حتى البرج). تكرّر الشراء لتصعد أكثر.' },
    { id: 'badge_blue', cat: 'badge', kind: 'badge_blue', emoji: '🔵', name: 'توثيق أزرق ✔', price: 10, desc: 'علامة زرقاء بجانب يوزرك على بيتك وفي الدردشة.' },
    { id: 'badge_gold', cat: 'badge', kind: 'badge_gold', emoji: '🟡', name: 'توثيق أصفر ✔', price: 25, desc: 'علامة صفراء ذهبية للمميزين، ولوحة اسمك تصير ذهبية.' },
    { id: 'sofa', cat: 'furn', kind: 'furn', emoji: '🛋️', name: 'كنبة', price: 5, desc: 'كنبة مريحة لصالون بيتك.' },
    { id: 'bed', cat: 'furn', kind: 'furn', emoji: '🛏️', name: 'سرير', price: 8, desc: 'سرير مزدوج بخشب فاخر.' },
    { id: 'tv', cat: 'furn', kind: 'furn', emoji: '📺', name: 'تلفزيون', price: 6, desc: 'شاشة كبيرة على الجدار.' },
    { id: 'table', cat: 'furn', kind: 'furn', emoji: '🍽️', name: 'طاولة طعام', price: 4, desc: 'طاولة دائرية للعائلة.' },
    { id: 'fridge', cat: 'furn', kind: 'furn', emoji: '🧊', name: 'براد', price: 7, desc: 'براد كبير للمطبخ.' },
    { id: 'wardrobe', cat: 'furn', kind: 'furn', emoji: '🚪', name: 'خزانة ثياب', price: 6, desc: 'خزانة خشبية ضخمة.' },
    { id: 'lamp', cat: 'furn', kind: 'furn', emoji: '💡', name: 'أباجورة', price: 2, desc: 'إضاءة دافئة للغرفة.' },
    { id: 'rug', cat: 'furn', kind: 'furn', emoji: '🟥', name: 'سجادة', price: 3, desc: 'سجادة حمراء للصالون.' },
    { id: 'plant', cat: 'furn', kind: 'furn', emoji: '🪴', name: 'نبتة', price: 2, desc: 'نبتة خضراء تنعش المكان.' },
    { id: 'car_red', cat: 'car', kind: 'car', color: '#d64545', emoji: '🚗', name: 'سيارة حمراء', price: 20, desc: 'سيارتك الخاصة: قُدها بالمدينة بعداد وغيارات وزمور.' },
    { id: 'car_blue', cat: 'car', kind: 'car', color: '#2f6fb5', emoji: '🚙', name: 'سيارة زرقاء', price: 20, desc: 'سيارة عائلية زرقاء.' },
    { id: 'car_taxi', cat: 'car', kind: 'car', color: '#f4c542', emoji: '🚕', name: 'سيارة صفراء', price: 22, desc: 'سيارة صفراء مميزة.' },
    { id: 'car_black', cat: 'car', kind: 'car', color: '#2b2f38', emoji: '🏎️', name: 'سيارة فاخرة سوداء', price: 35, desc: 'سيارة سوداء فاخرة.' },
  ],
};
const CATS = [['house', '🏡 بيوت'], ['badge', '✔️ توثيق'], ['furn', '🛋️ أثاث'], ['car', '🚗 سيارات'], ['orders', '📦 طلباتي']];
export const BADGE = { blue: { c: '#1d9bf0', t: 'موثّق أزرق' }, gold: { c: '#f5b800', t: 'موثّق أصفر' } };

async function getJson(path) { const r = await fetch(`${DB}/${path}.json`, { cache: 'no-store' }); if (!r.ok) throw new Error('db ' + r.status); return r.json(); }

export function createShop(ctx) {
  const { THREE, OrbitControls, toast, byName, makeTag, MAX_LEVEL, startDrive, houseInfo, goToHouse } = ctx;
  let store = DEFAULT_STORE, owned = {}, verified = {};
  const ONLINE = () => !!store;

  // ---------------------------------------------------------------- البيانات العامة
  async function loadStore() {
    try { const s = await getJson('storecfg'); if (typeof s === 'string') { const o = JSON.parse(s); store = { ...DEFAULT_STORE, ...o, sham: { ...DEFAULT_STORE.sham, ...(o.sham || {}) }, items: Array.isArray(o.items) && o.items.length ? o.items : DEFAULT_STORE.items }; } } catch (e) { /* الافتراضي */ }
  }
  async function loadPublic() {
    try { owned = (await getJson('owned')) || {}; } catch (e) { /* لا شيء */ }
    try { verified = (await getJson('verified')) || {}; } catch (e) { /* لا شيء */ }
    decorateAll();
  }
  const ownedOf = (name) => owned[key(String(name).toLowerCase())] || {};
  const badgeOf = (name) => verified[key(String(name).toLowerCase())] || '';
  const itemById = (id) => store.items.find((i) => i.id === id);
  const carOf = (name) => { const o = ownedOf(name); const id = Object.keys(o).find((k) => (itemById(k) || {}).cat === 'car'); return id ? (itemById(id).color || '#d64545') : ''; };

  // ---------------------------------------------------------------- زخرفة البيوت الفخمة: لوحة اسم + معلم ذهبي على السطح
  const decor = new Map(); // username -> { sprite, group, sig }
  function sigOf(rec) { const o = ownedOf(rec.username); return [rec.villa ? 'v' : '', o.landmark ? 'l' : '', badgeOf(rec.username)].join('|'); }
  function decorate(rec) {
    const o = ownedOf(rec.username), b = badgeOf(rec.username), lux = rec.villa || o.landmark || b;
    const cur = decor.get(rec.username);
    if (!lux) { if (cur) { ctx.scene.remove(cur.sprite); if (cur.group) ctx.scene.remove(cur.group); decor.delete(rec.username); } return; }
    if (cur && cur.sig === sigOf(rec)) return;
    if (cur) { ctx.scene.remove(cur.sprite); if (cur.group) ctx.scene.remove(cur.group); }
    const sprite = makeTag(rec.username, b || (rec.villa ? 'gold' : ''), true);
    sprite.position.set(rec.x, rec.top + 7.5 + (o.landmark ? 4 : 0), rec.z);
    ctx.scene.add(sprite);
    let group = null;
    if (o.landmark) {
      group = new THREE.Group();
      const gold = new THREE.MeshLambertMaterial({ color: '#f2c14e', emissive: '#6b4a00' });
      const add = (geo, y) => { const m = new THREE.Mesh(geo, gold); m.position.y = y; group.add(m); };
      add(new THREE.CylinderGeometry(1.2, 1.5, 0.6, 12), 0.3);
      add(new THREE.CylinderGeometry(0.3, 0.45, 3.2, 10), 2.2);
      add(new THREE.SphereGeometry(0.8, 14, 10), 4.2);
      add(new THREE.ConeGeometry(0.25, 1.1, 8), 5.4);
      group.position.set(rec.x, ctx.BASE_Y + rec.top, rec.z);
      group.traverse((m) => { if (m.isMesh) m.raycast = () => {}; });
      ctx.scene.add(group);
    }
    sprite.raycast = () => {};
    decor.set(rec.username, { sprite, group, sig: sigOf(rec) });
  }
  function decorateAll() {
    for (const rec of ctx.houses) if (rec) decorate(rec);
    for (const [k, o] of Object.entries(owned)) { void o; const r = byName.get(unkey(k)); if (r) decorate(r); }
    for (const k of Object.keys(verified)) { const r = byName.get(unkey(k)); if (r) decorate(r); }
  }
  function updateDecor() { // تظهر اللوحات عن قرب فقط (أقل من 520 وحدة من الكاميرا)
    const c = ctx.camera.position;
    for (const d of decor.values()) {
      const dx = d.sprite.position.x - c.x, dz = d.sprite.position.z - c.z, dist = Math.hypot(dx, dz, d.sprite.position.y - c.y);
      d.sprite.visible = dist < 520; if (d.group) d.group.visible = dist < 900;
      d.sprite.scale.setScalar(Math.max(1, dist / 90));
    }
  }

  // ---------------------------------------------------------------- الواجهة
  const css = document.createElement('style');
  css.textContent = `
  .sp-modal{position:fixed;inset:0;background:rgba(20,26,40,.62);display:none;align-items:flex-end;justify-content:center;z-index:14}
  .sp-modal.show{display:flex}
  .sp-sheet{width:min(560px,100%);height:min(86vh,720px);background:#fff;border-radius:22px 22px 0 0;display:flex;flex-direction:column;overflow:hidden;font-family:inherit;color:#1d2433;position:relative}
  @media(min-width:700px){.sp-modal{align-items:center}.sp-sheet{border-radius:22px}}
  .sp-head{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid #eef1f6}
  .sp-head h2{margin:0;font-size:19px;font-weight:800;flex:1}
  .sp-x{width:34px;height:34px;border-radius:50%;border:0;background:#eef1f6;color:#5d6678;font-size:16px;cursor:pointer;padding:0}
  .sp-tabs{display:flex;gap:6px;padding:8px 12px;overflow-x:auto;border-bottom:1px solid #eef1f6;scrollbar-width:none}
  .sp-tabs button{flex:none;border:0;border-radius:12px;padding:8px 13px;font:inherit;font-weight:700;background:#eef1f6;color:#1d2433;cursor:pointer}
  .sp-tabs button.on{background:linear-gradient(135deg,#f77737,#e1306c);color:#fff}
  .sp-body{flex:1;overflow:auto;padding:12px 14px 90px;display:flex;flex-direction:column;gap:10px}
  .sp-item{display:flex;gap:12px;align-items:center;padding:11px 12px;border-radius:16px;background:#f4f6fa;cursor:pointer}
  .sp-item .em{font-size:34px;flex:none;width:46px;text-align:center}
  .sp-item .gr{flex:1;min-width:0}.sp-item b{display:block;font-size:16px}.sp-item small{color:#5d6678;font-size:13px;line-height:1.4;display:block}
  .sp-price{font-weight:800;color:#e1306c;white-space:nowrap;font-variant-numeric:tabular-nums;font-size:17px}
  .sp-have{font-size:12px;color:#1f8a4c;font-weight:800}
  .sp-btn{display:block;width:100%;border:0;border-radius:15px;padding:14px;font:inherit;font-size:17px;font-weight:800;color:#fff;background:linear-gradient(135deg,#f77737,#e1306c);cursor:pointer;text-align:center;text-decoration:none}
  .sp-btn.ghost{background:#eef1f6;color:#1d2433}.sp-btn:disabled{opacity:.55}
  .sp-box{border-radius:16px;background:#f4f6fa;padding:12px 14px;display:flex;flex-direction:column;gap:8px}
  .sp-box h3{margin:0;font-size:15px}.sp-note{font-size:13px;color:#5d6678;line-height:1.55}
  .sp-qr{width:min(240px,70%);aspect-ratio:1;object-fit:contain;align-self:center;border-radius:14px;background:#fff;border:1px solid #e1e6ee}
  .sp-code{direction:ltr;text-align:center;font-weight:800;font-size:17px;padding:10px;border-radius:12px;background:#fff;border:1px dashed #b9c2d3;word-break:break-all;user-select:all;-webkit-user-select:all}
  .sp-row{display:flex;gap:8px}.sp-row>*{flex:1}
  .sp-pm{border:2px solid transparent;border-radius:14px;padding:11px 8px;background:#f4f6fa;font:inherit;font-weight:800;cursor:pointer;color:#1d2433}
  .sp-pm.on{border-color:#e1306c;background:#fff0f5}
  .sp-in{width:100%;border:1px solid #d9dee8;border-radius:12px;padding:12px;font:inherit;font-size:16px;direction:ltr;text-align:left}
  .sp-timer{font-size:34px;font-weight:800;text-align:center;font-variant-numeric:tabular-nums;color:#e1306c}
  .sp-st{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:800}
  .sp-st.p{background:#fff3cd;color:#8a6d00}.sp-st.a{background:#d8f5e3;color:#1f8a4c}.sp-st.r{background:#ffd9d9;color:#b02a37}.sp-st.x{background:#e6e9f0;color:#5d6678}
  .sp-wa{position:absolute;inset-inline-start:14px;bottom:14px;width:56px;height:56px;border-radius:50%;border:0;background:#25d366;color:#fff;font-size:28px;box-shadow:0 8px 20px rgba(0,0,0,.28);cursor:pointer;padding:0;z-index:3}
  .sp-pop{position:absolute;inset-inline-start:14px;bottom:80px;width:min(270px,calc(100% - 28px));background:#fff;border-radius:18px;box-shadow:0 12px 34px rgba(0,0,0,.3);padding:14px;display:none;flex-direction:column;gap:9px;z-index:3;border:2px solid #25d366}
  .sp-pop.show{display:flex}.sp-pop b{font-size:16px}.sp-pop a{background:#25d366}
  .hzin{position:fixed;inset:0;z-index:13;background:#1b2130;display:none}
  .hzin.show{display:block}.hzin canvas{width:100%;height:100%;display:block;touch-action:none}
  .hzin .bar{position:absolute;top:calc(10px + env(safe-area-inset-top));inset-inline:10px;display:flex;gap:8px;align-items:center;pointer-events:none}
  .hzin .bar>*{pointer-events:auto}.hzin .ttl{flex:1;padding:9px 14px;border-radius:14px;background:rgba(255,255,255,.93);font-weight:800;direction:ltr;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .hzin .bar button,.hzin .foot button{border:0;border-radius:14px;padding:10px 16px;font:inherit;font-weight:800;background:rgba(255,255,255,.95);color:#1d2433;cursor:pointer}
  .hzin .foot{position:absolute;bottom:calc(14px + env(safe-area-inset-bottom));inset-inline:10px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
  .hzin .foot .pk{background:linear-gradient(135deg,#f77737,#e1306c);color:#fff}
  .hzin .info{position:absolute;top:calc(64px + env(safe-area-inset-top));inset-inline-start:10px;padding:7px 12px;border-radius:12px;background:rgba(255,255,255,.88);font-size:13px;font-weight:700;pointer-events:none}`;
  document.head.appendChild(css);

  const modal = document.createElement('div');
  modal.className = 'sp-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `<div class="sp-sheet"><div class="sp-head"><h2 id="spT">🛍️ التسوق</h2><button class="sp-x" id="spX" aria-label="إغلاق">✕</button></div>
    <div class="sp-tabs" id="spTabs"></div><div class="sp-body" id="spB"></div>
    <button class="sp-wa" id="spWA" aria-label="تواصل مع الدعم عبر واتساب">💬</button>
    <div class="sp-pop" id="spPop"><b>💬 الدعم عبر واتساب</b><span class="sp-note" id="spPopT"></span><a class="sp-btn" id="spPopGo" target="_blank" rel="noopener noreferrer">فتح واتساب</a></div></div>`;
  document.body.appendChild(modal);
  const $ = (s) => modal.querySelector(s), body = $('#spB'), tabsEl = $('#spTabs');
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  let cat = 'house', timer = 0, ctxOrder = '';
  const stopTimer = () => { clearInterval(timer); timer = 0; };
  $('#spX').onclick = close;
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { close(); closeHouse(); } });
  function close() { modal.classList.remove('show'); stopTimer(); $('#spPop').classList.remove('show'); }
  function open(c) {
    if (c === 'orders') cat = 'orders'; else if (c) cat = c;
    modal.classList.add('show'); $('#spT').textContent = '🛍️ التسوق'; ctxOrder = ''; renderTabs(); renderCat();
  }
  function renderTabs() {
    tabsEl.replaceChildren(...CATS.map(([k, t]) => { const b = el('button', k === cat ? 'on' : '', t); b.type = 'button'; b.onclick = () => { cat = k; stopTimer(); renderTabs(); renderCat(); }; return b; }));
    tabsEl.style.display = '';
  }
  // نافذة واتساب المنبثقة
  $('#spWA').onclick = () => {
    const num = digits(store.whatsapp), p = $('#spPop');
    p.classList.toggle('show');
    $('#spPopT').textContent = num ? 'اكتب لنا لأي استفسار عن الدفع أو الطلب' + (ctxOrder ? ' (رقم طلبك: ' + ctxOrder + ')' : '') + '.' : 'رقم الدعم غير مضاف بعد من الإدارة.';
    const go = $('#spPopGo'); go.hidden = !num;
    if (num) go.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent('مرحباً، أحتاج مساعدة بخصوص طلبي في حارتنا' + (ctxOrder ? ' — رقم الطلب: ' + ctxOrder : '') + (social.me() ? ' — حسابي: @' + social.me() : ''));
  };

  function renderCat() {
    body.replaceChildren();
    if (cat === 'orders') return renderOrders();
    const mine = social.me() ? ownedOf(social.me()) : {};
    if (cat === 'badge' || cat === 'house') body.append(el('div', 'sp-note', cat === 'badge' ? 'العلامة تظهر بجانب يوزرك على بيتك وفوق لوحة اسمك وفي الدردشة.' : 'اشترِ ثم أرسل رمز المعاملة، وتتفعل الميزة فور قبول الإدارة لطلبك.'));
    for (const it of store.items.filter((i) => i.cat === cat)) {
      const have = mine[it.id] ? '<span class="sp-have">✓ تملكه</span>' : '';
      const row = el('div', 'sp-item', `<div class="em">${esc(it.emoji || '🎁')}</div><div class="gr"><b>${esc(it.name)}</b><small>${esc(it.desc || '')}</small>${have}</div><div class="sp-price">${money(it.price)}</div>`);
      row.onclick = () => viewItem(it);
      body.append(row);
    }
  }

  // ---- تفاصيل المنتج
  function viewItem(it) {
    tabsEl.style.display = 'none';
    body.replaceChildren();
    const back = el('button', 'sp-btn ghost', '→ رجوع'); back.onclick = () => { renderTabs(); renderCat(); };
    const buy = el('button', 'sp-btn', `شراء بسعر ${money(it.price)}`);
    buy.onclick = () => viewPay(it);
    body.append(back, el('div', 'sp-box', `<div style="font-size:64px;text-align:center">${esc(it.emoji || '🎁')}</div><h3 style="font-size:20px;text-align:center">${esc(it.name)}</h3><div class="sp-note" style="text-align:center">${esc(it.desc || '')}</div><div class="sp-price" style="text-align:center;font-size:26px">${money(it.price)}</div>`),
      el('div', 'sp-box', `<h3>ما الذي ستحصل عليه؟</h3><div class="sp-note">${esc(benefit(it))}</div>`), buy);
  }
  const benefit = (it) => ({
    villa: 'يتحوّل بيتك إلى فيلا بمسبح وتاج، وتظهر لوحة باسمك فوقه.', tower: 'يصير بيتك برجاً سكنياً.', landmark: 'نصب ذهبي على سطح بيتك مع يوزرك فوقه.',
    upgrade: 'يرتفع مستوى بيتك درجة واحدة، وتكبر غرف بيتك من الداخل.', badge_blue: 'علامة توثيق زرقاء ✔ بجانب يوزرك.', badge_gold: 'علامة توثيق صفراء ✔ ولوحة اسمك ذهبية.',
    furn: 'قطعة أثاث تظهر داخل بيتك عند الدخول إليه (زر «دخول البيت»).', car: 'سيارة خاصة تقودها في شوارع المدينة (زر 🚗) مع زمور وعداد وناقل أوتوماتيكي.',
  }[it.kind] || '');

  // ---- الدفع
  async function viewPay(it) {
    const name = await social.needName();
    if (!name) return;
    const rec = byName.get(name);
    if (['villa', 'tower', 'landmark', 'upgrade'].includes(it.kind) && !rec) { toast('ما لقينا بيتك بالمدينة'); return; }
    if (it.kind === 'upgrade' && rec && rec.level >= MAX_LEVEL) { toast('بيتك وصل لأعلى مستوى'); return; }
    if (it.kind === 'villa' && rec && rec.villa) { toast('بيتك فيلا أصلاً 👑'); return; }
    let method = 'sham', coinI = 0;
    const draw = () => {
      body.replaceChildren();
      const back = el('button', 'sp-btn ghost', '→ رجوع'); back.onclick = () => viewItem(it);
      body.append(back, el('div', 'sp-box', `<h3>${esc(it.emoji || '')} ${esc(it.name)}</h3><div class="sp-row"><span class="sp-note">الحساب: <b dir="ltr">@${esc(name)}</b></span><span class="sp-price" style="text-align:end">${money(it.price)}</span></div>`));
      const pm = el('div', 'sp-row');
      for (const [k, t] of [['sham', '💳 شام كاش'], ['crypto', '₿ عملات رقمية']]) { const b = el('button', 'sp-pm' + (method === k ? ' on' : ''), t); b.type = 'button'; b.onclick = () => { method = k; draw(); }; pm.append(b); }
      body.append(pm);
      let payName = '';
      if (method === 'sham') {
        const sh = store.sham, box = el('div', 'sp-box', '<h3>حوّل المبلغ إلى حساب الإدارة في شام كاش</h3>');
        if (sh.qr) { const im = el('img', 'sp-qr'); im.src = sh.qr; im.alt = 'صورة حساب شام كاش للإدارة'; box.append(im); } else box.append(el('div', 'sp-note', 'لم تضف الإدارة صورة الحساب بعد. تواصل مع الدعم عبر واتساب 💬'));
        if (sh.account) { const c = el('div', 'sp-code'); c.textContent = sh.account; box.append(c, copyBtn(sh.account, 'نسخ رقم الحساب')); }
        if (sh.name) box.append(el('div', 'sp-note', 'باسم: <b>' + esc(sh.name) + '</b>'));
        box.append(el('div', 'sp-note', 'المبلغ: <b>' + money(it.price) + '</b> (أو ما يعادله بالليرة السورية بسعر اليوم). بعد التحويل انسخ <b>رقم العملية</b> وضعه بالأسفل.'));
        body.append(box); payName = 'شام كاش';
      } else {
        const list = (store.crypto || []).filter((c) => c.addr), box = el('div', 'sp-box', '<h3>ادفع بعملة رقمية</h3>');
        if (!list.length) box.append(el('div', 'sp-note', 'لم تضف الإدارة عنوان محفظة بعد. تواصل مع الدعم عبر واتساب 💬'));
        else {
          const sel = el('div', 'sp-row'); list.forEach((c, i) => { const b = el('button', 'sp-pm' + (i === coinI ? ' on' : ''), esc(c.coin)); b.type = 'button'; b.onclick = () => { coinI = i; draw(); }; sel.append(b); });
          const cur = list[Math.min(coinI, list.length - 1)], code = el('div', 'sp-code'); code.textContent = cur.addr;
          box.append(sel, code, copyBtn(cur.addr, 'نسخ عنوان المحفظة'), el('div', 'sp-note', 'أرسل بنفس الشبكة المحددة فقط (<b>' + esc(cur.coin) + '</b>)، وإلا قد تضيع الأموال. المبلغ: <b>' + money(it.price) + '</b>. بعد الإرسال انسخ <b>TXID</b> وضعه بالأسفل.'));
          payName = cur.coin;
        }
        body.append(box);
      }
      const tx = el('input', 'sp-in'); tx.placeholder = 'رمز المعاملة (رقم العملية / TXID)'; tx.autocomplete = 'off'; tx.spellcheck = false; tx.maxLength = 120;
      const err = el('div', 'sp-note'); err.style.color = '#d73a49';
      const send = el('button', 'sp-btn', '✅ تمّ الدفع، أرسل الطلب');
      send.onclick = async () => {
        const v = tx.value.trim(); err.textContent = '';
        if (v.length < 4) { err.textContent = 'اكتب رمز المعاملة كما ظهر لك بعد الدفع.'; return; }
        if (!payName) { err.textContent = 'لا توجد طريقة دفع جاهزة الآن.'; return; }
        send.disabled = true;
        try {
          const r = await social.api('POST', 'orders/' + social.myUid(), { u: key(name), i: it.id, n: it.name, p: it.price, m: payName, tx: v, t: social.TS, s: 'p' });
          toast('📨 وصل طلبك للإدارة', 3000); viewOrder(r.name);
        } catch (e) { err.textContent = e.message === 'DENIED' ? 'مرفوض من القاعدة (قواعد المتجر غير منشورة بعد في Firebase).' : 'تعذّر الإرسال، جرّب بعد قليل.'; send.disabled = false; }
      };
      body.append(el('div', 'sp-box', '<h3>رمز المعاملة بعد الدفع</h3>'), tx, err, send,
        el('div', 'sp-note', `بعد الإرسال يبدأ مؤقت (${store.hold} دقيقة) لقبول الإدارة لطلبك. يمكنك مراسلة الدعم من زر واتساب الأخضر.`));
      body.lastChild.previousSibling;
    };
    draw();
  }
  function copyBtn(text, label) {
    const b = el('button', 'sp-btn ghost', '📋 ' + label); b.type = 'button';
    b.onclick = async () => { try { await navigator.clipboard.writeText(text); b.textContent = 'انتسخ ✅'; } catch (e) { b.textContent = 'اضغط مطوّلاً على النص لتنسخه'; } };
    return b;
  }

  // ---- حالة الطلب مع المؤقت
  const STAT = { p: ['قيد المراجعة', 'p'], a: ['مقبول ✅', 'a'], r: ['مرفوض', 'r'] };
  async function myOrders() { try { return (await social.api('GET', 'orders/' + social.myUid())) || {}; } catch (e) { return null; } }
  async function viewOrder(id) {
    ctxOrder = id; tabsEl.style.display = 'none'; stopTimer();
    const draw = async () => {
      const all = await myOrders(), o = all && all[id];
      if (!modal.classList.contains('show') || ctxOrder !== id) return stopTimer();
      body.replaceChildren();
      const back = el('button', 'sp-btn ghost', '→ طلباتي'); back.onclick = () => { stopTimer(); ctxOrder = ''; cat = 'orders'; renderTabs(); renderCat(); };
      body.append(back);
      if (!o) { body.append(el('div', 'sp-note', 'تعذّر تحميل الطلب. تأكد من الاتصال.')); return; }
      const left = (o.t || Date.now()) + store.hold * 60000 - Date.now(), [txt, cls] = STAT[o.s] || ['—', 'x'];
      const late = o.s === 'p' && left <= 0;
      body.append(el('div', 'sp-box', `<div><span class="sp-st ${late ? 'x' : cls}">${late ? 'انتهى المؤقت' : txt}</span></div><h3>${esc(o.n)} · ${money(o.p)}</h3><div class="sp-note">الدفع: ${esc(o.m)}<br>رمز المعاملة: <bdi dir="ltr">${esc(o.tx)}</bdi><br>رقم الطلب: <bdi dir="ltr">${esc(id)}</bdi></div>`));
      if (o.s === 'p' && !late) { const t = el('div', 'sp-box', `<h3>⏳ الوقت المتبقي لقبول الإدارة</h3><div class="sp-timer" id="spCd"></div><div class="sp-note">تتم المراجعة يدوياً بعد التأكد من وصول الدفعة.</div>`); body.append(t); const tick = () => { const l = Math.max(0, (o.t || Date.now()) + store.hold * 60000 - Date.now()), m = Math.floor(l / 60000), s = Math.floor(l / 1000) % 60; const c = body.querySelector('#spCd'); if (c) c.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); if (l <= 0) draw(); }; tick(); clearInterval(timer); timer = setInterval(() => { tick(); }, 1000); setTimeout(function again() { if (ctxOrder === id && modal.classList.contains('show')) { draw(); } }, 7000); }
      else if (late) body.append(el('div', 'sp-box', '<div class="sp-note">انتهى وقت المراجعة ولم يُقبل الطلب بعد. اضغط زر واتساب الأخضر وأرسل لنا رقم الطلب ورمز المعاملة وسنفعّله يدوياً.</div>'));
      else if (o.s === 'a') { body.append(el('div', 'sp-box', '<div class="sp-note">🎉 تم تفعيل طلبك. ' + (o.k === 'furn' ? 'ادخل بيتك لترى الأثاث.' : 'قد تحتاج دقيقة حتى يتحدث البيت للجميع.') + '</div>')); loadPublic(); }
      else body.append(el('div', 'sp-box', '<div class="sp-note">رُفض الطلب (غالباً الدفعة لم تصل أو الرمز غير صحيح). راسل الدعم عبر واتساب ومعك رقم الطلب.</div>'));
    };
    await draw();
  }
  async function renderOrders() {
    const name = await social.needName(); if (!name) { cat = 'house'; renderTabs(); return renderCat(); }
    body.replaceChildren(el('div', 'sp-note', 'جاري تحميل طلباتك…'));
    const all = await myOrders();
    body.replaceChildren();
    if (!all) { body.append(el('div', 'sp-note', 'تعذّر تحميل الطلبات.')); return; }
    const rows = Object.entries(all).sort((a, b) => (b[1].t || 0) - (a[1].t || 0));
    if (!rows.length) body.append(el('div', 'sp-note', 'ما عندك طلبات بعد. اختر منتجاً من التبويبات الأخرى 🛍️'));
    for (const [id, o] of rows) {
      const late = o.s === 'p' && (o.t || 0) + store.hold * 60000 < Date.now(), [txt, cls] = STAT[o.s] || ['—', 'x'];
      const row = el('div', 'sp-item', `<div class="gr"><b>${esc(o.n)}</b><small>${esc(o.m)} · ${o.t ? new Date(o.t).toLocaleString('ar') : ''}</small></div><div><div class="sp-price">${money(o.p)}</div><span class="sp-st ${late ? 'x' : cls}">${late ? 'انتهى المؤقت' : txt}</span></div>`);
      row.onclick = () => viewOrder(id); body.append(row);
    }
  }

  // ---------------------------------------------------------------- دخول البيت (غرفة ثلاثية الأبعاد بالأثاث المشترى)
  const home = document.createElement('div');
  home.className = 'hzin';
  home.innerHTML = `<canvas></canvas><div class="bar"><div class="ttl" id="hiT"></div><button id="hiX" type="button">✕ خروج</button></div><div class="info" id="hiI"></div><div class="foot" id="hiF"></div>`;
  document.body.appendChild(home);
  let hr = null; // { renderer, scene, camera, controls, raf, name }
  function closeHouse() { if (!hr) return; cancelAnimationFrame(hr.raf); hr.controls.dispose(); hr.renderer.dispose(); hr = null; home.classList.remove('show'); }
  home.querySelector('#hiX').onclick = closeHouse;
  const mat = (c, extra) => new THREE.MeshLambertMaterial({ color: c, ...extra });
  const bx = (g, c, x, y, z, w, h, d, extra) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, extra)); m.position.set(x, y, z); g.add(m); return m; };
  const cy = (g, c, x, y, z, r, h, seg = 16) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat(c)); m.position.set(x, y, z); g.add(m); return m; };
  function furniture(g, id, S) {
    switch (id) {
      case 'bed': { const o = new THREE.Group(); bx(o, '#8a5a34', 0, 0.3, 0, 2.2, 0.6, 3); bx(o, '#f3efe6', 0, 0.75, 0.2, 2, 0.35, 2.5); bx(o, '#5b8def', 0, 0.97, 0.7, 2.02, 0.1, 1.5); bx(o, '#fff', -0.5, 1.0, -0.9, 0.8, 0.18, 0.5); bx(o, '#fff', 0.5, 1.0, -0.9, 0.8, 0.18, 0.5); o.position.set(-S + 2, 0, -S + 2); g.add(o); break; }
      case 'wardrobe': { const o = new THREE.Group(); bx(o, '#7a4b28', 0, 1.6, 0, 2.6, 3.2, 1); bx(o, '#8d5a31', -0.65, 1.6, 0.51, 1.2, 2.9, 0.04); bx(o, '#8d5a31', 0.65, 1.6, 0.51, 1.2, 2.9, 0.04); bx(o, '#f2c14e', -0.1, 1.6, 0.56, 0.06, 0.5, 0.06); bx(o, '#f2c14e', 0.1, 1.6, 0.56, 0.06, 0.5, 0.06); o.position.set(S - 1.8, 0, -S + 0.6); g.add(o); break; }
      case 'tv': { const o = new THREE.Group(); bx(o, '#5c3d24', 0, 0.45, 0, 3, 0.9, 0.8); bx(o, '#101216', 0, 1.9, -0.05, 2.8, 1.6, 0.14); bx(o, '#3d7bd9', 0, 1.9, 0.04, 2.55, 1.35, 0.04, { emissive: '#17407f' }); o.position.set(0, 0, -S + 0.6); g.add(o); break; }
      case 'sofa': { const o = new THREE.Group(); bx(o, '#3f6f8a', 0, 0.45, 0, 3.4, 0.9, 1.3); bx(o, '#335a72', 0, 1.2, 0.5, 3.4, 1, 0.35); bx(o, '#335a72', -1.65, 0.85, 0, 0.35, 0.9, 1.3); bx(o, '#335a72', 1.65, 0.85, 0, 0.35, 0.9, 1.3); o.position.set(0, 0, 1.6); o.rotation.y = Math.PI; g.add(o); break; }
      case 'table': { const o = new THREE.Group(); cy(o, '#a8744a', 0, 0.85, 0, 1.15, 0.12); cy(o, '#7a4b28', 0, 0.42, 0, 0.18, 0.84); for (let a = 0; a < 4; a++) cy(o, '#c9ced6', Math.cos(a * 1.571) * 1.7, 0.4, Math.sin(a * 1.571) * 1.7, 0.32, 0.8, 10); o.position.set(-S + 2.4, 0, 2.2); g.add(o); break; }
      case 'fridge': { const o = new THREE.Group(); bx(o, '#e8edf3', 0, 1.5, 0, 1.3, 3, 1.2); bx(o, '#c3cad4', 0, 1.6, 0.61, 1.28, 0.04, 0.02); bx(o, '#8b93a1', 0.5, 2.1, 0.64, 0.08, 0.7, 0.06); bx(o, '#8b93a1', 0.5, 0.9, 0.64, 0.08, 0.9, 0.06); o.position.set(S - 0.9, 0, 0.8); o.rotation.y = -Math.PI / 2; g.add(o); break; }
      case 'lamp': { const o = new THREE.Group(); cy(o, '#3b3f47', 0, 0.06, 0, 0.35, 0.12); cy(o, '#3b3f47', 0, 1.3, 0, 0.05, 2.5, 8); const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.55, 0.7, 14), mat('#ffe9a8', { emissive: '#8a6d00' })); sh.position.y = 2.7; o.add(sh); o.position.set(S - 0.8, 0, 3); g.add(o); break; }
      case 'rug': { const o = new THREE.Group(); bx(o, '#b02a37', 0, 0.03, 0, 5, 0.06, 3.6); bx(o, '#f2c14e', 0, 0.065, 0, 4.4, 0.02, 3.0); bx(o, '#b02a37', 0, 0.07, 0, 4.0, 0.02, 2.6); o.position.set(0, 0, 0.3); g.add(o); break; }
      case 'plant': { const o = new THREE.Group(); cy(o, '#a8643a', 0, 0.45, 0, 0.5, 0.9); const l = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 10), mat('#3f9f5a')); l.position.y = 1.7; o.add(l); o.position.set(-S + 0.9, 0, S - 0.9); g.add(o); break; }
      default: break;
    }
  }
  function openHouse(name) {
    name = String(name || '').toLowerCase();
    const rec = byName.get(name); if (!rec) { toast('ما لقينا هذا البيت'); return; }
    closeHouse();
    const info = houseInfo(rec), mine = social.me() === name, o = ownedOf(name), b = badgeOf(name);
    const S = rec.villa ? 6.5 : rec.level >= MAX_LEVEL ? 6 : 4 + rec.level * 0.5; // نصف الغرفة
    const canvas = home.querySelector('canvas'), renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight, false);
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#1b2130');
    const cam = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 200); cam.position.set(S * 1.4, S * 1.25, S * 1.9);
    scene.add(new THREE.HemisphereLight('#fff6e6', '#6a7388', 1.0)); const sun = new THREE.DirectionalLight('#ffffff', 0.9); sun.position.set(6, 12, 8); scene.add(sun);
    const room = new THREE.Group(); scene.add(room);
    bx(room, rec.villa ? '#d8c9a8' : '#c9a574', 0, -0.1, 0, S * 2 + 0.6, 0.2, S * 2 + 0.6); // الأرض
    const wallC = rec.villa ? '#f1e6d0' : '#e9e4da';
    bx(room, wallC, 0, 2.2, -S - 0.15, S * 2 + 0.6, 4.4, 0.3); bx(room, wallC, -S - 0.15, 2.2, 0, 0.3, 4.4, S * 2); bx(room, wallC, S + 0.15, 2.2, 0, 0.3, 4.4, S * 2, { transparent: true, opacity: 0.35 });
    bx(room, '#7ec8ff', -S + 0.02, 2.6, -S * 0.3, 0.06, 1.6, 2.2, { emissive: '#3a7fb5' }); // نافذة
    for (const id of Object.keys(o)) furniture(room, id, S);
    const have = Object.keys(o).filter((k) => (itemById(k) || {}).cat === 'furn').length;
    home.querySelector('#hiT').textContent = '🏠 @' + name + (b ? (b === 'gold' ? ' 🟡✔' : ' 🔵✔') : '');
    home.querySelector('#hiI').textContent = `${info} · أثاث: ${have}/9${mine ? '' : ' · زيارة'}`;
    const foot = home.querySelector('#hiF'); foot.replaceChildren();
    if (mine) {
      const f = el('button', 'pk', '🛋️ اشترِ أثاثاً'); f.onclick = () => { closeHouse(); open('furn'); };
      const u = el('button', 'pk', '⬆️ ترقية البيت'); u.onclick = () => { const it = itemById('upgrade'); closeHouse(); open('house'); if (it) viewItem(it); };
      foot.append(f, u);
    } else if (!have) foot.append(el('div', 'sp-note', '<span style="color:#fff">صاحب البيت ما اشترى أثاثاً بعد</span>'));
    home.classList.add('show');
    const controls = new OrbitControls(cam, canvas); controls.target.set(0, 1, 0); controls.enableDamping = true; controls.maxPolarAngle = Math.PI / 2.05; controls.minDistance = 4; controls.maxDistance = S * 4;
    const loop = () => { hr.raf = requestAnimationFrame(loop); controls.update(); renderer.render(scene, cam); };
    hr = { renderer, controls, raf: 0, name };
    loop();
    addEventListener('resize', () => { if (!hr) return; renderer.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); });
  }

  // ---------------------------------------------------------------- تشغيل
  loadStore().then(loadPublic);
  setInterval(() => { if (!document.hidden) loadPublic(); }, 45000);
  if (new URLSearchParams(location.search).get('shop')) setTimeout(() => open(), 1200);
  void ONLINE; void startDrive; void goToHouse;
  return { open, close, openHouse, closeHouse, badgeOf, ownedOf, carOf, decorate, updateDecor, refresh: () => loadStore().then(loadPublic), itemById };
}
