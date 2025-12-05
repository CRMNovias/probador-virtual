/**
 * Avatar-related types
 * 
 * Interfaces for avatar creation and management
 */

/**
 * User avatar information
 */
export interface Avatar {
  id: string;
  userId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
  status: 'processing' | 'ready' | 'failed';
}

/**
 * Response from avatar upload/generation
 */
export interface UploadAvatarResponse {
  success: boolean;
  data: {
    avatarUrl: string;
    avatarId?: string;
  };
  message?: string;
}

/**
 * Request to regenerate avatar
 */
export interface RegenerateAvatarRequest {
  photoUrl?: string;
}
