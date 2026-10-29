/**
 * Selector de vistas de una prueba, en columna al lado de la imagen (no encima:
 * tapaba el resultado): el 360, la foto de frente y las fotos de detalle. Las
 * que se están preparando salen apagadas, con un punto que parpadea.
 */

export interface ViewOption<T extends string> {
  id: T;
  label: string;
  /** Aún no está: no se puede elegir. */
  pending?: boolean;
}

interface ViewSwitchProps<T extends string> {
  options: ViewOption<T>[];
  value: T;
  onChange: (id: T) => void;
}

export function ViewSwitch<T extends string>({ options, value, onChange }: ViewSwitchProps<T>) {
  return (
    // Tocar el selector no hace girar el 360 de debajo.
    <div
      className="z-20 shrink-0"
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
    >
      <div role="tablist" aria-label="Vistas de la prueba" aria-orientation="vertical" className="flex flex-col bg-white/90 p-0.5 shadow-sm">
        {options.map((o) => {
          const selected = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={selected}
              disabled={o.pending}
              onClick={() => {
                onChange(o.id);
              }}
              className={`label-caps inline-flex h-8 items-center gap-1.5 px-2.5 text-left !text-[10px] !tracking-[0.1em] ${
                selected ? 'bg-accent text-white' : o.pending ? 'text-ink/35' : 'text-ink'
              }`}
            >
              {o.pending ? <span className="size-1 animate-pulse bg-current" aria-hidden /> : null}
              {o.label}
              {o.pending ? <span className="sr-only"> (preparándose)</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
