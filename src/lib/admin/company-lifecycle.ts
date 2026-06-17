import type { AdminCompanyDetail } from '@/lib/types/admin-companies';
import type { User } from '@/lib/types';

export function canDeactivateAdminCompany(company: Pick<AdminCompanyDetail, 'isActive'>): boolean {
  return company.isActive;
}

export function canReactivateAdminCompany(detail: Pick<AdminCompanyDetail, 'isActive'>): boolean {
  return !detail.isActive;
}

export function canDeactivateUser(user: Pick<User, 'isActive'>, companyIsInactive: boolean): boolean {
  return !companyIsInactive && user.isActive;
}
