/**
 * GalleryPage (Phase 2 - Complete Implementation)
 *
 * Gallery view showing all generated try-on images grouped by dress.
 * Features: Accordion layout, image grid, modals (viewer, delete, share)
 */

import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header.js';
import { Navigation } from '../components/layout/Navigation.js';
import { ShareModal } from '../components/shared/ShareModal.js';
import { getUserTryOns, deleteTryOn } from '../services/tryOnService.js';
import type { TryOnCategory } from '../types/index.js';

// Icons
const ChevronDownIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const MaximizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
  </svg>
);

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const AlertTriangleIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

/**
 * GalleryPage Component
 */
export const GalleryPage: React.FC = () => {
  const [tryOnsByDress, setTryOnsByDress] = useState<TryOnCategory[]>([]);
  const [expandedDressId, setExpandedDressId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; url: string } | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedTryOnId, setSelectedTryOnId] = useState<string>('');
  const [selectedDressId, setSelectedDressId] = useState<string>('');

  useEffect(() => {
    loadTryOns();
  }, []);

  const loadTryOns = async () => {
    try {
      const response = await getUserTryOns();
      console.log('[GalleryPage] Try-ons response:', response);

      // Backend returns: { success, data: { total, tryOnsByDress: [...] } }
      // Extract the array from the nested structure
      const data = (response as any).data?.tryOnsByDress || response;

      console.log('[GalleryPage] Extracted try-ons data:', data);

      // Ensure it's an array
      if (Array.isArray(data)) {
        setTryOnsByDress(data);
      } else {
        console.error('[GalleryPage] Expected array but got:', typeof data, data);
        setTryOnsByDress([]);
      }
    } catch (err) {
      console.error('[GalleryPage] Error loading try-ons:', err);
      setTryOnsByDress([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (dressId: string) => {
    setExpandedDressId(prev => (prev === dressId ? null : dressId));
  };

  const handleDelete = (e: React.MouseEvent, id: string, url: string) => {
    e.stopPropagation();
    setDeleteConfirm({ id, url });
  };

  const handleShare = (e: React.MouseEvent, tryOnId: string, dressId: string) => {
    e.stopPropagation();
    console.log('[GalleryPage] Share button clicked:', { tryOnId, dressId });
    setSelectedTryOnId(tryOnId);
    setSelectedDressId(dressId);
    setShareModalOpen(true);
    console.log('[GalleryPage] Share modal state:', { shareModalOpen: true, selectedTryOnId: tryOnId, selectedDressId: dressId });
  };

  const handleCloseShareModal = () => {
    console.log('[GalleryPage] Closing share modal');
    setShareModalOpen(false);
    // Clear selected IDs when modal closes
    setSelectedTryOnId('');
    setSelectedDressId('');
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteTryOn(deleteConfirm.id);
      await loadTryOns();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting try-on:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F7F5]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Cargando galería...</p>
        </main>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F5]">
      <Header />

      <main className="flex-1 pb-24 p-4 md:p-8">
        <div className="w-full max-w-5xl mx-auto">
          <h1 className="text-4xl font-serif text-[#4a3f35] mb-8 text-center">Mi Galería</h1>

          {tryOnsByDress.length === 0 ? (
            <p className="text-center text-gray-500 font-light mt-12">
              Aún no has generado ninguna prueba. ¡Ve al probador para empezar!
            </p>
          ) : (
            <div className="space-y-4">
              {tryOnsByDress.map(category => {
                const isExpanded = expandedDressId === category.dressId;
                return (
                  <div
                    key={category.dressId}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() => toggleExpand(category.dressId)}
                      className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <h2 className="text-xl font-serif text-[#4a3f35]">
                          Vestido ID: {category.dressId}
                        </h2>
                        <p className="text-sm text-gray-500 font-light">
                          {category.tryOns.length} prueba(s) generada(s)
                        </p>
                      </div>
                      <ChevronDownIcon
                        className={`transform transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Accordion Content - Grid de Imágenes */}
                    {isExpanded && (
                      <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {category.tryOns.map(tryOn => (
                            <div
                              key={tryOn.id}
                              className="group relative rounded-lg overflow-hidden aspect-[2/3] cursor-pointer"
                              onClick={() => setViewerImage(tryOn.imageUrl)}
                            >
                              <img
                                src={tryOn.imageUrl}
                                alt={`Try-on ${tryOn.id}`}
                                className="w-full h-full object-cover"
                              />

                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setViewerImage(tryOn.imageUrl);
                                  }}
                                  className="p-2 bg-white/80 rounded-full text-gray-800 hover:scale-110 transition-transform"
                                  title="Ampliar"
                                >
                                  <MaximizeIcon />
                                </button>
                                <button
                                  onClick={e => handleShare(e, tryOn.id, category.dressId)}
                                  className="p-2 bg-white/80 rounded-full hover:scale-110 transition-transform text-gray-800"
                                  title="Compartir"
                                >
                                  <ShareIcon />
                                </button>
                                <button
                                  onClick={e => handleDelete(e, tryOn.id, tryOn.imageUrl)}
                                  className="p-2 bg-white/80 rounded-full text-red-500 hover:scale-110 transition-transform"
                                  title="Eliminar"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Navigation />

      {/* Image Viewer Modal */}
      {viewerImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setViewerImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={viewerImage}
              alt="Vista ampliada"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setViewerImage(null)}
              className="absolute -top-4 -right-4 text-white p-2 bg-black/50 rounded-full hover:bg-black/80"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-sm w-full mx-4">
            <AlertTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">¿Confirmas la eliminación?</h2>
            <p className="text-gray-600 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-8 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-8 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        tryOnId={selectedTryOnId}
        dressId={selectedDressId}
        onClose={handleCloseShareModal}
      />
    </div>
  );
};
