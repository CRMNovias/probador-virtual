/**
 * Application routes
 * 
 * Centralized route path constants for navigation
 */

/**
 * Application route paths
 */
export const routes = {
  HOME: '/',
  AUTH: '/auth',
  AVATAR_CREATION: '/avatar-creation',
  TRY_ON: '/try-on',
  GALLERY: '/gallery',
  APPOINTMENTS: '/appointments',
  SHARE: '/share/:id',
} as const;

/**
 * Helper to build share route with ID
 * @param id - The share ID
 * @returns The complete share route path
 */
export const buildShareRoute = (id: string): string => {
  return `/share/${id}`;
};
