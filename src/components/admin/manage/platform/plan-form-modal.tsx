'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { adminPlanCategoryLabel } from '@/lib/admin/admin-hub-utils';
import { getApiErrorMessage } from '@/lib/api/get-api-error-message';
import { useAdminCreatePlan, useAdminUpdatePlan } from '@/lib/hooks/use-admin-plans';
import {
  adminWritePlanSchema,
  type AdminWritePlanFormValues,
} from '@/lib/schemas/admin-hub/admin-plan.schema';
import type { AdminPlan, AdminWritePlanDto } from '@/lib/types/admin-hub';
import { AdminPlanCategory, AdminPlanTier } from '@/lib/types/admin-hub';
import { Niche } from '@/lib/types';
import { nicheLabel } from '@/lib/utils/format';
import { notify } from '@/lib/toast';

const NICHES: readonly Niche[] = [Niche.GYM, Niche.MEDICAL, Niche.ENTREPRENEUR];
const CATEGORIES: readonly AdminPlanCategory[] = [
  AdminPlanCategory.WEBSITE,
  AdminPlanCategory.MARKETING,
  AdminPlanCategory.AI_AGENTS,
];
const TIERS: readonly AdminPlanTier[] = [
  AdminPlanTier.BASIC,
  AdminPlanTier.PROFESSIONAL,
  AdminPlanTier.ENTERPRISE,
];

const DEFAULT_FORM_VALUES: AdminWritePlanFormValues = {
  name: '',
  niche: Niche.GYM,
  category: AdminPlanCategory.WEBSITE,
  priceMonthly: 0,
  priceAnnual: null,
  setupFee: 0,
  maxCampaigns: null,
  description: null,
};

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed.length === 0 ? null : trimmed;
}

function planToFormValues(plan: AdminPlan): AdminWritePlanFormValues {
  return {
    name: plan.name,
    niche: plan.niche,
    category: plan.category ?? AdminPlanCategory.WEBSITE,
    tier: plan.tier ?? undefined,
    priceMonthly: plan.priceMonthly,
    priceAnnual: plan.priceAnnual ?? null,
    setupFee: plan.setupFee,
    maxCampaigns: plan.maxCampaigns ?? null,
    description: plan.description ?? null,
  };
}

function formValuesToDto(values: AdminWritePlanFormValues): AdminWritePlanDto {
  return {
    name: values.name.trim(),
    niche: values.niche,
    category: values.category,
    tier: values.tier,
    priceMonthly: values.priceMonthly,
    priceAnnual: values.priceAnnual ?? null,
    setupFee: values.setupFee,
    maxCampaigns: values.maxCampaigns ?? null,
    description: emptyToNull(typeof values.description === 'string' ? values.description : null),
  };
}

interface PlanFormModalProps {
  open: boolean;
  onClose: () => void;
  plan?: AdminPlan | null;
}

export function PlanFormModal({ open, onClose, plan = null }: PlanFormModalProps): JSX.Element {
  const isEditing = plan != null;
  const createPlan = useAdminCreatePlan();
  const updatePlan = useAdminUpdatePlan();

  const form = useForm<AdminWritePlanFormValues>({
    resolver: zodResolver(adminWritePlanSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const category = form.watch('category');

  useEffect(() => {
    if (!open) return;
    form.reset(isEditing ? planToFormValues(plan) : DEFAULT_FORM_VALUES);
  }, [open, isEditing, plan, form]);

  const isPending = createPlan.isPending || updatePlan.isPending;

  const onSubmit = async (values: AdminWritePlanFormValues): Promise<void> => {
    const dto = formValuesToDto(values);
    try {
      if (isEditing) {
        await updatePlan.mutateAsync({ planId: plan.id, dto });
        notify.success('Plan updated');
      } else {
        await createPlan.mutateAsync(dto);
        notify.success('Plan created');
      }
      onClose();
    } catch (error) {
      notify.error(getApiErrorMessage(error, isEditing ? 'Could not update plan' : 'Could not create plan'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit plan' : 'Create plan'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField label="Name" required error={form.formState.errors.name?.message}>
            <Input {...form.register('name')} autoComplete="off" />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Niche" required error={form.formState.errors.niche?.message}>
              <Controller
                control={form.control}
                name="niche"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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

            <FormField label="Category" required error={form.formState.errors.category?.message}>
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {adminPlanCategoryLabel(item)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <FormField label="Tier" error={form.formState.errors.tier?.message}>
            <Controller
              control={form.control}
              name="tier"
              render={({ field }) => (
                <Select
                  value={field.value ?? 'none'}
                  onValueChange={(value) =>
                    field.onChange(value === 'none' ? undefined : (value as AdminPlanTier))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {TIERS.map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        {tier.charAt(0) + tier.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Monthly price" required error={form.formState.errors.priceMonthly?.message}>
              <Input
                type="number"
                min={0}
                step="0.01"
                {...form.register('priceMonthly', { valueAsNumber: true })}
              />
            </FormField>
            <FormField label="Annual price" error={form.formState.errors.priceAnnual?.message}>
              <Input
                type="number"
                min={0}
                step="0.01"
                {...form.register('priceAnnual', {
                  setValueAs: (value) => (value === '' || value == null ? null : Number(value)),
                })}
              />
            </FormField>
            <FormField label="Setup fee" required error={form.formState.errors.setupFee?.message}>
              <Input
                type="number"
                min={0}
                step="0.01"
                {...form.register('setupFee', { valueAsNumber: true })}
              />
            </FormField>
          </div>

          {category === AdminPlanCategory.MARKETING ? (
            <FormField label="Max campaigns" error={form.formState.errors.maxCampaigns?.message}>
              <Input
                type="number"
                min={0}
                step={1}
                {...form.register('maxCampaigns', {
                  setValueAs: (value) => (value === '' || value == null ? null : Number(value)),
                })}
              />
            </FormField>
          ) : null}

          <FormField label="Description" error={form.formState.errors.description?.message}>
            <Textarea
              {...form.register('description', {
                setValueAs: (value) => (typeof value === 'string' && value.trim().length > 0 ? value : null),
              })}
              rows={3}
              placeholder="Optional marketing copy for admin pickers"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : isEditing ? 'Save plan' : 'Create plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
