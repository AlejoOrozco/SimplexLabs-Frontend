interface PromptRolePageProps {
  params: { role: string };
}

export default function PromptRolePage({ params }: PromptRolePageProps): JSX.Element {
  return (
    <section>
      <h1 className="text-xl font-semibold">Prompt Role: {params.role}</h1>
      <p className="mt-2 text-sm text-slate-600">
        Edit model, temperature, max tokens, system instructions, and active status for this role.
      </p>
    </section>
  );
}
