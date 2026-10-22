import { asset } from './base-path';

/**
 * Fondos del probador. Se mandan al CRM como `backgroundNote` (igual que la
 * V1): la IA genera a la persona dentro de la escena, con su luz y sus
 * sombras, en vez de pegarla sobre una lámina. «Estudio» también va descrito
 * para que el estudio sea real y no la lámina de marca.
 */

export interface Background {
  id: string;
  label: string;
  /** Lo que se le pide a la IA (máx. 180 caracteres, el límite del CRM). */
  note: string;
  image: string;
}

export const BACKGROUNDS: Background[] = [
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
