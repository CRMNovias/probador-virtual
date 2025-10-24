/**
 * AvatarCreationPage (Phase 2 - Complete Implementation)
 *
 * Avatar creation flow page where users upload passport-style photos
 * and generate their full-body avatar with AI.
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/layout/Header.js';
import { Loader } from '../components/shared/Loader.js';
import { AvatarComparison } from '../components/avatar/AvatarComparison.js';
import { uploadPhoto } from '../services/userService.js';
import { generateAvatar } from '../services/avatarService.js';
import { envConfig } from '../config/envConfig.js';
import { routes } from '../constants/routes.js';

const CheckIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const UploadIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

/**
 * AvatarCreationPage Component
 */
export const AvatarCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dressId = searchParams.get('dressId');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Preview state
  const [showComparison, setShowComparison] = useState(false);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>('');
  const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState<string>('');

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
    setIsLoading(true);

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
      const avatarUrl = (avatarResponse as any).avatarUrl || (avatarResponse as any).url || '';
      setGeneratedAvatarUrl(avatarUrl);

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
   * Handle regenerate avatar
   */
  const handleRegenerate = (): void => {
    setShowComparison(false);
    setUploadedPhotoUrl('');
    setGeneratedAvatarUrl('');
    setError(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F7F5]">
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
      <div className="min-h-screen flex flex-col bg-[#F8F7F5]">
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
    <div className="min-h-screen flex flex-col bg-[#F8F7F5]">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full flex flex-col items-center text-center">
          <h1 className="text-4xl font-serif text-[#4a3f35] mb-4">Crea tu avatar</h1>
          <p className="text-[#6e5f53] mb-8 font-light max-w-md">
            Sube una foto tipo carnet para generar un modelo virtual de cuerpo entero. La IA hará el resto.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            {/* Upload Zone */}
            <div className="flex flex-col items-center justify-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <input
                type="file"
                id="photo-upload"
                className="hidden"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp"
              />
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <UploadIcon />
                <p className="text-gray-500 font-semibold mt-4">Pulsa para subir una foto</p>
                <p className="text-gray-400 text-sm">o arrástrala aquí</p>
              </label>

              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-[#F8F7F5] p-6 rounded-xl text-left">
              <h3 className="text-lg font-semibold text-[#4a3f35] mb-4">Recomendaciones:</h3>
              <ul className="space-y-3 text-[#6e5f53] font-light">
                <li className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-[#8C6F5A] mt-1 flex-shrink-0" />
                  <span>Foto tipo carnet, con el rostro centrado y mirando al frente.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-[#8C6F5A] mt-1 flex-shrink-0" />
                  <span>Buena iluminación, sin sombras pronunciadas en la cara.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-[#8C6F5A] mt-1 flex-shrink-0" />
                  <span>
                    Si el vestido tiene hombros descubiertos, una foto similar ayudará a un mejor resultado.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
