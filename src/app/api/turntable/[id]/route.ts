import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { getSessionToken } from '@/lib/server/crm';
import { turntableFile } from '@/lib/server/turntable-bridge';

/**
 * Sirve los vídeos 360 (src/lib/server/turntable-bridge.ts) con soporte de
 * rangos, que Safari necesita para reproducir vídeo. Con `?download=1` se
 * descarga como archivo.
 */
export async function GET(request: Request, ctx: RouteContext<'/api/turntable/[id]'>) {
  const { id } = await ctx.params;
  if (!/^[a-f0-9]{24}$/.test(id)) return new Response(null, { status: 404 });
  if (!(await getSessionToken())) return new Response(null, { status: 401 });

  const file = turntableFile(id);
  const info = await stat(file).catch(() => null);
  if (!info) return new Response(null, { status: 404 });

  const params = new URL(request.url).searchParams;
  const headers: Record<string, string> = {
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, max-age=31536000, immutable',
  };
  // Descarga con un nombre legible: «atelier-de-bodas-360-yndret.mp4».
  if (params.get('download') === '1') {
    const slug = (params.get('name') ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
    headers['Content-Disposition'] = `attachment; filename="atelier-de-bodas-360${slug ? `-${slug}` : ''}.mp4"`;
  }
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') ?? '');
  if (!range) {
    const body = Readable.toWeb(createReadStream(file)) as ReadableStream;
    return new Response(body, { headers: { ...headers, 'Content-Length': String(info.size) } });
  }

  const start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
  const end = range[1] && range[2] ? Math.min(Number(range[2]), info.size - 1) : info.size - 1;
  if (start > end || start >= info.size) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${info.size}` } });
  }
  const body = Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream;
  return new Response(body, {
    status: 206,
    headers: { ...headers, 'Content-Length': String(end - start + 1), 'Content-Range': `bytes ${start}-${end}/${info.size}` },
  });
}
