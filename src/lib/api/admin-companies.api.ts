import { apiGet, apiPut } from '@/lib/api/client';
import { parseSessionRoleName } from '@/lib/auth/session-role-utils';
import type {
  AdminCompanyDetail,
  AdminCompanyDetailUser,
  AdminCompanyListItem,
  AdminCompanyPrimaryAdmin,
  AdminCompanyReactivateResponse,
} from '@/lib/types/admin-companies';
import { Niche } from '@/lib/types';

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

function parseNiche(value: unknown): Niche {
  const raw = readString(value);
  if (raw === Niche.GYM || raw === Niche.MEDICAL || raw === Niche.ENTREPRENEUR) return raw;
  return Niche.GYM;
}

function normalizePrimaryAdmin(raw: unknown): AdminCompanyPrimaryAdmin | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const id = readString(record.id);
  if (!id) return null;
  return {
    id,
    email: readString(record.email),
    firstName: readString(record.firstName),
    lastName: readString(record.lastName),
    isActive: readBoolean(record.isActive, true),
  };
}

function readCompanyIsActive(...sources: readonly Record<string, unknown>[]): boolean {
  for (const source of sources) {
    if (typeof source.isActive === 'boolean') return source.isActive;
  }
  return true;
}

function normalizeAdminCompanyListItem(raw: unknown): AdminCompanyListItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const id = readString(record.id);
  if (!id) return null;
  const isActive = readCompanyIsActive(record);
  return {
    id,
    name: readString(record.name),
    niche: parseNiche(record.niche),
    isActive,
    isOperational: readBoolean(record.isOperational, isActive),
    primaryAdmin: normalizePrimaryAdmin(record.primaryAdmin),
  };
}

function normalizeAdminCompanyDetailUser(raw: unknown): AdminCompanyDetailUser | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const id = readString(record.id);
  if (!id) return null;
  return {
    id,
    email: readString(record.email),
    firstName: readString(record.firstName),
    lastName: readString(record.lastName),
    role: parseSessionRoleName(record.roleName ?? record.role) ?? 'CLIENT',
    isActive: readBoolean(record.isActive, true),
  };
}

function normalizeAdminCompanyDetail(raw: unknown): AdminCompanyDetail {
  const record = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const nested =
    record.company && typeof record.company === 'object'
      ? (record.company as Record<string, unknown>)
      : record;
  const id = readString(nested.id ?? record.id);
  if (!id) {
    throw new Error('Admin company detail payload is missing id');
  }
  const usersRaw = Array.isArray(record.users)
    ? record.users
    : Array.isArray(nested.users)
      ? nested.users
      : [];
  const users = usersRaw
    .map(normalizeAdminCompanyDetailUser)
    .filter((row): row is AdminCompanyDetailUser => row !== null);
  const deactivatedAt = readNullableString(nested.deactivatedAt ?? record.deactivatedAt);
  const isActive = readCompanyIsActive(nested, record);

  return {
    id,
    name: readString(nested.name ?? record.name),
    niche: parseNiche(nested.niche ?? record.niche),
    isActive,
    deactivatedAt,
    deactivationReason: readNullableString(nested.deactivationReason ?? record.deactivationReason),
    users,
  };
}

export async function getAdminCompanies(): Promise<AdminCompanyListItem[]> {
  const raw = await apiGet<unknown>('/admin/companies');
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeAdminCompanyListItem)
    .filter((row): row is AdminCompanyListItem => row !== null);
}

export async function getAdminCompanyDetail(companyId: string): Promise<AdminCompanyDetail> {
  const raw = await apiGet<unknown>(`/admin/companies/${encodeURIComponent(companyId)}/detail`);
  return normalizeAdminCompanyDetail(raw);
}

/** PUT /admin/companies/:companyId/reactivate — full tenant restore (company + all inactive users). */
export async function reactivateAdminCompany(companyId: string): Promise<AdminCompanyReactivateResponse> {
  const raw = await apiPut<unknown, Record<string, never>>(
    `/admin/companies/${encodeURIComponent(companyId)}/reactivate`,
    {},
  );
  const record = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    reactivated: record.reactivated === true,
    usersReactivated: typeof record.usersReactivated === 'number' ? record.usersReactivated : 0,
  };
}
