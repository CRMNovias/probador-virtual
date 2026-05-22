/**
 * WelcomePage
 *
 * Landing page mostrada cuando el usuario NO está autenticado.
 * Split-screen: copy + bullets a la izquierda, hero CTA a la derecha.
 *
 * Ambos botones (Iniciar Sesión / Crear Cuenta) llevan al mismo flujo OTP
 * en /auth — sólo cambia el query param `?mode` por si el AuthPage quiere
 * adaptar el copy en el futuro.
 *
 * Mobile: ambas secciones caben en una sola pantalla sin scroll.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo/logo-atelier-de-bodas.webp';
import { routes } from '../constants/routes.js';

const FEATURES: ReadonlyArray<{ title: string; description: string }> = [
  {
    title: 'Pruébatelo',
    description: 'Genera tu avatar realista y visualiza los modelos.',
  },
  {
    title: 'Inspírate',
    description: 'Descubre los modelos que más te gusten.',
  },
  {
    title: 'Decídete',
    description: 'Reserva tu cita y vive la experiencia al completo en Atelier de Bodas.',
  },
];

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const goToAuth = (mode: 'login' | 'register'): void => {
    navigate(`${routes.AUTH}?mode=${mode}`);
  };

  return (
    <div className="h-screen md:h-auto md:min-h-screen flex flex-col-reverse md:flex-row overflow-hidden md:overflow-visible">
      {/* LEFT (desktop) / BOTTOM (mobile) — Copy */}
      <section className="relative flex-1 px-5 py-5 md:px-16 md:py-14 flex flex-col justify-center bg-white">
        <div className="w-full md:max-w-xl">
          <h1 className="font-serif text-[#1f1f1f] leading-[1.05] text-2xl md:text-4xl lg:text-5xl xl:text-6xl mb-3 md:mb-6">
            ¡El primer paso<br className="hidden xl:inline" /> hasta tu vestido<br className="hidden xl:inline" /> o traje!
          </h1>

          <p className="text-[#4a4a4a] text-xs md:text-lg leading-relaxed w-full md:max-w-md mb-4 md:mb-10">
            Descubre cómo te sientan tus diseños favoritos antes de venir a la
            tienda. Crea tu avatar y haz tu prueba en minutos.
          </p>

          <ul className="space-y-2 md:space-y-6">
            {FEATURES.map((feature) => (
              <li key={feature.title}>
                <h3 className="font-semibold text-[#1f1f1f] text-sm md:text-xl mb-0.5 md:mb-1">
                  {feature.title}
                </h3>
                <p className="text-[#4a4a4a] text-xs md:text-base leading-snug">
                  {feature.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* RIGHT — Hero / CTA */}
      <section className="relative flex-1 flex items-center justify-center px-5 py-5 md:py-10 md:px-12 md:min-h-screen bg-[#f7f7f7]">
        <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
          <p className="tracking-[0.35em] text-[#3a3a3a] text-xs md:text-base mb-2 md:mb-6">
            PROBADOR VIRTUAL
          </p>
          <img
            src={logo}
            alt="Atelier de Bodas"
            width={576}
            height={120}
            className="h-8 md:h-14 w-auto object-contain mb-5 md:mb-12"
            style={{ width: 'auto' }}
          />

          <button
            type="button"
            onClick={() => goToAuth('login')}
            className="w-full bg-[#1f2933] hover:bg-[#0f1620] active:bg-[#000000] text-white font-medium tracking-widest text-xs md:text-sm py-3 md:py-4 rounded-md transition-colors mb-2 md:mb-3 shadow-sm"
          >
            INICIAR SESIÓN
          </button>
          <button
            type="button"
            onClick={() => goToAuth('register')}
            className="w-full bg-white hover:bg-[#f5f5f5] active:bg-[#ececec] text-[#1f2933] font-medium tracking-widest text-xs md:text-sm py-3 md:py-4 rounded-md transition-colors border border-[#1f2933] shadow-sm"
          >
            CREAR CUENTA
          </button>
        </div>
      </section>
    </div>
  );
};
