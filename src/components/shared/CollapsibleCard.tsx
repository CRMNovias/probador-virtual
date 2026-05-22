/**
 * CollapsibleCard
 *
 * Card con cabecera clicable y contenido expansible. Diseñada para reducir
 * ruido visual en pantallas con muchos paneles secundarios (try-on, ajustes...).
 *
 * Por defecto arranca cerrada. El padre puede forzar `defaultOpen={true}`
 * cuando es razonable mantenerla abierta inicialmente.
 */

import React, { useState } from 'react';

export interface CollapsibleCardProps {
  /** Etiqueta corta de cabecera (ej. "Tu avatar", "Elige una pose"). */
  label: string;
  /** Contenido renderizado cuando está abierta. */
  children: React.ReactNode;
  /** Estado inicial de apertura. Default: false (cerrada). */
  defaultOpen?: boolean;
  /** Clases extra para el contenedor exterior. */
  className?: string;
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  label,
  children,
  defaultOpen = false,
  className = '',
}) => {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  return (
    <div
      className={`bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-white/40 overflow-hidden ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-5 py-3 text-left hover:bg-black/[0.02] transition-colors"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
          {label}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5 pt-0">{children}</div>}
    </div>
  );
};
