/**
 * Application routes
 * 
 * Centralized route path constants for navigation
 */

/**
 * La V1 vive en probador.crmnovias.com/v1: en la raíz está la V2 (src/v2). Las
 * direcciones de la V1 sin /v1 que ya se han enviado llevan a su pantalla de la
 * V2 (components/routing/LegacyRedirect).
 */
export const V1_BASE = '/v1';

/**
 * Application route paths
 */
export const routes = {
  HOME: V1_BASE,
  AUTH: `${V1_BASE}/auth`,
  AVATAR_CREATION: `${V1_BASE}/avatar-creation`,
  PROFILE: `${V1_BASE}/perfil`,
  TRY_ON: `${V1_BASE}/try-on`,
  COUPLE: `${V1_BASE}/pareja`,
  GALLERY: `${V1_BASE}/gallery`,
  APPOINTMENTS: `${V1_BASE}/appointments`,
  APPOINTMENTS_NEW: `${V1_BASE}/citas/nueva`,
  COLLECTIONS_BRIDE: `${V1_BASE}/colecciones/novia`,
  COLLECTIONS_GROOM: `${V1_BASE}/colecciones/novio`,
  FAVORITES: `${V1_BASE}/favoritos`,
  SHARE: `${V1_BASE}/share/:id`,
} as const;

/**
 * Helper to build share route with ID
 * @param id - The share ID
 * @returns The complete share route path
 */
export const buildShareRoute = (id: string): string => {
  return `${V1_BASE}/share/${id}`;
};
