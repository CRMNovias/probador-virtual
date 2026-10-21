/**
 * Try-On related types
 * 
 * Interfaces for virtual try-on generation and gallery
 */

/**
 * Virtual try-on record
 */
export interface TryOn {
  id: string;
  userId: string;
  dressId: string;
  poseId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
  status: 'processing' | 'ready' | 'failed';
}

/**
 * Try-on image with metadata
 */
export interface TryOnImage {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  poseId: string;
  poseName: string;
  createdAt: string;
}

/**
 * Try-on images grouped by dress
 */
export interface TryOnCategory {
  dressId: string;
  dressName: string;
  dressImageUrl: string;
  tryOns: TryOnImage[];
}

/**
 * Response from try-on generation (Backend API structure)
 */
export interface UploadTryOnResponse {
  success: boolean;
  data: {
    id: string;           // Backend uses 'id' instead of 'tryOnId'
    userId: string;
    dressId: string;
    imageUrl: string;
    thumbnailUrl?: string;
    createdAt: string;
  };
  message: string;
}

/**
 * Request to generate try-on
 */
export interface GenerateTryOnRequest {
  dressId: string;
  prompt: string;
  poseId?: string;
  /** Sustituye el fondo de marca cuando la persona indica una escena. */
  backgroundNote?: string;
  partnerDressId?: string;
  partnerPhone?: string;
  /** Data URL o base64 de la foto de la pareja. */
  partnerImage?: string;
  /** Probador V2: el CRM hace el 360 y, con la plantilla de vídeo, lo manda por WhatsApp en lugar de la foto. */
  deliverVideo?: boolean;
}
