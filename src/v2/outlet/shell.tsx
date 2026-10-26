import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Menu, UserRound, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { logout } from '@v2/lib/api';
import { brand } from '@v2/lib/brand';

/**
 * El probador de Outlet con la disposición de su V1 (probador-outlet.crmnovias.com/v1):
 * el logo en dos líneas, el menú en mayúsculas espaciadas bajo una raya negra,
 * títulos gruesos con su número delante y cajas de esquinas rectas. Lo que hace
 * cada pantalla es lo mismo que en Atelier; solo cambia cómo se ve.
 */

type Section = { href: string; label: string; active: (pathname: string, groom: boolean) => boolean };

const NAV: Section[] = [
  { href: '/probador', label: 'Probador', active: (p) => p.startsWith('/probador') },
  { href: '/mis-pruebas', label: 'Galería', active: (p) => p.startsWith('/mis-pruebas') },
  { href: '/coleccion', label: 'Colección novia', active: (p, groom) => p.startsWith('/coleccion') && !groom },
  { href: '/coleccion?c=groom', label: 'Colección novio', active: (p, groom) => p.startsWith('/coleccion') && groom },
  { href: '/favoritos', label: 'Favoritos', active: (p) => p.startsWith('/favoritos') },
  { href: '/citas', label: 'Citas', active: (p) => p.startsWith('/citas') || p.startsWith('/cita/') },
];

/** Cabecera de la V1: logo y cuenta arriba; las secciones debajo, sobre la raya negra. */
export function OutletTopBar() {
  const pathname = usePathname();
  const groom = useSearchParams().get('c') === 'groom';
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  // Al cambiar de pantalla, los menús se cierran.
  useEffect(() => {
    setOpen(false);
    setAccount(false);
  }, [pathname, groom]);

  // El menú de la cuenta se cierra al pulsar fuera.
  useEffect(() => {
    if (!account) return;
    const close = (e: PointerEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) setAccount(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [account]);

  const signOut = async () => {
    await logout().catch(() => undefined);
    router.replace('/');
  };

  const name = user?.name?.trim() || 'Mi cuenta';

  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-white pt-[env(safe-area-inset-top)]">
      <div className="relative flex items-center justify-between px-5 py-3 lg:px-16 lg:py-5">
        <Link href={brand.home} aria-label={`${brand.name}, ir al probador`}>
          <Image src={brand.logo} alt={brand.name} width={731} height={336} className="h-9 w-auto lg:h-[50px]" priority />
        </Link>

        {/* Ordenador: la cuenta, con su menú */}
        <div ref={accountRef} className="relative hidden lg:block">
          <button
            type="button"
            onClick={() => setAccount(!account)}
            aria-expanded={account}
            aria-controls="outlet-cuenta"
            className="flex items-center gap-2.5 text-[13px] text-ink/80 hover:text-ink"
          >
            <span className="grid size-8 place-items-center rounded-full bg-ink text-white">
              <UserRound className="size-4" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="max-w-[16ch] truncate">{name}</span>
            <ChevronDown className={`size-4 transition-transform ${account ? 'rotate-180' : ''}`} strokeWidth={1.5} aria-hidden />
          </button>
          {account ? (
            <div id="outlet-cuenta" className="absolute right-0 top-full z-40 mt-3 w-48 border border-ink bg-white py-1 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
              <Link href="/perfil" className="block px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-studio">
                Mi perfil
              </Link>
              <button
                type="button"
                onClick={() => void signOut()}
                className="block w-full px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-studio"
              >
                Salir
              </button>
            </div>
          ) : null}
        </div>

        {/* Móvil y tablet: hamburguesa */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="outlet-menu"
          aria-label={open ? 'Cerrar el menú' : 'Abrir el menú'}
          className="-mr-2 grid size-11 place-items-center lg:hidden"
        >
          {open ? <X className="size-6" strokeWidth={1.5} aria-hidden /> : <Menu className="size-6" strokeWidth={1.75} aria-hidden />}
        </button>
      </div>

      <nav
        id="outlet-menu"
        aria-label="Secciones"
        className={`${open ? 'flex' : 'hidden'} absolute inset-x-0 top-full flex-col border-b-2 border-ink bg-white lg:static lg:flex lg:flex-row lg:justify-center lg:gap-10 lg:border-b-0 lg:border-t lg:border-line`}
      >
        {NAV.map(({ href, label, active }) => {
          const on = active(pathname, groom);
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? 'page' : undefined}
              className={`border-b border-line px-5 py-4 text-[11px] uppercase tracking-[0.3em] lg:border-b-0 lg:px-0 lg:py-3.5 ${
                on ? 'font-bold text-ink' : 'font-medium text-muted hover:text-ink'
              }`}
            >
              {label}
            </Link>
          );
        })}
        <Link
          href="/perfil"
          aria-current={pathname.startsWith('/perfil') ? 'page' : undefined}
          className={`border-b border-line px-5 py-4 text-[11px] uppercase tracking-[0.3em] lg:hidden ${pathname.startsWith('/perfil') ? 'font-bold' : 'font-medium text-muted'}`}
        >
          Mi perfil
        </Link>
        <button type="button" onClick={() => void signOut()} className="px-5 py-4 text-left text-[11px] font-medium uppercase tracking-[0.3em] text-muted lg:hidden">
          Salir
        </button>
      </nav>
    </header>
  );
}

/** Pantalla con la cabecera; el contenido decide su ancho. */
export function OutletPage({ children }: { children: ReactNode }) {
  return (
    <>
      <OutletTopBar />
      <main className="pb-16">{children}</main>
    </>
  );
}

/** Ancho de las secciones (colección, galería, citas). */
export const outletWidth = 'mx-auto w-full max-w-[1180px] px-5 sm:px-8';

/** Cabecera de sección de la V1: número, antetítulo, título grueso y la cuenta a la derecha («196 vestidos»). */
export function OutletHead({
  number,
  eyebrow,
  title,
  sub,
  count,
  action,
  children,
}: {
  /** El número de la sección en la V1 (01 novia, 02 novio, 03 galería, 04 citas, 05 perfil). */
  number?: string;
  eyebrow: string;
  title: string;
  sub?: ReactNode;
  count?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={`${outletWidth} pt-9 sm:pt-12`}>
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {number ? <p className="mb-2.5 font-mono text-[11px] text-muted">{number}</p> : null}
          <p className="text-[10px] uppercase tracking-[0.34em] text-muted">{eyebrow}</p>
          <h1 className="mt-1 text-[44px] font-bold leading-[1.05] tracking-[-0.01em] sm:text-[60px]">{title}</h1>
          {sub ? <p className="mt-2 max-w-[520px] text-[14px] leading-normal text-muted">{sub}</p> : null}
        </div>
        {count || action ? (
          <div className="flex items-center justify-between gap-4 sm:justify-end sm:pb-2">
            {count ? <p className="font-mono text-[11px] uppercase text-muted">{count}</p> : <span />}
            {action}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/** Título de las pantallas centradas (acceso, datos, avatar): logo, paso, antetítulo, título y entradilla. */
export function OutletCardHead({ step, eyebrow, title, lead, logo = false }: { step?: string; eyebrow: string; title: string; lead?: ReactNode; logo?: boolean }) {
  return (
    <div className="text-center">
      {logo ? <Image src={brand.logo} alt={brand.name} width={731} height={336} className="mx-auto mb-9 h-[58px] w-auto" priority /> : null}
      {step ? <p className="mb-2 font-mono text-[11px] text-muted">{step}</p> : null}
      <p className="mb-2 text-[10px] uppercase tracking-[0.34em] text-muted">{eyebrow}</p>
      <h1 className="text-[32px] font-bold leading-[1.08] tracking-[-0.01em] sm:text-[38px]">{title}</h1>
      <div className="mb-8 mt-3 text-[14px] leading-relaxed text-muted">{lead}</div>
    </div>
  );
}

/** Pantalla gris claro con la columna centrada, como el acceso de la V1. */
export function OutletCardScreen({ children, wide = false, header = false }: { children: ReactNode; wide?: boolean; header?: boolean }) {
  return (
    <>
      {header ? <OutletTopBar /> : null}
      <main className={`flex flex-col items-center justify-center bg-studio px-4 py-10 sm:px-5 ${header ? 'min-h-[calc(100dvh-4rem)] lg:min-h-[calc(100dvh-8.5rem)]' : 'min-h-dvh'}`}>
        <div className={`w-full border border-ink bg-white px-4 py-9 sm:px-9 ${wide ? 'max-w-[560px]' : 'max-w-[440px]'}`}>{children}</div>
      </main>
    </>
  );
}

/** Caja vacía de la V1: «Vacío» en letra de máquina y el texto debajo. */
export function OutletEmpty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mt-8 border border-line px-6 py-12 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Vacío</p>
      <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed text-ink/80">{children}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

/** Antetítulo en mayúsculas muy espaciadas de los bloques («Prenda seleccionada», «Datos personales»). */
export const outletLabel = 'text-[10px] font-medium uppercase tracking-[0.3em] text-muted';

/** Rueda negra de espera. */
export function OutletSpinner({ className = '' }: { className?: string }) {
  return <span className={`inline-block size-[34px] animate-spin rounded-full border-[3px] border-ink/15 border-t-ink ${className}`} aria-hidden />;
}
