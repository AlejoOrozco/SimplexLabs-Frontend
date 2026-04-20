'use client';

import { useState } from 'react';
import { WebsiteForm } from '@/components/websites/WebsiteForm';
import { WebsiteList } from '@/components/websites/WebsiteList';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useCreateWebsite,
  useUpdateWebsite,
  useWebsites,
} from '@/lib/hooks/use-websites';
import type { Website } from '@/lib/types';

export default function WebsitesPage(): JSX.Element {
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Website | null>(null);

  const websites = useWebsites();
  const createMutation = useCreateWebsite();
  const updateMutation = useUpdateWebsite(editing?.id ?? '');

  return (
    <PageWrapper
      title="Websites"
      description="URL records for your company."
      actions={
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Add website
        </Button>
      }
    >
      {websites.isLoading ? (
        <LoadingSpinner />
      ) : websites.isError ? (
        <p className="text-sm text-red-700">{websites.error.message}</p>
      ) : (
        <WebsiteList websites={websites.data ?? []} onRowClick={setEditing} />
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add website</DialogTitle>
          </DialogHeader>
          <WebsiteForm
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
              setIsCreateOpen(false);
            }}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit website</DialogTitle>
          </DialogHeader>
          {editing ? (
            <WebsiteForm
              defaultValues={{
                url: editing.url,
                label: editing.label,
                isActive: editing.isActive,
              }}
              onSubmit={async (values) => {
                await updateMutation.mutateAsync(values);
                setEditing(null);
              }}
              onCancel={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
