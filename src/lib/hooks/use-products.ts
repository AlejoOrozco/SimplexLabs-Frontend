import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api/products.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { CreateProductDto, UpdateProductDto } from '@/lib/schemas/product.schema';
import type { Product } from '@/lib/types';

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: queryKeys.products.list(),
    queryFn: api.getProducts,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery<Product>({
    queryKey: queryKeys.products.detail(id ?? ''),
    queryFn: () => api.getProduct(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation<Product, Error, CreateProductDto>({
    mutationFn: api.createProduct,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.products.list() });
    },
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation<Product, Error, UpdateProductDto>({
    mutationFn: (dto) => api.updateProduct(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.products.list() });
      void qc.invalidateQueries({ queryKey: queryKeys.products.detail(id) });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: api.deleteProduct,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.products.list() });
    },
  });
}
