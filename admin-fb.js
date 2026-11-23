// عميل Firebase صغير للأدمن (REST فقط، بدون سكربتات خارجية).
// تسجيل الدخول: Firebase Authentication (بريد + كلمة مرور). الكتابة: Realtime Database وبقواعد تسمح لحساب الأدمن فقط.
(function (g) {
  const KEY = 'AIzaSyCVJclfpEp9Jo9879C3RfZKiEdBUibwrxI'; // مفتاح الويب عام بطبيعته، الحماية في القواعد وفي تقييده بالنطاق
  const DB = 'https://ahmad-662ee-default-rtdb.firebaseio.com';
  const T = { id: '', refresh: '', exp: 0, email: '' };
  const SK = 'fba';
  const ss = () => { try { return g.sessionStorage; } catch (e) { return null; } };
  const save = () => { const s = ss(); if (s) s.setItem(SK, JSON.stringify(T)); };

  const ERR = {
    EMAIL_NOT_FOUND: 'البريد أو كلمة المرور غير صحيحة',
    INVALID_PASSWORD: 'البريد أو كلمة المرور غير صحيحة',
    INVALID_LOGIN_CREDENTIALS: 'البريد أو كلمة المرور غير صحيحة',
    INVALID_EMAIL: 'البريد غير صالح',
    USER_DISABLED: 'هذا الحساب معطّل',
    TOO_MANY_ATTEMPTS_TRY_LATER: 'محاولات كثيرة، انتظر قليلاً ثم أعد المحاولة',
  };
  async function post(url, body, form) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': form ? 'application/x-www-form-urlencoded' : 'application/json' },
      body: form ? new URLSearchParams(body).toString() : JSON.stringify(body),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      const code = String((j.error && j.error.message) || '').split(' ')[0];
      throw new Error(ERR[code] || 'تعذّر الدخول (' + (code || res.status) + ')');
    }
    return j;
  }
  const take = (idToken, refresh, secs, email) => {
    T.id = idToken; T.refresh = refresh; T.exp = Date.now() + Number(secs) * 1000; if (email) T.email = email; save();
  };

  async function signIn(email, password) {
    const j = await post('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + KEY,
      { email: String(email).trim(), password, returnSecureToken: true });
    take(j.idToken, j.refreshToken, j.expiresIn, j.email);
  }
  async function token() {
    if (!T.id) throw new Error('NOT_SIGNED');
    if (Date.now() > T.exp - 60000) {
      const j = await post('https://securetoken.googleapis.com/v1/token?key=' + KEY,
        { grant_type: 'refresh_token', refresh_token: T.refresh }, true);
      take(j.id_token, j.refresh_token, j.expires_in);
    }
    return T.id;
  }
  async function call(method, path, body) {
    const tok = await token();
    const res = await fetch(`${DB}/${path}.json?auth=${encodeURIComponent(tok)}`, {
      method, cache: 'no-store',
      ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    });
    if (res.status === 401 || res.status === 403) throw new Error('DENIED');
    if (!res.ok) throw new Error('db ' + res.status);
    return res.json();
  }

  g.FBA = {
    signIn,
    get: (path) => call('GET', path),
    patch: (path, obj) => call('PATCH', path, obj), // مسارات متعددة بعملية واحدة ذرّية
    // القواعد تسمح بقراءة adminCheck للأدمن فقط: النجاح = أدمن، DENIED = حساب عادي
    async checkAdmin() { try { await call('GET', 'adminCheck'); return true; } catch (e) { if (e.message === 'DENIED') return false; throw e; } },
    restore() {
      const s = ss(); if (!s) return false;
      try { Object.assign(T, JSON.parse(s.getItem(SK) || '{}')); } catch (e) { return false; }
      return !!(T.id && T.refresh);
    },
    signOut() { T.id = T.refresh = T.email = ''; T.exp = 0; const s = ss(); if (s) s.removeItem(SK); },
    email: () => T.email,
  };
})(typeof window !== 'undefined' ? window : globalThis);
