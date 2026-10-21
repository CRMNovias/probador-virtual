import { Suspense } from 'react';
import type { Metadata } from 'next';
import { cacheLife } from 'next/cache';
import Image from 'next/image';
import { LinkButton } from '@/components/ui';
import { brand } from '@/lib/brand';
import { crmFetch, crmPath } from '@/lib/server/crm';

/**
 * Página pública de una prueba compartida. Se pinta en el servidor para que
 * WhatsApp e Instagram muestren la imagen de la prueba en la vista previa.
 * Solo usa rutas públicas del CRM (las mismas que la V1).
 */

interface Shared {
  imageUrl: string | null;
  dressName: string | null;
  wpId: number | null;
}

const loadShared = async (id: string, dressId: string | null): Promise<Shared> => {
  'use cache';
  cacheLife('hours');
  const [image, item] = await Promise.all([
    crmFetch(`/tryons/${encodeURIComponent(id)}/image`).then((r) => (r.ok ? r.json() : null)),
    dressId
      ? crmFetch(crmPath.probador(`collections/item?dressId=${encodeURIComponent(dressId)}`)).then((r) => (r.ok ? r.json() : null))
      : null,
  ]);
  return {
    imageUrl: image?.data?.imageUrl ?? null,
    dressName: item?.data?.name ?? null,
    wpId: item?.data?.wpId ?? null,
  };
};

export async function generateMetadata({ params, searchParams }: PageProps<'/c/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const { d } = await searchParams;
  const shared = await loadShared(id, typeof d === 'string' ? d : null);
  const title = shared.dressName ? `Mi prueba con ${shared.dressName}` : 'Mi prueba virtual';
  return {
    title,
    description: `Pruébatelo tú también en el probador virtual de ${brand.name}.`,
    openGraph: { title, images: shared.imageUrl ? [{ url: shared.imageUrl }] : [] },
    twitter: { card: 'summary_large_image' },
    robots: { index: false },
  };
}

async function SharedTryOn({ params, searchParams }: PageProps<'/c/[id]'>) {
  const { id } = await params;
  const { d } = await searchParams;
  const shared = await loadShared(id, typeof d === 'string' ? d : null);

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
        {/* eslint-disable-next-line @next/next/no-img-element -- imagen del CRM (S3) */}
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

export default function SharePage(props: PageProps<'/c/[id]'>) {
  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 pb-12 pt-[max(env(safe-area-inset-top),1.25rem)] md:max-w-4xl md:px-8">
      <Image src={brand.logo} alt={brand.name} width={576} height={120} className="h-8 w-auto" />
      <Suspense fallback={<div className="mt-6 aspect-[9/16] w-full shimmer" />}>
        <SharedTryOn {...props} />
      </Suspense>
    </main>
  );
}
