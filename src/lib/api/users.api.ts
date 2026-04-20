import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client';
import type { CreateUserDto, UpdateUserDto } from '@/lib/schemas/user.schema';
import type { User } from '@/lib/types';

export async function getUsers(): Promise<User[]> {
  return apiGet<User[]>('/users');
}

export async function getUser(id: string): Promise<User> {
  return apiGet<User>(`/users/${id}`);
}

export async function createUser(dto: CreateUserDto): Promise<User> {
  return apiPost<User, CreateUserDto>('/users', dto);
}

export async function updateUser(id: string, dto: UpdateUserDto): Promise<User> {
  return apiPut<User, UpdateUserDto>(`/users/${id}`, dto);
}

export async function deleteUser(id: string): Promise<void> {
  await apiDelete<void>(`/users/${id}`);
}
