/**
 * AvatarCreationPage (Phase 2 - Complete Implementation)
 *
 * Avatar creation flow page where users upload passport-style photos
 * and generate their full-body avatar with AI.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/layout/Header.js';
import { Loader } from '../components/shared/Loader.js';
import { AvatarComparison } from '../components/avatar/AvatarComparison.js';
import { uploadPhoto } from '../services/userService.js';
import { generateAvatar } from '../services/avatarService.js';
import { envConfig } from '../config/envConfig.js';
import { routes } from '../constants/routes.js';
import { useAuth } from '../context/AuthContext.js';

// Import example image (if exists)
// Uncomment when you add the image to: src/assets/images/examples/photo-example.jpg
// import photoExample from '../assets/images/examples/photo-example.jpg';

/**
 * AvatarCreationPage Component
 */
export const AvatarCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dressId = searchParams.get('dressId');
  const regenerate = searchParams.get('regenerate'); // New param to indicate regeneration mode
  const { user, updateUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Preview state
  const [showComparison, setShowComparison] = useState(false);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>('');
  const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  /**
   * Auto-trigger regeneration if in regenerate mode
   */
  useEffect(() => {
    if (regenerate === 'true' && !isLoading && !showComparison) {
      handleRegenerateFromBackend();
    }
  }, [regenerate]);

  /**
   * Regenerate avatar using existing photo stored on backend
   */
  const handleRegenerateFromBackend = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setLoadingMessage('Regenerando tu avatar...');

    try {
      // Call generate avatar - backend uses the existing uploaded photo
      const prompt = 'Generate a full-body avatar from this passport-style photo';
      const avatarResponse = await generateAvatar(prompt);
      console.log('[AvatarCreation] Regeneration response:', avatarResponse);

      // Extract avatar URL from response
      const responseData = (avatarResponse as any).data || avatarResponse;
      const avatarUrl = responseData.avatarUrl || responseData.url || '';

      if (!avatarUrl) {
        throw new Error('No se recibió URL del avatar generado');
      }

      // Update user context
      if (user) {
        updateUser({ ...user, hasAvatar: true });
      }

      setIsLoading(false);

      // Navigate directly to try-on page after regeneration
      const destination = dressId ? `${routes.TRY_ON}?dressId=${dressId}` : routes.TRY_ON;
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('[AvatarCreation] Regeneration error:', err);
      setError(err instanceof Error ? err.message : 'Error al regenerar avatar');
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen');
      return;
    }

    const maxSizeMB = envConfig.maxUploadSizeMB;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`La imagen es demasiado grande. Máximo ${maxSizeMB}MB`);
      return;
    }

    setError(null);
    setUploadedFile(file);
    await processAvatarGeneration(file);
  };

  /**
   * Process avatar generation (reusable for both upload and regeneration)
   */
  const processAvatarGeneration = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Create local URL for uploaded photo preview
      const localPhotoUrl = URL.createObjectURL(file);
      setUploadedPhotoUrl(localPhotoUrl);

      // Step 1: Upload photo
      setLoadingMessage('Subiendo foto...');
      const uploadResponse = await uploadPhoto(file);
      console.log('[AvatarCreation] Upload response:', uploadResponse);

      // Step 2: Generate avatar
      setLoadingMessage('Nuestra IA está creando tu avatar...');
      const prompt = 'Generate a full-body avatar from this passport-style photo';
      const avatarResponse = await generateAvatar(prompt);
      console.log('[AvatarCreation] Avatar response:', avatarResponse);

      // Extract avatar URL from response
      // Backend returns: { success, data: { avatarUrl, avatarId }, message }
      const responseData = (avatarResponse as any).data || avatarResponse;
      const avatarUrl = responseData.avatarUrl || responseData.url || '';

      console.log('[AvatarCreation] Extracted avatar URL:', avatarUrl);
      console.log('[AvatarCreation] Response data:', responseData);

      if (!avatarUrl) {
        throw new Error('No se recibió URL del avatar generado');
      }

      setGeneratedAvatarUrl(avatarUrl);

      // Update user context to mark avatar as created
      if (user) {
        updateUser({ ...user, hasAvatar: true });
        console.log('[AvatarCreation] User updated with hasAvatar: true');
      }

      // Step 3: Show comparison view
      setIsLoading(false);
      setShowComparison(true);
    } catch (err) {
      console.error('[AvatarCreation] Error:', err);
      setError(err instanceof Error ? err.message : 'Error al generar avatar');
      setIsLoading(false);
    }
  };

  /**
   * Handle continue to try-on
   */
  const handleContinue = (): void => {
    const destination = dressId ? `${routes.TRY_ON}?dressId=${dressId}` : routes.TRY_ON;
    navigate(destination, { replace: true });
  };

  /**
   * Handle regenerate avatar - uses the same uploaded photo
   */
  const handleRegenerate = async (): Promise<void> => {
    if (!uploadedFile) {
      // If no file stored, navigate back to upload screen
      setShowComparison(false);
      setUploadedPhotoUrl('');
      setGeneratedAvatarUrl('');
      setError(null);
      return;
    }

    // Regenerate with existing file
    setShowComparison(false);
    await processAvatarGeneration(uploadedFile);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F5F3EF] to-[#E8E4DD]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader text={loadingMessage} />
        </main>
      </div>
    );
  }

  // Comparison view
  if (showComparison && uploadedPhotoUrl && generatedAvatarUrl) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F5F3EF] to-[#E8E4DD]">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <AvatarComparison
            uploadedPhotoUrl={uploadedPhotoUrl}
            generatedAvatarUrl={generatedAvatarUrl}
            onContinue={handleContinue}
            onRegenerate={handleRegenerate}
          />
        </main>
      </div>
    );
  }

  // Upload view
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F5F3EF] to-[#E8E4DD]">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-6 text-left">
            <h1 className="text-5xl md:text-6xl font-serif text-[#2C2419] leading-tight">
              Crea tu Modelo para Cualquier Look.
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed max-w-xl">
              ¿Alguna vez te preguntaste cómo te quedaría un vestido? Deja de imaginar.
              Sube una foto y descúbrelo. Nuestra IA crea tu modelo personal,
              listo para probarse cualquier cosa.
            </p>

            <div className="space-y-4 max-w-xl">
              <label
                htmlFor="photo-upload"
                className="block w-full cursor-pointer"
              >
                <div className="bg-[#1A1F2E] text-white rounded-lg p-6 text-center hover:bg-[#252B3D] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-center gap-3">
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
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-lg font-semibold">Subir Foto</span>
                  </div>
                </div>
                <input
                  id="photo-upload"
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                />
              </label>

              <p className="text-sm text-gray-600 leading-relaxed">
                Las fotos que mejor funcionan son de primer plano del rostro o de cara y hombros.
                Si el vestido tiene hombros descubiertos, sube una foto con los hombros descubiertos
                para obtener un resultado más realista.
              </p>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="pt-6 border-t border-gray-300">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Al subir, aceptas no crear contenido dañino, explícito o ilegal.
                  Este servicio es solo para uso creativo y responsable.
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Example Image / Placeholder */}
          <div className="hidden md:flex flex-col items-center justify-center space-y-4">
            {/* Main example/placeholder area */}
            <div className="relative w-full max-w-md aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden">
              {/* If you add an example image, uncomment this block and comment out the placeholder below */}
              {/* <img
                src={photoExample}
                alt="Ejemplo de foto ideal"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <p className="text-white text-sm text-center font-medium">
                  ✓ Ejemplo de foto ideal: Primer plano del rostro
                </p>
              </div> */}

              {/* Placeholder (remove when you add example image) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white opacity-30">
                  <svg
                    className="w-32 h-32 mx-auto mb-4 animate-pulse"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-xl font-serif">Tu Avatar Aparecerá Aquí</p>
                </div>
              </div>

              {/* Particle effect overlay - subtle dots */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Helper text below example */}
            <p className="text-sm text-gray-600 text-center max-w-md">
              <strong>Foto ideal:</strong> Primer plano del rostro o cara y hombros con buena iluminación
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
