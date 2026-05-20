import { apiGet, apiPost } from '@/lib/api/client';
import type { CompleteOnboardingDto } from '@/lib/onboarding/build-complete-onboarding-dto';
import type { OnboardingResult, OnboardingWizardState } from '@/lib/types/onboarding';

export interface SaveOnboardingDraftBody {
  draftId?: string;
  step: OnboardingWizardState['step'];
  data: OnboardingWizardState;
}

export interface SaveOnboardingDraftResponse {
  draftId: string;
}

/** POST /admin/onboarding/draft */
export async function saveOnboardingDraft(body: SaveOnboardingDraftBody): Promise<SaveOnboardingDraftResponse> {
  return apiPost<SaveOnboardingDraftResponse, SaveOnboardingDraftBody>('/admin/onboarding/draft', body);
}

/** GET /admin/onboarding/draft/:id */
export async function getOnboardingDraft(draftId: string): Promise<OnboardingWizardState> {
  return apiGet<OnboardingWizardState>(`/admin/onboarding/draft/${encodeURIComponent(draftId)}`);
}

/** @deprecated Prefer dedicated admin provisioning APIs (`/admin/companies/*`, `/admin/users/*`); kept for legacy combined onboarding UI. */
export async function completeOnboarding(dto: CompleteOnboardingDto): Promise<OnboardingResult> {
  return apiPost<OnboardingResult, CompleteOnboardingDto>('/admin/onboarding/complete', dto);
}

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
