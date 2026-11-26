/*
 * مراقبة أخطاء واجهة حارتنا عبر Sentry.
 * يتطلب تحميل مكتبة Sentry أولاً، ثم sentry-config.js.
 * لا يتم تفعيل Session Replay أو جمع البيانات الشخصية افتراضياً.
 */
(function () {
  'use strict';

  var dsn = String(window.HARTNA_SENTRY_DSN || '').trim();

  // لا تبدأ المراقبة إذا لم تكن المكتبة أو قيمة DSN متوفرة.
  if (!dsn || !window.Sentry || typeof window.Sentry.init !== 'function') {
    return;
  }

  window.Sentry.init({
    dsn: dsn,
    environment: location.hostname === 'localhost' ? 'development' : 'production',
    release: 'hartna-web@1.0.0',
    sendDefaultPii: false,
    maxBreadcrumbs: 30,
    tracesSampleRate: 0,

    // تقليل البيانات الحساسة قبل إرسال الحدث.
    beforeSend: function (event) {
      if (event.request) {
        if (typeof event.request.url === 'string') {
          try {
            var url = new URL(event.request.url, location.origin);
            event.request.url = url.origin + url.pathname;
          } catch (_) {
            event.request.url = location.origin + '/';
          }
        }

        delete event.request.cookies;
        delete event.request.headers;
        delete event.request.data;
        delete event.request.query_string;
      }

      delete event.user;
      return event;
    }
  });

  // اختبار يدوي: نفّذ window.hartnaSentryTest() من وحدة تحكم المتصفح.
  // يرسل استثناء اختبارياً يظهر عادةً ضمن Issues في Sentry.
  window.hartnaSentryTest = function () {
    if (window.Sentry && typeof window.Sentry.captureException === 'function') {
      window.Sentry.captureException(new Error('اختبار اتصال Sentry من حارتنا'));
      return true;
    }
    return false;
  };
})();
