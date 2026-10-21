import { useRef, useState } from 'react';
import { Camera, Check, ImageUp } from 'lucide-react';
import { Sheet } from '@v2/components/sheet';
import { Button, Notice } from '@v2/components/ui';
import { photoToDataUrl } from '@v2/lib/images';
import type { Category, CollectionItem } from '@v2/lib/types';

export interface Partner {
  /** Foto como data URL, lista para el CRM (`partnerImage`). */
  image: string;
  dressId: string;
  dressName: string;
}

const TABS: { id: Category; label: string }[] = [
  { id: 'groom', label: 'Traje' },
  { id: 'bride', label: 'Vestido' },
];

/**
 * Pareja como opción del probador, no como un paso más: una foto suya y qué
 * lleva. Queda activa para las siguientes pruebas hasta que se quita.
 */
export function PartnerSheet({
  open,
  value,
  garments,
  defaultCategory,
  onChange,
  onClose,
}: {
  open: boolean;
  value: Partner | null;
  garments: Record<Category, CollectionItem[]> | null;
  defaultCategory: Category;
  onChange: (partner: Partner | null) => void;
  onClose: () => void;
}) {
  const [image, setImage] = useState<string | null>(value?.image ?? null);
  const [dressId, setDressId] = useState<string | null>(value?.dressId ?? null);
  const [tab, setTab] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const category = tab ?? defaultCategory;
  const list = garments?.[category] ?? null;
  const dress = garments ? [...garments.bride, ...garments.groom].find((g) => g.dressId === dressId) : undefined;

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Elige una foto (JPG, PNG o HEIC).');
    setError(null);
    try {
      setImage(await photoToDataUrl(file));
    } catch {
      setError('No se pudo leer esa foto. Prueba con otra.');
    }
  };

  return (
    <Sheet title="Con tu pareja" open={open} onClose={onClose}>
      <p className="text-[13px] leading-relaxed text-muted">
        Os ponemos juntos en la misma foto y en el vídeo 360°. Solo hace falta una foto suya de cuerpo entero o de cara.
      </p>

      <p className="label-caps mt-5">1 · Su foto</p>
      <div className="mt-2 flex items-center gap-3">
        <span className="relative block h-24 w-[72px] shrink-0 overflow-hidden bg-studio">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- foto local recién elegida
            <img src={image} alt="Foto de tu pareja" className="h-full w-full object-cover" />
          ) : null}
        </span>
        <div className="flex flex-1 flex-col gap-2">
          <Button variant="secondary" onClick={() => cameraRef.current?.click()} className="!h-10 !px-3">
            <Camera className="size-4" strokeWidth={1.5} aria-hidden />
            Hacer foto
          </Button>
          <Button variant="secondary" onClick={() => galleryRef.current?.click()} className="!h-10 !px-3">
            <ImageUp className="size-4" strokeWidth={1.5} aria-hidden />
            Galería
          </Button>
        </div>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={pick} tabIndex={-1} aria-hidden />
        <input ref={galleryRef} type="file" accept="image/*" className="sr-only" onChange={pick} tabIndex={-1} aria-hidden />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="label-caps">2 · Qué lleva</p>
        <div role="tablist" aria-label="Qué lleva tu pareja" className="flex gap-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={category === t.id}
              onClick={() => setTab(t.id)}
              className={`label-caps h-8 ${category === t.id ? 'border-b border-ink text-ink' : 'text-neutral-400'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <ul className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Prendas para tu pareja">
        {(list ?? Array.from({ length: 4 }, () => null)).map((g, i) => (
          <li key={g?.dressId ?? i} className="shrink-0">
            {g ? (
              <button type="button" aria-pressed={dressId === g.dressId} onClick={() => setDressId(g.dressId)} className="block w-[72px] text-left">
                <span className={`relative block aspect-[3/4] bg-studio ${dressId === g.dressId ? 'outline outline-1 outline-offset-2 outline-ink' : ''}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- imagen del catálogo */}
                  <img src={g.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                  {dressId === g.dressId ? (
                    <span className="absolute right-1 top-1 grid size-4 place-items-center bg-white">
                      <Check className="size-3" aria-hidden />
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block truncate text-[10px] uppercase tracking-[0.08em]">{g.name}</span>
              </button>
            ) : (
              <span className="block aspect-[3/4] w-[72px] shimmer" />
            )}
          </li>
        ))}
      </ul>

      {error ? (
        <div className="mt-4">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : null}

      <div className="mt-6 space-y-2">
        <Button
          block
          disabled={!image || !dress}
          onClick={() => {
            if (!image || !dress) return;
            onChange({ image, dressId: dress.dressId, dressName: dress.name });
            onClose();
          }}
        >
          {!image ? 'Falta su foto' : !dress ? 'Elige qué lleva' : value ? 'Guardar cambios' : 'Probar con mi pareja'}
        </Button>
        {value ? (
          <Button
            block
            variant="ghost"
            onClick={() => {
              onChange(null);
              onClose();
            }}
          >
            Quitar a mi pareja
          </Button>
        ) : null}
      </div>
    </Sheet>
  );
}
