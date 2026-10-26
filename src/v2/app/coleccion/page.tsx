import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BottomNav, TopBar } from '@v2/components/app-shell';
import { brand } from '@v2/lib/brand';
import { SedkaCollection } from '@v2/sedka/collection';
import { OutletCollection } from '@v2/outlet/collection';
import { Collection } from './collection';

export const metadata: Metadata = { title: 'Colección' };

export default function ColeccionPage() {
  if (brand.id === 'sedka' || brand.id === 'outlet') {
    return <Suspense>{brand.id === 'sedka' ? <SedkaCollection /> : <OutletCollection />}</Suspense>;
  }
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
