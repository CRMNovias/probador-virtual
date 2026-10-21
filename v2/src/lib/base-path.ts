/**
 * Prefijo de la app cuando se sirve bajo una subruta del dominio (en
 * producción, `/v2` de probador.crmnovias.com). En local va vacío.
 *
 * Next lo añade solo en <Link> y en el router; en `fetch`, <img>, <video> y
 * next/image hay que ponerlo a mano con `withBase`.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Ruta de la API o de un archivo de /public con el prefijo de la app. */
export const withBase = (path: string) => `${BASE_PATH}${path}`;

/** Ruta del navegador sin el prefijo, para volver a ella con el router (que ya lo añade). */
export const withoutBase = (path: string) =>
  BASE_PATH && path.startsWith(BASE_PATH) ? path.slice(BASE_PATH.length) || '/' : path;
