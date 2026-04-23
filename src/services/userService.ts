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
 *
 * The backend wraps the payload in `{ success, data: {...} }`. The global axios
 * response interceptor only unwraps the outer axios response (returns
 * `response.data`), so here we still have to unwrap the Laravel envelope to
 * return the raw `UserProfile`.
 *
 * @returns Promise with user profile data
 */
export const getProfile = async (): Promise<UserProfile> => {
  const response = (await apiClient.get(envConfig.endpoints.user.profile)) as unknown as
    | UserProfile
    | { success: boolean; data: UserProfile };

  // Backend always returns the envelope; the fallback keeps us safe if it changes.
  const raw = 'data' in response && response.data ? response.data : (response as UserProfile);

  return {
    ...raw,
    id: String(raw.id ?? ''),
    hasAvatar: raw.hasAvatar ?? false,
  };
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
