/** Fechas de la reserva. Todo en hora local: los días son claves YYYY-MM-DD. */

export const toDateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Interpreta YYYY-MM-DD como día local (new Date('YYYY-MM-DD') lo toma como UTC). */
export const fromDateKey = (key: string): Date => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
};

export const addDays = (d: Date, days: number): Date => {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
};

export const startOfToday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Semanas del mes empezando en lunes; `null` rellena los huecos. */
export const monthGrid = (year: number, month: number): Array<Date | null> => {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= days; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7) cells.push(null);
  return cells;
};

const longDate = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
const shortDate = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
const monthTitle = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });
const time = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' });

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const formatLong = (d: Date) => capitalize(longDate.format(d));
export const formatShort = (d: Date) => capitalize(shortDate.format(d).replace(/\./g, ''));
export const formatMonth = (d: Date) => capitalize(monthTitle.format(d));
export const formatTime = (d: Date) => time.format(d);

const icsStamp = (d: Date) =>
  `${toDateKey(d).replace(/-/g, '')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;
const icsText = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

/** Archivo .ics para «Añadir al calendario» (hora local, 1 hora de duración). */
export const calendarFile = (event: { start: Date; title: string; location: string; description: string }): Blob => {
  const end = new Date(event.start.getTime() + 60 * 60 * 1000);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Atelier de Bodas//Probador virtual//ES',
    'BEGIN:VEVENT',
    `UID:${event.start.getTime()}@probador.atelierdebodas.com`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(event.start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${icsText(event.title)}`,
    `LOCATION:${icsText(event.location)}`,
    `DESCRIPTION:${icsText(event.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
};

/** Descarga la cita como .ics para añadirla al calendario del móvil. */
export const saveCalendarFile = (event: Parameters<typeof calendarFile>[0]) => {
  const url = URL.createObjectURL(calendarFile(event));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cita-atelier-de-bodas.ics';
  link.click();
  URL.revokeObjectURL(url);
};

export const mapsUrl = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
