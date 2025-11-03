/**
 * AI Prompt Templates for Virtual Try-On Generation
 *
 * Professional prompts for generating high-quality wedding dress try-on images.
 * These prompts are optimized for AI image generation models (Stable Diffusion, DALL-E, etc.)
 */

/**
 * Base prompt template for virtual try-on generation
 * Contains common quality parameters and style requirements
 */
export const BASE_TRYON_PROMPT = `A professional photorealistic image of a bride wearing an elegant wedding dress in a bridal boutique setting.
High-quality commercial photography, professional lighting, soft natural light from windows, elegant background with neutral tones.
The bride should look natural and elegant, with professional makeup and styled hair.
Ultra-realistic, 8K resolution, detailed fabric textures, professional fashion photography style.
Focus on the wedding dress details: lace, embroidery, beading, fabric flow.`;

/**
 * Negative prompt - things to avoid in generation
 */
export const NEGATIVE_PROMPT = `low quality, blurry, distorted, deformed, disfigured, amateur, poor lighting,
oversaturated colors, cartoon, anime, drawing, sketch, watermark, text, logo,
extra limbs, missing limbs, asymmetrical face, unnatural pose, bad proportions,
low resolution, pixelated, grainy, artificial looking`;

/**
 * Pose-specific prompt segments
 */
export const POSE_PROMPTS = {
  pose1: {
    name: 'Pose de Estudio',
    description: 'Full frontal studio pose with hands on hips',
    prompt: `Full body frontal view, standing straight facing the camera, hands elegantly placed on hips,
confident bridal pose, symmetrical composition, direct eye contact with camera,
studio photography setup, professional bridal portrait style.`,
  },
  pose2: {
    name: 'Pose Natural',
    description: 'Natural 3/4 turn pose',
    prompt: `Three-quarter body turn, slightly angled to the side (45 degrees),
one hand gently touching the dress fabric, natural relaxed pose, soft smile,
looking slightly off-camera, elegant and romantic atmosphere,
natural bridal photography style with soft bokeh background.`,
  },
  pose3: {
    name: 'Pose de Perfil',
    description: 'Full profile side pose',
    prompt: `Full body side profile view (90 degrees), standing elegantly,
showing the complete silhouette of the wedding dress from side angle,
one arm naturally down, the other slightly raised showing dress details,
graceful profile pose, highlighting dress shape and train,
editorial bridal photography style.`,
  },
} as const;

/**
 * Quality and technical parameters
 */
export const QUALITY_PARAMETERS = {
  resolution: '8K, ultra high resolution, sharp focus',
  lighting: 'professional studio lighting, soft diffused light, natural window light',
  details: 'intricate fabric details, realistic texture, fine lace patterns, delicate embroidery',
  style: 'commercial bridal photography, fashion editorial style, professional retouching',
  camera: 'shot with professional DSLR, 85mm portrait lens, shallow depth of field',
};

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

  // Construct the complete prompt
  const completePrompt = `
${BASE_TRYON_PROMPT}

POSE SPECIFICATION:
${poseConfig.prompt}

QUALITY REQUIREMENTS:
- ${QUALITY_PARAMETERS.resolution}
- ${QUALITY_PARAMETERS.lighting}
- ${QUALITY_PARAMETERS.details}
- ${QUALITY_PARAMETERS.style}
- ${QUALITY_PARAMETERS.camera}

Additional context: Wedding dress ID ${dressId}, ${poseConfig.name} (${poseConfig.description})
  `.trim();

  console.log(`[promptTemplates] Generated prompt for ${poseId}:`, completePrompt);

  return completePrompt;
};

/**
 * Get negative prompt for generation
 * Use this to specify what should NOT appear in the generated image
 */
export const getNegativePrompt = (): string => {
  return NEGATIVE_PROMPT;
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
