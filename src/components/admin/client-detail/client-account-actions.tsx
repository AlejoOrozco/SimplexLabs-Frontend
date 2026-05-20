'use client';

import { Button } from '@/components/ui/button';
import { useUpdateUser } from '@/lib/hooks/use-users';
import type { User } from '@/lib/types';
import { notify } from '@/lib/toast';

interface ClientAccountActionsProps {
  user: User;
}

export function ClientAccountActions({ user }: ClientAccountActionsProps): JSX.Element {
  const updateUser = useUpdateUser(user.id);

  const handleToggle = async (): Promise<void> => {
    try {
      await updateUser.mutateAsync({ isActive: !user.isActive });
      notify.success(user.isActive ? 'User deactivated' : 'User reactivated');
    } catch {
      notify.error('Could not update account status');
    }
  };

  return (
    <div className="mt-2 space-y-2 text-sm">
      <p className="text-text-secondary">
        Primary client user:{' '}
        <span className="font-medium text-text-primary">
          {user.firstName} {user.lastName}
        </span>{' '}
        ({user.email}) — {user.isActive ? 'Active' : 'Inactive'}
      </p>
      <Button type="button" variant="destructive" disabled={updateUser.isPending} onClick={() => void handleToggle()}>
        {user.isActive ? 'Deactivate account' : 'Reactivate account'}
      </Button>
    </div>
  );
}
