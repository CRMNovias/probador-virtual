/**
 * Auth Context (Phase 1)
 *
 * Provides authentication state and methods throughout the application.
 *
 * Features:
 * - User and token state management
 * - Login/logout functionality
 * - Automatic token persistence in localStorage
 * - Loading state during initialization
 * - Token validation on mount (optional)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../constants/storageKeys.js';
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
   */
  login: (token: string, user: UserProfile) => void;

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
   * Stores token and user in state and localStorage
   */
  const login = useCallback((newToken: string, newUser: UserProfile) => {
    console.log('[AuthContext] Login called with user:', {
      hasAvatar: newUser.hasAvatar,
      name: newUser.name,
      id: newUser.id
    });
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newUser));
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
   */
  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const storedUserJson = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);

        if (storedToken && storedUserJson) {
          const storedUser = JSON.parse(storedUserJson) as UserProfile;
          setToken(storedToken);
          setUser(storedUser);

          // Optional: Validate token by calling /user/profile
          // Uncomment if backend team confirms this endpoint doesn't require
          // additional authentication beyond the token
          /*
          try {
            const validatedUser = await getProfile();
            setUser(validatedUser);
            localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(validatedUser));
          } catch (error) {
            // Token invalid or expired, clear auth
            logout();
          }
          */
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
