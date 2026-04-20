import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api/contacts.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { CreateContactDto, UpdateContactDto } from '@/lib/schemas/contact.schema';
import type { ClientContact } from '@/lib/types';

export function useContacts() {
  return useQuery<ClientContact[]>({
    queryKey: queryKeys.contacts.list(),
    queryFn: api.getContacts,
  });
}

export function useContact(id: string | undefined) {
  return useQuery<ClientContact>({
    queryKey: queryKeys.contacts.detail(id ?? ''),
    queryFn: () => api.getContact(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation<ClientContact, Error, CreateContactDto>({
    mutationFn: api.createContact,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.contacts.list() });
    },
  });
}

export function useUpdateContact(id: string) {
  const qc = useQueryClient();
  return useMutation<ClientContact, Error, UpdateContactDto>({
    mutationFn: (dto) => api.updateContact(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.contacts.list() });
      void qc.invalidateQueries({ queryKey: queryKeys.contacts.detail(id) });
    },
  });
}
