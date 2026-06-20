import { apiPost } from '@/lib/api/client';

export interface SendOnboardingCredentialsBody {
  userId: string;
  email: string;
  password: string;
  firstName: string;
  companyName: string;
}

/** POST /admin/onboarding/send-credentials */
export async function sendOnboardingCredentials(body: SendOnboardingCredentialsBody): Promise<void> {
  await apiPost<void, SendOnboardingCredentialsBody>('/admin/onboarding/send-credentials', body);
}
