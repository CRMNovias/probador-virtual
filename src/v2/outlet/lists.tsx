import { LinkButton, Notice } from '@v2/components/ui';
import { listFavorites, listTryOns } from '@v2/lib/api';
import { useLoad } from '@v2/lib/use-load';
import { OutletFavorite, OutletGarmentCard, OutletGridPlaceholder, outletGrid } from './cards';
import { OutletEmpty, OutletHead, OutletPage, outletWidth } from './shell';

const count = (n: number | undefined, one: string, many: string) => (n === undefined ? ' ' : `${n} ${n === 1 ? one : many}`);

/** Favoritos de Outlet: los modelos guardados, con la rejilla de la colección. */
export function OutletFavorites() {
  const { data: favorites, error, loading, setData } = useLoad(listFavorites);

  return (
    <OutletPage>
      <OutletHead
        eyebrow="Tu selección"
        title="Favoritos"
        sub="Los modelos que has guardado para volver a probártelos."
        count={count(favorites?.length, 'guardado', 'guardados')}
      />
      {error ? (
        <div className={`${outletWidth} pt-6`}>
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : loading ? (
        <OutletGridPlaceholder count={5} />
      ) : !favorites?.length ? (
        <div className={outletWidth}>
          <OutletEmpty action={<LinkButton href="/coleccion">Ver la colección</LinkButton>}>
            Aún no tienes favoritos. Pulsa el corazón sobre cualquier prenda para guardarla aquí.
          </OutletEmpty>
        </div>
      ) : (
        <ul className={outletGrid}>
          {favorites.map((f, i) => (
            <OutletGarmentCard
              key={f.dressId}
              index={i}
              href={`/probador?d=${f.dressId}`}
              imageUrl={f.imageUrl ?? f.dressImageUrl}
              name={f.dressName}
              action={
                <OutletFavorite dressId={f.dressId} initial onChange={(on) => !on && setData(favorites.filter((x) => x.dressId !== f.dressId))} />
              }
            />
          ))}
        </ul>
      )}
    </OutletPage>
  );
}

/** Galería de Outlet (sus pruebas), la más reciente primero, como en la V1. */
export function OutletTryOns() {
  const { data: groups, error, loading, reload } = useLoad(listTryOns);
  const tryOns = (groups ?? [])
    .flatMap((g) => g.tryOns.map((t) => ({ ...t, dressName: g.dressName })))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <OutletPage>
      <OutletHead number="03" eyebrow="Tus pruebas" title="Galería" count={count(groups ? tryOns.length : undefined, 'prueba', 'pruebas')} />
      {error ? (
        <div className={`${outletWidth} pt-6`}>
          <Notice tone="danger">
            No se pudieron cargar tus pruebas.{' '}
            <button type="button" className="underline" onClick={() => void reload()}>
              Reintentar
            </button>
          </Notice>
        </div>
      ) : loading ? (
        <OutletGridPlaceholder count={5} />
      ) : !tryOns.length ? (
        <div className={outletWidth}>
          <OutletEmpty action={<LinkButton href="/probador">Ir al probador</LinkButton>}>
            Aún no has generado ninguna prueba. Vuelve al probador y elige una prenda para empezar.
          </OutletEmpty>
        </div>
      ) : (
        <ul className={outletGrid}>
          {tryOns.map((t, i) => (
            <OutletGarmentCard
              key={t.id}
              index={i}
              href={`/probador?d=${t.dressId}&t=${t.id}`}
              imageUrl={t.turntable?.posterUrl ?? t.imageUrl}
              name={t.dressName}
              sub={new Date(t.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
              hover="Ver"
              badge={t.turntable?.status === 'ready' ? '360°' : null}
            />
          ))}
        </ul>
      )}
    </OutletPage>
  );
}
