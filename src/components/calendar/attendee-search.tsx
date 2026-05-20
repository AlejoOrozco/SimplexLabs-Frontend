'use client';

import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useAttendeeSearch } from '@/lib/hooks/use-attendee-search';
import type { AttendeeSearchResult } from '@/lib/types';

const GROUP_ORDER = ['SimplexLabs Team', 'My Team', 'Customers'] as const;

interface AttendeeSearchProps {
  appointmentId?: string;
  selectedAttendees: AttendeeSearchResult[];
  onAdd: (attendee: AttendeeSearchResult) => void;
  onRemove: (attendeeId: string) => void;
}

export function AttendeeSearch({
  appointmentId,
  selectedAttendees,
  onAdd,
  onRemove,
}: AttendeeSearchProps): ReactElement {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results = [], isLoading } = useAttendeeSearch(query, appointmentId);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent): void => {
      const node = containerRef.current;
      if (node && !node.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen]);

  const grouped = GROUP_ORDER.reduce<Record<string, AttendeeSearchResult[]>>((acc, group) => {
    const items = results.filter((r) => r.group === group);
    if (items.length > 0) acc[group] = items;
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-text-primary" htmlFor="attendee-search-input">
        Attendees <span className="text-text-secondary">(optional)</span>
      </label>

      {selectedAttendees.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedAttendees.map((attendee) => (
            <div
              key={attendee.id}
              className="flex items-center gap-1.5 rounded-full border border-border-default bg-surface-overlay px-3 py-1"
            >
              <span className="text-xs font-medium text-text-primary">{attendee.name}</span>
              <span className="text-xs text-text-secondary">· {attendee.group}</span>
              <button
                type="button"
                onClick={() => onRemove(attendee.id)}
                className="ml-1 text-text-secondary transition-colors hover:text-error-dark"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="relative" ref={containerRef}>
        <input
          ref={inputRef}
          id="attendee-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by name, email, or phone..."
          className="w-full rounded-lg border border-border-default bg-surface-page px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />

        {isOpen && query.length >= 2 ? (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto overflow-x-hidden rounded-lg border border-border-default bg-surface-page shadow-lg">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-text-secondary">Searching…</div>
            ) : null}

            {!isLoading && Object.keys(grouped).length === 0 ? (
              <div className="px-3 py-2 text-sm text-text-secondary">No results found</div>
            ) : null}

            {!isLoading
              ? Object.entries(grouped).map(([group, items]) => (
                  <div key={group}>
                    <div className="border-b border-border-default bg-surface-raised px-3 py-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                        {group}
                      </span>
                    </div>
                    {items.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        onClick={() => {
                          onAdd(result);
                          setQuery('');
                          setIsOpen(false);
                          inputRef.current?.focus();
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-surface-raised"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100">
                          <span className="text-xs font-medium text-brand-700">
                            {result.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-text-primary">{result.name}</p>
                          <p className="truncate text-xs text-text-secondary">
                            {result.email ?? result.phone ?? result.companyName ?? '—'}
                          </p>
                        </div>
                        {result.roleName ? (
                          <span className="shrink-0 text-xs text-text-secondary">
                            {result.roleName.replaceAll('_', ' ').toLowerCase()}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ))
              : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
