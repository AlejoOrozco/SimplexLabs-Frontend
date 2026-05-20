'use client';

const ITEMS: Array<{
  label: string;
  className?: string;
  description?: string;
}> = [
  { label: 'SimplexLabs meeting', className: 'event-brand' },
  { label: 'Customer appointment', className: 'event-info' },
  { label: 'External', className: 'event-neutral' },
  { label: 'Pending confirmation', description: 'dashed border' },
  { label: 'Callback requested', description: 'amber pulse' },
];

export function CalendarLegend(): JSX.Element {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-4">
      {ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div
            className={`calendar-event h-3 w-3 rounded-sm ${item.className ?? 'border border-border-default bg-surface-overlay'}`}
            title={item.description}
          />
          <span className="text-xs text-text-secondary">
            {item.label}
            {item.description ? ` (${item.description})` : ''}
          </span>
        </div>
      ))}
    </div>
  );
}
