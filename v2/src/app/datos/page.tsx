import { Suspense } from 'react';
import type { Metadata } from 'next';
import { FormPage } from '@/components/form-page';
import { ProfileForm } from './profile-form';

export const metadata: Metadata = { title: 'Tus datos' };

export default function DatosPage() {
  return (
    <FormPage>
      <Suspense>
        <ProfileForm />
      </Suspense>
    </FormPage>
  );
}
