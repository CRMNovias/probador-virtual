# Probador V2 en /v2

La V2 (diseño tipo Zara, avatar y pruebas en 360°, fondos, pareja) vive dentro de esta
app, en `src/v2`, con todas sus pantallas bajo `probador.crmnovias.com/v2`. Es la misma
app, el mismo build y el mismo despliegue que la V1: no hay proceso ni configuración de
servidor aparte.

## Cómo encaja

- **Rutas**: `src/router.tsx` carga `src/v2/routes.tsx` en `/v2/*` (código y estilos
  aparte: solo se descargan al entrar en `/v2`). Pantallas: `/v2`, `/v2/entrar`,
  `/v2/datos`, `/v2/avatar`, `/v2/probador`, `/v2/coleccion`, `/v2/mis-pruebas`,
  `/v2/favoritos`, `/v2/perfil`, `/v2/cita/nueva`, `/v2/citas` y `/v2/c/:id` (compartir).
- **Sesión**: la de la V1 (`AuthContext`, token en localStorage). Quien entra en una
  entra en las dos.
- **Datos**: `src/v2/lib/api.ts` usa los servicios de la V1 (`src/services`) y su
  `apiClient`; solo añade las llamadas del vídeo 360.
- **Pantallas**: las de la V2 sin cambios. Sus importaciones de Next (`next/link`,
  `next/navigation`, `next/image`) van a equivalentes con React Router en `src/v2/next`
  (alias en `vite.config.ts` y `tsconfig.json`).
- **Estilos**: Tailwind de la V1 con los colores de la V2 (`ink`, `studio`, `line`,
  `muted`… que la V1 no usa) y `label-caps` en `tailwind.config.js`; el resto, solo dentro
  de `.v2-root` (`src/v2/v2.css`). La V1 no cambia.
- **Archivos**: `public/probador-v2` (vídeo de la portada, fondos, logo). No van en
  `public/v2`: una carpeta `v2` en el build hace que nginx responda 403 en `/v2`.

## Lo que hace el CRM

El vídeo 360 lo genera el CRM (rama `feat/probador-v2-360` de `ARS-BRIDAL/crmnovias-com`):
`GET|POST /probador/{marca}/avatar/turntable` y `/probador/{marca}/tryons/{id}/turntable`.
Las pruebas de la V2 van con `deliverVideo: true`: el CRM hace su 360 después de responder
y, si existe la plantilla de Meta `probador_tryon_video`, el WhatsApp lleva el vídeo en
lugar de la foto. El servidor del CRM necesita `ffmpeg` para el logo del vídeo.

## Diferencias con la V2 como app aparte

- La sesión va en localStorage, como la V1 (antes, cookie httpOnly).
- La página de compartir se pinta en el navegador: WhatsApp e Instagram no enseñan la
  imagen de la prueba en la vista previa del enlace (la V1 tampoco).
- Cada clienta llama al CRM desde su navegador, así que su límite de peticiones por IP
  vuelve a ser por clienta.

## Desplegar

Lo mismo que la V1 (`.github/workflows/main.yml`). La primera vez, después del despliegue,
reiniciar la V1 en PM2 para que cargue la dependencia nueva (`lucide-react`, los iconos
de la V2). Si en nginx se llegó a añadir un `location /v2` hacia otro puerto, hay que
quitarlo: `/v2` lo sirve esta misma app.
