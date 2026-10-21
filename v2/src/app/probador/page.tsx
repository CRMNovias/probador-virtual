import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProbadorScreen } from './probador-screen';

export const metadata: Metadata = { title: 'Probador' };

export default function ProbadorPage() {
  return (
    <Suspense fallback={<div className="h-dvh w-full shimmer" />}>
      <ProbadorScreen />
    </Suspense>
  );
}
