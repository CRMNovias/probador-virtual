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
    // Móvil, tablet y pantallas verticales: el vídeo arriba, a media pantalla, y el texto debajo
    // (se baja si no cabe). Pantalla apaisada (wide): el vídeo, vertical, pegado a la izquierda y
    // a su ancho (como mucho, media pantalla); el texto, centrado en el resto.
    <main className="flex min-h-dvh flex-col bg-white wide:h-dvh wide:flex-row">
      {/* Escenario: la prueba girando, como en el probador */}
      <div className="relative h-[52dvh] shrink-0 bg-studio md:h-[56dvh] wide:h-full wide:w-[min(56.25dvh,50vw)]">
        <Backdrop src={DEMO_STILL} />
        <Image src={DEMO_STILL} alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain" />
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

      <div className="px-5 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-6 md:mx-auto md:w-full md:max-w-xl md:px-8 md:pb-12 md:pt-10 wide:mx-0 wide:flex wide:max-w-none wide:flex-1 wide:items-center wide:justify-center wide:px-[clamp(2.5rem,6vw,7rem)] wide:py-10">
        <div className="wide:w-full wide:max-w-[clamp(32rem,30vw,38rem)]">
          <p className="label-caps text-muted">Probador virtual</p>
          <h1 className="mt-2 text-[22px] font-light uppercase leading-[1.18] tracking-[0.06em] md:mt-3 md:text-[28px] wide:text-[clamp(1.875rem,1.7vw,2.25rem)]">
            ¡El primer paso hasta tu vestido o traje!
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-muted md:text-[16px] wide:mt-4 wide:text-[clamp(0.9375rem,0.85vw,1.0625rem)]">
            Descubre cómo te sientan tus diseños favoritos antes de venir a la tienda. Crea tu avatar y haz tu prueba en minutos.
          </p>

          {/* Móvil: el título delante. Tablet y ordenador: el título encima. */}
          <ul className="mt-4 space-y-2 text-[13px] leading-snug md:mt-7 md:space-y-4 md:text-[15px] wide:mt-6 wide:text-[clamp(0.875rem,0.8vw,1rem)]">
            {FEATURES.map((f) => (
              <li key={f.title}>
                <span className="label-caps text-ink md:block">{f.title}</span> <span className="text-muted md:mt-1 md:block">{f.description}</span>
              </li>
            ))}
          </ul>

          <LinkButton href="/entrar" block className="mt-6 md:mt-8">
            Empezar
          </LinkButton>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted md:text-[12px]">
            Recreación con IA; puede diferir del resultado real.{' '}
            <a href={brand.privacyUrl} className="underline underline-offset-2" target="_blank" rel="noopener">
              Privacidad
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
