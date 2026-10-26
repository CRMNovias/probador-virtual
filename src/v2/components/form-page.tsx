import Image from 'next/image';
import type { ReactNode } from 'react';
import { Backdrop } from './backdrop';
import { asset } from '@v2/lib/base-path';
import { brand } from '@v2/lib/brand';
import { SedkaCardScreen } from '@v2/sedka/shell';

/** La pareja de la portada (inventada con IA, no son clientas). */
const DEMO = asset('/demo/pareja.jpg');

/**
 * Pantallas de formulario (entrar, datos). En móvil, una columna; en tablet, la
 * columna centrada; en ordenador, la pareja de la portada a la izquierda.
 * Sedka: la tarjeta blanca centrada sobre crema de su V1.
 */
export function FormPage({ children }: { children: ReactNode }) {
  if (brand.id === 'sedka') return <SedkaCardScreen>{children}</SedkaCardScreen>;
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
