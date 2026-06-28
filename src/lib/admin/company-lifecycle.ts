import type { AdminCompanyDetail } from '@/lib/types/admin-companies';

export function canDeactivateAdminCompany(company: Pick<AdminCompanyDetail, 'isActive'>): boolean {
  return company.isActive;
}

export function canReactivateAdminCompany(detail: Pick<AdminCompanyDetail, 'isActive'>): boolean {
  return !detail.isActive;
}
