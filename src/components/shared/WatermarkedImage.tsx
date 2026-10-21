/**
 * Muestra la prueba tal cual llega del servidor.
 * El logo de marca ya va dentro de la foto (arriba a la derecha, sin recuadro).
 * No se superpone otro logo: el JPEG local tiene fondo blanco y salía abajo.
 */

import React from 'react';

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

export const WatermarkedImage: React.FC<WatermarkedImageProps> = ({
  src,
  alt,
  className = '',
  onClick,
}) => {
  return (
    <div className={`relative ${className}`} onClick={onClick}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
