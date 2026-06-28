import { apiDelete, apiGet, apiPut } from '@/lib/api/client';
import type { UpdateWebsiteDto } from '@/lib/schemas/website.schema';
import type { Website, WebsiteLiveStatus } from '@/lib/types';

export async function getWebsites(): Promise<Website[]> {
  return apiGet<Website[]>('/websites');
}

export async function checkLive(id: string): Promise<WebsiteLiveStatus> {
  return apiGet<WebsiteLiveStatus>(`/websites/${id}/check-live`);
}

export async function updateWebsite(id: string, dto: UpdateWebsiteDto): Promise<Website> {
  return apiPut<Website, UpdateWebsiteDto>(`/websites/${id}`, dto);
}

export async function deleteWebsite(id: string): Promise<void> {
  await apiDelete<void>(`/websites/${id}`);
}

export const websitesApi = {
  getAll: getWebsites,
  update: updateWebsite,
  delete: deleteWebsite,
  checkLive,
} as const;
