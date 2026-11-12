import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Eyebrow, Field, Notice } from '@v2/components/ui';
import { ApiError, createProfile, getProfile, listShops } from '@v2/lib/api';
import { brand } from '@v2/lib/brand';
import { CardHead, cardScreens } from '@v2/components/brand-card';
import { ShopSelect } from '@v2/components/shop-select';
import { rememberShop } from '@v2/lib/shop-memory';
import { validateContact, type ContactErrors, type ContactValues } from '@v2/lib/profile';
import { useLoad } from '@v2/lib/use-load';

type Values = ContactValues;
type Errors = ContactErrors;
const validate = validateContact;

export function ProfileForm() {
  const router = useRouter();
  const next = useSearchParams().get('next') ?? brand.home;
  const { data } = useLoad(() => Promise.all([getProfile(), listShops()]));
  const [profile, shops] = data ?? [null, []];

  const [values, setValues] = useState<Values>({ name: '', email: '', postcode: '', shopId: '' });
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<Errors>({});
  // Marcado por defecto, como en la V1 (el CRM también lo trae activo).
  const [whatsapp, setWhatsapp] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const card = cardScreens;

  // La tienda elegida al entrar (junto al teléfono) ya viene marcada.
  useEffect(() => {
    const chosen = profile?.shopId;
    if (chosen && shops.some((s) => s.id === chosen)) setValues((v) => (v.shopId ? v : { ...v, shopId: String(chosen) }));
  }, [profile, shops]);

  // Los errores del CRM solo cuentan mientras existen: un campo editado vuelve a la validación local.
  const errors: Errors = {
    ...validate(values),
    ...Object.fromEntries(Object.entries(serverErrors).filter(([, message]) => message)),
  };
  const shown = (key: keyof Values) => (touched[key] ? errors[key] : undefined);
  const setValue = (key: keyof Values, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setServerErrors((s) => ({ ...s, [key]: undefined }));
  };
  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setValue(key, e.target.value);
  const blur = (key: keyof Values) => () => setTouched((t) => ({ ...t, [key]: true }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, postcode: true, shopId: true });
    if (Object.keys(validate(values)).length || !profile) return;
    setBusy(true);
    setError(null);
    try {
      await createProfile({
        phone: profile.phone,
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        postcode: values.postcode.trim(),
        shopId: Number(values.shopId),
        sendPhotosWhatsApp: whatsapp,
      });
      rememberShop(Number(values.shopId));
      router.replace(`/avatar?next=${encodeURIComponent(next)}`);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) setServerErrors(err.fieldErrors);
      else setError(err instanceof Error ? err.message : 'No se pudieron guardar tus datos.');
      setBusy(false);
    }
  };

  return (
    <>
      {card ? (
        <CardHead eyebrow="Tu perfil" title="Completa tu perfil" lead="Solo una vez, para personalizar tu experiencia." />
      ) : (
        <>
          <Eyebrow className="mt-8">Antes de empezar</Eyebrow>
          <h1 className="mt-2 text-[22px] font-light uppercase tracking-[0.06em]">Cuéntanos quién eres</h1>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            Lo usamos para guardar tus pruebas y, si pides cita, para que tu {brand.shop.one} te reciba con lo que has guardado.
          </p>
        </>
      )}

      <form className={`${card ? '' : 'mt-8'} space-y-5`} onSubmit={submit} noValidate>
        <Field label={card ? 'Nombre y apellidos' : 'Nombre'} name="name" autoComplete="name" value={values.name} onChange={set('name')} onBlur={blur('name')} error={shown('name')} />
        <Field
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={set('email')}
          onBlur={blur('email')}
          error={shown('email')}
        />
        <Field
          label="Código postal"
          name="postcode"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={5}
          value={values.postcode}
          onChange={set('postcode')}
          onBlur={blur('postcode')}
          error={shown('postcode')}
        />
        <ShopSelect shops={shops} value={values.shopId} onChange={(value) => setValue('shopId', value)} onBlur={blur('shopId')} error={shown('shopId')} />

        <label className="flex items-start gap-3 border-t border-line pt-4 text-[13px] leading-snug">
          <input type="checkbox" checked={whatsapp} onChange={(e) => setWhatsapp(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-accent" />
          Quiero recibir mis pruebas por WhatsApp.
        </label>

        {error ? <Notice tone="danger">{error}</Notice> : null}

        <Button type="submit" block loading={busy}>
          {card ? 'Guardar y continuar' : 'Continuar'}
        </Button>
        <p className="text-center text-xs leading-relaxed text-muted">
          {brand.name} trata tus datos para gestionar el probador y tus citas.{' '}
          <a href={brand.privacyUrl} target="_blank" rel="noopener" className="underline underline-offset-2">
            Política de privacidad
          </a>
        </p>
      </form>
    </>
  );
}
