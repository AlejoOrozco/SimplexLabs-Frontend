'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormError } from '@/components/shared/FormError';
import { ApiClientError } from '@/lib/api/client';
import { ORDER_STATUS_TRANSITIONS, type OrderStatus } from '@/lib/types';
import { orderStatusLabel } from '@/lib/utils/format';

interface OrderStatusSelectProps {
  current: OrderStatus;
  onUpdate: (next: OrderStatus) => Promise<void>;
}

export function OrderStatusSelect({
  current,
  onUpdate,
}: OrderStatusSelectProps): JSX.Element {
  const allowed = ORDER_STATUS_TRANSITIONS[current];
  const [next, setNext] = useState<OrderStatus | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (allowed.length === 0) {
    return <p className="text-sm text-gray-600">No further transitions allowed.</p>;
  }

  const handleApply = async (): Promise<void> => {
    if (!next) return;
    setError(null);
    setIsSaving(true);
    try {
      await onUpdate(next);
      setNext('');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not update status');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={next} onValueChange={(v) => setNext(v as OrderStatus)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Move to…" />
        </SelectTrigger>
        <SelectContent>
          {allowed.map((s) => (
            <SelectItem key={s} value={s}>
              {orderStatusLabel(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="button" size="sm" disabled={!next || isSaving} onClick={handleApply}>
        {isSaving ? 'Saving…' : 'Apply'}
      </Button>
      <FormError message={error} />
    </div>
  );
}
