/**
 * User-related types
 * 
 * Interfaces for user profile, authentication, and user data management
 */

/**
 * Estilos de boda admitidos por el backend en `customer_date_events.style`.
 * Mantener sincronizado con `ApiCustomerController::WEDDING_STYLES`.
 */
export type WeddingStyle =
  | 'classic'
  | 'boho_chic'
  | 'rustic'
  | 'vintage'
  | 'industrial'
  | 'romantic'
  | 'minimalist'
  | 'glamour'
  | 'other';

export type WeddingMoment = 'day' | 'night';

/**
 * Información completa del cliente del Probador Virtual. Los campos
 * extendidos (postcode, shop, wedding) solo están presentes cuando la
 * respuesta viene de `/user/profile`; en el JWT inicial vienen sin ellos.
 */
export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string;
  createdAt: string;
  hasAvatar: boolean;
  postcode?: string | null;
  shopId?: number | null;
  shopName?: string | null;
  wedding?: {
    date: string | null;
    place: string | null;
    style: WeddingStyle | null;
    moment: WeddingMoment | null;
  } | null;
}

/**
 * Basic user info from auth response (Phase 1 - Backend API Spec)
 * When hasProfile is true, name and email will be populated
 */
export interface AuthUser {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  createdAt: string;
}

/**
 * Atelier (tienda) público al que el cliente puede vincularse durante el
 * registro. Lo devuelve `GET /shops`.
 */
export interface PublicShop {
  id: number;
  name: string;
}

/**
 * Request to create a new user profile.
 *
 * Paso 1 — obligatorio: name, email, postcode, shopId.
 * Paso 2 — opcional (saltable): weddingDate, weddingPlace, weddingStyle,
 * weddingMoment. El backend ignora los nulos en lugar de fallar.
 */
export interface CreateProfileRequest {
  phone: string;
  name: string;
  email: string;
  postcode: string;
  shopId: number;
  weddingDate?: string | null;
  weddingPlace?: string | null;
  weddingStyle?: WeddingStyle | null;
  weddingMoment?: WeddingMoment | null;
}

/**
 * Response from creating user profile (Phase 1 - Backend returns complete profile)
 *
 * `token` is reissued by the backend (always when profile is completed), so the
 * client should re-login with it. `merged: true` means the backend detected an
 * older customer with the same email and fused both accounts; the returned
 * `user` will be the consolidated one.
 */
export interface CreateProfileResponse {
  success: boolean;
  data: {
    token: string;
    expiresIn: number;
    merged: boolean;
    user: UserProfile;
  };
  message: string;
}

/**
 * Request to update user profile. Todos los campos opcionales — el cliente
 * envía solo los que va a cambiar. Convención de la API en /user/update-profile.
 */
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  postcode?: string;
  shopId?: number;
  weddingDate?: string | null;
  weddingPlace?: string | null;
  weddingStyle?: WeddingStyle | null;
  weddingMoment?: WeddingMoment | null;
}

/**
 * Response from photo upload
 */
export interface UploadPhotoResponse {
  success: boolean;
  photoUrl: string;
  message: string;
}

/**
 * Response from sending verification code (Phase 1 - Backend API Spec)
 */
export interface SendCodeResponse {
  success: boolean;
  data: {
    phoneNumber: string;
    expiresIn: number;
    cooldownSeconds: number;
  };
  message: string;
}

/**
 * Response from verifying code (Phase 1 - Backend API Spec)
 */
export interface VerifyCodeResponse {
  success: boolean;
  data: {
    token: string;
    expiresIn: number;
    hasProfile: boolean;  // Indicates if user has completed profile (name + email)
    hasAvatar: boolean;   // Indicates if user has uploaded/generated an avatar
    user: AuthUser;
  };
  message: string;
}
