import { apiGet, apiPost, apiPut } from '@/lib/api/client';
import type { CreateContactDto, UpdateContactDto } from '@/lib/schemas/contact.schema';
import type { ClientContact } from '@/lib/types';

export async function getContacts(): Promise<ClientContact[]> {
  return apiGet<ClientContact[]>('/client-contacts');
}

export async function getContact(id: string): Promise<ClientContact> {
  return apiGet<ClientContact>(`/client-contacts/${id}`);
}

export async function createContact(dto: CreateContactDto): Promise<ClientContact> {
  return apiPost<ClientContact, CreateContactDto>('/client-contacts', dto);
}

export async function updateContact(
  id: string,
  dto: UpdateContactDto,
): Promise<ClientContact> {
  return apiPut<ClientContact, UpdateContactDto>(`/client-contacts/${id}`, dto);
}
