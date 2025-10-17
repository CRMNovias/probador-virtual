/**
 * API Configuration
 * 
 * Centralized configuration for API client settings including
 * base URL, timeout, retry logic, and default headers.
 */

import { envConfig } from './envConfig.js';

/**
 * API configuration interface
 */
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers: Record<string, string>;
}

/**
 * API client configuration object
 */
export const apiConfig: ApiConfig = {
  baseUrl: envConfig.apiBaseUrl,
  timeout: envConfig.apiTimeout,
  retryAttempts: 3,
  retryDelay: 1000, // 1 second initial delay, will use exponential backoff
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;
