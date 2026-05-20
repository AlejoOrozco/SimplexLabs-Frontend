'use client';

import Link from 'next/link';
import { useCompanies } from '@/lib/hooks/use-companies';
import { useSubscriptions } from '@/lib/hooks/use-subscriptions';
import { SubStatus } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function AdminCompaniesDirectory(): JSX.Element {
  const { data: companies = [], isLoading } = useCompanies();
  const { data: subscriptions = [] } = useSubscriptions();

  if (isLoading) {
    return <p className="text-sm text-text-secondary">Loading companies…</p>;
  }

  return (
    <div className="rounded-lg border border-border-default bg-surface-page">
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
            return (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/clients/${c.id}`} className="text-text-brand hover:underline">
                    {c.name}
                  </Link>
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
