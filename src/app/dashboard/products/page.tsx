'use client';

import { useState } from 'react';
import { ProductForm } from '@/components/products/ProductForm';
import { ProductList } from '@/components/products/ProductList';
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
  useCreateProduct,
  useProducts,
  useUpdateProduct,
} from '@/lib/hooks/use-products';
import type { Product } from '@/lib/types';

export default function ProductsPage(): JSX.Element {
  const [editing, setEditing] = useState<Product | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  const products = useProducts();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(editing?.id ?? '');

  return (
    <PageWrapper
      title="Products"
      description="Products and services your company offers."
      actions={
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          New product
        </Button>
      }
    >
      {products.isLoading ? (
        <LoadingSpinner />
      ) : products.isError ? (
        <p className="text-sm text-red-700">{products.error.message}</p>
      ) : (
        <ProductList products={products.data ?? []} onRowClick={setEditing} />
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New product</DialogTitle>
          </DialogHeader>
          <ProductForm
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
            <DialogTitle>Edit product</DialogTitle>
          </DialogHeader>
          {editing ? (
            <ProductForm
              defaultValues={{
                name: editing.name,
                description: editing.description,
                type: editing.type,
                price: editing.price,
                isActive: editing.isActive,
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
