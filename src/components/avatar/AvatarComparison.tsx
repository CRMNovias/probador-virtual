/**
 * AvatarComparison Component
 *
 * Side-by-side comparison of uploaded photo and generated avatar
 * with vertical slider to compare both images.
 *
 * Features:
 * - Vertical divider slider
 * - Smooth dragging interaction
 * - Responsive design
 * - Touch support for mobile
 */

import React, { useState, useRef, useEffect } from 'react';

export interface AvatarComparisonProps {
  /**
   * URL of the uploaded photo
   */
  uploadedPhotoUrl: string;

  /**
   * URL of the generated avatar
   */
  generatedAvatarUrl: string;

  /**
   * Callback when user confirms and wants to continue
   */
  onContinue: () => void;

  /**
   * Callback when user wants to regenerate
   */
  onRegenerate: () => void;

  /**
   * Callback when user wants to upload a different photo
   */
  onChangePhoto?: () => void;
}

/**
 * AvatarComparison Component
 */
export const AvatarComparison: React.FC<AvatarComparisonProps> = ({
  uploadedPhotoUrl,
  generatedAvatarUrl,
  onContinue,
  onRegenerate,
  onChangePhoto,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // Percentage
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Update slider position based on mouse/touch position
   */
  const updateSliderPosition = (clientX: number): void => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    // Clamp between 0 and 100
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    setSliderPosition(clampedPercentage);
  };

  /**
   * Handle mouse down
   */
  const handleMouseDown = (): void => {
    setIsDragging(true);
  };

  /**
   * Handle mouse move
   */
  const handleMouseMove = (e: MouseEvent): void => {
    if (!isDragging) return;
    updateSliderPosition(e.clientX);
  };

  /**
   * Handle mouse up
   */
  const handleMouseUp = (): void => {
    setIsDragging(false);
  };

  /**
   * Handle touch move
   */
  const handleTouchMove = (e: TouchEvent): void => {
    if (!isDragging || !e.touches[0]) return;
    e.preventDefault();
    updateSliderPosition(e.touches[0].clientX);
  };

  /**
   * Setup event listeners for dragging
   */
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Info Banner */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-blue-900 font-medium text-sm md:text-base">
              Esto es solo tu avatar. Para probarte vestidos y trajes, pulsa en <span className="font-semibold">"Continuar al Probador"</span> abajo.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-serif text-[#000000] mb-3">
          Tu Avatar está Listo
        </h2>
        <p className="text-[#333333] text-lg">
          Desliza la barra para comparar tu foto con el avatar generado
        </p>
      </div>

      {/* Comparison Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[75vh] max-h-[800px] mx-auto mb-8 rounded-2xl overflow-hidden shadow-2xl cursor-ew-resize bg-gradient-to-br from-gray-100 to-gray-200"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* Generated Avatar (Background - Right Side) */}
        <div className="absolute inset-0">
          <img
            src={generatedAvatarUrl}
            alt="Avatar generado"
            className="w-full h-full object-contain"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#000000] px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            Avatar Generado
          </div>
        </div>

        {/* Uploaded Photo (Foreground - Left Side with clip) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={uploadedPhotoUrl}
            alt="Foto subida"
            className="w-full h-full object-contain"
          />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#000000] px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            Foto Original
          </div>
        </div>

        {/* Vertical Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-2xl pointer-events-none"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          {/* Draggable Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center pointer-events-auto cursor-ew-resize hover:scale-110 transition-transform">
            {/* Left/Right Arrows */}
            <svg
              className="w-6 h-6 text-[#333333]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7l-5 5 5 5M16 7l5 5-5 5"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <p className="text-center text-sm text-[#333333] mb-8">
        Arrastra la barra central para comparar las imágenes
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRegenerate}
          className="min-w-[220px] px-8 py-4 bg-white/80 text-[#000000] rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-[#333333]/30 font-serif text-lg transform hover:scale-[1.02]"
        >
          Regenerar Avatar
        </button>
        {onChangePhoto && (
          <button
            onClick={onChangePhoto}
            className="min-w-[220px] px-8 py-4 bg-white/80 text-[#000000] rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-[#333333]/30 font-serif text-lg transform hover:scale-[1.02]"
          >
            Subir Otra Foto
          </button>
        )}
        <button
          onClick={onContinue}
          className="min-w-[220px] px-8 py-4 bg-[#333333] text-white rounded-xl hover:bg-[#1a1a1a] hover:shadow-2xl transition-all duration-300 shadow-xl font-serif text-lg transform hover:scale-[1.02]"
        >
          Continuar al Probador
        </button>
      </div>
    </div>
  );
};
