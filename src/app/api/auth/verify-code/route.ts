import { crmFetch, crmPath, setSessionToken } from '@/lib/server/crm';

interface VerifyResponse {
  success?: boolean;
  data?: { token?: string; expiresIn?: number; user?: unknown; hasProfile?: boolean; hasAvatar?: boolean };
}

/** Verifica el código con el CRM y guarda su token en la cookie de sesión. */
export async function POST(request: Request) {
  const { phone, code } = (await request.json()) as { phone?: string; code?: string };
  const res = await crmFetch(crmPath.auth('verify-code'), {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
    headers: { 'Content-Type': 'application/json' },
    from: request,
  });
  const body = (await res.json().catch(() => ({}))) as VerifyResponse;
  if (!res.ok || !body.data?.token) return Response.json(body, { status: res.ok ? 401 : res.status });

  await setSessionToken(body.data.token, body.data.expiresIn || undefined);
  const { user, hasProfile, hasAvatar } = body.data;
  return Response.json({ user, hasProfile: Boolean(hasProfile), hasAvatar: Boolean(hasAvatar) });
}
