/**
 * SharePage (Phase 1 - Placeholder)
 *
 * Public share page for viewing shared try-on images.
 * This is a PUBLIC page (no authentication required).
 *
 * PHASE 1: Basic layout
 * PHASE 2: Full implementation with image display and sharing functionality
 */

import React from 'react';
import { useParams } from 'react-router-dom';

/**
 * SharePage Component
 */
export const SharePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f7]">
      {/* Simple Header (no user menu since it's public) */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <h1 className="text-2xl font-serif text-[#4a3f35]">
            Atelier de Bodas
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-[#4a3f35] mb-2">
            Prueba Compartida
          </h1>
          <p className="text-gray-600">
            Visualiza la prueba virtual compartida
          </p>
        </div>

        {/* Share ID Info */}
        {id && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>ID de Compartición:</strong> {id}
            </p>
          </div>
        )}

        {/* Placeholder Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            {/* Share Icon Placeholder */}
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-medium text-gray-900 mb-4">
              Funcionalidad Pendiente
            </h2>

            <p className="text-gray-600 mb-6">
              Esta funcionalidad se implementará en la Fase 2 del proyecto.
              <br />
              Incluirá:
            </p>

            <ul className="text-left text-gray-600 space-y-2 mb-8 max-w-md mx-auto">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-[#8C6F5A] mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Visualización de imagen compartida
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-[#8C6F5A] mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Información del vestido
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-[#8C6F5A] mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Botón para probar el vestido
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-[#8C6F5A] mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Acceso público sin autenticación
              </li>
            </ul>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota de Desarrollo:</strong> Esta es la página pública para
            visualizar pruebas virtuales compartidas. No requiere autenticación
            y se implementará en Phase 2.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500">
        <p>© 2024 Atelier de Bodas. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};
