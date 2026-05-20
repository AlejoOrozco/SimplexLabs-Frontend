import type { SessionRoleName } from '@/lib/types';

/** Single source of truth for valid `role` / `roleName` values from API and forms. */
export const SESSION_ROLES_LIST = [
  'SUPER_ADMIN',
  'SIMPLEX_STAFF',
  'COMPANY_ADMIN',
  'COMPANY_STAFF',
  'CLIENT',
] as const satisfies readonly SessionRoleName[];

const SESSION_ROLE_SET = new Set<string>(SESSION_ROLES_LIST);

export function parseSessionRoleName(value: unknown): SessionRoleName | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!SESSION_ROLE_SET.has(trimmed)) return null;
  return trimmed as SessionRoleName;
}

/** Company-tenant users shown in admin client workspace (excludes platform operators). */
export function isTenantTeamRole(role: SessionRoleName): boolean {
  return role === 'CLIENT' || role === 'COMPANY_ADMIN' || role === 'COMPANY_STAFF';
}

/** SimplexLabs super-admin (full platform access). */
export function isSimplexAdminRoleName(role: SessionRoleName | null | undefined): boolean {
  return role === 'SUPER_ADMIN';
}

/** SimplexLabs platform operators (admin shell, staff tooling). */
export function isPlatformOperatorRole(role: SessionRoleName | null | undefined): boolean {
  return role === 'SUPER_ADMIN' || role === 'SIMPLEX_STAFF';
}

/** Default SPA home after login when no `post_login_redirect` override is set. */
export function getDefaultAuthenticatedHomePath(roleName: SessionRoleName): string {
  return isPlatformOperatorRole(roleName) ? '/admin' : '/dashboard';
}

/**
 * Reads role from `/auth/me` style payloads (flat user, or nested `{ user, role }`).
 */
export function readSessionRoleFromMePayload(data: unknown): SessionRoleName | null {
  if (!data || typeof data !== 'object') return null;
  const root = data as Record<string, unknown>;
  const fromRoot = parseSessionRoleName(root.roleName ?? root.role);
  if (fromRoot) return fromRoot;
  const nested = root.user;
  if (!nested || typeof nested !== 'object') return null;
  const u = nested as Record<string, unknown>;
  return parseSessionRoleName(u.roleName ?? u.role);
}
