import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { logout } from '@v2/lib/api';
import { brand } from '@v2/lib/brand';

/**
 * El probador de Sedka con la disposición de su V1 (crmnovias.com/probador-sedka.html):
 * cabecera con el logo grande y el menú en texto (hamburguesa en móvil), títulos
 * editoriales finos y tarjetas centradas sobre crema. Lo que hace cada pantalla es
 * lo mismo que en Atelier; solo cambia cómo se ve.
 */

const NAV: { href: string; label: string; also: readonly string[] }[] = [
  { href: '/coleccion', label: 'Colección', also: ['/probador'] },
  { href: '/favoritos', label: 'Favoritos', also: [] },
  { href: '/mis-pruebas', label: 'Mis pruebas', also: [] },
  { href: '/citas', label: 'Cita', also: ['/cita/'] },
  { href: '/perfil', label: 'Mi perfil', also: ['/avatar'] },
];

const isActive = (pathname: string, href: string, also: readonly string[]) =>
  pathname.startsWith(href) || also.some((p) => pathname.startsWith(p));

export function SedkaTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Al cambiar de pantalla, el menú del móvil se cierra.
  useEffect(() => setOpen(false), [pathname]);

  const signOut = async () => {
    await logout().catch(() => undefined);
    router.replace('/');
  };

  const item = 'w-full border-b border-line px-[22px] py-4 text-left text-[14px] uppercase tracking-[0.12em] last:border-b-0 md:w-auto md:border-0 md:px-3 md:py-2';

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white pt-[env(safe-area-inset-top)]">
      <div className="relative flex items-center justify-between px-4 py-2.5 md:px-5 md:py-3.5">
        <Link href={brand.home} aria-label={`${brand.name}, ir a la colección`}>
          <Image src={brand.logo} alt={brand.name} width={494} height={340} className="h-12 w-auto md:h-[76px]" priority />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="sedka-menu"
          aria-label={open ? 'Cerrar el menú' : 'Abrir el menú'}
          className="grid size-11 place-items-center md:hidden"
        >
          {open ? <X className="size-6" strokeWidth={1.5} aria-hidden /> : <Menu className="size-7" strokeWidth={1.5} aria-hidden />}
        </button>
        <nav
          id="sedka-menu"
          aria-label="Secciones"
          className={`${open ? 'flex' : 'hidden'} absolute inset-x-0 top-full flex-col border-b border-line bg-white shadow-[0_14px_30px_rgba(20,16,12,0.1)] md:static md:flex md:flex-row md:items-center md:gap-2 md:border-0 md:shadow-none`}
        >
          {NAV.map(({ href, label, also }) => {
            const active = isActive(pathname, href, also);
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`${item} ${active ? 'text-accent' : 'hover:text-accent'}`}>
                {label}
              </Link>
            );
          })}
          <button type="button" onClick={() => void signOut()} className={`${item} hover:text-accent`}>
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
}

/** Pantalla con la cabecera; el contenido decide su ancho. */
export function SedkaPage({ children }: { children: ReactNode }) {
  return (
    <>
      <SedkaTopBar />
      <main className="pb-16">{children}</main>
    </>
  );
}

/** Cabecera editorial de las secciones: «La colección / Colección / …». */
export function SedkaHead({ eyebrow, title, sub, children }: { eyebrow: string; title: string; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-[1180px] px-[18px] pt-[30px] sm:px-[22px] sm:pt-10">
      <div className="mb-[22px]">
        <p className="mb-2.5 text-[11px] uppercase tracking-[0.34em] text-muted">{eyebrow}</p>
        <h1 className="text-[38px] font-extralight leading-[1.04] tracking-[0.02em] sm:text-[54px]">{title}</h1>
        {sub ? <p className="mt-3 max-w-[520px] text-[14px] leading-normal text-muted">{sub}</p> : null}
      </div>
      {children}
    </div>
  );
}

/** Título de tarjeta centrada (acceso, datos, avatar, cita): logo, antetítulo, título y entradilla. */
export function SedkaCardHead({ eyebrow, title, lead, logo = false }: { eyebrow: string; title: string; lead?: ReactNode; logo?: boolean }) {
  return (
    <div className="text-center">
      {logo ? <Image src={brand.logo} alt={brand.name} width={494} height={340} className="mx-auto mb-[30px] h-16 w-auto" priority /> : null}
      <p className="mb-3 text-[11px] uppercase tracking-[0.34em] text-muted">{eyebrow}</p>
      <h1 className="mb-3 text-[34px] font-light leading-[1.04] sm:text-[40px]">{title}</h1>
      {lead ? <div className="mb-[30px] text-[15px] leading-relaxed text-muted">{lead}</div> : null}
    </div>
  );
}

/** Pantalla crema con una tarjeta blanca centrada, como el acceso de la V1. */
export function SedkaCardScreen({ children, wide = false, header = false }: { children: ReactNode; wide?: boolean; header?: boolean }) {
  return (
    <>
      {header ? <SedkaTopBar /> : null}
      <main className={`flex flex-col items-center justify-center bg-studio px-[18px] py-8 ${header ? 'min-h-[calc(100dvh-4.25rem)] md:min-h-[calc(100dvh-6.5rem)]' : 'min-h-dvh'}`}>
        <div className={`w-full bg-white px-5 py-[30px] sm:px-8 ${wide ? 'max-w-[560px]' : 'max-w-[460px]'}`}>{children}</div>
      </main>
    </>
  );
}

/** Tarjeta con borde fino y esquinas redondeadas (el panel del probador, las citas). */
export function SedkaPanel({ title, children, className = '' }: { title?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[10px] border border-line bg-white px-[22px] py-5 ${className}`}>
      {title ? <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">{title}</h2> : null}
      {children}
    </section>
  );
}

/** Rueda dorada de espera de la V1. */
export function SedkaSpinner({ className = '' }: { className?: string }) {
  return <span className={`inline-block size-[34px] animate-spin rounded-full border-[3px] border-accent/20 border-t-accent ${className}`} aria-hidden />;
}
