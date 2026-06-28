'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { KbEntryModal } from '@/components/admin/manage/company/kb-entry-modal';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/Skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { companyHasActiveAgentsPlan } from '@/lib/admin/company-has-active-agents-plan';
import { adminCompanyManageSectionHref } from '@/lib/admin/admin-company-workspace-href';
import { getApiErrorMessage } from '@/lib/api/get-api-error-message';
import { useAdminCompanySubscriptions } from '@/lib/hooks/use-admin-company-subscriptions';
import {
  useAdminCompanyKnowledgeBase,
  useAdminToggleKnowledgeBaseEntry,
} from '@/lib/hooks/use-admin-company-knowledge-base';
import type { AgentKbEntry, AgentKbListFilters } from '@/lib/types/admin-hub';
import { notify } from '@/lib/toast';

const KB_PAGE_SIZE = 15;
const SEARCH_DEBOUNCE_MS = 300;

type ActiveFilter = 'all' | 'active' | 'inactive';

function activeFilterToIsActive(filter: ActiveFilter): boolean | undefined {
  if (filter === 'active') return true;
  if (filter === 'inactive') return false;
  return undefined;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

interface ManageKnowledgeBaseSectionProps {
  companyId: string;
  companyIsInactive?: boolean;
}

export function ManageKnowledgeBaseSection({
  companyId,
  companyIsInactive = false,
}: ManageKnowledgeBaseSectionProps): JSX.Element {
  const subscriptionsQuery = useAdminCompanySubscriptions(companyId);
  const toggleEntry = useAdminToggleKnowledgeBaseEntry(companyId);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AgentKbEntry | null>(null);
  const [togglingEntryId, setTogglingEntryId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter, activeFilter]);

  const listFilters = useMemo((): AgentKbListFilters => {
    const filters: AgentKbListFilters = {
      page,
      limit: KB_PAGE_SIZE,
    };
    if (debouncedSearch) filters.search = debouncedSearch;
    const category = categoryFilter.trim();
    if (category) filters.category = category;
    const isActive = activeFilterToIsActive(activeFilter);
    if (isActive !== undefined) filters.isActive = isActive;
    return filters;
  }, [page, debouncedSearch, categoryFilter, activeFilter]);

  const kbQuery = useAdminCompanyKnowledgeBase(companyId, listFilters);

  const items = kbQuery.data?.items ?? [];
  const total = kbQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / KB_PAGE_SIZE));
  const hasAgentsPlan = companyHasActiveAgentsPlan(companyId, subscriptionsQuery.data);
  const isLoading = subscriptionsQuery.isLoading || kbQuery.isLoading;

  const openCreate = (): void => {
    setEditingEntry(null);
    setModalOpen(true);
  };

  const openEdit = (entry: AgentKbEntry): void => {
    setEditingEntry(entry);
    setModalOpen(true);
  };

  const closeModal = (): void => {
    setModalOpen(false);
    setEditingEntry(null);
  };

  const handleToggleActive = async (entry: AgentKbEntry, nextActive: boolean): Promise<void> => {
    setTogglingEntryId(entry.id);
    try {
      await toggleEntry.mutateAsync({ entryId: entry.id, isActive: nextActive });
      notify.success(nextActive ? 'Entry activated' : 'Entry deactivated');
    } catch (error) {
      notify.error(getApiErrorMessage(error, 'Could not update entry status'));
    } finally {
      setTogglingEntryId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full max-w-xl" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (subscriptionsQuery.isError || kbQuery.isError) {
    return (
      <div className="rounded-lg border border-error bg-error-surface p-4 text-sm text-error-dark">
        Could not load knowledge base entries for this company.
      </div>
    );
  }

  if (companyIsInactive) {
    return (
      <p className="text-sm text-text-secondary">
        This company is inactive. Knowledge base changes are disabled until the company is
        reactivated.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Knowledge base</h3>
          <p className="mt-1 text-sm text-text-secondary">
            FAQ and training entries used by this company&apos;s AI agent. Inactive entries are
            hidden from the agent but kept for reference.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          Add entry
        </Button>
      </div>

      {!hasAgentsPlan ? (
        <div className="rounded-lg border border-warning bg-warning-surface px-4 py-3 text-sm text-warning-dark">
          <p>
            This company does not have an active AI Agents plan. Entries are saved but will not be
            used until a plan is assigned.
          </p>
          <Link
            href={adminCompanyManageSectionHref(companyId, 'subscriptions')}
            scroll={false}
            className="mt-2 inline-block font-medium text-warning-dark underline hover:no-underline"
          >
            Assign an AI Agents plan
          </Link>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border-default bg-surface-base p-4">
        <div className="min-w-[12rem] flex-1">
          <Label htmlFor="kb-search" className="mb-1.5 block text-xs text-text-secondary">
            Search
          </Label>
          <Input
            id="kb-search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Title or content…"
            autoComplete="off"
          />
        </div>

        <div className="min-w-[10rem]">
          <Label htmlFor="kb-category" className="mb-1.5 block text-xs text-text-secondary">
            Category
          </Label>
          <Input
            id="kb-category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder="All categories"
            autoComplete="off"
          />
        </div>

        <div className="min-w-[9rem]">
          <Label className="mb-1.5 block text-xs text-text-secondary">Status</Label>
          <Select
            value={activeFilter}
            onValueChange={(value) => setActiveFilter(value as ActiveFilter)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entries</SelectItem>
              <SelectItem value="active">Active only</SelectItem>
              <SelectItem value="inactive">Inactive only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={total === 0 && !debouncedSearch && !categoryFilter && activeFilter === 'all'
            ? 'No knowledge base entries yet'
            : 'No entries match your filters'}
          description={
            total === 0 && !debouncedSearch && !categoryFilter && activeFilter === 'all'
              ? 'Add FAQ and training content so the agent can answer tenant-specific questions.'
              : 'Try adjusting search, category, or status filters.'
          }
          action={
            total === 0 && !debouncedSearch && !categoryFilter && activeFilter === 'all' ? (
              <Button type="button" onClick={openCreate}>
                Add first entry
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-default">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">Content</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Updated</TableHead>
                <TableHead className="w-[7rem] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((entry) => (
                <TableRow key={entry.id} className={entry.isActive ? undefined : 'opacity-70'}>
                  <TableCell className="font-medium text-text-primary">{entry.title}</TableCell>
                  <TableCell className="hidden text-text-secondary md:table-cell">
                    {entry.category ?? '—'}
                  </TableCell>
                  <TableCell className="hidden max-w-xs text-text-secondary lg:table-cell">
                    <span className="line-clamp-2">{truncateText(entry.content, 120)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={entry.isActive}
                        disabled={togglingEntryId === entry.id}
                        onCheckedChange={(checked) => void handleToggleActive(entry, checked)}
                        aria-label={`${entry.isActive ? 'Deactivate' : 'Activate'} ${entry.title}`}
                      />
                      <Badge variant={entry.isActive ? 'success' : 'neutral'}>
                        {entry.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-text-secondary sm:table-cell">
                    {new Date(entry.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(entry)}
                      aria-label={`Edit ${entry.title}`}
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {total > KB_PAGE_SIZE ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-text-secondary">
          <p>
            Showing {(page - 1) * KB_PAGE_SIZE + 1}–{Math.min(page * KB_PAGE_SIZE, total)} of{' '}
            {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      ) : null}

      <KbEntryModal
        companyId={companyId}
        open={modalOpen}
        onClose={closeModal}
        entry={editingEntry}
      />
    </div>
  );
}
