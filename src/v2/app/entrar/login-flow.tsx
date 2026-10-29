import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Button, Eyebrow, Notice } from '@v2/components/ui';
import { sendCode, verifyCode } from '@v2/lib/api';
import { brand } from '@v2/lib/brand';
import { CardHead, cardScreens } from '@v2/components/brand-card';
import { useAuth } from '@/context/AuthContext';

/** Prefijos más habituales entre las clientas; España por defecto. */
const PREFIXES = [
  { code: '+34', label: 'España' },
  { code: '+351', label: 'Portugal' },
  { code: '+33', label: 'Francia' },
  { code: '+39', label: 'Italia' },
  { code: '+44', label: 'Reino Unido' },
  { code: '+52', label: 'México' },
  { code: '+54', label: 'Argentina' },
  { code: '+57', label: 'Colombia' },
];
const RESEND_SECONDS = 60;

const digitsOnly = (value: string) => value.replace(/\D/g, '');

const phoneError = (prefix: string, digits: string): string | null => {
  if (prefix === '+34') return /^[6-9]\d{8}$/.test(digits) ? null : 'Escribe los 9 dígitos de tu móvil, por ejemplo 612 345 678.';
  return digits.length >= 6 && digits.length <= 12 ? null : 'Revisa el número: le faltan o le sobran dígitos.';
};

const formatSpanish = (digits: string) => digits.replace(/(\d{3})(\d{0,3})(\d{0,3})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '));

export function LoginFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');
  const claimGuest = brand.id === 'sedka' && params.get('claim') === '1';
  const { token } = useAuth();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [prefix, setPrefix] = useState('+34');
  const [number, setNumber] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);
  const [simulated, setSimulated] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);

  const digits = digitsOnly(number);
  const phone = `${prefix}${digits}`;

  useEffect(() => {
    if (wait <= 0) return;
    const t = window.setTimeout(() => setWait(wait - 1), 1000);
    return () => window.clearTimeout(t);
  }, [wait]);

  const requestCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const invalid = phoneError(prefix, digits);
    if (invalid) return setError(invalid);
    setBusy(true);
    setError(null);
    try {
      const sent = await sendCode(phone);
      setSimulated(Boolean(sent?.simulated));
      setStep('code');
      setCode('');
      setWait(RESEND_SECONDS);
      window.setTimeout(() => codeRef.current?.focus(), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el código.');
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (value: string) => {
    setBusy(true);
    setError(null);
    try {
      const session = await verifyCode(phone, value, claimGuest ? (token ?? undefined) : undefined);
      const target = next ?? brand.home;
      if (claimGuest) {
        router.replace(target);
        return;
      }
      if (!session.hasProfile) router.replace(`/datos?next=${encodeURIComponent(target)}`);
      else if (!session.hasAvatar) router.replace(`/avatar?next=${encodeURIComponent(target)}`);
      else router.replace(target);
    } catch (err) {
      setCode('');
      setError(err instanceof Error ? err.message : 'El código no es correcto.');
      codeRef.current?.focus();
      setBusy(false);
    }
  };

  const onCodeChange = (value: string) => {
    const clean = digitsOnly(value).slice(0, 6);
    setCode(clean);
    setError(null);
    if (clean.length === 6) void confirm(clean);
  };

  const card = cardScreens;
  const shownPhone = `${prefix} ${prefix === '+34' ? formatSpanish(digits) : digits}`;

  if (step === 'code') {
    return (
      <>
        {card ? (
          <CardHead
            logo
            step="02 / 02"
            eyebrow="Verificación"
            title="Introduce el código"
            lead={
              <>
                Enviado por WhatsApp a <b className="font-semibold text-ink">{shownPhone}</b>
              </>
            }
          />
        ) : (
          <>
            <button type="button" onClick={() => setStep('phone')} className="-ml-2 mb-6 grid size-11 place-items-center" aria-label="Cambiar el número">
              <ArrowLeft className="size-5" strokeWidth={1.5} aria-hidden />
            </button>
            <Eyebrow>Paso 2 de 2</Eyebrow>
            <h1 className="mt-2 text-[22px] font-light uppercase tracking-[0.06em]">Te hemos enviado un código</h1>
            <p className="mt-3 inline-flex items-center gap-2 text-[13px] text-muted">
              <MessageCircle className="size-4" aria-hidden />
              Por WhatsApp a {shownPhone}
            </p>
          </>
        )}
        {simulated ? (
          <div className="mt-4">
            <Notice>
              Entorno de pruebas: no se envía ningún WhatsApp. Escribe cualquier código de 6 cifras, por ejemplo 123456.
            </Notice>
          </div>
        ) : null}

        <form
          className={`${card ? '' : 'mt-8'} space-y-4`}
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length === 6) void confirm(code);
          }}
        >
          <label htmlFor="code" className="label-caps block text-muted">
            Código de 6 dígitos
          </label>
          <input
            ref={codeRef}
            id="code"
            name="code"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            disabled={busy}
            aria-invalid={Boolean(error)}
            className="h-16 w-full border-0 border-b border-neutral-300 bg-transparent text-center text-3xl font-light tracking-[0.5em] outline-none focus:border-ink"
          />
          {error ? <Notice tone="danger">{error}</Notice> : null}
          <Button type="submit" block loading={busy} disabled={code.length !== 6}>
            Entrar
          </Button>
        </form>

        <div className="mt-6 text-center text-[13px] text-muted">
          {wait > 0 ? (
            <p>Puedes pedir otro código en {wait} s</p>
          ) : (
            <Button variant="ghost" onClick={() => void requestCode()} disabled={busy} className="h-11">
              Enviar otro código
            </Button>
          )}
          {card ? (
            <button type="button" onClick={() => setStep('phone')} className="mt-2 text-[13px] text-accent underline underline-offset-2">
              Cambiar número
            </button>
          ) : null}
        </div>
      </>
    );
  }

  return (
    <>
      {card ? (
        <CardHead
          logo
          step="01 / 02"
          eyebrow="Acceso"
          title="Probador Virtual"
          lead={
            claimGuest ? (
              <>
                Para seguir probándote diseños, introduce tu teléfono.
                <br />
                Te enviamos un código por WhatsApp.
              </>
            ) : (
              <>
                Pruébate nuestros diseños desde casa.
                <br />
                Te enviamos un código por WhatsApp.
              </>
            )
          }
        />
      ) : (
        <>
          <Link href="/" className="-ml-2 mb-6 grid size-11 place-items-center" aria-label="Volver al inicio">
            <ArrowLeft className="size-5" strokeWidth={1.5} aria-hidden />
          </Link>
          <Eyebrow>Paso 1 de 2</Eyebrow>
          <h1 className="mt-2 text-[22px] font-light uppercase tracking-[0.06em]">Tu teléfono</h1>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            {claimGuest
              ? 'Para seguir probándote diseños, introduce tu teléfono. Te enviamos un código por WhatsApp.'
              : 'Te enviamos un código por WhatsApp. Sirve tanto para crear tu cuenta como para volver a entrar.'}
          </p>
        </>
      )}

      <form className={`${card ? '' : 'mt-8'} space-y-4`} onSubmit={requestCode} noValidate>
        <div>
          <label htmlFor="phone" className="label-caps mb-1 block text-muted">
            {card ? 'Teléfono' : 'Número de móvil'}
          </label>
          <div className="flex gap-2">
            <select
              aria-label="Prefijo del país"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="h-12 border-0 border-b border-neutral-300 bg-transparent pr-2 text-base outline-none focus:border-ink"
            >
              {PREFIXES.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.code} {p.label}
                </option>
              ))}
            </select>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder={prefix === '+34' ? '612 345 678' : 'Número'}
              value={prefix === '+34' ? formatSpanish(digits.slice(0, 9)) : number}
              onChange={(e) => {
                setNumber(e.target.value);
                setError(null);
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'phone-error' : undefined}
              className={`h-12 min-w-0 flex-1 border-0 border-b bg-transparent px-0 text-lg outline-none focus:border-ink ${error ? 'border-danger' : 'border-neutral-300'}`}
            />
          </div>
          {error ? (
            <p id="phone-error" className="mt-2 text-[13px] text-danger">
              {error}
            </p>
          ) : null}
        </div>
        <Button type="submit" block loading={busy}>
          Recibir código por WhatsApp
        </Button>
      </form>
      {card ? (
        <p className="mt-6 text-center">
          <Link href="/" className="text-[13px] text-accent underline underline-offset-2">
            Volver al inicio
          </Link>
        </p>
      ) : null}
    </>
  );
}
