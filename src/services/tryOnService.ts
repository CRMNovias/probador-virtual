/**
 * Try-On Service
 *
 * Handles virtual try-on operations:
 * - Generate try-on image
 * - Get user's try-on gallery
 * - Delete try-on image
 */

import axios from 'axios';
import { apiClient } from './apiClient.js';
import { envConfig } from '../config/envConfig.js';
import type { TryOnCategory, UploadTryOnResponse, GenerateTryOnRequest } from '../types/index.js';

/**
 * Gemini puede tardar; el timeout general de la API se queda corto. La foto de
 * pareja de la V2 se hace por pasos y con un fondo de exterior pasa de 2 minutos.
 */
const GENERATE_TIMEOUT_MS = 300_000;

interface StoredTryOn {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
}

interface TryOnListBody {
  data?: {
    tryOnsByDress?: Array<{
      dressId: string;
      tryOns?: StoredTryOn[];
    }>;
  };
}

/**
 * Si el navegador pierde la respuesta pero el servidor ya guardó la prueba,
 * la recuperamos del listado en vez de dejar el probador colgado.
 */
const findTryOnCreatedAfter = async (
  dressId: string,
  sinceMs: number,
): Promise<UploadTryOnResponse | null> => {
  const body = (await apiClient.get(envConfig.endpoints.tryOn.getUserTryOns)) as TryOnListBody;
  const group = body.data?.tryOnsByDress?.find((item) => item.dressId === dressId);
  const match = group?.tryOns?.find((tryOn) => {
    const created = Date.parse(tryOn.createdAt);
    return Number.isFinite(created) && created >= sinceMs && Boolean(tryOn.imageUrl);
  });
  if (!match) return null;

  return {
    success: true,
    message: 'Prueba virtual generada correctamente',
    data: {
      id: match.id,
      userId: '',
      dressId,
      imageUrl: match.imageUrl,
      ...(match.thumbnailUrl ? { thumbnailUrl: match.thumbnailUrl } : {}),
      createdAt: match.createdAt,
    },
  };
};

/** Una sola generación en curso. Un segundo clic o un reintento espera a esa. */
let generateInFlight: Promise<UploadTryOnResponse> | null = null;

/**
 * Generate virtual try-on image (Phase 1)
 * @param request - Try-on generation request
 * @returns Promise with generation response
 */
export const generateTryOn = (request: GenerateTryOnRequest): Promise<UploadTryOnResponse> => {
  if (generateInFlight) return generateInFlight;

  generateInFlight = generateTryOnOnce(request).finally(() => {
    generateInFlight = null;
  });

  return generateInFlight;
};

const generateTryOnOnce = async (request: GenerateTryOnRequest): Promise<UploadTryOnResponse> => {
  const startedAt = Date.now();

  try {
    const response = await apiClient.post(
      envConfig.endpoints.tryOn.generate,
      request,
      { timeout: GENERATE_TIMEOUT_MS },
    ) as UploadTryOnResponse;

    if (!response.success || !response.data?.imageUrl) {
      throw new Error('Invalid response from server');
    }

    return response;
  } catch (error) {
    const dropped = axios.isAxiosError(error) && !error.response;
    if (dropped) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const recovered = await findTryOnCreatedAfter(request.dressId, startedAt - 15_000);
        if (recovered) return recovered;
      } catch {
        // Si el listado también falla, devolvemos el error de la generación.
      }
    }
    throw error;
  }
};

/**
 * Get all try-on images for current user (Phase 1)
 * @returns Promise with try-on categories
 */
export const getUserTryOns = async (): Promise<TryOnCategory[]> => {
  const response = await apiClient.get(envConfig.endpoints.tryOn.getUserTryOns);
  return response as unknown as TryOnCategory[];
};

/**
 * Delete try-on image (Phase 1)
 * @param id - Try-on ID to delete
 * @returns Promise that resolves when deleted
 */
export const deleteTryOn = async (id: string): Promise<void> => {
  await apiClient.delete(`${envConfig.endpoints.tryOn.delete}/${id}`);
};


