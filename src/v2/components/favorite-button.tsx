import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleFavorite } from '@v2/lib/api';

/** Corazón para «Guardados». Cambia al momento y se revierte si el CRM falla. */
export function FavoriteButton({
  dressId,
  initial,
  onChange,
  className = '',
  onClass = 'fill-ink',
}: {
  dressId: string;
  initial: boolean;
  onChange?: (favorited: boolean) => void;
  className?: string;
  /** Cómo se ve el corazón marcado (Sedka: dorado). */
  onClass?: string;
}) {
  // Los favoritos llegan después que la lista: hasta que la clienta toca, manda `initial`.
  const [override, setOverride] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const on = override ?? initial;

  const toggle = async () => {
    if (busy) return;
    const next = !on;
    setOverride(next);
    setBusy(true);
    try {
      const saved = await toggleFavorite(dressId);
      setOverride(saved);
      onChange?.(saved);
    } catch {
      setOverride(!next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      aria-pressed={on}
      aria-label={on ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      className={`grid size-10 place-items-center ${className}`}
    >
      <Heart className={`size-[18px] ${on ? onClass : ''}`} strokeWidth={1.25} aria-hidden />
    </button>
  );
}
