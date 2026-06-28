import { z } from 'zod';

const userIdentityFields = {
  firstName: z.string().min(1, 'First name is required').max(80),
  lastName: z.string().min(1, 'Last name is required').max(80),
  email: z.string().email('Valid email is required').max(254),
};

export const createCompanyClientUserSchema = z.object(userIdentityFields);

export const createCompanyStaffUserSchema = z.object({
  ...userIdentityFields,
  roleName: z.enum(['COMPANY_ADMIN', 'COMPANY_STAFF']),
});

export type CreateCompanyClientUserFormValues = z.infer<typeof createCompanyClientUserSchema>;
export type CreateCompanyStaffUserFormValues = z.infer<typeof createCompanyStaffUserSchema>;

export const changeCompanyUserRoleSchema = z.object({
  newRoleName: z.enum(['COMPANY_ADMIN', 'COMPANY_STAFF']),
});

export type ChangeCompanyUserRoleFormValues = z.infer<typeof changeCompanyUserRoleSchema>;
