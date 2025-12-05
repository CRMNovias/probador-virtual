/**
 * ProtectedRoute Component (Phase 1)
 *
 * Route protection wrapper that handles:
 * - Authentication checks
 * - Avatar requirement checks
 * - Automatic redirects based on state
 *
 * Features:
 * - Redirects to /auth if not authenticated
 * - Redirects to /avatar-creation if avatar required but missing
 * - Shows loading state during auth check
 * - Preserves intended destination for post-auth redirect
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

export interface ProtectedRouteProps {
  /**
   * Child components to render if authorized
   */
  children: React.ReactNode;

  /**
   * Whether this route requires an avatar
   * Default: false
   */
  requireAvatar?: boolean;
}

/**
 * ProtectedRoute Component
 *
 * Wraps routes that require authentication and/or avatar
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAvatar = false,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  /**
   * Show loading spinner while checking auth state
   */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8C6F5A] mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  /**
   * Redirect to auth if not authenticated
   * Save the intended destination to redirect back after login
   */
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  /**
   * Redirect to avatar creation if avatar is required but missing
   */
  if (requireAvatar && user && !user.hasAvatar) {
    console.log('[ProtectedRoute] Redirecting to avatar-creation - user.hasAvatar:', user.hasAvatar, 'user:', user);
    return <Navigate to="/avatar-creation" state={{ from: location }} replace />;
  }

  /**
   * User is authenticated (and has avatar if required)
   * Render protected content
   */
  return <>{children}</>;
};
