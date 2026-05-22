/**
 * Appointment Service (Phase 1)
 *
 * Handles appointment operations:
 * - Get user appointments
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

/** GET /probador/booking/shops */
export const listBookingShops = async (): Promise<BookingShop[]> => {
  const res = await apiClient.get('/probador/booking/shops');
  return unwrap<BookingShop[]>(res) ?? [];
};

/** GET /probador/booking/services */
export const listBookingServices = async (): Promise<BookingService[]> => {
  const res = await apiClient.get('/probador/booking/services');
  return unwrap<BookingService[]>(res) ?? [];
};

/**
 * Días cerrados del atelier. El backend legacy devuelve formato variado;
 * normalizamos a array de strings YYYY-MM-DD para el frontend.
 */
export const listClosedDays = async (shopId: number): Promise<string[]> => {
  const res = (await apiClient.post('/probador/booking/closed-days', { shopId })) as unknown as {
    closed_days?: Array<string | { year?: number; month?: number; day?: number }>;
    datestring?: string[];
  };

  // Preferimos `datestring` si existe (es formato "Y-m-d" directo); si no,
  // intentamos convertir el array "closed_days" (formato "Y,m,d" según el
  // controller legacy).
  if (Array.isArray(res?.datestring) && res.datestring.length > 0) {
    return res.datestring as string[];
  }

  const closed = res?.closed_days ?? [];
  return closed
    .map((d) => {
      if (typeof d === 'string') {
        // viene como "Y,m,d" → "Y-m-d"
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
 *
 * `findAppointments` legacy devuelve `available_hours` como un OBJETO con
 * shape `{ "HH:MM": <plazas-libres> }` donde plazas-libres puede ser
 * string o number. También expone el mismo objeto en
 * `success[serviceId].available_hours`. `closed` viene como string
 * "true"/"false". Aquí normalizamos a un array ordenado de {hour, available}.
 */
export const listAvailability = async (params: {
  shopId: number;
  serviceId: number;
  date: string; // YYYY-MM-DD
}): Promise<{ closed: boolean; slots: BookingSlot[] }> => {
  const res = (await apiClient.post('/probador/booking/availability', params)) as unknown as {
    closed?: 'true' | 'false' | boolean;
    available_hours?: Record<string, string | number> | unknown;
    success?: Record<string, { available_hours?: Record<string, string | number> }>;
  };

  const closedFlag = res?.closed;
  if (closedFlag === true || closedFlag === 'true') {
    return { closed: true, slots: [] };
  }

  // Preferimos el available_hours del service específico; el top-level es
  // un fallback porque para 1 sólo servicio coincide.
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
    // Solo mostramos slots con plazas; ordenadas por hora.
    .filter((s) => s.available)
    .sort((a, b) => a.hour.localeCompare(b.hour));

  return { closed: false, slots };
};

/** POST /probador/booking/book — crea la cita real en el CRM. */
export const bookAppointment = async (payload: BookAppointmentPayload): Promise<unknown> => {
  return apiClient.post('/probador/booking/book', payload);
};

/**
 * POST /probador/booking/update — modifica fecha/hora/shop/servicio de una
 * cita existente. El backend valida que la cita pertenezca al cliente del JWT.
 */
export const updateAppointmentBooking = async (
  payload: BookAppointmentPayload & { appointmentId: number },
): Promise<unknown> => {
  return apiClient.post('/probador/booking/update', payload);
};

/**
 * POST /probador/booking/cancel — cancela una cita propia. Marca el state
 * custom 149 ("Cancelado") en el CRM sin borrar la fila.
 */
export const cancelAppointmentBooking = async (appointmentId: number): Promise<unknown> => {
  return apiClient.post('/probador/booking/cancel', { appointmentId });
};
