/*
 * Puente del Probador Virtual con la web que lo contiene (Atelier, Outlet y Sedka).
 *
 * Va en la página de la web que tiene el iframe del probador:
 *   <script src="https://probador-sedka.crmnovias.com/probador-bridge.js" async></script>
 *
 * - Le pasa al probador la URL de la página (UTM, fbclid, test_event_code) y las
 *   cookies _fbp y _fbc de Meta.
 * - Dispara con el píxel de la web los eventos que le manda el probador, con el
 *   mismo eventID que el CRM manda por la API de conversiones (cuentan una vez).
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

  function cookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function context() {
    return {
      source: 'probador-web',
      type: 'context',
      url: window.location.href,
      search: window.location.search,
      fbp: cookie('_fbp'),
      fbc: cookie('_fbc'),
      pixel: typeof window.fbq === 'function'
    };
  }

  window.addEventListener('message', function (event) {
    if (ORIGINS.indexOf(event.origin) === -1) return;
    var data = event.data || {};
    if (data.source !== 'probador-crm') return;

    if (data.type === 'hello' && event.source) {
      event.source.postMessage(context(), event.origin);
      return;
    }

    if (data.type === 'meta-event' && typeof window.fbq === 'function' && data.name && data.eventId) {
      window.fbq(data.custom ? 'trackCustom' : 'track', data.name, data.params || {}, { eventID: data.eventId });
    }
  });
})();
