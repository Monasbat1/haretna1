// قيادة السيارة الخاصة: فيزياء بسيطة، ناقل حركة أوتوماتيكي (D1..D6 / R / N)، عداد السرعة،
// صوت محرك وزمور، اصطدام بالبيوت والأشجار والمعالم (كل بلوك مبني جسم صلب، فالسيارة لا تسير إلا على الطرق)،
// ومخالفات مرورية (إشارة حمراء، سرعة زائدة). تُشغَّل من city.js عبر createDrive(ctx).
const LIMIT = 60;            // كم/س: حد السرعة داخل المدينة
const MAXV = 30;             // م/ث (~108 كم/س)
const GEARS = [0, 14, 28, 46, 66, 88]; // بداية كل غيار بالكم/س
const FINES = { red: [200, 'تجاوز إشارة حمراء 🚦'], speed: [100, 'سرعة زائدة ⚡'], crash: [50, 'اصطدام 💥'] };
const LS = { get: (k) => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* خاصة */ } } };

export function createDrive(ctx) {
  const { THREE, camera, controls, toast, BW, BD, SLAB_W, SLAB_D, blockAt, extra, input, makeCar, traffic, cars } = ctx;
  const st = { on: false, x: 0, z: 0, yaw: 0, v: 0, steer: 0, gear: 'N', rpm: 0, color: '#d64545', brake: false, honk: false };
  let carObj = null, carColor = '', audio = null, hud = null, lastHonkAt = 0;
  const fines = (() => { try { return JSON.parse(LS.get('hzFines') || '{"n":0,"sum":0}'); } catch (e) { return { n: 0, sum: 0 }; } })();
  const cool = {}; // مهلة بين مخالفتين من النوع نفسه
  let overSince = 0, inZone = null;

  // ---------------------------------------------------------------- الصوت
  function ensureAudio() {
    if (audio) { if (audio.ac.state === 'suspended') audio.ac.resume(); return audio; }
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext; if (!AC) return null;
    const ac = new AC(), master = ac.createGain(); master.gain.value = 0.6; master.connect(ac.destination);
    const eng = ac.createOscillator(), eng2 = ac.createOscillator(), lp = ac.createBiquadFilter(), eg = ac.createGain();
    eng.type = 'sawtooth'; eng2.type = 'square'; lp.type = 'lowpass'; lp.frequency.value = 520; eg.gain.value = 0;
    eng.connect(lp); eng2.connect(lp); lp.connect(eg); eg.connect(master); eng.start(); eng2.start();
    audio = { ac, master, eng, eng2, lp, eg, muted: false };
    return audio;
  }
  function beep(freqs, dur, vol, pan) { // زمور: نغمتان متوازيتان
    const a = ensureAudio(); if (!a || a.muted) return;
    const t = a.ac.currentTime, g = a.ac.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.setValueAtTime(vol, t + dur - 0.05); g.gain.linearRampToValueAtTime(0, t + dur);
    g.connect(a.master);
    for (const f of freqs) { const o = a.ac.createOscillator(); o.type = 'square'; o.frequency.value = f; o.connect(g); o.start(t); o.stop(t + dur + 0.02); }
    void pan;
  }
  function thud(vol = 0.5) {
    const a = ensureAudio(); if (!a || a.muted) return;
    const n = a.ac.sampleRate * 0.25, buf = a.ac.createBuffer(1, n, a.ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
    const s = a.ac.createBufferSource(), g = a.ac.createGain(), f = a.ac.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 400; g.gain.value = vol; s.buffer = buf; s.connect(f); f.connect(g); g.connect(a.master); s.start();
  }
  // زمور سيارة من المدينة: الصوت يخفت مع بعدها عن الكاميرا
  function honkAt(x, z) {
    const now = performance.now(); if (now - lastHonkAt < 1800) return;
    const d = Math.hypot(x - camera.position.x, z - camera.position.z), vol = Math.max(0, 0.12 * (1 - d / 160));
    if (vol < 0.01) return;
    lastHonkAt = now; beep([392, 494], 0.32, vol);
  }
  function engineSound() {
    if (!audio || !st.on) return;
    const a = audio, t = a.ac.currentTime, kmh = Math.abs(st.v) * 3.6;
    const f = 48 + st.rpm * 120 + kmh * 0.4;
    a.eng.frequency.setTargetAtTime(f, t, 0.05); a.eng2.frequency.setTargetAtTime(f * 0.5, t, 0.05);
    a.lp.frequency.setTargetAtTime(380 + st.rpm * 900, t, 0.08);
    a.eg.gain.setTargetAtTime(a.muted ? 0 : 0.035 + 0.05 * st.rpm, t, 0.08);
  }

  // ---------------------------------------------------------------- الواجهة
  function buildHud() {
    const css = document.createElement('style');
    css.textContent = `
    .dv{position:fixed;inset-inline:0;bottom:0;z-index:9;display:none;pointer-events:none;font-family:inherit}
    body.hz-drive .dv{display:block}
    body.hz-drive .hz-dock .walk-only{display:none!important}
    .dv .gauge{position:absolute;inset-inline-start:10px;bottom:calc(14px + env(safe-area-inset-bottom));width:132px;padding:10px 12px;border-radius:18px;background:rgba(18,22,32,.82);color:#fff;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.3)}
    .dv .kmh{font-size:40px;font-weight:800;line-height:1;font-variant-numeric:tabular-nums}.dv .kmh small{font-size:12px;font-weight:500;opacity:.7;margin-inline-start:3px}
    .dv .gear{display:inline-block;margin-top:4px;padding:2px 12px;border-radius:9px;background:#e1306c;font-weight:800;font-size:17px;letter-spacing:1px}
    .dv .rpm{height:6px;border-radius:3px;background:#39404f;margin-top:8px;overflow:hidden}.dv .rpm i{display:block;height:100%;width:0;background:linear-gradient(90deg,#25e06a,#ffc21a,#ff3b30)}
    .dv .lim{position:absolute;inset-inline-start:150px;bottom:calc(20px + env(safe-area-inset-bottom));width:50px;height:50px;border-radius:50%;background:#fff;border:6px solid #e03131;display:grid;place-items:center;font-weight:800;font-size:18px;color:#1d2433}
    .dv .lim.over{animation:dvb .5s infinite}@keyframes dvb{50%{background:#ffd6d6}}
    .dv .fine{position:absolute;inset-inline-start:10px;bottom:calc(150px + env(safe-area-inset-bottom));padding:5px 11px;border-radius:12px;background:rgba(255,255,255,.92);font-weight:700;font-size:13px;color:#b02a37}
    .dv .btns{position:absolute;inset-inline-end:14px;bottom:calc(150px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:8px;pointer-events:auto}
    .dv .btns button{width:56px;height:56px;border-radius:50%;border:0;font-size:24px;background:rgba(255,255,255,.95);box-shadow:0 6px 18px rgba(30,50,90,.25);cursor:pointer;touch-action:none;padding:0}
    .dv .btns button:active,.dv .btns button.dn{background:#ffd9e4}.dv .btns .exit{background:#e1306c}
    .dv .flash{position:fixed;inset:0;background:rgba(224,49,49,.28);opacity:0;transition:opacity .5s;pointer-events:none}
    .dv .flash.on{opacity:1;transition:none}
    @media(min-width:700px){.dv .gauge{width:160px}.dv .kmh{font-size:50px}}`;
    document.head.appendChild(css);
    const d = document.createElement('div'); d.className = 'dv';
    d.innerHTML = `<div class="flash"></div>
      <div class="gauge"><div class="kmh"><span id="dvK">0</span><small>كم/س</small></div><div class="gear" id="dvG">N</div><div class="rpm"><i id="dvR"></i></div></div>
      <div class="lim" id="dvL">${LIMIT}</div>
      <div class="fine" id="dvF"></div>
      <div class="btns">
        <button type="button" id="dvHorn" aria-label="زمور">📢</button>
        <button type="button" id="dvBrake" aria-label="فرامل">🛑</button>
        <button type="button" id="dvMute" aria-label="الصوت">🔊</button>
        <button type="button" class="exit" id="dvExit" aria-label="نزول من السيارة">🚪</button>
      </div>`;
    document.body.appendChild(d);
    const $ = (s) => d.querySelector(s);
    hud = { root: d, k: $('#dvK'), g: $('#dvG'), r: $('#dvR'), lim: $('#dvL'), fine: $('#dvF'), flash: $('.flash') };
    const hold = (el, on, off) => { el.addEventListener('pointerdown', (e) => { e.preventDefault(); el.classList.add('dn'); on(); }); for (const t of ['pointerup', 'pointercancel', 'pointerleave']) el.addEventListener(t, () => { el.classList.remove('dn'); off(); }); };
    hold($('#dvHorn'), () => { st.honk = true; }, () => { st.honk = false; });
    hold($('#dvBrake'), () => { st.brake = true; }, () => { st.brake = false; });
    $('#dvMute').onclick = () => { const a = ensureAudio(); if (a) { a.muted = !a.muted; $('#dvMute').textContent = a.muted ? '🔇' : '🔊'; } };
    $('#dvExit').onclick = () => api.stop();
    addEventListener('keydown', (e) => { if (!st.on || /INPUT|TEXTAREA/.test((e.target || {}).tagName)) return; if (e.code === 'Space') { st.brake = true; e.preventDefault(); } if (e.key === 'h' || e.key === 'H') st.honk = true; });
    addEventListener('keyup', (e) => { if (e.code === 'Space') st.brake = false; if (e.key === 'h' || e.key === 'H') st.honk = false; });
    showFines();
  }
  const showFines = () => { if (hud) hud.fine.textContent = fines.n ? `🧾 مخالفاتي: ${fines.n} · ${fines.sum} 🪙` : '🧾 لا مخالفات'; };
  function fine(kind) {
    const now = performance.now(); if (cool[kind] && now - cool[kind] < (kind === 'speed' ? 9000 : 4000)) return;
    cool[kind] = now; const [amount, text] = FINES[kind];
    fines.n++; fines.sum += amount; LS.set('hzFines', JSON.stringify(fines)); showFines();
    toast(`🚔 مخالفة مرورية: ${text} · ${amount} 🪙`, 4200);
    hud.flash.classList.add('on'); setTimeout(() => hud.flash.classList.remove('on'), 120);
    beep([660, 880], 0.18, 0.1);
  }

  // ---------------------------------------------------------------- الاصطدام
  // كل بلوك مبني (بيوت، أشجار، معالم، حدائق) جسم مستطيل صلب؛ الطرق هي الفراغ بينها. إضافةً إلى مناطق خاصة (مطارات، وادي رم، دوّار السيف).
  const R = 1.35;
  function pushOutRect(x0, x1, z0, z1) {
    const cx = Math.max(x0, Math.min(st.x, x1)), cz = Math.max(z0, Math.min(st.z, z1));
    let dx = st.x - cx, dz = st.z - cz, d = Math.hypot(dx, dz);
    if (d >= R) return 0;
    if (d < 1e-4) { // المركز داخل المستطيل: أقصر خروج
      const o = [[st.x - x0, -1, 0], [x1 - st.x, 1, 0], [st.z - z0, 0, -1], [z1 - st.z, 0, 1]].sort((a, b) => a[0] - b[0])[0];
      st.x += o[1] * (o[0] + R); st.z += o[2] * (o[0] + R); return 1;
    }
    st.x += (dx / d) * (R - d); st.z += (dz / d) * (R - d); return 1;
  }
  function collide() {
    let hit = 0;
    const bx = Math.round(st.x / BW), bz = Math.round(st.z / BD);
    for (let i = bx - 1; i <= bx + 1; i++) for (let j = bz - 1; j <= bz + 1; j++) {
      if (!blockAt.has(i + ',' + j)) continue;
      hit |= pushOutRect(i * BW - SLAB_W / 2, i * BW + SLAB_W / 2, j * BD - SLAB_D / 2, j * BD + SLAB_D / 2);
    }
    for (const o of extra()) {
      if (o.r) { const dx = st.x - o.x, dz = st.z - o.z, d = Math.hypot(dx, dz) || 1e-3; if (d < o.r + R) { st.x = o.x + (dx / d) * (o.r + R); st.z = o.z + (dz / d) * (o.r + R); hit = 1; } }
      else hit |= pushOutRect(o[0], o[1], o[2], o[3]);
    }
    return hit;
  }

  // ---------------------------------------------------------------- الحركة
  function gearFor(kmh) { let g = 0; for (let i = 0; i < GEARS.length; i++) if (kmh >= GEARS[i]) g = i; return g; }
  function step(dt, now) {
    const inp = input(), thr = Math.max(-1, Math.min(1, inp.y)), steerIn = Math.max(-1, Math.min(1, inp.x));
    // السرعة
    let a = 0;
    if (st.brake) a = -Math.sign(st.v) * 22;
    else if (thr > 0.05) a = st.v < -0.2 ? 20 : 9.5 * (1 - Math.max(0, st.v) / MAXV) * thr + 1.5 * thr;
    else if (thr < -0.05) a = st.v > 0.2 ? -18 * -thr : -5 * -thr;
    a -= Math.sign(st.v) * (0.8 + 0.012 * st.v * st.v); // احتكاك + مقاومة هواء
    const v0 = st.v; st.v += a * dt;
    if ((v0 > 0 && st.v < 0 && (st.brake || thr >= -0.05)) || (v0 < 0 && st.v > 0 && thr <= 0.05)) st.v = 0;
    st.v = Math.max(-8, Math.min(MAXV, st.v));
    if (Math.abs(st.v) < 0.05 && Math.abs(thr) < 0.05) st.v = 0;
    // التوجيه (نموذج دراجة): يقلّ مدى التوجيه مع السرعة
    st.steer += (steerIn - st.steer) * Math.min(1, dt * 7);
    const delta = st.steer * 0.62 * (1 - Math.min(1, Math.abs(st.v) / 34) * 0.62);
    st.yaw -= (st.v * Math.tan(delta) / 2.6) * dt;
    const px = st.x, pz = st.z;
    st.x += Math.sin(st.yaw) * st.v * dt; st.z += Math.cos(st.yaw) * st.v * dt;
    if (collide()) {
      const moved = Math.hypot(st.x - px, st.z - pz), impact = Math.abs(st.v);
      if (impact > 3) { thud(Math.min(0.7, impact / 20)); if (impact * 3.6 > 22) fine('crash'); }
      st.v *= impact > 3 ? -0.18 : 0.4; void moved;
    }
    // ناقل الحركة الأوتوماتيكي
    const kmh = Math.abs(st.v) * 3.6;
    if (st.v < -0.3) { st.gear = 'R'; st.rpm = Math.min(1, kmh / 28); }
    else if (kmh < 0.8 && thr < 0.05) { st.gear = 'N'; st.rpm = 0.12 + Math.max(0, thr) * 0.3; }
    else { const g = gearFor(kmh), lo = GEARS[g], hi = GEARS[g + 1] || 112; st.gear = 'D' + (g + 1); st.rpm = 0.25 + 0.7 * Math.min(1, (kmh - lo) / (hi - lo)); }
    // المخالفات
    if (kmh > LIMIT + 4) { if (!overSince) overSince = now; else if (now - overSince > 2500) fine('speed'); } else overSince = 0;
    const z = traffic.zoneAt(st.x, st.z);
    if (z && !inZone && kmh > 12) { // دخلت التقاطع للتو
      const axis = Math.abs(Math.sin(st.yaw)) > Math.abs(Math.cos(st.yaw)) ? 'x' : 'z';
      if (traffic.state(z.i, z.j, axis, now) === 'r') fine('red');
    }
    inZone = z;
    // الصوت والزمور
    if (st.honk && now - (step.hn || 0) > 380) { step.hn = now; ensureAudio(); beep([392, 494], 0.34, 0.16); }
    engineSound();
    place(); follow(dt); paint(kmh);
  }
  function place() { if (carObj) carObj.place(st.x, st.z, st.yaw, st.steer); }
  const _t = new THREE.Vector3();
  function follow(dt) {
    const k = Math.min(1, dt * 4.5), back = 11 + Math.min(6, Math.abs(st.v) * 0.25), h = 5.2 + Math.min(3, Math.abs(st.v) * 0.1);
    const tx = st.x - Math.sin(st.yaw) * back, tz = st.z - Math.cos(st.yaw) * back;
    camera.position.x += (tx - camera.position.x) * k; camera.position.z += (tz - camera.position.z) * k; camera.position.y += (h - camera.position.y) * k;
    controls.target.set(st.x + Math.sin(st.yaw) * 4, 1.2, st.z + Math.cos(st.yaw) * 4);
    void _t;
  }
  function paint(kmh) {
    hud.k.textContent = Math.round(kmh); hud.g.textContent = st.gear; hud.r.style.width = Math.round(st.rpm * 100) + '%';
    hud.lim.classList.toggle('over', kmh > LIMIT + 4);
  }

  // ---------------------------------------------------------------- تشغيل/إيقاف
  const api = {
    state: st, fines, honkAt,
    get on() { return st.on; },
    start(x, z, yaw, color) {
      if (!hud) buildHud();
      ensureAudio();
      if (!carObj || carColor !== color) { if (carObj) carObj.hide(); carObj = makeCar(color); carColor = color; }
      Object.assign(st, { on: true, x, z, yaw, v: 0, steer: 0, gear: 'N', rpm: 0.12, color, brake: false, honk: false });
      document.body.classList.add('hz-walk', 'hz-drive');
      controls.enablePan = false; controls.enableRotate = false; controls.enableZoom = false;
      camera.position.set(x - Math.sin(yaw) * 12, 6, z - Math.cos(yaw) * 12);
      overSince = 0; inZone = null; showFines(); place();
      toast('🚗 قدت سيارتك: العصا للتوجيه والتسارع · 📢 زمور · 🛑 فرامل · 🚪 للنزول', 5500);
    },
    stop() {
      if (!st.on) return;
      st.on = false; st.v = 0;
      if (carObj) carObj.hide();
      if (audio) audio.eg.gain.setTargetAtTime(0, audio.ac.currentTime, 0.05);
      document.body.classList.remove('hz-walk', 'hz-drive');
      controls.enablePan = true; controls.enableRotate = true; controls.enableZoom = true;
      ctx.onStop && ctx.onStop(st.x, st.z);
    },
    update(dt, now) { if (st.on) step(dt, now); },
    carsRef: cars,
  };
  return api;
}
