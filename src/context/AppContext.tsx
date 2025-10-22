/**
 * AppContext (Phase 1)
 *
 * Global application state context for managing:
 * - DressId from URL parameters (external source)
 * - Avatar state
 * - Other shared app state
 *
 * CRITICAL ARCHITECTURE:
 * - DressId ALWAYS comes from URL parameter (?dressId=xxx)
 * - No dress selector UI exists
 * - DressId is extracted on app load and stored in context
 * - If dressId is missing, app shows error state
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Avatar information stored in app state
 */
export interface AvatarInfo {
  url: string;
  createdAt: string;
}

/**
 * App context state
 */
export interface AppContextState {
  /**
   * Dress ID from URL parameter (required)
   * This comes from the external catalog and is NEVER selected within the app
   */
  dressId: string | null;

  /**
   * Whether dressId is missing (error state)
   */
  isDressIdMissing: boolean;

  /**
   * Current user avatar
   */
  avatar: AvatarInfo | null;

  /**
   * Set avatar information
   */
  setAvatar: (avatar: AvatarInfo | null) => void;

  /**
   * Clear all app state (on logout)
   */
  clearAppState: () => void;
}

/**
 * App context
 */
const AppContext = createContext<AppContextState | undefined>(undefined);

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  AVATAR_INFO: 'avatar_info',
} as const;

/**
 * AppProvider Props
 */
export interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * AppProvider Component
 *
 * Provides global app state to all components
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const [dressId, setDressId] = useState<string | null>(null);
  const [isDressIdMissing, setIsDressIdMissing] = useState<boolean>(false);
  const [avatar, setAvatarState] = useState<AvatarInfo | null>(null);

  /**
   * Extract dressId from URL on mount
   */
  useEffect(() => {
    const dressIdParam = searchParams.get('dressId');

    if (dressIdParam) {
      setDressId(dressIdParam);
      setIsDressIdMissing(false);
    } else {
      setDressId(null);
      setIsDressIdMissing(true);
    }
  }, [searchParams]);

  /**
   * Load avatar from localStorage on mount
   */
  useEffect(() => {
    const storedAvatarJson = localStorage.getItem(STORAGE_KEYS.AVATAR_INFO);
    if (storedAvatarJson) {
      try {
        const storedAvatar = JSON.parse(storedAvatarJson) as AvatarInfo;
        setAvatarState(storedAvatar);
      } catch (err) {
        console.error('Failed to parse stored avatar:', err);
        localStorage.removeItem(STORAGE_KEYS.AVATAR_INFO);
      }
    }
  }, []);

  /**
   * Set avatar and persist to localStorage
   */
  const setAvatar = useCallback((newAvatar: AvatarInfo | null): void => {
    setAvatarState(newAvatar);

    if (newAvatar) {
      localStorage.setItem(STORAGE_KEYS.AVATAR_INFO, JSON.stringify(newAvatar));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AVATAR_INFO);
    }
  }, []);

  /**
   * Clear all app state (on logout)
   */
  const clearAppState = useCallback((): void => {
    setAvatarState(null);
    localStorage.removeItem(STORAGE_KEYS.AVATAR_INFO);
  }, []);

  const value: AppContextState = {
    dressId,
    isDressIdMissing,
    avatar,
    setAvatar,
    clearAppState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * useApp Hook
 *
 * Access app context state
 */
export const useApp = (): AppContextState => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
