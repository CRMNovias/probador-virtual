/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8C6F5A',
          hover: '#7a5f4d',
        },
        secondary: {
          DEFAULT: '#D4C8BE',
        },
        background: {
          DEFAULT: '#F8F7F5',
        },
        text: {
          primary: '#4a3f35',
          secondary: '#6e5f53',
        },
        neutral: {
          DEFAULT: '#EAE0D5',
        },
        white: '#FFFFFF',
        error: '#EF4444',
        success: '#10B981',
        // Probador V2 (src/v2): los colores de cada marca, en variables de
        // src/v2/v2.css (por defecto, los de Atelier: blanco, negro y gris de estudio).
        ivory: 'rgb(var(--v2-ivory, 255 255 255) / <alpha-value>)',
        studio: 'rgb(var(--v2-studio, 236 234 231) / <alpha-value>)',
        sand: 'rgb(var(--v2-studio, 236 234 231) / <alpha-value>)',
        line: 'rgb(var(--v2-line, 226 226 226) / <alpha-value>)',
        ink: 'rgb(var(--v2-ink, 0 0 0) / <alpha-value>)',
        muted: 'rgb(var(--v2-muted, 107 107 107) / <alpha-value>)',
        // Botones y lo elegido: negro en Atelier, dorado en Sedka.
        accent: {
          DEFAULT: 'rgb(var(--v2-accent, 0 0 0) / <alpha-value>)',
          dark: 'rgb(var(--v2-accent-dark, 38 38 38) / <alpha-value>)',
        },
        danger: '#b3261e',
      },
      // Probador V2: pantalla ancha y apaisada (ordenador, tablet en horizontal).
      // Una pantalla ancha pero vertical (tablet de pie) va como el móvil.
      screens: {
        wide: { raw: '(min-width: 1024px) and (orientation: landscape)' },
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      fontFamily: {
        sans: [
          'Montserrat',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        // El alias "serif" antes apuntaba a Playfair Display, pero el branding
        // unifica toda la tipografía en Montserrat. Mantenemos la clave por
        // compatibilidad con los componentes que usan `font-serif`, pero la
        // fuente real es Montserrat. Si en el futuro volvemos a una serif,
        // restauramos aquí Playfair Display.
        serif: [
          'Montserrat',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    // Probador V2: etiqueta en mayúsculas espaciadas (secciones, botones, pestañas).
    ({ addUtilities }) =>
      addUtilities({
        '.label-caps': {
          'font-size': '12px',
          'font-weight': '500',
          'letter-spacing': '0.12em',
          'text-transform': 'uppercase',
        },
      }),
  ],
}
