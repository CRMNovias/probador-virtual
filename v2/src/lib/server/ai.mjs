// IA con Gemini, con las mismas instrucciones que el CRM: avatar y prueba con
// Gemini 3 Pro Image, y el giro 360 (docs/crm-360.md) con Gemini Omni Flash.
// La usan el CRM simulado (mock-crm) y el puente 360 de la V2 mientras el CRM
// no tenga el vídeo (src/lib/server/turntable-bridge.ts).
//
// Necesita GEMINI_API_KEY en el entorno (.env.local). Sin clave, todo sigue
// funcionando sin IA.

const API = 'https://generativelanguage.googleapis.com/v1beta';
const IMAGE_MODEL = 'gemini-3-pro-image';
const VIDEO_MODEL = 'gemini-omni-1.1-flash';

export const aiKey = () => (process.env.GEMINI_API_KEY ?? '').replace(/^"|"$/g, '');
export const hasAi = () => aiKey().length > 0;

// Bloques copiados de app/Services/Probador/ProbadorPromptService.php del CRM.
const AVATAR_STUDIO = `**Studio transformation (mandatory):**
The input photo may be a casual selfie, mirror shot, or a distant/wide photo where the person appears small. You MUST output a professional full-body e-commerce studio photograph.

**Remove from output:** mobile phones, selfie arms, mirrors, other people, bags, furniture, clutter, and the original background. Never reproduce a selfie pose or a visible phone/camera.

**Pose:** Standard relaxed bridal catalog model pose — standing facing the camera (frontal or slight three-quarter), arms natural at sides or one hand on hip, feet slightly apart, neutral professional expression. Do NOT copy awkward angles, mirror poses, or casual poses from the input.

**Framing & scale:** Center the person horizontally. Full body from head to feet must be visible. The person should occupy approximately 70–82% of the image height — clearly large and readable, with safe margins: at least 12% empty space at the top (logo safe zone on brand backdrops) and 5% at the bottom. Do not crop head or feet. If the input person was small or far away, scale them up to proper catalog proportions while preserving realistic body proportions.

**Identity:** Preserve face, hair, skin tone, age, and body type faithfully — immediately recognizable. Do not slim, beautify, smooth skin, or change age.

**Lighting:** Soft professional studio lighting, photorealistic bridal catalog quality. Return ONLY the final image.`;

const TRYON_INTEGRATION = `**Garment integration (mandatory):**
The garment must look physically worn on the body — natural contact shadows under chin, arms, and hem; lighting direction consistent with the scene; correct overlap where body meets fabric; realistic drape, tension, and gravity. It must NOT look pasted, sticker-like, cut out, or floating.

**Subject framing:** Maintain full-body studio catalog framing. Model centered, occupying approximately 70–82% of frame height, feet visible with bottom margin, head below the top safe zone so the backdrop logo stays unobstructed.

**Pose changes:** When a Pose Specification section is present below, you MAY adjust the body pose as described while preserving the person's face, hair, skin texture, and body type.`;

// Fondo de estudio gris claro y liso, como un probador de e-commerce.
const STUDIO_BACKGROUND = `**Background (mandatory):** A seamless, light warm-grey studio backdrop (#ECEAE7) with a soft floor shadow. No props, no text, no logo.`;

// Bloques copiados de ProbadorPromptService del CRM (fondo elegido y foto en pareja).
const customBackground = (scene) =>
  `**Background chosen by the client (mandatory):**
IGNORE any earlier instruction to keep a gray, studio, or brand backdrop, and ignore any mention of drawing a logo.
Replace the entire background with this scene: ${scene.replace(/[\r\n]+/g, ' ')}.
Do NOT draw a logo, watermark, signature, label, caption, letters, numbers, or a white rectangle anywhere in the image.
Keep the person's head below the top edge.
No extra people and no furniture in the foreground. Keep every dressed person full-body and recognizable.`;

const COUPLE = `**Couple portrait (mandatory):**
This request is one photograph of TWO people, not a single model.
- Image 1 is person A. Image 2 is the garment person A must wear. Remove person A's previous clothes.
- Image 3 is person B. Image 4 is the garment person B must wear. Remove person B's previous clothes.
Place them together, full body, standing close, both looking toward the camera. Preserve both faces, hair, skin and body types. Do not merge them into one person and do not add anyone else.
If person B's photo is a casual snapshot, restage them to the same catalog quality as person A without changing their identity.`;

const turntablePrompt = (couple) => `Static camera, full-body vertical shot of ${couple ? 'the two people' : 'the person'} in the image, head to feet always visible, with exactly the same framing, camera distance and scale as the input image.
${
  couple
    ? 'The couple turns in place together, side by side and close to each other, and makes ONE complete, smooth 360-degree turn at constant speed: front, profile, back, the other profile, and back to the front.'
    : 'The person turns in place, as if standing on an invisible turntable hidden under the floor, and makes ONE complete, smooth 360-degree turn at constant speed: front, left profile, back, right profile, and back to the front.'
} The turn ends in exactly the same pose as the first frame so the clip loops seamlessly. The feet stay on the same spot of the floor.
Keep the faces, hair, body shapes and the clothing identical to the first frame: same fabric, colour, lace, neckline, sleeves, length and train. Show the back of each garment naturally, consistent with its front.
The place and background stay exactly as in the input image: same location, light, perspective and colours; only the people move. Nothing is added to the scene: no platform, disc, base, cables, props, extra people, text or logos. No camera movement, no zoom, no cuts, no music.`;

const pose = (text) => (text ? `\n\n**Pose Specification:**\n${text}` : '');

const post = async (path, body, timeoutMs) => {
  const res = await fetch(`${API}/${path}`, {
    method: 'POST',
    headers: { 'x-goog-api-key': aiKey(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error?.message ?? `Gemini respondió ${res.status}`);
  return json;
};

const inline = (image) => ({ inline_data: { mime_type: image.mime, data: image.bytes.toString('base64') } });

const generateImage = async (prompt, images) => {
  const started = Date.now();
  const json = await post(
    `models/${IMAGE_MODEL}:generateContent`,
    {
      contents: [{ role: 'user', parts: [{ text: prompt }, ...images.map(inline)] }],
      generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '9:16', imageSize: '2K' } },
    },
    200_000,
  );
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData ?? p.inline_data);
  const data = part?.inlineData ?? part?.inline_data;
  if (!data) throw new Error(`La IA no devolvió imagen (${json.candidates?.[0]?.finishReason ?? 'sin motivo'})`);
  console.log(`[ia] ${IMAGE_MODEL} 2K en ${Math.round((Date.now() - started) / 1000)} s (~0,13 $)`);
  return { bytes: Buffer.from(data.data, 'base64'), mime: data.mimeType ?? data.mime_type ?? 'image/png' };
};

/** Avatar de cuerpo entero a partir de la foto de la clienta (como `avatar/generate` del CRM). */
export const generateAvatar = (basePrompt, photo) =>
  generateImage(`${basePrompt.trim()}\n\n${AVATAR_STUDIO}\n\n${STUDIO_BACKGROUND}`, [photo]);

/** La prueba: el avatar con la prenda puesta (como `tryons/generate` del CRM). */
export const generateTryOn = (basePrompt, avatar, garment, { poseText, scene, partner } = {}) =>
  generateImage(
    [
      `${basePrompt.trim()}${pose(poseText)}`,
      TRYON_INTEGRATION,
      partner ? COUPLE : null,
      scene ? customBackground(scene) : STUDIO_BACKGROUND,
    ]
      .filter(Boolean)
      .join('\n\n'),
    partner ? [avatar, garment, partner.photo, partner.garment] : [avatar, garment],
  );

/** Giro 360 en bucle: la imagen fija es el primer y el último fotograma. */
export const generateTurntable = async (still, { couple = false } = {}) => {
  const started = Date.now();
  const frame = { type: 'image', data: still.bytes.toString('base64'), mime_type: still.mime };
  const json = await post(
    'interactions',
    {
      model: VIDEO_MODEL,
      input: [frame, frame, { type: 'text', text: turntablePrompt(couple) }],
      response_format: { type: 'video', aspect_ratio: '9:16', resolution: '720p' },
      background: false,
      store: false,
      stream: false,
    },
    420_000,
  );
  const video = (json.steps ?? [])
    .flatMap((s) => s.content ?? [])
    .concat(json.output_video ? [json.output_video] : [])
    .find((c) => (c.type === 'video' || c.mime_type?.startsWith('video/')) && c.data);
  if (!video) throw new Error('La IA no devolvió vídeo');
  console.log(`[ia] ${VIDEO_MODEL} 720p en ${Math.round((Date.now() - started) / 1000)} s (~0,10 $/s)`);
  return Buffer.from(video.data, 'base64');
};
