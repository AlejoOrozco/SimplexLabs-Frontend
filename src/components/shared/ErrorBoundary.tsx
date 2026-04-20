'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { error: null };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  private readonly reset = (): void => this.setState({ error: null });

  public override render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      if (fallback) return fallback(error, this.reset);
      return (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm">
          <p className="font-semibold text-red-800">Something went wrong</p>
          <p className="mt-1 text-red-700">{error.message}</p>
          <button
            type="button"
            onClick={this.reset}
            className="mt-3 rounded border px-3 py-1 text-xs"
          >
            Try again
          </button>
        </div>
      );
    }

    return children;
  }
}
