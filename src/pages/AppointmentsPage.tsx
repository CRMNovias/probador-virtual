/**
 * AppointmentsPage (Phase 2 - Complete Implementation)
 *
 * Appointments screen showing upcoming and past appointments.
 */

import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header.js';
import { Navigation } from '../components/layout/Navigation.js';
import { getUserAppointments } from '../services/appointmentService.js';
import type { Appointment } from '../types/index.js';

/**
 * AppointmentsPage Component
 */
export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await getUserAppointments();
      // Combine upcoming and past appointments
      const allAppointments = [...data.upcoming, ...data.past];
      setAppointments(allAppointments);
    } catch (err) {
      console.error('Error loading appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Separate upcoming and past appointments
  const now = new Date();
  const upcomingAppointments = appointments.filter(
    appt => new Date(appt.dateTime) >= now
  );
  const pastAppointments = appointments.filter(
    appt => new Date(appt.dateTime) < now
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'confirmada':
        return 'bg-green-100 text-green-600';
      case 'completed':
      case 'completada':
        return 'bg-gray-100 text-gray-600';
      case 'pending':
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-600';
      case 'cancelled':
      case 'cancelada':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const dateStr = date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return { dateStr, timeStr };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F7F5]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Cargando citas...</p>
        </main>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F5]">
      <Header />

      <main className="flex-1 pb-24 p-4 md:p-8">
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="text-4xl font-serif text-[#4a3f35] mb-6 text-center">Mis Citas</h1>

          {/* Book Appointment Button */}
          <div className="mb-8 flex justify-center">
            <a
              href="https://atelierdebodas.com/pide-cita/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#8C6F5A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#6e5f53] transition-colors shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <path d="M8 14h.01"></path>
                <path d="M12 14h.01"></path>
                <path d="M16 14h.01"></path>
                <path d="M8 18h.01"></path>
                <path d="M12 18h.01"></path>
              </svg>
              Agendar Nueva Cita
            </a>
          </div>

          <div className="space-y-6">
            {/* Próximas Citas */}
            <div>
              <h2 className="text-2xl font-serif text-[#4a3f35] border-b pb-2 mb-4">
                Próximas Citas
              </h2>
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map(appt => {
                  const { dateStr, timeStr } = formatDateTime(appt.dateTime);
                  return (
                    <div
                      key={appt.id}
                      className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center mb-3"
                    >
                      <div>
                        <p className="font-semibold">{dateStr}</p>
                        <p className="text-gray-600">{timeStr}</p>
                        {appt.notes && (
                          <p className="text-sm text-gray-500 mt-1">{appt.notes}</p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${getStatusColor(
                          appt.status
                        )}`}
                      >
                        {appt.status}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 font-light">No tienes citas próximas.</p>
              )}
            </div>

            {/* Historial */}
            <div>
              <h2 className="text-2xl font-serif text-[#4a3f35] border-b pb-2 mb-4">
                Historial
              </h2>
              {pastAppointments.length > 0 ? (
                pastAppointments.map(appt => {
                  const { dateStr, timeStr } = formatDateTime(appt.dateTime);
                  return (
                    <div
                      key={appt.id}
                      className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center opacity-70 mb-3"
                    >
                      <div>
                        <p className="font-semibold">{dateStr}</p>
                        <p className="text-gray-600">{timeStr}</p>
                        {appt.notes && (
                          <p className="text-sm text-gray-500 mt-1">{appt.notes}</p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${getStatusColor(
                          appt.status
                        )}`}
                      >
                        {appt.status}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 font-light">No tienes citas en tu historial.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Navigation />
    </div>
  );
};
