import { redirect } from 'next/navigation';

export default function FailedTasksRedirectPage() {
  redirect('/admin/failed-tasks');
}
