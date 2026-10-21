import { clearSession } from '@/lib/server/crm';

export async function POST() {
  await clearSession();
  return Response.json({ ok: true });
}
