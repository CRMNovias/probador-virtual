import Link from 'next/link';
import { CalendarPlus, Check, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { TopBar } from '@v2/components/app-shell';
import { Button, Eyebrow, LinkButton, Notice } from '@v2/components/ui';
import { listFavorites } from '@v2/lib/api';
import { brand, capitalize } from '@v2/lib/brand';
import { formatLong, formatMonth, formatShort, fromDateKey, mapsUrl, monthGrid, saveCalendarFile, toDateKey } from '@v2/lib/dates';
import { useLoad } from '@v2/lib/use-load';
import { useBooking, type Booked } from './use-booking';

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function BookingFlow() {
  const {
    editing,
    shops,
    baseError,
    shop,
    setShopChoice,
    changingShop,
    setChangingShop,
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

  if (booked) return <BookedView booked={booked} edited={Boolean(editing)} />;

  const title = editing ? 'Cambiar mi cita' : 'Pedir cita';
  const heading = 'label-caps text-muted';

  return (
    <>
      <TopBar back title={title} />
      <main className="mx-auto max-w-md px-4 pb-44 pt-6 lg:grid lg:max-w-5xl lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-16 lg:px-6 lg:pb-16 lg:pt-10">
        <div className="lg:max-w-lg">
          <h1 className="text-[20px] font-light uppercase leading-tight tracking-[0.06em]">{editing ? 'Elige el nuevo día' : 'Ven a probártelo'}</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            Una asesora te esperará en tu {brand.shop.one}. La cita es gratuita y dura alrededor de una hora.
          </p>
          {baseError ? (
            <div className="mt-4">
              <Notice tone="danger">{baseError}</Notice>
            </div>
          ) : null}

          <section className="mt-8" aria-labelledby="atelier">
            <h2 id="atelier" className={heading}>
              {capitalize(brand.shop.one)}
            </h2>
            {shop && !changingShop ? (
              <div className="mt-2 flex items-start gap-3 border-y border-line py-4">
                <MapPin className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium uppercase tracking-[0.06em]">{shop.name}</p>
                  <p className="mt-0.5 text-[13px] text-muted">
                    {shop.address} · {shop.city}
                  </p>
                </div>
                {shops.length > 1 && !editing ? (
                  <button type="button" onClick={() => setChangingShop(true)} className="label-caps h-8 underline underline-offset-4">
                    Cambiar
                  </button>
                ) : null}
              </div>
            ) : (
              <ul className="mt-2 border-t border-line">
                {shops.map((s) => (
                  <li key={s.id} className="border-b border-line">
                    <button
                      type="button"
                      aria-pressed={shop?.id === s.id}
                      onClick={() => {
                        setShopChoice(s.id);
                        setChangingShop(false);
                        setDateChoice(null);
                        setHourChoice(null);
                      }}
                      className="flex w-full items-start gap-3 py-4 text-left"
                    >
                      <span className={`mt-1 size-3 shrink-0 border border-ink ${shop?.id === s.id ? 'border-accent bg-accent' : ''}`} aria-hidden />
                      <span>
                        <span className="block text-[13px] font-medium uppercase tracking-[0.06em]">{s.name}</span>
                        <span className="mt-0.5 block text-[13px] text-muted">
                          {s.address} · {s.city}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {shop ? (
            <section className="mt-8" aria-labelledby="servicio">
              <h2 id="servicio" className={heading}>
                Qué quieres probarte
              </h2>
              {servicesLoading ? (
                <div className="mt-2 h-10 w-2/3 shimmer" />
              ) : services?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={service?.id === s.id}
                      onClick={() => {
                        setServiceChoice(s.id);
                        setHourChoice(null);
                      }}
                      className={`h-10 border px-4 text-[11px] font-medium uppercase tracking-[0.1em] ${service?.id === s.id ? 'border-accent bg-accent text-white' : 'border-line'}`}
                    >
                      {s.label || s.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[13px] text-muted">
                  {capitalize(brand.shop.this)} no tiene citas por internet ahora mismo. Llámanos al {shop.phone} y te buscamos hueco.
                </p>
              )}
            </section>
          ) : null}

          {shop && service ? (
            <section className="mt-8" aria-labelledby="dia">
              <div className="flex items-center justify-between">
                <h2 id="dia" className={heading}>
                  Día
                </h2>
                <div className="flex items-center">
                  <button
                    type="button"
                    disabled={!canPrev}
                    onClick={() => setMonth(new Date(shownMonth.getFullYear(), shownMonth.getMonth() - 1, 1))}
                    className="grid size-10 place-items-center disabled:opacity-25"
                    aria-label="Mes anterior"
                  >
                    <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden />
                  </button>
                  <p className="label-caps w-32 text-center" aria-live="polite">
                    {formatMonth(shownMonth)}
                  </p>
                  <button
                    type="button"
                    disabled={!canNext}
                    onClick={() => setMonth(new Date(shownMonth.getFullYear(), shownMonth.getMonth() + 1, 1))}
                    className="grid size-10 place-items-center disabled:opacity-25"
                    aria-label="Mes siguiente"
                  >
                    <ChevronRight className="size-4" strokeWidth={1.5} aria-hidden />
                  </button>
                </div>
              </div>
              <div className="mt-2 border-y border-line py-2">
                <div className="grid grid-cols-7 text-center text-[11px] text-muted" aria-hidden>
                  {WEEKDAYS.map((d) => (
                    <span key={d} className="py-1">
                      {d}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
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
                        }}
                        className={`mx-auto grid size-10 place-items-center text-[13px] tabular-nums ${
                          selected ? 'bg-accent text-white' : bookable ? 'text-ink hover:bg-studio' : 'text-neutral-300'
                        }`}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted">Los días en gris están cerrados, completos o fuera de plazo.</p>
            </section>
          ) : null}

          {date ? (
            <section className="mt-8" aria-labelledby="hora">
              <h2 id="hora" className={heading}>
                Hora · {formatLong(fromDateKey(date))}
              </h2>
              {hoursLoading ? (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="h-10 shimmer" />
                  ))}
                </div>
              ) : hours?.length ? (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {hours.map((h) => (
                    <button
                      key={h}
                      type="button"
                      aria-pressed={hour === h}
                      onClick={() => setHourChoice(h)}
                      className={`h-10 border text-[13px] tabular-nums ${hour === h ? 'border-accent bg-accent text-white' : 'border-line'}`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[13px] text-muted">Ese día ya no quedan horas. Elige otro en el calendario.</p>
              )}
            </section>
          ) : null}

          {error ? (
            <div className="mt-6">
              <Notice tone="danger">{error}</Notice>
            </div>
          ) : null}
        </div>

        {/* Móvil y tablet: barra fija abajo. Ordenador: resumen fijo a la derecha. */}
        <aside className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3 lg:sticky lg:inset-auto lg:top-24 lg:border lg:p-6">
          <div className="mx-auto max-w-md">
            <p className="label-caps mb-3 hidden lg:block">Tu cita</p>
            <dl className="mb-5 hidden space-y-3 text-[13px] lg:block">
              {[
                [capitalize(brand.shop.one), shop?.name],
                ['Para', service ? service.label || service.name : null],
                ['Día', date ? formatLong(fromDateKey(date)) : null],
                ['Hora', hour],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-line pb-3">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-right">{value ?? '—'}</dd>
                </div>
              ))}
            </dl>
            <p className="label-caps mb-2 text-center text-muted lg:hidden" aria-live="polite">
              {date && hour ? `${formatShort(fromDateKey(date))} · ${hour}` : 'Elige día y hora'}
            </p>
            <Button block loading={busy} disabled={!shop || !service || !date || !hour} onClick={() => void confirm()}>
              {editing ? 'Guardar el cambio' : 'Confirmar cita'}
            </Button>
          </div>
        </aside>
      </main>
    </>
  );
}

function BookedView({ booked, edited }: { booked: Booked; edited: boolean }) {
  const { data: favorites } = useLoad(listFavorites);
  const day = fromDateKey(booked.date);
  const [h, m] = booked.hour.split(':').map(Number);
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h ?? 10, m ?? 0);
  const address = `${booked.shop.address}, ${booked.shop.city}`;

  const addToCalendar = () =>
    saveCalendarFile({
      start,
      title: `Cita en ${booked.shop.name}`,
      location: address,
      description: `${booked.service.label || booked.service.name}. Teléfono ${brand.shop.of}: ${booked.shop.phone}`,
    });

  return (
    <>
      <TopBar title={edited ? 'Cita cambiada' : 'Cita reservada'} />
      <main className="mx-auto max-w-md px-4 pb-12 pt-8">
        <Check className="size-6" strokeWidth={1.25} aria-hidden />
        <h1 className="mt-4 text-[20px] font-light uppercase leading-tight tracking-[0.06em]">
          {edited ? 'Hemos cambiado tu cita' : 'Tu cita está reservada'}
        </h1>
        <p className="mt-2 text-[13px] text-muted">Te enviaremos la confirmación por WhatsApp.</p>

        <dl className="mt-6 divide-y divide-line border-y border-line">
          <div className="py-4">
            <dt className="label-caps text-muted">Cuándo</dt>
            <dd className="mt-1 text-[15px]">
              {formatLong(day)}, a las {booked.hour}
            </dd>
          </div>
          <div className="py-4">
            <dt className="label-caps text-muted">Dónde</dt>
            <dd className="mt-1 text-[15px]">{booked.shop.name}</dd>
            <dd className="text-[13px] text-muted">{address}</dd>
          </div>
          <div className="py-4">
            <dt className="label-caps text-muted">Para</dt>
            <dd className="mt-1 text-[15px]">{booked.service.label || booked.service.name}</dd>
          </div>
        </dl>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={addToCalendar} className="!px-3">
            <CalendarPlus className="size-4" strokeWidth={1.5} aria-hidden />
            Al calendario
          </Button>
          <a
            href={mapsUrl(address)}
            target="_blank"
            rel="noopener"
            className="inline-flex h-12 items-center justify-center gap-2 border border-ink px-3 text-[12px] font-medium uppercase tracking-[0.12em]"
          >
            <MapPin className="size-4" strokeWidth={1.5} aria-hidden />
            Cómo llegar
          </a>
        </div>

        {favorites?.length ? (
          <div className="mt-8">
            <Eyebrow>Tus favoritos</Eyebrow>
            <p className="mt-2 text-[13px] leading-relaxed">
              Enséñaselos a tu asesora al llegar para que te saque estos modelos:{' '}
              {favorites.map((f) => f.dressName).join(', ')}.
            </p>
            <Link href="/favoritos" className="label-caps mt-3 inline-block underline underline-offset-4">
              Ver favoritos
            </Link>
          </div>
        ) : null}

        <div className="mt-8 space-y-2">
          <LinkButton href="/citas" block>
            Ver mis citas
          </LinkButton>
          <LinkButton href="/probador" block variant="secondary">
            Seguir probando
          </LinkButton>
        </div>
        <p className="mt-6 text-center text-[11px] text-muted">
          ¿Necesitas ayuda? Llama a {booked.shop.name}: {booked.shop.phone}. {brand.name}.
        </p>
      </main>
    </>
  );
}
