import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { OAuthCallback } from '@/app/auth/callback/OAuthCallback';

export default function AuthCallbackPage(): JSX.Element {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <OAuthCallback />
    </Suspense>
  );
}
