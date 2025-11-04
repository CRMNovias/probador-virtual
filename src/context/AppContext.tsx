/**
 * AppContext (Phase 1 - Updated)
 *
 * Global application state context for managing:
 * - DressId and DressName from URL parameters (external source)
 * - Avatar state
 * - Other shared app state
 *
 * CRITICAL ARCHITECTURE:
 * - DressId and DressName ALWAYS come from URL parameters (?dressId=xxx&dressName=yyy)
 * - No dress selector UI exists
 * - DressId and DressName are extracted on app load and stored in context
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
   * Dress Name from URL parameter (optional)
   * Display name for the selected dress/garment
   */
  dressName: string | null;

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
  DRESS_ID: 'dress_id',
  DRESS_NAME: 'dress_name',
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
  const [dressName, setDressName] = useState<string | null>(null);
  const [isDressIdMissing, setIsDressIdMissing] = useState<boolean>(false);
  const [avatar, setAvatarState] = useState<AvatarInfo | null>(null);

  /**
   * Extract dressId and dressName from URL on mount and persist to localStorage
   */
  useEffect(() => {
    const dressIdParam = searchParams.get('dressId');
    const dressNameParam = searchParams.get('dressName');
    const storedDressId = localStorage.getItem(STORAGE_KEYS.DRESS_ID);
    const storedDressName = localStorage.getItem(STORAGE_KEYS.DRESS_NAME);

    // Priority: URL param > localStorage
    if (dressIdParam) {
      setDressId(dressIdParam);
      setIsDressIdMissing(false);
      // Persist to localStorage for future navigation
      localStorage.setItem(STORAGE_KEYS.DRESS_ID, dressIdParam);
    } else if (storedDressId) {
      // Fallback to stored dressId if not in URL
      setDressId(storedDressId);
      setIsDressIdMissing(false);
    } else {
      setDressId(null);
      setIsDressIdMissing(true);
    }

    // Handle dressName parameter
    if (dressNameParam) {
      // Decode URI component in case it has special characters
      const decodedDressName = decodeURIComponent(dressNameParam);
      setDressName(decodedDressName);
      localStorage.setItem(STORAGE_KEYS.DRESS_NAME, decodedDressName);
    } else if (storedDressName) {
      // Fallback to stored dressName if not in URL
      setDressName(storedDressName);
    } else {
      setDressName(null);
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
    localStorage.removeItem(STORAGE_KEYS.DRESS_ID);
    localStorage.removeItem(STORAGE_KEYS.DRESS_NAME);
    setDressId(null);
    setDressName(null);
  }, []);

  const value: AppContextState = {
    dressId,
    dressName,
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
