import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client';
import type { CreateWebsiteDto, UpdateWebsiteDto } from '@/lib/schemas/website.schema';
import type { Website } from '@/lib/types';

export async function getWebsites(): Promise<Website[]> {
  return apiGet<Website[]>('/websites');
}

export async function getWebsite(id: string): Promise<Website> {
  return apiGet<Website>(`/websites/${id}`);
}

export async function createWebsite(dto: CreateWebsiteDto): Promise<Website> {
  return apiPost<Website, CreateWebsiteDto>('/websites', dto);
}

export async function updateWebsite(id: string, dto: UpdateWebsiteDto): Promise<Website> {
  return apiPut<Website, UpdateWebsiteDto>(`/websites/${id}`, dto);
}

export async function deleteWebsite(id: string): Promise<void> {
  await apiDelete<void>(`/websites/${id}`);
}
