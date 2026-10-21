'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from './api';
import { withoutBase } from './base-path';

interface LoadState<T> {
  key: string;
  data: T | null;
  error: string | null;
  done: boolean;
}

/**
 * Carga datos del CRM con estado de carga y error, y manda a /entrar si la
 * sesión caduca. `key` identifica la consulta: si cambia, se vuelve a cargar.
 */
export function useLoad<T>(load: () => Promise<T>, key = '') {
  const router = useRouter();
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<LoadState<T>>({ key, data: null, error: null, done: false });

  useEffect(() => {
    let cancelled = false;
    load()
      .then((data) => {
        if (!cancelled) setState({ key, data, error: null, done: true });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 401) {
          router.replace(`/entrar?next=${encodeURIComponent(withoutBase(window.location.pathname))}`);
          return;
        }
        setState({ key, data: null, error: e instanceof Error ? e.message : 'No se pudo cargar.', done: true });
      });
    return () => {
      cancelled = true;
    };
    // `load` cambia en cada render; la consulta la identifican `key` y `nonce`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, nonce]);

  const current = state.key === key;
  const setData = useCallback((data: T) => setState((s) => ({ ...s, data })), []);

  return {
    data: current ? state.data : null,
    error: current ? state.error : null,
    loading: !current || !state.done,
    reload: () => setNonce((n) => n + 1),
    setData,
  };
}
