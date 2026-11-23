// «تطبيق حارتنا» (2026-11-22): when the city is opened inside the Android app
// (its WebView adds "HaretnaApp/" to the user agent), the page grows a tab bar:
// the city, my house, the race and the draw. "My house" only finds a house by
// its name; asking for the villa gets a code, and only a comment with that code
// from the account itself turns the house into one. The rewarded ad shows when
// /api/app/state says so; the coins come from Google's signed call to the
// server, never from this page. Outside the app nothing here runs; ?app shows
// the tabs in a browser, with no ads.
const inApp = /HaretnaApp\//.test(navigator.userAgent) || new URLSearchParams(location.search).has('app');
if (inApp) start();

function start() {
  const App = window.HaretnaApp || {}; // empty in a browser (?app)
  const TOWNS = { '': ['sy', 'سوريا', '#0f7a3d'], JO: ['jo', 'الأردن', '#c8102e'], PS: ['ps', 'فلسطين', '#149954'], LB: ['lb', 'لبنان', '#d01c1f'], IQ: ['iq', 'العراق', '#007a3d'], MA: ['ma', 'المغرب', '#c1272d'], EG: ['eg', 'مصر', '#b8860b'], YE: ['ye', 'اليمن', '#b3121f'], SA: ['sa', 'السعودية', '#006c35'] };
  const flag = (code) => `https://cdn.jsdelivr.net/npm/flag-icons@7.6.0/flags/4x3/${TOWNS[code][0]}.svg`;
  const n2 = (n) => Number(n).toLocaleString('en-US');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const mine = { get: () => { try { return localStorage.getItem('appHouse') || ''; } catch (e) { return ''; } }, set: (u) => { try { localStorage.setItem('appHouse', u); } catch (e) {} } };

  const css = document.createElement('style');
  css.textContent = `
    body.in-app { --tabs: calc(64px + env(safe-area-inset-bottom)); }
    body.in-app .card, body.in-app .how, body.in-app .how-btn, body.in-app .nav { bottom: calc(var(--tabs) + 10px) !important; }
    body.in-app #drawBtn { display: none; }
    .tabs { position: fixed; inset-inline: 0; bottom: 0; height: var(--tabs); padding-bottom: env(safe-area-inset-bottom); z-index: 30;
            display: grid; grid-template-columns: repeat(4, 1fr); background: #fff; border-top: 1px solid #e3e6ec; }
    .tabs button { background: none; border: 0; border-radius: 0; padding: 6px 0 4px; font: inherit; font-size: 12px; font-weight: 700; color: #8a91a0; display: flex; flex-direction: column; align-items: center; gap: 1px; }
    .tabs button i { font-style: normal; font-size: 23px; line-height: 1.2; filter: grayscale(1); opacity: .7; }
    .tabs button.on { color: var(--accent); }
    .tabs button.on i { filter: none; opacity: 1; }
    .appsheet { position: fixed; inset: 0 0 var(--tabs); z-index: 25; background: #f6f7fb; overflow-y: auto; display: none; }
    .appsheet.open { display: block; animation: pop .2s ease; }
    .appsheet .top { height: 300px; background: center/cover no-repeat; position: relative; }
    .appsheet .top::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(246,247,251,0) 55%, #f6f7fb 100%); }
    .appsheet .in { padding: 0 20px 24px; position: relative; }
    .appsheet h2 { margin: 4px 0 6px; font-size: 26px; font-weight: 800; line-height: 1.3; }
    .appsheet p { margin: 0 0 14px; color: var(--muted); font-size: 16px; font-weight: 500; line-height: 1.5; }
    .appsheet .gold { color: #d4a017; }
    .appsheet .badge { position: absolute; top: 16px; inset-inline-start: 16px; z-index: 2; padding: 7px 14px; border-radius: 999px; font-weight: 800; font-size: 15px; background: linear-gradient(135deg, #f8d468, #d4a017); color: #3a2a00; }
    .appsheet .field { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border: 2px solid var(--accent); border-radius: 16px; background: #fff; font-size: 18px; }
    .appsheet .field input { flex: 1; min-width: 0; border: 0; outline: 0; font: inherit; direction: ltr; text-align: left; background: transparent; }
    .appsheet .big { display: block; width: 100%; margin-top: 12px; padding: 15px; border: 0; border-radius: 16px; font: inherit; font-size: 18px; font-weight: 800; color: #fff; background: linear-gradient(135deg, var(--accent-2), var(--accent)); }
    .appsheet .big.ghost { background: #eef1f6; color: var(--ink); }
    .appsheet .big:disabled { opacity: .6; }
    .appsheet .note { text-align: center; font-size: 14px; color: var(--muted); font-weight: 500; margin-top: 10px; }
    .appsheet .err { color: #c0392b; font-weight: 700; text-align: center; margin-top: 10px; min-height: 1.4em; }
    .appsheet .box { background: #fff; border-radius: 18px; box-shadow: var(--shadow); padding: 14px 16px; margin-top: 12px; }
    .appsheet .row { display: flex; gap: 12px; align-items: center; }
    .appsheet .row .grow { flex: 1; min-width: 0; }
    .appsheet .pill { border-radius: 999px; padding: 8px 16px; font-weight: 800; border: 0; font: inherit; font-weight: 800; color: #fff; background: linear-gradient(135deg, var(--accent-2), var(--accent)); }
    .appsheet .race li { display: flex; align-items: center; gap: 9px; padding: 8px 0; border-bottom: 1px solid #eef0f4; }
    .appsheet .race li:last-child { border-bottom: 0; }
    .appsheet .race .n { width: 26px; height: 26px; border-radius: 50%; color: #fff; font-weight: 800; display: grid; place-items: center; font-size: 14px; flex: none; }
    .appsheet .race img { width: 30px; height: 22.5px; border-radius: 4px; object-fit: cover; }
    .appsheet .race b.name { width: 66px; }
    .appsheet .race .bar { flex: 1; height: 10px; border-radius: 5px; background: #eef0f4; position: relative; overflow: hidden; }
    .appsheet .race .bar span { position: absolute; inset-block: 0; right: 0; }
    .appsheet .race b.c { direction: ltr; width: 58px; text-align: left; }
    .appsheet .head { text-align: center; padding-top: 18px; }
  `;
  document.head.appendChild(css);
  document.body.classList.add('in-app');

  // ---- the tab bar
  const tabs = document.createElement('nav');
  tabs.className = 'tabs';
  tabs.setAttribute('aria-label', 'أقسام التطبيق');
  tabs.innerHTML = `
    <button type="button" data-tab="city" class="on"><i>🏙️</i>المدينة</button>
    <button type="button" data-tab="home"><i>🏠</i>بيتي</button>
    <button type="button" data-tab="race"><i>🏁</i>السباق</button>
    <button type="button" data-tab="draw"><i>🎁</i>القرعة</button>`;
  document.body.appendChild(tabs);

  const sheet = document.createElement('section');
  sheet.className = 'appsheet';
  document.body.appendChild(sheet);

  const onCity = !!document.getElementById('city'); // the city page, or another page (the draw)
  let current = onCity ? 'city' : 'draw';
  if (!onCity) { document.body.style.paddingBottom = 'var(--tabs)'; for (const b of tabs.querySelectorAll('button')) b.classList.toggle('on', b.dataset.tab === 'draw'); }
  function show(tab) {
    if (tab === 'draw') { if (onCity) location.href = '/draw.html'; return; }
    if (!onCity) { location.href = '/' + (tab === 'city' ? '' : '?tab=' + tab); return; }
    current = tab;
    for (const b of tabs.querySelectorAll('button')) b.classList.toggle('on', b.dataset.tab === tab);
    if (tab === 'city') { sheet.classList.remove('open'); return; }
    sheet.innerHTML = '';
    sheet.scrollTop = 0;
    (tab === 'home' ? (mine.get() ? myHouse : findForm) : raceTab)();
    sheet.classList.add('open');
  }
  tabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(b.dataset.tab); });
  // the phone's back button closes what is open before it leaves the page (MainActivity)
  window.haretnaBack = () => {
    if (!onCity) return false;
    if (current !== 'city') { show('city'); return true; }
    return !!(window.haretnaCity && window.haretnaCity.back());
  };
  const city = () => window.haretnaCity;
  const wanted = new URLSearchParams(location.search).get('tab'); // from the draw page's tab bar
  if (onCity && (wanted === 'home' || wanted === 'race')) show(wanted);

  // Google's consent form again, where the law gives that choice
  function footer() {
    const box = sheet.querySelector('.foot');
    box.innerHTML = '<a href="/privacy.html" style="color:var(--muted)">سياسة الخصوصية</a>';
    if (App.privacyNeeded && App.privacyNeeded()) {
      const b = document.createElement('button');
      b.className = 'big ghost'; b.type = 'button'; b.textContent = '🔒 خيارات خصوصية الإعلانات';
      b.onclick = () => App.privacyOptions();
      box.prepend(b);
    }
  }

  // ---- find my house
  function findForm() {
    sheet.innerHTML = `
      <div class="in head" style="text-align:start">
        <h2>وين بيتك؟ 🏠</h2>
        <p>اكتب اسم حسابك بالإنستغرام لنفرجيك بيتك.</p>
        <form id="findForm" autocomplete="off">
          <label class="field"><b style="color:var(--muted)">@</b><input id="findUser" inputmode="latin" autocapitalize="none" spellcheck="false" placeholder="اسمك بالإنستغرام" aria-label="اسمك بالإنستغرام" required></label>
          <button class="big" type="submit">فرجيني بيتي</button>
        </form>
        <div class="err" id="findErr" role="alert"></div>
        <div class="note foot"></div>
      </div>`;
    sheet.querySelector('#findForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const h = city() && city().house(sheet.querySelector('#findUser').value.trim().replace(/^@+/, ''));
      if (h) { mine.set(h.username); show('home'); return; }
      sheet.querySelector('#findErr').textContent = city() && city().race()
        ? 'ما لقينا بيت بهالاسم. تأكد من الاسم، أو علّق على منشورنا بإنستغرام ليتعمّر بيتك.'
        : 'المدينة لسا عم تتحمّل… جرّب بعد شوي.';
    });
    footer();
  }

  // ---- my house, and the rewarded ad for the city's balance
  function myHouse() {
    const u = mine.get(), h = city() && city().house(u);
    const where = h ? `بيت رقم ${n2(h.i + 1)} · ${h.town ? 'حارة ' + TOWNS[h.town][1] : 'سوريا'}` : '';
    sheet.innerHTML = `
      <div class="in" style="padding-top:14px">
        <div class="box"><div style="font-size:22px; font-weight:800; direction:ltr; text-align:right">@${esc(u)}</div>
          <div style="color:var(--muted); font-weight:500; margin-top:2px">${where}${h && h.villa ? ' · <b class="gold">فيلا 👑</b>' : ''}</div>
          <button class="big" type="button" id="seeMine">شوف بيتي بالمدينة</button></div>
        <div id="villaBox"></div>
        <div id="adBox"></div>
        <div class="note"><a href="#" id="notMine" style="color:var(--muted)">دوّر على اسم تاني</a></div>
        <div class="note foot"></div>
      </div>`;
    sheet.querySelector('#seeMine').onclick = () => {
      if (city() && city().show(u)) show('city');
      else location.href = '/?u=' + encodeURIComponent(u); // not built yet: it flies there when it is
    };
    sheet.querySelector('#notMine').onclick = (e) => { e.preventDefault(); mine.set(''); show('home'); };
    footer();
    rewardCard(sheet.querySelector('#adBox'));
    const box = sheet.querySelector('#villaBox');
    if (h) { if (!h.villa) villaCard(box, h.username); return; }
    // the city is still loading: draw the sheet again once the house is in
    const wait = setInterval(() => {
      if (!box.isConnected) return clearInterval(wait);
      if (city() && city().house(u)) { clearInterval(wait); show('home'); }
    }, 1500);
  }
  // ---- the villa: a code that only the account's owner can comment
  async function villaCard(box, u) {
    let state;
    try { state = await (await fetch('api/app/state', { cache: 'no-store' })).json(); } catch (x) { return; }
    if (!state.link || !box.isConnected) return;
    box.innerHTML = `
      <div class="box">
        <div style="font-weight:800; font-size:18px">👑 خلّي بيتك فيلا</div>
        <div style="color:var(--muted); font-size:15px; font-weight:500; margin-top:2px">فيلا بمسبح وتاج. لازم تثبت إنو الحساب إلك: بتاخد رمز وبتكتبه بتعليق من حسابك.</div>
        <button class="big" type="button" id="getCode">عطيني الرمز</button>
        <div class="err" id="codeErr" role="alert"></div>
      </div>`;
    const btn = box.querySelector('#getCode'), err = box.querySelector('#codeErr');
    btn.onclick = async () => {
      btn.disabled = true; err.textContent = '';
      try {
        const res = await fetch('api/app/code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ u }) });
        const r = await res.json();
        if (res.ok && r.villa) { reloadHome(); return; } // already one: load the city again
        if (res.ok && r.code) { codeSteps(box, r.code); return; }
        err.textContent = 'ما قدرنا نطلّع الرمز… جرّب بعد شوي.';
      } catch (x) { err.textContent = 'ما في إنترنت… جرّب مرة تانية.'; }
      btn.disabled = false;
    };
  }
  // the city again, with the house as it is now (keeps ?app)
  function reloadHome() { const q = new URLSearchParams(location.search); q.set('tab', 'home'); location.href = '/?' + q; }
  function codeSteps(box, code) {
    box.innerHTML = `
      <div class="box">
        <div id="code" style="font-size:30px; font-weight:800; direction:ltr; text-align:center; user-select:all; -webkit-user-select:all">${esc(code)}</div>
        <button class="big ghost" type="button" id="copyCode">انسخ الرمز</button>
        <ol style="margin:12px 0 0; padding-inline-start:20px; font-size:15px; line-height:1.8">
          <li>افتح واحد من آخر منشورات <bdi dir="ltr">@hartna.city</bdi></li>
          <li>اكتب الرمز بتعليق، من حسابك نفسه</li>
          <li>ارجع لهون وحدّث. عادةً بدها لحظات، وأحياناً لحد 10 دقايق</li>
        </ol>
        <a class="big" style="text-align:center; text-decoration:none" href="https://www.instagram.com/hartna.city?dmpr=NWNueWcya2c0OHZx">افتح إنستغرام</a>
        <button class="big ghost" type="button" id="checkVilla">كتبته، حدّث</button>
      </div>`;
    const copy = box.querySelector('#copyCode');
    copy.onclick = async () => {
      try { await navigator.clipboard.writeText(code); copy.textContent = 'انتسخ ✅'; }
      catch (x) { copy.textContent = 'اضغط مطوّلاً على الرمز لتنسخه'; }
    };
    box.querySelector('#checkVilla').onclick = () => { reloadHome(); };
  }
  async function rewardCard(box) {
    if (!App.rewarded) return;
    let state;
    try { state = await (await fetch('api/app/state', { cache: 'no-store' })).json(); } catch (x) { return; }
    if (!state.rewards || !box.isConnected) return;
    App.prepareRewarded();
    box.innerHTML = `
      <div class="box row"><div style="font-size:34px">🎬</div>
        <div class="grow"><div style="font-weight:800; font-size:17px">شوف إعلان قصير</div><div style="color:var(--muted); font-size:14px; font-weight:500">وزيد رصيد المدينة 🪙 لنشتري المعلم الجاي</div></div>
        <button class="pill" type="button" id="watch">شوف</button></div>
      <div class="err" id="adMsg" style="color:#1f8a4c"></div>`;
    const btn = box.querySelector('#watch'), msg = box.querySelector('#adMsg');
    btn.onclick = () => { btn.disabled = true; msg.textContent = ''; App.rewarded(); };
    window.haretnaReward = (ok) => {
      btn.disabled = false;
      if (ok) msg.textContent = 'يسلمو 🙏 الرصيد بيزيد أول ما جوجل يأكد المشاهدة (لحد 10 إعلانات باليوم).';
    };
  }

  // ---- this week's race, the real counts
  function raceTab() {
    const r = window.haretnaCity && window.haretnaCity.race();
    if (!r) { sheet.innerHTML = '<div class="in head"><h2>🏁 سباق الأسبوع</h2><p>عم نحمّل…</p></div>'; setTimeout(() => current === 'race' && show('race'), 1500); return; }
    const rank = Object.keys(TOWNS).sort((a, b) => (r.counts[b] || 0) - (r.counts[a] || 0)), top = Math.max(1, r.counts[rank[0]] || 0);
    const ms = Math.max(0, r.end - Date.now()), d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5);
    const days = d === 1 ? 'يوم' : d === 2 ? 'يومين' : `${d} ${d <= 10 ? 'أيام' : 'يوم'}`;
    const hours = h === 1 ? 'ساعة' : h === 2 ? 'ساعتين' : `${h} ${h >= 3 && h <= 10 ? 'ساعات' : 'ساعة'}`;
    const left = ms <= 0 ? 'خلص السباق' : `⏳ باقي ${d ? days + (h ? ' و ' + hours : '') : hours}`;
    sheet.innerHTML = `
      <div class="in head">
        <span class="pill" style="font-size:22px; display:inline-block">🏁 سباق الأسبوع</span>
        <p style="margin:10px 0 0; font-weight:700">${left}</p>
        <div class="box"><ol class="race" style="list-style:none; margin:0; padding:0">${rank.map((c, i) => `
          <li><span class="n" style="background:${['#d4a017', '#8d99ae', '#b0703a'][i] || '#c9ced6'}">${i + 1}</span><img src="${flag(c)}" alt=""><b class="name">${TOWNS[c][1]}</b>
          <span class="bar"><span style="width:${r.counts[c] ? Math.max(4, r.counts[c] / top * 100) : 0}%; background:${TOWNS[c][2]}"></span></span><b class="c">+${n2(r.counts[c] || 0)}</b></li>`).join('')}</ol></div>
        <p style="margin-top:14px">كل بيت جديد = +1 لبلده. أول تلات دول بيطلعوا على منصة الأبطال 🏆</p>
      </div>`;
  }
}
