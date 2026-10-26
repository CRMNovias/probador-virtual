import { LinkButton, Notice } from '@v2/components/ui';
import { listFavorites, listTryOns } from '@v2/lib/api';
import { useLoad } from '@v2/lib/use-load';
import { SedkaEmpty, SedkaFavorite, SedkaGarmentCard, SedkaGridPlaceholder, sedkaGrid } from './cards';
import { SedkaHead, SedkaPage } from './shell';

/** Favoritos de Sedka, como en su V1: «Tu selección», con la rejilla de la colección. */
export function SedkaFavorites() {
  const { data: favorites, error, loading, setData } = useLoad(listFavorites);

  return (
    <SedkaPage>
      <SedkaHead eyebrow="Tu selección" title="Favoritos" sub="Los diseños que has guardado. Pruébatelos o resérvalos en tienda." />
      {error ? (
        <div className="mx-auto max-w-[1180px] px-[18px] sm:px-[22px]">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : loading ? (
        <SedkaGridPlaceholder count={4} />
      ) : !favorites?.length ? (
        <SedkaEmpty action={<LinkButton href="/coleccion">Ver la colección</LinkButton>}>
          Aún no has guardado ningún diseño. Toca el corazón en cualquier vestido o traje para añadirlo.
        </SedkaEmpty>
      ) : (
        <ul className={sedkaGrid}>
          {favorites.map((f, i) => (
            <SedkaGarmentCard
              key={f.dressId}
              index={i}
              href={`/probador?d=${f.dressId}`}
              imageUrl={f.imageUrl ?? f.dressImageUrl}
              name={f.dressName}
              action={
                <SedkaFavorite
                  dressId={f.dressId}
                  initial
                  onChange={(on) => !on && setData(favorites.filter((x) => x.dressId !== f.dressId))}
                />
              }
            />
          ))}
        </ul>
      )}
    </SedkaPage>
  );
}

/** Mis pruebas de Sedka: «Tu galería», la más reciente primero. */
export function SedkaTryOns() {
  const { data: groups, error, loading, reload } = useLoad(listTryOns);
  const tryOns = (groups ?? [])
    .flatMap((g) => g.tryOns.map((t) => ({ ...t, dressName: g.dressName })))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <SedkaPage>
      <SedkaHead eyebrow="Tu galería" title="Mis pruebas" sub="Todos los diseños que te has probado virtualmente." />
      {error ? (
        <div className="mx-auto max-w-[1180px] px-[18px] sm:px-[22px]">
          <Notice tone="danger">
            No se pudieron cargar tus pruebas.{' '}
            <button type="button" className="underline" onClick={() => void reload()}>
              Reintentar
            </button>
          </Notice>
        </div>
      ) : loading ? (
        <SedkaGridPlaceholder count={4} />
      ) : !tryOns.length ? (
        <SedkaEmpty action={<LinkButton href="/coleccion">Ver la colección</LinkButton>}>Aún no te has probado ningún diseño.</SedkaEmpty>
      ) : (
        <ul className={sedkaGrid}>
          {tryOns.map((t, i) => (
            <SedkaGarmentCard
              key={t.id}
              index={i}
              ratio="aspect-[3/4]"
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
    </SedkaPage>
  );
}
