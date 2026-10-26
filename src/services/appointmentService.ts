/**
 * Appointment Service (Phase 1)
 *
 * Handles appointment operations:
 * - Get user appointments
 * - Booking (mismo flujo que el plugin web Outlet: servicios por tienda in_web,
 *   closed-days + opening-date + availability por shop/service)
 */

import { apiClient } from './apiClient.js';
import { envConfig } from '../config/envConfig.js';
import type {
  AppointmentsResponse,
  BookingShop,
  BookingService,
  BookingSlot,
  BookAppointmentPayload,
} from '../types/index.js';

/**
 * Get all appointments for current user (Phase 1)
 * @returns Promise with upcoming and past appointments
 */
export const getUserAppointments = async (): Promise<AppointmentsResponse> => {
  const response = await apiClient.get(envConfig.endpoints.appointment.getUserAppointments);
  return response as unknown as AppointmentsResponse;
};

// ============================================================
// Booking — reserva de cita desde el Probador
// ============================================================

/** Desenvuelve la respuesta `{ success, data }` típica del backend Laravel. */
const unwrap = <T,>(res: unknown): T => {
  if (res && typeof res === 'object' && 'data' in (res as object)) {
    return (res as { data: T }).data;
  }
  return res as T;
};

/**
 * Rutas de reserva de Atelier. El probador V2 pasa las de su marca
 * (`/probador/sedka/booking`…) como último parámetro de cada función.
 */
const BOOKING = '/probador/booking';

/** GET /probador/booking/shops */
export const listBookingShops = async (base = BOOKING): Promise<BookingShop[]> => {
  const res = await apiClient.get(`${base}/shops`);
  return unwrap<BookingShop[]>(res) ?? [];
};

/**
 * GET /probador/booking/services?shopId=
 * Igual que el plugin: catálogo online de ESA tienda (Córdoba ≠ Madrid).
 */
export const listBookingServices = async (shopId: number, base = BOOKING): Promise<BookingService[]> => {
  const res = await apiClient.get(`${base}/services`, {
    params: { shopId },
  });
  return unwrap<BookingService[]>(res) ?? [];
};

export interface BookingOpeningDate {
  openingDate: string | null;
  suggestedStartDate: string | null;
}

/** POST /probador/booking/opening-date — como key-shop-oppening-date del plugin. */
export const getBookingOpeningDate = async (shopId: number, base = BOOKING): Promise<BookingOpeningDate> => {
  const res = (await apiClient.post(`${base}/opening-date`, { shopId })) as unknown as {
    opening_date?: string;
    suggested_calendar_start_date?: string;
  };

  return {
    openingDate: res?.opening_date ?? null,
    suggestedStartDate: res?.suggested_calendar_start_date ?? res?.opening_date ?? null,
  };
};

/**
 * Días cerrados del atelier (+ días sin horas bookables).
 * El plugin pasa también service_id.
 */
export const listClosedDays = async (shopId: number, serviceId?: number, base = BOOKING): Promise<string[]> => {
  const body: { shopId: number; serviceId?: number } = { shopId };
  if (serviceId) {
    body.serviceId = serviceId;
  }

  const res = (await apiClient.post(`${base}/closed-days`, body)) as unknown as {
    closed_days?: Array<string | { year?: number; month?: number; day?: number }>;
    datestring?: string[];
  };

  if (Array.isArray(res?.datestring) && res.datestring.length > 0) {
    return res.datestring as string[];
  }

  const closed = res?.closed_days ?? [];
  return closed
    .map((d) => {
      if (typeof d === 'string') {
        const parts = d.split(',');
        if (parts.length === 3) {
          const [y, m, day] = parts;
          return `${y}-${m!.padStart(2, '0')}-${day!.padStart(2, '0')}`;
        }
        return d;
      }
      return null;
    })
    .filter((s): s is string => !!s);
};

/**
 * Slots disponibles para un (shop, service, fecha).
 */
export const listAvailability = async (
  params: {
    shopId: number;
    serviceId: number;
    date: string; // YYYY-MM-DD
  },
  base = BOOKING,
): Promise<{ closed: boolean; slots: BookingSlot[] }> => {
  const res = (await apiClient.post(`${base}/availability`, params)) as unknown as {
    closed?: 'true' | 'false' | boolean;
    available_hours?: Record<string, string | number> | unknown;
    success?: Record<string, { available_hours?: Record<string, string | number> }>;
  };

  const closedFlag = res?.closed;
  if (closedFlag === true || closedFlag === 'true') {
    return { closed: true, slots: [] };
  }

  const serviceHours =
    res?.success?.[String(params.serviceId)]?.available_hours ??
    (res?.available_hours as Record<string, string | number> | undefined);

  if (!serviceHours || typeof serviceHours !== 'object' || Array.isArray(serviceHours)) {
    return { closed: false, slots: [] };
  }

  const slots: BookingSlot[] = Object.entries(serviceHours)
    .map(([hour, raw]) => {
      const free = typeof raw === 'string' ? parseInt(raw, 10) : raw;
      return { hour, available: !Number.isNaN(free) && (free as number) > 0 };
    })
    .filter((s) => s.available)
    .sort((a, b) => a.hour.localeCompare(b.hour));

  return { closed: false, slots };
};

/** POST /probador/booking/book — crea la cita real en el CRM. */
export const bookAppointment = async (payload: BookAppointmentPayload, base = BOOKING): Promise<unknown> => {
  return apiClient.post(`${base}/book`, payload);
};

export const updateAppointmentBooking = async (
  payload: BookAppointmentPayload & { appointmentId: number },
  base = BOOKING,
): Promise<unknown> => {
  return apiClient.post(`${base}/update`, payload);
};

export const cancelAppointmentBooking = async (appointmentId: number, base = BOOKING): Promise<unknown> => {
  return apiClient.post(`${base}/cancel`, { appointmentId });
};
