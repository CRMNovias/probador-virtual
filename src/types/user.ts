/**
 * User-related types
 * 
 * Interfaces for user profile, authentication, and user data management
 */

/**
 * User profile information
 */
export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string;
  createdAt: string;
  hasAvatar: boolean;
}

/**
 * Request to create a new user profile
 */
export interface CreateProfileRequest {
  name: string;
  email?: string;
}

/**
 * Request to update user profile
 */
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

/**
 * Response from photo upload
 */
export interface UploadPhotoResponse {
  success: boolean;
  photoUrl: string;
  message: string;
}

/**
 * Response from sending verification code
 */
export interface SendCodeResponse {
  success: boolean;
  message: string;
  expiresIn: number; // seconds
}

/**
 * Response from verifying code
 */
export interface VerifyCodeResponse {
  success: boolean;
  token: string;
  user: UserProfile;
}
