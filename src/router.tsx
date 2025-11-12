/**
 * Application Router (Phase 1)
 *
 * React Router configuration with all application routes.
 *
 * Route Structure:
 * - / (HOME) - Redirects to /auth or /try-on based on auth state
 * - /auth (PUBLIC) - Authentication page
 * - /avatar-creation (PROTECTED) - Avatar creation page
 * - /try-on (PROTECTED, REQUIRES AVATAR) - Main try-on page
 * - /gallery (PROTECTED, REQUIRES AVATAR) - Gallery page
 * - /appointments (PROTECTED, REQUIRES AVATAR) - Appointments page
 * - /share/:id (PUBLIC) - Share page for viewing shared images
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/routing/ProtectedRoute.js';
import { useAuth } from './context/AuthContext.js';
import { useApp } from './context/AppContext.js';
import { routes } from './constants/routes.js';

// Page imports
import { AuthPage } from './pages/AuthPage.js';
import { AvatarCreationPage } from './pages/AvatarCreationPage.js';
import { TryOnPage } from './pages/TryOnPage.js';
import { GalleryPage } from './pages/GalleryPage.js';
import { AppointmentsPage } from './pages/AppointmentsPage.js';
import { SharePage } from './pages/SharePage.js';

/**
 * Home Route Component
 * Redirects based on authentication state
 * Waits for both AuthContext and AppContext to initialize before redirecting
 */
const HomeRoute: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const { isInitialized: isAppInitialized } = useApp();

  // Show loading while checking auth OR while AppContext is initializing
  // This prevents premature redirects before dressId is extracted from URL
  if (isAuthLoading || !isAppInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8C6F5A]" />
      </div>
    );
  }

  // If authenticated with avatar, go to try-on
  if (isAuthenticated && user?.hasAvatar) {
    return <Navigate to={routes.TRY_ON} replace />;
  }

  // If authenticated without avatar, go to avatar creation
  if (isAuthenticated && user && !user.hasAvatar) {
    return <Navigate to={routes.AVATAR_CREATION} replace />;
  }

  // Not authenticated, go to auth
  return <Navigate to={routes.AUTH} replace />;
};

/**
 * AppRouter Component
 *
 * Main router configuration for the application
 */
export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Home - Smart redirect based on auth state */}
      <Route path={routes.HOME} element={<HomeRoute />} />

      {/* Public Routes */}
      <Route path={routes.AUTH} element={<AuthPage />} />
      <Route path={routes.SHARE} element={<SharePage />} />

      {/* Protected Routes - Require Authentication */}
      <Route
        path={routes.AVATAR_CREATION}
        element={
          <ProtectedRoute>
            <AvatarCreationPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Require Authentication + Avatar */}
      <Route
        path={routes.TRY_ON}
        element={
          <ProtectedRoute requireAvatar>
            <TryOnPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={routes.GALLERY}
        element={
          <ProtectedRoute requireAvatar>
            <GalleryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={routes.APPOINTMENTS}
        element={
          <ProtectedRoute requireAvatar>
            <AppointmentsPage />
          </ProtectedRoute>
        }
      />

      {/* 404 - Catch all */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-[#faf9f7] p-4">
            <div className="text-center">
              <h1 className="text-4xl font-serif text-[#4a3f35] mb-4">404</h1>
              <p className="text-gray-600 mb-6">Página no encontrada</p>
              <a
                href={routes.HOME}
                className="text-[#8C6F5A] hover:underline font-medium"
              >
                Volver al inicio
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
};
