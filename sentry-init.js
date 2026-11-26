/* مراقبة أخطاء واجهة حارتنا عبر Sentry.
 * لا يبدأ الإرسال قبل وضع DSN صالح في sentry-config.js.
 * لا يتم تفعيل Session Replay أو جمع بيانات شخصية افتراضياً.
 */
(function () {
  'use strict';

  var dsn = String(window.HARTNA_SENTRY_DSN || '').trim();
  if (!dsn || !window.Sentry || typeof window.Sentry.init !== 'function') return;

  window.Sentry.init({
    dsn: dsn,
    environment: location.hostname === 'localhost' ? 'development' : 'production',
    release: 'hartna-web@1.0.0',
    sendDefaultPii: false,
    maxBreadcrumbs: 30,
    tracesSampleRate: 0,
    beforeSend: function (event) {
      // لا نرسل معاملات الروابط أو أجزاءها التي قد تحتوي رموزاً أو بيانات خاصة.
      if (event.request && typeof event.request.url === 'string') {
        try {
          var url = new URL(event.request.url, location.origin);
          event.request.url = url.origin + url.pathname;
        } catch (_) {
          event.request.url = location.origin + '/';
        }
      }
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
        delete event.request.data;
        delete event.request.query_string;
      }
      delete event.user;
      return event;
    }
  });

  // وسيلة اختبار يدوية بعد التثبيت: window.hartnaSentryTest()
  window.hartnaSentryTest = function () {
    if (window.Sentry && typeof window.Sentry.captureMessage === 'function') {
      window.Sentry.captureMessage('اختبار اتصال Sentry من حارتنا', 'info');
      return true;
    }
    return false;
  };
})();
