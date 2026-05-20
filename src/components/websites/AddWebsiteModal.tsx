'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared/FormField';
import { ApiClientError } from '@/lib/api/client';
import { useAdminCreateCompanyWebsite } from '@/lib/hooks/use-admin-company-websites';
import { createWebsiteSchema, type CreateWebsiteDto } from '@/lib/schemas/website.schema';
import { buildWebsiteScreenshotSrc } from '@/lib/websites/build-website-screenshot-src';
import { notify } from '@/lib/toast';

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

interface AddWebsiteModalProps {
  companyId: string;
  open: boolean;
  onClose: () => void;
}

export function AddWebsiteModal({ companyId, open, onClose }: AddWebsiteModalProps): JSX.Element {
  const createWebsite = useAdminCreateCompanyWebsite(companyId);

  const form = useForm<CreateWebsiteDto>({
    resolver: zodResolver(createWebsiteSchema),
    defaultValues: { url: '', label: '', isActive: true },
  });

  useEffect(() => {
    if (open) {
      form.reset({ url: '', label: '', isActive: true });
    }
  }, [open, form]);

  const watchedUrl = form.watch('url');

  const onSubmit = async (data: CreateWebsiteDto): Promise<void> => {
    try {
      await createWebsite.mutateAsync(data);
      notify.success('Website added', {
        description: 'The URL has been assigned to this company.',
      });
      onClose();
      form.reset({ url: '', label: '', isActive: true });
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : 'Could not add website';
      notify.error(message);
    }
  };

  const handleOpenChange = (next: boolean): void => {
    if (!next) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add website</DialogTitle>
          <p className="text-sm text-text-secondary">
            Assign a website URL to this company&apos;s account.
          </p>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="URL" required error={form.formState.errors.url?.message}>
            <Input {...form.register('url')} placeholder="https://example.com" type="url" autoComplete="off" />
          </FormField>

          <FormField
            label="Label"
            description="Optional name to identify this website"
            error={form.formState.errors.label?.message}
          >
            <Input {...form.register('label')} placeholder="Main store" autoComplete="off" />
          </FormField>

          {watchedUrl && isValidHttpUrl(watchedUrl) ? (
            <div className="relative aspect-video overflow-hidden rounded-lg border border-border-default">
              <Image
                src={buildWebsiteScreenshotSrc(watchedUrl, { width: 1280, crop: 720 })}
                alt="Website preview"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 28rem"
                unoptimized
              />
            </div>
          ) : null}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={createWebsite.isPending}>
              {createWebsite.isPending ? 'Adding…' : 'Add website'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
