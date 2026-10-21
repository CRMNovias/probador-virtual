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
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
