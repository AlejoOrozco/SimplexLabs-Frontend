'use client';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/client';
import { queryKeys } from '@/lib/hooks/query-keys';
import { useDeleteUser } from '@/lib/hooks/use-users';
import type { User } from '@/lib/types';
import { notify } from '@/lib/toast';
import { useState } from 'react';

interface ClientAccountActionsProps {
  user: User;
}

export function ClientAccountActions({ user }: ClientAccountActionsProps): JSX.Element {
  const qc = useQueryClient();
  const deleteUser = useDeleteUser();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async (): Promise<void> => {
    try {
      await deleteUser.mutateAsync(user.id);
      notify.success('User deactivated');
      setConfirmOpen(false);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        void qc.invalidateQueries({ queryKey: queryKeys.users.all });
        void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
        notify.info('Already deleted or not found');
        setConfirmOpen(false);
        return;
      }
      notify.error('Could not deactivate account');
    }
  };

  return (
    <div className="mt-2 space-y-2 text-sm">
      <p className="text-text-secondary">
        Primary company contact:{' '}
        <span className="font-medium text-text-primary">
          {user.firstName} {user.lastName}
        </span>{' '}
        ({user.email}) — {user.isActive ? 'Active' : 'Inactive'}
      </p>
      <Button type="button" variant="destructive" disabled={deleteUser.isPending} onClick={() => setConfirmOpen(true)}>
        Deactivate account
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Deactivate user account"
        description="This will deactivate the user account."
        confirmLabel="Deactivate user"
        variant="destructive"
        isLoading={deleteUser.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
