'use client';

import { useState } from 'react';
import { PlanForm } from '@/components/plans/PlanForm';
import { PlanList } from '@/components/plans/PlanList';
import { AdminGuard } from '@/components/layout/AdminGuard';
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
  useCreatePlan,
  usePlans,
  useUpdatePlan,
} from '@/lib/hooks/use-plans';
import type { Plan } from '@/lib/types';

export default function PlansPage(): JSX.Element {
  return (
    <AdminGuard>
      <PlansContent />
    </AdminGuard>
  );
}

function PlansContent(): JSX.Element {
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Plan | null>(null);

  const plans = usePlans();
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan(editing?.id ?? '');

  return (
    <PageWrapper
      title="Plans"
      description="Service plans SimplexLabs sells."
      actions={
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          New plan
        </Button>
      }
    >
      {plans.isLoading ? (
        <LoadingSpinner />
      ) : plans.isError ? (
        <p className="text-sm text-red-700">{plans.error.message}</p>
      ) : (
        <PlanList plans={plans.data ?? []} onRowClick={setEditing} />
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New plan</DialogTitle>
          </DialogHeader>
          <PlanForm
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
              setIsCreateOpen(false);
            }}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit plan</DialogTitle>
          </DialogHeader>
          {editing ? (
            <PlanForm
              defaultValues={{
                name: editing.name,
                niche: editing.niche,
                priceMonthly: editing.priceMonthly,
                setupFee: editing.setupFee,
                isActive: editing.isActive,
                features: editing.features.map((f) => f.feature),
                channels: editing.channels.map((c) => c.channel),
              }}
              onSubmit={async (values) => {
                await updateMutation.mutateAsync(values);
                setEditing(null);
              }}
              onCancel={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
