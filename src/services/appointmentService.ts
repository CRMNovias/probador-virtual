/**
 * Appointment Service (Phase 1)
 *
 * Handles appointment operations:
 * - Get user appointments
 */

import { apiClient } from './apiClient.js';
import { envConfig } from '../config/envConfig.js';
import type { AppointmentsResponse } from '../types/index.js';

/**
 * Get all appointments for current user (Phase 1)
 * @returns Promise with upcoming and past appointments
 */
export const getUserAppointments = async (): Promise<AppointmentsResponse> => {
  const response = await apiClient.get(envConfig.endpoints.appointment.getUserAppointments);
  return response as unknown as AppointmentsResponse;
};
