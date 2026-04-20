import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center p-6">
      <h1 className="mb-6 text-xl font-semibold">Create account</h1>
      <RegisterForm />
    </main>
  );
}
