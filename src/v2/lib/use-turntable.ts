import { useEffect, useState } from 'react';
import type { Turntable } from './types';

const POLL_MS = 4000;
const GIVE_UP_MS = 6 * 60 * 1000;

/**
 * Pide el vídeo 360 (y las fotos de detalle) y consulta su estado hasta que
 * están listos. Si el CRM aún no ofrece el 360 (`none`), se queda con la imagen fija.
 */
export function useTurntable(key: string | null, fetchTurntable: (start: boolean) => Promise<Turntable>) {
  const [state, setState] = useState<{ key: string | null; value: Turntable | null }>({ key: null, value: null });

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    let timer: number | undefined;
    const started = Date.now();

    const poll = async (start: boolean) => {
      try {
        const t = await fetchTurntable(start);
        if (cancelled) return;
        setState({ key, value: t });
        const pending = t.status === 'processing' || t.details?.status === 'processing';
        if (pending && Date.now() - started < GIVE_UP_MS) {
          timer = window.setTimeout(() => void poll(false), POLL_MS);
        }
      } catch {
        if (!cancelled) setState({ key, value: { status: 'failed' } });
      }
    };
    void poll(true);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // fetchTurntable cambia en cada render; la clave identifica el recurso.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state.key === key ? state.value : null;
}

export const turntableLabel = (t: Turntable | null): string | null =>
  t === null || t.status === 'processing' ? 'Preparando la vista 360°…' : null;
