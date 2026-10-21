import { useState } from 'react';
import { Check } from 'lucide-react';
import { Sheet } from '@v2/components/sheet';
import { Button } from '@v2/components/ui';
import { BACKGROUNDS, CUSTOM_BACKGROUND_MAX, type BackgroundChoice } from '@v2/lib/backgrounds';

/** Elegir dónde te ves: cinco escenas de boda, el estudio o la que describas. */
export function BackgroundSheet({
  open,
  value,
  onChange,
  onClose,
}: {
  open: boolean;
  value: BackgroundChoice;
  onChange: (choice: BackgroundChoice) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(value.custom ?? '');
  const choose = (choice: BackgroundChoice) => {
    onChange(choice);
    onClose();
  };

  return (
    <Sheet title="Fondo" open={open} onClose={onClose}>
      <p className="text-[13px] leading-relaxed text-muted">
        Te ponemos dentro de la escena, con su luz y sus sombras, y así sale también en el vídeo 360°.
      </p>
      <ul className="mt-4 grid grid-cols-3 gap-2">
        {BACKGROUNDS.map((b) => {
          const on = value.id === b.id;
          return (
            <li key={b.id}>
              <button type="button" aria-pressed={on} onClick={() => choose({ id: b.id })} className="block w-full text-left">
                <span className={`relative block aspect-[3/4] overflow-hidden bg-studio ${on ? 'outline outline-1 outline-offset-2 outline-ink' : ''}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- miniatura local ya optimizada */}
                  <img src={b.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                  {on ? (
                    <span className="absolute right-1 top-1 grid size-5 place-items-center bg-white">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                  ) : null}
                </span>
                <span className="mt-1.5 block text-[11px] uppercase tracking-[0.08em]">{b.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 border-t border-line pt-4">
        <label htmlFor="custom-background" className="label-caps block">
          O descríbelo tú
        </label>
        <textarea
          id="custom-background"
          rows={2}
          maxLength={CUSTOM_BACKGROUND_MAX}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Por ejemplo: un viñedo al atardecer con luces colgantes"
          className="mt-2 w-full resize-none border-0 border-b border-neutral-300 bg-transparent px-0 py-2 text-base outline-none placeholder:text-neutral-400 focus:border-ink"
        />
        <p className="text-right text-[11px] text-muted">
          {text.length}/{CUSTOM_BACKGROUND_MAX}
        </p>
        <Button
          block
          variant={value.id === 'custom' ? 'primary' : 'secondary'}
          className="mt-2"
          disabled={text.trim().length < 6}
          onClick={() => choose({ id: 'custom', custom: text.trim() })}
        >
          Usar este fondo
        </Button>
      </div>
    </Sheet>
  );
}
