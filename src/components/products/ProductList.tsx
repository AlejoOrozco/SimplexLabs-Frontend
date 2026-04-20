'use client';

import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import type { Product } from '@/lib/types';
import { formatCurrency, productTypeLabel } from '@/lib/utils/format';

interface ProductListProps {
  products: readonly Product[];
  onRowClick?: (product: Product) => void;
}

export function ProductList({ products, onRowClick }: ProductListProps): JSX.Element {
  const columns: readonly DataTableColumn<Product>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    { id: 'type', header: 'Type', cell: (row) => productTypeLabel(row.type) },
    { id: 'price', header: 'Price', cell: (row) => formatCurrency(row.price) },
    {
      id: 'isActive',
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.isActive ? 'success' : 'neutral'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={products}
      getRowId={(row) => row.id}
      onRowClick={onRowClick}
      emptyTitle="No products"
    />
  );
}
