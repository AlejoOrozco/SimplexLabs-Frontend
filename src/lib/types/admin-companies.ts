import type { Niche, SessionRoleName } from '@/lib/types';

export interface AdminCompanyPrimaryAdmin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

/** Row from `GET /admin/companies`. */
export interface AdminCompanyListItem {
  id: string;
  name: string;
  niche: Niche;
  /** `companies.is_active` — admin deactivated the tenant. */
  isActive: boolean;
  /** `isActive &&` at least one active platform user. */
  isOperational: boolean;
  primaryAdmin: AdminCompanyPrimaryAdmin | null;
}

export interface AdminCompanyDetailUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: SessionRoleName;
  isActive: boolean;
}

/** Response from `PUT /admin/companies/:companyId/reactivate`. */
export interface AdminCompanyReactivateResponse {
  reactivated: boolean;
  usersReactivated: number;
}

/** Payload from `GET /admin/companies/:companyId/detail`. */
export interface AdminCompanyDetail {
  id: string;
  name: string;
  niche: Niche;
  /** `companies.is_active` — source of truth for tenant deactivation. */
  isActive: boolean;
  deactivatedAt: string | null;
  deactivationReason: string | null;
  users: AdminCompanyDetailUser[];
}
