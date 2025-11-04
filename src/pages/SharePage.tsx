/**
 * SharePage (Phase 2 - Simplified)
 *
 * Public share page for viewing shared try-on images.
 * This is a PUBLIC page (no authentication required).
 *
 * Features:
 * - Displays shared try-on image directly
 * - Shows link to try the dress yourself
 * - No backend calls needed (uses tryOnId from URL)
 * - Open Graph meta tags for WhatsApp/social media previews
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { envConfig } from '../config/envConfig.js';
import { routes } from '../constants/routes.js';

/**
 * SharePage Component
 */
export const SharePage: React.FC = () => {
  const { id: tryOnId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Get dressId from URL params
  const dressId = searchParams.get('dressId');

  // Fetch image URL from backend
  useEffect(() => {
    const fetchImageUrl = async () => {
      if (!tryOnId) {
        setImageError(true);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${envConfig.apiBaseUrl}/tryons/${tryOnId}/image`);

        if (!response.ok) {
          throw new Error('Failed to fetch image');
        }

        const data = await response.json() as { success: boolean; data: { imageUrl: string } };

        if (data.success && data.data?.imageUrl) {
          setImageUrl(data.data.imageUrl);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('[SharePage] Error fetching image:', error);
        setImageError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImageUrl();
  }, [tryOnId]);

  // Update Open Graph meta tags for WhatsApp/social sharing
  useEffect(() => {
    const updateMetaTags = () => {
      // OG Image - Use Atelier de Bodas logo
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', 'https://atelierdebodas.com/wp-content/uploads/2025/10/logo-atelierdebodas.webp');
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:image');
        meta.content = 'https://atelierdebodas.com/wp-content/uploads/2025/10/logo-atelierdebodas.webp';
        document.head.appendChild(meta);
      }

      // OG Title
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const title = 'Prueba Virtual - Atelier de Bodas';
      if (ogTitle) {
        ogTitle.setAttribute('content', title);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:title');
        meta.content = title;
        document.head.appendChild(meta);
      }

      // OG Description
      const ogDescription = document.querySelector('meta[property="og:description"]');
      const description = 'Mira esta prueba virtual de vestido de novia. ¡Crea tu avatar y prueba este y muchos otros vestidos!';
      if (ogDescription) {
        ogDescription.setAttribute('content', description);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:description');
        meta.content = description;
        document.head.appendChild(meta);
      }

      // OG URL
      const ogUrl = document.querySelector('meta[property="og:url"]');
      const currentUrl = window.location.href;
      if (ogUrl) {
        ogUrl.setAttribute('content', currentUrl);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:url');
        meta.content = currentUrl;
        document.head.appendChild(meta);
      }

      // Update page title
      document.title = title;
    };

    updateMetaTags();
  }, [tryOnId]);

  /**
   * Navigate to try-on page with dress ID
   */
  const handleTryItYourself = (): void => {
    if (dressId) {
      navigate(`${routes.HOME}?dressId=${dressId}`);
    } else {
      navigate(routes.HOME);
    }
  };

  // Handle image load error
  const handleImageError = (): void => {
    setImageError(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-center">
            <a
              href="https://atelierdebodas.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl font-serif text-[#000000] hover:text-[#000000] transition-colors"
            >
              Atelier de Bodas
            </a>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#000000] mx-auto mb-4" />
            <p className="text-gray-600">Cargando prueba virtual...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state - invalid tryOnId or image failed to load
  if (!tryOnId || imageError || !imageUrl) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-center">
            <a
              href="https://atelierdebodas.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl font-serif text-[#000000] hover:text-[#000000] transition-colors"
            >
              Atelier de Bodas
            </a>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Prueba virtual no encontrada
            </h2>
            <p className="text-gray-600 mb-6">
              El enlace que has seguido no es válido o la prueba virtual ya no está disponible.
            </p>
            <button
              onClick={() => navigate(routes.HOME)}
              className="w-full py-3 bg-gradient-to-br from-[#000000] to-[#1a1a1a] text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Ir al Inicio
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <a
            href="https://atelierdebodas.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl font-serif text-[#000000] hover:text-[#000000] transition-colors"
          >
            Atelier de Bodas
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full">
          {/* Image Section */}
          <div className="relative bg-gray-100 aspect-[2/3] flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Prueba Virtual"
              onError={handleImageError}
              className="w-full h-full object-contain cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setImageViewerOpen(true)}
            />

            {/* Watermark */}
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-light">
              Atelier de Bodas
            </div>

            {/* Enlarge Icon */}
            <button
              onClick={() => setImageViewerOpen(true)}
              className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-lg hover:scale-110 transition-transform"
              title="Ampliar"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                />
              </svg>
            </button>
          </div>

          {/* Info Section */}
          <div className="p-6 md:p-8 text-center space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif text-[#000000] mb-2">
                ¡Mira qué hermoso!
              </h2>
              <p className="text-gray-600 font-light">
                Esta es una prueba virtual generada con nuestra tecnología
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleTryItYourself}
              className="w-full py-4 bg-gradient-to-br from-[#000000] to-[#1a1a1a] text-white rounded-xl hover:shadow-xl transition-all font-medium text-lg flex items-center justify-center gap-3 group"
            >
              <span>Pruébalo Tú Misma</span>
              <svg
                className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>

            {/* Additional Info */}
            <div className="text-sm text-gray-500 border-t border-gray-200 pt-4">
              <p>
                Crea tu avatar y prueba este y muchos otros vestidos de manera virtual
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Image Viewer Modal */}
      {imageViewerOpen && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setImageViewerOpen(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={imageUrl}
              alt="Vista ampliada"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setImageViewerOpen(false)}
              className="absolute -top-4 -right-4 text-white p-2 bg-black/50 rounded-full hover:bg-black/80 transition-colors"
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
