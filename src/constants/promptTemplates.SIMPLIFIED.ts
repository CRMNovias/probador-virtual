/**
 * SIMPLIFIED AI Prompt Templates for Virtual Try-On
 *
 * Simpler, more direct prompts that work better with most AI models
 */

export const BASE_TRYON_PROMPT_SIMPLE = `Professional photo of a bride wearing an elegant wedding dress.
Natural lighting, elegant dark gray studio background.
Beautiful bride with professional makeup, realistic photography.`;

export const POSE_PROMPTS_SIMPLE = {
  pose1: {
    name: 'Pose de Estudio',
    description: 'Full frontal studio pose',
    prompt: `Full body front view, hands on hips, standing straight, professional bridal portrait.`,
  },
  pose2: {
    name: 'Pose Natural',
    description: 'Natural 3/4 turn pose',
    prompt: `Three-quarter view, slightly turned to the side, natural relaxed pose, elegant and romantic.`,
  },
  pose3: {
    name: 'Pose de Perfil',
    description: 'Profile side pose',
    prompt: `Full side profile view, standing elegantly, showing dress silhouette.`,
  },
} as const;

export const generateTryOnPromptSimple = (poseId: keyof typeof POSE_PROMPTS_SIMPLE, dressId: string): string => {
  const poseConfig = POSE_PROMPTS_SIMPLE[poseId];

  if (!poseConfig) {
    console.warn(`[promptTemplates] Unknown pose ID: ${poseId}, falling back to pose1`);
    return generateTryOnPromptSimple('pose1', dressId);
  }

  const completePrompt = `${BASE_TRYON_PROMPT_SIMPLE} ${poseConfig.prompt}`;

  console.log(`[promptTemplates] Generated SIMPLE prompt for ${poseId}:`, completePrompt);

  return completePrompt;
};
