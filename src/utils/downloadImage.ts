/**
 * Download Image Utility
 *
 * Helper functions to download images with watermark
 */

import logoImg from '../assets/images/logo/logo.jpg';

/**
 * Download an image with watermark applied
 *
 * @param imageUrl - URL of the image to download
 * @param filename - Name for the downloaded file (default: 'image.png')
 */
export const downloadImage = async (imageUrl: string, filename: string = 'image.png'): Promise<void> => {
  try {
    console.log('[downloadImage] Starting download with watermark:', { imageUrl, filename });

    // Create a canvas to composite the image with watermark
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Load the main image
    const mainImage = await loadImage(imageUrl);

    // Set canvas size to match image
    canvas.width = mainImage.width;
    canvas.height = mainImage.height;

    // Draw main image
    ctx.drawImage(mainImage, 0, 0);

    // Load and draw watermark
    const watermark = await loadImage(logoImg);

    // Watermark dimensions: 254x90 (original size)
    const watermarkWidth = 254;
    const watermarkHeight = 90;

    // Position: 25px from right and bottom
    const xPosition = canvas.width - watermarkWidth - 25;
    const yPosition = canvas.height - watermarkHeight - 25;

    // Draw watermark with slight transparency
    ctx.globalAlpha = 0.9;
    ctx.drawImage(watermark, xPosition, yPosition, watermarkWidth, watermarkHeight);
    ctx.globalAlpha = 1.0;

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/png');
    });

    // Create download link
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    console.log('[downloadImage] Download successful:', filename);
  } catch (error) {
    console.error('[downloadImage] Download failed:', error);
    throw error;
  }
};

/**
 * Helper function to load an image
 * Uses fetch to bypass CORS issues with S3 images
 */
const loadImage = async (url: string): Promise<HTMLImageElement> => {
  try {
    // For external URLs (S3), fetch as blob first to bypass CORS
    if (url.startsWith('http')) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(blobUrl); // Cleanup
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(blobUrl); // Cleanup
          reject(new Error(`Failed to load image from blob: ${url}`));
        };
        img.src = blobUrl;
      });
    } else {
      // For local images (like the logo), use direct loading
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    }
  } catch (error) {
    throw new Error(`Failed to fetch image: ${url} - ${error}`);
  }
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
