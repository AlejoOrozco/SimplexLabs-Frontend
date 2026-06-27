import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  SendOnboardingCredentialsBody,
  SendOnboardingCredentialsResult,
} from '@/lib/api/onboarding.api';
import * as api from '@/lib/api/onboarding.api';
import { queryKeys } from '@/lib/hooks/query-keys';

export function useSendOnboardingCredentials() {
  const qc = useQueryClient();
  return useMutation<SendOnboardingCredentialsResult, Error, SendOnboardingCredentialsBody>({
    mutationFn: api.sendOnboardingCredentials,
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: queryKeys.users.all });
      void qc.invalidateQueries({ queryKey: queryKeys.users.detail(variables.userId) });
    },
  });
}
