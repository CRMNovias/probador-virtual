import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // En producción se sirve en probador.crmnovias.com/v2 (NEXT_PUBLIC_BASE_PATH=/v2); en local, en la raíz.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  cacheComponents: true,
  partialPrefetching: true,
  // El indicador de desarrollo tapa la barra inferior en el móvil.
  devIndicators: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'atelierdebodas.com', pathname: '/wp-content/uploads/**' }],
  },
  turbopack: {
    // La V2 vive en v2/ del repo de la V1, que tiene su propio package-lock: la raíz es esta carpeta.
    root: path.resolve(__dirname),
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
