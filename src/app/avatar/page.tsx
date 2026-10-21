import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AvatarFlow } from './avatar-flow';

export const metadata: Metadata = { title: 'Tu avatar' };

export default function AvatarPage() {
  return (
    <main>
      <Suspense>
        <AvatarFlow />
      </Suspense>
    </main>
  );
}
