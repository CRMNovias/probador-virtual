/**
 * Application Entry Point (Phase 1)
 *
 * Initializes the React application with all root-level providers:
 * - StrictMode for development checks
 * - BrowserRouter for routing
 * - AppProvider for global app state (dressId, avatar)
 * - App component (which includes AuthProvider)
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext.js';
import './styles/globals.css';
import App from './App.js';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>
);
