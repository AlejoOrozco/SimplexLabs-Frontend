import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/hooks/query-keys';

/** Invalidate tenant-facing caches after admin hub writes. */
export function invalidateTenantCachesForCompany(
  qc: QueryClient,
  companyId: string,
): void {
  void qc.invalidateQueries({ queryKey: queryKeys.subscriptions.list() });
  void qc.invalidateQueries({ queryKey: queryKeys.websites.all });
  void qc.invalidateQueries({ queryKey: queryKeys.users.listByCompany(companyId) });
  void qc.invalidateQueries({ queryKey: queryKeys.companies.detail(companyId) });
}

/** Invalidate all admin manage hub queries for one company. */
export function invalidateAdminCompanyManageHub(
  qc: QueryClient,
  companyId: string,
): void {
  void qc.invalidateQueries({ queryKey: queryKeys.admin.manage.summary(companyId) });
  void qc.invalidateQueries({ queryKey: queryKeys.admin.manage.subscriptions(companyId) });
  void qc.invalidateQueries({ queryKey: queryKeys.admin.manage.users(companyId) });
  void qc.invalidateQueries({ queryKey: queryKeys.admin.manage.agentConfig(companyId) });
  void qc.invalidateQueries({
    queryKey: [...queryKeys.admin.manage.all, 'knowledge-base', companyId],
  });
  void qc.invalidateQueries({ queryKey: queryKeys.admin.manage.billingOverview(companyId) });
  void qc.invalidateQueries({ queryKey: queryKeys.admin.companies.detail(companyId) });
  invalidateTenantCachesForCompany(qc, companyId);
}

/** Invalidate admin plan catalog queries. */
export function invalidateAdminPlanCatalog(qc: QueryClient): void {
  void qc.invalidateQueries({ queryKey: queryKeys.admin.plans.all });
  void qc.invalidateQueries({ queryKey: queryKeys.plans.all });
}
