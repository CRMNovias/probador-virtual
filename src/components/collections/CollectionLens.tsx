/**
 * Novia / Novio dentro de una sola colección.
 * Cromado de Atelier: pastilla negra, bordes redondeados.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../constants/routes.js';

export interface CollectionLensProps {
  active: 'bride' | 'groom';
}

export const CollectionLens: React.FC<CollectionLensProps> = ({ active }) => {
  const navigate = useNavigate();

  const itemClass = (on: boolean): string =>
    `px-5 py-2 text-xs tracking-[0.18em] font-medium rounded-md transition-colors ${
      on ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-black/5'
    }`;

  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-lg border border-black bg-white"
      role="tablist"
      aria-label="Colección"
    >
      <button
        type="button"
        role="tab"
        aria-selected={active === 'bride'}
        className={itemClass(active === 'bride')}
        onClick={() => navigate(routes.COLLECTIONS_BRIDE)}
      >
        NOVIA
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === 'groom'}
        className={itemClass(active === 'groom')}
        onClick={() => navigate(routes.COLLECTIONS_GROOM)}
      >
        NOVIO
      </button>
    </div>
  );
};
