/*
 * Puente del Probador Virtual con la web que lo contiene (Atelier, Outlet y Sedka).
 *
 * Va en la página de la web que tiene el iframe del probador:
 *   <script src="https://probador-sedka.crmnovias.com/probador-bridge.js" async></script>
 *
 * - Le pasa al probador la URL de la página (UTM, fbclid, test_event_code), las
 *   cookies _fbp y _fbc de Meta y si la clienta ha aceptado la publicidad en el
 *   banner de cookies (CookieYes). Se lo vuelve a pasar cuando responde al banner.
 * - Dispara con el píxel de la web los eventos que le manda el probador, con el
 *   mismo eventID que el CRM manda por la API de conversiones (cuentan una vez).
 *   El probador solo los manda con la publicidad aceptada.
 *
 * Solo acepta mensajes de los dominios del probador. Ver Docs/meta-eventos.md.
 */
(function () {
  if (window.__probadorBridge) return;
  window.__probadorBridge = true;

  var ORIGINS = [
    'https://probador.crmnovias.com',
    'https://probador-outlet.crmnovias.com',
    'https://probador-sedka.crmnovias.com'
  ];
  var frames = [];

  function cookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  // granted / denied / pending (sin responder al banner) / unknown (web sin CookieYes).
  function consent() {
    try {
      if (typeof window.getCkyConsent === 'function') {
        var state = window.getCkyConsent();
        if (state && state.categories) {
          if (state.categories.advertisement === true) return 'granted';
          return state.isUserActionCompleted ? 'denied' : 'pending';
        }
      }
    } catch (e) {}
    return 'unknown';
  }

  function context() {
    return {
      source: 'probador-web',
      type: 'context',
      url: window.location.href,
      search: window.location.search,
      fbp: cookie('_fbp'),
      fbc: cookie('_fbc'),
      consent: consent(),
      pixel: typeof window.fbq === 'function'
    };
  }

  function sendContext() {
    for (var i = 0; i < frames.length; i++) {
      try {
        frames[i].win.postMessage(context(), frames[i].origin);
      } catch (e) {}
    }
  }

  window.addEventListener('message', function (event) {
    if (ORIGINS.indexOf(event.origin) === -1) return;
    var data = event.data || {};
    if (data.source !== 'probador-crm') return;

    if (data.type === 'hello' && event.source) {
      var known = false;
      for (var i = 0; i < frames.length; i++) {
        if (frames[i].win === event.source) known = true;
      }
      if (!known) frames.push({ win: event.source, origin: event.origin });
      event.source.postMessage(context(), event.origin);
      return;
    }

    if (data.type === 'meta-event' && typeof window.fbq === 'function' && data.name && data.eventId) {
      window.fbq(data.custom ? 'trackCustom' : 'track', data.name, data.params || {}, { eventID: data.eventId });
    }
  });

  // La clienta responde al banner de CookieYes: el probador lo sabe al momento.
  document.addEventListener('cookieyes_consent_update', function () {
    // CookieYes guarda su cookie justo después del evento.
    window.setTimeout(sendContext, 300);
  });
})();
