'use client';

import { useMemo, useState } from 'react';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { AppointmentList } from '@/components/appointments/AppointmentList';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAppointments,
  useCreateAppointment,
} from '@/lib/hooks/use-appointments';
import { AppointmentType } from '@/lib/types';
import { appointmentTypeLabel } from '@/lib/utils/format';

type TypeFilter = AppointmentType | 'ALL';

export default function AppointmentsPage(): JSX.Element {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const { data, isLoading, isError, error } = useAppointments();
  const createMutation = useCreateAppointment();

  const filtered = useMemo(() => {
    if (!data) return [];
    if (typeFilter === 'ALL') return data;
    return data.filter((a) => a.type === typeFilter);
  }, [data, typeFilter]);

  return (
    <PageWrapper
      title="Appointments"
      description="Simplex meetings, client visits, and external scheduling."
      actions={
        <>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              {[
                AppointmentType.SIMPLEX_WITH_CLIENT,
                AppointmentType.CLIENT_WITH_CONTACT,
                AppointmentType.EXTERNAL,
              ].map((t) => (
                <SelectItem key={t} value={t}>
                  {appointmentTypeLabel(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" onClick={() => setIsDialogOpen(true)}>
            New appointment
          </Button>
        </>
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <p className="text-sm text-red-700">{error.message}</p>
      ) : (
        <AppointmentList appointments={filtered} />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New appointment</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
              setIsDialogOpen(false);
            }}
            onCancel={() => setIsDialogOpen(false)}
            submitLabel="Create"
          />
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
