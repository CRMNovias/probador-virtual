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
 * Response from avatar upload
 */
export interface UploadAvatarResponse {
  success: boolean;
  avatarId: string;
  avatarUrl: string;
  message?: string;
}

/**
 * Request to regenerate avatar
 */
export interface RegenerateAvatarRequest {
  photoUrl?: string;
}
