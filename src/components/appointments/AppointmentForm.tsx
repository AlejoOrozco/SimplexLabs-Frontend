'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AttendeeSearch } from '@/components/calendar/attendee-search';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormError } from '@/components/shared/FormError';
import { ApiClientError } from '@/lib/api/client';
import { deriveAppointmentTargetingFromAttendees } from '@/lib/appointments/derive-appointment-targeting-from-attendees';
import {
  appointmentFormSchema,
  createAppointmentSchema,
  type AppointmentFormDto,
  type CreateAppointmentDto,
} from '@/lib/schemas/appointment.schema';
import { AppointmentType, type AttendeeSearchResult } from '@/lib/types';

interface AppointmentFormProps {
  defaultValues?: Partial<AppointmentFormDto>;
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
  const [selectedAttendees, setSelectedAttendees] = useState<AttendeeSearchResult[]>([]);

  const form = useForm<AppointmentFormDto>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      title: '',
      description: null,
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

  const submit = async (values: AppointmentFormDto): Promise<void> => {
    setApiError(null);
    const targeting = deriveAppointmentTargetingFromAttendees(selectedAttendees);
    if (targeting.type === AppointmentType.CLIENT_WITH_CONTACT && !targeting.contactId) {
      setApiError('Select a customer attendee so we know which contact this meeting is with');
      return;
    }
    const dto: CreateAppointmentDto = {
      ...values,
      type: targeting.type,
      contactId: targeting.contactId ?? values.contactId ?? null,
      attendeeUserIds: selectedAttendees.length > 0 ? selectedAttendees.map((a) => a.id) : undefined,
    };
    const parsed = createAppointmentSchema.safeParse(dto);
    if (!parsed.success) {
      setApiError(parsed.error.flatten().formErrors.join(', ') || 'Invalid form');
      return;
    }
    try {
      await onSubmit(parsed.data);
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

      <AttendeeSearch
        selectedAttendees={selectedAttendees}
        onAdd={(attendee) => {
          setSelectedAttendees((prev) => (prev.some((a) => a.id === attendee.id) ? prev : [...prev, attendee]));
        }}
        onRemove={(id) => setSelectedAttendees((prev) => prev.filter((a) => a.id !== id))}
      />
      <p className="text-xs text-text-secondary">
        Meeting type (client ↔ contact, Simplex ↔ client, or external) is inferred from who you add.
      </p>

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
