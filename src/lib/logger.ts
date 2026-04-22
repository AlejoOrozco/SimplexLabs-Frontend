type LogLevel = 'error' | 'warn' | 'info';

const SCRUB_PATTERN = /token|authorization|cookie|secret|password|apiKey/i;

function scrubObject(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(scrubObject);
  const result: Record<string, unknown> = {};
  for (const [key, innerValue] of Object.entries(value as Record<string, unknown>)) {
    if (SCRUB_PATTERN.test(key)) {
      result[key] = '[REDACTED]';
      continue;
    }
    result[key] = scrubObject(innerValue);
  }
  return result;
}

function shouldLog(level: LogLevel): boolean {
  if (level === 'error') return true;
  return process.env.NODE_ENV !== 'production';
}

export const logger = {
  error(message: string, context?: unknown) {
    if (!shouldLog('error')) return;
    console.error(message, scrubObject(context));
  },
  warn(message: string, context?: unknown) {
    if (!shouldLog('warn')) return;
    console.warn(message, scrubObject(context));
  },
  info(message: string, context?: unknown) {
    if (!shouldLog('info')) return;
    console.info(message, scrubObject(context));
  },
};
