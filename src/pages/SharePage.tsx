/**
 * SharePage (Phase 2 - Complete Implementation)
 *
 * Public share page for viewing shared try-on images.
 * This is a PUBLIC page (no authentication required).
 *
 * Features:
 * - Displays shared try-on image
 * - Shows dress information (if available)
 * - Provides link to try the dress yourself
 * - Handles loading and error states
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSharedTryOn } from '../services/tryOnService.js';
import { Loader } from '../components/shared/Loader.js';
import { routes } from '../constants/routes.js';
import type { SharedTryOn } from '../types/index.js';

/**
 * SharePage Component
 */
export const SharePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sharedTryOn, setSharedTryOn] = useState<SharedTryOn | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);

  /**
   * Fetch shared try-on data on mount
   */
  useEffect(() => {
    const fetchSharedTryOn = async () => {
      if (!id) {
        setError('ID de compartición no válido');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getSharedTryOn(id);
        setSharedTryOn(data);
      } catch (err) {
        console.error('[SharePage] Error fetching shared try-on:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo cargar la prueba virtual compartida'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedTryOn();
  }, [id]);

  /**
   * Navigate to try-on page with dress ID
   */
  const handleTryItYourself = (): void => {
    if (sharedTryOn?.dressId) {
      navigate(`${routes.HOME}?dressId=${sharedTryOn.dressId}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F5F3EF] to-[#E8E4DD]">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-center">
            <h1 className="text-2xl font-serif text-[#2C2419]">Atelier de Bodas</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <Loader text="Cargando prueba virtual..." />
        </main>
      </div>
    );
  }

  // Error state
  if (error || !sharedTryOn) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F5F3EF] to-[#E8E4DD]">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-center">
            <h1 className="text-2xl font-serif text-[#2C2419]">Atelier de Bodas</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-serif text-[#2C2419] mb-3">
              Error al Cargar
            </h2>
            <p className="text-gray-600 mb-6">{error || 'Prueba virtual no encontrada'}</p>
            <button
              onClick={() => navigate(routes.HOME)}
              className="px-6 py-3 bg-gradient-to-br from-[#8C6F5A] to-[#6B5647] text-white rounded-xl hover:shadow-lg transition-all"
            >
              Ir al Inicio
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Success state - display shared try-on
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F5F3EF] to-[#E8E4DD]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <h1 className="text-2xl font-serif text-[#2C2419]">Atelier de Bodas</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-[#2C2419] mb-3">
            Prueba Virtual Compartida
          </h1>
          <p className="text-lg text-[#6B5647]">
            Visualiza cómo se vería este vestido de novia
          </p>
        </div>

        {/* Image Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden mb-8 border border-white/40">
          <div className="relative">
            {/* Try-On Image */}
            <div
              className="relative cursor-pointer group"
              onClick={() => setImageViewerOpen(true)}
            >
              <img
                src={sharedTryOn.imageUrl}
                alt="Prueba virtual compartida"
                className="w-full h-auto max-h-[70vh] object-contain bg-gradient-to-br from-[#F5F3EF] to-[#E8E4DD]"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-4">
                  <svg
                    className="w-8 h-8 text-[#8C6F5A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Watermark */}
            <div className="absolute bottom-4 left-4 text-xs font-serif text-[#2C2419] bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              Atelier de Bodas
            </div>
          </div>

          {/* Info Section */}
          <div className="p-6">
            {sharedTryOn.dressName && (
              <h2 className="text-2xl font-serif text-[#2C2419] mb-2">
                {sharedTryOn.dressName}
              </h2>
            )}
            <p className="text-gray-600 mb-4">
              Compartido el {new Date(sharedTryOn.sharedAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            {/* CTA Button */}
            <button
              onClick={handleTryItYourself}
              className="w-full py-4 bg-gradient-to-br from-[#8C6F5A] to-[#6B5647] text-white rounded-xl hover:shadow-2xl transition-all duration-300 font-serif text-lg transform hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
              <span>Pruébalo Tú Misma</span>
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg
              className="w-6 h-6 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-lg font-semibold text-blue-900">
              ¿Te gustaría probártelo?
            </h3>
          </div>
          <p className="text-blue-800">
            Sube tu foto y visualiza cómo te quedaría este vestido de novia con
            nuestra tecnología de prueba virtual.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500 bg-white/40 backdrop-blur-sm">
        <p>© 2025 Atelier de Bodas. Todos los derechos reservados.</p>
      </footer>

      {/* Image Viewer Modal */}
      {imageViewerOpen && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setImageViewerOpen(false)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh]">
            <img
              src={sharedTryOn.imageUrl}
              alt="Prueba virtual ampliada"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setImageViewerOpen(false)}
              className="absolute -top-12 right-0 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
