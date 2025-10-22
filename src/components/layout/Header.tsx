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
 */
const formatPhoneForDisplay = (phone: string): string => {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('+34')) {
    const last3 = cleaned.slice(-3);
    return `+34 6** *** ${last3}`;
  }
  return phone;
};

/**
 * Header Component
 */
export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { clearAppState } = useApp();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  /**
   * Handle logout
   */
  const handleLogout = (): void => {
    logout();
    clearAppState();
    navigate(routes.AUTH);
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

              {/* Phone Number */}
              <span className="text-sm text-gray-700 hidden sm:block">
                {formatPhoneForDisplay(user.phone)}
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
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
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
                  onClick={handleLogout}
                  className="
                    w-full text-left px-4 py-2
                    text-sm text-red-600 hover:bg-red-50
                    transition-colors
                  "
                >
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
      </div>
    </header>
  );
};
