'use client';

import { useState } from 'react';
import { OrderDetailDialog } from '@/app/(dashboard)/orders/OrderDetailDialog';
import { OrderForm } from '@/components/orders/OrderForm';
import { OrderList } from '@/components/orders/OrderList';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useContacts } from '@/lib/hooks/use-contacts';
import { useCreateOrder, useOrders } from '@/lib/hooks/use-orders';
import { useProducts } from '@/lib/hooks/use-products';
import type { Order } from '@/lib/types';

export default function OrdersPage(): JSX.Element {
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<Order | null>(null);

  const orders = useOrders();
  const contacts = useContacts();
  const products = useProducts();
  const createMutation = useCreateOrder();

  return (
    <PageWrapper
      title="Orders"
      description="Track purchases and status transitions."
      actions={
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          New order
        </Button>
      }
    >
      {orders.isLoading ? (
        <LoadingSpinner />
      ) : orders.isError ? (
        <p className="text-sm text-red-700">{orders.error.message}</p>
      ) : (
        <OrderList orders={orders.data ?? []} onRowClick={setSelected} />
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New order</DialogTitle>
          </DialogHeader>
          <OrderForm
            contacts={contacts.data ?? []}
            products={products.data ?? []}
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
              setIsCreateOpen(false);
            }}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <OrderDetailDialog
        order={selected}
        onClose={() => setSelected(null)}
      />
    </PageWrapper>
  );
}
