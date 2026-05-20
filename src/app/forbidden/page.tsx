import Link from 'next/link';

export default function ForbiddenPage(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-overlay px-6 text-center text-text-primary">
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p className="max-w-md text-sm text-text-secondary">
        You are signed in, but this area is only available to platform administrators. If you believe this is a
        mistake, contact support.
      </p>
      <Link
        href="/dashboard"
        className="rounded-md border border-border-default bg-surface-base px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-raised"
      >
        Go to dashboard
      </Link>
    </main>
  );
}
