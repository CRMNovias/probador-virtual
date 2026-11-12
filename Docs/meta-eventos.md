# Eventos de Meta, UTM y puente con la web

Los tres probadores (Atelier, Outlet y Sedka) avisan a Meta en cada paso, con el
píxel de la web de la marca y por la API de conversiones del CRM, con el mismo
`event_id` (Meta los cuenta una vez). La regla completa está en el CRM:
`resources/docs/programming-rules/probador-meta-eventos.md`.

| Paso | Evento | Dónde |
|---|---|---|
| Abre el probador | `ViewContent` | `src/v2/routes.tsx` (`trackOpen`) |
| Sube su foto | `SubeFoto` (personalizado) | `src/v2/app/avatar/avatar-flow.tsx` |
| Ve la prueba | `CustomizeProduct`, una vez por vestido | `src/v2/app/probador/use-probador.ts` (`trackTryOnShown`) |
| Teléfono y tienda | `CompleteRegistration` (si el CRM responde `registered`) | `entrar/login-flow.tsx`, `components/shop-sheet.tsx` |
| Reserva cita | `Schedule` | `src/v2/app/cita/nueva/use-booking.ts` |

No se usa `Lead`: lo usan los formularios de las webs.

## Cómo funciona (`src/v2/lib/meta.ts`)

1. `trackMeta()` crea el `event_id` y llama a `POST /probador/{marca}/meta-events`.
   El CRM comprueba el paso y lo manda por la API de conversiones.
2. Si el CRM lo acepta (o no responde), el evento sale en el navegador: va a la
   página con `postMessage` y `public/probador-bridge.js` (en la página) lo dispara
   con el píxel de la web, `fbq(..., { eventID })`.
3. Al arrancar, el probador saluda a la página y ella le pasa su URL (UTM, `fbclid`,
   `test_event_code`), las cookies `_fbp` y `_fbc` y el **consentimiento**. Solo se
   aceptan los orígenes de las webs de la marca.
4. `campaign()` guarda 30 días las UTM y el `fbclid` (`localStorage`), y van en
   `verify-code`, `/user/create`, `/user/update-profile` con tienda y la reserva.

## Consentimiento (RGPD)

Atelier y Outlet usan CookieYes. El puente lee `getCkyConsent()`, y con el evento
`cookieyes_consent_update` vuelve a mandar el contexto cuando la clienta responde.

| Publicidad en la web | Qué hace el probador |
|---|---|
| Aceptada (`granted`) | Manda los eventos (CRM + píxel) |
| Sin responder (`pending`) | Los guarda y los manda si la acepta |
| Rechazada (`denied`) | No manda nada |
| Web sin CookieYes (`unknown`) | Los manda; esa web decide con su propio píxel |
| Sin el script de la web, o probador abierto directamente | No manda nada a Meta (no se sabe si hay consentimiento) |

Las UTM se guardan siempre: solo van al CRM, junto al lead.

Píxeles: Atelier `561181242431431`, Outlet `906738730565930`, Sedka
`1494187322736138`. El CRM los tiene en `config/custom.php` (`meta_pixel_id`).

## En las webs

Una línea en la página del probador, junto al iframe (el despliegue publica el
archivo en los tres dominios):

```html
<script src="https://probador-sedka.crmnovias.com/probador-bridge.js" async></script>
```

## Probar

- En local, la página `http://localhost:5190` puede hacer de web: solo en
  desarrollo se acepta ese origen, y `trackMeta` deja en la consola (y le manda a
  la página) lo que envía al CRM.
- La página de prueba simula CookieYes: `responder(true)` o `responder(false)`.
- «Probar eventos» de Meta: abrir la web con `?test_event_code=TEST…` y **aceptar
  las cookies**. El probador lo pasa al CRM, y el evento del servidor sale en la
  prueba junto al del navegador.
