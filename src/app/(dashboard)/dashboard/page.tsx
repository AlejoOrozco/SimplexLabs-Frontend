'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAppointments } from '@/lib/hooks/use-appointments';
import { useConversations } from '@/lib/hooks/use-conversations';
import { useOrders } from '@/lib/hooks/use-orders';
import { useProducts } from '@/lib/hooks/use-products';
import { ConvoStatus } from '@/lib/types';

export default function DashboardOverviewPage(): JSX.Element {
  const appointments = useAppointments();
  const orders = useOrders();
  const conversations = useConversations();
  const products = useProducts();

  const isLoading =
    appointments.isLoading ||
    orders.isLoading ||
    conversations.isLoading ||
    products.isLoading;

  return (
    <PageWrapper title="Dashboard" description="Overview of your SimplexLabs workspace.">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Appointments"
            description="All upcoming and past"
            value={appointments.data?.length ?? 0}
          />
          <StatCard
            title="Orders"
            description="All orders"
            value={orders.data?.length ?? 0}
          />
          <StatCard
            title="Open conversations"
            description="Currently open"
            value={
              conversations.data?.filter((c) => c.status === ConvoStatus.OPEN).length ?? 0
            }
          />
          <StatCard
            title="Active products"
            description="Available for sale"
            value={products.data?.filter((p) => p.isActive).length ?? 0}
          />
        </div>
      )}
    </PageWrapper>
  );
}

function StatCard({
  title,
  description,
  value,
}: {
  title: string;
  description: string;
  value: number;
}): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
