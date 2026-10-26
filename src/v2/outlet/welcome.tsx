import Image from 'next/image';
import { LinkButton } from '@v2/components/ui';
import { brand } from '@v2/lib/brand';

/** Los pasos de la portada de la V1, con sus textos. */
const STEPS = [
  { title: 'Avatar', description: 'Una foto, tu avatar listo en segundos.' },
  { title: 'Prueba', description: 'Más de 280 vestidos y trajes. Todos en stock.' },
  { title: 'Reserva', description: 'Cita en Outlet Nupcial para confirmar tu elección.' },
];

/** Portada de Outlet: la de su V1, solo letra (blanco y negro), con sus textos. */
export function OutletWelcome() {
  return (
    <main className="flex min-h-dvh flex-col bg-white">
      <header className="border-b border-line px-5 pb-5 pt-[max(env(safe-area-inset-top),1.25rem)] lg:px-16 lg:py-10">
        <Image src={brand.logo} alt={brand.name} width={731} height={336} className="h-10 w-auto lg:h-[70px]" priority />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center lg:py-16">
        <p className="text-[11px] uppercase tracking-[0.42em] text-muted">Probador virtual</p>
        <h1 className="mt-6 max-w-[11ch] text-[44px] font-bold leading-[1.02] tracking-[-0.015em] sm:text-[64px] lg:text-[76px]">
          Tu vestido sin moverte de casa.
        </h1>
        <p className="mt-7 max-w-[460px] text-[15px] leading-relaxed text-ink/75 lg:text-[17px]">
          Pruébate todos los modelos de {brand.name} antes de venir a la tienda. Cero compromisos, máxima inspiración.
        </p>
        <div className="mt-10 flex w-full max-w-[460px] flex-col gap-3 sm:flex-row">
          <LinkButton href="/entrar" block className="sm:flex-1">
            Empezar
          </LinkButton>
          <LinkButton href="/entrar" block variant="secondary" className="sm:flex-1">
            Ya tengo cuenta
          </LinkButton>
        </div>
      </section>

      <section className="border-t border-line bg-studio px-5 py-12 lg:py-16">
        <ol className="mx-auto grid max-w-[1024px] gap-9 sm:grid-cols-3 sm:gap-12">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <p className="font-mono text-[12px] text-muted">{String(i + 1).padStart(2, '0')}</p>
              <h2 className="mt-3 text-[18px] font-bold uppercase tracking-[0.18em]">{s.title}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink/70">{s.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-5 text-center">
        <p className="text-[10px] uppercase tracking-[0.34em] text-muted">Outlet Nupcial · Madrid · Córdoba</p>
        <p className="mt-2 text-[11px] text-muted">
          Recreación con IA; puede diferir del resultado real.{' '}
          <a href={brand.privacyUrl} className="underline underline-offset-2" target="_blank" rel="noopener">
            Privacidad
          </a>
        </p>
      </footer>
    </main>
  );
}
