'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

/**
 * Panel de opciones: hoja inferior en móvil y ventana centrada en tablet y
 * ordenador. Usa <dialog> nativo (foco, Escape y lector de pantalla incluidos).
 */
export function Sheet({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[88dvh] w-full max-w-none overflow-y-auto bg-white p-0 text-ink backdrop:bg-black/40 md:inset-0 md:m-auto md:max-h-[85dvh] md:max-w-lg"
    >
      <div className="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-line bg-white px-4">
        <h2 className="label-caps">{title}</h2>
        <button type="button" onClick={onClose} className="-mr-2 grid size-11 place-items-center" aria-label="Cerrar">
          <X className="size-5" strokeWidth={1.5} aria-hidden />
        </button>
      </div>
      <div className="px-4 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-4">{children}</div>
    </dialog>
  );
}
