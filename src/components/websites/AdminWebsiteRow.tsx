'use client';

import { Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useDeleteWebsite, useUpdateWebsite } from '@/lib/hooks/use-websites';
import { buildWebsiteScreenshotSrc, normalizePublicWebsiteUrl } from '@/lib/websites/build-website-screenshot-src';
import type { Website } from '@/lib/types';

interface AdminWebsiteRowProps {
  website: Website;
  onEditStart?: () => void;
  /** When false, URL/label are read-only (no edit, delete, or active toggle). */
  canManage?: boolean;
}

export function AdminWebsiteRow({
  website,
  onEditStart,
  canManage = true,
}: AdminWebsiteRowProps): JSX.Element {
  const updateWebsite = useUpdateWebsite();
  const deleteWebsite = useDeleteWebsite();
  const [editing, setEditing] = useState(false);
  const [draftUrl, setDraftUrl] = useState(website.url);
  const [draftLabel, setDraftLabel] = useState(website.label ?? '');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);

  const busy = updateWebsite.isPending || deleteWebsite.isPending;

  const handleToggleActive = (next: boolean): void => {
    updateWebsite.mutate({ id: website.id, data: { isActive: next } });
  };

  const startEdit = (): void => {
    onEditStart?.();
    setDraftUrl(website.url);
    setDraftLabel(website.label ?? '');
    setEditing(true);
  };

  const cancelEdit = (): void => {
    setEditing(false);
    setDraftUrl(website.url);
    setDraftLabel(website.label ?? '');
  };

  const saveEdit = (): void => {
    updateWebsite.mutate(
      {
        id: website.id,
        data: {
          url: draftUrl.trim(),
          label: draftLabel.trim() === '' ? null : draftLabel.trim(),
        },
      },
      {
        onSuccess: () => setEditing(false),
      },
    );
  };

  const confirmDelete = (): void => {
    deleteWebsite.mutate(website.id, {
      onSuccess: () => setDeleteOpen(false),
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-start gap-3 rounded-lg border border-border-default bg-surface-base p-3">
        <div className="h-[50px] w-[50px] shrink-0 overflow-hidden rounded-md border border-border-default bg-surface-overlay">
          {!thumbFailed ? (
            <Image
              src={buildWebsiteScreenshotSrc(website.url, { width: 200, crop: 200 })}
              alt=""
              width={50}
              height={50}
              className="object-cover object-top"
              unoptimized
              onError={() => setThumbFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-text-secondary">
              —
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {editing ? (
            <>
              <Input value={draftUrl} onChange={(e) => setDraftUrl(e.target.value)} placeholder="https://…" />
              <Input
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                placeholder="Label (optional)"
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={saveEdit} disabled={busy}>
                  Save
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={cancelEdit} disabled={busy}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <a
                href={normalizePublicWebsiteUrl(website.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="block break-all text-sm font-medium text-text-brand hover:underline"
              >
                {website.url}
              </a>
              {website.label ? (
                <p className="text-xs text-text-secondary">{website.label}</p>
              ) : (
                <p className="text-xs text-text-secondary">No label</p>
              )}
            </>
          )}
        </div>

        {canManage ? (
          <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">Active</span>
              <Switch
                checked={website.isActive}
                onCheckedChange={handleToggleActive}
                disabled={busy || editing}
              />
            </div>
            <div className="flex gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                aria-label="Edit website"
                onClick={startEdit}
                disabled={busy || editing}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-error hover:text-error-dark"
                aria-label="Delete website"
                onClick={() => setDeleteOpen(true)}
                disabled={busy || editing}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="shrink-0 text-xs text-text-secondary">
            {website.isActive ? 'Active' : 'Inactive'}
          </div>
        )}
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove website?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary">Remove this website from the company?</p>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={busy}>
              {deleteWebsite.isPending ? 'Removing…' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
