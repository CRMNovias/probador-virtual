/**
 * FavoritesPage
 *
 * Listado de vestidos que el cliente ha marcado como favoritos en el
 * Probador Virtual. Cada tarjeta permite:
 *  - Quitar el vestido de favoritos (corazón).
 *  - Saltar al probador para volver a probárselo (cambia el `dressId`
 *    activo vía URL params, igual que el resto de navegación interna).
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header.js';
import { FavoriteButton } from '../components/shared/FavoriteButton.js';
import { getFavorites } from '../services/favoriteService.js';
import { routes } from '../constants/routes.js';
import type { Favorite } from '../types/index.js';

const HeartIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setError(null);
      const list = await getFavorites();
      setFavorites(list);
    } catch (err) {
      console.error('[FavoritesPage] error cargando favoritos:', err);
      setError('No se pudieron cargar tus favoritos. Inténtalo de nuevo.');
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cuando el usuario quita un favorito desde esta misma pantalla,
   * lo eliminamos de la lista para que desaparezca inmediatamente.
   */
  const handleFavoriteChange = (dressId: string, favorited: boolean): void => {
    if (favorited) return; // sigue en favoritos
    setFavorites((prev) => prev.filter((f) => f.dressId !== dressId));
  };

  /**
   * Vuelve al probador con el vestido seleccionado para una nueva prueba.
   */
  const handleTryOn = (favorite: Favorite): void => {
    const params = new URLSearchParams();
    params.set('dressId', favorite.dressId);
    if (favorite.dressName) {
      params.set('dressName', encodeURIComponent(favorite.dressName));
    }
    navigate(`${routes.TRY_ON}?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#ffffff]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Cargando favoritos...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <Header />

      <main className="flex-1 pb-24 p-4 md:p-8">
        <div className="w-full max-w-5xl mx-auto">
          <h1 className="text-4xl font-serif text-[#000000] mb-2 text-center">
            Mis Favoritos
          </h1>
          <p className="text-center text-gray-500 font-light mb-8">
            Los vestidos que has guardado para volver a probártelos.
          </p>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 text-red-700 p-4 text-center">
              {error}
            </div>
          )}

          {favorites.length === 0 ? (
            <div className="text-center mt-16 text-gray-500">
              <HeartIcon className="mx-auto mb-4 text-gray-300" />
              <p className="font-light">
                Aún no tienes vestidos favoritos.
                <br />
                Pulsa el corazón sobre cualquier prenda para guardarla aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {favorites.map((favorite) => (
                <article
                  key={favorite.id}
                  className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[2/3] bg-gray-100 relative">
                    {favorite.dressImageUrl ? (
                      <img
                        src={favorite.dressImageUrl}
                        alt={favorite.dressName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-light">
                        Sin imagen
                      </div>
                    )}

                    {/* Favorite toggle (top-right) */}
                    <div className="absolute top-2 right-2">
                      <FavoriteButton
                        variant="icon"
                        dressId={favorite.dressId}
                        initialFavorited
                        onChange={(fav) => {
                          handleFavoriteChange(favorite.dressId, fav);
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-3">
                    <h2
                      className="text-base font-serif text-[#000000] truncate"
                      title={favorite.dressName}
                    >
                      {favorite.dressName}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        handleTryOn(favorite);
                      }}
                      className="mt-3 w-full text-sm font-medium text-white bg-black hover:bg-gray-800 transition-colors rounded-lg py-2"
                    >
                      Probármelo
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
