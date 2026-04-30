'use client';

import { AlertTriangle } from 'lucide-react';
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
    void error;
    void info;
  }

  private readonly reset = (): void => this.setState({ error: null });

  public override render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      if (fallback) return fallback(error, this.reset);
      return (
        <div role="alert" className="rounded-lg border border-error bg-error-light p-4 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-error-dark" />
            <p className="font-semibold text-error-dark">Something went wrong</p>
          </div>
          {process.env.NODE_ENV !== 'production' ? (
            <p className="mt-1 text-xs text-error-dark">{error.message}</p>
          ) : null}
          <button
            type="button"
            onClick={this.reset}
            className="mt-3 rounded-md border border-border-default bg-surface-page px-3 py-1 text-xs text-text-primary"
          >
            Try again
          </button>
        </div>
      );
    }

    return children;
  }
}
