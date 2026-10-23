import { useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams as useRouterSearchParams } from 'react-router-dom';
import { withBase, withoutBase } from '@v2/lib/base-path';

/**
 * `next/navigation` para la V2 dentro de la V1, con React Router. Las rutas se
 * escriben sin el prefijo (como en la V2) y aquí se le añade el suyo (base-path).
 */

interface NavigateOptions {
  scroll?: boolean;
}

export function useRouter() {
  const navigate = useNavigate();
  return useMemo(
    () => ({
      push: (href: string, options?: NavigateOptions) => {
        navigate(withBase(href));
        if (options?.scroll !== false) window.scrollTo(0, 0);
      },
      replace: (href: string, options?: NavigateOptions) => {
        navigate(withBase(href), { replace: true });
        if (options?.scroll !== false) window.scrollTo(0, 0);
      },
      back: () => navigate(-1),
    }),
    [navigate],
  );
}

/** Parámetros de la URL, de solo lectura como en Next. */
export function useSearchParams(): URLSearchParams {
  return useRouterSearchParams()[0];
}

/** Ruta actual sin el prefijo de la V2. */
export function usePathname(): string {
  return withoutBase(useLocation().pathname);
}
