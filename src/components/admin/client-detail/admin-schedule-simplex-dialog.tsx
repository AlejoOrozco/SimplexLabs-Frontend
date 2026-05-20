'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ApiClientError } from '@/lib/api/client';
import { useAdminCreateCompanyAppointment } from '@/lib/hooks/use-admin-create-company-appointment';
import { AppointmentType } from '@/lib/types';
import { notify } from '@/lib/toast';

interface AdminScheduleSimplexDialogProps {
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminScheduleSimplexDialog({
  companyId,
  open,
  onOpenChange,
}: AdminScheduleSimplexDialogProps): JSX.Element {
  const create = useAdminCreateCompanyAppointment(companyId);
  const [title, setTitle] = useState('SimplexLabs check-in');
  const [scheduledLocal, setScheduledLocal] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [description, setDescription] = useState('');

  const resetForm = (): void => {
    setTitle('SimplexLabs check-in');
    setScheduledLocal('');
    setDurationMinutes(30);
    setDescription('');
  };

  const handleSubmit = async (): Promise<void> => {
    if (!title.trim() || !scheduledLocal) {
      notify.error('Title and date/time are required');
      return;
    }
    const scheduledAt = new Date(scheduledLocal).toISOString();
    try {
      await create.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        type: AppointmentType.SIMPLEX_WITH_CLIENT,
        scheduledAt,
        durationMinutes,
        contactId: null,
        productId: null,
        meetingUrl: null,
        externalAttendeeName: null,
        externalAttendeeEmail: null,
      });
      notify.success('Appointment scheduled', {
        description: 'The company will see it as pending until they respond.',
      });
      resetForm();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : 'Could not create appointment';
      notify.error(message);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) resetForm();
      }}
    >
      <DialogContent className="border-border-default bg-surface-overlay text-text-primary sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule SimplexLabs meeting</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Creates a SimplexLabs ↔ company meeting for this tenant. The company sees it as pending.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="sx-title">Title</Label>
            <Input id="sx-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sx-when">Start (local)</Label>
            <Input
              id="sx-when"
              type="datetime-local"
              value={scheduledLocal}
              onChange={(e) => setScheduledLocal(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sx-duration">Duration (minutes)</Label>
            <Input
              id="sx-duration"
              type="number"
              min={5}
              max={24 * 60}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number.parseInt(e.target.value, 10) || 30)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sx-desc">Notes (optional)</Label>
            <Textarea id="sx-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={create.isPending} onClick={() => void handleSubmit()}>
            {create.isPending ? 'Scheduling…' : 'Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
