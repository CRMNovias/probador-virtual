// El index.html de la V2 en el probador de otra marca (probador-sedka y
// probador-outlet.crmnovias.com): el de este repo es el de Atelier (título,
// icono y vista previa al compartir por WhatsApp). La marca de la V2 sale del
// dominio, pero estas etiquetas las leen antes de cargar nada.
//   node scripts/marca-index.mjs <sedka|outlet> <ruta a index.html>
import { readFileSync, writeFileSync } from 'node:fs';

const BRANDS = {
  sedka: {
    name: 'Sedka Novias',
    host: 'probador-sedka.crmnovias.com',
    logo: 'https://sedkanovias.es/wp-content/uploads/2026/04/Logo-Sedka-Novias.webp',
    icon: '<link rel="icon" type="image/webp" href="https://sedkanovias.es/wp-content/uploads/2026/04/Logo-Sedka-Novias-100x100.webp" />',
  },
  outlet: {
    name: 'Outlet Nupcial',
    host: 'probador-outlet.crmnovias.com',
    logo: 'https://outletnupcial.com/wp-content/uploads/2025/01/cropped-1-1.png',
    icon: '<link rel="icon" type="image/png" href="https://outletnupcial.com/wp-content/uploads/2025/01/cropped-1-removebg-32x32.png" />',
  },
};

const [id, file] = process.argv.slice(2);
const brand = BRANDS[id];
if (!brand || !file) {
  console.error('marca-index: node scripts/marca-index.mjs <sedka|outlet> <index.html>');
  process.exit(1);
}

const changes = [
  [/Atelier de Bodas/g, brand.name],
  [/https:\/\/probador\.crmnovias\.com\//g, `https://${brand.host}/`],
  [/https:\/\/atelierdebodas\.com\/wp-content\/uploads\/[^"]*logo-atelierdebodas[^"]*/g, brand.logo],
  [/<link rel="icon"[^>]*>/, brand.icon],
];

let html = readFileSync(file, 'utf8');
for (const [pattern, value] of changes) {
  // Si una etiqueta cambia en el index de Atelier, se avisa sin parar el despliegue.
  if (!pattern.test(html)) console.warn(`marca-index: no está ${pattern}`);
  pattern.lastIndex = 0;
  html = html.replace(pattern, value);
}
writeFileSync(file, html);
console.log(`marca-index: index.html con la marca de ${brand.name}`);
