import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/session';
import { isSimplexAdminRoleName } from '@/lib/auth/session-role-utils';

export async function requireClientSession() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireSuperAdminSession() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  const role = session.role;
  if (!isSimplexAdminRoleName(role)) redirect('/forbidden');
  return session;
}
