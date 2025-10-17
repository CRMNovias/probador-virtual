/**
 * Avatar Service
 * 
 * Handles avatar-related operations:
 * - Upload photo for avatar generation
 * - Regenerate avatar
 * - Get avatar information
 */

import { apiClient } from './apiClient.js';
import { envConfig } from '../config/envConfig.js';
import type { Avatar, UploadAvatarResponse, RegenerateAvatarRequest } from '../types/index.js';

/**
 * Upload photo for avatar generation
 * @param file - Image file (passport-style photo)
 * @returns Promise with upload response
 */
export const uploadAvatar = async (file: File): Promise<UploadAvatarResponse> => {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await apiClient.post(envConfig.endpoints.avatar.upload, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response as UploadAvatarResponse;
};

/**
 * Regenerate avatar from existing photo or new photo
 * @param request - Regeneration request data
 * @returns Promise with regeneration response
 */
export const regenerateAvatar = async (
  request?: RegenerateAvatarRequest
): Promise<UploadAvatarResponse> => {
  const response = await apiClient.post(envConfig.endpoints.avatar.regenerate, request || {});
  return response as UploadAvatarResponse;
};

/**
 * Get current user's avatar
 * @returns Promise with avatar data
 */
export const getAvatar = async (): Promise<Avatar> => {
  const response = await apiClient.get(envConfig.endpoints.avatar.get);
  return response as Avatar;
};
