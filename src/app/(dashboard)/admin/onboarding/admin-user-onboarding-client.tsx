'use client';

import { useSearchParams } from 'next/navigation';
import { UserCreationWizard } from '@/components/admin/user-creation/user-creation-wizard';

export function AdminUserOnboardingClient(): JSX.Element {
  const searchParams = useSearchParams();
  return <UserCreationWizard searchParams={searchParams} />;
}
