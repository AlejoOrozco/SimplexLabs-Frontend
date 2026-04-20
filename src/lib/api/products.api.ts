import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client';
import type { CreateProductDto, UpdateProductDto } from '@/lib/schemas/product.schema';
import type { Product } from '@/lib/types';

export async function getProducts(): Promise<Product[]> {
  return apiGet<Product[]>('/products');
}

export async function getProduct(id: string): Promise<Product> {
  return apiGet<Product>(`/products/${id}`);
}

export async function createProduct(dto: CreateProductDto): Promise<Product> {
  return apiPost<Product, CreateProductDto>('/products', dto);
}

export async function updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
  return apiPut<Product, UpdateProductDto>(`/products/${id}`, dto);
}

export async function deleteProduct(id: string): Promise<void> {
  await apiDelete<void>(`/products/${id}`);
}
