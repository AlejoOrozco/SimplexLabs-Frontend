'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/shared/FormField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getApiErrorMessage } from '@/lib/api/get-api-error-message';
import { useAdminUpdateUserRole } from '@/lib/hooks/use-admin-company-users';
import {
  changeCompanyUserRoleSchema,
  type ChangeCompanyUserRoleFormValues,
} from '@/lib/schemas/admin-hub/admin-user.schema';
import type { AdminCompanyHubUser } from '@/lib/types/admin-hub';
import { fullName, sessionRoleLabel } from '@/lib/utils/format';
import { notify } from '@/lib/toast';

interface ChangeUserRoleModalProps {
  companyId: string;
  user: AdminCompanyHubUser;
  open: boolean;
  onClose: () => void;
}

export function ChangeUserRoleModal({
  companyId,
  user,
  open,
  onClose,
}: ChangeUserRoleModalProps): JSX.Element {
  const updateRole = useAdminUpdateUserRole(companyId);

  const form = useForm<ChangeCompanyUserRoleFormValues>({
    resolver: zodResolver(changeCompanyUserRoleSchema),
    defaultValues: {
      newRoleName:
        user.roleName === 'COMPANY_ADMIN' || user.roleName === 'COMPANY_STAFF'
          ? user.roleName
          : 'COMPANY_STAFF',
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      newRoleName:
        user.roleName === 'COMPANY_ADMIN' || user.roleName === 'COMPANY_STAFF'
          ? user.roleName
          : 'COMPANY_STAFF',
    });
  }, [open, user, form]);

  const onSubmit = async (values: ChangeCompanyUserRoleFormValues): Promise<void> => {
    try {
      await updateRole.mutateAsync({ userId: user.id, newRoleName: values.newRoleName });
      notify.success('User role updated');
      onClose();
    } catch (error) {
      notify.error(getApiErrorMessage(error, 'Could not update user role'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-text-secondary">
          {fullName(user)} · current role: {sessionRoleLabel(user.roleName)}
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="New role" required error={form.formState.errors.newRoleName?.message}>
            <Select
              value={form.watch('newRoleName')}
              onValueChange={(value: 'COMPANY_ADMIN' | 'COMPANY_STAFF') =>
                form.setValue('newRoleName', value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPANY_ADMIN">Company admin</SelectItem>
                <SelectItem value="COMPANY_STAFF">Company staff</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <p className="text-xs text-text-secondary">
            Permission overrides are cleared when the role changes.
          </p>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={updateRole.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateRole.isPending}>
              {updateRole.isPending ? 'Saving…' : 'Save role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
