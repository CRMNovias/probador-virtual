/**
 * Favorite Service
 *
 * Operaciones de favoritos contra la API del CRM:
 *  - GET    /favorites             → listado de favoritos del cliente
 *  - POST   /favorites/toggle      → alterna favorito por `dressId`
 *  - DELETE /favorites/{productId} → elimina (idempotente)
 *
 * La respuesta del backend siempre viene envuelta en
 * `{ success, data: {...}, message }`. El interceptor global de Axios
 * desempaqueta `response.data` (la respuesta HTTP), pero NO el envelope
 * Laravel, así que aquí seguimos accediendo a `data`.
 */

import { apiClient } from './apiClient.js';
import { envConfig } from '../config/envConfig.js';
import type {
  Favorite,
  FavoritesListResponse,
  ToggleFavoriteResponse,
} from '../types/index.js';

/**
 * Devuelve la lista completa de favoritos del cliente autenticado.
 */
export const getFavorites = async (): Promise<Favorite[]> => {
  const response = (await apiClient.get(
    envConfig.endpoints.favorites.list
  )) as unknown as FavoritesListResponse | undefined;

  const favorites = response?.data.favorites;
  return Array.isArray(favorites) ? favorites : [];
};

/**
 * Devuelve únicamente los `dressId` favoritos del cliente.
 *
 * Útil para inicializar el estado de los botones de corazón en pantallas
 * que ya conocen el `dressId` activo (try-on, galería, etc.) sin tener que
 * cargar metadatos del producto.
 */
export const getFavoriteIds = async (): Promise<Set<string>> => {
  const favorites = await getFavorites();
  return new Set(favorites.map((f) => f.dressId));
};

/**
 * Alterna el estado favorito del vestido indicado.
 *
 * @returns `true` si el vestido quedó marcado como favorito, `false` si quedó
 *          desmarcado.
 */
export const toggleFavorite = async (dressId: string): Promise<boolean> => {
  const response = (await apiClient.post(envConfig.endpoints.favorites.toggle, {
    dressId,
  })) as unknown as ToggleFavoriteResponse | undefined;

  return response?.data.favorited === true;
};

/**
 * Elimina un favorito de forma idempotente (no falla si no existía).
 */
export const removeFavorite = async (dressId: string): Promise<void> => {
  await apiClient.delete(`${envConfig.endpoints.favorites.delete}/${dressId}`);
};
