import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button, LinkButton, Notice } from '@v2/components/ui';
import { startGuest } from '@v2/lib/api';
import { asset } from '@v2/lib/base-path';
import { brand } from '@v2/lib/brand';

/** La boutique de Sedka, la misma foto de fondo que la portada de su V1. */
const HERO = asset('/sedka/hero.webp');

const STEPS = [
  { title: 'Tu avatar', description: 'Sube una foto y genera tu doble virtual en segundos.' },
  { title: 'La colección', description: 'Recorre todos los diseños de novia y novio de Sedka.' },
  { title: 'Tu visita', description: 'Reserva en tu tienda Sedka y pruébatelo en persona.' },
];

const shadow = '[text-shadow:0_1px_12px_rgba(0,0,0,0.8)]';

/** Portada de Sedka: la de su V1, centrada sobre la foto de la boutique, con sus textos. */
export function SedkaWelcome() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const begin = async () => {
    setBusy(true);
    setError(null);
    try {
      const session = await startGuest();
      router.replace(session.hasAvatar ? brand.home : '/avatar?next=' + encodeURIComponent(brand.home));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se ha podido entrar. Inténtalo de nuevo.');
      setBusy(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh flex-col bg-[#1a1a1a] bg-cover bg-center" style={{ backgroundImage: `url(${HERO})` }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,10,7,0.62)_0%,rgba(14,10,7,0.86)_100%)]" aria-hidden />
      <div className="relative flex flex-1 flex-col items-center justify-center px-[22px] pb-[max(env(safe-area-inset-bottom),2.75rem)] pt-[max(env(safe-area-inset-top),2.75rem)] text-center md:px-6 md:py-14">
        <Image
          src={brand.logo}
          alt={brand.name}
          width={494}
          height={340}
          priority
          className="mb-[26px] h-[92px] w-auto brightness-0 invert drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] md:mb-[34px] md:h-[130px]"
        />
        <div className="w-full max-w-[820px]">
          <p className={`mb-[22px] text-[14px] font-semibold uppercase tracking-[0.4em] text-accent md:text-[16px] ${shadow}`}>Probador virtual</p>
          <h1
            className={`mx-auto mb-6 max-w-[17ch] text-[40px] font-extralight leading-[1.06] tracking-[0.04em] text-white md:text-[66px] [text-shadow:0_2px_26px_rgba(0,0,0,0.8)]`}
          >
            Tu cita con el vestido o traje empieza aquí.
          </h1>
          <p className={`mx-auto mb-10 max-w-[620px] text-[17px] leading-[1.65] text-white md:text-[22px] ${shadow}`}>
            Crea tu avatar y prueba virtualmente la colección de novia y novio de Sedka. Cuando encuentres el tuyo, te esperamos en tienda para vivirlo
            en persona.
          </p>
          <div className="mx-auto flex max-w-[340px] flex-col gap-3">
            <Button block loading={busy} onClick={() => void begin()} className="!h-auto py-5 !text-[15px] shadow-[0_10px_28px_rgba(0,0,0,0.5)]">
              Comenzar
            </Button>
            <LinkButton href="/entrar" block variant="secondary" className="!h-auto border-white !bg-transparent py-4 !text-white hover:!bg-white/10">
              Ya tengo cuenta
            </LinkButton>
          </div>
          {error ? (
            <div className="mx-auto mt-4 max-w-[340px]">
              <Notice tone="danger">{error}</Notice>
            </div>
          ) : null}

          <ol className="mx-auto mt-[38px] flex max-w-[920px] flex-col md:mt-[58px] md:flex-row">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t border-white/20 py-[18px] md:flex-1 md:border-l md:border-t-0 md:border-white/30 md:px-7 md:py-0 md:first:border-l-0">
                <p className="v2-slab text-[25px] text-accent">{String(i + 1).padStart(2, '0')}</p>
                <h2 className={`mb-1.5 mt-[9px] text-[19px] font-light text-white ${shadow}`}>{s.title}</h2>
                <p className={`text-[15px] leading-[1.55] text-white/90 ${shadow}`}>{s.description}</p>
              </li>
            ))}
          </ol>

          <p className="mt-10 text-[11px] text-white/60">
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
