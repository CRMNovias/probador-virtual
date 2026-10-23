/**
 * La V2 vive dentro de la app de la V1 y va en la raíz de probador.crmnovias.com
 * (la V1, en /v1). Estuvo en /v2: si vuelve a ir bajo un prefijo, basta con
 * ponerlo aquí (los enlaces y el router de la V2, en src/v2/next, lo añaden).
 * Los archivos van con `asset`.
 */
export const BASE_PATH: string = '';

/** Ruta de una pantalla de la V2 con su prefijo. */
export const withBase = (path: string) => (path === '/' ? BASE_PATH || '/' : `${BASE_PATH}${path}`);

/**
 * Archivos de la V2 (vídeo de la portada, fondos, logo): en public/probador-v2 y
 * no en public/v2, porque una carpeta /v2 en el build hace que nginx responda
 * 403 en /v2 en lugar de dar la portada.
 */
export const asset = (path: string) => `/probador-v2${path}`;

/** Ruta del navegador sin el prefijo, para volver a ella con el router (que ya lo añade). */
export const withoutBase = (path: string) =>
  BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) ? path.slice(BASE_PATH.length) || '/' : path;
