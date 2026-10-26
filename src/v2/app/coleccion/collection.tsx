import { ChevronDown, Search, X } from 'lucide-react';
import { FavoriteButton } from '@v2/components/favorite-button';
import { GarmentCard, garmentGrid } from '@v2/components/garment-card';
import { Button, Notice } from '@v2/components/ui';
import type { Category } from '@v2/lib/types';
import { useCollection } from './use-collection';

const TABS: { id: Category; label: string }[] = [
  { id: 'bride', label: 'Novia' },
  { id: 'groom', label: 'Novio' },
];

/**
 * Catálogo completo del CRM con los filtros de la V1 (marca y corte en novia,
 * estilo y color en novio). Pestaña, búsqueda y filtros viven en la URL: al
 * volver del probador, la clienta sigue donde estaba.
 */
export function Collection() {
  const {
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
  } = useCollection();

  return (
    <>
      <h1 className="sr-only">Colección</h1>

      <div className="flex items-end justify-between gap-6">
        <div role="tablist" aria-label="Colección" className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={category === tab.id}
              onClick={() => showCategory(tab.id)}
              className={`label-caps h-9 ${category === tab.id ? 'border-b border-ink text-ink' : 'text-neutral-400'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-40 sm:w-60">
          <label htmlFor="search" className="sr-only">
            Buscar por nombre
          </label>
          <Search className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-muted" strokeWidth={1.5} aria-hidden />
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar"
            className="h-9 w-full border-0 border-b border-neutral-300 bg-transparent pl-6 text-base uppercase tracking-[0.06em] outline-none placeholder:text-[12px] placeholder:text-neutral-400 focus:border-ink"
          />
        </div>
      </div>

      {/* Filtros: un botón por filtro; al abrirlo, sus opciones con el número de modelos */}
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        {facets.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-expanded={open === f.key}
            aria-controls="filter-options"
            onClick={() => setOpen(open === f.key ? null : f.key)}
            className={`label-caps inline-flex h-9 items-center gap-1 ${open === f.key || filters[f.key] ? 'text-ink' : 'text-muted'}`}
          >
            {f.label}
            {filters[f.key] ? <span className="normal-case tracking-normal text-muted">· {filters[f.key]}</span> : null}
            <ChevronDown className={`size-3.5 transition-transform ${open === f.key ? 'rotate-180' : ''}`} strokeWidth={1.5} aria-hidden />
          </button>
        ))}
        {active.length ? (
          <button
            type="button"
            onClick={() => setParams(Object.fromEntries(facets.map((f) => [f.key, null])))}
            className="label-caps ml-auto inline-flex h-9 items-center gap-1 text-muted underline underline-offset-4"
          >
            Borrar filtros
          </button>
        ) : null}
      </div>

      {openFacet ? (
        <div id="filter-options" className="border-y border-line py-3" role="group" aria-label={openFacet.label}>
          {options ? (
            <ul className="flex flex-wrap gap-2">
              {options.map((o) => {
                const on = filters[openFacet.key] === o.label;
                return (
                  <li key={o.label}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setParams({ [openFacet.key]: on ? null : o.label });
                        setOpen(null);
                      }}
                      className={`inline-flex h-9 items-center gap-1.5 border px-3 text-[11px] uppercase tracking-[0.08em] ${on ? 'border-accent bg-accent text-white' : 'border-line hover:border-ink'}`}
                    >
                      {o.label}
                      <span className={on ? 'text-white/70' : 'text-muted'}>{o.count}</span>
                      {on ? <X className="size-3" aria-hidden /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="h-9 w-2/3 shimmer" />
          )}
        </div>
      ) : null}

      <p className="label-caps mt-4 text-muted" aria-live="polite">
        {first ? `${first.total} ${first.total === 1 ? 'modelo' : 'modelos'}` : ' '}
      </p>

      <div className="mt-3">
        {error ? (
          <Notice tone="danger">
            {error}{' '}
            <button type="button" className="underline" onClick={() => void reload()}>
              Reintentar
            </button>
          </Notice>
        ) : loading || !items ? (
          <div className={garmentGrid}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="aspect-[3/4] shimmer" />
            ))}
          </div>
        ) : !items.length ? (
          <p className="label-caps py-16 text-center text-muted">
            {filters.q ? `Nada con «${filters.q}»` : 'No hay modelos con estos filtros'}
          </p>
        ) : (
          <>
            <ul className={garmentGrid}>
              {items.map((item) => (
                <GarmentCard
                  key={item.dressId}
                  href={`/probador?c=${category}&d=${item.dressId}`}
                  imageUrl={item.imageUrl}
                  name={item.name}
                  detail={category === 'bride' ? [item.brand, item.cut].filter(Boolean).join(' · ') : [item.brand, item.color].filter(Boolean).join(' · ')}
                  action={<FavoriteButton dressId={item.dressId} initial={favoriteIds.has(item.dressId)} />}
                />
              ))}
            </ul>
            <div ref={sentinel} className="flex justify-center py-8">
              {hasMore ? (
                <Button variant="secondary" loading={loadingMore} onClick={() => void loadMore()}>
                  Ver más
                </Button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </>
  );
}
