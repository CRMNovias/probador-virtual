'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { ArrowLeft, Heart, Images, LayoutGrid, Shirt, UserRound, type LucideIcon } from 'lucide-react';
import { brand } from '@/lib/brand';

interface NavItem {
  href: string;
  label: string;
  /** Rutas que también marcan la sección como activa. */
  also: readonly string[];
  /** En móvil: icono de la barra inferior (sin icono, solo sale en el menú de ordenador). */
  icon?: LucideIcon;
  short?: string;
}

const NAV: NavItem[] = [
  { href: '/probador', label: 'Probador', also: ['/avatar'], icon: Shirt },
  { href: '/coleccion', label: 'Colección', also: [], icon: LayoutGrid },
  { href: '/mis-pruebas', label: 'Mis pruebas', short: 'Pruebas', also: [], icon: Images },
  { href: '/favoritos', label: 'Favoritos', also: [], icon: Heart },
  { href: '/citas', label: 'Citas', also: ['/cita/'] },
  // En móvil las citas viven dentro del perfil.
  { href: '/perfil', label: 'Perfil', also: [], icon: UserRound },
];
const MOBILE_NAV = NAV.filter((item) => item.icon);
const MOBILE_ALSO: Record<string, readonly string[]> = { '/perfil': ['/citas', '/cita/'] };

const isActive = (pathname: string, href: string, also: readonly string[]) =>
  pathname.startsWith(href) || also.some((p) => pathname.startsWith(p));

/**
 * Cabecera. Sin título (secciones principales) lleva el logo y, en ordenador,
 * las secciones; con título (flujos como el avatar o la cita) no distrae con menú.
 */
export function TopBar({
  back,
  title,
  right,
  transparent = false,
}: {
  back?: string | true;
  title?: string;
  right?: ReactNode;
  transparent?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <header
      className={`sticky top-0 z-30 pt-[env(safe-area-inset-top)] ${transparent ? 'bg-transparent' : 'border-b border-line bg-white'}`}
    >
      <div className="relative mx-auto flex h-12 max-w-6xl items-center px-3 lg:h-14 lg:px-6">
        {back ? (
          <button
            type="button"
            onClick={() => (back === true ? router.back() : router.push(back))}
            className="grid size-11 place-items-center"
            aria-label="Volver"
          >
            <ArrowLeft className="size-5" strokeWidth={1.5} aria-hidden />
          </button>
        ) : null}
        <div className={`pointer-events-none absolute inset-x-0 flex justify-center ${title ? '' : 'lg:static lg:justify-start'}`}>
          {title ? (
            <h1 className="label-caps max-w-[60%] truncate">{title}</h1>
          ) : (
            <Link href="/probador" aria-label={`${brand.name}, ir al probador`} className="pointer-events-auto">
              <Image src={brand.logo} alt={brand.name} width={576} height={120} className="h-6 w-auto lg:h-7" priority />
            </Link>
          )}
        </div>
        {title ? null : (
          <nav aria-label="Secciones" className="ml-auto hidden gap-8 lg:flex">
            {NAV.map(({ href, label, also }) => {
              const active = isActive(pathname, href, also);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`label-caps py-1 ${active ? 'border-b border-ink text-ink' : 'text-neutral-400 hover:text-ink'}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}
        <div className={`flex items-center ${title ? 'ml-auto' : 'ml-auto lg:ml-6'}`}>{right}</div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Secciones" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto grid h-14 max-w-xl grid-cols-5">
        {MOBILE_NAV.map(({ href, label, short, also, icon: Icon }) => {
          const active = isActive(pathname, href, [...also, ...(MOBILE_ALSO[href] ?? [])]);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1 ${active ? 'text-ink' : 'text-neutral-400'}`}
              >
                {Icon ? <Icon className="size-5" strokeWidth={active ? 1.75 : 1.25} aria-hidden /> : null}
                <span className="text-[10px] font-medium uppercase tracking-[0.08em]">{short ?? label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
