import React, { useState } from 'react';

const ATELIER_PAGE = 'https://atelierdebodas.com/probador-virtual/';

const isEmbedded = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

/**
 * El probador va en un iframe de atelierdebodas.com. Si el propio iframe
 * pide pantalla completa, el navegador muestra probador.crmnovias.com.
 * Por eso se abre la página de Atelier, no el dominio del CRM.
 */
export const FullscreenButton: React.FC = () => {
  const [embedded] = useState(isEmbedded);

  if (!embedded) {
    return null;
  }

  const openOnAtelier = (): void => {
    const width = window.screen?.availWidth ?? 1280;
    const height = window.screen?.availHeight ?? 800;
    const opened = window.open(
      ATELIER_PAGE,
      'atelier-probador',
      `popup=yes,width=${width},height=${height},left=0,top=0`,
    );
    if (!opened) {
      window.open(ATELIER_PAGE, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button
      type="button"
      onClick={openOnAtelier}
      className="fixed top-3 right-3 z-50 whitespace-nowrap rounded-full border border-black bg-white px-3 py-1.5 text-[11px] font-medium tracking-wide text-black shadow-sm hover:bg-black hover:text-white"
    >
      Pantalla completa
    </button>
  );
};
