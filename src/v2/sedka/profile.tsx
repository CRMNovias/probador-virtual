import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { selectClass, useProfileScreen } from '@v2/app/perfil/use-profile-screen';
import { Button, Field, Notice } from '@v2/components/ui';
import { brand } from '@v2/lib/brand';
import { WEDDING_MOMENTS, WEDDING_STYLES } from '@v2/lib/profile';
import type { WeddingMoment, WeddingStyle } from '@v2/lib/types';
import { SedkaPage } from './shell';

/** Sección de «Mi cuenta» con el título dorado de la V1. */
function Section({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pb-1 pt-[30px]">
      <h2 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">{title}</h2>
      <p className="mb-[18px] text-[12.5px] leading-normal text-muted">{sub}</p>
      {children}
    </section>
  );
}

function SelectField({ id, label, children, ...rest }: React.ComponentProps<'select'> & { id: string; label: string }) {
  return (
    <div>
      <label htmlFor={id} className="label-caps mb-1 block text-muted">
        {label}
      </label>
      <select id={id} {...rest} className={selectClass(Boolean(rest['aria-invalid']))}>
        {children}
      </select>
    </div>
  );
}

/** Mi perfil de Sedka: el de su V1 (avatar, datos personales y datos de la boda). */
export function SedkaProfile() {
  const { profile, shops, avatar, values, draft, set, shown, save, signOut, busy, saved, error, loadError, reload } = useProfileScreen();
  const [zoom, setZoom] = useState(false);

  return (
    <SedkaPage>
      <div className="mx-auto w-full max-w-[640px] px-[22px] pb-[60px] pt-[38px]">
        <header className="mb-3.5">
          <p className="mb-2.5 text-[11px] uppercase tracking-[0.34em] text-muted">Mi cuenta</p>
          <h1 className="mb-3.5 text-[40px] font-extralight leading-[1.06] tracking-[0.02em] sm:text-[48px]">Perfil</h1>
          <p className="max-w-[420px] text-[15px] leading-normal text-muted">Tus datos, los detalles de tu boda y tu avatar.</p>
        </header>

        {loadError ? (
          <Notice tone="danger">
            {loadError}{' '}
            <button type="button" className="underline" onClick={() => void reload()}>
              Reintentar
            </button>
          </Notice>
        ) : !profile || !values ? (
          <div className="mt-8 h-96 shimmer" />
        ) : (
          <form onSubmit={save} noValidate>
            <Section title="Tu avatar" sub={avatar ? 'Toca la imagen para verla en grande.' : 'Lo creas con una foto tuya y te pruebas con él cualquier diseño.'}>
              <div className="flex flex-wrap items-center gap-[18px] sm:flex-nowrap">
                {avatar ? (
                  <button type="button" onClick={() => setZoom(true)} className="shrink-0 cursor-zoom-in" aria-label="Ver tu avatar en grande">
                    {/* eslint-disable-next-line @next/next/no-img-element -- imagen del CRM (S3) */}
                    <img src={avatar.avatarUrl} alt="" className="size-[92px] rounded-full border-2 border-accent object-cover object-top transition-transform hover:scale-[1.04]" />
                  </button>
                ) : (
                  <span className="grid size-[92px] shrink-0 place-items-center rounded-full border-2 border-dashed border-line text-center text-[12px] text-muted">
                    Sin
                    <br />
                    avatar
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[14px]">{avatar ? 'Tu avatar está listo.' : 'Aún no tienes avatar.'}</p>
                  <p className="mt-1 text-[12px] text-muted">Úsalo para probarte cualquier vestido o traje.</p>
                </div>
                <Link
                  href="/avatar?next=/perfil"
                  className="w-full whitespace-nowrap rounded border border-ink px-4 py-2.5 text-center text-[12px] tracking-[0.04em] transition-colors hover:bg-ink hover:text-white sm:w-auto"
                >
                  {avatar ? 'Cambiar foto' : 'Crear mi avatar'}
                </Link>
              </div>
            </Section>

            <Section title="Datos personales" sub="Información de contacto para nuestro equipo.">
              <div className="space-y-5">
                <Field label="Teléfono" name="phone" value={profile.phone} disabled readOnly />
                <Field label="Nombre y apellidos" name="name" autoComplete="name" value={values.name} onChange={(e) => set('name', e.target.value)} error={shown('name')} />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(e) => set('email', e.target.value)}
                  error={shown('email')}
                />
                <div>
                  <SelectField
                    id="shopId"
                    label="Tienda Sedka más cercana"
                    value={values.shopId}
                    onChange={(e) => set('shopId', e.target.value)}
                    aria-invalid={Boolean(shown('shopId'))}
                  >
                    <option value="">Selecciona…</option>
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </SelectField>
                  {shown('shopId') ? <p className="mt-2 text-[13px] text-danger">{shown('shopId')}</p> : null}
                </div>
                <Field
                  label="Código postal"
                  name="postcode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={values.postcode}
                  onChange={(e) => set('postcode', e.target.value)}
                  error={shown('postcode')}
                />
                <label className="flex items-start gap-3 text-[13px] leading-snug">
                  <input
                    type="checkbox"
                    checked={values.whatsapp}
                    onChange={(e) => set('whatsapp', e.target.checked)}
                    className="mt-0.5 size-4 shrink-0 accent-accent"
                  />
                  Quiero recibir mis pruebas por WhatsApp.
                </label>
              </div>
            </Section>

            <Section title="Datos de tu boda" sub="Opcional, pero nos ayuda a aconsejarte mejor.">
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-x-[18px]">
                <Field label="Fecha de boda" name="weddingDate" type="date" value={values.weddingDate} onChange={(e) => set('weddingDate', e.target.value)} />
                <SelectField id="weddingMoment" label="Momento" value={values.weddingMoment} onChange={(e) => set('weddingMoment', e.target.value as WeddingMoment | '')}>
                  <option value="">Selecciona…</option>
                  {WEDDING_MOMENTS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </SelectField>
                <Field
                  label="Lugar de la boda"
                  name="weddingPlace"
                  placeholder="Ciudad o finca"
                  maxLength={100}
                  value={values.weddingPlace}
                  onChange={(e) => set('weddingPlace', e.target.value)}
                  className="sm:col-span-2"
                />
                <div className="sm:col-span-2">
                  <SelectField id="weddingStyle" label="Estilo de boda" value={values.weddingStyle} onChange={(e) => set('weddingStyle', e.target.value as WeddingStyle | '')}>
                    <option value="">Selecciona…</option>
                    {WEDDING_STYLES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </SelectField>
                </div>
              </div>
            </Section>

            <div className="mt-8 space-y-3">
              {error ? <Notice tone="danger">{error}</Notice> : null}
              {saved ? <Notice>Hemos guardado tus datos.</Notice> : null}
              <Button type="submit" block loading={busy} disabled={!draft}>
                Guardar cambios
              </Button>
            </div>
            <p className="mt-6 flex justify-center gap-5 text-[12px] text-muted">
              <button type="button" onClick={() => void signOut()} className="underline underline-offset-2 hover:text-accent">
                Cerrar sesión
              </button>
              <a href={brand.privacyUrl} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-accent">
                Política de privacidad
              </a>
            </p>
          </form>
        )}
      </div>

      {zoom && avatar ? (
        <div role="dialog" aria-label="Tu avatar" className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(14,10,7,0.92)] p-6" onClick={() => setZoom(false)}>
          <button type="button" onClick={() => setZoom(false)} className="absolute right-5 top-4 grid size-11 place-items-center text-white/85 hover:text-white" aria-label="Cerrar">
            <X className="size-8" strokeWidth={1.25} aria-hidden />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- imagen del CRM (S3) */}
          <img src={avatar.avatarUrl} alt="Tu avatar" className="max-h-[90vh] w-auto max-w-[min(92vw,560px)] rounded-[14px] object-contain shadow-[0_18px_60px_rgba(0,0,0,0.5)]" />
        </div>
      ) : null}
    </SedkaPage>
  );
}
