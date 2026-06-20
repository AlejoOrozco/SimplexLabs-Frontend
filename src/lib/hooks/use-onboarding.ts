import { useMutation } from '@tanstack/react-query';
import type { SendOnboardingCredentialsBody } from '@/lib/api/onboarding.api';
import * as api from '@/lib/api/onboarding.api';

export function useSendOnboardingCredentials() {
  return useMutation<void, Error, SendOnboardingCredentialsBody>({
    mutationFn: api.sendOnboardingCredentials,
  });
}
