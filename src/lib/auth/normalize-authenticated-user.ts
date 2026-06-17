import { parseSessionRoleName } from '@/lib/auth/session-role-utils';
import type { AuthenticatedUser, AuthSessionCompany, SessionRoleName } from '@/lib/types';

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function parseRoleName(record: Record<string, unknown>): SessionRoleName {
  const role =
    parseSessionRoleName(record.roleName) ?? parseSessionRoleName(record.role);
  if (!role) {
    throw new Error('Authenticated user payload is missing a valid roleName');
  }
  return role;
}

function parseCompany(value: unknown): AuthSessionCompany | null {
  if (!value || typeof value !== 'object') return null;
  const c = value as Record<string, unknown>;
  const id = readString(c.id);
  const name = readString(c.name);
  if (!id || !name) return null;
  return {
    id,
    name,
    niche: readString(c.niche) ?? '',
    isPlatformOwner: readBoolean(c.isPlatformOwner, false),
  };
}

export function normalizeAuthenticatedUser(raw: unknown): AuthenticatedUser {
  const root = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const nestedUser =
    root.user && typeof root.user === 'object' ? (root.user as Record<string, unknown>) : null;
  const source = nestedUser ?? root;

  const id = readString(source.id) ?? readString(root.id);
  const email = readString(source.email) ?? readString(root.email) ?? '';
  const firstName = readString(source.firstName) ?? readString(root.firstName) ?? '';
  const lastName = readString(source.lastName) ?? readString(root.lastName) ?? '';

  if (!id) {
    throw new Error('Authenticated user payload is missing id');
  }

  const mergedForRole = { ...root, ...source };
  const roleName = parseRoleName(mergedForRole);
  const companyId =
    readString(source.companyId) ?? readString(root.companyId) ?? readString(mergedForRole.companyId);

  const permissions = readStringArray(source.permissions ?? root.permissions);
  const company = parseCompany(source.company ?? root.company);

  const timezoneRaw = readString(source.timezone) ?? readString(root.timezone);
  const timezone = timezoneRaw ?? 'UTC';

  const firstLoginCompleted = readBoolean(
    source.firstLoginCompleted ?? root.firstLoginCompleted,
    true,
  );

  const isOwner = readBoolean(source.isOwner ?? root.isOwner, false);

  return {
    id,
    email,
    firstName,
    lastName,
    roleName,
    isOwner,
    companyId,
    permissions,
    company,
    timezone,
    firstLoginCompleted,
  };
}
