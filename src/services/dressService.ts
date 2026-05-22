/**
 * Dress Service
 *
 * Handles catálogo del Probador (vestidos novia + trajes novio) y stubs
 * heredados (Phase 1) que aún no tienen endpoint dedicado.
 */

import { apiClient } from './apiClient.js';
import type {
  Dress,
  CollectionBrand,
  CollectionItem,
  CollectionListResponse,
} from '../types/index.js';

/**
 * Get all dresses from catalog
 * @returns Promise with array of dresses
 * @throws Error - Not available in Phase 1
 */
export const getAllDresses = async (): Promise<Dress[]> => {
  throw new Error('getAllDresses is not available in Phase 1. Will be implemented in Phase 2.');
};

/**
 * Get dress by ID
 * @param id - Dress ID
 * @returns Promise with dress data
 * @throws Error - Not available in Phase 1
 */
export const getDressById = async (_id: string): Promise<Dress> => {
  throw new Error('getDressById is not available in Phase 1. Will be implemented in Phase 2.');
};

// ============================================================
// Catálogo "Colecciones"
// ============================================================

/** Tipa la respuesta envuelta `{ success, data }` que devuelve Laravel. */
const unwrap = <T,>(res: unknown, fallback: T): T => {
  if (res && typeof res === 'object' && 'data' in (res as object)) {
    return ((res as { data: T }).data ?? fallback) as T;
  }
  return fallback;
};

/** GET /probador/collections/brands — marcas para el filtro de Novia. */
export const listBrideBrands = async (): Promise<CollectionBrand[]> => {
  const res = await apiClient.get('/probador/collections/brands');
  return unwrap<CollectionBrand[]>(res, []);
};

/** GET /probador/collections/bride-cuts — cortes para el filtro de Novia. */
export const listBrideCuts = async (): Promise<CollectionBrand[]> => {
  const res = await apiClient.get('/probador/collections/bride-cuts');
  return unwrap<CollectionBrand[]>(res, []);
};

/** GET /probador/collections/groom-colors — colores para el filtro de Novio. */
export const listGroomColors = async (): Promise<CollectionBrand[]> => {
  const res = await apiClient.get('/probador/collections/groom-colors');
  return unwrap<CollectionBrand[]>(res, []);
};

/** GET /probador/collections/groom-suit-types — tipos de traje (Novio, Invitado, Padrino...). */
export const listGroomSuitTypes = async (): Promise<CollectionBrand[]> => {
  const res = await apiClient.get('/probador/collections/groom-suit-types');
  return unwrap<CollectionBrand[]>(res, []);
};

/**
 * GET /probador/collections/brides — vestidos paginados.
 * `brand` filtra por marca; sin él, devuelve todas.
 */
export const listBrides = async (params: {
  page?: number;
  brand?: string;
  cut?: string;
} = {}): Promise<CollectionListResponse> => {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.brand) search.set('brand', params.brand);
  if (params.cut) search.set('cut', params.cut);
  const qs = search.toString();
  const res = (await apiClient.get(
    `/probador/collections/brides${qs ? `?${qs}` : ''}`,
  )) as unknown as { data?: CollectionItem[]; meta?: CollectionListResponse['meta'] };
  return {
    data: res?.data ?? [],
    meta: res?.meta ?? { page: 1, pageSize: 30, total: 0, hasMore: false },
  };
};

/** GET /probador/collections/grooms — trajes paginados (filtro por color opcional). */
export const listGrooms = async (
  params: { page?: number; color?: string; suitType?: string } = {},
): Promise<CollectionListResponse> => {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.color) search.set('color', params.color);
  if (params.suitType) search.set('suitType', params.suitType);
  const qs = search.toString();
  const res = (await apiClient.get(
    `/probador/collections/grooms${qs ? `?${qs}` : ''}`,
  )) as unknown as { data?: CollectionItem[]; meta?: CollectionListResponse['meta'] };
  return {
    data: res?.data ?? [],
    meta: res?.meta ?? { page: 1, pageSize: 30, total: 0, hasMore: false },
  };
};
