/**
 * WatermarkedImage Component
 *
 * Displays an image with a watermark logo overlay in the bottom-right corner.
 * The watermark is positioned 50px from the right and bottom edges.
 */

import React from 'react';
import logoImg from '../../assets/images/logo/logo.jpg';

export interface WatermarkedImageProps {
  /**
   * Source URL of the main image
   */
  src: string;

  /**
   * Alt text for the image
   */
  alt: string;

  /**
   * Additional CSS classes for the container
   */
  className?: string;

  /**
   * Click handler
   */
  onClick?: () => void;
}

/**
 * WatermarkedImage Component
 *
 * Renders an image with the Atelier de Bodas logo watermark
 * positioned in the bottom-right corner (50px offset)
 */
export const WatermarkedImage: React.FC<WatermarkedImageProps> = ({
  src,
  alt,
  className = '',
  onClick,
}) => {
  return (
    <div className={`relative ${className}`} onClick={onClick}>
      {/* Main Image */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />

      {/* Watermark Logo - Bottom Right with 50px offset */}
      <img
        src={logoImg}
        alt="Atelier de Bodas"
        className="absolute pointer-events-none"
        style={{
          bottom: '50px',
          right: '50px',
          width: '127px',   // 254px / 2 (50% scale for better visibility)
          height: '45px',   // 90px / 2
          opacity: 0.9,
        }}
      />
    </div>
  );
};
