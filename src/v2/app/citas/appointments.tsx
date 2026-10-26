import { useState } from 'react';
import Link from 'next/link';
import { CalendarPlus, MapPin } from 'lucide-react';
import { Button, LinkButton, Notice } from '@v2/components/ui';
import { cancelAppointment, listAppointments } from '@v2/lib/api';
import { formatLong, formatTime, mapsUrl, saveCalendarFile } from '@v2/lib/dates';
import type { Appointment } from '@v2/lib/types';
import { useLoad } from '@v2/lib/use-load';
import { brand } from '@v2/lib/brand';

/** Próximas citas con cambiar, cancelar, calendario y mapa; las pasadas, debajo y en pequeño. */
export function Appointments() {
  const { data, error, loading, reload, setData } = useLoad(listAppointments);
  const [cancelled, setCancelled] = useState(false);

  if (error) {
    return (
      <div className="mt-6">
        <Notice tone="danger">
          No se pudieron cargar tus citas.{' '}
          <button type="button" className="underline" onClick={() => void reload()}>
            Reintentar
          </button>
        </Notice>
      </div>
    );
  }

  if (loading || !data) return <div className="mt-6 h-48 shimmer" />;

  const { upcoming, past } = data;

  return (
    <>
      {cancelled ? (
        <div className="mt-4">
          <Notice>Hemos cancelado tu cita.</Notice>
        </div>
      ) : null}

      {upcoming.length ? (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {upcoming.map((a) => (
            <AppointmentItem
              key={a.id}
              appointment={a}
              onCancelled={() => {
                setCancelled(true);
                setData({ upcoming: upcoming.filter((x) => x.id !== a.id), past });
              }}
            />
          ))}
        </ul>
      ) : (
        <div className="py-16 text-center">
          <p className="label-caps">No tienes citas pendientes</p>
          <p className="mt-2 text-[13px] text-muted">Pruébate lo que te guste y ven a verlo en persona.</p>
        </div>
      )}

      <LinkButton href="/cita/nueva" block variant={upcoming.length ? 'secondary' : 'primary'} className="mt-6">
        {upcoming.length ? 'Pedir otra cita' : 'Pedir cita'}
      </LinkButton>

      {past.length ? (
        <section className="mt-10" aria-labelledby="pasadas">
          <h2 id="pasadas" className="label-caps text-muted">
            Anteriores
          </h2>
          <ul className="mt-2 divide-y divide-line border-y border-line">
            {past.map((a) => (
              <li key={a.id} className="py-3 text-[13px] text-muted">
                {formatLong(new Date(a.date))} · {a.location.name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function AppointmentItem({ appointment: a, onCancelled }: { appointment: Appointment; onCancelled: () => void }) {
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
      setError(err instanceof Error ? err.message : `No se pudo cancelar. Llama ${brand.shop.to}.`);
      setBusy(false);
    }
  };

  return (
    <li className="py-5">
      <p className="label-caps text-muted">{a.status || 'Cita reservada'}</p>
      <p className="mt-1 text-[17px] font-light uppercase tracking-[0.04em]">
        {formatLong(start)} · {formatTime(start)}
      </p>
      <p className="mt-2 text-[13px] font-medium uppercase tracking-[0.06em]">{a.location.name}</p>
      <p className="text-[13px] text-muted">{address}</p>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        <button
          type="button"
          onClick={() =>
            saveCalendarFile({
              start,
              title: `Cita en ${a.location.name}`,
              location: address,
              description: `Teléfono ${brand.shop.of}: ${a.location.phone}`,
            })
          }
          className="label-caps inline-flex h-8 items-center gap-1.5"
        >
          <CalendarPlus className="size-4" strokeWidth={1.5} aria-hidden />
          Al calendario
        </button>
        <a href={mapsUrl(address)} target="_blank" rel="noopener" className="label-caps inline-flex h-8 items-center gap-1.5">
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
        <div className="mt-4 bg-studio p-4" role="alertdialog" aria-labelledby={`cancel-${a.id}`}>
          <p id={`cancel-${a.id}`} className="text-[13px]">
            ¿Seguro que quieres cancelar la cita? Si solo te viene mal la hora, puedes cambiarla.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setConfirming(false)} disabled={busy}>
              No, volver
            </Button>
            <Button onClick={() => void cancel()} loading={busy}>
              Sí, cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <LinkButton href={`/cita/nueva?edit=${a.id}`} variant="secondary">
            Cambiar
          </LinkButton>
          <Button variant="secondary" onClick={() => setConfirming(true)}>
            Cancelar
          </Button>
        </div>
      )}
      <p className="mt-3 text-[11px] text-muted">
        ¿Dudas? Llama {brand.shop.to}:{' '}
        <Link href={`tel:${a.location.phone.replace(/\s/g, '')}`} className="underline underline-offset-2">
          {a.location.phone}
        </Link>
      </p>
    </li>
  );
}
