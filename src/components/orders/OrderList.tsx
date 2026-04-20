'use client';

import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import type { Order } from '@/lib/types';
import { formatCurrency, formatDate, fullName } from '@/lib/utils/format';

interface OrderListProps {
  orders: readonly Order[];
  onRowClick?: (order: Order) => void;
}

export function OrderList({ orders, onRowClick }: OrderListProps): JSX.Element {
  const columns: readonly DataTableColumn<Order>[] = [
    {
      id: 'contact',
      header: 'Contact',
      cell: (row) => (row.contact ? fullName(row.contact) : row.contactId),
    },
    {
      id: 'product',
      header: 'Product',
      cell: (row) => row.product?.name ?? row.productId,
    },
    {
      id: 'amount',
      header: 'Amount',
      cell: (row) => formatCurrency(row.amount),
    },
    {
      id: 'createdAt',
      header: 'Created',
      cell: (row) => formatDate(row.createdAt),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <OrderStatusBadge status={row.status} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={orders}
      getRowId={(row) => row.id}
      onRowClick={onRowClick}
      emptyTitle="No orders"
      emptyDescription="Orders created from appointments or manually will appear here."
    />
  );
}
