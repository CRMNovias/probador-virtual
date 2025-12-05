/**
 * User Service
 * 
 * Handles user profile operations:
 * - Get user profile
 * - Create/update user profile
 * - Upload user photo
 */

import { apiClient } from './apiClient.js';
import { envConfig } from '../config/envConfig.js';
import type { UserProfile, CreateProfileRequest, CreateProfileResponse, UpdateProfileRequest, UploadPhotoResponse } from '../types/index.js';

/**
 * Get current user profile
 * @returns Promise with user profile data
 */
export const getProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get(envConfig.endpoints.user.profile);
  return response as unknown as UserProfile;
};

/**
 * Create user profile (Phase 1 - Backend returns complete profile)
 * @param data - Profile creation data
 * @returns Promise with create profile response including user data
 */
export const createProfile = async (data: CreateProfileRequest): Promise<CreateProfileResponse> => {
  const response = await apiClient.post(envConfig.endpoints.user.create, data);
  return response as unknown as CreateProfileResponse;
};

/**
 * Update user profile
 * NOTE: Not available in Phase 1 - will be added in Phase 2
 * @param data - Profile update data
 * @returns Promise with updated user profile
 */
export const updateProfile = async (_data: UpdateProfileRequest): Promise<UserProfile> => {
  throw new Error('updateProfile is not available in Phase 1');
};

/**
 * Upload user photo (Phase 1)
 * @param file - Image file to upload
 * @returns Promise with upload response
 */
export const uploadPhoto = async (file: File): Promise<UploadPhotoResponse> => {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await apiClient.post(envConfig.endpoints.user.upload, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response as unknown as UploadPhotoResponse;
};
