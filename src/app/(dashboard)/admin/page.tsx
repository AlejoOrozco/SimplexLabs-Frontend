import { redirect } from 'next/navigation';

/** Legacy platform home — dashboard content lives at `/dashboard`. */
export default function AdminPlatformPage(): never {
  redirect('/dashboard');
}
