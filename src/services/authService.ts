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
import type { SendCodeResponse, VerifyCodeResponse } from '../types/index.js';

/**
 * Send SMS verification code to phone number
 * @param phone - Phone number with country code (e.g., +34600000000)
 * @returns Promise with send code response
 */
export const sendCode = async (phone: string): Promise<SendCodeResponse> => {
  const response = await apiClient.post(envConfig.endpoints.auth.sendCode, { phone });
  return response as unknown as SendCodeResponse;
};

/**
 * Verify SMS code
 * @param phone - Phone number
 * @param code - 6-digit verification code
 * @returns Promise with verification response including token and user
 *
 * NOTE: This service does NOT store the token/user in localStorage.
 * That is handled by AuthContext.login() to maintain separation of concerns.
 */
export const verifyCode = async (
  phone: string,
  code: string
): Promise<VerifyCodeResponse> => {
  const response = await apiClient.post(envConfig.endpoints.auth.verifyCode, {
    phone,
    code,
  });
  return response as unknown as VerifyCodeResponse;
};
