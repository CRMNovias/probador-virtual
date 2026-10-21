import { withBase } from './base-path';
import { brand } from './brand';
import { AVATAR_PROMPT, COUPLE_TRYON_PROMPT, tryOnPrompt, type PoseId } from './prompts';
import type {
  Appointment,
  BookingInput,
  BookingService,
  BookingShop,
  Category,
  CollectionFacet,
  CollectionItem,
  CollectionPage,
  Favorite,
  Shop,
  TryOn,
  TryOnGroup,
  Turntable,
  UserProfile,
  WeddingMoment,
  WeddingStyle,
} from './types';

/**
 * Cliente del CRM para las pantallas. Llama a la pasarela `/api/crm/*`, que
 * añade el token; las rutas y respuestas son las mismas que usa la V1.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

interface CrmBody<T> {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  error?: { message?: string };
}

const FRIENDLY: Record<number, string> = {
  401: 'Tu sesión ha caducado. Vuelve a entrar con tu teléfono.',
  429: 'Demasiados intentos seguidos. Espera un momento.',
  500: 'El servidor ha fallado. Inténtalo de nuevo en un momento.',
  503: 'El servicio no está disponible ahora mismo.',
};

/** Respuesta completa del CRM (con `meta`, por ejemplo), o error legible. */
const requestBody = async <B extends CrmBody<unknown>>(path: string, init?: RequestInit): Promise<B> => {
  const res = await fetch(path, init);
  const body = (await res.json().catch(() => ({}))) as B;
  if (!res.ok || body.success === false) {
    const fieldErrors = Object.fromEntries(Object.entries(body.errors ?? {}).map(([k, v]) => [k, v[0] ?? '']));
    const message = body.error?.message ?? body.message ?? FRIENDLY[res.status] ?? 'Algo ha fallado. Inténtalo de nuevo.';
    throw new ApiError(message, res.status, fieldErrors);
  }
  return body;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const body = await requestBody<CrmBody<T>>(path, init);
  return (body.data ?? (body as T)) as T;
};

const crm = (path: string) => withBase(`/api/crm/${path}`);
const probador = (path: string) => crm(`probador/${brand.id}/${path}`);
const json = (data: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

// Acceso
/** `simulated` llega solo desde el CRM simulado de desarrollo (no se envía WhatsApp). */
export const sendCode = (phone: string) => request<{ simulated?: boolean }>(withBase('/api/auth/send-code'), json({ phone }));
export const verifyCode = (phone: string, code: string) =>
  request<{ user: UserProfile; hasProfile: boolean; hasAvatar: boolean }>(withBase('/api/auth/verify-code'), json({ phone, code }));
export const logout = () => request<unknown>(withBase('/api/auth/logout'), { method: 'POST' });

// Perfil
export const getProfile = () => request<UserProfile>(probador('user/profile'));
export const listShops = () => request<Shop[]>(crm(`${brand.id}/shops`));
export interface ProfileInput {
  phone: string;
  name: string;
  email: string;
  postcode: string;
  shopId: number;
  sendPhotosWhatsApp: boolean;
}
export const createProfile = (input: ProfileInput) =>
  request<{ user: UserProfile }>(probador('user/create'), json(input));

export interface ProfileUpdate {
  name?: string;
  email?: string;
  postcode?: string;
  shopId?: number;
  sendPhotosWhatsApp?: boolean;
  weddingDate?: string | null;
  weddingPlace?: string | null;
  weddingStyle?: WeddingStyle | null;
  weddingMoment?: WeddingMoment | null;
}
/** Cambia los datos de contacto y de la boda (`null` borra un dato de la boda). */
export const updateProfile = (input: ProfileUpdate) => request<UserProfile>(probador('user/update-profile'), json(input));

// Avatar
export const uploadPhoto = (file: File) => {
  const form = new FormData();
  form.append('photo', file);
  return request<{ photoUrl: string }>(probador('user/upload'), { method: 'POST', body: form });
};
export const getAvatar = () =>
  request<{ avatarUrl: string }>(probador('avatar')).catch((e: unknown) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });
export const generateAvatar = () => request<{ avatarUrl: string }>(probador('avatar/generate'), json({ prompt: AVATAR_PROMPT }));

// Vídeo 360 (contrato propuesto; si el CRM aún no lo tiene, se trata como «no disponible»)
const turntable = async (path: string, start: boolean): Promise<Turntable> => {
  try {
    return await request<Turntable>(probador(path), start ? { method: 'POST' } : undefined);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 405)) return { status: 'none' };
    throw e;
  }
};
export const avatarTurntable = (start = false) => turntable('avatar/turntable', start);
/** `couple`: el giro es de los dos (la V2 ajusta lo que le pide a la IA). */
export const tryOnTurntable = (id: string, start = false, couple = false) =>
  turntable(`tryons/${id}/turntable${couple ? '?couple=1' : ''}`, start);

// Colecciones
export interface GarmentFilters {
  q?: string;
  brand?: string;
  cut?: string;
  color?: string;
  suitType?: string;
}

/** Filtros del catálogo, los mismos que la V1: marca y corte en novia; estilo y color en novio. */
export const FACETS = {
  bride: [
    { key: 'brand', label: 'Marca', path: 'collections/brands' },
    { key: 'cut', label: 'Corte', path: 'collections/bride-cuts' },
  ],
  groom: [
    { key: 'suitType', label: 'Estilo', path: 'collections/groom-suit-types' },
    { key: 'color', label: 'Color', path: 'collections/groom-colors' },
  ],
} as const satisfies Record<Category, readonly { key: keyof GarmentFilters; label: string; path: string }[]>;

export interface GarmentList {
  items: CollectionItem[];
  total: number;
  hasMore: boolean;
}

/** Una página del catálogo (el CRM sirve 30 por página, los más recientes primero). */
export const listGarments = async (category: Category, filters: GarmentFilters = {}, page = 1): Promise<GarmentList> => {
  const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]);
  if (page > 1) params.set('page', String(page));
  const qs = params.size ? `?${params}` : '';
  const body = await requestBody<CrmBody<CollectionItem[]> & { meta?: CollectionPage['meta'] }>(
    probador(`collections/${category === 'bride' ? 'brides' : 'grooms'}${qs}`),
  );
  const items = body.data ?? [];
  return { items, total: body.meta?.total ?? items.length, hasMore: body.meta?.hasMore ?? false };
};
export const getGarment = (dressId: string) =>
  request<CollectionItem>(probador(`collections/item?dressId=${encodeURIComponent(dressId)}`));
export const listFacet = (path: string) => request<CollectionFacet[]>(probador(path));

// Pruebas
export interface TryOnOptions {
  /** Escena en la que se genera la prueba (ver src/lib/backgrounds.ts). */
  backgroundNote?: string;
  /** Pareja: lo que lleva y su foto como data URL (src/lib/images.ts). */
  partner?: { dressId: string; image: string } | null;
  pose?: PoseId;
}

/** La prueba, con el fondo elegido y, si se quiere, con la pareja (como la V1). */
export const generateTryOn = (dressId: string, { backgroundNote, partner, pose = 'studio' }: TryOnOptions = {}) =>
  request<TryOn>(
    probador('tryons/generate'),
    json({
      dressId,
      prompt: partner ? COUPLE_TRYON_PROMPT : tryOnPrompt(pose),
      // El WhatsApp de la V2 lleva el vídeo 360 en lugar de la foto (lo manda el CRM al recibirlo).
      deliverVideo: true,
      ...(backgroundNote ? { backgroundNote } : {}),
      ...(partner ? { partnerDressId: partner.dressId, partnerImage: partner.image } : {}),
    }),
  );
export const listTryOns = () =>
  request<{ tryOnsByDress: TryOnGroup[] }>(probador('tryons/user')).then((d) => d.tryOnsByDress ?? []);
export const deleteTryOn = (id: string) => request<unknown>(probador(`tryons/${id}`), { method: 'DELETE' });

// Citas. Mismas llamadas que la V1 (src/services/appointmentService.ts), con prefijo de marca.
export const listBookingShops = () => request<BookingShop[]>(probador('booking/shops'));
export const listBookingServices = (shopId: number) => request<BookingService[]>(probador(`booking/services?shopId=${shopId}`));

/** Días cerrados de la tienda para un servicio, como claves YYYY-MM-DD. */
export const listClosedDays = async (shopId: number, serviceId: number): Promise<Set<string>> => {
  const res = await request<{ datestring?: string[]; closed_days?: string[] }>(probador('booking/closed-days'), json({ shopId, serviceId }));
  if (res.datestring?.length) return new Set(res.datestring);
  // Formato antiguo del CRM: "2026,10,3".
  return new Set(
    (res.closed_days ?? []).map((d) => {
      const [y, m, day] = d.split(',');
      return y && m && day ? `${y}-${m.padStart(2, '0')}-${day.padStart(2, '0')}` : d;
    }),
  );
};

/** Primer día con calendario abierto (tiendas recién abiertas). */
export const getOpeningDate = async (shopId: number): Promise<string | null> => {
  const res = await request<{ opening_date?: string; suggested_calendar_start_date?: string }>(probador('booking/opening-date'), json({ shopId }));
  return res.suggested_calendar_start_date ?? res.opening_date ?? null;
};

/** Horas libres de un día. Lista vacía si la tienda cierra o no queda hueco. */
export const listHours = async (input: Omit<BookingInput, 'hour'>): Promise<string[]> => {
  const res = await request<{
    closed?: boolean | 'true' | 'false';
    available_hours?: Record<string, string | number>;
    success?: Record<string, { available_hours?: Record<string, string | number> }>;
  }>(probador('booking/availability'), json(input));
  if (res.closed === true || res.closed === 'true') return [];
  const hours = res.success?.[String(input.serviceId)]?.available_hours ?? res.available_hours ?? {};
  return Object.entries(hours)
    .filter(([, free]) => Number(free) > 0)
    .map(([hour]) => hour)
    .sort();
};

export const bookAppointment = (input: BookingInput) => request<unknown>(probador('booking/book'), json(input));
export const updateAppointment = (input: BookingInput & { appointmentId: number }) =>
  request<unknown>(probador('booking/update'), json(input));
export const cancelAppointment = (appointmentId: number) => request<unknown>(probador('booking/cancel'), json({ appointmentId }));
export const listAppointments = () =>
  request<{ today?: Appointment[]; upcoming?: Appointment[]; past?: Appointment[] }>(probador('appointments/user')).then((d) => ({
    upcoming: [...(d.today ?? []), ...(d.upcoming ?? [])],
    past: d.past ?? [],
  }));

// Selección (favoritos del CRM)
export const listFavorites = () =>
  request<{ favorites: Favorite[] }>(crm('favorites')).then((d) => d.favorites ?? []);
export const toggleFavorite = (dressId: string) =>
  request<{ favorited: boolean }>(crm('favorites/toggle'), json({ dressId })).then((d) => d.favorited);
