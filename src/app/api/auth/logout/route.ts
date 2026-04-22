import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  const response = await fetch(`${baseUrl}/auth/logout`, {
    method: 'POST',
    headers: { 'x-correlation-id': crypto.randomUUID() },
    credentials: 'include',
  });
  const body = await response.json().catch(() => ({}));
  return NextResponse.json(body, { status: response.status });
}
