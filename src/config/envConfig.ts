/**
 * Environment Configuration
 * 
 * This file centralizes all environment variable access and provides
 * validation to ensure required variables are defined.
 * 
 * All environment variables must be prefixed with VITE_ to be exposed
 * to the client-side code.
 */

/**
 * Type-safe environment configuration object
 */
export const envConfig = {
  // Base configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT as string, 10),
  maxUploadSizeMB: parseInt(import.meta.env.VITE_MAX_UPLOAD_SIZE_MB as string, 10),
  enableLogs: import.meta.env.VITE_ENABLE_LOGS === 'true',

  // Endpoints - Auth
  endpoints: {
    auth: {
      sendCode: import.meta.env.VITE_ENDPOINT_AUTH_SEND_CODE as string,
      verifyCode: import.meta.env.VITE_ENDPOINT_AUTH_VERIFY_CODE as string,
    },
    user: {
      profile: import.meta.env.VITE_ENDPOINT_USER_PROFILE as string,
      update: import.meta.env.VITE_ENDPOINT_USER_UPDATE as string,
      uploadPhoto: import.meta.env.VITE_ENDPOINT_USER_UPLOAD_PHOTO as string,
    },
    avatar: {
      upload: import.meta.env.VITE_ENDPOINT_AVATAR_UPLOAD as string,
      regenerate: import.meta.env.VITE_ENDPOINT_AVATAR_REGENERATE as string,
      get: import.meta.env.VITE_ENDPOINT_AVATAR_GET as string,
    },
    dress: {
      getAll: import.meta.env.VITE_ENDPOINT_DRESSES_GET_ALL as string,
      getById: import.meta.env.VITE_ENDPOINT_DRESS_GET_BY_ID as string,
    },
    pose: {
      getAll: import.meta.env.VITE_ENDPOINT_POSES_GET_ALL as string,
    },
    tryOn: {
      generate: import.meta.env.VITE_ENDPOINT_TRYON_GENERATE as string,
      getUserTryOns: import.meta.env.VITE_ENDPOINT_TRYON_GET_USER as string,
      delete: import.meta.env.VITE_ENDPOINT_TRYON_DELETE as string,
      getById: import.meta.env.VITE_ENDPOINT_TRYON_GET_BY_ID as string,
    },
    share: {
      get: import.meta.env.VITE_ENDPOINT_SHARE_GET as string,
    },
    appointment: {
      getUserAppointments: import.meta.env.VITE_ENDPOINT_APPOINTMENTS_GET_USER as string,
      book: import.meta.env.VITE_ENDPOINT_APPOINTMENT_BOOK as string,
    },
  },
} as const;

/**
 * Validates that all required environment variables are defined
 * @param obj - The object to validate
 * @param path - The current path in the object (for error messages)
 */
const validateEndpoints = (obj: Record<string, unknown>, path = ''): void => {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      validateEndpoints(value as Record<string, unknown>, currentPath);
    } else if (!value) {
      console.warn(`Warning: Endpoint ${currentPath} is not defined`);
    }
  }
};

// Validate required base configuration
if (!envConfig.apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is required');
}

if (isNaN(envConfig.apiTimeout)) {
  throw new Error('VITE_API_TIMEOUT must be a valid number');
}

if (isNaN(envConfig.maxUploadSizeMB)) {
  throw new Error('VITE_MAX_UPLOAD_SIZE_MB must be a valid number');
}

// Validate all endpoints are defined
validateEndpoints(envConfig.endpoints);

// Log configuration in development mode
if (envConfig.enableLogs) {
  console.log('Environment Configuration Loaded:', {
    apiBaseUrl: envConfig.apiBaseUrl,
    apiTimeout: envConfig.apiTimeout,
    maxUploadSizeMB: envConfig.maxUploadSizeMB,
  });
}
