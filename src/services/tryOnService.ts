/**
 * Try-On Service
 * 
 * Handles virtual try-on operations:
 * - Generate try-on image
 * - Get user's try-on gallery
 * - Delete try-on image
 * - Get try-on by ID
 */

import { apiClient } from './apiClient.js';
import { envConfig } from '../config/envConfig.js';
import type { TryOn, TryOnCategory, UploadTryOnResponse, GenerateTryOnRequest } from '../types/index.js';

/**
 * Generate virtual try-on image
 * @param request - Try-on generation request
 * @returns Promise with generation response
 */
export const generateTryOn = async (request: GenerateTryOnRequest): Promise<UploadTryOnResponse> => {
  const response = await apiClient.post(envConfig.endpoints.tryOn.generate, request);
  return response as UploadTryOnResponse;
};

/**
 * Get all try-on images for current user
 * @returns Promise with try-on categories
 */
export const getUserTryOns = async (): Promise<TryOnCategory[]> => {
  const response = await apiClient.get(envConfig.endpoints.tryOn.getUserTryOns);
  return response as TryOnCategory[];
};

/**
 * Get try-on by ID
 * @param id - Try-on ID
 * @returns Promise with try-on data
 */
export const getTryOnById = async (id: string): Promise<TryOn> => {
  const response = await apiClient.get(`${envConfig.endpoints.tryOn.getById}/${id}`);
  return response as TryOn;
};

/**
 * Delete try-on image
 * @param id - Try-on ID to delete
 * @returns Promise that resolves when deleted
 */
export const deleteTryOn = async (id: string): Promise<void> => {
  await apiClient.delete(`${envConfig.endpoints.tryOn.delete}/${id}`);
};
