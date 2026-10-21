'use client';

import { useEffect, useState } from 'react';

const COLS = 9;
const ROWS = 16;

/**
 * Prolonga el fondo de la imagen hasta los bordes del escenario: lee los
 * bordes izquierdo y derecho fila a fila y pinta un degradado vertical igual.
 * Así el avatar no queda dentro de una caja aunque la IA cambie el tono del
 * gris. Si la imagen no permite leerse (sin CORS), se queda el gris de estudio.
 */
function useEdgeGradient(src: string | null) {
  const [state, setState] = useState<{ src: string | null; gradient: string | null }>({ src: null, gradient: null });

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = COLS;
        canvas.height = ROWS;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, COLS, ROWS);
        const { data } = ctx.getImageData(0, 0, COLS, ROWS);
        const stops = Array.from({ length: ROWS }, (_, y) => {
          const rgb = [0, 1, 2].map((c) => Math.round((data[(y * COLS) * 4 + c]! + data[(y * COLS + COLS - 1) * 4 + c]!) / 2));
          return `rgb(${rgb.join(' ')}) ${Math.round(((y + 0.5) / ROWS) * 100)}%`;
        });
        setState({ src, gradient: `linear-gradient(to bottom, ${stops.join(', ')})` });
      } catch {
        setState({ src, gradient: null });
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return state.src === src ? state.gradient : null;
}

/** Capa de fondo para el escenario; va como primer hijo de un contenedor `relative`. */
export function Backdrop({ src }: { src: string | null }) {
  const gradient = useEdgeGradient(src);
  return <div aria-hidden className="absolute inset-0 bg-studio" style={gradient ? { background: gradient } : undefined} />;
}
