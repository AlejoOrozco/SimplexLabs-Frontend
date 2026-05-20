'use client';

import Link from 'next/link';
import { useSubscriptions } from '@/lib/hooks/use-subscriptions';
import { useCompanies } from '@/lib/hooks/use-companies';
import { pickPrimaryCompanyAdmin } from '@/lib/admin/pick-primary-company-admin';
import { adminCompanyWorkspaceHref } from '@/lib/admin/admin-company-workspace-href';
import { SubStatus } from '@/lib/types';
import { fullName } from '@/lib/utils/format';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function AdminCompaniesDirectory(): JSX.Element {
  const { data: companies = [], isLoading } = useCompanies();
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
            <TableHead>Active plans</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((c) => {
            const activeCount = subscriptions.filter((s) => s.companyId === c.id && s.status === SubStatus.ACTIVE).length;
            const primaryAdmin = pickPrimaryCompanyAdmin(c);
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
                      </>
                    ) : (
                      <>Admin: —</>
                    )}
                  </p>
                </TableCell>
                <TableCell>{c.niche}</TableCell>
                <TableCell>{activeCount}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
