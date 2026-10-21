import 'server-only';
import { cookies } from 'next/headers';
import { BASE_PATH } from '@/lib/base-path';
import { brand } from '@/lib/brand';

/**
 * Acceso al CRM desde el servidor de la V2. El token del CRM vive en una
 * cookie httpOnly: el navegador nunca lo ve (en la V1 estaba en localStorage).
 */

export const CRM_API_URL = process.env.CRM_API_URL ?? 'http://localhost:4010/api';
export const SESSION_COOKIE = 'pv_session';
const COOKIE_PATH = BASE_PATH || '/';
const SESSION_DAYS = 30;

export const getSessionToken = async (): Promise<string | null> =>
  (await cookies()).get(SESSION_COOKIE)?.value ?? null;

/** La cookie dura lo mismo que el token del CRM cuando este lo indica. */
export const setSessionToken = async (token: string, maxAgeSeconds = SESSION_DAYS * 24 * 60 * 60): Promise<void> => {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // Solo para la V2: la V1 vive en la raíz del mismo dominio.
    path: COOKIE_PATH,
    maxAge: maxAgeSeconds,
  });
};

export const clearSession = async (): Promise<void> => {
  (await cookies()).delete({ name: SESSION_COOKIE, path: COOKIE_PATH });
};

/** Rutas del CRM con prefijo de marca, como las que usa cada SPA. */
export const crmPath = {
  auth: (action: 'send-code' | 'verify-code') => `/auth/${brand.id}/${action}`,
  probador: (rest: string) => `/probador/${brand.id}/${rest.replace(/^\/+/, '')}`,
};

interface CrmRequest {
  method?: string;
  body?: BodyInit | null;
  headers?: HeadersInit;
  token?: string | null;
  /** Las generaciones con IA del CRM son síncronas y pueden tardar hasta 3 minutos. */
  timeoutMs?: number;
  /**
   * La petición original de la clienta: se reenvía su IP (X-Forwarded-For) para
   * que el CRM, si confía en este servidor, limite por clienta y no por servidor.
   */
  from?: Request;
}

export const crmFetch = async (path: string, req: CrmRequest = {}): Promise<Response> => {
  const headers = new Headers(req.headers);
  headers.set('Accept', 'application/json');
  if (req.token) headers.set('Authorization', `Bearer ${req.token}`);
  const clientIp = req.from?.headers.get('x-forwarded-for') ?? req.from?.headers.get('x-real-ip');
  if (clientIp) headers.set('X-Forwarded-For', clientIp);
  return fetch(`${CRM_API_URL}${path}`, {
    method: req.method ?? 'GET',
    body: req.body ?? null,
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(req.timeoutMs ?? 30_000),
    // Necesario para reenviar cuerpos en streaming (subida de fotos).
    ...(req.body instanceof ReadableStream ? { duplex: 'half' } : {}),
  } as RequestInit);
};
