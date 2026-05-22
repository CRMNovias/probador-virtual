/**
 * FilterDropdown
 *
 * Selector minimal con label + opciones (con conteo) para los filtros de
 * las colecciones (Marca, Corte, Color). Estado controlado: el padre
 * mantiene el valor seleccionado y reacciona al `onChange`.
 *
 * - Cierra al hacer click fuera o pulsar Escape.
 * - Una opción especial "Todas/Todos" devuelve `null` para limpiar el filtro.
 */

import React, { useEffect, useRef, useState } from 'react';

export interface FilterOption {
  label: string;
  count?: number;
}

export interface FilterDropdownProps {
  /** Texto cuando no hay valor seleccionado (ej. "Tipo de corte"). */
  label: string;
  /** Opción "todas" (ej. "Todas"). Si se selecciona se emite `null`. */
  allLabel: string;
  options: ReadonlyArray<FilterOption>;
  value: string | null;
  onChange: (next: string | null) => void;
  /** Ancho mínimo del trigger; útil para alinear varios dropdowns. */
  minWidth?: number;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  allLabel,
  options,
  value,
  onChange,
  minWidth = 180,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar con click fuera o Escape
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selectedLabel = value ?? label;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{ minWidth }}
        className={`inline-flex items-center justify-between gap-3 px-4 py-2 text-sm rounded-full border transition-colors ${
          value
            ? 'bg-black text-white border-black'
            : 'bg-white text-black border-gray-300 hover:border-black'
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-2 min-w-full max-h-72 overflow-auto bg-white border border-gray-200 rounded-xl shadow-lg py-1"
        >
          {/* Opción "Todas/Todos" */}
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === null}
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-3 hover:bg-gray-50 ${
                value === null ? 'font-semibold' : ''
              }`}
            >
              <span>{allLabel}</span>
              <span className="text-xs text-gray-400">
                {options.reduce((sum, o) => sum + (o.count ?? 0), 0)}
              </span>
            </button>
          </li>
          {options.map((opt) => {
            const selected = opt.label === value;
            return (
              <li key={opt.label}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(opt.label);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-3 hover:bg-gray-50 ${
                    selected ? 'font-semibold bg-gray-50' : ''
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.count !== undefined && (
                    <span className="text-xs text-gray-400">{opt.count}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
