'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/shared/FormField';
import { useAuth } from '@/context/auth-context';
import { ApiClientError } from '@/lib/api/client';
import { WHATSAPP_CREDENTIALS_SAVE_ENABLED } from '@/lib/constants/whatsapp-config';
import { useUpdateCompany } from '@/lib/hooks/use-companies';
import { editCompanyModalSchema, type EditCompanyModalFormValues, type UpdateCompanyDto } from '@/lib/schemas/company.schema';
import type { Company } from '@/lib/types';
import { notify } from '@/lib/toast';

function emptyToNull(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const t = value.trim();
  return t.length === 0 ? null : t;
}

interface EditCompanyModalProps {
  company: Company;
  open: boolean;
  onClose: () => void;
}

export function EditCompanyModal({ company, open, onClose }: EditCompanyModalProps): JSX.Element {
  const { isSimplexAdmin } = useAuth();
  const updateCompany = useUpdateCompany(company.id);
  const showWhatsappConfig = isSimplexAdmin;
  const [whatsappOpen, setWhatsappOpen] = useState(false);

  const form = useForm<EditCompanyModalFormValues>({
    resolver: zodResolver(editCompanyModalSchema),
    shouldUnregister: true,
    defaultValues: {
      name: company.name,
      phone: company.phone ?? '',
      address: company.address ?? '',
      notificationPhone: company.notificationPhone ?? '',
      notificationEmail: company.notificationEmail ?? '',
      whatsappPhoneNumberId: company.whatsappPhoneNumberId ?? '',
      whatsappPhoneNumber: company.whatsappPhoneNumber ?? '',
      dialogApiKey: '',
      dialogBaseUrl: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    setWhatsappOpen(false);
    form.reset({
      name: company.name,
      phone: company.phone ?? '',
      address: company.address ?? '',
      notificationPhone: company.notificationPhone ?? '',
      notificationEmail: company.notificationEmail ?? '',
      whatsappPhoneNumberId: company.whatsappPhoneNumberId ?? '',
      whatsappPhoneNumber: company.whatsappPhoneNumber ?? '',
      dialogApiKey: '',
      dialogBaseUrl: '',
    });
  }, [open, company, form]);

  const onSubmit = async (data: EditCompanyModalFormValues): Promise<void> => {
    try {
      const base: UpdateCompanyDto = {
        niche: company.niche,
        name: data.name,
        phone: emptyToNull(data.phone as string | undefined) ?? data.phone,
        address: emptyToNull(data.address as string | undefined) ?? data.address,
        notificationPhone: emptyToNull(data.notificationPhone as string | undefined) ?? data.notificationPhone,
        notificationEmail:
          data.notificationEmail === '' || data.notificationEmail === undefined
            ? null
            : data.notificationEmail,
      };
      if (showWhatsappConfig) {
        base.whatsappPhoneNumberId =
          emptyToNull(data.whatsappPhoneNumberId as string | undefined) ?? data.whatsappPhoneNumberId;
        base.whatsappPhoneNumber =
          emptyToNull(data.whatsappPhoneNumber as string | undefined) ?? data.whatsappPhoneNumber;
        if (WHATSAPP_CREDENTIALS_SAVE_ENABLED) {
          const apiKey = data.dialogApiKey?.trim();
          if (apiKey) base.dialogApiKey = apiKey;
          const baseUrl = data.dialogBaseUrl?.trim();
          if (baseUrl) base.dialogBaseUrl = baseUrl;
        }
      }
      await updateCompany.mutateAsync(base);
      notify.success(
        showWhatsappConfig && (data.whatsappPhoneNumber || data.whatsappPhoneNumberId)
          ? 'WhatsApp settings updated'
          : 'Company updated',
      );
      onClose();
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : 'Could not update company';
      notify.error(message);
    }
  };

  const handleOpenChange = (next: boolean): void => {
    if (!next) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {company.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Company name" required error={form.formState.errors.name?.message}>
            <Input {...form.register('name')} />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Phone" error={form.formState.errors.phone?.message}>
              <Input {...form.register('phone')} type="tel" />
            </FormField>
            <FormField
              label="Notification phone"
              error={form.formState.errors.notificationPhone?.message}
            >
              <Input {...form.register('notificationPhone')} type="tel" placeholder="+57…" />
            </FormField>
          </div>

          <FormField label="Notification email" error={form.formState.errors.notificationEmail?.message}>
            <Input {...form.register('notificationEmail')} type="email" autoComplete="off" />
          </FormField>

          <FormField label="Address" error={form.formState.errors.address?.message}>
            <Textarea {...form.register('address')} rows={2} />
          </FormField>

          {showWhatsappConfig ? (
            <details
              className="rounded-lg border border-border-default p-4"
              open={whatsappOpen}
              onToggle={(event) => setWhatsappOpen((event.target as HTMLDetailsElement).open)}
            >
              <summary className="cursor-pointer text-sm font-medium text-text-primary">
                WhatsApp Configuration
              </summary>
              <div className="mt-4 space-y-3">
                <FormField label="Phone number" error={form.formState.errors.whatsappPhoneNumber?.message}>
                  <Input {...form.register('whatsappPhoneNumber')} type="tel" placeholder="+14155552671" />
                </FormField>
                <FormField
                  label="Phone number ID"
                  error={form.formState.errors.whatsappPhoneNumberId?.message}
                >
                  <Input
                    {...form.register('whatsappPhoneNumberId')}
                    placeholder='From provider dashboard; use "sandbox" for sandbox'
                  />
                </FormField>
                {WHATSAPP_CREDENTIALS_SAVE_ENABLED ? (
                  <>
                    <FormField label="WhatsApp API Key">
                      <Input
                        {...form.register('dialogApiKey')}
                        type="password"
                        autoComplete="new-password"
                        placeholder="Leave blank to keep unchanged"
                      />
                    </FormField>
                    <FormField
                      label="API base URL (optional)"
                      error={form.formState.errors.dialogBaseUrl?.message}
                    >
                      <Input
                        {...form.register('dialogBaseUrl')}
                        placeholder="https://waba-sandbox.360dialog.io"
                      />
                    </FormField>
                  </>
                ) : (
                  <p className="text-xs text-text-secondary">
                    API key and base URL are not saved via the API yet. Use database seeding until the backend
                    exposes these fields.
                  </p>
                )}
              </div>
            </details>
          ) : null}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={updateCompany.isPending}>
              {updateCompany.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
