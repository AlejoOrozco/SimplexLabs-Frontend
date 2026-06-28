'use client';

import { ManageWebsitesSection } from '@/components/admin/manage/company/manage-websites-section';

interface WebsitesTabProps {
  companyId: string;
  companyIsInactive?: boolean;
}

/** Standalone company workspace tab — same website admin UI as Manage → Websites. */
export function WebsitesTab({ companyId, companyIsInactive = false }: WebsitesTabProps): JSX.Element {
  return (
    <ManageWebsitesSection
      companyId={companyId}
      companyIsInactive={companyIsInactive}
      showManageIntro={false}
    />
  );
}
