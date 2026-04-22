export default function FailedTasksPage(): JSX.Element {
  return (
    <section>
      <h1 className="text-xl font-semibold">Failed Tasks DLQ</h1>
      <p className="mt-2 text-sm text-slate-600">
        Filter by status/type/date, inspect payloads, replay pending tasks, and abandon with reason.
      </p>
    </section>
  );
}
