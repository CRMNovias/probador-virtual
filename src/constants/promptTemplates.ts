/**
 * AI Prompt Templates for Virtual Try-On Generation
 *
 * Prompts optimized for virtual try-on AI systems.
 * System instructions + pose specification format.
 */

/**
 * Base virtual try-on system prompt
 * This is the core instruction set for the virtual try-on AI
 */
export const BASE_TRYON_PROMPT = `You are an expert virtual try-on AI. You will be given a 'model image' and a 'garment image'. Your task is to create a new photorealistic image where the person from the 'model image' is wearing the clothing from the 'garment image'.

**Crucial Rules:**
1. **Complete Garment Replacement:** You MUST completely REMOVE and REPLACE the clothing item worn by the person in the 'model image' with the new garment. No part of the original clothing (e.g., collars, sleeves, patterns) should be visible in the final image.
2. **Preserve the Model:** The person's face, hair, body shape, and pose from the 'model image' MUST remain unchanged.
3. **Preserve the Background:** The entire background from the 'model image' MUST be preserved perfectly dark gray #A9A9A9.
4. **Apply the Garment:** Realistically fit the new garment onto the person. It should adapt to their pose with natural folds, shadows, and lighting consistent with the original scene.
5. **Output:** Return ONLY the final, edited image. Do not include any text.`;

/**
 * Pose-specific prompt segments
 * These match the pose titles shown in the UI
 */
export const POSE_PROMPTS = {
  pose1: {
    name: 'Pose de Estudio',
    description: 'Studio pose - frontal view',
    prompt: `Pose de Estudio: Full body frontal view, standing straight facing the camera, hands on hips, confident pose, symmetrical composition.`,
  },
  pose2: {
    name: 'Pose Natural',
    description: 'Natural pose - 3/4 turn',
    prompt: `Pose Natural: Three-quarter body turn, slightly angled to the side, natural relaxed pose, one hand gently placed, elegant and romantic.`,
  },
  pose3: {
    name: 'Pose de Perfil',
    description: 'Profile pose - side view',
    prompt: `Pose de Perfil: Full body side profile view, standing elegantly, showing the complete silhouette from the side.`,
  },
} as const;

/**
 * Generate complete prompt for virtual try-on
 *
 * @param poseId - The selected pose identifier
 * @param dressId - The wedding dress ID (for logging/tracking)
 * @returns Complete prompt string for AI generation
 */
export const generateTryOnPrompt = (poseId: keyof typeof POSE_PROMPTS, dressId: string): string => {
  const poseConfig = POSE_PROMPTS[poseId];

  if (!poseConfig) {
    console.warn(`[promptTemplates] Unknown pose ID: ${poseId}, falling back to pose1`);
    return generateTryOnPrompt('pose1', dressId);
  }

  // Construct the complete prompt: Base instructions + Pose specification
  const completePrompt = `${BASE_TRYON_PROMPT}

**Pose Specification:**
${poseConfig.prompt}`;

  console.log(`[promptTemplates] Generated prompt for ${poseId}:`, completePrompt);

  return completePrompt;
};

/**
 * Validate that a pose ID is valid
 */
export const isValidPoseId = (poseId: string): poseId is keyof typeof POSE_PROMPTS => {
  return poseId in POSE_PROMPTS;
};

/**
 * Get all available pose configurations
 */
export const getAllPoseConfigs = () => {
  return Object.entries(POSE_PROMPTS).map(([id, config]) => ({
    id: id as keyof typeof POSE_PROMPTS,
    ...config,
  }));
};
