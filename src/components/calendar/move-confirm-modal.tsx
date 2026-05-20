'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMoveAppointment } from '@/lib/hooks/use-move-appointment';
import { useCheckAvailability } from '@/lib/hooks/use-check-availability';
import { formatInTimezone } from '@/lib/utils/timezone';
import type { PendingMove } from '@/lib/types/calendar';
import { AvailabilityIndicator } from '@/components/calendar/availability-indicator';
import { Loader2 } from 'lucide-react';

interface MoveConfirmModalProps {
  open: boolean;
  pending: PendingMove | undefined;
  userTimezone: string;
  onClose: () => void;
}

export function MoveConfirmModal({
  open,
  pending,
  userTimezone,
  onClose,
}: MoveConfirmModalProps): JSX.Element | null {
  const moveAppointment = useMoveAppointment();

  const durationMinutes = pending
    ? Math.round(
        (new Date(pending.newEnd).getTime() - new Date(pending.newStart).getTime()) / 60_000,
      )
    : 0;

  const { data: availability, isLoading: checkingAvailability } = useCheckAvailability(
    pending
      ? {
          proposedStart: pending.newStart,
          durationMinutes,
          excludeAppointmentId: pending.eventId,
          staffMemberId: pending.staffMemberId,
        }
      : null,
  );

  const handleCancel = (): void => {
    pending?.revert();
    onClose();
  };

  const handleConfirm = async (): Promise<void> => {
    if (!pending) return;
    try {
      await moveAppointment.mutateAsync({
        id: pending.eventId,
        newStart: pending.newStart,
        newEnd: pending.newEnd,
      });
      onClose();
    } catch {
      pending.revert();
      onClose();
    }
  };

  if (!pending) return null;

  const newStartFormatted = formatInTimezone(pending.newStart, userTimezone, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleCancel();
      }}
    >
      <DialogContent className="max-w-md border-border-default bg-surface-page text-text-primary">
        <DialogHeader>
          <DialogTitle>Reschedule appointment?</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Move this appointment to:</p>
          <p className="text-base font-medium text-text-primary">{newStartFormatted}</p>

          <AvailabilityIndicator availability={availability} isLoading={checkingAvailability} />

          <p className="text-xs text-text-secondary">
            The other party will be notified and may need to re-confirm the new time.
          </p>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => void handleConfirm()}
              disabled={
                moveAppointment.isPending ||
                checkingAvailability ||
                availability?.available === false
              }
            >
              {moveAppointment.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                'Confirm move'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
