import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/session';

export async function requireClientSession() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireSuperAdminSession() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'SUPER_ADMIN') redirect('/forbidden');
  return session;
}
