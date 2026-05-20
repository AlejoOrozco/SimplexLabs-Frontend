'use client';

import { Globe } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import * as websitesApi from '@/lib/api/websites.api';
import { ApiClientError } from '@/lib/api/client';
import { notify } from '@/lib/toast';
import type { Website, WebsiteLiveStatus } from '@/lib/types';
import { buildWebsiteScreenshotSrc, normalizePublicWebsiteUrl } from '@/lib/websites/build-website-screenshot-src';
import { cn } from '@/lib/utils/cn';

interface WebsiteCardProps {
  website: Website;
}

export function WebsiteCard({ website }: WebsiteCardProps): JSX.Element {
  const [liveStatus, setLiveStatus] = useState<WebsiteLiveStatus | null>(null);
  const [checkingLive, setCheckingLive] = useState(false);
  const [screenshotFailed, setScreenshotFailed] = useState(false);

  const previewUrl = normalizePublicWebsiteUrl(website.url);
  const screenshotUrl = buildWebsiteScreenshotSrc(website.url, { width: 1280, crop: 720 });

  const checkLive = async (): Promise<void> => {
    setCheckingLive(true);
    try {
      const result = await websitesApi.checkLive(website.id);
      setLiveStatus(result);
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : 'Could not check live status.';
      notify.error(message);
    } finally {
      setCheckingLive(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border-default bg-surface-page shadow-sm">
      <div className="relative aspect-video w-full overflow-hidden bg-surface-overlay">
        {!screenshotFailed ? (
          <Image
            src={screenshotUrl}
            alt={`Screenshot of ${website.label ?? website.url}`}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
            onError={() => setScreenshotFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-text-secondary">
            <Globe className="h-10 w-10 opacity-50" aria-hidden />
            <span className="text-xs">Preview unavailable</span>
          </div>
        )}
        <div className="absolute right-3 top-3">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
              website.isActive
                ? 'bg-success-light text-success-dark'
                : 'bg-neutral-100 text-neutral-500',
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                website.isActive ? 'bg-success' : 'bg-neutral-400',
              )}
            />
            {website.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div>
          {website.label ? (
            <p className="text-sm font-semibold text-text-primary">{website.label}</p>
          ) : null}
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-sm text-text-brand hover:underline"
          >
            {website.url}
          </a>
        </div>

        <div className="flex items-center justify-between gap-2">
          {liveStatus ? (
            <div className="flex min-w-0 items-center gap-1.5">
              {liveStatus.isLive ? (
                <>
                  <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-success" />
                  <span className="text-xs text-success-dark">
                    Live · {liveStatus.responseTimeMs}ms
                  </span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-error" />
                  <span className="text-xs text-error-dark">Not responding</span>
                </>
              )}
            </div>
          ) : (
            <span className="text-xs text-text-secondary">Status unknown</span>
          )}

          <button
            type="button"
            onClick={() => void checkLive()}
            disabled={checkingLive}
            className="shrink-0 text-xs text-text-brand hover:underline disabled:opacity-50"
          >
            {checkingLive ? 'Checking...' : 'Check status'}
          </button>
        </div>

        <p className="text-xs text-text-secondary">
          Added {new Date(website.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
