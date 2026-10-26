import type { WeddingMoment, WeddingStyle } from './types';
import { brand } from './brand';

/** Datos de contacto que se piden al registrarse y se cambian en el perfil. */
export type ContactValues = { name: string; email: string; postcode: string; shopId: string };
export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

export const validateContact = (v: ContactValues): ContactErrors => {
  const errors: ContactErrors = {};
  if (v.name.trim().length < 2) errors.name = 'Escribe tu nombre.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v.email.trim())) errors.email = 'Revisa el email: falta algo, por ejemplo «.com».';
  if (!/^\d{4,5}$/.test(v.postcode.trim())) errors.postcode = 'Escribe tu código postal de 5 cifras.';
  if (!v.shopId) errors.shopId = `Elige ${brand.shop.toWhich} irías.`;
  return errors;
};

/** Los mismos estilos que el CRM (`ApiCustomerController::WEDDING_STYLES`) y la V1. */
export const WEDDING_STYLES: { value: WeddingStyle; label: string }[] = [
  { value: 'classic', label: 'Clásico' },
  { value: 'boho_chic', label: 'Boho chic' },
  { value: 'rustic', label: 'Rústico' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'romantic', label: 'Romántico' },
  { value: 'minimalist', label: 'Minimalista' },
  { value: 'glamour', label: 'Glamour' },
  { value: 'other', label: 'Otro' },
];

export const WEDDING_MOMENTS: { value: WeddingMoment; label: string }[] = [
  { value: 'day', label: 'De día' },
  { value: 'night', label: 'De noche' },
];
