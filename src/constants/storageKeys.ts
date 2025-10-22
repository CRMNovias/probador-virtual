/**
 * Local storage keys
 * 
 * Centralized constants for localStorage key names
 */

/**
 * localStorage key constants
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PROFILE: 'user_profile',
  AVATAR_URL: 'avatar_url',
  LAST_SELECTED_DRESS: 'last_selected_dress',
  LAST_SELECTED_POSE: 'last_selected_pose',
  THEME_PREFERENCE: 'theme_preference',
} as const;

/**
 * Session storage key constants
 */
export const SESSION_KEYS = {
  TEMP_PHONE: 'temp_phone',
  CODE_SENT_AT: 'code_sent_at',
} as const;
