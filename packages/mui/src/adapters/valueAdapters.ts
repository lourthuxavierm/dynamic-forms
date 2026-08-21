export type TemporalInputType = 'date' | 'time' | 'datetime-local' | 'month';

/** Empty native inputs map to undefined; non-empty values remain canonical ISO-compatible strings. */
export function parseTemporalInput(value: string): string | undefined {
  return value === '' ? undefined : value;
}

export function formatTemporalInput(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function parseLocaleNumber(input: string, locale: string): number | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;

  const parts = new Intl.NumberFormat(locale).formatToParts(-12345.6);
  const group = parts.find((part) => part.type === 'group')?.value;
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
  const minus = parts.find((part) => part.type === 'minusSign')?.value ?? '-';
  const negativeByParentheses = /^\s*\(.*\)\s*$/.test(trimmed);

  let normalized = trimmed;
  if (group) normalized = normalized.split(group).join('');
  normalized = normalized.split(decimal).join('.').split(minus).join('-');
  normalized = normalized.replace(/[^0-9.+-]/g, '');
  if (negativeByParentheses && !normalized.startsWith('-')) normalized = `-${normalized}`;
  if (!/^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return undefined;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function formatCurrencyValue(value: number, locale: string, currency: string, maximumFractionDigits?: number): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...(maximumFractionDigits === undefined ? {} : { minimumFractionDigits: maximumFractionDigits, maximumFractionDigits }),
  }).format(value);
}

export function clampNumber(value: number, min?: number, max?: number): number {
  return Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, value));
}
