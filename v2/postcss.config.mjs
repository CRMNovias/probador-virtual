// La V2 procesa Tailwind con Turbopack (next.config.ts), no con PostCSS. Este
// archivo vacío evita que Next use el postcss.config.js de la V1 (raíz del repo).
const config = { plugins: {} };

export default config;
