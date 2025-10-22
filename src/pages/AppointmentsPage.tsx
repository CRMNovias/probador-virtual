/**
 * AppointmentsPage (Phase 1 - Placeholder)
 *
 * Appointments management page for viewing and booking appointments.
 *
 * PHASE 1: Basic layout with Header and Navigation
 * PHASE 2: Full implementation with appointment list and booking
 */

import React from 'react';
import { Header } from '../components/layout/Header.js';
import { Navigation } from '../components/layout/Navigation.js';

/**
 * AppointmentsPage Component
 */
export const AppointmentsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f7]">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-[#4a3f35] mb-2">
            Mis Citas
          </h1>
          <p className="text-gray-600">
            Gestiona tus citas en el atelier
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            {/* Calendar Icon Placeholder */}
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
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
                Lista de citas próximas
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
                Historial de citas pasadas
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
                Formulario de reserva de cita
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
                Cancelación y reprogramación
              </li>
            </ul>
          </div>
        </div>

        {/* Info Box */}
        <div className="max-w-4xl mx-auto mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota de Desarrollo:</strong> Esta es la página de gestión de
            citas. En Phase 2, permitirá ver, reservar y gestionar citas en el
            atelier.
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
};
