import type { Company, User } from '@/lib/types';

/**
 * Picks the best contact for “primary company admin” display on admin lists.
 * Prefers an active `COMPANY_ADMIN` for the tenant; otherwise falls back sensibly.
 */
export function pickPrimaryCompanyAdmin(company: Pick<Company, 'id' | 'users'>): User | null {
  const users = company.users;
  if (!users?.length) return null;
  const tenantUsers = users.filter((u) => u.companyId === company.id);
  const admins = tenantUsers.filter((u) => u.role === 'COMPANY_ADMIN');
  const preferred = admins.find((u) => u.isActive) ?? admins[0];
  if (preferred) return preferred;
  return tenantUsers.find((u) => u.isActive) ?? tenantUsers[0] ?? null;
}
