import { Search } from 'lucide-react';
import { useCollection, type FacetKey } from '@v2/app/coleccion/use-collection';
import { Button, Notice } from '@v2/components/ui';
import { listFacet } from '@v2/lib/api';
import type { Category } from '@v2/lib/types';
import { useLoad } from '@v2/lib/use-load';
import { SedkaEmpty, SedkaFavorite, SedkaGarmentCard, SedkaGridPlaceholder, sedkaGrid } from './cards';
import { SedkaHead, SedkaPage } from './shell';

const TABS: { id: Category; label: string; many: string }[] = [
  { id: 'bride', label: 'Vestidos', many: 'vestidos' },
  { id: 'groom', label: 'Trajes', many: 'trajes' },
];

const ALL: Partial<Record<FacetKey, string>> = {
  brand: 'Todas las marcas',
  cut: 'Todos los cortes',
  suitType: 'Todos los estilos',
  color: 'Todos los colores',
};

/** Desplegable de la V1: caja crema redondeada con la flecha dorada. */
export function SedkaSelect({ className = '', ...rest }: React.ComponentProps<'select'>) {
  return (
    <span className={`relative block after:pointer-events-none after:absolute after:right-4 after:top-1/2 after:size-2 after:-translate-y-[70%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-accent ${className}`}>
      <select
        {...rest}
        className="h-[42px] w-full cursor-pointer appearance-none rounded-lg border border-line bg-studio py-0 pl-[15px] pr-10 text-[14px] outline-none transition-colors focus:border-accent focus:bg-white"
      />
    </span>
  );
}

/** Colección de Sedka: la de su V1 (Vestidos / Trajes, filtros en desplegables y rejilla Pinterest). */
export function SedkaCollection() {
  const { category, facets, filters, setParams, query, setQuery, first, error, loading, reload, items, hasMore, loadMore, loadingMore, sentinel, favoriteIds, showCategory } =
    useCollection();
  // Los desplegables necesitan sus opciones desde el principio (en Atelier se piden al abrir cada filtro).
  const { data: options } = useLoad(() => Promise.all(facets.map((f) => listFacet(f.path))), category);
  const tab = TABS.find((t) => t.id === category) ?? TABS[0]!;

  return (
    <SedkaPage>
      <SedkaHead eyebrow="La colección" title="Colección" sub="Pruébate virtualmente todos nuestros diseños de novia y novio." />

      <div className="mx-auto max-w-[1180px] px-[18px] sm:px-[22px]">
        <div role="tablist" aria-label="Colección" className="flex">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={category === t.id}
              onClick={() => showCategory(t.id)}
              className={`border border-accent px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.26em] transition-colors first:border-r-0 sm:px-[30px] ${
                category === t.id ? 'bg-accent text-white' : 'bg-white text-accent hover:bg-accent/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-line py-4">
          {facets.map((f, i) => (
            <label key={f.key} className="flex w-full min-w-0 items-center gap-3.5 sm:w-auto">
              <span className="w-[52px] shrink-0 text-[11px] uppercase tracking-[0.22em] text-muted sm:w-auto">{f.label}</span>
              <SedkaSelect
                className="min-w-0 flex-1 sm:w-[260px] sm:flex-none"
                value={filters[f.key] ?? ''}
                onChange={(e) => setParams({ [f.key]: e.target.value || null })}
              >
                <option value="">{ALL[f.key] ?? 'Todos'}</option>
                {/* La opción elegida, aunque aún no hayan llegado las demás. */}
                {!options && filters[f.key] ? <option value={filters[f.key]}>{filters[f.key]}</option> : null}
                {options?.[i]?.map((o) => (
                  <option key={o.label} value={o.label}>
                    {o.label} ({o.count})
                  </option>
                ))}
              </SedkaSelect>
            </label>
          ))}
          <div className="relative w-full sm:ml-auto sm:w-64">
            <label htmlFor="search" className="sr-only">
              Buscar por nombre
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" strokeWidth={1.5} aria-hidden />
            <input
              id="search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre"
              className="h-[42px] w-full rounded-lg border border-line bg-studio pl-10 pr-3 text-[14px] outline-none transition-colors placeholder:text-muted focus:border-accent focus:bg-white"
            />
          </div>
        </div>

        <p className="pt-[18px] text-right text-[11px] uppercase tracking-[0.18em] text-muted" aria-live="polite">
          {first && items ? `${items.length} de ${first.total} ${tab.many}` : ' '}
        </p>
      </div>

      {error ? (
        <div className="mx-auto max-w-[1180px] px-[18px] pt-4 sm:px-[22px]">
          <Notice tone="danger">
            {error}{' '}
            <button type="button" className="underline" onClick={() => void reload()}>
              Reintentar
            </button>
          </Notice>
        </div>
      ) : loading || !items ? (
        <SedkaGridPlaceholder />
      ) : !items.length ? (
        <SedkaEmpty>{filters.q ? `No hay ningún diseño con «${filters.q}».` : 'No hay diseños con estos filtros.'}</SedkaEmpty>
      ) : (
        <>
          <ul className={sedkaGrid}>
            {items.map((item, i) => (
              <SedkaGarmentCard
                key={item.dressId}
                index={i}
                href={`/probador?c=${category}&d=${item.dressId}`}
                imageUrl={item.imageUrl}
                name={item.name}
                sub={item.brand}
                action={<SedkaFavorite dressId={item.dressId} initial={favoriteIds.has(item.dressId)} />}
              />
            ))}
          </ul>
          <div ref={sentinel} className="flex justify-center pb-[60px] pt-[30px]">
            {hasMore ? (
              <Button variant="secondary" loading={loadingMore} onClick={() => void loadMore()} className="px-10">
                Ver más
              </Button>
            ) : null}
          </div>
        </>
      )}
    </SedkaPage>
  );
}
