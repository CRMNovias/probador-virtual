/**
 * Favorite (Probador Virtual) related types
 *
 * Cliente marca vestidos (Product) como favoritos. El backend almacena cada
 * favorito como una fila en `ps_likes` con `custom_state_id = 3048`
 * (user_like) y `company_app_id = <probador>`. Así aparece tanto aquí
 * como en la ficha del cliente del CRM.
 */

/**
 * Vestido marcado como favorito por el cliente.
 */
export interface Favorite {
  /** id interno del like (no del producto) */
  id: string;
  /** id del producto/vestido (clave usada por el catálogo externo) */
  dressId: string;
  /** Nombre visible del vestido */
  dressName: string;
  /** URL de la imagen del modelo de try-on (la que pone el catálogo) */
  dressImageUrl: string | null;
  /** Fecha en la que el cliente lo añadió a favoritos */
  createdAt: string | null;
}

/**
 * Respuesta del backend para `GET /favorites`.
 */
export interface FavoritesListResponse {
  success: boolean;
  data: {
    total: number;
    favorites: Favorite[];
  };
}

/**
 * Respuesta del backend para `POST /favorites/toggle`.
 *
 * `favorited` indica el estado **resultante**:
 *   - `true`  → el cliente lo acaba de marcar como favorito.
 *   - `false` → el cliente lo acaba de quitar de favoritos.
 *
 * `favorite` solo viene cuando `favorited === true`.
 */
export interface ToggleFavoriteResponse {
  success: boolean;
  data: {
    favorited: boolean;
    favorite: Favorite | null;
    dressId: string;
  };
  message: string;
}
