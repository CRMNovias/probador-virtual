import { ChevronDown, Search } from 'lucide-react';
import { useCollection, type FacetKey } from '@v2/app/coleccion/use-collection';
import { Button, Notice } from '@v2/components/ui';
import { listFacet } from '@v2/lib/api';
import type { Category } from '@v2/lib/types';
import { useLoad } from '@v2/lib/use-load';
import { OutletFavorite, OutletGarmentCard, OutletGridPlaceholder, outletGrid } from './cards';
import { OutletEmpty, OutletHead, OutletPage, outletWidth } from './shell';

const TITLES: Record<Category, { number: string; title: string; many: string }> = {
  bride: { number: '01', title: 'Novia', many: 'vestidos' },
  groom: { number: '02', title: 'Novio', many: 'trajes' },
};

/** Sin filtro, el desplegable enseña el nombre del filtro, como en la V1 («Marca», «Tipo de corte»). */
const NAMES: Partial<Record<FacetKey, string>> = {
  brand: 'Marca',
  cut: 'Tipo de corte',
  suitType: 'Tipo de traje',
  color: 'Color',
};

/** Desplegable en pastilla de la V1. */
export function OutletSelect({ className = '', ...rest }: React.ComponentProps<'select'>) {
  return (
    <span className={`relative block ${className}`}>
      <select
        {...rest}
        className="h-10 w-full cursor-pointer appearance-none rounded-full border border-ink/25 bg-white py-0 pl-4 pr-10 text-[13px] outline-none transition-colors hover:border-ink focus:border-ink"
      />
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2" strokeWidth={1.75} aria-hidden />
    </span>
  );
}

/** Colección de Outlet: la de su V1 (Novia o Novio según el menú, filtros en pastillas y rejilla numerada). */
export function OutletCollection() {
  const { category, facets, filters, setParams, query, setQuery, first, error, loading, reload, items, hasMore, loadMore, loadingMore, sentinel, favoriteIds } =
    useCollection();
  // Los desplegables necesitan sus opciones desde el principio (en Atelier se piden al abrir cada filtro).
  const { data: options } = useLoad(() => Promise.all(facets.map((f) => listFacet(f.path))), category);
  const head = TITLES[category];

  return (
    <OutletPage>
      <OutletHead number={head.number} eyebrow="Colección" title={head.title} count={first ? `${first.total} ${head.many}` : ' '}>
        <div className="flex flex-wrap items-center gap-2.5 border-b border-line py-4">
          {facets.map((f, i) => (
            <OutletSelect
              key={f.key}
              aria-label={NAMES[f.key] ?? f.label}
              className="w-full sm:w-[220px]"
              value={filters[f.key] ?? ''}
              onChange={(e) => setParams({ [f.key]: e.target.value || null })}
            >
              <option value="">{NAMES[f.key] ?? f.label}</option>
              {/* La opción elegida, aunque aún no hayan llegado las demás. */}
              {!options && filters[f.key] ? <option value={filters[f.key]}>{filters[f.key]}</option> : null}
              {options?.[i]?.map((o) => (
                <option key={o.label} value={o.label}>
                  {o.label} ({o.count})
                </option>
              ))}
            </OutletSelect>
          ))}
          <div className="relative w-full sm:ml-auto sm:w-64">
            <label htmlFor="search" className="sr-only">
              Buscar por nombre
            </label>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" strokeWidth={1.5} aria-hidden />
            <input
              id="search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre"
              className="h-10 w-full rounded-full border border-ink/25 bg-white pl-10 pr-4 text-[13px] outline-none transition-colors placeholder:text-muted hover:border-ink focus:border-ink"
            />
          </div>
        </div>
      </OutletHead>

      {error ? (
        <div className={`${outletWidth} pt-6`}>
          <Notice tone="danger">
            {error}{' '}
            <button type="button" className="underline" onClick={() => void reload()}>
              Reintentar
            </button>
          </Notice>
        </div>
      ) : loading || !items ? (
        <OutletGridPlaceholder />
      ) : !items.length ? (
        <div className={outletWidth}>
          <OutletEmpty>{filters.q ? `No hay ningún modelo con «${filters.q}».` : 'No hay modelos con estos filtros.'}</OutletEmpty>
        </div>
      ) : (
        <>
          <ul className={outletGrid}>
            {items.map((item, i) => (
              <OutletGarmentCard
                key={item.dressId}
                index={i}
                href={`/probador?c=${category}&d=${item.dressId}`}
                imageUrl={item.imageUrl}
                name={item.name}
                action={<OutletFavorite dressId={item.dressId} initial={favoriteIds.has(item.dressId)} />}
              />
            ))}
          </ul>
          <div ref={sentinel} className="flex flex-col items-center gap-4 pb-16 pt-10">
            <p className="font-mono text-[11px] uppercase text-muted" aria-live="polite">
              {first ? `${items.length} de ${first.total} ${head.many}` : null}
            </p>
            {hasMore ? (
              <Button variant="secondary" loading={loadingMore} onClick={() => void loadMore()} className="px-10">
                Ver más
              </Button>
            ) : null}
          </div>
        </>
      )}
    </OutletPage>
  );
}
