import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAdminCompanyBillingOverview,
  recordSubscriptionManualPayment,
} from '@/lib/api/admin-hub';
import { invalidateAdminCompanyManageHub } from '@/lib/admin/admin-hub-query-invalidation';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { AdminCompanyBillingOverview, RecordManualPaymentDto } from '@/lib/types/admin-hub';

const BILLING_OVERVIEW_STALE_MS = 1000 * 60 * 2;

export function useAdminCompanyBillingOverview(companyId: string | undefined) {
  return useQuery<AdminCompanyBillingOverview>({
    queryKey: queryKeys.admin.manage.billingOverview(companyId ?? ''),
    queryFn: () => getAdminCompanyBillingOverview(companyId as string),
    enabled: Boolean(companyId),
    staleTime: BILLING_OVERVIEW_STALE_MS,
  });
}

export function useAdminRecordManualPayment(companyId: string) {
  const qc = useQueryClient();
  return useMutation<unknown, Error, { subscriptionId: string; dto: RecordManualPaymentDto }>({
    mutationFn: ({ subscriptionId, dto }) =>
      recordSubscriptionManualPayment(subscriptionId, dto),
    onSuccess: () => {
      invalidateAdminCompanyManageHub(qc, companyId);
    },
  });
}
