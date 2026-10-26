import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BottomNav, TopBar } from '@v2/components/app-shell';
import { brand } from '@v2/lib/brand';
import { SedkaProfile } from '@v2/sedka/profile';
import { OutletProfile } from '@v2/outlet/profile';
import { ProfileScreen } from './profile-screen';

export const metadata: Metadata = { title: 'Perfil' };

export default function PerfilPage() {
  if (brand.id === 'sedka' || brand.id === 'outlet') {
    return <Suspense>{brand.id === 'sedka' ? <SedkaProfile /> : <OutletProfile />}</Suspense>;
  }
  return (
    <>
      <TopBar />
      <main className="pb-nav mx-auto max-w-md px-4 pt-6 md:max-w-xl lg:max-w-5xl lg:px-6 lg:pt-10">
        <h1 className="text-[20px] font-light uppercase leading-tight tracking-[0.06em]">Perfil</h1>
        <Suspense>
          <ProfileScreen />
        </Suspense>
      </main>
      <BottomNav />
    </>
  );
}
