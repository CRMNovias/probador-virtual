import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BottomNav, TopBar } from '@v2/components/app-shell';
import { Favorites } from './favorites';

export const metadata: Metadata = { title: 'Favoritos' };

export default function FavoritosPage() {
  return (
    <>
      <TopBar />
      <main className="pb-nav mx-auto max-w-6xl px-4 pt-6 lg:px-6 lg:pt-10">
        <h1 className="text-[20px] font-light uppercase leading-tight tracking-[0.06em]">Favoritos</h1>
        <p className="mt-1 text-[13px] text-muted">Los modelos que te gustan, para probártelos o enseñarlos en tu cita.</p>
        <Suspense>
          <Favorites />
        </Suspense>
      </main>
      <BottomNav />
    </>
  );
}
