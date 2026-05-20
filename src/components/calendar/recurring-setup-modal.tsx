'use client';

import { useState } from 'react';
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
import { useCreateRecurring } from '@/lib/hooks/use-create-recurring';
import type { RecurringFrequency } from '@/lib/types/calendar';
import { Loader2 } from 'lucide-react';

interface RecurringSetupModalProps {
  appointmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FREQUENCIES: readonly RecurringFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY'];

export function RecurringSetupModal({
  appointmentId,
  open,
  onOpenChange,
}: RecurringSetupModalProps): JSX.Element {
  const recurring = useCreateRecurring();
  const [frequency, setFrequency] = useState<RecurringFrequency>('WEEKLY');
  const [count, setCount] = useState<string>('4');
  const [dayOfWeek, setDayOfWeek] = useState<string>('1');
  const [endDate, setEndDate] = useState<string>('');

  const reset = (): void => {
    setFrequency('WEEKLY');
    setCount('4');
    setDayOfWeek('1');
    setEndDate('');
  };

  const handleSubmit = async (): Promise<void> => {
    if (!appointmentId) return;
    const countNum = count.trim() === '' ? undefined : Number.parseInt(count, 10);
    try {
      await recurring.mutateAsync({
        id: appointmentId,
        dto: {
          frequency,
          count: Number.isFinite(countNum) ? countNum : undefined,
          dayOfWeek: frequency === 'WEEKLY' ? Number.parseInt(dayOfWeek, 10) : undefined,
          endDate:
            endDate.trim() === '' ? undefined : new Date(`${endDate}T23:59:59.999Z`).toISOString(),
        },
      });
      reset();
      onOpenChange(false);
    } catch {
      // Error toast handled in hook
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="max-w-md border-border-default bg-surface-overlay text-text-primary">
        <DialogHeader>
          <DialogTitle>Make recurring</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Create a recurrence series from this appointment. The backend must support this endpoint.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurringFrequency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f.charAt(0) + f.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {frequency === 'WEEKLY' ? (
            <div className="space-y-1.5">
              <Label htmlFor="dow">Day of week (0 = Sunday)</Label>
              <Input
                id="dow"
                type="number"
                min={0}
                max={6}
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
              />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="count">Occurrence count (optional)</Label>
            <Input id="count" type="number" min={1} value={count} onChange={(e) => setCount(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="end">End date (optional)</Label>
            <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!appointmentId || recurring.isPending}
              onClick={() => void handleSubmit()}
            >
              {recurring.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
