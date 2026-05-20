'use client';

import { type ReactNode, Fragment } from 'react';
import { useAuth } from '@/context/auth-context';

interface PermissionGateProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Renders children only if the user has the required permission(s).
 * Use this to hide UI elements the user cannot use.
 */
export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps): JSX.Element {
  const { can, canAny, canAll } = useAuth();

  let hasAccess = false;

  if (permission) {
    hasAccess = can(permission);
  } else if (permissions) {
    hasAccess = requireAll ? canAll(...permissions) : canAny(...permissions);
  }

  return hasAccess ? <Fragment>{children}</Fragment> : <Fragment>{fallback}</Fragment>;
}
