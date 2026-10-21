import React, { useEffect, useState } from 'react';

const isEmbedded = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

/**
 * Dentro de atelierdebodas.com el probador vive en un iframe de 1000px.
 * El iframe ya lleva allowfullscreen, así que el documento puede ocupar
 * el navegador. Si el móvil no lo permite, se abre el probador aparte.
 */
export const FullscreenButton: React.FC = () => {
  const [embedded] = useState(isEmbedded);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = (): void => setActive(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  if (!embedded && !active) {
    return null;
  }

  const openStandalone = (): void => {
    const opened = window.open(window.location.href, '_blank', 'noopener,noreferrer');
    if (!opened) {
      window.location.assign(window.location.href);
    }
  };

  const toggle = (): void => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }

    const request = document.documentElement.requestFullscreen?.();
    if (!request) {
      openStandalone();
      return;
    }

    request.catch(() => openStandalone());
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed top-3 right-3 z-50 whitespace-nowrap rounded-full border border-black bg-white px-3 py-1.5 text-[11px] font-medium tracking-wide text-black shadow-sm hover:bg-black hover:text-white"
    >
      {active ? 'Salir' : 'Pantalla completa'}
    </button>
  );
};
