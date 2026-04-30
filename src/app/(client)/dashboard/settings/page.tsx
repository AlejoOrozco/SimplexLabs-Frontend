import { redirect } from 'next/navigation';

export default function DashboardSettingsRedirectPage(): never {
  redirect('/settings/company');
}
