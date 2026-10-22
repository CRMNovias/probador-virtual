/**
 * Textos que la V1 envía al CRM junto a cada generación (el CRM exige `prompt`).
 * Copiados de la V1: src/pages/AvatarCreationPage.tsx y src/constants/promptTemplates.ts.
 */

export const AVATAR_PROMPT =
  "You are an expert fashion photographer AI. Transform the person in this image into a full-body fashion model photo. The background must be a clean, neutral studio backdrop (dark gray, #A9A9A9). The person should have a neutral, professional model expression. Preserve the person's identity, unique features, and body type, but place them in a standard, relaxed standing model pose. The final image must be photorealistic. Return ONLY the final image.";

/**
 * Sonrisa suave y natural en las pruebas (solo la V2). Con la boca cerrada y
 * sin tocar barba ni bigote: si no, la IA enseña los dientes y recorta la perilla.
 */
const EXPRESSION =
  "**Expression:** A soft, natural, closed-mouth smile (the lips may part just slightly), relaxed and genuine, as in a happy wedding portrait, with a little warmth in the eyes. Not a forced, wide or toothy grin, and not laughing. Change only the corners of the mouth and the cheeks: keep the same face shape, eyes, nose, skin and any beard or moustache exactly as in the 'model image', so the person is immediately recognizable.";

const BASE_TRYON_PROMPT = `You are an expert virtual try-on AI. You will be given a 'model image' and a 'garment image'. Your task is to create a new photorealistic image where the person from the 'model image' is wearing the clothing from the 'garment image'.

**Crucial Rules:**
1. **Complete Garment Replacement:** You MUST completely REMOVE and REPLACE the clothing item worn by the person in the 'model image' with the new garment. No part of the original clothing (e.g., collars, sleeves, patterns) should be visible in the final image.
2. **Preserve the Model:** The person's face, hair, body shape, and pose from the 'model image' MUST remain unchanged. Only the expression may change (see Expression).
3. **Preserve the Background:** The entire background from the 'model image' MUST be preserved perfectly light gray #BAB8B8.
4. **Apply the Garment:** Realistically fit the new garment onto the person. It should adapt to their pose with natural folds, shadows, and lighting consistent with the original scene.
5. **Output:** Return ONLY the final, edited image. Do not include any text.

${EXPRESSION}`;

export const POSES = {
  studio: {
    label: 'Estudio',
    prompt: 'Pose de Estudio: Full body frontal view, standing straight facing the camera, hands on hips, confident pose, symmetrical composition.',
  },
  natural: {
    label: 'Natural',
    prompt: 'Pose Natural: Three-quarter body turn, slightly angled to the side, natural relaxed pose, one hand gently placed, elegant and romantic.',
  },
  profile: {
    label: 'Perfil',
    prompt: 'Pose de Perfil: Full body side profile view, standing elegantly, showing the complete silhouette from the side.',
  },
} as const;

export type PoseId = keyof typeof POSES;

export const tryOnPrompt = (pose: PoseId): string =>
  `${BASE_TRYON_PROMPT}\n\n**Pose Specification:**\n${POSES[pose].prompt}`;

/**
 * Foto en pareja: el texto que manda la V1 (CoupleTryOnPage) más la sonrisa de
 * las pruebas; el CRM añade su bloque de pareja.
 */
export const COUPLE_TRYON_PROMPT =
  'Couple portrait of exactly two real people: person A (Image 1) and person B (Image 3). Person A wears the garment of Image 2 and person B wears the garment of Image 4, each one their own, even if that garment is usually worn by another gender: never swap the garments and never leave anyone in their previous clothes. Images 2 and 4 are catalogue photos: use them only for the garment and never copy the catalogue models, their faces, hair or bodies. Both people must be immediately recognizable as the people in Images 1 and 3; never invent, replace or add anyone. One photograph of both, full body. Both with a soft, natural, closed-mouth smile, relaxed and genuine, as in a happy wedding portrait; not a forced or toothy grin. Keep both faces, and any beard or moustache, exactly as in their photos.';
