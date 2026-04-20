import { apiGet, apiPost } from '@/lib/api/client';
import type { LoginDto, RegisterDto } from '@/lib/schemas/auth.schema';
import type { AuthenticatedUser } from '@/lib/types';

export async function login(dto: LoginDto): Promise<AuthenticatedUser> {
  return apiPost<AuthenticatedUser, LoginDto>('/auth/login', dto);
}

export async function register(dto: RegisterDto): Promise<AuthenticatedUser> {
  return apiPost<AuthenticatedUser, RegisterDto>('/auth/register', dto);
}

export async function refresh(): Promise<void> {
  await apiPost<void>('/auth/refresh');
}

export async function logout(): Promise<void> {
  await apiPost<void>('/auth/logout');
}

export async function getMe(): Promise<AuthenticatedUser> {
  return apiGet<AuthenticatedUser>('/auth/me');
}

export async function getGoogleOAuthUrl(): Promise<{ url: string }> {
  return apiGet<{ url: string }>('/auth/oauth/google');
}

export async function handleOAuthCallback(accessToken: string): Promise<AuthenticatedUser> {
  return apiPost<AuthenticatedUser>(
    `/auth/oauth/callback?access_token=${encodeURIComponent(accessToken)}`,
  );
}
