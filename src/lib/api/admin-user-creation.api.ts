import { apiPost } from '@/lib/api/client';
import type {
  AdminCreateClientUserDto,
  AdminCreateStaffUserDto,
  AdminCreateUserResult,
} from '@/lib/types/admin-provisioning';

export async function adminCreateClientUser(dto: AdminCreateClientUserDto): Promise<AdminCreateUserResult> {
  return apiPost<AdminCreateUserResult, AdminCreateClientUserDto>('/admin/users/create-client', dto);
}

export async function adminCreateStaffUser(dto: AdminCreateStaffUserDto): Promise<AdminCreateUserResult> {
  return apiPost<AdminCreateUserResult, AdminCreateStaffUserDto>('/admin/users/create-staff', dto);
}
