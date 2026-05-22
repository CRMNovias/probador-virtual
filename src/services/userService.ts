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
import type { UserProfile, CreateProfileRequest, CreateProfileResponse, UpdateProfileRequest, UploadPhotoResponse, PublicShop } from '../types/index.js';

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
 * Update user profile.
 *
 * Solo envía campos no-undefined para no pisar columnas que el cliente no
 * quiere modificar. El backend acepta cualquier subconjunto de los campos
 * de UpdateProfileRequest.
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<UserProfile> => {
  // Filtra undefined manteniendo null (null = "borrar valor" en algunos casos)
  const payload: Record<string, unknown> = {};
  (Object.keys(data) as Array<keyof UpdateProfileRequest>).forEach((k) => {
    const v = data[k];
    if (v !== undefined) payload[k] = v;
  });

  const response = (await apiClient.post(envConfig.endpoints.user.update, payload)) as unknown as
    | { success: boolean; data: UserProfile }
    | UserProfile;

  const raw = 'data' in response && response.data ? response.data : (response as UserProfile);
  return {
    ...raw,
    id: String(raw.id ?? ''),
    hasAvatar: raw.hasAvatar ?? false,
  };
};

/**
 * Lista pública de ateliers que el cliente puede elegir como tienda más
 * cercana durante el wizard de registro. Sin requerir token JWT.
 */
export const listPublicShops = async (): Promise<PublicShop[]> => {
  const response = (await apiClient.get(envConfig.endpoints.shops.list)) as unknown as
    | { success: boolean; data: PublicShop[] }
    | PublicShop[];

  if (Array.isArray(response)) return response;
  return response.data ?? [];
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
