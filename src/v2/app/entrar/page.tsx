import { Suspense } from 'react';
import type { Metadata } from 'next';
import { FormPage } from '@v2/components/form-page';
import { LoginFlow } from './login-flow';

export const metadata: Metadata = { title: 'Entrar' };

export default function EntrarPage() {
  return (
    <FormPage>
      <Suspense>
        <LoginFlow />
      </Suspense>
    </FormPage>
  );
}
