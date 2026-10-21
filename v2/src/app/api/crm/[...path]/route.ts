import { clearSession, crmFetch, crmPath, getSessionToken, setSessionToken } from '@/lib/server/crm';
import { bridgeTurntable, readyTurntable } from '@/lib/server/turntable-bridge';
import { brand } from '@/lib/brand';
import type { TryOnGroup } from '@/lib/types';

/**
 * Pasarela al CRM: la app llama a `/api/crm/<ruta>` y aquí se añade el token
 * de la cookie. Solo se reenvían las rutas del probador, no todo el CRM.
 */

export const maxDuration = 300;

const ALLOWED = [
  new RegExp(`^probador/${brand.id}/(user|avatar|tryons|collections|booking|appointments)(/|$)`),
  /^favorites(\/|$)/,
  new RegExp(`^${brand.id}/shops$`),
];
const SLOW = /(avatar\/generate|tryons\/generate|tryons\/partner)$/;
const TURNTABLE = new RegExp(`^probador/${brand.id}/(?:avatar|tryons/([^/]+))/turntable$`);
const GENERATE = new RegExp(`^probador/${brand.id}/tryons/generate$`);

/** Imagen del CRM de la que sale el giro: el avatar o una prueba concreta. */
const turntableImage = async (tryOnId: string | undefined, token: string): Promise<string | null> => {
  if (!tryOnId) {
    const res = await crmFetch(crmPath.probador('avatar'), { token });
    const body = (await res.json().catch(() => null)) as { data?: { avatarUrl?: string } } | null;
    return body?.data?.avatarUrl ?? null;
  }
  const res = await crmFetch(crmPath.probador('tryons/user'), { token });
  const body = (await res.json().catch(() => null)) as {
    data?: { tryOnsByDress?: { tryOns: { id: string | number; imageUrl: string }[] }[] };
  } | null;
  const tryOns = body?.data?.tryOnsByDress?.flatMap((g) => g.tryOns) ?? [];
  return tryOns.find((t) => String(t.id) === tryOnId)?.imageUrl ?? null;
};

type Ctx = { params: Promise<{ path: string[] }> };

const forward = async (request: Request, ctx: Ctx): Promise<Response> => {
  const path = (await ctx.params).path.join('/');
  if (!ALLOWED.some((rule) => rule.test(path))) return Response.json({ message: 'Ruta no permitida' }, { status: 404 });

  const token = await getSessionToken();
  if (!token) return Response.json({ message: 'Sin sesión' }, { status: 401 });

  // El 360 aún no está en el CRM (docs/crm-360.md): lo hace la V2 a partir de su imagen.
  const turntable = TURNTABLE.exec(path);
  if (turntable) {
    const tryOnId = turntable[1];
    const imageUrl = await turntableImage(tryOnId, token);
    if (!imageUrl) return Response.json({ success: false, message: 'Sin imagen para el 360' }, { status: 404 });
    const start = request.method === 'POST';
    const couple = new URL(request.url).searchParams.get('couple') === '1';
    const data = await bridgeTurntable(imageUrl, { start, kind: tryOnId ? 'tryon' : 'avatar', couple });
    return Response.json({ success: true, data }, { status: start ? 202 : 200 });
  }

  const search = new URL(request.url).search;
  const contentType = request.headers.get('content-type');
  // La prueba se lee entera: hace falta saber si va con pareja para su 360.
  const tryOnRequest = GENERATE.test(path) ? await request.text() : null;
  const res = await crmFetch(`/${path}${search}`, {
    method: request.method,
    body: tryOnRequest ?? (request.method === 'GET' || request.method === 'DELETE' ? null : request.body),
    headers: contentType ? { 'Content-Type': contentType } : {},
    token,
    from: request,
    timeoutMs: SLOW.test(path) ? 200_000 : 30_000,
  });

  if (res.status === 401) await clearSession();

  const type = res.headers.get('content-type') ?? '';
  if (!type.includes('application/json')) {
    return new Response(res.body, { status: res.status, headers: { 'Content-Type': type || 'text/plain' } });
  }

  // El CRM reemite el token al completar el perfil: se guarda y no se expone.
  const body = (await res.json()) as { data?: { token?: string; tryOnsByDress?: TryOnGroup[]; id?: string | number; imageUrl?: string } };
  if (body?.data?.token) {
    await setSessionToken(body.data.token);
    delete body.data.token;
  }
  // Cada prueba lleva su 360 si ya está hecho, para marcarlo en «Mis pruebas».
  for (const group of body?.data?.tryOnsByDress ?? []) {
    for (const t of group.tryOns) t.turntable = (await readyTurntable(t.imageUrl)) ?? t.turntable ?? null;
  }
  // Nueva prueba: su 360 empieza ya en el servidor (aunque la clienta cierre la
  // página) y, al terminar, el CRM lo manda por WhatsApp en lugar de la foto.
  if (tryOnRequest && res.ok && body?.data?.id && body.data.imageUrl) {
    const couple = Boolean((JSON.parse(tryOnRequest) as { partnerDressId?: string }).partnerDressId);
    await bridgeTurntable(body.data.imageUrl, {
      start: true,
      kind: 'tryon',
      couple,
      delivery: { tryOnId: String(body.data.id), token },
    });
  }
  return Response.json(body, { status: res.status });
};

export const GET = forward;
export const POST = forward;
export const DELETE = forward;
