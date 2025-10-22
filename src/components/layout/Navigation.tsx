/**
 * Navigation Component (Phase 1)
 *
 * Bottom tab navigation bar for main app sections.
 *
 * Features:
 * - Three tabs: Probador (Try-On), Galería (Gallery), Citas (Appointments)
 * - Active state highlighting
 * - Icons for each tab
 * - React Router navigation
 * - Sticky bottom positioning
 * - Mobile-optimized
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { routes } from '../../constants/routes.js';

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
        className="w-6 h-6"
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
        className="w-6 h-6"
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
        className="w-6 h-6"
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
 * Navigation Component
 */
export const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navTabs.map((tab) => {
            const isActive = location.pathname === tab.path;

            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={`
                  flex flex-col items-center justify-center
                  flex-1 h-full
                  transition-colors
                  ${
                    isActive
                      ? 'text-[#8C6F5A]'
                      : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                {/* Icon */}
                <div className="mb-1">{tab.icon(isActive)}</div>

                {/* Label */}
                <span className="text-xs font-medium">{tab.label}</span>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8C6F5A]" />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
