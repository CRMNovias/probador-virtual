/**
 * Dress-related types
 * 
 * Interfaces for dress catalog items
 */

/**
 * Wedding dress item
 */
export interface Dress {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  designer?: string;
  collection?: string;
  available: boolean;
}

/**
 * Dress category/collection
 */
export interface DressCollection {
  id: string;
  name: string;
  description: string;
  dresses: Dress[];
}

// ============================================================
// Catálogo "Colecciones" (Novia / Novio)
// ============================================================

/** Marca disponible en el filtro de la colección Novia. */
export interface CollectionBrand {
  label: string;
  count: number;
}

/** Producto individual de la colección. */
export interface CollectionItem {
  /** ID del producto en CRM — sirve como `dressId` en el flujo try-on. */
  dressId: string;
  /** ID en WordPress, por si se necesita para enlazar a la web pública. */
  wpId: number;
  name: string;
  brand: string;
  cut: string | null;
  color: string | null;
  imageUrl: string;
}

/** Respuesta paginada del listado. */
export interface CollectionListResponse {
  data: CollectionItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}
