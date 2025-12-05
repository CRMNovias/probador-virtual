/**
 * Appointment-related types
 * 
 * Interfaces for appointment booking and management
 */

/**
 * Appointment status (now comes as string from backend)
 */
export type AppointmentStatus = string;

/**
 * Appointment location information
 */
export interface AppointmentLocation {
  name: string;
  address: string;
  city: string;
  phone: string;
}

/**
 * Appointment information
 */
export interface Appointment {
  id: number;
  userId: number;
  date: string; // ISO 8601 date-time string (e.g., "2026-02-13T12:00:00.000000Z")
  status: AppointmentStatus; // e.g., "Cita Reservada", "Completada", "Cancelada"
  location: AppointmentLocation;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response containing user appointments
 */
export interface AppointmentsResponse {
  upcoming: Appointment[];
  past: Appointment[];
  today: Appointment[];
}

/**
 * Request to book an appointment
 */
export interface BookAppointmentRequest {
  date: string; // ISO 8601 date string
  time: string; // HH:MM format
  notes?: string;
}

/**
 * Available time slot
 */
export interface TimeSlot {
  time: string; // HH:MM format
  available: boolean;
}

/**
 * Available dates and time slots
 */
export interface AvailabilityResponse {
  date: string;
  slots: TimeSlot[];
}
