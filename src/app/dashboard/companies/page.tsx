'use client';

import { useState } from 'react';
import { CompanyForm } from '@/components/companies/CompanyForm';
import { CompanyList } from '@/components/companies/CompanyList';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
} from '@/lib/hooks/use-companies';
import type { Company } from '@/lib/types';

export default function CompaniesPage(): JSX.Element {
  return (
    <AdminGuard>
      <CompaniesContent />
    </AdminGuard>
  );
}

function CompaniesContent(): JSX.Element {
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Company | null>(null);

  const companies = useCompanies();
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany(editing?.id ?? '');

  return (
    <PageWrapper
      title="Companies"
      description="Tenants on the platform."
      actions={
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          New company
        </Button>
      }
    >
      {companies.isLoading ? (
        <LoadingSpinner />
      ) : companies.isError ? (
        <p className="text-sm text-red-700">{companies.error.message}</p>
      ) : (
        <CompanyList companies={companies.data ?? []} onRowClick={setEditing} />
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New company</DialogTitle>
          </DialogHeader>
          <CompanyForm
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
              setIsCreateOpen(false);
            }}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit company</DialogTitle>
          </DialogHeader>
          {editing ? (
            <CompanyForm
              defaultValues={{
                name: editing.name,
                niche: editing.niche,
                phone: editing.phone,
                address: editing.address,
              }}
              onSubmit={async (values) => {
                await updateMutation.mutateAsync(values);
                setEditing(null);
              }}
              onCancel={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
