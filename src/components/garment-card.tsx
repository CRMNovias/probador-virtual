import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Ficha de prenda en rejilla, como en Zara: foto a sangre, nombre en
 * mayúsculas pequeñas y el corazón a la derecha del nombre (fuera del enlace).
 */
export function GarmentCard({
  href,
  imageUrl,
  name,
  detail,
  aspect = 'aspect-[3/4]',
  badge,
  action,
}: {
  href: string;
  imageUrl: string | null;
  name: string;
  detail?: string | null;
  aspect?: string;
  badge?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <li className="relative">
      <Link href={href} className="group block">
        <div className={`relative ${aspect} overflow-hidden bg-studio`}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- imágenes del CRM (catálogo y pruebas)
            <img
              src={imageUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.02]"
            />
          ) : null}
          {badge ? <span className="label-caps absolute left-2 top-2 bg-white/90 px-1.5 py-0.5 text-[10px]!">{badge}</span> : null}
        </div>
        <div className={`px-2 pb-1 pt-2 ${action ? 'pr-10' : ''}`}>
          <p className="truncate text-[11px] uppercase tracking-[0.08em]">{name}</p>
          {detail ? <p className="truncate text-[11px] text-muted">{detail}</p> : null}
        </div>
      </Link>
      {action ? <div className="absolute bottom-0 right-0">{action}</div> : null}
    </li>
  );
}

/** Rejilla a sangre con separación mínima. */
export const garmentGrid = '-mx-4 grid grid-cols-2 gap-x-0.5 gap-y-5 sm:grid-cols-3 lg:mx-0 lg:grid-cols-4 lg:gap-x-1 lg:gap-y-8 xl:grid-cols-5';
