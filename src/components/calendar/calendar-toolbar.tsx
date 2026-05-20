'use client';

import { useEffect, useState, type RefObject } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type FullCalendar from '@fullcalendar/react';
import type { CalendarScope, CalendarStaffMember } from '@/lib/types/calendar';

type CalendarViewId = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

const VIEW_OPTIONS: ReadonlyArray<{ id: CalendarViewId; label: string }> = [
  { id: 'dayGridMonth', label: 'Month' },
  { id: 'timeGridWeek', label: 'Week' },
  { id: 'timeGridDay', label: 'Day' },
  { id: 'listWeek', label: 'List' },
];

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
  const [periodTitle, setPeriodTitle] = useState('');
  const [activeView, setActiveView] = useState<CalendarViewId>('dayGridMonth');

  const api = (): ReturnType<NonNullable<typeof calendarRef.current>['getApi']> | null =>
    calendarRef.current?.getApi() ?? null;

  useEffect(() => {
    let disposed = false;
    let detach: (() => void) | undefined;

    const attach = (): void => {
      if (disposed) return;
      const calendarApi = calendarRef.current?.getApi();
      if (!calendarApi) {
        requestAnimationFrame(attach);
        return;
      }

      const sync = (): void => {
        setPeriodTitle(calendarApi.view.title);
        const viewType = calendarApi.view.type;
        if (VIEW_OPTIONS.some((option) => option.id === viewType)) {
          setActiveView(viewType as CalendarViewId);
        }
      };

      sync();
      calendarApi.on('datesSet', sync);
      detach = () => {
        calendarApi.off('datesSet', sync);
      };
    };

    attach();

    return () => {
      disposed = true;
      detach?.();
    };
  }, [calendarRef]);

  return (
    <div className="calendar-toolbar">
      <div className="calendar-toolbar-nav">
        <button
          type="button"
          className="calendar-toolbar-icon-btn"
          aria-label="Previous period"
          onClick={() => api()?.prev()}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          className="calendar-toolbar-icon-btn"
          aria-label="Next period"
          onClick={() => api()?.next()}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
        <button type="button" className="calendar-toolbar-today-btn" onClick={() => api()?.today()}>
          Today
        </button>
      </div>

      <h2 className="calendar-toolbar-title">{periodTitle}</h2>

      <div className="calendar-toolbar-actions">
        <div className="calendar-view-selector" role="group" aria-label="Calendar view">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={activeView === option.id ? 'active' : undefined}
              aria-pressed={activeView === option.id}
              onClick={() => api()?.changeView(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {isAdmin ? (
          <div className="calendar-view-selector" role="group" aria-label="Appointment scope">
            <button
              type="button"
              className={scope === 'mine' ? 'active' : undefined}
              aria-pressed={scope === 'mine'}
              onClick={() => onScopeChange('mine')}
            >
              Mine
            </button>
            <button
              type="button"
              className={scope === 'all' ? 'active' : undefined}
              aria-pressed={scope === 'all'}
              onClick={() => onScopeChange('all')}
            >
              All
            </button>
          </div>
        ) : null}

        {showStaffFilter && staff.length > 0 ? (
          <select
            className="calendar-staff-select"
            aria-label="Filter by staff member"
            value={selectedStaffId ?? 'all'}
            onChange={(event) =>
              onStaffChange(event.target.value === 'all' ? undefined : event.target.value)
            }
          >
            <option value="all">All staff</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.role})
              </option>
            ))}
          </select>
        ) : null}
      </div>
    </div>
  );
}
