/** Tipos de las respuestas del CRM, los mismos que consume la V1. */

export type WeddingStyle = 'classic' | 'boho_chic' | 'rustic' | 'vintage' | 'industrial' | 'romantic' | 'minimalist' | 'glamour' | 'other';
export type WeddingMoment = 'day' | 'night';

export interface UserProfile {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  hasAvatar: boolean;
  shopId?: number | null;
  /** Los campos siguientes solo llegan en `/user/profile`. */
  shopName?: string | null;
  postcode?: string | null;
  sendPhotosWhatsApp?: boolean;
  /** Solo Sedka: entró sin teléfono. */
  isGuest?: boolean;
  /** Solo Sedka: la prueba gratis ya está hecha y la siguiente pide el teléfono. */
  freeTryOnUsed?: boolean;
  wedding?: { date: string | null; place: string | null; style: WeddingStyle | null; moment: WeddingMoment | null } | null;
}

export interface Shop {
  id: number;
  name: string;
}

export interface CollectionItem {
  dressId: string;
  wpId: number;
  name: string;
  brand: string;
  cut: string | null;
  color: string | null;
  imageUrl: string;
  /** Solo en la ficha suelta (`collections/item`). */
  category?: Category;
}

export interface CollectionFacet {
  label: string;
  count: number;
}

export interface CollectionPage {
  data: CollectionItem[];
  meta: { page: number; pageSize: number; total: number; hasMore: boolean };
}

/** Estado del vídeo 360 (contrato propuesto en docs/crm-360.md). */
export interface Turntable {
  status: 'none' | 'processing' | 'ready' | 'failed';
  videoUrl?: string;
  posterUrl?: string;
  error?: string;
  /** Fotos de detalle de la prueba (de cerca por delante y por detrás), que el CRM hace junto al 360. */
  details?: TryOnDetails;
}

export interface TryOnDetails {
  status: 'none' | 'processing' | 'ready' | 'failed';
  frontUrl?: string | null;
  backUrl?: string | null;
}

export interface TryOn {
  id: string;
  dressId: string;
  imageUrl: string;
  createdAt: string;
  turntable?: Turntable | null;
  /** Sedka, sesión sin teléfono: la siguiente prueba pide el número. */
  phoneRequiredNext?: boolean;
}

export interface TryOnGroup {
  dressId: string;
  dressName: string;
  /** El título del producto en la web; el adaptador lo pone en dressName (ver listTryOns). */
  dressWebName?: string | null;
  dressImageUrl: string;
  tryOns: TryOn[];
}

export interface Favorite {
  id: string;
  dressId: string;
  dressName: string;
  /** El título del producto en la web; el adaptador lo pone en dressName (ver listFavorites). */
  webName?: string | null;
  /** La de maniquí que usa la IA para la prueba. */
  dressImageUrl: string | null;
  /** La primera foto del modelo en la web, como en Colección. */
  imageUrl?: string | null;
}

export type Category = 'bride' | 'groom';

// Citas (mismas formas que la V1: src/types/appointment.ts)

export interface BookingShop {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
}

export interface BookingService {
  id: number;
  name: string;
  label: string;
  minDays?: number;
  maxDays?: number;
}

export interface Appointment {
  id: number;
  /** Fecha y hora local de la tienda, p. ej. "2026-10-23T10:00:00". */
  date: string;
  status: string;
  location: { name: string; address: string; city: string; phone: string };
  /** Atelier y servicio con los que se cambia la cita (el CRM puede haberla movido de tienda). */
  shopId?: number;
  serviceId?: number | null;
}

export interface BookingInput {
  shopId: number;
  serviceId: number;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM */
  hour: string;
}
