/**
 * FavoriteButton
 *
 * Botón de corazón reutilizable para marcar/desmarcar un vestido como favorito.
 *
 * - Soporta dos variantes visuales (`pill` con texto al lado y `icon` solo).
 * - Carga el estado inicial llamando a `getFavoriteIds()` salvo que el padre
 *   pase `initialFavorited` (más eficiente para listados).
 * - Hace toggle optimista: actualiza el estado local antes del fetch y
 *   revierte si la API falla.
 * - Notifica el cambio al padre vía `onChange(favorited)`.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { getFavoriteIds, toggleFavorite } from '../../services/favoriteService.js';

export interface FavoriteButtonProps {
  /** ID del vestido a marcar como favorito (corresponde al product_id del CRM). */
  dressId: string | null;
  /** Estado inicial conocido por el padre; evita una llamada de red extra. */
  initialFavorited?: boolean;
  /** Variante visual; `pill` muestra texto, `icon` solo el corazón. */
  variant?: 'pill' | 'icon';
  /** Permite extender el className del wrapper. */
  className?: string;
  /** Callback invocado cuando el estado cambia con éxito. */
  onChange?: (favorited: boolean) => void;
}

const HeartIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  dressId,
  initialFavorited,
  variant = 'pill',
  className = '',
  onChange,
}) => {
  const [favorited, setFavorited] = useState<boolean>(initialFavorited ?? false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const hasInitial = typeof initialFavorited === 'boolean';

  useEffect(() => {
    if (hasInitial || !dressId) return undefined;

    const controller = new AbortController();
    void (async () => {
      try {
        const ids = await getFavoriteIds();
        if (controller.signal.aborted) return;
        setFavorited(ids.has(dressId));
      } catch (err) {
        if (controller.signal.aborted) return;
        console.warn('[FavoriteButton] no se pudo cargar estado inicial:', err);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [dressId, hasInitial]);

  const runToggle = useCallback(async () => {
    if (!dressId || isLoading) return;

    const prev = favorited;
    const next = !prev;

    setFavorited(next);
    setIsLoading(true);

    try {
      const serverState = await toggleFavorite(dressId);
      // Si por alguna razón el backend devolvió un estado distinto al optimista, sincronizamos.
      if (serverState !== next) setFavorited(serverState);
      onChange?.(serverState);
    } catch (err) {
      console.error('[FavoriteButton] toggle falló, revirtiendo:', err);
      setFavorited(prev);
    } finally {
      setIsLoading(false);
    }
  }, [dressId, favorited, isLoading, onChange]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    void runToggle();
  };

  const disabled = !dressId || isLoading;
  const ariaLabel = favorited ? 'Quitar de favoritos' : 'Añadir a favoritos';

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-pressed={favorited}
        className={`
          inline-flex items-center justify-center
          w-10 h-10 rounded-full
          bg-white/90 backdrop-blur-sm shadow-md
          transition-all duration-200
          ${favorited ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white'}
          ${className}
        `}
      >
        <HeartIcon filled={favorited} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={favorited}
      className={`
        inline-flex items-center gap-2
        px-3 py-2 rounded-full
        border transition-all duration-200
        ${
          favorited
            ? 'bg-red-50 border-red-200 text-red-600'
            : 'bg-white border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500'
        }
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <HeartIcon filled={favorited} />
      <span className="text-sm font-medium">
        {favorited ? 'En favoritos' : 'Añadir a favoritos'}
      </span>
    </button>
  );
};
