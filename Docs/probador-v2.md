# Probador V2 en la raíz (y la V1 en /v1)

La V2 (diseño tipo Zara, pruebas en 360°, fondos, pareja) vive dentro de esta app, en
`src/v2`, y es lo que sirve `probador.crmnovias.com`. La V1 sigue en
`probador.crmnovias.com/v1`. Es la misma app, el mismo build y el mismo despliegue: no hay
proceso ni configuración de servidor aparte.

La misma V2 sirve también `probador-sedka.crmnovias.com`, con la disposición y los textos
de Sedka (ver «Sedka»). Outlet Nupcial sigue con su probador aparte.

## Cómo encaja

- **Rutas** (`src/router.tsx`):
  - La V2 (`src/v2/routes.tsx`) va en `/*`, con su código y sus estilos aparte.
  - Pantallas: `/`, `/entrar`, `/datos`, `/avatar`, `/probador`, `/coleccion`,
    `/mis-pruebas`, `/favoritos`, `/perfil`, `/cita/nueva`, `/citas` y `/c/:id`
    (compartir).
  - El prefijo de la V2 está en `src/v2/lib/base-path.ts` (`BASE_PATH`, ahora vacío): sus
    enlaces y su router (`src/v2/next`) lo añaden solos.
- **La V1** va en `/v1` (`V1_BASE` en `src/constants/routes.ts`): `/v1`, `/v1/auth`,
  `/v1/colecciones/novia`, `/v1/try-on`… Todas sus rutas salen de esas constantes.
- **Direcciones de antes** (`src/components/routing/LegacyRedirect.tsx`): llevan a su
  pantalla de la V2, con sus datos:
  - La V1 sin `/v1`:
    - `/auth` → `/entrar` (o `/datos` con `?step=registration`)
    - `/try-on` y `/pareja` con `?dressId=&category=` → `/probador?d=&c=`
    - `/avatar-creation` → `/avatar`
    - `/gallery` → `/mis-pruebas`
    - `/appointments` → `/citas`
    - `/citas/nueva` → `/cita/nueva`
    - `/colecciones/novia` y `/colecciones/novio` → `/coleccion`
    - `/share/:id?dressId=` → `/c/:id?d=`
  - La portada con `?dressId=` lleva a esa prenda en el probador.
  - La V2 con `/v2` (`/v2/probador`, `/v2/c/:id`…) lleva a lo mismo sin el prefijo.
- **Sesión**: la de la V1 (`AuthContext`, token en localStorage). Quien entra en una
  entra en las dos.
- **Datos**: `src/v2/lib/api.ts` usa los servicios de la V1 (`src/services`) y su
  `apiClient`, y añade las llamadas del vídeo 360 y de las fotos de detalle.
- **Pantallas**: sus importaciones de Next (`next/link`, `next/navigation`,
  `next/image`) van a equivalentes con React Router en `src/v2/next` (alias en
  `vite.config.ts` y `tsconfig.json`).
- **Estilos**: Tailwind de la V1 con los colores de la V2 (`ink`, `studio`, `line`,
  `muted`… que la V1 no usa) y `label-caps` en `tailwind.config.js`. El resto va solo
  dentro de `.v2-root` (`src/v2/v2.css`), así que la V1 no cambia.
- **Archivos**: `public/probador-v2` (vídeo de la portada, fondos, logo). No van en
  `public/v2`: una carpeta `v2` en el build hace que nginx responda 403 en `/v2`.

## En la web de Atelier

`atelierdebodas.com/probador-virtual/` mete `probador.crmnovias.com` en un iframe:
- solo con `allowfullscreen` (la pantalla completa del 360 funciona);
- sin `allow` de cámara, de compartir ni de portapapeles.

Dentro del iframe, «Compartir» no puede abrir el menú del sistema. Si el navegador lo
bloquea, copia el enlace y, si tampoco puede, abre WhatsApp con él
(`probador-screen.tsx`). La sesión del iframe es aparte de la de
`probador.crmnovias.com` abierto directamente: el navegador guarda por separado lo de cada
web.

## Sedka

- **Marca**: `src/v2/lib/brand.ts` la saca del dominio (con «sedka» en él es Sedka; en local,
  `sedka.localhost`). Lleva los datos de cada marca: logo, web, cómo llama a sus tiendas,
  filtros de novio y adónde se llega al entrar (Sedka, a la colección).
- **Aspecto**: Sedka no es Atelier con otros colores. Sus pantallas están en `src/v2/sedka`
  y siguen la disposición de su V1: cabecera con el logo grande y el menú en texto, portada
  sobre la foto de la boutique, colección tipo Pinterest, el probador con la prueba grande y
  un solo panel, tarjetas centradas sobre crema para entrar, la cita en su caja dorada… Las
  `page.tsx` eligen las de Sedka o las de Atelier.
- **Lo que hacen**: es lo mismo en las dos marcas. Está en hooks compartidos
  (`use-probador`, `use-collection`, `use-booking`, `use-profile-screen`); cada marca solo
  pone la vista.
- **Colores y letra**: variables de `v2.css` por `data-brand` (dorado y Montserrat en Sedka).
- **Fondos**: los suyos (`src/v2/lib/backgrounds.ts`, miniaturas en
  `public/probador-v2/backgrounds/sedka`), con su estudio azul marino por defecto.
- **Rutas** (`src/router.tsx`, `SedkaRouter`): solo la V2. Su V1 es otra web (repo
  `ARS-BRIDAL/probador-virtual-sedka`, en `/v1`); las direcciones de antes de su V1 sin
  `/v1` llevan a la V2 como las de Atelier.
- **Despliegue**: la web de Sedka está en el mismo servidor, en
  `/home/probador/probador-sedka.crmnovias.com/public_html/dist`. Su repo construye su V1
  en `dist/v1`; `scripts/sedka-v2.sh` copia esta V2 en la raíz sin tocar `dist/v1` y deja
  el `index.html` con el título, el icono y la vista previa de Sedka
  (`scripts/sedka-index.mjs`). Lo llaman los dos despliegues: el de este repo, en cuanto
  existe `dist/v1`, y el de Sedka, si la V2 del servidor ya trae Sedka.
- **En local**: `sedka.localhost:5174` con `npm run dev`.

## Lo que hace el CRM

El vídeo 360 y las fotos de detalle los hace el CRM (`ARS-BRIDAL/crmnovias-com`):
- Rutas: `GET|POST /probador/{marca}/tryons/{id}/turntable`, con el estado del 360 y de las
  fotos de detalle.
- Las pruebas de la V2 van con `deliverVideo: true`: el CRM hace las fotos y el 360 después
  de responder.
- Si existe la plantilla de Meta `probador_tryon_video`, el WhatsApp lleva el vídeo en
  lugar de la foto.
- El servidor del CRM necesita `ffmpeg` para el logo del vídeo.

## Diferencias con la V2 como app aparte

- La sesión va en localStorage, como la V1 (antes, cookie httpOnly).
- La página de compartir se pinta en el navegador: WhatsApp e Instagram no enseñan la
  imagen de la prueba en la vista previa del enlace (la V1 tampoco).
- Cada clienta llama al CRM desde su navegador, así que su límite de peticiones por IP
  vuelve a ser por clienta.

## Desplegar

Lo mismo que la V1 (`.github/workflows/main.yml`). No hace falta tocar nginx: sirve
`index.html` para cualquier ruta, también `/v1`. Si en algún momento se añadió un
`location /v2` hacia otro puerto, hay que quitarlo: esta misma app redirige `/v2`.
