import { Suspense } from 'react';
import type { Metadata } from 'next';
import { brand } from '@v2/lib/brand';
import { OutletProbador } from '@v2/outlet/probador';
import { SedkaProbador } from '@v2/sedka/probador';
import { ProbadorScreen } from './probador-screen';

export const metadata: Metadata = { title: 'Probador' };

export default function ProbadorPage() {
  return (
    <Suspense fallback={<div className="h-dvh w-full shimmer" />}>
      {brand.id === 'sedka' ? <SedkaProbador /> : brand.id === 'outlet' ? <OutletProbador /> : <ProbadorScreen />}
    </Suspense>
  );
}
