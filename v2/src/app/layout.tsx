import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { brand } from '@/lib/brand';
import './globals.css';
import { withBase } from '@/lib/base-path';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  title: { default: `Probador virtual · ${brand.name}`, template: `%s · ${brand.name}` },
  description: 'Crea tu avatar y mira cómo te queda cada vestido o traje en 360°, antes de venir a la tienda.',
  icons: { icon: withBase('/icon.png'), apple: withBase('/icon.png') },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${inter.variable} antialiased`}>
      <body className="min-h-dvh bg-white text-ink">{children}</body>
    </html>
  );
}
