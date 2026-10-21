import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BottomNav, TopBar } from '@/components/app-shell';
import { Collection } from './collection';

export const metadata: Metadata = { title: 'Colección' };

export default function ColeccionPage() {
  return (
    <>
      <TopBar />
      <main className="pb-nav mx-auto max-w-6xl px-4 lg:px-6 pt-5">
        <Suspense>
          <Collection />
        </Suspense>
      </main>
      <BottomNav />
    </>
  );
}
