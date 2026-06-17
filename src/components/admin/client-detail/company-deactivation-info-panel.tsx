'use client';

import type { AdminCompanyDetail } from '@/lib/types/admin-companies';
import { formatDate } from '@/lib/utils/format';

interface CompanyDeactivationInfoPanelProps {
  detail: Pick<AdminCompanyDetail, 'isActive' | 'deactivatedAt' | 'deactivationReason'>;
}

export function CompanyDeactivationInfoPanel({ detail }: CompanyDeactivationInfoPanelProps): JSX.Element | null {
  if (detail.isActive) {
    return null;
  }

  return (
    <section className="rounded-lg border border-border-default bg-surface-raised p-4">
      <h3 className="text-sm font-semibold text-text-primary">Deactivation info</h3>
      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="text-text-secondary">Status</dt>
          <dd className="font-medium text-text-primary">Inactive</dd>
        </div>
        {detail.deactivatedAt ? (
          <div>
            <dt className="text-text-secondary">Deactivated at</dt>
            <dd className="text-text-primary">{formatDate(detail.deactivatedAt)}</dd>
          </div>
        ) : null}
        {detail.deactivationReason ? (
          <div>
            <dt className="text-text-secondary">Reason</dt>
            <dd className="text-text-primary">{detail.deactivationReason}</dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-3 text-xs text-text-secondary">
        Tenant actions are disabled while the company is inactive. Use Reactivate company to restore access for all
        users.
      </p>
    </section>
  );
}
