(() => {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  // المسار الأساسي للتطبيق ليعمل داخل أي مجلد أو مسار فرعي
  const BASE_PATH = (() => {
    const p = location.pathname;
    if (!p || p === '/') return './';
    return p.endsWith('/') ? p : p.slice(0, p.lastIndexOf('/') + 1);
  })();

  const TOWNS = {
    '': { name: 'سوريا', flag: '🇸🇾' },
    JO: { name: 'الأردن', flag: '🇯🇴' },
    PS: { name: 'فلسطين', flag: '🇵🇸' },
    LB: { name: 'لبنان', flag: '🇱🇧' },
    IQ: { name: 'العراق', flag: '🇮🇶' },
    MA: { name: 'المغرب', flag: '🇲🇦' },
    EG: { name: 'مصر', flag: '🇪🇬' },
    YE: { name: 'اليمن', flag: '🇾🇪' },
    SA: { name: 'السعودية', flag: '🇸🇦' },
  };
  const townInfo = (code) => TOWNS[code || ''] || TOWNS[''];

  const me = () => {
    try { return (localStorage.getItem('haretnaMe') || '').trim().replace(/^@+/, '').toLowerCase(); }
    catch (e) { return ''; }
  };
  const setMe = (u) => {
    try {
      if (u) localStorage.setItem('haretnaMe', u);
      else localStorage.removeItem('haretnaMe');
    } catch (e) {}
  };

  function toast(msg, ms = 3200) {
    const box = $('#toasts');
    if (!box) return;
    const d = document.createElement('div');
    d.className = 'panel toast';
    d.textContent = msg;
    box.append(d);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 320); }, ms);
  }

  let race = null;
  let lastRace = 0;

  async function loadRace(force) {
    if (!force && race && Date.now() - lastRace < 25000) return race;
    try {
      const r = await fetch(BASE_PATH + 'api/race', { cache: 'no-store' });
      if (!r.ok) return race;
      race = await r.json();
      lastRace = Date.now();
    } catch (e) {}
    return race;
  }

  function fmtLeft(ms) {
    ms = Math.max(0, ms);
    const d = Math.floor(ms / 864e5);
    const h = Math.floor((ms % 864e5) / 36e5);
    const m = Math.floor((ms % 36e5) / 6e4);
    const parts = [];
    if (d) parts.push(d === 1 ? 'يوم' : d === 2 ? 'يومين' : d + ' أيام');
    if (h) parts.push(h === 1 ? 'ساعة' : h === 2 ? 'ساعتين' : h + ' ساعات');
    if (!d && m) parts.push(m + ' دقايق');
    return parts.join(' و') || 'أقل من دقيقة';
  }

  const MEDALS = ['🥇', '🥈', '🥉'];

  function renderRace() {
    const box = $('#raceCard');
    if (!box) return;
    if (!race || !race.active) {
      box.innerHTML = '<b>🏁 سباق الحارات الأسبوعي</b><div class="sub">ما في سباق شغال هلق، تابعنا للأسبوع الجاي.</div>';
      return;
    }
    const counts = (window.haretnaCity && window.haretnaCity.race && window.haretnaCity.race().counts) || race.counts || {};
    const rows = Object.entries(counts)
      .map(([code, n]) => ({ code, n: Number(n) || 0, ...townInfo(code) }))
      .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, 'ar'));
    const max = Math.max(1, rows[0] ? rows[0].n : 1);
    const left = race.end - Date.now();
    box.innerHTML = `
      <div class="raceTop"><b>🏁 سباق الأسبوع ${race.week || ''}</b><span class="raceTime">${left > 0 ? '⏳ باقي ' + fmtLeft(left) : 'انتهى الوقت'}</span></div>
      <div class="sub">البيوت الجديدة بهالأسبوع بس · الحارة الأولى بتاخد درع الأسبوع والرابحين بياخدوا ألقاب 👑</div>
      <div class="raceList">${rows.map((r, i) => `
        <div class="raceRow ${i === 0 && r.n > 0 ? 'lead' : ''}">
          <span class="rk">${MEDALS[i] || (i + 1)}</span>
          <span class="fl">${r.flag}</span>
          <span class="nm">${esc(r.name)}</span>
          <span class="bar"><i style="width:${Math.round((r.n / max) * 100)}%"></i></span>
          <span class="pt">${r.n.toLocaleString('en-US')}</span>
        </div>`).join('')}</div>`;
  }

  function renderMe() {
    const u = me();
    const box = $('#meCard');
    if (!box) return;
    const h = u && window.haretnaCity && window.haretnaCity.house && window.haretnaCity.house(u);
    if (!u) {
      box.innerHTML = `
        <b>🏠 بيتك بحارتنا</b>
        <div class="sub">اكتب يوزرك على إنستغرام لنلاقي بيتك وتتحكم فيه وتترقّى.</div>
        <div class="meRow">
          <input id="meInput" type="text" placeholder="يوزرك بدون @" autocomplete="off">
          <button id="meSave" class="btn primary" type="button">دخول</button>
        </div>`;
      $('#meSave').addEventListener('click', saveMe);
      $('#meInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') saveMe(); });
      return;
    }
    const t = townInfo(h && h.town);
    const status = h
      ? `بيت رقم ${h.i + 1} · ${t.flag} حارة ${t.name}${h.villa ? ' · 👑 فيلا' : ''}`
      : 'ما لقينا بيتك لسا — تابع الحساب وعلّق على آخر منشور';
    box.innerHTML = `
      <div class="meHead"><b>@${esc(u)}</b><button id="meChange" class="linkBtn" type="button">تبديل الحساب</button></div>
      <div class="sub">${esc(status)}</div>
      <div class="meBtns">
        ${h ? '<button id="meGo" class="btn primary" type="button">📍 شوف بيتي</button>' : ''}
        <button id="meShop" class="btn" type="button">🛒 ترقية وشارات</button>
      </div>`;
    $('#meChange').addEventListener('click', () => { setMe(''); renderMe(); });
    if ($('#meGo')) $('#meGo').addEventListener('click', () => {
      closeApp();
      if (!window.haretnaCity || !window.haretnaCity.show(u)) toast('ما لقينا بيتك لسا 🙈');
    });
    $('#meShop').addEventListener('click', () => {
      closeApp();
      if (window.haretnaShop) window.haretnaShop.open(u);
    });
  }

  function saveMe() {
    const inp = $('#meInput');
    const u = (inp ? inp.value : '').trim().replace(/^@+/, '').toLowerCase();
    if (!u) { toast('اكتب يوزرك أولاً'); return; }
    setMe(u);
    renderMe();
  }

  let shopTimer = null;

  function renderShopTab() {
    const u = me();
    const box = $('#shopCard');
    if (!box) return;
    const coins = window.haretnaCity && window.haretnaCity.coins ? window.haretnaCity.coins() : 0;
    const h = u && window.haretnaCity && window.haretnaCity.house && window.haretnaCity.house(u);
    const badge = u && window.haretnaShop && window.haretnaShop.badgeOf ? window.haretnaShop.badgeOf(u) : '';
    const owned = u && window.haretnaShop && window.haretnaShop.ownedOf ? window.haretnaShop.ownedOf(u) : {};
    const prices = (window.haretnaShop && window.haretnaShop.prices) || { badgeBlue: 120, badgeGold: 300, upgrade: 80, villa: 250 };
    const orders = (window.haretnaShop && window.haretnaShop.myOrders) || [];
    const last = orders[0];
    const fmtRem = (ms) => {
      const s = Math.max(0, Math.ceil(ms / 1000));
      const m = Math.floor(s / 60);
      return m + ':' + String(s % 60).padStart(2, '0');
    };
    clearTimeout(shopTimer);
    if (last && last.status === 'pending' && last.expiresAt > Date.now()) {
      shopTimer = setTimeout(renderShopTab, 1000);
    }

    box.innerHTML = `
      <div class="shopTop"><b>🛒 متجر حارتنا</b><span class="pill">🪙 رصيد المدينة: ${Number(coins || 0).toLocaleString('en-US')}</span></div>
      <div class="sub">${u ? `حسابك: <b>@${esc(u)}</b>` : 'اكتب يوزرك لتشتري ترقية أو شارة لبيتك'}</div>
      ${!u ? `<div class="meRow"><input id="shopUser" type="text" placeholder="يوزرك على إنستغرام"><button id="shopUserBtn" class="btn primary" type="button">حفظ</button></div>` : ''}
      <div class="shopGrid">
        <div class="shopItem">
          <div><b>🔵 شارة زرقاء</b><small>${badge === 'blue' || badge === 'gold' ? 'مفعّلة على اسمك' : prices.badgeBlue + ' 🪙'}</small></div>
          <button class="btn" data-buy="badge_blue" ${!u || badge === 'blue' || badge === 'gold' ? 'disabled' : ''}>${badge === 'blue' || badge === 'gold' ? 'مفعّلة' : 'طلب'}</button>
        </div>
        <div class="shopItem">
          <div><b>🟡 شارة ذهبية</b><small>${badge === 'gold' ? 'مفعّلة على اسمك' : prices.badgeGold + ' 🪙'}</small></div>
          <button class="btn" data-buy="badge_gold" ${!u || badge === 'gold' ? 'disabled' : ''}>${badge === 'gold' ? 'مفعّلة' : 'طلب'}</button>
        </div>
        <div class="shopItem">
          <div><b>⬆️ ترقية بيتك</b><small>طابق إضافي · ${prices.upgrade} 🪙</small></div>
          <button class="btn" data-buy="upgrade" ${!u || !h ? 'disabled' : ''}>طلب</button>
        </div>
        <div class="shopItem">
          <div><b>👑 تحويل إلى فيلا</b><small>${owned.villa ? 'بيتك فيلا بالفعل' : prices.villa + ' 🪙'}</small></div>
          <button class="btn" data-buy="villa" ${!u || !h || owned.villa ? 'disabled' : ''}>${owned.villa ? 'فيلا' : 'طلب'}</button>
        </div>
      </div>
      ${last ? `<div class="orderBox ${last.status}">
        <b>آخر طلب: ${esc(last.label || last.kind)}</b>
        <span>${last.status === 'approved' ? '✅ تم التفعيل' : last.status === 'rejected' ? '❌ مرفوض' : last.expiresAt > Date.now() ? '⏳ بانتظار التحويل (' + fmtRem(last.expiresAt - Date.now()) + ')' : '⌛ انتهت المهلة'}</span>
      </div>` : ''}`;

    if ($('#shopUserBtn')) {
      $('#shopUserBtn').addEventListener('click', () => {
        const val = ($('#shopUser').value || '').trim().replace(/^@+/, '').toLowerCase();
        if (!val) return toast('اكتب يوزرك أولاً');
        setMe(val);
        renderShopTab();
        renderMe();
      });
    }
    box.querySelectorAll('[data-buy]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!u || !window.haretnaShop) return;
        closeApp();
        window.haretnaShop.buy(btn.dataset.buy, u);
      });
    });
  }

  function showTab(name) {
    document.querySelectorAll('#appSheet .tab').forEach((b) => b.classList.toggle('on', b.dataset.tab === name));
    document.querySelectorAll('#appSheet .pane').forEach((p) => { p.hidden = p.dataset.pane !== name; });
    if (name === 'race') { renderRace(); loadRace().then(renderRace); }
    if (name === 'me') renderMe();
    if (name === 'shop') renderShopTab();
  }

  function openApp(tab = 'race') {
    const sheet = $('#appSheet');
    if (!sheet) return;
    sheet.classList.add('show');
    sheet.setAttribute('aria-hidden', 'false');
    document.body.classList.add('app-open');
    showTab(tab);
  }

  function closeApp() {
    const sheet = $('#appSheet');
    if (!sheet) return;
    sheet.classList.remove('show');
    sheet.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('app-open');
    clearTimeout(shopTimer);
  }

  if ($('#appBtn')) $('#appBtn').addEventListener('click', () => openApp('race'));
  if ($('#appClose')) $('#appClose').addEventListener('click', closeApp);
  if ($('#appSheet')) $('#appSheet').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeApp(); });
  document.querySelectorAll('#appSheet .tab').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));

  document.addEventListener('haretna:shop-updated', () => {
    if ($('#appSheet') && $('#appSheet').classList.contains('show')) {
      renderMe();
      renderShopTab();
    }
  });

  window.haretnaApp = {
    open: openApp,
    close: closeApp,
    isOpen: () => Boolean($('#appSheet') && $('#appSheet').classList.contains('show')),
  };

  const origBack = window.haretnaBack;
  window.haretnaBack = () => {
    if (window.haretnaApp && window.haretnaApp.isOpen()) { closeApp(); return true; }
    return typeof origBack === 'function' ? origBack() : false;
  };

  const q = new URLSearchParams(location.search);
  const tabParam = q.get('tab');
  if (q.get('app') === '1' || tabParam === 'race' || tabParam === 'me' || tabParam === 'shop') {
    setTimeout(() => openApp(tabParam || 'race'), 120);
  }

  loadRace().then(() => {
    if ($('#appSheet') && $('#appSheet').classList.contains('show') && $('[data-pane="race"]')) {
      const p = $('[data-pane="race"]');
      if (!p.hidden) renderRace();
    }
  });
})();
