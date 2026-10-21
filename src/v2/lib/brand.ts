import { withBase } from './base-path';

/**
 * Marca del probador. Hoy solo Atelier; Outlet y Sedka usan el mismo CRM con
 * su prefijo (`/auth/outlet`, `/probador/sedka`…), así que añadir una marca es
 * añadir una entrada aquí.
 */
export const brand = {
  id: 'atelier',
  name: 'Atelier de Bodas',
  logo: withBase('/logo-atelier.webp'),
  website: 'https://atelierdebodas.com',
  privacyUrl: 'https://atelierdebodas.com/politica-de-privacidad/',
  bookingUrl: 'https://atelierdebodas.com/pide-cita/',
} as const;
