/**
 * Download Image Utility
 *
 * Helper function to download images from URLs
 */

/**
 * Download an image from a URL
 *
 * @param imageUrl - URL of the image to download
 * @param filename - Name for the downloaded file (default: 'image.png')
 */
export const downloadImage = async (imageUrl: string, filename: string = 'image.png'): Promise<void> => {
  try {
    console.log('[downloadImage] Starting download:', { imageUrl, filename });

    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    // Get the blob
    const blob = await response.blob();

    // Create a temporary URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger download
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
