import 'server-only';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Turntable } from '@/lib/types';
import { generateTurntable, hasAi } from './ai.mjs';
import { withBase } from '@/lib/base-path';

/**
 * Giro 360 de la V2 mientras el CRM no lo tenga (docs/crm-360.md). Parte de la
 * imagen que ya devolvió el CRM (avatar o prueba) y:
 *  1. limpia la esquina del logo que el CRM estampa en la imagen, para que el
 *     vídeo no herede un logo que la IA podría deformar;
 *  2. genera el giro (de una persona o de la pareja);
 *  3. pone el logo vectorial arriba a la derecha, en blanco o negro según lo
 *     claro que sea el fondo en esa esquina.
 * El resultado se guarda en disco y es el mismo vídeo que se ve y se descarga.
 */

const DIR = path.join(process.cwd(), '.data', 'turntables');
const LOGO = (tone: 'white' | 'black') => path.join(process.cwd(), 'public', 'brand', `logo-atelier-${tone}.png`);
/** Un trabajo «processing» más antiguo se da por perdido (reinicio del servidor). */
const STALE_MS = 8 * 60 * 1000;

/** Dónde pone el logo el CRM (TryOnController::stampBrandLogo) y dónde lo ponemos nosotros. */
const LOGO_BOX = { width: 0.22, right: 0.05, top: 0.035 };
/** Zonas a limpiar antes del vídeo: el sello del CRM en las pruebas y el logo de la lámina en el avatar. */
const CLEAN_BOX = {
  tryon: { x: 0.71, y: 0.025, w: 0.26, h: 0.06 },
  avatar: { x: 0.63, y: 0.08, w: 0.29, h: 0.065 },
};

export type TurntableKind = keyof typeof CLEAN_BOX;

interface Job {
  status: 'processing' | 'failed';
  startedAt: number;
  error?: string;
}

export const turntableId = (imageUrl: string) => createHash('sha256').update(imageUrl).digest('hex').slice(0, 24);
export const turntableFile = (id: string) => path.join(DIR, `${id}.mp4`);
const turntableUrl = (id: string) => withBase(`/api/turntable/${id}`);

const jobFile = (id: string) => path.join(DIR, `${id}.json`);
const exists = (file: string) => stat(file).then(() => true, () => false);
const readJob = (id: string): Promise<Job | null> =>
  readFile(jobFile(id), 'utf8').then((text) => JSON.parse(text) as Job, () => null);
const writeJob = async (id: string, job: Job) => {
  await mkdir(DIR, { recursive: true });
  await writeFile(jobFile(id), JSON.stringify(job));
};

const run = (cmd: string, args: string[]) =>
  new Promise<Buffer>((resolve, reject) =>
    execFile(cmd, args, { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 }, (err, stdout, stderr) =>
      err ? reject(new Error(`${cmd}: ${stderr.toString().trim() || err.message}`)) : resolve(stdout),
    ),
  );
const ffmpeg = (args: string[]) => run('ffmpeg', ['-v', 'error', '-y', ...args]);
let ffmpegReady: Promise<boolean> | null = null;
const hasFfmpeg = () => (ffmpegReady ??= run('ffmpeg', ['-version']).then(() => true, () => false));

const size = async (file: string) => {
  const out = await run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file]);
  const [width = 0, height = 0] = out.toString().trim().split(',').map(Number);
  return { width, height };
};
const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

/** 1. Borra el logo estampado interpolando su entorno (ffmpeg delogo). */
const cleanCorner = async (input: string, output: string, kind: TurntableKind) => {
  const { width, height } = await size(input);
  const box = CLEAN_BOX[kind];
  const x = Math.round(width * box.x);
  const y = Math.round(height * box.y);
  const w = Math.min(Math.round(width * box.w), width - x - 2);
  const h = Math.round(height * box.h);
  await ffmpeg(['-i', input, '-vf', `delogo=x=${x}:y=${y}:w=${w}:h=${h}`, output]);
};

/** 3. Logo arriba a la derecha: negro sobre fondo claro, blanco sobre fondo oscuro. */
const brand = async (input: string, output: string) => {
  const { width, height } = await size(input);
  const logoW = even(width * LOGO_BOX.width);
  const x = Math.round(width - logoW - width * LOGO_BOX.right);
  const y = Math.round(height * LOGO_BOX.top);
  const sampleH = Math.round(logoW / 4);
  // Luz media de esa esquina a lo largo del giro (2 muestras por segundo).
  const samples = await ffmpeg(['-i', input, '-vf', `fps=2,crop=${logoW}:${sampleH}:${x}:${y},scale=1:1,format=gray`, '-f', 'rawvideo', '-']);
  const luma = samples.length ? samples.reduce((sum, v) => sum + v, 0) / samples.length : 255;
  const tone = luma > 140 ? 'black' : 'white';
  // Pista de audio muda: WhatsApp pide MP4 con H.264 y AAC, y el vídeo de la IA viene sin sonido.
  await ffmpeg([
    '-i', input,
    '-i', LOGO(tone),
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-filter_complex', `[1:v]scale=${logoW}:-1[logo];[0:v][logo]overlay=${x}:${y}[v]`,
    '-map', '[v]', '-map', '2:a',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '32k', '-shortest', '-movflags', '+faststart',
    output,
  ]);
  return tone;
};

const render = async (id: string, imageUrl: string, kind: TurntableKind, couple: boolean, startedAt: number) => {
  const work = path.join(DIR, `${id}-work`);
  try {
    await mkdir(work, { recursive: true });
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`No se pudo descargar la imagen (${res.status})`);
    const original = path.join(work, 'still');
    await writeFile(original, Buffer.from(await res.arrayBuffer()));

    const withFfmpeg = await hasFfmpeg();
    const still = withFfmpeg ? path.join(work, 'clean.png') : original;
    if (withFfmpeg) await cleanCorner(original, still, kind);

    const video = await generateTurntable(
      { bytes: await readFile(still), mime: withFfmpeg ? 'image/png' : (res.headers.get('content-type') ?? 'image/jpeg') },
      { couple },
    );
    const raw = path.join(work, 'raw.mp4');
    await writeFile(raw, video);

    const final = path.join(work, 'final.mp4');
    if (withFfmpeg) console.log(`[360] logo en ${await brand(raw, final)}`);
    await rename(withFfmpeg ? final : raw, turntableFile(id));
  } catch (err) {
    console.error('[360]', err);
    await writeJob(id, { status: 'failed', startedAt, error: err instanceof Error ? err.message : String(err) });
  } finally {
    await rm(work, { recursive: true, force: true });
  }
};

/** Estado del giro de una imagen sin encargarlo (para enriquecer listados). */
export async function readyTurntable(imageUrl: string): Promise<Turntable | null> {
  const id = turntableId(imageUrl);
  return (await exists(turntableFile(id))) ? { status: 'ready', videoUrl: turntableUrl(id), posterUrl: imageUrl } : null;
}

/** Estado del giro de una imagen; con `start`, lo encarga si aún no existe. */
export async function bridgeTurntable(
  imageUrl: string,
  { start, kind, couple = false }: { start: boolean; kind: TurntableKind; couple?: boolean },
): Promise<Turntable> {
  const ready = await readyTurntable(imageUrl);
  if (ready) return ready;

  const id = turntableId(imageUrl);
  const job = await readJob(id);
  if (job?.status === 'processing' && Date.now() - job.startedAt < STALE_MS) return { status: 'processing' };
  if (!start || !hasAi()) return job?.status === 'failed' ? { status: 'failed', error: job.error } : { status: 'none' };

  const startedAt = Date.now();
  await writeJob(id, { status: 'processing', startedAt });
  // Tarda ~1 min: se responde ya y la pantalla consulta el estado cada pocos segundos.
  void render(id, imageUrl, kind, couple, startedAt);
  return { status: 'processing' };
}
