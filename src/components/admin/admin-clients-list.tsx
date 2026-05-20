'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { EditCompanyModal } from '@/components/companies/EditCompanyModal';
import { Button } from '@/components/ui/button';
import { useCompanies } from '@/lib/hooks/use-companies';
import { useSubscriptions } from '@/lib/hooks/use-subscriptions';
import { SubStatus, type Company } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function AdminClientsList(): JSX.Element {
  const { data: companies = [], isLoading } = useCompanies();
  const { data: subscriptions = [] } = useSubscriptions();
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const rows = useMemo(() => {
    return companies.map((c) => {
      const active = subscriptions.filter((s) => s.companyId === c.id && s.status === SubStatus.ACTIVE);
      const planLabel =
        active.length === 0
          ? '—'
          : active
              .map((s) => s.plan?.name ?? 'Plan')
              .filter(Boolean)
              .join(', ');
      return { company: c, planLabel, activeCount: active.length };
    });
  }, [companies, subscriptions]);

  if (isLoading) {
    return <p className="text-sm text-text-secondary">Loading clients…</p>;
  }

  return (
    <div className="rounded-lg border border-border-default bg-surface-page">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Niche</TableHead>
            <TableHead>Active plans</TableHead>
            <TableHead>Plans</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ company, planLabel, activeCount }) => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">
                <Link href={`/admin/clients/${company.id}`} className="text-text-brand hover:underline">
                  {company.name}
                </Link>
              </TableCell>
              <TableCell>{company.niche}</TableCell>
              <TableCell>{activeCount}</TableCell>
              <TableCell className="max-w-xs truncate text-text-secondary">{planLabel}</TableCell>
              <TableCell className="text-right">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingCompany(company)}>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editingCompany ? (
        <EditCompanyModal company={editingCompany} open onClose={() => setEditingCompany(null)} />
      ) : null}
    </div>
  );
}
