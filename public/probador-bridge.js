/*
 * Puente del Probador Virtual con la web que lo contiene (Atelier, Outlet y Sedka).
 *
 * Va en la página de la web que tiene el iframe del probador:
 *   <script src="https://probador-sedka.crmnovias.com/probador-bridge.js" async></script>
 *
 * - Le pasa al probador la URL de la página (UTM, fbclid, test_event_code), la de
 *   la página por la que llegó a la web (la guarda el plugin de formularios), las
 *   cookies _fbp y _fbc de Meta y si la clienta ha aceptado la publicidad en el
 *   banner de cookies (CookieYes). Se lo vuelve a pasar cuando responde al banner
 *   y cuando el píxel crea las cookies después.
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
  // El plugin de formularios de la web (utm-tracker.js) guarda en la sesión la
  // consulta de la página de llegada (fbclid, utm_*). Si la clienta llegó del
  // anuncio a otra página y después abre el probador, su campaña sale de aquí.
  var LANDING_KEY = 'atcrm_utms';
  // El píxel crea _fbp y _fbc un poco después de cargar la página o de aceptar
  // el banner: se vigilan un rato y, si cambian, se vuelve a avisar al probador.
  var WATCH_MS = 10000;
  var WATCH_EVERY_MS = 500;
  var frames = [];
  var sentCookies = null;
  var watchUntil = 0;
  var watcher = null;

  function cookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function landing() {
    try {
      var query = window.sessionStorage.getItem(LANDING_KEY);
      return query ? '?' + query.replace(/^\?/, '') : '';
    } catch (e) {
      return '';
    }
  }

  function fbCookies() {
    return (cookie('_fbp') || '') + '|' + (cookie('_fbc') || '');
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
      landing: landing(),
      fbp: cookie('_fbp'),
      fbc: cookie('_fbc'),
      consent: consent(),
      pixel: typeof window.fbq === 'function'
    };
  }

  function sendContext() {
    sentCookies = fbCookies();
    for (var i = 0; i < frames.length; i++) {
      try {
        frames[i].win.postMessage(context(), frames[i].origin);
      } catch (e) {}
    }
  }

  // Vuelve a avisar si el píxel crea o cambia _fbp/_fbc en los próximos segundos.
  function watchCookies() {
    watchUntil = Date.now() + WATCH_MS;
    if (watcher) return;
    watcher = window.setInterval(function () {
      if (fbCookies() !== sentCookies) sendContext();
      if (Date.now() > watchUntil) {
        window.clearInterval(watcher);
        watcher = null;
      }
    }, WATCH_EVERY_MS);
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
      sentCookies = fbCookies();
      event.source.postMessage(context(), event.origin);
      watchCookies();
      return;
    }

    if (data.type === 'meta-event' && typeof window.fbq === 'function' && data.name && data.eventId) {
      window.fbq(data.custom ? 'trackCustom' : 'track', data.name, data.params || {}, { eventID: data.eventId });
    }
  });

  // La clienta responde al banner de CookieYes: el probador lo sabe al momento.
  document.addEventListener('cookieyes_consent_update', function () {
    // CookieYes guarda su cookie justo después del evento. El píxel, que se carga
    // al aceptar, crea _fbp/_fbc más tarde: lo recoge la vigilancia.
    window.setTimeout(sendContext, 300);
    watchCookies();
  });
})();
