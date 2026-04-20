'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormError } from '@/components/shared/FormError';
import { ApiClientError } from '@/lib/api/client';
import { createPlanSchema, type CreatePlanDto } from '@/lib/schemas/plan.schema';
import { Channel, Niche, PlanFeatureType } from '@/lib/types';
import { channelLabel, nicheLabel, planFeatureLabel } from '@/lib/utils/format';

const FEATURES: readonly PlanFeatureType[] = [
  PlanFeatureType.WEBSITE,
  PlanFeatureType.MARKETING,
  PlanFeatureType.AGENTS,
];

const CHANNELS: readonly Channel[] = [
  Channel.WHATSAPP,
  Channel.INSTAGRAM,
  Channel.MESSENGER,
];

const NICHES: readonly Niche[] = [Niche.GYM, Niche.MEDICAL, Niche.ENTREPRENEUR];

interface PlanFormProps {
  defaultValues?: Partial<CreatePlanDto>;
  onSubmit: (values: CreatePlanDto) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
}

export function PlanForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
  onCancel,
}: PlanFormProps): JSX.Element {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePlanDto>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: '',
      niche: Niche.GYM,
      priceMonthly: 0,
      setupFee: 0,
      isActive: true,
      features: [],
      channels: [],
      ...defaultValues,
    },
  });

  const submit = async (values: CreatePlanDto): Promise<void> => {
    setApiError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setApiError(err instanceof ApiClientError ? err.message : 'Could not save plan');
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} />
        <FormError message={errors.name?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="niche">Niche</Label>
        <Controller
          control={control}
          name="niche"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="niche">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NICHES.map((n) => (
                  <SelectItem key={n} value={n}>
                    {nicheLabel(n)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormError message={errors.niche?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="priceMonthly">Monthly price</Label>
          <Input
            id="priceMonthly"
            type="number"
            step="0.01"
            min={0}
            {...register('priceMonthly', { valueAsNumber: true })}
          />
          <FormError message={errors.priceMonthly?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="setupFee">Setup fee</Label>
          <Input
            id="setupFee"
            type="number"
            step="0.01"
            min={0}
            {...register('setupFee', { valueAsNumber: true })}
          />
          <FormError message={errors.setupFee?.message} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Features</Label>
        <Controller
          control={control}
          name="features"
          render={({ field }) => (
            <div className="flex flex-wrap gap-3">
              {FEATURES.map((f) => {
                const checked = field.value.includes(f);
                return (
                  <label key={f} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        field.onChange(
                          e.target.checked
                            ? [...field.value, f]
                            : field.value.filter((x) => x !== f),
                        );
                      }}
                    />
                    {planFeatureLabel(f)}
                  </label>
                );
              })}
            </div>
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Channels</Label>
        <Controller
          control={control}
          name="channels"
          render={({ field }) => (
            <div className="flex flex-wrap gap-3">
              {CHANNELS.map((c) => {
                const checked = field.value.includes(c);
                return (
                  <label key={c} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        field.onChange(
                          e.target.checked
                            ? [...field.value, c]
                            : field.value.filter((x) => x !== c),
                        );
                      }}
                    />
                    {channelLabel(c)}
                  </label>
                );
              })}
            </div>
          )}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register('isActive')} /> Active
      </label>

      <FormError message={apiError} />

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
