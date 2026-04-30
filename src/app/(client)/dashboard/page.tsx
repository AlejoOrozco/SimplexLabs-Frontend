'use client';

import Link from 'next/link';
import { DollarSign, MessageCircle, ShoppingCart, CalendarDays } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EmptyState } from '@/components/shared/EmptyState';
import { SkeletonCard, SkeletonStat } from '@/components/shared/Skeleton';
import { apiGet } from '@/lib/api/client';
import * as authApi from '@/lib/api/auth.api';
import { getAppointments } from '@/lib/api/appointments.api';
import { getCompanies } from '@/lib/api/companies.api';
import { getConversations } from '@/lib/api/conversations.api';
import { getOrders } from '@/lib/api/orders.api';
import { getProducts } from '@/lib/api/products.api';
import { getUsers } from '@/lib/api/users.api';
import type { Payment } from '@/lib/api/endpoints';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';

const CHECKLIST_DONE_KEY = 'simplex_dashboard_checklist_done';

function getGreeting(hour: number): string {
  if (hour >= 6 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 18) return 'Good afternoon';
  if (hour >= 18 && hour < 22) return 'Good evening';
  return 'Working late,';
}

function isToday(dateValue: string): boolean {
  const date = new Date(dateValue);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isCurrentMonth(dateValue: string): boolean {
  const date = new Date(dateValue);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export default function DashboardPage(): JSX.Element {
  const [showAllSet, setShowAllSet] = useState(false);

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
  });
  const companiesQuery = useQuery({ queryKey: ['companies'], queryFn: getCompanies });
  const ordersQuery = useQuery({ queryKey: ['orders'], queryFn: getOrders });
  const appointmentsQuery = useQuery({ queryKey: ['appointments'], queryFn: getAppointments });
  const conversationsQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(),
  });
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: getUsers });
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: getProducts });
  const paymentsQuery = useQuery({
    queryKey: ['payments'],
    queryFn: () => apiGet<Payment[]>('/payments'),
  });

  const isLoading =
    meQuery.isLoading ||
    companiesQuery.isLoading ||
    ordersQuery.isLoading ||
    appointmentsQuery.isLoading ||
    conversationsQuery.isLoading ||
    usersQuery.isLoading ||
    productsQuery.isLoading ||
    paymentsQuery.isLoading;

  const isError =
    meQuery.isError ||
    companiesQuery.isError ||
    ordersQuery.isError ||
    appointmentsQuery.isError ||
    conversationsQuery.isError ||
    usersQuery.isError ||
    productsQuery.isError ||
    paymentsQuery.isError;

  const data = useMemo(() => {
    const orders = ordersQuery.data ?? [];
    const appointments = appointmentsQuery.data ?? [];
    const conversations = conversationsQuery.data ?? [];
    const users = usersQuery.data ?? [];
    const products = productsQuery.data ?? [];
    const payments = paymentsQuery.data ?? [];
    const companies = companiesQuery.data ?? [];

    const revenueThisMonth = payments
      .filter((payment) => payment.status === 'CONFIRMED' && isCurrentMonth(payment.createdAt))
      .reduce((sum, payment) => sum + payment.amount, 0);

    const pendingOrders = orders.filter(
      (order) => order.status === 'PENDING' || order.status === 'CONFIRMED',
    ).length;

    const appointmentsToday = appointments.filter((appointment) => isToday(appointment.scheduledAt)).length;
    const openConversations = conversations.filter((conversation) => conversation.status !== 'CLOSED').length;

    const recentConversations = [...conversations]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    const upcomingAppointments = [...appointments]
      .filter((appointment) => new Date(appointment.scheduledAt).getTime() >= Date.now())
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 5);

    const checklistItems = [
      { key: 'product', label: 'Add your first product or service', done: products.length > 0, href: '/orders' },
      { key: 'agent', label: 'Configure your AI agent', done: false, href: '/settings/agent/profile' },
      { key: 'knowledge', label: 'Add your business knowledge base', done: false, href: '/settings/agent/knowledge-base' },
      { key: 'staff', label: 'Invite a staff member', done: users.length > 1, href: '/staff' },
      {
        key: 'whatsapp',
        label: 'Connect your WhatsApp number',
        done: conversations.some((conversation) => conversation.channel === 'WHATSAPP'),
        href: '/settings/channels',
      },
    ] as const;

    const allChecklistDone = checklistItems.every((item) => item.done);
    const companyName = companies[0]?.name ?? 'your company';

    return {
      revenueThisMonth,
      pendingOrders,
      appointmentsToday,
      openConversations,
      recentConversations,
      upcomingAppointments,
      checklistItems,
      allChecklistDone,
      hasNoConversations: conversations.length === 0,
      companyName,
    };
  }, [
    appointmentsQuery.data,
    companiesQuery.data,
    conversationsQuery.data,
    ordersQuery.data,
    paymentsQuery.data,
    productsQuery.data,
    usersQuery.data,
  ]);

  useEffect(() => {
    if (!data) return;
    if (!data.allChecklistDone) return;
    const seen = localStorage.getItem(CHECKLIST_DONE_KEY) === '1';
    if (seen) return;
    localStorage.setItem(CHECKLIST_DONE_KEY, '1');
    setShowAllSet(true);
  }, [data]);

  const greeting = getGreeting(new Date().getHours());
  const firstName = meQuery.data?.firstName ?? 'there';
  const hideChecklistForever = typeof window !== 'undefined' && localStorage.getItem(CHECKLIST_DONE_KEY) === '1';

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonStat key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-error bg-error-light p-4">
        <p className="font-medium text-error-dark">Could not load dashboard metrics.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-text-primary">
          {greeting} {firstName} <span aria-hidden>👋</span>
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Here&apos;s what&apos;s happening at {data.companyName} today.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-border-default bg-surface-page p-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <DollarSign className="h-4 w-4" /> Revenue
          </div>
          <p className="mt-3 text-3xl font-semibold">{formatCurrency(data.revenueThisMonth)}</p>
          <p className="mt-1 text-xs text-text-secondary">This month</p>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-page p-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <ShoppingCart className="h-4 w-4" /> Orders
          </div>
          <p className="mt-3 text-3xl font-semibold">{data.pendingOrders}</p>
          <p className="mt-1 text-xs text-text-secondary">Pending + confirmed</p>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-page p-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <CalendarDays className="h-4 w-4" /> Appointments today
          </div>
          <p className="mt-3 text-3xl font-semibold">{data.appointmentsToday}</p>
          <p className="mt-1 text-xs text-text-secondary">Scheduled for today</p>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-page p-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <MessageCircle className="h-4 w-4" /> Open chats
          </div>
          <p className="mt-3 text-3xl font-semibold">{data.openConversations}</p>
          <p className="mt-1 text-xs text-text-secondary">Not closed yet</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-border-default bg-surface-page p-4">
          <h3 className="text-sm font-semibold">Recent conversations</h3>
          <p className="mb-3 text-xs text-text-secondary">Last 5</p>
          {data.recentConversations.length === 0 ? (
            <EmptyState title="No conversations yet" description="New messages will appear here." />
          ) : (
            <ul className="space-y-2">
              {data.recentConversations.map((conversation) => (
                <li key={conversation.id} className="rounded-md border border-border-default p-2">
                  <p className="text-sm font-medium">{conversation.contact?.firstName ?? 'Unknown contact'}</p>
                  <p className="text-xs text-text-secondary">{conversation.channel}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-lg border border-border-default bg-surface-page p-4">
          <h3 className="text-sm font-semibold">Upcoming appointments</h3>
          <p className="mb-3 text-xs text-text-secondary">Next 5</p>
          {data.upcomingAppointments.length === 0 ? (
            <EmptyState title="No upcoming appointments" description="Your schedule is clear." />
          ) : (
            <ul className="space-y-2">
              {data.upcomingAppointments.map((appointment) => (
                <li key={appointment.id} className="rounded-md border border-border-default p-2">
                  <p className="text-sm font-medium">{appointment.title}</p>
                  <p className="text-xs text-text-secondary">{formatDateTime(appointment.scheduledAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {data.hasNoConversations && !hideChecklistForever && !data.allChecklistDone ? (
        <section className="rounded-lg border border-border-default bg-surface-page p-4">
          <h3 className="text-sm font-semibold">Getting started checklist</h3>
          <ul className="mt-3 space-y-2">
            {data.checklistItems.map((item) => (
              <li key={item.key} className="flex items-center justify-between rounded-md border border-border-default px-3 py-2">
                <span className={item.done ? 'text-text-secondary line-through' : 'text-text-primary'}>
                  {item.done ? 'Done: ' : ''}{item.label}
                </span>
                {!item.done ? (
                  <Link href={item.href} className="text-sm text-text-brand underline">
                    Open
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {showAllSet ? (
        <section className="rounded-lg border border-success bg-success-light p-4 text-success-dark">
          You&apos;re all set!
        </section>
      ) : null}
    </section>
  );
}
