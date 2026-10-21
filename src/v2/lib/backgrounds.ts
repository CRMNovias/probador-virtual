import { withBase } from './base-path';

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
    note: 'Un estudio fotográfico profesional con fondo continuo gris cálido claro y suelo del mismo tono, luz suave de softbox, sin objetos ni texto.',
    image: withBase('/backgrounds/estudio.webp'),
  },
  {
    id: 'playa',
    label: 'Playa',
    note: 'Una playa mediterránea tranquila al atardecer, arena clara y mar en calma detrás, luz dorada suave, sin gente ni texto.',
    image: withBase('/backgrounds/playa.webp'),
  },
  {
    id: 'campo',
    label: 'Campo',
    note: 'Un campo abierto de espigas doradas al atardecer, horizonte suave y cielo despejado, sin gente ni texto.',
    image: withBase('/backgrounds/campo.webp'),
  },
  {
    id: 'catedral',
    label: 'Catedral',
    note: 'El interior luminoso de una catedral gótica, pasillo central de piedra y vidrieras, luz cálida, sin gente ni texto.',
    image: withBase('/backgrounds/catedral.webp'),
  },
  {
    id: 'jardin',
    label: 'Jardín',
    note: 'Un jardín romántico de día con césped, setos y rosales blancos, luz natural suave, sin gente ni texto.',
    image: withBase('/backgrounds/jardin.webp'),
  },
  {
    id: 'finca',
    label: 'Finca',
    note: 'El patio de una finca andaluza con paredes encaladas, buganvillas y suelo de barro, luz de tarde, sin gente ni texto.',
    image: withBase('/backgrounds/finca.webp'),
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
