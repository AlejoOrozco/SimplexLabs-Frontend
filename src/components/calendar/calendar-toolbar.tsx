'use client';

import type { RefObject } from 'react';
import type FullCalendar from '@fullcalendar/react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CalendarScope, CalendarStaffMember } from '@/lib/types/calendar';

interface CalendarToolbarProps {
  calendarRef: RefObject<FullCalendar | null>;
  isAdmin: boolean;
  scope: CalendarScope;
  onScopeChange: (scope: CalendarScope) => void;
  staff: CalendarStaffMember[];
  selectedStaffId: string | undefined;
  onStaffChange: (staffMemberId: string | undefined) => void;
  showStaffFilter: boolean;
}

export function CalendarToolbar({
  calendarRef,
  isAdmin,
  scope,
  onScopeChange,
  staff,
  selectedStaffId,
  onStaffChange,
  showStaffFilter,
}: CalendarToolbarProps): JSX.Element {
  const api = (): ReturnType<NonNullable<typeof calendarRef.current>['getApi']> | null =>
    calendarRef.current?.getApi() ?? null;

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          <Button type="button" variant="outline" size="sm" onClick={() => api()?.prev()}>
            Prev
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => api()?.today()}>
            Today
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => api()?.next()}>
            Next
          </Button>
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => api()?.changeView('dayGridMonth')}
          >
            Month
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => api()?.changeView('timeGridWeek')}
          >
            Week
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => api()?.changeView('timeGridDay')}
          >
            Day
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => api()?.changeView('listWeek')}
          >
            List
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {isAdmin ? (
          <div className="flex items-center gap-2 rounded-md border border-border-default p-1">
            <Button
              type="button"
              size="sm"
              variant={scope === 'mine' ? 'default' : 'ghost'}
              className={scope === 'mine' ? '' : 'bg-transparent'}
              onClick={() => onScopeChange('mine')}
            >
              Mine
            </Button>
            <Button
              type="button"
              size="sm"
              variant={scope === 'all' ? 'default' : 'ghost'}
              className={scope === 'all' ? '' : 'bg-transparent'}
              onClick={() => onScopeChange('all')}
            >
              All
            </Button>
          </div>
        ) : null}

        {showStaffFilter && staff.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">Staff</span>
            <Select
              value={selectedStaffId ?? 'all'}
              onValueChange={(v) => onStaffChange(v === 'all' ? undefined : v)}
            >
              <SelectTrigger className="h-8 w-[200px] border-border-default text-xs">
                <SelectValue placeholder="All staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All staff</SelectItem>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
    </div>
  );
}
