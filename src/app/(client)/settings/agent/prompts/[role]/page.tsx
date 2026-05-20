import { PageMeta } from '@/components/layout/page-meta';

interface PromptRolePageProps {
  params: { role: string };
}

export default function PromptRolePage({ params }: PromptRolePageProps): JSX.Element {
  return (
    <section>
      <PageMeta
        title={`Prompt role: ${params.role}`}
        description="Edit model, temperature, max tokens, system instructions, and active status for this role."
      />
    </section>
  );
}
