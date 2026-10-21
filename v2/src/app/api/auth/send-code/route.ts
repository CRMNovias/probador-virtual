import { crmFetch, crmPath } from '@/lib/server/crm';

export async function POST(request: Request) {
  const { phone } = (await request.json()) as { phone?: string };
  const res = await crmFetch(crmPath.auth('send-code'), {
    method: 'POST',
    body: JSON.stringify({ phone }),
    headers: { 'Content-Type': 'application/json' },
    from: request,
  });
  return new Response(await res.text(), { status: res.status, headers: { 'Content-Type': 'application/json' } });
}
