import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button, Eyebrow, Field, LinkButton, Notice } from '@v2/components/ui';
import { brand } from '@v2/lib/brand';
import { formatLong, formatTime } from '@v2/lib/dates';
import { WEDDING_MOMENTS, WEDDING_STYLES } from '@v2/lib/profile';
import type { WeddingStyle } from '@v2/lib/types';
import { selectClass, useProfileScreen } from './use-profile-screen';

/**
 * Perfil: los datos del registro (y los de la boda, como en la V1) se pueden
 * cambiar aquí. En móvil también reúne las citas, que no caben en la barra.
 */
export function ProfileScreen() {
  const { profile, shops, avatar, next, values, draft, set, shown, save, signOut, busy, saved, error, loadError, reload } = useProfileScreen();

  if (loadError) {
    return (
      <div className="mt-6">
        <Notice tone="danger">
          {loadError}{' '}
          <button type="button" className="underline" onClick={() => void reload()}>
            Reintentar
          </button>
        </Notice>
      </div>
    );
  }
  if (!profile || !values) return <div className="mt-6 h-96 shimmer" />;

  return (
    <div className="lg:mt-2 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start lg:gap-16">
      {/* Resumen: hola, avatar y próxima cita */}
      <div>
        <p className="mt-1 text-[13px] text-muted">
          Hola{profile.name ? `, ${profile.name.split(' ')[0]}` : ''}. Tu teléfono de acceso es {profile.phone}.
        </p>

        <ul className="mt-6 divide-y divide-line border-y border-line">
          <li>
            <Link href="/avatar?next=/perfil" className="flex items-center gap-4 py-4">
              <span className="relative block h-20 w-14 shrink-0 overflow-hidden bg-studio">
                {avatar?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- imagen del CRM (S3)
                  <img src={avatar.avatarUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : null}
              </span>
              <span className="flex-1">
                <span className="label-caps block">Mi avatar</span>
                <span className="text-[13px] text-muted">{avatar ? 'Verlo o hacerlo con otra foto' : 'Aún no lo has creado'}</span>
              </span>
              <ChevronRight className="size-4 text-muted" strokeWidth={1.5} aria-hidden />
            </Link>
          </li>
          <li>
            <Link href="/citas" className="flex items-center gap-4 py-4">
              <span className="flex-1">
                <span className="label-caps block">Mis citas</span>
                <span className="text-[13px] text-muted">
                  {next
                    ? `${formatLong(new Date(next.date))} · ${formatTime(new Date(next.date))} · ${next.location.name}`
                    : 'No tienes citas pendientes'}
                </span>
              </span>
              <ChevronRight className="size-4 text-muted" strokeWidth={1.5} aria-hidden />
            </Link>
          </li>
        </ul>
        {next ? null : (
          <LinkButton href="/cita/nueva" block className="mt-4">
            Pedir cita
          </LinkButton>
        )}
      </div>

      {/* Datos del registro, editables */}
      <form onSubmit={save} noValidate className="mt-10 lg:mt-0">
        <Eyebrow>Mis datos</Eyebrow>
        <div className="mt-4 space-y-5">
          <Field label="Nombre" name="name" autoComplete="name" value={values.name} onChange={(e) => set('name', e.target.value)} error={shown('name')} />
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            error={shown('email')}
          />
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
            <label htmlFor="shopId" className="label-caps mb-1 block text-muted">
              Tu {brand.shop.one}
            </label>
            <select
              id="shopId"
              value={values.shopId}
              onChange={(e) => set('shopId', e.target.value)}
              aria-invalid={Boolean(shown('shopId'))}
              className={selectClass(Boolean(shown('shopId')))}
            >
              <option value="">Elige {brand.shop.a}</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {shown('shopId') ? <p className="mt-2 text-[13px] text-danger">{shown('shopId')}</p> : null}
          </div>
          <label className="flex items-start gap-3 text-[13px] leading-snug">
            <input type="checkbox" checked={values.whatsapp} onChange={(e) => set('whatsapp', e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-accent" />
            Quiero recibir mis pruebas por WhatsApp.
          </label>
        </div>

        <Eyebrow className="mt-10">Tu boda · opcional</Eyebrow>
        <p className="mt-1 text-[13px] text-muted">Nos ayuda a recomendarte modelos y a preparar tu cita.</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field label="Fecha" name="weddingDate" type="date" value={values.weddingDate} onChange={(e) => set('weddingDate', e.target.value)} />
          <Field label="Lugar" name="weddingPlace" value={values.weddingPlace} onChange={(e) => set('weddingPlace', e.target.value)} />
          <div>
            <label htmlFor="weddingStyle" className="label-caps mb-1 block text-muted">
              Estilo
            </label>
            <select
              id="weddingStyle"
              value={values.weddingStyle}
              onChange={(e) => set('weddingStyle', e.target.value as WeddingStyle | '')}
              className={selectClass(false)}
            >
              <option value="">Sin decidir</option>
              {WEDDING_STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <fieldset>
            <legend className="label-caps mb-1 block text-muted">Momento</legend>
            <div className="flex gap-2 pt-1">
              {WEDDING_MOMENTS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  aria-pressed={values.weddingMoment === m.value}
                  onClick={() => set('weddingMoment', values.weddingMoment === m.value ? '' : m.value)}
                  className={`h-10 flex-1 border text-[11px] uppercase tracking-[0.1em] ${values.weddingMoment === m.value ? 'border-accent bg-accent text-white' : 'border-line'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-8 space-y-3">
          {error ? <Notice tone="danger">{error}</Notice> : null}
          {saved ? <Notice>Hemos guardado tus datos.</Notice> : null}
          <Button type="submit" block loading={busy} disabled={!draft}>
            Guardar cambios
          </Button>
          <Button variant="ghost" block onClick={() => void signOut()}>
            Cerrar sesión
          </Button>
        </div>
        <p className="mt-4 text-center text-[11px] text-muted">
          <a href={brand.privacyUrl} target="_blank" rel="noopener" className="underline underline-offset-2">
            Política de privacidad
          </a>
        </p>
      </form>
    </div>
  );
}
