export interface LocaleNumberOptions {
  locale?: string;
  minimum?: number;
  maximum?: number;
  step?: number;
  precision?: number;
}

export function parseLocaleNumber(input: string, locale = 'en-US'): number | undefined {
  const trimmed = input.trim();
  if (!trimmed || /^[-+]?([.,])?$/.test(trimmed)) return undefined;
  const parts = new Intl.NumberFormat(locale).formatToParts(-12345.6);
  const group = parts.find((part) => part.type === 'group')?.value ?? ',';
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
  const minus = parts.find((part) => part.type === 'minusSign')?.value ?? '-';
  const negative = trimmed.startsWith('(') && trimmed.endsWith(')');
  let normalized = trimmed
    .replaceAll(group, '')
    .replaceAll('Â ', '')
    .replaceAll('\u202f', '')
    .replaceAll(' ', '')
    .replaceAll(minus, '-')
    .replace(decimal, '.')
    .split('').filter((character) => '0123456789+-.'.includes(character)).join('');
  if (negative && !normalized.startsWith('-')) normalized = '-' + normalized;
  const unsigned = normalized.startsWith('-') || normalized.startsWith('+') ? normalized.slice(1) : normalized;
  if (!unsigned || unsigned === '.' || unsigned.split('.').length > 2 || ![...unsigned].every((character) => character === '.' || (character >= '0' && character <= '9'))) return undefined;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

export function normalizeNumericValue(value: number, options: LocaleNumberOptions = {}): number {
  let result = Math.min(options.maximum ?? Infinity, Math.max(options.minimum ?? -Infinity, value));
  if (options.step && options.step > 0) {
    const base = Number.isFinite(options.minimum) ? options.minimum! : 0;
    result = base + Math.round((result - base) / options.step) * options.step;
  }
  if (options.precision !== undefined) result = Number(result.toFixed(options.precision));
  return result;
}

export function formatCurrency(value: number, locale: string, currency: string, precision?: number): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
}

export function formatPercentage(value: number, locale: string, precision?: number): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value) + '%';
}
