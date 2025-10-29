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
}

/**
 * AvatarComparison Component
 */
export const AvatarComparison: React.FC<AvatarComparisonProps> = ({
  uploadedPhotoUrl,
  generatedAvatarUrl,
  onContinue,
  onRegenerate,
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
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-serif text-[#2C2419] mb-3">
          Tu Avatar está Listo
        </h2>
        <p className="text-[#6B5647] text-lg">
          Desliza la barra para comparar tu foto con el avatar generado
        </p>
      </div>

      {/* Comparison Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[75vh] max-h-[800px] mx-auto mb-8 rounded-2xl overflow-hidden shadow-2xl cursor-ew-resize bg-gradient-to-br from-[#F5F3EF] to-[#E8E4DD]"
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
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#2C2419] px-4 py-2 rounded-full text-sm font-medium shadow-lg">
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
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#2C2419] px-4 py-2 rounded-full text-sm font-medium shadow-lg">
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
              className="w-6 h-6 text-[#8C6F5A]"
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
      <p className="text-center text-sm text-[#6B5647] mb-8">
        Arrastra la barra central para comparar las imágenes
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRegenerate}
          className="min-w-[220px] px-8 py-4 bg-white/80 text-[#2C2419] rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-[#8C6F5A]/30 font-serif text-lg transform hover:scale-[1.02]"
        >
          Regenerar Avatar
        </button>
        <button
          onClick={onContinue}
          className="min-w-[220px] px-8 py-4 bg-gradient-to-br from-[#8C6F5A] to-[#6B5647] text-white rounded-xl hover:shadow-2xl transition-all duration-300 shadow-xl font-serif text-lg transform hover:scale-[1.02]"
        >
          Continuar al Probador
        </button>
      </div>
    </div>
  );
};
