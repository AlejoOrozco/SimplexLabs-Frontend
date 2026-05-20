import { useMutation } from '@tanstack/react-query';
import type { SendOnboardingCredentialsBody } from '@/lib/api/onboarding.api';
import * as api from '@/lib/api/onboarding.api';
import type { CompleteOnboardingDto } from '@/lib/onboarding/build-complete-onboarding-dto';
import type { OnboardingResult } from '@/lib/types/onboarding';

export function useCompleteOnboarding() {
  return useMutation<OnboardingResult, Error, CompleteOnboardingDto>({
    mutationFn: api.completeOnboarding,
  });
}

export function useSendOnboardingCredentials() {
  return useMutation<void, Error, SendOnboardingCredentialsBody>({
    mutationFn: api.sendOnboardingCredentials,
  });
}
