import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api/websites.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { CreateWebsiteDto, UpdateWebsiteDto } from '@/lib/schemas/website.schema';
import type { Website } from '@/lib/types';

export function useWebsites() {
  return useQuery<Website[]>({
    queryKey: queryKeys.websites.list(),
    queryFn: api.getWebsites,
  });
}

export function useWebsite(id: string | undefined) {
  return useQuery<Website>({
    queryKey: queryKeys.websites.detail(id ?? ''),
    queryFn: () => api.getWebsite(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateWebsite() {
  const qc = useQueryClient();
  return useMutation<Website, Error, CreateWebsiteDto>({
    mutationFn: api.createWebsite,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.websites.list() });
    },
  });
}

export function useUpdateWebsite(id: string) {
  const qc = useQueryClient();
  return useMutation<Website, Error, UpdateWebsiteDto>({
    mutationFn: (dto) => api.updateWebsite(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.websites.list() });
      void qc.invalidateQueries({ queryKey: queryKeys.websites.detail(id) });
    },
  });
}

export function useDeleteWebsite() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: api.deleteWebsite,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.websites.list() });
    },
  });
}
