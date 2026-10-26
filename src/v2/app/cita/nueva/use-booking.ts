import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  bookAppointment,
  getOpeningDate,
  getProfile,
  listAppointments,
  listBookingServices,
  listBookingShops,
  listClosedDays,
  listHours,
  updateAppointment,
} from '@v2/lib/api';
import { addDays, fromDateKey, startOfToday, toDateKey } from '@v2/lib/dates';
import type { BookingService, BookingShop } from '@v2/lib/types';
import { useLoad } from '@v2/lib/use-load';

/** Servicio que encaja con lo que se estaba probando (vestido o traje). */
const matchesCategory = (s: BookingService, category: string | null) => {
  const text = `${s.name} ${s.label}`.toLowerCase();
  if (category === 'groom') return /novio|traje/.test(text);
  if (category === 'bride') return /novia|vestido/.test(text);
  return false;
};

export interface Booked {
  shop: BookingShop;
  service: BookingService;
  date: string;
  hour: string;
}

/**
 * Lo que hace la reserva: tienda, servicio, días cerrados o completos, horas
 * libres, cambiar una cita (`?edit=`) y confirmarla. Lo usan la reserva de
 * Atelier y la de Sedka, cada una con su aspecto.
 */
export function useBooking() {
  const params = useSearchParams();
  const editId = params.get('edit');
  const category = params.get('c');

  const { data: base, error: baseError } = useLoad(
    () => Promise.all([listBookingShops(), getProfile(), editId ? listAppointments() : null]),
    editId ?? '',
  );
  const [shops, profile, appointments] = base ?? [[], null, null];
  const editing = appointments?.upcoming.find((a) => String(a.id) === editId) ?? null;
  const editingStart = editing ? new Date(editing.date) : null;

  // Atelier: el que elija la clienta; si no, el de la cita que modifica, el de su perfil o el único que hay.
  const [shopChoice, setShopChoice] = useState<number | null>(null);
  const [changingShop, setChangingShop] = useState(false);
  const fallbackShop =
    (editing && shops.find((s) => s.id === editing.shopId || s.name === editing.location.name)) ??
    shops.find((s) => s.id === profile?.shopId) ??
    (shops.length === 1 ? shops[0] : undefined);
  const shop = shops.find((s) => s.id === shopChoice) ?? fallbackShop ?? null;
  const shopKey = String(shop?.id ?? '');

  // Los servicios dependen solo del atelier: al cambiarlo se recargan (en la V1 se vaciaban por error).
  const { data: services, loading: servicesLoading } = useLoad(() => (shop ? listBookingServices(shop.id) : Promise.resolve([])), shopKey);
  const [serviceChoice, setServiceChoice] = useState<number | null>(null);
  const service =
    services?.find((s) => s.id === serviceChoice) ??
    (editing ? services?.find((s) => s.id === editing.serviceId) : undefined) ??
    services?.find((s) => matchesCategory(s, category)) ??
    (services?.length === 1 ? services[0] : undefined) ??
    null;
  const serviceKey = `${shopKey}|${service?.id ?? ''}`;

  const { data: closed } = useLoad(
    () => (shop && service ? listClosedDays(shop.id, service.id) : Promise.resolve(new Set<string>())),
    serviceKey,
  );
  const { data: opening } = useLoad(() => (shop ? getOpeningDate(shop.id) : Promise.resolve(null)), shopKey);

  const today = startOfToday();
  const earliestByService = addDays(today, Math.max(1, service?.minDays ?? 1));
  const openingDay = opening ? fromDateKey(opening) : null;
  const minDay = openingDay && openingDay > earliestByService ? openingDay : earliestByService;
  const maxDay = addDays(today, Math.max(1, service?.maxDays ?? 30));

  const [month, setMonth] = useState<Date | null>(null);
  const shownMonth = month ?? new Date(minDay.getFullYear(), minDay.getMonth(), 1);
  const canPrev = shownMonth > new Date(minDay.getFullYear(), minDay.getMonth(), 1);
  const canNext = new Date(shownMonth.getFullYear(), shownMonth.getMonth() + 1, 1) <= maxDay;

  // Días que ya se comprobó que no tienen horas: se desactivan en el calendario.
  const [fullDays, setFullDays] = useState<Set<string>>(new Set());
  const isBookable = (d: Date) => d >= minDay && d <= maxDay && !closed?.has(toDateKey(d)) && !fullDays.has(`${serviceKey}|${toDateKey(d)}`);

  const [dateChoice, setDateChoice] = useState<string | null>(null);
  const candidate = dateChoice ?? (editingStart ? toDateKey(editingStart) : null);
  const date = candidate && isBookable(fromDateKey(candidate)) ? candidate : null;

  const { data: hours, loading: hoursLoading } = useLoad(async () => {
    if (!shop || !service || !date) return null;
    const free = await listHours({ shopId: shop.id, serviceId: service.id, date });
    if (!free.length) setFullDays((s) => new Set(s).add(`${serviceKey}|${date}`));
    return free;
  }, `${serviceKey}|${date ?? ''}`);

  const [hourChoice, setHourChoice] = useState<string | null>(null);
  const editingHour = editingStart ? `${String(editingStart.getHours()).padStart(2, '0')}:${String(editingStart.getMinutes()).padStart(2, '0')}` : null;
  const hour = [hourChoice, editingHour].find((h) => h && hours?.includes(h)) ?? null;

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState<Booked | null>(null);

  const confirm = async () => {
    if (!shop || !service || !date || !hour) return;
    setBusy(true);
    setError(null);
    try {
      const input = { shopId: shop.id, serviceId: service.id, date, hour };
      if (editing) await updateAppointment({ ...input, appointmentId: editing.id });
      else await bookAppointment(input);
      setBooked({ shop, service, date, hour });
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reservar la cita. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return {
    editing,
    category,
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
  };
}
