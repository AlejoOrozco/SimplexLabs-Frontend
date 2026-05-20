/** Default when the profile has no timezone (Colombian clients). */
export const DEFAULT_USER_TIMEZONE = 'America/Bogota';

const LOCAL_DATETIME_RE = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/;

/**
 * Format a UTC instant for display in a timezone.
 */
export function formatInTimezone(
  utcDate: Date | string,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    ...options,
  }).format(date);
}

/**
 * Build `datetime-local` value (YYYY-MM-DDTHH:mm) for a UTC instant in a timezone.
 */
export function utcToDatetimeLocalInput(utcIso: string, timeZone: string): string {
  const date = new Date(utcIso);
  if (Number.isNaN(date.getTime())) return '';
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? '';
  const y = get('year');
  const m = get('month');
  const d = get('day');
  let h = get('hour');
  const min = get('minute');
  if (h.length === 1) h = `0${h}`;
  return `${y}-${m}-${d}T${h}:${min}`;
}

/**
 * Interpret a `datetime-local` wall time as being in `timeZone`, return UTC ISO string.
 */
export function localDatetimeInTimezoneToUtc(localDatetime: string, timeZone: string): string {
  const m = localDatetime.trim().match(LOCAL_DATETIME_RE);
  if (!m) {
    throw new Error('Invalid local datetime; expected YYYY-MM-DDTHH:mm');
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const h = Number(m[4]);
  const mi = Number(m[5]);
  const s = Number(m[6] ?? '0');

  let ms = Date.UTC(y, mo - 1, d, h, mi, s);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  for (let i = 0; i < 24; i += 1) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(ms)).map((p) => [p.type, p.value]),
    ) as Record<string, string>;
    const py = Number(parts.year);
    const pm = Number(parts.month);
    const pd = Number(parts.day);
    const ph = Number(parts.hour);
    const pmi = Number(parts.minute);
    const ps = Number(parts.second);
    if (py === y && pm === mo && pd === d && ph === h && pmi === mi && ps === s) {
      return new Date(ms).toISOString();
    }
    const desired = Date.UTC(y, mo - 1, d, h, mi, s);
    const actual = Date.UTC(py, pm - 1, pd, ph, pmi, ps);
    ms += desired - actual;
  }

  return new Date(ms).toISOString();
}

/**
 * Profile timezone, else browser, else default (America/Bogota).
 */
export function getUserTimezone(profileTimezone?: string | null): string {
  if (profileTimezone && profileTimezone.trim().length > 0) {
    return profileTimezone;
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) return tz;
  } catch {
    // ignore
  }
  return DEFAULT_USER_TIMEZONE;
}
