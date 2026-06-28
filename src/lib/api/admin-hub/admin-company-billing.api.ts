import { apiGet, apiPost } from '@/lib/api/client';
import { adminCompanyPath } from '@/lib/api/admin-hub/admin-hub-paths';
import type { AdminCompanyBillingOverview, RecordManualPaymentDto } from '@/lib/types/admin-hub';

export async function getAdminCompanyBillingOverview(
  companyId: string,
): Promise<AdminCompanyBillingOverview> {
  return apiGet<AdminCompanyBillingOverview>(`${adminCompanyPath(companyId)}/billing-overview`);
}

/** Legacy path retained by backend handoff for manual payment recording. */
export async function recordSubscriptionManualPayment(
  subscriptionId: string,
  dto: RecordManualPaymentDto,
): Promise<unknown> {
  return apiPost<unknown, RecordManualPaymentDto>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}/record-payment`,
    dto,
  );
}
