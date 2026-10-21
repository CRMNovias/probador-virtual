/**
 * Fondos que puede indicar la persona.
 * `note` vacío = se queda el fondo de marca de Atelier.
 */

export interface BackgroundChoice {
  id: string;
  label: string;
  note: string;
}

export const BACKGROUND_CHOICES: readonly BackgroundChoice[] = [
  { id: 'brand', label: 'Atelier', note: '' },
  {
    id: 'garden',
    label: 'Jardín',
    note: 'Un jardín suave de día, verde desenfocado, luz natural, sin gente ni texto.',
  },
  {
    id: 'ceremony',
    label: 'Ceremonia',
    note: 'Un pasillo de ceremonia luminoso, flores suaves al fondo, sin caras de invitados ni texto.',
  },
  {
    id: 'salon',
    label: 'Salón',
    note: 'Un salón de boda elegante, paredes claras y luz cálida, sin texto.',
  },
  {
    id: 'beach',
    label: 'Playa',
    note: 'Una playa tranquila al atardecer, arena y mar detrás, sin texto.',
  },
  { id: 'custom', label: 'Otro', note: '' },
] as const;

export const backgroundNoteFor = (id: string, customText: string): string => {
  if (id === 'custom') return customText.trim().slice(0, 180);
  return BACKGROUND_CHOICES.find((choice) => choice.id === id)?.note ?? '';
};
