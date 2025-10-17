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
import type { UserProfile, CreateProfileRequest, UpdateProfileRequest, UploadPhotoResponse } from '../types/index.js';

/**
 * Get current user profile
 * @returns Promise with user profile data
 */
export const getProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get(envConfig.endpoints.user.profile);
  return response as UserProfile;
};

/**
 * Create user profile
 * @param data - Profile creation data
 * @returns Promise with created user profile
 */
export const createProfile = async (data: CreateProfileRequest): Promise<UserProfile> => {
  const response = await apiClient.post(envConfig.endpoints.user.profile, data);
  return response as UserProfile;
};

/**
 * Update user profile
 * @param data - Profile update data
 * @returns Promise with updated user profile
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<UserProfile> => {
  const response = await apiClient.put(envConfig.endpoints.user.update, data);
  return response as UserProfile;
};

/**
 * Upload user photo
 * @param file - Image file to upload
 * @returns Promise with upload response
 */
export const uploadPhoto = async (file: File): Promise<UploadPhotoResponse> => {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await apiClient.post(envConfig.endpoints.user.uploadPhoto, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response as UploadPhotoResponse;
};
