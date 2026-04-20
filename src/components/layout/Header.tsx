'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { fullName } from '@/lib/utils/format';

export function Header(): JSX.Element {
  const { user, logout } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  const handleLogout = async (): Promise<void> => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await logout();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <div className="text-sm text-gray-600">
        {user ? <span>Signed in as {fullName(user)}</span> : null}
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <span className="text-sm">
            {user.email}
          </span>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleLogout}
          disabled={isSigningOut}
        >
          {isSigningOut ? 'Signing out…' : 'Log out'}
        </Button>
      </div>
    </header>
  );
}
