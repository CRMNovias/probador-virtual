/**
 * API Client (Phase 1)
 *
 * Configured Axios instance with interceptors for:
 * - Adding authentication headers
 * - Handling errors globally
 * - Retry logic for network errors with exponential backoff
 * - Request/response logging
 *
 * This is the base client used by all service files.
 */

import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiConfig } from '../config/apiConfig.js';
import { STORAGE_KEYS } from '../constants/storageKeys.js';
import { envConfig } from '../config/envConfig.js';

/**
 * Custom config for retry logic
 */
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

/**
 * Maximum number of retry attempts for network/5xx errors
 */
const MAX_RETRIES = 3;

/**
 * Calculate exponential backoff delay
 * @param retryCount - Current retry attempt (0-indexed)
 * @returns Delay in milliseconds (1s, 2s, 4s)
 */
const getRetryDelay = (retryCount: number): number => {
  return Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
};

/**
 * Determine if error is retryable
 * @param error - Axios error object
 * @returns True if should retry
 */
const isRetryableError = (error: AxiosError): boolean => {
  // Network errors (no response from server)
  if (!error.response) {
    return true;
  }

  // Server errors (5xx)
  const status = error.response.status;
  if (status >= 500 && status < 600) {
    return true;
  }

  // Do NOT retry client errors (4xx) - these won't fix themselves
  return false;
};

/**
 * Create configured axios instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeout,
  headers: apiConfig.headers,
});

/**
 * Request interceptor
 * Adds authentication token to requests if available
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for monitoring
    if (envConfig.enableLogs) {
      const method = config.method ? config.method.toUpperCase() : 'UNKNOWN';
      const timestamp = new Date().toISOString();
      console.log(`[API Request] ${timestamp} ${method} ${config.url}`);
    }

    return config;
  },
  (error: AxiosError) => {
    if (envConfig.enableLogs) {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles errors globally, implements retry logic, and returns data directly
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses
    if (envConfig.enableLogs) {
      const timestamp = new Date().toISOString();
      console.log(`[API Response] ${timestamp} ${response.status} ${response.config.url}`);
    }

    // Return data directly (unwrap AxiosResponse)
    return response.data;
  },
  async (error: AxiosError) => {
    const config = error.config as RetryConfig;

    // Log error details
    if (envConfig.enableLogs) {
      const status = error.response ? error.response.status : 'NO_RESPONSE';
      const timestamp = new Date().toISOString();
      console.error(`[API Response Error] ${timestamp} ${status} ${error.message}`);
    }

    // Handle 401 Unauthorized
    // Only clear auth and redirect if user was previously authenticated
    // During initial authentication (login/verify code), let the component handle the error
    if (error.response && error.response.status === 401) {
      const hasStoredToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      // Only redirect if there was a stored token (user was authenticated)
      // This prevents redirect during initial authentication flow
      if (hasStoredToken) {
        if (envConfig.enableLogs) {
          console.warn('[API] 401 Unauthorized - Clearing auth and redirecting');
        }
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
        localStorage.removeItem(STORAGE_KEYS.AVATAR_URL);
        window.location.href = '/';
      } else {
        if (envConfig.enableLogs) {
          console.warn('[API] 401 Unauthorized during auth flow - letting component handle error');
        }
      }

      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response && error.response.status === 403) {
      if (envConfig.enableLogs) {
        console.warn('[API] 403 Forbidden - Access denied');
      }
      return Promise.reject(error);
    }

    // Handle 404 Not Found
    if (error.response && error.response.status === 404) {
      if (envConfig.enableLogs) {
        console.warn('[API] 404 Not Found - Resource not found');
      }
      return Promise.reject(error);
    }

    // Implement retry logic for network/5xx errors
    if (config && isRetryableError(error)) {
      const retryCount = config._retryCount || 0;

      if (retryCount < MAX_RETRIES) {
        config._retryCount = retryCount + 1;
        config._retry = true;

        const delay = getRetryDelay(retryCount);

        if (envConfig.enableLogs) {
          console.warn(
            `[API] Retrying request (${config._retryCount}/${MAX_RETRIES}) after ${delay}ms - ${config.url}`
          );
        }

        // Wait for exponential backoff delay
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Retry the request
        return apiClient(config);
      } else {
        if (envConfig.enableLogs) {
          console.error(`[API] Max retries (${MAX_RETRIES}) exceeded for ${config.url}`);
        }
      }
    }

    // Return transformed error
    return Promise.reject(error);
  }
);

export { apiClient };
