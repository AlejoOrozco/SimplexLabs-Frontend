import { apiPost } from '@/lib/api/client';
import { normalizeAdminCreateUserResult } from '@/lib/onboarding/normalize-admin-create-user-result';
import type {
  AdminCreateClientUserDto,
  AdminCreateStaffUserDto,
  AdminCreateUserResult,
} from '@/lib/types/admin-provisioning';

export async function adminCreateClientUser(dto: AdminCreateClientUserDto): Promise<AdminCreateUserResult> {
  const raw = await apiPost<unknown, AdminCreateClientUserDto>('/admin/users/create-client', dto);
  return normalizeAdminCreateUserResult(raw, {
    firstName: dto.firstName,
    lastName: dto.lastName,
  });
}

export async function adminCreateStaffUser(dto: AdminCreateStaffUserDto): Promise<AdminCreateUserResult> {
  const raw = await apiPost<unknown, AdminCreateStaffUserDto>('/admin/users/create-staff', dto);
  return normalizeAdminCreateUserResult(raw, {
    firstName: dto.firstName,
    lastName: dto.lastName,
  });
}
