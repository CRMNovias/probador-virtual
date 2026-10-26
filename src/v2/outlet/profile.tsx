import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { selectClass, useProfileScreen } from '@v2/app/perfil/use-profile-screen';
import { Button, Field, Notice } from '@v2/components/ui';
import { brand } from '@v2/lib/brand';
import { WEDDING_MOMENTS, WEDDING_STYLES } from '@v2/lib/profile';
import type { WeddingStyle } from '@v2/lib/types';
import { OutletHead, OutletPage, outletLabel } from './shell';

/** Bloque del perfil de la V1: antetítulo espaciado, su explicación y los campos. */
function Section({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <section className="border-b border-line py-8">
      <h2 className={outletLabel}>{title}</h2>
      <p className="mb-6 mt-1 text-[12px] leading-normal text-muted">{sub}</p>
      {children}
    </section>
  );
}

function SelectField({ id, label, children, ...rest }: React.ComponentProps<'select'> & { id: string; label: string }) {
  return (
    <div>
      <label htmlFor={id} className="label-caps block text-muted">
        {label}
      </label>
      <select id={id} {...rest} className={selectClass(Boolean(rest['aria-invalid']))}>
        {children}
      </select>
    </div>
  );
}

/** Perfil de Outlet: el de su V1 (datos personales, datos de la boda y avatar). */
export function OutletProfile() {
  const { profile, shops, avatar, values, draft, set, shown, save, signOut, busy, saved, error, loadError, reload } = useProfileScreen();
  const [zoom, setZoom] = useState(false);

  return (
    <OutletPage>
      <OutletHead number="05" eyebrow="Cuenta" title="Perfil" sub="Datos personales, detalles de tu boda y avatar." />
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
        <div className="max-w-[560px] pb-12">
          {loadError ? (
            <div className="pt-6">
              <Notice tone="danger">
                {loadError}{' '}
                <button type="button" className="underline" onClick={() => void reload()}>
                  Reintentar
                </button>
              </Notice>
            </div>
          ) : !profile || !values ? (
            <div className="mt-8 h-96 shimmer" />
          ) : (
            <form onSubmit={save} noValidate>
              <Section title="Datos personales" sub="Información de contacto que usa nuestro equipo.">
                <div className="space-y-5">
                  <Field label="Teléfono" name="phone" value={profile.phone} disabled readOnly />
                  <Field label="Nombre completo" name="name" autoComplete="name" value={values.name} onChange={(e) => set('name', e.target.value)} error={shown('name')} />
                  <Field label="Email" name="email" type="email" autoComplete="email" value={values.email} onChange={(e) => set('email', e.target.value)} error={shown('email')} />
                  <Field
                    label="Código postal"
                    name="postcode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={values.postcode}
                    onChange={(e) => set('postcode', e.target.value)}
                    error={shown('postcode')}
                  />
                  <div>
                    <SelectField id="shopId" label="Tienda" value={values.shopId} onChange={(e) => set('shopId', e.target.value)} aria-invalid={Boolean(shown('shopId'))}>
                      <option value="">Selecciona…</option>
                      {shops.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </SelectField>
                    {shown('shopId') ? <p className="mt-2 text-[13px] text-danger">{shown('shopId')}</p> : null}
                  </div>
                  <label className="flex items-start gap-3 text-[13px] leading-snug">
                    <input type="checkbox" checked={values.whatsapp} onChange={(e) => set('whatsapp', e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-ink" />
                    Quiero recibir mis pruebas virtuales por WhatsApp.
                  </label>
                </div>
              </Section>

              <Section title="Datos de tu boda" sub="Esta información es opcional, pero nos ayuda a aconsejarte mejor.">
                <div className="space-y-5">
                  <Field label="Fecha de la boda" name="weddingDate" type="date" value={values.weddingDate} onChange={(e) => set('weddingDate', e.target.value)} />
                  <Field
                    label="Lugar de la boda"
                    name="weddingPlace"
                    placeholder="Ej.: Madrid, Finca Los Olivos"
                    maxLength={100}
                    value={values.weddingPlace}
                    onChange={(e) => set('weddingPlace', e.target.value)}
                  />
                  <SelectField id="weddingStyle" label="Estilo de boda" value={values.weddingStyle} onChange={(e) => set('weddingStyle', e.target.value as WeddingStyle | '')}>
                    <option value="">Selecciona un estilo</option>
                    {WEDDING_STYLES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </SelectField>
                  {/* «Momento del evento»: dos botones, como en la V1 */}
                  <fieldset>
                    <legend className="label-caps text-muted">Momento del evento</legend>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {WEDDING_MOMENTS.map((m) => {
                        const on = values.weddingMoment === m.value;
                        return (
                          <button
                            key={m.value}
                            type="button"
                            aria-pressed={on}
                            onClick={() => set('weddingMoment', on ? '' : m.value)}
                            className={`h-11 rounded-md border text-[13px] transition-colors ${on ? 'border-ink bg-ink text-white' : 'border-ink/30 bg-white hover:border-ink'}`}
                          >
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                </div>
              </Section>

              <Section title="Tu avatar" sub="Si no te convence, puedes generarlo de nuevo con otra foto.">
                <div className="flex flex-wrap items-center gap-5 sm:flex-nowrap">
                  {avatar ? (
                    <button type="button" onClick={() => setZoom(true)} className="shrink-0 cursor-zoom-in" aria-label="Ver tu avatar en grande">
                      {/* eslint-disable-next-line @next/next/no-img-element -- imagen del CRM (S3) */}
                      <img src={avatar.avatarUrl} alt="" className="aspect-[3/4] w-[84px] border border-ink object-cover object-top" />
                    </button>
                  ) : (
                    <span className="grid aspect-[3/4] w-[84px] shrink-0 place-items-center border border-dashed border-ink/30 text-center font-mono text-[10px] uppercase text-muted">
                      Sin
                      <br />
                      avatar
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px]">{avatar ? 'Tu avatar está listo.' : 'Aún no tienes avatar.'}</p>
                    <p className="mt-1 text-[12px] text-muted">Con él te pruebas cualquier vestido o traje.</p>
                  </div>
                  <Link
                    href="/avatar?next=/perfil"
                    className="w-full whitespace-nowrap border border-ink px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-white sm:w-auto"
                  >
                    {avatar ? 'Cambiar foto' : 'Crear mi avatar'}
                  </Link>
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
                <button type="button" onClick={() => void signOut()} className="underline underline-offset-2 hover:text-ink">
                  Cerrar sesión
                </button>
                <a href={brand.privacyUrl} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-ink">
                  Política de privacidad
                </a>
              </p>
            </form>
          )}
        </div>
      </div>

      {zoom && avatar ? (
        <div role="dialog" aria-label="Tu avatar" className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-6" onClick={() => setZoom(false)}>
          <button type="button" onClick={() => setZoom(false)} className="absolute right-5 top-4 grid size-11 place-items-center text-white/85 hover:text-white" aria-label="Cerrar">
            <X className="size-8" strokeWidth={1.25} aria-hidden />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- imagen del CRM (S3) */}
          <img src={avatar.avatarUrl} alt="Tu avatar" className="max-h-[90vh] w-auto max-w-[min(92vw,560px)] object-contain" />
        </div>
      ) : null}
    </OutletPage>
  );
}
