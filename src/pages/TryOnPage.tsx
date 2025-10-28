/**
 * TryOnPage (Phase 2 - Complete Implementation)
 *
 * Main try-on screen where users can virtually try on wedding dresses with different poses.
 * Layout: Grid 2 columns - Canvas (left) + Controls (right)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header.js';
import { Navigation } from '../components/layout/Navigation.js';
import { Loader } from '../components/shared/Loader.js';
import { useApp } from '../context/AppContext.js';
import { getAvatar } from '../services/avatarService.js';
import { generateTryOn, deleteTryOn } from '../services/tryOnService.js';
import { routes } from '../constants/routes.js';
import type { Avatar, GenerateTryOnRequest } from '../types/index.js';

// Import pose images (uncomment when you add the images)
// import pose1Img from '../assets/images/poses/pose1.jpg';
// import pose2Img from '../assets/images/poses/pose2.jpg';
// import pose3Img from '../assets/images/poses/pose3.jpg';

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

// 3 Poses predefinidas (frontend)
const POSES = [
  {
    id: 'pose1',
    name: 'Pose de Estudio',
    prompt: 'Vista frontal completa, manos en cadera, pose elegante de estudio',
    // image: pose1Img, // Uncomment when you add the image
  },
  {
    id: 'pose2',
    name: 'Pose Natural',
    prompt: 'Vista 3/4 ligeramente girada, pose natural y relajada',
    // image: pose2Img, // Uncomment when you add the image
  },
  {
    id: 'pose3',
    name: 'Pose de Perfil',
    prompt: 'Perfil lateral completo, pose elegante de perfil',
    // image: pose3Img, // Uncomment when you add the image
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
  const { dressId } = useApp();

  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [selectedPoseId, setSelectedPoseId] = useState(POSES[0]?.id || 'pose1');
  const [generatedTryOn, setGeneratedTryOn] = useState<GeneratedTryOn | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

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
      <div className="min-h-screen flex flex-col bg-[#F8F7F5]">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-red-100 border border-red-300 rounded-lg p-6 max-w-md text-center">
            <h2 className="text-xl font-bold text-red-700 mb-2">Error: Vestido no seleccionado</h2>
            <p className="text-red-600">
              Esta aplicación debe accederse desde el catálogo con un parámetro ?dressId=xxx
            </p>
          </div>
        </main>
        <Navigation />
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
      const request: GenerateTryOnRequest = {
        dressId,
        prompt: selectedPose.prompt,
      };

      const response = await generateTryOn(request);

      setGeneratedTryOn({
        id: response.tryOnId,
        url: response.imageUrl,
        poseId: selectedPoseId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar prueba virtual');
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

  const handleRegenerateAvatar = () => {
    const params = new URLSearchParams();
    if (dressId) params.append('dressId', dressId);
    params.append('regenerate', 'true');
    navigate(`${routes.AVATAR_CREATION}?${params.toString()}`);
  };

  const handleChangePhoto = () => {
    navigate(routes.AVATAR_CREATION + (dressId ? `?dressId=${dressId}` : ''));
  };

  const displayImageUrl = generatedTryOn ? generatedTryOn.url : avatar?.imageUrl;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F5]">
      <Header />

      <main className="flex-1 pb-24">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 p-4 md:p-8 h-full">
          {/* Columna Izquierda: Canvas */}
          <div className="relative w-full h-[60vh] lg:h-full bg-white rounded-xl shadow-sm flex items-center justify-center overflow-hidden border border-gray-200">
            {isLoading && <Loader text={loadingMessage} />}

            {!isLoading && avatarError && (
              <div className="text-center p-8 max-w-md">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Error al cargar avatar</h3>
                <p className="text-sm text-gray-600 mb-6">{avatarError}</p>
                <button
                  onClick={handleChangePhoto}
                  className="bg-[#8C6F5A] text-white px-6 py-3 rounded-lg hover:bg-[#7a5f4d] transition-colors"
                >
                  Crear Avatar
                </button>
              </div>
            )}

            {!isLoading && !avatarError && displayImageUrl && (
              <>
                <img
                  src={displayImageUrl}
                  alt="Virtual Try-On"
                  className="w-full h-full object-contain"
                />

                {/* Watermark */}
                <div className="absolute bottom-4 left-4 text-sm font-serif text-gray-500 bg-white/50 px-2 py-1 rounded">
                  Atelier de Bodas
                </div>

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
                      onClick={() => alert('Función de compartir disponible próximamente')}
                      className="p-3 bg-white/80 rounded-full text-gray-800 shadow-lg hover:scale-110 transition-transform opacity-50 cursor-not-allowed"
                      title="Compartir (próximamente)"
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

          {/* Columna Derecha: Controles */}
          <div className="flex flex-col gap-6">
            {/* Card: Tu Avatar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-serif text-[#4a3f35] mb-3">Tu Avatar</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleRegenerateAvatar}
                  className="flex-1 text-sm flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <SparklesIcon className="w-4 h-4" /> Regenerar
                </button>
                <button
                  onClick={handleChangePhoto}
                  className="flex-1 text-sm flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <UploadIcon className="w-4 h-4" /> Cambiar Foto
                </button>
              </div>
            </div>

            {/* Card: Vestido Seleccionado */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-2xl font-serif text-[#4a3f35] mb-1">Vestido Seleccionado</h2>
              <p className="text-lg text-[#6e5f53] font-light">ID: {dressId}</p>
            </div>

            {/* Card: Elige una pose */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-serif text-[#4a3f35] mb-4">Elige una pose</h3>
              <div className="flex justify-center md:justify-start gap-4">
                {POSES.map(pose => (
                  <button
                    key={pose.id}
                    onClick={() => setSelectedPoseId(pose.id)}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                      selectedPoseId === pose.id
                        ? 'border-[#8C6F5A] ring-2 ring-[#D4C8BE] bg-[#F8F7F5]'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    {/* Pose Image Container */}
                    <div className="w-20 h-28 bg-gray-200 rounded mb-2 overflow-hidden relative">
                      {/* If you have the image, uncomment this and comment the placeholder below */}
                      {/* {pose.image ? (
                        <img
                          src={pose.image}
                          alt={pose.name}
                          className="w-full h-full object-cover"
                        />
                      ) : ( */}
                        <div className="flex items-center justify-center h-full text-xs text-gray-500 p-2 text-center">
                          {pose.name}
                        </div>
                      {/* )} */}
                    </div>
                    <span className="text-xs text-gray-700">{pose.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Generar Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-[#8C6F5A] text-white py-4 rounded-lg hover:bg-[#7a5f4d] transition-colors shadow-lg text-lg disabled:bg-gray-400"
            >
              <SparklesIcon className="w-6 h-6" />
              Generar Prueba Virtual
            </button>
          </div>
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
            <img src={viewerImage} alt="Ampliado" className="max-w-full max-h-full object-contain rounded-lg" />
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
    </div>
  );
};
