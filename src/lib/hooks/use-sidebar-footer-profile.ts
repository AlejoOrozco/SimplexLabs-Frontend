import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { getCompany } from '@/lib/api/companies.api';
import { readAuthProfile } from '@/lib/auth/profile-cache';
import { getMeProfilePreview } from '@/lib/layout/me-payload-profile-preview';
import { queryKeys } from '@/lib/hooks/query-keys';
import { fullName } from '@/lib/utils/format';

export interface SidebarFooterProfileInputs {
  userName: string;
  userEmail: string | null;
  companyName: string | null;
}

export function useSidebarFooterProfile(
  mePayload: unknown,
  props: SidebarFooterProfileInputs,
): {
  resolvedUserName: string;
  resolvedUserEmail: string | null;
  resolvedCompanyName: string | null;
} {
  const { user } = useAuth();
  const cachedProfile = readAuthProfile();
  const profile = getMeProfilePreview(mePayload);
  const cachedDisplayName = fullName({
    firstName: cachedProfile?.firstName ?? '',
    lastName: cachedProfile?.lastName ?? '',
  });
  const resolvedUserName = profile.name || cachedDisplayName || props.userName;
  const resolvedUserEmail = profile.email ?? cachedProfile?.email ?? props.userEmail;
  const companyId = profile.companyId ?? cachedProfile?.companyId ?? null;
  const companyNameFromMe = profile.companyName ?? user?.company?.name ?? null;

  const companyDetailQuery = useQuery({
    queryKey: queryKeys.companies.detail(companyId ?? ''),
    queryFn: () => getCompany(companyId as string),
    enabled: Boolean(companyId) && !companyNameFromMe,
    staleTime: 60_000,
  });

  const resolvedCompanyName =
    companyNameFromMe ?? companyDetailQuery.data?.name ?? props.companyName;

  return { resolvedUserName, resolvedUserEmail, resolvedCompanyName };
}
