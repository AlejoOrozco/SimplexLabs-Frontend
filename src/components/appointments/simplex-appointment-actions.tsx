'use client';

import { CheckCircle, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getEffectiveAppointmentConfirmationStatus } from '@/lib/appointments/callback-utils';
import { useConfirmAppointment, useRequestAppointmentCallback } from '@/lib/hooks/use-appointments';
import type { Appointment } from '@/lib/types';
import { AppointmentConfirmationStatus, AppointmentType } from '@/lib/types';
import { notify } from '@/lib/toast';

interface SimplexAppointmentActionsProps {
  appointment: Appointment;
}

export function SimplexAppointmentActions({ appointment }: SimplexAppointmentActionsProps): JSX.Element | null {
  if (appointment.type !== AppointmentType.SIMPLEX_WITH_CLIENT) {
    return null;
  }
  return <SimplexAppointmentActionsInner appointment={appointment} />;
}

function SimplexAppointmentActionsInner({ appointment }: { appointment: Appointment }): JSX.Element {
  const confirm = useConfirmAppointment();
  const requestCallback = useRequestAppointmentCallback();
  const [callbackRequested, setCallbackRequested] = useState(Boolean(appointment.callMeAsap));

  useEffect(() => {
    setCallbackRequested(Boolean(appointment.callMeAsap));
  }, [appointment.id, appointment.callMeAsap]);

  const confirmation = getEffectiveAppointmentConfirmationStatus(appointment);

  if (confirmation === AppointmentConfirmationStatus.CONFIRMED) {
    return (
      <div className="flex items-center gap-2 text-success">
        <CheckCircle className="h-4 w-4 shrink-0" aria-hidden />
        <span className="text-sm font-medium">Confirmed</span>
      </div>
    );
  }

  if (confirmation === AppointmentConfirmationStatus.DECLINED) {
    return (
      <p className="text-sm text-text-secondary">You declined this meeting. Contact support if this was a mistake.</p>
    );
  }

  if (callbackRequested) {
    return (
      <div className="rounded-lg border border-warning bg-warning-light p-3 text-sm text-warning-dark">
        <div className="flex items-start gap-2">
          <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>You requested a callback. Our team will contact you shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        type="button"
        disabled={confirm.isPending}
        onClick={() => {
          confirm.mutate(appointment.id, {
            onSuccess: () => notify.success('Appointment confirmed'),
            onError: (err) =>
              notify.error(err instanceof Error ? err.message : 'Could not confirm appointment'),
          });
        }}
      >
        {confirm.isPending ? 'Confirming…' : 'Confirm appointment'}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={requestCallback.isPending}
        onClick={() => {
          void requestCallback
            .mutateAsync(appointment.id)
            .then(() => {
              setCallbackRequested(true);
              notify.success('Callback requested', {
                description: 'Our team will contact you as soon as possible.',
              });
            })
            .catch((err: unknown) => {
              notify.error(err instanceof Error ? err.message : 'Could not request callback');
            });
        }}
      >
        <Phone className="h-4 w-4" aria-hidden />
        {requestCallback.isPending ? 'Sending…' : 'Call me as soon as you can'}
      </Button>
    </div>
  );
}
