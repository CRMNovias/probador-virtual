import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { CalendarPlus, ChevronLeft, ChevronRight, MapPin, Plus } from 'lucide-react';
import { useBooking, type Booked } from '@v2/app/cita/nueva/use-booking';
import { Button, LinkButton, Notice } from '@v2/components/ui';
import { cancelAppointment, listAppointments, listFavorites } from '@v2/lib/api';
import { brand } from '@v2/lib/brand';
import { formatLong, formatMonth, formatTime, fromDateKey, mapsUrl, monthGrid, saveCalendarFile, startOfToday, toDateKey } from '@v2/lib/dates';
import type { Appointment } from '@v2/lib/types';
import { useLoad } from '@v2/lib/use-load';
import { OutletEmpty, OutletHead, OutletPage, outletLabel, outletWidth } from './shell';

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const STEPS = ['Elige la tienda', '¿Qué quieres probarte?', 'Elige el día', 'Elige la hora', 'Confirma tu cita'] as const;

/** Botón de línea («Al calendario», «Cómo llegar», «Cambiar»). */
const lineButton =
  'inline-flex h-10 items-center justify-center gap-2 border border-ink bg-white px-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ink hover:text-white';

/** Opción de la lista (tienda, servicio): caja de borde fino; la elegida, en negro. */
function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`block w-full border px-4 py-3.5 text-left transition-colors ${on ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink'}`}
    >
      {children}
    </button>
  );
}

/** «01 / 05» y la barra de pasos de la V1. */
function Progress({ step }: { step: number }) {
  return (
    <div>
      <p className="font-mono text-[11px] text-muted">
        {String(step).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
      </p>
      <div className="mt-2.5 grid grid-cols-5 gap-1.5" aria-hidden>
        {STEPS.map((s, i) => (
          <span key={s} className={`h-0.5 ${i < step ? 'bg-ink' : 'bg-line'}`} />
        ))}
      </div>
    </div>
  );
}

/**
 * Reserva de Outlet como la de su V1: un paso por pantalla (tienda, servicio,
 * día, hora y confirmar) con su barra «01 / 05». Hace lo mismo que la de
 * Atelier (días cerrados o completos, cambiar una cita).
 */
export function OutletBooking({ onBooked }: { onBooked?: () => void }) {
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
  // Al cambiar una cita, la tienda y el servicio no cambian: se empieza en el día.
  const [stepChoice, setStep] = useState<number | null>(null);
  const step = stepChoice ?? (editing ? 3 : 1);
  const today = toDateKey(startOfToday());

  useEffect(() => {
    if (booked) onBooked?.();
    // Solo al reservar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booked]);

  if (booked) return <OutletBooked booked={booked} edited={Boolean(editing)} />;

  const canGo = [Boolean(shop), Boolean(service), Boolean(date), Boolean(hour), true][step - 1];
  const first = editing ? 3 : 1;

  return (
    <div className="w-full">
      <Progress step={step} />
      <p className={`mt-6 ${outletLabel}`}>{editing ? 'Cambiar cita' : 'Reserva'}</p>
      <h1 className="mt-1 text-[40px] font-bold leading-[1.05] tracking-[-0.01em] sm:text-[48px]">{editing ? 'Cambia tu cita' : 'Reservar'}</h1>
      <h2 className="mb-4 mt-6 text-[16px] font-semibold">{STEPS[step - 1]}</h2>

      {baseError ? (
        <div className="mb-4">
          <Notice tone="danger">{baseError}</Notice>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-2.5">
          {!shops.length && !baseError ? <span className="block h-24 shimmer" /> : null}
          {shops.map((s) => (
            <Choice
              key={s.id}
              on={shop?.id === s.id}
              onClick={() => {
                setShopChoice(s.id);
                setServiceChoice(null);
                setDateChoice(null);
                setHourChoice(null);
              }}
            >
              <span className="block text-[15px] font-semibold">{s.name}</span>
              <span className={`mt-0.5 block text-[13px] leading-snug ${shop?.id === s.id ? 'text-white/75' : 'text-muted'}`}>
                {s.address} · {s.city}
              </span>
              <span className={`mt-1 block font-mono text-[11px] ${shop?.id === s.id ? 'text-white/60' : 'text-muted'}`}>{s.phone}</span>
            </Choice>
          ))}
        </div>
      ) : null}

      {step === 2 ? (
        servicesLoading ? (
          <span className="block h-24 shimmer" />
        ) : services?.length ? (
          <div className="space-y-2.5">
            {services.map((s) => (
              <Choice
                key={s.id}
                on={service?.id === s.id}
                onClick={() => {
                  setServiceChoice(s.id);
                  setDateChoice(null);
                  setHourChoice(null);
                }}
              >
                <span className="block text-[15px] font-semibold">{s.label || s.name}</span>
              </Choice>
            ))}
          </div>
        ) : (
          <p className="border border-line px-4 py-4 text-[14px] leading-relaxed text-muted">
            Esta tienda no tiene citas por internet ahora mismo. Llámanos al {shop?.phone} y te buscamos hueco.
          </p>
        )
      ) : null}

      {step === 3 ? (
        <div className="border border-line px-3.5 pb-3 pt-3.5">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => setMonth(new Date(shownMonth.getFullYear(), shownMonth.getMonth() - 1, 1))}
              className="grid size-9 place-items-center border border-line transition-colors hover:border-ink disabled:opacity-30"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
            <p className="text-[12px] font-bold uppercase tracking-[0.2em]" aria-live="polite">
              {formatMonth(shownMonth)}
            </p>
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setMonth(new Date(shownMonth.getFullYear(), shownMonth.getMonth() + 1, 1))}
              className="grid size-9 place-items-center border border-line transition-colors hover:border-ink disabled:opacity-30"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <span key={d} className="pb-1.5 text-center font-mono text-[10px] uppercase text-muted" aria-hidden>
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
                    setStep(4);
                  }}
                  className={`flex aspect-square items-center justify-center text-[14px] tabular-nums transition-colors ${
                    selected ? 'bg-ink text-white' : bookable ? `hover:bg-studio ${key === today ? 'shadow-[inset_0_0_0_1px_rgb(var(--v2-ink))]' : ''}` : 'cursor-default text-ink/20'
                  }`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-[11px] text-muted">Los días en gris están cerrados, completos o fuera de plazo.</p>
        </div>
      ) : null}

      {step === 4 ? (
        <div>
          <p className="mb-3 text-[13px] text-muted">{date ? formatLong(fromDateKey(date)) : null}</p>
          {hoursLoading ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }, (_, i) => (
                <span key={i} className="h-11 shimmer" />
              ))}
            </div>
          ) : hours?.length ? (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  aria-pressed={hour === h}
                  onClick={() => setHourChoice(h)}
                  className={`h-11 border font-mono text-[13px] tabular-nums transition-colors ${hour === h ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink'}`}
                >
                  {h}
                </button>
              ))}
            </div>
          ) : (
            <p className="border border-dashed border-line px-4 py-4 text-[14px] text-muted">Ese día ya no quedan horas. Vuelve atrás y elige otro.</p>
          )}
        </div>
      ) : null}

      {step === 5 && shop && service && date && hour ? (
        <dl className="border border-line">
          {[
            ['Tienda', shop.name, `${shop.address}, ${shop.city}`],
            ['Servicio', service.label || service.name, null],
            ['Día', formatLong(fromDateKey(date)), null],
            ['Hora', hour, null],
          ].map(([label, value, extra]) => (
            <div key={label} className="border-b border-line px-4 py-3 last:border-b-0">
              <dt className={outletLabel}>{label}</dt>
              <dd className="mt-0.5 text-[15px]">{value}</dd>
              {extra ? <dd className="text-[12px] text-muted">{extra}</dd> : null}
            </div>
          ))}
        </dl>
      ) : null}

      {error ? (
        <div className="mt-4">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : null}

      <div className="mt-6 flex gap-2.5">
        {step > first ? (
          <Button variant="secondary" onClick={() => setStep(step - 1)} className="px-5" aria-label="Paso anterior">
            <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden />
          </Button>
        ) : null}
        {step < STEPS.length ? (
          <Button block disabled={!canGo} onClick={() => setStep(step + 1)} className="flex-1">
            Continuar
          </Button>
        ) : (
          <Button block loading={busy} disabled={!shop || !service || !date || !hour} onClick={() => void confirm()} className="flex-1">
            {editing ? 'Guardar el cambio' : 'Confirmar cita'}
          </Button>
        )}
      </div>
    </div>
  );
}

function OutletBooked({ booked, edited }: { booked: Booked; edited: boolean }) {
  const { data: favorites } = useLoad(listFavorites);
  const day = fromDateKey(booked.date);
  const [h, m] = booked.hour.split(':').map(Number);
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h ?? 10, m ?? 0);
  const address = `${booked.shop.address}, ${booked.shop.city}`;

  return (
    <div className="w-full">
      <p className="font-mono text-[11px] text-muted">✓</p>
      <p className={`mt-6 ${outletLabel}`}>Reserva</p>
      <h1 className="mt-1 text-[40px] font-bold leading-[1.05] tracking-[-0.01em] sm:text-[48px]">{edited ? 'Cita cambiada' : 'Cita reservada'}</h1>
      <p className="mb-6 mt-2 text-[14px] text-muted">Te enviaremos la confirmación por WhatsApp.</p>
      <dl className="mb-5 border border-ink">
        {[
          ['Cuándo', `${formatLong(day)}, a las ${booked.hour}`, null],
          ['Dónde', booked.shop.name, address],
          ['Para', booked.service.label || booked.service.name, null],
        ].map(([label, value, extra]) => (
          <div key={label} className="border-b border-line px-4 py-3 last:border-b-0">
            <dt className={outletLabel}>{label}</dt>
            <dd className="mt-0.5 text-[15px]">{value}</dd>
            {extra ? <dd className="text-[12px] text-muted">{extra}</dd> : null}
          </div>
        ))}
      </dl>
      <div className="grid grid-cols-2 gap-2">
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
        <p className="mt-6 text-[13px] leading-relaxed text-muted">
          Enséñale tus favoritos a tu asesora al llegar: {favorites.map((f) => f.dressName).join(', ')}.{' '}
          <Link href="/favoritos" className="text-ink underline underline-offset-2">
            Ver favoritos
          </Link>
        </p>
      ) : null}
      <LinkButton href="/probador" block variant="secondary" className="mt-6">
        Seguir probando
      </LinkButton>
      <p className="mt-5 text-center text-[11px] text-muted">
        ¿Necesitas ayuda? Llama a {booked.shop.name}: {booked.shop.phone}.
      </p>
    </div>
  );
}

function OutletAppointment({ appointment: a, onCancelled }: { appointment: Appointment; onCancelled: () => void }) {
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
    <li className="border border-ink p-4 sm:p-5">
      <p className="font-mono text-[11px] uppercase text-muted">{a.status || 'Cita reservada'}</p>
      <p className="mt-1.5 text-[20px] font-bold leading-tight">
        {formatLong(start)} · {formatTime(start)}
      </p>
      <p className="mt-1 text-[13px] leading-normal text-muted">
        {a.location.name} · {address}
      </p>

      {error ? (
        <div className="mt-3">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : null}

      {confirming ? (
        <div className="mt-4 bg-studio p-4" role="alertdialog" aria-labelledby={`cancel-${a.id}`}>
          <p id={`cancel-${a.id}`} className="text-[13px]">
            ¿Seguro que quieres cancelar la cita? Si solo te viene mal la hora, puedes cambiarla.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setConfirming(false)} disabled={busy} className={lineButton}>
              No, volver
            </button>
            <button
              type="button"
              onClick={() => void cancel()}
              disabled={busy}
              className="inline-flex h-10 items-center justify-center border border-danger bg-danger px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white disabled:opacity-60"
            >
              {busy ? 'Cancelando…' : 'Sí, cancelar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/cita/nueva?edit=${a.id}`} className={lineButton}>
            Cambiar
          </Link>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex h-10 items-center justify-center border border-danger px-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-danger transition-colors hover:bg-danger hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => saveCalendarFile({ start, title: `Cita en ${a.location.name}`, location: address, description: `Teléfono de la tienda: ${a.location.phone}` })}
            className={lineButton}
            aria-label="Añadir al calendario"
          >
            <CalendarPlus className="size-4" strokeWidth={1.5} aria-hidden />
          </button>
          <a href={mapsUrl(address)} target="_blank" rel="noopener" className={lineButton} aria-label="Cómo llegar">
            <MapPin className="size-4" strokeWidth={1.5} aria-hidden />
          </a>
        </div>
      )}
    </li>
  );
}

/** Citas de Outlet, como en su V1: «04 · Reservas», las activas y «+ Nueva cita». */
export function OutletAppointments() {
  const { data, error, reload, setData } = useLoad(listAppointments);
  const [cancelled, setCancelled] = useState(false);
  const upcoming = data?.upcoming ?? [];

  return (
    <OutletPage>
      <OutletHead
        number="04"
        eyebrow="Reservas"
        title="Citas"
        count={data ? `${upcoming.length} ${upcoming.length === 1 ? 'activa' : 'activas'}` : ' '}
        action={
          <Link
            href="/cita/nueva"
            className="v2-btn inline-flex h-10 items-center gap-1.5 bg-ink px-4 text-[11px] uppercase text-white transition-colors hover:bg-accent-dark"
          >
            <Plus className="size-3.5" strokeWidth={2.5} aria-hidden />
            Nueva cita
          </Link>
        }
      />
      <div className={outletWidth}>
        <div className="max-w-[760px] pt-8">
          {error ? (
            <Notice tone="danger">
              No se pudieron cargar tus citas.{' '}
              <button type="button" className="underline" onClick={() => void reload()}>
                Reintentar
              </button>
            </Notice>
          ) : null}
          {cancelled ? <Notice>Hemos cancelado tu cita.</Notice> : null}
          {!data && !error ? (
            <span className="block h-32 shimmer" />
          ) : upcoming.length ? (
            <ul className="space-y-3">
              {upcoming.map((a) => (
                <OutletAppointment
                  key={a.id}
                  appointment={a}
                  onCancelled={() => {
                    setCancelled(true);
                    if (data) setData({ ...data, upcoming: data.upcoming.filter((x) => x.id !== a.id) });
                  }}
                />
              ))}
            </ul>
          ) : data ? (
            <OutletEmpty action={<LinkButton href="/cita/nueva">Pedir cita</LinkButton>}>
              No tienes citas registradas. Agenda tu primera para probarte tus favoritos en {brand.name}.
            </OutletEmpty>
          ) : null}
          {data?.past.length ? (
            <section className="mt-10" aria-labelledby="pasadas">
              <h2 id="pasadas" className={outletLabel}>
                Anteriores
              </h2>
              <ul className="mt-3 border-t border-line text-[13px] text-muted">
                {data.past.map((a) => (
                  <li key={a.id} className="border-b border-line py-2.5">
                    {formatLong(new Date(a.date))} · {a.location.name}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </OutletPage>
  );
}

/** Pedir o cambiar una cita (desde el probador, «Nueva cita» o «Cambiar»): la reserva, paso a paso. */
export function OutletNewAppointment() {
  return (
    <OutletPage>
      <div className="mx-auto w-full max-w-[560px] px-5 pt-8 sm:px-8 sm:pt-12">
        <Link href="/citas" className="mb-6 inline-block text-[10px] font-semibold uppercase tracking-[0.24em] text-muted hover:text-ink">
          ← Mis citas
        </Link>
        <OutletBooking />
      </div>
    </OutletPage>
  );
}
