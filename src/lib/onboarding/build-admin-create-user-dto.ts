import type {
  AdminCreateClientUserDto,
  AdminCreateStaffUserDto,
  AdminCreateUserVariables,
} from '@/lib/types/admin-provisioning';
import type { UserWizardState } from '@/lib/types/user-creation-wizard-state';

export function buildAdminCreateClientUserDto(state: UserWizardState): AdminCreateClientUserDto | null {
  if (!state.companyId || state.userType !== 'client') return null;
  return {
    companyId: state.companyId,
    email: state.credentials.email.trim(),
    firstName: state.credentials.firstName.trim(),
    lastName: state.credentials.lastName.trim(),
  };
}

export function buildAdminCreateStaffUserDto(state: UserWizardState): AdminCreateStaffUserDto | null {
  if (!state.companyId || state.userType !== 'staff') return null;
  const permissionUpdates =
    state.role === 'COMPANY_STAFF' && state.permissionOverrides.length > 0
      ? state.permissionOverrides
      : undefined;
  return {
    companyId: state.companyId,
    email: state.credentials.email.trim(),
    firstName: state.credentials.firstName.trim(),
    lastName: state.credentials.lastName.trim(),
    roleName: state.role,
    ...(permissionUpdates ? { permissionUpdates } : {}),
  };
}

/** Variables for {@link useAdminCreateUser}, or null if state cannot be submitted. */
export function buildAdminCreateUserVariables(state: UserWizardState): AdminCreateUserVariables | null {
  if (state.userType === 'client') {
    const dto = buildAdminCreateClientUserDto(state);
    return dto ? { flow: 'client', dto } : null;
  }
  if (state.userType === 'staff') {
    const dto = buildAdminCreateStaffUserDto(state);
    return dto ? { flow: 'staff', dto } : null;
  }
  return null;
}
