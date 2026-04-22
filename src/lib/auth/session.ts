import { cookies } from 'next/headers';
import { endpoints, type Session } from '@/lib/api/endpoints';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();

  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const response = await fetch(`${baseUrl}${endpoints.auth.me.path}`, {
    method: 'GET',
    headers: {
      cookie: cookieHeader,
      'x-correlation-id': crypto.randomUUID(),
    },
    cache: 'no-store',
  });

  if (!response.ok) return null;
  const envelope = (await response.json()) as { data?: Session };
  return envelope.data ?? null;
}
