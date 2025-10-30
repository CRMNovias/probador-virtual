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
  console.log('[avatarService] Raw generateAvatar response from backend:', response);
  return response as unknown as UploadAvatarResponse;
};

/**
 * Get current user's avatar (Phase 1)
 * @returns Promise with avatar data
 */
export const getAvatar = async (): Promise<Avatar> => {
  const response = await apiClient.get(envConfig.endpoints.avatar.get) as {
    success: boolean;
    data: {
      avatarUrl: string;
      userId: string;
      createdAt: string;
      updatedAt: string;
    };
  };

  console.log('[avatarService] Raw avatar response from backend:', response);

  // Map backend response to frontend Avatar interface
  const avatar: Avatar = {
    id: response.data.userId, // Using userId as avatar ID
    userId: response.data.userId,
    imageUrl: response.data.avatarUrl, // Map avatarUrl to imageUrl
    createdAt: response.data.createdAt,
    status: 'ready',
  };

  console.log('[avatarService] Mapped avatar data:', avatar);

  return avatar;
};
