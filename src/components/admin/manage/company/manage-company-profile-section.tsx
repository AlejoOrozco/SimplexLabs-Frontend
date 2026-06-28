'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FormField } from '@/components/shared/FormField';
import { Skeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getApiErrorMessage } from '@/lib/api/get-api-error-message';
import { useAdminUpdateCompanyProfile } from '@/lib/hooks/use-admin-company-profile';
import { useCompany } from '@/lib/hooks/use-companies';
import {
  adminCompanyProfileSchema,
  type AdminCompanyProfileFormValues,
} from '@/lib/schemas/admin-hub/admin-company-profile.schema';
import type { AdminUpdateCompanyProfileDto } from '@/lib/types/admin-hub';
import { Niche } from '@/lib/types';
import { nicheLabel } from '@/lib/utils/format';
import { notify } from '@/lib/toast';

const NICHES: readonly Niche[] = [Niche.GYM, Niche.MEDICAL, Niche.ENTREPRENEUR];

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed.length === 0 ? null : trimmed;
}

function companyToFormValues(company: {
  name: string;
  niche: Niche;
  phone: string | null;
  address: string | null;
  notificationPhone?: string | null;
  notificationEmail?: string | null;
  whatsappPhoneNumberId?: string | null;
  whatsappPhoneNumber?: string | null;
}): AdminCompanyProfileFormValues {
  return {
    name: company.name,
    niche: company.niche,
    phone: company.phone ?? '',
    address: company.address ?? '',
    notificationPhone: company.notificationPhone ?? '',
    notificationEmail: company.notificationEmail ?? '',
    whatsappPhoneNumberId: company.whatsappPhoneNumberId ?? '',
    whatsappPhoneNumber: company.whatsappPhoneNumber ?? '',
    dialogApiKey: '',
    dialogBaseUrl: '',
  };
}

function formValuesToDto(values: AdminCompanyProfileFormValues): AdminUpdateCompanyProfileDto {
  const notificationEmailRaw = values.notificationEmail;
  const notificationEmail =
    notificationEmailRaw == null || notificationEmailRaw === ''
      ? null
      : notificationEmailRaw.trim();

  return {
    name: values.name.trim(),
    niche: values.niche,
    phone: emptyToNull(values.phone),
    address: emptyToNull(values.address),
    notificationPhone: emptyToNull(values.notificationPhone),
    notificationEmail,
    whatsappPhoneNumberId: emptyToNull(values.whatsappPhoneNumberId),
    whatsappPhoneNumber: emptyToNull(values.whatsappPhoneNumber),
  };
}

interface ManageCompanyProfileSectionProps {
  companyId: string;
  companyIsInactive?: boolean;
}

export function ManageCompanyProfileSection({
  companyId,
  companyIsInactive = false,
}: ManageCompanyProfileSectionProps): JSX.Element {
  const companyQuery = useCompany(companyId);
  const updateProfile = useAdminUpdateCompanyProfile(companyId);

  const form = useForm<AdminCompanyProfileFormValues>({
    resolver: zodResolver(adminCompanyProfileSchema),
    defaultValues: {
      name: '',
      niche: Niche.GYM,
      phone: '',
      address: '',
      notificationPhone: '',
      notificationEmail: '',
      whatsappPhoneNumberId: '',
      whatsappPhoneNumber: '',
      dialogApiKey: '',
      dialogBaseUrl: '',
    },
  });

  useEffect(() => {
    if (!companyQuery.data) return;
    form.reset(companyToFormValues(companyQuery.data));
  }, [companyQuery.data, form]);

  const onSubmit = async (values: AdminCompanyProfileFormValues): Promise<void> => {
    try {
      await updateProfile.mutateAsync(formValuesToDto(values));
      notify.success('Company profile updated');
    } catch (error) {
      notify.error(getApiErrorMessage(error, 'Could not update company profile'));
    }
  };

  if (companyQuery.isLoading) {
    return (
      <div className="space-y-4 rounded-lg border border-border-default bg-surface-base p-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (companyQuery.isError || !companyQuery.data) {
    return (
      <div className="rounded-lg border border-error bg-error-surface p-4 text-sm text-error-dark">
        Could not load company profile.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-text-primary">Company profile</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Update tenant details and WhatsApp integration fields. Saving profile data alone does not
          activate a live WhatsApp channel — channel setup is still required separately.
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="space-y-6 rounded-lg border border-border-default bg-surface-base p-4 sm:p-5"
      >
        <section className="space-y-4">
          <h4 className="text-sm font-semibold text-text-primary">General</h4>

          <FormField label="Company name" required error={form.formState.errors.name?.message}>
            <Input {...form.register('name')} disabled={companyIsInactive} />
          </FormField>

          <FormField label="Niche" required error={form.formState.errors.niche?.message}>
            <Controller
              control={form.control}
              name="niche"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={companyIsInactive}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHES.map((niche) => (
                      <SelectItem key={niche} value={niche}>
                        {nicheLabel(niche)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Phone" error={form.formState.errors.phone?.message}>
              <Input {...form.register('phone')} type="tel" disabled={companyIsInactive} />
            </FormField>
            <FormField
              label="Notification phone"
              error={form.formState.errors.notificationPhone?.message}
            >
              <Input
                {...form.register('notificationPhone')}
                type="tel"
                placeholder="+57…"
                disabled={companyIsInactive}
              />
            </FormField>
          </div>

          <FormField
            label="Notification email"
            error={form.formState.errors.notificationEmail?.message}
          >
            <Input
              {...form.register('notificationEmail')}
              type="email"
              autoComplete="off"
              disabled={companyIsInactive}
            />
          </FormField>

          <FormField label="Address" error={form.formState.errors.address?.message}>
            <Textarea {...form.register('address')} rows={2} disabled={companyIsInactive} />
          </FormField>
        </section>

        <section className="space-y-4 border-t border-border-default pt-6">
          <div>
            <h4 className="text-sm font-semibold text-text-primary">WhatsApp integration</h4>
            <p className="mt-1 text-xs text-text-secondary">
              These fields store the tenant&apos;s WhatsApp sender metadata. A long-lived channel token
              is still required to go live.
            </p>
          </div>

          <FormField
            label="Display number"
            error={form.formState.errors.whatsappPhoneNumber?.message}
          >
            <Input
              {...form.register('whatsappPhoneNumber')}
              type="tel"
              placeholder="+14155552671"
              disabled={companyIsInactive}
            />
          </FormField>

          <FormField
            label="Phone number ID"
            error={form.formState.errors.whatsappPhoneNumberId?.message}
          >
            <Input
              {...form.register('whatsappPhoneNumberId')}
              placeholder='Meta phone number ID; use "sandbox" for sandbox'
              disabled={companyIsInactive}
            />
          </FormField>
        </section>

        <div className="flex justify-end border-t border-border-default pt-4">
          <Button type="submit" disabled={companyIsInactive || updateProfile.isPending}>
            {updateProfile.isPending ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
