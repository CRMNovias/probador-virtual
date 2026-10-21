import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BottomNav, TopBar } from '@/components/app-shell';
import { MyTryOns } from './my-try-ons';

export const metadata: Metadata = { title: 'Mis pruebas' };

export default function MisPruebasPage() {
  return (
    <>
      <TopBar />
      <main className="pb-nav mx-auto max-w-6xl px-4 pt-6 lg:px-6 lg:pt-10">
        <h1 className="text-[20px] font-light uppercase leading-tight tracking-[0.06em]">Mis pruebas</h1>
        <p className="mt-1 text-[13px] text-muted">Todo lo que te has probado sobre tu avatar, lo más reciente primero.</p>
        <Suspense>
          <MyTryOns />
        </Suspense>
      </main>
      <BottomNav />
    </>
  );
}
