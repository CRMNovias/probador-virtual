import type { ReactNode } from 'react';
import { brand } from '@v2/lib/brand';
import { OutletCardHead, OutletCardScreen } from '@v2/outlet/shell';
import { SedkaCardHead, SedkaCardScreen } from '@v2/sedka/shell';

/**
 * Las pantallas de un solo paso (entrar, tus datos, el avatar): Sedka y Outlet
 * las ponen en una columna centrada con su título, como en sus V1; Atelier, a
 * su manera (foto de ejemplo a la izquierda).
 */
export const cardScreens = brand.id !== 'atelier';

/** Título de la pantalla centrada. `step` («01 / 02») solo lo enseña Outlet. */
export function CardHead({ step, ...props }: { eyebrow: string; title: string; lead?: ReactNode; logo?: boolean; step?: string }) {
  return brand.id === 'outlet' ? <OutletCardHead {...props} {...(step ? { step } : {})} /> : <SedkaCardHead {...props} />;
}

export function CardScreen(props: { children: ReactNode; wide?: boolean; header?: boolean }) {
  return brand.id === 'outlet' ? <OutletCardScreen {...props} /> : <SedkaCardScreen {...props} />;
}
