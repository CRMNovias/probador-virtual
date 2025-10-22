/**
 * AvatarCreationPage (Phase 1 - Placeholder)
 *
 * Avatar creation flow page where users upload passport-style photos
 * and generate their full-body avatar.
 *
 * PHASE 1: Basic layout and structure
 * PHASE 2: Full implementation with photo upload and AI generation
 */

import React from 'react';
import { Header } from '../components/layout/Header.js';
import { Button } from '../components/shared/Button.js';

/**
 * AvatarCreationPage Component
 */
export const AvatarCreationPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f7]">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-[#4a3f35] mb-2">
            Crear Avatar
          </h1>
          <p className="text-gray-600">
            Sube una foto tipo pasaporte para generar tu avatar de cuerpo completo
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            {/* Upload Icon Placeholder */}
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
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
                Subida de foto tipo pasaporte
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
                Generación de avatar de cuerpo completo con IA
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
                Vista previa del avatar generado
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
                Opción de regenerar avatar
              </li>
            </ul>

            <Button variant="primary" size="lg" disabled>
              Próximamente
            </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota de Desarrollo:</strong> Esta es la página de creación
            de avatar. En Phase 2, los usuarios podrán subir una foto y generar
            su avatar personalizado para probar vestidos virtualmente.
          </p>
        </div>
      </main>
    </div>
  );
};
