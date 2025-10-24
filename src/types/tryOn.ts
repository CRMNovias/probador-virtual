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
 * Response from try-on generation
 */
export interface UploadTryOnResponse {
  success: boolean;
  tryOnId: string;
  imageUrl: string;
  createdAt: string;
  status: 'processing' | 'ready' | 'failed';
}

/**
 * Request to generate try-on
 */
export interface GenerateTryOnRequest {
  dressId: string;
  poseId?: string; // Optional - can use prompt instead
  prompt?: string; // Optional - AI generation prompt for custom poses
}
