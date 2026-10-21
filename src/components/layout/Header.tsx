/**
 * Header Component (Phase 1 - Updated)
 *
 * Top navigation header with main menu and user menu.
 *
 * Features:
 * - Main navigation tabs (Probador, Galería, Citas)
 * - User phone display (if authenticated)
 * - Logout button
 * - Active state highlighting
 * - Sticky positioning
 * - Responsive design
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useApp } from '../../context/AppContext.js';
import { routes } from '../../constants/routes.js';
import logo from '../../assets/images/logo/logo-atelier-de-bodas.webp';

/**
 * Format phone for display (e.g., +34 6** *** 123)
 * Safe to call with undefined/null values
 */
const formatPhoneForDisplay = (phone: string | null | undefined): string => {
  if (!phone) return 'Usuario';
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('+34')) {
    const last3 = cleaned.slice(-3);
    return `+34 6** *** ${last3}`;
  }
  return phone;
};

/**
 * Get user display name
 * Returns name if available, otherwise formatted phone
 */
const getUserDisplayName = (user: { name?: string | null; phone?: string | null } | null): string => {
  if (!user) return 'Usuario';
  if (user.name) return user.name;
  return formatPhoneForDisplay(user.phone);
};

/**
 * Navigation tab definition
 */
interface NavTab {
  label: string;
  path: string;
  icon: (isActive: boolean) => React.ReactNode;
}

/**
 * Navigation tabs configuration
 */
const navTabs: NavTab[] = [
  { label: 'Colección', path: routes.COLLECTIONS_BRIDE, icon: () => null },
  { label: 'Favoritos', path: routes.FAVORITES, icon: () => null },
  { label: 'Mis pruebas', path: routes.GALLERY, icon: () => null },
  { label: 'Cita', path: routes.APPOINTMENTS, icon: () => null },
];

/**
 * Header Component
 */
export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { clearAppState } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  /**
   * Build navigation path with dressId if available
   */
  const isTabActive = (path: string): boolean => {
    if (path === routes.COLLECTIONS_BRIDE) return location.pathname.startsWith('/colecciones');
    if (path === routes.APPOINTMENTS) {
      return location.pathname.startsWith('/appointments') || location.pathname.startsWith('/citas');
    }
    if (path === routes.GALLERY) return location.pathname === routes.GALLERY;
    return location.pathname === path;
  };

  const go = (path: string): void => {
    navigate(path);
  };

  /**
   * Handle logout confirmation
   */
  const handleLogoutClick = (): void => {
    setShowUserMenu(false);
    setShowLogoutConfirm(true);
  };

  /**
   * Confirm logout
   */
  const confirmLogout = (): void => {
    logout();
    clearAppState();
    setShowLogoutConfirm(false);
    navigate(routes.HOME);
  };

  /**
   * Cancel logout
   */
  const cancelLogout = (): void => {
    setShowLogoutConfirm(false);
  };

  const embeddedFrame = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className={`container mx-auto h-16 flex items-center justify-between gap-3 ${
        embeddedFrame ? 'pl-4 pr-44' : 'px-4'
      }`}>
        <button type="button" onClick={() => go(routes.COLLECTIONS_BRIDE)} className="shrink-0" aria-label="Colección">
          <img src={logo} alt="Atelier de Bodas" className="h-8 w-auto object-contain" />
        </button>

        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navTabs.map((tab) => {
            const isActive = isTabActive(tab.path);
            return (
              <button
                key={tab.path}
                type="button"
                onClick={() => go(tab.path)}
                className={`px-3 lg:px-4 py-2 rounded-lg transition-colors font-medium text-sm whitespace-nowrap ${
                  isActive ? 'text-black bg-gray-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* User Menu (if authenticated) */}
        {isAuthenticated && user && (
          <div className="relative">
            {/* User Info Button */}
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="
                flex items-center space-x-2 px-3 py-2 rounded-lg
                hover:bg-gray-100 transition-colors
              "
              aria-label="Menú de usuario"
            >
              {/* User Icon */}
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>

              {/* User Name or Phone */}
              <span className="text-sm text-gray-700 hidden sm:block">
                {getUserDisplayName(user)}
              </span>

              {/* Dropdown Arrow */}
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  showUserMenu ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-40">
                {/* User Info */}
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="text-sm text-gray-900">{user.phone}</p>
                  {user.name && (
                    <>
                      <p className="text-xs text-gray-500 mt-2">Nombre</p>
                      <p className="text-sm text-gray-900">{user.name}</p>
                    </>
                  )}
                </div>

                {/* Mi perfil — datos personales + boda */}
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate(routes.PROFILE);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Mi perfil
                </button>

                {/* Regenerar avatar — atajo directo al flujo de generación */}
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate(`${routes.AVATAR_CREATION}?regenerate=true`);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                    <path d="M3 21v-5h5" />
                  </svg>
                  Regenerar avatar
                </button>

                <div className="my-1 border-t border-gray-200" />

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            )}

            {/* Overlay to close menu */}
            {showUserMenu && (
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowUserMenu(false)}
              />
            )}
          </div>
        )}

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-sm w-full mx-4">
              {/* Icon */}
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-[#000000] mb-2">
                ¿Cerrar sesión?
              </h2>

              {/* Message */}
              <p className="text-gray-600 mb-6">
                Se eliminarán todos tus datos locales. Tendrás que volver a iniciar sesión para continuar.
              </p>

              {/* Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={cancelLogout}
                  className="px-8 py-2 rounded-lg bg-white text-[#000000] border-2 border-[#333333] hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-8 py-2 rounded-lg bg-[#333333] text-white hover:bg-[#1a1a1a] transition-colors font-medium"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
        <div className="flex h-16">
          {navTabs.map((tab) => {
            const isActive = isTabActive(tab.path);
            return (
              <button
                key={tab.path}
                type="button"
                onClick={() => go(tab.path)}
                className={`flex-1 text-[11px] font-medium ${isActive ? 'text-black' : 'text-gray-500'}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
