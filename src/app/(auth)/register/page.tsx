import { redirect } from 'next/navigation';

/** Public self-registration is disabled; accounts are created via the admin onboarding wizard only. */
export default function RegisterPage() {
  redirect('/login');
}
