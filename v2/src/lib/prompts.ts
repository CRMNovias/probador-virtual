/**
 * Textos que la V1 envía al CRM junto a cada generación (el CRM exige `prompt`).
 * Copiados de la V1: src/pages/AvatarCreationPage.tsx y src/constants/promptTemplates.ts.
 */

export const AVATAR_PROMPT =
  "You are an expert fashion photographer AI. Transform the person in this image into a full-body fashion model photo. The background must be a clean, neutral studio backdrop (dark gray, #A9A9A9). The person should have a neutral, professional model expression. Preserve the person's identity, unique features, and body type, but place them in a standard, relaxed standing model pose. The final image must be photorealistic. Return ONLY the final image.";

const BASE_TRYON_PROMPT = `You are an expert virtual try-on AI. You will be given a 'model image' and a 'garment image'. Your task is to create a new photorealistic image where the person from the 'model image' is wearing the clothing from the 'garment image'.

**Crucial Rules:**
1. **Complete Garment Replacement:** You MUST completely REMOVE and REPLACE the clothing item worn by the person in the 'model image' with the new garment. No part of the original clothing (e.g., collars, sleeves, patterns) should be visible in the final image.
2. **Preserve the Model:** The person's face, hair, body shape, and pose from the 'model image' MUST remain unchanged.
3. **Preserve the Background:** The entire background from the 'model image' MUST be preserved perfectly light gray #BAB8B8.
4. **Apply the Garment:** Realistically fit the new garment onto the person. It should adapt to their pose with natural folds, shadows, and lighting consistent with the original scene.
5. **Output:** Return ONLY the final, edited image. Do not include any text.`;

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

/** Foto en pareja: el mismo texto que manda la V1 (CoupleTryOnPage); el CRM añade su bloque de pareja. */
export const COUPLE_TRYON_PROMPT =
  'Couple portrait. Person A wears the first garment. Person B wears the second garment. One photograph of both, full body.';
