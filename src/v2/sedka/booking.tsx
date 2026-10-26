import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useBooking, type Booked } from '@v2/app/cita/nueva/use-booking';
import { Button, LinkButton, Notice } from '@v2/components/ui';
import { cancelAppointment, listAppointments, listFavorites } from '@v2/lib/api';
import { formatLong, formatMonth, formatTime, fromDateKey, mapsUrl, monthGrid, saveCalendarFile, startOfToday, toDateKey } from '@v2/lib/dates';
import type { Appointment } from '@v2/lib/types';
import { useLoad } from '@v2/lib/use-load';
import { SedkaCardHead, SedkaPage } from './shell';

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/** Botón fino de la V1 («Cómo llegar», «Al calendario»). */
const lineButton =
  'inline-flex h-10 flex-1 items-center justify-center gap-2 rounded border border-ink bg-white px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-white';

/** Etiqueta dorada pequeña de las filas de la reserva. */
const rowLabel = 'mb-[3px] block text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-dark';

/** Columna centrada de la V1 para la cita: la agenda y la reserva, una debajo de otra. */
function Column({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-[440px] flex-col px-[18px] pt-8 sm:px-0">{children}</div>;
}

/** Fila de la caja de reserva («Tienda», «Servicio», «Fecha»). */
function Row({ label, htmlFor, children, caret = false }: { label: string; htmlFor?: string; children: ReactNode; caret?: boolean }) {
  return (
    <div
      className={`relative border-b border-line px-[18px] py-[13px] transition-colors last:border-b-0 focus-within:bg-accent/10 ${
        caret
          ? 'after:pointer-events-none after:absolute after:bottom-[19px] after:right-[18px] after:size-2 after:rotate-45 after:border-b-2 after:border-r-2 after:border-accent'
          : ''
      }`}
    >
      <label htmlFor={htmlFor} className={rowLabel}>
        {label}
      </label>
      {children}
    </div>
  );
}

const rowSelect = 'w-full cursor-pointer appearance-none border-0 bg-transparent py-px pr-[26px] text-[16.5px] leading-[1.3] outline-none disabled:cursor-default';

/**
 * Reserva de Sedka con la caja de su V1: tienda, servicio y fecha en una sola
 * ficha, su calendario dorado y las horas en pastillas. Hace lo mismo que la de
 * Atelier (días cerrados o completos, cambiar una cita).
 */
export function SedkaBooking({ onBooked }: { onBooked?: () => void }) {
  const {
    editing,
    shops,
    baseError,
    shop,
    setShopChoice,
    services,
    servicesLoading,
    service,
    setServiceChoice,
    shownMonth,
    setMonth,
    canPrev,
    canNext,
    isBookable,
    date,
    setDateChoice,
    hours,
    hoursLoading,
    hour,
    setHourChoice,
    busy,
    error,
    booked,
    confirm,
  } = useBooking();
  const [calendar, setCalendar] = useState(false);
  const today = toDateKey(startOfToday());

  useEffect(() => {
    if (booked) onBooked?.();
    // Solo al reservar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booked]);

  if (booked) return <SedkaBooked booked={booked} edited={Boolean(editing)} />;

  return (
    <div className="w-full bg-white py-[30px]">
      <SedkaCardHead
        eyebrow="Tu visita"
        title={editing ? 'Cambia tu cita' : 'Reserva tu cita'}
        lead={editing ? 'Elige el nuevo día y la hora.' : 'Ven a probarte tus favoritos en tienda.'}
      />
      {baseError ? (
        <div className="mb-4">
          <Notice tone="danger">{baseError}</Notice>
        </div>
      ) : null}

      <div className="mb-[18px] mt-1 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_34px_rgba(20,16,12,0.06)]">
        <Row label="Tienda" htmlFor="bk-shop" caret={!editing}>
          <select
            id="bk-shop"
            value={shop?.id ?? ''}
            disabled={Boolean(editing)}
            onChange={(e) => {
              setShopChoice(e.target.value ? Number(e.target.value) : null);
              setDateChoice(null);
              setHourChoice(null);
            }}
            className={`${rowSelect} ${shop ? 'text-ink' : 'text-muted'}`}
          >
            <option value="">Elige tu tienda Sedka…</option>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Row>
        <Row label="Servicio" htmlFor="bk-service" caret={Boolean(shop && services?.length)}>
          {shop && !servicesLoading && !services?.length ? (
            <p className="py-px text-[14px] leading-snug text-muted">Esta tienda no tiene citas por internet ahora mismo. Llámanos al {shop.phone} y te buscamos hueco.</p>
          ) : (
            <select
              id="bk-service"
              value={service?.id ?? ''}
              disabled={!shop || servicesLoading}
              onChange={(e) => {
                setServiceChoice(e.target.value ? Number(e.target.value) : null);
                setHourChoice(null);
              }}
              className={`${rowSelect} ${service ? 'text-ink' : 'text-muted'}`}
            >
              <option value="">{servicesLoading ? 'Cargando…' : '¿Qué quieres probarte?'}</option>
              {services?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label || s.name}
                </option>
              ))}
            </select>
          )}
        </Row>
        <Row label="Fecha">
          <button
            type="button"
            disabled={!shop || !service}
            onClick={() => setCalendar(!calendar)}
            aria-expanded={calendar}
            className={`block w-full pr-7 text-left text-[16.5px] leading-[1.3] disabled:cursor-default ${date ? 'text-ink' : 'text-muted'}`}
          >
            {date ? formatLong(fromDateKey(date)) : 'Selecciona una fecha'}
          </button>
          <CalendarDays className="pointer-events-none absolute bottom-3.5 right-[17px] size-[18px] text-accent" strokeWidth={2} aria-hidden />
        </Row>
      </div>

      {calendar && shop && service ? (
        <div className="mb-[18px] mt-2 rounded-[14px] border border-line bg-white px-3.5 pb-2.5 pt-3.5 shadow-[0_12px_34px_rgba(20,16,12,0.1)]">
          <div className="mb-2.5 flex items-center justify-between">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => setMonth(new Date(shownMonth.getFullYear(), shownMonth.getMonth() - 1, 1))}
              className="grid size-[34px] place-items-center rounded-full border border-line text-accent-dark transition-colors hover:border-accent hover:bg-accent/10 disabled:opacity-30"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
            <p className="v2-slab text-[16px]" aria-live="polite">
              {formatMonth(shownMonth)}
            </p>
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setMonth(new Date(shownMonth.getFullYear(), shownMonth.getMonth() + 1, 1))}
              className="grid size-[34px] place-items-center rounded-full border border-line text-accent-dark transition-colors hover:border-accent hover:bg-accent/10 disabled:opacity-30"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((d) => (
              <span key={d} className="pb-2 pt-1 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-muted" aria-hidden>
                {d}
              </span>
            ))}
            {monthGrid(shownMonth.getFullYear(), shownMonth.getMonth()).map((d, i) => {
              if (!d) return <span key={i} />;
              const key = toDateKey(d);
              const bookable = isBookable(d);
              const selected = key === date;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!bookable}
                  aria-pressed={selected}
                  aria-label={`${formatLong(d)}${bookable ? '' : ', sin citas'}`}
                  onClick={() => {
                    setDateChoice(key);
                    setHourChoice(null);
                    setCalendar(false);
                  }}
                  className={`flex aspect-square items-center justify-center rounded-full text-[14px] transition-colors ${
                    selected
                      ? 'bg-accent text-white'
                      : bookable
                        ? `hover:bg-accent/10 hover:text-accent-dark ${key === today ? 'shadow-[inset_0_0_0_1px_rgb(var(--v2-accent))]' : ''}`
                        : 'cursor-default text-[#d8d0c5]'
                  }`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-center text-[11px] text-muted">Los días en gris están cerrados, completos o fuera de plazo.</p>
        </div>
      ) : null}

      {date ? (
        <div className="mb-4">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-dark">Elige tu hora</p>
          {hoursLoading ? (
            <div className="flex gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <span key={i} className="h-11 w-16 rounded-[10px] shimmer" />
              ))}
            </div>
          ) : hours?.length ? (
            <div className="flex flex-wrap gap-2">
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  aria-pressed={hour === h}
                  onClick={() => setHourChoice(h)}
                  className={`rounded-[10px] border px-4 py-[11px] text-[14px] tabular-nums transition-colors ${
                    hour === h ? 'border-accent bg-accent text-white' : 'border-line bg-white hover:border-accent hover:text-accent'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          ) : (
            <p className="w-full rounded-[10px] border border-dashed border-line bg-studio px-4 py-3.5 text-[14px] text-muted">
              Ese día ya no quedan horas. Elige otro en el calendario.
            </p>
          )}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : null}
      <Button block loading={busy} disabled={!shop || !service || !date || !hour} onClick={() => void confirm()} className="mt-1">
        {editing ? 'Guardar el cambio' : 'Confirmar cita'}
      </Button>
    </div>
  );
}

function SedkaBooked({ booked, edited }: { booked: Booked; edited: boolean }) {
  const { data: favorites } = useLoad(listFavorites);
  const day = fromDateKey(booked.date);
  const [h, m] = booked.hour.split(':').map(Number);
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h ?? 10, m ?? 0);
  const address = `${booked.shop.address}, ${booked.shop.city}`;

  return (
    <div className="w-full bg-white py-[30px]">
      <SedkaCardHead eyebrow="Tu visita" title={edited ? 'Cita cambiada' : 'Cita reservada'} lead="Te enviaremos la confirmación por WhatsApp." />
      <dl className="mb-[18px] overflow-hidden rounded-2xl border border-line shadow-[0_10px_34px_rgba(20,16,12,0.06)]">
        {[
          ['Cuándo', `${formatLong(day)}, a las ${booked.hour}`, null],
          ['Dónde', booked.shop.name, address],
          ['Para', booked.service.label || booked.service.name, null],
        ].map(([label, value, extra]) => (
          <div key={label} className="border-b border-line px-[18px] py-[13px] last:border-b-0">
            <dt className={rowLabel}>{label}</dt>
            <dd className="text-[16px]">{value}</dd>
            {extra ? <dd className="text-[13px] text-muted">{extra}</dd> : null}
          </div>
        ))}
      </dl>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() =>
            saveCalendarFile({
              start,
              title: `Cita en ${booked.shop.name}`,
              location: address,
              description: `${booked.service.label || booked.service.name}. Teléfono de la tienda: ${booked.shop.phone}`,
            })
          }
          className={lineButton}
        >
          <CalendarPlus className="size-4" strokeWidth={1.5} aria-hidden />
          Al calendario
        </button>
        <a href={mapsUrl(address)} target="_blank" rel="noopener" className={lineButton}>
          <MapPin className="size-4" strokeWidth={1.5} aria-hidden />
          Cómo llegar
        </a>
      </div>
      {favorites?.length ? (
        <p className="mt-6 text-center text-[13px] leading-relaxed text-muted">
          Enséñale tus favoritos a tu asesora al llegar: {favorites.map((f) => f.dressName).join(', ')}.{' '}
          <Link href="/favoritos" className="text-accent-dark underline underline-offset-2">
            Ver favoritos
          </Link>
        </p>
      ) : null}
      <LinkButton href="/coleccion" block variant="secondary" className="mt-6">
        Seguir probando
      </LinkButton>
      <p className="mt-5 text-center text-[11px] text-muted">
        ¿Necesitas ayuda? Llama a {booked.shop.name}: {booked.shop.phone}.
      </p>
    </div>
  );
}

function SedkaAppointment({ appointment: a, onCancelled }: { appointment: Appointment; onCancelled: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const start = new Date(a.date);
  const address = `${a.location.address}, ${a.location.city}`;

  const cancel = async () => {
    setBusy(true);
    setError(null);
    try {
      await cancelAppointment(a.id);
      onCancelled();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar. Llama a la tienda.');
      setBusy(false);
    }
  };

  return (
    <li className="mb-3 border border-line px-[18px] py-4">
      <p className="v2-slab mb-1 text-[16px]">
        {formatLong(start)} · {formatTime(start)}
      </p>
      <p className="text-[13px] leading-normal text-muted">
        {a.location.name}
        <br />
        {address}
      </p>
      <p className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-accent-dark">{a.status || 'Cita reservada'}</p>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
        <button
          type="button"
          onClick={() =>
            saveCalendarFile({ start, title: `Cita en ${a.location.name}`, location: address, description: `Teléfono de la tienda: ${a.location.phone}` })
          }
          className="inline-flex items-center gap-1.5 text-accent-dark hover:underline"
        >
          <CalendarPlus className="size-4" strokeWidth={1.5} aria-hidden />
          Al calendario
        </button>
        <a href={mapsUrl(address)} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
          <MapPin className="size-4" strokeWidth={1.5} aria-hidden />
          Cómo llegar
        </a>
      </div>

      {error ? (
        <div className="mt-3">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : null}

      {confirming ? (
        <div className="mt-3 rounded-[10px] bg-studio p-4" role="alertdialog" aria-labelledby={`cancel-${a.id}`}>
          <p id={`cancel-${a.id}`} className="text-[13px]">
            ¿Seguro que quieres cancelar la cita? Si solo te viene mal la hora, puedes cambiarla.
          </p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => setConfirming(false)} disabled={busy} className="flex-1 rounded border border-line bg-white px-3 py-2 text-[11px] uppercase tracking-[0.1em]">
              No, volver
            </button>
            <button
              type="button"
              onClick={() => void cancel()}
              disabled={busy}
              className="flex-1 rounded border border-danger bg-danger px-3 py-2 text-[11px] uppercase tracking-[0.1em] text-white disabled:opacity-60"
            >
              {busy ? 'Cancelando…' : 'Sí, cancelar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <Link
            href={`/cita/nueva?edit=${a.id}`}
            className="rounded border border-ink px-3.5 py-2 text-[11px] uppercase tracking-[0.1em] transition-colors hover:bg-ink hover:text-white"
          >
            Cambiar
          </Link>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded border border-danger px-3.5 py-2 text-[11px] uppercase tracking-[0.1em] text-danger transition-colors hover:bg-danger hover:text-white"
          >
            Cancelar
          </button>
        </div>
      )}
    </li>
  );
}

/** «Cita» de Sedka, como en su V1: sus próximas citas (si tiene) y, debajo, la reserva. */
export function SedkaAppointments() {
  const { data, error, reload, setData } = useLoad(listAppointments);
  const [cancelled, setCancelled] = useState(false);
  const upcoming = data?.upcoming ?? [];

  return (
    <SedkaPage>
      <Column>
        {error ? (
          <Notice tone="danger">
            No se pudieron cargar tus citas.{' '}
            <button type="button" className="underline" onClick={() => void reload()}>
              Reintentar
            </button>
          </Notice>
        ) : null}
        {cancelled ? <Notice>Hemos cancelado tu cita.</Notice> : null}
        {upcoming.length ? (
          <div className="mb-1.5 border-b border-line pb-[26px] pt-[30px]">
            <SedkaCardHead eyebrow="Tu agenda" title="Mis citas" lead="Tus próximas visitas a tienda." />
            <ul>
              {upcoming.map((a) => (
                <SedkaAppointment
                  key={a.id}
                  appointment={a}
                  onCancelled={() => {
                    setCancelled(true);
                    if (data) setData({ ...data, upcoming: data.upcoming.filter((x) => x.id !== a.id) });
                  }}
                />
              ))}
            </ul>
          </div>
        ) : null}
        <SedkaBooking onBooked={() => void reload()} />
        {data?.past.length ? (
          <section className="border-t border-line py-6" aria-labelledby="pasadas">
            <h2 id="pasadas" className="mb-2 text-[11px] uppercase tracking-[0.3em] text-muted">
              Anteriores
            </h2>
            <ul className="text-[13px] text-muted">
              {data.past.map((a) => (
                <li key={a.id} className="py-1">
                  {formatLong(new Date(a.date))} · {a.location.name}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Column>
    </SedkaPage>
  );
}

/** Pedir o cambiar una cita (desde el probador o «Cambiar»): solo la reserva. */
export function SedkaNewAppointment() {
  return (
    <SedkaPage>
      <Column>
        <Link href="/citas" className="mb-1 self-start py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-dark hover:underline">
          ← Mis citas
        </Link>
        <SedkaBooking />
      </Column>
    </SedkaPage>
  );
}
