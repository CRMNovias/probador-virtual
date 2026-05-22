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
   * Categoría del producto seleccionado: 'bride' para vestidos de novia,
   * 'groom' para trajes de novio. Se llena al navegar desde las páginas
   * de Colección (?category=). Null cuando no se conoce.
   */
  dressCategory: 'bride' | 'groom' | null;

  /**
   * Whether dressId is missing (error state)
   */
  isDressIdMissing: boolean;

  /**
   * Whether AppContext has finished initializing (processing URL params)
   * Used to prevent premature redirects before dressId is extracted from URL
   */
  isInitialized: boolean;

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
  DRESS_CATEGORY: 'dress_category',
} as const;

/**
 * AppProvider Props
 */
export interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * Helper function to get initial dressId from localStorage (synchronous)
 */
const getInitialDressId = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.DRESS_ID);
  } catch {
    return null;
  }
};

/**
 * Helper function to get initial dressName from localStorage (synchronous)
 */
const getInitialDressName = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.DRESS_NAME);
  } catch {
    return null;
  }
};

/**
 * Helper to read the persisted dress category. Solo acepta 'bride' o 'groom';
 * cualquier otro valor se descarta para no contaminar el contexto con basura.
 */
const getInitialDressCategory = (): 'bride' | 'groom' | null => {
  try {
    const v = localStorage.getItem(STORAGE_KEYS.DRESS_CATEGORY);
    return v === 'bride' || v === 'groom' ? v : null;
  } catch {
    return null;
  }
};

/**
 * AppProvider Component
 *
 * Provides global app state to all components
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [searchParams] = useSearchParams();
  // Initialize dressId and dressName synchronously from localStorage to avoid race condition
  const [dressId, setDressId] = useState<string | null>(getInitialDressId());
  const [dressName, setDressName] = useState<string | null>(getInitialDressName());
  const [dressCategory, setDressCategory] = useState<'bride' | 'groom' | null>(getInitialDressCategory());
  const [isDressIdMissing, setIsDressIdMissing] = useState<boolean>(!getInitialDressId());
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [avatar, setAvatarState] = useState<AvatarInfo | null>(null);

  /**
   * Extract dressId and dressName from URL on mount and persist to localStorage
   * Mark as initialized after processing to prevent premature redirects
   */
  useEffect(() => {
    const dressIdParam = searchParams.get('dressId');
    const dressNameParam = searchParams.get('dressName');
    const storedDressId = localStorage.getItem(STORAGE_KEYS.DRESS_ID);
    const storedDressName = localStorage.getItem(STORAGE_KEYS.DRESS_NAME);

    console.log('[AppContext] Initializing with params:', {
      dressIdParam,
      dressNameParam,
      storedDressId,
      storedDressName
    });

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

    // Handle category parameter (bride|groom) — persistido junto a dressId
    // para que la pantalla try-on pueda mostrar copy contextualizado y el
    // CTA "Pide cita" lo arrastre cuando aplique.
    const categoryParam = searchParams.get('category');
    if (categoryParam === 'bride' || categoryParam === 'groom') {
      setDressCategory(categoryParam);
      localStorage.setItem(STORAGE_KEYS.DRESS_CATEGORY, categoryParam);
    } else {
      const stored = localStorage.getItem(STORAGE_KEYS.DRESS_CATEGORY);
      if (stored === 'bride' || stored === 'groom') {
        setDressCategory(stored);
      } else {
        setDressCategory(null);
      }
    }

    // Mark as initialized after processing URL params
    setIsInitialized(true);
    console.log('[AppContext] Initialization complete');
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
   * NOTE: dressId and dressName are NOT cleared because they come from external catalog
   * and should persist across login sessions
   */
  const clearAppState = useCallback((): void => {
    // Only clear user-specific data (avatar)
    setAvatarState(null);
    localStorage.removeItem(STORAGE_KEYS.AVATAR_INFO);

    // DO NOT clear dressId and dressName - they come from external catalog
    // and should persist so user can continue with the same dress after re-login
  }, []);

  const value: AppContextState = {
    dressId,
    dressName,
    dressCategory,
    isDressIdMissing,
    isInitialized,
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
