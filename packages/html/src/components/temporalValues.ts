export type TemporalKind = 'date' | 'time' | 'datetime-local';

function pad(value: number): string { return String(value).padStart(2, '0'); }

export function normalizeDateOnly(value: string | Date | undefined | null): string | undefined {
  if (value == null || value === '') return undefined;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return undefined;
    return String(value.getFullYear()).padStart(4, '0') + '-' + pad(value.getMonth() + 1) + '-' + pad(value.getDate());
  }
  const candidate = value.slice(0, 10);
  const parts = candidate.split('-').map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) return undefined;
  const [year, month, day] = parts;
  if (year < 100 || month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? candidate : undefined;
}

export function normalizeTimeOnly(value: string | undefined | null): string | undefined {
  if (value == null || value === '') return undefined;
  const candidate = value.trim();
  const parts = candidate.split(':');
  if (parts.length < 2 || parts.length > 3) return undefined;
  const [hour, minute, second] = parts.map(Number);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) return undefined;
  if (parts.length === 3 && (!Number.isInteger(second) || second < 0 || second > 59)) return undefined;
  return pad(hour) + ':' + pad(minute) + (parts.length === 3 ? ':' + pad(second) : '');
}

export function normalizeLocalDateTime(value: string | Date | undefined | null): string | undefined {
  if (value == null || value === '') return undefined;
  if (value instanceof Date) {
    const date = normalizeDateOnly(value);
    if (!date) return undefined;
    return date + 'T' + pad(value.getHours()) + ':' + pad(value.getMinutes()) + ':' + pad(value.getSeconds());
  }
  if (value.endsWith('Z') || value.slice(10).includes('+')) return undefined;
  const separator = value.includes('T') ? 'T' : ' ';
  const [datePart, timePart] = value.split(separator);
  const date = normalizeDateOnly(datePart);
  const time = normalizeTimeOnly(timePart);
  return date && time ? date + 'T' + time : undefined;
}

export function normalizeTemporalValue(kind: TemporalKind, value: string | Date | undefined | null): string | undefined {
  if (kind === 'date') return normalizeDateOnly(value);
  if (kind === 'time') return typeof value === 'string' ? normalizeTimeOnly(value) : undefined;
  return normalizeLocalDateTime(value);
}

export function parseLocalDateTime(value: string): Date | undefined {
  const normalized = normalizeLocalDateTime(value);
  if (!normalized) return undefined;
  const [date, time] = normalized.split('T');
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute, second = 0] = time.split(':').map(Number);
  const result = new Date(year, month - 1, day, hour, minute, second);
  return Number.isNaN(result.getTime()) ? undefined : result;
}
