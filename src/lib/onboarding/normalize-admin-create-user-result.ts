import type { AdminCreateUserResult } from '@/lib/types/admin-provisioning';

function readString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

export function normalizeAdminCreateUserResult(
  raw: unknown,
  fallback?: { firstName?: string; lastName?: string },
): AdminCreateUserResult {
  const record = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const userId = readString(record.userId) || readString(record.id);
  const email = readString(record.email);
  const password = readString(record.password);
  const companyName = readString(record.companyName);

  if (!userId) {
    throw new Error('Create user response is missing userId');
  }
  if (!email || !password || !companyName) {
    throw new Error('Create user response is incomplete');
  }

  return {
    userId,
    email,
    password,
    companyName,
    firstName: readString(record.firstName) || fallback?.firstName || '',
    lastName: readString(record.lastName) || fallback?.lastName || '',
  };
}
