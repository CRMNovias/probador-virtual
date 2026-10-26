// El index.html de la V2 en probador-sedka.crmnovias.com: el de este repo es el
// de Atelier (título, icono y vista previa al compartir por WhatsApp). La marca
// de la V2 sale del dominio, pero estas etiquetas las leen antes de cargar nada.
//   node scripts/sedka-index.mjs <ruta a index.html>
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
const LOGO = 'https://sedkanovias.es/wp-content/uploads/2026/04/Logo-Sedka-Novias.webp';
const ICON = 'https://sedkanovias.es/wp-content/uploads/2026/04/Logo-Sedka-Novias-100x100.webp';

const changes = [
  [/Atelier de Bodas/g, 'Sedka Novias'],
  [/https:\/\/probador\.crmnovias\.com\//g, 'https://probador-sedka.crmnovias.com/'],
  [/https:\/\/atelierdebodas\.com\/wp-content\/uploads\/[^"]*logo-atelierdebodas[^"]*/g, LOGO],
  [/<link rel="icon"[^>]*>/, `<link rel="icon" type="image/webp" href="${ICON}" />`],
];

let html = readFileSync(file, 'utf8');
for (const [pattern, value] of changes) {
  // Si una etiqueta cambia en el index de Atelier, se avisa sin parar el despliegue.
  if (!pattern.test(html)) console.warn(`sedka-index: no está ${pattern}`);
  pattern.lastIndex = 0;
  html = html.replace(pattern, value);
}
writeFileSync(file, html);
console.log('sedka-index: index.html con la marca de Sedka');
