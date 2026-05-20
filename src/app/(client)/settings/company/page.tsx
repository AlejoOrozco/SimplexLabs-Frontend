import { PageMeta } from '@/components/layout/page-meta';

export default function CompanySettingsPage(): JSX.Element {
  return (
    <section>
      <PageMeta
        title="Company settings"
        description="Company-wide channels, defaults, and tenant-level operational preferences."
      />
    </section>
  );
}
