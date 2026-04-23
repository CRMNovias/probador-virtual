/**
 * Auth Context (Phase 1)
 *
 * Provides authentication state and methods throughout the application.
 *
 * Features:
 * - User and token state management
 * - Login/logout functionality
 * - Automatic token, user, and phone number persistence in localStorage
 * - Loading state during initialization
 * - Automatic token validation on mount (only clears on 401, not network errors)
 * - Session restoration on app restart (resilient to network failures)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AxiosError } from 'axios';
import { STORAGE_KEYS } from '../constants/storageKeys.js';
import { getProfile } from '../services/userService.js';
import type { UserProfile } from '../types/index.js';

/**
 * Auth Context State
 */
export interface AuthContextState {
  /**
   * Current authenticated user (null if not authenticated)
   */
  user: UserProfile | null;

  /**
   * JWT authentication token (null if not authenticated)
   */
  token: string | null;

  /**
   * Whether user is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Whether auth state is being initialized/validated
   */
  isLoading: boolean;

  /**
   * Login user with token and profile
   * @param token - JWT authentication token
   * @param user - User profile data
   * @param phone - Optional phone number to persist (will be extracted from user if not provided)
   */
  login: (token: string, user: UserProfile, phone?: string) => void;

  /**
   * Logout user and clear auth data
   */
  logout: () => void;

  /**
   * Update user profile data
   */
  updateUser: (user: UserProfile) => void;
}

/**
 * Create Auth Context
 */
const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Provider Component
 *
 * Wraps the application and provides authentication state.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Login handler
   * Stores token, user, and phone number in state and localStorage
   */
  const login = useCallback((newToken: string, newUser: UserProfile, phone?: string) => {
    console.log('[AuthContext] Login called with user:', {
      hasAvatar: newUser.hasAvatar,
      name: newUser.name,
      id: newUser.id,
      phone: phone || newUser.phone
    });
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newUser));

    // Save phone number for session persistence
    const phoneToSave = phone || newUser.phone;
    if (phoneToSave) {
      localStorage.setItem(STORAGE_KEYS.PHONE_NUMBER, phoneToSave);
    }

    console.log('[AuthContext] User saved to localStorage:', JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PROFILE) || '{}'));
  }, []);

  /**
   * Logout handler
   * Clears all auth data from state and localStorage
   */
  const logout = useCallback(() => {
    // Clear state
    setToken(null);
    setUser(null);

    // Clear ALL localStorage keys (complete cleanup)
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.PHONE_NUMBER);
    localStorage.removeItem(STORAGE_KEYS.AVATAR_URL);
    localStorage.removeItem(STORAGE_KEYS.LAST_SELECTED_DRESS);
    localStorage.removeItem(STORAGE_KEYS.LAST_SELECTED_POSE);

    // Also clear avatar_info and dress_id from AppContext
    localStorage.removeItem('avatar_info');
    localStorage.removeItem('dress_id');

    // Clear sessionStorage (temp phone, code sent timestamp)
    sessionStorage.clear();

    console.log('[AuthContext] Logout completed - all data cleared');
  }, []);

  /**
   * Update user profile
   * Updates user in state and localStorage
   */
  const updateUser = useCallback((updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedUser));
  }, []);

  /**
   * Initialize auth state from localStorage on mount
   * Validates token by calling the backend
   */
  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const storedUserJson = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);

        if (storedToken && storedUserJson) {
          const storedUser = JSON.parse(storedUserJson) as UserProfile;

          // Set token and user from localStorage first
          setToken(storedToken);
          setUser(storedUser);

          // Try to validate token and get fresh data from backend
          // But don't clear session on network errors - only on 401 Unauthorized
          try {
            console.log('[AuthContext] Validating stored token...');
            const validatedUser = await getProfile();

            // Merge defensively: keep locally stored fields if the backend
            // response omits them (e.g., older versions of /user/profile did
            // not return name/email). Avoid overwriting with `undefined`.
            const mergedUser: UserProfile = {
              ...storedUser,
              ...validatedUser,
              name: validatedUser.name ?? storedUser.name,
              email: validatedUser.email ?? storedUser.email,
              phone: validatedUser.phone ?? storedUser.phone,
              // Keep local hasAvatar:true if exists, otherwise use backend value (default false)
              hasAvatar: storedUser.hasAvatar === true ? true : (validatedUser.hasAvatar || false),
            };

            // Update user with fresh data from backend (with preserved hasAvatar)
            setUser(mergedUser);
            localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(mergedUser));

            console.log('[AuthContext] Token validated successfully:', {
              hasAvatar: mergedUser.hasAvatar,
              hasAvatarFromBackend: validatedUser.hasAvatar,
              hasAvatarFromLocal: storedUser.hasAvatar,
              name: mergedUser.name,
              id: mergedUser.id
            });
          } catch (error) {
            const axiosError = error as AxiosError;

            // Only clear session if token is explicitly unauthorized (401)
            // For network errors or server errors, keep the local session
            if (axiosError.response?.status === 401) {
              console.warn('[AuthContext] Token unauthorized (401), clearing auth');
              logout();
            } else {
              // Network error or server error - keep local session
              console.warn('[AuthContext] Token validation failed (network/server error), using cached session:', error);
            }
          }
        }
      } catch (error) {
        // Error parsing stored data, clear everything
        console.error('[AuthContext] Error initializing auth:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [logout]);

  // Computed value: isAuthenticated
  const isAuthenticated = !!token && !!user;

  // Context value
  const value: AuthContextState = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 *
 * Access authentication context.
 * Must be used within AuthProvider.
 *
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextState => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
