import { apiFetch } from '@/lib/api/client';
import {
  buildSendOnboardingCredentialsBody,
  type SendOnboardingCredentialsBody,
} from '@/lib/onboarding/build-send-onboarding-credentials-body';
import type { SessionRoleName } from '@/lib/types';

export type { SendOnboardingCredentialsBody };

export interface SendOnboardingCredentialsResult {
  sent: boolean;
}

/** POST /admin/onboarding/send-credentials */
export async function sendOnboardingCredentials(
  body: SendOnboardingCredentialsBody,
): Promise<SendOnboardingCredentialsResult> {
  const payload = buildSendOnboardingCredentialsBody(body);
  return apiFetch<SendOnboardingCredentialsResult>('/admin/onboarding/send-credentials', {
    method: 'POST',
    body: payload,
  });
}

/** Roles supported by POST /admin/onboarding/send-credentials (temp password in email body). */
export function canSendOnboardingCredentialsEmail(role: SessionRoleName): boolean {
  return role === 'CLIENT' || role === 'COMPANY_ADMIN';
}
