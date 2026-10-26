import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BottomNav, TopBar } from '@v2/components/app-shell';
import { brand } from '@v2/lib/brand';
import { SedkaAppointments } from '@v2/sedka/booking';
import { Appointments } from './appointments';

export const metadata: Metadata = { title: 'Mis citas' };

export default function CitasPage() {
  if (brand.id === 'sedka') {
    return (
      <Suspense>
        <SedkaAppointments />
      </Suspense>
    );
  }
  return (
    <>
      <TopBar />
      <main className="pb-nav mx-auto max-w-md px-4 pt-6 md:max-w-xl lg:pt-10">
        <h1 className="text-[20px] font-light uppercase leading-tight tracking-[0.06em]">Mis citas</h1>
        <Suspense>
          <Appointments />
        </Suspense>
      </main>
      <BottomNav />
    </>
  );
}
