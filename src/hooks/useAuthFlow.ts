/**
 * useAuthFlow Hook (Phase 1)
 *
 * Custom hook for handling authentication flow:
 * - Send verification code to phone
 * - Verify code and login
 *
 * Provides loading/error states and user-friendly error messages.
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { sendCode, verifyCode } from '../services/authService.js';
import { errorMessages } from '../constants/errorMessages.js';
import type { AxiosError } from 'axios';

/**
 * Verify code result
 */
export interface VerifyCodeResult {
  success: boolean;
  needsRegistration: boolean;
}

/**
 * Auth flow state and handlers
 */
export interface UseAuthFlowReturn {
  /**
   * Loading state (true during API calls)
   */
  isLoading: boolean;

  /**
   * Error message (null if no error)
   */
  error: string | null;

  /**
   * Send verification code to phone number
   */
  sendCodeHandler: (phone: string) => Promise<boolean>;

  /**
   * Verify code and login
   * Returns object with success flag and needsRegistration flag
   */
  verifyCodeHandler: (phone: string, code: string) => Promise<VerifyCodeResult>;

  /**
   * Clear error message
   */
  clearError: () => void;
}

/**
 * Get user-friendly error message from API error
 */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const axiosError = error as AxiosError<{ error?: { code?: string; message?: string } }>;

    // Check for specific error codes from backend
    if (axiosError.response?.data?.error?.code) {
      const errorCode = axiosError.response.data.error.code;

      // Map backend error codes to user messages
      switch (errorCode) {
        case 'INVALID_PHONE':
          return errorMessages.AUTH_INVALID_PHONE;
        case 'INVALID_CODE':
          return errorMessages.AUTH_INVALID_CODE;
        case 'EXPIRED_CODE':
          return errorMessages.AUTH_EXPIRED_CODE;
        case 'TOO_MANY_ATTEMPTS':
          return errorMessages.AUTH_TOO_MANY_ATTEMPTS;
        default:
          // Use backend message if available
          return axiosError.response.data.error.message || errorMessages.UNKNOWN_ERROR;
      }
    }

    // Check HTTP status codes
    if (axiosError.response?.status) {
      const status = axiosError.response.status;
      switch (status) {
        case 400:
          return errorMessages.AUTH_INVALID_PHONE;
        case 401:
          return errorMessages.AUTH_INVALID_CODE;
        case 429:
          return errorMessages.AUTH_TOO_MANY_ATTEMPTS;
        case 500:
          return errorMessages.SERVER_ERROR;
        case 503:
          return errorMessages.SERVER_UNAVAILABLE;
        default:
          return errorMessages.UNKNOWN_ERROR;
      }
    }

    // Network error (no response)
    if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
      return errorMessages.TIMEOUT_ERROR;
    }

    if (!axiosError.response) {
      return errorMessages.NETWORK_ERROR;
    }
  }

  return errorMessages.UNKNOWN_ERROR;
};

/**
 * useAuthFlow Hook
 *
 * Manages the complete authentication flow with loading/error states.
 */
export const useAuthFlow = (): UseAuthFlowReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  /**
   * Send verification code handler
   * @returns true if successful, false if failed
   */
  const sendCodeHandler = useCallback(async (phone: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await sendCode(phone);
      return true;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verify code and login handler
   * @returns VerifyCodeResult with success flag and needsRegistration flag
   */
  const verifyCodeHandler = useCallback(
    async (phone: string, code: string): Promise<VerifyCodeResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await verifyCode(phone, code);

        // Verify response has required data
        if (!response.success || !response.data?.token || !response.data?.user) {
          setError(errorMessages.AUTH_INVALID_CODE);
          return { success: false, needsRegistration: false };
        }

        // Check if user needs registration using backend's hasProfile flag
        // hasProfile: true = user has completed name/email registration (name and email will be present)
        // hasProfile: false = user needs to complete registration
        const needsRegistration = !response.data.hasProfile;

        // Map AuthUser data - when hasProfile is true, name and email are included
        const userName = response.data.user.name || null;
        const userEmail = response.data.user.email || null;

        // Backend now provides hasAvatar directly in the response
        const hasAvatar = response.data.hasAvatar;

        // Convert AuthUser to UserProfile
        const userProfile = {
          id: response.data.user.id,
          phone: response.data.user.phone,
          createdAt: response.data.user.createdAt,
          name: userName,
          email: userEmail,
          hasAvatar,
        };

        // Login with token and user data
        login(response.data.token, userProfile);

        console.log('[useAuthFlow] Authentication successful:', {
          hasProfile: response.data.hasProfile,
          hasAvatar: response.data.hasAvatar,
          needsRegistration,
          userName,
          userId: response.data.user.id
        });

        return { success: true, needsRegistration };
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        return { success: false, needsRegistration: false };
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    sendCodeHandler,
    verifyCodeHandler,
    clearError,
  };
};
