import { apiGet, apiPost, apiPut } from '@/lib/api/client';
import { adminCompanyPath } from '@/lib/api/admin-hub/admin-hub-paths';
import type {
  AdminAssignSubscriptionDto,
  AdminCancelSubscriptionDto,
  AdminCompanySubscription,
  AdminSwapSubscriptionPlanDto,
  AdminUpdateSubscriptionDto,
} from '@/lib/types/admin-hub';

export async function getAdminCompanySubscriptions(
  companyId: string,
): Promise<AdminCompanySubscription[]> {
  return apiGet<AdminCompanySubscription[]>(`${adminCompanyPath(companyId)}/subscriptions`);
}

export async function assignAdminCompanySubscription(
  companyId: string,
  dto: AdminAssignSubscriptionDto,
): Promise<AdminCompanySubscription> {
  return apiPost<AdminCompanySubscription, AdminAssignSubscriptionDto>(
    `${adminCompanyPath(companyId)}/subscriptions`,
    dto,
  );
}

export async function updateAdminCompanySubscription(
  companyId: string,
  subscriptionId: string,
  dto: AdminUpdateSubscriptionDto,
): Promise<AdminCompanySubscription> {
  return apiPut<AdminCompanySubscription, AdminUpdateSubscriptionDto>(
    `${adminCompanyPath(companyId)}/subscriptions/${encodeURIComponent(subscriptionId)}`,
    dto,
  );
}

export async function swapAdminCompanySubscriptionPlan(
  companyId: string,
  subscriptionId: string,
  dto: AdminSwapSubscriptionPlanDto,
): Promise<AdminCompanySubscription> {
  return apiPut<AdminCompanySubscription, AdminSwapSubscriptionPlanDto>(
    `${adminCompanyPath(companyId)}/subscriptions/${encodeURIComponent(subscriptionId)}/plan`,
    dto,
  );
}

export async function cancelAdminCompanySubscription(
  companyId: string,
  subscriptionId: string,
  dto: AdminCancelSubscriptionDto = {},
): Promise<AdminCompanySubscription> {
  return apiPost<AdminCompanySubscription, AdminCancelSubscriptionDto>(
    `${adminCompanyPath(companyId)}/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`,
    dto,
  );
}

export async function reactivateAdminCompanySubscription(
  companyId: string,
  subscriptionId: string,
): Promise<AdminCompanySubscription> {
  return apiPost<AdminCompanySubscription, Record<string, never>>(
    `${adminCompanyPath(companyId)}/subscriptions/${encodeURIComponent(subscriptionId)}/reactivate`,
    {},
  );
}
