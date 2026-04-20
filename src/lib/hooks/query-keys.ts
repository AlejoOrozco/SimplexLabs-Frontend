import type { Channel } from '@/lib/types';

export const queryKeys = {
  appointments: {
    all: ['appointments'] as const,
    list: () => [...queryKeys.appointments.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.appointments.all, 'detail', id] as const,
  },
  conversations: {
    all: ['conversations'] as const,
    list: (channel?: Channel) => [...queryKeys.conversations.all, 'list', channel ?? null] as const,
    detail: (id: string) => [...queryKeys.conversations.all, 'detail', id] as const,
    messages: (id: string) =>
      [...queryKeys.conversations.all, 'detail', id, 'messages'] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: () => [...queryKeys.orders.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.orders.all, 'detail', id] as const,
    history: (id: string) => [...queryKeys.orders.all, 'detail', id, 'history'] as const,
  },
  products: {
    all: ['products'] as const,
    list: () => [...queryKeys.products.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.products.all, 'detail', id] as const,
  },
  websites: {
    all: ['websites'] as const,
    list: () => [...queryKeys.websites.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.websites.all, 'detail', id] as const,
  },
  contacts: {
    all: ['contacts'] as const,
    list: () => [...queryKeys.contacts.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.contacts.all, 'detail', id] as const,
  },
  companies: {
    all: ['companies'] as const,
    list: () => [...queryKeys.companies.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.companies.all, 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    list: () => [...queryKeys.users.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  },
  plans: {
    all: ['plans'] as const,
    list: () => [...queryKeys.plans.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.plans.all, 'detail', id] as const,
  },
  subscriptions: {
    all: ['subscriptions'] as const,
    list: () => [...queryKeys.subscriptions.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.subscriptions.all, 'detail', id] as const,
  },
} as const;
