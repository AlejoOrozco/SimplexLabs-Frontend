'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { CredentialsConfirmation } from '@/components/admin/credentials-confirmation';
import { FormField } from '@/components/shared/FormField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getApiErrorMessage } from '@/lib/api/get-api-error-message';
import { useCompany } from '@/lib/hooks/use-companies';
import { useAdminCreateCompanyUser } from '@/lib/hooks/use-admin-company-users';
import {
  createCompanyClientUserSchema,
  createCompanyStaffUserSchema,
  type CreateCompanyClientUserFormValues,
  type CreateCompanyStaffUserFormValues,
} from '@/lib/schemas/admin-hub/admin-user.schema';
import type { AdminCreateUserResult } from '@/lib/types/admin-provisioning';
import { notify } from '@/lib/toast';

type CreateUserFlow = 'client' | 'staff';

interface CreateCompanyUserModalProps {
  companyId: string;
  open: boolean;
  onClose: () => void;
  initialFlow?: CreateUserFlow;
}

export function CreateCompanyUserModal({
  companyId,
  open,
  onClose,
  initialFlow = 'client',
}: CreateCompanyUserModalProps): JSX.Element {
  const companyQuery = useCompany(companyId);
  const createUser = useAdminCreateCompanyUser(companyId);
  const [flow, setFlow] = useState<CreateUserFlow>(initialFlow);
  const [createdUser, setCreatedUser] = useState<AdminCreateUserResult | null>(null);

  const clientForm = useForm<CreateCompanyClientUserFormValues>({
    resolver: zodResolver(createCompanyClientUserSchema),
    defaultValues: { firstName: '', lastName: '', email: '' },
  });

  const staffForm = useForm<CreateCompanyStaffUserFormValues>({
    resolver: zodResolver(createCompanyStaffUserSchema),
    defaultValues: { firstName: '', lastName: '', email: '', roleName: 'COMPANY_STAFF' },
  });

  useEffect(() => {
    if (!open) return;
    setFlow(initialFlow);
    setCreatedUser(null);
    clientForm.reset({ firstName: '', lastName: '', email: '' });
    staffForm.reset({ firstName: '', lastName: '', email: '', roleName: 'COMPANY_STAFF' });
  }, [open, initialFlow, clientForm, staffForm]);

  const handleClose = (): void => {
    setCreatedUser(null);
    onClose();
  };

  const submitClient = async (values: CreateCompanyClientUserFormValues): Promise<void> => {
    try {
      const result = await createUser.mutateAsync({
        flow: 'client',
        dto: { companyId, ...values },
      });
      setCreatedUser(result);
      notify.success('Client admin created');
    } catch (error) {
      notify.error(getApiErrorMessage(error, 'Could not create client user'));
    }
  };

  const submitStaff = async (values: CreateCompanyStaffUserFormValues): Promise<void> => {
    try {
      const result = await createUser.mutateAsync({
        flow: 'staff',
        dto: { companyId, ...values },
      });
      setCreatedUser(result);
      notify.success('Staff user created');
    } catch (error) {
      notify.error(getApiErrorMessage(error, 'Could not create staff user'));
    }
  };

  const companyName = companyQuery.data?.name ?? createdUser?.companyName ?? 'Company';

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="max-w-lg">
        {createdUser ? (
          <>
            <DialogHeader>
              <DialogTitle>Share credentials</DialogTitle>
            </DialogHeader>
            <CredentialsConfirmation
              result={{ ...createdUser, companyName: createdUser.companyName || companyName }}
              onDone={handleClose}
              canSendEmail={flow === 'client'}
            />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create user</DialogTitle>
            </DialogHeader>

            <FormField label="Account type">
              <Select
                value={flow}
                onValueChange={(value: CreateUserFlow) => setFlow(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client admin (primary company login)</SelectItem>
                  <SelectItem value="staff">Staff user (admin or staff role)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {flow === 'client' ? (
              <form onSubmit={clientForm.handleSubmit(submitClient)} className="space-y-4" noValidate>
                <UserIdentityFields form={clientForm} />
                <p className="text-sm text-text-secondary">
                  Creates a company admin account. The server generates a password you can share on the
                  next screen.
                </p>
                <DialogActions onCancel={handleClose} pending={createUser.isPending} submitLabel="Create client admin" />
              </form>
            ) : (
              <form onSubmit={staffForm.handleSubmit(submitStaff)} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="First name" required error={staffForm.formState.errors.firstName?.message}>
                    <Input {...staffForm.register('firstName')} autoComplete="off" />
                  </FormField>
                  <FormField label="Last name" required error={staffForm.formState.errors.lastName?.message}>
                    <Input {...staffForm.register('lastName')} autoComplete="off" />
                  </FormField>
                </div>
                <FormField label="Email" required error={staffForm.formState.errors.email?.message}>
                  <Input {...staffForm.register('email')} type="email" autoComplete="off" />
                </FormField>
                <FormField label="Role" required error={staffForm.formState.errors.roleName?.message}>
                  <Select
                    value={staffForm.watch('roleName')}
                    onValueChange={(value: 'COMPANY_ADMIN' | 'COMPANY_STAFF') =>
                      staffForm.setValue('roleName', value, { shouldValidate: true })
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
                <DialogActions onCancel={handleClose} pending={createUser.isPending} submitLabel="Create staff user" />
              </form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function UserIdentityFields({
  form,
}: {
  form: UseFormReturn<CreateCompanyClientUserFormValues>;
}): JSX.Element {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="First name" required error={form.formState.errors.firstName?.message}>
          <Input {...form.register('firstName')} autoComplete="off" />
        </FormField>
        <FormField label="Last name" required error={form.formState.errors.lastName?.message}>
          <Input {...form.register('lastName')} autoComplete="off" />
        </FormField>
      </div>
      <FormField label="Email" required error={form.formState.errors.email?.message}>
        <Input {...form.register('email')} type="email" autoComplete="off" />
      </FormField>
    </>
  );
}

function DialogActions({
  onCancel,
  pending,
  submitLabel,
}: {
  onCancel: () => void;
  pending: boolean;
  submitLabel: string;
}): JSX.Element {
  return (
    <div className="flex gap-3 pt-2">
      <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={pending}>
        Cancel
      </Button>
      <Button type="submit" className="flex-1" disabled={pending}>
        {pending ? 'Creating…' : submitLabel}
      </Button>
    </div>
  );
}
