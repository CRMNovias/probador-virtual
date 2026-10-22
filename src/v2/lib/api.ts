import axios from 'axios';
import { apiClient } from '@/services/apiClient';
import * as appointments from '@/services/appointmentService';
import * as auth from '@/services/authService';
import * as avatars from '@/services/avatarService';
import * as dresses from '@/services/dressService';
import * as favorites from '@/services/favoriteService';
import * as tryOns from '@/services/tryOnService';
import * as users from '@/services/userService';
import type { UserProfile as V1UserProfile } from '@/types/index';
import { brand } from './brand';
import { AVATAR_PROMPT, COUPLE_TRYON_PROMPT, tryOnPrompt, type PoseId } from './prompts';
import { signIn, signOut } from './session';
import type {
  Appointment,
  BookingInput,
  BookingService,
  BookingShop,
  Category,
  CollectionFacet,
  CollectionItem,
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
 * Cliente del CRM de las pantallas de la V2, con las mismas funciones que
 * tenía la V2 por su cuenta, pero sobre los servicios de la V1
 * (src/services) y su apiClient: mismo token, mismos reintentos, mismas rutas.
 * Los errores llegan como ApiError (mensaje legible, estado y errores por campo).
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

const FRIENDLY: Record<number, string> = {
  401: 'Tu sesión ha caducado. Vuelve a entrar con tu teléfono.',
  429: 'Demasiados intentos seguidos. Espera un momento.',
  500: 'El servidor ha fallado. Inténtalo de nuevo en un momento.',
  503: 'El servicio no está disponible ahora mismo.',
};

interface CrmError {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  error?: { message?: string };
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const body = (error.response?.data ?? {}) as CrmError;
    const fieldErrors = Object.fromEntries(Object.entries(body.errors ?? {}).map(([k, v]) => [k, v[0] ?? '']));
    // Límite de peticiones: el CRM responde en inglés («Too Many Attempts.»).
    const crmMessage = status === 429 ? undefined : (body.error?.message ?? body.message);
    const message = crmMessage ?? FRIENDLY[status] ?? (status ? 'Algo ha fallado. Inténtalo de nuevo.' : 'Sin conexión. Revisa tu internet.');
    return new ApiError(message, status, fieldErrors);
  }
  return new ApiError(error instanceof Error ? error.message : 'Algo ha fallado. Inténtalo de nuevo.', 0);
};

/** Ejecuta una llamada y convierte sus errores; `success: false` también es error. */
const call = async <T>(run: () => Promise<T>): Promise<T> => {
  try {
    const result = await run();
    const body = result as unknown as CrmError | null;
    if (body && typeof body === 'object' && body.success === false) {
      throw new ApiError(body.message ?? 'Algo ha fallado. Inténtalo de nuevo.', 400);
    }
    return result;
  } catch (error) {
    throw toApiError(error);
  }
};

/** Cuerpo del CRM `{ success, data }` → `data` (o el cuerpo tal cual). */
const unwrap = <T>(body: unknown): T =>
  (body && typeof body === 'object' && 'data' in body ? (body as { data: T }).data : body) as T;

const probador = (path: string) => `/probador/${brand.id}/${path}`;

// Acceso (la sesión es la de la V1: ver session.ts)
export const sendCode = (phone: string) =>
  call(() => auth.sendCode(phone)).then((res) => ({ simulated: Boolean((res as { simulated?: boolean }).simulated) }));
export const verifyCode = async (phone: string, code: string) => {
  const res = await call(() => auth.verifyCode(phone, code));
  const { token, user, hasProfile, hasAvatar } = res.data;
  const profile: V1UserProfile = {
    id: String(user.id),
    name: user.name ?? null,
    email: user.email ?? null,
    phone: user.phone ?? phone,
    createdAt: user.createdAt,
    hasAvatar: Boolean(hasAvatar),
  };
  signIn(token, profile, phone);
  return { user: profile as unknown as UserProfile, hasProfile: Boolean(hasProfile), hasAvatar: Boolean(hasAvatar) };
};
export const logout = async () => {
  signOut();
};

// Perfil
export const getProfile = () => call(() => users.getProfile()) as Promise<UserProfile>;
export const listShops = () => call(() => users.listPublicShops()) as Promise<Shop[]>;
export interface ProfileInput {
  phone: string;
  name: string;
  email: string;
  postcode: string;
  shopId: number;
  sendPhotosWhatsApp: boolean;
}
export const createProfile = (input: ProfileInput) =>
  call(() => users.createProfile(input)).then((res) => unwrap<{ user: UserProfile }>(res));

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
export const updateProfile = (input: ProfileUpdate) => call(() => users.updateProfile(input)) as Promise<UserProfile>;

// Avatar
export const uploadPhoto = (file: File) => call(() => users.uploadPhoto(file));
export const getAvatar = () =>
  call(() => avatars.getAvatar()).then(
    (avatar) => ({ avatarUrl: avatar.imageUrl }),
    (e: unknown) => {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    },
  );
export const generateAvatar = () =>
  call(() => avatars.generateAvatar(AVATAR_PROMPT)).then((res) => unwrap<{ avatarUrl: string }>(res));

// Vídeo 360: lo genera el CRM (ver docs/crm-360.md)
const turntable = async (path: string, start: boolean): Promise<Turntable> => {
  try {
    const body = await call(() => (start ? apiClient.post(probador(path)) : apiClient.get(probador(path))));
    return unwrap<Turntable>(body);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 405)) return { status: 'none' };
    throw e;
  }
};
export const avatarTurntable = (start = false) => turntable('avatar/turntable', start);
/** `couple`: el CRM ya sabe si la prueba es de pareja; se mantiene por compatibilidad. */
export const tryOnTurntable = (id: string, start = false, couple = false) =>
  turntable(`tryons/${id}/turntable${couple ? '?couple=1' : ''}`, start);

// Colecciones (mismos filtros que la V1)
export interface GarmentFilters {
  q?: string | undefined;
  brand?: string | undefined;
  cut?: string | undefined;
  color?: string | undefined;
  suitType?: string | undefined;
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

/** Quita los filtros vacíos (los servicios de la V1 no aceptan `undefined`). */
const clean = <T extends Record<string, unknown>>(params: T) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '')) as {
    [K in keyof T]?: Exclude<T[K], undefined>;
  };

/** Una página del catálogo (el CRM sirve 30 por página, los más recientes primero). */
export const listGarments = async (category: Category, filters: GarmentFilters = {}, page = 1): Promise<GarmentList> => {
  const res = await call(() =>
    category === 'bride'
      ? dresses.listBrides(clean({ page, q: filters.q, brand: filters.brand, cut: filters.cut }))
      : dresses.listGrooms(clean({ page, q: filters.q, color: filters.color, suitType: filters.suitType })),
  );
  return { items: res.data as CollectionItem[], total: res.meta.total, hasMore: res.meta.hasMore };
};
export const getGarment = (dressId: string) =>
  call(() => apiClient.get(probador(`collections/item?dressId=${encodeURIComponent(dressId)}`))).then((res) =>
    unwrap<CollectionItem>(res),
  );
const FACET_LOADERS: Record<string, () => Promise<CollectionFacet[]>> = {
  'collections/brands': dresses.listBrideBrands,
  'collections/bride-cuts': dresses.listBrideCuts,
  'collections/groom-suit-types': dresses.listGroomSuitTypes,
  'collections/groom-colors': dresses.listGroomColors,
};
export const listFacet = (path: string) => call(() => (FACET_LOADERS[path] ?? (async () => []))());

// Pruebas
export interface TryOnOptions {
  /** Escena en la que se genera la prueba (ver src/v2/lib/backgrounds.ts). */
  backgroundNote?: string;
  /** Pareja: lo que lleva y su foto como data URL (src/v2/lib/images.ts). */
  partner?: { dressId: string; image: string } | null;
  pose?: PoseId;
  /** Fondo de exterior: el CRM viste primero en un estudio y luego cambia solo el fondo (la persona cambia menos). */
  twoStep?: boolean;
}

/** La prueba, con el fondo elegido y, si se quiere, con la pareja (como la V1). */
export const generateTryOn = async (dressId: string, { backgroundNote, partner, pose = 'studio', twoStep = false }: TryOnOptions = {}): Promise<TryOn> => {
  const res = await call(() =>
    tryOns.generateTryOn({
      dressId,
      prompt: partner ? COUPLE_TRYON_PROMPT : tryOnPrompt(pose),
      // El CRM hace el 360 de la prueba y, con la plantilla de vídeo, lo manda por WhatsApp en lugar de la foto.
      deliverVideo: true,
      ...(backgroundNote ? { backgroundNote } : {}),
      ...(backgroundNote && twoStep ? { backgroundTwoStep: true } : {}),
      ...(partner ? { partnerDressId: partner.dressId, partnerImage: partner.image } : {}),
    }),
  );
  return res.data as unknown as TryOn;
};
/** El CRM pone el modelo en el grupo y no en cada prueba: se copia a cada una (Mis pruebas enlaza con él). */
export const listTryOns = () =>
  call(() => apiClient.get(probador('tryons/user'))).then((res) =>
    (unwrap<{ tryOnsByDress?: TryOnGroup[] }>(res).tryOnsByDress ?? []).map((g) => ({
      ...g,
      tryOns: g.tryOns.map((t) => ({ ...t, dressId: g.dressId })),
    })),
  );
export const deleteTryOn = (id: string) => call(() => tryOns.deleteTryOn(id));

// Citas (los servicios de la V1)
export const listBookingShops = () => call(() => appointments.listBookingShops()) as Promise<BookingShop[]>;
export const listBookingServices = (shopId: number) => call(() => appointments.listBookingServices(shopId)) as Promise<BookingService[]>;

/** Días cerrados de la tienda para un servicio, como claves YYYY-MM-DD. */
export const listClosedDays = async (shopId: number, serviceId: number): Promise<Set<string>> =>
  new Set(await call(() => appointments.listClosedDays(shopId, serviceId)));

/** Primer día con calendario abierto (tiendas recién abiertas). */
export const getOpeningDate = async (shopId: number): Promise<string | null> =>
  (await call(() => appointments.getBookingOpeningDate(shopId))).suggestedStartDate;

/** Horas libres de un día. Lista vacía si la tienda cierra o no queda hueco. */
export const listHours = async (input: Omit<BookingInput, 'hour'>): Promise<string[]> => {
  const res = await call(() => appointments.listAvailability(input));
  return res.closed ? [] : res.slots.map((s) => s.hour);
};

export const bookAppointment = (input: BookingInput) => call(() => appointments.bookAppointment(input));
export const updateAppointment = (input: BookingInput & { appointmentId: number }) =>
  call(() => appointments.updateAppointmentBooking(input));
export const cancelAppointment = (appointmentId: number) => call(() => appointments.cancelAppointmentBooking(appointmentId));
export const listAppointments = () =>
  call(() => appointments.getUserAppointments()).then((res) => {
    const d = unwrap<{ today?: Appointment[]; upcoming?: Appointment[]; past?: Appointment[] }>(res);
    return { upcoming: [...(d.today ?? []), ...(d.upcoming ?? [])], past: d.past ?? [] };
  });

// Favoritos (los de la V1)
export const listFavorites = () => call(() => favorites.getFavorites()) as Promise<Favorite[]>;
export const toggleFavorite = (dressId: string) => call(() => favorites.toggleFavorite(dressId));
