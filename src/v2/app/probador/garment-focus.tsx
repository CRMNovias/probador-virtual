import { ArrowLeft, Check } from 'lucide-react';
import type { CollectionItem } from '@v2/lib/types';

/** Nombre de la transición que amplía la prenda desde la lista (ver zoom en probador-screen). */
export const FOCUS_TRANSITION = 'prenda-elegida';

/** Sin View Transitions, la prenda aparece con un zoom de CSS. */
const supportsViewTransitions = () => typeof document !== 'undefined' && 'startViewTransition' in document;

/**
 * La prenda elegida, en grande: se amplía desde la lista para que se vea qué
 * se ha elegido. «Ver otros modelos» vuelve a la lista para elegir otra.
 */
export function GarmentFocus({ garment, tried, onBack }: { garment: CollectionItem; tried: boolean; onBack: () => void }) {
  const detail = [garment.cut, garment.color].filter(Boolean).join(' · ');

  return (
    <div className="flex gap-4 px-4 py-3 md:px-6 lg:min-h-0 lg:flex-1 lg:flex-col lg:items-center lg:gap-4 lg:overflow-y-auto lg:py-4">
      <div
        className={`relative aspect-[3/4] w-[112px] shrink-0 overflow-hidden bg-studio md:w-[132px] lg:w-full lg:max-w-[320px] ${supportsViewTransitions() ? '' : 'zoom-in'}`}
        style={{ viewTransitionName: FOCUS_TRANSITION }}
      >
        <img src={garment.imageUrl} alt={garment.name} className="h-full w-full object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between lg:w-full lg:max-w-[320px] lg:flex-none">
        <div>
          <p className="label-caps truncate !text-[13px]">{garment.name}</p>
          {detail ? <p className="mt-1 truncate text-[12px] text-muted">{detail}</p> : null}
          {tried ? (
            <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted">
              <Check className="size-3" aria-hidden />
              Ya te lo has probado
            </p>
          ) : null}
        </div>
        <button type="button" onClick={onBack} className="label-caps mt-3 inline-flex h-9 items-center gap-1.5 self-start border border-ink px-3">
          <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
          Ver otros modelos
        </button>
      </div>
    </div>
  );
}
