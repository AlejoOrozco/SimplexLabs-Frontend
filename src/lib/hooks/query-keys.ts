import type { Channel } from '@/lib/types';
import type { AgentKbListFilters, AdminPlanListFilters } from '@/lib/types/admin-hub';

export const queryKeys = {
  admin: {
    all: ['admin'] as const,
    agentFailures: () => [...queryKeys.admin.all, 'agent-failures'] as const,
    failedTasks: () => [...queryKeys.admin.all, 'failed-tasks'] as const,
    companies: {
      all: ['admin', 'companies'] as const,
      list: () => [...queryKeys.admin.companies.all, 'list'] as const,
      detail: (id: string) => [...queryKeys.admin.companies.all, 'detail', id] as const,
    },
    manage: {
      all: ['admin', 'manage'] as const,
      summary: (companyId: string) =>
        [...queryKeys.admin.manage.all, 'summary', companyId] as const,
      subscriptions: (companyId: string) =>
        [...queryKeys.admin.manage.all, 'subscriptions', companyId] as const,
      users: (companyId: string) => [...queryKeys.admin.manage.all, 'users', companyId] as const,
      agentConfig: (companyId: string) =>
        [...queryKeys.admin.manage.all, 'agent-config', companyId] as const,
      knowledgeBase: (companyId: string, filters?: AgentKbListFilters) =>
        [...queryKeys.admin.manage.all, 'knowledge-base', companyId, filters ?? {}] as const,
      billingOverview: (companyId: string) =>
        [...queryKeys.admin.manage.all, 'billing-overview', companyId] as const,
    },
    plans: {
      all: ['admin', 'plans'] as const,
      list: (filters?: AdminPlanListFilters) =>
        [...queryKeys.admin.plans.all, 'list', filters ?? {}] as const,
      detail: (planId: string) => [...queryKeys.admin.plans.all, 'detail', planId] as const,
    },
  },
  appointments: {
    all: ['appointments'] as const,
    list: () => [...queryKeys.appointments.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.appointments.all, 'detail', id] as const,
  },
  calendar: {
    all: ['calendar'] as const,
    events: (key: unknown) => [...queryKeys.calendar.all, 'events', key] as const,
    staff: () => [...queryKeys.calendar.all, 'staff'] as const,
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
    adminList: (companyId: string) => [...queryKeys.websites.all, 'admin', companyId] as const,
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
    listByCompany: (companyId: string) => [...queryKeys.users.all, 'list', 'company', companyId] as const,
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
