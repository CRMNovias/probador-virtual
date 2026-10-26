import { Suspense } from 'react';
import type { Metadata } from 'next';
import { brand } from '@v2/lib/brand';
import { OutletNewAppointment } from '@v2/outlet/booking';
import { SedkaNewAppointment } from '@v2/sedka/booking';
import { BookingFlow } from './booking-flow';

export const metadata: Metadata = { title: 'Pedir cita' };

export default function NuevaCitaPage() {
  return (
    <Suspense fallback={<div className="mx-auto mt-20 h-96 w-[90%] max-w-md shimmer" />}>
      {brand.id === 'sedka' ? <SedkaNewAppointment /> : brand.id === 'outlet' ? <OutletNewAppointment /> : <BookingFlow />}
    </Suspense>
  );
}
