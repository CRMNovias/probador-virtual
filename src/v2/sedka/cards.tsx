import Link from 'next/link';
import type { ReactNode } from 'react';
import { FavoriteButton } from '@v2/components/favorite-button';

/**
 * Rejilla de Sedka como la de su V1: columnas tipo Pinterest, fotos con las
 * esquinas redondeadas y alturas escalonadas (las del catálogo comparten
 * proporción, así que se varían por posición para romper la rejilla).
 */
const RATIOS = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-[2/3]', 'aspect-[5/7]', 'aspect-[3/4.5]', 'aspect-[4/6.2]'];

export const sedkaGrid = 'mx-auto max-w-[1180px] columns-2 gap-3 px-[18px] pb-2.5 pt-3.5 sm:px-[22px] md:columns-3 md:gap-4 lg:columns-4';

export function SedkaGarmentCard({
  href,
  imageUrl,
  name,
  sub,
  index,
  ratio,
  hover = 'Probar',
  badge,
  action,
}: {
  href: string;
  imageUrl: string | null;
  name: string;
  sub?: ReactNode;
  index: number;
  /** Sin proporción, la escalonada de la posición. */
  ratio?: string;
  hover?: string;
  badge?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <li className="relative mb-[18px] inline-block w-full break-inside-avoid">
      <Link href={href} className="group block">
        <div className={`relative w-full overflow-hidden rounded-2xl bg-studio ${ratio ?? RATIOS[index % RATIOS.length]}`}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- imágenes del CRM (catálogo y pruebas)
            <img src={imageUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[center_16%]" />
          ) : null}
          <span className="absolute inset-0 bg-[rgba(20,16,12,0)] transition-colors duration-300 group-hover:bg-[rgba(20,16,12,0.42)]" aria-hidden />
          <span className="absolute inset-x-0 bottom-[22px] text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {hover}
          </span>
          {badge ? (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">{badge}</span>
          ) : null}
        </div>
        <p className="mx-1 mb-0.5 mt-3 text-center text-[11px] font-semibold uppercase leading-[1.45] tracking-[0.14em]">{name}</p>
        {sub ? <p className="mx-1 text-center text-[10px] uppercase tracking-[0.16em] text-muted">{sub}</p> : null}
      </Link>
      {action ? <div className="absolute right-2.5 top-2.5">{action}</div> : null}
    </li>
  );
}

/** El corazón sobre la foto: círculo blanco, dorado al marcarlo. */
export function SedkaFavorite({ dressId, initial, onChange }: { dressId: string; initial: boolean; onChange?: (on: boolean) => void }) {
  return (
    <FavoriteButton
      dressId={dressId}
      initial={initial}
      {...(onChange ? { onChange } : {})}
      onClass="fill-accent text-accent"
      className="!size-[34px] rounded-full bg-white/80 text-[#b9b3ab] transition hover:scale-[1.08] hover:bg-white hover:text-accent"
    />
  );
}

/** Rejilla de espera mientras llega el catálogo. */
export function SedkaGridPlaceholder({ count = 8 }: { count?: number }) {
  return (
    <ul className={sedkaGrid} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={`mb-[18px] inline-block w-full rounded-2xl shimmer ${RATIOS[i % RATIOS.length]}`} />
      ))}
    </ul>
  );
}

/** Texto de lista vacía, como en la V1. */
export function SedkaEmpty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="px-5 py-[60px] text-center text-muted">
      <p className="mx-auto max-w-md text-[16px]">{children}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
