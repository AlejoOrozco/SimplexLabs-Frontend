'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AttendeeSearch } from '@/components/calendar/attendee-search';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import * as companiesApi from '@/lib/api/companies.api';
import { adminCreateCompanyAppointment } from '@/lib/api/admin-appointments.api';
import { createAppointment } from '@/lib/api/appointments.api';
import { ApiClientError } from '@/lib/api/client';
import { deriveAppointmentTargetingFromAttendees } from '@/lib/appointments/derive-appointment-targeting-from-attendees';
import { queryKeys } from '@/lib/hooks/query-keys';
import { createAppointmentSchema, type CreateAppointmentDto } from '@/lib/schemas/appointment.schema';
import { AppointmentType, type AttendeeSearchResult } from '@/lib/types';
import { getUserTimezone, localDatetimeInTimezoneToUtc } from '@/lib/utils/timezone';
import { useAuth } from '@/context/auth-context';
import { notify } from '@/lib/toast';
import { Loader2 } from 'lucide-react';

interface AppointmentModalProps {
  open: boolean;
  initialDate?: string;
  initialTime?: string;
  /** When set (e.g. admin client workspace), creation is scoped to this tenant. */
  companyId?: string;
  onClose: () => void;
}

interface CreateMutationInput {
  dto: CreateAppointmentDto;
  adminCompanyId?: string;
}

export function AppointmentModal({
  open,
  initialDate,
  initialTime,
  companyId,
  onClose,
}: AppointmentModalProps): JSX.Element {
  const { user, isSimplexAdmin, isSimplexStaff } = useAuth();
  const userTimezone = getUserTimezone(user?.timezone);
  const queryClient = useQueryClient();

  const isAdmin = isSimplexAdmin || isSimplexStaff;
  const isTenantCalendarUser = !isSimplexAdmin && !isSimplexStaff;

  const companiesQuery = useQuery({
    queryKey: queryKeys.companies.list(),
    queryFn: companiesApi.getCompanies,
    enabled: open && isAdmin && !companyId,
  });

  const tenantLabelQuery = useQuery({
    queryKey: queryKeys.companies.detail(companyId ?? ''),
    queryFn: () => companiesApi.getCompany(companyId as string),
    enabled: open && Boolean(companyId) && isAdmin,
  });

  const createMut = useMutation({
    mutationFn: async ({ dto, adminCompanyId }: CreateMutationInput) => {
      if (adminCompanyId) return adminCreateCompanyAppointment(adminCompanyId, dto);
      return createAppointment(dto);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      const cid = variables.adminCompanyId ?? companyId;
      if (cid) {
        await queryClient.invalidateQueries({
          queryKey: ['admin', 'company', cid, 'appointments'],
        });
      }
    },
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [localSlot, setLocalSlot] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState<AttendeeSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setTitle('');
    setDescription('');
    setDurationMinutes(30);
    setSelectedTenantId('');
    setSelectedAttendees([]);
    if (initialDate) {
      const time = initialTime && initialTime.length >= 5 ? initialTime.slice(0, 5) : '09:00';
      setLocalSlot(`${initialDate}T${time}`);
    } else {
      setLocalSlot('');
    }
  }, [open, initialDate, initialTime]);

  const handleSubmit = async (): Promise<void> => {
    setError(null);
    if (!localSlot.trim()) {
      setError('Date and time are required');
      return;
    }

    const resolvedAdminCompanyId = isAdmin ? companyId ?? selectedTenantId : undefined;
    if (isAdmin && !resolvedAdminCompanyId?.trim()) {
      setError('Select which company this appointment is for');
      return;
    }

    const targeting = deriveAppointmentTargetingFromAttendees(selectedAttendees);
    if (isTenantCalendarUser && targeting.type === AppointmentType.CLIENT_WITH_CONTACT && !targeting.contactId) {
      setError('Add a customer attendee so we know which contact this meeting is with');
      return;
    }

    let scheduledAt: string;
    try {
      scheduledAt = localDatetimeInTimezoneToUtc(localSlot, userTimezone);
    } catch {
      setError('Invalid date/time');
      return;
    }

    const dto: CreateAppointmentDto = {
      title: title.trim() || 'Appointment',
      description: description.trim() === '' ? null : description.trim(),
      type: targeting.type,
      scheduledAt,
      durationMinutes,
      contactId: targeting.contactId,
      productId: null,
      meetingUrl: null,
      externalAttendeeName: null,
      externalAttendeeEmail: null,
      attendeeUserIds: selectedAttendees.length > 0 ? selectedAttendees.map((a) => a.id) : undefined,
    };

    const parsed = createAppointmentSchema.safeParse(dto);
    if (!parsed.success) {
      setError(parsed.error.flatten().formErrors.join(', ') || 'Invalid form');
      return;
    }

    try {
      await createMut.mutateAsync({
        dto: parsed.data,
        adminCompanyId: resolvedAdminCompanyId?.trim() ? resolvedAdminCompanyId.trim() : undefined,
      });
      notify.success('Appointment created');
      onClose();
    } catch (e) {
      const message = e instanceof ApiClientError ? e.message : 'Could not create appointment';
      setError(message);
    }
  };

  const companies = companiesQuery.data ?? [];
  const needsTenantPicker = isAdmin && !companyId;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="max-w-md border-border-default bg-surface-page text-text-primary">
        <DialogHeader>
          <DialogTitle>New appointment</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Times use your profile timezone ({userTimezone}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {isAdmin && companyId ? (
            <div className="rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm">
              <span className="text-text-secondary">Company: </span>
              <span className="font-medium text-text-primary">
                {tenantLabelQuery.isLoading ? '…' : tenantLabelQuery.data?.name ?? companyId}
              </span>
            </div>
          ) : null}

          {needsTenantPicker ? (
            <div className="space-y-1.5">
              <Label htmlFor="cal-company">Company</Label>
              <Select value={selectedTenantId || undefined} onValueChange={setSelectedTenantId}>
                <SelectTrigger id="cal-company">
                  <SelectValue placeholder={companiesQuery.isLoading ? 'Loading companies…' : 'Select company'} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {companiesQuery.isError ? (
                <p className="text-xs text-error-dark">Could not load companies.</p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="cal-title">Title</Label>
            <Input id="cal-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <AttendeeSearch
            selectedAttendees={selectedAttendees}
            onAdd={(attendee) => {
              setSelectedAttendees((prev) =>
                prev.some((a) => a.id === attendee.id) ? prev : [...prev, attendee],
              );
            }}
            onRemove={(id) => setSelectedAttendees((prev) => prev.filter((a) => a.id !== id))}
          />
          <p className="text-xs text-text-secondary">
            Type is inferred from attendees (e.g. customer row → client ↔ contact; Simplex team → platform ↔ client).
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cal-when">Start</Label>
              <Input
                id="cal-when"
                type="datetime-local"
                value={localSlot}
                onChange={(e) => setLocalSlot(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cal-dur">Duration (min)</Label>
              <Input
                id="cal-dur"
                type="number"
                min={5}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number.parseInt(e.target.value, 10) || 30)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cal-desc">Description</Label>
            <Textarea id="cal-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {error ? <p className="text-sm text-error-dark">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                createMut.isPending ||
                (needsTenantPicker && (companiesQuery.isLoading || companies.length === 0))
              }
              onClick={() => void handleSubmit()}
            >
              {createMut.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
