# Probador Virtual V2 · Atelier de Bodas

App nueva (Next.js 16) para el probador virtual: avatar y prueba de vestidos y trajes,
con vista 360° que se gira con el dedo.

**Reutiliza el backend actual (el CRM)** y no toca la V1: mismas rutas de acceso por
WhatsApp, perfil, catálogo, avatar, pruebas con Gemini (con fondo elegido y pareja),
favoritos y citas. Lo único que el CRM aún no tiene es el vídeo 360: mientras tanto lo
hace la propia V2 (ver [`docs/crm-360.md`](docs/crm-360.md)).

## Arrancar en local

```bash
npm install
cp .env.example .env.local     # y pon GEMINI_API_KEY para el 360
```

**Con el CRM local de Herd** (catálogo completo, filtros, registro y citas reales, como la V1):

```bash
npm run dev:crm                # app en http://localhost:3000 contra https://crmnovias-com.test/api
```

`dev:crm` confía en el certificado local de Herd. Ten en cuenta lo que hace el CRM en
local (entorno `localhost`):

- El código de WhatsApp se envía de verdad, pero al teléfono de pruebas configurado en
  el CRM (`WASAPI_TESTING_PHONE`), no al número que escribes. Para recibirlo tú, pon tu
  número en esa variable del `.env` del CRM.
- Las citas se guardan en la base de datos local; los correos de confirmación van a la
  dirección interna del CRM, no a la clienta.
- Las fotos, avatares y pruebas se suben al bucket S3 configurado en el CRM.
- Con «Quiero recibir mis pruebas por WhatsApp» marcado (viene así por defecto), el CRM
  manda cada prueba por WhatsApp; en local, también al teléfono de pruebas.

**Con el CRM simulado** (sin Herd; catálogo de 10 modelos):

```bash
npm run mock                   # CRM simulado en :4010
CRM_API_URL=http://localhost:4010/api npm run dev
```

Ahí vale cualquier código de 6 cifras (`000000` simula un código incorrecto). Con
`GEMINI_API_KEY`, el simulador usa IA real como el CRM.

Costes de IA: avatar y prueba con Gemini 3 Pro Image (~0,13 $ cada una); giro 360 con
Gemini Omni Flash (~1 $ por vídeo de 10 s). El 360 necesita `ffmpeg` para poner el logo.

## Pantallas

| Ruta | Qué hace |
| --- | --- |
| `/` | Portada con un giro 360° real de ejemplo |
| `/entrar`, `/datos` | Acceso por WhatsApp y datos de la clienta |
| `/avatar` | Foto → avatar con IA → avatar girando en 360° (descargable) |
| `/probador` | Pantalla principal: avatar en el escenario y prendas debajo (a la derecha en ordenador). Opciones de la prueba: fondo (estudio, playa, campo, catedral, jardín, finca o uno descrito) y pareja. La prueba gira en 360° y se descarga con el logo |
| `/coleccion` | Catálogo completo con búsqueda y los filtros de la V1: marca y corte (novia), estilo y color (novio) |
| `/mis-pruebas` | Todo lo probado, con marca de 360° |
| `/favoritos` | Modelos guardados |
| `/perfil` | Datos del registro y de la boda, avatar, próxima cita y cerrar sesión |
| `/cita/nueva` | Reserva en una sola pantalla (atelier, servicio, día y hora); `?edit=<id>` para cambiarla |
| `/citas` | Próximas citas: cambiar, cancelar, al calendario, cómo llegar |
| `/c/[id]` | Prueba compartida (pública) |

## Despliegue

En producción se sirve en `https://probador.crmnovias.com/v2`, en el mismo servidor que
la V1 y con el mismo sistema (acción de GitHub por SSH + PM2). Pasos y requisitos en
[`docs/deploy.md`](docs/deploy.md).

## Cómo está hecho

- `src/app/api/crm/[...path]`: pasarela al CRM. Añade el token desde una cookie
  httpOnly (en la V1 el token estaba en localStorage) y solo deja pasar rutas del probador.
- `src/app/api/auth/*`: acceso por WhatsApp contra `/auth/atelier/*` del CRM.
- `src/lib/api.ts`: cliente del CRM para las pantallas (mismas rutas y respuestas que la V1).
- `src/components/turntable.tsx`: visor 360. Reproduce el giro y, al arrastrar, muestra
  fotogramas extraídos del vídeo en el navegador.
- `src/app/c/[id]`: página para compartir, generada en el servidor para que WhatsApp
  muestre la imagen de la prueba en la vista previa.

Reutilizado de la V1: la revisión de calidad de la foto (`src/lib/photo-quality.ts`),
los textos que se envían a la IA (`src/lib/prompts.ts`), el logo y las imágenes de ejemplo.

## Comprobaciones

```bash
npm run typecheck
npm run lint
```
