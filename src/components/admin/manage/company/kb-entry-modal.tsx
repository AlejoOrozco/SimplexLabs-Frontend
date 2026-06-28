'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/shared/FormField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getApiErrorMessage } from '@/lib/api/get-api-error-message';
import {
  useAdminCreateKnowledgeBaseEntry,
  useAdminUpdateKnowledgeBaseEntry,
} from '@/lib/hooks/use-admin-company-knowledge-base';
import {
  agentKbWriteSchema,
  type AgentKbWriteFormValues,
} from '@/lib/schemas/admin-hub/admin-kb.schema';
import type { AgentKbEntry } from '@/lib/types/admin-hub';
import { notify } from '@/lib/toast';

function emptyCategoryToNull(value: string | null | undefined): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed.length === 0 ? null : trimmed;
}

function entryToFormValues(entry: AgentKbEntry): AgentKbWriteFormValues {
  return {
    title: entry.title,
    content: entry.content,
    category: entry.category ?? '',
  };
}

const EMPTY_FORM_VALUES: AgentKbWriteFormValues = {
  title: '',
  content: '',
  category: '',
};

interface KbEntryModalProps {
  companyId: string;
  open: boolean;
  onClose: () => void;
  entry?: AgentKbEntry | null;
}

export function KbEntryModal({
  companyId,
  open,
  onClose,
  entry = null,
}: KbEntryModalProps): JSX.Element {
  const isEditing = entry != null;
  const createEntry = useAdminCreateKnowledgeBaseEntry(companyId);
  const updateEntry = useAdminUpdateKnowledgeBaseEntry(companyId);

  const form = useForm<AgentKbWriteFormValues>({
    resolver: zodResolver(agentKbWriteSchema),
    defaultValues: EMPTY_FORM_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(isEditing ? entryToFormValues(entry) : EMPTY_FORM_VALUES);
  }, [open, isEditing, entry, form]);

  const isPending = createEntry.isPending || updateEntry.isPending;

  const onSubmit = async (values: AgentKbWriteFormValues): Promise<void> => {
    const dto = {
      title: values.title.trim(),
      content: values.content.trim(),
      category: emptyCategoryToNull(values.category),
    };

    try {
      if (isEditing) {
        await updateEntry.mutateAsync({ entryId: entry.id, dto });
        notify.success('Knowledge base entry updated');
      } else {
        await createEntry.mutateAsync({ ...dto, isActive: true });
        notify.success('Knowledge base entry created');
      }
      onClose();
    } catch (error) {
      notify.error(
        getApiErrorMessage(
          error,
          isEditing ? 'Could not update entry' : 'Could not create entry',
        ),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit entry' : 'Add knowledge base entry'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField label="Title" required error={form.formState.errors.title?.message}>
            <Input {...form.register('title')} autoComplete="off" />
          </FormField>

          <FormField label="Category" error={form.formState.errors.category?.message}>
            <Input
              {...form.register('category')}
              placeholder="Optional grouping, e.g. Pricing"
              autoComplete="off"
            />
          </FormField>

          <FormField label="Content" required error={form.formState.errors.content?.message}>
            <Textarea {...form.register('content')} rows={8} placeholder="Answer or training text" />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Create entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
