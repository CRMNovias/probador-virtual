/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls:
 * - Send SMS verification code
 * - Verify SMS code
 * - Manage authentication tokens
 */

import { apiClient } from './apiClient.js';
import { envConfig } from '../config/envConfig.js';
import { STORAGE_KEYS } from '../constants/storageKeys.js';
import type { SendCodeResponse, VerifyCodeResponse } from '../types/index.js';

/**
 * Send SMS verification code to phone number
 * @param phone - Phone number with country code (e.g., +34600000000)
 * @returns Promise with send code response
 */
export const sendCode = async (phone: string): Promise<SendCodeResponse> => {
  const response = await apiClient.post(envConfig.endpoints.auth.sendCode, { phone });
  return response as SendCodeResponse;
};

/**
 * Verify SMS code
 * @param phone - Phone number
 * @param code - 6-digit verification code
 * @returns Promise with verification response including token and user
 */
export const verifyCode = async (
  phone: string,
  code: string
): Promise<VerifyCodeResponse> => {
  const response = await apiClient.post(envConfig.endpoints.auth.verifyCode, {
    phone,
    code,
  });
  const data = response as VerifyCodeResponse;

  // Store auth data on successful verification
  if (data.success && data.token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(data.user));
  }

  return data;
};

/**
 * Logout user by clearing auth data
 */
export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  localStorage.removeItem(STORAGE_KEYS.AVATAR_URL);
};
