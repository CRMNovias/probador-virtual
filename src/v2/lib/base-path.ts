/**
 * La V2 vive dentro de la app de la V1, en probador.crmnovias.com/v2: todas
 * sus pantallas y sus archivos (public/v2) van bajo este prefijo.
 *
 * Los enlaces y el router de la V2 (src/v2/next) ya lo añaden; en <img>,
 * <video> y next/image se pone a mano con `withBase`.
 */
export const BASE_PATH = '/v2';

/** Ruta de un archivo de public/v2 o de una pantalla de la V2 con su prefijo. */
export const withBase = (path: string) => `${BASE_PATH}${path === '/' ? '' : path}`;

/** Ruta del navegador sin el prefijo, para volver a ella con el router (que ya lo añade). */
export const withoutBase = (path: string) =>
  path === BASE_PATH || path.startsWith(`${BASE_PATH}/`) ? path.slice(BASE_PATH.length) || '/' : path;
