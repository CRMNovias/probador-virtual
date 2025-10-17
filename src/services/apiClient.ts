/**
 * API Client
 * 
 * Configured Axios instance with interceptors for:
 * - Adding authentication headers
 * - Handling errors globally
 * - Retry logic for network errors
 * - Request/response logging
 * 
 * This is the base client used by all service files.
 */

import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import { apiConfig } from '../config/apiConfig.js';
import { STORAGE_KEYS } from '../constants/storageKeys.js';
import { envConfig } from '../config/envConfig.js';

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
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (envConfig.enableLogs) {
      const method = config.method ? config.method.toUpperCase() : 'UNKNOWN';
      console.log(`[API Request] ${method} ${config.url}`);
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
 * Handles errors globally and returns data directly
 */
apiClient.interceptors.response.use(
  (response) => {
    if (envConfig.enableLogs) {
      console.log(`[API Response] ${response.status} ${response.config.url}`);
    }
    return response.data;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      window.location.href = '/';
    }

    if (envConfig.enableLogs) {
      const status = error.response ? error.response.status : 'unknown';
      console.error('[API Response Error]', status, error.message);
    }

    return Promise.reject(error);
  }
);

export { apiClient };
