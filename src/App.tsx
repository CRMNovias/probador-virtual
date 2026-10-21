/**
 * App Component (Phase 1)
 *
 * Root application component that wraps the entire app with:
 * - AuthProvider for authentication state
 * - AppRouter for routing
 *
 * This component initializes the application and provides global context.
 */

import React from 'react';
import { AuthProvider } from './context/AuthContext.js';
import { AppRouter } from './router.js';
import { FullscreenButton } from './components/shared/FullscreenButton.js';

/**
 * App Component
 */
export const App: React.FC = () => {
  return (
    <AuthProvider>
      <FullscreenButton />
      <AppRouter />
    </AuthProvider>
  );
};

export default App;
