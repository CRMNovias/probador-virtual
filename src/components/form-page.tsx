import Image from 'next/image';
import type { ReactNode } from 'react';
import { Backdrop } from './backdrop';
import { withBase } from '@/lib/base-path';

const DEMO = withBase('/demo/prueba.jpg');

/**
 * Pantallas de formulario (entrar, datos). En móvil, una columna; en tablet, la
 * columna centrada; en ordenador, una prueba de ejemplo a la izquierda.
 */
export function FormPage({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-2">
      <div className="relative hidden bg-studio lg:block">
        <Backdrop src={DEMO} />
        <Image src={DEMO} alt="" fill sizes="50vw" className="object-contain" />
      </div>
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-10 pt-[max(env(safe-area-inset-top),1.25rem)] md:justify-center lg:px-8 lg:py-12">
        {children}
      </div>
    </main>
  );
}
