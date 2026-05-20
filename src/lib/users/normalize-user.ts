import { parseSessionRoleName } from '@/lib/auth/session-role-utils';
import type { SessionRoleName, User } from '@/lib/types';

function readString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function readNullableString(value: unknown): string | null {
  const trimmed = readString(value);
  return trimmed.length > 0 ? trimmed : null;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
}

function parseUserRole(record: Record<string, unknown>): SessionRoleName | null {
  return parseSessionRoleName(record.roleName) ?? parseSessionRoleName(record.role);
}

export function normalizeUser(raw: unknown): User {
  const record = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const id = readString(record.id);
  if (!id) {
    throw new Error('User payload is missing id');
  }

  return {
    id,
    supabaseId: readString(record.supabaseId),
    email: readString(record.email),
    firstName: readString(record.firstName),
    lastName: readString(record.lastName),
    role: parseUserRole(record) ?? 'CLIENT',
    isActive: readBoolean(record.isActive, true),
    companyId: readNullableString(record.companyId),
    createdAt: readString(record.createdAt),
    updatedAt: readString(record.updatedAt),
  };
}

export function normalizeUsers(raw: unknown): User[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeUser);
}
