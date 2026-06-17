'use client';

import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { ApiClientError } from '@/lib/api/client';
import { adminSendUserCredentialsEmail } from '@/lib/api/admin-user-creation.api';
import { canDeactivateUser } from '@/lib/admin/company-lifecycle';
import { useAuth } from '@/context/auth-context';
import { queryKeys } from '@/lib/hooks/query-keys';
import { useDeleteUser, useUsersByCompany } from '@/lib/hooks/use-users';
import { notify } from '@/lib/toast';
import type { User } from '@/lib/types';
import { fullName, sessionRoleLabel } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CompanyTeamTabProps {
  companyId: string;
  companyIsInactive?: boolean;
}

function sortTenantUsers(rows: readonly User[]): User[] {
  return [...rows].sort((a, b) => {
    const ln = a.lastName.localeCompare(b.lastName);
    if (ln !== 0) return ln;
    return a.firstName.localeCompare(b.firstName);
  });
}

export function CompanyTeamTab({ companyId, companyIsInactive = false }: CompanyTeamTabProps): JSX.Element {
  const { isSimplexAdmin } = useAuth();
  const qc = useQueryClient();
  const usersQuery = useUsersByCompany(companyId);
  const [confirmUser, setConfirmUser] = useState<User | null>(null);

  const deleteUserMutation = useDeleteUser();

  const deleteUserActionMutation = useMutation({
    mutationFn: async (userId: string) => deleteUserMutation.mutateAsync(userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.users.all });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
      notify.success('User deactivated');
      setConfirmUser(null);
    },
    onError: (err) => {
      if (err instanceof ApiClientError && err.status === 404) {
        void qc.invalidateQueries({ queryKey: queryKeys.users.all });
        void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
        void qc.invalidateQueries({ queryKey: queryKeys.admin.companies.all });
        void qc.invalidateQueries({ queryKey: queryKeys.admin.companies.detail(companyId) });
        notify.info('Already deleted or not found');
        setConfirmUser(null);
        return;
      }
      const message = err instanceof ApiClientError ? err.message : 'Could not deactivate user';
      notify.error(message);
    },
  });

  const sendCredentialsMutation = useMutation({
    mutationFn: async (userId: string) => adminSendUserCredentialsEmail(userId),
    onSuccess: () => {
      notify.success('Credentials email queued');
    },
    onError: (err) => {
      const message = err instanceof ApiClientError ? err.message : 'Could not send credentials email';
      notify.error(message);
    },
  });

  if (usersQuery.isLoading) {
    return <p className="text-sm text-text-secondary">Loading team…</p>;
  }
  if (usersQuery.isError) {
    return (
      <div className="rounded-lg border border-error bg-error-surface p-4 text-sm text-error-dark">
        Could not load users for this company.
      </div>
    );
  }

  const rows = sortTenantUsers((usersQuery.data ?? []).filter((u) => u.companyId === companyId));

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Tenant users with login access. Use the menu to deactivate user accounts, open permissions, or email a fresh password.
      </p>
      {companyIsInactive ? (
        <p className="text-xs text-text-secondary">Company is inactive. Team edits are disabled.</p>
      ) : null}

      <div className="rounded-lg border border-border-default bg-surface-base">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[72px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-text-secondary">
                  No users found for this company.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{fullName(user)}</TableCell>
                  <TableCell className="text-text-secondary">{user.email}</TableCell>
                  <TableCell>
                    <span className="text-sm text-text-primary">{sessionRoleLabel(user.role)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'success' : 'neutral'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" aria-label="User actions">
                          <MoreHorizontal className="size-4" aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isSimplexAdmin && canDeactivateUser(user, companyIsInactive) ? (
                          <DropdownMenuItem
                            disabled={deleteUserActionMutation.isPending}
                            onSelect={() => setConfirmUser(user)}
                          >
                            Delete user
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}/permissions`}>View permissions</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={sendCredentialsMutation.isPending || companyIsInactive}
                          onSelect={() => {
                            sendCredentialsMutation.mutate(user.id);
                          }}
                        >
                          Reset password (email)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={confirmUser !== null} onOpenChange={(open) => !open && setConfirmUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate user account</DialogTitle>
            <DialogDescription>
              {confirmUser ? (
                <>This will deactivate the user account.</>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setConfirmUser(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!confirmUser || deleteUserActionMutation.isPending}
              onClick={() => {
                if (!confirmUser) return;
                deleteUserActionMutation.mutate(confirmUser.id);
              }}
            >
              {deleteUserActionMutation.isPending ? 'Saving…' : 'Deactivate user'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
