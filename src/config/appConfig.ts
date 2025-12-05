/**
 * Application Configuration
 * 
 * Application-wide constants and configuration values that don't
 * come from environment variables but are hardcoded business logic.
 */

import { envConfig } from './envConfig.js';

/**
 * Application configuration object
 */
export const appConfig = {
  // File upload settings
  maxUploadSizeMB: envConfig.maxUploadSizeMB,
  maxUploadSizeBytes: envConfig.maxUploadSizeMB * 1024 * 1024,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/jpg'] as const,
  allowedImageExtensions: ['.jpg', '.jpeg', '.png'] as const,

  // Authentication settings
  codeLength: 6,
  codeExpirationMinutes: 5,
  phoneCountryCode: '+34', // Spain default

  // UI settings
  itemsPerPage: 12,
  thumbnailSize: 200, // pixels
  previewSize: 800, // pixels

  // Animation durations (milliseconds)
  animationDuration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  // Toast/notification durations (milliseconds)
  notificationDuration: {
    error: 5000,
    success: 3000,
    info: 4000,
  },
} as const;

/**
 * Validates if a file is an allowed image type
 * @param file - The file to validate
 * @returns True if the file type is allowed
 */
export const isAllowedImageType = (file: File): boolean => {
  return appConfig.allowedImageTypes.includes(file.type as typeof appConfig.allowedImageTypes[number]);
};

/**
 * Validates if a file size is within the allowed limit
 * @param file - The file to validate
 * @returns True if the file size is within the limit
 */
export const isFileSizeValid = (file: File): boolean => {
  return file.size <= appConfig.maxUploadSizeBytes;
};
