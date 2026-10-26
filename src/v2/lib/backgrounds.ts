import { asset } from './base-path';
import { brand } from './brand';

/**
 * Fondos del probador. Se mandan al CRM como `backgroundNote` (igual que la
 * V1): la IA genera a la persona dentro de la escena, con su luz y sus
 * sombras, en vez de pegarla sobre una lámina. «Estudio» también va descrito
 * para que el estudio sea real y no la lámina de marca. Cada marca tiene los
 * suyos: los de Sedka van con su estudio azul marino y escenas propias.
 */

export interface Background {
  id: string;
  label: string;
  /** Lo que se le pide a la IA (máx. 180 caracteres, el límite del CRM). */
  note: string;
  image: string;
}

const ATELIER_BACKGROUNDS: Background[] = [
  {
    id: 'estudio',
    label: 'Estudio',
    // Sin nombrar focos ni softbox: si se nombran, la IA los dibuja en la foto.
    note: 'Un fondo continuo de estudio fotográfico, gris cálido claro, con el suelo del mismo tono, luz suave y difusa; solo el fondo liso, sin focos, lámparas, objetos ni texto.',
    image: asset('/backgrounds/estudio.webp'),
  },
  {
    id: 'playa',
    label: 'Playa',
    note: 'Una playa mediterránea tranquila al atardecer, arena clara y mar en calma detrás, luz dorada suave, sin gente ni texto.',
    image: asset('/backgrounds/playa.webp'),
  },
  {
    id: 'campo',
    label: 'Campo',
    note: 'Un campo abierto de espigas doradas al atardecer, horizonte suave y cielo despejado, sin gente ni texto.',
    image: asset('/backgrounds/campo.webp'),
  },
  {
    id: 'catedral',
    label: 'Catedral',
    note: 'El interior luminoso de una catedral gótica, pasillo central de piedra y vidrieras, luz cálida, sin gente ni texto.',
    image: asset('/backgrounds/catedral.webp'),
  },
  {
    id: 'jardin',
    label: 'Jardín',
    note: 'Un jardín romántico de día con césped, setos y rosales blancos, luz natural suave, sin gente ni texto.',
    image: asset('/backgrounds/jardin.webp'),
  },
  {
    id: 'finca',
    label: 'Finca',
    note: 'El patio de una finca andaluza con paredes encaladas, buganvillas y suelo de barro, luz de tarde, sin gente ni texto.',
    image: asset('/backgrounds/finca.webp'),
  },
];

const SEDKA_BACKGROUNDS: Background[] = [
  {
    id: 'estudio',
    label: 'Estudio',
    // El azul de las láminas de Sedka (avatar y V1), como estudio de verdad.
    note: 'Un fondo continuo de estudio fotográfico azul marino profundo, con el suelo del mismo tono, luz suave y difusa; solo el fondo liso, sin focos, lámparas, objetos ni texto.',
    image: asset('/backgrounds/sedka/estudio.webp'),
  },
  {
    id: 'boutique',
    label: 'Boutique',
    note: 'El interior de una boutique de novias elegante con una escalera de caracol dorada, paredes claras y luz cálida, sin gente ni texto.',
    image: asset('/backgrounds/sedka/boutique.webp'),
  },
  {
    id: 'palacio',
    label: 'Palacio',
    note: 'Un salón de palacio con lámparas de araña de cristal, molduras doradas y suelo de mármol, luz cálida, sin gente ni texto.',
    image: asset('/backgrounds/sedka/palacio.webp'),
  },
  {
    id: 'ciudad',
    label: 'Ciudad',
    note: 'Una calle señorial de ciudad europea con edificios clásicos de piedra clara, balcones de hierro y adoquines, luz suave de mañana, sin gente ni texto.',
    image: asset('/backgrounds/sedka/ciudad.webp'),
  },
  {
    id: 'terraza',
    label: 'Terraza',
    note: 'Una terraza de piedra con balaustrada sobre el mar Mediterráneo en calma, cielo azul despejado, luz de mediodía, sin gente ni texto.',
    image: asset('/backgrounds/sedka/terraza.webp'),
  },
  {
    id: 'invernadero',
    label: 'Invernadero',
    note: 'Un invernadero de hierro y cristal lleno de plantas verdes y helechos, suelo de baldosas, luz natural difusa, sin gente ni texto.',
    image: asset('/backgrounds/sedka/invernadero.webp'),
  },
];

export const BACKGROUNDS = brand.id === 'sedka' ? SEDKA_BACKGROUNDS : ATELIER_BACKGROUNDS;

export const DEFAULT_BACKGROUND = BACKGROUNDS[0]!;
export const CUSTOM_BACKGROUND_MAX = 180;

/** El fondo elegido: uno de la lista o el que describe la clienta. */
export type BackgroundChoice = { id: string; custom?: string };

export const backgroundNote = (choice: BackgroundChoice) =>
  choice.id === 'custom'
    ? (choice.custom ?? '').trim().slice(0, CUSTOM_BACKGROUND_MAX)
    : (BACKGROUNDS.find((b) => b.id === choice.id) ?? DEFAULT_BACKGROUND).note;

export const backgroundLabel = (choice: BackgroundChoice) =>
  choice.id === 'custom' ? 'Personalizado' : (BACKGROUNDS.find((b) => b.id === choice.id) ?? DEFAULT_BACKGROUND).label;
