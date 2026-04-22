export const revalidate = 0;

export default async function AdminHealthPage(): Promise<JSX.Element> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  const response = await fetch(`${baseUrl}/health/readiness`, {
    cache: 'no-store',
    headers: { 'x-correlation-id': crypto.randomUUID() },
  });

  const payload = await response.json().catch(() => ({}));

  return (
    <section>
      <h1 className="text-xl font-semibold">Operational Health</h1>
      <pre className="mt-4 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </section>
  );
}
