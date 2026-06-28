'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PlanFormModal } from '@/components/admin/manage/platform/plan-form-modal';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/Skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { adminPlanCategoryLabel, adminPlanTierLabel } from '@/lib/admin/admin-hub-utils';
import { getApiErrorMessage } from '@/lib/api/get-api-error-message';
import { useAdminPlans, useAdminUpdatePlanStatus } from '@/lib/hooks/use-admin-plans';
import type { AdminPlan, AdminPlanListFilters } from '@/lib/types/admin-hub';
import { AdminPlanCategory, AdminPlanTier } from '@/lib/types/admin-hub';
import { Niche } from '@/lib/types';
import { formatCurrency, nicheLabel } from '@/lib/utils/format';
import { notify } from '@/lib/toast';

type StatusFilter = 'all' | 'active' | 'inactive';

const NICHES: readonly Niche[] = [Niche.GYM, Niche.MEDICAL, Niche.ENTREPRENEUR];
const CATEGORIES: readonly AdminPlanCategory[] = [
  AdminPlanCategory.WEBSITE,
  AdminPlanCategory.MARKETING,
  AdminPlanCategory.AI_AGENTS,
];
const TIERS: readonly AdminPlanTier[] = [
  AdminPlanTier.BASIC,
  AdminPlanTier.PROFESSIONAL,
  AdminPlanTier.ENTERPRISE,
];

function sortPlans(rows: readonly AdminPlan[]): AdminPlan[] {
  return [...rows].sort((a, b) => {
    const nicheCompare = a.niche.localeCompare(b.niche);
    if (nicheCompare !== 0) return nicheCompare;
    const categoryCompare = (a.category ?? '').localeCompare(b.category ?? '');
    if (categoryCompare !== 0) return categoryCompare;
    return a.name.localeCompare(b.name);
  });
}

export function PlanCatalogSection(): JSX.Element {
  const updatePlanStatus = useAdminUpdatePlanStatus();

  const [nicheFilter, setNicheFilter] = useState<'all' | Niche>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | AdminPlanCategory>('all');
  const [tierFilter, setTierFilter] = useState<'all' | AdminPlanTier>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);
  const [togglingPlanId, setTogglingPlanId] = useState<string | null>(null);

  const apiFilters = useMemo((): AdminPlanListFilters => {
    const filters: AdminPlanListFilters = {};
    if (nicheFilter !== 'all') filters.niche = nicheFilter;
    if (categoryFilter !== 'all') filters.category = categoryFilter;
    if (tierFilter !== 'all') filters.tier = tierFilter;
    if (statusFilter === 'active') filters.activeOnly = true;
    return filters;
  }, [nicheFilter, categoryFilter, tierFilter, statusFilter]);

  const plansQuery = useAdminPlans(apiFilters);
  const plans = useMemo(() => {
    const rows = plansQuery.data ?? [];
    if (statusFilter === 'inactive') return sortPlans(rows.filter((plan) => !plan.isActive));
    return sortPlans(rows);
  }, [plansQuery.data, statusFilter]);

  const openCreate = (): void => {
    setEditingPlan(null);
    setModalOpen(true);
  };

  const openEdit = (plan: AdminPlan): void => {
    setEditingPlan(plan);
    setModalOpen(true);
  };

  const closeModal = (): void => {
    setModalOpen(false);
    setEditingPlan(null);
  };

  const handleToggleActive = async (plan: AdminPlan, nextActive: boolean): Promise<void> => {
    setTogglingPlanId(plan.id);
    try {
      await updatePlanStatus.mutateAsync({ planId: plan.id, dto: { isActive: nextActive } });
      notify.success(nextActive ? 'Plan activated' : 'Plan deactivated');
    } catch (error) {
      notify.error(getApiErrorMessage(error, 'Could not update plan status'));
    } finally {
      setTogglingPlanId(null);
    }
  };

  if (plansQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-3xl" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (plansQuery.isError) {
    return (
      <div className="rounded-lg border border-error bg-error-surface p-4 text-sm text-error-dark">
        Could not load plan catalog.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Plan catalog</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Create and maintain sellable plans by niche and product line. Deactivated plans stay in
            the catalog but cannot be assigned to new subscriptions.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          Create plan
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border-default bg-surface-base p-4">
        <FilterSelect
          label="Niche"
          value={nicheFilter}
          onChange={(value) => setNicheFilter(value as 'all' | Niche)}
          options={[
            { value: 'all', label: 'All niches' },
            ...NICHES.map((niche) => ({ value: niche, label: nicheLabel(niche) })),
          ]}
        />
        <FilterSelect
          label="Category"
          value={categoryFilter}
          onChange={(value) => setCategoryFilter(value as 'all' | AdminPlanCategory)}
          options={[
            { value: 'all', label: 'All categories' },
            ...CATEGORIES.map((category) => ({
              value: category,
              label: adminPlanCategoryLabel(category),
            })),
          ]}
        />
        <FilterSelect
          label="Tier"
          value={tierFilter}
          onChange={(value) => setTierFilter(value as 'all' | AdminPlanTier)}
          options={[
            { value: 'all', label: 'All tiers' },
            ...TIERS.map((tier) => ({ value: tier, label: adminPlanTierLabel(tier) })),
          ]}
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as StatusFilter)}
          options={[
            { value: 'all', label: 'All plans' },
            { value: 'active', label: 'Active only' },
            { value: 'inactive', label: 'Inactive only' },
          ]}
        />
      </div>

      {plans.length === 0 ? (
        <EmptyState
          title="No plans match your filters"
          description="Adjust filters or create a new catalog plan."
          action={
            <Button type="button" onClick={openCreate}>
              Create plan
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-default">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead className="hidden md:table-cell">Niche</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden lg:table-cell">Tier</TableHead>
                <TableHead className="hidden sm:table-cell">Pricing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[5rem] text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id} className={plan.isActive ? undefined : 'opacity-70'}>
                  <TableCell>
                    <p className="font-medium text-text-primary">{plan.name}</p>
                    {plan.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{plan.description}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{nicheLabel(plan.niche)}</TableCell>
                  <TableCell>
                    {plan.category ? adminPlanCategoryLabel(plan.category) : '—'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {plan.tier ? adminPlanTierLabel(plan.tier) : '—'}
                  </TableCell>
                  <TableCell className="hidden text-sm text-text-secondary sm:table-cell">
                    <p>{formatCurrency(plan.priceMonthly)}/mo</p>
                    <p className="text-xs">Setup {formatCurrency(plan.setupFee)}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={plan.isActive}
                        disabled={togglingPlanId === plan.id}
                        onCheckedChange={(checked) => void handleToggleActive(plan, checked)}
                        aria-label={`${plan.isActive ? 'Deactivate' : 'Activate'} ${plan.name}`}
                      />
                      <Badge variant={plan.isActive ? 'success' : 'neutral'}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(plan)}
                      aria-label={`Edit ${plan.name}`}
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

      <PlanFormModal open={modalOpen} onClose={closeModal} plan={editingPlan} />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}): JSX.Element {
  return (
    <div className="min-w-[9rem]">
      <Label className="mb-1.5 block text-xs text-text-secondary">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
