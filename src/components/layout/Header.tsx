/**
 * Header Component (Phase 1)
 *
 * Top navigation header with branding and user menu.
 *
 * Features:
 * - App logo and branding
 * - User phone display (if authenticated)
 * - Logout button
 * - Sticky positioning
 * - Responsive design
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
 * Header Component
 */
export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { clearAppState } = useApp();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

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

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-serif text-[#4a3f35]">
            Atelier de Bodas
          </h1>
        </div>

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
              <div className="w-8 h-8 rounded-full bg-[#8C6F5A] flex items-center justify-center">
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
