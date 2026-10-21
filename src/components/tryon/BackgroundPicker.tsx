import React from 'react';
import { BACKGROUND_CHOICES } from '../../constants/backgrounds.js';

export interface BackgroundPickerProps {
  value: string;
  custom: string;
  onChange: (id: string) => void;
  onCustom: (text: string) => void;
}

/**
 * El fondo de marca sigue siendo la opción Atelier.
 * El resto sustituye ese fondo por lo que indica la persona.
 */
export const BackgroundPicker: React.FC<BackgroundPickerProps> = ({
  value,
  custom,
  onChange,
  onCustom,
}) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2">Fondo</p>
    <div className="flex flex-wrap gap-2">
      {BACKGROUND_CHOICES.map((choice) => {
        const selected = value === choice.id;
        return (
          <button
            key={choice.id}
            type="button"
            onClick={() => onChange(choice.id)}
            className={`px-3 py-1.5 rounded-full text-xs tracking-wide border transition-colors ${
              selected
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-black/20 hover:border-black'
            }`}
          >
            {choice.label}
          </button>
        );
      })}
    </div>
    {value === 'custom' && (
      <input
        type="text"
        value={custom}
        maxLength={180}
        onChange={(event) => onCustom(event.target.value)}
        placeholder="Describe el fondo: una terraza al atardecer, un claustro…"
        className="mt-3 w-full border border-black/20 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"
      />
    )}
  </div>
);
