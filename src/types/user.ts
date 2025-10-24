/**
 * User-related types
 * 
 * Interfaces for user profile, authentication, and user data management
 */

/**
 * User profile information (complete profile)
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
 * Basic user info from auth response (Phase 1 - Backend API Spec)
 */
export interface AuthUser {
  id: string;
  phone: string;
  createdAt: string;
}

/**
 * Request to create a new user profile
 */
export interface CreateProfileRequest {
  phone: string;
  name: string;
  email: string;
}

/**
 * Response from creating user profile (Phase 1 - Backend returns complete profile)
 */
export interface CreateProfileResponse {
  success: boolean;
  data: {
    token: string;
    expiresIn: number;
    user: UserProfile;
  };
  message: string;
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
 * Response from sending verification code (Phase 1 - Backend API Spec)
 */
export interface SendCodeResponse {
  success: boolean;
  data: {
    phoneNumber: string;
    expiresIn: number;
    cooldownSeconds: number;
  };
  message: string;
}

/**
 * Response from verifying code (Phase 1 - Backend API Spec)
 */
export interface VerifyCodeResponse {
  success: boolean;
  data: {
    token: string;
    expiresIn: number;
    hasProfile: boolean;  // Indicates if user has completed profile (name + email)
    user: AuthUser;
  };
  message: string;
}
