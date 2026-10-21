/**
 * BookAppointmentPage
 *
 * Wizard de reserva de cita para clientes autenticados del Probador Virtual.
 * Como el cliente ya está logueado, NO se piden datos de contacto: solo
 * atelier, servicio (Vestido de Novia / Traje de Novio), fecha y hora.
 *
 * Flujo (mismo criterio que el plugin web Outlet):
 *  1. Tienda — Madrid / Córdoba.
 *  2. Servicio — solo los de esa tienda con in_web (Córdoba: novia).
 *  3. Fecha — apertura tienda + min/max del servicio + cerrados/sin horas.
 *  4. Hora — slots reales del CRM.
 *  5. Confirmar — POST al CRM.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Header } from '../components/layout/Header.js';
import { Button } from '../components/shared/Button.js';
import {
  listBookingShops,
  listBookingServices,
  listClosedDays,
  listAvailability,
  getBookingOpeningDate,
  bookAppointment,
  updateAppointmentBooking,
  getUserAppointments,
} from '../services/appointmentService.js';
import { routes } from '../constants/routes.js';
import type { BookingShop, BookingService, BookingSlot } from '../types/index.js';

type WizardStep = 'shop' | 'service' | 'date' | 'hour' | 'confirm';

/** Formatea Date → "YYYY-MM-DD" sin tocar la zona horaria del cliente. */
const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/** Construye la matriz [semanas][7] del mes indicado, comenzando lunes. */
const buildMonthMatrix = (year: number, month: number /* 0..11 */): Array<Array<Date | null>> => {
  const firstOfMonth = new Date(year, month, 1);
  // getDay(): 0=domingo, 1=lunes...; queremos lunes=0
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<Date | null> = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: Array<Array<Date | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
};

export const BookAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const preferredCategory = searchParams.get('category') === 'groom'
    ? 'groom'
    : searchParams.get('category') === 'bride'
      ? 'bride'
      : null;
  const shouldAutoAdvance = useRef(!searchParams.get('edit') && preferredCategory !== null);

  // Si llega `?edit=<id>` el wizard funciona en modo "modificar cita"
  // existente — precarga shop/service y hace PUT en vez de POST.
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const [step, setStep] = useState<WizardStep>('shop');

  // Selecciones del wizard
  const [shops, setShops] = useState<BookingShop[]>([]);
  const [services, setServices] = useState<BookingService[]>([]);
  const [selectedShop, setSelectedShop] = useState<BookingShop | null>(null);
  const [selectedService, setSelectedService] = useState<BookingService | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  // Catálogos cargados bajo demanda
  const [closedDays, setClosedDays] = useState<Set<string>>(new Set());
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [dayIsClosed, setDayIsClosed] = useState<boolean>(false);

  // Estados de carga/error por sección
  const [loadingCatalog, setLoadingCatalog] = useState<boolean>(true);
  const [loadingServices, setLoadingServices] = useState<boolean>(false);
  const [loadingClosed, setLoadingClosed] = useState<boolean>(false);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [suggestedStartDate, setSuggestedStartDate] = useState<string | null>(null);
  const [, setPendingEditAppointment] = useState<any | null>(null);

  // Carga inicial: solo tiendas (+ cita si editamos). Los servicios van por tienda.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listBookingShops(),
      isEditing ? getUserAppointments() : Promise.resolve(null),
    ])
      .then(([s, appointmentsRaw]) => {
        if (cancelled) return;
        setShops(s);

        if (!isEditing) {
          const profileShop = user?.shopId
            ? s.find((shop) => shop.id === user.shopId) ?? null
            : null;
          const shop = profileShop ?? (s.length === 1 ? s[0] : null);
          if (shop) {
            setSelectedShop(shop);
            setStep('service');
            return;
          }
        }

        if (!isEditing || !appointmentsRaw) return;

        const raw = appointmentsRaw as { data?: unknown } | unknown;
        const data: { today?: unknown[]; upcoming?: unknown[] } =
          raw && typeof raw === 'object' && 'data' in (raw as object)
            ? ((raw as { data: { today?: unknown[]; upcoming?: unknown[] } }).data ?? {})
            : (raw as { today?: unknown[]; upcoming?: unknown[] } ?? {});

        const all: any[] = [
          ...(data.today ?? []),
          ...(data.upcoming ?? []),
        ];
        const apt: any = all.find((a) => String(a?.id) === String(editId));
        if (!apt) {
          setError('No se encontró la cita a modificar.');
          return;
        }

        const matchedShop = s.find((shop) => shop.name === apt?.location?.name) ?? null;
        if (matchedShop) setSelectedShop(matchedShop);
        setPendingEditAppointment(apt);

        if (apt?.date) {
          const dt = new Date(apt.date);
          if (!isNaN(dt.getTime())) {
            const y = dt.getFullYear();
            const m = String(dt.getMonth() + 1).padStart(2, '0');
            const day = String(dt.getDate()).padStart(2, '0');
            setSelectedDate(`${y}-${m}-${day}`);
            const hh = String(dt.getHours()).padStart(2, '0');
            const mm = String(dt.getMinutes()).padStart(2, '0');
            setSelectedHour(`${hh}:${mm}`);
            setCalendarMonth({ year: y, month: dt.getMonth() });
          }
        }
        if (matchedShop) setStep('service');
      })
      .catch((err) => {
        console.error('[BookAppointment] Error cargando catálogos:', err);
        if (!cancelled) setError('No se pudieron cargar las tiendas. Recarga la página.');
      })
      .finally(() => {
        if (!cancelled) setLoadingCatalog(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isEditing, editId]);

  // Servicios online de la tienda elegida (como get_services del plugin).
  useEffect(() => {
    if (!selectedShop) return;
    let cancelled = false;
    setLoadingServices(true);
    setError(null);
    listBookingServices(selectedShop.id)
      .then((sv) => {
        if (cancelled) return;
        setServices(sv);
        if (shouldAutoAdvance.current && preferredCategory) {
          const textOf = (service: BookingService) => `${service.name} ${service.label}`.toLowerCase();
          const matched = preferredCategory === 'groom'
            ? sv.find((service) => /novio|traje/.test(textOf(service)))
            : sv.find((service) => /novia|vestido/.test(textOf(service)));
          const chosen = matched ?? sv[0];
          if (chosen) {
            setSelectedService(chosen);
            setStep('date');
            shouldAutoAdvance.current = false;
            return;
          }
        }
        setPendingEditAppointment((apt: any | null) => {
          if (!apt) {
            setSelectedService((prev) =>
              prev && sv.some((x) => x.id === prev.id) ? prev : null,
            );
            return null;
          }
          const matchedService =
            (typeof apt?.service_id === 'number'
              ? sv.find((sx) => sx.id === apt.service_id)
              : null) ??
            sv[0] ??
            null;
          if (matchedService) setSelectedService(matchedService);
          return null;
        });
      })
      .catch((err) => {
        console.error('[BookAppointment] Error cargando servicios:', err);
        if (!cancelled) {
          setServices([]);
          setError('No se pudieron cargar los servicios de esta tienda.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingServices(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedShop?.id]);

  // Calendario: closed-days + opening-date (plugin AtcrmCalendar).
  useEffect(() => {
    if (step !== 'date' || !selectedShop || !selectedService) return;
    let cancelled = false;
    setLoadingClosed(true);
    Promise.all([
      listClosedDays(selectedShop.id, selectedService.id),
      getBookingOpeningDate(selectedShop.id),
    ])
      .then(([days, opening]) => {
        if (cancelled) return;
        setClosedDays(new Set(days));
        setSuggestedStartDate(opening.suggestedStartDate);
        if (opening.suggestedStartDate) {
          const [y, m] = opening.suggestedStartDate.split('-').map(Number);
          if (y && m) setCalendarMonth({ year: y, month: m - 1 });
        }
      })
      .catch((err) => {
        console.error('[BookAppointment] Error cargando calendario:', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingClosed(false);
      });
    return () => {
      cancelled = true;
    };
  }, [step, selectedShop, selectedService]);

  // Cuando el cliente elige fecha, pedimos slots
  useEffect(() => {
    if (step !== 'hour' || !selectedShop || !selectedService || !selectedDate) return;
    let cancelled = false;
    setLoadingSlots(true);
    setError(null);
    listAvailability({
      shopId: selectedShop.id,
      serviceId: selectedService.id,
      date: selectedDate,
    })
      .then((res) => {
        if (cancelled) return;
        setDayIsClosed(res.closed);
        setSlots(res.slots);
      })
      .catch((err) => {
        console.error('[BookAppointment] Error cargando slots:', err);
        if (!cancelled) setError('No se pudo cargar la disponibilidad.');
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [step, selectedShop, selectedService, selectedDate]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Ventana: antelación del servicio + apertura de tienda (plugin).
  const minBookableDate = useMemo(() => {
    const minDays = Math.max(1, selectedService?.minDays ?? 1);
    const d = new Date(today);
    d.setDate(d.getDate() + minDays);
    if (suggestedStartDate) {
      const [y, m, day] = suggestedStartDate.split('-').map(Number);
      if (y && m && day) {
        const opening = new Date(y, m - 1, day);
        opening.setHours(0, 0, 0, 0);
        if (opening > d) return opening;
      }
    }
    return d;
  }, [today, selectedService, suggestedStartDate]);
  const maxBookableDate = useMemo(() => {
    const maxDays = Math.max(1, selectedService?.maxDays ?? 30);
    const d = new Date(today);
    d.setDate(d.getDate() + maxDays);
    return d;
  }, [today, selectedService]);

  // Mes mostrado en el calendario (mes "actual" del navegador)
  const [calendarMonth, setCalendarMonth] = useState<{ year: number; month: number }>(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const prevMonthDisabled =
    calendarMonth.year < minBookableDate.getFullYear() ||
    (calendarMonth.year === minBookableDate.getFullYear() &&
      calendarMonth.month <= minBookableDate.getMonth());
  const nextMonthDisabled =
    calendarMonth.year > maxBookableDate.getFullYear() ||
    (calendarMonth.year === maxBookableDate.getFullYear() &&
      calendarMonth.month >= maxBookableDate.getMonth());

  const monthMatrix = useMemo(
    () => buildMonthMatrix(calendarMonth.year, calendarMonth.month),
    [calendarMonth],
  );

  const goBack = (): void => {
    setError(null);
    // Si solo hay una tienda (Outlet), el paso "shop" se omite y desde
    // "service" no se puede ir más atrás: la marca Outlet siempre reserva
    // en Outlet Madrid (sin selector).
    const singleShop = shops.length === 1;
    if (step === 'service' && !singleShop) setStep('shop');
    else if (step === 'date') setStep('service');
    else if (step === 'hour') setStep('date');
    else if (step === 'confirm') setStep('hour');
  };

  const handleConfirm = async (): Promise<void> => {
    if (!selectedShop || !selectedService || !selectedDate || !selectedHour) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        shopId: selectedShop.id,
        serviceId: selectedService.id,
        date: selectedDate,
        hour: selectedHour,
      };

      if (isEditing && editId) {
        await updateAppointmentBooking({ ...payload, appointmentId: Number(editId) });
        setSuccessMsg('Cita modificada correctamente.');
      } else {
        await bookAppointment(payload);
        setSuccessMsg('¡Tu cita ha sido reservada! Te enviaremos los detalles por WhatsApp.');
      }
      setTimeout(() => navigate(routes.APPOINTMENTS), 1500);
    } catch (err: any) {
      console.error('[BookAppointment] Error guardando cita:', err);
      const apiMsg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        null;
      setError(apiMsg ?? 'No se pudo guardar la cita. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // Render auxiliar — stepper
  // ============================================================
  // Cuando solo hay una tienda (Outlet) ocultamos el paso "shop" del progress
  // bar para que el cliente no vea un paso fantasma.
  const wizardSteps: WizardStep[] = shops.length === 1
    ? ['service', 'date', 'hour', 'confirm']
    : ['shop', 'service', 'date', 'hour', 'confirm'];
  const stepIndex = wizardSteps.indexOf(step);
  const totalSteps = wizardSteps.length;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 px-5 md:px-10 py-10 md:py-14">
        <div className="max-w-2xl mx-auto">
          {/* Cabecera estilo Outlet: número, etiqueta, título serif. */}
          <div className="mb-8 md:mb-10">
            {step !== 'shop' && (
              <button
                type="button"
                onClick={goBack}
                disabled={submitting}
                className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] font-bold uppercase text-black/60 hover:text-black transition-colors mb-6"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
                <span>Atrás</span>
              </button>
            )}

            <p className="font-mono text-xs tracking-widest text-black/40 mb-3">
              {String(stepIndex + 1).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
            </p>

            {/* Progress bar lineal, sin pills */}
            <div className="flex gap-1 mb-5" aria-label={`Paso ${stepIndex + 1} de ${totalSteps}`}>
              {Array.from({ length: totalSteps }).map((_, i) => (
                <span
                  key={i}
                  className={`h-[2px] flex-1 ${i <= stepIndex ? 'bg-black' : 'bg-black/15'}`}
                />
              ))}
            </div>

            <p className="tracking-[0.3em] text-[10px] md:text-xs text-black/50 mb-2">RESERVA</p>
            <h1 className="font-serif font-black text-black text-4xl md:text-6xl leading-none">
              {isEditing ? 'Modificar' : 'Reservar'}
            </h1>
          </div>

          {error && (
            <div className="mb-6 border border-black/30 px-4 py-3 bg-neutral-50">
              <p className="text-black text-sm text-center font-mono">{error}</p>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 border border-black px-4 py-3 bg-neutral-50">
              <p className="text-black text-sm text-center font-mono">{successMsg}</p>
            </div>
          )}

          {loadingCatalog ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black" />
            </div>
          ) : (
            <>
              {/* STEP 1 — Atelier */}
              {step === 'shop' && (
                <section>
                  <h2 className="text-lg font-semibold text-[#000000] mb-4">
                    Elige el atelier
                  </h2>
                  <div className="grid gap-3">
                    {shops.map((shop) => {
                      const selected = selectedShop?.id === shop.id;
                      return (
                        <button
                          key={shop.id}
                          type="button"
                          onClick={() => setSelectedShop(shop)}
                          className={`text-left p-4 border transition-colors ${
                            selected
                              ? 'border-black bg-black text-white'
                              : 'border-gray-200 bg-white hover:border-black'
                          }`}
                        >
                          <p className="font-semibold">{shop.name}</p>
                          <p className={`text-sm ${selected ? 'text-white/80' : 'text-gray-600'}`}>
                            {shop.address} · {shop.city}
                          </p>
                          <p className={`text-xs mt-1 ${selected ? 'text-white/70' : 'text-gray-500'}`}>
                            {shop.phone}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      fullWidth
                      disabled={!selectedShop}
                      onClick={() => {
                        setSelectedService(null);
                        setSelectedDate(null);
                        setSelectedHour(null);
                        setServices([]);
                        setStep('service');
                      }}
                    >
                      Continuar
                    </Button>
                  </div>
                </section>
              )}

              {/* STEP 2 — Servicio */}
              {step === 'service' && (
                <section>
                  <h2 className="text-lg font-semibold text-[#000000] mb-4">
                    ¿Qué quieres probarte?
                  </h2>
                  {loadingServices ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black" />
                    </div>
                  ) : services.length === 0 ? (
                    <p className="text-sm text-black/60 text-center py-8">
                      No hay servicios disponibles en esta tienda en este momento.
                    </p>
                  ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {services.map((sv) => {
                      const selected = selectedService?.id === sv.id;
                      return (
                        <button
                          key={sv.id}
                          type="button"
                          onClick={() => setSelectedService(sv)}
                          className={`text-center p-6 border transition-colors ${
                            selected
                              ? 'border-black bg-black text-white'
                              : 'border-gray-200 bg-white hover:border-black'
                          }`}
                        >
                          <p className="font-semibold text-base">{sv.label}</p>
                        </button>
                      );
                    })}
                  </div>
                  )}
                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      fullWidth
                      disabled={!selectedService || loadingServices}
                      onClick={() => {
                        setSelectedDate(null);
                        setSelectedHour(null);
                        setStep('date');
                      }}
                    >
                      Continuar
                    </Button>
                  </div>
                </section>
              )}

              {/* STEP 3 — Fecha */}
              {step === 'date' && (
                <section>
                  <h2 className="text-lg font-semibold text-[#000000] mb-2">Elige la fecha</h2>
                  {selectedShop && selectedService && (
                    <p className="text-sm text-gray-600 mb-4">
                      {selectedShop.name} · {selectedService.label || selectedService.name}. Puedes volver atrás si quieres cambiarlo.
                    </p>
                  )}

                  {/* Navegación de mes */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      disabled={prevMonthDisabled}
                      onClick={() =>
                        setCalendarMonth((m) => {
                          const date = new Date(m.year, m.month - 1, 1);
                          return { year: date.getFullYear(), month: date.getMonth() };
                        })
                      }
                      className="px-3 py-1 rounded-md text-sm hover:bg-black/5 disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      ‹ Anterior
                    </button>
                    <p className="font-semibold">
                      {MONTH_NAMES[calendarMonth.month]} {calendarMonth.year}
                    </p>
                    <button
                      type="button"
                      disabled={nextMonthDisabled}
                      onClick={() =>
                        setCalendarMonth((m) => {
                          const date = new Date(m.year, m.month + 1, 1);
                          return { year: date.getFullYear(), month: date.getMonth() };
                        })
                      }
                      className="px-3 py-1 rounded-md text-sm hover:bg-black/5 disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      Siguiente ›
                    </button>
                  </div>

                  {loadingClosed && (
                    <p className="text-xs text-gray-500 text-center mb-2">Cargando días disponibles…</p>
                  )}

                  {/* Calendario */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
                    {WEEKDAY_LABELS.map((d) => (
                      <div key={d} className="py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {monthMatrix.flat().map((d, i) => {
                      if (!d) return <div key={i} className="h-10" />;
                      const key = toDateKey(d);
                      const beforeMin = d < minBookableDate;
                      const afterMax = d > maxBookableDate;
                      const isClosed = closedDays.has(key);
                      const disabled = beforeMin || afterMax || isClosed;
                      const selected = selectedDate === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={disabled}
                          onClick={() => setSelectedDate(key)}
                          className={`h-10 rounded-md text-sm transition-colors ${
                            selected
                              ? 'bg-black text-white'
                              : disabled
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'hover:bg-black/5'
                          }`}
                        >
                          {d.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      fullWidth
                      disabled={!selectedDate}
                      onClick={() => setStep('hour')}
                    >
                      Continuar
                    </Button>
                  </div>
                </section>
              )}

              {/* STEP 4 — Hora */}
              {step === 'hour' && (
                <section>
                  <h2 className="text-lg font-semibold text-[#000000] mb-4">Elige la hora</h2>
                  {loadingSlots ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
                    </div>
                  ) : dayIsClosed ? (
                    <p className="text-sm text-center text-gray-500 py-6">
                      El atelier está cerrado este día. Elige otra fecha.
                    </p>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-center text-gray-500 py-6">
                      No hay horas disponibles para esta fecha. Prueba con otra.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {slots.map((s) => {
                        const selected = selectedHour === s.hour;
                        return (
                          <button
                            key={s.hour}
                            type="button"
                            disabled={!s.available}
                            onClick={() => setSelectedHour(s.hour)}
                            className={`py-2 rounded-md text-sm border transition-colors ${
                              selected
                                ? 'bg-black text-white border-black'
                                : s.available
                                  ? 'bg-white text-black border-gray-200 hover:border-black'
                                  : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                            }`}
                          >
                            {s.hour}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      fullWidth
                      disabled={!selectedHour}
                      onClick={() => setStep('confirm')}
                    >
                      Continuar
                    </Button>
                  </div>
                </section>
              )}

              {/* STEP 5 — Confirmar */}
              {step === 'confirm' && selectedShop && selectedService && selectedDate && selectedHour && (
                <section>
                  <h2 className="text-lg font-semibold text-[#000000] mb-4">Confirma tu cita</h2>
                  <div className="border border-black/15 p-5 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Atelier</span>
                      <span className="text-sm font-medium">{selectedShop.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Servicio</span>
                      <span className="text-sm font-medium">{selectedService.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Fecha</span>
                      <span className="text-sm font-medium">
                        {new Date(selectedDate).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Hora</span>
                      <span className="text-sm font-medium">{selectedHour}</span>
                    </div>
                    <div className="pt-3 mt-3 border-t border-gray-100 text-xs text-gray-500">
                      Te confirmaremos los detalles por WhatsApp en cuanto el atelier reciba tu reserva.
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      fullWidth
                      disabled={submitting}
                      loading={submitting}
                      onClick={handleConfirm}
                    >
                      {isEditing ? 'Guardar cambios' : 'Confirmar reserva'}
                    </Button>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
