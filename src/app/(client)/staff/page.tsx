import { PageMeta } from '@/components/layout/page-meta';

export default function StaffPage(): JSX.Element {
  return (
    <section>
      <PageMeta
        title="Staff management"
        description="Manage staff profiles, working hours, blocked times, and scheduling availability."
      />
    </section>
  );
}
