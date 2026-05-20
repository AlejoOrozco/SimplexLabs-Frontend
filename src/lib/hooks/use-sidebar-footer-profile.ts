import { useQuery } from '@tanstack/react-query';
import { getCompanies } from '@/lib/api/companies.api';
import { readAuthProfile } from '@/lib/auth/profile-cache';
import { getMeProfilePreview } from '@/lib/layout/me-payload-profile-preview';
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
  const cachedProfile = readAuthProfile();
  const profile = getMeProfilePreview(mePayload);
  const cachedDisplayName = fullName({
    firstName: cachedProfile?.firstName ?? '',
    lastName: cachedProfile?.lastName ?? '',
  });
  const resolvedUserName = profile.name || cachedDisplayName || props.userName;
  const resolvedUserEmail = profile.email ?? cachedProfile?.email ?? props.userEmail;
  const companyId = profile.companyId ?? cachedProfile?.companyId ?? null;

  const companiesQuery = useQuery({
    queryKey: ['companies', 'sidebar-footer'],
    queryFn: getCompanies,
  });

  const matchedCompany = companyId
    ? companiesQuery.data?.find((company) => company.id === companyId)
    : null;
  const resolvedCompanyName = matchedCompany?.name ?? props.companyName;

  return { resolvedUserName, resolvedUserEmail, resolvedCompanyName };
}
