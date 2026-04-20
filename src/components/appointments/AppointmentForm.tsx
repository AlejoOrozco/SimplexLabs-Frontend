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
import { Textarea } from '@/components/ui/textarea';
import { FormError } from '@/components/shared/FormError';
import { ApiClientError } from '@/lib/api/client';
import {
  createAppointmentSchema,
  type CreateAppointmentDto,
} from '@/lib/schemas/appointment.schema';
import { AppointmentStatus, AppointmentType } from '@/lib/types';
import { appointmentTypeLabel } from '@/lib/utils/format';

const TYPE_OPTIONS: readonly AppointmentType[] = [
  AppointmentType.SIMPLEX_WITH_CLIENT,
  AppointmentType.CLIENT_WITH_CONTACT,
  AppointmentType.EXTERNAL,
];

interface AppointmentFormProps {
  defaultValues?: Partial<CreateAppointmentDto>;
  onSubmit: (values: CreateAppointmentDto) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
}

export function AppointmentForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
  onCancel,
}: AppointmentFormProps): JSX.Element {
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<CreateAppointmentDto>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      title: '',
      description: null,
      type: AppointmentType.CLIENT_WITH_CONTACT,
      status: AppointmentStatus.PENDING,
      scheduledAt: new Date().toISOString(),
      durationMinutes: 30,
      contactId: null,
      productId: null,
      meetingUrl: null,
      externalAttendeeName: null,
      externalAttendeeEmail: null,
      ...defaultValues,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const submit = async (values: CreateAppointmentDto): Promise<void> => {
    setApiError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : 'Could not save appointment';
      setApiError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title')} aria-invalid={errors.title ? 'true' : 'false'} />
        <FormError message={errors.title?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="type">Type</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {appointmentTypeLabel(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormError message={errors.type?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="scheduledAt">Scheduled at</Label>
          <Controller
            control={control}
            name="scheduledAt"
            render={({ field }) => (
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={toDatetimeLocal(field.value)}
                onChange={(e) => field.onChange(fromDatetimeLocal(e.target.value))}
              />
            )}
          />
          <FormError message={errors.scheduledAt?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="durationMinutes">Duration (min)</Label>
          <Input
            id="durationMinutes"
            type="number"
            min={5}
            {...register('durationMinutes', { valueAsNumber: true })}
          />
          <FormError message={errors.durationMinutes?.message} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} />
        <FormError message={errors.description?.message} />
      </div>

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

function toDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string): string {
  if (!value) return new Date().toISOString();
  return new Date(value).toISOString();
}
