import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client';
import type { CreateUserDto, UpdateUserDto } from '@/lib/schemas/user.schema';
import type { User } from '@/lib/types';
import { normalizeUser, normalizeUsers } from '@/lib/users/normalize-user';

export async function getUsers(): Promise<User[]> {
  const raw = await apiGet<unknown>('/users');
  return normalizeUsers(raw);
}

export async function getUsersForCompany(companyId: string): Promise<User[]> {
  const raw = await apiGet<unknown>('/users', { params: { companyId } });
  return normalizeUsers(raw);
}

export async function getUser(id: string): Promise<User> {
  const raw = await apiGet<unknown>(`/users/${id}`);
  return normalizeUser(raw);
}

export async function createUser(dto: CreateUserDto): Promise<User> {
  const raw = await apiPost<unknown, CreateUserDto>('/users', dto);
  return normalizeUser(raw);
}

export async function updateUser(id: string, dto: UpdateUserDto): Promise<User> {
  const raw = await apiPut<unknown, UpdateUserDto>(`/users/${id}`, dto);
  return normalizeUser(raw);
}

export async function deleteUser(id: string): Promise<void> {
  await apiDelete<void>(`/users/${id}`);
}
