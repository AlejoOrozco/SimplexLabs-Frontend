'use client';

import Link from 'next/link';
import { adminCompanyManageSectionHref } from '@/lib/admin/admin-company-workspace-href';
import { adminSetupGapLabel, adminSetupGapToManageSection } from '@/lib/admin/admin-hub-utils';
import type { AdminSetupGapCode } from '@/lib/types/admin-hub';
import { cn } from '@/lib/utils/cn';

interface SetupGapChipsProps {
  companyId: string;
  gaps: readonly AdminSetupGapCode[];
  className?: string;
}

export function SetupGapChips({ companyId, gaps, className }: SetupGapChipsProps): JSX.Element | null {
  if (gaps.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {gaps.map((gap) => (
        <Link
          key={gap}
          href={adminCompanyManageSectionHref(companyId, adminSetupGapToManageSection(gap))}
          scroll={false}
          className="rounded-full border border-warning/50 bg-warning-surface px-3 py-1 text-xs font-medium text-warning-dark transition-colors hover:border-warning hover:bg-warning-surface/80"
        >
          {adminSetupGapLabel(gap)}
        </Link>
      ))}
    </div>
  );
}
