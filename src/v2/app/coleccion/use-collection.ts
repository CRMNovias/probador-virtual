import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FACETS, listFacet, listFavorites, listGarments, type GarmentFilters } from '@v2/lib/api';
import type { Category, CollectionItem } from '@v2/lib/types';
import { useLoad } from '@v2/lib/use-load';

export type FacetKey = (typeof FACETS)[Category][number]['key'];

/**
 * Catálogo completo del CRM con los filtros de la V1 (marca y corte en novia,
 * estilo y color en novio). Pestaña, búsqueda y filtros viven en la URL: al
 * volver del probador, la clienta sigue donde estaba. Lo usan la colección de
 * Atelier y la de Sedka, cada una con su aspecto.
 */
export function useCollection() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const category: Category = params.get('c') === 'groom' ? 'groom' : 'bride';
  const facets = FACETS[category];
  const filters: GarmentFilters = { q: params.get('q') ?? undefined };
  for (const f of facets) filters[f.key] = params.get(f.key) ?? undefined;
  const filterKey = `${category}|${new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][])}`;

  // Se parte de la URL actual (no de un render anterior) para no pisar un cambio de pestaña.
  const setParams = (next: Record<string, string | null>) => {
    const sp = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Búsqueda: se escribe en local y se lleva a la URL con una pequeña espera.
  const [query, setQuery] = useState(filters.q ?? '');
  useEffect(() => {
    const q = query.trim();
    if (q === (new URLSearchParams(window.location.search).get('q') ?? '')) return;
    const t = window.setTimeout(() => setParams({ q: q || null }), 350);
    return () => window.clearTimeout(t);
    // setParams lee la URL en el momento; solo importa el texto escrito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const [open, setOpen] = useState<FacetKey | null>(null);
  const openFacet = facets.find((f) => f.key === open) ?? null;
  const { data: options } = useLoad(() => (openFacet ? listFacet(openFacet.path) : Promise.resolve(null)), openFacet?.path ?? '');

  const { data: first, error, loading, reload } = useLoad(() => listGarments(category, filters), filterKey);
  const [more, setMore] = useState<{ key: string; items: CollectionItem[]; page: number; hasMore: boolean } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const extra = more?.key === filterKey ? more : null;
  const items = first ? [...first.items, ...(extra?.items ?? [])] : null;
  const hasMore = extra ? extra.hasMore : Boolean(first?.hasMore);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const page = (extra?.page ?? 1) + 1;
      const next = await listGarments(category, filters, page);
      setMore({ key: filterKey, items: [...(extra?.items ?? []), ...next.items], page, hasMore: next.hasMore });
    } finally {
      setLoadingMore(false);
    }
  };

  // Carga continua: al acercarse al final se pide la página siguiente.
  const sentinel = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(loadMore);
  useEffect(() => {
    loadMoreRef.current = loadMore;
  });
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => entries[0]?.isIntersecting && void loadMoreRef.current(), {
      rootMargin: '600px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [filterKey, items?.length]);

  const { data: favorites } = useLoad(listFavorites);
  const favoriteIds = new Set((favorites ?? []).map((f) => f.dressId));
  const active = facets.filter((f) => filters[f.key]);

  /** Cambia de novia a novio (o al revés) sin filtros ni búsqueda. */
  const showCategory = (next: Category) => {
    setOpen(null);
    setQuery('');
    router.replace(next === 'groom' ? `${pathname}?c=groom` : pathname, { scroll: false });
  };

  return {
    category,
    facets,
    filters,
    setParams,
    query,
    setQuery,
    open,
    setOpen,
    openFacet,
    options,
    first,
    error,
    loading,
    reload,
    items,
    hasMore,
    loadMore,
    loadingMore,
    sentinel,
    favoriteIds,
    active,
    showCategory,
  };
}
