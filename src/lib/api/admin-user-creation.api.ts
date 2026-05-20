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

/** POST /admin/users/:userId/send-credentials — server issues a new password and emails credentials. */
export async function adminSendUserCredentialsEmail(userId: string): Promise<void> {
  await apiPost<void, Record<string, never>>(
    `/admin/users/${encodeURIComponent(userId)}/send-credentials`,
    {},
  );
}
