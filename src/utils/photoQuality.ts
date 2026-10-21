/**
 * Revisión de la foto antes de crear el avatar.
 * No llama a la IA: mide tamaño, encuadre y luz para avisar
 * de selfies a oscuras o recortes flojos. El aviso no impide seguir.
 */

export type PhotoVerdict = 'good' | 'weak' | 'poor';

export interface PhotoReview {
  verdict: PhotoVerdict;
  width: number;
  height: number;
  notes: string[];
}

export const judgePhoto = (
  width: number,
  height: number,
  light: number,
  bytes: number,
): PhotoReview => {
  const notes: string[] = [];
  let poor = false;
  let weak = false;
  const shortSide = Math.min(width, height);
  const longSide = Math.max(width, height);
  // Un JPEG de cientos de KB no cabe en 400 px. Si el navegador
  // devuelve eso, ha leído una miniatura (iCloud, HEIC) y no el original.
  const measurementLooksWrong = shortSide > 0 && shortSide < 500 && bytes > 350_000;

  if (width < 1 || height < 1 || measurementLooksWrong) {
    notes.push('Puedes usarla. Si el avatar sale borroso, elige la foto original y espera a que se descargue.');
    weak = true;
  } else if (shortSide < 480) {
    notes.push(
      `Hemos recibido ${width}×${height} px. Si puedes, elige la foto original: en Fotos, ábrela y espera a que baje de iCloud.`,
    );
    poor = true;
  } else if (shortSide < 800 || longSide < 1000) {
    notes.push('Se verá mejor con un poco más de resolución.');
    weak = true;
  }

  if (width > 1 && height > 1 && width > height * 1.15) {
    notes.push('Está en horizontal. Mejor de frente, en vertical, de la cabeza a los hombros.');
    weak = true;
  }

  if (!measurementLooksWrong && width > 1 && height > 1) {
    if (light < 45) {
      notes.push('Está oscura. Busca luz de frente, de día, sin contraluz.');
      weak = true;
    } else if (light > 225) {
      notes.push('Está muy quemada. Evita el flash directo a la cara.');
      weak = true;
    }
  }

  if (!poor && !weak) {
    notes.push('Cara visible, luz suficiente y tamaño correcto.');
  }

  return {
    verdict: poor ? 'poor' : weak ? 'weak' : 'good',
    width,
    height,
    notes,
  };
};

const averageLuminance = (source: CanvasImageSource, width: number, height: number): number => {
  const canvas = document.createElement('canvas');
  const size = 24;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx || width < 1 || height < 1) return 128;
  ctx.drawImage(source, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  let total = 0;
  const pixels = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i] ?? 0;
    const green = data[i + 1] ?? 0;
    const blue = data[i + 2] ?? 0;
    total += 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  }
  return total / pixels;
};

const inspectWithBitmap = async (file: File): Promise<{ width: number; height: number; light: number }> => {
  const bitmap = await createImageBitmap(file);
  try {
    return {
      width: bitmap.width,
      height: bitmap.height,
      light: averageLuminance(bitmap, bitmap.width, bitmap.height),
    };
  } finally {
    bitmap.close();
  }
};

const inspectWithImage = (file: File): Promise<{ width: number; height: number; light: number }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      const light = averageLuminance(image, width, height);
      URL.revokeObjectURL(url);
      resolve({ width, height, light });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen'));
    };
    image.src = url;
  });

export const reviewPhoto = async (file: File): Promise<PhotoReview> => {
  try {
    const inspected = typeof createImageBitmap === 'function'
      ? await inspectWithBitmap(file)
      : await inspectWithImage(file);
    return judgePhoto(inspected.width, inspected.height, inspected.light, file.size);
  } catch {
    try {
      const inspected = await inspectWithImage(file);
      return judgePhoto(inspected.width, inspected.height, inspected.light, file.size);
    } catch {
      return judgePhoto(0, 0, 128, file.size);
    }
  }
};
