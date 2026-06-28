'use client';

import { ManageUsersSection } from '@/components/admin/manage/company/manage-users-section';

interface CompanyTeamTabProps {
  companyId: string;
  companyIsInactive?: boolean;
}

/** Standalone company workspace tab — same user admin UI as Manage → Users. */
export function CompanyTeamTab({ companyId, companyIsInactive = false }: CompanyTeamTabProps): JSX.Element {
  return (
    <ManageUsersSection
      companyId={companyId}
      companyIsInactive={companyIsInactive}
      showManageIntro={false}
    />
  );
}
