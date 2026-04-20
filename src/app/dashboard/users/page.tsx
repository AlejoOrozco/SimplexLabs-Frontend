'use client';

import { useState } from 'react';
import { UserForm } from '@/components/users/UserForm';
import { UserList } from '@/components/users/UserList';
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
import { useCompanies } from '@/lib/hooks/use-companies';
import { useCreateUser, useUsers } from '@/lib/hooks/use-users';

export default function UsersPage(): JSX.Element {
  return (
    <AdminGuard>
      <UsersContent />
    </AdminGuard>
  );
}

function UsersContent(): JSX.Element {
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  const users = useUsers();
  const companies = useCompanies();
  const createMutation = useCreateUser();

  return (
    <PageWrapper
      title="Users"
      description="Platform admins and client users."
      actions={
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          New user
        </Button>
      }
    >
      {users.isLoading ? (
        <LoadingSpinner />
      ) : users.isError ? (
        <p className="text-sm text-red-700">{users.error.message}</p>
      ) : (
        <UserList users={users.data ?? []} />
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New user</DialogTitle>
          </DialogHeader>
          <UserForm
            companies={companies.data ?? []}
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
              setIsCreateOpen(false);
            }}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
