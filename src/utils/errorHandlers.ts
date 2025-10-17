/**
 * Error Handlers
 * 
 * Error handling and message mapping utilities
 */

import { AxiosError } from 'axios';
import { errorMessages, getHttpErrorMessage } from '../constants/errorMessages.js';

/**
 * Extract user-friendly error message from error object
 * @param error - Error object (can be Error, AxiosError, or unknown)
 * @returns User-friendly error message in Spanish
 */
export const getErrorMessage = (error: unknown): string => {
  // Handle AxiosError (HTTP errors)
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    
    // Network error
    if (!axiosError.response) {
      return errorMessages.NETWORK_ERROR;
    }
    
    // HTTP status code errors
    if (axiosError.response.status) {
      return getHttpErrorMessage(axiosError.response.status);
    }
  }
  
  // Handle standard Error
  if (error instanceof Error) {
    return error.message || errorMessages.UNKNOWN_ERROR;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Fallback
  return errorMessages.UNKNOWN_ERROR;
};

/**
 * Log error to console (development only)
 * @param error - Error to log
 * @param context - Additional context for debugging
 */
export const logError = (error: unknown, context?: string): void => {
  if (import.meta.env.DEV) {
    const prefix = context ? ` - ${context}` : '';
    console.error(`[Error${prefix}]:`, error);
  }
};

/**
 * Check if error is a network error
 * @param error - Error to check
 * @returns True if network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    return !axiosError.response;
  }
  return false;
};

/**
 * Check if error is an authentication error
 * @param error - Error to check
 * @returns True if 401 or 403 error
 */
export const isAuthError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 401 || axiosError.response?.status === 403;
  }
  return false;
};
