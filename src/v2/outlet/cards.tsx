import Link from 'next/link';
import type { ReactNode } from 'react';
import { FavoriteButton } from '@v2/components/favorite-button';
import { outletWidth } from './shell';

/**
 * Rejilla de Outlet como la de su V1: fotos iguales de esquinas rectas, muy
 * juntas, con su número en la esquina y el nombre en mayúsculas debajo.
 */
export const outletGrid = `${outletWidth} grid grid-cols-2 gap-x-1.5 gap-y-5 pt-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`;

export function OutletGarmentCard({
  href,
  imageUrl,
  name,
  sub,
  index,
  hover = 'Probar',
  badge,
  action,
}: {
  href: string;
  imageUrl: string | null;
  name: string;
  sub?: ReactNode;
  index: number;
  hover?: string;
  badge?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <li className="relative">
      <Link href={href} className="group block">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-studio">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- imágenes del CRM (catálogo y pruebas)
            <img
              src={imageUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-[center_16%] transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : null}
          <span className="absolute left-2 top-2 font-mono text-[10px] text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">{String(index + 1).padStart(3, '0')}</span>
          <span className="absolute inset-x-0 bottom-0 bg-ink py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {hover}
          </span>
          {badge ? <span className="absolute bottom-2 left-2 bg-white px-2 py-1 font-mono text-[10px] uppercase text-ink group-hover:hidden">{badge}</span> : null}
        </div>
        <p className="mx-1 mt-2.5 text-center text-[11px] font-bold uppercase leading-[1.4] tracking-[0.18em]">{name}</p>
        {sub ? <p className="mx-1 mt-0.5 text-center text-[10px] uppercase tracking-[0.16em] text-muted">{sub}</p> : null}
      </Link>
      {action ? <div className="absolute right-1.5 top-1.5">{action}</div> : null}
    </li>
  );
}

/** El corazón sobre la foto: cuadrado blanco, negro al marcarlo. */
export function OutletFavorite({ dressId, initial, onChange }: { dressId: string; initial: boolean; onChange?: (on: boolean) => void }) {
  return (
    <FavoriteButton
      dressId={dressId}
      initial={initial}
      {...(onChange ? { onChange } : {})}
      onClass="fill-ink text-ink"
      className="!size-[34px] bg-white/90 text-ink/60 transition hover:bg-white hover:text-ink"
    />
  );
}

/** Rejilla de espera mientras llega el catálogo. */
export function OutletGridPlaceholder({ count = 10 }: { count?: number }) {
  return (
    <ul className={outletGrid} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <span className="block aspect-[3/4] w-full shimmer" />
          <span className="mx-auto mt-3 block h-2.5 w-1/2 shimmer" />
        </li>
      ))}
    </ul>
  );
}
