# Despliegue en probador.crmnovias.com/v2

La V2 vive en la carpeta `v2/` del repo de la V1 (`CRMNovias/probador-virtual`) y se
despliega con la misma acción (`.github/workflows/main.yml`): cada push a `main` entra
por SSH al servidor, hace `git pull` y compila la V1 como siempre; después, en un paso
aparte, compila la V2 y la recarga en PM2. Si la V1 falla, la V2 no se toca; si falla
la V2, la V1 ya está desplegada. nginx manda `/v2` a la V2 y todo lo demás sigue yendo
a la V1.

A diferencia de la V1 (una SPA), la V2 es una app de Node: tiene pasarela al CRM,
sesión en cookie httpOnly y genera los vídeos 360. Por eso necesita un proceso propio
(PM2, puerto 3100) y `ffmpeg`.

## Preparación única del servidor

1. **Node 20.9 o superior** (`node -v`) y **ffmpeg** (`apt-get install -y ffmpeg`;
   sin él el 360 sale sin logo).

2. **Código**: ya está, es el mismo clon de la V1 (`/home/probador/probador-virtual`);
   la V2 llega con el `git pull` en `v2/`.

3. **Variables**, en `/home/probador/probador-virtual/v2/.env.local` (no van al repo):

   ```bash
   NEXT_PUBLIC_BASE_PATH=/v2
   CRM_API_URL=https://crmnovias.com/api
   GEMINI_API_KEY=...        # para el vídeo 360
   ```

   `NEXT_PUBLIC_BASE_PATH` se lee al compilar: si cambia, hay que volver a compilar. Sin
   este archivo, la acción no despliega la V2 (para no publicarla mal configurada).

4. **Primer arranque**:

   ```bash
   cd /home/probador/probador-virtual && git pull origin main
   cd v2 && npm ci && npm run build
   pm2 start ecosystem.config.cjs && pm2 save
   ```

5. **nginx**, dentro del `server` de `probador.crmnovias.com` y antes del `location /`
   de la V1:

   ```nginx
   location ^~ /v2 {
       proxy_pass http://127.0.0.1:3100;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       # La prueba con IA tarda hasta 3 minutos y la foto puede pesar varios MB.
       proxy_read_timeout 300s;
       client_max_body_size 20m;
   }
   ```

   Después: `nginx -t && systemctl reload nginx`.

La clave SSH de la acción es la de la V1 (`DEPLOY_PRIVATE_KEY`, ya en el repo).

## Antes de abrirlo a clientas: límite del CRM

El CRM limita la API a 60 peticiones por minuto **por IP** (`throttle:60,1`). Con la V1
cada clienta llama desde su IP; con la V2 todas las llamadas salen de este servidor,
así que todas las clientas compartirían esas 60 y empezarían a ver «demasiadas
peticiones».

La V2 ya reenvía la IP de la clienta en `X-Forwarded-For`. Falta que el CRM confíe en
este servidor como proxy (Laravel `TrustProxies` con la IP del servidor del probador);
así el límite vuelve a ser por clienta, como con la V1.

## WhatsApp con el vídeo 360

Para que el WhatsApp lleve el vídeo en lugar de la foto hace falta el cambio del CRM
(`ARS-BRIDAL/crmnovias-com#297`, ya en `master`) desplegado y la plantilla de Meta
`probador_tryon_video` (ver `docs/crm-360.md`). Mientras no estén, se sigue mandando la
foto.

## Comprobar

- `https://probador.crmnovias.com/v2` abre la portada de la V2.
- `https://probador.crmnovias.com/` sigue siendo la V1.
- En el servidor: `pm2 ls` muestra `probador-v2` *online* y
  `curl -I http://127.0.0.1:3100/v2` responde la V2.
- `pm2 logs probador-v2` muestra las peticiones y la generación de los 360 (`[360]`).
