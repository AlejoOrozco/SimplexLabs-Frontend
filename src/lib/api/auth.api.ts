import { apiGet, apiPost } from '@/lib/api/client';
import { normalizeAuthenticatedUser } from '@/lib/auth/normalize-authenticated-user';
import type { LoginDto } from '@/lib/schemas/auth.schema';
import type { AuthenticatedUser } from '@/lib/types';

export async function login(dto: LoginDto): Promise<AuthenticatedUser> {
  const raw = await apiPost<unknown, LoginDto>('/auth/login', dto);
  return normalizeAuthenticatedUser(raw);
}

export async function refresh(): Promise<void> {
  await apiPost<void>('/auth/refresh');
}

export async function logout(): Promise<void> {
  await apiPost<void>('/auth/logout');
}

export async function getMe(): Promise<AuthenticatedUser> {
  const raw = await apiGet<unknown>('/auth/me');
  return normalizeAuthenticatedUser(raw);
}

export async function markFirstLoginComplete(): Promise<AuthenticatedUser> {
  const raw = await apiPost<unknown, Record<string, never>>('/auth/first-login-complete', {});
  return normalizeAuthenticatedUser(raw);
}

export async function handleOAuthCallback(accessToken: string): Promise<AuthenticatedUser> {
  const raw = await apiPost<unknown>(
    `/auth/oauth/callback?access_token=${encodeURIComponent(accessToken)}`,
  );
  return normalizeAuthenticatedUser(raw);
}
