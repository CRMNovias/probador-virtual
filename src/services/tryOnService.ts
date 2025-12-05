/**
 * Try-On Service
 *
 * Handles virtual try-on operations:
 * - Generate try-on image
 * - Get user's try-on gallery
 * - Delete try-on image
 */

import { apiClient } from './apiClient.js';
import { envConfig } from '../config/envConfig.js';
import type { TryOnCategory, UploadTryOnResponse, GenerateTryOnRequest } from '../types/index.js';

/**
 * Generate virtual try-on image (Phase 1)
 * @param request - Try-on generation request
 * @returns Promise with generation response
 */
export const generateTryOn = async (request: GenerateTryOnRequest): Promise<UploadTryOnResponse> => {
  console.log('[tryOnService] Sending generateTryOn request:', {
    endpoint: envConfig.endpoints.tryOn.generate,
    dressId: request.dressId,
    promptLength: request.prompt.length,
    fullPrompt: request.prompt
  });

  const response = await apiClient.post(envConfig.endpoints.tryOn.generate, request) as UploadTryOnResponse;

  console.log('[tryOnService] Received generateTryOn response:', response);

  // Validate response structure
  if (!response.success || !response.data) {
    console.error('[tryOnService] Invalid response structure:', response);
    throw new Error('Invalid response from server');
  }

  console.log('[tryOnService] Try-on generated successfully:', {
    id: response.data.id,
    imageUrl: response.data.imageUrl,
    thumbnailUrl: response.data.thumbnailUrl
  });

  return response;
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

