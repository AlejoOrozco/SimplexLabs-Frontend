import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignAdminCompanySubscription,
  cancelAdminCompanySubscription,
  getAdminCompanySubscriptions,
  reactivateAdminCompanySubscription,
  swapAdminCompanySubscriptionPlan,
  updateAdminCompanySubscription,
} from '@/lib/api/admin-hub';
import { invalidateAdminCompanyManageHub } from '@/lib/admin/admin-hub-query-invalidation';
import { queryKeys } from '@/lib/hooks/query-keys';
import type {
  AdminAssignSubscriptionDto,
  AdminCancelSubscriptionDto,
  AdminCompanySubscription,
  AdminSwapSubscriptionPlanDto,
  AdminUpdateSubscriptionDto,
} from '@/lib/types/admin-hub';

const SUBSCRIPTIONS_STALE_MS = 1000 * 60 * 2;

export function useAdminCompanySubscriptions(companyId: string | undefined) {
  return useQuery<AdminCompanySubscription[]>({
    queryKey: queryKeys.admin.manage.subscriptions(companyId ?? ''),
    queryFn: () => getAdminCompanySubscriptions(companyId as string),
    enabled: Boolean(companyId),
    staleTime: SUBSCRIPTIONS_STALE_MS,
  });
}

function useInvalidateCompanySubscriptions(companyId: string) {
  const qc = useQueryClient();
  return (): void => {
    invalidateAdminCompanyManageHub(qc, companyId);
  };
}

export function useAdminAssignSubscription(companyId: string) {
  const invalidate = useInvalidateCompanySubscriptions(companyId);
  return useMutation<AdminCompanySubscription, Error, AdminAssignSubscriptionDto>({
    mutationFn: (dto) => assignAdminCompanySubscription(companyId, dto),
    onSuccess: invalidate,
  });
}

export function useAdminUpdateSubscription(companyId: string) {
  const invalidate = useInvalidateCompanySubscriptions(companyId);
  return useMutation<
    AdminCompanySubscription,
    Error,
    { subscriptionId: string; dto: AdminUpdateSubscriptionDto }
  >({
    mutationFn: ({ subscriptionId, dto }) =>
      updateAdminCompanySubscription(companyId, subscriptionId, dto),
    onSuccess: invalidate,
  });
}

export function useAdminSwapSubscriptionPlan(companyId: string) {
  const invalidate = useInvalidateCompanySubscriptions(companyId);
  return useMutation<
    AdminCompanySubscription,
    Error,
    { subscriptionId: string; dto: AdminSwapSubscriptionPlanDto }
  >({
    mutationFn: ({ subscriptionId, dto }) =>
      swapAdminCompanySubscriptionPlan(companyId, subscriptionId, dto),
    onSuccess: invalidate,
  });
}

export function useAdminCancelSubscription(companyId: string) {
  const invalidate = useInvalidateCompanySubscriptions(companyId);
  return useMutation<
    AdminCompanySubscription,
    Error,
    { subscriptionId: string; dto?: AdminCancelSubscriptionDto }
  >({
    mutationFn: ({ subscriptionId, dto }) =>
      cancelAdminCompanySubscription(companyId, subscriptionId, dto),
    onSuccess: invalidate,
  });
}

export function useAdminReactivateSubscription(companyId: string) {
  const invalidate = useInvalidateCompanySubscriptions(companyId);
  return useMutation<AdminCompanySubscription, Error, string>({
    mutationFn: (subscriptionId) => reactivateAdminCompanySubscription(companyId, subscriptionId),
    onSuccess: invalidate,
  });
}
