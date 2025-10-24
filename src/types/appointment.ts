/**
 * Appointment-related types
 * 
 * Interfaces for appointment booking and management
 */

/**
 * Appointment status
 */
export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

/**
 * Appointment information
 */
export interface Appointment {
  id: string;
  userId: string;
  date: string; // ISO 8601 date string
  time: string; // HH:MM format
  dateTime: string; // ISO 8601 combined date-time string (for compatibility)
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
}

/**
 * Response containing user appointments
 */
export interface AppointmentsResponse {
  upcoming: Appointment[];
  past: Appointment[];
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
