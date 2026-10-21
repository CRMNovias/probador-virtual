import { GarmentCard, garmentGrid } from '@v2/components/garment-card';
import { LinkButton, Notice } from '@v2/components/ui';
import { listTryOns } from '@v2/lib/api';
import { useLoad } from '@v2/lib/use-load';

/** Todas las pruebas, la más reciente primero, con su imagen a la vista. */
export function MyTryOns() {
  const { data: groups, error, loading, reload } = useLoad(listTryOns);

  if (error) {
    return (
      <div className="mt-4">
        <Notice tone="danger">
          No se pudieron cargar tus pruebas.{' '}
          <button type="button" className="underline" onClick={() => void reload()}>
            Reintentar
          </button>
        </Notice>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`mt-4 ${garmentGrid}`}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="aspect-[9/16] shimmer" />
        ))}
      </div>
    );
  }

  const tryOns = (groups ?? [])
    .flatMap((g) => g.tryOns.map((t) => ({ ...t, dressName: g.dressName })))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (!tryOns.length) {
    return (
      <div className="py-20 text-center">
        <p className="label-caps">Aún no te has probado nada</p>
        <p className="mt-2 text-[13px] text-muted">Elige un vestido o traje y míralo sobre tu avatar.</p>
        <LinkButton href="/probador" className="mt-6">
          Ir al probador
        </LinkButton>
      </div>
    );
  }

  return (
    <ul className={`mt-4 ${garmentGrid}`}>
      {tryOns.map((t) => (
        <GarmentCard
          key={t.id}
          href={`/probador?d=${t.dressId}&t=${t.id}`}
          imageUrl={t.turntable?.posterUrl ?? t.imageUrl}
          name={t.dressName}
          detail={new Date(t.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
          aspect="aspect-[9/16]"
          badge={t.turntable?.status === 'ready' ? '360°' : null}
        />
      ))}
    </ul>
  );
}
