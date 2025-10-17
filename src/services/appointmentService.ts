/**
 * Appointment Service
 * 
 * Handles appointment operations:
 * - Get user appointments
 * - Book new appointment
 */

import { apiClient } from './apiClient.js';
import { envConfig } from '../config/envConfig.js';
import type { AppointmentsResponse, BookAppointmentRequest } from '../types/index.js';

/**
 * Get all appointments for current user
 * @returns Promise with upcoming and past appointments
 */
export const getUserAppointments = async (): Promise<AppointmentsResponse> => {
  const response = await apiClient.get(envConfig.endpoints.appointment.getUserAppointments);
  return response as AppointmentsResponse;
};

/**
 * Book a new appointment
 * @param request - Appointment booking data
 * @returns Promise with booking response
 */
export const bookAppointment = async (request: BookAppointmentRequest): Promise<void> => {
  await apiClient.post(envConfig.endpoints.appointment.book, request);
};
