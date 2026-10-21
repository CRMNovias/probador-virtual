import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BookingFlow } from './booking-flow';

export const metadata: Metadata = { title: 'Pedir cita' };

export default function NuevaCitaPage() {
  return (
    <Suspense fallback={<div className="mx-auto mt-20 h-96 w-[90%] max-w-md shimmer" />}>
      <BookingFlow />
    </Suspense>
  );
}
