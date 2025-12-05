/**
 * Download Image Utility
 *
 * Helper functions to download images with watermark
 */

import logoImg from '../assets/images/logo/logo.jpg';

/**
 * Download an image with watermark applied
 * Uses canvas to composite watermark onto the image
 *
 * @param imageUrl - URL of the image to download
 * @param filename - Name for the downloaded file (default: 'image.png')
 */
export const downloadImage = async (imageUrl: string, filename: string = 'image.png'): Promise<void> => {
  try {
    console.log('[downloadImage] Starting download with watermark:', { imageUrl, filename });

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Load main image with CORS
    const mainImage = await loadImageWithCORS(imageUrl);

    // Set canvas size
    canvas.width = mainImage.width;
    canvas.height = mainImage.height;

    // Draw main image
    ctx.drawImage(mainImage, 0, 0);

    // Load watermark (local file, no CORS issues)
    const watermark = await loadImageWithCORS(logoImg);

    // Watermark dimensions: 254x90 (original size)
    const watermarkWidth = 254;
    const watermarkHeight = 90;

    // Position: 25px from right and bottom
    const xPosition = canvas.width - watermarkWidth - 25;
    const yPosition = canvas.height - watermarkHeight - 25;

    // Draw watermark with transparency
    ctx.globalAlpha = 0.9;
    ctx.drawImage(watermark, xPosition, yPosition, watermarkWidth, watermarkHeight);
    ctx.globalAlpha = 1.0;

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create blob');
      }

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      console.log('[downloadImage] Download successful:', filename);
    }, 'image/png');

  } catch (error) {
    console.error('[downloadImage] Download failed:', error);

    // Fallback: try direct download without watermark
    console.log('[downloadImage] Attempting fallback: direct download without watermark');
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('[downloadImage] Fallback download triggered');
    } catch (fallbackError) {
      console.error('[downloadImage] Fallback also failed:', fallbackError);
      throw error;
    }
  }
};

/**
 * Load an image with proper CORS handling
 */
const loadImageWithCORS = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // Set crossOrigin BEFORE setting src
    // Use 'anonymous' for public S3 buckets
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));

    // Set src after configuring crossOrigin
    img.src = url;
  });
};

/**
 * Generate a filename for a try-on image
 *
 * @param tryOnId - Try-on ID
 * @param dressId - Dress ID (optional)
 * @returns Formatted filename
 */
export const generateTryOnFilename = (tryOnId: string, dressId?: string): string => {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  if (dressId) {
    return `tryon-${dressId}-${tryOnId}-${timestamp}.png`;
  }
  return `tryon-${tryOnId}-${timestamp}.png`;
};

/**
 * Generate a filename for an avatar image
 *
 * @returns Formatted filename
 */
export const generateAvatarFilename = (): string => {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `avatar-${timestamp}.png`;
};
