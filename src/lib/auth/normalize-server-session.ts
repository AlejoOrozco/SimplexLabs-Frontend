import type { Session } from '@/lib/api/endpoints';
import { parseSessionRoleName } from '@/lib/auth/session-role-utils';
import type { SessionRoleName } from '@/lib/types';

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const t = value.trim();
  return t.length > 0 ? t : null;
}

function readRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

function parseRoleFromRecord(record: Record<string, unknown>): SessionRoleName | null {
  return parseSessionRoleName(record.roleName) ?? parseSessionRoleName(record.role);
}

/**
 * Maps `/auth/me` JSON (legacy session envelope or flat user payload) into the
 * `Session` shape expected by server layouts and guards.
 */
export function normalizeServerSessionPayload(body: unknown): Session | null {
  const root = readRecord(body);
  if (!root) return null;

  const data = readRecord(root.data) ?? root;

  const nestedUser = readRecord(data.user);
  const flatSource = nestedUser ?? data;

  const id = readString(flatSource.id) ?? readString(data.id);
  const firstName = readString(flatSource.firstName) ?? readString(data.firstName) ?? '';
  const lastName = readString(flatSource.lastName) ?? readString(data.lastName) ?? '';
  if (!id) return null;

  const roleFromNested = nestedUser ? parseRoleFromRecord(nestedUser) : null;
  const roleFromRoot = parseRoleFromRecord(data);
  const role = roleFromRoot ?? roleFromNested ?? parseRoleFromRecord(flatSource);
  if (!role) return null;

  const companyIdRaw =
    readString(data.companyId) ??
    readString(flatSource.companyId) ??
    (nestedUser ? readString(nestedUser.companyId) : null);

  const companyId =
    companyIdRaw === null || companyIdRaw.toLowerCase() === 'null' ? null : companyIdRaw;

  const user = {
    id,
    firstName,
    lastName,
    role,
    companyId,
  };

  return {
    user,
    role,
    companyId,
  };
}
