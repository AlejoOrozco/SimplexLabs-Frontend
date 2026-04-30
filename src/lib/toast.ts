'use client';

import { toast } from 'sonner';

interface PromiseMessages<T> {
  loading: string;
  success: string | ((value: T) => string);
  error: string | ((error: unknown) => string);
  description?: string;
}

interface NotifyOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const notify = {
  success: (message: string, options?: NotifyOptions): string | number =>
    toast.success(message, { description: options?.description, duration: options?.duration ?? 4000 }),
  error: (message: string, options?: NotifyOptions): string | number =>
    toast.error(message, { description: options?.description, duration: options?.duration ?? 8000 }),
  warning: (message: string, options?: NotifyOptions): string | number =>
    toast.warning(message, {
      description: options?.description,
      duration: options?.duration ?? 6000,
      action: options?.action,
    }),
  info: (message: string, options?: NotifyOptions): string | number =>
    toast.info(message, { description: options?.description, duration: options?.duration ?? 4000 }),
  loading: (message: string, options?: NotifyOptions): string | number =>
    toast.loading(message, {
      description: options?.description,
      duration: options?.duration ?? Number.POSITIVE_INFINITY,
    }),
  dismiss: (id?: string | number): void => {
    toast.dismiss(id);
  },
  promise: async <T>(promise: Promise<T>, messages: PromiseMessages<T>): Promise<T> => {
    toast.promise(promise, {
      loading: messages.loading,
      success: (value) =>
        typeof messages.success === 'function' ? messages.success(value) : messages.success,
      error: (error) =>
        typeof messages.error === 'function' ? messages.error(error) : messages.error,
      description: messages.description,
    });
    return promise;
  },
};
