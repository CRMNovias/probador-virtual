import { useParams } from 'react-router-dom';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/services/apiClient';
import { LinkButton } from '@v2/components/ui';
import { getGarment } from '@v2/lib/api';
import { brand } from '@v2/lib/brand';
import { useLoad } from '@v2/lib/use-load';

/**
 * Página pública de una prueba compartida. Dentro de la V1 se pinta en el
 * navegador (en la V2 era del servidor): mismas rutas públicas del CRM.
 */

interface Shared {
  imageUrl: string | null;
  dressName: string | null;
  wpId: number | null;
}

const loadShared = async (id: string, dressId: string | null): Promise<Shared> => {
  const [image, item] = await Promise.all([
    (apiClient.get(`/tryons/${encodeURIComponent(id)}/image`) as Promise<{ data?: { imageUrl?: string } }>).catch(() => null),
    dressId ? getGarment(dressId).catch(() => null) : null,
  ]);
  return {
    imageUrl: image?.data?.imageUrl ?? null,
    dressName: item?.name ?? null,
    wpId: item?.wpId ?? null,
  };
};

function SharedTryOn({ shared }: { shared: Shared }) {
  if (!shared.imageUrl) {
    return (
      <div className="mt-16 text-center">
        <h1 className="text-[20px] font-light uppercase tracking-[0.06em]">Esta prueba ya no está disponible</h1>
        <LinkButton href="/" className="mt-8">
          Ir al probador
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="md:mt-6 md:grid md:grid-cols-2 md:items-center md:gap-12">
      <div className="relative mt-6 aspect-[9/16] w-full overflow-hidden bg-studio md:mt-0">
        <img src={shared.imageUrl} alt={shared.dressName ? `Prueba con ${shared.dressName}` : 'Prueba virtual'} className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div>
        <h1 className="mt-6 text-[22px] font-light uppercase leading-tight tracking-[0.06em] md:mt-0 md:text-[28px]">
          {shared.dressName ? `Así me queda ${shared.dressName}` : 'Mi prueba virtual'}
        </h1>
        <p className="mt-2 text-[13px] text-muted">Recreación con IA en el probador virtual de {brand.name}.</p>
        <div className="mt-6 space-y-2">
          <LinkButton href="/" block>
            Pruébatelo tú
          </LinkButton>
          {shared.wpId ? (
            <a
              href={`${brand.website}/?p=${shared.wpId}`}
              className="inline-flex h-12 w-full items-center justify-center border border-ink text-[12px] font-medium uppercase tracking-[0.12em]"
            >
              Ver el modelo en la web
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function SharePage() {
  const { id = '' } = useParams();
  const dressId = useSearchParams().get('d');
  const { data: shared } = useLoad(() => loadShared(id, dressId), `${id}|${dressId ?? ''}`);

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 pb-12 pt-[max(env(safe-area-inset-top),1.25rem)] md:max-w-4xl md:px-8">
      <Image src={brand.logo} alt={brand.name} width={576} height={120} className={`${brand.logoClass} w-auto`} />
      {shared ? <SharedTryOn shared={shared} /> : <div className="mt-6 aspect-[9/16] w-full shimmer" />}
    </main>
  );
}
