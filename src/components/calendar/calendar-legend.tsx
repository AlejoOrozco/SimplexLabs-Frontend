'use client';

const LEGEND_ITEMS = [
  {
    label: 'SimplexLabs meeting',
    swatchClassName: 'calendar-legend-swatch calendar-legend-swatch-agents',
  },
  {
    label: 'Customer appointment',
    swatchClassName: 'calendar-legend-swatch calendar-legend-swatch-website',
  },
  {
    label: 'External',
    swatchClassName: 'calendar-legend-swatch calendar-legend-swatch-neutral',
  },
  {
    label: 'Pending confirmation',
    swatchClassName: 'calendar-legend-swatch calendar-legend-swatch-pending',
  },
  {
    label: 'Callback requested',
    swatchClassName: 'calendar-legend-swatch calendar-legend-swatch-callback',
  },
] as const;

export function CalendarLegend(): JSX.Element {
  return (
    <div className="calendar-legend">
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="calendar-legend-item">
          <span className={item.swatchClassName} aria-hidden />
          <span className="calendar-legend-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
