/**
 * Reduce una foto a JPEG (lado mayor `maxSide`) y la devuelve como data URL,
 * el formato en que el CRM recibe la foto de la pareja. Una foto de móvil de
 * 4 MB se queda en unos cientos de KB sin perder lo que la IA necesita.
 */
export async function photoToDataUrl(file: File, maxSide = 1536): Promise<string> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.9);
}
