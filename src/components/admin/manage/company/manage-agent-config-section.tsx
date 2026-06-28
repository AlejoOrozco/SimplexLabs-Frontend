'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FormField } from '@/components/shared/FormField';
import { Skeleton } from '@/components/shared/Skeleton';
import { Badge } from '@/components/ui/badge';
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
import { companyHasActiveAgentsPlan } from '@/lib/admin/company-has-active-agents-plan';
import { adminCompanyManageSectionHref } from '@/lib/admin/admin-company-workspace-href';
import { getApiErrorMessage } from '@/lib/api/get-api-error-message';
import {
  useAdminCompanyAgentConfig,
  useAdminUpdateCompanyAgentConfig,
} from '@/lib/hooks/use-admin-company-agent-config';
import { useAdminCompanySubscriptions } from '@/lib/hooks/use-admin-company-subscriptions';
import {
  adminAgentConfigFormSchema,
  type AdminAgentConfigFormValues,
} from '@/lib/schemas/admin-hub/admin-agent-config.schema';
import type { AdminAgentConfig, AdminUpdateAgentConfigDto } from '@/lib/types/admin-hub';
import { Channel } from '@/lib/types';
import { channelLabel } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { notify } from '@/lib/toast';

const CHANNELS: readonly Channel[] = [Channel.WHATSAPP, Channel.INSTAGRAM, Channel.MESSENGER];

const LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Spanish (es)' },
  { value: 'en', label: 'English (en)' },
  { value: 'pt', label: 'Portuguese (pt)' },
] as const;

const DEFAULT_FORM_VALUES: AdminAgentConfigFormValues = {
  name: '',
  fallbackMessage: '',
  escalationMessage: '',
  channels: [Channel.WHATSAPP],
  language: 'es',
};

function toggleChannel(current: Channel[], value: Channel): Channel[] {
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

function agentConfigToFormValues(config: AdminAgentConfig): AdminAgentConfigFormValues {
  return {
    name: config.name,
    fallbackMessage: config.fallbackMessage,
    escalationMessage: config.escalationMessage,
    channels: [...config.channels],
    language: config.language,
  };
}

function formValuesToDto(values: AdminAgentConfigFormValues): AdminUpdateAgentConfigDto {
  return {
    name: values.name.trim(),
    fallbackMessage: values.fallbackMessage.trim(),
    escalationMessage: values.escalationMessage.trim(),
    channels: [...values.channels],
    language: values.language.trim(),
  };
}

interface ManageAgentConfigSectionProps {
  companyId: string;
  companyIsInactive?: boolean;
}

export function ManageAgentConfigSection({
  companyId,
  companyIsInactive = false,
}: ManageAgentConfigSectionProps): JSX.Element {
  const subscriptionsQuery = useAdminCompanySubscriptions(companyId);
  const agentConfigQuery = useAdminCompanyAgentConfig(companyId);
  const updateAgentConfig = useAdminUpdateCompanyAgentConfig(companyId);

  const form = useForm<AdminAgentConfigFormValues>({
    resolver: zodResolver(adminAgentConfigFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  useEffect(() => {
    if (agentConfigQuery.isLoading) return;
    if (agentConfigQuery.data) {
      form.reset(agentConfigToFormValues(agentConfigQuery.data));
      return;
    }
    if (agentConfigQuery.isSuccess) {
      form.reset(DEFAULT_FORM_VALUES);
    }
  }, [agentConfigQuery.data, agentConfigQuery.isLoading, agentConfigQuery.isSuccess, form]);

  const hasAgentsPlan = companyHasActiveAgentsPlan(companyId, subscriptionsQuery.data);
  const isLoading = subscriptionsQuery.isLoading || agentConfigQuery.isLoading;
  const existingConfig = agentConfigQuery.data;
  const isCreating = !existingConfig;

  const onSubmit = async (values: AdminAgentConfigFormValues): Promise<void> => {
    try {
      await updateAgentConfig.mutateAsync(formValuesToDto(values));
      notify.success(isCreating ? 'Agent configuration created' : 'Agent configuration updated');
    } catch (error) {
      notify.error(getApiErrorMessage(error, 'Could not save agent configuration'));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full max-w-xl" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (subscriptionsQuery.isError || agentConfigQuery.isError) {
    return (
      <div className="rounded-lg border border-error bg-error-surface p-4 text-sm text-error-dark">
        Could not load agent configuration for this company.
      </div>
    );
  }

  if (companyIsInactive) {
    return (
      <p className="text-sm text-text-secondary">
        This company is inactive. Agent configuration changes are disabled until the company is
        reactivated.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-text-primary">Agent configuration</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Configure the AI agent persona, messages, channels, and language. WhatsApp sender details
          are edited under{' '}
          <Link
            href={adminCompanyManageSectionHref(companyId, 'profile')}
            scroll={false}
            className="font-medium text-text-brand underline hover:no-underline"
          >
            Company profile
          </Link>
          ; knowledge base entries live in the{' '}
          <Link
            href={adminCompanyManageSectionHref(companyId, 'knowledge-base')}
            scroll={false}
            className="font-medium text-text-brand underline hover:no-underline"
          >
            Knowledge base
          </Link>{' '}
          section.
        </p>
      </div>

      {!hasAgentsPlan ? (
        <div className="rounded-lg border border-warning bg-warning-surface px-4 py-3 text-sm text-warning-dark">
          <p>
            This company does not have an active AI Agents plan. The agent will not run for tenants
            until a plan is assigned, but you can still save configuration here.
          </p>
          <Link
            href={adminCompanyManageSectionHref(companyId, 'subscriptions')}
            scroll={false}
            className="mt-2 inline-block font-medium text-warning-dark underline hover:no-underline"
          >
            Assign an AI Agents plan
          </Link>
        </div>
      ) : null}

      {isCreating ? (
        <p className="rounded-lg border border-border-default bg-surface-base px-4 py-3 text-sm text-text-secondary">
          No agent is configured yet. Fill in the fields below and save to create one.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={existingConfig.isActive ? 'success' : 'neutral'}>
            {existingConfig.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <span className="text-xs text-text-secondary">
            Last updated {new Date(existingConfig.updatedAt).toLocaleString()}
          </span>
        </div>
      )}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="space-y-6 rounded-lg border border-border-default bg-surface-base p-4 sm:p-5"
      >
        <FormField label="Agent name" required error={form.formState.errors.name?.message}>
          <Input {...form.register('name')} placeholder="Sofía" autoComplete="off" />
        </FormField>

        <FormField
          label="Fallback message"
          required
          error={form.formState.errors.fallbackMessage?.message}
        >
          <Textarea
            {...form.register('fallbackMessage')}
            rows={3}
            placeholder="Message shown when the agent cannot answer."
          />
        </FormField>

        <FormField
          label="Escalation message"
          required
          error={form.formState.errors.escalationMessage?.message}
        >
          <Textarea
            {...form.register('escalationMessage')}
            rows={3}
            placeholder="Message shown when handing off to a human."
          />
        </FormField>

        <FormField label="Language" required error={form.formState.errors.language?.message}>
          <Controller
            control={form.control}
            name="language"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-text-primary">
            Channels <span className="text-error">*</span>
          </legend>
          {form.formState.errors.channels?.message ? (
            <p className="text-xs text-error">{form.formState.errors.channels.message}</p>
          ) : null}
          <Controller
            control={form.control}
            name="channels"
            render={({ field }) => (
              <div className="flex flex-wrap gap-3">
                {CHANNELS.map((channel) => {
                  const checked = field.value.includes(channel);
                  return (
                    <label
                      key={channel}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm',
                        checked
                          ? 'border-border-focus bg-surface-raised shadow-brand'
                          : 'border-border-default',
                      )}
                    >
                      <input
                        type="checkbox"
                        className="size-4 rounded border-border-default"
                        checked={checked}
                        onChange={() => field.onChange(toggleChannel(field.value, channel))}
                      />
                      {channelLabel(channel)}
                    </label>
                  );
                })}
              </div>
            )}
          />
        </fieldset>

        <div className="flex justify-end border-t border-border-default pt-4">
          <Button type="submit" disabled={updateAgentConfig.isPending}>
            {updateAgentConfig.isPending
              ? 'Saving…'
              : isCreating
                ? 'Create agent configuration'
                : 'Save agent configuration'}
          </Button>
        </div>
      </form>
    </div>
  );
}
