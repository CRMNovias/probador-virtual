/**
 * ExampleComparison Component
 *
 * Animated demo comparison showing example photo → generated avatar
 * Used on the upload screen to demonstrate the capability
 *
 * Features:
 * - Auto-animated slider that moves back and forth
 * - Smooth transitions
 * - Visual example for users
 */

import React, { useState, useEffect } from 'react';

// Import example images
import photoExample from '../../assets/images/examples/photo-example.jpg';
import modelExample from '../../assets/images/examples/model-example.jpg';

/**
 * ExampleComparison Component
 */
export const ExampleComparison: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Using real images
  const hasRealImages = true;

  /**
   * Animate slider automatically
   */
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setSliderPosition((prev) => {
        // Move slider back and forth smoothly
        if (direction === 'forward') {
          if (prev >= 95) {
            setDirection('backward');
            return prev;
          }
          return prev + 0.5;
        } else {
          if (prev <= 5) {
            setDirection('forward');
            return prev;
          }
          return prev - 0.5;
        }
      });
    }, 20); // Smooth 60fps animation

    return () => clearInterval(animationInterval);
  }, [direction]);

  return (
    <div className="w-full">
      {/* Title */}
      <div className="text-center mb-4">
        <p className="text-sm font-medium text-[#8C6F5A] tracking-wide uppercase">
          Vista Previa de Ejemplo
        </p>
      </div>

      {/* Comparison Container */}
      <div className="relative w-full aspect-[3/4] mx-auto rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#F5F3EF] to-[#E8E4DD]">
        {/* Avatar/Model (Background - Right Side) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4C8BE] to-[#B8ACA0] flex items-center justify-center">
          {hasRealImages ? (
            // Real image
            <img
              src={modelExample}
              alt="Modelo generado ejemplo"
              className="w-full h-full object-contain"
            />
          ) : (
            // Placeholder
            <div className="text-center">
              <svg
                className="w-40 h-40 mx-auto text-[#8C6F5A] opacity-40"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-[#8C6F5A] text-lg font-serif mt-4 opacity-60">
                Modelo Generado
              </p>
            </div>
          )}

          {/* Label */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#2C2419] px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
            Modelo IA
          </div>
        </div>

        {/* Photo (Foreground - Left Side with clip) */}
        <div
          className="absolute inset-0 overflow-hidden transition-all duration-100"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#8C6F5A] to-[#6B5647] flex items-center justify-center">
            {hasRealImages ? (
              // Real image
              <img
                src={photoExample}
                alt="Foto ejemplo"
                className="w-full h-full object-contain"
              />
            ) : (
              // Placeholder
              <div className="text-center">
                <svg
                  className="w-32 h-32 mx-auto text-white opacity-40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                  />
                </svg>
                <p className="text-white text-lg font-serif mt-4 opacity-70">
                  Tu Foto
                </p>
              </div>
            )}

            {/* Label */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#2C2419] px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
              Foto Original
            </div>
          </div>
        </div>

        {/* Vertical Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-2xl pointer-events-none transition-all duration-100"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Draggable Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center">
            {/* Left/Right Arrows */}
            <svg
              className="w-5 h-5 text-[#8C6F5A]"
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

        {/* Watermark */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-serif text-[#2C2419] bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
          Ejemplo Ilustrativo
        </div>
      </div>

      {/* Instructions */}
      <p className="text-center text-xs text-gray-600 mt-4 leading-relaxed">
        Así es como compararás tu foto con el modelo generado
      </p>
    </div>
  );
};
