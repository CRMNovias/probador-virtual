import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@config': path.resolve(__dirname, './src/config'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types/index'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@assets': path.resolve(__dirname, './src/assets'),
      // Probador V2 (src/v2, en /v2): sus importaciones de Next van a equivalentes con React Router.
      '@v2': path.resolve(__dirname, './src/v2'),
      'next/link': path.resolve(__dirname, './src/v2/next/link.tsx'),
      'next/navigation': path.resolve(__dirname, './src/v2/next/navigation.ts'),
      'next/image': path.resolve(__dirname, './src/v2/next/image.tsx'),
      next: path.resolve(__dirname, './src/v2/next/index.ts'),
    },
  },

  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'probador.crmnovias.com',
      '.crmnovias.com', // Allow all subdomains
    ],
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer-motion': ['framer-motion'],
        },
      },
    },
  },

  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: true,
  },
});
