'use client';

import Link from 'next/link';
import { useSubscriptions } from '@/lib/hooks/use-subscriptions';
import { useAdminCompanies } from '@/lib/hooks/use-admin-companies';
import { adminCompanyWorkspaceHref } from '@/lib/admin/admin-company-workspace-href';
import { SubStatus } from '@/lib/types';
import { fullName, nicheLabel } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function AdminCompaniesDirectory(): JSX.Element {
  const { data: companies = [], isLoading } = useAdminCompanies();
  const { data: subscriptions = [] } = useSubscriptions();

  if (isLoading) {
    return <p className="text-sm text-text-secondary">Loading companies…</p>;
  }

  return (
    <div className="rounded-lg border border-border-default bg-surface-base">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Niche</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Active plans</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((c) => {
            const inactive = !c.isActive;
            const showOperationalHint = c.isActive && !c.isOperational;
            const activeCount = subscriptions.filter((s) => s.companyId === c.id && s.status === SubStatus.ACTIVE).length;
            const primaryAdmin = c.primaryAdmin;
            return (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="font-medium">
                    <Link href={adminCompanyWorkspaceHref(c.id)} className="text-text-brand hover:underline">
                      {c.name}
                    </Link>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {primaryAdmin ? (
                      <>
                        Admin: {fullName(primaryAdmin)} · {primaryAdmin.email}
                        {!primaryAdmin.isActive ? ' (inactive)' : null}
                      </>
                    ) : (
                      <>Admin: —</>
                    )}
                  </p>
                </TableCell>
                <TableCell>{nicheLabel(c.niche)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant={inactive ? 'neutral' : 'success'}>{inactive ? 'Inactive' : 'Active'}</Badge>
                    {showOperationalHint ? (
                      <p className="text-xs text-text-secondary">No active users</p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{activeCount}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
