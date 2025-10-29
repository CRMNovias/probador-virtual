/**
 * Try-On Service (Phase 2 - Enhanced)
 *
 * Handles virtual try-on operations:
 * - Generate try-on image
 * - Get user's try-on gallery
 * - Delete try-on image
 * - Share try-on image (NEW)
 * - Get shared try-on by ID (NEW)
 */

import { apiClient } from './apiClient.js';
import { envConfig } from '../config/envConfig.js';
import type { TryOnCategory, UploadTryOnResponse, GenerateTryOnRequest, SharedTryOn } from '../types/index.js';

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

/**
 * Generate share link for try-on (Phase 2)
 * Creates or retrieves a shareable link for a try-on image
 * @param tryOnId - Try-on ID to share
 * @returns Promise with share ID
 */
export const shareTryOn = async (tryOnId: string): Promise<{ shareId: string }> => {
  const response = await apiClient.post(`${envConfig.endpoints.tryOn.share}/${tryOnId}`, {});
  return response as unknown as { shareId: string };
};

/**
 * Get shared try-on by share ID (Phase 2)
 * Public endpoint - no authentication required
 * @param shareId - Share ID from URL
 * @returns Promise with shared try-on data
 */
export const getSharedTryOn = async (shareId: string): Promise<SharedTryOn> => {
  const response = await apiClient.get(`${envConfig.endpoints.tryOn.getShared}/${shareId}`);
  return response as unknown as SharedTryOn;
};
