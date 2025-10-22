/**
 * Avatar Service (Phase 1)
 *
 * Handles avatar-related operations:
 * - Generate avatar with AI (using user's uploaded photo)
 * - Get avatar information
 */

import { apiClient } from './apiClient.js';
import { envConfig } from '../config/envConfig.js';
import type { Avatar, UploadAvatarResponse } from '../types/index.js';

/**
 * Generate avatar with AI (Phase 1)
 * Uses the user's uploaded photo (photoUrl) to generate full-body avatar
 * @param prompt - Prompt for AI generation
 * @returns Promise with generation response
 */
export const generateAvatar = async (prompt: string): Promise<UploadAvatarResponse> => {
  const response = await apiClient.post(envConfig.endpoints.avatar.generate, { prompt });
  return response as unknown as UploadAvatarResponse;
};

/**
 * Get current user's avatar (Phase 1)
 * @returns Promise with avatar data
 */
export const getAvatar = async (): Promise<Avatar> => {
  const response = await apiClient.get(envConfig.endpoints.avatar.get);
  return response as unknown as Avatar;
};
