import { redirect } from 'next/navigation';

interface OAuthCallbackProps {
  searchParams: { access_token?: string };
}

export default async function OAuthCallbackPage({ searchParams }: OAuthCallbackProps): Promise<never> {
  const token = searchParams.access_token;
  if (!token) redirect('/login');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  await fetch(`${baseUrl}/auth/oauth/callback`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-correlation-id': crypto.randomUUID(),
    },
    credentials: 'include',
    body: JSON.stringify({ accessToken: token }),
  });

  redirect('/dashboard');
}
