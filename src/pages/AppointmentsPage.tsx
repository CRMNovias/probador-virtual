/**
 * AppointmentsPage (Phase 2 - Complete Implementation)
 *
 * Appointments screen showing upcoming and past appointments.
 */

import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header.js';
import { getUserAppointments } from '../services/appointmentService.js';
import type { Appointment } from '../types/index.js';

/**
 * AppointmentsPage Component
 */
export const AppointmentsPage: React.FC = () => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await getUserAppointments();
      console.log('[AppointmentsPage] Appointments response:', response);

      // Extract data from backend response
      const data = (response as any).data || response;

      setTodayAppointments(data.today || []);
      setUpcomingAppointments(data.upcoming || []);
      setPastAppointments(data.past || []);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setTodayAppointments([]);
      setUpcomingAppointments([]);
      setPastAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();

    // Handle Spanish statuses from backend
    if (lowerStatus.includes('reservada') || lowerStatus.includes('confirmada') || lowerStatus.includes('confirmed')) {
      return 'bg-green-100 text-green-600 border border-green-300';
    }
    if (lowerStatus.includes('completada') || lowerStatus.includes('completed')) {
      return 'bg-gray-100 text-gray-600 border border-gray-300';
    }
    if (lowerStatus.includes('pendiente') || lowerStatus.includes('pending')) {
      return 'bg-yellow-100 text-yellow-600 border border-yellow-300';
    }
    if (lowerStatus.includes('cancelada') || lowerStatus.includes('cancelled')) {
      return 'bg-red-100 text-red-600 border border-red-300';
    }

    return 'bg-blue-100 text-blue-600 border border-blue-300';
  };

  const formatDateTime = (date: string) => {
    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timeStr = dateObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return { dateStr, timeStr };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#ffffff]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Cargando citas...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <Header />

      <main className="flex-1 pb-24 p-4 md:p-8">
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="text-4xl font-serif text-[#000000] mb-6 text-center">Mis Citas</h1>

          {/* Book Appointment Button */}
          <div className="mb-8 flex justify-center">
            <a
              href="https://atelierdebodas.com/pide-cita/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-md"
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

          {/* Check if there are any appointments at all */}
          {todayAppointments.length === 0 && upcomingAppointments.length === 0 && pastAppointments.length === 0 ? (
            <p className="text-center text-gray-500 font-light mt-8">
              No tienes citas registradas. ¡Agenda tu primera cita!
            </p>
          ) : (
            <div className="space-y-8">
              {/* Citas de Hoy - Only show if there are appointments */}
              {todayAppointments.length > 0 && (
                <div>
                  <h2 className="text-2xl font-serif text-[#000000] border-b-2 border-[#333333] pb-2 mb-4">
                    Hoy
                  </h2>
                  <div className="space-y-3">
                    {todayAppointments.map(appt => {
                      const { dateStr, timeStr } = formatDateTime(appt.date);
                      return (
                        <div
                          key={appt.id}
                          className="bg-gradient-to-r from-blue-50 to-white p-5 rounded-xl shadow-md border-2 border-blue-300"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <p className="font-bold text-lg text-[#000000]">{dateStr}</p>
                              <p className="text-blue-700 font-semibold text-lg">{timeStr}</p>
                            </div>
                            <span className={`px-3 py-1 text-sm rounded-lg font-medium ${getStatusColor(appt.status)}`}>
                              {appt.status}
                            </span>
                          </div>
                          {/* Location Info */}
                          <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                            <p className="font-semibold text-gray-800 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {appt.location.name}
                            </p>
                            <p className="text-sm text-gray-600 ml-6">{appt.location.address}</p>
                            <p className="text-sm text-gray-600 ml-6">{appt.location.city}</p>
                            <p className="text-sm text-gray-700 font-medium ml-6 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {appt.location.phone}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Próximas Citas - Only show if there are appointments */}
              {upcomingAppointments.length > 0 && (
                <div>
                  <h2 className="text-2xl font-serif text-[#000000] border-b-2 border-[#333333] pb-2 mb-4">
                    Próximas Citas
                  </h2>
                  <div className="space-y-3">
                    {upcomingAppointments.map(appt => {
                      const { dateStr, timeStr } = formatDateTime(appt.date);
                      return (
                        <div
                          key={appt.id}
                          className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <p className="font-bold text-lg text-[#000000]">{dateStr}</p>
                              <p className="text-gray-700 font-semibold">{timeStr}</p>
                            </div>
                            <span className={`px-3 py-1 text-sm rounded-lg font-medium ${getStatusColor(appt.status)}`}>
                              {appt.status}
                            </span>
                          </div>
                          {/* Location Info */}
                          <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                            <p className="font-semibold text-gray-800 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {appt.location.name}
                            </p>
                            <p className="text-sm text-gray-600 ml-6">{appt.location.address}</p>
                            <p className="text-sm text-gray-600 ml-6">{appt.location.city}</p>
                            <p className="text-sm text-gray-700 font-medium ml-6 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {appt.location.phone}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Historial - Only show if there are appointments */}
              {pastAppointments.length > 0 && (
                <div>
                  <h2 className="text-2xl font-serif text-[#000000] border-b-2 border-[#333333] pb-2 mb-4">
                    Historial
                  </h2>
                  <div className="space-y-3">
                    {pastAppointments.map(appt => {
                      const { dateStr, timeStr } = formatDateTime(appt.date);
                      return (
                        <div
                          key={appt.id}
                          className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 opacity-60"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <p className="font-bold text-lg text-[#000000]">{dateStr}</p>
                              <p className="text-gray-600">{timeStr}</p>
                            </div>
                            <span className={`px-3 py-1 text-sm rounded-lg font-medium ${getStatusColor(appt.status)}`}>
                              {appt.status}
                            </span>
                          </div>
                          {/* Location Info */}
                          <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                            <p className="font-semibold text-gray-700 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {appt.location.name}
                            </p>
                            <p className="text-sm text-gray-500 ml-6">{appt.location.address}</p>
                            <p className="text-sm text-gray-500 ml-6">{appt.location.city}</p>
                            <p className="text-sm text-gray-600 ml-6 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {appt.location.phone}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
