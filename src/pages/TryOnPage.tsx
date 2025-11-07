/**
 * TryOnPage (Phase 2 - Complete Implementation)
 *
 * Main try-on screen where users can virtually try on wedding dresses with different poses.
 * Layout: Grid 2 columns - Canvas (left) + Controls (right)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header.js';
import { Loader } from '../components/shared/Loader.js';
import { ShareModal } from '../components/shared/ShareModal.js';
import { WatermarkedImage } from '../components/shared/WatermarkedImage.js';
import { useApp } from '../context/AppContext.js';
import { getAvatar, deleteAvatar } from '../services/avatarService.js';
import { generateTryOn, deleteTryOn } from '../services/tryOnService.js';
import { downloadImage, generateTryOnFilename } from '../utils/downloadImage.js';
import { routes } from '../constants/routes.js';
import { generateTryOnPrompt, POSE_PROMPTS } from '../constants/promptTemplates.js';
import type { Avatar, GenerateTryOnRequest } from '../types/index.js';

// Import pose images
import pose1Img from '../assets/images/poses/pose1.jpg';
import pose2Img from '../assets/images/poses/pose2.jpg';
import pose3Img from '../assets/images/poses/pose3.jpg';

// Icons
const SparklesIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 2L9.8 8.6L2 9.4L7.4 14.4L6.2 21.8L12 18.2L17.8 21.8L16.6 14.4L22 9.4L14.2 8.6L12 2z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const UploadIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
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

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

// 3 Poses predefinidas (frontend) - UI display configuration
const POSES = [
  {
    id: 'pose1' as const,
    name: POSE_PROMPTS.pose1.name,
    description: POSE_PROMPTS.pose1.description,
    image: pose1Img,
  },
  {
    id: 'pose2' as const,
    name: POSE_PROMPTS.pose2.name,
    description: POSE_PROMPTS.pose2.description,
    image: pose2Img,
  },
  {
    id: 'pose3' as const,
    name: POSE_PROMPTS.pose3.name,
    description: POSE_PROMPTS.pose3.description,
    image: pose3Img,
  },
];

interface GeneratedTryOn {
  id: string;
  url: string;
  poseId: string;
}

/**
 * TryOnPage Component
 */
export const TryOnPage: React.FC = () => {
  const navigate = useNavigate();
  const { dressId, dressName } = useApp();

  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [selectedPoseId, setSelectedPoseId] = useState(POSES[0]?.id || 'pose1');
  const [generatedTryOn, setGeneratedTryOn] = useState<GeneratedTryOn | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showDeleteAvatarConfirm, setShowDeleteAvatarConfirm] = useState(false);

  // Load avatar on mount
  useEffect(() => {
    const loadAvatar = async () => {
      setIsLoadingAvatar(true);
      setAvatarError(null);
      try {
        const avatarData = await getAvatar();
        console.log('[TryOnPage] Avatar loaded successfully:', avatarData);
        setAvatar(avatarData);
      } catch (err) {
        console.error('[TryOnPage] Error loading avatar:', err);
        // Set error message for user feedback
        setAvatarError('No se pudo cargar tu avatar. Es posible que aún no hayas creado uno o que haya un problema con el servidor.');
      } finally {
        setIsLoadingAvatar(false);
      }
    };
    loadAvatar();
  }, []);

  // Check dressId
  if (!dressId) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-8 max-w-md text-center shadow-lg">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#000000] mb-3">Error: Vestido no seleccionado</h2>
            <p className="text-gray-600 leading-relaxed">
              Esta aplicación debe accederse desde el catálogo con un parámetro ?dressId=xxx
            </p>
          </div>
        </main>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!dressId || isLoading) return;

    const selectedPose = POSES.find(p => p.id === selectedPoseId);
    if (!selectedPose) return;

    setError(null);
    setIsLoading(true);
    setLoadingMessage('Generando tu prueba virtual...');

    try {
      // Generate comprehensive AI prompt using professional template
      const fullPrompt = generateTryOnPrompt(selectedPose.id, dressId);

      console.log('[TryOnPage] Generating try-on with:', {
        dressId,
        poseId: selectedPose.id,
        poseName: selectedPose.name,
        promptLength: fullPrompt.length,
        promptPreview: fullPrompt.substring(0, 100) + '...'
      });

      const request: GenerateTryOnRequest = {
        dressId,
        prompt: fullPrompt,
      };

      console.log('[TryOnPage] Full prompt being sent to backend:', fullPrompt);

      const response = await generateTryOn(request);

      console.log('[TryOnPage] Try-on generated successfully:', {
        tryOnId: response.data.id,
        imageUrl: response.data.imageUrl,
        thumbnailUrl: response.data.thumbnailUrl
      });

      setGeneratedTryOn({
        id: response.data.id,
        url: response.data.imageUrl,
        poseId: selectedPoseId,
      });
    } catch (err: any) {
      console.error('[TryOnPage] Error generating try-on:', err);

      // Provide user-friendly error messages
      let errorMessage = 'Error al generar prueba virtual';

      // Check for AI processing rejection
      if (err.response?.data?.message === 'Error en procesamiento IA') {
        errorMessage = 'La IA no pudo procesar esta imagen. Por favor, intenta regenerar tu avatar o inténtalo más tarde.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err.response?.status === 500) {
        errorMessage = 'Hubo un problema al generar la prueba virtual. Por favor, intenta regenerar tu avatar o inténtalo más tarde.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleDelete = async () => {
    if (!generatedTryOn || !window.confirm('¿Confirmas la eliminación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteTryOn(generatedTryOn.id);
      setGeneratedTryOn(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleShare = () => {
    if (!generatedTryOn) return;
    setShareModalOpen(true);
  };

  const handleRegenerateAvatar = () => {
    const params = new URLSearchParams();
    if (dressId) params.append('dressId', dressId);
    params.append('regenerate', 'true');
    navigate(`${routes.AVATAR_CREATION}?${params.toString()}`);
  };

  const handleChangePhoto = () => {
    navigate(routes.AVATAR_CREATION + (dressId ? `?dressId=${dressId}` : ''));
  };

  const handleDeleteAvatarClick = () => {
    setShowDeleteAvatarConfirm(true);
  };

  const confirmDeleteAvatar = async () => {
    try {
      console.log('[TryOnPage] Deleting avatar...');
      await deleteAvatar();
      console.log('[TryOnPage] Avatar deleted successfully');

      // Clear avatar from state and context
      setAvatar(null);

      // Clear any generated try-on
      setGeneratedTryOn(null);

      // Close confirmation modal
      setShowDeleteAvatarConfirm(false);

      // Navigate to avatar creation page
      const params = new URLSearchParams();
      if (dressId) params.append('dressId', dressId);
      navigate(`${routes.AVATAR_CREATION}?${params.toString()}`);
    } catch (err) {
      console.error('[TryOnPage] Error deleting avatar:', err);
      setShowDeleteAvatarConfirm(false);
      setAvatarError('Error al eliminar el avatar. Por favor, inténtalo de nuevo.');
    }
  };

  const cancelDeleteAvatar = () => {
    setShowDeleteAvatarConfirm(false);
  };

  const handleDownloadTryOn = async () => {
    if (!generatedTryOn) return;
    try {
      const filename = generateTryOnFilename(generatedTryOn.id, dressId || '');
      await downloadImage(generatedTryOn.url, filename);
      console.log('[TryOnPage] Try-on downloaded successfully:', filename);
    } catch (error) {
      console.error('[TryOnPage] Download failed:', error);
      alert('Error al descargar la imagen. Por favor, inténtalo de nuevo.');
    }
  };

  // Handler for downloading avatar (currently not used in UI, reserved for future feature)
  // const handleDownloadAvatar = async () => {
  //   if (!avatar?.imageUrl) return;
  //   try {
  //     const filename = generateAvatarFilename();
  //     await downloadImage(avatar.imageUrl, filename);
  //     console.log('[TryOnPage] Avatar downloaded successfully:', filename);
  //   } catch (error) {
  //     console.error('[TryOnPage] Avatar download failed:', error);
  //     alert('Error al descargar el avatar. Por favor, inténtalo de nuevo.');
  //   }
  // };

  const handleViewAvatar = () => {
    setViewerImage(avatar?.imageUrl || null);
  };

  const displayImageUrl = generatedTryOn ? generatedTryOn.url : avatar?.imageUrl;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F5F3EF] to-[#E8E4DD]">
      <Header />

      <main className="flex-1 pb-24">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 p-4 md:p-8 h-full">
          {/* Columna Izquierda: Canvas - order-3 en móvil, order-1 en desktop */}
          <div className="relative w-full h-[60vh] lg:h-full bg-white rounded-2xl shadow-xl flex items-center justify-center overflow-hidden border border-white/40 backdrop-blur-sm order-3 lg:order-1">
            {isLoading && <Loader text={loadingMessage} />}

            {!isLoading && avatarError && (
              <div className="text-center p-8 max-w-md">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-[#000000] opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif text-[#000000] mb-2">Error al cargar avatar</h3>
                <p className="text-sm text-[#1a1a1a] mb-6 leading-relaxed">{avatarError}</p>
                <button
                  onClick={handleChangePhoto}
                  className="bg-[#333333] text-white px-8 py-3 rounded-xl hover:shadow-xl hover:bg-[#1a1a1a] transition-all duration-300 shadow-lg"
                >
                  Crear Avatar
                </button>
              </div>
            )}

            {!isLoading && !avatarError && displayImageUrl && (
              <>
                <WatermarkedImage
                  src={displayImageUrl}
                  alt="Virtual Try-On"
                  className="w-full h-full cursor-pointer"
                  onClick={() => setViewerImage(displayImageUrl)}
                />

                {/* Action Buttons (solo si hay try-on generada) */}
                {generatedTryOn && (
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button
                      onClick={() => setViewerImage(displayImageUrl)}
                      className="p-3 bg-white/80 rounded-full text-gray-800 shadow-lg hover:scale-110 transition-transform"
                      title="Ampliar"
                    >
                      <MaximizeIcon />
                    </button>
                    <button
                      onClick={handleDownloadTryOn}
                      className="p-3 bg-white/80 rounded-full text-gray-800 shadow-lg hover:scale-110 transition-transform"
                      title="Descargar"
                    >
                      <DownloadIcon />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-3 bg-white/80 rounded-full shadow-lg hover:scale-110 transition-transform text-gray-800 hover:bg-white"
                      title="Compartir"
                    >
                      <ShareIcon />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-3 bg-white/80 rounded-full text-red-500 shadow-lg hover:scale-110 transition-transform"
                      title="Eliminar"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                )}
              </>
            )}

            {!isLoading && !avatarError && isLoadingAvatar && (
              <div className="text-center text-gray-400">
                <Loader text="Cargando avatar..." />
              </div>
            )}

            {!isLoading && !avatarError && !isLoadingAvatar && !displayImageUrl && (
              <div className="text-center text-gray-400">
                <p>No hay avatar disponible</p>
              </div>
            )}
          </div>

          {/* Columna Derecha: Controles - order-1 en móvil (arriba), order-2 en desktop */}
          <div className="flex flex-col gap-6 order-1 lg:order-2">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Card: Prenda Seleccionada */}
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/40">
              <h2 className="text-2xl font-serif text-[#000000] mb-3">Prenda Seleccionada</h2>
              <p className="text-lg text-[#1a1a1a] font-light text-center">
                {dressName || `ID: ${dressId}`}
              </p>
            </div>

            {/* Card: Tu Avatar */}
            <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/40">
              <h3 className="text-lg font-serif text-[#000000] mb-3">Tu Avatar</h3>
              <div className="flex gap-2 flex-wrap">
                {generatedTryOn && (
                  <button
                    onClick={handleViewAvatar}
                    className="flex-1 text-sm flex items-center justify-center gap-2 bg-white/80 text-[#000000] py-2.5 px-3 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200 border border-[#000000]/20"
                    title="Ver Avatar"
                  >
                    <EyeIcon /> Ver Avatar
                  </button>
                )}
                <button
                  onClick={handleRegenerateAvatar}
                  className="flex-1 text-sm flex items-center justify-center gap-2 bg-[#333333] text-white py-2.5 px-3 rounded-xl hover:shadow-lg hover:bg-[#1a1a1a] transition-all duration-200"
                >
                  <SparklesIcon className="w-4 h-4" /> Regenerar
                </button>
                <button
                  onClick={handleChangePhoto}
                  className="flex-1 text-sm flex items-center justify-center gap-2 bg-white/80 text-[#000000] py-2.5 px-3 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200 border border-[#000000]/20"
                >
                  <UploadIcon className="w-4 h-4" /> Cambiar Foto
                </button>
                <button
                  onClick={handleDeleteAvatarClick}
                  className="flex-1 text-sm flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 px-3 rounded-xl hover:bg-red-700 hover:shadow-lg transition-all duration-200"
                  title="Eliminar avatar"
                >
                  <TrashIcon /> Eliminar
                </button>
              </div>
            </div>

            {/* Card: Elige una pose */}
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/40">
              <h3 className="text-xl font-serif text-[#000000] mb-4">Elige una pose</h3>
              <div className="flex justify-center md:justify-start gap-4">
                {POSES.map(pose => (
                  <button
                    key={pose.id}
                    onClick={() => setSelectedPoseId(pose.id)}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                      selectedPoseId === pose.id
                        ? 'border-[#000000] ring-2 ring-[#000000]/20 bg-white shadow-md scale-105'
                        : 'border-white/40 hover:border-[#000000]/40 bg-white/40 hover:bg-white/60'
                    }`}
                  >
                    {/* Pose Image Container */}
                    <div className={`w-20 h-28 rounded-lg mb-2 overflow-hidden relative transition-colors ${
                      selectedPoseId === pose.id
                        ? 'ring-2 ring-[#000000]'
                        : ''
                    }`}>
                      {pose.image ? (
                        <img
                          src={pose.image}
                          alt={pose.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-[#1a1a1a] p-2 text-center font-medium bg-gradient-to-br from-[#D4C8BE] to-[#B8ACA0]">
                          {pose.name}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-[#000000] font-medium">{pose.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generar Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-[#333333] text-white py-5 rounded-2xl hover:shadow-2xl hover:bg-[#1a1a1a] transition-all duration-300 shadow-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SparklesIcon className="w-6 h-6" />
              <span className="font-serif">Generar Prueba Virtual</span>
            </button>
          </div>
        </div>
      </main>

      {/* Image Viewer Modal */}
      {viewerImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 overflow-auto"
          onClick={() => setViewerImage(null)}
        >
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="relative">
              <WatermarkedImage
                src={viewerImage}
                alt="Vista ampliada"
                className="max-w-full h-auto rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewerImage(null);
                }}
                className="fixed top-4 right-4 text-white p-3 bg-black/50 rounded-full hover:bg-black/80 z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {generatedTryOn && dressId && (
        <ShareModal
          isOpen={shareModalOpen}
          tryOnId={generatedTryOn.id}
          dressId={dressId}
          onClose={() => setShareModalOpen(false)}
        />
      )}

      {/* Delete Avatar Confirmation Modal */}
      {showDeleteAvatarConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-sm w-full mx-4">
            {/* Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-[#000000] mb-2">
              ¿Eliminar avatar?
            </h2>

            {/* Message */}
            <p className="text-gray-600 mb-6">
              Se eliminará tu avatar actual y tendrás que crear uno nuevo. Esta acción no se puede deshacer.
            </p>

            {/* Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelDeleteAvatar}
                className="px-8 py-2 rounded-lg bg-white text-[#000000] border-2 border-[#333333] hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteAvatar}
                className="px-8 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
