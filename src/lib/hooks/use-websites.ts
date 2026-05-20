import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api/websites.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import { notify } from '@/lib/toast';
import type { CreateWebsiteDto, UpdateWebsiteDto } from '@/lib/schemas/website.schema';
import type { Website } from '@/lib/types';
import { ApiClientError } from '@/lib/api/client';

const WEBSITES_STALE_MS = 1000 * 60 * 2;

export function useWebsites() {
  return useQuery<Website[]>({
    queryKey: queryKeys.websites.list(),
    queryFn: api.getWebsites,
    staleTime: WEBSITES_STALE_MS,
  });
}

export function useWebsite(id: string | undefined) {
  return useQuery<Website>({
    queryKey: queryKeys.websites.detail(id ?? ''),
    queryFn: () => api.getWebsite(id as string),
    enabled: Boolean(id),
    staleTime: WEBSITES_STALE_MS,
  });
}

export function useCreateWebsite() {
  const qc = useQueryClient();
  return useMutation<Website, Error, CreateWebsiteDto>({
    mutationFn: api.createWebsite,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.websites.all });
      notify.success('Website added');
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiClientError ? error.message : 'Failed to add website';
      notify.error(message);
    },
  });
}

export function useUpdateWebsite() {
  const qc = useQueryClient();
  return useMutation<Website, Error, { id: string; data: UpdateWebsiteDto }>({
    mutationFn: ({ id, data }) => api.updateWebsite(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.websites.all });
      notify.success('Website updated');
    },
    onError: () => {
      notify.error('Failed to update website');
    },
  });
}

export function useDeleteWebsite() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: api.deleteWebsite,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.websites.all });
      notify.success('Website removed');
    },
    onError: () => {
      notify.error('Failed to remove website');
    },
  });
}
