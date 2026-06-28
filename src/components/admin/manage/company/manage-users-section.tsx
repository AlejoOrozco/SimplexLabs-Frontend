'use client';

import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { ChangeUserRoleModal } from '@/components/admin/manage/company/change-user-role-modal';
import { CreateCompanyUserModal } from '@/components/admin/manage/company/create-company-user-modal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/shared/Skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/auth-context';
import { getApiErrorMessage } from '@/lib/api/get-api-error-message';
import {
  useAdminCompanyUsers,
  useAdminDeactivateUser,
  useAdminReactivateUser,
} from '@/lib/hooks/use-admin-company-users';
import type { AdminCompanyHubUser } from '@/lib/types/admin-hub';
import { fullName, sessionRoleLabel } from '@/lib/utils/format';
import { notify } from '@/lib/toast';

interface ManageUsersSectionProps {
  companyId: string;
  companyIsInactive?: boolean;
  showManageIntro?: boolean;
}

function sortCompanyUsers(rows: readonly AdminCompanyHubUser[]): AdminCompanyHubUser[] {
  return [...rows].sort((a, b) => {
    const ln = a.lastName.localeCompare(b.lastName);
    if (ln !== 0) return ln;
    return a.firstName.localeCompare(b.firstName);
  });
}

function canChangeUserRole(user: AdminCompanyHubUser): boolean {
  return user.roleName === 'COMPANY_ADMIN' || user.roleName === 'COMPANY_STAFF';
}

export function ManageUsersSection({
  companyId,
  companyIsInactive = false,
  showManageIntro = true,
}: ManageUsersSectionProps): JSX.Element {
  const { isSimplexAdmin } = useAuth();
  const usersQuery = useAdminCompanyUsers(companyId);
  const deactivateUser = useAdminDeactivateUser(companyId);
  const reactivateUser = useAdminReactivateUser(companyId);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFlow, setCreateFlow] = useState<'client' | 'staff'>('client');
  const [roleChangeUser, setRoleChangeUser] = useState<AdminCompanyHubUser | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<AdminCompanyHubUser | null>(null);

  const rows = sortCompanyUsers(usersQuery.data ?? []);

  const openCreate = (flow: 'client' | 'staff'): void => {
    setCreateFlow(flow);
    setCreateModalOpen(true);
  };

  const handleDeactivate = async (): Promise<void> => {
    if (!deactivateTarget) return;
    try {
      await deactivateUser.mutateAsync(deactivateTarget.id);
      notify.success('User deactivated');
      setDeactivateTarget(null);
    } catch (error) {
      notify.error(getApiErrorMessage(error, 'Could not deactivate user'));
    }
  };

  const handleReactivate = async (user: AdminCompanyHubUser): Promise<void> => {
    try {
      await reactivateUser.mutateAsync(user.id);
      notify.success('User reactivated');
    } catch (error) {
      notify.error(getApiErrorMessage(error, 'Could not reactivate user'));
    }
  };

  if (usersQuery.isLoading) {
    return (
      <div className="space-y-4">
        {showManageIntro ? <Skeleton className="h-12 w-full max-w-xl" /> : null}
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (usersQuery.isError) {
    return (
      <div className="rounded-lg border border-error bg-error-surface p-4 text-sm text-error-dark">
        Could not load users for this company.
      </div>
    );
  }

  if (companyIsInactive) {
    return (
      <p className="text-sm text-text-secondary">
        This company is inactive. User changes are disabled until the company is reactivated.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {showManageIntro ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-text-primary">Users</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Create client and staff logins, change roles, and manage account status for this company.
            </p>
          </div>
          {isSimplexAdmin ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => openCreate('client')}>
                Create client admin
              </Button>
              <Button type="button" size="sm" onClick={() => openCreate('staff')}>
                Create staff user
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {!showManageIntro && isSimplexAdmin ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => openCreate('client')}>
            Create client admin
          </Button>
          <Button type="button" size="sm" onClick={() => openCreate('staff')}>
            Create staff user
          </Button>
        </div>
      ) : null}

      <div className="rounded-lg border border-border-default bg-surface-base">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>First login</TableHead>
              <TableHead className="w-[72px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-sm text-text-secondary">
                  No users found for this company.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{fullName(user)}</TableCell>
                  <TableCell className="text-text-secondary">{user.email}</TableCell>
                  <TableCell>{sessionRoleLabel(user.roleName)}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'success' : 'neutral'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-text-secondary">
                    {user.firstLoginCompleted ? 'Completed' : 'Pending'}
                  </TableCell>
                  <TableCell className="text-right">
                    {isSimplexAdmin ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="ghost" size="icon" aria-label="User actions">
                            <MoreHorizontal className="size-4" aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.isActive && canChangeUserRole(user) ? (
                            <DropdownMenuItem onSelect={() => setRoleChangeUser(user)}>
                              Change role
                            </DropdownMenuItem>
                          ) : null}
                          {user.isActive ? (
                            <DropdownMenuItem onSelect={() => setDeactivateTarget(user)}>
                              Deactivate user
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              disabled={reactivateUser.isPending}
                              onSelect={() => void handleReactivate(user)}
                            >
                              Reactivate user
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.id}/permissions`}>View permissions</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateCompanyUserModal
        companyId={companyId}
        open={createModalOpen}
        initialFlow={createFlow}
        onClose={() => setCreateModalOpen(false)}
      />

      {roleChangeUser ? (
        <ChangeUserRoleModal
          companyId={companyId}
          user={roleChangeUser}
          open
          onClose={() => setRoleChangeUser(null)}
        />
      ) : null}

      <ConfirmDialog
        open={deactivateTarget !== null}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        title="Deactivate user?"
        description={
          deactivateTarget
            ? `Deactivate ${fullName(deactivateTarget)}? They will lose access until reactivated.`
            : undefined
        }
        confirmLabel="Deactivate user"
        variant="destructive"
        onConfirm={handleDeactivate}
        isLoading={deactivateUser.isPending}
      />
    </div>
  );
}
