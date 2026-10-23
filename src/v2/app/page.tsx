import Image from 'next/image';
import { Backdrop } from '@v2/components/backdrop';
import { LinkButton } from '@v2/components/ui';
import { brand } from '@v2/lib/brand';
import { asset } from '@v2/lib/base-path';

/** Giro 360 generado con IA de una pareja inventada (no son clientas) con prendas de la colección. */
const DEMO_VIDEO = asset('/demo/giro-360-pareja.mp4');
const DEMO_STILL = asset('/demo/pareja.jpg');

/** Los textos de la portada de la V1, que gustaban. */
const FEATURES = [
  { title: 'Pruébatelo', description: 'Genera tu avatar realista y visualiza los modelos.' },
  { title: 'Inspírate', description: 'Descubre los modelos que más te gusten.' },
  { title: 'Decídete', description: `Reserva tu cita y vive la experiencia al completo en ${brand.name}.` },
];

export default function WelcomePage() {
  return (
    // Ordenador: el vídeo, vertical, solo ocupa su ancho y va junto al texto, los dos centrados.
    <main className="flex h-dvh flex-col bg-white lg:flex-row lg:justify-center lg:gap-[clamp(3rem,6vw,8rem)] lg:px-[clamp(2rem,4vw,5rem)]">
      {/* Escenario: la prueba girando, como en el probador */}
      <div className="relative min-h-0 flex-1 bg-studio lg:aspect-[9/16] lg:h-full lg:flex-none">
        <Backdrop src={DEMO_STILL} />
        <Image src={DEMO_STILL} alt="" fill priority sizes="(min-width: 1024px) 60vh, 100vw" className="object-contain" />
        <video
          src={DEMO_VIDEO}
          poster={DEMO_STILL}
          autoPlay
          muted
          loop
          playsInline
          aria-label="Ejemplo: una pareja con un vestido de novia y un traje de la colección girando 360°"
          className="absolute inset-0 h-full w-full object-contain motion-reduce:hidden"
        />
        <header className="absolute inset-x-0 top-0 flex justify-center pt-[max(env(safe-area-inset-top),1rem)]">
          <Image src={brand.logo} alt={brand.name} width={576} height={120} className="h-6 w-auto" priority />
        </header>
        <p className="label-caps absolute bottom-4 left-4 text-ink/70">360°</p>
      </div>

      <div className="px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-6 md:mx-auto md:w-full md:max-w-md md:pb-10 lg:mx-0 lg:flex lg:w-full lg:max-w-[36rem] lg:flex-col lg:justify-center lg:px-0 lg:py-10">
        <p className="label-caps text-muted lg:!text-[13px]">Probador virtual</p>
        <h1 className="mt-2 text-[20px] font-light uppercase leading-tight tracking-[0.06em] lg:mt-3 lg:text-[34px] lg:leading-[1.12] xl:text-[42px]">
          ¡El primer paso hasta tu vestido o traje!
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted lg:mt-5 lg:text-[16px] xl:text-[17px]">
          Descubre cómo te sientan tus diseños favoritos antes de venir a la tienda. Crea tu avatar y haz tu prueba en minutos.
        </p>

        {/* Móvil: cada una en una línea. Ordenador: el título encima. */}
        <ul className="mt-4 space-y-1.5 text-[12px] leading-snug lg:mt-8 lg:space-y-5 lg:text-[15px] xl:text-[16px]">
          {FEATURES.map((f) => (
            <li key={f.title}>
              <span className="label-caps text-ink lg:block lg:!text-[13px]">{f.title}</span>{' '}
              <span className="text-muted lg:mt-1 lg:block">{f.description}</span>
            </li>
          ))}
        </ul>

        <LinkButton href="/entrar" block className="mt-6 lg:mt-10 lg:h-14 lg:!text-[13px]">
          Empezar
        </LinkButton>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted lg:mt-4 lg:text-[12px]">
          Recreación con IA; puede diferir del resultado real.{' '}
          <a href={brand.privacyUrl} className="underline underline-offset-2" target="_blank" rel="noopener">
            Privacidad
          </a>
        </p>
      </div>
    </main>
  );
}
