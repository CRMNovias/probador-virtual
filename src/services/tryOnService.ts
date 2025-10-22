/**
 * Try-On Service (Phase 1)
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
  const response = await apiClient.post(envConfig.endpoints.tryOn.generate, request);
  return response as unknown as UploadTryOnResponse;
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
