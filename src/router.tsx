/**
 * Application Router (Phase 1)
 *
 * React Router configuration with all application routes.
 *
 * La V2 (src/v2) va en la raíz y la V1 en /v1 (constants/routes.ts):
 * - /v1 (HOME) - Redirects to /v1/auth or the collection based on auth state
 * - /v1/auth (PUBLIC) - Authentication page
 * - /v1/avatar-creation (PROTECTED) - Avatar creation page
 * - /v1/try-on (PROTECTED, REQUIRES AVATAR) - Main try-on page
 * - /v1/gallery (PROTECTED, REQUIRES AVATAR) - Gallery page
 * - /v1/appointments (PROTECTED, REQUIRES AVATAR) - Appointments page
 * - /v1/share/:id (PUBLIC) - Share page for viewing shared images
 * Las direcciones de antes (la V1 sin /v1, la V2 con /v2) llevan a su pantalla
 * de la V2 (components/routing/LegacyRedirect).
 *
 * En probador-sedka.crmnovias.com y probador-outlet.crmnovias.com (OwnV1Router)
 * va solo la V2: la V1 de cada una es otra web (repos ARS-BRIDAL/probador-virtual-sedka
 * y ARS-BRIDAL/probador-virtual-outlet) que el servidor sirve en /v1.
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './components/routing/ProtectedRoute.js';
import { LEGACY_V1_PATHS, LegacyShareRedirect, LegacyV1Redirect, LegacyV2Redirect } from './components/routing/LegacyRedirect.js';
import { useAuth } from './context/AuthContext.js';
import { useApp } from './context/AppContext.js';
import { routes } from './constants/routes.js';
import { brand } from './v2/lib/brand.js';

// Page imports
import { AuthPage } from './pages/AuthPage.js';
import { WelcomePage } from './pages/WelcomePage.js';
import { AvatarCreationPage } from './pages/AvatarCreationPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { BookAppointmentPage } from './pages/BookAppointmentPage.js';
import { BrideCollectionPage } from './pages/BrideCollectionPage.js';
import { GroomCollectionPage } from './pages/GroomCollectionPage.js';
import { TryOnPage } from './pages/TryOnPage.js';
import { GalleryPage } from './pages/GalleryPage.js';
import { AppointmentsPage } from './pages/AppointmentsPage.js';
import { FavoritesPage } from './pages/FavoritesPage.js';
import { SharePage } from './pages/SharePage.js';
import { CoupleTryOnPage } from './pages/CoupleTryOnPage.js';

// Probador V2 (src/v2): en la raíz, con su código y estilos aparte.
const V2App = lazy(() => import('./v2/routes.js'));

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

  // Sin nombre no hay probador: primero el wizard de datos.
  if (isAuthenticated && user && !user.name) {
    return <Navigate to={`${routes.AUTH}?step=registration`} replace />;
  }

  // Con los datos hechos, la home es la colección.
  if (isAuthenticated && user) {
    return <Navigate to={routes.COLLECTIONS_BRIDE} replace />;
  }

  return <WelcomePage />;
};

/**
 * Sedka y Outlet: una dirección de /v1 solo llega aquí al recargar dentro de su
 * V1 (el servidor sirve su entrada, /v1/, y para el resto da esta página). Se
 * vuelve a esa entrada; si es la propia entrada, su V1 no está y se va a la V2.
 */
const OwnV1: React.FC = () => {
  const { pathname } = useLocation();
  const entry = /^\/v1\/?$/.test(pathname);
  useEffect(() => {
    if (!entry) window.location.replace('/v1/');
  }, [entry]);
  return entry ? <Navigate to="/" replace /> : null;
};

const OwnV1Router: React.FC = () => (
  <Routes>
    {/* Direcciones de antes: las de su V1 sin /v1 y la V2 con /v2 */}
    {LEGACY_V1_PATHS.map((path) => (
      <Route key={path} path={path} element={<LegacyV1Redirect />} />
    ))}
    <Route path="/share/:id" element={<LegacyShareRedirect />} />
    <Route path="/v2/*" element={<LegacyV2Redirect />} />
    <Route path="/v1/*" element={<OwnV1 />} />

    <Route
      path="/*"
      element={
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
          <V2App />
        </Suspense>
      }
    />
  </Routes>
);

/**
 * AppRouter Component
 *
 * Main router configuration for the application
 */
export const AppRouter: React.FC = () => {
  if (brand.id !== 'atelier') return <OwnV1Router />;
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

      <Route
        path={routes.PROFILE}
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Require Authentication + Avatar */}
      <Route
        path={routes.TRY_ON}
        element={
          <ProtectedRoute>
            <TryOnPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={routes.GALLERY}
        element={
          <ProtectedRoute>
            <GalleryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={routes.APPOINTMENTS}
        element={
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={routes.APPOINTMENTS_NEW}
        element={
          <ProtectedRoute>
            <BookAppointmentPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={routes.COLLECTIONS_BRIDE}
        element={
          <ProtectedRoute>
            <BrideCollectionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={routes.COLLECTIONS_GROOM}
        element={
          <ProtectedRoute>
            <GroomCollectionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={routes.COUPLE}
        element={
          <ProtectedRoute>
            <CoupleTryOnPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={routes.FAVORITES}
        element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        }
      />

      {/* Direcciones de antes: la V1 sin /v1 y la V2 con /v2 */}
      {LEGACY_V1_PATHS.map((path) => (
        <Route key={path} path={path} element={<LegacyV1Redirect />} />
      ))}
      <Route path="/share/:id" element={<LegacyShareRedirect />} />
      <Route path="/v2/*" element={<LegacyV2Redirect />} />

      {/* 404 de la V1 */}
      <Route
        path={`${routes.HOME}/*`}
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

      {/* Probador V2, en la raíz (su * lleva a la portada) */}
      <Route
        path="/*"
        element={
          <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <V2App />
          </Suspense>
        }
      />
    </Routes>
  );
};
