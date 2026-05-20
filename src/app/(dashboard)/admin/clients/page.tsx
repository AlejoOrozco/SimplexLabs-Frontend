import { redirect } from 'next/navigation';

/** Legacy URL segment `/admin/clients` → Companies list. */
export default function LegacyAdminClientsListPathRedirect(): never {
  redirect('/admin/companies');
}
