import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BottomNav, TopBar } from '@v2/components/app-shell';
import { brand } from '@v2/lib/brand';
import { SedkaAppointments } from '@v2/sedka/booking';
import { OutletAppointments } from '@v2/outlet/booking';
import { Appointments } from './appointments';

export const metadata: Metadata = { title: 'Mis citas' };

export default function CitasPage() {
  if (brand.id === 'sedka' || brand.id === 'outlet') {
    return <Suspense>{brand.id === 'sedka' ? <SedkaAppointments /> : <OutletAppointments />}</Suspense>;
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
