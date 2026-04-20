'use client';

import { useState } from 'react';
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm';
import { SubscriptionList } from '@/components/subscriptions/SubscriptionList';
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
import { useCompanies } from '@/lib/hooks/use-companies';
import { usePlans } from '@/lib/hooks/use-plans';
import {
  useCreateSubscription,
  useSubscriptions,
  useUpdateSubscription,
} from '@/lib/hooks/use-subscriptions';
import type { Subscription } from '@/lib/types';

export default function SubscriptionsPage(): JSX.Element {
  return (
    <AdminGuard>
      <SubscriptionsContent />
    </AdminGuard>
  );
}

function SubscriptionsContent(): JSX.Element {
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Subscription | null>(null);

  const subscriptions = useSubscriptions();
  const companies = useCompanies();
  const plans = usePlans();
  const createMutation = useCreateSubscription();
  const updateMutation = useUpdateSubscription(editing?.id ?? '');

  return (
    <PageWrapper
      title="Subscriptions"
      description="Assign plans to companies."
      actions={
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          New subscription
        </Button>
      }
    >
      {subscriptions.isLoading ? (
        <LoadingSpinner />
      ) : subscriptions.isError ? (
        <p className="text-sm text-red-700">{subscriptions.error.message}</p>
      ) : (
        <SubscriptionList
          subscriptions={subscriptions.data ?? []}
          onRowClick={setEditing}
        />
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New subscription</DialogTitle>
          </DialogHeader>
          <SubscriptionForm
            companies={companies.data ?? []}
            plans={plans.data ?? []}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit subscription</DialogTitle>
          </DialogHeader>
          {editing ? (
            <SubscriptionForm
              companies={companies.data ?? []}
              plans={plans.data ?? []}
              defaultValues={{
                companyId: editing.companyId,
                planId: editing.planId,
                status: editing.status,
                initialPayment: editing.initialPayment,
                startedAt: editing.startedAt,
                nextBillingAt: editing.nextBillingAt,
              }}
              onSubmit={async (values) => {
                await updateMutation.mutateAsync({
                  status: values.status,
                  initialPayment: values.initialPayment,
                  startedAt: values.startedAt,
                  nextBillingAt: values.nextBillingAt,
                });
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
