import React from 'react';
import type { PhotoReview } from '../../utils/photoQuality.js';

export interface PhotoReviewCardProps {
  previewUrl: string;
  review: PhotoReview;
  onUse: () => void;
  onRetake: () => void;
  busy?: boolean;
}

const VERDICT_LABEL: Record<PhotoReview['verdict'], string> = {
  good: 'La foto sirve',
  weak: 'Se puede mejorar',
  poor: 'Puedes usarla igualmente',
};

export const PhotoReviewCard: React.FC<PhotoReviewCardProps> = ({
  previewUrl,
  review,
  onUse,
  onRetake,
  busy = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-black/10 p-4 md:p-5">
      <div className="flex gap-4 items-start">
        <img
          src={previewUrl}
          alt="Foto para revisar"
          className="w-24 h-32 object-cover rounded-xl bg-gray-100"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">
            Calidad de la foto
          </p>
          <h3 className="text-lg font-serif text-black mb-2">{VERDICT_LABEL[review.verdict]}</h3>
          <ul className="space-y-1">
            {review.notes.map((note) => (
              <li key={note} className="text-sm text-[#333] leading-snug">
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={onRetake}
          disabled={busy}
          className="flex-1 py-3 rounded-xl border border-black text-sm font-medium hover:bg-black/5 disabled:opacity-50"
        >
          Elegir otra
        </button>
        <button
          type="button"
          onClick={onUse}
          disabled={busy}
          className="flex-1 py-3 rounded-xl bg-[#333] text-white text-sm font-medium hover:bg-black disabled:opacity-40"
        >
          {busy ? 'Creando…' : 'Usar esta foto'}
        </button>
      </div>
    </div>
  );
};
