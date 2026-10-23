import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Camera, ImageUp, RefreshCw } from 'lucide-react';
import { TopBar } from '@v2/components/app-shell';
import { AiWait } from '@v2/components/ai-wait';
import { Backdrop } from '@v2/components/backdrop';
import { Turntable } from '@v2/components/turntable';
import { Button, Eyebrow, Notice } from '@v2/components/ui';
import { generateAvatar, getAvatar, uploadPhoto } from '@v2/lib/api';
import { brand } from '@v2/lib/brand';
import { reviewPhoto, type PhotoReview } from '@v2/lib/photo-quality';
import { useLoad } from '@v2/lib/use-load';
import { asset } from '@v2/lib/base-path';

const MAX_MB = 10;
const VERDICT = { good: 'La foto sirve', weak: 'Se puede mejorar', poor: 'Mejor con otra foto' } as const;

type Step = 'intro' | 'review' | 'working' | 'done';

/**
 * Pantalla en dos partes, como el probador: escenario gris arriba y panel blanco
 * abajo; en ordenador, escenario a la izquierda y panel a la derecha.
 */
function Layout({ stage, backdrop = null, children, back }: { stage: ReactNode; backdrop?: string | null; children: ReactNode; back?: string | undefined }) {
  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <TopBar back={back} title="Tu avatar" />
      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        <section className="relative h-[56dvh] shrink-0 overflow-hidden bg-studio md:h-[60dvh] lg:h-auto lg:flex-1">
          <Backdrop src={backdrop} />
          {stage}
        </section>
        <section className="mx-auto w-full max-w-md flex-1 px-5 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-5 lg:mx-0 lg:flex lg:w-[440px] lg:max-w-none lg:flex-none lg:flex-col lg:justify-center lg:overflow-y-auto lg:px-12 lg:py-10">
          {children}
        </section>
      </div>
    </div>
  );
}

const pageTitle = 'text-[20px] font-light uppercase leading-tight tracking-[0.06em]';

export function AvatarFlow() {
  const router = useRouter();
  const next = useSearchParams().get('next') ?? '/probador';
  const { data: existing, loading } = useLoad(getAvatar);

  const [step, setStep] = useState<Step>('intro');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [review, setReview] = useState<PhotoReview | null>(null);
  const [consent, setConsent] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // El avatar se enseña en foto: sin vídeo 360, que se paga y no hace falta (solo las pruebas lo llevan).
  const shown = avatarUrl ?? (step === 'intro' ? existing?.avatarUrl : null) ?? null;
  // Se llega desde el probador o desde el perfil: se vuelve allí.
  const back = existing ? next : undefined;
  const doneLabel = next.startsWith('/perfil') ? 'Volver al perfil' : 'Ir al probador';

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    e.target.value = '';
    if (!chosen) return;
    if (!chosen.type.startsWith('image/')) return setError('Elige una foto (JPG, PNG o HEIC).');
    if (chosen.size > MAX_MB * 1024 * 1024) return setError(`La foto pesa más de ${MAX_MB} MB. Prueba con otra o hazla de nuevo.`);
    setError(null);
    setAvatarUrl(null);
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
    setReview(await reviewPhoto(chosen));
    setStep('review');
  };

  const create = async () => {
    if (!file || !consent) return;
    setStep('working');
    setError(null);
    try {
      await uploadPhoto(file);
      const avatar = await generateAvatar();
      setAvatarUrl(avatar.avatarUrl);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el avatar.');
      setStep('review');
    }
  };

  // Los selectores de foto van siempre en el mismo sitio, fuera de cada pantalla:
  // si se cambiaba de pantalla al abrir la galería, React ponía otros y la foto
  // elegida llegaba al viejo, que ya no estaba, y había que elegirla dos veces.
  const withInputs = (screen: React.ReactNode) => (
    <>
      <input ref={cameraRef} type="file" accept="image/*" capture="user" className="sr-only" onChange={pick} tabIndex={-1} aria-hidden />
      <input ref={galleryRef} type="file" accept="image/*" className="sr-only" onChange={pick} tabIndex={-1} aria-hidden />
      {screen}
    </>
  );

  const errorNotice = error ? (
    <div className="mt-4">
      <Notice tone="danger">{error}</Notice>
    </div>
  ) : null;

  if (loading) return withInputs(<Layout stage={<div className="h-full shimmer" aria-label="Cargando" />}>{null}</Layout>);

  if (shown && (step === 'done' || step === 'intro')) {
    return withInputs(
      <Layout
        back={back}
        backdrop={shown}
        stage={
          <div className="relative flex h-full justify-center">
            <Turntable className="h-full !w-auto" stillUrl={shown} alt="Tu avatar" />
          </div>
        }
      >
        <Eyebrow>{step === 'done' ? 'Listo' : 'Tu avatar'}</Eyebrow>
        <h1 className={`mt-1 ${pageTitle}`}>{step === 'done' ? 'Ya tienes tu avatar' : 'Este eres tú'}</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Con él te probarás cada vestido o traje. Si no te reconoces, hazlo de nuevo con otra foto.
        </p>
        <div className="mt-5 space-y-2">
          <Button block onClick={() => router.push(next)}>
            {doneLabel}
          </Button>
          {/* La pantalla cambia cuando llega la foto (pick); si se cancela, sigue el avatar. */}
          <Button block variant="secondary" onClick={() => galleryRef.current?.click()}>
            <RefreshCw className="size-4" strokeWidth={1.5} aria-hidden />
            Hacerlo con otra foto
          </Button>
        </div>
      </Layout>
    );
  }

  if (step === 'working') {
    return withInputs(
      <Layout
        stage={
          <>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- foto local recién elegida
              <img src={preview} alt="" className="absolute inset-0 h-full w-full object-contain opacity-40 blur" />
            ) : null}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="label-caps">Creando tu avatar</p>
              <span className="mt-3 size-1.5 animate-pulse bg-ink" aria-hidden />
            </div>
          </>
        }
      >
        <AiWait
          steps={['Subiendo tu foto', 'Creando tu avatar de cuerpo entero', 'Ajustando luz y detalles']}
          expectedSeconds={45}
          note="Puedes dejar esta pantalla abierta; no hace falta que hagas nada."
        />
      </Layout>
    );
  }

  if (step === 'review' && preview && review) {
    return withInputs(
      <Layout
        back={back}
        stage={
          // eslint-disable-next-line @next/next/no-img-element -- foto local recién elegida
          <img src={preview} alt="Tu foto" className="absolute inset-0 h-full w-full object-contain" />
        }
      >
        <Eyebrow>Tu foto</Eyebrow>
        <h1 className={`mt-1 ${pageTitle}`}>{VERDICT[review.verdict]}</h1>
        <ul className="mt-2 space-y-1 text-[13px] leading-snug text-muted">
          {review.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>

        <label className="mt-5 flex items-start gap-3 border-t border-line pt-4 text-[13px] leading-snug">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-ink" />
          <span>
            Acepto que {brand.name} use esta foto para crear mi avatar con inteligencia artificial. Puedo borrarlo cuando quiera.{' '}
            <a href={brand.privacyUrl} target="_blank" rel="noopener" className="underline underline-offset-2">
              Más información
            </a>
          </span>
        </label>

        {errorNotice}

        <div className="mt-5 space-y-2">
          <Button block onClick={() => void create()} disabled={!consent}>
            Crear mi avatar
          </Button>
          <Button block variant="secondary" onClick={() => galleryRef.current?.click()}>
            Elegir otra foto
          </Button>
        </div>
      </Layout>
    );
  }

  return withInputs(
    <Layout
      back={back}
      backdrop={asset('/demo/avatar.jpg')}
      stage={
        <>
          {/* Ejemplo real: esta foto y el avatar que la IA creó con ella */}
          <Image
            src={asset('/demo/avatar.jpg')}
            alt="Ejemplo de avatar de cuerpo entero creado con IA"
            fill
            priority
            sizes="100vw"
            className="object-contain"
          />
          <figure className="absolute bottom-4 left-4 w-[28%] max-w-32">
            <Image
              src={asset('/examples/foto.jpg')}
              alt="Ejemplo de foto: selfie de frente con buena luz"
              width={600}
              height={600}
              className="aspect-[3/4] w-full border border-white object-cover"
            />
            <figcaption className="label-caps mt-1.5 flex items-center gap-1 !text-[10px] text-ink/70">
              Tu foto <ArrowRight className="size-3" aria-hidden /> Tu avatar
            </figcaption>
          </figure>
        </>
      }
    >
      <Eyebrow>Paso 1 de 2</Eyebrow>
      <h1 className={`mt-1 ${pageTitle}`}>Empieza con una foto tuya</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        Con un selfie creamos tu avatar de cuerpo entero. Sale mejor de frente, con luz de día y sin gafas de sol.
      </p>

      {errorNotice}

      <div className="mt-5 space-y-2">
        <Button block onClick={() => cameraRef.current?.click()}>
          <Camera className="size-4" strokeWidth={1.5} aria-hidden />
          Hacer un selfie
        </Button>
        <Button block variant="secondary" onClick={() => galleryRef.current?.click()}>
          <ImageUp className="size-4" strokeWidth={1.5} aria-hidden />
          Elegir de la galería
        </Button>
      </div>
    </Layout>
  );
}
