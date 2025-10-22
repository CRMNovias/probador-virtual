/**
 * TryOnPage (Phase 1 - Placeholder)
 *
 * Main try-on screen where users can virtually try on wedding dresses.
 *
 * PHASE 1: Basic layout with Header and Navigation
 * PHASE 2: Full implementation with dress selection, pose selection, and try-on generation
 */

import React from 'react';
import { Header } from '../components/layout/Header.js';
import { Navigation } from '../components/layout/Navigation.js';
import { useApp } from '../context/AppContext.js';

/**
 * TryOnPage Component
 */
export const TryOnPage: React.FC = () => {
  const { dressId, isDressIdMissing } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f7]">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-[#4a3f35] mb-2">
            Probador Virtual
          </h1>
          <p className="text-gray-600">
            Prueba vestidos virtualmente con tu avatar
          </p>
        </div>

        {/* DressId Info (if available) */}
        {dressId && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Vestido Seleccionado:</strong> {dressId}
            </p>
            <p className="text-xs text-green-600 mt-1">
              (El ID del vestido viene del catálogo externo vía URL)
            </p>
          </div>
        )}

        {/* Missing DressId Warning */}
        {isDressIdMissing && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Atención:</strong> No se ha proporcionado un ID de vestido en la URL.
              <br />
              Para usar esta aplicación, debes acceder desde el catálogo del sitio web
              con un parámetro ?dressId=xxx
            </p>
          </div>
        )}

        {/* Placeholder Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            {/* Try-On Icon Placeholder */}
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
                Vista del avatar con el vestido seleccionado
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
                Selector de poses (frontal, lateral, espalda)
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
                Generación de prueba virtual con IA
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
                Opciones de compartir, eliminar y ampliar
              </li>
            </ul>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota de Desarrollo:</strong> Esta es la pantalla principal del
            probador virtual. En Phase 2, los usuarios podrán ver su avatar con
            el vestido seleccionado, cambiar poses y generar nuevas variaciones.
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
};
