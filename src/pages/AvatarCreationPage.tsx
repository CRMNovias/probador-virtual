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
import { ExampleComparison } from '../components/avatar/ExampleComparison.js';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className="w-full max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <div className="space-y-8 text-left">
            <div>
              <h1 className="text-5xl md:text-6xl font-serif text-[#2C2419] leading-tight mb-4">
                Crea tu Modelo para Cualquier Look.
              </h1>
              <p className="text-lg text-[#6B5647] leading-relaxed">
                ¿Alguna vez te preguntaste cómo te quedaría un vestido? Deja de imaginar.
                Sube una foto y descúbrelo. Nuestra IA crea tu modelo personal,
                listo para probarse cualquier cosa.
              </p>
            </div>

            {/* Upload Button */}
            <div className="space-y-6">
              <label
                htmlFor="photo-upload"
                className="block w-full cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-[#8C6F5A] to-[#6B5647] text-white rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 shadow-xl transform hover:scale-[1.02]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="text-2xl font-serif block mb-1">Subir Foto</span>
                      <span className="text-sm text-white/80">Click para seleccionar una imagen</span>
                    </div>
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

              {/* Tips Section */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md border border-white/40">
                <h3 className="text-sm font-semibold text-[#2C2419] mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#8C6F5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Consejos para mejores resultados
                </h3>
                <ul className="space-y-2 text-sm text-[#6B5647]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#8C6F5A] mt-0.5">•</span>
                    <span>Primer plano del rostro o cara y hombros</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#8C6F5A] mt-0.5">•</span>
                    <span>Buena iluminación frontal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#8C6F5A] mt-0.5">•</span>
                    <span>Hombros descubiertos si el vestido lo requiere</span>
                  </li>
                </ul>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Terms */}
              <div className="pt-4 border-t border-[#8C6F5A]/20">
                <p className="text-xs text-[#6B5647]/70 leading-relaxed">
                  Al subir, aceptas no crear contenido dañino, explícito o ilegal.
                  Este servicio es solo para uso creativo y responsable.
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Animated Example Comparison */}
          <div className="hidden md:flex flex-col items-center justify-center">
            <ExampleComparison />
          </div>
        </div>
      </main>
    </div>
  );
};
