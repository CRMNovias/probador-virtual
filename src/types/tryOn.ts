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
  prompt: string; // AI generation prompt (comprehensive prompt with pose and quality specifications)
  poseId?: string; // Optional - for tracking/logging purposes
}
