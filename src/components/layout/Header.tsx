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
  {
    label: 'Probador',
    path: routes.TRY_ON,
    icon: (isActive: boolean) => (
      <svg
        className="w-5 h-5"
        fill={isActive ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    label: 'Galería',
    path: routes.GALLERY,
    icon: (isActive: boolean) => (
      <svg
        className="w-5 h-5"
        fill={isActive ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
  {
    label: 'Citas',
    path: routes.APPOINTMENTS,
    icon: (isActive: boolean) => (
      <svg
        className="w-5 h-5"
        fill={isActive ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

/**
 * Header Component
 */
export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { clearAppState, dressId } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  /**
   * Build navigation path with dressId if available
   */
  const buildNavPath = (path: string): string => {
    if (!dressId) return path;
    return `${path}?dressId=${dressId}`;
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
    navigate(routes.AUTH);
  };

  /**
   * Cancel logout
   */
  const cancelLogout = (): void => {
    setShowLogoutConfirm(false);
  };

  // Get current active tab
  const activeTab = navTabs.find(tab => location.pathname === tab.path);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Mobile: Show active section name */}
        <div className="sm:hidden">
          <h1 className="text-lg font-serif text-black">
            {activeTab?.label || 'Atelier de Bodas'}
          </h1>
        </div>

        {/* Desktop: Navigation Menu */}
        <nav className="hidden sm:flex items-center gap-1">
          {navTabs.map((tab) => {
            const isActive = location.pathname === tab.path;

            return (
              <a
                key={tab.path}
                href={buildNavPath(tab.path)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg
                  transition-colors font-medium text-sm
                  ${
                    isActive
                      ? 'text-black bg-gray-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                {/* Icon */}
                {tab.icon(isActive)}

                {/* Label */}
                <span>{tab.label}</span>
              </a>
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
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-40">
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

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="
                    w-full text-left px-4 py-2
                    text-sm text-red-600 hover:bg-red-50
                    transition-colors flex items-center gap-2
                  "
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
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
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
                  className="px-8 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-8 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
