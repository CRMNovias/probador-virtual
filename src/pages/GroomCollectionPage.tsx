/**
 * GroomCollectionPage — /colecciones/novio
 *
 * Catálogo de trajes con filtro de color (pills). Cada tarjeta lleva un
 * botón "QUIERO PROBÁRMELO" que navega a `/try-on?dressId=<crm_product_id>`.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header.js';
import { FilterDropdown } from '../components/collections/FilterDropdown.js';
import {
  listGrooms,
  listGroomColors,
  listGroomSuitTypes,
} from '../services/dressService.js';
import { routes } from '../constants/routes.js';
import type { CollectionBrand, CollectionItem } from '../types/index.js';

export const GroomCollectionPage: React.FC = () => {
  const navigate = useNavigate();

  const [colors, setColors] = useState<CollectionBrand[]>([]);
  const [suitTypes, setSuitTypes] = useState<CollectionBrand[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSuitType, setSelectedSuitType] = useState<string | null>(null);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Catálogos (colores + tipos de traje) — una sola vez
  useEffect(() => {
    listGroomColors()
      .then(setColors)
      .catch((err) => console.error('[GroomCollection] Error cargando colores:', err));
    listGroomSuitTypes()
      .then(setSuitTypes)
      .catch((err) => console.error('[GroomCollection] Error cargando tipos de traje:', err));
  }, []);

  /** Construye el payload de filtros activos. */
  const buildFilters = () => ({
    ...(selectedColor ? { color: selectedColor } : {}),
    ...(selectedSuitType ? { suitType: selectedSuitType } : {}),
  });

  // Lista (se recarga al cambiar cualquier filtro)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPage(1);
    listGrooms({ page: 1, ...buildFilters() })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data);
        setTotal(res.meta.total);
        setHasMore(res.meta.hasMore);
      })
      .catch((err) => {
        console.error('[GroomCollection] Error cargando trajes:', err);
        if (!cancelled) setError('No se pudo cargar la colección.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor, selectedSuitType]);

  const handleLoadMore = async (): Promise<void> => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await listGrooms({ page: nextPage, ...buildFilters() });
      setItems((prev) => [...prev, ...res.data]);
      setHasMore(res.meta.hasMore);
      setPage(nextPage);
    } catch (err) {
      console.error('[GroomCollection] Error cargando más:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleTryOn = (item: CollectionItem): void => {
    const params = new URLSearchParams({
      dressId: item.dressId,
      dressName: item.name,
      category: 'groom',
    });
    navigate(`${routes.TRY_ON}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h1 className="text-2xl md:text-3xl tracking-[0.15em] text-[#000000]">
              COLECCIÓN NOVIO
            </h1>
            <p className="text-xs text-gray-500">
              {loading ? 'Cargando…' : `${total} ${total === 1 ? 'traje' : 'trajes'}`}
            </p>
          </div>

          {/* Filtros (dropdowns) */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <FilterDropdown
              label="Tipo de traje"
              allLabel="Todos los tipos"
              options={suitTypes}
              value={selectedSuitType}
              onChange={setSelectedSuitType}
            />
            <FilterDropdown
              label="Color"
              allLabel="Todos los colores"
              options={colors}
              value={selectedColor}
              onChange={setSelectedColor}
            />
            {(selectedColor || selectedSuitType) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedColor(null);
                  setSelectedSuitType(null);
                }}
                className="text-xs text-gray-500 hover:text-black underline underline-offset-2"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-red-800 text-sm text-center">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-gray-500 py-16">
              No hay trajes disponibles con este filtro.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {items.map((item) => (
                  <article key={item.dressId} className="flex flex-col">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleTryOn(item)}
                        className="absolute bottom-2 left-2 right-2 md:bottom-3 md:left-3 md:right-3 bg-black/90 hover:bg-black text-white text-[10px] md:text-xs tracking-wider md:tracking-widest font-medium py-1.5 md:py-2.5 rounded-md transition-colors backdrop-blur-sm whitespace-nowrap"
                      >
                        QUIERO PROBÁRMELO
                      </button>
                    </div>
                    {/* Nombre del producto */}
                    <h3 className="mt-2 text-sm font-medium text-[#000000] text-center truncate">
                      {item.name}
                    </h3>
                  </article>
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-6 py-3 rounded-md border border-black text-black bg-white hover:bg-black hover:text-white text-sm tracking-widest transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? 'Cargando…' : 'Cargar más'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
