import Image from 'next/image';
import { Backdrop } from '@v2/components/backdrop';
import { LinkButton } from '@v2/components/ui';
import { brand } from '@v2/lib/brand';
import { asset } from '@v2/lib/base-path';

/** Giro real generado con IA: el avatar de la clienta de ejemplo con un vestido de la colección. */
const DEMO_VIDEO = asset('/demo/giro-360.mp4');
const DEMO_STILL = asset('/demo/prueba.jpg');

const STEPS = ['Tu foto', 'Tu avatar en 360°', 'Pruébate la colección'];

export default function WelcomePage() {
  return (
    <main className="flex h-dvh flex-col bg-white lg:flex-row">
      {/* Escenario: la prueba girando, como en el probador */}
      <div className="relative min-h-0 flex-1 bg-studio">
        <Backdrop src={DEMO_STILL} />
        <Image src={DEMO_STILL} alt="" fill priority sizes="(min-width: 1024px) 70vw, 100vw" className="object-contain" />
        <video
          src={DEMO_VIDEO}
          poster={DEMO_STILL}
          autoPlay
          muted
          loop
          playsInline
          aria-label="Ejemplo: avatar con un vestido de novia girando 360°"
          className="absolute inset-0 h-full w-full object-contain motion-reduce:hidden"
        />
        <header className="absolute inset-x-0 top-0 flex justify-center pt-[max(env(safe-area-inset-top),1rem)]">
          <Image src={brand.logo} alt={brand.name} width={576} height={120} className="h-6 w-auto" priority />
        </header>
        <p className="label-caps absolute bottom-4 left-4 text-ink/70">360°</p>
      </div>

      <div className="px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-6 md:mx-auto md:w-full md:max-w-md md:pb-10 lg:mx-0 lg:flex lg:w-[28rem] lg:max-w-none lg:flex-col lg:justify-center lg:px-12">
        <p className="label-caps text-muted">Probador virtual</p>
        <h1 className="mt-2 text-[22px] font-light uppercase leading-tight tracking-[0.06em] lg:text-[28px]">
          Pruébatelo antes de venir
        </h1>

        <ol className="mt-4 flex gap-4 text-[11px] uppercase tracking-[0.1em] text-muted lg:flex-col lg:gap-2">
          {STEPS.map((step, i) => (
            <li key={step}>
              <span className="text-ink">{String(i + 1).padStart(2, '0')}</span> {step}
            </li>
          ))}
        </ol>

        <LinkButton href="/entrar" block className="mt-6">
          Empezar
        </LinkButton>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
          Recreación con IA; puede diferir del resultado real.{' '}
          <a href={brand.privacyUrl} className="underline underline-offset-2" target="_blank" rel="noopener">
            Privacidad
          </a>
        </p>
      </div>
    </main>
  );
}
