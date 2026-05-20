'use client';

const AUTH_PROFILE_STORAGE_KEY = 'simplex_auth_profile';

export interface CachedAuthProfile {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  companyId: string | null;
  role: string | null;
}

interface UnknownRecord {
  [key: string]: unknown;
}

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== 'object') return null;
  return value as UnknownRecord;
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function readAuthProfile(): CachedAuthProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_PROFILE_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CachedAuthProfile>;
    if (!parsed?.id) return null;
    return {
      id: parsed.id,
      email: parsed.email ?? null,
      firstName: parsed.firstName ?? null,
      lastName: parsed.lastName ?? null,
      companyId: parsed.companyId ?? null,
      role: parsed.role ?? null,
    };
  } catch {
    return null;
  }
}

export function writeAuthProfile(payload: unknown): void {
  if (typeof window === 'undefined') return;
  const record = asRecord(payload);
  if (!record) return;

  const nestedUser = asRecord(record.user);
  const id =
    asString(record.id) ??
    asString(nestedUser?.id) ??
    '';

  const profile: CachedAuthProfile = {
    id,
    email: asString(record.email) ?? asString(nestedUser?.email),
    firstName: asString(record.firstName) ?? asString(nestedUser?.firstName),
    lastName: asString(record.lastName) ?? asString(nestedUser?.lastName),
    companyId: asString(record.companyId) ?? asString(nestedUser?.companyId),
    role: asString(record.roleName) ?? asString(record.role),
  };

  if (!profile.id) return;
  localStorage.setItem(AUTH_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function clearAuthProfile(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_PROFILE_STORAGE_KEY);
}
