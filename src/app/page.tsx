import { redirect } from 'next/navigation';

export default function HomePage(): JSX.Element {
  redirect('/dashboard');
}
